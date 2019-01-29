import React, { Component } from 'react'
import { createElement, in_array, parseBool, numValid, roundFixed, parseNumberShort } from '../../../containers/Layouts/function'
import { Modal, Button, Icon, Row, Col, Tooltip } from 'antd'
import SplitPane from 'react-split-pane'
import _ from 'lodash'

import cls from '../styles/scss/preview_layout_digit.scss'
import options from '../../../utilities/_general.scss'

const default_size = 15
const orginal_size = 38
const maxHeightScreen = (window.screen.availHeight - (window.outerHeight - window.innerHeight)) - 35
const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))

class PreviewResponsive extends Component {

    constructor(props) {
        super(props)

        this.state = {
            main_review: false,
            prospect_review: false,
            prospect_data: null,
            app_review: null,
            refno: null,
            gridpane: {
                width: 0,
                height: 20
            },
            offset: {
                top: 0,
                left: 0
            },
            doubletChart: this.getDoubletAlphabet()
        }

    }
    
    createZoneElement = (el) => {
        const { preview_layouts } = this.props
        const scramble_list = _.filter(preview_layouts.boxsname_activation, { BoxInsideParent: el.LayoutID })

        return (
            <div id={`${el.LayoutID}_digital`} key={`${el.LayoutName}_digital`} className={`${cls['zone_layout']}`} data-attr={el.LayoutName}>
                { _.map([el], this.createTable) }
                { (scramble_list && scramble_list.length > 0) && _.map(scramble_list, this.createScramble) }
            </div>
        )
    }

    createTable = (objData) => {
        const { configData } = this.props
        const layout_name = `${objData.LayoutID}_digital`

        let class_style = '',
            class_fix = '',
            fix_right = '',
            event_type = '',
            resize = 0,
            isHide = false

        if (parseBool(objData.RTL)) {
            fix_right = `${cls['table_layout_flaxright']}`
            class_style = `${cls['table_direct_rtl']}`
        }

        if (parseBool(objData.RTP)) {
            class_fix = `${cls['table_layout_flaxdown']}`
        }

        const cols = (objData.TblCols > 2) ? objData.TblCols : 2
        const rows = (objData.TblRows > 2) ? objData.TblRows : 2

        if(objData.TblCols == 2 && objData.TblRows == 2) {
            isHide = true
        }
        
        let table_style = {
            maxWidth: roundFixed((cols * default_size), 0),
            maxHeight: roundFixed((rows * default_size), 0)
        }

        if(layout_name == `${configData.main}_digital`) {
            table_style.border = '2px solid #6495ed'
        }

        return (
            <table key={`table_${layout_name}`} id={`table_${layout_name}`} className={`${cls['cell-container']} ${class_style} ${fix_right} ${(isHide) && cls['hide']}`} style={{...table_style }} draggable={false}>
                <tbody key={`table_${layout_name}_body`} id={`table_${layout_name}_body`}>
                    { (parseBool(objData.HasTable)) && _.map([objData], this.createColumn) }
                </tbody>
            </table>
        )

    }

    createColumn = (objData) => {
        const check_rows = (objData.TblRows > 2) ? objData.TblRows : 2
        const rows = this.generateArr(check_rows)
       
        if (parseBool(objData.RTP)) {
            let data_rows = []
            _.forEachRight(rows, (r) => {
                data_rows.push(`${r}`)
            })

            if(data_rows && data_rows.length > 0) {
                return _.map(data_rows, (el_id) => {
                    return (
                        <tr id={`rows_${el_id}`} key={`rows_${(el_id +1)}`}>
                             { (parseBool(objData.HasTable)) && this.createCell(objData, el_id) }
                        </tr>
                    )
                })
            }

        } else {
            if (typeof rows[0] !== undefined) {
                return _.map(rows, (r, rIndex) => {
                    return (
                        <tr id={`rows_${r}`} key={`rows_${r + rIndex}`}>
                             { (parseBool(objData.HasTable)) && this.createCell(objData, r) }
                        </tr>
                    )
                })
            }

        }
    }

