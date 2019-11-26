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
import CssBaseline from '@material-ui/core/CssBaseline';
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
    color: '#222',
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

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: appContext.openDrawer,
        })}
      >
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            ACEAI - Body posture
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
              color="#222"
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
      </Drawer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
