function parser (string, result) {
	let pairs = string.split (',');
	pairs.forEach ((pair) => {
		let kv = pair.split ('=');
		result[kv[0]] = kv[1];
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

module.exports.keyValueParser= function (string, object) {
	if (object) {
		parser (string, object);
	} else {
		object = {};
		parser (string, object);
		return object;
	}
};

module.exports.valuesLineParser = function (string, valuesType, object) {
	if (object) {
		valuesLineParser (string, valuesType, object);
	} else {
		object = {};
		valuesLineParser (string, valuesType, object);
		return object;
	}
};
