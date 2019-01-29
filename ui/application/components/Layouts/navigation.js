import React from 'react'
import { Menu, Tooltip, Icon, Modal } from 'antd'
import cls from './styles/scss/navigation.scss'
import { in_array, parseBool } from '../../containers/Layouts/function';

const MenuItem = Menu.Item
const SubMenu = Menu.SubMenu
const confirm = Modal.confirm

const setMenuList = (icon_name, menu_name) => {
    return (
        <span>
            <span className={`${icon_name} fa-2x`} />
        </span>
    )
}

const handleNewLayer = () => {
    confirm({
        title: 'กรุณายืนยันการปิดหน้านี้ เพื่อไปหน้าสร้างเลย์เอาท์ใหม่',
        content: (
            <article>
                <p>โปรดตรวจสอบการบันทึกข้อมูล ก่อนออกจากหน้าปัจจุบันเพื่อป้องกันข้อมูลศูนย์หาย</p>
                <p>กรณึต้องการออกจากหน้าปัจจุบันโปรดกด OK</p>
            </article>
        ),
        onOk: () => { window.location.reload() },
        onCancel: () => {}
    })
}

const handleLogOut = () => {
    confirm({
        title: 'กรุณายืนยันการออกจากระบบเลย์เอาท์',
        content: (
            <article>
                <p>โปรดตรวจสอบการบันทึกข้อมูล ก่อนออกจากหน้าปัจจุบันเพื่อป้องกันข้อมูลศูนย์หาย</p>
                <p>กรณึต้องการออกจากระบบ โปรดกด OK</p>
            </article>
        ),
        onOk: () => { window.location.href = 'http://tc001pcis1p/login/' },
        onCancel: () => {}
    })
}


