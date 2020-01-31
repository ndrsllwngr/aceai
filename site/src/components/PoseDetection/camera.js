/* eslint-disable func-names */
/* eslint-disable react/button-has-type */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import get from 'lodash/get';
import * as posenet from '@tensorflow-models/posenet';
import {
  Tag,
  Portal,
  Intent,
  Tooltip,
  Position,
  Button,
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
import { TimerComponent } from '../timer';
import { Widget, WidgetModern, states } from '../widget';
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
} from './calibration';
import { showNotification } from '../showNotification';

export const history = [];
const subject = new Subject();
export const historyBody = [];
const subjectBody = new Subject();
export const historyHead = [];
const subjectHead = new Subject();

const emptyState = { msg: 'Loading...', value: 0.0, status: 'default' };
// eslint-disable-next-line no-underscore-dangle
let _streamCopy = null;

export const PoseNetCamera = () => {
  // CONTEXT
  const [appContext, setAppContext] = useApp();
  const [uiContext, setUiContext] = useUi();

  // INTERNAL LOGIC
  const [loading, setLoading] = useState(false);
  const [showScores, setShowScores] = useState(true);
  const [showTimers, setShowTimers] = useState(true);

  // LATEST CALIBRATION DATA
  const [calibrationHeadTick, setcalibrationHeadTick] = useState();
  const [calibrationBodyTick, setcalibrationBodyTick] = useState();
  // LATEST STATES
  const [stateBody, setStateBody] = useState(emptyState);
  const [stateHeight, setStateHeight] = useState(emptyState);
  const [stateDistance, setStateDistance] = useState(emptyState);
  const [stateHead, setStateHead] = useState(emptyState);
  // CHART DATA
  const [chartDataShoulder, setChartDataShoulder] = useState([]);
  const [chartDataEye, setChartDataEye] = useState([]);

  // TIME LOGIC
  const [headPostureOverTimeIsBad, setHeadPostureOverTimeIsBad] = useState(
    false,
  );
  const [bodyPostureOverTimeIsBad, setBodyPostureOverTimeIsBad] = useState(
    false,
  );
  const [distanceOverTimeIsBad, setDistanceOverTimeIsBad] = useState(false);
  const [heightOverTimeIsBad, setHeightOverTimeIsBad] = useState(false);

  // WARNING
  const [headPostureOverTimeWarning, setHeadPostureOverTimeWarning] = useState(
    false,
  );
  const [bodyPostureOverTimeWarning, setBodyPostureOverTimeWarning] = useState(
    false,
  );
  const [distanceOverTimeWarning, setDistanceOverTimeWarning] = useState(false);
  const [heightOverTimeWarning, setHeightOverTimeWarning] = useState(false);

  // TODO: Add calibration functionality (button, calc D_c to mean of Y_(L-r))
  // TODO: Over time? Time counter!
  // TODO: ADD GANTT CHART maybe use https://github.com/hhru/react-d3-chart-graphs#GanttChart

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
        // timerSession.pause();
        setLoading(false);
        setStateBody(emptyState);
        setStateHead(emptyState);
        setStateDistance(emptyState);
        setStateHeight(emptyState);
        // setChartDataShoulder([]);
        // setChartDataEye([]);
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
          const clonehistoryBody = [...historyBody];
          const clonehistoryHead = [...historyHead];
          const timeWindowDataHead = getTimeWindowData(
            clonehistoryHead,
            3000,
            nextObj.createdAt,
          );
          const timeWindowDataBody = getTimeWindowData(
            clonehistoryBody,
            3000,
            nextObj.createdAt,
          );
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
          if (appContext.global_logging) {
            console.log('centralTendency', {
              centralTendencyBody,
              centralTendencyHead,
              centralTendencyDistance,
              centralTendencyHeight,
            });
          }
          // TODO MAYBE SET UUID HERE to prevent retriggering of notifications
          // TODO reset timers on unmount

          // TODO: # TIMERS

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
            // console.log('bad posture body (> 5 seconds)');
            // ANNOUNCE THAT -BODY- POSTURE is BAD
            setBodyPostureOverTimeIsBad(true);
            // ELSE ANNOUNCE THAT -BODY- POSTURE is GOOD
          } else {
            setBodyPostureOverTimeIsBad(false);
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
            // console.log('bad posture eye (> 5 seconds)');
            // ANNOUNCE THAT -HEAD- POSTURE is BAD
            setHeadPostureOverTimeIsBad(true);
            // ELSE ANNOUNCE THAT -HEAD- POSTURE is GOOD
          } else {
            setHeadPostureOverTimeIsBad(false);
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
            console.log('bad distance (> 5 seconds)');
            // ANNOUNCE THAT -DISTANCE- POSTURE is BAD
            setDistanceOverTimeIsBad(true);
            // ELSE ANNOUNCE THAT -DISTANCE- POSTURE is GOOD
          } else {
            console.log('good distance');
            setDistanceOverTimeIsBad(false);
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
            console.log('bad height (> 5 seconds)');
            // ANNOUNCE THAT -HEIGHT- is BAD
            setHeightOverTimeIsBad(true);
            // ELSE ANNOUNCE THAT -HEIGHT- is GOOD
          } else {
            setHeightOverTimeIsBad(false);
            console.log('good height');
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

          // TODO: # CALCULATIONS

          // IF CENTRAL TENDENCY OF -BODY- not within THRESHOLD
          if (centralTendencyBody > appContext.threshold_body) {
            // START -BAD- BODY TIMER
            timerBadBody.start({ precision: 'secondTenths' });
            setBodyPostureOverTimeWarning(true);
          } else {
            // RESET -BAD- BODY TIMER
            timerBadBody.reset();
            setBodyPostureOverTimeWarning(false);
          }

          // IF CENTRAL TENDENCY OF -HEAD- not within THRESHOLD
          if (centralTendencyHead > appContext.threshold_head) {
            // START -BAD- HEAD TIMER
            timerBadHead.start({ precision: 'secondTenths' });
            setHeadPostureOverTimeWarning(true);
          } else {
            // RESET -HEAD- BODY TIMER
            timerBadHead.reset();
            setHeadPostureOverTimeWarning(false);
          }

          // IF CENTRAL TENDENCY OF -DISTANCE- not within THRESHOLD
          if (
            Math.abs(
              get(calibrationBodyTick, 'lengthOfVector', 0) -
                get(centralTendencyDistance, 'lengthOfVector', 0),
            ) > appContext.threshold_distance
          ) {
            // START -BAD- DISTANCE TIMER
            timerBadDistance.start({ precision: 'secondTenths' });
            setDistanceOverTimeWarning(true);
          } else {
            // RESET -BAD- DISTANCE TIMER
            timerBadDistance.reset();
            setDistanceOverTimeWarning(false);
          }

          // IF CENTRAL TENDENCY OF -HEIGHT- not within THRESHOLD
          if (
            Math.abs(
              get(calibrationBodyTick, 'meanY', 0) -
                get(centralTendencyHeight, 'meanY', 0),
            ) > appContext.threshold_height
          ) {
            // START -BAD- HEIGHT TIMER
            timerBadHeight.start({ precision: 'secondTenths' });
            setHeadPostureOverTimeWarning(true);
          } else {
            // RESET -BAD- HEIGHT TIMER
            timerBadHeight.reset();
            setHeadPostureOverTimeWarning(false);
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
    appContext.global_logging,
    appContext.posenet_loading,
    appContext.posenet_measurement,
    appContext.threshold_body,
    appContext.threshold_distance,
    appContext.threshold_head,
    appContext.threshold_height,
    appContext.timer_timeUntilBadPosture,
    calibrationBodyTick,
  ]);

  // NOTIFICATION LOGIC of HEAD
  useEffect(() => {
    const showToast = (message = '', intent = Intent.PRIMARY) => {
      if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
        const toastObj = {
          message,
          intent,
        };
        console.log(toastObj);
        uiContext.toasterRef.current.show(toastObj);
      }
      if (uiContext.showNotificationBrowser) {
        showNotification(message);
      }
    };

    if (headPostureOverTimeIsBad) {
      showToast(
        'Misalignment of head detected. Correct posture if possible.',
        Intent.DANGER,
      );
    }
    if (
      timerSession.getTotalTimeValues().seconds > 0 &&
      !headPostureOverTimeIsBad
    ) {
      showToast('Well done. Your head is well aligned now.', Intent.SUCCESS);
    }
  }, [
    headPostureOverTimeIsBad,
    uiContext.showNotificationBrowser,
    uiContext.showNotificationInApp,
    uiContext.toasterRef,
  ]);

  // NOTIFICATION LOGIC of BODY
  useEffect(() => {
    const showToast = (message = '', intent = Intent.PRIMARY) => {
      if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
        const toastObj = {
          message,
          intent,
        };
        console.log(toastObj);
        uiContext.toasterRef.current.show(toastObj);
      }
      if (uiContext.showNotificationBrowser) {
        showNotification(message);
      }
    };

    if (bodyPostureOverTimeIsBad) {
      showToast(
        'Misalignment of body detected. Correct posture if possible.',
        Intent.DANGER,
      );
    }
    if (
      timerSession.getTotalTimeValues().seconds > 0 &&
      !bodyPostureOverTimeIsBad
    ) {
      showToast('Well done. Your body is well aligned now.', Intent.SUCCESS);
    }
  }, [
    bodyPostureOverTimeIsBad,
    uiContext.showNotificationBrowser,
    uiContext.showNotificationInApp,
    uiContext.toasterRef,
  ]);

  // NOTIFICATION LOGIC of DISTANCE
  useEffect(() => {
    const showToast = (message = '', intent = Intent.PRIMARY) => {
      if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
        const toastObj = {
          message,
          intent,
        };
        console.log(toastObj);
        uiContext.toasterRef.current.show(toastObj);
      }
      if (uiContext.showNotificationBrowser) {
        showNotification(message);
      }
    };

    if (distanceOverTimeIsBad) {
      showToast(
        'Bad distance to screen detected. Correct if possible.',
        Intent.DANGER,
      );
    }
    if (
      timerSession.getTotalTimeValues().seconds > 0 &&
      !distanceOverTimeIsBad
    ) {
      showToast(
        'Well done. Your distance to the scree is well now.',
        Intent.SUCCESS,
      );
    }
  }, [
    distanceOverTimeIsBad,
    uiContext.showNotificationBrowser,
    uiContext.showNotificationInApp,
    uiContext.toasterRef,
  ]);

  // NOTIFICATION LOGIC of HEIGHT
  useEffect(() => {
    const showToast = (message = '', intent = Intent.PRIMARY) => {
      if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
        const toastObj = {
          message,
          intent,
        };
        console.log(toastObj);
        uiContext.toasterRef.current.show(toastObj);
      }
      if (uiContext.showNotificationBrowser) {
        showNotification(message);
      }
    };

    if (heightOverTimeIsBad) {
      showToast(
        'Bad sitting height detected. Correct if possible.',
        Intent.DANGER,
      );
    }
    if (timerSession.getTotalTimeValues().seconds > 0 && !heightOverTimeIsBad) {
      showToast('Well done. Your sitting height is well now.', Intent.SUCCESS);
    }
  }, [
    heightOverTimeIsBad,
    uiContext.showNotificationBrowser,
    uiContext.showNotificationInApp,
    uiContext.toasterRef,
  ]);

  // TODO: # LOGIC FOR STATES

  // UPDATE STATUS & CHART of BODY
  useEffect(() => {
    const subscription = subjectBody.subscribe({
      next: nextObj => {
        if (Math.abs(nextObj.angleOfVector) > appContext.threshold_body) {
          setStateBody({
            msg: `Bad (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'bad',
          });
        } else {
          setStateBody({
            msg: `Good (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'good',
          });
        }
        // HEIGHT DIFF
        if (
          Math.abs(
            get(calibrationBodyTick, 'meanY', 0) - get(nextObj, 'meanY', 0),
          ) > appContext.threshold_height
        ) {
          setStateHeight({
            msg: `Bad (${nextObj.name})`,
            value: (
              get(calibrationBodyTick, 'meanY', 0) - get(nextObj, 'meanY', 0)
            ).toFixed(2),
            status: 'bad',
          });
        } else {
          setStateHeight({
            msg: `Good (${nextObj.name})`,
            value: (
              get(calibrationBodyTick, 'meanY', 0) - get(nextObj, 'meanY', 0)
            ).toFixed(2),
            status: 'good',
          });
        }
        // DISTANCE DIFF
        if (
          Math.abs(
            get(calibrationBodyTick, 'lengthOfVector', 0) -
              get(nextObj, 'lengthOfVector', 0),
          ) > appContext.threshold_distance
        ) {
          setStateDistance({
            msg: `Bad (${nextObj.name})`,
            value: (
              get(calibrationBodyTick, 'lengthOfVector', 0) -
              get(nextObj, 'lengthOfVector', 0)
            ).toFixed(2),
            status: 'bad',
          });
        } else {
          setStateDistance({
            msg: `Good (${nextObj.name})`,
            value: (
              get(calibrationBodyTick, 'lengthOfVector', 0) -
              get(nextObj, 'lengthOfVector', 0)
            ).toFixed(2),
            status: 'good',
          });
        }
        // PRINT data
        if (appContext.posenet_charts) {
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
    appContext.posenet_charts,
    appContext.threshold_body,
    appContext.threshold_distance,
    appContext.threshold_height,
    chartDataShoulder,
    calibrationBodyTick,
  ]);

  // UPDATE STATUS & CHART of HEAD
  useEffect(() => {
    const subscription = subjectHead.subscribe({
      next: nextObj => {
        if (Math.abs(nextObj.angleOfVector) > appContext.threshold_head) {
          setStateHead({
            msg: `Bad (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'bad',
          });
        } else {
          setStateHead({
            msg: `Good (${nextObj.name})`,
            value: nextObj.angleOfVector.toFixed(2),
            status: 'good',
          });
        }
        // PRINT data
        if (appContext.posenet_charts) {
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
  }, [appContext.posenet_charts, appContext.threshold_head, chartDataEye]);

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

  const toggleScores = () => {
    setShowScores(!showScores);
  };

  const toggleTimers = () => {
    setShowTimers(!showTimers);
  };

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
                  <div className="ml-2">
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
                <p className="text-gray-600">All event durations we track</p>
              </div>

              <div className="flex flex-wrap -mx-6">
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Session"
                    value={timerSession
                      .getTimeValues()
                      .toString([
                        'hours',
                        'minutes',
                        'seconds',
                        'secondTenths',
                      ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Overall session time"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Good posture"
                    value={timerOverallGood
                      .getTimeValues()
                      .toString([
                        'hours',
                        'minutes',
                        'seconds',
                        'secondTenths',
                      ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Overall good posture time within session"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Bad posture"
                    value={timerOverallBad
                      .getTimeValues()
                      .toString([
                        'hours',
                        'minutes',
                        'seconds',
                        'secondTenths',
                      ])}
                    status={states.NEUTRAL}
                    minimal={!showTimers}
                    description="Overall bad posture time within session"
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
                  <div className="ml-2">
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
                  </div>
                </div>
                <p className="text-gray-600">
                  All scores which are calculated in real-time
                </p>
              </div>

              <div className="flex flex-wrap -mx-6">
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Distance"
                    value={stateDistance.value}
                    status={(function() {
                      if (distanceOverTimeIsBad) {
                        return states.DANGER;
                      }
                      if (distanceOverTimeWarning) {
                        return states.WARNING;
                      }
                      return states.SUCCESS;
                    })()}
                    minimal={!showScores}
                    description="Distance deviation from calibration data distance between user and screen"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Height"
                    value={stateHeight.value}
                    status={(function() {
                      if (heightOverTimeIsBad) {
                        return states.DANGER;
                      }
                      if (heightOverTimeWarning) {
                        return states.WARNING;
                      }
                      return states.SUCCESS;
                    })()}
                    minimal={!showScores}
                    description="Sitting height deviation from calibration data"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Head"
                    value={stateHead.value}
                    status={(function() {
                      if (headPostureOverTimeIsBad) {
                        return states.DANGER;
                      }
                      if (headPostureOverTimeWarning) {
                        return states.WARNING;
                      }
                      return states.SUCCESS;
                    })()}
                    minimal={!showScores}
                    description="Tilt angle of head [° degrees]"
                  />
                </div>
                <div className="w-full md:w-1/2 xl:w-1/4 px-4 py-4 xl:py-0">
                  <WidgetModern
                    name="Body"
                    value={stateBody.value}
                    status={(function() {
                      if (bodyPostureOverTimeIsBad) {
                        return states.DANGER;
                      }
                      if (bodyPostureOverTimeWarning) {
                        return states.WARNING;
                      }
                      return states.SUCCESS;
                    })()}
                    minimal={!showScores}
                    description="Tilt angle of shoulders [° degrees]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="py-10 md:py-20">
            <div className="container px-6 mx-auto">
              <div className="w-full sm:w-full md:w-1/2 my-1 pl-0 md:pl-1">
                <Widget
                  title="Tilt angle of head and shoulders"
                  // tags={
                  //   <>
                  //     <Tag
                  //       intent={bodyPostureOverTimeIsBad ? 'danger' : 'success'}
                  //       style={{ marginRight: '0.5rem' }}
                  //     >
                  //       BODY {stateBody.value}°
                  //     </Tag>

                  //     <Tag
                  //       intent={headPostureOverTimeIsBad ? 'danger' : 'success'}
                  //     >
                  //       HEAD {stateHead.value}°
                  //     </Tag>
                  //   </>
                  // }
                >
                  <div className="p-4 h-48">
                    {Math.abs(stateHead.value) < appContext.threshold_head && (
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
                    {Math.abs(stateHead.value) > appContext.threshold_head &&
                      stateHead.value < 0 && (
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
                    {Math.abs(stateHead.value) > appContext.threshold_head &&
                      stateHead.value > 0 && (
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
              <div className="w-full sm:w-full md:w-1/2 my-1 pr-0 md:pr-1">
                <Widget
                  title="History of head tilt angle"
                  caption="in real-time"
                >
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
          </div>
        </>
      ) : (
        <div className="bp3-non-ideal-state">
          <div className="bp3-non-ideal-state-visual">
            <span className="bp3-icon bp3-icon-cube-add"></span>
          </div>
          <h4 className="bp3-heading">No calibration data found</h4>
          <div>Calibrate the app to start.</div>
          <Calibration />
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
