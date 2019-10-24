
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import Dropzone from 'react-dropzone';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import SideGrid from '@mapstore/components/misc/cardgrids/SideGrid';
import { Glyphicon } from 'react-bootstrap';
import axios from 'axios';
import * as epics from '../epics/images';
import { setLayers } from '../actions/images';
import tinycolor from 'tinycolor2';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import get from 'lodash/get';
import { createSelector } from 'reselect';

class ImagesAPI extends React.Component {
    static propTypes = {
        setLayers: PropTypes.func,
        auth: PropTypes.object
    };

    static defaultProps = {
        setLayers: () => { }
    };

    state = {
        images: [],
        collections: [],
        newCollectionId: 'vtp:Imagery1',
        selectedImagesService: ''
    };

    componentWillMount() {
        try {
            const option = JSON.parse(localStorage.getItem('imagesAPIService'));
            const { services = {}, label, imageName } = option || {};
            this.setState({
                label,
                imageName,
                selectedImagesService: services.imagesAPI,
                selectedTilesService: services.tilesAPI
            });
        } catch (e) {
            //
        }
    }

    componentDidMount() {
        this.getImageLayers();
    }

    getDataUri = (image) => {
        return new Promise((resolve) => {
            const fileToLoad = image;
            const { name, type, size, lastModified } = image;
            const fileReader = new FileReader();
            fileReader.onerror = () => resolve({ ...image, name, type, error: true, size, lastModified });
            fileReader.onload = (event) => resolve({ ...image, name, type, src: event.target.result, size, lastModified });
            fileReader.readAsBinaryString(fileToLoad);
        });
    };

    getImageLayers = () => {
        axios.get(this.state.selectedImagesService)
            .then(({ data }) => {
                return data;
            })
            .then((data) => {
                if (data.features) {
                    return data;
                }
                const items = (data.links || []).filter(({ rel }) => rel === 'item').map(({ href }) => href);
                return axios.all(items.map((href) => axios.get(href).then(({ data: res }) => res).catch(() => null)))
                    .then((features) => {
                        return {
                            ...data,
                            features: features.filter(val => val !== null)
                        };
                    });
            })
            .then((collection) => {
                const features = collection.features
                    .map((feature, idx) => {
                        const color = tinycolor(`hsl(${Math.floor(idx / collection.features.length * 360)}, 90%, 80%)`).toHexString();
                        return {
                            ...feature,
                            style: {
                                fillColor: color,
                                fillOpacity: 0.2,
                                color
                            }
                        };
                    });
                this.props.setLayers(features, this.state.selectedTilesService);
                this.setState({ features });
            });
    };

    render() {
        return (
            <div className="ms-images-api">
                <BorderLayout
                    header={
                        <div style={{
                            padding: 8,
                            wordBreak: 'break-word'
                        }}>
                            <div><strong>{this.state.label} Images API</strong></div>
                            <small>
                                Data: {this.state.imageName}
                            </small>
                        </div>
                    }>
                    <div style={{
                        position: 'relative',
                        width: '100%'
                    }}>
                        <Dropzone
                            className="dropzone"
                            activeClassName="dropzone-active"
                            multiple={false}
                            onDrop={(files) => {
                                const _images = [...files.filter(({ type }) => {
                                    return type.match(/tiff/g);
                                })];
                                if (!_images[0]) return null;
                                axios.post(`${this.state.selectedImagesService}?filename=${_images[0].name}`, _images[0], {
                                    headers: {
                                        'Content-Type': _images[0].type,
                                        Accept: '*/*'
                                    }
                                })
                                .then(() => {
                                    this.getImageLayers();
                                });
                            }}>
                            Drop or click here to add a new tiff to upload
                        </Dropzone>
                        <SideGrid
                            size="sm"
                            items={(this.state.features || [])
                                .map(({ id: imageId, assets, style = {} }) => ({
                                    preview: <Glyphicon glyph="picture" />,
                                    title: assets && assets[0] && assets[0].title || `Image ${imageId}`,
                                    description: assets && assets[0] && assets[0].type,
                                    style: {
                                        borderTop: `2px solid ${style.color}`
                                    },
                                    tools: (
                                        <Toolbar
                                            btnDefaultProps={{
                                                className: "square-button-md",
                                                bsStyle: 'primary'
                                            }}
                                            buttons={[
                                                {
                                                    glyph: 'trash',
                                                    onClick: () => {
                                                        axios.delete(`${this.state.selectedImagesService}/${imageId}`)
                                                        .then(() => { this.getImageLayers(); });
                                                    }
                                                }
                                            ]} />
                                    )
                                }))} />
                    </div>
                </BorderLayout>
            </div>
        );
    }
}

const ImagesAPIPlugin = connect(
    createSelector([
        state => get(state, 'controls.auth.username'),
        state => get(state, 'controls.auth.password')
    ], (username, password) => ({
        auth: {
            username,
            password
        }
    })
    ), { setLayers })(ImagesAPI);

export default createPlugin('ImagesAPI', {
    component: ImagesAPIPlugin,
    containers: {
        Layout: {
            priority: 10,
            glyph: '1-raster',
            position: 1,
            size: 400,
            container: 'left-menu'
        }
    },
    epics
});
