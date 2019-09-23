/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import assign from 'object-assign';
import { createSelector } from 'reselect';
import get from 'lodash/get';
import head from 'lodash/head';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import PropTypes from 'prop-types';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import stylesheet from '../reducers/stylesheet';
import Form from '../components/Form';
import Editor from '@mapstore/components/styleeditor/Editor';
import Menu from '../components/Menu';
import { layersSelector, getSelectedLayers, selectedNodesSelector } from '@mapstore/selectors/layers';
import { setBackgroundColor } from '../utils/StyleParser';
import axios from 'axios';
import { setControlProperty } from '@mapstore/actions/controls';
import { setBackground } from '../actions/stylesheet';
import { createShallowSelectorCreator } from '@mapstore/utils/ReselectUtils';
import { mergeStyleSheet, convertStyle } from '@mapstore/utils/VectorStyleUtils';
import { Button, Glyphicon, ControlLabel, FormGroup, FormControl, Alert } from 'react-bootstrap';
import ColorSelector from '@mapstore/components/style/ColorSelector';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import tinycolor from 'tinycolor2';
import uuidv1 from 'uuid/v1';
import MapboxGLMap from '../components/MapboxGLMap';
import isNumber from 'lodash/isNumber';

const stylesheetLayersSelector = createShallowSelectorCreator(
    (a, b) => {
        return a === b
            || !isNil(a) && !isNil(b) && a.id === b.id && a.title === b.title && a.name === b.name;
    }
)(layersSelector, layers => layers);

function formatToMode(format) {
    const modes = {
        mbstyle: 'application/json',
        sld: 'xml'
    };
    return modes[format];
}
function jsonParser(key, value) {
    return isNumber(parseFloat(value)) && parseFloat(value) || value;
}
function toEditorCode(format, code, sources, asObject) {
    if (format === 'mbstyle') {
        let mbstyle;
        try {
            mbstyle = !isObject(code) && JSON.parse(code, jsonParser) || JSON.parse(JSON.stringify(code, null, 2), jsonParser);
            const { layers } = mbstyle;
            mbstyle = {
                ...mbstyle,
                name: 'testbed-15',
                sources,
                layers: layers.map(layer => ({ ...layer, id: uuidv1() }))
            };
            mbstyle = asObject ? mbstyle : JSON.stringify(mbstyle, null, 2);
        } catch(e) {
            mbstyle = '{}';
        }
        return mbstyle;
    }
    return code;
}

const selectedStyleSelector = createShallowSelectorCreator((a, b) => {
    if (isObject(a)) return a.id === a.id;
    return a === b;
})((state = {}) => {
    const selectedLayers = getSelectedLayers(state);
    const selectedStyle = selectedLayers[0] && selectedLayers[0].group;
    const selectedNodes = selectedNodesSelector(state) || [];
    if (!selectedStyle || !selectedNodes.find(node => selectedStyle && selectedStyle === node)) return {};
    const metadata = get(state, 'stylesheet.metadata') || [];
    const { backgroundColor, ...form } = head(metadata.filter(({ id }) => selectedStyle !== undefined && id === selectedStyle)) || {};
    const stylesheets = [...selectedLayers]
        .reverse()
        .filter(val => val)
        .filter(({ visualStyleEditor }) => visualStyleEditor && visualStyleEditor.styleMetadataId === selectedStyle)
        .map(({ vectorStyle, name }) => vectorStyle && vectorStyle.body ? { layerName: name, group: [vectorStyle.body] } : null)
        .filter(val => val);
    const code = form.format && mergeStyleSheet(form && form.format, stylesheets);
    return {
        selectedStyle,
        form,
        code: form.format && setBackgroundColor(form.format, code, { backgroundColor, styleName: selectedStyle }),
        backgroundColor
    };
}, style => style);

class Stylesheet extends Component {
    static propTypes = {
        metadata: PropTypes.array,
        layers: PropTypes.array,
        enabled: PropTypes.boolean,
        auth: PropTypes.object
    };

    static defaultProps = {
        metadata: [],
        auth: {
            username: '',
            password: ''
        }
    };

    state = {
        selectedStyle: undefined,
        selectedTab: 'metadata',
        form: {},
        modal: {}
    };

    componentDidMount() {
        this.setState({
            form: this.props.form,
            currentFormat: this.props.form && this.props.form.format
        });
    }

