import React, { useState, useEffect } from 'react';
import './styles.scss';
import { Button, createMuiTheme, ThemeProvider } from '@material-ui/core';

import { red } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#066ace',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#EBEBEB',
    },
  },
});

const App = () => {
  const [count, setCount] = useState();
  let messageChannel: MessageChannel;

  let handleBroadcastClick: (e: React.MouseEvent) => void = () => undefined;
  if ('BroadcastChannel' in navigator) {
    const broadcast = new BroadcastChannel('count-channel');
    useEffect(() => {
      navigator.serviceWorker.onmessage = (event) => {
        if (event.data && event.data.type === 'REPLY_COUNT_CLIENTS') {
          setCount(event.data.count);
        }
      };

      navigator.serviceWorker.ready.then((registration) => {
      // MessageChannel
        messageChannel = new MessageChannel();
        registration.active.postMessage({
          type: 'INIT_PORT',
        }, [messageChannel.port2]);
        messageChannel.port1.onmessage = (event: MessageEvent) => {
          setCount(event.data.payload);
        };
      });

      // Broadcast API
      broadcast.onmessage = (event) => {
        setCount(event.data.payload);
      };
    }, []);

    handleBroadcastClick = (e: React.MouseEvent) => {
      e.preventDefault();

      // Broadcast API
      broadcast.postMessage({
        type: 'INCREASE_COUNT_BROADCAST',
      });
    };
  }

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Message Channel
    navigator.serviceWorker.controller.postMessage({
      type: 'INCREASE_COUNT_MESSAGE',
    });
  };

  const handleClientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Message Channel
    navigator.serviceWorker.controller.postMessage({
      type: 'INCREASE_COUNT_CLIENTS',
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="app">
        <h1>How to communicate with Service Workers</h1>
        <h3>Increment the counter of the Service Worker via...</h3>
        <div className="wrapper">
          <Button variant="contained" color="primary" onClick={handleMessageClick}>MessageChannel</Button>
          <Button variant="contained" color="primary" onClick={handleBroadcastClick}>Broadcast API</Button>
          <Button variant="contained" color="primary" onClick={handleClientsClick}>Clients API</Button>

          <h2 className="counter">
            Counter:
            {count}
          </h2>
        </div>
        <footer>
          Full tutorial&nbsp;
          <a href="https://felixgerschau.com/how-to-communicate-with-service-workers">here</a>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default App;
