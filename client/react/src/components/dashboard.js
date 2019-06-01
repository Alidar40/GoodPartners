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

function PricelistBtn(props) {
	return (<button onClick={props.onClick}>Price list</button>);
}

function MyClientsBtn(props) {
	return (<button onClick={props.onClick}>My clients</button>);
}

function FindClientsBtn(props) {
	return (<button onClick={props.onClick}>Find clients</button>);
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.isSupplier = Cookies.get('isSupplier')
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.handleOrdersHistoryClick = this.handleOrdersHistoryClick.bind(this);
		this.handlePricelistClick = this.handlePricelistClick.bind(this);
		this.handleMyClientsClick = this.handleMyClientsClick.bind(this);
		this.handleFindClientsClick = this.handleFindClientsClick.bind(this);
	}

	handleLogoutClick() {
		this.props.dispatch(handleLogout())
		this.props.history.push("/")
	}

	handleOrdersHistoryClick() {
		this.props.history.push("/history")
	}

	handlePricelistClick() {
		this.props.history.push("/supplier/pricelist")
	}

	handleMyClientsClick() {
		this.props.history.push("/clients")
	}

	handleFindClientsClick() {
		this.props.history.push("/clients/find")
	}

	render() {
		var button1
		if (this.isSupplier == "true") {
			button1 = <PricelistBtn onClick={this.handlePricelistClick} />
		}

		return <div>
			<h2>{this.isSupplier}</h2>	
			<LogoutButton onClick={this.handleLogoutClick} />
			<OrdersHistoryBtn onClick={this.handleOrdersHistoryClick} />
			{button1}
			<MyClientsBtn onClick={this.handleMyClientsClick} />
			<FindClientsBtn onClick={this.handleFindClientsClick} />
		</div>
	}
}

const mapStateToProps = store => {
    return {
        user: store.user,
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));
