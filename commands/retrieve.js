module.exports = function(data,server,client,rspn)
{
	if( !data.username )
	{
		rspn({code:404,message:"缺少参数 username"}) ;
		return ;
	}

	helper.db.coll("ocuser/users").findOne({username:data.username},function(err,doc){

		if(err)
		{
			console.log(err) ;
			rspn({code:500}) ;
			return ;
		}

		if(!doc)
		{
			rspn({code:404,message:"用户名无效。"}) ;
			return ;
		}

		if( !doc.question || !doc.answer )
		{
			rspn({code:405,message:"没有设置找回密码的问题和回答。"}) ;
			return ;
		}

		if( data.answer && data.newpassword )
		{
			if( data.answer!=doc.answer )
			{
				rspn({code:406,message:"回答内容不正确。"}) ;
				return ;
			}

			helper.db.coll("ocuser/users").update({username:data.username},{$set:{password:data.newpassword}},function(err,doc){
				if(err)
					console.log(err) ;

				if(doc)
					rspn({code:200}) ;
				else
					rspn({code:500}) ;
			});
		}

		else
		{
			rspn({code:200,question:doc.question}) ;
		}

	}) ;

}