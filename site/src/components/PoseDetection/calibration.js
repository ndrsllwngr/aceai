/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useEffect } from 'react';
import * as posenet from '@tensorflow-models/posenet';
// import PropTypes from 'prop-types';
import {
  Button,
  Dialog,
  Classes,
  AnchorButton,
  Tooltip,
  Spinner,
  Intent,
} from '@blueprintjs/core';
import { Subject } from 'rxjs';

import {
  videoWidth,
  videoHeight,
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
  poseNetState,
} from './utils';
import TickObject, {
  extractPointObj,
  //   calcMeanForTimeWindow,
  //   calcMedianForTimeWindow,
} from '../TickObject';
import { CountDownComponent } from '../countdown';

export const history = [];
const subject = new Subject();
export const historyShoulder = [];
const subjectShoulder = new Subject();
export const historyEye = [];
const subjectEye = new Subject();

let showPoses = false;
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const Calibration = () => {
  const [calibrationDialogIsOpen, setCalibrationDialogIsOpen] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countDownIsFinished, setCountDownIsFinished] = useState(false);

  const handleDialogIsOpen = bool => () => {
    if (bool === false) {
      setIsStarted(false);
      showPoses = false;
    }
    setCalibrationDialogIsOpen(bool);
  };

  const handleCountDown = () => {
    setCountDownIsFinished(true);
  };

  useEffect(() => {
    if (countDownIsFinished) {
      showPoses = true;
    }
  }, [countDownIsFinished]);

  // POWER POSENET
  useEffect(() => {
    // eslint-disable-next-line no-inner-declarations
    if (calibrationDialogIsOpen) {
      // eslint-disable-next-line no-inner-declarations
      async function running() {
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
      }
      running();
    } else {
      // eslint-disable-next-line no-inner-declarations
      async function shuttingDown() {
        console.log('async function shuttingDown()');
        setLoading(false);
        stopStreamedVideo();
        clearCanvas();
      }
      shuttingDown();
    }
  }, [calibrationDialogIsOpen]);

  return (
    <>
      <div>
        <Button
          // onClick={() => {
          //   if (history.length > 0) {
          //     const cloneHistory = [...history];
          //     const tick = cloneHistory.length;
          //     const currentPoseData =
          //       cloneHistory[cloneHistory.length - 1];
          //     setCalibrationDataRaw({ tick, ...currentPoseData });
          //   }
          // }}
          intent={Intent.PRIMARY}
          onClick={handleDialogIsOpen(true)}
        >
          Calibrate
        </Button>
        <Dialog
          icon="cube-add"
          onClose={handleDialogIsOpen(false)}
          title="Calibration"
          autoFocus
          canEscapeKeyClose
          canOutsideClickClose
          enforceFocus
          isOpen={calibrationDialogIsOpen}
          usePortal
        >
          <div
            className={`${Classes.DIALOG_BODY} flex flex-row items-center justify-center`}
          >
            <div style={{ height: videoHeight, width: videoWidth }}>
              <video
                id="video-cal"
                playsInline
                style={{ transform: 'scaleX(-1)', display: 'none' }}
              />
              {loading && (
                <div className="fixed">
                  <div
                    className="flex flex-row items-center justify-center"
                    style={{ height: videoHeight, width: videoWidth }}
                  >
                    <Spinner intent="none" size={50} />
                  </div>
                </div>
              )}
              {isStarted && !loading && !countDownIsFinished && (
                <div className="fixed">
                  <div
                    className="flex flex-row items-center justify-center"
                    style={{ height: videoHeight, width: videoWidth }}
                  >
                    <CountDownComponent period={5} callback={handleCountDown} />
                  </div>
                </div>
              )}
              <canvas
                id="output-cal"
                //   style={{
                //     display: uiContext.videoCanvasIsOpen ? 'block' : 'none',
                //   }}
              />
            </div>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Tooltip content="This button is hooked up to close the dialog.">
                <Button onClick={handleDialogIsOpen(false)}>Close</Button>
              </Tooltip>
              <Button
                intent={Intent.PRIMARY}
                onClick={() => {
                  setIsStarted(true);
                }}
              >
                Calibrate
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
};

Calibration.propTypes = {
  //   title: PropTypes.string,
  //   timer: PropTypes.any,
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

  const video = document.getElementById('video-cal');
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
  const canvas = document.getElementById('output-cal');
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
  const canvas = document.getElementById('output-cal');
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
      if (showPoses) {
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
      }

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
