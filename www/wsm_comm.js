var wsm_comm = {
	is_app : false,
	api_v3 : 'https://tools.wmflabs.org/wikishootme/api_v3.php' ,
	api_autodesc : 'https://tools.wmflabs.org/autodesc' ,
	api_wikidata : 'https://www.wikidata.org/w/api.php' ,
	api_commons : 'https://commons.wikimedia.org/w/api.php' ,
	url_flinfo : 'https://tools.wmflabs.org/flickr2commons/flinfo_proxy.php' ,
	url_flickr_key : 'https://tools.wmflabs.org/wikishootme/flickr.key' ,
	
	userinfo : {} ,
	is_logged_in : false ,
	logged_in : { commons:false , wikidata:false } ,
	oauth_uploader_login : false ,
	
	
	init : function () {
		var me = this ;
		me.is_app = typeof navigator.connection != 'undefined' ;
		$('#app_login_dialog').on('shown.bs.modal', function () {
			$('#user_name').focus() ;
			if ( me.hasKey('cookies') ) document.cookie = me.getValue('cookies') ;
			if ( me.hasKey('username') ) $('#user_name').val ( me.getValue('username') ) ;
			if ( me.hasKey('password') ) $('#user_pass').val ( me.getValue('password') ) ;
		} ) ;
	} ,

	
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
			var urls = { commons:me.api_commons , wikidata:me.api_wikidata } ;
			var running = 2 ;
			function fin () {
				running-- ;
				if ( running > 0 ) return ;
				callback() ;
			}
			$.each ( urls , function ( site , api_url ) {
				$.getJSON(api_url+'?action=query&meta=userinfo&format=json&callback=?',function(d){
					if ( d.query.userinfo.id == 0 ) me.logged_in[site] = false ;
					else {
						me.logged_in[site] = true ;
						me.userinfo = { // TODO
							name:d.query.userinfo.name,
							groups:[],
							id:0,
							rights:[]
						} ;
					}
					fin() ;
				});
			} ) ;
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
	
	commonsLogin : function ( name , pass , callback ) {
		var me = this ;
		me.wikimediaLogin ( me.api_commons , name , pass , callback ) ;
	} ,
	
	wikidataLogin : function ( name , pass , callback ) {
		var me = this ;
		me.wikimediaLogin ( me.api_wikidata , name , pass , callback ) ;
	} ,
	
	wikimediaLogin : function ( api_url , name , pass , callback ) {
		var me = this ;
		$.get ( api_url , {
			action:'query',
			meta:'tokens',
			type:'login',
			format:'json'
		} , function ( d ) {
			var token = d.query.tokens.logintoken ; // TODO error handling
			$.post ( me.api_commons , {
				action:'clientlogin',
				username:name,
				password:pass,
				logintoken:token,
				loginreturnurl:'https://some.where',
				rememberMe:1,
				format:'json'
			} , function ( d2 ) {
			
				if ( d2.clientlogin.status == 'PASS' ) {
					callback ( true ) ;
					return ;
				}
				if ( d2.clientlogin.status == 'UI' ) {
					$.each ( d2.clientlogin.requests , function ( dummy , r ) {
						if ( r.id == 'TOTPAuthenticationRequest' ) {
							var tf_token = prompt ( d2.clientlogin.message , '' ) ;
							if ( tf_token == null || tf_token == '' ) return ; // No two-factor code given
							
							$.post ( me.api_commons , {
								action:'clientlogin',
								logincontinue:1,
//								code:tf_token,
//								token:tf_token,
								OATHToken:tf_token,
//								username:name,
//								password:pass,
								logintoken:token,
//								loginreturnurl:'https://some.where',
//								rememberMe:1,
								format:'json'
							} , function ( d3 ) {
								if ( d3.clientlogin.status == 'PASS' ) {
									me.storeKey ( 'cookies' , document.cookie ) ;
									callback ( true ) ;
									return 
								}
								alert ( JSON.stringify(d3) ) ;
								callback ( false ) ;
							} , 'json' )  . error ( function () { callback ( false ) } ) ;
						} else {
							alert ( JSON.stringify(d2) ) ;
 							callback ( false ) ;
 						}
					} ) ;
				} else {
					alert ( JSON.stringify(d2) ) ;
					callback ( false ) ;
				}
			
			} , 'json' )  . error ( function () { callback ( false ) } ) ;
		} , 'json' ) . error ( function () { callback ( false ) } ) ;
	} ,
	
	askForLogin : function ( site , callback ) {
		// open dialog and ask for/check login
		$('#app_login_dialog').modal ( {} ) ;
		$('#user_login').submit ( function (evt) {
			evt.preventDefault();
			var name = $('#user_name').val() ;
			var pass = $('#user_pass').val() ;
			
			me.storeKey ( 'username' , $('#user_name').val() ) ;
			me.storeKey ( 'password' , $('#user_pass').val() ) ;

			$('#app_login_dialog').modal('hide') ;

			me.commonsLogin ( name , pass , function ( d ) {
				if ( typeof d == 'undefined' || d === false ) {
					alert ( "Login failed" ) ;
					return ;
				}
				me.userinfo = { // TODO
					name:name,
					groups:[],
					id:0,
					rights:[]
				} ;
				if ( me.is_app ) me.logged_in[site] = true ;
				else me.is_logged_in = true ;
				callback ( true ) ;
			} ) ;

			return false ;
		} ) ;
	} ,
	
	isLoggedIn : function ( site , callback ) {
		var me = this ;
		if ( typeof callback == 'undefined' ) {
			if ( me.is_app ) return me.logged_in[site] ;
			return me.is_logged_in ; // Just checking
		}
		if ( !me.is_app ) return me.is_logged_in ; // Web browsed: We've already checked
		if ( me.is_logged_in || me.logged_in[site] ) return true ; // Yes we are!
		
		if ( typeof callback != 'undefined' ) {
			
			// Try existing user info
			var name = $('#user_name').val() ;
			var pass = $('#user_pass').val() ;

			me.commonsLogin ( name , pass , function ( d ) {
				if ( typeof d == 'undefined' || d === false ) {
					me.askForLogin ( site , callback ) ;
					return ;
				}
				me.userinfo = { // TODO
					name:name,
					groups:[],
					id:0,
					rights:[]
				} ;
				if ( me.is_app ) me.logged_in[site] = true ;
				else me.is_logged_in = true ;
				callback ( true ) ;
			} ) ;

		
		}
		
		return false ;
	} ,
	
	appLogin : function ( site ) {
		this.isLoggedIn ( site , function ( is_user_logged_in ) {
			if ( is_user_logged_in ) wikishootme.updateLayers() ;
		} ) ;
		return false ;
	} ,
	
	
	fin : true
}
