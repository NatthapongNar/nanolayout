import React, { ReactDOM, Component } from 'react'
import { render } from 'react-dom'
import { withCookies, Cookies } from 'react-cookie'
import { LocaleProvider, DatePicker, Avatar, Table, Spin, Icon, Form, Row, Col, Input, TreeSelect, Select, Radio, Checkbox, Slider, Switch, Button, Tooltip, notification } from 'antd'
import { customer_columns } from './columns/customer_column'
import { gridCustomerEmpDropdown } from  '../../../containers/GridLayout/api'
import Loader from '../loader'

import { createElement, localStorageRead, parseBool, roundFixed, numberWithCommas, largeNumberToShort } from '../../../containers/Layouts/function'
import cls from '../style/grid_market.scss'
import styles from '../../../utilities/_general.scss'

const Option = Select.Option
const FormItem = Form.Item
const RadioGroup = Radio.Group
const CheckboxGroup = Checkbox.Group
const ButtonGroup = Button.Group

const gutter_init = 10
const tree_config = {
    size: 'large',
    treeCheckable: true,
    showCheckedStrategy: TreeSelect.SHOW_PARENT,
    dropdownMatchSelectWidth: false,
    style: { width: '100%' }
}

const short_numtodigit = 11
const sequence_no = ['RegionID', 'AreaID', 'ZoneValue', 'BranchType']
const MasterPageSize = [20, 40, 60, 80, 100, 200, 300]

const LeadOptions = [
    { label: 'CUSTOMER', value: 'CUSTOMER' },
    { label: 'PROSPECT', value: 'PROSPECT' },
]
const defaultLeadChecked = ['CUSTOMER', 'PROSPECT']

