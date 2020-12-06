function parseUrl( { search, hash } ) {
	search = search || "?";
	hash = hash || "#";
	search = search.slice( 1 ).split( "&" ).map( function( x ) {
		const y = x.split( "=" );
		return { [ y[ 0 ] ]: y[ 1 ] || null };
	} ).reduce( ( x, y ) => Object.assign( x, y ), {} );
	hash = hash.slice( 1 );
	return { search, hash };
}