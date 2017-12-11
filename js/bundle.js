var iota = new IOTA({
  provider: 'http://node.lukaseder.de:14265',
});

curl.init();
curl.overrideAttachToTangle(iota);

var iotaBundler = {
	MAX_TRYTES: 2187,
	seed: '',
	init: function (seed) {
		if (!seed) {
			seed = iotaBundler.utils.createSeed();
		}

		iotaBundler.seed = seed;
	},
	
	utils: {
		generateAddress: function () {
			return new Promise(function (resolve, reject) {
				iota.api.getNewAddress(iotaBundler.seed, {}, function (error, address) {
					if (error) {
						reject(error);
					} else {
						resolve(address);
					}
				});
			});
		},
		
		createSeed: function () {
			var text = '';
			const alphabet = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ';

			for (var i = 0; i < 81; i++) {
				text += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
			}
			return text;
		},
	},
	
	createTransactions: function (data, address, tag) {
			var trytes = iota.utils.toTrytes(data);
			if (!trytes) return;
			var chunks = trytes.match(new RegExp('.{1,' + iotaBundler.MAX_TRYTES + '}', 'g'));
			return chunks.map(function (chunk) {
				return {
					'address': address,
					'value': 0,
					'message': chunk,
					'tag': tag,
				};
			});
		},
		
		sendDataToTangle: function (txs) {
			return new Promise(function (resolve, reject) {
				iota.api.sendTransfer(iotaBundler.seed, 4, 14, txs, function (error, transaction) {
					if (error) {
						reject(error);
					} else {
						resolve(transaction[0].bundle);
					}
				});
			});
		},
		
		fetchDataFromTangle: function (bundle) {
			return new Promise(function (resolve, reject) {
				iota.api.findTransactionObjects({ bundles: [bundle] }, function (error, result) {
					var resultSorted = result.sort(function (a, b) {
						return a.currentIndex - b.currentIndex;
					});
					var tryteChunks = resultSorted.map(function (tx) {
						return tx.signatureMessageFragment;
					});
					
					tryteChunks[tryteChunks.length - 1] = tryteChunks[tryteChunks.length - 1].replace(/9+$/, '');
					
					resolve(iota.utils.fromTrytes(tryteChunks.join('')));
				});
			});
		}
};


