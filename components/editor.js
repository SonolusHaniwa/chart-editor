var SkinData, EffectData;
var chart = [];
var currentTool = 0;
var operatorStack = [];
var holdId = 0, clickId = 0;
var clickT = 0, clickL = 0;
var effectUrl = Object();

var noteNumber = 0;
var tapNumber = 0;
var flickNumber = 0;
var holdNumber = 0;
var holdLineNumber = 0;
var holdEndNumber = 0;
var holdFlickEndNumber = 0;

const SkinWidth = 4096;
const SkinHeight = 4096;

function clearMap() {
	chart = [];
	operatorStack = [];
	holdId = clickId = 0;
	clickT = clickL = 0;
	noteNumber = 0; tapNumber = 0; flickNumber = 0;
	holdNumber = 0; holdEndNumber = 0; holdFlickEndNumber = 0;
}

function updateStatistics() {
	document.getElementById("statistic-total").innerHTML = noteNumber;
	document.getElementById("statistic-tap").innerHTML = tapNumber;
	document.getElementById("statistic-flick").innerHTML = flickNumber;
	document.getElementById("statistic-hold").innerHTML = holdNumber;
	document.getElementById("statistic-drag").innerHTML = holdLineNumber;
	document.getElementById("statistic-holdend").innerHTML = holdEndNumber;
	document.getElementById("statistic-holdflickend").innerHTML = holdFlickEndNumber;
}

async function loadConfig() {
	SkinData = JSON.parse(gzipDecompress(await getBinary("/assets/SkinData")));
	EffectData = JSON.parse(gzipDecompress(await getBinary("/assets/EffectData")));
	for (var i = 0; i < EffectData["clips"].length; i++) {
		effectUrl[EffectData["clips"][i]["name"]] = 
			URL.createObjectURL(await getBlobFromZip(EffectData["clips"][i]["filename"]));
	}
}

function changeTool(id) {
	document.getElementById("tools-" + currentTool).removeAttribute("checked");
	currentTool = id;
	document.getElementById("tools-" + id).setAttribute("checked", "checked");
}

function drawSkin(id, w = 1, h = 1) {
	var index = -1; for (var i = 0; i < SkinData["sprites"].length; i++) {
		if (SkinData["sprites"][i]["name"] == id) index = i;
	} var e = document.createElement("div");
	if (index == -1) return e;
	e.style.backgroundImage = "url(/assets/SkinTexture)";
	var arr = SkinData["sprites"][index];
	e.style.width = arr["w"] * w + "px";
	e.style.height = arr["h"] * h + "px";
	e.style.backgroundSize = w * SkinWidth + "px " + h * SkinHeight + "px";
	e.style.backgroundPosition = "-" + arr["x"] * w + "px -" + arr["y"] * h + "px";
	return e;
}

function drawSkin2(id, w, h) {
	var index = -1; for (var i = 0; i < SkinData["sprites"].length; i++) {
		if (SkinData["sprites"][i]["name"] == id) index = i;
	} var e = document.createElement("div");
	if (index == -1) return e;
	e.style.backgroundImage = "url(/assets/SkinTexture)";
	var arr = SkinData["sprites"][index];
	w /= arr["w"]; h /= arr["h"];
	e.style.width = arr["w"] * w + "px";
	e.style.height = arr["h"] * h + "px";
	e.style.backgroundSize = w * SkinWidth + "px " + h * SkinHeight + "px";
	e.style.backgroundPosition = "-" + arr["x"] * w + "px -" + arr["y"] * h + "px";
	return e;
}

var intervalId = -1;
var effectElement = Object();
function play() {
	var currentChart = 0;
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][1] < document.getElementById("chart-controller").currentTime) currentChart = i + 1;
	} document.getElementById("chart-controller").ontimeupdate = function(){};
	document.getElementById("chart").onscroll = function(){};
	intervalId = setInterval(function(){
		T = document.getElementById("chart-controller").currentTime;
		// 音效播放
		while (currentChart < chart.length && chart[currentChart][1] <= T) {
			if (chart[currentChart][0] == 2 || chart[currentChart][0] == 24) playEffect("Hanipure Flick");
			else playEffect("Hanipure Perfect");
			if (chart[currentChart][0] == 21) effectElement[chart[currentChart][3]] = playEffectLooped("Hanipure Hold");
			if (chart[currentChart][0] == 23 || chart[currentChart][0] == 24) stopEffectLooped(effectElement[chart[currentChart][3]]);
			currentChart++;
		} jump(T, true, false);
	}, 10);
}

