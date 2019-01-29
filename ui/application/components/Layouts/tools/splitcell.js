import React, { Component } from 'react'
import { Form, Input, InputNumber, Button, notification } from 'antd'

import cls from '../styles/scss/splitcell.scss'

const FormItem = Form.Item

class SplitCell extends Component {

    handleSubmit = (e) => {
        e.preventDefault()

        const { form, getValues, handleClose } = this.props
        form.validateFields((err, objField) => {
            
            if(objField && objField.split_cell > 0) {                
                getValues(objField)
                this.props.form.resetFields()
                handleClose()
            } else {
                notification.warning({
                    message: 'กรุณาระบุจำนวนแถวที่ต้องการจะเพิ่ม',
                    description: 'โปรดตรวจสอบข้อมูลก่อนยืนยันการสร้างแถวข้อมูล...',
                })                
            }
        })
    }

    handleCancel = () => {
        const { handleCancel } = this.props
        this.props.form.resetFields()
        handleCancel()
    }

    shouldComponentUpdate(nextProp) {
        return this.props.visible !== nextProp.visible ||
               this.props.offset !== nextProp.offset ||
               this.props.spanlen !== nextProp.spanlen ||
               this.props.form !== nextProp.form
    }

    render() {
        const { visible, offset, spantype, spanlen, handleCancel } = this.props
        const { getFieldDecorator } = this.props.form

        const cellWidth = 38
        const top = (offset && offset.top > 0) ? offset.top:0
        const left = (offset && offset.left > 0) ? offset.left:0
        const span = (spanlen && spanlen > 0) ? spanlen:0
        const increase_left = (spantype == 'cols') ? (cellWidth * span):cellWidth

        let style_config = {
            top: `${top}px`,
            left: `${(left + increase_left)}px`
        }

        return (
            <div className={`${cls['split_container']} ${(visible) && cls['open']}`} style={{...style_config}}>
                <Form layout="inline" onSubmit={this.handleSubmit}>
                    <FormItem>
                        { getFieldDecorator('split_cell', { initialValue: span, rules: [] })(<InputNumber min={1} max={30} />) }
                    </FormItem>
                    <FormItem>
                        <Button type="primary" shape="circle" icon="check" htmlType="submit" />
                    </FormItem>
                    <FormItem>
                        <Button shape="circle" icon="close" onClick={handleCancel} />
                    </FormItem>
                </Form>
            </div>
        )
    }

}

export default Form.create()(SplitCell)