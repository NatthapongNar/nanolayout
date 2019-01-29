import React from 'react'
import { Router } from 'react-router'
import { Switch, Route } from 'react-router-dom'
import { GridLayout, Layouts } from './containers'
import MarketLayoutCtrl from './components/Layouts/modal/market_layout/market_layout'


export default (history) => {
    return (
        <Router history={history}>
            <Switch>
                <Route exact path="/nanolayout" component={GridLayout} />
                <Route exact path="/nanolayout/:id" component={Layouts} />
                <Route exact path="/marketlayout" component={MarketLayoutCtrl} />
            </Switch>    
        </Router>
    )
}