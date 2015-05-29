var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require( 'body-parser' );

var nodemailer = require('nodemailer');

// reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        XOAuth2: {
            user: 'kwame.23@gmail.com',
            clientId: '830781104220.apps.googleusercontent.com',
            clientSecret: 'qf6Yuk8-qkSAUitbEmd3eOTO',
            refreshToken: '1/JG9oE1i7XyLwyccKtbqfda-K_OczHC0MXdbDzgRU3Zs'
        }
    }
});

// create application/json parser
//var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({extended: false});

var app = express();
var routes = require('./routes');

// set our port
var port = process.env.PORT || 8002;

app.use(static(path.join(__dirname, 'dist')));

// Routes
app.get('/', routes.index);

app.get('/admin', function(req, res) {
    console.log('ad min');
    res.sendStatus(200);
});

app.post('/sendquestion', urlencodedParser, routes.sendquestion(transporter));

app.on('listening',function(){
    console.log('ok, server is running');
});

app.listen(port);
console.log('Magic happens on port ' + port);
