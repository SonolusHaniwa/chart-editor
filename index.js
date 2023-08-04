function addLoadEvent(e) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
        window.onload = e;
    } else {
        window.onload = function() {
            oldonload();
            e();
        }
    }
}

function addKeyDownEvent(callback) {
    var oldonkeydown = window.onkeydown;
    if (typeof window.onkeydown != 'function') {
        window.onkeydown = callback;
    } else {
        window.onkeydown = function(e){
            oldonkeydown(e);
            callback(e);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getPosition(id) {
    return document.getElementById(id).getBoundingClientRect();
}

function IsPC() {
    var flag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return !flag;
}

// Toggle Features

var fileSaved = false;

function createChart() {
    if (!fileSaved) {
        var res = confirm("是否保存当前谱面？");
        if (res) saveChart();
    } fileSaved = false;
    document.getElementsByTagName("toggletitle")[0].innerHTML = "未命名.srp";
    // 清除所有预览内容
    document.getElementById("chart-controller").src = "";
    document.getElementById("search-preview-bgm").src = "";
    document.getElementById("search-preview-preview").src = "";
    document.getElementById("search-preview-cover").src = "";
    // 恢复所有设置内容
    document.getElementById("search-reset-rating").click();
    document.getElementById("search-reset-title").click();
    document.getElementById("search-reset-artists").click();
    document.getElementById("search-reset-author").click();
    document.getElementById("search-reset-description").click();
    document.getElementById("search-reset-bgm").click();
    document.getElementById("search-reset-preview").click();
    document.getElementById("search-reset-cover").click();
    // 清除谱面 & 重绘舞台
    clearMap(); draw();
    updateStatistics();
    // 清除工具选择状态
    document.getElementById("tools-0").click();
    // 清除页面
    clearPageState();
}

if (window.showSaveFilePicker != undefined) {
    // 方案一
    var saveChart = function() {
        alert("该设备使用的是方案一的 saveChart");
    };

    var openChart = async function() {
        var res = await window.showOpenFilePicker({
            types: [
                {
                    description: "srp 文件",
                    accept: { "application/octet-stream": [".srp"] },
                }
            ]
        });
        var file = await res[0].getFile();
        var blob = await file.arrayBuffer();
        var context = new Uint8Array(blob);
        var srpFile = new srp(context);
    };
} else {
    // 方案二
    var saveChart = function() {
        alert("该设备使用的是方案二的 saveChart");
    };
    
    var openChart = function() {
        alert("该设备使用的是方案二的 openChart");
    }
}

function clearChart() {
    for (var i = 0; i < chart.length; i++) {
        if (chart[i][0] < 10) eraseNote(chart[i][1], chart[i][2]);
        else eraseHoldNote(chart[i][3], chart[i][1], chart[i][2]); 
    }
}

function importChart() {
    var input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async function() {
        var res = await readTextFile(input.files[0]);
        noteNumber = 0; holdEndNumber = 0; holdLineNumber = 0;
        tapNumber = 0; flickNumber = 0; holdNumber = 0; holdFlickNumber = 0;
        var tmp = JSON.parse(res);
        for (var i = 0; i < tmp.length; i++) {
            if (tmp[i][0] == 11) tmp[i][0] = 21, tmp[i][3] += 10000;
            if (tmp[i][0] == 12) tmp[i][0] = 23, tmp[i][3] += 10000;
            if (tmp[i][0] == 13) tmp[i][0] = 24, tmp[i][3] += 10000;
        }
        updateChart(tmp);
    }; input.click();
}

async function exportChart() {
    var json = JSON.stringify(chart);
    if (window.showSaveFilePicker == undefined) {
        var blob = new Blob([json], {type: "application/octet-stream"});
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "chart.json";
        a.click(); return;
    }
    var fileHandle = await window.showSaveFilePicker({
        suggestedName: "chart.json",
        types: [
            {
                description: "JSON 文件",
                accept: { "application/json": [".json"] },
            },
        ],
    });
    const writable = await fileHandle.createWritable();
    await writable.write(json);
    await writable.close();
}

function editorUndo() {
    if (operatorStack.length == 0) return;
    var now = operatorStack[operatorStack.length - 1];
    operatorStack.pop(); clearBorder();
    for (var i = now.length - 1; i >= 0; i--) {
        if (now[i]["operator"] == "addNote") {
            if (now[i]["data"][0] >= 10) stackEraseHoldNote(now[i]["data"][3], now[i]["data"][1], now[i]["data"][2]);
            stackRemove(now[i]["data"][0], now[i]["data"][1], now[i]["data"][2]);
        }
        if (now[i]["operator"] == "removeNote") {
            if (now[i]["data"][0] >= 10) stackAddHoldLine(now[i]["data"][3], now[i]["data"][1], now[i]["data"][2]);
            stackAdd(now[i]["data"][0], now[i]["data"][1], now[i]["data"][2], now[i]["data"][3]);
        }
    } restoreStack.push(now);
}

function editorRedo() {
    if (restoreStack.length == 0) return;
    var now = restoreStack[restoreStack.length - 1];
    restoreStack.pop(); clearBorder();
    for (var i = 0; i < now.length; i++) {
        if (now[i]["operator"] == "removeNote") {
            if (now[i]["data"][0] >= 10) stackEraseHoldNote(now[i]["data"][3], now[i]["data"][1], now[i]["data"][2]);
            stackRemove(now[i]["data"][0], now[i]["data"][1], now[i]["data"][2]);
        }
        if (now[i]["operator"] == "addNote") {
            if (now[i]["data"][0] >= 10) stackAddHoldLine(now[i]["data"][3], now[i]["data"][1], now[i]["data"][2]);
            stackAdd(now[i]["data"][0], now[i]["data"][1], now[i]["data"][2], now[i]["data"][3]);
        }
    } operatorStack.push(now);
}

function previewJump() {
    document.getElementById("chart-controller").pause();
    var res = prompt("Time: ");
    if (res != null) jump(res);
}

function previewPlay() {
    if (document.getElementById("chart-controller").duration == 0 || isNaN(document.getElementById("chart-controller").duration)) return;
    if (document.getElementById("chart-controller").paused) document.getElementById("chart-controller").play();
    else document.getElementById("chart-controller").pause();
}

// Toggle Modules

const toggleConfig = [
    {
        title: "文件",
        subtoggle: [
            [
                {
                    text: "新建谱面",
                    shortcutText: "Ctrl + Alt + N",
                    callback: createChart,
                    shortcut: {
                        ctrl: true,
                        alt: true,
                        shift: false,
                        key: 78
                    }
                }, {
                    text: "打开谱面...",
                    shortcutText: "Ctrl + O",
                    callback: openChart,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 79
                    }
                }, {
                    text: "保存谱面",
                    shortcutText: "Ctrl + S",
                    callback: saveChart,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 83
                    }
                }
            ], [
                {
                    text: "以 JSON 格式导入",
                    shortcutText: "Ctrl + I",
                    callback: importChart,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 73
                    }
                }, {
                    text: "以 JSON 格式导出",
                    shortcutText: "Ctrl + E",
                    callback: exportChart,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 69
                    }
                }
            ]
        ]
    }, {
        title: "编辑",
        subtoggle: [
            [
                {
                    text: "撤销",
                    shortcutText: "Ctrl + Z",
                    callback: editorUndo,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 90
                    }
                }, {
                    text: "恢复",
                    shortcutText: "Ctrl + Y",
                    callback: editorRedo,
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 89
                    }
				}
            ]
        ]
	}, {
		title: "预览",
		subtoggle: [
			[
				{
					text: "播放 / 暂停",
					shortcutText: "Ctrl + P",
					callback: previewPlay,
					shortcut: {
						ctrl: true,
						alt: false,
						shift: false,
						key: 80
					}
				}, {
					text: "跳转",
					shortcutText: "Ctrl + J",
					callback: previewJump,
					shortcut: {
						ctrl: true,
						alt: false,
						shift: false,
						key: 74
					}
				}
			]
		]
	}, {
        title: "工具",
        subtoggle: [
            [
                {
                    text: "指针工具",
                    shortcutText: "Ctrl + 0",
                    callback: function(){changeTool(0);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 48
                    }
                }, {
                    text: "Tap 音符",
                    shortcutText: "Ctrl + 1",
                    callback: function(){changeTool(1);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 49
                    }
                }, {
                    text: "Flick 音符",
                    shortcutText: "Ctrl + 2",
                    callback: function(){changeTool(2);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 50
                    }
                }, {
                    text: "Hold 音符",
                    shortcutText: "Ctrl + 3",
                    callback: function(){changeTool(3);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 51
                    }
                }, {
                    text: "Hold(Flick) 音符",
                    shortcutText: "Ctrl + 4",
                    callback: function(){changeTool(4);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 52
                    }
                }, {
                    text: "橡皮擦工具",
                    shortcutText: "Ctrl + 5",
                    callback: function(){changeTool(5);},
                    shortcut: {
                        ctrl: true,
                        alt: false,
                        shift: false,
                        key: 53
                    }
                }
            ]
        ]
    }
];

