module.exports = function(data,server,client,rspn)
{
	if( !data.name )
	{
		rspn({code:404,message:"缺少参数 name"}) ;
		return ;
	}

	server.rooms.create(
		data.name
		, data.intro||''
		, client.session.user
		, function(err,room){
			if(err)
			{
				console.log(err) ;
				rspn({code:500,message:"系统遇到错误:"}) ;
			}
			else
			{
				rspn({code:200,room:room}) ;
			}
		}
	) ;
}