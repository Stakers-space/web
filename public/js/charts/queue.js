function EntryQueueChart(){
    console.log("[EntryQueueChart] registered");
    this.elementId = 'entry_queue_chart';
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
EntryQueueChart.prototype.Init = function(){
    var app = this;
    console.log("[EntryQueueChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

EntryQueueChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/
    console.log("Queue:",queue);

    var chartdata = {
        labels: queue.date,
        datasets: [
            {
                label: 'Waiting time',
                data: queue.entry_wait,
                borderColor: "black",
                order: 0,
                yAxisID: 'y1',
                pointRadius: 0,
            },
            {
                label: 'Entry Queue',
                data: queue.entry_queue,
                borderColor: "grey",
                order: 0,
                yAxisID: 'y2',
                pointRadius: 0,
            },
        ]
    };

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
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Waiting time'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Entry Queue'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
            plugins: {
                title: {
                  display: false,
                  text: 'Queue'
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

EntryQueueChart.prototype.OnScaleChange = function(value){
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
EntryQueueChart.prototype.SetData = function(value,cb){

};


function ExitQueueChart(){
    console.log("[ExitQueueChart] registered");
    this.elementId = 'exit_queue_chart';
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
ExitQueueChart.prototype.Init = function(){
    var app = this;
    console.log("[ExitQueueChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

ExitQueueChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/
    console.log("Queue:",queue);

    var chartdata = {
        labels: queue.date,
        datasets: [
            {
                label: 'Waiting time',
                data: queue.exit_wait,
                borderColor: "black",
                order: 0,
                yAxisID: 'y1',
                pointRadius: 0,
            },
            {
                label: 'Exit Queue',
                data: queue.exit_queue,
                borderColor: "grey",
                order: 0,
                yAxisID: 'y2',
                pointRadius: 0,
            },
        ]
    };

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
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Waiting time'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Exit Queue'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
            },
            plugins: {
                title: {
                  display: false,
                  text: 'Queue'
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

ExitQueueChart.prototype.OnScaleChange = function(value){
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
ExitQueueChart.prototype.SetData = function(value,cb){

};

new EntryQueueChart();
new ExitQueueChart();