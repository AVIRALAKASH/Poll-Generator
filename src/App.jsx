const root = document.getElementById( "root" );

const profileTransitions = true;

const collections = {
	"users": [],
	"polls": [],
	"votes": []
};

let $uid, uid, rerender = null;

const bodyScroll = new Map();

( async function () {
	const users = await db.collection( "users" ).get();
	users.forEach( doc => collections.users.push( doc.data() ) );
	const polls = await db.collection( "polls" ).get();
	polls.forEach( doc => collections.polls.push( doc.data() ) );
	const votes = await db.collection( "votes" ).get();
	votes.forEach( doc => collections.votes.push( doc.data() ) );
	uid = findAuthUid( firebase.auth().currentUser?.uid );
	$uid = collections.users[ uid ]?.uid;
	const go = window.location.hash.startsWith( "#home" ) || window.location.hash.startsWith( "#profile" ) || window.location.hash.startsWith( "#create" );
	rerender( go ? window.location.hash : "#home" );
} () );

function findId( collection, id ) {
	const idName = collection.charAt( 0 ) + "id";
	collection = collections[ collection ];
	const length = collection.length;
	for ( let i = 0; i < length; ++ i ) {
		if ( collection[ i ][ idName ] === id ) return i;
	}
	return -1;
}
function findAuthUid( id ) {
	let collection = "users";
	const idName = "__uid";
	collection = collections[ collection ];
	const length = collection.length;
	for ( let i = 0; i < length; ++ i ) {
		if ( collection[ i ][ idName ] === id ) return i;
	}
	return -1;
}
function getDocument( collection, id ) {
	return collections[ collection ][ findId( collection, id ) ] || null;
}
function findVote( pid ) {
	const { votes } = collections;
	for ( let i = 0; i < votes.length; ++ i ) {
		if ( votes[ i ].pid === pid && votes[ i ].uid === $uid ) return i;
	}
	return -1;
}
function getChoice( pid ) {
	let d = findVote( pid );
	if ( d === -1 ) return -1;
	return collections.votes[ d ].vote;
}
function hasUserVoted( pid ) {
	return !!~getChoice( pid );
}

document.documentElement.style.setProperty( "--bar-height", "4rem" );

const UserName = ( function () {
	const UserName = styled( "a" )`
		font-family: "IBM Plex Mono", sans-serif;
		font-style: italic;
		text-decoration: none;
		color: ${ props => props.dark ? "white" : "black" };
		cursor: pointer;

		&:hover {
			text-decoration: underline dashed;
		}

		&::before {
			content: "${ props => props.isAdmin ? "$" : "@" }";
			color: green;
		}
	`;
	return UserName;
} () );

const TopBase = ( function () {
	const TopBase = styled( "div" )`
		position: absolute;
		top: var( --bar-height ); bottom: 0; left: 0; right: 0;
		box-sizing: border-box;
		background-color: rgba( 255, 255, 255, .4 );
		background-image: url( /img/background-image-1.jpg );
		background-size: cover;
		background-attachment: fixed;
		background-position: center;
		background-blend-mode: color-dodge;
		
		&.loading {
			background-color: rgba( 0, 0, 0, .8 );
		}
	`;
	return TopBase;
} () );

