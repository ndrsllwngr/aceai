import uuidv4 from 'uuid/v4';

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
export const showNotification = (
  title = 'Title',
  body = 'Body',
  tag = uuidv4(),
  timestamp = Date.now(),
) => {
  if (typeof Notification !== 'undefined') {
    Notification.requestPermission(result => {
      if (result === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body,
            tag,
            timestamp,
            silent: false,
            actions: [
              {
                action: () => function() {},
                title: 'dismiss',
              },
            ],
            icon: './images/logo-icon.png',
          });
        });
      }
    });
  }
};
