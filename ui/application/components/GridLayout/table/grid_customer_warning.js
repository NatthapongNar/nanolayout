import React, { Component } from 'react'
import { connect } from 'react-redux';
import moment from 'moment'
import { withCookies } from 'react-cookie'
import { DatePicker, Table, Modal, Timeline, notification, Icon, Form, Row, Col, Input, InputNumber, Slider, TreeSelect, Select, Radio, Checkbox, Button, Collapse, Popover  } from 'antd'
import { in_array, localStorageRead, roundFixed, numberWithCommas, largeNumberToShort } from '../../../containers/Layouts/function'
import { gridCustomerByAuthWarning } from  '../../../containers/GridLayout/api'
import { customer_column_modal } from './columns/customer_column_warning'
import { CustomerSubList } from '../../../actions/grid_management'

import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

const MasterPageSize = [20, 40, 60, 80, 100, 200, 300]

class CustomerWarningDashboard extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props

        this.state = {
            data: {
                source: [],
                progress: false
            },
            market_list: [],
            filters: {
                AuthID: null,
                MarketCode: null,
                CustomerName: null,
                ApplicationNo: null,
                ViewType: null,
                Topup: ['Y','N'],
                Product: ['Nano','Micro'],
                RegionID: null,
                AreaID: null,
                ZoneValue: null,
                BranchCode: null,
                KioskCode: null,
                EmployeeCode: null,               
                AppDateFrom: null,
                AppDateTo: null,
                CycleDayFrom: null,
                CycleDayTo: null,
                OverdueType: null,
                OverdueFrom: null,
                OverdueTo: null,
                Optional: null,
                Isactive: 'Active'
            },
            handleDPD: false,
            handleWDPD: false,
            handleMDPD: false,
            OverdueTypes: {
                WDPD: false,
                MDPD: false
            },
            handleOldNPL: false,
            handleExpend: false,
            expandedKeys: [],
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

    componentWillReceiveProps(props) {
        if(props) {
            const { filters }  = this.state
            const { modal, modeType } = props

            // AUTO - LOAD WARNING DASHBOARD 
            if(modal.warning) {
               if((!filters.AuthID || filters.AuthID !== modeType.auth)) {
                    let data_filter = _.assignIn({}, this.state.filters, { ModeType: modeType.mode })
                    this.handleLoadCustomerList(data_filter, modeType.fullauth, false)
               }

            }
            
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

    handleClose = () => {
        const { onModalClose } = this.props
        onModalClose()
    }

    render() {
        const { data, pagination } = this.state
        const { modal } = this.props

        return (
             <Modal 
                    title="Customer Information"
                    visible={modal.warning}
                    footer={null}
                    onCancel={this.handleClose}                   
                    className={`${cls['customer_modal']}`}
                    maskClosable={false}
                    width="100%"
                >
                    { this.handleCustomerHeadFilter() }

                    <div className={`${cls['grid_customer']}`}>
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

                </Modal>
        )
    }

    // API - LOAD CUSTOMER DATA
    handleLoadCustomerList = (param, auth_id, search = false) => {
        const { handleOverdue } = this.state
        const { masters, config, locales, form, GET_CUSTINFO_SUBGRID } = this.props

        let area_selected = []
        let zone_selected = []

        if(param.Area && param.Area.length > 0) {
            let pattern 	  = new RegExp("-")
            _.forEach(param.Area, (data) => {
                let check_pattern = pattern.test(data)
                if(!check_pattern) {
                    area_selected.push(data)

                    if(!_.isEmpty(masters.area)) {
                        let objData = _.filter(masters.area, { AreaID: data })
                        if(!_.isEmpty(objData) && objData.length > 0) {
                            _.forEach(objData, (zone) => { zone_selected.push(zone.ZoneValue) })
                        }  
                    }

                } else {
                    let item      = data.split("-");
                    let item_data = item[0].trim();
                    area_selected.push(item_data)
                    zone_selected.push(data)
                }                      
            })
        }

        let uniq_area_selected = _.uniq(area_selected)
        let uniq_zone_selected =  _.uniq(zone_selected)

        let topup_list = null
        if(param.TopupStatus) {
            if(_.isArray(param.TopupStatus)) 
                topup_list = param.TopupStatus
            else
                topup_list = param.TopupStatus.split(',')
        }

        let product_list = null
        if(param.Product) {
            if(_.isArray(param.Product)) 
                product_list = param.Product
            else
                product_list = param.Product.split(',')
        }

        let option_list = null
        if(param.Optional) {
            if(_.isArray(param.Optional)) 
                option_list = param.Optional
            else
                option_list = param.Optional.split(',')
        }

        let select_new_npl = null
        if(param.NPLFlag) {
            if(_.isArray(param.NPLFlag)) 
                select_new_npl = param.NPLFlag
            else
                select_new_npl = param.NPLFlag.split(',')
        }

        // let enable_checkDPD = in_array('Collect', form.getFieldValue('ViewType')) ? true : false
        
        let setParam = {
            AuthID: auth_id,
            MarketName: (param.MarketName && param.MarketName.length > 0) ? param.MarketName.join(',') : null,
            CustomerName: (param.CustomerName && param.CustomerName !== '') ? param.CustomerName : null,
            ApplicationNo: (param.AppNo && param.AppNo !== '') ? param.AppNo : null,
            RegionID: (param.Region && param.Region.length > 0) ? param.Region.join(',') : null,
            AreaID: (uniq_area_selected && uniq_area_selected.length > 0) ? uniq_area_selected.join(',') : null,
            ZoneValue: (uniq_zone_selected && uniq_zone_selected.length > 0) ? uniq_zone_selected.join(',') : null,
            BranchCode: (param.Branch && param.Branch.length > 0) ? param.Branch.join(',') : null,
            EmployeeCode: (param.Employee && param.Employee.length > 0) ? param.Employee.join(',') : null,
            CustomerName: (param.CustomerName && param.CustomerName !== '') ? param.CustomerName : null,
            // AppDateType: (param.dateType && param.dateType !== '' && param.AppRange && param.AppRange.length > 0) ? param.dateType : null,
            // AppDateFrom: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[0]).format('YYYY-MM-DD') : null,
            // AppDateTo: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[1]).format('YYYY-MM-DD') : null,
            // CycleDayFrom: (param.DayRange && param.DayRange.length > 0) ? param.DayRange[0] : null,
            // CycleDayTo: (param.DayRange && param.DayRange.length > 0) ? param.DayRange[1] : null,
            // OverdueFrom:(this.state.handleWDPD) ? param.OverdueFrom1 : null,
            // OverdueTo: (this.state.handleWDPD) ? param.OverdueFrom2 : null,
            // MonthOverdueFrom: (this.state.handleMDPD) ? param.OverdueTo1 : null,
            // MonthOverdueTo: (this.state.handleMDPD) ? param.OverdueTo2 : null,         
            // Topup: (topup_list && topup_list.length > 0) ? topup_list.join(',') : null,
            // Product: (product_list && product_list.length > 0) ? product_list.join(',') : null,
            Isactive: 'Active',
            // NPLFlag: (enable_checkDPD && select_new_npl && select_new_npl.length > 0) ? select_new_npl.join(','): null,
            // Optional: (param.ModeType && param.ModeType !== '') ? param.ModeType : null,
            ModeType: 'Collect',
            WarningCriteria: (param.ModeType && param.ModeType !== '') ? param.ModeType : null
        }

        this.setState({ data: _.assignIn({}, this.state.data, { progress: true }), filters: _.assignIn({}, this.state.filters, setParam) })

        GET_CUSTINFO_SUBGRID(_.assignIn({}, this.state.filters, setParam))

        let getCustSubData = setInterval(() => {
            if(!_.isEmpty(this.props.cust_subgrid)) {
                // CLEAR RECALL
                clearInterval(getCustSubData)
                
                gridCustomerByAuthWarning(this.state.filters).then(resp => {
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
                     
                        _.map(resp, (v, i) => {
                            let item_child = _.filter(cust_subgrid, { CitizenID: v.CitizenID })
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

    //SET HEAD PANEL
    
    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }
    
    handleCustomerHeadFilter = () => {
        const { handleExpend, pagination } = this.state
        const { config, locales } = this.props

        return (
            <div className={`${cls['search_collapse_conainer']}`} style={{ marginTop: '20px' }}>
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

                    <span className="fa-stack fa-lg fr pointer" onClick={this.handleTableCollapse} style={{ display: 'none' }}>
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className={`fa ${(!handleExpend) ? 'fa-expand':'fa-compress'} fa-stack-1x fa-inverse`} style={{ transform: 'rotate(-45deg)' }}></i>
                    </span>

                </div>
                <div>&nbsp;</div>                
            </div>            
        )

    }

    // SET FOOTER
    handleCustomerFooter = (currentPageData) => {
        const { data } = this.state
        const { config, locales } = this.props

        const lang_field_default = config.lang[locales.region_type].grid.default
        const parentTable = document.querySelector(`.${cls['grid_customer']}`)
        const default_class = ['ttu tl', 'tl', 'tl', 'tc', 'tc', 'tc', 'tl', 'tc', 'tc', 'tr', 'tc', 'tc', 'tr', 'tr', 'tr', 'tc', 'tr', 'tr', 'tc', 'tc', 'tc', 'tr', 'tr', 'tr', 'tr', 'tr', 'tl']

        const short_numtodigit = 8
        if(parentTable) {

            let grid_size = []
            _.forEach(default_class, (v, i) => { 
                let el_target = $(parentTable.querySelector(`.warningcol_${i}`)).outerWidth(true)
                let width_outer = (el_target && !isNaN(el_target)) ? el_target : null
                if(width_outer) {
                    grid_size.push(width_outer)
                }
            })

            // CURRENT PAGE
            let footer_summary = { 
                cur: {
                    0: lang_field_default.footer.page_title,
                    10: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Limit'), 0), short_numtodigit)),
                    12: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Principle'), 0), short_numtodigit)),
                    17: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Week_Installment'), 0), short_numtodigit)),
                    18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Mth_Installment'), 0), short_numtodigit)),
                    23: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'OverdueAmt'), 0), short_numtodigit)),
                    24: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Mth_AmtPastDue'), 0), short_numtodigit)),
                    25: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'LastPaymentAmt'), 0), short_numtodigit))
                },
                all: {
                    0: lang_field_default.footer.total_title,
                    10: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Limit'), 2), 8, 2)),
                    12: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Principle'), 2), 8, 2)),
                    17: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Week_Installment'), 2), 8, 2)),
                    18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_Installment'), 0), short_numtodigit)),
                    23: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'OverdueAmt'), 0), short_numtodigit)),
                    24: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_AmtPastDue'), 0), short_numtodigit)),
                    25: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'LastPaymentAmt'), 0), short_numtodigit))
                }                  
            }

            if(grid_size && grid_size.length > 0) {
                return (
                    <div className={`${cls['grid_customer_footer']} ${(data.progress) ? cls['hide'] : ''}`}>
                        <div className={cls['footer_customer_partition']}>
                            { 
                                _.map(grid_size, (size, i) => {
                                    if(i == 1) size = size + 0

                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? cls['strnorap']:''} ${(i==0) ? `${cls['strnorap']} ${cls['br0']}`:''}`} style={{ width: size, maxWidth: size }}>{(footer_summary.cur[i] && !_.isEmpty(footer_summary.cur[i])) ? footer_summary.cur[i] : ''}</div>
                                    )    
                                })
                            }  
                        </div>
                        <div className={cls['footer_customer_partition']}>
                            { 
                                _.map(grid_size, (size, i) => {
                                    if(i == 1) size = size + 0                                      
                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? cls['strnorap']:''}`} style={{ width: size, maxWidth: size }}>{(footer_summary.all[i] && !_.isEmpty(footer_summary.all[i])) ? footer_summary.all[i] : ''}</div>
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

}


const gridCustomeWarningrDashboardWithCookies = withCookies(CustomerWarningDashboard)
const GridCustomerWarningManagement = Form.create()(gridCustomeWarningrDashboardWithCookies)
export default connect(
    (state) => ({
        cust_subgrid: state.customer_subgrid_info
    }),
    {
        GET_CUSTINFO_SUBGRID: CustomerSubList
    }
)(GridCustomerWarningManagement)