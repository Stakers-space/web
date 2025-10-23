function ServerConfCharts(elmId){
    console.log("[ServerConfCharts] registered", elmId);
    this.elementId = elmId;
    charts[this.elementId] = this;
}

ServerConfCharts.prototype.Init = function(){
    const chartCfg = chartConfig[this.elementId];
    if(!chartCfg) return console.error(`[ServerConfCharts] No chart config found for element ID: ${this.elementId}`);
    
    const nf = new Intl.NumberFormat('en-US');
    const hydrateConfig = (cfg) => {
        const opts = cfg.options || {};
        opts.interaction = opts.interaction ?? charts.GetInteractionOption();
        opts.responsive = opts.responsive ?? true;
        opts.maintainAspectRatio = opts.maintainAspectRatio ?? false;
        opts.layout = { padding: { left:0, right:0, top:0, bottom:0 }, margin: { left:0, right:0, top:0, bottom:0 } };
        // Plugins
        
        if (!opts.plugins) opts.plugins = {};

        // Plugins-Tooltip
        if (!opts.plugins.tooltip) opts.plugins.tooltip = {};

        // Plugins-Tooltip-Callbacks
        opts.plugins.tooltip.callbacks = {
            label: (ctx) => `${ctx.dataset.label}: ${nf.format(ctx.raw)}`
        };

        // Zoom
        opts.plugins.zoom = {
            limits: {
                x: { min: 0, max: (cfg.data.labels?.length ?? 1) - 1, minRange: 10 }
            },
            pan:  { enabled: true, mode: 'x', modifierKey: 'ctrl', onPanComplete: this.onZoomComplete.bind(this) },
            zoom: { wheel: {enabled: true }, pinch: {enabled: true}, drag: {enabled: true}, mode: 'x', onZoomComplete: this.onZoomComplete.bind(this) },
        };
        
        // Scales
        const scales = opts.scales || {};
        // y ticks number-format
        if (opts.scales) {
            if (cfg.options._useNumberFormat) {
                for (const [key, scale] of Object.entries(cfg.options.scales)) {
                    const hidden = scale.display === false;
                    if (hidden) {
                        scale.grid   = { ...(scale.grid||{}), display: false };
                        scale.ticks  = { ...(scale.ticks||{}), display: false };
                        scale.border = { ...(scale.border||{}), display: false };
                        scale.afterFit = (s) => { 
                            s.width = 0; 
                            s.height = 0;
                        };
                    }
                    
                    if (typeof scale.afterFitWidth === 'number') {
                        const w = scale.afterFitWidth;
                        scale.afterFit = (s) => { s.width = w; };
                        delete scale.afterFitWidth;
                    }
                }
                ['y','y1','y2'].forEach(ax => {
                    if (scales[ax]) {
                        const t = (scales[ax].ticks ||= {});
                        t.callback = (v) => nf.format(v);
                    }
                });
                delete cfg.options._useNumberFormat;
            }
        }

         if (cfg.options._usePosNegBarColors) {
            const POS = 'rgba(34,197,94,0.9)';  // green-500
            const NEG = 'rgba(239,68,68,0.9)';  // red-500
            (cfg.data.datasets || []).forEach(ds => {
                if ((ds.type || cfg.type) === 'bar') {
                ds.backgroundColor = (ctx) => (ctx.raw >= 0 ? POS : NEG);
                ds.borderWidth = 0;
                ds.categoryPercentage = ds.categoryPercentage ?? 0.95;
                ds.barPercentage = ds.barPercentage ?? 1.0;
                }
            });
            delete cfg.options._usePosNegBarColors;
        }

        cfg.options.animation = cfg.options.animation ?? false;

        cfg.options = opts;
        console.log(this.elementId, "opts:", opts);
        return cfg;
    };

    const conf = hydrateConfig(chartCfg)
    console.log("[ServerConfCharts] Init", this.elementId, conf);
    charts.Render(this.elementId, conf);

    if(chartCfg.syncScaleWith && chartConfig[chartCfg.syncScaleWith]){
        //console.log("register bindSyncZoomPan |", this.elementId, chartCfg.syncScaleWith, charts.charts);
        //this.bindSyncZoomPan(charts.charts[this.elementId], charts.charts[chartCfg.syncScaleWith]);
    }
};

ServerConfCharts.prototype.onZoomComplete = function(chrt){
    if(!chartConfig[this.elementId].syncScaleWith) return;
    console.log("onZoomComplete:", chrt, this);
    const sx = chrt.chart.scales.x;
    console.log("sx", sx);
    const { min, max } = (typeof sx.getUserBounds === 'function')
      ? sx.getUserBounds()             // { min, max, minDefined, maxDefined }
      : { min: sx.min, max: sx.max };
        console.log('x min/max:', min, max);
    try {
        charts.charts[chartConfig[this.elementId].syncScaleWith].options.scales.x.min = min;
        charts.charts[chartConfig[this.elementId].syncScaleWith].options.scales.x.max = max;
        console.log("Updated synced chart scales.x min/max:", charts.charts[chartConfig[this.elementId].syncScaleWith].options.scales.x);
        charts.charts[chartConfig[this.elementId].syncScaleWith].update('none');
    } catch(e){
        console.error("onZoomComplete error:", e);
    } 
};

(function(){
    const chartsElms = document.getElementsByClassName("chart_canvas");
    for(const chart of chartsElms){
        new ServerConfCharts(chart.id);
    }
})();