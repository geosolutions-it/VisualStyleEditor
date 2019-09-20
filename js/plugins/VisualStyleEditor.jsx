/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import assign from 'object-assign';
import { connect } from 'react-redux';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';
import { Button, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import { setControlProperty } from '@mapstore/actions/controls';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import SwitchButton from '@mapstore/components/misc/switch/SwitchButton';
import Editor from '@mapstore/components/styleeditor/Editor';
import Loader from '@mapstore/components/misc/Loader';
import { getUpdatedLayer } from '@mapstore/selectors/styleeditor';
import { updateNode } from '@mapstore/actions/layers';
import { getLayerCapabilities } from '@mapstore/actions/layerCapabilities';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import Container from '../components/Container';
import axios from 'axios';
import VisualEditor from './visual-style-editor/VisualEditor';

const SLD_EXAMPLE = ``;
function formatToMode(format) {
    const modes = {
        mbstyle: 'application/json',
        sld: 'xml'
    };
    return modes[format];
}

function toEditorCode(format, code) {
    if (format === 'mbstyle' && isObject(code)) {
        try {
            return JSON.stringify(code, null, 2);
        } catch(e) {
            return '{}';
        }
    }
    return code;
}

function fromEditorCode(format, code) {
    if (format === 'mbstyle' && isString(code)) {
        try {
            return JSON.parse(code);
        } catch(e) {
            return {};
        }
    }
    return code;
}

class VisualStyleEditor extends Component {
    static propTypes = {
        layer: PropTypes.object,
        layerName: PropTypes.string,
        code: PropTypes.string,
        onChange: PropTypes.func,
        auth: PropTypes.object,
        format: PropTypes.string
    };

    static defaultProps = {
        onChange: () => {},
        auth: {
            username: '',
            password: ''
        }
    };

    state = {
        visual: true
    };

    componentWillMount() {
        this.setState({
            code: this.props.code || SLD_EXAMPLE,
            format: this.props.format || 'sld'
        });
    }

    componentWillReceiveProps(newProps) {
        if (newProps.code && newProps.code !== this.props.code) {
            this.setState({
                code: newProps.code,
                format: newProps.format
            });
        }
    }

    render() {
        const {
            code,
            visual,
            loading,
            format
        } = this.state;

        const {
            id,
            availableStyles = [],
            name: layerName,
            style
        } = this.props.layer || {};

        return (
            <Container layout>
                <BorderLayout
                    header={[
                        <div style={{ display: 'flex', padding: 8, borderBottom: '1px solid #ddd' }}>
                            <div style={{
                                flex: '1',
                                whiteSpace: 'nowrap',
                                width: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                                }}>
                                {layerName}
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div className="ms-switch-style-editor">
                                    <div className="ms-switch-loader">
                                        {loading && !visual
                                        ? <Loader size={17}/>
                                        : <Glyphicon
                                            glyph="tasks"
                                            className={visual && 'text-primary'}
                                            style={{ padding: '0 8px'}}/>}
                                    </div>
                                    <SwitchButton
                                            checked={!visual}
                                            onChange={() => {
                                                if (loading) return null;
                                                this.setState({ loading: true });
                                                return setTimeout(() => {
                                                    this.setState({ visual: !visual, loading: false });
                                                }, 500);
                                            }}/>
                                    <div className="ms-switch-loader">
                                        {loading && visual
                                        ? <Loader size={17}/>
                                        : <Glyphicon
                                            glyph="code"
                                            className={!visual && 'text-primary'}
                                            style={{ padding: '0 8px'}}/>}
                                    </div>
                                </div>
                                <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border',
                                        tooltipPosition: 'bottom'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'ok',
                                            tooltip: 'Apply style',
                                            onClick: () => this.saveStyle()
                                        }
                                    ]}/>
                            </div>
                        </div>,
                        <div style={{
                            padding: 8,
                            display: 'flex',
                            alignItems: 'center',
                            borderBottom: '1px solid #ddd'
                            }}>
                            <div style={{ flex: 1 }}>
                                <Select
                                    clearable={false}
                                    value={style || availableStyles[0]}
                                    placeholder="Select style..."
                                    onChange={({ value }) =>
                                        this.props.onChange(id, 'layers', { style: value })
                                    }
                                    options={availableStyles
                                        .map(({ name, title }) => ({
                                            value: name,
                                            label: title || name
                                        }))}/>
                            </div>
                            <div>
                                <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'trash',
                                            tooltip: 'Remove style'
                                        },
                                        {
                                            glyph: 'plus',
                                            tooltip: 'Create style'
                                        }
                                    ]}/>
                            </div>
                        </div>
                    ]}>
                    {visual
                        ? <VisualEditor
                            id={layerName}
                            code={code}
                            format={format}
                            onChange={(_code) => this.updateCode(_code)}/>
                        : <Editor
                            code={toEditorCode(format, code)}
                            onChange={(newCode) => this.updateCode(fromEditorCode(format, newCode))}
                            mode={formatToMode(format)}/>}
                </BorderLayout>
            </Container>
        );
    }

    updateCode = (styleBody) => {
        const {
            id
        } = this.props.layer || {};

        this.props.onChange(id, 'layers', {
            vectorStyle: {
                format: this.state.format,
                body: styleBody
            }
        });
    }

    saveStyle = () => {
        const { visualStyleEditor, style, vectorStyle } = this.props.layer;
        const availableStyles = visualStyleEditor.availableStyles || [];
        const currentStyle = availableStyles.find(availableStyle => availableStyle.id === style || availableStyle.native);
        if (!currentStyle) return null;
        const styleUrl = (get(currentStyle, 'link.href') || '').split('?')[0];
        const { type } = currentStyle.link;
        axios.put(styleUrl, vectorStyle.body, { auth: this.props.auth, headers: { 'Content-Type': type } })
            .then(() => {
                this.props.onChange(this.props.layer.id, 'layers', {
                    _v_: Math.random()
                });
            })
            .catch(() => {

            });
    };
}

