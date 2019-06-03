import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import createHistory from 'history/createBrowserHistory'

import WelcomeContainer from '../containers/welcome-container';
import Signup from '../components/signup';
import Dashboard from '../components/dashboard';
import OrdersHistory from '../components/orders-history';
import Pricelist from '../components/pricelist';
import MyClients from '../components/myclients';
import FindClients from '../components/find-clients';
import OrderProducts from '../components/order-products';
import OrderFinish from '../components/order-finish';
import Notifications from '../components/notifications';
import CurrentOrdersBuyer from '../components/current-orders-buyer';
import CurrentOrdersSupplier from '../components/current-orders-supplier';
import Invitations from '../components/invitations';

import store from '../store/app-store';
import { handleLogin } from '../store/actions/authentication-actions'

export const history = createHistory()

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <BrowserRouter>
                    <div>
                        <Switch>
                            <Route exact path="/" component={WelcomeContainer} />
                            <Route exact path="/signup" component={Signup} />
                            <Route exact path="/buyer/dashboard" component={Dashboard} />
                            <Route exact path="/supplier/dashboard" component={Dashboard} />
                            <Route exact path="/history" component={OrdersHistory} />
                            <Route exact path="/supplier/pricelist" component={Pricelist} />
                            <Route exact path="/clients" component={MyClients} />
                            <Route exact path="/clients/find" component={FindClients} />
                            <Route exact path="/buyer/placeorder/client" component={MyClients} />
                            <Route exact path="/buyer/placeorder/products" component={OrderProducts} />
                            <Route exact path="/buyer/placeorder/finish" component={OrderFinish} />
                            <Route exact path="/notifications" component={Notifications} />
                            <Route exact path="/buyer/orders/current" component={CurrentOrdersBuyer} />
                            <Route exact path="/supplier/orders/current" component={CurrentOrdersSupplier} />
                            <Route exact path="/invitations" component={Invitations} />
                        </Switch>
                    </div>
               </BrowserRouter>
    }
}

const mapStateToProps = (store) => {
    return {
        user: store.user
    }
}

export default connect(mapStateToProps)(App);
