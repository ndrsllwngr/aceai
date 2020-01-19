import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export const CountDownComponent = ({ period }) => {
  const [timeLeft, setTimeLeft] = useState(period);
  useEffect(() => {
    if (timeLeft > 0) {
      setTimeout(() => {
        if (timeLeft > 0) {
          setTimeLeft(timeLeft - 1);
        }
      }, 1000);
    }
  }, [timeLeft]);
  return (
    <>
      <div key={timeLeft} className="flex flex-col items-center">
        <motion.div animate={{ scale: 0.8 }}>
          <div className="flex flex-col items-center justify-center rounded bg-gray-100 w-16 h-16">
            <span className="text-gray-900">{timeLeft}</span>
          </div>
        </motion.div>
      </div>
    </>
  );
};

CountDownComponent.propTypes = {
  period: PropTypes.number,
};
