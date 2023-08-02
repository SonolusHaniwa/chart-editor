var config;
var chart = [];
var currentTool = 0;
var operatorStack = [];
var holdId = 0;
var clickT = 0, clickL = 0;

var noteNumber = 0;
var tapNumber = 0;
var flickNumber = 0;
var holdNumber = 0;
var holdEndNumber = 0;
var holdFlickEndNumber = 0;

const SkinWidth = 4096;
const SkinHeight = 4096;

function clearMap() {
	chart = [];
	operatorStack = [];
	holdId = 0;
	clickT = clickL = 0;
	noteNumber = 0; tapNumber = 0; flickNumber = 0;
	holdNumber = 0; holdEndNumber = 0; holdFlickEndNumber = 0;
}

function updateStatistics() {
	document.getElementById("statistic-total").innerHTML = noteNumber;
	document.getElementById("statistic-tap").innerHTML = tapNumber;
	document.getElementById("statistic-flick").innerHTML = flickNumber;
	document.getElementById("statistic-hold").innerHTML = holdNumber;
	document.getElementById("statistic-holdend").innerHTML = holdEndNumber;
	document.getElementById("statistic-holdflickend").innerHTML = holdFlickEndNumber;
}

async function loadConfig() {
	config = JSON.parse(await getComponent("/assets/SkinData"));
}

function changeTool(id) {
	document.getElementById("tools-" + currentTool).removeAttribute("checked");
	currentTool = id;
	document.getElementById("tools-" + id).setAttribute("checked", "checked");
}

function drawSkin(id, w = 1, h = 1) {
	var index = -1; for (var i = 0; i < config["sprites"].length; i++) {
		if (config["sprites"][i]["name"] == id) index = i;
	} var e = document.createElement("div");
	if (index == -1) return e;
	e.style.backgroundImage = "url(/assets/SkinTexture)";
	var arr = config["sprites"][index];
	e.style.width = arr["w"] * w + "px";
	e.style.height = arr["h"] * h + "px";
	e.style.backgroundSize = w * SkinWidth + "px " + h * SkinHeight + "px";
	e.style.backgroundPosition = "-" + arr["x"] * w + "px -" + arr["y"] * h + "px";
	return e;
}

function drawSkin2(id, w, h) {
	var index = -1; for (var i = 0; i < config["sprites"].length; i++) {
		if (config["sprites"][i]["name"] == id) index = i;
	} var e = document.createElement("div");
	if (index == -1) return e;
	e.style.backgroundImage = "url(/assets/SkinTexture)";
	var arr = config["sprites"][index];
	w /= arr["w"]; h /= arr["h"];
	e.style.width = arr["w"] * w + "px";
	e.style.height = arr["h"] * h + "px";
	e.style.backgroundSize = w * SkinWidth + "px " + h * SkinHeight + "px";
	e.style.backgroundPosition = "-" + arr["x"] * w + "px -" + arr["y"] * h + "px";
	return e;
}

var intervalId = -1;
function play() {
	// var T = document.getElementById("chart-controller").currentTime;
	document.getElementById("chart-controller").ontimeupdate = function(){};
	document.getElementById("chart").onscroll = function(){};
	intervalId = setInterval(function(){
		T = document.getElementById("chart-controller").currentTime;
		jump(T, 1, 0);
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

function hasNote(t, l) {
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][1] == t && chart[i][2] == l) return true;
	} return false;
}

function clearClickState() {
	if (clickL == 0 && clickT == 0) return;
	document.getElementById("stage-note-" + clickT + "-" + clickL).click();
}

