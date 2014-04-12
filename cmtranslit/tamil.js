function TamilTranslator(useSup, qualsAsSubscripts) {
    this.isPunctuation = function(c) { return ( c == '(' || c == ')' || c == '|' || c == ':' || c == '.' || c == ',' || c == '!' || c == ';' ); return b;}
    this.isWordEnd = function(c) { return ( c == 0 || c == ' ' || c == '\t' || c == '\r' || c == '\n' || this.isPunctuation(c) ); }
    this.getLanguageName = function() { return "tamizh"; }

    this.setQualScheme = function ( scheme ) {
	if( scheme == "natural" ) {
	    this.qualScheme = this.QUALSCHEME_NATURAL;
	    return true;
	}
	else if( scheme == "nohard" ) {
	    this.qualScheme = this.QUALSCHEME_NOHARD;
	    return true;
	}
	else if( scheme == "noqual" ) {
	    this.qualScheme = this.QUALSCHEME_NOQUAL;
	    return true;
	}
	else if( scheme == "always" ) {
	    this.qualScheme = this.QUALSCHEME_ALWAYS;
	    return true;
	}
	return false;
    }

    /**
     * common routine for setting attibutes
     */
    this.setAttribute = function(attr) {
	var attr = trim(attr.toLowerCase());
	if( attr == "noautona" )
	    this.autoSenseNa(true);
	else if( attr == "autona" )
	    this.setAutoSenseNa(true);
	else if( attr == "granthasa" )
	    this.setGranthaSaUsage(true);
	else if( attr == "nogranthasa" )
	    this.setGranthaSaUsage(false);
	else if( attr.match( /[1-9][0-9]*[%]$/ ) ) 
	    this.setSuffixFontSize( attr );
	else 
	    return this.setQualScheme(attr);
	return true;
    }

    this.dontAutoSenseNa = function() {
	this.autoSenseNa = false;
    }

    this.setAutoSenseNa = function(val) {
	this.autoSenseNa = val;
    }

    this.setGranthaSaUsage = function(use) {
	this.useGranthaSa = ((use) ? true: false);
    }

    this.getQualScheme = function() {
	if(this.qualScheme == this.QUALSCHEME_NATURAL) return "natural";
	if(this.qualScheme == this.QUALSCHEME_NOHARD ) return "nohard";
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) return "always";
	return "noqual";
    }

    this.setSuffixFontSize = function(sz) {
	this.SUFFIX_FONTSIZE = sz;
	//this.SUFFIX_FONTSTYLE = "font-size: " + this.SUFFIX_FONTSIZE + ";"
	this.SUFFIX_STYLE = 'style="display:inline;font-weight:normal;font-size: ' 
    		+ this.SUFFIX_FONTSIZE;
	if(qualsAsSubscripts)
	    this.SUFFIX_STYLE += ';vertical-align:sub;"';
	else
	    this.SUFFIX_STYLE += ';vertical-align:super;"';
    }

    /**
     * translate a (transliterated) english text to tamizh
     * @param {String} eng		the transliterated english text
     * @param {boolean} isNative	is the actual language of the transliterated text 
     *					tamizh?
     * @param {boolean} wordStart	does 'eng' start a new word?
     * @param {scheme}  scheme		(optional) set qual scheme for this translation (override)
     * @return a string containing tamizh unicode text
     * @type String
     */
    this.translate= function(eng, isNative, wordStart, scheme) {
	if( eng == "" ) return eng;

	var curScheme = this.qualScheme;
	if(scheme) {
	    this.setQualScheme(scheme);
	}

	// treat R <=> R. when preceding AND succeeding a non-vowel
	// so kRpA kRshNa <=> kR.pa kR.shNa
	var re = /([kgcjTDNtdnpbmyrlvzhs])R([kgcjTDNtdnpbmyrlvszhs])/gi;
	eng = eng.replace(re,"$1R.$2");

	var res = "";
	var len = eng.length;
	var idx = 0;
	var c;
	var oncc = new Array(2);
	var wordEnd = true;
	var last = null;
	while( idx < len ) {
	    var vc = new Array(3), cc = new Array(3);
	    c = eng.charAt(idx);
	    if( c == '.' && wordStart != true ) {
		var inWordMiddle = false;
		if( (idx+1) < len ) {
		    var nc =  eng.charAt(idx+1);
		    if( (nc >= 'a' && nc <= 'z') || (nc >= 'A' && nc <= 'Z'))
			inWordMiddle = true;
		}
		if( inWordMiddle ) {
		    // sanskrit avagraha symbol - ignore (for now)
		    idx++;
		    continue;
		}
	    }
	    if( this.isWordEnd(c) ) {
		wordEnd = true;
	    	res += c;
		idx++;
		continue;
	    }
	    else {
		if( wordEnd ) {
		    wordStart = true;
		    wordEnd = false;
		}
		else {
		    wordStart = false;
		    wordEnd = false;
		}
	    }

	    //if( c == ' ' || c == '\t' ) {
		//res += c;
		//wordStart = true;
		//idx++;
		//continue;
	    //}
	    vc[0] = 0; vc[1] = 0; vc[2] = "";
	    var iidx = idx;
	    if( this.getVowelCode(c, eng, idx, len, isNative, vc, last)) {
		res += vc[1] + vc[2];
		idx += vc[0];
	    }
	    else if( this.getConsonantCode(c, eng, idx, len, isNative, wordStart, vc, last) ) {
		oncc[0] = 0; oncc[1] = 1;
		idx += vc[0];
		this.onConsonant(vc[1], eng, idx, len, oncc);
		idx += oncc[0];
		res += oncc[1];
		if( vc[2] == "" && oncc[2] != "" ) {
		    vc[2] = oncc[2];
		    oncc[2] = "";
		}	
		// if pure-consonant
		if( oncc[1] != "" && oncc[1].charAt(oncc[1].length-1) == "\u0bcd" ) {
		    if( vc[2] == this.KA_SUFFIX || vc[2] == this.CA_SUFFIX || 
		    	vc[2] == this.TA_SUFFIX || vc[2] == this.tA_SUFFIX || vc[2] == this.PA_SUFFIX ) {
			vc[2] = "";
		    }
		    else if( !vc[2] || vc[2] == "" ) {
			// a "soft" mei which was not already qualified
			var ch = eng.substring(iidx,idx).charAt(0);
			if( ch == 'g' ) 
			    vc[2] = this.GA_SUFFIX;
			else if( ch == 'b' ) 
			    vc[2] = this.BA_SUFFIX;
			else if( ch == 'd' ) 
			    vc[2] = this.dA_SUFFIX;
			else if( ch == 'D' ) 
			    vc[2] = this.DA_SUFFIX;
		    }
		}
		if( this.qualScheme != this.QUALSCHEME_NOQUAL && (vc[2] && vc[2] != ""))  {
		    res += '<' + this.SUFFIX_TAG;
		    if( this.SUFFIX_STYLE && this.SUFFIX_STYLE != "" )
			res += ' ' + this.SUFFIX_STYLE;
		    res += '>';
		    res += vc[2] + '</' + this.SUFFIX_TAG + '>';
		}
		vc[1] = oncc[1];
	    }
	    else {
		res += c;
		idx++;
	    }
	    last = vc;
	    last[4] = eng.substring(idx,iidx);
	    wordStart = false;
	}
	this.qualScheme = curScheme;	// restore scheme`
	return res;
    }

    /**
     * if c (and what follows it together) is a vowel get its tamil unicode equiv
     * @param {char}    c	  the character to be tested
     * @param {String}  eng	  the string containing the char
     * @param {int}     idx	  the index of c in 'eng'
     * @param {int}     englen	  the length of 'eng'
     * @param {boolean} isNative  is the actual "source language"
     * @param {Array[3]} ret	  the return value. If c is a tamizh vowel, ret[1] 
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
		if( nc == 'i' )       { ret[0] = 2; ret[1] = "\u0b90"; return true;  }
		// au
		else if( nc == 'u' )  { ret[0] = 2; ret[1] = "\u0b94"; return true;  }
	    }
	    ret[0] = 1; ret[1] = "\u0b85"; return true;
	}
	else if( c == 'A' ) { 
	    ret[0] = 1; ret[1] = "\u0b86"; return true; 
	}
	else if( c == 'i' ) { ret[0] = 1; ret[1] = "\u0b87"; return true; }
	else if( c == 'I' ) { ret[0] = 1; ret[1] = "\u0b88"; return true; }
	else if( c == 'u' ) { ret[0] = 1; ret[1] = "\u0b89"; return true; }
	else if( c == 'U' ) { ret[0] = 1; ret[1] = "\u0b8a"; return true; }
	else if( c == 'e' ) { ret[0] = 1; ret[1] = "\u0b8e"; return true; }
	else if( c == 'E' ) { ret[0] = 1; ret[1] = "\u0b8f"; return true; }
	else if( c == 'o' ) { ret[0] = 1; ret[1] = "\u0b92"; return true; }
	else if( c == 'O' ) { ret[0] = 1; ret[1] = "\u0b93"; return true; }
	else  {
	    ret[0] = 0; ret[1] = 0; return false;
	}
    }

    /**
     * if c (and what follows it together) is a consonant get its tamil unicode equiv
     * @param {char}    c	  the character to be tested
     * @param {String}  eng	  the string containing the char
     * @param {int}     idx	  the index of c in 'eng'
     * @param {int}     englen	  the length of 'eng'
     * @param {boolean} isNative  is the actual "source language"
     * @param {boolean} wordStart are we at the start of a word
     * @param {Array[3]} ret	  the return value. If c is a tamizh consonant, ret[1] 
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
	var n = 0;
	if( idx < englen ) 
	    n = eng.charAt(idx+1);
	if( c == '~' ) {
	    if( n == 'n') {
		ret[0] = 2;
		if( englen > (idx+1) ) {
		    var nn = eng.charAt(idx+2);
		    if( nn == 'j' || nn == 'J' ) {
			var suffix = this.SJA_SUFFIX;
			var suffix_always = false;
			ret[0]++;
			if( englen > (idx+2) ) {
			    var nnn = eng.charAt(idx+3);
			    if( nnn == 'h' ) {
				ret[0]++;
				suffix = this.SJHA_SUFFIX;
				suffix_always = true;
			    }
			}
			// ~nj <=> ~nc in tamizh
			ret[1]="\u0b9e\u0bcd\u0b9a";
			if(suffix_always || this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NOHARD )
			    ret[2] = suffix;
			return ret;
		    }
		    else if( nn == 'y' ) {
			ret[0]++;
		    }
		}
		ret[1] = "\u0b9e";
		return true;
	    }
	}
	else if( (c == '^' && n == 'n') || (c == 'n' && n == 2) ) {
	    // use the na as in nAmam as opposed to the one in mAnam
	    ret[0] = 2; ret[1]="\u0ba8"; return true;
	}
	else if( c == '#' && n == 'n' ) {
	    /*
	     * force use of as in a#n#nanam. Note that you dont use it in tamizh in
	     * the middle as in tangam, there "ng" is sufficient, and besides using
	     * #ng there would confuse other language interpretors.
	     */
	    ret[0] = 2;	// #n
	    ret[1]="\u0b99";return true;
	}
	if( c == 'k' || c == 'K' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0b95"; ret[2] = this.KHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0b95"; 
		this.addKaSuffix(wordStart,last,ret);
		return true; }
	}
	else if( c == 'g' || c == 'G' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0b95"; ret[2] = this.GHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0b95"; 
		this.addGaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'c' || c == 'C' ) {
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0b9a"; ret[2] = this.CHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0b9a"; 
		this.addCaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 's' || c == 'S' ) {
	    if(n == 'h') { 
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    if( nn == 'r' || nn == 'R' ) {
			ret[0] = 2; ret[1] = "\u0bb8"; return true; 	// do sanskrit sa - so that
									// shri works
		    }
		}
		ret[0] = 2; ret[1] = "\u0bb7"; 
		return true; // sh
	    }
	    else if( c == 's' && n == '2' ) {
		// force sanskrit sa
		ret[0] = 2; ret[1] = "\u0bb8"; 
		return true; // sh
	    }
	    else {
		if( c == 'S' )  {
		    ret[0] = 1; ret[1] = "\u0bb8"; 
		    var isSrI = false;
		    if( n == 'r'  ) {
			if( englen > (idx+1) ) {
			    nn = eng.charAt(idx+2);
			    if( nn == 'I' )
				isSrI = true;
			}
		    }
		    if( !isSrI ) {
			if( this.useGranthaSa )
			    ret[1] = "\u0bb6"; 	// replace
			else
			    ret[2] = this.SA_SUFFIX;
		    }
		    return true;
		}
		else 
		    this.addSaSuffix(wordStart,last,ret);

		if(this.isWordEnd(n) || !this.isVowel(n)) { ret[0] = 1; ret[1] = "\u0bb8"; return true;}
		else { ret[0] = 1; ret[1] = "\u0b9a"; return true; }
	    }
	}
	else if( c == 'T' ) { 
	    // TTR, Tr <=> RR as in kATTRa 
	    // TODO: this probably should be done only if T is preceded by vowel.
	    // For example saurAShTram is valid and should be written as that
	    // (as opposed to saurAShRRam)
	    var nn = n;
	    var cnt = 2;
	    if( n == 'T' ) {
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    cnt++;
		}
	    }
	    if( (nn == 'r' || nn == 'R') && (last && last[4] != "" && this.isVowel(last[4].charAt(last[4].length-1)))) { ret[0] = cnt; ret[1] = "\u0bb1\u0bcd\u0bb1"; return true; }

	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0b9f"; ret[2] = this.THA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0b9f"; 
		this.addTaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'D' ) { 
	    // Dr or DR <=> R ??example????? ninDra 
	    if(n == 'r' || n == 'R') { ret[0] = 2; ret[1] = "\u0bb1"; return true; }
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0b9f"; ret[2] = this.DHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0b9f"; 
		this.addDaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 't' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0ba4"; ret[2] = this.thA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0ba4"; 
		this.addtaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'd' ) { 
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0ba4"; ret[2] = this.dhA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0ba4"; 
		this.adddaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'p' || c == 'P') { 
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0baa"; ret[2] =  this.PHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0baa"; 
		this.addPaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'b' || c == 'B') { 
	    if(n == 'h') { ret[0] = 2; ret[1] = "\u0baa"; ret[2] = this.BHA_SUFFIX; return true; }
	    else { 
		ret[0] = 1; ret[1] = "\u0baa"; 
		this.addBaSuffix(wordStart,last,ret);
		return true; 
	    }
	}
	else if( c == 'R' ) {
	    var l = 1;
	    if( n == '_' ) l++;	// malayalam cillu - for us it is simply Ra
	    //if( wordStart ) { ret[0] = l; ret[1] = "\u0bb0"; return true; }
	    //else            { ret[0] = l; ret[1] = "\u0bb1"; return true; }
	    ret[0] = l; ret[1] = "\u0bb1"; return true;
	}
	else if( c == 'y' || c == 'Y' ) { 
	    // note: i think mei should be added only if native
	    var needmei = false;
	    if( n == 'k' || n == 'K' || n == 'c' || n == 'C' || n == 't' || n == 'p' || n == 'P') {
		if( englen > (idx+1) ) {
		    var nn = eng.charAt(idx+2);
		    if( !this.isWordEnd(nn) && nn != c && nn != n ) // make sure the extra mei is not in input
			needmei = true;
		}
		ret[0] = 1; ret[1] = "\u0baf"; 
		if( needmei ) {
		    ret[1] += "\u0bcd";
		    // requires an extra mei 't'
		    if( n == 'k' || n == 'K')      ret[1] += "\u0b95";
		    else if( n == 'c' || n == 'C') ret[1] += "\u0b9a";
		    else if( n == 't' )            ret[1] += "\u0ba4";
		    else if (n == 'p' || n == 'P') ret[1] += "\u0baa";
		}
		return true;
	    }
	    ret[0] = 1; ret[1] = "\u0baf"; return true; 
	}
	else if( c == 'r' )  { 
	    // note: i think mei should be added only if native
	    if( n == 'k' || n == 'K' || n == 'c' || n == 'C' || n == 't' || n == 'p' || n == 'P') {
		var needmei = false;
		if( englen > (idx+1) ) {
		    var nn = eng.charAt(idx+2);
		    if( !this.isWordEnd(nn) && nn != c && nn != n ) // make sure the extra mei is not in input
			needmei = true;
		}
		ret[0] = 1; ret[1] = "\u0bb0"; 
		if( needmei ) {
		    ret[1] += "\u0bcd";
		    // requires an extra mei 't'
		    if( n == 'k' || n == 'K')      ret[1] += "\u0b95";
		    else if( n == 'c' || n == 'C') ret[1] += "\u0b9a";
		    else if( n == 't' )            ret[1] += "\u0ba4";
		    else if (n == 'p' || n == 'P') ret[1] += "\u0baa";
		}
		return true;
	    }
	    else { ret[0] = 1; ret[1] = "\u0bb0"; return true; }
	}

	else if( c == 'l' )             { 
	    var l = 1;
	    if( n == '_' ) l++;	// malayalam cillu - for us it is simply la
	    ret[0] = l; ret[1] = "\u0bb2"; return true; 
	}
	else if( c == 'v' || c == 'w' ) { ret[0] = 1; ret[1] = "\u0bb5"; return true; }
	else if( c == 'z')  {
	    ret[0] = 1;
	    if(n == 'h') ret[0] = 2; 
	    ret[1] = "\u0bb4"; 

	    n = 0;
	    if( englen >= (idx+ret[0]) )
		n = eng.charAt(idx+ret[0]);

	    // note: i think mei should be added only if native
	    var needmei = false;
		// not sure about t, p/P, k/K
	    if( n == 'k' || n == 'K' || n == 'c' || n == 'C' || n == 't' /*|| n == 'p' || n == 'P'*/) {
		if( englen >= (idx+ret[0]+1) ) {
		    var nn = eng.charAt(idx+ret[0]+1);
		    if( !this.isWordEnd(nn) && nn != c && nn != n ) // make sure the extra mei is not in input
			needmei = true;
		}
		if( needmei ) {
		    ret[1] += "\u0bcd";
		    // requires an extra mei 't'
		    if( n == 'k' || n == 'K')      ret[1] += "\u0b95";
		    else if( n == 'c' || n == 'C') ret[1] += "\u0b9a";
		    else if( n == 't' )            ret[1] += "\u0ba4";
		    else if (n == 'p' || n == 'P') ret[1] += "\u0baa";
		}
		return true;
	    }
	    return ret;
	}
	else if( c == 'L' )             { 
	    var l = 1;
	    if( n == '_' ) l++;	// malayalam cillu - for us it is simply La
	    ret[0] = l; ret[1] = "\u0bb3"; return true; 
	}
	else if( c == 'n' || c == 'M' || (c == '`' && (n == 'n' || n == 'N'))) {
	    // M is bindu and can be a 'm', 'n' or 'N' depending on what follows
	    var l = 1;
	    var oldn = n;
	    if( c == 'n' && n == '_' ) {
		l++;	// malayalam chillu, for us it is still na
		if( englen >= (idx+l) )
		    n = eng.charAt(idx+l);
		else
		    n = 0;
	    }
	    else if( c == 'n' && n == '.' ) {
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    if( nn == 'd' || nn == 't' || nn == 'c' || nn == 'j' || nn == 'k' || nn == 'g' ) {
			// force n.d/t/c/j/k/g to not become ng, nd etc. and not use bindu
			ret[0] = 2; ret[1] = "\u0ba9"; 
			return true;
		    }
		}
	    }
	    else if( c == '`' ) {
		// explicit anuswara specifier
		l++;
		if( englen >= (idx+l) )
		    n = eng.charAt(idx+l);
		else
		    n = 0;
	    }

	    if( n == 'd' || n == 't' ) { 
		ret[0] = l+1; 
		ret[1]="\u0ba8\u0bcd\u0ba4";
		if( n == 'd' )  {
		    if(this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NOHARD )
			ret[2] = this.dA_SUFFIX;
		}
		else {
		    if(this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NATURAL )
			ret[2] = this.tA_SUFFIX;
		}
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    if( nn == 'h' ) {
			ret[0]++;
			if( n == 'd' ) 
			    ret[2] = this.dhA_SUFFIX;
			else 
			    ret[2] = this.thA_SUFFIX;
		    }
		}
		return true;
	    }
	    // nk is like ng, as "ka" hard after n doesnt exist in tamizh
	    if( n == 'k' || n == 'K' || n == 'g' || n == 'G' ) {
		if( englen > (idx+l) ) {
		    var nn = eng.charAt(idx+l+1);
		    if( this.isVowel(nn) ) {
			ret[0] = l+1;ret[1]="\u0b99\u0bcd\u0b95";
			nn = 0;
			if( englen > (idx+1) ) {
			    nn = eng.charAt(idx+2);
			    if( nn == 'h' )
				ret[0]++;
			    else
				nn = 0;
			}
			if( n == 'k' || n == 'K' )  {
			    if(nn == 'h' )
				ret[2] = this.KHA_SUFFIX;
			    else if(this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NATURAL )
				ret[2] = this.KA_SUFFIX;
			}
			else if( n == 'g' || n == 'G' )  {
			    if(nn == 'h' )
				ret[2] = this.GHA_SUFFIX;
			    else if( this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NOHARD)
				ret[2] = this.GA_SUFFIX;
			}
			return true;
		    }
		    else {
			ret[0] = l;ret[1]="\u0b99";return true;
		    }
		}
	    }
	    // nc is like nj as "ca" hard after n doesnt exist
	    // TODO: if not native "ca" should be qualified
	    else if( n == 'c' || n == 'C' || n == 'j' || n == 'J' ) { 
		ret[0] = l+1;ret[1]="\u0b9e\u0bcd\u0b9a";
		nn = 0;
		if( englen > (idx+1) ) {
		    nn = eng.charAt(idx+2);
		    if( nn == 'h' )
			ret[0]++;
		    else
			nn = 0;
		}
		ret[2] = "";
		if( n == 'c' || n == 'C' )  {
		    if(nn == 'h' )
			ret[2] = this.CHA_SUFFIX;
		    else if(this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NATURAL )
			ret[2] = this.CA_SUFFIX;
		}
		else if( n == 'j' || n == 'J' )  {
		    if(nn == 'h' )
			ret[2] = this.SJHA_SUFFIX;
		    else if( this.qualScheme == this.QUALSCHEME_ALWAYS || this.qualScheme == this.QUALSCHEME_NOHARD)
			ret[2] = this.SJA_SUFFIX;
		}
		return true;
	    }
	    else if( c == 'M' || c == '`' ) {
		// handle other cases where 'M' the bindu becomes n/N
		if( n == 't' ) {
		    // becomes 'n'
		    ret[0] = l; ret[1]="\u0ba9"; return true;
		}
		else if( n == 'T' || n == 'D' ) {
		    // becomes N
		    ret[0] = l; ret[1]="\u0ba3"; return true;
		}
		else {
		    if( c == '`' ) {
			if( oldn == 'n' ) {
			    // plain old na
			    ret[0] = l; ret[1] = "\u0ba9"; return true;
			}
			else if( oldn == 'N' ) {
			    // plain old Na
			    ret[0] = l; ret[1] = "\u0ba3"; return true;
			}
		    }
		    // plain old ma
		    ret[0] = l; ret[1] = "\u0bae"; return true;
		}
	    }
	    else {
		// 'n'
		if( this.autoSenseNa ) {
		    if( wordStart ) { ret[0] = l; ret[1]="\u0ba8"; return true;}
		    else            { ret[0] = l; ret[1]="\u0ba9"; return true;}
		}
		else {
		    // always the "middle word" na
		    ret[0] = l; ret[1]="\u0ba9"; return true;
		}
	    }
	}
	else if( c == 'm' ) { ret[0] = 1; ret[1] = "\u0bae"; return true; }
	else if( c == 'N' ) { 
	    var l = 1;
	    if( n == '_' ) l++;	// malayalam cillu - for us it is simply Na
	    ret[0] = l; ret[1] = "\u0ba3"; return true; 
	}
	else if( c == 'h' ) { ret[0] = 1; ret[1] = "\u0bb9"; return true; }
	/*
	 * use : for visarga for H, and H2 for our tamizh aHk. This makes
	 * sanskrit words that use visarga appear "better" (subjective) in tamizh
	 */
	else if( c == 'H' ) { 
	    ret[0] = 1; ret[1] = ":" /*"\u0b83"*/; 
	    if( n == '2' ) {
		ret[0] = 2; ret[1] = "\u0b83"; 
	    }
	    return true; 
	}
	else if( c == 'j' || c == 'J' ) { 
	    // j~n or j~ny <=> ~n, since tamizh ~nyAna/~nAna (knowledge) is written as j~nyAna in 
	    // kannada/telugu/sanskrit
	    if( n == '~' ) {
		var l = 2;
		if( englen >= (idx+l) && eng.charAt(idx+l) == 'n') {
		    l++;
		    if( englen >= (idx+l) && eng.charAt(idx+l) == 'y')
			l++;
		    ret[0] = l;ret[1]="\u0b9e";
		    ret[2] = this.NYA_SUFFIX;
		    return true;
		}
	    }
	    if(n == 'h' || n == 'H') { 
		ret[0] = 2; ret[1] = "\u0b9c"; ret[2] = this.JHA_SUFFIX; return true; 
	    }
	    else { 
		ret[0] = 1; ret[1] = "\u0b9c"; 
		return true; 
	    }
	}
	ret[0] = 0; return false;
    }

    this.onConsonant = function(uni, eng, idx, len, ret)  {
	// anuswara, visarga
	var uc = uni.charCodeAt(0);
	if( uc == 0x0b82 || uc == 0x0b83  || uni.charAt(0) == ':' ) { ret[0] = 0; ret[1] = uni; return ret; }

	if(idx == len) {
	    ret[0] = 0; ret[1] = uni + "\u0bcd"; 
	    return ret;
	}

	var n = eng.charAt(idx);
	var uc = uni.charCodeAt(0);

	var nn = 0;
	if( (idx+1) < len )
	    nn = eng.charAt(idx+1);
	if( n == 'a' ) {
	    if( nn == 'i' || nn == 'I' ) { ret[0] = 2; ret[1] = uni + "\u0bc8"; return ret; }
	    else if( nn == 'u' || nn == 'U' ) { ret[0] = 2; ret[1] = uni + "\u0bcc"; return ret; }
	    // viLayATTu vs payan (benefit)
	    //else if( nn == 'y' || nn == 'Y'  ) { ret[0] = 1; ret[1] = uni + "\u0bc8"; return ret; }
	    else { ret[0] = 1; ret[1] = uni; return ret; }
	}
	else if( n == 'A' ) {
	    // Ai as in pAi => "pA" + "y" - LATER MAYBE
	    // if( nn == 'i') { ret[0] = 2; ret[1] = uni + "\u0bbe\u0baf\u0bcd"; return true; }
	    ret[0] = 1; ret[1] = uni + "\u0bbe"; return ret;
	}
	else if( n == 'i' ) { ret[0] = 1; ret[1] = uni + "\u0bbf"; return ret; }
	else if( n == 'I' ) { ret[0] = 1; ret[1] = uni + "\u0bc0"; return ret; }
	else if( n == 'u' ) { ret[0] = 1; ret[1] = uni + "\u0bc1"; return ret; }
	else if( n == 'U' ) { ret[0] = 1; ret[1] = uni + "\u0bc2"; return ret; }
	else if( n == 'e' ) { ret[0] = 1; ret[1] = uni + "\u0bc6"; return ret; }
	else if( n == 'E' ) { ret[0] = 1; ret[1] = uni + "\u0bc7"; return ret; }
	else if( n == 'o' ) { ret[0] = 1; ret[1] = uni + "\u0bca"; return ret; }
	//else if( n == 'o' ) { ret[0] = 1; ret[1] = "\u0bc6" + uni + "\u0bbe"; return ret; }
	//else if( n == 'O' ) { ret[0] = 1; ret[1] = "\u0bc7" + uni + "\u0bbe"; return ret; }
	else if( n == 'O' ) { ret[0] = 1; ret[1] = uni + "\u0bcb"; return ret; }
	else if( n == '.' && uc == 0xbb1 ) {
	    // R. is like ru, note change of R to r
	    ret[0] = 1; ret[1] = "\u0bb0\u0bc1"; 
	    ret[2] = this.RR_SUFFIX;
	    return ret;
	}
	else { 
	    ret[0] = 0; ret[1] = uni + "\u0bcd"; 
	    return ret; 
	}
    }

    /**
     * is passed in character a vowel?
     * @param {char} ch	the character
     * @type boolean
     */
    this.isVowel = function(ch) {
	var eng = "" + ch;
	var ret = new Array(2);
	return this.getVowelCode(ch, eng, 0, 1, true, ret, null);
    }

    /*
     * add a suffix for a "ka" sound
     */
    this.addKaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS )
		ret[2] = this.KA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( !wordStart && !this.isKaPreceder(last))
		ret[2] = this.KA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "ga" sound
     */
    this.addGaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
	    ret[2] = this.GA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( wordStart ) 
		ret[2] = this.GA_SUFFIX;
	}
	else if( this.qualScheme == this.QUALSCHEME_NOHARD) {
	    ret[2] = this.GA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "ca" sound
     */
    this.addCaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
	    ret[2] = this.CA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( /*!wordStart && */ !this.isCaPreceder(last))
		ret[2] = this.CA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "sa" sound
     */
    this.addSaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
	    ret[2] = this.sA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
		// no prefix for "sa" sound in natural scheme
	}
	else if( this.qualScheme == this.QUALSCHEME_NOHARD)
	    ret[2] = this.sA_SUFFIX;
    }

    /*
     * add a suffix for a "Ta" sound
     */
    this.addTaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.TA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( !wordStart && !this.isTaPreceder(last))
		ret[2] = this.TA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "Da" sound
     */
    this.addDaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.DA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( wordStart ) 
		ret[2] = this.DA_SUFFIX;
	}
	else if( this.qualScheme == this.QUALSCHEME_NOHARD)
	    ret[2] = this.DA_SUFFIX;
    }

    /*
     * add a suffix for a "ta" sound
     */
    this.addtaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.tA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( !wordStart && !this.istaPreceder(last))
		ret[2] = this.tA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "da" sound
     */
    this.adddaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.dA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( wordStart ) 
		ret[2] = this.dA_SUFFIX;
	}
	else if( this.qualScheme == this.QUALSCHEME_NOHARD)
	    ret[2] = this.dA_SUFFIX;
    }

    /*
     * add a suffix for a "pa" sound
     */
    this.addPaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.PA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( !wordStart && !this.isPaPreceder(last))
		ret[2] = this.PA_SUFFIX;
	}
    }

    /*
     * add a suffix for a "ba" sound
     */
    this.addBaSuffix = function(wordStart,last,ret) {
	if(this.qualScheme == this.QUALSCHEME_ALWAYS ) 
		ret[2] = this.BA_SUFFIX;
	else if(this.qualScheme == this.QUALSCHEME_NATURAL ) {
	    if( wordStart ) 
		ret[2] = this.BA_SUFFIX;
	}
	else if( this.qualScheme == this.QUALSCHEME_NOHARD)
	    ret[2] = this.BA_SUFFIX;
    }

    /*
     * does the tamizh unicode string in 'last' is something that would make the
     * following "ka" take the hard "ka" sound (as opposed to ga)
     *
     * For tamizh, this would be k, R, T, zh
     */
    this.isKaPreceder = function(last) {
	if( !last || !last[4] || last[4].length == 0 ) return false;

	var l = last[4].length;
	var ch = last[4].substring(l-1);	// last char as a string
	if( ch == "h" && l>2 ) {
	    var chp = last[4].charAt(l-2);
	    if(chp == 'k' || chp == 'g' || chp == 'c' || chp == 'j' || chp == 'T' || chp == 'D' ||
	       chp == 't' || chp == 'd' || chp == 's' || chp == 'S' ) {
		ch = "" + chp;
	   }
	   else if( chp == 'z' )
	     ch = chp;
	}
	if( (ch == 'z' || ch == 'r' || ch == 'y') && last[1].indexOf("\u0b95\u0bcd") == (last[1].length-2)) return true;
	return (ch == "k" || ch == 'K' || ch == "R"|| ch == "T" || ch == "z" || ch == 'Z');
    }

    /*
     * does the tamizh unicode string in 'last' is something that would make the
     * following "ca" take the hard "ca" sound (as opposed to sa)
     *
     * For tamizh, this would be c, R (poRsilambi), T (cannot really? as Tc => cc?), zh
     */
    this.isCaPreceder = function(last) {
	if( !last || !last[4] || last[4].length == 0 ) return false;

	var l = last[4].length;
	var ch = last[4].substring(l-1);	// last char as a string
	if( ch == "h" && l>2 ) {
	    var chp = last[4].charAt(l-2);
	    if(chp == 'k' || chp == 'g' || chp == 'c' || chp == 'j' || chp == 'T' || chp == 'D' ||
	       chp == 't' || chp == 'd' || chp == 's' || chp == 'S' ) {
		ch = "" + chp;
	   }
	   else if( chp == 'z' )
	     ch = chp;
	}
	if( (ch == 'z' || ch == 'r' || ch == 'y') && last[1].indexOf("\u0b9a\u0bcd") == (last[1].length-2)) return true;
	return (ch == "c" || ch == 'C' || ch == "R"|| ch == "T" || ch == "z" || ch == 'Z');
    }

    /*
     * does the tamizh unicode string in 'last' is something that would make the
     * following "Ta" take the hard "Ta" sound (as opposed to Da)
     *
     * For tamizh, this would be T (saTTam) 
     */
    this.isTaPreceder = function(last) {
	if( !last || !last[4] || last[4].length == 0 ) return false;

	var l = last[4].length;
	var ch = last[4].substring(l-1);	// last char as a string
	return (ch == "T");
    }

    /*
     * does the tamizh unicode string in 'last' is something that would make the
     * following "ta" take the hard "ta" sound (as opposed to da)
     *
     * For tamizh, this would be k (sakti), t (sattam), R (cannot really as Rt => RR as poRRAmarai), T (???), zh (???)
     */
    this.istaPreceder = function(last) {
	if( !last || !last[4] || last[4].length == 0 ) return false;

	var l = last[4].length;
	var ch = last[4].substring(l-1);	// last char as a string
	if( ch == "h" && l>2 ) {
	    var chp = last[4].charAt(l-2);
	    if(chp == 'k' || chp == 'g' || chp == 'c' || chp == 'j' || chp == 'T' || chp == 'D' ||
	       chp == 't' || chp == 'd' || chp == 's' || chp == 'S' ) {
		ch = "" + chp;
	   }
	   else if( chp == 'z' )
	     ch = chp;
	}
	if((ch == 'z' || ch == 'r' || ch == 'y') && last[1].indexOf("\u0ba4\u0bcd") == (last[1].length-2)) return true;
	return (ch == "k" || ch == 'K' || ch == 't' || ch == "R"|| ch == "T" || ch == "z" || ch == 'Z');
    }

    /*
     * does the tamizh unicode string in 'last' is something that would make the
     * following "pa" take the hard "pa" sound (as opposed to ba)
     *
     * For tamizh, this would be p (appA), R (kaRpu), T (naTpu), zh (???)
     */
    this.isPaPreceder = function(last) {
	if( !last || !last[4] || last[4].length == 0 ) return false;

	var l = last[4].length;
	var ch = last[4].substring(l-1);	// last char as a string
	if( ch == "h" && l>2 ) {
	    var chp = last[4].charAt(l-2);
	    if(chp == 'k' || chp == 'g' || chp == 'c' || chp == 'j' || chp == 'T' || chp == 'D' ||
	       chp == 't' || chp == 'd' || chp == 's' || chp == 'S' ) {
		ch = "" + chp;
	   }
	   else if( chp == 'z' )
	     ch = chp;
	}
	if( (ch == 'r' || ch == 'y') && last[1].indexOf("\u0baa\u0bcd") == (last[1].length-2)) return true;
	return (ch == 'l' || ch == "p" || ch == "P" || ch == "R"|| ch == "T" || ch == "z" || ch == "Z");
    }


    this.QUALSCHEME_NOQUAL	= 0;
    this.QUALSCHEME_NOHARD	= 1;
    this.QUALSCHEME_NATURAL	= 2;
    this.qualScheme = this.QUALSCHEME_NOQUAL;

    this.KA_SUFFIX  =  "1";
    this.KHA_SUFFIX =  "2";
    this.GA_SUFFIX  =  "3";
    this.GHA_SUFFIX =  "4";

    this.TA_SUFFIX  =  "1";
    this.THA_SUFFIX =  "2";
    this.DA_SUFFIX  =  "3";
    this.DHA_SUFFIX =  "4";

    this.tA_SUFFIX  =  "1";
    this.thA_SUFFIX =  "2";
    this.dA_SUFFIX  =  "3";
    this.dhA_SUFFIX =  "4";

    this.PA_SUFFIX  =  "1";
    this.PHA_SUFFIX =  "2";
    this.BA_SUFFIX  =  "3";
    this.BHA_SUFFIX =  "4";

    this.CA_SUFFIX  =  "1";
    this.CHA_SUFFIX =  "2";
    this.sA_SUFFIX  =  "3";
    this.SJA_SUFFIX =  "4";	// following nj as in p~anja
    this.SJHA_SUFFIX = "5";	// following nj as in p~anjha

    this.JHA_SUFFIX =  "2";
    this.RR_SUFFIX  =  "2";

    this.SA_SUFFIX  =  "2";		// on sanskrit influenced sa

    this.NYA_SUFFIX = "2";		// for j~n

    //useSup = 1;
    if( useSup ) {
	if(qualsAsSubscripts)
	    this.SUFFIX_TAG = "sub";
	else
	    this.SUFFIX_TAG = "sup";
	this.SUFFIX_STYLE = "";
    }
    else {
	this.SUFFIX_TAG = "span";
	this.setSuffixFontSize( "6pt" );
    }

    this.autoSenseNa = true;	// if true, then at word-start we use one na, else other na
    				// if false, then word-start na is used only if ^n is specified

    this.useGranthaSa = false;
}