    componentWillUpdate(newProps) {
        if (this.props.selectedStyle && !newProps.selectedStyle) {
            this.props.onClose();
        }
    }
    componentDidUpdate(prevProps) {
        if (this.props.selectedStyle && this.props.selectedStyle !== prevProps.selectedStyle) {
            this.setState({
                form: this.props.form,
                currentFormat: this.props.form && this.props.form.format,
                currentCode: this.props.code,
                sources: this.props.layers.reduce((acc, { styleLayerName, tileUrls, style, allowedSRS }) => {
                    const format = 'application/vnd.mapbox-vector-tile';
                    const tileUrlObj = (tileUrls || []).find((_tileUrl) => format === _tileUrl.format);
                    const tilingSchemeId = allowedSRS['EPSG:900913'] && 'EPSG:900913' || allowedSRS['EPSG:3857'] && 'EPSG:3857';
                    if (!tileUrlObj) {
                        const tileUrl = ((tileUrls || []).find((_tileUrl) => _tileUrl.format === 'image/png' || _tileUrl.format === 'image/png8') || {}).url;
                        if (!tileUrl) return { ...acc };
                        const url = (tileUrl || '')
                            .replace(/\{styleId\}/, style)
                            .replace(/\{tileMatrixSetId\}/, tilingSchemeId)
                            .replace(/\{tileMatrix\}/, `${tilingSchemeId}:{z}`)
                            .replace(/\{tileRow\}/, '{y}')
                            .replace(/\{tileCol\}/, '{x}');
                        return {
                            ...acc,
                            [styleLayerName]: {
                                type: 'raster',
                                tiles: [ url ]
                            }
                        };
                    }
                    const tileUrl = tileUrlObj.url;
                    const url = (tileUrl || '')
                        .replace(/\{styleId\}/, style)
                        .replace(/\{tileMatrixSetId\}/, tilingSchemeId)
                        .replace(/\{tileMatrix\}/, `${tilingSchemeId}:{z}`)
                        .replace(/\{tileRow\}/, '{y}')
                        .replace(/\{tileCol\}/, '{x}');
                    return {
                        ...acc,
                        [styleLayerName]: {
                            type: 'vector',
                            tiles: [ url ]
                        }
                    };
                }, {})
            });
        }
    }

    getInfo = () => {
        const { form } = this.state;
        const { stylesheets } = form;
        const style = stylesheets.find(({ native }) => native === true) || {};
        const styleUrl = (get(style, 'link.href') || '').split('?')[0];
        if (!styleUrl) return {};
        const { type } = style.link;

        const data = [
            'title',
            'description',
            'pointOfContact'
        ]
        .reduce((acc, key) => form[key]
            ? {
                ...acc,
                [key]: form[key]
            }
            : { ...acc }, {});

        return {
            styleId: form.id,
            data,
            type,
            styleUrl
        };
    };

