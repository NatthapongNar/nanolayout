import React from 'react'
import { render } from 'react-dom'
import 'react-hot-loader/patch'
import { AppContainer } from 'react-hot-loader'
import Root from '../application/containers/GridLayout/root'
const rootEl = document.getElementById('app')

if(process.env.NODE_ENV === 'dev') {
    
    render(
        <AppContainer>
            <Root />
        </AppContainer>,
        rootEl
    )

    if (module.hot) {
        module.hot.accept('../application/containers/GridLayout/root', () => {
            const NextRootApp = require('../application/containers/GridLayout/root').default
            render(
                <AppContainer>
                    <NextRootApp />
                </AppContainer>, 
                rootEl
            )
        })
    }
} else {
    render(<Root />, rootEl)
}