{
    var min = 1;
    var max = 30;
    var def = 25;
    var step = 1;
    var block = document.getElementById("search-block-rating");
    searchConfig["rating"] = def;
    var siz = Math.round((max - min) / step);
    block.style.setProperty("--tw-scale-x", (def - min) / (max - min));
    document.getElementById("search-rating").onmousedown = function(event){
        var min = 1;
        var max = 30;
        var def = 25;
        var step = 1;
        var block = document.getElementById("search-block-rating");
        var nMax = document.getElementById("search-block-full-rating").getBoundingClientRect().width;
        var info = document.getElementById("search-info-rating");
        var reset = document.getElementById("search-reset-rating");
        var nWidth = block.getBoundingClientRect().left;
        var nX = event.clientX - nWidth;
        if (nX > nMax) nX = nMax;
        if (nX < 0) nX = 0;
        var value = Math.round(nX / nMax * siz);
        info.innerHTML = value + min;
        if (value + min == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
        searchConfig["rating"] = value + min;
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
            searchConfig["rating"] = value + min;
            block.style.setProperty("--tw-scale-x", value / siz);
        };
        document.onmouseup = function(event){
            document.onmousemove = null;
            document.onmouseup = null;
        }
    };
    document.getElementById("search-left-rating").onclick = function(){
        var min = 1;
        var max = 30;
        var def = 25;
        var step = 1;
        var block = document.getElementById("search-block-rating");
        var nMax = document.getElementById("search-block-full-rating").getBoundingClientRect().width;
        var info = document.getElementById("search-info-rating");
        var reset = document.getElementById("search-reset-rating");
        if (searchConfig["rating"] == min) return false;
        var s = --searchConfig["rating"];
        block.style.setProperty("--tw-scale-x", (s - min) / (max - min));
        info.innerHTML = searchConfig["rating"];
        if (searchConfig["rating"] == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
    };
    document.getElementById("search-right-rating").onclick = function(){
        var min = 1;
        var max = 30;
        var def = 25;
        var step = 1;
        var block = document.getElementById("search-block-rating");
        var nMax = document.getElementById("search-block-full-rating").getBoundingClientRect().width;
        var info = document.getElementById("search-info-rating");
        var reset = document.getElementById("search-reset-rating");
        if (searchConfig["rating"] == max) return false;
        var s = ++searchConfig["rating"];
        block.style.setProperty("--tw-scale-x", (s - min) / (max - min));
        info.innerHTML = searchConfig["rating"];
        if (searchConfig["rating"] == def) reset.className = disableResetClass;
        else reset.className = enableResetClass;
    };
    document.getElementById("search-reset-rating").onclick = function(){
        var min = 1;
        var max = 30;
        var def = 25;
        var step = 1;
        var block = document.getElementById("search-block-rating");
        var nMax = document.getElementById("search-block-full-rating").getBoundingClientRect().width;
        var info = document.getElementById("search-info-rating");
        var reset = document.getElementById("search-reset-rating");
        searchConfig["rating"] = def;
        block.style.setProperty("--tw-scale-x", (def - min) / (max - min));
        info.innerHTML = searchConfig["rating"];
        reset.className = disableResetClass;
    };
};
{
    var def = ""; searchConfig["title"] = def;
    document.getElementById("search-reset-title").onclick =
    document.getElementById("search-clear-title").onclick = function(){
        var def = "";
        searchConfig["title"] = def;
        document.getElementById("search-title").value = def;
        document.getElementById("search-reset-title").className = disableResetClass;
    };
    document.getElementById("search-title").oninput = function(){
        var def = "";
        searchConfig["title"] = this.value;
        if (this.value == def) document.getElementById("search-reset-title").className = disableResetClass;
        else document.getElementById("search-reset-title").className = enableResetClass;
    }
};
{
    var def = ""; searchConfig["artists"] = def;
    document.getElementById("search-reset-artists").onclick =
    document.getElementById("search-clear-artists").onclick = function(){
        var def = "";
        searchConfig["artists"] = def;
        document.getElementById("search-artists").value = def;
        document.getElementById("search-reset-artists").className = disableResetClass;
    };
    document.getElementById("search-artists").oninput = function(){
        var def = "";
        searchConfig["artists"] = this.value;
        if (this.value == def) document.getElementById("search-reset-artists").className = disableResetClass;
        else document.getElementById("search-reset-artists").className = enableResetClass;
    }
};
{
    var def = ""; searchConfig["author"] = def;
    document.getElementById("search-reset-author").onclick =
    document.getElementById("search-clear-author").onclick = function(){
        var def = "";
        searchConfig["author"] = def;
        document.getElementById("search-author").value = def;
        document.getElementById("search-reset-author").className = disableResetClass;
    };
    document.getElementById("search-author").oninput = function(){
        var def = "";
        searchConfig["author"] = this.value;
        if (this.value == def) document.getElementById("search-reset-author").className = disableResetClass;
        else document.getElementById("search-reset-author").className = enableResetClass;
    }
};
{
    var def = ""; searchConfig["description"] = def;
    document.getElementById("search-reset-description").onclick =
    document.getElementById("search-clear-description").onclick = function(){
        var def = "";
        searchConfig["description"] = def;
        document.getElementById("search-description").value = def;
        document.getElementById("search-reset-description").className = disableResetClass;
    };
    document.getElementById("search-description").oninput = function(){
        var def = "";
        searchConfig["description"] = this.value;
        if (this.value == def) document.getElementById("search-reset-description").className = disableResetClass;
        else document.getElementById("search-reset-description").className = enableResetClass;
    }
};