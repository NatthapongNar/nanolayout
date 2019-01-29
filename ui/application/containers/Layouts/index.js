import React, { Component } from 'react'
import bluebird from 'bluebird'
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie'
import { withRouter } from 'react-router-dom'
import { Modal, notification, Icon } from 'antd'
import moment from 'moment'
import _ from 'lodash'

import { config } from './config'
import { createElement, in_array, roundFixed, parseNumberShort, numValid, parseBool } from './function'
import { ERROR_DEFINE } from '../../constants/errorType'

import { masterList } from '../../actions/grid_management'
import { 
    getEmpTesterInfo,
    getBranchMarketInfo, 
    getCustomerInfo,
    getMarketShareByCA,
    getMarketLockInfo,
    setMarketLockManagement

} from '../../actions/layouts'

import MarketLayoutComponent from '../../components/Layouts'
import cls from '../../components/Layouts/styles/scss/grid_layout.scss'
import gridcls from '../../components/Layouts/styles/scss/preview_layout.scss'
import style_opt from '../../utilities/_general.scss'

const confirm = Modal.confirm
const str_width = 6.5
const decrease_width = 5

const split_config = {
    mode: null,
    spanlen: 0,
    offset: { top: 0, left: 0 },
    elem: null
}

const sc_pattern = {
    left: 0, 
    top: 0, 
    scrollLeft: 0, 
    scrollTop: 4, 
    scrollWidth: 0,
    clientHeight: 0,
    clientWidth: 0
}

// const evOpenProfile = 'dblclick'

const EX = ERROR_DEFINE.LAYOUT

class MarketLayout extends Component {

    constructor(props) {
        super(props)

        const { cookies } = this.props
        this.localStorageClear()

        const cookieData = cookies.get('authen_info', { path: '/' })

        this.state = {
            mktcode: null,
            config: config,
            layouts: {},
            preview_layouts: {},
            preview_bigscale: {},
            camktshare: [],
            assignItem: [],
            cellExtension: null,
            cellExtensionType: null,
            assignCell: null,
            assignMode: null,
            decreaseCust: [],
            actionLogs: [],
            firstCreate: false,
            firstCreatePotential: true,
            isPadding: true,
            removeHandle: false,
            removeCount: 0,
            active_sideno: 3,
            cellStartHandler: null,
            startRowIndex: null,
            startCellIndex: null,
            rowsCount: null,
            colsCount: null,
            fixscope: false,
            navable: {
                collapse: true,
                mktdetail: false,
                summary: true
            },
            visible: {
                market_modal: false,
                assign_modal: false,
                mktassign_modal: false,
                potential_modal: false,
                preview_modal: false,
                preview_bigscale_modal: false,
                split_tool: false,
                table_tool: false,
                decrease_tool: false,
                cell_extension_tool: false                
            },
            sideable: {
                outside1: false,
                outside2: false,
                outside3: false,
                mainside: true
            },
            table_info: {
                adds: '',
                cols: 2,
                rows: 2,
                total: 4
            },
            elements: {
                draggable: false,
                resizable: false,
                context: false
            },
            scrollbar: sc_pattern,
            splitMode: split_config,
            mktPotential: [],
            mktCustomers: [],
            mktCustFilter: {},
            mktMasterFilter: [],
            pvZoneAvaliable: [],
            progress: true,
            progress_status: 0,
            progress_desc: 'กำลังตรวจสอบสิทธิในการใช้งานระบบ...',
            authen: (!cookieData) ? { Session: [] } : cookieData,
            doubletChart: this.getDoubletAlphabet()
        }
        
    }

    handleInitialCreation = (createData) => {      
        this.localStorageWrite('nanolayout_creation', 'info', createData) 
        this.setState({
            mktcode: createData.market_filter,
            progress: true,
            progress_desc: 'กำลังค้นหาข้อมูลเลย์เอาท์ตลาดจากระบบ...',
            visible: _.assignIn({}, this.state.visible, { mktassign_modal: false })
        })

        this.getGridLayout(createData.market_filter)
    }

    handleCollapse = () => {
        this.setState({ navable: _.assignIn({}, this.state.navable, { collapse: !this.state.navable.collapse, summary: true }) })
    }

    handleSummaryCollapse = () => {
        this.setState({ navable: _.assignIn({}, this.state.navable, { summary: !this.state.navable.summary, collapse: true }) })
    }

    handleZoneActive = (zone) => {
        let changeState = {}
        let activeSideno = 3

        this.setState({
            sideable: {
                outside1: false,
                outside2: false,
                outside3: false,
                mainside: false
            },
            visible: _.assignIn({}, this.state.visible, { cell_extension_tool: false })
        })

        _.delay(() => {
            const side_list = this.state.layouts.sidename_activation
            const side_select = _.filter(side_list, { LayoutName: zone })

            if (config.side[0] == zone) {
                changeState = { outside1: true }
                activeSideno = 0
            } else if (config.side[1] == zone) {
                changeState = { outside2: true }
                activeSideno = 1
            } else if (config.side[2] == zone) {
                changeState = { outside3: true }
                activeSideno = 2
            } else if (config.side[3] == zone) {
                changeState = { mainside: true }
                activeSideno = 3
            }

            if (side_select[0]) {
                this.talkCellResult(side_select[0])
            }

            this.setState({ 
                sideable: _.assignIn({}, this.state.sideable, changeState), active_sideno: activeSideno,
                visible: _.assignIn({}, this.state.visible, { cell_extension_tool: false })
            })

        }, 100)
    }

    handleCustPotential = (el_target, is_create = true) => {
        const { layouts } = this.state
        this.setState({
            assignCell: el_target,
            mktPotential: layouts.customer_potential,
            visible: _.assignIn({}, this.state.visible, { potential_modal: true, cell_extension_tool: false }),
            firstCreatePotential: is_create
        })
    }

    handleCustPotentialClose = () => {
        this.setState({ 
            visible: _.assignIn({}, this.state.visible, { potential_modal: false, cell_extension_tool: false }),
            mktPotential: []
        })
    }

    handleSetPotentialOnCell = (element_cell, data) => {
        const text_content = element_cell.attr('ref')
       
        const customer_name = (data && data.CustomerName != '') ? data.CustomerName : null
        const is_potential = (data && data.IsPotential == 'Y') ? 'YES' : 'NO'

        let potential_icon = (is_potential == 'Y') ? 'fa fa-check green' : 'fa fa-close red'

        element_cell
        .before(() => { element_cell.find(`div.${cls['cell']}`).empty() })
        .attr({ 
            'data-prospect': `${customer_name}`, 
            'data-prospect-status': is_potential
        })
        .addClass(`${cls['cell_prospect']}`)
        .after(() => {
            $( 
                _.map([0, 1], (v, i) => {
                    return ( (i == 0) ? createElement('div', { 'class': `${cls['cell_inside_header']}` }, is_potential) : createElement('div', { 'class': `${cls['cell_inside_bottom']}` }, text_content) )
                }) 
            )
            .appendTo(element_cell.find(`div.${cls['cell']}`))           
            .after(() => {
                element_cell.on('dblclick', (e) => { 
                    this.handleCustPotential(element_cell, false) 
                })
            })
        })

    }

