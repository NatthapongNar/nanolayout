import { CALL_API } from 'redux-api-middleware'
import {
    MKT_MASTER_LIST,
    NANO_OK_FILTER,
    LATEST_IMPORT_URL,
    CUSTOMER_SUBGRIDSUMMARY_URL,
    MASTER_NANOMANAGEMENT_FILTER_URL,

} from '../constants/endpoints'

import {
    MASTER_REQUEST, MASTER_SUCCESS, MASTER_FAILURE,
    NANO_OK_REQUEST_FILTER, NANO_OK_SUCCESS_FILTER, NANO_OK_FAILURE_FILTER,
    REQUEST_LATEST_IMPORT, SUCCESS_LATEST_IMPORT, FAILURE_LATEST_IMPORT,
    GRID_SUBGRID_CUSTINFO_REQUEST, GRID_SUBGRID_CUSTINFO_SUCCESS, GRID_SUBGRID_CUSTINFO_FAILURE,

    MASTER_FILTER_OPTIONAL_REQUEST, MASTER_FILTER_OPTIONAL_SUCCESS, MASTER_FILTER_OPTIONAL_FAILURE

} from '../constants/actionType'

const HEADER_JSONTYPE = { 'Accept': 'application/json', 'Content-Type': 'application/json' }

export const nanofilter = () => {
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${NANO_OK_FILTER}/marker`,
            method: 'GET',
            types: [
                NANO_OK_REQUEST_FILTER,
                {
                    type: NANO_OK_SUCCESS_FILTER,
                    payload: (_action, _state, res) => {
                        return res.json().then((masters) => { return masters.data })
                    }
                },
                NANO_OK_FAILURE_FILTER
            ]
        }
    })
}

// MASTER ACTION NOTE ON INDIVIDULE PROFILE
export const masterList = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MKT_MASTER_LIST}/masterlist`,
            method: 'GET',
            types: [
                MASTER_REQUEST,
                {
                    type: MASTER_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((masters) => { return masters })
                    }
                },
                MASTER_FAILURE
            ]
        }
    })
)

export const latestDateImport = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${LATEST_IMPORT_URL}`,
            method: 'GET',
            types: [
                REQUEST_LATEST_IMPORT,
                {
                    type: SUCCESS_LATEST_IMPORT,
                    payload: (_action, _state, res) => {
                        return res.json().then((masters) => { return masters })
                    }
                },
                FAILURE_LATEST_IMPORT
            ]
        }
    })
)


export const CustomerSubList = (param) => ((dispatch) => 
    dispatch({
        [CALL_API]: {
            endpoint: `${CUSTOMER_SUBGRIDSUMMARY_URL}`,
            headers: HEADER_JSONTYPE,
            method: 'POST',
            body: JSON.stringify(param),
            types: [
                GRID_SUBGRID_CUSTINFO_REQUEST,
                {
                    type: GRID_SUBGRID_CUSTINFO_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => { return data })
                    }
                },
                GRID_SUBGRID_CUSTINFO_FAILURE
            ]
        }
    })
)

export const getNanoManagementOptionFilter = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MASTER_NANOMANAGEMENT_FILTER_URL}`,
            method: 'GET',
            types: [
                MASTER_FILTER_OPTIONAL_REQUEST,
                {
                    type: MASTER_FILTER_OPTIONAL_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((data) => data)
                    }
                },
                MASTER_FILTER_OPTIONAL_FAILURE
            ]
        }
    })
)