import React from 'react'
import { Row, Col, Popover, Avatar, Icon } from 'antd'
import { in_array, handleMobilePattern, compareByAlph, compareByAmount } from '../../../containers/Layouts/function'

export const assign_columns = [
    {
        title: 'CIF',
        dataIndex: 'CIFNO',
        key: 'CIFNO',
        className: "assigncol_1 tc ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_1').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAmount(a.CIFNO, b.CIFNO),
        width: '8%'
    },
    {
        title: 'ID CARD',
        dataIndex: 'CitizenID',
        key: 'CitizenID',
        className: "assigncol_2 tc ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_2').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAmount(a.CitizenID, b.CitizenID),
        width: '12%'
    },
    {
        title: 'App No',
        dataIndex: 'ApplicationNo',
        key: 'ApplicationNo',
        className: "assigncol_3 tc ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_3').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.ApplicationNo, b.ApplicationNo),
        width: '15%'
    },
    {
        title: 'Customer',
        dataIndex: 'AccountName',
        key: 'AccountName',
        className: "assigncol_4 ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_4').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.AccountName, b.AccountName),
        width: '15%'
    },
    {
        title: 'Shop Name',
        dataIndex: 'ShopName',
        key: 'ShopName',
        width: '15%',
        className: "assigncol_5 ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_5').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.ShopName, b.ShopName),
        render: (text) => {
            return (<span title={text}>{text}</span>)
        }
    },
    {
        title: 'Product',
        dataIndex: 'BusinessTypeApp',
        key: 'BusinessTypeApp',
        className: "assigncol_6 ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_6').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.BusinessTypeApp, b.BusinessTypeApp),
        width: '15%',
        render: (text) => {
            return (<span title={text}>{text}</span>)
        }
    },
    {
        title: 'Status',
        dataIndex: 'StatusDigit',
        key: 'StatusDigit',
        className: 'assigncol_7 tc ttu pointer',
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_7').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.StatusDigit, b.StatusDigit),
        width: '5%'        
    },
    {
        title: 'CA Name',
        dataIndex: 'CAName',
        key: 'CAName',
        className: "assigncol_8 ttu pointer",
        onHeaderCell: () => {
            return {
                onClick: () => {
                    let element = $('th.ant-table-column-has-filters.assigncol_8').find('.ant-table-column-sorter > span')
                    headAutoSort(element)         
                }
            }
        },
        sorter: (a, b) => compareByAlph(a.CAName, b.CAName),
        width: '12%',
        render: (str, rowsData) => {
            let layout = (
                <div id={`${rowsData.RowID}_${rowsData.CAID}`} style={{ width: '250px' }}>
                    <Row gutter={10}>
                        <Col span={6}>
                            <Avatar src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${rowsData.CAID}`} shape="square" style={{ width: '55px', height: '55px' }} />
                        </Col>
                        <Col span={18} style={{ fontSize: '1.5em' }}>
                            <Row gutter={8}>
                                <Col span={24}>
                                    <Col span={7} className="ttu">ชื่อ-นามสกุล</Col>
                                    <Col span={17}>{`${rowsData.CAName}`}</Col>
                                </Col>
                                <Col span={24}>
                                    <Col span={7} className="ttu">มือถือ</Col>
                                    <Col span={17}>{`${(rowsData.CAMobile && !_.isEmpty(rowsData.CAMobile)) ? `${handleMobilePattern(rowsData.CAMobile)}`:''}`}</Col>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            )
            return (<Popover placement="top" content={layout}><span onMouseOver={handleProfile.bind(this, `${rowsData.RowID}_${rowsData.CAID}`)}>{`${str}`}</span></Popover>) 
        }
    },
    {
        title: <Icon type="user" className="pointer" />,
        dataIndex: 'Tools',
        key: 'Tools',
        width: '3%',
        className: "tc ttu"
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
