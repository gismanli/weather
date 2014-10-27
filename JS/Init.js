/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var obj = {};
var map, layer, url = "http://localhost:8090/iserver/services/map-BaseMap/rest/maps/BaseMap";
var vector_layer, themeLayer, markerLayer, heatMapLayer, temporary_layer;
var box;
var styleMap;
function init() {
    var dragPan = new SuperMap.Control.DragPan();
    map = new SuperMap.Map("map", {
        controls: [
            new SuperMap.Control.LayerSwitcher(),
            dragPan,
            new SuperMap.Control.Navigation({
                enableKinetic: true,
                zoomWheelEnabled: true
            })
        ]
    });
    dragPan.activate();
    layer = new SuperMap.Layer.TiledDynamicRESTLayer("地图", url, {transparent: true, cacheEnabled: true}, {maxResolution: "auto"});
    layer.events.on({
        "layerInitialized": function() {
            map.addLayer(layer);
            map.setCenter(new SuperMap.LonLat(111.76, 27.4), 0);
            layer.params.layersID = "[0,3]";
            map.events.register("zoomend", "map", function() {
                if (map.getZoom() !== 0)
                    layer.params.layersID = "[1,2,3]";
                if (map.getZoom() === 0)
                    layer.params.layersID = "[0,3]";
            });
        }});
    map.addControl(new SuperMap.Control.LayerSwitcher());
    styleMap = new SuperMap.StyleMap({
        "default": {
            fillOpacity: 0.7,
            strokeOpacity: 1,
            strokeColor: "#1f0fee",
            graphicWidth: 32,
            graphicHeight: 32,
            label: "${name}",
            fontSize: "12px",
            fontWeight: "bold",
            fontColor: "#ff0000",
            labelOutlineColor: "red",
            labelOutlineWidth: 3
        }
    });
    vector_layer = new SuperMap.Layer.Vector("气温图", {
        rendererOptions: {zIndexing: true}
    });
    map.addLayer(vector_layer);
    markerLayer = new SuperMap.Layer.Markers("Markers");
    map.addLayer(markerLayer);
    heatMapLayer = new SuperMap.Layer.HeatMapLayer(
            "热力图",
            {
                "radius": 100,
                "featureWeight": "value",
                "featureRadius": "geoRadius"
            }
    );
    map.addLayer(heatMapLayer);
}

function _refresh(json, count) {
    map.removeLayer(vector_layer);
    vector_layer = null;
    vector_layer = new SuperMap.Layer.Vector("气温图", {
        rendererOptions: {zIndexing: true}
    });
    map.addLayer(vector_layer);
    for (var i = 0; i < count; i++) {
        var geometries = json[i];
        var geometries = eval("(" + geometries + ")");
        var size = new SuperMap.Size(24, 24);
        var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
        var icon = new SuperMap.Icon("IMG/weather/" + geometries.weather + ".gif", size, offset);
        marker = new SuperMap.Marker(new SuperMap.LonLat(geometries.x, geometries.y), icon);
        marker.data = geometries.name;
        marker.temp = geometries.temp;
        marker.min = geometries.min;
        marker.max = geometries.max;
        marker.wd = geometries.wd;
        marker.ws = geometries.ws;
        marker.sd = geometries.sd;
        marker.weather = geometries.weather;
        marker.events.on({
            "click": openInfoWin,
            "scope": marker
        });
        markerLayer.addMarker(marker);
    }
    ;
}

function _delete() {
    map.removeLayer(vector_layer);
    vector_layer = null;
    vector_layer = new SuperMap.Layer.Vector("气温图", {
        styleMap: styleMap,
        rendererOptions: {zIndexing: true}
    });
    map.addLayer(vector_layer);
    markerLayer.clearMarkers();
    closeInfoWin();
    heatMapLayer.removeAllFeatures();
}

