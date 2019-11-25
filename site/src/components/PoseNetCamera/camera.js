/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import * as posenet from '@tensorflow-models/posenet';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
// import get from 'lodash/get';

import { EpochFusion } from './epochFusion';
import { EpochPart } from './epochPart';
import { LineChart } from '../LineChart';
import { useApp } from '../ctx-app';
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

const datas = [];

const emptyState = { msg: 'Loading...', value: 0.0, status: 'default' };
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const PoseNetCamera = () => {
  const classes = useStyles();

  const [appContext] = useApp();
  const [loading, setLoading] = useState(false);

  const [statusShoulder, setStatusShoulder] = useState(emptyState);
  const [thresholdShoulder, setThresholdShoulder] = useState(15);
  const [chartDataShoulder, setChartDataShoulder] = useState([]);

  const [statusEye, setStatusEye] = useState(emptyState);
  const [thresholdEye, setThresholdEye] = useState(7);
  const [chartDataEye, setChartDataEye] = useState([]);

  const [calibrationData, setCalibrationData] = useState([]);

  useEffect(() => {
    console.log({ calibrationData });
  }, [calibrationData]);

  useEffect(() => {
    if (appContext.webCam) {
      // eslint-disable-next-line no-inner-declarations
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
      // eslint-disable-next-line no-inner-declarations
      async function bind2() {
        setLoading(false);
        setStatusShoulder(emptyState);
        setStatusEye(emptyState);
        setChartDataShoulder([]);
        setChartDataEye([]);
        stopStreamedVideo();
        clearCanvas();
      }
      bind2();
    }
  }, [appContext.webCam]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (appContext.webCam && datas.length > 19) {
        if (datas[datas.length - 1].poseData) {
          const currentDataKeyPoints = datas
            .slice(datas.length - 20, datas.length)
            .map(obj => obj.poseData.keypoints);

          const timeStamp = Date.now();
          const leftShoulderEpoch = new EpochPart('leftShoulder', timeStamp);
          const rightShoulderEpoch = new EpochPart('rightShoulder', timeStamp);
          const leftEyeEpoch = new EpochPart('leftEye', timeStamp);
          const rightEyeEpoch = new EpochPart('rightEye', timeStamp);

          // eslint-disable-next-line no-restricted-syntax
          for (const t in currentDataKeyPoints) {
            if (Object.prototype.hasOwnProperty.call(currentDataKeyPoints, t)) {
              leftShoulderEpoch.extractCoordinates(currentDataKeyPoints[t]);
              rightShoulderEpoch.extractCoordinates(currentDataKeyPoints[t]);
              leftEyeEpoch.extractCoordinates(currentDataKeyPoints[t]);
              rightEyeEpoch.extractCoordinates(currentDataKeyPoints[t]);
            }
          }
          if (appContext.consoleLog) {
            leftShoulderEpoch.logData();
            rightShoulderEpoch.logData();
            leftEyeEpoch.logData();
            rightEyeEpoch.logData();
          }
          const shoulderFusion = new EpochFusion(
            'shoulder',
            leftShoulderEpoch,
            rightShoulderEpoch,
            timeStamp,
          );
          const eyeFusion = new EpochFusion(
            'eye',
            leftEyeEpoch,
            rightEyeEpoch,
            timeStamp,
          );
          if (appContext.consoleLog) {
            shoulderFusion.logData();
            eyeFusion.logData();
          }
          // OLD: calculate y distance of ONLY latest frame
          if (appContext.epochMode) {
            eyeFusion.absDifferenceEpochYThreshold(thresholdEye, setStatusEye);
            shoulderFusion.absDifferenceEpochYThreshold(
              thresholdShoulder,
              setStatusShoulder,
            );
          } else {
            eyeFusion.absDifferenceLatestYThreshold(thresholdEye, setStatusEye);
            shoulderFusion.absDifferenceLatestYThreshold(
              thresholdShoulder,
              setStatusShoulder,
            );
          }
          // PRINT data
          if (appContext.charts) {
            shoulderFusion.printAbsDifferenceLatestYCoor(
              chartDataShoulder,
              setChartDataShoulder,
              timeStamp,
            );
            eyeFusion.printAbsDifferenceLatestYCoor(
              chartDataEye,
              setChartDataEye,
              timeStamp,
            );
          }
          // TODO: veränderung zur calibration: abs. abstand zu calb zu mean
          // TODO: schiefhaltung: jetzt über zeit zu threashold mean
        }
      }
    }, 500);
    return () => {
      console.log('unMount');
      clearTimeout(timer);
    };
  }, [
    thresholdShoulder,
    thresholdEye,
    chartDataShoulder,
    chartDataEye,
    appContext.webCam,
    appContext.epochMode,
    appContext.charts,
    appContext.consoleLogs,
    appContext.consoleLog,
  ]);

  return (
    <Grid container direction="row" justify="center" alignItems="flex-start">
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
          variant="contained"
          style={{ margin: '12px' }}
          onClick={() => {
            if (datas && datas.length > 0 && datas[datas.length - 1].poseData) {
              const currentPoseData = datas[datas.length - 1].poseData;
              setCalibrationData(currentPoseData);
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
              {appContext.webCam && !loading && appContext.charts && (
                <LineChart data={chartDataEye} part="eye" />
              )}
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
              {appContext.webCam && !loading && appContext.charts && (
                <LineChart data={chartDataShoulder} part="shoulder" />
              )}
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
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
