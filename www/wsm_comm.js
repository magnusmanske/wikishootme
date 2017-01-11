var wsm_comm = {
	is_app : document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1 ,
	api_v3 : 'https://tools.wmflabs.org/wikishootme/api_v3.php' ,
	getWSM : function ( params , callback ) {
		var me = this ;
		if ( me.is_app ) {
			$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
		} else {
			$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
		}
	}
}
