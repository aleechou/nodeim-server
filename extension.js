var server = require("./index.js") ;

exports.onload = function(app)
{
	app.on("createServer",function(app,httpServer){
		server(httpServer) ;
		helper.log.info("start up NodeIM server side") ;
	}) ;

	// 设置首页
	app.router.setDefaultController("ocuser/UserList") ;

	// 建立索引
	helper.db.client.ensureIndex('messages',{readed:-1,to:-1},  {background: true}, function(){}) ;
	helper.db.client.ensureIndex('subscriptions',{from:1,to:1},  {background:true, unique:true}, function(){}) ;
	helper.db.client.ensureIndex('subscriptions',{to:1,from:1},  {background:true}, function(){}) ;
	helper.db.client.ensureIndex('rooms',{id:1},  {background:true,unique:true}, function(){}) ;
	helper.db.client.ensureIndex('rooms-users',{room:1,user:1},  {background:true,unique:true}, function(){}) ;

	// template
	helper.template("ocuser/templates/UserListPage.html",function(err,tpl){
		tpl.$("table.usrlst thaed tr th").last().before("<th>状态</th>") ;
		tpl.$("table.usrlst tbody tr td.useroptd").before("<td><img src='/nodeim-server/Status?id={@doc.id}' /></td>") ;
		
		// 重新编译模板
		tpl.compile() ;
	})
	
	

	helper.template("ocframework/templates/ControlPanel.html",this.hold(function(err,tpl){

		if(err) throw err ;

		tpl.$("#sidemenu").prepend(
			'<li id="sidemenu-item-user">'
				+ '<h3>其它操作</h3>'
				+ '<ul class="toggle">'
				+ '<li><i class="icon-group"></i> <a class="stay" href="/nodeim-server/ChatLog">聊天记录</a></li>'
				+ '<li><i class="icon-group"></i> <a class="stay" href="/nodeim-server/AllSend">消息群发</a></li>'
				+ '</ul>'
				+ '</li>'
		) ;

		tpl.compile() ;
	})) ;
}