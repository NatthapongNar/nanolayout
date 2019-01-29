import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import bluebird from 'bluebird'
import { withCookies, Cookies } from 'react-cookie'
import { Badge, Popover, notification } from 'antd'
import moment from 'moment'
import _ from 'lodash'

import GridLayoutTemplate from '../../components/GridLayout'

import { in_array, parseBool, strFloat, qs_parse } from '../../containers/Layouts/function'
import { config, notifig } from './config'
import { gridMarketAPI, gridCustomerAPI } from './api'

import { MASTER_REGION_FILTER, MASTER_AREA_FILTER, MASTER_BRANCH_FILTER, MASTER_CALIST_FILTER } from '../../actions/masters'
import styles from '../../utilities/_general.scss'

const cookies = new Cookies()
const default_cklang = cookies.get(config.cookies_config.name.lang, { path: config.cookies_config.path })
const default_lang = (default_cklang) ? default_cklang.region_type : 'en'

class GridLayout extends Component {

    // DECLARE CONSTRUCTOR
    constructor(props) {
        super(props)

        let inquiry = false
        const qs = qs_parse(props.location.search)        
        if(!_.isEmpty(qs) && !_.isEmpty(qs.UID)) {
            inquiry = true           
        }

        console.log(`status mode: ${inquiry}`)

        // STATE CONFIGURATION
        this.state = {
            gridInquiry: inquiry,
            visible: {
                collapsed: true,
                unavaliable: false
            },            
            pageHandle: {
                main: false,
                camange: false,
                dashboard: true,
                grid_cust: false
            },
            lang: {
                region_type: default_lang,
                config: config.lang_instant
            },
            progress: {
                first_load: false,
                visible: false,
                title: config.lang[default_lang].grid.market.title,
                desc: config.lang[default_lang].progress.auth,
                status: 0
            },
            grid_market: [],
            modal: {
                auth: null,
                customer: false
            },
            grid_customer: {
                dataSource: [],
                status: false
            },
            marketFilter: {
                AuthID: null,
                Assignment: 'A',
                Region: [],
                Area: [],
                Branch: [],
                BranchType: ['L', 'P', 'K'],
                Employee: [],
                Optional: [],
                MarketName: null
            },
            gridCustFilter: {
                AuthID: null,
                MarketCode: null,
                ActiveState: 'Y',
                Assignment: 'A'
            },
            authen: {
                Auth: {},
                Deparment: null,
                Role: null,
                Session: [],
                Status: false
            }
        }

    }

