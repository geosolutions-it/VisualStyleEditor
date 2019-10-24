/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import axios from 'axios';
import uniqBy from 'lodash/uniqBy';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
import urlParser from 'url';
import { DEFAULT_TILE_MATRIX_SET } from './defaultTileMatrixSet';

const capabilitiesCache = {};

const getFullHREF = function(service, href) {
    if (!href || href.match(/http/)) {
        return href;
    }
    const { protocol, host } = urlParser.parse(service);
    const parsedHref = urlParser.parse(href);
    return urlParser.format({
        ...parsedHref,
        protocol,
        host
    });
};

const getDefaultTileMatrixSet = function(tileMatrixSetLinks) {
    const tileMatrixSet = tileMatrixSetLinks && tileMatrixSetLinks[0] && tileMatrixSetLinks[0].tileMatrixSet || 'EPSG:900913';
    const alias = {
        WebMercatorQuad: 'EPSG:900913'
    };
    const tileMatrixSetId = alias[tileMatrixSet] || tileMatrixSet;
    return DEFAULT_TILE_MATRIX_SET[tileMatrixSetId] && DEFAULT_TILE_MATRIX_SET[tileMatrixSetId](tileMatrixSet) || null;
};

export function collectionUrlToLayer(collectionUrl, serviceUrl) {
    return axios.get(getFullHREF(serviceUrl, collectionUrl))
        .then(function({ data: collection }) {
            const { id, title, extent, links, styles: availableStyles } = collection;
            const spatial = extent && extent.spatial && extent.spatial.bbox && extent.spatial.bbox[0] // ii
                || extent && extent.spatial // gs
                || [-180, -90, 180, 90];
            const tiles = (links || []).filter(({ rel, type }) =>
                rel === 'tiles' && type === 'application/json'
                || rel === 'tiles' && type === undefined);
            const style = (availableStyles && availableStyles[0] || {}).id;
            return {
                name: id,
                title,
                type: 'ogc',
                visibility: true,
                tiles,
                availableStyles,
                style,
                bbox: {
                    crs: 'EPSG:4326',
                    bounds: {
                        minx: spatial[0],
                        miny: spatial[1],
                        maxx: spatial[2],
                        maxy: spatial[3]
                    }
                }
            };
        })
        .then(function({ tiles, ...layer }) {
            return axios.all(
                tiles.map(({ href }) =>
                    axios.get(getFullHREF(serviceUrl, href))
                        .then(function({ data }) {
                            const { tileMatrixSetLinks = [], links } = data;
                            const tile = links
                                .filter(({ rel }) => (rel === 'tile' || rel === 'tiles' )) // remove 'tile' rel
                                .map(({ href: url, type: format }) => ({ url, format }));
                            return {
                                tileMatrixSetLinks,
                                tile
                            };
                        })
                        .catch(() => null)
                )
            )
            .then(function(tilesResponses) {
                const tileUrls = uniqBy(tilesResponses.reduce((acc, { tile }) => [ ...acc, ...tile ], []), 'format');
                const tileMatrixSetLinks = uniqBy(tilesResponses.reduce((acc, tilesResponse) => [ ...acc, ...(tilesResponse.tileMatrixSetLinks || []) ], []), 'tileMatrixSet');
                const { format } = (tileUrls.find((tileUrl) => tileUrl.format === 'application/vnd.mapbox-vector-tile' || tileUrl.format === 'image/png' || tileUrl.format === 'image/png' || tileUrl.format === 'image/png8') || tileUrls[0] || {});
                return {
                    ...layer,
                    format,
                    tileUrls,
                    tileMatrixSetLinks
                };
            });
        })
        .then(function({ tileMatrixSetLinks, ...layer }) {
            return axios.all(tileMatrixSetLinks
                .map(({ tileMatrixSetURI, tileMatrixSetLimits }) =>
                tileMatrixSetURI
                    ? axios.get(getFullHREF(serviceUrl, tileMatrixSetURI))
                            .then(({
                                data: tileMatrixSet
                            }) => ({ tileMatrixSet, tileMatrixSetLimits }))
                            .catch(() => null)
                    : new Promise((resolve) => resolve(getDefaultTileMatrixSet(tileMatrixSetLinks)))
            ))
            .then(function(response) {
                const tileMatrixResponse = response.filter(val => val);
                const allowedSRS = tileMatrixResponse.reduce((acc, tR) => ({ ...acc, [tR.tileMatrixSet.identifier]: true }), {});
                const tileMatrixSet = tileMatrixResponse.map((tR) => tR.tileMatrixSet);
                const matrixIds = tileMatrixResponse.reduce(function(acc, tR) {
                    return {
                        ...acc,
                        [tR.tileMatrixSet.identifier]: tR.tileMatrixSetLimits && tR.tileMatrixSetLimits
                            .map(function({ tileMatrix, maxTileCol, maxTileRow, minTileCol, minTileRow }) {
                                return {
                                    identifier: tileMatrix,
                                    ranges: {
                                        cols: {
                                            min: minTileCol,
                                            max: maxTileCol
                                        },
                                        rows: {
                                            min: minTileRow,
                                            max: maxTileRow
                                        }
                                    }
                                };
                            })
                        || tR.tileMatrixSet && tR.tileMatrixSet.tileMatrix && tR.tileMatrixSet.tileMatrix
                            .map(({ identifier}) => ({ identifier }))
                    };
                }, {});
                return { allowedSRS, tileMatrixSet, matrixIds, ...layer };
            });
        });
}

