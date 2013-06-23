module.exports = function(data,server,client,rspn)
{
	if( !data.id )
	{
		rspn({code:404,message:"缺少参数 room id"}) ;
		return ;
	}

	var room = server.rooms.room(data.id ) ;
	if(!room)
	{
		rspn({code:404,message:"指定的room id 不存在"}) ;
		return
	}

	room.leave(client.session.user.id) ;

	rspn({code:200}) ;
}