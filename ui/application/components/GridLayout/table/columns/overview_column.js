import React from 'react'
import moment from 'moment'
import { Row, Col, Avatar, Spin, Tooltip, Popover } from 'antd'
import { strFloat, numValid, roundFixed, in_array, handleMobilePattern, numberWithCommas, compareByAlph, compareByAmount, createElement } from '../../../../containers/Layouts/function'
import cls from '../../style/grid_market.scss'
import styles from '../../../../utilities/_general.scss'
import _ from 'lodash'

import 'moment/locale/en-gb'
import 'moment/locale/th'

import { MARKET_CAINFO_URL } from '../../../../constants/endpoints'

moment.locale('en')

const standardWidthFix = 45
const standardNameFix = 170
const tooltip_placement = 'right'

const icon_style = { fontSize: '13px' }

const warning_content = (
    <div>
        อยู่ระหว่างปรับปรุงเนื้อหาใหม่
        {/* 
        <div>
            <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} /> สาขาที่ถูก Stop เดือนล่าสุด    
        </div>   
        <div>
            <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} /> สาขาที่ถูก Stop เดือนที่แล้ว  
        </div>   
        
        
        อยู่ระหว่างปรับปรุงข้อมูล
        <div>
            <div style={{ minWidth: '73px' }}><b>Warning level 1</b></div> 
            <i className={`fa fa-warning ${styles['fg_grayG1']} ${styles['icon']}`} style={icon_style} /> = ( 25% - 40% )
        </div>        
        <div>
            <div style={{ minWidth: '73px' }}><b>Warning level 2</b></div> 
            <i className={`fa fa-warning ${styles['fg_orangeG1']} ${styles['icon']}`} style={icon_style} /> = ( > 40% )
        </div> 
        */}
    </div>
)

