import React, { Component } from 'react'
import { withCookies, Cookies } from 'react-cookie'
import { Modal, Table, Form, Input, Select, Radio, Button, Icon, Row, Col } from 'antd'
import { assign_columns } from '../config/assign_columns.js'
import _ from 'lodash'

import cls from '../styles/scss/modal.scss'
import styles from '../../../components/GridLayout/style/grid_market.scss'

import { config } from '../../../containers/GridLayout/config'

const FormItem = Form.Item
const Option = Select.Option
const ButtonGroup = Button.Group
const RadioGroup = Radio.Group;

const MasterPageSize = [10, 30, 50, 70, 80, 100]

const cookies = new Cookies()
const default_cklang = cookies.get(config.cookies_config.name.lang, { path: config.cookies_config.path })
const default_lang = (default_cklang) ? default_cklang.region_type : 'en'

class AssignModal extends Component {

    constructor(props) {
        super(props)

        this.state = {
            progress: true,
            lang: {
                region_type: default_lang,
                config: config.lang_instant
            },
            pagination: {
                size: 'small',
                pageSize: 10,
                showQuickJumper: false,
                pageInfo: null,
                showTotal: (total, range) => {
                    const { pagination } = this.state
                    let el_target = document.querySelector('.number_length')       
                    let page_info = config.lang[default_lang].grid.default.pagelabel_entroll(range[0], range[1], total)
                    pagination.pageInfo = page_info  
                    if (el_target) {    
               
                        if (el_target.innerHTML.length > 0) {
                            el_target.innerHTML = el_target.innerHTML.replace(el_target.innerHTML, pagination.pageInfo)
                        } else {
                            el_target.innerHTML = pagination.pageInfo
                        }
                        return pagination.pageInfo
                    } else {
                        _.delay(() => { 
                            let el_page_info = document.querySelector('.number_length')
                            let el_grid_page = document.querySelector('.ant-pagination-total-text')
                            if(el_page_info) {
                                el_page_info.innerHTML = el_page_info.innerHTML.replace(el_page_info.innerHTML, page_info)
                                el_grid_page.innerHTML = el_grid_page.innerHTML.replace(el_grid_page.innerHTML, page_info)
                            }
                        }, 500)
                    }
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible || 
               this.props.assignItem !== nextProps.assignItem ||
               this.props.assignMode !== nextProps.assignMode ||
               this.props.form !== nextProps.form ||
               this.state.progress !== nextState.progress ||
               this.state.pagination !== nextState.pagination
    }

    componentWillReceiveProps(props) {
        if(props) {
            if(props.visible) {
                if(props.assignItem.length > 0 && this.state.progress) {
                    this.setState({ progress: false })
                }
            }
        }
    }

    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    handleSearch = (e) => {
        e.preventDefault()
        const { handleMarketCustomerListFilter  } = this.props
        this.props.form.validateFields((err, values) => { 
            handleMarketCustomerListFilter(values) 
        })        
    }

    handleReset = () => {
        const { handleAssignResetFilter } = this.props
        this.props.form.resetFields()
        handleAssignResetFilter()
    }

    handleClose = () => {
        const { handleAssignModalClose } = this.props

        this.setState({ progress: true })
        handleAssignModalClose()
    }

    changeAppHandle = (e) => {
        const { form } = this.props
        let app_handle = e.target.value       
        if(app_handle) {
            if(app_handle.length > 14) {
                form.setFieldsValue({'app_handle': 'appno'})
            } else if(app_handle.length >= 10 && app_handle.length <= 14) {
                form.setFieldsValue({'app_handle': 'contactno'})
            } else {
                form.setFieldsValue({'app_handle': 'cif'})
            }            
        }
    }

    setTitleHeader = () => {
        const { assignMode } = this.props
        let title = (assignMode == 'NEW') ? 'กำหนดข้อมูลลูกค้าลงในแผง (Cust. Assignment)' : 'เพิ่มข้อมูลลูกค้าในแผงเดิม (Additional Assignment)'

        return (
            <div className={cls['title_header']}>
                <span className="pa1">
                    <i className="fa fa-street-view " />&nbsp;
                    {title}
                </span>
            </div>
        )
    }

    setRowsKey = (rowKey) => { return rowKey.RowID }

    render() {
        const { progress, pagination } = this.state
        const { visible, assignItem } = this.props
        const { getFieldDecorator } = this.props.form

        const selectIntegerHandle = getFieldDecorator('app_handle', { initialValue: 'cif', rules: [{ required: false, message: ''}] })
        (
            <Select style={{ width: 80 }}>
                <Option value=""></Option>
                <Option value="cif">CIF</Option>
                <Option value="appno">App No</Option>
                <Option value="contactno">Contact No</Option>
            </Select>
        ) 

        const selectStringHandle = getFieldDecorator('cust_handle', { initialValue: 'cust', rules: [{ required: false, message: ''}] })
        (
            <Select style={{ width: 80 }} disabled={true}>
                <Option value=""></Option>
                <Option value="cust">Customer</Option>
                <Option value="shop">Shop Name</Option>
            </Select>
        )

        return (
            <article>
                <Modal 
                    title={this.setTitleHeader()} 
                    className={`${styles['customer_modal']} ${styles['assignment']}`}
                    visible={visible} 
                    onOk={this.handleClose} 
                    onCancel={this.handleClose} 
                    mask={true} 
                    maskClosable={false} 
                    footer={null} 
                    width="70%"
                >

                    <Form className="pa1" onSubmit={this.handleSearch}>
                        <Row type="flex" gutter={10}>
                            <Col span={12}>
                                <FormItem label="CIF / App No / Contact No" className={`${cls['mb1']} fw5`} style={{ fontSize: '0.9em' }}>
                                    {
                                        getFieldDecorator('app_input', { 
                                            rules: [{ required: false, message: ''}] 
                                        })
                                        (<Input addonBefore={selectIntegerHandle} onChange={this.changeAppHandle} />)
                                    }                                    
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="Customer / Shop Name" className={`${cls['mb1']} fw5`}>
                                    {
                                        getFieldDecorator('cust_input', {                                             
                                            rules: [{ required: false, message: ''}] 
                                        })
                                        (<Input addonBefore={selectStringHandle} disabled={true} />)
                                    }  
                                    
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <Col span={12}>
                                    <FormItem className={`${cls['mb1']} fw5`}>
                                        {
                                            getFieldDecorator('cust_isactive', { 
                                                initialValue: 'Y',
                                                rules: [{ required: false, message: ''}] 
                                            })
                                            (
                                                <RadioGroup>
                                                    <Radio value="Y">Unassignment</Radio>
                                                    <Radio value="N">Assignment Completed</Radio>
                                                </RadioGroup>
                                            )
                                        }  
                                        
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <ButtonGroup className="fr">
                                        <Button onClick={this.handleReset}>ล้างข้อมูล</Button>
                                        <Button type="primary" htmlType="submit">
                                            <i className="fa fa-search"></i> ค้นหาข้อมูล
                                        </Button>
                                    </ButtonGroup>
                                </Col>                                
                            </Col>          
                        </Row>
                    </Form>

                    <div className={`${styles['grid_container']}`} style={{ marginTop: '40px' }}>
                        <div className={styles['grid_header']}>
                            <div className={styles['item_header']} data-attr="search-pagesize">
                                <div className={styles['page_container']}>
                                    <label>
                                        {config.lang[default_lang].grid.default.pagelabel_length}
                                        <Select className={styles['page_sizenumber']} defaultValue={`${pagination.pageSize}`} size="small" onChange={this.handlePageChange}>
                                            {
                                                _.map(MasterPageSize, (v, i) => {
                                                    return (<Option key={(i + 1)} value={`${v}`}>{`${v}`}</Option>)
                                                })
                                            }
                                        </Select>
                                        {config.lang[default_lang].grid.default.pagelabel_entries}
                                    </label>
                                    <div className="number_length"></div>
                                </div>
                            </div>
                            <div className={styles['item_header']} data-attr="search-filter"></div>
                        </div>

                        <Table 
                            rowKey={this.setRowsKey}
                            columns={assign_columns} 
                            dataSource={assignItem} 
                            size="small" 
                            pagination={{ ...pagination }} 
                            className={`${styles['grid_nano_dashboard']}`}
                            loading={progress}
                            bordered 
                        />

                    </div>

                  

                </Modal>
            </article>
        )
    }

}

const AssignModalWithCookies = withCookies(AssignModal)
export default Form.create()(AssignModalWithCookies)