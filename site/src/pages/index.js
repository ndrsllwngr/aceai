import React from 'react';
import { Button } from 'carbon-components-react';
import { PoseNetCamera } from '../components/PoseNetCamera/camera';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { AppProvider } from '../components/ctx-app';

import './index.scss';

const IndexPage = () => {
  return (
    // <React.StrictMode>
    <AppProvider>
      <Layout>
        <SEO title="Home" />
        <Button>Button</Button>
        <PoseNetCamera />
      </Layout>
    </AppProvider>
    // </React.StrictMode>
  );
};

export default IndexPage;
