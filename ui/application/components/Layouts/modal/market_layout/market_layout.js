import React, { Component } from 'react'
import dragscroll from 'dragscroll'
import fetch from 'isomorphic-fetch'
import bluebird from 'bluebird'
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie'
import { withRouter } from 'react-router-dom'
import { Icon, notification  } from 'antd'

import domToImage from 'dom-to-image'

import { 
    getBranchMarketInfo, 
    getMarketShareByCA,
    getEmpTesterInfo 

} from '../../../../actions/layouts'

import { in_array, qs_parse, createElement, roundFixed, parseBool, parseNumberShort, numValid } from './function'
import _ from 'lodash'

import ProfileModal from './profile_modal'
import Summary from './sidebar/summary'
import { config } from './config'

import cls from './styles/grid_layout.scss'
import layout_cls from './styles/layout.scss'
import styles from './styles/preview_layout.scss'
import notfcls from './styles/404.scss'

const str_width = 6.5
const decrease_width = 5
const profileClickEvent = 'click'

const heightMaxScreen = (window.screen.availHeight - (window.outerHeight - window.innerHeight)) 
const widthMaxScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))

class MarketLayoutCtrl extends Component {

    constructor(props) {
        super(props)

        const { cookies, location } = props
        const cookieData = cookies.get('authen_info', { path: '/' })

        let qs_param = qs_parse(location.search)
        this.state = {
            authen: (!cookieData) ? { Session: [] } : cookieData,
            market_code: (qs_param && qs_param.marketcode) ? qs_param.marketcode : (props && props.mktcode) ? props.mktcode : null,
            fullscreen: (qs_param && parseBool(qs_param.fs)) ? parseBool(qs_param.fs) : (props && props.fullscreen) ? props.fullscreen : false,
            sidebar: (qs_param && parseBool(qs_param.sidebar)) ? parseBool(qs_param.sidebar) : (props && props.sidebar) ? props.sidebar : false,
            btnSaveImg: (qs_param && parseBool(qs_param.genImg)) ? parseBool(qs_param.genImg) : false,
            zoomDisable: (props && props.zoomDisable) ? props.zoomDisable : false,
            isGetCell: (props && props.isGetCell) ? props.isGetCell : false
        }
        
    }
    
    componentWillMount() {
        const { GET_BRANCHMARKET_INFO, GET_MARKETSHARE_CA, GET_EMP_TESTER_DATA  } = this.props
        const { Auth } = this.state.authen

        if(this.state.market_code && !_.isEmpty(this.state.market_code)) {
            let params = { 
                AuthID: (Auth && !_.isEmpty(Auth)) ? Auth.EmployeeCode : null,
                MarketCode: this.state.market_code              
            }

            let apis = [GET_BRANCHMARKET_INFO, GET_MARKETSHARE_CA, GET_EMP_TESTER_DATA]
            bluebird.all(apis).each(fn => { fn(params) })     
        }
    }

