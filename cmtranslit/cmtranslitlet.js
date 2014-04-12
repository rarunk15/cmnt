// var codeBase = "/cmnt/";
var codeBase = "file:///C:/arun/java/svn/trunk/cmtranslit/";
function includeFile(file) {
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
}
var Language = new Object();
var languages = new Array();

var interactiveTranslitlets = new Array();

includeFile(codeBase + "cmtranslit_base.js" );
includeFile(codeBase + "kt.js" );
includeFile(codeBase + "tamil.js" );
includeFile(codeBase + "english.js" );
includeFile(codeBase + "diacritics.js" );

function trim(s) { return s.replace(/^\s+|\s+$/, '') }



function clone(obj) {
    if(typeof(obj) != 'object') return obj;
    if(obj == null) return obj;
    var newObj = new Object();
    for(var i in obj) {
	newObj[i] = clone(obj[i]);
    } 
    return newObj;
}

var _nTranslitlets = 0;

function processTranslitlets()
{
    if( !_nTranslitlets  ) {
	initTranslitletsSupport();
	var notationlets = new Array();
	renderTranslitlets(document.body, notationlets);
    }
}

function getTranslator(lang_spec)
{
    var re = /^(diacritics|english|tamil|sanskrit|kannada|telugu)(.*)$/i;
    var re_ret = re.exec(lang_spec);
    var translator = null;
    if( re_ret != null && re_ret.length > 1 ) {
	var dest_lang = re_ret[1].toLowerCase();
	var l = languages[dest_lang];
	if( l )
	    translator = clone(l);
	if( translator ) {
	    if( re_ret.length > 2 ) {
		var rest = trim(re_ret[2]);
		if( rest.indexOf(':') == 0 ) {
		    rest = rest.substr(1);
		    var attrs = rest.split(':');
		    for(var i = 0; i < attrs.length; i++ ) {
			var attr = trim(attrs[i].toLowerCase());
			if( attr != "" ) {
			    translator.setAttribute(attr);
			}
		    }
		}
	    }
	}
    }
    return translator;
}


function renderTranslitlets(p, results) 
{
    if( p.className ) {
	var re = /cmtranslitlet_(.*)$/i;
	var re_ret = re.exec(p.className);
	if( re_ret != null && re_ret.length > 1 ) {
	    _nTranslitlets++;
	    var r = re_ret[1].toLowerCase();
	    if( re_ret[1].indexOf( "auto:" ) == 0 ) {
		var auto_spec = re_ret[1].substr(5);
		var lang_split = auto_spec.split('/');
		if( lang_split != null ) {
		    var rawContent = "" + p.innerHTML;
		    var content = "";
		    for(var i = 0; i < lang_split.length; i++ ) {
			var translator = getTranslator(lang_split[i].toLowerCase());
			if( i != 0 ) content += "/";
			if( translator ) {
			    content += translateHTML(rawContent, translator);
			}
		    }
		    p.innerHTML = content;
		    return;
		}
	    }
	    else {
		var translator = getTranslator(re_ret[1]);
		if( translator ) {
		    var txt = p.innerHTML;
		    var transl_txt = translateHTML(txt, translator);
		    if( transl_txt != null ) {
			p.innerHTML = transl_txt;
			return;
		    }
		}
	    }
	}
    }
    if( p.firstChild) {
	var c = p.firstChild;
	while( c ) {
	    renderTranslitlets(c, results);
	    c = c.nextSibling;
	}
    }
}

function _findInteractiveTranslitlets(p) {
    if( p.className && p.className.match(/^cmtranslitlet$/i) ) {
	var o = new Object();
	o.obj = p;
	o.content = p.innerHTML;
	interactiveTranslitlets[interactiveTranslitlets.length] = o;
    }
    if( p.firstChild) {
	var c = p.firstChild;
	while( c ) {
	    _findInteractiveTranslitlets(c);
	    c = c.nextSibling;
	}
    }
}

function renderTranslitletsInLanguage(langSpec) {
    var translator = getTranslator(langSpec);

    if( interactiveTranslitlets.length == 0 ) {
	_findInteractiveTranslitlets(document.body);
    }
    for(var i = 0; i < interactiveTranslitlets.length; i++ ) {
	var o   = interactiveTranslitlets[i];
	if( o ) {
	    var p = o.obj;
	    var transl_txt = null;

	    if( translator )
		transl_txt = translateHTML(o.content, translator);
	    if( transl_txt != null )
		p.innerHTML = transl_txt;
	    else
		p.innerHTML = o.content;
	}
    }
}

function initTranslitletsSupport()
{
    languages["sanskrit"]   =  new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_SANSKRIT);
    languages["english"]    =  new EnglishTranslator();
    languages["telugu"]      = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_TELUGU);
    languages["tamil"]       = new TamilTranslator();
    languages["kannada"]     = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_KANNADA);
    languages["malayalam"]   = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_MALAYALAM);
    languages["diacritics"] = new DiacriticsTranslator();

    var id = document.getElementById("cmtranslit_choice");
    if( id != null ) {
	id.innerHTML = '<select id="__cmtranslit_choice" name="list" size="1" onchange="renderTranslitletsInLanguage(this.options[this.selectedIndex].value);">' +
			'<option value="english">English</option>' +
			'<option value="sanskrit">Sanskrit</option>' +
			'<option value="telugu">Telugu</option>' +
			'<option value="tamil:natural">Tamil</option>' +
			'<option value="kannada">Kannada</option>' + 
			'<option value="english:raw">Raw Transliteration Input</option>' +
			'</select>';
	id = document.getElementById("__cmtranslit_choice");
	if( id ) {
	    id.selectedIndex = 0;
	    renderTranslitletsInLanguage("english");
	}
    }
}


var __d = document.body;
if( !__d ) __d = document;
if (__d.attachEvent)
    __d.attachEvent("onreadystatechange", processTranslitlets )
else
    __d.addEventListener('readystatechange',processTranslitlets, false);
if( window.attachEvent )
    window.attachEvent("onload", processTranslitlets );
else
    window.addEventListener("load",processTranslitlets,false);
