// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser');
// Configuration
// Application initialization
var app = express();
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var http = require('http').Server(app);
// set the view engine to ejs -- momal
app.set('view engine', 'ejs');

//routing the static files. css/js
app.use(express.static(__dirname + '/public'));
/*----------------- No need to make any changes to this part unless any dependency is needed to be added -----------*/

//routing to student dashboard
var studentDashboard = require('./public/js/student_dashboard.js');
app.use('/',studentDashboard);
/*--------------------------------------------------*/

// Begin listening
app.listen(3000);
console.log("server started")
