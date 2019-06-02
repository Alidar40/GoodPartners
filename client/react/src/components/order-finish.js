import React from 'react';
import Cookies from 'js-cookie';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class OrderFinish extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    supplierId: this.props.location.state.supplierId,
	    comment: "",
	    entries: [],
	    pricelist: this.props.location.state.pricelist.slice(),
	    pl: []	
	}

	this.handleCommentInput = this.handleCommentInput.bind(this);
	this.handleOrderClick = this.handleOrderClick.bind(this);

    }

	componentWillMount() {
    	    var pl = this.state.pricelist.slice()
	    var shift = 0
    	    this.state.pricelist.forEach((e, index) => {
		    index -= shift
		    if (e.hasOwnProperty("count")) {
			    if (e.count <= 0) {
				pl.splice(index, 1)
				shift++
			    }
		    } else {
			    pl.splice(index, 1)
			    shift++
		    }
			
	    })

	    var entries = []
	    pl.forEach((e) => {
	    	var entry = { id: e.id, count: e.count }
		entries.push(entry)
	    })
	    this.setState({entries: entries, pl: pl})

	}
	
	handleOrderClick() {
		fetch('/api/order/make', {
		    method: 'POST',
		    headers: {
			'Content-Type': 'application/json',
		    },
		    body: JSON.stringify({supplierId: this.state.supplierId,
		    			  comment: this.state.comment,
					  entries: this.state.entries})
		})
		    .then(response => {
			if (response.status == 201) {
				this.props.history.push("/buyer/dashboard")
			}
		    })
		    .catch(error => {
			console.log(error);
		    })
	}

	handleCommentInput(event) {
		this.setState({comment: event.target.value })
	}

	render() {
	    if (this.state.entries.length > 0) {
		    const data = this.state.pl
		    return (
		      	<div>
				<h3>Your order: </h3>
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
				      accessor: "count",
				    }
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				/>
			    <div>
			      <label for="comment">Comment:</label>
			      <textarea onChange={this.handleCommentInput} id="comment" rows="3"></textarea>
			    </div>
			    <button onClick={this.handleOrderClick}>Order</button>
			    </div>
			    );
		  } else {
		    return <div className="container body-content"><br /><h3>To order something you need to select something</h3></div>
	  	}
	}
}

export default OrderFinish;
