import React from 'react';
import { PoseNetCamera } from '../components/PoseNetCamera/camera';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { AppProvider } from '../components/ctx-app';

const IndexPage = () => {
  return (
    // <React.StrictMode>
    <AppProvider>
      <Layout>
        <SEO title="Home" />
        <PoseNetCamera />
      </Layout>
    </AppProvider>
    // </React.StrictMode>
  );
};

export default IndexPage;
