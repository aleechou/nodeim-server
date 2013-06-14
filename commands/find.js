

module.exports = function(data,server,client,rspn)
{
	helper.db.coll("ocuser/users")
		.find(data).limit(30)
		.toArray(function(err,docs){
			if(err)
			{
				rspn({code:500,message:err.toString()}) ;
				return ;
			}

			for(var i=0;i<docs.length;i++)
			{
				delete docs[i].password ;
				delete docs[i]._id ;				
			}

			rspn({code:200,users:docs}) ;
		}) ;

}
