import React from 'react';
import { CountDownComponent } from './countdown';
import '../pages/app.css';

export default {
  title: 'CountDownComponent',
  component: CountDownComponent,
};

export const Test = () => {
  //   const exampleTimer = new Timer();
  //   useEffect(() => {
  //     exampleTimer.start();
  //   }, [exampleTimer]);
  return <CountDownComponent period={10} />;
};
