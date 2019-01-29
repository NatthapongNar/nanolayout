import React, { Component } from 'react'
import { Form, Modal, Checkbox, Button } from 'antd'
import _ from 'lodash'

import cls from '../styles/scss/tools_float.scss'
import styles from '../../../utilities/_general.scss'

const FormItem = Form.Item
const confirm = Modal.confirm
const CheckboxGroup = Checkbox.Group

class DecreaseCustomerTools extends Component {

    state = {
        checkedList: []
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { checkedList } = this.state
        const { data, getValues, handleClose } = this.props

        let name_list = []
        if(checkedList && checkedList.length) {
            handleClose()

            _.forEach(checkedList, (v, i) => {
                let info = _.filter(data, { value: v })[0]
                if(info) {
                    name_list.push(`${info.label} (${v})`)
                }
            })

            confirm({
                title: 'กรุณายืนยันความถูกต้องของข้อมูล',
                content: (
                    <article>
                        <p>โปรดตรวจสอบถูกต้องของข้อมูล ก่อนยืนยันการลบข้อมูล</p>
                        <p style={{ textDecoration: "underline" }}>ข้อมูลที่ต้องการจะลบ คือ</p>
                        { _.map(name_list, (v, i) => { return (<p key={(i + 1)} className={`${styles['bg_grayLighter']} pa1`}>{`${(i + 1)}. ${v}`}</p>) }) }
                        <p>กรณึข้อมูลถูกต้องโปรดกด OK</p>
                    </article>
                ),
                onOk: () => { getValues(checkedList) },
                onCancel: () => { }
            })

        }

    }

    handleChange = (checkedList) => {
        this.setState({ checkedList })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.props.data !== nextProps.data ||
               this.props.offset !== nextProps.offset ||
               this.state.checkedList !== nextState.checkedList
    }

    render() {
        
        const { visible, data, offset, handleClose } = this.props

        const cellWidth = 38
        let style_config = {
            top: `${offset.top}px`,
            left: `${(offset.left + cellWidth)}px`
        }

        return (
            <div className={`${cls['tools-container']} ${(visible) && cls['open']}`} style={{...style_config}}>
                <div className={`${cls['tools-header']}`}>
                    ลบข้อมูลลูกค้าภายในแผง
                    <i className={`ti-close fr mt`} onClick={handleClose} style={{ cursor: 'pointer', marginTop: '3px' }} />
                </div>
                <div className={`${cls['tools-content']}`}>
                <Form className="pa1" onSubmit={this.handleSubmit}> 
                    <FormItem>
                        <CheckboxGroup options={data} value={this.state.checkedList} onChange={this.handleChange} />
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit" className="fr" size="small">ลบข้อมูล</Button>                         
                    </FormItem>
                </Form>
               
                </div>
                <div className={`${cls['tools-footer']}`}></div>
            </div>
        )
    }

}

export default Form.create()(DecreaseCustomerTools)