

module.exports = function(data,server,client,rspn)
{
	client.session.user.presence = data.presence ;

	server.presence(client.session.user.id,data.presence) ;

	rspn({code:200}) ;
}
