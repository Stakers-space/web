function ChartPresenter(){
    this.resetButtonsName = "chart-button_reset";
    this.genesis = 0; /*1231968730000 + 100000;*/
    this.interactionButtonsClass = "buttonline";
    this.interactionSelectorname = "chart-timeframe";
    this.charts = {};
    this.thisYear = new Date().getUTCFullYear();
    this.color = {
        liteGray: "#f6f6f6"
    };
    window.isMobileDevice = false;
	(function(a){ if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) window.isMobileDevice = true;})(navigator.userAgent||navigator.vendor||window.opera);
};

ChartPresenter.prototype.ChartDescriptions = function(){
    // install listeners
    var descBtns = document.getElementsByClassName("desc-btn");
    var descBtnsL = descBtns.length;
    for(var i=0;i<descBtnsL;i++) {descBtns[i].addEventListener("click", expandDesc);}

    // expand
    function expandDesc(e){
        e.preventDefault();
        e.currentTarget.style.display = "none";
        var descElement = e.currentTarget.parentElement;
        descElement.children[0].style.display = "block";
        descElement.children[0].style.maxWidth = "100%";
        descElement.children[0].style.height = "unset";
    }
};

ChartPresenter.prototype.ShouldDisplayLegend = function(){
    try{
        return (!window.isMobileDevice || (screen.availHeight < screen.availWidth));
    } catch(e){
        return (!window.isMobileDevice || (window.innerHeight < window.innerWidth));
    }
};

ChartPresenter.prototype.ActivateLazyLoad = function(){
    this.isIntersectionObserver = ('IntersectionObserver' in window);
    
    // install listeners
    if(this.isIntersectionObserver){ // install observer
        try {
            // images - pokud neexistuje native loading
            this.interactionObserverChart = new window.IntersectionObserver(function(chartsArr,observer){
                chartsArr.forEach(function(chart){ 
                 if (chart.intersectionRatio > 0) {
                    charts.InitChart(chart.target);
                    // init chart 
                    observer.unobserve(chart.target);
                 }
             });
            }, { threshold: 0.2 });
        } catch(er){
            this.isIntersectionObserver = false;
            window.console.error("no interactionObserver", er);
        }
    }

    this.lazyLoadElements = document.getElementsByName('lazy-canvas');
    var lil = this.lazyLoadElements.length;
    if(this.isIntersectionObserver){
        for(var t=0;t<lil;t++){
            this.interactionObserverChart.observe(this.lazyLoadElements[t]);
            this.lazyLoadElements[t].removeAttribute("name");
            t--; lil--;
        }
    } else { // display all charts (explorer)
		 for(var i=0;i<lil;i++){ charts.InitChart(charts.lazyLoadElements[i]); }
    }
};

ChartPresenter.prototype.InitChart = function(elm){
    console.log("[ChartPresenter] Init chart ", elm.id);
    if(charts[elm.id]) charts[elm.id].Init();
};

