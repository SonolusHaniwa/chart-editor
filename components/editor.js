var config;

async function loadConfig() {
	config = JSON.parse(await getComponent("/assets/SkinData"));
}

function drawSkin(id, size = 1) {
	var index = -1; for (var i = 0; i < config["sprites"].length; i++) {
		if (config["sprites"][i]["name"] == id) index = i;
	} var e = document.createElement("div");
	if (index == -1) return e;
	e.style.backgroundImage = "url(/assets/SkinTexture)";
	e.style.transform = "scale(" + size + ")";
	var arr = config["sprites"][index];
	e.style.width = arr["w"] + "px";
	e.style.height = arr["h"] + "px";
	e.style.backgroundPosition = "-" + arr["x"] + "px -" + arr["y"] + "px";
	return e;
}

function updateLength() {

}

function play() {

}

function jump(time) {
	
}

function pause() {

}