const TopBar = ( function () {
	const Base = styled( "div" )`
		--image-size: 2rem;
		
		position: absolute;
		top: 0; left: 0; right: 0;
		height: var( --bar-height );
		display: flex;
		align-item: center;
		background-color: rgb( 30, 31, 38 );
		color: white;
		line-height: 4rem;
	`;
	const Title = styled( "h1" )`
		margin: 0;
		margin-left: 1rem;
		cursor: pointer;
	`;
	const CurrentUser = styled( "div" )`
		margin: calc( ( var( --bar-height ) - var( --image-size ) ) / 2 );
		margin-left: auto;
		display: flex;
		border-radius: 50%;
	`;
	const Image = styled( "img" )`
		width: var( --image-size );
		border-radius: 50%;
	`;
	class TopBar extends React.Component {
		constructor( props ) {
			super( props );
			this.tooltip = React.createRef();
			this.image = React.createRef();
			this.moveIn = this.moveIn.bind( this );
			this.moveOn = this.moveOn.bind( this );
		}
		moveIn() {
			const userTooltip = this.tooltip.current;
			userTooltip.classList.add( "visible" );
			userTooltip.style.top = this.image.current.getBoundingClientRect().bottom + "px";
			userTooltip.style.right = "4px";
		}
		moveOn() {
			const userTooltip = this.tooltip.current;
			userTooltip.classList.remove( "visible" );
		}
		render() {
			const currentUser = collections.users[ uid ];
			return (
				<Base>
					<Title onClick={ () => this.props.gotoPage( "home" ) }>Poll Generator</Title>
					{ $uid &&
						<CurrentUser href={ currentUser.profile } onMouseEnter={ this.moveIn } onMouseLeave={ this.moveOn }>
							<Image ref={ this.image } src={ currentUser.profile }/>
							<div ref={ this.tooltip } id="user-tooltip" className="tooltip from-up"><div className="box"><div>{ currentUser.name }</div><div>{ currentUser.email }</div><div className="highlight"><span className="link" onClick={ () => this.props.gotoPage( "profile" ) }>profile</span> <span className="link" onClick={ signOut }>signout</span></div></div></div>
						</CurrentUser>
					}
				</Base>
			);
		}
	}
	return TopBar;
} () );

const Card = ( function () {
	function User( props ) {
		const { children, className, ...others } = props;
		return <UserName className={ "user " + className } { ...others }>{ children }</UserName>;
	}

	const CardBox = styled( "div" )`
		display: flex;
		flex-direction: column;
		box-shadow: rgba( 0, 0, 0, .16 ) 0 3px 6px, rgba( 0, 0, 0, .23 ) 0 3px 6px;
		border-radius: 10px;
		overflow: hidden;
		background-color: white;
		transition: box-shadow .2s ease;
		
		&:hover {
			box-shadow: rgba( 0, 0, 0, .19 ) 0 10px 20px, rgba( 0, 0, 0, .23 ) 0 6px 6px;
		}
	`;
	const CardHead = styled( "div" )`
		padding: 10px 20px;
		background-color: black;
	`;
	const CardBody = styled( "div" )`
		padding: 30px 20px;
		border-bottom: 1px solid rgba( 0, 0, 0, .1 );
	`;
	const CardFoot = styled( "div" )`
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	`;
	const CardTitle = styled( "h2" )`
		margin: 0;
	`;
	const CardInfo = styled( "p" )`
		margin: 0;
		font-size: 80%;
		text-align: justify;
	`;
	const Button = styled( "a" )`
		background-color: white;
		color: black;
		padding: 12px 25px;
		border-radius: 50px;
		/*box-shadow: 0 10px 10px rgba( 0, 0, 0, .2 );*/
		text-decoration: none;
		user-select: none;
		transition: .2s ease-out;

		&:hover {
			transform: scale( 1.3 );
		}

		&.icon {
			border-radius: 50%;
			padding: 0;
			width: 40px;
			height: 40px;
		}
		&.icon .material-icons {
			width: 40px;
			height: 40px;
			line-height: 40px;
			text-align: center;
		}
	`;
	const ProgressContainer = styled( "span" )`
		position: relative;
		min-width: 150px;
		text-align: right;
		cursor: default;
		user-select: none;
		overflow: hidden;
	`;
	const Progress = styled( "div" )`
		background-color: #ddd;
		border-radius: 3px;
		height: 5px;
		width: 100%;
		margin-bottom: 6px;
		overflow: hidden;

		&:after {
			border-radius: 3px;
			background-color: black;
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			height: 5px;
			width: ${ props => props.value * 100 }%;
		}
	`;
	const ProgressText = styled( "span" )`
		font-size: 10px;
		opacity: 0.6;
		letter-spacing: 1px;
		text-transform: uppercase;
		display: block;
	`;

	function ProgressBar( props ) {
		let i = 0;
		return (
			<ProgressContainer title={ props.text.join( "\n" ) }>
				<Progress value={ props.value } />
				{ props.text.map( text => <ProgressText key={ ++ i }>{ text }</ProgressText> ) }
			</ProgressContainer>
		);
	}

	function Card( props/* poll */ ) {
		const creator = getDocument( "users", props.user );
		const start = props.creationTime;
		const length = props.duration;
		const passed = Date.now() - start;
		const ended = passed >= length;
		const print = [ `Created on ${ new Date( start ).toLocaleDateString( "en-GB" ) }`, `Ends on ${ new Date( ( start + length ) ).toLocaleDateString( "en-GB" ) }` ];
		return (
			<CardBox id={ props.id } className={ "card" + ( props.className ? " " + props.className : "" ) }>
				<CardHead>
					<User dark={ true } isAdmin={ creator.isAdmin } title={ creator.uid } onClick={ props.selectUid }>{ creator.name }</User>
				</CardHead>
				<CardBody>
					<CardTitle>{ props.title }</CardTitle>
					<CardInfo>{ props.description }</CardInfo>
				</CardBody>
				<CardFoot>
					<ProgressBar value={ passed / length } text={ ended ? [ "Ended" ] : print } />
					<Button href="#" className="icon" onClick={ props.action }>{ props.className === "overlay" ? googleIcon`close` : ( hasUserVoted( props.id ) ? googleIcon`check` : googleIcon`send` ) }</Button>
				</CardFoot>
			</CardBox>
		);
	}
	return Card;
} () );