function _update_station(json, count) {
    if (count !== 0)
        $("#date_station_list").html("");
    for (var i = 0; i < count; i++) {
        var geometries = eval("(" + json[i] + ")");
        $("#date_station_list").append("<tr><td><input type=\"checkbox\" id=\"date_" + i + "\" onclick=\"_checkbox('" + geometries.x + "','" + geometries.y + "','" + geometries.name + "','" + geometries.temp + "','" + geometries.min + "','" + geometries.max + "','" + geometries.wd + "','" + geometries.ws + "','" + geometries.sd + "','" + geometries.weather + "','" + geometries.time + "','" + i + "');\"/></td><td>" + geometries.name + "</td><td>" + geometries.temp + "℃&nbsp&nbsp</td><td>" + geometries.min + "</td><td>" + geometries.max + "</td><td>" + geometries.weather + "</td><td>" + geometries.wd + "</td><td>" + geometries.ws + "</td><td>" + geometries.sd + "</td><td>" + geometries.time + "</td></tr>");
    }
    ;
}

function _update_station_hostory() {
    obj = {};
    connect("TestServlet", {
        type: "USER_SEARCH_TEMPERATURE",
        data: {
            city: $("#city_table").val().toString(),
            month: $("#month_table").val().toString(),
            day: $("#day_table").val().toString(),
            hour: $("#hour_table").val().toString()
        }
    }, function(e) {
        var dataarr1 = eval("(" + e + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var json = dataarr4.split(",,");
        var count = dataarr1.count;
        if (count !== 0)
            $("#date_county_list").html("");
        for (var i = 0; i < count; i++) {
            var geometries = eval("(" + json[i] + ")");
            $("#date_county_list").append("<tr><td>" + geometries.name + "</td><td>" + geometries.temp + "℃&nbsp&nbsp</td><td>" + geometries.wd + "</td><td>" + geometries.ws + "</td><td>" + geometries.sd + "</td><td>" + geometries.time + "</td><td><input type=\"checkbox\" class=\"admin_history_table\" onclick=\"_checkbox_admin_history('" + geometries.name + "','" + geometries.temp + "','" + geometries.wd + "','" + geometries.ws + "','" + geometries.sd + "');\"/></td></tr>");
        }
    }, null);
}

function _update_station_all(json, count) {
    obj = {};
    if (count !== 0)
        $("#date_station_all").html("");
    for (var i = 0; i < count; i++) {
        var geometries = eval("(" + json[i] + ")");
        $("#date_station_all").append("<tr><td><input type=\"checkbox\" id=\"date_" + i + "\" onclick=\"_checkbox('" + geometries.x + "','" + geometries.y + "','" + geometries.name + "','" + geometries.temp + "','" + geometries.min + "','" + geometries.max + "','" + geometries.wd + "','" + geometries.ws + "','" + geometries.sd + "','" + geometries.weather + "','" + geometries.time + "','" + i + "');\"/></td><td>" + geometries.name + "</td><td>" + geometries.temp + "℃&nbsp&nbsp</td><td>" + geometries.min + "</td><td>" + geometries.max + "</td><td>" + geometries.weather + "</td><td>" + geometries.wd + "</td><td>" + geometries.ws + "</td><td>" + geometries.sd + "</td><td>" + geometries.time + "</td><td><input type=\"checkbox\" class=\"admin_table\" onclick=\"_checkbox_admin('" + geometries.name + "','" + geometries.temp + "','" + geometries.min + "','" + geometries.max + "','" + geometries.wd + "','" + geometries.ws + "','" + geometries.sd + "','" + geometries.weather + "','" + geometries.time + "');\"/></td></tr>");
    }
    ;
}

function _selectfeature(method) {
    var queryParam, queryByBoundsParams, queryService;
    temporary_layer = new SuperMap.Layer.Vector("temp");
    map.addLayer(temporary_layer);
    var drawControls = {
        polygon: new SuperMap.Control.DrawFeature(temporary_layer,
                SuperMap.Handler.Polygon),
        box: new SuperMap.Control.DrawFeature(temporary_layer,
                SuperMap.Handler.RegularPolygon, {
                    handlerOptions: {
                        sides: 4,
                        irregular: true
                    }
                }
        )
    };
    box = drawControls[method];
    map.addControl(box);
    box.activate();
    box.events.register("featureadded", undefined, function(e) {
        var data = e.feature.geometry.getBounds();
        map.removeLayer(temporary_layer);
        temporary_layer = null;
        queryParam = new SuperMap.REST.FilterParameter({name: "county@county"}); //
        queryByBoundsParams = new SuperMap.REST.QueryByBoundsParameters({queryParams: [queryParam], bounds: data});
        queryService = new SuperMap.REST.QueryByBoundsService(url, {
            eventListeners: {
                "processCompleted": processCompleted,
                "processFailed": processFailed
            }
        });
        queryService.processAsync(queryByBoundsParams);
    });
}

function _getbounds() {
    obj = {};
    connect("TestServlet", {
        type: "USER_SEARCH_REGULAR",
        data: map.getExtent().toGeometry().toString()
    }, function(e) {
        var dataarr1 = eval("(" + e + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var json = dataarr4.split(",,");
        var count = dataarr1.count;
        _update_station(json, count);
        box = null;
        queryParam = new SuperMap.REST.FilterParameter({name: "county@county"});
        queryByBoundsParams = new SuperMap.REST.QueryByBoundsParameters({queryParams: [queryParam], bounds: map.getExtent()});
        queryService = new SuperMap.REST.QueryByBoundsService(url, {
            eventListeners: {
                "processCompleted": processCompleted,
                "processFailed": processFailed
            }
        });
        queryService.processAsync(queryByBoundsParams);
        $("#dialog_table_station").dialog("open");
    }, null);
}

function _initchart(myMin, myMax, length) {
    var myChart = new JSChart('graph_single', 'line');
    myChart.setDataArray(myMin, 'min');
    myChart.setDataArray(myMax, 'max');
    myChart.setLineColor('#ff0000', 'max');
    myChart.setLineColor('#000000', 'min');
    myChart.setTitle($("#country").val() + '气温走势图');
    myChart.setAxisNameX('日期');
    myChart.setAxisNameY('温度');
//    myChart.setAxisValuesNumberX(10);
    myChart.setShowXValues(false);
    myChart.setGridColor('#C5A2DE');
    myChart.setLineWidth(2);
    var start = $("#day_start").val().toString() * 1;
    for (var i = 0; i <= length; i++) {
        myChart.setLabelX([i, $("#month_charts").val().toString() + '_' + (start + i).toString()]);
    }
    myChart.setSize(750, 320);
    myChart.setAxisPaddingRight(70);
    myChart.setLegendShow(true);
    myChart.setLegendPosition(690, 50);
    myChart.setLegendForLine('max', 'Max');
    myChart.setLegendForLine('min', 'Min');
    myChart.draw();
}

function _getvalue() {
    if ($("#day_start").val().toString() === $("#day_end").val().toString()) {
        alert("至少选择两天");
        return;
    }
    connect("TestServlet", {
        type: "USER_SEARCH_VALUE",
        data: {
            county: $("#country").val().toString(),
            month: $("#month_charts").val().toString(),
            day_start: $("#day_start").val().toString(),
            day_end: $("#day_end").val().toString()
        }}, function(e) {
        var dataarr = eval("(" + e + ")");
        var dataarr2 = (dataarr.max).replace("[", "");
        var dataarr3 = dataarr2.replace("]", "");
        var dataarr4 = (dataarr.min).replace("[", "");
        var dataarr5 = dataarr4.replace("]", "");
        var maxarr = dataarr3.split(",");
        var minarr = dataarr5.split(",");
//        alert(minarr[0].toString() == null);
        if (minarr[0].toString() === "null") {
            alert("数据错误，请重新选择日期！");
            return;
        }
        var length = $("#day_end").val() - $("#day_start").val();
        var myMin = new Array();
        var myMax = new Array();
        for (var i = 0; i <= length; i++) {
            myMin.push([i, minarr[i] * 1]);
            myMax.push([i, maxarr[i] * 1]);
        }
        _initchart(myMin, myMax, length);
    }, null);
}

function _addimage(num) {
    if (num === 0) {
        image = layer;
        map.addLayer(image);
    } else if (num === 1) {
        var json, count;
        connect("TestServlet", {
            type: "USER_SEARCH_STATION"
        }, function(data) {
            var dataarr1 = eval("(" + data + ")");
            var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
            var dataarr3 = dataarr2.replace("}]", "}");
            var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
            json = dataarr4.split(",,");
            count = dataarr1.count;
            addThemeUnique(json, count);
        }, null);
    } else if (num === 2) {
        var json, count;
        connect("TestServlet", {
            type: "USER_SEARCH_STATION"
        }, function(data) {
            var dataarr1 = eval("(" + data + ")");
            var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
            var dataarr3 = dataarr2.replace("}]", "}");
            var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
            json = dataarr4.split(",,");
            count = dataarr1.count;
            createHeatPoints(json, count);
        }, null);
    }

//    if (map.getLayersByName("天气图")[0] != null) {
//        map.removeLayer(map.getLayersByName("天气图")[0], true);
//        map.addLayer(layer);
//        return;
//    } else {
//        if (map.getLayersByName("地图")[0] != null) {
//            map.removeLayer(map.getLayersByName("地图")[0], false);
////        return;
//        }
//    }
//    if (map.getLayersByName("热力图")[0] != null) {
//        map.removeLayer(map.getLayersByName("热力图")[0], true);
//        return;
//    } else {
//        if (map.getLayersByName("地图")[0] != null) {
//            map.removeLayer(map.getLayersByName("地图")[0], false);
//        }
//    }

}

function login() {
    connect("TestServlet", {
        type: "USER_LOGIN",
        data: {
            username: $("#username").val(),
            password: $("#password").val()
        }
    }, function(e) {
        var dataArr = eval("(" + e + ")");
        if (dataArr.success === "login_success") {
            $("#login_dialog").dialog("close");
            $("#login").css("display", "none");
            $("#exit").css("display", "block");
            $("#tools_dialog").dialog("open");
            $(".admin_table").css("display", "block");
            $(".admin_history_table").css("display", "block");
        } else {
            alert("登录失败");
        }
    });
}

function exit() {
    $("#login").css("display", "block");
    $("#exit").css("display", "none");
    $(".admin_table").css("display", "none");
    $(".admin_history_table").css("display", "none");
}

function clean() {
    var e = document.getElementById("password");
    e.value = '';
    e = document.getElementById("username");
    e.value = '';
}

function start() {
    connect("TestServlet", {
        type: "START"
    }, function(e) {
        alert("数据已开始获取！");
    });
}

function end() {
    connect("TestServlet", {
        type: "END"
    }, function(e) {
        alert("数据获取已停止！");
    });
}

function setTemperature() {
    connect("TestServlet", {
        type: "USER_SEARCH_TEMPERATURE",
        data: {
            city: "全部",
            month: $("#month").val().toString(),
            day: $("#day").val().toString(),
            hour: $("#hour").val().toString()
        }
    }, function(data) {
        var dataarr1 = eval("(" + data + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var jsonarr = dataarr4.split(",,");
        var count = dataarr1.count;
        temperature(jsonarr, count);
    }, null);
}

function temperature(json, count) {
    map.removeLayer(vector_layer);
    vector_layer = null;
    vector_layer = new SuperMap.Layer.Vector("气温图", {
        styleMap: styleMap,
        rendererOptions: {zIndexing: true}
    });
    map.addLayer(vector_layer);
    for (var i = 0; i < count; i++) {
        var geometries = json[i];
        var geometries = eval("(" + geometries + ")");
        var wkt_c = new SuperMap.Format.WKT();
        var wkt = wkt_c.read(geometries.geometry);
        wkt.attributes = {
            "name": geometries.temp + "℃"
        };
        vector_layer.addFeatures(wkt);
    }
    ;
}

function bar(name) {
    if (name === 1)
        map.zoomIn();
    else if (name === 2)
        map.zoomOut();
    else if (name === 3) {
        map.zoomTo(0);
        map.setCenter(new SuperMap.LonLat(111.76, 27.4));
    }
    else if (name === 4)
        _delete();
    else if (name === 5) {
        map.removeLayer(layer);
        if (map.getLayersByName("天气图")[0] != null) {
            map.removeLayer(map.getLayersByName("天气图")[0], false);
        }
        map.addLayer(layer);
    }
}

function search_name() {
    connect("TestServlet", {
        type: "USER_SEARCH_NAME",
        data: $("#serach_name").val()
    }, function(e) {
        var dataarr1 = eval("(" + e + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var json = dataarr4.split(",,");
        var geometries = json[0];
        var geometries = eval("(" + geometries + ")");
        var size = new SuperMap.Size(24, 24);
        var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
        var icon = new SuperMap.Icon("IMG/weather/" + geometries.weather + ".gif", size, offset);
        marker = new SuperMap.Marker(new SuperMap.LonLat(geometries.x, geometries.y), icon);
        marker.data = geometries.name;
        marker.temp = geometries.temp;
        marker.min = geometries.min;
        marker.max = geometries.max;
        marker.wd = geometries.wd;
        marker.ws = geometries.ws;
        marker.sd = geometries.sd;
        marker.weather = geometries.weather;
        marker.events.on({
            "click": openInfoWin,
            "scope": marker
        });
        markerLayer.addMarker(marker);
    });
}

function change_data() {
    connect("TestServlet", {
        type: "USER_CHANGE_DATA",
        data: {
            name: $("#admin_name").val().toString(),
            temp: $("#admin_temp").val().toString(),
            min: $("#admin_min").val().toString(),
            max: $("#admin_max").val().toString(),
            weather: $("#admin_weather").val().toString(),
            wd: $("#admin_wd").val().toString(),
            ws: $("#admin_ws").val().toString(),
            sd: $("#admin_sd").val().toString()
        }
    }, function(data) {
        alert("修改成功！");
    }, null);
}

function change_history_data() {
    connect("TestServlet", {
        type: "USER_CHANGE_HISTORY",
        data: {
            name: $("#admin_history_name").val().toString(),
            temp: $("#admin_history_temp").val().toString(),
            wd: $("#admin_history_wd").val().toString(),
            ws: $("#admin_history_ws").val().toString(),
            sd: $("#admin_history_sd").val().toString(),
            month: $("#month_table").val().toString(),
            day: $("#day_table").val().toString(),
            hour: $("#hour_table").val().toString()
        }
    }, function(data) {
        alert("修改成功！");
    }, null);
}

function pie() {
    connect("TestServlet", {
        type: "USER_SEARCH_TEMPERATURE",
        data: {
            city: "全部",
            month: $("#month").val().toString(),
            day: $("#day").val().toString(),
            hour: $("#hour").val().toString()
        }}, function(data) {
        var dataarr1 = eval("(" + data + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var json = dataarr4.split(",,");
        var count = dataarr1.count;
        if (count * 1 === 0) {
            alert("该时间数据不存在，请重新选择日期！");
        }
        var data = new Array();
        for (var i = 0; i < count; i++) {
            var geometries = json[i];
            geometries = eval("(" + geometries + ")");
            data.push(geometries.temp * 1);
        }
        var temp = distinctArray(data);
        var data_temp = new Array();
        var num = 0;
        for (var j = 0; j < temp.length; j++) {
            for (var i = 0; i < data.length; i++) {
                if (temp[j] === data[i]) {
                    num++;
                }
            }
            data_temp.push([temp[j].toString() + '℃', num]);
            num = 0;
        }
        var myChart = new JSChart('temp_pie', 'pie');
        myChart.setDataArray(data_temp);
        myChart.setTitle($("#month").val().toString() + "-" + $("#day").val().toString() + "-" + $("#hour").val().toString() + '温度统计图');
        myChart.setTitleColor('#857D7D');
        myChart.setPieUnitsColor('#9B9B9B');
        myChart.setPieValuesColor('#6A0000');
        myChart.draw();
        $("#temp_pie").dialog("open");
    }, null);
}

function distinctArray(arr) {
    var obj = {}, temp = [];
    for (var i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            temp.push(arr[i]);
            obj[arr[i]] = true;
        }
    }
    return temp;
}
