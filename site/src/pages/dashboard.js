import React from 'react';
import SEO from '../components/seo';
import { PoseNetCamera } from '../components/PoseDetection/camera';

const Dashboard = () => {
  return (
    <>
      <SEO title="Dashboard" />
      <PoseNetCamera />
    </>
  );
};

export default Dashboard;
