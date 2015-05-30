var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require( 'body-parser' );

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var auth = {
    auth: {
        api_key: 'key-8936eca331f064d3f56edb74e900c0ea',
        domain: 'https://api.mailgun.net/v3/sandbox06eedd3a1f594d51890db3d62aa368cc.mailgun.org'
    }
};

var transporter = nodemailer.createTransport(mg(auth));

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

app.post('/sendquestion', urlencodedParser, routes.sendquestion(transporter));

app.on('listening',function(){
    console.log('ok, server is running');
});

app.listen(port);
console.log('Magic happens on port ' + port);
