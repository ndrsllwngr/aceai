import React from 'react';
// import { Link } from "gatsby"
// import Button from '@material-ui/core/Button';

// import Image from "../components/image"
import { PoseNetCamera } from '../components/PoseNetCamera/camera';
import SEO from '../components/seo';
import Layout from '../components/layout';
import { AppProvider } from '../components/ctx-app';

// TODO add notifications (example down below is working)
// const showNotification = () => {
//   console.log('run notifications!');
//   Notification.requestPermission(result => {
//     if (result === 'granted') {
//       navigator.serviceWorker.ready.then(registration => {
//         registration.showNotification('Update', {
//           body: 'New content is available!!',
//           icon: 'link-to-your-icon',
//           vibrate: [200, 100, 200, 100, 200, 100, 400],
//           tag: 'request',
//           actions: [
//             // you can customize these actions as you like
//             {
//               action: () => console.log('update'), // you should define this
//               title: 'update',
//             },
//             {
//               action: () => console.log('ignore'), // you should define this
//               title: 'ignore',
//             },
//           ],
//         });
//       });
//     }
//   });
// };

// eslint-disable-next-line no-lone-blocks
{
  /* <Button
  variant="contained"
  style={{ margin: '12px' }}
  onClick={() => showNotification()}
>
  Test me!
</Button>; */
}

const IndexPage = () => {
  return (
    <AppProvider>
      <Layout>
        <SEO title="Home" />
        <PoseNetCamera />
      </Layout>
    </AppProvider>
  );
};

export default IndexPage;
