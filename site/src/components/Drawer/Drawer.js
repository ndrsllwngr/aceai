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
} from '@blueprintjs/core';
import { useUi } from '../_context-ui';
import { useApp, initialState } from '../_context-app';
import { showNotification } from '../showNotification';
// import { useApp } from '../../_context-app';

export const Drawer = () => {
  const [uiContext, setUiContext] = useUi();
  const [appContext, setAppContext] = useApp();
  const handleDrawerIsOpen = val => () => {
    setUiContext({ ...uiContext, drawerIsOpen: val });
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
      isOpen={uiContext.drawerIsOpen}
      position={Position.RIGHT}
      usePortal
      onClose={handleDrawerIsOpen(false)}
    >
      <div className={Classes.DRAWER_BODY}>
        <div className={Classes.DIALOG_BODY}>
          <Button onClick={showToast} intent="primary">
            Trigger Notification
          </Button>
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
          <p>TIME FRAME (TICKS)</p>
          <Slider
            value={appContext.epochCount}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('epochCount')}
          />
          <p>Threshold (FRONT: Head)</p>
          <Slider
            value={appContext.thresholdFrontViewHead}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('thresholdFrontViewHead')}
          />
          <p>Threshold (FRONT: Body)</p>
          <Slider
            value={appContext.thresholdFrontViewBody}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('thresholdFrontViewBody')}
          />
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
          <Button onClick={resetAppContext} intent="danger">
            Reset App Settings
          </Button>
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
