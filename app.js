// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var router = express.Router();

// Authentication Packages - Elias
var session = require('express-session');
var passport = require('passport');
var MySQLStore = require('express-mysql-session')(session);
var LocalStrategy = require('passport-local').Strategy;


var registration = require('./routes/registration');
var users = require('./routes/users');


//require('dotenv').config();
// Configuration
// Application initialization
var app = express();
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator());

var http = require('http').Server(app);
// set the view engine to ejs -- momal
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
/*----------------- No need to make any changes to this part unless any dependency is needed to be added -----------*/


// Initialize session and passport - Elias

var options = {
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
};
var sessionStore = new MySQLStore(options);

app.use(session({
    secret: 'lkjhgfdsapoiuy',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    //cookie: { secure: true }
    }));
app.use(passport.initialize());
app.use(passport.session());

// ------------------SQL Queries----------------------


app.use('/', registration);
app.use('/users', users);

//ok ok ok to be taken to registration.js



//----------- Please add all sql strings here 

/*app.get('/', function(req, res) {
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
*/



//----------------------------------------------------



// Main route sends our HTML file
/*app.get('/', function(req, res) {
    res.sendfile(__dirname + '/views/index.html');
});
*/


// ------------------Routing / Functions--------------



//-------------- Please add all functions here -------


//----------------------------------------------------
    //



// Begin listening
app.listen(3000);
console.log("server started")
