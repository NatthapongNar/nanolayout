import React, { ReactDOM, Component } from 'react'
import { render } from 'react-dom'
import { LocaleProvider, DatePicker, Table, Spin, Icon, Form, Row, Col, Input, TreeSelect, Select, Radio, Checkbox, Slider, Switch, Button, notification  } from 'antd'

import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { createElement, localStorageRead, roundFixed, numberWithCommas, largeNumberToShort, getCoords, strFloat, parseBool } from '../../../containers/Layouts/function'
import { getSaleSummaryAPI, getPortfolioSummaryAPI } from '../../../containers/GridLayout/api'
import { columns } from './columns/market_column'
import SaleSummaryChart  from '../dashboard/chart/sale_summary_chart'
import PortfolioChart from '../dashboard/chart/portfolio_chart'
import Loader from '../loader'

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

const sequence_no = ['RegionID', 'AreaID', 'ZoneValue', 'BranchType']
const MasterPageSize = [20, 40, 60, 80, 100, 200, 300]
const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)

class GridMarket extends Component {

    constructor(props) {
        super(props)

        const { config, locales } = this.props

        this.state = {
            shopable: false,
            search: false,
            searchContent: false,
            isRefresh: false,
            bucketshare: {
                sourceData: null,
                mktinfo: [],
                visible: false,
                viewmode: null,
                elementRow: null,
                options: null
            },
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

    handleChartPopper = (e) => {
        const { data } = this.props
        const element_target = (e) ? e.target : e.currentTarget

        if (element_target) {
            const parentTarget = element_target.parentElement.parentElement
            let rowActive = document.querySelectorAll('tr.ant-table-row[style^="background"]')
            if (rowActive && rowActive.length > 0) {
                (rowActive[0]).removeAttribute('style')
            }

            parentTarget.style.background = '#0046B6'
            parentTarget.style.color = '#ffffff'

            const market_code = (element_target) ? element_target.getAttribute('data-attr') : null
            let objData = (market_code) ? _.filter(data, { MarketCode: market_code }) : []
            this.setState({ bucketshare: { sourceData: market_code, mktinfo: objData, visible: true, viewmode: 'bucketshare', options: element_target, elementRow: parentTarget } })
        }
    }

    handleChartPopperClose = () => {
        const { bucketshare } = this.state
        if (bucketshare) {
            bucketshare.elementRow.removeAttribute('style')
        }

        this.setState({ bucketshare: _.assignIn({}, this.state.bucketshare, 
            { 
                sourceData: null,
                mktinfo: [],
                visible: false,
                viewmode: null,
                elementRow: null,
                options: null
            }) 
        })
    }

    componentWillReceiveProps(props) {
        if (props.data) {
            if (props.data.length > 0) {
                _.map(props.data, (objData, i) => {
                    objData.BucketChart = (<i key={objData.RowID} id={`vchart_${objData.RowID}`} className={`${cls['view_icon']} fa fa-eye`} data-attr={objData.MarketCode} aria-hidden="true" onClick={this.handleChartPopper}></i>)
                    return objData
                })
            }
        }
    }

    componentDidMount() {
        
        let ro = new ResizeObserver(entries => {     
            if(entries[0].target) {
                const { pagination } = this.state
                const { config, locales } = this.props

                let parentTable = entries[0].target
                let rtd_element = parentTable.querySelectorAll(`tr:first-child td`) //[class^="mktcol"]
                let rtd_count = parentTable.querySelectorAll('tr:first-child td').length

                let el_target = document.querySelector('.number_length')
                let el_pagination = document.querySelector('.ant-pagination-total-text')
              
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

                if (el_target) {
                    let pagination_info = (el_pagination) ? el_pagination.innerText : null
                    if(pagination_info) {
                        el_target.innerHTML = pagination_info
                    }
                }

            }
        })
        ro.observe(document.querySelector(`.${cls['grid_container']}`))
    }

    shouldComponentUpdate(nextProps, nextState) {
        return  this.state.shopable !== nextState.shopable ||
                this.state.bucketshare !== nextState.bucketshare ||
                this.state.search !== nextState.search ||
                this.state.isRefresh !== nextState.isRefresh ||
                this.state.searchContent !== nextState.searchContent ||
                this.state.pagination !== nextState.pagination ||
                this.props.visible !== nextProps.visible ||
                this.props.progress !== nextProps.progress ||
                this.props.locales !== nextProps.locales ||
                this.props.data !== nextProps.data ||
                this.props.form !== nextProps.form
    }

    render() {
        const { bucketshare, pagination } = this.state
        const { data, progress, locales, config } = this.props

        return (            
            <div className={`${cls['grid_container']} ${cls['unset']}`}>              
                <h3 className={cls['grid_title']}>{config.lang[locales.region_type].grid.market.title}</h3>
                {this.handleHeadFilter(config.lang[locales.region_type].grid.default)}
                <Table
                    rowKey={this.handleRowKey}
                    className={`${cls['grid_nano_dashboard']}`}
                    columns={columns}
                    dataSource={data}
                    loading={progress.visible}
                    pagination={{ ...pagination }}
                    footer={this.handleFooter}                   
                    bordered
                />
                <ChartPopper 
                    sourceData={bucketshare.sourceData} 
                    marketinfo={bucketshare.mktinfo} 
                    viewmode={bucketshare.viewmode} 
                    visible={bucketshare.visible} 
                    options={bucketshare.options} 
                    handleClose={this.handleChartPopperClose} 
                    config={config}
                    locales={locales}                    
                />
            </div>            
        )
    }

    // SET FOOTER
    handleFooter = (currentPageData) => {     
        const { data, config, locales } = this.props

        const lang_field_default = config.lang[locales.region_type].grid.default
        const parentTable = document.querySelector(`.${cls['grid_container']}`)
        const default_class = ['ttu tl fw6', 'tl', 'tr', 'tr', 'tr', 'tr', 'tc', 'tc', 'tr', 'tr', 'tr', 'tc', 'tc', 'tr', 'tc', 'tl', 'tl', 'tc', 'tc', 'tc']

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
                        2: numberWithCommas(roundFixed(_.sumBy(currentPageData, 'MarketShop'), 0)),
                        7: numberWithCommas(_.sumBy(currentPageData, 'OS_TotalAcc')),
                        8: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(currentPageData, 'OS_Bal'), 0))),
                        12: numberWithCommas(_.sumBy(currentPageData, 'TotalApp'))
                    },
                    all: {
                        0: lang_field_default.footer.total_title,
                        2: numberWithCommas(_.sumBy(data, 'MarketShop')),
                        7: numberWithCommas(_.sumBy(data, 'OS_TotalAcc')),
                        8: numberWithCommas(largeNumberToShort(roundFixed(_.sumBy(data, 'OS_Bal'), 0))),
                        12: numberWithCommas(_.sumBy(data, 'TotalApp'))
                    }                  
                }

                return (
                    <div className={`${cls['grid_footer']}`}>
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
                                        <div key={(i+1)} className={`${cls['item_footer']} mktft_${(i+1)} ${default_class[i]} ${(i==0) &&  cls['strnorap']}`} style={{ width: size }}>{(footer_summary.all[i]) ? footer_summary.all[i]:''}</div>
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
    
    /** TABLE OPTIONAL HANDLER **/
    handlePageChange = (size) => {
        this.setState({ pagination: _.assignIn({}, this.state.pagination, { pageSize: parseInt(size) }) })
    }

    handleSearchSubmit = (e) => {
        e.preventDefault()
        const { shopable } = this.state
        const { form: { validateFields }, onSearchFilter } = this.props
        validateFields((err, objField) => {
            onSearchFilter(objField, { 'shopable': shopable }, true)
        })

    }

    // FILTER RESET ALL HANDLER
    handleReset = () => { this.props.form.resetFields() }

    // SET HASH KEY OF RECORD FOR UNIQUE ROWS
    handleRowKey = (records, i) => { return `${records.RowID}_${(i+1)}` }

    /** FILTER CRITERIA HANDLER **/
    handleShopUseable = () => {
        this.setState({ shopable: !this.state.shopable })
    }

    handleSearchCollapse = () => {
        this.setState({ search: !this.state.search })
    }

    handleSearchContentCollapse = () => {
        this.setState({ searchContent: !this.state.searchContent })
    }

    handleRefreshSpin = () => {
        this.setState({ isRefresh: true })
    }

    handleRefreshSpinOff = () => {
        this.setState({ isRefresh: false })
    }
    
    handleHeadFilter = (panelInfo) => {
        const { shopable, search, searchContent, pagination, filters } = this.state
        const { masters, config, locales, form } = this.props
        const { getFieldDecorator } = form
        const { RangePicker } = DatePicker

        const field_colon_label = false
        const lang_field_default = config.lang[locales.region_type].grid.default
        const lang_field_filters = config.lang[locales.region_type].grid.market.filters

        const switch_shopable = (
            <article>
                Shop Range
                <Switch size="small" style={{ margin: '0px 0px 3px 2px' }} checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} checked={shopable} onChange={this.handleShopUseable} />
            </article>
        )

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

                    <div className={`${cls['panel_container']} ${(search) ? cls['open']:''}`}>
                   
                        <div 
                            className={`${cls['panel_tools']}`} 
                            onMouseOver={this.handleRefreshSpin} 
                            onMouseOut={this.handleRefreshSpinOff}
                            onClick={this.handleSearchSubmit}
                        >
                            <i className={`fa fa-refresh ${(this.state.isRefresh) && 'fa-spin'}`} aria-hidden="true" ></i>
                        </div> 

                        <div className={`${cls['panel_header']} ${(searchContent) ? cls['reverse']:''} ${(searchContent) ? cls['open']:''}`} onMouseOver={(!search) ? this.handleSearchCollapse:() => {return false}} onMouseOut={(!searchContent) ? this.handleSearchCollapse:() => {return false}} onClick={this.handleSearchContentCollapse}>
                            <span>
                                <Icon type="search" className={`${cls['panel_iheader']} mr1`} />
                                {panelInfo.panel_title}
                            </span>
                        </div>
                        <div className={`${cls['panel_content']} ${(searchContent) ? cls['open']:''}`}>

                            <Form className={`${cls['form_container']} ${(searchContent) ? cls['open']:''}`} onSubmit={this.handleSearchSubmit}>
                                <Row gutter={gutter_init} style={{ borderBottom: '1px solid rgba(209, 209, 209, .3)' }}>
                                    <Col span={11}>
                                        <FormItem label="Assignment Market Layout" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Assignment', { initialValue: 'A' })(
                                                    <RadioGroup>
                                                        <Radio value="N" className={`${cls['ph1']} ${cls['mh0']}`}>Not Success</Radio>
                                                        <Radio value="Y" className={`${cls['ph1']} ${cls['mh0']}`}>Success(%)</Radio>
                                                        <Radio value="A" className={`${cls['ph1']} ${cls['mh0']}`}>All</Radio>
                                                    </RadioGroup>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={7}>
                                        <FormItem label={switch_shopable} className={`${cls['form_item']} ${cls['ma0']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('ShopRange', { initialValue: (!shopable) ? [] : [0, 1000] })
                                                (
                                                    <Slider
                                                        min={0}
                                                        max={1000}
                                                        marks={{ 0: '0', 250: '250', 500: '500', 750: '750', 1000: '1000+' }}
                                                        range
                                                        disabled={!shopable}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="BRANCH TYPE" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('BranchType', { initialValue: ['L', 'P', 'K'] })(
                                                    <CheckboxGroup className="pl3">
                                                        <Checkbox value="L">L</Checkbox>
                                                        <Checkbox value="P">P</Checkbox>
                                                        <Checkbox value="K">K</Checkbox>
                                                    </CheckboxGroup>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={gutter_init}>
                                    <Col span={6}>
                                        <FormItem label="Region" className={`${cls['form_item']} ${cls['ctrlTree']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Region', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getRegionSelectItem()}
                                                        searchPlaceholder={lang_field_filters.region_field.placeholder_label}
                                                        treeDefaultExpandAll={true}
                                                        size="default"
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Area / Zone" className={`${cls['form_item']} ${cls['ctrlTree']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Area', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getAreaSelectItem()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        searchPlaceholder={lang_field_filters.area_field.placeholder_label}
                                                        size="default"
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Branch" className={`${cls['form_item']} ${cls['ctrlTree']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Branch', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getBranchSelectItem()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        searchPlaceholder={lang_field_filters.branch_field.placeholder_label}
                                                        treeNodeFilterProp="label"
                                                        size="default"
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Employee" className={`${cls['form_item']} ${cls['ctrlTree']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Employee', { initialValue: [] })(
                                                    <TreeSelect
                                                        {...tree_config}
                                                        treeData={this.getCANameSelect()}
                                                        treeDefaultExpandedKeys={[`all`]}
                                                        searchPlaceholder={lang_field_filters.calist_field.placeholder_label}
                                                        dropdownMatchSelectWidth={true}
                                                        dropdownStyle={{ height: '400px' }}
                                                        treeNodeFilterProp="label"
                                                        size="default"
                                                        disabled={true}
                                                    />
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={gutter_init}>
                                    <Col span={12}>
                                        <FormItem label="Register Date" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('RegisterRange', { initialValue: [] })
                                                    (
                                                    <RangePicker
                                                        format="DD/MM/YYYY"
                                                        onChange={this.handleDateChange}
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
                                        <FormItem label="Market Name" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('MarketName', { initialValue: null })
                                                    (<Input placeholder={lang_field_filters.customer_field.placeholder_label} className={`ttu`} />)
                                            }
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <FormItem label="Optional" className={`${cls['form_item']} ttu fw5`} colon={field_colon_label}>
                                            {
                                                getFieldDecorator('Optional', { initialValue: [] })(
                                                    <Select mode="multiple" disabled={true} placeholder={lang_field_filters.optional_field.placeholder_label}>
                                                        <Option value=""></Option>
                                                    </Select>
                                                )
                                            }
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row gutter={gutter_init}>
                                    <Col span={12}>
                                        <div className={`${cls['location_navigation']} ttu fl`} onClick={this.openNotificationLocationUnavaliable}>
                                            <Icon type="environment" />
                                            <div className={cls['location_text']}>{lang_field_filters.location.label}</div>
                                        </div>
                                    </Col>
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

    // SET FILTER HANDLER
    getRegionSelectItem = () => {
        const { masters, config, locales, form: { getFieldValue } } = this.props
        const lang_field_default = config.lang[locales.region_type].grid.default

        if (!_.isEmpty(masters.region) && masters.region.length > 0) {

            let area_filter = getFieldValue("Area")
            let branch_filter = getFieldValue('Branch')
            let calist_filter = getFieldValue('Employee')

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
                    value: item.Zone.map(zone => zone.ZoneValue).join(','),
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
                        // !_.isEmpty(_.find(area_select, (f) => ((v.ZoneValue).indexOf(f) >= 0))) &&
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
}

class ChartPopper extends Component {

    state = {
        chart: {
            portfolioData: [],
            saleSummaryData: []
        },
        activeIndex: 0,
        defaultTitle: {
            'bucketshare': { title: 'Bucket Share' }
        }
    }

    handleChartPopperClose = () => {
        const { handleClose } = this.props
        this.setState({ chart: { portfolioData: [], saleSummaryData: [] } })
        handleClose()
    }

    componentWillReceiveProps(props) {
        if (props) {
            if(props.sourceData) {
                let param_request = { AuthID: '57251', MktCode: props.sourceData }
                if(param_request) {
                    this.loadSaleSummaryChart(param_request)
                    this.loadPortfolioChart(param_request)                    
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.chart !== nextState.chart ||
               this.state.activeIndex !== nextState.activeIndex ||
               this.props.visible !== nextProps.visible ||
               this.props.options !== nextProps.options ||
               this.props.viewmode !== nextProps.viewmode ||
               this.props.sourceData !== nextProps.sourceData ||
               this.props.marketinfo !== nextProps.marketinfo ||               
               this.props.config !== nextProps.config ||
               this.props.locales !== nextProps.locales
    }

    render() {
        const { defaultTitle, chart } = this.state
        const { sourceData, marketinfo, visible, viewmode, options, config, locales } = this.props

        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)
        const el_target = (options) ? document.getElementById(options.id) : null
        const el_offset = (options) ? getCoords(document.getElementById(options.id)) : null

        let retop_offset = 0
        let checkOverHScreen = (el_offset) ? (el_offset.top + 300) : 0
        if (checkOverHScreen > maxHeightScreen) {
            let check_sclt = (el_offset.scrollTop > 0) ? (maxHeightScreen + el_offset.scrollTop) + 10 : maxHeightScreen
            retop_offset = (checkOverHScreen - check_sclt)
        }

        let style_config = (el_offset) ? { top: `${(el_offset.top + 17) - retop_offset}px`, left: `${(el_offset.left - 300)}px` } : {}

        let mktname = (marketinfo[0]) ? marketinfo[0].MarketName : null
        let brntype = (marketinfo[0]) ? marketinfo[0].BranchType : null
  
        let load_config = {
            size: 150,
            title: config.lang[locales.region_type].grid.market.chartpoper.title,
            desc: config.lang[locales.region_type].grid.market.chartpoper.desc,
            center: true
        }

        let progress_enable = true
        if( chart.portfolioData.length > 0 && chart.saleSummaryData.length > 0 ){
            progress_enable = false
        }

        return (
            <div className={`${cls['ctrlChartPopper']} ${(visible) ? cls['open'] : ''} ${(progress_enable) ? cls['standby'] : ''}`} style={style_config}>
                <div className={`${cls['ctrlHeader']}`}>
                    <div className={`${cls['ctrlitemHeader']} ttu`}>{`${mktname} ${(brntype) ? '(' + brntype + ')' : ''}`}</div>
                    <div className={`${cls['ctrlitemHeader']} tr`} onClick={this.handleChartPopperClose}><i className={`fa fa-close`} /></div>
                </div>
                <div className={`${cls['ctrlContent']}`}>
                    <Loader visible={progress_enable} {...load_config} style={{ margin: '10% auto 0 auto'}} />
                    <div className={cls['ctrlContentSeat']}>
                       
                        <div className={`${cls['ctrlContentItem']} ${(progress_enable) && cls['hide']}`}>
                            {
                                (chart.saleSummaryData && chart.saleSummaryData.length > 0) && (
                                    <SaleSummaryChart item={{ MarketCode: sourceData, MarketName: mktname, BranchType: brntype, SALE_SUMMARY_CHART: chart.saleSummaryData }} />
                                )
                            }
                        </div>
   
                        <div className={`${cls['ctrlContentItem']} ${(progress_enable) && cls['hide']}`}>
                            {
                                (chart.portfolioData && chart.portfolioData.length > 0) && (
                                    <PortfolioChart item={{ MarketCode: sourceData, MarketName: mktname, BranchType: brntype, PORTFOLIO_QUALITY_CHART: chart.portfolioData }} />
                                )
                            }   
                        </div> 
                           
                    </div>
                </div>
            </div>
        )
    }

    loadPortfolioChart = (param) => {
        getPortfolioSummaryAPI(param).then((resp) => {            
            let data = (parseBool(resp.status)) ? resp.data : []
            this.setState({ chart: _.assignIn({}, this.state.chart, { portfolioData: [data] }) }) 
        })
    }

    loadSaleSummaryChart = (param) => {
        getSaleSummaryAPI(param).then((resp) => {            
            let data = (parseBool(resp.status)) ? resp.data : []
            this.setState({ chart: _.assignIn({}, this.state.chart, { saleSummaryData: [[], data] }) })      
        })
    }

}

export default Form.create()(GridMarket)