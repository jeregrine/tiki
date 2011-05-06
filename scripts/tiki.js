$(document).ready(function(){
	if(window.location.hash){
		var length = window.location.hash.toString().length,
		    hash = window.location.hash.toString().slice(1, length);
		notes.tags(hash, notes.reload);
	}else{
		notes.getAll(notes.reload);
	}

	$("#new-note").submit(function(){
		notes.new({'note': $("#note-content").val(), 'tags': $("#note-tags").val()});
		var note ={note: $("#note-content").val()};
		note.tags = _.map($("#note-tags").val().split(","), function(itm){ return {tag: itm.trim()}});
		notes.add(note);
		$("#new").hide();
		$("#index").show();
		return false;
	});
	$("#new-note-link").click(function(){
		$("#index").hide();
		$("#new").show();
		return false;
	});
	$(".tag").live("click", function(){
		notes.tags($(this).html(), notes.reload);
		history.pushState("tag", "tag", "#"+$(this).html().trim());
		return false;
	});
	$("#index-link").click(function(){
		notes.getAll(notes.reload);
		parent.location.hash = "";
		return false;
	});
});

String.prototype.trim = function(){
	return this.replace("/^\s+|\s+$/g", "");
}

notes = function (){
	parse = function(data){
			return _.map(data, function(note) { 
				var json = JSON.parse(note);
				json.tags = _.map(json.tags, function(tag){
					return {tag: tag};
				});
				return json;
			});
		 }
	return {
		getAll: function(fn){
			$.getJSON("/notes", fn);
		},
		new: function(obj, fn){
			$.post("/new",obj, fn);
		},
		tags: function(tag, fn){
			$.getJSON("/tags/"+tag, fn);
		},
		reload: function(data){
			$("#notes").html("");
			$("#noteTemplate").tmpl(parse(data)).appendTo("#notes");
		},
		add: function(note){
			$("#noteTemplate").tmpl(note).appendTo("#notes");
		}

	}
}();
