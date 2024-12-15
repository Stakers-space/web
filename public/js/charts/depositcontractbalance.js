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

    var chartdata = {
        labels: beaconchainData.date,
        datasets: [
            {
                label: 'Validators',
                data: beaconchainData .validators,
                borderColor: 'grey',//'rgb(255, 99, 132)',
                backgroundColor: 'grey',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y2',
                pointRadius:0,
                borderWidth: 1,
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
                y2: {
                    //display: false,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'validators'
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