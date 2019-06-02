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

function PlaceorderBtn(props) {
	return (<button onClick={props.onClick}>Place order</button>);
}

function NotificationsBtn(props) {
	return (<button onClick={props.onClick}>Notifications - {props.count}</button>);
}

function CurrentOrdersBtn(props) {
	return (<button onClick={props.onClick} >Current orders<br/>
		<span>unaccepted: {props.unaccepted}</span><br/>
		<span>accepted: {props.accepted}</span><br/>
		<span>closed: {props.closed}</span><br/>
		</button>);
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: 0,
			unaccepted: 0,
			accepted: 0,
			closed: 0,
		}
		this.isSupplier = Cookies.get('isSupplier')
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.handleOrdersHistoryClick = this.handleOrdersHistoryClick.bind(this);
		this.handlePricelistClick = this.handlePricelistClick.bind(this);
		this.handleMyClientsClick = this.handleMyClientsClick.bind(this);
		this.handleFindClientsClick = this.handleFindClientsClick.bind(this);
		this.handlePlaceorderClick = this.handlePlaceorderClick.bind(this);
	}

	componentWillMount() {
		fetch('/api/status', {
			method: 'GET',
		})
		.then(response => {
			if (response.status === 200) {
				return response.json();
			}
		})
		.then(data => {
			this.setState({
					notifications: data.notifications,
					unaccepted: data.unaccepted,
					accepted: data.accepted,
					closed: data.closed,
				      })
		})
		.catch(error => {
			console.log(error);
		})
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

	handlePlaceorderClick() {
		this.props.history.push("/buyer/placeorder/client")
	}

	render() {
		console.log(this.state)
		var pricelistBtn
		var placeorderBtn
		if (this.isSupplier == "true") {
			pricelistBtn = <PricelistBtn onClick={this.handlePricelistClick} />
		} else {
			placeorderBtn = <PlaceorderBtn onClick={this.handlePlaceorderClick} />
		}

		return <div>
			<h2>{this.isSupplier}</h2>	
			<LogoutButton onClick={this.handleLogoutClick} />
			<OrdersHistoryBtn onClick={this.handleOrdersHistoryClick} />
			{pricelistBtn}
			<MyClientsBtn onClick={this.handleMyClientsClick} />
			<FindClientsBtn onClick={this.handleFindClientsClick} />
			{placeorderBtn}
			<NotificationsBtn count={this.state.notifications} />
			<CurrentOrdersBtn 
				unaccepted={this.state.unaccepted}
				accepted={this.state.accepted}
				closed={this.state.closed}
			/>
		</div>
	}
}

const mapStateToProps = store => {
    return {
        user: store.user,
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));