async function jump(t, moveScroll = true, moveController = true) {
	if (moveScroll) {
		var top = (totalTime - t) * secondHeight;
		while(document.getElementById("chart").clientHeight == 0) await sleep(10);
		document.getElementById("chart").scrollTop = top;
	} if (moveController) {
		document.getElementById("chart-controller").currentTime = t;
	}
}

function pause() {
	clearInterval(intervalId);
	for(e in effectElement) stopEffectLooped(effectElement[e]);
	document.getElementById("chart-controller").ontimeupdate = function(){
        jump(document.getElementById("chart-controller").currentTime, true, false);
    }; document.getElementById("chart").onscroll = function(){
		var T = totalTime - document.getElementById("chart").scrollTop / secondHeight;
		jump(T, 0, 1);
	}
}

function updateCurrentTool() {
	var tmp = document.getElementsByName("tools");
	for (var i = 0; i < tmp.length; i++) {
		if (tmp[i].checked) currentTool = i;
	}
}

// Note 监控模块

function hasNote(t, l, allowed = [1, 2, 11, 12, 13, 21, 22, 23, 24]) {
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][1] == t && chart[i][2] == l && allowed.indexOf(chart[i][0]) != -1) return chart[i][0];
	} return false;
}

function centerTop(t) {
	return (1.0 - viewBottom) * secondHeight * stageLengthSecond + 9.0 + (totalTime - t) * secondHeight;
}

function drawNote(id, t, l) {
	const w = stageClientWidth - 20; var width = w / 274 * 50, height = width * 0.5;
	var e; if (id == 22) {
		var leftOffset = width * 0.1; width *= 0.8; height *= 0.4;
		e = drawSkin2("Hanipure Hold Line", width, height);
		e.style.position = "absolute";
		e.style.top = centerTop(t) - height / 2.0 + "px";
		e.style.left = lineLeft[l] - 3 * w / 274 + leftOffset + "px";
		e.style.zIndex = Math.round(t * 1000) + 1000;
		e.id = "stage-note-" + id + "-" + t + "-" + l;
		document.getElementById("stage").appendChild(e);
		return;
	}
	switch(id) {
		case 1: e = drawSkin2("Hanipure Normal Note", width, height); break;
		case 2: e = drawSkin2("Hanipure Normal Flick", width, height); break;
		case 21: e = drawSkin2("Hanipure Normal Hold", width, height); break;
		case 23: e = drawSkin2("Hanipure Normal Hold", width, height); break;
		case 24: e = drawSkin2("Hanipure Normal Flick", width, height); break;
	}; e.style.position = "absolute";
	e.style.top = centerTop(t) - height / 2.0 + "px";
	e.style.left = lineLeft[l] - 3 * w / 274 + "px";
	e.style.zIndex = Math.round(t * 1000) + 1000;
	e.id = "stage-note-" + id + "-" + t + "-" + l;
	document.getElementById("stage").appendChild(e);
}

function addOnclickListener(id, t, l, holdId) {
	const ID = holdId, T = t, L = l;
	var e = document.getElementById("stage-note-" + id + "-" + t + "-" + l);
	switch(id) {
		case 1: case 2: e.onclick = function(event) {
			updateCurrentTool();
			if (currentTool != 5) return;
			eraseNote(T, L);
			event.stopPropagation();
		}; break;
		case 21: case 22: case 23: case 24: e.onclick = function(event) {
			updateCurrentTool();
			if (!hasBorder(T, L)) {
				if (currentTool != 5) drawBorder(T, L);
			} else clearBorder(T, L);
			if (currentTool == 5) eraseHoldNote(ID, T, L);
			event.stopPropagation();
		}; break;
	}
}

// border 监控模块

function hasBorder(t, l) {
	return document.getElementById("stage-note-" + t + "-" + l + "-border") != undefined;
}

function clearBorder() {
	if (clickL == 0 && clickT == 0) return;
	document.getElementById("stage-note-" + clickT + "-" + clickL + "-border").remove();
	clickL = clickT = clickId = 0;
}

function drawBorder(t, l) {
	clearBorder(); clickT = t, clickL = l;
	for (var i = 0; i < chart.length; i++)
		if (chart[i][1] == t && chart[i][2] == l) clickId = chart[i][3];
	const w = stageClientWidth - 20; const width = w / 274 * 50, height = width * 0.5;
	var border = document.createElement("div");
	var width2 = w / 274 * 46.4;
	var height2 = width2 * 0.5;
	border.style.position = "absolute";
	border.style.border = "1px solid";
	border.style.borderColor = "white";
	border.style.width = width2 + "px";
	border.style.height = height2 + "px";
	border.style.top = centerTop(t) + 1.0 - height / 2.0 + "px";
	border.style.left = lineLeft[l] - w / 274 * 1.2  + "px";
	border.style.zIndex = 1;
	border.id = "stage-note-" + t + "-" + l + "-border";
	document.getElementById("stage").appendChild(border);
}

