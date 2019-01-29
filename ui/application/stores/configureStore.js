import { createStore, applyMiddleware } from 'redux'
import { apiMiddleware } from 'redux-api-middleware'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import { createLogger } from 'redux-logger'
import rootReducer from '../reducers'


export default (history) => {
    const middlewares = [thunk, apiMiddleware, routerMiddleware(history)]

    if (process.env.NODE_ENV !== 'production')
        middlewares.push(createLogger({ collapsed: true }))

    const store = createStore(rootReducer, applyMiddleware(...middlewares))

    if (module.hot) {
        module.hot.accept('../reducers', () => {
            System.import('../reducers').then(nextRootReducer =>
                store.replaceReducer(nextRootReducer.default)
            )
        })
    }

    return store
}
