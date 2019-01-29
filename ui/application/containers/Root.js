import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { CookiesProvider } from 'react-cookie'
import routes from '../routes'
import injectTapEventPlugin from 'react-tap-event-plugin';
import configureStore from '../stores/configureStore'
import { createBrowserHistory } from 'history'
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';

const history = createBrowserHistory()

class App extends Component {

    componentWillMount() { 
        injectTapEventPlugin() 
    }

    render() {
        const store = configureStore(history)
        return (
            <Provider store={store} key='provider'>
                <CookiesProvider>
                    <LocaleProvider locale={enUS}>
                        {routes(history)}                  
                    </LocaleProvider>
                </CookiesProvider>
            </Provider>
        )
    }
}

export default App