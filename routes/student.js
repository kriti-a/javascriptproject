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

var userid = 1;
var sqlgetresults = "Select a.name as 'Name',a.totalMarks as Total,a.passingMarks as Passing,ar.obtainedMarks as Obtained, CASE when a.passingMarks > ar.obtainedMarks then 'Failed'\n" +
    "else 'Passed'\n" +
    "END as Results\n" +
    "from \n" +
    "assessment_results ar \n" +
    "inner join \n" +
    "assessment a on ar.assessmentID = a.assessmentID\n" +
    "where ar.userID = ?\n";


var sqlgetalltests = "SELECT a.assessmentID as id, a.name as 'Name',\n" +
    "a.totalMarks as 'Total',\n" +
    "a.passingMarks as 'Passing',\n" +
    "DATE_FORMAT(a.deadline, '%d-%b-%Y') 'Deadline' FROM assessment a\n" +
    "where a.assessmentId in \n" +
    "(select assessmentid from class_assessment where classID in (select classID from user_class where userid = ?));";

var sqlgettestquestions = "SELECT a.name as 'Name', a.assessmentType as 'Type' , lq.lqid 'QuestionID' ,  lqText as 'Text',  marks as 'Marks' from  long_questions lq  inner join  lassessment_question laq  on  lq.lqID = laq.questionID   inner join assessment a  on  a.assessmentID = laq.assessmentID  where  laq.assessmentID = ?" ;


router.get('/results', function (req, res) {
    connection.query(sqlgetresults, userid, function (err, result) {
        if(err) throw err;
        res.render('student/results', {result: result})
    });
});

router.get('/assessments', function (req, res) {
    connection.query(sqlgetalltests, userid, function (err, result) {
        if(err) throw err;
        res.render('student/alltests', {result: result})
    });

});

router.get('/givetest/:id', function (req, res) {

    connection.query(sqlgettestquestions, [req.params.id], function (err, result) {
        if(err) throw err;
        var assname = 'assignment';//result[0].Name;
        res.render('student/submittest', {result: result, assname:assname})
    });
});

//redirecting to the add new record page.
router.post('/', function(req, res){
    res.redirect('student/alltests')
   /* var firstName = req.body.firstName;
    var lastName = req.body.lastName;
         connection.query(sqlinsertuser,[firstName, lastName],function(err, result, fields)
        {
            if(err) throw err;
            res.redirect('addnew?lg=sc');

        });*/
    });





module.exports = router;