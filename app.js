// Module dependencies

var express    = require('express'),
    mysql      = require('mysql'),
	bodyParser = require('body-parser');



// set the view engine to ejs -- momal
app.set('view engine', 'ejs');




// Application initialization

var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root'
    });
    
var app = express();

// Database setup

connection.query('CREATE DATABASE IF NOT EXISTS ASSESS_EASY', function (err) {
    if (err) throw err;
    connection.query('USE ASSESS_EASY', function (err) {
        if (err) throw err;
        connection.query('CREATE TABLE IF NOT EXISTS users('
            + 'id INT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'name VARCHAR(30)'
            +  ')', function (err) {
                if (err) throw err;
            });
    });
});

// Configuration

app.use(bodyParser());

// Main route sends our HTML file

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/pages/index.html');
});

app.use(express.static(__dirname + '/public'));

// Update MySQL database

app.post('/users', function (req, res) {
    connection.query('INSERT INTO users SET ?', req.body, 
        function (err, result) {
            if (err) throw err;
            res.send('User added to database with ID: ' + result.insertId);
        }
    );
});

// Begin listening






app.listen(3000);
