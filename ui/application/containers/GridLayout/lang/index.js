import React from 'react'
import { Icon } from 'antd'
import { instant_config } from '../config/instant'
import { withCookies, Cookies } from 'react-cookie'

const { screen_config } = instant_config

const cookies = new Cookies()
const cookieData = cookies.get('authen_info', { path: '/' })
const sess_data = (cookieData) ? cookieData.Session : null
const auth_data = (cookieData) ? cookieData.Auth : null

const user_info_en = {
    empcode: (auth_data && auth_data.EmployeeCode) ? auth_data.EmployeeCode : '00000',
    name: (auth_data && auth_data.EmpName_EN) ? auth_data.EmpName_EN.toString().replace('+', ' ') : 'Unknow',
    branch: (auth_data && auth_data.BaseBranchName) ? ( (auth_data.BaseBranchCode == '000') ? 'Head Office' : auth_data.BaseBranchName ) : 'Unknow',
    period: (auth_data && auth_data.StartWork) ? auth_data.StartWork : '0.0.00'
}

const user_info_th = {
    empcode: (auth_data && auth_data.EmployeeCode) ? auth_data.EmployeeCode : '00000',
    name: (auth_data && auth_data.EmpName_TH) ? auth_data.EmpName_TH.toString().replace('+', ' ') : 'Unknow',
    branch: (auth_data && auth_data.BaseBranchName) ? auth_data.BaseBranchName : 'Unknow',
    period: (auth_data && auth_data.StartWork) ? auth_data.StartWork : '0.0.00'
}

