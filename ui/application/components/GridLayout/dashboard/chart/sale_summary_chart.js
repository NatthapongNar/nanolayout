import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Layout, Icon, Tooltip, Popover, Card, Timeline, Table } from 'antd';
import {
    Sector,
    Cell,
    PieChart,
    Pie,
    Tooltip as Tooltips,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Brush,
    CartesianGrid,
    CartesianAxis,
    Legend,
    Area,
    Line,
    Scatter,
    ComposedChart,
    ReferenceDot,
    Text,
    AreaChart,
    linearGradient,
    ResponsiveContainer
} from 'recharts'
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { roundFixed, strFloat } from '../../../../containers/Layouts/function'

import FontAwesome from 'react-fontawesome'
import moment from 'moment'

import styles from './index.scss'

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, ...custom } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 5) * cos;
    const sy = cy + (outerRadius + 5) * sin;
    const mx = cx + (outerRadius + 10) * cos;
    const my = cy + (outerRadius + 10) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 3}
                outerRadius={outerRadius + 5}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + 3 + (cos >= 0 ? 1 : -1)} y={ey} textAnchor={textAnchor} fill="white" style={{ fontSize: '11px', fill: '#134973' }}  >
                {`${parseFloat(custom.Share).toFixed(2)} %`}
            </text>
        </g>
    );
}

const CustomizeLabelPerformance = props => {
    const { x, y, stroke, value, index, data, ...custom } = props
    const date = new Date()
    const month = moment(new Date(date.getFullYear(), index, 1)).format('MMM')

    return <text x={x} y={y - 5} {...custom}>{`${parseFloat(data[month]).toFixed(0) > 0 ? parseFloat(data[month]).toFixed(0) + '%' : ''}`}</text>
}

class NewVolumnePerformanceTooltip extends Component {
    render() {
        const { active, payload } = this.props

        if (active) {
            const { payload, label, coordinate } = this.props

            return (
                <div key={`${label}_${coordinate.x}_${coordinate.y}`} className={styles['custom-tooltip']}>
                    {
                        payload[2] &&
                        <div className={styles['color-dot-container']}>
                            <span className={styles['color-dot-border']} style={{ backgroundColor: payload[2].color }}></span>
                            <span>Target {`${payload[2].value}`}</span>
                        </div>
                    }
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[0].color }}></span>
                        <span>Nano {`${payload[0].value}`}</span>
                    </div>
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[1].color }}></span>
                        <span>Micro {`${payload[1].value}`}</span>
                    </div>
                </div>
            )
        }
        else {
            return <div></div>
        }
    }
}

class DailyCustAtOperTooltip extends Component {
    render() {
        const { active, payload } = this.props
        if (active) {
            const { payload, label, coordinate } = this.props
            return (
                <div key={`${label}_${coordinate.x}_${coordinate.y}`} className={styles['custom-tooltip']}>
                    <span>Date {`${payload[0].payload.day} (${payload[0].payload.date})`}</span>
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[1].color }}></span>
                        <span>Confirm {`${payload[1].value}`}</span>
                    </div>
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[0].color }}></span>
                        <span>App at Oper {`${payload[0].value}`}</span>
                    </div>
                </div>
            )
        }
        else {
            return <div></div>
        }
    }
}

class ProductivityTooltip extends Component {
    render() {
        const { active, payload } = this.props
        if (active) {
            const { payload, label, coordinate } = this.props
            return (

                <div key={`${label}_${coordinate.x}_${coordinate.y}`} className={styles['custom-tooltip']}>
                    <div className={styles['color-dot-container']}>
                        <span>{`${payload[0].payload.text} (CA HC ${payload[0].payload.TotalEmp})`}</span>
                    </div>
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[1].color }}></span>
                        <span>{`Br. ${payload[1].value} MB`}</span>
                    </div>
                    <div className={styles['color-dot-container']}>
                        <span className={styles['color-dot-border']} style={{ backgroundColor: payload[0].color }}></span>
                        <span>{`CA ${payload[0].value} MB`}</span>
                    </div>
                </div>
            )
        }
        else {
            return <div></div>
        }
    }
}

