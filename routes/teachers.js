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

//---------------------------------------Start of Class functions-------------------------------------------------------

//display classes

router.get('/getClassesName', function(req, res){

    var sqlGetTeacherClasses = 'SELECT * FROM classes where createdBy = ' + loggedInTeacher; //To get all the classes taught by a teacher

    connection.query(sqlGetTeacherClasses, function (err, result, fields) {
        if(err) throw err;
        res.json(result);
    });
});

//Add a new class

router.post('/addClass', function (req, res) {

    console.log("kdmwked");
    var sqlInsertClass = "INSERT INTO classes (name, createdOn, createdBy) values('" + req.body.name + "', now(), " + loggedInTeacher + ")";

    connection.query(sqlInsertClass, function (err, result, fields) {
       if(err) throw err;
       console.log("eadmemd");
       res.json("Class was successfully added!");
    });
});

//Update a class

router.post('/updateClass', function (req, res) {

    var sqlUpdateClass = "UPDATE classes SET classes.name ='" +req.body.name +"' WHERE classes.classID ="+ req.body.classID;

    connection.query(sqlUpdateClass, function (err, result, fields) {
        if(err) throw err;
        res.json("done");
    });

});

//Delete a class

router.post('/deleteClass', function (req, res) {

    var sqlDeleteClass = "DELETE FROM classes WHERE classes.classID = " + req.body.classID;

    connection.query(sqlDeleteClass, function (err, result, fields) {
       if(err) throw err;
       res.json("Class deleted");
    });

    //Now we have to delete all the tests in the class

  /*  var sqlDeleteClassAssessment = "DELETE FROM class_assessment WHERE class_assessment.classID = " + req.body.classID;

    connection.query(sqlDeleteClassAssessment, function (err, result, fields) {
       if(err) throw err;
       console.log("Done");
       console.log("Done");
    });

    var sqlDeleteClassTest = "DELETE FROM assessment WHERE assessmentID IN (SELECT assessmentID FROM class_assessment where classID = " + req.body.classID + ")";

    connection.query(sqlDeleteClassTest, function (err, result, fields) {
       if(err) throw err;
       console.log("Done");
    });*/

});

//---------------------------------------End of Class functions-------------------------------------------------------

//---------------------------------------Start of Test functions-------------------------------------------------------

//Display tests

router.get('/getTestsName/:id', function(req, res){

   var sqlGetClassTests = "SELECT * FROM assessment where assessment.assessmentID IN (SELECT class_assessment.assessmentID FROM class_assessment where class_assessment.classID = "+ req.params.id +")"; //To get all the tests belonging to one class

    connection.query(sqlGetClassTests, function (err, result, fields) {
        if(err) throw err;
        res.json(result);
    });
   //res.json({"id":req.params.id});
});

//Add a test

router.post('/addTest/:id', function (req, res) {

    //console.log("kfnwjefnwejf: "+ req.body.deadline.split(" ")[0]);
    var sqlInsertClassTest = "INSERT INTO assessment (name, deadline, totalMarks, passingMarks, assessmentType) VALUES ('" + req.body.name + "', '2018-01-04', " + req.body.totalMarks + ", " + req.body.passingMarks + ", '" + req.body.assessmentType + "')";

    connection.query(sqlInsertClassTest, function (err, result, fields) {
       if(err) throw err;
       console.log("Success");
    });

    //Adding into notification table for Kriti
    var sqlInsertNotification = "INSERT INTO notification (message, type, createdon) VALUES (CONCAT((SELECT name FROM classes WHERE classID = " + req.params.id + "), ' test added'), '" + req.body.assessmentType + "', now())";

    connection.query(sqlInsertNotification, function (err, result, fields) {
       if(err) throw err;
       console.log("Notification added");
    });

    var sqlInsertClassTest1 = "INSERT INTO class_assessment (classID, assessmentID) VALUES (" + req.params.id + ", (SELECT assessmentID FROM assessment ORDER BY assessmentID DESC LIMIT 1))";

    connection.query(sqlInsertClassTest1, function (err, result, fields) {
       if(err) throw err;
       res.json("Test was successfully added!");
    });

});

//Update a test

router.post('/updateTest', function (req, res) {

    var sqlUpdateTest = "UPDATE assessment SET name = '" + req.body.name + "', deadline = '" + req.body.deadline + "', totalMarks = " + req.body.totalMarks + ", passingMarks = " + req.body.passingMarks + " WHERE assessmentID = " + req.body.assessmentID;

    connection.query(sqlUpdateTest, function (err, result, fields) {
       if(err) throw err;
       res.json("Test was successfully updated");
    });
});

