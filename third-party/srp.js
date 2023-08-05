function Uint8ArraySubstr(array, st, len) {
    var ret = new Uint8Array(len);
    for (var i = 0; i < len; i++) ret[i] = array[st + i];
    return ret;
} 

function Uint8ArrayToString(array) {
    var ret = "";
    for (var i = 0; i < array.length; i++) ret += String.fromCharCode(array[i]);
    return ret;
}

class srp {
    fileNumber = 0;
    files = {}; jsons = [];

    constructor(context) {
        if (context == undefined) {
            this.fileNumber = 0;
            this.files = {}; this.jsons = [];
            return;
        } if (!(context instanceof Uint8Array)) throw new Error("Please use srp(context: Uint8Array) to construct a srp class.");
        if (Uint8ArrayToString(Uint8ArraySubstr(context, 0, 4)) != ".srp") throw new Error("Invalid srp file.");
        var pt = 4; this.fileNumber = 0; this.files = {};
        for (var i = 0; i < 8; i++) this.fileNumber <<= 8, this.fileNumber += context[pt++];
        for (var i = 0; i < this.fileNumber; i++) {
            var sha1 = "", size = 0;
            for (var j = 0; j < 20; j++) sha1 += context[pt++].toString(16).padStart(2, "0");
            for (var j = 0; j < 8; j++) size <<= 8, size += context[pt++];
            var content = new Uint8Array(size);
            for (var j = 0; j < size; j++) content[j] = context[pt++];
            // 哈希查验
            var sha1Real = CryptoJS.SHA1(CryptoJS.lib.WordArray.create(content)).toString();
            if (sha1Real != sha1) throw new Error("Invalid srp file.");
            this.files[sha1] = content;
        } var jsonNumber = 0;
        for (var i = 0; i < 8; i++) jsonNumber <<= 8, jsonNumber += context[pt++];
        for (var i = 0; i < jsonNumber; i++) {
            var type = "", size = 0;
            type = String.fromCharCode(context[pt++]);
            for (var j = 0; j < 8; j++) size <<= 8, size += context[pt++];
            var content = new Uint8Array(size);
            for (var j = 0; j < size; j++) content[j] = context[pt++];
            this.jsons.push({ type: type, content: (new TextDecoder("utf-8")).decode(content) });
        }
    }

    addFile(content) {
        if (!(content instanceof Uint8Array)) throw new Error("Please use Uint8Array to add a file.");
        var sha1 = CryptoJS.SHA1(CryptoJS.lib.WordArray.create(content)).toString();
        this.files[sha1] = content; this.fileNumber++;
        console.log(sha1);
        return sha1;
    }

    addJson(type, content) {
        if (typeof content != "string") throw new Error("A json must be a string.");
        this.jsons.push({ type: type, content: content });
    }

    toUint8Array() {
        this.fileNumber = 0;
        for (var sha1 in this.files) this.fileNumber++;
        var pt = 0; var len = 4 + 8 + 28 * this.fileNumber + 8 + 9 * this.jsons.length;
        for (var sha1 in this.files) len += this.files[sha1].length;
        for (var i = 0; i < this.jsons.length; i++) len += (new TextEncoder("utf-8")).encode(this.jsons[i].content).length;
        var ret = new Uint8Array(len), x = new Uint8Array(8); len = this.fileNumber;
        ret[pt++] = 0x2e; ret[pt++] = 0x73; ret[pt++] = 0x72; ret[pt++] = 0x70;
        for (var i = 0; i < 8; i++) x[i] = len % 256, len /= 256, len = Math.floor(len);
        for (var i = 0; i < 8; i++) ret[pt++] = x[7 - i];
        for (var sha1 in this.files) {
            var content = this.files[sha1]; var x = new Uint8Array(8); var len = content.length;
            for (var j = 0; j < 20; j++) ret[pt++] = parseInt(sha1.substr(j * 2, 2), 16);
            for (var j = 0; j < 8; j++) x[j] = len % 256, len /= 256, len = Math.floor(len);
            for (var j = 0; j < 8; j++) ret[pt++] = x[7 - j];
            for (var j = 0; j < content.length; j++) ret[pt++] = content[j];
        } len = this.jsons.length;
        for (var i = 0; i < 8; i++) x[i] = len % 256, len /= 256, len = Math.floor(len);
        for (var i = 0; i < 8; i++) ret[pt++] = x[7 - i];
        for (var i = 0; i < this.jsons.length; i++) {
            var json = this.jsons[i], x = new Uint8Array(8); 
            var len = (new TextEncoder("utf-8")).encode(json.content).length
            ret[pt++] = json.type.charCodeAt(0);
            for (var j = 0; j < 8; j++) x[j] = len % 256, len /= 256, len = Math.floor(len);
            for (var j = 0; j < 8; j++) ret[pt++] = x[7 - j];
            var content = (new TextEncoder("utf-8")).encode(json.content);
            for (var j = 0; j < content.length; j++) ret[pt++] = content[j];
        } console.log(ret);
        return ret;
    }
};

