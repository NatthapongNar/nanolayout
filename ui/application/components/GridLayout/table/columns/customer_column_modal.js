import React, { Component } from 'react'
import moment from 'moment'
import Scrollbar from 'react-smooth-scrollbar'
import { Table, List, Input, Button, Avatar, Tag, Icon, Tooltip, Popover, Modal, Popconfirm, notification } from 'antd'
import { Cookies } from 'react-cookie'
import { createElement, in_array, parseBool, parseNumberShort, str_replace, compareByAlph, compareByDate, compareByAmount, roundFixed, numberWithCommas } from '../../../../containers/Layouts/function'
import { config } from '../../../../containers/Layouts/config'
import cls from '../../style/grid_market.scss'
import style_cell from '../../../Layouts/styles/scss/cell_extension.scss'
import grid_cls from '../../../Layouts/styles/scss/grid_layout.scss'

import AssignCustOutbound from '../assign_cust_outbound'

import { note_columns } from '../../../Layouts/config/profile_columns'

import 'moment/locale/en-gb'
import 'moment/locale/th'

const charWidth = 7.5
const standardDateFix = 85
const standardWidth = 50
const standardWidthFix = 55
const standardWidthBucketFix = 85
const standardNumberFix = 70
const standardBranchFix = 120
const tooltip_placement = 'right'

const fontIcon = { fontSize: '1em' }
const iconRedColor = { color: '#ff6158' }
const iconGreenColor = { color: '#5cab6f' }

const onHandAmtGreaterThen = 'green'
const onHandAmtLessThen = 'red'

const { TextArea } = Input
const confirm = Modal.confirm
const ListItem = List.Item

const status_content = (
    <div className={cls['popHandle']}>
        <h5 style={{ padding: '5px 0', textAlign: 'center', color: '#FFF', backgroundColor: 'cadetblue' }}><b>Operation Status</b></h5>
        <p><b>OP:</b> On hand Operation</p>
        <p><b>OR:</b> Operation Return</p>
        <h5 style={{ padding: '5px 0', textAlign: 'center', color: '#FFF', backgroundColor: 'indianred' }}><b>Credit Status</b></h5>
        <p><b>A:</b> Approved</p>
        <p><b>C:</b> Cancelled</p>
        <p><b>R:</b> Rejected</p>
        <h5 style={{ padding: '5px 0', textAlign: 'center', color: '#FFF', backgroundColor: 'darkgray' }}><b>Sales Process</b></h5>
        <p><b>ZM:</b> On hand ZM</p> 
        <p><b>FC:</b> On hand FC</p>        
        <p><b>TM:</b> On hand TM</p>       
        <p><b>CA:</b> On hand CA</p>    
    </div>
)

const amount_onhand_content = (
    <div className={cls['popHandle']}>
        <p>TM <span style={{ color: onHandAmtGreaterThen }}>วงเงินเป็นสีเขียว = {`FC >= CA`}</span></p>        
        <p>TM <span style={{ color: onHandAmtLessThen }}>วงเงินเป็นสีแดง = {`FC < CA`}</span></p>
        <div style={{ height: '7px', borderTop: '1px solid #D1D1D1' }}  />
        <p>ZM <span style={{ color: onHandAmtGreaterThen }}>วงเงินเป็นสีเขียว = {`FC >= CA`}</span></p>        
        <p>ZM <span style={{ color: onHandAmtLessThen }}>วงเงินเป็นสีแดง = {`FC < CA`}</span></p>
    </div>
)

const cookies = new Cookies()
const cookieData = cookies.get('authen_info', { path: '/' })
const auth_data = (cookieData) ? cookieData.Auth : null

