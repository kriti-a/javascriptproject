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

//var userid = 4;
var assessmentid="";
var sqlgetresults = "Select a.name as 'Name',a.totalMarks as Total,a.passingMarks as Passing,ar.obtainedMarks as Obtained, CASE when a.passingMarks > ar.obtainedMarks then 'Failed'\n" +
    "else 'Passed'\n" +
    "END as Results\n" +
    "from \n" +
    "assessment_results ar \n" +
    "inner join \n" +
    "assessment a on ar.assessmentID = a.assessmentID\n" +
    "where ar.userID = ?\n";


var sqlgetalltests = "SELECT a.assessmentID as id, a.name as 'Name', \n" +
    "    a.totalMarks as 'Total', \n" +
    "    a.passingMarks as 'Passing', \n" +
    "    DATE_FORMAT(a.deadline, '%d-%b-%Y') 'Deadline',\n" +
    "    CASE\n" +
    "    WHEN deadline < NOW() then 'Finished'\n" +
    "    ELSE  'Open'\n" +
    "    END as 'Due'\n" +
    "    FROM assessment a\n" +
    "    where a.assessmentId in  \n" +
    "    (select assessmentid from class_assessment where classID in (select classID from user_class where userid = ?));";

var sqlgettestquestions = "SELECT a.name as 'Name', a.assessmentType as 'Type' , lq.lqid 'QuestionID' ,  lqText as 'Text',  marks as 'Marks' from  long_questions lq  inner join  lassessment_question laq  on  lq.lqID = laq.questionID   inner join assessment a  on  a.assessmentID = laq.assessmentID  where  laq.assessmentID = ?" ;
var sqlintsertanswers = "INSERT INTO student_assessment (userID,assessmentID,questionID,answer)VALUES(?,?,?,?);";
var selectifalreadysubmitted = "SELECT COUNT(*) as C FROM student_assessment where userID = ? and assessmentID = ?";
var sqlgetassessmenttype = "SELECT assessmentType as asstype from assessment where assessmentID = ? ";
var sqlgetmcqtestquestions = "SELECT a.name as 'Name',\n" +
    " a.assessmentType as 'Type' ,\n" +
    " mcq.mcqID 'QuestionID' ,\n" +
    "  mcqText as 'Text',\n" +
    "\tcorrectOption as 'Correct',\n" +
    "  optionB as 'OptionB',\n" +
    "  optionC as 'OptionC',\n" +
    "  optionD as 'OptionD',\n" +
    "  deadline as deadline,\n" +
    "  marks as 'Marks' \n" +
    "  from  mc_questions mcq  inner join \n" +
    "  mcassessment_question maq  on \n" +
    "  mcq.mcqID = maq.questionID   \n" +
    "  inner join assessment a  on \n" +
    "  a.assessmentID = maq.assessmentID  where  maq.assessmentID = ?";
var sqlgetassessmentdeadline = "SELECT deadline FROM assess_easy.assessment where assessmentID = ?";
var sqlgettfquestions = "SELECT a.name as 'Name',\n" +
    "a.assessmentType as 'Type' ,\n" +
    "tfq.tfqID 'QuestionID' ,\n" +
    "tfText as 'Text', \n" +
    "correctOption as 'Correct',\n" +
    "deadline as deadline,\n" +
    "marks as 'Marks'\n" +
    "from  tf_questions tfq\n" +
    "inner join tfassessment_question tfaq on tfq.tfqID = tfaq.questionID\n" +
    "inner join assessment a  on\n" +
    "a.assessmentID = tfaq.assessmentID  where  tfaq.assessmentID = ?";

var sqlgetallclasses = "select class.name as name, uclass.classid as classid, (select concat(firstname,' ', lastname) from users where userid = class.createdBy) as createdby from user_class uclass inner join classes class on class.classID = uclass.classId where userid = ?";

router.get('/results', function (req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
    connection.query(sqlgetresults, userid, function (err, result) {
        if(err) throw err;
        res.render('student/results', {result: result, accessType : accessType})
    });
});


router.get('/assessments', function (req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
    connection.query(sqlgetalltests, userid, function (err, result) {
        if(err) throw err;
        var a = req.query.lg;
        //if the parameter shouts success
        if (a=='sc')
        {
            res.render('student/alltests', {result: result, message:'success', accessType : accessType})
        }
        //if the parameter says failure
        else if (a=='fl')
        {
            res.render('student/alltests', {result: result, message : 'error', accessType : accessType})
        }
        //if there is no parameter
        else if (a==null)
        {
            res.render('student/alltests', {result: result, accessType : accessType})
        }

    });

});


