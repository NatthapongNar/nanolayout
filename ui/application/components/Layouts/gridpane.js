import React, { Component } from 'react'
import Scrollbar from 'react-custom-scrollbars'
import { in_array, parseBool } from '../../containers/Layouts/function'
import _ from 'lodash'

import cls from './styles/scss/grid_layout.scss'

class Gridpane extends Component {

    allowDropElement = (event) => { event.preventDefault() }

    createElement = (el, i) => {        
        const { handleDrop, getScrollValues } = this.props
        return (
            <div id={el} 
                 key={el}
                 data-attr={el}  
                 className={`${cls['grid_layout_zone']} ${this.handleSideGrid(el)}`} 
                 onDrop={handleDrop.bind(this, el)} 
                 onDragOver={this.allowDropElement}>
                <Scrollbar ref={`scrl_${el}`} className={`react-scroll ${cls['grid_layout_zone']}`} onScrollFrame={getScrollValues}></Scrollbar>
            </div>
        )
    }

    componentDidMount() {
        const { scrl_mainside_central_zone, scrl_outside_topcenter_zone, scrl_outside_left_zone, scrl_outside_topleft_zone } = this.refs

        this.handleMouseMove(scrl_mainside_central_zone)
        this.handleMouseMove(scrl_outside_topcenter_zone)
        this.handleMouseMove(scrl_outside_left_zone)
        this.handleMouseMove(scrl_outside_topleft_zone)
    }
    
    handleMouseMove = (scrollbar) => {
        let deltaX = 0,
            deltaY = 0

        const line = 70    

        const maxHeightScreen = window.screen.availHeight - (window.outerHeight - window.innerHeight) - line
        const maxWidthScreen = (window.screen.availWidth - (window.outerWidth - window.innerWidth)) - line

        let scrl = scrollbar.getValues()      
        $(scrollbar.container).mousemove((e) => {   
            if(e.clientX <= line || e.clientX >= maxWidthScreen) {
                let w = $(scrollbar.view).width(),
                    h = $(scrollbar.view).height()

                let x = e.clientX - w / 2
                let y = e.clientY - h / 2

                deltaX = x * 0.1
                deltaY = y * 0.1
            
                $(scrollbar.view).scrollLeft((i, v) => { return v + deltaX })
            }    
        })
    
    }

    render() {
        const { configData } = this.props
        return (
            <div id="grid_layout" className={cls['grid_layout']}>
                { _.map(configData.side, this.createElement) } 
            </div>
        )
    }

    handleSideGrid = (elname) => {
        const { configData, sideableState } = this.props
        let grid_handler = cls['open']
        if(elname == configData.side[0]) {
            grid_handler = parseBool(sideableState.outside1) ? cls['open']:cls['hide']
        }      
        if(elname == configData.side[1]) {
            grid_handler = parseBool(sideableState.outside2) ? cls['open']:cls['hide']
        }
        if(elname == configData.side[2]) {
            grid_handler = parseBool(sideableState.outside3) ? cls['open']:cls['hide']
        }
        if(elname == configData.side[3]) {
            grid_handler = parseBool(sideableState.mainside) ? cls['open']:cls['hide']
        }
        return grid_handler
    }

}

export default Gridpane
