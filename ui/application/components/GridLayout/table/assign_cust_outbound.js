import React, { Component } from 'react'
import { withCookies } from 'react-cookie'
import { Row, Col, Popover, Modal, Icon, Form,  Input, Radio, Button, Checkbox, notification  } from 'antd'
import { config } from '../../../containers/Layouts/config'
import { parseBool } from '../../../containers/Layouts/function'

const FormItem = Form.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const ButtonGroup = Button.Group
const confirm = Modal.confirm

import LayoutModal from '../../Layouts/modal/market_layout/layout_modal'

import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

class AssignCustOutbound extends Component {

    constructor(props) {
        super(props)

        const { cookies } = props
        const cookieData = cookies.get('authen_info', { path: '/' })

        this.state = {
            visible: false,
            visible_layout: false,
            checked: false,
            element_cell: null,
            authen: (!cookieData) ? { Session: [] } : cookieData
        }

    }

    render() {
        const { data } = this.props
        const { getFieldDecorator, getFieldValue } = this.props.form

        let ApplicationNo = (data && !_.isEmpty(data.ApplicationNo)) ? data.ApplicationNo : null
        let MarketCode = (data && !_.isEmpty(data.MarketCode)) ? data.MarketCode : null
        let assignType = getFieldValue('LayoutTypeID')
        let assignColumns = getFieldValue('ColumnsCell')
        let checkConfirm = getFieldValue('CheckConfirm')

        let dataVerify  = true
        let btnYesClass = ''
        let btnNoClass = ''

        if(assignType) {
            if(assignType == 1) {
                btnYesClass = `${styles['bg_emerald']} ${styles['br_emerald']} ${styles['fg_white']}`
                btnNoClass = ``
            }
            if(assignType == 1 && (assignColumns && assignColumns !== '')) {
                dataVerify = false
            }
            if(assignType == 2) {
                dataVerify = false
                btnNoClass = `${styles['bg_red']} ${styles['br_red']} ${styles['fg_white']}`
                btnYesClass = ``
            }
        }

        const handleType = getFieldDecorator('LayoutTypeID', {})
        (
            <RadioGroup buttonStyle="solid" className="tl" size="small" onChange={this.onLayoutTypeChange}>
                <RadioButton value="2" className={`${btnNoClass} ttu`}>No</RadioButton>
                <RadioButton value="1" className={`${btnYesClass} ttu`}>Yes</RadioButton>
            </RadioGroup>
        )

        const handleLayout = (
            <Button 
                size="small" 
                disabled={(assignType && assignType == 1) ? false : true} 
                onClick={this.handleLayoutOpen}
                style={{ border: '0', fontSize: '1.2em', color: (assignType && assignType == 1) ? '#0f7dd8':'gray' }}
            >
                <i className="fa fa-braille" aria-hidden="true"></i>
            </Button>
        )

        const content = (
            <div id={`BOOKCELL_${ApplicationNo}`} style={{ opacity: 0 }} style={{ width: '200px' }}>
                <Form className={`${cls['modal_form_container']}`} onSubmit={this.handleSubmit}>
                    <div className={cls['ma0']} style={{ fontWeight: '600', fontSize: '0.85em' }}>แผงอยู่ในโครงตลาดใช่หรือไม่?</div>
                    <FormItem className={cls['form_item']}>
                    {
                        getFieldDecorator('ColumnsCell', {})
                        (<Input addonBefore={handleType} addonAfter={handleLayout} disabled={(assignType && assignType == 1) ? false : true} size="small" />)
                    }
                    </FormItem>     
                    <FormItem className={cls['form_item']} style={{ maxHeight: '30px', marginTop: '-13px' }}>
                    {
                        getFieldDecorator('CheckConfirm', {})
                        (
                            <Checkbox checked={this.state.checked} onChange={this.onCheckboxChange} size="small" disabled={dataVerify}>
                                <span style={{ fontSize: '0.85em', color: 'gray' }}>เช็ค <i className="fa fa-check" /> เพื่อยืนยันความถูกต้อง</span>
                            </Checkbox>                                
                        )
                    }
                    </FormItem>
                    <FormItem className={cls['form_item']}>
                        <Row>
                            <Col span={6}></Col>
                            <Col span={18}>
                                <ButtonGroup className="fr" size="small">
                                    <Button className="ttu" style={{ fontSize: '1.8em' }} onClick={this.handleCancel}>Cancel</Button>
                                    <Button className="ttu" style={{ fontSize: '1.8em' }} type="primary" htmlType="submit" disabled={!checkConfirm}>Save</Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </FormItem>               
                </Form>
            </div>
        )

        return ( 
            <div>
                <Popover visible={this.state.visible} content={content} trigger="click" placement="right" onClick={this.handleOpen}>
                    <div onClick={handlePopoverStyle.bind(this, `BOOKCELL_${ApplicationNo}`)}>
                        <Icon type="select" style={{ fontSize: '1.1em' }} />
                    </div>               
                </Popover>
                <LayoutModal
                    visible={this.state.visible_layout}
                    marketCode={MarketCode}
                    handleLayoutClose={this.handleLayoutClose}
                    handleGetCell={this.getCellColumns}
                />
            </div>
        )
    }

    handleOpen = () => {
        this.setState({ visible: true })
    }

    handleLayoutOpen = () => {
        this.setState({ visible_layout: true })
    }

    handleLayoutClose = () => {
        this.setState({ visible_layout: false })
    }

    onCheckboxChange = (e) => {
        this.setState({ checked: e.target.checked })
    }

    onLayoutTypeChange = () => {
        const { form } = this.props
        form.setFieldsValue({ 'ColumnsCell': null })
        this.setState({ checked: false })
    }