export const customer_column_modal = [  
    {
        title: (<Icon type="plus-square-o" className={` ${cls['mh0']}`} />),
        dataIndex: 'Collapse',
        className: `mktcol_modal_0 ttu tracked ${cls['tc']} ${cls['ph0']} pointer`,
        width: 35,
        render: (str_date) => {
            return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null
        }
    },
    {
        title: (<span>App<br/>Date</span>),
        dataIndex: 'AppInDate',
        className: `mktcol_modal_1 ttu tracked tc ${cls['letter_spece']} pointer`,
        width: standardDateFix,
        sorter: (a, b) => compareByDate(a.AppInDate, b.AppInDate),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.mktcol_modal_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        },
        render: (str_date) => {
            return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null
        }
    },
    {
        title: 'Customer Information',
        dataIndex: 'CustomerCharecter',
        className: 'ttu tracked',
        children: [
            {
                title: 'Name',
                dataIndex: 'AccountName',
                className: `mktcol_modal_2 ${cls['colnowrap']} ${cls['twice']} ${cls['customer_name']} ttu tracked pointer`,
                width: 100,
                sorter: (a, b) => compareByAlph(a.AccountName, b.AccountName),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_2').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (strText, record) => {
                    let AliasName = (record.LoanerAliasName) ? `(${keywordMatch(record.LoanerAliasName)})` : ''
                    let ApplicationNo = (record.ApplicationNo) ? `${record.ApplicationNo}` : ''
                    let Cust_CIF = (record.CIFNO) ? `${record.CIFNO}` : ''
                    let ContactTel  = (record.ContactTel && record.ContactTel != '') ? `${record.ContactTel}` : null

                    let pattern = ["น.ส.", "น.ส. ", "นาง", "นาง ", "นาย ", "นาย"];
                    let name = str_replace(pattern, "", strText)

                    const content = (
                        <div style={{ fontSize: '1em' }}>
                          <div><b>Application No:</b> {`${ApplicationNo}`}</div>
                          <div><b>CIF No:</b> {`${Cust_CIF}`}</div>
                          <div><b>Customer:</b> {`${strText} ${AliasName}`}</div> 
                          <div><b>Contact Tel:</b> {`${(ContactTel) ? ContactTel.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : '-'}`}</div>
                        </div>
                    )
                    
                    return (
                        <Popover content={content}>
                             <span onDoubleClick={copyToClipboard.bind(this, ApplicationNo)} title="กรณีต้องการคัดลอกหมายเลข App No กดดับเบิ้ลคลิก">{`${name}`}</span>
                        </Popover>
                    )

                }
            },
            {
                title: 'Business',
                dataIndex: 'BusinessTypeApp',
                className: `mktcol_modal_3 ${cls['business_desc']} ttu tracked pointer`,
                sorter: (a, b) => compareByAlph(a.BusinessTypeApp, b.BusinessTypeApp),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_3').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (text) => {
                    let calStr = (text && text.length > 0) ? (charWidth * text.length) : 0
                    if (calStr >= 95) {
                        return (<Tooltip placement={tooltip_placement} title={text}>{text}</Tooltip>)
                    } else {
                        return text
                    }
                }
            }
        ]
    },
    {
        title: 'Location Info',
        dataIndex: 'BusinessCharecter',
        className: 'ttu tracked',
        widht: 90,
        children: [
            {
                title: (<div><i className="fa fa-check-square-o" aria-hidden="true" style={{ fontSize: '1.1em' }} /></div>),
                dataIndex: 'IsAssigned',
                className: 'mktcol_modal_4 ttu tracked tc pointer',
                width: 25,
                render: (str, data) => {

                    if(data && data.Layer == 'Main') {
                        const { isMktLayout } = data

                        if(parseBool(isMktLayout.view)) {
                            if(data && !_.isEmpty(data.ColumnCell)) {

                                let font_color = (data.ColumnCell == 'OUT') ? 'red':'green'

                                const content = (
                                    <div id={`EXTENSION_CELL_${data.ApplicationNo}`} className={`${style_cell['tools-extension-container']} ${style_cell['open']}`}>
                                        <div className={`${style_cell['tools-extension-close']} dn`}>
                                            <i className={`ti-close`} />
                                        </div>
                                        <div className={`${style_cell['tools-extension-content']}`}></div>
                                        <div className={`${style_cell['tools-extension-footer']}`}></div>
                                    </div>
                                )

                                return (
                                    <Popover content={content} trigger="hover" placement="right">
                                        <div onMouseOver={handleExtensionCell.bind(this, {el: `EXTENSION_CELL_${data.ApplicationNo}`, data: data, isMktLayout: isMktLayout })}>
                                            {
                                                (isMktLayout.edit) ? 
                                                (
                                                    <Tooltip placement="left" title={`กรณีต้องการรีเซ็ตข้อมูลลูกค้าในแผง คลิกขวา`}>
                                                        <i id={`CONTEXT_CELL_${data.ApplicationNo}`} className={`fa fa-check-square-o ${font_color}`} aria-hidden="true" style={{ fontSize: '1.1em' }} />
                                                    </Tooltip>
                                                ):
                                                (<i className={`fa fa-check-square-o ${font_color}`} aria-hidden="true" style={{ fontSize: '1.1em' }} />)
                                            }
                                        </div>
                                    </Popover>
                                )
                            } else {                                
                                if(parseBool(isMktLayout.edit)) {                                    
                                    return <AssignCustOutbound data={data} isEdit={false} />
                                } else {                                  
                                    return (<Icon type="select" style={{ fontSize: '1.1em' }} onClick={handleEditDisable} />)
                                }
                            }
                            
                        } else {
                            return ''
                        }
                    } else {
                        return ''
                    }
                }
            },
            {
                title: 'Market',
                dataIndex: 'MarketCode',
                className: 'mktcol_modal_5 ttu tracked tc pointer',
                width: standardWidth,
                sorter: (a, b) => compareByAlph(a.MarketCode, b.MarketCode),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_5').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (str, data) => {
                    var market = (str) ? str.replace('M', '') : ''
                    return (<Tooltip placement={tooltip_placement} title={data.MarketName}>{market}</Tooltip>)
                }
            },
            {
                title: 'BR',
                dataIndex: 'BranchCode',
                className: 'mktcol_modal_6 ttu tracked tc pointer',
                width: 35,
                sorter: (a, b) => compareByAmount(a.BranchCode, b.BranchCode), 
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_6').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (str, data) => {
                    return (<Tooltip placement={tooltip_placement} title={`${(data && data.BranchName) ? data.BranchName : ''}`}>{str}</Tooltip>)
                }
            },
            {
                title: 'PD',
                dataIndex: 'CampaignCode',
                className: 'mktcol_modal_7 ttu tracked tc pointer',
                width: 30,
                sorter: (a, b) => compareByAlph(a.Product, b.Product),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_7').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            }
        ]
    },
    {
        title: (<Popover placement="topRight" content={status_content}>Status Information <i className="fa fa-search white"></i></Popover>),
        dataIndex: 'StatusLayout',
        className: 'ttu tracked ',
        children: [
            {
                title: 'CA Name',
                dataIndex: 'CAName',
                className: `mktcol_modal_8 ttu tracked ${cls['ca_name']} pointer`,
                width: 80,
                sorter: (a, b) => compareByAlph(a.CAName, b.CAName),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },               
                render: (strText, rowData) => {
                    let owner_port = (rowData.CA_OwnerName) ? rowData.CA_OwnerName : null
                    if(owner_port && owner_port !== '') {
                        return (
                            <div>
                                <Popover content={`Original CA : ${owner_port}`} placement="top"><div className={cls['triangle_up_right']}>&nbsp;</div></Popover>
                                <Popover placement={tooltip_placement} content={strText}>{strText}</Popover>
                            </div>
                        )
                    } else {
                        return (<Popover placement={tooltip_placement} content={strText}>{strText}</Popover>)
                    }
                    
                }
            },
            {
                title: 'ST',
                dataIndex: 'StatusDigit',
                className: `mktcol_modal_9 ${cls['fix_scale']} ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.StatusDigit, b.StatusDigit),
                widht: 40,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (strText, record) => {
                    let status = (strText && !_.isEmpty(strText)) ? strText : ''
                    if(!_.isEmpty(record) && record.StatusDigit == 'BM') {                        
                        status = 'TM'
                    } 

                    return (<Popover placement={'top'} content={record.Status}><span style={{ minWidth: '24px', maxWidth: '24px' }}>{status}</span></Popover>)
                }
            },
            {
                title: 'Date',
                dataIndex: 'StatusDate',
                className: `mktcol_modal_10 ttu tracked tc ${cls['letter_spece']} pointer`,
                width: 45,
                sorter: (a, b) => compareByDate(a.StatusDate, b.StatusDate),  
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_10').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_date) => {                    
                    return (str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date).format('DD/MM') : null
                }
            },
            {
                title: (<span>AMT <Popover content={amount_onhand_content}><i className="fa fa-info-circle white"></i></Popover></span>),
                dataIndex: 'Limit',
                className: 'mktcol_modal_11 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Limit, b.Limit),               
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_11').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (str_amt, rowData) => {
                    let color = {}

                    let credit_limit = (rowData && rowData.CreditLimit > 0) ? rowData.CreditLimit : 0
                    let fieldcheck_limit = (rowData && rowData.FieldCheckerLimit > 0) ? rowData.FieldCheckerLimit : 0

                    if(!_.isEmpty(rowData) && rowData.StatusDigit == 'BM') {                        
                        if(fieldcheck_limit >= credit_limit) {
                            color = { color: onHandAmtGreaterThen }
                        }
                        if(fieldcheck_limit < credit_limit) {
                            color = { color: onHandAmtLessThen }
                        }

                        const limit = (
                            <div className={cls['popHandle']}>
                                <p><b>CA :</b> {numberWithCommas(roundFixed(credit_limit, 0))}</p>
                                <p><b>FC :</b> {numberWithCommas(roundFixed(fieldcheck_limit, 0))}</p>
                            </div>
                        )     
                                               
                        return (str_amt) ? <Popover content={limit}><span style={color}>{`${numberWithCommas(roundFixed(str_amt, 0))}`}</span></Popover> : 0

                    } else {
                        return numberWithCommas(roundFixed(str_amt, 0))
                    }

                    
                }
            }
        ]
    },
    {
        title: (<span>Setup<br/>Date</span>),
        dataIndex: 'SetupDate',
        className: `mktcol_modal_12 ttu tracked tc ${cls['letter_spece']} pointer`,
        width: standardDateFix,
        sorter: (a, b) => compareByDate(a.SetupDate, b.SetupDate),  
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.mktcol_modal_12').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        }, 
        render: (str_date, rowData) => {
            let setup_date = (!_.isEmpty(rowData.SetupDate) && rowData.SetupDate !== '1900-01-01T00:00:00.000Z') ? rowData.SetupDate : null
  
            let setup_period = null
            if(!_.isEmpty(setup_date)) {
                setup_period = dateDiff(setup_date)
            }

            if(str_date && !_.isEmpty(str_date)) {
                return (
                    <Popover placement="top" content={`${(setup_period) ? `Period ${setup_period}` : ''}`}>
                        {`${(str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null}`}
                    </Popover>
                )
            } else {
                return null
            }

        }
    },
    {
        title: 'O/S Bal.',
        dataIndex: 'LoanSetup',
        className: 'ttu tracked',
        children: [
            {
                title: 'Amt',
                dataIndex: 'Principle',
                className: 'mktcol_modal_13 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Principle, b.Principle),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_13').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt, rowData) => {

                    let start_os = (rowData.PrincipleStart && rowData.PrincipleStart > 0) ? rowData.PrincipleStart : 0
                    let bal_os = (str_amt && str_amt > 0) ? str_amt : 0
                    let diff_os = start_os - bal_os

                    const content = (
                        <div style={{ fontSize: '1em' }}>
                            <div>
                                <b>O/S ต้นเดือน </b>  
                                {` ${(rowData && rowData.PrincipleStart) ? numberWithCommas(roundFixed(rowData.PrincipleStart, 0)) : 0} ${(diff_os && diff_os > 0) ? `(-${roundFixed(diff_os, 0)})`:''}`}
                            </div>
                        </div>
                    )
                    
                    return (
                        <Popover content={content}>
                             <span>{`${(str_amt) ? numberWithCommas(roundFixed(str_amt, 0)) : 0}`}</span>
                        </Popover>
                    )
                }
            },
            {
                title: 'NU',
                dataIndex: 'IsTopup',
                className: `mktcol_modal_14 ttu tracked tc ${cls['letter_spece']} pointer`,                
                width: 30,
                sorter: (a, b) => compareByAlph(a.IsTopup, b.IsTopup),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_14').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (flag) => {
                    return (flag && flag == 'Y') ? flag:''
                }
            }
        ]
    },
    {
        title: 'Cycle Due',
        dataIndex: 'WkCycle',
        className: 'ttu tracked',
        children: [           
            {
                title: 'Due',
                dataIndex: 'MthCycleDueDay',
                className: 'mktcol_modal_15 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.MthCycleDueDay, b.MthCycleDueDay),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_15').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: 'Day',
                dataIndex: 'WkCycleDue',
                className: 'mktcol_modal_16 ttu tracked tc pointer',
                sorter: (a, b) => compareByAlph(a.WkCycleDue, b.WkCycleDue),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_16').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: (<Popover content="Yesterday Priority">P</Popover>),
                dataIndex: 'Yesterday_Priority',
                className: 'mktcol_modal_17 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Yesterday_Priority, b.Yesterday_Priority),
                width: 25,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_17').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: 'WK',
                dataIndex: 'Week_Installment',
                className: 'mktcol_modal_18 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Week_Installment, b.Week_Installment),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_18').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt) => {
                    return (str_amt) ? numberWithCommas(str_amt) : 0
                }
            },
            {
                title: 'Mth',
                dataIndex: 'Mth_Installment',
                className: 'mktcol_modal_19 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Mth_Installment, b.Mth_Installment),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_19').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt) => {
                    return (str_amt) ? numberWithCommas(str_amt) : 0
                }
            }
        ]
    },   
    {
        title: 'DPD BUCKET',
        dataIndex: 'DPDBucketInformation',
        className: 'ttu tracked',
        children: [
            {
                title: 'Start',
                dataIndex: 'Cust_DPDBucketStart',
                className: 'mktcol_modal_20 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Cust_DPDBucketStartSeq, b.Cust_DPDBucketStartSeq),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_20').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (str, rowData) => {
                    let current_bucket = (rowData && rowData.Cust_DPDBucketNow) ? rowData.Cust_DPDBucketNow: ''
                    let start_bucket = (str && !_.isEmpty(str)) ? str : current_bucket
                    return start_bucket
                }
            },
            {
                title: 'Now',
                dataIndex: 'Cust_DPDBucketNow',
                className: 'mktcol_modal_21 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Cust_DPDBucketNowSeq, b.Cust_DPDBucketNowSeq),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_21').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (bucket, rowData) => {
                    let overdue_day = (rowData.DueDPD) ? rowData.DueDPD : 0
                    let current_point = (rowData.Cust_DPDBucketNow && in_array(rowData.Cust_DPDBucketNow, ['XDay', 'M1', 'M2', 'NPL'])) ? 'MDPD': 'WDPD'

                    let text_bucket = `${overdue_day} ${current_point}`
                    // if(current_point == 'WDPD') {
                    //     if(overdue_day == 0)
                    //         text_bucket = '0 WDPD'
                    //     else if(overdue_day > 0 && overdue_day <= 7)
                    //         text_bucket = '1-7 WDPD'
                    //     else if(overdue_day > 8 && overdue_day <= 14)
                    //         text_bucket = '8-14 WDPD'
                    //     else if(overdue_day >= 15 && overdue_day <= 21)
                    //         text_bucket = '15-21 WDPD'
                    //     else if(overdue_day >= 22 && overdue_day <= 30)
                    //         text_bucket = '22-30 WDPD'
                    // } else {
                    //     if(overdue_day > 1 && overdue_day <= 30)
                    //         text_bucket = '1-30 MDPD'
                    //     else if(overdue_day >= 31 && overdue_day <= 60)
                    //         text_bucket = '31-60 MDPD'
                    //     else if(overdue_day >= 61 && overdue_day <= 90)
                    //         text_bucket = '61-90 MDPD'
                    //     else if(overdue_day > 90)
                    //         text_bucket = '90+ MDPD'
                    // }
                    return (<Popover placement="top" content={`${text_bucket}`}>{bucket}</Popover>)
                }
            },
            {
                title: (<Popover content="Today Priority">P</Popover>),
                dataIndex: 'Priority',
                className: 'mktcol_modal_22 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Priority, b.Priority),
                width: 25,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_22').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            }
        ]
    },
    {
        title: 'Overdue Info',
        dataIndex: 'Overdue',
        className: 'ttu tracked',
        children: [     
            {
                title: (<Popover content="Overdue Day"><Icon type="dashboard" /></Popover>),
                dataIndex: 'OverdueDay',
                className: 'mktcol_modal_23 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.OverdueDay, b.OverdueDay),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_23').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (days, rowData) => {
                    let current_point = (rowData.Cust_DPDBucketNow && in_array(rowData.Cust_DPDBucketNow, ['XDay', 'M1-2', 'NPL'])) ? 'MDPD': 'WDPD'
                    let current_dpd = (current_point == 'WDPD') ? rowData.WDPD : rowData.MDPD
                    return (<Popover placement="top" content={`${current_dpd} ${current_point}`}>{days}</Popover>)
                }
            },       
            {
                title: 'Amt',
                dataIndex: 'OverdueAmt',
                className: 'mktcol_modal_24 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) =>  compareByAmount(a.OverdueAmt, b.OverdueAmt),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_24').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt) => {
                    return (str_amt) ? numberWithCommas(str_amt) : 0
                }
            },
            {
                title: (<Popover content="MPD = ชำระเงินเพื่อให้หลุดจาก XDay"><span>MPD</span></Popover>),
                dataIndex: 'Mth_AmtPastDue',
                className: 'mktcol_modal_25 ttu tracked tr pointer',
                sorter: (a, b) => compareByAmount(a.Mth_AmtPastDue, b.Mth_AmtPastDue),   
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_25').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
            
                width: standardNumberFix,
                render: (str_amt) => {
                    return (str_amt) ? numberWithCommas(str_amt) : 0
                }
            },
            {
                title: 'Last pmt',
                dataIndex: 'LastPaymentDate',
                className: 'mktcol_modal_26 ttu tracked tr pointer',
                sorter: (a, b) => compareByDate(a.LastPaymentDate, b.LastPaymentDate),   
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_26').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                width: 65,
                render: (str_date, record) => {                    
                    let str_amt = (record && record.LastPaymentAmt) ? numberWithCommas(record.LastPaymentAmt) : 0
                    return (<Popover content={`ชำระล่าสุด ${str_amt}`}>{(str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null}</Popover>)
                }
            },
            {
                title: (<div className="tc">Note</div>),
                dataIndex: 'Cause',
                className: `mktcol_modal_27 ${cls['cause_name']} ttu tracked tl pointer`,
                sorter: (a, b) => compareByAlph(a.Cause, b.Cause),   
                width: 80,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_modal_27').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (strText, record) => {

                    let TMNote_Cause = (record.Cause) ? `${record.Cause}` : null
                    let CANote_Cause = (record.CA_Cause) ? `${record.CA_Cause}` : null

                    let note_check = (CANote_Cause && CANote_Cause !== '') ? CANote_Cause : TMNote_Cause

                    return (<PopoverTabletHist latestNote={note_check} dataItems={record} />) 

                }
            },
            {
                title: (<Popover content="Comment For TM Up" placement="left"><Icon type="message" className="pointer" /></Popover>),
                dataIndex: 'IconNote',
                className: 'mktcol_modal_28 ttu tracked tc',
                width: 25,
                render: (str, rowsData) => {
                    if(rowsData && rowsData.Layer == 'Main') {
                        return (<PopoverNote data={rowsData} handleUpdateNote={rowsData.handleUpdateNote} />)
                    } else {
                        return null
                    }                    
                }
            }
        ]
    }
]

class PopoverTabletHist extends Component {

    state = {
        dataHist: [],
        dataLoading: true
    }

    render() {
        const { latestNote, dataItems } = this.props

        return (            
            <Popover 
                trigger="click"             
                mouseEnterDelay={3} 
                placement="left" 
                className="pointer"
                onClick={this.handleTabletHist.bind(this, dataItems)} 
                content={
                    <div id={`TABLET_${dataItems.AccountNo}`} style={{ width: '300px', opacity: 0 }}>
                        <List
                            loading={this.state.dataLoading}
                            size="small"
                            dataSource={this.state.dataHist}
                            renderItem={(item, i) => (
                                <ListItem style={{ fontSize: '1em', lineHeight: '24px', padding: '0px 0px 2px 5px' }}> 
                                    <span style={{ fontSize: '2em'}}>
                                        {(i + 1)}. &nbsp;
                                        <span onMouseOver={this.handleTabletEmpImg.bind(this, { items: dataItems, index: (i+1) })}>
                                            <Popover 
                                                shape="square"
                                                placement="top"                                           
                                                content={(
                                                    <div id={`TABLET_IMG_${dataItems.AccountNo}_${(i+1)}`} style={{ opacity: 0 }}>
                                                        <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${(item && item.created_id) ? item.created_id : null}`} style={{ width: '75px', height: '75px', borderRadius: '0px' }} />
                                                    </div>
                                                )}                                             
                                            >
                                                <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${(item && item.created_id) ? item.created_id : null}`} shape="square" size="small" style={{ borderRadius: '0px', cursor: 'pointer' }} />
                                            </Popover>
                                        </span>
                                        <Tag color={this.handleLayerColorByPosit(item.created_position)} style={{ borderRadius: '0px', minHeight: '24px' }}>{`${(item && item.created_position) ? ` ${item.created_position} ` : ''} `}</Tag>
                                        {`${(item && item.created_date) ? moment(item.created_date).format('DD/MM/YYYY') : ''} : `}
                                        {`${(item && item.latest_note) ? item.latest_note: ''}`}
                                    </span>
                                </ListItem>
                            )}
                        />
                    </div>
                }
            > 
                <Tooltip placement="left" title="คลิก เพื่อดูประวัติย้อนหลัง">{latestNote}</Tooltip>
            </Popover>
        )
    }

    handleTabletHist = (data) => {
        if(data && data.AccountNo) {
            const request_set = new Request(`${config.hostapi}/tablethist/acc_code/${data.AccountNo}/tablet_note`, {
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
                this.setState({ dataHist: (resp.status) ? resp.data : [], dataLoading: false  })  
            })
            .catch(err => { console.log(`fetch error ${err}`) })

            _.delay(() => {
                let e = `TABLET_${data.AccountNo}`    
                _.delay(() => { 
                    $(`#${e}`).css({ opacity: 1, border: '2px solid #D1D1D1' }) 
                    $(`#${e}`).addClass('animated fadeIn')
                }, 300)
                let element = $(`#${e}`).parents()
                if(element) {
                    $(element[0]).css('padding', '0px')
                    $(element[0]).addClass(`${cls['unset']}`)
                    $(element[1]).css('background', '#FFF ')
                    $(element[2]).addClass(cls['unset'])
                    $(element[2]).addClass('animated bounceIn')
        
                    let el_arrow = $(element[3]).children()[0]            
                    if(el_arrow) {
                        $(el_arrow).addClass(cls['unset'])
                    }
                }
                
            }, 200)

        }

    }

    handleTabletEmpImg = (data) => {
        console.log(data)
        _.delay(() => {
            let e = `TABLET_IMG_${data.items.AccountNo}_${data.index}`    
            _.delay(() => { 
                $(`#${e}`).css({ opacity: 1 }) 
                $(`#${e}`).addClass('animated fadeIn')
            }, 300)
            let element = $(`#${e}`).parents()
            if(element) {
                $(element[0]).css('padding', '0px')
                $(element[0]).addClass(`${cls['unset']}`)
                $(element[1]).css('background', '#FFF ')
                $(element[2]).addClass(cls['unset'])
                $(element[2]).addClass('animated bounceIn')
    
                let el_arrow = $(element[3]).children()[0]            
                if(el_arrow) {
                    $(el_arrow).addClass(cls['unset'])
                }
            }
            
        }, 200)

    }

    handleLayerColorByPosit = (position) => {
        switch(position) {
            case 'RD':
                return 'green'
            case 'AM':
                return 'cyan'
            case 'ZM':
                return 'orange'
            case 'TM':
                return 'gold'
            case 'FCR':
                return 'yellowgreen'
            case 'PCA':
                return 'volcano'
            default: 
                return 'red'
        }
    }

}

