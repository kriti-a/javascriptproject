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

// ------------------SQL Queries----------------------
//----------- Please add all sql strings here --------

var sqlGetTeacherClasses = 'SELECT * FROM classes where createdBy = ' + loggedInTeacher; //To get all the classes taught by a teacher
var sqlGetClassTests = 'SELECT * FROM assessment where assessment.assessmentID IN (SELECT class_assessment.assessmentID FROM class_assessment where class_assessment.classID = ?)'; //To get all the tests belonging to one class
var sqlInsertClass = 'insert into assess_easy.classes (name, createdOn, createdBy) values (?, now(), ' + loggedInTeacher + ');'; //This query will insert a new class to the classes table


// -------------- Moomal ----For Results and Autocheck-------------------------
var sqlSelectMCQAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 2";
var sqlSelectLongQAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 1";
var sqlSelectTFAssessments = "SELECT ass.assessmentID, ass.Name, ass.passingMarks as 'Passing', ass.totalMarks as 'Total',(SELECT 'Long Questions')  'asstype', ass.deadline, CASE WHEN ass.deadline < NOW() then 'Finished' ELSE  'Open' END as 'Due' FROM assessment ass inner join class_assessment cass on ass.assessmentID = cass.assessmentID inner join classes class on cass.classID = class.classID where class.createdby = ? and ass.assessmentType = 3";
var sqlgetmcqAssessmentResults = "select derived2.userid, derived2.assessmentid, coalesce( sum(derived.Obtained),0) as Obtained from (select mcq.correctOption, mcq.marks, sass.answer, sass.userid, sass.assessmentid, sass.questionID, CASE WHEN sass.answer = mcq.correctOption THEN mcq.marks ELSE 0 END as 'Obtained' from student_assessment sass inner join (SELECT distinct(userid) as userid FROM student_assessment where assessmentID = ?) bsass on bsass.userid = sass.userID inner join mc_questions mcq on mcq.mcqID = sass.questionID where sass.assessmentID = ? order by sass.questionID) derived  right join (SELECT userid, cass.assessmentid, 0 as Obtained from user_class uclass inner join  class_assessment cass on  uclass.classId = cass.classID where cass.assessmentid = ? ) derived2 on derived2.userid = derived.userid  group by derived2.userid";
var sqlInsertResults = "INSERT INTO assessment_results (assessmentID,userID,obtainedmarks)VALUES(?,?,?)";
var sqlgetTFAssessmentResults = "select derived2.userid, derived2.assessmentid, coalesce( sum(derived.Obtained),0) as Obtained from (select tfq.correctOption, tfq.marks, sass.answer, sass.userid, sass.assessmentid, sass.questionID, CASE WHEN sass.answer = tfq.correctOption THEN tfq.marks ELSE 0 END as 'Obtained' from student_assessment sass inner join (SELECT distinct(userid) as userid FROM student_assessment where assessmentID = ?) bsass on bsass.userid = sass.userID inner join tf_questions tfq on tfq.tfqID = sass.questionID where sass.assessmentID = ? order by sass.questionID) derived right join (SELECT userid, cass.assessmentid, 0 as Obtained from user_class uclass inner join  class_assessment cass on  uclass.classId = cass.classID where cass.assessmentid = ? ) derived2 on derived2.userid = derived.userid  group by derived2.userid";
var sqlgetLongUserIds = "Select distinct concat(u.firstName, ' ',  u.lastName) as uName, coalesce(assr.obtainedMarks, 0) as 'Obtained',  CASE WHEN coalesce(assr.obtainedMarks, 0) != 0 THEN 'Added' ELSE 'Not Added' END as 'results', u.userID, sass.assessmentID  from users u  inner join  student_assessment  sass  on u.userID = sass.userID left join assessment_results assr on assr.assessmentID = sass.assessmentID and u.userID = assr.userID where sass.assessmentID = ? group by uName";
var sqlgetUserLongAssignment = "SELECT sass.userID as userID, loq.lqText as Text,loq.marks as Marks, sass.questionID as questionID, sass.assessmentID as assessmentID, sass.answer as answer FROM student_assessment sass inner join long_questions loq on loq.lqID = sass.questionID WHERE userID = ? AND assessmentID = ?";
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


/*
* --------------- For Autocheck and Point System Results
* --------------- Moomal
* */

router.get('/assessments', function (req, res) {
    connection.query(sqlSelectLongQAssessments, 2, function (err, resultL) {
        if(err) throw err;
        connection.query(sqlSelectMCQAssessments, 2, function (err, resultM) {
            if(err) throw err;
            connection.query(sqlSelectTFAssessments, 2, function (err, resultTF) {
                if(err) throw err;
                res.render('teacher/alltests', {resultL: resultL, resultM: resultM, resultTF: resultTF});
            });
        });
    });
});

router.get('/submitMCQ/:id', function (req, res) {
    assessmentid = req.params.id;
    connection.query(sqlgetmcqAssessmentResults, [assessmentid,assessmentid,assessmentid], function (err, result, fields) {
        if(err) throw err;
        for (var i=0;i<result.length;i++)
        {
            var userid = result[i].userid;
            var obtained = result[i].Obtained;
            console.log(userid, obtained);
            connection.query(sqlInsertResults, [assessmentid,userid, obtained], function (err, result) {
                if(err) throw err;
            });
        }

        res.redirect('../../teacher/assessments?sc=sc');
    });

});


router.get('/submitTF/:id', function (req, res) {
    assessmentid = req.params.id;
    connection.query(sqlgetTFAssessmentResults, [assessmentid,assessmentid,assessmentid], function (err, result, fields) {
        if(err) throw err;
        for (var i=0;i<result.length;i++)
        {
            var userid = result[i].userid;
            var obtained = result[i].Obtained;
            console.log(userid, obtained);
            connection.query(sqlInsertResults, [assessmentid,userid, obtained], function (err, result) {
                if(err) throw err;
            });
        }

        res.redirect('../../teacher/assessments?sc=tf');
    });

});

router.get('/allsubmissions/:id', function (req, res) {
    assessmentid = req.params.id;
    connection.query(sqlgetLongUserIds, assessmentid, function (err, result) {
        if(err) throw err;
        res.render('teacher/viewsubmissions', {result: result});
    });

});



router.get('/studentanswers/:id/:assid', function (req, res) {
    assessmentid = req.params.assid;
    userid = req.params.id;
    connection.query(sqlgetUserLongAssignment, [userid, assessmentid], function (err, result) {
        if(err) throw err;
        res.render('teacher/studentsubmission', {result: result});
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