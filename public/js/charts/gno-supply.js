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
    dashboardData.buybacks.agg.quarter.unshift("");
    dashboardData.buybacks.agg.quarter.push("");

    dashboardData.buybacks.agg.shares_outstanding.unshift(dashboardData.buybacks.agg.shares_outstanding[0] + dashboardData.buybacks.agg.gnoBought[0]);
    dashboardData.buybacks.agg.shares_outstanding.push(dashboardData.buybacks.agg.shares_outstanding[dashboardData.buybacks.agg.shares_outstanding.length-1]);
    
    dashboardData.buybacks.agg.buyback_share_ratio.unshift(0);
    dashboardData.buybacks.agg.buyback_share_ratio.push(0);

    dashboardData.buybacks.agg.purchases.unshift();
    dashboardData.buybacks.agg.purchases.push();
    dashboardData.buybacks.agg.gnoBought.unshift();
    dashboardData.buybacks.agg.gnoBought.push();
    dashboardData.buybacks.agg.usdPaid.unshift();
    dashboardData.buybacks.agg.usdPaid.push();
    dashboardData.buybacks.agg.gnoPrice_calc.unshift();
    dashboardData.buybacks.agg.gnoPrice_calc.push();

    var chartdata = {
        labels: dashboardData.buybacks.agg.quarter,
        datasets: [
            {
                label: 'Outstanding GNO',
                data: dashboardData.buybacks.agg.shares_outstanding,
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
                data: dashboardData.buybacks.agg.buyback_share_ratio,
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
                    min: Math.round((dashboardData.buybacks.agg.shares_outstanding[dashboardData.buybacks.agg.shares_outstanding.length-1] - 50000) / 50000) * 50000,//1350000,
                    max: Math.ceil((dashboardData.buybacks.agg.shares_outstanding[0]) / 50000) * 50000,
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
                                `Purchases: ${dashboardData.buybacks.agg.purchases[index]}`,
                                `GNO bought: ${dashboardData.buybacks.agg.gnoBought[index]}`,
                                `USD Paid: ${dashboardData.buybacks.agg.usdPaid[index]}`,
                                `Avg price: ${dashboardData.buybacks.agg.gnoPrice_calc[index]}`,
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