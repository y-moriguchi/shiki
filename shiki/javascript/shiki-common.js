/**
 * shikiml
 *
 * Copyright (c) 2017 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var fs = require('fs'),
	pjson = JSON.parse(fs.readFileSync(__dirname + "/package.json", 'utf8'));

function replaceTemplate(template, setting) {
	function replaceStr(str, prop) {
		if(typeof setting[prop] === 'object') {
			return JSON.stringify(setting[prop], null, 2);
		} else {
			return setting[prop];
		}
	}
	return template.replace(/@([^@\n]+)@/g, replaceStr);
}

function replaceTemplateFile(filename, setting) {
	var template = fs.readFileSync(__dirname + "/" + filename, 'utf8');
	return replaceTemplate(template, setting);
}

module.exports.replaceTemplate = replaceTemplate;
module.exports.replaceTemplateFile = replaceTemplateFile;
module.exports.version = pjson.version;
module.exports.isWindows = process.platform === 'win32';