const Navigation = ({ authen, tester, visible, preview, mktProfile, mktLockInfo, tableInfo, activeSideno, navableState, configData, handleDrag, handleCollapse, handleSummaryCollapse, handleLockLayout, handleSaveLayout, localStorageRead, handlePreviewLayout }) => 
(
    <Menu mode="horizontal" selectable={false} className={`${cls['menu_layout']} ${(visible) ? cls['dn']:cls['db']}`}>
        {/* Forward */}
        <SubMenu 
            key="1" 
            title={setMenuList('ti-menu', 'เมนู')} 
            className={`${cls['menu_layout']}`}
        >
            <MenuItem key="1">
                <a href="#" onClick={handleNewLayer}><Icon type="file" /> สร้างหน้าใหม่</a>
            </MenuItem>
            <MenuItem key="2">
                <a href="#" onClick={handleLogOut}><Icon type="logout" /> ออกจากระบบ</a>
            </MenuItem>
        </SubMenu>

        <MenuItem className={`${cls['menu_layout']}`} disabled={(!_.isEmpty(mktLockInfo.data[0]) && mktLockInfo.data[0].IsLock == 'Y') ? true : false}>
            <Tooltip placement="right" title={'สร้างพื้นที่เปล่า'}>
                <span 
                    id="create_street" 
                    className={`ti-layout-sidebar-none fa-2x`} 
                    draggable={`${(!_.isEmpty(mktLockInfo.data[0]) && mktLockInfo.data[0].IsLock == 'Y') ? 'false':'true'}`} 
                    onDragStart={handleDrag} 
                />
            </Tooltip>
        </MenuItem>

        <MenuItem className={`${cls['menu_layout']} ${cls['dn']}`}>
            <span className={`ti-trash fa-2x`} />
        </MenuItem>

        <MenuItem className={`${cls['menu_layout']}`} disabled={true}>
            <span className={`ti-back-left fa-2x`} />
        </MenuItem>

        <MenuItem className={`${cls['menu_layout']}`} disabled={true}>
            <span className={`ti-back-right fa-2x`} />
        </MenuItem>

        {/* Center */}
        <MenuItem className={`${cls['menu_layout']} ${cls['nav_details']} ${(visible) ? cls['dn']:cls['db']}`} style={{ pointerEvents: 'none' }}>
            { marketDetail(localStorageRead, tableInfo, activeSideno, configData, mktProfile) }
        </MenuItem>

        {/* Backward */}
        <MenuItem className={`${cls['menu_layout']} ${cls['fr']} ${(navableState.collapse) ? cls['sideClose']:cls['sideOpen']} ${(preview) ? cls['dn']:cls['db']}`}>     
            <Tooltip placement="bottomLeft" title={`${(navableState.collapse) ? 'เปิดแท็บเครื่องมือเสริม':'ปิดแท็บเครื่องมือเสริม'}`}>        
                <span className={`ti-shift-left fa-2x`} onClick={handleCollapse} />
            </Tooltip>
        </MenuItem> 
       
        <MenuItem className={`${cls['menu_layout']} ${cls['fr']} ${(preview) ? cls['dn']:cls['db']}`}>
            <Tooltip placement="bottom" title={'สรุปข้อมูลเลย์เอาท์'}>
                <span className={`ti-pie-chart fa-2x`} onClick={handleSummaryCollapse} />
            </Tooltip>
        </MenuItem>

        <MenuItem className={`${cls['menu_layout']} ${cls['fr']} ${(preview) ? cls['dn']:cls['db']}`}>
            <Tooltip placement="bottom" title={'แสดงเลย์เอาท์ทั้งหมด'}>
                <span className={`ti-eye fa-2x`} onClick={handlePreviewLayout} />
            </Tooltip>
        </MenuItem>

        <MenuItem className={`${cls['menu_layout']} ${cls['fr']} ${(preview) ? cls['dn']:cls['db']}`} disabled={(!_.isEmpty(mktLockInfo.data[0]) && mktLockInfo.data[0].IsLock == 'Y') ? true : false}>
            <Tooltip placement="bottom" title={'บันทึกข้อมูล'}>
                <span className={`ti-save fa-2x`} onClick={handleSaveLayout} />
            </Tooltip>
        </MenuItem>

        {
           (authen && authen.Auth && in_array(authen.Auth.EmployeeCode, tester.data)) &&
            (
               <MenuItem className={`${cls['menu_layout']} ${cls['fr']} ${(preview) ? cls['dn']:cls['db']} `}>
                   {   
                       (!_.isEmpty(mktLockInfo) && parseBool(mktLockInfo.status)) ? 
                       (
                           (!_.isEmpty(mktLockInfo.data[0]) && mktLockInfo.data[0].IsLock == 'Y') ? 
                           (
                               <Tooltip placement="bottom" title={'ปลดล็อคเลย์เอาท์'} onClick={handleLockLayout.bind(this, configData.lockConfig.unlock)}>
                                   <span className={`ti-key fa`}  />
                                   <span className={`ti-lock fa-2x`} />
                               </Tooltip>
                           ) 
                           : 
                           ( 
                               <Tooltip placement="bottom" title={'ล็อคเลย์เอาท์'}>
                                   <span className={`ti-lock fa-2x`} onClick={handleLockLayout.bind(this, configData.lockConfig.lock)} />
                               </Tooltip>
                           )
                       ) : (<div />)
                   }                    
               </MenuItem>
           ) 
        }

    </Menu>
)

const marketDetail = (localStorageRead, table_info, active_sideno, configData, mktProfile) => {
    let market_detail = (!_.isEmpty(mktProfile) && parseBool(mktProfile.status)) ? { market_info: mktProfile.data[0] } : localStorageRead('nanolayout_creation', 'info')
    if(!market_detail) {return} 

    let mkt_name  = (market_detail && market_detail.market_info) ? market_detail.market_info.MarketName:null
    let mkt_type  = (market_detail && market_detail.market_info) ? market_detail.market_info.MarketType:null
    let brn_name  = (market_detail && market_detail.market_info) ? market_detail.market_info.BranchName:null
    let zone_name = (market_detail && market_detail.market_info) ? market_detail.market_info.ZoneText:null
    let cell_change = (table_info && table_info.adds !== '') ? table_info.adds:null    
    let side_name = configData.tblTH[active_sideno]

    return (
        <div className={cls['menu_detail_container']}>
            <div className={cls['menu_detail_header']}>
                {brn_name}&nbsp;
                <Tooltip placement="bottomLeft" title={`${(mkt_type && mkt_type !== '') ? mkt_type:''}`}><u>{mkt_name}</u></Tooltip>&nbsp;
                ({zone_name})
            </div>
            <div className={cls['menu_detail_footer']}>
                ({side_name}) แผงทั้งหมด {table_info.total} แผง &nbsp;
                { (cell_change && cell_change !== '') ? `( ${cell_change} แถว)`:'' }
            </div>
        </div>
    )
}

export default Navigation