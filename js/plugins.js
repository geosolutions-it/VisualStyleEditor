/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as BackgroundSelectorPlugin from '@mapstore/plugins/BackgroundSelector';
import * as CRSSelectorPlugin from '@mapstore/plugins/CRSSelector';
import * as LayoutPlugin from './plugins/Layout';
import * as MapPlugin from './plugins/Map';
import * as NavBarPlugin from './plugins/NavBar';
import TilesCatalogPlugin from './plugins/TilesCatalog';
import HomepagePlugin from './plugins/Homepage';
import AuthPlugin from './plugins/Auth';
import * as LayerSettingsPlugin from './plugins/LayerSettings';

import * as MapFooterPlugin from '@mapstore/plugins/MapFooter';
import * as StylesManagerPlugin from './plugins/StylesManager';
import * as TOCPlugin from '@mapstore/plugins/TOC';
import * as VisualStyleEditorPlugin from './plugins/VisualStyleEditor';
import * as StylesheetPlugin from './plugins/Stylesheet';
import * as ScaleBoxPlugin from '@mapstore/plugins/ScaleBox';
import * as ToolbarPlugin from '@mapstore/plugins/Toolbar';
import * as ZoomInPlugin from '@mapstore/plugins/ZoomIn';
import * as ZoomOutPlugin from '@mapstore/plugins/ZoomOut';

export default {
    plugins: {
        TOCPlugin,
        BackgroundSelectorPlugin,
        CRSSelectorPlugin,
        LayoutPlugin,
        MapPlugin,
        MapFooterPlugin,
        StylesManagerPlugin,
        VisualStyleEditorPlugin,
        StylesheetPlugin,
        ScaleBoxPlugin,
        NavBarPlugin,
        TilesCatalogPlugin,
        LayerSettingsPlugin,
        HomepagePlugin,
        AuthPlugin,
        ToolbarPlugin,
        ZoomInPlugin,
        ZoomOutPlugin
    },
    requires: {}
};
