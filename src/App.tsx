import React, {useState, useEffect} from "react";
import "./styles.css";

const App = () => {
  const [count, setCount] = useState();
  let messageChannel: MessageChannel;

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

    //Broadcast API
    broadcast.onmessage = (event) => {
      setCount(event.data.payload);
    };
  }, []);

  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Message Channel
    navigator.serviceWorker.controller.postMessage({
      type: 'INCREASE_COUNT_MESSAGE',
    });
  };

  const handleBroadcastClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Broadcast API
    broadcast.postMessage({
      type: 'INCREASE_COUNT_BROADCAST',
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
    <div className="App">
      <button onClick={handleMessageClick}>Send MessageChannel message to service worker</button>
      <button onClick={handleBroadcastClick}>Send Broadcast API message to service worker</button>
      <button onClick={handleClientsClick}>Send Clients message to service worker</button>
      <h2>Counter: {count}</h2>
    </div>
  );
};

export default App;
