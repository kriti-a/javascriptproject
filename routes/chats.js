


module.exports = function (io) {

   // req.body.firstName

    var mysql      = require('mysql');
    var userid = 1;
    var sqlgetemail = "select email from users where userid ='" + userid + "'";
    var insertintodb = "INSERT INTO status (s_text, classid,userid ) VALUES (?,?,?)";
    var name = "";

//Set up data connection
    var connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        database : 'ASSESS_EASY'
    });


    connection.query(sqlgetemail, function(err, rows, fields)
    {
        if (err) throw err;
        else
        {
            name = rows[0].email;
        }
    });



    var users = [];
    var connections = [];
    var i = 0;
    var room = "";
    var cookieParser = require('cookie-parser');
    var session = require('express-session');
    io.on('connection', function (socket) {
        connections.push(socket);
        socket.username = name + i;
        i++;

        socket.on('send groupid', function (data) {
            room = data;
            //console.log(room);
        });
        room ='room'+room;
        socket.room = room;
        console.log('this is ' + room);
        socket.join(room);
       // console.log('This is docket: '+socket.room);
        users.push(socket.username);
        updateUsernames();

        //console.log('Connected: %s sockets connected', connections.length);
        socket.broadcast.to(socket.room).emit('updatechat',{ msg: socket.username + ' has joined the chat'});



        //Disconnect
        socket.on('disconnect', function (data) {
            users.splice(users.indexOf(socket.username), 1);
            updateUsernames();
            connections.splice(connections.indexOf(socket, 1));
            socket.broadcast.to(socket.room).emit('updatechat',{ msg: socket.username + ' has left the chat'});
            socket.leave(socket.room);
        });

        //Send Message
        socket.on('send message', function (data) {
            add_message(data[0], data[1]);
            console.log('ugh : ' + data[0] + ' -' + socket.room.toString());
            //io.sockets.in(socket.room).emit('updatechat', socket.username, data);
            io.sockets.in(socket.room).emit('new message', {msg: data[0], user: socket.username});

        });


        /*//New User
        socket.on('new user', function (data, callback) {
            callback(true);
            socket.username = name;
            users.push(socket.username);
            updateUsernames();
        });*/

        function updateUsernames() {
            io.sockets.emit('get users', users);
        }

        function add_message(message, groupid)
        {
            connection.query(insertintodb,[message, groupid, userid],function(err,rows){
                if(err) {
                    throw err;
                }
            });
        }
    });
};

