/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import get from 'lodash/get';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { Button } from 'carbon-components-react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import { Subject } from 'rxjs';
import { Timer } from 'easytimer.js';
import { VideoCanvas } from '../VideoCanvas';
import { Graph } from './graph';
// import get from 'lodash/get';

// import { EpochFusion } from './epochFusion';
// import { EpochPart } from './epochPart';
import { TickObject } from './tickObject';
import { useApp } from '../ctx-app';
import { ThresholdSlider } from '../ThresholdSlider';
import { PostureStatus } from '../PostureStatus';
import {
  extractPointObj,
  calcMeanForTimeWindow,
  calcMedianForTimeWindow,
} from './tickUtil';

// PoseNet
import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
} from './utils';

import '../../../node_modules/react-vis/dist/style.css';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

const videoWidth = 600;
const videoHeight = 500;

const timerSitting = new Timer();
// const timerPause = new Timer();
const timerGoodPosture = new Timer();
const timerBadPosture = new Timer();
const timerShoulderMeanBadPosture = new Timer();
const timerEyeMeanBadPosture = new Timer();

// gets updated every second
const history = [];
const subject = new Subject();
const historyShoulder = [];
const subjectShoulder = new Subject();
const historyEye = [];
const subjectEye = new Subject();

const emptyState = { msg: 'Loading...', value: 0.0, status: 'default' };
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const PoseNetCamera = () => {
  const classes = useStyles();

  const [appContext] = useApp();
  const [loading, setLoading] = useState(false);
  const [headPostureOverTimeIsBad, setHeadPostureOverTimeIsBad] = useState(
    false,
  );
  const [bodyPostureOverTimeIsBad, setBodyPostureOverTimeIsBad] = useState(
    false,
  );

  const [statusShoulder, setStatusShoulder] = useState(emptyState);
  const [thresholdShoulder, setThresholdShoulder] = useState(15);
  const [chartDataShoulder, setChartDataShoulder] = useState([]);

  const [statusEye, setStatusEye] = useState(emptyState);
  const [thresholdEye, setThresholdEye] = useState(7);
  const [chartDataEye, setChartDataEye] = useState([]);

  const [calibrationDataRaw, setCalibrationDataRaw] = useState(undefined);
  const [calibrationData, setCalibrationData] = useState(undefined);

  // POWER POSENET
  useEffect(() => {
    if (appContext.webCam) {
      // eslint-disable-next-line no-inner-declarations
      async function bind() {
        if (appContext.webCam === false) {
          return;
        }
        setLoading(true);
        const net = await posenet.load({
          architecture: guiState.input.architecture,
          outputStride: guiState.input.outputStride,
          inputResolution: guiState.input.inputResolution,
          multiplier: guiState.input.multiplier,
          quantBytes: guiState.input.quantBytes,
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
        guiState.net = net;
        // setupFPS();
        detectPoseInRealTime(video, net);
      }
      bind();
      timerSitting.start();
    } else {
      // eslint-disable-next-line no-inner-declarations
      async function bind2() {
        // timerSitting.pause();
        setLoading(false);
        setStatusShoulder(emptyState);
        setStatusEye(emptyState);
        // setChartDataShoulder([]);
        // setChartDataEye([]);
        stopStreamedVideo();
        // clearCanvas();
      }
      bind2();
    }
  }, [appContext, appContext.webCam, setLoading]);

  useEffect(() => {
    if (calibrationDataRaw) {
      const { time, tick } = calibrationDataRaw;
      const tickObjectShoulder = new TickObject(
        'shoulder',
        time,
        tick,
        extractPointObj('leftShoulder', calibrationDataRaw),
        extractPointObj('rightShoulder', calibrationDataRaw),
      );
      const tickObjectEye = new TickObject(
        'eye',
        time,
        tick,
        extractPointObj('leftEye', calibrationDataRaw),
        extractPointObj('rightEye', calibrationDataRaw),
      );
      setCalibrationData({ eye: tickObjectEye, shoulder: tickObjectShoulder });
      tickObjectShoulder.logData();
      tickObjectEye.logData();
    }
  }, [calibrationDataRaw]);

  // LOG POSENET DATA
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        if (appContext.consoleLog) {
          console.log({
            time: new Date(nextObj.time).toISOString(),
            tick: history.length,
            nextObj,
          });
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appContext.consoleLog]);

  // TODO: Change STATUS output to angle, switch threshold to angle?
  // TODO: Add calibration functionality (button, calc D_c to mean of Y_(L-r))
  // TODO: Over time? Time counter!
  // TODO: Revamp UI

  // CALCULATE TICK OBJECTS
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        try {
          const timeStamp = nextObj.time;
          const cloneHistory = [...history];
          const tick = cloneHistory.length;
          if (cloneHistory.length > 0) {
            if (cloneHistory[cloneHistory.length - 1].poseData) {
              const lastHistoryDataObject =
                cloneHistory[cloneHistory.length - 1];

              const tickObjectShoulder = new TickObject(
                'shoulder',
                timeStamp,
                tick,
                extractPointObj('leftShoulder', lastHistoryDataObject),
                extractPointObj('rightShoulder', lastHistoryDataObject),
                get(calibrationData, 'shoulder'),
              );
              const tickObjectEye = new TickObject(
                'eye',
                timeStamp,
                tick,
                extractPointObj('leftEye', lastHistoryDataObject),
                extractPointObj('rightEye', lastHistoryDataObject),
                get(calibrationData, 'eye'),
              );
              historyShoulder.push(tickObjectShoulder);
              subjectShoulder.next(tickObjectShoulder);
              historyEye.push(tickObjectEye);
              subjectEye.next(tickObjectEye);

              if (appContext.consoleLog) {
                tickObjectShoulder.logData();
                tickObjectEye.logData();
              }
              // CALCULATE POSTURE IF GOOD OR BAD VIA MEAN AND TIME

              const cloneHistoryShoulder = [...historyShoulder];
              const cloneHistoryEye = [...historyEye];
              let meanOrMedianShoulder;
              let meanOrMedianEye;

              if (appContext.median) {
                meanOrMedianShoulder = calcMedianForTimeWindow(
                  cloneHistoryShoulder,
                  3000,
                  timeStamp,
                );
                meanOrMedianEye = calcMedianForTimeWindow(
                  cloneHistoryEye,
                  3000,
                  timeStamp,
                );
              } else {
                meanOrMedianShoulder = calcMeanForTimeWindow(
                  cloneHistoryShoulder,
                  3000,
                  timeStamp,
                );
                meanOrMedianEye = calcMeanForTimeWindow(
                  cloneHistoryEye,
                  3000,
                  timeStamp,
                );
              }

              // TIMER
              if (
                timerShoulderMeanBadPosture.getTotalTimeValues().seconds > 5
              ) {
                // GENERAL
                timerBadPosture.start();
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
                timerBadPosture.start();
                if (timerGoodPosture.isRunning()) {
                  timerGoodPosture.pause();
                }
                // console.log('bad posture eye (> 5 seconds)');
                setHeadPostureOverTimeIsBad(true);
              } else {
                setHeadPostureOverTimeIsBad(false);
              }
              if (
                !(
                  timerShoulderMeanBadPosture.getTotalTimeValues().seconds > 5
                ) &&
                !(timerEyeMeanBadPosture.getTotalTimeValues().seconds > 5)
              ) {
                if (timerBadPosture.isRunning()) {
                  timerBadPosture.pause();
                }
                timerGoodPosture.start();
              }
              if (meanOrMedianShoulder > thresholdShoulder) {
                timerShoulderMeanBadPosture.start();
              } else {
                timerShoulderMeanBadPosture.reset();
              }
              if (meanOrMedianEye > thresholdEye) {
                timerEyeMeanBadPosture.start();
              } else {
                timerEyeMeanBadPosture.reset();
              }
              // TODO reset timers on unmount
            }
          }
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
    appContext.median,
    calibrationData,
    thresholdEye,
    thresholdShoulder,
  ]);

  // UPDATE STATUS, CHART of shoulder
  useEffect(() => {
    const subscription = subjectShoulder.subscribe({
      next: nextObj => {
        if (Math.abs(nextObj.angleOfVector) > thresholdShoulder) {
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
  }, [appContext.charts, chartDataShoulder, thresholdShoulder]);

  // UPDATE STATUS, CHART of eye
  useEffect(() => {
    const subscription = subjectEye.subscribe({
      next: nextObj => {
        if (Math.abs(nextObj.angleOfVector) > thresholdEye) {
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
  }, [appContext.charts, chartDataEye, thresholdEye]);

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="flex-start"
      minHeight="100%"
    >
      <VideoCanvas
        videoHeight={videoHeight}
        videoWidth={videoWidth}
        loading={loading}
      />
      <Box
        display="flex"
        flexDirection="column"
        maxWidth={videoWidth}
        alignItems="top"
      >
        <Button
          style={{ margin: '12px' }}
          onClick={() => {
            if (history.length > 0) {
              const cloneHistory = [...history];
              const tick = cloneHistory.length;
              const currentPoseData = cloneHistory[cloneHistory.length - 1];
              setCalibrationDataRaw({ tick, ...currentPoseData });
            }
          }}
        >
          Calibrate
        </Button>
        <ExpansionPanel
          TransitionProps={{ unmountOnExit: true }}
          style={{ marginRight: '12px', marginLeft: '12px', width: '468px' }}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>EYES</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box
              display="flex"
              flexDirection="column"
              maxWidth={videoWidth}
              alignItems="top"
            >
              <PostureStatus
                maxWidth={videoWidth}
                msg={statusEye.msg}
                value={statusEye.value}
                status={statusEye.status}
              />
              <ThresholdSlider
                maxWidth={videoWidth}
                threshold={thresholdEye}
                setThreshold={setThresholdEye}
                part="eye"
              />
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          TransitionProps={{ unmountOnExit: true }}
          style={{ marginRight: '12px', marginLeft: '12px', width: '468px' }}
        >
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}>SHOULDERS</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box
              display="flex"
              flexDirection="column"
              maxWidth={videoWidth}
              alignItems="top"
            >
              <PostureStatus
                maxWidth={videoWidth}
                msg={statusShoulder.msg}
                value={statusShoulder.value}
                status={statusShoulder.status}
              />
              <ThresholdSlider
                maxWidth={videoWidth}
                threshold={thresholdShoulder}
                setThreshold={setThresholdShoulder}
                part="shoulder"
              />
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Box>
      <Box
        display="flex"
        width="100%"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ backgroundColor: '#ffffff' }}
        margin="1rem"
        height="3rem"
      >
        <Box
          display="flex"
          width="30%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {timerSitting.getTimeValues().toString()}
          </span>
          <span className="camera-time-label">Session (total)</span>
        </Box>
        <Box
          display="flex"
          width="30%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {timerGoodPosture.getTimeValues().toString()}
          </span>
          <span className="camera-time-label">Good posture (total)</span>
        </Box>
        <Box
          display="flex"
          width="30%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {timerBadPosture.getTimeValues().toString()}
          </span>
          <span className="camera-time-label">Bad posture (total)</span>
        </Box>
      </Box>
      <Box
        display="flex"
        width="100%"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ backgroundColor: '#ffffff' }}
        margin="1rem"
        height="3rem"
      >
        <Box
          display="flex"
          width="25%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {timerEyeMeanBadPosture.getTimeValues().toString()}
          </span>
          <span className="camera-time-label">Head bad posture (period)</span>
        </Box>
        <Box
          display="flex"
          width="25%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {headPostureOverTimeIsBad ? 'BAD' : 'GOOD'}
          </span>
          <span className="camera-time-label">Head status</span>
        </Box>
        <Box
          display="flex"
          width="25%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {timerShoulderMeanBadPosture.getTimeValues().toString()}
          </span>
          <span className="camera-time-label">Body bad posture (period)</span>
        </Box>
        <Box
          display="flex"
          width="25%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          <span className="camera-time-value">
            {bodyPostureOverTimeIsBad ? 'BAD' : 'GOOD'}
          </span>
          <span className="camera-time-label">Body status</span>
        </Box>
      </Box>
      <Box
        display="flex"
        width="100%"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        style={{ backgroundColor: '#ffffff' }}
        margin="1rem"
      >
        <Box
          display="flex"
          width="50%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="400px"
          position="relative"
        >
          <Graph
            data={chartDataEye}
            width={800}
            height={400}
            yDomain={[-50, 50]}
            loading={loading}
          />
        </Box>
        <Box
          display="flex"
          width="50%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="400px"
          position="relative"
        >
          <Graph
            data={chartDataShoulder}
            width={800}
            height={400}
            yDomain={[-80, 80]}
            loading={loading}
          />
        </Box>
      </Box>
    </Grid>
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

// function clearCanvas() {
//   const canvas = document.getElementById('output');
//   const ctx = canvas.getContext('2d');
//   ctx.clearRect(0, 0, videoWidth, videoHeight);
// }

const defaultQuantBytes = 4;

const defaultMobileNetMultiplier = isMobile() ? 0.5 : 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 350;

// const defaultResNetMultiplier = 0.75;
// const defaultResNetStride = 32;
// const defaultResNetInputResolution = 250;

const guiState = {
  algorithm: 'multi-pose',
  input: {
    architecture: 'MobileNetV1',
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes,
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
  },
  multiPoseDetection: {
    maxPoseDetections: 1,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

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
      switch (guiState.algorithm) {
        case 'single-pose':
          // eslint-disable-next-line no-case-declarations
          const pose = await guiState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'single-person',
          });
          poses = poses.concat(pose);
          minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
          minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
          break;
        case 'multi-pose':
          // eslint-disable-next-line no-case-declarations
          const allPoses = await guiState.net.estimatePoses(video, {
            flipHorizontal: flipPoseHorizontal,
            decodingMethod: 'multi-person',
            maxDetections: guiState.multiPoseDetection.maxPoseDetections,
            scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
            nmsRadius: guiState.multiPoseDetection.nmsRadius,
          });

          poses = poses.concat(allPoses);
          minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
          minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
          break;
        default:
          console.log('reached default case (poseDetectionFrame)');
      }

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (guiState.output.showVideo) {
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
          if (guiState.output.showPoints) {
            drawKeypoints(keypoints, minPartConfidence, ctx);
          }
          if (guiState.output.showSkeleton) {
            drawSkeleton(keypoints, minPartConfidence, ctx);
          }
          if (guiState.output.showBoundingBox) {
            drawBoundingBox(keypoints, ctx);
          }
        }
      });

      // End monitoring code for frames per second
      // stats.end();
      if (poses[0] !== undefined) {
        const newData = { time: Date.now(), poseData: poses[0] };
        history.push(newData);
        subject.next(newData);
      }
      // console.log(datas)
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

// useEffect(() => {
//   const subscription = subject.subscribe({
//     next: nextObj => {
//       try {
//         const timeStamp = nextObj.time;
//         const cloneHistory = [...history];
//         const tick = cloneHistory.length;
//         if (cloneHistory.length > appContext.epochCount - 1) {
//           if (cloneHistory[cloneHistory.length - 1].poseData) {
//             const slicedHistory = cloneHistory.slice(
//               cloneHistory.length - appContext.epochCount,
//               cloneHistory.length,
//             );
//             const leftShoulderEpoch = new EpochPart(
//               'leftShoulder',
//               timeStamp,
//               tick,
//             );
//             const rightShoulderEpoch = new EpochPart(
//               'rightShoulder',
//               timeStamp,
//               tick,
//             );
//             const leftEyeEpoch = new EpochPart('leftEye', timeStamp, tick);
//             const rightEyeEpoch = new EpochPart('rightEye', timeStamp, tick);
//             // eslint-disable-next-line no-plusplus
//             for (let i = 0; i < slicedHistory.length; i++) {
//               leftShoulderEpoch.extractCoordinates(slicedHistory[i]);
//               rightShoulderEpoch.extractCoordinates(slicedHistory[i]);
//               leftEyeEpoch.extractCoordinates(slicedHistory[i]);
//               rightEyeEpoch.extractCoordinates(slicedHistory[i]);
//             }
//             const shoulderFusion = new EpochFusion(
//               'shoulder',
//               leftShoulderEpoch,
//               rightShoulderEpoch,
//               timeStamp,
//               tick,
//             );
//             const eyeFusion = new EpochFusion(
//               'eye',
//               leftEyeEpoch,
//               rightEyeEpoch,
//               timeStamp,
//               tick,
//             );

//             // OLD: calculate y distance of ONLY latest frame
//             if (appContext.epochMode) {
//               eyeFusion.absDifferenceEpochYThreshold(
//                 thresholdEye,
//                 setStatusEye,
//               );
//               shoulderFusion.absDifferenceEpochYThreshold(
//                 thresholdShoulder,
//                 setStatusShoulder,
//               );
//             } else {
//               eyeFusion.absDifferenceLatestYThreshold(
//                 thresholdEye,
//                 setStatusEye,
//               );
//               shoulderFusion.absDifferenceLatestYThreshold(
//                 thresholdShoulder,
//                 setStatusShoulder,
//               );
//             }
//             if (appContext.consoleLog) {
//               leftShoulderEpoch.logData();
//               rightShoulderEpoch.logData();
//               leftEyeEpoch.logData();
//               rightEyeEpoch.logData();
//               shoulderFusion.logData();
//               eyeFusion.logData();
//             }
//             // PRINT data
//             // if (appContext.charts) {
//             //   // const chartTime = new Date(timeStamp);
//             //   shoulderFusion.printAbsDifferenceLatestYCoor(
//             //     chartDataShoulder,
//             //     setChartDataShoulder,
//             //     timeStamp,
//             //   );
//             //   eyeFusion.printAbsDifferenceLatestYCoor(
//             //     chartDataEye,
//             //     setChartDataEye,
//             //     timeStamp,
//             //   );
//             // }
//             // TODO: veränderung zur calibration: abs. abstand zu calb zu mean
//             // TODO: schiefhaltung: jetzt über zeit zu threashold mean
//           }
//         }
//       } catch (e) {
//         console.log(e);
//       }
//     },
//   });

//   return () => {
//     subscription.unsubscribe();
//   };
// }, [
//   appContext.charts,
//   appContext.consoleLog,
//   appContext.epochCount,
//   appContext.epochMode,
//   chartDataEye,
//   chartDataShoulder,
//   thresholdEye,
//   thresholdShoulder,
// ]);
