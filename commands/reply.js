module.exports = function(data,server,client,rspn)
{
	if( data.to===undefined )
	{
		rspn({code:'403',message:'缺少参数 to'}) ;
		return ;
	}
	
	var coll = helper.db.coll('subscriptions') ;
	var condition = {
		to: client.session.user.id
		, from: parseInt(data.to)
	} ;
	coll.findOne(
		condition
		,function(err,doc){

			if(err)
			{
				rspn({code:500,message:err.toString()}) ;
				return ;
			}

			if(!doc)
			{
				rspn({code:404,message:"无效的 to 参数"}) ;
				return ;
			}

			if(data.refuse)
			{
				coll.remove(condition,function(err){
					if(err)
					{
						rspn({code:500,message:err.toString()}) ;
						return ;
					}

					// 
					server.message(
						client.session.user
						, data.to
						, data.message || "拒绝了你的好友请求"
						, 'refuse'
					) ;

					rspn({code:200}) ;
				}) ;
			}
			else
			{
				coll.update(condition,{$set:{agree:1}},function(err){
					if(err)
					{
						rspn({code:500,message:err.toString()}) ;
						return ;
					}

					// 记录反向的订阅关系
					coll.insert({
						from: client.session.user.id
						, to: parseInt(data.to)
						, agree: 1
					},function(err){
						if(err)
						{
							console.log(err) ;
						}
					}) ;

					// 
					server.message(
						client.session.user
						, data.to
						, data.message || "同意了你的好友请求"
						, 'agree'
					) ;

					rspn({code:200}) ;
				})	;
			}
			


	}) ;


}