const Scroll = ( function () {
	const Scroll = styled( "div" )`
		position: absolute;
		overflow-y: auto;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		
		&::-webkit-scrollbar {
			width: 8px;
			background-color: transparent;
		}
		&::-webkit-scrollbar-track {
			border-radius: 10px;
			background-color: transparent;
		}
		&::-webkit-scrollbar-thumb {
			border-radius: 10px;
			background-color: #555;
		}
		&::-webkit-scrollbar-thumb:hover {
			background-color: #999;
		}
	`;
	return Scroll;
} () );

const Flex = ( function () {
	const Flex = styled( "div" )`
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 500px;
		margin: 0 auto;
		
		&.body {
			margin-bottom: 20%;
			
			.card {
				margin-top: 3rem;
			}
		}
		&.overlay {
			justify-content: center;
			min-height: 100%;
			margin: 2rem auto;
		}
	`;
	return Flex;
} () );

const Body = ( function () {
	const Create = styled( "div" )`
		position: absolute;
		bottom: 2rem;
		right: 2rem;
		background-color: black;
		color: white;
		/*box-shadow: 0 10px 10px rgba( 0, 0, 0, .2 );*/
		text-decoration: none;
		user-select: none;
		transition: .2s ease-out;
		border-radius: 50%;
		padding: 0;
		width: 40px;
		height: 40px;
		cursor: pointer;
		
		&:hover {
			transform: scale( 1.3 );
		}
		
		.material-icons {
			width: 40px;
			height: 40px;
			line-height: 40px;
			text-align: center;
		}
	`;
	class Body extends React.Component {
		constructor( props ) {
			super( props );
			this.ref = React.createRef();
			this.handleScroll = this.handleScroll.bind( this );
		}
		componentDidMount() {
			this.ref.current.scrollTop = bodyScroll.get( this.props.uid ) || 0;
		}
		componentDidUpdate() {
			this.ref.current.scrollTop = bodyScroll.get( this.props.uid ) || 0;
		}
		handleScroll( event ) {
			bodyScroll.set( this.props.uid, event.target.scrollTop );
		}
		render() {
			const polls = this.props.uid ? collections.polls.filter( item => item.user === this.props.uid ) : collections.polls;
			return (
				<TopBase>
					<Scroll ref={ this.ref } onScroll={ this.handleScroll }>
						<Flex className="body">
							{ ( this.props.uid ? [ this.props.profile ] : [] ).concat( polls.map( item => <Card key={ item.pid } id={ item.pid } action={ () => this.props.selectPid( item.pid ) } selectUid={ () => this.props.selectUid( item.user ) } { ...item }/> ) ) }
						</Flex>
					</Scroll>
					<Create onClick={ () => this.props.gotoPage( "create" ) }>{ googleIcon`add` }</Create>
				</TopBase>
			);
		}
	}
	return Body;
} () );

