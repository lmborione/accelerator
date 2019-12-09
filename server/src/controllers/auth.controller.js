const svcMng = require('../services/manager.service').ServiceManager;

class AuthController {
    constructor() {

    }

    async viewtoken(req, res, next) {
        console.log('start getting token');
        try {

            const authService = svcMng.getService('AuthService');
            const t = await authService.get2LeggedToken();
            console.log(`token :${t.access_token.slice(0, 40)} ... return to user`);
            res.status(200).json(t);
        } catch (err) {
            next(err);
        }
    }
}


module.exports = {
    AuthController
};
