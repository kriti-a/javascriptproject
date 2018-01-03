var express    = require('express'),
    mysql      = require('mysql'),
    bodyParser = require('body-parser'),
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

router.get('/manage_class', function(req, res) {
connection.query('select * from classes ;',
        function (err, result) {
            connection.query('select  * from user_class where userID = 1;',
            function (err, studentClasses) {
                var temp=[];
                for (var i=0; i<result.length; i++)
                {
                    for(var j=0; j<studentClasses.length; j++)
                    {
                        if(result[i].classID == studentClasses[j].classId) {
                            temp.push(studentClasses[j].classId);
                        }
                    }
                }
                var studentdata = JSON.stringify(temp);
                if (err) throw err;
                res.render('manage_class', {classes: result, studentsInfo:studentdata});
            });
        });
});

router.post('/joinClass', function(req, res) {
    const id = req.body.classId;
    var query =  "Insert into user_class (userID, classID) values(1,'"+id+"')";
    connection.query(query,
        function (err, result) {
            if (err) throw err;
            res.redirect('/manage_class');
        });
});

module.exports = router;

