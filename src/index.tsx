import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { register } from './ServiceWorker';

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);

register();
