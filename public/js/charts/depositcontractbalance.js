function DepositContractBalanceChart(){
    console.log("[depositcontractbalance] registered");
    this.elementId = 'depositcontractbalance_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
DepositContractBalanceChart.prototype.Init = function(){
    var app = this;
    console.log("[depositcontractbalance] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

DepositContractBalanceChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/
    /*depositContract.date.push("2024-12-16");
    depositContract.gno_validators.push(depositContract.gno_contract[0]);
    depositContract.gno_contract.push(depositContract.gno_validators[0]);
    depositContract.gno_balance.push(depositContract.gno_balance[0] * -1);

    depositContract.date.push("2024-12-17");
    depositContract.gno_validators.push(depositContract.gno_validators[0]);
    depositContract.gno_contract.push(depositContract.gno_contract[0]);
    depositContract.gno_balance.push(depositContract.gno_balance[0] * 1);*/

    const RequiredGNO = [];
    for (let i = 0; i < depositContract.gno_contract.length; i++) {
        RequiredGNO.push(depositContract.gno_validators[i] + depositContract.gno_unclaimed[i]);
    }

    var chartdata = {
        labels: depositContract.date,
        datasets: [
            {
                label: 'GNO on beaconchain + unclaimed GNO',
                data: RequiredGNO,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
                fill: false
                //fill: '+1',
            },
            /*{
                label: 'Unclaimed GNO by Withdrawal wallets',
                data: depositContract.gno_unclaimed,
                borderColor: 'grey',//'rgb(255, 99, 132)',
                backgroundColor: 'grey',//'rgb(255, 99, 132)',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
                fill: false,
                //fill: '+1',
            },*/
            {
                label: 'GNO balance in deposit contract',
                data: depositContract.gno_contract,
                borderColor: 'grey'/*function(context) {
                    const value = depositContract.gno_balance[context.dataIndex];
                    const color = (value < 0) ? 'red' : 'green';
                    console.log(value, "→", color);
                    return color;
                }*/,
                /*backgroundColor: function(context) {
                    const value = depositContract.gno_balance[context.dataIndex];
                    if(!value) return;
                    const color = (value < 0) ? 'red' : 'green';
                    console.log(value, "→", color);
                    return color;
                },*/
                yAxisID: 'y',
                pointRadius: 0,
                borderWidth: 1,
                fill: {
                    target: 0, // Výplň k datasetu 0
                    above: 'rgba(0, 255, 0, 0.3)', // Zelená výplň
                    below: 'rgba(255, 0, 0, 0.3)'  // Červená výplň
                }
                
                //fill: false
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            /*{
                label: 'GNO balance',
                data: depositContract.gno_balance                ,
                borderColor: 'grey',//'rgb(255, 99, 132)',
                backgroundColor: 'grey',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 1,
                fill: '-1'
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },*/
        ]
    };

    this.chartConfig = {
        type: 'line',
        data: chartdata,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: charts.GetInteractionOption(),
            stacked: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: false,
                        text: 'Date'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    offset: false
                },
                y: {
                    //stacked: true
                }
            },
            plugins: {
                filler: {
                    propagate: false
                },
                title: {
                  display: false,
                  text: 'Validators number'
                },
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return [
                                `GNO attached to validators on beaconchain: ${depositContract.gno_validators[index]}`,
                                `Unclaimed GNO: ${depositContract.gno_unclaimed[index]}`,
                                `GNO balance: ${depositContract.gno_balance[index]}`,
                            ];
                        }
                    }
                },
                annotation: {
                    annotations: {
                        
                    },
                },
            },
            transitions: charts.GetTransitions(),
        },
    };
};

DepositContractBalanceChart.prototype.OnScaleChange = function(value){
    console.log("On Scale Change", value, this, "chart:", charts.charts[this.elementId], "chart data:", charts.charts[this.elementId].data);
    var chart = this;
    /*this.SetData(value,function(){
        charts.charts[chart.elementId].data.labels = chart.xLabels;
        charts.charts[chart.elementId].data.datasets[0].data = chart.values;
        charts.charts[chart.elementId].data.datasets[1].data = chart.totalRewardHistory;
        
        // remove / set annotations
        console.log(charts.charts[chart.elementId],charts.charts[chart.elementId].options, charts.charts[chart.elementId].options.annotation);


        charts.Render(chart.elementId);
    });*/
};


DepositContractBalanceChart.prototype.SetData = function(value,cb){

};

new DepositContractBalanceChart();