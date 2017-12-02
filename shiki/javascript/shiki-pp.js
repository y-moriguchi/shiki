/*
 * Copyright 2017 Yuichiro Moriguchi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var fs = require('fs'),
	Shiki = require('./shiki.js'),
	Process = require('child_process'),
	num = 1,
	preprocessors;

function preprocess_md(fileinput, opt, base) {
	var input,
		lines,
		line,
		output = "",
		foutput,
		pngfn,
		i,
		state = "INIT";
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
				Process.execSync("tex2img " + pngfn + ".tex " + pngfn + ".png");
				fs.unlinkSync(pngfn + ".tex");
				output += "![tex](" + pngfn + ".png)\n";
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
