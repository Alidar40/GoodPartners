import React from 'react';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { handleLogout } from '../store/actions/authentication-actions';

function LogoutButton(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-danger"
			style={{"width":"30%", "marginLeft":"80%"}}
			><legend>Logout</legend></button>);
}

function OrdersHistoryBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%", "marginRight":"5%"}}
			><legend>Orders history</legend></button>);
}

function PricelistBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%", "marginRight":"5%"}}
			><legend>Price list</legend></button>);
}

function MyClientsBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%", "marginLeft":"5%"}}
			><legend>My clients</legend></button>);
}

function FindClientsBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%", "height":"100%","marginLeft":"5%"}}
			><legend>Find clients</legend></button>);
}

function PlaceorderBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%", "marginRight":"5%"}}
			><legend>Place order</legend></button>);
}

function NotificationsBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%"}}
			><legend>Notifications: <span className="badge badge-secondary">{props.count}</span></legend></button>);
}

function CurrentOrdersBtn(props) {
	return (<button onClick={props.onClick} 
			className="btn btn-outline-primary"
			style={{"width":"30%","height":"100%", "marginRight":"5%"}}
			><legend>Current orders</legend>
		<span className="badge badge-warning" style={{"width":"100%"}}>not accepted: {props.unaccepted}</span><br/>
		<span className="badge badge-success" style={{"width":"100%"}}>accepted: {props.accepted}</span><br/>
		<span className="badge badge-secondary" style={{"width":"100%"}}>closed: {props.closed}</span><br/>
		</button>);
}

function InvitationsBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%"}}
			><legend>Invitations: <span className="badge badge-secondary">{props.count}</span></legend></button>);
}

function InviteEmployeeBtn(props) {
	return (<button onClick={props.onClick}
			className="btn btn-outline-primary"
			style={{"width":"30%"}}
			><legend>Invite employee</legend></button>);
}

class Dashboard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			companyName: "",
			notifications: 0,
			unaccepted: 0,
			accepted: 0,
			closed: 0,
			invitations: 0,
		}
		this.isSupplier = Cookies.get('isSupplier')
		this.role = Cookies.get('role')
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
		this.handleOrdersHistoryClick = this.handleOrdersHistoryClick.bind(this);
		this.handlePricelistClick = this.handlePricelistClick.bind(this);
		this.handleMyClientsClick = this.handleMyClientsClick.bind(this);
		this.handleFindClientsClick = this.handleFindClientsClick.bind(this);
		this.handlePlaceorderClick = this.handlePlaceorderClick.bind(this);
		this.handleNotificationsClick = this.handleNotificationsClick.bind(this);
		this.handleCurrentOrdersClick = this.handleCurrentOrdersClick.bind(this);
		this.handleInvitationsClick = this.handleInvitationsClick.bind(this);
		this.handleInviteEnployeeClick = this.handleInviteEmployeeClick.bind(this);
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
					companyName: data.companyName,
					notifications: data.notifications,
					unaccepted: data.unaccepted,
					accepted: data.accepted,
					closed: data.closed,
					invitations: data.invitations,
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

	handleNotificationsClick() {
		this.props.history.push("/notifications")
	}

	handleCurrentOrdersClick() {
		if (this.isSupplier == "true") {
			this.props.history.push("/supplier/orders/current")
		} else {
			this.props.history.push("/buyer/orders/current")
		}
	}

	handleInvitationsClick() {
		this.props.history.push("/invitations")
	}

	handleInviteEmployeeClick() {
		this.props.history.push("/invite/employee")
	}

	render() {
		var pricelistBtn
		var placeorderBtn
		if (this.isSupplier == "true") {
			pricelistBtn = <PricelistBtn onClick={this.handlePricelistClick} />
		} else {
			placeorderBtn = <PlaceorderBtn onClick={this.handlePlaceorderClick} />
		}

		var inviteEmployeeBtn = <div></div>
		if (this.role == "owner") {
			inviteEmployeeBtn = <InviteEmployeeBtn onClick={this.handleInviteEnployeeClick} />
		}

		return <div className="container jumbotron form-group" style={{ background: "white" }}>
			<h1>{this.state.companyName}</h1>	
			<div className="container jumbotron form-group" style={{ display: "flex", "flexDirection": "row", background: "white", "marginBottom":"0px" }}>
				<CurrentOrdersBtn 
					onClick={this.handleCurrentOrdersClick}
					unaccepted={this.state.unaccepted}
					accepted={this.state.accepted}
					closed={this.state.closed}
				/>
				<NotificationsBtn 
					onClick={this.handleNotificationsClick}
					count={this.state.notifications} />
				<MyClientsBtn onClick={this.handleMyClientsClick} />
			</div>
			<div className="container jumbotron form-group" style={{"height":"258px", display: "flex", "flexDirection": "row", background: "white", "marginBottom":"0px" }}>
				{pricelistBtn}
				{placeorderBtn}
				<InvitationsBtn 
					onClick={this.handleInvitationsClick}
					count={this.state.invitations} />
				<FindClientsBtn onClick={this.handleFindClientsClick} />
			</div>
			<div className="container jumbotron form-group" style={{"height":"258px",  display: "flex", "flexDirection": "row", background: "white", "marginBottom":"0px" }}>
				<OrdersHistoryBtn onClick={this.handleOrdersHistoryClick} />
				{inviteEmployeeBtn}
			</div>
			<div className="container jumbotron form-group" style={{ display: "flex", "flexDirection": "row", background: "white", "marginBottom":"0px" }}>
				<br /> <br/>
				<LogoutButton onClick={this.handleLogoutClick}/>
			</div>

		</div>
	}
}

const mapStateToProps = store => {
    return {
        user: store.user,
    }
}

export default withRouter(connect(mapStateToProps)(Dashboard));
