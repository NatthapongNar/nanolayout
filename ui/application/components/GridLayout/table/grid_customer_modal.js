import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { withCookies } from 'react-cookie'
import { DatePicker, Table, Modal, Timeline, notification, Icon, Form, Row, Col, Input, InputNumber, Slider, TreeSelect, Select, Radio, Checkbox, Button, Collapse, Popover  } from 'antd'
import { in_array, str_replace, localStorageRead, roundFixed, numberWithCommas, largeNumberToShort } from '../../../containers/Layouts/function'
import { gridCustomerByAuth } from  '../../../containers/GridLayout/api'
import { customer_column_modal } from './columns/customer_column_modal'
import { CustomerSubList } from '../../../actions/grid_management'

import XLSX from 'xlsx'

import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

const Option = Select.Option
const FormItem = Form.Item
const InputGroup = Input.Group
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const ButtonGroup = Button.Group
const Panel = Collapse.Panel
const TimelineItem = Timeline.Item

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

const info_content = (
    <div style={{ padding: '5px 3px' }}>
        <Timeline>
            <TimelineItem dot={<Icon type="play-circle" style={{ fontSize: '16px' }} />}><b>DPD Bucket</b></TimelineItem>
            <TimelineItem><b>W0</b> = 0 Day</TimelineItem>
            <TimelineItem><b>W1-2</b> = 1-14 Day [ <b>W1</b> = 1-7 Day, <b>W2</b> = 8-14 Day ]</TimelineItem>
            <TimelineItem><b>W3-4</b> = 15-30 Day [ <b>W3</b> = 15-21 Day, <b>W4</b> = 22-30 Day ]</TimelineItem>
            <TimelineItem><b>XDay</b> = 1-30 Day</TimelineItem>
            <TimelineItem><b>M1-2</b> = 31-90 Day[ <b>M1</b> = 31-60 Day, <b>M2</b> = 61-90 Day ]</TimelineItem>
            <TimelineItem><b>NPL</b> = 90+ Day</TimelineItem>
        </Timeline>
        <Timeline>
            <TimelineItem dot={<Icon type="play-circle" style={{ fontSize: '16px' }} />}><b>Status รายลูกค้า (P1-P5)</b></TimelineItem>
            <TimelineItem><b>P1</b> = ลูกค้าค้าง Due เป็นระดับ Xday ขึ้นไป</TimelineItem>
            <TimelineItem><b>P2</b> = ลูกค้าค้าง Due ตั้งแต่ 1 วันขึ้นไป แต่ยังไม่เป็น Xday</TimelineItem>
            <TimelineItem><b>P3</b> = ลูกค้าปกติ ที่มี Due จ่ายตรงงวดนั้นๆ</TimelineItem>
            <TimelineItem><b>P4</b> = ลูกค้าที่จ่ายค่างวดจบใน Week นั้นๆแล้ว</TimelineItem>
            <TimelineItem><b>P5</b> = ลูกค้าที่จ่ายค่างวดจบใน Month นั้นๆแล้ว</TimelineItem>
        </Timeline>
    </div>
)

