function TvlBalanceChart(){
    console.log("[TvlBalanceChart] registered");
    this.elementId = 'tvlbalance_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
TvlBalanceChart.prototype.Init = function(){
    var app = this;
    console.log("[TvlBalanceChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

TvlBalanceChart.prototype.ConfigurateChart = function(){
    var days = beaconchainData.date.slice();
    var tvl = beaconchainData.tvl.slice();
    var tvlChange = beaconchainData.tvl_change.slice();
    while (tvl[tvl.length - 1] === 0) {
        days.pop();
        tvl.pop();
        tvlChange.pop();
        console.log("Warn: Last TVL value is 0, popping last entries");
    }

    var chartdata = {
        labels: beaconchainData.date,
        datasets: [
            {
                label: 'TVL change',
                data: tvlChange,
                borderColor: "green",
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'red' : 'green';
                  },
                order: 0,
                yAxisID: 'y1',
            },
            {
                label: 'TVL',
                data: tvl,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y2',
                pointRadius:0,
                borderWidth: 3,
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
        ]
    };

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
                        text: '$ TVL change'
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
                        text: '$ TVL'
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
                        /*afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return [
                                `...: ${ethstore.agg....[index]}`,
                                `...: ${ethstore.agg....[index]}`,
                                `...: ${ethstore.agg....[index]}`,
                                `...: ${ethstore.agg....[index]}`,
                            ];
                        }*/
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

TvlBalanceChart.prototype.OnScaleChange = function(value){
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


TvlBalanceChart.prototype.SetData = function(value,cb){

};

new TvlBalanceChart();