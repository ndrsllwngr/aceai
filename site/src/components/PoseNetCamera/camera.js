// import {drawKeyPoints, drawSkeleton} from './utils'
import React, { useEffect } from 'react'
import * as posenet from '@tensorflow-models/posenet'

import { drawBoundingBox, drawKeypoints, drawSkeleton, isMobile } from './demo-utils';


// import "./style.css"

const videoWidth = 600;
const videoHeight = 500;

export const PoseNetCamera = props => {

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

  return (
    <>
      <video id="video" playsinline style={{ transform: "scaleX(-1)", display: "none" }}>
      </video>
      <canvas id="output" />
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

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
// kick off the demo
// bindPage();


///////

// class PoseNet extends Component {
//   static defaultProps = {
//     videoWidth: 900,
//     videoHeight: 700,
//     flipHorizontal: true,
//     algorithm: 'multi-pose',
//     showVideo: true,
//     showSkeleton: true,
//     showPoints: true,
//     minPoseConfidence: 0.1,
//     minPartConfidence: 0.5,
//     maxPoseDetections: 1,
//     nmsRadius: 20,
//     outputStride: 16,
//     imageScaleFactor: 0.5,
//     skeletonColor: '#ffadea',
//     skeletonLineWidth: 6,
//     loadingText: 'Loading...please be patient...'
//   }

//   constructor(props) {
//     super(props, PoseNet.defaultProps)
//   }

//   getCanvas = elem => {
//     this.canvas = elem
//   }

//   getVideo = elem => {
//     this.video = elem
//   }

//   async componentDidMount() {
//     try {
//       await this.setupCamera()
//     } catch (error) {
//       throw new Error(
//         'This browser does not support video capture, or this device does not have a camera'
//       )
//     }

//     try {
//       this.posenet = await posenet.load()
//     } catch (error) {
//       throw new Error('PoseNet failed to load')
//     } finally {
//       setTimeout(() => {
//         this.setState({loading: false})
//       }, 200)
//     }

//     this.detectPose()
//   }

//   async setupCamera() {
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       throw new Error(
//         'Browser API navigator.mediaDevices.getUserMedia not available'
//       )
//     }
//     const {videoWidth, videoHeight} = this.props
//     const video = this.video
//     video.width = videoWidth
//     video.height = videoHeight

//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: false,
//       video: {
//         facingMode: 'user',
//         width: videoWidth,
//         height: videoHeight
//       }
//     })

//     video.srcObject = stream

//     return new Promise(resolve => {
//       video.onloadedmetadata = () => {
//         video.play()
//         resolve(video)
//       }
//     })
//   }

//   detectPose() {
//     const {videoWidth, videoHeight} = this.props
//     const canvas = this.canvas
//     const canvasContext = canvas.getContext('2d')

//     canvas.width = videoWidth
//     canvas.height = videoHeight

//     this.poseDetectionFrame(canvasContext)
//   }

//   poseDetectionFrame(canvasContext) {
//     const {
//       algorithm,
//       imageScaleFactor, 
//       flipHorizontal, 
//       outputStride, 
//       minPoseConfidence, 
//       minPartConfidence, 
//       maxPoseDetections, 
//       nmsRadius, 
//       videoWidth, 
//       videoHeight, 
//       showVideo, 
//       showPoints, 
//       showSkeleton, 
//       skeletonColor, 
//       skeletonLineWidth 
//       } = this.props

//     const posenetModel = this.posenet
//     const video = this.video

//     const findPoseDetectionFrame = async () => {
//       let poses = []

//       switch (algorithm) {
//         case 'multi-pose': {
//           poses = await posenetModel.estimateMultiplePoses(
//           video, 
//           imageScaleFactor, 
//           flipHorizontal, 
//           outputStride, 
//           maxPoseDetections, 
//           minPartConfidence, 
//           nmsRadius
//           )
//           break
//         }
//         case 'single-pose': {
//           const pose = await posenetModel.estimateSinglePose(
//           video, 
//           imageScaleFactor, 
//           flipHorizontal, 
//           outputStride
//           )
//           poses.push(pose)
//           break
//         }
//         default: {
//           throw new Error(
//             'algorithm not found'
//           )
//         }
//       }

//       canvasContext.clearRect(0, 0, videoWidth, videoHeight)

//       if (showVideo) {
//         canvasContext.save()
//         canvasContext.scale(-1, 1)
//         canvasContext.translate(-videoWidth, 0)
//         canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
//         canvasContext.restore()
//       }

//       poses.forEach(({score, keypoints}) => {
//         if (score >= minPoseConfidence) {
//           if (showPoints) {
//             drawKeyPoints(
//               keypoints,
//               minPartConfidence,
//               skeletonColor,
//               canvasContext
//             )
//           }
//           if (showSkeleton) {
//             drawSkeleton(
//               keypoints,
//               minPartConfidence,
//               skeletonColor,
//               skeletonLineWidth,
//               canvasContext
//             )
//           }
//         }
//       })
//       requestAnimationFrame(findPoseDetectionFrame)
//     }
//     findPoseDetectionFrame()
//   }

//   render() {
//     return (
//       <>
//         <video id="video" playsinline style=" -moz-transform: scaleX(-1);
//         -o-transform: scaleX(-1);
//         -webkit-transform: scaleX(-1);
//         transform: scaleX(-1);
//         display: none;
//         ">
//         </video>
//         <canvas id="output" />
//       </>
//     )
//   }
// }

// export default PoseNet
