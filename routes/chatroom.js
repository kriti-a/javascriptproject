var express = require('express'),
    mysql      = require('mysql');
var router = express.Router();
var userid =1;
var sqlgetids = "SELECT count(*) as c FROM assess_easy.user_class where userid = ? and classID = ?"  ;
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'ASSESS_EASY'
});

/* GET home page. */
router.get('/:id', function(req, res, next) {

    connection.query(sqlgetids,[userid, req.params.id], function(err, rows, fields)
        {
            if (err) throw err;

            else {
                num = rows[0].c;
             //   console.log(num);
                if (num == 1)
                {
                    res.render('chatroom/chatroom', {id : req.params.id});
                }
                else
                {
                    res.redirect('../');
                }
            }
        });


});

module.exports = router;