    render() {
        const { selectedTab, form } = this.state;
        const { code, selectedStyle } = this.props;
        const selectedMetadataId = form && form.id;
        const tabs = [
            {
                key: 'metadata',
                id: 'metadata',
                glyph: 'list',
                Body: () => (
                    <div style={{ padding: '16px 8px' }}>
                        {this.state.saved &&
                            <Alert bsStyle={this.state.saved}>
                                {this.state.saved === 'success'
                                ? <span>Style saved correctly</span>
                                : <span>Error while saving the style</span>}
                            </Alert>
                        }
                        <FormGroup>
                            <ControlLabel>
                                Background Color
                            </ControlLabel>
                            <ColorSelector
                                color={tinycolor(this.props.backgroundColor).toRgb()}
                                onChangeColor={(backgroundColor) =>
                                    backgroundColor && this.props.setBackground(selectedStyle, tinycolor(backgroundColor).toHexString())}/>
                        </FormGroup>
                        <Form
                            key={selectedMetadataId}
                            values={form}
                            onBlur={(values) => this.setState({
                                form: values,
                                saved: null
                            })}
                            form={[
                                {
                                    type: 'text',
                                    id: 'title',
                                    label: 'Title',
                                    placeholder: 'Enter title...'
                                },
                                {
                                    type: 'textarea',
                                    id: 'description',
                                    label: 'Description',
                                    placeholder: 'Enter description...'
                                },
                                {
                                    type: 'text',
                                    id: 'pointOfContact',
                                    label: 'Point of Contact',
                                    placeholder: 'Enter author...'
                                }
                            ]}/>
                    </div>
                )
            },
            {
                key: 'code',
                id: 'code',
                glyph: 'code',
                Body: () => (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', height: '100%' }}>
                        <div style={{ padding: 8, zIndex: 10 }}>
                            <Form
                                values={{
                                    currentFormat: this.state.currentFormat
                                }}
                                form={[
                                    {
                                        type: 'select',
                                        id: 'currentFormat',
                                        label: 'Format',
                                        placeholder: 'Select format...',
                                        clearable: false,
                                        ignoreAccents: false,
                                        setValue: (fieldId, { currentFormat } = {}) => {
                                            return currentFormat && currentFormat.value && { currentFormat: currentFormat.value };
                                        },
                                        options: [{
                                            value: 'sld',
                                            label: 'SLD'
                                        }, {
                                            value: 'mbstyle',
                                            label: 'MapBox Style'
                                        }]
                                    }
                                ]}
                                onChange={({ currentFormat }) => {
                                    if (currentFormat && currentFormat !== this.state.currentFormat) {
                                        convertStyle(this.state.currentFormat, currentFormat, this.state.currentCode)
                                            .then((currentCode) => {
                                                this.setState({
                                                    currentCode,
                                                    currentFormat
                                                });
                                            });
                                    } else {
                                        this.setState({
                                            currentFormat: this.state.currentFormat
                                        });
                                    }
                                }}/>
                            <Toolbar
                                btnDefaultProps={{
                                    bsStyle: 'primary',
                                    tooltipPosition: 'left',
                                    bsSize: 'sm'
                                }}
                                buttons={[{
                                    text: 'Mapbox GL Preview',
                                    visible: this.state.currentFormat === 'mbstyle' ? true : false,
                                    onClick: () => this.setState({ mapboxGLPreview: true })
                                }]}/>
                            <ResizableModal
                                size="lg"
                                title="Mapbox GL Preview"
                                show={this.state.mapboxGLPreview}
                                onClose={() => this.setState({ mapboxGLPreview: false })}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%',
                                    transform: 'translate3d(0px, 0px, 0px)'
                                    }}>
                                    <MapboxGLMap
                                        center={[36.103666252, 32.621830846]}
                                        zoom={12}
                                        id="mapbox-gl-preview"
                                        mbstyle={
                                            toEditorCode(this.state.currentFormat, this.state.currentCode, this.state.sources, true)
                                        }/>
                                </div>
                            </ResizableModal>

                        </div>
                        <div style={{ flex: 1}}>
                            <Editor
                                key={selectedMetadataId}
                                code={toEditorCode(this.state.currentFormat, this.state.currentCode, this.state.sources)}
                                mode={formatToMode(this.state.currentFormat)}/>
                        </div>
                    </div>
                )
            }
        ].map(tab => ({...tab, active: tab.id === selectedTab}));

        const { Body } = head(tabs.filter(tab => tab.id === selectedTab)) || {};
        return this.props.enabled ? (
            <div style={{ width: 400, borderLeft: '1px solid #ddd' }}>
                <BorderLayout
                    className="ms-stylesheet"
                    header={
                        <div
                            style={{
                                padding: '16px 8px',
                                borderBottom: '1px solid #ddd',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                            <div style={{ flex: 1 }}>
                                {form && form.id}
                            </div>
                            <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md',
                                    bsStyle: 'primary',
                                    tooltipPosition: 'left'
                                }}
                                buttons={[
                                    {
                                        glyph: 'floppy-disk',
                                        tooltip: 'Save current style',
                                        loading: this.state.loading,
                                        onClick: () => {
                                            this.setState({ modal: {
                                                title: 'Save current style',
                                                show: true,
                                                content: 'save',
                                                saved: null
                                            } });
                                        }
                                    },
                                    {
                                        glyph: 'duplicate',
                                        tooltip: 'Clone current style',
                                        loading: this.state.loading,
                                        onClick: () => {
                                            this.setState({ cloneStyleName: `style-${uuidv1()}` });
                                            this.setState({ modal: {
                                                title: 'Clone current style',
                                                show: true,
                                                content: 'clone',
                                                saved: null
                                            } });
                                        }
                                    }
                                ]}/>
                        </div>
                    }>
                    {form && <Menu
                        tabs={tabs}
                        onSelect={(id) => this.setState({ selectedTab: id })}>
                        {Body && <Body/>}
                    </Menu>}
                    <ResizableModal
                        clickOutEnabled={false}
                        title={this.state.modal.title}
                        onClose={!this.state.loading ? () => this.setState({ modal: {}, cloneStyleName: undefined }) : null}
                        show={this.state.modal.show}
                        buttons={!this.state.loading ? (this.state.modal.content === 'clone'
                            ? [
                                {
                                    text: 'Clone',
                                    bsStyle: 'primary',
                                    bsSize: 'small',
                                    onClick: () => {
                                        if (!this.state.cloneStyleName) return;
                                        if (this.state.loading) return;
                                        const {
                                            data,
                                            type,
                                            styleUrl,
                                            styleId
                                        } = this.getInfo();
                                        if (!styleUrl) return;
                                        this.setState({ loading: true });
                                        const clonedStyleUrl = styleUrl.replace(styleId, this.state.cloneStyleName);
                                        axios.put(clonedStyleUrl, code, { auth: this.props.auth, headers: { 'Content-Type': type } })
                                        .then(() => [null, 'metadata saved'])
                                        .then(() => {
                                            return axios.put(`${clonedStyleUrl}/metadata`, data, { auth: this.props.auth })
                                                .then(() => [null, 'metadata saved']);
                                        })
                                        .then(() => {
                                            this.setState({
                                                loading: false,
                                                modal: {},
                                                saved: 'success'
                                            });
                                        })
                                        .catch(() => {
                                            this.setState({
                                                loading: false,
                                                modal: {},
                                                saved: 'danger' });
                                        });
                                        return;
                                    }
                                }
                            ]
                            : [
                                {
                                    text: 'Save',
                                    bsStyle: 'primary',
                                    bsSize: 'small',
                                    onClick: () => {
                                        if (this.state.loading) return;
                                        const {
                                            data,
                                            type,
                                            styleUrl
                                        } = this.getInfo();
                                        if (!styleUrl) return;
                                        this.setState({ loading: true });

                                        axios.put(styleUrl, code, { auth: this.props.auth, headers: { 'Content-Type': type } })
                                        .then(() => [null, 'metadata saved'])
                                        .then(() => {
                                            return axios.put(`${styleUrl}/metadata`, data, { auth: this.props.auth })
                                                .then(() => [null, 'metadata saved']);
                                        })
                                        .then(() => {
                                            this.setState({
                                                loading: false,
                                                modal: {},
                                                saved: 'success'
                                            });
                                        })
                                        .catch(() => {
                                            this.setState({
                                                loading: false,
                                                modal: {},
                                                saved: 'danger' });
                                        });
                                        return;
                                    }
                                }
                            ]) : []}
                        fade
                        fitContent>
                        {this.state.loading && <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>Saving Style...</div>}
                        {!this.state.loading && (this.state.modal.content === 'clone'
                            ? <div style={{ padding: 8}}>
                            <FormGroup>
                                <ControlLabel>
                                    Enter id for cloned style
                                </ControlLabel>
                                <FormControl
                                    type="text"
                                    value={this.state.cloneStyleName}
                                    onChange={(event) => this.setState({ cloneStyleName: event.target.value })}/>
                            </FormGroup>
                        </div>
                        : <div style={{ padding: 8, textAlign: 'center', width: '100%' }}>This operation will override current style on server.</div>)}
                    </ResizableModal>
                </BorderLayout>
            </div>
        ) : null;
    }
}