class PopoverNote extends Component {

    state = {
        gridData: []
    }

    render() {
        const { data } = this.props

        const text = (<div>กรุณายืนยันการบันทึกข้อมูล</div>)
        const evtSaveNote = this.handleAddMessage.bind(this, { appno: `${data.ApplicationNo}`, mktcode: data.MarketCode })

        const popf_config = {
            id: `CONF_${data.ApplicationNo}`,
            title: text,
            onConfirm: evtSaveNote,
            okText: "ยืนยัน",
            cancelText: "ยกเลิก",
            onClick: handlConfirmNote.bind(this, `CONF_${data.ApplicationNo}`),
            placement: "left"
        }

        let note_date = (data && !_.isEmpty(data.LatestUpdateEmpDate)) ? moment(data.LatestUpdateEmpDate).format('DD/MM/YYYY') : ''
        let note_actor = (data && !_.isEmpty(data.LatestUpdateEmpName)) ? data.LatestUpdateEmpName.split(' ')[0] : ''
        let note_latest = (data && !_.isEmpty(data.LatestCustNote)) ? data.LatestCustNote : ''

        let new_note = (note_date == moment().format('DD/MM/YYYY')) ? true : false
        
        const content = (
            <div style={{ fontSize: '1em' }}>
                <div>{`${note_date} ${note_actor} : ${note_latest}`}</div>
            </div>
        )

        return (
            <Popover 
                trigger="click"             
                mouseEnterDelay={3} 
                placement="left" 
                className="pointer"
                onClick={this.handleProfile.bind(this, { appno: `${data.ApplicationNo}`, mktcode: data.MarketCode })} 
                content={(
                    <div id={`EL_${data.ApplicationNo}`} style={{ width: '300px', opacity: 0 }}>
                        <small className="ttu fw5" style={{ display: 'block' }}><Icon type="exception" /> Note Message :</small>
                        <TextArea id={`${data.ApplicationNo}`} />
                        <div style={{ textAlign: 'right' }}>
                            <Popconfirm {...popf_config}>
                                <Button type="primary" icon="save" size="small" style={{ marginTop: '5px' }} />
                            </Popconfirm>
                        </div>
                       
                        <div className={cls['grid_container']}>
                            <small className="ttu fw5" style={{ display: 'block' }}><Icon type="notification" /> Note History</small>
                            <Scrollbar style={{ maxHeight: '200px', minHeight: 'auto' }}>
                                <Table 
                                    rowKey="RowID"
                                    columns={note_columns} 
                                    dataSource={this.state.gridData} 
                                    className={`${cls['grid_nano_dashboard']} ${cls['mt1']}`}
                                    pagination={false}
                                    bordered
                                />
                            </Scrollbar>
                        </div>
                        
                    </div>
                )}
            >                
                {
                    (data && !_.isEmpty(data.LatestUpdateEmpDate)) ? 
                    (
                        <Popover content={content} placement="left">
                            <div className={(new_note) ? cls['latest_note'] : cls['latest_note_old']}>
                                <Icon id={`ICON_${data.ApplicationNo}`} type="notification" />
                            </div>                    
                        </Popover>
                    ) : (<div><Icon id={`ICON_${data.ApplicationNo}`} type="message" /></div>)
                }
               
            </Popover>
        )
    }

