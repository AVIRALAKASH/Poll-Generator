function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/*

parseUrl( window.document.location ).search[ "mint" ] !== "false"
`Poll Generator | Sign ${ this.state.mint ? "Up" : "In" }`

*/
const root = document.getElementById("root");
const transition = `all .3s linear`;
const loading = styled.keyframes`
	from {
		background-position-x: 0;
	}
	to {
		background-position-x: 20px;
	}
`;
const Container = styled("div")`
	background-color: #82B8CF;
	background-image: url( /img/background-image-4.jpg );
	background-repeat: no-repeat;
	background-position: left bottom;
	background-size: 30rem;
	background-color: rgba( 0, 0, 0, .6 );
	background-blend-mode: color;
	border-radius: 1rem;
	height: 32rem;
	width: 21rem;
	position: relative;
	overflow: hidden;
	transition: ${transition};
	
	@media ( max-width: 25rem ) {
		width: 100vw;
		height: 100vh;
		border-radius: 0;
	}
	
	&.mint {
		background-color: rgba( 0, 0, 0, .2 );
	}
	
	&.mint {
		.sign-up {
			top: 50%;

			.title {
				font-size: 1.7rem;
				cursor: default;
			}
		}
		.sign-in .form {
			height: 0;
			opacity: 0;
			margin-bottom: 0;
		}
	}
	
	&:not( .mint ) {
		.sign-in {
			top: 50%;

			.title {
				font-size: 1.7rem;
				cursor: default;
			}
		}
		.sign-up .form {
			height: 0;
			opacity: 0;
			margin-bottom: 0;
		}
		.message {
			bottom: 5%;
			color: #000;
		}
	}
	
	&::before {
		content: "";
		position: absolute;
		background-color: #FFF;
		width: 200%;
		height: 16rem;
		border-radius: 50%;
		transform: translatex( -25% );
		top: 10%;
		transition: ${transition};
	}
	&.mint::before {
		top: 90%;
	}
	&::after {
		content: "";
		position: absolute;
		background-color: #FFF;
		bottom: 0;
		width: 100%;
		top: calc( 10% + 1.06rem );
		transition: ${transition};
	}
	&.mint::after {
		top: 90%;
		top: calc( 90% + 1.06rem );
	}
`;
const commonStyles = `
	position: absolute;
	width: 100%;
	transform: translatey( -50% );
	transition: ${transition};
	z-index: 2;
`;
const SignUp = styled("div")`
	${commonStyles}
	top: 5%;
	.title {
		color: #FFF;
	}
`;
const SignIn = styled("div")`
	${commonStyles}
	top: 95%;
`;
const Title = styled("h2")`
	text-align: center;
	font-size: 1rem;
	cursor: pointer;
`;
const Form = styled("div")`
	transition: ${transition};
	margin-bottom: 1.5rem;
	
	input, button {
		display: block;
		margin: 0 auto;
		border: 0;
		background-color: #FFF;
		font-family: Muli, sans-serif;
		outline: none;
	}
	input {
		width: 70%;
		padding: .8rem;
		border: 1px solid rgba( 0, 0, 0, .2 );
		border-bottom: 0;
		text-decoration: underline;
		text-decoration-color: #2196F3;
		
		:first-of-type {
			border-radius: .8rem .8rem 0 0;
		}
		:last-of-type {
			border-radius: 0 0 .8rem .8rem;
			border-bottom: 1px solid rgba( 0, 0, 0, .2 );
		}
	}
	input.empty {
		text-decoration: none;
	}
	input.invalid {
		text-decoration-color: #F44336;
	}
	button {
		margin-top: 1.5rem;
		padding: .8rem;
		width: 50%;
		border-radius: 3rem;
		background-color: rgba( 0, 0, 0, .8 );
		color: #FFF;
		font-weight: bold;
		text-transform: uppercase;
		opacity: .6;
		cursor: default;
		background-image: linear-gradient( 135deg, rgba( 0, 0, 0, .4 ) 25%, rgba( 0, 0, 0, .6 ) 25% 50%, rgba( 0, 0, 0, .4 ) 50% 75%, rgba( 0, 0, 0, .6 ) 75% );
		background-size: 20px 20px;
		transition: ${transition};
		animation: ${loading} 1s linear infinite;
	}
	button.valid {
		opacity: 1;
		cursor: pointer;
		background-image: none;
	}
`;
const Message = styled("span")`
	position: absolute;
	font-size: 80%;
	z-index: 2;
	width: 100%;
	text-align: center;
	bottom: 15%;
	color: #FFF;
	transform: translatey( 50% );
	text-decoration: underline;
	text-decoration-color: #2196F3;
	
	&.error {
		text-decoration-color: #F44336;
	}
`;
const or = /*#__PURE__*/React.createElement("span", {
  style: {
    color: "rgba( 0, 0, 0, .4 )"
  }
}, "or ");

class App extends React.Component {
  static testEmpty(text) {
    return text === "" ? "empty" : null;
  }

  static testValidity(isValid) {
    return isValid ? null : "invalid";
  }

  static generateClassName(a, b) {
    if (a === null) return b;
    if (b === null) return a;
    return a + " " + b;
  }

