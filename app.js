var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require( 'body-parser' );

var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var auth = {
    auth: {
        api_key: 'key-4fc63985a7f7b6cbe750aae4dc31cad4',
        domain: 'https://api.mailgun.net/v3/app8e1774ab189a47c9b946e23c03f7a4dc.mailgun.org'
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
