var server = require("./index.js") ;

exports.onload = function(application)
{
	console.log("start up nodeim-server") ;
	application.once("createServer",function(err){
		if(err)
		{
			return ;
		}
		server(application.server) ;
	}) ;
}