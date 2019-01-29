import { MKT_DETAIL_INFO } from '../../../constants/endpoints'

export const getMarketDetails = (param) => {
    const request_set = new Request(`${MKT_DETAIL_INFO}/mktcode/${param.marketcode}/initial/${param.authid}`, {
        method: 'GET',
        cache: 'no-cache'
    })

    return fetch(request_set).then(response => response.json())
}