    handleCancel = () => {
        confirm({
            title: 'แจ้งเตือนจากระบบ',
            content: 'ยืนยันการยกเลิกใช่หรือไม่?',
            onOk: () => {
                this.props.form.resetFields()
                this.setState({ visible: false, checked: false })
            },
            onCancel: () => {},
            width: '270px'
        })        
    }

    handleSubmit = (e) => {
        e.preventDefault()
        
        const { data } = this.props
        const { authen, element_cell } = this.state
        const { Auth } = authen

        this.props.form.validateFields((err, fieldsValue) => {
            if (!err) {

                let parent_name = (fieldsValue.LayoutTypeID == 1) ? element_cell.attr('key') : undefined
                let request_data = {
                    MarketCode: (data && !_.isEmpty(data.MarketCode)) ? data.MarketCode : null,
                    CIF: (data && !_.isEmpty(data.CIFNO)) ? data.CIFNO : null,
                    CitizenID: (data && !_.isEmpty(data.CitizenID)) ? data.CitizenID : null,
                    AppNo: (data && !_.isEmpty(data.ApplicationNo)) ? data.ApplicationNo : null,
                    CustomerName: (data && !_.isEmpty(data.AccountName)) ? data.AccountName : null,
                    LayoutID: (parent_name && !_.isEmpty(parent_name) && fieldsValue.LayoutTypeID == 1) ? parent_name.replace(`_previews_${fieldsValue.ColumnsCell}`, '') : null,
                    ColumnCell: (fieldsValue.LayoutTypeID && fieldsValue.LayoutTypeID == 1) ? fieldsValue.ColumnsCell : null,
                    RequestID: (Auth && Auth.EmployeeCode) ? Auth.EmployeeCode : null,
                    RequestName: (Auth && Auth.EmpName_TH) ? stripname(Auth.EmpName_TH) : null,
                    MarketTypeID: fieldsValue.LayoutTypeID,
                    Mode: (fieldsValue.LayoutTypeID && fieldsValue.LayoutTypeID == 1) ? 'IN':'OUT'
                }

                confirm({
                    title: `คุณต้องการบันทึกข้อมูล ชื่อ ${request_data['CustomerName']} เป็นลูกค้า${(fieldsValue.LayoutTypeID && fieldsValue.LayoutTypeID == 1) ? 'ในโครงตลาด':'นอกโครงตลาด'}${(!_.isEmpty(request_data['ColumnCell'])) ? `หมายเลข ${request_data['ColumnCell']}` : ''} ใช่หรือไม่?`,
                    content: 'กรุณายืนยันการบันทึกข้อมูล กรณียืนยันคลิก OK  หรือ Cancel เพื่อยกเลิก',
                    onOk: () => { 
                        const request_set = new Request(`${config.hostapi}/assignmentMarketInOutbound`, {
                            method: 'POST',
                            header: new Headers({
                                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                            }),
                            body: JSON.stringify(request_data),
                            cache: 'no-cache'
                        })

                        fetch(request_set)
                        .then(resp => resp.json())
                        .then(resp => {
                            if(parseBool(resp.status)) {
                                notification.success({
                                    message: 'แจ้งเตือนจากระบบ',
                                    description: 'ระบบดำเนินการบันทึกข้อมูลลูกค้าสำเร็จ'
                                })
                                
                                data.handleUpdateCellAssignment(resp.data)

                                this.props.form.resetFields()
                                this.setState({ visible: false, checked: false })
                            }
                        })
                    },
                    onCancel: () => {}
                })

               

            }
        })

    }

    getCellColumns = (el) => {
        if(el && !_.isEmpty(el.attr('ref'))) {
            let updateFn = this.handleUpdateField
            confirm({
                title: `คุณต้องการเลือกหมายเลขแผง ${(el && el.attr('ref')) ? el.attr('ref') : '??'} ใช่หรือไม่?`,
                content: 'กรุณายืนยันการเลือกหมายเลขแผง',
                onOk: () => { updateFn(el.attr('ref'), el) },
                onCancel: () => {}
            })

            return false

        } else {
            notification.error({
                message: 'แจ้งเตือนจากระบบ',
                description: 'ขออภัย! เกิดข้อผิดพลาดในการรับข้อมูล กรุณาติดต่อผู้ดูแลระบบหรือแจ้งทีม Hotline (3618)'
            })
        }
    }

    handleUpdateField = (cellno, el) => {
        const { form } = this.props
        form.setFieldsValue({ 'ColumnsCell': cellno })
        this.setState({ 
            visible_layout: false, 
            element_cell: el
        })
    }

}

const handlePopoverStyle = (e) => {      
    _.delay(() => { 
        _.delay(() => { 
            $(`#${e}`).css({ opacity: 1 }) 
            $(`#${e}`).addClass('animated fadeIn')
            _.delay(() => { $(`#${e}`).removeClass('animated fadeIn') }, 300)

        }, 300)

        let element = $(`#${e}`).parents()
        if(element) {
            $(element[0]).css('padding', '3px 5px')
            $(element[0]).addClass(`${cls['unset']}`)
            $(element[1]).css('background', '#FFF ')
            $(element[2]).addClass(cls['unset'])
            $(element[3]).addClass(cls['unset'])
            $(element[4]).css('z-index', 1000)

            let el_arrow = $(element[3]).children()[0]            
            if(el_arrow) {
                $(el_arrow).addClass(cls['unset'])
            }

        }
        
    }, 200)

}

const stripname = (str) => {
    if (str)
        return str.replace('+', ' ')
    else
        return ''
}

const AssignCustOutboundWrapper = withCookies(AssignCustOutbound)
export default Form.create()(AssignCustOutboundWrapper)