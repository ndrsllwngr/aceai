import React from 'react';
import SEO from '../../seo';
import { PoseNetCamera } from '../../PoseNetCamera/camera';
// import { useApp } from '../ctx-app';

export const Dashboard = () => {
  // const [appContext] = useApp();

  return (
    <>
      <SEO title="Dashboard" />
      <PoseNetCamera />
    </>
  );
};
