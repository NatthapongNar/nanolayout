import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import masters from './masters'
import {
    GET_EMP_TESTER_INFO,
    GET_BRANCH_MARKET_PROFILE,
    GET_CUSTOMER_INFO,
    GET_MARKETSHARE_CAINFO,
    GET_MARKET_LOCKINFO,
    GET_MARKET_LOCK_HANDLE

} from './layouts'

import {
    customer_subgrid_info,
    latest_import_info,
    nano_dashboard_filter_option
} from './api_route'


export default combineReducers({
    routing: routerReducer,    
    masters,

    // NANO MANAGEMENT DASHBOARD
    customer_subgrid_info,
    latest_import_info,
    nano_dashboard_filter_option,

    // NANO MANAGEMENT LAYOUTS
    GET_EMP_TESTER_INFO,
    GET_BRANCH_MARKET_PROFILE,
    GET_CUSTOMER_INFO,
    GET_MARKETSHARE_CAINFO,
    GET_MARKET_LOCKINFO,
    GET_MARKET_LOCK_HANDLE
})