    handleAddMessage = (objData) => {
        const { handleUpdateNote } = this.props

        let el_target = document.querySelector(`#${objData.appno}`)
        let appno = (objData.appno) ? objData.appno : null

        let params = {
            MarketCode: (objData.mktcode) ? objData.mktcode : null,
            ApplicationNo: appno,
            Subject: 'อื่นๆ',
            Reason: 'N099',
            Remark: el_target.value,
            CreateID: (auth_data && !_.isEmpty(auth_data)) ? `${auth_data.EmployeeCode}`: null,
            CreateBy: (auth_data && !_.isEmpty(auth_data)) ? `${stripname(auth_data.EmpName_TH)}`: null
        }
    
        const request_set = new Request(`${config.hostapi}/noteupdate`, {
            method: 'POST',
            header: new Headers({
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }),
            body: JSON.stringify(params),
            cache: 'no-cache'
        })

        if(el_target.value && el_target.value.length >= 4) {
            let icon_target = document.querySelector(`#ICON_${appno}`)
            if(icon_target) {
                // SET PARAM TO PROPS
                handleUpdateNote(params)

                // CHANGE INTERFACE
                $(icon_target).parent().addClass(cls['latest_note'])
                $(icon_target).attr('class', 'anticon anticon-notification pointer')
            }

            fetch(request_set)
            .then(response => response.json())
            .then(data => {
                if (data.status) {
                    notification.success({
                        message: 'แจ้งเตือนจากระบบ',
                        description: 'ระบบดำเนินการบันทึกข้อมูลสำเร็จ'
                    })

                    el_target.value = ''

                } else {
                    notification.error({
                        message: 'แจ้งเตือนจากระบบ',
                        description: 'ขออภัย! เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาติดต่อทีม Hotline (3618) หรือทีมผู้ดูแลระบบ'
                    })
                }
            })

        } else {
            notification.warning({
                message: 'แจ้งเตือนจากระบบ',
                description: 'กรุณากรอกข้อมูลให้ถูกต้อง และตัวอักษรมากกว่า 4 ตัวอักษร',
            })
        }
    
    
    }

