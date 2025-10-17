function WalletsWealthDistributionChart(elmId, state, token_symbol){
    console.log("[WalletsWealthDistributionChart] registered", elmId);
    this.elementId = elmId;
    this.dataKey = state;
    this.token_symbol = token_symbol;
    charts[this.elementId] = this;
}

WalletsWealthDistributionChart.prototype.Init = function(){
    console.log("[WalletsWealthDistributionChart] Init", this.elementId);
    const chartConfig = this.ConfigurateChart(this);
    charts.Render(this.elementId, chartConfig);
};

WalletsWealthDistributionChart.prototype.ConfigurateChart = function(inst){
    var chartdata = {
        labels: walletsSnapshotDist[inst.dataKey].balance,
        datasets: [
            {
                label: `Wallets`,
                data: walletsSnapshotDist[inst.dataKey].wallets,
                order: 0,
                yAxisID: 'y1',
                borderColor: 'black',
                backgroundColor: 'black'
            },
        ]
    };

    return chartConfig = {
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
                        display: true,
                        text: `${inst.token_symbol} Balance`
                    },
                    //type: 'category',
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    offset: false
                },
                y1: {
                    display: (chartsUIconfig) ? chartsUIconfig.validators.yaxis : true,
                    type: 'logarithmic',
                    position: 'left',
                    title: {
                        display: true,
                        text: `Wallets`
                    },
                    grid: {
                        drawOnChartArea: false, // only want the grid lines for one axis to show up
                    },
                    label: `${inst.token_symbol}`,
                }
            },
            plugins: {
                title: {
                  display: false,
                  text: 'Wealth Distribution'
                },
                //zoom: charts.GetZoomOption(1,this.elementId),
                legend: {
                    position: 'bottom',
                    display: (chartsUIconfig) ? chartsUIconfig.validators.legend : true,
                },
                tooltip: {
                    callbacks: {}
                },
                annotation: {
                    annotations: {},
                },
            },
            transitions: charts.GetTransitions(),
        }
    };
};

(function(){
    this.chartsElms = document.getElementsByClassName("distribution-wealth-chart");
    for(const chart of this.chartsElms){
        new WalletsWealthDistributionChart(chart.id, chart.dataset.state, chart.dataset.token);
    }
})();