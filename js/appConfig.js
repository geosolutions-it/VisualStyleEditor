/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import HomePage from './pages/Home';
import StylesAPIPage from './pages/StylesAPI';
import VisualStyleEditorPage from './pages/VisualStyleEditor';
import TilesAPIPage from './pages/TilesAPI';
import pluginsDef from './plugins';

export default {
    pages: [
        {
            name: 'home',
            path: '/',
            component: HomePage
        },
        {
            name: 'styles-api',
            path: '/styles-api',
            component: StylesAPIPage
        },
        {
            name: 'visual-style-editor',
            path: '/visual-style-editor',
            component: VisualStyleEditorPage
        },
        {
            name: 'tiles-api',
            path: '/tiles-api',
            component: TilesAPIPage
        }
    ],
    pluginsDef,
    initialState: {
        defaultState: {},
        mobile: {}
    }
};
