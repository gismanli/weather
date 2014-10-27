/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var round = 0;
var interpolation = 0;
var id = null;
var infowin = null;
var theme = {};
function processCompleted(queryEventArgs) {
    if (box)
        box.deactivate();
    var i, j, result = queryEventArgs.result;
    if (result && result.recordsets) {
        for (i = 0, recordsets = result.recordsets, len = recordsets.length; i < len; i++) {
            if (recordsets[i].features) {
                for (j = 0; j < recordsets[i].features.length; j++) {
                    var feature = recordsets[i].features[j];
                    var point = feature.geometry;
                    size = new SuperMap.Size(32, 32), offset = new SuperMap.Pixel(-(size.w / 2), -size.h), icon = new SuperMap.Icon("IMG/marker.jpg", size, offset);
                    marker = new SuperMap.Marker(new SuperMap.LonLat(point.getCentroid().x, point.getCentroid().y), icon);
                    marker.name = feature.attributes.name;
                    marker.events.on({
                        "click": openHisTotyWin,
                        "scope": marker
                    });
                    markerLayer.addMarker(marker);
                }
            }
        }
    }
}
function processFailed(e) {
    alert(e.error.errorMsg);
}
function openInfoWin() {
    closeInfoWin();
    var marker = this;
    var lonlat = marker.getLonLat();
    var contentHTML = "<div style='font-size:.8em; opacity: 0.8; overflow-y:hidden;'>";
    contentHTML += "<div>名称：" + marker.data + "<br><br> 气温：" + marker.temp + "℃<br><br> 最低温度：" + marker.min + "<br><br> 最高温度：" + marker.max + "<br><br> 风向：" + marker.wd + "<br><br> 风力：" + marker.ws + "<br><br> 湿度：" + marker.sd + "<br><br> 天气状况：" + marker.weather + "</div></div>";
    var size = new SuperMap.Size(0, 33);
    var offset = new SuperMap.Pixel(0, -size.h);
    var icon = new SuperMap.Icon("IMG/marker.png", size, offset);
    var popup = new SuperMap.Popup.FramedCloud("popwin",
            new SuperMap.LonLat(lonlat.lon, lonlat.lat),
            null,
            contentHTML,
            icon,
            true);
    infowin = popup;
    map.addPopup(popup);
}
function openHisTotyWin() {
    closeInfoWin();
    var marker = this;
    var lonlat = marker.getLonLat();
    var contentHTML = "<div style='font-size:.8em; opacity: 0.8; overflow-y:hidden;'>";
    contentHTML += "<div ><br>县市名称：" + marker.name + "</div><br><button onclick=\"OpenHistory('" + marker.name + "');\">历史数据</button></div>";
    var size = new SuperMap.Size(0, 33);
    var offset = new SuperMap.Pixel(0, -size.h);
    var icon = new SuperMap.Icon("IMG/marker.png", size, offset);
    var popup = new SuperMap.Popup.FramedCloud("popwin",
            new SuperMap.LonLat(lonlat.lon, lonlat.lat),
            null,
            contentHTML,
            icon,
            true);
    infowin = popup;
    map.addPopup(popup);
}
function closeInfoWin() {
    if (infowin) {
        try {
            infowin.hide();
            infowin.destroy();
        }
        catch (e) {
        }
    }
}
function OpenHistory(name) {
    $("#city").val("空");
    $("#country").html("<option value=\"" + name + "\">" + name + "</option>");
    $("#dialog_chart_all").dialog("open");
}

function _checkbox(x, y, name, temp, min, max, wd, ws, sd, weather, time, i) {
    var str = "#date_" + i;
    var size = new SuperMap.Size(32, 32);
    var offset = new SuperMap.Pixel(-(size.w / 2), -size.h);
    var icon = new SuperMap.Icon("IMG/marker.jpg", size, offset);
    if ($(str).is(":checked") === true) {
        obj[str] = new SuperMap.Marker(new SuperMap.LonLat(x, y), icon);
        obj[str].data = name;
        obj[str].temp = temp;
        obj[str].min = min;
        obj[str].max = max;
        obj[str].wd = wd;
        obj[str].ws = ws;
        obj[str].sd = sd;
        obj[str].weather = weather;
        obj[str].time = time;
        obj[str].events.on({
            "click": openInfoWin,
            "scope": obj[str]
        });
        markerLayer.addMarker(obj[str]);
    } else {
        markerLayer.removeMarker(obj[str]);
//        obj[str].destory();
    }
}

