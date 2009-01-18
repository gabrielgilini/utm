(function () {
// main namespace
var utm = function (s, c) { return new utm.Start(s, c); },
    undefined;

/**********************************************************
 ################ utm JavaScript Library ##################
 **********************************************************/
utm.version = 1;

/** Copyright (c) 2008 E. Myller (emyller.net)
 * utm is licensed under the LGPL license.
 *
 * Visit www.utmproject.org for more information.
 */

utm.Start = function (sel, context) {
/********************
 * utm Initializer
 ********************/
	if (sel && sel.__utm)
		return sel;
	else if (!sel)
		return;
	
	// enable the length property on the utm query set
	this.length = 0;
	
	// set the default context to the document object
	context = context || document;
	
	// handles css selector strings
	if (typeof sel == 'string') {
		context = utm(context)[0];
		if (!context)
			return;
		Array.prototype.push.apply(this, utm.grab(sel, context));
	}
	else
	
	// handles collections
	if (sel.length !== undefined)
		Array.prototype.push.apply(this, sel instanceof Array? sel : utm.array(sel));
	
	// handles DOM elements
	if (sel.nodeType) {
		this[0] = sel;
		this.length = 1;
	}
};

/**********************************
 * utm native static DOM methods
 **********************************/
utm.create = function (sel, text, attrs) {
//>> creates a new DOM element
	if (sel.__utm)
		return sel;
	
	attrs = attrs || {};
	var el,
	// parses the css selector
	type, step; while (sel) {
		type = sel.charAt(0);
		step = utm.grab.selectors.match[
			type = type == '#'? 'ID' :
			type == '.'? 'CLASS' :
			type == '['? 'ATTR' :
			'TAG'
		].exec(sel);
		// removes the processed part
		sel = sel.slice(step[0].length);
		
		// handles the new element
		type == 'TAG'?
			el = utm(document.createElement(step[1])) :
		type == 'ID'?
			attrs.id = step[1] :
		type == 'CLASS'?
			el.addClass(step[1]) :
		//type == 'ATTR'?
			attrs[step[1]] = step[4];
	}
	
	// adds the attributes
	el.attr(attrs);
	
	// add text
	el.text(text);
	
	return el;
};

utm.Start.prototype = {
/***********************************
 * utm native dynamic DOM methods
 ***********************************/
	// indicates that this object is an utm set
	__utm: true,
	
	merge: function () {
	//>> merges another utm sets into the current one
		for (var i = -1; arguments[++i];)
			this.push.apply(this, utm.array(utm(arguments[i])));
		return this;
	},
	
	push: function () {
	//>> pushes new items into the current utm set
		for (var i = -1; arguments[++i];) if (arguments[i].nodeType)
			Array.prototype.push.call(this, arguments[i]);
		return this;
	},
	
	filter: function (sel) {
	//>> performs an element filtering
		return utm(utm.grab.filter(sel, this));
	},
	
	all: function (sel) {
	//>> gets all elements inside the current
		for (var i = -1, els = utm(); this[++i];)
			els.merge
	},
	
	children: function (crit) {
	//>> looks for the children
		for (var i = -1, els = utm(); this[++i];) {
			var el = this[i].firstChild,
			    matches = crit? utm.grab.find(crit, this[i]) : undefined;
			while (el) {
				if (el.nodeType == 1 && (matches? utm.index(matches.set, el) > -1 : true))
					els.push(el);
				el = el.nextSibling;
			}
		}
		return els;
	},
	
	append: function (sel, text, attrs) {
	//>> appends elements into existing ones
		for (var i = -1; this[++i];)
			for (var i2 = -1, els = utm.create(sel, text, attrs).remove(); els[++i2];)
				this[i].appendChild(els[i2]);
		return els;
	},
	
	prepend: function (sel, text, attrs) {
	//>> prepends elements into existing ones
		for (var i = -1, first; this[++i];) {
			var els = utm.create(sel, text, attrs).remove();
			first = this[i].firstChild;
			while (first && first.nodeType != 1) first = first.nextSibling;
			for (var i2 = -1; els[++i2];) first?
				this[i].insertBefore(els[i2], first) :
				this[i].appendChild(els[i2]);
		}
		return els;
	},
	
	add: function (sel, text, attrs) {
	//>> appends elements into existing ones and stay in the parent
		return this.append(sel, text, attrs).parent();
	},
	
	appendTo: function (obj) {
	//>> appends created elements to existing ones
		utm(obj).append(this);
		return this;
	},
	
	before: function (sel, text, attrs) {
	//>> inserts elements before another one
		for (var i = -1; this[++i];)
			for (var i2 = -1, els = utm.create(sel, text, attrs).remove(); els[++i2];)
				this[i].parentNode.insertBefore(els[i2], this[i]);
		return els;
	},
	
	after: function (sel, text, attrs) {
	//>> inserts elements after another one
		for (var i = -1, next; this[++i], next = this[i];) {
			var els = utm.create(sel, text, attrs).remove();
			do next = next.nextSibling; while (next && next.nodeType != 1);
			for (var i2 = -1; els[++i2];) next?
				this[i].parentNode.insertBefore(els[i2], next) :
				this[i].parentNode.appendChild(els[i2]);
		}
		return els;
	},
	
	hasClass: function (cls) {
	//>> checks if the elements have a class name
		var valid = !!this[0];
		for (var i = -1; this[++i];)
			if ((' '+this[i].className+' ').indexOf(' '+cls+' ') < 0)
				valid = 0;
		return !!valid;
	},
	
	addClass: function (cls, overwrite) {
	//>> adds class names
		cls = String(cls).split(/\s*,\s*|\s+/);
		for (var i = -1; this[++i];) {
			if (overwrite) this[i].className = '';
			for (var i2 = -1; cls[++i2];)
				if ((' '+this[i].className+' ').indexOf(' '+cls[i2]+' ') < 0)
					this[i].className += (this[i].className? ' ' : '') + cls[i2];
		}
		return this;
	},
	
	rmClass: function (cls) {
	//>> removes class names
		var rcls = new RegExp('\\s+(?:'+String(cls).split(/\s*,\s*|\s+/).join('|')+')\\s+', 'g');
		for (var i = -1; this[++i];)
			this[i].className = utm.clean((' '+this[i].className+' ').replace(rcls, ' '));
		return this;
	},
	
	is: function (sel) {
	//>> check if this element match the criteria
		return !!sel && utm.grab.filter(sel, this).length > 0;
	},
	
	not: function (sel) {
	//>> check if this element doesn't match the criteria
		return !this.is(sel);
	},
	
	attr: function (name, value, style) {
		var attrs = name;
	//>> gets an attribute
		if (typeof name == 'string') {
			name = utm.attrName(name);
			if (value === undefined)
				return (
					style?
						this[0].style[name] ||
						(this[0].currentStyle?
							this[0].currentStyle[name] :
							this[0].ownerDocument.defaultView.getComputedStyle(this[0], null)[name]) :
						this[0].getAttribute(name) || this[0][name]
				);
			else {
				attrs = {};
				attrs[name] = value;
			}
		}
	//>> sets attributes
		for (var i = -1; this[++i];) for (var name in attrs)
			// set css properties
			style? this[i].style[utm.attrName(name)] = attrs[name] :
			// set common attributes
			       this[i].setAttribute(utm.attrName(name), attrs[name]);
		return this;
	},
	
	css: function (name, value) {
	//>> gets/sets style attributes
		return this.attr(name, value, true);
	},
	
	empty: function () {
	//>> removes every child node
		for (var i = -1; this[++i];)
		while (this[i].firstChild)
			this[i].removeChild(this[i].firstChild);
		return this;
	},
	
	text: function (text, add) {
	//>> gets text content
		if (text === undefined && this[0])
			return this[0].textContent || this[0].innerText || this[0].text;
		else {
	//>> sets text content
			if (!add)
				this.empty();
			for (var i = -1; this[++i];)
				this[i].appendChild(this[i].ownerDocument.createTextNode(String(text)));
			return this;
		}
	},
	
	val: function (val, add) {
	//>> gets value attribute
		if (val === undefined && this[0])
			return this[0].value || this[0].getAttribute('value');
		else {
	//>> sets value attribute
			for (var i = -1; this[++i];) {
				if (!add)
					this[i].value = '';
				this[i].value += String(val);
			}
			return this;
		}
	},
	
	remove: function (perm) {
	//>> removes elements from DOM tree and/or from the memory
		for (var i = -1; this[++i];) {
			if (this[i].parentNode)
				this[i].parentNode.removeChild(this[i]);
			if (perm) {
				delete this[i];
				this.length--;
			}
		}
		return this;
	},
	
	nav: function (direction, crit) {
	//>> walks dinamically in the DOM tree
		var el = this[0],
		    walk = 0;
		
		if (typeof crit == 'string')
			crit = utm.grab(crit);
		else if (crit == undefined)
			crit = 1;
		
		do {
			el =
				direction == 'parent'? el.parentNode :
				direction == 'prev'  ? el.previousSibling :
				direction == 'next'  ? el.nextSibling :
				direction == 'first' ? (el.firstChild && el.firstChild.nodeType != 1? el.firstChild.nextSibling : el.firstChild) :
				direction == 'last'  ? (el.lastChild && el.lastChild.nodeType != 1? el.lastChild.previousSibling : el.lastChild) :
				null;
			if (el && el.nodeType != 3)
				walk++;
		} while (
			el && (crit?
				// jump by numbers
				typeof crit == 'number'? walk < crit :
				// jump by element type
				utm.index(crit, el) < 0 :
				// or just go to the nearest element
				el.nodeType == 1)
		);
		return utm(el);
	},
	
	// shorcuts to .nav()
	parent: function (crit) {
		return this.nav('parent', crit);
	},
	prev: function (crit) {
		return this.nav('prev', crit);
	},
	next: function (crit) {
		return this.nav('next', crit);
	},
	first: function (crit) {
		return this.nav('first', crit);
	},
	last: function (crit) {
		return this.nav('last', crit);
	}
};

utm.append = function (sel, text, attrs) {
	return utm(document.getElementsByTagName('body')[0] || document).append(
		utm.create(sel, text, attrs)[0]
	);
};

utm.Class = function (chain, data) {
/********************
 * utm Class support
 ********************/
	if (!data)
		data = chain;
	else
		data.__extends = chain;
	
	// the "class" itself (constructor)
	var cls = data.__construct = typeof data.__construct == 'function'?
		data.__construct : function () {};
	delete data.__construct;
	
	// inheritance
	cls.prototype = data.__chain?
		typeof data.__chain == 'function'?
			data.__chain.prototype : data.__chain :
		{};
	delete data.__chain;
	
	// adds defined stuff
	for (var key in data)
		// static
		if (!key.indexOf('__'))
			cls[key.slice(2)] = data[key];
		// public
		else
			cls.prototype[key] = data[key];
	
	// force constructor property
	cls.prototype.constructor = cls;
	
	cls.__construct = cls;
	cls.__extend = function (data) {
		utm.extend(this.prototype, data);
		return this;
	};
	
	return cls;
};

utm.Animation = utm.Class({
/****************************
 * utm native visual effects
 ****************************/
 	__construct: function (els, prop, to, speed, options) {
		// get the elements
		els = utm(els);
		
		// parses the speed
		speed = utm.Animation.speed(speed);
		
		// handles options
		options = utm.extend({
			easing: 'linear'
		}, options || {});
		
		// is it dealing with colors?
		var color = /color|background/.test(prop);
		
		// set animation properties
		this.start = utm.now();
		this.speed = speed;
		this.target = els;
		
		
	},
	
	__speed: function (s) {
	//>> parses a given speed
		return (
			s == 'slowest'?       1   :
			s == 'slower'?        10  :
			s == 'slow'?          20  :
			s == 'fast'?          50  :
			s == 'faster'?        70  :
			s == 'fastest'?       100 :
			typeof s != 'number'? 30  :
			s < 1?                1   :
			s > 100?              100 :
			s
		);
	},
	
	at: function(p, fn) {
	//>> executes a function at some animation moment
		
	},
	play: function () {
		
	},
	pause: function () {
		
	},
	stop: function () {
		
	},
	finish: function () {
		
	},
	destroy: function () {
		
	}
});

/*******************
 * static utilities
 *******************/
utm.extend = function (obj, data) {
//>> extends some object
	for (var key in data)
		if (data.hasOwnProperty(key))
			obj[key] = data[key];
	return obj;
};

utm.trim = function (str) {
//>> removes trailing spaces from strings
	return (str || '').replace(/^\s+|\s+$/g, '');
};

utm.clean = function (str) {
//>> removes consecutive spaces on strings
	if (typeof str == 'string')
		return utm.trim(str).replace(/\s{2,}/g, ' ');
	else {
//>> removes repeated items from collections
		var array = [],
		    u = str.__utm;
		
		for (var i = 0, l = str.length; i < l; i++)
			if (utm.index(array, str[i]) < 0)
				array.push(str[i]);
		
		return u? utm(array) : array;
	}
};

utm.index = function (col, item) {
//>> universal indexOf
	if (col.indexOf)
		return col.indexOf(item);
	for (var i = 0, l = col.length; i < l; i++)
		if (col[i] === item)
			return i;
	return -1;
};

utm.shuffle = function (col) {
//>> shuffles a collection of items
	var u = col.__utm;
	
	if (!(col instanceof Array))
		col = utm.array(col);
	
	// protect the array from being overwritten
	col = col.slice();
	
	var array = [],
	    i;
	while(col[0])
		array.push(col.splice(Math.floor(Math.random() * col.length), 1)[0]);
	
	return u? utm(array) : array;
};

utm.array = function () {
//>> turns indexable objects into one array
	var array = [];
	for (var i = -1; arguments[++i];) {
		// it can be faster if we're handling an array
		if (arguments[i] instanceof Array)
			Array.prototype.push.apply(array, arguments[i]);
		else
		for (var i2 = i, l = arguments[i].length; i2 < l; i2++)
			array.push(arguments[i][i2]);
	}
	return array;
};

utm.camelCase = function (str) {
//>> sets a name into camel case
	return str.replace(/\W([a-z])/g, function (s, m) {
		return m.toUpperCase();
	});
};

utm.mult = function (str, n) {
//>> repeats a string n times
	return new Array(n + 1).join(str);
};

utm.percent = function (num, percent) {
//>> calculates a percentage
	return num * (percent / 100);
};

utm.now = function () {
//>> returns a timestamp
	return +new Date;
};

// some useful information of what we're dealing with
utm.support = {
	ielike: navigator.userAgent.indexOf('MSIE') > 0,
	opera: window.opera
};

// some specific attributes that need some attention
utm.fix = {
	'cellspacing': 'cellSpacing',
	'class': utm.support.ielike? 'className' : 'class',
	'for': 'htmlFor',
	'float': utm.support.ielike? 'styleFloat' : 'cssFloat',
	'maxlength': 'maxLength',
	'readonly': 'readOnly',
	'rowspan': 'rowSpan'
};

utm.attrName = function (str) {
	return utm.camelCase(utm.fix[str] || str);
};


/**********************************************************
 ############### Sizzle CSS Selector Engine ###############
 * Copyright 2009, John Resig (http://ejohn.org/)
 * released under the MIT License
 **********************************************************/
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]+\]|[^[\]]+)+\]|\\.|[^ >+~,(\[]+)+|[>+~])(\s*,\s*)?/g;