class CustomerDashboard extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props

        this.state = {
            data: {
                source: [],
                progress: false
            },
            assignModal: {
                data: null,
                isOpen: false
            },
            market_list: [],
            filters: {
                AuthID: null,
                MarketCode: null,
                CustomerName: null,
                ApplicationNo: null,
                ViewType: [],
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

    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    handleTableCollapse = () => {
        const { handleExpend } = this.state
        this.setState({ handleExpend: !handleExpend })
    }

    handleClose = () => {
        const { onModalClose, form } = this.props
        this.setState({ 
            filters: _.assignIn({}, this.state.filters, { 
                AuthID: null, 
                ModeType: [],
                MarketCode: null,
                CustomerName: null,
                ApplicationNo: null,
                ViewType: [],
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
            }),
            handleDPD: false,
            handleWDPD: false,
            handleMDPD: false,
            OverdueTypes: {
                WDPD: false,
                MDPD: false
            },
            handleOldNPL: false,
            handleExpend: false
        })

        form.resetFields() 
        onModalClose()
    }
    
    componentWillReceiveProps(props) {
        if(props) {
            const { filters } = this.state
            const { modal } = props

            // AUTO - LOAD CUSTOMER DASHBOARD 
            if(modal.customer) {

                let initial_mode_type = (props.modeType == 'Performance') ? ['Loan'] : ['Collect']
                if((!filters.AuthID || filters.AuthID !== modal.auth)) {
                    let data_filter = _.assignIn({}, this.state.filters, { ViewType: initial_mode_type })
                    this.handleLoadCustomerList(data_filter, modal.auth, false)
                }

                if(!_.isEmpty(props.cust_subgrid) && _.isEmpty(this.state.market_list)) {
                  
                    const master_data = _.clone(props.cust_subgrid, true)
                    let findMarket = _.chain(master_data).map((v) => { return { key: v.MarketCode, value: v.MarketCode, label: `${v.MarketCode}-${v.MarketName}` } }).uniq().value()
                    let market_item = _.uniqBy(findMarket, 'key')
                    let master_market = [
                        {
                            label: 'เลือกตลาดทั้งหมด',
                            value: _.map(market_item, (v) => { return v.key }).join(','),
                            key: 'market_all',
                            children: market_item,
                            className: `ttu`
                        }
                    ]
                    this.setState({ market_list: master_market })
                }

            }
        }        
    }
    
    // shouldComponentUpdate(nextProps, nextState) {
    //     return this.props.modal !== nextProps.modal ||
    //            this.props.modeType !== nextProps.modeType ||
    //            this.props.locales !== nextProps.locales ||
    //            this.props.form !== nextProps.form ||
    //            this.state.data !== nextState.data ||       
    //            this.state.filters !== nextState.filters ||
    //            this.state.handleDPD !== nextState.handleDPD ||
    //            this.state.handleWDPD !== nextState.handleWDPD || 
    //            this.state.handleMDPD !== nextState.handleMDPD || 
    //            this.state.OverdueTypes !== nextState.OverdueTypes ||
    //            this.state.handleExpend !== nextState.handleExpend || 
    //            this.state.expandedKeys !== nextState.expandedKeys ||
    //            this.state.pagination !== nextState.pagination ||
    //            this.state.market_list !== nextState.market_list  ||
    //            this.state.assignModal !== nextState.assignModal
    // }
   
    render() {
        const { data, assignModal, pagination } = this.state
        const { modal } = this.props

        return (
            <Modal 
                title="Customer Information"
                visible={modal.customer}
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

    handleCustomerSearchSubmit = (e) => {
        e.preventDefault()
        const { form: { validateFields } } = this.props
        
        validateFields((err, objField) => {
            if(!err) {
                this.handleLoadCustomerList(objField, this.state.filters.AuthID, true)
            }            
        })
    }

    handleReset = () => {
        this.setState({ 
            handleDPD: false,
            handleWDPD: false,
            handleMDPD: false,
            OverdueTypes: {
                WDPD: false,
                MDPD: false
            },
            filters: _.assignIn({}, this.state.filters, {
                OverdueType: null,
                OverdueFrom: null,
                OverdueTo: null
            }) 
        })

        this.props.form.resetFields() 
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

    handleUpdateCellAssignment = (params) => {
        let { data } = this.state

        _.assign(
            _.filter(data.source, { ApplicationNo: params.ApplicationNo })[0],
            {
                ColumnCell: params.ColumnCell,
                MarketTypeID: params.MarketTypeID
            }
        )

        this.setState({ data: data })
    }

    handleResetCellAssignment = (params) => {
        let { data } = this.state

        _.assign(
            _.filter(data.source, { ApplicationNo: params.ApplicationNo })[0],
            {
                ColumnCell: null,
                MarketTypeID: null
            }
        )

        this.setState({ data: data })
    }


    handleOpenCellAssignment = (dataItems) => {
        this.setState({ 
            assignModal: {
                data: dataItems,
                isOpen: true
            } 
        })
    }

    handleCloseCellAssignment = () => {
        this.setState({ assignModal: { data: null, isOpen: false } })
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

        let market_list = null
        if(param.MarketName) {
            if(_.isArray(param.MarketName)) 
                market_list = param.MarketName
            else
                market_list = param.MarketName.split(',')
        }

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

        let view_mode = null
        if(param.ViewType) {
            if(_.isArray(param.ViewType)) 
                view_mode = param.ViewType
            else
                view_mode = param.ViewType.split(',')
        }

        let select_new_npl = null
        if(param.NPLFlag) {
            if(_.isArray(param.NPLFlag)) 
                select_new_npl = param.NPLFlag
            else
                select_new_npl = param.NPLFlag.split(',')
        }

        let enable_checkDPD = in_array('Collect', form.getFieldValue('ViewType')) ? true : false
        
        let setParam = {
            AuthID: auth_id,
            MarketName: (market_list && market_list.length > 0) ? market_list.join(',') : null,
            CustomerName: (param.CustomerName && param.CustomerName !== '') ? param.CustomerName : null,
            ApplicationNo: (param.AppNo && param.AppNo !== '') ? param.AppNo : null,
            RegionID: (param.Region && param.Region.length > 0) ? param.Region.join(',') : null,
            AreaID: (uniq_area_selected && uniq_area_selected.length > 0) ? uniq_area_selected.join(',') : null,
            ZoneValue: (uniq_zone_selected && uniq_zone_selected.length > 0) ? uniq_zone_selected.join(',') : null,
            BranchCode: (param.Branch && param.Branch.length > 0) ? param.Branch.join(',') : null,
            EmployeeCode: (param.Employee && param.Employee.length > 0) ? param.Employee.join(',') : null,
            AppDateType: (param.dateType && param.dateType !== '' && param.AppRange && param.AppRange.length > 0) ? param.dateType : null,
            AppDateFrom: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[0]).format('YYYY-MM-DD') : null,
            AppDateTo: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[1]).format('YYYY-MM-DD') : null,
            CycleDayFrom: (param.DayRange && param.DayRange.length > 0) ? param.DayRange[0] : null,
            CycleDayTo: (param.DayRange && param.DayRange.length > 0) ? param.DayRange[1] : null,
            OverdueFrom:(this.state.handleWDPD) ? param.OverdueFrom1 : null,
            OverdueTo: (this.state.handleWDPD) ? param.OverdueFrom2 : null,
            MonthOverdueFrom: (this.state.handleMDPD) ? param.OverdueTo1 : null,
            MonthOverdueTo: (this.state.handleMDPD) ? param.OverdueTo2 : null,         
            Topup: (topup_list && topup_list.length > 0) ? topup_list.join(',') : null,
            Product: (product_list && product_list.length > 0) ? product_list.join(',') : null,
            Isactive: (param.CustomerStatus) ? param.CustomerStatus:'Active',
            NPLFlag: (enable_checkDPD && select_new_npl && select_new_npl.length > 0) ? select_new_npl.join(','): null,
            Optional: (option_list && option_list.length > 0) ? option_list.join(',') : null,
            ModeType: (view_mode && view_mode.length > 0) ? view_mode.join(',') : null
        }

        this.setState({ data: _.assignIn({}, this.state.data, { progress: true }), filters: _.assignIn({}, this.state.filters, setParam) })

        GET_CUSTINFO_SUBGRID(_.assignIn({}, this.state.filters, setParam))

        let getCustSubData = setInterval(() => {
            if(!_.isEmpty(this.props.cust_subgrid)) {
                // CLEAR RECALL
                clearInterval(getCustSubData)
                
                gridCustomerByAuth(this.state.filters).then(resp => {
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
                        const { cust_subgrid, mktLayout } = this.props
                
                        _.map(resp, (v) => {
                            // SET FUNCTION TO DATA STATE FOR USE ON COLUMNS
                            v.isMktLayout = mktLayout
                            v.handleUpdateNote = this.handleUpdateNote
                            v.handleOpenCellAssignment = this.handleOpenCellAssignment
                            v.handleUpdateCellAssignment = this.handleUpdateCellAssignment
                            v.handleResetCellAssignment = this.handleResetCellAssignment

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

    handleOverdueUseable = (checkedList) => {
        let data_type = checkedList.target.value
        let data_check = checkedList.target.checked

        if(data_type == 'W') {
            this.setState({ 
                handleWDPD: data_check,
                OverdueTypes: _.assignIn({}, this.state.OverdueTypes, { WDPD: data_check })
            })
        } 

        if(data_type == 'M') {
            this.setState({ 
                handleMDPD: data_check,
                OverdueTypes: _.assignIn({}, this.state.OverdueTypes, { MDPD: data_check })
            })
        }

    }

    handleModeType = (modeType) => {
        if(!in_array('Collect', modeType)) {
            this.setState({ 
                handleDPD: false,
                handleWDPD: false, 
                handleMDPD: false,
                OverdueTypes: _.assignIn({}, this.state.OverdueTypes, { WDPD: false, MDPD: false })
            })
        }
    }

    handleFieldOption = (selectedKeys) => {        
        if(!_.isEmpty(selectedKeys)) {
            let master_dpd = selectedKeys.join(',')
            let data_valid = _.map(master_dpd.split(','), (v) => {
                return (in_array(v, ["W0", "W1", "W2", "W3", "W4", "XDay", "M1", "M2", "NPL", "S_W0", "S_W1", "S_W2", "S_W3", "S_W4", "S_XDay", "S_M1", "S_M2", "S_NPL"])) ? 'TRUE' : 'FALSE'
            })

            if(in_array('TRUE', data_valid)) {
                this.setState({ 
                    handleDPD: true,
                    handleWDPD: false, 
                    handleMDPD: false,
                    OverdueTypes: _.assignIn({}, this.state.OverdueTypes, { WDPD: false, MDPD: false })
                })
            }

        } else {
            this.setState({ handleDPD: false  })
        }
    }

    //SET HEAD PANEL
    handleCustomerHeadFilter = () => {
        const { OverdueTypes, handleExpend, pagination } = this.state
        const { handleField, modeType, config, locales, form } = this.props
        const { getFieldDecorator } = form
        const { RangePicker } = DatePicker

        const field_colon_label = false
        const lang_field_filters = config.lang[locales.region_type].grid.customer.filters

        const wkCycleDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        
        let enable_checkDPD = in_array('Collect', form.getFieldValue('ViewType')) ? true : false
        const initial_mode_type = (modeType == 'Performance') ? ['Loan'] : ['Collect']

        const MASTER_OPTION = [
            {
                label: 'DECISION STATUS',
                value: 'CA,TM,FC,ZM,OP,A,C,R,E',
                key: 'decision_all',
                children: [
                    { label: 'On Hand CA', value: 'CA', key: 'CA' },
                    { label: 'On Hand TM', value: 'BM', key: 'BM' },
                    { label: 'On Hand FC', value: 'FC', key: 'FC' },
                    { label: 'On Hand ZM', value: 'ZM', key: 'ZM' },
                    { label: 'On Hand Oper', value: 'OP', key: 'OP' },
                    { label: 'Oper Return', value: 'OR', key: 'OR' },
                    { label: 'Approved', value: 'A', key: 'A' },
                    { label: 'Cancel', value: 'C', key: 'C' },
                    { label: 'Reject', value: 'R', key: 'R' },
                    { label: 'Close Account (E)', value: 'E', key: 'E' }
                ]
            },
            {
                label: 'Start DPD Bucket',
                value: 'S_W0,S_W1,S_W2,S_W3,S_W4,S_XDay,S_M1,S_M2,S_NPL',
                key: 'start_bucket_all',
                children: [
 
                    { label: 'W0', value: 'S_W0', key: 'S_W0', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W1', value: 'S_W1', key: 'S_W1', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W2', value: 'S_W2', key: 'S_W2', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W3', value: 'S_W3', key: 'S_W3', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W4', value: 'S_W4', key: 'S_W4', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'XDay', value: 'S_XDay', key: 'S_XDay', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'M1', value: 'S_M1', key: 'S_M1', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'M2', value: 'S_M2', key: 'S_M2', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'NPL', value: 'S_NPL', key: 'S_NPL', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) }
                ],
                className: `ttu`,
                disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD)
            },
            {
                label: 'Now DPD Bucket',
                value: 'W0,W1,W2,W3,W4,XDay,M1,M2,NPL',
                key: 'bucket_all',
                children: [
                    { label: 'W0', value: 'W0', key: 'W0', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W1', value: 'W1', key: 'W1', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W2', value: 'W2', key: 'W2', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W3', value: 'W3', key: 'W3', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'W4', value: 'W4', key: 'W4', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'XDay', value: 'XDay', key: 'XDay', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'M1', value: 'M1', key: 'M1', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'M2', value: 'M2', key: 'M2', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) },
                    { label: 'NPL', value: 'NPL', key: 'NPL', disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD) }
                ],
                className: `ttu`,
                disabled: (OverdueTypes.WDPD || OverdueTypes.MDPD)
            },           
            {
                label: 'Weekly Cycle Due',
                value: wkCycleDay.join(','),
                key: 'Weekly_all',
                children: _.map(wkCycleDay, (d) => { return { label: `${d}`, value: `${d}`, key: `${d}` } }),
                className: `ttu`   
            },
            {
                label: 'Yesterday Priority',
                value: ['YP1','YP2','YP3','YP4','YP5'].join(','),
                key: 'YesterdayPriority_all',
                children: _.map(['YP1','YP2','YP3','YP4','YP5'], (d) => { return { label: `${d.replace('Y', '')}`, value: `${d}`, key: `Y${d}` } }),
                className: `ttu`   
            },
            {
                label: 'Today Priority',
                value: [1,2,3,4,5].join(','),
                key: 'Priority_all',
                children: _.map([1,2,3,4,5], (d) => { return { label: `P${d}`, value: `${d}`, key: `${d}` } }),
                className: `ttu`   
            },
            {
                label: 'New Booking (0% WDPD)',
                value: ['New'].join(','),
                key: 'NewBooking_all',
                children: _.map(['New'], (v) => { return { label: `${v}`, value: `${v}`, key: `${v}` } }),
                className: `ttu`   
            }
        ]

        const date_type = getFieldDecorator('dateType', { initialValue: 'AppDate' })
        (
            <Select className={'ttu'}>
                <Option value="AppDate">APP DATE</Option>
                <Option value="StatusDate">STATUS DATE</Option>
                <Option value="SetUpDate">SET UP DATE</Option>
                <Option value="LastPaymentDate">LAST PAYMENT DATE</Option>
            </Select>
        )
        
        const switch_wk_overdue = (<Checkbox value="WDPD" className={`${cls['ph1']} ${cls['mh0']}`} value="W" checked={this.state.handleWDPD} onChange={this.handleOverdueUseable} disabled={this.state.handleDPD || !enable_checkDPD}>WDPD</Checkbox>)
        const switch_mth_overdue = (<Checkbox value="MDPD" className={`${cls['ph1']} ${cls['mh0']}`} value="M" checked={this.state.handleMDPD} onChange={this.handleOverdueUseable} disabled={this.state.handleDPD || !enable_checkDPD}>MDPD</Checkbox>)

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

                    <span className="fa-stack fa-lg fr pointer" onClick={this.handleTableCollapse} style={{ display: 'none' }}>
                        <i className="fa fa-circle fa-stack-2x"></i>
                        <i className={`fa ${(!handleExpend) ? 'fa-expand':'fa-compress'} fa-stack-1x fa-inverse`} style={{ transform: 'rotate(-45deg)' }}></i>
                    </span>
                    
                    <span className="fr pointer f3 mr1 red" onClick={this.handlePDFExport}>
                        <Popover className="ttu" placement="top" content={`Export PDF`}><Icon type="file-pdf" theme="outlined" /></Popover>
                    </span>

                    <span className="fr pointer f3 mr1 green" onClick={this.handleExcelExport}>
                        <Popover className="ttu" placement="top" content={`Export Excel`}><Icon type="file-excel" theme="outlined" /></Popover>
                    </span>

                    <span className="fr pointer f3 mr1 blue">
                        <Popover className="ttu" placement="leftTop" content={info_content}><Icon type="info-circle" /></Popover>
                    </span>

                </div>
                <div>

                    <Collapse defaultActiveKey={[]} className={`${cls['collapse_filter']}`}>
                        <Panel header={<header><Icon type="search" /> FILTER CRITERIA</header>} key="1">
                            <Form onSubmit={this.handleCustomerSearchSubmit}>
                                <Row gutter={gutter_init} className={`${cls['mv0']}`}>
                                    <Col span={8}>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ${cls['mb0']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('CustomerStatus', { initialValue: 'Active' })
                                                (
                                                    <RadioGroup>
                                                        <Radio value="Active" className={`${cls['ph1']} ${cls['mh0']}`}>Active</Radio>
                                                        <Radio value="Inactive" className={`${cls['ph1']} ${cls['mh0']}`}>Inactive</Radio>
                                                        <Radio value="All" className={`${cls['ph1']} ${cls['mh0']}`}>All</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ${cls['mb0']} ttu fw5`} colon={field_colon_label}>
                                        {
                                            getFieldDecorator('ViewType', { initialValue: initial_mode_type })(
                                                <CheckboxGroup onChange={this.handleModeType}>
                                                    <Checkbox value="Loan" className={`${cls['ph1']} ${cls['mh0']}`}>Set Up</Checkbox>
                                                    <Checkbox value="Collect" className={`${cls['ph1']} ${cls['mh0']}`}>Collect</Checkbox>
                                                </CheckboxGroup>
                                            )
                                        }   
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ${cls['mb0']} ttu fw5`} colon={field_colon_label}>
                                        {
                                            getFieldDecorator('TopupStatus', { initialValue: ['Y', 'N'] })(
                                                <CheckboxGroup>
                                                    <Checkbox value="Y" className={`${cls['ph1']} ${cls['mh0']}`}>Topup</Checkbox>
                                                    <Checkbox value="N" className={`${cls['ph1']} ${cls['mh0']}`}>Not Topup</Checkbox>
                                                </CheckboxGroup>
                                            )
                                        }   
                                        </FormItem>
                                    </Col>
                                    <Col span={3}>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ${cls['mb0']} ttu fw5`} colon={field_colon_label}>
                                        {
                                            getFieldDecorator('Product', { initialValue: ['Nano', 'Micro'] })(
                                                <CheckboxGroup>
                                                    <Checkbox value="Nano" className={`${cls['ph1']} ${cls['mh0']}`}>Nano</Checkbox>
                                                    <Checkbox value="Micro" className={`${cls['ph1']} ${cls['mh0']}`}>Micro</Checkbox>
                                                </CheckboxGroup>
                                            )
                                        }   
                                        </FormItem>
                                    </Col>
                                    <Col span={4}>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ${cls['mb0']} ttu fw5`} colon={field_colon_label}>
                                        {
                                            getFieldDecorator('NPLFlag', {})
                                            (
                                                <CheckboxGroup disabled={!enable_checkDPD}>
                                                    <Checkbox value={config.month.shortname_digit.join(',')} className={`${cls['ph1']} ${cls['mh0']}`}>New NPL</Checkbox>
                                                    <Checkbox value="Existing" className={`${cls['ph1']} ${cls['mh0']}`}>Old NPL</Checkbox>
                                                </CheckboxGroup>
                                            )
                                        }   
                                        </FormItem>
                                    </Col>
                                </Row>                                
                                <Row gutter={gutter_init}>
                                    <Col span={6}>
                                        <FormItem label="Region" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Region', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getRegionSelectItem()}
                                                        treeDefaultExpandAll={true}
                                                        size="default"
                                                        className={`${styles['padding_none']}`}
                                                        disabled={true || handleField.region}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Area / Zone" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Area', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getAreaSelectItem()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        size="default"
                                                        className={`${styles['padding_none']}`}
                                                        disabled={true || handleField.area}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Branch" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Branch', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getBranchSelectItem()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        dropdownStyle={{ height: '400px' }}
                                                        size="default"                                                        
                                                        className={`${styles['padding_none']}`}
                                                        disabled={true || handleField.branch}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Employee" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Employee', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getCANameSelect()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        dropdownMatchSelectWidth={true}
                                                        dropdownStyle={{ height: '400px' }}
                                                        size="default"
                                                        className={`${styles['padding_none']}`}
                                                        disabled={true || handleField.ca}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={gutter_init}>
                                    <Col span={6}>
                                        <FormItem label={date_type} className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                           {
                                                getFieldDecorator('AppRange', { initialValue: [] })
                                                (
                                                    <RangePicker
                                                        format="DD/MM/YYYY"
                                                        treeNodeLabelProp="label"
                                                        placeholder={
                                                            [
                                                                lang_field_filters.register_field.start_register,
                                                                lang_field_filters.register_field.end_register
                                                            ]
                                                        }
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Market Name" className={`${cls['form_item']} ${cls['form_p5']} ${cls['market_filter']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('MarketName')
                                                (
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.state.market_list}
                                                        treeDefaultExpandedKeys={[`market_all`]}
                                                        dropdownMatchSelectWidth={true}
                                                        dropdownStyle={{ height: '400px' }}
                                                        size="default"
                                                        className={`${styles['padding_none']}`}
                                                        disabled={(this.state.market_list.length >= 2) ? false : true}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Customer Name" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('CustomerName')(<Input className={`ttu`} />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Application No" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('AppNo')(<Input className={`ttu`} />)
                                            }
                                        </FormItem>                                        
                                    </Col>
                                </Row>                                
                                <Row gutter={gutter_init}>
                                    <Col span={6}>
                                        <FormItem label="Optional" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Optional')
                                                (
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={MASTER_OPTION}
                                                        treeDefaultExpandedKeys={[]}
                                                        size="default"
                                                        dropdownStyle={{ height: '400px' }}
                                                        className={`${styles['padding_none']}`}
                                                        onChange={this.handleFieldOption}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Day Cycle Due" className={`${cls['form_item']} ${cls['fix_height']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('DayRange', { initialValue: [0, 31] })
                                                (
                                                    <Slider
                                                        min={0}
                                                        max={31}
                                                        marks={{ 0: '0', 5: '5', 10: '10', 15: '15', 20: '20', 25: '25', 31: '31' }}
                                                        range
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={3}>
                                        <InputGroup compact>
                                            <FormItem label={switch_wk_overdue} className={`${cls['form_item']} ${cls['fix_height']} ${cls['ma0']} ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('OverdueFrom1', { initialValue: 0 })
                                                    (<InputNumber min={0} max={30} disabled={!OverdueTypes.WDPD} style={{width: '50%'}} />)
                                                }
                                                {
                                                    getFieldDecorator('OverdueFrom2', { initialValue: 30 })
                                                    (<InputNumber min={0} max={30} disabled={!OverdueTypes.WDPD} style={{width: '50%'}} />)
                                                }
                                            </FormItem>                              
                                        </InputGroup>
                                    </Col>
                                    <Col span={3}>
                                        <InputGroup compact>
                                            <FormItem label={switch_mth_overdue} className={`${cls['form_item']} ${cls['fix_height']} ${cls['ma0']} ttu fw5`} colon={field_colon_label}>
                                                {
                                                    getFieldDecorator('OverdueTo1', { initialValue: 1 })
                                                    (<InputNumber min={1} max={999} size="default" disabled={!OverdueTypes.MDPD} style={{width: '50%'}} />)
                                                }
                                                {
                                                    getFieldDecorator('OverdueTo2', { initialValue: 99 })
                                                    (<InputNumber min={1} max={999} size="default" disabled={!OverdueTypes.MDPD} style={{width: '50%'}} />)
                                                }
                                            </FormItem>                                     
                                        </InputGroup>
                                    </Col>
        
                                    <Col span={6} style={{ paddingTop: '35px' }}>        
                                        <FormItem style={{ marginBottom: '0px' }} className={`fr`}>
                                            <ButtonGroup>
                                                <Button type="dashed" className={`ttu`} onClick={this.handleReset}>Clear</Button>
                                                <Button type="primary" className={`ttu`} htmlType="submit">
                                                    <Icon type="search" /> Search
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
        )
    }

    // SET FOOTER
    handleCustomerFooter = (currentPageData) => {
        const { data, filters } = this.state
        const { config, locales } = this.props

        const lang_field_default = config.lang[locales.region_type].grid.default
        const parentTable = document.querySelector(`.${cls['grid_customer']}`)
        const default_class = ['ttu tl', 'tl', 'tl', 'tc',  'tc', 'tc', 'tc', 'tl', 'tc', 'tc', 'tr', 'tc', 'tc', 'tr', 'tr', 'tr', 'tc', 'tr', 'tr', 'tc', 'tc', 'tc', 'tr', 'tr', 'tr', 'tr', 'tr', 'tl', 'tc'] 
        
        const short_numtodigit = 7
        if(parentTable) {
            let grid_size = []
            _.forEach(default_class, (v, i) => { 
                let el_target = $(parentTable.querySelector(`.mktcol_modal_${i}`)).outerWidth(true)
                let width_outer = (el_target && !isNaN(el_target)) ? el_target : null
                if(width_outer) {
                    grid_size.push(width_outer)
                }
            })

            let credit_limit = roundFixed(_.sumBy(currentPageData, (v) => { return v.CreditLimit }), 0)
            let credit_limit_all = roundFixed(_.sumBy(data.source, (v) => { return v.CreditLimit }), 0)

            let principle_start = roundFixed(_.sumBy(currentPageData, (v) => { return v.PrincipleStart }), 0)
            let principle_now = roundFixed(_.sumBy(currentPageData, (v) => { return v.Principle }), 0)

            let principle_allstart = roundFixed(_.sumBy(data.source, (v) => { return v.PrincipleStart }), 0)
            let principle_allnow = roundFixed(_.sumBy(data.source, (v) => { return v.Principle }), 0)

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
                    26: (filters.ModeType && filters.ModeType == 'Loan') ? numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'LastPaymentAmt'), 0), short_numtodigit)) : 0
                },
                all: {
                    0: lang_field_default.footer.total_title,
                    11: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Limit'), 2), short_numtodigit, 2)),
                    13: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Principle'), 2), short_numtodigit, 2)),
                    18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Week_Installment'), 2), short_numtodigit, 2)),
                    19: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_Installment'), 0), short_numtodigit)),
                    24: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'OverdueAmt'), 0), short_numtodigit)),
                    25: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_AmtPastDue'), 0), short_numtodigit)),
                    26: (filters.ModeType && filters.ModeType == 'Loan') ? numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'LastPaymentAmt'), 0), short_numtodigit)) : 0
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

                                    let content = null
                                    switch(i) {
                                        case 11:
                                            content = (<div style={{ fontSize: '1em' }}>Total Limit { numberWithCommas(credit_limit) }</div>)
                                        break
                                        case 13:
                                            content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (total_os_start) ? `${total_os_start} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)
                                        break
                                        default:
                                        content = ''
                                        break
                                    }

                                    // let content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (total_os_start) ? `${total_os_start} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)

                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? `${cls['strnorap']} ${cls['br0']}`:''}`} style={{ width: size, maxWidth: size }}>
                                            {
                                               (in_array(i, [11, 13])) ? (<Popover content={content}>{`${(cur_row && cur_row !== '') ? cur_row : ''}`}</Popover>) : cur_row
                                               // ((i+1) == 14) ? (<Popover content={content}>{`${(cur_row && cur_row !== '') ? cur_row : ''}`}</Popover>) : cur_row
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

                                    let content = null
                                    switch(i) {
                                        case 11:
                                            content = (<div style={{ fontSize: '1em' }}>Total Limit { numberWithCommas(credit_limit_all) }</div>)
                                        break
                                        case 13:
                                            content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (overview_os) ? `${numberWithCommas(roundFixed(overview_os, 0))} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)
                                        break
                                        default:
                                            content = ''
                                        break
                                    }

                                    // let content = (<div style={{ fontSize: '1em' }}>O/S ต้นเดือน { (overview_os) ? `${numberWithCommas(roundFixed(overview_os, 0))} ${(diff_os && diff_os > 0) ? `(-${numberWithCommas(diff_os)})`:''}` : 0 }</div>)

                                    return (
                                        <div key={(i+1)} className={`${cls['item_customer_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? cls['strnorap']:''}`} style={{ width: size, maxWidth: size }}>
                                        {   
                                            (in_array(i, [11, 13])) ? (<Popover content={content}>{`${(all_row && all_row !== '') ? all_row : ''}`}</Popover>) : all_row
                                            // ((i+1) == 14) ? (<Popover content={content}>{`${(all_row && all_row !== '') ? all_row : ''}`}</Popover>) : all_row
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

    // SET FILTER HANDLER
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

            let calist_data = _.orderBy(master_calist, sequence_no)
            let region_filter = getFieldValue("Region")
            let area_filter = getFieldValue("Area")
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

    handlePDFExport = () => {
        const { data } = this.state

        const col_root_header = 'CUSTOMER INFORMATION';

        let docDefinition = {
            info: {
                title: 'Customer Information',
                author: 'Nano Layout',
                subject: 'Customer Information',
                keywords: 'Customer Information',
             },
             header: {
                columns: [
                    {},
                    { text: col_root_header, style: 'header', alignment: 'center', margin: [ 5, 12, 0, 5 ] },
                    { text: 'ON DATE : ' + `${moment().format('DD/MM/YYYY HH:mm')}`, style: 'header', alignment: 'right', margin: [ 5, 12, 5, 5 ] }                                      
                ]
             },
             content: [
                {
                    style: 'tableStyle',
                    table: {
                        headerRows: 2,
                        widths: 'auto',
                        body: [                
                            [
                                {text: 'CUSTOMER', style: 'tableHeader', alignment: 'center', border: [true, true, true, false]}, 
                                {text: 'LOCATION', style: 'tableHeader', colSpan: 2, alignment: 'center', border: [true, true, true, true]},
                                {}, 
                                {text: 'STATUS INFO', style: 'tableHeader', colSpan: 3, alignment: 'center', border: [true, true, true, true]},
                                //{}, 
                                {},
                                {},
                                {text: 'SETUP', style: 'tableHeader', alignment: 'center', border: [true, true, true, false]},

                                {text: 'O/S BAL.', style: 'tableHeader', colSpan: 2, alignment: 'center', border: [true, true, true, true]},
                                {}, 

                                {text: 'CYCLE DUE', style: 'tableHeader', colSpan: 4, alignment: 'center', border: [true, true, true, true]},
                                {}, 
                                {},
                                {},

                                {text: 'DPD BUCKET', style: 'tableHeader', colSpan: 2, alignment: 'center', border: [true, true, true, true]}, 
                                {}, 

                                {text: 'OVERDUE INFO', style: 'tableHeader', colSpan: 5, alignment: 'center', border: [true, true, true, true]},
                                {}, 
                                {},
                                {},
                                {}
                            ],
                            [
                                {text: 'NAME', style: 'tableHeader', alignment: 'center', border: [true, false, true, true]}, 
                                {text: 'MARKET', style: 'tableHeader', alignment: 'center', border: [true, false, true, true]},

                                {text: 'BR', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                
                                {text: 'CA', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}, 
                                //{text: 'ST', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}, 
                                {text: 'DATE', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'AMT', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},

                                {text: 'DATE', style: 'tableHeader', alignment: 'center', border: [true, false, true, true]},

                                {text: 'START', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}, 
                                {text: 'NOW', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                     
                                {text: 'DUE', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}, 
                                {text: 'DAY', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'WK', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'MTH', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},

                                {text: 'START', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'NOW', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},

                                {text: 'DAY', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}, 
                                {text: 'AMT', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'MPD', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'LAST PMT', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]},
                                {text: 'NOTE', style: 'tableHeader', alignment: 'center', border: [false, false, true, true]}
                                
                            ]                            
                        ]
                    }
                }						 
            ],
            styles: {
                header: { fontSize: 10 },
                tableStyle: {
                    margin: [0, 0, 0, 0],
                    fontSize: 8
                },
                tablePanelStyle: {
                    fontSize: 7,
                    margin: [0, 5, 0, 5]
                },
                tableHeader: {
                    color: 'white',
                    fillColor: '#4390df'
                },
                tableContentOdd: {
                    color: 'black',
                    fillColor: '#D1D1D1',
                },

                tableContent: {
                    color: 'black'
                }
            },
            pageSize: 'A4',
            pageOrientation : 'landscape',
            pageMargins: [5, 40, 5, 5],
            defaultStyle: { font: 'Kanit' }					 
        };
        
        if(data && data.source.length > 0) {

            let bucket_group = _.reject(data.source, (o) => { return in_array(o.Cust_DPDBucketNow, ['W0', 'M2', 'NPL']) })
            //let bucket_group = _.reject(data.source, (o) => { return in_array(o.Cust_DPDBucketNow, ['NPL']) })
            let data_sort = _.orderBy(bucket_group, ['CAName', 'MarketName', 'Cust_DPDBucketNow'], ['asc', 'asc', 'asc'])

            
            let overview_os = 0.00
            _.forEach(data.source, (v) =>{ 
                if(v.PrincipleStart && v.PrincipleStart > 0.00) {
                    overview_os = overview_os + parseFloat(v.PrincipleStart)
                } else {
                    overview_os = overview_os + v.Principle
                }
            })

            const short_numtodigit = 8
            let footer_summary = {
                criteria: {
                    Title: 'TOTAL ( W1 - M1 )',
                    Limit: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'Limit'), 0), 8, 2)),
                    PrincipleStart: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'PrincipleStart'), 0), 8, 2)),
                    Principle: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'Principle'), 0), 8, 2)),
                    Week_Installment: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'Week_Installment'), 2), 8, 2)),
                    Mth_Installment: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'Mth_Installment'), 0), short_numtodigit)),
                    OverdueAmt: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'OverdueAmt'), 0), 8, 2)),
                    Mth_AmtPastDue: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'Mth_AmtPastDue'), 0), 8, 2)),
                    LastPaymentAmt: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(bucket_group, 'LastPaymentAmt'), 0), short_numtodigit))
                },
                all: {
                    Title: 'GRAND TOTAL ( W0 - NPL )',
                    Limit: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Limit'), 0), 8, 2)),
                    PrincipleStart: numberWithCommas(largeNumberToShort(roundFixed(overview_os, 0), 8, 2)), //numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'PrincipleStart'), 0), 8, 2)),
                    Principle: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Principle'), 0), 8, 2)),
                    Week_Installment: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Week_Installment'), 0), 8, 2)),
                    Mth_Installment: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_Installment'), 0), short_numtodigit)),
                    OverdueAmt: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'OverdueAmt'), 0), 8, 2)),
                    Mth_AmtPastDue: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'Mth_AmtPastDue'), 0), 8, 2)),
                    LastPaymentAmt: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.source, 'LastPaymentAmt'), 0), short_numtodigit))
                }
            }

            _.each(data_sort, (v, i) => { 

                let pattern = ["น.ส.", "น.ส. ", "นาง", "นาง ", "นาย ", "นาย"];
                
                let custtemp = (v.AccountName && v.AccountName !== '') ? str_replace(pattern, "", v.AccountName) : ''
                let custname = (custtemp && custtemp.length >= 18) ? `${custtemp.substring(0, 17)}...` : custtemp

                let mkt_temp = (v.MarketName && v.MarketName !== '') ? v.MarketName : ''
                let mkt_name = (mkt_temp && mkt_temp.length >= 18) ? `${mkt_temp.substring(0, 17)}...` : mkt_temp

                let branch = (v.BranchCode && v.BranchCode !== '') ? v.BranchCode : ''              
                let caname = (v.CAName && v.CAName !== '') ? v.CAName.split(" ")[0] : ''
                //let status = (v.StatusDigit && v.StatusDigit !== '') ? v.StatusDigit : ''
                let status_date = (v.StatusDate && !_.isEmpty(v.StatusDate)) ? moment(v.StatusDate).format('DD/MM/YY') : '-'
                let limt_amt = (v.Limit && v.Limit > 0) ? numberWithCommas(roundFixed(v.Limit, 0)) : 0
                let setup_date = (v.SetupDate && !_.isEmpty(v.SetupDate)) ? moment(v.SetupDate).format('DD/MM/YY') : '-'
                let os_start = (v.PrincipleStart && v.PrincipleStart > 0) ? numberWithCommas(roundFixed(v.PrincipleStart, 0)) : 0
                let os_bal = (v.Principle && v.Principle > 0) ? numberWithCommas(roundFixed(v.Principle, 0)) : 0               
                let cycle_due = (v.MthCycleDueDay && v.MthCycleDueDay > 0) ? v.MthCycleDueDay : 0
                let cycle_day = (v.WkCycleDue && v.WkCycleDue !== '') ? v.WkCycleDue : ''
                let cycle_wk = (v.Week_Installment && v.Week_Installment > 0) ? numberWithCommas(roundFixed(v.Week_Installment, 0)) : 0
                let cycle_mth = (v.Mth_Installment && v.Mth_Installment > 0) ? numberWithCommas(roundFixed(v.Mth_Installment, 0)) : 0
                let pdp_start = (v.Cust_DPDBucketStart && v.Cust_DPDBucketStart !== '') ? v.Cust_DPDBucketStart : ''
                let pdp_now = (v.Cust_DPDBucketNow && v.Cust_DPDBucketNow !== '') ? v.Cust_DPDBucketNow : ''

                let overdue_day = (v.OverdueDay && v.OverdueDay > 0) ? v.OverdueDay : 0
                let overdue_amt = (v.OverdueAmt && v.OverdueAmt > 0) ? numberWithCommas(roundFixed(v.OverdueAmt, 0)) : 0
                let overdue_mpd = (v.Mth_AmtPastDue && v.Mth_AmtPastDue > 0) ? numberWithCommas(roundFixed(v.Mth_AmtPastDue, 0)) : 0
                let overdue_date = (v.LastPaymentDate && !_.isEmpty(v.LastPaymentDate)) ? moment(v.LastPaymentDate).format('DD/MM/YY') : '-'
                let cause_topic = (v.Cause && v.Cause !== '') ? v.Cause : ''
                let cause_detail = (v.CauseDetail && v.CauseDetail !== '') ? v.CauseDetail : ''
                let cause_note =  (cause_detail && !_.isEmpty(cause_detail)) ? `${cause_topic}: ${cause_detail}` : cause_topic

                let row_style = (i % 2) == 0 ? `tableContent` : `tableContentOdd`
                
                docDefinition.content[0].table.body.push(
                    [
                        {text: custname, style: row_style, alignment: 'left'}, 

                        {text: mkt_name, style: row_style, alignment: 'left'},
                        {text: branch, style: row_style, alignment: 'left'},   
                                            
                        {text: caname, style: row_style, alignment: 'left'}, 
                        //{text: status, style: 'tableContent', alignment: 'center'}, 
                        {text: status_date, style: row_style, alignment: 'center'}, 
                        {text: limt_amt, style: row_style, alignment: 'right'},

                        {text: setup_date, style: row_style, alignment: 'center'},

                        {text: os_start, style: row_style, alignment: 'right'}, 
                        {text: os_bal, style: row_style, alignment: 'right'},
                   

                        {text: cycle_due, style: row_style, alignment: 'center'}, 
                        {text: cycle_day, style: row_style, alignment: 'center'},
                        {text: cycle_wk, style: row_style, alignment: 'right'},
                        {text: cycle_mth, style: row_style, alignment: 'right'},

                        {text: pdp_start, style: row_style, alignment: 'center'},
                        {text: pdp_now, style: row_style, alignment: 'center'},

                        {text: overdue_day, style: row_style, alignment: 'center'}, 
                        {text: overdue_amt, style: row_style, alignment: 'right'},
                        {text: overdue_mpd, style: row_style, alignment: 'right'},
                        {text: overdue_date, style: row_style, alignment: 'center'},
                        {text: cause_topic, style: row_style, alignment: 'left'}                        
                    ]
                );
            });	

            docDefinition.content[0].table.body.push(
                [
                    {text: footer_summary.criteria.Title, style: 'tableHeader', alignment: 'left', colSpan: 2}, 
    
                    {text: '', style: 'tableHeader', alignment: 'left'},
                    {text: '', style: 'tableHeader', alignment: 'left'},   
                                        
                    {text: '', style: 'tableHeader', alignment: 'left'}, 
                    //{text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: footer_summary.criteria.Limit, style: 'tableHeader', alignment: 'right'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'},
    
                    {text: footer_summary.criteria.PrincipleStart, style: 'tableHeader', alignment: 'right'}, 
                    {text: footer_summary.criteria.Principle, style: 'tableHeader', alignment: 'right'},
               
    
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: footer_summary.criteria.Week_Installment, style: 'tableHeader', alignment: 'right'},
                    {text: footer_summary.criteria.Mth_Installment, style: 'tableHeader', alignment: 'right'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: '', style: 'tableHeader', alignment: 'center'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: footer_summary.criteria.OverdueAmt, style: 'tableHeader', alignment: 'right'},
                    {text: footer_summary.criteria.Mth_AmtPastDue, style: 'tableHeader', alignment: 'right'},
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: '', style: 'tableHeader', alignment: 'left'}                        
                ]
            );

            docDefinition.content[0].table.body.push(
                [
                    {text: footer_summary.all.Title, style: 'tableHeader', alignment: 'left', colSpan: 2}, 
    
                    {text: '', style: 'tableHeader', alignment: 'left'},
                    {text: '', style: 'tableHeader', alignment: 'left'},   
                                        
                    {text: '', style: 'tableHeader', alignment: 'left'}, 
                    //{text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: footer_summary.all.Limit, style: 'tableHeader', alignment: 'right'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'},
    
                    {text: footer_summary.all.PrincipleStart, style: 'tableHeader', alignment: 'right'}, 
                    {text: footer_summary.all.Principle, style: 'tableHeader', alignment: 'right'},
               
    
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: footer_summary.all.Week_Installment, style: 'tableHeader', alignment: 'right'},
                    {text: footer_summary.all.Mth_Installment, style: 'tableHeader', alignment: 'right'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: '', style: 'tableHeader', alignment: 'center'},
    
                    {text: '', style: 'tableHeader', alignment: 'center'}, 
                    {text: footer_summary.all.OverdueAmt, style: 'tableHeader', alignment: 'right'},
                    {text: footer_summary.all.Mth_AmtPastDue, style: 'tableHeader', alignment: 'right'},
                    {text: '', style: 'tableHeader', alignment: 'center'},
                    {text: '', style: 'tableHeader', alignment: 'left'}                        
                ]
            );

        }
          
        pdfMake.createPdf(docDefinition).open()
        
    }

    handleExcelExport = () => {
        const { data } = this.state

        let bucket_group = _.reject(data.source, (o) => { return in_array(o.Cust_DPDBucketNow, ['W0', 'M2', 'NPL']) })
        //let bucket_group = _.reject(data.source, (o) => { return in_array(o.Cust_DPDBucketNow, ['NPL']) })
        let data_sort = _.orderBy(bucket_group, ['CAName', 'MarketName', 'Cust_DPDBucketNow'], ['asc', 'asc', 'asc'])

        let data_sheet = [
            [
                'CustomerName', 
                'MarketName',
                'BranchName',
                'CAName', 
                'StatusDate',
                'LimitAmt',
                'SetUpDate',
                'PrincipleStart',
                'Principle',
                'CycleDue',
                'CycleDueDay',
                'CycleDueWeekly',
                'CycleDueMonthly',
                'DPDBucketStart',
                'DPDBucketNow',
                'OverdueDay',
                'OverdueAmt',
                'MthAmtPassDue',
                'LastPaymentAmt',
                'CauseNote',
                'CauseDetails'                
            ]
        ]

        _.each(data_sort, (v, i) => { 

            let pattern = ["น.ส.", "น.ส. ", "นาง", "นาง ", "นาย ", "นาย"];
            
            let custtemp = (v.AccountName && v.AccountName !== '') ? str_replace(pattern, "", v.AccountName) : ''
            let custname = (custtemp && custtemp.length >= 18) ? `${custtemp.substring(0, 17)}...` : custtemp

            let mkt_temp = (v.MarketName && v.MarketName !== '') ? v.MarketName : ''
            let mkt_name = (mkt_temp && mkt_temp.length >= 18) ? `${mkt_temp.substring(0, 17)}...` : mkt_temp

            let branch = (v.BranchCode && v.BranchCode !== '') ? v.BranchCode : ''              
            let caname = (v.CAName && v.CAName !== '') ? v.CAName.split(" ")[0] : ''
            //let status = (v.StatusDigit && v.StatusDigit !== '') ? v.StatusDigit : ''
            let status_date = (v.StatusDate && !_.isEmpty(v.StatusDate)) ? moment(v.StatusDate).format('YYYY-MM-DD') : ''
            let limt_amt = (v.Limit && v.Limit > 0) ? v.Limit : 0
            let setup_date = (v.SetupDate && !_.isEmpty(v.SetupDate)) ? moment(v.SetupDate).format('YYYY-MM-DD') : ''
            let os_start = (v.PrincipleStart && v.PrincipleStart > 0) ? v.PrincipleStart : 0
            let os_bal = (v.Principle && v.Principle > 0) ? v.Principle : 0               
            let cycle_due = (v.MthCycleDueDay && v.MthCycleDueDay > 0) ? v.MthCycleDueDay : 0
            let cycle_day = (v.WkCycleDue && v.WkCycleDue !== '') ? v.WkCycleDue : ''
            let cycle_wk = (v.Week_Installment && v.Week_Installment > 0) ? v.Week_Installment : 0
            let cycle_mth = (v.Mth_Installment && v.Mth_Installment > 0) ? v.Mth_Installment : 0
            let pdp_start = (v.Cust_DPDBucketStart && v.Cust_DPDBucketStart !== '') ? v.Cust_DPDBucketStart : ''
            let pdp_now = (v.Cust_DPDBucketNow && v.Cust_DPDBucketNow !== '') ? v.Cust_DPDBucketNow : ''

            let overdue_day = (v.OverdueDay && v.OverdueDay > 0) ? v.OverdueDay : 0
            let overdue_amt = (v.OverdueAmt && v.OverdueAmt > 0) ? v.OverdueAmt : 0
            let overdue_mpd = (v.Mth_AmtPastDue && v.Mth_AmtPastDue > 0) ? v.Mth_AmtPastDue : 0
            let overdue_date = (v.LastPaymentDate && !_.isEmpty(v.LastPaymentDate)) ? moment(v.LastPaymentDate).format('YYYY-MM-DD') : ''
            let cause_topic = (v.Cause && v.Cause !== '') ? v.Cause : ''
            let cause_detail = (v.CauseDetail && v.CauseDetail !== '') ? v.CauseDetail : ''

            data_sheet.push(
                [
                    custname, 
                    mkt_name,
                    branch,   
                    caname, 
                    status_date, 
                    limt_amt,
                    setup_date,
                    os_start, 
                    os_bal,
                    cycle_due, 
                    cycle_day,
                    cycle_wk,
                    cycle_mth,
                    pdp_start,
                    pdp_now,
                    overdue_day, 
                    overdue_amt,
                    overdue_mpd,
                    overdue_date,
                    cause_topic,
                    cause_detail                       
                ]
            )
        })

        this.exportExcel(data_sheet)

    }

    exportExcel = (data) => {
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SheetJS");
  
        XLSX.writeFile(wb, `customer_sendout_${moment().format('DDMMYYYY')}.xlsx`)
    }

}

const gridCustomerDashboardWithCookies = withCookies(CustomerDashboard)
const GridCustomerManagement = Form.create()(gridCustomerDashboardWithCookies)
export default connect(
    (state) => ({
        cust_subgrid: state.customer_subgrid_info
    }),
    { 
        GET_CUSTINFO_SUBGRID: CustomerSubList 
    }
)(GridCustomerManagement)