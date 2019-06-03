import React from 'react';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

function FindClientsBtn(props) {
	return (<button class="btn btn-success" onClick={props.onClick}>Find clients</button>);
}

class MyClients extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    clients: null,
	    clientsFetched: false,
	}
	this.handleFindClientsClick = this.handleFindClientsClick.bind(this);

	fetch('/api/clients', {
		method: 'GET',
	})
	.then(response => {
		return response.json();
	})
	.then(data => {
		if (data == null) {
			this.setState({ clients: "EMPTY", clientsFetched: true });
		} else {
			this.setState({ clients: data, clientsFetched: true });
		}
	})
	.catch(error => {
		console.log(error);
	})
    }

	handleFindClientsClick() {
		this.props.history.push("/clients/find")
	}

	render() {
	    if (this.state.clientsFetched) {
	    	    if(this.state.clients == "EMPTY") {
		    	return(<div className="container jumbotron form-group" style={{  background: "white", "marginBottom":"5px" }} >
				   <h3>You don't have any clients</h3>
				   <br/>
				   <FindClientsBtn onClick={this.handleFindClientsClick} />
				</div>)
		    }

		    var head
		    if (this.props.location.pathname === "/clients") {
			head = <div style={{ display: "flex", "flexDirection": "row", background: "white", "marginBottom":"5px" }}>
				<h3>My clients</h3>
			        <button 
					class="btn btn-success" 
					style={{"marginLeft":"5px"}}
					onClick={() => {this.props.history.push("/clients/find")}}>Find new clients</button>
				</div>
		    } else if (this.props.location.pathname === "/buyer/placeorder/client") {
		    	head = <div style={{ display: "flex", "flexDirection": "row", background: "white", "marginBottom":"5px" }} >
				<h3>Choose a client</h3>
				</div>
		    }
			

		    const data = this.state.clients;
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>
				{head}
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
				      Header: "Make order",
				      id: "make order",
				      accessor: d =>
					<button
					  className="btn btn-outline-success"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "Make order"
					  }}
					  onClick={() => {
						this.props.history.push("/buyer/placeorder/products", {supplierId: d.id});
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

export default MyClients;
