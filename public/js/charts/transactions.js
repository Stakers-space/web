function TransactionsChart(){
    console.log("[MarketCap] registered");
    this.elementId = 'transactions_chart';
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
TransactionsChart.prototype.Init = function(){
    var app = this;
    console.log("[TransactionsChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

TransactionsChart.prototype.ConfigurateChart = function(){
    let feeLabelTitle = "Fees ";
    if(document.location.pathname === "/gnosis"){
        feeLabelTitle += "(xDai)";
    } else if(document.location.pathname === "/ethereum"){
        feeLabelTitle += "(ETH)";
    } else {
        feeLabelTitle += "(xDai/ETH)";
    }

    const feeTicker = (document.location.pathname === "/gnosis") ? "xDai" : "ETH";
    var chartdata = {
        labels: etherchainData.date,
        datasets: [
            {
                label: 'Transactions',
                data: etherchainData.transactions,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                //order: 1,
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
                type: 'line',
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            {
                label: feeLabelTitle,
                data: etherchainData.dailyTxRewards,
                borderColor: "green",
                backgroundColor: 'green',
                order: 0,
                yAxisID: 'y1',
            }
        ]
    };

    /*if(etherchainData.dailyTxRewards){
        chartdata.datasets.push(
            
        );
    }*/

    /*var annotations = {
         brand:charts.GetBrandAnotation(this.elementId),                 
    };*/
    //charts.PushTextAnotations(this.xLabels, annotations);
    console.log(chartdata);
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
                    display: (chartsUIconfig) ? chartsUIconfig.validators.xaxis : true,
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
                y: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Transactions'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y1: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Daily fee'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                }
            },
            plugins: {
                title: {
                  display: false,
                  text: 'ETH L1 Transactions'
                },
                //zoom: charts.GetZoomOption(1,this.elementId),
                legend: {
                    position: 'bottom',
                    display: (chartsUIconfig) ? chartsUIconfig.validators.legend : true,
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

TransactionsChart.prototype.OnScaleChange = function(value){
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


TransactionsChart.prototype.SetData = function(value,cb){

};

new TransactionsChart();