//Delete a test

router.post('/deleteTest', function(req, res){

    var sqlDeleteTest = "DELETE FROM assessment WHERE assessmentID = " + req.body.assessmentID;

    connection.query(sqlDeleteTest, function (err, result, fields) {
       if(err) throw err;
       console.log("Success");
    });

    var sqlDeleteTest1 = "DELETE FROM class_assessment WHERE assessmentID = " + req.body.assessmentID;

    connection.query(sqlDeleteTest1, function (err, result, fields) {
        if(err) throw err;
        res.json("Test was succesfully deleted!");
    });
});

//---------------------------------------End of Test functions-------------------------------------------------------

//---------------------------------------Start of true/false functions-------------------------------------------------------

//display true/false questions in a test

router.get('/getTrueFalseQuestions/:id', function (req, res) {

    var sqlGetTFQuestions = "SELECT * FROM tf_questions WHERE tfqID in (SELECT questionID FROM tfassessment_question WHERE assessmentID = " + req.params.id + ")";

    connection.query(sqlGetTFQuestions, function (err, result, fields) {
       if (err) throw err;
       res.json(result);
    });
});

//insert true/false question in a test

router.post('/addTrueFalseQuestion/:id', function (req, res) {

    var sqlInsertTFQuestion = "INSERT INTO tf_questions (tfText, correctOption, marks) VALUES ('" + req.body.tfText + "', '" + req.body.correctOption + "', " + req.body.marks + ")";

    connection.query(sqlInsertTFQuestion, function (err, result, fields) {
       if(err) throw err;
       console.log("Success");
    });

    var sqlInsertTFAssessment = "INSERT INTO tfassessment_question (assessmentID, questionID) VALUES (" + req.params.id + ", (SELECT tfqID FROM tf_questions ORDER BY tfqID DESC LIMIT 1))";

    connection.query(sqlInsertTFAssessment, function (err, result, fields) {
       if(err) throw err;
      res.json("Question was successfully added!");
    });
});

//update true/false question in a test

router.post('/updateTrueFalseQuestion', function (req, res) {

    var sqlUpdateTFQuestion = "UPDATE tf_questions SET tfText = '" + req.body.tfText + "', correctOption = '" + req.body.correctOption + "', marks = " + req.body.marks + " WHERE tfqID = " + req.body.tfqID + "";

    connection.query(sqlUpdateTFQuestion, function (err, result, fields) {
       if(err) throw err;
       res.json("Question was successfully updated!");
    });
});

//delete true/false question in a test

router.post('/deleteTrueFalseQuestion', function (req, res) {

    var sqlDeleteTFQuestion = "DELETE FROM tf_questions WHERE tfqID = " + req.body.tfqID + "; DELETE FROM tfassessment_question WHERE questionID = " + req.body.tfqID;
    //var sqlDeleteTFAssessment = "";

    //connection.query(sqlDeleteTFQuestion, function (err, result, fields) {
      // if(err) throw err;
       //console.log("Question successfully deleted!");
    //});
    connection.query(sqlDeleteTFQuestion, function (err, result, fields) {
        if(err) throw err;
        res.json("Row successfully deleted!");
    });
    //console.log(data);
});

//---------------------------------------End of true/false functions-------------------------------------------------------

//---------------------------------------Start of mcq functions-------------------------------------------------------

//display mcq questions in a test

router.get('/getMCQQuestions/:id', function (req, res) {

    var sqlGetMCQQuestions = "SELECT * FROM mc_questions WHERE mcqID in (SELECT questionID FROM mcassessment_question WHERE assessmentID = " + req.params.id + ")";
    connection.query(sqlGetMCQQuestions, function (err, result, fields) {
       if(err) throw err;
       res.json(result);
    });
});

//insert mcq question in a test

router.post('/addMCQQuestion/:id', function (req, res) {

    var sqlInsertMCQQuestion = "INSERT INTO mc_questions (mcqText, correctOption, optionB, optionC, optionD, marks) VALUES ('" + req.body.mcqText + "', '" + req.body.correctOption + "', '"+ req.body.optionB +"', '" + req.body.optionC + "', '" + req.body.optionD + "', " + req.body.marks + ")";

    connection.query(sqlInsertMCQQuestion, function (err, result, fields) {
        if(err) throw err;
        console.log("Success!");
    });

    var sqlInsertMCQAssessment = "INSERT INTO mcassessment_question (assessmentID, questionID) VALUES (" + req.params.id + ", (SELECT mcqID FROM mc_questions ORDER BY mcqID DESC LIMIT 1))";

    connection.query(sqlInsertMCQAssessment, function (err, result, fields) {
      if(err) throw err;
      res.json("Question was successfully added!");
    });
});