router.get('/givetest/:id', function (req, res) {
    var accessType = res.req.user.accessType;
    assessmentid = req.params.id;
    var userid = req.session.passport.user.user_id;
    connection.query(selectifalreadysubmitted, [userid, assessmentid], function (err, result) {
        if(err) throw err;
       if ( parseInt(result[0].C) == 0) {
          connection.query(sqlgetassessmentdeadline, assessmentid, function (err, result) {
              if (err) throw err;
              var d1 = new Date();
              var d2 = result[0].deadline;
              if (d1 < d2) {
                  connection.query(sqlgetassessmenttype, [req.params.id], function (err, result) {
                      if (err) throw err;
                      if (parseInt(result[0].asstype) == 1) {
                          connection.query(sqlgettestquestions, [req.params.id], function (err, result) {
                              if (err) throw err;
                              var assname = result[0].Name;
                              result = shuffle(result);
                              res.render('student/longtest', {result: result, assname: assname, accessType : accessType})
                          });
                      }
                      else if (parseInt(result[0].asstype) == 2) {
                          connection.query(sqlgetmcqtestquestions, [req.params.id], function (err, result) {
                              if (err) throw err;

                              var assname = result[0].Name;
                              var list = [];
                              var arr = [];
                              var newresult = [];

                              for (var i = 0; i < 4; i++) {
                                  list.push(i);
                              }

                              for (var i = 0; i < result.length; i++) {
                                  list = shuffle(list);
                                  arr[list[0]] = result[i].Correct;
                                  arr[list[1]] = result[i].OptionB;
                                  arr[list[2]] = result[i].OptionC;
                                  arr[list[3]] = result[i].OptionD;
                                  newresult.push({
                                      assname: assname,
                                      Text: result[i].Text,
                                      optionA: arr[0]
                                      ,
                                      optionB: arr[1],
                                      optionC: arr[2],
                                      optionD: arr[3],
                                      QuestionID: result[i].QuestionID,
                                      Marks: result[i].Marks
                                  });
                              }
                              //    console.log(newresult);
                             // newresult = shuffle(newresult);
                              res.render('student/mcqtest', {result: newresult, assname: assname, accessType : accessType})
                          });

                      }
                      else if (parseInt(result[0].asstype) == 3) {
                          connection.query(sqlgettfquestions, [req.params.id], function (err, result) {
                              if (err) throw err;
                              var assname = result[0].Name;
                           //   result = shuffle(result);
                              res.render('student/tftest', {result: result, assname: assname, accessType : accessType})
                          });
                      }
                  });
              }
              else {
                  res.render('student/deadlinepassed', {accessType : accessType});
              }

          });
        }
        else {
            res.render('student/alreadysubmitted', {accessType : accessType})
        }
    });

});


router.get('/classes', function (req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
    connection.query(sqlgetallclasses, userid, function (err, result) {
        if(err) throw err;
        res.render('student/allclasses', {result: result, accessType : accessType})
    });
});

//redirecting to the add new record page.
router.post('/addanswer', function(req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
  for (var i = 0;i<req.body.answer.length;i++)
    {
        var answer = req.body.answer[i];
        var questionid = req.body.questionid[i];
        connection.query(sqlintsertanswers, [userid,assessmentid, questionid, answer], function (err, result) {
            if(err) throw err;
        });

    }
    res.redirect('../student/assessments?lg=sc');

});

router.post('/addtf', function(req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
    for (var i = 0;i<req.body.questionid.length;i++)
    {
        var answer = req.body.option[i];
        var questionid = req.body.questionid[i];
        connection.query(sqlintsertanswers, [userid,assessmentid, questionid, answer], function (err, result) {
            if(err) throw err;
        });

    }
    res.redirect('../student/assessments?lg=sc');

});

router.post('/addmcq', function(req, res) {
    var accessType = res.req.user.accessType;
    var userid = req.session.passport.user.user_id;
    console.log(req.body);
    for (var i = 0;i<req.body.questionid.length;i++)
    {
        var answer = req.body.option[i];
        var questionid = req.body.questionid[i];
        connection.query(sqlintsertanswers, [userid,assessmentid, questionid, answer], function (err, result) {
            if(err) throw err;
        });
    }
    res.redirect('../student/assessments?lg=sc');

});

function shuffle(array) {
    var counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        var index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

module.exports = router;