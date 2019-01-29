import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Layout, Icon, Tooltip, Popover, Card } from 'antd';
import {
    Sector,
    Cell,
    PieChart,
    Pie as Pies,
    Tooltip as Tooltips,
    BarChart,
    Bar as Bars,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Area,
    Line as Lines,
    Scatter,
    ComposedChart,
    ReferenceDot,
    Text,
    AreaChart,
    linearGradient
} from 'recharts'
import { Doughnut, HorizontalBar, Bar, Pie, Line } from 'react-chartjs-2'
import FontAwesome from 'react-fontawesome'
import moment from 'moment'

import styles from './index.scss'

const NotAxisTickButLabel = props => {
    return (<text x={props.x} y={props.y} dy={3} fontFamily="Kanit" fontSize="11px" textAnchor="end" fill={"#565656"}>{props.payload.value}</text>)
}

const CustomizedDot = props => {
    const { cx, cy, tickSize, ...custom } = props

    return (<path d={`M${cx},${cy}L${cx - tickSize},${cy - tickSize}L${cx + tickSize},${cy - tickSize}Z`} {...custom} />)
}

const CustomizeLabel = props => {
    const { x, y, stroke, value, index, dataItem, ...custom } = props

    return <text x={x} y={y} dy={-10} {...custom}>{`${parseFloat(dataItem[index].TotalAmtAch).toFixed(1)}%`}</text>
}

const CustomizeDay = props => {
    const { x, y, stroke, value, index, dataItem, ...custom } = props

    if (dataItem[index].value == '1') {
        if (dataItem[index].name == 'พฤ') {
            return <g>
                <rect x={x - 11} y={y} width="22" height="10" fill="#b3b3b3"></rect>
                <text x={x - 8} y={y + 7}>{`${dataItem[index].name}`}</text>
            </g>
        }
        else {
            return <g>
                <rect x={x - 6} y={y} width="13" height="10" fill="#b3b3b3"></rect>
                <text x={x - 4} y={y + 7}>{`${dataItem[index].name}`}</text>
            </g>
        }
    }
    else {
        if (dataItem[index].name == 'พฤ') {
            return <text x={x - 8} y={y + 7}>{`${dataItem[index].name}`}</text>
        }
        else {
            return <text x={x - 4} y={y + 7}>{`${dataItem[index].name}`}</text>
        }
    }
}

const CustomizeLabelCurve = props => {
    const { x, y, stroke, value, index, dataItem, ...custom } = props

    let category = ""
    let mx = x, my = y

    switch (index) {
        case 4:
            category = 'NPL'
            mx -= 12
            break;
        case 3:
            category = 'M1-2'
            mx += 5
            break;
        case 2:
            category = 'X Day'
            mx += 5
            break;
        case 1:
            category = 'W3-4'
            mx += 5
            break;
        case 0:
            category = 'W1-2'
            mx += 12
            break;
    }

    return <text x={mx} y={my} {...custom}><tspan x={mx} y={my - 12}>{`${category}`}</tspan><tspan x={mx} y={my - 1}>{`< ${value}%`}</tspan></text>
}


