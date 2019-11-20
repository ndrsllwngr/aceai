import React from 'react';
// import { Link } from "gatsby"

// import Image from "../components/image"
import SEO from '../components/seo';
import Layout from '../components/layout';
import { PoseNetCamera } from '../components/PoseNetCamera/camera';

const IndexPage = () => (
  <Layout>
    <SEO title="Body posture" />
    <PoseNetCamera />
    {/* <Link to="/page-2/">Go to page 2</Link> */}
  </Layout>
);

export default IndexPage;
