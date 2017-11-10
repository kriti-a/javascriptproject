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
// set the view engine to ejs -- momal
app.set('view engine', 'ejs');
//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});
//routing the static files. css/js
app.use(express.static(__dirname + '/public'));
/*----------------- No need to make any changes to this part unless any dependency is needed to be added -----------*/

// ------------------SQL Queries----------------------
//----------- Please add all sql strings here --------







//----------------------------------------------------




// ------------------Routing / Functions--------------
//-------------- Please add all functions here -------


// Main route sends our HTML file
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});


//----------------------------------------------------





// Begin listening
app.listen(3000);
