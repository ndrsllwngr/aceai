/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Box } from 'rebass';
import { Icon, Intent, Tab, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import SEO from '../seo';

export const LandingPage = () => {
  return (
    <>
      <SEO title="Home" />
      <Container>
        <Row>
          <Col>
            <h1 className="bp3-heading" style={{ marginTop: '2rem' }}>
              Learn about BodyPose &amp; improve your posture
            </h1>
          </Col>
        </Row>
        <Row>
          <Col>
            <Tabs id="tabs" animate renderActiveTabPanelOnly large>
              <Tab
                id="about"
                title="About"
                panel={
                  <>
                    <h2 className="bp3-heading">What is BodyPose?</h2>
                    <p>
                      BodyPose is a web-app, which supports you maintaining a
                      healthy body posture. While working on computer screens,
                      we tend to relax our bodies and follow bad posture habits
                      subconsciously. BodyPose reminds you friendly on how to
                      realign your body and keeps you motivated working on your
                      alignment.
                    </p>
                  </>
                }
              />
              <Tab
                id="manual"
                title="Manual"
                panel={
                  <p>
                    Rapidly build beautiful and accessible experiences. The
                    Carbon kit contains all resources you need to get started.
                  </p>
                }
              />
              <Tab
                id="research"
                title="Research"
                panel={
                  <p>
                    Rapidly build beautiful and accessible experiences. The
                    Carbon kit contains all resources you need to get started.
                  </p>
                }
              />
            </Tabs>
          </Col>
        </Row>
        <Row>
          <InfoSection heading="The Principles">
            <InfoCard
              heading="BodyPose is Approved"
              body="It is based on the latest findings of scientific research. Furthermore we work with an expert in the medical field of orthopaedics in order to provide you only the best advice for your body."
              icon={<Icon intent={Intent.NONE} icon={IconNames.ASTERISK} />}
            />
            <InfoCard
              heading="BodyPose is Simple"
              body="All you need is a PC and a webcam. It is set up within seconds, no further gadgets are needed."
              icon={<Icon intent={Intent.NONE} icon={IconNames.LAYOUT_GRID} />}
            />
            <InfoCard
              heading="BodyPose is Precise"
              body="We work with Tensorflow's PoseNet Model in order to give you the most precise state of the art feedback for your body posture. It analyzes your alignment and a rule-based system evaluates the quality of your body pose."
              icon={<Icon intent={Intent.NONE} icon={IconNames.CALCULATOR} />}
            />
          </InfoSection>
        </Row>
      </Container>
    </>
  );
};

const InfoSection = props => (
  <Box>
    <section>
      <h3 className="bp3-heading">{props.heading}</h3>
      {props.children}
    </section>
  </Box>
);

const InfoCard = props => {
  const splitHeading = createArrayFromPhrase(props.heading);
  return (
    <Box>
      <article>
        <h4 className="bp3-heading">
          {`${splitHeading[0]} `}
          <strong>{splitHeading[1]}</strong>
        </h4>
        <p>{props.body}</p>
        {props.icon}
      </article>
    </Box>
  );
};

// Take in a phrase and separate the third word in an array
function createArrayFromPhrase(phrase) {
  const splitPhrase = phrase.split(' ');
  const thirdWord = splitPhrase.pop();
  return [splitPhrase.join(' '), thirdWord];
}