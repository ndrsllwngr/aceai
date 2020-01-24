import React from 'react';
import {
  Button,
  Intent,
  Drawer as BluePrintDrawer,
  Position,
  RadioGroup,
  Radio,
  Classes,
  Switch,
  Slider,
  Divider,
  ButtonGroup,
} from '@blueprintjs/core';
import { useUi } from '../context-ui';
import { useApp, initialState } from '../context-app';
import { showNotification } from '../showNotification';
import { history, historyShoulder, historyEye } from '../PoseDetection/camera';
import { ObjectsToCsv } from '../PoseDetection/ObjectsToCsv';
// import { useApp } from '../../_context-app';
import {
  eyeCalibration,
  shoulderCalibration,
} from '../PoseDetection/calibration';

export const Drawer = () => {
  const [uiContext, setUiContext] = useUi();
  const [appContext, setAppContext] = useApp();
  const handleDrawerSettingsIsOpen = val => () => {
    setUiContext({ ...uiContext, drawerSettingsIsOpen: val });
  };
  const resetAppContext = () => setAppContext(initialState);
  const handleMeasure = event => {
    setAppContext({ ...appContext, measure: event.target.value });
  };
  const handleAppContextChangeSlider = property => val => {
    setAppContext({ ...appContext, [property]: val });
  };
  const handleAppContextChange = (property, value) => () => {
    setAppContext({ ...appContext, [property]: value });
  };
  const showToast = () => {
    if (uiContext.showNotificationInApp && uiContext.toasterRef.current) {
      uiContext.toasterRef.current.show({
        message: 'test',
        intent: Intent.PRIMARY,
      });
    }
    if (uiContext.showNotificationBrowser) {
      showNotification();
    }
  };
  return (
    <BluePrintDrawer
      autoFocus
      canEscapeKeyClose
      canOutsideClickClose
      isCloseButtonShown
      icon="cog"
      title="Settings"
      enforceFocus
      hasBackdrop
      isOpen={uiContext.drawerSettingsIsOpen}
      position={Position.RIGHT}
      usePortal
      onClose={handleDrawerSettingsIsOpen(false)}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          <p>Threshold of head angle (° deg)</p>
          <Slider
            value={appContext.thresholdFrontViewHead}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('thresholdFrontViewHead')}
          />
          <p>Threshold of shoulder angle (° deg)</p>
          <Slider
            value={appContext.thresholdFrontViewBody}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('thresholdFrontViewBody')}
          />
          <div className="my-4">
            <Divider />
          </div>
          <p>Time frame of one epoch (tick)</p>
          <Slider
            value={appContext.epochCount}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('epochCount')}
          />
          <p>Time until bad posture triggers notification (sec)</p>
          <Slider
            value={appContext.timeUntilBadPosture}
            min={0}
            max={60}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('timeUntilBadPosture')}
          />
          <div className="my-4">
            <Divider />
          </div>
          <Switch
            label="Logging (consoleLog)"
            checked={appContext.consoleLog}
            onChange={handleAppContextChange(
              'consoleLog',
              !appContext.consoleLog,
            )}
          />
          <Switch
            label="Calculate over time (epochMode)"
            checked={appContext.epochMode}
            onChange={handleAppContextChange(
              'epochMode',
              !appContext.epochMode,
            )}
          />
          <Switch
            label="Charts (epochchartsMode)"
            checked={appContext.charts}
            onChange={handleAppContextChange('charts', !appContext.charts)}
          />
          <div className="my-4">
            <Divider />
          </div>
          <RadioGroup
            label="Measures of Central Tendency"
            onChange={handleMeasure}
            selectedValue={appContext.measure}
          >
            <Radio label="Mean (Arithmetic)" value="mean" />
            <Radio label="Median" value="median" />
          </RadioGroup>
          <p>
            Read{' '}
            <a href="https://statistics.laerd.com/statistical-guides/measures-central-tendency-mean-mode-median.php">
              https://statistics.laerd.com/
            </a>{' '}
            for further information.
          </p>
          <div className="my-4">
            <Divider />
          </div>
          <p>Export session data as .csv</p>
          <ButtonGroup>
            <Button
              icon="download"
              onClick={() => {
                const csv = new ObjectsToCsv(history);
                // Save to file:
                csv.toDisk('rawData.csv');
              }}
              intent={Intent.NONE}
            >
              Source
            </Button>
            <Button
              icon="download"
              onClick={() => {
                const csv = new ObjectsToCsv(historyEye);
                // Save to file:
                csv.toDisk('historyHead.csv');
              }}
              intent={Intent.NONE}
            >
              Head
            </Button>
            <Button
              icon="download"
              onClick={() => {
                const csv = new ObjectsToCsv(historyShoulder);
                // Save to file:
                csv.toDisk('historyShoulder.csv');
              }}
              intent={Intent.NONE}
            >
              Shoulder
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button
              icon="download"
              onClick={() => {
                const csv = new ObjectsToCsv(eyeCalibration);
                // Save to file:
                csv.toDisk('eyeCalibration.csv');
              }}
              intent={Intent.NONE}
            >
              eyeCalibration
            </Button>
            <Button
              icon="download"
              onClick={() => {
                const csv = new ObjectsToCsv(shoulderCalibration);
                // Save to file:
                csv.toDisk('shoulderCalibration.csv');
              }}
              intent={Intent.NONE}
            >
              shoulderCalibration
            </Button>
          </ButtonGroup>
          <div className="my-4">
            <Divider />
          </div>
          <ButtonGroup>
            <Button onClick={showToast} intent={Intent.NONE}>
              Test browser notifications
            </Button>
            <Button onClick={resetAppContext} intent={Intent.DANGER}>
              Reset app context
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className={Classes.DRAWER_FOOTER}>
        <a href="https://www.mobile.ifi.lmu.de/lehrveranstaltungen/affective-computing-6/">
          ACEAI
        </a>{' '}
        2019/20
      </div>
    </BluePrintDrawer>
  );
};
