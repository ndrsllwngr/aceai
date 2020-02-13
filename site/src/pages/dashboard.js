import React from 'react';
import SEO from '../components/seo';
import { PoseNetCamera } from '../components/PoseDetection/camera';

const Dashboard = () => {
  return (
    <>
      <SEO title="Dashboard | BodyPose - Break Slouching Habits." />
      <PoseNetCamera />
    </>
  );
};

export default Dashboard;
