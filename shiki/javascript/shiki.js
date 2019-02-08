/**
 * shikiml
 *
 * Copyright (c) 2017 Yuichiro MORIGUCHI
 *
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 **/
(function(S) {
	var gl = Function("return this")();
	var defaultOptions = {
		greekBytes: 2,
		mathBytes: 2,
		debuglog: function() {},
		iteration: 100000,
		className: "shiki",
		scriptType: "text/x-shiki",
		useAtAsRoundD: true,
		useQuantumBracket: true,
		useVerticalBarAsDifference: true,
		useUnicodeSigmaAsSum: true,
		useUnicodePiAsProduct: false,
		usePlanckConstant: true
	};
	function extend(base, extension) {
		var i, res = {};
		for(i in base) {
			if(base.hasOwnProperty(i)) {
				res[i] = base[i];
			}
		}
		for(i in extension) {
			if(extension.hasOwnProperty(i)) {
				res[i] = extension[i];
			}
		}
		return res;
	}
	function shiki(input, option) {
		var me,
			OUTSIDEX,
			OUTSIDEY,
			OUTSIDEXY,
			twoBytesStr = '',
			TWOBYTES,
			opt,
			printableREStr,
			printableRE,
			decorateBold,
			BITMASK = 1048576;
		opt = extend(defaultOptions, option);
		if(opt.greekBytes === 2) {
			twoBytesStr += '\u0391-\u03A9\u03b1-\u03c1\u03c3-\u03c9';
		}
		if(opt.mathBytes === 2) {
			twoBytesStr += '\u00ac\u00b1\u00d7\u00f7' +
				'\u2020\u2021\u2026' +
				'\u2200\u2202\u2203\u2205\u2207-\u2209\u220b\u2212\u2213\u221d-\u2220\u2225-\u222c\u222e' +
				'\u2234\u2235\u223d\u2243\u2245\u2248\u2252\u2260-\u2262\u2266\u2267\u226a\u226b\u2276\u2277' +
				'\u2282-\u2287\u228a\u228b\u2295-\u2297\u22a5\u22bf\u22da\u22db\u2605\u2606' +
				'\u29bf\uff01-\uff60\uffe0-\uffe6';
		}
		decorateBold = function(x) { return new BoldMathJax(x) };

		twoBytesStr += '\u2e80-\u2eff\u3000-\u30ff\u3300-\u4dbf\u4e00-\u9fff\uac00-\ud7af\uf900-\ufaff\ufe30-\ufe4f';
		TWOBYTES = new RegExp('[' + twoBytesStr + ']');
		printableREStr = '\x21-\x7e\xa1-\xac\xae-\u0377\u037a-\u037e\u0384-\u038a\u038c\u038e-\u03a1\u03a3-\u0527' +
			'\u0531-\u0556\u0559-\u055f\u0561-\u0587\u0589-\u058a\u0591-\u05c7\u05d0-\u05ea\u05f0-\u05f4\u0606-\u061b' +
			'\u061e-\u06dc\u06de-\u070d\u0710-\u074a\u074d-\u07b1\u07c0-\u07fa\u0800-\u082d\u0830-\u083e\u0840-\u085b' +
			'\u085e\u0900-\u0977\u0979-\u097f\u0981-\u0983\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2' +
			'\u09b6-\u09b9\u09bc-\u09c4\u09c7-\u09c8\u09cb-\u09ce\u09d7\u09dc-\u09dd\u09df-\u09e3\u09e6-\u09fb\u0a01-\u0a03' +
			'\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a3c\u0a3e-\u0a42' +
			'\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91' +
			'\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3' +
			'\u0ae6-\u0aef\u0af1\u0b01-\u0b03\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39' +
			'\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b5c-\u0b5d\u0b5f-\u0b63\u0b66-\u0b77\u0b82-\u0b83' +
			'\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9' +
			'\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bfa\u0c01-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10' +
			'\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c58-\u0c59' +
			'\u0c60-\u0c63\u0c66-\u0c6f\u0c78-\u0c7f\u0c82-\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3' +
			'\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1-\u0cf2' +
			'\u0d02-\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63' +
			'\u0d66-\u0d75\u0d79-\u0d7f\u0d82-\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca' +
			'\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2-\u0df4\u0e01-\u0e3a\u0e3f-\u0e5b\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a' +
			'\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4' +
			'\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edd\u0f00-\u0f47\u0f49-\u0f6c\u0f71-\u0f97\u0f99-\u0fbc\u0fbe-\u0fcc' +
			'\u0fce-\u0fda\u1000-\u10c5\u10d0-\u10fc\u1100-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288' +
			'\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315' +
			'\u1318-\u135a\u135d-\u137c\u1380-\u1399\u13a0-\u13f4\u1400-\u167f\u1681-\u169c\u16a0-\u16f0\u1700-\u170c' +
			'\u170e-\u1714\u1720-\u1736\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772-\u1773\u1780-\u17b3\u17b6-\u17dd' +
			'\u17e0-\u17e9\u17f0-\u17f9\u1800-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191c' +
			'\u1920-\u192b\u1930-\u193b\u1940\u1944-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19da\u19de-\u1a1b' +
			'\u1a1e-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa0-\u1aad\u1b00-\u1b4b\u1b50-\u1b7c\u1b80-\u1baa' +
			'\u1bae-\u1bb9\u1bc0-\u1bf3\u1bfc-\u1c37\u1c3b-\u1c49\u1c4d-\u1c7f\u1cd0-\u1cf2\u1d00-\u1de6\u1dfc-\u1f15' +
			'\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fc4' +
			'\u1fc6-\u1fd3\u1fd6-\u1fdb\u1fdd-\u1fef\u1ff2-\u1ff4\u1ff6-\u1ffe\u2010-\u2027\u2030-\u205e\u2070-\u2071' +
			'\u2074-\u208e\u2090-\u209c\u20a0-\u20b9\u20d0-\u20f0\u2100-\u2189\u2190-\u23f3\u2400-\u2426\u2440-\u244a' +
			'\u2460-\u26ff\u2701-\u27ca\u27cc\u27ce-\u2b4c\u2b50-\u2b59\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2cf1\u2cf9-\u2d25' +
			'\u2d30-\u2d65\u2d6f-\u2d70\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6' +
			'\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2e31\u2e80-\u2e99\u2e9b-\u2ef3\u2f00-\u2fd5\u2ff0-\u2ffb' +
			'\u3001-\u303f\u3041-\u3096\u3099-\u30ff\u3105-\u312d\u3131-\u318e\u3190-\u31ba\u31c0-\u31e3\u31f0-\u321e' +
			'\u3220-\u32fe\u3300-\u4db5\u4dc0-\u9fcb\ua000-\ua48c\ua490-\ua4c6\ua4d0-\ua62b\ua640-\ua673\ua67c-\ua697' +
			'\ua6a0-\ua6f7\ua700-\ua78e\ua790-\ua791\ua7a0-\ua7a9\ua7fa-\ua82b\ua830-\ua839\ua840-\ua877\ua880-\ua8c4' +
			'\ua8ce-\ua8d9\ua8e0-\ua8fb\ua900-\ua953\ua95f-\ua97c\ua980-\ua9cd\ua9cf-\ua9d9\ua9de-\ua9df\uaa00-\uaa36' +
			'\uaa40-\uaa4d\uaa50-\uaa59\uaa5c-\uaa7b\uaa80-\uaac2\uaadb-\uaadf\uab01-\uab06\uab09-\uab0e\uab11-\uab16' +
			'\uab20-\uab26\uab28-\uab2e\uabc0-\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa2d' +
			'\ufa30-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44' +
			'\ufb46-\ufbc1\ufbd3-\ufd3f\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfd\ufe00-\ufe19\ufe20-\ufe26\ufe30-\ufe52' +
			'\ufe54-\ufe66\ufe68-\ufe6b\ufe70-\ufe74\ufe76-\ufefc\uff01-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7' +
			'\uffda-\uffdc\uffe0-\uffe6\uffe8-\uffee\ufffc-\ufffd';
		printableRE = new RegExp('[\n' + printableREStr + ']');

		var mathChars = {
			'\'': '^\\prime',
			'"':  '^{\\prime\\prime}',
			'Α': '\\Alpha',
			'α': '\\alpha',
			'Β': '\\Beta',
			'β': '\\beta',
			'Γ': '\\Gamma',
			'γ': '\\gamma',
			'Δ': '\\Delta',
			'δ': '\\delta',
			'Ε': '\\Epsilon',
			'ε': '\\epsilon',
			'Ζ': '\\Zeta',
			'ζ': '\\zeta',
			'Η': '\\Eta',
			'η': '\\eta',
			'Θ': '\\Theta',
			'θ': '\\theta',
			'Ι': '\\Iota',
			'ι': '\\iota',
			'Κ': '\\Kappa',
			'κ': '\\kappa',
			'Λ': '\\Lambda',
			'λ': '\\lambda',
			'Μ': '\\Mu',
			'μ': '\\mu',
			'Ν': '\\Nu',
			'ν': '\\nu',
			'Ξ': '\\Xi',
			'ξ': '\\xi',
			'Ο': 'O',
			'ο': 'o',
			'Π': '\\Pi',
			'π': '\\pi',
			'Ρ': '\\Rho',
			'ρ': '\\rho',
			'Σ': '\\Sigma',
			'σ': '\\sigma',
			'Τ': '\\Tau',
			'τ': '\\tau',
			'Υ': '\\Upsilon',
			'υ': '\\upsilon',
			'Φ': '\\Phi',
			'φ': '\\phi',
			'Χ': '\\Chi',
			'χ': '\\chi',
			'Ψ': '\\Psi',
			'ψ': '\\psi',
			'Ω': '\\Omega',
			'ω': '\\omega',
			'°': '^\\circ',
			'△': '\\triangle',
			'□': '\\Box',
			'†': '\\dagger',
			'‡': '\\ddagger',
			'★': '\\star',
			'☆': '\\star',
			'…': '\\cdots',
			'＊': '*',
			'＋': '+',
			'－': '-',
			'．': '.',
			'＜': '<',
			'＝': '=',
			'＞': '>',
			'＠': '@',
			'～': '\\sim',
			'\u301c': '\\sim',
			'\u00ac': '\\lnot',
			'\u00b1': '\\pm',
			'\u00d7': '\\times',
			'\u00f7': '\\div',
			'\u2200': '\\forall',
			'\u2202': '\\partial',
			'\u2203': '\\exists',
			'\u2205': '\\emptyset',
			'\u2207': '\\nabla',
			'\u2208': '\\in',
			'\u2209': '\\notin',
			'\u220b': '\\ni',
			'\u2212': '-',
			'\u2213': '\\mp',
			'\u221d': '\\propto',
			'\u221e': '\\infty',
			//'\u221f': '\\rightangle',
			'\u2220': '\\angle',
			'\u2225': '\\parallel',
			'\u2226': '\\nparallel',
			'\u2227': '\\land',
			'\u2228': '\\lor',
			'\u2229': '\\cap',
			'\u222a': '\\cup',
			'\u2234': '\\therefore',
			'\u2235': '\\because',
			//'\u223d': '\\varpropto',
			'\u2243': '\\simeq',
			'\u2245': '\\cong',
			'\u2248': '\\approx',
			'\u2252': '\\simeq',
			'\u2260': '\\neq',
			'\u2261': '\\equiv',
			'\u2262': '\\not\\equiv',
			'\u2266': '\\leq',
			'\u2267': '\\geq',
			'\u226a': '\\ll',
			'\u226b': '\\gg',
			'\u2276': '\\lessgtr',
			'\u2277': '\\gtrless',
			'\u2282': '\\subset',
			'\u2283': '\\supset',
			'\u2284': '\\not\\subset',
			'\u2285': '\\not\\supset',
			'\u2286': '\\subseteq',
			'\u2287': '\\supseteq',
			'\u228a': '\\subsetneq',
			'\u228b': '\\supsetneq',
			'\u2295': '\\oplus',
			'\u2296': '\\ominus',
			'\u2297': '\\otimes',
			'\u22a5': '\\perp',
			'\u22bf': '\\triangle',
			'\u22c5': '\\cdot',
			'\u22da': '\\lesseqgtr',
			'\u22db': '\\gtreqless',
			'\u29bf': '\\odot',
			'\u30fb': '\\cdot'
		};
		var mathSequence = {
			' *': '\\times',
			' .': '\\cdot',
			'+-': '\\pm',
			'-+': '\\mp',
			'!=': '\\neq',
			'=/=': '\\neq',
			'_|_': '\\perp',
			'<-': '\\leftarrow',
			'<=': '\\Leftarrow',
			'<--': '\\longleftarrow',
			'<==': '\\Longleftarrow',
			'->': '\\to',
			'=>': '\\Rightarrow',
			'-->': '\\longrightarrow',
			'==>': '\\Longrightarrow',
			'<->': '\\leftrightarrow',
			'<=>': '\\Leftrightarrow',
			'<-->': '\\longleftrightarrow',
			'<==>': '\\Longleftrightarrow',
			'|=': '\\models',
			'|->': '\\mapsto',
			'<': '\\lt',
			'>': '\\gt',
			'=<': '\\leq',
			'>=': '\\geq',
			'>>': '\\ll',
			'>>>': '\\lll',
			'<<': '\\gg',
			'<<<': '\\ggg',
			' |-': '\\vdash',
			' -|': '\\dashv',
			'~': '\\sim',
			'~<': '\\lesssim',
			'>~': '\\gtrsim',
			'||': '\\parallel',
			'oo': '\\infty',
			'...': '\\cdots',
			'sin': '\\sin',
			'cos': '\\cos',
			'tan': '\\tan',
			'csc': '\\csc',
			'cosec': '\\csc',
			'sec': '\\sec',
			'cot': '\\cot',
			'arcsin': '\\arcsin',
			'arccos': '\\arccos',
			'arctan': '\\arctan',
			'asin': '\\arcsin',
			'acos': '\\arccos',
			'atan': '\\arctan',
			'sinh': '\\sinh',
			'cosh': '\\cosh',
			'tanh': '\\tanh',
			'coth': '\\coth',
			'exp': '\\exp',
			'log': '\\log',
			'ln': '\\ln',
			'max': '\\max',
			'min': '\\min',
			'lim': '\\lim',
			'Pr': '\\Pr',
			'grad': '\\mathrm{grad}\\,',
			'rot': '\\mathrm{rot}\\,',
			'div': '\\mathrm{div}\\,',
			'Tr': '\\mathrm{Tr}\\,',
			'det': '\\mathrm{det}\\,',
			'sinc': '\\mathrm{sinc}\\,',
			'if': '\\mathrm{if}\\ ',
			'iff': '\\mathrm{iff}\\ ',
			'otherwise': '\\mathrm{otherwise}\\ '
		};

		me = {};
		function cell(ch) {
			var me, processed = false, st;
			me = {};
			st = String.fromCharCode(ch);
			me.getChar = function() {
				return st;
			};
			me.getCharCode = function() {
				return ch;
			};
			me.isProcessed = function() {
				return processed;
			};
			me.markProcessed = function() {
				processed = true;
			};
			me.isMarkStart = function() {
				return me.markReturn.length > 0;
			};
			me.markTemp = false;
			me.markFraction = false;
			me.markBinomialBorder = false;
			me.markRoot = false;
			me.markRootNum = false;
			me.markRootEnd = 0;
			me.markRootEndProcessed = 0;
			me.markRootWall = false;
			me.markRootBase = false;
			me.markRootProcessed = false;
			me.markRootStartV = false;
			me.markRootWallInner = false;
			me.markRootNumRet = false;
			me.markPow = false;
			me.markPowProcessed = false;
			me.markPowRight = false;
			me.markSubPowProcessed = false;
			me.markSub = false;
			me.markSubRet = false;
			me.markSumStart = false;
			me.markSumSign = false;
			me.markSumBase = false;
			me.markSumRight = false;
			me.markIgnoreSubPow = false;
			me.markIntTempStart = false;
			me.markSumMathSign = '';
			me.markReturn = [];
			me.markNumberOfRootV = [];
			me.markMatrixRange = 0;
			me.markMatrixStart = false;
			me.markMatrixRowSeparator = false;
			me.markMatrixRowLine = false;
			me.markMatrixColLine = false;
			me.markMatrixProcessed = false;
			me.markMatrixRowLineBase = false;
			me.markMatrixInit = false;
			me.markAccent = false;
			me.markCasesRange = false;
			me.markCasesStart = false;
			me.markCasesRowSeparator = false;
			me.markCmbTemp = false;
			me.markCmbFound = false;
			me.markCmbBoundary = false;
			me.markMinusTemp = false;
			me.markParenTemp = false;
			me.markMiddleBar = false;
			me.isOutsideX = function() {
				return ch === -1 || ch === -3;
			};
			me.isOutsideY = function() {
				return ch === -2 || ch === -3;
			};
			me.isPrintable = function() {
				if(ch < 0) {
					return false;
				}
				return printableRE.test(me.getChar());
			};
			me.isWhitespace = function() {
				return /[ \t\n]/.test(me.getChar());
			};
			me.isOperator = function() {
				return /[+\-\*\/=]/.test(me.getChar());
			};
			me.isVector = function() {
				return /[>]/.test(me.getChar()) && !processed;
			};
			me.isTraversed = function() {
				return processed || me.markRootWall || me.markSumSign;
			};
			me.isBoundY = function() {
				return (me.isOutsideY() ||
						me.markMatrixRowSeparator ||
						me.markCasesRowSeparator ||
						me.isTraversed() ||
						me.markTemp ||
						me.markSumBase);
			};
			me.isRootEnd = function() {
				return me.markRootEnd || me.markRootWall;
			};
			me.isMatrixEnd = function() {
				return (me.markReturn[0] === 'INIT' ||
						me.markReturn[me.markReturn.length - 1] === 'FRAC1' ||
						me.markReturn[me.markReturn.length - 1] === 'FRAC2' ||
						me.markReturn[me.markReturn.length - 1] === 'ROOTBASE' ||
						me.markReturn[me.markReturn.length - 1] === 'POW' ||
						me.markReturn[me.markReturn.length - 1] === 'POW_AFTER_SUB' ||
						me.markReturn[me.markReturn.length - 1] === 'SUB');
			};
			return me;
		}
		OUTSIDEX = cell(-1);
		OUTSIDEY = cell(-2);
		OUTSIDEXY = cell(-3);
		function isTwoBytes(ch) {
			return TWOBYTES.test(ch);
		}
		function quadroLength(str) {
			var xLen = 0, j;
			for(j = 0; j < str.length; j++) {
				xLen += isTwoBytes(str.charAt(j)) ? 2 : 1;
			}
			return xLen;
		}
		function quadro() {
			var me,
				quadro = [],
				ilist,
				xMax = 0,
				xLen,
				i,
				j,
				k,
				yPos = 0,
				xPos = 0,
				upfunctions,
				builder = '',
				builderUpper = [],
				builderSub = '',
				models = [],
				isbar = false,
				beforech = [],
				texcharFn = false,
				istex = false,
				isquote = false,
				boldmath = false,
				boldskip = false,
				boldFn,
				quantumBracket = false;
			upfunctions = {
				'_': function(x) {
					if(x === 'h' && opt.usePlanckConstant) {
						return "\\hbar";
					} else {
						return "\\bar{" + x + "}";
					}
				},
				'~': function(x) { return "\\tilde{" + x + "}"; },
				'.': function(x) { return "\\dot{" + x + "}"; },
				'^': function(x) { return "\\hat{" + x + "}"; },
				'v': function(x) { return "\\check{" + x + "}"; },
				"'": function(x) { return "\\acute{" + x + "}"; },
				'`': function(x) { return "\\grave{" + x + "}"; },
				'=': function(x) { return "\\bar{\\bar{" + x + "}}"; },
				'-': function(x) { return "\\vec{" + x + "}"; }
			};
			boldFn = {
				'|': function(x) { return new MathDecorate(x, "\\mathbb"); },
				'/': function(x) { return new MathDecorate(x, "\\mathcal"); },
				'*': function(x) { return new MathDecorate(x, "\\mathfrak"); }
			};
			function getUpfunction() {
				var up, res;
				up = getPosRel(0, -1);
				if(!up.isTraversed() && !!(res = upfunctions[up.getChar()])) {
					return res;
				} else {
					return false;
				}
			}
			function getPos(x, y) {
				if(y < 0 || y >= ilist.length) {
					return x < 0 || x >= xMax ? OUTSIDEXY : OUTSIDEY;
				} else if(x < 0 || x >= xMax) {
					return OUTSIDEX;
				} else {
					return quadro[y][x];
				}
			}
			function getPosRel(x, y) {
				return getPos(xPos + x, yPos + y);
			}
			function getPosRelChar(x, y) {
				var cell;
				cell = getPosRel(x, y);
				if(cell === OUTSIDEX || cell === OUTSIDEY) {
					return ' ';
				} else {
					return cell.getChar();
				}
			}
			function isSumAscii(yoffset) {
				return (getPosRelChar(0,  0 + yoffset) === ' ' &&
						getPosRelChar(1,  0 + yoffset) === '>' &&
						getPosRelChar(0, -1 + yoffset) === '-' &&
						getPosRelChar(1, -1 + yoffset) === '-' &&
						getPosRelChar(2, -1 + yoffset) === '-' &&
						getPosRelChar(0,  1 + yoffset) === '-' &&
						getPosRelChar(1,  1 + yoffset) === '-' &&
						getPosRelChar(2,  1 + yoffset) === '-' &&
						!getPosRel(1,  0 + yoffset).markSumSign &&
						!getPosRel(0, -1 + yoffset).markSumSign &&
						!getPosRel(1, -1 + yoffset).markSumSign &&
						!getPosRel(2, -1 + yoffset).markSumSign &&
						!getPosRel(0,  1 + yoffset).markSumSign &&
						!getPosRel(1,  1 + yoffset).markSumSign);
			}
			function isSumAsciiShort(yoffset) {
				var up = getPosRelChar(0, -1 + yoffset),
					cn = getPosRelChar(0,  0 + yoffset),
					dn = getPosRelChar(0,  1 + yoffset);
				return (/[\-_]/.test(up) &&
						cn === '>' &&
						/[\-]/.test(dn) &&
						!getPosRel(0,  0 + yoffset).markSumSign &&
						!getPosRel(0, -1 + yoffset).markSumSign &&
						!getPosRel(0, -1 + yoffset).markSumSign);
			}
			function isIntAscii(yoffset, center) {
				return (getPosRelChar(0,  0 + yoffset) === ' ' &&
						getPosRelChar(1,  0 + yoffset) === center &&
						getPosRelChar(1, -1 + yoffset) === '/' &&
						getPosRelChar(2, -1 + yoffset) === '\\' &&
						getPosRelChar(0,  1 + yoffset) === '\\' &&
						getPosRelChar(1,  1 + yoffset) === '/' &&
						!getPosRel(1,  0 + yoffset).markSumSign &&
						!getPosRel(1, -1 + yoffset).markSumSign &&
						!getPosRel(2, -1 + yoffset).markSumSign &&
						!getPosRel(0,  1 + yoffset).markSumSign &&
						!getPosRel(1,  1 + yoffset).markSumSign);
			}
			function isProdAscii(yoffset) {
				return (getPosRelChar(0,  0 + yoffset) === ' ' &&
						getPosRelChar(1,  0 + yoffset) === '|' &&
						getPosRelChar(2,  0 + yoffset) === ' ' &&
						getPosRelChar(3,  0 + yoffset) === '|' &&
						getPosRelChar(0, -1 + yoffset) === '_' &&
						getPosRelChar(1, -1 + yoffset) === '_' &&
						getPosRelChar(2, -1 + yoffset) === '_' &&
						getPosRelChar(3, -1 + yoffset) === '_' &&
						getPosRelChar(4, -1 + yoffset) === '_' &&
						getPosRelChar(0,  1 + yoffset) === ' ' &&
						getPosRelChar(1,  1 + yoffset) === '|' &&
						getPosRelChar(2,  1 + yoffset) === ' ' &&
						!getPosRel(3,  1 + yoffset).markSumSign &&
						!getPosRel(1,  0 + yoffset).markSumSign &&
						!getPosRel(3,  0 + yoffset).markSumSign &&
						!getPosRel(0, -1 + yoffset).markSumSign &&
						!getPosRel(1, -1 + yoffset).markSumSign &&
						!getPosRel(2, -1 + yoffset).markSumSign &&
						!getPosRel(3, -1 + yoffset).markSumSign &&
						!getPosRel(4, -1 + yoffset).markSumSign &&
						!getPosRel(1,  1 + yoffset).markSumSign &&
						!getPosRel(3,  1 + yoffset).markSumSign);
			}
			function isProdAsciiShort(yoffset) {
				return (getPosRelChar(0, 0) === 'T' &&
						getPosRelChar(1, 0) === 'T' &&
						!getPosRel(0, 0).markSumSign &&
						!getPosRel(1, 0).markSumSign);
			}
			function isSumMulti() {
				return (opt.useUnicodeSigmaAsSum &&
						getPosRelChar(0, 0) === '\n' &&
						(getPosRelChar(1, 0) === 'Σ' || getPosRelChar(1, 0) === '\u2211') &&
						!getPosRel(1, 0).markSumSign);
			}
			function isIntMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u222B' &&
						!getPosRel(1, 0).markSumSign);
			}
			function isDintMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u222C' &&
						!getPosRel(1, 0).markSumSign);
			}
			function isOintMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u222E' &&
						!getPosRel(1, 0).markSumSign);
			}
			function isProdMulti() {
				return (opt.useUnicodePiAsProduct &&
						getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === 'Π' &&
						!getPosRel(1, 0).markSumSign);
			}
			function isCupMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u222a' &&
						!getPosRel(1, 0).markSumSign &&
						getPosRel(2, 0).isWhitespace());
			}
			function isCapMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u2229' &&
						!getPosRel(1, 0).markSumSign &&
						getPosRel(2, 0).isWhitespace());
			}
			function isLorMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u2228' &&
						!getPosRel(1, 0).markSumSign &&
						getPosRel(2, 0).isWhitespace());
			}
			function isLandMulti() {
				return (getPosRelChar(0, 0) === '\n' &&
						getPosRelChar(1, 0) === '\u2227' &&
						!getPosRel(1, 0).markSumSign &&
						getPosRel(2, 0).isWhitespace());
			}
			function isVdots() {
				return (getPosRelChar(0, 0) === '.' &&
						getPosRelChar(0, 1) === '.' &&
						getPosRelChar(0, 2) === '.');
			}
			function isDdots() {
				return (getPosRelChar(0, 0) === '.' &&
						getPosRelChar(0, 1) === ' ' &&
						getPosRelChar(0, 2) === ' ' &&
						getPosRelChar(1, 0) === ' ' &&
						getPosRelChar(1, 1) === '.' &&
						getPosRelChar(1, 2) === ' ' &&
						getPosRelChar(2, 0) === ' ' &&
						getPosRelChar(2, 1) === ' ' &&
						getPosRelChar(2, 2) === '.');
			}
			function isPerp() {
				return (getPosRelChar(-1, 0) === '_' &&
						getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === '_');
						
			}
			function isModels() {
				return (getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === '=');
			}
			function isVdash() {
				return (getPosRelChar(-1, 0) === ' ' &&
						getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === '-' &&
						getPosRelChar( 2, 0) === ' ');
			}
			function isDashv() {
				return (getPosRelChar(-2, 0) === ' ' &&
						getPosRelChar(-1, 0) === '-' &&
						getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === ' ');
			}
			function isParallel1() {
				return (getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === '|');
			}
			function isParallel2() {
				return (getPosRelChar(-1, 0) === '|' &&
						getPosRelChar( 0, 0) === '|');
			}
			function isMapsto() {
				return (getPosRelChar( 0, 0) === '|' &&
						getPosRelChar( 1, 0) === '-' &&
						getPosRelChar( 2, 0) === '>');
			}
			function isOperatorWithBar() {
				return (isPerp() ||
						isModels() ||
						isVdash() ||
						isDashv() ||
						isParallel1() ||
						isParallel2() ||
						isMapsto());
			}
			function builderToChar(len) {
				var j, l, up;
				l = len === void(0) ? builder.length : len;
				for(j = 0; j < l; j++) {
					up = builderUpper[j];
					up = up ? up : function(x) { return x; };
					me.addModel(new Printable(up(builder.charAt(j))));
				}
			}
			function matchMathSequence(func) {
				var i, a, maxi = '', maxa;
				for(i in mathSequence) {
					if((a = builder.indexOf(i)) >= 0) {
						if(maxi.length < i.length) {
							maxi = i;
							maxa = a;
						}
					}
				}
				if(maxi) {
					builderToChar(maxa);
					builder = builder.substring(maxi.length + maxa, builder.length);
					me.addModel(new Printable(mathSequence[maxi] + ' '));
					if(func) {
						func();
					}
					return true;
				} else {
					return false;
				}
			}
			function hasSuperSubScript(direction) {
				var y = yPos + direction, cell;
				for(; !(cell = getPos(xPos, y)).isBoundY(); y += direction) {
					if(cell.isPrintable() && !me.isCellBar()) {
						return true;
					}
				}
				return false;
			}
			function hasSuperSubBound(direction) {
				var y = yPos + direction, cell;
				for(;; y += direction) {
					cell = getPos(xPos, y);
					if(cell.isPrintable() && cell.markTemp) {
						return true;
					} else if(cell.isBoundY() || !cell.isWhitespace()) {
						return false;
					}
				}
			}
			function isMatrixByScanning(direction) {
				var i,
					cell,
					ch,
					barcount;
				if(!((me.get().getChar() === '\\' && direction < 0) ||
						(me.get().getChar() === '/' && direction > 0) ||
						me.get().getChar() === '-' ||
						me.get().getChar() === '|')) {
					return false;
				}
				barcount = me.get().getChar() === '|' ? 1 : -1;
				for(i = direction;; i += direction) {
					cell = getPosRel(0, i);
					ch = cell.getChar();
					if((ch === '/' && direction < 0) ||
							(ch === '\\' && direction > 0) ||
							ch === '-') {
						return true;
					} else if(ch !== '|') {
						return barcount > 1;
					} else if(barcount > 0) {
						barcount++;
					}
				}
			}
			function moveMatrix(direction) {
				function moveHead(direction) {
					if(direction < 0) {
						me.moveUp();
					} else {
						me.moveDown();
					}
				}
				moveHead(direction);
			}
			function isMarkRootEndOrProcessedBelow(threshold, prop) {
				var i,
					cell,
					th = threshold ? threshold : 0;
				for(i = 0;; i++) {
					cell = getPosRel(0, i);
					if(cell.isOutsideY()) {
						return false;
					} else if(cell[prop]) {
						return cell[prop] > th;
					}
				}
			};
			me = {};
			ilist = input.split(/\n/);
			for(i = 0; i < ilist.length; i++) {
				xLen = quadroLength(ilist[i]);
				xMax = xMax < xLen ? xLen : xMax;
			}
			xMax++;
			for(i = 0; i < ilist.length; i++) {
				quadro[i] = [];
				for(j = 0, k = 0; j < xMax; j++) {
					if(j >= ilist[i].length) {
						quadro[i][k++] = cell(32);
					} else if(isTwoBytes(ilist[i].charAt(j))) {
						quadro[i][k] = cell(10);
						quadro[i][k + 1] = cell(ilist[i].charCodeAt(j));
						k += 2;
					} else {
						quadro[i][k++] = cell(ilist[i].charCodeAt(j));
					}
				}
			}
			me.get = function() {
				return getPos(xPos, yPos);
			};
			me.getCellRel = function(x, y) {
				return getPosRel(x, y);
			};
			me.getCellUp = function() {
				return getPos(xPos, yPos - 1);
			};
			me.getCellDown = function() {
				return getPos(xPos, yPos + 1);
			};
			me.getCellLeft = function() {
				return getPos(xPos - 1, yPos);
			};
			me.getCellRight = function() {
				return getPos(xPos + 1, yPos);
			};
			me.getCellUpChar = function() {
				var cl = me.getCellUp();
				return (cl.getCharCode() < 0 || cl.isProcessed()) ? ' ' : cl.getChar();
			};
			me.getCellSubChar = function() {
				var cl = me.getCellDown();
				return (cl.getCharCode() < 0 || cl.isProcessed()) ? ' ' : cl.getChar();
			};
			me.hasSuperScript = function() { return hasSuperSubScript(-1); };
			me.hasSuperBound = function() { return hasSuperSubBound(-1); };
			me.hasSubScript = function() { return hasSuperSubScript(1); };
			me.hasSubBound = function() { return hasSuperSubBound(1); };
			me.isCellBar = function() {
				var ccl, dcl;
				ccl = me.get();
				dcl = me.getCellDown();
				return /[_\->]/.test(ccl.getChar()) && !ccl.isProcessed() && dcl.isPrintable();
			};
			me.moveLeft = function() {
				xPos--;
				return me;
			};
			me.moveRight = function() {
				xPos++;
				return me;
			};
			me.moveUp = function() {
				yPos--;
				return me;
			};
			me.moveDown = function() {
				yPos++;
				return me;
			};
			me.moveUpIfNotMulti = function() {
				yPos -= /[T\n]/.test(me.get().getChar()) ? 0 : 1;
				return me;
			};
			me.moveDownIfNotMulti = function() {
				yPos += /[T\n]/.test(me.get().getChar()) ? 0 : 1;
				return me;
			};
			me.clearStringBuilder = function() {
				builder = '';
				builderUpper = [];
				builderSub = '';
				return me;
			};
			me.appendBuilder = function() {
				var i,
					v1,
					v2,
					grp,
					a,
					uf,
					ch = me.get().getChar();
				function partialIndexOf(str) {
					var i,
						pstr;
					for(i = 1; i < str.length; i++) {
						if(builder.indexOf(str) < 0) {
							pstr = str.substring(0, i);
							if(builder.indexOf(pstr) >= 0) {
								return true;
							}
						}
					}
					return false;
				}
				function markAccent() {
					var up, i;
					up = getPosRel(0, -1);
					if(!up.isTraversed() && up.getChar() === '-') {
						for(i = 0;;i++) {
							up = getPosRel(i, -1);
							if(up.getChar() === '-') {
								up.markProcessed();
								up.markAccent = true;
							} else if(up.getChar() === '>') {
								up.markProcessed();
								up.markAccent = true;
								break;
							} else {
								break;
							}
						}
					} else if(getUpfunction()) {
						getPosRel(0, -1).markProcessed();
						getPosRel(0, -1).markAccent = true;
					}
				}
				function putPrintable(str) {
					var uf;
					builderToChar();
					uf = getUpfunction();
					uf = uf ? uf : function(x) { return x; };
					me.addModel(new Printable(uf(str)));
					markAccent();
					return me.clearStringBuilder();
				}
				function decorateMath(math, decorator) {
					var i, array;
					if(math instanceof ConcatFormula) {
						array = math.toArray();
						for(i = 0; i < array.length; i++) {
							me.addModel(decorator(array[i]));
						}
					} else {
						me.addModel(decorator(math));
					}
				}
				function searchSuperOrSub(posx, step) {
					var i,
						qcell;
					for(i = step;; i += step) {
						qcell = me.getCellRel(posx, i);
						if(qcell.isBoundY()) {
							return false;
						} else if(qcell.isPrintable()) {
							return true;
						}
					}
				}
				function searchQuantumBracket() {
					var i,
						stq = "init",
						qch;
					for(i = 1;; i++) {
						qch = me.getCellRel(i, 0).getChar();
						if(qch === ' ' && (searchSuperOrSub(i, -1) || searchSuperOrSub(i, 1))) {
							continue;
						}
						switch(stq) {
						case "init":
							if(qch !== '\n' && !printableRE.test(qch)) {
								return false;
							} else if(qch === '|') {
								stq = "bar";
							}
							break;
						case "bar":
							if(qch !== '\n' && !printableRE.test(qch)) {
								return "bra";
							} else if(qch === '>' ||
									(qch === '\n' && me.getCellRel(i + 1, 0).getChar() === '\uff1e')) {
								return "ket";
							}
							break;
						}
					}
				}
				function searchQuantumKet() {
					var i,
						qch;
					for(i = 1;; i++) {
						qch = me.getCellRel(i, 0).getChar();
						if(qch === ' ' && (searchSuperOrSub(i, -1) || searchSuperOrSub(i, 1))) {
							continue;
						}
						if(qch !== '\n' && !printableRE.test(qch)) {
							return false;
						} else if(qch === '>' ||
								(qch === '\n' && me.getCellRel(i + 1, 0).getChar() === '\uff1e')) {
							return "ket";
						}
					}
				}
				if(ch === '\n') {
					while(matchMathSequence()) {}
					builderToChar();
					markAccent();
					return me.clearStringBuilder();
				} else if(boldskip) {
					boldskip = false;
					return me;
				} else if(texcharFn) {
					if(/[ \*]/.test(ch)) {
						me.addModel(new Printable(texcharFn('\\' + builder)));
						texcharFn = false;
						me.clearStringBuilder();
					} else {
						builder += ch;
						return me;
					}
				}
				me.operator = /[ \t\n]/.test(ch) ? me.operator : /[+\-\*\/=]/.test(ch);
				if(istex) {
					if(ch === '$') {
						me.addModel(new Printable(builder.replace(/\$.*$/, "")));
						istex = false;
						return me.clearStringBuilder();
					} else {
						builder += ch;
						return me;
					}
				} else if(!quantumBracket && /[{\(\[]/.test(ch)) {
					beforech.push([ch === '{' ? '\\{' : ch]);
					if(!matchMathSequence()) {
						builderToChar();
					}
					me.newModel();
					return me.clearStringBuilder();
				} else if(!quantumBracket && /[}\)\]]/.test(ch)) {
					builderToChar();
					v1 = me.popModel();
					grp = beforech.pop();
					grp.push(ch === '}' ? '\\}' : ch);
					if(grp.length < 3) {
						me.addModel(new GroupFormula(v1, grp));
					} else {
						v2 = me.popModel();
						me.addModel(new GroupFormula(v2, v1, grp));
					}
					return me.clearStringBuilder();
				} else if(ch === '|' && !isOperatorWithBar()) {
					if(quantumBracket === "bra") {
						quantumBracket = false;
					} else if(opt.useQuantumBracket && searchQuantumKet()) {
						quantumBracket = "ket";
					} else if(me.get().markMiddleBar) {
						me.get().markMiddleBar = false;
						builderToChar();
						me.addModel(new Printable('\\mid'));
						return me.clearStringBuilder();
					} else {
						builderToChar();
						if(isbar) {
							isbar = false;
							v1 = me.popModel();
							me.addModel(new GroupFormula(v1, ['|', '|']));
						} else {
							isbar = true;
							me.newModel();
						}
						return me.clearStringBuilder();
					}
				} else if(ch === '$') {
					builderToChar();
					istex = true;
					return me.clearStringBuilder();
				} else if(opt.useAtAsRoundD && ch === '@') {
					return putPrintable('\\partial ');
				} else if(/[ ]/.test(ch)) {
					if(matchMathSequence(markAccent)) {
						return me.clearStringBuilder();
					}
				} else if(ch === '\\') {
					builderToChar();
					texcharFn = getUpfunction();
					texcharFn = texcharFn ? texcharFn : function(x) { return x; };
					markAccent();
					return me.clearStringBuilder();
				} else if(ch === '*') {
					if(boldmath) {
						builderToChar();
						v1 = me.popModel();
						decorateMath(v1, boldmath);
						boldmath = false;
						return me.clearStringBuilder();
					} else if(/[\|\/\*]/.test(me.getCellRight().getChar()) &&
							 !/[ ]/.test(me.getCellRel(2, 0).getChar())) {
						builderToChar();
						me.newModel();
						boldmath = boldFn[me.getCellRight().getChar()];
						boldskip = true;
						return me.clearStringBuilder();
					} else if(!/[ ]/.test(me.getCellRight().getChar())) {
						builderToChar();
						me.newModel();
						boldmath = decorateBold;
						return me.clearStringBuilder();
					}
				} else if(ch === '`') {
					isquote = !isquote;
					if(isquote) {
						builderToChar();
						me.clearStringBuilder();
						builder += ' ';
						return me;
					} else {
						me.addModel(new Printable('\\text{' + builder + '}'));
						return me.clearStringBuilder();
					}
				} else if(opt.useQuantumBracket &&
						/[<\uff1c]/.test(ch) &&
						searchQuantumBracket()) {
					builderToChar();
					quantumBracket = searchQuantumBracket();
					me.addModel(new Printable('\\langle'));
					return me.clearStringBuilder();
				} else if(quantumBracket === "ket" && /[>\uff1e]/.test(ch)) {
					builderToChar();
					quantumBracket = false;
					me.addModel(new Printable('\\rangle'));
					return me.clearStringBuilder();
				}
				for(i in mathChars) {
					if(i === ch) {
						return putPrintable(mathChars[i]);
					}
				}
				builder += ch;
				builderUpper.push(getUpfunction());
				markAccent();
				for(i in mathSequence) {
					if(partialIndexOf(i)) {
						return me;
					}
				}
				if(matchMathSequence()) {
					return me.clearStringBuilder();
				}
				builderToChar();
				return me.clearStringBuilder();
			};
			me.flushBuilder = function() {
				if(texcharFn) {
					me.addModel(new Printable(texcharFn('\\' + builder)));
					texcharFn = false;
				} else {
					while(matchMathSequence()) {}
					builderToChar();
				}
				return me.clearStringBuilder();
			};
			me.newModel = function() {
				models.push(new Printable(""));
				return me;
			};
			me.pushModel = function(model) {
				models.push(model);
				return me;
			};
			me.addModel = function(model) {
				if(models.length > 0) {
					models.push(new ConcatFormula(models.pop(), model));
				} else {
					models.push(model);
				}
				return me;
			};
			me.popModel = function() {
				return models.pop();
			};
			me.isModelNotScan = function() {
				var v1;
				v1 = models[models.length - 1];
				if(v1 instanceof ConcatFormula) {
					return ((v1.latter() instanceof Root) ||
							(v1.latter() instanceof Fraction) ||
							(v1.latter() instanceof Pow));
				} else {
					return ((v1 instanceof Root) ||
							(v1 instanceof Fraction) ||
							(v1 instanceof Pow));
				}
			};
			me.dumpModel = function() {
				var i;
				for(i = 0; i < models.length; i++) {
					opt.debuglog(models[i].toLaTeX());
				}
				opt.debuglog(builder);
			};
			me.isSumAscii = function(yoffset) {
				return isSumAscii(yoffset === void(0) ? 0 : yoffset);
			};
			me.isSumAsciiShort = function(yoffset) {
				return isSumAsciiShort(yoffset === void(0) ? 0 : yoffset);
			};
			me.isIntAscii = function(yoffset) {
				return isIntAscii(yoffset === void(0) ? 0 : yoffset, '|');
			};
			me.isOintAscii = function(yoffset) {
				return isIntAscii(yoffset === void(0) ? 0 : yoffset, 'O');
			};
			me.isProdAscii = function(yoffset) {
				return isProdAscii(yoffset === void(0) ? 0 : yoffset);
			};
			me.isProdAsciiShort = function(yoffset) {
				return isProdAsciiShort(yoffset === void(0) ? 0 : yoffset);
			};
			me.isSumMulti = function() { return isSumMulti(); };
			me.isIntMulti = function() { return isIntMulti(); };
			me.isDintMulti = function() { return isDintMulti(); };
			me.isOintMulti = function() { return isOintMulti(); };
			me.isProdMulti = function() { return isProdMulti(); };
			me.isCupMulti = function() { return isCupMulti(); };
			me.isCapMulti = function() { return isCapMulti(); };
			me.isLorMulti = function() { return isLorMulti(); };
			me.isLandMulti = function() { return isLandMulti(); };
			me.isVdots = function() { return isVdots(); };
			me.isDdots = function() { return isDdots(); };
			me.isSumInt = function(yoffset) {
				return (me.isSumAscii(yoffset) ||
						me.isSumAsciiShort(yoffset) ||
						me.isIntAscii(yoffset) ||
						me.isOintAscii(yoffset) ||
						me.isProdAscii(yoffset) ||
						me.isProdAsciiShort(yoffset) ||
						me.isSumMulti(yoffset) ||
						me.isIntMulti(yoffset) ||
						me.isDintMulti(yoffset) ||
						me.isOintMulti(yoffset) ||
						me.isProdMulti(yoffset) ||
						me.isCupMulti(yoffset) ||
						me.isCapMulti(yoffset) ||
						me.isLorMulti(yoffset) ||
						me.isLandMulti(yoffset));
			};
			me.isAccent = function(offset) {
				var cell,
					down,
					off = offset || 0;
				cell = getPosRel(0, 0 + off);
				down = getPosRel(0, 1 + off);
				return (upfunctions[cell.getChar()] &&
						down.isPrintable() &&
						!down.isTraversed());
			};
			me.isMarkRootEndBelow = function(threshold) {
				return isMarkRootEndOrProcessedBelow(threshold, 'markRootEnd');
			};
			me.isMarkRootEndProcessedBelow = function(threshold) {
				return isMarkRootEndOrProcessedBelow(threshold, 'markRootEndProcessed');
			};
			me.clearMarkRootEndBelow = function() {
				var i,
					cell;
				for(i = 0;; i++) {
					cell = getPosRel(0, i);
					if(cell.isOutsideY()) {
						return;
					} else if(cell.markRootEnd) {
						cell.markRootEnd--;
						cell.markRootEndProcessed++;
						return;
					}
				}
			};
			me.moveReturnStackHere = function(wallDistance, direction) {
				var wall = wallDistance ? wallDistance : 0,
					drc = direction ? direction : 1,
					i,
					cell,
					mto;
				mto = getPosRel(-wall, 0);
				for(i = 0;; i += drc) {
					cell = getPosRel(-i - wall, i);
					if(cell.markReturn.length > 0) {
						if(i !== 0) {
							mto.markReturn.unshift.apply(mto.markReturn, cell.markReturn);
							mto.markNumberOfRootV.unshift.apply(
									mto.markNumberOfRootV, cell.markNumberOfRootV);
							mto.markRootBase = cell.markRootBase;
							cell.markReturn = [];
							cell.markNumberOfRootV = [];
							cell.markRootBase = false;
						}
						return;
					} else if(cell.markRoot) {
						return;
					} else if(cell.isOutsideX() || cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					}
				}
			};
			me.moveReturnStack = function() {
				var wall,
					i,
					cell;
				for(wall = 0;; wall++) {
					cell = getPosRel(-wall, 0);
					if(cell.markRoot) {
						return;
					} else if(cell.markRootWall && !cell.markRootWallInner) {
						break;
					} else if(cell.isOutsideX()) {
						throw new Error('Parse failed: maybe illegal input');
					}
				}
				me.moveReturnStackHere(wall);
			};
			me.markRootSubPowProcessedLeft = function() {
				var i,
					cell = me.get();
				cell.markRootProcessed = true;
				for(i = 1;; i++) {
					cell = getPosRel(-i, 0);
					if(cell.markRoot || cell.markRootWall) {
						cell.markSubPowProcessed = true;
						cell.markRootProcessed = true;
						cell.markProcessed();
						return;
					} else if(cell.isWhitespace()) {
						cell.markSubPowProcessed = true;
						cell.markRootProcessed = true;
						cell.markProcessed();
					} else {
						return;
					}
				}
			};
			me.isPrintableRight = function() {
				var i,
					cell;
				for(i = 1;; i++) {
					cell = getPosRel(i, 0);
					if(cell.isOutsideX()) {
						return false;
					} else if(cell.isPrintable()) {
						return true;
					}
				}
			};
			me.isMarkStartRoot = function() {
				var i,
					cell;
				for(i = 1;; i++) {
					cell = getPosRel(-i, i);
					if(!/[\/v]/.test(cell.getChar())) {
						return false;
					} else if(cell.isMarkStart()) {
						return true;
					}
				}
			};
			me.isAboveSlashRootWall = function() {
				var i,
					cell,
					posok,
					ret = true;
				posok = me.get().getChar() === ' ' ||
						(me.get().getChar() === 'v' && /[_\/]/.test(getPosRel(1, -1).getChar()));
				for(i = 0;; i++) {
					cell = getPosRel(0, -i);
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if((cell.markRoot || cell.markRootWall) && !cell.markRootWallInner) {
						return ((/[_]/.test(cell.getChar()) && ret) ||
								(/[\/]/.test(cell.getChar()) && posok));
					} else if(!cell.markRootWallInner && !cell.isWhitespace()) {
						if(!posok) {
							return false;
						} else {
							ret = i === 0;
						}
					}
				}
			};
			me.isRootNotation = function() {
				var i,
					cell,
					ch;
				if(me.get().getChar() === 'v') {
					for(i = 1;; i++) {
						cell = getPosRel(i, -i);
						ch = cell.getChar();
						if(ch === '_') {
							return true;
						} else if(ch !== '/') {
							return false;
						}
					}
				}
			};
			me.markProcessedRootUpperWall = function() {
				var wall,
					i,
					cell,
					ch;
				me.get().markRootWall = me.get().markRootWallInner = true;
				for(wall = 1;; wall++) {
					cell = getPosRel(wall, -wall);
					ch = cell.getChar();
					if(ch === '_') {
						break;
					} else if(ch !== '/') {
						throw new Error('Parse failed: maybe illegal input');
					} else {
						cell.markRootWall = cell.markRootWallInner = true;
					}
				}
				for(i = 0;; i++) {
					cell = getPosRel(wall + i, -wall);
					ch = cell.getChar();
					if(ch === '_') {
						cell.markProcessed();
						cell.markRootWall = cell.markRootWallInner = true;
					} else {
						return;
					}
				}
			};
			me.moveRootProcessedRight = function() {
				while(me.get().markRootProcessed) {
					me.moveRight();
				}
			};
			me.moveToRootV = function() {
				var cell,
					ret;
				for(ret = false;; ret = true) {
					cell = me.get();
					if((cell.markRootWall || cell.markRoot) && cell.getChar() === 'v') {
						return ret;
					} else if(cell.markRootWall || cell.markRoot) {
						me.moveLeft().moveDown();
					} else {
						throw new Error('Parse failed: maybe illegal input');
					}
				}
			};
			me.moveRootToBase = function() {
				var cell,
					mrt;
				me.moveToRootV();
				mrt = me.get().markRoot;
				if(mrt === 'MOVE') {
					me.moveReturnStackHere(0, -1);
					for(;;) {
						cell = me.get();
						if(cell.markRoot === 'BASE') {
							return;
						} else if(cell.markRootWall || cell.markRoot) {
							me.moveRight().moveUp();
						} else {
							throw new Error('Parse failed: maybe illegal input');
						}
					}
				}
			};
			me.scanRootBase = function(rootbase) {
				var cell,
					i;
				for(i = 0;; i++) {
					cell = getPosRel(-i, i);
					if(!(cell.markRoot || cell.markRootWall)) {
						return false;
					} else if(cell.getChar() === 'v') {
						break;
					}
				}
				for(;; i--) {
					cell = getPosRel(-i, i);
					if(cell.markRootBase === rootbase) {
						return i > 0 ? 3 : i < 0 ? 1 : 2;
					} else if(!(cell.markRoot || cell.markRootWall)) {
						return false;
					}
				}
			};
			me.markRootEndAbove = function() {
				var cell,
					cellright,
					i;
				for(i = 1;; i++) {
					cell = getPosRel(0, -i);
					cellright = getPosRel(1, -i);
					if(cell.markRootWall && cell.getChar() === '_') {
						if(cellright.isWhitespace() || cellright.isOutsideX()) {
							me.get().markRootEnd++;
						}
						if(!cell.markRootWallInner) {
							return;
						}
					} else if((cell.markRoot || cell.markRootWall) &&
							!cell.markRootWallInner &&
							cell.getChar()) {
						return;
					} else if(cell.isBoundY()) {
						return;
					}
				}
			};
			me.isMatrixByScanningUp = function() {
				return isMatrixByScanning(-1);
			};
			me.isMatrixByScanningDown = function() {
				return isMatrixByScanning(1);
			};
			me.moveMatrixUp = function() {
				moveMatrix(-1);
			};
			me.moveMatrixDown = function() {
				moveMatrix(1);
			};
			me.setMatrixMoveInit = function() {
				me.matrixMoveInit = [me.get().markReturn, me.get().markNumberOfRootV];
				me.get().markReturn = [];
				me.get().markNumberOfRootV = [];
			};
			me.putMatrixMoveInit = function() {
				me.get().markReturn.unshift.apply(me.get().markReturn, me.matrixMoveInit[0]);
				me.get().markNumberOfRootV.unshift.apply(
						me.get().markNumberOfRootV, me.matrixMoveInit[1]);
			};
			me.isBinomial = function() {
				var i,
					cell,
					ch;
				if(me.get().getChar() !== '(') {
					return false;
				}
				for(i = 1;; i++) {
					cell = getPosRel(i, 0);
					ch = cell.getChar();
					if(ch === ')') {
						return i > 1;
					} else if(ch !== ' ') {
						return false;
					}
				}
			};
			me.drawBinomialBorder = function() {
				var i,
					cell,
					ch;
				me.get().markBinomialBorder = true;
				for(i = 1;; i++) {
					cell = getPosRel(i, 0);
					ch = cell.getChar();
					if(ch === ')') {
						cell.markBinomialBorder = true;
						return;
					} else if(ch !== ' ') {
						throw new Error('Parse failed: maybe illegal input');
					}
					cell.markBinomialBorder = true;
				}
			};
			me.operator = false;
			me.storeMathSign = [];
			me.matrixType = '';
			me.matrixElements = false;
			me.matrixRowCount = false;
			me.matrixColCount = false;
			me.matrixMoveInit = false;
			me.casesElements = false;
			me.casesCases = false;
			me.fracRootLabel = false;
			me.fracRootGoto = false;
			me.fracRootAction = false;
			me.parenStack = false;
			me.barCount = false;
			me.countRootWalls = false;
			me.fractionOrBinomial = false;
			me.lengthRootV = 0;
			me.markTempMatrix = false;
			return me;
		}
		function parseEngine(quadro, trans) {
			var _trans = trans;
			return function() {
				var state = _trans.getState("INIT"), obj, count = 0;
				quadro.newModel();
				while((obj = trans.transit(state, quadro)) != null) {
					if(typeof obj === 'number') {
						state = obj;
					}
					if(state === _trans.getState("ACCEPT")) {
						return true;
					} else if(state === _trans.getState("ERROR")) {
						return false;
					}

					if(opt.debug) {
						opt.debuglog(trans.getStateName(state % BITMASK) + ":" + quadro.get().getChar());
					}

					if(count++ > opt.iteration) {
						throw new Error('Infinite Loop: maybe illegal input:' + trans.getStateName(state));
					}
				}
				return true;
			};
		}
		function transState() {
			var me, valToName, stateNo = 100000;
			me = {
				INIT: 1,
				ACCEPT: 0,
				ERROR: -1
			};
			valToName = {
				1: "INIT",
				0: "ACCEPT",
				'-1': "ERROR"
			};
			me.addState = function(name) {
				me[name] = stateNo;
				valToName[stateNo] = name;
				stateNo++;
			};
			me.getName = function(val) {
				return valToName[val];
			}
			return me;
		};
		var TRANSINIT = (function() {
			var me, st = transState(), nxt;
			me = {};
			st.addState("THISINIT");
			st.addState("INITSCANDOWN");
			st.addState("INITCURSORUP");
			st.addState("INITCURSORR");
			st.addState("INIT_CHECKARRAY");
			st.addState("INIT_CHECKARRAY_2");
			st.addState("INIT_CHECKARRAY_3");
			st.addState("CHECK_FRAC_ROOT_BELOW");
			st.addState("CHECK_FRAC_ROOT_BELOW_1");
			st.addState("CHECK_FRAC_ROOT_BELOW_2");
			st.addState("CHECK_FRAC_ABOVE");
			st.addState("CHECK_FRAC_ABOVE_1");
			st.addState("CHECK_FRAC_ABOVE_2");
			st.addState("CHECK_FRAC_ABOVE_3");
			st.addState("CHECK_FRAC_ABOVE_4");
			st.addState("FINIT");
			st.addState("FPRINTABLE");
			st.addState("FPRINTABLE_SPC");
			st.addState("FPRINTABLE_SPC_CMB");
			st.addState("FPRINTABLE_SPC_CMB_SCAN_NOSUB");
			st.addState("FPRINTABLE_SPC_CMB_NOSUB_RET_T");
			st.addState("FPRINTABLE_SPC_CMB_NOSUB_RET_F");
			st.addState("FPRINTABLE_SPC_CMB_SCAN_NOPOW");
			st.addState("FPRINTABLE_SPC_CMB_NOPOW_RET_T");
			st.addState("FPRINTABLE_SPC_CMB_NOPOW_RET_F");
			st.addState("FPRINTABLE_SPC_CMB_SCAN");
			st.addState("FPRINTABLE_SPC_CMB_FOUND");
			st.addState("FPRINTABLE_SPC_CMB_FOUND_2");
			st.addState("FPRINTABLE_SPC_CMB_FOUND_3");
			st.addState("FPRINTABLE_SPC_CMB_FOUND_4");
			st.addState("FPRINTABLE_SPC_CMB_FOUND_5");
			st.addState("FPRINTABLE_SPC_CMB_FOUND_6");
			st.addState("FPRINTABLE_SPC_CMB_RET_DOWN");
			st.addState("FPRINTABLE_SPC_2");
			st.addState("FPRINTABLE_SPC_ROOT");
			st.addState("FPRINTABLE_SPC_ROOT_2");
			st.addState("FPRINTABLE_SPC_ROOT_3");
			st.addState("FPRINTABLE_MINUS");
			st.addState("FPRINTABLE_MINUS_2");
			st.addState("FPRINTABLE_MINUS_3_T");
			st.addState("FPRINTABLE_MINUS_3_F");
			st.addState("FPRINTABLE_V");
			st.addState("FPRINTABLE_V_SLASH");
			st.addState("FPRINTABLE_V_SLASH2");
			st.addState("FPRINTABLE_V_SLASH3");
			st.addState("FPRINTABLE_V_SLASH4");
			st.addState("FPRINTABLE_V_COUNT");
			st.addState("FPRINTABLE_V_COUNT_2");
			st.addState("FPRINTABLE_V_NUM");
			st.addState("FPRINTABLE_V_NUMRET");
			st.addState("FPRINTABLE_V_NUMRET_2");
			st.addState("FPRINTABLE_V_NUMRET_3");
			st.addState("FPRINTABLE_V_NUM2");
			st.addState("FPRINTABLE_V_NUM_PRINTABLE");
			st.addState("FPRINTABLE_V_NUM_PRINTABLE2");
			st.addState("FPRINTABLE_SUM_ASCII");
			st.addState("FPRINTABLE_SUM_ASCII_SHORT");
			st.addState("FPRINTABLE_INT_ASCII");
			st.addState("FPRINTABLE_INT_ASCII_2");
			st.addState("FPRINTABLE_INT_ASCII_3");
			st.addState("FPRINTABLE_INT_ASCII_4");
			st.addState("FPRINTABLE_OINT_ASCII");
			st.addState("FPRINTABLE_PROD_ASCII");
			st.addState("FPRINTABLE_PROD_ASCII_SHORT");
			st.addState("FPRINTABLE_SUM_MULTI");
			st.addState("FPRINTABLE_INT_MULTI");
			st.addState("FPRINTABLE_INT_MULTI_2");
			st.addState("FPRINTABLE_INT_MULTI_3");
			st.addState("FPRINTABLE_INT_MULTI_4");
			st.addState("FPRINTABLE_DINT_MULTI");
			st.addState("FPRINTABLE_OINT_MULTI");
			st.addState("FPRINTABLE_PROD_MULTI");
			st.addState("FPRINTABLE_CUP_MULTI");
			st.addState("FPRINTABLE_CAP_MULTI");
			st.addState("FPRINTABLE_LOR_MULTI");
			st.addState("FPRINTABLE_LAND_MULTI");
			st.addState("FPRINTABLE_SUM_INT");
			st.addState("FPRINTABLE_SUM_BASELINE");
			st.addState("FPRINTABLE_SUM_BASELINE_2");
			st.addState("FPRINTABLE_SUM_SCANUP");
			st.addState("FPRINTABLE_SUM_SCANUP_2");
			st.addState("FPRINTABLE_SUM_SCANUP_3");
			st.addState("FPRINTABLE_SUM_NOUP");
			st.addState("FPRINTABLE_BAR");
			st.addState("FPRINTABLE_LT");
			st.addState("FPRINTABLE_PAREN");
			st.addState("FPRINTABLE_PAREN_2");
			st.addState("FPRINTABLE_PAREN_3");
			st.addState("FPRINTABLE_PAREN_4");
			st.addState("FPRINTABLE_RET");
			st.addState("FPRINTABLE_RET_2");
			st.addState("FPRINTABLE_RET_3");
			st.addState("FPRINTABLE_DRAWTEMP");
			st.addState("FPRINTABLE_DRAWTEMP2");
			st.addState("FPRINTABLE_RET_LEFT");
			st.addState("FSUB_SCAN");
			st.addState("FSUB_RET_DOWN");
			st.addState("FPOW_SCAN");
			st.addState("FPOW_RET_DOWN");
			st.addState("FPOW_RET_DELTEMP");
			st.addState("FPOW_RET_DELTEMP2");
			st.addState("FPOW_RET_DELTEMP3");
			st.addState("FPOW_RET_DELTEMP4");
			st.addState("FPOW_RET_DELTEMP5");
			st.addState("FRAC_INIT");
			st.addState("FRAC_DRAWLINE");
			st.addState("FRAC_DRAWLINE_2");
			st.addState("FRAC_BAR_BACK");
			st.addState("FRAC_SCAN");
			st.addState("FRAC_SCAN_BACK");
			st.addState("FRAC_SCAN_BACK2");
			st.addState("DENO_SCAN");
			st.addState("DENO_SCAN_BACK");
			st.addState("DENO_SCAN_BACK2");
			st.addState("ROOT_INIT");
			st.addState("ROOT_CEIL1");
			st.addState("ROOT_CEIL2");
			st.addState("ROOT_CEIL3");
			st.addState("ROOT_CEIL4");
			st.addState("ROOT_CEIL5");
			st.addState("ROOT_CEIL6_INIT");
			st.addState("ROOT_CEIL6_F");
			st.addState("ROOT_CEIL7");
			st.addState("ROOT_CEIL8");
			st.addState("ROOT_SCAN");
			st.addState("ROOT_SCAN2");
			st.addState("ROOT_SCAN3");
			st.addState("MATRIX");
			st.addState("MATRIX_RANGE");
			st.addState("MATRIX_RANGE_2");
			st.addState("MATRIX_RANGE_3");
			st.addState("MATRIX_RANGE_4");
			st.addState("MATRIX_RANGE_5");
			st.addState("MATRIX_SEPARATE_ROW");
			st.addState("MATRIX_SEPARATE_ROW_2");
			st.addState("MATRIX_SEPARATE_ROW_3");
			st.addState("MATRIX_SEPARATE_ROW_4");
			st.addState("MATRIX_SEPARATE_ROW_DRAW");
			st.addState("MATRIX_MOVE_LEFT_UP");
			st.addState("MATRIX_SCAN_FIRSTCOL");
			st.addState("MATRIX_SCAN_FIRSTCOL_BACK");
			st.addState("MATRIX_SCAN_FIRSTCOL_BACK_2");
			st.addState("MATRIX_SCAN");
			st.addState("MATRIX_SCAN_BACK");
			st.addState("MATRIX_SCAN_BACK_2");
			st.addState("MATRIX_RESCAN");
			st.addState("MATRIX_RESCAN_2");
			st.addState("MATRIX_RESCAN_3");
			st.addState("MATRIX_RESCAN_4");
			st.addState("MATRIX_RESCAN_5");
			st.addState("MATRIX_END");
			st.addState("MATRIX_END_2");
			st.addState("MATRIX_END_3");
			st.addState("MATRIX_END_4");
			st.addState("MATRIX_END_INIT");
			st.addState("MATRIX_END_INIT_2");
			st.addState("MATRIX_END_INIT_3");
			st.addState("MATRIX_END_INIT_4");
			st.addState("MATRIX_END_INIT_5");
			st.addState("MATRIX_END_INITBASE");
			st.addState("MATRIX_END_INITBASE_2");
			st.addState("MATRIX_END_INITBASE_3");
			st.addState("MATRIX_END_INITBASE_FOUND_UP");
			st.addState("MATRIX_END_INITBASE_FOUND_DOWN");
			st.addState("MATRIX_END_INITBASE_FOUND");
			st.addState("CASES");
			st.addState("CASES_RANGE");
			st.addState("CASES_RANGE_DOWN");
			st.addState("CASES_RANGE_DOWN_2");
			st.addState("CASES_RANGE_2");
			st.addState("CASES_RANGE_UP");
			st.addState("CASES_RANGE_UP_2");
			st.addState("CASES_SEPARATE_ROW");
			st.addState("CASES_SEPARATE_ROW_2");
			st.addState("CASES_SEPARATE_ROW_3");
			st.addState("CASES_SEPARATE_ROW_DRAW");
			st.addState("CASES_MOVE_LEFT_UP");
			st.addState("CASES_SCAN_FIRSTCOL");
			st.addState("CASES_SCAN_FIRSTCOL_BACK");
			st.addState("CASES_SCAN_FIRSTCOL_BACK_2");
			st.addState("CASES_SCAN_CASES");
			st.addState("CASES_SCAN_CASES_BACK");
			st.addState("CASES_SCAN_CASES_BACK_2");
			st.addState("FRET");
			st.addState("FRET_SUB_FPOW");
			st.addState("FRET_SUB_FPOW_2");
			st.addState("FRET_SUB_FPOW_3");
			st.addState("FRET_SUB_FPOW_4");
			st.addState("FRET_SUB_FPOW_5");
			st.addState("FRET_SUB_FPOW_6");
			st.addState("FRET_SUB_FPOW_7");
			st.addState("FRET_SUB_FPOW_8");
			st.addState("FRET_SUB_FPOW_SCAN");
			st.addState("FRET_SUB_FPOW_RET_DOWN");
			st.addState("FRET_SUB_RIGHT");
			st.addState("FRET_SUB_UP");
			st.addState("FRET_POW_AFTER_SUB_RIGHT");
			st.addState("FRET_POW_AFTER_SUB_DOWN");
			st.addState("FRET_SUB_DRAWPROC1");
			st.addState("FRET_SUB_DRAWPROC2");
			st.addState("FRET_SUB_DRAWPROC3");
			st.addState("FRET_SUB_DRAWPROC4");
			st.addState("FRET_POW_RIGHT");
			st.addState("FRET_POW_DOWN");
			st.addState("FRET_POW_DRAWPROC1");
			st.addState("FRET_POW_DRAWPROC2");
			st.addState("FRET_POW_DRAWPROC3");
			st.addState("FRET_POW_DRAWPROC4");
			st.addState("FRET_FRAC1_1");
			st.addState("FRET_FRAC1_2");
			st.addState("FRET_FRAC2_1");
			st.addState("FRET_FRAC2_2");
			st.addState("FRET_FRAC2_3");
			st.addState("FRET_FRAC2_4");
			st.addState("FRET_FRAC2_5");
			st.addState("FRET_ROOT_DOWN");
			st.addState("FRET_ROOT_BASE");
			st.addState("FRET_ROOT_BASE2");
			st.addState("FRET_ROOT_NUM");
			st.addState("FRET_ROOT_NUM2");
			st.addState("FRET_SUM_UP");
			st.addState("FRET_SUM_UP_2");
			st.addState("FRET_SUM_UP_SCANDOWN");
			st.addState("FRET_SUM_UP_SCANDOWN_2");
			st.addState("FRET_SUM_UP_SCANDOWN_3");
			st.addState("FRET_SUM_UP_NODOWN");
			st.addState("FRET_SUM_DOWN");
			st.addState("FRET_SUM_DOWN_2");
			st.addState("FRET_SUM_DOWN_3");
			st.addState("FRET_SUM_DOWN_4");
			st.addState("FRET_SUM_DOWN_5");
			st.addState("FRET_MATRIX_DRAW_ROW_LINE_FIRST");
			st.addState("FRET_MATRIX_DRAW_ROW_LINE_FIRST_2");
			st.addState("FRET_MATRIX_DRAW_ROW_LINE");
			st.addState("FRET_MATRIX_DRAW_ROW_LINE_2");
			st.addState("FRET_MATRIX_DRAW_ROW_LINE_3");
			st.addState("FRET_CMB");
			st.addState("FRET_CMB_2");
			st.addState("FRET_CMB_3");
			st.addState("FRET_CMB_4");
			var NEXT_FSUB = 0,
				NEXT_ROOT = BITMASK,
				NEXT_FPOW = BITMASK * 2,
				MARK_TEMP_FSUB = 1,
				MARK_TEMP_FPOW = 2,
				MARK_TEMP_ROOT = 4,
				MARK_TEMP_FRAC = 8,
				MATRIX_UP = 1,
				MATRIX_DOWN = 2,
				MATRIX_LEFT = 4,
				MATRIX_RIGHT = 8,
				nextLabel,
				nextState;
			function isTempRoot(val) {
				return (val & NEXT_ROOT) > 0;
			}
			function isStateSub(val) {
				return val < NEXT_ROOT;
			}
			function directSum(state, next) {
				return next + (Math.floor(state / BITMASK) * BITMASK);
			}
			function markInt(quadro) {
				quadro.getCellRel(1,  0).markSumSign = true;
				quadro.getCellRel(1, -1).markSumSign = true;
				quadro.getCellRel(2, -1).markSumSign = true;
				quadro.getCellRel(0,  1).markSumSign = true;
				quadro.getCellRel(1,  1).markSumSign = true;
			}
			function putStoreIntSign(quadro) {
				var count = quadro.storeMathSign.pop(),
					i,
					res = '';
				if(count === 2) {
					res = '\\iint';
				} else if(count === 3) {
					res = '\\iiint';
				} else {
					for(i = 0; i < count; i++) {
						if(i > 0) {
							res += ' \\!\\!\\! '
						}
						res += '\\int';
					}
				}
				quadro.storeMathSign.push(res);
			}
			function getSumIntState(quadro) {
				if(quadro.isSumAscii()) {
					return st.FPRINTABLE_SUM_ASCII;
				} else if(quadro.isSumAsciiShort()) {
					return st.FPRINTABLE_SUM_ASCII_SHORT;
				} else if(quadro.isIntAscii()) {
					return st.FPRINTABLE_INT_ASCII;
				} else if(quadro.isOintAscii()) {
					return st.FPRINTABLE_OINT_ASCII;
				} else if(quadro.isProdAscii()) {
					return st.FPRINTABLE_PROD_ASCII;
				} else if(quadro.isProdAsciiShort()) {
					return st.FPRINTABLE_PROD_ASCII_SHORT;
				} else if(quadro.isSumMulti()) {
					return st.FPRINTABLE_SUM_MULTI;
				} else if(quadro.isIntMulti()) {
					return st.FPRINTABLE_INT_MULTI;
				} else if(quadro.isDintMulti()) {
					return st.FPRINTABLE_DINT_MULTI;
				} else if(quadro.isOintMulti()) {
					return st.FPRINTABLE_OINT_MULTI;
				} else if(quadro.isProdMulti()) {
					return st.FPRINTABLE_PROD_MULTI;
				} else if(quadro.isCupMulti()) {
					return st.FPRINTABLE_CUP_MULTI;
				} else if(quadro.isCapMulti()) {
					return st.FPRINTABLE_CAP_MULTI;
				} else if(quadro.isLorMulti()) {
					return st.FPRINTABLE_LOR_MULTI;
				} else if(quadro.isLandMulti()) {
					return st.FPRINTABLE_LAND_MULTI;
				} else {
					return false;
				}
			}
			me.getState = function(name) {
				return st[name];
			};
			me.getStateName = function(state) {
				return st.getName(state);
			};
			me.transit = function(state, quadro) {
				var cell = quadro.get(),
					v1,
					v2,
					v3,
					t1,
					t2,
					t3,
					t4,
					basedirc,
					i;
				switch(state % BITMASK) {
				case st.INIT:
					return st.THISINIT;
				case st.THISINIT:
					return st.INITSCANDOWN;
				case st.INITSCANDOWN:
					if(cell.isOutsideY()) {
						quadro.moveUp();
						return st.INITCURSORUP;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.getChar() === '-' && quadro.getCellRight().getChar() === '-') {
						cell.markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(/[\|\-\/]/.test(cell.getChar())) {
						quadro.moveDown();
						return st.INIT_CHECKARRAY;
					} else if(cell.getChar() === '.' && quadro.getCellDown().getChar() === '.') {
						cell.markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.isPrintable() && !quadro.isAccent()) {
						quadro.fracRootLabel = 'INIT';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.INITCURSORUP:
					if(cell.isOutsideY()) {
						quadro.moveDown().moveRight();
						return st.INITCURSORR;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.INITCURSORR:
					if(cell.isOutsideX()) {
						return st.ERROR;
					} else {
						return st.INITSCANDOWN;
					}
				case st.INIT_CHECKARRAY:
					if(/[\|]/.test(cell.getChar())) {
						return st.INIT_CHECKARRAY_2;
					} else if(quadro.getCellUp().isPrintable() && !quadro.isAccent(-1)) {
						quadro.moveUp();
						quadro.get().markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.isPrintable() && quadro.isAccent()) {
						cell.markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else {
						return st.INITSCANDOWN;
					}
				case st.INIT_CHECKARRAY_2:
					if(cell.getChar() === '<') {
						cell.markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(/[\-\\]/.test(cell.getChar())) {
						if(quadro.getCellRight().getChar() === '-') {
							quadro.get().markReturn.push('INIT');
							quadro.clearStringBuilder();
							return st.FINIT;
						} else if(quadro.getCellDown().getChar() === '-') {
							quadro.moveDown();
							quadro.get().markReturn.push('INIT');
							quadro.clearStringBuilder();
							return st.FINIT;
						} else {
							quadro.moveUp();
							return st.INIT_CHECKARRAY_3;
						}
					} else if(cell.isWhitespace()) {
						quadro.moveUp();
						return st.INIT_CHECKARRAY_3;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.INIT_CHECKARRAY_3:
					if(/[\-\/]/.test(cell.getChar())) {
						quadro.moveDown();
						quadro.get().markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.getChar() === '|') {
						quadro.moveUp();
						return state;
					} else {
						quadro.moveDown().moveDown();
						quadro.get().markReturn.push('INIT');
						quadro.clearStringBuilder();
						return st.FINIT;
					}
				case st.CHECK_FRAC_ROOT_BELOW:
					quadro.moveDown();
					return st.CHECK_FRAC_ROOT_BELOW_1;
				case st.CHECK_FRAC_ROOT_BELOW_1:
					if(cell.isBoundY() && !cell.markTemp) {
						quadro.moveUp();
						return st.CHECK_FRAC_ROOT_BELOW_2;
					} else if(cell.getChar() === '-') {
						nextLabel = quadro.fracRootLabel;
						cell.markReturn.push(nextLabel);
						nextState = quadro.fracRootGoto;
						quadro.fracRootAction();
						quadro.fracRootAction = quadro.fracRootLabel = quadro.fracRootGoto = false;
						return nextState;
					} else if(cell.getChar() === 'v' &&
							/[\/_]/.test(quadro.getCellRel(1, -1).getChar())) {
						nextLabel = quadro.fracRootLabel;
						cell.markReturn.push(nextLabel);
						nextState = quadro.fracRootGoto;
						quadro.fracRootAction();
						quadro.fracRootAction = quadro.fracRootLabel = quadro.fracRootGoto = false;
						return nextState;
					} else if(cell.isPrintable()) {
						quadro.moveUp();
						return st.CHECK_FRAC_ROOT_BELOW_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.CHECK_FRAC_ROOT_BELOW_2:
					if(cell.isPrintable()) {
						nextLabel = quadro.fracRootLabel;
						cell.markReturn.push(nextLabel);
						nextState = quadro.fracRootGoto;
						quadro.fracRootAction();
						quadro.fracRootAction = quadro.fracRootLabel = quadro.fracRootGoto = false;
						return nextState;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CHECK_FRAC_ABOVE:
					quadro.moveUp();
					return st.CHECK_FRAC_ABOVE_1;
				case st.CHECK_FRAC_ABOVE_1:
					if(cell.isBoundY() && !cell.markTemp) {
						quadro.moveDown();
						return st.CHECK_FRAC_ABOVE_2;
					} else if(cell.getChar() === '-') {
						quadro.moveUp();
						return st.CHECK_FRAC_ABOVE_3;
					} else if(cell.isPrintable()) {
						quadro.moveDown();
						return st.CHECK_FRAC_ABOVE_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CHECK_FRAC_ABOVE_2:
					if(cell.isPrintable()) {
						nextLabel = quadro.fracRootLabel;
						cell.markReturn.push(nextLabel);
						nextState = quadro.fracRootGoto;
						quadro.fracRootAction();
						quadro.fracRootAction = quadro.fracRootLabel = quadro.fracRootGoto = false;
						return nextState;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.CHECK_FRAC_ABOVE_3:
					if(cell.isBoundY() && !cell.markTemp) {
						quadro.moveDown();
						return st.CHECK_FRAC_ABOVE_4;
					} else if(cell.isPrintable()) {
						quadro.moveDown();
						return st.CHECK_FRAC_ABOVE_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CHECK_FRAC_ABOVE_4:
					if(cell.isPrintable()) {
						quadro.moveDown();
						return st.CHECK_FRAC_ABOVE_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FINIT:
					return st.FPRINTABLE;
				case st.FPRINTABLE:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange ||
							cell.markCmbBoundary) {
						quadro.moveLeft();
						return st.FPRINTABLE_RET;
					} else if(cell.markIgnoreSubPow) {
						cell.markIgnoreSubPow = false;
						return st.FPRINTABLE_RET;
					} else if(cell.markPow) {
						cell.markPow = false;
						quadro.moveLeft();
						return directSum(NEXT_FPOW, st.FPRINTABLE_DRAWTEMP);
					} else if(cell.markSub) {
						cell.markSub = false;
						quadro.moveLeft();
						quadro.get().markSub = true;
						return directSum(NEXT_FSUB, st.FPRINTABLE_DRAWTEMP);
					} else if(cell.isRootEnd() || quadro.isMarkRootEndBelow()) {
						if(cell.getChar() === '-') {
							cell.markMinusTemp = true;
							quadro.moveUp();
							return st.FPRINTABLE_MINUS_2;
						} else if(cell.isPrintable()) {
							quadro.appendBuilder();
							cell.markProcessed();
							cell.markIgnoreSubPow = true;
							return st.FPRINTABLE_RET;
						} else {
							quadro.moveLeft();
							return st.FPRINTABLE_RET;
						}
					} else if(quadro.isBinomial()) {
						quadro.drawBinomialBorder();
						cell.markFraction = 'BINOMIAL';
						return st.FRAC_INIT;
					} else if(cell.getChar() === '-') {
						quadro.moveRight();
						return st.FPRINTABLE_MINUS;
					} else if(cell.getChar() === 'v') {
						quadro.moveRight().moveUp();
						return st.FPRINTABLE_V;
					} else if(cell.getChar() === '|') {
						return st.FPRINTABLE_BAR;
					} else if(cell.getChar() === '<') {
						return st.FPRINTABLE_LT;
					} else if(/[{\[\(]/.test(cell.getChar())) {
						quadro.parenStack = [cell.getChar()];
						cell.markParenTemp = true;
						quadro.moveRight();
						return st.FPRINTABLE_PAREN;
					} else if(quadro.isVdots()) {
						quadro.addModel(new Printable("\\vdots"));
						quadro.getCellRel(0, 0).markProcessed();
						quadro.getCellRel(0, 1).markProcessed();
						quadro.getCellRel(0, 2).markProcessed();
						quadro.getCellRel(0, 0).markSubPowProcessed = true;
						quadro.moveRight();
						return state;
					} else if(quadro.isDdots()) {
						quadro.addModel(new Printable("\\ddots"));
						quadro.getCellRel(0, 0).markProcessed();
						quadro.getCellRel(1, 0).markProcessed();
						quadro.getCellRel(2, 0).markProcessed();
						quadro.getCellRel(1, 1).markProcessed();
						quadro.getCellRel(2, 2).markProcessed();
						quadro.getCellRel(0, 0).markSubPowProcessed = true;
						quadro.getCellRel(1, 0).markSubPowProcessed = true;
						quadro.getCellRel(2, 0).markSubPowProcessed = true;
						quadro.moveRight().moveRight().moveRight();
						return state;
					} else if(!!(nxt = getSumIntState(quadro))) {
						return nxt;
					} else if(cell.isPrintable()) {
						quadro.appendBuilder();
						cell.markProcessed();
						quadro.moveRight();
						return state;
					} else if(cell.isWhitespace()) {
						if(quadro.getCellUp().isVector()) {
							quadro.appendBuilder();
							cell.markProcessed();
							quadro.moveRight();
							return state;
						} else if((function () {
									// find square root below this point
									var i,
										cell;
									for(i = 1;; i++) {
										cell = quadro.getCellRel(0, i);
										if(cell.isBoundY()) {
											return false;
										} else if(cell.getChar() === 'v' &&
												/[_\/]/.test(quadro.getCellRel(1, i - 1).getChar())) {
											return true;
										}
									}
								})()) {
							return st.FPRINTABLE_SPC_ROOT_2;
						} else if(quadro.hasSuperScript() || quadro.hasSuperBound()) {
							return st.FPRINTABLE_RET;
						} else if(quadro.hasSubScript() || quadro.hasSubBound()) {
							return st.FPRINTABLE_RET;
						} else {
							quadro.moveRight();
							return st.FPRINTABLE_SPC;
						}
					} else {
						quadro.moveLeft();
						return st.FPRINTABLE_RET;
					}
				case st.FPRINTABLE_SPC:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange ||
							cell.markCmbBoundary) {
						quadro.moveLeft().moveLeft();
						return st.FPRINTABLE_RET;
					} else if(cell.isRootEnd() || quadro.isMarkRootEndBelow()) {
						if(cell.getChar() === '-' || cell.isPrintable()) {
							quadro.moveLeft();
							quadro.appendBuilder();
							quadro.get().markProcessed();
							quadro.moveRight();
							return st.FPRINTABLE;
						} else {
							quadro.moveLeft().moveLeft();
							return st.FPRINTABLE_RET;
						}
						quadro.moveLeft();
						return st.FPRINTABLE_RET;
					} else if(!!(nxt = getSumIntState(quadro))) {
						return nxt;
					} else if(cell.isPrintable()) {
						quadro.moveLeft();
						quadro.appendBuilder();
						quadro.get().markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					} else if(cell.isWhitespace()) {
						return st.FPRINTABLE_SPC_CMB;
					} else {
						quadro.moveLeft().moveLeft();
						return st.FPRINTABLE_RET;
					}
				case st.FPRINTABLE_SPC_CMB:
					quadro.moveLeft();
					quadro.get().markCmbTemp = true;
					quadro.moveDown();
					return st.FPRINTABLE_SPC_CMB_SCAN_NOSUB;
				case st.FPRINTABLE_SPC_CMB_SCAN_NOSUB:
					if(cell.isBoundY()) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_CMB_NOSUB_RET_T;
					} else if(quadro.isSumInt(1)) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_CMB_NOSUB_RET_F;
					} else if(cell.isPrintable() && !quadro.isCellBar() && !quadro.isAccent()) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_CMB_NOSUB_RET_F;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_NOSUB_RET_T:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.markCmbTemp) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_CMB_SCAN_NOPOW;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_NOSUB_RET_F:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						quadro.moveRight();
						return st.FPRINTABLE_SPC_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_SCAN_NOPOW:
					if(cell.isBoundY()) {
						quadro.moveDown();
						return st.FPRINTABLE_SPC_CMB_NOPOW_RET_T;
					} else if(quadro.isSumInt(-1)) {
						quadro.moveDown();
						return st.FPRINTABLE_SPC_CMB_NOPOW_RET_F;
					} else if(cell.isPrintable() && !quadro.isCellBar()) {
						quadro.moveDown();
						return st.FPRINTABLE_SPC_CMB_NOPOW_RET_F;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_NOPOW_RET_T:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						quadro.moveRight();
						quadro.get().markCmbTemp = true;
						return st.FPRINTABLE_SPC_CMB_SCAN;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_NOPOW_RET_F:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						quadro.moveRight();
						return st.FPRINTABLE_SPC_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_SCAN:
					if(cell.isBoundY()) {
						if(cell.markCmbTemp) {
							cell.markCmbTemp = false;
							return st.FPRINTABLE_SPC_2;
						} else {
							quadro.moveUp();
							return st.FPRINTABLE_SPC_CMB_RET_DOWN;
						}
					} else if(cell.getChar() === 'v' &&
							/[\/_]/.test(quadro.getCellRel(1, -1).getChar())) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_ROOT;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markCmbFound = true;
						return st.FPRINTABLE_SPC_CMB_FOUND;
					} else if(cell.isPrintable() && !quadro.isCellBar() && !quadro.isAccent()) {
						cell.markCmbFound = true;
						return st.FPRINTABLE_SPC_CMB_FOUND;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND:
					if(cell.markCmbTemp) {
						return st.FPRINTABLE_SPC_CMB_FOUND_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND_2:
					if(cell.isWhitespace()) {
						quadro.moveRight();
						return state;
					} else {
						cell.markCmbTemp = true;
						return st.FPRINTABLE_SPC_CMB_FOUND_3;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND_3:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator) {
						quadro.moveUp();
						return st.FPRINTABLE_SPC_CMB_FOUND_4;
					} else {
						cell.markCmbBoundary = true;
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND_4:
					if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						return st.FPRINTABLE_SPC_CMB_FOUND_5;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND_5:
					if(cell.markCmbTemp) {
						return st.FPRINTABLE_SPC_CMB_FOUND_6;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_FOUND_6:
					if(cell.markCmbFound) {
						cell.markCmbFound = false;
						cell.markReturn.push('CMB');
						quadro.flushBuilder();
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SPC_CMB_RET_DOWN:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						return st.FPRINTABLE_SPC_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_2:
					return st.FPRINTABLE_RET;
				case st.FPRINTABLE_SPC_ROOT:
					if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						quadro.getCellLeft().markProcessed();
						return st.FPRINTABLE_SPC_ROOT_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SPC_ROOT_2:
					cell.markProcessed();
					if(cell.getChar() === '/') {
						cell.markRoot = 'BASE';
						return st.FPRINTABLE_SPC_ROOT_3;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_SPC_ROOT_3:
					if(cell.getChar() === 'v') {
						cell.markRootWall = true;
						quadro.moveRight().moveUp();
						return st.FPRINTABLE_V_SLASH;
					} else {
						quadro.moveLeft().moveDown();
						return state;
					}
				case st.FPRINTABLE_MINUS:
					if(cell.getChar() == '-') {
						quadro.moveLeft().get().markFraction = 'FRAC2';
						return st.FRAC_INIT;
					} else {
						quadro.moveLeft();
						quadro.get().markMinusTemp = true;
						quadro.moveUp();
						return st.FPRINTABLE_MINUS_2;
					}
				case st.FPRINTABLE_MINUS_2:
					if(cell.isBoundY()) {
						return st.FPRINTABLE_MINUS_3_F;
					} else if(cell.isPrintable()) {
						return st.FPRINTABLE_MINUS_3_T;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_MINUS_3_T:
					if(cell.markMinusTemp) {
						cell.markMinusTemp = false;
						cell.markFraction = 'FRAC2';
						return st.FRAC_INIT;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_MINUS_3_F:
					if(cell.markMinusTemp) {
						cell.markMinusTemp = false;
						cell.markProcessed();
						quadro.appendBuilder();
						quadro.moveRight();
						return st.FPRINTABLE;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_V:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator) {
						quadro.moveDown().moveLeft();
						quadro.appendBuilder();
						quadro.get().markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					} else if(cell.getChar() == '_' || cell.getChar() == '/') {
						quadro.moveLeft().moveDown();
						quadro.get().markProcessed();
						quadro.get().markRoot = 'BASE';
						quadro.moveRight().moveUp();
						return st.FPRINTABLE_V_SLASH;
					} else {
						quadro.moveDown().moveLeft();
						quadro.appendBuilder();
						quadro.get().markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					}
				case st.FPRINTABLE_V_SLASH:
					if(cell.getChar() === '/') {
						cell.markRootWall = !cell.markRoot;
						quadro.moveRight().moveUp();
						return state;
					} else if(cell.getChar() === '_') {
						cell.markRootWall = true;
						quadro.moveRight();
						return st.FPRINTABLE_V_SLASH2;
					}
				case st.FPRINTABLE_V_SLASH2:
					if(cell.getChar() === '_') {
						cell.markRootWall = true;
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft();
						return st.FPRINTABLE_V_SLASH3;
					}
				case st.FPRINTABLE_V_SLASH3:
					if(cell.getChar() === '_') {
						quadro.moveLeft();
						return state;
					} else {
						quadro.moveDown();
						return st.FPRINTABLE_V_SLASH4;
					}
				case st.FPRINTABLE_V_SLASH4:
					if(cell.getChar() === '/') {
						quadro.moveLeft().moveDown();
						return state;
					} else if(cell.getChar() === 'v') {
						cell.markRootStartV = true;
						quadro.moveRight();
						quadro.countRootWalls = [];
						return st.FPRINTABLE_V_COUNT;
					} else {
						throw new Error('Parse failed: maybe illegal input');
					}
				case st.FPRINTABLE_V_COUNT:
					if(!quadro.isAboveSlashRootWall()) {
						quadro.moveLeft();
						return st.FPRINTABLE_V_COUNT_2;
					} else if(quadro.isRootNotation()) {
						quadro.markProcessedRootUpperWall();
						quadro.moveUp();
						return st.FPRINTABLE_V_NUM;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_V_COUNT_2:
					if(cell.markRootStartV) {
						cell.markRootStartV = false;
						quadro.moveUp();
						return st.FPRINTABLE_V_NUM;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_V_NUM:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.markRootWall ||
							(cell.markTemp & MARK_TEMP_FPOW) > 0 ||
							(cell.markTemp & MARK_TEMP_FSUB) > 0 ||
							(cell.isProcessed() && !cell.isWhitespace())) {
						quadro.moveDown();
						return st.FPRINTABLE_V_NUMRET;
					} else if(cell.isPrintable()) {
						return st.FPRINTABLE_V_NUM2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_V_NUMRET:
					if(cell.markRoot || cell.markRootWall) {
						quadro.moveRight().moveUp();
						return st.FPRINTABLE_V_NUMRET_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_V_NUMRET_2:
					if(cell.getChar() === '_') {
						quadro.moveLeft().moveDown();
						return st.FPRINTABLE_V_NUMRET_3;
					} else {
						quadro.moveUp();
						return st.FPRINTABLE_V_NUM;
					}
				case st.FPRINTABLE_V_NUMRET_3:
					if(cell.getChar() === 'v' && cell.markRootWallInner) {
						quadro.countRootWalls.push(null);
						quadro.moveRight();
						return st.FPRINTABLE_V_COUNT;
					} else if(cell.markRoot) {
						if(quadro.moveToRootV()) {
							quadro.get().markRoot = 'MOVE';
							quadro.get().markProcessed();
						}
						quadro.flushBuilder();
						quadro.countRootWalls.unshift(null);
						return directSum(NEXT_ROOT, st.FPRINTABLE_DRAWTEMP);
					} else {
						quadro.moveLeft().moveDown();
						return state;
					}
				case st.FPRINTABLE_V_NUM2:
					cell.markReturn.push('ROOT_N');
					cell.markRootNum = true;
					cell.markRootNumRet = true;
					quadro.flushBuilder();
					quadro.clearStringBuilder();
					quadro.newModel();
					return st.FPRINTABLE_V_NUM_PRINTABLE;
				case st.FPRINTABLE_V_NUM_PRINTABLE:
					if(cell.markRootWall) {
						quadro.moveLeft();
						return st.FPRINTABLE_V_NUM_PRINTABLE2;
					} else {
						quadro.appendBuilder();
						cell.markProcessed();
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_V_NUM_PRINTABLE2:
					if(cell.markRootNumRet) {
						return st.FPRINTABLE_RET;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_SUM_ASCII:
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.getCellRel(0, -1).markSumSign = true;
					quadro.getCellRel(1, -1).markSumSign = true;
					quadro.getCellRel(2, -1).markSumSign = true;
					quadro.getCellRel(0,  1).markSumSign = true;
					quadro.getCellRel(1,  1).markSumSign = true;
					quadro.getCellRel(2,  1).markSumSign = true;
					quadro.storeMathSign.push('\\sum');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_SUM_ASCII_SHORT:
					quadro.getCellRel(0, -1).markSumSign = true;
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(0,  1).markSumSign = true;
					quadro.storeMathSign.push('\\sum');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_INT_ASCII:
					cell.markIntTempStart = true;
					quadro.storeMathSign.push(0);
					return st.FPRINTABLE_INT_ASCII_2;
				case st.FPRINTABLE_INT_ASCII_2:
					if(quadro.isIntAscii()) {
						markInt(quadro);
						quadro.moveRight().moveRight();
						if(!quadro.isIntAscii()) {
							quadro.moveRight();
						}
						v1 = quadro.storeMathSign.pop();
						quadro.storeMathSign.push(v1 + 1);
						return state;
					} else {
						return st.FPRINTABLE_INT_ASCII_3;
					}
				case st.FPRINTABLE_INT_ASCII_3:
					putStoreIntSign(quadro);
					return st.FPRINTABLE_INT_ASCII_4;
				case st.FPRINTABLE_INT_ASCII_4:
					if(cell.markIntTempStart) {
						cell.markIntTempStart = false;
						return st.FPRINTABLE_SUM_INT;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_OINT_ASCII:
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.getCellRel(1, -1).markSumSign = true;
					quadro.getCellRel(2, -1).markSumSign = true;
					quadro.getCellRel(0,  1).markSumSign = true;
					quadro.getCellRel(1,  1).markSumSign = true;
					quadro.storeMathSign.push('\\oint');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_PROD_ASCII:
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.getCellRel(3,  0).markSumSign = true;
					quadro.getCellRel(0, -1).markSumSign = true;
					quadro.getCellRel(1, -1).markSumSign = true;
					quadro.getCellRel(2, -1).markSumSign = true;
					quadro.getCellRel(3, -1).markSumSign = true;
					quadro.getCellRel(4, -1).markSumSign = true;
					quadro.getCellRel(1,  1).markSumSign = true;
					quadro.getCellRel(3,  1).markSumSign = true;
					quadro.storeMathSign.push('\\prod');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_PROD_ASCII_SHORT:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\prod');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_SUM_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\sum');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_INT_MULTI:
					cell.markIntTempStart = true;
					quadro.storeMathSign.push(0);
					return st.FPRINTABLE_INT_MULTI_2;
				case st.FPRINTABLE_INT_MULTI_2:
					if(quadro.isIntMulti()) {
						quadro.getCellRel(0,  0).markSumSign = true;
						quadro.getCellRel(1,  0).markSumSign = true;
						quadro.moveRight().moveRight();
						v1 = quadro.storeMathSign.pop();
						quadro.storeMathSign.push(v1 + 1);
						return state;
					} else {
						return st.FPRINTABLE_INT_MULTI_3;
					}
				case st.FPRINTABLE_INT_MULTI_3:
					putStoreIntSign(quadro);
					return st.FPRINTABLE_INT_MULTI_4;
				case st.FPRINTABLE_INT_MULTI_4:
					if(cell.markIntTempStart) {
						cell.markIntTempStart = false;
						return st.FPRINTABLE_SUM_INT;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_DINT_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\int \\!\\!\\! \\int');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_OINT_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\oint');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_PROD_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\prod');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_CUP_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\bigcup');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_CAP_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\bigcap');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_LOR_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\bigvee');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_LAND_MULTI:
					quadro.getCellRel(0,  0).markSumSign = true;
					quadro.getCellRel(1,  0).markSumSign = true;
					quadro.storeMathSign.push('\\bigwedge');
					return st.FPRINTABLE_SUM_INT;
				case st.FPRINTABLE_SUM_INT:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange) {
						quadro.moveRight();
						return st.FPRINTABLE_SUM_BASELINE;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_SUM_BASELINE:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveLeft();
						return st.FPRINTABLE_SUM_BASELINE_2;
					} else {
						cell.markSumBase = true;
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_SUM_BASELINE_2:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange ||
							cell.isProcessed()) {
						quadro.moveRight();
						return st.FPRINTABLE_SUM_SCANUP;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_SUM_SCANUP:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.isProcessed()) {
						quadro.moveDown();
						return st.FPRINTABLE_SUM_SCANUP_2;
					} else if(cell.isPrintable() && !cell.isTraversed()) {
						quadro.fracRootLabel = 'SUM_UP';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.flushBuilder();
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ABOVE;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPRINTABLE_SUM_SCANUP_2:
					if(cell.markSumBase) {
						quadro.moveRight();
						return st.FPRINTABLE_SUM_SCANUP_3;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPRINTABLE_SUM_SCANUP_3:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange ||
							(cell.isPrintable() && !cell.isTraversed()) ||
							getSumIntState(quadro)) {
						return st.FPRINTABLE_SUM_NOUP;
					} else {
						quadro.moveUp();
						return st.FPRINTABLE_SUM_SCANUP;
					}
				case st.FPRINTABLE_SUM_NOUP:
					quadro.flushBuilder();
					quadro.clearStringBuilder();
					quadro.newModel();
					return st.FRET_SUM_UP_2;
				case st.FPRINTABLE_BAR:
					if(/[\|\/\-]/.test(quadro.getCellUp().getChar()) &&
							/[\|\\\-]/.test(quadro.getCellDown().getChar())) {
						return st.MATRIX;
					} else {
						quadro.appendBuilder();
						cell.markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					}
				case st.FPRINTABLE_LT:
					if(quadro.getCellUp().getChar() === '|' ||
							quadro.getCellUp().getChar() === '/' ||
							quadro.getCellDown().getChar() === '|' ||
							quadro.getCellDown().getChar() === '\\') {
						return st.CASES;
					} else {
						quadro.appendBuilder();
						cell.markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					}
				case st.FPRINTABLE_PAREN:
					if(/[{\[\(]/.test(cell.getChar())) {
						quadro.parenStack.push(cell.getChar());
						quadro.moveRight();
						return state;
					} else if(/[}\]\)]/.test(cell.getChar())) {
						quadro.parenStack.pop();
						if(quadro.parenStack.length > 0) {
							quadro.moveRight();
							return state
						} else {
							quadro.barCount = 0;
							quadro.moveLeft();
							return st.FPRINTABLE_PAREN_2;
						}
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_PAREN_2:
					if(cell.markParenTemp) {
						cell.markParenTemp = false;
						quadro.parenStack = false;
						quadro.barCount = false;
						quadro.appendBuilder();
						cell.markProcessed();
						quadro.moveRight();
						return st.FPRINTABLE;
					} else if(cell.getChar() !== '|') {
						quadro.moveLeft();
						return state;
					} else if(quadro.barCount === 0) {
						cell.markMiddleBar = true;
						quadro.barCount = 1;
						quadro.moveLeft();
						return state;
					} else {
						quadro.moveRight();
						return st.FPRINTABLE_PAREN_3;
					}
				case st.FPRINTABLE_PAREN_3:
					if(cell.getChar() === '|') {
						cell.markMiddleBar = false;
						quadro.barCount = 0;
						quadro.moveLeft();
						return st.FPRINTABLE_PAREN_4;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_PAREN_4:
					quadro.moveLeft();
					return cell.getChar() === '|' ? st.FPRINTABLE_PAREN_2 : state;
				case st.FPRINTABLE_RET:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return state;
					} else if(cell.isProcessed()) {
						return cell.markSubPowProcessed ? st.FPRINTABLE_RET_2 : st.FPRINTABLE_RET_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_RET_2:
					if(cell.isMarkStart()) {
						return st.FRET;
					} else if(quadro.isMarkStartRoot()) {
						quadro.moveReturnStackHere();
						return st.FRET;
					} else {
						quadro.moveLeft();
						return cell.markSubPowProcessed ? state : st.FPRINTABLE_RET_3;
					}
				case st.FPRINTABLE_RET_3:
					if(cell.isMarkStart() || quadro.isMarkStartRoot()) {
						if(quadro.isMarkStartRoot()) {
							quadro.moveReturnStackHere();
						}
						quadro.flushBuilder();
						if(quadro.isModelNotScan()) {
							return st.FRET;
						} else {
							quadro.moveRootProcessedRight();
							return st.FPRINTABLE_DRAWTEMP;
						}
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_DRAWTEMP:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						quadro.markTempMatrix = true;
					} else if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						quadro.markTempMatrix = false;
					}
					if(!quadro.markTempMatrix &&
							(cell.markRootNum ||
									(cell.markRootWall && !cell.markRootWallInner && cell.getChar() !== 'v'))) {
						quadro.markTempMatrix = false;
						return directSum(state, st.FPRINTABLE_DRAWTEMP2);
					} else if(cell.isOutsideX()) {
						quadro.markTempMatrix = false;
						quadro.moveLeft();
						return directSum(state, st.FPRINTABLE_DRAWTEMP2);
					} else {
						switch(Math.floor(state / BITMASK) * BITMASK) {
						case NEXT_FSUB:
							cell.markTemp = cell.markTemp | MARK_TEMP_FSUB;
							break;
						case NEXT_FPOW:
							cell.markTemp = cell.markTemp | MARK_TEMP_FPOW;
							break;
						case NEXT_ROOT:
							cell.markTemp = cell.markTemp | MARK_TEMP_ROOT;
							break;
						default:
							throw new Error('Parse failed: maybe illegal input');
						}
						quadro.moveRight();
						return state;
					}
				case st.FPRINTABLE_DRAWTEMP2:
					if(cell.markRootNum || cell.markIgnoreSubPow) {
						return st.FPRINTABLE_RET_LEFT;
					} else if(cell.isProcessed()) {
						switch(Math.floor(state / BITMASK) * BITMASK) {
						case NEXT_FSUB:
							quadro.moveDown().moveRight();
							return st.FSUB_SCAN;
						case NEXT_FPOW:
							quadro.moveUp().moveRight();
							return st.FPOW_SCAN;
						case NEXT_ROOT:
							quadro.moveUp().moveRight();
							return st.ROOT_INIT;
						default:
							throw new Error('Parse failed: maybe illegal input');
						}
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPRINTABLE_RET_LEFT:
					if(cell.isOutsideX()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.isMarkStart()) {
						return st.FRET;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FSUB_SCAN:
					if(cell.isBoundY() && (!cell.markTemp || cell.markTemp !== MARK_TEMP_ROOT) ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveUp().moveLeft();
						return st.FSUB_RET_DOWN;
					} else if(quadro.isMatrixByScanningDown() || quadro.isSumInt(1)) {
						if(quadro.isSumInt(1)) {
							quadro.moveDownIfNotMulti();
						} else {
							quadro.moveMatrixDown();
						}
						quadro.get().markReturn.push('SUB');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.getChar() === 'v' && /[_\/]/.test(quadro.getCellRel(1, -1).getChar())) {
						quadro.moveUp().moveLeft();
						return st.FSUB_RET_DOWN;
					} else if(cell.isPrintable() && !quadro.isCellBar() && !quadro.isAccent()) {
						quadro.fracRootLabel = 'SUB';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FSUB_RET_DOWN:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} if(cell.isProcessed()) {
						quadro.moveRight();
						if(quadro.getCellUp().markAccent) {
							quadro.get().markProcessed();
							quadro.moveRight();
							return st.FPOW_RET_DELTEMP;
						} else if(cell.markSub) {
							cell.markSub = false;
							return st.FPOW_RET_DELTEMP;
						} else {
							quadro.moveUp();
							return st.FPOW_SCAN;
						}
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPOW_SCAN:
					if(cell.isBoundY() || cell.markCmbBoundary ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveDown().moveLeft();
						return st.FPOW_RET_DOWN;
					} else if(quadro.isMatrixByScanningUp() || quadro.isSumInt(-1)) {
						if(quadro.isSumInt(-1)) {
							quadro.moveUpIfNotMulti();
						} else {
							quadro.moveMatrixUp();
						}
						quadro.get().markReturn.push('POW');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() && !quadro.isCellBar()) {
						quadro.fracRootLabel = 'POW';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ABOVE;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FPOW_RET_DOWN:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.markTemp) {
						return st.FPOW_RET_DELTEMP;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FPOW_RET_DELTEMP:
					if((cell.markTemp & MARK_TEMP_ROOT) > 0) {
						quadro.moveRight();
					}
					return st.FPOW_RET_DELTEMP2;
				case st.FPOW_RET_DELTEMP2:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.FPOW_RET_DELTEMP3;
					} else {
						cell.markTemp = false;
						quadro.moveRight();
						return state;
					}
				case st.FPOW_RET_DELTEMP3:
					if(cell.isProcessed()) {
						return st.FPOW_RET_DELTEMP4;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPOW_RET_DELTEMP4:
					cell.markSubPowProcessed = true;
					if(cell.isMarkStart()) {
						quadro.moveRight();
						return st.FPOW_RET_DELTEMP5;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FPOW_RET_DELTEMP5:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						return st.FPRINTABLE;
					}
				case st.FRAC_INIT:
					if(cell.getChar() === '-' || cell.markBinomialBorder) {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					} else {
						return st.FRAC_DRAWLINE;
					}
				case st.FRAC_DRAWLINE:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.FRAC_DRAWLINE_2;
					} else {
						cell.markTemp = MARK_TEMP_FRAC;
						quadro.moveRight();
						return state;
					}
				case st.FRAC_DRAWLINE_2:
					if(cell.getChar() === '-' || cell.markBinomialBorder) {
						return st.FRAC_BAR_BACK;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRAC_BAR_BACK:
					if(cell.markFraction) {
						quadro.moveUp();
						return st.FRAC_SCAN;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRAC_SCAN:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.isProcessed() ||
							cell.markTemp) {
						quadro.moveDown();
						return st.FRAC_SCAN_BACK;
					} else if(quadro.isMatrixByScanningUp() || quadro.isSumInt(-1)) {
						if(quadro.isSumInt(-1)) {
							quadro.moveUpIfNotMulti();
						} else {
							quadro.moveMatrixUp();
						}
						quadro.get().markReturn.push('FRAC1');
						quadro.flushBuilder();
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable()) {
						quadro.fracRootLabel = 'FRAC1';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.flushBuilder();
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ABOVE;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRAC_SCAN_BACK:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRAC_SCAN_BACK2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRAC_SCAN_BACK2:
					if(cell.isProcessed()) {
						quadro.moveUp();
						return st.FRAC_SCAN;
					} else {
						return st.ERROR;
					}
				case st.DENO_SCAN:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.isProcessed() ||
							(cell.markTemp && ((cell.markTemp & MARK_TEMP_ROOT) === 0))) {
						quadro.moveUp();
						return st.DENO_SCAN_BACK;
					} else if(quadro.isMatrixByScanningDown() ||
							quadro.isSumInt(1)) {
						if(quadro.isSumInt(1)) {
							quadro.moveDownIfNotMulti();
						} else {
							quadro.moveMatrixDown();
						}
						quadro.get().markReturn.push(quadro.fractionOrBinomial);
						quadro.fractionOrBinomial = false;
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() && !quadro.isCellBar() && !quadro.isAccent()) {
						quadro.fracRootLabel = quadro.fractionOrBinomial;
						quadro.fractionOrBinomial = false;
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.DENO_SCAN_BACK:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.DENO_SCAN_BACK2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.DENO_SCAN_BACK2:
					if(cell.isProcessed()) {
						quadro.moveDown();
						return st.DENO_SCAN;
					} else {
						return st.ERROR;
					}
				case st.ROOT_INIT:
					if(cell.getChar() == '/') {
						quadro.moveRight().moveUp();
						return state;
					} else if(cell.getChar() == '_') {
						return st.ROOT_CEIL1;
					}
				case st.ROOT_CEIL1:
					if(cell.getChar() == '_') {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft().moveDown();
						return st.ROOT_CEIL2;
					}
				case st.ROOT_CEIL2:
					if(cell.markTemp) {
						quadro.moveRight();
						return st.ROOT_CEIL3;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.ROOT_CEIL3:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveLeft();
						return st.ROOT_CEIL4;
					} else {
						cell.markTemp = false;
						quadro.moveRight();
						return state;
					}
				case st.ROOT_CEIL4:
					if(cell.markTemp) {
						return st.ROOT_CEIL5;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.ROOT_CEIL5:
					if(!cell.markRoot) {
						quadro.markRootEndAbove();
						quadro.moveLeft();
						return state;
					} else if(cell.markReturn[0] === 'INIT' ||
							cell.markReturn[cell.markReturn.length - 1] === 'FRAC1' ||
							cell.markReturn[cell.markReturn.length - 1] === 'FRAC2' ||
							cell.markReturn[cell.markReturn.length - 1] === 'ROOTBASE') {
						cell.markRootBase = 'INITIAL';
						return st.ROOT_CEIL6_INIT;
					} else {
						return st.ROOT_CEIL6_F;
					}
				case st.ROOT_CEIL6_INIT:
					cell.markRootBase = cell.markRootBase ? cell.markRootBase : 'NOTINITIAL';
					cell.markTemp = false;
					if(cell.markRootEnd) {
						quadro.moveUp();
						return st.ROOT_CEIL7;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.ROOT_CEIL6_F:
					if(cell.markRootEnd) {
						quadro.moveUp();
						return st.ROOT_CEIL7;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.ROOT_CEIL7:
					if(cell.getChar() === '_' && cell.isProcessed() &&
							!cell.markRootWallInner) {
						return st.ROOT_CEIL8;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.ROOT_CEIL8:
					if(cell.getChar() === '_' && cell.isProcessed()) {
						quadro.moveLeft();
						return state;
					} else {
						quadro.moveRight().moveDown();
						return st.ROOT_SCAN;
					}
				case st.ROOT_SCAN:
					if(cell.isProcessed()) {
						quadro.moveDown();
						return state;
					} else if(quadro.isMatrixByScanningDown() || quadro.isSumInt(1)) {
						if(quadro.isSumInt(1)) {
							quadro.moveDownIfNotMulti();
						} else {
							quadro.moveMatrixDown();
						}
						quadro.moveReturnStack();
						quadro.get().markReturn.push('ROOTBASE');
						Array.prototype.push.apply(
								quadro.get().markNumberOfRootV, quadro.countRootWalls);
						quadro.countRootWalls = false;
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() &&
							!quadro.isCellBar() &&
							!quadro.isAccent() &&
							!cell.markRootWallInner) {
						quadro.fracRootLabel = 'ROOTBASE';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.moveReturnStack();
							Array.prototype.push.apply(
									quadro.get().markNumberOfRootV, quadro.countRootWalls);
							quadro.countRootWalls = false;
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else if(cell.isProcessed() || cell.markTemp || cell.markRootBase) {
						quadro.moveUp();
						return st.ROOT_SCAN2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.ROOT_SCAN2:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.ROOT_SCAN3;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.ROOT_SCAN3:
					if(cell.isProcessed()) {
						quadro.moveDown();
						return st.ROOT_SCAN;
					} else {
						return st.ERROR;
					}
				case st.MATRIX:
					if(quadro.matrixType) {
						throw new Error('Matrices cannot nested');
					}
					quadro.flushBuilder();
					quadro.clearStringBuilder();
					quadro.matrixElements = [];
					quadro.matrixRowCount = 0;
					cell.markMatrixStart = true;
					return st.MATRIX_RANGE;
				case st.MATRIX_RANGE:
					if(cell.getChar() === '|') {
						cell.markMatrixRange = MATRIX_LEFT;
						quadro.moveUp();
						return state;
					} else if(cell.getChar() === '/') {
						cell.markMatrixRange = MATRIX_LEFT | MATRIX_UP;
						quadro.moveRight();
						quadro.matrixType = '()';
						return st.MATRIX_RANGE_2;
					} else if(cell.getChar() === '-' && !cell.isProcessed()) {
						cell.markMatrixRange = MATRIX_LEFT | MATRIX_UP;
						quadro.moveRight();
						quadro.matrixType = '[]';
						return st.MATRIX_RANGE_2;
					} else {
						quadro.moveDown()
						quadro.get().markMatrixRange |= MATRIX_UP;
						quadro.moveRight();
						quadro.matrixType = '||';
						return st.MATRIX_RANGE_2;
					}
				case st.MATRIX_RANGE_2:
					cell.markMatrixRange = MATRIX_UP;
					if(cell.isOutsideX()) {
						throw new Error('Invalid matrix');
					} else if(/[\|\\]/.test(cell.getChar()) ||
							(cell.getChar() === '-' && !cell.isProcessed())) {
						cell.markMatrixRange |= MATRIX_RIGHT;
						quadro.moveDown();
						return st.MATRIX_RANGE_3;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.MATRIX_RANGE_3:
					if(cell.getChar() === '|') {
						cell.markMatrixRange = MATRIX_RIGHT;
						quadro.moveDown();
						return state;
					} else if(cell.getChar() === '/' ||
							(cell.getChar() === '-' && !cell.isProcessed())) {
						cell.markMatrixRange = MATRIX_RIGHT | MATRIX_DOWN;
						quadro.moveLeft();
						return st.MATRIX_RANGE_4;
					} else {
						quadro.moveUp();
						quadro.get().markMatrixRange |= MATRIX_DOWN;
						quadro.moveLeft();
						return st.MATRIX_RANGE_4;
					}
				case st.MATRIX_RANGE_4:
					cell.markMatrixRange = MATRIX_DOWN;
					if(cell.isOutsideX()) {
						throw new Error('Invalid matrix');
					} else if(/[\|\\]/.test(cell.getChar()) ||
							(cell.getChar() === '-' && !cell.isProcessed())) {
						cell.markMatrixRange |= MATRIX_LEFT;
						quadro.moveUp();
						return st.MATRIX_RANGE_5;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_RANGE_5:
					if(cell.markMatrixRange) {
						return st.MATRIX_SEPARATE_ROW;
					} else if(cell.getChar() === '|') {
						cell.markMatrixRange = MATRIX_LEFT;
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_SEPARATE_ROW:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						quadro.moveRight();
						return st.MATRIX_SEPARATE_ROW_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_SEPARATE_ROW_2:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						quadro.moveLeft();
						return st.MATRIX_SEPARATE_ROW_DRAW;
					} else if(cell.isWhitespace()) {
						quadro.moveRight();
						return state;
					} else {
						return st.MATRIX_SEPARATE_ROW_3;
					}
				case st.MATRIX_SEPARATE_ROW_3:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						quadro.moveDown();
						return st.MATRIX_SEPARATE_ROW_4;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_SEPARATE_ROW_4:
					if((quadro.getCellUp().markMatrixRange & MATRIX_DOWN) > 0) {
						quadro.moveUp();
						return st.MATRIX_MOVE_LEFT_UP;
					} else {
						quadro.moveRight();
						return st.MATRIX_SEPARATE_ROW_2;
					}
				case st.MATRIX_SEPARATE_ROW_DRAW:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						quadro.moveDown();
						return st.MATRIX_SEPARATE_ROW_4;
					} else {
						cell.markMatrixRowSeparator = true;
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_MOVE_LEFT_UP:
					if(cell.markMatrixRange) {
						quadro.moveUp();
						return state;
					} else {
						quadro.matrixRowCount = quadro.matrixColCount = 0;
						quadro.moveDown().moveRight();
						return st.MATRIX_SCAN_FIRSTCOL;
					}
				case st.MATRIX_SCAN_FIRSTCOL:
					if((quadro.getCellUp().markMatrixRange & MATRIX_DOWN) > 0) {
						quadro.moveUp();
						return quadro.matrixRowCount > 0 ? st.MATRIX_SCAN_BACK : st.MATRIX_SCAN_FIRSTCOL_BACK;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markMatrixProcessed = true;
						quadro.get().markReturn.push('MATRIX_FIRSTCOL');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.getChar() === '-' &&
							quadro.getCellRight().getChar() === '-' &&
							!cell.isProcessed() &&
							!cell.markSumSign) {
						cell.markMatrixProcessed = true;
						cell.markReturn.push('MATRIX_FIRSTCOL');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.getChar() === '.' &&
							quadro.getCellDown().getChar() === '.' &&
							!cell.isProcessed()) {
						cell.markMatrixProcessed = true;
						cell.markReturn.push('MATRIX_FIRSTCOL');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() &&
							!cell.isProcessed() &&
							!cell.markSumSign &&
							!quadro.isCellBar() &&
							!quadro.isAccent() &&
							!(cell.markRootWall || cell.markRoot)) {
						quadro.fracRootLabel = 'MATRIX_FIRSTCOL';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.get().markMatrixProcessed = true;
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_SCAN_FIRSTCOL_BACK:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						quadro.moveRight();
						return st.MATRIX_SCAN_FIRSTCOL_BACK_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_SCAN_FIRSTCOL_BACK_2:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						throw new Error('Invalid matrix');
					} else {
						return st.MATRIX_SCAN_FIRSTCOL;
					}
				case st.MATRIX_SCAN:
					if((quadro.getCellUp().markMatrixRange & MATRIX_DOWN) > 0) {
						quadro.moveUp();
						return st.MATRIX_SCAN_BACK;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markMatrixProcessed = true;
						quadro.get().markReturn.push('MATRIX');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.getChar() === '-' &&
							quadro.getCellRight().getChar() === '-' &&
							!cell.isProcessed() &&
							!cell.markSumSign) {
						cell.markMatrixProcessed = true;
						cell.markReturn.push('MATRIX');
						quadro.clearStringBuilder();
						return st.FINIT;
					} else if(cell.getChar() === '.' &&
							quadro.getCellDown().getChar() === '.' &&
							!cell.isProcessed()) {
						cell.markMatrixProcessed = true;
						cell.markReturn.push('MATRIX');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() &&
							!cell.isProcessed() &&
							!cell.markSumSign &&
							!quadro.isCellBar() &&
							!quadro.isAccent() &&
							!(cell.markRootWall || cell.markRoot)) {
						quadro.fracRootLabel = 'MATRIX';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.get().markMatrixProcessed = true;
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else if(quadro.matrixRowCount > 0 && cell.markMatrixRowLine) {
						cell.markMatrixProcessed = true;
						if(!quadro.matrixElements[quadro.matrixRowCount]) {
							quadro.matrixElements[quadro.matrixRowCount] = [];
						}
						quadro.matrixElements[quadro.matrixRowCount++][quadro.matrixColCount] = new Printable("{}");
						quadro.moveDown();
						return state;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_SCAN_BACK:
					if((quadro.getCellDown().markMatrixRange & MATRIX_UP) > 0) {
						quadro.moveDown().moveRight();
						return st.MATRIX_SCAN_BACK_2;
					} else {
						if(quadro.matrixRowCount > 0) {
							cell.markMatrixColLine = true;
							if(cell.markMatrixRowLine && !cell.markMatrixProcessed) {
								t1 = quadro.matrixColCount;
								for(i = quadro.matrixRowCount - 1; i >= 0; i--) {
									if(!quadro.matrixElements[i + 1]) {
										quadro.matrixElements[i + 1] = [];
									}
									quadro.matrixElements[i + 1][t1] = quadro.matrixElements[i][t1];
									quadro.matrixElements[i][t1] = new Printable("{}");
								}
								quadro.matrixRowCount++;
								cell.markMatrixProcessed = true;
							}
						}
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_SCAN_BACK_2:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						return st.MATRIX_RESCAN;
					} else {
						if(quadro.matrixRowCount > 0) {
							quadro.matrixColCount++;
						}
						quadro.matrixRowCount = 0;
						return st.MATRIX_SCAN;
					}
				case st.MATRIX_RESCAN:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						return st.MATRIX_RESCAN_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_RESCAN_2:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						quadro.matrixColCount = 0;
						quadro.matrixRowCount = 0;
						quadro.moveRight();
						return st.MATRIX_RESCAN_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_RESCAN_3:
					if((quadro.getCellUp().markMatrixRange & MATRIX_DOWN) > 0) {
						quadro.moveUp();
						return st.MATRIX_RESCAN_4;
					} else if(cell.markMatrixRowLine && cell.markMatrixColLine) {
						t1 = quadro.matrixElements;
						t2 = quadro.matrixRowCount;
						t3 = quadro.matrixColCount;
						if(!cell.markMatrixProcessed) {
							if(!t1[t2]) {
								t1[t2] = [];
								t1[t2].push(new Printable("{}"));
							} else {
								for(i = t2; t1[i] && t1[i][t3]; i++) {}
								t4 = i - 1;
								for(i = t4; i >= t2; i--) {
									t1[i + 1][t3] = t1[i][t3];
								}
								t1[t2][t3] = new Printable("{}");
							}
						}
						quadro.matrixRowCount++;
						quadro.moveDown();
						return state;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_RESCAN_4:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						quadro.matrixRowCount = 0;
						quadro.moveRight();
						return st.MATRIX_RESCAN_5;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_RESCAN_5:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						return st.MATRIX_END;
					} else {
						if(quadro.getCellLeft().markMatrixColLine) {
							quadro.matrixColCount++;
						}
						return st.MATRIX_RESCAN_3;
					}
				case st.MATRIX_END:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						return st.MATRIX_END_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_END_2:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						return st.MATRIX_END_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_END_3:
					if(cell.markMatrixStart) {
						cell.markProcessed();
						quadro.moveRight();
						return cell.isMatrixEnd() ? st.MATRIX_END_INIT : st.MATRIX_END_4;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_END_4:
					cell.markProcessed();
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						quadro.addModel(new Matrix(quadro.matrixElements, quadro.matrixType));
						quadro.matrixType = false;
						if(quadro.isMarkRootEndBelow()) {
							cell.markIgnoreSubPow = true;
							return st.FPRINTABLE_RET;
						} else {
							quadro.moveRight();
							return st.FPRINTABLE;
						}
					} else {
						quadro.moveRight();
						return state;
					}
				case st.MATRIX_END_INIT:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						return st.MATRIX_END_INIT_2;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.MATRIX_END_INIT_2:
					if((cell.markMatrixRange & MATRIX_UP) > 0) {
						return st.MATRIX_END_INIT_3;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_END_INIT_3:
					if(!cell.markMatrixRange) {
						quadro.moveUp();
						return st.MATRIX_END_INIT_4;
					} else if(quadro.isPrintableRight()) {
						quadro.moveLeft();
						return st.MATRIX_END_INITBASE;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_END_INIT_4:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						return st.MATRIX_END_INIT_5;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_END_INIT_5:
					if(cell.isMatrixEnd()) {
						cell.markProcessed();
						quadro.moveRight();
						return st.MATRIX_END_INITBASE_FOUND;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_END_INITBASE:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						cell.markMatrixInit = true;
						return st.MATRIX_END_INITBASE_2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.MATRIX_END_INITBASE_2:
					if(!cell.markMatrixRange) {
						quadro.moveDown();
						return st.MATRIX_END_INITBASE_3;
					} else if(cell.isMatrixEnd()) {
						quadro.setMatrixMoveInit();
						return st.MATRIX_END_INITBASE_FOUND_UP;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_END_INITBASE_3:
					if(!cell.markMatrixRange) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.isMatrixEnd()) {
						quadro.setMatrixMoveInit();
						return st.MATRIX_END_INITBASE_FOUND_DOWN;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_END_INITBASE_FOUND_UP:
					if(cell.markMatrixInit) {
						quadro.putMatrixMoveInit();
						cell.markProcessed();
						quadro.moveRight();
						return st.MATRIX_END_INITBASE_FOUND;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.MATRIX_END_INITBASE_FOUND_DOWN:
					if(cell.markMatrixInit) {
						quadro.putMatrixMoveInit();
						cell.markProcessed();
						quadro.moveRight();
						return st.MATRIX_END_INITBASE_FOUND;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.MATRIX_END_INITBASE_FOUND:
					cell.markProcessed();
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						quadro.addModel(new Matrix(quadro.matrixElements, quadro.matrixType));
						quadro.matrixType = false;
						if(quadro.isMarkRootEndBelow()) {
							cell.markIgnoreSubPow = true;
							return st.FPRINTABLE_RET;
						} else {
							return st.FPRINTABLE;
						}
					} else {
						quadro.moveRight();
						return state;
					}
				case st.CASES:
					if(quadro.casesElements) {
						throw new Error('Cases cannot nested');
					}
					quadro.flushBuilder();
					quadro.clearStringBuilder();
					quadro.casesElements = [];
					quadro.casesCases = [];
					cell.markCasesStart = true;
					return st.CASES_RANGE;
				case st.CASES_RANGE:
					cell.markCasesRange = true;
					if(cell.getChar() === '\\') {
						quadro.moveRight();
						return st.CASES_RANGE_DOWN;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.CASES_RANGE_DOWN:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.CASES_RANGE_DOWN_2;
					} else {
						cell.markCasesRange = true;
						quadro.moveRight();
						return state;
					}
				case st.CASES_RANGE_DOWN_2:
					if(cell.getChar() === '\\') {
						quadro.moveUp();
						return st.CASES_RANGE_2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.CASES_RANGE_2:
					cell.markCasesRange = true;
					if(cell.getChar() === '/') {
						quadro.moveRight();
						return st.CASES_RANGE_UP;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CASES_RANGE_UP:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.CASES_RANGE_UP_2;
					} else {
						cell.markCasesRange = true;
						quadro.moveRight();
						return state;
					}
				case st.CASES_RANGE_UP_2:
					if(cell.getChar() === '/') {
						quadro.moveDown().moveRight();
						return st.CASES_SEPARATE_ROW;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.CASES_SEPARATE_ROW:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.CASES_SEPARATE_ROW_DRAW;
					} else if(cell.isWhitespace()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft();
						return st.CASES_SEPARATE_ROW_2;
					}
				case st.CASES_SEPARATE_ROW_2:
					if(cell.markCasesRange) {
						quadro.moveDown();
						return st.CASES_SEPARATE_ROW_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.CASES_SEPARATE_ROW_3:
					if(cell.getChar() === '\\') {
						quadro.moveUp();
						return st.CASES_MOVE_LEFT_UP;
					} else {
						quadro.moveRight();
						return st.CASES_SEPARATE_ROW;
					}
				case st.CASES_SEPARATE_ROW_DRAW:
					if(cell.markCasesRange) {
						quadro.moveDown();
						return st.CASES_SEPARATE_ROW_3;
					} else {
						cell.markCasesRowSeparator = true;
						quadro.moveLeft();
						return state;
					}
				case st.CASES_MOVE_LEFT_UP:
					if(cell.getChar() === '/') {
						quadro.moveDown().moveRight();
						return st.CASES_SCAN_FIRSTCOL;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CASES_SCAN_FIRSTCOL:
					if(cell.markCasesRange) {
						quadro.moveUp();
						return quadro.casesElements.length > 0 ?
								st.CASES_SCAN_CASES_BACK : st.CASES_SCAN_FIRSTCOL_BACK;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markReturn.push('CASES_FIRSTCOL');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() &&
							!cell.isProcessed() &&
							!cell.markSumSign &&
							!quadro.isCellBar() &&
							!quadro.isAccent()) {
						quadro.fracRootLabel = 'CASES_FIRSTCOL';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.CASES_SCAN_FIRSTCOL_BACK:
					if(cell.markCasesRange) {
						quadro.moveDown().moveRight();
						return st.CASES_SCAN_FIRSTCOL_BACK_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CASES_SCAN_FIRSTCOL_BACK_2:
					if(cell.isOutsideX()) {
						throw new Error('Invalid case');
					} else {
						return st.CASES_SCAN_FIRSTCOL;
					}
				case st.CASES_SCAN_CASES:
					if(cell.markCasesRange) {
						quadro.moveUp();
						return st.CASES_SCAN_CASES_BACK;
					} else if(quadro.isSumInt(1)) {
						quadro.moveDownIfNotMulti();
						quadro.get().markReturn.push('CASES_CASES');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() &&
							!cell.isProcessed() &&
							!cell.markSumSign &&
							!quadro.isCellBar() &&
							!quadro.isAccent()) {
						quadro.fracRootLabel = 'CASES_CASES';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.CASES_SCAN_CASES_BACK:
					if(cell.markCasesRange) {
						quadro.moveDown().moveRight();
						return st.CASES_SCAN_CASES_BACK_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.CASES_SCAN_CASES_BACK_2:
					if(cell.isOutsideX()) {
						quadro.addModel(new Cases(quadro.casesElements, quadro.casesCases));
						return st.ACCEPT;
					} else {
						return st.CASES_SCAN_CASES;
					}
				case st.FRET:
					switch(cell.markReturn.pop()) {
					case 'INIT':
						return st.ACCEPT;
					case 'SUB':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.pushModel(new Sub(v1, v2));
						quadro.clearStringBuilder();
						return st.FRET_SUB_FPOW;
					case 'POW_AFTER_SUB':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.pushModel(new PowAfterSub(v1, v2));
						quadro.clearStringBuilder();
						return st.FRET_POW_AFTER_SUB_RIGHT;
					case 'POW':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.pushModel(new Pow(v1, v2));
						quadro.clearStringBuilder();
						return st.FRET_POW_RIGHT;
					case 'FRAC1':
						quadro.moveDown();
						return st.FRET_FRAC1_1;
					case 'FRAC2':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.addModel(new Fraction(v1, v2));
						quadro.clearStringBuilder();
						quadro.moveUp();
						return st.FRET_FRAC2_1;
					case 'BINOMIAL':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.addModel(new Binomial(v1, v2));
						quadro.clearStringBuilder();
						quadro.moveUp();
						return st.FRET_FRAC2_1;
					case 'ROOTBASE':
						v1 = quadro.popModel();
						v2 = cell.markNumberOfRootV.pop();
						quadro.clearStringBuilder();
						if((quadro.lengthRootV = cell.markNumberOfRootV.length) > 0) {
							quadro.pushModel(new Root(v2, v1));
							cell.markReturn.push('ROOTBASE');
						} else {
							quadro.addModel(new Root(v2, v1));
						}
						return st.FRET_ROOT_BASE;
					case 'ROOT_N':
						return st.FRET_ROOT_NUM;
					case 'SUM_UP':
						return st.FRET_SUM_UP;
					case 'SUM_DOWN':
						v2 = quadro.popModel();
						v1 = quadro.popModel();
						quadro.addModel(new Sum(quadro.storeMathSign.pop(), v1, v2));
						quadro.clearStringBuilder();
						return st.FRET_SUM_DOWN;
					case 'MATRIX_FIRSTCOL':
						v1 = quadro.popModel();
						quadro.matrixElements[quadro.matrixRowCount++] = [v1];
						cell.markMatrixRowLine = true;
						return st.FRET_MATRIX_DRAW_ROW_LINE_FIRST;
					case 'MATRIX':
						v1 = quadro.popModel();
						if(!quadro.matrixElements[quadro.matrixRowCount]) {
							quadro.matrixElements[quadro.matrixRowCount] = [];
						}
						quadro.matrixElements[quadro.matrixRowCount++][quadro.matrixColCount] = v1;
						cell.markMatrixRowLineBase = true;
						return st.FRET_MATRIX_DRAW_ROW_LINE;
					case 'CASES_FIRSTCOL':
						v1 = quadro.popModel();
						quadro.casesElements.push(v1);
						quadro.moveDown();
						return st.CASES_SCAN_FIRSTCOL;
					case 'CASES_CASES':
						v1 = quadro.popModel();
						quadro.casesCases.push(v1);
						quadro.moveDown();
						return st.CASES_SCAN_CASES;
					case 'CMB':
						v2 = quadro.popModel();
						quadro.addModel(new Sub(new Printable("{}"), v2));
						quadro.clearStringBuilder();
						return st.FRET_CMB;
					default:
						opt.debuglog(cell.markReturn);
						throw new Error('Parse failed: maybe illegal input');
					}
				case st.FRET_SUB_FPOW:
					cell.markSubRet = true;
					return st.FRET_SUB_FPOW_2;
				case st.FRET_SUB_FPOW_2:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft();
						quadro.get().markPowRight = true;
						quadro.moveUp();
						return st.FRET_SUB_FPOW_3;
					}
				case st.FRET_SUB_FPOW_3:
					if(cell.markTemp) {
						cell.markProcessed();
						quadro.moveLeft();
						return st.FRET_SUB_FPOW_4;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_SUB_FPOW_4:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_SUB_FPOW_5;
					} else {
						cell.markProcessed();
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUB_FPOW_5:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft().moveDown();
						return st.FRET_SUB_FPOW_6;
					}
				case st.FRET_SUB_FPOW_6:
					if(cell.markPowRight) {
						cell.markPowRight = false;
						return st.FRET_SUB_FPOW_7;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_SUB_FPOW_7:
					if(cell.markSubRet) {
						quadro.moveUp();
						return st.FRET_SUB_FPOW_8;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUB_FPOW_8:
					quadro.moveUp();
					if(cell.markTemp) {
						cell.markSub = false;
						return st.FRET_SUB_FPOW_SCAN;
					} else {
						return state;
					}
				case st.FRET_SUB_FPOW_SCAN:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.isTraversed() ||
							cell.markTemp ||
							cell.markSumBase) {
						return st.FRET_SUB_FPOW_RET_DOWN;
					} else if(quadro.isMatrixByScanningUp() || quadro.isSumInt(-1)) {
						if(quadro.isSumInt(-1)) {
							quadro.moveUpIfNotMulti();
						} else {
							quadro.moveMatrixUp();
						}
						quadro.get().markReturn.push('POW_AFTER_SUB');
						quadro.clearStringBuilder();
						quadro.newModel();
						return st.FINIT;
					} else if(cell.isPrintable() && !quadro.isCellBar()) {
						quadro.fracRootLabel = 'POW_AFTER_SUB';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ABOVE;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_SUB_FPOW_RET_DOWN:
					if(cell.markSubRet) {
						cell.markSubRet = false;
						return st.FRET_SUB_RIGHT;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_SUB_RIGHT:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft().moveUp();
						return st.FRET_SUB_UP;
					}
				case st.FRET_SUB_UP:
					if(cell.markTemp) {
						cell.markProcessed();
						quadro.moveLeft();
						return st.FRET_SUB_DRAWPROC1;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_POW_AFTER_SUB_RIGHT:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft();
						quadro.get().markPowProcessed = true;
						quadro.moveDown();
						return st.FRET_POW_AFTER_SUB_DOWN;
					}
				case st.FRET_POW_AFTER_SUB_DOWN:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.markTemp) {
						cell.markProcessed();
						quadro.moveLeft();
						return st.FRET_SUB_DRAWPROC1;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_SUB_DRAWPROC1:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.isOutsideX()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_SUB_DRAWPROC2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUB_DRAWPROC2:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_SUB_DRAWPROC3;
					} else {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					}
				case st.FRET_SUB_DRAWPROC3:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.FRET_SUB_DRAWPROC4;
					} else {
						cell.markTemp = false;
						quadro.moveRight();
						return state;
					}
				case st.FRET_SUB_DRAWPROC4:
					if(!cell.isProcessed()) {
						quadro.moveLeft();
						return state;
					} else if(quadro.isMarkRootEndBelow()) {
						cell.markIgnoreSubPow = true;
						return st.FPRINTABLE_RET;
					} else {
						quadro.moveRight().get().markPow = true;
						return st.FPRINTABLE;
					}
				case st.FRET_POW_RIGHT:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						quadro.moveLeft().moveDown();
						return st.FRET_POW_DOWN;
					}
				case st.FRET_POW_DOWN:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.markTemp) {
						cell.markProcessed();
						quadro.moveLeft();
						return st.FRET_POW_DRAWPROC1;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_POW_DRAWPROC1:
					if(cell.isOutsideY()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_POW_DRAWPROC2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_POW_DRAWPROC2:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_POW_DRAWPROC3;
					} else {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					}
				case st.FRET_POW_DRAWPROC3:
					if(cell.isOutsideX()) {
						quadro.moveLeft();
						return st.FRET_POW_DRAWPROC4;
					} else {
						cell.markTemp = false;
						quadro.moveRight();
						return state;
					}
				case st.FRET_POW_DRAWPROC4:
					if(!cell.isProcessed()) {
						quadro.moveLeft();
						return state;
					} else if(quadro.isMarkRootEndBelow()) {
						cell.markIgnoreSubPow = true;
						return st.FPRINTABLE_RET;
					} else {
						quadro.moveRight();
						if(quadro.get().isWhitespace()) {
							quadro.get().markSub = true;
						}
						return st.FPRINTABLE;
					}
				case st.FRET_FRAC1_1:
					if((cell.getChar() === '-' || cell.markBinomialBorder) &&
							cell.isProcessed()) {
						return st.FRET_FRAC1_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_FRAC1_2:
					if(cell.markFraction) {
						quadro.moveDown();
						quadro.fractionOrBinomial = cell.markFraction;
						return st.DENO_SCAN;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_FRAC2_1:
					if((cell.getChar() === '-' || cell.markBinomialBorder) &&
							cell.isProcessed()) {
						return st.FRET_FRAC2_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_FRAC2_2:
					if(cell.isOutsideX()) {
						throw new Error('Parse failed: maybe illegal input');
					} else if(cell.markFraction) {
						cell.markFraction = false;
						quadro.moveRight();
						return st.FRET_FRAC2_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_FRAC2_3:
					if(cell.isProcessed()) {
						quadro.moveRight();
						return state;
					} else {
						return st.FRET_FRAC2_4;
					}
				case st.FRET_FRAC2_4:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveLeft();
						return st.FRET_FRAC2_5;
					} else {
						cell.markTemp = false;
						quadro.moveRight();
						return state;
					}
				case st.FRET_FRAC2_5:
					if(cell.isProcessed()) {
						if(quadro.isMarkRootEndBelow()) {
							cell.markIgnoreSubPow = true;
							return st.FPRINTABLE_RET;
						} else {
							quadro.moveRight();
							return st.FPRINTABLE;
						}
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_ROOT_DOWN:
					if(cell.markTemp) {
						return st.FRET_ROOT_BASE;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_ROOT_BASE:
					if((basedirc = quadro.scanRootBase('INITIAL'))) {
						basedirc -= 2;
						if(basedirc !== 0) {
							quadro.moveReturnStackHere(0, basedirc);
						}
						cell.markProcessed();
						cell.markSubPowProcessed = true;
						quadro.markRootSubPowProcessedLeft();
						return st.FRET_ROOT_BASE2;
					} else if((cell.markRoot || cell.markRootWall) &&
							!cell.markRootWallInner) {
						if(quadro.lengthRootV === 0) {
							quadro.moveRootToBase();
						}
						quadro.get().markProcessed();
						quadro.get().markSubPowProcessed = true;
						quadro.markRootSubPowProcessedLeft();
						return st.FRET_ROOT_BASE2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_ROOT_BASE2:
					if(quadro.isMarkRootEndBelow()) {
						cell.markProcessed();
						quadro.clearMarkRootEndBelow();
						if(!quadro.isMarkRootEndBelow()) {
							quadro.moveRight();
							return st.FPRINTABLE;
						} else if(quadro.isMarkRootEndProcessedBelow()) {
							return st.FPRINTABLE_RET;
						} else {
							return st.FPRINTABLE;
						}
					} else {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					}
				case st.FRET_ROOT_NUM:
					if(cell.markRoot || cell.markRootWall) {
						return st.FRET_ROOT_NUM2;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FRET_ROOT_NUM2:
					if(cell.markRoot) {
						if(quadro.moveToRootV()) {
							quadro.get().markRoot = 'MOVE';
							quadro.get().markProcessed();
						}
						quadro.flushBuilder();
						quadro.countRootWalls.unshift(quadro.popModel());
						return directSum(NEXT_ROOT, st.FPRINTABLE_DRAWTEMP);
					} else if(cell.getChar() === 'v' && cell.markRootWallInner) {
						quadro.countRootWalls.push(quadro.popModel());
						quadro.moveRight();
						return st.FPRINTABLE_V_COUNT;
					} else {
						quadro.moveLeft().moveDown();
						return state;
					}
				case st.FRET_SUM_UP:
					if(cell.markSumBase) {
						return st.FRET_SUM_UP_2;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_SUM_UP_2:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange ||
							cell.isProcessed()) {
						quadro.moveRight();
						return st.FRET_SUM_UP_SCANDOWN;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUM_UP_SCANDOWN:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator ||
							cell.isProcessed()) {
						quadro.moveUp();
						return st.FRET_SUM_UP_SCANDOWN_2;
					} else if(cell.isPrintable() && !cell.isTraversed()) {
						quadro.fracRootLabel = 'SUM_DOWN';
						quadro.fracRootGoto = st.FINIT;
						quadro.fracRootAction = function() {
							quadro.clearStringBuilder();
							quadro.newModel();
						}
						return st.CHECK_FRAC_ROOT_BELOW;
					} else {
						quadro.moveDown();
						return state;
					}
				case st.FRET_SUM_UP_SCANDOWN_2:
					if(cell.markSumBase) {
						quadro.moveRight();
						return st.FRET_SUM_UP_SCANDOWN_3;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_SUM_UP_SCANDOWN_3:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange ||
							(cell.isPrintable() && !cell.isTraversed()) ||
							getSumIntState(quadro)) {
						return st.FRET_SUM_UP_NODOWN;
					} else {
						quadro.moveDown();
						return st.FRET_SUM_UP_SCANDOWN;
					}
				case st.FRET_SUM_UP_NODOWN:
					v1 = quadro.popModel();
					quadro.addModel(new Sum(
							quadro.storeMathSign.pop(),
							v1,
							new Printable("")));
					quadro.clearStringBuilder();
					return st.FRET_SUM_DOWN_2;
				case st.FRET_SUM_DOWN:
					if(cell.markSumBase) {
						return st.FRET_SUM_DOWN_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_SUM_DOWN_2:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_LEFT) > 0 ||
							cell.markCasesRange) {
						quadro.moveRight();
						return st.FRET_SUM_DOWN_3;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUM_DOWN_3:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange) {
						quadro.moveLeft();
						return st.FRET_SUM_DOWN_4;
					} else {
						cell.markSumBase = false;
						quadro.moveRight();
						return state;
					}
				case st.FRET_SUM_DOWN_4:
					if(cell.isProcessed() || cell.isMarkStart()) {
						return st.FRET_SUM_DOWN_5;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_SUM_DOWN_5:
					if(cell.isOutsideX() ||
							(cell.markMatrixRange & MATRIX_RIGHT) > 0 ||
							cell.markCasesRange ||
							(cell.isPrintable() && !cell.isTraversed())) {
						return st.FPRINTABLE;
					} else if(!!(nxt = getSumIntState(quadro))) {
						return nxt;
					} else {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					}
				case st.FRET_MATRIX_DRAW_ROW_LINE_FIRST:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						return st.FRET_MATRIX_DRAW_ROW_LINE_FIRST_2;
					} else {
						quadro.moveRight();
						return state;
					}
				case st.FRET_MATRIX_DRAW_ROW_LINE_FIRST_2:
					if(cell.markMatrixRowLine) {
						quadro.moveDown();
						return st.MATRIX_SCAN_FIRSTCOL;
					} else {
						cell.markMatrixRowLine = true;
						quadro.moveLeft();
						return state;
					}
				case st.FRET_MATRIX_DRAW_ROW_LINE:
					if((cell.markMatrixRange & MATRIX_LEFT) > 0) {
						return st.FRET_MATRIX_DRAW_ROW_LINE_2;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_MATRIX_DRAW_ROW_LINE_2:
					if((cell.markMatrixRange & MATRIX_RIGHT) > 0) {
						return st.FRET_MATRIX_DRAW_ROW_LINE_3;
					} else {
						cell.markMatrixRowLine = true;
						quadro.moveRight();
						return state;
					}
				case st.FRET_MATRIX_DRAW_ROW_LINE_3:
					if(cell.markMatrixRowLineBase) {
						cell.markMatrixRowLineBase = false;
						quadro.moveDown();
						return st.MATRIX_SCAN;
					} else {
						quadro.moveLeft();
						return state;
					}
				case st.FRET_CMB:
					if(cell.markCmbTemp) {
						quadro.getCellLeft().markProcessed();
						return st.FRET_CMB_2;
					} else {
						quadro.moveUp();
						return state;
					}
				case st.FRET_CMB_2:
					if(cell.isOutsideX() ||
							cell.markMatrixRange ||
							cell.markCasesRange) {
						throw new Error('Invalid Formula');
					} else if(cell.isWhitespace()) {
						cell.markProcessed();
						quadro.moveRight();
						return state;
					} else {
						cell.markCmbTemp = true;
						return st.FRET_CMB_3;
					}
				case st.FRET_CMB_3:
					if(cell.isOutsideY() ||
							cell.markMatrixRowSeparator ||
							cell.markCasesRowSeparator) {
						quadro.moveUp();
						return st.FRET_CMB_4;
					} else {
						cell.markCmbBoundary = false;
						quadro.moveDown();
						return state;
					}
				case st.FRET_CMB_4:
					if(cell.markCmbTemp) {
						cell.markCmbTemp = false;
						return st.FPRINTABLE;
					} else {
						quadro.moveUp();
						return state;
					}
				default:
					throw new Error('Internal Error');
				}
			};
			return me;
		})();

		function Printable(str) {
			this.string = str;
		}
		Printable.prototype.toLaTeX = function() {
			return this.string;
		};
		function ConcatFormula(f1, f2) {
			if(!f1 || !f2) {
				throw new Error('Invalid Argument');
			}
			this.f1 = f1;
			this.f2 = f2;
		}
		ConcatFormula.prototype.toLaTeX = function() {
			var fl = this.f1.toLaTeX();
			if(fl === "") {
				return this.f2.toLaTeX();
			} else {
				return fl + " " + this.f2.toLaTeX();
			}
		};
		ConcatFormula.prototype.former = function() {
			return this.f1;
		};
		ConcatFormula.prototype.latter = function() {
			return this.f2;
		};
		ConcatFormula.prototype.toArray = function(array) {
			var arr = array || [];
			arr.unshift(this.f2);
			if(this.f1 instanceof ConcatFormula) {
				return this.f1.toArray(arr);
			} else {
				arr.unshift(this.f1);
				return arr;
			}
		};
		function GroupFormula(f1, f2OrParen, paren) {
			if(paren === void(0)) {
				this.f1 = f1;
				this.f2 = null;
				this.paren = f2OrParen;
			} else {
				this.f1 = f1;
				this.f2 = f2OrParen;
				this.paren = paren;
			}
		}
		GroupFormula.prototype.toLaTeX = function() {
			if(this.f2) {
				return ("{\\left" + this.paren[0] + " " + this.f1.toLaTeX() +
						"\\middle" + this.paren[1] + " " + this.f2.toLaTeX() +
						"\\right" + this.paren[2] + "}");
			} else {
				return ("{\\left" + this.paren[0] + " " + this.f1.toLaTeX() +
						"\\right" + this.paren[1] + "}");
			}
		};
		function Fraction(numerator, denominator) {
			this.numerator = numerator;
			this.denominator = denominator;
		}
		Fraction.prototype.toLaTeX = function() {
			return ("\\frac{" + this.numerator.toLaTeX() +
					"}{" + this.denominator.toLaTeX() + "}");
		};
		function Binomial(up, down) {
			this.up = up;
			this.down = down;
		}
		Binomial.prototype.toLaTeX = function() {
			return ("\\binom{" + this.up.toLaTeX() +
					"}{" + this.down.toLaTeX() + "}");
		};
		function Pow(value, pow) {
			this.value = value;
			this.pow = pow;
		}
		Pow.prototype.toLaTeX = function() {
			if(this.value instanceof ConcatFormula) {
				return (this.value.f1.toLaTeX() + "{" +
						this.value.f2.toLaTeX() + "^{" +
						this.pow.toLaTeX() + "}}");
			} else {
				return this.value.toLaTeX() + "^{" + this.pow.toLaTeX() + "}";
			}
		};
		function PowAfterSub(value, pow) {
			this.value = value;
			this.pow = pow;
		}
		PowAfterSub.prototype.toLaTeX = function() {
			if(!(this.value instanceof Sub)) {
				throw new Error('TeX output failed: maybe illegal input');
			} else if(opt.useVerticalBarAsDifference &&
					this.value.value instanceof GroupFormula &&
					this.value.value.paren[0] === "[" &&
					this.value.value.paren[1] === "]") {
				return ("{\\left. " +
						this.value.value.f1.toLaTeX() +
						"\\right| _{" + this.value.subs.toLaTeX() + "}" +
						"^{" + this.pow.toLaTeX() + "}");
			} else if(opt.useVerticalBarAsDifference &&
					this.value.value instanceof ConcatFormula &&
					this.value.value.latter() instanceof GroupFormula &&
					this.value.value.latter().paren[0] === "[" &&
					this.value.value.latter().paren[1] === "]") {
				return (this.value.value.former().toLaTeX() +
						"{\\left. " + this.value.value.latter().f1.toLaTeX() +
						"\\right|} _{" + this.value.subs.toLaTeX() + "}" +
						"^{" + this.pow.toLaTeX() + "}");
			} else {
				return (this.value.value.toLaTeX() +
						"_{" + this.value.subs.toLaTeX() + "}" +
						"^{" + this.pow.toLaTeX() + "}");
			}
		};
		function Sub(value, subs) {
			this.value = value;
			this.subs = subs;
		}
		Sub.prototype.toLaTeX = function() {
			if(this.value instanceof ConcatFormula) {
				return (this.value.f1.toLaTeX() + "{" +
						this.value.f2.toLaTeX() + "_{" +
						this.subs.toLaTeX() + "}}");
			} else {
				return this.value.toLaTeX() + "_{" + this.subs.toLaTeX() + "}";
			}
		};
		function Root(num, value) {
			this.num = num;
			this.value = value;
		}
		Root.prototype.toLaTeX = function() {
			var res,
				i;
			if(this.num) {
				res = "\\sqrt[" + this.num.toLaTeX() + "]{";
			} else {
				res = "\\sqrt{";
			}
			res += this.value.toLaTeX();
			res += "}";
			return res;
		};
		function Sum(mathsign, up, down) {
			if(!up) {
				throw new Error('TeX output failed: maybe illegal input');
			} else if(!down) {
				throw new Error('TeX output failed: maybe illegal input');
			}
			this.mathsign = mathsign;
			this.up = up;
			this.down = down;
		}
		Sum.prototype.toLaTeX = function() {
			var ul = this.up.toLaTeX(),
				dl = this.down.toLaTeX();
			if(ul === '' && dl === '') {
				return this.mathsign;
			} else if(ul === '') {
				return this.mathsign + "_{" + dl + "}";
			} else if(dl === '') {
				return this.mathsign + "^{" + ul + "}";
			} else {
				return this.mathsign + "_{" + dl + "}^{" + ul + "}";
			}
		};
		function Matrix(elements, type) {
			var i, cols = -1;
			for(i = 0; i < elements.length; i++) {
				if(cols < 0) {
					cols = elements[i].length;
				} else if(cols !== elements[i].length) {
					throw new Error('Invalid matrix');
				}
			}
			this.elements = elements;
			this.type = type;
		}
		Matrix.prototype.toLaTeX = function() {
			var i, j, res = '';
			res += '\\left';
			res += this.type.charAt(0);
			res += ' \\begin{array}{';
			for(i = 0; i < this.elements[0].length; i++) {
				res += 'c';
			}
			res += '} ';
			for(i = 0; i < this.elements.length; i++) {
				if(i > 0) {
					res += ' \\\\ ';
				}
				for(j = 0; j < this.elements[i].length; j++) {
					if(j > 0) {
						res += ' & ';
					}
					res += this.elements[i][j].toLaTeX();
				}
			}
			res += ' \\end{array} \\right';
			res += this.type.charAt(1);
			return res;
		};
		function Cases(elements, cases) {
			if(elements.length !== cases.length && cases.length > 0) {
				throw new Error('Invalid cases');
			}
			this.elements = elements;
			this.cases = cases;
		}
		Cases.prototype.toLaTeX = function() {
			var i, j, res = '';
			res += '\\left\\{ \\begin{array}{';
			res += this.cases.length > 0 ? 'll' : 'l';
			res += '} ';
			for(i = 0; i < this.elements.length; i++) {
				if(i > 0) {
					res += ' \\\\ ';
				}
				res += this.elements[i].toLaTeX();
				if(this.cases.length > 0) {
					res += ' & ';
					res += this.cases[i].toLaTeX();
				}
			}
			res += ' \\end{array} \\right.';
			return res;
		};
		function BoldMathJax(value) {
			this.value = value;
		}
		BoldMathJax.prototype.toLaTeX = function() {
			return "\\boldsymbol{" + this.value.toLaTeX() + "}";
		};
		function MathDecorate(value, decorator) {
			this.value = value;
			this.decorator = decorator;
		}
		MathDecorate.prototype.toLaTeX = function() {
			return this.decorator + "{" + this.value.toLaTeX() + "}";
		};

		var q, p, res = '';
		q = quadro(input);
		p = parseEngine(q, TRANSINIT);
		p();
		q.flushBuilder();
		if(opt.debug) {
			q.dumpModel();
		}
		res += '\\[\n';
		res += q.popModel().toLaTeX() + '\n';
		res += "\\]";
		return res;
	}

	if(!gl.Shiki) {
		gl.Shiki = {};
		gl.Shiki.parse = shiki;
	}

	// node.js
	if(typeof process !== 'undefined' && typeof require !== 'undefined') {
		exports.parse = shiki;
	}

	if(gl.window && gl.window.document) {
		// browser
		(function() {
			var opt,
				sp,
				i;
			function readConfig(opt) {
				var x,
					i;
				x = document.getElementsByTagName("script");
				for(i = 0; i < x.length; i++) {
					if(x[i].type === 'text/x-shiki-config') {
						opt = extend(opt, JSON.parse(x[i].text));
					}
				}
				return opt;
			}
			function replaceChildNode(node, text) {
				var result,
					divNode;
				result = Shiki.parse(text, opt);
				divNode = document.createElement("div");
				divNode.appendChild(document.createTextNode(result));
				node.parentNode.replaceChild(divNode, node);
			}
			opt = readConfig(defaultOptions);
			if(opt.mathrm) {
				sp = opt.mathrm.split(/,/);
				for(i = 0; i < sp.length; i++) {
					if(sp[i]) {
						mathSequence.push(sp[i], '\\mathrm{' + sp[i] + '}');
					}
				}
			}
			document.addEventListener("DOMContentLoaded", function(e) {
				var i,
					j,
					cls,
					text,
					result,
					divNodes,
					cNodes,
					scriptNodes;
				divNodes = document.getElementsByTagName("div");
				for(i = 0; i < divNodes.length; i++) {
					cls = divNodes[i].className.split(/[\x09\x0A\x0C\x0D\x20]+/);
					if(cls.indexOf(opt.className) >= 0) {
						cNodes = divNodes[i].childNodes;
						for(j = 0; j < cNodes.length; j++) {
							if(cNodes[j].nodeType === 8) {
								replaceChildNode(cNodes[j], cNodes[j].nodeValue);
							} else if(cNodes[j].nodeType === 3 &&
									cNodes[j].nodeValue.trim() !== '') {
								result = Shiki.parse(cNodes[j].nodeValue, opt);
								cNodes[j].nodeValue = result;
							}
						}
					}
				}
				scriptNodes = document.getElementsByTagName("script");
				for(i = 0; i < scriptNodes.length;) {
					if(scriptNodes[i].type === opt.scriptType) {
						replaceChildNode(scriptNodes[i], scriptNodes[i].text);
					} else {
						i++;
					}
				}
			});
			if(opt.url) {
				script = document.createElement('script');
				script.src = opt.url;
				document.head.appendChild(script);
			}
		})();
	}
})();
