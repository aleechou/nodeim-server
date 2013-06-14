module.exports = function(app){

	var io = require('socket.io').listen(app)
	, fs = require('fs')
	, Steps = require('ocsteps')
	, mongodb = require('mongodb')
	, DBHelper = require('./DBHelper')
	, Rooms = require("./Rooms.js") ;

	var commands = [
		'signup' ,
		'signin' ,
		'retrieve' ,
	] ;
	var usercommands = [
		'signout' ,
		'message' ,
		'find' ,
		'presence' ,
		'subscribe' ,
		'unsubscribe' ,
		'reply' ,
		'friends' ,
		'group' ,
		'room.create' ,
		'room.join' ,
		'room.leave' ,
		'room.list' ,
		'room.message' ,
		'log' ,
		'profile' ,
	] ;

	var server = module.exports.server = {
		db: null 
		, onlines: {}
		, rooms: null
		, message: undefined 
	} ;


	Steps(
		// 连接数据库
		function(){
			var server = new mongodb.Server('127.0.0.1',27017) ;
			(new mongodb.Db("im",server,{w:1})).open(this.hold()) ;
		}
		, function(err,client){
			if( err || !client )
			{
				throw new Error("无法链接到数据库："+err) ;
			}
			console.log("已经连接到数据库") ;
			server.db = new DBHelper(client) ;

			// 建立索引
			client.ensureIndex('users',{username:-1},  {background: true,unique:true}, function(){}) ;
			client.ensureIndex('users',{id:-1},  {background: true,unique:true}, function(){}) ;

			client.ensureIndex('messages',{readed:-1,to:-1},  {background: true}, function(){}) ;

			client.ensureIndex('subscriptions',{from:1,to:1},  {background:true, unique:true}, function(){}) ;
			client.ensureIndex('subscriptions',{to:1,from:1},  {background:true}, function(){}) ;

			client.ensureIndex('rooms',{id:1},  {background:true,unique:true}, function(){}) ;
			client.ensureIndex('rooms-users',{room:1,user:1},  {background:true,unique:true}, function(){}) ;
		}

		// 加载聊天室
		, function(){

			server.rooms = new Rooms(server) ;
			server.rooms.init(this.hold()) ;

			this.step(function(err){
				if(err)
				{
					console.log(err) ;
				}
			}) ;
		}


		// 启动 im 服务器
		, function(){

			io.sockets.on('connection', function (socket) {

				socket.session = {} ;

				socket.on('disconnect', function () {
					if( socket.session.user )
					{
						server.presence(socket.session.user.id,'离线') ;
						delete server.onlines[socket.session.user.id] ;
					}
					console.log('disconnect',arguments) ;
				});

				for(var i=0;i<commands.length;i++)
				{
					(function(name){
						var func = require(__dirname+"/commands/"+name+".js") ;
						socket.on(name, function (pkg) {
							func(pkg.data||{},server,socket,function(rspndata){
								socket.emit('rspn',{
									id: pkg.id
									, cmd: name
									, data: rspndata
								}) ;
							}) ;
						}) ;
					}) (commands[i]) ;
				}

				for(var i=0;i<usercommands.length;i++)
				{
					(function(name){
						var func = require(__dirname+"/commands/"+name+".js") ;
						socket.on(name, function (pkg) {

							var rspn = function(rspndata){
								socket.emit('rspn',{
									id: pkg.id
									, cmd: name
									, data: rspndata
								}) ;
							}

							if( !socket.session.user )
							{
								rspn({code:403,message:"尚未登陆"}) ;
								return ;
							}

							func(pkg.data||{},server,socket,rspn) ;
						}) ;
					}) (usercommands[i]) ;
				}

			});
		}

		// done
		, function(){
			console.log("服务器已经启动") ;
		}

	) () ;




	server.message = function(fromDoc,to,message,type,time,room,callback)
	{
		to = parseInt(to) ;
		var server = this ;
		this.db.colle("users").findOne({id:to},function(err,toDoc){

			if(err)
			{
				callback && callback(new Error(err.message)) ;
				return ;
			}

			if( !toDoc )
			{
				callback && callback(new Error("找不到用户")) ;
				return ;
			}

			var doc = {
				from: fromDoc
				, to: to
				, message: message
				, time: time || (new Date()).getTime()
				, type: type
				, room: room
				, readed: 0
			}

			// 发送在线消息
			if( server.onlines[to] )
			{
				console.log("send message to online user: ",to,doc) ;

				server.onlines[to].emit('message',doc) ;

				doc.from = doc.from.id ;
				doc.readed = 1 ;
			}

			// 记录到数据库
			server.db.colle('messages').insert(doc,function(err){
				//console.log("save to messages:",doc,arguments) ;
				if(err)
				{
					console.log(err) ;
				}
			}) ;


			callback && callback() ;
		}) ;
	}

	server.presence = function(id,presence)
	{
		// 通知
		this.db.colle('subscriptions').find(
			{
				to: id
				, agree: 1
			}
		).each(function(err,doc){
			if(err)
			{
				console.log(err) ;
			}
			// console.log(doc) ;

			if(!doc)
			{
				return ;
			}
			else
			{
				if( server.onlines[doc.from] )
				{
					server.onlines[doc.from].emit('presence',{id:id,presence:presence}) ;
				}
			}
		}) ;
	}


} ;
