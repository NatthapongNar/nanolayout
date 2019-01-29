import React, { Component, PropTypes } from 'react'
import { Row, Col, notification } from 'antd'

import cls from '../styles/scss/layout.scss'
import options from '../../../utilities/_general.scss'

const LayoutActive = ({ configData, sideableState, handleZoneActive }) => (
    <Row>
        <Col span={24}>
            <p className={cls['side_title']}>
                <i className={`ti-location-pin ${options['fg_teal']}`} /> Zone Activation
            </p>
        </Col>
        <Col span={12}>
            <div className={`${cls['sider_rows']} ${sideableState.outside1 && cls['sider_active']} fr`} onClick={handleZoneActive.bind(this, configData.side[0])}>
                <div className={ (sideableState.outside1) ? options['fg_white']:options['fg_gray'] }>{ configData.tblTH[0] }</div>
            </div>
        </Col>
        <Col span={12}>
            <div className={`${cls['sider_rows']} ${sideableState.outside2 && cls['sider_active']} fl`} onClick={handleZoneActive.bind(this, configData.side[1])}>
                <div className={ (sideableState.outside2) ? options['fg_white']:options['fg_gray'] }>{ configData.tblTH[1] }</div>
            </div>
        </Col>
        <Col span={12}>
            <div className={`${cls['sider_rows']} ${sideableState.outside3 && cls['sider_active']} fr`} onClick={handleZoneActive.bind(this, configData.side[2])}>
                <div className={ (sideableState.outside3) ? options['fg_white']:options['fg_gray'] }>{ configData.tblTH[2] }</div>
            </div>
        </Col>
        <Col span={12}>
            <div className={`${cls['sider_rows']} ${sideableState.mainside && cls['sider_active']} fl`} onClick={handleZoneActive.bind(this, configData.side[3])}>
                <div className={ (sideableState.mainside) ? options['fg_white']:options['fg_gray'] }>{ configData.tblTH[3] }</div>
            </div>
        </Col>
    </Row>
)

export default LayoutActive