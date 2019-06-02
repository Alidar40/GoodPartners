import React from 'react';
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
	this.request = {
		insert: [],
		update: [],
		delete: []
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
		if (JSON.stringify(data) === JSON.stringify(null)) {
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
	    	    if (this.state.noCurrentOrders) {
			    return <div className="container body-content"><br /><h3>You don't have any current orders</h3></div>
		    }
		    const data_accepted = this.state.accepted;
		    const data_notAccepted = this.state.notAccepted;
		    return (
		      	<div>
				<h3>Not accepted</h3>
				<ReactTable
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
				<h3>Accepted</h3>
				<ReactTable
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
			    </div>
			    );
		  } else {
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default CurrentOrdersBuyer;
