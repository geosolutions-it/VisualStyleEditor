
/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { createPlugin } from '@mapstore/utils/PluginsUtils';
import { FormControl } from 'react-bootstrap';
import { setControlProperty } from '@mapstore/actions/controls';

class AuthPlugin extends React.Component {
    static propTypes = {
        username: PropTypes.string,
        password: PropTypes.string,
        onUpdateUsername: PropTypes.func,
        onUpdatePassword: PropTypes.func
    };

    static defaultProps = {
        username: '',
        password: ''
    };

    render() {
        return (
            <div className="ms-auth">
                <div>
                    <div>Authentication: </div>
                    <FormControl
                        type="text"
                        placeholder="Enter username..."
                        defaultValue={this.props.username}
                        onBlur={(event) => this.props.onUpdateUsername(event.target.value || '')} />
                    <FormControl
                        type="password"
                        placeholder="Enter password..."
                        defaultValue={this.props.password}
                        onBlur={(event) => this.props.onUpdatePassword(event.target.value || '')} />
                </div>
            </div>
        );
    }
}

export default createPlugin('Auth', {
    component: connect(
    createSelector([
        state => get(state, 'controls.auth.username'),
        state => get(state, 'controls.auth.password')
    ], (username, password) => ({
        username,
        password
    })),
    {
        onUpdateUsername: setControlProperty.bind(null, 'auth', 'username'),
        onUpdatePassword: setControlProperty.bind(null, 'auth', 'password')
    })(AuthPlugin),
    containers: {
        Layout: {
            priority: 4,
            container: 'header'
        }
    }
});
