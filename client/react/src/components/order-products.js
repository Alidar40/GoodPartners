import React from 'react';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class OrderProducts extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    pricelist: null,
	    pricelistFetched: false,
	}
	this.handleCountChange = this.handleCountChange.bind(this);
	this.handleFinishClick = this.handleFinishClick.bind(this);
	this.request = {
		supplierId: "",
		comment: "",
		entries: []
	}


	fetch('/api/supplier/pricelist/' + this.props.history.location.state.supplierId, {
		method: 'GET',
	})
	.then(response => {
		return response.json();
	})
	.then(data => {
		if (JSON.stringify(data) === JSON.stringify([])) {
			this.setState({ ordersHistory: "PRICELIST_IS_EMPTY", historyFetched: true });
		} else {
			this.setState({ pricelist: data, pricelistFetched: true });
		}
	})
	.catch(error => {
		console.log(error);
	})
    }

    componentWillUnmount() {
        this.setState({ pricelistFetched: false });
    }

    handleCountChange(event, entry) {
	  var index = this.state.pricelist.indexOf(entry)
	  var count = parseInt(event.target.value, 10)
	  if (isNaN(count) || count < 0) {
	  	count = 0
	  }
	  this.state.pricelist[index]["count"] = count
	  this.setState({
		pricelist: this.state.pricelist,
	  });
    }

    handleFinishClick() {
    	this.props.history.push({
		pathname: '/buyer/placeorder/finish', 
		state: {
			supplierId: this.props.history.location.state.supplierId, 
			pricelist: this.state.pricelist.slice()
			}
		})
    }

	render() {
	    if (this.state.pricelistFetched) {
		    const data = this.state.pricelist;
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>

				<h3>Select products</h3>
				<ReactTable
				  data={data}
				  columns={[
				    {
				      Header: "Sku",
				      accessor: "sku",
				    },
				    {
				      Header: "Name",
				      accessor: "name",
				    },
				    {
				      Header: "Units",
				      accessor: "units",
				    },
				    {
				      Header: "Price",
				      accessor: "price",
				    },
				    {
				      Header: "Count",
				      id: "count",
				      accessor: d => <input value={d["count"]} 
				      			type="number" step="1" min="0" 
							placeholder="Count" 
							onChange={(e) => this.handleCountChange(e, d)} 
							/>
				    }
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				/>
			    <button onClick={this.handleFinishClick}
					className="btn btn-success btn-lg"
					style={{"marginLeft":"90%", "marginTop":"10px"}}
			    		>Finish</button>
			    </div>
			    );
		  } else {
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default OrderProducts;