    handleProfile = (data) => {

        if(data.mktcode && data.appno) {
            const request_set = new Request(`${config.hostapi}/notelists/mktc/${data.mktcode}/app/${data.appno}/note_lists`, {
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
                this.setState({ gridData: (resp.status) ? resp.data : []  })    
            })
            .catch(err => { console.log(`fetch error ${err}`) })

        }

        _.delay(() => {
            let e = `EL_${data.appno}`    
            _.delay(() => { 
                $(`#${e}`).css({ opacity: 1 }) 
                $(`#${e}`).addClass('animated fadeIn')
            }, 300)
            let element = $(`#${e}`).parents()
            if(element) {
                $(element[0]).css('padding', '5px')
                $(element[0]).addClass(`${cls['unset']}`)
                $(element[1]).css('background', '#FFF ')
                $(element[2]).addClass(cls['unset'])
                $(element[2]).addClass('animated bounceIn')
    
                let el_arrow = $(element[3]).children()[0]            
                if(el_arrow) {
                    $(el_arrow).addClass(cls['unset'])
                }
            }
            
        }, 200)

    } 

}

// CELL EXTENSION
const handleInterfaceField = (data) => {
    if(data && !_.isEmpty(data)) {
        let cell_appno = data.ApplicationNo
        let cell_refno = data.ColumnCell
        let cell_outbound = (data.MarketTypeID && data.MarketTypeID == 2) ? 'OUT' : 'IN'
        let cell_num = (cell_refno) ? cell_refno : cell_outbound

        let onhand_item = (data && data.OnHandStatus) ? data.OnHandStatus : ''
        let bucket_item = (data && data.Cust_DPDBucketNow) ? data.Cust_DPDBucketNow : ''
        let status_item = (data && data.StatusDigit) ? data.StatusDigit : ''

        let status_reanson = (data && data.Status) ? data.Status : null
        let principle_item = (data && data.Principle) ? data.Principle : null

        let acc_close = (principle_item && principle_item > 0) ? 'N' : 'Y'
        let check_status = (status_reanson == 'Approved' && acc_close == 'Y') ? 'E' : status_item

        let cell_bucket = checkCellOnhand(data)
        let cell_status = onChangeStateCell(data)
       
        return createElement('div', { 'class': `${style_cell['cell-box']}`, 'data-attr': cell_appno, 'data-ref': cell_refno, 'data-onhand': onhand_item, 'data-status': check_status, 'data-bucket': bucket_item, 'data-reserv': "true" },
            createElement('div', { 'key': cell_appno, 'class': `${grid_cls['cell']} ${cell_status}` }, 
                _.map([cell_bucket, cell_num], (v, i) => {
                    switch(i) {
                        case 0: 
                            return createElement('div', { class: `${grid_cls['cell_inside_header']}`, 'style': 'font-size: 1.1em' }, v)
                        case 1:
                            return createElement('div', { class: `${grid_cls['cell_inside_bottom']}`, 'style': 'font-size: 1.1em' }, v)
                        default:
                            return (v) ? v : ''
                    }                        
                })
            )
        )
    }
}

