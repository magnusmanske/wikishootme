var wsm_comm = {
	is_app : false,
	api_v3 : 'https://tools.wmflabs.org/wikishootme/api_v3.php' ,
	api_autodesc : 'https://tools.wmflabs.org/autodesc' ,
	api_wikidata : 'https://www.wikidata.org/w/api.php' ,
	url_flinfo : 'https://tools.wmflabs.org/flickr2commons/flinfo_proxy.php' ,
	url_flickr_key : 'https://tools.wmflabs.org/wikishootme/flickr.key' ,
	
	userinfo : {} ,
	is_logged_in : false ,
	oauth_uploader_login : false ,

	
	getWSM : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_v3+'?callback=?' , params , callback ) ;
	} ,

	getFlinfo : function ( params , callback ) {
		var me = this ;
		$.get ( me.url_flinfo , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,
	
	getFlickrKey : function ( callback ) {
		var me = this ;
		$.get ( me.url_flickr_key , function ( d ) {
			callback ( d ) ;
		} , 'json' ) ;
	} ,
	
	getAutodesc : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_autodesc+'?callback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,

	searchWikidata : function ( params , callback ) {
		var me = this ;
		$.getJSON ( me.api_wikidata+'?callback=?' , params , function ( d ) {
			callback ( d ) ;
		} ) ;
	} ,
	
	checkUserStatus : function ( callback ) {
		var me = this ;
		
		if ( me.is_app ) {
			// TODO
			me.is_logged_in = false ;
			callback() ;
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
	
	storeKey : function ( key , value ) {
		var storage = window.localStorage;
		storage.setItem ( key , value ) ;
	} ,
	
	removeKey : function ( key ) {
		var storage = window.localStorage;
		storage.removeItem ( key ) ;
	} ,

	getValue : function ( key ) {
		var storage = window.localStorage;
		return storage.getItem(key);
	} ,
	
	hasKey : function ( key ) {
		var storage = window.localStorage;
		var value = this.getValue ( key ) ;
		return typeof value != 'undefined' ;
	} ,
	
	storeCurrentView : function ( arr ) {
		var me = this ;
		var s = JSON.stringify ( arr ) ;
		me.storeKey ( 'last_view_params' , s ) ;
	} ,
	
	
	fin : true
}
