import React from "react"
// import { Link } from "gatsby"

// import Image from "../components/image"
import SEO from "../components/seo"
import Layout from '../components/layout';
import { PoseNetCamera } from "../components/PoseNetCamera/camera";
import { WebcamProvider } from '../components/useWebcam';

const IndexPage = () => (
  <WebcamProvider>
    <Layout>
      <PoseNetCamera />
      <SEO title="Body posture" />
      {/* <Link to="/page-2/">Go to page 2</Link> */}
    </Layout>
  </WebcamProvider>
)

export default IndexPage
