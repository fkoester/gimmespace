import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import reportWebVitals from './reportWebVitals';
import { store, persistor } from './store'
import routes from './routes'
import browserHistory from './history'

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <React.StrictMode>
        {routes(browserHistory)}
      </React.StrictMode>
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
