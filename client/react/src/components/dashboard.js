import React from 'react';
import Cookies from 'js-cookie';

class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.isSupplier = Cookies.get('isSupplier')
	}

	render() {
		return <div>
			<h2>{this.isSupplier}</h2>	
		</div>
	}
}

export default Dashboard;
