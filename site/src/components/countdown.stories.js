import React from 'react';
import { CountDownComponent } from './countdown';
import '../pages/app.css';

export default {
  title: 'CountDownComponent',
  component: CountDownComponent,
};

const noop = () => {};

export const Default = () => {
  return <CountDownComponent period={10} callback={noop} />;
};
