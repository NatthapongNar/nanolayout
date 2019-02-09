import React, { Component } from 'react'
import moment from 'moment'
import { Icon, Tooltip, Popover, notification } from 'antd'
import { Cookies } from 'react-cookie'
import { in_array, str_replace, compareByAlph, compareByDate, compareByAmount, roundFixed, numberWithCommas } from '../../../../containers/Layouts/function'
import { config } from '../../../../containers/GridLayout/config'
import cls from '../../style/grid_market.scss'

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

export const customer_column_modal = [  
    {
        title: (<Icon type="plus-square-o" className={` ${cls['mh0']}`} />),
        dataIndex: 'Collapse',
        className: `warningcol_0 ttu tracked ${cls['tc']} ${cls['ph0']} pointer`,
        width: 35,
        render: (str_date) => {
            return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null
        }
    },
    {
        title: (<span>App<br/>Date</span>),
        dataIndex: 'AppInDate',
        className: `warningcol_1 ttu tracked tc ${cls['letter_spece']} pointer`,
        width: standardDateFix,
        sorter: (a, b) => compareByDate(a.AppInDate, b.AppInDate),
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.warningcol_1').find('.ant-table-column-sorter > span')
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
                className: `warningcol_2 ${cls['colnowrap']} ${cls['twice']} ${cls['customer_name']} ttu tracked pointer`,
                width: 100,
                sorter: (a, b) => compareByAlph(a.AccountName, b.AccountName),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_2').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (strText, record) => {
                    let AliasName = (record.LoanerAliasName) ? `(${keywordMatch(record.LoanerAliasName)})` : ''
                    let ApplicationNo = (record.ApplicationNo) ? `${record.ApplicationNo}` : ''
                    let ContactTel  = (record.ContactTel && record.ContactTel != '') ? `${record.ContactTel}` : null

                    let pattern = ["น.ส.", "น.ส. ", "นาง", "นาง ", "นาย ", "นาย"];
                    let name = str_replace(pattern, "", strText)

                    const content = (
                        <div style={{ fontSize: '1em' }}>
                          <div><b>Application No:</b> {`${ApplicationNo}`}</div>
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
                className: `warningcol_3 ${cls['business_desc']} ttu tracked pointer`,
                sorter: (a, b) => compareByAlph(a.BusinessTypeApp, b.BusinessTypeApp),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_3').find('.ant-table-column-sorter > span')
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
                title: 'Market',
                dataIndex: 'MarketCode',
                className: 'warningcol_4 ttu tracked tc pointer',
                width: standardWidth,
                sorter: (a, b) => compareByAlph(a.MarketCode, b.MarketCode),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_4').find('.ant-table-column-sorter > span')
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
                className: 'warningcol_5 ttu tracked tc pointer',
                width: 35,
                sorter: (a, b) => compareByAmount(a.BranchCode, b.BranchCode), 
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_5').find('.ant-table-column-sorter > span')
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
                className: 'warningcol_6 ttu tracked tc pointer',
                width: 30,
                sorter: (a, b) => compareByAlph(a.Product, b.Product),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_6').find('.ant-table-column-sorter > span')
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
                className: `warningcol_7 ttu tracked ${cls['ca_name']} pointer`,
                width: 80,
                sorter: (a, b) => compareByAlph(a.CAName, b.CAName),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_7').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },               
                render: (strText, record) => {
                    return (<Tooltip placement={tooltip_placement} title={strText}>{strText}</Tooltip>)
                }
            },
            {
                title: 'ST',
                dataIndex: 'StatusDigit',
                className: `warningcol_8 ${cls['warningcol_8']} ttu tracked tc pointer`,
                sorter: (a, b) => compareByAlph(a.StatusDigit, b.StatusDigit),
                widht: 30,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (strText, record) => {
                    let status = strText
                    if(!_.isEmpty(record) && record.StatusDigit == 'BM') {                        
                        status = 'TM'
                    } 

                    return (<Tooltip placement={tooltip_placement} title={record.Status}><span style={{ minWidth: '24px', maxWidth: '24px' }}>{status}</span></Tooltip>)
                }
            },
            {
                title: 'Date',
                dataIndex: 'StatusDate',
                className: `warningcol_9 ttu tracked tc ${cls['letter_spece']} pointer`,
                width: standardDateFix,
                sorter: (a, b) => compareByDate(a.StatusDate, b.StatusDate),  
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_date, record) => {                    
                    return (str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date).format('DD/MM/YY') : null //setStatusDate(str_date, record)
                }
            },
            {
                title: (<span>AMT <Popover content={amount_onhand_content}><i className="fa fa-info-circle white"></i></Popover></span>),
                dataIndex: 'Limit',
                className: 'warningcol_10 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Limit, b.Limit),               
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_10').find('.ant-table-column-sorter > span')
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
        className: `warningcol_11 ttu tracked tc ${cls['letter_spece']} pointer`,
        width: standardDateFix,
        sorter: (a, b) => compareByDate(a.SetupDate, b.SetupDate),  
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.warningcol_11').find('.ant-table-column-sorter > span')
                    headAutoSort(element)                    
                }
            }
        }, 
        render: (str_date, rowData) => {
            let setup_date = (!_.isEmpty(rowData.SetupDate) && rowData.SetupDate !== '1900-01-01T00:00:00.000Z') ? rowData.SetupDate : null
            let start_month = 0
            let current_date = moment()
            
            if(!_.isEmpty(setup_date)) {
                let setup_moment = moment(setup_date)
                start_month = moment([current_date.format('YYYY'), current_date.format('MM'), current_date.format('DD')]).diff(moment([setup_moment.format('YYYY'), setup_moment.format('MM'), setup_moment.format('DD')]), 'months', true)
            }

            let setup_data = (str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null
            return (<Tooltip placement="right" title={`${(start_month && start_month > 0) ? roundFixed(start_month, 0) : 0} months ago`}>{setup_data}</Tooltip>)

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
                className: 'warningcol_12 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Principle, b.Principle),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_12').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt, rowData) => {
                    const content = (
                        <div style={{ fontSize: '1em' }}>
                            <div>
                                <b>O/S START: </b>  
                                {` ${(rowData && rowData.PrincipleStart) ? numberWithCommas(roundFixed(rowData.PrincipleStart, 0)) : 0}`}
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
                className: `warningcol_13 ttu tracked tc ${cls['letter_spece']} pointer`,                
                width: 30,
                sorter: (a, b) => compareByAlph(a.IsTopup, b.IsTopup),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_13').find('.ant-table-column-sorter > span')
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
                dataIndex: 'WkCycleDueNo',
                className: 'warningcol_14 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.WkCycleDueNo, b.WkCycleDueNo),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_14').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: 'Day',
                dataIndex: 'WkCycleDue',
                className: 'warningcol_15 ttu tracked tc pointer',
                sorter: (a, b) => compareByAlph(a.WkCycleDue, b.WkCycleDue),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_15').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: (<Tooltip title="Yesterday Priority">P</Tooltip>),
                dataIndex: 'Yesterday_Priority',
                className: 'warningcol_16 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Yesterday_Priority, b.Yesterday_Priority),
                width: 25,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_16').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: 'WK',
                dataIndex: 'Week_Installment',
                className: 'warningcol_17 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Week_Installment, b.Week_Installment),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_17').find('.ant-table-column-sorter > span')
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
                className: 'warningcol_18 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) => compareByAmount(a.Mth_Installment, b.Mth_Installment),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_18').find('.ant-table-column-sorter > span')
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
                className: 'warningcol_19 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Cust_DPDBucketStartSeq, b.Cust_DPDBucketStartSeq),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_19').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }
            },
            {
                title: 'Now',
                dataIndex: 'Cust_DPDBucketNow',
                className: 'warningcol_20 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Cust_DPDBucketNowSeq, b.Cust_DPDBucketNowSeq),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_20').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (bucket, rowData) => {
                    let overdue_day = (rowData.OverdueDay) ? rowData.OverdueDay : 0
                    let current_point = (rowData.Cust_DPDBucketNow && in_array(rowData.Cust_DPDBucketNow, ['XDay', 'M1-2', 'NPL'])) ? 'MDPD': 'WDPD'

                    let text_bucket = ''
                    if(current_point == 'WDPD') {
                        if(overdue_day == 0)
                            text_bucket = '0 WDPD'
                        else if(overdue_day > 0 && overdue_day <= 7)
                            text_bucket = '1-7 WDPD'
                        else if(overdue_day > 8 && overdue_day <= 14)
                            text_bucket = '8-14 WDPD'
                        else if(overdue_day >= 15 && overdue_day <= 21)
                            text_bucket = '15-21 WDPD'
                        else if(overdue_day >= 22 && overdue_day <= 30)
                            text_bucket = '22-30 WDPD'
                    } else {
                        if(overdue_day > 1 && overdue_day <= 30)
                            text_bucket = '1-30 MDPD'
                        else if(overdue_day >= 31 && overdue_day <= 60)
                            text_bucket = '31-60 MDPD'
                        else if(overdue_day >= 61 && overdue_day <= 90)
                            text_bucket = '61-90 MDPD'
                        else if(overdue_day > 90)
                            text_bucket = '90+ MDPD'
                    }
                    return (<Tooltip placement="right" title={`${text_bucket}`}>{bucket}</Tooltip>)
                }
            },
            {
                title: (<Tooltip title="Today Priority">P</Tooltip>),
                dataIndex: 'Priority',
                className: 'warningcol_21 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.Priority, b.Priority),
                width: 25,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_21').find('.ant-table-column-sorter > span')
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
                title: (<Tooltip title="Overdue Day"><Icon type="dashboard" /></Tooltip>),
                dataIndex: 'OverdueDay',
                className: 'warningcol_22 ttu tracked tc pointer',
                sorter: (a, b) => compareByAmount(a.OverdueDay, b.OverdueDay),
                width: standardWidth,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_20').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                },
                render: (days, rowData) => {
                    let current_point = (rowData.Cust_DPDBucketNow && in_array(rowData.Cust_DPDBucketNow, ['XDay', 'M1-2', 'NPL'])) ? 'MDPD': 'WDPD'
                    let current_dpd = (current_point == 'WDPD') ? rowData.WDPD : rowData.MDPD
                    return (<Tooltip placement="right" title={`${current_dpd} ${current_point}`}>{days}</Tooltip>)
                }
            },       
            {
                title: 'Amt',
                dataIndex: 'OverdueAmt',
                className: 'warningcol_23 ttu tracked tr pointer',
                width: standardNumberFix,
                sorter: (a, b) =>  compareByAmount(a.OverdueAmt, b.OverdueAmt),
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_21').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                render: (str_amt) => {
                    return (str_amt) ? numberWithCommas(str_amt) : 0
                }
            },
            {
                title: (<Tooltip title="MPD = ชำระเงินเพื่อให้หลุดจาก XDay"><span>MPD</span></Tooltip>),
                dataIndex: 'Mth_AmtPastDue',
                className: 'warningcol_24 ttu tracked tr pointer',
                sorter: (a, b) => compareByAmount(a.Mth_AmtPastDue, b.Mth_AmtPastDue),   
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_24').find('.ant-table-column-sorter > span')
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
                className: 'warningcol_25 ttu tracked tr pointer',
                sorter: (a, b) => compareByDate(a.LastPaymentDate, b.LastPaymentDate),   
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_25').find('.ant-table-column-sorter > span')
                            headAutoSort(element)                    
                        }
                    }
                }, 
                width: 65,
                render: (str_date, record) => {                    
                    let str_amt = (record && record.LastPaymentAmt) ? numberWithCommas(record.LastPaymentAmt) : 0
                    return (<Tooltip placement={tooltip_placement} title={`ชำระล่าสุด ${str_amt}`}>{(str_date && str_date !== '1900-01-01T00:00:00.000Z') ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null}</Tooltip>)
                }
            },
            {
                title: (<div className="tc">Note</div>),
                dataIndex: 'Cause',
                className: `warningcol_26 ${cls['cause_name']} ttu tracked tl pointer`,
                sorter: (a, b) => compareByAlph(a.Cause, b.Cause),   
                width: 80,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.warningcol_26').find('.ant-table-column-sorter > span')
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