function _checkbox_admin(name, temp, min, max, wd, ws, sd, weather, time) {
    $("#admin_name").val(name);
    $("#admin_temp").val(temp);
    $("#admin_min").val(min);
    $("#admin_max").val(max);
    $("#admin_wd").val(wd);
    $("#admin_ws").val(ws);
    $("#admin_sd").val(sd);
    $("#admin_weather").val(weather);
    $("#admin_time").val(time);
    $("#admin_data").dialog("open");
}
function _checkbox_admin_history(name, temp, wd, ws, sd) {
    $("#admin_history_name").val(name);
    $("#admin_history_temp").val(temp);
    $("#admin_history_wd").val(wd);
    $("#admin_history_ws").val(ws);
    $("#admin_history_sd").val(sd);
    $("#admin_history").dialog("open");
}

function addThemeUnique(json, count) {
    var themeService = new SuperMap.REST.ThemeService(url, {eventListeners: {"processCompleted": themeCompleted, "processFailed": themeFailed}});
    var style;
    var themeUniqueItemes = new Array();
    var style = {
        "中雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineWidth: 0.1
        }),
		"小雨转中雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineWidth: 0.1
        }),
        "中雨转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineColor: new SuperMap.REST.ServerColor(26, 26, 26),
            lineWidth: 0.1
        }),
        "中雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(228, 201, 49),
            lineColor: new SuperMap.REST.ServerColor(228, 201, 49),
            lineWidth: 0.1
        }),
        "多云转晴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(252, 157, 154),
            lineColor: new SuperMap.REST.ServerColor(252, 157, 154),
            lineWidth: 0.1
        }),
        "多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(252, 157, 154),
            lineColor: new SuperMap.REST.ServerColor(252, 157, 154),
            lineWidth: 0.1
        }),
        "雷阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineWidth: 0.1
        }),
        "雷阵雨转阴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineWidth: 0.1
        }),
        "多云转雷阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineWidth: 0.1
        }),
        "雷阵雨转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineWidth: 0.1
        }),
        "阵雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
		 "阴转阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "多云转阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "大雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineWidth: 0.1
        }),
		"小雨转中到大雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineWidth: 0.1
        }),
		 "小雨转大雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineWidth: 0.1
        }),
        "大雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(26, 5, 89),
            lineColor: new SuperMap.REST.ServerColor(26, 5, 89),
            lineWidth: 0.1
        }),
        "小雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
		"阴转小雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
		"阴转小雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
		"阵雨转小到中雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
		"阵雨转小雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
        "小雨转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineColor: new SuperMap.REST.ServerColor(55, 173, 173),
            lineWidth: 0.1
        }),
        "小雨转阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "小雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 89),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 89),
            lineWidth: 0.1
        }),
        "晴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(255, 67, 101),
            lineColor: new SuperMap.REST.ServerColor(255, 67, 101),
            lineWidth: 0.1
        }),
        "晴转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(255, 67, 101),
            lineColor: new SuperMap.REST.ServerColor(255, 67, 101),
            lineWidth: 0.1
        }),
        "晴转阴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineWidth: 0.1
        }),
        "晴转阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "晴转雷阵雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 255, 189),
            lineWidth: 0.1
        }),
        "暴雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineWidth: 0.1
        }),
        "暴雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineColor: new SuperMap.REST.ServerColor(16, 25, 189),
            lineWidth: 0.1
        }),
        "阴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineWidth: 0.1
        }),
        "阴转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineWidth: 0.1
        }),
        "多云转阴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineColor: new SuperMap.REST.ServerColor(96, 96, 96),
            lineWidth: 0.1
        }),
        "阵雨转中雨": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "阵雨转多云": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "阵雨转阴": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineColor: new SuperMap.REST.ServerColor(0, 0, 139),
            lineWidth: 0.1
        }),
        "雾": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(26, 25, 89),
            lineColor: new SuperMap.REST.ServerColor(26, 25, 89),
            lineWidth: 0.1
        }),
        "雨夹雪": new SuperMap.REST.ServerStyle({
            fillForeColor: new SuperMap.REST.ServerColor(126, 125, 189),
            lineColor: new SuperMap.REST.ServerColor(126, 125, 189),
            lineWidth: 0.1
        })
    };
    for (var i = 0; i < count; i++) {
        var geometries = json[i];
        geometries = eval("(" + geometries + ")");
        theme[i] = new SuperMap.REST.ThemeUniqueItem({
            unique: geometries.name,
            style: style[geometries.weather]
        });
        themeUniqueItemes.push(theme[i]);
    }
    var themeUnique = new SuperMap.REST.ThemeUnique({
        uniqueExpression: "name",
        items: themeUniqueItemes,
        defaultStyle: style["晴"]
    });
    themeParameters = new SuperMap.REST.ThemeParameters({
        datasetNames: ["county"],
        dataSourceNames: ["county"],
        themes: [themeUnique]
    });
    themeService.processAsync(themeParameters);
}
function themeCompleted(themeEventArgs) {
    if (themeEventArgs.result.resourceInfo.id) {
        themeLayer = new SuperMap.Layer.TiledDynamicRESTLayer("天气图", url, {cacheEnabled: false, transparent: true, layersID: themeEventArgs.result.resourceInfo.id}, {"maxResolution": "auto"});
        themeLayer.events.on({"layerInitialized": addThemeLayer});
    }
}
function addThemeLayer() {
    map.addLayer(themeLayer);
}
function themeFailed(serviceFailedEventArgs) {
    alert(serviceFailedEventArgs.error.errorMsg);
}

