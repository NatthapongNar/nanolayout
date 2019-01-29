import React, { Component } from 'react'
import { createElement, in_array, parseNumberShort, isNodeList  } from '../../../containers/Layouts/function'
import _ from 'lodash'

import cls from '../styles/scss/cell_extension.scss'
import grid_cls from '../styles/scss/grid_layout.scss'

class CellExtension extends Component {

    cellRendering = (elemets) => {
        if(elemets) {
            let elemetList = (isNodeList(elemets)) ? elemets : [elemets]
            let cell =_.map(elemetList, (v, i) => { return (this.handleInterfaceField($(v), i)) }) 
            
            const cell_content = document.querySelector(`.${cls['tools-extension-content']}`)
            $(`.${cls['cell-box']}`).find(`div.${grid_cls['cell']}`).find(`.${grid_cls['cell_inside_header']}, .${grid_cls['cell_inside_bottom']}`).unbind('dblclick')
            if(cell_content.hasChildNodes) {
                $(cell_content).empty()
            }
            _.forEach(cell, (v) => { cell_content.appendChild(v) })
            this.handleEventBinding()
        }
    }

    handleEventBinding = () => {
        const { handleProfileModal } = this.props
      
        $(`.${cls['cell-box']}`).find(`div.${grid_cls['cell']}`).find(`.${grid_cls['cell_inside_header']}, .${grid_cls['cell_inside_bottom']}`).on('dblclick', (event) => {
            const cell = $(event.target).parent().parent()
            handleProfileModal(cell)
        })
       
    }

    shouldComponentUpdate(nextProps) {
        return this.props.visible !== nextProps.nextProps ||
               this.props.cellExtension !== nextProps.cellExtension
    }
    
    render() {        
        const { visible, cellExtension, cellExtensionType, handleClose } = this.props        
        let close_icon = (cellExtensionType == 'multi') ? true:false
        let elemets = (cellExtension) ? cellExtension : null
        let parentEl = (elemets) ? $(elemets).parents()[3] : null
        let offset = (parentEl) ? $(parentEl).offset() : { top: 0, left: 0 }
       
        const cellWidth = 0
        let adjust_top = (cellExtensionType == 'multi') ? 24:52//30:52
        let style_config = (cellExtension) ? { top: `${offset.top - adjust_top}px`, left: `${(offset.left + cellWidth)}px` } : {}  

        return (
            <div className={`${cls['tools-extension-container']} ${(visible) && cls['open']}`} style={{...style_config}}>
                <div className={`${cls['tools-extension-close']} ${(!close_icon) && 'dn'}`} onClick={handleClose}>
                    <i className={`ti-close`} />
                </div>
                <div className={`${cls['tools-extension-content']}`}>                   
                    { (visible) && this.cellRendering(elemets) }
                </div>
                <div className={`${cls['tools-extension-footer']}`}></div>
            </div>
        )
    }

    handleInterfaceField = (element_cell, index) => {
        const { customerData } = this.props
        const mktCustomers = (customerData && customerData.length > 0) ? customerData : []

        if(element_cell) {
            let cell_appno = element_cell.attr('data-attr')
            let cell_refno = element_cell.attr('data-ref')
    
            let findCustomer = _.filter(mktCustomers, { ApplicationNo: cell_appno })

            let onhand_item = (findCustomer[0] && findCustomer[0].OnHandStatus) ? findCustomer[0].OnHandStatus : ''
            let bucket_item = (findCustomer[0] && findCustomer[0].Cust_DPDBucketNow) ? findCustomer[0].Cust_DPDBucketNow : ''
            let status_item = (findCustomer[0] && findCustomer[0].StatusDigit) ? findCustomer[0].StatusDigit : ''

            let status_reanson = (findCustomer[0] && findCustomer[0].Status) ? findCustomer[0].Status : null
            let principle_item = (findCustomer[0] && findCustomer[0].Principle) ? findCustomer[0].Principle : null
    
            let acc_close = (principle_item && principle_item > 0) ? 'N' : 'Y'
            let check_status = (status_reanson == 'Approved' && acc_close == 'Y') ? 'E' : status_item

            let cell_bucket = this.checkCellOnhand(findCustomer)
            let cell_status = this.onChangeStateCell(findCustomer[0])
            let cell_note = this.handleActionNoteTriangle(findCustomer[0])
           
            return createElement('div', { 'class': `${cls['cell-box']}`, 'data-attr': cell_appno, 'data-ref': cell_refno, 'data-onhand': onhand_item, 'data-status': check_status, 'data-bucket': bucket_item, 'data-reserv': "true" },
                createElement('div', { 'key': (index + 1), 'class': `${grid_cls['cell']} ${cell_status}` }, 
                    _.map([cell_bucket, cell_refno, cell_note], (v, i) => {
                        switch(i) {
                            case 0: 
                                return createElement('div', { class: `${grid_cls['cell_inside_header']}` }, v)
                            case 1:
                                return createElement('div', { class: `${grid_cls['cell_inside_bottom']}` }, v)
                            default:
                                return (v) ? v : ''
                        }                        
                    })
                )
            )
        }
    }

