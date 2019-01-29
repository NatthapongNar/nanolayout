import React from 'react'
import moment from 'moment'
import { Icon, Tooltip } from 'antd'
import { Cookies } from 'react-cookie'
import { in_array, compareByAlph, roundFixed, numberWithCommas } from '../../../../containers/Layouts/function'
import { config } from '../../../../containers/GridLayout/config'
import cls from '../../style/grid_market.scss'

import 'moment/locale/en-gb'
import 'moment/locale/th'

const charWidth = 7.5
const standardDateFix = 75
const standardWidth = 50
const standardWidthFix = 55
const standardWidthBucketFix = 85
const standardNumberFix = 95
const standardBranchFix = 120
const tooltip_placement = 'right'

const fontIcon = { fontSize: '1em' }
const iconRedColor = { color: '#ff6158' }
const iconGreenColor = { color: '#5cab6f' }

export const customer_columns = [
    {
        title: 'App Date',
        dataIndex: 'AppInDate',
        className: `mktcol_1 ttu tracked tc ${cls['letter_spece']}`,
        width: standardDateFix,
        //sorter: (a, b) => compareByAlph(a.AppInDate, b.AppInDate),
        render: (str_date) => { 
            return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY'):null 
        }
    }, 
    { 
        title: (<Tooltip placement={tooltip_placement} title="เพิ่มข้อมูลลูกค้าลงในพื้นที่ตลาด(เลย์เอาท์)"><Icon type="check-square-o" style={{ fontSize: 16, cursor: 'pointer' }} /></Tooltip>),
        dataIndex: 'ShopAssign',
        className: 'mktcol_2 ttu tracked tc',
        width: 40,
        //sorter: (a, b) => compareByAlph(a.ShopAssign, b.ShopAssign),
        render: (strText) => {
            if(strText == 'Y') 
                return (<Icon type="check-circle" className="green" style={{ ...fontIcon }} />)
            else 
                return (<Icon type="close-circle" className="red" style={{ ...fontIcon }} />)
        }
    },
    {
        title: 'Customer Information',
        dataIndex: 'CustomerCharecter',
        className: 'ttu tracked',   
        children:[
            {
                title: 'Customer Name',
                dataIndex: 'AccountName',
                className: `mktcol_3 ${cls['colnowrap']} ${cls['twice']} ttu tracked`,
                width: 180,
                //sorter: (a, b) => compareByAlph(a.AccountName, b.AccountName),
                render: (strText, record) => { 
                    let AliasName = (record.LoanerAliasName) ? `(${keywordMatch(record.LoanerAliasName)})`:''
                    let ApplicationNo = (record.ApplicationNo) ? `${record.ApplicationNo}`:null
                    return (<Tooltip placement={tooltip_placement} title={`${ApplicationNo} ${AliasName}`}>{`${strText}`}</Tooltip>)
                }
            }, 
            {
                title: 'Business Type',
                dataIndex: 'BusinessTypeApp',
                className: `mktcol_4 ${cls['brnF_ellipsis']} ttu tracked`,
                //sorter: (a, b) => compareByAlph(a.BusinessTypeApp, b.BusinessTypeApp),
                render: (text) => {
                    let calStr = (text && text.length > 0) ? (charWidth * text.length) : 0
                    if(calStr >= 135) {
                        return (<Tooltip placement={tooltip_placement} title={text}>{text}</Tooltip>)
                    } else {
                        return text
                    }            
                }
            }
        ]
    },  
    {
        title: 'Market',
        dataIndex: 'MarketCode',
        className: 'mktcol_5 ttu tracked tc',
        width: standardWidth,
        render: (str, data) => {
            var market = (str) ? str.replace('M', ''):''
            return (<Tooltip placement={tooltip_placement} title={data.MarketName}>{market}</Tooltip>)
        }
    },    
    {
        title: 'Type',
        dataIndex: 'BusinessCharecter',
        className: 'ttu tracked',
        widht: 90,        
        children:[  
            {
                title: 'BR',
                dataIndex: 'BranchCode',
                className: 'mktcol_6 ttu tracked tc',
                //sorter: (a, b) => compareByAlph(a.DPDBucketComplete, b.DPDBucketComplete),   
                width: standardWidth,
                render: (str, data) => {
                    return (<Tooltip placement={tooltip_placement} title={`${(data && data.BranchName) ? data.BranchName:''}`}>{str}</Tooltip>)
                }
            },            
            {
                title: 'PD',
                dataIndex: 'Product',
                className: 'mktcol_7 ttu tracked tc',
                width: standardWidth,
                //sorter: (a, b) => compareByAlph(a.Product, b.Product),
                render: (strText) => {
                    let strProduct = (strText) ? strText.substring(0, 1):null
                    return (in_array(strProduct, ['N', 'M'])) ? `${(strProduct == 'N') ? 'NN':'MF'}` : null
                }                
            }                    
        ]
    },  
    {
        title: (<span>Status Information <Tooltip placement={tooltip_placement} title="(CA/FC/TM/ZM/OP/A/R/C)"><i className="fa fa-search blue"></i></Tooltip></span>),
        dataIndex: 'StatusLayout',
        className: 'ttu tracked ',         
        children: [
            {
                title: 'CA Name',
                dataIndex: 'CAName',
                className: `mktcol_8 ttu tracked ${cls['name_ellipsis']}`,
                //sorter: (a, b) => compareByAlph(a.CAName, b.CAName),
                width: 80,
                render: (strText, record) => {           
                    return (<Tooltip placement={tooltip_placement} title={strText}>{strText}</Tooltip>)
                }
            },
            {
                title: 'ST',
                dataIndex: 'StatusDigit',
                className: 'mktcol_9 ttu tracked tc',
                //sorter: (a, b) => compareByAlph(a.StatusDigit, b.StatusDigit),   
                widht: 70,
                render: (strText, record) => { 
                    let onhand = (record.OnhandStatus) ? record.OnhandStatus: null
                    let status = (strText) ? strText:onhand
                    return (<Tooltip placement={tooltip_placement} title={record.Status}>{status}</Tooltip>)
                }
            },
            {
                title: 'Date',
                dataIndex: 'StatusDate',
                className: `mktcol_10 ttu tracked tc ${cls['letter_spece']}`,
                width: standardDateFix,
                //sorter: (a, b) => compareByAlph(a.StatusDate, b.StatusDate),   
                render: (str_date, record) => { 
                    return setStatusDate(str_date, record)
                }
            },
            {
                title: 'AMT',
                dataIndex: 'TotalLimit',
                className: 'mktcol_11 ttu tracked tr',
                width: standardNumberFix,
                //sorter: (a, b) => {
                //     let col_a = (a.TotalLimit) ? roundFixed(a.TotalLimit, 0) : 0
                //     let col_b = (b.TotalLimit) ? roundFixed(b.TotalLimit, 0) : 0
                //     return compareByAlph(col_a, col_b)
                // }, 
                render: (str_amt) => { 
                    return (str_amt) ? numberWithCommas(roundFixed(str_amt, 0)):0
                }
            }
        ]
    },
    {
        title: 'Loan Setup',
        dataIndex: 'LoanSetup',
        className: 'ttu tracked',
        children: [
            {
                title: 'Date',
                dataIndex: 'SetupDate',
                className: `mktcol_12 ttu tracked tc ${cls['letter_spece']}`,
                width: standardDateFix,
                //sorter: (a, b) => compareByAlph(a.SetupDate, b.SetupDate),   
                render: (str_date) => { 
                    return (str_date && str_date !== '') ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : '' 
                }
            },
            {
                title: 'O/S Bal.',
                dataIndex: 'Principle',
                className: 'mktcol_13 ttu tracked tr',
                width: standardNumberFix,
                //sorter: (a, b) => {
                //     let col_a = (a.Principle) ? roundFixed(a.Principle, 0) : 0
                //     let col_b = (b.Principle) ? roundFixed(b.Principle, 0) : 0
                //     return compareByAlph(col_a, col_b)
                // },
                render: (str_amt) => { 
                    return (str_amt) ? numberWithCommas(roundFixed(str_amt, 0)):0
                }
            }
        ]
    },
    {
        title: 'Top-up Loan',
        dataIndex: 'Topup',
        className: 'ttu tracked',
        children: [
            {
                title: 'Date',
                dataIndex: 'TopupDate',
                className: `mktcol_14 ttu tracked tc ${cls['letter_spece']}`,
                width: standardDateFix,
                //sorter: (a, b) => compareByAlph(a.TopupDate, b.TopupDate),   
                render: (str_date) => { 
                    return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY'):null 
                }
            },
            {
                title: 'Amt',
                dataIndex: 'TopupAmount',
                className: 'mktcol_15 ttu tracked tr',
                width: standardNumberFix,
                //sorter: (a, b) => {
                //     let col_a = (a.TopupAmount) ? roundFixed(a.TopupAmount, 0) : 0
                //     let col_b = (b.TopupAmount) ? roundFixed(b.TopupAmount, 0) : 0
                //     return compareByAlph(col_a, col_b)
                // },
                render: (str_amt) => { 
                    return (str_amt && str_amt !== '-') ? numberWithCommas(roundFixed(str_amt, 0)):0
                }
            }
        ]
    },
   


    {
        title: 'Wk_Cycle',
        dataIndex: 'WkCycle',
        className: 'ttu tracked',
        children: [
            {
                title: 'Due',
                dataIndex: 'WkCycleDue',
                className: 'mktcol_16 ttu tracked tc',
                //sorter: (a, b) => compareByAlph(a.WkCycleDue, b.WkCycleDue),   
                width: standardWidth
            },
            {
                title: 'Amt',
                dataIndex: 'Week_Installment',
                className: 'mktcol_17 ttu tracked tr',
                width: standardNumberFix,
                //sorter: (a, b) => {
                //     let col_a = (a.OverdueAmt) ? roundFixed(a.OverdueAmt, 0) : 0
                //     let col_b = (b.OverdueAmt) ? roundFixed(b.OverdueAmt, 0) : 0
                //     return compareByAlph(col_a, col_b)
                // },
                render: (str_amt) => { 
                    return (str_amt) ? numberWithCommas(str_amt):0
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
                title: 'DPD',
                dataIndex: 'DPDBucketComplete',
                className: 'mktcol_18 ttu tracked tc',
                //sorter: (a, b) => compareByAlph(a.DPDBucketComplete, b.DPDBucketComplete),   
                width: standardWidth
            },
            {
                title: 'Amt',
                dataIndex: 'OverdueAmt',
                className: 'mktcol_19 ttu tracked tr',
                width: standardNumberFix,
                //sorter: (a, b) => {
                //     let col_a = (a.OverdueAmt) ? roundFixed(a.OverdueAmt, 0) : 0
                //     let col_b = (b.OverdueAmt) ? roundFixed(b.OverdueAmt, 0) : 0
                //     return compareByAlph(col_a, col_b)
                // },
                render: (str_amt) => { 
                    return (str_amt) ? numberWithCommas(str_amt):0
                }
            },
            {
                title: 'Mini',
                dataIndex: 'MinimumPayment',
                className: 'mktcol_20 ttu tracked tr',
                //sorter: (a, b) => compareByAlph(a.DPDBucketComplete, b.DPDBucketComplete),   
                width: standardNumberFix,
                render: (str_amt) => { 
                    return (str_amt) ? numberWithCommas(str_amt):0
                }
            },
            {
                title: 'Last pmt',
                dataIndex: 'LastPaymentDate',
                className: 'mktcol_21 ttu tracked tc',
                //sorter: (a, b) => compareByAlph(a.DPDBucketComplete, b.DPDBucketComplete),   
                width: 65,
                render: (str_date) => { 
                    return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY'):null 
                }
            }
        ]
    }    
]

const keywordMatch = (strText) => {
    const keyword_text = ['พี่', 'พี', 'เจ๊', 'คุณ', 'ป้า', 'ลุง']
    let master_pattern = new RegExp(keyword_text.join('|'))    

    if(strText && !master_pattern.test(strText)) return `พี่${strText}`
    else return (strText && strText !== '') ? strText:''
}

const setStatusDate = (strText, record) => {
    const status = (record.Status) ? record.Status:null
    const statusDigit = (record.StatusDigit) ? record.StatusDigit:null
    const principle = (record.Principle) ? record.Principle:null
    const acc_close = (principle && principle > 0) ? 'N':'Y'

    let str_date = null
    let str_state = null
    if(status == 'Approved' && acc_close == 'Y') {
        str_date = record.StatusDate
        str_state = 'Close account'
        
    } else {
        if(in_array(statusDigit, ['A'])) {
            str_date = record.StatusDate
            
        } else if(in_array(statusDigit, ['C', 'R'])) {
            str_date = strText
        }
    }
    return (str_date) ? moment(str_date, 'YYYY-MM-DD').format('DD/MM/YY') : null 
}

const adjuctTooltip = (strText, cellWidth) => {
    if(strText) {
        let charSize = charWidth * strText.length
        return (charSize > cellWidth) ? (<Tooltip placement={tooltip_placement} title={strText}>{strText}</Tooltip>):strText
    } else {
        return strText
    }
}