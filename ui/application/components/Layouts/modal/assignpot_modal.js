import React, { Component } from 'react'
import { Modal, Card, Form, AutoComplete, Input, Select, Radio, Button, Icon, Row, Col, notification } from 'antd'
import { assign_columns } from '../config/assign_columns.js'
import { validateNumOnly } from '../../../containers/Layouts/function'
import _ from 'lodash'

import fix from '../styles/scss/potential.scss'
import cls from '../styles/scss/modal.scss'
import styles from '../styles/css/autocomplete.css'
import options from '../../../utilities/_general.scss'

const confirm = Modal.confirm
const FormItem = Form.Item
const InputGroup = Input.Group
const { TextArea } = Input
const ButtonGroup = Button.Group
const Option = Select.Option
const OptionGroup = AutoComplete.OptGroup
const SubOption = AutoComplete.Option
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class AssignPotentialModal extends Component {

    state = {        
        businessList: [],
        criteriaList: [],
        reasonDisable: true
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { form, getValues } = this.props
        confirm({
            title: 'กรุณายืนยันการบันทึกข้อมูล',
            content: 'โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนทำการบันทึกข้อมูล',
            onOk: () => {
               
                form.validateFields((err, fields) => {
                    if(fields.CustomerName && fields.ProductType && fields.ContactNo && fields.IsPotential && fields.ReasonCode) {
                        if(fields.ContactNo.length >= 9) {
                            fields.ReasonCode = fields.ReasonCode.join()
                            getValues(fields)
                            this.handleReset()
                        } else {
                            notification.warning({
                                message: 'กรอกข้อมูลไม่ครบถ้วน',
                                description: 'กรุณาระบุเบอร์ติดต่อให้ถูกต้อง'
                            })
                        }
                    } else {
                        notification.warning({
                            message: 'กรอกข้อมูลไม่ครบถ้วน',
                            description: 'กรุณาระบุรายละเอียดให้ครบถ้วน เพื่อประโยชน์ในการวิเคราะห์ข้อมูลในอนาคต'
                        })
                    }                    
                })
                
            },
            onCancel: () => {}
        })

    }

    handleClose = () => {
        const { handleCustPotentialClose } = this.props        
        this.handleReset()
        handleCustPotentialClose()
    }

    getBusinessTypeList = () => {
        const { businessList } = this.state
        const { masters } = this.props

        const filter_business = (businessList && businessList.length > 0) ? businessList : []
        const master_business = (masters.business_reason && masters.business_reason[0]) ? masters.business_reason[0] : []
        const result = (businessList && businessList.length > 0) ? filter_business : master_business

        const data_set = (
            _.map(result, (data, index) => { 
                return (<SubOption key={(index + 1)} value={`${data.Code}`}>{`${data.Name}`}</SubOption>) 
            })
        )

        return (data_set && data_set.length > 0) ? data_set : []
    }

    handleBusinessTypeSearch = (val) => {
        const { masters } = this.props
        const data_master = (masters.business_reason && masters.business_reason[0]) ? masters.business_reason[0] : null

        let result = this.getResultHandler(data_master, val)
        this.setState({ businessList: result })
    }

    getCriteriaList = () => {
        const { isCreate, assignCell, criteriaList } = this.state
        const { masters } = this.props

        let filter_criteria = (criteriaList && criteriaList.length > 0) ? criteriaList : []

        if(isCreate) {
            if(filter_criteria.length == 0) {
                const has_element = (assignCell) ? assignCell : null
                const has_prospect = (has_element) ? has_element.attr('data-prospect-status') : null
                let criteriaData = _.filter(master_criteria, { ReasonCriteria: (has_prospect == 'YES') ? 1:2 })
                filter_criteria = criteriaData
            }
        }

        const master_criteria = (masters.criteria_reason && masters.criteria_reason[0]) ? masters.criteria_reason[0] : []
        const result = (criteriaList && criteriaList.length > 0) ? filter_criteria : master_criteria

        const data_set = (
            _.map(result, (data, index) => { 
                return (<Option key={(index + 1)} value={`${data.ReasonCode}`} title={data.ReasonLabel}>{`${data.ReasonLabel}`}</Option>) 
            })
        )

        return (data_set && data_set.length > 0) ? data_set : []
    }

    handlePotentialType = (e) => {
        const { masters, form, isCreate, mktPotential, assignCell } = this.props
        const master_criteria = (masters.criteria_reason && masters.criteria_reason[0]) ? masters.criteria_reason[0] : []
        const has_element = (assignCell) ? assignCell : null

        let dataType = e.target.value
        let prospect_state = (has_element) ? has_element.attr('data-prospect-status') : null
        let status = (prospect_state && prospect_state == 'YES') ? 'Y':'N'

        if(dataType !== status) {
            form.setFieldsValue({ ReasonCode: undefined })
        } else {           
            if(!isCreate) {
                let reference_no = (has_element) ? has_element.attr('ref') : ''
                let has_prospect = (has_element) ? has_element.attr('data-prospect') : null
                let potentialData = (has_prospect) ? _.filter(mktPotential, { CustomerName: has_prospect, ColumnCell: reference_no })[0] : undefined
                let field_reasoncode = (potentialData) ? potentialData.ReasonCode.split(',') : undefined
                form.setFieldsValue({ ReasonCode: field_reasoncode })
            }            
        }
        
        let criteriaList = _.filter(master_criteria, { ReasonCriteria: (dataType == 'Y') ? 1:2 })
        this.setState({
            reasonDisable: false,
            criteriaList
        })

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible || 
               this.props.masters !== nextProps.masters ||
               this.props.isCreate !== nextProps.isCreate ||
               this.props.assignCell !== nextProps.assignCell ||
               this.props.mktPotential !== nextProps.mktPotential ||
               this.props.form !== nextProps.form ||
               this.state.businessList !== nextState.businessList ||
               this.state.criteriaList !== nextState.criteriaList ||
               this.state.reasonDisable !== nextState.reasonDisable
    }

    render() {

        const { visible, preview, previewBigScale, masters, isCreate, assignCell, mktPotential } = this.props
        const { getFieldDecorator } = this.props.form

        const has_element = (assignCell) ? assignCell : null
        const reference_no = (has_element) ? has_element.attr('ref') : ''
        const has_prospect = (has_element) ? has_element.attr('data-prospect') : null

        let potentialData = (has_prospect) ? _.filter(mktPotential, { CustomerName: has_prospect, ColumnCell: reference_no })[0] : undefined
        let field_customer = (potentialData) ? potentialData.CustomerName : undefined
        let field_aliasname = (potentialData) ? potentialData.AliasName : undefined
        let field_contactno = (potentialData) ? potentialData.ContactNo : undefined
        let field_product_type = (potentialData) ? potentialData.ProductType : undefined
        let field_is_potential = (potentialData) ? potentialData.IsPotential : undefined
        let field_reasoncode = (potentialData) ? potentialData.ReasonCode.split(',') : undefined
        let field_remark = (potentialData) ? potentialData.Remark : undefined

        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 7 },
              md: { span: 7 }
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 13 },
              md: { span: 13 }
            }
        }
        
        const AliasName = getFieldDecorator('AliasName', { initialValue: field_aliasname, rules: [{ required: false, message: ''}] })(<Input placeholder="ฉายา,ชื่อเล่น" disabled={preview || previewBigScale} style={{ width: '84.45px' }} />)

        return (
            <article>
                <Modal title={this.setTitleHeader()} visible={visible} maskClosable={false} onOk={null} onCancel={this.handleClose} closable={true} footer={this.setFooter()} wrapClassName={cls['handleProfileWrapper']}>
                    <Form className={`${fix['potential_container']} pa1`} onSubmit={this.handleSubmit}>   
                        <FormItem label="หมายเลขแผง" className={`${cls['mb1']} fw5`} {...formItemLayout}>
                            {
                                getFieldDecorator('ColumnCell', { initialValue: reference_no, rules: [{ required: false, message: ''}] })
                                (<Input disabled style={{ width: '20%' }} />)
                            }                                    
                        </FormItem> 
                        <FormItem label="ชื่อ-นามสกุล" className={`${cls['mb1']} fw5`}  {...formItemLayout}>                            
                            {
                                getFieldDecorator('CustomerName', { initialValue: field_customer, rules: [{ required: true, message: 'กรุณาระบุชื่อลูกค้า'}] })
                                (<Input addonAfter={AliasName} disabled={!isCreate || preview || previewBigScale} />)
                            }                                                                     
                        </FormItem>
                        <FormItem label="เบอร์โทรติดต่อ" className={`${cls['mb1']} fw5`}  {...formItemLayout}>
                            {
                                getFieldDecorator('ContactNo', { initialValue: field_contactno, rules: [{ required: true, message: 'กรุณาระบุเบอร์ติดต่อลูกค้า' }] })
                                (<Input disabled={preview || previewBigScale} />)
                            }                                    
                        </FormItem>
                        <FormItem label="ประเภทสินค้าที่ขาย" className={`${cls['mb1']} fw5`}  {...formItemLayout}>
                            {
                                getFieldDecorator('ProductType', { initialValue: field_product_type, rules: [{ required: true, message: 'กรุณาระบุประเภทสินค้าที่ลูกค้าขาย'}] })
                                (
                                    <AutoComplete
                                        className={styles['certain-category-search']}
                                        dropdownClassName={styles['certain-category-search-dropdown']}
                                        dropdownMatchSelectWidth={false}
                                        dataSource={this.getBusinessTypeList()}
                                        onSearch={this.handleBusinessTypeSearch}
                                        optionLabelProp="children"
                                        disabled={preview || previewBigScale}
                                    >
                                        <Input id="ProductType" suffix={<Icon type="search" className={styles['certain-category-icon']} />} />
                                    </AutoComplete>
                                )
                            }                                    
                        </FormItem>
                        <FormItem label="ศักยภาพของลูกค้า" className={`${cls['mb1']} fw5`}  {...formItemLayout}>
                            {
                                getFieldDecorator('IsPotential', { initialValue: field_is_potential, rules: [{ required: true, message: 'กรุณาระบุศักยภาพของลูกค้า'}] })
                                (
                                    <RadioGroup onChange={this.handlePotentialType} disabled={preview || previewBigScale}>
                                        <Radio value="Y">Potential</Radio>
                                        <Radio value="N">Not Potential</Radio>
                                    </RadioGroup>
                                )
                            }                                    
                        </FormItem>
                        <FormItem label="เหตุผล" className={`${cls['mb1']} fw5`}  {...formItemLayout}>
                            {
                                getFieldDecorator('ReasonCode', { initialValue: field_reasoncode, rules: [{ required: true, message: 'กรุณาระบุเหตุผลในการเลือกศักยภาพของลูกค้า'}] })
                                (
                                    <Select mode="multiple" disabled={this.state.reasonDisable || preview || previewBigScale}>
                                        { this.getCriteriaList() }
                                    </Select>
                                )
                            }                                    
                        </FormItem>
                        <FormItem label="หมายเหตุ" className={`${cls['mb1']} fw5`}  {...formItemLayout}>
                            {
                                getFieldDecorator('Remark', { initialValue: field_remark, rules: [{ required: false, message: ''}] })
                                (<TextArea autosize={{ minRows: 2, maxRows: 6 }} disabled={this.state.reasonDisable || preview || previewBigScale} />)
                            }                                    
                        </FormItem>
                        <FormItem  wrapperCol={{ span: 24, offset: 16 }}>
                            <Button type="primary" htmlType="submit" size="small" style={{ marginLeft: '7px', display: `${(preview || previewBigScale) ? 'none':'block'}` }}>บันทึกข้อมูล</Button>                         
                        </FormItem>
                    </Form>
                </Modal>                
            </article>
        )
    }

    setTitleHeader = () => {
        return (
            <div className={cls['title_header']}>
                <span className="pa1">
                    <i className="fa fa-wpforms" />&nbsp;
                    ฟอร์มบันทึกข้อมูลลูกค้าพบใหม่ในตลาด
                </span>
            </div>
        )
    }

    setFooter = () => { 
        const { isCreate } = this.props
        return (
            <div className={`tl ${(!isCreate) && 'dn'}`}>
                <p className={`${options['fg_gray']} f7`}><u className="fw6">หมายเหตุ</u> กรุณาตรวจสอบ ชื่อ-นามสกุล ของเจ้าของกิจการให้ถูกต้อง เนื่องจากหลังบันทึกข้อมูลเสร็จสิ้น ระบบจะไม่อนุญาตให้ดำเนินการแก้ไข ชื่อ-นามสกุล ของเจ้าของกิจการ</p>
            </div>
        ) 
    }

    getResultHandler(master, valueStartsWith) {
        return this.searchWord(master, valueStartsWith)
    }

    searchWord(arr, searchKey) {        
        return arr.filter(obj => Object.keys(obj).some(key => _.includes(obj[key], searchKey)))
    }


}

export default Form.create()(AssignPotentialModal)