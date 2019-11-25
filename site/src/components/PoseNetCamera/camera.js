/* eslint-disable no-console */
/* eslint-disable no-inner-declarations */
import React, { useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import { LineChart } from '../LineChart';
import { useWebcam } from '../ctx-webcam';
import { ThresholdSlider } from '../ThresholdSlider';
import { PostureStatus } from '../PostureStatus';
import { VideoCanvas } from '../VideoCanvas';
// PoseNet
import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
} from './utils';

const videoWidth = 600;
const videoHeight = 500;

const datas = [];

const emptyState = { msg: 'Loading...', value: 0.0, status: 'default' };
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const PoseNetCamera = () => {
  const [goodBadShoulder, setGoodBadShoulder] = useState(emptyState);
  const [goodBadEye, setGoodBadEye] = useState(emptyState);
  const [chartData, setChartData] = useState([]);
  const [calibrationData, setCalibrationData] = useState([]);
  const [thresholdShoulder, setThresholdShoulder] = React.useState(15);
  const [thresholdEye, setThresholdEye] = React.useState(7);
  const [loading, setLoading] = useState(false);
  const [webcamContext] = useWebcam();

  useEffect(() => {
    console.log(calibrationData);
  }, [calibrationData]);

  useEffect(() => {
    if (webcamContext.webCam) {
      async function bind() {
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
    } else {
      async function bind2() {
        setLoading(false);
        setGoodBadShoulder(emptyState);
        setGoodBadEye(emptyState);
        setChartData([]);
        stopStreamedVideo();
        clearCanvas();
      }
      bind2();
    }
  }, [webcamContext]);

  useEffect(() => {
    const timer = setInterval(() => {
      // console.log(datas)
      if (webcamContext.webCam && datas.length > 0) {
        if (datas[datas.length - 1].poseData) {
          const currentData = datas[datas.length - 1].poseData;
          console.log(currentData);
          if (currentData.keypoints) {
            const leftShoulder = currentData.keypoints.filter(
              x => x.part === 'leftShoulder',
            )[0];
            const rightShoulder = currentData.keypoints.filter(
              x => x.part === 'rightShoulder',
            )[0];
            const leftEye = currentData.keypoints.filter(
              x => x.part === 'leftEye',
            )[0];
            const rightEye = currentData.keypoints.filter(
              x => x.part === 'rightEye',
            )[0];
            // console.log(currentData, leftShoulder, rightShoulder, Math.abs(leftShoulder.position.y - rightShoulder.position.y))
            if (
              Math.abs(leftShoulder.position.y - rightShoulder.position.y) >
              thresholdShoulder
            ) {
              setGoodBadShoulder({
                msg: `Bad posture (shoulders)`,
                value: Math.abs(
                  leftShoulder.position.y - rightShoulder.position.y,
                ).toFixed(2),
                status: 'bad',
              });
            } else {
              setGoodBadShoulder({
                msg: `Good posture (shoulders)`,
                value: Math.abs(
                  leftShoulder.position.y - rightShoulder.position.y,
                ).toFixed(2),
                status: 'good',
              });
            }
            if (
              Math.abs(leftEye.position.y - rightEye.position.y) > thresholdEye
            ) {
              setGoodBadEye({
                msg: `Bad posture (neck)`,
                value: Math.abs(
                  leftEye.position.y - rightEye.position.y,
                ).toFixed(2),
                status: 'bad',
              });
            } else {
              setGoodBadEye({
                msg: `Good posture (neck)`,
                value: Math.abs(
                  leftEye.position.y - rightEye.position.y,
                ).toFixed(2),
                status: 'good',
              });
            }
            const copy = chartData;
            copy.push({
              x: Date.now(),
              y: Math.abs(leftShoulder.position.y - rightShoulder.position.y),
            });
            setChartData(copy);
          }
        }
      }
    }, 500);
    return () => {
      console.log('unMount');
      clearTimeout(timer);
    };
  }, [chartData, thresholdShoulder, thresholdEye, webcamContext]);

  return (
    <Grid container direction="row" justify="center" alignItems="start">
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
        <PostureStatus
          maxWidth={videoWidth}
          msg={goodBadShoulder.msg}
          value={goodBadShoulder.value}
          status={goodBadShoulder.status}
        />
        <PostureStatus
          maxWidth={videoWidth}
          msg={goodBadEye.msg}
          value={goodBadEye.value}
          status={goodBadEye.status}
        />
        <ThresholdSlider
          maxWidth={videoWidth}
          threshold={thresholdShoulder}
          setThreshold={setThresholdShoulder}
        >
          Shoulders
        </ThresholdSlider>
        <ThresholdSlider
          maxWidth={videoWidth}
          threshold={thresholdEye}
          setThreshold={setThresholdEye}
        >
          Neck
        </ThresholdSlider>
        <Button
          variant="contained"
          onClick={() => {
            if (datas[datas.length - 1].poseData) {
              const tmp = datas[datas.length - 1].poseData;
              setCalibrationData(tmp);
            }
          }}
        >
          Calibrate
        </Button>
        {webcamContext.webCam && !loading && <LineChart data={chartData} />}
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
      _streamCopy.getVideoTracks()[0].stop(); // then stop the first video track of the stream
    }
  } catch (e) {
    console.log(e);
  }
}

function clearCanvas() {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, videoWidth, videoHeight);
}

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

      datas.push({ time: Date.now(), poseData: poses[0] });
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
export async function bindPage() {
  // toggleLoadingUI(true);
  const net = await posenet.load({
    architecture: guiState.input.architecture,
    outputStride: guiState.input.outputStride,
    inputResolution: guiState.input.inputResolution,
    multiplier: guiState.input.multiplier,
    quantBytes: guiState.input.quantBytes,
  });
  // toggleLoadingUI(false);

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

  // setupGui([], net);
  // setupFPS();
  detectPoseInRealTime(video, net);
}

// TODO maybe fix later
// navigator.getUserMedia = navigator.getUserMedia ||
// navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