    handleMktAssignModal = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { mktassign_modal: true, cell_extension_tool: false }) })
    }

    handleMktAssignCloseModal = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { mktassign_modal: false, cell_extension_tool: false }) })
    }

    handleAssignModal = (el_target, mode) => {
        const { layouts, mktCustomers } = this.state

        let merge_data = _.merge(layouts.cellname_activation, layouts.addition_activation)
        _.map(mktCustomers, (v) => {
            let filter = _.filter(merge_data, { ApplicationNo: v.ApplicationNo })
            if (filter[0] && filter[0].ApplicationNo) {
                return (
                    v.IsActive = 'N',
                    v.IsAssign = false,
                    v.Tools = (<Icon type="check" className="pointer green" />)
                )
            }
        })
        
        _.delay(() => {
            let result = _.filter(this.state.mktCustomers, function (data) { return data.IsActive == 'Y' })
            this.setState({
                visible: _.assignIn({}, this.state.visible, { assign_modal: true, cell_extension_tool: false }),
                navable: _.assignIn({}, this.state.navable, { summary: false, collapse: true }),
                assignItem: result,
                assignCell: el_target,
                assignMode: mode
            })

        }, 200)        

        _.delay(() => { $('.ant-modal-mask').css('right', '220px') }, 2000)

    }

    handleAssignModalClose = () => {
        this.setState({
            visible: _.assignIn({}, this.state.visible, { assign_modal: false, cell_extension_tool: false }),
            navable: _.assignIn({}, this.state.navable, { summary: true, collapse: true })
        })

        $('.ant-modal-mask').css('right', '0px')
    }

    handleAssignResetFilter = () => {
        this.setState({ assignItem: _.filter(this.state.mktCustomers, function (data) { return data.IsActive == 'Y' }) })
    }

    handleDecreaseAdditional = (objData) => {
        const { mktCustomers } = this.state
        
        let addition_arr  = []
        const addition_list = objData.elem.find(`.${cls['inside_divide']}`)
        if(addition_list && addition_list.length > 0) {
            _.forEach(addition_list, (v, i) => {
                let cust_info = _.filter(mktCustomers, { ApplicationNo: v.getAttribute('data-attr') })[0]
                if(cust_info) {
                    addition_arr.push({ label: cust_info.AccountName, value: cust_info.ApplicationNo, disabled: (i == 0) ? true:false })
                }                
            })
        }

        this.setState({
            visible: _.assignIn({}, this.state.visible, { decrease_tool: true, cell_extension_tool: false }),
            splitMode: objData,
            decreaseCust: addition_arr
        })
    }
 
    handleDecreaseAdditionalClose = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { decrease_tool: false, cell_extension_tool: false }) })
    }

    handleExtension = (elements, extensionType) => {
        let isMouseOver = true
        let estimate_time = (extensionType == 'single') ? 100 : 500

        _.delay(() => {
            if(isMouseOver) {
                this.setState({ 
                    visible: _.assignIn({}, this.state.visible, { cell_extension_tool: true }),
                    cellExtensionType: extensionType,
                    cellExtension: elements
                })
                isMouseOver = false
            }
        }, estimate_time)
                
        if(extensionType == 'single') {
            $(elements).mouseout(() => {
                isMouseOver = false
                this.handleExtensionClose()
            })
            .unbind(this)
        }
        
    }

    handleExtensionClose = (e) => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { cell_extension_tool: false }) })
    }

    handlTableSelection = (splitInfo) => {
        this.setState({
            visible: _.assignIn({}, this.state.visible, { table_tool: true, cell_extension_tool: false }),
            splitMode: splitInfo
        })
    }

    handleTableSelectionClose = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { table_tool: false, cell_extension_tool: false }) })
    }

    handlSplitCell = (splitInfo) => {
        this.setState({
            visible: _.assignIn({}, this.state.visible, { split_tool: true }),
            splitMode: splitInfo
        })
    }

    handleSplitCellClose = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { split_tool: false }) })
    }

    handleSplitCellCancel = () => {
        this.setState({
            visible: _.assignIn({}, this.state.visible, { split_tool: false }),
            splitMode: split_config
        })
    }

    handleConfirmSplit = (objData) => {
        const { splitMode } = this.state

        let str_text = ''
        if (splitMode.mode == 'table') {
            str_text = `จำนวนแถวคอลัมน์ x เรดคอร์ด ที่ต้องการจะเพิ่ม คือ ${objData.cols} x ${objData.rows}`
        } else {
            str_text = `จำนวนแถว ${(splitMode.mode == 'cols') ? 'คอลัมน์' : 'เรดคอร์ด'} ที่ต้องการจะเพิ่ม คือ ${objData.split_cell} แถว`
        }

        confirm({
            title: 'กรุณายืนยันการแบ่งแถวข้อมูล',
            content: (
                <article>
                    <p>โปรดตรวจสอบจำนวนแถวข้อมูลให้ถูกต้องก่อนยืนยันข้อมูล</p>
                    <p className={`${style_opt['bg_grayLighter']} pa1`}>{str_text}</p>
                    <p>กรณึข้อมูลถูกต้องโปรดกด OK</p>
                </article>
            ),
            onOk: () => {
                const objElement = splitMode.elem
                if (splitMode.mode == 'table') {
                    const _rows = objElement.attr('rowspan')
                    const _cols = objElement.attr('colspan')

                    if (objData.cols == _cols && objData.rows == _rows) {
                        this.restoreCell(objElement)
                    } else {
                        this.cellSplitGeneration(objElement, [objData.cols, objData.rows])
                    }

                } else {
                    if (splitMode.spanlen == objData.split_cell) {
                        this.restoreCell(objElement)
                    } else {
                        this.cellSplitGeneration(objElement, objData.split_cell)
                    }
                }

            },
            onCancel: () => { }
        })
    }

    handlePreviewLayout = () => {
        const { market_filter } = this.localStorageRead('nanolayout_creation', 'info')

        const request_set = new Request(`${config.hostapi}/layouts/mktc/${market_filter}/previews`, {
            method: 'GET',
            cache: 'no-cache',
            header: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset="UTF-8";'
            })
        })

        fetch(request_set)
            .then(response => response.json())
            .then(resp => {
                if (resp.status) {
                    let sidewidth = []
                    let sidename_list = resp.data.sidename_activation

                    let leftsize_zone = [
                        $(`#table_${config.A1}`).width(), 
                        $(`#table_${config.A01}`).width(), 
                        $(`#table_${config.AA01}`).width(), 
                        $(`#table_${config.AA1}`).width()
                    ]

                    // WIDTH CALCULATION OVER ONE SCREEN
                    const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))
                    let total_width_zone = _.max(leftsize_zone)
          
                    // SUM WIDTH AND COMPARE MAX SCREEN
                    if( total_width_zone <= maxWidthScreen) {
                        this.setState({ fixscope: true})
                        this.handlePreviewLayoutBigScale()
                    } else {
                        this.setState({
                            preview_layouts: resp.data,
                            visible: _.assignIn({}, this.state.visible, { preview_modal: true, cell_extension_tool: false })
                        })

                        notification.info({
                            message: 'แจ้งเตือนจากระบบ',
                            description: 'แนะนำการใช้งาน กรณีต้องปิดหน้าจำลองเลย์เอาท์สามารถทำได้ โดยการเลือนเมาส์ที่หน้าจอไปทางขวาบน จะพบไอคอน X กดปุ่มเพื่อปิดหน้า หรือสามารถกดปิดด้วยปุ่มลัดโดยกดปุ่ม ESC.',
                            duration: 10000
                        });
                    }
                } else {
                    notification.warning({
                        message: 'แจ้งเตือนจากระบบ',
                        description: 'โปรดบันทึกข้อมูลก่อนดูภาพรวมเลย์เอาท์ตลาด...',
                    })
                }
            })
            .catch(err => { console.log(`fetch error ${err}`) })
    }

    handlePreviewLayoutClose = () => {
        this.setState({
            preview_layouts: {},
            visible: _.assignIn({}, this.state.visible, { preview_modal: false, cell_extension_tool: false }),
            navable: _.assignIn({}, this.state.navable, { summary: true, collapse: true })
        })
    }

    handlePreviewLayoutBigScale = () => {
        let { pvZoneAvaliable, config } = this.state
        const { market_filter } = this.localStorageRead('nanolayout_creation', 'info')
        const request_set = new Request(`${config.hostapi}/layouts/mktc/${market_filter}/previews`, {
            method: 'GET',
            cache: 'no-cache',
            header: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset="UTF-8";'
            })
        })

        fetch(request_set)
        .then(response => response.json())
        .then(resp => {
            
            if (resp.status) {

                const data = resp.data
                this.setState({
                    preview_bigscale: data,
                    visible: _.assignIn({}, this.state.visible, { preview_modal: false, preview_bigscale_modal: true, cell_extension_tool: false })
                })

                const side_list = data.sidename_activation
                const scale_extends = data.extended_activation
                const addition_extends = data.addition_activation
                const box_list = data.boxsname_activation
                const customer_potential = data.customer_potential

                if (side_list && side_list.length > 0) {
                    _.forEach(side_list, (v, i) => {
                        if (parseBool(v.HasTable)) {                            
                            this.createTable(document.querySelector(`#${v.LayoutID}_previews`), `${v.LayoutID}_previews`, v)
                        }

                        if (scale_extends && scale_extends[0]) {
                            const cell_scale = _.filter(scale_extends, { LayoutID: v.LayoutID })
                            if (cell_scale && cell_scale.length > 0) {
                                _.forEach(cell_scale, (data, i) => {
                                    let cell_target = document.querySelector(`#${v.LayoutID}_previews`).querySelector(`td[ref="${data.ColumnCell}"]`)
                                    this.checkExtendedScaleCell(cell_target, data.ApplicationNo, data.PrimaryCell)
                                })

                            }
                        }

                        if (customer_potential && customer_potential.length > 0) {
                            _.forEach(customer_potential, (potential, index) => {
                                let cell_target = document.querySelector(`#${potential.LayoutID}_previews`).querySelector(`td[ref="${potential.ColumnCell}"]`)
                                this.handleSetPotentialOnCell($(cell_target), potential)
                            })
                        }

                        if (addition_extends && addition_extends[0]) {
                            const cell_addition = _.filter(addition_extends, { LayoutID: v.LayoutID })
                            if (cell_addition && cell_addition.length > 0) {
                                let cell_target = document.querySelector(`#${v.LayoutID}_previews`)
                                this.setAdditionBundle(cell_addition, cell_target)
                            }
                        }

                    })

                    const el_main_preview = document.getElementById(config.PA1)
                    if (el_main_preview) {

                        // GET PARENT MODAL
                        let parentTarget = $('#grid_previews')

                        // GRID HANDLE: SET CONDITION DISPLAY
                        let zaval = _.uniq(pvZoneAvaliable)
                        switch(zaval.length) {
                            case 2:
                                if(zaval[0] == `${config.PA01}` && zaval[1] == `${config.PA1}` || zaval[0] == `${config.PA1}` && zaval[0] == `${config.PA01}`) {
                                    parentTarget.removeClass(gridcls['grid']).addClass(gridcls['grid_vhalf'])
                                }
                            break;
                            case 3:
                            case 4:
                                $(`#${config.PA1}:not(.avaliable), #${config.PA01}:not(.avaliable), #${config.PAA01}:not(.avaliable), #${config.PAA1}:not(.avaliable)`)
                                .find('table').css('visibility', 'hidden')
                                .after((e, ui) => {
                                    $(`#${config.PA1}, #${config.PA01}, #${config.PAA01}, #${config.PAA1}`)
                                    .removeClass(gridcls['grid_vhalf']).addClass(gridcls['grid'])
                                    .removeAttr('style')  
                                })                                                 
                            break;
                        }

                        // FOR SET THEME GRID
                        // GET MAX HEIGHT VALUE ON TOP
                        let top_zone = [document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetHeight, document.querySelector(`#${config.PA01}`).querySelector(`table`).offsetHeight]
                        // GET MAX VALUE ON LEFT
                        let left_zone = [document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetWidth, document.querySelector(`#${config.PAA1}`).querySelector(`table`).offsetWidth]
                        
                        // GET MAX VALUE ON WDITH
                        let width_zone = [
                            document.querySelector(`#${config.PA1}`).querySelector(`table`).offsetWidth,
                            document.querySelector(`#${config.PA01}`).querySelector(`table`).offsetWidth,
                            document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetWidth, 
                            document.querySelector(`#${config.PAA1}`).querySelector(`table`).offsetWidth
                        ]

                        // FOR SET BODY MODAL
                        // GET MAX WDITH COUPLE FOR SET WIDTH SIZE MODAL ON TOP AND BOTTOM
                        let topsize_zone = [
                            document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetWidth, 
                            document.querySelector(`#${config.PA01}`).querySelector(`table`).offsetWidth
                        ]

                        let leftsize_zone = [
                            document.querySelector(`#${config.PA1}`).querySelector(`table`).offsetWidth, 
                            document.querySelector(`#${config.PAA1}`).querySelector(`table`).offsetWidth
                        ]

                        // GET MAX HEIGHT COUPLE FOR SET WIDTH SIZE MODAL ON TOP AND BOTTOM
                        let habove_zone = [document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetHeight, document.querySelector(`#${config.PA01}`).querySelector(`table`).offsetHeight]
                        let hbelow_zone = [document.querySelector(`#${config.PAA1}`).querySelector(`table`).offsetHeight, document.querySelector(`#${config.PA1}`).querySelector(`table`).offsetHeight]
                            
                        
                        // ELEMENT UPDATE TYLE BUNDLE TOP AND LEFT
                        if(_.max(top_zone)) {
                            if(zaval.length == 2) {
                                parentTarget.css({ 'grid-template-rows': `minmax(${_.max(top_zone)}px, max-content)`, 'grid-template-columns': `minmax(min-content, ${_.max(width_zone)}px)` })
                            }  else {
                                parentTarget.css({ 'grid-template-rows': `minmax(${_.max(top_zone)}px, max-content)` })
                            }                               
                        }

                        if(_.max(left_zone) > 0) {
                            if(zaval.length == 2) {
                                parentTarget.css('grid-template-columns', `minmax(${_.max(left_zone)}px, ${_.max(width_zone)}px) repeat(2, 1fr) 0%`)
                            }                               
                        }

                        // SUM MAX WIDTH OF ZONE
                        let total_width_zone = _.sum(leftsize_zone) + 92     
                        let total_height_zone = _.sum([_.max(habove_zone), _.max(hbelow_zone)]) + 50
                        
                        // SET ZONE SIDE FIXIBLE EQUAL TO CONTENT AND WRAPPER MODAL
                        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)
                        const style_total = `min-width: ${total_width_zone}px; min-height: ${total_height_zone}px; height: -webkit-fill-available;`

                        const modalBody = $(`.${gridcls['gridWrapper']}`).find('.ant-modal-body')
                        modalBody.removeAttr('style').attr('style', style_total)
                        $(`.${gridcls['gridWrapper']}`).find('.ant-modal').css('width', '100%').css('min-width', `${total_width_zone}px`)

                        // WRAPPER THE MAIN ZONE               
                        $(`#parent_${config.PA1}`).addClass(`${gridcls['zone_main']}`)
                        .after(() => {
                            let el =  $(`#parent_${config.PA1}`)
                            el.css({
                                'width': (numValid(el.width()) + 4),
                                'height': (numValid(el.height()) + 5)
                            })
                        })
    
                        // BINDING MOUSEDOWN FOR HANDLERING TO SCROLLBAR OF BROWSER
                        let deltaX = 0,
                            deltaY = 0

                        if ($(`.${gridcls['gridWrapper']}`).children().length) {
                            const content_modal = $(`.ant-modal-wrap.${gridcls['gridWrapper']}`)

                            if (content_modal.length >= 1) {

                                content_modal.mousemove((e) => {
                                    e = e || window.event
                                    let button = (typeof e.which != "undefined") ? e.which : e.button
                                    if (button == 1) {
                                        let w = $(content_modal).width()
                                        let h = $(content_modal).height()
                                        let x = e.clientX - w / 2;
                                        let y = e.clientY - h / 2;

                                        deltaX = x * 0.1
                                        deltaY = y * 0.1

                                        content_modal.scrollLeft((i, v) => { return v + deltaX })
                                        content_modal.scrollTop((i, v) => { return v + deltaY })
                                    }
                                })

                                content_modal.mouseup(() => { content_modal.unbind("mousemove") })
                                content_modal.bind("blur mouseleave", () => {
                                    deltaX = 0
                                    deltaY = 0
                                })

                            }
                        }

                        // LOAD ELEMENT SPECT AND CREATE TO ZONE 
                        if (box_list && box_list.length > 0) {
                            _.forEach(box_list, (el, i) => {
                                const el_empty = document.getElementById(`parent_${el.BoxInsideParent}_previews`)

                                let title_style = 'position: absolute; height: 100%; display: flex; justify-content: center; align-items: center;';
                                let layout_empty = createElement('div', { 'id': `${el.BoxID}_previews`, 'class': cls['grid_layout_empty'], 'data-sidename': el.BoxInsideParent, 'data-init': el.BoxInitial, 'data-new': false, 'style': el.BoxStyle },
                                    _.map([0, 1], (v, i) => {
                                        return (v == 0) ?
                                            createElement('div', { id: `le_title_handle_${el.BoxInitial}_previews`, 'class': `${cls['input_title_handle']}`, 'title': (el.BoxText) ? el.BoxText : ' ', 'style': title_style }, (el.BoxText) ? el.BoxText : ' ') :
                                            createElement('div', { id: `remove_handle_${el.BoxInitial}_previews`, 'class': `${cls['layout_remove_handle']} ${(!this.state.removeHandle) && cls['hide']}` }, 'x')
                                    })
                                )

                                // APPEND ELEMENT SPECT TO ZONE TARGET
                                if (el_empty) {
                                    el_empty.appendChild(layout_empty)

                                    const str_text = (el.BoxText) ? el.BoxText.length : 0
                                    let total_str_total = roundFixed((str_width * str_text), 0)

                                    // SET TEXT AUTO ROATATION
                                    if ($(`#${el.BoxID}_previews`).length > 0) {
                                        this.setTextAutoRoation($(`#${el.BoxID}_previews`), total_str_total)
                                    }

                                }
                            })

                        }

                    }

                }

                notification.info({
                    message: 'แจ้งเตือนจากระบบ',
                    description: 'แนะนำการใช้งาน กรณีต้องปิดหน้าจำลองเลย์เอาท์สามารถทำได้ โดยการเลือนเมาส์ที่หน้าจอไปทางขวาบน จะพบไอคอน X กดปุ่มเพื่อปิดหน้า หรือสามารถกดปิดด้วยปุ่มลัดโดยกดปุ่ม ESC. หมายเหตุ กรณีเข้ามาจากโหลดจำลองขนาดย่อจะเป็นย้อนกลับไปที่โหลดเดิม',
                    duration: 10000
                });

            }
        })
        .catch(err => { console.log(`fetch error ${err}`) })
    }

    handlePreviewLayoutCloseBigScale = () => {
        const { fixscope, preview_bigscale } = this.state

        const grid_preview = $(`#grid_previews`)
        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)
        const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))

        if (grid_preview) {
            grid_preview.empty()
            const modalBody = $(`.${gridcls['gridWrapper']}`).find('.ant-modal-body')
            const style_total = `min-height: ${maxHeightScreen}px; min-width: ${maxWidthScreen}px; padding-top: 80px !important;`

            modalBody.removeAttr('style').attr('style', style_total)
            $(`.${gridcls['gridWrapper']}`).find('.ant-modal').css('min-width', `${maxWidthScreen}px`)

            if (preview_bigscale.sidename_activation && preview_bigscale.sidename_activation.length > 0) {
                _.forEach(preview_bigscale.sidename_activation, (el, i) => {
                    document.getElementById(`grid_previews`).appendChild(
                        createElement('div', { 'id': `${el.LayoutID}_previews`, 'key': `${el.LayoutID}_previews`, 'data-attr': el.LayoutName, 'class': `${cls['grid_layout_zone']} ${cls['grid_layout_zone_fix']}` }, '')
                    )
                })
            }

            if(fixscope) {
                this.setState({ preview_bigscale: {}, visible: _.assignIn({}, this.state.visible, { preview_modal: false, preview_bigscale_modal: false, cell_extension_tool: false }), fixscope: false })
            } else {
                this.setState({ preview_bigscale: {}, visible: _.assignIn({}, this.state.visible, { preview_modal: true, preview_bigscale_modal: false, cell_extension_tool: false }) })
            }

        } else {
            if(fixscope) {
                this.setState({ preview_bigscale: {}, visible: _.assignIn({}, this.state.visible, { preview_modal: false, preview_bigscale_modal: false, cell_extension_tool: false }), fixscope: false })
            } else {
                this.setState({ preview_bigscale: {}, visible: _.assignIn({}, this.state.visible, { preview_modal: true, preview_bigscale_modal: false, cell_extension_tool: false }) })
            }            
        }

        // BIND CONTEXAT RIGHT MENU
        let tool_handle = document.querySelectorAll(`.${cls['grid_layout_empty']}`)
        if (tool_handle && tool_handle.length > 0) {
            tool_handle.forEach((v, i) => {
                const el_id = v.querySelector(`.${cls['input_title_handle']}`).getAttribute('id')
                this.contextObjectHandle(el_id)
            })
        }

    }

    handleFirstCreation = () => {
        const { Auth } = this.state.authen

        let request_filter = {
            RegionID: null,
            AreaID: null,
            Zone: null,
            BranchCode: (Auth.BranchCode !== '000') ? Auth.BranchCode : null,
            BranchType: "L,P,K",
            CAName: null,
            MarketName: null,
            IncludeExitingMarket: true,
            IncludeKioskMarket: true,
            EmpCode: Auth.EmployeeCode
        }

        fetch(`${config.nanoapi}/marker`, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify(request_filter),
            timeout: 1500000
        })
        .then(res => (res.json()))
        .then(res => {
            this.setState({
                progress: false,
                mktMasterFilter: res
            })

            this.handleMktAssignModal()
        })
        .catch(err => { console.log(`fetch error ${err}`) })
    }

    // CUSTOMER PROFILE HANDLER 
    // OPEN PROFILE MODAL
    handleProfileModal = (el_target, el_name = null) => {
        const { visible, mktcode, mktCustomers } = this.state
        const result = _.filter(mktCustomers, { ApplicationNo: el_target[0].getAttribute('data-attr') })[0]
 
        // LOAD IS IMAGE OF CUSTOMER WITH APPLICATION NO
        fetch(`${config.pcisapi}/nano/customer/image/${el_target[0].getAttribute('data-attr')}`)
        .then(response => response.json())
        .then(resp => {
            let note_reason = {
                profile: result,
                images: (resp.Status == 200) ? resp.ImgaeList[0] : null,
                cellable: el_target
            }

            this.setState({
                visible: _.assignIn({}, visible, { market_modal: true, cell_extension_tool: false }),
                mktCustFilter: note_reason
            })

            this.getNoteHistoryList(mktcode, el_target[0].getAttribute('data-attr'))
        })

    }

    // CLOSE PROFILE MODAL
    handleProfileModalClose = () => {
        this.setState({ visible: _.assignIn({}, this.state.visible, { market_modal: false, cell_extension_tool: false }) })
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

    handleUpdateActionLog = (action_logs, element_cell) => {
        if (action_logs && action_logs[0]) {
            // ADD ACTION INTO STATE LOG
            action_logs[0].RowID = (this.state.actionLogs.length + 1)
            this.setState({ actionLogs: this.state.actionLogs.concat(action_logs) })
            
            // CUSTOMIZE ELEMENTS FOR TRIANGLE-UP ON CELL
            if (action_logs[0].Subject) {
                const inside_divide = $(element_cell).hasClass(`${cls['inside_divide']}`)
                let el_target = (parseBool(inside_divide)) ? $(element_cell) : $(element_cell).find(`div.${cls['cell']}`)  

                if(!parseBool(inside_divide)) {
                    $(
                        _.map([0, 1], (v, i) => {
                            return (i == 0) ?
                            createElement('div', { 'class': `${cls['triangle-up-right']} ${cls['tooltip']}` },
                                createElement('div', { 'class': `${cls['tooltip_container']}` },
                                    (_.map([action_logs[0].Subject, action_logs[0].Remark], (data) => { return createElement('p', {}, data) }))
                                )
                            ) : createElement('div', { 'class': `${cls['inside_block']}` }, ' ')
                        })
                        
                    )
                    .appendTo($(element_cell).find(`div.${cls['cell']}`))
                }
                
            }

        }

    }

    getInitialLayout = () => {
        const { CUSTOMER_LIST_INFO } = this.props
        const { layouts } = this.state

        // THE DATA FOUND
        if(CUSTOMER_LIST_INFO.state) {
            _.delay(() => { this.setState({ progress_status: 0, progress_desc: 'พบข้อมูลก่อนหน้า ระบบกำลังโหลดเลย์เอาท์ตลาด...' }) }, 1000)
        }

        _.delay(() => {

            // MARKET LAYOUTS IS RENDERING AREA...
            const side_list = layouts.sidename_activation

            // LAYOUT IS RENDERING, CASE IS NOT THE FIRST DATA CREATION
            if (!this.state.firstCreate) {
                _.forEach(side_list, (v) => {
                    if (parseBool(v.HasTable)) {
                        if (config.side[3] == 'mainside_central_zone') {
                            // SENT CELL AMOUNT TO NAVIGATION
                            this.talkCellResult(v)
                        }
                        // TABLE RENDER
                        this.createTable(document.querySelector(`#${v.LayoutID}`), v.LayoutID, v)
                    }
                })

                // CUSTOMER ADD TO CELL IN THE TABLE (CUSTOMER ADDITIONAL ONLY)
                const addition_extends = layouts.addition_activation
                if (addition_extends && addition_extends[0]) {
                    this.setAdditionBundle(addition_extends)
                }

                // CLEAR STYLE FOR DISPLAY LAYOUTS
                if (document.querySelector('#layout_content')) {
                    document.querySelector('#layout_content').removeAttribute('style')
                }
            }
            
        }, 1500)

        // DETECT WAS DATA CHANGED FOR AUTO UPDATE STATUS TO CUSTOMER ASSIGNMENT IN CELL OF LAYOUTS
        _.delay(() => {
            // FIND ELEMENT CELL WAS ACTIVED
            const cell = document.querySelectorAll(`.${cls['cell_active']}`)
            // DEFINE A VARIABLE FOR GET CUSTOMER LIST OF MARKET
            const cust = (CUSTOMER_LIST_INFO.data && CUSTOMER_LIST_INFO.data.length > 0) ? CUSTOMER_LIST_INFO.data : []

            // UPDATE CUSOMTER
            if (cust && cust.length > 0) {
                if (cell[0] && cell.length > 0) {                
                    _.forEach(cell, (v) => {                    
                        let result = _.filter(cust, { ApplicationNo: v.getAttribute('data-attr') })[0]
                        let assignClass = this.onChangeStateCell(result)
                        if (assignClass) {
                            $(v).addClass(assignClass)
                        }
                    
                    })
                }
            }

        }, 2000)
        
    }

    componentWillMount() {
        const { Auth } = this.state.authen
        const { GET_MASTER_DATA, GET_EMP_TESTER_DATA, GET_BRANCHMARKET_INFO, GET_CUSTOMER_INFO, GET_MARKETSHARE_CA, GET_MARKET_LOCKINFO  } = this.props
                
        // INITIAL OBJECT REFERENCE START
        this.localStorageWrite('nanolayout_objectbox', 'ref', 1)

        // GET PARAM WITH URL
        const pathArray = window.location.pathname.split( '/')
        const param_info = (pathArray[2]) && pathArray[2]

        // CALL DEFAULT BASIC INFORMATION 
        if(param_info && !_.isEmpty(param_info)) {
            let params = { 
                AuthID: Auth.EmployeeCode,
                MarketCode: param_info.substr(0, (param_info.length - 3)).toUpperCase()               
            }

            let apis = [GET_MASTER_DATA, GET_EMP_TESTER_DATA, GET_MARKET_LOCKINFO, GET_BRANCHMARKET_INFO, GET_CUSTOMER_INFO, GET_MARKETSHARE_CA]
            bluebird.all(apis).each((fn, i) => {
                if(in_array(i, [0, 1])) fn()
                else fn(params)
            })

        }

    }
    
    componentWillReceiveProps(props) {
        if(props) {
            if(props.CUSTOMER_LIST_INFO.data && props.CUSTOMER_LIST_INFO.data.length > 0) {
                const { mktCustomers } = this.state
                if(mktCustomers && mktCustomers.length <= 0) {
                    this.setState({ mktCustomers: props.CUSTOMER_LIST_INFO.data })
                }
            }
           
            if(props.MARKETSHARE_CA_INFO.data && props.MARKETSHARE_CA_INFO.data.length > 0) {
                const { camktshare } = this.state
                if(camktshare && camktshare.length <= 0) {
                    this.setState({ camktshare: props.MARKETSHARE_CA_INFO.data })
                }
            }

            if(props.MARKET_LOCKINFO.data && props.MARKET_LOCKINFO.data.length > 0) {
                if(props.MARKET_LOCKINFO.data[0].IsLock == 'Y' && !this.state.elements.draggable) {
                    this.setState({ elements: _.assignIn({}, this.state.elements, { draggable: true, resizable: true, context: true }) })
                }
            }
            
        }
    }

    componentDidMount() {
        const { Auth } = this.state.authen
       
        // CHECK AUTHORITY 
        if (!Auth && !Auth.EmployeeCode) {
            _.delay(() => { this.setState({ progress_status: 2, progress_desc: 'สิทธิในการใช้งานระบบหมดอายุ' }) }, 2000)
            _.delay(() => { window.location.href = 'http://tc001pcis1p/login/' }, 4000)

        } else {

            _.delay(() => { 

                // DISPLAY MASSAGE: AUTHEN FOUNDED
                this.setState({ progress_status: 1, progress_desc: 'ตรวจสอบข้อมูลสำเร็จ' })

                // LOAD LAYOUT FROM DB
                if (this.state.layouts.side_activation) { 
                    this.getInitialLayout() 

                // NOT ANYTHING LAYOUT, THE SYSTEM WILL PASS TO CREATE LAYOUT
                } else {
                    const { BRANCH_MARKET_PROFILE } = this.props

                    _.delay(() => {

                        this.setState({ progress_status: 0, progress_desc: 'กำลังโหลดข้อมูล กรุณารอสักครู่...' })

                        // CHECK BASIC BRANCH AND MARKET INFORMATION
                        if(BRANCH_MARKET_PROFILE.status) {
                            // CREATE OBJECT FOR INITIAL LAYOUT
                            const market_profile = (BRANCH_MARKET_PROFILE.data && BRANCH_MARKET_PROFILE.data[0]) ? BRANCH_MARKET_PROFILE.data[0] : null
                            let requestData = {
                                branch_filter: (market_profile) ? market_profile.BranchCode : null,
                                market_filter: (market_profile) ? market_profile.MarketCode : null,
                                market_info: market_profile
                            }
                            
                            // INITIAL DATA FOR CREATE LAYOUT
                            this.handleInitialCreation(requestData)

                        } else {
                            _.delay(() => { this.setState({ progress_status: 2, progress_desc: `เกิดข้อผิดพลาดในการรับข้อมูล [${EX.MARKET_ERR.CODE}]` }) }, 700)
                        }
                        
                    }, 500)
                }

            }, 700)

        }

        document.title = 'Nano Layout'
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.master !== nextProps.master ||
            this.props.BRANCH_MARKET_PROFILE !== nextProps.BRANCH_MARKET_PROFILE ||
            this.props.CUSTOMER_LIST_INFO !== nextProps.CUSTOMER_LIST_INFO ||
            this.props.MARKETSHARE_CA_INFO !== nextProps.MARKETSHARE_CA_INFO ||
            this.props.MARKET_LOCKINFO !== nextProps.MARKET_LOCKINFO ||
            this.state.elements !== nextState.elements ||
            this.state.layouts !== nextState.layouts ||
            this.state.preview_layouts !== nextState.preview_layouts ||
            this.state.camktshare !== nextState.camktshare ||
            this.state.authen !== nextState.authen ||
            this.state.progress !== nextState.progress ||
            this.state.progress_status !== nextState.progress_status ||
            this.state.progress_desc !== nextState.progress_desc ||
            this.state.navable !== nextState.navable ||
            this.state.visible !== nextState.visible ||
            this.state.sideable !== nextState.sideable ||
            this.state.active_sideno !== nextState.active_sideno ||
            this.state.splitMode !== nextState.splitMode ||
            this.state.assignItem !== nextState.assignItem ||
            this.state.assignCell !== nextState.assignCell ||
            this.state.cellExtension !== nextState.cellExtension ||
            this.state.cellExtensionType !== nextState.cellExtensionType ||
            this.state.assignMode !== nextState.assignMode ||
            this.state.decreaseCust !== nextState.decreaseCust ||
            this.state.firstCreate !== nextState.firstCreate ||
            this.state.firstCreatePotential !== nextState.firstCreatePotential ||
            this.state.cellStartHandler !== nextState.cellStartHandler ||
            this.state.rowsCount !== nextState.rowsCount ||
            this.state.colsCount !== nextState.colsCount ||
            this.state.startRowIndex !== nextState.startRowIndex ||
            this.state.startCellIndex !== nextState.startCellIndex ||
            this.state.table_info.adds !== nextState.table_info.adds ||
            this.state.table_info.cols !== nextState.table_info.cols ||
            this.state.table_info.rows !== nextState.table_info.rows ||
            this.state.table_info.total !== nextState.table_info.total ||
            this.state.mktPotential !== nextState.mktPotential ||
            this.state.mktCustomers !== nextState.mktCustomers ||
            this.state.mktCustFilter !== nextState.mktCustFilter ||
            this.state.mktMasterFilter !== nextState.mktMasterFilter ||
            this.state.preview_bigscale !== nextState.preview_bigscale || 
            this.state.pvZoneAvaliable !== nextState.pvZoneAvaliable
    }

    render() {
      
        _.map(this.state.assignItem, (v, i) => {
            let merge_data = _.merge(this.state.layouts.cellname_activation, this.state.layouts.addition_activation)
            let filter = _.filter(merge_data, { ApplicationNo: v.ApplicationNo })

            if (!filter[0]) {
                return v.Tools = (<Icon type="select" className="pointer" onClick={this.handleCellAssignment.bind(this, v.ApplicationNo)} style={{ fontSize: '14px', color: '#0e77ca' }} />),
                    v.IsActive = 'Y',
                    v.IsAssign = true
            } else {
                return v.Tools = (<Icon type="check" className="pointer green" />),
                    v.IsActive = 'N',
                    v.IsAssign = false
            }
        })

        return (
            <MarketLayoutComponent
                authen={this.state.authen}
                authenTester={this.props.EMP_TESTER_INFO}
                progress={this.state.progress}
                progress_desc={this.state.progress_desc}
                progress_status={this.state.progress_status}
                active_sideno={this.state.active_sideno}
                visible={this.state.visible}
                masters={this.props.masters}
                mktprofile={this.props.BRANCH_MARKET_PROFILE}
                camktshare={this.state.camktshare}
                mktCustomers={this.state.mktCustomers}
                mktLockInfo={this.props.MARKET_LOCKINFO}
                splitMode={this.state.splitMode}
                assignCell={this.state.assignCell}
                assignMode={this.state.assignMode}
                assignItem={this.state.assignItem}
                cellExtension={this.state.cellExtension}
                cellExtensionType={this.state.cellExtensionType}
                table_info={this.state.table_info}
                preview_layouts={this.state.preview_layouts}
                preview_bigscale={this.state.preview_bigscale}
                mktPotential={this.state.mktPotential}
                mktMasterFilter={this.state.mktMasterFilter}
                configData={this.state.config}
                firstCreate={this.state.firstCreate}
                firstCreatePotential={this.state.firstCreatePotential}
                navableState={this.state.navable}
                sideableState={this.state.sideable}
                createTable={this.createTable}                
                decreaseCust={this.state.decreaseCust}
                mktCustFilter={this.state.mktCustFilter}
                actionLogs={this.state.actionLogs}
                handleDrag={this.handleDrag}
                handleDrop={this.handleDrop}
                handleCollapse={this.handleCollapse}
                handleSummaryCollapse={this.handleSummaryCollapse}
                handleZoneActive={this.handleZoneActive}
                handleLockLayout={this.handleLockLayout}
                handleSaveLayout={this.handleSaveLayout}
                handleProfileModal={this.handleProfileModal}
                handleProfileModalClose={this.handleProfileModalClose}
                handleExtensionClose={this.handleExtensionClose}
                handleMarketCustomerListFilter={this.handleMarketCustomerListFilter}
                handleAssignModalClose={this.handleAssignModalClose}
                handleAssignResetFilter={this.handleAssignResetFilter}
                handleMktAssignCloseModal={this.handleMktAssignCloseModal}
                handleCustPotentialClose={this.handleCustPotentialClose}
                handleCreateCustPotential={this.handleCreateCustPotential}
                handleUpdateActionLog={this.handleUpdateActionLog}
                handlePreviewLayout={this.handlePreviewLayout}
                handlePreviewLayoutClose={this.handlePreviewLayoutClose}
                handlePreviewLayoutBigScale={this.handlePreviewLayoutBigScale}
                handlePreviewLayoutCloseBigScale={this.handlePreviewLayoutCloseBigScale}
                handleSplitCellCancel={this.handleSplitCellCancel}
                handleSplitCellClose={this.handleSplitCellClose}
                handleTableSelectionClose={this.handleTableSelectionClose}
                handleDecreaseAdditionalClose={this.handleDecreaseAdditionalClose}
                handleDecreaseCustomer={this.handleDecreaseCustomer}
                handleConfirmSplit={this.handleConfirmSplit}
                handleScrollbar={this.handleScrollbar}
                localStorageRead={this.localStorageRead}
            />
        )

    }

    // AI METHOD
    // AUTO SAVE
    handleAutoSave = () => {
        
    }

    handleAutoSetSate = () => {

    }

    handleUndo = () => {

    }

    handleRedo = () => {

    }

    handleScrollbar = (values) => {
        this.setState({ scrollbar: values })
    }

    handleDrag = (event) => {
        if (event.target.id) {
            switch (event.target.id) {
                case 'create_table':
                    event.dataTransfer.setData("menu_create_table", event.target.id)
                    break
                case 'create_street':
                    event.dataTransfer.setData("menu_create_street", event.target.id)
                    break
            }
        } else {
            notification.error({
                message: 'แจ้งเตือนจากระบบ',
                description: 'ขออภัย! อาจเกิดข้อผิดพลาดในการใช้งานฟังก์ชั่น กรุณาติดต่อผู้ดูแลระบบ',
                duration: 5
            })
        }
    }

    handleDrop = (el, ui) => {
        const create_table = ui.dataTransfer.getData("menu_create_table")
        const create_street = ui.dataTransfer.getData("menu_create_street")

        if (create_table !== '') { this.createTable(document.querySelector(`#${el}`), el) }
        else if (create_street !== '') { this.createElementEmpty(document.querySelector(`#${el}`), el, $(ui.target).offset()) }
    }

    handleRemove = () => {
        this.setState({ removeHandle: !this.state.removeHandle });
        if (!this.state.removeHandle) {
            $(`.${cls['layout_remove_handle']}`).removeClass(cls['hide'])
        } else {
            $(`.${cls['layout_remove_handle']}`).addClass(cls['hide'])
        }
    }

    handleStartWithCellEnd = (cell_start, startIndex, endIndex, rowsCount, colsCount) => {
        this.setState({
            cellStartHandler: cell_start,
            startRowIndex: startIndex,
            startCellIndex: endIndex,
            rowsCount: rowsCount,
            colsCount: colsCount
        })
    }

    handleAssignCustFilter = (filter) => {
        const { mktCustomers } = this.state
        let condition = {}
        if (filter.app_handle) {
            switch (filter.app_handle) {
                case 'cif':
                    condition = { 'CIFNO': filter.app_input }
                    break;
                case 'appno':
                    condition = { 'ApplicationNo': filter.app_input }
                    break;
                case 'contactno':
                    condition = { 'ContactTel': filter.app_input }
                    break;
            }
        }

        if (filter.cust_handle) {
            switch (filter.app_handle) {
                case 'cust':
                    condition = { 'AccountName': filter.cust_input }
                    break;
                case 'shop':
                    condition = { 'ShopName': filter.cust_input }
                    break;
            }
        }
        this.setState({ assignList: _.filter(mktCustomers, condition) })

    }

    // TOTAL CELL SUMMARY TO NAVIGATION
    talkCellResult = (tableData) => {
        let table_info = {
            cols: parseInt(tableData.TblCols),
            rows: parseInt(tableData.TblRows),
            total: parseInt(tableData.TblRows) * parseInt(tableData.TblCols)
        }
        this.setState({ table_info: table_info })
    }

    createTable = (el_target, el_name, options = {}) => {
        
        // INCLUDE RELATION DATA FOR CREATE LAYOUTS WITH A TABLE TYPE
        const { layouts, visible, config, elements } = this.state
        const isPreview = parseBool(visible.preview_bigscale_modal)

        // DESTROY CONTEXT MENU FOR PROTECT BIND EVENT UNIQUE
        $.contextMenu('destroy')
        
        // SET DEFAULT STYLE OF LAYOUTS
        let class_style = '',
            class_fix = '',
            event_type = '',
            resize = 0,
            rtl = false,
            rtp = false,
            route_resize = 'e, s'

        // SET DIRECT TYPE OF LAYOUT ON THE TABLE 
        if (in_array(el_name, config.rtl)) {
            class_style = (!isPreview) ? '' : `${cls['table_direct_rtl']}`
            rtl = true
        }

        // CHECK THE ELEMENT HAVE A RUNNING NUMBER WITH FIRST ZERO NUMBER
        if (in_array(el_name, config.padZero)) {
            class_fix = (!isPreview) ? '' : `${cls['grid_layout_flaxdown']}`
            rtp = true
        }

        // CALULATE SIZE FOR RESIZE TABLE
        resize = (config.cellSize * config.gridDefault.length)
        const css = `min-width: ${resize}px; min-height: ${resize}px;`

        let fix_right = (!isPreview) ? '' : `${cls['grid_layout_flaxright']}`
        let grid_table = createElement('div', { id: `parent_${el_name}`, 'data-parent': el_name, 'ref': `parent_${el_name}`, 'class': `${cls['grid_layout_parent']} ${(isPreview) && cls['undashed']} ${class_fix} ${(rtl) && fix_right}`, 'originalHeight': resize, 'originalWidth': resize, draggable: false },
            createElement('table', { id: `table_${el_name}`, 'data-parent': el_name, ref: `table_${el_name}`, 'class': `${cls['table_container']} ${(rtl) && cls['table_direct_rtl']} ${class_style} ${(rtl) && 'place-right'}`, 'rtl': rtl, 'rtp': rtp, 'style': css, draggable: false },
                createElement('tbody', { id: `table_${el_name}_body`, ref: `table_${el_name}_body`, draggable: false }, this.createColumn(el_name, rtl, rtp))
            )
        )

        // CHECK STATE IS PREVIEW ?
        if (!isPreview) {
            // BIND SCROLLING INTO DIV OF REACT-SCROLL
            el_target.querySelector('.react-scroll > div').setAttribute('class', 'react-scroll-content')
            // APPENT TO ELEMENT TARGET
            el_target.querySelector('.react-scroll-content').appendChild(grid_table)
        } else {
            // APPENT TO ELEMENT TARGET
            el_target.appendChild(grid_table)
            // CHECK THE ZONE CONDITION CRITERIA
            if(in_array(el_name, config.pvLayout)) {               
                // GET THE ZONE ELEMENT 
                let prev_element = document.querySelector(`#${el_name}`)             
                // IF CHECK IS TABLE HAVE CELL DEFAULT DISPLAY NONE
                if(options.TblCols == 2 && options.TblRows == 2) {
                    prev_element.style.display = 'none'                    
                } else {
                    prev_element.classList.add("avaliable")
                    this.state.pvZoneAvaliable.push(el_name)
                }              
            }
        }

        // BINDING THE EVENT FOR OPEN PROFILE MODAL
        $(el_target).find('td').on('dblclick', (event) => {
            const cell = $(event.target).parent()
            if (in_array(cls['cell_active'], cell[0].classList)) {
                this.handleProfileModal(cell)
            }
        })

        // BINDING THE EVENT TO CELL FOR ASSIGNMENT MODAL (CONTEXT MENU)
        this.contextCellAssign()

        // BINDING THE EVENT TO CELL HIGHTLIGHT
        this.onBindEventDragToCell(el_target)

        const parentElement = $(`#parent_${el_name}`)

        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)
        const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth)) - 20

        // THE PARENT HANDLER FOR RESIZE
        /** DEFAULT PROPERTY **/
        let isMouseDown = false
        let maxWidthResize = 0

        /** IF NOT PREVIEW MODE **/ 
        if (!isPreview) {

            const table_zone = $(`#table_${el_name}`)
            const parentTarget = document.getElementById(`parent_${el_name}`)

            // BIDING THE RESIZABLE EVENT TO OBJECT ELEMENT FOR START AND END HANDLER
            parentElement.resizable({
                animate: false,
                grid: true,
                height: resize,
                width: resize,
                minHeight: resize,
                minWidth: resize,
                handles: route_resize,
                aspectRatio: false,
                disabled: this.state.elements.resizable,
                resize: (event, ui) => {
                    let run_resize
                    if (isMouseDown) {

                        let tableWidthSize = table_zone.width()
                        let tableHeightSize = table_zone.height()

                        if (ui.size.width >= maxWidthScreen && ui.size.width >= tableWidthSize) {
                            run_resize = setInterval(() => {
                                if (ui.size.width <= maxWidthResize) {
                                    ui.size.width = maxWidthResize
                                }

                                ui.size.width = ui.size.width + 1

                                if (ui.size.width > maxWidthResize) {
                                    maxWidthResize = ui.size.width
                                }

                                let cal_tooltip_text = calTableExtends(parentTarget, el_name, ui.size)
                                this.setState({ table_info: _.assignIn({}, this.state.table_info, { adds: cal_tooltip_text.text }) })
                            }, 10)

                        } else if (ui.size.height >= maxHeightScreen && ui.size.height >= tableHeightSize) {
                            run_resize = setInterval(() => {
                                ui.size.height = ui.size.height + 1

                                let cal_tooltip_text = calTableExtends(parentTarget, el_name, ui.size)
                                this.setState({ table_info: _.assignIn({}, this.state.table_info, { adds: cal_tooltip_text.text }) })
                            }, 10)

                        } else {
                            let cal_tooltip_text = calTableExtends(parentTarget, el_name, ui.size)
                            this.setState({ table_info: _.assignIn({}, this.state.table_info, { adds: cal_tooltip_text.text }) })
                        }
                    }

                    $(parentElement).on("mouseup", (event, ui) => { clearInterval(run_resize) })
                    $(document).on("mouseup", (event, ui) => { clearInterval(run_resize) })
                                        
                }
            })
            .on("resizestart", (event, ui) => {
                isMouseDown = true
                event_type = event.originalEvent.target

                let route_position = routeHelper(event.originalEvent.target)
                parentElement.css(`border-${route_position.position}`, '1px dashed rgba(255, 4, 4, 1)')

            })
            .on("resizestop", (event, ui) => {
                const { table_info } = this.state

                // WHEN RESIZE STOP THE SYSTEM WILL DETACT WIDTH AND HEIGHT FOR COMPARE A CRITERIA
                let originalHeight = numValid(parentTarget.getAttribute('originalHeight'))
                let originalWidth = numValid(parentTarget.getAttribute('originalWidth'))

                // FIND TOTAL WITH COLS AND ROWS FROM INCREASE OR REMOVE CELL 
                let sum_cols = table_info.cols
                let sum_rows = table_info.rows

                // GET CALULATION INFO
                let calculate_cell = calTableExtends(parentTarget, el_name, ui.size)
                let cols_valid = (calculate_cell.amount > 0 && calculate_cell.type == 'cols') ? calculate_cell.amount : 0
                let rows_valid = (calculate_cell.amount > 0 && calculate_cell.type == 'rows') ? calculate_cell.amount : 0
                
                if (calculate_cell.mode == '+') {
                    sum_cols = sum_cols + cols_valid
                    sum_rows = sum_rows + rows_valid
                }

                if (calculate_cell.mode == '-') {
                    sum_cols = sum_cols - cols_valid
                    sum_rows = sum_rows - rows_valid
                }

                // DISPLAY TOTAL TO NAVIGATION MKT. INFO
                this.talkCellResult({ TblCols: sum_cols, TblRows: sum_rows })

                // CREATE CELL HANDLER
                this.createCellDragable(parentTarget, el_name, routeHelper(event_type), ui.size)

                // SET SIZE ELEMENT TO BE CURRENT SIZE
                $(this).css({ 'min-width': ui.size.width, 'min-height': ui.size.height, 'max-width': ui.size.width, 'max-height': ui.size.height })

                if (rtl) {
                    parentElement.css({ left: 'auto' })
                }

                if (rtp) {
                    parentElement.css({ top: 'auto' })
                }

                // CLEAR EVENT MOUSE DOWN AND SET STATE OF TABLE INFO
                isMouseDown = false
                if (!isMouseDown) {                   
                    this.setState({ table_info: _.assignIn({}, this.state.table_info, { adds: '' }) })
                    parentElement.css(`border`, '1px dashed rgba(0, 0, 0,.2)')
                    maxWidthResize = 0
                }

            })

        }

        // LOAD SAVE AND SET LAYOUT BUNDLE
        if (!this.state.firstCreate) {
            if (options.LayoutName) {
                // GET PROPERTY FOR SET ELEMENTS
                let layoutName = options.LayoutName
                let originalHeight = options.OriginalHeight
                let originalWidth = options.OriginalWidth

                // GET ROUTE NAME FOR RESIZIBEL COMPONENT (THE DIRECTION ON MOVEMENT TO ELEMENTS FOR DRAG HANDLER)
                let route_position = this.routeIDHelper(layoutName)
        
                // LOAD DATA TABLE AND CREATE CELL FROM LAYOUTS MODEL
                // THE PARENT IS RENDERING THE ROWS RENDER
                let success = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[0], { height: originalHeight, width: originalWidth })
               
                // IF CREATE LAYOUT ARE SUCCESS
                if (success) {
                    // THE PARENT IS RENDERING THE COLS RENDER
                    let completed = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[1], { height: originalHeight, width: originalWidth })
                    
                    // COLS AND ROWS RENDERING COMPLETED
                    if (completed) {

                        // IF HAVE DATA CUSTOMER ASSIGNMENT THE SYSTEM WILL BE RENDERING TO CELL
                        if (layouts.cellname_activation && layouts.cellname_activation.length > 0) {
                            this.createCellAssignment(layouts.cellname_activation)

                            // LOAD DATA CELL EXTENDSION SCALING
                            const scale_extends = layouts.extended_activation
                            if (scale_extends && scale_extends[0]) {
                                const cell_scale = _.filter(scale_extends, { LayoutID: options.LayoutName })
                                if (cell_scale && cell_scale.length > 0) {
                                    _.forEach(cell_scale, (data, i) => {
                                        let cell_target = document.querySelector(`td[ref="${data.ColumnCell}"]`)
                                        this.checkExtendedScaleCell(cell_target, data.ApplicationNo, data.PrimaryCell)
                                    })

                                }
                            }
                        }

                        // LOAD DATA POTENTIAL LIST
                        if (layouts.customer_potential && layouts.customer_potential.length > 0) {
                            _.forEach(layouts.customer_potential, (data, index) => {
                                this.handleSetPotentialOnCell($(`td[ref="${data.ColumnCell}"]`), data)
                            })
                        }

                        // LOAD DATA ELEMENT SPECT
                        if (layouts.boxsname_activation && layouts.boxsname_activation.length > 0) {
                            _.forEach(layouts.boxsname_activation, (el, i) => {
                                const el_empty = document.getElementById(`${el.BoxInsideParent}`)

                                const str_text = (el.BoxText) ? el.BoxText.length : 0
                                let total_str_total = roundFixed((str_width * str_text), 0)

                                let title_style = 'position: absolute; height: 100%; display: flex; justify-content: center; align-items: center;';
                                let layout_empty = createElement('div', { 'id': el.BoxID, 'class': cls['grid_layout_empty'], 'data-sidename': el.BoxInsideParent, 'data-init': el.BoxInitial, 'data-new': false, 'style': el.BoxStyle },
                                    _.map([0, 1], (v, i) => {
                                        return (v == 0) ?
                                            createElement('div', { id: `le_title_handle_${el.BoxInitial}`, 'class': `${cls['input_title_handle']} context-menu-layout`, 'title': (el.BoxText) ? el.BoxText : ' ', 'style': title_style }, (el.BoxText) ? el.BoxText : ' ') :
                                            createElement('div', { id: `remove_handle_${el.BoxInitial}`, 'class': `${cls['layout_remove_handle']} ${(!this.state.removeHandle) && cls['hide']}` }, '')
                                    })
                                )

                                // APPEND TO ELEMENT TARGET
                                const box_empty = $(`#${el.BoxID}`)
                                if (el_empty.querySelector('.react-scroll-content')) {

                                    // CLEAR STYLE FOR DISPLAY ZONE ACTIVATION
                                    if (document.querySelector('#layout_content')) {
                                        document.querySelector('#layout_content').removeAttribute('style')
                                    }

                                    // ELEMENT BUNDLE
                                    if (box_empty.length === 0) {
                                        el_empty.querySelector('.react-scroll-content').appendChild(layout_empty)
                                    }

                                    // DECLARE ELEMENT FOR DRAGABLE
                                    const element_layout = $(`#${el.BoxID}`)

                                    // SET TEXT AUTO ROATATION
                                    this.setTextAutoRoation(element_layout, total_str_total)

                                    if (!isPreview) {                                     
                                        // BIND EVENT CONTEXT RIGHT MENU TO ELEMENT
                                        this.contextObjectHandle(`le_title_handle_${el.BoxInitial}`)

                                        // BIND EVENT DRAG TO ELEMENT AND RESIZEABLE FUNCTION
                                        element_layout.draggable({
                                            containment: `#${el.BoxInsideParent}`,    
                                            drag: function (e, _ui) {
                                                $(e.target).css({ 'top': _ui.offset.top + 'px', 'left': _ui.offset.left + 'px' })
                                            },
                                            stop: function (e, ui) {
                                                detectResize(document.querySelector(`#${el.BoxID}`), e.target.id, el.BoxID, ui)
                                            },
                                            disabled: this.state.elements.draggable
                                        })
                                        
                                        // BIND EVENT RESIZABLE
                                        element_layout.resizable({
                                            animate: false,
                                            grid: true,
                                            handles: "n, e, s, w",
                                            disabled: this.state.elements.resizable,
                                            resize: function (event, ui) {
                                                const str_text = $(this).find(`.${cls['input_title_handle']}`).text().length
                                                let total_str_total = roundFixed((str_width * str_text), 0)

                                                // SET TEXT AUTO ROTATION
                                                if (ui.size.width >= (total_str_total + decrease_width)) {
                                                    $(this).find(`.${cls['input_title_handle']}`).removeClass(`${cls['title_ellipsis']}, ${cls['title_rotation']}`)
                                                } else {
                                                    if (ui.size.height >= (total_str_total + decrease_width)) {
                                                        $(this).find(`.${cls['input_title_handle']}`).removeClass(cls['title_ellipsis']).addClass(cls['title_rotation'])
                                                    } else {
                                                        $(this).find(`.${cls['input_title_handle']}`).removeClass(cls['title_rotation']).addClass(`${cls['title_ellipsis']}`)
                                                    }
                                                }
                                            }
                                        })
                                        .on("resizestop", (event, ui) => {
                                            $(this).css({ 'min-width': ui.size.width, 'min-height': ui.size.height })
                                            detectResize(document.querySelector(`#${el.BoxID}`), el.BoxInsideParent, el.BoxID, ui)
                                        })
                                    }

                                }
                            })

                        }

                        // SET A STATE CLOSE PROGRESS
                        this.setState({ progress: false })
                    }
                }
            }
        }

        // IF USE THE PREVIEW MODE
        if (isPreview) {
            this.getContentPreviewLayout(options)
        }

    }

    getContentPreviewLayout = (options) => {
        const { CUSTOMER_LIST_INFO } = this.props

        if (options.LayoutName) {
            const { preview_bigscale } = this.state

            let layoutName = `${options.LayoutName}_previews`
            let originalHeight = options.OriginalHeight
            let originalWidth = options.OriginalWidth

            let route_position = this.routeIDHelper(layoutName)
            let success = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[0], { height: originalHeight, width: originalWidth })
            if (success) {
                let completed = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[1], { height: originalHeight, width: originalWidth })
                if (completed) {
                    if (preview_bigscale.cellname_activation && preview_bigscale.cellname_activation.length > 0) {
                        this.createCellAssignment(preview_bigscale.cellname_activation)

                        _.delay(() => {
                            const cell = document.getElementById('grid_previews').querySelectorAll(`.${cls['cell_active']}`)
                            const cust = (CUSTOMER_LIST_INFO.data && CUSTOMER_LIST_INFO.data.length > 0) ? CUSTOMER_LIST_INFO.data : []
                            if (cell[0] && cell.length > 0) {
                                _.forEach(cell, (v) => {
                                    if (cust && cust.length > 0) {
                                        let result = _.filter(cust, { ApplicationNo: v.getAttribute('data-attr') })[0]
                                        let assignClass = this.onChangeStateCell(result)
                                        if (assignClass) {
                                            $(v).addClass(assignClass)
                                        }
                                    }
                                })
                            }
                        }, 200)

                    }

                }
            }

        }
    }

    // CREATE THE ELEMENT FOR OVERRIDE SPECE
    createElementEmpty = (el_target, el_name, ui) => {
        const { scrollbar } = this.state

        let styles = '',
            rtl = false,
            rtp = false,
            top_opt = 1,
            left_opt = 1,
            isPadding = this.state.isPadding

        const table = el_target.querySelector('table')
        rtl = (table) && parseBool(table.getAttribute('rtl'))
        rtp = (table) && parseBool(table.getAttribute('rtp'))

        if (this.state.visible.subdetail) {
            let el_subdetails = document.querySelector('.grid_subdetails').offsetHeight
            ui.top = ui.top - el_subdetails
        }

        let top_default = (ui.top / this.state.config.cellSize)
        let left_default = (ui.left / this.state.config.cellSize)
        let scroll_top = (scrollbar.scrollTop / this.state.config.cellSize)
        let scroll_left = (scrollbar.scrollLeft / this.state.config.cellSize)
            
        let top__def = ((this.state.config.cellSize * roundFixed(top_default, 0)) + top_opt) - this.state.config.cellSize
        let left__def = (this.state.config.cellSize * roundFixed(left_default, 0)) + left_opt
        let top_martrix = (this.state.config.cellSize * roundFixed(scroll_top, 0))
        let left_martrix = (this.state.config.cellSize * roundFixed(scroll_left, 0))
     
        styles = `position: absolute; top: ${(numValid(top__def) + top_martrix)}px; left: ${numValid(left__def) + left_martrix}px;`
        
        let runno = this.localStorageRead('nanolayout_objectbox', 'ref')

        let title_style = 'position: absolute; height: 100%; display: flex; justify-content: center; align-items: center;';
        let layout_empty = createElement('div', { 'id': `layout_empty_${runno}`, 'class': cls['grid_layout_empty'], 'data-sidename': el_name, 'data-init': `${runno}`, 'data-new': true, 'style': styles },
            _.map([0, 1], (v, i) => {
                return (v == 0) ?
                    createElement('div', { id: `le_title_handle_${runno}`, 'class': `${cls['input_title_handle']} context-menu-layout`, 'style': title_style }, ' ') :
                    createElement('div', { id: `remove_handle_${runno}`, 'class': `${cls['layout_remove_handle']} ${(!this.state.removeHandle) && cls['hide']}` }, '')
            })
        )

        // APPEND TO ELEMENT TARGET
        el_target.querySelector('.react-scroll-content').appendChild(layout_empty)

        // DRAFT REFNO INTO APPLICATION STORE
        this.localStorageWrite('nanolayout_objectbox', 'ref', (runno + 1))

        // DECLARE ELEMENT INSTANT FOR HANDLER
        const element_layout = $(`#layout_empty_${runno}`)

        // BIND EVENT CONTEXT RIGHT MENU TO ELEMENT TEXT
        this.contextObjectHandle(`le_title_handle_${runno}`)

        // GET MAX HEIGHT ON SCREEN FOR COMPARE ELEMENT FLOAT OVER HEIGHT SCREEN
        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)

        // BIND EVENT DRAGABLER
        // HANDLE DESC: AUTO SET OFFSET
        element_layout.draggable({
            containment: `#${el_target.id}`,     
            drag: (e, _ui) => {
                $(e.target).css({ 'top': _ui.offset.top + 'px', 'left': _ui.offset.left + 'px' })
            },            
            stop: (e, _ui) => {         
                detectResize(el_target, el_name, e.target.id, _ui)
            },
            disabled: this.state.elements.draggable
        })

        // BIND RESIZABLE HANDLER
        // HANDLE DESC: RESIZE TO ELEMENTS
        element_layout.resizable({
            animate: false,
            grid: true,
            handles: "n, e, s, w",
            disabled: this.state.elements.resizable,
            resize: (e, _ui) => {
                const str_text = $(e.target).find(`.${cls['input_title_handle']}`).text().length
                let total_str_total = roundFixed((str_width * str_text), 0)

                if (_ui.size.width >= (total_str_total + decrease_width)) {
                    $(e.target).find(`.${cls['input_title_handle']}`).removeClass(`${cls['title_ellipsis']}, ${cls['title_rotation']}`)
                } else {
                    if (_ui.size.height >= (total_str_total + decrease_width)) {
                        $(e.target).find(`.${cls['input_title_handle']}`).removeClass(cls['title_ellipsis']).addClass(cls['title_rotation'])
                    } else {
                        $(e.target).find(`.${cls['input_title_handle']}`).removeClass(cls['title_rotation']).addClass(`${cls['title_ellipsis']}`)
                    }
                }
            }
        })
        .on("resizestop", (event, ui) => {
            $(this).css({ 'min-width': ui.size.width, 'min-height': ui.size.height })
            detectResize(el_target, el_name, event.target.id, ui)
        })

    }

    // CHECK CHARECTER WHEN WIDTH OVER WIDTH OF ELMENT
    setTextAutoRoation = (element_layout, total_str_total) => {
        let element_target = undefined
        if(element_layout.hasClass(`${cls['input_title_handle']}`)) {
            element_target = element_layout
        } else {
            element_target = element_layout.find(`.${cls['input_title_handle']}`)
        }
       
        let total_char_width = (numValid(total_str_total) + numValid(decrease_width))
        let total_element_width = numValid(element_layout.width())
        let total_element_height = numValid(element_layout.height())

        // IF ELEMENT HAVING WIDTH MORE THEN CHARECTER WILL REMOVE CLASS ADJUST TEXT
        if(total_element_width > total_char_width) {
            element_target.removeClass(`${cls['title_ellipsis']}, ${cls['title_rotation']}`)
        } else {
            let check_logic = total_char_width > (total_element_width - numValid(decrease_width)) && total_element_height > total_char_width
            if(check_logic) {
                element_target.addClass(cls['title_rotation']).removeClass(cls['title_ellipsis'])
            } else {
                element_target.addClass(cls['title_ellipsis']).removeClass(cls['title_rotation'])
            }
        }
       
    }

    createColumn = (el_name, rtl, rtp) => {
        const config = this.state.config.gridDefault
        if (rtp) {
            let rows = []
            _.forEachRight(config, (r, rIndex) => {
                rows.push(createElement('tr', { 'rows-id': `${r}`, ref: `rows_${r}`, draggable: false }, this.createCell(config, r, el_name)))
            })
            return rows
        }
        else {
            if (typeof config[0] !== undefined) {
                return _.map(config, (r, rIndex) => {
                    return createElement('tr', { 'rows-id': `${r}`, ref: `rows_${r}`, draggable: false }, this.createCell(config, r, el_name))
                })
            }
        }
    }

    createCell = (cols, seq, el_name) => {
        const { preview_bigscale_modal } = this.state.visible

        let pad_zero = false,
            rtl_table = false

        if (in_array(el_name, this.state.config.padZero)) {
            pad_zero = true
        }

        if (in_array(el_name, this.state.config.rtl)) {
            rtl_table = true
        }

        let prefix_ref = (!pad_zero) ? '0':''
        return _.map(cols, (c, cIndex) => {   

            let el_runs = c
            let el_char = (!rtl_table) ? this.getCharByNumber(c) : this.state.doubletChart[c - 1]
            let el_nums = (!pad_zero) ? seq : `0${seq}`

            return createElement('td',
                {
                    'key': `${el_name}_${el_char}${el_nums}`,
                    'data-id': `${el_runs}`,
                    'data-columns': el_char,
                    'data-reserv': false,
                    'class': `${cls['untouch']} ${(!preview_bigscale_modal) && 'context-cell-menu'}`,
                    'ref': `${el_char}${el_nums}`,
                    'width': this.state.config.cellSize,
                    'height': this.state.config.cellSize,
                    'style': `max-height: ${this.state.config.cellSize}px !important; max-width: ${this.state.config.cellSize}px !important;`,
                    'draggable': 'false'
                },
                createElement('div', { 'class': `${cls['cell']}` }, `${el_char}${el_nums}`)
            )
        })
    }

    // MANUAL HANDLE CREATE CELL AND HANDLE REMOVE CELL
    createCellDragable = (el_target, el_name, route, size) => {
        let height = numValid(el_target.getAttribute('originalHeight'))
        let width = numValid(el_target.getAttribute('originalWidth'))

        // FOR INCREASE CELL
        if (size.width > width || size.height > height) {

            let width_diff = undefined
            let height_diff = undefined

            if (in_array(route.position, ['top', 'bottom'])) {

                // GET ARE TABLE TYPE FOR CONTROL EVENT
                let rtl = parseBool(el_target.querySelector('table').getAttribute('rtl'))
                let rtp = parseBool(el_target.querySelector('table').getAttribute('rtp'))

                // IF TABLE TYPE A EQUAL BELOW THE SYSTEM WILL FIND LAST CHILD FOR NEXT GENERATION
                // IF TABLE TYPE A EQUAL ABOVE THE SYSTEM WILL FIND FRIST CHILD FOR CLONE AND NEXT GENERATION
                const lastRowsChild = (!rtp) ? el_target.querySelector('tbody tr:last-child') : el_target.querySelector('tbody tr:first-child')

                height_diff = (size.height - parseInt(height)) / this.state.config.cellSize
                let addRows = (height_diff > 0) ? Math.round(height_diff) : 0

                let latestRowID = parseInt(lastRowsChild.getAttribute('rows-id'))
                let lastColsCount = el_target.querySelectorAll('tbody tr:first-child td').length

                let rows = this.getNextAlphabet(latestRowID, addRows, false)
                let cols = this.getNextAlphabet(0, lastColsCount, false, true)

                let sequence = this.generateArrFixStart(latestRowID, addRows)
                let newCell = _.map(rows, (r, rIndex) => {  // BEFORE USE RUNNO IS R              
                    return createElement('tr', { 'rows-id': `${sequence[rIndex]}`, ref: `rows_${sequence[rIndex]}` }, this.createCell(cols, sequence[rIndex], el_name))
                })

                const element_target = el_target.querySelector('tbody')                
                const re_route = getRouteWithName(el_name, route)

                // DRAG HANDLE FOR GENERATE CELL WITH EVENT MOVE BOTTOM
                // CHECK POSITION ROUTE FROM TABLE TABLE
                if (re_route.position == 'top') {
                    if (newCell.length > 0) {
                        for (let i = 0; i < newCell.length; i++) {                            
                            element_target.prepend(newCell[i])                   
                        }
                    }                        
                } else {
                    if (newCell.length > 0) {
                        for (let i = 0; i < newCell.length; i++) { element_target.appendChild(newCell[i]) }
                    }                        
                }

                const rows_length = el_target.querySelectorAll('tbody tr').length
                let element_resize = this.state.config.cellSize * rows_length

                el_target.style.height = `${element_resize}px`
                el_target.style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.maxHeight = `${element_resize}px`
                el_target.setAttribute('originalHeight', element_resize)
            }

            if (in_array(route.position, ['left', 'right'])) {
                const firstColumn = el_target.querySelectorAll('tbody tr:first-child')[0]
                const latestRowsCount = el_target.querySelectorAll('tbody tr').length
                const latestDataID = (firstColumn.querySelectorAll('td:last-child').length > 0) ? (firstColumn.querySelectorAll('td:last-child')[0]).getAttribute('data-id') : 0
                const latestColumnID = parseInt(latestDataID)

                width_diff = (size.width - parseInt(width)) / this.state.config.cellSize
                let addColumns = (width_diff > 0) ? Math.round(width_diff) : 0
                let nextColumns = this.getNextAlphabet(latestColumnID, addColumns, false)

                let runno = 1
                let rtl = parseBool(el_target.querySelector('table').getAttribute('rtl'))
                let rtp = parseBool(el_target.querySelector('table').getAttribute('rtp'))
        
                // DRAG HANDLE FOR GENERATE CELL WITH EVENT MOVE RIGHT
                // CHECK POSITION ROUTE FROM TABLE TABLE
                if(rtl) {
                    let select_rows = el_target.querySelectorAll('tr')
                    if(rtp) {                       
                        _.forEachRight(select_rows, (rows, rIndex) => {
                            let createCell = this.createCell(nextColumns, runno, el_name)
                            for (let j = 0; j < createCell.length; j++) {
                                rows.appendChild(createCell[j])
                            }
                            runno++
                        })
                    } else {
                        _.forEach(select_rows, (rows, rIndex) => {
                            let createCell = this.createCell(nextColumns, runno, el_name)
                            for (let j = 0; j < createCell.length; j++) {
                                rows.appendChild(createCell[j])
                            }
                            runno++
                        })
                    }
                    
                } else if(rtp) {
                    for (let i = latestRowsCount - 1; i >= 0; i--) {
                        let select_rows = el_target.querySelectorAll('tr')[i]                        
                        let createCell = this.createCell(nextColumns, runno, el_name)    
                        for (let j = 0; j < createCell.length; j++) {
                            select_rows.appendChild(createCell[j])
                        }
                        runno++
                    }
                } else {
                    for (let i = 0; i < latestRowsCount; i++) {
                        let select_rows = el_target.querySelectorAll('tr')[i]                        
                        let createCell = this.createCell(nextColumns, runno, el_name)    
                        for (let j = 0; j < createCell.length; j++) {
                            select_rows.appendChild(createCell[j])
                        }
                        runno++
                    }                    
                }

                const td_length = el_target.querySelectorAll('tbody tr:first-child td').length
                let element_resize = this.state.config.cellSize * td_length

                el_target.style.width = `${element_resize}px`
                el_target.style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.maxWidth = `${element_resize}px`
                el_target.setAttribute('originalWidth', element_resize)
            }

            $(el_target).find('td').on('dblclick', (event) => {
                const cell = $(event.target).parent()
                if (in_array(cls['cell_active'], cell[0].classList)) {
                    this.handleProfileModal(cell, el_name)
                }
            })

        } 
        
        // FOR REMOVE CELL
        if (size.width < width || size.height < height) {                  
            // DECLARE ELEMENT INSTANT FOR HANDLE
            const table_target = el_target.querySelector('table')

            // FOR EVNET MOVE RIGHT/LEFT HANDLER BY POSITION
            if (in_array(route.position, ['left', 'right'])) {
                // SET DEFAULT VARIABLE 
                let width_diff = 0
                let calNewCols = 0

                // CALCULATE WIDTH FOR FIND COUNT SIZE DIFFERENT AND REMOVE COLS
                // CHECK VARIABLE AND ROUND DECIMAL
                width_diff = (width - numValid(size.width)) / this.state.config.cellSize     
                calNewCols = roundFixed(width_diff, 0)

                // VARIABLE VERIFY AND LOOP REMOVE COLS
                if (calNewCols > 0) {
                    _.forEach(this.generateArr(calNewCols), (v, i) => {
                        $(table_target).find('tbody tr td:last-child').remove()
                    })
                }

                // SET A TABLE TO NEW CURRENT SIZE
                const td_length = table_target.querySelectorAll('tbody tr:first-child td').length
                let element_resize = this.state.config.cellSize * numValid(td_length)

                el_target.style.width = `${element_resize}px`
                el_target.style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.maxWidth = `${element_resize}px`
                el_target.setAttribute('originalWidth', element_resize)
            }
        
            // THE PATTERN SAME TO TOP COMMENT
            if (in_array(route.position, ['top', 'bottom'])) {
                let height_diff = 0
                let calNewRow = 0

                let rtp = parseBool(el_target.querySelector('table').getAttribute('rtp'))

                const lastRowsChild = (!rtp) ? el_target.querySelector('tbody tr:last-child') : el_target.querySelector('tbody tr:first-child')

                height_diff = (parseInt(height) - numValid(size.height)) / this.state.config.cellSize
                calNewRow = roundFixed(height_diff, 0)

                if (calNewRow > 0) {
                    _.forEach(this.generateArr(calNewRow), (v, i) => {
                        $(table_target).find('tbody tr:last-child').remove()
                    })
                }

                const rows_length = table_target.querySelectorAll('tbody tr').length
                let element_resize = this.state.config.cellSize * numValid(rows_length)

                el_target.style.height = `${element_resize}px`
                el_target.style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.maxHeight = `${element_resize}px`
                el_target.setAttribute('originalHeight', element_resize)
            }
 
        }

        // BINDING DRAG TO ELEMENT TARGET
        this.onBindEventDragToCell(el_target)
        return true
    }

    // CELL STATE BUNDLE HANDLER 
    // ASSIGNMENT HANDLE
    createCellAssignment = (cellItems) => {
        if (cellItems && cellItems.length > 0) {
            // INCLUDE STATE OF MODAL (IS PREVIEW MODE OF MODAL)
            const { preview_bigscale_modal } = this.state.visible

            // CHECK ARE CUSTOMER LIST WITH REFERENCE NO AND FIND THE ELEMENT IN LAYOUTS
            _.forEach(cellItems, (v) => {
                // CHECK PREVIEW OR CREATE MODE FOR SET THE EVENT OF FINDING ELEMENTS
                let element_cell = (parseBool(preview_bigscale_modal)) ? $(`#grid_previews`).find(`td[ref="${v.ColumnCell}"]`) : $(`td[ref="${v.ColumnCell}"]`)
                // IF ELEMENT IS IN THE LAYOUTS
                if (element_cell) {
                    // ADD ARE CUSTOMER LIST TO CELL AND SET STATUS
                    this.handleInterfaceField(element_cell, v)                   
                }
            })
        }
    }

    // ASSIGNMENT INTERFACE OF ASSIGMENT HANDLE
    handleInterfaceField = (element_cell, data) => {
        const { mktCustomers } = this.state

        // FIND CUSTOMER INFORMATION BY APPLICATION NO
        let findCustomer = _.filter(mktCustomers, { ApplicationNo: data.ApplicationNo })

        let cell_header = this.checkCellOnhand(findCustomer)

        // GET RELATION DATA FOR SET CRITERIA OF ELEMENTS
        let onhand_item = (findCustomer[0] && findCustomer[0].OnHandStatus) ? findCustomer[0].OnHandStatus : ''
        let bucket_item = (findCustomer[0] && findCustomer[0].Cust_DPDBucketNow) ? findCustomer[0].Cust_DPDBucketNow : ''
        let status_item = (findCustomer[0] && findCustomer[0].StatusDigit) ? findCustomer[0].StatusDigit : ''

        let status_reanson = (findCustomer[0] && findCustomer[0].Status) ? findCustomer[0].Status : null
        let principle_item = (findCustomer[0] && findCustomer[0].Principle) ? findCustomer[0].Principle : null

        let acc_close = (principle_item && principle_item > 0) ? 'N' : 'Y'
        let check_status = (status_reanson == 'Approved' && acc_close == 'Y') ? 'E' : status_item

        let str_title = (status_item == 'W') ? status_reanson:''

        // GET TEXT OF ELEMENT FOR BACK UP
        const text_content = element_cell.attr('ref')
    
        // FIND ARE ELEMENT TARGET AND CUSTOMIZE NEW CONTENT 
        element_cell.find(`div.${cls['cell']}`).html(
            '<div class="' + cls['cell_inside_header'] + '" title="' + str_title + '">' + cell_header + '</div>' +
            '<div class="' + cls['cell_inside_bottom'] + '">' + text_content + '</div>'
        )

        // FIND ARE ELEMENT TARGET AND BINDING EVENT TO CELL IN CONTENT (EVENT IS SHOW THE CUSTOMER PROFILE AT MODAL)
        element_cell.find(`div.${cls['cell']}`).find(`.${cls['cell_inside_header']}, .${cls['cell_inside_bottom']}`).on('dblclick', (event) => {
            const cell = $(event.target).parent().parent()
            if (in_array(cls['cell_active'], cell[0].classList)) {
                this.handleProfileModal(cell)
            }
        })

        // SET RELATION ATTRIBUTE FOR CATCH DATA PROPERTY TO SIDEBAR, FOR PORTFOLIO SUMMARY AND ETC
        element_cell.attr({
            'data-attr': data.ApplicationNo,
            'data-reserv': true,
            'data-onhand': onhand_item,
            'data-status': check_status,
            'data-bucket': (check_status && check_status == 'E') ? '' : bucket_item
        })
        .addClass(cls['cell_active'])
        .after(() => {
            if (data.Subject) {
                $(
                    createElement('div', { 'class': `${cls['triangle-up-right']} ${cls['tooltip']}` },
                        createElement('div', { 'class': `${cls['tooltip_container']}` },
                            (_.map([data.Subject, data.Remark], (data) => { return createElement('p', {}, data) }))
                        )
                    )
                ).appendTo(element_cell.find(`div.${cls['cell']}`))
            }
        })

    }

    // ASSIGNMENT HANDLE: CUSTOMER ADDITIONAL BUNDLE
    setAdditionBundle = (cust_addtion, el_preview = null) => {
        const { mktCustomers } = this.state
        let master_assignlist = (mktCustomers && mktCustomers.length > 0) ? mktCustomers : []

        const bindEventTag = 'data-event-dblclick="false" data-event-mouseover="false"'

        _.forEach(cust_addtion, (v, i) => {
            let results = _.filter(master_assignlist, { 'ApplicationNo': v.ApplicationNo })[0]
            let assignClass = this.onChangeStateCell(results)

            let onhand_item = (results && results.OnHandStatus) ? results.OnHandStatus : ''
            let bucket_item = (results && results.Cust_DPDBucketNow) ? results.Cust_DPDBucketNow : ''
            let status_item = (results && results.StatusDigit) ? results.StatusDigit : ''
    
            let status_reanson = (results && results.Status) ? results.Status : null
            let principle_item = (results && results.Principle) ? results.Principle : null
    
            let acc_close = (principle_item && principle_item > 0) ? 'N' : 'Y'
            let check_status = (status_reanson == 'Approved' && acc_close == 'Y') ? 'E' : status_item

            let tag_attr = `data-reserv="true" data-onhand="${onhand_item}" data-status="${check_status}" data-bucket="${(check_status && check_status == 'E') ? '' : bucket_item}"`

            let str_title = (status_item == 'W') ? status_reanson:''

            let element_cell = (el_preview) ? $(el_preview).find(`td[ref="${v.ColumnCell}"]`) : $(`td[ref="${v.ColumnCell}"]`)
            if (element_cell.length > 0) {
                let element_addition = $(element_cell).find(`div.${cls['inside_container']}`).length
                if (element_addition == 0) {
                    let cell_appno_primary = element_cell.attr('data-attr')
                    const text_content = $(element_cell).find(`div.${cls['cell']} > div.${cls['cell_inside_bottom']}`).text()
                    
                    element_cell.find(`div.${cls['cell']}`).empty()
                    .html(
                        '<div class="' + cls['cell_inside_header'] + '" style="padding-top: 0px;">' +
                        '<div class="' + cls['inside_container'] + '">' +
                            '<div title="' + str_title + '" class="' + cls['inside_divide'] + '" data-attr="' + cell_appno_primary + '" data-ref="' + text_content + '" ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>' +
                            '<div title="' + str_title + '" class="' + cls['inside_divide'] + ' countable ' + assignClass + '" data-attr="' + v.ApplicationNo + '" data-ref="' + text_content + '" ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="' + cls['cell_inside_bottom'] + ' ' + cls['divide'] + '" data-event-mouseover="false">' + text_content + '</div>'
                    )

                } else {
                    const text_content = $(element_cell).find(`div.${cls['cell']} > div.${cls['cell_inside_bottom']}`).text()

                    element_cell.find(`div.${cls['inside_container']}`)
                    .append('<div title="' + str_title + '" class="' + cls['inside_divide'] + ' countable ' + assignClass + '" data-attr="' + v.ApplicationNo + '" data-ref="' + text_content + '" ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>')
                }           
            }
        })

        this.handleSetEventCellAddition()
    }

    handleSetEventCellAddition = () => {
        let cell_divide = document.querySelectorAll(`.${cls['inside_divide']}`)
        if(cell_divide && cell_divide.length > 0) {            
            _.forEach(cell_divide, (v) => {
                if(v.getAttribute('data-event-dblclick') == 'false') {
                    v.addEventListener("dblclick", (e) => {
                        e.target.setAttribute('data-event-dblclick', 'true')
                        this.handleProfileModal($(e.target))
                    })
                }

                if(v.getAttribute('data-event-mouseover') == 'false') {
                    v.addEventListener("mouseover", (e) => {
                        const element_target = e.target
                        element_target.setAttribute('data-event-mouseover', 'true')
                        this.handleExtension(element_target, 'single')
                    })
                }
            })
        }

        let cell_divide_bottom = document.querySelectorAll(`.${cls['cell_inside_bottom']}.${cls['divide']}`)
        if(cell_divide_bottom && cell_divide_bottom.length > 0) {        
            _.forEach(cell_divide_bottom, (v) => {
                if(v.getAttribute('data-event-mouseover') == 'false') {
                    v.addEventListener("mouseover", (e) => {
                        e.target.setAttribute('data-event-mouseover', 'true')
                        
                        const element_target = e.target.parentElement
                        this.handleExtension(element_target.querySelectorAll(`.${cls['inside_divide']}`), 'multi')
                    })
                }
            })
        }
    }

    // SET CUSTOMER STATUS TO ELEMENT CELL IN LAYOUTS
    checkCellOnhand = (findCustomer) => {
        const { bktFullNotRisks } = this.state.config

        // GET LATEST STATUS OF CUSTOMER (STATUS IS DIGIT TYPE)
        let appStatus = (findCustomer && findCustomer[0]) ? findCustomer[0].StatusDigit : null
       
        // CHECK WAS CUSTOMER HAS CLOSED ACCOUNT
        const status = (findCustomer && findCustomer[0]) ? findCustomer[0].Status : null
        let principle = (findCustomer && findCustomer[0]) ? findCustomer[0].Principle : null
        let acc_close = (principle && principle > 0) ? 'N' : 'Y'

        // CHECK WAS CUSTOMER HAS THE TOP UP LOAN
        let topup = (findCustomer && findCustomer[0]) ? findCustomer[0].IsTopUp : null
        let isTopUp = (topup == 'A') ? 'TOP UP' : ''

        // SET RISK STATUS OF BUCKET WILL BE TO NPL (TRUE OR FALSE)
        let isRisks = false

        // GET CURRENT BUCKET
        let bucket = (findCustomer && findCustomer[0]) ? findCustomer[0].Cust_DPDBucketNow : null

        if (bucket) {
            if (!in_array(bucket, bktFullNotRisks)) {
                isRisks = true
            }
        } else {
            isRisks = false
        }

        // CHECK ARE CUSTOMER HAS BE CLOSE ACCOUNT YET?
        let cell_header = ''
        if (status == 'Approved' && acc_close == 'Y') {
            cell_header = 'END'

        } else {
            // CHECK IS DATA CRITERIA
            if (in_array(appStatus, ['A'])) {
                if (!isRisks) {
                    if (bucket == 'W0') {
                        cell_header = (findCustomer && findCustomer[0]) ? parseNumberShort(findCustomer[0].Principle) : ''
                    } else {
                        cell_header = (bucket && bucket !== '') ? bucket : ''
                    }
                } else {
                    if (isRisks) {
                        cell_header = (bucket && bucket !== '') ? bucket : ''
                    } else if (topup) {
                        cell_header = isTopUp
                    }
                }
            }
            else if (in_array(appStatus, ['C', 'R'])) {
                if (appStatus == 'C')
                    cell_header = 'CAN'
                else
                    cell_header = 'REJ'
            }
            else {
                if (isRisks) {
                    cell_header = (bucket && bucket !== '') ? bucket : ''
                } 
                else if (appStatus == 'W') {
                    cell_header = 'WAIT'
                } 
                else {
                    let on_hand = (findCustomer && findCustomer[0]) ? findCustomer[0].OnHandStatus : null
                    if (on_hand) {
                        cell_header = on_hand
                    }
                }
            }
        }

        return cell_header

    }

    // SET CUSTOMER STATUS TO ELEMENT CELL IN LAYOUTS, WILL BE USE HAVE STATUS CHANGE
    onChangeStateCell = (result) => {
        const { bktFullNotRisks } = this.state.config
        
        if (result) {
            const current_bucket = (result.Cust_DPDBucketNow) ? result.Cust_DPDBucketNow : null
            const principle = (result.Principle) ? result.Principle : null
            const status = (result.Status) ? result.Status : null
            let acc_close = (principle && principle > 0) ? 'N' : 'Y'

            if (status == 'Approved' && acc_close == 'Y') {
                return `${cls['cell_active']} ${cls['cell_closeacc']}`

            } else {
                if (in_array(result.StatusDigit, ['A'])) {
                    if (!in_array(current_bucket, bktFullNotRisks))
                        return `${cls['cell_active']} ${cls['cell_overdue']}`
                    else
                        return cls['cell_active']

                } else if (in_array(result.StatusDigit, ['C', 'R'])) {
                    return `${cls['cell_active']} ${cls['cell_reject']}`

                } else if(result.StatusDigit == 'W' && in_array(current_bucket, bktFullNotRisks)) {
                    return `${cls['cell_active']} ${cls['cell_draft']}`
                } else {
                    if (!in_array(current_bucket, bktFullNotRisks) && current_bucket)
                        return `${cls['cell_active']} ${cls['cell_overdue']}`
                    else
                        return `${cls['cell_active']} ${cls['cell_onhand']}`
                }
            }

        } else {
            return `${cls['cell_active']} ${cls['cell_onhand']}`
        }
    }

    // SET ROUTER ATTRIBUTE
    routeHelper = (el) => {
        if (in_array('ui-resizable-n', el.classList)) {
            return { 'position': 'top', 'type': 'rows' }
        }
        else if (in_array('ui-resizable-e', el.classList)) {
            return { 'position': 'right', 'type': 'cols' }
        }
        else if (in_array('ui-resizable-s', el.classList)) {
            return { 'position': 'bottom', 'type': 'rows' }
        }
        else if (in_array('ui-resizable-w', el.classList)) {
            return { 'position': 'left', 'type': 'cols' }
        }
        else { return {} }
    }

    // DEFINE IDENTITY OF THE ELEMENT FOR SET IS DIRECTION ROUTER
    routeIDHelper = (id) => {
        if (in_array(id, ['outside_topleft_zone', 'outside_topleft_zone_previews'])) {
            return [{ 'position': 'top', 'type': 'rows' }, { 'position': 'left', 'type': 'cols' }]
        }
        else if (in_array(id, ['outside_topcenter_zone', 'outside_topcenter_zone_previews'])) {
            return [{ 'position': 'top', 'type': 'rows' }, { 'position': 'right', 'type': 'cols' }]
        }

        else if (in_array(id, ['outside_left_zone', 'outside_left_zone_previews'])) {
            return [{ 'position': 'bottom', 'type': 'rows' }, { 'position': 'left', 'type': 'cols' }]
        }
        else if (in_array(id, ['mainside_central_zone', 'mainside_central_zone_previews'])) {
            return [{ 'position': 'bottom', 'type': 'rows' }, { 'position': 'right', 'type': 'cols' }]
        }
        else { return {} }
    }

    // MERGE CELL FUNCTIONAL
    onBindEventDragToCell = (el_target) => {
        const isPreview = parseBool(this.state.visible.preview_bigscale_modal)

        if (!isPreview) {
            let cell_start = null,
                isMouseDown = false,
                startRowIndex = null,
                startCellIndex = null,
                dragRowIndex = null,
                dragCellIndex = null,
                isHighlighted = false

            const table = $(el_target)
            table.find("td").mousedown(function (e) {
                if (e.which === 1) {
                    isMouseDown = true
                    cell_start = $(this)

                    table.find(`td.${cls["highlighted"]}`).removeClass(cls["highlighted"])

                    if (e.shiftKey) { selectCellTo(cell_start) }
                    else {
                        cell_start.addClass(cls["highlighted"])
                        startCellIndex = cell_start.index()
                        startRowIndex = cell_start.parent().index()
                    }

                    return false

                }
            })
            .mouseover(function (e) {
                if (e.which === 1) {
                    if (!isMouseDown) return
                    table.find(`td.${cls["highlighted"]}`).removeClass(cls["highlighted"])
                    selectCellTo($(this))
                }

            })
            .bind("selectstart", () => { return false })

            $(document).mouseup(() => {
                this.handleStartWithCellEnd(cell_start, startRowIndex, startCellIndex, dragRowIndex, dragCellIndex)
                isMouseDown = false
            })

            function selectCellTo(cell) {
                let row = cell.parent()
                let cellIndex = cell.index()
                let rowIndex = row.index()

                dragRowIndex = row.index()
                dragCellIndex = cell.index()

                let rowStart,
                    rowEnd,
                    cellStart,
                    cellEnd

                if (rowIndex < startRowIndex) {
                    rowStart = rowIndex
                    rowEnd = startRowIndex
                } else {
                    rowStart = startRowIndex
                    rowEnd = rowIndex
                }

                if (cellIndex < startCellIndex) {
                    cellStart = cellIndex
                    cellEnd = startCellIndex
                } else {
                    cellStart = startCellIndex
                    cellEnd = cellIndex
                }

                for (var i = rowStart; i <= rowEnd; i++) {
                    var rowCells = table.find("tr").eq(i).find("td")
                    for (var j = cellStart; j <= cellEnd; j++) {
                        rowCells.eq(j).addClass(cls["highlighted"])
                    }
                }

            }
        }

    }

    // MERGE WAS CELL HAS HIGHTLIGHT
    onMergeCellSelected = (tableTargetHandle) => {
        const { cellStartHandler, startRowIndex, startCellIndex, rowsCount, colsCount } = this.state

        const table = tableTargetHandle
        const startNodeTarget = $(cellStartHandler).attr('ref')

        const StartRows = startRowIndex
        const StartCols = startCellIndex
        const Curr_Rows = rowsCount
        const Curr_Cols = colsCount

        if (typeof StartRows !== undefined) {
            let Rowspan = Curr_Rows - StartRows + 1
            let Colspan = Curr_Cols - StartCols + 1

            const rowsTarget = table.find('tr').eq(StartRows)
            const cellTargetStart = $("td", rowsTarget).eq(StartCols).addClass(cls['cell_root_merge'])

            if (Colspan >= 2)
                cellTargetStart.attr("colspan", Colspan)

            if (Rowspan >= 2)
                cellTargetStart.attr("rowspan", Rowspan)

            for (var i = StartRows; i <= Curr_Rows; i++) {
                for (var j = StartCols; j <= Curr_Cols; j++) {
                    let SelectTR = table.find('tr').eq(i)

                    if (startNodeTarget === $("td", SelectTR).eq(j).attr('ref')) {
                        continue
                    } else {
                        $("td", SelectTR).eq(j).attr('data-root-merge', startNodeTarget).addClass(cls['cell_child_merge'])
                    }
                }
            }

            table.find(`td.${cls["highlighted"]}`).removeClass(cls["highlighted"])
        }

    }

    // MERGE COMPONENT
    // HANDLE DESC: RESTRUCTURE CELL ARE SELECTED TO BE ONE CELL
    restructCell = (objElement) => {
        const parent_table = objElement.offsetParent()

        let cell_fields = []
        let cell_selected = document.querySelectorAll(`.${cls["highlighted"]}`)

        if (cell_selected && cell_selected.length > 0) {
            _.forEach(cell_selected, (v, i) => {
                cell_fields.push(v.getAttribute('ref'))
            })
        }

        if (cell_fields && cell_fields.length > 0) {
            this.onMergeCellSelected(parent_table)
        }
    }

    // RESTORE CELL
    // HANDLE DESC: REMOVE RESTRUCTURE CELL HANDLE TO NORMAL CELL
    restoreCell = (objElement) => {
        const startNodeTarget = objElement.attr('ref')
        objElement.removeAttr('colspan')
        objElement.removeAttr('rowspan')
        objElement.removeClass(cls['cell_root_merge'])
        $(`td[data-root-merge="${startNodeTarget}"]`).removeClass(cls['cell_child_merge'])
    }

    cellSplitGeneration = (elem, spanno) => {
        const { splitMode } = this.state

        if (elem) {
            const td = elem.find(`.${cls['split_wrapper']}`)
            const refno = elem.attr('ref')

            if (td.length == 0) {
                elem.html(
                    createElement('div', { 'class': cls['split_wrapper'] },
                        createElement('div', { 'class': cls['split_body'] })
                    )
                )
            }

            if (splitMode.mode == 'cols') {

                const tr = elem.find(`.${cls['split_rows']}`)
                if (tr.length == 0) {
                    elem.find(`.${cls['split_body']}`).html(createElement('div', { 'class': cls['split_rows'] }))
                }

                _.forEach(this.generateArr(spanno), (v, i) => {
                    elem.find(`div.${cls['split_rows']}`)
                        .append(
                        createElement('div', { 'class': `${cls['split_cell']}` },
                            createElement('div', { 'class': cls['cell'] },
                                _.map([refno, (i + 1)], (v, i) => {
                                    return (i == 0) ?
                                        createElement('div', { 'class': cls['cell_inside_header'] }, '') :
                                        createElement('div', { 'class': cls['cell_inside_bottom'] }, `${refno}-${v}`)
                                })
                            )
                        )
                        )
                })
            }
            else if (splitMode.mode == 'rows') {
                _.forEach(this.generateArr(spanno), (v, i) => {
                    elem.find(`div.${cls['split_body']}`)
                        .append(
                        createElement('div', { 'class': cls['split_rows'] },
                            createElement('div', { 'class': `${cls['split_cell']} ${cls['bn']}` },
                                createElement('div', { 'class': cls['cell'] },
                                    _.map([refno, (i + 1)], (v, i) => {
                                        return (i == 0) ?
                                            createElement('div', { 'class': `${cls['cell_inside_header']} ${cls['pt0']}` }, '') :
                                            createElement('div', { 'class': `${cls['cell_inside_bottom']} ${cls['pt0']}` }, `${refno}-${v}`)
                                    })
                                )
                            )
                        )
                        )
                })
            } else if (splitMode.mode == 'table') {
                const cols_tmp = this.generateArr(spanno[0])
                const rows_tmp = this.generateArr(spanno[1])

                _.forEach(rows_tmp, (rVal, rIndex) => {
                    let rows_content = createElement('div', { 'class': cls['split_rows'] },
                        _.map(cols_tmp, (cVal, cIndex) => {
                            return (
                                createElement('div', { 'class': `${cls['split_cell']}` },
                                    createElement('div', { 'class': cls['cell'] },
                                        _.map([refno, (cIndex + 1)], (v, cIndex) => {
                                            return (cIndex == 0) ?
                                                createElement('div', { 'class': cls['cell_inside_header'] }, '') :
                                                createElement('div', { 'class': cls['cell_inside_bottom'] }, `${refno}-${rIndex + 1}/${v}`)
                                        })
                                    )
                                )
                            )
                        })
                    )
                    elem.find(`div.${cls['split_body']}`).append(rows_content)
                })

            }
        }

        $('table').find(`td.${cls["highlighted"]}`).removeClass(cls["highlighted"])
    }

    cellSplitType = (rows, cols) => {
        if (rows > 1 && cols > 1) {
            return 'table'
        }
        else if (rows > 1 && cols == 1) {
            return 'rows'
        }
        else if (cols > 1 && rows == 1) {
            return 'cols'
        }
    }

    // CONTEXT MENU FOR ASSIGNMENT MODAL
    contextCellAssign = () => {
        $.contextMenu({
            selector: '.context-cell-menu',
            callback: (key, options) => {
                var objElement = $(options.$trigger)
                if (key == 'assign') {
                    let cell_selected = document.querySelectorAll(`.${cls['highlighted']}`)
                    if (cell_selected && cell_selected.length >= 2) {
                        $('.context-cell-menu').removeClass(cls['highlighted']).after(() => {
                            $(objElement).addClass(cls['highlighted'])
                        })
                    }
                    this.handleAssignModal(objElement, 'NEW')
                }
                else if (key == 'additionassign') {
                    this.handleAssignModal(objElement, 'ADDITION')
                }
                else if (key == 'decreasecust') {
                    let element_info = {
                        mode: null,
                        spanlen: 0,
                        offset: objElement.offset(),
                        elem: objElement
                    }
                    this.handleDecreaseAdditional(element_info)
                }
                else if (key == 'extendscale') {
                    let cell_primary = []
                    let cell_parents = []
                    let cell_extends = []
                    let cell_selected = document.querySelectorAll(`.${cls['highlighted']}`)
                    if (cell_selected && cell_selected.length > 0) {
                        _.forEach(cell_selected, (objEl, i) => {
                            if (in_array(cls['cell_active'], objEl.classList) || in_array(cls['cell_extended'], objEl.classList)) {
                                let data_code = (in_array(cls['cell_active'], objEl.classList)) ? objEl.getAttribute('ref') : objEl.getAttribute('data-columns-connect')
                                cell_parents.push(data_code)
                                cell_primary.push('TRUE')
                            } else {
                                cell_extends.push($(objEl).attr('ref'))
                                cell_primary.push('FALSE')
                            }
                        })

                        // SEND DATA TO EXTENDS CELL
                        if (in_array('TRUE', cell_primary)) {
                            confirm({
                                title: 'กรุณายืนยันการขยายขอบเขตข้อมูล',
                                content: `กรุณาตรวจสอบความถูกต้องของการขยายขอบเขตข้อมูล โดยข้อมูลที่จะผูกกับเซลล์หลัก คือ ${cell_extends.join()} ไปผูกกับเซลล์หลัก คือ ${cell_parents.join()} กรณีข้อมูลถูกต้องโปรดกดยืนยัน`,
                                onOk: () => { this.createCellAssignmentExtendedScale(cell_selected) },
                                onCancel: () => { },
                            })
                        }
                        else {
                            notification.warning({
                                message: 'แจ้งเตือนจากระบบ',
                                description: 'การขยายขอบเขตข้อมูลไม่ถูกต้อง กรุณาตรวจสอบการลากเซลล์ใหม่อีกครั้ง โดยการลากควรเริ่มจากฟิลด์ที่มีการบันทึกข้อมูลลูกค้า ไปถึงฟิลด์ปลายทาง',
                                duration: 8
                            })
                        }
                    }
                }
                else if (key == "tools_merge_cell") {
                    this.restructCell(objElement)
                }
                else if (key == "tools_unmerge_cell") {
                    this.restoreCell(objElement)
                }
                else if (key == "tools_split_column_cell") {
                    const rows_attr = objElement.attr('rowspan')
                    const cols_attr = objElement.attr('colspan')

                    const _rows = (rows_attr && rows_attr > 0) ? parseInt(rows_attr) : 1
                    const _cols = (cols_attr && cols_attr > 0) ? parseInt(cols_attr) : 1

                    let splitType = this.cellSplitType(_rows, _cols)
                    let splitMode = {
                        mode: splitType,
                        spanlen: (_cols && _cols > 1) ? _cols : _rows,
                        offset: objElement.offset(),
                        elem: objElement
                    }

                    switch (splitType) {
                        case 'table':
                            this.handlTableSelection(splitMode)
                            break
                        case 'rows':
                        case 'cols':
                            this.handlSplitCell(splitMode)
                            break
                    }

                }
                else if (key == 'potential') {
                    $('.context-cell-menu').removeClass(cls['highlighted']).after(() => { $(objElement).addClass(cls['highlighted']) })
                    this.handleCustPotential(objElement)
                }
                else if (key == 'profile') {
                    $('.context-cell-menu').removeClass(cls['highlighted']).after(() => { $(objElement).addClass(cls['highlighted']) })

                    if (in_array(cls['cell_active'], objElement[0].classList)) { 
                        this.handleProfileModal(objElement) 
                    }
                    else if(in_array(cls['cell_prospect'], objElement[0].classList)) { 
                        this.handleCustPotential(objElement, false)
                    }                    
                }
                else if (key == 'reset') {
                    $('.context-cell-menu').removeClass(cls['highlighted']).after(() => { $(objElement).addClass(cls['highlighted']) })
                    this.resetOwnerCell(objElement)
                }
            },
            items: {
                "profile": {
                    name: "ดูข้อมูลโปรไฟล์ลูกค้า (View Profile)",
                    icon: "fa-eye",
                    disabled: function (key, opt) {
                        var objElement = $(opt.$trigger)
                        if (in_array(cls['cell_active'], objElement[0].classList)) { return false }
                        else if(in_array(cls['cell_prospect'], objElement[0].classList)) { return false }
                        else { return true }
                    }
                },
                "sep1": "---------",
                "potential": {
                    name: "เพิ่มข้อมูลลูกค้าที่พบใหม่ในตลาด (Potential)",
                    icon: "fa-wpforms",
                    disabled: function (key, opt) {
                        var objElement = $(opt.$trigger)
                        if (in_array(cls['cell_active'], objElement[0].classList) ||
                            in_array(cls['cell_prospect'], objElement[0].classList) ||
                            in_array(cls['cell_extended'], objElement[0].classList) ||
                            in_array(cls['cell_root_merge'], objElement[0].classList)) { 
                            return true 
                        }
                        else { return false }
                    }
                },
                "sep2": "---------",
                "assign": {
                    name: "กำหนดข้อมูลลูกค้าลงในแผง (Cust. Assignment)",
                    icon: "fa-sign-in",
                    disabled: function (key, opt) {
                        var objElement = $(opt.$trigger)
                        if (in_array(cls['cell_active'], objElement[0].classList) ||
                            in_array(cls['cell_prospect'], objElement[0].classList) ||
                            in_array(cls['cell_extended'], objElement[0].classList) ||
                            in_array(cls['cell_root_merge'], objElement[0].classList)) {
                            return true
                        }
                        else {
                            if (!checkContextAssignmentAllow()) {
                                return true
                            }
                            return false
                        }
                    }
                },
                "sep3": "---------",
                "additional": {
                    name: "จัดการลูกค้าภายในแผง (Additional Management)",
                    icon: "fa-user-circle",
                    items: {
                        "additionassign": {
                            name: "เพิ่มข้อมูลลูกค้าในแผงเดิม (Additional Assignment)",
                            icon: "fa-user-plus",
                            disabled: function (key, opt) {
                                var objElement = $(opt.$trigger)
                                if (in_array(cls['cell_active'], objElement[0].classList)) {
                                    const check_element = objElement.find(`.${cls['inside_divide']}`).length
                                    if (check_element === 3) {
                                        return true
                                    }
                                    return false
                                } else {
                                    return true
                                }
                            }
                        },
                        "sep301": "---------",
                        "decreasecust": {
                            name: "ลบข้อมูลลูกค้าในแผงเดิม (Delete Customer)",
                            icon: "fa-user-times",
                            disabled: function (key, opt) {
                                var objElement = $(opt.$trigger)
                                if (in_array(cls['cell_active'], objElement[0].classList)) { 
                                    const check_element = objElement.find(`.${cls['inside_divide']}`).length
                                    if(check_element >= 2) {
                                        return false
                                    }
                                    return true 
                                } else {
                                    return true
                                }
                            }
                        },
                    },
                    disabled: function (key, opt) {
                        var objElement = $(opt.$trigger)
                        var cell_selected = document.querySelectorAll(`.${cls['highlighted']}`)
                        if (cell_selected && cell_selected.length > 1) {
                            return true
                        } else {
                            if (in_array(cls['cell_active'], objElement[0].classList)) {
                                return false
                            }
                            return true
                        }
                    }
                },
                "sep4": "---------",
                "extendscale": {
                    name: "เชื่อมต่อพื้นที่แผงลูกค้า (Extended Scale)",
                    icon: "fa-link",
                    disabled: function (key, opt) {
                        return checkContextAssignmentAllow()
                    }
                },
                "sep5": "---------",
                "tools": {
                    name: "จัดการข้อมูลตารางใหม่ (Table Mangement)",
                    icon: "fa-table",
                    items: {
                        "tools_split_column_cell": {
                            name: "แบ่งเซลล์ข้อมูล (Split Cell)",
                            icon: "fa-columns",
                            disabled: function (key, opt) {
                                var objElement = $(opt.$trigger)
                                if (in_array(cls['cell_root_merge'], objElement[0].classList)) {
                                    const check_element = objElement.find(`.${cls['split_wrapper']}`).length
                                    if (check_element >= 1) {
                                        return true
                                    }
                                    return false
                                }
                                else { return true }
                            }
                        },
                        "sep501": "---------",
                        "tools_merge_cell": {
                            name: "รวมเซลล์ (Merge)",
                            icon: "fa-table",
                            disabled: function (key, opt) {
                                let cell_primary = []
                                let cell_selected = document.querySelectorAll(`.${cls['highlighted']}`)

                                if (cell_selected && cell_selected.length >= 2) {
                                    _.forEach(cell_selected, (objEl, i) => {
                                        if (in_array(cls['cell_active'], objEl.classList)) {
                                            cell_primary.push('TRUE')
                                        }
                                        else if (in_array(cls['cell_extended'], objEl.classList)) {
                                            cell_primary.push('TRUE')
                                        }
                                        else if (in_array(cls['cell_root_merge'], objEl.classList)) {
                                            cell_primary.push('TRUE')
                                        }
                                        else if (in_array(cls['cell_prospect'], objEl.classList)) {
                                            cell_primary.push('TRUE')
                                        }
                                        else {
                                            cell_primary.push('FALSE')
                                        }
                                    })

                                    if (in_array('TRUE', cell_primary))
                                        return true
                                    else
                                        return false

                                } else {
                                    return true
                                }
                            }
                        },
                        "tools_unmerge_cell": {
                            name: "ยกเลิกการรวมเซลล์ (Unmerge)",
                            icon: "fa-eraser",
                            disabled: function (key, opt) {
                                var objElement = $(opt.$trigger)
                                if (in_array(cls['cell_root_merge'], objElement[0].classList)) { return false }
                                else { return true }
                            }
                        }
                    },
                    disabled: function (key, opt) {
                        return true
                        // var objElement = $(opt.$trigger)
                        // if (in_array(cls['cell_active'], objElement[0].classList) || in_array(cls['cell_extended'], objElement[0].classList) || in_array(cls['cell_prospect'], objElement[0].classList)) { return true }
                        // else { return false }
                    }
                },
                "sep6": "---------",
                "reset": {
                    name: "รีเซ็ตหรือล้างข้อมูลลูกค้า (Reset Error Assignment)",
                    icon: "fa-user-times",
                    disabled: function (key, opt) {
                        var objElement = $(opt.$trigger)
                        if (in_array(cls['cell_active'], objElement[0].classList) || in_array(cls['cell_extended'], objElement[0].classList) || in_array(cls['cell_prospect'], objElement[0].classList)) { return false }
                        else { return true }
                    }
                },
                "sep7": "---------",
                "quit": { name: "ปิดเมนู (Close)", icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; } }
            }
        })
        
        
        function checkContextAssignmentAllow() {
            let cell_primary = []
            let cell_selected = document.querySelectorAll(`.${cls['highlighted']}`)

            if (cell_selected && cell_selected.length >= 2) {
                _.forEach(cell_selected, (objEl, i) => {
                    if (in_array(cls['cell_active'], objEl.classList)) {
                        cell_primary.push('TRUE')
                    }
                    else if (in_array(cls['cell_extended'], objEl.classList)) {
                        cell_primary.push('TRUE')
                    }
                    else {
                        cell_primary.push('FALSE')
                    }
                })

                if (in_array('TRUE', cell_primary)) {
                    let check_active = _.filter(cell_primary, function (o) { return o == 'TRUE' })
                    if (check_active && check_active.length > 1) {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return true
                }

            } else {
                return true
            }
        }
    }

    contextObjectHandle = (id) => {
        const { elements } = this.state
        const { Auth } = this.state.authen
       
        if(!elements.context) {
            const market_code = this.state.mktcode
            let element_name = `#${id}`

            // ELEMENT ARE WRAPPER WITH CONTEXT MENU
            $.contextMenu({
                selector: element_name,
                callback: (key, options) => {
                    const element_target = $(element_name)
                    if (key == 'edit') {
                        let objEl = $(options.$trigger)
                        let content = objEl.text();

                        element_target.html(`<input id="input_layout_empty" class="${cls['input_title_handle']}" value="${content}" autofocus  />`)
                        .after((ev) => {
                            $('#input_layout_empty').focus()
                            document.querySelector('#input_layout_empty').addEventListener('keypress', (e) => {
                                var key = e.which || e.keyCode;
                                if (key === 13) {
                                    let new_content = (e.target) ? e.target.value : ''

                                    element_target.html(new_content)
                                    element_target.attr('title', new_content)

                                    let str_text = new_content.length
                                    let total_str_total = roundFixed((str_width * str_text), 0)

                                    // SET TEXT AUTO ROTATION
                                    if (element_target.length > 0) {
                                        this.setTextAutoRoation($(`#${id}`), total_str_total)
                                    }
                                }
                            })
                        })

                    }
                    else if (key == 'delete') {
                        const el_target = $(options.$trigger).parent()
                        confirm({
                            title: 'ยืนยันการลบไอเทม',
                            content: 'กรุณายืนยันการลบข้อมูล หากต้องการลบข้อมูลกด OK',
                            onOk() {
                                if (parseBool(el_target.data('new'))) {
                                    el_target.remove()
                                } else {
                                    removeBoxItem(el_target, market_code, Auth)
                                }
                            },
                            onCancel() { }
                        })
                    }

                },
                items: {
                    "edit": { name: "แก้ไขข้อมูล (Edit)", icon: "edit" },
                    "sep1": "---------",
                    "delete": { name: "ลบวัตถุ (Delete)", icon: "delete" },
                    "sep2": "---------",
                    "quit": { name: "ปิดเมนู (Close)", icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; } }
                }
            })

        }

    }

    // GENERATION ARRAY FROM NUMBER
    generateArr = (len) => {
        let index = 1,
            array = []

        for (let i = 0; i < len; i++) {
            array.push(index)
            index++
        }
        return array
    }

    generateArrFixStart = (start, len) => {
        let index = start,
            array = []

        for (let i = start; i < (start + len); i++) {
            ++index
            array.push(index)
            
        }
        return array
    }

    // GENERATE CHAR CODE FOR REFERENACE CHARECTER
    generateChar = (codePt) => {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        }
        return String.fromCharCode(codePt);
    }

    // CONVERT CHARECTER TO INDEX NUMBER OF CHARECTER
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

    // CONVERT INDEX NUMBER TO CHARECTER
    getCharByNumber = (number) => {
        let numeric = (number - 1) % 26
        let letter = this.generateChar(65 + numeric)
        let number2 = parseInt((number - 1) / 26)

        if (number2 && number2 > 0)
            return this.getCharByNumber(number2) + letter
        else
            return letter
    }

    // GET NEXT CHARECTER 
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

    // DOUBLE CHARECTER GENERATE
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

    // LOCAL STORE HANDLE
    // SAVE DATA INTO STORAGE
    localStorageWrite = (parent_key, key, value) => {
        if (global.localStorage) {
            global.localStorage.setItem(`${parent_key}`, JSON.stringify({ [key]: value }))
        }
    }

    // GET DATA FROM STORAGE
    localStorageRead = (parent_key, key) => {
        let ls = {}
        if (global.localStorage) {
            try {
                ls = JSON.parse(global.localStorage.getItem(`${parent_key}`)) || {}
            } catch (e) { }
        }
        return ls[key]
    }

    // CLEAR DATA IN STORAGE
    localStorageClear = () => {
        if (global.localStorage) {     
            global.localStorage.removeItem("nanolayout")
            global.localStorage.removeItem("localStorageWrite")
            global.localStorage.removeItem("nanolayout_creation")
            global.localStorage.removeItem("nanolayout_objectbox")
            //global.localStorage.clear()
        }
    }

    // FETCH API
    handleMarketCustomerListFilter = (filter) => {
        let condition = {}
        if (filter.app_input) {
            switch (filter.app_handle) {
                case 'cif':
                    condition = { 'CIFNO': parseInt(filter.app_input) }
                    break;
                case 'appno':
                    condition = { 'ApplicationNo': filter.app_input }
                    break;
                case 'contactno':
                    condition = { 'ContactTel': filter.app_input }
                    break;
            }
        }

        const result = _.filter(this.state.mktCustomers, function (data) { return data.IsActive == `${filter.cust_isactive}` })
        this.setState({ assignItem: _.filter(result, condition) })
    }

    getResultHandler(master, valueStartsWith) {
        return this.searchWord(master, valueStartsWith)
    }

    searchWord(arr, searchKey) {
        return arr.filter(obj => Object.keys(obj).some(key => _.includes(obj[key], searchKey)))
    }

    // LOAD DATA LAYOUTS
    getGridLayout = (market_code) => {
        // SET HEADER FOR REST API
        const request_set = new Request(`${config.hostapi}/layouts/mktc/${market_code}/layouts`, {
            method: 'GET',
            cache: 'no-cache',
            header: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset="UTF-8";'
            })
        })

        fetch(request_set)
            .then(response => response.json())
            .then(resp => {

                // LOAD LAYOUTS TO LOCALSTORAGE
                this.localStorageWrite('nanolayout', 'layouts', resp.data)

                // THE LAYOUTS WAS FOUNDED IN DB
                if (resp.status) {
                    // STOP STATE OF FIRST CREATE AND LOAD PROGRESS, SET LAYOUT TO STATE
                    this.setState({ firstCreate: false, layouts: resp.data })

                    // INITIAL DATA FOR LAYOUT RENDER
                    this.getInitialLayout()

                    // IF OBJECT DATA HAS CREATED IN DATABASE WILL BE RENDER TO AREA MARKET AND SET REDERENCE NO TO OBJECT AND LOCAL STORAGE
                    if (resp.data.boxsname_activation && resp.data.boxsname_activation.length > 0) {
                        // FIND MAX REFERENCE OF OBJECT FOR SET LOCAL STORAGE, FOR SET NEXT OBJECT.
                        const maxKey = _.maxBy(resp.data.boxsname_activation, 'BoxInitial')
                        this.localStorageWrite('nanolayout_objectbox', 'ref', (parseInt(maxKey.BoxInitial) + 1))
                    }


                // THE LAYOUTS IS NOT FOUND IN DB    
                } else {

                    _.delay(() => {
                        // SET DEFAULT STATE OF LAYOUT FOR FIRST CREATION
                        this.setState({
                            progress: false,
                            firstCreate: true,
                            layouts: resp.data,
                            visible: _.assignIn({}, this.state.visible, { mktassign_modal: false })
                        })

                        // CREATE THE AREA OF MARKET
                        _.map(this.state.config.side, (el, i) => {
                            let element_zone = document.querySelector(`#${el}`)
                            this.createTable(element_zone, el)
                        })

                        // CLEAR STYLE FOR DISPLAY MARKET LAYOUTS
                        if (document.querySelector('#layout_content')) {
                            document.querySelector('#layout_content').removeAttribute('style')
                        }

                    }, 700)
                }
            })
            .catch(err => { console.log(`fetch error ${err}`) })
    }

    // CREATE POTENTIAL
    handleCreateCustPotential = (data) => {
        const { layouts, assignCell, firstCreatePotential } = this.state
        const { Auth } = this.state.authen

        const el_parent = assignCell.parents()[2]
        let request_data = {
            MarketCode: this.state.mktcode,
            LayoutID: el_parent.getAttribute('data-parent'),
            Data: data,
            isCreate: firstCreatePotential,
            RequestID: Auth.EmployeeCode,
            RequestName: stripname(Auth.EmpName_TH)
        }

        // Fetch
        const request_set = new Request(`${config.hostapi}/potential`, {
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
        .then(resp => {
            const respData = resp.data
            
            if(resp.status && resp.msg === 'unique') {
                notification.error({ message: 'แจ้งเตือนจากระบบ', description: 'บันทึกข้อมูลไม่สำเร็จ ตรวจสอบแล้วพบข้อมูลซ้ำในระบบ กรุณาตรวจสอบใหม่อีกครั้ง หากมีข้อสงสัยกรุณาติดต่อผู้ดูแลระบบ' })
            } else if(resp.status && resp.msg === 'failed' || !resp.status) {
                notification.error({ message: 'แจ้งเตือนจากระบบ', description: 'บันทึกข้อมูลไม่สำเร็จ เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาติดต่อผู้ดูแลระบบ'})
            } else if(resp.status && resp.msg === 'success') {
                notification.success({ message: 'แจ้งเตือนจากระบบ', description: 'ระบบดำเนินการบันทึกข้อมูลเสร็จสิ้น' })

                if(firstCreatePotential) {
                    layouts.customer_potential.push(respData)
                    this.handleSetPotentialOnCell(assignCell, respData)
                } else {
                    const { layouts } = this.state
                    let potentialDel = _.reject(layouts.customer_potential,  { CustomerName: respData.CustomerName, ColumnCell: respData.ColumnCell })  
                    layouts.customer_potential = potentialDel 
                    layouts.customer_potential.push(respData)
                }       

            }
            this.handleCustPotentialClose()
        })
        .catch(err => { console.log(`fetch error ${err}`) })
        
    }

    // CELL ASSIGNMENT
    handleCellAssignment = (appno) => {
        const { Auth } = this.state.authen
        const { mktCustomers, layouts, assignMode } = this.state

        if (this.state.assignCell) {
            const element_cell = this.state.assignCell[0]
            const columns_name = element_cell.getAttribute('ref')
            const el_parent = element_cell.parentElement.parentElement.parentElement

            let master_assignlist = (mktCustomers && mktCustomers.length > 0) ? mktCustomers : []
            let results = _.filter(master_assignlist, { 'ApplicationNo': appno })

            if (results[0]) {

                // Change cell onhand
                let cell_header = this.checkCellOnhand(results)
                let onhand_item = (results[0] && results[0].OnHandStatus) ? results[0].OnHandStatus : ''
                let bucket_item = (results[0] && results[0].Cust_DPDBucketNow) ? results[0].Cust_DPDBucketNow : ''
                let status_item = (results[0] && results[0].StatusDigit) ? results[0].StatusDigit : ''
                let status_full = (results[0] && results[0].Status) ? results[0].Status : ''

                confirm({
                    title: 'กรุณายืนยันการแอดข้อมูลลูกค้า',
                    content: 'ก่อนทำการบันทึกข้อมูลทุกครั้ง ควรตรวจสอบความถูกต้องของข้อมูลก่อนทำการบันทึกข้อมูล',
                    onOk: () => {

                        let request_data = {
                            marketCode: this.state.mktcode,
                            cif: (results[0].CIFNO) ? results[0].CIFNO : null,
                            citizenID: (results[0].CitizenID) ? results[0].CitizenID : null,
                            appno: appno,
                            customer: (results[0].AccountName) ? results[0].AccountName : null,
                            layoutID: el_parent.getAttribute('data-parent'),
                            columnCell: columns_name,
                            requestID: Auth.EmployeeCode,
                            requestName: stripname(Auth.EmpName_TH),
                            mode: assignMode
                        }

                        // Fetch
                        const request_set = new Request(`${config.hostapi}/assignment`, {
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
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'ดำเนินการบันทึกข้อมูลลูกค้าลงในแผงสำเร็จ'
                                    })

                                    let assignClass = this.onChangeStateCell(results[0])
                                    if (assignMode == 'NEW') {

                                        if (assignClass) {
                                            $(element_cell).addClass(assignClass)
                                        }

                                        let str_title = (status_item == 'W') ? status_full:''
                                        const text_content = $(element_cell).find(`div.${cls['cell']}`).text()

                                        $(element_cell).find(`div.${cls['cell']}`).html(
                                            '<div class="' + cls['cell_inside_header'] + '" title="' + str_title + '">' + cell_header + '</div>' +
                                            '<div class="' + cls['cell_inside_bottom'] + '">' + text_content + '</div>'
                                        )

                                        // Binding event open profile
                                        $(element_cell).find(`div.${cls['cell']}`).find(`.${cls['cell_inside_header']}, .${cls['cell_inside_bottom']}`).on('dblclick', (event) => {
                                            const cell = $(event.target).parent().parent()
                                            if (in_array(cls['cell_active'], cell[0].classList)) {
                                                this.handleProfileModal(cell)
                                            }
                                        })

                                        element_cell.setAttribute('data-attr', appno)
                                        element_cell.setAttribute('data-onhand', onhand_item)
                                        element_cell.setAttribute('data-status', status_item)
                                        element_cell.setAttribute('data-bucket', `${(status_item && status_item == 'E') ? 'END' : bucket_item}`)
                                        element_cell.setAttribute('data-reserv', true)

                                        const assignData = {
                                            ApplicationNo: appno,
                                            CIF: (results[0].CIFNO) ? results[0].CIFNO : null,
                                            ColumnCell: columns_name,
                                            CreateBy: stripname(Auth.EmpName_TH),
                                            CreateDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            Customer: (results[0].AccountName) ? results[0].AccountName : null,
                                            Isactive: 'Y',
                                            LayoutID: el_parent.getAttribute('data-parent'),
                                            MarketCode: this.state.mktcode,
                                            NoteCreateID: null,
                                            NoteCreateBy: null,
                                            NoteCreateDate: null,
                                            Reason: null,
                                            Remark: null,
                                            Subject: null,
                                            UpdateID: null,
                                            UpdateBy: null,
                                            UpdateDate: null
                                        }

                                        layouts.cellname_activation.push(assignData)

                                    }
                                    else if (assignMode == 'ADDITION') {

                                        const bindEventTag = 'data-event-dblclick="false" data-event-mouseover="false"'
                                        const elment_addition = $(element_cell).find(`div.${cls['inside_container']}`).length
                                    
                                        let status_reanson = (results[0] && results[0].Status) ? results[0].Status : null
                                        let principle_item = (results[0] && results[0].Principle) ? results[0].Principle : null
                                
                                        let acc_close = (principle_item && principle_item > 0) ? 'N' : 'Y'
                                        let check_status = (status_reanson == 'Approved' && acc_close == 'Y') ? 'E' : status_item
                            
                                        let tag_attr = `data-reserv="true" data-onhand="${onhand_item}" data-status="${check_status}" data-bucket="${(check_status && check_status == 'E') ? '' : bucket_item}"`

                                        if (elment_addition == 0) {
                                            let cell_appno_primary = element_cell.getAttribute('data-attr')
                                            const text_content = $(element_cell).find(`div.${cls['cell']} > div.${cls['cell_inside_bottom']}`).text()

                                            $(element_cell).find(`div.${cls['cell']}`).empty()
                                            .html(
                                                '<div class="' + cls['cell_inside_header'] + '" style="padding-top: 0px;">' +
                                                    '<div class="' + cls['inside_container'] + '">' +
                                                        '<div class="' + cls['inside_divide'] + '" data-attr="' + cell_appno_primary + '" data-ref="' + text_content + '" ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>' +
                                                        '<div class="' + cls['inside_divide'] + ' countable ' + assignClass + '" data-attr="' + appno + '" data-ref="' + text_content + '"  ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>' +
                                                    '</div>' +
                                                '</div>' +
                                                '<div class="' + cls['cell_inside_bottom'] + ' ' + cls['divide'] + '"  data-event-mouseover="false">' + text_content + '</div>'
                                            )

                                        } else {
                                            const text_content = $(element_cell).find(`div.${cls['cell']} > div.${cls['cell_inside_bottom']}`).text()

                                            $(element_cell).find(`div.${cls['inside_container']}`)
                                            .append('<div class="' + cls['inside_divide'] + ' countable ' + assignClass + '" data-attr="' + appno + '" data-ref="' + text_content + '" ' + tag_attr + ' ' + bindEventTag + '>&nbsp;</div>')
                                        }

                                        const assignData = {
                                            ApplicationNo: appno,
                                            CIF: (results[0].CIFNO) ? results[0].CIFNO : null,
                                            ColumnCell: columns_name,
                                            CreateBy: stripname(Auth.EmpName_TH),
                                            CreateDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            Customer: (results[0].AccountName) ? results[0].AccountName : null,
                                            Isactive: 'Y',
                                            LayoutID: el_parent.getAttribute('data-parent'),
                                            MarketCode: this.state.mktcode,
                                            NoteCreateID: null,
                                            NoteCreateBy: null,
                                            NoteCreateDate: null,
                                            Reason: null,
                                            Remark: null,
                                            Subject: null,
                                            UpdateID: null,
                                            UpdateBy: null,
                                            UpdateDate: null
                                        }

                                        layouts.addition_activation.push(assignData)
                                        this.handleSetEventCellAddition()

                                    }

                                    this.handleAssignModalClose()
                                }
                            })

                    },
                    onCancel: () => { }
                })

            } else {
                notification.error({
                    message: 'แจ้งเตือนจากระบบ',
                    description: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาติดต่อผู้ดูแลระบบเพื่อตรวจสอบ (Assignment Error)',
                })
            }
        }
    }

    // EXTENDED SCALE
    createCellAssignmentExtendedScale = (cellItems) => {
        const { mktCustomers, layouts } = this.state
        const { Auth } = this.state.authen

        let join_parent = 'parent'
        let cell_primary = null
        let cell_dispart = []
        if (cellItems && cellItems.length > 0) {
            _.forEach(cellItems, (objEl, i) => {

                if (in_array(cls['cell_active'], objEl.classList)) {
                    join_parent = 'parent'
                    cell_primary = objEl
                }

                if (in_array(cls['cell_extended'], objEl.classList)) {
                    join_parent = 'extends'
                    cell_primary = objEl
                }

                if (!in_array(cls['cell_active'], objEl.classList) && !in_array(cls['cell_extended'], objEl.classList)) {
                    cell_dispart.push(objEl)
                }

            })

            const parent_element = cell_primary.parentElement.parentElement.parentElement
            const appno = cell_primary.getAttribute('data-attr')
            const primary_id = (join_parent == 'parent') ? cell_primary.getAttribute('ref') : cell_primary.getAttribute('data-columns-connect')
            const layout_id = parent_element.getAttribute('data-parent')
            const cust_data = _.filter(mktCustomers, { ApplicationNo: appno })[0]

            let extends_data = {
                MarketCode: (cust_data && cust_data.MarketCode) ? cust_data.MarketCode : null,
                CIF: (cust_data && cust_data.CIFNO) ? cust_data.CIFNO : null,
                CitizenID: (cust_data && cust_data.CitizenID) ? cust_data.CitizenID : null,
                ApplicationNo: (cust_data && cust_data.ApplicationNo) ? cust_data.ApplicationNo : null,
                Customer: (cust_data && cust_data.AccountName) ? cust_data.AccountName : null,
                LayoutID: layout_id,
                PrimaryCell: primary_id,
                Isactive: 'Y',
                CreateID: Auth.EmployeeCode,
                CreateBy: stripname(Auth.EmpName_TH),
                CreateDate: moment().format('YYYY-MM-DD HH:mm:ss'),
                UpdateID: null,
                UpdateBy: null,
                UpdateDate: null
            }

            if (cell_dispart && cell_dispart[0]) {
                _.forEach(cell_dispart, (v) => {
                    extends_data['ColumnCell'] = v.getAttribute('ref')

                    // Fetch
                    let request_set = new Request(`${config.hostapi}/cellextended`, {
                        method: 'POST',
                        header: new Headers({
                            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                        }),
                        body: JSON.stringify({ data: extends_data }),
                        cache: 'no-cache'
                    })

                    fetch(request_set)
                        .then(response => response.json())
                        .then(data => {
                            if (data.status) {
                                notification.success({
                                    message: 'แจ้งเตือนจากระบบ',
                                    description: 'ระบบดำเนินการบันทึกข้อมูลการขยายขอบเขตแผงลูกค้าสำเร็จ.',
                                })

                                layouts.extended_activation.push(extends_data)

                                $('.context-cell-menu').removeClass(cls['highlighted'])
                                this.checkExtendedScaleCell(v, appno, primary_id)

                            } else {
                                notification.error({
                                    message: 'แจ้งเตือนจากระบบ',
                                    description: 'ระบบดำเนินการบันทึกข้อมูลการขยายขอบเขตแผงลูกค้าผิดพลาด กรุณาติดต่อผู้ดูแลระบบ เพื่อแจ้งปัญหาการใช้งาน.',
                                })
                            }
                        })
                        .catch(err => { console.log(`fetch error ${err}`) })
                })

            }

        }
    }

    checkExtendedScaleCell = (el, appno, primary_id) => {
        const { mktCustomers } = this.state
        const cust_data = _.filter(mktCustomers, { ApplicationNo: appno })[0]

        $(el).attr('data-class-original', $(el).attr('class'))

        const cust_cls = this.onChangeStateCell(cust_data)
        switch (cust_cls) {
            case `${cls['cell_active']}`:
                $(el).addClass(`${cls['cell_extended']} ${cls['active']}`)
                break
            case `${cls['cell_active']} ${cls['cell_closeacc']}`:
                $(el).addClass(`${cls['cell_extended']} ${cls['closeacc']}`)
                break
            case `${cls['cell_active']} ${cls['cell_overdue']}`:
                $(el).addClass(`${cls['cell_extended']} ${cls['overdue']}`)
                break
            case `${cls['cell_active']} ${cls['cell_reject']}`:
                $(el).addClass(`${cls['cell_extended']} ${cls['reject']}`)
                break
            case `${cls['cell_active']} ${cls['cell_onhand']}`:
                $(el).addClass(`${cls['cell_extended']} ${cls['onhand']}`)
                break
        }

        let findCell = $(el).find(`.${cls['cell']}`)
        $(el).attr({
            'data-attr': appno,
            'data-columns-connect': primary_id,
            'data-columns-orgin': findCell.text(),
            'field-connect': 'true'
        })

        const cell_main = document.querySelector(`td[ref="${primary_id}"]`)
        if (cell_main) {
            cell_main.setAttribute('field-connect', 'true')
        }

    }

    // LOCK LAYOUTS HANDLER
    handleLockLayout = (lock_status) => {
        const { Auth } = this.state.authen
        const { BRANCH_MARKET_PROFILE: { data, status }, SET_MARKET_LOCK_HANDLE } = this.props
      
        const params = {
            MarketCode: (parseBool(status) && data[0]) ? data[0].MarketCode : [],
            EventName: lock_status,
            CreateByID: Auth.EmployeeCode,
            CreateByName: stripname(Auth.EmpName_TH),
        }

        const lock_title = `${(lock_status == config.lockConfig.lock) ? 'ล็อคเลย์เอาท์' : 'ปลดล็อคเลย์เอาท์'}`

        confirm({
            title: `กรุณายืนยันการ${lock_title}?`,
            content: (
                <article>
                    <p>{`โปรดตรวจสอบและบันทึกข้อมูลก่อนยืนยันการ${lock_title} เมื่อ${lock_title}สำเร็จ ระบบจะ Refresh หน้าจอ เพื่อ${lock_title}`}</p>
                    <p>กรณึข้อมูลถูกต้องโปรดคลิก OK หรือ Cancel เพื่อยกเลิก</p>
                </article>
            ),
            onOk: () => { SET_MARKET_LOCK_HANDLE(params) },
            onCancel: () => { }
        })
        
        
    }

    // SAVE LAYOUTS FUNCTION
    handleSaveLayout = (event, ui) => {
        const { Auth } = this.state.authen

        const layout = document.querySelector(`#grid_layout`)
        const side_layout = document.querySelectorAll(`.${cls['grid_layout_zone']}`)
        const parent_layout = document.querySelectorAll(`.${cls['grid_layout_parent']}`)
        const table_layout = document.querySelectorAll(`.${cls['table_container']}`)
        const layout_empty = document.querySelectorAll(`.${cls['grid_layout_empty']}`)

        confirm({
            title: 'กรุณายืนยันการบันทึกข้อมูล',
            content: 'ก่อนทำการบันทึกข้อมูลทุกครั้ง ควรตรวจสอบความถูกต้องของแผงตลาดให้ถูกต้องก่อนทำการบันทึกข้อมูล',
            onOk: () => {

                // Collection
                let objSideLayout = []
                let objObjectBox = []

                // Side activation
                if (side_layout && side_layout.length > 0) {
                    _.forEach(side_layout, (v, i) => {
                        let str = v.classList.value
                        let checkStatus = (str.match(/open/g)) ? 'Y' : 'N'
                        objSideLayout.push({
                            marketCode: this.state.mktcode,
                            _id: v.id,
                            dataAttr: v.getAttribute('data-attr'),
                            className: v.classList.value,
                            layoutActive: checkStatus,
                            layoutResize: 'false',
                            layoutResizeStyle: '',
                            originalWidth: 0,
                            originalHeight: 0,
                            table: 'false',
                            tableStyle: null,
                            rtl: 'false',
                            rtp: 'false',
                            tblCols: 0,
                            tblRows: 0
                        })
                    })
                }

                // Parent activation        
                if (parent_layout && parent_layout.length > 0) {
                    _.forEach(parent_layout, (v) => {
                        _.assign(
                            _.filter(objSideLayout, { _id: v.getAttribute('data-parent') })[0],
                            {
                                layoutResize: 'true',
                                layoutResizeStyle: v.getAttribute('style'),
                                originalHeight: v.getAttribute('originalHeight'),
                                originalWidth: v.getAttribute('originalwidth')
                            }
                        )
                    })
                }

                // Table scale
                if (table_layout && table_layout.length > 0) {
                    _.forEach(table_layout, (v) => {
                        _.assign(
                            _.filter(objSideLayout, { _id: v.getAttribute('data-parent') })[0],
                            {
                                table: 'true',
                                tableStyle: v.getAttribute('style'),
                                rtl: v.getAttribute('rtl'),
                                rtp: v.getAttribute('rtp'),
                                tblCols: document.querySelectorAll(`#${v.id} tbody tr:first-child td`).length,
                                tblRows: document.querySelectorAll(`#${v.id} tbody tr`).length
                            }
                        )

                    })
                }

                // Object box activation
                if (layout_empty && layout_empty.length > 0) {
                    _.forEach(layout_empty, (v, i) => {
                        objObjectBox.push({
                            marketCode: this.state.mktcode,
                            _id: v.id,
                            dataSidename: v.getAttribute('data-sidename'),
                            initialNo: v.getAttribute('data-init'),
                            className: v.classList.value,
                            styles: v.getAttribute('style'),
                            text: v.innerText
                        })
                    })
                }

                let layout_post = {
                    market_code: this.state.mktcode,
                    side_activation: _.reject(objSideLayout, (o) => { return o._id == '' }),
                    objectbox_activation: objObjectBox,
                    isCreate: this.state.firstCreate,
                    requestID: Auth.EmployeeCode,
                    requestName: stripname(Auth.EmpName_TH)
                }

                // Fetch
                const request_set = new Request(`${config.hostapi}/layouts`, {
                    method: 'POST',
                    header: new Headers({
                        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                    }),
                    body: JSON.stringify({ data: layout_post }),
                    cache: 'no-cache'
                })

                fetch(request_set)
                    .then(response => response.json())
                    .then(data => {
                        if (data.status) {
                            notification.success({
                                message: 'แจ้งเตือนจากระบบ',
                                description: 'ระบบดำเนินการบันทึกข้อมูลสำเร็จ',
                            })
                            this.setState({ firstCreate: false })
                        }
                    })
                    .catch(err => { console.log(`fetch error ${err}`) })

            },
            onCancel() { }
        })
    }

    handleDecreaseCustomer = (dataDel) => {
        const { Auth } = this.state.authen
        const { splitMode, layouts } = this.state

        let request_filter = {
            MarketCode: this.state.mktcode,
            ApplicationNo: dataDel,
            requestID: Auth.EmployeeCode,
            requestName: stripname(Auth.EmpName_TH)
        }
    
        // Fetch
        const request_set = new Request(`${config.hostapi}/decreaseCustItem`, {
            method: 'POST',
            header: new Headers({
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }),
            body: JSON.stringify(request_filter),
            cache: 'no-cache'
        })
    
        fetch(request_set)
        .then(res => (res.json()))
        .then(data => { 
            if(data.status) {
                notification.success({ message: 'แจ้งเตือนจากระบบ', description: 'ระบบดำเนินการลบข้อมูลสำเร็จ.' })

                const elements = splitMode.elem
                _.forEach(dataDel, (v, i) => {
                    const elTarget = elements.find(`div[data-attr="${v}"]`)
                    if(elTarget && elTarget.length > 0) {
                        elTarget.remove()
                    }
                })

                const checkList = elements.find(`div.${cls['inside_divide']}`)
                if(checkList && checkList.length == 1) {                    
                    const appno = checkList.attr('data-attr')
                    checkList.unbind('dblclick mouseover')
                    elements.removeClass().addClass(`${cls['untouch']} context-cell-menu`)
                    elements.html(`<div class="${cls['cell']}"></div>`)

                    let cellData = _.filter(layouts.cellname_activation, { ApplicationNo: appno })[0]
                    if(cellData) {
                        this.handleInterfaceField(elements, cellData)
                    }
                }
               
            } 
        })
        .catch(err => { console.log(`fetch error ${err}`) })

    }

    // HANDLE RESET
    resetOwnerCell = (target) => {
        const { Auth } = this.state.authen
        const { mktCustomers, layouts } = this.state
        const objElment = target[0]

        if (objElment) {

            let reset_type = null
            if (in_array(cls['cell_active'], objElment.classList)) reset_type = 'parent'
            else if (in_array(cls['cell_extended'], objElment.classList)) reset_type = 'extend'
            else if (in_array(cls['cell_prospect'], objElment.classList)) reset_type = 'prospect'
            else if (in_array(cls['cell_root_merge'], objElment.classList)) reset_type = 'merge'

            if (reset_type && reset_type == 'parent') {
                const columns_name = objElment.getAttribute('ref')
                const columns_apps = objElment.getAttribute('data-attr')
                const el_connect = $(`td[data-columns-connect="${columns_name}"]`).length
                const el_addition = $(objElment).find(`.${cls['inside_divide']}`).length

                const master_assignlist = (mktCustomers && mktCustomers.length > 0) ? mktCustomers : []
                let results = _.filter(master_assignlist, { 'ApplicationNo': columns_apps })[0]

                let request_data = {
                    MarketCode: this.state.mktcode,
                    ApplicationNo: columns_apps,
                    ColumnCell: columns_name,
                    fieldConn: (el_connect > 0) ? 'true' : 'false',
                    addition: (el_addition > 0) ? 'true' : 'false',
                    Isactive: 'Y',
                    requestID: Auth.EmployeeCode,
                    requestName: stripname(Auth.EmpName_TH)
                }

                confirm({
                    title: 'กรุณายืนยันการรีเซ็ตข้อมูลลูกค้า',
                    content: (
                        <div>
                            <p>โปรดตรวจสอบความถูกต้องของข้อมูลก่อนทำการรีเซ็ตข้อมูล</p>
                            <p style={{ textDecoration: "underline" }}>ข้อมูลที่ต้องการจะรีเซ็ต คือ</p>
                            <p className={`${style_opt['bg_grayLighter']} pa1`}>{`${results.AccountName} (AppNo : ${results.ApplicationNo})`}</p>
                            <p className={`${style_opt['fg_redSoft']}`}>หมายเหตุ: หากมีข้อมูลที่เชื่อมต่อกับเซลล์หลักระบบจะดำเนินการรีเซ็ตข้อมูลที่เกี่ยวข้องทั้งหมด โปรดตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยันการรีเซ็ต</p>
                            <p>กรณีข้อมูลถูกต้องโปรดยืนยันการรีเซ็ต</p>
                        </div>
                    ),
                    onOk: () => {

                        // Fetch
                        const request_set = new Request(`${config.hostapi}/resetowner`, {
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
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'ดำเนินการรีเซ็ตข้อมูลลูกค้าสำเร็จ'
                                    })

                                    const dataCellList = layouts.cellname_activation
                                    if (dataCellList.length > 0) {
                                        dataCellList.splice(_.findIndex(dataCellList, function (item) { return item.ApplicationNo === columns_apps }), 1)
                                        _.map(mktCustomers, (v) => {
                                            if (v.ApplicationNo === columns_apps) {
                                                return v.IsActive = 'Y',
                                                    v.IsAssign = true
                                            }

                                        })
                                    }

                                    objElment.setAttribute('data-attr', '')
                                    objElment.setAttribute('data-onhand', '')
                                    objElment.setAttribute('data-status', '')
                                    objElment.setAttribute('data-bucket', '')
                                    objElment.setAttribute('data-reserv', false)
                                    objElment.classList.remove(cls['cell_active'], cls['cell_onhand'], cls['cell_overdue'], cls['cell_reject'], cls['cell_closeacc'])
                                    
                                    $(objElment).html(createElement('div', { 'class': `${cls['cell']}` }, columns_name))

                                    if (el_connect > 0) {
                                        const el_target = $(`td[data-columns-connect="${columns_name}"]`)
                                        el_target.removeClass().addClass(orginal_class)
                                        el_target.removeAttr('data-class-original')
                                        el_target.removeAttr('data-columns-orgin')
                                        el_target.removeAttr('field-connect')
                                        el_target.removeAttr('data-columns-connect')

                                        objElment.removeAttr('field-connect')
                                    }

                                } else {
                                    notification.success({
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล กรุณาลองใหม่อีกครั้ง'
                                    })
                                }
                            })
                    },
                    onCancel: () => { }
                })

            } 
            else if (reset_type && reset_type == 'extend') {

                const application_no = target.attr('data-attr')
                const column_connect = target.attr('data-columns-connect')
                const orginal_class = target.attr('data-class-original')

                confirm({
                    title: 'กรุณายืนยันการรีเซ็ตข้อมูลการเชื่อมต่อพื้นที่ของลูกค้า',
                    content: (
                        <div>
                            <p>โปรดตรวจสอบความถูกต้องของข้อมูลก่อนทำการรีเซ็ตข้อมูล</p>
                            <p className={`${style_opt['fg_redSoft']}`}>หมายเหตุ: หากมีข้อมูลที่เชื่อมต่อกับเซลล์หลักระบบจะดำเนินการรีเซ็ตข้อมูลที่เกี่ยวข้องทั้งหมด โปรดตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยันการรีเซ็ต</p>
                            <p>กรณีข้อมูลถูกต้องโปรดยืนยันการรีเซ็ต</p>
                        </div>
                    ),
                    onOk: () => {

                        let request_data = {
                            data: {
                                MarketCode: this.state.mktcode,
                                ApplicationNo: application_no,
                                PrimaryCell: column_connect,
                                requestID: Auth.EmployeeCode,
                                requestName: stripname(Auth.EmpName_TH)
                            }
                        }

                        //Fetch
                        const request_set = new Request(`${config.hostapi}/delcellextended`, {
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
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'ดำเนินการรีเซ็ตข้อมูลลูกค้าสำเร็จ'
                                    })

                                    const el_target = $(`td[data-columns-connect="${column_connect}"]`)
                                    el_target.removeClass().addClass(orginal_class)
                                    el_target.removeAttr('data-class-original')
                                    el_target.removeAttr('data-columns-orgin')
                                    el_target.removeAttr('field-connect')
                                    el_target.removeAttr('data-columns-connect')

                                } else {
                                    notification.success({
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล กรุณาลองใหม่อีกครั้ง'
                                    })
                                }
                            })

                    },
                    onCancel: () => { }
                })

            } 
            else if (reset_type && reset_type == 'prospect') {
                    
                const prospect_name = target.attr('data-prospect')
                const prospect_cell = target.attr('ref')

                confirm({
                    title: 'กรุณายืนยันการรีเซ็ตข้อมูลเจ้าของกิจการ',
                    content: (
                        <div>
                            <p>โปรดตรวจสอบความถูกต้องของข้อมูลก่อนทำการรีเซ็ตข้อมูล</p>
                            <p className={`${style_opt['bg_grayLighter']} fw6 pa1 `}>ข้อมูลที่ต้องการจะรีเซ็ตที่แผง : <span className={`${style_opt['fg_redSoft']}`}>{`${prospect_cell}`}</span></p>
                            <p className={`${style_opt['bg_grayLighter']} fw6 pa1 `}>เจ้าของกิจการ : <span className={`${style_opt['fg_redSoft']}`}>{`${prospect_name}`}</span></p>
                            <p>กรณีข้อมูลถูกต้องโปรดยืนยันการรีเซ็ต</p>
                        </div>
                    ),
                    onOk: () => {

                        let request_data = {
                            data: {
                                MarketCode: this.state.mktcode,
                                CustomerName: prospect_name,
                                ColumnCell: prospect_cell,
                                RequestID: Auth.EmployeeCode,
                                RequestName: stripname(Auth.EmpName_TH)
                            }
                        }

                        //Fetch
                        const request_set = new Request(`${config.hostapi}/potentialDel`, {
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
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'ดำเนินการรีเซ็ตข้อมูลเจ้าของกิจการสำเร็จ'
                                    })

                                    let potentialDel = _.reject(layouts.customer_potential,  { CustomerName: prospect_name, ColumnCell: prospect_cell })  
                                    layouts.customer_potential = potentialDel  // Reject and change data 

                                    const el_target = $(`td[ref="${prospect_cell}"]`)                                    
                                    el_target.removeAttr('data-prospect')
                                    el_target.removeAttr('data-prospect-status')
                                    el_target.removeClass(`${cls['cell_prospect']}`)

                                    el_target.html(createElement('div', { 'class': `${cls['cell']}` }, prospect_cell))

                                } else {
                                    notification.success({
                                        message: 'แจ้งเตือนจากระบบ',
                                        description: 'เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล กรุณาลองใหม่อีกครั้ง'
                                    })
                                }
                            })

                    },
                    onCancel: () => { }
                })

            } 
            else if (reset_type && reset_type == 'merge') {

            }

        }

    }
}