class GridCustomer extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props

        this.state = {
            checkedList: defaultLeadChecked,
            search: false,
            searchContent: false,
            employeeList: [],
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

    handleSearchCollapse = () => {
        this.setState({ search: !this.state.search })
    }

    handleSearchContentCollapse = () => {
        this.setState({ searchContent: !this.state.searchContent })
    }

    componentWillReceiveProps(props) {
        if (props) {
            const { config, locales, cookies } = this.props
            cookies.set(config.cookies_config.name.lang, locales, { path: config.cookies_config.path, expires: config.cookies_config.expires })
        }
    }

    componentWillMount() {
        const { filters } = this.props
        if(filters) {
            this.handleEmpDropdown(filters.MarketCode)
        }
    }

    componentDidMount() {    
        let ro = new ResizeObserver(entries => {            
            if(entries[0].target) {
                let parentTable = entries[0].target
                let rtd_element = parentTable.querySelectorAll(`tr:first-child td`) // [class^="mktcol"]
                let rtd_count = parentTable.querySelectorAll('tr:first-child td').length

                $(rtd_element).removeAttr('style')

                if(rtd_count > 0) {                    
                    let rtd_size = []
                     _.forEach(rtd_element, (v, i) => { 
                        let width = $(v).outerWidth()
                        $(v).css({ 'width': width })
                        .after(() => {
                            let el_column = $(v)
                            if(el_column && el_column.length > 0) {
                                $(`.mktft_${(i+1)}`).attr('style', el_column.attr('style'))
                            }
                        })
                    })
                }

            }
        })

        ro.observe(document.querySelector(`.${cls['grid_container']}`))        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.props.progress !== nextProps.progress ||
               this.props.locales !== nextProps.locales ||
               this.props.filters !== nextProps.filters ||
               this.props.form !== nextProps.form ||
               this.props.data !== nextProps.data ||
               this.state.pagination !== nextState.pagination ||
               this.state.search !== nextState.search ||
               this.state.searchContent !== nextState.searchContent
    }

    render() {
        const { pagination } = this.state
        const { data, visible, progress, locales, config, handlePage } = this.props
      
        const market_name = (data.dataSource[0]) ? `(${data.dataSource[0].MarketCode}-${data.dataSource[0].MarketName})` : (<Spin spinning={true} className={`${(data.status) ? cls['hide']:''}`} style={{ fontSize: 16, color: '#08c' }} />)

        return (
            <div className={`${cls['grid_container']} ${cls['unset']}`}>
              
                <div className={`${cls['ctrlCustGridContainer']}`} onClick={handlePage.bind(this, {key: 'main'})}>
                    <Tooltip placement="right" title= {`${config.lang[locales.region_type].grid.customer.tools.btn.back}`}>
                        <div className={`${cls['ctrlGridCircle']}`}>                       
                            <i className={`fa fa-table`} />
                        </div>  
                    </Tooltip>            
                </div>
               
                <div className={`fa6 pv2`}>
                    <div className={`${cls['grid_title']}`}>
                        {`${config.lang[locales.region_type].grid.customer.title}`}
                        <div className={`${cls['grid_subtitle']}`}>{(market_name) ? market_name:''}</div>
                    </div>       
                </div>
                
                { this.handleHeadFilter(config.lang[locales.region_type].grid.default) }
            
                <Table
                    rowKey={this.handleRowKey}
                    columns={customer_columns}
                    dataSource={data.dataSource}
                    loading={progress.visible}
                    pagination={{ ...pagination }}
                    footer={this.handleFooter}
                    bordered
                />
                
            </div>
        )
    }

    // SET FOOTER
    handleFooter = (currentPageData) => {
        const { data, progress, config, locales } = this.props

        const lang_field_default = config.lang[locales.region_type].grid.default
        const parentTable = document.querySelector(`.${cls['grid_container']}`)
        const default_class = ['ttu tc', 'tc', 'tl', 'tl', 'tc', 'tc', 'tc', 'tl', 'tc', 'tc', 'tr', 'tc', 'tr', 'tc', 'tr', 'tc', 'tr', 'tc', 'tr', 'tr', 'tc']

        if(parentTable) {

            let rtd_element = parentTable.querySelectorAll(`tr:first-child td`)
            let rtd_count = parentTable.querySelectorAll('tr:first-child td').length

            if(rtd_count > 0) {

                let rtd_size = []
                _.forEach(rtd_element, (v, i) => { rtd_size.push($(v).outerWidth()) })
                
                // CURRENT PAGE
                let footer_summary = { 
                    cur: {
                        0: lang_field_default.footer.page_title,
                        10: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Limit'), 0), short_numtodigit)),
                        12: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Principle'), 0), short_numtodigit)),
                        14: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'TopupAmount'), 0), short_numtodigit)),
                        16: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'Week_Installment'), 0), short_numtodigit)),
                        18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'OverdueAmt'), 0), short_numtodigit)),
                        19: '0'
                    },
                    all: {
                        0: lang_field_default.footer.total_title,
                        10: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.dataSource, 'Limit'), 0), short_numtodigit)),
                        12: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.dataSource, 'Principle'), 0), short_numtodigit)),
                        14: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.dataSource, 'TopupAmount'), 0), short_numtodigit)),
                        16: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.dataSource, 'Week_Installment'), 0), short_numtodigit)),
                        18: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data.dataSource, 'OverdueAmt'), 0), short_numtodigit)),
                        19: '0'
                    }                  
                }

                return (
                    <div className={`${cls['grid_footer']} ${(progress.visible) ? cls['hide'] : ''}`}>
                        <div className={cls['footer_partition']}>
                            { 
                                _.map(rtd_size, (size, i) => {
                                    return (
                                        <div key={(i+1)} className={`${cls['item_footer']} mktft_${(i+1)} ${default_class[i]}`} style={{ width: size }}>{(footer_summary.cur[i]) ? footer_summary.cur[i] : ''}</div>
                                    )
                                })
                            }  
                        </div>  
                        <div className={cls['footer_partition']}>    
                            { 
                                _.map(rtd_size, (size, i) => {
                                    return (
                                        <div key={(i+1)} className={`${cls['item_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) ? cls['strnorap']:''}`} style={{ width: size }}>{(footer_summary.all[i]) ? footer_summary.all[i] : ''}</div>
                                    )
                                })
                            }  
                        </div>                 
                    </div>
                )

            } else {
                return (<div className={`${cls['grid_footer']}`}></div>)
            }

        } else {
            return (<div className={`${cls['grid_footer']}`}></div>)
        }
    }

    // SET HASH KEY OF RECORD FOR UNIQUE ROWS
    handleRowKey = (records, i) => { return `${records.RowID}_${(i+1)}` }

    // SET FILTER CRITERIA
    handleHeadFilter = (panelInfo) => {
        const { search, searchContent, employeeList, pagination } = this.state
        const { masters, config, locales, form } = this.props
        const { getFieldDecorator } = form
        const { RangePicker } = DatePicker

        const field_colon_label = false
        const lang_field_default = config.lang[locales.region_type].grid.default
        const lang_field_filters = config.lang[locales.region_type].grid.customer.filters

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

                <div className={cls['item_header']} data-attr="search-filter">

                    <div className={`${cls['panel_container']} ${(search) ? cls['open'] : ''}`} onMouseOver={(!search) ? this.handleSearchCollapse : () => { return false }} onMouseOut={(!searchContent) ? this.handleSearchCollapse : () => { return false }}>
                        <div className={`${cls['panel_header']} ${(search) ? cls['open'] : ''} ${(searchContent) ? cls['reverse'] : ''}`} onClick={this.handleSearchContentCollapse}>
                            <span>
                                <Icon type="search" className={`${cls['panel_iheader']} mr1`} />
                                { panelInfo.panel_title }
                            </span>
                        </div>
                        <div className={`${cls['panel_content']} ${(searchContent) ? cls['open'] : ''}`}>

                            <Form className={`${cls['form_container']} ${(searchContent) ? cls['open'] : ''}`} onSubmit={this.handleSearchSubmit}>
                                <Row gutter={gutter_init} style={{ borderBottom: '1px solid rgba(209, 209, 209, .3)' }}>
                                    <Col span={12}>
                                        <FormItem label="Assignment Status / Customer Status" className={`${cls['form_item']} ${cls['fix_height']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Assignment', { initialValue: 'A' })(
                                                    <RadioGroup>
                                                        <Radio value="N" className={`${cls['ph1']} ${cls['mh0']}`}>Not Assigned</Radio>
                                                        <Radio value="Y" className={`${cls['ph1']} ${cls['mh0']}`}>Assigned</Radio>
                                                        <Radio value="A" className={`${cls['ph1']} ${cls['mh0']}`}>All</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                        <FormItem className={`${cls['form_item']} ${cls['fix_height']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('CustomerStatus', { initialValue: 'Y' })(
                                                    <RadioGroup>
                                                        <Radio value="Y" className={`${cls['ph1']} ${cls['mh0']}`}>Active</Radio>
                                                        <Radio value="N" className={`${cls['ph1']} ${cls['mh0']}`}>Inactive</Radio>
                                                        <Radio value="A" className={`${cls['ph1']} ${cls['mh0']}`}>All</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Application No" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('ApplicationNo')
                                                    (<Input placeholder={lang_field_filters.appno_field.placeholder_label} className={`ttu`} />)
                                            }
                                        </FormItem>                                       
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Employee" className={`${cls['form_item']} ${cls['ctrlTree']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Employee', { initialValue: [] })(
                                                    <Select mode="multiple" placeholder={lang_field_filters.calist_field.placeholder_label} disabled={(employeeList && employeeList.length > 0) ? false : true}>
                                                        { 
                                                            (employeeList && employeeList.length > 0) && (_.map(employeeList, (v, i) => {
                                                                return (<Option key={(i+1)} value={v.CAID}>{`${v.CAName} ${(v.PositionCode) && `(${v.PositionCode})`}`}</Option>)
                                                            })) 
                                                        }
                                                    </Select>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>                                
                                <Row gutter={gutter_init}>
                                    <Col span={12}>
                                        <FormItem label="App Date" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
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
                                        <FormItem label="Customer Name" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('CustomerName')
                                                    (<Input placeholder={lang_field_filters.customer_field.placeholder_label} className={`ttu`} />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Optional" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Optional', { initialValue: [] })(
                                                    <Select mode="multiple"  placeholder={lang_field_filters.optional_field.placeholder_label} disabled={true}>
                                                        <Option value=""></Option>
                                                    </Select>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={gutter_init}>
                                    <Col span={12}></Col>
                                    <Col span={12}>
                                        <FormItem style={{ marginBottom: '0px' }} className={`fr`}>
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

                        </div>
                    </div>
                </div>

            </div>
        )
    }

    openNotificationLocationUnavaliable = () => {
        const { config, locales } = this.props
        const lang_notification = config.lang[locales.region_type].notification
        notification.warning({
            icon: (<Icon type="bulb" className={styles['fg_amber']} />),
            message: lang_notification.unavailable.title,
            description: lang_notification.unavailable.desc,
            placement: 'bottomRight'
        })
    }

    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    handleSearchSubmit = (e) => {
        e.preventDefault()
        const { form: { validateFields }, onSearchFilter } = this.props
        validateFields((err, objField) => {
            onSearchFilter(objField)
        })

    }

    // FILTER RESET ALL HANDLER
    handleReset = () => { this.props.form.resetFields() }

    handleEmpDropdown = (param) => {
        gridCustomerEmpDropdown(param).then(resp => {
            if(parseBool(resp.status)) {
                this.setState({ employeeList: resp.data })    
            }

        })
    }
}

const gidCustomerWithCookies = withCookies(GridCustomer)
export default Form.create()(gidCustomerWithCookies)