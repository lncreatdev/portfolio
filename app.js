var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');
var bodyParser = require( 'body-parser' );

var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

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
