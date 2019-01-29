import React, { Component } from 'react'
import _ from 'lodash'

import styles from '../styles/scss/tableSelection.scss'

class TableSelection extends Component {

    state = {
        pointerIndex: ''
    }

    onElementFocus = (index) => {
        const rowIndex = index.split('_')[0]
        const colIndex = index.split('_')[1]
        this.setState({ pointerIndex: index })

        let footer = document.querySelector(`.${styles['table-tools-footer']}`)
        footer.innerHTML = `${colIndex} x ${rowIndex}`

    }

    onClickCell = index => {
        const { getValues, handleClose } = this.props

        const rowIndex = index.split('_')[0]
        const colIndex = index.split('_')[1]

        getValues({
            cols: colIndex,
            rows: rowIndex,
            total: (rowIndex * colIndex)
        })

        _.delay(() => { handleClose() }, 200)
    }

    checkClass = (rIndex, cIndex) => {
        const rowIndex = this.state.pointerIndex.split('_')[0]
        const colIndex = this.state.pointerIndex.split('_')[1]
        if (rIndex <= rowIndex && cIndex <= colIndex) {
            return styles['cell-selected']
        }
    }

    getTableLayout() {
        let index = 1
        let array = []
        for(let i = 0; i < 20; i++) {
            array.push(index)
            index++
        }
        return array
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.visible !== nextProps.visible ||
               this.props.offset !== nextProps.offset ||
               this.props.spanlen !== nextProps.spanlen ||
               this.state.pointerIndex !== nextState.pointerIndex
    }

    render() {
        const { visible, offset, spanlen, handleClose } = this.props

        const cellWidth = 38
        const top = (offset && offset.top > 0) ? offset.top:0
        const left = (offset && offset.left > 0) ? offset.left:0
        const span = (spanlen && spanlen > 0) ? spanlen:0
        const increase_left = (cellWidth * span)

        let style_config = {
            top: `${top}px`,
            left: `${(left + increase_left)}px`
        },
        cellList = this.getTableLayout()

        return (
            <div className={`${styles['table-tools-container']} ${(visible) && styles['open']}`} style={{...style_config}}>
                <div className={styles['table-tools-close']} onClick={handleClose}>
                    <i className={`ti-close`}></i>
                </div>
                <div className={`${styles['cell-container']}`}>
                    {
                        _.map(cellList, (r, rIndex) => {
                            return (
                                _.map(cellList, (c, cIndex) => {
                                    const pointer = `${rIndex + 1}_${cIndex + 1}`
                                    const highlight = this.checkClass(rIndex + 1, cIndex + 1)
                                    return (<div key={pointer} className={`${styles['cell']} ${highlight}`} ref={pointer} onMouseOver={() => this.onElementFocus(pointer)} onClick={() => this.onClickCell(pointer)}></div>)
                                })
                            )
                        })
                    }
                </div>
                <div className={styles['table-tools-footer']}> 0 x 0</div> 
            </div>
        )
    }
}

export default TableSelection