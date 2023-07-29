{
    var def = "";
    searchConfig["bgm"] = "";
    document.getElementById("search-reset-bgm").onclick =
    document.getElementById("search-clear-bgm").onclick = function(){
        searchConfig["bgm"] = def;
        document.getElementById("search-bgm").value = def;
        document.getElementById("search-reset-bgm").className = disableResetClass;
    };
    document.getElementById("search-bgm").oninput = function(){
        searchConfig["bgm"] = this.value;
        if (this.value == def) document.getElementById("search-reset-bgm").className = disableResetClass;
        else document.getElementById("search-reset-bgm").className = enableResetClass;
    };
    document.getElementById("search-file-bgm").oninput = async function(){
        document.getElementById("search-bgm").value = await uploader(await readBinaryFile(this.files[0]));
        document.getElementById("search-preview-bgm").src = document.getElementById("search-bgm").value;
        document.getElementById("search-preview-bgm").load();
        searchConfig["bgm"] = document.getElementById("search-bgm").value;
        document.getElementById("search-reset-bgm").className = enableResetClass;
        document.getElementById("search-file-bgm").value = "";
    }
    document.getElementById("search-upload-bgm").onclick = function() {
        document.getElementById("search-file-bgm").click();
    };
};