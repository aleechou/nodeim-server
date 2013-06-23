module.exports = function(data,server,client,rspn)
{
	if( data.to===undefined )
	{
		rspn({code:'403',message:'缺少参数 to'}) ;
		return ;
	}
	if( data.group===undefined )
	{
		rspn({code:'403',message:'缺少参数 group'}) ;
		return ;
	}

	var condition = {
		to:parseInt(data.to)
		, from: client.session.user.id
	} ;
	var coll = helper.db.coll("subscriptions") ;

	coll.findOne(condition,function(err,doc){

		if(err)
		{
			console.log(err) ;
			return ;
		}

		if(!doc)
		{
			rspn({code:404,message:"没有指定的好友"}) ;
			return ;
		}

		coll.update(condition,{$set:{group:data.group}},function(err){

			if(err)
			{
				console.log(err) ;
				return ;
			}

			rspn({code:200}) ;

		}) ;

	}) ;
}