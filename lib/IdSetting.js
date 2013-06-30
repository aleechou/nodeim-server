

module.exports = {

	layout: "controlpanel"
	, view: "nodeim-server/templates/IdSetting.html"

	, process: function(seed,nut){

		if(seed.useridlow)
		{
			helper.db.coll("ocframework/auto_increase_id")
				.update(
					{_id:"ocuser/users"}
					,{$set:{assigned:parseInt(seed.useridlow)}}
					,this.hold(function(err,aff){
						nut.message("用户ID从%d开始自动分配",[seed.useridlow],"success") ;
					})
				) ;
		}
		if(seed.roomidlow)
		{
			helper.db.coll("ocframework/auto_increase_id")
				.update(
				{_id:helper.db.collectionName("rooms")}
				,{$set:{assigned:parseInt(seed.roomidlow)}}
				,this.hold(function(err,aff){
					nut.message("聊天室ID从%d开始自动分配",[seed.roomidlow],"success") ;
				})
			) ;
		}

		this.step(function(){

			helper.db.currentAutoIncreasedId("ocuser/users","id",this.hold('usererr','uid')) ;
			helper.db.currentAutoIncreasedId("rooms","id",this.hold('roomerr','rid')) ;

			this.step(function(){
				if( this.recv.usererr ) throw this.recv.usererr ;
				if( this.recv.roomerr ) throw this.recv.roomerr ;

				nut.model.useridlow = this.recv.uid ;
				nut.model.roomidlow = this.recv.rid ;

			}) ;

		}) ;
	}
}

module.exports.__as_controller = true ;