function clearToggleState() {
    var toggles = document.getElementsByTagName("toggleContent");
    for (i = 0; i < toggles.length; i++) {
        toggles[i].style.opacity = 0;
        toggles[i].style.display = "";
    } var toggleRoots = document.getElementsByTagName("toggle");
    for (i = 0; i < toggleRoots.length; i++) {
        toggleRoots[i].style.backgroundColor = "";
    }
}

function createToggle(toggle, id) {
    // 构造 Toggle
    var toggleRoot = document.createElement("toggle");
    toggleRoot.innerHTML = toggle.title; toggleRoot.id = "toggle-#" + id;
    toggleRoot.onclick = function(){
        if (document.getElementById("toggleContent-#" + id).style.opacity == 0) {
            clearToggleState();
            document.getElementById("toggleContent-#" + id).style.opacity = 1;
            document.getElementById("toggleContent-#" + id).style.display = "flex";
            this.style.backgroundColor = "rgb(64, 64, 64)";
        } else {
            document.getElementById("toggleContent-#" + id).style.opacity = 0;
            document.getElementById("toggleContent-#" + id).style.display = "none";
            this.style.backgroundColor = "";
        }
    }; document.getElementById("toggleRoot").appendChild(toggleRoot);
    // 构造 ToggleContent
    var toggleContent = document.createElement("toggleContent");
    for (var i = 0; i < toggle.subtoggle.length; i++) {
        var item = toggle.subtoggle[i];
        for (var j = 0; j < item.length; j++) {
            var toggleItem = document.createElement("toggleItem");
            var toggleText = document.createElement("toggleText");
            toggleText.innerHTML = item[j].text;
            toggleItem.appendChild(toggleText);
            console.log(item[j]);
            if (item[j].shortcutText != undefined) {
                var toggleShortcut = document.createElement("toggleShortcut");
                toggleShortcut.innerHTML = item[j].shortcutText;
                toggleItem.appendChild(toggleShortcut);
            } if (item[j].callback != undefined) {
                const func = item[j].callback;
                toggleItem.onclick = function() {
                    clearToggleState();
                    func();
                };
                if (item[j].shortcut != undefined) {
                    addShortcut(item[j].shortcut.ctrl, item[j].shortcut.alt, item[j].shortcut.shift, item[j].shortcut.key, item[j].callback);
                }
            } else toggleItem.onclick = clearToggleState();
            toggleContent.appendChild(toggleItem);
        } if (i != toggle.subtoggle.length - 1) toggleContent.appendChild(document.createElement("hr"));
    }
    toggleRoot = getPosition("toggle-#" + id);
    toggleContent.id = "toggleContent-#" + id;
    toggleContent.style.left = toggleRoot.x + "px";
    toggleContent.style.top = (toggleRoot.y + toggleRoot.height) + "px";
    document.getElementById("toggleRoot").appendChild(toggleContent);
}