const Overlay = ( function () {
	const Base = styled( "div" )`
		--delay: 300ms;
		
		position: absolute;
		top: 4rem;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1rem;
		background-color: rgba( 0, 0, 0, .8 );
		backdrop-filter: blur( 30px );
		transform-origin: top center;
		
		visibility: hidden;
		transform: scale( 1.1 );
		opacity: 0;
		transition: visibility 0s linear var( --delay ), opacity var( --delay ), transform var( --delay );
		
		&.visible {
			transform: scale( 1 );
			opacity: 1;
			transition: visibility 0s linear 0s, opacity var( --delay ), transform var( --delay );
			visibility: visible;
		}
	`;
	const Options = styled( "div" )`
		display: flex;
		flex-direction: column;
		align-content: flex-start;
		width: 100%;
	`;
	const FadeUp = styled.keyframes`
		0% {
			opacity: 0;
			transform: translatey( -30px );
		}
		100% {
			opacity: 1;
			transform: translatey( 0 );
		}
	`;
	const Option = styled( "span" )`
		background-color: white;
		border-radius: 20px;
		margin-top: 1rem;
		margin-left: 2rem;
		padding: .5rem 1.2rem;
		cursor: pointer;
		animation-name: ${ FadeUp };
		animation-direction: normal;
		animation-duration: .4s;
		animation-fill-mode: both;
		animation-iteration-count: 1;
		animation-play-state: running;
		animation-timing-function: ease-out;
		background-color: linear-gradient( 90deg, rgb( 139, 195, 74 ) ${ props => props.ratio }, rgb( 255, 255, 255 )  ${ props => props.ratio } );
		
		&.voted {
			background-color: #4CAF50;
			color: white;
		}
	`;
	function Overlay( props ) {
			if ( props.pid ) {
			var doc = getDocument( "polls", props.pid );
			var ended = doc.creationTime + doc.duration >= Date.now();
			var oc = ended ? ( i => createVote( props.pid, i ) ) : () => null;
			var choice = getChoice( props.pid );
			var score = [], total = 0;
			collections.votes.forEach( vote => {
				if ( vote.pid === props.pid ) {
					score[ vote.vote ] = score[ vote.vote ] || 0;
					++ score[ vote.vote ];
					++ total;
				}
			} );
		}
		let speedUp = 1;
		return (
			<Base className={ props.className }>
				<Scroll>
					{ props.pid &&
						<Flex className="overlay">
							<Card id={ props.pid } className="overlay" action={ props.unselectPid } { ...doc }/>
							<Options>
								{ doc.options.map( ( option, i ) => <Option key={ i } className={ choice === i ? "voted" : "" } ratio={ score[ i ] / total } onClick={ () => oc( i ) } style={ { animationDelay: ( .3 + i * .2 * ( speedUp /= 1.15 ) ) + "s" } }>{ option }</Option> ) }
							</Options>
						</Flex>
					}
				</Scroll>
			</Base>
		);
	}
	return Overlay;
} () );

