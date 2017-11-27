// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
	bodyParser = require('body-parser'),
    path       = require('path');

// Configuration
// Application initialization

var router = express.Router();

// Application initialization
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var http = require('http').Server(app);

// set the view engine to ejs -- momal
app.set('view engine', 'ejs');
//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

/*----------------- No need to make any changes to this part unless any dependency is needed to be added -----------*/

// ------------------SQL Queries----------------------
//----------- Please add all sql strings here 

app.get('/', function(req, res) {
    connection.query('select * from classes inner join user_class on user_class.classId = classes.classID inner join users on users.userID = user_class.userId and users.userID = 1;', req.body,
        function (err, result) {

            connection.query('select classes.classID, class_assessment.caID, assessment.totalMarks, assessment.passingMarks from classes inner join class_assessment on class_assessment.classId = classes.classID inner join assessment on assessment.assessmentID = class_assessment.assessmentID;',
                function (err, classAssessment) {
                    if (err) throw err;
                    var classAssessmentJson =JSON.stringify(classAssessment);
                    var jsonData = classAssessmentJson.replace(/\"([^(\")"]+)\":/g,"$1:");
                    res.render('student_dashboard', {classesInfo: result, classassesmentInfo: jsonData});
                });

        });
});





//----------------------------------------------------




// ------------------Routing / Functions--------------
//-------------- Please add all functions here -------


// Main route sends our HTML file


//Kriti's stupid code which is of no use whatsoever

/*app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});*/



//----------------------------------------------------

// setting the routes (sub js pages)
var teachers = require('./routes/teachers.js');
var index = require('./routes/index.js');

// if there are any pages that start after localhost:8080/ then route them to index
// this includes the main page and/or about page, contact us page etc ...
app.use('/',index);

// if anything comes after localhost:8080/teachers then route to teachers.js
app.use('/teacher',teachers);


// Begin listening
app.listen(3000);
console.log("server started")
