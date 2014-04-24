(function () {
    var express = require('express');
    var https = require('https');
    var app = express();
    var cfg = require('./config');

    var client_secret = cfg.client_secret;
    var client_id = cfg.client_id;
    var redirect_uri = cfg.redirect_uri;
    var grant_type = 'authorization_code';

    var post_req_handler = function (code, onsuccess, onfail) {
        var post_data = 'client_id=' + encodeURIComponent(client_id)
                     + '&client_secret=' + encodeURIComponent(client_secret)
                     + '&grant_type=' + encodeURIComponent(grant_type)
                     + '&redirect_uri=' + encodeURIComponent(redirect_uri)
                     + '&code=' + encodeURIComponent(code);

        var post_options = {
            host: 'api.instagram.com',
            port: 443,
            path: '/oauth/access_token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': post_data.length
            }
        };

        var post_req = https.request(post_options, function (res) {
            res.setEncoding('utf-8');
            res.on('data', function (chunk) {
                onsuccess(chunk);
            });
        });

        post_req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            onfail({msg: e.message});
        });

        post_req.write(post_data);
        post_req.end();
    };

    app.configure(function () {
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
    });

    app.get('/step_two', function (req, res) {
        var code = req.params.code;
        post_req_handler(code, function (statusCode, data) { // onsuccess
            res.status(statusCode).send(data);

        }, function (err) { // onfail
            res.status(500).send(err);
        });
    });

    app.listen(process.env.PORT || 2424);

}).call(this);