const searchAndPaginate = (json = {}, startPosition, maxRecords, text, serviceUrl) => {
    const { collections } = json;
    const filteredLayers = collections
        .filter((layer = {}) => !text
        || layer.id && layer.id.toLowerCase().indexOf(text.toLowerCase()) !== -1
        || layer.name && layer.name.toLowerCase().indexOf(text.toLowerCase()) !== -1
        || layer.title && layer.title.toLowerCase().indexOf(text.toLowerCase()) !== -1);
    const layers = filteredLayers
        .filter((layer, index) => index >= startPosition - 1 && index < startPosition - 1 + maxRecords);
    return axios.all(
            layers.map(function(collection) {
                const { links: collectionLinks } = collection;
                const collectionUrl = ((collectionLinks || []).find(({ rel, type }) =>
                    rel === 'collection' && type === 'application/json' // gs
                    || rel === 'self' && type === undefined // ii
                    || rel === 'self' && type === 'application/json' // e
                ) || {}).href;
                return collectionUrlToLayer(collectionUrl, serviceUrl)
                    .then(layer => layer)
                    .catch((err) => {
                        return {
                            ...collection,
                            error: err && (err.data || err.message) || 'Cannot get this collection'
                        };
                    });
            })
        )
        .then((updatedLayers) => ({
            numberOfRecordsMatched: filteredLayers.length,
            numberOfRecordsReturned: Math.min(maxRecords, filteredLayers.length),
            nextRecord: startPosition + Math.min(maxRecords, filteredLayers.length) + 1,
            records: updatedLayers
        }));
};

const getCollectionUrl = function(url) {
    return axios.get(url)
        .then(({ data }) => {
            const { links = [] } = data;
            return links.find(({ type, rel }) => rel === 'data' && type === 'application/json' || rel === 'data' && type === undefined);
        })
        .then((res = {}) => getFullHREF(url, res.href));
};

export const getRecords = function(url, startPosition, maxRecords, text) {
    const cached = capabilitiesCache[url];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text, url));
        });
    }
    return getCollectionUrl(url)
        .then((parsedUrl) =>
            axios.get(parsedUrl)
                .then(({ data }) => {
                    capabilitiesCache[url] = {
                        timestamp: new Date().getTime(),
                        data
                    };
                    return searchAndPaginate(data, startPosition, maxRecords, text, url);
                })
        );
};

export const getCollections = function(url) {
    const cacheKey = `${url}:collections`;
    const cached = capabilitiesCache[cacheKey];
    if (cached && new Date().getTime() < cached.timestamp + (ConfigUtils.getConfigProp('cacheExpire') || 60) * 1000) {
        return new Promise((resolve) => {
            resolve(cached.data && cached.data.collections);
        });
    }
    return getCollectionUrl(url)
        .then((parsedUrl) =>
            axios.get(parsedUrl)
                .then(({ data }) => {
                    capabilitiesCache[cacheKey] = {
                        timestamp: new Date().getTime(),
                        data
                    };
                    return data && data.collections;
                })
        );
};

export const textSearch = function(url, startPosition, maxRecords, text) {
    return getRecords(url, startPosition, maxRecords, text);
};

export const reset = () => {
    Object.keys(capabilitiesCache).forEach(key => {
        delete capabilitiesCache[key];
    });
};
