/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// any CSS you import will output into a single css file (app.scss in this case)
import './styles/app.scss';
// import 'bootstrap/ /css/bootstrap.min.';
// import 'bootstrap/scss/bootstrap.scss';

import React from 'react';
import { render } from 'react-dom';
import ReactApp from "./js/components/ReactApp";

import { Provider } from "react-redux";
import store from "./js/redux/store";

import "./js/utils/utils";

// import '@fortawesome/fontawesome-free/js/all';

render(
    <Provider store={store}>
        <ReactApp />
    </Provider>, document.getElementById('root')
);
