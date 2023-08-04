{
var def = "";
searchConfig["cover"] = "";
document.getElementById("search-reset-cover").onclick =
document.getElementById("search-clear-cover").onclick = function(){
    var def = "";
    searchConfig["cover"] = def;
    document.getElementById("search-cover").value = def;
    document.getElementById("search-reset-cover").className = disableResetClass;
};
document.getElementById("search-cover").oninput = function(){
    var def = "";
    searchConfig["cover"] = this.value;
    if (this.value == def) document.getElementById("search-reset-cover").className = disableResetClass;
    else document.getElementById("search-reset-cover").className = enableResetClass;
};
document.getElementById("search-file-cover").oninput = async function(){
    var def = "";
    document.getElementById("search-cover").value = await uploader(await readBinaryFile(this.files[0]));
    document.getElementById("search-preview-cover").src = document.getElementById("search-cover").value;
    searchConfig["cover"] = document.getElementById("search-cover").value;
    document.getElementById("search-reset-cover").className = enableResetClass;
    document.getElementById("search-file-cover").value = "";
}
document.getElementById("search-upload-cover").onclick = function() {
    var def = "";
    document.getElementById("search-file-cover").click();
};
};