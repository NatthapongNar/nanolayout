import React, { Component } from 'react'
import { Form, Input, Select, Modal, Table, Collapse, Button, Switch, Icon, Row, Col, Tooltip, notification } from 'antd'
import { columns } from './config/profile_columns.js'
import { config } from './config'
import { in_array, parseBool, numberWithCommas, handleMobilePattern } from './function'
import moment from 'moment'
import _ from 'lodash'

import cls from './styles/modal.scss'
import options from './styles/utilities/_general.scss'

import dummy from './images/customer_dummy.png'

const Panel = Collapse.Panel
const FormItem = Form.Item
const Option = Select.Option
const ButtonGroup = Button.Group
const confirm = Modal.confirm

class ProfileModal extends Component {

    state = {
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
        const { handleProfileModalClose } = this.props
        this.setState({ useNote: false, history: false, historyDesc: false })
        handleProfileModalClose()
    }

    handleNoteSave = (e) => {        
        e.preventDefault()

        const { Auth } = this.props.authen
        const { form, mktCustFilter, masters } = this.props

        form.validateFields((err, objField) => {
            if (!objField.subject_reason || !objField.reason_name || !objField.reason_remark) {
                notification.warning({
                    message: 'กรอกข้อมูลไม่ครบถ้วน',
                    description: 'กรุณาระบุรายละเอียดเพิ่มเติม เพื่อประโยชน์ในการวิเคราะห์ข้อมูลในอนาคต'
                })
            } else {

                const master_check = (masters.actionnote_reason && masters.actionnote_reason[0]) ? masters.actionnote_reason[0] : []

                const master_list = master_check.cat_reason
                const result = master_list.filter(function (obj) { return obj.ReasonCode == parseInt(objField.subject_reason) })
    
                confirm({
                    title: 'กรุณายืนยันการบันทึกข้อมูล',
                    content: 'โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนทำการบันทึกข้อมูล',
                    onOk: () => {
                        let request_data = {
                            MarketCode: mktCustFilter.profile.MarketCode,
                            ApplicationNo: mktCustFilter.profile.ApplicationNo,
                            Subject: (result[0]) ? result[0].ReasonName:null, 
                            Reason: objField.reason_name,
                            Remark: objField.reason_remark,
                            Isactive: 'Y',
                            CreateID: (Auth && Auth.EmployeeCode) ? Auth.EmployeeCode : null,
                            CreateBy: (Auth && Auth.EmpName_TH) ? stripname(Auth.EmpName_TH) : null,
                            CreateDate: moment().format('DD/MM')
                        }

                        this.onNoteSave(request_data)
                        
                    },
                    onCancel: () => {}
                })

            }
        })

    }

