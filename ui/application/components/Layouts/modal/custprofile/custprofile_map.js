import React, { Component } from 'react'
import { Form, Modal, Table, Row, Col, Tooltip } from 'antd'
import { in_array, parseBool, numberWithCommas, handleMobilePattern } from './function'
import moment from 'moment'
import _ from 'lodash'

import cls from './styles/modal.scss'
import options from './styles/_general.scss'

import dummy from './images/customer_dummy.png'

const config = {
    hostapi: 'http://tc001pcis1p:8099/nanolayout_api/index.php/api'
}

class CustProfileModal extends Component {

    state = {
        mktCustomers: [],
        mktCustFilter: {},
        actionLogs: [],
        details: false,
        content: false,
        topup: false,
        useNote: false,
        history: false,
        historyDesc: false,
        fieldReasonDisable: true,
        reasonFilter: this.props.masters,
        master_list: [],
        note_limit: 200
    }

    componentWillMount() {
        const { mktCode, authen } = this.props
        const { Auth } = authen

        // CALL DEFAULT BASIC INFORMATION 
        if(mktCode && !_.isEmpty(mktCode)) {
            let params = { 
                AuthID: Auth.EmployeeCode,
                MarketCode: mktCode              
            }

            this.handleCustList(params)
        }

    }

    handleCustList = (params) => {
        // LOAD IS IMAGE OF CUSTOMER WITH APPLICATION NO

        const request_set = new Request(`${config.hostapi}/customerinfov2`, {
            method: 'POST',
            cache: 'no-cache',
            header: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset="UTF-8";'
            }),
            body: JSON.stringify(params)            
        })

        fetch(request_set)
        .then(response => response.json())
        .then(resp => {
            if(resp && parseBool(resp.status)) {
                this.handleProfileModal(params, resp.data)
            }
            this.setState({ mktCustomers: (resp && parseBool(resp.status)) ? resp.data : [] })
        })

    }

    // CUSTOMER PROFILE HANDLER 
    // OPEN PROFILE MODAL
    handleProfileModal = (params, mktCustomers) => {
        const { appNo } = this.props
        const result = _.filter(mktCustomers, { ApplicationNo: appNo })[0]


        // LOAD IS IMAGE OF CUSTOMER WITH APPLICATION NO
        fetch(`http://tc001pcis1p/newservices/LBServices.svc/nano/customer/image/${appNo}`)
        .then(response => response.json())
        .then(resp => {
            let note_reason = {
                profile: result,
                images: (resp.Status == 200) ? resp.ImgaeList[0] : null,
                cellable: null
            }

            if(!_.isEmpty(note_reason)) {
                this.setState({ mktCustFilter: note_reason })
                this.getNoteHistoryList(params.MarketCode, appNo)
            }

        })

    }

    // GET ACTION NOTE HISTORY BY APPLICATION NO
    getNoteHistoryList = (mktcode, appcode) => {
        if (mktcode && appcode) {
            const request_set = new Request(`${config.hostapi}/notelists/mktc/${mktcode}/app/${appcode}/note_lists`, {
                method: 'GET',
                cache: 'no-cache',
                header: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset="UTF-8";'
                })
            })

            fetch(request_set)
                .then(response => response.json())
                .then(respItem => { this.setState({ actionLogs: (respItem.status) ? respItem.data : [] }) })
                .catch(err => { console.log(`fetch error ${err}`) })
        }
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    handleUseNote = () => {
        this.setState({ useNote: !this.state.useNote })
        this.handleReset()
    }

    handleHist = () => {
        this.setState({ history: !this.state.history })
        _.delay(() => { this.setState({ historyDesc: !this.state.historyDesc }) }, 200)
    }

    handleDetail = () => {
        this.setState({ details: !this.state.details })
        _.delay(() => { this.setState({ content: !this.state.content }) }, 500)
    }

    handleTopup = () => {
        this.setState({ topup: !this.state.topup })
    }

    handleModalClose = () => {
        const { CustProfileClose } = this.props
        this.setState({ useNote: false, history: false, historyDesc: false })
        CustProfileClose()
    }


    changeSubjectHandle = (val) => {
        const { form, masters } = this.props

        if (val !== '') {
            form.setFieldsValue({ reason_name: '' })

            const master_list = (masters.actionnote_reason && masters.actionnote_reason[0]) ? masters.actionnote_reason[0] : []
            const sub_reason = (master_list.sub_reason && master_list.sub_reason.length > 0) ? master_list.sub_reason : []
            
            let result = sub_reason.filter(function (obj) { return obj.CategoryCode == val })
            this.setState({ reasonFilter: result, fieldReasonDisable: false })

        } else {
            this.setState({ reasonFilter: result, fieldReasonDisable: true })
        }

    }

    changeCharHandle = (e) => {
        let char = e.target.value
        if(char) {
            this.setState({ note_limit: --this.state.note_limit })
        }
    }

    setRowsKey = (rowKey) => {
        return rowKey.RowID
    }

    searchWord(arr, searchKey) {        
        return arr.filter(obj => Object.keys(obj).some(key => _.includes(obj[key], searchKey)))
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.state.mktCustomers !== nextState.mktCustomers ||
               this.state.mktCustFilter !== nextState.mktCustFilter ||
               this.state.actionLogs !== nextState.actionLogs ||
               this.state.useNote !== nextState.useNote ||
               this.state.details !== nextState.details ||
               this.state.history !== nextState.history ||
               this.state.content !== nextState.content ||
               this.state.historyDesc !== nextState.historyDesc
    }

    setTitleHeader = () => {
        const { mktCustFilter } = this.state

        let CIFNo = '', AppNo = '', MarketName = ''
        MarketName = (mktCustFilter.profile && mktCustFilter.profile.MarketName) ? mktCustFilter.profile.MarketName : '-'
        CIFNo = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.CIFNO) ? mktCustFilter.profile.CIFNO : '-',
        AppNo = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.ApplicationNo) ? mktCustFilter.profile.ApplicationNo : '-'

        return (
            <div className={cls['title_header']}>
                <span>{ MarketName }</span> &nbsp;
                <span className="pv1">{`CIF : ${CIFNo} (${AppNo})`}</span>
            </div>
        )
    }
    
    render() {
        const { visible } = this.props
        const { mktCustFilter } = this.state

        const url_mrkImg = (mktCustFilter && mktCustFilter.images && mktCustFilter.images.ImageStatus == 'OK') ? mktCustFilter.images.Url : dummy
        const custname = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.AccountName) ? mktCustFilter.profile.AccountName : '-'
        const aliasname = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.LoanerAliasName) ? `(${mktCustFilter.profile.LoanerAliasName})` : ''
        const contactno = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.ContactTel) ? handleMobilePattern(mktCustFilter.profile.ContactTel) : '-'
        const shopname = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.ShopName && mktCustFilter.profile.ShopName !== '-') ? mktCustFilter.profile.ShopName : 'ชื่อร้าน ไม่ระบุข้อมูล'
        const products = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.BusinessTypeApp) ? mktCustFilter.profile.BusinessTypeApp : '-'
        const program = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Product) ? mktCustFilter.profile.Product : '-'
        const decision_digit = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.StatusDigit) ? mktCustFilter.profile.StatusDigit : '-'
        const decision_status = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Status) ? mktCustFilter.profile.Status : '-'
        const decision_cr = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.StatusDate) ? moment(mktCustFilter.profile.StatusDate).format('DD/MM/YYYY') : '-'
        const decision_setup = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.OpenDate) ? moment(mktCustFilter.profile.OpenDate).format('DD/MM/YYYY') : '-'
        const approved_loan = (mktCustFilter && mktCustFilter.profile &&  mktCustFilter.profile.Limit) ? numberWithCommas(mktCustFilter.profile.Limit) : 0
        const install_mth = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Mth_Installment) ? numberWithCommas(mktCustFilter.profile.Mth_Installment) : 0
        const install_wk = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Week_Installment) ? numberWithCommas(mktCustFilter.profile.Week_Installment) : 0
        const ca_name = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.CAName) ? mktCustFilter.profile.CAName : '-'
        const ca_mobile = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.CAMobile) ? handleMobilePattern(mktCustFilter.profile.CAMobile) : '-'
        const limit = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Limit) ? numberWithCommas(mktCustFilter.profile.Limit):0
        const bucket_class = (mktCustFilter && mktCustFilter.profile &&  mktCustFilter.profile.Cust_DPDBucketNow) ? mktCustFilter.profile.Cust_DPDBucketNow : '-'
        const no_acc = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.NoAccount) ? mktCustFilter.profile.NoAccount : 1
        const os_amount_total = (mktCustFilter.profile && mktCustFilter.profile.Principle) ? numberWithCommas(mktCustFilter.profile.Principle) : 0
        const os_amount = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.OriginPrinciple) ? numberWithCommas(mktCustFilter.profile.OriginPrinciple) : 0
        const wkcycle_day = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.WkCycleDue) ? mktCustFilter.profile.WkCycleDue : '-'
        const first_paid_date = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.FirstPaymentDate) ? moment(mktCustFilter.profile.FirstPaymentDate).format('DD/MM/YYYY') : '-'
        const latest_paid_date = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.LastPaymentDate) ? moment(mktCustFilter.profile.LastPaymentDate).format('DD/MM/YYYY') : '-'
        const latest_paid_amount = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.LastPaymentAmt) ? numberWithCommas(mktCustFilter.profile.LastPaymentAmt) : 0
        const latest_paid_channel = (mktCustFilter && mktCustFilter) ? '-' : '-'
        const overdue_amount = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.OverdueAmt) ? numberWithCommas(mktCustFilter.profile.OverdueAmt) : 0
        const overdue_day = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.OverdueDay) ? mktCustFilter.profile.OverdueDay : 0
        const convinient_time = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.OpenHours) ? mktCustFilter.profile.OpenHours : '-'
        const cause_notice = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Cause) ? mktCustFilter.profile.Cause :''
        const callreport = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Cause_Detail) ? mktCustFilter.profile.Cause_Detail : ''
        const active_cell = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.ColumnCell) ? mktCustFilter.profile.ColumnCell : null
        const tenor = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Tenor) ? numberWithCommas(mktCustFilter.profile.Tenor):0

        let reference_no = (active_cell) ? active_cell : ''

        const principle = (mktCustFilter && mktCustFilter.profile && mktCustFilter.profile.Principle) ? mktCustFilter.profile.Principle:null
        let acc_close = (principle && principle > 0) ? 'N':'Y'

        let str_decision_date = 'Decision Status'
        let str_decision_state = 'Decision Reason'
        let chk_decision_date = ''

        if(decision_status == 'Approved' && acc_close == 'Y') {
            str_decision_date = 'Setup Date'
            str_decision_state = 'Decision Reason'
            chk_decision_date = decision_setup
        } else {
            if(in_array(decision_digit, ['A'])) {
                str_decision_date = 'Setup Date'
                str_decision_state = 'Decision Reason'
                chk_decision_date = decision_setup
                
            } else if(in_array(decision_digit, ['C', 'R'])) {
                str_decision_date = 'Decision Status'
                str_decision_state = 'Decision Reason'
                chk_decision_date = decision_cr
            }
        }

        return (
            <article>
                <Modal title={this.setTitleHeader()} visible={visible} onOk={this.handleModalClose} onCancel={this.handleModalClose} maskClosable={true} footer={this.setFooter()} width={420} wrapClassName={cls['handleProfileWrapper']}>
                    <Row type="flex" gutter={10}>
                        <Col span={8}>
                            <div className="pa1 tc" style={{ border: '1px solid #D1D1D1', minHeight: '102px', maxHeight: '102px', overflow: 'hidden' }}>
                                <a href={`${url_mrkImg}`} data-lightbox="image-1">
                                    <img src={`${url_mrkImg}`} className="db" alt="Not found image" style={{ height: '100%', 'width': '100%', objectFit: 'contain' }} />
                                </a>
                            </div>
                            <div className={`${cls['handleShop']} tc`} onClick={this.handleDetail}>
                                {`${shopname}`}
                            </div>
                        </Col>
                        <Col span={16}>
                            <Row type="flex" gutter={0} style={{ paddingTop: '2px' }}>
                                <Col span={7} className={`${cls['grid_label']} ${cls['repad']} bb b--light-gray`}>Ref / Lock No</Col>
                                <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>
                                    {`${reference_no}`}
                                </Col>
                            </Row>
                            <Row type="flex" gutter={0}>
                                <Col span={7} className={`${cls['grid_label']} ${cls['repad']} bb b--light-gray`}>Customer </Col>
                                <Col span={17} className={`${cls['grid_control']} ${cls['fulltruncate']} ${cls['repad']} bb b--light-gray`} title={`${custname} ${aliasname}`}>{`${custname} ${aliasname}`}</Col>
                            </Row>
                            <Row type="flex" gutter={0}>
                                <Col span={7} className={`${cls['grid_label']} ${cls['repad']} bb b--light-gray`}>Contact</Col>
                                <Col span={17} className={`${cls['grid_control']} ${cls['fulltruncate']} ${cls['repad']} bb b--light-gray`}>{`${contactno}`}</Col>
                            </Row>
                            <Row type="flex" gutter={0}>
                                <Col span={7} className={`${cls['grid_label']} ${cls['repad']} bb b--light-gray`}>Product</Col>
                                <Col span={17} className={`${cls['grid_control']} ${cls['fulltruncate']} ${cls['repad']} bb b--light-gray`}>{`${products}`}</Col>
                            </Row>
                            <Row type="flex" gutter={0}>
                                <Col span={7} className={`${cls['grid_label']} ${cls['repad']} bb b--light-gray`}>Total O/S</Col>
                                <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray blue`}>{os_amount_total}</Col>
                            </Row>
                            <div className={`${cls['handleDetail']} tr`} onClick={this.handleDetail}>
                                <i className={`${(!this.state.details) ? 'fa fa-caret-down' : 'fa fa-caret-up'}`}></i>&nbsp;
                                {(!this.state.details) ? 'More Information' : 'Hidden information'}
                            </div>                            
                        </Col>
                    </Row>

                    <Row type="flex" className={`${(this.state.details) ? cls['grid_collapse_open'] : cls['grid_collapse']}`}>

                        <Col span={12} className={`${cls['grid_header']}`}>Financial</Col>
                        <Col span={12} className={`${cls['grid_header']} ${cls['border_lr_none']}`}>Portfolio Quality</Col>

                        <Col span={12} className={`${(this.state.content) ? cls['show'] : cls['hidden']}`}>
                            {/* Financial */}
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Product Program</Col>
                                <Col span={12} className={cls['grid_control']}>{`${program}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>{`${str_decision_date}`}</Col>
                                <Col span={12} className={cls['grid_control']}>{`${chk_decision_date}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={`${cls['grid_label']} ${(decision_status == 'Approved' && acc_close == 'Y') && options['fg_red']}`}>
                                    {`${str_decision_state}`}
                                </Col>
                                <Col span={12} className={`${cls['grid_control']} ${cls['truncate']} ${(decision_status == 'Approved' && acc_close == 'Y') && options['fg_red']}`} title={`${ (decision_status == 'Approved' && acc_close == 'Y') ? 'Close':decision_status}`}>
                                    {`${ (decision_status == 'Approved' && acc_close == 'Y') ? 'Close':decision_status}`}
                                </Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Loan Amount</Col>
                                <Col span={12} className={cls['grid_control']}>{approved_loan}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Installment (Mth)</Col>
                                <Col span={12} className={cls['grid_control']}>{`${install_mth}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Installment (Wk)</Col>
                                <Col span={12} className={cls['grid_control']}>{`${install_wk}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Paid/Term (Mth)</Col>
                                <Col span={12} className={cls['grid_control']}>{`- / ${tenor}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>CA Name</Col>
                                <Col span={12} className={`${cls['grid_control']} ${cls['truncate']}`} title={`${ca_name}`}>{`${ca_name}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>CA Contact</Col>
                                <Col span={12} className={cls['grid_control']}>{`${ca_mobile}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={cls['grid_label']}>Loan Top-up</Col>
                                <Col span={12} className={cls['grid_control']}>
                                    {`${limit}`}
                                </Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={`${cls['grid_label']}`}>Reference 1</Col>
                                <Col span={12} className={`${cls['grid_control']} ${cls['truncate']}`}>-</Col>
                            </Row>   
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']}`}>
                                <Col span={12} className={`${cls['grid_label']}`}>Reference 2</Col>
                                <Col span={12} className={`${cls['grid_control']} ${cls['truncate']}`}>-</Col>
                            </Row>                         
                        </Col>
                        <Col span={12} className={`${(this.state.content) ? cls['show'] : cls['hidden']}`}>
                            {/* Quality */}
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Bucket</Col>
                                <Col span={12} className={`${cls['grid_control']}`}>{`${bucket_class}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>
                                    Balance Amt.
                                    <span className={`${cls['fg-teal']} pl1`}>({`${no_acc}`})</span>
                                </Col>
                                <Col span={12} className={`${cls['grid_control']}`}>{`${os_amount}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>First Payment</Col>
                                <Col span={12} className={cls['grid_control']}>{`${first_paid_date}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Last Payment</Col>
                                <Col span={12} className={cls['grid_control']}>{`${latest_paid_date}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Last Paid Amt.</Col>
                                <Col span={12} className={cls['grid_control']}>{`${latest_paid_amount}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={`${cls['grid_label']}`}>Last Paid Channel</Col>
                                <Col span={12} className={`${cls['grid_control']}`}>{latest_paid_channel}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Overdue Amt.</Col>
                                <Col span={12} className={cls['grid_control']}>{`${overdue_amount}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Overdue Day</Col>
                                <Col span={12} className={cls['grid_control']}>{`${overdue_day} Days`}</Col>
                            </Row>                            
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Convinient Time</Col>
                                <Col span={12} className={cls['grid_control']}>{`${convinient_time}`}</Col>
                            </Row>
                            <Row type="flex" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>WkCycle Due</Col>
                                <Col span={12} className={cls['grid_control']}>{`${wkcycle_day}`}</Col>
                            </Row>
                            <Row type="flex" justify="start" className={`${(this.state.details) ? `${cls['grid_rows']} ${cls['open']}` : cls['grid_rows']} ${cls['border_l_none']}`}>
                                <Col span={12} className={cls['grid_label']}>Call Report</Col>
                                <Col span={12} className={`${cls['grid_control']} ${cls['truncate']}`} title={(cause_notice && cause_notice != '') ? cause_notice:''}>
                                    <span className={(cause_notice == '') && cls['hidden']}>{cause_notice}</span>
                                </Col>
                                <Col span={24} className={`${cls['grid_control']} ${cls['ellipsis']}`} style={{ 'fontSize': '10px', 'paddingLeft': '10px' }}>
                                    <Tooltip title={`${callreport}`}>{`${callreport}`}</Tooltip>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Modal>
            </article>
        )
    }

    setFooter = () => {
        const { actionLogs } = this.state
        const note_hist = actionLogs

        const columns = [
            {
                title: 'Date',
                dataIndex: 'CreateDate',
                key: 'CreateDate',
                className: 'ttu tc',
                width: 45
            },
            {
                title: (<div className="ttu tc">Subject</div>),
                dataIndex: 'Subject',
                key: 'Subject',
                width: 120
            },
            {
                title: <div className="ttu tc">Note</div>,
                dataIndex: 'Remark',
                key: 'Remark',
            }
        ]
       
        return (
            <div className={cls['grid_history']}>
                <div className={`${(this.state.history) ? `${cls['grid_collapse_open']} ${cls['hfix']}` : cls['grid_collapse']}`}>
                    <Table columns={columns} dataSource={note_hist} rowKey={this.setRowsKey} pagination={false} size="small" bordered className={`${(this.state.historyDesc) ? cls['show'] : cls['hidden']}`} />
                </div>
                <div className={`${cls['handleDetail']} tr`} onClick={this.handleHist}>
                    <i className={`${(!this.state.history) ? 'fa fa-caret-down' : 'fa fa-caret-up'}`}></i>&nbsp;
                    {(!this.state.history) ? `Action Log (${(note_hist) ? ((note_hist && note_hist.length).toString().padStart(2, "0")) : '0'})` : 'Hidden Action Log'}
                </div>
            </div>
        )
    }

}

const stripname = (str) => {
    if(str)
        return str.replace('+', ' ')
    else 
        return ''
}

export default Form.create()(CustProfileModal)