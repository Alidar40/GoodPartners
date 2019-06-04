import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import ReactTable from "react-table";

import { formatJsonDateToUTC } from '../utils/date';

class OrdersHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ordersHistory: null,
            historyFetched: false,
        }

        fetch('/api/order/history', {
            method: 'GET',
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (JSON.stringify(data) === JSON.stringify([])) {
                    this.setState({ ordersHistory: "ORDERS_HISTORY_IS_EMPTY", historyFetched: true });
                } else {
                    delete data.id;
                    delete data.isAccepted;
                    delete data.isClosed;
                    this.setState({ ordersHistory: data, historyFetched: true });
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    componentWillUnmount() {
        this.setState({ historyFetched: false });
    }

    OrdersHistory(ordersHistory, columns) {
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
        if (ordersHistory === "ORDERS_HISTORY_IS_EMPTY") {
	    return <div className="container jumbotron form-group" style={{ background: "white" }}><br /><h3>You haven't made any orders</h3> <br/> {backBtn}</div>
        }
        return <div>
	    {backBtn}
            <h2>My old orders</h2>
            <ReactTable
                className="table table-hover simple-example table-full-width table-striped table-sortable"
                columns={columns}
                columnHighlighting
                data={ordersHistory}
	        defaultPageSize={10}
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
    }

    render() {
        if (this.state.historyFetched) {
            const columns = [
                {
                    Header: 'Buyer',
                    accessor: 'buyerName',
                },
                {
                    Header: 'Supplier',
                    accessor: 'supplierName',
                },
                {
                    Header: 'Date ordered',
                    accessor: 'dateOrdered',
                },
                {
                    Header: 'Comment',
                    accessor: 'comment',
                },
                {
                    Header: 'Date accepted',
                    accessor: 'dateAccepted',
                },
                {
                    Header: 'Date closed',
                    accessor: 'dateClosed',
                }];

            return <div className="container jumbotron form-group" style={{ background: "white" }}>
                {this.OrdersHistory(formatJsonDateToUTC(JSON.stringify(this.state.ordersHistory)), columns)}

            </div>
        } else {
            return <div className="container jumbotron form-group" style={{ background: "white" }}>
<br /><h3>Loading content</h3></div>
        }
    }
}

export default OrdersHistory;
