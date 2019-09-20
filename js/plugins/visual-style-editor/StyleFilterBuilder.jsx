/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { FormControl } from 'react-bootstrap';
import Toolbar from '@mapstore/components/misc/toolbar/Toolbar';

const logicOperators = [ '!', '||', '&&' ];

function FilterField({
    index,
    field,
    value,
    operator,
    onChange = () => {},
    onRemove = () => {}
}) {
    return (
        <div
            className="ms-symbolizer-filter"
            style={{
                display: 'flex',
                paddingLeft: 8,
                borderLeft: '2px solid #333'
            }}>
            <FormControl
                style={{ flex: 1, height: 20, borderBottom: '1px solid #ddd', padding: '0 8px' }}
                value={field}
                onChange={(event) => onChange(`${index}[1]`, event.target.value)} />
            <div style={{ padding: '0 4px' }}>
                {operator}
            </div>
            <FormControl
                style={{ flex: 1, height: 20, borderBottom: '1px solid #ddd', padding: '0 8px' }}
                value={value}
                onChange={(event) => onChange(`${index}[2]`, event.target.value)} />
            <Toolbar
                btnDefaultProps={{
                    className: 'square-button-md no-border'
                }}
                buttons={[
                    {
                        glyph: 'trash',
                        tooltip: 'Remove field',
                        onClick: () => onRemove()
                    }
                ]}/>
        </div>
    );
}

export default function StyleFilterBuilder({ filter, index = '', onChange = () => {} }) {

    if (!filter) return null;
    const operator = filter[0];
    if (!operator) return null;
    const rules = filter.filter((rule, idx) => idx > 0);

    if (logicOperators.indexOf(operator) !== -1) {
        return (
            <div >
                <div>
                {operator}
                <Toolbar
                    btnDefaultProps={{
                        className: 'square-button-md no-border'
                    }}
                    buttons={[
                        {
                            glyph: 'plus',
                            tooltip: 'Remove field',
                            onClick: () => {}
                        }
                    ]}/>
                </div>
                {rules.map((rule, idx) => {
                    return (
                        <StyleFilterBuilder
                            key={idx}
                            filter={rule}
                            index={`${index}[${idx + 1}]`}
                            onChange={onChange}/>
                    );
                })}
            </div>
        );
    }
    const [ field, value ] = rules;
    return (
        <FilterField
            operator={operator}
            field={field}
            value={value}
            index={index}
            onChange={onChange}/>
    );
}
