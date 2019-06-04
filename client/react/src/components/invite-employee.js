import React from 'react';

import ReactTable from "react-table";
import "react-table/react-table.css";

class InviteEmployee extends React.Component {
	constructor(props) {
		super(props)
		this.state={
			email: "",
			firstName: "",
			lastName: "",
			title: "",
		}

		this.handleEmailChange = this.handleEmailChange.bind(this)
		this.handlePasswordChange = this.handlePasswordChange.bind(this)
		this.handleFirstNameChange = this.handleFirstNameChange.bind(this)
		this.handleLastNameChange = this.handleLastNameChange.bind(this)
		this.handleTitleChange = this.handleTitleChange.bind(this)
		this.handleSubmitClick = this.handleSubmitClick.bind(this)
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


	handleSubmitClick() {
		event.preventDefault();
		fetch('/api/invitations/employee/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(this.state)
		})
		.then(response => {
			if (response.status == 200) {
				this.props.history.push("/")
			}
		})
		.catch(error => {
			console.log(error);
		})
	}

	InvitationForm() {
		return <div className="container jumbotron form-group" style={{ background: "white" }}>
				<h2 style={{"borderBottom": "3px solid #88c149", "marginBottom": "20px"}}>Sign up</h2>
				<form onSubmit={this.handleSubmitClick}>
					    <div className="form-group">
						<input required type="email" value={this.state.email} onChange={this.handleEmailChange} className="form-control" aria-describedby="emailHelp" placeholder="Enter email"></input>
					    </div>
					    <div className="form-group">
						<input required value={this.state.firstName} onChange={this.handleFirstNameChange} type="text" className="form-control" placeholder="First name" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.lastName} onChange={this.handleLastNameChange} type="text" className="form-control" placeholder="Last name" />
					    </div>
					    <div className="form-group">
						<input required value={this.state.title} onChange={this.handleTitleChange} type="text" className="form-control" placeholder="Title" />
					    </div>
					    <input style={{ width: "100%" }} className="btn btn-success " type="submit" value="Invite employee" />
				</form>
			</div>
	}

	render() {
		return this.InvitationForm()
	}
}

export default InviteEmployee
