/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import StylesList from './pages/StylesList';
import MapViewer from '@mapstore/product/pages/MapViewer';
import pluginsDef from './plugins';

export default {
    pages: [{
        name: "styles-list",
        path: "/",
        component: StylesList
    }, {
        name: "mapviewer",
        path: "/:mapId",
        component: MapViewer
    }],
    pluginsDef,
    initialState: {
        defaultState: {},
        mobile: {}
    }
};
