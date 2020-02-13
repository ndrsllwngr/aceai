/* eslint-disable no-console */
import React, { useEffect, useState, useCallback } from 'react';
import get from 'lodash/get';
import * as posenet from '@tensorflow-models/posenet';
import {
  // Tag,
  Portal,
  Intent,
  Tooltip,
  Position,
  Button,
  ProgressBar,
} from '@blueprintjs/core';
import { Subject } from 'rxjs';
import { Graph } from '../graph';
import { VideoCanvas } from '../VideoCanvas';
import TickObject, {
  extractPointObj,
  getTimeWindowData,
  calcMeanForTimeWindow,
  calcMedianForTimeWindow,
  getCalibrationMeanTickObject,
  getCalibrationMedianTickObject,
} from '../TickObject';
import { useApp } from '../context-app';
import { useUi } from '../context-ui';
import {
  timerSession,
  timerOverallGood,
  timerOverallBad,
  timerBadBody,
  timerBadHead,
  timerBadDistance,
  timerBadHeight,
} from './utilsTimer';
import { states } from '../widget';
import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
  poseNetState,
  videoWidth,
  videoHeight,
} from './utils';
import '../../../node_modules/react-vis/dist/style.css';
import {
  Calibration,
  subjectHeadCalibration,
  subjectBodyCalibration,
  calibrationBody,
  calibrationHead,
} from './calibration';
import { showNotification } from '../showNotification';
import { timelineModel, Timeline } from '../timeline';
import { statesName, statesColourHex } from '../enums';
import { Tile } from '../tile';
import { CountDownComponentMinimal } from '../countdown';
import Figures from '../../images/svg/index';

export const history = [];
const subject = new Subject();
export const historyBody = [];
const subjectBody = new Subject();
export const historyHead = [];
const subjectHead = new Subject();

const emptyState = Number(0);
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;
let lastExecution = Date.now();
let posenetThreshold = 0;

// function usePrevious(value) {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   });
//   return ref.current;
// }