class SaleSummaryChart extends Component {
    getHeaderTitle = (props) => {
        const { item, ON_CLOSE_MARKER, custom_width } = props

        if (item.MarketCode) {
            return (
                <div className={styles['headers']}>
                    <FontAwesome className="trigger" name='dollar' />
                    <span>
                        {`(${item.MarketCode}) ${item.MarketName} (${item.BranchType})`}
                    </span>
                    <Icon
                        onClick={() => ON_CLOSE_MARKER()}
                        className="trigger"
                        type='close' />
                </div>
            )
        }
        else {
            if (item.TM_Name) {
                return (
                    <div className={styles['headers']}>
                        {
                            <div className={styles['ca-imgs']}>
                                <Popover placement="left" content={
                                    <div className={styles['marker-tm-picture']}>
                                        <img className={styles['ca-big-img']} src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${item.TM_Code}`} />
                                        <span>{`${item.TM_Name}`} {`(${item.TM_NickName})`}</span>
                                        <span>{`${item.work_date_format}`}</span>
                                        <span>{`${item.TM_Tel}`}</span>
                                    </div>
                                } >
                                    <img src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${item.TM_Code}`} />
                                </Popover>
                            </div>
                        }
                        <span className={styles['title-img']}>
                            {`${item.BranchName}`}
                        </span>
                        <Icon
                            onClick={() => ON_CLOSE_MARKER()}
                            className="trigger"
                            type='close' />
                    </div>
                )
            }
            else {
                if (this.props.type) {
                    const { ca_code, ca_name, ca_nickname, work_date_format } = this.props.type
                    return (
                        <div className={styles['headers']}>
                            {
                                <div className={styles['ca-imgs']}>
                                    <Popover placement="left" content={
                                        <div className={styles['marker-tm-picture']}>
                                            <img className={styles['ca-big-img']} src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${ca_code}`} />
                                            <span>{`${ca_name}`} {`(${ca_nickname})`}</span>
                                            <span>{`${work_date_format}`}</span>
                                        </div>
                                    } >
                                        <img src={`http://172.17.9.94/newservices/LBServices.svc/employee/image/${ca_code}`} />
                                    </Popover>
                                </div>
                            }
                            <span className={styles['title-img']}>
                                {
                                    `${ca_name} (${work_date_format})`
                                }
                            </span>
                            <Icon
                                onClick={() => ON_CLOSE_MARKER()}
                                className="trigger"
                                type='close' />
                        </div>
                    )
                }
                else {
                    return (
                        <div className={styles['headers']}>
                            <FontAwesome className="trigger" name='line-chart' />
                            <span>Sale Summary</span>
                            <Icon
                                onClick={() => ON_CLOSE_MARKER()}
                                className="trigger"
                                type='close' />
                        </div>
                    )
                }
            }
        }
    }

    getDailyAppOper = data => {
        const today = new Date()
        const dayInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

        let result = []
        for (let i = 1; i <= dayInMonth; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), i)
            const day = date.getDay()
            const isWeekends = (day == 0 || day == 6 ? true : false)

            if (!isWeekends) {
                result.push({
                    date: moment(date).format('ddd'),
                    day: i,
                    cust: data[0][_.padStart(i, 2, '0')],
                    confirm: data[1][_.padStart(i, 2, '0')]
                })
            }
        }

