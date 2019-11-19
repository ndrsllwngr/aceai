import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
// import Typography from '@material-ui/core/Typography';

// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(theme => ({
  root: {
    padding: '24px',
    borderRadius: '4px',
    margin: '12px',
    boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
  },
}));

export const PaperSheet = ({ children }) => {
  const classes = useStyles();

  return <Paper className={classes.root}>{children}</Paper>;
};

PaperSheet.propTypes = {
  children: PropTypes.node,
};
