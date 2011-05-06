var express = require('express'),
    app = express.createServer(),
    sys = require('sys'),
    redis = require('redis'),
    client = redis.createClient(),
    _ = require('underscore'),
    logger = require("./utility/cloudlog").createLogger("4dc1b7d03390e4.91573253");//Remove this line and all logger lines. This is for fun.

app.configure('development', function(){
    app.use(express.static(__dirname + '/'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.use(express.bodyParser());

app.get("/", function(req, res){
	res.sendfile('index.html');
	logger.log("New Visitor!!", "info");
});

app.get("/notes:id?", function(req, res){
	logger.log("Getting Logs", "info");
	res.contentType('json');
	client.smembers("all-notes", function(err, data){
		loadNotes(data, function(err, noteData){
			res.send(noteData);	
		});
	});
});

app.post("/new", function(req, res){
	logger.log("New Note:"+req.body.note, "info");
	var tags = req.body.tags.split(","),
	    newNote =  {note: req.body.note, tags: tags};
	client.incr("node-counter", function(err, newId){
		client.set("note-"+newId, JSON.stringify(newNote));
		client.sadd("all-notes", newId, function(){
			client.smembers("all-notes", redis.print);
		});
		tags.forEach(function(data) { client.sadd("tag-"+data.trim(), newId)});
	});
	res.send(newNote);
});

app.get("/tags/:id", function(req, res){
	var currentTags = req.params.id;
	if(currentTags == ""){
		res.send({msg: "error"});
	}
	client.smembers("tag-"+currentTags, function(err, data){
		loadNotes(data, function(err, noteData){
			res.send(noteData);
		});
	});

});
app.listen(3000);

function loadNotes(ids, fn) {
	if(ids ==  null || ids.length < 1){
		fn([]);
	}else {
		var stringids = ids.map(function(id){
			return "note-"+id;
		});
		client.mget(stringids, fn);
	}
}

String.prototype.trim = function(){
	return this.replace("/^\s+|\s+$/g", "");
}
