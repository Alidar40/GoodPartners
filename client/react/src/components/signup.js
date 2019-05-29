import React from 'react';

import ReactTable from "react-table";
import "react-table/react-table.css";

class Signup extends React.Component {
	constructor(props) {
		super(props)
		this.state={
			email: "",
			password: "",
			firstName: "",
			lastName: "",
			title: "",
			companyName: "",
			companyDescription: "",
			companyWebsite: "",
			companyEmail: "",
			priceList: [],
			isSupplier: false,
			isSupplierConfirmed: false
		}

		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
		this.handleFirstNameChange = this.handleFirstNameChange.bind(this)
		this.handleLastNameChange = this.handleLastNameChange.bind(this)
		this.handleTitleChange = this.handleTitleChange.bind(this)
		this.handleCompanyNameChange = this.handleCompanyNameChange.bind(this)
		this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
		this.handleWebsiteChange = this.handleWebsiteChange.bind(this)       
		this.handleCompanyEmailChange = this.handleCompanyEmailChange.bind(this)
		this.handleSubmitClick = this.handleSubmitClick.bind(this)
		this.handleCompanyTypeSelect = this.handleCompanyTypeSelect.bind(this)
		this.handleFinishClick = this.handleFinishClick.bind(this)
		this.handleAddItemClick = this.handleAddItemClick.bind(this)
		this.renderEditable = this.renderEditable.bind(this)
		this.signup = this.signup.bind(this)
	}


	handleEmailChange() {
		this.setState({ email: event.target.value });
	}

	handlePasswordChange() {
		this.setState({ password: event.target.value });
	}
	handleFirstNameChange() {
		this.setState({ firstName: event.target.value });
	}
	handleLastNameChange() {
		this.setState({ lastName: event.target.value });
	}

	handleTitleChange() {
		this.setState({ title: event.target.value });
	}

	handleCompanyNameChange() {
		this.setState({ companyName: event.target.value });
	}

	handleDescriptionChange() {
		this.setState({ companyDescription: event.target.value });
	}

	handleWebsiteChange() {
		this.setState({ companyWebsite: event.target.value });
	}

	handleCompanyEmailChange() {
		this.setState({ companyEmail: event.target.value });
	}

	handleCompanyTypeSelect() {
		this.setState({ isSupplier: event.target.value });
	}

	handleSubmitClick() {
		event.preventDefault();
		if (this.state.isSupplier) {
			this.setState({ isSupplierConfirmed: true })
		} else {
			this.signup()
		}
	}

        handleAddItemClick() {
		this.state.priceList.push({id: "", sku:"_", name: "_", units: "_", price: 0})
		this.setState({priceList: this.state.priceList})
    	}

	handleFinishClick() {
		if (this.state.priceList.length>0) {
			this.signup()
		}
	}

	signup() {
		var companyType
		if (this.state.isSupplier) {
			companyType = "supplier"
		} else {
			companyType = "buyer"
		}

		fetch('api/auth/registration/' + companyType, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(this.state)
		})
		.then(response => {
			if (response.status == 201) {
				this.props.history.push("/")
			}
		})
		.catch(error => {
			console.log(error);
		})
	}

	SignupForm() {
		return <div>
				<form onSubmit={this.handleSubmitClick}>
					    <div className="form-group">
						<input required value={this.state.firstName} onChange={this.handleFirstNameChange} type="text" className="form-control" placeholder="First name" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.lastName} onChange={this.handleLastNameChange} type="text" className="form-control" placeholder="Last name" />
					    </div>

					    <div className="form-group">
						<input required type="email" value={this.state.email} onChange={this.handleEmailChange} className="form-control" aria-describedby="emailHelp" placeholder="Enter email"></input>
						<small className="form-text text-muted">We'll never share your email with anyone else.</small>
					    </div>
					    <div className="form-group">
						<input required type="password" value={this.state.password} onChange={this.handlePasswordChange} className="form-control" placeholder="Password"></input>
					    </div>
					   <div className="form-group">
						<select required onChange={this.handleCompanyTypeSelect} value={this.isSupplier} className="form-control" id="companyTypeSelect" >
						    <option value="false">Buyer</option>
						    <option value="true">Supplier</option>
						</select>
					    </div>
					    <div className="form-group">
						<input required value={this.state.title} onChange={this.handleTitleChange} type="text" className="form-control" placeholder="Title" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.companyName} onChange={this.handleCompanyNameChange} type="text" className="form-control" placeholder="Company name" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.companyDescription} onChange={this.handleDescriptionChange} type="text" className="form-control" placeholder="Company description" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.companyWebsite} onChange={this.handleWebsiteChange} type="text" className="form-control" placeholder="Company website" />
					    </div>
					    <div className="form-group">
						<input required type="email" value={this.state.companyEmail} onChange={this.handleCompanyEmailChange} className="form-control" placeholder="Company email" />
					    </div>
					    <input style={{ width: "100%" }} className="btn btn-primary " type="submit" value="Create account" />
				</form>
			</div>
	}


    renderEditable(cellInfo) {
    	return (
      		<div
			style={{ backgroundColor: "#fafafa" }}
			contentEditable
			suppressContentEditableWarning
			onBlur={e => {
			  const data = [...this.state.priceList];
			  if (data[cellInfo.index][cellInfo.column.id] != e.target.innerHTML) {
				  if (data[cellInfo.index].id === "") {
					  var index = this.state.priceList.indexOf(data[cellInfo.index])
					  if (index >= 0) {
						this.state.priceList.splice(index, 1)
					  }
					  if (cellInfo.column.id == "price") {
						var t = parseFloat(e.target.innerHTML)
						if (t !== NaN) {
							data[cellInfo.index][cellInfo.column.id] = t
						}
					  } else {
					  	data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
					  }
					  this.state.priceList.push(data[cellInfo.index])
				  }
				  this.setState({
					priceList: data,
				  });
			  }
			}}
			dangerouslySetInnerHTML={{
			  __html: this.state.priceList[cellInfo.index][cellInfo.column.id]
			}}
	      	/>
	    );
    }

	PricelistForm() {
		    const data = this.state.priceList
		    return (
		      	<div>
				<p>To finish the registration, please add at least one item to your pricelist</p>
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
					  dangerouslySetInnerHTML={{
					    __html: "delete"
					  }}
					  onClick={() => {
						var index = this.state.priceList.indexOf(d)
						this.state.priceList.splice(index, 1)
						this.setState({
							priceList: this.state.priceList,
						});
					  }}
					></button>
				    }
				  ]}
				  defaultPageSize={10}
				  className="-striped -highlight"
				/>
			    <button onClick={this.handleFinishClick}>Finish registration</button>
			    <button onClick={this.handleAddItemClick}>Add item</button>
			    </div>
			    );
	}

	render() {
		if (this.state.isSupplierConfirmed) {
			return this.PricelistForm()
		} else {
			return this.SignupForm()
		}
	}
}

export default Signup
