module.exports = {
	layout: null
	, process: function(seed,nut)
	{
		var server = require("nodeim-server").server ;
		var status = server.onlines[seed.id]? 'online': 'offline' ;
		this.res.writeHead(301, {
			"Location": "/nodeim-server/public/images/"+status+".png"
		});
	}
}

module.exports.__as_controller = true ;