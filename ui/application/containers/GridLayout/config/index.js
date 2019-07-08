import React from 'react'
import { Cookies } from 'react-cookie'
import { instant_config } from './instant'
import { lang, lang_notification } from '../lang'
import { in_array } from '../layouts/function'
import moment from 'moment'
import _ from 'lodash'

const cookies = new Cookies()
const cookieData = cookies.get('authen_info', { path: '/' })
const auth_data = (cookieData) ? cookieData.Auth : null

let handle_menu = {
    dashboard: true,
    market: true,
    management: true
}

if(auth_data && !_.isEmpty(auth_data.PositionCode)) {
    if(in_array(auth_data.PositionCode.toUpperCase(), ['CA', 'PCA'])) {
        handle_menu.market = false
    }
}

export const configAccessHeader = (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type', 'x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Charset', 'UTF-8');
    next();
}

// CONFIGURATION DEFINITION
export const config = {
    database: {
        production: {
            server: '',
            database: '',
            user: '',
            password: '',
            connectionTimeout: 50000,
            parseJSON: true,
            option: { encrypt: false }
        }
    },
    cookies_config: {
        path: '/',
        name: {
            authen: 'authen_info',
            visible: 'visible',
            market: 'market',
            lang: 'lang'
        },
        expires: new Date(moment().add(3, 'month')),
        expire_mth: new Date(moment().add(1, 'month'))
    },
    lang,
    lang_enable: ['en', 'th'],   
    lang_instant: instant_config,
    month: {
        fullname_digit: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortname_digit: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        digit: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    },
    sidebarActiveDefault: 0,
    sidebarMenu: [
        { key: 'dashboard', icon: 'pie-chart', disable: !handle_menu.dashboard, hide: false }, 
        { key: 'main', icon: 'shop', disable: !handle_menu.market, hide: false },
        { key: 'camange', icon: 'user', disable: !handle_menu.management, hide: false },
        { key: 'problem', icon: 'mail', disable: true, hide: true }, 
        { key: 'setting', icon: 'setting', disable: true, hide: true }
    ],
    tester: ['57251', '56225', '57170','59151','58202', '56367'],
    version: {
        name: (process.env && process.env.NODE_ENV == 'dev') ? 'Alpha' : 'Beta',
        code: '1.3.0'
    }
}

// NOTIFICATION DEFINITION
export const notifig = (topic_type, lang_type = 'en') => {
    const { screen_config } = config.lang_instant

    if(topic_type) {        
        switch(topic_type) {
            case screen_config:
                return lang_notification[lang_type][screen_config]
            break
        }
    } else {
        return undefined
    }

}