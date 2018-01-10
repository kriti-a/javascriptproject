var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', authenticationMiddleware(), function(req, res, next) {
    res.render('teacher/viewClasses');
});

function authenticationMiddleware() {
    return (req, res, next) => {

        if (req.isAuthenticated()) return next();
        res.redirect('/login')

    }
}

module.exports = router;