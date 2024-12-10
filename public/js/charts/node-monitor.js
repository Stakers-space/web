    const isSmallScreen = (window.innerWidth < 700);
    for (const id in resourcesByServer) {
        if (resourcesByServer.hasOwnProperty(id)) {
            let chartDataFormat = {
                time: [],
                disk: [],
                ram: [],
                swap: [],
                peers: [],
                vpn_status: [],
                vpn_server: []
            }
            for(const obj of resourcesByServer[id]){
                chartDataFormat.time.push(obj.timestamp);
                chartDataFormat.disk.push(obj.disk_usage);
                chartDataFormat.ram.push(obj.ram_usage);
                chartDataFormat.swap.push(obj.swap_usage);
                chartDataFormat.peers.push(obj.beacon_peers);
                chartDataFormat.vpn_status.push(obj.vpn);
                chartDataFormat.vpn_server.push(obj.vpn_server);
            }
            console.log(id, chartDataFormat);

            // render chart
            let chartConfig = {
                type: 'line',
                data: {
                    labels: chartDataFormat.time,
                    datasets: [
                        {
                            label: 'Disk Usage %',
                            data: chartDataFormat.disk,
                            type: 'line',
                            borderColor: "black",
                            backgroundColor: "black",
                            order: 1,
                            pointRadius:0,
                            yAxisID: 'y1',
                            borderWidth: 3,
                        },
                        {
                            label: 'RAM Usage %',
                            data: chartDataFormat.ram,
                            type: 'line',
                            borderColor: 'red',//'rgb(255, 99, 132)',
                            backgroundColor: 'red',//'rgb(255, 99, 132)',
                            order: 2,
                            yAxisID: 'y1',
                            borderWidth: 3,
                        },
                        {
                            label: 'SWAP usage %',
                            data: chartDataFormat.swap,
                            type: 'line',
                            borderColor: 'blue',//'rgb(255, 99, 132)',
                            backgroundColor: 'blue',//'rgb(255, 99, 132)',
                            order: 3,
                            yAxisID: 'y1',
                        },
                        {
                            label: 'Peers',
                            data: chartDataFormat.peers,
                            type: 'line',
                            borderColor: 'green',//'rgb(255, 99, 132)',
                            backgroundColor: 'green',//'rgb(255, 99, 132)',
                            order: 3,
                            yAxisID: 'y1',
                        },
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: charts.GetInteractionOption(),
                    stacked: false,
                    scales: {
                        x: {
                            display: (isSmallScreen) ? false : true,
                            title: {
                                display: true,
                                text: 'Timestamp'
                            },
                            //type: 'category',
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                            offset: false
                        },
                        y1: {
                            display: true,
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
                    },
                    plugins: {
                        title: {
                        display: false,
                        text: 'Resources view'
                        },
                        //zoom: charts.GetZoomOption(1,this.elementId),
                        legend: {
                            position: 'bottom',
                            display:true,
                        },
                        tooltip: {
                            callbacks: {
                                afterBody: function(context) {
                                    const index = context[0].dataIndex;
                                    return [
                                        `VPN status: ${chartDataFormat.vpn_status[index]}`,
                                        `VPN server: ${chartDataFormat.vpn_server[index]}`,
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
            charts.Render("srv_"+id, chartConfig);
        }
    }
