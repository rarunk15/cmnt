function transferNode(xparsenode, domnode, doTranslate, translator) 
{
    if(xparsenode.type == "chardata") {
	var eng = xparsenode.value;
	if( doTranslate && eng.indexOf( "<" ) == -1 && translator ) {
	    //eng = translator.translate(eng, true, true);

	    // translate (skipping HTML entities)
	    var ret = "";
	    var len = eng.length;
	    var ampindex;
	    var idx = 0;
	    var lastindex = idx;
	    var txt = eng;
	    while( idx < len ) {
		ampindex = txt.indexOf( '&', idx );
		if( ampindex < 0 ) {
		    if( lastindex < len ) {
			// translate stuff from last processed index 
			if( lastindex == 0 )
			    ret += translator.translate(eng, true, true);
			else
			    ret += translator.translate(txt.substring(lastindex), true, true);
		    }
		    break;
		}

		var scolindex = txt.indexOf( ';', ampindex+1);
		if( scolindex > 0 ) {
		    // translate stuff before last processed index 
		    ret += translator.translate(txt.substring(lastindex,ampindex), true, true);

		    // copy entity as is
		    var entity = txt.substring(ampindex+1,scolindex);
		    if( entity == "lt" )
			ret += "<";
		    else if( entity == "gt" )
			ret += ">";
		    else if( entity == "amp" )
			ret += "&";
		    else if( entity == "quot" )
			ret += "\"";
		    else if( entity == "nbsp" )
			ret += "\xa0";

		    scolindex++;
		    //ret += txt.substring(ampindex,scolindex);
		    idx = scolindex;
		    lastindex = idx;
		}
		else {
		    // not really an entity continue searching
		    idx++;
		}
	    }
	    eng = ret;
	}
	if( eng == "" ) eng = "\xa0";
	var root = null;
	if( doTranslate )
	    root = Xparse(eng);
	if( root == null || translator == null ) {
	    domnode.appendChild(document.createTextNode(eng));
	}
	else {
	    var l = root.contents.length;
	    for(var i = 0; i < l; i++) {
		transferNode(root.contents[i],domnode,false,null);
	    }
	}
    }
    else if( xparsenode.type == "element" ) {
	var n = document.createElement(xparsenode.name);
	for( var attr in xparsenode.attributes )
	    n.setAttribute(attr, xparsenode.attributes[attr]);
	domnode.appendChild(n);
	if( n.tagName.toLowerCase() == "br" )
	    n = domnode;

	var nchildren = xparsenode.contents.length;
	for( var ch = 0; ch < nchildren; ch++ ) {
	    transferNode(xparsenode.contents[ch], n, doTranslate, translator);
	}
    }
}

function quotEnd(q, txt, idx, l) {
    var c;
    while(idx < l) {
	c = txt.charAt(idx);
	if( c == q )
	    return ++idx;
	idx++;
    }
    return idx;
}

function translateNodeContent(translator, txt) 
{
    if( !translator ) return txt;

    var re = /(&[a-zA-Z]+;)/;
    var re_ret;
    var ret = "";
    var tt;
    var done = false;
    while(!done) {
	re_ret = re.exec(txt);
	if(re_ret == null || re_ret.length != 2 )  {
	    tt = txt;
	    done = true;
	}
	else {
	    tt = txt.substring(0, re_ret.index);
	}
	if( translator )
	    ret += translator.translate(tt);
	else
	    ret += tt;
	if( re_ret && re_ret.length == 2 ) ret += re_ret[1];
	if( !done )
	    txt = txt.substring(re_ret.index+re_ret[1].length);
    }
    return ret;
}

