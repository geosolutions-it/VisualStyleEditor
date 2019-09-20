/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import isNil from 'lodash/isNil';
import set from 'lodash/set';
import min from 'lodash/min';
import max from 'lodash/max';
import tinycolor from 'tinycolor2';
import { Glyphicon } from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import { fields } from './Field';
import Symbolizer from './Symbolizer';
import StyleFilterBuilder from './StyleFilterBuilder';

const parameters = {
    color: ({ key = 'color', opacityKey = 'opacity', label = 'Fill', stroke }) => ({
        type: 'color',
        label,
        config: {
            stroke
        },
        setValue: (value, properties) => {
            const opacity = isNil(properties[opacityKey]) ? 1 : properties[opacityKey];
            return tinycolor(value).setAlpha(opacity).toRgb();
        },
        getValue: (value) => {
            const { a, ...color} = value || {};
            return {
                [key]: tinycolor({ ...color, a: 1 }).toHexString(),
                [opacityKey]: a
            };
        }
    }),
    colorMap: ({ key = 'colorMap', label = 'Color Map' }) => ({
        type: 'colorMap',
        label,
        config: {},
        setValue: (value) => {

            return value;
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        }
    }),
    width: ({ key = 'width', label = 'Width' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 20 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + ' px'
            }
        },
        setValue: (value = 1) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            const width = value[0] && value[0].split(' px')[0];
            return {
                [key]: parseFloat(width)
            };
        }
    }),
    size: ({ key = 'radius', label = 'Radius' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 100 },
            format: {
                from: value => Math.round(value),
                to: value => Math.round(value) + ' px'
            }
        },
        setValue: (value = 1) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            const width = value[0] && value[0].split(' px')[0];
            return {
                [key]: parseFloat(width)
            };
        }
    }),
    opacity: ({ key = 'opacity', label = 'Opacity' }) => ({
        type: 'slider',
        label,
        config: {
            range: { min: 0, max: 1 }
        },
        setValue: (value = 1) => {
            return parseFloat(value);
        },
        getValue: (value = []) => {
            const width = value[0] && value[0].split(' px')[0];
            return {
                [key]: parseFloat(width)
            };
        }
    }),
    shape: ({ label, key = 'wellKnownName' }) => ({
        type: 'mark',
        label,
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    text: ({ label, key = 'Label' }) => ({
        type: 'input',
        label,
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    fontStyle: ({ label, key = 'Label' }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                glyph: 'font',
                value: 'normal'
            }, {
                glyph: 'italic',
                value: 'italic'
            }, {
                glyph: 'italic',
                value: 'oblique'
            }]
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    fontWeight: ({ label, key = 'Label' }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                glyph: 'font',
                value: 'normal'
            }, {
                glyph: 'bold',
                value: 'bold'
            }]
        },
        getValue: (value = '') => {
            return {
                [key]: value
            };
        }
    }),
    bool: ({ label, key = 'Label' }) => ({
        type: 'toolbar',
        label,
        config: {
            options: [{
                text: 'true',
                value: true
            }, {
                text: 'false',
                value: false
            }]
        },
        getValue: (value) => {
            return {
                [key]: value
            };
        }
    })
};

const groups = {
    mark: {
        glyph: 'point',
        params: {
            wellKnownName: parameters.shape({ label: 'Shape' }),
            color: parameters.color({ key: 'color', opacityKey: 'opacity', label: 'Fill' }),
            strokeColor: parameters.color({ key: 'strokeColor', opacityKey: 'strokeOpacity', label: 'Stroke Color', stroke: true }),
            strokeWidth: parameters.width({ key: 'strokeWidth', label: 'Stroke Width' }),
            radius: parameters.size({ key: 'radius', label: 'Radius' })
        }
    },
    icon: {
        glyph: 'point',
        params: {
            size: parameters.size({ key: 'size', label: 'Size' })
        }
    },
    fill: {
        glyph: 'polygon',
        params: {
            color: parameters.color({ label: 'Fill Color' }),
            outlineColor: parameters.color({ key: 'outlineColor', opacityKey: 'outlineOpacity', label: 'Outline Color', stroke: true }),
            outlineWidth: parameters.width({ key: 'outlineWidth', label: 'Outline Width' })
        }
    },
    line: {
        glyph: 'line',
        params: {
            color: parameters.color({ label: 'Stroke Color', stroke: true }),
            width: parameters.width({ label: 'Stroke Width', key: 'width' })
        }
    },
    text: {
        glyph: 'font',
        params: {
            label: parameters.text({ label: 'Label', key: 'label' }),
            color: parameters.color({ label: 'Font Color', key: 'color' }),
            size: parameters.size({ label: 'Font Size', key: 'size' }),
            fontStyle: parameters.fontStyle({ label: 'Font Style', key: 'fontStyle' }),
            fontWeight: parameters.fontWeight({ label: 'Font Weight', key: 'fontWeight' }),
            haloColor: parameters.color({ label: 'Halo Color', key: 'haloColor', stroke: true }),
            haloWidth: parameters.width({ label: 'Halo Width', key: 'haloWidth' }),
            allowOverlap: parameters.bool({ label: 'Overlap', key: 'allowOverlap' })
        }
    },
    raster: {
        glyph: '1-raster',
        params: {
            opacity: parameters.opacity({ }),
            colorMap: parameters.colorMap({ })
        }
    }
};