    createCell = (objData, seq) => {
        const { preview_layouts, mktCustomer } = this.props

        const cellname_activation = (preview_layouts.cellname_activation && preview_layouts.cellname_activation.length > 0) ? preview_layouts.cellname_activation:null
        const extended_activation = (preview_layouts.extended_activation && preview_layouts.extended_activation.length > 0) ? preview_layouts.extended_activation:null
        const potential_activation = (preview_layouts.customer_potential && preview_layouts.customer_potential.length > 0) ? preview_layouts.customer_potential:null
        const cust_list = (!_.isEmpty(mktCustomer) && mktCustomer.length > 0) ? mktCustomer : []
       
        const check_cols = (objData.TblCols > 2) ? objData.TblCols : 2
        const cols = this.generateArr(check_cols)

        return _.map(cols, (c, cIndex) => {
            let el_runs = (!parseBool(objData.RTL)) ? c : (c - 1)
            let el_char = (!parseBool(objData.RTL)) ? this.getCharByNumber(c) : this.state.doubletChart[c - 1]
            let el_nums = (!parseBool(objData.RTP)) ? seq : `0${seq}`
            let el_digs = `${el_char}${el_nums}`

            let cls_opt = ''
            let el_cust = _.filter(cellname_activation, { LayoutID: objData.LayoutID, ColumnCell: el_digs })[0]
            let el_extend = _.filter(extended_activation, { LayoutID: objData.LayoutID, ColumnCell: el_digs })[0]
            let el_potential = _.filter(potential_activation, { LayoutID: objData.LayoutID, ColumnCell: el_digs })[0]
            
            if(el_cust) {               
                let el_result = _.filter(cust_list, { ApplicationNo: el_cust.ApplicationNo })[0]
                cls_opt = this.onChangeStateCell(el_result)
            }

            if(el_extend) {               
                let el_result = _.filter(cust_list, { ApplicationNo: el_extend.ApplicationNo })[0]
                cls_opt = this.onChangeStateCell(el_result)
            }

            if(el_potential) {               
                cls_opt = this.handleSetPotentialOnCell(el_potential)
            }

            let main_appno = (el_cust) ? el_cust.ApplicationNo:undefined
            let ext_appno = (el_extend) ? el_extend.ApplicationNo:''
            let propspect = (el_potential) ? el_potential.CustomerName:''
            let myAttrs = {                 
                'data-attr': (main_appno) ? main_appno : ext_appno, 
                'data-ref': `${el_char}${el_nums}`,
                'data-prospect': propspect,
                className: `${cls['cell-box']} ${cls_opt}`
            }

            return (
                <td key={`${objData.LayoutName}_${el_char}${seq}`} id={`${el_digs}`} {...myAttrs} onMouseOver={(el_cust || el_extend) ? this.customerPreview : this.prospectPreview}></td>
            )

        })
    }

    customerPreview = (e) => {
        let isMouseOver = true
        let elements = $(e.target)

        _.delay(() => {
            if(isMouseOver) {
                this.setState({ 
                    main_review: true,
                    refno: elements.attr('data-ref'),
                    app_review: elements.attr('data-attr'),
                    offset: _.assignIn({}, this.state.offset, elements.offset()) 
                })    
                isMouseOver = false
            }
        }, 1000)
        
        $(e.target).mouseout(() => {
            isMouseOver = false
            this.customerPreviewClose()
        })
        .unbind(this)
    }

   prospectPreview = (e) => {
        let isMouseOver = true
        let elements = $(e.target)

        if(elements.attr('data-prospect') && elements.attr('data-prospect') !== '') {
            _.delay(() => {
                if(isMouseOver) {
                    this.setState({ 
                        prospect_review: true,
                        prospect_data: (elements.attr('data-prospect')) ? elements.attr('data-prospect') : '',
                        offset: _.assignIn({}, this.state.offset, elements.offset()) 
                    })    
                    isMouseOver = false
                }
            }, 1000)
            
            $(e.target).mouseout(() => {
                isMouseOver = false
                this.prospectPreviewClose()
            })
            .unbind(this)
        }

    }

