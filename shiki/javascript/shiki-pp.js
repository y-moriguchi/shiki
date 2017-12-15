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
	Process = require('child_process'),
	num = 1,
	preprocessors,
	IMGDIR = "img";

function preprocess_md(fileinput, opt, base) {
	var input,
		lines,
		line,
		output = "",
		foutput,
		pngfn,
		i,
		state = "INIT",
		fstat = null;
	try {
		fstat = fs.statSync(IMGDIR);
	} catch(err) {
		if(err.code === 'ENOENT') {
			fs.mkdirSync(IMGDIR, 493);  // 0o755
		} else {
			throw err;
		}
	}
	if(fstat && !fstat.isDirectory()) {
		throw new Error(IMGDIR + " is not a directory");
	}
	lines = fileinput.split(/\n/);
	for(i = 0; i < lines.length; i++) {
		line = lines[i];
		switch(state) {
		case "INIT":
			if(line === "```shiki") {
				state = "LINE";
				input = "";
			} else {
				output += line + "\n";
			}
			break;
		case "LINE":
			if(line === "```") {
				state = "INIT";
				foutput = "\\documentclass{jsarticle}\n" +
					"\\usepackage{amsmath}\n" +
					"\\pagestyle{empty}\n" +
					"\\begin{document}\n";
				foutput += Shiki.parse(input, opt) + "\n";
				foutput += "\\end{document}\n";
				pngfn = base + "." + ("000" + num).slice(-4);
				fs.writeFileSync(pngfn + ".tex", foutput);
				Process.execFileSync("tex2img", [pngfn + ".tex", "img/" + pngfn + ".png"]);
				fs.unlinkSync(pngfn + ".tex");
				output += "![tex](img/" + pngfn + ".png)\n";
				num++;
			} else {
				input += line + "\n";
			}
			break;
		}
	}
	return output;
}

function preprocess_other(fileinput, opt, base) {
	var input,
		lines,
		line,
		output = "",
		i,
		state = "INIT";
	lines = fileinput.split(/\n/);
	for(i = 0; i < lines.length; i++) {
		line = lines[i];
		switch(state) {
		case "INIT":
			if(line === "<shiki>") {
				state = "LINE";
				input = "";
			} else {
				output += line + "\n";
			}
			break;
		case "LINE":
			if(line === "</shiki>") {
				state = "INIT";
				output += Shiki.parse(input, opt) + "\n";
			} else {
				input += line + "\n";
			}
			break;
		}
	}
	return output;
}

function preprocess(file, opt) {
	var i,
		match,
		input,
		output;
	for(i = 0; i < preprocessors.length; i++) {
		match = preprocessors[i].pattern.exec(file);
		if(match) {
			try {
				input = fs.readFileSync(file, 'utf8');
				output = preprocessors[i].action(input, opt, match[1]);
				fs.writeFileSync(match[1] + (match[2] ? match[2] : ""), output);
				return 0;
			} catch(err) {
				console.error('File %s can not read', file);
				return 2;
			}
		}
	}
	console.error('Unrecognized file %s', file);
	return 2;
}

module.exports.preprocess = preprocess;
preprocessors = [
	{
		pattern: /^(.*)\.shiki(\.md)$/,
		action: preprocess_md
	},
	{
		pattern: /^(.*)\.shiki(\.[^\.]+)?$/,
		action: preprocess_other
	}
]
