function EthStakedBalanceChart(){
    console.log("[EthStakedBalanceChart] registered");
    this.elementId = 'stakedbalance_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EthStakedBalanceChart.prototype.Init = function(){
    var app = this;
    console.log("[EthStakedBalanceChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EthStakedBalanceChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/
    var days = beaconchainData.date.slice();
    var stakedAmount = beaconchainData.stakedTokens.slice();
    var stakedAmountChange = beaconchainData.stakedTokens_change.slice();
    while (!stakedAmount[stakedAmount.length - 1]) {
        days.pop();
        stakedAmount.pop();
        stakedAmountChange.pop();
        console.log("Warn: No stakedAmount value for last day, popping last entries");
    }
    
    console.log(days, stakedAmount, stakedAmountChange);

    var chartdata = {
        labels: days,
        datasets: [
            {
                label: 'Staked ETH change',
                data: stakedAmountChange,
                borderColor: "green",
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'red' : 'green';
                  },
                order: 0,
                yAxisID: 'y1',
            },
            {
                label: 'staked Tokens',
                data: stakedAmount,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y2',
                pointRadius:0,
                borderWidth: 3,
                //stepped: 'after',//true,
                //stepped:'before'
                stepped: 'middle'
                //fill: false,
            },
        ]
    };

    /*if(!chartsUIconfig || chartsUIconfig && chartsUIconfig.balance.detailed) {
        var executionDeposits = [], consensusDeposits = [];
        var dl = beaconchainData.deposits.length;
        for(var o=1;o<dl;o++){
            if(beaconchainData.deposits[o] === null) continue;
            consensusDeposits.push(beaconchainData.deposits[o].consensus);
            executionDeposits.push(beaconchainData.deposits[o].executionSucceed);
        }
        chartdata.datasets.push({
            label: 'Consensus deposits',
            data: consensusDeposits,
            borderColor: "green",
            backgroundColor: "green",
            order: 1,
            yAxisID: 'y1',
        },
        {
            label: 'Execution deposits',
            data: executionDeposits,
            borderColor: "blue",
            backgroundColor: "blue",
            order: 1,
            yAxisID: 'y1',
        });
    }*/

    /*var annotations = {
         brand:charts.GetBrandAnotation(this.elementId),                 
    };*/
    //charts.PushTextAnotations(this.xLabels, annotations);

    this.chartConfig = {
        type: 'bar',
        data: chartdata,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: charts.GetInteractionOption(),
            stacked: false,
            scales: {
                x: {
                    display: (chartsUIconfig) ? chartsUIconfig.balance.xaxis : true,
                    title: {
                        display: false,
                        text: 'Quarter'
                    },
                    //type: 'category',
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    offset: false
                },
                y1: {
                    display: (chartsUIconfig) ? chartsUIconfig.balance.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Staked ETH'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    display: (chartsUIconfig) ? chartsUIconfig.balance.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Staked ETH'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
            plugins: {
                title: {
                  display: false,
                  text: 'ETH Validators number'
                },
                //zoom: charts.GetZoomOption(1,this.elementId),
                legend: {
                    position: 'bottom',
                    display:(chartsUIconfig) ? chartsUIconfig.balance.legend : true,
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return [
                                `% of total supply: ${beaconchainData.stakedTokens[index] / etherchainData.totalSupply[index] * 100}`,
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
        }
    };
};

EthStakedBalanceChart.prototype.OnScaleChange = function(value){
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


EthStakedBalanceChart.prototype.SetData = function(value,cb){

};

new EthStakedBalanceChart();