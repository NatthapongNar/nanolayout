import { Notification } from 'antd'
import _ from 'lodash'
import { 
    LAYOUT_EMP_TESTER_INFO_SUCCESS,
    LAYOUT_EMP_TESTER_INFO_FAILURE,

    LAYOUT_BRANCH_MARKET_INFO_REQUEST,
    LAYOUT_BRANCH_MARKET_INFO_SUCCESS,

    LAYOUT_CUSTOMER_INFO_REQUEST,
    LAYOUT_CUSTOMER_INFO_SUCCESS,
    
    LAYOUT_MARKETSHARE_CA_SUCCESS,
    LAYOUT_MARKETSHARE_CA_FAILURE,

    LAYOUT_MARKET_LOCKINFO_SUCCESS,
    LAYOUT_MARKET_LOCKINFO_FAILURE,

    LAYOUT_MARKET_LOCK_HANDLE_SUCCESS,
    LAYOUT_MARKET_LOCK_HANDLE_FAILURE
    
} from '../constants/actionType'

const initialState = { data: [], status: false, msg: '' }
const initialRespData = { data: [], status: false, loading: true, msg: '' }

export const GET_EMP_TESTER_INFO = (state = initialState, action) => {
    switch (action.type) {
        case LAYOUT_EMP_TESTER_INFO_SUCCESS:        
            return { data: action.payload, status: true, msg: 'load success' }
        case LAYOUT_EMP_TESTER_INFO_FAILURE:
            return { data: action.payload, status: true, msg: 'load falied' }
        default:
            return state
    }
}

export const GET_BRANCH_MARKET_PROFILE = (state = initialRespData, action) => {
    switch (action.type) {
        case LAYOUT_BRANCH_MARKET_INFO_REQUEST:
            return action.payload
        case LAYOUT_BRANCH_MARKET_INFO_SUCCESS:
            return action.payload
        default:
            return state
    }
}

export const GET_CUSTOMER_INFO = (state = initialState, action) => {
    switch (action.type) {
        case LAYOUT_CUSTOMER_INFO_REQUEST:
            return { data: [], status: false, msg: 'loading' }
        case LAYOUT_CUSTOMER_INFO_SUCCESS:        
            return { data: action.payload, status: true, msg: 'load success' }      
        default:
            return state
    }
}

export const GET_MARKETSHARE_CAINFO = (state = initialState, action) => {
    switch (action.type) {
        case LAYOUT_MARKETSHARE_CA_SUCCESS:        
            return { data: action.payload, status: true, msg: 'load success' }
        case LAYOUT_MARKETSHARE_CA_FAILURE:
            return { data: action.payload, status: true, msg: 'load falied' }
        default:
            return state
    }
}
 
export const GET_MARKET_LOCKINFO = (state = initialState, action) => {
    switch (action.type) {
        case LAYOUT_MARKET_LOCKINFO_SUCCESS:        
            return { data: action.payload, status: true, msg: 'load success' }
        case LAYOUT_MARKET_LOCKINFO_FAILURE:
            return { data: action.payload, status: true, msg: 'load falied' }
        default:
            return state
    }
}
 
export const GET_MARKET_LOCK_HANDLE = (state = initialState, action) => {
    switch (action.type) {
        case LAYOUT_MARKET_LOCK_HANDLE_SUCCESS:       
            Notification.success({
                message: 'แจ้งเตือนจากระบบ',
                description: 'ระบบบันทึกข้อมูลสำเร็จ กรุณารอสักครู่... เพื่อรีเซ็ตข้อมูลใหม่',
            })
        
            _.delay(() => { location.reload() }, 2000)

            return { data: action.payload, status: true, msg: 'load success' }
        case LAYOUT_MARKET_LOCK_HANDLE_FAILURE:
            return { data: action.payload, status: true, msg: 'load falied' }
        default:
            return state
    }
}
 