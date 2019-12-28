import React, { useEffect } from 'react';
import { navigate } from '@reach/router';

const IndexPage = () => {
  useEffect(() => {
    navigate(`/app`);
  }, []);
  return <></>;
};

export default IndexPage;
