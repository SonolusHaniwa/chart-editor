{
    var def = "";
    searchConfig["bgm"] = "";
    document.getElementById("search-reset-bgm").onclick =
    document.getElementById("search-clear-bgm").onclick = function(){
        var def = "";
        searchConfig["bgm"] = def;
        document.getElementById("search-bgm").value = def;
        document.getElementById("search-reset-bgm").className = disableResetClass;
    };
    document.getElementById("search-bgm").oninput = function(){
        var def = "";
        searchConfig["bgm"] = this.value;
        if (this.value == def) document.getElementById("search-reset-bgm").className = disableResetClass;
        else document.getElementById("search-reset-bgm").className = enableResetClass;
    };
    document.getElementById("search-file-bgm").oninput = async function(){
        var def = "";
        document.getElementById("search-bgm").value = await uploader(await readBinaryFile(this.files[0]));
        document.getElementById("search-preview-bgm").src = document.getElementById("search-bgm").value;
        document.getElementById("search-preview-bgm").load();
        document.getElementById("chart-controller").src = document.getElementById("search-bgm").value;
        document.getElementById("chart-controller").load();
        document.getElementById("chart-controller").onloadedmetadata = async function() {
            totalTime = document.getElementById("chart-controller").duration;
            drawStage(); drawTimeline();
        }; clearMap(); updateStatistics();
        searchConfig["bgm"] = document.getElementById("search-bgm").value;
        document.getElementById("search-reset-bgm").className = enableResetClass;
        document.getElementById("search-file-bgm").value = "";
    }
    document.getElementById("search-upload-bgm").onclick = function() {
        var def = "";
        document.getElementById("search-file-bgm").click();
    };
};