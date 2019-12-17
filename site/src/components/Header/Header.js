import React from 'react';
import {
  Header as CarbonHeader,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from 'carbon-components-react/lib/components/UIShell';
// import { Button } from 'carbon-components-react';
// import get from 'lodash/get';
import Notification20 from '@carbon/icons-react/lib/notification/20';
import Power20 from '@carbon/icons-react/lib/power/20';
import Stop20 from '@carbon/icons-react/lib/stop/20';
// import PlayFilledAlt20 from '@carbon/icons-react/lib/play--filled--alt/20';
// import StopFilledAlt20 from '@carbon/icons-react/lib/stop--filled--alt/20';
// import UserAvatar20 from '@carbon/icons-react/lib/user--avatar/20';
// import AppSwitcher20 from '@carbon/icons-react/lib/app-switcher/20';
import { Link } from 'gatsby';
import { useApp } from '../ctx-app';

export const Header = () => {
  const [appContext, setAppContext] = useApp();

  const handleChange = () => () => {
    setAppContext({ ...appContext, webCam: !appContext.webCam });
  };

  //   const handleToggle = name => () => {
  //     if (get(appContext, name, false)) {
  //       setAppContext({ ...appContext, [name]: false });
  //     } else {
  //       setAppContext({ ...appContext, [name]: true });
  //     }
  //   };
  return (
    <CarbonHeader aria-label="ACEAI BodyPose">
      <SkipToContent />
      <HeaderName element={Link} to="/app" href="/" prefix="ACEAI">
        [BodyPose]
      </HeaderName>
      <HeaderNavigation aria-label="Carbon Tutorial">
        <HeaderMenuItem element={Link} to="/app/dashboard" href="/dashboard">
          Dashboard
        </HeaderMenuItem>
      </HeaderNavigation>
      <HeaderGlobalBar>
        {/* <Toggle
          aria-label=""
          className="some-class"
          toggled={appContext.webCam}
          //   defaultToggled
          id="webCam"
          labelA="Off"
          labelB="On"
          labelText=""
          onChange={handleChange('webCam')}
          onToggle={handleChange('webCam')}
        /> */}
        <div className="appearance-status" aria-label="status">
          <h3 className="header__h3">
            Status: {appContext.webCam ? 'Running' : 'Paused'}
          </h3>
        </div>
        <HeaderGlobalAction
          aria-label="control"
          onClick={handleChange('webCam')}
        >
          {appContext.webCam ? <Stop20></Stop20> : <Power20></Power20>}
        </HeaderGlobalAction>
        <HeaderGlobalAction aria-label="Notifications">
          <Notification20 />
        </HeaderGlobalAction>
        {/* <HeaderGlobalAction aria-label="App Switcher">
          <AppSwitcher20 />
        </HeaderGlobalAction> */}
      </HeaderGlobalBar>
    </CarbonHeader>
  );
};
