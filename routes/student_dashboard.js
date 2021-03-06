var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser')
    moment = require('moment');

var router = express.Router();
//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});
// ------------------SQL Queries----------------------

router.get('/student_dashboard', authenticationMiddleware(), function(req, res) {
    connection.query('select * from classes inner join user_class on user_class.classId = classes.classID inner join users on users.userID = user_class.userId and users.userID ='+res.req.user.user_id,
        function (err, result) {
            connection.query('select classes.classID, assessment.assessmentID, assessment.passingMarks, assessment_results.obtainedMarks, users.userID from classes inner join class_assessment on class_assessment.classId = classes.classID inner join assessment on assessment.assessmentID = class_assessment.assessmentID inner join assessment_results on assessment.assessmentID = assessment_results.assessmentID inner join users on users.userID = assessment_results.userID;',
                function (err, classAssessment) {
                    connection.query('select * from notification;',
                        function (err, notification) {
                            if (err) throw err;
                            var classAssessmentJson = JSON.stringify(classAssessment);
                            var jsonData = classAssessmentJson.replace(/\"([^(\")"]+)\":/g, "$1:");
                            var accessID = res.req.user.accessID;
                            res.render('student_dashboard', {classesInfo: result, classassesmentInfo: jsonData, notificationInfo: notification, moment: moment,accessID : accessID});
                        });
                });

        });
});

function authenticationMiddleware() {
    return (req, res, next) => {

        if (req.isAuthenticated()) return next();
        res.redirect('/login')

    }
}


module.exports = router;