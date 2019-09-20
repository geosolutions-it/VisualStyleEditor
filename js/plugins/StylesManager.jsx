/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import JSONTree from 'react-json-tree';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import axios from 'axios';
import { FormGroup, InputGroup, Glyphicon, FormControl } from 'react-bootstrap';
import { head, isObject } from 'lodash';
import Loader from '@mapstore/components/misc/Loader';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import ResizableModal from '@mapstore/components/misc/ResizableModal';
import * as smEpics from '../epics/stylesmanager';
import { push } from 'react-router-redux';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';

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

const getOGCStyles = (serviceUrl) =>
    axios.get(serviceUrl)
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
        });

class SearchInput extends Component {

    static propTypes = {
        service: PropTypes.string,
        onChange: PropTypes.func,
        loading: PropTypes.bool,
        filterText: PropTypes.string,
        onFilter: PropTypes.func
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
                    <br />
                    <FormGroup
                        controlId="filter"
                        key="filter">
                        <FormControl
                            value={ this.props.filterText || ''}
                            type="text"
                            placeholder="Filter styles..."
                            onChange={(event) => this.props.onFilter(event.target.value)}/>
                    </FormGroup>
                </div>
            </div>
        );
    }
}

const StyleList = compose(
    loadingState(({ loading }) => loading),
    emptyState(({ error }) => error, ({ error }) => ({
        glyph: 'exclamation-sign',
        title: 'Error',
        description: error
    })),
    emptyState(({ styles = [] }) => styles.length === 0, {
        glyph: '1-stilo',
        title: 'Style API',
        description: 'Enter a style service in the input above',
        content: <small>eg: http://my-hostname/geoserver/ogc/styles</small>
    })
    )(class extends Component {

    static propTypes = {
        onSelect: PropTypes.func,
        onInfo: PropTypes.func,
        styles: PropTypes.array,
        selected: PropTypes.bool
    };

    render() {
        const { onSelect = () => {}, styles = [], onInfo = () => {} } = this.props;
        return (
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap'
                }}>
                {styles.map((styleMetadata) => {
                    const { id, title, description, pointOfContact, error, links = [], loading, selected } = styleMetadata || {};
                    const thumbnail = head(links.filter(({ rel }) => rel === 'preview'));
                    const thumbUrl = thumbnail && thumbnail.href;
                    return (
                        <div
                            key={id}
                            style={{
                                padding: 8,
                                width: '25%'
                            }}>
                            <div
                                className="shadow-soft"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #ddd',
                                    padding: 8,
                                    wordBreak: 'break-word',
                                    outline: selected ? '2px solid #078aa3' : undefined
                                }}
                                onClick={(event) => onSelect(event, styleMetadata)}>
                                <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'info-sign',
                                            tooltip: 'Show all style metadata',
                                            loading,
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                onInfo(styleMetadata);
                                            }
                                        }
                                    ]}/>
                                <div
                                    style={{
                                        ...(thumbUrl
                                        ? {
                                            background: `url(${thumbUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }
                                        : {
                                            backgroundColor: '#ddd',
                                            display: 'flex'
                                        }
                                        ),
                                        height: 100
                                    }}>
                                    {!thumbUrl && <Glyphicon glyph="1-stilo" style={{ fontSize: 50, margin: 'auto', color: '#aaa' }}/>}
                                </div>
                                <h4>{error && <Glyphicon glyph="exclamation-mark" className="text-danger"/>}{title || id}</h4>
                                <p>{description}</p>
                                <p>
                                    {pointOfContact && <div><small>by {pointOfContact}</small></div>}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
});

class StylesManager extends Component {
    static propTypes = {
        onInit: PropTypes.func,
        styles: PropTypes.array,
        defaultService: PropTypes.string
    };

    static defaultProps = {
        defaultService: '',
        onInit: () => {},
        styles: [ ]
    };

    state = {
        service: '',
        styles: [],
        loading: false
    };

    componentWillMount() {
        localStorage.setItem('selectedStyles', JSON.stringify([]));
        localStorage.setItem('serviceUrl', null);
        this.setState({
            service: this.props.defaultService
        });
    }

    render() {
        return (
            <div
                className="ms-styles-manager">
                <BorderLayout
                    header={[<SearchInput
                        key="search-input"
                        loading={this.state.loading}
                        service={this.state.service}
                        filterText={this.state.filterText || ''}
                        onFilter={(filterText) => this.setState({ filterText })}
                        onChange={(service) => {
                            this.setState({
                                loading: true,
                                error: false,
                                filterText: ''
                            });
                            getOGCStyles(service)
                                .then((styles) =>
                                    this.setState({
                                        styles,
                                        loading: false
                                    })
                                )
                                .catch(({ data }) =>
                                    this.setState({
                                        styles: [],
                                        loading: false,
                                        error: isObject(data) && data.description || 'Connection error'
                                    })
                                );
                        }}/>,
                        <div key="toolbar" style={{ borderBottom: '1px solid #ddd', padding: 8, display: 'flex', justifyContent: 'center' }}>
                            <Toolbar
                                btnDefaultProps={{
                                    className: 'square-button-md',
                                    bsStyle: 'primary'
                                }}
                                buttons={[{
                                    glyph: 'pencil',
                                    disabled: (this.state.selectedStyles || []).length > 0 ? false : true,
                                    tooltip: (this.state.selectedStyles || []).length > 1 ? 'Edit selected styles' : 'Edit selected style',
                                    onClick: () => this.props.onInit('/visual-style-editor')
                                }]}/>
                        </div>
                        ]
                    }>
                    <StyleList
                        styles={this.state.styles
                            .filter((style) => !this.state.filterText || this.state.filterText &&
                                style.id && style.id.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1
                                || style.title && style.title.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1
                            )
                            .map((style) => ({
                                ...style,
                                selected: (this.state.selectedStyles || []).indexOf(style.id) !== -1
                            }))}
                        loading={this.state.loading}
                        error={this.state.error}
                        onInfo={(styleMetadata) => {
                            const loadStyles = this.state.styles
                                .map((metadata) => {
                                    if (metadata.id === styleMetadata.id) {
                                        return {...metadata, loading: true};
                                    }
                                    return metadata;
                                });
                            this.setState({
                                styles: loadStyles
                            });
                            this.updateStyle(styleMetadata)
                                .then((style) => {
                                    const newStyles = this.state.styles
                                        .map((metadata) => {
                                            if (metadata.id === style.id) {
                                                return {...style, loading: false};
                                            }
                                            return metadata;
                                        });
                                    this.setState({
                                        styles: newStyles,
                                        selected: style
                                    });
                                });
                        }}
                        onSelect={(event, styleMetadata) => {
                            const add = true; // event.ctrlKey;
                            const isSelected = (this.state.selectedStyles || []).find((id) => id === styleMetadata.id);
                            let selectedStyles = [];
                            if (isSelected) {
                                selectedStyles = this.state.selectedStyles.filter((id) => id !== styleMetadata.id);
                            } else {
                                selectedStyles = add
                                ? [ ...(this.state.selectedStyles || []), styleMetadata.id ]
                                : [ styleMetadata.id ];
                            }
                            this.setState({ selectedStyles });
                            this.selectStyle(styleMetadata, add, isSelected);
                        }}/>
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

    updateStyle = (style) => {
        if (style && style.layers) return new Promise((resolve) => resolve(style));
        const describedBy = head(style.links
            .filter(({ rel, type }) => rel === 'describedBy' && type === 'application/json')
            .map(({ href }) => href));
        return axios.get(describedBy)
            .then(({ data }) => ({ ...style, ...data }))
            .catch(() => ({ ...style, error: true }));
    }

    selectStyle = (styleMetadata = {}, add = true, isSelected) => {
        localStorage.setItem('serviceUrl', this.state.service);
        if (isSelected) {
            let selectedStyles;
            try {
                selectedStyles = JSON.parse(localStorage.getItem('selectedStyles'));
            } catch (e) {
                selectedStyles = [];
            }
            selectedStyles = selectedStyles.filter(({ id }) => id !== styleMetadata.id);
            localStorage.setItem('selectedStyles', JSON.stringify(selectedStyles));
            return null;
        }
        if (!add) return localStorage.setItem('selectedStyles', JSON.stringify([styleMetadata]));
        let selectedStyles;
        try {
            selectedStyles = JSON.parse(localStorage.getItem('selectedStyles'));
        } catch (e) {
            selectedStyles = [];
        }
        selectedStyles = selectedStyles.filter(({ id }) => id !== styleMetadata.id);
        const newSelectedStyles = [
            ...selectedStyles,
            styleMetadata
        ];
        localStorage.setItem('selectedStyles', JSON.stringify(newSelectedStyles));
        return null;
    }
}

export const StylesManagerPlugin = connect(() => ({}), { onInit: push })(StylesManager);
export const reducers = {};
export const epics = smEpics;
