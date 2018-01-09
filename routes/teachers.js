// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser');
var passport = require('passport');
var router = express.Router();

//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});

//---------------------------------------Start of Class functions-------------------------------------------------------

//display classes

// -------------- Moomal ----For Results and Autocheck-------------------------
var sqlSelectMCQAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 2";
var sqlSelectLongQAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 1";
var sqlSelectTFAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 3";
var sqlgetmcqAssessmentResults = "select derived2.userid, derived2.assessmentid, coalesce( sum(derived.Obtained),0) as Obtained from (select mcq.correctOption, mcq.marks, sass.answer, sass.userid, sass.assessmentid, sass.questionID, CASE WHEN sass.answer = mcq.correctOption THEN mcq.marks ELSE 0 END as 'Obtained' from student_assessment sass inner join (SELECT distinct(userid) as userid FROM student_assessment where assessmentID = ?) bsass on bsass.userid = sass.userID inner join mc_questions mcq on mcq.mcqID = sass.questionID where sass.assessmentID = ? order by sass.questionID) derived  right join (SELECT userid, cass.assessmentid, 0 as Obtained from user_class uclass inner join  class_assessment cass on  uclass.classId = cass.classID where cass.assessmentid = ? ) derived2 on derived2.userid = derived.userid  group by derived2.userid";
var sqlInsertResults = "INSERT INTO assessment_results (assessmentID,userID,obtainedmarks)VALUES(?,?,?)";
var sqlgetTFAssessmentResults = "select derived2.userid, derived2.assessmentid, coalesce( sum(derived.Obtained),0) as Obtained from (select tfq.correctOption, tfq.marks, sass.answer, sass.userid, sass.assessmentid, sass.questionID, CASE WHEN sass.answer = tfq.correctOption THEN tfq.marks ELSE 0 END as 'Obtained' from student_assessment sass inner join (SELECT distinct(userid) as userid FROM student_assessment where assessmentID = ?) bsass on bsass.userid = sass.userID inner join tf_questions tfq on tfq.tfqID = sass.questionID where sass.assessmentID = ? order by sass.questionID) derived right join (SELECT userid, cass.assessmentid, 0 as Obtained from user_class uclass inner join  class_assessment cass on  uclass.classId = cass.classID where cass.assessmentid = ? ) derived2 on derived2.userid = derived.userid  group by derived2.userid";
var sqlgetLongUserIds = "Select distinct concat(u.firstName, ' ',  u.lastName) as uName, coalesce(assr.obtainedMarks, 0) as 'Obtained',  CASE  WHEN coalesce(assr.obtainedMarks, 0) != 0 THEN 'Added'  ELSE 'Not Added' END as 'results', u.userID,  sass.assessmentID  , CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as deadline from users u   inner join  student_assessment  sass on u.userID = sass.userID  left join  assessment_results assr on assr.assessmentID = sass.assessmentID and u.userID = assr.userID inner join assessment ass on sass.assessmentID = ass.assessmentID where sass.assessmentID = ?  group by u.userid";
var sqlgetUserLongAssignment = "SELECT sass.userID as userID, loq.lqText as Text,loq.marks as Marks, sass.questionID as questionID, sass.assessmentID as assessmentID, sass.answer as answer FROM student_assessment sass inner join long_questions loq on loq.lqID = sass.questionID WHERE userID = ? AND assessmentID = ?";
var sqlgetResultCount = "select count(*) as c from assessment_results where assessmentid = ?";
//----------------------------------------------------

router.get('/getClassesName', function(req, res){

    var sqlGetTeacherClasses = 'SELECT * FROM classes where createdBy = ' + res.req.user.user_id; //To get all the classes taught by a teacher

    connection.query(sqlGetTeacherClasses, function (err, result, fields) {
        if(err) throw err;
        res.json(result);
    });
});

//Add a new class

