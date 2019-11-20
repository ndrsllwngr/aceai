import React from 'react';
// import { Link } from "gatsby"

// import Image from "../components/image"
import SEO from '../components/SEO';
import Layout from '../components/Layout';
import { PoseNetCamera } from '../components/PoseNetCamera/camera';

const IndexPage = () => (
  <Layout>
    <PoseNetCamera />
    <SEO title="Body posture" />
    {/* <Link to="/page-2/">Go to page 2</Link> */}
  </Layout>
);

export default IndexPage;
