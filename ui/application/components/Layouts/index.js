import React, { Component } from 'react'
import { Row, Col, Modal, Icon, notification } from 'antd'
import Navigation from './navigation'
import Loader from './loader'
import LayoutActive from './sider/layout_active'
import CreateLayer from './sider/create_layer'
import Summary from './sider/summary'
import Gridpane from './gridpane'
import SplitCell from './tools/splitcell'
import TableSelection from './tools/tableselection'
import CellExtension from './tools/cellextendsion'
import DecreaseCustomerTools from './tools/decreasecust'
import ProfileModal from './modal/profile_modal'
import AssignModal from './modal/assign_modal'
import PreviewModal from './modal/preview_modal'
import PreviewResponsive from './modal/preview_responsive'
import AssignPotentialModal from './modal/assignpot_modal'

import cls from './styles/scss/layout.scss'

const loader_config = { 
    title: 'Nano Market Layouts',
    size: 200, 
    center: true
}

class MarketLayoutComponent extends Component {

    render() {

        const { 
            authen,
            authenTester,
            progress,
            progress_desc,
            progress_status,
            masters,
            visible,
            mktprofile,
            camktshare,
            mktCustomers,
            mktLockInfo,
            assignCell,
            assignItem,
            assignMode,
            cellExtension,
            cellExtensionType,
            active_sideno,
            table_info,
            configData, 
            navableState, 
            sideableState, 
            firstCreate,
            firstCreatePotential,
            createTable,
            splitMode,
            actionLogs,           
            decreaseCust,        
            mktPotential,
            mktCustFilter,
            handleDrag, 
            handleDrop, 
            handleCollapse, 
            preview_layouts,
            preview_bigscale,
            handleZoneActive,
            handleLockLayout,
            handleSaveLayout,
            handleSummaryCollapse,
            handleProfileModal,
            handleProfileModalClose,
            handleExtensionClose,
            handleMarketCustomerListFilter, 
            handleMarketPotentialListFilter,
            handleAssignModalClose,
            handleAssignResetFilter,
            handlePotentialResetFilter,           
            handleMktAssignModal,
            handleMktAssignCloseModal,
            handleCustPotentialClose,
            handleCreateCustPotential,
            handlePreviewLayout,
            handlePreviewLayoutClose,   
            handlePreviewLayoutBigScale,
            handlePreviewLayoutCloseBigScale,
            handleDecreaseCustomer,
            handleDecreaseAdditionalClose,
            handleUpdateActionLog, 
            handleSplitCellCancel,
            handleSplitCellClose,
            handleTableSelectionClose,
            handleScrollbar,
            handleConfirmSplit,
            localStorageRead
        } = this.props

        return (
            <div className={`${cls['layout_container']} layout_wrapper`}>

                <div className={`${cls['layout_nav']} ${(progress) ? cls['hide'] : ''}`} style={{ position: 'fixed', width: '100%' }}>
                    <Navigation 
                        authen={authen} 
                        tester={authenTester}
                        visible={visible.mktassign_modal}
                        preview={visible.preview_modal}
                        mktProfile={mktprofile}
                        mktLockInfo={mktLockInfo}
                        navableState={navableState} 
                        handleDrag={handleDrag} 
                        configData={configData}
                        tableInfo={table_info}
                        activeSideno={active_sideno}
                        handleCollapse={handleCollapse} 
                        handleLockLayout={handleLockLayout}
                        handleSaveLayout={handleSaveLayout} 
                        localStorageRead={localStorageRead}
                        handlePreviewLayout={handlePreviewLayout}
                        handleSummaryCollapse={handleSummaryCollapse}
                    />
                </div>

                <div className={`${cls['layout_progress']} ${(!progress) ? cls['hide'] : ''}`}>
                    <Loader {...loader_config} desc={progress_desc} status={progress_status} />
                </div>

                <div id="layout_content" className={cls['layout_content']} style={{ display: 'none' }}>
                    <Gridpane firstCreate={firstCreate} configData={configData} sideableState={sideableState} handleDrop={handleDrop} getScrollValues={handleScrollbar} />
                    <div className={`${cls['layout_sider']} ${(!navableState.collapse) ? cls['open'] : ''}`}>
                        <div className={`${cls['layout_sider_item']}`}>
                            <LayoutActive authen={authen} configData={configData} sideableState={sideableState} handleZoneActive={handleZoneActive} />
                            <CreateLayer />
                        </div>
                    </div> 
                    <div className={`${cls['layout_sider']} ${(!navableState.summary) ? cls['open'] : ''}`}>
                        <div className={`${cls['layout_sider_item']}`}>
                            <Summary visible={navableState.summary} mktProfile={mktprofile} mktCustomer={mktCustomers} dataItems={camktshare} configData={configData} localStorageRead={localStorageRead} />
                        </div>
                    </div> 
                </div>

                <div className={`${cls['version']} ${(!progress) ? cls['hide'] : ''} tc`}>Release alpha version</div>

                <SplitCell visible={visible.split_tool} offset={splitMode.offset} spantype={splitMode.mode} spanlen={splitMode.spanlen} getValues={handleConfirmSplit} handleClose={handleSplitCellClose} handleCancel={handleSplitCellCancel} />
                <TableSelection visible={visible.table_tool} offset={splitMode.offset} spanlen={splitMode.spanlen} getValues={handleConfirmSplit} handleClose={handleTableSelectionClose} />
                <DecreaseCustomerTools 
                    visible={visible.decrease_tool}
                    data={decreaseCust} 
                    offset={splitMode.offset} 
                    getValues={handleDecreaseCustomer} 
                    handleClose={handleDecreaseAdditionalClose} 
                />

                <CellExtension 
                    visible={visible.cell_extension_tool} 
                    cellExtension={cellExtension} 
                    cellExtensionType={cellExtensionType} 
                    handleProfileModal={handleProfileModal} 
                    handleClose={handleExtensionClose} 
                    configData={configData} 
                    customerData={mktCustomers} 
                    localStorageRead={localStorageRead}
                />

                <ProfileModal 
                    authen={authen}
                    visible={visible.market_modal} 
                    preview={visible.preview_modal}
                    previewBigScale={visible.preview_bigscale_modal}
                    masters={masters} 
                    actionLogs={actionLogs} 
                    mktCustFilter={mktCustFilter} 
                    handleUpdateActionLog={handleUpdateActionLog}
                    handleProfileModalClose={handleProfileModalClose} 
                    localStorageRead={localStorageRead}
                />

                <AssignModal 
                    authen={authen}
                    visible={visible.assign_modal} 
                    assignItem={assignItem}            
                    assignMode={assignMode}          
                    handleAssignModalClose={handleAssignModalClose} 
                    handleAssignResetFilter={handleAssignResetFilter}
                    handleMarketCustomerListFilter={handleMarketCustomerListFilter}
                    summaryData={camktshare} 
                    configData={configData} 
                    localStorageRead={localStorageRead}
                />

                <AssignPotentialModal
                    isCreate={firstCreatePotential}
                    authen={authen}
                    visible={visible.potential_modal}
                    preview={visible.preview_modal}
                    previewBigScale={visible.preview_bigscale_modal}
                    masters={masters}                     
                    getValues={handleCreateCustPotential}
                    assignCell={assignCell}
                    mktPotential={mktPotential}
                    handleCustPotentialClose={handleCustPotentialClose}                  
                />

                <PreviewResponsive 
                    authen={authen}
                    visible={visible.preview_modal}
                    sideSummary={navableState.summary}
                    configData={configData}
                    preview_layouts={preview_layouts}
                    mktCustomer={mktCustomers}
                    localStorageRead={localStorageRead}
                    handleProfileModal={handleProfileModal}
                    handlePreviewLayoutClose={handlePreviewLayoutClose}
                    handlePreviewLayoutBigScale={handlePreviewLayoutBigScale}
                    handleSummaryCollapse={handleSummaryCollapse}
                />

                <PreviewModal
                    authen={authen}
                    visible={visible.preview_bigscale_modal}
                    sideSummary={navableState.summary}
                    configData={configData}
                    createTable={createTable}
                    preview_layouts={preview_bigscale}
                    localStorageRead={localStorageRead}
                    handleSummaryCollapse={handleSummaryCollapse}
                    handlePreviewLayoutCloseBigScale={handlePreviewLayoutCloseBigScale}
                />   

            </div>
        )
    }
}

export default MarketLayoutComponent