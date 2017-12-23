/**
 * shikiml
 *
 * Copyright (c) 2017 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
function abort(message) {
	console.error(message);
	process.exit(2);
}

function setProperty(result, optionProp, optlong, name, val) {
	var nval = val,
		props,
		i;
	if(optionProp.type === "int") {
		nval = parseInt(nval);
		if(isNaN(nval)) {
			abort("integer required: " + optlong + name);
		}
	} else if(optionProp.type === "variant") {
		nval = parseInt(nval);
		nval = isNaN(nval) ? val : nval;
	}
	if(typeof optionProp.property === "function") {
		optionProp.property(result, name, val);
	} else {
		props = optionProp.property.split(".");
		for(i = 0; i < props.length - 1; i++) {
			result[props[i]] = result[props[i]] || {};
			result = result[props[i]];
		}
		result[props[i]] = val;
	}
}

function parseOption(property, optionResult) {
	var i,
		j,
		opt,
		match,
		val,
		action,
		result = optionResult || {},
		argv;
	if(process.argv.length <= 2) {
		property.usage();
		process.exit(2);
	}
	for(j = 0; j < property.options.length; j++) {
		if(property.options[j].defaultValue !== void(0)) {
			setProperty(result,
					property.options[j],
					"--",
					property.options[j].longName,
					property.options[j].defaultValue);
		}
	}
	outer: for(i = 2; i < process.argv.length; i++) {
		opt = process.argv[i];
		if(opt === "-") {
			action = property["-"];
			i++;
			break;
		} else if((match = /^--([^=]+)(=(.*))?$/.exec(opt)) !== null) {
			for(j = 0; j < property.options.length; j++) {
				if(property.options[j].longName === true ||
						match[1] === property.options[j].longName) {
					if(property.options[j].type === "void") {
						val = true;
					} else {
						if(match[3] || match[3] === "") {
							val = match[3];
						} else if(++i < process.argv.length) {
							val = process.argv[i];
						} else {
							abort("argument required: --" + match[1]);
						}
					}
					setProperty(result, property.options[j], "--", match[1], val);
					continue outer;
				}
			}
		} else if(/^-/.test(opt)) {
			for(j = 0; j < property.options.length; j++) {
				opt = opt.substring(1, opt.length);
				if(opt === property.options[j].shortName) {
					if(property.options[j].type === "void") {
						val = true;
					} else if(++i < process.argv.length) {
						val = process.argv[i];
					} else {
						abort("argument required: --" + match[1]);
					}
					setProperty(result, property.options[j], "-", opt, val);
					continue outer;
				}
			}
		} else if(!action) {
			for(j = 0; j < property.commands.length; j++) {
				if(opt === property.commands[j].name) {
					action = property.commands[j].action;
					continue outer;
				}
			}
		}
		action = action || property.defaultAction;
		break;
	}
	action(result, Array.prototype.slice.call(process.argv, i));
}

module.exports.parseOption = parseOption;
