function NonTamilBasicTranslator(language) {
    this.isPunctuation = function(c) { return ( c == '|' || c == ':' || c == '.' || c == ',' || c == '!' || c == ';' ); return b;}
    this.isWordEnd = function(c) { return ( c < 0 || c == ' ' || c == '\t' || this.isPunctuation(c) ); }
    this.UC = function(code) {
	return String.fromCharCode(code+this.fBaseAdj);
    }

    this.setAnuswaraDb = function(anuswaraDb) {
	this.fAnuswaraDb = anuswaraDb;
    }

    this.ANUSWARA_NEVER_STR       = "never";
    this.ANUSWARA_ALWAYS_STR      = "always";
    this.ANUSWARA_WHENFORCED_STR  = "forced";
    this.ANUSWARA_MIDSENTENCES_STR= "auto";
    this.ANUSWARA_ALLNASALS_STR   = 'allinclnasals';

    this.ANUSWARA_NEVER       = 0;
    this.ANUSWARA_ALWAYS      = 1;
    this.ANUSWARA_WHENFORCED  = 2;
    this.ANUSWARA_MIDSENTENCES= 3;
    this.ANUSWARA_ALLNASALS   = 4;

    /**
     * generic routine for setting attibutes
     */
    this.setAttribute = function(attr) {
	var attr = trim(attr.toLowerCase());
	if( attr.match( /[1-9][0-9]*[%]$/ ) )  {
	    this.setSuffixFontSize( attr );
	    return true;
	}
	else  {
	    // (for sanskrit only) anuswara_always, anuswara_never, anuswara_forced,anuswara_auto
	    if( attr.match(/^anuswara_.*$/) )
		return this.setSanskritAnuswaraOption(attr.substring(9));
	}
	return false;
    }

    this.setSuffixFontSize = function(sz) {
	this.SUFFIX_FONTSIZE = sz;
	this.SUFFIX_FONTSTYLE = "font-size: " + this.SUFFIX_FONTSIZE + ";";
    }

    this.setSanskritAnuswaraOption = function(binduAtEnd) {
	var valid = true;
	if( binduAtEnd == this.ANUSWARA_NEVER_STR ) {
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_NEVER;
	    this.fExplicitAnuswaraAllowed = false;
	}
	else if( binduAtEnd == this.ANUSWARA_ALWAYS_STR )
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_ALWAYS;
	else if( binduAtEnd == this.ANUSWARA_WHENFORCED_STR )
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_WHENFORCED;
	else if( binduAtEnd == this.ANUSWARA_MIDSENTENCES_STR )
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_MIDSENTENCES;
	else if( binduAtEnd == this.ANUSWARA_ALLNASALS_STR ) {
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_ALWAYS;
	    this.fUsesAnuswaraAtEnd    = this.ANUSWARA_ALWAYS;
	    this.fUsesAnuswaraInMiddle = true;
	}
	else {
	    valid = false;
	}
	return valid;
    }

    this.getLanguageName = function() {
	if( this.fLanguage == this.LANG_KANNADA ) 
	    return "kannada";
	else if( this.fLanguage == this.LANG_TELUGU ) 
	    return "telugu";
	else if( this.fLanguage == this.LANG_SANSKRIT ) 
	    return "sanskrit";
	else
	    return "malayalam";
    }

    this.isAnuswara = function(actual_code) { return (((actual_code - this.fLanguage) + this.LANG_KANNADA) == 0xc82); }
    this.isVisarga  = function(actual_code) { return (((actual_code - this.fLanguage) + this.LANG_KANNADA) == 0xc83); }

    this.fixAnuswarasFromDb = function(txt) {
	return txt;
	if( !this.fAnuswaraDb ) return txt;
	var ret = "";
	var s1, s2;
	var word;
	var idx = 0;
	var l = txt.length;
	var dbword;
	while(idx < l) {
	    s1 = txt.indexOf(' ', idx);
	    if( s1 < 0 || s1 > idx ) {
		s2 = txt.indexOf('\t', idx);
		if( s2 > 0 && s1 >= 0 && s2 < s1 ) s1 = s2;
	    }
	    if( s1 == idx ) {
		ret += ' ';
		idx++;
	    }
	    else {
		if( s1 >= 0 )
		    word = txt.substring(idx,s1);
		else
		    word = txt.substring(idx);

		var mword = this.convertForAnuswaraDbMatch(word);
		var match = this.fAnuswaraDb.find(mword);
		if( !match && mword.match(/a[mM]$/)) {
		    mword = mword.substring(0,mword.length-1);
		    match = this.fAnuswaraDb.find(mword);
		    if( match ) {
			mword += "m";
		    }
		}
		if( match )
		    ret += this.fixAnuswaraForForceMatch(mword);
		else
		    ret += this.removeAnuswarasOnNoMatch(word);
		if( s1 >= 0 )
		    idx = s1;
		else
		    idx = l+1;
	    }
	}
	return ret;
    }

    this.convertForAnuswaraDbMatch = function(word) {
	var re1 = /#?n([cjtd])/g;
	var re2 = /~?n([kg])/g;
	var re3 = /N([TD])/g;
	var re4 = /[mM]([pbky])/g;
	return word.replace(re1, "M$1").replace(re2,"M$1").replace(re3,"M$1").replace(re4,"M$1");
    }

    this.removeAnuswarasOnNoMatch = function(word) {
	var re1 = /M([cj])/g;
	var re2 = /M([kg])/g;
	var re3 = /M([TD])/g;
	var re4 = /M([pbky])/g;
	return word.replace(re1, "#n$1").replace(re2,"~n$1").replace(re3,"N$1").replace(re4,"m$1");
    }

    this.fixAnuswaraForForceMatch = function(word) {
	return word.replace(/M/,this.FORCED_ANUSWARA_CHAR);
    }

    /**
     * translate a (transliterated) english text to kannada
     * @param {String} eng		the transliterated english text
     * @param {boolean} isNative	is the actual language of the transliterated text 
     *					kannada?
     * @param {boolean} wordStart	does 'eng' start a new word?
     * @return a string containing kannada unicode text
     * @type String
     */
    this.translate= function(eng, isNative, wordStart) {
	if( eng == "" ) return eng;

	// treat R <=> R. when preceding AND succeeding a non-vowel
	// so kRpA kRshNa <=> kR.pa kR.shNa
	var re = /([kgcjTDNtdnpbmyrlvzhs])R([kgcjTDNtdnpbmyrlvszhs])/gi;
	eng = eng.replace(re,"$1R.$2");


	var res = "";
	var len = eng.length;
	var idx = 0;
	var c;
	var oncc = new Array(2);
	var last = null;
	eng = this.fixAnuswarasFromDb(eng);

	if( eval( '(typeof(' + wordStart + ') == "undefined");' ) )
	    wordStart = true;
	while( idx < len ) {
	    var vc = new Array(3), cc = new Array(3);
	    c = eng.charAt(idx);
	    if( c == ' ' || c == '\t' ) {
		res += ' ';
		wordStart = true;
		idx++;
		continue;
	    }
	    vc[0] = 0; vc[1] = 0; vc[2] = "";
	    var iidx = idx;

	    if( c == '.' && wordStart != true ) {
		var inWordMiddle = false;
		if( (idx+1) < len ) {
		    var nc =  eng.charAt(idx+1);
		    if( (nc >= 'a' && nc <= 'z') || (nc >= 'A' && nc <= 'Z'))
			inWordMiddle = true;
		}
		if( inWordMiddle ) {
		    if( language == this.LANG_SANSKRIT ) {
			res += this.UC(0xCBD);
			idx += 1;
		    }
		    else {
			// sanskrit avagraha - ignore (for now)
			// res += c;
			idx++;
		    }
		    continue;
		}
	    }

	    if( this.getVowelCode(c, eng, idx, len, isNative, vc, last)) {
		res += vc[1] + vc[2];
		idx += vc[0];
	    }
	    else if( this.getConsonantCode(c, eng, idx, len, isNative, wordStart, vc, last) ) {
		oncc[0] = 0; oncc[1] = 1;
		idx += vc[0];
		//if( this.isAnuswara(vc[1].charCodeAt(0)) && this.fLanguage == this.LANG_KANNADA ) {
		    //alert(idx + ":" + vc[0] );
		//}
		this.onConsonant(vc[1], eng, idx, len, oncc, last);
		idx += oncc[0];
		res += oncc[1];
		if( vc[2] && vc[2] != "" )  {
		    res += '<sup';
		    if( this.SUFFIX_FONTSTYLE && this.SUFFIX_FONTSTYLE != "" )
			res += ' style="' + this.SUFFIX_FONTSTYLE + '"';
		    res += '>';
		    res += vc[2] + '</sup>';
		}
	    }
	    else {
		res += c;
		idx++;
	    }
	    last = vc;
	    last[4] = eng.substring(idx,iidx);
	    wordStart = false;
	}
	if(res != "" && this.isAnuswara(res.charCodeAt(0)))
	    return "\u200d" + res;
	return res;
    }

    /**
     * if c (and what follows it together) is a vowel get its kannada unicode equiv
     * @param {char}    c	  the character to be tested
     * @param {String}  eng	  the string containing the char
     * @param {int}     idx	  the index of c in 'eng'
     * @param {int}     englen	  the length of 'eng'
     * @param {boolean} isNative  is the actual "source language"
     * @param {Array[3]} ret	  the return value. If c is a kannada vowel, ret[1] 
     *                            will contain the unicode char (string), and ret[2] could
     *				  contain any suffixes (string), and ret[1]  would
     *				  contains the # of english characters (inclusive
     *				  of c) which together map to the vowel. If not 
     *				  vowel, ret[0] will contain 0, and ret[1] will 
     *				  contain 0
     * @param {Array [4]} last	  the last character processed
     * @return true if vowel, false otherwise
     * @type boolean
     */
    this.getVowelCode = function(c, eng, idx, englen, isNative, ret, last) {
	ret[2] = "";	// no suffixes by default
	if( c == 'a' ) {
	    if( idx < englen ) {
		var nc = eng.charAt(idx+1);
		// ai
		if( nc == 'i' )       { ret[0] = 2; ret[1] = this.UC(0x0c90); return true;  }
		// au
		else if( nc == 'u' )  { ret[0] = 2; ret[1] = this.UC(0x0c94); return true;  }
	    }
	    ret[0] = 1; ret[1] = this.UC(0x0c85); return true;
	}
	else if( c == 'A' ) { 
	    ret[0] = 1; ret[1] = this.UC(0x0c86); return true; 
	}
	else if( c == 'i' ) { ret[0] = 1; ret[1] = this.UC(0x0c87); return true; }
	else if( c == 'I' ) { ret[0] = 1; ret[1] = this.UC(0x0c88); return true; }
	else if( c == 'u' ) { ret[0] = 1; ret[1] = this.UC(0x0c89); return true; }
	else if( c == 'U' ) { ret[0] = 1; ret[1] = this.UC(0x0c8a); return true; }
	else if (c == 'R' ) {
	    if( idx < englen ) {
		var nc = eng.charAt(idx+1);
		if( nc == '.' ) {
		    ret[0] = 2;
		    ret[1] = this.UC(0x0c8b);
		    return ret;
		}
	    }
	    ret[0] = 0; ret[1] = 0; return false;
	}
	// ?? vocalic L 8c 
	else if( c == 'e' ) { ret[0] = 1; ret[1] = this.UC(0x0c8e); return true; }
	else if( c == 'E' ) { ret[0] = 1; ret[1] = this.UC(0x0c8f); return true; }
	else if( c == 'o' ) { ret[0] = 1; ret[1] = this.UC(0x0c92); return true; }
	else if( c == 'O' ) { ret[0] = 1; ret[1] = this.UC(0x0c93); return true; }
	// NOte: vocalic RR, LL seems only in kannada and not in telugu
	// ?? vocalic RR (RU in baraha) e0
	// ?? vocalic LL e1
	else  {
	    ret[0] = 0; ret[1] = 0; return false;
	}
    }

    /**
     * if c (and what follows it together) is a consonant get its kannada unicode equiv
     * @param {char}    c	  the character to be tested
     * @param {String}  eng	  the string containing the char
     * @param {int}     idx	  the index of c in 'eng'
     * @param {int}     englen	  the length of 'eng'
     * @param {boolean} isNative  is the actual "source language"
     * @param {boolean} wordStart are we at the start of a word
     * @param {Array[3]} ret	  the return value. If c is a kannada consonant, ret[1] 
     *                            will contain the unicode char (string), and ret[2] could
     *				  contain any suffixes (string), and ret[1]  would
     *				  contains the # of english characters (inclusive
     *				  of c) which together map to the vowel. If not 
     *				  vowel, ret[0] will contain 0, and ret[1] will 
     *				  contain 0
     * @param {Array [4]} last	  the last character processed
     * @return true if consonant, false otherwise
     * @type boolean
     */
    this.getConsonantCode = function(c, eng, idx, englen, isNative, wordStart, ret, last) {
	ret[2] = "";	// no suffix
	var n = -1;
	if( idx < (englen-1) ) 
	    n = eng.charAt(idx+1);
	//if( (c == 's' || c == 'S')  ) {
	    //var s = eng.substring(idx, 3).toLowerCase();
	    //if( s == "ri" || s == "hri" ) {
		//else { ret[0] = 1; ret[1] = this.UC(0x0c95); return true; }
	    //}
	//}
	if( c == '~' ) {
	    if( n == 'n') {
		// ~n <=> ~ny is like ~nyAna (knowledge), but in
		// kannada/telugu/sanskrit it is written as "j" + 
		ret[0] = 2;
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    if( nn == 'y' ) {
			ret[0]++;
		    }
		}

		// determine if anuswara
		if( this.fUsesAnuswaraInMiddle && englen >= ret[0] ) {
		    var f = eng.charAt(idx+ret[0]);
		    if( f == 'c' || f == 'j' ) { ret[1] = this.UC(0x0c82); return true; }
		}
		ret[1] = this.UC(0x0c9e);
		return true;
	    }
	}
	else if( c == '#' && n == 'n' ) {
	    // force use - as in va#nmaya, a#n#anam (tamil)
	    //
	    // #n ==> just the consonant
	    ret[0] = 2;	// #n

	    // determine if anuswara
	    if( this.fUsesAnuswaraInMiddle && englen > (idx+1) ) {
		nn = eng.charAt(idx+2);
		if( nn == 'g' || nn == 'k' ) {
		    ret[1] = this.UC(0x0c82); return true;
		}
	    }
	    ret[1]=this.UC(0x0c99);return true;
	}
	if( c == 'k' || c == 'K' ) {
		if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0c96); return true; }
		else { ret[0] = 1; ret[1] = this.UC(0x0c95); return true; }
	}
	else if( c == 'g' || c == 'G' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0c98); return true; }
	    else { ret[0] = 1; ret[1] = this.UC(0x0c97); return true; }
	}
	else if( c == 'c' || c == 'C' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0c9b); return true; }
	    else { ret[0] = 1; ret[1] = this.UC(0x0c9a); return true; }
	}
	else if( c == 'j' || c == 'J' ) { 
	    if( this.fLanguage == this.LANG_MALAYALAM  ) {
		// malayalam is like tamizh in that j~n sound (as in j~nAna/j~nyAna as in knowledge
		// in kannada/telugu/sanskrit) is really ~nyAna (but needs additional quals)
		if( n == '~' ) {
		    var l = 2;
		    if( englen >= (idx+l) && eng.charAt(idx+l) == 'n') {
			l++;
			if( englen >= (idx+l) && eng.charAt(idx+l) == 'y')
			    l++;
			ret[0] = l;ret[1]=this.UC(0x0c9e);return true;
		    }
		}
	    }
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0c9d); return true; }
	    else { ret[0] = 1; ret[1] = this.UC(0x0c9c); return true; }
	}
	else if( c == 'T' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0ca0); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0c9f); return true; }
	}
	else if( c == 'D' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0ca2); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0ca1); return true; }
	}
	else if( c == 'N' || (c == '`' && n == 'N'))  { 
	    /*
	     * `N is same as N except to indicate anuswara. It's  expected use only for
	     * languages where not all NT and ND combinations require anuswara. It really
	     * should NOT be used for languages like telugu, kannada where ALL ND/NT combinations
	     * become anuswara. 
	     */
	    var l = 1;
	    if( n == '_' ) {
		l = 2;
		if( this.fLanguage == this.LANG_MALAYALAM ) {
		    // cillu
		    ret[0] = 2; ret[1] = "\u0d7a"; return ret;
		}
	    }
	    else if( c == '`' )  {
		l++;
		if( englen > (idx+1) )
		    n = eng.charAt(idx+2);
		else
		    n = 0;
	    }
	    if( (this.fUsesAnuswaraInMiddle || (c == '`' && this.fExplicitAnuswaraAllowed)) && (n == 'T' || n == 'D')) {
		// anuswara
		ret[0] = l; ret[1] = this.UC(0x0c82); return true;
	    }
	    ret[0] = l; ret[1] = this.UC(0x0ca3); return true; 
	}
	else if( c == 't' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0ca5); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0ca4); return true; }
	}
	else if( c == 'd' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0ca7); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0ca6); return true; }
	}
	else if( c == 'n' || (c == '^' && n == 'n') || (c == '`' && n == 'n'))  {
	    var mylen = 1;
	    /*
	     * note: ^n is tamizh "na" (as in nAmam), for us it is regular na
	     *
	     * `n is same as n, but is expected to be an anuswara. It should be
	     * used ONLY in languages (like sanskrit), where not all #n[kg], ~n[cj] 
	     * patterns etc. require anuswara. It should NOT be used in languages
	     * like kannada, telugu where ALL combinations require anuswara.
	     *
	     * The implication of such a recommended use is that sanskrit/malayalam 
	     * renditions will display anuswara ONLY for sanskrit/malayalam krithis 
	     * and only for those appprop words that a knowing user has flagged
	     * require anuswara. It can be argued that a telugu word sangItamu
	     * NEED NOT be rendered using anuswara in sanskrit/malayalam.
	     */
	    var next = n;
	    if( c == '^' || c == '`' ) {
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    next = nn;
		    mylen = 2;
		}
		else
		    next = 0;
	    }
	    else {	// c == 'n'
		// n_ is malayalam cillu, it is just na on others (for now)
		if( n == '_' ) {
		    mylen = 2;
		    if( this.fLanguage == this.LANG_MALAYALAM ) {
			// cillu
			ret[0] = 2; ret[1] = "\u0d7b"; return ret;
		    }
		    if( englen > (idx+1) ) {
			nn = eng.charAt(idx+2);
			next = nn;
		    }
		    else
			next = 0;
		}
		else if( n == '2' ) {
		    // n2 is same as ^n
		    mylen = 2;
		    if( englen > (idx+1) ) {
			nn = eng.charAt(idx+2);
			next = nn;
		    }
		    else
			next = 0;
		}
		else if( n == '.' ) {
		    if( englen > (idx+1) ) {
			nn = eng.charAt(idx+2);
			if( nn == 'd' || nn == 't' || nn == 'c' || nn == 'j' || nn == 'k' || nn == 'g' ) {
			    // force n.d/t/c/j/k/g to not become ng, nd etc. and not use bindu
			    ret[0] = 2; ret[1] = this.UC(0x0ca8); return true;
			}
		    }
		}
	    }
	    /*
	     * anuswara rules
	     * d, dh, t, th is same pentad
	     * c, ch, j, jh is becase n in nc/nch and nj/njh means ~n and becomes bindu because same pentad
	     * k, kh, g, gh is because n in nk/nkh and ng/ngh means #n and becomes bindu because same pentad
	     */
	    if( (this.fUsesAnuswaraInMiddle || (c == '`' && this.fExplicitAnuswaraAllowed)) && (next == 'd' || next == 't' || 
	    			   next == 'c' || next == 'j' || 
				   next == 'k' || next == 'g') ) {
		// anuswara.
		ret[0] = mylen; ret[1] = this.UC(0x0c82); return true; 
	    }
	    else { 
		if( next == 'g' || next == 'k' ) {
			// ng/nk => #n
		    ret[0] = mylen; ret[1] = this.UC(0x0c99); return true;  
		}
		else if( next == 'c' || next == 'j' ) {
			// nc/nj => ~n
		    ret[0] = mylen; ret[1] = this.UC(0x0c9e); return true;  
		}
		ret[0] = mylen; ret[1] = this.UC(0x0ca8); return true;  
	    }
	}
	else if( c == 'p' || c == 'P') { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0cab); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0caa); return true; }
	}
	else if( c == 'b' || c == 'B') { 
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0cad); return true; }
	    else                     { ret[0] = 1; ret[1] = this.UC(0x0cac); return true; }
	}
	else if( c == 'M' /*&& !wordStart*/ ) {	// TODO: this allows Mta at beginning to render (useful in swara editor)
	    // explicit anuswara
	    // M <=> anuswara forced by user

	    if( this.fExplicitAnuswaraAllowed) {
		ret[0] = 1;
		ret[1] = this.UC(0x0c82); 
		return true; 
	    }

	    if( this.fUsesAnuswaraInMiddle ) {
		if( !this.isWordEnd(n) || this.fUsesAnuswaraAtEnd != this.ANUSWARA_NEVER ) {
		    if( last != null && last[2] != null & last[2] != "") {	// following suffix, anuswara doesn work
			ret[0] = 1; ret[1] = this.UC(0x0cae); return true; 
		    }
		    ret[0] = 1; ret[1] = this.UC(0x0c82); return true; 
		}
		else {
		    ret[0] = 1; ret[1] = this.UC(0x0cae); return true; }
	    }
	    else {
		if( this.fUsesAnuswaraAtEnd != this.ANUSWARA_NEVER && this.isWordEnd(n)) {
		    // word end  anuswara
		    ret[0] = 1; ret[1] = this.UC(0x0c82); return true;
		}
		if( n == 'g' || n == 'G' || n == 'k' || n == 'K' ) {
		    // becomes #ng
		    ret[0] = 1; ret[1]=this.UC(0x0c99); return true;
		}
		else if( n == 'c' || n == 'C' || n == 'j' || n == 'J' ) {
		    // becomes ~n
		    ret[0] = 1; ret[1]=this.UC(0x0c9e); return true;
		}
		else if ( n == 'd' || n == 't' ) {
		    // becomes 'n'
		    ret[0] = 1; ret[1]=this.UC(0x0ca9); return true;
		}
		else if( n == 'T' || n == 'D' ) {
		    // becomes N
		    ret[0] = 1; ret[1]=this.UC(0x0ca3); return true;
		}
		ret[0] = 1; ret[1]=this.UC(0x0cae); return true;	// 'm'
	    }
	}
	else if( c == 'm' || (c == 'M' && wordStart) ) {
	    var possibleWordEndAnuswara = false;
	    if( c == 'M' && this.fUsesAnuswaraAtEnd != this.ANUSWARA_NEVER)
		possibleWordEndAnuswara = true;
	    else if( c == 'm' ) {
		if(this.fUsesAnuswaraAtEnd == this.ANUSWARA_ALWAYS)
		    possibleWordEndAnuswara = true;
		else if(this.fUsesAnuswaraAtEnd == this.ANUSWARA_MIDSENTENCES) {
		    var isMidSentence = false;
		    var isSentenceEnd = false;
		    var ii = idx+1;
		    var nc;
		    while(ii < englen) {
			nc = eng.charAt(ii);
			if( (nc >= 'a' && nc <= 'z' ) || (nc >= 'A' && nc <= 'Z') || nc == '#' || nc == '~' || nc == '^' ) {
			    isMidSentence = true;
			    break;
			}
			else if( nc == ' ' || nc == '\t' || nc == ',' )
			    ii++;
			else
			    break;
		    }
		    if( isMidSentence )
			possibleWordEndAnuswara =  true;
		}
	    }
	    if(possibleWordEndAnuswara && (!wordStart && this.isWordEnd(n)))  {
		// word-end => anuswara
		if( last != null && last[2] != null & last[2] != "") {	// following suffix, anuswara doesnt work
		    ret[0] = 1;
		    ret[1] = this.UC(0x0cae); return true; 
		}
		if( n < 0 ) // idx >= englen )
		    ret[0] = 2; 
		else 
		    ret[0] = 1;
		ret[1] = this.UC(0x0c82); return true; 
	    }
	    else {
		/*
		 * 'm' followed by p, ph, b, bh anuswara (same pentad).
		 * 'm' followed by s is anuswara 
		 * S, Sh, v, h are safe to always morph (as per Dr.Shrikaanth)
		 */
		if( this.fUsesAnuswaraInMiddle && (n == 'p' || n == 'b' || n == 's' || n == 'S' || n == 'h' || n == 'v')) {
		    // anuswara
		    ret[0] = 1; ret[1] = this.UC(0x0c82); return true; 
		}
		else if( n == 'm' ) {
		    if( this.fUsesAnuswaraInMiddle && (englen > (idx+1))) {
			// for mm at the end, dont make the last m anuswara - seems to be messed up.
			nn = eng.charAt(idx+2);
			if( this.isWordEnd(nn)) {
			    ret[0] = 3; ret[1] = this.UC(0x0cae)+this.UC(0x0ccd)+this.UC(0x0cae);
			    return ret;
			}
		    }
		}
		ret[0] = 1; ret[1] = this.UC(0x0cae); return true;
	    }
	}
	else if( c == 'y' || c == 'Y' ) { ret[0] = 1; ret[1] = this.UC(0x0caf); return true; }
	else if( c == 'r' )             { 
	    ret[0] = 1; ret[1] = this.UC(0x0cb0); 
	    if( this.fLanguage == this.LANG_MALAYALAM ) {
		if( n == 'k' ) 
		    ret[1] += this.UC(0x0c95);
		else if( n == 'c' ) 
		    ret[1] += this.UC(0x0c9a);
		else if( n == 'T' ) 
		    ret[1] += this.UC(0x0c9f);
		else if( n == 'N' ) 	// what about `N?
		    ret[1] += this.UC(0x0ca3);
		else if( n == 't' ) 
		    ret[1] += this.UC(0x0ca4);
		else if( n == 'n' ) 
		    ret[1] += this.UC(0x0ca8);
		else if( n == 'p' ) 
		    ret[1] += this.UC(0x0caa);
		else if( n == 'm' ) 
		    ret[1] += this.UC(0x0cae);
		else if( n == 'v' ) 
		    ret[1] += this.UC(0x0cb5);
	    }
	    return true; 
	}
	else if( c == 'R' )             { 
	    var l = 1;
	    if( n == '_' ) {
		if( this.fLanguage == this.LANG_MALAYALAM ) {
		    // cillu
		    ret[0] = 2; ret[1] = "\u0d7c"; return ret;
		}
		l = 2;
	    }
	    else if( n == 'R' ) {
		// RR (used in tamizh for TR sound) => TR
		ret[0] = l; ret[1] = this.UC(0x0c9f); return true; 
	    }
	    ret[0] = l; ret[1] = this.UC(0x0cb1); return true; 
	}
	else if( c == 'l' ) { 
	    var l = 1;
	    if( n == '_' ) {
		if( this.fLanguage == this.LANG_MALAYALAM ) {
		    // cillu
		    ret[0] = 2; ret[1] = "\u0d7d"; return ret;
		}
		l = 2;
	    }
	    ret[0] = l; ret[1] = this.UC(0x0cb2); 
	    if( this.fLanguage == this.LANG_MALAYALAM ) {
		// extra consonant for lk/lc/lT/lt/lp
		if( n == 'k' ) 
		    ret[1] += this.UC(0x0c95);
		else if( n == 'c' ) 
		    ret[1] += this.UC(0x0c9a);
		else if( n == 'T' ) 
		    ret[1] += this.UC(0x0c9f);
		else if( n == 't' ) 
		    ret[1] += this.UC(0x0ca4);
		else if( n == 'n' ) 
		    ret[1] += this.UC(0x0ca8);
		else if( n == 'p' ) 
		    ret[1] += this.UC(0x0caa);
	    }
	    return true; 
	}
	else if( c == 'L' )             { 
	    var l = 1;
	    if( n == '_' ) {
		if( this.fLanguage == this.LANG_MALAYALAM ) {
		    // cillu
		    ret[0] = 2; ret[1] = "\u0d7e"; return ret;
		}
		l = 2;
	    }
	    ret[0] = l; ret[1] = this.UC(0x0cb3);
	    if( this.fLanguage == this.LANG_MALAYALAM ) {
		// extra consonant for Lk/Lc/LT/Lt/Lp
		if( n == 'k' ) 
		    ret[1] += this.UC(0x0c95);
		else if( n == 'c' ) 
		    ret[1] += this.UC(0x0c9a);
		else if( n == 'T' ) 
		    ret[1] += this.UC(0x0c9f);
		else if( n == 't' ) 
		    ret[1] += this.UC(0x0ca4);
		else if( n == 'n' ) 
		    ret[1] += this.UC(0x0ca8);
		else if( n == 'p' ) 
		    ret[1] += this.UC(0x0caa);
	    }
	    return true;
	}
	else if( c == 'v' || c == 'w' ) { ret[0] = 1; ret[1] = this.UC(0x0cb5); return true; }
	else if( c == 's' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0cb7); return true; }	// sh
	    else if(n == '2' ) { ret[0] = 2; ret[1] = this.UC(0x0cb8); return true; }	// tamil 'sa'
	    else { ret[0] = 1; ret[1] = this.UC(0x0cb8); return true; }
	}
	else if( c == 'S' ) {
	    //if(n == 'r' || n == 'R') { ret[0] = 2; ret[1] = this.UC(0x0cb6)+this.UC(0x0ccd)+this.UC(0x0cb0); return true; }
	    if(n == 'r' ) { ret[0] = 2; ret[1] = this.UC(0x0cb6)+this.UC(0x0ccd)+this.UC(0x0cb0); return true; }
	    if(n == 'h') { ret[0] = 2; ret[1] = this.UC(0x0cb7); return true; }	// Sh
	    else { ret[0] = 1; ret[1] = this.UC(0x0cb6); return true; }
	}
	else if( c == 'h' ) { ret[0] = 1; ret[1] = this.UC(0x0cb9); return true; }
	else if( c == 'H' ) { // visarga
	    ret[0] = 1; ret[1] = this.UC(0x0c83); 
	    if( n == '2' ) ret[0] ++;
	    return true; 
	}	
	else if((c == 'f' || c == 'F') && this.fLanguage == this.LANG_KANNADA) { ret[0] = 1; ret[1] = this.UC(0x0cde); return true; }
	else if( c == 'z')  {
	    ret[0] = 1;
	    if(n == 'h') ret[0] = 2; 
	    if( this.fLanguage == this.LANG_KANNADA || this.fLanguage == this.LANG_TELUGU ) {
		ret[1] = this.UC(0x0cb3); 	// not sure if it exists in kannada/telugu!
		ret[2] = "1";
	    }
	    else
		ret[1] = this.UC(0x0cb4); 	// not sure if it exists in kannada/telugu!
	    return ret;
	}
	ret[0] = 0; return false;
    }

    this.onConsonant = function(uni, eng, idx, len, ret, last)  {
	// anuswara, visarga
	var uc = uni.charCodeAt(0);
	// malayalam cillakshara
	if( uc >= 0x0D7A && uc <= 0x0D7F ) { ret[0] = 0; ret[1] = uni; return ret; }
	if( this.isAnuswara(uc) || this.isVisarga(uc) ) { ret[0] = 0; ret[1] = uni; return ret; }

	var n ;
	if(idx >= len)
	    n = -1;
	else
	    n = eng.charAt(idx);

	var nn = -1;
	if( idx < len && (idx+1) < len )
	    nn = eng.charAt(idx+1);
	if( n == 'a' ) {
	    if( nn == 'i' || nn == 'I' ) { ret[0] = 2; ret[1] = uni + this.UC(0x0cc8); return ret; }
	    else if( nn == 'u' || nn == 'U' ) { ret[0] = 2; ret[1] = uni + this.UC(0x0ccc); return ret; }
	    else { ret[0] = 1; ret[1] = uni; return ret; }
	}
	else if( n == 'A' ) {
	    ret[0] = 1; ret[1] = uni + this.UC(0x0cbe); return ret;
	}
	else if( n == 'i' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cbf); return ret; }
	else if( n == 'I' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cc0); return ret; }
	else if( n == 'u' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cc1); return ret; }
	else if( n == 'U' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cc2); return ret; }
	else if (n == 'R' && nn == '.') { 
	    ret[0] = 2;
	    ret[1] = uni + this.UC(0x0cc3);
	}
	else if( n == 'e' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cc6); return ret; }
	else if( n == 'E' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cc7); return ret; }
	else if( n == 'o' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0cca); return ret; }
	else if( n == 'O' ) { ret[0] = 1; ret[1] = uni + this.UC(0x0ccb); return ret; }
	else { 
	    if( this.fLanguage == this.LANG_MALAYALAM && (n == -1 || this.isWordEnd(n)) ) {
		// N n l L r at end of word => use cillu forms by using ZWJ
		if( uc == 0xd32 || uc == 0xd28 || uc == 0xd30 || uc == 0xd32 || uc == 0xd33 ) {
		    // use cillu forms
		    ret[0] = 0; ret[1] = uni + this.UC(0x0ccd) + "\u200d"; return ret;
		}
	    }
	    ret[0] = 0; ret[1] = uni + this.UC(0x0ccd); return ret; }
    }

    /**
     * is passed in character a vowel?
     * @param {char} ch	the character
     * @type boolean
     */
    this.isVowel = function(ch) {
	var eng = "" + ch;
	var ret = new Array(2);
	return this.getVowelCode(ch, eng, 0, 1, true, ret);
    }

    this.fExplicitAnuswaraAllowed  = true;
    if( language == this.LANG_TELUGU ) {
	this.fBaseAdj = this.LANG_TELUGU - this.LANG_KANNADA;
	this.fLanguage = language;
	this.fUsesAnuswaraInMiddle       = true;
	this.fUsesAnuswaraAtEnd = this.ANUSWARA_ALWAYS;
    }
    else if( language == this.LANG_SANSKRIT ) {
	this.fBaseAdj = this.LANG_SANSKRIT - this.LANG_KANNADA;
	this.fLanguage = language;
	// no anuswaras unless forced by anuswara database
	this.fUsesAnuswaraInMiddle = false;
	this.fUsesAnuswaraAtEnd = this.ANUSWARA_MIDSENTENCES;
    }
    else if( language == this.LANG_MALAYALAM ) {
	this.fBaseAdj               = this.LANG_MALAYALAM - this.LANG_KANNADA;
	this.fLanguage              = language;
	this.fUsesAnuswaraInMiddle  = false;
	this.fUsesAnuswaraAtEnd     = this.ANUSWARA_ALWAYS; // this.ANUSWARA_NEVER;
    }
    else {
	this.fBaseAdj                    = 0;
	this.fLanguage                   = this.LANG_KANNADA;
	this.fUsesAnuswaraInMiddle       = true;
	this.fUsesAnuswaraAtEnd          = this.ANUSWARA_ALWAYS;
    }
    this.SUFFIX_FONTSIZE = "6pt";
    this.SUFFIX_FONTSTYLE = "font-size: " + this.SUFFIX_FONTSIZE + ";";
    this.fAnuswaraDb      = null;

    this.FORCED_ANUSWARA_CHAR	= 'Q';	// used internally by anuswara db
}

NonTamilBasicTranslator.prototype.LANG_KANNADA   = 0xC80;
NonTamilBasicTranslator.prototype.LANG_TELUGU    = 0xC00;
NonTamilBasicTranslator.prototype.LANG_SANSKRIT  = 0x900;
NonTamilBasicTranslator.prototype.LANG_MALAYALAM = 0xD00;
