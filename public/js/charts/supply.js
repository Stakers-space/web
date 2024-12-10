function EthSupplyChart(){
    console.log("[EthSupplyChart] registered");
    this.elementId = 'ethsupply_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EthSupplyChart.prototype.Init = function(){
    var app = this;
    console.log("[EthSupplyChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EthSupplyChart.prototype.ConfigurateChart = function(){
    var chartdata = {
        labels: etherchainData.date,
        datasets: [
            {
                label: 'ETH Total Supply',
                data: etherchainData.totalSupply,
                type: 'line',
                borderColor: "black",
                backgroundColor: "black",
                order: 1,
                pointRadius:0,
                yAxisID: 'y3',
                borderWidth: 3,
            },
            {
                label: 'ETH Emission',
                data: etherchainData.emission,
                type: 'bar',
                borderColor: 'red',//'rgb(255, 99, 132)',
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'green' : 'red';
                },//'rgb(255, 99, 132)',
                order: 2,
                yAxisID: 'y2',
                stack: 'Stack 0',
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            {
                label: 'Burned ETH',
                data: etherchainData.burnedFees,
                type: 'bar',
                borderColor: 'grey',//'rgb(255, 99, 132)',
                backgroundColor: 'grey',//'rgb(255, 99, 132)',
                order: 2,
                yAxisID: 'y2',
                stack: 'Stack 0',
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
        ]
    };

    /*var annotations = {
         brand:charts.GetBrandAnotation(this.elementId),                 
    };*/
    //charts.PushTextAnotations(this.xLabels, annotations);

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
                    display: (chartsUIconfig) ? chartsUIconfig.supply.xaxis : true,
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
                    display: (chartsUIconfig) ? chartsUIconfig.supply.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'market cap'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    display: (chartsUIconfig) ? chartsUIconfig.supply.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'ETH Supply change'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    max: 35000
                },
                y3: {
                    display: (chartsUIconfig) ? chartsUIconfig.supply.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'ETH supply'
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
                    display:(chartsUIconfig) ? chartsUIconfig.supply.legend : true,
                },
                tooltip: {
                    callbacks: {
                        /*afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return [
                                `Daily minted ETH: ${ethstore.agg....[index]}`,
                                `Daily burned ETH ${ethstore.agg....[index]}`,
                                `Daily ETH emmission : ${ethstore.agg....[index]}`,
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

EthSupplyChart.prototype.OnScaleChange = function(value){
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


EthSupplyChart.prototype.SetData = function(value,cb){

};

new EthSupplyChart();