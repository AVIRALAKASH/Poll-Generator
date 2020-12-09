function fromUrl( url ) {
	url = url.substring( 1 );
	if ( url.startsWith( "home" ) ) {
		let id = url.substring( 5, 8 );
		url = url.substring( 9 );
		let result = { isLoading: false, page: "home", pid: null, uid: null };
		( id === "pid" || id === "uid" ) && ( result[ id ] = url );
		return result;
	} else if ( url.startsWith( "profile" ) ) {
		return { isLoading: false, page: "profile", pid: null, uid: null };
	} else if ( url.startsWith( "create" ) ) {
		return { isLoading: false, page: "create", pid: null, uid: null };
	}
	return { isLoading: true, page: "home", pid: null, uid: null };
}

function toUrl( state ) {
	if ( state.isLoading === false ) {
		let result = "#";
		result += state.page;
		if ( state.page === "home" ) {
			if ( state.pid !== null ) {
				result += "/pid:" + state.pid;
			} else if ( state.uid !== null ) {
				result += "/uid:" + state.uid;
			}
		}
		return result;
	}
	return "#";
}