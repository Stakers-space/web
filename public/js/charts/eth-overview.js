function EthStoreChart(){
    console.log("[EthStoreChart] registered");
    this.elementId = 'ethstore_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EthStoreChart.prototype.Init = function(){
    var app = this;
    console.log("[EthStoreChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EthStoreChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/

    var chartdata = {
        labels: ethstore.day,
        datasets: [
            {
                label: 'Daily APR',
                data: ethstore.apr,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 4,
                stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            {
                label: 'Validators',
                data: ethstore.validators_count,
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
            /*{
                label: 'Daily ETH rewards',
                data: ethstore.total_rewards_wei,
                borderColor: 'green',//'rgb(255, 99, 132)',
                backgroundColor: 'green',//'rgb(255, 99, 132)',
                order: 1,
                yAxisID: 'y1'
            }*/
            {
                label: 'Execution Layer reward %',
                fill: true,
                backgroundColor: "grey"/*"#f6f6f6"*//*'rgb(255, 99, 132)'*/,
                borderColor: "black"/*"#f6f6f6"*//*'rgb(255, 99, 132)'*/,
                data: ethstore.el_trprc,
                pointRadius:0,
                yAxisID: 'y1'
            },{
                label: 'Consensus Layer reward %',
                backgroundColor: charts.color.liteGray,
                borderColor: charts.color.liteGray,
                data: ethstore.cl_trprc,
                pointRadius:0,
                fill: 'end',
                yAxisID: 'y3'
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
                y: {
                    type:/*'logarithmic',//*/'linear',
                    display: charts.ShouldDisplayLegend(),
                    position: 'left',
                    title: {
                        display: true,
                        text: 'APR'
                    },
                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    /*min: Math.round(...),
                    max: Math.ceil(...)*/
                    /*ticks: {
                        beginAtZero: false,
                        min: 1400000
                    }*/
                },
                y1: {
                    display: false,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: '%'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
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
                y3: {
                    display: false,
                    type:'linear',//'logarithmic',
                    position: 'left',
                    reverse: true,
                    title: {
                        display: false,
                        text: '%'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
            plugins: {
                title: {
                  display: false,
                  text: 'ETH daily staking rewards'
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

EthStoreChart.prototype.OnScaleChange = function(value){
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


EthStoreChart.prototype.SetData = function(value,cb){

};

new EthStoreChart();