var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:id', authenticationMiddleware(), function(req, res, next) {
    res.render('teacher/viewTests', {id : req.params.id});
});

function authenticationMiddleware() {
    return (req, res, next) => {

        if (req.isAuthenticated()) return next();
        res.redirect('/login')

    }
}

module.exports = router;