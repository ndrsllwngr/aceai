import React from 'react';
import { Intent, AnchorButton } from '@blueprintjs/core';

import SEO from '../components/seo';

const NotFoundPage = () => (
  <>
    <SEO title="404: Not found | BodyPose - Break Slouching Habits." />
    <div className="bg-gray-400 flex flex-grow h-full">
      <div className="container px-6 mx-auto flex flex-col flex-grow h-full">
        <div className="bp3-non-ideal-state">
          <div className="bp3-non-ideal-state-visual">
            <span className="bp3-icon bp3-icon-zoom-out"></span>
          </div>
          <h4 className="bp3-heading">Page not found</h4>
          <div>Sorry this site does not exist.</div>
          <AnchorButton href="/" intent={Intent.PRIMARY}>
            Go to Home
          </AnchorButton>
        </div>
      </div>
    </div>
  </>
);

export default NotFoundPage;
