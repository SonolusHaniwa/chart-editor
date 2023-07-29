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

// Toggle Features

function createChart() {
    alert("createChart");
}

function openChart() {
    alert("openChart");
}

function saveChart() {
    alert("saveChart");
}

function editorUndo() {
    alert("editorUndo");
}

function editorRedo() {
    alert("editorRedo");
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
                }
            ], [
                {
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
                toggleItem.onclick = item[j].callback;
                if (item[j].shortcut != undefined) {
                    addShortcut(item[j].shortcut.ctrl, item[j].shortcut.alt, item[j].shortcut.shift, item[j].shortcut.key, item[j].callback);
                }
            }
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

function htmlToNode(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function loadJS(path) {
    var oHead = document.getElementsByTagName('head')[0]; // 在head标签中创建创建script
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
}

async function fileSystem_chart() {
    var div = document.createElement("page");
    div.id = "fileSystem.chart"; div.innerHTML = "fileSystem.chart";
    document.getElementById("container").appendChild(div);
}

async function fileSystem_bgm() {
    var div = document.createElement("page");
    div.id = "fileSystem.bgm"; div.appendChild(htmlToNode(await getComponent("/components/bgm.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/bgm.js");
}

async function fileSystem_preview() {
    var div = document.createElement("page");
    div.id = "fileSystem.preview"; div.appendChild(htmlToNode(await getComponent("/components/preview.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/preview.js");
}

async function fileSystem_thumbnail() {
    var div = document.createElement("page");
    div.id = "fileSystem.thumbnail"; div.appendChild(htmlToNode(await getComponent("/components/cover.html")));
    div.style.width = "100%";
    document.getElementById("container").appendChild(div);
    loadJS("/components/cover.js");
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
        console.log(e);
        if (e.target.id != "toggleRoot" && e.target.localName != "toggle" &&
            e.target.localName != "togglecontent" && e.target.localName != "toggleitem" &&
            e.target.localName != "toggletext" && e.target.localName != "toggleshortcut") {
            clearToggleState();
        }
    });
});

function addShortcut(ctrl, alt, shift, key, callback) {
    addKeyDownEvent(function(e){
        var keyCode = e.keyCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var altKey = e.altKey;
        var shiftKey = e.shiftKey;
        console.log(ctrlKey, altKey, shiftKey, keyCode);
        console.log(ctrl, alt, shift, key);
        if (ctrlKey == ctrl && altKey == alt && shiftKey == shift && keyCode == key) {
            callback();
            e.preventDefault();
        }
    });
}