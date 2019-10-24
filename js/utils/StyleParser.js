/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import { Builder, Parser } from 'xml2js';

const xmlParser = new Parser();
const xmlBuilder = new Builder();

export const updateValue = function(json, rules = [], param) {
    const { iteratee } = rules.find(({ match }) => match(param)) || {};
    if (isArray(json)) {
        return json.map((val) => {
            if (isObject(val)) {
                return updateValue(iteratee && iteratee(val) || val, rules, param);
            }
            return val;
        });
    }
    if (isObject(json)) {
        return Object.keys(json)
            .reduce(function(acc, key) {
                if (isObject(json[key])) {
                    return {
                        ...acc,
                        [key]: updateValue(json[key], rules, key)
                    };
                }
                return { ...acc, [key]: json[key] };
            }, {});
    }
    return json;
};

export const setBackgroundColor = function(format, stylesheet, { styleName, backgroundColor }) {
    if (format === 'sld') {
        let code = stylesheet;
        xmlParser.parseString(code, (jsonError, json) => {
            code = xmlBuilder.buildObject(
                updateValue(json, [{
                    match: (key = '') => key.indexOf('UserStyle') !== -1,
                    iteratee: (UserStyle) => {
                        return {
                            Name: styleName,
                            BackgroundColor: [backgroundColor],
                            ...(Object.keys(UserStyle).reduce((acc, key) => {
                                if (key.indexOf('Name') !== -1 || key.indexOf('BackgroundColor') !== -1) return { ...acc };
                                return {
                                    ...acc,
                                    [key]: UserStyle[key]
                                };
                            }, {}))
                        };
                    }
                }])
            );
        });
        return code;
    }
    if (format === 'mbstyle') {
        const background = (stylesheet.layers || []).find(({ id }) => id === 'background');
        return {
            ...stylesheet,
            layers: background
                ? (stylesheet.layers || [])
                    .map((layer) => {
                        if (layer.id === 'background') {
                            return {
                                "id": "background",
                                "type": "background",
                                "paint": {
                                    "background-color": backgroundColor
                                }
                            };
                        }
                        return layer;
                    })
                : [
                    {
                        "id": "background",
                        "type": "background",
                        "paint": {
                            "background-color": backgroundColor
                        }
                    },
                    ...(stylesheet.layers || [])
                ]
        };
    }
    return stylesheet;
};

export const getBackgroundColor = function(format, stylesheet) {
    let backgroundColor = '#dddddd';
    if (format === 'sld') {
        xmlParser.parseString(stylesheet, (jsonError, json) => {
            xmlBuilder.buildObject(
                updateValue(json, [{
                    match: (key = '') => key.indexOf('UserStyle') !== -1,
                    iteratee: (UserStyle) => {
                        const bgColor = UserStyle.BackgroundColor;
                        if (bgColor && bgColor[0]) backgroundColor = bgColor && bgColor[0];
                    }
                }])
            );
        });
    }
    if (format === 'mbstyle') {
        const background = (stylesheet.layers || []).find(({ id }) => id === 'background');
        backgroundColor = background && background.paint && background.paint['background-color'] || '#dddddd';
    }
    return backgroundColor;
};