function translateHTML(txt, translator)
{
    var idx = 0;
    var ts;
    var l = txt.length;
    var c;
    var ret = "";
    while(idx < l) {
	var qnest = 0;
	ts = txt.indexOf('<', idx);
	if( ts >= idx ) {
	    if( ts > idx )
		ret += translateNodeContent(translator,txt.substring(idx,ts));
	    idx = ts+1;
	    while( idx < l ) {
		c = txt.charAt(idx);
		if( c == '"' || c == '\'' )
		    idx = quotEnd(c, txt, ++idx, l);
		else if( c == '>' )
		    break;
		else
		    idx++;
	    }

	    if( idx < l ) {
		te = idx;
		ret += txt.substring(ts, te+1);
		idx++;
	    }
	    else {
		ret += txt.substring(ts);
	    }
	}
	else
	    break;
    }
    if( idx < l )
	ret += translateNodeContent(translator, txt.substring(idx));
    return ret;
}

function reverseTranslateNodeContentNonTamil(lang, txt)
{
    var l = txt.length;
    var idx = 0;
    var last = 0;
    var str = "";
    var last_is_consonant = false;
    var base;
    var always_anu = false;

    if( lang == "kannada" ) {
    	base = 0xc80;
	always_anu = true;
    }
    else if( lang == "telugu" ) {
    	base = 0xc00;
	always_anu = true;
    }
    else if( lang == "sanskrit" ) {
    	base = 0x900;
	always_anu = false;
    }

    while(idx < l ) {
	var c = txt.charCodeAt(idx);
	var next = 0;
	if( (idx+1) < l ) {
	    next = txt.charCodeAt(idx+1);
	}
	var ch = txt.charAt(idx);
	if( c >= base && c < (base+128) ) {
	    var n = c - base;
	    var nn = 0;
	    if( next > 0 )
		nn = next - base;

	    var tr = "";
	    if( n == 5 ) 
		tr = 'a';
	    else if( n == 6 ) 
		tr = 'A';
	    else if( n == 7 ) 
		tr = 'i';
	    else if( n == 8 ) 
		tr = 'I';
	    else if( n == 9 ) 
		tr = 'u';
	    else if( n == 0xa ) 
		tr = 'U';
	    else if( n == 0xb )
		tr = 'R.';
	    else if( n == 0xE ) 
		tr = 'e';
	    else if( n == 0xF ) 
		tr = 'E';
	    else if( n == 0x10 ) 
	    	tr = "ai";
	    else if( n == 0x12 ) 
		tr = "o";
	    else if( n == 0x13 ) 
		tr = "O";
	    else if( n == 0x14 ) 
		tr = "au";

	    if( n >= 0x15 && n <= 0x39 ) {
	    	/* another consonant */
		if( last_is_consonant ) {
		    str += "a";
		    last = "a";
		    last_is_consonant = false;
		}
	    }

	    if( n == 0x15 )
		tr = "k";
	    else if( n == 0x16 )
		tr = "kh";
	    else if( n == 0x17 )
		tr = "g";
	    else if( n == 0x18 )
		tr = "gh";
	    else if( n == 0x19 ) 
		tr = "#n";
	    else if( n == 0x1a ) 
		tr = "c";
	    else if( n == 0x1b ) 
		tr = "ch";
	    else if( n == 0x1c ) 
		tr = "j";
	    else if( n == 0x1d ) 
		tr = "jh";
	    else if( n == 0x1e ) 
		tr = "~n";
	    else if( n == 0x1f )
		tr = "T";
	    else if( n == 0x20 )
		tr = "Th";
	    else if( n == 0x21 )
		tr = "D";
	    else if( n == 0x22 )
		tr = "Dh";
	    else if( n == 0x23 )
		tr = "N";
	    else if ( n == 0x24 )
		tr = "t";
	    else if ( n == 0x25 )
		tr = "th";
	    else if ( n == 0x26 )
		tr = "d";
	    else if ( n == 0x27 )
		tr = "dh";
	    else if( n == 0x28 )
		tr = "n";
	    else if( n == 0x2a ) 
		tr = "p";
	    else if( n == 0x2b ) 
		tr = "ph";
	    else if( n == 0x2c ) 
		tr = "b";
	    else if( n == 0x2d ) 
		tr = "bh";
	    else if( n == 0x2e ) 
		tr = "m";
	    else if( n == 0x2f ) 
		tr = "y";
	    else if( n == 0x30 ) 
		tr = "r";
	    else if( n == 0x31 ) 
		tr  = "R";
	    else if (n == 0x32 ) 
		tr = "l";
	    else if (n == 0x33 ) 
		tr = "L";
	    else if (n == 0x34 ) 
		tr = "zh";
	    else if (n == 0x35 ) 
		tr = "v";
	    else if (n == 0x36 ) 
		tr = "S";
	    else if (n == 0x37 ) 
		tr = "sh";
	    else if (n == 0x38 ) 
		tr = "s";
	    else if (n == 0x39 ) 
		tr = "h";

	    var add = true;
	    if( n == 0x02 ) {	/* anuswara */
		if( nn == 0 )
		    tr = "m";
		else if( always_anu ) {
		    if( nn >= 0x15 && nn <= 0x18 )
			tr = "n";
		    else if( nn >= 0x1a && nn <= 0x1e )
			tr = "n";
		    else if( nn >= 0x1f && nn <= 0x22 )
			tr = "N";
		    else if( nn >= 0x24 && nn <= 0x27 )
			tr = "n";
		    else if( nn >= 0x2a && nn <= 0x2d )
			tr = "m";
		}
		else
		    tr = "M";
	    }
	    else if( nn == 0x3 ) 
		tr = "H";
	    else if( n == 0x3e )
		tr = "A";
	    else if( n == 0x3f )
		tr = "i";
	    else if( n == 0x40 )
		tr = "I";
	    else if( n == 0x41 )
		tr = "u";
	    else if( n == 0x42 )
		tr = "U";
	    else if( n == 0x43 )
		tr = "R.";
	    else if( n == 0x46 )
		tr = "e";
	    else if( n == 0x47 )
		tr = "E";
	    else if( n == 0x48 )
		tr = "ai";
	    else if( n == 0x4a )
		tr = "o";
	    else if( n == 0x4b )
		tr = "O";
	    else if( n == 0x4c )
		tr = "au";
	    else if( n == 0x4d ) {
		tr = last;
		add = false;
	    }
	    else {
		add = false;
	    }

	    if( n >= 0x15 && n <= 0x39 )
		last_is_consonant = true;
	    else
		last_is_consonant = false;
	    if( add )
		last += tr;
	    else
		last = tr;
	    if( n != 0x4d )
		str += tr;
	}
	else {
	    if( last_is_consonant ) {
		str += "a";
		last_is_consonant = false;
	    }
	
	    str += ch;
	    last = 0;
	    last_is_consonant = false;
	}
	idx++;
    }
    return str;
}

