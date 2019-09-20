/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    SET_METADATA,
    SET_BACKGROUND
} from '../actions/stylesheet';

function stylesheet(state = {}, action) {
    switch (action.type) {
    case SET_METADATA:
        return {
            ...state,
            metadata: action.metadata
        };
    case SET_BACKGROUND:
        return {
            ...state,
            metadata: (state.metadata || []).map((metadata) => metadata.id === action.id
                ? { ...metadata, backgroundColor: action.backgroundColor }
                : metadata)
        };
    default:
        return state;
    }
}

export default stylesheet;

