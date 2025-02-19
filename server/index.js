const cors = require("cors");
const async = require('async');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const autoIncrement = require('mongoose-auto-increment');

let app = express();
let router = express.Router();

app.use(cors());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/listingmind', { useNewUrlParser: true, useUnifiedTopology: true });

autoIncrement.initialize(mongoose);

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

let Schema = mongoose.Schema;

let CategorySchema = new Schema({
    id: Number,
    name: String
})

let TaskSchema = new Schema({
    id: Number,
    name: String,
    categoryId: Number,
    finished: Boolean
})

CategorySchema.plugin(autoIncrement.plugin, 'Category');
TaskSchema.plugin(autoIncrement.plugin, 'Task');

let Category = mongoose.model('Category', CategorySchema);
let Task = mongoose.model('Task', TaskSchema);

app.use('/', router);

router.get("/",function(req,res){
    let collections = {};
    async.parallel([
        function(callback) {
            Category.find({},function(err,categories){
                if (err) return callback(err);
                collections.categories = categories;
                callback();
            });
        },
        function(callback) {
            Task.find({},function(err,tasks){
                if (err) return callback(err);
                collections.tasks = tasks;
                callback();
            });
        }
    ], function(err) {
        if (err) return callback(err);
        res.send(collections)
    });
});

app.post("/category", function (req, res) {
    let name = req.body.name;
    let category = new Category({ name: name });
    category.save(function (err) {
        res.send();
    })
})

app.post("/task", function (req, res) {
    let name = req.body.name;
    let categoryId = req.body.categoryId;
    let task = new Task({ name: name, categoryId: categoryId, finished: false});
    task.save(function (err) {
        res.send();
    })
})

app.delete("/category/:id", function (req, res) {
    let id = req.params.id;
    let category = new Category({_id: id});

    category.remove(function (err) {
        if(err){
            return callback(err);
        }else{
            res.send();
        }
    })

    Task.find({ categoryId: id},function(err,tasks){
        if (err){
            return callback(err);
        }else{
            tasks.forEach(function (task) {
                let deletedTask = new Task(task)
                deletedTask.remove(function (err) {
                    res.send();
                })
            })
        }
    });
})

app.delete("/task/:id", function (req, res) {
    let id = req.params.id;
    let task = new Task({_id: id});
    task.remove(function (err) {
        res.send();
    })
})

app.put("/category/:id", function (req, res) {
    let id = req.params.id;
    let name = req.body.name;

    Category.findByIdAndUpdate(
        { _id: id },
        { name: name },
        function (err) {
            res.send();
        }
    );
})

app.put("/task/:id", function (req, res) {
    let id = req.params.id;
    let name = req.body.name;
    let categoryId = req.body.categoryId;

    Task.findByIdAndUpdate(
        { _id: id },
        { name: name, categoryId: categoryId },
        function (err) {
            res.send();
        }
    );
})

app.patch("/task/:id", function (req, res) {
    let id = req.params.id;
    let finished = req.body.finished;

    Task.findByIdAndUpdate(
        { _id: id },
        { finished: finished },
        function (err) {
            res.send();
        }
    );
})

app.listen(3000);