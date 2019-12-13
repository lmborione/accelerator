
const BaseService = require('./base.service').BaseService;


const forge = require('forge-apis');
const moment = require('moment');

class AuthService extends BaseService {
    constructor(config) {
        super(config)
        this._2LeggedToken = null;
        this._config = {
            oauth: {
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                //scope: ['bucket:read', 'bucket:create', 'data:read', 'viewables:read']
                scope: ['bucket:create',
                    'bucket:read',
                    'bucket:update',
                    'data:read',
                    'data:write',
                    'data:create',
                    'viewables:read',
                ],
                adminScope: [
                    'bucket:delete',
                    'bucket:create',
                    'bucket:read',
                    'bucket:update',
                    'data:read',
                    'data:write',
                    'data:create',
                    'viewables:read',
                ]
            }
        }
    }

    name() {
        return 'AuthService'
    }

    async get2LeggedToken(admin) {
        try {
            var token = admin ? this._admin2LeggedToken : this._2LeggedToken;
            if (!token || this.getExpiry(token) < 60) {
                token = await this.request2LeggedToken(admin);
                this.set2LeggedToken(token, admin);
            }
            return token;

        } catch (err) {
            throw err;
        }
    }


    async request2LeggedToken(admin) {

        try {
            const oAuth2TwoLegged = new forge.AuthClientTwoLegged(
                this._config.oauth.clientId,
                this._config.oauth.clientSecret,
                admin ? this._config.oauth.adminScope : this._config.oauth.scope);

            return oAuth2TwoLegged.authenticate();
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    set2LeggedToken(token, admin) {
        //store current time
        token.time_stamp = moment().format();

        if (admin) {
            this._admin2LeggedToken = token;
        } else {
            this._2LeggedToken = token;
        }

    }

    getExpiry(token) {
        var age = moment().diff(token.time_stamp, 'seconds');
        return token.expires_in - age;
    }
}

module.exports = {
    AuthService
}