const Create = ( function () {
	const Scroll = styled( "div" )`
		position: absolute;
		top: 0; bottom: 0;
		left: 0; right: 0;
		overflow-y: auto;
		padding: 2rem;
	`;
	const Flex = styled( "div" )`
		min-height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	`;
	const background = styled.keyframes`
		from {
			background-position-x: 0;
		}
		to {
			background-position-x: 100%;
		}
	`;
	const Container = styled( "div" )`
		border-radius: 1rem;
		padding: 2rem 0;
		width: 100%;
		max-width: 20rem;
		background-color: white;
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-image: url( /img/background-image-2.jpg );
		background-size: cover;
		background-position: 0 center;
		animation: 45s ease-in-out 1s infinite alternate ${ background };
		
		input, textarea, button:not( .material-icons ) {
			border: 0;
			width: 80%;
			margin: 0;
			padding: .8rem;
			border: 1px solid rgba( 0, 0, 0, .2 );
			resize: none;
			font-family: Muli, sans-serif;
			font-size: 13px;
			outline: none;
			box-sizing: border-box;
		}
		div {
			padding-top: 1rem;
		}
		[type=number] {
			border-top: 0;
			border-bottom: 1px solid rgba( 0, 0, 0, .2 );
			border-radius: 0 0 .8rem .8rem;
		}
		button:not( .material-icons ) {
			margin-top: 1.5rem;
			padding: .8rem;
			width: 50%;
			border-radius: 3rem;
			background-color: rgba( 0, 0, 0, .8 );
			color: #FFF;
			font-weight: bold;
			text-transform: uppercase;
			opacity: 1;
			cursor: pointer;
		}
		> input {
			border-bottom: 0;
			border-radius: .8rem .8rem 0 0;
		}
	`;
	const Title = styled( "h2" )`
		text-align: center;
		font-size: 1.7rem;
	`;
	const Options = styled( "div" )`
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		
		input:not( :last-of-type ) {
			border-bottom: 0;
		}
		input:first-of-type {
			border-radius: .8rem .8rem 0 0;
		}
		input:last-of-type {
			border-radius: 0 0 0 .8rem;
		}
	`;
	const ControlButtons = styled( "div" )`
		display: flex;
		justify-content: flex-end;
		width: 80%;
		padding: 0!important;
		
		button {
			margin: 0;
			border: 0;
			padding: 2px 4px 4px;
			background-color: white;
			border: 1px solid rgba( 0, 0, 0, .2 );
			border-top: 0;
			border-left: 0;
			cursor: pointer;
			
			&:first-of-type {
				border-bottom-left-radius: .8rem;
				border-left: 1px solid rgba( 0, 0, 0, .2 );
			}
			&:last-of-type {
				border-bottom-right-radius: .8rem;
			}
		}
	`;
	class Create extends React.Component {
		constructor( props ) {
			super( props );
			this.state = {
				title: "",
				description: "",
				duration: "",
				optionCount: 2,
				option0: "",
				option1: "",
				option2: "",
				option3: "",
				option4: "",
				option5: "",
				option6: "",
				option7: "",
				option8: "",
				option9: ""
			};
			this.addOption = this.addOption.bind( this );
			this.removeOption = this.removeOption.bind( this );
			this.handleChange = this.handleChange.bind( this );
		}
		addOption() {
			let i = this.state.optionCount;
			if ( i > 9 ) return;
			this.setState( { optionCount: i + 1 } );
		}
		removeOption() {
			let i = this.state.optionCount;
			if ( i < 3 ) return;
			this.setState( { optionCount: i - 1, [ "option" + ( i - 1 ) ]: "" } );
		}
		handleChange( event ) {
			this.setState( { [ event.target.name ]: event.target.value } );
		}
		render() {
			return (
				<TopBase>
					<Scroll>
						<Flex>
							<Container>
								<Title>Create Poll</Title>
								<input name="title" placeholder="title" value={ this.state.title } onChange={ this.handleChange }/>
								<textarea name="description" placeholder="description" value={ this.state.description } onChange={ this.handleChange }/>
								<input type="number" name="duration" placeholder="days" value={ this.state.duration } onChange={ this.handleChange }/>
								<Options className="options">
									{ createNOptions( this.state.optionCount, { onChange: this.handleChange }, this.state ) }
									<ControlButtons>
										{ this.state.optionCount < 10 && <button className="material-icons" onClick={ this.addOption }>add</button> }
										{ this.state.optionCount > 2 && <button className="material-icons" onClick={ this.removeOption }>close</button> }
									</ControlButtons>
								</Options>
								<button onClick={ () => createPoll( { ...this.state } ) }>Create</button>
							</Container>
						</Flex>
					</Scroll>
				</TopBase>
			);
		}
	}
	function createNOptions( n, props, state ) {
		let result = [];
		for ( let i = 0; i < n; ++ i ) {
			result.push( <input key={ i } name={ "option" + i } placeholder="option" { ...props } value={ state[ "option" + i ] }/> );
		}
		return result;
	}
	return Create;
} () );

