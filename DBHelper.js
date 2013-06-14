var mongodb = require('mongodb');
var Cursor = require('mongodb/lib/mongodb/cursor').Cursor ;

module.exports = function(dbclient)
{
	this.dbclient = dbclient ;
}

module.exports.prototype.colle = function(name)
{
	if(!this.dbclient)
	{
		throw new Error("not connected to the db yet.") ;
	}
	return new mongodb.Collection(this.dbclient,name) ;
}

module.exports.prototype._id = function(stringId)
{
	try{
		return new mongodb.ObjectID(stringId.toString()) ;
	} catch(e) {
		return null ;
	}
}

module.exports.prototype.ref = function(collName,id)
{
	try{
		return new mongodb.DBRef(collName,id) ;
	} catch(e) {
		return null ;
	}
}

module.exports.prototype.autoIncreaseId = function(collName,docQuery,fieldName,callback)
{
	fieldName || (fieldName='id') ;

	var inccoll = this.colle("auto_increase_id") ;
	var db = this ;
	inccoll.findOne({_id:collName},function(err,doc){
		if(err)
		{
			callback(err) ;
			return ;
		}

		function setField(){
			var data = {} ;
			data[fieldName] = newid ;
			db.colle(collName).update(docQuery,{$set:data},function(err){
				if(err)
				{
					callback && callback (err) ;
				}
				else
				{
					callback && callback (null,newid) ;
				}
			}) ;
		}

		if(doc)
		{
			var newid = ++doc.assigned ;
			inccoll.update({_id:collName},{$set:{assigned:newid}},setField) ;
		}
		else
		{
			var newid = 0 ;
			inccoll.insert({_id:collName,assigned:newid},setField) ;
		}

	}) ;
}

Cursor.prototype.page = function(perPage,pageNum,callback)
{
	pageNum || (pageNum=1) ;
	var cursor = this ;

	this.count(function(err,totalcount){

		if(err)
		{
			callback && callback(err) ;
			return ;
		}

		var pages = Math.ceil(totalcount/perPage) ;

		cursor.limit(perPage)
			.skip((pageNum-1)*perPage)
			.toArray(function(err,docs){
				if(err)
				{
					callback && callback(err) ;
					return ;
				}

				var page = {
					lastPage: pages
					, currentPage: pageNum
					, docs: docs
				}

				callback && callback(err,page) ;
			}
		) ;

	}) ;
}