        return result
    }

    numberWithCommas = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    render() {
        const { item, ON_CLOSE_MARKER, custom_width } = this.props

        const colors = scaleOrdinal(schemeCategory10).range()

        const { SALE_SUMMARY_CHART } = item
        let NEW_VOLUME_PERFORMANCE = []
        let APP_ON_HAND_BEFORE_OPER = []
        let MICRO_SHARE = []
        let DAILY_APP_AT_OPER = []
        let DAILY_APP_AT_OPER_CONFIRM = []
        let PRODUCTIVITY_LINE = []
        let PRODUCTIVITY_TABLE = []
        let MAX_VOLUME_PERFORMANCE = []
        let start_work_date, work_date_format

        if (!_.isEmpty(SALE_SUMMARY_CHART) && SALE_SUMMARY_CHART.length > 1) {

            NEW_VOLUME_PERFORMANCE = SALE_SUMMARY_CHART[1]           
            /*
            APP_ON_HAND_BEFORE_OPER = SALE_SUMMARY_CHART[2]
            MICRO_SHARE = [
                {
                    name: 'Micro',
                    value: SALE_SUMMARY_CHART[3][1].TotalAVG,
                    ach: SALE_SUMMARY_CHART[3][1].TotalAVG,
                    color: '#03a694',
                    Vol: SALE_SUMMARY_CHART[3][1].TotalVol,
                    Cust: SALE_SUMMARY_CHART[3][1].TotalUnit,
                    Share: SALE_SUMMARY_CHART[3][2].TotalAVG
                },
                {
                    name: 'Nano', value: SALE_SUMMARY_CHART[3][0].TotalAVG,
                    ach: SALE_SUMMARY_CHART[3][0].TotalAVG,
                    color: '#023852',
                    Vol: SALE_SUMMARY_CHART[3][0].TotalVol,
                    Cust: SALE_SUMMARY_CHART[3][0].TotalUnit,
                    Share: parseFloat(100 - SALE_SUMMARY_CHART[3][2].TotalAVG).toFixed(2)
                }
            ]           

            DAILY_APP_AT_OPER = this.getDailyAppOper(SALE_SUMMARY_CHART[4])
            DAILY_APP_AT_OPER_CONFIRM = SALE_SUMMARY_CHART[5]
            PRODUCTIVITY_LINE = SALE_SUMMARY_CHART[6]
            PRODUCTIVITY_TABLE = SALE_SUMMARY_CHART[7]
             */

            MAX_VOLUME_PERFORMANCE = parseInt(Math.ceil((strFloat(NEW_VOLUME_PERFORMANCE[1].Max) + strFloat(NEW_VOLUME_PERFORMANCE[2].Max)) < strFloat(NEW_VOLUME_PERFORMANCE[0].Max) ? strFloat(NEW_VOLUME_PERFORMANCE[0].Max) : (strFloat(NEW_VOLUME_PERFORMANCE[1].Max) + strFloat(NEW_VOLUME_PERFORMANCE[2].Max))).toFixed(0));
            MAX_VOLUME_PERFORMANCE = _.max([strFloat(NEW_VOLUME_PERFORMANCE[0].Jan), strFloat(NEW_VOLUME_PERFORMANCE[0].Feb), strFloat(NEW_VOLUME_PERFORMANCE[0].Mar), strFloat(NEW_VOLUME_PERFORMANCE[0].Apr), strFloat(NEW_VOLUME_PERFORMANCE[0].May), strFloat(NEW_VOLUME_PERFORMANCE[0].Jun), strFloat(NEW_VOLUME_PERFORMANCE[0].Jul), strFloat(NEW_VOLUME_PERFORMANCE[0].Aug), strFloat(NEW_VOLUME_PERFORMANCE[0].Sep), strFloat(NEW_VOLUME_PERFORMANCE[0].Oct), strFloat(NEW_VOLUME_PERFORMANCE[0].Nov), strFloat(NEW_VOLUME_PERFORMANCE[0].Dec)]);//MAX_VOLUME_PERFORMANCE % 2 == 0 ? MAX_VOLUME_PERFORMANCE + 2 : MAX_VOLUME_PERFORMANCE + 1;

            /*
            if (!item.MarketCode) {
                start_work_date = !_.isEmpty(item.TM_WorkPeriod) ? moment.duration(moment(new Date()).diff(moment(item.TM_WorkPeriod)))._data : ''
                work_date_format = `Work Period : ${start_work_date.years}.${start_work_date.months}.${start_work_date.days}`
            }
            */
        }

        if (!_.isEmpty(SALE_SUMMARY_CHART) && SALE_SUMMARY_CHART.length > 1) {

            let objData = [
                { name: 'J', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Jan), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Jan), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Jan), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'F', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Feb), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Feb), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Feb), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'M', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Mar), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Mar), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Mar), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'A', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Apr), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Apr), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Apr), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'M', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].May), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].May), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].May), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'J', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Jun), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Jun), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Jun), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'J', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Jul), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Jul), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Jul), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'A', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Aug), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Aug), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Aug), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'S', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Sep), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Sep), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Sep), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'O', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Oct), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Oct), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Oct), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'N', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Nov), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Nov), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Nov), Max: strFloat(MAX_VOLUME_PERFORMANCE) },
                { name: 'D', MicroTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[2].Dec), NanoTotalAct: strFloat(NEW_VOLUME_PERFORMANCE[1].Dec), TotalTarget: strFloat(NEW_VOLUME_PERFORMANCE[0].Dec), Max: strFloat(MAX_VOLUME_PERFORMANCE) }
            ];

            return (
                
                    <div className={styles['chart-container']}>
                        <div>
                            <span>New Volumne Performance</span>
                        </div>
                        <div>
                            <ComposedChart
                                width={290}
                                height={245}
                                data={objData}
                                margin={{ top: 15, right: 5, bottom: -13, left: -30 }}>
                                <XAxis dataKey="name" tickLine={false} axisLine={true} style={{ fontSize: '9px' }} />
                                <YAxis domain={['dataMin', MAX_VOLUME_PERFORMANCE]} />
                                <Tooltips content={<NewVolumnePerformanceTooltip />} />
                                <Bar dataKey='NanoTotalAct' barSize={15} stackId="a" fill='#023852' />
                                <Bar dataKey="MicroTotalAct" barSize={15} stackId="a" fill="#03a694" label={<CustomizeLabelPerformance data={NEW_VOLUME_PERFORMANCE[3]} style={{ fontSize: '9px' }} />}
                            />
                            { !item.MarketCode && (<Line type='monotone' dataKey='TotalTarget' stroke='#f24738' dot={false} />) }
                            </ComposedChart>
                        </div>
                    </div>
        
            )

            /*
            return (
                <Layout style={{ width: custom_width ? custom_width : '610px', overflow: 'hidden' }}>
                    { this.getHeaderTitle(this.props) }
                    <Layout style={{ backgroundColor: '#FFF', margin: '10px 10px 5px 10px', backgroundColor: '#f0f2f5' }}>
                        <div style={{ marginLeft: '-5px', marginRight: '-5px', backgroundColor: '#f0f2f5' }}>
                            <div className={styles['chart-row']}>
                                <div className={styles['chart-container']} style={{ width: '310px', height: '270px', marginTop: '0px' }}>
                                    <div>
                                        <span>New Volumne Performance</span>
                                    </div>
                                    <div>
                                        <ComposedChart width={290} height={245} data={[
                                            { name: 'J', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Jan, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Jan, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Jan, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'F', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Feb, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Feb, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Feb, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'M', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Mar, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Mar, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Mar, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'A', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Apr, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Apr, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Apr, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'M', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].May, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].May, TotalTarget: NEW_VOLUME_PERFORMANCE[0].May, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'J', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Jun, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Jun, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Jun, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'J', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Jul, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Jul, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Jul, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'A', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Aug, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Aug, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Aug, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'S', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Sep, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Sep, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Sep, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'O', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Oct, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Oct, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Oct, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'N', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Nov, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Nov, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Nov, Max: MAX_VOLUME_PERFORMANCE },
                                            { name: 'D', MicroTotalAct: NEW_VOLUME_PERFORMANCE[2].Dec, NanoTotalAct: NEW_VOLUME_PERFORMANCE[1].Dec, TotalTarget: NEW_VOLUME_PERFORMANCE[0].Dec, Max: MAX_VOLUME_PERFORMANCE }

                                        ]}
                                            margin={{ top: 15, right: 5, bottom: -13, left: -30 }}>
                                            <XAxis dataKey="name" tickLine={false} axisLine={true} style={{ fontSize: '9px' }} />
                                            <YAxis domain={['dataMin', MAX_VOLUME_PERFORMANCE]} />
                                            <Tooltips content={<NewVolumnePerformanceTooltip />} />
                                            <Bar dataKey='NanoTotalAct' barSize={15} stackId="a" fill='#023852' />
                                            <Bar dataKey="MicroTotalAct" barSize={15} stackId="a" fill="#03a694" label={<CustomizeLabelPerformance data={NEW_VOLUME_PERFORMANCE[3]} style={{ fontSize: '9px' }} />} />
                                            {
                                                !item.MarketCode &&
                                                <Line type='monotone' dataKey='TotalTarget' stroke='#f24738' dot={false} />
                                            }
                                        </ComposedChart>
                                    </div>
                                </div>
                                <div>
                                    <Timeline>
                                        <Timeline.Item style={{ paddingBottom: '0px' }} className={styles['no-padding-bottom-chart']}>
                                            <div className={styles['chart-container']} style={{ width: '258px', height: '105px', marginLeft: '-6px', marginTop: '3px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <span>% of Micro Share</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                                    <div>
                                                        <PieChart
                                                            width={100}
                                                            height={150}
                                                            margin={{ top: -15, right: 0, bottom: 0, left: -10 }}>
                                                            <Pie
                                                                data={MICRO_SHARE}
                                                                startAngle={450}
                                                                endAngle={-90}
                                                                innerRadius={0}
                                                                activeIndex={0}>
                                                                {
                                                                    MICRO_SHARE.map((entry, index) => <Cell fill={entry.color} />)
                                                                }
                                                            </Pie>
                                                        </PieChart>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {
                                                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px', justifyContent: 'center' }}>
                                                                {
                                                                    MICRO_SHARE.map(
                                                                        (item, index) =>
                                                                            <div className={styles['color-dot-container']}>
                                                                                <span className={styles['color-dot']} style={{ backgroundColor: item.color }}></span>
                                                                                <span>{`${item.name} ${item.Share}% `}</span>
                                                                                <span style={{ marginLeft: '14px' }}>{`(Vol. ${item.Vol} Cust ${item.Cust})`}</span>
                                                                                {index != MICRO_SHARE.length - 1 && <hr style={{ border: '0', borderTop: '1px solid #9c9c9c52' }} />}
                                                                            </div>
                                                                    )
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </Timeline.Item>
                                        <Timeline.Item style={{ paddingBottom: '0px' }} className={styles['no-padding-bottom-chart']}>
                                            <div className={styles['chart-container']} style={{ width: '258px', height: '160', marginLeft: '-6px', marginTop: '3px' }}>
                                                <div style={{ border: '1px solid #024959' }}>
                                                    <div style={{ backgroundColor: '#024959', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
                                                        {
                                                            !this.props.type &&
                                                            < div className={styles['color-dot-container']}>
                                                                <span className={styles['color-dot-border']} style={{ backgroundColor: '#f24738' }}></span>
                                                            </div>
                                                        }
                                                        <span>{!this.props.type ? `CA Productivity (YTD) : ${this.numberWithCommas(parseInt(PRODUCTIVITY_LINE[0].YTD))}` : `Top 5 Market`}</span>
                                                    </div>
                                                    <div>
                                                        <div>
                                                            {
                                                                !this.props.type ?
                                                                    <ComposedChart width={240} height={130} data={[
                                                                        { name: 'J', text: 'Jan', ca: PRODUCTIVITY_LINE[1].Jan, br: PRODUCTIVITY_LINE[0].Jan, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'F', text: 'Feb', ca: PRODUCTIVITY_LINE[1].Feb, br: PRODUCTIVITY_LINE[0].Feb, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'M', text: 'Mar', ca: PRODUCTIVITY_LINE[1].Mar, br: PRODUCTIVITY_LINE[0].Mar, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'A', text: 'Apr', ca: PRODUCTIVITY_LINE[1].Apr, br: PRODUCTIVITY_LINE[0].Apr, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'M', text: 'May', ca: PRODUCTIVITY_LINE[1].May, br: PRODUCTIVITY_LINE[0].May, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'J', text: 'Jun', ca: PRODUCTIVITY_LINE[1].Jun, br: PRODUCTIVITY_LINE[0].Jun, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'J', text: 'Jul', ca: PRODUCTIVITY_LINE[1].Jul, br: PRODUCTIVITY_LINE[0].Jul, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'A', text: 'Aug', ca: PRODUCTIVITY_LINE[1].Aug, br: PRODUCTIVITY_LINE[0].Aug, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'S', text: 'Sep', ca: PRODUCTIVITY_LINE[1].Sep, br: PRODUCTIVITY_LINE[0].Sep, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'O', text: 'Oct', ca: PRODUCTIVITY_LINE[1].Oct, br: PRODUCTIVITY_LINE[0].Oct, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'N', text: 'Nov', ca: PRODUCTIVITY_LINE[1].Nov, br: PRODUCTIVITY_LINE[0].Nov, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp },
                                                                        { name: 'D', text: 'Dec', ca: PRODUCTIVITY_LINE[1].Dec, br: PRODUCTIVITY_LINE[0].Dec, TotalEmp: PRODUCTIVITY_LINE[0].TotalEmp }

                                                                    ]}
                                                                        margin={{ left: -33, right: 0, top: 10, bottom: -10 }}>
                                                                        <XAxis dataKey="name" tickLine={false} style={{ fontSize: '9px' }} />
                                                                        <YAxis />
                                                                        <Tooltips content={<ProductivityTooltip />} />
                                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                                        <Line type='monotone' dataKey='ca' stroke='#f24738' />
                                                                        <Line type='monotone' dataKey='br' stroke='#023852' />
                                                                    </ComposedChart>
                                                                    :
                                                                    <Table columns={[{
                                                                        title: 'MarketName',
                                                                        className: `${styles['align-left']} ${styles['xsm-padding']} ${styles['vertical-bottom']}`,
                                                                        dataIndex: 'MarketName',
                                                                        key: 'MarketName',
                                                                        width: '46%',
                                                                        render: (text, record, index) => {
                                                                            return (
                                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <Tooltip title={text} placement="left" >
                                                                                        <span className={styles['text-ellipsis']}>{text}</span>
                                                                                    </Tooltip>
                                                                                </div>
                                                                            )
                                                                        }
                                                                    }, {
                                                                        title: 'OS',
                                                                        className: `${styles['align-right']} ${styles['xsm-padding']} ${styles['vertical-bottom']}`,
                                                                        dataIndex: 'OS',
                                                                        key: 'OS',
                                                                        width: '20%',
                                                                        render: (text, record, index) => {
                                                                            return <span>{text}</span>
                                                                        }
                                                                    }, {
                                                                        title: 'Cust',
                                                                        className: `${styles['align-right']} ${styles['xsm-padding']} ${styles['vertical-bottom']}`,
                                                                        dataIndex: 'Cus',
                                                                        key: 'Cus',
                                                                        width: '17%',
                                                                        render: (text, record, index) => {
                                                                            return <span>{parseFloat(text).toFixed(0)}</span>
                                                                        }
                                                                    }, {
                                                                        title: '%',
                                                                        className: `${styles['align-right']} ${styles['xsm-padding']} ${styles['vertical-bottom']}`,
                                                                        dataIndex: 'Ach',
                                                                        key: 'Ach',
                                                                        width: '17%',
                                                                        render: (text, record, index) => {
                                                                            return <span>{parseFloat(text).toFixed(0)}%</span>
                                                                        }
                                                                    }]} dataSource={PRODUCTIVITY_TABLE}
                                                                        pagination={false}
                                                                        size='small'
                                                                        className={styles['summary-table']}
                                                                        style={{ width: '100%', fontSize: '8px' }} />
                                                            }
                                                        </div>                                                       
                                                    </div>
                                                </div>
                                            </div>
                                        </Timeline.Item>
                                    </Timeline>
                                </div>
                            </div>
                            <div className={styles['chart-row']}>
                                <div className={styles['chart-container']} style={{ width: '170px', height: '165px' }}>
                                    <div>
                                        <span>App On Hand (Before Oper)</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                        <Table columns={[{
                                            title: 'Type',
                                            className: `${styles['align-left']} ${styles['sm-paddingss']} ${styles['vertical-bottom']}`,
                                            dataIndex: 'GroupName',
                                            key: 'GroupName',
                                            width: '25%',
                                            render: (text, record, index) => {
                                                return <span>{text}</span>
                                            }
                                        }, {
                                            title: 'Vol.',
                                            className: `${styles['align-right']} ${styles['sm-paddingss']} ${styles['vertical-bottom']}`,
                                            dataIndex: 'CreditAmount',
                                            key: 'CreditAmount',
                                            width: '27%',
                                            render: (text, record, index) => {
                                                return <span>{text}</span>
                                            }
                                        }, {
                                            title: 'App',
                                            className: `${styles['align-right']} ${styles['sm-paddingss']} ${styles['vertical-bottom']}`,
                                            dataIndex: 'TotalAcc',
                                            key: 'TotalAcc',
                                            width: '24%',
                                            render: (text, record, index) => {
                                                return <span>{text}</span>
                                            }
                                        }, {
                                            title: '%',
                                            className: `${styles['align-right']} ${styles['sm-paddingss']} ${styles['vertical-bottom']}`,
                                            dataIndex: 'AccAch',
                                            key: 'AccAch',
                                            width: '24%',
                                            render: (text, record, index) => {
                                                return <span>{parseFloat(text).toFixed(0)}%</span>
                                            }
                                        }]} dataSource={APP_ON_HAND_BEFORE_OPER}
                                            pagination={false}
                                            size='small'
                                            className={styles['summary-table-sale']}
                                            style={{ width: '100%', height: '125px', fontSize: '8px' }} />
                                    </div>
                                </div>
                                <div className={styles['chart-container']}>
                                    <div style={{ textAlign: 'left', paddingRight: '10px' }}>
                                        <span>Daily App at Oper (Total {DAILY_APP_AT_OPER_CONFIRM[1].AllCus} App)</span>
                                    </div>
                                    <div className={styles['app-daily-overlay']}>
                                        <div>
                                            <span>Confirm</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[1].TotalCus} App</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[1].TotalAmt}</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[1].TotalCusAch}%</span>
                                        </div>
                                        <div>
                                            <span>Return</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[0].TotalCus} App</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[0].TotalAmt}</span>
                                            <span>{DAILY_APP_AT_OPER_CONFIRM[0].TotalCusAch}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <ComposedChart width={400} height={105} data={DAILY_APP_AT_OPER}
                                            margin={{ top: 0, right: 0, bottom: 2, left: 0 }}>
                                            <XAxis hide={true} dataKey="day" tickLine={false} axisLine={true} style={{ fontSize: '9px' }} />
                                            <YAxis hide={true} />
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Tooltips content={<DailyCustAtOperTooltip />} />
                                            <Bar dataKey='cust' barSize={10} stackId="a" fill='#08415a' />
                                            <Line type='monotone' dataKey='confirm' stroke='#a72c0d' dot={false} />
                                        </ComposedChart>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Layout>
                </Layout >
            )
            */
        }
        else {
            return null
        }
    }
}

export default connect(
    (state) => ({
    }), {
    })(SaleSummaryChart)