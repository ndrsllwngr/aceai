/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import * as posenet from '@tensorflow-models/posenet';
import { Tag, Portal } from '@blueprintjs/core';
import { Subject } from 'rxjs';
// COMPONENTS
import { Graph } from '../graph';
import { VideoCanvas } from '../VideoCanvas';
import TickObject, {
  extractPointObj,
  calcMeanForTimeWindow,
  calcMedianForTimeWindow,
} from '../TickObject';
import { useApp } from '../context-app';
import {
  timerSitting,
  timerGoodPosture,
  timerBadPosture,
  timerShoulderMeanBadPosture,
  timerEyeMeanBadPosture,
} from './utilsTimer';
import { TimerComponent } from '../timer';
import { Widget } from '../widget';
// PoseNet
import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
  poseNetState,
  videoWidth,
  videoHeight,
} from './utils';
// CSS
import '../../../node_modules/react-vis/dist/style.css';
import { Calibration } from './calibration';

// gets updated every second
export const history = [];
const subject = new Subject();
export const historyShoulder = [];
const subjectShoulder = new Subject();
export const historyEye = [];
const subjectEye = new Subject();

const emptyState = { msg: 'Loading...', value: 0.0, status: 'default' };
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const PoseNetCamera = () => {
  // const classes = useStyles();

  const [appContext, setAppContext] = useApp();
  const [loading, setLoading] = useState(false);
  const [headPostureOverTimeIsBad, setHeadPostureOverTimeIsBad] = useState(
    false,
  );
  const [bodyPostureOverTimeIsBad, setBodyPostureOverTimeIsBad] = useState(
    false,
  );

  const [statusShoulder, setStatusShoulder] = useState(emptyState);
  // const [thresholdShoulder, setThresholdShoulder] = useState(15);
  const [chartDataShoulder, setChartDataShoulder] = useState([]);

  const [statusEye, setStatusEye] = useState(emptyState);

  // const [thresholdEye, setThresholdEye] = useState(7);
  const [chartDataEye, setChartDataEye] = useState([]);

  const [calibrationDataRaw, setCalibrationDataRaw] = useState(undefined);
  const [calibrationData, setCalibrationData] = useState(undefined);

  // POWER POSENET
  useEffect(() => {
    if (appContext.webCam) {
      // eslint-disable-next-line no-inner-declarations
      async function running() {
        if (appContext.webCam === false) {
          return;
        }
        console.log('async function running()');
        setLoading(true);
        const net = await posenet.load({
          architecture: poseNetState.input.architecture,
          outputStride: poseNetState.input.outputStride,
          inputResolution: poseNetState.input.inputResolution,
          multiplier: poseNetState.input.multiplier,
          quantBytes: poseNetState.input.quantBytes,
        });
        let video;
        try {
          video = await loadVideo();
        } catch (e) {
          const info = document.getElementById('info');
          info.textContent =
            'this browser does not support video capture,' +
            'or this device does not have a camera';
          info.style.display = 'block';
          throw e;
        }
        setLoading(false);
        poseNetState.net = net;
        // setupFPS();
        detectPoseInRealTime(video, net);
        timerSitting.start({ precision: 'secondTenths' });
      }
      running();
    } else {
      // eslint-disable-next-line no-inner-declarations
      async function shuttingDown() {
        console.log('async function shuttingDown()');
        // timerSitting.pause();
        setLoading(false);
        setStatusShoulder(emptyState);
        setStatusEye(emptyState);
        // setChartDataShoulder([]);
        // setChartDataEye([]);
        stopStreamedVideo();
        clearCanvas();
      }
      shuttingDown();
    }
  }, [
    appContext,
    appContext.webCam,
    setLoading,
    setStatusEye,
    setStatusShoulder,
  ]);

  // CALCULATIONS, TIMERS
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        try {
          // CALCULATE POSTURE IF GOOD OR BAD VIA MEAN AND TIME
          const cloneHistoryShoulder = [...historyShoulder];
          const cloneHistoryEye = [...historyEye];
          let meanOrMedianShoulder;
          let meanOrMedianEye;

          if (appContext.measure === 'median') {
            meanOrMedianShoulder = calcMedianForTimeWindow(
              cloneHistoryShoulder,
              3000,
              nextObj.createdAt,
            );
            meanOrMedianEye = calcMedianForTimeWindow(
              cloneHistoryEye,
              3000,
              nextObj.createdAt,
            );
          } else {
            meanOrMedianShoulder = calcMeanForTimeWindow(
              cloneHistoryShoulder,
              3000,
              nextObj.createdAt,
            );
            meanOrMedianEye = calcMeanForTimeWindow(
              cloneHistoryEye,
              3000,
              nextObj.createdAt,
            );
          }

          // TIMER
          if (timerShoulderMeanBadPosture.getTotalTimeValues().seconds > 5) {
            // GENERAL
            timerBadPosture.start({ precision: 'secondTenths' });
            if (timerGoodPosture.isRunning()) {
              timerGoodPosture.pause();
            }
            setBodyPostureOverTimeIsBad(true);
            // console.log('bad posture shoulder (> 5 seconds)');
          } else {
            setBodyPostureOverTimeIsBad(false);
          }

          if (timerEyeMeanBadPosture.getTotalTimeValues().seconds > 5) {
            // GENERAL
            timerBadPosture.start({ precision: 'secondTenths' });
            if (timerGoodPosture.isRunning()) {
              timerGoodPosture.pause();
            }
            // console.log('bad posture eye (> 5 seconds)');
            setHeadPostureOverTimeIsBad(true);
          } else {
            setHeadPostureOverTimeIsBad(false);
          }

          if (
            !(timerShoulderMeanBadPosture.getTotalTimeValues().seconds > 5) &&
            !(timerEyeMeanBadPosture.getTotalTimeValues().seconds > 5)
          ) {
            if (timerBadPosture.isRunning()) {
              timerBadPosture.pause();
            }
            timerGoodPosture.start({ precision: 'secondTenths' });
          }

          if (meanOrMedianShoulder > appContext.thresholdFrontViewBody) {
            timerShoulderMeanBadPosture.start({ precision: 'secondTenths' });
          } else {
            timerShoulderMeanBadPosture.reset();
          }

          if (meanOrMedianEye > appContext.thresholdFrontViewHead) {
            timerEyeMeanBadPosture.start({ precision: 'secondTenths' });
          } else {
            timerEyeMeanBadPosture.reset();
          }
          // TODO reset timers on unmount
          // }
          // }
        } catch (e) {
          console.log(e);
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    appContext.consoleLog,
    appContext.measure,
    appContext.thresholdFrontViewBody,
    appContext.thresholdFrontViewHead,
    calibrationData,
  ]);

  // TODO: Change STATUS output to angle, switch threshold to angle?
  // TODO: Add calibration functionality (button, calc D_c to mean of Y_(L-r))
  // TODO: Over time? Time counter!
  // TODO: Revamp UI

  // CALIBRATION
  // useEffect(() => {
  //   if (calibrationDataRaw) {
  //     const { time, tick } = calibrationDataRaw;
  //     const tickObjectShoulder = new TickObject(
  //       'shoulder',
  //       time,
  //       tick,
  //       extractPointObj('leftShoulder', calibrationDataRaw),
  //       extractPointObj('rightShoulder', calibrationDataRaw),
  //     );
  //     const tickObjectEye = new TickObject(
  //       'eye',
  //       time,
  //       tick,
  //       extractPointObj('leftEye', calibrationDataRaw),
  //       extractPointObj('rightEye', calibrationDataRaw),
  //     );
  //     setCalibrationData({ eye: tickObjectEye, shoulder: tickObjectShoulder });
  //     tickObjectShoulder.logData();
  //     tickObjectEye.logData();
  //   }
  // }, [calibrationDataRaw]);

  // LOG POSENET DATA
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        if (appContext.consoleLog) {
          console.log(nextObj);
          if (nextObj.tick > 0) {
            historyEye[historyEye.length - 1].logData();
            historyShoulder[historyShoulder.length - 1].logData();
          }
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appContext.consoleLog]);

  // UPDATE STATUS, CHART of shoulder
  useEffect(() => {
    const subscription = subjectShoulder.subscribe({
      next: nextObj => {
        if (
          Math.abs(nextObj.angleOfVector) > appContext.thresholdFrontViewBody
        ) {
          setStatusShoulder({
            msg: `Bad (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'bad',
          });
        } else {
          setStatusShoulder({
            msg: `Good (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'good',
          });
        }
        // PRINT data
        if (appContext.charts) {
          const copyArr = [...chartDataShoulder];
          // Chart window
          // eslint-disable-next-line no-console
          if (copyArr.length >= 50) {
            copyArr.shift();
          }
          copyArr.push({
            x: nextObj.createdAt,
            y: nextObj.angleOfVector,
          });
          setChartDataShoulder(copyArr);
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    appContext.charts,
    appContext.thresholdFrontViewBody,
    chartDataShoulder,
    setStatusShoulder,
  ]);

  // UPDATE STATUS, CHART of eye
  useEffect(() => {
    const subscription = subjectEye.subscribe({
      next: nextObj => {
        if (
          Math.abs(nextObj.angleOfVector) > appContext.thresholdFrontViewHead
        ) {
          setStatusEye({
            msg: `Bad (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'bad',
          });
        } else {
          setStatusEye({
            msg: `Good (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'good',
          });
        }
        // PRINT data
        if (appContext.charts) {
          const copyArr = [...chartDataEye];
          // Chart window
          // eslint-disable-next-line no-console
          if (copyArr.length >= 50) {
            copyArr.shift();
          }
          copyArr.push({
            x: nextObj.createdAt,
            y: nextObj.angleOfVector,
          });
          setChartDataEye(copyArr);
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    appContext.charts,
    appContext.thresholdFrontViewHead,
    chartDataEye,
    setStatusEye,
  ]);

  return (
    <>
      <Portal>
        <VideoCanvas
          videoHeight={videoHeight}
          videoWidth={videoWidth}
          loading={loading}
        />
      </Portal>
      <div className="container mx-auto">
        <div className="flex flex-row flex-wrap sm:flex-wrap mx-1 sm:mx-0">
          <div className="w-full sm:w-full md:w-1/2 my-1 pr-0 md:pr-1">
            <Widget
              title="Distance to screen and sitting height"
              caption="based on calibration data"
              tags={
                <>
                  <Tag intent="none" style={{ marginRight: '0.5rem' }}>
                    DISTANCE
                  </Tag>
                  <Tag intent="none">HEIGHT</Tag>
                </>
              }
            >
              <div className="p-4 h-48">
                <svg
                  width="724"
                  height="724"
                  viewBox="0 0 724 724"
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M241.346 330.942H178.337C111.984 330.942 58 387.048 58 456.011V702.772C58 714.497 67.1437 724 78.4253 724H341.26C352.542 724 361.685 714.497 361.685 702.772V456.011C361.685 387.048 307.701 330.942 241.346 330.942ZM320.835 681.544H98.8506V456.011C98.8506 410.458 134.509 373.398 178.337 373.398H241.346C285.177 373.398 320.833 410.458 320.833 456.011V681.544H320.835Z"
                    fill="#c4c4c4"
                  />
                  <path
                    d="M209.844 316.985C277.22 316.985 332.034 260.016 332.034 189.994C332.034 119.972 277.218 63 209.844 63C142.47 63 87.6528 119.969 87.6528 189.992C87.6528 260.014 142.467 316.985 209.844 316.985ZM209.844 105.456C254.695 105.456 291.184 143.379 291.184 189.992C291.184 236.604 254.695 274.527 209.844 274.527C164.992 274.527 128.503 236.606 128.503 189.992C128.503 143.377 164.992 105.456 209.844 105.456Z"
                    fill="#c4c4c4"
                  />
                  <path
                    d="M609.923 308.592L609.922 724H578.171V542.775L511 542.782V149H574.506V199.904C585.715 202.652 594.045 212.751 594.045 224.823V308.592H609.923Z"
                    fill="#c4c4c4"
                  />
                </svg>
              </div>
            </Widget>
          </div>
          <div className="w-full sm:w-full md:w-1/2 my-1 pl-0 md:pl-1">
            <Widget
              title="Tilt angle of head and shoulders"
              tags={
                <>
                  {bodyPostureOverTimeIsBad ? (
                    <Tag intent="danger" style={{ marginRight: '0.5rem' }}>
                      BODY
                    </Tag>
                  ) : (
                    <Tag intent="success" style={{ marginRight: '0.5rem' }}>
                      BODY
                    </Tag>
                  )}
                  {headPostureOverTimeIsBad ? (
                    <Tag intent="danger">HEAD</Tag>
                  ) : (
                    <Tag intent="success">HEAD</Tag>
                  )}
                </>
              }
            >
              <div className="p-4 h-48">
                {Math.abs(statusEye.value) <
                  appContext.thresholdFrontViewHead && (
                  <svg
                    width="724"
                    height="724"
                    viewBox="0 0 724 724"
                    style={{ maxHeight: '100%', maxWidth: '100%' }}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M362 0C242.045 0 144.8 121.56 144.8 271.5C144.8 421.44 242.045 543 362 543C481.955 543 579.2 421.44 579.2 271.5C579.2 121.56 481.955 0 362 0ZM362 506.8C262.197 506.8 181 401.24 181 271.5C181 141.76 262.197 36.2 362 36.2C461.803 36.2 543 141.76 543 271.5C543 401.24 461.803 506.8 362 506.8Z"
                      fill="#c4c4c4"
                    />
                    <path
                      d="M520.109 511.554C510.396 521.003 500.055 529.497 489.254 537.147C523.74 553.171 553.992 566.493 579.826 577.776C675.696 619.611 687.799 627.889 687.799 651.6C687.799 667.999 671.653 687.8 651.599 687.8H72.4C52.3458 687.8 36.2 667.999 36.2 651.6C36.2 627.889 48.303 619.611 144.161 577.776C170.007 566.493 200.258 553.173 234.733 537.147C223.934 529.497 213.593 521.001 203.878 511.554C53.1659 580.528 0 589.77 0 651.6C0 687.8 32.4117 724 72.4 724H651.6C691.588 724 724 687.8 724 651.6C724 589.77 670.834 580.528 520.109 511.554Z"
                      fill="#c4c4c4"
                    />
                  </svg>
                )}
                {Math.abs(statusEye.value) >
                  appContext.thresholdFrontViewHead &&
                  statusEye.value < 0 && (
                    <svg
                      width="724"
                      height="724"
                      viewBox="0 0 724 724"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0)">
                        <path
                          d="M176.706 41.1602C279.095 -21.3358 425.432 31.7586 503.55 159.741C581.668 287.724 561.996 442.147 459.607 504.643C357.218 567.139 210.882 514.045 132.764 386.062C54.6455 258.079 74.3178 103.656 176.706 41.1602ZM440.747 473.744C525.935 421.747 540.245 289.342 472.651 178.601C405.057 67.8604 280.754 20.0621 195.566 72.0591C110.379 124.056 96.0684 256.461 163.662 367.202C231.256 477.943 355.559 525.741 440.747 473.744Z"
                          fill="#c4c4c4"
                        />
                        <path
                          d="M203.891 511.554C213.604 521.003 223.945 529.497 234.746 537.147C200.26 553.171 170.008 566.493 144.174 577.776C48.3044 619.611 36.2014 627.889 36.2014 651.6C36.2014 667.999 52.3472 687.8 72.4014 687.8H651.6C671.654 687.8 687.8 667.999 687.8 651.6C687.8 627.889 675.697 619.611 579.839 577.776C553.993 566.493 523.742 553.173 489.267 537.147C500.066 529.497 510.407 521.001 520.122 511.554C670.834 580.528 724 589.77 724 651.6C724 687.8 691.588 724 651.6 724H72.4C32.4117 724 0 687.8 0 651.6C0 589.77 53.1659 580.528 203.891 511.554Z"
                          fill="#c4c4c4"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0">
                          <rect
                            width="724"
                            height="724"
                            transform="matrix(-1 0 0 1 724 0)"
                            fill="white"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
                {Math.abs(statusEye.value) >
                  appContext.thresholdFrontViewHead &&
                  statusEye.value > 0 && (
                    <svg
                      width="724"
                      height="724"
                      viewBox="0 0 724 724"
                      style={{ maxHeight: '100%', maxWidth: '100%' }}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0)">
                        <path
                          d="M547.294 41.1602C444.905 -21.3358 298.568 31.7586 220.45 159.741C142.332 287.724 162.004 442.147 264.393 504.643C366.782 567.139 513.118 514.045 591.237 386.062C669.355 258.079 649.682 103.656 547.294 41.1602ZM283.253 473.744C198.065 421.747 183.755 289.342 251.349 178.601C318.943 67.8604 443.246 20.0621 528.434 72.0591C613.622 124.056 627.932 256.461 560.338 367.202C492.744 477.943 368.441 525.741 283.253 473.744Z"
                          fill="#c4c4c4"
                        />
                        <path
                          d="M520.109 511.554C510.396 521.003 500.055 529.497 489.254 537.147C523.74 553.171 553.992 566.493 579.826 577.776C675.696 619.611 687.799 627.889 687.799 651.6C687.799 667.999 671.653 687.8 651.599 687.8H72.4C52.3458 687.8 36.2 667.999 36.2 651.6C36.2 627.889 48.303 619.611 144.161 577.776C170.007 566.493 200.258 553.173 234.733 537.147C223.934 529.497 213.593 521.001 203.878 511.554C53.1659 580.528 0 589.77 0 651.6C0 687.8 32.4117 724 72.4 724H651.6C691.588 724 724 687.8 724 651.6C724 589.77 670.834 580.528 520.109 511.554Z"
                          fill="#c4c4c4"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0">
                          <rect width="724" height="724" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  )}
              </div>
            </Widget>
          </div>
        </div>
        <div className="flex flex-row flex-wrap sm:flex-wrap mx-1 sm:mx-0">
          <div className="w-full my-1">
            <Widget className="w" title="Timers">
              <div className="flex flex-row flex-wrap sm:flex-wrap">
                <div className="w-full sm:w-full md:w-1/3 mt-1 md:mt-0">
                  <TimerComponent title="Session" timer={timerSitting} />
                </div>
                <div className="w-full sm:w-full md:w-1/3 mt-1 md:mt-0">
                  <TimerComponent
                    title="Good posture"
                    timer={timerGoodPosture}
                  />
                </div>
                <div className="w-full sm:w-full md:w-1/3 mt-1 md:mt-0">
                  <TimerComponent title="Bad posture" timer={timerBadPosture} />
                </div>
              </div>
            </Widget>
          </div>
        </div>
        <div className="flex flex-row flex-wrap sm:flex-wrap mx-1 sm:mx-0">
          <div className="w-full sm:w-full md:w-1/2 my-1 pr-0 md:pr-1">
            <Widget title="History of head tilt angle" caption="in real-time">
              <div className="p-4">
                <Graph
                  data={chartDataEye}
                  width={videoWidth}
                  height={videoHeight}
                  yDomain={[-50, 50]}
                  loading={loading}
                />
              </div>
            </Widget>
          </div>
          <div className="w-full sm:w-full md:w-1/2 my-1 pl-0 md:pl-1">
            <Widget
              title="History of shoulder tilt angle"
              caption="in real-time"
            >
              <div className="p-4">
                <Graph
                  data={chartDataShoulder}
                  width={videoWidth}
                  height={videoHeight}
                  yDomain={[-50, 50]}
                  loading={loading}
                />
              </div>
            </Widget>
          </div>
        </div>
        <div className="flex flex-row flex-wrap sm:flex-wrap mx-1 sm:mx-0">
          <div className="w-full my-1">
            <Widget title="Calibration" caption="to track distance and height">
              <Calibration />
            </Widget>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available',
    );
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  _streamCopy = stream;
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

function stopStreamedVideo() {
  try {
    try {
      _streamCopy.stop(); // if this method doesn't exist, the catch will be executed.
    } catch (e) {
      if (_streamCopy && _streamCopy.getVideoTracks() !== null) {
        _streamCopy.getVideoTracks()[0].stop(); // then stop the first video track of the stream
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function clearCanvas() {
  const canvas = document.getElementById('output');
  if (canvas && canvas !== null) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
  }
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
// eslint-disable-next-line no-unused-vars
function detectPoseInRealTime(video, _net) {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');

  // since images are being fed from a webcam, we want to feed in the
  // original image and then just flip the keypoints' x coordinates. If instead
  // we flip the image, then correcting left-right keypoint pairs requires a
  // permutation on all the keypoints.
  const flipPoseHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    try {
      let poses = [];
      let minPoseConfidence;
      let minPartConfidence;
      switch (poseNetState.algorithm) {
        case 'single-pose':
          // eslint-disable-next-line no-case-declarations
          const pose = await poseNetState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'single-person',
          });
          poses = poses.concat(pose);
          minPoseConfidence = +poseNetState.singlePoseDetection
            .minPoseConfidence;
          minPartConfidence = +poseNetState.singlePoseDetection
            .minPartConfidence;
          break;
        case 'multi-pose':
          // eslint-disable-next-line no-case-declarations
          const allPoses = await poseNetState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'multi-person',
            maxDetections: poseNetState.multiPoseDetection.maxPoseDetections,
            scoreThreshold: poseNetState.multiPoseDetection.minPartConfidence,
            nmsRadius: poseNetState.multiPoseDetection.nmsRadius,
          });

          poses = poses.concat(allPoses);
          minPoseConfidence = +poseNetState.multiPoseDetection
            .minPoseConfidence;
          minPartConfidence = +poseNetState.multiPoseDetection
            .minPartConfidence;
          break;
        default:
          console.log('reached default case (poseDetectionFrame)');
      }

      // IF POSE DATA IS AVAILABLE PUSH NEW DATA TO GLOBAL STORAGE,
      // CALCULATE TICK OBJECTS AND STORE THEM ACCORDINGLY
      if (poses[0] !== undefined) {
        const timeStamp = Date.now();
        const tick = history.length;
        const rawPoseDataObject = {
          name: 'rawPoseData',
          createdAt: timeStamp,
          tick,
          poseData: poses[0],
        };

        const tickObjectShoulder = new TickObject(
          'shoulder',
          timeStamp,
          tick,
          extractPointObj('leftShoulder', rawPoseDataObject),
          extractPointObj('rightShoulder', rawPoseDataObject),
          // get(calibrationData, 'shoulder'),
        );
        const tickObjectEye = new TickObject(
          'eye',
          timeStamp,
          tick,
          extractPointObj('leftEye', rawPoseDataObject),
          extractPointObj('rightEye', rawPoseDataObject),
          // get(calibrationData, 'eye'),
        );
        // ADD TICK OBJECTS TO STORAGE and ANNOUNCE NEW TICK OBJECTS
        history.push(rawPoseDataObject);
        historyShoulder.push(tickObjectShoulder);
        historyEye.push(tickObjectEye);

        subject.next(rawPoseDataObject);
        subjectShoulder.next(tickObjectShoulder);
        subjectEye.next(tickObjectEye);
      }

      // DRAWING
      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (poseNetState.output.showVideo) {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      }

      // For each pose (i.e. person) detected in an image, loop through the poses
      // and draw the resulting skeleton and keypoints if over certain confidence
      // scores
      poses.forEach(({ score, keypoints }) => {
        if (score >= minPoseConfidence) {
          if (poseNetState.output.showPoints) {
            drawKeypoints(keypoints, minPartConfidence, ctx);
          }
          if (poseNetState.output.showSkeleton) {
            drawSkeleton(keypoints, minPartConfidence, ctx);
          }
          if (poseNetState.output.showBoundingBox) {
            drawBoundingBox(keypoints, ctx);
          }
        }
      });

      // End monitoring code for frames per second
      // stats.end();
      // TODO stop loop here!
      requestAnimationFrame(poseDetectionFrame);
    } catch (e) {
      console.log('ERROR in async poseDetectionFrame');
    }
  }
  poseDetectionFrame();
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
// export async function bindPage() {
//   // toggleLoadingUI(true);
//   const net = await posenet.load({
//     architecture: guiState.input.architecture,
//     outputStride: guiState.input.outputStride,
//     inputResolution: guiState.input.inputResolution,
//     multiplier: guiState.input.multiplier,
//     quantBytes: guiState.input.quantBytes,
//   });
//   // toggleLoadingUI(false);

//   let video;

//   try {
//     video = await loadVideo();
//   } catch (e) {
//     const info = document.getElementById('info');
//     info.textContent =
//       'this browser does not support video capture,' +
//       'or this device does not have a camera';
//     info.style.display = 'block';
//     throw e;
//   }

//   // setupGui([], net);
//   // setupFPS();
//   detectPoseInRealTime(video, net);
// }

if (typeof window !== `undefined`) {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
}