    componentDidMount() {
        if(_.isEmpty(this.state.market_code)) {
            $(document).delay(1500).queue(function(){$(".one").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".two").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".three").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".four").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".five").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".six").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".seven").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".eight").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".nine").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".ten").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".eleven").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".twelve").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".thirteen").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".fourteen").addClass(`${notfcls.selected}`),$(this).dequeue()}).delay(500).queue(function(){$(".fifteen").addClass(`${notfcls.selected}`),$(this).dequeue()});
        }

    }

    render() {
        return (this.state.market_code && !_.isEmpty(this.state.market_code) && !_.isEmpty(this.state.authen)) ?
        (   
            <MarketLayout 
                Authen={this.state.authen}
                MarketCode={this.state.market_code}
                FullScreen={this.state.fullscreen}
                OpenSidebar={this.state.sidebar}
                btnSaveImg={this.state.btnSaveImg}
                zoomDisable={this.state.zoomDisable}
                LayoutFixed={true}
                isImg={false}
                imgConfig={{ width: 200, height: 200 }}
                MktProfile={(this.props.BRANCH_MARKET_PROFILE.data && this.props.BRANCH_MARKET_PROFILE.data[0]) ? this.props.BRANCH_MARKET_PROFILE : []}
                CAMktShare={this.props.MARKETSHARE_CA_INFO.data}
                Tester={(this.props.EMP_TESTER_INFO.data && this.props.EMP_TESTER_INFO.data.length > 0) ? this.props.EMP_TESTER_INFO.data : []  } 
                isGetCell={this.state.isGetCell}
                handleGetCell={(this.state.isGetCell) ? this.props.handleGetCell : null}
                           
            />
        ) : 
        (
            <div className={notfcls['notfound_wrap']}>
                <div className={notfcls['wordsearch']}>
                <ul>
                    <li>k</li>
                    <li>v</li>
                    <li>n</li>
                    <li>z</li>
                    <li>i</li>
                    <li>x</li>
                    <li>m</li>
                    <li>e</li>
                    <li>t</li>
                    <li>a</li>
                    <li>x</li>
                    <li>l</li>
                    <li className="one">4</li>
                    <li className="two">0</li>
                    <li className="three">4</li>
                    <li>y</li>
                    <li>y</li>
                    <li>w</li>
                    <li>v</li>
                    <li>b</li>
                    <li>o</li>
                    <li>q</li>
                    <li>d</li>
                    <li>y</li>
                    <li>p</li>
                    <li>a</li>
                    <li className="four">p</li>
                    <li className="five">a</li>
                    <li className="six">g</li>
                    <li className="seven">e</li>
                    <li>v</li>
                    <li>j</li>
                    <li>a</li>
                    <li className="eight">n</li>
                    <li className="nine">o</li>
                    <li className="ten">t</li>
                    <li>s</li>
                    <li>c</li>
                    <li>e</li>
                    <li>w</li>
                    <li>v</li>
                    <li>x</li>
                    <li>e</li>
                    <li>p</li>
                    <li>c</li>
                    <li>f</li>
                    <li>h</li>
                    <li>q</li>
                    <li>e</li>
                    <li className="eleven">f</li>
                    <li className="twelve">o</li>
                    <li className="thirteen">u</li>
                    <li className="fourteen">n</li>
                    <li className="fifteen">d</li>
                    <li>s</li>
                    <li>w</li>
                    <li>q</li>
                    <li>v</li>
                    <li>o</li>
                    <li>s</li>
                    <li>m</li>
                    <li>v</li>
                    <li>f</li>
                    <li>u</li>
                </ul>
                </div>

                <div className={notfcls['main_content']}>
                    <h1 className>We couldn't find what you were looking for.</h1>
                    <p>Unfortunately the page you were looking for could not be found. It may be the market layout unavailable or no create.</p>
                    <p>Please check the market layout for data create?</p>
                </div>
            </div>
        )
    }

}

class MarketLayout extends Component {

    constructor(props) {
        super(props)

        this.state = {
            layouts: {},
            sidebar: false,
            customers: [],
            custSelect: {},
            actionLogs: [],
            imgUrl: null,
            modal: {
                profile: false
            },
            pvZoneAvaliable: [],
            isPadding: true,
            removeHandle: false,
            removeCount: 0,
            doubletChart: this.getDoubletAlphabet()
        }
        
    }

    componentWillMount() {
        const { Authen, MarketCode } = this.props
        const { Auth } = Authen

        if(MarketCode && !_.isEmpty(MarketCode)) {
            let params = { 
                AuthID: (Auth && !_.isEmpty(Auth)) ? Auth.EmployeeCode : null,
                MarketCode: MarketCode              
            }

            this.handleCustList(params)
        }
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return this.props.Authen !== nextProps.Authen ||
               this.props.MarketCode !== nextProps.MarketCode ||
               this.props.OpenSidebar !== nextProps.OpenSidebar ||
               this.props.FullScreen !== nextProps.FullScreen ||
               this.props.btnSaveImg !== nextProps.btnSaveImg ||
               this.props.zoomDisable !== nextProps.zoomDisable ||
               this.props.isGetCell !== nextProps.isGetCell ||
               this.props.handleGetCell !== nextProps.handleGetCell ||
               this.props.MktProfile !== nextProps.MktProfile ||
               this.props.CAMktShare !== nextProps.CAMktShare ||
               this.props.isImg !== nextProps.isImg ||
               this.props.imgConfig !== nextProps.imgConfig ||             
               this.state.customers !== nextState.customers ||
               this.state.layouts !== nextState.layouts ||               
               this.state.actionLogs !== nextState.actionLogs ||
               this.state.custSelect !== nextState.custSelect ||
               this.state.sidebar !== nextState.sidebar ||
               this.state.imgUrl !== nextState.imgUrl
    }

    elementBuilder = (el) => {
        return (<div id={`${el}_previews`} key={`${el}_previews`} data-attr={el} className={`${styles['grid_layout_zone']}`} draggable={false}></div>)
    }

