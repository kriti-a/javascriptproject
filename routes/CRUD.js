router.post('/updateclassaction', function (req, res) {
    classToUpdate = req.body.id;
    var name = req.body.className;
    console.log(req.body.id);
    console.log("Class New Name: "+name);
    if(name.toString() !== ''){
        connection.query(sqlUpdateClass, [name, classToUpdate], function (err, result, fields) {
            if(err) throw err;
            res.redirect('editClass?lg=sc');
        });
    }
    else{
        res.redirect('editClass?lg=f1');
    }
});
