import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { withCookies } from 'react-cookie'
import { Table, Timeline, notification, Icon, Form, Row, Col, Input, InputNumber, Slider, TreeSelect, Select, Radio, Checkbox, Button, Collapse, Popover  } from 'antd'
import { in_array, str_replace, localStorageRead, roundFixed, numberWithCommas, largeNumberToShort, qs_parse } from '../../../containers/Layouts/function'
import { gridCustomerByAuth } from  '../../../containers/GridLayout/api'
import { customer_column_modal } from './columns/customer_column_modal'
import { CustomerSubList } from '../../../actions/grid_management'
import _ from 'lodash'

import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

const Option = Select.Option
const ButtonGroup = Button.Group

const MasterPageSize = [20, 40, 60, 80, 100, 200, 300]

class GridCustInquiry extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props

        this.state = {
            data: {
                source: [],
                progress: true
            },
            pagination: {
                size: 'small',
                pageSize: 20,
                showQuickJumper: false,
                pageInfo: null,
                showTotal: (total, range) => {
                    const { pagination } = this.state
                    let el_target = document.querySelector('.cust_number_length')
                    let locale_lang = (document.querySelector('sup[class^="market__sup_badge"]')) ? document.querySelector('sup[class^="market__sup_badge"]').innerHTML : locales.region_type
                    if (el_target) {
                        pagination.pageInfo = config.lang[locale_lang].grid.default.pagelabel_entroll(range[0], range[1], total)
                        if (el_target.innerHTML.length > 0) {
                            el_target.innerHTML = el_target.innerHTML.replace(el_target.innerHTML, pagination.pageInfo)
                        } else {
                            el_target.innerHTML = pagination.pageInfo
                        }
                        return pagination.pageInfo
                    }
                }
            }
        }

    }

    componentWillMount() {
        const qs = qs_parse(this.props.location.search)
        if(!_.isEmpty(qs) && !_.isEmpty(qs.UID)) {
            let auth_id = (!_.isEmpty(qs.UID) && qs.UID !== '') ? qs.UID : null
            let branch_code = (!_.isEmpty(qs.BR) && qs.BR !== '') ? qs.BR : null
            let market_code = (!_.isEmpty(qs.MKT) && qs.MKT !== '') ? qs.MKT : null
            let emp_code = (!_.isEmpty(qs.EID) && qs.EID !== '') ? qs.EID : null
            let cycle_day = (!_.isEmpty(qs.DAY) && qs.DAY !== '') ? qs.DAY : null
           
            let wdpd = (!_.isEmpty(qs.WDPD) && qs.WDPD !== '') ? qs.WDPD : null
            let mdpd = (!_.isEmpty(qs.MDPD) && qs.MDPD !== '') ? qs.MDPD : null
            let assign_request = (!_.isEmpty(qs.ASSIGN) && qs.ASSIGN !== '') ? qs.ASSIGN : null
            let assign_mode = null
            if(assign_request && in_array(assign_request, ['Y'])) {
                if(assign_request == 'Y') {
                    assign_mode = ',Assigned'
                } 
            }

            let assign_data = (assign_mode) ? assign_mode:''

            let optional = (!_.isEmpty(qs.FILTER) && qs.FILTER !== '') ? `${qs.FILTER},${cycle_day}${assign_data}` : `W0,W1,W2,W3,W4,XDay,M1,M2,${cycle_day}${assign_data}`
            
            let wdpd_start = null
            let wdpd_end = null

            let mdpd_start = null
            let mdpd_end = null

            var period_pattern 	   	    = new RegExp("-")
            var comma_pattern 	   	    = new RegExp(",")

            if(wdpd && !_.isEmpty(wdpd)) {
                if(period_pattern.test(wdpd)) {
                    let wdpd_items = wdpd.split("-")
                    wdpd_start = _.minBy(wdpd_items, (v) => parseInt(v))
                    wdpd_end = _.maxBy(wdpd_items, (v) => parseInt(v))
                } else if(comma_pattern.test(wdpd)) {
                    let wdpd_items = wdpd.split(",")
                    wdpd_start = _.min(wdpd_items, (v) => parseInt(v))
                    wdpd_end = _.max(wdpd_items, (v) => parseInt(v))
                } else {
                    wdpd_start = parseInt(wdpd)
                    wdpd_end = parseInt(wdpd)
                }                
            }

            if(mdpd && !_.isEmpty(mdpd)) {
                if(period_pattern.test(mdpd)) {
                    let mdpd_items = mdpd.split("-")
                    mdpd_start = _.minBy(mdpd_items, (v) => parseInt(v))
                    mdpd_end = _.maxBy(mdpd_items, (v) => parseInt(v))
                } else if(comma_pattern.test(mdpd)) {
                    let mdpd_items = mdpd.split(",")
                    mdpd_start = _.minBy(mdpd_items, (v) => parseInt(v))
                    mdpd_end = _.maxBy(mdpd_items, (v) => parseInt(v))
                   
                } else {
                    mdpd_start = parseInt(mdpd)
                    mdpd_end = parseInt(mdpd)
                }                
            }

            let npl = null
            if(!_.isEmpty(qs.NPL) && qs.NPL !== '') {
                if(qs.NPL == 'New') {
                    npl = 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'
                }
                if(qs.NPL == 'Old') {
                    npl = 'Existing'
                }
                optional = `W0,W1,W2,W3,W4,XDay,M1,M2,NPL,${cycle_day}${assign_data}`
            }
            
            
            let setParam = {
                AuthID: auth_id,
                MarketName: market_code,
                CustomerName: null,
                ApplicationNo: null,
                RegionID: null,
                AreaID: null,
                ZoneValue: null,
                BranchCode: branch_code,
                Employee: emp_code,
                AppDateType: null,
                AppDateFrom: null,
                AppDateTo: null,
                CycleDayFrom: null,
                CycleDayTo: null,
                OverdueFrom: wdpd_start,
                OverdueTo: wdpd_end,
                MonthOverdueFrom: mdpd_start,
                MonthOverdueTo: mdpd_end,         
                Topup: 'Y,N',
                Product: 'Nano,Micro',
                Isactive: 'Y',
                NPLFlag: npl,
                Optional: optional,
                ModeType: 'Collect'
            }

            this.handleLoadCustomerList(setParam)

        }
    }

    // SET HASH KEY OF RECORD FOR UNIQUE ROWS
    handleRowKey = (records, i) => { 
        let charecter_alpha = this.handleRandomString()
        let randomnumber = Math.floor(Math.random() * (1000 - 10 + 1)) + (i+1)
        let hasRowKey = `${(records) ? records.ApplicationNo:records.CitizenID}_${charecter_alpha}_${randomnumber}_${(i+1)}_${moment().format('mmss')}` 

        records.Key = hasRowKey

        return hasRowKey
    }

    handleRandomString() {
        var text = ""
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for(var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }

    render() {
        const { data, pagination } = this.state

        return (
            <div className={`${cls['customer_modal']}`}>
                <div className={`${cls['grid_customer']}`}>
                    <h2 className={`${cls['grid_title']} ttu tc`}>Customer Information</h2>
                    { this.handleCustomerHeadFilter() }
                    <Table
                        rowKey={this.handleRowKey}
                        columns={customer_column_modal}
                        dataSource={data.source}
                        loading={data.progress}
                        footer={this.handleCustomerFooter}
                        pagination={{ ...pagination }}
                        className={`mt2`}
                        bordered
                    />
                </div>
            </div>
        )
    }

    //SET HEAD PANEL
    handleCustomerHeadFilter = () => {
        const { pagination } = this.state
        const { config, locales } = this.props

        return (
            <div className={`${cls['search_collapse_conainer']}`}>
                <div style={{ position: 'relative' }}>
                    <div className={cls['page_container']}>
                        <label>
                            {config.lang[locales.region_type].grid.default.pagelabel_length}
                            <Select className={cls['page_sizenumber']} defaultValue={`${pagination.pageSize}`} size="small" onChange={this.handlePageChange}>
                                {
                                    _.map(MasterPageSize, (v, i) => {
                                        return (<Option key={(i + 1)} value={`${v}`}>{`${v}`}</Option>)
                                    })
                                }
                            </Select>
                            {config.lang[locales.region_type].grid.default.pagelabel_entries}
                        </label>
                        <div className="cust_number_length"></div>
                    </div>
                </div>
                <div></div>                
            </div>            
        )

    }

    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    // SET FOOTER
    handleCustomerFooter = (currentPageData) => {
        const { data } = this.state
        const { config, locales } = this.props

        const lang_field_default = config.lang[locales.region_type].grid.default
        const parentTable = document.querySelector(`.${cls['grid_customer']}`)
        const default_class = ['ttu tl', 'tl', 'tl', 'tc', 'tc', 'tc', 'tc', 'tl', 'tc', 'tc', 'tr', 'tc', 'tc', 'tr', 'tr', 'tr', 'tc', 'tr', 'tr', 'tc', 'tc', 'tc', 'tr', 'tr', 'tr', 'tr', 'tr', 'tl', 'tc'] 
        
        const short_numtodigit = 8
        if(parentTable) {
            let grid_size = []
            _.forEach(default_class, (v, i) => { 
                let el_target = $(parentTable.querySelector(`.mktcol_modal_${i}`)).outerWidth(true)
                let width_outer = (el_target && !isNaN(el_target)) ? el_target : null
                if(width_outer) {
                    grid_size.push(width_outer)
                }
            })

            let principle_start = roundFixed(_.sumBy(currentPageData, 'PrincipleStart'), 0)
            let principle_now = roundFixed(_.sumBy(currentPageData, 'Principle'), 0)

            let principle_allstart = roundFixed(_.sumBy(data.source, 'PrincipleStart'), 0)
            let principle_allnow = roundFixed(_.sumBy(data.source, 'Principle'), 0)

            let total_os_start = (principle_start && principle_start > 0) ? numberWithCommas(principle_start) : 0

            // CURRENT PAGE
            let footer_summary = { 
                cur: {
                    0: lang_field_default.footer.page_title,
                    11: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Limit'), 0), short_numtodigit)),
                    13: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Principle'), 0), short_numtodigit)),
                    18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Week_Installment'), 0), short_numtodigit)),
                    19: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Mth_Installment'), 0), short_numtodigit)),
                    24: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'OverdueAmt'), 0), short_numtodigit)),
                    25: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Mth_AmtPastDue'), 0), short_numtodigit)),
                    26: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'LastPaymentAmt'), 0), short_numtodigit))
                },
                all: {
                    0: lang_field_default.footer.total_title,
                    11: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Limit'), 2), 8, 2)),
                    13: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Principle'), 2), 8, 2)),
                    18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Week_Installment'), 2), 8, 2)),
                    19: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_Installment'), 0), short_numtodigit)),
                    24: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'OverdueAmt'), 0), short_numtodigit)),
                    25: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_AmtPastDue'), 0), short_numtodigit)),
                    26: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'LastPaymentAmt'), 0), short_numtodigit))
                }                  
            }

            let overview_os = 0.00
            _.forEach(data.source, (v) =>{ 
                if(v.PrincipleStart && v.PrincipleStart > 0.00) {
                    overview_os = overview_os + parseFloat(v.PrincipleStart)
                } else {
                    overview_os = overview_os + v.Principle
                }
            })

            if(grid_size && grid_size.length > 0) {
                return (
                    <div className={`${cls['grid_customer_footer']} ${(data.progress) ? cls['hide'] : ''}`}>
                        <div className={cls['footer_customer_partition']}>
                            { 
                                _.map(grid_size, (size, i) => {
                                    if(i == 1) size = size + 0


                                    let os_start = (principle_start && principle_start > 0) ? principle_start : 0
                                    let os_bal = (principle_now && principle_now > 0) ? principle_now : 0

                                    let cur_row = (footer_summary.cur[i] && !_.isEmpty(footer_summary.cur[i])) ? footer_summary.cur[i] : ''

                                    let diff_os = 0
                                    if((i+1) == 14) {
                                        diff_os = os_start - os_bal
                                    }

                                    let content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (total_os_start) ? `${total_os_start} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)

                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? `${cls['strnorap']} ${cls['br0']}`:''}`} style={{ width: size, maxWidth: size }}>
                                            {
                                                ((i+1) == 14) ? (<Popover content={content}>{`${(cur_row && cur_row !== '') ? cur_row : ''}`}</Popover>) : cur_row
                                            }
                                        </div>
                                    )    
                                })
                            }  
                        </div>
                        <div className={cls['footer_customer_partition']}>
                            { 
                                _.map(grid_size, (size, i) => {
                                    if(i == 1) size = size + 0     

                                    let os_start = (principle_allstart && principle_allstart > 0) ? principle_allstart : 0
                                    let os_bal = (principle_allnow && principle_allnow > 0) ? principle_allnow : 0

                                    let all_row = (footer_summary.all[i] && !_.isEmpty(footer_summary.all[i])) ? footer_summary.all[i] : ''

                                    let diff_os = 0
                                    if((i+1) == 14) {
                                        diff_os = os_start - os_bal
                                    }

                                    let content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (overview_os) ? `${numberWithCommas(roundFixed(overview_os, 0))} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)

                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? cls['strnorap']:''}`} style={{ width: size, maxWidth: size }}>
                                        {   
                                             ((i+1) == 14) ? (<Popover content={content}>{`${(all_row && all_row !== '') ? all_row : ''}`}</Popover>) : all_row
                                        }
                                        </div>
                                    )
                                })
                            }  
                        </div>
                    </div>
                ) 
            } else {
                return (<div className={`${cls['grid_customer_footer']}`}></div>)
            }

        } else {
            return (<div className={`${cls['grid_customer_footer']}`}></div>)
        }
    }

    handleUpdateNote = (params) => {
        let { data } = this.state
        
        _.assign(
            _.filter(data.source, { ApplicationNo: params.ApplicationNo })[0],
            {
                LatestCustTopic: params.Subject,
                LatestCustReason: params.Reason,
                LatestCustNote: params.Remark,
                LatestUpdateEmpName: params.CreateBy,
                LatestUpdateEmpDate: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        )

        this.setState({ data: data })
        
    }

    // API - LOAD CUSTOMER DATA
    handleLoadCustomerList = (param, auth_id, search = false) => {
        const { handleOverdue } = this.state
        const { masters, config, locales, form, GET_CUSTINFO_SUBGRID } = this.props

        GET_CUSTINFO_SUBGRID(param)

        let getCustSubData = setInterval(() => {
            if(!_.isEmpty(this.props.cust_subgrid)) {
                clearInterval(getCustSubData)
                
                gridCustomerByAuth(param).then(resp => {
                    if(!_.isEmpty(resp.code) && in_array(resp.code, ['ETIMEOUT', 'EREQUEST'])) {
                        notification.error({
                            icon: (<Icon type="disconnect" />),
                            message: config.lang[locales.region_type].notification.timeout.title,
                            description:  config.lang[locales.region_type].notification.timeout.desc,
                            placement: 'topRight',
                            duration: 5
                        })
                    }
    
                    if(resp && resp.length > 0) {
                        const { cust_subgrid } = this.props
                       
                        _.map(resp, (v) => {
                            v.isMktLayout = { view: true, edit: false }
                            v.handleUpdateNote = this.handleUpdateNote

                            let item_child = _.filter(cust_subgrid, { CIFNO: v.CIFNO })
                            if(!_.isEmpty(item_child) && item_child.length > 1) {
                                v.children = item_child
                            }
                        })

                        this.setState({ data: { source: resp, progress: false, auto: false } })

                    } else {
                        this.setState({ data: { source: [], progress: false, auto: false } })
                    }

                    
                })
                
            }

        }, 1000)
    
    }


}

const GridCustInquiryWithCookies = withCookies(GridCustInquiry)
const GridCustInquiryManagement = Form.create()(GridCustInquiryWithCookies)
export default withRouter(connect(
    (state) => ({
        cust_subgrid: state.customer_subgrid_info
    }),
    { 
        GET_CUSTINFO_SUBGRID: CustomerSubList 
    }
)(GridCustInquiryManagement))