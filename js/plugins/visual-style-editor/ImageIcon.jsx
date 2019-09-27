/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

class ImageIcon extends Component {

    static propTypes = {
        side: PropTypes.number,
        value: PropTypes.string,
        onChange: PropTypes.func
    };

    static defaultProps = {
        side: 512
    };

    state = {
        icons: [],
        open: false,
        service: '',
        value: '',
        label: ''
    };

    componentWillUpdate(newProps, newState) {
        if (newState.open && !this.state.open) {
            const { value } = newProps;
            const { service, label } = this.getResourcesServiceFromValue(value);
            this.setState({
                service,
                value,
                label
            });
            this.getIcons(service)
                .then((icons) => this.setState({ icons }));
        }
    }

    getResourcesServiceFromValue(value) {
        const removedQuery = (value || '').split('?')[0];
        const splitUrl = (removedQuery || '').split('/');
        const service = splitUrl
            .filter((urlPart, idx) => idx < splitUrl.length - 1)
            .join('/');
        const label = (splitUrl[splitUrl.length - 1] || '').split('.')[0];
        return {
            service,
            label
        };
    }

    getIcons(service) {
        return axios.get(`${service}/index.json`)
            .then(({ data }) => {
                return data.icons;
            })
            .catch(() => {

            });
    }

    getSprites(canvas, service, icons) {
        const ctx = canvas.getContext('2d');
        return Promise.all(icons.map((icon) => {
            return new Promise((resolve, reject) => {
                const image = new Image();
                image.onerror = () => {
                    reject(null);
                };
                image.onload = (event) => {
                    resolve({
                        ...icon,
                        image,
                        width: event.target.naturalWidth,
                        height: event.target.naturalHeight
                    });
                };
                image.src = `${service}/${icon.name}`;
            });
        }))
        .then(newIcons => {
            const side = 1024 / 32;
            return newIcons.reduce((acc, icon, idx) => {
                const posX = (idx % side);
                const posY = ((idx - posX) / side);
                const x = posX * 32;
                const y = posY * 32;
                ctx.drawImage(icon.image, x, y);
                return {
                    ...acc,
                    [icon.name]: {
                        width: icon.width,
                        height: icon.height,
                        x,
                        y,
                        pixelRatio: 1,
                        visible: true
                    }
                };
            }, {});
        });
    }

    getImageSrcUrl(name) {
        const { service } = this.state;
        return `${service}/${name}?baseurl=${service}/sprites&name=${name}`;
    }

    render() {
        return (
            <div
                className="ms-sprites"
                style={{
                    width: 21,
                    marginLeft: 2,
                    backgroundImage: 'linear-gradient(45deg, #dddddd 25%, transparent 25%), linear-gradient(-45deg, #dddddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #dddddd 75%), linear-gradient(-45deg, transparent 75%, #dddddd 75%)',
                    backgroundSize: '4px 4px',
                    backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px'
                }}>
                <img
                    onClick={() => this.setState({ open: true })}
                    src={this.props.value}
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 2px 2px 2px)'
                    }}/>
                {this.state.open && <div
                    style={{ position: 'fixed', width: '100%', height: '100%', top: 0, left: 0, zIndex: 1000 }}>
                    <BorderLayout
                        header={
                            <div>
                                <Toolbar
                                    btnDefaultProps={{
                                        className: 'square-button-md no-border'
                                    }}
                                    buttons={[
                                        {
                                            glyph: 'ok',
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                this.props.onChange(this.state.value);
                                                this.setState({ open: false });
                                            }
                                        },
                                        {
                                            glyph: '1-close',
                                            onClick: (event) => {
                                                event.stopPropagation();
                                                this.setState({ open: false });
                                            }
                                        }
                                    ]}/>
                        </div>}>
                        <div style={{ padding: 8, textAlign: 'center' }}>
                            <div style={{
                                width: 64,
                                height: 64,
                                margin: 'auto',
                                backgroundImage: 'linear-gradient(45deg, #dddddd 25%, transparent 25%), linear-gradient(-45deg, #dddddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #dddddd 75%), linear-gradient(-45deg, transparent 75%, #dddddd 75%)',
                                backgroundSize: '8px 8px',
                                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                            }}>
                                <img
                                    src={this.state.value}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 2px 2px 2px)'
                                    }}/>
                            </div>
                            <small>{this.state.label || this.state.value}</small>
                        </div>
                        <div style={{ padding: 8, textAlign: 'center' }}>
                            {(this.state.icons || []).map(({ name, label }) => {
                                const value = this.getImageSrcUrl(name);
                                return (<div
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        this.setState({
                                            value,
                                            label
                                        });
                                    }}
                                    style={{
                                    width: 32,
                                    height: 32,
                                    display: 'inline-block',
                                    margin: 2,
                                    backgroundImage: 'linear-gradient(45deg, #dddddd 25%, transparent 25%), linear-gradient(-45deg, #dddddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #dddddd 75%), linear-gradient(-45deg, transparent 75%, #dddddd 75%)',
                                    backgroundSize: '8px 8px',
                                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                                    border: value === this.state.value
                                        ? '1px solid #00ff00'
                                        : undefined
                                    }}>
                                    <img
                                        src={value}
                                        style={{
                                            position: 'relative',
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            filter: 'drop-shadow(rgba(0, 0, 0, 0.2) 2px 2px 2px)'
                                        }}/>
                                </div>);
                            })}
                        </div>
                    </BorderLayout>
                </div>}
                <canvas
                    ref="canvas"
                    width={this.props.side}
                    height={this.props.side}
                    style={{
                        display: 'none',
                        width: this.props.side,
                        height: this.props.side
                    }} />
            </div>
        );
    }
}

export default ImageIcon;