const RenderPathStackBar = (x, y, width, height, fill) => {
    return <path d={`M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height}  Z`} stroke="none" fill={fill} />
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, ...custom }) => {

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (custom.name != 'DPD') {
        return (
            <g>
                <text x={x - 8} y={y - 12} fill="white" style={{ fontSize: '12px', fill: '#134973' }} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${custom.payload.act} Cust`}
                </text>
                <text x={x - 8} y={y} fill="white" style={{ fontSize: '12px', fill: '#134973' }} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                    {`${custom.payload.TotalAmt}`}
                </text>
            </g>
        )
    }
}

const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
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
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
}

const GaugeChart = (props) => {

    const { data, colorData } = props

    const width = 155;
    const height = 117;
    const chartValue = 100//data.FirstPinAch;

    const activeSectorIndex = colorData.map((cur, index, arr) => {
        const curMax = [...arr]
            .splice(0, index + 1)
            .reduce((a, b) => ({ value: a.value + b.value }))
            .value;
        return (chartValue > (curMax - cur.value)) && (chartValue <= curMax);
    })
        .findIndex(cur => cur);

    const sumValues = colorData
        .map(cur => cur.value)
        .reduce((a, b) => a + b);

    const max = _.maxBy(colorData, 'max').max

    const arrowData = [
        { value: data.FirstPinAch < 0 ? 0 : data.FirstPinAch * 100 / max },
        { value: 0 },
        { value: 100 - (data.FirstPinAch * 100 / max) }
    ];

    const arrowData2 = [
        { value: data.SecondPinAch < 0 ? 0 : data.SecondPinAch * 100 / max },
        { value: 0 },
        { value: 100 - (data.SecondPinAch * 100 / max) }
    ];

    const pieProps = {
        startAngle: 225,
        endAngle: -45,
        cy: height - 25
    };

    const pieRadius = {
        innerRadius: (width) * 0.35,
        outerRadius: (width) * 0.4
    };

    const Arrow = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const mx = cx + (outerRadius + width * 0.03) * cos;
        const my = cy + (outerRadius + width * 0.03) * sin;
        return (
            <g>
                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="4" stroke="#000" fill="none" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={width * 0.05} fill="#666" stroke="none" />
            </g>
        );
    };

    const Arrow2 = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const mx = (cx) + ((outerRadius - 15) + width * 0.03) * cos;
        const my = (cy) + ((outerRadius - 15) + width * 0.03) * sin;
        return (
            <g>
                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="4" stroke="#ff7300" fill="none" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={width * 0.05} fill="#666" />
            </g>
        );
    };

    const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => { //eslint-disable-line react/no-multi-comp
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius * 1.2}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <PieChart width={width} height={height} margin={{ top: -30, right: 0, left: -10, bottom: 0 }}>
            <Pies
                activeIndex={activeSectorIndex}
                data={colorData}
                dataKey="value"
                innerRadius={(width) * 0.23}
                { ...pieProps }
                strokeWidth={0}>
                {
                    colorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorData[index].color} />
                    ))
                }
            </Pies>
            <Pies
                name="needle_1"
                dataKey="value"
                stroke="none"
                activeIndex={1}
                activeShape={Arrow}
                data={arrowData}
                outerRadius={pieRadius.innerRadius}
                fill="none"
                { ...pieProps }
            />
            <Pies
                name="needle_2"
                dataKey="value"
                stroke="none"
                activeIndex={1}
                activeShape={Arrow2}
                data={arrowData2}
                outerRadius={pieRadius.innerRadius}
                fill="none"
                { ...pieProps }
            />
            <Tooltips content={<CollectionMovementTooltip />} />
        </PieChart>
    );
}

const GaugeChart1Needle = (props) => {

    const { data, colorData } = props

    const width = 155;
    const height = 117;
    const chartValue = 100//data.FirstPinAch;

    const activeSectorIndex = colorData.map((cur, index, arr) => {
        const curMax = [...arr]
            .splice(0, index + 1)
            .reduce((a, b) => ({ value: a.value + b.value }))
            .value;
        return (chartValue > (curMax - cur.value)) && (chartValue <= curMax);
    })
        .findIndex(cur => cur);

    const sumValues = colorData
        .map(cur => cur.value)
        .reduce((a, b) => a + b);

    const arrowData = [
        { value: data.RankAch < 0 ? 0 : data.RankAch },
        { value: 0 },
        { value: sumValues - (data.RankAch < 0 ? 0 : data.RankAch) }
    ];

    const pieProps = {
        startAngle: 225,
        endAngle: -45,
        cy: height - 25
    };

    const pieRadius = {
        innerRadius: (width) * 0.35,
        outerRadius: (width) * 0.4
    };

    const Arrow = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const mx = cx + ((outerRadius - 15) + width * 0.03) * cos;
        const my = cy + ((outerRadius - 15) + width * 0.03) * sin;
        return (
            <g>
                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="4" stroke="#000" fill="none" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={width * 0.05} fill="#666" stroke="none" />
            </g>
        );
    };

    const Arrow2 = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const mx = cx + (outerRadius + width * 0.03) * cos;
        const my = cy + (outerRadius + width * 0.03) * sin;
        return (
            <g>
                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="4" stroke="#ff7300" fill="none" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={width * 0.05} fill="#666" />
            </g>
        );
    };

    const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => { //eslint-disable-line react/no-multi-comp
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius * 1.2}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <PieChart width={width} height={height} margin={{ top: -30, right: 0, left: -10, bottom: 0 }}>
            <Pies
                activeIndex={activeSectorIndex}
                data={colorData}
                dataKey="value"
                innerRadius={(width) * 0.23}
                { ...pieProps }
                strokeWidth={0}>
                {
                    colorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorData[index].color} />
                    ))
                }
            </Pies>
            <Pies
                stroke="none"
                dataKey="value"
                activeIndex={1}
                activeShape={Arrow}
                data={arrowData}
                outerRadius={pieRadius.innerRadius}
                fill="none"
                { ...pieProps }
            />
        </PieChart>
    );
}

class PortfolioChart extends Component {

    render() {
        const { item } = this.props

        let height_top_frame = 185 //175

        return (
            <Layout style={{ width: '650px', overflow: 'hidden' }}>

                <Layout style={{ backgroundColor: '#FFF', padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#f0f2f5' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '0px' }}>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '200px', height: `${height_top_frame}px`, padding: '5px' }}>
                            <div>
                                <span className={styles['header-other-chart']}>Collection Movement Trend</span>
                            </div>
                            <div id="my-chart" style={{ flex: '1', width: '100%', height: '100px' }}>
                                <ComposedChart 
                                    layout="vertical" 
                                    width={188} 
                                    height={142}
                                    margin={{ top: 5, right: 15, left: -20, bottom: 0 }}
                                    nameKey="name"
                                    dataKey="name"
                                    data={
                                        [
                                            { name: 'NPL', red: item.PORTFOLIO_QUALITY_CHART[0][0].RankR, yellow: item.PORTFOLIO_QUALITY_CHART[0][0].RankY, green: item.PORTFOLIO_QUALITY_CHART[0][0].RankG, actual: item.PORTFOLIO_QUALITY_CHART[0][0].RankAch },
                                            { name: 'M1-2', red: item.PORTFOLIO_QUALITY_CHART[0][1].RankR, yellow: item.PORTFOLIO_QUALITY_CHART[0][1].RankY, green: item.PORTFOLIO_QUALITY_CHART[0][1].RankG, actual: item.PORTFOLIO_QUALITY_CHART[0][1].RankAch },
                                            { name: 'X Day', red: item.PORTFOLIO_QUALITY_CHART[0][2].RankR, yellow: item.PORTFOLIO_QUALITY_CHART[0][2].RankY, green: item.PORTFOLIO_QUALITY_CHART[0][2].RankG, actual: item.PORTFOLIO_QUALITY_CHART[0][2].RankAch },
                                            { name: 'W3-4', red: item.PORTFOLIO_QUALITY_CHART[0][3].RankR, yellow: item.PORTFOLIO_QUALITY_CHART[0][3].RankY, green: item.PORTFOLIO_QUALITY_CHART[0][3].RankG, actual: item.PORTFOLIO_QUALITY_CHART[0][3].RankAch },
                                            { name: 'W1-2', red: item.PORTFOLIO_QUALITY_CHART[0][4].RankR, yellow: item.PORTFOLIO_QUALITY_CHART[0][4].RankY, green: item.PORTFOLIO_QUALITY_CHART[0][4].RankG, actual: item.PORTFOLIO_QUALITY_CHART[0][4].RankAch }
                                        ]
                                    }                                   
                                >
                                    <XAxis type="number" hide={true} padding={{ left: 7 }} />
                                    <YAxis dataKey="name" type="category" tick={<NotAxisTickButLabel />} tickLine={false} axisLine={false} />
                                    <Bars dataKey="green" barSize={12} stackId="a" fill="#65bb02" />
                                    <Bars dataKey="yellow" stackId="a" fill="#ffc925" />
                                    <Bars dataKey="red" stackId="a" fill="#f51100" />
                                    <Lines
                                        dataKey='actual'
                                        stroke='#ff7300'
                                        label={<CustomizeLabel fontSize={10} dataItem={item.PORTFOLIO_QUALITY_CHART[0]} style={{ fill: '#0d64a9', fontWeight: '600' }} textAnchor="middle" />}
                                        dot={<CustomizedDot tickSize={8} fill="#2196f3" stroke="#1672bc" />} 
                                        activeDot={false} 
                                        stroke={'none'}
                                    />
                                </ComposedChart>
                            </div>
                        </div>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '210px', height: `${height_top_frame}px`, padding: '5px' }}>
                            <div>
                                <span className={styles['header-other-chart']}>
                                    % of Current (W0-W2 >90%)
                                    <div>
                                    {
                                        `Total OS ${(item.PORTFOLIO_QUALITY_CHART[1] && item.PORTFOLIO_QUALITY_CHART[1][0]) ? item.PORTFOLIO_QUALITY_CHART[1][0].AllAmt : 0 }Mb 
                                        (${(item.PORTFOLIO_QUALITY_CHART[1] && item.PORTFOLIO_QUALITY_CHART[1][0]) ? item.PORTFOLIO_QUALITY_CHART[1][0].AllAct : 0} Cust.)`
                                    }
                                    </div>
                                </span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px' }}>
                                <CurrentPieChart
                                    data={item.PORTFOLIO_QUALITY_CHART[1][0].TotalAch}
                                    act={item.PORTFOLIO_QUALITY_CHART[1][0].TotalAct}
                                    unit={item.PORTFOLIO_QUALITY_CHART[1][0].TotalAmtAch}
                                    TotalAmt={item.PORTFOLIO_QUALITY_CHART[1][0].TotalAmt}
                                />
                            </div>
                        </div>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '220px', height: `${height_top_frame}px`, padding: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span className={styles['header-other-chart']}>WkCycle Due / PMT Succ.</span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px' }}>
                                <BarChart 
                                    width={208} 
                                    height={117} 
                                    data={
                                        [
                                            { name: 'จ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Mon, color: '#f7d827' },
                                            { name: 'อ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Tue, color: '#ef3ecf' },
                                            { name: 'พ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Wed, color: '#17b21e' },
                                            { name: 'พฤ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Thu, color: '#d64713' },
                                            { name: 'ศ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Fri, color: '#12c0e8' }
                                        ]
                                    }
                                    margin={{ top: 0, right: 0, left: -30, bottom: -15 }}>
                
                                    <XAxis dataKey="name" tick={{ style: { fontSize: '11px' } }} />
                                    <YAxis dataKey="value" tick={{ style: { fontSize: '10px' } }} domain={[0, 'dataMax']} />
                                    <Tooltip />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Bars 
                                        dataKey="value" 
                                        label={{ position: 'insideBottom', fill: '#000', style: { fontSize: '11px', fontWeight: 'bold' } }} 
                                    >
                                        {
                                            [
                                                { name: 'จ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Mon, color: '#f7d827' },
                                                { name: 'อ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Tue, color: '#ef3ecf' },
                                                { name: 'พ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Wed, color: '#17b21e' },
                                                { name: 'พฤ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Thu, color: '#d64713' },
                                                { name: 'ศ', value: item.PORTFOLIO_QUALITY_CHART[2][0].Fri, color: '#12c0e8' }
                                            ]
                                            .map((item, index) => {
                                                return <Cell key={`cell-${index}`} fill={item.color} />
                                            })
                                        }
                                    </Bars>
                                </BarChart>                                
                            </div>
                            <div style={{ fontSize: '.8em', color: '#445761', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0px' }}>
                                <span style={{ display: 'block', width: '23%', textAlign: 'center', color: `${parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { GroupName: 0 }).GroupName) >= 90 ? '#69c300' : '#445761'}` }}>Succ. {`${(item.PORTFOLIO_QUALITY_CHART[2][1] || { GroupName: 0 }).GroupName}%`}</span>
                                {
                                    [
                                        { name: 'จ', IsHilight: item.PORTFOLIO_QUALITY_CHART[2][2].Mon, value: parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { Mon: 0 }).Mon), color: '#f7d827' },
                                        { name: 'อ', IsHilight: item.PORTFOLIO_QUALITY_CHART[2][2].Tue, value: parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { Tue: 0 }).Tue), color: '#ef3ecf' },
                                        { name: 'พ', IsHilight: item.PORTFOLIO_QUALITY_CHART[2][2].Wed, value: parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { Wed: 0 }).Wed), color: '#17b21e' },
                                        { name: 'พฤ', IsHilight: item.PORTFOLIO_QUALITY_CHART[2][2].Thu, value: parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { Thu: 0 }).Thu), color: '#d64713' },
                                        { name: 'ศ', IsHilight: item.PORTFOLIO_QUALITY_CHART[2][2].Fri, value: parseInt((item.PORTFOLIO_QUALITY_CHART[2][1] || { Fri: 0 }).Fri), color: '#12c0e8' }
                                    ].map((item, index) => {

                                        let config = {
                                            width: '25%',
                                            color: `${item.value >= 90 ? '#69c300' : '#445761'}`,
                                            position: 'relative',
                                            display: 'grid'
                                        }

                                        let configH = {}

                                        if (item.IsHilight == '1') {
                                            configH = {
                                                width: '25px',
                                                height: '25px',
                                                background: '#ececec',
                                                position: 'absolute',
                                                top: '-5px',
                                                left: '-2px',
                                                right: '0',
                                                marginLeft: 'auto',
                                                marginRight: 'auto',
                                                borderRadius: '50%',
                                                border: `1px solid ${item.color}`,
                                                zIndex: '1'
                                            }
                                        }

                                        return <span
                                            key={`${(index+1)}`}
                                            style={config}>
                                            <p style={{ zIndex: '2', textAlign: 'center' }}>{`${item.value}%`}</p>
                                            <i style={configH}></i>
                                        </span>
                                    })
                                }                               
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '10px' }}>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '157', height: '160px', padding: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span className={styles['header-other-chart']}>%Flow Rate 0 MDPD</span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px', position: 'relative' }}>
                                <GaugeChart 
                                    data={item.PORTFOLIO_QUALITY_CHART[4][0]} 
                                    colorData={
                                        [
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][0].RankG, // span 140 to 190
                                                color: '#65bb02',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][0].MaxG
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][0].RankY, // span 40 to 140
                                                color: '#ffc925',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][0].MaxY
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][0].RankR, // Meaning span is 0 to 40
                                                color: '#f51100',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][0].MaxR
                                            }
                                        ]
                                    }
                                />
                                <div className={styles['gauge-value']}>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][0].MinRank}%</span>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][0].MaxRank}%</span>
                                </div>
                                <div className={styles['gauge-percent']}>
                                    <span>{parseFloat(item.PORTFOLIO_QUALITY_CHART[4][0].FirstPinAch).toFixed(1)}%</span>
                                    <span>F {parseFloat(item.PORTFOLIO_QUALITY_CHART[4][0].SecondPinAch).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '157', height: '160px', padding: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span className={styles['header-other-chart']}>%Flow Rate 1-30 MDPD</span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px', position: 'relative' }}>
                                <GaugeChart 
                                    data={item.PORTFOLIO_QUALITY_CHART[4][1]} 
                                    colorData={
                                        [
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][1].RankG, // span 140 to 190
                                                color: '#65bb02',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][1].MaxG
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][1].RankY, // span 40 to 140
                                                color: '#ffc925',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][1].MaxY
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][1].RankR, // Meaning span is 0 to 40
                                                color: '#f51100',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][1].MaxR
                                            }
                                        ]
                                    } 
                                />
                                <div className={styles['gauge-value']}>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][1].MinRank}%</span>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][1].MaxRank}%</span>
                                </div>
                                <div className={styles['gauge-percent']}>
                                    <span>{parseFloat(item.PORTFOLIO_QUALITY_CHART[4][1].FirstPinAch).toFixed(1)}%</span>
                                    <span>F {parseFloat(item.PORTFOLIO_QUALITY_CHART[4][1].SecondPinAch).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '157', height: '160px', padding: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span className={styles['header-other-chart']}>%Flow Rate 31-60 MDPD</span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px', position: 'relative' }}>
                                <GaugeChart 
                                    data={item.PORTFOLIO_QUALITY_CHART[4][2]} 
                                    colorData={
                                        [
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][2].RankG, // Meaning span is 0 to 40
                                                color: '#65bb02',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][2].MaxG
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][2].RankY, // span 40 to 140
                                                color: '#ffc925',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][2].MaxY
                                            }, 
                                            {
                                                value: item.PORTFOLIO_QUALITY_CHART[4][2].RankR, // span 140 to 190
                                                color: '#f51100',
                                                max: item.PORTFOLIO_QUALITY_CHART[4][2].MaxR
                                            }
                                        ]
                                    }
                                />
                                <div className={styles['gauge-value']}>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][2].MinRank}%</span>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[4][2].MaxRank}%</span>
                                </div>
                                <div className={styles['gauge-percent']}>
                                    <span>{parseFloat(item.PORTFOLIO_QUALITY_CHART[4][2].FirstPinAch).toFixed(1)}%</span>
                                    <span>F {parseFloat(item.PORTFOLIO_QUALITY_CHART[4][2].SecondPinAch).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles['bg-chart']} style={{ display: 'flex', flexDirection: 'column', width: '157', height: '160px', padding: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                <span className={styles['header-other-chart']}>%0 WDPD of New Cust.</span>
                            </div>
                            <div style={{ flex: '1', width: '100%', height: '100px', position: 'relative' }}>
                                <GaugeChart1Needle 
                                    data={item.PORTFOLIO_QUALITY_CHART[5][0]} 
                                    colorData={
                                        [
                                            {
                                                value: 99, // Meaning span is 0 to 40
                                                color: '#f51100'
                                            }, 
                                            {
                                                value: 1, // Meaning span is 0 to 40
                                                color: '#65bb02'
                                            }
                                        ]
                                    } 
                                />
                                <div className={styles['gauge-value']}>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[5][0].MinRank}%</span>
                                    <span>{item.PORTFOLIO_QUALITY_CHART[5][0].MaxRank}%</span>
                                </div>
                                <div className={styles['gauge-percents']}>
                                    <span>{parseFloat(item.PORTFOLIO_QUALITY_CHART[5][0].RankAch).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <div className={styles['bg-chart']} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '598px',
                            height: '60px',
                            marginLeft: '-10px',
                            padding: '0',
                            border: 'none',
                            backgroundColor: 'rgba(255,255,255,0)'
                        }}>
                            <div id="my-chart" style={{ flex: '1', width: '100%', height: '100px' }}>
                                <AreaChart
                                    margin={{ top: 12, left: 5, bottom: 5, right: 5 }}
                                    width={658}
                                    height={72}
                                    data={
                                        [
                                            {
                                                type: 'W1-2',
                                                target: item.PORTFOLIO_QUALITY_CHART[6][0]["W1-2"],
                                                actual: item.PORTFOLIO_QUALITY_CHART[6][1]["W1-2"],
                                            }, {
                                                type: 'W3-4',
                                                target: item.PORTFOLIO_QUALITY_CHART[6][0]["W3-4"],
                                                actual: item.PORTFOLIO_QUALITY_CHART[6][1]["W3-4"],
                                            }, {
                                                type: 'X Day',
                                                target: item.PORTFOLIO_QUALITY_CHART[6][0]["X day"],
                                                actual: item.PORTFOLIO_QUALITY_CHART[6][1]["X day"],
                                            }, {
                                                type: 'M1-2',
                                                target: item.PORTFOLIO_QUALITY_CHART[6][0]["M1-2"],
                                                actual: item.PORTFOLIO_QUALITY_CHART[6][1]["M1-2"],
                                            },
                                            {
                                                type: 'NPL',
                                                target: item.PORTFOLIO_QUALITY_CHART[6][0]["NPL"],
                                                actual: item.PORTFOLIO_QUALITY_CHART[6][1]["NPL"],
                                            }
                                        ]
                                    }
                                >
                                    <defs>
                                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#ea9e2e" stopOpacity={0.5} />
                                        </linearGradient>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#03a9f4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#0786bf" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis hide />
                                    <YAxis type="number" domain={['auto', 4]} hide />
                                    <Area type='monotone' dataKey='actual' stroke='#03a9f4' fill="url(#colorActual)" dot={<CustomizedCurveDot />} />
                                    <Area type='monotone' dataKey='target' stroke='#FF9800'
                                        fill="url(#colorTarget)"
                                        label={<CustomizeLabelCurve fontSize={11} dataItem={item.PORTFOLIO_QUALITY_CHART[6][0]} style={{ fill: '#565656', fontWeight: '600' }} textAnchor="middle" />}
                                        strokeDasharray="5 5" />
                                    <Tooltips content={<CurveTooltip />} />
                                </AreaChart>
                            </div>
                        </div>
                    </div>
                </Layout>
            </Layout>
        )
    }
}

class CurrentPieChart extends Component {

    render() {
        const data = [{
            name: 'W0',
            value: parseFloat(parseFloat(this.props.data).toFixed(0)),
            act: parseFloat(this.props.act).toFixed(1),
            TotalAmt: this.props.TotalAmt
        }, {
            name: 'DPD',
            value: parseFloat(parseFloat(100 - this.props.data).toFixed(0)),
            act: parseFloat(this.props.act).toFixed(1),
            TotalAmt: this.props.TotalAmt
        }]

        const renderActiveShape = (props) => {
            const RADIAN = Math.PI / 180;
            const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, ...custom } = props
            const sin = Math.sin(-RADIAN * midAngle)
            const cos = Math.cos(-RADIAN * midAngle)
            const sx = cx + (outerRadius + 5) * cos
            const sy = cy + (outerRadius + 5) * sin
            const mx = cx + (outerRadius + 10) * cos
            const my = cy + (outerRadius + 10) * sin
            const ex = mx + (cos >= 0 ? 1 : -1) * 12
            const ey = my
            const textAnchor = cos >= 0 ? 'start' : 'end'

            return (
                <g>
                    <text x={cx} y={cy - 4} dy={8} textAnchor="middle" fontFamily="Kanit" fontSize="13px" style={{ fontWeight: 'bold' }} fill={'#0a67b1'}>{parseFloat(this.props.unit).toFixed(0)}%</text>
                    <Sector
                        cx={cx}
                        cy={cy}
                        innerRadius={innerRadius}
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
                        innerRadius={outerRadius + 5}
                        outerRadius={outerRadius + 7}
                        fill={fill}
                    />
                    <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                    <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                    <text x={ex + (cos >= 0 ? 1 : -1)} y={ey - 4} textAnchor={textAnchor} fill="white" style={{ fontSize: '11px', fill: '#134973' }}  >
                        {`${parseInt(custom.act)} Cust`}
                    </text>
                    <text x={ex + (cos >= 0 ? 1 : -1) - 7} y={ey + 14} textAnchor={textAnchor} style={{ fontSize: '11px', fill: '#134973' }} >
                        {`${custom.TotalAmt}`}
                    </text>
                </g>
            );
        }

        return (
            <PieChart 
                width={198} height={142} 
                margin={{ top: 10, right: 40, left: 0, bottom: 12 }}
            >
                <Pies
                    data={data}
                    dataKey="value"
                    labelLine={false}
                    startAngle={450}
                    endAngle={-90}
                    innerRadius={20}
                    activeIndex={0}
                    activeShape={renderActiveShape}>
                    {
                        data.map((entry, index) => <Cell key={`current_${(index+1)}`} fill={['#607d8b', '#795548'][index % 2]} />)
                    }
                </Pies>
            </PieChart>
        )
    }
}

class CollectionMovementTooltip extends Component {
    render() {
        const { active, payload } = this.props
        if (active) {
            const { payload, label, coordinate } = this.props
            return <div key={`${label}_${coordinate.x}_${coordinate.y}`} className={styles['custom-tooltip']}>{payload[0].payload.max}%</div>
        }
        else {
            return <div></div>
        }
    }
}

class CurveTooltip extends Component {
    render() {
        const { active, payload } = this.props
        if (active) {
            const { payload, label, coordinate } = this.props
            return <div key={`${label}_${coordinate.x}_${coordinate.y}`} className={styles['custom-tooltip']}>Actual {payload[0].payload.actual}%</div>
        }
        else {
            return <div></div>
        }
    }
}

class CustomizedCurveDot extends Component {
    render() {
        const { cx, cy, stroke, payload, value } = this.props;
        let sx = cx

        if (payload.type == 'W1-2') {
            sx += 45
        }

        if (payload.actual > payload.target) {
            return (
                <svg x={sx - 27} y={cy - 10} width={15} height={15} fill="red" viewBox="0 0 1024 1024">
                    <path d="M517.12 53.248q95.232 0 179.2 36.352t145.92 98.304 98.304 145.92 36.352 179.2-36.352 179.2-98.304 145.92-145.92 98.304-179.2 36.352-179.2-36.352-145.92-98.304-98.304-145.92-36.352-179.2 36.352-179.2 98.304-145.92 145.92-98.304 179.2-36.352zM663.552 261.12q-15.36 0-28.16 6.656t-23.04 18.432-15.872 27.648-5.632 33.28q0 35.84 21.504 61.44t51.2 25.6 51.2-25.6 21.504-61.44q0-17.408-5.632-33.28t-15.872-27.648-23.04-18.432-28.16-6.656zM373.76 261.12q-29.696 0-50.688 25.088t-20.992 60.928 20.992 61.44 50.688 25.6 50.176-25.6 20.48-61.44-20.48-60.928-50.176-25.088zM520.192 602.112q-51.2 0-97.28 9.728t-82.944 27.648-62.464 41.472-35.84 51.2q-1.024 1.024-1.024 2.048-1.024 3.072-1.024 8.704t2.56 11.776 7.168 11.264 12.8 6.144q25.6-27.648 62.464-50.176 31.744-19.456 79.36-35.328t114.176-15.872q67.584 0 116.736 15.872t81.92 35.328q37.888 22.528 63.488 50.176 17.408-5.12 19.968-18.944t0.512-18.944-3.072-7.168-1.024-3.072q-26.624-55.296-100.352-88.576t-176.128-33.28z" />
                </svg>
            )
        }
        else {
            return null
        }
    }
}

export default connect((state) => ({}), {})(PortfolioChart)