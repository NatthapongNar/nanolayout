import { GRID_MAKET_INFO_SUCCESS } from '../constants/actionType'

const initialState = []
export default (state = initialState, action) => {
    switch (action.type) {
        case GRID_MAKET_INFO_SUCCESS:
            return action.payload
        default:
            return state
    }
}