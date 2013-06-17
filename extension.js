var server = require("./index.js") ;

exports.onload = function(app)
{
	app.on("createServer",function(app,httpServer){
		server(httpServer) ;
		helper.log.info("start up NodeIM server side") ;
	}) ;

	// 建立索引
	helper.db.client.ensureIndex('messages',{readed:-1,to:-1},  {background: true}, function(){}) ;

	helper.db.client.ensureIndex('subscriptions',{from:1,to:1},  {background:true, unique:true}, function(){}) ;
	helper.db.client.ensureIndex('subscriptions',{to:1,from:1},  {background:true}, function(){}) ;

	helper.db.client.ensureIndex('rooms',{id:1},  {background:true,unique:true}, function(){}) ;
	helper.db.client.ensureIndex('rooms-users',{room:1,user:1},  {background:true,unique:true}, function(){}) ;
}