const getTransformMatrix = (elem) => {
    let matrix = $(elem).css('transform').replace(/[^0-9\-.,]/g, '').split(',')
    let x = matrix[12] || matrix[4]
    let y = matrix[13] || matrix[5]
    return { 'x': numValid(x), 'y': numValid(y) }
}

const getCoords = (elem) => {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: roundFixed(top, 0), left: roundFixed(left, 0) };
}

const removeBoxItem = (el_target, marketcode, authen) => {
    let request_filter = {
        MarketCode: marketcode,
        BoxID: (el_target[0]) ? el_target[0].getAttribute('id') : null,
        InsideParent: (el_target[0]) ? el_target[0].getAttribute('data-sidename') : null,
        requestID: authen.EmployeeCode,
        requestName: stripname(authen.EmpName_TH)
    }

    // Fetch
    const request_set = new Request(`${config.hostapi}/removeBoxItem`, {
        method: 'POST',
        header: new Headers({
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }),
        body: JSON.stringify(request_filter),
        cache: 'no-cache'
    })

    fetch(request_set)
        .then(res => (res.json()))
        .then(res => { el_target[0].remove() })
        .catch(err => { console.log(`fetch error ${err}`) })
}

const stripname = (str) => {
    if (str)
        return str.replace('+', ' ')
    else
        return ''
}

