import React from 'react';
import { Timer } from 'easytimer.js';
import { TimerComponent } from './timer';

export default {
  title: 'Timer',
  component: TimerComponent,
};

export const Default = () => {
  const exampleTimer = new Timer();
  return <TimerComponent title="Title" timer={exampleTimer} />;
};
