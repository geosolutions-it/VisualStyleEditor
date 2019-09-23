
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

class HomepagePlugin extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        pages: PropTypes.array
    };

    static defaultProps = {
        onClick: () => {},
        pages: [
            {
                title: "Map & Tiles API",
                link: "/tiles-api",
                description: "This demo shows Map & Tiles API implementation in MapStore.",
                glyph: "th-large"
            },
            {
                title: "Styles API",
                link: "/styles-api",
                description: "This demo shows Style API and Visual Style Editor implemented in MapStore.",
                glyph: "1-stilo"
            }
        ]
    };

    render() {
        return (
            <Grid style={{ padding: '32px 16px' }}>
                <Row>
                    {this.props.pages.map(({ title, description, glyph, link }) => (
                        <Col xs={12} md={6}>
                            <div
                                className="ms-home-card"
                                onClick={() => this.props.onClick(link)}>
                                <div>
                                    <Glyphicon glyph={glyph}/>
                                </div>
                                <h1>{title}</h1>
                                <p>{description}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Grid>
        );
    }
}

export default createPlugin('Homepage', {
    component: connect(() => ({}), { onClick: push })(HomepagePlugin)
});