const Profile = ( function () {
	const Box = styled( "div" )`
		margin-top: 3rem;
		background-color: white;
		display: flex;
		width: 100%;
		max-width: 500px;
		height: 130px;
		border-radius: 10px;
		box-shadow: rgba( 0, 0, 0, .16 ) 0 3px 6px, rgba( 0, 0, 0, .23 ) 0 3px 6px;
		transition: box-shadow .2s ease;
		&:hover {
			box-shadow: rgba( 0, 0, 0, .19 ) 0 10px 20px, rgba( 0, 0, 0, .23 ) 0 6px 6px;
		}
	`;
	const Image = styled( "img" )`
		width: 180px;
		height: 130px;
		object-fit: cover;
		border-radius: 10px 0 0 10px;
		
		${ profileTransitions ? "transition: .2s ease-out;" : "" }
		
		&:hover {
			border-radius: 10px;
			height: 180px;
			transform: translatey( -25px );
		}
	`;
	const Data = styled( "div" )`
		display: flex;
		flex-direction: column;
		align-items: stretch;
		width: 100%;
	`;
	const TopBar = styled( "div" )`
		display: flex;
		align-items: center;
		padding: 10px 20px;
		background-color: black;
		color: white;
		border-radius: 0 10px 0 0;
	`;
	const Close = styled( "span" )`
		margin-left: auto;
		height: 24px;
		cursor: pointer;
		user-select: none;
	`;
	const Email = styled( "div" )`
		padding: 10px 20px 0;
		text-align: center;
	`;
	const Stats = styled( "div" )`
		margin-top: auto;
		padding: 0 20px 10px;
		display: flex;
		justify-content: space-evenly;
		text-transform: uppercase;
		font-weight: bold;
		font-size: .6rem;
		text-align: center;
		color: rgba( 0, 0, 0, .6 );
	`;
	const Element = styled( "div" )`
		display: flex;
		flex-direction: column;
		align-item: center;
	`;
	const Number = styled( "span" )`
		font-size: .8rem;
		background-color: #e8f8ff;
		width: 50px;
		height: 30px;
		line-height: 30px;
		border-radius: 4px;
		color: black;
	`;
	function Profile( props ) {
		const doc = getDocument( "users", props.uid );
		const box = (
			<Box>
				<a href={ doc.profile }><Image src={ doc.profile }/></a>
				<Data>
					<TopBar>
						<UserName dark={ true } isAdmin={ doc.isAdmin }>{ doc.name }</UserName>
						<Close onClick={ () => props.gotoPage( "home" ) }>{ googleIcon`close` }</Close>
					</TopBar>
					<Email>{ doc.email }</Email>
					<Stats>
						<Element>Polls <Number>{ doc.polls.length }</Number></Element>
						<Element>Votes <Number>{ doc.votes.length }</Number></Element>
					</Stats>
				</Data>
			</Box>
		);
		if ( props.alone ) {
			return (
				<TopBase>
					<Flex>{ box }</Flex>
				</TopBase>
			);
		} else {
			return box;
		}
	}
	return Profile;
} () );

const Loading = ( function () {
	function Loading( props ) {
		return (
			<TopBase className="loading">
				<div class="loading-spinner-ripple"><div class="ldrp"><div></div><div></div></div></div>
			</TopBase>
		);
	}
	return Loading;
} () );

