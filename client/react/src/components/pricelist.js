import React from 'react';
import Cookies from 'js-cookie';
import { TacoTable, DataType, SortDirection, Formatters, Summarizers, TdClassNames } from 'react-taco-table';
import ReactTable from "react-table";
import "react-table/react-table.css";

import { formatJsonDateToUTC } from '../utils/date';

class Pricelist extends React.Component {
    constructor(props) {
	super(props);
    	this.companyId = Cookies.get('companyId')
	this.state = {
	    pricelist: null,
	    pricelistFetched: false,
	}
	this.renderEditable = this.renderEditable.bind(this);
	this.handleAddItemClick = this.handleAddItemClick.bind(this);
	this.handleUpdateClick = this.handleUpdateClick.bind(this);
	this.request = {
		insert: [],
		update: [],
		delete: []
	}

	fetch('/api/supplier/pricelist/' + this.companyId, {
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

    renderEditable(cellInfo) {
    	return (
      		<div
			style={{ backgroundColor: "#fafafa" }}
			contentEditable
			suppressContentEditableWarning
			onBlur={e => {
			  const data = [...this.state.pricelist];
			  if (data[cellInfo.index][cellInfo.column.id] != e.target.innerHTML) {
				  if (data[cellInfo.index].id === "") {
					  var index = this.request.insert.indexOf(data[cellInfo.index])
					  if (index >= 0) {
						this.state.request.insert.splice(index, 1)
					  }
					  if (cellInfo.column.id == "price") {
						var t = parseFloat(e.target.innerHTML)
						if (t !== NaN) {
							data[cellInfo.index][cellInfo.column.id] = t
						}
					  } else {
					  	data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
					  }
					  this.request.insert.push(data[cellInfo.index])
				  } else {
					  var index = this.request.update.indexOf(data[cellInfo.index])
					  if (index >= 0) {
						this.state.request.update.splice(index, 1)
					  }
					  if (cellInfo.column.id == "price") {
						var t = parseFloat(e.target.innerHTML)
						if (t !== NaN) {
							data[cellInfo.index][cellInfo.column.id] = t
						}
					  } else {
					  	data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
					  }
					  this.request.update.push(data[cellInfo.index])
				  }
				  this.setState({
					pricelist: data,
					request: this.request
				  });
			  }
			}}
			dangerouslySetInnerHTML={{
			  __html: this.state.pricelist[cellInfo.index][cellInfo.column.id]
			}}
	      	/>
	    );
    }

    handleAddItemClick() {
		this.state.pricelist.push({id: "", sku:"_", name: "_", units: "_", price: 0})
		this.setState({pricelist: this.state.pricelist})
    }

    handleUpdateClick() {
        fetch('/api/supplier/pricelist/edit', {
            method: 'PUT',
	    headers: {
	    	'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(this.request)
        })
            .then(response => {
	    	if (response.status == 200) {
			this.forceUpdate()
		}
            })
            .catch(error => {
                console.log(error);
            })
    }

	render() {
	    if (this.state.pricelistFetched) {
		    const data = this.state.pricelist;
		    return (
		      	<div className="container jumbotron form-group" style={{ background: "white" }}>
				<h3>Pricelist</h3>
				<ReactTable
				  data={data}
				  columns={[
				    {
				      Header: "Sku",
				      accessor: "sku",
				      Cell: this.renderEditable
				    },
				    {
				      Header: "Name",
				      accessor: "name",
				      Cell: this.renderEditable
				    },
				    {
				      Header: "Units",
				      accessor: "units",
				      Cell: this.renderEditable
				    },
				    {
				      Header: "Price",
				      accessor: "price",
				      Cell: this.renderEditable
				    },
				    {
				      Header: "Delete",
				      id: "delete",
				      accessor: d =>
					<button
					  className="btn btn-outline-danger"
					  style={{"marginLeft":"35%"}}
					  dangerouslySetInnerHTML={{
					    __html: "delete"
					  }}
					  onClick={() => {
						if (d.id === "") {
							var index = this.request.insert.indexOf(d)
							this.request.insert.splice(index, 1)
						} else {
							this.request.delete.push({ id: d.id})
						}
						var index = this.state.pricelist.indexOf(d)
						this.state.pricelist.splice(index, 1)
						this.setState({
							pricelist: this.state.pricelist,
							request: this.request
						});
					  }}
					></button>
				    }
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				/>
			    <br/>
			    <button onClick={this.handleUpdateClick}
					  className="btn btn-success btn-lg"
					  style={{"marginRight":"5%"}}
			    		>Update pricelist</button>
			    <button onClick={this.handleAddItemClick}
					  className="btn btn-primary btn-lg"
			    		>Add item</button>
			    </div>
			    );
		  } else {
		    return <div className="container body-content"><br /><h3>Loading content</h3></div>
	  	}
	}
}

export default Pricelist;

