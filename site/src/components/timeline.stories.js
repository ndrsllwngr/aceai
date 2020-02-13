import React from 'react';
import { Timeline, timelineModel } from './timeline';
import { statesName, statesColourHex } from './enums';

export default {
  title: 'Timeline',
  component: Demo,
};

export const Demo = () => {
  return <Timeline data={dummyData} />;
};

const dummyData = [
  timelineModel,
  [
    'Head',
    statesName.DANGER,
    statesColourHex.DANGER,
    new Date(1580642894890),
    new Date(1580642902249),
  ],
  [
    'Head',
    statesName.SUCCESS,
    statesColourHex.SUCCESS,
    new Date(1580642902858),
    new Date(1580642906940),
  ],
  [
    'Distance',
    statesName.NEUTRAL,
    statesColourHex.NEUTRAL,
    new Date(1580642894890),
    new Date(1580642902249),
  ],
  [
    'Distance',
    statesName.DANGER,
    statesColourHex.DANGER,
    new Date(1580642902858),
    new Date(1580642906940),
  ],
  [
    'Shoulders',
    statesName.DANGER,
    statesColourHex.DANGER,
    new Date(1580642902858),
    new Date(1580642906940),
  ],
  [
    'Shoulders',
    statesName.WARNING,
    statesColourHex.WARNING,
    new Date(1580642894890),
    new Date(1580642902249),
  ],
  [
    'Height',
    statesName.DANGER,
    statesColourHex.DANGER,
    new Date(1580642902858),
    new Date(1580642906940),
  ],
  [
    'Height',
    statesName.DANGER,
    statesColourHex.DANGER,
    new Date(1580642894890),
    new Date(1580642902249),
  ],
];
