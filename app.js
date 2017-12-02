// Module dependencies
var express    = require('express'),
    mysql      = require('mysql'),
	bodyParser = require('body-parser'),
    path       = require('path');
var router = express.Router();

// Application initialization
var app = express();
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

//routing to student dashboard
var studentDashboard = require('./routes/student_dashboard.js');
app.use('/',studentDashboard);
/*--------------------------------------------------*/

// setting the routes (sub js pages)
var teachers = require('./routes/teachers.js');
var index = require('./routes/index.js');
var teacher_dashboard = require('./routes/teacher_dashboard.js');

// if there are any pages that start after localhost:8080/ then route them to index
// this includes the main page and/or about page, contact us page etc ...
app.use('/',index);

// if anything comes after localhost:8080/teachers then route to teachers.js
app.use('/teacher',teachers);

// way to teachers dashboard
app.use('/teacher_d',teacher_dashboard);

//-----------------------------------------------------------------------------------


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


// Begin listening
app.listen(3000);
console.log("server started")