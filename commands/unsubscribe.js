module.exports = function(data,server,client,rspn)
{
	if( data.to===undefined )
	{
		rspn({code:'403',message:'缺少参数 to'}) ;
		return ;
	}

	helper.db.coll("subscriptions").remove(
		{
			to:parseInt(data.to)
			, from:client.session.user.id
		}
		, function(err){

			if(err)
			{
				console.log(err.toString()) ;
				return ;
			}

			rspn({code:200}) ;
		}
	) ;

}