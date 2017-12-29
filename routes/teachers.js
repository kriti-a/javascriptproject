// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser');

var router = express.Router();

//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});

var loggedInTeacher = 1; //This should be a dynamic value coming from the session. For testing purposes, a dummy value is used
var classToUpdate = 101; //This holds the id of the class that is to be updated
// ------------------SQL Queries----------------------
//----------- Please add all sql strings here --------

var sqlGetTeacherClasses = 'SELECT * FROM classes where createdBy = ' + loggedInTeacher; //To get all the classes taught by a teacher
var sqlGetClassTests = 'SELECT * FROM assessment where assessment.assessmentID IN (SELECT class_assessment.assessmentID FROM class_assessment where class_assessment.classID = ?)'; //To get all the tests belonging to one class
var sqlInsertClass = 'insert into assess_easy.classes (name, createdOn, createdBy) values (?, now(), ' + loggedInTeacher + ');'; //This query will insert a new class to the classes table
var sqlDeleteClass = 'delete from assess_easy.classes where classes.classID = ?';
var sqlUpdateClass = 'UPDATE classes SET classes.name = ? WHERE classes.classID = ?';

//also add query to add row into question_assessment table

var sqltfInsertQuestion = 'insert into assess_easy.tf_questions (tfText, correctOption, marks) values (?, ?, ?)';
var sqlmcqInsertQuestion = 'insert into assess_easy.mc_questions (mcqText, correctOption, optionB, optionC, optionD, marks) values (?, ?, ?, ?, ?, ?)';
var sqllqInsertQuestion = 'insert into assess_easy.long_questions (lqText, marks) values (?, ?)';
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

//Function to add new class to the database

router.get('/addClass', function (req, res) {
   var test = req.query.lg;
   if(test == 'sc'){
       res.render('teacher/addClass', {message : 'success'});
   }
   else if(test == 'f1'){
       res.render('teacher/addClass', {message : 'error'});
   }
   else if(test == null){
       res.render('teacher/addClass');
   }
});

router.post('/addclassaction', function (req, res) {
    var name = req.body.className;
    if(name.toString() !== ''){
    connection.query(sqlInsertClass, [name], function (err, result, fields) {
          if(err) throw err;
          res.redirect('addClass?lg=sc');
       });
   }
   else{
       res.redirect('addClass?lg=f1');
   }
});

//Function to delete the class
//VERY IMPORTANT: this code will only delete classes for now that is if i can get it to work. This code should also delete all the tests of that class

router.get('/viewClasses/:id', function (req, res) {
    connection.query(sqlDeleteClass, [req.params.id]);
    connection.query(sqlGetTeacherClasses, [req.params.id], function (err, result, fields) {
        if(err) throw err;
        res.render('teacher/viewClasses', {result: result});
    });
});

//Function to render the edit class page

router.get('/editClass', function (req, res) {
    res.render('teacher/editClass');
});

//Function to update the name of the class

router.get('/editClass', function (req, res) {
    var test = req.query.lg;
    if(test == 'sc'){
        res.render('teacher/editClass', {message : 'success'});
    }
    else if(test == 'f1'){
        res.render('teacher/editClass', {message : 'error'});
    }
    else if(test == null){
        res.render('teacher/editClass');
    }
});

router.post('/updateclassaction', function (req, res) {
    classToUpdate = 22;
    var name = req.body.className;
    console.log("Class New Name: "+name);
    if(name.toString() !== ''){
        connection.query(sqlUpdateClass, [name, classToUpdate], function (err, result, fields) {
            if(err) throw err;
            res.redirect('editClass?lg=sc');
        });
    }
    else{
        res.redirect('editClass?lg=f1');
    }
});

router.get('/addTest', function (req, res) {
    res.render('teacher/addTest', {result : classToUpdate});
});

//--------------------------------------------------------------------------------------------------//

//This part involves the get and post routes for the test questions

//True/False Questions

router.get('/trueFalse_designer', function (req, res) {
    res.render('teacher/trueFalse_designer');
});

router.get('/trueFalse_designer', function (req, res) {
    var test = req.query.lg;
    if(test == 'sc'){
        res.render('teacher/trueFalse_designer', {message : 'success'});
    }
    else if(test == 'f1'){
        res.render('teacher/trueFalse_designer', {message : 'error'});
    }
    else if(test == null){
        res.render('teacher/trueFalse_designer');
    }
});

router.post('/addtfquestion', function (req, res) {
    var question = req.body.question;
    var correctAnswer = req.body.correctAnswer;
    var marks = req.body.marks;

    if(question.toString() !== '' && correctAnswer.toString() !== '' && marks.toString() !== ''){
        connection.query(sqltfInsertQuestion, [question, correctAnswer, marks], function (err, result, fields) {
            if(err) throw err;
            res.redirect('trueFalse_designer?lg=sc');
        });
    }
    else{
        res.redirect('trueFalse_designer?lg=f1');
    }
});

//MCQ Questions

router.get('/mcq_designer', function (req, res) {
    res.render('teacher/mcq_designer');
});

router.get('/mcq_designer', function (req, res) {
    var test = req.query.lg;
    if(test == 'sc'){
        res.render('teacher/mcq_designer', {message : 'success'});
    }
    else if(test == 'f1'){
        res.render('teacher/mcq_designer', {message : 'error'});
    }
    else if(test == null){
        res.render('teacher/mcq_designer');
    }
});

router.post('/addmcqquestion', function (req, res) {
    var question = req.body.question;
    var correctAnswer = req.body.correctOption;
    var optionB = req.body.optionB;
    var optionC = req.body.optionC;
    var optionD = req.body.optionD;
    var marks = req.body.marks;

    if(question.toString() !== '' && correctAnswer.toString() !== '' && optionB.toString() !== '' && optionC.toString() !== '' && optionD.toString() !== '' && marks.toString() !== ''){
        connection.query(sqlmcqInsertQuestion, [question, correctAnswer, optionB, optionC, optionD, marks], function (err, result, fields) {
            if(err) throw err;
            res.redirect('mcq_designer?lg=sc');
        });
    }
    else{
        res.redirect('mcq_designer?lg=f1');
    }
});

//Long Questions

router.get('/longQuestion_designer', function (req, res) {
    res.render('teacher/longQuestion_designer');
});

router.get('/longQuestion_designer', function (req, res) {
    var test = req.query.lg;
    if(test == 'sc'){
        res.render('teacher/longQuestion_designer', {message : 'success'});
    }
    else if(test == 'f1'){
        res.render('teacher/longQuestion_designer', {message : 'error'});
    }
    else if(test == null){
        res.render('teacher/longQuestion_designer');
    }
});

router.post('/addlqquestion', function (req, res) {
    var question = req.body.question;
    var marks = req.body.marks;

    if(question.toString() !== '' && marks.toString() !== ''){
        connection.query(sqllqInsertQuestion, [question, marks], function (err, result, fields) {
            if(err) throw err;
            res.redirect('longQuestion_designer?lg=sc');
        });
    }
    else{
        res.redirect('longQuestion_designer?lg=f1');
    }
});

//--------------------------------------------------------------------------------------------------//

/* this is to route this file to router so it can take it to app.js */
module.exports = router;