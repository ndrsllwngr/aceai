import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import MenuIcon from '@material-ui/icons/Menu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
// import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Drawer from '@material-ui/core/Drawer';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import { useApp } from './ctx-app';

import './layout.css';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    backgroundColor: '#fff',
    borderBottom: 'rgba(0, 0, 0, 0.12) solid 1px',
    boxShadow: 'none',
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: drawerWidth,
  },
  title: {
    flexGrow: 1,
    color: '#5f6368',
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },
  list: {
    width: '100%',
  },
  label: {
    color: '#222',
  },
}));

const Layout = ({ children }) => {
  const classes = useStyles();
  const theme = useTheme();

  const [appContext, setAppContext] = useApp();

  const handleChange = name => event => {
    setAppContext({ ...appContext, [name]: event.target.checked });
  };

  const handleToggle = name => () => {
    if (get(appContext, name, false)) {
      setAppContext({ ...appContext, [name]: false });
    } else {
      setAppContext({ ...appContext, [name]: true });
    }
  };

  const handleDrawerOpen = () => {
    setAppContext({ ...appContext, openDrawer: true });
  };

  const handleDrawerClose = () => {
    setAppContext({ ...appContext, openDrawer: false });
  };

  const handleSliderChange = (event, newValue) => {
    setAppContext({ ...appContext, epochCount: newValue });
  };

  const showNotification = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission(result => {
        if (result === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Update', {
              body: 'BodyPose experimental feature notification',
              icon: 'link-to-your-icon',
              vibrate: [200, 100, 200, 100, 200, 100, 400],
              tag: 'request',
              actions: [
                // you can customize these actions as you like
                {
                  // eslint-disable-next-line no-console
                  action: () => console.log('update'), // you should define this
                  title: 'update',
                },
                {
                  // eslint-disable-next-line no-console
                  action: () => console.log('ignore'), // you should define this
                  title: 'ignore',
                },
              ],
            });
          });
        }
      });
    }
  };

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: appContext.openDrawer,
        })}
      >
        <Toolbar>
          <Box width="40px" height="40px" marginBottom="3px">
            <svg
              viewBox="0 0 420 420"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M268.344 90.747c22.716 0 41.197 18.481 41.197 41.197 0 22.717-18.481 41.198-41.197 41.198-22.718 0-41.199-18.481-41.199-41.198 0-22.715 18.482-41.197 41.199-41.197zm0 18c-12.792 0-23.199 10.406-23.199 23.197 0 12.792 10.407 23.198 23.199 23.198 12.791 0 23.197-10.406 23.197-23.198.001-12.79-10.406-23.197-23.197-23.197zM118 376.077h27.405l.039.002a9 9 0 009-9V212.985l79.084-131.306 45.859-21.53a9 9 0 004.323-11.97c-2.112-4.501-7.476-6.437-11.972-4.322l-48.334 22.689a9.016 9.016 0 00-3.886 3.504l-81.785 135.79a9.001 9.001 0 00-1.291 4.644v147.594H118a9 9 0 00-9 9 8.999 8.999 0 009 8.999zm105.549-77.219a8.96 8.96 0 005.881 2.19 8.982 8.982 0 006.813-3.115l30.229-34.979a8.998 8.998 0 001.49-9.364l-29.486-70.332a8.999 8.999 0 00-3.265-3.98l-18.618-12.567a9 9 0 00-12.67 2.694l-28.762 46.072c-.04.063-.07.13-.108.194a9.133 9.133 0 00-.264.475 9.28 9.28 0 00-.161.334 8.643 8.643 0 00-.676 2.126 8.702 8.702 0 00-.077.506c-.015.121-.03.241-.04.363a9.114 9.114 0 00-.028.546c-.002.074-.011.146-.011.221V367.08a9 9 0 009 9l.039-.002h27.408a9 9 0 009-9 9 9 0 00-9-9h-18.446V222.82l22.457-35.973 8.661 5.847 26.291 62.711-26.582 30.759a9 9 0 00.925 12.694z"
                fill="#39927e"
              />
            </svg>
          </Box>
          <Typography variant="h6" noWrap className={classes.title}>
            BodyPose
            <Typography
              variant="overline"
              display="inline"
              style={{
                fontSize: '11px',
                letterSpacing: '0.33px',
                color: '#546e7a',
                marginLeft: '5px',
              }}
            >
              alpha
            </Typography>
          </Typography>

          <FormGroup row>
            <FormControlLabel
              classes={{ label: classes.label }}
              control={
                <Switch
                  checked={appContext.webCam}
                  onChange={handleChange('webCam')}
                  value="webCam"
                  color="primary"
                />
              }
              label="Power"
            />

            <IconButton
              color="default"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerOpen}
              className={clsx(appContext.openDrawer && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
          </FormGroup>
        </Toolbar>
      </AppBar>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: appContext.openDrawer,
        })}
      >
        <div className={classes.drawerHeader} />
        {children}
      </main>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="right"
        open={appContext.openDrawer}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </div>
        <Divider />
        <FormGroup row>
          <List classes={{ root: classes.list }}>
            <ListItem
              key="consoleLog"
              role={undefined}
              dense
              button
              onClick={handleToggle('consoleLog')}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={appContext.consoleLog}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': 'consoleLog' }}
                  color="primary"
                />
              </ListItemIcon>
              <ListItemText id="consoleLog" primary="Logging" />
            </ListItem>

            <ListItem
              key="charts"
              role={undefined}
              dense
              button
              onClick={handleToggle('charts')}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={appContext.charts}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': 'charts' }}
                  color="primary"
                />
              </ListItemIcon>
              <ListItemText id="charts" primary="Charts" />
            </ListItem>
            <Divider />
            <ListItem
              key="epochMode"
              role={undefined}
              dense
              button
              onClick={handleToggle('epochMode')}
            >
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={appContext.epochMode}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{ 'aria-labelledby': 'epochMode' }}
                  color="primary"
                />
              </ListItemIcon>
              <ListItemText id="epochMode" primary="Calculate over time" />
            </ListItem>
            <ListItem>
              <Box
                display="flex"
                alignItems="start"
                flexDirection="column"
                justifyContent="space-between"
                width="100%"
              >
                <Typography
                  variant="overline"
                  display="block"
                  style={{
                    fontSize: '11px',
                    lineHeight: '13px',
                    letterSpacing: '0.33px',
                    marginBottom: '8px',
                    color: '#546e7a',
                  }}
                >
                  Time frame (ticks)
                </Typography>

                <Slider
                  value={
                    typeof appContext.epochCount === 'number'
                      ? appContext.epochCount
                      : 0
                  }
                  onChange={handleSliderChange}
                  aria-labelledby="input-slider"
                  valueLabelDisplay="auto"
                />
              </Box>
            </ListItem>
          </List>
        </FormGroup>
        <Divider></Divider>
        <List classes={{ root: classes.list }}>
          <Box
            display="flex"
            alignItems="start"
            flexDirection="column"
            justifyContent="space-between"
            paddingLeft="16px"
            paddingRight="16px"
            width="100%"
          >
            <Typography
              variant="overline"
              display="block"
              style={{
                fontSize: '11px',
                lineHeight: '13px',
                letterSpacing: '0.33px',
                marginBottom: '8px',
                color: '#546e7a',
              }}
            >
              experimental
            </Typography>
          </Box>
          <ListItem
            key="testPush"
            role={undefined}
            dense
            button
            onClick={showNotification}
          >
            <ListItemText primary="Test notification" />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