ChartPresenter.prototype.GetZoomOption = function(optionId,elmId,zoomWheel = false){
    var zoomOptions = {};
    switch (optionId) {
        case 1:
            zoomOptions = {
                limit: {
                    x: {min: charts.MD.at[0]/*'original'*/, max: charts.MD.at[charts.MD.at.length-1]/*'original'*/, minRange: 60 * 1000},
                },
                pan: {
                  enabled: true,
                  mode: 'x',
                  modifierKey: 'ctrl',
                  onPanComplete: function(){ charts.FetchData(elmId);},
                },
                zoom: {
                    wheel: {
                        enabled: zoomWheel,
                    },
                    drag: {
                        enabled: true
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x',
                    onZoomComplete:function(){
                        charts.OnZoomComplete(elmId);
                        charts.FetchData(elmId);
                    }
                },
            };
            break;
        default:
            break;
    }
    return zoomOptions;
};

ChartPresenter.prototype.GetInteractionOption = function(){
    return {
        mode: 'index',
        intersect: false,
    };
};

ChartPresenter.prototype.GetTransitions = function(){
    return {
        zoom: {
          animation: {
            duration: 100
          }
        }
    };
};

ChartPresenter.prototype.GetBrandAnotation = function(elmId){
    return {
        type: 'box',
        backgroundColor: 'transparent',
        borderWidth: 0,
        label: {
          drawTime: 'afterDatasetsDraw',
          display: true,
          color: 'rgba(0, 0, 0, 0.08)',
          content: (token.name+' | SecurityRatio.com'),
          font: {
            size: (ctx) => ctx.chart.chartArea.height / 10
          },
          position: 'center'
        }
    };
};

ChartPresenter.prototype.SaveAsImg = function(elmId){
    var image = charts.charts[elmId].toBase64Image();
    console.log(image);
    var a = document.createElement('a');
    a.href = myChart.toBase64Image();
    a.download = 'chart.png';
    a.click();
};

ChartPresenter.prototype.GetXscale = function(type,minScale,maxScale){
    var xScale = {};
    switch (type) {
        case "time":
            xScale = {
                position: 'bottom',
                /*min: charts.MD.at[0],
                max: charts.MD.at[charts.MD.at.length-1],*/
                type: 'time',
                ticks: {
                  autoSkip: true,
                  autoSkipPadding: 50,
                  maxRotation: 0
                },
                time: {
                    displayFormats: {
                        hour: 'HH:mm',
                        minute: 'HH:mm',
                        second: 'HH:mm:ss'
                    }
                }
            };
            break;
        case "text":{
            xScale = {
                display: true,
                title: {
                    display: false,
                    text: 'Time'
                },
                //type: 'category',
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
                offset: false
            };
            break;
        }
        default:
            xScale = {
                display: true,
                title: {
                    display: true,
                    text: 'Month / Year'
                },
                //type: 'category',
                grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            };
            break;
    }
    return xScale;
};

ChartPresenter.prototype.Render = function(elmId,chartConfig){
    //console.log("[ChartPresenter] Render", elmId);
    if(this.charts[elmId] === undefined){
        //console.log("Render chart: ", elmId, chartConfig);
        this.charts[elmId] = new Chart(document.getElementById(elmId), chartConfig);
    } else {
        //console.log("Update chart ", elmId, this.charts[elmId], this.charts[elmId]);
        this.charts[elmId].update();
    }
    console.log("Rendered",elmId,this.charts[elmId]);
};

ChartPresenter.prototype.FetchData = function(elmId){
    console.log("Fetch data", elmId);
    try {
        charts[elmId].OnFetch();
    } catch (err) {}
};

ChartPresenter.prototype.UpdateZoomButtonVisibility = function(elmId, visible){
    // zoom buttons
    var elms = document.getElementsByName(this.resetButtonsName);
    for(var e = 0; e<elms.length;e++){
        if(elms[e].getAttribute('data-chartid') === elmId) {
            elms[e].style.visibility = (visible) ? "visible" : "hidden";
            break;
        }
    }
};
ChartPresenter.prototype.InstallListeners = function(){
    // zoom buttons
    var elms = document.getElementsByName(this.resetButtonsName);
    for(var e = 0; e<elms.length;e++){
        //console.log("InstallZoomButtonsListener", elms[e].getAttribute('data-chartid'), elms[e]);
        elms[e].addEventListener('click', charts.OnResetZoom);
    }

    // scale buttons
    var elms1 = document.getElementsByClassName(this.interactionButtonsClass);
    for(var e = 0; e<elms1.length;e++){
        var childrenL = elms1[e].children.length;
        for(var c=0;c<childrenL;c++){
            elms1[e].children[c].addEventListener('click', charts.OnScaleButtonPressed);
        }
        //console.log("InstallListeners", elms[e].getAttribute('data-chartid'), elms[e]);
    }

    // timeframe selectors
    var elms2 = document.getElementsByName(this.interactionSelectorname);
    for(var e = 0; e<elms2.length;e++){
        elms2[e].addEventListener('click', charts.OnScaleButtonPressed);
        console.log("InstallListeners", elms2[e].getAttribute('data-chartid'), elms2[e]);
    }
};
ChartPresenter.prototype.OnScaleButtonPressed = function(e){
    e.preventDefault();
    var elmId = e.currentTarget.getAttribute('data-chartid');
    console.log("OnScaleButtonPressed |",e.currentTarget, e.currentTarget.nodeName);
    
    if(e.currentTarget.nodeName.toUpperCase() === 'BUTTON'){
        buttonInteraction(e.currentTarget);
    } else {
        // selector interaction
    }
    
    // process request
    charts[elmId].OnScaleChange(e.currentTarget.value);

    function buttonInteraction(targetedElm){
        // Remove active class from all buttons
        var buttonsPanels = document.getElementsByClassName(charts.interactionButtonsClass);
        var bpl = buttonsPanels.length;
        for(var i=0;i<bpl;i++){
            if(buttonsPanels[i].getAttribute("data-chartid") === elmId){
                for(var a=0;a<buttonsPanels[i].children.length;a++){
                    buttonsPanels[i].children[a].classList.remove("active");
                }
                break;
            }
        }
        // Add active class for pressed button
        targetedElm.classList.add("active");
    }
};

ChartPresenter.prototype.OnResetZoom = function(e){ 
    e.preventDefault();
    var elmId = e.currentTarget.getAttribute('data-chartid');
    console.log("Reset zoom",e.currentTarget, elmId, charts[elmId].timeframe);
    charts.charts[elmId].resetZoom(); 
    charts.UpdateZoomButtonVisibility(elmId, false);
    if(charts[elmId].timeframe){
        try {
            var thisElmParent = document.getElementById(charts[elmId].elementId).parentElement;
            var selectElms = thisElmParent.getElementsByTagName("select");
            if(selectElms.length > 0) selectElms[0].value = charts[elmId].timeframe;
        } catch (error) {
            console.error(error);
        }
    }
};
ChartPresenter.prototype.OnZoomComplete = function(elmId){
    this.charts[elmId].update('none');
    this.UpdateZoomButtonVisibility(elmId, true);
};

ChartPresenter.prototype.PushTextAnotations = function(xAxis, outObj){
    console.log("PushTextAnotations", xAxis, outObj);
    // check annotation for each year
    if(!window.isMobileDevice){
        try{
            var al = this.annotations.length;
            for(var i=0;i<al;i++){ 
                if(xAxis.indexOf(this.annotations[i].xValue) > -1) outObj[i.toString()] = this.annotations[i];
            }
        } catch(e){
            console.error(e);
        }
    }
};

ChartPresenter.prototype.RequestNewData = function(type,fromP,toP,detail,cb){

    var reqUrl = "/api/get?id="+token.name+"&t="+type+"&d="+detail;
    
    if(fromP) reqUrl += "&from="+fromP;
    if(toP) reqUrl += "&to="+toP;

    //console.log(reqUrl);
    httpRequest({
        type: "GET",
        url: reqUrl.toLowerCase(),
        data: ""
    }, function(err, data){
        if(!err && data !== null){
            return cb(err,data);
        } else {
            window.console.log(err, data);
        }
    });

    function httpRequest(request, callback){
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function(){ //console.log(xmlhttp.readyState, xmlhttp.status);
            if(xmlhttp.readyState == 4 && xmlhttp.status === 200){
                if(callback !== undefined){ return callback(null, this.response); }
            } else if ((xmlhttp.readyState == 4 && xmlhttp.status === 404) || xmlhttp.readyState == 5){ //server is down     
                if(callback !== undefined){ return callback(xmlhttp.status, null); }
            }
        };
        xmlhttp.open(request.type, request.url);
        //if(request.credentials === true) xmlhttp.withCredentials = true;
        //xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //xmlhttp.setRequestHeader('X-Requested-With','XMLHttpRequest'); // skrz nette
        xmlhttp.send(request.data);
    }
};
var charts = new ChartPresenter();


/*
    var currency = "ETH"

    function slotToTime(slot) {
        var gts =  1606824023 
        var sps =  12 
        return (gts + slot * sps) * 1000
    }

    function epochToTime(epoch) {
        var gts =  1606824023 
        var sps =  12 
        var spe =  32 
        return (gts + epoch * sps * spe) * 1000
    }

    function timeToEpoch(ts) {
        var gts =  1606824023 
        var sps =  12 
        var spe =  32 
        var slot = Math.floor((ts / 1000 - gts) / sps)
        var epoch = Math.floor(slot / spe)
        if (epoch < 0) return 0
        return epoch
    }

    function timeToSlot(ts) {
        var gts =  1606824023 
        var sps =  12 
        var spe =  32 
        var slot = Math.floor((ts / 1000 - gts) / sps)
        if (slot < 0) return 0
        return slot
    }
*/