function WalletDistributionChart(){
    console.log("[WalletBalance chart] registered");
    this.elementId = 'walletbalance_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
WalletDistributionChart.prototype.Init = function(){
    var app = this;
    console.log("[WalletBalance] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

WalletDistributionChart.prototype.ConfigurateChart = function(){
    // convert to array
    let xAxes = [];
    let yAxes = [];

    var chartdata = {
        labels: xAxes,
        datasets: [
            {
                label: 'Validators GNO holding ',
                data: yAxes,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                type: 'line',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
                fill: '-1'
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            {
                label: 'GNO in Deposit Contract',
                data: yAxes,
                borderColor: 'red',//'rgb(255, 99, 132)',
                backgroundColor: 'red',//'rgb(255, 99, 132)',
                type: 'line',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
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
        type: 'bar',
        data: chartdata,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: charts.GetInteractionOption(),
            scales: {
                x: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.xaxis : true,
                    title: {
                        display: false,
                        text: 'GNO holdings'
                    },
                    //type: 'category',
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    offset: false
                },
                y: {
                    stacked: true
                  }
            },
            plugins: {
                filler: {
                    propagate: false
                },
                'samples-filler-analyser': {
                    target: 'chart-analyser'
                },
                title: {
                  display: false,
                  text: 'GNO holdings across validators'
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

WalletDistributionChart.prototype.OnScaleChange = function(value){
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


WalletDistributionChart.prototype.SetData = function(value,cb){

};

new WalletDistributionChart();