function reverseTranslateNodeContentTamil(txt)
{
    var l = txt.length;
    var idx = 0;
    var last = 0;
    var str = "";
    var last_is_consonant = false;
    while(idx < l ) {
	var c = txt.charCodeAt(idx);
	var next = 0;
	if( (idx+1) < l ) {
	    next = txt.charCodeAt(idx+1);
	}
	var ch = txt.charAt(idx);
	if( c >= 0x0b80 && c <= 0x0bff ) {
	    var n = c - 0x0b80;
	    var nn = 0;
	    if( next > 0 )
		nn = next - 0x0b80;

	    var tr = "";
	    if( n == 5 ) 
		tr = 'a';
	    else if( n == 6 ) 
		tr = 'A';
	    else if( n == 7 ) 
		tr = 'i';
	    else if( n == 8 ) 
		tr = 'I';
	    else if( n == 9 ) 
		tr = 'u';
	    else if( n == 0xa ) 
		tr = 'U';
	    else if( n == 0xE ) 
		tr = 'e';
	    else if( n == 0xF ) 
		tr = 'E';
	    else if( n == 0x10 ) 
	    	tr = "ai";
	    else if( n == 0x12 ) 
		tr = "o";
	    else if( n == 0x13 ) 
		tr = "O";
	    else if( n == 0x14 ) 
		tr = "au";

	    if( n >= 0x15 && n <= 0x39 ) {
	    	/* another consonant */
		if( last_is_consonant ) {
		    str += "a";
		    last = "a";
		    last_is_consonant = false;
		}
	    }

	    if( n == 0x15 )  {
		if( last == 0 || last == "k" || nn == 0x4d )
		    tr = "k";
		else
		    tr = "g";
	    }
	    else if( n == 0x19 )
		tr = "#n";
	    else if( n == 0x1a )  {
		if( last == "c" || nn == 0x4d )
		    tr = "c";
		else if( last == "~n" )
		    tr = "j";
		else
		    tr = "s";
	    }
	    else if( n == 0x1c ) 
		tr = "j";
	    else if( n == 0x1e ) 
		tr = "~n";
	    else if( n == 0x1f )  {
		if( last == 0 || last == "T" || nn == 0x4d )
		    tr = "T";
		else 
		    tr = "D";
	    }
	    else if( n == 0x23 )
		tr = "N";
	    else if ( n == 0x24 ) {
		if( last == 0 || last == "t" || nn == 0x4d ) 
		    tr = "t";
		else
		    tr = "d";
	    }
	    else if( n == 0x28 ) {
		if( last != 0 && nn != 0x4d )
		    tr = "^n";
		else
		    tr = "n";
	    }
	    else if( n == 0x29 )
		tr = "n";
	    else if( n == 0x2a ) {
		if( last == 0 || last == "p" || nn == 0x4d )
		    tr = "p";
		else 
		    tr = "b";
	    }
	    else if( n == 0x2e ) 
		tr = "m";
	    else if( n == 0x2f ) 
		tr = "y";
	    else if( n == 0x30 ) 
		tr = "r";
	    else if( n == 0x31 )  {
		if( last == "R" ) {
		    str = str.substring(0,str.length-1) + "T";
		    tr  = "R";
		}
		else
		    tr  = "R";
	    }
	    else if (n == 0x32 ) 
		tr = "l";
	    else if (n == 0x33 ) 
		tr = "L";
	    else if (n == 0x34 ) 
		tr = "zh";
	    else if (n == 0x35 ) 
		tr = "v";
	    else if (n == 0x37 ) 
		tr = "sh";
	    else if (n == 0x38 ) 
		tr = "s";
	    else if (n == 0x39 ) 
		tr = "h";

	    var add = true;
	    if( n == 0x3e )
		tr = "A";
	    else if( n == 0x3f )
		tr = "i";
	    else if( n == 0x40 )
		tr = "I";
	    else if( n == 0x41 )
		tr = "u";
	    else if( n == 0x42 )
		tr = "U";
	    else if( n == 0x46 )
		tr = "e";
	    else if( n == 0x47 )
		tr = "E";
	    else if( n == 0x48 )
		tr = "ai";
	    else if( n == 0x4a )
		tr = "o";
	    else if( n == 0x4b )
		tr = "O";
	    else if( n == 0x4c )
		tr = "au";
	    else if( n == 0x4d ) {
		tr = last;
		add = false;
	    }
	    else {
		add = false;
	    }

	    if( n >= 0x15 && n <= 0x39 )
		last_is_consonant = true;
	    else
		last_is_consonant = false;
	    if( add )
		last += tr;
	    else
		last = tr;
	    if( n != 0x4d )
		str += tr;
	}
	else {
	    if( last_is_consonant ) {
		str += "a";
		last_is_consonant = false;
	    }
	
	    str += ch;
	    last = 0;
	    last_is_consonant = false;
	}
	idx++;
    }
    return str;
}

