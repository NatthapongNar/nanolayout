import { CALL_API } from 'redux-api-middleware'
import _ from 'lodash'

import {
    LAYOUT_EMP_TESTER_INFO_URL,
    LAYOUT_BRANCH_MARKET_INFO_URL,
    LAYOUT_CUSTOMER_INFO_URL,
    LAYOUT_MARKETSHARE_CA_INFO_URL,
    LAYOUT_MARKETS_LOCKINFO_URL,
    LAYOUT_MARKETS_LOCK_HANDLE_URL

} from '../constants/endpoints'

import {
    LAYOUT_EMP_TESTER_INFO_REQUEST,
    LAYOUT_EMP_TESTER_INFO_SUCCESS,
    LAYOUT_EMP_TESTER_INFO_FAILURE,

    LAYOUT_BRANCH_MARKET_INFO_REQUEST,
    LAYOUT_BRANCH_MARKET_INFO_SUCCESS,
    LAYOUT_BRANCH_MARKET_INFO_FAILURE,

    LAYOUT_CUSTOMER_INFO_REQUEST,
    LAYOUT_CUSTOMER_INFO_SUCCESS,
    LAYOUT_CUSTOMER_INFO_FAILURE,

    LAYOUT_MARKETSHARE_CA_REQUEST,
    LAYOUT_MARKETSHARE_CA_SUCCESS,
    LAYOUT_MARKETSHARE_CA_FAILURE,

    LAYOUT_MARKET_LOCKINFO_REQUEST,
    LAYOUT_MARKET_LOCKINFO_SUCCESS,
    LAYOUT_MARKET_LOCKINFO_FAILURE,

    LAYOUT_MARKET_LOCK_HANDLE_REQUEST,
    LAYOUT_MARKET_LOCK_HANDLE_SUCCESS,
    LAYOUT_MARKET_LOCK_HANDLE_FAILURE

} from '../constants/actionType'

const API_HEADER = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

export const getEmpTesterInfo = () => ((dispatch) => 
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_EMP_TESTER_INFO_URL}`,
            method: 'GET',
            types: [
                LAYOUT_EMP_TESTER_INFO_REQUEST,
                {
                    type: LAYOUT_EMP_TESTER_INFO_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => (data && data.length > 0) ? _.map(data, (v) => { return v.EmployeeCode }) : [] )
                    }
                },
                LAYOUT_EMP_TESTER_INFO_FAILURE
            ]
        }
    })
)

export const getBranchMarketInfo = (params) => ((dispatch) => 
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_BRANCH_MARKET_INFO_URL}`,
            headers: API_HEADER,
            method: 'POST',
            body: JSON.stringify(params),
            types: [
                LAYOUT_BRANCH_MARKET_INFO_REQUEST,
                {
                    type: LAYOUT_BRANCH_MARKET_INFO_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                LAYOUT_BRANCH_MARKET_INFO_FAILURE
            ]
        }
    })
)

export const getCustomerInfo = (params) => ((dispatch) => {
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_CUSTOMER_INFO_URL}`,
            headers: API_HEADER,
            method: 'POST',
            body: JSON.stringify(params),
            types: [
                LAYOUT_CUSTOMER_INFO_REQUEST,
                {
                    type: LAYOUT_CUSTOMER_INFO_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                LAYOUT_CUSTOMER_INFO_FAILURE
            ]
        }
    })
})

export const getMarketShareByCA = (params) => ((dispatch) => {
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_MARKETSHARE_CA_INFO_URL}`,
            headers: API_HEADER,
            method: 'POST',
            body: JSON.stringify(params),
            types: [
                LAYOUT_MARKETSHARE_CA_REQUEST,
                {
                    type: LAYOUT_MARKETSHARE_CA_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                LAYOUT_MARKETSHARE_CA_FAILURE
            ]
        }
    })
})

export const getMarketLockInfo = (params) => ((dispatch) => {
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_MARKETS_LOCKINFO_URL}`,
            headers: API_HEADER,
            method: 'POST',
            body: JSON.stringify(params),
            types: [
                LAYOUT_MARKET_LOCKINFO_REQUEST,
                {
                    type: LAYOUT_MARKET_LOCKINFO_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                LAYOUT_MARKET_LOCKINFO_FAILURE
            ]
        }
    })
})

export const setMarketLockManagement = (params) => ((dispatch) => {
    dispatch({
        [CALL_API]: {
            endpoint: `${LAYOUT_MARKETS_LOCK_HANDLE_URL}`,
            headers: API_HEADER,
            method: 'POST',
            body: JSON.stringify(params),
            types: [
                LAYOUT_MARKET_LOCK_HANDLE_REQUEST,
                {
                    type: LAYOUT_MARKET_LOCK_HANDLE_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                LAYOUT_MARKET_LOCK_HANDLE_FAILURE
            ]
        }
    })
})
