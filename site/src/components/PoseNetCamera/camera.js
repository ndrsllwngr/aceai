// import {drawKeyPoints, drawSkeleton} from './utils'
import React, { useEffect, useState } from 'react'
import * as posenet from '@tensorflow-models/posenet'

import { drawBoundingBox, drawKeypoints, drawSkeleton, isMobile } from './demo-utils';

// UI
import Box from '@material-ui/core/Box';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
import { CheckCircle, Error } from '@material-ui/icons';

// CHART
import { Line } from 'react-chartjs-2';
import 'chartjs-plugin-streaming';

const videoWidth = 600;
const videoHeight = 500;

const datas = [];

var chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

export const PoseNetCamera = props => {
  const [goodBad, setGoodBad] = useState({})
  const [chartData, setChartData] = useState([])
  useEffect(() => {
    async function bind() {
      const net = await posenet.load({
        architecture: guiState.input.architecture,
        outputStride: guiState.input.outputStride,
        inputResolution: guiState.input.inputResolution,
        multiplier: guiState.input.multiplier,
        quantBytes: guiState.input.quantBytes
      });
      // toggleLoadingUI(false);

      let video;

      try {
        video = await loadVideo();
      } catch (e) {
        let info = document.getElementById('info');
        info.textContent = 'this browser does not support video capture,' +
          'or this device does not have a camera';
        info.style.display = 'block';
        throw e;
      }

      guiState.net = net;
      // setupFPS();
      detectPoseInRealTime(video, net);
    }
    bind()
  }

    , []);

  useEffect(() => {
    const timer = setInterval(() => {
      // console.log(datas)
      if (datas.length > 0) {
        if (datas[datas.length - 1].poseData) {
          let currentData = datas[datas.length - 1].poseData
          if (currentData.keypoints) {
            let leftShoulder = currentData.keypoints.filter(x => x.part == "leftShoulder")[0]
            let rightShoulder = currentData.keypoints.filter(x => x.part == "rightShoulder")[0]
            // console.log(currentData, leftShoulder, rightShoulder, Math.abs(leftShoulder.position.y - rightShoulder.position.y))
            if (Math.abs(leftShoulder.position.y - rightShoulder.position.y) > 10) {
              setGoodBad({ msg: `Bad posture: ${Math.abs(leftShoulder.position.y - rightShoulder.position.y)}`, color: red[600], icon: <Error></Error> })
            } else {
              setGoodBad({ msg: `Good posture!`, color: green[600], icon: <CheckCircle></CheckCircle> })
            }
            let copy = chartData
            copy.push({ x: Date.now(), y: Math.abs(leftShoulder.position.y - rightShoulder.position.y) })
            setChartData(copy)
          }
        }
      }
    }, 500);
    return () => { console.log("unMount"); clearTimeout(timer); }
  }, [chartData]);


  return (
    <>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column">
          <video id="video" playsinline style={{ transform: "scaleX(-1)", display: "none" }}>
          </video>
          <canvas id="output" />
          <Box display="flex" p={1} color={grey[900]} bgcolor={goodBad !== undefined && goodBad.color} maxWidth={videoWidth} marginTop="10px">
            {goodBad !== undefined && goodBad.icon}
            <span style={{ marginLeft: "10px" }}>{goodBad !== undefined && goodBad.msg}</span>
          </Box>
        </Box>
        <Box maxWidth={videoWidth}>
          <Line
            type="line"
            data={{
              datasets: [{
                label: 'Math.abs (left and right shoulder)',
                backgroundColor: chartColors.red,
                borderColor: chartColors.red,
                fill: false,
                lineTension: 0,
                borderDash: [8, 4],
                data: chartData
              }]
            }}
            options={{
              scales: {
                xAxes: [{
                  type: 'realtime'
                }]
              }
            }}
            scales={{
              xAxes: [{
                type: 'realtime',
                realtime: {
                  duration: 20000,
                  refresh: 1000,
                  delay: 2000,
                }
              }],
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'value'
                }
              }]
            }}
          />
        </Box>
      </Box>
    </>
  )
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Browser API navigator.mediaDevices.getUserMedia not available');
  }

  const video = document.getElementById('video');
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': {
      facingMode: 'user',
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight,
    },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
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

const defaultQuantBytes = 4;

const defaultMobileNetMultiplier = isMobile() ? 0.50 : 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 350;

const defaultResNetMultiplier = 0.75;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

const guiState = {
  algorithm: 'multi-pose',
  input: {
    architecture: 'MobileNetV1',
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes
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
function detectPoseInRealTime(video, net) {
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

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case 'single-pose':
        const pose = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: 'single-person'
        });
        poses = poses.concat(pose);
        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case 'multi-pose':
        let all_poses = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: 'multi-person',
          maxDetections: guiState.multiPoseDetection.maxPoseDetections,
          scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
          nmsRadius: guiState.multiPoseDetection.nmsRadius
        });

        poses = poses.concat(all_poses);
        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
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
    quantBytes: guiState.input.quantBytes
  });
  // toggleLoadingUI(false);

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById('info');
    info.textContent = 'this browser does not support video capture,' +
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
