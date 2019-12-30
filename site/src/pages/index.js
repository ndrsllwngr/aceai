/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Icon, Intent, Tab, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import SEO from '../components/seo';

const IndexPage = () => {
  return (
    <>
      <SEO title="Home" />
      <div className="container mx-auto">
        <div>
          <div>
            <h1 className="bp3-heading" style={{ marginTop: '2rem' }}>
              Learn about BodyPose &amp; improve your posture
            </h1>
          </div>
        </div>
        <div>
          <div>
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
          </div>
        </div>
        <div>
          <section>
            <div className="flex flex-row flex-wrap sm:flex-wrap mx-1 sm:mx-0">
              <div className="w-full sm:w-full md:w-1/4 mt-1">
                <h3 className="bp3-heading">The Principles</h3>
              </div>
              <InfoCard
                heading="BodyPose is Approved"
                body="It is based on the latest findings of scientific research. Furthermore we work with an expert in the medical field of orthopaedics in order to provide you only the best advice for your body."
                icon={<Icon intent={Intent.NONE} icon={IconNames.ASTERISK} />}
              />
              <InfoCard
                heading="BodyPose is Simple"
                body="All you need is a PC and a webcam. It is set up within seconds, no further gadgets are needed."
                icon={
                  <Icon intent={Intent.NONE} icon={IconNames.LAYOUT_GRID} />
                }
              />
              <InfoCard
                heading="BodyPose is Precise"
                body="We work with Tensorflow's PoseNet Model in order to give you the most precise state of the art feedback for your body posture. It analyzes your alignment and a rule-based system evaluates the quality of your body pose."
                icon={<Icon intent={Intent.NONE} icon={IconNames.CALCULATOR} />}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

const InfoCard = props => {
  const splitHeading = createArrayFromPhrase(props.heading);
  return (
    <div className="w-full sm:w-full md:w-1/4 mt-1">
      <article>
        <h4 className="bp3-heading">
          {`${splitHeading[0]} `}
          <strong>{splitHeading[1]}</strong>
        </h4>
        <p>{props.body}</p>
        {props.icon}
      </article>
    </div>
  );
};

// Take in a phrase and separate the third word in an array
function createArrayFromPhrase(phrase) {
  const splitPhrase = phrase.split(' ');
  const thirdWord = splitPhrase.pop();
  return [splitPhrase.join(' '), thirdWord];
}

export default IndexPage;
