import React from 'react';
import PropTypes from 'prop-types';
import HeaderContainer from 'carbon-components-react/lib/components/UIShell/HeaderContainer';
import {
  // Content,
  Header as CarbonHeader,
  HeaderMenuButton,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  // SideNavMenu,
  // SideNavMenuItem,
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

const Fade16 = () => (
  <svg
    width="16"
    height="16"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <path d="M8.24 25.14L7 26.67a14 14 0 0 0 4.18 2.44l.68-1.88a12 12 0 0 1-3.62-2.09zm-4.05-7.07l-2 .35A13.89 13.89 0 0 0 3.86 23l1.73-1a11.9 11.9 0 0 1-1.4-3.93zm7.63-13.31l-.68-1.88A14 14 0 0 0 7 5.33l1.24 1.53a12 12 0 0 1 3.58-2.1zM5.59 10L3.86 9a13.89 13.89 0 0 0-1.64 4.54l2 .35A11.9 11.9 0 0 1 5.59 10zM16 2v2a12 12 0 0 1 0 24v2a14 14 0 0 0 0-28z" />
  </svg>
);

export const Header = ({ children }) => {
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
    <div className="container">
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <CarbonHeader aria-label="ACEAI BodyPose">
              <SkipToContent />
              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
              />
              <HeaderName element={Link} to="/app" href="/app" prefix="ACEAI">
                [BodyPose]
              </HeaderName>
              <HeaderGlobalBar>
                {/* <div className="appearance-status" aria-label="status">
                  <h3 className="header__h3">
                    Status: {appContext.webCam ? 'Running' : 'Paused'}
                  </h3>
                </div> */}
                <HeaderGlobalAction
                  aria-label="control"
                  onClick={handleChange('webCam')}
                >
                  {appContext.webCam ? <Stop20></Stop20> : <Power20></Power20>}
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Notifications"
                  onClick={() => {}}
                >
                  <Notification20 />
                </HeaderGlobalAction>
                {/* <HeaderGlobalAction
                  aria-label="App Switcher"
                  onClick={() => {}}
                >
                  <AppSwitcher20 />
                </HeaderGlobalAction> */}
              </HeaderGlobalBar>
              <SideNav
                aria-label="Side navigation"
                expanded={isSideNavExpanded}
              >
                <SideNavItems>
                  <SideNavLink
                    element={Link}
                    to="/app"
                    href="/app"
                    renderIcon={Fade16}
                  >
                    Landingpage
                  </SideNavLink>
                  <SideNavLink
                    element={Link}
                    to="/app/dashboard"
                    href="/app/dashboard"
                    renderIcon={Fade16}
                  >
                    Dashboard
                  </SideNavLink>
                  {/* <SideNavMenu renderIcon={Fade16} title="Settings">
                    <SideNavMenuItem>Link</SideNavMenuItem>
                    <SideNavMenuItem
                    // aria-current="page"
                    // href="javascript:void(0)"
                    >
                      Link
                    </SideNavMenuItem>
                    <SideNavMenuItem>Link</SideNavMenuItem>
                  </SideNavMenu> */}
                </SideNavItems>
              </SideNav>
            </CarbonHeader>
            {children}
          </>
        )}
      />
    </div>
  );
};

Header.propTypes = {
  children: PropTypes.node,
};
