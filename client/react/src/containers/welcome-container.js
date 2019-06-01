import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import { Redirect } from 'react-router-dom'
import Cookies from 'js-cookie';

import Login from '../components/login'
import Welcome from '../components/welcome';
import { handleLogin } from '../store/actions/authentication-actions';

class WelcomeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.updateParent = this.updateParent.bind(this);
    }

    updateParent() {
        this.forceUpdate();
    }

    render() {
        const { user } = this.props;
	var isSupplier = Cookies.get('isSupplier');

        let greeting;
        const loading = <div className="container body-content"><br/><h3>Loading</h3></div>

	if (user.isLoggedIn && !user.isLoggingOut) {
		if (isSupplier == "true") {
			this.props.history.push("/supplier/dashboard");
		} else {
			this.props.history.push("/buyer/dashboard")
		}
    	}

        if (this.props.location.pathname === "/signup") {
            if (user.isLoggedIn && !user.isLoggingOut) {
                this.props.history.push("/");
	    }
	}

        if (this.props.location.pathname === "/login") {

            greeting = <div>
                <Login isLoginRequestFailed={this.props.user.isLoginRequestFailed}
                    error={this.props.user.error}
                    user={this.props.user}
                    dispatch={this.props.dispatch}
                    handleLogin={handleLogin}
                    history={this.props.history}/>
            </div>
        } 

        if (this.props.location.pathname === "/") {
            if (user.isLoggingOut) {
                this.props.user.isLoggingOut = false;
                this.props.history.push("/login");
                return(<div></div>)
            }

	    return <Welcome 
	    		history={this.props.history}/>
        } 
        
        return (
            <div>
                {greeting}
            </div>
        )
    }
}

const mapStateToProps = store => {
    return {
        user: store.user,
    }
}

export default connect(mapStateToProps)(WelcomeContainer);
