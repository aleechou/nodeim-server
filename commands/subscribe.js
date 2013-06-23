module.exports = function(data,server,client,rspn)
{
	if( data.to===undefined )
	{
		rspn({code:'403',message:'缺少参数 to'}) ;
		return ;
	}

	helper.db.coll("ocuser/users").findOne({id:parseInt(data.to)},function(err,userdoc){

		if(err)
		{
			rspn({code:500,message:err.toString()}) ;
			return ;
		}

		if(!userdoc)
		{
			rspn({code:'404',message:"参数 to 无效"}) ;
			return ;
		}

		helper.db.coll("subscriptions").insert(
			{
				from: client.session.user.id
				, to: parseInt(data.to)
				, message: data.message
				, agree: 0
			}
			, function(err){

				if( err )
				{
					if(err.code==11000)
					{
						rspn({code:306,message:"请求已经发出"}) ;
						return ;
					}
					else
					{
						rspn({code:500,message:err.toString()}) ;
						return ;						
					}
				}

				server.message(client.session.user,data.to,data.message,"request-subscription") ;

				rspn({code:200}) ;
			}
		) ;

	})

}