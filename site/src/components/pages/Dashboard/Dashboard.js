import React from 'react';
import SEO from '../../seo';
import { PoseNetCamera } from '../../PoseNetCamera/camera';

export const Dashboard = () => {
  return (
    <>
      <SEO title="Dashboard" />
      <PoseNetCamera />
    </>
  );
};