const TOCButton = connect(createSelector([
    state => get(state, 'controls.stylesheet.enabled')
], (enabled) => ({
    enabled
})), {
    onToggle: setControlProperty.bind(null, 'stylesheet', 'enabled', true)
})(({ status, enabled, onToggle, ...props }) => !enabled && status === 'GROUP'
    ? <Button {...props} onClick={() => onToggle()}>
        <Glyphicon glyph="sheet"/>
    </Button>
    : null);

export const StylesheetPlugin = assign(
    connect(createSelector(
        state => get(state, 'stylesheet.metadata') || [],
        stylesheetLayersSelector,
        state => get(state, 'controls.stylesheet.enabled'),
        selectedStyleSelector,
        state => get(state, 'controls.auth.username'),
        state => get(state, 'controls.auth.password'),
    (metadata, layers, enabled, selectedStyle, username, password) => ({
        metadata,
        layers,
        enabled,
        ...selectedStyle,
        auth: {
            username,
            password
        }
    })), {
        onClose: setControlProperty.bind(null, 'stylesheet', 'enabled', false),
        setBackground
    })(Stylesheet),
    {
        TOC: {
            priority: 1,
            tool: TOCButton,
            panel: true
        }
    }
);
export const reducers = {
    stylesheet
};
export const epics = {};