function createHeatPoints(json, count) {
    if (map.getLayersByName("热力图")[0] != null) {
//        map.removeLayer(map.getLayersByName("热力图")[0], true);
        heatMapLayer.removeAllFeatures();
    } else {
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
    var heatPoints = [];
    var radius = parseInt("70");
    heatMapLayer.radius = radius;
    for (var i = 0; i < count; i++) {
        var geometries = json[i];
        geometries = eval("(" + geometries + ")");
        heatPoints[i] = new SuperMap.Feature.Vector(
                new SuperMap.Geometry.Point(
                        parseFloat(geometries.x),
                        parseFloat(geometries.y)
                        ),
                {
                    "value": geometries.temp,
                    "geoRadius": null
                }
        );
    }
    heatMapLayer.addFeatures(heatPoints);
}

function dynamic_start() {
    if ($("#dynamic_day_start").val() > $("#dynamic_day_end").val()) {
        alert("日期选择错误！请检查开始时间是否大于结束时间！");
        return;
    }
    connect("TestServlet", {
        type: "USER_SEARCH_DYNAMIC",
        data: {
            month: $("#dynamic_month").val(),
            day_start: $("#dynamic_day_start").val(),
            day_end: $("#dynamic_day_end").val(),
            hour_start: $("#dynamic_hour_start").val(),
            hour_end: $("#dynamic_hour_end").val()
        }
    }, function(e) {
        var dataarr1 = eval("(" + e + ")");
        var dataarr2 = JSON.stringify(dataarr1.geometries).replace("[{", "{");
        var dataarr3 = dataarr2.replace("}]", "}");
        var dataarr4 = dataarr3.replace(/\},{/g, "},,{");
        var json = dataarr4.split(",,");
        var count = dataarr1.count;
        if (count == 0) {
            alert("所选时间段数据有误,请重新选择!");
            return;
        }
        round = 0;
        interpolation = ($("#dynamic_day_end").val() * 1 - $("#dynamic_day_start").val() * 1) * 24 + $("#dynamic_hour_end").val() * 1 - $("#dynamic_hour_start").val() * 1 + 1;
        var heatPoints = [];
        var radius = parseInt("80");
        heatMapLayer.radius = radius;
        id = window.setInterval(function() {
            if (round === interpolation) {
                alert("已播放完毕!");
                window.clearInterval(id);
                return;
            }
            heatMapLayer.removeAllFeatures();
            heatPoints = [];
            for (var i = 0; i < count; i++) {
                var geometries = json[i];
                geometries = eval("(" + geometries + ")");
                heatPoints[i] = new SuperMap.Feature.Vector(
                        new SuperMap.Geometry.Point(
                                parseFloat(geometries.x),
                                parseFloat(geometries.y)
                                ),
                        {
                            "value": geometries["temp_" + round],
                            "geoRadius": null
                        }
                );
            }
            heatMapLayer.addFeatures(heatPoints);
            round++;
        }, $("#time").val() * 1);
    }, null);
}
function dynamic_end() {
    if (id)
        window.clearInterval(id);
    alert("播放已停止!");
}
