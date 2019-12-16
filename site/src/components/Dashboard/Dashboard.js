import React from 'react';
import { Button } from 'carbon-components-react';
import SEO from '../seo';
import { PoseNetCamera } from '../PoseNetCamera/camera';

export const Dashboard = () => {
  return (
    <>
      <SEO title="Dashboard" />
      <Button>Button</Button>
      <PoseNetCamera />
    </>
  );
};
