function generateId( str = "qwertyuiopasdfghjklzxcvbnm0123456789".toUpperCase(), len = 1 << 5 ) {
	let result = "";
	while ( ( result += str.charAt( str.length * Math.random() ) ).length < len );
	return result;
}