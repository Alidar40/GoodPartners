import React from 'react';

class Welcome extends React.Component {
	constructor(props) {
		super(props)
		this.handleLoginClick = this.handleLoginClick.bind(this)
		this.handleSignUpClick = this.handleSignUpClick.bind(this)
	}

	handleLoginClick(event) {
		this.props.history.push("/login")
	}

	handleSignUpClick(event) {
		this.props.history.push("/signup")
	}

	render() {
		return <div>
			    <div>
				<h1>Welcome to GoodPartners</h1>
			    </div>
			    <div className="container jumbotron form-group" style={{ "marginLeft": "10%", "maxWidth": "50%" }}>
				    <input onClick={this.handleLoginClick} type="button" value="Login" />
				    <input onClick={this.handleSignUpClick} type="button" value="Sign Up" />
			    </div>
			</div>
	}
}

export default Welcome
