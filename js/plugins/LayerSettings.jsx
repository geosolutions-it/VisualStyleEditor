/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import assign from 'object-assign';
import { get } from 'lodash';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { setControlProperty } from '@mapstore/actions/controls';
import { updateNode } from '@mapstore/actions/layers';
import { getSelectedLayer } from '@mapstore/selectors/layers';
import { mimeTypeToStyleFormat } from '@mapstore/utils/VectorStyleUtils';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import Form from '../components/Form';
import { getOGCStyles } from './StylesManager';

const formatLabels = {
    'application/vnd.mapbox-vector-tile': 'MapBox Vector Tile',
    'application/json;type=geojson': 'GeoJSON',
    'application/json;type=topojson': 'TopoJSON',
    'image/png': 'Image PNG',
    'image/png8': 'Image PNG 8',
    'image/jpeg': 'Image JPEG',
    'image/gif': 'Image GIF'
};

const TOCButton = connect(createSelector([
    state => get(state, 'controls.ogcSettings.enabled'),
    getSelectedLayer
], (enabled, { type } = {}) => ({
    enabled: enabled && type === 'ogc'
})), {
    onToggle: setControlProperty.bind(null, 'ogcSettings', 'enabled', true)
})(({ status, enabled, onToggle, ...props }) => {
    return !enabled && status === 'LAYER'
    ? <Button {...props} onClick={() => onToggle()}>
        <Glyphicon glyph="wrench"/>
    </Button>
    : null;
});

class LayerSettings extends Component {

    static propTypes = {
        enabled: PropTypes.bool,
        selectedLayer: PropTypes.object,
        form: PropTypes.func,
        onChange: PropTypes.func,
        allStyleForm: PropTypes.func
    };

    static defaultProps = {
        form: ({ tileUrls = [], availableStyles = [], isLayerGroup }) => [
            {
                type: 'text',
                id: 'title',
                label: 'Title',
                placeholder: 'Enter title...'
            },
            {
                type: 'select',
                id: 'format',
                label: 'Format',
                placeholder: 'Select format...',
                clearable: false,
                ignoreAccents: false,
                setValue: (fieldId, { format } = {}) => {
                    return format && format.value && { format: format.value };
                },
                options: [...tileUrls
                    .map(({ format }) => ({ value: format, label: formatLabels[format] || format }))
                    .sort((a, b) => a.label > b.label ? 1 : -1)]
            },
            ...(!isLayerGroup && availableStyles.length > 0
            ? [{
                type: 'select',
                id: 'style',
                label: 'Available Styles',
                placeholder: 'Select style...',
                clearable: false,
                ignoreAccents: false,
                setValue: (fieldId, { style: selectedStyle } = {}) => {
                    const style = selectedStyle && selectedStyle.value;
                    if (style) {
                        const availableStyle = availableStyles.find(({ id }) => id === style) || {};
                        const { links = [] } = availableStyle;
                        const stylesLinks = links.filter(({ rel }) => rel === 'stylesheet') || {};
                        const { href: url, type: mimeType } = stylesLinks.length > 1
                            && stylesLinks.filter(({ type }) => type.indexOf('sld') === -1)[0]
                            || stylesLinks[0];
                        return {
                            style,
                            vectorStyle: {
                                url,
                                format: mimeTypeToStyleFormat(mimeType)
                            }
                        };
                    }
                    return undefined;
                },
                options: availableStyles.map(({ id, title }) => ({ value: id, label: id || title }))
            }]
            : [])
        ],
        onChange: () => {},
        allStyleForm: (allStyle) => [
            {
                type: 'select',
                id: 'style',
                label: 'All Styles',
                placeholder: 'Select style...',
                clearable: false,
                ignoreAccents: false,
                setValue: (fieldId, { style: selectedStyle } = {}) => {
                    const style = selectedStyle && selectedStyle.value;
                    if (style) {
                        const availableStyle = allStyle.find(({ id }) => id === style) || {};
                        const { links = [] } = availableStyle;
                        const stylesLinks = links.filter(({ rel }) => rel === 'stylesheet') || {};
                        const { href: url, type: mimeType } = stylesLinks.length > 1
                            && stylesLinks.filter(({ type }) => type.indexOf('sld') === -1)[0]
                            || stylesLinks[0];
                        return {
                            style,
                            vectorStyle: {
                                url,
                                format: mimeTypeToStyleFormat(mimeType)
                            }
                        };
                    }
                    return undefined;
                },
                options: allStyle.map(({ id, title }) => ({ value: id, label: id || title }))
            }
        ]
    };

    state = {};

    componentWillMount() {
        let serviceUrl = '';
        try {
            const option = JSON.parse(localStorage.getItem('tilesAPIService'));
            const { services = {} } = option || {};
            serviceUrl = services.stylesAPI;
        } catch (e) {
            //
        }
        if (serviceUrl) {
            getOGCStyles(serviceUrl)
                .then((allStyle = []) => {
                    this.setState({
                        allStyle
                    });
                });
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.onClose && !newProps.selectedLayer.name && this.props.selectedLayer.name
        || newProps.selectedLayer.type !== this.props.selectedLayer.type && newProps.selectedLayer.type !== 'ogc') {
            this.props.onClose();
        }
    }

    render() {
        const { selectedLayer, onChange } = this.props;
        const { name } = selectedLayer || {};
        return this.props.enabled
        ? (<div
            key={name}
            style={{
                width: 300,
                padding: 8,
                borderLeft: '1px solid #ddd' }}>
            <Form
                bootstrap
                form={this.props.form(selectedLayer)}
                values={selectedLayer}
                onChange={(changedOptions) => onChange(selectedLayer.id, 'layers', changedOptions)}/>
            <hr />
            <Form
                bootstrap
                form={this.props.allStyleForm(this.state.allStyle || [])}
                values={selectedLayer}
                onChange={(changedOptions) => onChange(selectedLayer.id, 'layers', changedOptions)}/>
        </div>)
        : null;
    }
}

export const LayerSettingsPlugin = assign(connect(
    createSelector([
        state => get(state, 'controls.ogcSettings.enabled'),
        getSelectedLayer
    ], (enabled, selectedLayer) => ({
        enabled,
        selectedLayer: selectedLayer || {}
    })),
    {
        onClose: setControlProperty.bind(null, 'ogcSettings', 'enabled', false),
        onChange: updateNode
    }
)(LayerSettings), {
    TOC: {
        priority: 1,
        tool: TOCButton
    }
});

export const reducers = {};
