import { Cookies } from 'react-cookie'
import { config } from '../containers/GridLayout/config'
import _ from 'lodash'

import { CALL_API } from 'redux-api-middleware'
import {
    MASTER_REGION_URL,
    MASTER_AREA_URL,
    MASTER_BRANCH_URL,
    MASTER_CALIST_URL

} from '../constants/endpoints'

import {
    MASTER_REGION_REQUEST, MASTER_REGION_SUCCESS, MASTER_REGION_FAILURE,
    MASTER_AREA_REQUEST, MASTER_AREA_SUCCESS, MASTER_AREA_FAILURE,
    MASTER_BRANCH_REQUEST, MASTER_BRANCH_SUCCESS, MASTER_BRANCH_FAILURE,
    MASTER_CALIST_REQUEST, MASTER_CALIST_SUCCESS, MASTER_CALIST_FAILURE

} from '../constants/actionType'

const cookies = new Cookies()
const authen  = cookies.get(config.cookies_config.name.authen, { path: config.cookies_config.path })
const AUTH_ID =  (authen && authen.Auth) ? `/${authen.Auth.EmployeeCode}` : ''

export const MASTER_REGION_FILTER = () => (

    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MASTER_REGION_URL}${AUTH_ID}`,
            method: 'GET',
            types: [
                MASTER_REGION_REQUEST,
                {
                    type: MASTER_REGION_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((resp) => { return resp })
                    }
                },
                MASTER_REGION_FAILURE
            ]
        }        
    })
)

export const MASTER_AREA_FILTER = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MASTER_AREA_URL}${AUTH_ID}`,
            method: 'GET',
            types: [
                MASTER_AREA_REQUEST,
                {
                    type: MASTER_AREA_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((resp) => { return resp })
                    }
                },
                MASTER_AREA_FAILURE
            ]
        }        
    })
)

export const MASTER_BRANCH_FILTER = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MASTER_BRANCH_URL}${AUTH_ID}`,
            method: 'GET',
            types: [
                MASTER_BRANCH_REQUEST,
                {
                    type: MASTER_BRANCH_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((resp) => {
                            let data = _.reject(resp, (o) => { return o.BranchCode == '000'  }) 
                            return data
                        })
                    }
                },
                MASTER_BRANCH_FAILURE
            ]
        }        
    })
)

export const MASTER_CALIST_FILTER = () => (
    (dispatch) => dispatch({
        [CALL_API]: {
            endpoint: `${MASTER_CALIST_URL}${AUTH_ID}`,
            method: 'GET',
            types: [
                MASTER_CALIST_REQUEST,
                {
                    type: MASTER_CALIST_SUCCESS,
                    payload: (_action, _state, res) => {
                        return res.json().then((resp) => { return resp })
                    }
                },
                MASTER_CALIST_FAILURE
            ]
        }        
    })
)