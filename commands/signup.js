

module.exports = function(data,server,client,rspn)
{
	if(!data.username || !data.password)
	{
		rspn({code:404,message:"缺少参数 username 或 password"}) ;
		return ;
	}

	helper.db.coll("ocuser/users").insert(data,function(err,docs){

		if( err )
		{
			if( err.code==11000 )
			{
				rspn({code:405}) ;
			}
			else
			{
				console.log(err) ;
				rspn({code:500,message:err.toString()}) ;
			}
			return ;
		}

		console.log('insert',arguments) ;

		helper.db.autoIncreaseId("ocuser/users",{_id:docs[0]._id},'id',function(err,id){
			if( err )
			{
				console.log(err) ;
				rspn({code:500,message:err.toString()}) ;
				return ;
			}

			console.log(arguments) ;
			rspn({code:200,id:id}) ;
		}) ;

	}) ;
}
