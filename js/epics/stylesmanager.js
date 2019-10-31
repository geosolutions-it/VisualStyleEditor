/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Rx from 'rxjs';
import axios from 'axios';
import get from 'lodash/get';
import head from 'lodash/head';
import { MAP_CONFIG_LOADED } from '@mapstore/actions/config';
import { LOCATION_CHANGE } from 'react-router-redux';
import uuidv1 from 'uuid/v1';
import { addLayer } from '@mapstore/actions/layers';
import { setControlProperty } from '@mapstore/actions/controls';
import { setMetadata } from '../actions/stylesheet';
import { getBackgroundColor } from '../utils/StyleParser';
import { splitStyleSheet, mimeTypeToStyleFormat } from '@mapstore/utils/VectorStyleUtils';
import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';
import { collectionUrlToLayer, getCollections } from '../api/OGC';

const parseStyle = (styleMetadata, collections) => {
    const collectionsNameWorkspace = collections.map((collection) => {
        const splitName = collection.id.split(/\:/);
        const workspace = splitName[1] !== undefined && splitName[0];
        const name = splitName.length > 1 ? splitName[1] : splitName[0];
        return {
            ...collection,
            workspace,
            name
        };
    });
    const { layers = [], stylesheets = [] } = styleMetadata || {};
    const stylesUrls = stylesheets
        .map(({ link }) => {
            return link && link.href;
        })
        .filter(val => val);
    const layersUrls = layers
        .map(({ id, type }) => {
            const { links = [] } = collectionsNameWorkspace.find(({ name }) => name === id) || {};
            const layerUrl = (links.find(({ rel, type: mimeType }) =>
                rel === 'collection' && mimeType === 'application/json'
                || rel === 'self' && mimeType === undefined) || {}).href;
            if (!layerUrl) return null;
            return {
                id,
                styleLayerName: id,
                layerUrl,
                layerType: type,
                ...(type === 'raster' && { _v_: Math.random() })
            };
        })
        .filter(val => val);

    return axios.all(
        [
            ...stylesUrls.map((url) =>
                axios.get(url)
                    .then(({ data }) => data)
                    .catch(() => null)
            ),
            ...layersUrls.map(({ layerUrl, styleLayerName, layerType }) =>
                collectionUrlToLayer(layerUrl)
                    .then(layer => ({
                        ...layer,
                        styleLayerName,
                        layerType
                    }))
                    .catch(() => null)
            )
        ]
    )
        .then((response) => ({
            styleMetadata,
            layers: response.filter((res, idx) => idx >= stylesUrls.length),
            styles: response.filter((res, idx) => idx < stylesUrls.length)
                .map((styleBody, idx) => ({
                    ...stylesheets[idx],
                    styleBody
                }))
        }));
};

const updateStyle = (style) => {
    if (style && style.layers) return new Promise((resolve) => resolve(style));
    const describedBy = head(style.links
        .filter(({ rel, type }) => rel === 'describedBy' && type === 'application/json' || rel === 'describedBy' && type === undefined)
        .map(({ href }) => href));
    return axios.get(describedBy)
        .then(({ data }) => ({ ...style, ...data }))
        .catch(() => ({ ...style, error: true }));
};

const setupLayer = (layer, availableStyles, styleMetadata) => {
    const style = head(availableStyles.filter(({ native }) => native));
    const vectorStyleParam = {
        vectorStyle: {
            body: style.styleBody,
            format: style.format
        }
    };
    const tileUrls = layer.layerType === 'raster'
        ? layer.tileUrls
        : layer.tileUrls.filter(({ format }) => isVectorFormat(format));
    const { format } = (
        tileUrls.find((tileUrl) => tileUrl.format === 'image/png' || tileUrl.format === 'image/png8')
        || tileUrls.find((tileUrl) => tileUrl.format === 'application/vnd.mapbox-vector-tile')
        || tileUrls[0]
        || {});

    return {
        ...layer,
        group: styleMetadata.id,
        tileUrls,
        format,
        visualStyleEditor: {
            styleMetadataId: styleMetadata.id,
            style: styleMetadata.id,
            availableStyles
        },
        style: styleMetadata.id,
        ...vectorStyleParam
    };
};

