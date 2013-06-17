module.exports = {
	
	layout: "controlpanel"
	, view: "nodeim-server/templates/ChatLog.html"

	, children: {
		
		page: {
			layout: "controlpanel"
			, view: "nodeim-server/templates/ChatLogPage.html"
			, process: function(seed,nut)
			{
				var condition = module.exports.viewTpl.formers.former().doc(seed) ;

				for(var name in condition)
				{
					if(!condition[name])
						delete condition[name] ;
				}
				

//				var doc = {
//					from: "11"
//					, to: "12"
//					, message: "xxhh"
//					, time: (new Date()).getTime()
//				}
//
//				// 记录到数据库
//				helper.db.coll('messages').insert(doc,function(err){
//					//console.log("save to messages:",doc,arguments) ;
//					if(err)
//					{
//						console.log(err) ;
//					}
//				}) ;

				console.log("#########################################################",condition) ;
				helper.db.coll("messages").find(condition).page(20,seed.page,this.hold(function(err,page){
					if(err)
					{
						throw err ;
					}
					nut.model.page = page || {} ;
				})) ;
				
				return true ;
			}
		}
	}
	
	
}

module.exports.__as_controller = true ;