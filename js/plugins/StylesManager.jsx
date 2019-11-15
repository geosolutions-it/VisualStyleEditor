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
// import isNumber from 'lodash/isNumber';

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

import urlParser from 'url';

const getFullHREF = function(service, href) {
    if (!href || href.match(/http/)) {
        return href;
    }
    const { protocol, host } = urlParser.parse(service);
    const parsedHref = urlParser.parse(href);
    return urlParser.format({
        ...parsedHref,
        protocol,
        host
    });
};

export const getOGCStyles = (serviceUrl) =>
    axios.get(serviceUrl)
        .then(({ data }) => {
            const { links = [] } = data;
            const apiUrl = head(links
                .filter(({ rel, type }) => rel === 'service' && type === 'application/json')
                .map(({ href }) => getFullHREF(serviceUrl, href)));
            const conformanceUrl = head(links
                .filter(({ rel, type }) => rel === 'conformance' && type === 'application/json')
                .map(({ href }) => getFullHREF(serviceUrl, href)));
            const dataUrl = head(links
                .filter(({ rel, type }) =>
                    rel === 'styles' && type === 'application/json' // gs
                    || rel === 'styles' && type === undefined // ii
                )
                .map(({ href }) => getFullHREF(serviceUrl, href)));
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
        stylesService: PropTypes.string,
        tilesService: PropTypes.string,
        onSearch: PropTypes.func,
        loading: PropTypes.bool,
        filterText: PropTypes.string,
        onFilter: PropTypes.func,
        onEdit: PropTypes.func,
        editLabel: PropTypes.string,
        editDisabled: PropTypes.bool,
        label: PropTypes.string
    };

    render() {
        const { onSearch = () => {}, loading, onEdit = () => {}, editDisabled } = this.props;
        const disabled = editDisabled;
        return (
            <div className="ms-style-search-input">
                <div>
                    <div><h4>{this.props.label}</h4></div>
                    <div><h5>Styles API Service</h5></div>
                    {/*<div><p>{this.props.stylesService}</p></div>*/}
                    {this.props.tilesService && <div><h5>Tiles API Service (needed for Visual Style Editor)</h5></div>}
                    {/*this.props.tilesService && <div><p>{this.props.tilesService}</p></div>*/}
                    <FormGroup
                        controlId="filter"
                        key="filter"
                        style={{ marginTop: 4 }}>
                        <InputGroup>
                            <FormControl
                                value={ this.props.filterText || ''}
                                type="text"
                                placeholder="Filter styles..."
                                onChange={(event) => this.props.onFilter(event.target.value)}/>
                            <InputGroup.Addon
                                className="btn"
                                onClick={() => loading ? () => {} : onSearch()}>
                                {loading && <Loader size={19}/> || <Glyphicon glyph="search"/>}
                            </InputGroup.Addon>
                        </InputGroup>
                    </FormGroup>
                    <FormGroup
                        controlId="edit"
                        key="edit"
                        style={{ marginTop: 4 }}>
                        <InputGroup>
                            {this.props.tilesService && <InputGroup.Addon
                                className="btn"
                                disabled={disabled}
                                onClick={() => loading || disabled ? () => {} : onEdit()}>
                                {this.props.editLabel}
                            </InputGroup.Addon>}
                        </InputGroup>
                    </FormGroup>
                </div>
                <hr />
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
        description: 'Click on search button'
    })
    )(class extends Component {

    static propTypes = {
        onSelect: PropTypes.func,
        onInfo: PropTypes.func,
        styles: PropTypes.array,
        selected: PropTypes.bool,
        onDelete: PropTypes.func,
        stylesService: PropTypes.string
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
                                        }/* ,
                                        {
                                            glyph: 'trash',
                                            tooltip: 'Show all style metadata',
                                            loading,
                                            visible: styleMetadata.id.indexOf('style-') !== -1 ? true : false,
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                axios.delete(`${this.props.stylesService}/styles/${styleMetadata.id}`)
                                                    .then(() => {
                                                        this.props.onDelete(styleMetadata.id);
                                                    });
                                            }
                                        }*/
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
        styles: PropTypes.array
    };

    static defaultProps = {
        defaultStylesService: '',
        defaultTilesService: '',
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
        try {
            const option = JSON.parse(localStorage.getItem('stylesAPIService'));
            const { services = {}, label } = option || {};
            this.setState({
                label,
                stylesService: services.stylesAPI,
                tilesService: services.tilesAPI
            });
        } catch (e) {
            //
        }
    }

    render() {
        return (
            <div
                className="ms-styles-manager">
                <BorderLayout
                    header={<SearchInput
                        key="search-input"
                        loading={this.state.loading}
                        stylesService={this.state.stylesService}
                        tilesService={this.state.tilesService}
                        filterText={this.state.filterText || ''}
                        onFilter={(filterText) => this.setState({ filterText })}
                        onEdit={() => this.props.onInit('/visual-style-editor')}
                        editDisabled={(this.state.selectedStyles || []).length > 0 ? false : true}
                        label={this.state.label}
                        editLabel={(this.state.selectedStyles || []).length > 1 ? 'Edit Selected Styles' : 'Edit Selected Style'}
                        onSearch={() => {
                            this.setState({
                                loading: true,
                                error: false,
                                filterText: ''
                            });
                            getOGCStyles(this.state.stylesService)
                                .then((styles) =>
                                    this.setState({
                                        styles,
                                        loading: false,
                                        serviceUrl: this.state.stylesService
                                    })
                                )
                                .catch(({ data }) =>
                                    this.setState({
                                        styles: [],
                                        loading: false,
                                        error: isObject(data) && data.description || 'Connection error'
                                    })
                                );
                        }}/>
                    }>
                    <StyleList
                        stylesService={this.state.stylesService}
                        styles={this.state.styles
                            .filter((style) => !this.state.filterText || this.state.filterText &&
                                style.id && style.id.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1
                                || style.title && style.title.toLowerCase().indexOf(this.state.filterText.toLowerCase()) !== -1
                            )
                            .filter((style) => style.id !== 'point'
                            && style.id !== 'line'
                            && style.id !== 'polygon'
                            && style.id !== 'generic'
                            && style.id !== 'raster')
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
                        onDelete={(id) => {
                            this.setState({
                                styles: this.state.styles.filter((style) => style.id !== id)
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
            .filter(({ rel, type }) => (
                rel === 'describedBy' && type === 'application/json' // gs
                || rel === 'describedBy' && type === undefined // ii
            ))
            .map(({ href }) => getFullHREF(this.state.serviceUrl, href)));
        return axios.get(describedBy)
            .then(({ data }) => ({ ...style, ...data }))
            .catch(() => ({ ...style, error: true }));
    }

    selectStyle = (styleMetadata = {}, add = true, isSelected) => {
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
