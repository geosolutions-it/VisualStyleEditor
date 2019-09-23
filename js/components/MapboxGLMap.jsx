/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import mapboxgl from 'mapbox-gl';
import PropTypes from 'prop-types';

class MapboxGLMap extends Component {

    static propTypes = {
        id: PropTypes.string,
        mbstyle: PropTypes.object,
        center: PropTypes.array,
        zoom: PropTypes.number,
        bounds: PropTypes.object,
        backgroundColor: PropTypes.string,
        onUpdate: PropTypes.func,
        options: PropTypes.object
    };

    static defaultProps = {
        id: 'map',
        center: [ 0, 0 ],
        zoom: 1,
        bounds: {},
        backgroundColor: '#ffffff',
        onUpdate: () => {},
        options: {}
    };

    componentDidMount() {
        mapboxgl.accessToken = '';
        const map = new mapboxgl.Map({
            container: this.props.id,
            center: this.props.center,
            zoom: this.props.zoom,
            style: this.props.mbstyle || {
                version: 8,
                sources: {},
                layers: []
            }
        });

        this.map = map;

        map.on('load', function() {
            map.addControl(new mapboxgl.NavigationControl());
        });

        map.on('moveend', () => {
            const { lng, lat } = map.getCenter();
            const center = [lng, lat];
            const zoom = map.getZoom();
            this.props.onUpdate(center, zoom);
        });
    }

    componentWillUnmount() {
        this.map.remove();
    }

    render() {
        return (
            <div
                id={this.props.id}
                style={{ position: 'absolute', width: '100%', height: '100%' }}/>
        );
    }
}

export default MapboxGLMap;
