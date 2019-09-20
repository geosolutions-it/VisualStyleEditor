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
import Page from '@mapstore/containers/Page';
import BorderLayout from '@mapstore/components/layout/BorderLayout';

class StylesAPIPage extends React.Component {

    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        plugins: PropTypes.object
    };

    static defaultProps = {
        mode: 'home'
    };

    render() {
        return (
            <Page
                id="home"
                component={BorderLayout}
                includeCommon={false}
                plugins={this.props.plugins}
                params={this.props.match.params}/>
        );
    }
}

export default connect(() => ({}))(StylesAPIPage);