const checkCellOnhand = (findCustomer) => {
    let appStatus = (findCustomer) ? findCustomer.StatusDigit : null

    // Check close account
    const status = (findCustomer) ? findCustomer.Status : null
    let principle = (findCustomer) ? findCustomer.Principle : null
    let acc_close = (principle && principle > 0) ? 'N' : 'Y'

    // Check Top Up
    let topup = (findCustomer) ? findCustomer.IsTopUp : null
    let isTopUp = (topup == 'A') ? 'TOP UP' : ''

    // Check Start NPL
    let isRisks = false
    let bucket = (findCustomer) ? findCustomer.Cust_DPDBucketNow : null

    if (bucket) {
        if (!in_array(bucket, config.bktFullNotRisks)) {
            isRisks = true
        }
    } else {
        isRisks = false
    }

    let cell_header = ''
    if (status == 'Approved' && acc_close == 'Y') {
        cell_header = 'END'

    } else {
        if (in_array(appStatus, ['A'])) {
            if (!isRisks) {
                if (bucket == 'W0') {
                    cell_header = (findCustomer) ? parseNumberShort(findCustomer.Principle) : ''
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
            } else {
                let on_hand = (findCustomer) ? findCustomer.OnHandStatus : null
                if (on_hand) {
                    cell_header = on_hand
                }
            }
        }
    }

    return cell_header
}

const onChangeStateCell = (result) => {
    if(result) {
        const principle = (result.Principle) ? result.Principle:null
        const status = (result.Status) ? result.Status:null
        let acc_close = (principle && principle > 0) ? 'N':'Y'
        
        if(status == 'Approved' && acc_close == 'Y') { 
            return `${grid_cls['cell_active']} ${grid_cls['cell_closeacc']}`

        } else {
            if (in_array(result.StatusDigit, ['A'])) {
                if (!in_array(result.Cust_DPDBucketNow, config.bktFullNotRisks)) 
                    return `${grid_cls['cell_active']} ${grid_cls['cell_overdue']}`
                else 
                    return grid_cls['cell_active']

            } else if (in_array(result.StatusDigit, ['C', 'R'])) {
                return `${grid_cls['cell_active']} ${grid_cls['cell_reject']}`

            } else { 
                if (!in_array(result.Cust_DPDBucketNow, config.bktFullNotRisks) && result.Cust_DPDBucketNow) 
                    return `${grid_cls['cell_active']} ${grid_cls['cell_overdue']}`
                else 
                    return `${grid_cls['cell_active']} ${grid_cls['cell_onhand']}` 
            }
        }

    } else { 
        return `${grid_cls['cell_active']} ${grid_cls['cell_onhand']}` 
    }
}

const handleEventBinding = (el) => {    
    $(el).on('click', () => {
        notification.info({
            message: 'แจ้งเตือนจากระบบ',
            description: 'ฟังก์ชั่นนี้ยังไม่พร้อมใช้งาน (อยู่ระหว่างการพัฒนาโหมด jumper)',
        })
    })
}

// END EXTENSION

const handleNoteTooltip = (el) => {
    _.delay(() => {
        let e = `${el}`    
        _.delay(() => { 
            $(`#${e}`).css({ opacity: 1 }) 
            $(`#${e}`).addClass('animated fadeIn')
        }, 300)
        let element = $(`#${e}`).parents()
        if(element) {
            $(element[0]).css('padding', '3px 5px')
            $(element[0]).addClass(`${cls['unset']}`)
            $(element[1]).css('background', '#FFF ')
            $(element[2]).addClass(cls['unset'])
            // $(element[2]).addClass('animated zooomIn')

            let el_arrow = $(element[3]).children()[0]            
            if(el_arrow) {
                $(el_arrow).addClass(cls['unset'])
            }
        }
        
    }, 200)

}

const handleExtensionCell = (params) => {
    _.delay(() => {
        let e = `${params.el}`    
        _.delay(() => { 
            $(`#${e}`).css({ opacity: 1, left: '-5px', top: '-19px' }) 
        }, 300)

        let element = $(`#${e}`).parents()
        if(element) {
            let cell = handleInterfaceField(params.data)
            const cell_content = $(`#${e}`).find(`.${style_cell['tools-extension-content']}`)
    
            if(cell_content && cell_content.length > 0) {
                cell_content.html(cell)
                handleEventBinding(cell)
            }

            $(element[0]).css('padding', '3px 5px')
            $(element[0]).addClass(`${cls['unset']}`)
            $(element[1]).css('background', 'transparent')
            $(element[2]).addClass(cls['unset'])

            let el_arrow = $(element[3]).children()[0]            
            if(el_arrow) {
                $(el_arrow).addClass(cls['unset']).css('background', 'transparent')
            }
        }

        const { data, isMktLayout } = params

        if(parseBool(isMktLayout.edit)) {   
            let element_name = `#CONTEXT_CELL_${data.ApplicationNo}`
            $.contextMenu({
                selector: element_name,
                callback: (key) => {
                    if (key == 'reset_cust') {

                        let request_data = {
                            MarketCode: (data && !_.isEmpty(data.MarketCode)) ? data.MarketCode : null,
                            ApplicationNo: (data && !_.isEmpty(data.ApplicationNo)) ? data.ApplicationNo : null,
                            CustomerName: (data && !_.isEmpty(data.AccountName)) ? data.AccountName : null,
                            RequestID: (auth_data && !_.isEmpty(auth_data)) ? auth_data.EmployeeCode : null,
                            RequestName: (auth_data && !_.isEmpty(auth_data)) ? stripname(auth_data.EmpName_TH) : null
                        }

                        confirm({
                            title: 'ต้องการรีเซ็ตข้อมูลในแผงตลาด?',
                            content: 'กรุณายืนยันการรีเซ็ตข้อมูล หากต้องการรีเซ็ตข้อมูลคลิก OK หรือ Cancel เพื่อยกเลิก',
                            onOk: () => {

                                const request_set = new Request(`${config.hostapi}/resetownerInOutbound`, {
                                    method: 'POST',
                                    header: new Headers({
                                        'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                                    }),
                                    body: JSON.stringify(request_data),
                                    cache: 'no-cache'
                                })
                
                                fetch(request_set)
                                .then(resp => resp.json())
                                .then(resp => {
                                    if(parseBool(resp.status)) {
                                        notification.success({
                                            message: 'แจ้งเตือนจากระบบ',
                                            description: 'ระบบดำเนินการรีเซ็ตข้อมูลลูกค้าสำเร็จ'
                                        })
                                        
                                        data.handleResetCellAssignment(request_data)                     
                                    }
                                })

                            },
                            onCancel: () => { }
                        })

                    }

                },
                items: {
                    "reset_cust": { name: "รีเซ็ตข้อมูลลูกค้าในแผง (Reset)", icon: "fa-trash" }
                }
            })
        }

        
        
    }, 200)

}

const handleEditDisable = () => {
    notification.error({
        message: 'แจ้งเตือนจากระบบ',
        description: 'ขออภัย! ท่านไม่สามารถแก้ไขหรือเพิ่มลูกค้าลงแผง ได้จากฟังก์ชั่นนี้ กรุณาใช้ระบบ Nano Market Management',
        duration: 10
    })
}

const stripname = (str) => {
    if (str)
        return str.replace('+', ' ')
    else
        return ''
}

const copyToClipboard = (appno) => {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val(appno).select();
    document.execCommand("copy");
    $temp.remove();

    notification.success({ message: 'Copy text to clipboard', description: `ระบบคัดลอกข้อมูลหมายเลข ${appno}` })
}

const keywordMatch = (strText) => {
    const keyword_text = ['พี่', 'พี', 'เจ๊', 'คุณ', 'ป้า', 'ลุง']
    let master_pattern = new RegExp(keyword_text.join('|'))

    if (strText && !master_pattern.test(strText)) return `พี่${strText}`
    else return (strText && strText !== '') ? strText : ''
}

const adjuctTooltip = (strText, cellWidth) => {
    if (strText) {
        let charSize = charWidth * strText.length
        return (charSize > cellWidth) ? (<Tooltip placement={tooltip_placement} title={strText}>{strText}</Tooltip>) : strText
    } else {
        return strText
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

const handlConfirmNote = (e) => {
    _.delay(() => {
        let el_target = $(`#${e}`)
        let elements = el_target.parents()

        el_target.addClass(cls['unset'])       
        el_target.find('.ant-popover-inner-content').addClass(cls['unset'])

        if(elements) {
            $(elements[0]).addClass(`${cls['unset']} animated fadeIn`)
            $(elements[0]).find('.ant-popover-arrow').addClass(cls['unset'])
        }
        
    }, 200)
}

const dateDiff = (date) => {
    date = date.split('-');
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var yy = parseInt(date[0]);
    var mm = parseInt(date[1]);
    var dd = parseInt(date[2]);
    var years, months, days;

    months = month - mm;
    if (day < dd) {
        months = months - 1;
    }

    years = year - yy;
    if (month * 100 + day < mm * 100 + dd) {
        years = years - 1;
        months = months + 12;
    }

    days = Math.floor((today.getTime() - (new Date(yy + years, mm + months - 1, dd)).getTime()) / (24 * 60 * 60 * 1000))

    return `${years}.${months}.${days}`
}