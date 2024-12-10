function EthValidatorsCountChart(){
    console.log("[EthValidatorsCountChart] registered");
    this.elementId = 'ethvalidators_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EthValidatorsCountChart.prototype.Init = function(){
    var app = this;
    console.log("[EthValidatorsCountChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EthValidatorsCountChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/
    console.log("Validators:",beaconchainData.date, beaconchainData.validators, beaconchainData.validators_change);

    var chartdata = {
        labels: beaconchainData.date,
        datasets: [
            {
                label: 'Validators change',
                data: beaconchainData.validators_change,
                borderColor: "green",
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'red' : 'green';
                  },
                order: 0,
                yAxisID: 'y1',
            },
            {
                label: 'Validators',
                data: beaconchainData.validators,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                //order: 1,
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
                y1: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Validators daily change'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'validators'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                /*y3: {
                    display: false,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Staked ETH'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },*/
            },
            plugins: {
                title: {
                  display: false,
                  text: 'ETH Validators number'
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

EthValidatorsCountChart.prototype.OnScaleChange = function(value){
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


EthValidatorsCountChart.prototype.SetData = function(value,cb){

};

new EthValidatorsCountChart();