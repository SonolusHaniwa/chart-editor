{
var def = "";
searchConfig["preview"] = "";
document.getElementById("search-reset-preview").onclick =
document.getElementById("search-clear-preview").onclick = function(){
    searchConfig["preview"] = def;
    document.getElementById("search-preview").value = def;
    document.getElementById("search-reset-preview").className = disableResetClass;
};
document.getElementById("search-preview").oninput = function(){
    searchConfig["preview"] = this.value;
    if (this.value == def) document.getElementById("search-reset-preview").className = disableResetClass;
    else document.getElementById("search-reset-preview").className = enableResetClass;
};
document.getElementById("search-file-preview").oninput = async function(){
    document.getElementById("search-preview").value = await uploader(await readBinaryFile(this.files[0]));
    document.getElementById("search-preview-preview").src = document.getElementById("search-preview").value;
    document.getElementById("search-preview-preview").load();
    searchConfig["preview"] = document.getElementById("search-preview").value;
    document.getElementById("search-reset-preview").className = enableResetClass;
    document.getElementById("search-file-preview").value = "";
}
document.getElementById("search-upload-preview").onclick = function() {
    document.getElementById("search-file-preview").click();
};
};