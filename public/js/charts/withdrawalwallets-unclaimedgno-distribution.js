function UnclaimedGnoDistributionChart(){
    console.log("[UnclaimedGnoDistributionChart chart] registered");
    this.elementId = 'gnodeposit-withdrawalwallets_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
UnclaimedGnoDistributionChart.prototype.Init = function(){
    var app = this;
    console.log("[WalletBalance] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

UnclaimedGnoDistributionChart.prototype.ConfigurateChart = function(){
    // convert to array

    var chartdata = {
        labels: unclaimedgno_distribution.holdings,
        datasets: [
            {
                label: 'Wallets',
                data: unclaimedgno_distribution.wallets,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 3,
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            }
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
                    display: true,
                    title: {
                        display: true,
                        text: 'GNO holdings'
                    },
                    //type: 'category',
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    offset: false
                },
                y: {
                    type:'logarithmic',
                    title: {
                        display: true,
                        text: 'Validators'
                    },
                }
            },
            plugins: {
                title: {
                  display: false,
                  text: 'GNO holdings across validators'
                },
                //zoom: charts.GetZoomOption(1,this.elementId),
                legend: {
                    position: 'bottom',
                    display: (chartsUIconfig) ? chartsUIconfig.validators.legend : true,
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

UnclaimedGnoDistributionChart.prototype.OnScaleChange = function(value){
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


UnclaimedGnoDistributionChart.prototype.SetData = function(value,cb){

};

new UnclaimedGnoDistributionChart();