export const PoseNetCamera = () => {
  // CONTEXT
  const [appContext, setAppContext] = useApp();
  const [uiContext] = useUi();

  // INTERNAL LOGIC
  const [loading, setLoading] = useState(false);
  const [showScores, setShowScores] = useState(true);
  const [showTimers, setShowTimers] = useState(true);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showHead, setShowHead] = useState(true);

  // LATEST CALIBRATION DATA
  const [calibrationHeadTick, setcalibrationHeadTick] = useState();
  const [calibrationBodyTick, setcalibrationBodyTick] = useState();
  // LATEST STATES
  const [stateHead, setStateHead] = useState(emptyState);
  const [stateHeadSign, setStateHeadSign] = useState(emptyState);
  const [stateBody, setStateBody] = useState(emptyState);
  const [stateBodySign, setStateBodySign] = useState(emptyState);
  const [stateDistance, setStateDistance] = useState(emptyState);
  const [stateDistanceSign, setStateDistanceSign] = useState(emptyState);
  const [stateHeight, setStateHeight] = useState(emptyState);
  const [stateHeightSign, setStateHeightSign] = useState(emptyState);
  // TIMELINE
  const [currentStateHead, setCurrentStateHead] = useState();
  const [currentStateBody, setCurrentStateBody] = useState();
  const [currentStateDistance, setCurrentStateDistance] = useState();
  const [currentStateHeight, setCurrentStateHeight] = useState();
  // TIMELINE TIMESTAMP
  const [currentStateHeadTimeStamp, setCurrentStateHeadTimeStamp] = useState();
  const [currentStateBodyTimeStamp, setCurrentStateBodyTimeStamp] = useState();
  const [
    currentStateDistanceTimeStamp,
    setCurrentStateDistanceTimeStamp,
  ] = useState();
  const [
    currentStateHeightTimeStamp,
    setCurrentStateHeightTimeStamp,
  ] = useState();
  // CHART DATA
  const [chartDataEye, setChartDataEye] = useState([]);
  const [chartDataShoulder, setChartDataShoulder] = useState([]);
  const [chartDataDistance, setChartDataDistance] = useState([]);
  const [chartDataHeight, setChartDataHeight] = useState([]);
  // TIMELINE DATA
  const [timelineData, setTimelineData] = useState([timelineModel]);

  const showToast = useCallback(
    (message = '', intent = Intent.PRIMARY) => {
      if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
        const toastObj = {
          message,
          intent,
        };
        uiContext.toasterRef.current.show(toastObj);
      }
      if (uiContext.showNotificationBrowser) {
        showNotification(message);
      }
    },
    [
      uiContext.showNotificationBrowser,
      uiContext.showNotificationInApp,
      uiContext.toasterRef,
    ],
  );

  const [recalibrationIsRunning, setRecalibrationIsRunning] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [countDownIsFinished, setCountDownIsFinished] = useState(false);
  const [timeLeftCalibrating, setTimeLeftCalibrating] = useState(3);
  const [progress, setProgress] = useState(0.0);

  useEffect(() => {
    if (recalibrationIsRunning) {
      if (countDownIsFinished) {
        // callback
        if (timeLeftCalibrating === 0) {
          setProgress(1);
          if (appContext.global_logging) {
            console.log(history);
          }

          const centralTendencyObjectHead = getCalibrationMedianTickObject(
            'eye',
            historyHead,
          );
          const centralTendencyObjectBody = getCalibrationMedianTickObject(
            'shoulder',
            historyBody,
          );
          subjectHeadCalibration.next(centralTendencyObjectHead);
          subjectBodyCalibration.next(centralTendencyObjectBody);
          calibrationHead.push(centralTendencyObjectHead);
          calibrationBody.push(centralTendencyObjectBody);
          setAppContext({
            ...appContext,
            calibration_calibrationDataAvailable: true,
          });
          // CLEANUP
          setProgress(0.0);
          setIsStarted(false);
          setTimeLeftCalibrating(3);
          setCountDownIsFinished(false);
          setRecalibrationIsRunning(false);
        } else if (timeLeftCalibrating === 3) {
          setProgress(0.0);
        } else if (timeLeftCalibrating === 2) {
          setProgress(0.33);
        } else if (timeLeftCalibrating === 1) {
          setProgress(0.66);
        }
        // countdown
        if (timeLeftCalibrating > 0) {
          setTimeout(() => {
            if (timeLeftCalibrating > 0) {
              setTimeLeftCalibrating(timeLeftCalibrating - 1);
            }
          }, 1000);
        }
      }
    }
  }, [
    appContext,
    countDownIsFinished,
    recalibrationIsRunning,
    setAppContext,
    timeLeftCalibrating,
  ]);

  useEffect(() => {
    if (recalibrationIsRunning) {
      if (countDownIsFinished) {
        historyHead.slice(0, historyHead.length);
        historyBody.slice(0, historyBody);
      }
    }
  }, [countDownIsFinished, recalibrationIsRunning]);

  const handleCountDown = () => {
    setCountDownIsFinished(true);
  };
  // TODO: LET USER DRAG CAMERA AROUND
  // TODO: ADD SCALING with the help of calibration
  // TODO: ADD SVG ANIMATION
  // TODO reset timers on unmount
  // TODO THROTTLE CHARTS! https://blog.bitsrc.io/improve-your-react-app-performance-by-using-throttling-and-debouncing-101afbe9055

  // FETCH LATEST CALIBRATION DATA and SET IT AS STATE
  useEffect(() => {
    const headCalibrationSubscription = subjectHeadCalibration.subscribe({
      next: nextObj => {
        setcalibrationHeadTick(nextObj);
        console.log('headCalibrationSubscription', { nextObj });
      },
    });

    const bodyCalibrationSubscription = subjectBodyCalibration.subscribe({
      next: nextObj => {
        setcalibrationBodyTick(nextObj);
        console.log('bodyCalibrationSubscription', { nextObj });
      },
    });

    return () => {
      headCalibrationSubscription.unsubscribe();
      bodyCalibrationSubscription.unsubscribe();
    };
  }, []);

  // CHANGE POSNET_THRESHOLD
  useEffect(() => {
    posenetThreshold = appContext.posenet_threshold;
  }, [appContext.posenet_threshold]);

  // AUTO-START POSENET if calibration data is available and (calibration data !== older than 5sec)
  useEffect(() => {
    if (
      appContext.calibration_calibrationDataAvailable &&
      !appContext.posenet_turnedOn
    ) {
      if (calibrationHeadTick !== undefined) {
        if (Math.abs(calibrationHeadTick.createdAt - Date.now()) < 5000) {
          setAppContext({ ...appContext, posenet_turnedOn: true });
        }
      }
    }
  }, [appContext, calibrationHeadTick, setAppContext]);

  // RUN POSENET
  useEffect(() => {
    if (appContext.posenet_turnedOn) {
      // eslint-disable-next-line no-inner-declarations
      async function running() {
        if (appContext.posenet_turnedOn === false) {
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
        timerSession.start({ precision: 'secondTenths' });
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
  }, [appContext.posenet_turnedOn]);

  // CALCULATIONS & TIMERS
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        try {
          // CALCULATE POSTURE IF GOOD OR BAD VIA MEAN or MEDIAN AND TIME
          const clonehistoryBody = historyBody;
          const clonehistoryHead = historyHead;
          let timeWindowDataHead;
          let timeWindowDataBody;
          const timeWindowInMs = appContext.epoch_epochCount * 10;
          if (appContext.epoch_epochMode) {
            timeWindowDataHead = getTimeWindowData(
              clonehistoryHead,
              timeWindowInMs,
              nextObj.createdAt,
            );
            timeWindowDataBody = getTimeWindowData(
              clonehistoryBody,
              timeWindowInMs,
              nextObj.createdAt,
            );
          } else {
            timeWindowDataBody = clonehistoryBody[clonehistoryBody.length];
            timeWindowDataHead = clonehistoryHead[clonehistoryHead.length];
          }
          if (appContext.global_logging) {
            console.log('cloneHistory & timeWindowData', {
              clonehistoryBody,
              clonehistoryHead,
              timeWindowDataBody,
              timeWindowDataHead,
            });
          }
          // https://statistics.laerd.com/statistical-guides/measures-central-tendency-mean-mode-median.php
          let centralTendencyBody;
          let centralTendencyHead;
          let centralTendencyDistance;
          let centralTendencyHeight;

          if (appContext.posenet_measurement === 'median') {
            centralTendencyHead = calcMedianForTimeWindow([
              ...timeWindowDataHead,
            ]); // returns anglevector
            centralTendencyBody = calcMedianForTimeWindow([
              ...timeWindowDataBody,
            ]);
            centralTendencyDistance = getCalibrationMedianTickObject(
              'shoulder',
              [...timeWindowDataBody],
            );
            centralTendencyHeight = getCalibrationMedianTickObject('shoulder', [
              ...timeWindowDataBody,
            ]);
          } else {
            centralTendencyHead = calcMeanForTimeWindow([
              ...timeWindowDataHead,
            ]);
            centralTendencyBody = calcMeanForTimeWindow(timeWindowDataBody);
            centralTendencyDistance = getCalibrationMeanTickObject('shoulder', [
              ...timeWindowDataBody,
            ]);
            centralTendencyHeight = getCalibrationMeanTickObject('shoulder', [
              ...timeWindowDataBody,
            ]);
          }
          // GET SIGN OF SCORES
          let signOfHead;
          let signOfBody;
          let signOfDistance;
          let signOfHeight;
          if (
            clonehistoryHead.length > 0 &&
            clonehistoryHead[clonehistoryHead.length - 1].angleOfVector
          ) {
            signOfHead =
              clonehistoryHead[clonehistoryHead.length - 1].angleOfVector;
          }
          if (
            clonehistoryBody.length > 0 &&
            clonehistoryBody[clonehistoryBody.length - 1].angleOfVector
          ) {
            signOfBody =
              clonehistoryBody[clonehistoryBody.length - 1].angleOfVector;
          }
          if (
            clonehistoryBody.length > 0 &&
            clonehistoryBody[clonehistoryBody.length - 1].meanY
          ) {
            signOfHeight =
              get(calibrationBodyTick, 'meanY', 0) -
              get(clonehistoryBody[clonehistoryBody.length - 1], 'meanY', 0);
          }
          if (
            clonehistoryBody.length > 0 &&
            clonehistoryBody[clonehistoryBody.length - 1].lengthOfVector
          ) {
            signOfDistance =
              get(calibrationBodyTick, 'lengthOfVector', 0) -
              get(
                clonehistoryBody[clonehistoryBody.length - 1],
                'lengthOfVector',
                0,
              );
          }
          setStateHeadSign(signOfHead);
          setStateBodySign(signOfBody);
          setStateHeightSign(signOfHeight);
          setStateDistanceSign(signOfDistance);
          if (appContext.global_logging) {
            console.log('centralTendency', {
              centralTendencyBody,
              centralTendencyHead,
              centralTendencyDistance,
              centralTendencyHeight,
            });
          }

          // TRIGGER OVERALL -BAD- TIMER by BODY
          if (
            timerBadBody.getTotalTimeValues().seconds >
            appContext.timer_timeUntilBadPosture
          ) {
            // START OVERALL -BAD- TIMER
            timerOverallBad.start({ precision: 'secondTenths' });
            // PAUSE OVERALL -GOOD- TIMER
            if (timerOverallGood.isRunning()) {
              timerOverallGood.pause();
            }
          }

          // TRIGGER OVERALL -BAD- TIMER by HEAD
          if (
            timerBadHead.getTotalTimeValues().seconds >
            appContext.timer_timeUntilBadPosture
          ) {
            // START OVERALL -BAD- TIMER
            timerOverallBad.start({ precision: 'secondTenths' });
            // PAUSE OVERALL -GOOD- TIMER
            if (timerOverallGood.isRunning()) {
              timerOverallGood.pause();
            }
          }

          // TRIGGER OVERALL -BAD- TIMER by DISTANCE
          if (
            timerBadDistance.getTotalTimeValues().seconds >
            appContext.timer_timeUntilBadPosture
          ) {
            // START OVERALL -BAD- TIMER
            timerOverallBad.start({ precision: 'secondTenths' });
            // PAUSE OVERALL -GOOD- TIMER
            if (timerOverallGood.isRunning()) {
              timerOverallGood.pause();
            }
          }

          // TRIGGER OVERALL -BAD- TIMER by HEIGHT
          if (
            timerBadHeight.getTotalTimeValues().seconds >
            appContext.timer_timeUntilBadPosture
          ) {
            // START OVERALL -BAD- TIMER
            timerOverallBad.start({ precision: 'secondTenths' });
            // PAUSE OVERALL -GOOD- TIMER
            if (timerOverallGood.isRunning()) {
              timerOverallGood.pause();
            }
          }

          // IF -BODY- and -HEAD- BAD POSTURE TIMERS & -DISTANCE- & -HEIGHT- TIMERS are less than THRESHOLD
          if (
            !(
              timerBadBody.getTotalTimeValues().seconds >
              appContext.timer_timeUntilBadPosture
            ) &&
            !(
              timerBadHead.getTotalTimeValues().seconds >
              appContext.timer_timeUntilBadPosture
            ) &&
            !(
              timerBadDistance.getTotalTimeValues().seconds >
              appContext.timer_timeUntilBadPosture
            ) &&
            !(
              timerBadHeight.getTotalTimeValues().seconds >
              appContext.timer_timeUntilBadPosture
            )
          ) {
            // PAUSE OVERALL -BAD- TIMER
            if (timerOverallBad.isRunning()) {
              timerOverallBad.pause();
            }
            // START OVERALL -GOOD- TIMER
            timerOverallGood.start({ precision: 'secondTenths' });
          }

          // TIMELINE
          const xState = ({
            name,
            value,
            threshold,
            timer,
            currentState,
            currentStateTimeStamp,
            cbCurrentStateTimeStamp,
            // cbWarning,
            cbChange,
            toastMsgSuccess,
            toastMsgDanger,
          }) => {
            let status = statesName.SUCCESS;
            // CALCULATE NEW STATUS
            if (value <= threshold) {
              timer.reset();
              status = statesName.SUCCESS;
            } else if (value > threshold) {
              timer.start({ precision: 'secondTenths' });
              if (
                timer.getTotalTimeValues().seconds >
                appContext.timer_timeUntilBadPosture
              ) {
                status = statesName.DANGER;
              } else {
                status = statesName.WARNING;
              }
            }
            // RUN ONLY IF STATUS CHANGED
            if (currentState !== status) {
              setTimelineData([
                ...timelineData,
                [
                  name,
                  currentState,
                  statesColourHex[currentState],
                  currentStateTimeStamp,
                  nextObj.createdAt,
                ],
              ]);
              cbCurrentStateTimeStamp(nextObj.createdAt);
              if (status) {
                if (
                  status &&
                  currentState === statesName.DANGER &&
                  status === statesName.SUCCESS
                ) {
                  showToast(toastMsgSuccess, Intent.SUCCESS);
                }
                if (status === statesName.DANGER) {
                  showToast(toastMsgDanger, Intent.DANGER);
                }
              }
              cbChange(status);
              // console.log("input",
              //   {
              //     value,
              //     threshold,
              //     timer,
              //     currentState,
              //     callback,
              //   },"output",
              //   { status },
              // );
            }
          };

          // RUN xSTATE ON ALL SCORES
          // HEAD
          xState({
            name: 'Head',
            value: centralTendencyHead,
            threshold: appContext.threshold_head,
            timer: timerBadHead,
            currentState: currentStateHead || statesName.SUCCESS,
            currentStateTimeStamp:
              currentStateHeadTimeStamp ||
              get(clonehistoryHead, '[0].createdAt', Date.now()),
            cbCurrentStateTimeStamp: setCurrentStateHeadTimeStamp,
            cbChange: setCurrentStateHead,
            toastMsgSuccess: 'Well done. Your head is well aligned now.',
            toastMsgDanger:
              'Misalignment of head detected. Correct posture if possible.',
          });
          // BODY
          xState({
            name: 'Body',
            value: centralTendencyBody,
            threshold: appContext.threshold_body,
            timer: timerBadBody,
            currentState: currentStateBody || statesName.SUCCESS,
            currentStateTimeStamp:
              currentStateBodyTimeStamp ||
              get(clonehistoryBody, '[0].createdAt', Date.now()),
            cbCurrentStateTimeStamp: setCurrentStateBodyTimeStamp,
            cbChange: setCurrentStateBody,
            toastMsgSuccess:
              'Misalignment of shoulders detected. Correct posture if possible.',
            toastMsgDanger: 'Well done. Your shoulders are well aligned now.',
          });
          // DISTANCE
          const centralTendencyDistanceLengthOfVector = Math.abs(
            get(calibrationBodyTick, 'lengthOfVector', 0) -
              get(centralTendencyDistance, 'lengthOfVector', 0),
          );
          xState({
            name: 'Distance',
            value: centralTendencyDistanceLengthOfVector,
            threshold: appContext.threshold_distance,
            timer: timerBadDistance,
            currentState: currentStateDistance || statesName.SUCCESS,
            currentStateTimeStamp:
              currentStateDistanceTimeStamp ||
              get(clonehistoryBody, '[0].createdAt', Date.now()),
            cbCurrentStateTimeStamp: setCurrentStateDistanceTimeStamp,
            cbChange: setCurrentStateDistance,
            toastMsgSuccess:
              'Well done. Your distance to the screen is okay now.',
            toastMsgDanger:
              'Bad distance to screen detected. Correct if possible.',
          });
          // HEIGHT
          const centralTendencyHeightMeanY = Math.abs(
            get(calibrationBodyTick, 'meanY', 0) -
              get(centralTendencyHeight, 'meanY', 0),
          );
          xState({
            name: 'Height',
            value: centralTendencyHeightMeanY,
            threshold: appContext.threshold_height,
            timer: timerBadHeight,
            currentState: currentStateHeight || statesName.SUCCESS,
            currentStateTimeStamp:
              currentStateHeightTimeStamp ||
              get(clonehistoryBody, '[0].createdAt', Date.now()),
            cbCurrentStateTimeStamp: setCurrentStateHeightTimeStamp,
            cbChange: setCurrentStateHeight,
            toastMsgSuccess: 'Well done. Your sitting height is okay now.',
            toastMsgDanger: 'Bad sitting height detected. Correct if possible.',
          });
          // SET STATE VALUES
          if (centralTendencyHead) {
            setStateHead(Number(centralTendencyHead).toFixed(2));
          }
          if (centralTendencyBody) {
            setStateBody(Number(centralTendencyBody).toFixed(2));
          }
          if (centralTendencyDistanceLengthOfVector) {
            setStateDistance(
              Number(centralTendencyDistanceLengthOfVector).toFixed(2),
            );
          }
          if (centralTendencyHeightMeanY) {
            setStateHeight(Number(centralTendencyHeightMeanY).toFixed(2));
          }
          // CHARTS
          if (appContext.posenet_charts) {
            const copyArr1 = [...chartDataEye];
            // CHART WINDOW OF HEAD
            // eslint-disable-next-line no-console
            if (copyArr1.length >= 50) {
              copyArr1.shift();
            }
            copyArr1.push({
              x: nextObj.createdAt,
              y: centralTendencyHead,
            });
            // CHART WINDOW OF BODY
            const copyArr2 = [...chartDataShoulder];
            // Chart window
            // eslint-disable-next-line no-console
            if (copyArr2.length >= 50) {
              copyArr2.shift();
            }
            copyArr2.push({
              x: nextObj.createdAt,
              y: centralTendencyBody,
            });
            // CHART WINDOW OF HEIGHT
            const copyArr3 = [...chartDataHeight];
            // CHART WINDOW OF HEAD
            // eslint-disable-next-line no-console
            if (copyArr3.length >= 50) {
              copyArr3.shift();
            }
            copyArr3.push({
              x: nextObj.createdAt,
              y: centralTendencyHeightMeanY,
            });
            // CHART WINDOW OF DISTANCE
            const copyArr4 = [...chartDataDistance];
            // CHART WINDOW OF HEAD
            // eslint-disable-next-line no-console
            if (copyArr4.length >= 50) {
              copyArr4.shift();
            }
            copyArr4.push({
              x: nextObj.createdAt,
              y: centralTendencyDistanceLengthOfVector,
            });
            // SET CHART DATA
            setChartDataEye(copyArr1);
            setChartDataShoulder(copyArr2);
            setChartDataHeight(copyArr3);
            setChartDataDistance(copyArr4);
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
    appContext.epoch_epochCount,
    appContext.epoch_epochMode,
    appContext.global_logging,
    appContext.posenet_charts,
    appContext.posenet_measurement,
    appContext.threshold_body,
    appContext.threshold_distance,
    appContext.threshold_head,
    appContext.threshold_height,
    appContext.timer_timeUntilBadPosture,
    calibrationBodyTick,
    chartDataDistance,
    chartDataEye,
    chartDataHeight,
    chartDataShoulder,
    currentStateBody,
    currentStateBodyTimeStamp,
    currentStateDistance,
    currentStateDistanceTimeStamp,
    currentStateHead,
    currentStateHeadTimeStamp,
    currentStateHeight,
    currentStateHeightTimeStamp,
    showToast,
    timelineData,
  ]);

  // LOG POSENET DATA
  useEffect(() => {
    const subscription = subject.subscribe({
      next: nextObj => {
        if (appContext.global_logging) {
          console.log(nextObj);
          if (nextObj.tick > 0) {
            historyHead[historyHead.length - 1].logData();
            historyBody[historyBody.length - 1].logData();
          }
        }
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appContext.global_logging]);

  const toggleScores = useCallback(() => {
    setShowScores(!showScores);
  }, [showScores]);

  const toggleTimers = useCallback(() => {
    setShowTimers(!showTimers);
  }, [showTimers]);

  const toggleTimeline = useCallback(() => {
    setShowTimeline(!showTimeline);
  }, [showTimeline]);

  const toggleHead = useCallback(() => {
    setShowHead(!showHead);
  }, [showHead]);

  return (
    <>
      {appContext.calibration_calibrationDataAvailable ? (
        <>
          <Portal>
            <VideoCanvas
              videoHeight={videoHeight}
              videoWidth={videoWidth}
              loading={loading}
            />
          </Portal>
          {/* TIMERS */}
          <div className="bg-gray-400 py-20">
            <div className="container px-6 mx-auto">
              <div className="mb-6 md:mb-12">
                <div className="flex flex-row items-center">
                  <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                    Timers
                  </h2>
                  <div className="flex flex-row ml-2 w-full">
                    <Tooltip
                      content={showTimers ? 'Hide timers' : 'Show timers'}
                      position={Position.BOTTOM}
                    >
                      <Button
                        className="bp3-minimal"
                        icon={showTimers ? 'eye-open' : 'eye-off'}
                        onClick={toggleTimers}
                      />
                    </Tooltip>
                  </div>
                </div>
                <p className="text-gray-600">Overview of your session</p>
              </div>

              <div className="flex flex-wrap -mx-6">
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <Tile
                    name="Session"
                    value={timerSession.getTimeValues().toString([
                      'hours',
                      'minutes',
                      'seconds',
                      // 'secondTenths',
                    ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Total session time"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <Tile
                    name="Good posture"
                    value={timerOverallGood.getTimeValues().toString([
                      'hours',
                      'minutes',
                      'seconds',
                      // 'secondTenths',
                    ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Overall good posture time within your session"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <Tile
                    name="Bad posture"
                    value={timerOverallBad.getTimeValues().toString([
                      'hours',
                      'minutes',
                      'seconds',
                      // 'secondTenths',
                    ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Overall bad posture time within your session"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* SCORES */}
          <div className="bg-white py-10 md:py-20">
            <div className="container px-6 mx-auto">
              <div className="mb-6 md:mb-12">
                <div className="flex flex-row items-center">
                  <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                    Scores
                  </h2>
                  <div className="flex flex-row ml-2 w-full">
                    <Tooltip
                      content={showScores ? 'Hide scores' : 'Show scores'}
                      position={Position.BOTTOM}
                    >
                      <Button
                        className="bp3-minimal"
                        icon={showScores ? 'eye-open' : 'eye-off'}
                        onClick={toggleScores}
                      />
                    </Tooltip>
                    <Button
                      icon="cube-add"
                      className="bp3-minimal"
                      disabled={isStarted || countDownIsFinished}
                      onClick={() => {
                        setRecalibrationIsRunning(true);
                        setIsStarted(true);
                      }}
                    >
                      Recalibrate
                    </Button>
                    {isStarted && !loading && !countDownIsFinished && (
                      <CountDownComponentMinimal
                        period={3}
                        callback={handleCountDown}
                      />
                    )}
                    {countDownIsFinished && (
                      <div className="w-32 h-full flex flex-row items-end">
                        <ProgressBar
                          value={progress}
                          intent={Intent.SUCCESS}
                          stripes
                          animate
                        />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-gray-600">Real-time BodyPose values</p>
              </div>

              <div className="flex flex-wrap -mx-6">
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <Tile
                    name="Distance"
                    value={Math.round(stateDistance)}
                    status={
                      currentStateDistance && states[currentStateDistance]
                    }
                    minimal={!showScores}
                    description="Changes in calibrated screen distance"
                    background={
                      <Graph
                        data={chartDataDistance}
                        // yDomain={[-50, 50]}
                        yDomain={[0, 250]}
                        loading={loading}
                        color={statesColourHex[currentStateDistance]}
                      />
                    }
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <Tile
                    name="Height"
                    value={Math.round(stateHeight)}
                    status={currentStateHeight && states[currentStateHeight]}
                    minimal={!showScores}
                    description="Changes in calibrated sitting height"
                    background={
                      <Graph
                        data={chartDataHeight}
                        // yDomain={[-50, 50]}
                        yDomain={[0, 250]}
                        loading={loading}
                        color={statesColourHex[currentStateHeight]}
                      />
                    }
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <Tile
                    name="Head"
                    value={Math.round(stateHead)}
                    status={currentStateHead && states[currentStateHead]}
                    minimal={!showScores}
                    description="Tilt angle of head [° degrees]"
                    background={
                      <Graph
                        data={chartDataEye}
                        // yDomain={[-50, 50]}
                        yDomain={[0, 60]}
                        loading={loading}
                        color={statesColourHex[currentStateHead]}
                      />
                    }
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <Tile
                    name="Body"
                    value={Math.round(stateBody)}
                    status={currentStateBody && states[currentStateBody]}
                    minimal={!showScores}
                    description="Tilt angle of shoulders [° degrees]"
                    background={
                      <Graph
                        data={chartDataShoulder}
                        // yDomain={[-50, 50]}
                        yDomain={[0, 60]}
                        loading={loading}
                        color={statesColourHex[currentStateBody]}
                      />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          {/* TIMELINE */}
          <div className="bg-white py-10 md:py-20">
            <div className="container px-6 mx-auto">
              <div className="mb-6 md:mb-12">
                <div className="flex flex-row items-center">
                  <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                    Timeline
                  </h2>
                  <div className="ml-2">
                    <Tooltip
                      content={showTimeline ? 'Hide timeline' : 'Show timeline'}
                      position={Position.BOTTOM}
                    >
                      <Button
                        className="bp3-minimal"
                        icon={showTimeline ? 'eye-open' : 'eye-off'}
                        onClick={toggleTimeline}
                      />
                    </Tooltip>
                  </div>
                </div>
                <p className="text-gray-600">Aggregated session data</p>
              </div>

              <div className="flex flex-wrap -mx-6">
                <div className="w-full px-4 py-4 xl:py-0">
                  <div
                    className={`rounded-lg shadow-xl text-center pt-${
                      !showTimeline ? '6' : '12'
                    } pb-6 bg-gradient-gray`}
                  >
                    {showTimeline === true && <Timeline data={timelineData} />}
                    <div className="flex flex-row justify-center items-center">
                      <Tooltip
                        content="Interactive timline of states"
                        position={Position.BOTTOM}
                      >
                        <div className="font-semibold text-gray-700">
                          Timeline
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* HEAD */}
          <div className="bg-white py-10 md:py-20">
            <div className="container px-6 mx-auto">
              <div className="mb-6 md:mb-12">
                <div className="flex flex-row items-center">
                  <h2 className="text-3xl font-bold text-gray-800 leading-tight">
                    Figures
                  </h2>
                  <div className="ml-2">
                    <Tooltip
                      content={showHead ? 'Hide head' : 'Show head'}
                      position={Position.BOTTOM}
                    >
                      <Button
                        className="bp3-minimal"
                        icon={showHead ? 'eye-open' : 'eye-off'}
                        onClick={toggleHead}
                      />
                    </Tooltip>
                  </div>
                </div>
                <p className="text-gray-600">
                  Graphical representation of your posture
                </p>
              </div>
              {/* DISTANCE & HEIGHT */}
              <div className="flex flex-wrap -mx-6">
                <div className="w-full md:w-1/2 px-4 py-4 xl:py-0">
                  <div
                    className={`rounded-lg shadow-xl text-center pt-${
                      !showHead ? '6' : '12'
                    } pb-6 bg-gradient-gray`}
                  >
                    {showHead === true && (
                      <div className="p-4">
                        {/* HEIGHT MINUS  */}
                        {Math.abs(stateHeightSign) >
                          appContext.threshold_height &&
                          stateHeightSign < 0 && (
                            <>
                              {/* DISTANCE MINUS */}
                              {Math.abs(stateDistanceSign) >
                                appContext.threshold_distance &&
                                stateDistanceSign < 0 && (
                                  <Figures.HeightMinusDistanceMinus className="h-48 mx-auto" />
                                )}
                              {/* DISTANCE NEUTRAL */}
                              {Math.abs(stateDistanceSign) <
                                appContext.threshold_distance && (
                                <Figures.HeightMinusDistanceNeutral className="h-48 mx-auto" />
                              )}
                              {/* DISTANCE PLUS */}
                              {Math.abs(stateDistanceSign) >
                                appContext.threshold_distance &&
                                stateDistanceSign > 0 && (
                                  <Figures.HeightMinusDistancePlus className="h-48 mx-auto" />
                                )}
                            </>
                          )}
                        {/* HEIGHT NEUTRAL */}
                        {Math.abs(stateHeightSign) <
                          appContext.threshold_height && (
                          <>
                            {/* DISTANCE MINUS */}
                            {Math.abs(stateDistanceSign) >
                              appContext.threshold_distance &&
                              stateDistanceSign < 0 && (
                                <Figures.HeightNeutralDistanceMinus className="h-48 mx-auto" />
                              )}
                            {/* DISTANCE NEUTRAL */}
                            {Math.abs(stateDistanceSign) <
                              appContext.threshold_distance && (
                              <Figures.HeightNeutralDistanceNeutral className="h-48 mx-auto" />
                            )}
                            {/* DISTANCE PLUS */}
                            {Math.abs(stateDistanceSign) >
                              appContext.threshold_distance &&
                              stateDistanceSign > 0 && (
                                <Figures.HeightNeutralDistancePlus className="h-48 mx-auto" />
                              )}
                          </>
                        )}
                        {/* HEIGHT PLUS */}
                        {Math.abs(stateHeightSign) >
                          appContext.threshold_height &&
                          stateHeightSign > 0 && (
                            <>
                              {/* DISTANCE MINUS */}
                              {Math.abs(stateDistanceSign) >
                                appContext.threshold_distance &&
                                stateDistanceSign < 0 && (
                                  <Figures.HeightPlusDistanceMinus className="h-48 mx-auto" />
                                )}
                              {/* DISTANCE NEUTRAL */}
                              {Math.abs(stateDistanceSign) <
                                appContext.threshold_distance && (
                                <Figures.HeightPlusDistanceNeutral className="h-48 mx-auto" />
                              )}
                              {/* DISTANCE PLUS */}
                              {Math.abs(stateDistanceSign) >
                                appContext.threshold_distance &&
                                stateDistanceSign > 0 && (
                                  <Figures.HeightPlusDistancePlus className="h-48 mx-auto" />
                                )}
                            </>
                          )}
                      </div>
                    )}
                    <div className="flex flex-row justify-center items-center">
                      <Tooltip
                        content="Interactive front view of head"
                        position={Position.BOTTOM}
                      >
                        <div className="font-semibold text-gray-700">
                          Distance & Height
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {/* HEAD & BODY */}
                <div className="w-full md:w-1/2 px-4 py-4 xl:py-0">
                  <div
                    className={`rounded-lg shadow-xl text-center pt-${
                      !showHead ? '6' : '12'
                    } pb-6 bg-gradient-gray`}
                  >
                    {showHead === true && (
                      <div className="p-4">
                        {/* HEAD LEFT  */}
                        {Math.abs(stateHeadSign) > appContext.threshold_head &&
                          stateHeadSign < 0 && (
                            <>
                              {/* BODY LEFT */}
                              {Math.abs(stateBodySign) >
                                appContext.threshold_body &&
                                stateBodySign < 0 && (
                                  <Figures.HeadLeftBodyLeft className="h-48 mx-auto" />
                                )}
                              {/* BODY NEUTRAL */}
                              {Math.abs(stateBodySign) <
                                appContext.threshold_body && (
                                <Figures.HeadLeftBodyNeutral className="h-48 mx-auto" />
                              )}
                              {/* BODY RIGHT */}
                              {Math.abs(stateBodySign) >
                                appContext.threshold_body &&
                                stateBodySign > 0 && (
                                  <Figures.HeadLeftBodyRight className="h-48 mx-auto" />
                                )}
                            </>
                          )}
                        {/* HEAD NEUTRAL */}
                        {Math.abs(stateHeadSign) <
                          appContext.threshold_head && (
                          <>
                            {/* BODY LEFT */}
                            {Math.abs(stateBodySign) >
                              appContext.threshold_body &&
                              stateBodySign < 0 && (
                                <Figures.HeadNeutralBodyLeft className="h-48 mx-auto" />
                              )}
                            {/* BODY NEUTRAL */}
                            {Math.abs(stateBodySign) <
                              appContext.threshold_body && (
                              <Figures.HeadNeutralBodyNeutral className="h-48 mx-auto" />
                            )}
                            {/* BODY RIGHT */}
                            {Math.abs(stateBodySign) >
                              appContext.threshold_body &&
                              stateBodySign > 0 && (
                                <Figures.HeadNeutralBodyRight className="h-48 mx-auto" />
                              )}
                          </>
                        )}
                        {/* HEAD RIGHT */}
                        {Math.abs(stateHeadSign) > appContext.threshold_head &&
                          stateHeadSign > 0 && (
                            <>
                              {/* BODY LEFT */}
                              {Math.abs(stateBodySign) >
                                appContext.threshold_body &&
                                stateBodySign < 0 && (
                                  <Figures.HeadRightBodyLeft className="h-48 mx-auto" />
                                )}
                              {/* BODY NEUTRAL */}
                              {Math.abs(stateBodySign) <
                                appContext.threshold_body && (
                                <Figures.HeadRightBodyNeutral className="h-48 mx-auto" />
                              )}
                              {/* BODY RIGHT */}
                              {Math.abs(stateBodySign) >
                                appContext.threshold_body &&
                                stateBodySign > 0 && (
                                  <Figures.HeadRightBodyRight className="h-48 mx-auto" />
                                )}
                            </>
                          )}
                      </div>
                    )}
                    <div className="flex flex-row justify-center items-center">
                      <Tooltip
                        content="Interactive front view of head"
                        position={Position.BOTTOM}
                      >
                        <div className="font-semibold text-gray-700">
                          Head & Shoulders
                        </div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-gray-400 flex flex-grow h-full">
          <div className="container px-6 mx-auto flex flex-col flex-grow h-full">
            <div className="bp3-non-ideal-state">
              <div className="bp3-non-ideal-state-visual">
                <span className="bp3-icon bp3-icon-cube-add"></span>
              </div>
              <h4 className="bp3-heading">BodyPose not yet calibrated</h4>
              <div>Calibrate to start now</div>
              <Calibration />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Loads a the camera to be used in the app
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
      _streamCopy.getVideoTracks()[0].stop();
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
      // check if intervall
      const timestamp = Date.now();
      const timeDiff = timestamp - lastExecution;
      const rest = timeDiff > posenetThreshold;
      // console.log({
      //   timestamp,
      //   lastExecution,
      //   posenetThreshold,
      //   timeDiff,
      //   rest,
      // });
      if (rest) {
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
          historyBody.push(tickObjectShoulder);
          historyHead.push(tickObjectEye);

          subject.next(rawPoseDataObject);
          subjectBody.next(tickObjectShoulder);
          subjectHead.next(tickObjectEye);
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

        lastExecution = Date.now();
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
