import React from 'react'
import { Popover } from 'antd'
import cls from '../../GridLayout/style/grid_market.scss'

export const columns = [
    {
        title: 'Date',
        dataIndex: 'CreateDate',
        key: 'CreateDate',
        className: 'tc',
        width: 45
    },
    {
        title: 'Subject',
        dataIndex: 'Subject',
        key: 'Subject',
        width: 120
    },
    {
        title: 'Note',
        dataIndex: 'Remark',
        key: 'Remark',
    }
]

export const note_columns = [
    {
        title: 'Date',
        dataIndex: 'CreateDate',
        key: 'CreateDate',
        className: 'ttu tc',
        width: 55
    },
    {
        title: 'Name',
        dataIndex: 'CreateBy',
        key: 'CreateBy',
        className: `ttu tl ${cls['custname_ellipsis']}`,
        width: 80,
        render: (str) => {
            return (<Popover content={str} placement="top">{`${(str && str !== '') ? str : ''}`}</Popover>)
        }
    },
    {
        title: (<div className="ttu tc">Note</div>),
        dataIndex: 'Remark',
        key: 'Remark'
    }
]