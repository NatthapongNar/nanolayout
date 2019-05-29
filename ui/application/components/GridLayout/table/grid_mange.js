import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withCookies } from 'react-cookie'
import { Table, Icon, Form, Row, Col, Tooltip, TreeSelect, Select, Radio, Checkbox, Button, Collapse, Popover, Modal, notification } from 'antd'
import { createElement, localStorageRead, numValid, roundFixed, parseTotalAccount, in_array } from '../../../containers/Layouts/function'
import { performance_columns, collection_columns, port_assign_columns, flow_columns } from './columns/overview_column'
import {
    gridRegionSummaryAPI,
    gridAreaSummaryAPI,
    gridZoneSummaryAPI,
    gridBranchSummaryAPI,
    gridKioskSummaryAPI,
    gridMarketSummaryAPI,
    gridCASummaryAPI,
    gridMarketCASummaryAPI,
    getSaleSummaryDashboardAPI, 
    getPortfolioSummaryDashboardAPI

} from '../../../containers/GridLayout/api'
import { latestDateImport, getNanoManagementOptionFilter } from '../../../actions/grid_management'

import { PortfolioChart, SaleSummaryChart } from '../dashboard/nano_ok/'
import Loader from '../loader'

import CustomerDashboard from './grid_customer_modal'
import CustomerWarningDashboard from './grid_customer_warning'

import bluebird from 'bluebird'

import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const CheckboxGroup = Checkbox.Group
const ButtonGroup = Button.Group
const Panel = Collapse.Panel

const gutter_init = 10
const tree_config = {
    size: 'large',
    treeCheckable: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    dropdownMatchSelectWidth: false,
    style: { width: '100%' }
}

const sequence_no = ['RegionID', 'AreaID', 'ZoneValue', 'BranchType']
const MasterPageSize = [20, 40, 60, 80, 100, 200, 300]
const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)

const update_feature = (
    <div className={cls['feature']} style={{ padding: '10px', background: '#FFF', color: 'black', height: '400px', fontSize: '1em', overflow: 'scroll' }}>
        <h4 className="ttu"><b>Feature update</b></h4>
        <div><b>Version Version 1.2.1 <small className="tr fr">(09 Feb 2019)</small></b></div>
        <div>1. เพิ่ม Column New Booking ใหม่ในโหมด Port Quality</div>
        <div>2. ปรับปรุงระบบข้อความจากระบบ Tablet ใหม่</div>
        <div>3. เพิ่มโหมดการดู Inactive, และ All ในหน้า Customer Info</div>
        <div>4. แก้ไขปัญหาภายในระบบและปรับปรุงระบบข้อมูลใหม่</div>      
        <div><b>Version Version 1.2.0 <small className="tr fr">(07 Dec 2018)</small></b></div>
        <div>1. เพิ่ม Add Note ในหน้า Customer Info.</div>
        <div>2. ปรับปรุงข้อมูลในหน้า Customer Info</div>
        <div><b>Version Version 1.1.3 <small className="tr fr">(15 Nov 2018)</small></b></div>
        <div>1. เพิ่ม Priority Columns ในหน้า Customer Info.</div>
        <div>2. เพิ่ม Priority Filters ในหน้า Customer Info</div>
        <div><b>Version Version 1.1.2 <small className="tr fr">(07 Nov 2018)</small></b></div>
        <div>1. เพิ่ม E3, E5 ในระบบ Nano Management Dashboard</div>
        <div>2. เพิ่ม Stop Approved ของ Branch (แจ้งเตือนเบื้องต้น, ยังไม่สามารถ Sort หรือ filter ได้)</div>
        <div>3. ปรับปรุง Tooltip ของ Employee Name </div>
        <div><b>Version Version 1.1.1</b></div>
        <div>1. เพิ่ม Grand Footer</div>
        <div>2. เพิ่ม Modal Jumper สำหรับดูข้อมูลตาม Warning and Stop Criteria</div>
        <b>Version Version 1.1.0</b>
        <div>1. เพิ่ม New summary (Kiosk, Market)</div>
        <div>2. เพิ่ม Filter ใหม่สำหรับใช้ในการบริหารจัดการหน้า Nano Management Dashboard</div>
        <b>Version 1.0.8.3 - 1.0.8.5</b>
        <div>1. เพิ่มข้อมูล Contact ในหน้า Customer Info. (รูปแบบ Tooltip)</div>
        <div>2. เพิ่ม Filter New NPL, Existing NPL (Old NPL)</div>
        <div>3. แก้ไขข้อมูลผลรวม Mth amount pass due</div>
        <b>Version 1.0.8.2</b>
        <div>1. เพิ่มข้อมูล Payment Succuss ในโหมด Port Quality</div>
        <div>2. เพิ่มข้อมูล New NPL 2018 ในโหมด Port Quality</div>
        <b>Version 1.0.8</b>
        <div>1. ปรับปรุงประสิทธิภาพในการโหลดข้อมูล Nano Management Dashboard</div>
        <div>2. ปรับปรุง Stop Approved, Warning ระดับ CA, Branch</div>
        <div>3. ปรับปรุง Filter ในหน้า Customer Info.</div>
        <div>4. เพิ่ม Filter ใหม่ แยกข้อมูล สามารถแยกข้อมูลขาปล่อยและขาเก็บได้<br/>ในหน้า Customer Info.</div>
        <div>5. แก้ไขปัญหาบัคอื่นๆ เล็กน้อย</div>
        <b>Version 1.0.7</b>
        <div>1. เปิด Total Root Summary</div>
        <div>2. ปรับแก้ไขคอลัมน์ในหน้า Preview Customer Information</div>
        <b>Version 1.0.6</b>
        <div>1. แก้ไขข้อความผิด</div>
        <div>2. ปรับแก้ไขคอลัมน์ ในหน้า Customer Info.</div>
        <div>3. เพิ่มคอลัมน์ Overdue Day และเพิ่มส่วน Filter Overdue Day ในหน้า Customer Info.</div>
        <div>4. เพิ่ม Tooltip ใน DPD Bucket Start, Now และ Overdue Day ในหน้า Customer Info.</div>
        <div>5. เพิ่ม Target บนคอลัมน์ของ Portfolio และ Flow Rate</div>
        <div>6. Help Info ในหน้า Customer Info.</div>
        <b>Version 1.0.5</b>
        <div>1. แก้ไขปัญหาบัคในระบบ</div>
        <div>2. แก้ไขปัญหาจากการ sort ข้อมูลในหน้า Customer Info.</div>
        <div>3. เพื่ม Optional Filter เรื่อง Start DPD Bucket</div>
        <div>4. เพิ่ม Filter Day Range</div>
        <b>Version 1.0.0 - 1.0.4</b>
        <div>- แก้ไขปัญหาในระบบ</div>
    </div>
)