const routeHelper = (el) => {
    if (in_array('ui-resizable-n', el.classList)) {
        return { 'position': 'top', 'type': 'rows' }
    }
    else if (in_array('ui-resizable-e', el.classList)) {
        return { 'position': 'right', 'type': 'cols' }
    }
    else if (in_array('ui-resizable-s', el.classList)) {
        return { 'position': 'bottom', 'type': 'rows' }
    }
    else if (in_array('ui-resizable-w', el.classList)) {
        return { 'position': 'left', 'type': 'cols' }
    }
    else { return {} }
}

const getRouteWithName = (el_name, route) => {
    if (route.type == 'rows') {
        if (in_array(el_name, ['outside_topleft_zone', 'outside_topleft_zone_previews', 'outside_topcenter_zone', 'outside_topcenter_zone_previews'])) {
            return { position: "top", type: "rows" }
        } else {
            return route
        }
    } else if (route.type == 'cols') {
        if (in_array(el_name, ['outside_topleft_zone', 'outside_topleft_zone_previews', 'outside_left_zone', 'outside_left_zone_previews'])) {
            return { position: "right", type: "cols" }
        } else {
            return route
        }
    }

}

const calTableExtends = (el_target, el_name, size) => {
    let height = parseInt(el_target.getAttribute('originalHeight'))
    let width = parseInt(el_target.getAttribute('originalWidth'))

    let add_cell_text = {}
    if (size.width > width || size.height > height) {
        let width_diff,
            height_diff

        height_diff = (size.height - parseInt(height)) / config.cellSize
        width_diff = (size.width - parseInt(width)) / config.cellSize

        let addRows = (height_diff > 0) ? Math.round(height_diff) : 0
        let addColumns = (width_diff > 0) ? Math.round(width_diff) : 0

        if (addRows > 0) {
            add_cell_text = {
                text: `เพิ่มแถวแนวนอน ${addRows}`,
                amount: addRows,
                type: 'rows',
                mode: '+'
            }
        }

        if (addColumns > 0) {
            add_cell_text = {
                text: `เพิ่มแถวแนวตั้ง ${addColumns}`,
                amount: addColumns,
                type: 'cols',
                mode: '+'
            }
        }

    } else if (size.width < width || size.height < height) {
        let width_diff,
            height_diff

        height_diff = (parseInt(height) - size.height) / config.cellSize
        width_diff = (parseInt(width) - size.width) / config.cellSize

        let calNewRow = (height_diff > 0) ? Math.round(height_diff) : 0
        let calNewCols = (width_diff > 0) ? Math.round(width_diff) : 0

        if (calNewRow > 0) {
            add_cell_text = {
                text: `ลบแถวแนวนอน ${calNewRow}`,
                amount: calNewRow,
                type: 'rows',
                mode: '-'
            }
        }

        if (calNewCols > 0) {
            add_cell_text = {
                text: `ลบแถวแนวตั้ง ${calNewCols}`,
                amount: calNewCols,
                type: 'cols',
                mode: '-'
            }
        }

    }

    return add_cell_text
}

