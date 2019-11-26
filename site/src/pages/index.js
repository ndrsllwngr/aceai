import React from 'react';
import { PoseNetCamera } from '../components/PoseNetCamera/camera';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { AppProvider } from '../components/ctx-app';

const IndexPage = () => {
  return (
    <AppProvider>
      <Layout>
        <SEO title="Home" />
        <PoseNetCamera />
      </Layout>
    </AppProvider>
  );
};

export default IndexPage;
