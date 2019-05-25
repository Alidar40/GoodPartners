import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Home from '../components/home';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <BrowserRouter>
                    <div>
                        <Switch>
                            <Route exact path="/" component={Home} />
                        </Switch>
                    </div>
               </BrowserRouter>
    }
}

export default App;

