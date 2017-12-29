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
    database : 'ASSESS_EASY'
});


//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

var subjectQuery = "select name, classID from classes where createdBy=1";
var totalAssessmentQuery = "select count(assessmentID) as id, classID from class_assessment where classID in (select classID from classes where createdBy=1) group by classID";
var totalResultQuery = "select count(assessmentID) as total, classID from class_assessment where assessmentID in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=1) group by classID";
var pendingResultQuery = "select count(assessmentID) as pending, classID from class_assessment where assessmentID not in (select assessmentID from assessment_results) and  classID in (select classID from classes where createdBy=1) group by classID";
var passStats = "select count(arID) as passed, csas.classID from assessment_results asrs, class_assessment csas where asrs.assessmentID = csas.assessmentID and asrs.obtainedMarks >= 50 and csas.classID in(select classID from classes where createdBy = 1) group by csas.classID";
var failStats = "select count(arID) as failed, csas.classID from assessment_results asrs, class_assessment csas where asrs.assessmentID = csas.assessmentID and asrs.obtainedMarks < 50 and csas.classID in(select classID from classes where createdBy = 1) group by csas.classID";

//redirecting to the teacher_dashboard.ejs
router.get('/', function(req, res){

    connection.query(subjectQuery,function (err,subject) {
        if(err) throw err;
        console.log(subject);

        if(subject.length <= 0){

            console.log("nothing was fetched");
            res.render('teacher_dashboard',{message:'empty'});
        } else {

        connection.query(totalAssessmentQuery,function (err,totalAssess) {
            if(err)throw err;
            console.log(totalAssess);

            connection.query(totalResultQuery,function (err,announcedRes) {
                if(err)throw err;
                console.log(announcedRes);

                connection.query(pendingResultQuery,function (err,pendingResult) {
                    if(err)throw err;
                    console.log(pendingResult);


                        connection.query(passStats,function (err,pass) {
                            if(err)throw err;
                            console.log(pass);

                            connection.query(failStats,function (err,fail) {
                                if(err)throw err;
                                console.log(fail);


                        res.render('teacher_dashboard',{subject:subject
                            ,totalAssess:totalAssess,announcedRes:announcedRes,pendingResult:pendingResult, pass:pass, fail:fail,message:'available'})

                            });
                        });
                     });
                });
            });
        } // else closing
    });
});


module.exports = router;