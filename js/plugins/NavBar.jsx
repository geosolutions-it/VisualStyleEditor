
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
import logoOGC from '../../assets/img/ogc-logo.png';
import logoGeoSolutions from '../../assets/img/geosolutions-logo.png';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';
import { push } from 'react-router-redux';

class NavBar extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        toHomepage: PropTypes.func
    };

    static defaultProps = {
        title: '',
        toHomepage: () => {}
    };

    render() {
        return (
            <div className="ms-navbar-vse">
                <div className="ms-navbar-left">
                    {this.props.title && <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md no-border',
                            tooltipPosition: 'bottom'
                        }}
                        buttons={[
                            {
                                glyph: 'home',
                                tooltip: 'Homepage',
                                onClick: () => this.props.toHomepage()
                            }
                        ]}/>}
                </div>
                <div className="ms-navbar-title">
                    <span>Testbed 15 OP</span>{this.props.title && <span>{'/ '}<strong>{this.props.title}</strong></span>}
                </div>
                <div className="ms-navbar-right">
                    <img src={logoOGC} />
                    <img src={logoGeoSolutions} />
                </div>
            </div>
        );
    }
}

const NavBarPlugin = connect(() => ({}), { toHomepage: push.bind(null, '/') })(NavBar);
const reducers = {};
const epics = {};

export {
    NavBarPlugin,
    reducers,
    epics
};
