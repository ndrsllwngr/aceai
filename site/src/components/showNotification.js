import uuidv4 from 'uuid/v4';

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
export const showNotification = (
  title = 'Title',
  body = 'Body',
  tag = uuidv4(),
) => {
  if (typeof Notification !== 'undefined') {
    Notification.requestPermission(result => {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            tag,
            renotify: true,
            vibrate: [200, 100, 200, 100, 200, 100, 400],
            // icon: '../../../images/tab-illo.png',
          });
        });
      }
    });
  }
};
