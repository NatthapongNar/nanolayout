import _ from 'lodash'
import { MASTER_SUCCESS, MASTER_REGION_SUCCESS, MASTER_AREA_SUCCESS, MASTER_BRANCH_SUCCESS, MASTER_CALIST_SUCCESS } from '../constants/actionType'


const initialState = {}
export default (state = initialState, action) => {   
    switch (action.type) {
        case MASTER_SUCCESS:
            if (global.localStorage) global.localStorage.setItem('nanolayout_master', JSON.stringify({ ['master']: action.payload }))        
            return action.payload
        case MASTER_REGION_SUCCESS:
            return _.merge(state, { region: (action.payload[0] && action.payload[0].length > 0) ? action.payload[0]:[] })
        case MASTER_AREA_SUCCESS:
            return _.merge(state, { area: (action.payload && action.payload.length > 0) ? action.payload:[] })
        case MASTER_BRANCH_SUCCESS:
            return _.merge(state, { branch: (action.payload && action.payload.length > 0) ? action.payload:[] })
        case MASTER_CALIST_SUCCESS:    
            if (global.localStorage) global.localStorage.setItem('nanolayout_master', JSON.stringify({ ['master_calist']: action.payload }))
            return _.merge(state, { calist: (action.payload && action.payload.length > 0) ? action.payload:[] })
        default:        
            return state
    }
}