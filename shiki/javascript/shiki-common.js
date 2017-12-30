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

function I(x) {
	return x;
}

function replaceTemplateFunction(template, setting, interprocess, postprocess) {
	function replaceStr(str, prop) {
		if(typeof setting[prop] === 'object') {
			return JSON.stringify(setting[prop], null, 2);
		} else {
			return interprocess(setting[prop]);
		}
	}
	return postprocess(template.replace(/@([^@\n]+)@/g, replaceStr));
}

function replaceTemplate(template, setting) {
	return replaceTemplateFunction(template, setting, I, I);
}

function replaceTemplateRegExp(template, setting, opt) {
	function escapeRE(x) {
		var result = x;
		result = result.replace(/\\/, "\\\\");
		result = result.replace(/\//, "\\/");
		return result;
	}
	function post(x) {
		return new RegExp(x, opt);
	}
	return replaceTemplateFunction(template, setting, escapeRE, post);
}

function replaceTemplateFile(filename, setting) {
	var template = fs.readFileSync(__dirname + "/" + filename, 'utf8');
	return replaceTemplate(template, setting);
}

module.exports.replaceTemplate = replaceTemplate;
module.exports.replaceTemplateRegExp = replaceTemplateRegExp;
module.exports.replaceTemplateFile = replaceTemplateFile;
module.exports.version = pjson.version;
module.exports.isWindows = process.platform === 'win32';
