import React from 'react';
import { Timer } from 'easytimer.js';
import { TimerComponent } from './timer';

export default {
  title: 'Timer',
  component: TimerComponent,
};

export const Test = () => {
  const exampleTimer = new Timer();
  //   useEffect(() => {
  //     exampleTimer.start();
  //   }, [exampleTimer]);
  return <TimerComponent title="Title" timer={exampleTimer} />;
};
