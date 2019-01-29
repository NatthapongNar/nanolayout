import React, { Component } from 'react'
import { Row, Col, Icon, Card, Avatar } from 'antd'
import { Sparklines, SparklinesBars } from 'react-sparklines'
import _ from 'lodash'
import { in_array, roundFixed, createElement } from '../../../containers/Layouts/function'

import cls from '../styles/scss/summary.scss'
import options from '../../../utilities/_general.scss'

class SummaryReport extends Component {

    gaugeAssignmentCompleted = () => {
        const { visible, summaryData, configData, localStorageRead } = this.props

        if (visible) {
            const customer_list = localStorageRead('nanolayout_custmarket', 'customer_list')
            let result = _.filter(customer_list, function (data) { return data.CustStatus == "After" && data.IsActive == 'Y' })

            const el_status_app = document.querySelectorAll('td[data-status="A"]').length
            const el_status_can = document.querySelectorAll('td[data-status="C"]').length
            const el_status_rej = document.querySelectorAll('td[data-status="R"]').length

            const app_onhand_ca = document.querySelectorAll(`td[data-onhand="CA"]`).length
            const app_onhand_fc = document.querySelectorAll(`td[data-onhand="FC"]`).length
            const app_onhand_tm = document.querySelectorAll(`td[data-onhand="TM"]`).length
            const app_onhand_zm = document.querySelectorAll(`td[data-onhand="ZM"]`).length

            const app_bucket_w0 = document.querySelectorAll(`td[data-bucket="W0"]`).length
            const app_bucket_w1_2 = document.querySelectorAll(`td[data-bucket="W1-2"]`).length
            const app_bucket_w3_4 = document.querySelectorAll(`td[data-bucket="W3-4"]`).length

            const app_bucket_xday = document.querySelectorAll(`td[data-bucket="XDay"]`).length
            const app_bucket_m1_2 = document.querySelectorAll(`td[data-bucket="M1-2"]`).length
            const app_bucket_npl = document.querySelectorAll(`td[data-bucket="NPL"]`).length

            let total_assignment_cpt = _.sum([
                el_status_app, el_status_can, el_status_rej, app_onhand_ca, app_onhand_fc, app_onhand_tm, app_onhand_zm, app_bucket_w0, app_bucket_w1_2, app_bucket_w3_4,
                app_bucket_xday, app_bucket_m1_2, app_bucket_npl
            ])

            let total_record = _.sum([result.length, total_assignment_cpt])

        }

    }

    createAppOnhandList = (index) => {
        const { summaryData, configData, localStorageRead } = this.props    
        const customer_list = localStorageRead('nanolayout_custmarket', 'customer_list')
        let result = _.filter(customer_list, function (data) { return data.CustStatus == "After" && data.IsActive == 'Y' })

        const filter_onhandca = _.filter(customer_list, { OnHandStatus: 'CA' })
        const filter_onhandfc = _.filter(customer_list, { OnHandStatus: 'FC' })
        const filter_onhandtm = _.filter(customer_list, { OnHandStatus: 'TM' })
        const filter_onhandzm = _.filter(customer_list, { OnHandStatus: 'ZM' })
        
        const app_onhandca_amt = (filter_onhandca && filter_onhandca.length > 0) ? filter_onhandca.length:0
        const app_onhandfc_amt = (filter_onhandfc && filter_onhandfc.length > 0) ? filter_onhandfc.length:0
        const app_onhandtm_amt = (filter_onhandtm && filter_onhandtm.length > 0) ? filter_onhandtm.length:0
        const app_onhandzm_amt = (filter_onhandzm && filter_onhandzm.length > 0) ? filter_onhandzm.length:0
        
        const app_onhand_ca = document.querySelectorAll(`td[data-onhand="CA"]`).length
        const app_onhand_fc = document.querySelectorAll(`td[data-onhand="FC"]`).length
        const app_onhand_tm = document.querySelectorAll(`td[data-onhand="TM"]`).length
        const app_onhand_zm = document.querySelectorAll(`td[data-onhand="ZM"]`).length

        console.log(app_onhandca_amt, app_onhandfc_amt, app_onhandtm_amt, app_onhandzm_amt, app_onhand_ca, app_onhand_fc, app_onhand_tm, app_onhand_zm)
      
    }

    render() {
        const { visible, summaryData, configData, localStorageRead } = this.props

        return (
            <Row justify="start" gutter={5}>
                <Col span={6} className={cls['sumgrid_wrapper']}>
                    <div id="parent_gauge_complete" className={`${cls['sumgrid_wrapper']} ${options['bg_darkPink']}`}></div>
                </Col>
                <Col span={6} className={cls['sumgrid_wrapper']}>
                    <div id="parent_gauge_complete" className={`${cls['sumgrid_wrapper']} ${options['bg_darkCyan']}`}>
                        <Row className={`${cls['sumgrid_wrapper']} tc`}>
                            <Col span={24} className={cls['sumgrid_pot_header']}>POTENTIAL</Col>
                            <Col span={12} className={cls['sumgrid_pot_content']}>
                                <div className={cls['sumgrid_pot_value']}>20</div>
                                <div className={cls['sumgrid_pot_title']}>OK</div>
                            </Col>
                            <Col span={12} className={cls['sumgrid_pot_content']}>
                            <div className={cls['sumgrid_pot_value']}>33</div>
                                <div className={cls['sumgrid_pot_title']}>NOT OK</div>
                            </Col>
                            <Col span={24} className={cls['sumgrid_pot_footer']}>TOTAL 0</Col>
                        </Row>
                    </div>
                </Col>
                <Col span={6} className={cls['sumgrid_wrapper']}>
                    <div className={`${cls['sumgrid_wrapper']} ${options['bg_darkCyan']}`}>
                        { _.map([0], this.createAppOnhandList) }
                    </div>
                </Col>
                <Col span={6} className={cls['sumgrid_wrapper']}></Col>
            </Row>
        )
    }

}

export default SummaryReport