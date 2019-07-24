/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import JSONTree from 'react-json-tree';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import axios from 'axios';
import { getLayerFromId } from '@mapstore/api/WFS3';
import { FormGroup, InputGroup, Glyphicon, FormControl } from 'react-bootstrap';
import { head, isObject } from 'lodash';
import Loader from '@mapstore/components/misc/Loader';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import * as smEpics from '../epics/stylesmanager';
import { nightStyle } from './stylemanager/mockData';

const theme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#000000',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633'
};

const ogcInitMapAction = (config) => ({
    type: 'OGC:INIT_MAP',
    config
});

class SearchInput extends Component {

    static propTypes = {
        service: PropTypes.string,
        onChange: PropTypes.func,
        loading: PropTypes.bool
    };

    state = {
        service: ''
    };

    componentWillMount() {
        this.setState({
            service: this.props.service
        });
    }

    render() {
        const { onChange = () => {}, loading } = this.props;
        const { service = '' } = this.state;
        return (
            <div className="ms-style-search-input">
                <div>
                    <FormGroup
                        controlId="service"
                        key="service">
                        <InputGroup>
                            <FormControl
                                value={service}
                                type="text"
                                placeholder="Enter style service..."
                                onChange={(event) => this.setState({ service: event.target.value })}/>
                            <InputGroup.Addon
                                className="btn"
                                onClick={() => loading ? () => {} : onChange(service)}>
                                {loading && <Loader size={19}/> || <Glyphicon glyph="search"/>}
                            </InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>
                </div>
            </div>
        );
    }
}

class StyleList extends Component {

    static propTypes = {
        onSelect: PropTypes.func,
        onInfo: PropTypes.func,
        styles: PropTypes.array
    };

    render() {
        const { onSelect = () => {}, styles = [], onInfo = () => {} } = this.props;
        return (
            <div className="ms-style-list">
                {styles.map((styleMetadata) => {
                    const { id, title, description, pointOfContact, error } = styleMetadata || {};
                    return (
                        <div
                            key={id}
                            className="ms-style-card">
                            <div onClick={() => onSelect(styleMetadata)}>
                                <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'info-sign',
                                            tooltip: 'Show all style metadata',
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                const { links, ...selected } = styleMetadata;
                                                onInfo(selected);
                                            }
                                        }
                                    ]}/>
                                <div className="ms-style-card-preview">

                                </div>
                                <h4>{error && <Glyphicon glyph="exclamation-mark" className="text-danger"/>}{title || id}</h4>
                                <p>{description}</p>
                                <p>{pointOfContact && <small>by {pointOfContact}</small>}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

class StylesManager extends Component {
    static propTypes = {
        onInit: PropTypes.func,
        styles: PropTypes.array
    };

    static defaultProps = {
        onInit: () => {},
        styles: [
            nightStyle
        ]
    };

    state = {
        service: '/geoserver/ogc/styles',
        styles: [],
        loading: false
    };

    render() {
        return (
            <div
                className="ms-styles-manager">
                <BorderLayout
                    header={<SearchInput
                        loading={this.state.loading}
                        service={this.state.service}
                        onChange={(service) => {
                            this.setState({
                                loading: true,
                                error: false
                            });
                            axios.get(service)
                                .then(({ data }) => {
                                    const { links = [] } = data;
                                    const apiUrl = head(links
                                        .filter(({ rel, type }) => rel === 'service' && type === 'application/json')
                                        .map(({ href }) => href));
                                    const conformanceUrl = head(links
                                        .filter(({ rel, type }) => rel === 'conformance' && type === 'application/json')
                                        .map(({ href }) => href));
                                    const dataUrl = head(links
                                        .filter(({ rel, type }) => rel === 'data' && type === 'application/json')
                                        .map(({ href }) => href));
                                    return [ apiUrl, conformanceUrl, dataUrl ];
                                })
                                .then((urls) => {
                                    return axios.all(urls.map(url =>
                                        axios.get(url)
                                            .then(({ data }) => data)
                                            .catch(() => null)
                                        )
                                    );
                                })
                                .then((res = []) => {
                                    const { styles } = res[2] || {};
                                    return styles ? styles : [];
                                })
                                .then((styles) => {
                                    return axios.all(
                                        styles.map((style) => {
                                            const describeBy = head(style.links
                                                .filter(({ rel, type }) => rel === 'describeBy' && type === 'application/json')
                                                .map(({ href }) => href));
                                            return describeBy
                                                ? axios.get(describeBy)
                                                    .then(({ data }) => ({ ...style, ...data }))
                                                    .catch(() => ({ ...style, error: true }))
                                                : null;
                                        }).filter(val => val)
                                    );
                                })
                                .then((styles) => {
                                    this.setState({
                                        styles,
                                        loading: false
                                    });
                                })
                                .catch(({ data }) => {
                                    this.setState({
                                        styles: [],
                                        loading: false,
                                        error: isObject(data) && data.description || 'Connection error'
                                    });
                                });
                        }}/>
                    }>
                    {this.state.error ? <div className="text-danger text-center" style={{ padding: 8 }}><Glyphicon glyph="exclamation-mark"/> {this.state.error}</div> : <StyleList
                        styles={[...this.props.styles, ...this.state.styles]}
                        onInfo={(styleMetadata) => this.setState({ selected: styleMetadata })}
                        onSelect={(styleMetadata) => {
                            this.parseStyle(styleMetadata);
                        }}/>}
                </BorderLayout>
                <ResizableModal
                    fade
                    fitContent
                    show={this.state.selected}
                    title={<span><Glyphicon glyph="info-sign"/> {this.state.selected && (this.state.selected.title || this.state.selected.id)}</span>}
                    onClose={() => this.setState({ selected: null })}>
                    <div style={{ padding: 8 }}>
                        {this.state.selected && <JSONTree
                            invertTheme
                            theme={theme}
                            data={this.state.selected}
                            hideRoot/>}
                    </div>
                </ResizableModal>
            </div>
        );
    }

    parseStyle = (styleMetadata) => {
        const { layers = [], stylesheets = [] } = styleMetadata || {};
        const stylesUrls = stylesheets
            .map(({ link }) => {
                return link && link.href;
            })
            .filter(val => val);
        const layersUrls = layers
            .map(({ id, sampleData }) => {
                const layerUrl = sampleData && sampleData.href && sampleData.href;
                return {
                    id,
                    layerUrl
                };
            })
            .filter(val => val);
        axios.all(
            [
                ...stylesUrls
                .map(
                    (url) => axios.get(url)
                        .then(({ data }) => data )
                        .catch(() => null )
                ),
                ...layersUrls.map(({ layerUrl, id }) =>
                    getLayerFromId(layerUrl, id)
                )
            ]
        )
        .then((response) => {
            this.props.onInit({
                styleMetadata,
                layers: response.filter((res, idx) => idx >= stylesUrls.length),
                styles: response.filter((res, idx) => idx < stylesUrls.length)
                    .map((styleBody, idx) => ({
                        ...stylesheets[idx],
                        styleBody
                    }))
            });
        });
    }
}

export const StylesManagerPlugin = connect(() => ({}), { onInit: ogcInitMapAction })(StylesManager);
export const reducers = {};
export const epics = smEpics;
