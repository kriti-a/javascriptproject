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

var subjectQuery = "select name, classID from classes where createdBy=?";
var totalAssessmentQuery = "select count(assessmentID) as id, classID from class_assessment where classID in (select classID from classes where createdBy=?) group by classID";
var totalResultQuery = "select count(assessmentID) as total, classID from class_assessment where assessmentID in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=?) group by classID";
var pendingResultQuery = "select count(assessmentID) as pending, classID from class_assessment where assessmentID not in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=?) group by classID";
var passStats = "select count(arID) as passed,ar.assessmentID as aID, ca.classID as cID, assessment.name as aName, max(ar.obtainedMarks) as maximumScore, assessment.passingMarks as passMarks, assessment.totalMarks as TotalMarks\n" +
    "from assessment_results ar, assessment, class_assessment ca\n" +
    "where assessment.assessmentID = ar.assessmentID \n" +
    "and obtainedMarks > passingMarks \n" +
    "and ar.assessmentID = ca.assessmentID\n" +
    "and ca.classID in (select classID from classes where createdBy = ?)\n" +
    "group by ar.assessmentID";
var failStats = "select count(arID) as failed,ar.assessmentID as aID, ca.classID as cID, assessment.name as aName, min(ar.obtainedMarks) as minimumScore, assessment.passingMarks as passMarks, assessment.totalMarks as TotalMarks\n" +
    "from assessment_results ar, assessment, class_assessment ca\n" +
    "where assessment.assessmentID = ar.assessmentID \n" +
    "and obtainedMarks < passingMarks \n" +
    "and ar.assessmentID = ca.assessmentID\n" +
    "and ca.classID in (select classID from classes where createdBy =?)\n" +
    "group by ar.assessmentID";

var sqlgetAccessID = "select user_access.accessID as accID from users  inner join user_access  on user_access.userID = users.userID inner join access_level on access_level.accessID = user_access.accessID where users.userID= ? ";

var user_id;
var access_id;
//redirecting to the teacher_dashboard.ejs
router.get('/', function(req, res){
    user_id = req.session.passport.user.user_id;
    connection.query(sqlgetAccessID, user_id, function (err, result) {
       if(err) throw err;
       access_id = result[0].accID;

    });

    connection.query(subjectQuery,user_id,function (err,subject) {
        if(err) throw err;

        if(subject.length <= 0){


            var accessType = res.req.user.accessType;

            res.render('teacher_dashboard',{message:'empty',message2:'empty',accessType : accessType});

        } else {

        connection.query(totalAssessmentQuery,user_id,function (err,totalAssess) {
            if(err)throw err;

            connection.query(totalResultQuery,user_id,function (err,announcedRes) {
                if(err)throw err;

                connection.query(pendingResultQuery,user_id,function (err,pendingResult) {
                    if(err)throw err;

                        connection.query(passStats,user_id,function (err,pass) {
                            if(err)throw err;

                            connection.query(failStats,user_id,function (err,fail) {
                                if(err)throw err;

                                if(pass.length <= 0 || fail.length <=0 ){

                                    var accessType = res.req.user.accessType;

                                    res.render('teacher_dashboard',{subject:subject,totalAssess:totalAssess,announcedRes:announcedRes,pendingResult:pendingResult, pass:pass, fail:fail,message:'available',message2:'empty',accessType : access_id})

                                }else{

                                    var accessType = res.req.user.accessType;

                                res.render('teacher_dashboard',{subject:subject,totalAssess:totalAssess,announcedRes:announcedRes,pendingResult:pendingResult, pass:pass, fail:fail,message:'available',message2:'available',accessType : access_id})

                                }});
                        });
                     });
                });
            });
        } // else closing
    });
});


module.exports = router;