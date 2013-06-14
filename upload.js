var Steps = require("ocsteps") ;
var fs = require("fs") ;
var path = require("path") ;


function checkUser(seed,nut)
{
	if(seed.user===undefined)
	{
		nut.message("缺少必要参数") ;
		return ;
	}

	nut.model.user = seed.user ;

	var server = require("./index.js").server ;
	if(!server.onlines[seed.user])
	{
		nut.message("用户未上线") ;
		return ;
	}

	return server.onlines[seed.user] ;
}


function mkdirr(folder,mode,callback)
{
						console.log("mkdirr",folder) ;
	fs.exists(folder,function(exists){

		if(exists)
		{
			callback && callback(null) ;
		}
		else
		{
			mkdirr(path.dirname(folder),mode,function(err){
				if(!err)
				{
					fs.mkdir(folder,mode,callback) ;
				}
				else
				{
					callback && callback(err) ;
				}
			})
		}

	}) ;
}

module.exports = {

	layout: null
	, view : "nodeim-server/templates/upload.html"
	, process: function(seed,nut){

		if(!checkUser(seed,nut))
		{
			nut.view.disable() ;
			return true ;
		}

		return true ;
	}

	, actions: {

		submit: {

			layout: null
			, view : "nodeim-server/templates/upload.html"
			, process: function(seed,nut,earth){

				var user = checkUser(seed,nut) ;
				if(!user)
				{
					return true ;
				}

				if(!seed.file)
				{
					nut.write("未上传文件") ;
					return true ;
				}

				var filename = (new Date).getTime() + Math.random() + seed.file.name ;
				var folder = "/public/files/nodeim-server" ;

				Steps(
					function()
					{
						console.log("start mv file") ;
						mkdirr(process.cwd()+folder,0777,this.hold()) ;
					}

					, function(err)
					{
						if(err)
						{
							throw new Error(err) ;
						}

						var source = seed.file.path ;
						var destination = process.cwd() + folder+"/"+filename ;

						console.log(source,">>>",destination) ;

						fs.rename( source, destination, this.hold()) ;
					}

					, function(err){
console.log("ok?") ;

						// 不同分区中的文件不能使用 rename
						if( err && err.code=='EXDEV' )
						{
							util.pump(
								fs.createReadStream(source)
								, fs.createWriteStream(destination)
								, function(err) {
									fs.unlink(source) ;
									this.hold() ;
								}
							);
						}
					}
				)
				.on("done",function(err){
					if(!err)
					{
console.log("ok!") ;
						user.emit("upload",{url:folder+"/"+filename,filename:seed.file.name}) ;
					}
					else
					{
						console.log("用户上传文件遇到错误",err) ;
					}
				}) () ;

				nut.view.disable() ;
				nut.message("文件上传成功",null,"success") ;
				return true ;
			}
		}

	}


}


module.exports.__as_controller = true ;