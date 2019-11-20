import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { useWebcam } from './ctx-webcam';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  appBar: {
    backgroundColor: '#3f51b5',
  },
  title: {
    flexGrow: 1,
  },
}));

export function TopBar() {
  const classes = useStyles();

  // const [state, setState] = React.useState({
  //   webCam: false
  // });
  const [webcamContext, setWebcamContext] = useWebcam();

  const handleChange = name => event => {
    setWebcamContext({ ...webcamContext, [name]: event.target.checked });
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            Body posture
          </Typography>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={webcamContext.webCam}
                  onChange={handleChange('webCam')}
                  value="webCam"
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