export const performance_columns = [
    {
        title: 'Employee Name',
        dataIndex: 'EmployeeName',
        className: `gridctrl_1 ttu tracked tl pointer`,
        sorter: (a, b) => compareByAlph(a.EmployeeName, b.EmployeeName),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },  
        width: standardNameFix,
        render: (strText, record) => { 
            let strname = null
            let empname = null

            //let empname = (in_array(record.GroupData, ['Branch'])) ? record.BranchName : strText
            if(in_array(record.GroupData, ['Branch'])) empname = record.BranchName
            if((in_array(record.GroupData, ['MarketCA']))) {
                if(record.rootBaseFilter == 'Market') empname = record.OptionName
                else empname = strText
            }
            if(!in_array(record.GroupData, ['Branch', 'MarketCA'])) empname = strText

            if(record && in_array(record.GroupData, ['Branch', 'CA', 'Market', 'Kiosk'])) {
                if(!_.isEmpty(empname) && empname.length >= 18) {
                    strname = ((in_array(record.GroupData, ['Branch'])))  ? `${empname.substring(0, 19)}...` : `${empname.substring(0, 15)}...`
                } else {
                    strname = empname
                }
            } else {
                strname = empname
            }

            let period = (record && record.WorkingPeriod) ? record.WorkingPeriod : null
            if(in_array(record.GroupData, ['Market']) || (in_array(record.GroupData, ['MarketCA']) && record.rootBaseFilter == 'CA')) {
                return (<Tooltip placement={tooltip_placement} title={`${empname} ${(period) ? `(${period})`: ''}`}>{`${strname}`}</Tooltip>)
            } else {

                let layout = null

                switch (record.GroupData) {                   
                    case 'Branch':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record.GroupData && record.GroupData == 'Branch') && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'Kiosk':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={(record && record.BranchFullDigit.length == 6) ? { width: '270px' } : { width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={(record && record.BranchFullDigit.length == 6) ? { width: '64px', height: '64px' } : { width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record && record.BranchFullDigit.length == 3) && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                              {
                                                (record && record.BranchFullDigit.length == 6) && (
                                                    <Row>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchName} ${(record.KisokEstimateOpen && !_.isEmpty(record.KisokEstimateOpen)) ? `( ${record.KisokEstimateOpen} )`:''}`}
                                                        </Col>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                        </Col>
                                                    </Row>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeFullName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'CA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'MarketCA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.OptionCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.OptionName} ${(record.OptionPeriod && !_.isEmpty(record.OptionPeriod)) ? `( ${record.OptionPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.OptionMobile && !_.isEmpty(record.OptionMobile)) ? `${handleMobilePattern(record.OptionMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    default:
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={5}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '40px', height: '40px' }} />
                                    </Col>
                                    <Col span={19} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                }
    
                return (<Popover placement="right" content={layout}><span onMouseOver={handleProfile.bind(this, `${record.GroupData}_${record.EmployeeCode}`)}>{`${strname}`}</span></Popover>) 
            }

        }
    },
    {
        title: (<i className="fa fa-warning pointer" />), // (<Popover content={warning_content}><i className="fa fa-warning pointer" /></Popover>),
        dataIndex: 'Warning',
        className: `gridctrl_2 ttu tracked tc pointer`,
        width: 20,
        sorter: (a, b) => compareByAlph(a.HasAlert, b.HasAlert),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_2').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },  
        render: (str, items) => {
            switch (items.GroupData) {
                // case 'Branch':
                //     switch (items.Stop_Active) {
                //         case 'C':
                //             return (<Tooltip placement={tooltip_placement} title={`Stop approved: ${items.Stop_Age} month`}><i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} /></Tooltip>)
                //         case 'L':
                //             return (<Tooltip placement={tooltip_placement} title={`Stop approved: ${items.Stop_Age} month`}><i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} /></Tooltip>)
                //         default:
                //             return null
                //     }
                case 'Branch':
                    if(items.children && items.children.length > 0) {
                        let total_stop = 0
                        let total_warning2 = 0
                        let total_warning1 = 0
                        let total_child = items.children.length

                        _.forEach(items.children, (v) => {
                            if(v.HasAlert == 'Stop') {
                                total_stop = total_stop + 1
                            }
                            else if(v.HasAlert == 'Warning 2') {
                                total_warning2 = total_warning2 + 1
                            }
                            else if(v.HasAlert == 'Warning 1') {
                                total_warning1 = total_warning1 + 1
                            }

                        })

                        if(total_stop === total_child) {
                            return (
                                <Popover content={(<div><div>Stop Approved</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงสูงสุดทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }

                        if(total_warning2 === total_child) {
                            return (
                                <Popover content={(<div><div>Warning 2</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงสูงทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }

                        if(total_warning1 === total_child) {
                            return (
                                <Popover content={(<div><div>Warning 1</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_gray']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }
                        
                    } else {
                        return null
                    }

                break
                case 'CA': 
                case 'Market':
                    if(!_.isEmpty(items.HasAlert)) {
                        switch(items.HasAlert) {
                            case 'Stop':
                                return (
                                    <Popover
                                        content={(
                                            <div>
                                                { 
                                                    (items.Stop_Active && in_array(items.Stop_Active, ['StopNewBook', 'StopAll'])) && 
                                                    (
                                                        <span>
                                                            <div>XDay ( >= W6 ) 4%</div>
                                                            <div>Stop Booking : {(items.PercentStop && items.PercentStop > 0.00) ? roundFixed(items.PercentStop, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                }
                                                { (items.Stop_Active && items.Stop_Active == 'StopAll') && (<hr />) }
                                                { 
                                                    (items.Stop_Active && in_array(items.Stop_Active, ['StopNewNPL', 'StopAll'])) && 
                                                    (
                                                        <span>
                                                            <div>{`% New NPL > ${(items.Stop_Age) ? items.Stop_Age : 0}%`}</div>
                                                            <div>Stop Booking : {(items.NewNPL_Percent && items.NewNPL_Percent > 0.00) ? roundFixed(items.NewNPL_Percent, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                }                                                
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />   
                                    </Popover>
                                )
                            case 'Warning 2':                                
                                return (
                                    <Popover 
                                        content={(
                                            <div>
                                               { 
                                                    (items.Warning_Active && in_array(items.Warning_Active, ['WarningLv2', 'WarningAll'])) && 
                                                    (
                                                        <span>
                                                            <div>XDay ( >= W5 ) 4%</div>
                                                            <div>Warning 2 : {items.PercentWarning2}%</div>
                                                        </span>
                                                    )
                                                }
                                                { (items.Warning_Active && items.Warning_Active == 'WarningAll') && (<hr />) }
                                                { 
                                                    (items.Warning_Active && in_array(items.Warning_Active, ['NewNPL', 'WarningAll'])) && 
                                                    (
                                                        <span>
                                                            <div>{`% New NPL > ${(items.Warning_Age) ? items.Warning_Age : 0}%`}</div>
                                                            <div>Warning 2 : {(items.Warning_Percent && items.Warning_Percent > 0.00) ? roundFixed(items.Warning_Percent, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />
                                    </Popover>
                                )
                            case 'Warning 1':                           
                                return (
                                    <Popover
                                        content={(
                                            <div>
                                                <div>XDay ( >= W4 ) 4%</div>
                                                <div>Warning 1 : {items.PercentWarning1}%</div>
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_gray']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />
                                    </Popover>
                                )
                            default:
                                return null
                        }
                    }
                default:
                    return ''
            }
        }
    }, 
    {
        title: 'Location',
        dataIndex: 'Location',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Area',
                dataIndex: 'ZoneDigit',
                className: `gridctrl_3 ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.ZoneDigit, b.ZoneDigit),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_3').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                width: standardWidthFix,
                render: (scope_area, data) => {                   
                    if(in_array(data.GroupData, ['Branch'])) {
                        return (
                            <Popover content={`(${scope_area}) ${data.EmployeeName}`}>
                                <span style={{ borderBottom: '1px dashed #D1D1D1', fontSize: '0.9em' }}>{scope_area}</span>
                            </Popover>
                        )
                    } 
                    else if(in_array(data.GroupData, ['Market'])) {                        
                        return (
                            <Popover content={<div id={`market_calist_${data.EmployeeCode}`}><Spin id="market_calist_preload" size="small" /></div>} 
                                placement="right"
                                arrowPointAtCenter
                            >
                                <span style={{ borderBottom: '1px dashed #D1D1D1', fontSize: '0.9em' }} onMouseOver={getCAListInMarket.bind(this, data.EmployeeCode)}>{scope_area}</span>
                            </Popover>
                        )
                    }
                    else {
                        return scope_area
                    }                   
                }
            },   
            {
                title: 'BR',
                dataIndex: 'BranchCode',
                className: `gridctrl_4 ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.BranchCode, b.BranchCode),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_4').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                width: 35,
                render: (str, data) => {
                    return (<Popover content={`${(data && data.BranchName) ? data.BranchName:''}`}>{ str }</Popover>)
                    //return (in_array(data.GroupData, ['Market', 'Kiosk', 'CA'])) ? null : (<Popover content={`${(data && data.BranchName) ? data.BranchName:''}`}>{ str }</Popover>)
                }
            }
        ] 
    },
    {
        title: 'Market Info',
        dataIndex: 'MarketPenetrate',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'CYCLE',
                dataIndex: 'CycleDueDay',
                className: `gridctrl_5 ttp tracked tc pointer`,
                width: 40,
                sorter: (a, b) => compareByAlph(a.CycleDueDay, b.CycleDueDay),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_5').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str, record) => {
                    return str
                }
            },
            {
                title: 'Shop',
                dataIndex: 'MarketShop',
                className: `gridctrl_6 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MarketShop, b.MarketShop),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_6').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                render: (shop, rowData) => {
                    if(in_array(rowData.GroupData, ['CA', 'MarketCA'])) return '-'
                    else return shop
                }
            },
            {
                title: '%Pot',
                dataIndex: 'TotalPotentialPercent',
                className: `gridctrl_7 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalPotentialPercent, b.TotalPotentialPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_7').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => { 
                    if(in_array(rowData.GroupData, ['CA', 'MarketCA'])) return '-'
                    else return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'  
                }
            }
            
        ]
    },
    {
        title: 'O/S Balance',
        dataIndex: 'OSBalance',
        className: `${cls['bg_option1']} ttu tracked`,
        children: [
            {
                title: 'Vol',
                dataIndex: 'TotalOS_Current_Bal',
                className: `gridctrl_8 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                orter: (a, b) => compareByAmount(a.TotalOS_Current_Bal, b.TotalOS_Current_Bal),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol, data) => {
                    const digit = (in_array(data.GroupData, ['Kiosk', 'CA', 'Market'])) ? 2 : 1
                    const digit_label = (in_array(data.GroupData, ['MarketCA'])) ? 1 : 0

                    let total_os = (data && data.OS_Vol > 0) ? data.OS_Vol : 0
                    let total_os_current = (data && data.TotalOS_Current_Bal > 0) ? data.TotalOS_Current_Bal : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Bal > 0) ? data.TotalOS_Current_WithXDay_Bal : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Bal > 0) ? data.TotalOS_ExcludeNPL_Bal : 0

                    let total_os_full = (data && data.OS_Vol_FullAmt > 0) ? data.OS_Vol_FullAmt : 0
                    let total_os_current_full = (data && data.TotalOS_Current_Bal_FullAmt > 0) ? data.TotalOS_Current_Bal_FullAmt : 0
                    let total_os_currxday_full = (data && data.TotalOS_Current_WithXDay_Bal_FullAmt > 0) ? data.TotalOS_Current_WithXDay_Bal_FullAmt : 0
                    let total_os_exclude_npl_full = (data && data.TotalOS_ExcludeNPL_Bal_FullAmt > 0) ? data.TotalOS_ExcludeNPL_Bal_FullAmt : 0

                    const td_amount = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '35px':'55px'

                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_current, total_os_current_full, digit)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_currxday, total_os_currxday_full, digit)}`}</td>
                                </tr>
                               
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_exclude_npl, total_os_exclude_npl_full, digit)}`}</td>
                                </tr>
                                <tr  style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os, total_os_full, digit)}`}</td>
                                </tr>
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os && total_os > 0) ? roundFixed(total_os, digit) : 0 }`}</span>
                        </Popover>
                    )

                    // let os_bal = null
                    // let digit = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? 2 : 1
                    // if(data.OS_Vol_FullAmt >= 1000000) os_bal = `${roundFixed((data.OS_Vol_FullAmt / 1000000), digit)}`
                    // else os_bal = `${roundFixed((data.OS_Vol_FullAmt / 100000) * 100, 0)}Kb`                          
                    // return (os_bal) ? `${os_bal}`:0 

                }
            },
            {
                title: 'CUST',
                dataIndex: 'TotalOS_Current_Acc',
                // dataIndex: 'OS_Unit',
                className: `gridctrl_9 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                // sorter: (a, b) => compareByAmount(a.OS_Unit, b.OS_Unit),
                 sorter: (a, b) => compareByAmount(a.TotalOS_Current_Acc, b.TotalOS_Current_Acc),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (total, data) => {                     
                    let total_os = (data && data.OS_Unit > 0) ? data.OS_Unit : 0
                    let total_os_current = (data && data.TotalOS_Current_Acc > 0) ? data.TotalOS_Current_Acc : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Acc > 0) ? data.TotalOS_Current_WithXDay_Acc : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Acc > 0) ? data.TotalOS_ExcludeNPL_Acc : 0
                    
                    const td_width = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '25px':'55px'
                                       
                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_current)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_currxday)}`}</td>
                                </tr>                               
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_exclude_npl)}`}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os)}`}</td>
                                </tr>
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os && total_os > 0) ? total_os : 0 }`}</span>
                        </Popover>
                    )

                }
            },
            {
                title: '%MF',
                dataIndex: 'OS_MF_Percent',
                className: `gridctrl_10 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.OS_Unit, b.OS_Unit),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_10').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let os_unit = (rowData && rowData.OS_Unit > 0) ? rowData.OS_Unit : 0
                    let os_micro_unit = (rowData && rowData.OS_MF_Cust > 0) ? rowData.OS_MF_Cust : 0
                    let os_micro_vol = (rowData && rowData.OS_MF_Limit > 0) ? rowData.OS_MF_Limit : 0   
                    let os_micro_cust_share = (numValid(os_micro_unit) / numValid(os_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol :</b> {`${os_micro_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust :</b> {`${numberWithCommas(os_micro_unit)} (${roundFixed(strFloat(os_micro_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            },
            {
                title: '%TOP',
                dataIndex: 'OS_TopupPercent',
                className: `gridctrl_11 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.OS_TopupPercent, b.OS_TopupPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_11').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let os_unit = (rowData && rowData.OS_Unit > 0) ? rowData.OS_Unit : 0
                    let os_topup_unit = (rowData && rowData.OS_TopupApp > 0) ? rowData.OS_TopupApp : 0
                    let os_topup_vol = (rowData && rowData.OS_TopupVol > 0) ? rowData.OS_TopupVol : 0   
                    let os_topup_cust_share = (numValid(os_topup_unit) / numValid(os_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol:</b> {`${os_topup_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(os_topup_unit)} (${roundFixed(strFloat(os_topup_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            }                      
        ]
    },
    {
        title: `YTD ${moment().format('YYYY')} Performance`,
        dataIndex: 'Performance',
        className: `${cls['bg_lemon']} ttu tracked`,
        children: [
            {
                title: 'Target',
                dataIndex: 'YTD_Target',
                className: `gridctrl_12 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_Target, b.YTD_Target),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_12').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (target, rowData) => {
                    if(rowData && in_array(rowData.GroupData, ['Market'])) {
                        return '-'
                    } else {
                        return (target && target > 0) ? `${roundFixed(target, 1)}`:0
                    }
                }
            },
            {
                title: '%Ach',
                dataIndex: 'YTD_Ach',
                className: `gridctrl_13 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_Ach, b.YTD_Ach),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_13').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    if(rowData && in_array(rowData.GroupData, ['Market'])) {
                        return '-'
                    } else {
                        return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%' 
                    }
                }
            },
            {
                title: 'Vol',
                dataIndex: 'YTD_TotalVol',
                className: `gridctrl_14 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_TotalVol, b.YTD_TotalVol),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_14').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol, data) => {
                    let total_ytdvol = null
                    let digit = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? 2 : 1
                    if(data.YTD_TotalVol_FullAmt >= 1000000) total_ytdvol = `${roundFixed((data.YTD_TotalVol_FullAmt / 1000000), digit)}`
                    else total_ytdvol = `${roundFixed((data.YTD_TotalVol_FullAmt / 100000) * 100, 0)}K`                          
                    return (total_ytdvol) ? `${total_ytdvol}`:0 
                }
            },
            {
                title: 'Cust',
                dataIndex: 'YTD_TotalApp',
                className: `gridctrl_15 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_TotalApp, b.YTD_TotalApp),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_15').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (acc) => {
                    return (acc) ? `${acc}`:0 
                }
            },
            {
                title: 'Ticket',
                dataIndex: 'YTD_TicketSize',
                className: `gridctrl_16 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_TicketSize, b.YTD_TicketSize),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_16').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol) => {
                    return (vol) ? `${roundFixed(strFloat(vol), 1)}K`:'0K'
                }
            },
            {
                title: '%Apv',
                dataIndex: 'YTD_APV',
                className: `gridctrl_17 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_APV, b.YTD_APV),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_17').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per) => {
                    return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%' 
                }
            },
            {
                title: '%MF',
                dataIndex: 'YTD_MicroPercent',
                className: `gridctrl_18 ${cls['bg_lemon']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_MicroPercent, b.YTD_MicroPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_18').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let ytd_unit = (rowData && rowData.YTD_TotalApp > 0) ? rowData.YTD_TotalApp : 0
                    let ytd_micro_unit = (rowData && rowData.YTD_TotalMicroApp > 0) ? rowData.YTD_TotalMicroApp : 0
                    let ytd_micro_vol = (rowData && rowData.YTD_TotalMicroVol > 0) ? rowData.YTD_TotalMicroVol : 0   
                    let ytd_micro_cust_share = (numValid(ytd_micro_unit) / numValid(ytd_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol:</b> {`${ytd_micro_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(ytd_micro_unit)} (${roundFixed(strFloat(ytd_micro_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            },
            {
                title: '%Top',
                dataIndex: 'YTD_TopupPercent',
                className: `gridctrl_19 ${cls['bg_lemon']} ${cls['bg_lemon_full']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.YTD_TopupPercent, b.YTD_TopupPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_19').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let ytd_unit = (rowData && rowData.YTD_TotalApp > 0) ? rowData.YTD_TotalApp : 0
                    let ytd_topup_unit = (rowData && rowData.YTD_TotalTopupApp > 0) ? rowData.YTD_TotalTopupApp : 0
                    let ytd_topup_vol = (rowData && rowData.YTD_TotalTopupVol > 0) ? rowData.YTD_TotalTopupVol : 0   
                    let ytd_topup_cust_share = (numValid(ytd_topup_unit) / numValid(ytd_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol:</b> {`${ytd_topup_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(ytd_topup_unit)} (${roundFixed(strFloat(ytd_topup_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            }
        ]
    },
    {
        title: 'Current Month',
        dataIndex: 'CurrentMonth',
        className: `${cls['bg_option2']} ttu tracked tc`,
        children: [
            {
                title: 'Target',
                dataIndex: 'MTD_Target',
                className: `gridctrl_20 ${cls['bg_option2']} ${cls['bLDash']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_Target, b.MTD_Target),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_20').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (target, rowData) => {
                    if(rowData && in_array(rowData.GroupData, ['Market'])) {
                        return '-'
                    } else {
                        return (target && target > 0) ? `${roundFixed(target, 1)}`:'0' 
                    }
                }
            },
            {
                title: '%Ach',
                dataIndex: 'MTD_Ach',
                className: `gridctrl_21 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_Ach, b.MTD_Ach),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_21').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    if(rowData && in_array(rowData.GroupData, ['Market'])) {
                        return '-'
                    } else {
                        return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%' 
                    }
                }
            },
            {
                title: 'Vol',
                dataIndex: 'MTD_TotalVol',
                className: `gridctrl_22 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_TotalVol, b.MTD_TotalVol),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_21').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol, data) => {
                    let total_mtdvol = null
                    let digit = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? 2 : 1
                    if(data.MTD_TotalVol_FullAmt >= 1000000) total_mtdvol = `${roundFixed((data.MTD_TotalVol_FullAmt / 1000000), digit)}`
                    else total_mtdvol = `${roundFixed((data.MTD_TotalVol_FullAmt / 100000) * 100, 0)}K`                          
                    return (total_mtdvol) ? `${total_mtdvol}`:0 
                }
            },
            {
                title: 'Cust',
                dataIndex: 'MTD_TotalApp',
                className: `gridctrl_23 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_TotalApp, b.MTD_TotalApp),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_23').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (acc) => {
                    return (acc) ? `${acc}`:0 
                }
            },
            {
                title: 'Ticket',
                dataIndex: 'MTD_TicketSize',
                className: `gridctrl_24 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_TicketSize, b.MTD_TicketSize),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_24').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol) => {
                    return (vol) ? `${roundFixed(strFloat(vol), 1)}K`:'0K' 
                }
            },
            {
                title: '%Apv',
                dataIndex: 'MTD_APV',
                className: `gridctrl_25 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_APV, b.MTD_APV),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_25').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per) => {
                    return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%' 
                }
            },
            {
                title: '%MF',
                dataIndex: 'MTD_MicroPercent',
                className: `gridctrl_26 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_MicroPercent, b.MTD_MicroPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_26').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let mtd_unit = (rowData && rowData.MTD_TotalApp > 0) ? rowData.MTD_TotalApp : 0
                    let mtd_micro_unit = (rowData && rowData.MTD_TotalMicroApp > 0) ? rowData.MTD_TotalMicroApp : 0
                    let mtd_micro_vol = (rowData && rowData.MTD_TotalMicroVol > 0) ? rowData.MTD_TotalMicroVol : 0   
                    let mtd_micro_cust_share = (numValid(mtd_micro_unit) / numValid(mtd_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol:</b> {`${mtd_micro_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(mtd_micro_unit)} (${roundFixed(strFloat(mtd_micro_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            }
        ]
    },  
    {
        title: 'Top Up (CM)',
        dataIndex: 'CMTopAct',
        className: `${cls['bg_option2']} ttu tracked tc`,
        width: standardWidthFix,
        children: [          
            {
                title: 'Vol',
                dataIndex: 'MTD_TotalTopupSetupVol',
                className: `gridctrl_27 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_TotalTopupSetupVol, b.MTD_TotalTopupSetupVol),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_27').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol) => {
                    return (vol) ? `${roundFixed(strFloat(vol), 2)}`:0 
                }       
            },
            {
                title: 'Succ',
                dataIndex: 'MTD_TopupSucc',
                className: `gridctrl_28 ${cls['bg_option2']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MTD_TopupSucc, b.MTD_TopupSucc),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_28').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => {
                    let mtd_unit = (rowData && rowData.MTD_TotalApp > 0) ? rowData.MTD_TotalApp : 0
                    let mtd_vol = (rowData && rowData.MTD_TotalVol > 0) ? rowData.MTD_TotalVol : 0

                    let mtd_topup_unit = (rowData && rowData.MTD_TotalTopupSetupApp > 0) ? rowData.MTD_TotalTopupSetupApp : 0
                    let mtd_topup_vol = (rowData && rowData.MTD_TotalTopupSetupVol > 0) ? rowData.MTD_TotalTopupSetupVol : 0  
                    let mtd_total_topup_app = (rowData && rowData.MTD_TotalTopupApp > 0) ? rowData.MTD_TotalTopupApp : 0 
                    let mtd_total_topup_vol = (rowData && rowData.MTD_TotalTopupVol > 0) ? rowData.MTD_TotalTopupVol : 0

                    let mtd_topup_cust_vol = (mtd_topup_vol / mtd_vol) * 100
                    let mtd_topup_cust_setup = (numValid(mtd_topup_unit) / numValid(mtd_total_topup_app)) * 100
                    let mtd_topup_cust_share = (numValid(mtd_topup_unit) / numValid(mtd_unit)) * 100
                    
                    const content = (
                        <div>
                          <div><b>Total Eligible:</b> {`${mtd_total_topup_app} App (${mtd_total_topup_vol}Mb)`}</div>
                          <div><b>%Succ:</b> {`${roundFixed(strFloat(per), 1)}% (${numberWithCommas(mtd_topup_unit)} App ${roundFixed(mtd_topup_cust_setup, 1)}%)`} </div>
                          <hr/>
                          <div><b>Vol:</b> {`${mtd_topup_vol}Mb (${roundFixed(strFloat(mtd_topup_cust_vol), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(mtd_topup_unit)} (${roundFixed(strFloat(mtd_topup_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }    
            }
        ]
    },
    {
        title: (<div className="ttu">Cust<br/>Link</div>),
        dataIndex: 'linkPerformance',
        className: `ttu tracked tc`,
        width: 50
    }
]

const flowrate_arr = ['_0MDPD', '_1_30MDPD', '_31_60MDPD']
const flowrate_label = ['0MDPD', '1-30', '31-60']
const flowrate_target = ['< 1.5%', '< 30%', '< 70%']

const collection_arr = ['TotalPercent_W0', 'TotalPercent_W1_2', 'TotalPercent_W3_4', 'TotalPercent_XDay', 'TotalPercent_M1_2', 'TotalPercent_NPL']
const collection_arr_now = ['TotalPercent_W0_Now', 'TotalPercent_W1_2_Now', 'TotalPercent_W3_4_Now', 'TotalPercent_XDay_Now', 'TotalPercent_M1_2_Now', 'TotalPercent_NPL_Now']
const collection_label = ['W0', 'W1-2', 'W3-4', 'XDAY', 'M1-2', 'NPL']
const collection_target = ['> 87%', '< 3%', '< 1%', '< 1%', '< 2%', '< 6%']

export const collection_columns = [
    {
        title: 'Employee Name',
        dataIndex: 'EmployeeName',
        className: `gridctrl_1 ttu tracked tl pointer`,
        width: standardNameFix,
        sorter: (a, b) => compareByAlph(a.EmployeeName, b.EmployeeName),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },  
        render: (strText, record) => { 

            let strname = null
            let empname = null

            //let empname = (in_array(record.GroupData, ['Branch'])) ? record.BranchName : strText
            if(in_array(record.GroupData, ['Branch'])) empname = record.BranchName
            if((in_array(record.GroupData, ['MarketCA']))) {
                if(record.rootBaseFilter == 'Market') empname = record.OptionName
                else empname = strText
            }
            if(!in_array(record.GroupData, ['Branch', 'MarketCA'])) empname = strText

            if(record && in_array(record.GroupData, ['Branch', 'CA', 'Market', 'Kiosk'])) {
                if(!_.isEmpty(empname) && empname.length >= 18) {
                    strname = ((in_array(record.GroupData, ['Branch'])))  ? `${empname.substring(0, 30)}...` : `${empname.substring(0, 15)}...`
                } else {
                    strname = empname
                }
            } else {
                strname = empname
            }

            let period = (record && record.WorkingPeriod) ? record.WorkingPeriod : null
            if(in_array(record.GroupData, ['Market'])) {
                return (<Tooltip placement={tooltip_placement} title={`${empname} ${(period) ? `(${period})`: ''}`}>{`${strname}`}</Tooltip>)
            } else {
                
                let layout = null
                switch (record.GroupData) {                   
                    case 'Branch':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record.GroupData && record.GroupData == 'Branch') && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'Kiosk':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={(record && record.BranchFullDigit.length == 6) ? { width: '270px' } : { width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={(record && record.BranchFullDigit.length == 6) ? { width: '64px', height: '64px' } : { width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record && record.BranchFullDigit.length == 3) && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                              {
                                                (record && record.BranchFullDigit.length == 6) && (
                                                    <Row>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchName} ${(record.KisokEstimateOpen && !_.isEmpty(record.KisokEstimateOpen)) ? `( ${record.KisokEstimateOpen} )`:''}`}
                                                        </Col>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                        </Col>
                                                    </Row>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeFullName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'CA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'MarketCA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.OptionCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.OptionName} ${(record.OptionPeriod && !_.isEmpty(record.OptionPeriod)) ? `( ${record.OptionPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.OptionMobile && !_.isEmpty(record.OptionMobile)) ? `${handleMobilePattern(record.OptionMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    default:
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={5}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '40px', height: '40px' }} />
                                    </Col>
                                    <Col span={19} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                }
    
                return (<Popover placement="right" content={layout}><span onMouseOver={handleProfile.bind(this, `${record.GroupData}_${record.EmployeeCode}`)}>{`${strname}`}</span></Popover>) 
            }
        }
    },
    {
        title: (<i className="fa fa-warning pointer" />), // (<Popover content={warning_content}><i className="fa fa-warning pointer" /></Popover>),
        dataIndex: 'Warning',
        className: `gridctrl_2 ttu tracked tc`,
        width: 20,
        sorter: (a, b) => compareByAlph(a.HasAlert, b.HasAlert),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_2').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },
        render: (str, items) => {
            switch (items.GroupData) {
                // case 'Branch':
                //     switch (items.Stop_Active) {
                //         case 'C':
                //             return (<Tooltip placement={tooltip_placement} title={`Stop approved: ${items.Stop_Age} month`}><i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} /></Tooltip>)
                //         case 'L':
                //             return (<Tooltip placement={tooltip_placement} title={`Stop approved: ${items.Stop_Age} month`}><i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} /></Tooltip>)
                //         default:
                //             return null
                //     }
                case 'Branch':

                    if(items.children && items.children.length > 0) {
                        let total_stop = 0
                        let total_warning2 = 0
                        let total_warning1 = 0
                        let total_child = items.children.length

                        _.forEach(items.children, (v) => {
                            if(v.HasAlert == 'Stop') {
                                total_stop = total_stop + 1
                            }
                            else if(v.HasAlert == 'Warning 2') {
                                total_warning2 = total_warning2 + 1
                            }
                            else if(v.HasAlert == 'Warning 1') {
                                total_warning1 = total_warning1 + 1
                            }

                        })

                        if(total_stop === total_child) {
                            return (
                                <Popover content={(<div><div>Stop Approved</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงสูงสุดทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }

                        if(total_warning2 === total_child) {
                            return (
                                <Popover content={(<div><div>Warning 2</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงสูงทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }

                        if(total_warning1 === total_child) {
                            return (
                                <Popover content={(<div><div>Warning 1</div><div>เนื่องจากพนักงานภายใต้การดูแลอยู่ในเกณฑ์เสี่ยงทั้งหมด</div></div>)}>
                                    <i className={`fa fa-warning ${styles['fg_gray']} ${styles['icon']}`} style={icon_style} />
                                </Popover>
                            )
                        }
                        
                    } else {
                        return null
                    }

                break
                case 'CA':
                case 'Market':
                    if(!_.isEmpty(items.HasAlert)) {
                        switch(items.HasAlert) {
                            case 'Stop':
                                return (
                                    <Popover
                                        content={(
                                            <div>
                                                { 
                                                    (items.Stop_Active && in_array(items.Stop_Active, ['StopNewBook', 'StopAll'])) && 
                                                    (
                                                        <span>
                                                            <div>XDay ( >= W6 ) 4%</div>
                                                            <div>Stop Booking : {(items.PercentStop && items.PercentStop > 0.00) ? roundFixed(items.PercentStop, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                }
                                                { (items.Stop_Active && items.Stop_Active == 'StopAll') && (<hr />) }
                                                { 
                                                    (items.Stop_Active && in_array(items.Stop_Active, ['StopNewNPL', 'StopAll'])) && 
                                                    (
                                                        <span>
                                                            <div>{`% New NPL > ${(items.Stop_Age) ? items.Stop_Age : 0}%`}</div>
                                                            <div>Stop Booking : {(items.NewNPL_Percent && items.NewNPL_Percent > 0.00) ? roundFixed(items.NewNPL_Percent, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                } 
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_red']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />
                                    </Popover>
                                )
                            case 'Warning 2':                                
                                return (
                                    <Popover 
                                        content={(
                                            <div>
                                                { 
                                                    (items.Warning_Active && in_array(items.Warning_Active, ['WarningLv2', 'WarningAll'])) && 
                                                    (
                                                        <span>
                                                            <div>XDay ( >= W5 )4%</div>
                                                            <div>Warning 2 : {items.PercentWarning2}%</div>
                                                        </span>
                                                    )
                                                }
                                                { (items.Warning_Active && items.Warning_Active == 'WarningAll') && (<br/>) }
                                                { 
                                                    (items.Warning_Active && in_array(items.Warning_Active, ['NewNPL', 'WarningAll'])) && 
                                                    (
                                                        <span>
                                                            <div>{`% New NPL > ${(items.Warning_Age) ? items.Warning_Age : 0}%`}</div>
                                                            <div>Warning 2 : {(items.Warning_Percent && items.Warning_Percent > 0.00) ? roundFixed(items.Warning_Percent, 2) : 0.00}%</div>
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_yellow']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />
                                    </Popover>
                                )
                            case 'Warning 1':                           
                                return (
                                    <Popover
                                        content={(
                                            <div>
                                                <div>XDay ( >= W4 ) 4%</div>
                                                <div>Warning 1 : {items.PercentWarning1}%</div>
                                            </div>
                                        )}
                                    >
                                        <i className={`fa fa-warning ${styles['fg_gray']} ${styles['icon']}`} style={icon_style} onDoubleClick={items.handleWarningModal.bind(this, items)} />
                                    </Popover>
                                )
                            default:
                                return null
                        }
                    }
                default:
                    return ''
            }

        }
    },
    {
        title: 'Location',
        dataIndex: 'LocationCol',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Area',
                dataIndex: 'ZoneDigit',
                className: `gridctrl_3 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAlph(a.ZoneDigit, b.ZoneDigit),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_3').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                render: (scope_area, data) => {                   
                    if(in_array(data.GroupData, ['Branch'])) {
                        return (
                            <Popover content={`(${scope_area}) ${data.EmployeeName}`}>
                                <span style={{ borderBottom: '1px dashed #D1D1D1' }}>{scope_area}</span>
                            </Popover>
                        )
                    } 
                    else if(in_array(data.GroupData, ['Market'])) {                        
                        return (
                            <Popover content={<div id={`market_calist_${data.EmployeeCode}`}><Spin id="market_calist_preload" size="small" /></div>} 
                                trigger="hover"
                                placement="right"
                                arrowPointAtCenter
                            >
                                <span style={{ borderBottom: '1px dashed #D1D1D1' }} onMouseOver={getCAListInMarket.bind(this, data.EmployeeCode)}>{scope_area}</span>
                            </Popover>
                        )
                    }
                    else {
                        return scope_area
                    }                           
                }
            },   
            {
                title: 'BR',
                dataIndex: 'BranchCode',
                className: `gridctrl_4 ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.BranchCode, b.BranchCode),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_4').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                width: 35,
                render: (str, data) => {
                    return (<Popover content={`${(data && data.BranchName) ? data.BranchName:''}`}>{ str }</Popover>)
                    // return (in_array(data.GroupData, ['Market', 'Kiosk', 'CA'])) ? null : (<Popover content={`${(data && data.BranchName) ? data.BranchName:''}`}>{ str }</Popover>)
                }
            }
        ] 
    },
    {
        title: 'Market Info',
        dataIndex: 'MarketPenetrate',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'CYCLE',
                dataIndex: 'CycleDueDay',
                className: `gridctrl_5 ttp tracked tc pointer`,
                width: 40,
                sorter: (a, b) => compareByAlph(a.CycleDueDay, b.CycleDueDay),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_5').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                render: (str, record) => { return str }
            },
            {
                title: 'Shop',
                dataIndex: 'MarketShop',
                className: `gridctrl_6 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.MarketShop, b.MarketShop),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_6').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                render: (shop, rowData) => {
                    if(in_array(rowData.GroupData, ['CA', 'MarketCA'])) return '-'
                    else return shop
                }
            },
            {
                title: '%Pot',
                dataIndex: 'TotalPotentialPercent',
                className: `gridctrl_7 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalPotentialPercent, b.TotalPotentialPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_7').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (per, rowData) => { 
                    if(in_array(rowData.GroupData, ['CA', 'MarketCA'])) return '-'
                    else return (per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'  
                }
            }            
        ]
    },
    {
        title: 'O/S Balance',
        dataIndex: 'OSBalance',
        className: `${cls['bg_option1']} ttu tracked`,
        children: [
            {
                title: 'Vol',
                dataIndex: 'TotalOS_Current_Bal',
                // dataIndex: 'OS_Vol',
                className: `gridctrl_8 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalOS_Current_Bal, b.TotalOS_Current_Bal),
                // sorter: (a, b) => compareByAmount(a.OS_Vol, b.OS_Vol),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol, data) => {        
                    const digit_label = (in_array(data.GroupData, ['MarketCA'])) ? 1 : 0
                    const digit = (in_array(data.GroupData, ['Kiosk', 'CA', 'Market'])) ? 2 : 1

                    let total_os = (data && data.OS_Vol > 0) ? data.OS_Vol : 0
                    let total_os_current = (data && data.TotalOS_Current_Bal > 0) ? data.TotalOS_Current_Bal : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Bal > 0) ? data.TotalOS_Current_WithXDay_Bal : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Bal > 0) ? data.TotalOS_ExcludeNPL_Bal : 0

                    let total_os_full = (data && data.OS_Vol_FullAmt > 0) ? data.OS_Vol_FullAmt : 0
                    let total_os_current_full = (data && data.TotalOS_Current_Bal_FullAmt > 0) ? data.TotalOS_Current_Bal_FullAmt : 0
                    let total_os_currxday_full = (data && data.TotalOS_Current_WithXDay_Bal_FullAmt > 0) ? data.TotalOS_Current_WithXDay_Bal_FullAmt : 0
                    let total_os_exclude_npl_full = (data && data.TotalOS_ExcludeNPL_Bal_FullAmt > 0) ? data.TotalOS_ExcludeNPL_Bal_FullAmt : 0
                    
                    const td_amount = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '35px':'55px'

                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_current, total_os_current_full, digit)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_currxday, total_os_currxday_full, digit)}`}</td>
                                </tr>                                
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_exclude_npl, total_os_exclude_npl_full, digit)}`}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os, total_os_full, digit)}`}</td>
                                </tr>
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os && total_os > 0) ? roundFixed(total_os, digit) : 0 }`}</span>
                        </Popover>
                    )

                }
            },
            {
                title: 'CUST',
                dataIndex: 'TotalOS_Current_Acc',
                // dataIndex: 'OS_Unit',
                className: `gridctrl_9 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalOS_Current_Acc, b.TotalOS_Current_Acc),
                // sorter: (a, b) => compareByAmount(a.OS_Unit, b.OS_Unit),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (total, data) => {  
                    let total_os = (data && data.OS_Unit > 0) ? data.OS_Unit : 0
                    let total_os_current = (data && data.TotalOS_Current_Acc > 0) ? data.TotalOS_Current_Acc : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Acc > 0) ? data.TotalOS_Current_WithXDay_Acc : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Acc > 0) ? data.TotalOS_ExcludeNPL_Acc : 0
                    
                    const td_width = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '25px':'55px'

                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_current)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_currxday)}`}</td>
                                </tr>                                
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_exclude_npl)}`}</td>
                                </tr>
                                <tr style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os)}`}</td>
                                </tr>
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os && total_os > 0) ? total_os : 0 }`}</span>
                        </Popover>
                    )
                }
            },
            {
                title: '%MF',
                dataIndex: 'OS_MF_Percent',
                className: `gridctrl_10 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.OS_MF_Percent, b.OS_MF_Percent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_10').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (per, rowData) => {
                    let os_unit = (rowData && rowData.OS_Unit > 0) ? rowData.OS_Unit : 0
                    let os_micro_unit = (rowData && rowData.OS_MF_Cust > 0) ? rowData.OS_MF_Cust : 0
                    let os_micro_vol = (rowData && rowData.OS_MF_Limit > 0) ? rowData.OS_MF_Limit : 0   
                    let os_micro_cust_share = (numValid(os_micro_unit) / numValid(os_unit)) * 100

                    const content = (
                        <div>
                          <div><b>Vol:</b> {`${os_micro_vol}Mb (${roundFixed(strFloat(per), 1)}%)`}</div>
                          <div><b>Cust:</b> {`${numberWithCommas(os_micro_unit)} (${roundFixed(strFloat(os_micro_cust_share), 1)}%)`}</div>
                        </div>
                    )
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${(per && per > 0) ? `${roundFixed(strFloat(per), 1)}%`:'0%'}`}</span>
                        </Popover>
                    )
                   
                }
            }                    
        ]
    },
    {
        title: '%Flow Rate (MDPD)',
        dataIndex: 'Flow',
        className: `${cls['bg_option3']} ttu tracked tc`,
        width: standardWidthFix,
        children: _.map(flowrate_arr, (bucket, i) => {     
            return {
                title: <Tooltip placement="right" title={`Target : ${flowrate_target[i]}`}>{`${flowrate_label[i]}`}</Tooltip>,
                dataIndex: `${flowrate_label[i]}`,
                className: `flowrate_${i} ${cls['bg_option3']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => {
                    if(i == 0) {
                        return compareByAmount(a._0MDPD, b._0MDPD)
                    } else if(i == 1) {
                        return compareByAmount(a._1_30MDPD, b._1_30MDPD)
                    } else if(i == 2) {
                        return compareByAmount(a._31_60MDPD, b._31_60MDPD)
                    }
                },
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $(`th.ant-table-column-has-filters.flowrate_${i}`).find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (flowtype, data) => {
                    let flowrate = 0
                    let forcast = 0
           
                    switch (flowrate_label[i]) {
                        case '0MDPD':
                            flowrate = (data._0MDPD) ? data._0MDPD:0
                            forcast = (data.F_0MDPD) ? data.F_0MDPD:0
                        break;
                        case '1-30':
                            flowrate = (data._1_30MDPD) ? data._1_30MDPD:0
                            forcast = (data.F_1_30MDPD) ? data.F_1_30MDPD:0
                        break;
                        case '31-60':
                            flowrate = (data._31_60MDPD) ? data._31_60MDPD:0
                            forcast = (data.F_31_60MDPD) ? data.F_31_60MDPD:0
                        break;
                    }

                    return (<Popover content={`Forcast ${forcast}%`}>{`${(flowrate && flowrate > 0) ? roundFixed(flowrate, 1) : 0 }%`}</Popover>)
                }
            }
           
        })
    },   
    {
        title: (<div>New<br/>%0WDPD</div>),
        dataIndex: 'TotalCust_NewPercent',
        className: `gridctrl_12 ${cls['bg_option3']} ttu tracked tc pointer`,
        width: standardWidthFix,
        sorter: (a, b) => compareByAmount(a.TotalCust_NewPercent, b.TotalCust_NewPercent),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_12').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },
        render: (per) => { 
            return (per) ? `${roundFixed(strFloat(per), 1)}%`:'0%'  
        }
    },
    {
        title:  (<div>%Pmt<br/>Succ</div>),
        dataIndex: 'OS_Succ_Percent',
        className: `gridctrl_13 ${cls['bg_option3']} ttu tracked tc pointer`,
        width: standardWidthFix,
        sorter: (a, b) => compareByAmount(a.OS_Succ_Percent, b.OS_Succ_Percent),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_13').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },
        render: (per, rowData) => { 
            let os_total_collect = (rowData && rowData.OS_Total_Collect > 0) ? rowData.OS_Total_Collect : 0
            let os_succ_collect = (rowData && rowData.OS_Succ_Collect > 0) ? rowData.OS_Succ_Collect : 0 
            let os_succ_percent = (per) ? `${roundFixed(strFloat(per), 1)}%`:'0%'  

            const content = (
                <div>
                  <div><b>Total:</b> {`${numberWithCommas(os_total_collect)}`}</div>
                  <div><b>Succ:</b> {`${numberWithCommas(os_succ_collect)}`}</div>
                </div>
            )

            return (
                <Popover content={content}>
                    <span className={`${cls['spanTootltip']}`}>{os_succ_percent}</span>
                </Popover>
            ) 
        }
    },
    {
        title: `New NPL`,
        dataIndex: 'NewNPLColomns',
        className: `${cls['bg_option3']} ttu tracked tc`,
        children: [
            {
                title: (<Tooltip title="New booking">Book</Tooltip>),
                dataIndex: 'OS_TotalNewBooking_NPLPercent',
                className: `${cls['bg_option3']} ttu tracked tc pointer`,
                width: standardWidthFix,
                render: (total) => {
                    return (total && total > 0) ? `${roundFixed(total, 0)}%` : '0%'
                }
            },
            {
                title: 'OS',
                dataIndex: 'OS_TotalNew_NPLPercent',
                className: `gridctrl_14 ${cls['bg_option3']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.OS_TotalNew_NPLPercent, b.OS_TotalNew_NPLPercent),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_14').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (per, rowData) => { 
                    let total_app = (rowData.OS_TotalNew_NPLAcc && rowData.OS_TotalNew_NPLAcc > 0) ? rowData.OS_TotalNew_NPLAcc : 0
                    let total_vol = (rowData.OS_TotalNew_NPLVol && rowData.OS_TotalNew_NPLVol > 0) ? rowData.OS_TotalNew_NPLVol : 0
                    let total_per = (rowData.OS_TotalNew_NPLVol && rowData.OS_TotalNew_NPLPercent > 0) ? rowData.OS_TotalNew_NPLPercent : 0
                    let total_vol2digit = (total_vol && total_vol > 0) ? (total_vol / 1000000) : 0

                    const content = (
                        <div>
                        <div><b>Vol:</b> {`${roundFixed(total_vol2digit, 1)}Mb (${roundFixed(total_per, 2)}%)`}</div>
                        <div><b>Cust:</b> {`${numberWithCommas(total_app)}`}</div>
                        </div>
                    )
                    
                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (per) ? `${roundFixed(strFloat(per), 2)}%`:'0%' }`}</span>
                        </Popover>
                    ) 
                }
            }
        ]
    },
    {
        title: 'Portfolio Quality',
        dataIndex: 'PortfolioQuality',
        className: `${cls['bg_option4']} ttu tracked tc`,
        children: _.map(collection_arr, (bucket, i) => {
            return {
                title: <Tooltip placement="right" title={`Target : ${collection_target[i]}`}>{`${collection_label[i]}`}</Tooltip>,
                dataIndex: `${collection_label[i]}`,
                className: `collection_${i} ${cls['bg_option4']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => {
                    if(i == 0) {
                        return compareByAmount(a.TotalPercent_W0, b.TotalPercent_W0)
                    } else if(i == 1) {
                        return compareByAmount(a.TotalPercent_W1_2, b.TotalPercent_W1_2)
                    } else if(i == 2) {
                        return compareByAmount(a.TotalPercent_W3_4, b.TotalPercent_W3_4)
                    } else if(i == 3) {
                        return compareByAmount(a.TotalPercent_XDay, b.TotalPercent_XDay)
                    } else if(i == 4) {
                        return compareByAmount(a.TotalPercent_M1_2, b.TotalPercent_M1_2)
                    } else if(i == 5) {
                        return compareByAmount(a.TotalPercent_NPL, b.TotalPercent_NPL)
                    } 
                },
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $(`th.ant-table-column-has-filters.collection_${i}`).find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (vol, data) => {
                
                    let total_app = 0
                    let total_vol = 0
                    let total_per = 0

                    switch (collection_label[i]) {
                        case 'W0':
                            total_app = (data.Total_W0) ? data.Total_W0:0
                            total_vol = (data.TotalBal_W0) ? data.TotalBal_W0:0
                            total_per = (data.TotalPercent_W0) ? data.TotalPercent_W0:0
                        break;
                        case 'W1-2':
                            total_app = (data.Total_W1_2) ? data.Total_W1_2:0
                            total_vol = (data.TotalBal_W1_2) ? data.TotalBal_W1_2:0
                            total_per = (data.TotalPercent_W1_2) ? data.TotalPercent_W1_2:0
                        break;
                        case 'W3-4':
                            total_app = (data.Total_W3_4) ? data.Total_W3_4:0
                            total_vol = (data.TotalBal_W3_4) ? data.TotalBal_W3_4:0
                            total_per = (data.TotalPercent_W3_4) ? data.TotalPercent_W3_4:0
                        break;
                        case 'XDAY':
                            total_app = (data.Total_XDay) ? data.Total_XDay:0
                            total_vol = (data.TotalBal_XDay) ? data.TotalBal_XDay:0
                            total_per = (data.TotalPercent_XDay) ? data.TotalPercent_XDay:0
                        break;
                        case 'M1-2':
                            total_app = (data.Total_M1_2) ? data.Total_M1_2:0
                            total_vol = (data.TotalBal_M1_2) ? data.TotalBal_M1_2:0
                            total_per = (data.TotalPercent_M1_2) ? data.TotalPercent_M1_2:0
                        break;
                        case 'NPL':
                            total_app = (data.Total_NPL) ? data.Total_NPL:0
                            total_vol = (data.TotalBal_NPL) ? data.TotalBal_NPL:0
                            total_per = (data.TotalPercent_NPL) ? data.TotalPercent_NPL:0
                        break;
                    }

                    const content = (
                        <div>
                            <div><b>Vol:</b> {`${total_vol}Mb (${roundFixed(strFloat(total_per), 1)}%)`}</div>
                            <div><b>Cust:</b> {`${numberWithCommas(total_app)}`}</div>
                        </div>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_per && total_per > 0) ? roundFixed(total_per, 1) : 0 }%`}</span>
                        </Popover>
                    )   
                }
            }
        })
    }, 
    {
        title: (<div className="ttu">Cust<br/>Link</div>),
        dataIndex: 'linkPortfolio',
        className: 'ttu tracked tc',
        width: 50
    }
]

const flowrate_arr_portassign = ['_0MDPD_Now', '_1_30MDPD_Now', '_31_60MDPD_Now']
export const port_assign_columns = [
    collection_columns[0],
    collection_columns[1],
    collection_columns[2],
    {
        title: 'O/S Balance',
        dataIndex: 'OSBalance',
        className: `${cls['bg_option1']} ttu tracked`,
        children: [
            {
                title: 'Vol',
                dataIndex: 'TotalOS_Current_Bal_Now',
                className: `gridctrl_8 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalOS_Current_Bal_Now, b.TotalOS_Current_Bal_Now),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (vol, data) => {        
                    const digit = (in_array(data.GroupData, ['Kiosk', 'CA', 'Market'])) ? 2 : 1
                    const digit_label = (in_array(data.GroupData, ['MarketCA'])) ? 1 : 0

                    let total_os = (data && data.OS_Vol_Now > 0) ? data.OS_Vol_Now : 0
                    let total_os_current = (data && data.TotalOS_Current_Bal_Now > 0) ? data.TotalOS_Current_Bal_Now : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Bal_Now > 0) ? data.TotalOS_Current_WithXDay_Bal_Now : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Bal_Now > 0) ? data.TotalOS_ExcludeNPL_Bal_Now : 0

                    let total_os_full = (data && data.OS_Vol_FullAmt_Now > 0) ? data.OS_Vol_FullAmt_Now : 0
                    let total_os_current_full = (data && data.TotalOS_Current_Bal_FullAmt_Now > 0) ? data.TotalOS_Current_Bal_FullAmt_Now : 0
                    let total_os_currxday_full = (data && data.TotalOS_Current_WithXDay_Bal_FullAmt_Now > 0) ? data.TotalOS_Current_WithXDay_Bal_FullAmt_Now : 0
                    let total_os_exclude_npl_full = (data && data.TotalOS_ExcludeNPL_Bal_FullAmt_Now > 0) ? data.TotalOS_ExcludeNPL_Bal_FullAmt_Now : 0
                    
                    const td_amount = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '35px':'55px'

                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_current, total_os_current_full, digit)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_currxday, total_os_currxday_full, digit)}`}</td>
                                </tr>      
                                {/*
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os_exclude_npl, total_os_exclude_npl_full, digit)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_amount }}>{`${handleMoney(total_os, total_os_full, digit)}`}</td>
                                </tr>
                                */}
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os_current && total_os_current > 0) ? roundFixed(total_os_current, digit) : 0 }`}</span>
                            {/* <span className={`${cls['spanTootltip']}`}>{`${ (total_os_current && total_os_current > 0) ? roundFixed(total_os_current, digit_label) : 0 }`}</span> */}
                        </Popover>
                    )

                }
            },
            {
                title: 'CUST',
                dataIndex: 'TotalOS_Current_Acc_Now',
                className: `gridctrl_9 ${cls['bg_option1']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAmount(a.TotalOS_Current_Acc_Now, b.TotalOS_Current_Acc_Now),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (total, data) => {  
                    let total_os = (data && data.OS_Unit_Now > 0) ? data.OS_Unit_Now : 0
                    let total_os_current = (data && data.TotalOS_Current_Acc_Now > 0) ? data.TotalOS_Current_Acc_Now : 0
                    let total_os_currxday = (data && data.TotalOS_Current_WithXDay_Acc_Now > 0) ? data.TotalOS_Current_WithXDay_Acc_Now : 0
                    let total_os_exclude_npl = (data && data.TotalOS_ExcludeNPL_Acc_Now > 0) ? data.TotalOS_ExcludeNPL_Acc_Now : 0
                    
                    const td_width = (in_array(data.GroupData, ['Branch', 'Kiosk', 'CA', 'Market'])) ? '25px':'55px'

                    const content = (
                        <table className={cls['grid_toolip_os']}>
                            <tbody>
                                <tr style={{ backgroundColor: '#a52a2a', color: '#FFF' }}>
                                    <td className="tr">Current (W0-4) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_current)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Current + XDay =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_currxday)}`}</td>
                                </tr>   
                                {/* 
                                <tr>
                                    <td className="tr">Total OS - NPL =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os_exclude_npl)}`}</td>
                                </tr>
                                <tr>
                                    <td className="tr">Total OS (All) =</td>
                                    <td className="tc" style={{ minWidth: td_width }}>{`${numberWithCommas(total_os)}`}</td>
                                </tr>
                                */}
                            </tbody>
                        </table>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_os_current && total_os_current > 0) ? total_os_current : 0 }`}</span>
                        </Popover>
                    )
                }
            }                    
        ]
    },
    {
        title: `Transfer FCR`,
        dataIndex: 'TransferFCR',
        className: `${cls['bg_option5']} ttu tracked tc`,
        children: [
            {
                title: '%Transf',
                dataIndex: 'Transfer_Per',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                width: standardWidthFix,
                render: (total) => {
                    return (total && total > 0) ? `${roundFixed(total, 0)}%` : '0%'
                }
            },
            {
                title: 'Vol',
                dataIndex: 'Transfer_Vol',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                width: standardWidthFix
            },
            {
                title: 'Cust',
                dataIndex: 'Transfer_Cust',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                width: standardWidthFix
            }
        ]
    },
    {
        title: '%Flow Rate (MDPD)',
        dataIndex: 'Flow',
        className: `${cls['bg_option3']} ttu tracked tc`,
        width: standardWidthFix,
        children: _.map(flowrate_arr_portassign, (bucket, i) => {     
            return {
                title: <Tooltip placement="right" title={`Target : ${flowrate_target[i]}`}>{`${flowrate_label[i]}`}</Tooltip>,
                dataIndex: `${flowrate_label[i]}`,
                className: `flowrate_${i} ${cls['bg_option3']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => {
                    if(i == 0) {
                        return compareByAmount(a._0MDPD_Now, b._0MDPD_Now)
                    } else if(i == 1) {
                        return compareByAmount(a._1_30MDPD_Now, b._1_30MDPD_Now)
                    } else if(i == 2) {
                        return compareByAmount(a._31_60MDPD_Now, b._31_60MDPD_Now)
                    }
                },
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $(`th.ant-table-column-has-filters.flowrate_${i}`).find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (flowtype, data) => {
                    let flowrate = 0
                    let forcast = 0
           
                    switch (flowrate_label[i]) {
                        case '0MDPD':
                            flowrate = (data._0MDPD_Now) ? data._0MDPD_Now:0
                            forcast = (data.F_0MDPD_Now) ? data.F_0MDPD_Now:0
                        break;
                        case '1-30':
                            flowrate = (data._1_30MDPD_Now) ? data._1_30MDPD_Now:0
                            forcast = (data.F_1_30MDPD_Now) ? data.F_1_30MDPD_Now:0
                        break;
                        case '31-60':
                            flowrate = (data._31_60MDPD_Now) ? data._31_60MDPD_Now:0
                            forcast = (data.F_31_60MDPD_Now) ? data.F_31_60MDPD_Now:0
                        break;
                    }

                    return (<Popover content={`Forcast ${forcast}%`}>{`${(flowrate && flowrate > 0) ? roundFixed(flowrate, 1) : 0 }%`}</Popover>)
                }
            }
           
        })
    }, 
    collection_columns[6],
    collection_columns[7],
    collection_columns[8],
    {
        title: 'Portfolio Quality',
        dataIndex: 'PortfolioQuality',
        className: `${cls['bg_option4']} ttu tracked tc`,
        children: _.map(collection_arr_now, (bucket, i) => {
            return {
                title: <Tooltip placement="right" title={`Target : ${collection_target[i]}`}>{`${collection_label[i]}`}</Tooltip>,
                dataIndex: `${collection_label[i]}`,
                className: `collection_${i} ${cls['bg_option4']} ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => {
                    if(i == 0) {
                        return compareByAmount(a.TotalPercent_W0_Now, b.TotalPercent_W0_Now)
                    } else if(i == 1) {
                        return compareByAmount(a.TotalPercent_W1_2_Now, b.TotalPercent_W1_2_Now)
                    } else if(i == 2) {
                        return compareByAmount(a.TotalPercent_W3_4_Now, b.TotalPercent_W3_4_Now)
                    } else if(i == 3) {
                        return compareByAmount(a.TotalPercent_XDay_Now, b.TotalPercent_XDay_Now)
                    } else if(i == 4) {
                        return compareByAmount(a.TotalPercent_M1_2_Now, b.TotalPercent_M1_2_Now)
                    } else if(i == 5) {
                        return compareByAmount(a.TotalPercent_NPL_Now, b.TotalPercent_NPL_Now)
                    } 
                },
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $(`th.ant-table-column-has-filters.collection_${i}`).find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (vol, data) => {
                
                    let total_app = 0
                    let total_vol = 0
                    let total_per = 0

                    switch (collection_label[i]) {
                        case 'W0':
                            total_app = (data.Total_W0_Now) ? data.Total_W0_Now:0
                            total_vol = (data.TotalBal_W0_Now) ? data.TotalBal_W0_Now:0
                            total_per = (data.TotalPercent_W0_Now) ? data.TotalPercent_W0_Now:0
                        break;
                        case 'W1-2':
                            total_app = (data.Total_W1_2_Now) ? data.Total_W1_2_Now:0
                            total_vol = (data.TotalBal_W1_2_Now) ? data.TotalBal_W1_2_Now:0
                            total_per = (data.TotalPercent_W1_2_Now) ? data.TotalPercent_W1_2_Now:0
                        break;
                        case 'W3-4':
                            total_app = (data.Total_W3_4_Now) ? data.Total_W3_4_Now:0
                            total_vol = (data.TotalBal_W3_4_Now) ? data.TotalBal_W3_4_Now:0
                            total_per = (data.TotalPercent_W3_4_Now) ? data.TotalPercent_W3_4_Now:0
                        break;
                        case 'XDAY':
                            total_app = (data.Total_XDay_Now) ? data.Total_XDay_Now:0
                            total_vol = (data.TotalBal_XDay_Now) ? data.TotalBal_XDay_Now:0
                            total_per = (data.TotalPercent_XDay_Now) ? data.TotalPercent_XDay_Now:0
                        break;
                        case 'M1-2':
                            total_app = (data.Total_M1_2_Now) ? data.Total_M1_2_Now:0
                            total_vol = (data.TotalBal_M1_2_Now) ? data.TotalBal_M1_2_Now:0
                            total_per = (data.TotalPercent_M1_2_Now) ? data.TotalPercent_M1_2_Now:0
                        break;
                        case 'NPL':
                            total_app = (data.Total_NPL_Now) ? data.Total_NPL_Now:0
                            total_vol = (data.TotalBal_NPL_Now) ? data.TotalBal_NPL_Now:0
                            total_per = (data.TotalPercent_NPL_Now) ? data.TotalPercent_NPL_Now:0
                        break;
                    }

                    const content = (
                        <div>
                            <div><b>Vol:</b> {`${total_vol}Mb (${roundFixed(strFloat(total_per), 1)}%)`}</div>
                            <div><b>Cust:</b> {`${numberWithCommas(total_app)}`}</div>
                        </div>
                    )

                    return (
                        <Popover content={content}>
                            <span className={`${cls['spanTootltip']}`}>{`${ (total_per && total_per > 0) ? roundFixed(total_per, 1) : 0 }%`}</span>
                        </Popover>
                    )   
                }
            }
        })
    }, 
    {
        title: (<div className="ttu">Cust<br/>Link</div>),
        dataIndex: 'linkPortAssigment',
        className: 'ttu tracked tc',
        width: 50
    }
    // collection_columns[10]
]

export const flow_columns = [
    {
        title: 'Employee Name',
        dataIndex: 'EmployeeName',
        className: `gridctrl_1 ttu tracked tl pointer`,
        width: standardNameFix,
        sorter: (a, b) => compareByAlph(a.EmployeeName, b.EmployeeName),
        fixed: 'left',
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.gridctrl_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },  
        render: (strText, record) => { 
            let strname = null
            let empname = null

            if(in_array(record.GroupData, ['Branch'])) empname = record.BranchName
            if((in_array(record.GroupData, ['MarketCA']))) {
                if(record.rootBaseFilter == 'Market') empname = record.OptionName
                else empname = strText
            }
            if(!in_array(record.GroupData, ['Branch', 'MarketCA'])) empname = strText

            if(record && in_array(record.GroupData, ['Branch', 'CA', 'Market', 'Kiosk'])) {
                if(!_.isEmpty(empname) && empname.length >= 18) {
                    strname = ((in_array(record.GroupData, ['Branch'])))  ? `${empname.substring(0, 30)}...` : `${empname.substring(0, 15)}...`
                } else {
                    strname = empname
                }
            } else {
                strname = empname
            }

            let period = (record && record.WorkingPeriod) ? record.WorkingPeriod : null
            if(in_array(record.GroupData, ['Market'])) {
                return (<Tooltip placement={tooltip_placement} title={`${empname} ${(period) ? `(${period})`: ''}`}>{`${strname}`}</Tooltip>)
            } else {
                
                let layout = null
                switch (record.GroupData) {                   
                    case 'Branch':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record.GroupData && record.GroupData == 'Branch') && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'Kiosk':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={(record && record.BranchFullDigit.length == 6) ? { width: '270px' } : { width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={(record && record.BranchFullDigit.length == 6) ? { width: '64px', height: '64px' } : { width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            {
                                                (record && record.BranchFullDigit.length == 3) && (
                                                    <Col span={24} className="ttu">
                                                        {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                    </Col>
                                                )
                                            }
                                              {
                                                (record && record.BranchFullDigit.length == 6) && (
                                                    <Row>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchName} ${(record.KisokEstimateOpen && !_.isEmpty(record.KisokEstimateOpen)) ? `( ${record.KisokEstimateOpen} )`:''}`}
                                                        </Col>
                                                        <Col span={24} className="ttu">
                                                            {`${record.BranchHeadQuarter} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                                        </Col>
                                                    </Row>
                                                )
                                            }
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeFullName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'CA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    case 'MarketCA':
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={6}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.OptionCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                    </Col>
                                    <Col span={18} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24} className="ttu">
                                                {`${record.BranchName} ${(record.BranchEstimateOpen && !_.isEmpty(record.BranchEstimateOpen)) ? `( ${record.BranchEstimateOpen} )`:''}`}
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.OptionName} ${(record.OptionPeriod && !_.isEmpty(record.OptionPeriod)) ? `( ${record.OptionPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.OptionMobile && !_.isEmpty(record.OptionMobile)) ? `${handleMobilePattern(record.OptionMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                    default:
                        layout = (
                            <div id={`${record.GroupData}_${record.EmployeeCode}`} style={{ width: '250px' }}>
                                <Row gutter={10}>
                                    <Col span={5}>
                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${record.EmployeeCode}`} shape="square" style={{ width: '40px', height: '40px' }} />
                                    </Col>
                                    <Col span={19} style={{ fontSize: '1.5em' }}>
                                        <Row gutter={8}>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                                <Col span={17}>{`${record.EmployeeName} ${(record.WorkingPeriod && !_.isEmpty(record.WorkingPeriod)) ? `( ${record.WorkingPeriod} )`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">ตำแหน่ง</Col>
                                                <Col span={17}>{`${(record.ZoneDigit) ? `${(in_array(record.ZoneDigit, ['BKK', 'UPC'])) ? `RD-${record.ZoneDigit}`:record.ZoneDigit}`:''}`}</Col>
                                            </Col>
                                            <Col span={24}>
                                                <Col span={7} className="ttu">มือถือ</Col>
                                                <Col span={17}>{`${(record.EmployeeMobile && !_.isEmpty(record.EmployeeMobile)) ? `${handleMobilePattern(record.EmployeeMobile)}`:''}`}</Col>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </div>
                        )
                    break
                }
    
                return (<Popover placement="right" content={layout}><span onMouseOver={handleProfile.bind(this, `${record.GroupData}_${record.EmployeeCode}`)}>{`${strname}`}</span></Popover>) 
            }
        }
    },
    {
        title: 'Location',
        dataIndex: 'LocationCol',
        className: `ttu tracked tc`,
        fixed: 'left',
        children: [
            {
                title: 'Area',
                dataIndex: 'ZoneDigit',
                className: `gridctrl_3 ttu tracked tc pointer`,
                width: standardWidthFix,
                sorter: (a, b) => compareByAlph(a.ZoneDigit, b.ZoneDigit),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_3').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                render: (scope_area, data) => {                   
                    if(in_array(data.GroupData, ['Branch'])) {
                        return (
                            <Popover content={`(${scope_area}) ${data.EmployeeName}`}>
                                <span style={{ borderBottom: '1px dashed #D1D1D1' }}>{scope_area}</span>
                            </Popover>
                        )
                    } 
                    else if(in_array(data.GroupData, ['Market'])) {                        
                        return (
                            <Popover content={<div id={`market_calist_${data.EmployeeCode}`}><Spin id="market_calist_preload" size="small" /></div>} 
                                trigger="hover"
                                placement="right"
                                arrowPointAtCenter
                            >
                                <span style={{ borderBottom: '1px dashed #D1D1D1' }} onMouseOver={getCAListInMarket.bind(this, data.EmployeeCode)}>{scope_area}</span>
                            </Popover>
                        )
                    }
                    else {
                        return scope_area
                    }                           
                }
            },   
            {
                title: 'BR',
                dataIndex: 'BranchCode',
                className: `gridctrl_4 ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.BranchCode, b.BranchCode),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.gridctrl_4').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },  
                width: 35,
                render: (str, data) => {
                    return (<Popover content={`${(data && data.BranchName) ? data.BranchName:''}`}>{ str }</Popover>)
                }
            }
        ] 
    },
    {
        title: `Begining`,
        dataIndex: 'Begining',
        className: `${cls['bg_option5']} ttu tracked tc`,
        children: [
            {
                title: 'Total',
                dataIndex: 'Begining_Total',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Begining_TotalVol',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Begining_TotalCust',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'Current',
                dataIndex: 'Begining_TotalCurrent',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Begining_TotalCurrent_Vol',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Begining_TotalCurrent_Cust',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'Bad Rate',
                dataIndex: 'Begining_TotalBadRate',
                className: `${cls['bg_option5']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Begining_TotalBadRate_Vol',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Begining_TotalBadRate_Cust',
                        className: `${cls['bg_option5']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `Today`,
        dataIndex: 'Today',
        className: `${cls['bg_lemon']} ttu tracked tc`,
        children: [
            {
                title: 'Total',
                dataIndex: 'Today_Total',
                className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Today_TotalVol',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Today_TotalCust',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Current',
                dataIndex: 'Today_TotalCurrent',
                className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Today_TotalCurrent_Vol',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Today_TotalCurrent_Cust',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'Today_TotalCurrent_Per',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'XDay',
                dataIndex: 'Today_TotalXDay',
                className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Today_TotalXDay_Vol',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Today_TotalXDay_Cust',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'Today_TotalXDay_Per',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'Bad Rate',
                dataIndex: 'Today_TotalBadRate',
                className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'Today_TotalBadRate_Vol',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'Today_TotalBadRate_Cust',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'Today_TotalBadRate_Per',
                        className: `${cls['bg_lemon']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `Close Account`,
        dataIndex: 'CloseAcc',
        className: `${cls['bg_option6']} ttu tracked tc`,
        children: [
            {
                title: 'Total',
                dataIndex: 'CloseAcc_Total',
                className: `${cls['bg_option6']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'CloseAcc_TotalVol',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'CloseAcc_TotalCust',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Current',
                dataIndex: 'CloseAcc_TotalCurrent',
                className: `${cls['bg_option6']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'CloseAcc_TotalCurrent_Vol',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'CloseAcc_TotalCurrent_Cust',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'CloseAcc_TotalCurrent_Per',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'XDay',
                dataIndex: 'CloseAcc_TotalXDay',
                className: `${cls['bg_option6']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'CloseAcc_TotalXDay_Vol',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'CloseAcc_TotalXDay_Cust',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'CloseAcc_TotalXDay_Per',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'Bad Rate',
                dataIndex: 'CloseAcc_TotalBadRate',
                className: `${cls['bg_option6']} ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'CloseAcc_TotalBadRate_Vol',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'Cust',
                        dataIndex: 'CloseAcc_TotalBadRate_Cust',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: '%',
                        dataIndex: 'CloseAcc_TotalBadRate_Per',
                        className: `${cls['bg_option6']} ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `W0`,
        dataIndex: 'W0',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'W0_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'W0_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'W0_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'W0_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W0_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'W0_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W0_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'W0_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W0_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'W0_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W0_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `W1-4`,
        dataIndex: 'W1_4',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'W1_4_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'W1_4_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'W1_4_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'W1_4_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W1_4_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'W1_4_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W1_4_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'W1_4_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W1_4_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'W1_4_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'W1_4_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `XDay`,
        dataIndex: 'XDay',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'XDay_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'XDay_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'XDay_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'XDay_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'XDay_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'XDay_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'XDay_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'XDay_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'XDay_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'XDay_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'XDay_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `M1`,
        dataIndex: 'M1',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'M1_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'M1_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'M1_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'M1_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M1_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'M1_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M1_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'M1_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M1_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'M1_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M1_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `M2`,
        dataIndex: 'M2',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'M2_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'M2_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'M2_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'M2_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M2_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'M2_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M2_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'M2_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M2_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'M2_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'M2_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    },
    {
        title: `NPL`,
        dataIndex: 'NPL',
        className: `ttu tracked tc`,
        children: [
            {
                title: 'Begin',
                dataIndex: 'NPL_Begin_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: 'Vol',
                        dataIndex: 'NPL_Begin_TotalVol',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                    {
                        title: 'CIF',
                        dataIndex: 'NPL_Begin_TotalCust',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    },
                ]
            },
            {
                title: 'Close',
                dataIndex: 'NPL_Close_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'NPL_Close_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'ST',
                dataIndex: 'NPL_Stable_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'NPL_Stable_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'FW',
                dataIndex: 'NPL_Flow_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'NPL_Flow_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            },
            {
                title: 'RB',
                dataIndex: 'NPL_Rollback_Total',
                className: `ttu tracked tc pointer`,
                children: [
                    {
                        title: '%',
                        dataIndex: 'NPL_Rollback_TotalPer',
                        className: `ttu tracked tc pointer`,
                        width: standardWidthFix
                    }
                ]
            }
        ]
    }
]

const getCAListInMarket = (market_code) => {
    if(market_code && !_.isEmpty(market_code)) {
        const request_set = new Request(`${MARKET_CAINFO_URL}/${market_code}`, {
            method: 'GET',
            cache: 'no-cache',
            timeout: 5000000
        })

        fetch(request_set).then(response => response.json()).then(data => {
            if(data && data.length > 0) {
                _.delay(() => {
                    let el_target = $(`#market_calist_${market_code}`)
                    let table = createElement('table', { 'class': cls['grid_ca_tooltip'] }, 
                        _.map(['thead', 'tbody'], (sub_tbl) => {
                            if(sub_tbl == 'thead') {
                                return createElement(sub_tbl, {}, 
                                    createElement('tr', {}, 
                                        _.map(['CA Name', 'Total', 'Cycle Due'], (head) => {
                                            return createElement('th', { 'class': 'ttu tc' }, head)
                                        })
                                    )
                                )
                            } else {
                                return createElement(sub_tbl, {}, _.map(data, (r) => {
                                        return createElement('tr', {}, 
                                            _.map([r.CAName, r.Total, r.CycleDueDate], (v, i) => {
                                                return createElement('td', { 'class': (i > 0) ? 'tc' : '' }, v)
                                            })
                                        )
                                    })                                    
                                )
                            }
                        })
                    )
                    el_target.html(table)                   
                }, 200)
            }
        })

    }
    
}

const headAutoSort = (element) => {
    if(element) {
        let el1_class = (element[0]) ? element[0].className.split(" ") : null
        let el2_class = (element[1]) ? element[1].className.split(" ") : null

        if(!in_array('on', el1_class) && !in_array('on', el2_class)) {
            $(element[0]).click()
        } else {
            if(in_array('on', el1_class)) {
                $(element[1]).click()
            }
            if(in_array('on', el2_class)) {
                $(element[0]).click()
            }
        }
    } else {
        console.log('not found element.')
    }    
}

const handleProfile = (e) => {
    _.delay(() => {
        let element = $(`#${e}`).parents()
        if(element) {
            $(element[1]).css('background', '#0046B6 ')
        }
    }, 200)
}

const handleMoney = (amt_conv, amt_full, digit) => {
    if(amt_full >= 1000000) return `${numberWithCommas(roundFixed(amt_conv, digit))}M`
    else return `${numberWithCommas(roundFixed(amt_conv, digit))}K`
}