//update mcq question in a test

router.post('/updateMCQQuestion', function (req, res) {

    var sqlUpdateMCQQuestion = "UPDATE mc_questions SET mcqText = '" + req.body.mcqText + "', correctOption = '" + req.body.correctOption + "', optionB = '" + req.body.optionB + "', optionC = '" + req.body.optionC + "', optionD = '" + req.body.optionD + "', marks = " + req.body.marks + " WHERE mcqID = " + req.body.mcqID + "";

    connection.query(sqlUpdateMCQQuestion, function (err, result, fields) {
        if(err) throw err;
        res.json("Question was successfully updated!");
    });
});

//delete mcq question in a test

router.post('/deleteMCQQuestion', function (req, res) {

    var sqlDeleteMCQQuestion = "DELETE FROM mc_questions WHERE mcqID = " + req.body.mcqID + "; DELETE FROM mcassessment_question WHERE questionID ="  + req.body.mcqID + "";
    //var sqlDeleteMCQAssessment = "DELETE FROM mcassessment_question WHERE questionID = " + req.body.mcqID + "";

    //connection.query(sqlDeleteMCQQuestion, function (err, result, fields) {
       // if(err) throw err;
      //  console.log("Question successfully deleted!");
    //});
    connection.query(sqlDeleteMCQQuestion, function (err, result, fields) {
        if(err) throw err;
        res.json("Row successfully deleted!");
    });
    //console.log(data);
});

//---------------------------------------End of mcq functions-------------------------------------------------------

//---------------------------------------Start of long question functions-------------------------------------------------------

//display long questions in a test

router.get('/getLongQuestions/:id', function (req, res) {

    var sqlGetLongQuestions = "SELECT * FROM long_questions WHERE lqID in (SELECT questionID FROM lassessment_question WHERE assessmentID = " + req.params.id + ")";
    connection.query(sqlGetLongQuestions, function (err, result, fields) {
       if(err) throw err;
       res.json(result);
    });
});

//insert long question in a test

router.post('/addLongQuestion/:id', function (req, res) {

    var sqlInsertLongQuestion = "INSERT INTO long_questions (lqText, marks) VALUES ('" + req.body.lqText + "', " + req.body.marks + ")";

    connection.query(sqlInsertLongQuestion, function (err, result, fields) {
        if(err) throw err;
        console.log("Success");
    });
    var sqlInsertLongAssessment = "INSERT INTO lassessment_question (assessmentID, questionID) VALUES (" + req.params.id + ", (SELECT lqID FROM long_questions ORDER BY lqID DESC LIMIT 1))";

    connection.query(sqlInsertLongAssessment, function (err, result, fields) {
        if(err) throw err;
        //res.json({id : req.params.id});
        res.json("Question was added successfully!");
    });
});

//update long question in a test

router.post('/updateLongQuestion', function (req, res) {

    var sqlUpdateLongQuestion = "UPDATE long_questions SET lqText = '" + req.body.lqText + "', marks = " + req.body.marks + " WHERE lqID = " + req.body.lqID + "";

    connection.query(sqlUpdateLongQuestion, function (err, result, fields) {
        if(err) throw err;
        res.json("Question was successfully updated!");
    });
});

//delete long question in a test

router.post('/deleteLongQuestion', function (req, res) {

    var sqlDeleteLongQuestion = "DELETE FROM long_questions WHERE lqID = " + req.body.lqID + "";
    var sqlDeleteLongAssessment = "DELETE FROM lassessment_question WHERE questionID = " + req.body.lqID + "";

    connection.query(sqlDeleteLongQuestion, function (err, result, fields) {
        if(err) throw err;
        console.log("Question successfully deleted!");
    });
    connection.query(sqlDeleteLongAssessment, function (err, result, fields) {
        if(err) throw err;
        res.json("Row successfully deleted!");
    });
    //console.log(data);
});

//---------------------------------------End of long question functions-------------------------------------------------------

//--------------------------------------------------------------------------------------------------//

/* this is to route this file to router so it can take it to app.js */
module.exports = router;