    handlePartitionElement = (cell_bucket, cell_refno) => {
        return _.map([cell_bucket, cell_refno], (v, i) => {
            return (i == 0) ? createElement('div', { class: `${grid_cls['cell_inside_header']}` }, v) : createElement('div', { class: `${grid_cls['cell_inside_bottom']}` }, v)
        })  
    }

    handleActionNoteTriangle = (action_logs) => {
        if (action_logs && action_logs.Subject) {
            return (
                createElement('div', { 'class': `${grid_cls['triangle-up-right']} ${grid_cls['tooltip']}` },
                    createElement('div', { 'class': `${grid_cls['tooltip_container']}` },
                        (_.map([action_logs.Subject, action_logs.Remark], (data) => { return createElement('p', {}, data) }))
                    )
                )
            )    
        } else {
            return undefined
        }
    }

    checkCellOnhand = (findCustomer) => {
        const { bktFullNotRisks } = this.props.configData

        let appStatus = (findCustomer && findCustomer[0]) ? findCustomer[0].StatusDigit : null

        // Check close account
        const status = (findCustomer && findCustomer[0]) ? findCustomer[0].Status : null
        let principle = (findCustomer && findCustomer[0]) ? findCustomer[0].Principle : null
        let acc_close = (principle && principle > 0) ? 'N' : 'Y'

        // Check Top Up
        let topup = (findCustomer && findCustomer[0]) ? findCustomer[0].IsTopUp : null
        let isTopUp = (topup == 'A') ? 'TOP UP' : ''

        // Check Start NPL
        let isRisks = false
        let bucket = (findCustomer && findCustomer[0]) ? findCustomer[0].Cust_DPDBucketNow : null

        if (bucket) {
            if (!in_array(bucket, bktFullNotRisks)) {
                isRisks = true
            }
        } else {
            isRisks = false
        }

        let cell_header = ''
        if (status == 'Approved' && acc_close == 'Y') {
            cell_header = 'END'

        } else {
            if (in_array(appStatus, ['A'])) {
                if (!isRisks) {
                    if (bucket == 'W0') {
                        cell_header = (findCustomer && findCustomer[0]) ? parseNumberShort(findCustomer[0].Principle) : ''
                    } else {
                        cell_header = (bucket && bucket !== '') ? bucket : ''
                    }
                } else {
                    if (isRisks) {
                        cell_header = (bucket && bucket !== '') ? bucket : ''
                    } else if (topup) {
                        cell_header = isTopUp
                    }
                }
            }
            else if (in_array(appStatus, ['C', 'R'])) {
                if (appStatus == 'C')
                    cell_header = 'CAN'
                else
                    cell_header = 'REJ'
            }
            else {
                if (isRisks) {
                    cell_header = (bucket && bucket !== '') ? bucket : ''
                } else {
                    let on_hand = (findCustomer && findCustomer[0]) ? findCustomer[0].OnHandStatus : null
                    if (on_hand) {
                        cell_header = on_hand
                    }
                }
            }
        }

        return cell_header
    }

    onChangeStateCell = (result) => {
        const { configData } = this.props
        const { bktFullNotRisks } = configData

        if(result) {
            const principle = (result.Principle) ? result.Principle:null
            const status = (result.Status) ? result.Status:null
            let acc_close = (principle && principle > 0) ? 'N':'Y'
            
            if(status == 'Approved' && acc_close == 'Y') { 
                return `${grid_cls['cell_active']} ${grid_cls['cell_closeacc']}`

            } else {
                if (in_array(result.StatusDigit, ['A'])) {
                    if (!in_array(result.Cust_DPDBucketNow, bktFullNotRisks)) 
                        return `${grid_cls['cell_active']} ${grid_cls['cell_overdue']}`
                    else 
                        return grid_cls['cell_active']
    
                } else if (in_array(result.StatusDigit, ['C', 'R'])) {
                    return `${grid_cls['cell_active']} ${grid_cls['cell_reject']}`
    
                } else { 
                    if (!in_array(result.Cust_DPDBucketNow, bktFullNotRisks) && result.Cust_DPDBucketNow) 
                        return `${grid_cls['cell_active']} ${grid_cls['cell_overdue']}`
                    else 
                        return `${grid_cls['cell_active']} ${grid_cls['cell_onhand']}` 
                }
            }
  
        } else { 
            return `${grid_cls['cell_active']} ${grid_cls['cell_onhand']}` 
        }
    }

}

export default CellExtension