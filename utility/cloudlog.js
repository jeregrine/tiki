var http = require("http"),
    url = require("url");

exports.createLogger = function(appId){
	return {
		log: function(msg, logtype){
			console.log(msg+" : "+logtype);
			var data = {cmd: "insertlog", data: { app_id: appId }};
			data.data.log_text=msg;
			data.data.log_type=logtype;
			data.data.log_time= new Date().toString();
			var options = {
				host: "cloud-log.dyndns.org",
				port: 80,
				path: '/cloudlog.php?data='+escape(JSON.stringify(data))
			};
			console.log(JSON.stringify(data));
			http.get(options, function(res){
				//console.log(res);
			}).on("error", function(e){ console.log(e)});
		}
	}
}