addLoadEvent(function(){
    var nav = document.getElementById("toggleRoot");
    var favicon = document.createElement("img"); favicon.src = "/assets/favicon.jpg";
    nav.appendChild(favicon);
    for (var i = 0; i < toggleConfig.length; i++) createToggle(toggleConfig[i], i);
    var title = document.createElement("toggleTitle"); title.innerHTML = "未命名.srp";
    nav.appendChild(title);
    nav.style.opacity = 1;
});

// Page Features

var searchConfig = new Object();
var enableResetClass = "flex select-none space-x-2 p-2 transition-colors sm:space-x-3 sm:p-3 cursor-pointer bg-sonolus-ui-button-normal hover:bg-sonolus-ui-button-highlighted active:bg-sonolus-ui-button-pressed";
var disableResetClass = "flex select-none space-x-2 p-2 transition-colors sm:space-x-3 sm:p-3 pointer-events-none bg-sonolus-ui-button-disabled text-sonolus-ui-text-disabled";

async function getComponent(path) {
    var response = await fetch(path);
    var text = await response.text();
    return text;
}

async function getBinary(path) {
    var response = await fetch(path);
    var blob = await response.arrayBuffer();
    return blob;
}

function htmlToNode(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function loadJS(path) {
    var oHead = document.getElementsByTagName('head')[0];
    var oScript = document.createElement("script");
    oScript.type = "text/javascript";
    oScript.src = path;
    oHead.appendChild(oScript);
}

async function readBinaryFile(FileObject) {
    var reader = new FileReader();
    var result; var finish = false;
    reader.readAsArrayBuffer(FileObject);
    reader.onload = function(e) {
        finish = true;
        result = this.result;
    }
    while (!finish) await sleep(10);
    return result;
}

async function readTextFile(FileObject) {
    var reader = new FileReader();
    var result; var finish = false;
    reader.readAsText(FileObject);
    reader.onload = function(e) {
        finish = true;
        result = this.result;
    }
    while (!finish) await sleep(10);
    return result;
}

async function uploader(data) {
    var blob = new Blob([data], {type: "application/octet-stream"});
    return URL.createObjectURL(blob);
}

async function getBlobFile(url) {
    var response = await fetch(url);
    var blob = await response.blob();
    return blob;
}

async function fileSystem_info() {
    var div = document.createElement("page");
    div.id = "fileSystem.info"; div.appendChild(htmlToNode(await getComponent("/components/info.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/info.js");
	div.style.opacity = 0;
	div.style.display = "none";
}

var totalTime = 0.0;
var secondHeight = 0;
var viewBottom = 0.1;
var stageClientWidth = 0;
var stageLengthSecond = 1.0;
var stage = null;
var lineLeft = [];
var timeStamp = [];

function drawStage() {
    var b = document.getElementById("stage");
    var h = secondHeight * (totalTime + stageLengthSecond);
    var w = stageClientWidth - 20;
    b.innerHTML = "";
    var originalWidth = 274;

    // 画边框
    var left = 0;
    for (var i = 0; i <= 6; i++) {
        var line = document.createElement("div");
        var width = (w / originalWidth * (i == 0 || i == 6 ? 2 : 1.2));
        line.style.position = "absolute";
        line.style.width = width + "px";
        line.style.height = h + "px";
        line.style.backgroundColor = "rgba(132, 132, 132, 0.6)";
        line.style.left = left + "px";
        left += width + w / originalWidth * 44;
        b.appendChild(line);
    }

    // 画格子
    left = w / originalWidth * 2;
    lineLeft = [0];
    for (var i = 0; i < 6; i++) {
        var block = document.createElement("div");
        var width = w / originalWidth * 44;
        block.style.position = "absolute";
        block.style.width = width + "px";
        block.style.height = h + "px";
        block.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
        block.style.left = left + "px";
        lineLeft.push(left);
        left += width + w / originalWidth * 1.2;
        b.appendChild(block);
    } lineLeft.push(1e18);

    // 画很多很多的线
    var top = (1.0 - viewBottom) * secondHeight * stageLengthSecond;
    var unit = 0.125; switch(searchConfig["line"]) {
        case "0": unit = 1; break;
        case "1": unit = 0.5; break;
        case "2": unit = 0.25; break;
        case "3": unit = 0.125; break;
        case "4": unit = 0.0625; break;
        case "5": unit = 0.03125; break;
    };
    for (var i = 0; i < totalTime + stageLengthSecond; i += unit) {
        var line = document.createElement("div");
        line.style.position = "absolute";
        line.style.width = (Math.abs(Math.round(i) - i) < 0.0001 ? "calc(100% + 20px)" : "calc(100% - 20px)");
        line.style.height = "1.2px";
        line.style.backgroundColor = "rgba(255, 255, 255, 0.6)";
        line.style.top = (top + (totalTime - i) * secondHeight + 9) + "px";
        line.style.left = (Math.abs(Math.round(i) - i) < 0.0001 ? "-20px" : "0px")
        b.appendChild(line);
    }

    // 画线
    if (document.getElementById("line") != undefined) document.getElementById("line").remove();
    var line = document.createElement("div");
    line.style.position = "absolute";
    line.style.width = "calc(40% - 60px)";
    line.style.height = "2px";
    line.style.left = "calc(45% + 85px)";
    line.style.backgroundColor = "rgba(255, 0, 0, 0.6)";

    line.style.top = (secondHeight * (1.0 - viewBottom) * stageLengthSecond + 9.0) + "px";
    line.style.zIndex = 10000000;
    line.id = "line";
    document.getElementById("fileSystem.chart").appendChild(line);

    // 获取可以添加按键的时间
    timeStamp = [];
    timeStamp.push(-1e18);
    for (var i = 0; i <= totalTime; i += 0.125 / 4) timeStamp.push(i);
    timeStamp.push(1e18);

    jump(0);
    document.getElementById("chart-controller").onplay = function(){play()};
    document.getElementById("chart-controller").onpause = function(){pause()};
    document.getElementById("chart-controller").ontimeupdate = function(){
        jump(document.getElementById("chart-controller").currentTime, true, false);
    };
    document.getElementById("chart-controller").currentTime = 0;

    document.getElementById("chart").onscroll = function(event) {
        var t = totalTime - document.getElementById("chart").scrollTop / secondHeight;
        jump(t, false);
    };

    document.getElementById("stage").onclick = function(event) {
        updateCurrentTool();
        var x = event.clientX - getPosition("stage").x;
        var y = event.clientY - getPosition("stage").y;
        var t = totalTime - (y - (1.0 - viewBottom) * secondHeight * stageLengthSecond - 10.0) / secondHeight;
        // 寻找相似时间
        for (var i = 0; i < timeStamp.length - 1; i++) {
            if (t >= timeStamp[i] && t <= timeStamp[i + 1]) {
                t = (t - timeStamp[i] < timeStamp[i + 1] - t) ? timeStamp[i] : timeStamp[i + 1];
                break;
            }
        }
        // 延长 Hold
        if (clickId != 0) {
            for (var i = 1; i <= 6; i++) {
                if (x >= lineLeft[i] && x <= lineLeft[i + 1]) {
                    addHoldLine(clickId, t, i);
                    break;
                }
            } 
            event.stopPropagation();
            return;
        }
        if (currentTool == 0 || currentTool == 5) return;
        // 加 Note
        for (var i = 1; i <= 6; i++) {
            if (x >= lineLeft[i] && x <= lineLeft[i + 1]) {
                addNote(t, i); clearBorder();
                if (currentTool == 3 || currentTool == 4) drawBorder(t, i);
                break;
            }
        }
        event.stopPropagation();
    }

    document.getElementById("line").onclick = function(event) {
        document.getElementById("stage").onclick(event);
    }
}

function formatTimeSecond(s) {
    var min = Math.floor(s / 60.0);
    var sec = Math.floor(s - min * 60.0);
    var lst = Math.floor((s - sec - min * 60.0) * 1000);
    min = min < 10 ? "0" + min : min;
    sec = sec < 10 ? "0" + sec : sec;
    lst = lst < 10 ? "00" + lst : lst < 100 ? "0" + lst : lst;
    return min + ":" + sec + "." + lst;
}

function drawTimeline(b) {
    var b = document.getElementById("timeline");
    b.innerHTML = "";
    var height = secondHeight * totalTime;
    var top = (1.0 - viewBottom) * secondHeight * stageLengthSecond;
    for (var i = 0; i < totalTime + stageLengthSecond; i += 1.0) {
        var e = document.createElement("div");
        e.style.position = "absolute";
        e.style.top = (top + height - secondHeight * i) + "px";
        e.innerHTML = formatTimeSecond(i);
        b.appendChild(e);
    }
}

async function draw() {
    var timeNow = document.getElementById("chart-controller").currentTime;
    secondHeight = document.getElementById("chart").clientHeight / stageLengthSecond;
    stageClientWidth = document.getElementById("stage").clientWidth;
    stage = document.getElementById("stage");
    totalTime = document.getElementById("chart-controller").duration;
    if (isNaN(totalTime)) totalTime = 0;
    for (var i = 0; i < chart.length; i++) totalTime = Math.max(totalTime, chart[i][1]);
    await drawStage();
    drawTimeline(); 
	clickId = clickT = clickL = 0; var index = Object();
    for (var i = 0; i < chart.length; i++) if (chart[i][3] >= 10) holdId = Math.max(holdId, chart[i][3]);
    for (var i = 0; i < chart.length; i++) drawNote(chart[i][0], chart[i][1], chart[i][2]);
    for (var i = 0; i < chart.length; i++) {
        if (chart[i][0] < 10) continue;
        var x = index[chart[i][3]];
        if (x != undefined) drawHoldBody(chart[x][1], chart[x][2], chart[i][1], chart[i][2]);
        index[chart[i][3]] = i;
    } jump(timeNow, true, true);
}

async function updateChart(origin) {
    secondHeight = document.getElementById("chart").clientHeight / stageLengthSecond;
    stageClientWidth = document.getElementById("stage").clientWidth;
    stage = document.getElementById("stage"); // 在head标签中创建创建script
    totalTime = document.getElementById("chart-controller").duration;
    if (isNaN(totalTime)) totalTime = 0;
    for (var i = 0; i < origin.length; i++) totalTime = Math.max(totalTime, origin[i][1]);
    await drawStage();
    drawTimeline(); 
	clickId = clickT = clickL = 0; var index = Object();
    for (var i = 0; i < origin.length; i++) if (origin[i][3] >= 10) holdId = Math.max(holdId, origin[i][3]);
    for (var i = 0; i < origin.length; i++) add(origin[i][0], origin[i][1], origin[i][2], origin[i][3]);
    for (var i = 0; i < origin.length; i++) {
        if (origin[i][0] < 10) continue;
        var x = index[origin[i][3]];
        if (x != undefined) drawHoldBody(origin[x][1], origin[x][2], origin[i][1], origin[i][2]);
        index[origin[i][3]] = i;
    }
}

async function fileSystem_chart() {
	await loadConfig();
    var div = document.createElement("page");
    div.id = "fileSystem.chart"; div.appendChild(htmlToNode(await getComponent("/components/editor.html")));
    div.style.width = "100%"; div.style.position = "relative";
    document.getElementById("container").appendChild(div);
    document.getElementById("tools-tap-label").innerHTML += drawSkin2("Hanipure Normal Note", 60, 30).outerHTML;
    document.getElementById("tools-flick-label").innerHTML += drawSkin2("Hanipure Normal Flick", 60, 30).outerHTML;
    document.getElementById("tools-hold-label").innerHTML += drawSkin2("Hanipure Normal Hold", 60, 30).outerHTML + "&nbsp;+&nbsp" + drawSkin2("Hanipure Normal Hold", 60, 30).outerHTML;
    document.getElementById("tools-holdflick-label").innerHTML += drawSkin2("Hanipure Normal Hold", 60, 30).outerHTML + "&nbsp;+&nbsp" + drawSkin2("Hanipure Normal Flick", 60, 30).outerHTML;
    await draw();
	div.style.opacity = 0;
	div.style.display = "none";
}

async function fileSystem_bgm() {
    var div = document.createElement("page");
    div.id = "fileSystem.bgm"; div.appendChild(htmlToNode(await getComponent("/components/bgm.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/bgm.js");
	div.style.opacity = 0;
	div.style.display = "none";
}

async function fileSystem_preview() {
    var div = document.createElement("page");
    div.id = "fileSystem.preview"; div.appendChild(htmlToNode(await getComponent("/components/preview.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/preview.js");
	div.style.opacity = 0;
	div.style.display = "none";
}

async function fileSystem_thumbnail() {
    var div = document.createElement("page");
    div.id = "fileSystem.thumbnail"; div.appendChild(htmlToNode(await getComponent("/components/cover.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/cover.js");
	div.style.opacity = 0;
	div.style.display = "none";
}

async function fileSystem_settings() {
    var div = document.createElement("page");
    div.id = "fileSystem.settings"; div.appendChild(htmlToNode(await getComponent("/components/settings.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/settings.js");
    await sleep(100);
    document.getElementById("search-reset-offset").click();
	div.style.opacity = 0;
	div.style.display = "none";
}

// FileSystem Module

const jsonIcon = 
"<svg viewBox=\"0 0 16 16\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"currentColor\" height=\"1em\" width=\"1em\">" + 
"<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M6 2.984V2h-.09c-.313 0-.616.062-.909.185a2.33 2.33 0 0 0-.775.53 2.23 2.23 0 0 0-.493.753v.001a3.542 3.542 0 0 0-.198.83v.002a6.08 6.08 0 0 0-.024.863c.012.29.018.58.018.869 0 .203-.04.393-.117.572v.001a1.504 1.504 0 0 1-.765.787 1.376 1.376 0 0 1-.558.115H2v.984h.09c.195 0 .38.04.556.121l.001.001c.178.078.329.184.455.318l.002.002c.13.13.233.285.307.465l.001.002c.078.18.117.368.117.566 0 .29-.006.58-.018.869-.012.296-.004.585.024.87v.001c.033.283.099.558.197.824v.001c.106.273.271.524.494.753.223.23.482.407.775.53.293.123.596.185.91.185H6v-.984h-.09c-.2 0-.387-.038-.563-.115a1.613 1.613 0 0 1-.457-.32 1.659 1.659 0 0 1-.309-.467c-.074-.18-.11-.37-.11-.573 0-.228.003-.453.011-.672.008-.228.008-.45 0-.665a4.639 4.639 0 0 0-.055-.64 2.682 2.682 0 0 0-.168-.609A2.284 2.284 0 0 0 3.522 8a2.284 2.284 0 0 0 .738-.955c.08-.192.135-.393.168-.602.033-.21.051-.423.055-.64.008-.22.008-.442 0-.666-.008-.224-.012-.45-.012-.678a1.47 1.47 0 0 1 .877-1.354 1.33 1.33 0 0 1 .563-.121H6zm4 10.032V14h.09c.313 0 .616-.062.909-.185.293-.123.552-.3.775-.53.223-.23.388-.48.493-.753v-.001c.1-.266.165-.543.198-.83v-.002c.028-.28.036-.567.024-.863-.012-.29-.018-.58-.018-.869 0-.203.04-.393.117-.572v-.001a1.502 1.502 0 0 1 .765-.787 1.38 1.38 0 0 1 .558-.115H14v-.984h-.09c-.196 0-.381-.04-.557-.121l-.001-.001a1.376 1.376 0 0 1-.455-.318l-.002-.002a1.415 1.415 0 0 1-.307-.465v-.002a1.405 1.405 0 0 1-.118-.566c0-.29.006-.58.018-.869a6.174 6.174 0 0 0-.024-.87v-.001a3.537 3.537 0 0 0-.197-.824v-.001a2.23 2.23 0 0 0-.494-.753 2.331 2.331 0 0 0-.775-.53 2.325 2.325 0 0 0-.91-.185H10v.984h.09c.2 0 .387.038.562.115.174.082.326.188.457.32.127.134.23.29.309.467.074.18.11.37.11.573 0 .228-.003.452-.011.672-.008.228-.008.45 0 .665.004.222.022.435.055.64.033.214.089.416.168.609a2.285 2.285 0 0 0 .738.955 2.285 2.285 0 0 0-.738.955 2.689 2.689 0 0 0-.168.602c-.033.21-.051.423-.055.64a9.15 9.15 0 0 0 0 .666c.008.224.012.45.012.678a1.471 1.471 0 0 1-.877 1.354 1.33 1.33 0 0 1-.563.121H10z\"/></svg>";
const mp3Icon = 
"<svg viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" height=\"1em\" width=\"1em\">" +
"<path d=\"M22 15V9c0-5-2-7-7-7H9C4 2 2 4 2 9v6c0 5 2 7 7 7h6c5 0 7-2 7-7Z\" stroke=\"#292D32\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" +
"<path d=\"M9.62 17.3a2.12 2.12 0 1 0 0-4.24 2.12 2.12 0 0 0 0 4.24Zm2.12-2.12V7.77m1.39-1 2.34.78c.57.19 1.03.83 1.03 1.43v.62c0 .81-.63 1.26-1.39 1l-2.34-.78c-.57-.19-1.03-.83-1.03-1.43v-.62c0-.8.62-1.26 1.39-1Z\" stroke=\"#292D32\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>" + 
"</svg>";
const jpgIcon = 
"<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" fill=\"none\" stroke=\"currentcolor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" height=\"1em\" width=\"1em\">" +
"<path d=\"m20 24-8-8L2 26V2h28v22m-14-4 6-6 8 8v8H2v-6\"/>" +
"<circle cx=\"10\" cy=\"9\" r=\"3\"/>" +
"</svg>";
const fileSystemConfig = [
    {
        icon: jsonIcon,
        text: "info.json",
        page: "fileSystem.info",
        initialize: fileSystem_info,
    }, {
        icon: jsonIcon,
        text: "chart.json",
        page: "fileSystem.chart",
        initialize: fileSystem_chart
    }, {
        icon: mp3Icon,
        text: "bgm.mp3",
        page: "fileSystem.bgm",
        initialize: fileSystem_bgm
    }, {
        icon: mp3Icon,
        text: "preview.mp3",
        page: "fileSystem.preview",
        initialize: fileSystem_preview
    }, {
        icon: jpgIcon,
        text: "thumbnail.jpg",
        page: "fileSystem.thumbnail",
        initialize: fileSystem_thumbnail
    }, {
        icon: jsonIcon,
        text: "settings.json",
        page: "fileSystem.settings",
        initialize: fileSystem_settings
    }
]

function clearPageState() {
    for (var i = 0; i < fileSystemConfig.length; i++) {
        document.getElementById(fileSystemConfig[i].page).style.opacity = 0;
        document.getElementById(fileSystemConfig[i].page).style.display = "none";
    }
}

async function createFileSystemItem(item) {
    var fileSystemItem = document.createElement("fileSystemItem");
    var fileSystemItemIcon = document.createElement("fileSystemItemIcon");
    var fileSystemItemText = document.createElement("fileSystemItemText");
    fileSystemItemIcon.innerHTML = item.icon;
    fileSystemItemText.innerHTML = item.text;
    fileSystemItem.appendChild(fileSystemItemIcon);
    fileSystemItem.appendChild(fileSystemItemText);
    fileSystemItem.onclick = function(){
        clearPageState();
        document.getElementById(item.page).style.opacity = 1;
        document.getElementById(item.page).style.display = "";
        if (item.page == "fileSystem.chart") draw();
    }; 
    fileSystemItem.classList.add("flex");
    document.getElementById("fileRoot").appendChild(fileSystemItem);
    await item.initialize();
}

addLoadEvent(async function(){
    for (var i = 0; i < fileSystemConfig.length; i++) await createFileSystemItem(fileSystemConfig[i]);
    clearPageState();
});

// Global Event Listener 

addLoadEvent(function(){
    document.addEventListener("click", function(e){
        if (e.target.id != "toggleRoot" && e.target.localName != "toggle" &&
            e.target.localName != "togglecontent" && e.target.localName != "toggleitem" &&
            e.target.localName != "toggletext" && e.target.localName != "toggleshortcut") {
            clearToggleState();
        } clearBorder();
    });
});

function addShortcut(ctrl, alt, shift, key, callback) {
    addKeyDownEvent(function(e){
        var keyCode = e.keyCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var altKey = e.altKey;
        var shiftKey = e.shiftKey;
        if (ctrlKey == ctrl && altKey == alt && shiftKey == shift && keyCode == key) {
            callback();
            e.preventDefault();
        }
    });
}

addLoadEvent(function(){
    window.addEventListener("resize", function(){
        draw();
    });
    window.addEventListener("onorientationchange", function(){
        draw();
    });
});

addLoadEvent(function(){
    window.addEventListener("beforeunload", function(e) {
        if (!fileSaved) {
            var confirmationMessage = "离开此网站？系统可能不会保存您所做的更改。";
            (e || window.event).returnValue = confirmationMessage; // 兼容 Gecko + IE
            return confirmationMessage; // 兼容 Gecko + Webkit, Safari, Chrome
        }
    });
});