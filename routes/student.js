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


// --------- total results 
var sqlgetresults = "Select a.name as 'Name',a.totalMarks as Total,a.passingMarks as Passing,ar.obtainedMarks as Obtained, CASE when a.passingMarks > ar.obtainedMarks then 'Failed'\n" +
    "else 'Passed'\n" +
    "END as Results\n" +
    "from \n" +
    "assessment_results ar \n" +
    "inner join \n" +
    "assessment a on ar.assessmentID = a.assessmentID\n" +
    "where ar.userID = ?\n";

// ------------ all assessments
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

//-------- test questions, insert answers, if already submitted, getting assessment type
var sqlgettestquestions = "SELECT a.name as 'Name', a.assessmentType as 'Type' , lq.lqid 'QuestionID' ,  lqText as 'Text',  marks as 'Marks' from  long_questions lq  inner join  lassessment_question laq  on  lq.lqID = laq.questionID   inner join assessment a  on  a.assessmentID = laq.assessmentID  where  laq.assessmentID = ?" ;
var sqlintsertanswers = "INSERT INTO student_assessment (userID,assessmentID,questionID,answer)VALUES(?,?,?,?);";
var selectifalreadysubmitted = "SELECT COUNT(*) as C FROM student_assessment where userID = ? and assessmentID = ?";
var sqlgetassessmenttype = "SELECT assessmentType as asstype from assessment where assessmentID = ? ";

// ------------------ get all mcq type questions
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

// --------- assessment deadline
var sqlgetassessmentdeadline = "SELECT deadline FROM assess_easy.assessment where assessmentID = ?";

// ----------- get true false questions
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

// ------------- getting all classes 
var sqlgetallclasses = "select class.name as name, uclass.classid as classid, (select concat(firstname,' ', lastname) from users where userid = class.createdBy) as createdby from user_class uclass inner join classes class on class.classID = uclass.classId where userid = ?";

// ---------------- leaving a group
var sqlremovestudentClass = "Delete from user_class where userid = ? and classId = ?";



// ---------------- results
router.get('/results',authenticationMiddleware(), function (req, res) {
    var accessID = res.req.user.accessID;
    var userid = req.session.passport.user.user_id;
   // console.log()
    connection.query(sqlgetresults, userid, function (err, result) {
        if(err) throw err;
        if (result.length == 0)
        {
            res.render('student/results', {result: 0, accessID : accessID})
        }
        else {
            res.render('student/results', {result: result, accessID : accessID})
        }

    });
});

// -------- all assessments
router.get('/assessments',authenticationMiddleware(), function (req, res) {
    var accessID = res.req.user.accessID;
    var userid = req.session.passport.user.user_id;
    connection.query(sqlgetalltests, userid, function (err, result) {
        if(err) throw err;
        var a = req.query.lg;
        //if the parameter shouts success
        if (a=='sc')
        {
            res.render('student/alltests', {result: result, message:'success', accessID : accessID})
        }
        //if the parameter says failure
        else if (a=='fl')
        {
            res.render('student/alltests', {result: result, message : 'error', accessID : accessID})
        }
        //if there is no parameter
        else if (a==null)
        {
            if (result.length == 0)
            {
                res.render('student/alltests', {result: 0, accessID : accessID})
            }
            else {
                res.render('student/alltests', {result: result, accessID : accessID})
            }

        }

    });

});


// -------------- routing to the test page respectively to each type 
router.get('/givetest/:id',authenticationMiddleware(), function (req, res) {
    var accessID = res.req.user.accessID;
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
                        if (result[0].asstype == 'LQ') { 
                            // ----------- Long Questions
                            connection.query(sqlgettestquestions, [req.params.id], function (err, result) {
                                if (err) throw err;
                                var assname = result[0].Name;
                                result = shuffle(result);
                                res.render('student/longtest', {result: result, assname: assname, accessID : accessID})
                            });
                        }
                        else if (result[0].asstype == 'MCQ') {
                            // ------------------ MCQ Type
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
                                res.render('student/mcqtest', {result: newresult, assname: assname, accessID : accessID})
                            });

                        }
                        else if (result[0].asstype == 'TF') {
                            // ----------- True False
                            connection.query(sqlgettfquestions, [req.params.id], function (err, result) {
                                if (err) throw err;
                                // ------ assname = assessment name
                                var assname = result[0].Name;
                                //   result = shuffle(result);
                                res.render('student/tftest', {result: result, assname: assname, accessID : accessID})
                            });
                        }
                    });
                }
                else {
                    res.render('student/deadlinepassed', {accessID : accessID});
                }

            });
        }
        else {
            res.render('student/alreadysubmitted', {accessID : accessID})
        }
    });

});

// ----------- going to all classes
router.get('/classes',authenticationMiddleware(), function (req, res) {
    var accessID = res.req.user.accessID;
    var userid = req.session.passport.user.user_id;
    connection.query(sqlgetallclasses, userid, function (err, result) {
        if(err) throw err;
        if (result.length == 0)
        {
            res.render('student/allclasses', {result: 0, accessID : accessID})
        }
        else {
            res.render('student/allclasses', {result: result, accessID : accessID})
        }

    });
});

//redirecting to the add new record page.
router.post('/addanswer', function(req, res) {
    var accessID = res.req.user.accessID;
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

// ---------- submitting results for tf questions
router.post('/addtf', function(req, res) {
    var accessID = res.req.user.accessID;
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

// ------------ submitting results for mcq questions
router.post('/addmcq', function(req, res) {
    var accessID = res.req.user.accessID;
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

// ------------------ leave a class
router.get('/removeuser/:id',authenticationMiddleware(), function(req, res) {
    var accessID = res.req.user.accessID;
    var userid = req.session.passport.user.user_id;
    var classid  = req.params.id;

    connection.query(sqlremovestudentClass, [userid,classid], function (err, result) {
        if(err) throw err;
        res.redirect('../classes');
    });



});


// --------- shuffle the mcq options
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


function authenticationMiddleware() {
    return (req, res, next) => {

        if (req.isAuthenticated()) return next();
        res.redirect('/login')

    }
}
module.exports = router;