function reverseTranslateHTML(lang, txt)
{
    var idx = 0;
    var ts;
    var l = txt.length;
    var c;
    var ret = "";
    var isTamil = (lang == "tamil");
    while(idx < l) {
	var qnest = 0;
	ts = txt.indexOf('<', idx);
	if( ts >= idx ) {
	    if( ts > idx ) 
		ret += ((isTamil) ? reverseTranslateNodeContentTamil(txt.substring(idx,ts)) :
			            reverseTranslateNodeContentNonTamil(lang,txt.substring(idx,ts)));
	    idx = ts+1;
	    while( idx < l ) {
		c = txt.charAt(idx);
		if( c == '"' || c == '\'' )
		    idx = quotEnd(c, txt, ++idx, l);
		else if( c == '>' )
		    break;
		else
		    idx++;
	    }

	    if( idx < l ) {
		te = idx;
		ret += txt.substring(ts, te+1);
		idx++;
	    }
	    else {
		ret += txt.substring(ts);
	    }
	}
	else
	    break;
    }
    if( idx < l )
	ret += ((isTamil) ? reverseTranslateNodeContentTamil(txt.substring(idx)):
			    reverseTranslateNodeContentNonTamil(lang,txt.substring(idx)));
    return ret;
}

function reverseTranslate(txt)
{
    txt = reverseTranslateHTML("tamil", txt);
    txt = reverseTranslateHTML("sanskrit", txt);
    txt = reverseTranslateHTML("kannada", txt);
    txt = reverseTranslateHTML("telugu", txt);
    return txt;
}

