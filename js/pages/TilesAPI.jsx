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
import url from 'url';
import ConfigUtils from '@mapstore/utils/ConfigUtils';
import { loadMapConfig } from '@mapstore/actions/config';
import { initMap } from '@mapstore/actions/map';

class TilesAPIPage extends React.Component {

    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        plugins: PropTypes.object,
        onInit: PropTypes.func,
        loadMapConfig: PropTypes.func
    };

    static defaultProps = {
        mode: 'tiles-api'
    };

    componentDidMount() {
        const urlQuery = url.parse(window.location.href, true).query;
        const mapId = 'new';
        const config = urlQuery && urlQuery.config || null;
        const { configUrl } = ConfigUtils.getConfigUrl({ mapId, config });
        this.props.onInit();
        this.props.loadMapConfig(configUrl, null);
    }

    render() {
        return (
            <Page
                id="tiles-api"
                component={BorderLayout}
                includeCommon={false}
                plugins={this.props.plugins}
                params={this.props.match.params}/>
        );
    }
}

module.exports = connect(() => ({ }), {
    loadMapConfig,
    onInit: initMap
})(TilesAPIPage);
