
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
import { push } from 'react-router-redux';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { Grid, Row, Col, Glyphicon } from 'react-bootstrap';
import BorderLayout from '@mapstore/components/layout/BorderLayout';
import Select from '../components/Select';

class HomepagePlugin extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        pages: PropTypes.array,
        availableStylesServices: PropTypes.array,
        availableTilesServices: PropTypes.array,
        availableImagesServices: PropTypes.array,
        selectedStyleService: PropTypes.string,
        selectedTilesService: PropTypes.string,
        selectedImagesService: PropTypes.string,
        imagesAPIService: PropTypes.array
    };

    static defaultProps = {
        onClick: () => { },
        pages: [
            {
                title: "Tiles API",
                link: "/tiles-api",
                description: "This demo shows Tiles API implementation in MapStore.",
                glyph: "th-large",
                service: 'tilesAPIService',
                color: '#fbb4ae'
            },
            {
                title: "Styles API",
                link: "/styles-api",
                description: "This demo shows Style API and Visual Style Editor implemented in MapStore.",
                glyph: "1-stilo",
                service: 'stylesAPIService',
                color: '#b3cde3'
            },
            {
                title: "Images API",
                link: "/images-api",
                description: "This demo shows Images API in MapStore.",
                glyph: "1-raster",
                service: 'imagesAPIService',
                color: '#ccebc5'
            },
            {
                title: "Visual Style Editor",
                link: "/visual-style-editor",
                description: "This demo shows Visual Style Editor implemented in MapStore with previously selected styles.",
                glyph: "dropper",
                service: 'stylesAPIService',
                color: '#fed9a6'
            }
        ],
        availableStylesServices: [],
        availableTilesServices: [],
        availableImagesServices: [],
        selectedStyleService: '',
        selectedTilesService: '',
        selectedImagesService: ''
    };

    state = {
        selectedStyleService: '',
        selectedTilesService: '',
        selectedImagesService: ''
    };

    componentWillMount() {
        this.setState({
            selectedStyleService: this.getService('selectedStyleService'),
            selectedTilesService: this.getService('selectedTilesService'),
            selectedImagesService: this.getService('selectedImagesService'),
            tilesAPIService: this.setupService('tilesAPIService'),
            stylesAPIService: this.setupService('stylesAPIService'),
            imagesAPIService: this.setupService('imagesAPIService')
        });
    }

    getService = (key) => {
        const service = localStorage.getItem(key);
        const newService = service || this.props[key];
        localStorage.setItem(key, newService);
        return newService;
    };

    render() {
        return (
            <BorderLayout>
                <Grid style={{ padding: '32px 16px' }}>
                    <Row>
                        {this.props.pages.map(({ title, description, glyph, link, service, color }) => (
                            <Col xs={12} md={6}>
                                <div
                                    className="ms-home-card"
                                    onClick={() => this.props.onClick(link)}>
                                    <div style={{ backgroundColor: color }}>
                                        <Glyphicon glyph={glyph} />
                                    </div>
                                    <h1>{title}</h1>
                                    <p>{description}</p>
                                    {this.state[service] &&
                                    <p onClick={(event) => event.stopPropagation()}>
                                    Service:
                                    <Select
                                        clearable={false}
                                        value={this.state[service].value}
                                        options={this.props[service]}
                                        placeholder="Select images service..."
                                        onChange={(option) => this.selectService(service, option)}/>
                                    </p>}
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Grid>
            </BorderLayout>
        );
    }

    setupService = (key) => {
        try {
            const item = localStorage.getItem(key);
            const service = item && JSON.parse(item);
            const newService = service || this.props[key][0];
            const str = JSON.stringify(newService);
            localStorage.setItem(key, str);
            return newService;
        } catch (e) {
            return this.props[key][0];
        }
    };

    selectService = (key, option) => {
        try {
            const str = JSON.stringify(option);
            localStorage.setItem(key, str);
            this.setState({
                [key]: option
            });
        } catch (e) { /**/ }
    }

    setService = (key, value) => {
        localStorage.setItem(key, value);
        this.setState({
            [key]: value
        });
    }
}

export default createPlugin('Homepage', {
    component: connect(() => ({}), { onClick: push })(HomepagePlugin)
});

