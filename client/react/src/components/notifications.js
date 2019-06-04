import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class Notifications extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    notifications: null,
	    notificationsFetched: false,
	}

	fetch('/api/notifications', {
		method: 'GET',
	})
	.then(response => {
		if (response.status == 200) {
			return response.json();
		}
	})
	.then(data => {
		if (JSON.stringify(data) === JSON.stringify(null)) {
			this.setState({ notifications: "NOTIFICATIONS_ARE_EMPTY", notificationsFetched: true });
		} else {
			this.setState({ notifications: formatJsonDateToUTC(JSON.stringify(data)), notificationsFetched: true });
		}
	})
	.catch(error => {
		console.log(error);
	})
    }

    componentWillUnmount() {
        this.setState({ notificationsFetched: false });
    }


	render() {
	    if (this.state.notificationsFetched) {
		    var toDashboard
		    if (this.isSupplier == "true") {
		    	toDashboard = "/supplier/dashboard"
		    } else {
		    	toDashboard = "/buyer/dashboard"
		    }

		    var backBtn = <Link to={toDashboard}>
		    	    <button 
				    className="btn btn-secondary"
				    style={{"float":"right"}}
				    >Back to dashboard</button>
		    </Link> 
	    	    if (this.state.notifications === "NOTIFICATIONS_ARE_EMPTY") {
			    return <div className="container jumbotron form-group" style={{ background: "white" }}><br /><h3>You don't have any notifications</h3> <br/> {backBtn}</div>
		    }
		    const data = this.state.notifications;
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>
				<div>
				{backBtn}
				<h3>Notifications</h3>
				</div>
				<ReactTable
				  data={data}
				  columns={[
				    {
				      Header: "Message",
				      accessor: "message",
				    },
				    {
				      Header: "Date",
				      accessor: "date",
				    }
				  ]}
				  defaultPageSize={5}
				  className="-striped -highlight"
				/>
			    </div>
			    );
		  } else {
		    return <div className="container jumbotron form-group" style={{ background: "white" }}><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default Notifications;
