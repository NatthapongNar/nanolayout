import React, { Component } from 'react'
import { in_array, parseBool } from '../../../containers/Layouts/function'
import { Modal, Button, Icon, Row, Col, Tooltip, notification } from 'antd'
import Scrollbar from 'react-custom-scrollbars'
import _ from 'lodash'

import cls from '../styles/scss/grid_layout.scss'
import styles from '../styles/scss/preview_layout.scss'

const maxHeightScreen = (window.screen.availHeight - (window.outerHeight - window.innerHeight)) - 35
const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))

class PreviewModal extends Component {

    state = {
        notify: false
    }

    createElement = (el) => {
        return (<div id={`${el}_previews`} key={`${el}_previews`} data-attr={el} className={`${styles['grid_layout_zone']}`} draggable={false}></div>)
    }

    componentWillReceiveProps(nextProps) {
        const { notify } = this.state
        const { visible } = nextProps
        if(visible) {
            if(!notify) {
                notification.info({
                    message: 'วิธีการเลือนหน้าจอ',
                    description: 'การเลือนหน้าจอสามารถทำได้โดยการกดคลิกค้างและเลือนเมาส์ไปยังพื้นที่่ที่่ต้องการ',
                    duration: 10
                })

                this.setState({ notify: true })
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.props.sideSummary !== nextProps.sideSummary ||
               this.state.notify !== nextState.notify
    }

    render() {
        const { visible, configData, handlePreviewLayoutCloseBigScale } = this.props

        let modal_config = { 
            top: 0, 
            paddingBottom: 0, 
            minWidth: maxWidthScreen, 
            minHeight: maxHeightScreen
        }

        return (
            <article>
                <Modal title={this.setTitleHeader()} visible={visible} mask={false} maskClosable={false} style={{...modal_config}} onOk={handlePreviewLayoutCloseBigScale} onCancel={handlePreviewLayoutCloseBigScale} closable={true} footer={this.setFooter()} style={{ top: 0, paddingBottom: 0, minWidth: maxWidthScreen, minHeight: maxHeightScreen }}  wrapClassName={styles['gridWrapper']}>
                    <div id="grid_previews" className={`${styles['wrapper']} ${styles['grid']}`}>
                        { _.map(configData.side, this.createElement) } 
                    </div>
                </Modal>
            </article>
        )
    }

    setTitleHeader = () => {
        const { handleSummaryCollapse } = this.props
        
        return (
            <div className={`${styles['title_header']}`}>
                <span className="pa1">ดูข้อมูลเลย์เอาท์แผงตลาด (โหมดจำลองเลย์เอาท์เสมือนจริง)</span>
                <span className="fr dn" onClick={handleSummaryCollapse}>
                    <Tooltip placement="bottomLeft" title={'สรุปข้อมูลเลย์เอาท์'}>
                        <i className={`ti-pie-chart fa-2x ${styles['icon']}`} />
                    </Tooltip>
                </span>
                <span className="fr mr3">
                    <Tooltip placement="bottom" title={'ค้นหาข้อมูลเลย์เอาท์'}>
                        <i className={`ti-search fa-2x ${styles['icon']} ${styles['blind']}`} />
                    </Tooltip>
                </span>
                <span className="fr mr3">
                    <Tooltip placement="bottom" title={'ปริ๊นตารางเลย์เอาท์'}>
                        <i className={`ti-printer fa-2x ${styles['icon']} ${styles['blind']}`} />
                    </Tooltip>
                </span>
            </div>
        )

    }

    setFooter = () => { return null }
}

export default PreviewModal