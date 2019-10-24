/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_LAYERS = 'IMAGES_API:SET_LAYERS';

export const setLayers = (features, tiles) => ({
    type: SET_LAYERS,
    features,
    tiles
});
