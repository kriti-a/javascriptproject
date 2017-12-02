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

// set the view engine to ejs
app.set('view engine', 'ejs');


//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

var subjectQuery = "select name from classes where createdBy=1";
var totalAssessmentQuery = "select count(assessmentID) as totalTests from class_assessment where classID = (select classID from classes where name = 'BPMN');";

//redirecting to the teacher_dashboard.ejs
router.get('/', function(req, res){
    connection.query(subjectQuery,function (err,result,fields) {
        if(err) throw err;
        console.log(result);
        connection.query(totalAssessmentQuery,function (err,total,fields) {
            if(err)throw err;
            console.log(total);
            res.render('teacher_dashboard',{result:result,total:total})
        });
    });
});



module.exports = router;