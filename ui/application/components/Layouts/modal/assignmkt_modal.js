import React, { Component } from 'react'
import { Modal, Card, Table, Form, AutoComplete, Input, Select, Button, Icon, Row, Col } from 'antd'
import _ from 'lodash'

import cls from '../styles/scss/modal.scss'
import styles from '../styles/css/autocomplete.css'

const FormItem = Form.Item
const ButtonGroup = Button.Group
const Option = Select.Option
const OptionGroup = AutoComplete.OptGroup
const SubOption = AutoComplete.Option

class AssignMktModal extends Component {

    state = {
        branch: [],
        market: []
    }

    setTitleHeader = () => {
        return (
            <div className={cls['title_header']}>
                <span className="pa1">โปรดเลือกรายการข้อมูลที่จะต้องการ</span>
            </div>
        )
    }

    setFooter = () => { return (<div></div>) }

    handleMarketApply = (e) => {
        e.preventDefault()

        const { form, mktMasterFilter, handleInitialCreation } = this.props
        form.validateFields((err, objField) => {
            let result = result = this.state.market[0] ? this.state.market : (mktMasterFilter[1]) ? mktMasterFilter[1] : null
            let not_uniquo = _.uniqBy(result, function (e) { return e.MarketCode })
            let market_select = _.filter(not_uniquo, { MarketCode: objField.market_filter })
            let branch_select = _.filter(mktMasterFilter[0], { BranchCode: objField.branch_filter })

            let requestData = {
                branch_filter: objField.branch_filter,
                market_filter: objField.market_filter,
                market_info: (market_select && market_select[0]) ? market_select[0]:null,
                branch_info: (branch_select && branch_select[0]) ? branch_select[0]:null,
            }

            console.log(requestData)

            handleInitialCreation(requestData)
        })
    }

    handleReset = () => {
        this.props.form.resetFields()
    }

    handleBranchSearch = (val) => {
        const { mktMasterFilter } = this.props
        const data_master = (mktMasterFilter[0]) ? mktMasterFilter[0] : null

        let result = this.getResultHandler(data_master, val)
        this.setState({ branch: result })
    }

    handleMarketSearch = (val) => {
        const { mktMasterFilter } = this.props
        const data_master = (mktMasterFilter[1]) ? mktMasterFilter[1] : null

        let result = this.getResultHandler(data_master, val)
        this.setState({ market: result })
    }

    handleBranchSelect = (val) => {
        const { mktMasterFilter, form } = this.props
        const data_master = (mktMasterFilter[1]) ? mktMasterFilter[1] : null

        form.setFields({ market_filter: '' })

        this.setState({ market: _.filter(data_master, { BranchCode: val }) })
    }

    fieldBranchList = () => {
        const { mktMasterFilter } = this.props
        const result = (this.state.branch[0] && this.state.branch.length > 0) ? this.state.branch : (mktMasterFilter[0]) ? mktMasterFilter[0] : null
        const title_group = _.chain(result)
            .groupBy('ZoneValue')
            .map(function (val, key) {
                return {
                    title: key,
                    children: val
                }
            })
            .value()

        const result_set = _.orderBy(_.reject(title_group, function (val) { return val.title == 'null' }), ['title'], ['asc'])
        const data_set = _.map(result_set, (v, i) => {
            return (
                <OptionGroup key={v.title} label={v.title}>
                    {
                        _.map(v.children, (data, index) => {
                            return (<SubOption key={data.BranchCode} value={data.BranchCode}>{`${data.BranchName} (${data.BranchType})`}</SubOption>)
                        })
                    }
                </OptionGroup>
            )
        })

        return (data_set && data_set.length > 0) ? data_set : []
    }

    handleBranchBlur = (val) => {
        console.log(val);
    }

    fieldMarketList = (val) => {
        const { mktMasterFilter } = this.props
        let result = result = this.state.market[0] ? this.state.market : (mktMasterFilter[1]) ? mktMasterFilter[1] : null
        const not_uniquo = _.uniqBy(result, function (e) { return e.MarketCode })

        const title_group = _.chain(not_uniquo)
            .groupBy('BranchName')
            .map(function (val, key) {
                return {
                    title: key,
                    children: val
                }
            })
            .value()

        const result_set = _.orderBy(_.reject(title_group, function (val) { return val.title == 'null' }), ['title'], ['asc'])
        const data_set = _.map(result_set, (v, i) => {
            return (
                <OptionGroup key={i} label={v.title}>
                    {
                        _.map(v.children, (data, index) => {
                            return (<SubOption key={`${index}`} value={`${data.MarketCode}`}>{`${data.MarketCode} - ${data.MarketName}`}</SubOption>)
                        })
                    }
                </OptionGroup>
            )
        })

        return (data_set && data_set.length > 0) ? data_set : []
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.props.mktMasterFilter !== nextProps.mktMasterFilter ||
               this.props.form !== nextProps.form
    }

    render() {

        const { visible, mktMasterFilter, handleMktAssignCloseModal } = this.props
        const { getFieldDecorator } = this.props.form

        return (
            <article>
                <Modal title={this.setTitleHeader()} visible={visible} onOk={handleMktAssignCloseModal} onCancel={handleMktAssignCloseModal} maskClosable={false} closable={false} footer={this.setFooter()}>
                    <Form className="pa1" onSubmit={this.handleMarketApply}>
                        <Row type="flex" gutter={10}>
                            <Col span={11}>
                                <FormItem label="รายชื่อสาขา" className={`${cls['mb1']} fw5`}>
                                    {
                                        getFieldDecorator('branch_filter', {
                                            rules: [{ required: false, message: '' }]
                                        })
                                        (
                                            <AutoComplete
                                                className={styles['certain-category-search']}
                                                dropdownClassName={styles['certain-category-search-dropdown']}
                                                dropdownMatchSelectWidth={false}
                                                dataSource={this.fieldBranchList()}
                                                optionLabelProp="children"                                                
                                                onSelect={this.handleBranchSelect}
                                                onSearch={this.handleBranchSearch}                                                
                                            >
                                                <Input id="branch_filter" suffix={<Icon type="search" className={styles['certain-category-icon']} />} />
                                            </AutoComplete>
                                        )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={2} className="tc">
                                <Icon type="double-right fa-2x" className={cls['icon_blink']} style={{ marginTop: '35px', color: '#01ABA9' }} />
                            </Col>
                            <Col span={11}>
                                <FormItem label="รายชื่อตลาด" className={`${cls['mb1']} fw5`}>
                                    {
                                        getFieldDecorator('market_filter', {
                                            rules: [{ required: false, message: '' }]
                                        })
                                        (
                                            <AutoComplete
                                                className={styles['certain-category-search']}
                                                dropdownClassName={styles['certain-category-search-dropdown']}
                                                dropdownMatchSelectWidth={false}
                                                dataSource={this.fieldMarketList()}
                                                optionLabelProp="children"
                                                onSearch={this.handleMarketSearch}
                                            >
                                                <Input id="market_filter" suffix={<Icon type="search" className={styles['certain-category-icon']} />} />
                                            </AutoComplete>
                                        )
                                    }
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <ButtonGroup className="fr">
                                    <Button onClick={this.handleReset}>ล้างข้อมูล</Button>
                                    <Button type="primary" htmlType="submit">สร้างแผงตลาด</Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </article>
        )
    }

    getResultHandler(master, valueStartsWith) {
        return this.searchWord(master, valueStartsWith)
    }

    searchWord(arr, searchKey) {        
        return arr.filter(obj => Object.keys(obj).some(key => _.includes(obj[key], searchKey)))
    }

}

export default Form.create()(AssignMktModal)