
const BaseService = require('./base.service').BaseService;


const forge = require('forge-apis');
const moment = require('moment');

class AuthService extends BaseService {
    constructor(config) {
        super(config)
        this._config = {
            oauth: {
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                scope: ['bucket:read', 'data:read', 'viewables:read']
            }
        }
    }

    name() {
        return 'AuthService'
    }

    async get2LeggedToken() {
        try {
            var token = this._2LeggedToken;
            if (!token || this.getExpiry(token) < 60) {
                token = await this.request2LeggedToken();
                this.set2LeggedToken(token);
            }
            return token;

        } catch (err) {
            throw err;
        }
    }

    async request2LeggedToken() {

        try {
            const oAuth2TwoLegged = new forge.AuthClientTwoLegged(
                this._config.oauth.clientId,
                this._config.oauth.clientSecret,
                this._config.oauth.scope);

            return oAuth2TwoLegged.authenticate();
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    set2LeggedToken(token) {
        //store current time
        token.time_stamp = moment().format();
        this._2LeggedToken = token;
    }

    getExpiry(token) {
        var age = moment().diff(token.time_stamp, 'seconds');
        return token.expires_in - age;
    }
}

module.exports = {
    AuthService
}
