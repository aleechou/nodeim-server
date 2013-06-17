

module.exports = function(data,server,client,rspn)
{
	if(client.session.user)
	{
		rspn({code:402,message:"请先退出，再登陆"}) ;
		return ;
	}

	if(!data.password)
	{
		rspn({code:403,message:"缺少密码"}) ;
		return ;
	}

	helper.db.coll("ocuser/users").findOne(data,function(err,doc){

		if(err)
		{
			rspn({code:500,message:err.toString()}) ;
			return ;
		}

		if(!doc)
		{
			rspn({code:404,message:"用户名或密码错误"}) ;
		}
		else
		{
			delete doc.password ;
			delete doc._id ;

			client.session.user = doc ;
			client.session.user.presence = '在线' ;
			server.onlines[doc.id] = client ;

			// 聊天室
			helper.db.coll("rooms-users").find({user:doc.id}).toArray(function(err,docs){

				if(err)
				{
					console.log(err) ;
					rspn({code:500})
					return ;
				}

				var rooms = [], room ;
				for(var i=0;i<docs.length;i++)
				{
					if(room = server.rooms.room(docs[i].room))
					{
						console.log(room) ;
						rooms.push(room._roomdoc) ;
					}
				}

				var rspndata = {code:200,message:"welcome back, "+doc.username,doc:doc,rooms:rooms} ;
				console.log("rspndata: ",rspndata) ;
				rspn(rspndata) ;

				for(var i=0;i<docs.length;i++)
				{
					if(room = server.rooms.room(docs[i].room))
					{
						// 自动加入聊天室
						room.join(client.session.user) ;
					}
				}

				// 通知上线
				server.presence(client.session.user.id,client.session.user.presence) ;

				// 处理离线消息
				var collmsg = helper.db.coll('messages') ;
				collmsg.find({readed:0,to:doc.id}).each(function(err,msg){
					if(err) console.log(err) ;

					if(msg)
					{
						client.emit('message',msg) ;

						collmsg.update({_id:msg._id},{$set:{readed:1}},function(err){
							if(err) console.log("发送离线消息，更新 readed 出错：",err) ;
						}) ;
					}
				}) ;


			}) ;

		}
	}) ;
}
