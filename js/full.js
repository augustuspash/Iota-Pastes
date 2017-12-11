$('#loadingModal').modal({
    backdrop: 'static',
    keyboard: false
});
    
iotaBundler.init();

var converter = new showdown.Converter();

var hashData = "";
var viewType = 0;

var url = new URL(window.location.href);
var c = url.searchParams.get("id");
var viewType = url.searchParams.get("type");
var encrypted = url.searchParams.get("encrypt");
var hash = "";
if (c) {
    hash = (new bigInt(c, 62)).toString(27);
}
if (encrypted == "1") {
    encrypted = true;
} else {
    encrypted = false;
}

hash = transcode(hash, bigIntAlpha, hashAlpha);
console.log(hash);

$(document).ready(function() {
    if (hash == "") {
        $("#loading").html('Failed to load data. :(');
        return;
    }
    iotaBundler.fetchDataFromTangle(hash).then(function (data) {
        hashData = data;
        if (encrypted) {
            var pass = prompt("Please enter the password.", "");
            var salt = prompt("Please enter the salt used.", "");
            decryptAES_2(pass, salt, hashData).then(function(data) {
                hashData = data;
                writeToDocument();
            }).catch(function (error) { 
                $(".loading").html('Failed to decrypt. :(');
            });
        } else {
            writeToDocument();
        }
    }).catch(function (error) { 
        $("#loading").html('Failed to load data. :(');
    });
});

function writeToDocument() {
    switch(viewType) {
        case("0"):
            var newDoc = document.open("text/plain", "replace");
            newDoc.write("<pre>"+xssFilters.inHTMLData(hashData)+"</pre>");
            newDoc.close();
            break;
        case("1"):
            var newDoc = document.open("text/html", "replace");
            newDoc.write(converter.makeHtml(xssFilters.inHTMLData(hashData)));
            newDoc.close();
            break;
        case("2"):
            var newDoc = document.open("text/plain", "replace");
            newDoc.write(hashData);
            newDoc.close();
            break;
        case("3"):
            var newDoc = document.open("text/html", "replace");
            newDoc.write(converter.makeHtml(hashData));
            newDoc.close();
            break;
    }
}