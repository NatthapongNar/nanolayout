import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import 'react-hot-loader/patch'
import { AppContainer } from 'react-hot-loader'

const app_element = document.getElementById('app')

render(
    <AppContainer>
        <Root />
    </AppContainer>,
    app_element
)

if (module.hot) {
    module.hot.accept('./containers/Root', () => {
        const NextRootApp = require('./containers/Root').default
        render(
            <AppContainer>
                <NextRootApp />
            </AppContainer>,
            app_element
        )
    })
}