  constructor(props) {
    super(props);
    this.state = {
      mint: App.defaultMint,
      textEmail: "",
      textPassword: "",
      textConfirm: "",
      message: null,
      error: false
    };
    this.switchMint = this.switchMint.bind(this);
    this.switchSignUp = this.switchSignUp.bind(this);
    this.switchSignIn = this.switchSignIn.bind(this);
    this.invalidSubmit = this.invalidSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.respond = this.respond.bind(this);
    this.signupEmail = React.createRef();
    this.signinEmail = React.createRef();
    this.signinPassword = React.createRef();
  }

  switchMint(value) {
    this.setState({
      mint: !!value,
      message: null,
      error: false
    });
    this[`sign${value ? "up" : "in"}Email`].current.focus();
  }

  switchSignUp() {
    this.switchMint(true);
  }

  switchSignIn() {
    this.switchMint(false);
  }

  invalidSubmit() {
    const {
      textEmail: e,
      textPassword: p,
      textConfirm: c
    } = this.state;
    let error = 0;
    p !== c && (error = 3);
    !App.password.test(p) && (error = 2);
    !App.email.test(e) && (error = 1);
    (e === "" || p === "" || c === "") && (error = 0);
    this.setState({
      message: App.errors[error],
      error: true
    });
  }

  handleChange(event) {
    this.setState({
      ["text" + event.target.name.slice(6)]: event.target.value
    });
  }

  async respond(mintButton) {
    this.setState({
      message: "working...",
      error: false
    });
    const response = await captureEmailPassword(this.state.textEmail, this.state.textPassword, mintButton);

    if (response === null) {
      this.setState({
        message: "Unknown error occurred.",
        error: true
      });
      return;
    }

    mintButton && response.gotoSignin && this.switchSignIn();
    this.setState({
      message: response.message || null,
      error: !response.success
    });

    if (mintButton === true || response.success !== true) {
      this.setState({
        textPassword: "",
        textConfirm: ""
      });
    }

    if (mintButton) {
      response.gotoSignin && this.signinPassword.current.focus();
    } else if (!response.success) {
      this.signinEmail.current.select();
    }
  }

  componentDidMount() {
    document.title = `Poll Generator | Sign ${this.state.mint ? "Up" : "In"}`;
    this[`sign${this.state.mint ? "up" : "in"}Email`].current.focus();
  }

  componentDidUpdate() {
    document.title = `Poll Generator | Sign ${this.state.mint ? "Up" : "In"}`;
  }

  render() {
    const signinValidity = App.email.test(this.state.textEmail) && App.password.test(this.state.textPassword);
    const signupValidity = signinValidity && this.state.textConfirm === this.state.textPassword;
    const emailClass = App.generateClassName(App.testEmpty(this.state.textEmail), App.testValidity(App.email.test(this.state.textEmail)));
    const passwordClass = App.generateClassName(App.testEmpty(this.state.textPassword), App.testValidity(App.password.test(this.state.textPassword)));
    const confirmClass = App.generateClassName(App.testEmpty(this.state.textConfirm), App.testValidity(this.state.textConfirm === this.state.textPassword));
    return /*#__PURE__*/React.createElement(Container, {
      className: this.state.mint ? "mint" : null
    }, /*#__PURE__*/React.createElement(SignUp, {
      className: "sign-up"
    }, /*#__PURE__*/React.createElement(Title, {
      className: "title",
      onClick: this.switchSignUp
    }, this.state.mint ? false : or, "Sign Up"), /*#__PURE__*/React.createElement(Form, {
      className: "form"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      ref: this.signupEmail,
      className: emailClass,
      name: "signupEmail",
      placeholder: "e-mail",
      value: this.state.textEmail,
      onChange: this.handleChange
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      className: passwordClass,
      name: "signupPassword",
      placeholder: "password " + App.hint,
      value: this.state.textPassword,
      onChange: this.handleChange
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      className: confirmClass,
      name: "signupConfirm",
      placeholder: "confirm password",
      value: this.state.textConfirm,
      onChange: this.handleChange
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: signupValidity ? "valid" : null,
      onClick: () => signupValidity ? this.respond(true) : this.invalidSubmit()
    }, "sign-up"))), /*#__PURE__*/React.createElement(SignIn, {
      className: "sign-in"
    }, /*#__PURE__*/React.createElement(Title, {
      className: "title",
      onClick: this.switchSignIn
    }, this.state.mint ? or : false, "Sign In"), /*#__PURE__*/React.createElement(Form, {
      className: "form"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      ref: this.signinEmail,
      className: emailClass,
      name: "signinEmail",
      placeholder: "e-mail",
      value: this.state.textEmail,
      onChange: this.handleChange
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      ref: this.signinPassword,
      className: passwordClass,
      name: "signinPassword",
      placeholder: "password " + App.hint,
      value: this.state.textPassword,
      onChange: this.handleChange
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: signinValidity ? "valid" : null,
      onClick: () => signinValidity ? this.respond(false) : this.invalidSubmit()
    }, "sign-in"))), /*#__PURE__*/React.createElement(Message, {
      className: "message" + (this.state.error ? " error" : "")
    }, this.state.message));
  }

}

_defineProperty(App, "email", /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i);

_defineProperty(App, "password", /^.{12,}$/);

_defineProperty(App, "hint", "( 12+ characters )");

_defineProperty(App, "defaultMint", parseUrl(window.document.location).search["mint"] !== "false");

_defineProperty(App, "errors", ["Fill all the boxes.", "Enter valid email.", "Passwords must be atleast 12 characters.", "Passwords don't match."]);

ReactDOM.render( /*#__PURE__*/React.createElement(App, null), root);