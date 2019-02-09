import React, { Component } from 'react'
import { Row, Col, Icon, Card, Progress, Popover  } from 'antd'
import _ from 'lodash'
import { in_array, roundFixed, numValid, parseNumberShort, isNodeList, parseBool } from '../../../containers/Layouts/function'

import cls from '../styles/scss/summary_layout.scss'
import options from '../../../utilities/_general.scss'

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
        /*
        let app_list = []
        let can_list = []
        let rej_list = []

        const total_market = (market_data && market_data.MarketShop) ? market_data.MarketShop:0
        const total_notpot = document.querySelectorAll(`td[data-prospect-status="NO"]`).length

        const el_status_app = document.querySelectorAll('td[data-status="A"]')
        const el_status_can = document.querySelectorAll('td[data-status="C"]')
        const el_status_rej = document.querySelectorAll('td[data-status="R"]')

        const el_divide_app = document.querySelectorAll(`div.countable[data-status="A"]`)
        const el_divide_can = document.querySelectorAll(`div.countable[data-status="C"]`)
        const el_divide_rej = document.querySelectorAll(`div.countable[data-status="R"]`)

        // Summary Market Panetrate
        let total_cust_penetrate = _.sum([el_status_app.length, el_status_can.length, el_status_rej.length, el_divide_app.length, el_divide_can.length, el_divide_rej.length])
        let cust_penetrate = (numValid(total_cust_penetrate) / total_market) * 100
        
        // Summary Potential
        let total_pot_penetrate = (total_market - total_cust_penetrate)
        let potential_penetrate = (numValid(total_pot_penetrate) / total_market) * 100

        total_pot_penetrate
        (potential_penetrate && potential_penetrate > 0) ? roundFixed(potential_penetrate, 0) : 0
        */
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
        /*
        const { localStorageRead } = this.props   
        let customer_list = localStorageRead('nanolayout_custmarket', 'customer_list')

        const topup_list = _.filter(customer_list, { IsTopUp: 'A' })
        const topup_success = _.filter(customer_list, { IsTopUp: 'A', StatusDigit: 'A' })

        const total_topup = (topup_list && topup_list.length > 0) ? topup_list.length:0
        const total_succ = (topup_success && topup_success.length > 0) ? topup_success.length:0

        let avg_percent_succ = (numValid(total_succ) / total_topup) * 100
        let total_succ_amount = _.sumBy(topup_success, function(o) { return o.Limit; })

        return (
            <div className={cls['market_topup_container']} key={(index + 1)}>
                <div className={cls['market_topup_header']}> 
                    <div>Eligible Top-up Loan</div>
                    <div>{ total_topup }</div>
                </div>            
                <div className={cls['market_topup_content']}>  
                    <div className={`${cls['market_content_block']} ${cls['topup']}`}>{`${parseNumberShort(numValid(total_succ_amount))}`}</div>
                    <div className={`${cls['divine']} ${cls['topup']}`} />
                    <div className={`${cls['market_content_block']} ${cls['topup']}`}>{total_succ}</div>
                    <div className={`${cls['divine']} ${cls['topup']}`} />
                    <div className={`${cls['market_content_block']} ${cls['topup']}`}>{`${(avg_percent_succ && avg_percent_succ > 0) ? roundFixed(avg_percent_succ, 0):0}%`}</div>
                </div>
            </div>
        )
        */
        return null
    } 

    // UPDATE PROGRESS OF ASSIGNMENT COMPLETED
    createProgressCompleted = (index) => {
        const { mktCustomer } = this.props
        const customer_list = (mktCustomer && mktCustomer.length > 0) ? mktCustomer : []
  
        const cust_active = _.filter(customer_list, { IsActive: 'Y' })

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
        const el_status = document.querySelectorAll(`td[data-status="${data}"]`).length
        const el_divide = document.querySelectorAll(`div.countable[data-status="${data}"]`).length

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
               this.props.dataItems !== nextProps.dataItems
    }

    render() {
        const { visible, dataItems, configData } = this.props

        return (
            <Row className={`${(visible) ? cls['dn']:cls['db']}`}>
                <Col span={24}>
                    { (!visible) && _.map([0], this.createMarketPenetrate) }
                </Col>
                <Col span={24}>
                    { (!visible) && _.map([0], this.createEligibleTopUp)}
                </Col>
                <Col span={24}>
                    <header className={`${cls['summary_header']}`}>
                        <div className={`${cls['block_header']} ttu`}>Assignment Completion</div>
                    </header>
                    <div className={`${cls['app_box']} mb1`}>    
                        { (!visible) && _.map([0], this.createProgressCompleted)}
                    </div>
                    <div className={`${cls['app_box']}`}>                        
                        <Card title="Prospected Customer" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (!visible) && _.map(['YES', 'NO'], this.createAppPotentialList) }
                            </div>
                        </Card>
                        <Card title="Application On-hand" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (!visible) && _.map(configData.onhandInfo.status_digit, this.createAppSummaryOnhandList) }
                            </div>
                        </Card>
                        <Card title="Final Decision" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (!visible) && _.map(['A', 'C', 'R', 'E'], this.createAppSummaryDecisionList) }
                            </div>
                        </Card>
                      
                        <Card title="Payment Bucket" className="ttu" style={{ backgroundColor: '#414141' }} bordered={false}>
                            <div className={cls['payment_bucket']}>
                                { (!visible) && _.map(configData.bktFullNotRisks, this.createAppSummaryBucketList) }
                            </div>
                            <div className={`${cls['payment_bucket']} mt2 mb1`}>
                                { (!visible) && _.map(configData.bucketFullRisks, this.createAppSummaryBucketList) }
                            </div>
                        </Card>
                    </div>                        
                </Col>
                <Col span={24}>                    
                    <div className={`${cls['ca_box']}`}>
                        <div className={`${cls['ca_box_widget']}`}>
                            { (!visible) && _.map(dataItems, this.createDataContribution) }
                        </div> 
                    </div>       
                </Col>
            </Row>
        )
    }
    
}

export default Summary