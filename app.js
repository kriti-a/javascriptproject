// Module dependencies

var express    = require('express'),
    mysql      = require('mysql'),
	bodyParser = require('body-parser');

// Application initialization

var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root'
    });
    
var app = express();

// Database setup

connection.query('CREATE DATABASE IF NOT EXISTS db1', function (err) {
    if (err) throw err;
    connection.query('USE db1', function (err) {
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
