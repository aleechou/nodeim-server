var Steps = require("ocsteps") ;

module.exports = function(data,server,client,rspn)
{

	var usercoll = server.db.colle('users') ;
	var userlist = [] ;

	Steps(
		function(){

			var condition = {
				from: client.session.user.id
				, agree: 1
			} ;

			if( data.id!==undefined )
			{
				condition.to = data.id ;
			}

			var steps = this ;
			var release = this.hold() ;
			server.db.colle('subscriptions').find(condition).each(function(err,doc){
				console.log('subscriptions,',arguments) ;
				if(err)
				{
					console.log(err.toString()) ;
				}

				if(doc)
				{
					var releaseUser = steps.hold() ;
					usercoll.findOne({id:doc.to},function(err,userDoc){
						
						releaseUser() ;

						if(err)
						{
							console.log(err.toString()) ;
						}

						if(!userDoc)
						{
							console.log("找不到用户id "+doc.id) ;
						}
						else
						{
							delete userDoc._id ;
							delete userDoc.password ;
							userDoc.group = doc.group ;

							userDoc.presence = server.onlines[userDoc.id]? server.onlines[userDoc.id].session.user.presence: '离线' ;

							userlist.push(userDoc) ;
						}
						
					}) ;
				}
				else
				{
					release() ;
				}
			}) ;
		}

		, function(){
			rspn({code:200,list:userlist}) ;
		}
	) () ;
}