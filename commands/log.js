var Steps = require("ocsteps") ;

module.exports = function(data,server,client,rspn)
{
	var find = {
		to: client.session.user.id
	}

	if(data.from!==undefined)
	{
		find.from = parseInt(data.from) ;
	}

	if(data.room!==undefined)
	{
		find.room = parseInt(data.room) ;
	}

	server.db.colle("messages").find(find).page(20,data.page||1,function(err,page){

		if(err)
		{
			console.log(err) ;
			rspn({code:500}) ;
			return ;
		}

		page.code = 200 ;
		rspn(page) ;
	}) ;

}