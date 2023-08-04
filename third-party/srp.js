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
    files = {};
    constructor(context) {
        if (!(context instanceof Uint8Array)) throw new Error("Please use srp(context: Uint8Array) to construct a srp class.");
        if (Uint8ArrayToString(Uint8ArraySubstr(context, 0, 4)) != ".srp") throw new Error("Invalid srp file.");
        var pt = 4; this.fileNumber = 0; this.files = {};
        for (var i = 0; i < 8; i++) this.fileNumber <<= 3, this.fileNumber += context[pt++];
    }
}