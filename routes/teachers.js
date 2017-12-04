// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser');

var router = express.Router();

//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    database : 'ASSESS_EASY'
});

var loggedInTeacher = 1; //This should be a dynamic value coming from the session. For testing purposes, a dummy value is used

// ------------------SQL Queries----------------------
//----------- Please add all sql strings here --------

var sqlGetTeacherClasses = 'SELECT * FROM classes where createdBy = ' + loggedInTeacher; //To get all the classes taught by a teacher
var sqlGetClassTests = 'SELECT * FROM assessment where assessment.assessmentID = (SELECT class_assessment.assessmentID FROM class_assessment where class_assessment.classID = ?)'; //To get all the tests belonging to one class

//----------------------------------------------------

//Function to get a particular teacher's classes

router.get('/viewClasses', function (req, res) {
    connection.query(sqlGetTeacherClasses, function (err, result, fields) {
        if(err) throw err;
        res.render('teacher/viewClasses', {result : result})
    });
});

//Function to display the tests of a particular class

router.get('/viewTests/:id', function (req, res) {
    connection.query(sqlGetClassTests, [req.params.id], function (err, result, fields) {
        if(err) throw err;
        res.render('teacher/viewTests', {result: result})
    });
});

//Function where a teacher can add new classes

router.get('/addClass', function (req, res) {
    res.render('teacher/addClass');
});


/* this is to route this file to router so it can take it to app.js */
module.exports = router;