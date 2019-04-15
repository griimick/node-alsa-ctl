exports = module.exports

exports.keyValueParser= function (string, object) {
	if (object) {
		keyValueParser (string, object);
	} else {
		object = {};
		keyValueParser (string, object);
		return object;
	}
};

exports.valuesLineParser = function (string, valuesType, object) {
	if (object) {
		valuesLineParser (string, valuesType, object);
	} else {
		object = {};
		valuesLineParser (string, valuesType, object);
		return object;
	}
};

exports.itemLineParser = itemLineParser;

function keyValueParser (string, result) {
	let pairs = string.split (',');
	pairs.forEach ((pair) => {
		let kv = pair.split ('=');
		switch (kv[0]) {
			case 'values':
				result['valuesCount'] = kv[1];
				break;
			case 'items':
				result['itemsCount'] = kv[1];
				break;
			case 'name':
				result['name'] = kv[1].slice(1,-1);
				break;
			default:
				result[kv[0]] = kv[1];
		}
	});
	return result;
}

function valuesLineParser (string, valuesType, result) {

	let values;
	string = string.split ('=');

	switch (valuesType) {
		case 'ENUMERATED':
			values = string[1];
			break;
		case 'INTEGER':
			values = string[1].split (',');
			break;
		case 'BOOLEAN':
			values = string[1].split (',');
			break;
		case 'IEC958':
			values = string[1];
			break;
		default:
			console.log (`Unhandled values type: ${valuesType}`);
	}

	result['values'] = values;

	return result;
}


function itemLineParser (string) {
	let item;
	item = string.match (/^Item #\d '(.*?)'$/)[1]
	return item;
}
