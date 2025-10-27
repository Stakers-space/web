function labelFromTs(ms, locale = 'en-US', timeZone = 'UTC') {
    return new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium' }).format(ms);
}

exports.validatorsViewChartConfig = (tokenSymbol, days, opts = {}) => {
    //console.log("validatorsViewChartConfig", days);
    // ---  LIMIT_DESC ---
    if (opts.LIMIT_DESC && opts.LIMIT_DESC > 0 && days.length > opts.LIMIT_DESC) {
        const startIndex = Math.max(0, days.length - opts.LIMIT_DESC);
        days = days.slice(startIndex);
    }

    const labels =  []; //days.map(d => labelFromTs(d.timeMs));     // labels
    const activeWallets = [];//days.active_ongoing.map(d => d.wallets);
    const activeValidators = [];// days.active_ongoing.map(d => d.validators);
    const stakedTokens = [];//days.active_ongoing.map(d => d.staked);
    const walletsDiff      = [];// days.active_ongoing.map(d => d.wallets_diff);
    const validatorsDiff   = [];// days.active_ongoing.map(d => d.validators_diff);
    const stakedDiff       = [];// days.active_ongoing.map(d => d.staked_diff);

    for (const o of days){
        labels.push(labelFromTs(o.timeMs));
        if(!o.active_ongoing) continue;
        activeWallets.push(o.active_ongoing.wallets);
        activeValidators.push(o.active_ongoing.validators);
        stakedTokens.push(o.active_ongoing.staked);
        walletsDiff.push(o.active_ongoing.wallets_diff);
        validatorsDiff.push(o.active_ongoing.validators_diff);
        stakedDiff.push(o.active_ongoing.staked_diff);
    }

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
                legend: { display: opts["overview"]?.plugins?.legend?.display ?? true, position: 'top' },
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

