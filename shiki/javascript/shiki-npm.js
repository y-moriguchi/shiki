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
	common = require('./shiki-common.js'),
	scaffold = require('./shiki-scaffold.js'),
	pp = require('./shiki-pp.js'),
	option = require('./shiki-option.js'),
	usage = {},
	optProp,
	defaultOptions;

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

optProp = {
	options: [
		{
			shortName: null,
			longName: "image-dir",
			property: "direction.imageDir",
			type: "string",
			defaultValue: "img"
		},
		{
			shortName: null,
			longName: "data-uri",
			property: "direction.dataUri",
			type: "void"
		},
		{
			longName: true,
			property: function(option, name, value) {
				option.option[name] = value;
			},
			type: "variant"
		}
	],
	commands: [
		{
			name: "scaffold",
			action: function(option, argv) {
				scaffold.scaffold(argv[0] ? argv[0] : "index.html");
			}
		},
		{
			name: "direct",
			action: function(option, argv) {
				direct(process.argv[0]);
			}
		},
		{
			name: "tex2img",
			action: function(option, argv) {
				process.exit(pp.preprocess("tex2img", argv[0], option));
			}
		}
	],
	"-": function(option, argv) {
		readstdin();
	},
	usage: function() {
		usage.version = common.version;
		console.error(common.replaceTemplateFile("usage.txt", usage));
	},
	defaultAction: function(option, argv) {
		process.exit(pp.preprocess("default", argv[0], option));
	}
};

defaultOptions = {
	option: {
		className: "shiki",
		scriptType: "text/x-shiki"
	}
};
option.parseOption(optProp, defaultOptions);
