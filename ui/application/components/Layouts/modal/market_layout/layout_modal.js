import React, { Component } from 'react'
import { Modal, Form } from 'antd'
import {} from './function'

import MarketLayoutCtrl from './market_layout'
import cls from './styles/grid_market.scss'



const heightMaxScreen = (window.screen.availHeight - (window.outerHeight - window.innerHeight)) 
const widthMaxScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth))


class LayoutModal extends Component {

    handleClose = () => {
        const { handleLayoutClose } = this.props

        handleLayoutClose()
    }

    render() {
        const { visible, marketCode, handleGetCell } = this.props

        return (
            <Modal 
                title={null}
                visible={visible}          
                onCancel={this.handleClose}                   
                className={`${cls['customer_modal']} ${cls['fullscreen']}`}
                maskClosable={false}
                footer={null}
                style={{ zIndex: 2147483647, padding: 0 }}
            >
                <MarketLayoutCtrl 
                    mktcode={marketCode}
                    fullscreen={true}
                    sidebar={false}
                    isGetCell={true}
                    handleGetCell={handleGetCell}
                    zoomDisable={true}
                />
            </Modal>         
        )
    }
}

function apply_coords() {
    $("#grid_previews").css("transform", 'perspective(100px) translate3d(' + translateX + 'px, ' + translateY + 'px, ' + translateZ + 'px)');
}

export default Form.create()(LayoutModal)