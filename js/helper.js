function generateIV() {
    return forge.random.getBytesSync(16);
}

function generateSalt() {
    return forge.random.getBytesSync(128);
}

function encryptAES(iv, salt, password, data) {
    var key = forge.pkcs5.pbkdf2(password, salt, 1000, 32);
    
    var cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    
    return cipher.output.toHex()
}

function decryptAES(iv, salt, password, data) {
    var key = forge.pkcs5.pbkdf2(passwod, salt, 1000, 32);

    var decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({iv: iv});
    decipher.update(data);
    decipher.finish();
    
    return decipher.output.toString();
}

function encryptAES_2(password, salt, data) {
    var password = new buffer.SlowBuffer(password.normalize('NFKC'));
    var salt = new buffer.SlowBuffer(salt.normalize('NFKC'));

    var N = 1024, r = 8, p = 1;
    var dkLen = 32;
    
    return new Promise(function (resolve, reject) {
        scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {
            if (error) {
                reject(error);
            } else if (key) {
                var dataBytes = aesjs.utils.utf8.toBytes(data);

                var aesCtr = new aesjs.ModeOfOperation.ctr(key);
                var encryptedBytes = aesCtr.encrypt(dataBytes);

                var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
                resolve(encryptedHex);
            }
        });
    });
}

function decryptAES_2(password, salt, data) {
    var password = new buffer.SlowBuffer(password.normalize('NFKC'));
    var salt = new buffer.SlowBuffer(salt.normalize('NFKC'));

    var N = 1024, r = 8, p = 1;
    var dkLen = 32;
    
    return new Promise(function (resolve, reject) {
        scrypt(password, salt, N, r, p, dkLen, function(error, progress, key) {
            if (error) {
                reject(error);
            } else if (key) {
                var encryptedBytes = aesjs.utils.hex.toBytes(data);

                var aesCtr = new aesjs.ModeOfOperation.ctr(key);
                var decryptedBytes = aesCtr.decrypt(encryptedBytes);

                var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
                resolve(decryptedText);
            }
        });
    });
}

var hashAlpha = "QWERTYUIOPASDFGHJKLZXCVBNM9";
var bigIntAlpha = "0123456789abcdefghijklmnopq";

function transcode(input, alphabet1, alphabet2) {
  var value = "";
  for(var i = 0; i < input.length; i++) {
    var index = alphabet1.indexOf(input[i]);
    value += alphabet2[index];
  }
  return value;
}