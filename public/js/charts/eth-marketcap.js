function EthMarketCapChart(){
    console.log("[EthMarketCapChart] registered");
    this.elementId = 'ethmarketcap_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EthMarketCapChart.prototype.Init = function(){
    var app = this;
    console.log("[EthMarketCapChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EthMarketCapChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/

    var mintedEth = [etherchainData.totalSupply[0]];
    var dl = etherchainData.date.length;
    for(var o=1;o<dl;o++){
        //if(beaconchainData.deposits[o] === null) continue;
        mintedEth.push(etherchainData.totalSupply[o] - etherchainData.totalSupply[o-1]);
    }

    var chartdata = {
        labels: etherchainData.date,
        datasets: [
            {
                label: 'ETH MarketCap',
                data: etherchainData.marketCap,
                type: 'line',
                borderColor: "grey",
                backgroundColor: "grey",
                order: 1,
                pointRadius:0,
                yAxisID: 'y1',
            },
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
                    display: true,
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
                    //display: false,
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
                y3: {
                    display: false,
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
                    //display:false,
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

EthMarketCapChart.prototype.OnScaleChange = function(value){
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


EthMarketCapChart.prototype.SetData = function(value,cb){

};

new EthMarketCapChart();