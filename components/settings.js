{
    searchConfig["offset"] = IsPC() ? 125 : 250;
    document.getElementById("search-offset").onmousedown = function(event){
        var min = -500;
        var max = 500;
        var def = IsPC() ? 125 : 250;
        var step = 1;
        var block = document.getElementById("search-block-offset");
        var nMax = document.getElementById("search-block-full-offset").clientWidth;
        var info = document.getElementById("search-info-offset");
        var reset = document.getElementById("search-reset-offset");
        var siz = Math.round((max - min) / step);
        var nWidth = block.getBoundingClientRect().left;
        var nX = event.clientX - nWidth;
        if (nX > nMax) nX = nMax;
        if (nX < 0) nX = 0;
        var value = Math.round(nX / nMax * siz);
        info.innerHTML = value + min;
        if (value + min == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
        searchConfig["offset"] = value + min;
        block.style.setProperty("--tw-scale-x", value / siz);
        document.onmousemove = function(event){
            event.preventDefault();
            var nX = event.clientX - nWidth;
            if (nX > nMax) nX = nMax;
            if (nX < 0) nX = 0;
            var value = Math.round(nX / nMax * siz);
            info.innerHTML = value + min;
            if (value + min == def) reset.className = disableResetClass;
            else reset.className = enableResetClass;
            searchConfig["offset"] = value + min;
            block.style.setProperty("--tw-scale-x", value / siz);
        };
        document.onmouseup = function(event){
            document.onmousemove = null;
            document.onmouseup = null;
        }
    };
    document.getElementById("search-left-offset").onclick = function(){
        var min = -500;
        var max = 500;
        var def = IsPC() ? 125 : 250;
        var step = 1;
        var block = document.getElementById("search-block-offset");
        var nMax = document.getElementById("search-block-full-offset").clientWidth;
        var info = document.getElementById("search-info-offset");
        var reset = document.getElementById("search-reset-offset");
        if (searchConfig["offset"] == min) return false;
        var s = --searchConfig["offset"];
        block.style.setProperty("--tw-scale-x", (s - min) / (max - min));
        info.innerHTML = searchConfig["offset"];
        if (searchConfig["offset"] == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
    };
    document.getElementById("search-right-offset").onclick = function(){
        var min = -500;
        var max = 500;
        var def = IsPC() ? 125 : 250;
        var step = 1;
        var block = document.getElementById("search-block-offset");
        var nMax = document.getElementById("search-block-full-offset").clientWidth;
        var info = document.getElementById("search-info-offset");
        var reset = document.getElementById("search-reset-offset");
        if (searchConfig["offset"] == max) return false;
        var s = ++searchConfig["offset"];
        block.style.setProperty("--tw-scale-x", (s - min) / (max - min));
        info.innerHTML = searchConfig["offset"];
        if (searchConfig["offset"] == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
    };
    document.getElementById("search-reset-offset").onclick = function(){
        var min = -500;
        var max = 500;
        var def = IsPC() ? 125 : 250;
        var step = 1;
        var block = document.getElementById("search-block-offset");
        var nMax = document.getElementById("search-block-full-offset").clientWidth;
        var info = document.getElementById("search-info-offset");
        var reset = document.getElementById("search-reset-offset");
        searchConfig["offset"] = def;
        block.style.setProperty("--tw-scale-x", (def - min) / (max - min));
        info.innerHTML = searchConfig["offset"];
        reset.className = disableResetClass;
    };
};
{
    var def = 3;
    searchConfig["line"] = def;
    document.getElementById("search-line").oninput = function(){
        var def = 3;
        searchConfig["line"] = this.value;
        document.getElementById("search-info-line").innerHTML = document.getElementById("search-line-" + searchConfig["line"]).innerHTML;
        if (searchConfig["line"] == def) document.getElementById("search-reset-line").className = disableResetClass;
        else document.getElementById("search-reset-line").className = enableResetClass;
    }
    document.getElementById("search-reset-line").onclick = function(){
        var def = 3;
        searchConfig["line"] = def;
        document.getElementById("search-line").value = def;
        document.getElementById("search-info-line").innerHTML = document.getElementById("search-line-" + searchConfig["line"]).innerHTML;
        document.getElementById("search-reset-line").className = disableResetClass;
    }
};
{
    var def = 0;
    searchConfig["time"] = def;
    document.getElementById("search-time").oninput = function(){
        var def = 0;
        searchConfig["time"] = this.value; stageLengthSecond = this.value * 1.0 + 1;
        document.getElementById("search-info-time").innerHTML = document.getElementById("search-time-" + searchConfig["time"]).innerHTML;
        if (searchConfig["time"] == def) document.getElementById("search-reset-time").className = disableResetClass;
        else document.getElementById("search-reset-time").className = enableResetClass;
    }
    document.getElementById("search-reset-time").onclick = function(){
        var def = 0;
        searchConfig["time"] = def; stageLengthSecond = def + 1;
        document.getElementById("search-time").value = def;
        document.getElementById("search-info-time").innerHTML = document.getElementById("search-time-" + searchConfig["time"]).innerHTML;
        document.getElementById("search-reset-time").className = disableResetClass;
    }
};