function GnoBuybackSupplyChart(){
    console.log("[GnoBuybackSupplyChart] registered");
    this.elementId = 'buybacksupply_chart';
    charts[this.elementId] = this;
    this.onScaleChange = this.OnScaleChange;
}
GnoBuybackSupplyChart.prototype.Init = function(){
    var app = this;
    console.log("[GnoBuybackSupplyChart] Init");
    app.ConfigurateChart();
    charts.Render(app.elementId, app.chartConfig);
};

GnoBuybackSupplyChart.prototype.ConfigurateChart = function(){
    circulationData.buybacks.agg.quarter.unshift("");
    circulationData.buybacks.agg.quarter.push("");

    circulationData.buybacks.agg.shares_outstanding.unshift(circulationData.buybacks.agg.shares_outstanding[0] + circulationData.buybacks.agg.gnoBought[0]);
    circulationData.buybacks.agg.shares_outstanding.push(circulationData.buybacks.agg.shares_outstanding[circulationData.buybacks.agg.shares_outstanding.length-1]);
    
    circulationData.buybacks.agg.buyback_share_ratio.unshift(0);
    circulationData.buybacks.agg.buyback_share_ratio.push(0);

    circulationData.buybacks.agg.purchases.unshift();
    circulationData.buybacks.agg.purchases.push();
    circulationData.buybacks.agg.gnoBought.unshift();
    circulationData.buybacks.agg.gnoBought.push();
    circulationData.buybacks.agg.usdPaid.unshift();
    circulationData.buybacks.agg.usdPaid.push();
    circulationData.buybacks.agg.gnoPrice_calc.unshift();
    circulationData.buybacks.agg.gnoPrice_calc.push();

    var chartdata = {
        labels: circulationData.buybacks.agg.quarter,
        datasets: [
            {
                label: 'Outstanding GNO',
                data: circulationData.buybacks.agg.shares_outstanding,
                borderColor: 'black',//'rgb(255, 99, 132)',
                backgroundColor: 'black',//'rgb(255, 99, 132)',
                order: 0,
                type: 'line',
                yAxisID: 'y',
                pointRadius:0,
                borderWidth: 4,
                stepped: /*'after',//*/true,
                //stepped:'before'
                //stepped: 'middle'
                /*fill: false,
                */
            },
            {
                label: 'Buyback ratio %',
                data: circulationData.buybacks.agg.buyback_share_ratio,
                borderColor: 'green',//'rgb(255, 99, 132)',
                backgroundColor: 'green',//'rgb(255, 99, 132)',
                /*type: 'line',*/
                order: 1,
                yAxisID: 'y1'
                /*
                fill: true,
                */
            }
        ]
    };

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
                    display: (chartsUIconfig) ? chartsUIconfig.supply.xaxis : true,
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
                    display: (chartsUIconfig) ? chartsUIconfig.supply.xaxis : true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Circ supply'
                    },
                    // grid line settings
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    min: Math.round((circulationData.buybacks.agg.shares_outstanding[circulationData.buybacks.agg.shares_outstanding.length-1] - 50000) / 50000) * 50000,//1350000,
                    max: Math.ceil((circulationData.buybacks.agg.shares_outstanding[0]) / 50000) * 50000,
                    /*ticks: {
                        beginAtZero: false,
                        min: 1400000
                    }*/
                },
                y1: {
                    display: (chartsUIconfig) ? chartsUIconfig.supply.xaxis : true,
                    type:'linear',//'logarithmic',
                    position: 'right',
                    title: {
                        display: true,
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
                  text: 'Gnosis Buybacks'
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
                                `Purchases: ${circulationData.buybacks.agg.purchases[index]}`,
                                `GNO bought: ${circulationData.buybacks.agg.gnoBought[index]}`,
                                `USD Paid: ${circulationData.buybacks.agg.usdPaid[index]}`,
                                `Avg price: ${circulationData.buybacks.agg.gnoPrice_calc[index]}`,
                            ];
                          }
                    }
                },
                annotation: {
                    /*annotations: {
                       
                    },*/
                },
            },
            transitions: charts.GetTransitions(),
        }
    };
};

GnoBuybackSupplyChart.prototype.OnScaleChange = function(value){
    console.log("On Scale Change", value, this, "chart:", charts.charts[this.elementId], "chart data:", charts.charts[this.elementId].data);
};

new GnoBuybackSupplyChart();