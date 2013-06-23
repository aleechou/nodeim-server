
module.exports = function(data,server,client,rspn)
{
	server.presence(client.session.user.id,'离线') ;

	delete server.onlines[client.session.user.id] ;
	delete client.session.user ;

	rspn({code:200,message:"bye"}) ;
}