function LevelDataToChart(LevelData) {
    var json = JSON.parse(gzipDecompress(LevelData))["entities"];
    console.log(json);
    var holdId = 0; var hold = {}; var chart = [];
    for (var i = 0; i < json.length; i++) {
        switch(json[i]["archetype"]) {
            case "Hanipure Initialization": break;
            case "Hanipure Input Manager": break;
            case "Hanipure Stage": break;
            case "Hanipure Normal Note": chart.push([1, json[i]["data"][0]["value"], json[i]["data"][1]["value"]]); break;
            case "Hanipure Normal Flick": chart.push([2, json[i]["data"][0]["value"], json[i]["data"][1]["value"]]); break;
            case "Hanipure Normal Hold": {
                holdId++; hold[json[i]["ref"]] = holdId;
                chart.push([21, json[i]["data"][0]["value"], json[i]["data"][1]["value"], holdId]);
            } break;
            case "Hanipure Hold Line": {
                chart.push([22, json[i]["data"][0]["value"], json[i]["data"][1]["value"], hold[json[i]["data"][2]["ref"]]]);
                hold[json[i]["ref"]] = hold[json[i]["data"][2]["ref"]];
            } break;
            case "Hanipure Hold End": chart.push([23, json[i]["data"][0]["value"], json[i]["data"][1]["value"], hold[json[i]["data"][2]["ref"]]]); break;
            case "Hanipure Hold Flick End": chart.push([24, json[i]["data"][0]["value"], json[i]["data"][1]["value"], hold[json[i]["data"][2]["ref"]]]); break;
        }
    } return chart;
}

function randomRef(len) {
    var ret = "";
    for (var i = 0; i < len; i++) ret += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return ret;
}

const refLen = 32;
function ChartToLevelData(chart, bgmOffset = 0) {
    var res = []; var lastNoteRef = {}, stNoteRef = {};
	var minLane = {}, maxLane = {};
	var single = {};
	single["archetype"] = "Hanipure Initialization";
    single["data"] = [{"name": "beat", "value": 0}];
	res.push(single);
	single["archetype"] = "Hanipure Input Manager";
	res.push(single);
	single["archetype"] = "Hanipure Stage";
	res.push(single);
	for (var i = 0; i < chart.length; i++) {
		var note = chart[i];
		var single = {};
		if (note[0] >= 10 && note[0] < 20) note[3] = 1e5 + note[3];
		switch(note[0]) {
			case 1: {
				single["archetype"] = "Hanipure Normal Note";
                single["data"] = [
                    {"name": "beat", "value": note[1]}, 
                    {"name": "lane", "value": note[2]}
                ];
			}; break; // Normal Note
			case 2: {
				single["archetype"] = "Hanipure Normal Flick";
                single["data"] = [
                    {"name": "beat", "value": note[1]}, 
                    {"name": "lane", "value": note[2]}
                ];
			}; break; // Normal Flick
			case 11: case 21: {
				single["archetype"] = "Hanipure Normal Hold";
                single["data"] = [
                    {"name": "beat", "value": note[1]}, 
                    {"name": "lane", "value": note[2]}
                ]; var randomId = randomRef(refLen);
				lastNoteRef[note[3]] = randomId;
				stNoteRef[note[3]] = randomId;
				single["ref"] = randomId;
			}; break; // Normal Hold
			case 22: {
				single["archetype"] = "Hanipure Hold Line";
                single["data"] = [
                    {"name": "beat", "value": note[1]}, 
                    {"name": "lane", "value": note[2]}, 
                    {"name": "last", "ref": lastNoteRef[note[3]]}, 
                    {"name": "start", "ref": stNoteRef[note[3]]}
                ]; var randomId = randomRef(refLen);
				lastNoteRef[note[3]] = randomId;
				single["ref"] = randomId;
			} break; // Hold Line
			case 12: case 23: {
				single["archetype"] = "Hanipure Hold End";
                single["data"] = [
                    {"name": "beat", "value": note[1]},
                    {"name": "lane", "value": note[2]},
                    {"name": "last", "ref": lastNoteRef[note[3]]},
                    {"name": "start", "ref": stNoteRef[note[3]]}
                ];
			} break; // Hold Normal Note
			case 13: case 24: {
				single["archetype"] = "Hanipure Hold Flick End";
                single["data"] = [
                    {"name": "beat", "value": note[1]},
                    {"name": "lane", "value": note[2]},
                    {"name": "last", "ref": lastNoteRef[note[3]]},
                    {"name": "start", "ref": stNoteRef[note[3]]}
                ];
			} break; // Hold Flick Note
		}
		if (note[0] != 22) {
			var beat = note[1]; var lane = note[2];
			if (minLane[beat] == undefined) minLane[beat] = lane;
			else minLane[beat] = Math.min(minLane[beat], lane);
			if (maxLane[beat] == undefined) maxLane[beat] = lane;
			else maxLane[beat] = Math.max(maxLane[beat], lane);
		}
		res.push(single);
	}
	// 计算同步线
	for (var v in minLane) {
		var beat = v; var lane = minLane[v];
		if (lane == maxLane[beat]) continue;
		var single = {};
		single["archetype"] = "Hanipure Sync Line";
        single["data"] = [
            {"name": "beat", "value": Number(beat)},
            {"name": "minLane", "value": lane},
            {"name": "maxLane", "value": maxLane[beat]}
        ]; res.push(single);
	} var data = {};
	data["bgmOffset"] = bgmOffset;
	data["entities"] = res;
    return gzipCompress(JSON.stringify(data));
}