export default function RuleEditor({ rules = [], onAdd = () => {}, onChange = () => {}}) {

    const ScaleInput = fields.scale;
    return (
        <div className="ms-style-rule-editor">
        <SideGrid
            size="sm"
            items={
                rules.map(rule => {
                    const { name, symbolizers = [], filter, scaleDenominator = {}, ruleId } = rule;
                    return {
                        id: ruleId,
                        preview: <span className="ms-grab-handler">
                            <Glyphicon glyph="menu-hamburger"/>
                        </span>,
                        title: name,
                        tools: <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md no-border'
                        }}
                        buttons={[
                            {
                                glyph: 'point-plus',
                                tooltip: 'Add point style',
                                onClick: () => onAdd(ruleId, 'Mark', { wellKnownName: 'shape://carrow' })
                            },
                            {
                                glyph: 'line-plus',
                                tooltip: 'Add line style',
                                onClick: () => onAdd(ruleId, 'Line', { color: '#333333' })
                            },
                            {
                                glyph: 'polygon-plus',
                                tooltip: 'Add polygon style',
                                onClick: () => onAdd(ruleId, 'Fill', { color: '#ff0000' })
                            },
                            {
                                glyph: '1-raster',
                                tooltip: 'Add raster style',
                                onClick: () => onAdd(ruleId, 'Raster', { opacity: 1.0 })
                            },
                            {
                                glyph: 'font',
                                tooltip: 'Add label',
                                onClick: () => onAdd(ruleId, 'Text', { label: 'Label' })
                            }
                        ]}/>,
                        body: (
                            <BorderLayout
                                header={
                                    [<Symbolizer
                                        key="filter"
                                        glyph="filter">
                                        <StyleFilterBuilder
                                            filter={filter}
                                            onChange={(index, value) => {
                                                let newFilter = [ ...filter ];
                                                set(newFilter, index, value);
                                                onChange({
                                                    filter: newFilter
                                                }, ruleId);
                                            }}/>
                                    </Symbolizer>,
                                    <Symbolizer
                                        key="scale"
                                        glyph="1-ruler">
                                        <ScaleInput
                                            label="Max Scale"
                                            value={scaleDenominator.max}
                                            onChange={(maxValue) => {
                                                onChange({
                                                    scaleDenominator: {
                                                        ...scaleDenominator,
                                                        max: isNaN(parseFloat(maxValue)) ? undefined : parseFloat(max)
                                                    }
                                                }, ruleId);
                                            }}/>
                                        <ScaleInput
                                            label="Min Scale"
                                            value={scaleDenominator.min}
                                            onChange={(minValue) => {
                                                onChange({
                                                    scaleDenominator: {
                                                        ...scaleDenominator,
                                                        min: isNaN(parseFloat(minValue)) ? undefined : parseFloat(min)
                                                    }
                                                }, ruleId);
                                            }}/>
                                    </Symbolizer>]
                                }>
                                {symbolizers.map(({ kind = '', ...properties, symbolizerId }) => {
                                    const { params, glyph } = groups[kind.toLowerCase()] || {};
                                    return params &&
                                        <Symbolizer
                                            key={symbolizerId}
                                            defaultExpanded
                                            draggable
                                            glyph={glyph}>
                                            {Object.keys(params)
                                                .map((key) => {
                                                    const { type, setValue, getValue, config, label } = params[key] || {};
                                                    const Field = fields[type];
                                                    return Field && <Field
                                                        key={key}
                                                        label={label || key}
                                                        config={config}
                                                        value={setValue && setValue(properties[key], properties) || properties[key]}
                                                        onChange={(values) => onChange(getValue && getValue(values) || values, ruleId, symbolizerId)}/>;
                                                })}
                                        </Symbolizer>
                                    ;
                                })}
                            </BorderLayout>
                        )
                    };
                })
            }/>
        </div>
    );
}
