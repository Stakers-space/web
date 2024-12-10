function GnoPriceValueChart(){
    console.log("[GnoPriceValueChart] registered");
    this.elementId = 'priceratio_chart';
    /*if(!window["pendingRegistrations"]) window["pendingRegistrations"] = [];
    window["pendingRegistrations"].push()*/
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
GnoPriceValueChart.prototype.Init = function(){
    var app = this;
    console.log("[GnoPriceValueChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

GnoPriceValueChart.prototype.ConfigurateChart = function(){
    /*....unshift();
    .....push();*/

    var chartdata = {
        labels: dashboardData.bookValueTime.date,
        datasets: [
            {
                label: 'GNO Price',
                data: dashboardData.gnoPrice,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y1',
                pointRadius:0,
                borderWidth: 3,
                //stepped: 'after',//true,
                //stepped:'before'
                //stepped: 'middle'
                //fill: false,
            },
            {
                label: 'GNO Margin Of Safety %',
                data: dashboardData.bookValueTime.book_ratio,
                borderColor: 'green',//'rgb(255, 99, 132)',
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'red' : 'green';
                },
                type: 'line',
                order: 1,
                fill:true,
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
                    display: false,
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
                    position: 'left',
                    display:false,
                    title: {
                        display: false,
                        text: 'validators'
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                },
                y2: {
                    //display: false,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    display:false,
                    title: {
                        display: false,
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
                  text: 'GNo Book Ratio'
                },
                //zoom: charts.GetZoomOption(1,this.elementId),
                legend: {
                    position: 'bottom',
                    display:false,
                },
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return [
                               /* `Purchase: ${index}`,*/
                                `GNO Book_value: ${dashboardData.bookValueTime.book_value[index]}`,
                                `GNO Marketcap: ${dashboardData.bookValueTime.market_cap[index]}`
                            ];
                          }
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

GnoPriceValueChart.prototype.OnScaleChange = function(value){

};

new GnoPriceValueChart();