// 操作栈管理模块

var tmpOpStack = Array();

function add(id, t, l, holdId) {
	noteNumber++;
	if (id < 10) chart.push([id, t, l]);
	else chart.push([id, t, l, holdId]);
	chart.sort(function(a, b) {
		return a[1] - b[1];
	}); switch(id) {
		case 1: tmpOpStack.push({"operator": "addNote", "data": [1, t, l]}); tapNumber++; drawNote(1, t, l); break;
		case 2: tmpOpStack.push({"operator": "addNote", "data": [2, t, l]}); flickNumber++; drawNote(2, t, l); break;
		case 21: tmpOpStack.push({"operator": "addNote", "data": [21, t, l, holdId]}); holdNumber++; drawNote(21, t, l); break;
		case 22: tmpOpStack.push({"operator": "addNote", "data": [22, t, l, holdId]}); holdLineNumber++; drawNote(22, t, l); break;
		case 23: tmpOpStack.push({"operator": "addNote", "data": [23, t, l, holdId]}); holdEndNumber++; drawNote(23, t, l); break;
		case 24: tmpOpStack.push({"operator": "addNote", "data": [24, t, l, holdId]}); holdFlickEndNumber++; drawNote(24, t, l); break;
	} updateStatistics();
	addOnclickListener(id, t, l, holdId);
}

function remove(id, t, l) {
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][0] == id && chart[i][1] == t && chart[i][2] == l) {
			noteNumber--;
			switch(id) {
				case 1: tmpOpStack.push({"operator": "removeNote", "data": [1, t, l]}); tapNumber--; break;
				case 2: tmpOpStack.push({"operator": "removeNote", "data": [2, t, l]}); flickNumber--; break;
				case 21: tmpOpStack.push({"operator": "removeNote", "data": [21, t, l, chart[i][3]]}); holdNumber--; break;
				case 22: tmpOpStack.push({"operator": "removeNote", "data": [22, t, l, chart[i][3]]}); holdLineNumber--; break;
				case 23: tmpOpStack.push({"operator": "removeNote", "data": [23, t, l, chart[i][3]]}); holdEndNumber--; break;
				case 24: tmpOpStack.push({"operator": "removeNote", "data": [24, t, l, chart[i][3]]}); holdFlickEndNumber--; break;
			} chart.splice(i, 1);
			chart.sort(function(a, b) {
				return a[1] - b[1];
			}); document.getElementById("stage-note-" + id + "-" + t + "-" + l).remove();
			updateStatistics();
		}
	}
}

function addStack() {
	operatorStack.push(tmpOpStack);
	tmpOpStack = Array();
}

function addNote(t, l) {
	if (hasNote(t, l)) return;
	updateCurrentTool();
	switch(currentTool) {
		case 1: add(1, t, l); break;
		case 2: add(2, t, l); break;
		case 3: holdId++; add(21, t, l, holdId); add(23, t, l, holdId); break;
		case 4: holdId++; add(21, t, l, holdId); add(24, t, l, holdId); break;
	}; addStack();
}

function previousHold(id, t) {
	var index = -1;
	for (var i = 0; i < chart.length; i++) {
		if (chart[i] < 10) continue;
		if (chart[i][3] == id && chart[i][1] < t) index = i;
	} return index;
}

function nextHold(id, t) {
	var index = -1;
	for (var i = 0; i < chart.length; i++) {
		if (chart[i] < 10) continue;
		if (chart[i][3] == id && chart[i][1] > t) {index = i; break;}
	} return index;
}

function drawHoldBody(stT, stL, enT, enL) {
	const w = stageClientWidth - 20; const width = w / 274 * 44;
	var stLeft = lineLeft[stL], enLeft = lineLeft[enL];
	var height = centerTop(stT) - centerTop(enT);
	var angle = Math.atan2(centerTop(stT) - centerTop(enT), enLeft - stLeft);
	if (angle < 0) angle = (-Math.PI / 2 - angle);
	else angle = Math.PI / 2 - angle;
	var e = drawSkin2("Hanipure Hold Body", width, height);
	e.style.position = "absolute";
	e.style.left = (stLeft + enLeft) / 2.0 + "px";
	e.style.top = centerTop(enT) + "px";
	e.style.transform = "skew(" + (-angle) + "rad)";
	e.id = "stage-holdbody-" + stT + "-" + stL + "-" + enT + "-" + enL;
	document.getElementById("stage").appendChild(e);
}