    // SETUP ARE CONFIG BEFORE RENDERING TO CONTAINER
    componentWillMount() {
        const { gridInquiry } = this.state
        // DECLARE COOKIES INSTANT AND LOAD DEFAULT CONFIG FOR FIND THE DATA COOKIES INFORMATION
        const { cookies, LOAD_MASTER_REGION_FILTER, LOAD_MASTER_AREA_FILTER, LOAD_MASTER_BRANCH_FILTER, LOAD_MASTER_CALIST_FILTER } = this.props
        const ck_config = config.cookies_config

        // GET COOKIES INFO OF USER AND CHECK DATA COOKIES IF HAVE A COOKIES WILL SET TO STATE
        const cookie_auto_setup = [
            { key: ck_config.name.visible, data: (parseBool(gridInquiry)) ? { collapsed: true, unavaliable: true } : cookies.get(ck_config.name.visible, { path: ck_config.path }) },
            { key: ck_config.name.authen, data: cookies.get(ck_config.name.authen, { path: ck_config.path }) },
            { key: ck_config.name.lang, data: cookies.get(ck_config.name.lang, { path: ck_config.path }) }
        ]
        
        // CHECK WAS HAS COOKIE INFORMATION SO IF HAS THE COOKIES WILL SET TO STATE
        if (cookie_auto_setup && cookie_auto_setup.length > 0) {
            _.forEach(cookie_auto_setup, (v, i) => {
                let cookie_state = {}
                if (v.data) {
                    cookie_state[v.key] = v.data
                }
                this.setState(cookie_state)
            })
        }

        // LOAD MASTER TABLE FOR DROPDOWN BEFORE RENDER
        const API_LIST_CALL = [
            LOAD_MASTER_REGION_FILTER,
            LOAD_MASTER_AREA_FILTER,
            LOAD_MASTER_BRANCH_FILTER,
            LOAD_MASTER_CALIST_FILTER
        ]

        bluebird.all(API_LIST_CALL).each(fn => fn())

        // CHECK AUTHORITY 
        let authen_data = _.filter(cookie_auto_setup, { key: ck_config.name.authen })[0]
        if (!authen_data || !authen_data.data) {

            _.delay(() => {
                this.setState({
                    progress: _.assignIn({}, this.state.progress, {
                        desc: config.lang[default_lang].progress.expired,
                        status: 2
                    })
                })
            }, 1000)
            _.delay(() => { window.location.href = 'http://tc001pcis1p/login/' }, 2000)

        } else {
            const { Auth } = authen_data.data

            // CHANGE STATE PROGRASS AND ASSIGNMENT AUTHENICATION TO CONDITION OF API
            this.setState({
                marketFilter: _.assignIn({}, this.state.marketFilter, { AuthID: Auth.EmployeeCode }),
                gridCustFilter: _.assignIn({}, this.state.gridCustFilter, { AuthID: Auth.EmployeeCode }),
                progress: _.assignIn({}, this.state.progress, {
                    desc: config.lang[default_lang].progress.success,
                    status: 1
                }),
                authen: authen_data.data
            })

        }

    }

    componentDidMount() {
        const { lang, pageHandle } = this.state

        // NOTIFICATION: WHEN COOKIE STATE OF SCREEN HAVE A CHANGE 
        if (lang.region_type) {
            notification.info(notifig(lang.config.screen_config, lang.region_type))
        }

    }

    // PROGRESS HANDLER
    handleProgressKeyword = (pageHandle) => {
        const { lang } = this.state

        let f = _.findKey(pageHandle, (o) => { return (o) && o })
        if (f == 'dashboard') {
            /* title: config.lang[lang.region_type].grid.title, */
            return config.lang[lang.region_type].progress.loading
        }

    }

    // ZONE HANDLE FUNCTIONAL
    // SIDEAR HANDLE: CONTROL THE COLLAPSE OF SIDER
    handleSider = () => {
        const { cookies } = this.props
        const ck_config = config.cookies_config

        // SET DATA 
        let data_set = _.assignIn({}, this.state.visible, { collapsed: !this.state.visible.collapsed })
        // SET COOKIE
        cookies.set(ck_config.name.visible, data_set, { path: ck_config.path, expires: ck_config.expires })
        // SET STATE
        this.setState({ visible: data_set })
    }

    // SIDER HANDLE: CONTROL DISPLAY OF SIDER
    handleSiderState = () => {
        const { cookies } = this.props
        const ck_config = config.cookies_config

        let data_set = _.assignIn({}, this.state.visible, { unavaliable: !this.state.visible.unavaliable, collapsed: true })
        cookies.set(ck_config.name.visible, data_set, { path: ck_config.path, expires: ck_config.expires })

        this.setState({ visible: data_set })
    }

    // LOCALE HANDLER 
    handleLangState = (lang) => {
        const { cookies } = this.props
        const ck_config = config.cookies_config

        let set_lang = _.assignIn({}, this.state.lang, { region_type: lang.key })
        cookies.set(ck_config.name.lang, set_lang, { path: ck_config.path, expires: ck_config.expires })

        this.setState({ lang: set_lang })
    }