const VisualStyleEditorEnhanced = loadingState(({ loading }) => loading)(VisualStyleEditor);
const TOCButton = connect(createSelector([
    state => get(state, 'controls.visualStyleEditor.enabled')
], (enabled) => ({
    enabled
})), {
    onToggle: setControlProperty.bind(null, 'visualStyleEditor', 'enabled', true)
})(({ status, enabled, onToggle, ...props }) => !enabled && status === 'LAYER'
    ? <Button {...props} onClick={() => onToggle()}>
        <Glyphicon glyph="dropper"/>
    </Button>
    : null);


class TOCPanel extends React.Component {

    static propTypes = {
        enabled: PropTypes.string,
        selectedLayer: PropTypes.string,
        onChange: PropTypes.func,
        onClose: PropTypes.func,
        auth: PropTypes.object
    };

    componentWillMount() {
        // this.props.onUpdateLayer(this.props.selectedLayer);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.onClose && !newProps.selectedLayer.name && this.props.selectedLayer.name) {
            this.props.onClose();
        }

        if ((newProps.selectedLayer.name
        && newProps.selectedLayer.name !== this.props.selectedLayer.name
        && newProps.enabled)
        || newProps.enabled && !this.props.enabled) {
            // this.props.onUpdateLayer(newProps.selectedLayer);
        }
    }

    render() {
        const { enabled, selectedLayer = {}, onChange = () => {} } = this.props;
        const { /*availableStyles = [], style,*/ name, vectorStyle } = selectedLayer;
        /*const styleObj = style && head(availableStyles.filter(({ _name }) => _name === style))
            || head(availableStyles.filter(({ link }) => link && link.type.indexOf('sld') !== -1 ));*/

        return enabled
            ? <div
                className="ms-visual-style-editor"
                style={{
                    position: 'relative',
                    width: 300,
                    transform: 'translate(0, 0)',
                    borderLeft: '1px solid #ddd'
                }}>
                <VisualStyleEditorEnhanced
                    loading={selectedLayer.capabilitiesLoading}
                    layerName={name}
                    layer={selectedLayer}
                    code={vectorStyle && vectorStyle.body}
                    format={vectorStyle && vectorStyle.format}
                    onChange={onChange}
                    auth={this.props.auth}/>
            </div>
            : null;
    }
}

const VSE = connect(
    createSelector([
        state => get(state, 'controls.visualStyleEditor.enabled'),
        getUpdatedLayer,
        state => get(state, 'controls.auth.username'),
        state => get(state, 'controls.auth.password')
    ], (enabled, selectedLayer, username, password) => ({
        enabled,
        selectedLayer,
        auth: {
            username,
            password
        }
    })),
    {
        onChange: updateNode,
        onClose: setControlProperty.bind(null, 'visualStyleEditor', 'enabled', false),
        onUpdateLayer: getLayerCapabilities
    }
)(TOCPanel);

export const VisualStyleEditorPlugin = assign(VSE, {
    TOC: {
        priority: 1,
        tool: TOCButton,
        panel: true
    }
});

export const reducers = {};
