import React, { Component } from 'react'
import { LocaleProvider, Layout, Menu, Dropdown, Icon, Avatar, Tooltip } from 'antd'
import { withRouter } from 'react-router-dom'
import { config } from '../../containers/GridLayout/config'
import moment from 'moment'
import _ from 'lodash'

import Dashboard from './dashboard'
import GridMarket from './table/grid_market'
import GridCustomer from './table/grid_customer'
import GridMangement from './table/grid_mange'
import GridCustInquiry from './table/grid_customer_table'
import CustomerDashboard from '../../components/GridLayout/table/grid_customer_modal'
import Loader from './loader'

import cls from './style/layout_template.scss'
import styles from '../../utilities/_general.scss'
import logo from '../../../../images/tcrbank_logo.png'

import en from 'antd/lib/locale-provider/en_US'
import th from 'antd/lib/locale-provider/th_TH'

import 'moment/locale/en-gb'
import 'moment/locale/th'
import { parseBool, in_array } from '../../containers/Layouts/function'

const { Header, Content, Footer, Sider } = Layout
const MenuItem = Menu.Item

class GridLayoutTemplate extends Component {

    constructor(props) {
        super(props)

        const { Auth } = this.props.authen

        this.state = {
            active_menu: [config.sidebarMenu[config.sidebarActiveDefault].key],
            handle_field: {
                region: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['RD', 'AM', 'ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                area: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                zone: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['ZM', 'TM', 'CA', 'PCA'])) ? true : false,
                branch: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['TM', 'CA', 'PCA'])) ? true : false,
                ca: (Auth && in_array(Auth.PositionCode.toUpperCase(), ['CA', 'PCA'])) ? true : false
            }     
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.lang !== nextProps.lang || 
               this.props.authen !== nextProps.authen ||
               this.props.visible !== nextProps.visible ||
               this.props.progress !== nextProps.progress ||
               this.props.pageHandle !== nextProps.pageHandle ||
               this.props.marketDataList !== nextProps.marketDataList ||
               this.props.customerDataList !== nextProps.customerDataList ||
               this.props.gridInquiry !== nextProps.gridInquiry ||
               this.props.modal !== nextProps.modal ||
               this.state.handle_field !== nextState.handle_field
    }

    render() {

        const {
            lang,
            visible,
            progress,
            pageHandle,
            gridInquiry,
            handleSiderState,
            handlePageContent
            
        } = this.props

        let collapsed = (visible.collapsed) ? cls['collapsed'] : ''
        let siderItem = (visible.collapsed) ? cls['item_collapsed'] : ''

        let load_config = {
            size: 200,
            title: (progress && progress.first_load) ? progress.title : config.lang[lang.region_type].grid.market.title,
            desc: (progress && progress.first_load) ? progress.desc : config.lang[lang.region_type].progress.loading,           
            status: (progress && progress.first_load) ? progress.status : 0,
            center: true
        }

        return (
            <Layout className={`${cls['grid_layout_container']}`}>
                <Sider
                    collapsible
                    collapsed={visible.collapsed}
                    collapsedWidth={50}
                    trigger={(!visible.unavaliable) ? this.handleTrigger() : null}
                    className={`${cls['grid_sider']} ${collapsed} ${(visible.unavaliable) ? cls['unavaliable'] : ''}`}
                >
                    <div className={`${cls['grid_logo']} ${collapsed}`}>
                        <div className={`${cls['grid_item']}`}>
                            <img src={logo} className={`${cls['rotateEase180']} animated zoomIn`} />
                        </div>
                        <div className={`${cls['grid_item']} ${cls['grid_brand']} ${collapsed}`}>NANO LAYOUT</div>
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={this.state.active_menu} mode="inline" style={{ width: `auto` }} onClick={handlePageContent}>
                        {
                            _.map(config.sidebarMenu, (v, i) => {
                                return (
                                    <MenuItem key={`${v.key}`} className={`${siderItem}`} disabled={v.disable} style={{ display: (v.hide) ? 'none':'block' }}>
                                        <Icon type={`${v.icon}`} />
                                        <span>{config.lang[lang.region_type].sidebar[v.key]}</span>
                                    </MenuItem>
                                )
                            })
                        }
                    </Menu>
                </Sider>
                <Layout>
                    <Header className={`${cls['grid_nav']}`}>
                        <div className={`${cls['grid_nav_item']} ${cls['menu']}`}>
                            <div className={`${cls['sub_nav_item']} ${(!visible.unavaliable) ? cls['hide'] : ''} ${(gridInquiry) ? cls['hide'] : ''}`} onClick={handleSiderState}>
                                <span className={cls['item_label']}>{config.lang[lang.region_type].menu.side_enable}</span>
                                <Icon type="to-top" className={`${cls['rotate90']}`} />
                            </div>
                            <div className={`${cls['grid_logo']} ${(gridInquiry) ? '' : cls['hide']}`}>
                                <div className={`${cls['grid_item']}`}>
                                    <img src={logo} className={`${cls['rotateEase180']} animated zoomIn`} style={{ marginTop: '-5px' }} />
                                </div>
                                <div className={`${cls['grid_item']} ${cls['grid_brand']}`}></div>
                            </div>
                        </div>
                        <div className={`${cls['grid_nav_item']}`}>
                            <div className={`${cls['grid_handle_item']}`}>
                                <div className={cls['handle_item']}>
                                    <Dropdown overlay={this.handleLang()} placement="bottomCenter">
                                        <span className={cls['badge']}>
                                            <Icon type="global" />
                                            <sup className={`${cls['sup_badge']} ttu`}>{lang.region_type}</sup>
                                        </span>
                                    </Dropdown>
                                </div>
                                <div className={cls['handle_item']}>
                                    <span className={cls['badge']}>
                                        <Icon type="bell" />
                                        <sup className={`${cls['sup_badge']} ttu`}>0</sup>
                                    </span>
                                </div>
                            </div>
                            <div className={`${cls['profile']}`}>
                                <div className={cls['profile_item']}>
                                    <Avatar size="large" icon="user" src={config.lang[lang.region_type].user.image} />
                                </div>
                                <div className={cls['profile_item']}>
                                    <div className={`${cls['name_ellipsis']} ttu ${lang.region_type}`}>{config.lang[lang.region_type].user.name}</div>
                                    <div className={`${cls['name_ellipsis']} ttu ${lang.region_type}`}>{config.lang[lang.region_type].user.desc}</div>
                                </div>
                            </div>
                        </div>
                    </Header>
                    <Content className={`${cls['grid_container']} griddashboard_wrapper`}>
                        <Loader visible={progress.first_load} {...load_config }/>
                        <article className={(progress.first_load) ? cls['hide'] : '' }>
                            <LocaleProvider locale={(lang.region_type == 'en') ? en : th}>
                                { this.handlePageContentRender(pageHandle) }
                            </LocaleProvider>
                        </article>
                    </Content>
                    <Footer className={`${cls['grid_footer']}`}>
                        {`NANO LAYOUT ©2017-${parseInt(moment().format('YYYY'))-1} TCRBANK`}
                    </Footer>
                </Layout>
            </Layout>
        )
    }

