/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';

import ColorMap from './ColorMap';

import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import ColorSelector from '@mapstore/components/style/ColorSelector';
import Slider from '@mapstore/components/misc/Slider';

export function Field({ children, label }) {
    return (
        <div
            className="ms-symbolizer-field">
            <div>{label}</div>
            <div>{children}</div>
        </div>
    );
}

export const fields = {
    color: ({ label, config = {}, value, onChange = () => {} }) => (
        <Field
            label={label}>
            <ColorSelector
                color={value}
                stroke={config.stroke}
                onChangeColor={(color) => color && onChange(color)}/>
        </Field>
    ),
    slider: ({ label, value, config = {}, onChange = () => {} }) => (
        <Field
            label={label}>
            <div
                className="mapstore-slider with-tooltip"
                onClick={(e) => { e.stopPropagation(); }}>
                <Slider
                    start={[value]}
                    tooltips={[true]}
                    format={config.format}
                    range={config.range || { min: 0, max: 10 }}
                    onChange={(changedValue) => onChange(changedValue)}/>
            </div>
        </Field>
    ),
    mark: ({ label, value, onChange = () => {} }) => (
        <Field
            label={label}>
            <Select
                value={value}
                clearable={false}
                options={[
                    {
                        value: 'Circle',
                        label: 'Circle'
                    },
                    {
                        value: 'Square',
                        label: 'Square'
                    },
                    {
                        value: 'Triangle',
                        label: 'Triangle'
                    },
                    {
                        value: 'Star',
                        label: 'Star'
                    },
                    {
                        value: 'Cross',
                        label: 'Cross'
                    },
                    {
                        value: 'X',
                        label: 'X'
                    },
                    {
                        value: 'shape://vertline',
                        label: 'shape://vertline'
                    },
                    {
                        value: 'shape://horline',
                        label: 'shape://horline'
                    },
                    {
                        value: 'shape://slash',
                        label: 'shape://slash'
                    },
                    {
                        value: 'shape://backslash',
                        label: 'shape://backslash'
                    },
                    {
                        value: 'shape://dot',
                        label: 'shape://dot'
                    },
                    {
                        value: 'shape://plus',
                        label: 'shape://plus'
                    },
                    {
                        value: 'shape://times',
                        label: 'shape://times'
                    },
                    {
                        value: 'shape://oarrow',
                        label: 'shape://oarrow'
                    },
                    {
                        value: 'shape://carrow',
                        label: 'shape://carrow'
                    }
                ]}
                onChange={(option = {}) => {
                    onChange(option.value);
                }}/>
        </Field>
    ),
    input: ({ label, value, config = {}, onChange = () => {} }) => (
        <Field
            label={label}>
            <FormGroup>
                <FormControl
                    type={config.type || 'text'}
                    value={value}
                    onChange={event => onChange(event.target.value)}/>
            </FormGroup>
        </Field>
    ),
    scale: ({ label, value, onChange = () => {} }) => (
        <Field
            label={label}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div>{'1 :'}&nbsp;</div>
                <FormGroup style={{ flex: 1 }}>
                    <FormControl
                        value={value}
                        onChange={event => onChange(event.target.value)}/>
                </FormGroup>
            </div>
        </Field>
    ),
    toolbar: ({ label, value, onChange = () => {}, config = {} }) => (
        <Field
            label={label}>
            <Toolbar
                btnDefaultProps={{
                    className: 'no-border',
                    bsSize: 'xs'
                }}
                buttons={(config.options || [])
                .map(({ glyph, text, value: optionValue }) => ({
                    glyph,
                    text,
                    active: optionValue === value ? true : false,
                    onClick: () => onChange(value === optionValue ? undefined : optionValue)
                }))}/>
        </Field>
    ),
    colorMap: ({ label, value, onChange = () => {} }) => {
        return (
            <Field
                label={label}>
                <ColorMap
                    value={value}
                    onChange={(newValue) =>
                        onChange(newValue)}/>
            </Field>
        );
    }
};
