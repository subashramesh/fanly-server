const https = require('https');

var baseUrl = 'translate.googleapis.com'
var path = '/translate_a/single'

exports.translate = async (sourceText, { from = 'auto', to = 'en' } = {}) => {
    const parameters = {
        client: 'gtx',
        sl: from,
        tl: to,
        hl: to,
        dt: 't',
        ie: 'UTF-8',
        oe: 'UTF-8',
        otf: '1',
        ssel: '0',
        tsel: '0',
        kc: '7',
        tk: tokenGen(sourceText),
        q: sourceText,
    };

    const url = `https://${baseUrl}${path}`;
    const response = await get(url, parameters);

    if (response.statusCode !== 200) {
        throw new Error(`Error ${response.statusCode}: ${response.body}`);
    }

    const jsonData = JSON.parse(response.body);
    if (!jsonData) {
        throw new Error('Error: Can\'t parse JSON data');
    }

    const sb = [];

    for (let c = 0; c < jsonData[0].length; c++) {
        sb.push(jsonData[0][c][0]);
    }

    if (from === 'auto' && from !== to) {
        from = jsonData[2] || from;
        if (from === to) {
            from = 'auto';
        }
    }

    const translated = sb.join('');
    return translated;
}

async function get(url, params) {
    return new Promise((resolve, reject) => {
        const queryParams = new URLSearchParams(params);
        const fullUrl = `${url}?${queryParams.toString()}`;

        https.get(fullUrl, (response) => {
            let data = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve({ statusCode: response.statusCode, body: data });
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function tokenGen(a) {
    var tkk = TKK();
    var b = tkk[0];

    var d = [];

    for (var f = 0; f < a.toString().length; f++) {
        var g = a.toString().charCodeAt(f);
        if (128 > g) {
            d.push(g);
        } else {
            if (2048 > g) {
                d.push((g >> 6) | 192);
            } else {
                if (
                    55296 == (g & 64512) &&
                    f + 1 < a.toString().length &&
                    56320 == (a.toString().charCodeAt(f + 1) & 64512)
                ) {
                    g =
                        65536 +
                        ((g & 1023) << 10) +
                        (a.toString().charCodeAt(++f) & 1023);
                    d.push((g >> 18) | 240);
                    d.push(((g >> 12) & 63) | 128);
                } else {
                    d.push((g >> 12) | 224);
                }
                d.push(((g >> 6) & 63) | 128);
            }
        }
    }
    a = b;
    for (var e = 0; e < d.length; e++) {
        if (typeof a === 'string') {
            a = parseInt(a) + d[e];
        } else {
            a += d[e];
        }
        a = wr(a, '+-a^+6');
    }
    a = wr(a, '+-3^+b+-f');
    a ^= tkk[1] != null ? tkk[1] + 0 : 0;
    if (0 > a) {
        a = (a & 2147483647) + 2147483648;
    }
    a %= 1e6;
    a = Math.round(a);
    return a.toString() + '.' + (a ^ parseInt(b)).toString();
}

function TKK() {
    return ['406398', 561666268 + 1526272306];
}

function wr(a, b) {
    var d;
    try {
        for (var c = 0; c < b.length - 2; c += 3) {
            d = b[c + 2];
            d =
                'a'.charCodeAt(0) <= d.toString().charCodeAt(0)
                    ? d[0].charCodeAt(0) - 87
                    : parseInt(d);
            d = '+' == b[c + 1] ? rightShift(a, d) : a << d;
            a = '+' == b[c] ? (a + d & 4294967295) : a ^ d;
        }
        return a;
    } catch (e) {
        throw e;
    }
}

function rightShift(a, b) {
    var m;
    if (b >= 32 || b < -32) {
        m = (b / 32) | 0;
        b = b - m * 32;
    }

    if (b < 0) {
        b = 32 + b;
    }

    if (b == 0) {
        return ((a >> 1) & 0x7fffffff) * 2 + ((a >> b) & 1);
    }

    if (a < 0) {
        a = a >> 1;
        a = a & 2147483647;
        a = a | 0x40000000;
        a = a >> (b - 1);
    } else {
        a = a >> b;
    }
    return a;
}
