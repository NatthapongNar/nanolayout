import React, { Component } from 'react'
import { Row, Col, Icon, Card, Progress, Popover  } from 'antd'
import _ from 'lodash'
import { in_array, roundFixed, parseBool, numValid, parseNumberShort, isNodeList } from '../function'

import cls from './styles/summary_layout.scss'
import options from '../styles/utilities/_general.scss'

class Summary extends Component {

    getApplicationNo = (elements) => {
        let list = []
        if(elements && elements.length > 0) {
            _.forEach(elements, (el) => {
                if(isNodeList(el)) {
                    _.forEach(elements, (v, i) => {
                        list.push(v.getAttribute('data-attr'))
                    })
                } else {
                    list.push(el.getAttribute('data-attr'))
                }
            })
        }
    }

    // CREATE IS MARKET PENETRATE
    createMarketPenetrate = (index) => {
        const { mktProfile } = this.props   
        const market_data = (parseBool(mktProfile.status)) ? mktProfile.data[0] : null

        return (
            <div className={cls['market_container']} key={(index + 1)}>
                <div className={cls['market_header']}> 
                    <div className="ttu">Market Penetrate</div>
                    <div>
                        <span className="ttu">Shop</span>
                        <span>{`${(market_data) ? market_data.MarketShop : 0}`}</span>
                    </div>
                </div>   
                <div className={cls['market_content']}>  
                    <div className={`${cls['market_content_block']} ${cls['penetrate']}`}>{`${(market_data) ? parseNumberShort(market_data.OS_Vol_FullAmt) : 0}`}</div>
                    <div className={`${cls['divine']}`} />
                    <div className={`${cls['market_content_block']} ${cls['penetrate']}`}>{`${(market_data) ? market_data.OS_Unit : 0}`}</div>
                    <div className={`${cls['divine']}`} />
                    <div className={`${cls['market_content_block']} ${cls['penetrate']}`}>{`${(market_data) ? roundFixed(market_data.OS_PotPercent, 0) : 0}%`}</div>
                </div>         
            </div>
        )
    }

    createEligibleTopUp = (index) => {
        return null
    } 

    // UPDATE PROGRESS OF ASSIGNMENT COMPLETED
    createProgressCompleted = (index) => {
        const { mktCustomer } = this.props
        const customer_list = (mktCustomer && mktCustomer.length > 0) ? mktCustomer : []

        const cust_active = customer_list

        const total_cust_active = (cust_active && cust_active.length > 0) ? cust_active.length : 0
        const el_assignment_cpt = document.querySelectorAll(`td[data-reserv="true"]`).length

        let avg_assigncompleted = (el_assignment_cpt / total_cust_active) * 100
        let total_avg = (numValid(avg_assigncompleted)) ? roundFixed(avg_assigncompleted, 0):0

        let progress_status = 'active'
        if(total_avg >= 100) {
            progress_status = 'success'
        }
        
        return (<Progress percent={total_avg} strokeWidth={15} status={`${progress_status}`} showInfo={true} key={(index + 1)} />)
    }

    createAppPotentialList = (data, index) => {
        const potential = (data) ? data:null
        let potential_amt = document.querySelectorAll(`td[data-prospect-status="${data}"]`).length

        return (
            <Col className={`gutter-row ${cls['payment_bucket_items']}`} key={(index + 1)}>
                <div className={`gutter-row ${cls['app-gutter-box']} ${cls['box_prospect']}`}>                                        
                    <div className={`${cls['app-gutter-header']}`}>{potential_amt}</div>
                    <div className={`${cls['app-gutter-footer']}`}>{potential}</div>
                </div>
            </Col>
        )

    }

    createAppSummaryOnhandList = (data, index) => {
        const { mktCustomer } = this.props
        let customer_list = (mktCustomer && mktCustomer.length > 0) ? mktCustomer : []

        if(customer_list && customer_list.length > 0) {            
            const app_onhand_amt = document.querySelectorAll(`td[data-onhand="${data}"]`).length          

            let className = cls['cell_onhand']
            return (
                <Col className={`gutter-row ${cls['payment_bucket_items']}`} key={(index + 1)}>
                    <div className={`${cls['app-gutter-box']} ${className}`}>
                        <div className={`${cls['app-gutter-header']}`}>{app_onhand_amt}</div>
                        <div className={`${cls['app-gutter-footer']}`}>{data}</div>
                    </div>
                </Col>
            )
 
        } else {
            return <Col className="gutter-row" span={6} key={(index + 1)} />
        }

    }


    createAppSummaryDecisionList = (data, index) => {
        const status_full = ['APV', 'CAN', 'REJ', 'END']

        const el_status = $(`td[data-status="${data}"]`).length
        const el_divide = $(`div.countable[data-status="${data}"]`).length

        let className = ''
        switch(data) {
            case 'A':
                className = cls['cell_approved']
                break
            case 'E':
                className = cls['cell_closeacc']
                break
            case 'C':
            case 'R':
                className = cls['cell_reject']
                break
        }

        return (
            <Col className={`gutter-row ${cls['payment_bucket_items']}`} key={(index + 1)}>
                <div className={`${cls['app-gutter-box']} ${className}`}>
                    <div className={`${cls['app-gutter-header']}`}>{`${el_status + el_divide}`}</div>
                    <div className={`${cls['app-gutter-footer']}`}>{`${status_full[index]}`}</div>
                </div>
            </Col>
        )
        
    }

