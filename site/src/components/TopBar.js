import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
// import IconButton from '@material-ui/core/IconButton';
// import MenuIcon from '@material-ui/icons/Menu';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { useApp } from './ctx-app';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    // backgroundColor: '#3f51b5',
    backgroundColor: '#fff',
    // backgroundImage: 'linear-gradient(to right, #017BDA, #09A6DC)',
    // backgroundRepeat: 'no-repeat',
    // backgroundPosition: '0 0',
    boxShadow: '0 2px 15px 0 rgba(92, 102, 139, 0.08)',
  },
  toolBar: {
    height: '48px',
    minHeight: '48px',
  },
  title: {
    flexGrow: 1,
    color: '#222222',
    fontWeight: 800,
  },
  label: {
    color: '#222222',
    fontSize: '15px',
    lineHeight: '24px',
  },
}));

export function TopBar() {
  const classes = useStyles();

  // const [state, setState] = React.useState({
  //   webCam: false
  // });
  const [appContext, setAppContext] = useApp();

  const handleChange = name => event => {
    setAppContext({ ...appContext, [name]: event.target.checked });
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolBar}>
          {/* <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            variant="subtitle2"
            component="h1"
            className={classes.title}
          >
            ACEAI - Body posture
          </Typography>
          <FormGroup row>
            <FormControlLabel
              classes={{ label: classes.label }}
              control={
                <Switch
                  checked={appContext.consoleLog}
                  onChange={handleChange('consoleLog')}
                  value="consoleLog"
                  color="primary"
                />
              }
              label="Console.log"
            />
            <FormControlLabel
              classes={{ label: classes.label }}
              control={
                <Switch
                  checked={appContext.charts}
                  onChange={handleChange('charts')}
                  value="charts"
                  color="primary"
                />
              }
              label="Charts"
            />

            <FormControlLabel
              classes={{ label: classes.label }}
              control={
                <Switch
                  checked={appContext.epochMode}
                  onChange={handleChange('epochMode')}
                  value="epochMode"
                  color="primary"
                />
              }
              label="Epoch mode"
            />
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
              label="Webcam"
            />
          </FormGroup>
          {/* <Button color="inherit">Login</Button> */}
        </Toolbar>
      </AppBar>
    </div>
  );
}
