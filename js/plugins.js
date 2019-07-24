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
import * as MapPlugin from '@mapstore/plugins/Map';
import * as MapFooterPlugin from '@mapstore/plugins/MapFooter';
import * as MetadataExplorerPlugin from '@mapstore/plugins/MetadataExplorer';
import * as StylesManagerPlugin from './plugins/StylesManager';
import * as TOCPlugin from '@mapstore/plugins/TOC';

export default {
    plugins: {
        BackgroundSelectorPlugin,
        CRSSelectorPlugin,
        LayoutPlugin,
        MapPlugin,
        MapFooterPlugin,
        MetadataExplorerPlugin,
        StylesManagerPlugin,
        TOCPlugin
    },
    requires: {}
};
