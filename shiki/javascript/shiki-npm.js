#!/usr/bin/env node
/**
 * shikiml
 *
 * Copyright (c) 2017 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var fs = require('fs'),
	Shiki = require('./shiki.js'),
	scaffold = require('./shiki-scaffold.js'),
	pp = require('./shiki-pp.js');

function parseShiki(input) {
	var output;
	try {
		output = Shiki.parse(input);
		console.log(output);
	} catch(err) {
		console.error('%s: parse error', file);
		process.exit(2);
	}
}

function readstdin() {
	var input = '',
		reader = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		});
	reader.on('line', function (line) {
		input += line;
		input += "\n";
	});
	reader.on('close', function () {
		parseShiki(input);
	});
}

function direct(file) {
	var input;
	if(!file) {
		console.error('No file is specified');
		process.exit(2);
	}
	try {
		input = fs.readFileSync(file, 'utf8');
	} catch(err) {
		console.error('File %s can not read', file);
		process.exit(2);
	}
	parseShiki(input);
}

file = process.argv[2]
if(!file) {
	console.error('No file is specified');
	process.exit(2);
} else if(file === 'scaffold') {
	scaffold.scaffold();
} else if(file === 'direct') {
	direct(process.argv[3]);
} else if(file === '-') {
	readstdin();
} else {
	process.exit(pp.preprocess(file, {}));
}
