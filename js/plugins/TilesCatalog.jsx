/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import { addLayer } from '@mapstore/actions/layers';
import { Pagination, FormGroup, InputGroup, FormControl, Glyphicon, Alert } from 'react-bootstrap';
import { textSearch } from '../api/OGC';
import Loader from '@mapstore/components/misc/Loader';
import uuidv1 from 'uuid/v1';
import { isVectorFormat } from '@mapstore/utils/VectorTileUtils';
import { mimeTypeToStyleFormat } from '@mapstore/utils/VectorStyleUtils';
import isString from 'lodash/isString';

class TilesCatalogPlugin extends React.Component {
    static propTypes = {
        pageSize: PropTypes.number,
        onAdd: PropTypes.func
    };

    static defaultProps = {
        pageSize: 10,
        onAdd: () => { }
    };

    state = {
        service: ''
    };

    componentWillMount() {
        try {
            const option = JSON.parse(localStorage.getItem('tilesAPIService'));
            const { services = {}, label } = option || {};
            if (isString(services.tilesAPI)) {
                this.setState({
                    label,
                    service: services.tilesAPI
                });
            } else {
                this.setState({
                    label,
                    service: services.tilesAPI,
                    records: services.tilesAPI,
                    page: 0,
                    total: services.tilesAPI.length
                });
            }
        } catch (e) {
            //
        }
    }

    render() {
        const {
            page = 0,
            records = [],
            total = 0
        } = this.state;
        const numberOfPage = Math.ceil(total / this.props.pageSize);
        return (
            <div className="ms-tiles-catalog">
                <BorderLayout
                    header={isString(this.state.service) ? <div>
                        <div><h4>{this.state.label} Tiles API Service</h4></div>
                        {/*<div><p><small>{ this.state.service }</small></p></div>*/}
                        <FormGroup
                            controlId="filter"
                            key="filter">
                            <InputGroup>
                                <FormControl
                                    value={this.state.filterText || ''}
                                    type="text"
                                    placeholder="Filter collections..."
                                    onChange={(event) => this.setState({ filterText: event.target.value })} />
                                <InputGroup.Addon
                                    className="btn"
                                    onClick={() => this.state.loading ? () => { } : this.search()}>
                                    {this.state.loading && <Loader size={19} /> || <Glyphicon glyph="search" />}
                                </InputGroup.Addon>
                            </InputGroup>
                        </FormGroup>
                        {this.state.error && <Alert bsStyle="danger"> <div>{this.state.error}</div></Alert>}
                        {!this.state.error && (this.state.records || []).length === 0 && (
                            <div style={{ padding: 8, textAlign: 'center', fontStyle: 'italic' }}>
                                click on search button
                        </div>
                        )}
                    </div>
                    : <div>
                        <div><h4>{this.state.label} Tiles API</h4></div>
                        <div><p><small>Direct access to collection not implemented from client,
                            some layers are pre-configured to test tiles templates</small></p></div>
                    </div>}
                    footer={
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <Pagination
                                    prev
                                    next
                                    first
                                    last
                                    ellipsis
                                    boundaryLinks
                                    bsSize="small"
                                    items={numberOfPage}
                                    maxButtons={2}
                                    activePage={page + 1}
                                    onSelect={this.state.loading
                                        ? undefined
                                        : (newPage) => this.search((newPage - 1) * this.props.pageSize + 1, newPage - 1)
                                    } />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>{records.length} of {total}</div>
                        </div>
                    }>
                    <SideGrid
                        size="sm"
                        items={records
                            .map((layer) => ({
                                id: layer.name,
                                title: layer.title || layer.name,
                                tools: <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md',
                                        bsStyle: 'primary'
                                    }}
                                    buttons={layer.error
                                        ? [
                                            {
                                                glyph: 'exclamation-mark',
                                                tooltip: layer.error,
                                                bsStyle: 'danger'
                                            }
                                        ]
                                        : [
                                            {
                                                glyph: 'plus',
                                                tooltip: 'Add layer to map',
                                                onClick: () => {
                                                    const { style, availableStyles = [], tileUrls } = layer;
                                                    const { format } = tileUrls.find((tileUrl) => isVectorFormat(tileUrl.format)) || {};
                                                    const updatedOptions = format && availableStyles.length === 1 && availableStyles[0].id === ''
                                                        ? {
                                                            format,
                                                            tileUrls: tileUrls.filter((tileUrl) => isVectorFormat(tileUrl.format)),
                                                            isLayerGroup: true
                                                        }
                                                        : {};
                                                    const availableStyle = availableStyles.find(({ id }) => id === style) || {};
                                                    const { links = [] } = availableStyle;
                                                    const stylesLinks = links.filter(({ rel }) => rel === 'stylesheet') || {};
                                                    const { href: url, type: mimeType } = stylesLinks.length > 1
                                                        && stylesLinks.filter(({ type }) => type.indexOf('sld') === -1)[0]
                                                        || stylesLinks[0] || {};
                                                    const vectorStyleParam = url
                                                        ? {
                                                            vectorStyle: {
                                                                url,
                                                                format: mimeTypeToStyleFormat(mimeType)
                                                            }
                                                        }
                                                        : {};
                                                    this.props.onAdd({
                                                        id: uuidv1(),
                                                        ...layer,
                                                        ...updatedOptions,
                                                        ...vectorStyleParam
                                                    });
                                                }
                                            }
                                        ]} />
                            }))} />
                </BorderLayout>
            </div>
        );
    }

    search = (startPosition = 1, page = 0) => {
        if (isString(this.state.service)) {
            this.setState({
                loading: true,
                error: null
            });
            textSearch(this.state.service, startPosition, this.props.pageSize, this.state.filterText || '')
                .then(({ records, numberOfRecordsMatched }) => {
                    this.setState({
                        records,
                        page,
                        total: numberOfRecordsMatched,
                        loading: false
                    });
                })
                .catch(({ data } = {}) => {
                    this.setState({
                        loading: false,
                        error: data || 'Connection Error'
                    });
                });
        }
    };
}

export default createPlugin('TilesCatalog', {
    component: connect(() => ({}), { onAdd: addLayer })(TilesCatalogPlugin),
    containers: {
        Layout: {
            priority: 4,
            glyph: 'folder-open',
            position: 2,
            size: 400,
            container: 'right-menu'
        }
    }
});
