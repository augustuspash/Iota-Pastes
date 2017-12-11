iotaBundler.init();

var encryption = {
    password: "",
    salt: "",
    enabled: false
};

var updateChar = function() {
    $("#charDisplay").text($("#bin").val().length + "/2600");
};

$("#bin").keydown(updateChar);
$("#bin").keyup(updateChar);
$("#bin").keypress(updateChar);

$("#encypt").click(function() {
    loadEncrypt();
});

$("#encryptStatus").click(function() {
    var encryptEnable = $("#encryptStatus").is(":checked");
    $('#password').prop('readonly', !encryptEnable);
    $('#salt').prop('readonly', !encryptEnable);
});


$("#save").click(function() {
    saveEncrypt();
});

$("#post").click(function() {
    $('#loadingModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    disable();
    $("#loading").html('Starting/Encrypting <img src="img/dial.gif" width="15" height="15" />');
    
    setTimeout(function() {
        var data = $("#bin").val();
        if (data.length == 0) {
            alert("Text cannot be empty.");
            enable();
            $('#loadingModal').modal('hide');
            return;
        } else if (data.length > 2600) {
            alert("Must have less than 2601 characters");
            enable();
            $('#loadingModal').modal('hide');
            return;
        } else {
            var iotaSect = function (proData) {
                $("#loading").html('Starting/Encrypting...</br>Generating Address <img src="img/dial.gif" width="15" height="15" />');
                iotaBundler.utils.generateAddress().then(function(address) {
                    $("#loading").html('Starting/Encrypting...</br>Generating Address...</br>Creating Transactions <img src="img/dial.gif" width="15" height="15" />');
                    var txs = iotaBundler.createTransactions(proData, address, 'PASTEBIN');
                    $("#loading").html('Starting/Encrypting...</br>Generating Address...</br>Creating Transactions...</br>Sending Transactions <img src="img/dial.gif" width="15" height="15" />');
                    iotaBundler.sendDataToTangle(txs).then(function(bundle){
                        var id = transcode(bundle, hashAlpha, bigIntAlpha);
                        id = (new bigInt(id, 27)).toString(62);
                        window.location.href = "view.html?id=" + id;
                    }).catch(function(error) {
                        alert(error);
                        enable();
                        $('#loadingModal').modal('hide');
                        $("#loading").html('');
                    });
                }).catch(function(error) {
                    alert(error);
                    enable();
                    $('#loadingModal').modal('hide');
                    $("#loading").html('');
                });
            };
            if (encryption.enabled) {
                encryptAES_2(encryption.password, encryption.salt, data).then(iotaSect).catch(function(error) {
                    alert(error);
                    enable();
                    $('#loadingModal').modal('hide');
                    $("#loading").html('');
                });;
            } else {
                iotaSect(data);
            }
        }
    }, 500);
});

function loadEncrypt() {
    $("#encryptStatus").prop('checked', encryption.enabled);
    $('#password').prop('readonly', !encryption.enabled);
    $('#salt').prop('readonly', !encryption.enabled);
    
    $("#password").val(encryption.password);
    $("#salt").val(encryption.salt);
}

function saveEncrypt() {
    encryption.enabled = $("#encryptStatus").is(":checked");
    encryption.password = $("#password").val();
    encryption.salt = $("#salt").val();
}

function enable() {
    $("#post").prop("disabled", false);
    $("#bin").prop("readonly", false);
}

function disable() {
    $("#post").prop("disabled", true);
    $("#bin").prop("readonly", true);
}