function textToDOM(txt, translator, parent) 
{
    txt = translateHTML(txt, translator);
    try
    {
	parent.innerHTML = txt;
    }
    catch(e) {
	alert("internal error: " + e );
    }
    return;
}

function textToDOMOld(txt, translator, parent) 
{
    var root = Xparse(txt);
    if( !root ) {
	var t = document.createTextNode("transliteration to" + translator.getLanguage() + " failed!");
	parent.appendChild(t);
	return;
    }
    var l = root.contents.length;
    for(var i = 0; i < l; i++) {
	transferNode(root.contents[i],parent,true,translator);
    }
}
/**
 * @class
 * represents a language specific term
 * @constructor
 * @param {String} name		the term name
 * @param {String[langName]}	(optional) values for different languages, 
 *				represented as an associative array, which 
 *				must contain an element whose index is 
 *				"default"). The values are to be in the 
 *				unified CM transliteration scheme. If this 
 *				parameter is not provided, default value 
 *				is set to the term name itself (which usually
 *				is not appropriate for any language)
 */
function LanguageSpecificTerm(name, langInfo) 
{
    /**
     * add a value for a particular language
     * @param {String} language		the language
     * @param {String} val		value for that language expressed using
     *					the unified CM transliteration scheme.
     */
    this.add = function(language, val) {
	language = language.toLowerCase();
	this.fLanguageInfo[language] = val;
    }

    /**
     * get the value for a particular language, expressed in unified CM 
     * transliteration scheme
     * @param {String} language		the language
     * @type String
     */
    this.getVal = function(language, nodefault) {
	language = language.toLowerCase();
	for (l in this.fLanguageInfo) {
	    if( l == language ) return this.fLanguageInfo[l];
	}
	if( nodefault) return "";
	return this.fLanguageInfo["default"];
    }

    /**
     * return the name of the term
     * @type String
     */
    this.name = function() { return this.fName; }

    /*
     * the name of the term
     * @type String
     * @private
     */
    this.fName = name;

    /**
     * information about values for various languages, which would include
     * a default value (element whose index  is "default")
     * @type String[langName]
     * @private
     */
    this.fLanguageInfo = new Array();

    this.fLanguageInfo["default"] = name;
    if( langInfo && langInfo.length ) {
	for(var i = 0; i < langInfo.length; i+=2 )
	    this.fLanguageInfo[langInfo[i]] = langInfo[i+1];
    }
}

/**
 * @class
 * represents a language
 * @constructor
 * @name	the language
 * @id		id of the HTML element that will contain the language specific
 *		rendition of the lyrics
 * @translator	the translator for translating unified CM transliteration scheme
 *		representation into the language
 * @editor	the editor object
 */
