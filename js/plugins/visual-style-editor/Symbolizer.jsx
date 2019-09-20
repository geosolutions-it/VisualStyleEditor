/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { withState } from 'recompose';
import { Glyphicon } from 'react-bootstrap';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

const Symbolizer = withState('expanded', 'onExpand', ({ defaultExpanded }) => defaultExpanded)(
    ({ glyph, children, draggable, expanded, onExpand }) => (
        <div className="ms-symbolizer">
            <div>
                {draggable && <div className="ms-grab-handler">
                    <Glyphicon glyph="menu-hamburger" />
                </div>}
                <div className="ms-symbolizer-info">
                    {glyph && <Glyphicon glyph={glyph} />}
                </div>
                <div>
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-sm no-border'
                        }}
                        buttons={[
                            {
                                glyph: expanded ? 'chevron-down' : 'chevron-left',
                                tooltip: 'Collapse',
                                onClick: () => onExpand(!expanded)
                            }
                        ]} />
                </div>
            </div>
            {expanded && <div>
                {children}
            </div>}
        </div>
    )
);

export default Symbolizer;
