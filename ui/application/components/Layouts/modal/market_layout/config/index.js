export const config = {
    hostapi: 'http://tc001pcis1p:8099/nanolayout_api/index.php/api',
    pcisapi: 'http://tc001pcis1p/newservices/LBServices.svc',
    nanoapi: 'http://TC001PCIS1P:60001/nano',
    main: 'mainside_central_zone',
    side: ['outside_topleft_zone', 'outside_topcenter_zone', 'outside_left_zone', 'mainside_central_zone'],
    rtl: ['outside_topleft_zone', 'outside_left_zone', 'outside_topleft_zone_previews', 'outside_left_zone_previews'],   
    ltl: ['outside_topcenter_zone', 'mainside_central_zone', 'outside_topcenter_zone_previews', 'mainside_central_zone_previews'],
    padZero: ['outside_topleft_zone', 'outside_topcenter_zone', 'outside_topleft_zone_previews', 'outside_topcenter_zone_previews'],
    pvLayout: ['outside_topleft_zone_previews', 'outside_left_zone_previews', 'outside_topcenter_zone_previews', 'mainside_central_zone_previews'],
    tblTH: ['โซน AA01', 'โซน A01', 'โซน AA1', 'โซน A1'],
    bktNotRisks: ['W0', 'W1-2','W3-4'],
    bktFullNotRisks: ['W0', 'W1', 'W2','W3', 'W4'],
    bucketRisks: ['XDay', 'M1-2', 'NPL'],
    bucketFullRisks: ['XDay', 'M1', 'M2', 'NPL'],
    fullBucket: ['W0', 'W1-2','W3-4', 'XDay', 'M1-2', 'NPL'], 
    fullPortfolio: ['W0', 'W1', 'W2', 'W3', 'W4', 'XDay', 'M1', 'M2','NPL'], 
    onhandInfo: {
        status_full: ['On Hand CA', 'On Hand FC', 'On Hand BM', 'On Hand ZM', 'On Hand Oper'],
        status_digit: ['CA', 'FC', 'TM', 'ZM', 'OP']
    },
    cellSize: 38,
    gridDefault: [1, 2],
    A1: 'mainside_central_zone',
    A01: 'outside_topcenter_zone',
    AA1: 'outside_left_zone',
    AA01: 'outside_topleft_zone',
    PA1: 'mainside_central_zone_previews',
    PA01: 'outside_topcenter_zone_previews',
    PAA1: 'outside_left_zone_previews',
    PAA01: 'outside_topleft_zone_previews',
    lockConfig: {
        lock: 'LOCKED',
        unlock: 'UNLOCKED'
    }
}