import React, { Component } from 'react'
import CircularJSON from 'circular-json'
import { config } from '../config'

import {
    MARKET_GRIDSUMMARY_URL,
    GRID_CUSTINFO_GRID,
    CUST_MASTER_LIST,
    SALE_SUMMARY_CHART_URL,
    PORTFOLIO_QUALITY_CHART_URL,
    REGION_SUMMARY_URL,
    AREA_SUMMARY_URL,
    ZONE_SUMMARY_URL,
    BRNACH_SUMMARY_URL,
    KIOSK_SUMMARY_URL,
    MARKET_SUMMARY_URL,
    CA_SUMMARY_URL,
    CUSTOMER_GRIDSUMMARY_URL,
    CUSTOMER_WARNING_GRIDSUMMARY_URL,

    GET_SALE_SUMMARY_CHART_URL,
    GET_PORTFOLIO_QUALITY_CHART_URL

} from '../../../constants/endpoints'

const setHeader = new Headers({
    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
})

export const gridMarketAPI = (param) => {
    return fetch(`${MARKET_GRIDSUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => response.json())
}

export const gridCustomerAPI = (param) => {
    let header = {
        method: 'POST',
        credentials: 'same-origin',
        mode: 'cors',
        header: setHeader,
        body: CircularJSON.stringify(param),
        cache: 'no-cache',
        timeout: 5000000
    }

    return fetch(`${GRID_CUSTINFO_GRID}`, header).then(response => response.json())
}

export const gridCustomerEmpDropdown = (marketcode) => {
    const request_set = new Request(`${CUST_MASTER_LIST}/mktcode/${marketcode}`, {
        method: 'GET',
        cache: 'no-cache',
        timeout: 5000000
    })
    return fetch(request_set).then(response => response.json())
}

export const getSaleSummaryAPI = (param) => {
    const request_set = new Request(`${SALE_SUMMARY_CHART_URL}/mktcode/${param.MktCode}/initial/${param.AuthID}/salesummary`, {
        method: 'GET',
        cache: 'no-cache',
        timeout: 5000000
    })

    return fetch(request_set).then(response => response.json())
}

export const getPortfolioSummaryAPI = (param) => {
    const request_set = new Request(`${PORTFOLIO_QUALITY_CHART_URL}/mktcode/${param.MktCode}/initial/${param.AuthID}/portfolio`, {
        method: 'GET',
        cache: 'no-cache',
        timeout: 5000000
    })

    return fetch(request_set).then(response => response.json())
}

// NEW ON 01/11/2018
export const getSaleSummaryDashboardAPI = (param) => {
    return fetch(`${GET_SALE_SUMMARY_CHART_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })

}

export const getPortfolioSummaryDashboardAPI = (param) => {
    return fetch(`${GET_PORTFOLIO_QUALITY_CHART_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })

}
// END NEW ON 01/11/2018

export const gridRegionSummaryAPI = (param) => {
    return fetch(`${REGION_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })

}

export const gridAreaSummaryAPI = (param) => {
    return fetch(`${AREA_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridZoneSummaryAPI = (param) => {
    return fetch(`${ZONE_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridBranchSummaryAPI = (param) => {
    return fetch(`${BRNACH_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridKioskSummaryAPI = (param) => {
    return fetch(`${KIOSK_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridMarketSummaryAPI = (param) => {
    return fetch(`${MARKET_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridCASummaryAPI = (param) => {
    return fetch(`${CA_SUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000000
    })
    .then(response => {
        return {
            data: (response) ? response.json() : [],
            status: (response) ? response.status : false,
            msg: (response) ? response.statusText : 'falied'
        }
    })
}

export const gridCustomerByAuth = (param) => {
    return fetch(`${CUSTOMER_GRIDSUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => response.json())
}

export const gridCustomerByAuthWarning = (param) => {
    return fetch(`${CUSTOMER_WARNING_GRIDSUMMARY_URL}`, {
        method: 'POST',
        body: JSON.stringify(param),
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000000
    })
    .then(response => response.json())
}