export const vseInitMapConfiguration = (action$) =>
    action$.ofType(LOCATION_CHANGE)
        .switchMap((action) =>
            action$.ofType(MAP_CONFIG_LOADED)
                .take(1)
                .switchMap(() => {
                    const pathname = (get(action, 'payload.pathname') || '').replace(/\//g, '');
                    const pageActions = {
                        'tiles-api': () => [
                            setControlProperty('rightmenu', 'activePlugin', 'TilesCatalog'),
                            setControlProperty('layoutmenu', 'activePlugin', 'TilesCatalog'),
                            setControlProperty('leftmenu', 'activePlugin', null)
                        ],
                        'visual-style-editor': () => [
                            setControlProperty('rightmenu', 'activePlugin', null),
                            setControlProperty('layoutmenu', 'activePlugin', 'TOC'),
                            setControlProperty('leftmenu', 'activePlugin', 'TOC')
                        ],
                        'images-api': () => [
                            setControlProperty('rightmenu', 'activePlugin', null),
                            setControlProperty('layoutmenu', 'activePlugin', 'ImagesAPI'),
                            setControlProperty('leftmenu', 'activePlugin', 'ImagesAPI')
                        ]
                    };
                    if (pathname !== 'visual-style-editor') {
                        return pageActions[pathname] && Rx.Observable.of(...pageActions[pathname]()) || Rx.Observable.empty();
                    }
                    let selectedStyles;
                    try {
                        selectedStyles = JSON.parse(localStorage.getItem('selectedStyles'));
                    } catch (e) {
                        selectedStyles = null;
                    }
                    if (!selectedStyles) {
                        return Rx.Observable.of(
                            setControlProperty('visualStyleEditor', 'loading', false)
                        );
                    }
                    let tilesService;
                    let serviceUrl;
                    try {
                        const option = JSON.parse(localStorage.getItem('stylesAPIService'));
                        const { services = {} } = option || {};
                        serviceUrl = services.stylesAPI;
                        tilesService = services.tilesAPI;

                    } catch (e) {
                        //
                    }
                    return Rx.Observable
                        .defer(() => axios.all([
                            getCollections(tilesService).then((collections) => collections),
                            ...(selectedStyles).map((style) => updateStyle(style))]))
                        .switchMap((res) => {
                            const [collections] = res;
                            const styles = res.filter((item, idx) => idx > 0);
                            return Rx.Observable.defer(() => axios.all(
                                styles.map(styleMetadata => parseStyle(styleMetadata, collections))
                            ))
                                .switchMap((config) => {
                                    const newLayers = config.reduce((acc, { layers: configLayers, styles: stylesheets, styleMetadata }) => {
                                        const availableStyles = stylesheets.map((style) => ({ ...style, format: mimeTypeToStyleFormat(style && style.link && style.link.type) }));
                                        if (configLayers.length === 1) {
                                            return [
                                                ...acc,
                                                setupLayer(configLayers[0], availableStyles, styleMetadata)
                                            ];
                                        }
                                        const style = head(availableStyles.filter(({ native }) => native));
                                        const splitStyle = splitStyleSheet(style.format, style.styleBody, { onlyLayers: true });
                                        return [
                                            ...acc,
                                            ...configLayers.map((layer) => {
                                                return setupLayer(layer, [{
                                                    ...style,
                                                    split: true,
                                                    styleBody: (splitStyle.find(({ layerName }) => layerName === layer.styleLayerName) || {}).group
                                                }], styleMetadata);
                                            })
                                        ];
                                    }, []);
                                    const metadata = config.map(({ styleMetadata, styles: stylesheets }) => {
                                        const style = head(stylesheets.filter(({ native }) => native));
                                        const format = mimeTypeToStyleFormat(style && style.link && style.link.type);
                                        return {
                                            ...styleMetadata,
                                            serviceUrl,
                                            format,
                                            backgroundColor: style && style.styleBody
                                                ? getBackgroundColor(format, style.styleBody)
                                                : '#dddddd'
                                        };
                                    });
                                    return Rx.Observable.of(
                                        ...newLayers.map(layer => addLayer({ ...layer, id: uuidv1() })),
                                        setMetadata(metadata),
                                        ...(pageActions[pathname] && pageActions[pathname]() || []),
                                        setControlProperty('visualStyleEditor', 'loading', false)
                                    );
                                });
                        })
                        .catch(() => Rx.Observable.of(
                            setControlProperty('visualStyleEditor', 'loading', false)
                        ))
                        .startWith(setControlProperty('visualStyleEditor', 'loading', true));
                }));
