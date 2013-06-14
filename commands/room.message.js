module.exports = function(data,server,client,rspn)
{
	if( !data.room )
	{
		rspn({code:404,message:"缺少参数 'room' id"}) ;
		return ;
	}
	if( !data.message )
	{
		rspn({code:404,message:"缺少参数 message"}) ;
		return ;
	}


	var room = server.rooms.room(data.room) ;
	if(!room)
	{
		rspn({code:404,message:"指定的room id 不存在"}) ;
		return
	}

	var err ;
	if( err=room.message(
		client.session.user.id
		, data.message
		, data.time
	) )
	{
		rspn({code:404,message:err.message}) ;
	}
	else
	{
		rspn({code:200}) ;

	}
}