    // PAGE CONTENT HANDLE: CONTROL PAGE CONTENT TO CONTAINER APP
    handlePageContent = (pageState) => {
        const { cookies } = this.props
        const ck_config = config.cookies_config
        const { Auth } = this.state.authen
        
        // FIND ACTIVE STATE
        let f = _.findKey(this.state.pageHandle, (o) => { return (o) && o })

        // DECLARE VARIABLE FOR GET CHANGE STATE
        let oldState = {},
            newState = {}

        // SET DEACTIVE CURRENT STATE TO NEW STATE 
        oldState[f] = false
        newState[pageState.key] = true

        if(pageState.key == 'main') {
            let data_market = cookies.get(ck_config.name.market, { path: ck_config.path })
            if(!_.isEmpty(data_market)) {
                this.setState({ grid_market: data_market, progress: false })  
            } else {
                this.handleSearchGridMarket(_.assignIn({}, this.state.marketFilter, { AuthID: Auth.EmployeeCode }), {}, false) 
            }            
               
        }

        // SET UP TO STATE OF SYSTEM
        this.setState({ pageHandle: _.assignIn({}, this.state.pageHandle, _.mergeWith(oldState, newState)) })

    }

    // PAGE CONTENT HANDLE CONTROL MAIN CONTENT TO GRID CUSTOMER LAYOUT
    handleGridCustomer = (MarketCode) => {
        let f = _.findKey(this.state.pageHandle, (o) => { return (o) && o })

        let oldState = {}
        oldState[f] = false

        this.setState({
            pageHandle: _.assignIn({}, this.state.pageHandle, _.mergeWith(oldState, { grid_cust: true })),
            gridCustFilter: _.assignIn({}, this.state.gridCustFilter, { MarketCode: MarketCode }),
            progress: _.assignIn({}, this.state.progress, { visible: true, desc: this.handleProgressKeyword(_.mergeWith(oldState, { grid_cust: true })) })
        })

        _.delay(() => {
            this.handleGridCust(this.state.gridCustFilter)
        }, 200)

    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.lang !== nextState.lang ||
            this.state.authen !== nextState.authen ||
            this.state.visible !== nextState.visible ||
            this.state.progress !== nextState.progress ||
            this.state.pageHandle !== nextState.pageHandle ||
            this.state.grid_market !== nextState.grid_market ||
            this.state.grid_customer !== nextState.grid_customer ||
            this.state.marketFilter !== nextState.marketFilter ||
            this.state.gridCustFilter !== nextState.gridCustFilter ||
            this.state.gridInquiry !== nextState.gridInquiry ||
            this.state.modal !== nextState.modal
    }

    // ELEMENT RENDERING
    render() {
        return (
            <GridLayoutTemplate
                lang={this.state.lang}
                modal={this.state.modal}
                authen={this.state.authen}
                masters={this.props.masters}
                visible={this.state.visible}
                progress={this.state.progress}
                pageHandle={this.state.pageHandle}
                gridInquiry={this.state.gridInquiry}
                marketDataList={this.state.grid_market}
                customerDataList={this.state.grid_customer}
                marketFilterList={this.state.marketFilter}
                customerFilterList={this.state.gridCustFilter}
                handleSider={this.handleSider}
                handleSiderState={this.handleSiderState}
                handleLangState={this.handleLangState}
                handlePageContent={this.handlePageContent}
                handleSearchGridMarket={this.handleSearchGridMarket}
                handleSearchGridCustomer={this.handleSearchGridCustomer}
                handleCloseCustomerModal={this.handleCloseCustomerModal}
            />
        )
    }