// LANGUAGE DEFINITION
let lang_config = { 
    en: {
        menu: {
            side_enable: 'OPEN SIDEBAR'
        },
        sidebar: {
            main: 'MARKET LAYOUT',
            camange: 'NANO MANGEMENT DASHBOARD',
            dashboard: 'DASHBOARD',
            sidebar_expand: 'SIDEBAR EXPEND',
            sidebar_collapsed: 'SIDEBAR COLLAPSED',
            sidebar_hidden: 'SIDEBAR HIDDEN',
            problem: 'REPORT THE PROBLEM',
            setting: 'SETTING'
        },
        popper: {
            profile: {
                title: 'PROFILE INFORMATION',
                notice: 'Under maintenance'
            }
        },
        grid: {
            default: {
                panel_title: 'Filter Criteria',
                pagelabel_length: 'Show',
                pagelabel_entries: 'entries',
                pagelabel_entroll: (start, to, total) => `Showing ${start} to ${to} of ${total} entries`,
                search_button: 'Search',
                clear_button: 'Clear',
                tree_select: { all: 'Select All' },
                footer: {
                    page_title: 'Total :',
                    total_title: 'Grand Total :'
                }
            },
            market: {
                title: 'NANO MARKET MANAGEMENT',
                chartpoper: {
                    title: 'MARKET PERFORMANCE',
                    desc: 'Please wait for loading data...'
                },
                filters: {  
                    register_field: {           
                        start_register: 'START',
                        end_register: 'END'
                    },
                    region_field: { placeholder_label: 'Please select region' },
                    area_field: { placeholder_label: 'Please select area' },
                    branch_field: { placeholder_label: 'Please select branch' },
                    calist_field: { placeholder_label: 'Please select ca' },
                    customer_field: { placeholder_label: 'Please enter name' },
                    optional_field: { placeholder_label: 'More options' },
                    location: { label: 'Location' }
                },
                columns: {}
            },
            customer: {
                title: 'NANO CUSTOMER GRID',
                filters: {  
                    register_field: {           
                        start_register: 'START',
                        end_register: 'END'
                    },
                    calist_field: { placeholder_label: 'Please select ca' },
                    customer_field: { placeholder_label: 'Please enter name' },
                    appno_field: { placeholder_label: 'Please enter appno' },
                    optional_field: { placeholder_label: 'More options' },
                    location: { label: 'Location' }
                },
                columns: {
                    tooltip: {
                        product: 'Business Product',
                        assigned: 'Cell Assignmented'
                    },
                    field: {
                        product: { 'M': 'Micro', 'N': 'Nano' },
                        assigned: { 'Y': 'Assignment completed', 'N': 'Not assignment' }
                    }
                },
                tools: {
                    btn: { back: 'Previous page' }
                }
            },
            camange: {
                title: 'NANO MANAGEMENT DASHBOARD',
                filters: {  
                    register_field: {           
                        start_register: 'START',
                        end_register: 'END'
                    },
                    region_field: { placeholder_label: 'Please select region' },
                    area_field: { placeholder_label: 'Please select area' },
                    branch_field: { placeholder_label: 'Please select branch' },
                    calist_field: { placeholder_label: 'Please select ca' },
                    customer_field: { placeholder_label: 'Please enter name' },
                    appno_field: { placeholder_label: 'Please enter appno' }
                    
                },
                columns: {},
                tooltip: {
                    tools: {
                        print: 'Print'
                    }
                }
            }
        },
        progress: {
            auth: 'Please wait, authenication checking...',
            loading: 'Loading data, Please wait...',
            expired: 'The authenication has expired...',
            success: 'Verify data successfully'
        },
        notification: {
            unavailable: {
                title: 'This function is not available yet',
                desc: 'Since the development and prepareation of data if the system is able to do so, be aware again'
            },
            timeout: {
                title: 'Notification System',
                desc: 'Error loading information. Please reload again'
            }
        },
        user: {
            name: `${user_info_en.name}`,
            desc: `${user_info_en.branch} (Period ${user_info_en.period})`,
            image: `http://172.17.9.94/newservices/LBServices.svc/employee/image/${user_info_en.empcode}`
        }
    }, 
    th: {
        menu: {
            side_enable: 'เปิดแถบด้านข้าง'
        },
        sidebar: {
            main: 'บริหารจัดการตลาด',
            camange: 'บริหารจัดการข้อมูลลูกค้า',
            dashboard: 'แสดงสรุปรายงาน',
            sidebar_expand: 'ขยายแถบด้านข้าง',
            sidebar_collapsed: 'ลดแถบด้านข้าง',
            sidebar_hidden: 'ซ่อนแถบด้านข้าง',
            problem: 'แจ้งปัญหาการใช้งาน',
            setting: 'ตั้งค่า'
        },
        popper: {
            profile: {
                title: 'รายละเอียดข้อมูลพนักงาน',
                notice: 'อยู่ระหว่างปรับปรุง'
            }
        },
        grid: {
            default: {
                panel_title: 'ค้นหาข้อมูลตามเงื่อนไข',
                pagelabel_length: 'แสดง',
                pagelabel_entries: 'รายการ',
                pagelabel_entroll: (start, to, total) => `กำลังแสดง ${start} ถึง ${to} จาก ${total} รายการ`,
                search_button: 'ค้นหาข้อมูล',
                clear_button: 'ล้างข้อมูล',
                tree_select: { all: 'เลือกทั้งหมด' },
                footer: {
                    page_title: 'รวม',
                    total_title: 'รวมทั้งหมด'
                }
            },
            market: {
                title: 'NANO MARKET MANAGEMENT',
                chartpoper: {
                    title: 'MARKET PERFORMANCE',
                    desc: 'โปรดรอระบบกำลังโหลดข้อมูล...'
                },
                filters: {
                    register_field: {           
                        start_register: 'เริ่มต้น',
                        end_register: 'สิ้นสุด'
                    },
                    region_field: { placeholder_label: 'โปรดเลือกภาค' },
                    area_field: { placeholder_label: 'โปรดเลือกพื้นที่' },
                    branch_field: { placeholder_label: 'โปรดเลือกสาขา' },
                    calist_field: { placeholder_label: 'โปรดเลือกพนักงาน' },
                    customer_field: { placeholder_label: 'โปรดระบุชื่อ' },
                    optional_field: { placeholder_label: 'ตัวเลือกข้อมูลเพิ่มเติม' },
                    location: { label: 'ค้นหาทำเล' }
                },
                columns: {}
            },
            customer: {
                title: 'NANO CUSTOMER GRID',
                filters: {
                    register_field: {           
                        start_register: 'เริ่มต้น',
                        end_register: 'สิ้นสุด'
                    },
                    calist_field: { placeholder_label: 'โปรดเลือกพนักงาน' },
                    customer_field: { placeholder_label: 'โปรดระบุชื่อ' },
                    appno_field: { placeholder_label: 'โปรดระบุหมายเลขแอพฯ' },
                    optional_field: { placeholder_label: 'ตัวเลือกข้อมูลเพิ่มเติม' },
                    location: { label: 'ค้นหาทำเล' }
                },
                columns: {
                    tooltip: {
                        product: 'ประเภทสินเชื่อ',
                        assigned: 'เพิ่มข้อมูลลูกค้าลงในพื้นที่ตลาด(เลย์เอาท์)'
                    },
                    field: {
                        product: { 'M': 'Micro', 'N': 'Nano' },
                        assigned: { 'Y': 'เพิ่มข้อมูลลูกค้าลงในพื้นที่ตลาดสำเร็จ', 'N': 'ยังไม่ได้เพิ่มข้อมูลลูกค้าลงในพื้นที่ตลาด' }
                    }
                },
                tools: {
                    btn: { back: 'ย้อนกลับก่อนหน้านี้' }
                }
            },
            camange: {
                title: 'NANO MANAGEMENT DASHBOARD',
                filters: {  
                    register_field: {           
                        start_register: 'เริ่มต้น',
                        end_register: 'สิ้นสุด'
                    },
                    region_field: { placeholder_label: 'โปรดเลือกภาค' },
                    area_field: { placeholder_label: 'โปรดเลือกพื้นที่' },
                    branch_field: { placeholder_label: 'โปรดเลือกสาขา' },
                    calist_field: { placeholder_label: 'โปรดเลือกพนักงาน' },
                    customer_field: { placeholder_label: 'โปรดระบุชื่อ' },
                    appno_field: { placeholder_label: 'โปรดระบุหมายเลขแอพฯ' }                    
                },
                columns: {},
                tooltip: {
                    tools: {
                        print: 'ปริ๊นเอกสาร'
                    }
                }
            }
        },
        progress: {
            auth: 'กำลังตรวจสอบสิทธิในการใช้งานระบบ',
            loading: 'กำลังโหลดข้อมูล กรุณารอสักครู่...',
            expired: 'สิทธิในการใช้งานระบบหมดอายุ...',
            success: 'ตรวจสอบข้อมูลสำเร็จ'
        },
        notification: {
            unavailable: {
                title: 'ฟังก์ชั่นนี้ยังไม่พร้อมให้ใช้งาน',
                desc: 'เนื่องจากอยู่ระหว่างการพัฒนาและเตรียมความพร้อมของข้อมูล หากระบบสามารถดำเนินการได้จะแจ้งให้ทราบอีกครั้ง'
            },
            timeout: {
                title: 'ข้อความจากระบบ',
                desc: 'เกิดข้อผิดพลาดในการโหลดข้อมูลจากระบบ กรุณากดโหลดใหม่อีกครั้ง (กด Submit ในแท็บเครื่องมือค้นหาข้อมูลตามเงือนไข)'
            }
        },
        user: {
            name: `${user_info_th.name}`,
            desc: `${user_info_th.branch} (ประสบการณ์ ${user_info_th.period})`,
            image: `http://172.17.9.94/newservices/LBServices.svc/employee/image/${user_info_th.empcode}`
        }
    } 
}

// NOTIFICATION DEFINITION
let lang_notification_config = { en: {}, th: {} }

// AUTOMATIC SETUP SCREEN CONFIG
lang_notification_config.en[screen_config] = {
    message: 'Notification System',
    description: 'Nano layout system will automatically setup the screen from recent usage.',
    icon: <Icon type="setting fa-spin" style={{ color: '#108ee9' }} />,
    placement: 'bottomRight'
}

lang_notification_config.th[screen_config] = {
    message: 'ข้อความจากระบบ',
    description: 'ระบบนาโนเลย์เอาท์จะตั้งค่าการอัตโนมัติตามการใช้งานหน้าล่าสุด',
    icon: <Icon type="setting fa-spin" style={{ color: '#108ee9' }} />,
    placement: 'bottomRight'
}

export const lang = lang_config
export const lang_notification = lang_notification_config
