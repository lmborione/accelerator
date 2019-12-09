const express = require('express');
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const routes = require('./routes/index');

const authSvc = require('./services/auth.service');
const SvcMng = require('./services/manager.service').ServiceManager;

const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(methodOverride());

const port = process.env.PORT || 5000;
app.set('port', port);

function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode ? err.statusCode : 500;
    console.log(err);

    res.status(statusCode)
        .set("Content-Type", "application/json")
        .send({
            statusCode: statusCode,
            message: err.message,
            errors: err.errors,
            url: req.url
        });
}

var whitelist = ['http://localhost:3000', 'http://localhost:4000', 'http://localhost/postman'];

// ## CORS middleware
var allowCrossDomain = function (req, res, next) {
    console.log(req.headers.origin);

    var origin = whitelist.indexOf(req.headers.origin) > -1 ? req.headers.origin : null;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET,POST');
        res.header('Access-Control-Allow-Headers', '*');

        // intercept OPTIONS method
        if ('OPTIONS' == req.method) {
            res.header('Content-Type', 'application/json');
            res.sendStatus(200);
        } else {
            next();
        }
    } else {
        let err = new Error(`request origin is not allowed`);
        err.statusCode = 505;
        next(err);
    }
};

// Register all services instances
const authService = new authSvc.AuthService();
SvcMng.registerService(authService);

// app.use(allowCrossDomain);

app.use('/home', express.static(`${__dirname}/../client`));

app.use('/api', routes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is listening on port ${port} with consumer key ${process.env.CLIENT_ID}`);
});