    // PROCESS METHOD
    handleSearchGridMarket = (param, options = {}, search = false) => {
        const { pageHandle } = this.state

        let setParam = {
            Assignment: param.Assignment,
            Region: (param.Region && param.Region.length > 0) ? param.Region.join(',') : null,
            Area: (param.Area && param.Area.length > 0) ? param.Area.join(',') : null,
            Branch: (param.Branch && param.Branch.length > 0) ? param.Branch.join(',') : null,
            BranchType: (param.BranchType && param.BranchType.length > 0) ? param.BranchType.join(',') : null,
            Employee: (param.Employee && param.Employee.length > 0) ? param.Employee.join(',') : null,
            MarketName: (param.MarketName) ? param.MarketName : null,
            Optional: null,
            RegisterDateFrom: (param.RegisterRange && param.RegisterRange.length > 0) ? moment(param.RegisterRange[0]).format('YYYY-MM-DD') : null,
            RegisterDateTo: (param.RegisterRange && param.RegisterRange.length > 0) ? moment(param.RegisterRange[1]).format('YYYY-MM-DD') : null,
            ShopRangeFrom: (param.ShopRange && param.ShopRange.length > 0 && (options && options.shopable)) ? param.ShopRange[0] : null,
            ShopRangeTo: (param.ShopRange && param.ShopRange.length > 0 && (options && options.shopable)) ? param.ShopRange[1] : null
        }

        this.setState({
            marketFilter: _.assignIn({}, this.state.marketFilter, param),
            progress: _.assignIn({}, this.state.progress, {
                visible: true,
                desc: this.handleProgressKeyword(pageHandle),
                status: 0
            })
        })

        this.handleGridMarket(_.assignIn({}, this.state.marketFilter, setParam), search)
    }

    handleSearchGridCustomer = (param, options = {}) => {
        const { pageHandle } = this.state

        let setParam = {
            ActiveState: param.CustomerStatus,
            Assignment: param.Assignment,
            EmployeeCode: (param.Employee && param.Employee.length > 0) ? param.Employee.join(',') : null,
            CustomerName: (param.CustomerName) ? param.CustomerName : null,
            ApplicationNo: (param.ApplicationNo) ? param.ApplicationNo : null,
            AppInDateFrom: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[0]).format('YYYY-MM-DD') : null,
            AppInDateTo: (param.AppRange && param.AppRange.length > 0) ? moment(param.AppRange[1]).format('YYYY-MM-DD') : null,
            LeadOptional: (param.LeadOptional && param.LeadOptional.length > 0) ? param.LeadOptional.join(',') : null,
            Optional: null,
        }

        this.setState({
            gridCustFilter: _.assignIn({}, this.state.gridCustFilter, setParam),
            progress: _.assignIn({}, this.state.progress, {
                visible: true,
                desc: this.handleProgressKeyword(pageHandle),
                status: 0
            })
        })

