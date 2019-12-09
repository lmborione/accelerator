import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import ForgeService from './services/forge/forge.service';
import ServiceManager from './services/manager.service';
import ObjectsService from './services/objects/objects.service';

import 'bootstrap/dist/css/bootstrap.min.css';

import * as serviceWorker from './serviceWorker';
import App from './App';

const forgeSrv = new ForgeService();
const objSrv = new ObjectsService();

ServiceManager.registerService(forgeSrv);
ServiceManager.registerService(objSrv);

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