    onNoteSave = (request_data) => {
        const { handleUpdateActionLog, mktCustFilter } = this.props

        const active_cell = (mktCustFilter.cellable) ? mktCustFilter.cellable[0]:null
        const request_set = new Request(`${config.hostapi}/noteupdate`, {
            method: 'POST',
            header: new Headers({
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }),
            body: JSON.stringify(request_data),
            cache: 'no-cache'
        })

        fetch(request_set)
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                notification.success({
                    message: 'การบันทึกข้อมูล',
                    description: 'ดำเนินการบันทึกข้อมูลสำเร็จ'
                })

                handleUpdateActionLog([request_data], active_cell)
                this.handleUseNote()
            }
        })
    
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

    formNoteControl = () => {
        const { masters } = this.props
        const { getFieldDecorator } = this.props.form

        const master_list = (masters.actionnote_reason && masters.actionnote_reason[0]) ? masters.actionnote_reason[0] : []
        if (master_list || this.state.reasonFilter[0]) {
            const category = (master_list.cat_reason && master_list.cat_reason.length > 0) ? master_list.cat_reason : []
            const subcategory = (this.state.reasonFilter[0]) ? this.state.reasonFilter : (master_list.sub_reason && master_list.sub_reason.length > 0) ? master_list.sub_reason : []
           
            return (
                <div className={`${cls['formNoteContainer']} ${(!this.state.useNote) && cls['hidden']}`}>
                    <Form layout="horizontal" onSubmit={this.handleNoteSave}>
                        <FormItem label="Subject" className={`${cls['mb1']} fw5`}>
                            {
                                getFieldDecorator('subject_reason', { rules: [{ required: false, message: '' }] })
                                (
                                    <Select onChange={this.changeSubjectHandle}>
                                        <Option value=""></Option>
                                        {
                                            category.map((Item, index) => (<Option key={index} value={`${Item.ReasonCode}`}>{Item.ReasonName}</Option>))
                                        }
                                    </Select>
                                )
                            }
                        </FormItem>
                        <FormItem label="Reason" className={`${cls['mb1']} fw5`}>
                            {
                                getFieldDecorator('reason_name', { rules: [{ required: false, message: '' }] })
                                (
                                    <Select disabled={this.state.fieldReasonDisable}>
                                        <Option value=""></Option>
                                        {
                                            subcategory.map((Item, index) => (<Option key={index} value={`${Item.SubReasonCode}`}>{Item.SubReasonName}</Option>))
                                        }
                                    </Select>
                                )
                            }
                        </FormItem>
                        <FormItem label="Action Note" className={`${cls['mb1']} fw5`}>
                            {
                                getFieldDecorator('reason_remark', { rules: [{ required: false }] })(<Input maxLength="200" onChange={this.changeCharHandle} />)
                            }
                            <small>จำกัดตัวอักษร {this.state.note_limit} ตัวอักษร</small>
                        </FormItem>
                        <FormItem>
                            <Button shape="circle" icon="close" className="fl" onClick={this.handleUseNote} />
                            <Button type="primary" shape="circle" icon="check-square-o" className="fr" htmlType="submit" />
                        </FormItem>
                    </Form>
                </div>
            )
        }
    }

    searchWord(arr, searchKey) {        
        return arr.filter(obj => Object.keys(obj).some(key => _.includes(obj[key], searchKey)))
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.state.useNote !== nextState.useNote ||
               this.state.details !== nextState.details ||
               this.state.history !== nextState.history ||
               this.state.content !== nextState.content ||
               this.state.historyDesc !== nextState.historyDesc ||
               this.props.form !== nextProps.form
    }

    setTitleHeader = () => {
        const { mktCustFilter } = this.props

        let CIFNo = '', AppNo = ''
        CIFNo = (mktCustFilter.profile && mktCustFilter.profile.CIFNO) ? mktCustFilter.profile.CIFNO : '-',
        AppNo = (mktCustFilter.profile && mktCustFilter.profile.ApplicationNo) ? mktCustFilter.profile.ApplicationNo : '-'

        return (
            <div className={cls['title_header']}>
                {/* <i className="fa fa-caret-right" style={{ fontSize: '18px', position: 'absolute', top: '3px' }}></i> */}
                <span className="pv1">{`CIF : ${CIFNo} (${AppNo})`}</span>
            </div>
        )
    }
    

    render() {

        const { visible, preview, previewBigScale, mktCustFilter } = this.props

        const url_mrkImg = (mktCustFilter.images && mktCustFilter.images.ImageStatus == 'OK') ? mktCustFilter.images.Url : dummy
        const custname = (mktCustFilter.profile && mktCustFilter.profile.AccountName) ? mktCustFilter.profile.AccountName : '-'
        const aliasname = (mktCustFilter.profile && mktCustFilter.profile.LoanerAliasName) ? `(${mktCustFilter.profile.LoanerAliasName})` : ''
        const contactno = (mktCustFilter.profile && mktCustFilter.profile.ContactTel) ? handleMobilePattern(mktCustFilter.profile.ContactTel) : '-'
        const shopname = (mktCustFilter.profile && mktCustFilter.profile.ShopName && mktCustFilter.profile.ShopName !== '-') ? mktCustFilter.profile.ShopName : 'ชื่อร้าน ไม่ระบุข้อมูล'
        const products = (mktCustFilter.profile && mktCustFilter.profile.BusinessTypeApp) ? mktCustFilter.profile.BusinessTypeApp : '-'
        const program = (mktCustFilter.profile && mktCustFilter.profile.Product) ? mktCustFilter.profile.Product : '-'
        const decision_digit = (mktCustFilter.profile && mktCustFilter.profile.StatusDigit) ? mktCustFilter.profile.StatusDigit : '-'
        const decision_status = (mktCustFilter.profile && mktCustFilter.profile.Status) ? mktCustFilter.profile.Status : '-'
        const decision_cr = (mktCustFilter.profile && mktCustFilter.profile.StatusDate) ? moment(mktCustFilter.profile.StatusDate).format('DD/MM/YYYY') : '-'
        const decision_setup = (mktCustFilter.profile && mktCustFilter.profile.OpenDate) ? moment(mktCustFilter.profile.OpenDate).format('DD/MM/YYYY') : '-'
        const approved_loan = (mktCustFilter.profile &&  mktCustFilter.profile.Limit) ? numberWithCommas(mktCustFilter.profile.Limit) : 0
        const install_mth = (mktCustFilter.profile && mktCustFilter.profile.Mth_Installment) ? numberWithCommas(mktCustFilter.profile.Mth_Installment) : 0
        const install_wk = (mktCustFilter.profile && mktCustFilter.profile.Week_Installment) ? numberWithCommas(mktCustFilter.profile.Week_Installment) : 0
        const ca_name = (mktCustFilter.profile && mktCustFilter.profile.CAName) ? mktCustFilter.profile.CAName : '-'
        const ca_mobile = (mktCustFilter.profile && mktCustFilter.profile.CAMobile) ? handleMobilePattern(mktCustFilter.profile.CAMobile) : '-'
        const limit = (mktCustFilter.profile && mktCustFilter.profile.Limit) ? numberWithCommas(mktCustFilter.profile.Limit):0
        const bucket_class = (mktCustFilter.profile &&  mktCustFilter.profile.Cust_DPDBucketNow) ? mktCustFilter.profile.Cust_DPDBucketNow : '-'
        const no_acc = (mktCustFilter.profile && mktCustFilter.profile.NoAccount) ? mktCustFilter.profile.NoAccount : 1
        const os_amount = (mktCustFilter.profile && mktCustFilter.profile.Principle) ? numberWithCommas(mktCustFilter.profile.Principle) : 0
        const wkcycle_day = (mktCustFilter.profile && mktCustFilter.profile.WkCycleDue) ? mktCustFilter.profile.WkCycleDue : '-'
        const first_paid_date = (mktCustFilter.profile && mktCustFilter.profile.FirstPaymentDate) ? moment(mktCustFilter.profile.FirstPaymentDate).format('DD/MM/YYYY') : '-'
        const latest_paid_date = (mktCustFilter.profile && mktCustFilter.profile.LastPaymentDate) ? moment(mktCustFilter.profile.LastPaymentDate).format('DD/MM/YYYY') : '-'
        const latest_paid_amount = (mktCustFilter.profile && mktCustFilter.profile.LastPaymentAmt) ? numberWithCommas(mktCustFilter.profile.LastPaymentAmt) : 0
        const latest_paid_channel = (mktCustFilter) ? '-' : '-'
        const overdue_amount = (mktCustFilter.profile && mktCustFilter.profile.OverdueAmt) ? numberWithCommas(mktCustFilter.profile.OverdueAmt) : 0
        const overdue_day = (mktCustFilter.profile && mktCustFilter.profile.OverdueDay) ? mktCustFilter.profile.OverdueDay : 0
        const convinient_time = (mktCustFilter.profile && mktCustFilter.profile.OpenHours) ? mktCustFilter.profile.OpenHours : '-'
        const cause_notice = (mktCustFilter.profile && mktCustFilter.profile.Cause) ? mktCustFilter.profile.Cause :''
        const callreport = (mktCustFilter.profile && mktCustFilter.profile.Cause_Detail) ? mktCustFilter.profile.Cause_Detail : ''
        const active_cell = (mktCustFilter.cellable) ? mktCustFilter.cellable[0].getAttribute('ref') : null
        const lockno_cell = (mktCustFilter.cellable) ? mktCustFilter.cellable[0].getAttribute('data-ref') : ''
        const tenor = (mktCustFilter.profile && mktCustFilter.profile.Tenor) ? numberWithCommas(mktCustFilter.profile.Tenor):0
        const total_topup = '-'
        let reference_no = (active_cell) ? active_cell : lockno_cell

        const principle = (mktCustFilter.profile && mktCustFilter.profile.Principle) ? mktCustFilter.profile.Principle:null
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
                                    {`${reference_no}`} / 001                                    
                                    <div className={`${cls['noteContainer']} ${(parseBool(preview)) && cls['hidden']} ${parseBool(previewBigScale) && cls['hidden']}`}>
                                        <i className={`${cls['handleInputNote']} fa fa-comments-o fr`} onClick={this.handleUseNote}></i>
                                        <span className={`${cls['handleNoteArea']} ${(this.state.useNote) && cls['open']}`}>
                                            {this.formNoteControl()}
                                        </span>
                                    </div>
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
                                <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray blue`}>{total_topup}</Col>
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
                                    {/* 50,000 (10/09) */}
                                    {/* use after offer: Accept/None */}
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
        const { actionLogs } = this.props
        const note_hist = actionLogs
       
        return (
            <div className={cls['grid_history']}>
                <div className={`${(this.state.history) ? `${cls['grid_collapse_open']} ${cls['hfix']}` : cls['grid_collapse']}`}>
                    <Table columns={columns} dataSource={note_hist} rowKey={this.setRowsKey} pagination={false} size="small" bordered className={`${(this.state.historyDesc) ? cls['show'] : cls['hidden']}`} />
                </div>
                <div className={`${cls['handleDetail']} tr`} onClick={this.handleHist}>
                    <i className={`${(!this.state.history) ? 'fa fa-caret-down' : 'fa fa-caret-up'}`}></i>&nbsp;
                    {(!this.state.history) ? `Action Log (${(note_hist.length).toString().padStart(2, "0")})` : 'Hidden Action Log'}
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

export default Form.create()(ProfileModal)