    customerPreviewClose = () => {
        this.setState({ main_review: false, refno: null, app_review: null })
    }

    prospectPreviewClose = () => {
        this.setState({ prospect_review: false, prospect_data: null })
    }

    createScramble = (el, index) => {
        const { configData } = this.props
        const css_style = el.BoxStyle.split(';')
        const element = createElement('div', { 'id': `${el.BoxID}_digit`, className: `${cls['cell_scramble']}`, 'style': el.BoxStyle }, (el.BoxText) ? el.BoxText:'')

        const el_txt = (el.BoxText) ? el.BoxText:''
        const el_top = $(element).css('top')
        const el_left = $(element).css('left')
        const el_width = $(element).css('width')
        const el_height = $(element).css('height')

        let top = (el_top && el_top !== '') ? parseInt(numValid(el_top.replace('px', ''))) : 0
        let left = (el_left && el_left !== '') ? parseInt(numValid(el_left.replace('px', ''))) : 0
        let width = (el_width && el_width !== '') ? parseInt(numValid(el_width.replace('px', ''))) : 0
        let height = (el_height && el_height !== '') ? parseInt(numValid(el_height.replace('px', ''))) : 0

        let temp_top = (top > 1) ? roundFixed((top / orginal_size), 2) : 0
        let new_top = default_size * temp_top

        let temp_left = (left >= 1) ? roundFixed((left / orginal_size), 2) : 1
        let new_left = default_size * temp_left

        let temp_width = (width > 38) ? roundFixed((width / orginal_size), 2) : 1
        let new_width = default_size * temp_width

        let temp_height = (height >= 38) ? roundFixed((height / orginal_size), 2) : 1
        let new_height = default_size * temp_height
        
        let opt_size = (el.BoxInsideParent == configData.main) ? 2:0

        let scramble_style = {
            position: 'absolute',
            top: `${roundFixed(new_top, 0) + opt_size}px`,
            left: `${roundFixed(new_left, 0) + opt_size}px`, 
            height: `${roundFixed(new_height, 0) - opt_size}px`,
            width: `${roundFixed(new_width, 0) - opt_size}px`
        }

        return (<div key={(index + 1)} id={`${el.BoxID}_digit`} className={`${cls['cell_scramble']}`} style={{...scramble_style}} title={el_txt}>&nbsp;</div>)   

    }

    showProfile = (e) => {
        const { handleProfileModal } = this.props
        const cell = e.target
        handleProfileModal([cell])
    }

