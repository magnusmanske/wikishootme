var wsm_comm = {
	is_app : false,//document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 ,
	api_v3 : 'https://tools.wmflabs.org/wikishootme/api_v3.php' ,
	
	userinfo : {} ,
	is_logged_in : false ,

	
	getWSM : function ( params , callback ) {
		var me = this ;
		if ( me.is_app ) {
			$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
//			alert ( "APP TEST: " + document.URL ) ;
		} else {
			$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
		}
	} ,
	
	checkUserStatus : function ( callback ) {
		var me = this ;
		
		if ( me.is_app ) {
			// TODO
		} else {
			me.getWSM ( {
				action:'check'
			} , function ( d ) {
				if ( typeof d.result.error != 'undefined' ) {
					me.is_logged_in = false ;
				} else {
					me.is_logged_in = true ;
					me.userinfo = d.result.query.userinfo ;
				}
				callback() ;
			} ) ;
		}
	} ,
	
	
	fin : true
}
