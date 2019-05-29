import _ from 'lodash'

/** ESSENTIAL FUNCTION **/
export const in_array = (needle, haystack, argStrict) => {
    var key = '', strict = !!argStrict;
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) { return true }
        }
    } else {
        for (key in haystack) {
            if (haystack[key] == needle) { return true }
        }
    }
    return false
}

export const str_replace = (search, replace, subject) => {
    let i = 0
    let j = 0
    let temp = ''
    let repl = ''
    let sl = 0
    let fl = 0
    let f = [].concat(search)
    let r = [].concat(replace)
    let s = subject
    s = [].concat(s)
  
    for (i = 0, sl = s.length; i < sl; i++) {
        if (s[i] === '') {
            continue
        }
        for (j = 0, fl = f.length; j < fl; j++) {
            temp = s[i] + ''
            repl = r[0]
            s[i] = (temp).split(f[j]).join(repl)
            if (typeof countObj !== 'undefined') {
                countObj.value += ((temp.split(f[j])).length - 1)
            }
        }
    }
    return s[0]
}

export const roundFixed = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export const numberWithCommas = (x) => {
    if(x) {
        var parts = x.toString().split(".")
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return parts.join(".")
    } else {
        return 0
    }
}

export const toggleClass = (elements, classnames) => {
    if (elements.classList) { elements.classList.toggle(classnames) }
    else {
        let classes = elements.className.split(" ")
        let i = classes.indexOf(classnames)

        if (i >= 0) {
            classes.splice(i, 1)
        } else {
            classes.push(classnames)
            elements.className = classes.join(" ")
        }
    }
}

export const hasClass = (el, selector) => {
    let className = " " + selector + " "
    if ((" " + el.className + " ").replace(/[\n\t]/g, " ").indexOf(className) > -1) {
        return true
    }
    return false
}

export const createElement = (element, attribute, inner) => {
    if (typeof (element) === "undefined") { return false }
    if (typeof (inner) === "undefined") { inner = "" }

    var el = document.createElement(element)
    if (typeof (attribute) === 'object') {
        for (var key in attribute) {
            el.setAttribute(key, attribute[key])
        }
    }

    if (!Array.isArray(inner)) { inner = [inner] }
    for (var k = 0; k < inner.length; k++) {
        if (inner[k] && inner[k].tagName) { el.appendChild(inner[k]) }
        else { el.appendChild(document.createTextNode(inner[k])) }
    }
    return el
}

export const parseBool = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1 ? true : value === 0 ? false : undefined;
    if (typeof value != "string") return undefined;
    return value.toLowerCase() === 'true' ? true : false;
}

export const parseTotalAccount = (acc) => {
    if(acc && acc > 0) {
        if(acc >= 1000000) {
            let convert_acc = (acc / 1000000)
            return (convert_acc && convert_acc > 0) ? `${roundFixed(convert_acc, 2)}M` : 0
        } else {
            return acc
        }
    } else {
        return 0
    }
}

export const parseNumberShort = (num) => {
    const numDef = '1'
    if(num && num > 0) {        
        
        let total = 0
        let result = ''
        let principle = (num && num > 0) ? roundFixed(parseFloat(num), 0):0

        const str_length = principle.toString().length
        switch(parseInt(str_length)) {
            case 9: 
                total = (principle / 100000000) * 100
                result = `${roundFixed(total, 0)}MB`
            break
            case 8: 
                total = (principle / 10000000) * 100
                result = `${roundFixed(total, 0)}MB`
            break
            case 7:
                total = (principle / 1000000) * 100
                result = `${roundFixed(total, 0)}MB`
            break
            case 6:
                total = (principle / 100000) * 100                
                result = `${roundFixed(total, 0)}KB`
            break
            case 5:
                total = (principle / 100000) * 100
                result = `${roundFixed(total, 0)}KB`
            break
            case 4:
                total = (principle / 10000) * 100
                result = `${roundFixed(total, 0)}KB`
            break
            case 3:
                total = (principle / 1000) * 100
                result = `${ (total && total > 0) ? _.padStart(roundFixed(total, 0), 2, '0') : 0 }K`
            break
            default:
                result = num
            break
        }

        return result

    } else {
        return 0
    }
}