    handleSaveImgToSrv = (marketcode) => {
        if(confirm('กรุณายืนยันการบันทึกรูปผังตลาด กรณียืนยัน คลิก OK หรือ Cancel เพื่อยกเลิก')) {
                
                domToImage.toPng(document.getElementById('grid_previews'))
                .then((dataUrl) => {
                    // var img = new Image()
                    // img.src = dataUrl
                    // document.getElementById('app').appendChild(img)

                    var block = dataUrl.split(";")
                    var realData = block[1].split(",")[1]
     
                    fetch(`http://172.17.9.94/newservices/LBServices.svc/nano/layout/image/${marketcode}`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            MarketCode: marketcode,
                            ByteFile: realData
                        }),
                        timeout: 1500000
                    })
                    .then(res => (res.json()))
                    .then(res => {                     
                        let request_log = new Request( `http://tc001pcis1p:8099/nanolayout_api/index.php/api/creteaimglayout/mktcode/${marketcode}/mktlogged`, {
                            method: 'GET',
                            cache: 'no-cache',
                            header: new Headers({
                                'Accept': 'application/json',
                                'Content-Type': 'application/json; charset="UTF-8";'
                            })           
                        })

                        fetch(request_log)
                        .then(response => response.json())
                        .then(resp => {
                            if(resp.status) {
                                notification.success({
                                    message: 'แจ้งเตือนจากระบบ',
                                    description: 'บันทึกข้อมูลและสร้างรูปผังตลาดสำเร็จ',
                                })
                            } else {
                                notification.error({
                                    message: 'แจ้งเตือนจากระบบ',
                                    description: 'ไม่สำเร็จอาจเกิดข้อผิดพลาดในระบบ กรุณาแจ้งผู้ดูแลระบบ',
                                })
                            }
                        })     
                    })

                })
                .catch(function (error) { console.error('oops, something went wrong!', error)  }) 
        }
        return false
    }

    render() {
        const { modal, layouts, sidebar, customers, custSelect, actionLogs } = this.state
        const { Authen, isImg, MarketCode, btnSaveImg, FullScreen, OpenSidebar, MktProfile, CAMktShare } = this.props
        const { Auth } = Authen

        let auth_id = (Auth && Auth.EmployeeCode) ? Auth.EmployeeCode : null

        return (
            <div id="grid_wrapper" className={`${styles['gridWrapper']}`}>  
                {/*${(FullScreen) ? 'dragscroll' : ''}  style={(FullScreen) ? { width: (widthMaxScreen - 220), height: heightMaxScreen, overflow: 'scroll', cursor: 'grab' }:{}}*/}
                <div id="zoom_parent" className={`${styles['zoom_parent']}`}>
                    {/*${(FullScreen) ? '' : 'panzoom'}*/}
                    <div id="grid_previews" className={`${styles['wrapper']} ${styles['grid']} panzoom`}>
                        {_.map(config.side, this.elementBuilder)}                        
                    </div>
                </div>

                { 
                    (btnSaveImg && in_array(auth_id, this.props.Tester)) && 
                    (
                        <div className={cls['btnSaveImg']} onClick={this.handleSaveImgToSrv.bind(this, MarketCode)}>
                            <Icon type="save" />
                        </div>
                    ) 
                }
               
                <div className={`${layout_cls['layout_sider']} ${(sidebar && !_.isEmpty(this.state.layouts)) ? layout_cls['open'] : ''}`}>
                    <div className={`${layout_cls['layout_sider_item']}`}>
                        <Summary 
                            visible={sidebar} 
                            mktLayouts={layouts}
                            mktProfile={MktProfile} 
                            mktCustomer={customers} 
                            dataItems={CAMktShare} 
                            configData={config}
                        />
                    </div>
                </div>          
                 
                <ProfileModal 
                    authen={Authen}
                    visible={modal.profile} 
                    preview={false}
                    previewBigScale={false}
                    masters={[]} 
                    actionLogs={actionLogs} 
                    mktCustFilter={custSelect} 
                    handleUpdateActionLog={this.handleUpdateActionLog}
                    handleProfileModalClose={this.handleProfileModalClose} 
                />
            </div>
        )
    }

     // CUSTOMER DATA LIST
    handleCustList = (params) => {
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
            this.setState({ customers: (resp && parseBool(resp.status)) ? resp.data : [] })

            if(this.state.customers && this.state.customers.length > 0){
                this.handleGetLayout(params.MarketCode)
            }
            
        })

    }
    
    // CUSTOMER PROFILE HANDLER 
    // OPEN PROFILE MODAL
    handleProfileModal = (el_target, el_name = null) => {
        const { MarketCode, customers } = this.state
        const result = _.filter(customers, { ApplicationNo: el_target[0].getAttribute('data-attr') })[0]

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
                custSelect: note_reason, 
                modal: _.assignIn({}, this.state.modal, { profile: true })
            })
            
            this.getNoteHistoryList(MarketCode, el_target[0].getAttribute('data-attr'))
        })
    }

       // CLOSE PROFILE MODAL
       handleProfileModalClose = () => {
        this.setState({
            custSelect: {},
            modal: _.assignIn({}, this.state.modal, { profile: false })
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

    handleUpdateActionLog = (action_logs, element_cell) => {

    }

    handleGetLayout = (mktcode) => {
        const { isImg, OpenSidebar, zoomDisable, FullScreen, imgConfig } = this.props
        let { pvZoneAvaliable } = this.state

        if(mktcode && !_.isEmpty(mktcode)) {
            const request_set = new Request(`${config.hostapi}/layouts/mktc/${mktcode}/market`, {
                method: 'GET',
                cache: 'no-cache',
                header: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset="UTF-8";'
                })
            })
    
            fetch(request_set)
            .then((response) => response.json())
            .then((resp) => {
                
                if (resp.status) {
    
                    const data = resp.data
                    this.setState({ layouts: data })
    
                    const side_list = data.sidename_activation
                    const scale_extends = data.extended_activation
                    const addition_extends = data.addition_activation
                    const box_list = data.boxsname_activation
                    const customer_potential = data.customer_potential

                    if (side_list && side_list.length > 0) {
                        _.forEach(side_list, (v) => {
                            if (parseBool(v.HasTable)) {
                                this.createTable(document.querySelector(`#${v.LayoutID}_previews`), `${v.LayoutID}_previews`, v, box_list)
                            }

                            if (scale_extends && scale_extends[0]) {
                                const cell_scale = _.filter(scale_extends, { LayoutID: v.LayoutID })
                                if (cell_scale && cell_scale.length > 0) {
                                    _.forEach(cell_scale, (data) => {
                                        let cell_target = document.querySelector(`#${v.LayoutID}_previews`).querySelector(`td[ref="${data.ColumnCell}"]`)
                                        this.checkExtendedScaleCell(cell_target, data.ApplicationNo, data.PrimaryCell)
                                    })
    
                                }
                            }
    
                            if (customer_potential && customer_potential.length > 0) {
                                _.forEach(customer_potential, (potential) => {
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

                            let zone_avaliable = document.querySelectorAll(`.${styles['grid_layout_zone']}.avaliable`)
                            if(zone_avaliable && zone_avaliable.length == 1) {
                                let zone_wrapper = document.getElementById('grid_previews')
                                zone_wrapper.classList.add(styles['single'])
                                // $('#zoom_parent').css({ width: 'fit-content', height: 'fit-content' })
                                $('#zoom_parent').css({ width: '-webkit-fill-available', height: '-webkit-fill-available' })
                            }

                            if(FullScreen === false && !zoomDisable) {
                                let $section = $('#grid_wrapper')
                                let $panzoom = $section.find('.panzoom').panzoom({ 
                                    startTransform: 'scale(0.5)', 
                                    minScale: 0.5
                                    // contain: true
                                })

                                $panzoom
                                .parent()
                                .on('mousewheel.focal', function( e ) {
                                    e.preventDefault();
                                    let delta = e.delta || e.originalEvent.wheelDelta
                                    let zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0
                                    $panzoom.panzoom('zoom', zoomOut, {
                                        animate: false,
                                        focal: e
                                    })
                                })
                            }

                            
                            if(FullScreen === true && !zoomDisable) {

                                let $section = $('#grid_wrapper')
                                let $panzoom = $section.find('.panzoom').panzoom({ 
                                    startTransform: 'scale(1.0)', 
                                    minScale: 0.5
                                    // contain: true
                                })

                                $panzoom
                                .parent()
                                .on('mousewheel.focal', function( e ) {
                                    e.preventDefault();
                                    let delta = e.delta || e.originalEvent.wheelDelta
                                    let zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0
                                    $panzoom.panzoom('zoom', zoomOut, {
                                        animate: false,
                                        focal: e
                                    })
                                })

                                /*
                                let translateX = 0,
                                    translateY = 0,
                                    translateZ = 0,
                                    stepZ = 10,
                                    stepX = 60,
                                    stepY = 90,
                                    initial_obj_X = 0,
                                    initial_obj_Y = 0,
                                    initial_mouse_X = 0,
                                    initial_mouse_Y = 0
                            
                                function apply_coords() {
                                    $("#grid_previews").css("transform", 'perspective(100px) translate3d(' + translateX + 'px, ' + translateY + 'px, ' + translateZ + 'px)');
                                }
           
                                $("#zoom_parent").on("mousewheel DOMMouseScroll", function(e) {                        
                                    e.preventDefault()

                                    let delta = e.delta || e.originalEvent.wheelDelta
                                    let zoomOut

                                    if (delta === undefined) {
                                        delta = e.originalEvent.detail
                                        zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0
                                        zoomOut = !zoomOut
                                    } else {
                                        zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0
                                    }

                                    if (zoomOut) {
                                        translateZ = translateZ - stepZ
                                        translateX = translateX - stepX
                                        translateY = translateY - stepY
                                    } else {
                                        translateZ = translateZ + stepZ
                                        translateX = translateX + stepX
                                        translateY = translateY + stepY
                                    }

                                    if(zoomOut == false) {                                    
                                        if(translateZ <= 0) {
                                            apply_coords()                                       
                                        } else {
                                            translateX = 0
                                            translateY = 0
                                            translateZ = 0
                                            stepZ = 10
                                            stepX = 60,
                                            stepY = 90,
                                            initial_obj_X = 0
                                            initial_obj_Y = 0
                                            initial_mouse_X = 0
                                            initial_mouse_Y = 0
                                            $('#grid_previews').css({ height: `${heightMaxScreen}px`, width: `${widthMaxScreen}px`})
                                        }
                                    } else {
                                        apply_coords()
                                        if(translateZ <= 50) {
                                            $('#grid_previews').css({ height: `fit-content`, width: `fit-content`})
                                        }
                                    
                                    }
                                })
                    
                                // BINDING MOUSEWHEEL DISABLED
                                $('#zoom_parent').bind("mousewheel", function() { return false })
                                */
                            }

                            // GET PARENT MODAL
                            let parentTarget = $('#grid_previews')
                                
                            // GRID HANDLE: SET CONDITION DISPLAY
                            let zaval = _.uniq(pvZoneAvaliable)
                            switch(zaval.length) {
                                case 2:
                                    if(zaval[0] == `${config.PA01}` && zaval[1] == `${config.PA1}` || zaval[0] == `${config.PA1}` && zaval[0] == `${config.PA01}`) {
                                        parentTarget.removeClass(styles['grid']).addClass(styles['grid_vhalf'])
                                    }
                                break;
                                case 3:
                                case 4:
                                    $(`#${config.PA1}:not(.avaliable), #${config.PA01}:not(.avaliable), #${config.PAA01}:not(.avaliable), #${config.PAA1}:not(.avaliable)`)
                                    .find('table').css('visibility', 'hidden')
                                    .after((e, ui) => {
                                        $(`#${config.PA1}, #${config.PA01}, #${config.PAA01}, #${config.PAA1}`)
                                        .removeClass(styles['grid_vhalf']).addClass(styles['grid'])
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
                                document.querySelector(`#${config.PAA1}`).querySelector(`table`).offsetWidth, 
                                document.querySelector(`#${config.PAA01}`).querySelector(`table`).offsetWidth
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
                                $(`#${config.PAA1}`).css({ 'min-width': `${_.max(left_zone)}px` })
                                $(`#${config.PAA01}`).css({ 'min-width': `${_.max(left_zone)}px` })
                                // if(zaval.length == 2) {
                                //     parentTarget.css('grid-template-columns', `minmax(${_.max(left_zone)}px, ${_.max(width_zone)}px) repeat(2, 1fr) 0%`)
                                // }                         
                            }

                            // SUM MAX WIDTH OF ZONE
                            let total_width_zone = _.sum(leftsize_zone) + 92     
                            let total_height_zone = _.sum([_.max(habove_zone), _.max(hbelow_zone)]) + 50
                            
                            // SET ZONE SIDE FIXIBLE EQUAL TO CONTENT AND WRAPPER MODAL
                            const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight)
                            const style_total = `min-width: ${total_width_zone}px; min-height: ${total_height_zone}px; height: -webkit-fill-available;`
    
                            const modalBody = $(`.${styles['gridWrapper']}`).find('.ant-modal-body')
                            modalBody.removeAttr('style').attr('style', style_total)
                            $(`.${styles['gridWrapper']}`).find('.ant-modal').css('width', '100%').css('min-width', `${total_width_zone}px`)
    
                            // WRAPPER THE MAIN ZONE               
                            $(`#parent_${config.PA1}`).addClass(`${styles['zone_main']}`)
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
    
                            if ($(`.${styles['gridWrapper']}`).children().length) {
                                const content_modal = $(`.ant-modal-wrap.${styles['gridWrapper']}`)
    
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
    
                            // LOAD ELEMENT SCRUMBLE TO ZONE AREA
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

                                if(isImg) {                                    
                                    domToImage.toPng(document.getElementById('grid_previews'))
                                    .then((dataUrl) => {
                                        let img = (imgConfig && !_.isEmpty(imgConfig)) ? new Image(imgConfig.width, imgConfig.height) : new Image()
                                        img.src = dataUrl
                                
                                        $('#grid_wrapper').html(img)
                                    })
                                    .catch(function (error) { console.error('oops, something went wrong!', error)  })
                                }
                            
                            }

                            this.setState({ sidebar: OpenSidebar })
    
                        }
    
                    }

                }
            })
            .catch(err => { console.log(`fetch error ${err}`) })
        }
        
    }

    createTable = (el_target, el_name, options = {}, scrumble) => {
        // INCLUDE RELATION DATA FOR CREATE LAYOUTS WITH A TABLE TYPE
        const { layouts, customers } = this.state

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
            class_style = `${cls['table_direct_rtl']}`
            rtl = true
        }

        // CHECK THE ELEMENT HAVE A RUNNING NUMBER WITH FIRST ZERO NUMBER
        if (in_array(el_name, config.padZero)) {
            class_fix = `${cls['grid_layout_flaxdown']}`
            rtp = true
        }

        // CALULATE SIZE FOR RESIZE TABLE
        resize = (config.cellSize * config.gridDefault.length)
        const css = `min-width: ${resize}px; min-height: ${resize}px;`

        let fix_right = `${cls['grid_layout_flaxright']}`
        let grid_table = createElement('div', { id: `parent_${el_name}`, 'data-parent': el_name, 'ref': `parent_${el_name}`, 'class': `${cls['grid_layout_parent']} ${cls['undashed']} ${class_fix} ${(rtl) && fix_right}`, 'originalHeight': resize, 'originalWidth': resize, draggable: false },
            createElement('table', { id: `table_${el_name}`, 'data-parent': el_name, ref: `table_${el_name}`, 'class': `${cls['table_container']} ${(rtl) && cls['table_direct_rtl']} ${class_style} ${(rtl) && 'place-right'}`, 'rtl': rtl, 'rtp': rtp, 'style': css, draggable: false },
                createElement('tbody', { id: `table_${el_name}_body`, ref: `table_${el_name}_body`, draggable: false }, this.createColumn(el_name, rtl, rtp))
            )
        )

        // // APPENT TO ELEMENT TARGET
        el_target.appendChild(grid_table)

        // CHECK THE ZONE CONDITION CRITERIA
        if(in_array(el_name, config.pvLayout)) {               
            // GET THE ZONE ELEMENT 
            let prev_element = document.querySelector(`#${el_name}`)     
            
            if(options.TblCols == 2 && options.TblRows == 2) {
                let data_street = (scrumble && scrumble.length > 0) ? scrumble : []
                let scrumble_exist = _.filter(data_street, { BoxInsideParent: el_name })
                if(scrumble_exist && scrumble_exist.length == 0) {
                    prev_element.style.display = 'none'
                }
                
            } else {
                prev_element.classList.add("avaliable")
                this.state.pvZoneAvaliable.push(el_name)  
            }
    
        }

        // BINDING THE EVENT FOR OPEN PROFILE MODAL
        $(el_target).find('td').on(profileClickEvent, (event) => {
            const cell = $(event.target).parent()
            if (in_array(cls['cell_active'], cell[0].classList)) {
                this.handleProfileModal(cell)
            }
        })

        if (options.LayoutName) {

            let layoutName = `${options.LayoutName}_previews`
            let originalHeight = options.OriginalHeight
            let originalWidth = options.OriginalWidth

            let route_position = this.routeIDHelper(layoutName)
            let success = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[0], { height: originalHeight, width: originalWidth })
            if (success) {
                let completed = this.createCellDragable(document.getElementById(`parent_${layoutName}`), layoutName, route_position[1], { height: originalHeight, width: originalWidth })

                if (completed) {
                    if (layouts.cellname_activation && layouts.cellname_activation.length > 0) {
                        this.createCellAssignment(layouts.cellname_activation)

                        _.delay(() => {
                            const cell = document.getElementById('grid_previews').querySelectorAll(`.${cls['cell_active']}`)
                            const cust = (customers && customers.length > 0) ? customers : []
                            if (cell && cell[0] && cell.length > 0) {
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

    // CREATE CELL RELATION FOR GROWTH SCALE OF CUSTOMER CELL
    checkExtendedScaleCell = (el, appno, primary_id) => {
        const { customers } = this.state

        if(customers && customers.length > 0) {
            const cust_data = _.filter(customers, { ApplicationNo: appno })[0]

            $(el).attr('data-class-original', $(el).attr('class'))

            if(cust_data) {

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
           
            

        }

    }

    // POTENTIAL CUSTOMER ON BUNDLE
    handleSetPotentialOnCell = (element_cell, data) => {
        const text_content = element_cell.attr('ref')
       
        const customer_name = (data && data.CustomerName != '') ? data.CustomerName : null
        const is_potential = (data && data.IsPotential == 'Y') ? 'YES' : 'NO'

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
                element_cell.on(profileClickEvent, (e) => { 
                    this.handleCustPotential(element_cell, false) 
                })
            })
        })

    }

    // ASSIGNMENT HANDLE: CUSTOMER ADDITIONAL BUNDLE
    setAdditionBundle = (cust_addtion, el_preview = null) => {
        const { customers } = this.state
        let master_assignlist = (customers && customers.length > 0) ? customers : []

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

        let top_default = (ui.top / config.cellSize)
        let left_default = (ui.left / config.cellSize)
        let scroll_top = (scrollbar.scrollTop / config.cellSize)
        let scroll_left = (scrollbar.scrollLeft / config.cellSize)
            
        let top__def = ((config.cellSize * roundFixed(top_default, 0)) + top_opt) - config.cellSize
        let left__def = (config.cellSize * roundFixed(left_default, 0)) + left_opt
        let top_martrix = (config.cellSize * roundFixed(scroll_top, 0))
        let left_martrix = (config.cellSize * roundFixed(scroll_left, 0))
     
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
        const configData = config.gridDefault
        if (rtp) {
            let rows = []
            _.forEachRight(configData, (r, rIndex) => {
                rows.push(createElement('tr', { 'rows-id': `${r}`, ref: `rows_${r}`, draggable: false }, this.createCell(configData, r, el_name)))
            })
            return rows
        }
        else {
            if (typeof configData[0] !== undefined) {
                return _.map(configData, (r, rIndex) => {
                    return createElement('tr', { 'rows-id': `${r}`, ref: `rows_${r}`, draggable: false }, this.createCell(configData, r, el_name))
                })
            }
        }
    }

    createCell = (cols, seq, el_name) => {
        let pad_zero = false,
            rtl_table = false

        if (in_array(el_name, config.padZero)) {
            pad_zero = true
        }

        if (in_array(el_name, config.rtl)) {
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
                    'class': `${cls['untouch']} ${'context-cell-menu'}`,
                    'ref': `${el_char}${el_nums}`,
                    'width': config.cellSize,
                    'height': config.cellSize,
                    'style': `max-height: ${config.cellSize}px !important; max-width: ${config.cellSize}px !important;`,
                    'draggable': 'false'
                },
                createElement('div', { 'class': `${cls['cell']}` }, `${el_char}${el_nums}`)
            )
        })

    }

    // MANUAL HANDLE CREATE CELL AND HANDLE REMOVE CELL
    createCellDragable = (el_target, el_name, route, size) => {    
        const { isGetCell, handleGetCell } = this.props

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

                height_diff = (size.height - parseInt(height)) / config.cellSize
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
                let element_resize = config.cellSize * rows_length

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

                width_diff = (size.width - parseInt(width)) / config.cellSize
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
                let element_resize = config.cellSize * td_length

                el_target.style.width = `${element_resize}px`
                el_target.style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.minWidth = `${element_resize}px`
                el_target.querySelector('table').style.maxWidth = `${element_resize}px`
                el_target.setAttribute('originalWidth', element_resize)
            }

            $(el_target).find('td').on(profileClickEvent, (event) => {
                const cell = $(event.target).parent()
                if (in_array(cls['cell_active'], cell[0].classList)) {
                    this.handleProfileModal(cell, el_name)
                }
            })

            if(isGetCell) {
                $(el_target).find('td').on(profileClickEvent, (event) => { 
                    const cell = $(event.target).parent()
                    if(cell.prop("tagName") == 'TD' && !in_array(cls['cell_extended'], cell[0].classList)) {
                        handleGetCell(cell) 
                    }                
                })               
            }
            
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
                width_diff = (width - numValid(size.width)) / config.cellSize     
                calNewCols = roundFixed(width_diff, 0)

                // VARIABLE VERIFY AND LOOP REMOVE COLS
                if (calNewCols > 0) {
                    _.forEach(this.generateArr(calNewCols), (v, i) => {
                        $(table_target).find('tbody tr td:last-child').remove()
                    })
                }

                // SET A TABLE TO NEW CURRENT SIZE
                const td_length = table_target.querySelectorAll('tbody tr:first-child td').length
                let element_resize = config.cellSize * numValid(td_length)

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

                height_diff = (parseInt(height) - numValid(size.height)) / config.cellSize
                calNewRow = roundFixed(height_diff, 0)

                if (calNewRow > 0) {
                    _.forEach(this.generateArr(calNewRow), (v, i) => {
                        $(table_target).find('tbody tr:last-child').remove()
                    })
                }

                const rows_length = table_target.querySelectorAll('tbody tr').length
                let element_resize = config.cellSize * numValid(rows_length)

                el_target.style.height = `${element_resize}px`
                el_target.style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.minHeight = `${element_resize}px`
                el_target.querySelector('table').style.maxHeight = `${element_resize}px`
                el_target.setAttribute('originalHeight', element_resize)
            }
 
        }

        return true
        
    }

    // CELL STATE BUNDLE HANDLER 
    // ASSIGNMENT HANDLE
    createCellAssignment = (cellItems) => {
        if (cellItems && cellItems.length > 0) {
            // CHECK ARE CUSTOMER LIST WITH REFERENCE NO AND FIND THE ELEMENT IN LAYOUTS
            _.forEach(cellItems, (v) => {
                // CHECK PREVIEW OR CREATE MODE FOR SET THE EVENT OF FINDING ELEMENTS
                let element_cell = $(`#grid_previews`).find(`td[ref="${v.ColumnCell}"]`)
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
        const { customers } = this.state

        // FIND CUSTOMER INFORMATION BY APPLICATION NO
        let findCustomer = _.filter(customers, { ApplicationNo: data.ApplicationNo })

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
        element_cell.find(`div.${cls['cell']}`)
        .html(
            '<div class="' + cls['cell_inside_header'] + '" title="' + str_title + '">' + cell_header + '</div>' +
            '<div class="' + cls['cell_inside_bottom'] + '">' + text_content + '</div>'
        )

        // FIND ARE ELEMENT TARGET AND BINDING EVENT TO CELL IN CONTENT (EVENT IS SHOW THE CUSTOMER PROFILE AT MODAL)
        element_cell.find(`div.${cls['cell']}`).find(`.${cls['cell_inside_header']}, .${cls['cell_inside_bottom']}`).on(profileClickEvent, (event) => {
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

    // SET CUSTOMER STATUS TO ELEMENT CELL IN LAYOUTS
    checkCellOnhand = (findCustomer) => {
        const { bktFullNotRisks } = config

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

    handleCustPotential = (el_target, is_create = true) => {
        notification.info({
            message: 'แจ้งเตือนจากระบบ',
            description: 'ขออภัย! อยู่ระหว่างปรับปรุงเนื้อหา',
        })
        // const { layouts } = this.state
        // this.setState({
        //     assignCell: el_target,
        //     mktPotential: layouts.customer_potential,
        //     visible: _.assignIn({}, this.state.visible, { potential_modal: true, cell_extension_tool: false }),
        //     firstCreatePotential: is_create
        // })
    }

    handleCustPotentialClose = () => {
        // this.setState({ 
        //     visible: _.assignIn({}, this.state.visible, { potential_modal: false, cell_extension_tool: false }),
        //     mktPotential: []
        // })
    }
    

    // SET CUSTOMER STATUS TO ELEMENT CELL IN LAYOUTS, WILL BE USE HAVE STATUS CHANGE
    onChangeStateCell = (result) => {
        const { bktFullNotRisks } = config
    
        if (result) {
            let current_bucket = (result.Cust_DPDBucketNow) ? result.Cust_DPDBucketNow : null
            let principle = (result.Principle) ? result.Principle : null
            let status = (result.Status) ? result.Status : null
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
    

    /*** FUNCITONAL ***/
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

const MarketLayoutCKWrapper = withCookies(MarketLayoutCtrl)
export default withRouter(
    connect(
        (state) => ({
            BRANCH_MARKET_PROFILE: state.GET_BRANCH_MARKET_PROFILE,
            MARKETSHARE_CA_INFO: state.GET_MARKETSHARE_CAINFO,
            EMP_TESTER_INFO: state.GET_EMP_TESTER_INFO,
        }),
        {
            GET_BRANCHMARKET_INFO: getBranchMarketInfo,
            GET_MARKETSHARE_CA: getMarketShareByCA,
            GET_EMP_TESTER_DATA: getEmpTesterInfo,
        }
    )(MarketLayoutCKWrapper)
)