/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Icon, Intent, Tab, Tabs } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import { useUi } from '../components/context-ui';
import SEO from '../components/seo';

const IndexPage = () => {
  const [uiContext] = useUi();

  return (
    <>
      <SEO title="About" />
      <div className="container mx-auto flex flex-col h-full">
        <div className="flex-grow flex-shrink-0" style={{ flexBasis: 'auto' }}>
          <div className="mx-1 my-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-4xl font-light leading-tight">
              Improve your posture{' '}
              <span className="sm:block font-normal">with BodyPose</span>
            </h1>
          </div>
          <div className="mx-1">
            <Tabs
              className="mt-0 p-4 bg-white rounded shadow"
              id="tabs"
              animate
              renderActiveTabPanelOnly
              large
              vertical={!uiContext.screenWidthSmallerThanSM}
            >
              <Tab
                id="about"
                title="About"
                panel={
                  <div className="pt-8 sm:pt-2 pb-6 pl-0 sm:pl-3">
                    <h2 className="font-normal leading-none text-2xl">
                      What is BodyPose?
                    </h2>
                    <p className="text-base mt-6 max-w-3xl">
                      BodyPose is a web-app, which supports you maintaining a
                      healthy body posture. While working on computer screens,
                      we tend to relax our bodies and follow bad posture habits
                      subconsciously. BodyPose reminds you friendly on how to
                      realign your body and keeps you motivated working on your
                      alignment.
                    </p>
                  </div>
                }
              />
              <Tab
                id="manual"
                title="Manual"
                panel={
                  <div className="pt-8 sm:pt-2 pb-6 pl-0 sm:pl-3">
                    <h2 className="font-normal leading-none text-2xl">
                      How does BodyPose work?
                    </h2>
                    <p className="text-base mt-6 max-w-3xl">tbd</p>
                  </div>
                }
              />
              <Tab
                disabled
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
          <section className="mx-1 my-10">
            <div className="flex flex-row flex-wrap sm:flex-wrap">
              <div className="w-full sm:w-full md:w-1/4 mt-1">
                <h3 className="font-normal leading-none text-2xl py-4">
                  The Principles
                </h3>
              </div>
              <div className="w-full sm:w-full md:w-3/4 p-4 bg-white rounded shadow">
                <div className="flex flex-row flex-wrap sm:flex-wrap">
                  <InfoCard
                    heading="BodyPose is Approved"
                    body="It is based on the latest findings of scientific research. Furthermore we work with an expert in the medical field of orthopaedics in order to provide you only the best advice for your body."
                    icon={
                      <Icon intent={Intent.NONE} icon={IconNames.ASTERISK} />
                    }
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
                    icon={
                      <Icon intent={Intent.NONE} icon={IconNames.CALCULATOR} />
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="mx-1 my-1 flex-shrink-0">
          <div className="flex flex-row justify-between text-gray-700 mb-10">
            <p className="font-normal"></p>
            <div>
              <a
                className="underline text-gray-700"
                href="https://www.mobile.ifi.lmu.de/lehrveranstaltungen/affective-computing-6/"
              >
                ACEAI
              </a>
              <span className="mx-2">•</span>
              <a
                className="underline text-gray-700"
                href="https://github.com/ndrsllwngr/aceai"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const InfoCard = props => {
  const splitHeading = createArrayFromPhrase(props.heading);
  return (
    <article className="w-full sm:w-full md:w-1/3 mt-1 flex flex-col justify-between md:pr-4">
      <div>
        <h4 className="font-normal text-lg leading-snug mb-3">
          {`${splitHeading[0]} `}
          <span className="font-semibold">{splitHeading[1]}</span>
        </h4>
        <p>{props.body}</p>
      </div>
      <div className="py-4">{props.icon}</div>
    </article>
  );
};

// Take in a phrase and separate the third word in an array
function createArrayFromPhrase(phrase) {
  const splitPhrase = phrase.split(' ');
  const thirdWord = splitPhrase.pop();
  return [splitPhrase.join(' '), thirdWord];
}

export default IndexPage;
