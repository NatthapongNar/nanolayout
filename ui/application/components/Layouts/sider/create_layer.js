import React, { Component } from 'react'
import { Row, Col, Icon } from 'antd'

import cls from '../styles/scss/layout.scss'
import options from '../../../utilities/_general.scss'

const CreateLayer = () => (
    <Row id="layer_container" style={{ marginTop: '10%' }}>
        <Col span={24}>
            <p className={cls['side_title']}>
                <i className={`ti-layers ${options['fg_teal']} pr1`} /> Layer Creation
            </p>
        </Col>
        {/* <Col span={24}>
            <div className={cls['layer_container']} data-id="1" data-zone="F" onClick={createLayer}>
                <div className={cls['layer_draft']}></div>
                <div className={cls['layer_text']}>1F</div>
            </div>
        </Col>
        <Col span={24}>
            <div className={cls['layer_container']} data-id="0" data-zone="G">
                <div className={cls['layer_active']}></div>
                <div className={cls['layer_text']}>G</div>
            </div>
        </Col>
        <Col span={24}>
            <div className={cls['layer_container']} data-id="1" data-zone="B" onClick={createLayer}>
                <div className={cls['layer_draft']}></div>
                <div className={cls['layer_text']}>1B</div>
            </div>
        </Col> */}
    </Row>
)

export default CreateLayer