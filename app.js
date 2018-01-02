var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser'),
    path       = require('path');

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
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(expressValidator());

var http = require('http').Server(app);

// set the view engine to ejs -- momal
app.set('view engine', 'ejs');

//routing the static files. css/js
app.use(express.static(__dirname + '/public'));

server.listen(process.env.PORT || 3000);
console.log("Server is running ... ");

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

/*----------------- No need to make any changes to this part unless any dependency is needed to be added -----------*/
app.set('views', path.join(__dirname, 'views'));


//routing to student dashboard added
var studentDashboard = require('./routes/student_dashboard.js');
app.use('/',studentDashboard);
var manageClass = require('./routes/manage_class.js');
app.use('/',manageClass);
// setting the routes (sub js pages)
var teachers = require('./routes/teachers.js');
var index = require('./routes/index.js');
var teacher_dashboard = require('./routes/teacher_dashboard.js');
var chats = require('./routes/chatroom');


// if there are any pages that start after localhost:8080/ then route them to index
// this includes the main page and/or about page, contact us page etc ...
app.use('/',index);

// if anything comes after localhost:8080/teachers then route to teachers.js
app.use('/teacher',teachers);

// way to teachers dashboard
app.use('/teacher_d',teacher_dashboard);

// -----For the Chat
app.use('/chat', chats);



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

// ---- Do not remove this commented code -- Momal
//module.exports = app;
