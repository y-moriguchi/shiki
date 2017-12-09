/**
 * shikiml
 *
 * Copyright (c) 2017 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
var fs = require('fs'),
	readline = require("readline"),
	stream,
	reader,
	questions,
	setting,
	locale;

function endAction(setting) {
	var template = fs.readFileSync(__dirname + "/shiki-template.html", 'utf8'),
		replaced,
		tmp;
	function replaceStr(str, prop) {
		return setting[prop];
	}
	replaced = template.replace(/@([^@\n]+)@/g, replaceStr);
	fs.writeFileSync("index.html", replaced);
	tmp = fs.readFileSync(__dirname + "/shiki.js", 'utf8');
	fs.writeFileSync("shiki.js", tmp);
}

function giveQuestion(state) {
	var question = questions[state],
		text;
	text = question.question[locale];
	text = text ? text : question.question.en;
	if(question.def) {
		text += " [";
		text += question.def;
		text += "]";
	}
	text += ":";
	stream.question(text, function(answer) {
		var ans = answer ? answer : question.def,
			i,
			choice;
		for(i = 0; i < question.choice.length; i++) {
			choice = question.choice[i];
			if(choice.pattern === true || choice.pattern.test(ans)) {
				if(choice.action) {
					choice.action(ans, setting);
				}
				if(choice.to) {
					giveQuestion(choice.to);
				} else {
					endAction(setting);
					stream.close();
				}
				return;
			}
		}
	});
}

function scaffold(opt) {
	setting = opt ? opt : {};
	if(Intl) {
		locale = Intl.NumberFormat().resolvedOptions().locale.substring(0, 2);
	} else {
		locale = "";
	}
	stream = readline.createInterface({
		input: process.stdin,
 		output: process.stdout
	});
	giveQuestion("init");
}

questions = {
	"init": {
		question: {
			"ja": "cdnjs.cloudflare.comが提供しているMathJaxを使用しますか?",
			"en": "Do you use MathJax which cdnjs.cloudflare.com provides?"
		},
		def: "y",
		choice: [
			{
				pattern: /^y(es?)?$/i,
				to: "version"
			},
			{
				pattern: true,
				to: "url"
			}
		]
	},
	"version": {
		question: {
			"ja": "MathJaxのバージョンを入力してください",
			"en": "Please enter version of MathJax"
		},
		def: "2.7.1",
		choice: [
			{
				pattern: true,
				action: function(input, setting) {
					setting.url = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/" +
						input +
						"/MathJax.js?config=TeX-MML-AM_CHTML";
				},
				to: false
			}
		]
	},
	"url": {
		question: {
			"ja": "MathJaxのURLを入力してください",
			"en": "Please enter the URL of MathJax"
		},
		def: "",
		choice: [
			{
				pattern: true,
				action: function(input, setting) {
					setting.url = input;
				},
				to: false
			}
		]
	}
};

module.exports.scaffold = scaffold;