    createAppSummaryPotentialList = (data, index) => {
        const { dataItems } = this.props    
        
        let className = ''
        let app_onhand_amt = 0

        if(data == 'POT') {
            let pot_list = _.filter(dataItems.app_share, { Status: 'POTENTIAL' })
            app_onhand_amt = (pot_list && pot_list[0]) ? pot_list[0].Total:0 
            className = options['bg_emerald']

        }

        return (
            <Col className="gutter-row" span={6} key={(index + 1)}>
                <div className={`${cls['app-gutter-box']} ${className}`}>
                    <div className={`${cls['app-gutter-header']}`}>{app_onhand_amt}</div>
                    <div className={`${cls['app-gutter-footer']}`}>{data}</div>
                </div>
            </Col>
        )

    }

    createAppSummaryBucketList = (data, index) => {
        const { mktCustomer, configData } = this.props
        let customer_list = (mktCustomer && mktCustomer.length > 0) ? mktCustomer : []

        if(customer_list && customer_list.length > 0) {            
            const app_onhand_amt = document.querySelectorAll(`td[data-bucket="${data}"]`).length 

            let className = ''
            if((in_array(data, configData.bktFullNotRisks))) {
                className = cls['cell_approved']
            } else {
                if(data == configData.bucketFullRisks[0]) {
                    className = `${cls['cell_overdue_xday']}`
                } else if(in_array(data, [configData.bucketFullRisks[1], configData.bucketFullRisks[2]])) {
                    className = `${cls['cell_overdue_month']}`
                } else {
                    className = `${cls['cell_overdue']}`
                }
            }

            return (
                <Col className={`gutter-row ${cls['payment_bucket_items']}`} key={(index + 1)}>
                    <div className={`${cls['app-gutter-box']} ${className}`}>
                        <div className={`${cls['app-gutter-header']}`}>{app_onhand_amt}</div>
                        <div className={`${cls['app-gutter-footer']}`}>{data}</div>
                    </div>
                </Col>
            )
             
        } else {
            return <Col className="gutter-row" span={4} key={(index + 1)} />
        }
    }

    createDataContribution = (data, index) => {
        return (
            <a href="#" key={(index+1)}>
                <div className={`${cls['ca_box_img']}`}>
                    <img src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${data.CAID}`} alt="CA" className={cls['img_circle']} />
                </div>
                <div className={`${cls['ca_box_contnet']}`}>
                    <div>
                        <span>{`${data.EmployeeName}`}</span>
                    </div>
                    <div>
                        <span>{`${data.CA_OS_Vol}Kb`}</span>
                        <span>{`${data.CA_OS_Unit}`}</span>
                        <span>{`${roundFixed(data.MktPencentPort, 0)}%`}</span>
                    </div>
                </div>
            </a>
        )
    }

    shouldComponentUpdate(nextProps) {
        return this.props.visible !== nextProps.visible ||
               this.props.mktProfile !== nextProps.mktProfile ||
               this.props.mktCustomer !== nextProps.mktCustomer ||
               this.props.mktLayouts !== nextProps.mktLayouts ||
               this.props.dataItems !== nextProps.dataItems
    }

    render() {
        const { visible, dataItems, configData } = this.props

        return (
            <Row className={`${(visible) ? cls['db']:cls['dn']}`}>
                <Col span={24}>
                    { (visible) && _.map([0], this.createMarketPenetrate) }
                </Col>
                <Col span={24}>
                    { (visible) && _.map([0], this.createEligibleTopUp)}
                </Col>
                <Col span={24}>
                    <header className={`${cls['summary_header']}`}>
                        <div className={`${cls['block_header']} ttu`}>Assignment Completion</div>
                    </header>
                    <div className={`${cls['app_box']} mb1`}>    
                        { (visible) && _.map([0], this.createProgressCompleted)}
                    </div>
                    <div className={`${cls['app_box']}`}>                        
                        <Card title="Prospected Customer" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (visible) && _.map(['YES', 'NO'], this.createAppPotentialList) }
                            </div>
                        </Card>
                        <Card title="Application On-hand" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (visible) && _.map(configData.onhandInfo.status_digit, this.createAppSummaryOnhandList) }
                            </div>
                        </Card>
                        <Card title="Final Decision" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (visible) && _.map(['A', 'C', 'R', 'E'], this.createAppSummaryDecisionList) }
                            </div>
                        </Card>
                      
                        <Card title="Payment Bucket" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (visible) && _.map(configData.bktFullNotRisks, this.createAppSummaryBucketList) }
                            </div>
                            <div className={`${cls['payment_bucket']} mt2 mb1`}>
                                { (visible) && _.map(configData.bucketFullRisks, this.createAppSummaryBucketList) }
                            </div>
                        </Card>
                    </div>                        
                </Col>
                <Col span={24}>                    
                    <div className={`${cls['ca_box']}`}>
                        <div className={`${cls['ca_box_widget']}`}>
                            { (visible) && _.map(dataItems, this.createDataContribution) }
                        </div> 
                    </div>       
                </Col>
            </Row>
        )
    }
    
}

export default Summary