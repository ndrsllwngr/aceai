import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';
import Avatar from '@material-ui/core/Avatar';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import Blur from '@material-ui/icons/BlurOn';

const useStyles = makeStyles({
  default: {
    // margin: 10,
    width: '48px',
    height: '48px',
    background: '#fff',
    color: 'black',
  },
  pinkAvatar: {
    // margin: 10,
    width: '48px',
    height: '48px',
    color: '#fff',
    background: red.A400,

    // backgroundColor: pink[500],
  },
  greenAvatar: {
    // margin: 10,
    width: '48px',
    height: '48px',
    color: '#fff',
    background: '#39927e',
    // backgroundColor: green[500],
  },
});

export const StatusIcon = ({ status }) => {
  const classes = useStyles();

  return (
    <>
      {status === 'good' && (
        <Avatar className={classes.greenAvatar}>
          <Check />
        </Avatar>
      )}
      {status === 'bad' && (
        <Avatar className={classes.pinkAvatar}>
          <Close />
        </Avatar>
      )}
      {status === 'default' && (
        <Avatar className={classes.default}>
          <Blur />
        </Avatar>
      )}
    </>
  );
};

StatusIcon.propTypes = {
  status: PropTypes.string.isRequired,
};
