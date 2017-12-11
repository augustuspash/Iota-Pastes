iotaBundler.init();

var converter = new showdown.Converter();

var hashData = "";
var backHashData = "";
var type = 0;

var url = new URL(window.location.href);
var id = url.searchParams.get("id");
var hash = "";
if (id) {
    hash = (new bigInt(id, 62)).toString(27);
}

hash = transcode(hash, bigIntAlpha, hashAlpha);
console.log(hash);


$(document).ready(function() {
    if (hash == "") {
        $("#bin").val("Failed to load data. :(");
        return;
    }
    $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape("loading..."));
    $("#hash").text(hash);
    $("#hash").attr("href", "https://iotasear.ch/bundle/" + hash);
    iotaBundler.fetchDataFromTangle(hash).then(function (data) {
        hashData = data;
        $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape("<pre>"+xssFilters.inHTMLData(hashData) +"</pre>"));
    }).catch(function (error) { 
        $("#bin").val("Failed to load data. :(");
    });
});


$("#decryptOverlay").click(function() {
    if ($("#decryptOverlay").text() == "Revert") {
        hashData = backHashData;
        $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape("<pre>"+xssFilters.inHTMLData(hashData) +"</pre>"));
        $("#dlType").text("");
        $("#decryptOverlay").text("Decrypt");
        type = 0;
        $("#cancel").click();
        return;
    }
    $("#password").val("");
    $("#salt").val("");
});

$("#decrypt").click(function() {
    var password = $("#password").val();
    var salt = $("#salt").val();
    
    $("#decryptOverlay").prop("disabled", true);
    $("#cancel").prop("disabled", true);
    
    decryptAES_2(password, salt, hashData).then(function (data) {
        backHashData = hashData;
        hashData = data;
        $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape("<pre>"+xssFilters.inHTMLData(hashData) +"</pre>"));
        $("#dlType").text("");
        $("#decryptOverlay").text("Revert");
        type = 0;
        
        $("#cancel").click();
        $("#decryptOverlay").prop("disabled", false);
        $("#cancel").prop("disabled", false);
    }).catch(function (error) {
        alert(error);
        $("#cancel").click();
        $("#decryptOverlay").prop("disabled", false);
        $("#cancel").prop("disabled", false);
    });
    
});

$("#md").click(function() {
    $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape(converter.makeHtml(xssFilters.inHTMLData(hashData))));
    $("#dlType").text("as HTML");
    type = 1;
});

$("#plain").click(function() {
    $('#bin').get(0).contentWindow.location.replace("data:text/html;charset=utf-8," + escape("<pre>"+xssFilters.inHTMLData(hashData) +"</pre>"));
    $("#dlType").text("");
    type = 0;
});

$("#full").click(function() {
    $('#loadingModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    //window.location.href = "full.html?id=" + id + "&type=" + type + ($("#decryptOverlay").text() == "Revert" ? "&encrypt=1" : "");
});

$("#go").click(function() {
    var xss = $("#xss").prop("checked");
    var media = $("#media").prop("checked");
    var encrypt = !$("#encryptLink").prop("checked");
    
    var type = 0;
    
    if (!media) {
        type = 1;
    }
    
    if (!xss) {
        type += 2;
    }
    
    if (encrypt) {
        encrypt = 1;
    } else {
        encrypt = 0;
    }
    
    window.location.href = "full.html?id=" + id + "&type=" + type + "&encrypt=" + encrypt;  
});

$("#download").click(function() {
    var a = window.document.createElement('a');
    if (type == 0) {
        a.href = ("data:text/html;charset=utf-8," + escape(hashData));
    } else if (type == 1) {
        a.href = ("data:text/html;charset=utf-8," + escape(converter.makeHtml(xssFilters.inHTMLData(hashData))));
    }
    a.download = "iotaPaste.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

$(".header").click(function() {
    window.location.href = "index.html";
});