// AUTO RESIZE SCALING OF ELEMENT
const detectResize = (el_target, el_name, element_id, ui) => {    
    const elements = document.getElementById(element_id)
    let { offsetTop, offsetLeft, offsetWidth, offsetHeight } = elements

    const top_draft = (offsetTop / config.cellSize)
    const left_draft = (offsetLeft / config.cellSize)
    const width_draft = (offsetWidth / config.cellSize)
    const height_draft = (offsetHeight / config.cellSize)

    const top_opt = 1
    const left_opt = 1
    const width_opt = 1
    const height_opt = 1

    let top_total = (config.cellSize * roundFixed(top_draft, 0)) + top_opt
    let left_total = (config.cellSize * roundFixed(left_draft, 0)) + left_opt
    let width_total = (config.cellSize * roundFixed(width_draft, 0)) + width_opt
    let height_total = (config.cellSize * roundFixed(height_draft, 0)) + height_opt

    if(top_total < 0) {
        top_total = top_opt
    }

    elements.style.top = top_total + 'px'
    elements.style.left = left_total + 'px'
    elements.style.width = width_total + 'px'
    elements.style.height = height_total + 'px'
}

const stringifyOnce = (obj, replacer, indent) => {
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value) {
        var printedObjIndex = false;
        printedObjects.forEach(function (obj, index) {
            if (obj === value) {
                printedObjIndex = index;
            }
        });

        if (printedObjIndex && typeof (value) == "object") {
            return "(see " + value.constructor.name.toLowerCase() + " with key " + printedObjectKeys[printedObjIndex] + ")";
        } else {
            var qualifiedKey = key || "(empty key)";
            printedObjects.push(value);
            printedObjectKeys.push(qualifiedKey);
            if (replacer) {
                return replacer(key, value);
            } else {
                return value;
            }
        }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
}

const MktLayoutWithCookie = withCookies(MarketLayout)
export default withRouter(connect(
    (state) => ({
        masters: state.masters,
        EMP_TESTER_INFO: state.GET_EMP_TESTER_INFO,
        BRANCH_MARKET_PROFILE: state.GET_BRANCH_MARKET_PROFILE,
        CUSTOMER_LIST_INFO: state.GET_CUSTOMER_INFO,
        MARKETSHARE_CA_INFO: state.GET_MARKETSHARE_CAINFO,
        MARKET_LOCKINFO: state.GET_MARKET_LOCKINFO,
        MARKET_LOCK_HANDLE: state.GET_MARKET_LOCK_HANDLE
    }),
    {
        GET_MASTER_DATA: masterList,
        GET_EMP_TESTER_DATA: getEmpTesterInfo,
        GET_BRANCHMARKET_INFO: getBranchMarketInfo,
        GET_CUSTOMER_INFO: getCustomerInfo,
        GET_MARKETSHARE_CA: getMarketShareByCA,
        GET_MARKET_LOCKINFO: getMarketLockInfo,
        SET_MARKET_LOCK_HANDLE: setMarketLockManagement
    }
)(MktLayoutWithCookie))