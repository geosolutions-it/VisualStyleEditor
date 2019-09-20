
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
import { compose } from 'recompose';
import { createSelector } from 'reselect';
import { get } from 'lodash';
import loadingState from '@mapstore/components/misc/enhancers/loadingState';
import emptyState from '@mapstore/components/misc/enhancers/emptyState';
import { MapPlugin as MSMapPlugin, reducers as mapReducers, epics } from '@mapstore/plugins/Map';
import { mapSelector } from '@mapstore/selectors/map';
import { resizeMap } from '@mapstore/actions/map';
import { groupsSelector, layersSelector } from '@mapstore/selectors/layers';

const backgroundSelector = (state) => {
    const DEFAULT_COLOR = '#dddddd';
    const groups = groupsSelector(state);
    const last = groups[groups.length - 1];
    if (last && last.id) {
        const metadata = get(state, 'stylesheet.metadata') || [];
        const { backgroundColor = DEFAULT_COLOR } = metadata.find(({ id }) => id === last.id) || {};
        return backgroundColor;
    }
    return DEFAULT_COLOR;
};

const selector = createSelector(
    [
        mapSelector,
        state => get(state, 'mapInitialConfig.loadingError'),
        backgroundSelector,
        layersSelector,
        state => get(state, 'controls.visualStyleEditor.loading')
    ], (map, loadingError, backgroundColor, layers = [], visualStyleEditorLoading) => ({
        map,
        loadingError,
        backgroundColor,
        layersCount: layers.length,
        visualStyleEditorLoading
    })
);

class MapContainer extends React.Component {
    static propTypes = {
        size: PropTypes.bool,
        onResize: PropTypes.func,
        backgroundColor: PropTypes.string
    };
    static defaultProps = {
        onResize: () => {}
    };

    componentWillReceiveProps(newProps) {
        if (newProps.size !== this.props.size) {
            this.props.onResize();
        }
    }

    render() {
        return (
            <MSMapPlugin
                fonts={null}
                {...this.props}
                style={{
                    backgroundColor: this.props.backgroundColor
                }}/>
        );
    }
}

const MapPlugin = compose(
    connect(selector, {
        onResize: resizeMap
    }),
    loadingState(({ map, loadingError, visualStyleEditorLoading }) => (!map && !loadingError) || visualStyleEditorLoading),
    emptyState(
        ({ loadingError }) => loadingError,
        () => ({
            title: 'Missing Map',
            description: 'Error loading map configuration',
            glyph: '1-map'
        })
    ),
    emptyState(
        ({ layersCount }) => layersCount === 0,
        ({ title, description, content, glyph }) => ({
            title,
            description,
            content,
            glyph
        })
    )
)(MapContainer);

const { map, ...reducers } = mapReducers;

export {
    MapPlugin,
    reducers,
    epics
};
