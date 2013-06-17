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

	var rspndata = {code:200,onlines:[],offlines:[]} ;
	for(var userId in room.users)
	{
		// 在线用户接受
		if(server.onlines[userId])
		{
			rspndata.onlines.push(room.users[userId]) ;
		}
		else
		{
			rspndata.offlines.push(room.users[userId]) ;
		}
	}
	rspn(rspndata) ;
}