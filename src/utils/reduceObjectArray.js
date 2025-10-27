const { SUPPORTED_STATES } = require('../config/definition');

function reduceObjectArray(obj, limit){
    let result = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && Array.isArray(obj[key])) {
            result[key] = obj[key].slice(limit);
        }
    }
    return result;
}

function dayKeyFromTs(ms, timeZone = 'UTC') {
    const parts = new Intl.DateTimeFormat('en-CA', { // en-CA prints 2025-10-23
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(ms);
    const get = (t) => parts.find(p => p.type === t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}

function keepDayCloseMarksOnly(objArr){
    const byDay = new Map();
    let prevDay = null;

    for(const o of objArr){
        const timeMs = o.time > 1e12 ? o.time : o.time * 1000;
        const key = dayKeyFromTs(timeMs);
        const prev = byDay.get(key);
        if (!prev || timeMs >= prev.timeMs) {
            let body = { timeMs };
            for(const state of SUPPORTED_STATES){ 
                body[state] = {}; 
                if(!o.stateCount) continue;
                
                const s = o.stateCount[state];
                if(s) {
                    body[state] = {
                        wallets: s.wallets,
                        validators: s.validators,
                        staked: s.eff_balance
                    };

                    if(state === 'active_ongoing'){
                        body[state].wallets_diff = (prevDay && prevDay[state] && prevDay[state].wallets) ? (s.wallets - prevDay[state].wallets) : null;
                        body[state].validators_diff = (prevDay && prevDay[state] && prevDay[state].validators) ? (s.validators - prevDay[state].validators) : null;
                        body[state].staked_diff = (prevDay && prevDay[state] && prevDay[state].staked) ? (s.eff_balance - prevDay[state].staked) : null;
                    }
                }
            }
            
            byDay.set(key, body);
            //console.log(s, prevDay, "→ ",byDay.get(key));
            prevDay = body ?? null;
        }
    }

    let days = Array.from(byDay.values()).sort((a, b) => a.timeMs - b.timeMs);
    return days;
}

module.exports = {
    reduceObjectArray,
    keepDayCloseMarksOnly
};