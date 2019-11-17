import React from "react"
// import { Link } from "gatsby"

// import Image from "../components/image"
import SEO from "../components/seo"

import { PoseNetCamera } from "../components/PoseNetCamera/camera";
import { ButtonAppBar } from '../components/appbar';

const IndexPage = () => (
  <>
    <ButtonAppBar />
    <PoseNetCamera />
    <SEO title="Body posture" />
    {/* <Link to="/page-2/">Go to page 2</Link> */}
  </>
)

export default IndexPage
