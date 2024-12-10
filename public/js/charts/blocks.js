function BlocksChart(){
    console.log("[BlocksChart] registered");
    this.elementId = 'blocks_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
BlocksChart.prototype.Init = function(){
    var app = this;
    console.log("[BlocksChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

BlocksChart.prototype.ConfigurateChart = function(){
    var proposed = [],
        missed = [],
        orphaned = [];

    var bl = beaconchainData.blocks.length;
    for(var i=0;i<bl;i++){
        if(!beaconchainData.blocks[i]) continue;
        proposed.push(beaconchainData.blocks[i].proposed);
        missed.push(beaconchainData.blocks[i].missed);
        orphaned.push(beaconchainData.blocks[i].orphaned);
    }
    
    /*....unshift();
    .....push();*/
    var chartdata = {
        labels: beaconchainData.date,
        datasets: [
            /*{
                label: 'Staked ETH',
                data: beaconchainData.stakedEth,
                borderColor: "grey",
                backgroundColor: "grey",
                //order: 0,
                yAxisID: 'y3',
                fill: true,
            },*/
            {
                label: 'Proposed Blocks',
                data: proposed,
                backgroundColor: "green",
              },
              {
                label: 'Missed Blocks',
                data: missed,
                backgroundColor: "red",
              },
              {
                label: 'Orphaned Blocks',
                data: orphaned,
                backgroundColor: "yellow",
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
                    offset: false,
                    stacked: true
                },
                y: {
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
                    stacked: true
                }
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

BlocksChart.prototype.OnScaleChange = function(value){
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


BlocksChart.prototype.SetData = function(value,cb){

};

new BlocksChart();