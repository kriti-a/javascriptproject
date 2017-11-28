// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser'),
    path       = require('path');

// Application initialization
var app = express();
var logger = require('morgan');
var router = express.Router();
var http = require('http').Server(app);
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs -- momal
app.set('view engine', 'ejs');
//Set up data connection
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    database : 'ASSESS_EASY'
});


server.listen(process.env.PORT || 3000);
console.log("Server is running ... ");


//this is needed for when the app would be accessed via www instead of app. DO NOT REMOVE -- Momal
app.set('views', path.join(__dirname, 'views'));



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

// setting the routes (sub js pages)
var teachers = require('./routes/teachers.js');
var index = require('./routes/index.js');
var teacher_dashboard = require('./routes/teacher_dashboard.js');
var chats = require('./routes/chatroom');


// if there are any pages that start after localhost:8080/ then route them to index
// this includes the main page and/or about page, contact us page etc ...
app.use('/',index);
app.use('/chat', chats);
// if anything comes after localhost:8080/teachers then route to teachers.js
app.use('/teacher',teachers);
app.use('/teacher_dashboard',teacher_dashboard);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


// ---- Do not remove this commented code -- Momal
/*module.exports = app;*/