    /* PAGE CONTENT HANDLE */
    handlePageContentRender = (page) => {
        const { lang, masters, authen, visible, progress, gridInquiry, marketFilterList, customerFilterList, marketDataList, customerDataList } = this.props // FOR PROPERTY
        const { handleCloseCustomerModal, handleSearchGridCustomer, handleSearchGridMarket, handlePageContent } = this.props // FOR FUNCTIONAL

        if(parseBool(gridInquiry)) {
            document.title = 'Customer Info'
            return (<GridCustInquiry authen={authen} locales={lang} config={config} />)

        } else {

            if (page.main) {
                document.title = 'Mkt Management'
                return (
                    <div>
                        <GridMarket 
                            authen={authen} 
                            visible={page.main} 
                            data={marketDataList} 
                            filters={marketFilterList} 
                            onSearchFilter={handleSearchGridMarket} 
                            progress={progress} 
                            locales={lang} 
                            config={config} 
                            masters={masters}
                        />
                        <CustomerDashboard
                            authen={authen}
                            modal={this.props.modal}
                            modeType={`Collection`}
                            locales={lang} 
                            config={config}
                            masters={masters}
                            mktLayout={{ view: true, edit: true }}
                            handleField={this.state.handle_field}
                            onModalClose={handleCloseCustomerModal}                            
                        />
                    </div>
                )
        
            } else if (page.camange) {
                document.title = 'Management Dashboard'
                return (<GridMangement authen={authen} visible={page.camange} progress={progress} locales={lang} config={config} masters={masters} options={visible}  />)
            
            } else if (page.dashboard) { 
                document.title = 'Nano Layout'
                return (<Dashboard authen={authen} visible={page.dashboard} />)

            }
            
        }

    }
    
    /* LOCALES LIST HANDLE */
    handleLang = () => {
        const { lang, handleLangState } = this.props
        return (
            <Menu onClick={handleLangState}>
                { 
                    _.map(config.lang_enable, (v, i) => { 
                        return (<MenuItem key={v} className={`${(lang.region_type == v) ? styles['fg_darkCyan'] : ''} ttu`}>{v}</MenuItem>) 
                    }) 
                }
            </Menu>
        )
       
    }

    /* HANDLE TRIGGER ICON */
    handleTrigger = () => {
        const { lang, visible, handleSider, handleSiderState } = this.props
        let collapsed = (visible.collapsed) ? cls['collapsed'] : ''
        let collapsedLabel = (visible.collapsed) ? config.lang[lang.region_type].sidebar.sidebar_expand : config.lang[lang.region_type].sidebar.sidebar_collapsed
        let sidebarClose = config.lang[lang.region_type].sidebar.sidebar_hidden

        return (
            <div className={`${cls['grid_container_trigger']} ${collapsed}`}>
                <Tooltip placement="right" title={collapsedLabel}>
                    <div className={`${cls['grid_item']} ${collapsed}`} onClick={handleSider}>
                        <div className={`${cls['sub_grid_item']}`}>
                            <Icon type={`${(visible.collapsed) ? 'right' : 'left'}`} />
                        </div>
                        <div className={`${cls['sub_grid_item']} ${cls['grid_item_name']} ${collapsed}`}>{collapsedLabel}</div>
                    </div>
                </Tooltip>
                <Tooltip placement="right" title={sidebarClose}>
                    <div className={`${cls['grid_item']} ${collapsed}`} onClick={handleSiderState}>
                        <div className={`${cls['sub_grid_item']}`}>
                            <Icon type="poweroff" />
                        </div>
                        <div className={`${cls['sub_grid_item']} ${cls['grid_item_name']} ${collapsed}`}>{sidebarClose}</div>
                    </div>
                </Tooltip>
            </div>
        )
    }

    // HANDLE PROFILE MODULE
    handleProfileTools = () => {
        return (<div />)
    }

}

export default withRouter(GridLayoutTemplate)