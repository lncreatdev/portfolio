var express = require('express');
var http = require('http');
var path = require('path');
var static = require('serve-static');

// create application/json parser
//var jsonParser = bodyParser.json();


var app = express();
var routes = require('./routes');

// set our port
var port = process.env.PORT || 8002;

app.use(static(path.join(__dirname, 'dist')));

// Routes
app.get('/', routes.index);

app.get('/admin', function(req, res) {
    res.sendStatus(200);
});


app.listen(port);
