
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import injectTapEventPlugin from 'react-tap-event-plugin'
import configureStore from '../LayoutStore/configureStore'
import { CookiesProvider } from 'react-cookie'
import { Router } from 'react-router'
import { Switch, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import { LocaleProvider } from 'antd'

import enUS from 'antd/lib/locale-provider/en_US'
import App from './index.js'
import Layouts from './layouts/index.js'
import MarketLayoutCtrl from '../../components/Layouts/modal/market_layout/market_layout'

const history = createBrowserHistory()

class Root extends Component {

    componentWillMount() {
        injectTapEventPlugin()
    }

    render() {
        const store = configureStore(history)
        return (
            <Provider store={store} key='provider'>
                <CookiesProvider>
                    <LocaleProvider locale={enUS}>                        
                        <Router history={history}>
                            <Switch>  
                                <Route exact path="/nanolayout" component={App} />                              
                                <Route exact path="/nanolayout/:id" component={Layouts}/>
                                <Route exact path="/marketlayout" component={MarketLayoutCtrl} />
                            </Switch>   
                        </Router>                        
                    </LocaleProvider>
                </CookiesProvider>
            </Provider>
        )
    }
}

export default Root