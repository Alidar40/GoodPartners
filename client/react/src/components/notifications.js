import React from 'react';
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
			this.setState({ notifications: data, notificationsFetched: true });
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
	    	    if (this.state.notifications === "NOTIFICATIONS_ARE_EMPTY") {
			    return <div className="container body-content"><br /><h3>You don't have any notifications</h3></div>
		    }
		    const data = this.state.notifications;
		    return (
		      	<div>
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
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default Notifications;
