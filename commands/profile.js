

module.exports = function(data,server,client,rspn)
{
	if(!data.doc)
	{
		rspn({code:404,message:"缺少 doc 参数"}) ;
		return ;
	}

	helper.db.coll("ocuser/users").update(
		{id:client.session.user.id}
		, {$set:data.doc}
		, function(err){
			if(err)
			{
				console.log(err) ;
				rspn({code:500,message:"系统在执行时遇到了错误"}) ;
			}
			else
			{
				rspn({code:200}) ;
			}
		}
	)
}