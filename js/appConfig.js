/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import get from 'lodash/get';

import HomePage from './pages/Home';
import StylesAPIPage from './pages/StylesAPI';
import VisualStyleEditorPage from './pages/VisualStyleEditor';
import TilesAPIPage from './pages/TilesAPI';
import ImagesAPIPage from './pages/ImagesAPI';
import pluginsDef from './plugins';

import emptyState from '@mapstore/components/misc/enhancers/emptyState';
const selector = createSelector(
    [
        state => get(state, 'browser')
    ], ({ ie }) => ({
        notSupported: ie
    })
);

const notSupportedScreen = compose(
    connect(selector),
    emptyState(({ notSupported }) => notSupported, {
        title: 'Browser not supported',
        glyph: 'exclamation-mark'
    })
);

export default {
    pages: [
        {
            name: 'home',
            path: '/',
            component: notSupportedScreen(HomePage)
        },
        {
            name: 'styles-api',
            path: '/styles-api',
            component: notSupportedScreen(StylesAPIPage)
        },
        {
            name: 'visual-style-editor',
            path: '/visual-style-editor',
            component: notSupportedScreen(VisualStyleEditorPage)
        },
        {
            name: 'tiles-api',
            path: '/tiles-api',
            component: notSupportedScreen(TilesAPIPage)
        },
        {
            name: 'images-api',
            path: '/images-api',
            component: notSupportedScreen(ImagesAPIPage)
        }
    ],
    pluginsDef,
    initialState: {
        defaultState: {},
        mobile: {}
    }
};