        this.handleGridCust(_.assignIn({}, this.state.gridCustFilter, setParam))
    }

    handleOpenCustomerModal = (data) => {
        const { authen } = this.state

        const auth_code = (authen && !_.isEmpty(authen.Auth)) ? authen.Auth.EmployeeCode : null
        const mkt_code = (data && !_.isEmpty(data.MarketCode)) ? data.MarketCode : null
        this.setState({ modal: _.assignIn({}, this.state.modal, { 
                auth: `Market,${auth_code},${mkt_code}`, 
                customer: true 
            })
        })
    }

    handleCloseCustomerModal = () => {
        this.setState({ modal: _.assignIn({}, this.state.modal, { auth: null, customer: false }) })
    }

    // API METHOD
    handleGridMarket = (param, search = false) => {    
        const { cookies } = this.props
        const ck_config = config.cookies_config
        const { Auth } = this.state.authen   

        gridMarketAPI(param).then(resp => {
            if (resp && resp.length > 0) {
                let data = resp
                if (data && data.length > 0) {
                    _.map(data, (objData, i) => {

                        let create_url = (process.env.NODE_ENV == 'dev') ? `http://localhost:8080/marketlayout?marketcode=${objData.MarketCode.toLowerCase()}&fs=true&sidebar=false&genImg=true` : `http://tc001pcis1p/marketlayout?marketcode=${objData.MarketCode.toLowerCase()}&fs=true&sidebar=false&genImg=true`
                        let has_movement = (objData && objData.HasMovement == 'Y') ? 
                        (
                            <Popover content={`เลย์เอ้าท์มีการอัพเดท : ${objData.MovementType}`} placement="left">
                                <Badge dot><PopImage mktcode={objData.MarketCode} /></Badge>
                            </Popover>
                        ) : 
                        (<PopImage mktcode={objData.MarketCode} />)


                        objData.Preview = (objData && objData.ImageExist == 'Y') ? (<a href={create_url} target="_blank,_self">{has_movement}</a>) : (<a href={create_url} target="_blank,_self"><i className={`${styles['fg_gray']} fa fa-wrench`} aria-hidden="true"></i></a>)
                        objData.CustGrid = (<i className={`${styles['touch_icon']} fa fa-user ${styles['fg_darkCyan']}`} onClick={this.handleOpenCustomerModal.bind(this, objData)} />) // this.handleGridCustomer.bind(this, objData.MarketCode)
                        
                        if(!in_array(Auth.PositionCode.toUpperCase(), ['CA', 'PCA'])) {
                            objData.LayoutTool = (                           
                                <Link to="/nanolayout" target="_blank,_self" to={{ pathname: `/nanolayout/${objData.MarketCode.toLowerCase()}${objData.BranchCode}`}}>   
                                    <i className={`${styles['touch_icon']} ${styles['jump']} fa fa-edit`} />
                                </Link>       
                            )
                        } else {
                            objData.LayoutTool = (<i className={`${styles['fg_red']} fa fa-close`} />)
                        }

                        return objData
                    })
                }

                if(!search) {
                    cookies.set(ck_config.name.market, data, { path: ck_config.path })
                }

                this.setState({ grid_market: data })
            }
            this.setState({ progress: _.assignIn({}, this.state.progress, { visible: false, first_load: false }) })
        })
           
    }

    handleGridCust = (param) => {
        gridCustomerAPI(param).then(resp => {
            if (parseBool(resp.status)) {
                this.setState({
                    grid_customer: _.assignIn({}, this.state.progress, {
                        dataSource: _.map(resp.data, (objData, i) => {
                            objData.TopupAmount = strFloat(objData.TopupAmount)
                            return objData
                        }),
                        status: parseBool(resp.status)
                    })
                })
            }
            this.setState({ progress: _.assignIn({}, this.state.progress, { visible: false }) })
        })

    }

}

class PopImage extends Component {

    render() {
        const { mktcode } = this.props 
        const img = (mktcode) ? (<div id={`MKTLAYOUT_${mktcode}`} className={styles['img_container']} style={{ backgroundImage: `url(http://172.17.9.94/newservices/LBServices.svc/nano/layout/image/${mktcode})`, border: '2px solid #000' }}></div>) : (<div>ไม่พบข้อมูล</div>)
        return (
            <span onMouseOver={handlePopoverStyle.bind(this, `MKTLAYOUT_${mktcode}`)}>
                <Popover content={img} trigger="hover" placement="left">
                    <i className={`${styles['fg_darkCyan']} fa fa-eye`} />
                </Popover>
            </span>
        )
    }

}


const handlePopoverStyle = (e) => {    
    _.delay(() => { 
        let element = $(`#${e}`).parents()       
        if(element) {
            $(element[0]).css('padding', '0px')
            $(element[1]).css('background', '#FFF ')
            $(element[2]).css('background', '#FFF ')
            $(element[3]).css('background', '#FFF ')

            let el_arrow = $(element[3]).children()[0]            
            if(el_arrow) {
                $(el_arrow).css({ 'background': '#FFF', 'display': 'none' })
            }
        }
        
    }, 200)

}

const gridLayoutWithCookies = withCookies(GridLayout)
export default withRouter(connect(
    (state) => ({
        masters: state.masters
    }),
    {
        LOAD_MASTER_REGION_FILTER: MASTER_REGION_FILTER,
        LOAD_MASTER_AREA_FILTER: MASTER_AREA_FILTER,
        LOAD_MASTER_BRANCH_FILTER: MASTER_BRANCH_FILTER,
        LOAD_MASTER_CALIST_FILTER: MASTER_CALIST_FILTER
    }
)(gridLayoutWithCookies))

