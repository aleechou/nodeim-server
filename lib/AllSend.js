var server = require("../index.js").server ;

module.exports = {
	
	layout: "controlpanel"
	, view: "nodeim-server/templates/AllSend.html"
	, process: function(seed,nut)
	{
		return true ;
	}
	, actions: {
		submit: function(seed,nut)
		{

			if(!seed.text)
			{
				nut.message("发送内容不能为空。",[],"error") ;
				return true ;
			}
			
			var manageDoc = null;
			/**
			 * 找管理员
			 */
			helper.db.coll("users")
			.findOne({username:"root"},this.hold(function(err,userDoc){
				manageDoc = userDoc;
			}))
			
			
			
			/**
			 * 所有用户
			 */
			helper.db.coll("users")
			.find({})
			.toArray(this.hold(function(err,docs){

				if(err)
				{
					nut.message("系统遇到了错误。",null,'error') ;
					helper.log.error(err) ;
					return ;
				}
				
				for( i=0 ; i < docs.length ;i++){
					
					server.message(manageDoc,docs[i]._id,seed.text,undefined,(new Date()).getTime(),undefined,this.hold())
				}
				nut.message("发送成功",[],"success") ;
				nut.view.disable() ;
				
			})) ;
			
			
		}
	}
	
}

module.exports.__as_controller = true ;