export const parseNumberShortNew = (num) => {
    let numDef = 1
    if(num && num > 0) {        
        
        let total = 0
        let result = ''
        let principle = (num && num > 0) ? roundFixed(parseFloat(num), 0):0

        const str_length = principle.toString().length
        switch(parseInt(str_length)) {
            case 9: 
                total = (principle / 100000000) * 100
                result = `${roundFixed(total, numDef)}M`
            break
            case 8: 
                total = (principle / 100000000) * 100
                result = `${roundFixed(total, numDef)}M`
            break
            case 7:
                total = (principle / 100000000) * 100
                result = `${roundFixed(total, numDef)}M`
            break
            case 6:
                total = (principle / 1000000) * 100                
                result = `${roundFixed(total, numDef)}K`
            break
            case 5:
                total = (principle / 100000) * 100
                result = `${roundFixed(total, numDef)}K`
            break
            case 4:
                total = (principle / 10000) * 100
                result = `${roundFixed(total, numDef)}K`
            break
            case 3:
                total = (principle / 1000) * 100
                result = `${ (total && total > 0) ? _.padStart(roundFixed(total, numDef), 2, '0') : 0 }KB`
            break
            default:
                result = num
            break
        }

        return result

    } else {
        return 0
    }
}

export const numValid = (num) => {
    if(num && num > 0 && !isNaN(num)) {
        return parseInt(num)
    } else {
        return 0
    }
}

export const strFloat = (num) => {
    if(!num || num === ".00") {
        return 0.00
    } else {
        return roundFixed(num, 2)
    }
}

export const localStorageRead = (parent_key, key) => {
    let ls = {}
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem(`${parent_key}`)) || {}
        } catch (e) {}
    }
    return ls[key]
}

export const localStorageWrite = (parent_key, key, value) => {
    if (global.localStorage) {
        global.localStorage.setItem(`${parent_key}`, JSON.stringify({ [key]: value }))
    }
}

export const validateNumOnly = (evt) => {

    let theEvent = evt || window.event
    let key = theEvent.keyCode || theEvent.which
        key = String.fromCharCode( key )

    const regex = /[0-9]|\./
    if( !regex.test(evt.target.value) ) {
        theEvent.returnValue = false;
        if(theEvent.preventDefault) theEvent.preventDefault()
    }

}

export const isNodeList = (nodes) => {
    let stringRepr = Object.prototype.toString.call(nodes)
    return typeof nodes === 'object' && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) && (typeof nodes.length === 'number') && (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0))
}

export const handleMobilePattern = (numno) => {
    let number_phone = `${numno.trim()}`
    
    let patt = new RegExp("-")
    if(patt.test(number_phone)) {
        number_phone = number_phone.replace('-', '')
    }

    if(number_phone) {
        switch(number_phone.length) {
            case 9: 
                return numno.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
            default:
                if(number_phone.substring(0, 2) == '02') {
                    return numno.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3')
                } else {
                    return numno.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
                }
        }
    } else {
        return null
    }
}

export const largeNumberToShort = (num, limit = 8, decimals = 0) => {
    if(num && num.toString().length > limit)
        return `${roundFixed((num / 1000000), decimals)}Mb`
    else 
        return num              
}

export const getCoords = (elem) => {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { 
        top: roundFixed(top, 0), 
        left: roundFixed(left, 0),
        scrollTop,
        scrollLeft,
        clientTop,
        clientLeft
    };
}

export const compareByAlph = (a, b) => { 
    let aData = (!_.isEmpty(a)) ? a : ''
    let bData = (!_.isEmpty(b)) ? b : ''

    if (aData > bData) { return -1; } 
    if (aData < bData) { return 1; } 
    return 0; 
}

export const compareByDate = (a, b) => { 
    let aData = (!_.isEmpty(a)) ? a : '2015-01-01T00:00:00.000Z'
    let bData = (!_.isEmpty(b)) ? b : '2015-01-01T00:00:00.000Z'
    
    if (aData > bData) { return -1; } 
    if (aData < bData) { return 1; } 
    return 0; 
}

export const compareByAmount = (a, b) => { 
    let aData = (a && a > 0) ? a : 0.00
    let bData = (b && b > 0) ? b : 0.00

    if (aData > bData) { return -1; } 
    if (aData < bData) { return 1; } 
    return 0; 
}

export const qs_parse = (url) => {
    if(url) {
        var qs = url.substring(url.indexOf('?') + 1).split('&')
        for(var i = 0, result = {}; i < qs.length; i++) {
            qs[i] = qs[i].split('=')
            result[qs[i][0]] = decodeURIComponent(qs[i][1])
        }
        return result
    } else {
        return null
    }
    
}