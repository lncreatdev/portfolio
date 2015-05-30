var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require( 'body-parser' );

var nodemailer = require('nodemailer');
var generator = require('xoauth2').createXOAuth2Generator({
    user: 'kwame.23@gmail.com',
    clientId: '830781104220.apps.googleusercontent.com',
    clientSecret: 'qf6Yuk8-qkSAUitbEmd3eOTO',
    refreshToken: '1/uqlL1jLLr6DwJz5c88SFgamM5i4K_KjHBPlyab_mtNk'
});

// listen for token updates
// you probably want to store these to a db
generator.on('token', function(token){
    console.log('New token for %s: %s', token.user, token.accessToken);
});

// reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport(({
    service: 'gmail',
    auth: {
        XOAuth2: generator
    }
}));

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
