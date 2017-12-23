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
	TEX2IMG = common.isWindows ? 'tex2imgc' : 'tex2img',
	Process = require('child_process'),
	preprocessors;

function makeMkdir(imageDir) {
	var madedir = false;
	return function() {
		var fstat;
		if(madedir) {
			return;
		}
		try {
			fstat = fs.statSync(imageDir);
		} catch(err) {
			if(err.code === 'ENOENT') {
				fs.mkdirSync(imageDir, 493);  // 0o755
			} else {
				throw err;
			}
		}
		if(fstat && !fstat.isDirectory()) {
			throw new Error(imageDir + " is not a directory");
		}
		madedir = true;
	}
}

function makeTex2img(imageDir, dataUri) {
	var num = 1,
		mkdir = makeMkdir(imageDir);
	return function(input, opt, base) {
		var foutput,
			pngfn,
			result;
		foutput = "\\documentclass{jsarticle}\n" +
			"\\usepackage{amsmath}\n" +
			"\\pagestyle{empty}\n" +
			"\\begin{document}\n";
		foutput += Shiki.parse(input, opt) + "\n";
		foutput += "\\end{document}\n";
		if(!dataUri) {
			mkdir();
		}
		pngfn = base + "." + ("000" + (num++)).slice(-4);
		fs.writeFileSync(pngfn + ".tex", foutput);
		if(dataUri) {
			Process.execFileSync(TEX2IMG, [pngfn + ".tex", pngfn + ".png"]);
			result = "data:image/png;base64," + fs.readFileSync(pngfn + ".png", "base64");
			fs.unlinkSync(pngfn + ".png");
		} else {
			Process.execFileSync(TEX2IMG, [pngfn + ".tex", imageDir + "/" + pngfn + ".png"]);
			result = imageDir + "/" + pngfn + ".png";
		}
		fs.unlinkSync(pngfn + ".tex");
		return result;
	}
}

function preprocessTex2img(beginPattern, endPattern, imgOutput, useDataUri) {
	return function(fileinput, opt, base) {
		var input,
			lines,
			line,
			output = "",
			i,
			state = "INIT",
			dataUri = useDataUri && opt.direction.dataUri;
			tex2img = makeTex2img(opt.direction.imageDir, dataUri),
			pngfn = {};
		lines = fileinput.split(/\r?\n/);
		for(i = 0; i < lines.length; i++) {
			line = lines[i];
			switch(state) {
			case "INIT":
				if(beginPattern.test(line)) {
					state = "LINE";
					input = "";
				} else {
					output += line + "\n";
				}
				break;
			case "LINE":
				if(endPattern.test(line)) {
					state = "INIT";
					pngfn.png = tex2img(input, opt.option, base);
					output += common.replaceTemplate(imgOutput, pngfn) + "\n";
				} else {
					input += line + "\n";
				}
				break;
			}
		}
		return output;
	}
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
				output += Shiki.parse(input, opt.option) + "\n";
			} else {
				input += line + "\n";
			}
			break;
		}
	}
	return output;
}

function preprocess(pptype, file, opt) {
	var i,
		match,
		input,
		output,
		pp = preprocessors[pptype];
	for(i = 0; i < pp.length; i++) {
		match = pp[i].pattern.exec(file);
		if(match) {
			try {
				input = fs.readFileSync(file, 'utf8');
				output = pp[i].action(input, opt, match[1]);
				fs.writeFileSync(match[1] + (match[2] ? match[2] : ""), output);
				return 0;
			} catch(err) {
				console.error('File %s can not read', file);
				throw err;
				return 2;
			}
		}
	}
	console.error('Unrecognized file %s', file);
	return 2;
}

module.exports.preprocess = preprocess;
preprocessors = {
	"tex2img": [
		{
			pattern: /^(.*)\.shiki(\.md)$/,
			action: preprocessTex2img(/^\`\`\`shiki$/, /^\`\`\`$/, '![tex](@png@)')
		},
		{
			pattern: /^(.*)\.shiki(\.html?)$/,
			action: preprocessTex2img(
						/^\s*<pre\s+class=["']?shiki['"]?\s*>$/,
						/^\s*<\/pre>/,
						'<img src="@png@">',
						true)
		}
	],
	"default": [
		{
			pattern: /^(.*)\.shiki(\.[^\.]+)?$/,
			action: preprocess_other
		}
	]
}
