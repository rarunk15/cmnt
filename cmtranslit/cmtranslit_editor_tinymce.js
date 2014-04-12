var translit_base = "";
function isDefined(variable)
{
    return eval( '(typeof(' + variable + ') != "undefined");' );
}
if(isDefined('translBase')) translit_base = translBase;
function includeFile(file) {
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
}
function includeStyleSheet(file, media) {
    document.write('<link rel="stylesheet" type="text/css" media="' + media + '" href="' + file + '"/>');
}
includeFile( translit_base + "cmtranslit_base.js" );
includeFile( translit_base + "tamil.js" );
includeFile( translit_base + "kt.js" );
includeFile( translit_base + "english.js" );
includeFile( translit_base + "diacritics.js" );
includeFile( translit_base + "xparse.js" );
includeStyleSheet( translit_base + "tabs.css", "all" ); 
includeStyleSheet( translit_base + "cmtranslit_editor.css", "all" ); 


function CMTransliterationEditorDefn() 
{
    /**
     * initialize the editor. It is presumed that the HTML document contains 
     * the following
     * <ol>
     * <li>HTML elements (preferably divs) for various languages whose ids
     *     are sanskrit, tamil, telugu, malayalam and kannada.
     * <li>The form for defining/modifying variables whose id is "variableform"
     *     are sanskrit, tamil, telugu, malayalam and kannada. The form must
     *     be inside a div, whose id must be "variableformcontainer". The form
     *     must contain a label whose id is "variablenotdefined".
     * <li>A form for inserting new variables, whose id must be "insvariableform"
     * <li>That form should have a button whose id must be "insvariablebutton"
     * </ol>
     */
    this.init = function(containerid, bodyid) {
	this.transliterateContainerId = containerid;
	this.transliterateBodyId      = bodyid;

	var languages = this.languages;
	languages["sanskrit"]    = new Language("sanskrit", "sanskrit", 
					new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_SANSKRIT),
					this);
	languages["english"]    = new Language("english", "english", 
					new EnglishTranslator(),
					this);
	languages["telugu"]      = new Language("telugu", "telugu", 
					new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_TELUGU),
					this);
	languages["tamil"]       = new Language("tamil", "tamil", 
					new TamilTranslator(),this);
	languages["kannada"]     = new Language("kannada", "kannada", 
					new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_KANNADA),
					this);
	languages["malayalam"]   = new Language("malayalam", "malayalam", 
					new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_MALAYALAM),
					this);
	languages["sanskrit"].show();	// show sanskrit by default
    }

    this.showLanguage = function(l) {
	var o = this.languages[l];
	if( !o ) {
	    alert( "internal error");
	    return;
	}
	var myLangArea = null;
	for( var lang in this.languages ) {
	    if( lang != l )  
		this.languages[lang].hide();
	    else 
		myLang = this.languages[lang];
	}
	if( myLang ) myLang.show();
    }

    this.getCurLanguage = function() {
	for( var lang in this.languages ) {
	    if( this.languages[lang].isVisible() ) return lang;
	}
	return null;
    }


    /**
     * update , categories is an array of term categories, each of
     * which has an array of terms
     */
    this.update = function(txt, categories, sanskrit_anuswaradb) {
	var txt = reverseTranslate(txt);
	this.fText = "" + txt;
	this.fCategories = categories;
	for( var lang in this.languages ) {
	    if( lang.toLowerCase() == "sanskrit" ) {
		this.languages[lang].getTranslator().setAnuswaraDb(sanskrit_anuswaradb);
		this.languages[lang].update(txt, categories);
	    }
	    else
		this.languages[lang].update(txt, categories);
	}
    }

    /**
     * switch editor to screen viewable view
     */
    this.viewableView = function() {
	var body = document.getElementById(this.transliterateBodyId);
	if( !body ) return;
	for( var i in this.printOrder )
	    this.printOrder[i].viewableView();
	if( this.linkback != null ) {
	    this.linkback.parentNode.removeChild(this.linkback);
	    this.linkback= null;
	}
	this.printOrder = null;
	body.style.display = "block";
    }

    viewableView = function() { 
	if( this.editor ) 
	    this.editor.viewableView(); 
	this.editor = null;
    }

    this._toDokuWiki = function(n, ll, prevChar, pfxs, sfxs) {
	if(!pfxs) pfxs = "";
	if(!sfxs) sfxs = "";

	if( !prevChar ) prevChar = 0;
	if( n.nodeType == 3 ) {
	    return n.nodeValue;
	}
	else if( n.firstChild && n.tagName ) {
	    var pfx = "";
	    var sfx = "";

	    if( (n.tagName.toLowerCase() == "span" && n.style && 
	    		n.style.verticalAlign && n.style.verticalAlign.indexOf('super') >= 0) ||
			n.tagName.toLowerCase() == "sup" ) {
		if(pfxs.indexOf('\n') >= 0 || sfxs.indexOf('\n') >= 0 ) {
		    // if pfx or sfx has "\n", dont even mess with it
		    pfx = "";
		    sfx = "";
		}
		else {
		    // see if pfx/sfx contain bold, in which case we make subscript be under everything
		    // except bold. So we terminate all, turn on everything except bold, turn on
		    // superscript. Then after superscripted text, we turn off everything, and turn
		    // original prefixes off
		    var bp = pfxs.indexOf( "**");
		    var bs = sfxs.indexOf( "**");
		    var lpfx = "", lsfx = "";

		    if( bp >= 0 ) {
			lpfx = pfxs.replace( /\*\*/g, "" );
			lsfx = pfxs.replace( /\*\*/g, "" );
		    }
		    pfx = sfxs + lpfx + "<sup>";
		    sfx = "</sup>" + lsfx + pfxs;
		}
	    }
	    else if( n.tagName.toLowerCase() == "b" || n.tagName.toLowerCase() == "strong") {
		pfx = "**";
		sfx = "**";
	    }
	    else if( n.tagName.toLowerCase() == "i" || n.tagName.toLowerCase() == "em" ) {
		pfx = "//";
		sfx = "//";
	    }
	    else if( n.tagName.toLowerCase() == "u" ) {
		pfx = "__";
		sfx = "__";
	    }
	    //else if( n.tagName.toLowerCase() == "div" ) {
		//pfx = "";
		//sfx = "\n";
	    //}
	    else if( n.tagName.toLowerCase() == "p" ) {
		//pfx = "\n";
		//sfx = "\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "\n";
		sfx = "\n";
	    }
	    else if( n.tagName.toLowerCase() == "h5" ) {
		//pfx = "== ";
		//sfx = " ==\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "**";
		sfx = "**\n";
	    }
	    else if( n.tagName.toLowerCase() == "h4" ) {
		//pfx = "=== ";
		//sfx = " ===\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "**";
		sfx = "**\n";
	    }
	    else if( n.tagName.toLowerCase() == "h3" ) {
		//pfx = "==== ";
		//sfx = " ====\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "**";
		sfx = "**\n";
	    }
	    else if( n.tagName.toLowerCase() == "h2" ) {
		//pfx = "===== ";
		//sfx = " =====\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "**";
		sfx = "**\n";
	    }
	    else if( n.tagName.toLowerCase() == "h1" ) {
		//pfx = "====== ";
		//sfx = " ======\n";
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		pfx += "**";
		sfx = "**\n";
	    }
	    else if( n.tagName.toLowerCase() == "ol" || n.tagName.toLowerCase() == "ul" ) {
		var pfx = "";
		if( prevChar != "\n" ) pfx = "\n";
		sfx = "";
		if( !ll ) ll = 1;
		else      ll++;
	    }
	    else if( n.tagName.toLowerCase() == "li" ) {
		var pfx = "";
		sfx = "\n";
		for(var i = 0; i <= ll; i++ )
		    pfx += "  ";
		if( n.parentNode.tagName && n.parentNode.tagName.toLowerCase() == "ol" ) {
		    pfx += "- ";
		}
		if( n.parentNode.tagName && n.parentNode.tagName.toLowerCase() == "ul" ) {
		    pfx += "* ";
		}
	    }
	    else if( n.tagName.toLowerCase() == "hr" ) {
		var contents = "";
		if( prevChar != "\n" ) contents += "\n";
		contents += "=====\n";
		return contents;
	    }
	    else if( n.tagName.toLowerCase() == "br" ) {
		var contents = "";
		if( prevChar != "\n" ) contents += "\n";
		return contents;
	    }
	    else {
		pfx = "";
		sfx = "";
	    }



	    var mypfxs, mysfxs;
	    if(pfx.indexOf( "\n" ) >= 0 || sfx.indexOf("\n") >= 0 ) {
		mypfxs = "";
		mysfxs = "";
	    }
	    else {
		if(n.style && n.style.fontStyle && n.style.fontStyle.indexOf("italic") >= 0 ) {
		    pfx += "//";
		    sfx = "//" + sfx;
		}
		if(n.style && n.style.fontWeight && n.style.fontWeight.indexOf("bold") >= 0 ) {
		    pfx += "**";
		    sfx = "**" + sfx;
		}
		if(n.style && n.style.textDecoration && n.style.textDecoration.indexOf("underline") >= 0 ) {
		    pfx += "__";
		    sfx = "__" + sfx;
		}
		mypfxs = pfxs + pfx;
		mysfxs = sfx + sfxs;
	    }

	    var contents = pfx;
	    var c = n.firstChild;
	    while(c) {
		var ww = this._toDokuWiki(c, ll, prevChar, mypfxs, mysfxs);
		// empty as first child - ignore
		if( c != n.firstChild || !ww.match(/^[ 	]*$/) ) {
		    contents += ww;
		    if( contents != "" )
			prevChar = contents.charAt(contents.length-1);
		}
		c = c.nextSibling;
	    }
	    contents += sfx;
	    return contents;
	}
	else
	    return "";
    }

    this.exportAsDokuWiki = function() {
	var wiki = "";
	var prevChar = 0;
	for( var i in this.printOrder ) { 
	    wiki += this._toDokuWiki(this.printOrder[i].getContent(),'\n');
	    if( wiki != "" ) prevChar = wiki.charAt(wiki.length-1);
	    if( prevChar != "\n" ) wiki += "\n";
	    wiki += "\n";
	}

	// remove lines with just spaces in them
	var re1 = /[ 	]+\n/g;
	var fixed = wiki.replace(re1, "\n");

	var d = document.getElementById("ieformdiv");
	var f = document.getElementById("ieform");
	if( !d && !f ) return;
	f.textarea.value = fixed;
	d.style.display = "block";
	if( this.printOrder.length != 0 )
	    f.textarea.style.width = (this.printOrder[i].getContent().offsetWidth-20) + "px";

	for( i in this.printOrder ) {
	    this.setOpacity( this.printOrder[i].getContent(), 0.25 );
	}
    }

    exportAsDokuWiki = function() { 
	if( this.editor ) 
	    this.editor.exportAsDokuWiki(); 
    }

    this.dismissDokuWiki = function() {
	document.getElementById('ieformdiv').style.display='none';
	for( i in this.printOrder ) {
	    this.setOpacity( this.printOrder[i].getContent(), 1.0 );
	}
    }


    /**
     * set the opacity
     * @param {DOMElement} elem	the element whose opacity should be set
     * @param {float} 	val 	a value between 0 and 1.0
     */
    this.setOpacity = function(elem, val) {
	if( navigator.userAgent.toLowerCase().indexOf("safari") >= 0 && val >= 1.0)
	    val = 0.999999;
	if( document.all ) 	// IE
	    elem.style.filter = "alpha(opacity=" + parseInt(val*100) + ")";
	else
	    elem.style.opacity = val;
    }

    this.getLanguage = function(langName) {
	var l = langName.toLowerCase();
	for(var lang in this.languages) {
	    if( lang.toLowerCase() == l ) return this.languages[lang];
	}
	return null;
    }

    /**
     * switch editor to printable view
     */
    this.printableView = function(order) {
	//this.update(); ????
	var selLangName = this.getCurLanguage();
	var orderMap = new Object();
	this.printOrder = new Array();
	if( order ) {
	    for(i in order) {
		var langName;
		if(order[i] ) {
		    langName = order[i];
		    if(order[i].toLowerCase() == "<current>" )
			langName = selLangName;
		}
		if( langName && !orderMap[langName]) { 
		    this.printOrder[this.printOrder.length] = this.getLanguage(langName);
		    orderMap[langName] = true;
		}
	    }
	}
	if( this.printOrder.length == 0 ) {
	    alert("nothing to print!" );
	    return false;
	}
	var container = document.getElementById(this.transliterateContainerId);
	var body     = document.getElementById(this.transliterateBodyId);
	if( !body || !container ) return false;
	body.style.display = "none";

	this.linkback = document.createElement("div");
	this.linkback.className = "linkback";
	this.linkback.style.paddingBottom = "1em";
	this.linkback.setAttribute( "class", "linkback" );
	this.linkback.setAttribute( "className", "linkback" );

	var l = document.createElement("span");
	l.onclick = viewableView;
	l.editor  = this;
	l.href    = "#";
	l.className = "button";
	l.setAttribute( "class", "linkbackbutton" );
	l.setAttribute( "className", "linkbackbutton" );
	l.appendChild(document.createTextNode("Back"));
	this.linkback.appendChild(l);

	this.linkback.appendChild(document.createTextNode("\xa0\xa0"));

	var a = document.createElement("span");
	a.onclick = exportAsDokuWiki;
	a.editor  = this;
	a.href    = "#";
	a.className = "linkbackbutton";
	a.className = "linkbackbutton";
	a.setAttribute( "class", "linkbackbutton" );
	a.setAttribute( "className", "linkbackbutton" );
	a.appendChild(document.createTextNode("Export in DokuWiki format ..."));
	this.linkback.appendChild(a);

	container.appendChild(this.linkback);

	for( i in this.printOrder ) {
	    var content = this.printOrder[i].printableView();
	    container.appendChild(content);
	}
	return true;
    }

    this.replaceEntities = function(txt) {
	var ret = "";
	var len = txt.length;
	var ampindex;
	var idx = 0;
	while( idx < len ) {
	    ampindex = txt.indexOf( '&', idx );
	    if( ampindex < 0 ) break;

	    ret += txt.substring(idx,ampindex);

	    var scolindex = txt.indexOf( ';', ampindex+1);
	    if( scolindex > 0 ) {
		var entity = txt.substring(ampindex+1, scolindex);
		if( entity == "gt" ) 
		    ret += ">";
		else if( entity == "lt" ) 
		    ret += "<";
		else if( entity == "quot" ) 
		    ret += "\"";
		else if( entity == "nbsp" ) 
		    ret += " ";

		idx = scolindex+1;
	    }
	    else
	    {
		ret += "&";
		idx  = ampindex+1;
	    }
	}
	if( idx == 0 ) 
	    return txt;
	if( idx < len )
	    ret += txt.substring(idx);
	return ret;
    }

    this.setSanskritAnuswaraOption = function( anuswara, noerr ) {
	for( var lang in this.languages ) {
	    if( lang.toLowerCase() == "sanskrit" ) {
		var t = this.languages[lang].getTranslator();
		if( t && t.setSanskritAnuswaraOption(anuswara)) {
		    this.languages[lang].update(this.fText, this.fCategories);
		    return true;
		}
		else {
		    if( !noerr )
		       alert("internal error: failed to set anuswara option" );
		    return false;
		}
	    }
	}
	return false;
    }

    this.setEnglishRaw = function( raw, noerr ) {
	for( var lang in this.languages ) {
	    if( lang.toLowerCase() == "english" ) {
		var t = this.languages[lang].getTranslator();
		if( t && t.setAttribute((raw) ? "raw": "noraw")) {
		    this.languages[lang].update(this.fText, this.fCategories);
		    return true;
		}
		else {
		    if( !noerr )
		       alert("internal error: failed to set raw option" );
		    return false;
		}
	    }
	}
	return false;
    }

    this.setTamilGranthaSa = function( val, noerr ) {
	for( var lang in this.languages ) {
	    if( lang.toLowerCase() == "tamil" ) {
		var t = this.languages[lang].getTranslator();
		if( t ) {
		    t.setGranthaSaUsage(val);
		    this.languages[lang].update(this.fText, this.fCategories);
		    return true;
		}
	    }
	}
	return false;
    }


    this.setTamilQualScheme = function( tamilQualScheme, noerr ) {
	for( var lang in this.languages ) {
	    if( lang.toLowerCase() == "tamil" ) {
		var t = this.languages[lang].getTranslator();
		if( t && t.setQualScheme(tamilQualScheme)) {
		    this.languages[lang].update(this.fText, this.fCategories);
		    return true;
		}
		else {
		    if( !noerr )
		       alert("internal error: failed to set qual-scheme '" + tamilQualScheme + "'");
		    return false;
		}
	    }
	}
	return false;
    }

    this.createCookie = function(name,value,days) {
	    if (days) {
		    var date = new Date();
		    date.setTime(date.getTime()+(days*24*60*60*1000));
		    var expires = "; expires="+date.toGMTString();
	    }
	    else var expires = "";
	    document.cookie = name+"="+value+expires+"; path=/";
    }

    this.readCookie = function(name) {
	    var nameEQ = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0;i < ca.length;i++) {
		    var c = ca[i];
		    while (c.charAt(0)==' ') c = c.substring(1,c.length);
		    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	    }
	    return null;
    }

    this.eraseCookie = function(name) {
	    createCookie(name,"",-1);
    }


    this.languages             = new Array();
    this.transliterateContainerId   = null;
    this.transliterateBodyId        = null;
    this.fText                      = "";
    this.fCategories		    = null;

    /**
     * the anchor to link back from printable view to
     * viewable view
     */
    this.linkback = null;
    this.printOrder = null;
}

