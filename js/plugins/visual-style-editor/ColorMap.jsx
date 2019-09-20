/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import tinycolor from 'tinycolor2';
import min from 'lodash/min';
import max from 'lodash/max';
import { Button, Glyphicon, FormGroup, FormControl } from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import ColorSelector from '@mapstore/components/style/ColorSelector';
import Nouislider from "react-nouislider";

export default class ColorMap extends Component {

    static propTypes = {
        value: PropTypes.object,
        onChange: PropTypes.func
    };

    static defaultProps = {
        value: {
            isDefault: true,
            type: 'ramp',
            colorMapEntries: [
                { color: '#000000', quantity: 0 },
                { color: '#ffffff', quantity: 255 }
            ]
        },
        onChange: () => {}
    }

    state = {
        open: false
    }

    render() {
        const { colorMapEntries } = this.props.value;
        const values = colorMapEntries.map(({ quantity }) => quantity);
        const minValue = min(values);
        const maxValue = max(values);
        const size = maxValue - minValue;
        const linearGradient = (colorMapEntries || [])
            .reduce((acc, { color, quantity }) =>
                `${acc}, ${color} ${(quantity - minValue) / size * 100}%`,
                'linear-gradient(to right');
        return (
            <div
                className="ms-color-map"
                onClick={() => {
                    const { isDefault, ...defaultValue } = this.props.value;
                    if (isDefault) {
                        this.props.onChange(defaultValue);
                    }
                    this.setState({ open: true });
                }}>
                <div className="ms-gradient-preview" style={{ backgroundImage: `${linearGradient})` }}></div>
                {this.state.open &&
                <div className="ms-color-map-container">
                    <BorderLayout
                        header={
                            <div>
                                <div className="ms-gradient-toolbar">
                                    <div/>
                                    <Toolbar
                                        btnDefaultProps={{
                                            className: 'square-button-md no-border'
                                        }}
                                        buttons={[
                                            {
                                                glyph: '1-close',
                                                onClick: (event) => {
                                                    event.stopPropagation();
                                                    this.setState({ open: false });
                                                }
                                            }
                                        ]}/>
                                </div>
                                <div className="ms-gradient-range">
                                    <div
                                        className="ms-gradient-preview"
                                        style={{
                                            backgroundImage: `${linearGradient})`
                                        }}/>
                                    <Nouislider
                                        range={{ min: minValue, max: maxValue }}
                                        start={colorMapEntries}
                                        format={{
                                            to: (newQuantity, id) => {
                                                return {
                                                    ...colorMapEntries[id],
                                                    quantity: Math.round(newQuantity)
                                                };
                                            },
                                            from: ({ quantity }) => quantity
                                        }}
                                        tooltips={colorMapEntries
                                            .map(({ color }) => ({
                                                to: () => `<div style="background-color: ${color};"></div>`
                                            }))}
                                        onChange={newColorMapEntries =>
                                            this.props.onChange({
                                                ...this.props.value,
                                                colorMapEntries: newColorMapEntries
                                            })
                                        }/>
                                </div>
                                <div className="ms-gradient-toolbar">
                                    <div>

                                    </div>
                                    <Toolbar
                                        btnDefaultProps={{
                                            className: 'square-button-md no-border pull-right'
                                        }}
                                        buttons={[
                                            {
                                                glyph: 'plus',
                                                tooltip: 'Add new color entry',
                                                onClick: (event) => {
                                                    event.stopPropagation();
                                                    this.props.onChange({
                                                        ...this.props.value,
                                                        colorMapEntries: [
                                                            { quantity: minValue, color: '#ffffff' },
                                                            ...(this.props.value.colorMapEntries || [])
                                                        ]
                                                    });
                                                }
                                            }
                                        ]}/>
                                </div>
                            </div>
                        }>
                        {colorMapEntries.map(({ label, quantity, color, opacity }, idx) => (
                            <div
                                key={`${idx}-${quantity}`}
                                className="ms-map-color-entry">
                                <FormGroup>
                                    <FormControl
                                        placeholder="Label..."
                                        defaultValue={label !== undefined ? label : ''}
                                        onBlur={(event) => this.updateEntry(idx, {
                                            label: event.target.value
                                        })}/>
                                </FormGroup>
                                <FormGroup>
                                    <FormControl
                                        type="number"
                                        placeholder="Quantity..."
                                        defaultValue={quantity !== undefined ? quantity : ''}
                                        onBlur={(event) => this.updateEntry(idx, {
                                            quantity: !isNaN(parseFloat(event.target.value))
                                                ? parseFloat(event.target.value)
                                                : undefined
                                        })}/>
                                </FormGroup>
                                <div>
                                    <ColorSelector
                                        color={tinycolor(color).setAlpha(opacity || 1.0).toRgb()}
                                        onChangeColor={(value) => {
                                            if (!value) return null;
                                            const { a: alpha, ...newColor } = value || {};
                                            return this.updateEntry(idx, {
                                                color: tinycolor({ ...newColor, a: 1.0 }).toHexString(),
                                                opacity: alpha === 1 ? undefined : alpha
                                            });
                                        }}/>
                                </div>
                                {(this.props.value.colorMapEntries || []).length > 2 && <Button
                                    className="square-button-md no-border"
                                    onClick={() => {
                                        event.stopPropagation();
                                        this.props.onChange({
                                            ...this.props.value,
                                            colorMapEntries: (this.props.value.colorMapEntries || [])
                                                .filter((entry, id) => id !== idx)
                                        });
                                    }}>
                                    <Glyphicon glyph="trash"/>
                                </Button>}
                            </div>
                        ))}
                    </BorderLayout>
                </div>}
            </div>
        );
    }

    updateEntry = (id, properties) => {
        const { colorMapEntries, ...value } = this.props.value;
        const newColorMapEntries = colorMapEntries.map((colorMapEntry, idx) => {
            if (idx === id) return { ...colorMapEntry, ...properties };
            return colorMapEntry;
        });
        this.props.onChange({
            ...value,
            colorMapEntries: [ ...newColorMapEntries ].sort((a, b) => a.quantity > b.quantity ? 1 : -1)
        });
    }
}
