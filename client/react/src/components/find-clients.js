import React from 'react';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class FindClients extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    clients: null,
	    clientsFetched: false,
	}

	fetch('/api/clients/find', {
		method: 'GET',
	})
	.then(response => {
		console.log(response)
		return response.json();
	})
	.then(data => {
		console.log(data)
		if (JSON.stringify(data) === JSON.stringify(null)) {
			this.setState({ ordersHistory: "CLIENTSLIST_IS_EMPTY", clientsFetched: true });
		} else {
			this.setState({ clients: data, clientsFetched: true });
		}
	})
	.catch(error => {
		console.log(error);
	})
    }

    componentWillUnmount() {
        this.setState({ pricelistFetched: false });
    }


	render() {
	    if (this.state.clientsFetched) {
		    const data = this.state.clients;
		    return (
		      	<div>
				<ReactTable
				  data={data}
				  columns={[
				    {
				      Header: "Name",
				      accessor: "name",
				    },
				    {
				      Header: "Description",
				      accessor: "description",
				    },
				    {
				      Header: "Invite",
				      id: "invite",
				      accessor: d =>
					<button
					  dangerouslySetInnerHTML={{
					    __html: "Invite"
					  }}
					  onClick={() => {
					  	//TODO(Alidar)
					  }}
					></button>
				    }
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				  SubComponent={row => {
				    var email
				    var website 
				    if (row.original.email != "") {
				    	email = <p>Email: <a href={"mailto:"+row.original.email}>{row.original.email}</a></p>
				    }
				    if (row.original.website != "") {
				    	website = <p>Website: <a href={"http://"+row.original.website}>{row.original.website}</a></p>
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
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default FindClients;