var done = 0;

var Sizzle = function(selector, context, results, seed) {
	var doCache = !results;
	results = results || [];
	context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 )
		return [];
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra;
	
	// Reset the position of the chunker regexp (start from head)
	chunker.lastIndex = 0;
	
	while ( (m = chunker.exec(selector)) !== null ) {
		parts.push( m[1] );
		
		if ( m[2] ) {
			extra = RegExp.rightContext;
			break;
		}
	}

	if ( parts.length > 1 && Expr.match.POS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			var later = "", match;

			// Position selectors must be done after the filter
			while ( (match = Expr.match.POS.exec( selector )) ) {
				later += match[0];
				selector = selector.replace( Expr.match.POS, "" );
			}

			set = Sizzle.filter( later, Sizzle( selector, context ) );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				var tmpSet = [];

				selector = parts.shift();
				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				for ( var i = 0, l = set.length; i < l; i++ ) {
					Sizzle( selector, set[i], tmpSet );
				}

				set = tmpSet;
			}
		}
	} else {
		var ret = seed ?
			{ expr: parts.pop(), set: makeArray(seed) } :
			Sizzle.find( parts.pop(), parts.length === 1 && context.parentNode ? context.parentNode : context );
		set = Sizzle.filter( ret.expr, ret.set );

		if ( parts.length > 0 ) {
			checkSet = makeArray(set);
		}

		while ( parts.length ) {
			var cur = parts.pop(), pop = cur;

			if ( !Expr.relative[ cur ] ) {
				cur = "";
			} else {
				pop = parts.pop();
			}

			if ( pop == null ) {
				pop = context;
			}

			Expr.relative[ cur ]( checkSet, pop );
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( checkSet instanceof Array ) {
		if ( context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, context, results );
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context){
	var set, match;

	if ( !expr ) {
		return [];
	}

	var later = "", match;

	// Pseudo-selectors could contain other selectors (like :not)
	while ( (match = Expr.match.PSEUDO.exec( expr )) ) {
		var left = RegExp.leftContext;

		if ( left.substr( left.length - 1 ) !== "\\" ) {
			later += match[0];
			expr = expr.replace( Expr.match.PSEUDO, "" );
		} else {
			// TODO: Need a better solution, fails: .class\:foo:realfoo(#id)
			break;
		}
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i];
		
		if ( (match = Expr.match[ type ].exec( expr )) ) {
			var left = RegExp.leftContext;

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	expr += later;

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace){
	var old = expr, result = [], curLoop = set, match;

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var anyFound = false, filter = Expr.filter[ type ], goodArray = null;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop );

					if ( match[0] === true ) {
						goodArray = [];
						var last = null, elem;
						for ( var i = 0; (elem = curLoop[i]) !== undefined; i++ ) {
							if ( elem && last !== elem ) {
								goodArray.push( elem );
								last = elem;
							}
						}
					}

				}

				var goodPos = 0, found, item;

				for ( var i = 0; (item = curLoop[i]) !== undefined; i++ ) {
					if ( item ) {
						if ( goodArray && item != goodArray[goodPos] ) {
							goodPos++;
						}

						found = filter( item, match, goodPos, goodArray );
						if ( inplace && found != null ) {
							curLoop[i] = found ? curLoop[i] : false;
							if ( found ) {
								anyFound = true;
							}
						} else if ( found ) {
							result.push( item );
							anyFound = true;
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}


		expr = expr.replace(/\s*,\s*/, "");

		// Improper expression
		if ( expr == old ) {
			throw "Syntax error, unrecognized expression: " + expr;
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u0128-\uFFFF_-]|\\.)+)/,
		CLASS: /\.((?:[\w\u0128-\uFFFF_-]|\\.)+)/,
		NAME: /\[name=((?:[\w\u0128-\uFFFF_-]|\\.)+)\]/,
		ATTR: /\[((?:[\w\u0128-\uFFFF_-]|\\.)+)\s*(?:(\S{0,1}=)\s*(['"]*)(.*?)\3|)\]/,
		TAG: /^((?:[\w\u0128-\uFFFF\*_-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child\(?(even|odd|[\dn+-]*)\)?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)\(?(\d*)\)?(?:[^-]|$)/,
		PSEUDO: /:((?:[\w\u0128-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	attrMap: {
		"class": "className"
	},
	relative: {
		"+": function(checkSet, part){
			for ( var i = 0, l = checkSet.length; i < l; i++ ) {
				var elem = checkSet[i];
				if ( elem ) {
					var cur = elem.previousSibling;
					while ( cur && cur.nodeType !== 1 ) {
						cur = cur.previousSibling;
					}
					checkSet[i] = typeof part === "string" ?
						cur || false :
						cur === part;
				}
			}

			if ( typeof part === "string" ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = typeof part === "string" ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( typeof part === "string" ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part){
			var doneName = "done" + (done++), checkFn = dirCheck;

			if ( !part.match(/\W/) ) {
				var nodeCheck = part = part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck);
		},
		"~": function(checkSet, part){
			var doneName = "done" + (done++), checkFn = dirCheck;

			if ( typeof part === "string" && !part.match(/\W/) ) {
				var nodeCheck = part = part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck);
		}
	},
	find: {
		ID: function(match, context){
			if ( context.getElementById ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			return context.getElementsByName(match[1]);
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match){
			return new RegExp( "(?:^|\\s)" + match[1] + "(?:\\s|$)" );
		},
		ID: function(match){
			return match[1];
		},
		TAG: function(match){
			return match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = "done" + (done++);

			return match;
		},
		ATTR: function(match){
			var name = match[1];
			
			if ( Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match){
			if ( match[1] === "not" ) {
				match[3] = match[3].split(/\s*,\s*/);
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		CHILD: function(elem, match){
			var type = match[1], parent = elem.parentNode;

			var doneName = match[0];
			
			if ( parent && !parent[ doneName ] ) {
				var count = 1;

				for ( var node = parent.firstChild; node; node = node.nextSibling ) {
					if ( node.nodeType == 1 ) {
						node.nodeIndex = count++;
					}
				}

				parent[ doneName ] = count - 1;
			}

			if ( type == "first" ) {
				return elem.nodeIndex == 1;
			} else if ( type == "last" ) {
				return elem.nodeIndex == parent[ doneName ];
			} else if ( type == "only" ) {
				return parent[ doneName ] == 1;
			} else if ( type == "nth" ) {
				var add = false, first = match[2], last = match[3];

				if ( first == 1 && last == 0 ) {
					return true;
				}

				if ( first == 0 ) {
					if ( elem.nodeIndex == last ) {
						add = true;
					}
				} else if ( (elem.nodeIndex - last) % first == 0 && (elem.nodeIndex - last) / first >= 0 ) {
					add = true;
				}

				return add;
			}
		},
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array )
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( Sizzle.filter(not[i], [elem]).length > 0 ) {
						return false;
					}
				}

				return true;
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return match.test( elem.className );
		},
		ATTR: function(elem, match){
			var result = elem[ match[1] ] || elem.getAttribute( match[1] ), value = result + "", type = match[2], check = match[4];
			return result == null ?
				false :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!match[4] ?
				result :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
try {
	Array.prototype.slice.call( document.documentElement.childNodes );

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( array instanceof Array ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("form"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<input name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context){
			if ( context.getElementById ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || m.getAttributeNode && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = elem.getAttributeNode && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
})();

// Check to see if the browser returns only elements
// when doing getElementsByTagName("*")
(function(){
	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle;
	
	Sizzle = function(query, context, extra){
		context = context || document;

		if ( context.nodeType === 9 ) {
			try {
				return makeArray( context.querySelectorAll(query) );
			} catch(e){}
		}
		
		return oldSizzle(query, context, extra);
	};

	Sizzle.find = oldSizzle.find;
	Sizzle.filter = oldSizzle.filter;
	Sizzle.selectors = oldSizzle.selectors;
})();

if ( document.documentElement.getElementsByClassName ) {
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context) {
		return context.getElementsByClassName(match[1]);
	};
}

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir]
			var match = false;

			while ( elem && elem.nodeType ) {
				var done = elem[doneName];
				if ( done ) {
					match = checkSet[ done ];
					break;
				}

				if ( elem.nodeType === 1 )
					elem[doneName] = i;

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir]
			var match = false;

			while ( elem && elem.nodeType ) {
				if ( elem[doneName] ) {
					match = checkSet[ elem[doneName] ];
					break;
				}

				if ( elem.nodeType === 1 ) {
					elem[doneName] = i;

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && a.contains(b);
};

// EXPOSE

utm.grab = Sizzle;

})();


// exposing utm to global scope
window.utm = window.u = utm;

})();