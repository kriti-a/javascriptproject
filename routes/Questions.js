var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/:id', function(req, res, next) {
    if(req.params.id.split("-")[1] == "LQ")
    {
        res.render('teacher/viewLongQuestions', {id : req.params.id.split("-")[0]});
    }
    else if(req.params.id.split("-")[1] == "MCQ")
    {
        res.render('teacher/viewMCQQuestions', {id : req.params.id.split("-")[0]});
    }
    else if(req.params.id.split("-")[1] == "TF")
    {
        res.render('teacher/viewTrueFalseQuestions', {id : req.params.id.split("-")[0]});
    }
});

module.exports = router;