var express = require('express');
var router = express.Router();
var mysql = require('mysql'),
    bodyParser = require('body-parser');

//redirecting to the index page. This is the first page to show when user enters our website
router.get('/', function(req, res){
    res.render('index');
});


module.exports = router;