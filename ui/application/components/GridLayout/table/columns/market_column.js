import React from 'react'
import moment from 'moment'
import { Row, Col, Tooltip, Popover, Avatar } from 'antd'
import { in_array, roundFixed, handleMobilePattern, compareByAlph, compareByAmount, compareByDate, numberWithCommas } from '../../../../containers/Layouts/function'
import cls from '../../style/grid_market.scss'

import 'moment/locale/en-gb'
import 'moment/locale/th'

const charWidth = 7.5
const standardDateFix = 75
const standardWidthFix = 55
const standardWidthBucketFix = 85
const standardBranchFix = 120
const tooltip_placement = 'right'

let recent_columns = null
let recent_sort = null

export const columns = [
    {
        title: 'Register',
        dataIndex: 'TelsCreateDate',
        className: `mktcol_1 ttu tracked tc ${cls['letter_spece']} pointer`,
        width: standardDateFix,
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.mktcol_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByDate(a.TelsCreateDate, b.TelsCreateDate),
        render: (str_date) => {
            return (str_date) ? moment(str_date).format('DD/MM/YYYY') : null
        }
    },
    {
        title: 'Market Name',
        dataIndex: 'MarketName',
        className: `mktcol_2 ${cls['colnowrap']} ttu tracked pointer`,
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.mktcol_2').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.MarketName, b.MarketName),
        render: (text) => <Tooltip placement={tooltip_placement} title={text}>{text}</Tooltip>
    },
    {
        title: 'Market Panetrate',
        dataIndex: 'MarketPanetrate',
        className: 'ttu tracked',
        children: [
            {
                title: 'Shop',
                dataIndex: 'MarketShop',
                className: 'mktcol_3 ttu tracked tr pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_3').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.MarketShop, b.MarketShop)
            },
            {
                title: 'POT',
                dataIndex: 'TotalPotentialPercent',
                className: 'mktcol_4 ttu tracked tr pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_4').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.TotalPotentialPercent, b.TotalPotentialPercent),
                render: (str_per) => {
                    return (str_per) ? `${roundFixed(str_per, 0)}%` : `0%`
                }
            },
            {
                title: '%MF',
                dataIndex: 'MF_Percent',
                className: 'mktcol_5 ttu tracked tr pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_5').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.MF_Percent, b.MF_Percent),
                render: (str_per) => {
                    return (str_per) ? `${roundFixed(str_per, 0)}%` : `0%`
                }
            }
        ]
    },
    {
        title: 'Market Layout',
        dataIndex: 'MarketLayout',
        className: 'ttu tracked',
        children: [
            {
                title: 'SUCC',
                dataIndex: 'TotalAssignedPercent',
                className: 'mktcol_6 ttu tracked tr pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_6').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.TotalAssignedPercent, b.TotalAssignedPercent),
                render: (str_per, rowData) => {
                    let width = (str_per) ? roundFixed(str_per, 0) : 0
                    
                    let total_acc = (rowData && rowData.Total_Cust > 0) ? rowData.Total_Cust : 0
                    let total_ass = (rowData && rowData.TotalAssigned) ? rowData.TotalAssigned : 0
                    
                    let content   = (
                        <div>
                            <div>Total Customer: {total_acc}</div>
                            <div>Total Assignmented: {total_ass}</div>
                        </div>
                    )

                    if (width > 100) width = 100

                    return (
                        <Popover placement="right" content={content} className="ttu">
                            <div className={cls['sucess_progress_container']}>
                                <div data-width={width} className={cls['sucess_progress']} style={{ width: `${width}%` }}>&nbsp;</div>
                                <div className={cls['sucess_progress_text']}>{`${width}%`}</div>
                            </div>
                        </Popover>
                    )
                }
            },
            {
                title: 'Recent',
                dataIndex: 'RecentDate',
                className: `mktcol_7 ttu tracked tc ${cls['letter_spece']} pointer`,
                width: standardDateFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_7').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByDate(a.RecentDate, b.RecentDate),
                render: (str_date) => {
                    return (str_date) ? moment(str_date).format('DD/MM/YYYY') : null
                }
            }
        ]
    },
    {
        title: 'O/S Balance',
        dataIndex: 'OSBalance',
        className: 'ttu tracked',
        children: [
            {
                title: 'CUST',
                dataIndex: 'OS_Unit',
                className: 'mktcol_8 ttu tracked tc pointer',
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_8').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.OS_Unit, b.OS_Unit),
                width: standardWidthFix
            },
            {
                title: 'Vol',
                dataIndex: 'OS_Vol_FullAmt',
                className: 'mktcol_9 ttu tracked tr pointer',
                width: 90,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_9').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.OS_Vol_FullAmt, b.OS_Vol_FullAmt),
                render: (vol) => {
                    return (vol && vol > 0) ? numberWithCommas(roundFixed(vol, 0)) : 0
                }
            }
        ]
    },
    {
        title: 'Quality',
        dataIndex: 'Quality',
        className: 'ttu tracked',
        children: [
            {
                title: 'W0',
                dataIndex: 'TotalPercent_W0',
                className: 'mktcol_10 ttu tracked tr pointer',
                width: standardWidthBucketFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_10').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.TotalPercent_W0, b.TotalPercent_W0),
                render: (str_per) => {
                    return (str_per) ? `${roundFixed(str_per, 2)}%` : `0.00%`
                }
            },
            {
                title: 'NPL',
                dataIndex: 'TotalPercent_NPL',
                className: 'mktcol_11 ttu tracked tr pointer',
                width: standardWidthBucketFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_11').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.TotalPercent_NPL, b.TotalPercent_NPL),
                render: (str_per) => {
                    return (str_per) ? `${roundFixed(str_per, 2)}%` : `0.00%`
                }
            },
            {
                title: (<i className="fa fa-pie-chart" aria-hidden="true"></i>),
                dataIndex: 'BucketChart',
                className: 'mktcol_12 ttu tracked tc pointer',
                width: 10,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_12').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.BucketChart, b.BucketChart)
            }
        ]
    },
    {
        title: 'Top-Up Eligible',
        dataIndex: 'TopUp',
        className: 'ttu tracked',
        children: [
            {
                title: 'Total',
                dataIndex: 'OS_TotalTopupApp',
                className: 'mktcol_13 ttu tracked tc pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_13').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.OS_TotalTopupApp, b.OS_TotalTopupApp)
            },
            {
                title: 'Succ',
                dataIndex: 'OS_TopupPercent_Succ',
                className: 'mktcol_14 ttu tracked tr pointer',
                width: standardWidthFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_14').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAmount(a.OS_TopupPercent_Succ, b.OS_TopupPercent_Succ),
                render: (str_per) => {
                    return (str_per) ? `${roundFixed(str_per, 0)}%` : `0%`
                }
            }
        ]
    },
    {
        title: 'Branch Info',
        dataIndex: 'BranchInfo',
        className: 'ttu tracked',
        children: [
            {
                title: 'Zone',
                dataIndex: 'ZoneText',
                className: 'mktcol_15 ttu tracked tc pointer',
                width: 80,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_15').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAlph(a.ZoneText, b.ZoneText),
                render: (str_zone) => {
                    return (str_zone) ? handleZoneText(str_zone) : null
                }
            },
            {
                title: 'Name',
                dataIndex: 'BranchName',
                className: `mktcol_16 ttu tracked ${cls['brnF_ellipsis']} pointer`,
                width: 140,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_16').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAlph(a.BranchName, b.BranchName),
                render: (str_brn) => {
                    return (str_brn) ? adjuctTooltip(str_brn.replace('Kiosk', '(K)'), standardBranchFix) : null
                }
            },
            {
                title: 'TM',
                dataIndex: 'TMNameTH',
                className: `mktcol_17 ttu tracked ${cls['brn_ellipsis']} pointer`,
                width: standardBranchFix,
                onHeaderCell: () => {
                    return {
                        onClick: () => {
                            let element = $('th.ant-table-column-has-filters.mktcol_17').find('.ant-table-column-sorter > span')
                            headAutoSort(element)         
                        }
                    }
                },
                sorter: (a, b) => compareByAlph(a.TMNameTH, b.TMNameTH),
                render: (str, rowsData) => {
                    let layout = (
                        <div id={`${rowsData.RowID}_${rowsData.TMCode}`} style={{ width: '250px' }}>
                            <Row gutter={10}>
                                <Col span={6}>
                                    <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${rowsData.TMCode}`} shape="square" style={{ width: '55px', height: '55px' }} />
                                </Col>
                                <Col span={18} style={{ fontSize: '1.5em' }}>
                                    <Row gutter={8}>
                                        <Col span={24}>
                                            <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                            <Col span={17}>{`${(rowsData.TMNameTH && !_.isEmpty(rowsData.TMNameTH)) ? rowsData.TMNameTH : ''}`}</Col>
                                        </Col>
                                        <Col span={24}>
                                            <Col span={7} className="ttu">มือถือ</Col>
                                            <Col span={17}>{`${(rowsData.TMMobile && !_.isEmpty(rowsData.TMMobile)) ? `${handleMobilePattern(rowsData.TMMobile)}`:''}`}</Col>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    )
                    return (<Popover placement="top" content={layout}><span onMouseOver={handleProfile.bind(this, `${rowsData.RowID}_${rowsData.TMCode}`)}>{`${str}`}</span></Popover>) 
                }
            }
        ]
    },
    {
        title: 'Tools',
        dataIndex: 'Tools',
        className: 'ttu tracked',
        children: [
            {
                title: (<i className="fa fa-eye" aria-hidden="true"></i>),
                dataIndex: 'Preview',
                className: 'mktcol_18 ttu tracked pointer tc'
            },
            {
                title: (<i className="fa fa-pencil-square-o" aria-hidden="true"></i>),
                dataIndex: 'LayoutTool',
                className: 'mktcol_19 ttu tracked pointer tc'
            },
            {
                title: (<i className="fa fa-user" aria-hidden="true"></i>),
                dataIndex: 'CustGrid',
                className: 'mktcol_20 ttu tracked pointer tc'
            }
        ]
    }
]


const handleProfile = (e) => {
    _.delay(() => {
        let element = $(`#${e}`).parents()
        if(element) {
            $(element[1]).css('background', '#0046B6 ')
        }
    }, 200)
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

const handleZoneText = (zoneText) => {
    if (zoneText) {
        const pattern = new RegExp("-");
        const checkText = pattern.test(zoneText)

        if (checkText) {
            let item = zoneText.split("-")
            let region = item[0].trim()
            let zone = item[1].trim()

            let rechar_region = (region == 'N/E') ? 'I' : region.substring(0, 1)
            let rechar_zone = (zone) ? zone.replace('Zone', 'ZM') : ''

            return `${rechar_region}-${rechar_zone}`

        } else {
            return zoneText
        }
    }
}

const adjuctTooltip = (strText, cellWidth) => {
    if (strText) {
        let charSize = charWidth * strText.length
        return (charSize > cellWidth) ? (<Tooltip placement={tooltip_placement} title={strText}>{strText}</Tooltip>) : strText
    } else {
        return strText
    }
}