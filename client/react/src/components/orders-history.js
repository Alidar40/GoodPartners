import React from 'react';
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
        if (ordersHistory === "ORDERS_HISTORY_IS_EMPTY") {
            return <div></div>
        }
        return <div>
            <h2>My old orders</h2>
            <ReactTable
                className="table table-hover simple-example table-full-width table-striped table-sortable"
                columns={columns}
                columnHighlighting
                data={ordersHistory}
	        defaultPageSize={10}
	        className="-striped -highlight"
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