class GridMangement extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props
        const { Auth } = this.props.authen
        
        this.state = {
            search: false,
            searchContent: false,
            modal: {
                auth: null,
                customer: false,
                portfolio: false,
                warning: false,
                portfolio_summary_chart: false,
                sale_summary_chart: false
            },
            wariningCriteria: {
                auth: null,              
                fullauth: null,
                mode: null
            },
            nanoChartCriteria: {
                auth: null,              
                fullauth: null,
                dataItems: null
            },
            dataSoruce: [],
            dataAssignPort: [],
            progress: false,
            loadAuto: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['AM', 'ZM', 'TM', 'CA', 'PCA'])) ? true : false,
            handle_field: {
                region: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['RD', 'AM', 'ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                area: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                zone: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                branch: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['TM', 'CA', 'PCA'])) ? true : false,
                ca: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['CA', 'PCA'])) ? true : false
            },
            filters: {
                AuthID: (Auth && Auth.EmployeeCode) ? Auth.EmployeeCode : null,
                Region: null,
                Area: null,
                Zone: null,
                Branch: null,
                Kiosk: null,
                Employee: null,
                WorkingDateFrom: null,
                WorkingDateTo: null,
                Optional: null
            },
            expandedRowKeys: [],
            expandedAllKeys: [],
            handleBaseAPI: 'CA',
            mode: 'Performance',
            pagination: {
                size: 'small',
                pageSize: 20,
                showQuickJumper: true,
                pageInfo: null,
                showTotal: (total, range) => {
                    const { pagination } = this.state
                    let el_target = document.querySelector('.number_length')
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
        const { authen, cookies, config, GET_LATESTIMPORT, GET_OPTION_FILTER } = this.props

        const ck_config = config.cookies_config
        const ck_authen = cookies.get(ck_config.name.authen, { path: ck_config.path })

        const ckset_filter = (ck_authen.Auth && ck_authen.Auth.EmployeeCode) ? { AuthID: ck_authen.Auth.EmployeeCode } : null
        const propset_filter = (authen.Auth && authen.Auth.EmployeeCode) ? { AuthID: authen.Auth.EmployeeCode } : null

        let set_filter = (propset_filter) ? propset_filter : ckset_filter
        if (set_filter) {
            let filterState = _.assignIn({}, this.state.filters, set_filter)
            this.setState({ filter: filterState })

            if (this.state.loadAuto) {
                this.setState({ progress: true })
                this.handleOverviewSummary(filterState)
            }

            let api_launch = [GET_LATESTIMPORT, GET_OPTION_FILTER]
            bluebird.all(api_launch).each(fn => fn())

        }
    }

    componentDidMount() {
        if(moment().format('YYYY-MM-DD HH:mm') >= moment().format('YYYY-MM-DD 09:30') && moment().format('YYYY-MM-DD HH:mm') <= moment().format('YYYY-MM-DD 10:00')) {
            if(moment().format('YYYY-MM-DD HH:mm') <= moment().format('YYYY-MM-DD 10:00')) {
                notification.info({
                    message: 'แจ้งเตือนจากระบบ',
                    description: 'ช่วงเวลาตั้งแค่ 09:30 - 10:00 น. ระบบ Nano Management Dashboard จะอยู่ระหว่างการอัพเดทข้อมูล ซึ่งอาจจะมีผลทำให้ข้อมูลแสดงผลไม่ครบถ้วน กรุณารอสักครู่...',
                    duration: 10
                })
            }
        }

        const root_table = document.querySelector(`.${cls['grid_nano_dashboard']}`)
        if(root_table) {
            root_table.querySelector('table').setAttribute('id', 'grid_nano_table')
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.mode !== nextState.mode ||
            this.state.modal !== nextState.modal ||
            this.state.wariningCriteria !== nextState.wariningCriteria ||
            this.state.nanoChartCriteria !== nextState.nanoChartCriteria ||
            this.state.search !== nextState.search ||
            this.state.searchContent !== nextState.searchContent ||
            this.state.dataSoruce !== nextState.dataSoruce ||
            this.state.dataAssignPort !== nextState.dataAssignPort ||
            this.state.progress !== nextState.progress ||
            this.state.filters !== nextState.filters ||
            this.state.handleBaseAPI !== nextState.handleBaseAPI ||
            this.state.expandedRowKeys !== nextState.expandedRowKeys ||
            this.state.expandedAllKeys !== nextState.expandedAllKeys ||
            this.state.pagination !== nextState.pagination ||
            this.props.visible !== nextProps.visible ||
            this.props.progress !== nextProps.progress ||
            this.props.locales !== nextProps.locales ||
            this.props.options !== nextProps.options ||
            this.props.authen !== nextProps.authen ||
            this.props.data !== nextProps.data ||
            this.props.form !== nextProps.form
    }

    handleColumns = (vmode) => {
        switch(vmode) {
            case 'Performance':
                return performance_columns
            case 'Collection':
                return collection_columns
            case 'Assigned':
                return port_assign_columns
            case 'Flow':
                return flow_columns
            default:
                return []
        }
    }

    render() {
        const { mode, modal, handle_field, dataSoruce, dataAssignPort, pagination } = this.state
        const { locales, config, latest_import } = this.props

        let data_mode = (mode !== 'Assigned') ? dataSoruce : dataAssignPort 

        return (
            <div className={`${cls['grid_container']} ${cls['unset']} ${mode == 'Performance' ? cls['grid_topup'] : ''} ${in_array(mode, ['Collection', 'Assigned']) ? cls['grid_collection'] : ''} ${in_array(mode, ['Flow']) ? cls['grid_flow'] : ''}`}>
                <div className={cls['version']}>
                    <Popover placement="rightTop" content={update_feature}>
                        <div className={cls['label']}>{`${config.version.name} version: ${config.version.code}`}</div>
                    </Popover>
                </div>
                <h3 className={cls['grid_title']}>
                    {config.lang[locales.region_type].grid.camange.title}
                    <p style={{ fontSize: 12 }}>{`DATA AS OF ${(!_.isEmpty(latest_import) && latest_import.length > 0) ? moment(latest_import[0].ImportDate).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}`}</p>
                </h3>

                { this.handleHeadFilter(config.lang[locales.region_type].grid.default) }
                
                <Table
                    rowKey="RowsKey"
                    className={`${cls['grid_nano_dashboard']}`}
                    columns={this.handleColumns(mode)}
                    dataSource={data_mode}
                    loading={this.state.progress}
                    expandedRowKeys={this.state.expandedRowKeys}
                    onExpandedRowsChange={this.handleExpendRow}
                    pagination={{ ...pagination }}
                    scroll={(in_array(mode, ['Flow'])) ? { x: 'max-content' } : {}}
                    footer={this.handleFooterSummary}
                    bordered
                />

                <CustomerDashboard
                    modal={modal}
                    modeType={this.state.mode}
                    masters={this.props.masters}
                    config={this.props.config}
                    locales={this.props.locales}
                    onModalClose={this.handleCloseCustomerModal}
                    handleField={handle_field}
                    authen={this.props.authen}
                    mktLayout={{ view: true, edit: false }}
                />

                <CustomerWarningDashboard 
                    modal={modal}
                    modeType={this.state.wariningCriteria}
                    masters={this.props.masters}
                    config={this.props.config}
                    locales={this.props.locales}
                    onModalClose={this.handleCloseWarningModal}
                    authen={this.props.authen}
                />

                <SalePerformanceDashboard 
                    modal={modal} 
                    authen={this.props.authen}
                    dataCriteria={this.state.nanoChartCriteria}
                    config={this.props.config}
                    locales={this.props.locales}
                    onModalClose={this.handleCloseSalePerformance}
                />

                <PortfolioDashboard
                    modal={modal} 
                    authen={this.props.authen}
                    dataCriteria={this.state.nanoChartCriteria}
                    config={this.props.config}
                    locales={this.props.locales}
                    onModalClose={this.handleCloseSalePortfolio}
                />

            </div>
        )
    }

    handleExpendRow = (expandedRows) => {    
        this.setState({ expandedRowKeys: expandedRows })
    }

    handleExpendRowCloseAll = () => {
        this.setState({ expandedRowKeys: [] })
    }

    /* FOOTER SUMMARY */
    handleFooterSummary = (currentPageData) => {
        const { dataSoruce, progress, mode } = this.state

        if (!progress && currentPageData) {
            _.delay(() => {
                const parentTable = document.querySelector(`.${cls['grid_container']}`)
                if (parentTable) {

                    let rtd_element = parentTable.querySelectorAll(`tr:first-child td`)
                    let rtd_count = parentTable.querySelectorAll('tr:first-child td').length

                    if (rtd_count > 0) {

                        let rtd_size = []
                        _.forEach(rtd_element, (v, i) => { rtd_size.push($(v).outerWidth()) })

                        let footer = {
                            title: 'TOTAL',
                            warining: '',
                            area: '',
                            branch: '',
                            cycle: '',
                            total_shop: 0,
                            total_pot: 0,
                            total_os_vol: 0,
                            total_os_cust: 0,
                            total_micro: 0,
                            total_topup: 0
                        }

                        let grand_footer = {
                            title: 'GRAND TOTAL',
                            warining: '',
                            area: '',
                            branch: '',
                            cycle: '',
                            total_shop: 0,
                            total_pot: 0,
                            total_os_vol: 0,
                            total_os_cust: 0,
                            total_micro: 0,
                            total_topup: 0
                        }

                        // TOTAL CURRENT PAGE
                        let sum_total_shop = _.sumBy(currentPageData, 'MarketShop')
                        let sum_total_cust = _.sumBy(currentPageData, 'TotalCust')
                        let sum_total_pot = _.sumBy(currentPageData, 'TotalPotential')

                        let sum_total_osunit = _.sumBy(currentPageData, 'OS_Unit')
                        let sum_total_osvol = _.sumBy(currentPageData, 'OS_Vol')

                        // ADD NEW ON 19 MAR 2019
                        let sum_total_osunit_cutnpl = _.sumBy(currentPageData, 'TotalOS_Current_WithXDay_Acc')
                        let sum_total_osvol_cutnpl = _.sumBy(currentPageData, 'TotalOS_Current_WithXDay_Bal')

                        let sum_total_oscurrent_acc = _.sumBy(currentPageData, 'TotalOS_Current_Acc')
                        let sum_total_oscurrent_bal = _.sumBy(currentPageData, 'TotalOS_Current_Bal')

                        let sum_total_osacc_exclude_npl = _.sumBy(currentPageData, 'TotalOS_ExcludeNPL_Acc')
                        let sum_total_osbal_exclude_npl = _.sumBy(currentPageData, 'TotalOS_ExcludeNPL_Bal')
                        // END NEW ON 19 MAR 2019

                        let sum_total_osmicro = _.sumBy(currentPageData, 'OS_MF_Limit')
                        let sum_total_topupapp = _.sumBy(currentPageData, 'OS_TopupApp')
                        let sum_total_topupvol = _.sumBy(currentPageData, 'OS_TopupVol')

                        let sum_total_osvol_full = _.sumBy(currentPageData, 'OS_Vol_FullAmt')
                        let sum_total_topup_full = _.sumBy(currentPageData, 'OS_TopupVol_FullAmt')
                        let sum_total_osmf_full = _.sumBy(currentPageData, 'OS_MF_Limit_FullAmt')

                        // ADD NEW ON 20 MAR 2019
                        let sum_total_base_current = _.sumBy(currentPageData, 'Base_0MDPD')
                        let sum_total_base_xday = _.sumBy(currentPageData, 'Base_1_30MDPD')
                        let sum_total_base_month = _.sumBy(currentPageData, 'Base_31_60MDPD')

                        let sum_total_flow_current = _.sumBy(currentPageData, 'Flow_0MDPD')
                        let sum_total_flow_xday = _.sumBy(currentPageData, 'Flow_1_30MDPD')
                        let sum_total_flow_month = _.sumBy(currentPageData, 'Flow_31_60MDPD')

                        let sum_total_problem_current = _.sumBy(currentPageData, 'Problem_0MDPD')
                        let sum_total_problem_xday = _.sumBy(currentPageData, 'Problem_1_30MDPD')
                        let sum_total_problem_month = _.sumBy(currentPageData, 'Problem_31_60MDPD')

                        let sum_total_new_amount = _.sumBy(currentPageData, 'TotalCust_NewAmt')
                        let sum_total_allnew_amount = _.sumBy(currentPageData, 'TotalCust_NewAllAmt')
                        
                        let flow_rate_current = (sum_total_flow_current / sum_total_base_current) * 100
                        let flow_rate_xday = (sum_total_flow_xday / sum_total_base_xday) * 100
                        let flow_rate_month = (sum_total_flow_month / sum_total_base_month) * 100

                        let forcast_current = (sum_total_problem_current / sum_total_base_current) * 100
                        let forcast_xday = (sum_total_problem_xday / sum_total_base_xday) * 100
                        let forcast_month = (sum_total_problem_month / sum_total_base_month) * 100

                        let sum_new_account = (numValid(sum_total_new_amount) / numValid(sum_total_allnew_amount)) * 100
                        // END NEW ON 20 MAR 2019

                        let os_avg_potential = (numValid(sum_total_pot) / numValid(sum_total_shop)) * 100
                        let os_avg_micro = (sum_total_osmf_full / sum_total_osvol_full) * 100
                        let os_avg_topup = (sum_total_topup_full / sum_total_osvol_full) * 100

                        footer.total_shop = parseTotalAccount(numValid(sum_total_shop))
                        footer.total_pot = (os_avg_potential) ? `${roundFixed(os_avg_potential, 1)}%` : 0.0
                        footer.total_os_vol = (sum_total_oscurrent_bal && sum_total_oscurrent_bal > 0) ? roundFixed(sum_total_oscurrent_bal, 1) : 0
                        footer.total_os_cust = numValid(sum_total_oscurrent_acc)
                        footer.total_micro = (os_avg_micro) ? `${roundFixed(os_avg_micro, 1)}%` : 0.0

                        // PERFORMANCE IS TOP UP / PORT QUALITY IS FLOW RATE W0MDPD
                        footer.total_topup = (os_avg_topup && mode == 'Performance') ? `${roundFixed(os_avg_topup, 1)}%` : (flow_rate_current && flow_rate_current > 0.00) ? `${roundFixed(flow_rate_current, 1)}%` : '0.0%'

                        // GRAND TOTAL
                        let sum_grandtotal_shop = _.sumBy(dataSoruce, 'MarketShop')
                        let sum_grandtotal_cust = _.sumBy(dataSoruce, 'TotalCust')
                        let sum_grandtotal_pot = _.sumBy(dataSoruce, 'TotalPotential')

                        let sum_grandtotal_osunit = _.sumBy(dataSoruce, 'OS_Unit')
                        let sum_grandtotal_osvol = _.sumBy(dataSoruce, 'OS_Vol')
               
                        // ADD NEW ON 19 MAR 2019
                        let sum_grandtotal_osunit_cutnpl = _.sumBy(dataSoruce, 'TotalOS_Current_WithXDay_Acc')
                        let sum_grandtotal_cutnpl = _.sumBy(dataSoruce, 'TotalOS_Current_WithXDay_Bal')

                        let sum_grandtotal_oscurrent_acc = _.sumBy(dataSoruce, 'TotalOS_Current_Acc')
                        let sum_grandtotal_oscurrent_bal = _.sumBy(dataSoruce, 'TotalOS_Current_Bal')

                        let sum_grandtotal_osacc_exclude_npl = _.sumBy(dataSoruce, 'TotalOS_ExcludeNPL_Acc')
                        let sum_grandtotal_osbal_exclude_npl = _.sumBy(dataSoruce, 'TotalOS_ExcludeNPL_Bal')
                        // END NEW ON 19 MAR 2019

                        let sum_grandtotal_osmicro = _.sumBy(dataSoruce, 'OS_MF_Limit')
                        let sum_grandtotal_topupapp = _.sumBy(dataSoruce, 'OS_TopupApp')
                        let sum_grandtotal_topupvol = _.sumBy(dataSoruce, 'OS_TopupVol')

                        let sum_grandtotal_osvol_full = _.sumBy(dataSoruce, 'OS_Vol_FullAmt')
                        let sum_grandtotal_topup_full = _.sumBy(dataSoruce, 'OS_TopupVol_FullAmt')
                        let sum_grandtotal_osmf_full = _.sumBy(dataSoruce, 'OS_MF_Limit_FullAmt')

                        // ADD NEW ON 20 MAR 2019
                        let sum_grandtotal_base_current = _.sumBy(dataSoruce, 'Base_0MDPD')
                        let sum_grandtotal_base_xday = _.sumBy(dataSoruce, 'Base_1_30MDPD')
                        let sum_grandtotal_base_month = _.sumBy(dataSoruce, 'Base_31_60MDPD')

                        let sum_grandtotal_flow_current = _.sumBy(dataSoruce, 'Flow_0MDPD')
                        let sum_grandtotal_flow_xday = _.sumBy(dataSoruce, 'Flow_1_30MDPD')
                        let sum_grandtotal_flow_month = _.sumBy(dataSoruce, 'Flow_31_60MDPD')

                        let sum_grandtotal_problem_current = _.sumBy(dataSoruce, 'Problem_0MDPD')
                        let sum_grandtotal_problem_xday = _.sumBy(dataSoruce, 'Problem_1_30MDPD')
                        let sum_grandtotal_problem_month = _.sumBy(dataSoruce, 'Problem_31_60MDPD')

                        let sum_grandtotal_new_amount = _.sumBy(dataSoruce, 'TotalCust_NewAmt')
                        let sum_grandtotal_allnew_amount = _.sumBy(dataSoruce, 'TotalCust_NewAllAmt')

                        let grand_flow_rate_current = (sum_total_flow_current / sum_total_base_current) * 100
                        let grand_flow_rate_xday = (sum_total_flow_xday / sum_total_base_xday) * 100
                        let grand_flow_rate_month = (sum_total_flow_month / sum_total_base_month) * 100

                        let grand_forcast_current = (sum_total_problem_current / sum_total_base_current) * 100
                        let grand_forcast_xday = (sum_total_problem_xday / sum_total_base_xday) * 100
                        let grand_forcast_month = (sum_total_problem_month / sum_total_base_month) * 100

                        let grand_sum_new_account = (numValid(sum_grandtotal_new_amount) / numValid(sum_grandtotal_allnew_amount)) * 100
                        // END NEW ON 20 MAR 2019

                        let grand_os_avg_potential = (numValid(sum_grandtotal_pot) / numValid(sum_grandtotal_shop)) * 100
                        let grand_os_avg_micro = (sum_grandtotal_osmf_full / sum_grandtotal_osvol_full) * 100
                        let grand_os_avg_topup = (sum_grandtotal_topup_full / sum_grandtotal_osvol_full) * 100

                        grand_footer.total_shop = parseTotalAccount(numValid(sum_grandtotal_shop))
                        grand_footer.total_pot = (grand_os_avg_potential) ? `${roundFixed(grand_os_avg_potential, 1)}%` : 0.0
                        // grand_footer.total_os_vol = (sum_grandtotal_osvol && sum_grandtotal_osvol > 0) ? roundFixed(sum_grandtotal_osvol, 1) : 0
                        // grand_footer.total_os_cust = numValid(sum_grandtotal_osunit)
                        grand_footer.total_os_vol = (sum_grandtotal_oscurrent_bal && sum_grandtotal_oscurrent_bal > 0) ? roundFixed(sum_grandtotal_oscurrent_bal, 1) : 0
                        grand_footer.total_os_cust = numValid(sum_grandtotal_oscurrent_acc)

                        grand_footer.total_micro = (grand_os_avg_micro) ? `${roundFixed(grand_os_avg_micro, 1)}%` : 0.0

                        // PERFORMANCE IS TOP UP / PORT QUALITY IS FLOW RATE W0MDPD
                        grand_footer.total_topup = (grand_os_avg_topup && mode == 'Performance') ? `${roundFixed(grand_os_avg_topup, 1)}%` : (grand_flow_rate_current && grand_flow_rate_current > 0.00) ? `${roundFixed(grand_flow_rate_current, 1)}%` : '0.0%'

                        if (mode == 'Performance') {

                            // TOTAL CURRENT PAGE
                            let sum_ytd_target = _.sumBy(currentPageData, 'YTD_Target')
                            let sum_ytd_app = _.sumBy(currentPageData, 'YTD_TotalApp')
                            let sum_ytd_vol = _.sumBy(currentPageData, 'YTD_TotalVol')
                            let sum_ytd_vol_fullamt = _.sumBy(currentPageData, 'YTD_TotalVol_FullAmt')
                            let sum_ytd_approved = _.sumBy(currentPageData, 'YTD_Approved')
                            let sum_ytd_total_final = _.sumBy(currentPageData, 'YTD_TotalFinalDecision')
                            let sum_ytd_micro = _.sumBy(currentPageData, 'YTD_TotalMicroVol')
                            let sum_ytd_micro_full = _.sumBy(currentPageData, 'YTD_TotalMicroVol_FullAmt')
                            let sum_ytd_topup = _.sumBy(currentPageData, 'YTD_TotalTopupApp')
                            let sum_ytd_topupvol = _.sumBy(currentPageData, 'YTD_TotalTopupVol')

                            let sum_mtd_target = _.sumBy(currentPageData, 'MTD_Target')
                            let sum_mtd_app = _.sumBy(currentPageData, 'MTD_TotalApp')
                            let sum_mtd_vol = _.sumBy(currentPageData, 'MTD_TotalVol')
                            let sum_mtd_vol_fullamt = _.sumBy(currentPageData, 'MTD_TotalVol_FullAmt')
                            let sum_mtd_approved = _.sumBy(currentPageData, 'MTD_Approved')
                            let sum_mtd_total_final = _.sumBy(currentPageData, 'MTD_TotalFinalDecision')
                            let sum_mtd_micro = _.sumBy(currentPageData, 'MTD_TotalMicroVol')
                            let sum_mtd_topup = _.sumBy(currentPageData, 'MTD_TotalTopupApp')
                            let sum_mtd_topup_vol = _.sumBy(currentPageData, 'MTD_TotalTopupVol')
                            let sum_mtd_topup_svol = _.sumBy(currentPageData, 'MTD_TotalTopupSetupVol')
                            let sum_mtd_topup_fvol = _.sumBy(currentPageData, 'MTD_TotalTopupVol_FullAmt')
                            let sum_mtd_topup_setup = _.sumBy(currentPageData, 'MTD_TotalTopupSetupVol_FullAmt')

                            let ytd_avg_ach = (sum_ytd_vol / sum_ytd_target) * 100
                            let ytd_avg_apv = (numValid(sum_ytd_approved) / numValid(sum_ytd_total_final)) * 100
                            let ytd_ticketsize = ((sum_ytd_vol_fullamt / numValid(sum_ytd_app)) * 100) / 100000

                            let ytd_avg_micro = (numValid(sum_ytd_micro_full) / numValid(sum_ytd_vol_fullamt)) * 100
                            let ytd_avg_topup = (sum_ytd_topupvol / sum_ytd_vol) * 100

                            let mtd_avg_ach = (sum_mtd_vol / sum_mtd_target) * 100
                            let mtd_avg_apv = (sum_mtd_approved / sum_mtd_total_final) * 100
                            let mtd_ticketsize = ((sum_mtd_vol_fullamt / sum_mtd_app) * 100) / 100000
                            let mtd_avg_micro = (sum_mtd_micro / sum_mtd_vol) * 100
                            let mtd_avg_topup = (sum_mtd_topup_setup / sum_mtd_topup_fvol) * 100

                            footer.total_ytd_target = (sum_ytd_target && sum_ytd_target > 0) ? roundFixed(sum_ytd_target, 1) : 0.0
                            footer.total_ytd_ach = (ytd_avg_ach) ? `${roundFixed(ytd_avg_ach, 1)}%` : '0.0%'
                            footer.total_ytd_vol = (sum_ytd_vol && sum_ytd_vol > 0) ? roundFixed(sum_ytd_vol, 1) : 0
                            footer.total_ytd_cust = parseTotalAccount(numValid(sum_ytd_app))
                            footer.total_ytd_ticket = (ytd_ticketsize) ? `${roundFixed(ytd_ticketsize, 1)}K` : `0K`
                            footer.total_ytd_apv = (ytd_avg_apv) ? `${roundFixed(ytd_avg_apv, 1)}%` : '0.0%'
                            footer.total_ytd_micro = (ytd_avg_micro) ? `${roundFixed(ytd_avg_micro, 1)}%` : '0.0%'
                            footer.total_ytd_topup = (ytd_avg_topup) ? `${roundFixed(ytd_avg_topup, 1)}%` : '0.0%'

                            footer.total_mtd_target = (sum_mtd_target && sum_mtd_target > 0) ? roundFixed(sum_mtd_target, 1) : 0.0
                            footer.total_mtd_ach = (mtd_avg_ach) ? `${roundFixed(mtd_avg_ach, 1)}%` : '0.0%'
                            footer.total_mtd_vol = (sum_mtd_vol && sum_mtd_vol > 0) ? roundFixed(sum_mtd_vol, 1) : 0
                            footer.total_mtd_cust = parseTotalAccount(numValid(sum_mtd_app))
                            footer.total_mtd_ticket = (mtd_ticketsize) ? `${roundFixed(mtd_ticketsize, 1)}K` : `0K`
                            footer.total_mtd_apv = (mtd_avg_apv) ? `${roundFixed(mtd_avg_apv, 1)}%` : '0.0%'
                            footer.total_mtd_micro = (mtd_avg_micro) ? `${roundFixed(mtd_avg_micro, 1)}%` : '0.0%'

                            footer.total_mtd_topup_vol = (sum_mtd_topup_svol && sum_mtd_topup_svol > 0) ? roundFixed(sum_mtd_topup_svol, 2) : 0
                            footer.total_mtd_topup_succ = (mtd_avg_topup) ? `${roundFixed(mtd_avg_topup, 1)}%` : '0.0%'

                            // GRAND TOTAL
                            let grand_sum_ytd_target = _.sumBy(dataSoruce, 'YTD_Target')
                            let grand_sum_ytd_app = _.sumBy(dataSoruce, 'YTD_TotalApp')
                            let grand_sum_ytd_vol = _.sumBy(dataSoruce, 'YTD_TotalVol')
                            let grand_sum_ytd_vol_fullamt = _.sumBy(dataSoruce, 'YTD_TotalVol_FullAmt')
                            let grand_sum_ytd_approved = _.sumBy(dataSoruce, 'YTD_Approved')
                            let grand_sum_ytd_total_final = _.sumBy(dataSoruce, 'YTD_TotalFinalDecision')
                            let grand_sum_ytd_micro = _.sumBy(dataSoruce, 'YTD_TotalMicroVol')
                            let grand_sum_ytd_micro_full = _.sumBy(dataSoruce, 'YTD_TotalMicroVol_FullAmt')
                            let grand_sum_ytd_topup = _.sumBy(dataSoruce, 'YTD_TotalTopupApp')
                            let grand_sum_ytd_topupvol = _.sumBy(dataSoruce, 'YTD_TotalTopupVol')

                            let grand_sum_mtd_target = _.sumBy(dataSoruce, 'MTD_Target')
                            let grand_sum_mtd_app = _.sumBy(dataSoruce, 'MTD_TotalApp')
                            let grand_sum_mtd_vol = _.sumBy(dataSoruce, 'MTD_TotalVol')
                            let grand_sum_mtd_vol_fullamt = _.sumBy(dataSoruce, 'MTD_TotalVol_FullAmt')
                            let grand_sum_mtd_approved = _.sumBy(dataSoruce, 'MTD_Approved')
                            let grand_sum_mtd_total_final = _.sumBy(dataSoruce, 'MTD_TotalFinalDecision')
                            let grand_sum_mtd_micro = _.sumBy(dataSoruce, 'MTD_TotalMicroVol')
                            let grand_sum_mtd_topup = _.sumBy(dataSoruce, 'MTD_TotalTopupApp')
                            let grand_sum_mtd_topup_vol = _.sumBy(dataSoruce, 'MTD_TotalTopupVol')
                            let grand_sum_mtd_topup_svol = _.sumBy(dataSoruce, 'MTD_TotalTopupSetupVol')
                            let grand_sum_mtd_topup_fvol = _.sumBy(dataSoruce, 'MTD_TotalTopupVol_FullAmt')
                            let grand_sum_mtd_topup_setup = _.sumBy(dataSoruce, 'MTD_TotalTopupSetupVol_FullAmt')

                            let grand_ytd_avg_ach = (grand_sum_ytd_vol / grand_sum_ytd_target) * 100
                            let grand_ytd_avg_apv = (numValid(grand_sum_ytd_approved) / numValid(grand_sum_ytd_total_final)) * 100
                            let grand_ytd_ticketsize = ((grand_sum_ytd_vol_fullamt / numValid(grand_sum_ytd_app)) * 100) / 100000

                            let grand_ytd_avg_micro = (numValid(grand_sum_ytd_micro_full) / numValid(grand_sum_ytd_vol_fullamt)) * 100
                            let grand_ytd_avg_topup = (grand_sum_ytd_topupvol / grand_sum_ytd_vol) * 100

                            let grand_mtd_avg_ach = (grand_sum_mtd_vol / grand_sum_mtd_target) * 100
                            let grand_mtd_avg_apv = (grand_sum_mtd_approved / grand_sum_mtd_total_final) * 100
                            let grand_mtd_ticketsize = ((grand_sum_mtd_vol_fullamt / grand_sum_mtd_app) * 100) / 100000
                            let grand_mtd_avg_micro = (grand_sum_mtd_micro / sum_mtd_vol) * 100
                            let grand_mtd_avg_topup = (grand_sum_mtd_topup_setup / grand_sum_mtd_topup_fvol) * 100

                            grand_footer.total_ytd_target = (grand_sum_ytd_target && grand_sum_ytd_target > 0) ? roundFixed(grand_sum_ytd_target, 1) : 0.0
                            grand_footer.total_ytd_ach = (grand_ytd_avg_ach) ? `${roundFixed(grand_ytd_avg_ach, 1)}%` : '0.0%'
                            grand_footer.total_ytd_vol = (grand_sum_ytd_vol && grand_sum_ytd_vol > 0) ? roundFixed(grand_sum_ytd_vol, 1) : 0
                            grand_footer.total_ytd_cust = parseTotalAccount(numValid(grand_sum_ytd_app))
                            grand_footer.total_ytd_ticket = (grand_ytd_ticketsize) ? `${roundFixed(grand_ytd_ticketsize, 1)}K` : `0K`
                            grand_footer.total_ytd_apv = (grand_ytd_avg_apv) ? `${roundFixed(ytd_avg_apv, 1)}%` : '0.0%'
                            grand_footer.total_ytd_micro = (grand_ytd_avg_micro) ? `${roundFixed(grand_ytd_avg_micro, 1)}%` : '0.0%'
                            grand_footer.total_ytd_topup = (grand_ytd_avg_topup) ? `${roundFixed(grand_ytd_avg_topup, 1)}%` : '0.0%'

                            grand_footer.total_mtd_target = (grand_sum_mtd_target && grand_sum_mtd_target > 0) ? roundFixed(grand_sum_mtd_target, 1) : 0.0
                            grand_footer.total_mtd_ach = (grand_mtd_avg_ach) ? `${roundFixed(grand_mtd_avg_ach, 1)}%` : '0.0%'
                            grand_footer.total_mtd_vol = (grand_sum_mtd_vol && grand_sum_mtd_vol > 0) ? roundFixed(grand_sum_mtd_vol, 1) : 0
                            grand_footer.total_mtd_cust = parseTotalAccount(numValid(sum_mtd_app))
                            grand_footer.total_mtd_ticket = (grand_mtd_ticketsize) ? `${roundFixed(grand_mtd_ticketsize, 1)}K` : `0K`
                            grand_footer.total_mtd_apv = (grand_mtd_avg_apv) ? `${roundFixed(grand_mtd_avg_apv, 1)}%` : '0.0%'
                            grand_footer.total_mtd_micro = (grand_mtd_avg_micro) ? `${roundFixed(grand_mtd_avg_micro, 1)}%` : '0.0%'

                            grand_footer.total_mtd_topup_vol = (grand_sum_mtd_topup_svol && grand_sum_mtd_topup_svol > 0) ? roundFixed(grand_sum_mtd_topup_svol, 2) : 0
                            grand_footer.total_mtd_topup_succ = (grand_mtd_avg_topup) ? `${roundFixed(grand_mtd_avg_topup, 1)}%` : '0.0%'

                        } else {
                        
                            // TOTAL CURRENT PAGE
                            let sum_pmt_total = _.sumBy(currentPageData, 'OS_Total_Collect')
                            let sum_pmt_succ = _.sumBy(currentPageData, 'OS_Succ_Collect')

                            let sum_newnpl_bal = _.sumBy(currentPageData, 'OS_TotalNew_NPLVol')

                            let sum_w0_bal = _.sumBy(currentPageData, 'TotalBal_W0')
                            let sum_w1_bal = _.sumBy(currentPageData, 'TotalBal_W1_2')
                            let sum_w2_bal = _.sumBy(currentPageData, 'TotalBal_W3_4')
                            let sum_xday_bal = _.sumBy(currentPageData, 'TotalBal_XDay')
                            let sum_mth_bal = _.sumBy(currentPageData, 'TotalBal_M1_2')
                            let sum_npl_bal = _.sumBy(currentPageData, 'TotalBal_NPL')

                            // UPDATE 09 Feb 2019
                            let sum_new_booking_vol = _.sumBy(dataSoruce, 'New_Booking_Vol')
                            let sum_new_booking_npl_vol = _.sumBy(dataSoruce, 'New_BookingNPL_Vol')

                            let os_pmt_succ = (sum_pmt_succ / sum_pmt_total) * 100
                            let os_newnpl_bal = (sum_newnpl_bal / sum_total_osvol_full) * 100
                            
                            let os_w0_ach = (sum_w0_bal / sum_total_osvol) * 100
                            let os_w1_ach = (sum_w1_bal / sum_total_osvol) * 100
                            let os_w2_ach = (sum_w2_bal / sum_total_osvol) * 100
                            let os_xday_ach = (sum_xday_bal / sum_total_osvol) * 100
                            let os_mth_ach = (sum_mth_bal / sum_total_osvol) * 100
                            let os_npl_ach = (sum_npl_bal / sum_total_osvol) * 100

                            let npl_newbooking = (sum_new_booking_npl_vol / sum_new_booking_vol) * 100

                            // Move to new footer
                            footer.flow_rate_xday = (flow_rate_xday && flow_rate_xday > 0.00) ? `${roundFixed(flow_rate_xday, 1)}%` : '0.0%'
                            footer.flow_rate_month = (flow_rate_month && flow_rate_month > 0.00) ? `${roundFixed(flow_rate_month, 1)}%` : '0.0%'
                            footer.new_customer = (sum_new_account && sum_new_account > 0.00) ? `${roundFixed(sum_new_account, 1)}%` : '0.0%'
                            
                            footer.pmt_success = (os_pmt_succ && os_pmt_succ > 0) ? `${roundFixed(os_pmt_succ, 1)}%` : '0.0%'
                            footer.nb_new_npl = (npl_newbooking && npl_newbooking > 0) ? `${roundFixed(npl_newbooking, 1)}%` : '0.0%'
                            footer.ytd_new_npl = (os_newnpl_bal && os_newnpl_bal > 0) ? `${roundFixed(os_newnpl_bal, 1)}%` : '0.0%'
                            footer.bucket_w0 = (os_w0_ach) ? `${roundFixed(os_w0_ach, 1)}%` : '0.0%'
                            footer.bucket_week1 = (os_w1_ach) ? `${roundFixed(os_w1_ach, 1)}%` : '0.0%'
                            footer.bucket_week2 = (os_w2_ach) ? `${roundFixed(os_w2_ach, 1)}%` : '0.0%'
                            footer.bucket_xday = (os_xday_ach) ? `${roundFixed(os_xday_ach, 1)}%` : '0.0%'
                            footer.bucket_month = (os_mth_ach) ? `${roundFixed(os_mth_ach, 1)}%` : '0.0%'
                            footer.bucket_npl = (os_npl_ach) ? `${roundFixed(os_npl_ach, 1)}%` : '0.0%'

                            // GRAND TOTAL
                            let grand_sum_pmt_total = _.sumBy(dataSoruce, 'OS_Total_Collect')
                            let grand_sum_pmt_succ = _.sumBy(dataSoruce, 'OS_Succ_Collect')

                            let grand_sum_newnpl_bal = _.sumBy(dataSoruce, 'OS_TotalNew_NPLVol')

                            let grand_sum_w0_bal = _.sumBy(dataSoruce, 'TotalBal_W0')
                            let grand_sum_w1_bal = _.sumBy(dataSoruce, 'TotalBal_W1_2')
                            let grand_sum_w2_bal = _.sumBy(dataSoruce, 'TotalBal_W3_4')
                            let grand_sum_xday_bal = _.sumBy(dataSoruce, 'TotalBal_XDay')
                            let grand_sum_mth_bal = _.sumBy(dataSoruce, 'TotalBal_M1_2')
                            let grand_sum_npl_bal = _.sumBy(dataSoruce, 'TotalBal_NPL')

                            // UPDATE 09 Feb 2019
                            let grand_sum_new_booking_vol = _.sumBy(dataSoruce, 'New_Booking_Vol')
                            let grand_sum_new_booking_npl_vol = _.sumBy(dataSoruce, 'New_BookingNPL_Vol')

                            let grand_os_pmt_succ = (grand_sum_pmt_succ / grand_sum_pmt_total) * 100
                            let grand_os_newnpl_bal = (grand_sum_newnpl_bal / sum_grandtotal_osvol_full) * 100
                            
                            let grand_os_w0_ach = (grand_sum_w0_bal / sum_grandtotal_osvol) * 100
                            let grand_os_w1_ach = (grand_sum_w1_bal / sum_grandtotal_osvol) * 100
                            let grand_os_w2_ach = (grand_sum_w2_bal / sum_grandtotal_osvol) * 100
                            let grand_os_xday_ach = (grand_sum_xday_bal / sum_grandtotal_osvol) * 100
                            let grand_os_mth_ach = (grand_sum_mth_bal / sum_grandtotal_osvol) * 100
                            let grand_os_npl_ach = (grand_sum_npl_bal / sum_grandtotal_osvol) * 100
                            let grand_npl_newbooking = (grand_sum_new_booking_npl_vol / grand_sum_new_booking_vol) * 100

                            grand_footer.flow_rate_xday = (grand_flow_rate_xday && grand_flow_rate_xday > 0.00) ? `${roundFixed(grand_flow_rate_xday, 1)}%` : '0.0%'
                            grand_footer.flow_rate_month = (grand_flow_rate_month && grand_flow_rate_month > 0.00) ? `${roundFixed(grand_flow_rate_month, 1)}%` : '0.0%'
                            grand_footer.new_customer = (grand_sum_new_account && grand_sum_new_account > 0.00) ? `${roundFixed(grand_sum_new_account, 1)}%` : '0.0%'
                            
                            grand_footer.pmt_success = (grand_os_pmt_succ && grand_os_pmt_succ > 0) ? `${roundFixed(grand_os_pmt_succ, 1)}%` : '0.0%'
                            grand_footer.nb_new_npl = (grand_npl_newbooking && grand_npl_newbooking > 0) ? `${roundFixed(grand_npl_newbooking, 1)}%` : '0.0%'
                            grand_footer.ytd_new_npl = (grand_os_newnpl_bal && grand_os_newnpl_bal > 0) ? `${roundFixed(grand_os_newnpl_bal, 1)}%` : '0.0%'
                            grand_footer.bucket_w0 = (grand_os_w0_ach) ? `${roundFixed(grand_os_w0_ach, 1)}%` : '0.0%'
                            grand_footer.bucket_week1 = (grand_os_w1_ach) ? `${roundFixed(grand_os_w1_ach, 1)}%` : '0.0%'
                            grand_footer.bucket_week2 = (grand_os_w2_ach) ? `${roundFixed(grand_os_w2_ach, 1)}%` : '0.0%'
                            grand_footer.bucket_xday = (grand_os_xday_ach) ? `${roundFixed(grand_os_xday_ach, 1)}%` : '0.0%'
                            grand_footer.bucket_month = (grand_os_mth_ach) ? `${roundFixed(grand_os_mth_ach, 1)}%` : '0.0%'
                            grand_footer.bucket_npl = (grand_os_npl_ach) ? `${roundFixed(grand_os_npl_ach, 1)}%` : '0.0%'

                        }

                        const element_footer = document.querySelector('.ant-table-footer')

                        $(element_footer)
                        .empty()
                        .append(
                            createElement('div', { 'class': `${cls['grid_footer']}` }, _.map(['footer_partition', 'grand_footer_partition'], (v) => { 
                                    return createElement('div', { 'class': `${cls[`${v}`]}` })
                                })
                            )
                        )

                        let grid_footer = $(`.${cls['grid_footer']}`)
                        let footer_partition = $(`.${cls['footer_partition']}`)
                        let grand_footer_partition = $(`.${cls['grand_footer_partition']}`)

                        let data_footer = $.map(footer, function (el) { return el })
                        let data_grand_footer = $.map(grand_footer, function (el) { return el })

                        _.forEach(rtd_size, (size, i) => {
                            let addWidth = 0
                            let footerColor = ''
                            if (mode == 'Performance') {
                                if (i >= 11 && i <= 18) {
                                    footerColor = `${cls['bg_lemon']}`
                                    if (i == 18) {
                                        footerColor = `${cls['bLDash']} ${cls['bRDash']}`
                                    }
                                }
                                if (i >= 19 && i <= 27) {
                                    footerColor = `${cls['bg_option2']}`
                                }

                                // ADD WITH                                
                                switch (i) {
                                    case 14:
                                        addWidth = 1
                                    break;
                                }

                            } else {
                                if (i >= 11 && i <= 16) {
                                    footerColor = `${cls['bg_option3']}`
                                }
                                if (i >= 17 && i <= 22) {
                                    footerColor = `${cls['bg_option4']}`
                                }
                            }

                            footer_partition.append(createElement('div', { 'class': `${cls['item_footer']} ${footerColor} mktft_${(i + 1)} ${(i == 0) ? 'tl' : 'tc'}`, 'style': `width: ${(size + addWidth)}px; ${(i == 0) ? 'font-weight: 600;' : ''}` }, data_footer[i]))
       
                            if(dataSoruce && dataSoruce.length > 20) {
                                grand_footer_partition.append(createElement('div', { 'class': `${cls['grand_item_footer']} ${footerColor} mktft_${(i + 1)} ${(i == 0) ? 'tl' : 'tc'}`, 'style': `width: ${(size + addWidth)}px; ${(i == 0) ? 'font-weight: 600;' : ''}` }, data_grand_footer[i]))
                            }

                        })
                        
                    }

                }

            }, 200)

        } else {
            return (<div className={`${cls['grid_footer']}`} style={{ minHeight: 25 }}></div>)
        }

    }

    /** TABLE OPTIONAL HANDLER **/
    // CHANGE MODE OF COLUMNS
    handleGridMode = (e) => {
        this.setState({ mode: e.target.value })
    }

    handleRandomString() {
        var text = ""
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }

    // DETECT CHANGE PAGE OF TABLE
    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    // HANDLE BASE API
    handleSwitchBaseAPI = (e) => {
        const { form } = this.props
        form.setFieldsValue({ Optional: [] })

        if(e.target.value && e.target.value == 'Kiosk') {
            form.setFieldsValue({ WarningFlag: [] })
        }

        this.setState({ handleBaseAPI: e.target.value })
    }

    // SUBMIT FORM HANDLER
    handleSearchSubmit = (e) => {
        e.preventDefault()
        const { form: { validateFields } } = this.props
        validateFields((err, objField) => {
            if(!err) {
                this.setState({ progress: true, dataSoruce: [] })
                this.handleOverviewSummary(objField, true)
            }
            
        })
    }

    // FILTER RESET ALL HANDLER
    handleReset = () => {
        this.props.form.resetFields()
        this.setState({ expandedRowKeys: [] })
        
    }

    /** FILTER CRITERIA HANDLER **/
    handleSearchCollapse = () => {
        this.setState({ search: !this.state.search })
    }

    handleSearchContentCollapse = () => {
        this.setState({ searchContent: !this.state.searchContent })
    }

    handleHeadFilter = () => {
        const { mode, handle_field, pagination } = this.state
        const { config, locales, form } = this.props
        const { getFieldDecorator } = form

        const field_colon_label = false
        const lang_field_default = config.lang[locales.region_type].grid.default

        let field_SwitchBase = form.getFieldValue('SwitchBase')
        
        let handleSwitchBase = (in_array(field_SwitchBase, ['Kiosk'])) ? true : false
        let handleCAOnly = (in_array(field_SwitchBase, ['Market', 'Kiosk'])) ? true : false
        
        return (
            <div className={cls['grid_header']}>

                <div className={cls['item_header']} data-attr="search-pagesize">
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
                        <div className="number_length"></div>
                    </div>
                </div>

                <div className={`${cls['item_header']}`} data-attr="search-filter">

                    <div className={`${cls['tools_container']} ${cls['open']}`}>

                        <div className={`${cls['tools_icon']}`}>
                            <Tooltip placement="top" title={'Reset grid table (grid collapse)'}>
                                <Icon type="switcher" theme="outlined" onClick={this.handleExpendRowCloseAll} />
                            </Tooltip>
                        </div>

                        <div className={`${cls['tools_icon']} ${cls['unset']}`}>                           
                            <RadioGroup defaultValue={mode} size="default" onChange={this.handleGridMode}>
                                <RadioButton value="Performance"><i className="fa fa-bar-chart" aria-hidden="true" style={{ color: '#40a9ff' }}></i> Performance</RadioButton>
                                <RadioButton value="Collection"><Icon type="pie-chart" style={{ color: '#ff7f50' }} /> Port Quality</RadioButton>
                                <RadioButton value="Assigned"><i className="fa fa-users" aria-hidden="true" style={{ color: '#708090' }}></i> Port Assigned</RadioButton>
                                <RadioButton value="Flow" disabled={true}><i className="fa fa-universal-access" aria-hidden="true" style={{ color: '#1b6eae' }}></i> DPD Flow</RadioButton>
                            </RadioGroup>
                        </div>

                        {/*        
                        <div className={`${cls['tools_icon']} ${cls['unset']}`}>                           
                            <RadioGroup defaultValue={mode} size="default" onChange={this.handleGridMode}>

                                <RadioButton value="Performance">
                                    <div className={`${cls['mode_container']}`}>                                        
                                        <div className={`${cls['mode_item']}`}><Icon type="line-chart" /></div>
                                        <div className={`${cls['mode_item']}`}>Performance</div>
                                    </div>
                                </RadioButton>

                                <RadioButton value="Collection">
                                    <div className={`${cls['mode_container']}`}>
                                        <div className={`${cls['mode_item']}`}><Icon type="dashboard" /></div>
                                        <div className={`${cls['mode_item']}`}>Port Quality</div>
                                    </div>
                                </RadioButton>

                            </RadioGroup>
                        </div>

                        
                        <div className={`${cls['tools_icon']} ${cls['switch']}`}>
                            <Switch size="small"/> 
                            <span className={cls['title']}>assigned</span>
                        </div>  
                        */}                        

                    </div>
                    
                    <div className={`${cls['panel_container']} ${cls['open']} ${cls['collapse_container']}`}>
                        <Collapse defaultActiveKey={[]} className={`${cls['collapse_filter']}`}>
                            <Panel header={<header><Icon type="search" /> FILTER CRITERIA</header>} key="1">
                                <Form className={`${cls['form_container']} ${cls['open']}`} onSubmit={this.handleSearchSubmit}>
                                    <Row gutter={gutter_init}>
                                        <Col span={6}>
                                            <FormItem label="Region" className={`${cls['form_item']} ${cls['ctrlTree']} ${cls['fix_height']} ${cls['hight_inherit']} tl ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('Region', { initialValue: [] })(
                                                        <TreeSelect
                                                            {...tree_config}
                                                            treeData={this.getRegionSelectItem()}
                                                            treeDefaultExpandAll={true}
                                                            size="default"
                                                            disabled={handle_field.region}
                                                        />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={6}>
                                            <FormItem label="Area / Zone" className={`${cls['form_item']} ${cls['ctrlTree']} ${cls['fix_height']} ${cls['hight_inherit']} tl ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('Area', { initialValue: [] })(
                                                        <TreeSelect
                                                            {...tree_config}
                                                            treeData={this.getAreaSelectItem()}
                                                            treeDefaultExpandedKeys={[`all`]}
                                                            size="default"
                                                            disabled={handle_field.area}
                                                        />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={6}>
                                            <FormItem label="Branch" className={`${cls['form_item']} ${cls['ctrlTree']} ${cls['fix_height']} ${cls['hight_inherit']} tl ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('Branch', { initialValue: [] })(
                                                        <TreeSelect
                                                            {...tree_config}
                                                            treeData={this.getBranchSelectItem()}
                                                            treeDefaultExpandedKeys={[`all`]}
                                                            dropdownStyle={{ height: '400px' }}
                                                            treeNodeFilterProp="label"
                                                            size="default"
                                                            disabled={handle_field.branch}
                                                        />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                        <Col span={6}>
                                            <FormItem label="Employee" className={`${cls['form_item']} ${cls['ctrlTree']} ${cls['fix_height']} ${cls['hight_inherit']} tl ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('Employee', { initialValue: [] })(
                                                        <TreeSelect
                                                            {...tree_config}
                                                            treeData={this.getCANameSelect()}
                                                            treeDefaultExpandedKeys={[`all`]}
                                                            dropdownMatchSelectWidth={true}
                                                            dropdownStyle={{ height: '400px' }}
                                                            treeNodeFilterProp="label"
                                                            size="default"
                                                            disabled={handle_field.ca || handleCAOnly}
                                                        />
                                                    )
                                                }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                    <Row gutter={gutter_init}>
                                        <Col span={3}>
                                            <FormItem className={`${cls['form_item']} ${cls['radioGroup']} ttu tl fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('SwitchBase', { initialValue: 'CA' })(
                                                    <RadioGroup onChange={this.handleSwitchBaseAPI}>
                                                        <Radio value="CA" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f8']}`} style={{ paddingTop: '4px' }}>CA</Radio>
                                                        <Radio value="Kiosk" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f8']}`} style={{ paddingTop: '4px' }}>Kiosk</Radio>
                                                        <Radio value="Market" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f8']}`} style={{ paddingTop: '4px' }}>Market</Radio>
                                                    </RadioGroup>
                                                )
                                            }   
                                            </FormItem>
                                        </Col>
                                        <Col span={3} className={`${cls['ph0']}`}>
                                            <FormItem className={`${cls['form_item']} ttu tl fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('WarningFlag', { initialValue: [] })(
                                                    <CheckboxGroup disabled={handleSwitchBase}>
                                                        <Checkbox value="Stop" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f9']}`}>
                                                            <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} /> Stop
                                                        </Checkbox>
                                                        <Checkbox value="Warning 2" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f9']}`}>
                                                            <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} /> W2
                                                        </Checkbox>
                                                        <Checkbox value="Warning 1" className={`${cls['pl1']} ${cls['pr0']} ${cls['mh0']} ${cls['f9']}`}>
                                                            <i className={`fa fa-warning ${styles['fg_gray']} ${styles['icon']}`} /> W1
                                                        </Checkbox>
                                                    </CheckboxGroup>
                                                )
                                            }   
                                            </FormItem>
                                        </Col>
                                        <Col span={6} className={`${cls['pv0']}`}>
                                            <FormItem label="Optional" className={`${cls['form_item']} ${cls['ctrlTree']} ${cls['fix_height']} ${cls['hight_inherit']} tl ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Optional', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getOptionalItem()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        dropdownStyle={{ height: '400px' }}
                                                        treeNodeFilterProp="label"
                                                        size="default"
                                                    />
                                                )
                                            }   
                                            </FormItem>
                                        </Col>
                                        <Col span={4}></Col>
                                        <Col span={8}>
                                            <FormItem style={{ marginBottom: '0px', marginTop: '24px' }} className={`${cls['form_item']} fr`}>
                                                <ButtonGroup>
                                                    <Button type="dashed" className={`ttu`} onClick={this.handleReset}>{lang_field_default.clear_button}</Button>
                                                    <Button type="primary" className={`ttu`} htmlType="submit" style={{ backgroundColor: '#0e77ca' }}>
                                                        <Icon type="search" />
                                                        {lang_field_default.search_button}
                                                    </Button>
                                                </ButtonGroup>
                                            </FormItem>
                                        </Col>
                                    </Row>
                                </Form>
                            </Panel>
                        </Collapse>
                    </div>

                </div>

            </div>
        )
    }

    // SET FILTER HANDLER

    getOptionalItem = () => {
        const { master_option } = this.props
        const { form } = this.props

        let field_SwitchBase = form.getFieldValue('SwitchBase')
        if(master_option && !_.isEmpty(master_option)) {
            let category = _.map(master_option, (v) => { return v.OptGroup })               
            let category_items = _.map(_.uniqWith(category, _.isEqual), (category_item) => {
                let sub_category = _.filter(master_option, { OptGroup: category_item }) 
                return {                                   
                    key: `${category_item}`,
                    title: `VIEW BY ${category_item}`,
                    value: sub_category.map(item => item.OptCode).join(','),
                    className: `ttu`,
                    children: _.orderBy(sub_category, ['OptSeq'], ['asc']).map((item) => {
                        let permission_allow = false
                        permission_allow = (category_item && category_item == field_SwitchBase) ? false : true

                        return ({
                            key: `opt${item.OptID}`,
                            title: `${item.OptName}`,
                            value: `${item.OptCode}`,
                            disabled: permission_allow
                        })

                    }),
                    disabled: (category_item && category_item == field_SwitchBase) ? false : true
                }
            })

            return category_items
        } else {
            return []
        }
    }

    getRegionSelectItem = () => {
        const { masters, config, locales, form: { getFieldValue } } = this.props
        const lang_field_default = config.lang[locales.region_type].grid.default

        if (!_.isEmpty(masters.region) && masters.region.length > 0) {
            return [{
                label: lang_field_default.tree_select.all,
                value: masters.region.map(item => item.RegionID).join(','),
                key: 'all',
                className: `ttu`,
                children: _.orderBy(masters.region, ['RegionID'], ['asc']).map((item, index) => {
                    return ({
                        label: `${item.RegionID}`,
                        value: `${item.RegionID}`,
                        key: `${item.RegionID}`,
                        className: `${cls['mv0']} ttu`
                    })
                })
            }]
        }
    }

    getAreaSelectItem = () => {
        const { masters, config, locales, form: { getFieldValue } } = this.props
        const lang_field_default = config.lang[locales.region_type].grid.default

        if (!_.isEmpty(masters.area) && masters.area.length > 0) {
            let region_select = getFieldValue("Region") && getFieldValue("Region").join(',').split(',')

            let area_data = (region_select && typeof region_select[0] !== undefined && region_select.length > 0) ? _.filter(masters.area, (v) => { return !_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))) }) : masters.area

            if (area_data.length <= 0)
                area_data = masters.area

            let resultGroupBy = []
            if (area_data && area_data.length > 0) {
                _.mapKeys(_.groupBy(area_data, 'AreaID'), (value, key) => {
                    let result = {
                        RegionID: value[0].RegionID,
                        AreaID: key,
                        Zone: []
                    }
                    _.mapKeys(_.groupBy(value, 'ZoneValue'), (i, v) => { result.Zone.push({ ZoneValue: v, ZoneText: i[0].ZoneText }) })
                    resultGroupBy.push(result)
                })
            }

            return [{
                label: lang_field_default.tree_select.all,
                value: resultGroupBy.map(item => item.AreaID).join(','),
                key: 'all',
                className: `ttu`,
                children: resultGroupBy.map((item, index) => ({
                    label: item.AreaID,
                    value: `${item.AreaID}`,
                    key: `${item.AreaID}`,
                    className: `${cls['mv0']} ttu`,
                    children: item.Zone.map(zone => ({
                        label: zone.ZoneText,
                        value: zone.ZoneValue,
                        key: zone.ZoneValue,
                        className: `${cls['mv0']} ttu`
                    }))
                }))
            }]
        }
    }

    getBranchSelectItem = () => {
        const { masters, config, locales, form: { getFieldValue } } = this.props
        const lang_field_default = config.lang[locales.region_type].grid.default

        if (!_.isEmpty(masters.branch)) {

            let branch_data = _.orderBy(masters.branch, sequence_no)

            let region_filter = getFieldValue("Region")
            let area_filter = getFieldValue("Area")
            let brn_type_filter = getFieldValue('BranchType')

            let region_select = (region_filter && region_filter.length > 0) ? region_filter.join(',').split(',') : undefined
            let area_select = (area_filter && area_filter.length > 0) ? area_filter.join(',').split(',') : undefined
            let brn_type_select = (brn_type_filter && brn_type_filter.length > 0) ? brn_type_filter.join(',').split(',') : undefined

            if ((region_select && region_select.length > 0) && (area_select && area_select.length > 0) && (brn_type_select && brn_type_select.length > 0)) {
                branch_data = _.orderBy(_.filter(branch_data, (v) => {
                    return (
                        !_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))) &&
                        !_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0))) &&
                        !_.isEmpty(_.find(brn_type_select, (f) => (f == v.BranchType)))
                    )
                }), sequence_no)
            }
            else if ((region_select && region_select.length > 0) && (area_select && area_select.length > 0)) {
                branch_data = _.orderBy(_.filter(branch_data, (v) => {
                    return (
                        !_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))) &&
                        !_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0)))
                    )
                }), sequence_no)
            }
            else {
                if (region_select && region_select.length > 0) {
                    branch_data = _.orderBy(_.filter(branch_data, (v) => {
                        return (!_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))))
                    }), sequence_no)
                }

                if (area_select && area_select.length > 0) {
                    branch_data = _.orderBy(_.filter(branch_data, (v) => {
                        return (!_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0))))
                    }), sequence_no)
                }

                if (brn_type_select && brn_type_select.length > 0) {
                    branch_data = _.orderBy(_.filter(branch_data, (v) => {
                        return (!_.isEmpty(_.find(brn_type_select, (f) => (f == v.BranchType))))
                    }), sequence_no)
                }

            }

            if (branch_data.length <= 0) {
                branch_data = _.orderBy(masters.branch, sequence_no)
            }

            branch_data = _.reject(branch_data, { BranchName: null })

            let group = []
            const branch = _.filter(branch_data, (o) => o.BranchType != 'K')
            const kiosk = _.filter(branch_data, { BranchType: 'K' })

            if (branch.length > 0) {
                branch.map(item => {
                    const obj = _.filter(branch_data, { OriginBranchCode: item.BranchCode })
                    const valueKey = obj.map(m => m.BranchCode).join(",")

                    group.push({
                        label: item.BranchName,
                        value: valueKey,
                        key: valueKey,
                        className: `${cls['mv0']}`
                    })

                    /*
                    if (obj.length > 1) {
                        if (!_.isEmpty(_.find(obj, o => o.BranchType != 'K')) && !_.isEmpty(_.find(obj, { BranchType: 'K' }))) {
                            group.push({
                                label: item.BranchName,
                                value: valueKey,
                                key: valueKey,
                                className: `${cls['mv0']}`,
                                children: obj.map(s => ({
                                    label: s.BranchName,
                                    value: s.BranchCode,
                                    key: s.BranchCode,
                                    className: `${cls['mv0']}`
                                }))
                            })
                        }
                        else {
                            obj.map(s => {
                                group.push({
                                    label: s.BranchName,
                                    value: s.BranchCode,
                                    key: s.BranchCode,
                                    className: `${cls['mv0']}`
                                })
                            })
                        }
                    }
                    else {
                        group.push({
                            label: item.BranchName,
                            value: valueKey,
                            key: valueKey,
                            className: `${cls['mv0']}`
                        })
                    }
                    */

                })
            }
            else {
                kiosk.map(s => {
                    group.push({
                        label: s.BranchName,
                        value: s.BranchCode,
                        key: s.BranchCode,
                        className: `${cls['mv0']}`
                    })
                })
            }

            return _.cloneDeep([{
                label: lang_field_default.tree_select.all,
                value: branch_data.map(item => item.BranchCode).join(','),
                key: 'all',
                className: `ttu`,
                children: group
            }])
        }
    }

    getCANameSelect = () => {
        const { masters, config, locales, form: { getFieldValue } } = this.props
        const lang_field_default = config.lang[locales.region_type].grid.default
        const calist_appstorge = localStorageRead('nanolayout_master', 'master_calist')

        let master_calist = !_.isEmpty(masters.calist) ? masters.calist : calist_appstorge

        if (!_.isEmpty(master_calist)) {
            let calist_data   = _.orderBy(master_calist, sequence_no)
            let region_filter = getFieldValue("Region")
            let area_filter   = getFieldValue("Area")
            let branch_filter = getFieldValue('Branch')
            let calist_filter = getFieldValue('Employee')

            let region_select = (region_filter && region_filter.length > 0) ? region_filter.join(',').split(',') : undefined
            let area_select = (area_filter && area_filter.length > 0) ? area_filter.join(',').split(',') : undefined
            let branch_select = (branch_filter && branch_filter.length > 0) ? branch_filter.join(',').split(',') : undefined
            let calist_select = (calist_filter && calist_filter.length > 0) ? calist_filter.join(',').split(',') : undefined

            if ((region_select && region_select.length > 0) && (area_select && area_select.length > 0) && (branch_select && branch_select.length > 0)) {
                calist_data = _.orderBy(_.filter(calist_data, (v) => {
                    return (
                        !_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))) &&
                        !_.isEmpty(_.find(branch_select, (f) => (f == v.BranchCode)))
                    )
                }), sequence_no)
            }
            else if ((region_select && region_select.length > 0) && (area_select && area_select.length > 0)) {
                calist_data = _.orderBy(_.filter(calist_data, (v) => {
                    return (
                        !_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))) &&
                        !_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0)))
                    )
                }), sequence_no)
            }
            else {
                if (region_select && region_select.length > 0) {
                    calist_data = _.orderBy(_.filter(calist_data, (v) => {
                        return (!_.isEmpty(_.find(region_select, (f) => (f == v.RegionID))))
                    }), sequence_no)
                }

                if (area_select && area_select.length > 0) {
                    calist_data = _.orderBy(_.filter(calist_data, (v) => {
                        return (!_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0))))
                    }), sequence_no)
                }

                if (branch_select && branch_select.length > 0) {
                    calist_data = _.orderBy(_.filter(calist_data, (v) => {
                        return (!_.isEmpty(_.find(branch_select, (f) => (f == v.BranchCode))))
                    }), sequence_no)
                }
            }

            if (calist_data.length <= 0) {
                calist_data = _.orderBy(master_calist, sequence_no)
            }

            // CHECK UNIQUE
            calist_data = _.uniqBy(calist_data, 'CA_Code')

            let group = []
            _.mapKeys(_.groupBy(calist_data, "OriginBranchCode"), (values, key) => {
                let branch_name = _.isEmpty(_.find(masters.branch, { BranchCode: key })) ? null : _.find(masters.branch, { BranchCode: key }).BranchName
                if (!_.isEmpty(branch_name)) {
                    let obj = {
                        label: branch_name,
                        value: values.map(m => m.CA_Code).join(','),
                        key: values.map(m => m.CA_Code).join(','),
                        className: `${cls['mv0']} ttu`
                    }

                    obj.children = values.map((item, index) => ({
                        label: item.CA_Name,
                        value: `${item.CA_Code}`,
                        key: `${item.CA_Code}`,
                        className: `${cls['mv0']} ttu`
                    }))

                    group.push(obj)
                }
            })

            return [
                {
                    label: lang_field_default.tree_select.all,
                    value: _.uniq(calist_data.map(item => `${item.CA_Code}`)).join(','),
                    key: 'all',
                    children: group,
                    className: `ttu`
                }
            ]
        }
    }

    handleOverviewSummary = (param, search = false) => {
        const { handleBaseAPI } = this.state
        const { masters, authen } = this.props
        const { Auth } = authen

        let area_selected = []
        let zone_selected = []
        let zone_select_only = false

        if (param.Area && param.Area.length > 0) {
            let pattern = new RegExp("-")
            _.forEach(param.Area, (data) => {
                let check_pattern = pattern.test(data)
                if (check_pattern) {
                    zone_select_only = true
                }

                if (!check_pattern) {
                    area_selected.push(data)

                    if (!_.isEmpty(masters.area)) {
                        let objData = _.filter(masters.area, { AreaID: data })
                        if (!_.isEmpty(objData) && objData.length > 0) {
                            _.forEach(objData, (zone) => { zone_selected.push(zone.ZoneValue) })
                        }
                    }

                } else {
                    let item = data.split("-");
                    let item_data = item[0].trim();
                    area_selected.push(item_data)
                    zone_selected.push(data)
                }
            })
        }

        let uniq_area_selected = _.uniq(area_selected)
        let uniq_zone_selected = _.uniq(zone_selected)

        let setParam = {
            Region: (param.Region && param.Region.length > 0) ? param.Region.join(',') : null,
            Area: (!zone_select_only && uniq_area_selected && uniq_area_selected.length > 0) ? uniq_area_selected.join(',') : null,
            Zone: (zone_select_only && uniq_zone_selected && uniq_zone_selected.length > 0) ? uniq_zone_selected.join(',') : null,
            Branch: (param.Branch && param.Branch.length > 0) ? param.Branch.join(',') : null,
            Kiosk: (param.Kiosk && param.Kiosk.length > 0) ? param.Kiosk.join(',') : null,
            Employee: (param.Employee && param.Employee.length > 0) ? param.Employee.join(',') : null,
            WorkingDateFrom: (param.WorkingRange && param.WorkingRange.length > 0) ? moment(param.WorkingRange[0]).format('YYYY-MM-DD') : null,
            WorkingDateTo: (param.WorkingRange && param.WorkingRange.length > 0) ? moment(param.WorkingRange[1]).format('YYYY-MM-DD') : null,
            WarningFlag: (param.WarningFlag && param.WarningFlag.length > 0) ? param.WarningFlag.join(',') : null,
            Optional:  (param.Optional && param.Optional.length > 0) ? param.Optional.join(',') : null,
        }
        
        let requestData = _.assignIn({}, this.state.filters, setParam)

        let api_fetch = []
        let latest_filter = 4
        if (!_.isEmpty(requestData.Employee)) {
            latest_filter = 0
        }
        else if (!_.isEmpty(requestData.Branch)) {
            latest_filter = 1
        }
        else if (!_.isEmpty(requestData.Zone)) {
            latest_filter = 2
        }
        else if (!_.isEmpty(requestData.Area)) {
            latest_filter = 3
        }
        else if (!_.isEmpty(requestData.Region)) {
            latest_filter = 4
        }

        let handle_field = {
            region: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['AM', 'ZM', 'TM', 'CA', 'PCA'])) ? true : false,
            area: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['ZM', 'TM', 'CA', 'PCA'])) ? true : false,
            zone: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['TM', 'CA', 'PCA'])) ? true : false,
            kiosk: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['CA', 'PCA'])) ? true : false,
            branch: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['CA', 'PCA'])) ? true : false
        }

        let baseSummaryAPI = null
        let baseSubSummaryAPI = null
        switch(handleBaseAPI) {
            case 'Kiosk':
                baseSummaryAPI = gridKioskSummaryAPI
                baseSubSummaryAPI = []
                break
            case 'Market':
                baseSummaryAPI = gridMarketSummaryAPI
                baseSubSummaryAPI = gridMarketCASummaryAPI
                break
            case 'CA':
            default:
                baseSummaryAPI = gridCASummaryAPI
                baseSubSummaryAPI = gridMarketCASummaryAPI
                break
        }

        if (search) {

            if((param.WarningFlag && param.WarningFlag.length > 0) || (param.Optional && param.Optional.length > 0)) {
                api_fetch = [
                    [],
                    [],
                    [],
                    [],
                    [],
                    baseSummaryAPI(requestData).then(resp => resp.data),
                    Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                ]

            } else {
                switch (latest_filter) {
                    case 4:
                        api_fetch = [
                            gridRegionSummaryAPI(requestData).then(resp => resp.data),
                            gridAreaSummaryAPI(requestData).then(resp => resp.data),
                            gridZoneSummaryAPI(requestData).then(resp => resp.data),
                            gridBranchSummaryAPI(requestData).then(resp => resp.data),
                            [],
                            baseSummaryAPI(requestData).then(resp => resp.data),
                            Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                        ]
                        break
                    case 3:
                        api_fetch = [
                            [],
                            gridAreaSummaryAPI(requestData).then(resp => resp.data),
                            gridZoneSummaryAPI(requestData).then(resp => resp.data),
                            gridBranchSummaryAPI(requestData).then(resp => resp.data),
                            [],
                            baseSummaryAPI(requestData).then(resp => resp.data),
                            Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                        ]
                        break
                    case 2:
                        api_fetch = [
                            [],
                            [],
                            gridZoneSummaryAPI(requestData).then(resp => resp.data),
                            gridBranchSummaryAPI(requestData).then(resp => resp.data),
                            [],
                            baseSummaryAPI(requestData).then(resp => resp.data),
                            Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                        ]
                        break
                    case 1:
                        api_fetch = [
                            [],
                            [],
                            [],
                            gridBranchSummaryAPI(requestData).then(resp => resp.data),
                            [],
                            baseSummaryAPI(requestData).then(resp => resp.data),
                            Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                        ]
                        break
                    case 0:
                    default:
                        api_fetch = [
                            [],
                            [],
                            [],
                            [],
                            [],
                            baseSummaryAPI(requestData).then(resp => resp.data),
                            Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
                        ]
                        break
                }
            }

        } else {
            api_fetch = [
                (handle_field.region) ? [] : gridRegionSummaryAPI(requestData).then(resp => resp.data),
                (handle_field.area) ? [] : gridAreaSummaryAPI(requestData).then(resp => resp.data),
                (handle_field.zone) ? [] : gridZoneSummaryAPI(requestData).then(resp => resp.data),
                (handle_field.branch) ? [] : gridBranchSummaryAPI(requestData).then(resp => resp.data),
                [],
                baseSummaryAPI(requestData).then(resp => resp.data),
                Array.isArray(baseSubSummaryAPI) ? [] : baseSubSummaryAPI(requestData).then(resp => resp.data)
            ]
        }

        bluebird.all(api_fetch).spread((region, area, zone, branch, kiosk, ca, subca) => {

            let data_temp =  {
                val: [
                    _.uniqBy(region, 'RowsKey'), 
                    _.uniqBy(area, 'RowsKey'), 
                    _.uniqBy(zone, 'RowsKey'), 
                    _.uniqBy(branch, 'RowsKey'), 
                    _.uniqBy(ca, 'RowsKey'), 
                    [], //_.uniqBy(subca, 'RowsKey'),
                    handleBaseAPI
                ]
            }

            this.handleGridAssignPort(JSON.stringify(data_temp))

            this.handleGridTransection(
                _.uniqBy(region, 'RowsKey'), 
                _.uniqBy(area, 'RowsKey'), 
                _.uniqBy(zone, 'RowsKey'), 
                _.uniqBy(branch, 'RowsKey'), 
                _.uniqBy(kiosk, 'RowsKey'), 
                _.uniqBy(ca, 'RowsKey'), 
                _.uniqBy(subca, 'RowsKey'),
                search,
                handleBaseAPI
            )
         
           

        })

    }

    handleGridTransection = (region, area, zone, branch, kiosk, ca, subca, search = false, rootBase) => {
        let data_grid = []

        let has_subca = (subca && subca.length > 0) ? true : false
        let has_ca = (ca && ca.length > 0) ? true : false
        let has_branch = (branch && branch.length > 0) ? true : false
        let has_zone = (zone && zone.length > 0) ? true : false
        let has_area = (area && area.length > 0) ? true : false
        let has_region = (region && region.length > 0) ? true : false

        let subca_summary = (has_subca) ? this.handleInstallOpenModal(subca) : []
        let ca_summary = (has_ca) ? this.handleInstallOpenModal(ca) : []
        let branch_summary = (has_branch) ? this.handleInstallOpenModal(branch) : []
        let zone_summary = (has_zone) ? this.handleInstallOpenModal(zone) : []
        let area_summary = (has_area) ? this.handleInstallOpenModal(area) : []
        let region_summary = (has_region) ? this.handleInstallOpenModal(region) : []

        let data_exclude_fcr = _.reject(ca_summary, (v) => { return v.ZoneDigit == 'FCR'})

        if (has_subca) {
            subca_summary.map((v) => { v.rootBaseFilter = rootBase })
        }

        if(has_ca) {
            if (has_subca) {
                data_exclude_fcr.map((v) => {  
                    v.rootBaseFilter = rootBase

                    let data_child = in_array(rootBase, ['Market'])  ? _.filter(subca_summary, { EmployeeCode: v.EmployeeCode }) : _.filter(subca_summary, { OptionCode: v.EmployeeCode })
  
                    if (!_.isEmpty(data_child)) {
                        v.children = _.uniqWith(data_child, _.isEqual)
                    }
                })
            } 
        }
    
        if (has_branch) {
            if (has_ca) {
                branch_summary.map((v) => {
                    v.rootBaseFilter = rootBase

                    let data_child = _.filter(data_exclude_fcr, { BranchCode: v.BranchCode })
                    if (!_.isEmpty(data_child)) {
                        v.children = data_child
                    }

                })
            }
        }

        if (has_zone) {
            if (has_branch) {
                zone_summary.map((v) => {
                    v.rootBaseFilter = rootBase

                    let data_child = _.filter(_.uniqWith(branch_summary, _.isEqual), { ZoneValue: v.ZoneValue })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (has_area) {
            if (has_zone) {
                area_summary.map((v) => {
                    v.rootBaseFilter = rootBase

                    let data_child = _.filter(zone_summary, { AreaID: v.AreaID })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (has_region) {
            if (has_area) {
                region_summary.map((v) => {
                    v.rootBaseFilter = rootBase

                    let data_child = _.filter(area_summary, { RegionID: v.RegionID })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (has_region) {
            data_grid = region_summary
        }
        else if (!has_region && has_area && !has_zone || !has_region && has_area && has_zone) {
            data_grid = area_summary
        }
        else if (!has_region && !has_area && has_zone) {
            data_grid = zone_summary
        }
        else if (!has_region && !has_area && !has_zone && has_branch) {
            data_grid = branch_summary
        }
        else if (!has_region && !has_area && !has_zone && !has_branch && has_ca) {
            data_grid = _.reject(data_exclude_fcr, { ZoneDigit: 'FCR' })
        }
        
        this.setState({ dataSoruce: _.uniqWith(data_grid, _.isEqual), progress: false })

    }

    // _region, _area, _zone, _branch, _ca, _subca, _rootBase
    handleGridAssignPort = (params) => {        
        let data_parser = JSON.parse(params)
        let data = (data_parser && data_parser.val) ? data_parser.val : null

        let _region = data[0]
        let _area = data[1]
        let _zone = data[2]
        let _branch = data[3]
        let _ca = data[4]
        let _subca = data[5]
        let _rootBase = data[6]
       
        let _data_grid = []

        // let has_subca = (subca && subca.length > 0) ? true : false
        let _has_ca = (_ca && _ca.length > 0) ? true : false
        let _has_branch = (_branch && _branch.length > 0) ? true : false
        let _has_zone = (_zone && _zone.length > 0) ? true : false
        let _has_area = (_area && _area.length > 0) ? true : false
        let _has_region = (_region && _region.length > 0) ? true : false

        //let subca_summary = (has_subca) ? this.handleInstallOpenModal(subca) : []
        let _ca_summary = (_has_ca) ? this.handleInstallOpenModal(_ca) : []
        let _branch_summary = (_has_branch) ? this.handleInstallOpenModal(_branch) : []
        let _zone_summary = (_has_zone) ? this.handleInstallOpenModal(_zone) : []
        let _area_summary = (_has_area) ? this.handleInstallOpenModal(_area) : []
        let _region_summary = (_has_region) ? this.handleInstallOpenModal(_region) : []

        // if (_has_subca) { _subca_summary.map((v) => { v.rootBaseFilter = rootBase }) }

        // if(_has_ca) {
        //     if (_has_subca) {
        //         _ca_summary.map((v) => {  
        //             v.rootBaseFilter = _rootBase

        //             let data_child = in_array(_rootBase, ['Market'])  ? _.filter(_subca_summary, { EmployeeCode: v.EmployeeCode }) : _.filter(_subca_summary, { OptionCode: v.EmployeeCode })
  
        //             if (!_.isEmpty(data_child)) {
        //                 v.children = _.uniqWith(data_child, _.isEqual)
        //             }
        //         })
        //     }
        // }
    
        if (_has_branch) {
            if (_has_ca) {
                _branch_summary.map((v) => {
                    v.rootBaseFilter = _rootBase

                    let data_child = _.filter(_ca_summary, { BranchCode: v.BranchCode })
                    if (!_.isEmpty(data_child)) {
                        v.children = data_child
                    }
                })
            }
        }

        if (_has_zone) {
            if (_has_branch) {
                _zone_summary.map((v) => {
                    v.rootBaseFilter = _rootBase

                    let data_child = _.filter(_.uniqWith(_branch_summary, _.isEqual), { ZoneValue: v.ZoneValue })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (_has_area) {
            if (_has_zone) {
                _area_summary.map((v) => {
                    v.rootBaseFilter = _rootBase

                    let data_child = _.filter(_zone_summary, { AreaID: v.AreaID })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (_has_region) {
            if (_has_area) {
                _region_summary.map((v) => {
                    v.rootBaseFilter = _rootBase

                    let data_child = _.filter(_area_summary, { RegionID: v.RegionID })
                    v.children = (data_child && data_child.length > 0) ? data_child : []
                })
            }
        }

        if (_has_region) {
            _data_grid = _region_summary
        }
        else if (!_has_region && _has_area && !_has_zone || !_has_region && _has_area && _has_zone) {
            _data_grid = _area_summary
        }
        else if (!_has_region && !_has_area && _has_zone) {
            _data_grid = _zone_summary
        }
        else if (!_has_region && !_has_area && !_has_zone && _has_branch) {
            _data_grid = _branch_summary
        }
        else if (!_has_region && !_has_area && !_has_zone && !_has_branch && _has_ca) {
            _data_grid = _ca_summary
        }

        this.setState({ dataAssignPort: _.uniqWith(_data_grid, _.isEqual) })
        
    }

    clone = (obj) => {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
    

    handleOpenCustomerModal = (empcode) => {
        this.setState({ modal: _.assignIn({}, this.state.modal, { auth: empcode, customer: true }) })
    }

    handleCloseCustomerModal = () => {
        this.setState({ modal: _.assignIn({}, this.state.modal, { auth: null, customer: false }) })
    }

    handleOpenCustWarningModal = (items) => {
        let authen = null
        let mode_view = null

        if(in_array(items.GroupData, ['Branch'])) {
            authen = `${items.EmployeeCode},${items.BranchCode}`
        } 
        else if (in_array(items.GroupData, ['MarketCA'])) { 
            if(in_array(handleBaseAPI, ['CA', 'Market'])) {
                authen = `Market,${Auth.EmployeeCode},${v.EmployeeCode}`
            } else {
                authen = `${v.EmployeeCode}`
            }
        }
        else if(in_array(items.GroupData, ['Kiosk', 'Market'])) { 
            if(items.GroupData == 'Kiosk') {
                if(items.GroupData == 'Kiosk' && items.BranchFullDigit.length == 3) {
                    authen = `${items.EmployeeCode}`
                } else {
                    authen = `${items.GroupData},${items.EmployeeCode},${items.BranchFullDigit}`
                }
            }
            if(items.GroupData == 'Market') {
                authen = `${items.GroupData},${items.EmployeeCode},${items.EmployeeCode}`
            }
        }
        else {
            authen = items.EmployeeCode
        }

        if(in_array(items.GroupData, ['CA', 'Market'])) {
            if(!_.isEmpty(items.HasAlert)) {

                switch(items.HasAlert) {
                    case 'Stop':
                        if(items.Stop_Active == 'StopAll') {
                            mode_view = 'All'
                        }
                        if(items.Stop_Active == 'StopNewBook') {
                            mode_view = 'NewBook'
                        }
                        if(items.Stop_Active == 'StopNewNPL') {
                            mode_view  = 'NewNPL'
                        }
                    break
                    case 'Warning 2':      
                    case 'Warning 1':          
                        if(in_array(items.Warning_Active, ['WarningLv2'])) {
                            mode_view = 'NewBook'
                        } else {
                            mode_view = (items.Warning_Active && items.Warning_Active !== '') ? items.Warning_Active : 'NewBook'
                        }
                    break                    
                    default:
                        mode_view = items.HasAlert
                    break
                }
            }
        }

        this.setState({ 
            modal: _.assignIn({}, this.state.modal, { warning: true }),
            wariningCriteria:  _.assignIn({}, this.state.wariningCriteria, { 
                auth: items.EmployeeCode,
                fullauth: authen,
                mode: mode_view
            })
        })
    }

    handleCloseWarningModal = () => {
        this.setState({
            modal: _.assignIn({}, this.state.modal, { warning: false }),
            wariningCriteria:  _.assignIn({}, this.state.wariningCriteria, { 
                auth: null,
                fullauth: null,
                mode: null
            })
        })
    }

    handleOpenSalePerformance = (val) => {
        this.setState({ 
            modal: _.assignIn({}, this.state.modal, { sale_summary_chart: true }),
            nanoChartCriteria: _.assignIn({}, this.state.nanoChartCriteria, { 
                auth: val.data.EmployeeCode,
                fullauth: val.authen,
                dataItems: val.data
            })
            
        })
    }

    handleCloseSalePerformance = () => {
        this.setState({ 
            modal: _.assignIn({}, this.state.modal, { sale_summary_chart: false })
        })
    }

    handleOpenSalePortfolio = (val) => {
        this.setState({ 
            modal: _.assignIn({}, this.state.modal, { portfolio_summary_chart: true }),
            nanoChartCriteria: _.assignIn({}, this.state.nanoChartCriteria, { 
                auth: val.data.EmployeeCode,
                fullauth: val.authen,
                dataItems: val.data
            })
            
        })
    }

    handleCloseSalePortfolio = () => {
        this.setState({ 
            modal: _.assignIn({}, this.state.modal, { portfolio_summary_chart: false })
        })
    }

    handleInstallOpenModal = (dataList) => {
        const { handleBaseAPI } = this.state
        const { Auth } = this.props.authen
        
        if (!_.isEmpty(dataList)) {
            return dataList.map((v, i) => {
                
                let authen = null
                let group_type = (v.GroupData) ? v.GroupData : 'Non-type'
                
                if(in_array(group_type, ['Branch'])) {
                    authen = `${(v.EmployeeCode) ? v.EmployeeCode : Auth.EmployeeCode},${v.BranchCode}`
                } 
                else if (in_array(group_type, ['MarketCA'])) { 
                    if(in_array(handleBaseAPI, ['CA', 'Market'])) {
                        authen = `Market,${Auth.EmployeeCode},${v.EmployeeCode}`
                    } else {
                        authen = `${v.EmployeeCode}`
                    }
                    
                }
                else if(in_array(group_type, ['Kiosk', 'Market'])) { 
                    if(group_type == 'Kiosk') {
                        if(group_type == 'Kiosk' && v.BranchFullDigit.length == 3) {
                            authen = `${(v.EmployeeCode) ? v.EmployeeCode : Auth.EmployeeCode}`
                        } else {
                            authen = `${group_type},${(v.EmployeeCode) ? v.EmployeeCode : Auth.EmployeeCode},${v.BranchFullDigit}`
                        }
                    }
                    if(group_type == 'Market') {
                        authen = `${group_type},${Auth.EmployeeCode},${v.EmployeeCode}`
                    }
                }              
                else {
                    authen = (v.EmployeeCode) ? v.EmployeeCode : Auth.EmployeeCode
                }

                v.handleWarningModal = this.handleOpenCustWarningModal

                v.linkPerformance = (
                    (
                        <div key={(i+1)} className={cls['ctrlColumns']}>
                            <div title="Customer Information" className={cls['ctrlColumnsItem']}><i className={`${cls['icon']} fa fa-user ${styles['fg_gray']}`} onClick={this.handleOpenCustomerModal.bind(this, authen)} /></div>
                            <div className={cls['ctrlColumnsItem']} onClick={this.handleOpenSalePerformance.bind(this, { authen, data: v })}><i className={`${cls['icon']} fa fa-line-chart  ${styles['fg_gray']}`} /></div>                            
                        </div>
                    )
                )

                v.linkPortfolio = (
                    (
                        <div key={(i+1)} className={cls['ctrlColumns']}>
                            <div title="Customer Information" className={cls['ctrlColumnsItem']}><i className={`${cls['icon']} fa fa-user ${styles['fg_gray']}`} onClick={this.handleOpenCustomerModal.bind(this, authen)} /></div>
                            <div className={cls['ctrlColumnsItem']} onClick={this.handleOpenSalePortfolio.bind(this, { authen, data: v })}><i className={`${cls['icon']} fa fa-usd ${styles['fg_gray']}`} /></div>
                        </div>
                    )
                )
                
                return v
            })
        } else {
            return []
        }
    }

    handleExportFile = (id, e) => {
        this.exportToExcel(e.target, id)
    }

    exportToExcel = (that, id, hasHeader, removeLinks, removeImages, removeInputParams) => {
        if (that == null || typeof that === 'undefined') {
            console.log('Sender is required');
            return false;
        }
        
        if (!(that instanceof HTMLAnchorElement)) {
            console.log('Sender must be an anchor element');
            return false;
        }
        
        if (id == null || typeof id === 'undefined') {
            console.log('Table id is required');
            return false;
        }
        if (hasHeader == null || typeof hasHeader === 'undefined') {
            hasHeader = true;
        }
        if (removeLinks == null || typeof removeLinks === 'undefined') {
            removeLinks = true;
        }
        if (removeImages == null || typeof removeImages === 'undefined') {
            removeImages = false;
        }
        if (removeInputParams == null || typeof removeInputParams === 'undefined') {
            removeInputParams = true;
        }
        
        var tab_text = "<table border='2px'>";
        var textRange;
        
        tab = $(id).get(0);
        
        if (tab == null || typeof tab === 'undefined') {
            console.log('Table not found');
            return;
        }
        
        var j = 0;
        
        if (hasHeader && tab.rows.length > 0) {
            var row = tab.rows[0];
            tab_text += "<tr bgcolor='#87AFC6'>";
            for (var l = 0; l < row.cells.length; l++) {
                if ($(tab.rows[0].cells[l]).is(':visible')) {//export visible cols only
                    tab_text += "<td>" + row.cells[l].innerHTML + "</td>";
                }
            }
            tab_text += "</tr>";
            j++;
        }
        
        for (; j < tab.rows.length; j++) {
            var row = tab.rows[j];
            tab_text += "<tr>";
            for (var l = 0; l < row.cells.length; l++) {
                if ($(tab.rows[j].cells[l]).is(':visible')) {//export visible cols only
                    tab_text += "<td>" + row.cells[l].innerHTML + "</td>";
                }
            }
            tab_text += "</tr>";
        }
        
        tab_text = tab_text + "</table>";
        if (removeLinks)
            tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, "");
        if (removeImages)
            tab_text = tab_text.replace(/<img[^>]*>/gi, ""); 
        if (removeInputParams)
            tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, "");
        
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");
        
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
        {
            myIframe.document.open("txt/html", "replace");
            myIframe.document.write(tab_text);
            myIframe.document.close();
            myIframe.focus();
            sa = myIframe.document.execCommand("SaveAs", true, document.title + ".xls");
            return true;
        }
        else {
            //other browser tested on IE 11
            var result = "data:application/vnd.ms-excel," + encodeURIComponent(tab_text);
            that.href = result;
            that.download = document.title + ".xls";
            return true;
        }
    }

}

class SalePerformanceDashboard extends Component {

    state = {
        data: [],
        authen: null,
        progress_enable: true,        
        load_config: {
            size: 150,
            title: 'Sale Performance',
            desc: 'Please wait for loading data...',
            center: true
        }
    }

    componentWillReceiveProps(props) {
        if (props) {
            if(props.modal.sale_summary_chart) {
                if(!this.state.authen) {
                    const { dataCriteria: { auth, dataItems } } = props

                    let param = {}
                    let authen_code = null

                    let data = []
                    let result = []
                    switch(dataItems.GroupData) {
                        case 'Market':                       
                            authen_code = (auth && auth !== '') ? auth : null
                            param = { MktCode: authen_code }
                        break
                        case 'Kiosk':
                            authen_code = (dataItems.BranchFullDigit && dataItems.BranchFullDigit !== '') ? dataItems.BranchFullDigit : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Branch':
                            authen_code = (dataItems.BranchWithKioskAll && dataItems.BranchWithKioskAll !== '') ? dataItems.BranchWithKioskAll : null
                            param = { BranchCode: authen_code }
                        break                      
                        case 'Zone':                            
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (v) => {
                                    return v.BranchWithKioskAll
                                })
                            }

                            authen_code = (data && data.length > 0) ? data.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Area':
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (v) => {
                                    return _.map(v.children, (d) => { return d.BranchWithKioskAll })
                                })
                            }
                            
                            result = _.flatten(data)
                            authen_code = (result && result.length > 0) ? result.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Region':
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (objData) => {
                                    return _.map(objData.children, (val) => { 
                                        return _.map(val.children, (items) => { return items.BranchWithKioskAll })
                                    })
                                })
                            }
                            
                            result = _.flatten(data)
                            authen_code = (result && result.length > 0) ? result.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        default:
                            authen_code = dataItems.EmployeeCode
                            param = { CAID: authen_code }
                        break
                    }

                    this.setState({ authen: authen_code })

                    this.loadSaleSummaryChart(param)

                }
            }
            
        }
    }

    render() {
        const { modal, dataCriteria: { dataItems } } = this.props 
        const { data, load_config, progress_enable } = this.state

        let title_name = ''
        if(dataItems && in_array(dataItems.GroupData, ['Region', 'Area', 'Zone'])) {
            title_name = `${ (dataItems && dataItems.EmployeeName) ? `${dataItems.EmployeeName}` : '' } ${(dataItems && dataItems.ZoneDigit) ? `(${dataItems.ZoneDigit})` : ''}`
        } else {
            if(dataItems && dataItems.GroupData == 'Branch') {
                title_name = `${(dataItems && dataItems.BranchName) ? `${dataItems.BranchName}` : ''}`
            } 
            else if(dataItems && dataItems.GroupData == 'Kiosk') {
                if(dataItems && dataItems.BranchFullDigit.length == 3) {
                    title_name = `${(dataItems && dataItems.BranchHeadQuarter) ? `${dataItems.BranchHeadQuarter} (ไม่รวม Kiosk)` : ''}`
                } else {
                    title_name = `${(dataItems && dataItems.BranchHeadQuarter) ? `${dataItems.BranchHeadQuarter}` : ''} ${ (dataItems && dataItems.EmployeeName) ? `> ${dataItems.EmployeeName}` : '' }`
                }                
            } 
            else {
                title_name = `${(dataItems && dataItems.BranchName) ? `${dataItems.BranchName}` : ''} ${ (dataItems && dataItems.EmployeeName) ? `> ${dataItems.EmployeeName}` : '' }`
            }
            
        }

        return (
            <Modal 
                title={`${title_name}`}
                visible={modal.sale_summary_chart}
                footer={null}
                onCancel={this.handleClose}                   
                className={`${(progress_enable) ? cls['customer_modal_fig'] : cls['customer_modal']} ${cls['sh300']}`}
                maskClosable={false}
                width="620px"
            >
                <Loader visible={progress_enable} {...load_config} style={{ margin: '10% auto 0 auto'}} />
                <SaleSummaryChart item={{SALE_SUMMARY_CHART: data}}  />
            </Modal>
        )
    }

    handleClose = () => {
        const { onModalClose } = this.props
        this.setState({ 
            data: [],
            authen: null,
            progress_enable: true
        })

        onModalClose()
    }


    loadSaleSummaryChart = (param) => {
        getSaleSummaryDashboardAPI(param).then((resp) => {     
            resp.data.then(data => {
                this.setState({ 
                    data: data,
                    progress_enable: false
                })   
            })  
        })
    }

}

class PortfolioDashboard extends Component {

    state = {
        data: [],
        authen: null,
        progress_enable: true,        
        load_config: {
            size: 150,
            title: 'Portfolio Information',
            desc: 'Please wait for loading data...',
            center: true
        }
    }

    componentWillReceiveProps(props) {
        if (props) {
            if(props.modal.portfolio_summary_chart) {
                if(!this.state.authen) {
                    const { dataCriteria: { auth, dataItems } } = props

                    let param = {}
                    let authen_code = null
                    
                    
                    let data = []
                    let result = []
                    switch(dataItems.GroupData) {
                        case 'Market':                       
                            authen_code = (auth && auth !== '') ? auth : null
                            param = { MktCode: authen_code }
                        break
                        case 'Kiosk':
                            authen_code = (dataItems.BranchFullDigit && dataItems.BranchFullDigit !== '') ? dataItems.BranchFullDigit : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Branch':
                            authen_code = (dataItems.BranchWithKioskAll && dataItems.BranchWithKioskAll !== '') ? dataItems.BranchWithKioskAll : null
                            param = { BranchCode: authen_code }
                        break                      
                        case 'Zone':
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (v) => {
                                    return v.BranchWithKioskAll
                                })
                            }

                            authen_code = (data && data.length > 0) ? data.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Area':
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (v) => {
                                    return _.map(v.children, (d) => { return d.BranchWithKioskAll })
                                })
                            }
                            
                            result = _.flatten(data)
                            authen_code = (result && result.length > 0) ? result.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        case 'Region':
                            if(dataItems.children && dataItems.children.length > 0) {
                                data = _.map(dataItems.children, (objData) => {
                                    return _.map(objData.children, (val) => { 
                                        return _.map(val.children, (items) => { return items.BranchWithKioskAll })
                                    })
                                })
                            }
                            
                            result = _.flatten(data)
                            authen_code = (result && result.length > 0) ? result.join(',') : null
                            param = { BranchCode: authen_code }
                        break
                        default:
                            authen_code = dataItems.EmployeeCode
                            param = { CAID: authen_code }
                        break
                    }

                    this.setState({ authen: authen_code })

                    this.loadPortfolioChart(param)

                }
            }
            
        }
    }
    
    render() {
        const { modal, dataCriteria: { dataItems } } = this.props
        const { data, load_config, progress_enable } = this.state

        let title_name = ''
        if(dataItems && in_array(dataItems.GroupData, ['Region', 'Area', 'Zone'])) {
            title_name = `${ (dataItems && dataItems.EmployeeName) ? `${dataItems.EmployeeName}` : '' } ${(dataItems && dataItems.ZoneDigit) ? `(${dataItems.ZoneDigit})` : ''}`
        } else {
            if(dataItems && dataItems.GroupData == 'Branch') {
                title_name = `${(dataItems && dataItems.BranchName) ? `${dataItems.BranchName}` : ''}`
            } 
            else if(dataItems && dataItems.GroupData == 'Kiosk') {
                if(dataItems && dataItems.BranchFullDigit.length == 3) {
                    title_name = `${(dataItems && dataItems.BranchHeadQuarter) ? `${dataItems.BranchHeadQuarter} (ไม่รวม Kiosk)` : ''}`
                } else {
                    title_name = `${(dataItems && dataItems.BranchHeadQuarter) ? `${dataItems.BranchHeadQuarter}` : ''} ${ (dataItems && dataItems.EmployeeName) ? `> ${dataItems.EmployeeName}` : '' }`
                }                
            } 
            else {
                title_name = `${(dataItems && dataItems.BranchName) ? `${dataItems.BranchName}` : ''} ${ (dataItems && dataItems.EmployeeName) ? `> ${dataItems.EmployeeName}` : '' }`
            }
            
        }

        return (
            <Modal 
                title={`${title_name}`}
                visible={modal.portfolio_summary_chart}
                footer={null}
                onCancel={this.handleClose}                   
                className={`${(progress_enable) ? cls['customer_modal_fig'] : cls['customer_modal']} ${cls['sh300']}`}
                maskClosable={false}
                width="660px"
            >
                <Loader visible={progress_enable} {...load_config} style={{ margin: '10% auto 0 auto'}} />
                { (this.state.data && !_.isEmpty(data)) && (<PortfolioChart item={{PORTFOLIO_QUALITY_CHART: data}} />) }
            </Modal>
        )
    }

    handleClose = () => {
        const { onModalClose } = this.props
        this.setState({ 
            data: [],
            authen: null,
            progress_enable: true
        })
        
        onModalClose()
    }

    loadPortfolioChart = (param) => {
        getPortfolioSummaryDashboardAPI(param).then((resp) => {       
            resp.data.then(data => {
                this.setState({ 
                    data: data,
                    progress_enable: false
                })   
            })  
        })
    }


}

const gridGridMangementWithCookies = withCookies(GridMangement)
const formGridManagement = Form.create()(gridGridMangementWithCookies)
export default connect(
    (state) => ({
        latest_import: state.latest_import_info,
        master_option: state.nano_dashboard_filter_option
    }),
    {
        GET_LATESTIMPORT: latestDateImport,
        GET_OPTION_FILTER: getNanoManagementOptionFilter
    }
)(formGridManagement)


