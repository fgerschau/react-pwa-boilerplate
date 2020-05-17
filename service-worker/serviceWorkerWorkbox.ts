// / <reference lib="webworker" />
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { skipWaiting, clientsClaim } from 'workbox-core';

declare const self: Window & ServiceWorkerGlobalScope;

let getVersionPort: any;
let count = 0;

// same channel as in App.tsx
if ('BroadcastChannel' in navigator) {
  const broadcast = new BroadcastChannel('count-channel');
  broadcast.onmessage = (event) => {
    if (event.data && event.data.type === 'INCREASE_COUNT_BROADCAST') {
      broadcast.postMessage({ payload: ++count });
    }
  };
}

self.addEventListener('message', (event: MessageEvent) => {
  if (event.data && event.data.type === 'INIT_PORT') {
    [getVersionPort] = event.ports;
  }

  if (event.data && event.data.type === 'INCREASE_COUNT_MESSAGE') {
    getVersionPort.postMessage({ payload: ++count });
  }

  if (event.data && event.data.type === 'INCREASE_COUNT_CLIENTS') {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then((clients) => {
      if (clients && clients.length) {
        clients[0].postMessage({ type: 'REPLY_COUNT_CLIENTS', count: ++count });
      }
    });
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});

clientsClaim();

const precacheManifest = [].concat(self.__WB_MANIFEST || []);
precacheAndRoute(precacheManifest);

const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
});
registerRoute(navigationRoute);
