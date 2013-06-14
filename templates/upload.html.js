module.exports = function anonymous($model,buff,callback,require) {
try{
var $variables = {};
$helper = this.helper ;
function _$step_0(err)
{
	if(err){ _$step_last(err) ; return ;}
	var $nextstep = _$step_last ;
	with($model){
	with($variables){
	try{
		buff.write( "<form action=\"" );
		buff.write("/nodeim-server/upload:submit?user=" + (user)) ;
		buff.write( "\" enctype=\"" );
		buff.write("multipart/form-data") ;
		buff.write( "\" method=\"" );
		buff.write("post") ;
		buff.write( "\">\n\n\t<input type=\"" );
		buff.write("file") ;
		buff.write( "\" name=\"" );
		buff.write("file") ;
		buff.write( "\" />\n\t<button id=\"" );
		buff.write("btnSendFile") ;
		buff.write( "\">传文件</button>\n\n</form>" );
		
		
		$nextstep(null) ;
	}catch(err){
		callback && callback(err) ;
		return ;
	}}}
}

function _$step_last(err)
{
	callback && callback(err,buff) ;
}
_$step_0(null) ;


}catch(e){
	var err = new Error('模板文件中的表达式在渲染过程中抛出了异常，渲染过程终端') ;
	err.cause = e ;
	throw err ;
}
}