function Language(name, id, translator, editor)
{
    this.getTranslator = function() { return this.fTranslator; }

    this.getContent = function() { return this.fContent; }

    this.hideOptions = function() {
	if( this.fOptions ) this.fOptions.style.display = "none";
    }
    this.showOptions = function() {
	if( this.fOptions ) this.fOptions.style.display = "block";
    }

    /**
     * update and re-render the language specific rendition
     */
    this.update = function(txt, categories) {
	var t = "" + txt;
	if( !this.fContent ) return;
	t = this.replaceTerms(t,this.fName,categories);
	this.clear();
	textToDOM(t, this.fTranslator, this.fContent);
    }

    /**
     * show this language rendition
     */
    this.show = function() {
	if( !this.fDiv ) return;
	if( this.fVisible ) return;
	if(this.fDiv) {
	    this.fDiv.style.display = "block";
	    this.fVisible = true;
	}
	if( this.fTab )
	    this.fTab.className = "tab activeTab";
    }

    this.isVisible = function() { return this.fVisible; }

    this.clear = function() {
	if( !this.fContent ) return;
	while(this.fContent.firstChild)
	    this.fContent.removeChild(this.fContent.firstChild);
    }

    /**
     * hide this language rendition
     */
    this.hide = function() {
	if( !this.fDiv ) return;
	if( !this.fVisible ) return;
	if(this.fDiv) {
	    this.fDiv.style.display = "none";
	    this.fVisible = false;
	}
	if( this.fTab )
	    this.fTab.className = "tab";
    }

    this.trim = function(s) { return s.replace(/^\s+|\s+$/, ''); };

    this.replaceTerms = function(txt, lang, categories) {
	var re = /\<[ 	]*span([^>]*class="cmvar"[^>]*)>/;
	var re2 = /id[ 	]*=[ 	]*"([^"]*)"/;
	var ret = "";
	var term, termName;
	while(true) {
	    var re_ret = re.exec(txt);
	    if( re_ret == null || re_ret.length != 2 ) {
		break;
	    }

	    var re2_ret = re2.exec(re_ret[1]);
	    if( re2_ret != null && re2_ret.length == 2 ) {
		termName = re2_ret[1];
		term = this.findTerm(termName, categories);
		if( term != null ) {
		    ret += txt.substring(0,re_ret.index); 
		    if( lang.toLowerCase() == "english" ) {
			/* for english use the contents of the <span> node */
			var eng_re = /<[ 	]*span[^>]*class="cmvar"[^>]*>([^<]*)<\/span>/;
			var eng_re_ret = eng_re.exec(txt);
			if( eng_re_ret == null || eng_re_ret.length != 2 || this.trim(eng_re_ret[1]) == "" )
			    ret += term.getVal("default");
			else
			    ret += eng_re_ret[1];
		    }
		    else
			ret += term.getVal(lang);
		    idx = txt.indexOf( "span>", re_ret.index+1);
		    if( idx < 0 )  {
			txt = "";
			break;
		    }
		    txt = txt.substring(idx+5);
		    continue;
		}
	    }
	    ret += txt.substring(0,re_ret.index+1); 
	    txt = txt.substring(re_ret.index+1);
	}
	if( txt != "" ) 
	    ret += txt;
	return ret;
    }

    /**
     * language terms with language speciifc value
     */
    this.replaceTermsOLD = function(txt, lang, categories) {
	var ret = "";
	var idx = 0;
	var len = txt.length;
	var dolindex;
	while(idx < len) {
	    dolindex = txt.indexOf('$',idx);
	    if( dolindex < 0 )
		break;
	    else {
		var startIndex = dolindex;
		if( dolindex > idx )
		    ret += txt.substring(idx,dolindex);
		idx = dolindex;
		if( dolindex <= (len-1) ) {
		    var n = txt.charAt(++dolindex);
		    if( n != '$' ) {
			var termName = "";
			var nn = 0;
			while(true) {
			    if( (n >= 'a' && n <= 'z') || ( n >= 'A' && n <= 'Z') ||
				    (n >= '0' && n <= '1')) {
				termName += n;
			    }
			    else {
				nn = n;
				break;
			    }
			    ++dolindex;
			    if( dolindex == len ) break;
			    n = txt.charAt(dolindex);
			}
			var term = this.findTerm(termName, categories);

			// see if a defn
			if( nn == '=' && dolindex < len ) {
			    n = txt.charAt(++dolindex);
			    if( n == '(' ) {
				var e = txt.indexOf( ')', dolindex );
				if( e > dolindex ) {
				    var term = txt.substring(dolindex+1,e);
				    var termInfo = new LanguageSpecificTerm( "$$$" );
				    var valid = true;
				    var foundDefault = false;
				    var re   = /([a-zA-Z][a-zA-Z]:[^;][^;]*)/;
				    var re2   = /([a-zA-Z][a-zA-Z]):([^;][^;]*)/;
				    while(true) {
					var re_ret  = re.exec(term);
					if( !re_ret || re_ret.length != 2 )  {
					    valid = false;
					    break;
					}
					var re_ret2 = re2.exec(re_ret[1]);
					if( !re_ret2 || re_ret2.length != 3 )  {
					    valid = false;
					    break;
					}
					var l = re_ret2[1].toLowerCase();
					if( l == "df" || l == "default")  {
					    l = "default";
					    foundDefault = true;
					}
					else if( l == "sk" || l == "sanskrit" )
					    l = "sanskrit";
					else if( l == "tl" || l == "telugu" )
					    l = "telugu";
					else if( l == "kn" || l == "kannada" )
					    l = "kannada";
					else if( l == "tm" || l == "tamil" )
					    l = "tamil";
					else if( l == "ml" || l == "malayalam" )
					    l = "malayalam";
					else
					    l = null;
					if( l ) termInfo.add(l, re_ret2[2]);

					var nindex = re.lastIndex+re_ret[1].length;
					if( nindex >= term.length )
					    break;
					else if( term.charAt(nindex) == ';' ) nindex++;
					if( nindex >= term.length )
					    break;
					term = term.substring(nindex);
				    }
				    if( foundDefault ) {
					ret += termInfo.getVal(lang);
					idx = e+1;
					continue;
				    }
				}
			    }
			}
			if( term != null ) {
			    ret += term.getVal(lang);
			    idx = dolindex;
			    continue;
			}
		    }
		}
		ret += "$";
		idx++;
	    }
	}
	if( idx == 0 ) 
	    return txt;
	if( idx < len )
	    ret += txt.substring(idx);
	return ret;
    }

    this.findTerm = function(termName, categories) {
	var tn = termName.toLowerCase();
	if( categories == null ) return null;
	for( c in categories ) {
	    var terms = categories[c];
	    if( terms != null ) {
		for( t in terms ) {
		    if( t == tn )
			return terms[t];
		}
	    }
	}
	return null;
    }

    this.printableView = function(container) {
	this.fContent.parentNode.removeChild(this.fContent);
	if( !this.fVisible ) { 
	    this.fDiv.style.display = "block";
	}
	return this.fContent;
    }

    this.viewableView = function() {
	if( this.fContent.parentNode != this.fContentParent ) {
	    this.fContent.parentNode.removeChild(this.fContent);
	    this.fContentParent.appendChild(this.fContent);
	    if( !this.fVisible )
		this.fDiv.style.display = "none";
	}
    }

    /**
     * name of the language
     * @type String
     */
    this.name = function() { return this.fName; }

    this.fName       = name;	/* name of the language */
    this.fId         = id;	/* id of the div containing language specific portion */
    this.fDiv        = document.getElementById(id); /* the div elem */
    this.fParent     = null;	/* the parent fo the div elem */
    this.fOptions    = null;
    this.fContent    = this.fDiv;
    this.fContentParent = this.fParent;
    if( this.fDiv ) {
	this.fParent     = this.fDiv.parentNode;
	this.fContentParent = this.fParent;
	c = this.fDiv.firstChild;
	while(c) {
	    if( c.className && c.className == "langAreaContent" ) {
		this.fContent = c;
		this.fContentParent = c.parentNode;
		break;
	    }
	    c = c.nextSibling;
	}
    }
    this.fVisible    = false;	/* is the language specific portion initially visible */
    this.fTranslator = translator; /* the translator */
    this.fTab        = document.getElementById(id + "_tab");	/* the tab for language
    							specific portion */
    this.fEditor     = editor;	/* the editor */
}