function newEditor() {
    var editor = new CMTransliterationEditorDefn();
    return editor;
}

function isIE() {
    var userAgent = navigator.userAgent.toLowerCase();
    if( userAgent.indexOf("msie") >= 0 ) {
	    return true;
	return false;
    }
}
function saveContents() {
    var userAgent = navigator.userAgent.toLowerCase();
    var doc = null;
    var cannotSave = false;
    try {
	doc = tinyMCE.getInstanceById('content').getDoc();
	if( !doc ) {
	    cannotSave = true;
	}
	else {
	    if( window.document.all ) {
		doc.execCommand('saveAs',null,"cmtranslit.txt");
	    }
	    else
		alert("not IE");
	}
    }
    catch(e) {
	cannotSave = true;
    }
    if(cannotSave)
	    alert( "internal error: Sorry, cannot save.\nYou can manually save by selecting the contents and copying to clipboard");
}

/**
*
*  AJAX IFRAME METHOD (AIM)
*  http://www.webtoolkit.info/
*
**/
AIM = {

    frame : function(c) {
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) == 'function') {
            i.onComplete = c.onComplete;
        }

        return n;
    },

    form : function(f, name) {
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
        AIM.form(f, AIM.frame(c));
        if (c && typeof(c.onStart) == 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
        var i = document.getElementById(id);
        if (i.contentDocument) {
            var d = i.contentDocument;
        } else if (i.contentWindow) {
            var d = i.contentWindow.document;
        } else {
            var d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }

}

function saveStart() {
    return true;
}

function saveComplete(response) {
    if( response.indexOf( "Error: cannot save" ) >= 0 ) {
	alert(response);
	return;
    }
}

function saveSubmit(form) {
    var contents = "";
    contents += form.content.value;
    contents = contents.replace( /^<\s*p\s*>\n{0,1}/gi, "" ); // starting p tag
    contents = contents.replace( /\n{0,1}<\s*br\s*>\n{0,1}/gi, "\n" );
    contents = contents.replace( /\n{0,1}<\s*br\s\/\s*>\n{0,1}/gi, "\n" );
    contents = contents.replace( /\n{0,1}<\s*p\s*>\n{0,1}/gi, "\n" );
    contents = contents.replace( /<\s*\/\s*p\s*>/gi, "" );
    if( !contents.match( /<\s*[a-zA-Z]*\s*\/{0,1}\s*>/ )) {
	form.plaintextcontent.value = contents;
    }
    else
	form.plaintextcontent.value = "";
    return AIM.submit(form, {'onStart' : saveStart, 'onComplete' : saveComplete});
}
