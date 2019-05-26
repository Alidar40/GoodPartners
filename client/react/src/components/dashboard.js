import React from 'react';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { handleLogout } from '../store/actions/authentication-actions';

function LogoutButton(props) {
    return (<button onClick={props.onClick}>Logout</button>);
}

function OrdersHistoryBtn(props) {
	return (<button onClick={props.onClick}>Orders history</button>);
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.isSupplier = Cookies.get('isSupplier')
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.handleOrdersHistoryClick = this.handleOrdersHistoryClick.bind(this);
	}

	handleLogoutClick() {
		this.props.dispatch(handleLogout())
		this.props.history.push("/")
	}

	handleOrdersHistoryClick() {
		this.props.history.push("/history")
	}

	render() {
		return <div>
			<h2>{this.isSupplier}</h2>	
			<LogoutButton onClick={this.handleLogoutClick} />
			<OrdersHistoryBtn onClick={this.handleOrdersHistoryClick} />
		</div>
	}
}

const mapStateToProps = store => {
    return {
        user: store.user,
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));
//export default Dashboard;