router.post('/addClass', function (req, res) {

    console.log("hi" + res);
    var sqlInsertClass = "INSERT INTO classes (name, createdOn, createdBy) values('" + req.body.name + "', now(), " + res.req.user.user_id + ")";

    connection.query(sqlInsertClass, function (err, result, fields) {
       if(err) throw err;
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
});

//---------------------------------------End of Class functions-------------------------------------------------------

//---------------------------------------Start of Test functions-------------------------------------------------------

//Display tests

router.get('/getTestsName/:id', function(req, res){

   var sqlGetClassTests = "SELECT * FROM assessment where assessment.assessmentID IN (SELECT class_assessment.assessmentID FROM class_assessment where class_assessment.classID = " + req.params.id +")"; //To get all the tests belonging to one class

    connection.query(sqlGetClassTests, function (err, result, fields) {
        if(err) throw err;
        res.json(result);
    });
   //res.json({"id":req.params.id});
});

//Add a test

router.post('/addTest/:id', function (req, res) {

    var d = new Date(req.body.deadline),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    //console.log(year+"-"+month+"-"+day);

    var sqlInsertClassTest = "INSERT INTO assessment (name, deadline, totalMarks, passingMarks, assessmentType) VALUES ('" + req.body.name + "', '" + year + "-" + month + "-" + day + "', " + req.body.totalMarks + ", " + req.body.passingMarks + ", '" + req.body.assessmentType + "')";

    connection.query(sqlInsertClassTest, function (err, result, fields) {
       if(err) throw err;
       console.log("Success");
    });

    //Adding into notification table for Kriti
    var sqlInsertNotification = "INSERT INTO notification (message, type, createdon) VALUES (CONCAT((SELECT name FROM classes WHERE classID = " + req.params.id + "), ' test added'), 'test', now())";

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

    var d = new Date(req.body.deadline),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var sqlUpdateTest = "UPDATE assessment SET name = '" + req.body.name + "', deadline = '" + year + "-" + month + "-" + day + "', totalMarks = " + req.body.totalMarks + ", passingMarks = " + req.body.passingMarks + " WHERE assessmentID = " + req.body.assessmentID;

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

    var sqlDeleteTFQuestion = "DELETE FROM tf_questions WHERE tfqID = " + req.body.tfqID;
    var sqlDeleteTFAssessment = " DELETE FROM tfassessment_question WHERE questionID = " + req.body.tfqID;

    connection.query(sqlDeleteTFQuestion, function (err, result, fields) {
       if(err) throw err;
       console.log("Question successfully deleted!");
    });
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

    var sqlDeleteMCQQuestion = "DELETE FROM mc_questions WHERE mcqID = " + req.body.mcqID;
    var sqlDeleteMCQAssessment = "DELETE FROM mcassessment_question WHERE questionID = " + req.body.mcqID + "";

    connection.query(sqlDeleteMCQQuestion, function (err, result, fields) {
        if(err) throw err;
        console.log("Question successfully deleted!");
    });
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

/*
* --------------- For Autocheck and Point System Results
* --------------- Moomal
* */

router.get('/assessments', function (req, res) {
    var accessType = res.req.user.accessType;
    var loggedin = req.session.passport.user.user_id;
var message;
    var a = req.query.lg;
    //if the parameter shouts success
    if (a=='sc')
    {
        message = 'success';
    }
    else if (a=='fl')
    {
        message = 'failure';
    }
    else if (a==null)
    {
        message = '';
    }
    else if (a=='dr')
    {
        message = 'deadliner';
    }
    else if (a=='ad')
    {
        message = 'alreadyd';
    }
     connection.query(sqlSelectLongQAssessments, loggedin, function (err, resultL) {
        if(err) throw err;
        connection.query(sqlSelectMCQAssessments, loggedin, function (err, resultM) {
            if(err) throw err;
            connection.query(sqlSelectTFAssessments, loggedin, function (err, resultTF) {
                if(err) throw err;
                res.render('teacher/alltests', {resultL: resultL, resultM: resultM, resultTF: resultTF, accessType : accessType, message:message});
            });
        });
    });
});

router.get('/submitMCQ/:id', function (req, res) {
    var accessType = res.req.user.accessType;
    assessmentid = req.params.id;
    connection.query(sqlgetResultCount, assessmentid, function (err, result) {
        if(err) throw err;
     if (result[0].c > 0)
     {
         res.redirect('../../teacher/assessments?lg=ad');
     }
     else {
         connection.query(sqlgetmcqAssessmentResults, [assessmentid, assessmentid, assessmentid], function (err, result, fields) {
             if (err) throw err;
             for (var i = 0; i < result.length; i++) {
                 var userid = result[i].userid;
                 var obtained = result[i].Obtained;
                 connection.query(sqlInsertResults, [assessmentid, userid, obtained], function (err, result) {
                     if (err) throw err;
                 });
             }
             res.redirect('../../teacher/assessments?lg=sc');
         });
     }

    });
});


router.get('/submitTF/:id', function (req, res) {
    var accessType = res.req.user.accessType;
    assessmentid = req.params.id;
    connection.query(sqlgetResultCount, assessmentid, function (err, result) {
        if(err) throw err;
        if (result[0].c > 0)
        {
            res.redirect('../../teacher/assessments?lg=ad');
        }
        else {
            connection.query(sqlgetTFAssessmentResults, [assessmentid, assessmentid, assessmentid], function (err, result, fields) {
                if (err) throw err;
                for (var i = 0; i < result.length; i++) {
                    var userid = result[i].userid;
                    var obtained = result[i].Obtained;
                    connection.query(sqlInsertResults, [assessmentid, userid, obtained], function (err, result) {
                        if (err) throw err;
                    });
                }

                res.redirect('../../teacher/assessments?lg=sc');
            });
        }
    });

});

router.get('/allsubmissions/:id', function (req, res) {
    var accessType = res.req.user.accessType;
    assessmentid = req.params.id;
    connection.query(sqlgetLongUserIds, assessmentid, function (err, result) {
        if(err) throw err;

        if (result[0].deadline == 'Finished')
        {
            res.render('teacher/viewsubmissions', {result: result, accessType : accessType});
        }
        else {
            res.redirect('../../teacher/assessments?lg=dr');
        }
    });

});



router.get('/studentanswers/:id/:assid', function (req, res) {
    var accessType = res.req.user.accessType;
    assessmentid = req.params.assid;
    userid = req.params.id;
    connection.query(sqlgetUserLongAssignment, [userid, assessmentid], function (err, result) {
        if(err) throw err;
        res.render('teacher/studentsubmission', {result: result, accessType : accessType});
    });

});

router.post('/addresult', function(req, res) {
   // console.log(req.body);
    var total = 0;
    var assessmentid =0;
    var userid = 0;
    for (var i = 0;i<req.body.assessmentid.length;i++)
    {

        var marks = parseInt(req.body.marks[i]);
        assessmentid = req.body.assessmentid[i];
        userid = req.body.userid[i];
        total = parseInt(total) + marks;


    }

    connection.query(sqlInsertResults, [assessmentid,userid, total], function (err, result) {
            if(err) throw err;
        });
    res.redirect('../teacher/allsubmissions/'+assessmentid);

});

/* this is to route this file to router so it can take it to app.js */
module.exports = router;