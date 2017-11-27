// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
	bodyParser = require('body-parser'),
    path       = require('path');
var app = express();

var router = express.Router();

// Application initialization
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// set the view engine to ejs -- momal
app.set('view engine', 'ejs');
//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

// setting the routes (sub js pages)
var teachers = require('./routes/teachers.js');
var index = require('./routes/index.js');

// if there are any pages that start after localhost:8080/ then route them to index
// this includes the main page and/or about page, contact us page etc ...
app.use('/',index);

// if anything comes after localhost:8080/teachers then route to teachers.js
app.use('/teacher',teachers);


// Begin listening
app.listen(3000);
