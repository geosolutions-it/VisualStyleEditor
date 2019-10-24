
export const DEFAULT_TILE_MATRIX_SET = {
    'EPSG:900913': (tileMatrixSetId) => ({
        "tileMatrixSetLimits": [
            { "tileMatrix": `${tileMatrixSetId}:0`, "minTileRow": 0, "maxTileRow": 0, "minTileCol": 0, "maxTileCol": 0 },
            { "tileMatrix": `${tileMatrixSetId}:1`, "minTileRow": 0, "maxTileRow": 0, "minTileCol": 1, "maxTileCol": 1 },
            { "tileMatrix": `${tileMatrixSetId}:2`, "minTileRow": 1, "maxTileRow": 1, "minTileCol": 2, "maxTileCol": 2 },
            { "tileMatrix": `${tileMatrixSetId}:3`, "minTileRow": 3, "maxTileRow": 3, "minTileCol": 4, "maxTileCol": 4 },
            { "tileMatrix": `${tileMatrixSetId}:4`, "minTileRow": 6, "maxTileRow": 6, "minTileCol": 9, "maxTileCol": 9 },
            { "tileMatrix": `${tileMatrixSetId}:5`, "minTileRow": 12, "maxTileRow": 12, "minTileCol": 19, "maxTileCol": 19 },
            { "tileMatrix": `${tileMatrixSetId}:6`, "minTileRow": 25, "maxTileRow": 25, "minTileCol": 38, "maxTileCol": 38 },
            { "tileMatrix": `${tileMatrixSetId}:7`, "minTileRow": 51, "maxTileRow": 51, "minTileCol": 76, "maxTileCol": 76 },
            { "tileMatrix": `${tileMatrixSetId}:8`, "minTileRow": 103, "maxTileRow": 103, "minTileCol": 153, "maxTileCol": 153 },
            { "tileMatrix": `${tileMatrixSetId}:9`, "minTileRow": 206, "maxTileRow": 207, "minTileCol": 307, "maxTileCol": 307 },
            { "tileMatrix": `${tileMatrixSetId}:10`, "minTileRow": 413, "maxTileRow": 414, "minTileCol": 614, "maxTileCol": 614 },
            { "tileMatrix": `${tileMatrixSetId}:11`, "minTileRow": 826, "maxTileRow": 828, "minTileCol": 1228, "maxTileCol": 1229 },
            { "tileMatrix": `${tileMatrixSetId}:12`, "minTileRow": 1653, "maxTileRow": 1656, "minTileCol": 2456, "maxTileCol": 2459 },
            { "tileMatrix": `${tileMatrixSetId}:13`, "minTileRow": 3307, "maxTileRow": 3312, "minTileCol": 4912, "maxTileCol": 4919 },
            { "tileMatrix": `${tileMatrixSetId}:14`, "minTileRow": 6615, "maxTileRow": 6624, "minTileCol": 9824, "maxTileCol": 9838 },
            { "tileMatrix": `${tileMatrixSetId}:15`, "minTileRow": 13230, "maxTileRow": 13249, "minTileCol": 19648, "maxTileCol": 19677 },
            { "tileMatrix": `${tileMatrixSetId}:16`, "minTileRow": 26460, "maxTileRow": 26498, "minTileCol": 39297, "maxTileCol": 39355 },
            { "tileMatrix": `${tileMatrixSetId}:17`, "minTileRow": 52921, "maxTileRow": 52997, "minTileCol": 78594, "maxTileCol": 78711 },
            { "tileMatrix": `${tileMatrixSetId}:18`, "minTileRow": 105842, "maxTileRow": 105994, "minTileCol": 157189, "maxTileCol": 157422 },
            { "tileMatrix": `${tileMatrixSetId}:19`, "minTileRow": 211684, "maxTileRow": 211988, "minTileCol": 314378, "maxTileCol": 314844 },
            { "tileMatrix": `${tileMatrixSetId}:20`, "minTileRow": 423369, "maxTileRow": 423976, "minTileCol": 628756, "maxTileCol": 629688 },
            { "tileMatrix": `${tileMatrixSetId}:21`, "minTileRow": 846738, "maxTileRow": 847953, "minTileCol": 1257513, "maxTileCol": 1259376 },
            { "tileMatrix": `${tileMatrixSetId}:22`, "minTileRow": 1693477, "maxTileRow": 1695906, "minTileCol": 2515026, "maxTileCol": 2518753 },
            { "tileMatrix": `${tileMatrixSetId}:23`, "minTileRow": 3386955, "maxTileRow": 3391813, "minTileCol": 5030053, "maxTileCol": 5037506 },
            { "tileMatrix": `${tileMatrixSetId}:24`, "minTileRow": 6773911, "maxTileRow": 6783627, "minTileCol": 10060107, "maxTileCol": 10075012 },
            { "tileMatrix": `${tileMatrixSetId}:25`, "minTileRow": 13547822, "maxTileRow": 13567254, "minTileCol": 20120214, "maxTileCol": 20150025 },
            { "tileMatrix": `${tileMatrixSetId}:26`, "minTileRow": 27095644, "maxTileRow": 27134509, "minTileCol": 40240429, "maxTileCol": 40300051 },
            { "tileMatrix": `${tileMatrixSetId}:27`, "minTileRow": 54191288, "maxTileRow": 54269019, "minTileCol": 80480858, "maxTileCol": 80600103 },
            { "tileMatrix": `${tileMatrixSetId}:28`, "minTileRow": 108382576, "maxTileRow": 108538038, "minTileCol": 160961717, "maxTileCol": 161200207 },
            { "tileMatrix": `${tileMatrixSetId}:29`, "minTileRow": 216765152, "maxTileRow": 217076076, "minTileCol": 321923434, "maxTileCol": 322400415 },
            { "tileMatrix": `${tileMatrixSetId}:30`, "minTileRow": 433530305, "maxTileRow": 434152153, "minTileCol": 643846869, "maxTileCol": 644800830 }],
        tileMatrixSet: {
            "identifier": tileMatrixSetId,
            "supportedCRS": "http://www.opengis.net/def/crs/EPSG/0/900913",
            "tileMatrix": [
                {
                    "identifier": `${tileMatrixSetId}:0`,
                    "scaleDenominator": 559082263.9508929,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 1,
                    "matrixHeight": 1
                },
                {
                    "identifier": `${tileMatrixSetId}:1`,
                    "scaleDenominator": 279541131.97544646,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 2,
                    "matrixHeight": 2
                },
                {
                    "identifier": `${tileMatrixSetId}:2`,
                    "scaleDenominator": 139770565.98772323,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 4,
                    "matrixHeight": 4
                },
                {
                    "identifier": `${tileMatrixSetId}:3`,
                    "scaleDenominator": 69885282.99386162,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 8,
                    "matrixHeight": 8
                },
                {
                    "identifier": `${tileMatrixSetId}:4`,
                    "scaleDenominator": 34942641.49693081,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 16,
                    "matrixHeight": 16
                },
                {
                    "identifier": `${tileMatrixSetId}:5`,
                    "scaleDenominator": 17471320.748465404,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 32,
                    "matrixHeight": 32
                },
                {
                    "identifier": `${tileMatrixSetId}:6`,
                    "scaleDenominator": 8735660.374232702,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 64,
                    "matrixHeight": 64
                },
                {
                    "identifier": `${tileMatrixSetId}:7`,
                    "scaleDenominator": 4367830.187116351,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 128,
                    "matrixHeight": 128
                },
                {
                    "identifier": `${tileMatrixSetId}:8`,
                    "scaleDenominator": 2183915.0935581755,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 256,
                    "matrixHeight": 256
                },
                {
                    "identifier": `${tileMatrixSetId}:9`,
                    "scaleDenominator": 1091957.5467790877,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 512,
                    "matrixHeight": 512
                },
                {
                    "identifier": `${tileMatrixSetId}:10`,
                    "scaleDenominator": 545978.7733895439,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 1024,
                    "matrixHeight": 1024
                },
                {
                    "identifier": `${tileMatrixSetId}:11`,
                    "scaleDenominator": 272989.38669477194,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 2048,
                    "matrixHeight": 2048
                },
                {
                    "identifier": `${tileMatrixSetId}:12`,
                    "scaleDenominator": 136494.69334738597,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 4096,
                    "matrixHeight": 4096
                },
                {
                    "identifier": `${tileMatrixSetId}:13`,
                    "scaleDenominator": 68247.34667369298,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 8192,
                    "matrixHeight": 8192
                },
                {
                    "identifier": `${tileMatrixSetId}:14`,
                    "scaleDenominator": 34123.67333684649,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 16384,
                    "matrixHeight": 16384
                },
                {
                    "identifier": `${tileMatrixSetId}:15`,
                    "scaleDenominator": 17061.836668423246,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 32768,
                    "matrixHeight": 32768
                },
                {
                    "identifier": `${tileMatrixSetId}:16`,
                    "scaleDenominator": 8530.918334211623,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 65536,
                    "matrixHeight": 65536
                },
                {
                    "identifier": `${tileMatrixSetId}:17`,
                    "scaleDenominator": 4265.4591671058115,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 131072,
                    "matrixHeight": 131072
                },
                {
                    "identifier": `${tileMatrixSetId}:18`,
                    "scaleDenominator": 2132.7295835529058,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 262144,
                    "matrixHeight": 262144
                },
                {
                    "identifier": `${tileMatrixSetId}:19`,
                    "scaleDenominator": 1066.3647917764529,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 524288,
                    "matrixHeight": 524288
                },
                {
                    "identifier": `${tileMatrixSetId}:20`,
                    "scaleDenominator": 533.1823958882264,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 1048576,
                    "matrixHeight": 1048576
                },
                {
                    "identifier": `${tileMatrixSetId}:21`,
                    "scaleDenominator": 266.5911979441132,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 2097152,
                    "matrixHeight": 2097152
                },
                {
                    "identifier": `${tileMatrixSetId}:22`,
                    "scaleDenominator": 133.2955989720566,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 4194304,
                    "matrixHeight": 4194304
                },
                {
                    "identifier": `${tileMatrixSetId}:23`,
                    "scaleDenominator": 66.6477994860283,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 8388608,
                    "matrixHeight": 8388608
                },
                {
                    "identifier": `${tileMatrixSetId}:24`,
                    "scaleDenominator": 33.32389974301415,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 16777216,
                    "matrixHeight": 16777216
                },
                {
                    "identifier": `${tileMatrixSetId}:25`,
                    "scaleDenominator": 16.661949871507076,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 33554432,
                    "matrixHeight": 33554432
                },
                {
                    "identifier": `${tileMatrixSetId}:26`,
                    "scaleDenominator": 8.330974935753538,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 67108864,
                    "matrixHeight": 67108864
                },
                {
                    "identifier": `${tileMatrixSetId}:27`,
                    "scaleDenominator": 4.165487467876769,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 134217728,
                    "matrixHeight": 134217728
                },
                {
                    "identifier": `${tileMatrixSetId}:28`,
                    "scaleDenominator": 2.0827437339383845,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 268435456,
                    "matrixHeight": 268435456
                },
                {
                    "identifier": `${tileMatrixSetId}:29`,
                    "scaleDenominator": 1.0413718669691923,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 536870912,
                    "matrixHeight": 536870912
                },
                {
                    "identifier": `${tileMatrixSetId}:30`,
                    "scaleDenominator": 0.5206859334845961,
                    "topLeftCorner": [
                        -20037508.34,
                        20037508
                    ],
                    "tileWidth": 256,
                    "tileHeight": 256,
                    "matrixWidth": 1073741824,
                    "matrixHeight": 1073741824
                }
            ]
        }
    })
};

