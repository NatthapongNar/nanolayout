const URI_API = 'http://tc001pcis1p:8099/nanolayout_api/index.php/api'
const URI_NANO_API = 'http://TC001PCIS1P:60001'
const NANOLAYOUT_API = (process.env.NODE_ENV == 'dev') ? 'http://localhost:5090/nanolayout/api' : 'http://TC001PCIS1P:5090/nanolayout/api'

// NANO MANAGEMENT LAYOUT
export const LAYOUT_EMP_TESTER_INFO_URL = `${NANOLAYOUT_API}/layout/emp/tester`
export const LAYOUT_BRANCH_MARKET_INFO_URL = `${NANOLAYOUT_API}/layout/marketinfo`
export const LAYOUT_CUSTOMER_INFO_URL = `${NANOLAYOUT_API}/layout/custinfo`
export const LAYOUT_MARKETSHARE_CA_INFO_URL = `${NANOLAYOUT_API}/layout/camktshare`

export const LAYOUT_MARKETS_LOCKINFO_URL = `${NANOLAYOUT_API}/layout/lockinfo`
export const LAYOUT_MARKETS_LOCK_HANDLE_URL = `${NANOLAYOUT_API}/layout/mkt/lockhandle`

// NANO MANAGEMENT DASHBOARD
export const GRID_MKTINFO_GRID = `${URI_API}/marketinfo`
export const GRID_CUSTINFO_GRID = `${URI_API}/customerinfo`
export const GRID_OVERVIEW_GRID = `${URI_API}/overviewinfo`
export const MKT_CUSTOMER_LIST = `${URI_API}/loadCustomerList`
export const MKT_LAYOUTS_LIST = `${URI_API}/layouts`
export const MKT_MASTER_LIST = `${URI_API}/masterList`
export const MKT_DETAIL_INFO = `${URI_API}/nanomarketinfo`
export const CUST_MASTER_LIST = `${URI_API}/calist`
export const PORTFOLIO_QUALITY_CHART_URL = `${URI_API}/nanoportfolio`
export const SALE_SUMMARY_CHART_URL = `${URI_API}/nanosalesummary`

export const GET_PORTFOLIO_QUALITY_CHART_URL = `${URI_NANO_API}/nano/portfolioquality/chart`
export const GET_SALE_SUMMARY_CHART_URL = `${URI_NANO_API}/nano/salesummary/chart`

export const NANO_OK_FILTER = `${URI_NANO_API}/nano`
export const MASTER_REGION_URL = `${URI_NANO_API}/master/region`
export const MASTER_AREA_URL = `${URI_NANO_API}/master/area`
export const MASTER_BRANCH_URL = `${URI_NANO_API}/master/branch`
export const MASTER_CALIST_URL = `${URI_NANO_API}/master/calist`

export const LATEST_IMPORT_URL = `${NANOLAYOUT_API}/latest/import`
export const MASTER_NANOMANAGEMENT_FILTER_URL = `${NANOLAYOUT_API}/grid/filter/optional`

export const MARKET_GRIDSUMMARY_URL = `${NANOLAYOUT_API}/grid/market`
export const CUSTOMER_GRIDSUMMARY_URL = `${NANOLAYOUT_API}/grid/customer`
export const CUSTOMER_WARNING_GRIDSUMMARY_URL = `${NANOLAYOUT_API}/grid/customer/warning`
export const CUSTOMER_SUBGRIDSUMMARY_URL = `${NANOLAYOUT_API}/grid/custdetails`

export const REGION_SUMMARY_URL = `${NANOLAYOUT_API}/summary/region`
export const AREA_SUMMARY_URL = `${NANOLAYOUT_API}/summary/area`
export const ZONE_SUMMARY_URL = `${NANOLAYOUT_API}/summary/zone`
export const BRNACH_SUMMARY_URL = `${NANOLAYOUT_API}/summary/branch`
export const KIOSK_SUMMARY_URL = `${NANOLAYOUT_API}/summary/kiosk`
export const MARKET_SUMMARY_URL = `${NANOLAYOUT_API}/summary/market`
export const CA_SUMMARY_URL = `${NANOLAYOUT_API}/summary/ca`
export const MARKET_CAINFO_URL = `${NANOLAYOUT_API}/market/cadetails`