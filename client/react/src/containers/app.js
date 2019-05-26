import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import createHistory from 'history/createBrowserHistory'

import WelcomeContainer from '../containers/welcome-container';
import Dashboard from '../components/dashboard';
import OrdersHistory from '../components/orders-history';

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
                            <Route exact path="/login" component={WelcomeContainer} />
                            <Route exact path="/signup" component={WelcomeContainer} />
                            <Route exact path="/buyer/dashboard" component={Dashboard} />
                            <Route exact path="/supplier/dashboard" component={Dashboard} />
                            <Route exact path="/history" component={OrdersHistory} />
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
