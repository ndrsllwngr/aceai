import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import { motion } from 'framer-motion';

// eslint-disable-next-line no-unused-vars
const useStyles = makeStyles(theme => ({
  root: {
    padding: '24px',
    borderRadius: '4px',
    margin: '12px',
    boxShadow: '0 0 0 1px rgba(63,63,68,0.05), 0 1px 3px 0 rgba(63,63,68,0.15)',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow:
        '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 5px 8px 0px rgba(0,0,0,0.14), 0px 1px 14px 0px rgba(0,0,0,0.12)',
    },
  },
}));

export const PaperSheet = ({ children }) => {
  const classes = useStyles();

  return (
    <motion.div whileHover={{ scale: 1.01 }}>
      <Paper className={classes.root}>{children}</Paper>
    </motion.div>
  );
};

PaperSheet.propTypes = {
  children: PropTypes.node,
};
