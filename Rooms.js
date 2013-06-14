var Steps = require("ocsteps") ;

module.exports = function(server)
{
	this._rooms = {} ;
	var self = this ;

	this.create = function(name,intro,creatorDoc,callback)
	{
		var roomdoc = {
			name: name
			, intro: intro
			, creator: creatorDoc.id
		}

		server.db.colle("rooms").insert(
			roomdoc
			, function(err,docs){

				if(err)
				{
					callback&&callback(err) ;
					return ;
				}

				server.db.autoIncreaseId('rooms',{_id:docs[0]._id},'id',function(err,id){

					if(err)
					{
						callback&&callback(err) ;
						return ;
					}

					roomdoc.id = id ;
					var room = new Room(roomdoc,server) ;
					self._rooms[ room.id ] = room ;

					// 用户加入房间
					room.join(creatorDoc) ;

					callback && callback(null,room) ;
				}) ;
			}
		) ;
	}

	this.init = function(callback)
	{
		var steps = Steps(
			function(){

				var release = this.hold() ;
				server.db.colle("rooms").find().each(function(err,doc){

					release() ;

					if(err)
					{
						callback && callback(err) ;
						return ;
					}

					if(doc)
					{
						var room = new Room(doc,server) ;
						self._rooms[room.id] = room ;

						room.init(steps.hold()) ;
					}
					else
					{
						release() ;
					}

				}) ;
			}

			, function(){
				callback&&callback() ;
			}
		) ;

		steps() ;
	}

	this.room = function(id)
	{
		return this._rooms[id] ;
	}

}


////////////

function Room(doc,server)
{
	this.users = {} ;
	this.id = doc.id ;
	this._roomdoc = doc ;
	delete this._roomdoc._id ;
	var self = this ;

	this.init = function(callback)
	{
		var steps = Steps(

			function(){

				// 用户名单
				var release = this.hold() ;
				server.db.colle('rooms-users').find({room:self.id}).each(function(err,doc){

					release() ;

					if(err)
					{
						callback && callback(err) ;
						return ;
					}

					if(doc)
					{

						var releaseUser = steps.hold() ;
						server.db.colle('users').findOne(
							{ id: doc.user }
							,function(err,userdoc){

								delete userdoc._id ;
								delete userdoc.password ;

								self.users[userdoc.id] = userdoc ;

								releaseUser() ;
							}
						) ;
					}
				}) ;
			}

			, function (){
				callback && callback() ;
			}
		) ;

		steps() ;
	}

	this.join = function(userDoc)
	{
		// new user
		if( !this.users[userDoc.id] )
		{
			// 加入聊天室
			server.db.colle("rooms-users").insert(
				{
					room: self.id
					, user: userDoc.id
				}
				,function(err){
					if(err && err.code!=11000)
					{
						console.log(err) ;
					}
				}
			) ;

			this.users[userDoc.id] = userDoc ;

			var newbie = true ;
		}
		else
		{
			var newbie = false ;
		}

		// 通知
		if( server.onlines[userDoc.id] )
		{
			this.eachOnline(function(client,usrdoc){
				// 加入聊天室事件
				client.emit("room.join",{
					room:self._roomdoc
					, user:userDoc
					, newbie: newbie
				}) ;
			}) ;
		}
	}

	this.leave = function(userid)
	{
		if( !this.users[userid] )
		{
			console.log("用户id "+userid+"未加入聊天室"+this.id) ;
			return ;
		}

		var usrDoc = this.users[userid] ;
		delete this.users[userid] ;

		// 从数据库移除
		server.db.colle("rooms-users").remove(
			{
				room: this.id
				, user: userid
			}
			, function(err){
				console.log(err) ;
			}
		) ;

		// 通知其他人
		this.eachOnline(function(client){
			// 加入聊天室事件
			client.emit("room.leave",{
				room:this._roomdoc
				, user:usrDoc
			}) ;
		}) ;
	}

	this.message = function(userid,message,time)
	{
		var fromDoc = this.users[userid] ;
		if(!fromDoc)
		{
			return new Error("用户未加入指定聊天室") ;
		}

		for(var userId in this.users)
		{
			console.log(">>",userId) ;
			server.message(fromDoc,userId,message,undefined,time,this.id,function(err){

			}) ;
		}
	}

	this.eachOnline = function(func)
	{
		for(var userId in this.users)
		{
			// 在线用户接受
			if(server.onlines[userId])
			{
				func.call(this,server.onlines[userId],this.users[userId]) ;
			}
		}
	}
}
