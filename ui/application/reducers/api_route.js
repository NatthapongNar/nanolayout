import React from 'react'
import { notification } from 'antd'
import { 
    GRID_SUBGRID_CUSTINFO_SUCCESS,
    SUCCESS_LATEST_IMPORT,
    MASTER_FILTER_OPTIONAL_SUCCESS
    
} from '../constants/actionType'

const initialState = []

export const customer_subgrid_info = (state = initialState, action) => {
    switch (action.type) {
        case GRID_SUBGRID_CUSTINFO_SUCCESS:          
            return action.payload
        default:
            return state
    }
}

export const latest_import_info = (state = initialState, action) => {
    switch (action.type) {
        case SUCCESS_LATEST_IMPORT:     
            let data = (action.payload && action.payload.length > 0) ? action.payload[0] : null
            if(data && data.IsCompleted == 'N') {
                notification.warning({
                    message: <b><u>แจ้งเตือนจากระบบ</u></b>,                
                    description: (
                        <div>
                            ขออภัย, ข้อมูลอาจมีความคลาดเคลื่อน เนื่องจากการนำเข้าข้อมูลขัดข้องหรือข้อมูลไม่สมบูรณ์จากต้นทาง ทางทีมกำลังรีบดำเนินการแก้ไขและประสานงานทีมที่เกี่ยวข้อง...<br/><br/>
                            <b><u>หมายเหตุ:</u></b> ข้อความนี้จะแสดงเมือการนำเข้าข้อมูลมีข้อผิดพลาดหรือไม่สมบูรณ์เท่านั้น 
                        </div>
                    ),
                    duration: 0,
                    placement: 'topRight'
                })
            }
            return action.payload
        default:
            return state
    }
}

export const nano_dashboard_filter_option = (state = initialState, action) => {
    switch (action.type) {
        case MASTER_FILTER_OPTIONAL_SUCCESS:
            return action.payload
        default:
            return state
    }
}