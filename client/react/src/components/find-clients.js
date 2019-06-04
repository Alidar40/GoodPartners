import React from 'react';
import { Link } from 'react-router-dom';
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
	    message: "",
	}
	this.isSupplier = Cookies.get('isSupplier')
	this.handleCommentInput = this.handleCommentInput.bind(this);

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


	handleCommentInput(event) {
		this.setState({message: event.target.value })
	}
	render() {
	    if (this.state.clientsFetched) {
		    const data = this.state.clients;
		    var toDashboard
		    if (this.isSupplier == "true") {
		    	toDashboard = "/supplier/dashboard"
		    } else {
		    	toDashboard = "/buyer/dashboard"
		    }
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>

				<Link to={toDashboard}>
					<button 
						className="btn btn-secondary"
						style={{"float":"right"}}
						>Back to dashboard</button>
				</Link> 
				<h3>Invite new clients</h3>
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
					<div className="conteiner">
					<button
					  className="btn btn-outline-success"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "Invite"
					  }}
					  onClick={() => {
						fetch('/api/invitations/partnership/invite/' + d.id, {
							method: 'POST',
						        headers: {
							    'Content-Type': 'application/json',
						        },
							body: JSON.stringify({
								message: this.state.message,
							      }),
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
					</div>
				    },
				    {
				      Header: "Comment",
				      id: "comment",
				      accessor: d =>
					<div>
				        <textarea class="form-control" onChange={this.handleCommentInput} id="comment" rows="1"></textarea>
					</div>
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

				    const entries = row.original.pricelist
				    var pricelist 
				    if (this.isSupplier == "false") {
					pricelist = <ReactTable 
						data={entries}
						columns={[
						  {
						    Header: "Name",
						    accessor: "name",
						  },
						  {
						    Header: "Price",
						    accessor: "price",
						  },
						  {
						    Header: "Count",
						    accessor: "count",
						  },
						  {
						    Header: "Units",
						    accessor: "units",
						  },
						  {
						    Header: "Description",
						    accessor: "description",
						  },
						  {
						    Header: "Category",
						    accessor: "category",
						  },
						  
						]}
						defaultPageSize={5}
						  className="-striped -highlight"
					/>
				    }

				    return (
				      <div style={{ padding: "20px" }}>
				      	{email}
					{website}
					{pricelist}
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

