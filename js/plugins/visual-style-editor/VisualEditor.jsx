/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import uuidv1 from 'uuid/v1';
import Select from 'react-select';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { styleSheetToGeoStylerStyle, geoStylerStyleToStyleSheet } from '@mapstore/utils/VectorStyleUtils';
import RuleEditor from './RuleEditor';

export default class VisualEditor extends Component {

    static propTypes = {
        id: PropTypes.string,
        code: PropTypes.string,
        format: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        onChange: () => {},
        format: 'sld'
    }

    state = {
        styles: [],
        selectedNamedLayer: '',
        namedLayers: []
    };

    componentWillMount() {
        this.parseStyle(this.props.format, this.props.code);
    }

    componentWillReceiveProps(newProps) {
        if (newProps.id !== this.props.id) {
            this.parseStyle(newProps.format, newProps.code);
        }
    }

    getStyle = (groupId) => {
        const { styles = [] } = this.state;
        const style = styles.find((group) => group.groupId === groupId) || {};
        return style;
    }

    render() {
        const { namedLayers, selectedNamedLayer, styles } = this.state;
        return (
            <BorderLayout
                header={[
                    <div style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <Select
                                clearable={false}
                                value={selectedNamedLayer}
                                placeholder="Select style layer..."
                                options={(namedLayers || [])
                                    .map((namedLayer) => ({ value: namedLayer, label: namedLayer}))}
                                onChange={({ value }) => {
                                    this.setState({
                                        selectedNamedLayer: value,
                                        styles: (this.state.completeStyles.find(({ layerName }) => value === layerName) || {}).group || []
                                    });
                                }}/>
                        </div>
                        <div>
                            <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md no-border'
                                }}
                                buttons={[
                                    {
                                        glyph: 'add-layer',
                                        tooltip: 'Add style layer'
                                    },
                                    {
                                        glyph: 'add-row-after',
                                        tooltip: 'Add Group'
                                    }
                                ]}/>
                        </div>
                    </div>]}>
                    {styles.map((style) => {
                        const { rules = [], groupId } = style;
                        return (
                            <div
                                key={groupId}
                                style={{
                                    borderBottom: '1px solid #ddd',
                                    borderTop: '1px solid #ddd',
                                    padding: 8
                                }}>
                                <div style={{ display: 'flex' }}>
                                    <div style={{ flex: 1 }}/>
                                    <Toolbar
                                        btnDefaultProps={{
                                            className: 'square-button-md no-border'
                                        }}
                                        buttons={[
                                            {
                                                glyph: '1-ruler-alt-2',
                                                tooltip: 'Add rule',
                                                onClick: () => this.updateStylesState(groupId, this.addRule(style))
                                            }
                                        ]}/>
                                </div>
                                <RuleEditor
                                    rules={rules}
                                    onAdd={(ruleId, kind, initialParams) => {
                                        const currentStyle = this.getStyle(groupId);
                                        return this.updateStylesState(
                                            groupId,
                                            this.addSymbolizer(currentStyle, ruleId, kind, initialParams)
                                        );
                                    }}
                                    onChange={(values, ruleId, symbolizerId) => {
                                        const currentStyle = this.getStyle(groupId);
                                        const newStyle = this.updateStyle(currentStyle, values, ruleId, symbolizerId);
                                        this.updateStylesState(groupId, newStyle);
                                    }}/>
                            </div>
                        );
                    })}
            </BorderLayout>
        );
    }

    updateStylesState = (groupId, newStyle) => {
        const { styles = [], selectedNamedLayer, completeStyles } = this.state;
        const newStyles = styles.map((style = {}) =>
            style.groupId === groupId
                ? newStyle
                : style);
        const newCompleteStyles = completeStyles.map(style => {
            if (style.layerName === selectedNamedLayer) {
                return {
                    layerName: selectedNamedLayer,
                    group: [ ...newStyles ]
                };
            }
            return style;
        });
        this.setState({
            styles: newStyles,
            completeStyles: newCompleteStyles
        });
        geoStylerStyleToStyleSheet(this.props.format, newCompleteStyles)
            .then((code) => this.props.onChange(code))
            .catch(() => { });
        return newCompleteStyles;
    }

    parseStyle = (format, code) => {
        styleSheetToGeoStylerStyle(format, code)
            .then((styles) => {
                const namedLayers = styles.map(({ layerName }) => layerName);
                const selectedNamedLayer = namedLayers[0];
                const completeStyles = styles.map(style => ({
                    ...style,
                    group: (style.group || []).map((stl) => this.addStyleIndices(stl))
                }));
                this.setState({
                    namedLayers,
                    selectedNamedLayer,
                    completeStyles,
                    styles: (completeStyles.find(({ layerName }) => selectedNamedLayer === layerName) || {}).group || []
                });
            });
    }

    addStyleIndices = (style) => {
        const { rules = [], ...params } = style;
        return {
            ...params,
            groupId: uuidv1(),
            rules: rules.map(rule => {
                const { symbolizers = [], ...ruleParams } = rule;
                return {
                    ...ruleParams,
                    ruleId: uuidv1(),
                    symbolizers: symbolizers.map(symbolizer => {
                        return {
                            ...symbolizer,
                            symbolizerId: uuidv1()
                        };
                    })
                };
            })
        };
    }

    updateStyle = (style = {}, values, selectedRuleId, selectedSymbolizerId) => {
        const { rules = [], ...params } = style;
        return {
            ...params,
            rules: rules.map(rule => {
                const { symbolizers = [], ruleId } = rule;
                if (ruleId !== selectedRuleId) return rule;

                if (selectedSymbolizerId === undefined) {
                    return {
                        ...rule,
                        ...values
                    };
                }

                return {
                    ...rule,
                    symbolizers: symbolizers.map(symbolizer => {
                        const { symbolizerId } = symbolizer;
                        if (selectedSymbolizerId !== symbolizerId) return symbolizer;
                        return {
                            ...symbolizer,
                            ...values
                        };
                    })
                };
            })
        };
    }

    addSymbolizer = (style = {}, selectedRuleId, kind, initialParams = {}) => {
        const { rules = [], ...params } = style;
        return {
            ...params,
            rules: rules.map(rule => {
                const { symbolizers = [], ruleId } = rule;
                if (ruleId !== selectedRuleId) return rule;
                return {
                    ...rule,
                    symbolizers: [ { ...initialParams, kind, symbolizerId: uuidv1() }, ...symbolizers ]
                };
            })
        };
    }

    addRule = (style = {}) => {
        const { rules = [], ...params } = style;
        return {
            ...params,
            rules: [{ ruleId: uuidv1(), name: '', symbolizers: [] }, ...rules]
        };
    }
}
