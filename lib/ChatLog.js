module.exports = {
	
	layout: "controlpanel"
	, view: "nodeim-server/templates/ChatLog.html"

	, children: {
		
		page: {
			layout: "controlpanel"
			, view: "nodeim-server/templates/ChatLogPage.html"
			, process: function(seed,nut)
			{
				helper.former(this,module.exports.view,function(err,former){

					var condition = former.doc() ;
					for(var name in condition)
					{
						if(!condition[name])
							delete condition[name] ;
					}

					helper.db.coll("messages").find(condition).page(20,seed.page,this.hold(function(err,page){
						if(err)
						{
							throw err ;
						}
						nut.model.page = page || {} ;
					})) ;
				}) ;
				
				
				
				return true ;
			}
		}
	}
	
	
}

module.exports.__as_controller = true ;