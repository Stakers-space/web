const TZ = 'UTC';
function dayKeyFromTs(ms, timeZone = TZ) {
    const parts = new Intl.DateTimeFormat('en-CA', { // en-CA prints 2025-10-23
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(ms);
    const get = (t) => parts.find(p => p.type === t).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
}

function labelFromTs(ms, locale = 'en-US', timeZone = TZ) {
    return new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium' }).format(ms);
}

exports.validatorsViewChartConfig = (tokenSymbol, data) => {
    //console.log("validatorsViewChartConfig", data);
    const byDay = new Map();
    let prevDay = null;

    for(const o of data){
        const timeMs = o.time > 1e12 ? o.time : o.time * 1000;
        const key = dayKeyFromTs(timeMs);
        const s = o.stateCount?.active_ongoing;
        if(!s) continue;
        const prev = byDay.get(key);
        if (!prev || timeMs >= prev.timeMs) {
            byDay.set(key, {
                timeMs,
                wallets: s.wallets,
                wallets_diff: (prevDay && prevDay.wallets) ? (s.wallets - prevDay.wallets) : null,
                validators: s.validators,
                validators_diff: (prevDay && prevDay.validators) ? (s.validators - prevDay.validators) : null,
                staked: s.eff_balance,
                staked_diff: (prevDay && prevDay.eff_balance) ? (s.eff_balance - prevDay.eff_balance) : null,
            });
            //console.log(s, prevDay, "→ ",byDay.get(key));
            prevDay = s ?? null;
        }
    }

    const days = Array.from(byDay.values()).sort((a, b) => a.timeMs - b.timeMs);
    const labels = days.map(d => labelFromTs(d.timeMs));     // labels
    const activeWallets = days.map(d => d.wallets);
    const activeValidators = days.map(d => d.validators);
    const stakedTokens = days.map(d => d.staked);
    const walletsDiff      = days.map(d => d.wallets_diff);
    const validatorsDiff   = days.map(d => d.validators_diff);
    const stakedDiff       = days.map(d => d.staked_diff);

     const C = {
        wallets:   { bg: 'rgba(0, 0, 0, 1)', border: 'rgba(0, 0, 0, 1)' }, // sky-500
        validators:{ bg: 'rgba(17,24,39,0.5)',   border: 'rgba(17,24,39,1)'   }, // neutral-900
        staked:    { bg: 'rgba(129, 129, 129, 0.35)', border: 'rgba(114, 114, 114, 1)'  }, // green-500
        pos:        'rgba(34,197,94,0.8)',  // bar +
        neg:        'rgba(239,68,68,0.8)',  // bar -
    };

    const LEFT_W  = 80;
    const RIGHT_W = 0;

    const overview = {
        type: 'line',
        data: {
            labels, //['Active wallets', 'Active validators', `${tokenSymbol} staked`],
            datasets: [
                {
                    label: `Wallets`,
                    pointRadius:0,
                    borderWidth: 2,
                    data: activeWallets,
                    order: 0,
                    yAxisID: 'y1',
                    backgroundColor: C.wallets.bg,
                    borderColor: C.wallets.border,
                    fill: 'origin',
                    min:0,
                    //barThickness: 'flex',      
                    base: 0,      
                },
                {
                    label: 'Validators',
                    pointRadius:0,
                    borderWidth: 2,
                    data: activeValidators,
                    yAxisID: 'y1',
                    order: 1,
                    backgroundColor: C.validators.bg,
                    borderColor: C.validators.border,
                    fill: 'origin',
                    min:0,
                   // barThickness: 'flex',
                    base: 0,
                },
                {
                    label: `Staked ${tokenSymbol}`,
                    pointRadius:0,
                    borderWidth: 2,
                    data: stakedTokens,
                    yAxisID: 'y2',
                    order: 2,
                    backgroundColor: C.staked.bg,
                    borderColor: C.staked.border,
                    fill: 'origin',
                    min:0,
                    //barThickness: 'flex',
                    base: 0,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false, text: `${tokenSymbol.toUpperCase()} Validators number`},
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    display: false,
                    type: 'category',
                    bounds: 'data',
                    offset: false,
                    min: -0.5,
                    max: labels.length ? labels.length - 0.5 : -0.5,
                    grid: { drawOnChartArea: false },
                    ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 },
                },
                y: {
                    beginAtZero: false,
                    stacked: false,
                    ticks: {  },
                    position: 'right',
                    afterFitWidth: RIGHT_W,
                    grid: { drawOnChartArea: true },
                    type: 'linear',
                    title: { display: true, text: 'Wallets' },
                    display: false,
                    min: 0,
                    max: Math.max(...activeWallets) * 10,
                },
                y1: {
                    beginAtZero: true,
                    stacked: false,
                    ticks: {  },
                    position: 'left',
                    afterFitWidth: LEFT_W,
                    grid: { drawOnChartArea: false },
                    type: 'linear',
                    title: { display: false, text: `Validators` },
                    display: true,
                    max:  Math.max(...activeValidators) * 1.5,
                },
                y2: {
                    title: { display: true, text: `Staked ${tokenSymbol.toUpperCase()}` },
                    beginAtZero: true,
                    stacked: false,
                    ticks: {  },
                    position: 'left',
                    type: 'linear',
                    grid: { drawOnChartArea: false },
                    display: false
                },
            },
            _useNumberFormat: true
        }
    };

    const overview_diff = {
        type: 'bar',
        data: {
            labels, //['Active wallets', 'Active validators', `${tokenSymbol} staked`],
            datasets: [
                {
                    type: 'bar',
                    label: `Δ Wallets`,
                    data: walletsDiff,
                    yAxisID: 'y',
                    order: 1,
                    backgroundColor: "blue",//(ctx) => (ctx.raw >= 0 ? C.pos : C.neg),
                    borderWidth: 0,
                    fill: true,
                    borderWidth: 1,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                    hidden: true
                },
                {
                    type: 'bar',
                    label: 'Δ Validators',
                    data: validatorsDiff,
                    yAxisID: 'y',
                    order: 1,
                    backgroundColor: "yellow",//(ctx) => (ctx.raw >= 0 ? C.pos : C.neg),
                    borderWidth: 0,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                    hidden: true
                },
                {
                    type: 'bar',
                    label: `Δ Staked ${tokenSymbol}`,
                    data: stakedDiff,
                    yAxisID: 'y1',
                    order: 1,
                    backgroundColor: "brown",//(ctx) => (ctx.raw >= 0 ? C.pos : C.neg),
                    borderWidth: 0,
                    categoryPercentage: 1.0,
                    barPercentage: 1.0,
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false, text: `${tokenSymbol.toUpperCase()} Validators number`},
                legend: { display: true, position: 'bottom' },
                tooltip: { enabled: true }
            },
            scales: {
               x: {
                    display: true,
                    type: 'category',
                    bounds: 'data',
                    offset: false,
                    min: -0.5,
                    max: labels.length ? labels.length - 0.5 : -0.5,
                    grid: { drawOnChartArea: false },
                    ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 },
                },
                y: {
                    position: 'right',
                    afterFitWidth: RIGHT_W,
                    //beginAtZero: true,       // baseline 0
                    grid: { drawOnChartArea: false },
                    stacked: false,
                    ticks: {  },
                    title: { display: true, text: 'Daily change' },
                    display: false,
                },
                y1: {
                    position: 'left',
                    afterFitWidth: LEFT_W,
                    //beginAtZero: true,       // baseline 0
                    grid: { drawOnChartArea: false },
                    stacked: false,
                    ticks: {  },
                    title: { display: true, text: 'Daily change' },
                    display: true
                },
            },
            _usePosNegBarColors: true, // flag for scriptable backgroundColor
            _useNumberFormat: true
        }
    };
    
    return {
        overview,
        overview_diff,
    }
};

