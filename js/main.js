/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import LocaleUtils from '@mapstore/utils/LocaleUtils';
import StandardApp from '@mapstore/components/app/StandardApp';
import { setSupportedLocales } from '@mapstore/epics/localconfig';
import StandardStore from '@mapstore/stores/StandardStore';
import Router from '@mapstore/components/app/StandardRouter';
import maptype from '@mapstore/reducers/maptype';

export default (config, pluginsDef) => {
    const startApp = () => {
        const {pages, initialState, storeOpts, appEpics = {}, themeCfg} = config;

        const StandardRouter = connect((state) => ({
            locale: state.locale || {},
            pages
        }))(Router);

        const appStore = StandardStore.bind(null, initialState, {
            maptype
        }, {
            ...appEpics,
            setSupportedLocales
        });

        const initialActions = [];

        const appConfig = {
            storeOpts,
            appEpics,
            appStore,
            pluginsDef,
            initialActions,
            appComponent: StandardRouter,
            printingEnabled: true,
            themeCfg
        };

        ReactDOM.render(
            <StandardApp {...appConfig}/>,
            document.getElementById('container')
        );
    };

    if (!global.Intl ) {
        // Ensure Intl is loaded, then call the given callback
        LocaleUtils.ensureIntl(startApp);
    } else {
        startApp();
    }
};
