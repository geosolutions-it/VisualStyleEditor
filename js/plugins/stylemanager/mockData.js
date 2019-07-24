/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const nightStyle = {
    "id": "night",
    "title": "Topographic night style",
    "description": "This topographic basemap style is designed to be \nused in situations with low ambient light. \n\nThe style supports datasets based on the TDS 6.1\nspecification.",
    "keywords": [
        "basemap",
        "TDS",
        "TDS 6.1",
        "OGC API"
    ],
    "pointOfContact": "John Doe",
    "accessConstraints": "unclassified",
    "dates": {
        "creation": "2019-01-01T10:05:00Z",
        "publication": "2019-01-01T11:05:00Z",
        "revision": "2019-02-01T11:05:00Z",
        "validTill": "2019-02-01T11:05:00Z",
        "receivedOn": "2019-02-01T11:05:00Z"
    },
    "scope": "style",
    "version": "1.0.0",
    "stylesheets": [
        {
            "title": "Night_MBS",
            "version": "8",
            "specification": "https://docs.mapbox.com/mapbox-gl-js/style-spec/",
            "native": true,
            "tilingScheme": "GoogleMapsCompatible",
            "link": {
                "href": "/geoserver/vtp/wfs3/styles/Night_MBS?f=application%2Fvnd.geoserver.mbstyle%2Bjson",
                "rel": "stylesheet",
                "type": "application/vnd.mapbox.style+json"
            }
        },
        {
            "title": "Night_MBS",
            "version": "1.0",
            "native": false,
            "link": {
                "href": "/geoserver/vtp/wfs3/styles/Night_MBS?f=application%2Fvnd.ogc.sld%2Bxml",
                "rel": "stylesheet",
                "type": "application/vnd.ogc.sld+xml;version=1.0"
            }
        }
    ],
    "layers": [
        {
            "id": "AgricultureSrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/AgricultureSrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            },
            "attributes": [
                {
                    "id": "F_CODE",
                    "type": "string"
                }
            ]
        },
        {
            "id": "VegetationSrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/VegetationSrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "SettlementSrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/SettlementSrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "MilitarySrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/MilitarySrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "CultureSrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/CultureSrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "HydrographyCrv",
            "type": "line",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/HydrographyCrv/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "HydrographySrf",
            "type": "polygon",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/HydrographySrf/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "TransportationGroundCrv",
            "type": "line",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/TransportationGroundCrv/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "UtilityInfrastructureCrv",
            "type": "point",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/UtilityInfrastructureCrv/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "CulturePnt",
            "type": "point",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/CulturePnt/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "StructurePnt",
            "type": "point",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/StructurePnt/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        },
        {
            "id": "UtilityInfrastructurePnt",
            "type": "point",
            "sampleData": {
                "href": "/geoserver/vtp/wfs3/collections/UtilityInfrastructurePnt/items?f=json&limit=100",
                "rel": "data",
                "type": "application/geo+json"
            }
        }
    ]
};
