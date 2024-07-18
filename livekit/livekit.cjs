const jose = require('jose');

const defaultTTL = `6h`;

class AccessToken {
    constructor(apiKey, apiSecret, options) {
        if (!apiKey) {
            apiKey = process.env.LIVEKIT_API_KEY;
        }
        if (!apiSecret) {
            apiSecret = process.env.LIVEKIT_API_SECRET;
        }
        if (!apiKey || !apiSecret) {
            throw new Error('api-key and api-secret must be set');
        } else if (typeof document !== 'undefined') {
            console.error('You should not include your API secret in your web client bundle.\n\n' +
                'Your web client should request a token from your backend server which should then use ' +
                'the API secret to generate a token. See https://docs.livekit.io/client/connect/');
        }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.grants = {};
        this.identity = options && options.identity;
        this.ttl = (options && options.ttl) || defaultTTL;
        if (typeof this.ttl === 'number') {
            this.ttl = `${this.ttl}s`;
        }
        if (options && options.metadata) {
            this.metadata = options.metadata;
        }
        if (options && options.name) {
            this.name = options.name;
        }
    }

    addGrant(grant) {
        this.grants.video = Object.assign({}, this.grants.video || {}, grant);
    }

    set metadata(md) {
        this.grants.metadata = md;
    }

    set name(name) {
        this.grants.name = name;
    }

    get sha256() {
        return this.grants.sha256;
    }

    set sha256(sha) {
        this.grants.sha256 = sha;
    }

    async toJwt() {
        const secret = Buffer.from(this.apiSecret, 'utf-8');
        const jwt = new jose.SignJWT(this.grants)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuer(this.apiKey)
            .setExpirationTime(this.ttl)
            .setNotBefore(0);
        if (this.identity) {
            jwt.setSubject(this.identity);
        } else if (this.grants.video && this.grants.video.roomJoin) {
            throw new Error('identity is required for join but not set');
        }
        return jwt.sign(secret);
    }
}

class TokenVerifier {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    async verify(token) {
        const secret = Buffer.from(this.apiSecret, 'utf-8');
        const { payload } = await jose.jwtVerify(token, secret, { issuer: this.apiKey });
        if (!payload) {
            throw new Error('invalid token');
        }
        return payload;
    }
}

function generateToken(apiKey, apiSecret, grantOptions) {
    const accessToken = new AccessToken(apiKey, apiSecret, grantOptions);
    return accessToken.toJwt();
}

async function getToken  (req, res) {
    try {
        console.log('livekit imported', AccessToken)
            let room = req.query.room;
            const at = new AccessToken('APIo9Aw99v4QVna', 'abMMSeUuou1hDZHlYNFxkRPrK7Ikk9yeO0dY0WbDIxI', {
                identity: `${req.user.id}`,
                ttl: '24h',
            });
            at.addGrant({ roomJoin: true, room: `${room}`,});
    
            let token = await at.toJwt();

            console.log(`token genrated: `)
    
            return res.status(200).json({
                status: '200',
                message: 'Success',
                data: token
            })
        
    } catch (e) {
        return res.status(500).json({
            status: '500',
            message: `Internal Server Error ${e}`
        })
    }
}

module.exports = {
    AccessToken,
    TokenVerifier,
    generateToken,
    getToken
};

