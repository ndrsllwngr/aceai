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
import { history, historyBody, historyHead } from '../PoseDetection/camera';
import {
  ObjectsToCsv,
  // convertToCSV,
  // downloadFile,
  // exportCSVFile,
} from '../PoseDetection/ObjectsToCsv';
// import { useApp } from '../../_context-app';
import { calibrationHead, calibrationBody } from '../PoseDetection/calibration';

export const Drawer = () => {
  const [uiContext, setUiContext] = useUi();
  const [appContext, setAppContext] = useApp();
  const handleDrawerSettingsIsOpen = val => () => {
    setUiContext({ ...uiContext, drawerSettingsIsOpen: val });
  };
  const resetAppContext = () => setAppContext(initialState);
  const handleMeasure = event => {
    setAppContext({ ...appContext, posenet_measurement: event.target.value });
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
            value={appContext.threshold_head}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('threshold_head')}
          />
          <p>Threshold of shoulder angle (° deg)</p>
          <Slider
            value={appContext.threshold_body}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('threshold_body')}
          />
          <p>Threshold of distance to screen</p>
          <Slider
            value={appContext.threshold_distance}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('threshold_distance')}
          />
          <p>Threshold of height variance</p>
          <Slider
            value={appContext.threshold_height}
            min={0}
            max={100}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('threshold_height')}
          />
          <div className="my-4">
            <Divider />
          </div>
          <p>Time frame of one epoch (tick)</p>
          <Slider
            value={appContext.epoch_epochCount}
            min={0}
            max={1000}
            labelStepSize={100}
            stepSize={10}
            onChange={handleAppContextChangeSlider('epoch_epochCount')}
          />
          <p>Time until bad posture triggers notification (sec)</p>
          <Slider
            value={appContext.timer_timeUntilBadPosture}
            min={0}
            max={60}
            labelStepSize={20}
            stepSize={1}
            onChange={handleAppContextChangeSlider('timer_timeUntilBadPosture')}
          />
          <div className="my-4">
            <Divider />
          </div>
          <p>PoseNet update threshold (ms)</p>
          <Slider
            value={appContext.posenet_threshold}
            min={0}
            max={1000}
            labelStepSize={100}
            stepSize={10}
            onChange={handleAppContextChangeSlider('posenet_threshold')}
          />
          <div className="my-4">
            <Divider />
          </div>
          <Switch
            label="Logging (consoleLog)"
            checked={appContext.global_logging}
            onChange={handleAppContextChange(
              'global_logging',
              !appContext.global_logging,
            )}
          />
          <Switch
            label="Calculate over time (epoch_epochMode)"
            checked={appContext.epoch_epochMode}
            onChange={handleAppContextChange(
              'epoch_epochMode',
              !appContext.epoch_epochMode,
            )}
          />
          <Switch
            label="Charts (posenet_charts)"
            checked={appContext.posenet_charts}
            onChange={handleAppContextChange(
              'posenet_charts',
              !appContext.posenet_charts,
            )}
          />
          <div className="my-4">
            <Divider />
          </div>
          <RadioGroup
            label="Measures of Central Tendency"
            onChange={handleMeasure}
            selectedValue={appContext.posenet_measurement}
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
                const csv = new ObjectsToCsv(historyHead);
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
                const csv = new ObjectsToCsv(historyBody);
                // Save to file:
                csv.toDisk('historyBody.csv');
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
                const csv = new ObjectsToCsv(calibrationHead);
                // const strCsv = csv.stringify();
                // // TODO use new function
                // const columnNames = [
                //   ...calibrationBody.reduce((columns, row) => {
                //     // check each object to compile a full list of column names
                //     Object.keys(row).map(rowKey => columns.add(rowKey));
                //     return columns;
                //   }, new Set()),
                // ];
                // exportCSVFile(columnNames, calibrationBody, 'calibrationBody');

                // downloadFile(strCsv, 'calibrationHead');
                // Save to file:
                csv.toDisk('calibrationHead.csv');
              }}
              intent={Intent.NONE}
            >
              calibrationHead
            </Button>
            <Button
              icon="download"
              onClick={() => {
                // const columnNames = [
                //   ...calibrationBody.reduce((columns, row) => {
                //     // check each object to compile a full list of column names
                //     Object.keys(row).map(rowKey => columns.add(rowKey));
                //     return columns;
                //   }, new Set()),
                // ];
                // exportCSVFile(columnNames, calibrationBody, 'calibrationBody');
                const csv = new ObjectsToCsv(calibrationBody);
                // Save to file:
                csv.toDisk('calibrationBody.csv');
              }}
              intent={Intent.NONE}
            >
              calibrationBody
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