function addHoldLine(id, t, l) {
	if (hasNote(t, l)) return;
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][0] < 10) continue;
		if (chart[i][3] != id) continue;
		if (chart[i][1] == t) {
			clearBorder();
			return;
		}
	}
	// 新头
	if (previousHold(id, t) == -1) {
		var index = nextHold(id, t), T = chart[index][1], L = chart[index][2];
		remove(21, T, L);
		if (nextHold(id, T) != -1) add(22, T, L, id);
		add(21, t, l, id); drawHoldBody(t, l, T, L);
	}
	// 新尾
	if (nextHold(id, t) == -1) {
		var index = previousHold(id, t), T = chart[index][1], L = chart[index][2];
		var type = hasNote(T, L, [23, 24]); remove(type, T, L);
		if (previousHold(id, T) != -1) add(22, T, L, id);
		add(type, t, l, id); drawHoldBody(T, L, t, l);
	}
	// 中间
	if (nextHold(id, t) != -1 && previousHold(id, t) != -1) {
		var pre = previousHold(id, t), preT = chart[pre][1], preL = chart[pre][2];
		var nxt = nextHold(id, t), nxtT = chart[nxt][1], nxtL = chart[nxt][2];
		document.getElementById("stage-holdbody-" + preT + "-" + preL + "-" + nxtT + "-" + nxtL).remove();
		add(22, t, l, id); drawHoldBody(preT, preL, t, l);
		drawHoldBody(t, l, nxtT, nxtL);
	} addStack();
	clearBorder();
	drawBorder(t, l);
}

function eraseNote(t, l) {
	while(hasNote(t, l)) {
		var id = hasNote(t, l);
		remove(id, t, l);
	} addStack();
}

function eraseHoldNote(id, t, l) {
	console.log(id, t, l);
	// 就一个
	if (previousHold(id, t) == -1 && nextHold(id, t) == -1) {
		eraseNote(t, l);
		return;
	}
	// 头部
	if (previousHold(id, t) == -1) {
		var index = nextHold(id, t), T = chart[index][1], L = chart[index][2];
		remove(21, t, l); remove(22, T, L);
		add(21, T, L, id); document.getElementById("stage-holdbody-" + t + "-" + l + "-" + T + "-" + L).remove();
	}
	// 尾部
	if (nextHold(id, t) == -1) {
		var index = previousHold(id, t), T = chart[index][1], L = chart[index][2];
		var type = hasNote(t, l, [23, 24]); remove(type, t, l); remove(22, T, L);
		add(type, T, L, id); document.getElementById("stage-holdbody-" + T + "-" + L + "-" + t + "-" + l).remove();
	}
	// 中间
	if (nextHold(id, t) != -1 && previousHold(id, t) != -1) {
		var pre = previousHold(id, t), preT = chart[pre][1], preL = chart[pre][2];
		var nxt = nextHold(id, t), nxtT = chart[nxt][1], nxtL = chart[nxt][2];
		document.getElementById("stage-holdbody-" + preT + "-" + preL + "-" + t + "-" + l).remove();
		document.getElementById("stage-holdbody-" + t + "-" + l + "-" + nxtT + "-" + nxtL).remove();
		remove(22, t, l); drawHoldBody(preT, preL, nxtT, nxtL);
	} addStack();
}

function gzipCompress(data) {
	return pako.gzip(data, {level: 9});
}

function gzipDecompress(data) {
	return pako.ungzip(data, {to: "string"});
}

async function getBlobFromZip(path) {
	var zip = new JSZip();
	await zip.loadAsync(await getBinary("/assets/EffectAudio"));
	var data = zip.file(path).async("blob");
	return data;
}

async function playEffect(id) {
	if (effectUrl[id] == undefined) return;
	var e = document.createElement("audio");
	e.src = effectUrl[id]; 
	console.log(e.src);
	e.autoplay = true; e.load();
	e.onended = function() {
		this.remove();
	};
}

function playEffectLooped(id) {
	if (effectUrl[id] == undefined) return;
	var e = document.createElement("audio");
	e.src = effectUrl[id]; 
	e.autoplay = true; e.loop = true; e.load();
	return e;
}

function stopEffectLooped(e) {
	e.pause();
	e.remove();
}