function addNote(t, l) {
	if (hasNote(t, l)) return;
	var e; const w = stageClientWidth - 20; const width = w / 274 * 50, height = width * 0.5;
    const top = (1.0 - viewBottom) * secondHeight * stageLengthSecond + 9.0 - height / 2.0;
	updateCurrentTool();
	switch(currentTool) {
		case 1: e = drawSkin2("Hanipure Normal Note", width, height); break;
		case 2: e = drawSkin2("Hanipure Normal Flick", width, height); break;
		case 3: e = drawSkin2("Hanipure Normal Hold", width, height); break;
		case 4: e = drawSkin2("Hanipure Normal Flick", width, height); break;
	}; switch(currentTool) {
		case 1: {
			chart.push([1, t, l]); noteNumber++; tapNumber++;
			operatorStack.push({"operator": "addNote", "data": [1, t, l]}); 
		} break;
		case 2: {
			chart.push([2, t, l]); noteNumber++; flickNumber++;
			operatorStack.push({"operator": "addNote", "data": [2, t, l]}); 
		} break;
		case 3: {
			++holdId; noteNumber += 2; holdNumber++; holdEndNumber++;
			chart.push([21, t, l, holdId]); chart.push([23, t, l, holdId]);
			operatorStack.push({"operator": "addNote", "data": [3, t, l, holdId]});
		} break;
		case 4: {
			++holdId; noteNumber += 2; holdNumber++; holdFlickEndNumber++;
			chart.push([21, t, l, holdId]); chart.push([24, t, l, holdId]);
			operatorStack.push({"operator": "addNote", "data": [4, t, l, holdId]});
		} break;
	};
	e.style.position = "absolute";
	e.style.top = (top + (totalTime - t) * secondHeight) + "px";
	e.style.left = lineLeft[l] - 3 * w / 274 + "px";
	e.style.zIndex = Math.round(t * 1000) + 1000;
	e.id = "stage-note-" + t + "-" + l;
	const T = t, L = l;
	e.onclick = function(event) {
		updateCurrentTool();
		if (currentTool == 0) return;
		if (T != clickT || L != clickL) clearClickState();
		if (document.getElementById("stage-note-" + t + "-" + l + "-border") == undefined) {
			if (currentTool != 5) {
				var border = document.createElement("div");
				var width2 = w / 274 * 46.4;
				var height2 = width2 * 0.5;
				border.style.position = "absolute";
				border.style.border = "1px solid";
				border.style.borderColor = "white";
				border.style.width = width2 + "px";
				border.style.height = height2 + "px";
				border.style.top = (top + (totalTime - t) * secondHeight + 1.0) + "px";
				border.style.left = lineLeft[l] - w / 274 * 1.2  + "px";
				border.style.zIndex = 1;
				border.id = "stage-note-" + t + "-" + l + "-border";
				clickT = T, clickL = L;
				document.getElementById("stage").appendChild(border);
			}
		} else {
			clickT = 0, clickL = 0;
			document.getElementById("stage-note-" + t + "-" + l + "-border").remove();
		} if (currentTool == 5) {
			eraseNote(T, L);
			return;
		} event.stopPropagation();
	};
	updateStatistics();
	document.getElementById("stage").appendChild(e);
}

function addHoldLine(id, t, l) {

}

function eraseNote(t, l) {
	for (var i = 0; i < chart.length; i++) {
		if (chart[i][1] == t && chart[i][2] == l) {
			switch(chart[i][0]) {
				case 1: {
					noteNumber--; tapNumber--;
					operatorStack.push({"operator": "eraseNote", "data": [1, t, l]});
				}; break;
				case 2: {
					noteNumber--; flickNumber--;
					operatorStack.push({"operator": "eraseNote", "data": [2, t, l]});
				}; break;
				case 3: {
					noteNumber -= 2; holdNumber--; holdEndNumber--;
					operatorStack.push({"operator": "eraseNote", "data": [3, t, l, chart[i][3]]});
				}; break;
				case 4: {
					noteNumber -= 2; holdNumber--; holdFlickEndNumber--;
					operatorStack.push({"operator": "eraseNote", "data": [4, t, l, chart[i][3]]});
				}; break;
			}; document.getElementById("stage-note-" + t + "-" + l).remove();
			updateStatistics();
			chart.splice(i, 1);
			return;
		}
	}
}