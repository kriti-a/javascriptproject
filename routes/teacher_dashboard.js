var express = require('express');
var router = express.Router();
var mysql = require('mysql'),
    bodyParser = require('body-parser');
var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});


//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

var subjectQuery = "select name, classID from classes where createdBy=1";
var totalAssessmentQuery = "select count(assessmentID) as id, classID from class_assessment where classID in (select classID from classes where createdBy=1) group by classID";
var totalResultQuery = "select count(assessmentID) as total, classID from class_assessment where assessmentID in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=1) group by classID";
var pendingResultQuery = "select count(assessmentID) as pending, classID from class_assessment where assessmentID not in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=1) group by classID";


//redirecting to the teacher_dashboard.ejs
router.get('/', function(req, res){

    connection.query(subjectQuery,function (err,subject) {
        if(err) throw err;
        console.log(subject);

        connection.query(totalAssessmentQuery,function (err,totalAssess) {
            if(err)throw err;
            console.log(totalAssess);

            connection.query(totalResultQuery,function (err,announcedRes) {
                if(err)throw err;
                console.log(announcedRes);

                connection.query(pendingResultQuery,function (err,pendingResult) {
                    if(err)throw err;
                    console.log(pendingResult);

                    res.render('teacher_dashboard',{subject:subject
                        ,totalAssess:totalAssess,announcedRes:announcedRes,pendingResult:pendingResult})

                });
            });
        });
    });
});


module.exports = router;