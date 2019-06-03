import React from 'react';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class Invitations extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    invitations: null,
	    invitationsFetched: false,
	}

	fetch('/api/invitations', {
		method: 'GET',
	})
	.then(response => {
		if (response.status === 200) {
			return response.json();
		}
	})
	.then(data => {
		if (data == null) {
			this.setState({ invitations: "EMPTY", invitationsFetched: true });
		} else {
			this.setState({ invitations: formatJsonDateToUTC(JSON.stringify(data))
, invitationsFetched: true });
		}
	})
	.catch(error => {
		console.log(error);
	})
    }

    componentWillUnmount() {
        this.setState({ invitationsFetched: false });
    }


	render() {
	    if (this.state.invitationsFetched) {
	    	    if (this.state.invitations == "EMPTY") {
		    	return (<div className="container jumbotron form-group" style={{ background: "white" }}><h3>You don't have any invitations</h3></div>)
		    }
		    const data = this.state.invitations;
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>
				<h3>Invitations</h3>
				<ReactTable
				  data={data}
				  columns={[
				    {
				      Header: "From",
				      accessor: "sender.name",
				    },
				    {
				      Header: "Message",
				      accessor: "message",
				    },
				    {
				      Header: "Date",
				      accessor: "dateInvited",
				    },
				    {
				      Header: "Accpet",
				      id: "accept",
				      accessor: d =>
					<button
					  className="btn btn-outline-success"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "Accept"
					  }}
					  onClick={() => {
						fetch('api/invitations/partnership/answer/accepted/id/' + d.id, {
							method: 'POST',
						})
						.then(response => {
							if (response.status === 200) {
								this.forceUpdate()
							}
						})
						.catch(error => {
							console.log(error);
						})
					  }}
					></button>
				    },
				    {
				      Header: "Declie",
				      id: "decline",
				      accessor: d =>
					<button
					  className="btn btn-outline-danger"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "Decline"
					  }}
					  onClick={() => {
						fetch('api/invitations/partnership/answer/declined/id/' + d.id, {
							method: 'POST',
						})
						.then(response => {
							if (response.status === 200) {
								this.forceUpdate()
							}
						})
						.catch(error => {
							console.log(error);
						})
					  }}
					></button>
				    },
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				  SubComponent={row => {
				    var email
				    var website 
				    if (row.original.email != "") {
				    	email = <p>Email: <a href={"mailto:"+row.original.sender.email}>{row.original.sender.email}</a></p>
				    }
				    if (row.original.sender.website != "") {
				    	website = <p>Website: <a href={"http://"+row.original.sender.website}>{row.original.sender.website}</a></p>
				    }
				    return (
				      <div style={{ padding: "20px" }}>
				      	{email}
					{website}
				      </div>
				    );
				  }}
				/>
			    </div>
			    );
		  } else {
		    return <div className="container jumbotron form-group" style={{ background: "white" }}><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default Invitations;
