/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const SET_METADATA = 'STYLESHEET:SET_METADATA';
export const SET_BACKGROUND = 'STYLESHEET:SET_BACKGROUND';

export const setMetadata = (metadata) => ({
    type: SET_METADATA,
    metadata
});

export const setBackground = (id, backgroundColor) => ({
    type: SET_BACKGROUND,
    id,
    backgroundColor
});