    setTitleHeader = () => {
        const { handleSummaryCollapse, handlePreviewLayoutBigScale } = this.props

        return (
            <div className={`${cls['title_header']}`}>
                <span className="pa1">ดูข้อมูลเลย์เอาท์แผงตลาด (โหมดจำลองเลย์เอาท์ขนาดย่อ)</span>
                <span className="fr" onClick={handleSummaryCollapse}>
                    <Tooltip placement="bottom" title={'สรุปข้อมูลเลย์เอาท์'}>
                        <i className={`ti-pie-chart fa-2x ${cls['icon']}`} />
                    </Tooltip>
                </span>
                <span className="fr mr3">
                    <Tooltip placement="bottom" title={'เปลี่ยนโหมดการดูเลย์เอาท์ (โหมดจำลองเลย์เอาท์เสมือนจริง)'}>
                        <i className={`ti-layers-alt fa-2x ${cls['icon']}`} onClick={handlePreviewLayoutBigScale} />
                    </Tooltip>
                </span>
                <span className="fr mr3">
                    <Tooltip placement="bottom" title={'ค้นหาข้อมูลเลย์เอาท์'}>
                        <i className={`ti-search fa-2x ${cls['icon']} ${cls['blind']}`} />
                    </Tooltip>
                </span>
                <span className="fr mr3">
                    <Tooltip placement="bottom" title={'ปริ๊นตารางเลย์เอาท์'}>
                        <i className={`ti-printer fa-2x ${cls['icon']} ${cls['blind']}`} />
                    </Tooltip>
                </span>
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {
        const { preview_layouts } = nextProps
        if(preview_layouts && preview_layouts.sidename_activation) {
            const objData = preview_layouts.sidename_activation

            let width = [],
                height = []

            _.forEach(objData, (v, i) => {
                if(in_array(v.LayoutID, ['outside_topleft_zone', 'outside_topcenter_zone'])) {
                    const check_rows = (v.TblRows > 2) ? v.TblRows : 2
                    height.push(roundFixed((check_rows * default_size), 0))
                }

                if(in_array(v.LayoutID, ['outside_topleft_zone', 'outside_left_zone'])) {
                    const check_cols = (v.TblCols > 2) ? v.TblCols : 2
                    width.push(roundFixed((check_cols * default_size), 0))
                }

            })

            if(width.length > 0 || height.length > 0) {
                let min_width = (_.max(width) > 30) ? _.max(width) : 1
                this.setState({ gridpane: _.assignIn({}, this.state.gridpane, { width: min_width, height: (_.max(height) + 10) }) })
            }
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible || 
               this.props.sideSummary !== nextProps.sideSummary ||
               this.props.mktCustomer !== nextProps.mktCustomer ||
               this.state.gridpane !== nextState.gridpane ||
               this.state.offset !== nextState.offset ||
               this.state.main_review !== nextState.main_review ||
               this.state.app_review !== nextState.app_review ||
               this.state.refno !== nextState.refno ||
               this.state.prospect_review !== nextState.prospect_review ||
               this.state.prospect_data !== nextState.prospect_data
    }

    render() {
        const { visible, sideSummary, mktCustomer, preview_layouts, handlePreviewLayoutClose, localStorageRead } = this.props
        let { gridpane, main_review, app_review, refno, prospect_review, prospect_data, offset } = this.state

        let modal_config = { 
            top: 0, 
            paddingBottom: 0, 
            minWidth: maxWidthScreen, 
            minHeight: maxHeightScreen
        }

        if(!sideSummary) {
            let new_width = maxWidthScreen - 200
            modal_config['minWidth'] = new_width
            modal_config['left'] = 0
            modal_config['margin'] = 0
        }

        return (
            <article onClick={() => { return false}}>
                <Modal title={this.setTitleHeader()} visible={visible} mask={false} maskClosable={false} onOk={handlePreviewLayoutClose} onCancel={handlePreviewLayoutClose} closable={true} footer={false} style={{...modal_config}} bodyStyle={{ minHeight: modal_config.minHeight }} wrapClassName={cls['gridWrapper']}>                   
                    { (visible) && 
                        (
                            <SplitPane split="vertical" defaultSize={(gridpane.width + 2)} maxSize={(maxWidthScreen - 100)} primary="first">
                                <SplitPane split="horizontal" onChange={this.onPaneChangeHorizonSize} defaultSize={gridpane.height} primary="first">
                                    { (visible) && _.map([preview_layouts.sidename_activation[0], preview_layouts.sidename_activation[2]], this.createZoneElement) }
                                </SplitPane>  
                                <SplitPane split="horizontal" onChange={this.onPaneChangeHorizonSize} defaultSize={gridpane.height} primary="first">
                                    { (visible) && _.map([preview_layouts.sidename_activation[1], preview_layouts.sidename_activation[3]], this.createZoneElement) }
                                </SplitPane> 
                            </SplitPane>
                        ) 
                    }
                </Modal>
                <ProfileTooltip visible={main_review} appno={app_review} mktCustomers={mktCustomer} refno={refno} offset={offset} handleClose={this.customerPreviewClose} />
                <ProspectProfileTooltip visible={prospect_review} previewLayouts={preview_layouts} prospectData={prospect_data} mktCustomers={mktCustomer} offset={offset} handleClose={this.prospectPreviewClose} localStorageRead={localStorageRead} />
            </article>
        )
    }

    onPaneChangeHorizonSize = (size) => {
        let element_target = document.querySelectorAll('.Pane.horizontal.Pane1')
        _.map(element_target, (el) => { el.style.height = `${size}px` })
    }

    onChangeStateCell = (result) => {
        const { configData } = this.props
        const { bktFullNotRisks } = configData

        if(result) {
            const principle = (result.Principle) ? result.Principle:null
            const status = (result.Status) ? result.Status:null
            let acc_close = (principle && principle > 0) ? 'N':'Y'
            
            if(status == 'Approved' && acc_close == 'Y') { 
                return `${cls['cell_active']} ${cls['cell_closeacc']}`

            } else {
                if (in_array(result.StatusDigit, ['A'])) {
                    if (!in_array(result.Cust_DPDBucketNow, bktFullNotRisks)) 
                        return `${cls['cell_active']} ${cls['cell_overdue']}`
                    else 
                        return cls['cell_active']
    
                } else if (in_array(result.StatusDigit, ['C', 'R'])) {
                    return `${cls['cell_active']} ${cls['cell_reject']}`
    
                } else { 
                    if (!in_array(result.Cust_DPDBucketNow, bktFullNotRisks) && result.Cust_DPDBucketNow) 
                        return `${cls['cell_active']} ${cls['cell_overdue']}`
                    else 
                        return `${cls['cell_active']} ${cls['cell_onhand']}` 
                }
            }
  
        } else { 
            return `${cls['cell_active']} ${cls['cell_onhand']}` 
        }
    }

    handleSetPotentialOnCell = (data) => {
        return `${cls['cell_prospect']}`
    }

    // GENERATION CHARECTER
    generateArr = (len) => {
        let index = 1,
            array = []

        for (let i = 0; i < len; i++) {
            array.push(index)
            index++
        }
        return array
    }

    generateChar = (codePt) => {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        }
        return String.fromCharCode(codePt);
    }

    convChartToNum = (alpha) => {
        var index = 0
        for (var i = 0, j = 1; i < j; i++ , j++) {
            if (alpha == this.getCharByNumber(i)) {
                index = i;
                j = i;
            }
        }
        return index
    }

    getCharByNumber = (number) => {
        let numeric = (number - 1) % 26
        let letter = this.generateChar(65 + numeric)
        let number2 = parseInt((number - 1) / 26)

        if (number2 && number2 > 0)
            return this.getCharByNumber(number2) + letter
        else
            return letter
    }

    getNextAlphabet = (start, length, run = true, cols = false) => {
        const add = (run) ? 1 : 0
        let index = start + add,
            nexts = 0,
            array = []

        for (let i = start; i < (start + length + nexts); i++) {
            ++index

            let alphabet = this.getCharByNumber(index)
            let forbidden = in_array(alphabet, this.state.doubletChart)
            if (forbidden) {
                nexts++
                continue;
            } else {
                array.push(index)
            }
        }

        return array
    }

    getDoubletAlphabet = () => {
        let len = 6,
            arr = [],
            counts = 2,
            pointer = 1

        _.map(this.generateArr(len), () => {
            for (let i = 0; i < 26; i++) {
                arr.push(_.padStart(this.getCharByNumber(pointer), counts, this.getCharByNumber(pointer)))
                pointer++
                if (pointer > 26) {
                    pointer = 1
                    counts++
                }
            }
        })
        return arr
    }

}

class ProfileTooltip extends Component {

    shouldComponentUpdate(nextProps) {
        return this.props.visible !== nextProps.visible ||
               this.props.mktCustomers !== nextProps.mktCustomers ||
               this.props.offset !== nextProps.offset ||
               this.props.appno !== nextProps.appno ||
               this.props.refno !== nextProps.refno
    }

    render() {
        const { visible, mktCustomers, offset, appno, refno, handleClose } = this.props
        const customer_list = (!_.isEmpty(mktCustomers) && mktCustomers.length > 0) ? mktCustomers : []
        const customer_select = _.filter(customer_list, { ApplicationNo: appno })[0]

        let style_config = {
            top: `${offset.top}px`,
            left: `${(offset.left + 15)}px`
        }
        
        const application_no = (customer_select && customer_select.ApplicationNo) ? customer_select.ApplicationNo : 'ไม่ระบุข้อมูล'
        const custname = (customer_select && customer_select.AccountName) ? customer_select.AccountName : 'ไม่ระบุข้อมูล'
        const products = (customer_select && customer_select.BusinessTypeApp) ? customer_select.BusinessTypeApp : 'ไม่ระบุข้อมูล'
        const totalbal = (customer_select && customer_select.Principle) ? customer_select.Principle : 'ไม่ระบุข้อมูล'
        const cause_notice = (customer_select && customer_select.Cause) ? customer_select.Cause : null
        const callreport = (customer_select && customer_select.Cause_Detail) ? customer_select.Cause_Detail : 'ไม่ระบุข้อมูล'
        const buckets = (customer_select && customer_select.Cust_DPDBucketNow) ? customer_select.Cust_DPDBucketNow : 'ไม่ระบุข้อมูล'

        const status = (customer_select && customer_select.Status) ? customer_select.Status : null
        const statusDigit = (customer_select && customer_select.StatusDigit) ? customer_select.StatusDigit : null
        const principle = (customer_select && customer_select.Principle) ? customer_select.Principle:null
        const acc_close = (principle && principle > 0) ? 'N':'Y'
        const check_status = (status == 'Approved' && acc_close == 'Y') ? 'Y':'N'

        const subject = (customer_select && customer_select.Subject) ? customer_select.Subject : null
        const reason = (customer_select && customer_select.Reason) ? customer_select.Reason : null
        const remark = (customer_select && customer_select.Remark) ? customer_select.Remark:null

        return (
            <div className={`${cls['profile_layout']} ${(!visible) && 'dn'}`} style={{...style_config}}>
                <Row type="flex" gutter={10}>
                    <Col span={24}>
                        <div className={`${cls['profile_layout_header']}`}>
                            <Icon type="shop" />&nbsp;
                            {`Ref.  ${refno} / Lock No 001 ${(statusDigit) && `(${statusDigit})`}`} 
                            <span className={options['fg_red']} style={{ fontWeight: 'bold' }}>{`${(check_status == 'Y') ? ` (Close)`:''}`}</span>
                            <i className={`ti-close fr ${cls['icon']}`} onClick={handleClose} />
                        </div>
                    </Col>
                    <Col span={24}>
                        <Row type="flex" gutter={0} style={{ paddingTop: '2px' }}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Customer</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${custname}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Application No </Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${application_no}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Product</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${products}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Total O/S</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray blue`}>{parseNumberShort(numValid(totalbal))}</Col>
                        </Row>                       
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Bucket</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${buckets}`}</Col>
                        </Row> 
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>Call Report</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${(cause_notice) ? `${cause_notice}` : ''} `}</Col>
                            <Col span={24} className={`${cls['grid_control']} bb b--light-gray`}>
                                {`${(cause_notice) ? callreport : ''}`}
                            </Col>
                        </Row>
                        <Row type="flex" gutter={0} style={{ paddingTop: '2px' }}>
                            <Col span={24} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`} style={{ fontWeight: 'bold' }}>Latest Action Note</Col>
                        </Row>                        
                        <Row type="flex" gutter={0} className={`${(!subject) && options['hide']}`}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} ${(!subject) && options['hide']} bb b--light-gray`}>Subject / Reason</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} ${(!subject) && options['hide']} bb b--light-gray`}>{`${(subject) && subject} / ${(reason) && reason}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0} className={`${(!subject) && options['hide']}`}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} ${(!subject) && options['hide']} bb b--light-gray`}>Remark</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} ${cls['ellipsis']} ${(!subject) && options['hide']} bb b--light-gray`}>{`${(remark) && remark}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0} className={`${(subject) && options['hide']}`}>
                            <Col span={24} className={`${cls['grid_control']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>ไม่พบข้อมูล</Col>
                        </Row>
                    </Col>                    
                </Row>                
            </div>
        )
    }

}

class ProspectProfileTooltip extends Component {
    
    shouldComponentUpdate(nextProps) {
        return this.props.visible !== nextProps.visible ||
               this.props.mktCustomers !== nextProps.mktCustomers ||
               this.props.previewLayouts !== nextProps.previewLayouts ||
               this.props.prospectData !== nextProps.prospectData ||
               this.props.offset !== nextProps.offset 
                
    }

    render() {
        const { visible, previewLayouts, prospectData, offset, handleClose, localStorageRead } = this.props

        const masters_list = localStorageRead('nanolayout_master', 'master')
        const potential_activation = (previewLayouts.customer_potential && previewLayouts.customer_potential.length > 0) ? previewLayouts.customer_potential:null
        let potential = _.filter(potential_activation, { CustomerName: prospectData })[0]

        let style_config = {
            top: `${offset.top}px`,
            left: `${(offset.left + 15)}px`
        }

        const referno = (potential && potential.ColumnCell) ? potential.ColumnCell : null
        const custname = (potential && potential.CustomerName) ? potential.CustomerName : null
        const is_potential = (potential && potential.IsPotential) ? potential.IsPotential : null
        const aliasname = (potential && potential.AliasName) ? potential.AliasName : null
        const contactno = (potential && potential.ContactNo) ? potential.ContactNo : 'ไม่ระบุข้อมูล'
        const product = (potential && potential.ProductType) ? potential.ProductType : 'ไม่ระบุข้อมูล'
        const reason = (potential && potential.ReasonCode) ? potential.ReasonCode.split(',') : null
        const remark = (potential && potential.Remark) ? potential.Remark : 'ไม่ระบุข้อมูล'
        
        const cust_business = (product && masters_list) ? _.filter(masters_list.business_reason[0], { Code: parseInt(product) })[0] : undefined
        const cust_reason = (reason && reason.length > 0 && masters_list) ? _.map(reason, (v) => { 
            let criteria = _.filter(masters_list.criteria_reason[0], { ReasonCode: v })[0] 
            return criteria.ReasonLabel
        }) : undefined
        
        return (
            <div className={`${cls['profile_layout']} ${(!visible) && 'dn'}`} style={{...style_config}}>
                <Row type="flex">
                    <Col span={24}>
                        <div className={`${cls['profile_layout_header']}`} style={{ backgroundColor: '#a5673f' }}>
                            <i className="fa fa-street-view " />&nbsp;
                            ลูกค้าพบใหม่ในตลาด
                            <i className={`ti-close fr ${cls['icon']}`} onClick={handleClose} />
                        </div>
                    </Col>
                    <Col span={24}>
                        <Row type="flex" gutter={0} style={{ paddingTop: '2px' }}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>ชื่อ-นามสกุล</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${custname} ${(aliasname) && `(${aliasname})`}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>เบอร์ติดต่อ</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${contactno}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>ประเภทสินค้าที่ขาย</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${(cust_business && cust_business) && cust_business.Name}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>ศักยภาพลูกค้า</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} bb b--light-gray`}>{`${(is_potential == 'Y') ? 'ลูกค้ามีศักยภาพดี' : 'ลูกค้ามีศักยภาพไม่ชัดเจน'}`}</Col>
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={24} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>คุณลักษณะของลูกค้า</Col>
                            {
                                (cust_reason && cust_reason.length > 0) && _.map(cust_reason, (v, i) => {
                                    return (<Col key={(i + 1)} span={24} className={`${cls['grid_control']} ${cls['repad']} ${cls['ellipsis']} bb b--light-gray`}>{`${(i + 1)}. ${v}`}</Col>)
                                })
                            }
                        </Row>
                        <Row type="flex" gutter={0}>
                            <Col span={7} className={`${cls['grid_label']} ${options['fg_gray']} ${cls['repad']} bb b--light-gray`}>หมายเหตุ</Col>
                            <Col span={17} className={`${cls['grid_control']} ${cls['repad']} ${cls['ellipsis']} bb b--light-gray`}>{remark}</Col>
                        </Row>
                    </Col>                    
                </Row>                
            </div>
        )
    }

}

export default PreviewResponsive