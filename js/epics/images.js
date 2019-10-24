/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import isString from 'lodash/isString';
import { SET_LAYERS } from '../actions/images';
import { addLayer, removeLayer } from '@mapstore/actions/layers';
import uuidv1 from 'uuid/v1';
import { collectionUrlToLayer } from '../api/OGC';

const VECTOR_LAYER_ID = uuidv1();
const TILE_LAYER_ID = uuidv1();

export const vseInitImagesAPI = (action$) =>
    action$.ofType(SET_LAYERS)
        .switchMap((action) => {
            if (isString(action.tiles)) {
                return Rx.Observable
                    .defer(() => collectionUrlToLayer(action.tiles, ''))
                    .switchMap((tileLayer) => {
                        return Rx.Observable.of(
                            removeLayer(VECTOR_LAYER_ID),
                            removeLayer(TILE_LAYER_ID),
                            addLayer({
                                ...tileLayer,
                                id: TILE_LAYER_ID
                            }),
                            addLayer({
                                type: 'vector',
                                id: VECTOR_LAYER_ID,
                                features: action.features
                            })
                        );
                    });
            }
            return Rx.Observable.of(
                removeLayer(VECTOR_LAYER_ID),
                removeLayer(TILE_LAYER_ID),
                addLayer({
                    ...action.tiles,
                    id: TILE_LAYER_ID
                }),
                addLayer({
                    type: 'vector',
                    id: VECTOR_LAYER_ID,
                    features: action.features
                })
            );
        });