class App extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			isLoading: true,
			page: "home", /* home, profile, create */
			pid: null, /* <page = null>, pid | null */
			uid: null, /* <page = null>, uid | null */
		};
		this.rerender = this.rerender.bind( this );
		this.gotoPage = this.gotoPage.bind( this );
		this.selectPid = this.selectPid.bind( this );
		this.unselectPid = this.unselectPid.bind( this );
		this.selectUid = this.selectUid.bind( this );
		this.unselectUid = this.unselectUid.bind( this );
	}
	rerender( hash ) {
		this.setState( fromUrl( hash ) );
	}
	gotoPage( page ) {
		if ( ( page === "profile" || page === "create" ) && ( ! $uid ) ) {
			window.location.href = "/login.html?mint=false";
			return;
		}
		this.setState( { page: page, pid: null, uid: null } );
	}
	selectPid( pid ) {
		this.setState( { pid: pid } );
	}
	unselectPid() {
		this.setState( { pid: null } );
	}
	selectUid( uid ) {
		this.setState( { uid: uid } );
	}
	unselectUid() {
		this.setState( { uid: null } );
	}
	componentDidMount() {
		rerender = this.rerender;
		window.location.hash = toUrl( this.state );
	}
	componentDidUpdate() {
		rerender = this.rerender;
		window.location.hash = toUrl( this.state );
	}
	render() {
		let result = null;
		if ( this.state.isLoading ) {
			result = <Loading/>;
		} else {
			switch ( this.state.page ) {
				case "home":
					result = ( <>
						<Body uid={ this.state.uid } profile={ this.state.uid && <Profile key={ this.state.uid } alone={ false } uid={ this.state.uid } gotoPage={ this.gotoPage }/> } selectPid={ this.selectPid } selectUid={ this.selectUid } unselectUid={ this.unselectPid } gotoPage={ this.gotoPage }/>
						<Overlay className={ this.state.pid ? "visible" : "" } pid={ this.state.pid } unselectPid={ this.unselectPid }/>
					</> );
					break;
				case "profile":
					result = <Profile alone={ true } uid={ $uid } gotoPage={ this.gotoPage }/>;
					break;
				case "create":
					result = <Create/>;
					break;
			}
		}
		return ( <>
			<TopBar gotoPage={ this.gotoPage }/>
			{ result }
		</> );
	}
}

ReactDOM.render( <App/>, root );

function googleIcon( text ) {
	return <span className="material-icons">{ text[ 0 ] }</span>;
}

async function createPoll( { title, description, optionCount, duration, option0, option1, option2, option3, option4, option5, option6, option7, option8, option9 } ) {
	if ( ! $uid ) {
		window.location.href = "/login.html?mint=false";
		return;
	}
	( duration < 0 ) && ( duration = 7 );
	let d = new Date();
	d = new Date( d.getFullYear(), d.getMonth(), d.getDate() );
	rerender( "#" );
	const pid = generateId();
	const options = [ option0, option1, option2, option3, option4, option5, option6, option7, option8, option9 ].splice( 0, optionCount );
	collections.users[ uid ].polls.push( pid );
	await db.collection( "users" ).doc( $uid ).update( { polls: collections.users[ uid ].polls } );
	const poll = { pid, title, description, options, creationTime: d.getTime(), duration: duration * 24 * 60 * 60 * 1000, user: $uid, votes: [] };
	collections.polls.push( poll );
	await db.collection( "polls" ).doc( pid ).set( poll );
	rerender( "#home" );
}

async function createVote( $pid, vote ) {
	if ( ! $uid ) {
		window.location.href = "/login.html?mint=false";
		return;
	}
	rerender( "#" );
	let pid = findId( "polls", $pid )
	let poll = collections.polls[ pid ];
	if ( poll.creationTime + poll.duration >= Date.now() ) {
		let i = findVote( $pid ), $vid, isNew = ! ~ i;
		let id = i;
		if ( isNew ) {
			i = collections.votes.length;
			$vid = generateId();
		} else {
			$vid = collections.votes[ i ].vid;
		}
		if ( isNew ) {
			const doc = { vid: $vid, pid: $pid, uid: $uid, vote };
			collections.users[ uid ].votes.push( $vid );
			collections.polls[ pid ].votes.push( $vid );
			collections.votes[ i ] = doc;
			await db.collection( "users" ).doc( $uid ).update( { votes: collections.users[ uid ].votes } );
			await db.collection( "polls" ).doc( $pid ).update( { votes: collections.polls[ pid ].votes } );
			await db.collection( "votes" ).doc( $vid ).set( doc );
		} else {
			collections.votes[ i ].vote = vote;
			await db.collection( "votes" ).doc( $vid ).update( { vote } );
		}
	}
	rerender( "#home/pid:" + $pid );
}

function signOut() {
	firebase.auth().signOut();
	window.location.href = "/";
}