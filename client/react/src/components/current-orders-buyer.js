import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class CurrentOrdersBuyer extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    accepted: [],
	    notAccepted: [],
	    noCurrentOrder: false,
	    currentOrdersFetched: false,
	}
    }

    componentWillMount() {
	fetch('/api/order/current', {
		method: 'GET',
	})
	.then(response => {
		if (response.status === 200) {
			return response.json();
		}
	})
	.then(data => {
		if (data == null) {
			this.setState({ noCurrentOrders: true,  currentOrdersFetched: true });
		} else {
			var accepted = []
			var notAccepted = []
			data.forEach((e,i) => {
				if (e.isAccepted) {
					accepted.push(e)
				} else {
					notAccepted.push(e)
				}
			})
			notAccepted = formatJsonDateToUTC(JSON.stringify(notAccepted))
			accepted = formatJsonDateToUTC(JSON.stringify(accepted))
			this.setState({accepted: accepted, notAccepted: notAccepted, currentOrdersFetched: true})
			this.forceUpdate()
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
	    if (this.state.currentOrdersFetched) {
		    var backBtn = <Link to="/buyer/dashboard">
		    	    <button 
				    className="btn btn-secondary"
				    style={{"float":"right"}}
				    >Back to dashboard</button>
		    </Link> 
	    	    if (this.state.noCurrentOrders) {
			    return <div className="container jumbotron form-group" style={{ background: "white" }}><br /><h3>You don't have any current orders</h3> <br/> {backBtn}</div>
		    }
		    const data_accepted = this.state.accepted;
		    const data_notAccepted = this.state.notAccepted;
		    var notAcceptedTable = <h3>You don't have unaccepted orders</h3>
		    if (this.state.notAccepted.length != 0) {
				notAcceptedTable = <ReactTable
				  data={data_notAccepted}
				  columns={[
				    {
				      Header: "Supplier",
				      accessor: "supplierName",
				    },
				    {
				      Header: "Ordered",
				      accessor: "dateOrdered",
				    },
				    {
				      Header: "Comment",
				      accessor: "comment",
				    }
				  ]}
				  defaultPageSize={7}
				  className="-striped -highlight"
				  SubComponent={row => {
				    const entries = row.original.entries
				    return (
					<div style={{ padding: "20px" }}>
						<ReactTable 
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
					</div>
				    );
				  }}
				/>
		    }

		    var acceptedTable = <h3>You don't have accepted orders</h3>
		    if (this.state.accepted.length != 0) {
				acceptedTable = <ReactTable
				  data={data_accepted}
				  columns={[
				    {
				      Header: "Supplier",
				      accessor: "supplierName",
				    },
				    {
				      Header: "Ordered",
				      accessor: "dateOrdered",
				    },
				    {
				      Header: "Accepted",
				      accessor: "dateAccepted",
				    },
				    {
				      Header: "Comment",
				      accessor: "comment",
				    },
				    {
				      Header: "Close",
				      id: "close",
				      accessor: d =>
					<button
					  className="btn btn-outline-success"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "Close"
					  }}
					  onClick={() => {
						fetch('/api/order/close/' + d.id, {
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
				  defaultPageSize={7}
				  className="-striped -highlight"
				  SubComponent={row => {
				    const entries = row.original.entries
				    return (
					<div style={{ padding: "20px" }}>
						<ReactTable 
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
					</div>
				    );
				  }}
				/>
		    }
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>
				{backBtn}
				<h3>Not accepted</h3>
				{notAcceptedTable}
				<br/>
				<h3>Accepted</h3>
				{acceptedTable}
			    </div>
			    );
		  } else {
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default CurrentOrdersBuyer;
