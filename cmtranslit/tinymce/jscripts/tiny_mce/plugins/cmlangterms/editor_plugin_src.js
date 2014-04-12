/**
 * $Id: editor_plugin_src.js 162 2007-01-03 16:16:52Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

/* Import theme	specific language pack */
tinyMCE.importPluginLanguagePack('cmlangterms');

//tinyMCE.loadScript(tinyMCE.baseURL + '/plugins/cmlangterms/sanskrit_M_db_raw.js' );
//tinyMCE.loadScript(tinyMCE.baseURL + '/plugins/cmlangterms/sanskrit_M_db.js' );
var SanskritAnuswaraDb = null;

/*
 * convert to scheme rules
 *
 * General:
 * 1. oo => U, aa => A, ee => I (phase1)
 * 2. ShrI/shrI => SrI (phase2)
 * 3. (optional) Shri/shri => SrI (phase2)
 *
 * Tamil krithis:
 * 1. th => t, ch => c, dh => d
 * 2. bh => b, kh => k 
 * 2. (optional) sh => sa  (phase 1)
 * 3. ca => sa/ja depending on context (phase 2)
 * 4. sa => ca/ja depending on context (phase 2)
 *
 * Non-Tamil krithis:
 * 1. (optional) M => n/N depending on context (phase 1)
 * 2  (optional) m => n/N depending on context (phase 1)
 * 3. <consonant>R<consonant> => <consonant>R.<consonant> (phase 1)
 * 4. <consonant>r<consonant> => <consonant>R.<consonant> (phase 1)
 */
function ConvertToSchemeRule(name, phase, description, notes)
{
    this.getName = function() { return this.fName; }
    this.getDescription = function() { return this.fDescription; }
    this.getPhase = function() { return this.fPhase; }
    this.getNotes = function() { return this.fNotes; }

    this.fName        = name;
    this.fDescription = description;
    this.fPhase       = phase;
    this.fNotes       = notes;
}

function KannadaTeluguConvertToSchemeRulesManager() 
{
    this.getCategory = function() { return "Kannada/Telugu Krithis"; }
    this.getCategoryDescription = function() { return "Rules for kannada/telugu krithis"; }
    this.getRules = function() { return this.fRules; }

    this.handleRule = function(rule, text) {
	switch (rule.getName()) {
		case this.FIXM:
		{
		    var re1 = /M([kg])/g;
		    var re2 = /M([cj])/g;
		    var re3 = /M([TD])/g;
		    var re4 = /M([td])/g;
		    var re5 = /M([pb])/g;
		    var re6 = /M([ \t^a-zA-Z])/g;
		    var re7 = /M$/g;
		    return text.replace(re1, "#n$1").replace(re2,"~n$1").replace(re3,"N$1").replace(re4,"n$1").replace(re5,"m$1").replace(re6,"m$1").replace(re7,"m");
		}

		default:
		    return txt;
	}
    }

    this.FIXM = "kt_fixM";

    this.fRules = new Array();
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIXM, 1, "M => #n/~n/n/N/m where unambiguous",
					    "Convert explicit anuswara specifier M to #/~n/n/M in contexts where a anuswara is always implied" );
}

function GeneralConvertToSchemeRulesManager() 
{
    this.getCategory = function() { return "Any Krithi"; }
    this.getCategoryDescription = function() { return "General Rules for all languages"; }

    this.getRules = function() { return this.fRules; }

    this.handleRule = function(rule, text) {
	switch (rule.getName()) {
		case this.AI_TO_AY:
		    var re1 = /([Ae])i/g;
		    return text.replace(re1, "$1y");

		case this.UNSUPCAPS:
		{
		    var re1 = /B/g;
		    var re2 = /C/g;
		    var re3 = /G/g;
		    var re4 = /J/g;
		    var re5 = /K/g;
		    var re6 = /P/g;
		    var re7 = /V/g;
		    return text.replace(re1,"b").replace(re2,"c").replace(re3,"g").replace(re4,"j").replace(re5,"k").replace(re6,"p").replace(re7,"v");
		}

		case this.LONGVOWELS: 
		{
		    var re1 = /aa/gi;
		    var re2 = /oo/gi;
		    var re3 = /ee/gi;
		    var re4 = /ow/gi;
		    return text.replace(re1, "A").replace(re2,"U").replace(re3,"I").replace(re4,"au");
		}

		case this.SHRI_1: 
		    return text.replace(/[Ss]hrI/g, "SrI" );

		case this.SHRI_2:
		    return text.replace(/[Ss]hri/g, "SrI" );

		case this.FIXM:
		{
		    var re1 = /M([kgcjtd])/g;
		    var re2 = /M([TD])/g;
		    return text.replace(re1, "`n$1").replace(re2,"`N$1");
		}

		case this.FIXN:
		{
		    var re1 = /[^`]n([kg])/g;
		    var re2 = /[^`]n([cj])/g;
		    return text.replace(re1, "#n$1").replace(re2,"~n$1");
		}

		case this.FIXN2:
		{
		    var re1 = /#n([kg])/g;
		    var re2 = /~n([cj])/g;
		    return text.replace(re1, "n$1").replace(re2,"n$1");
		}


		default:
		    return text;
	}
    }

    this.LONGVOWELS = "general_longvowels";
    this.SHRI_1     = "general_shri1";
    this.SHRI_2     = "general_shri2";
    this.FIXN       = "general_fixn";
    this.AI_TO_AY   = "general_ai_to_ay";
    this.FIXM       = "general_fixm";
    this.UNSUPCAPS  = "genera_unsupcaps";



    this.fRules = new Array();
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.LONGVOWELS, 1, "aa/ee/uu/ow => A/I/U/au",
    						"Alternate phonetic forms of long vowels: aa => A (maaru => mAru), ee => I (meera => mIra), oo => I (poorvi => pUrvi), ow => au (gowLa => gauLa)" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.UNSUPCAPS, 1, "B/C/G/J/K/P/V => b/c/g/j/k/p/v",
    						"Convert capitalization of letters which have representation in the scheme only in lower case forms. For example, while <i>v</i> is part of the scheme, <i>V</i> is not and specifying it would be an error. Adding this rule would convert all occurences of <i>V</i> to <i>v</i>." );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.SHRI_1, 1, "shrI/ShrI => SrI",
					"Alternate representation for Shri #1: shrI/ShrI => SrI" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.SHRI_2, 1, "shri/Shri => SrI",
					    "Alternate representation for Shri #2: shr<b>i</b>/Shr</b>i</b> => SrI. Allows shorter ri, besides the usual rI, to represent Sri when succeeded sh/Sh" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIXN, 1, "n => #n/~n",
    						"Converts n to #n or ~n in appropriate contexts. Does not< affect translation to target languages, but can be used to make the text more accurate in terms of actual character used in the target languages in applicable contexts (i.e. pankaja => pa#nkaja).");
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIXN2, 1, "#n/~n => n",
    						"Inverse of <i>n =&gt; #n/~n rule</i>. Converts #n or ~n to n in appropriate contexts. Does not affect rendition translation to target languages, but can be used to make the transliteration text easier to read (e.g. pa#nkaja => pankaja)");
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIXM, 1, "M => `n/`N as appropriate",
    						"Convert explicit anuswara specifier M to better anuswara specifier `n and `N depending on context");
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.AI_TO_AY, 1, "Ai => Ay, ei => ey",
    						"Converts Ay to Ay so that you can enter tAi for tAy, mei for mey" );
}

function NonTamilConvertToSchemeRulesManager() 
{
    this.getCategory = function() { return "Non-Tamil Kritis"; }
    this.getCategoryDescription = function() { return "Rules for non-tamil krithis"; }

    this.getRules = function() { return this.fRules; }

    this.handleRule = function(rule, text) {
	switch (rule.getName()) {
		case this.FIXBINDU:
		{
		    var re1 = /M([kgcjtd])/g;
		    var re2 = /M([TD])/g;
		    return text.replace(re1, "n$1");
		   // .replace(re2,"N$1");
		}

		default:
		    return text;
	}
    }

    this.FIXBINDU = "ntamil_fixbindu";

    this.fRules = new Array();
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIXBINDU, 1, "M => n/N",
						    "Converts explicit bindu/anuswara specifier M to n or N in appropriate contexts. Does not affect translation to target languages, but can be used to make the input more phonetic" );
}

function TamilConvertToSchemeRulesManager() 
{
    this.getCategory = function() { return "Tamil Kritis"; }

    this.getRules = function() { return this.fRules; }

    this.handleRule = function(rule, text) {
	switch (rule.getName()) {
		case this.REMOVEH: 
		{
		    var re1 = /th/g;
		    var re2 = /ch/g;
		    var re3 = /dh/gi;
		    return text.replace(re1, "t").replace(re2,"c").replace(re3,"d");
		}

		case this.REMOVEH2: 
		{
		    var re1 = /bh/g;
		    var re2 = /kh/g;
		    return text.replace(re1, "b").replace(re2,"k");
		}

		case this.SHA_TO_SA: 
		    return text.replace(/sh/g, "s" );

		case this.SHA_TO_SA2: 
		    return text.replace(/Sh/g, "s" );

		case this.FIX_CA:
		{
		    var re1 = /([aeiou])c([^c])/i;	// vowel followed by ca, should become sa
		    var re2 = /nc/g;			// nc => nj (in tamizh)
		    return text.replace(re1, "$1s$2" ).replace(re2,"nj");
		}

		case this.FIX_KA:
		{
		    var re1 = /([aeiou])k([^k])/i;	// vowel followed by ka, should become ga
		    var re2 = /nk/;			// nk => ng (in tamizh)
		    return text.replace(re1, "$1g$2" ).replace(re2,"ng");
		}

		case this.FIX_tA:
		{
		    var re1 = /([aeiou])t([^t])/i;	// vowel followed by ta, should become da
		    var re2 = /nt/;			// nk => ng (in tamizh)
		    return text.replace(re1, "$1d$2" ).replace(re2,"nd");
		}

		case this.FIX_TA:
		{
		    var re1 = /([aeiou])T([^T])/i;	// vowel followed by ta, should become da
		    var re2 = /NT/;			// nk => ng (in tamizh)
		    return text.replace(re1, "$1D$2" ).replace(re2,"ND");
		}

		case this.FIX_PA:
		{
		    var re1 = /([aeiou])p([^p])/i;	// vowel followed by pa, should become ba
		    var re2 = /np/;			// np => nb (in tamizh)
		    return text.replace(re1, "$1b$2" ).replace(re2,"nb");
		}


		default:
		    return text;
	}
    }

    this.REMOVEH    = "tamil_removeh";
    this.REMOVEH2   = "tamil_removeh2";
    this.SHA_TO_SA  = "tamil_sha_to_sa1";
    this.SHA_TO_SA2 = "tamil_sha_to_sa2";
    this.FIX_CA     = "tamil_fix_ca";
    this.FIX_KA     = "tamil_fix_ka";
    this.FIX_tA     = "tamil_fix_ta";
    this.FIX_TA     = "tamil_fix_Ta";
    this.FIX_PA     = "tamil_fix_pa";



    this.fRules = new Array();
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.REMOVEH, 1, "th => t, ch => c, dh => d", 
						"Removes spurious <i>h</i> in some contexts. Some people have a (understandable and natural) tendency to use <i>th</i> for <i>t</i>, and <i>dh</i> for <i>d</i> etc. as that is more phonetically accurate. However in the scheme in order to account for other languages, <i>th</i> is different from <i>t</i>, <i>dh</i> is different from d etc. <p>Note that this can affect sanskrit based words in tamil, which may need to retain their original pronounciation" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.REMOVEH2, 1, "bh => t, kh => k", 
						"Remove spurious <i>h</i> in some contexts. Same as previous rule, but this can affect more of sanskrit based words which may need to their original pronounciation" ); 
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.SHA_TO_SA, 1,
					    "sha => sa",
					    "Some unofficial schemes on employ <i>sha</i> for <i>sa</i> in almost all cases. However, that is only an acceptable pronounciation variant of \u0b9a, the ca/sa letter. This pronounciation is more acceptable in carnatic circles than in literary tamil circles. Applying this rule allows for this pronounciation variation to not carry to the script. <p>Note that this can affect occurrences of the <i>sha</i> letter>");
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.SHA_TO_SA2, 1,
					    "Sha => sa",
					    "Similar to <b>sha => sa</b>");
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIX_CA,  2,
    						"ca => sa/ja",
						"This converts occurences of <i>ca</i> to <i>sa</i>/<i>ja</i> depending on context (as-per tamil language rules). This can fix sources which use the ca to indicate which letter is used as opposed to which sound figures in a context.<p><u>Warning</u>: Should use it only for tamil krithis. Even in tamil krithis, this can affect pronounciation of sanskrit based words which may need to adhere more towards there original pronounciation. Use with caution" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIX_KA,  2,
    						"ka => ga",
						"This converts occurences of <i>k</i> to <i>g</i> depending on context (as-per tamil language rules). This can fix sources which use the ca to indicate which letter is used as opposed to which sound figures in a context.<p><u>Warning</u>: Should use it only for tamil krithis. Even in tamil krithis, this can affect pronounciation of sanskrit based words which may need to adhere more towards there original pronounciation. Use with caution" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIX_tA,  2,
    						"ta => da",
						"This converts occurences of <i>t</i> to <i>d</i> depending on context (as-per tamil language rules). This can fix sources which use the ca to indicate which letter is used as opposed to which sound figures in a context.<p><u>Warning</u>: Should use it only for tamil krithis. Even in tamil krithis, this can affect pronounciation of sanskrit based words which may need to adhere more towards there original pronounciation. Use with caution" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIX_TA,  2,
    						"Ta => Da",
						"This converts occurences of <i>T</i> to <i>D</i> depending on context (as-per tamil language rules). This can fix sources which use the ca to indicate which letter is used as opposed to which sound figures in a context.<p><u>Warning</u>: Should use it only for tamil krithis. Even in tamil krithis, this can affect pronounciation of sanskrit based words which may need to adhere more towards there original pronounciation. Use with caution" );
    this.fRules[this.fRules.length] = new ConvertToSchemeRule( this.FIX_PA,  2,
    						"pa => ba",
						"This converts occurences of <i>p</i> to <i>b</i> depending on context (as-per tamil language rules). This can fix sources which use the ca to indicate which letter is used as opposed to which sound figures in a context.<p><u>Warning</u>: Should use it only for tamil krithis. Even in tamil krithis, this can affect pronounciation of sanskrit based words which may need to adhere more towards there original pronounciation. Use with caution" );
}

function termSorter(term1, term2) {
    if( term1.name() < term2.term() )
	return -1;
    else if( term1.name() > term2.term() )
	return 1;
    else 
	return 0;
}


function findTerm(termName, categories) {
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

function findTermByNameOrVal(defaultVal, categories) {
    var tn = defaultVal.toLowerCase();
    if( categories == null ) return null;
    for( c in categories ) {
	var terms = categories[c];
	if( terms != null ) {
	    for( t in terms ) {
		// var val = terms[t].getVal("default").toLowerCase();
		if( tn == t )
		    return terms[t];
		var languages = terms[t].getLanguages();
		for ( l in languages ) {
		    var val = languages[l].toLowerCase();
		    if( val == defaultVal ) {
			return terms[t];
		    }
		}
	    }
	}
    }
    return null;
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
     * get the language info
     */
    this.getLanguages = function() { return this.fLanguageInfo; }

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

function trim(s) { return s.replace(/^\s+|\s+$/, ''); };

function convertMatchingWordsToTerms(inst, node, categories) 
{
    if( node.nodeType == 3 ) {
	var nv = trim(node.nodeValue);
	if( nv && nv != "" ) {
	    var re1  = /^([a-zA-Z][^: 	]*):?/;			// matches Term: Term : etc. where Term is on its 
	    var re1_ret = re1.exec(nv);
	    var re2_ret = null;

	    var txt = null;

	    if( re1_ret != null && re1_ret.length == 2 ) {
		txt = re1_ret[1];
	    }
	    else  {
		var re2  = /:[ 	]*([a-zA-Z][^: 	]*)[ 	]*$/;
		re2_ret = re2.exec(nv);
		if( re2_ret != null && re2_ret.length == 2 ) {
		    txt = re2_ret[1];
		}
	    }
		

	    if( txt != null ) {
		var txt2 = txt.toLowerCase();
		/* OLD METHOD, WHICH USES $
		var t  = findTerm(txt2, categories);
		*/
		var t  = findTermByNameOrVal(txt2, categories);
		if( t != null ) {
		    var si = node.nodeValue.indexOf(txt);
		    var v = node.nodeValue.substring(0,si);
		    /* OLD METHOD< WHICH USES $
		    v += '$';
		    v += t.name();
		    v += node.nodeValue.substring(si+t.name().length);
		    node.nodeValue = v;
		    */

		    var trailer = node.nodeValue.substring(si+txt.length);

		    var trailerNode = null;
		    //if( trailer == "" ) trailer = "\xa0";
		    if( trailer != "" )
			trailerNode = inst.contentWindow.document.createTextNode(trailer);

		    node.nodeValue = v;

		    if( trailerNode ) {
			if( node.nextSibling )
			    node.parentNode.insertBefore(trailerNode, node.nextSibling);
			else
			    node.parentNode.appendChild(trailerNode);
		    }

		    var sp = inst.contentWindow.document.createElement("span");
		    sp.id        = t.name();
		    sp.style.color = "#000080";
		    sp.style.backgroundColor = "#c0c0c0";
		    sp.className = "cmvar";
		    sp.appendChild(inst.contentWindow.document.createTextNode(txt));

		    if( trailerNode )
			node.parentNode.insertBefore(sp, trailerNode);
		    else {
			if( node.nextSibling )
			    node.parentNode.insertBefore(sp, node.nextSibling);
			else {
			    node.parentNode.appendChild(sp);
			}
		    }
		}
	    }
	}
    }
    else if( node.firstChild ) {
	if( !node.className || node.className != "cmvar")
	{
	    var c = node.firstChild;
	    while(c) {
		convertMatchingWordsToTerms(inst, c, categories);
		c = c.nextSibling;
	    }
	}
    }
}




var TinyMCE_CMLangTermsPlugin = 
{
	getInfo : function() {
		return {
			longname : 'Language Specific Terms',
			author : 'Ramadaorai Arunkumar',
			authorurl : '',
			infourl : '',
			version : tinyMCE.majorVersion + "." + tinyMCE.minorVersion
		};
	},

	initInstance : function(inst) {
	    this._initLangTerms();

	    //tinyMCE.addEvent(inst.getBody(), "paste", TinyMCE_CMLangTermsPlugin._handlePasteEvent );
	    //tinyMCE.addEvent(inst.getBody(), "input", TinyMCE_CMLangTermsPlugin._handlePasteEvent );

	    var pathElem = document.getElementById(inst.editorId + "_path");
	    var d = document.createElement("span");
	    d.style.display = "inline";
	    d.style.fontSize = "small";
	    d.style.paddingLeft = "5";
	    var textElem = document.createTextNode("");
	    d.appendChild(textElem);
	    inst._cmstatus = textElem;


	    pathElem.parentNode.insertBefore(d, pathElem);
	},

	setupContent : function(editor_id, body, doc) {
	    this._updateVars(doc);
	},

	getControlHTML : function(cn)	{
		switch (cn) {
			case "cmload":
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_load_desc', '{$pluginurl}/images/open.png', 'mceCMLoad');
			case "cmcvttoscheme":
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_cvttoscheme_desc', '{$pluginurl}/images/cmcvttoscheme.png', 'mceCMCvtToScheme');
			case "cmhelp":
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_help_desc', '{$pluginurl}/images/cmhelp.png', 'mceCMHelp');
			case "cmcvtlangtermsall":
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_cvttermsall_desc', '{$pluginurl}/images/cvtlangtermsall.png', 'mceCMCvtLangTermsAll');
			case "cmcvtlangterm":
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_cvtterm_desc', '{$pluginurl}/images/cvtlangterm.png', 'mceCMCvtLangTerm');

			case "cmtranslate":
			   {
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_translate_desc', '{$pluginurl}/images/translate.png', 'mceCMTranslate');
			   }
			case "cmlangterms":
			   {
			   	return tinyMCE.getButtonHTML(cn, 'lang_cmlang_terms_desc', '{$pluginurl}/images/cmlangterms.png', 'mceCMLangTerms');
			   }
		}

		return "";
	},

	execCommand : function(editor_id, element, command, user_interface, value) {
		// Handle commands
		switch (command) {
			case "mceCMLoad":
			{
			    var template = new Array();
			    var t = tinyMCE.getInstanceById(editor_id);
			    template['file'] = '../../plugins/cmlangterms/cmload.htm'; // Relative to theme
			    template['width'] = 325;
			    template['height'] = 150;

			    var t = tinyMCE.getInstanceById(editor_id);
			    var loadCallback = new this._loadCallback(this, editor_id);

			    tinyMCE.openWindow(template, {callback: loadCallback, editor_id : editor_id, inline: "yes", resizable : "yes"});
			    return true;
			}
			case "mceCMCvtToScheme":
			{
			    var template = new Array();
			    var t = tinyMCE.getInstanceById(editor_id);
			    template['file'] = '../../plugins/cmlangterms/cmcvttoscheme.html'; // Relative to theme
			    template['width'] = 550;
			    template['height'] = 500;

			    var callback = new this._convertToSchemeCallback(this, t);

			    var ruleManagers = new Array();
			    ruleManagers[0]  = new GeneralConvertToSchemeRulesManager();
			    ruleManagers[1]  = new NonTamilConvertToSchemeRulesManager();
			    ruleManagers[2]  = new KannadaTeluguConvertToSchemeRulesManager();
			    ruleManagers[3]  = new TamilConvertToSchemeRulesManager();
			    tinyMCE.openWindow(template, {callback: callback, ruleManagers: ruleManagers, categories: this.categories, editor_id : editor_id, inline : "yes", resizable : "yes"});

			    return true;
			}

			case "mceCMFonts":
			{
			    var template = new Array();
			    var t = tinyMCE.getInstanceById(editor_id);
			    template['file'] = '../../plugins/cmlangterms/cmfonts.htm'; // Relative to theme
			    template['width'] = 550;
			    template['height'] = 225;

			    //var callback = new this._convertToSchemeCallback(this, t);

			    //tinyMCE.openWindow(template, {callback: callback, ruleManagers: ruleManagers, categories: this.categories, editor_id : editor_id, inline : "yes", resizable : "yes"});
			    tinyMCE.openWindow(template, {settings : value, editor_id : editor_id, inline : "yes", resizable : "yes"});
			    return true;
			}


			case "mceCMCvtLangTermsAll":
			{
			    var inst = tinyMCE.getInstanceById(editor_id);
			    convertMatchingWordsToTerms(inst, inst.contentWindow.document, this.categories);
			    return true;
			}

			case "mceCMCvtLangTerm":
			{
			    var inst = tinyMCE.getInstanceById(editor_id);
			    this._getCurTerm(inst, true);
			    return true;
			}

			case "mceCMTranslate":
			{
			    var inst = tinyMCE.getInstanceById(editor_id);
			    var txt  = tinyMCE.getContent();
			    if( txt && CMTransliterationEditor  )
				CMTransliterationEditor.update(txt, this.categories,SanskritAnuswaraDb);
			    return true;
			}

			case "mceCMLangTerms":
			{
				var inst = tinyMCE.getInstanceById(editor_id);
				var word = this._getSelection(inst);
				if( word != "" ) {
				    alert("cannot insert variable when text is selected");
				    return true;
				}

				word = this._getCurTerm(inst);
				if( word != "" ) {
				    alert("already at a variable");
				    return true;
				}

				var template = new Array();
				var t = tinyMCE.getInstanceById(editor_id);
				template['file'] = '../../plugins/cmlangterms/cmlangterms.htm'; // Relative to theme
				template['width'] = 450;
				template['height'] = 250;

				// Language specific width and height addons
				//template['width'] += tinyMCE.getLang('lang_emotions_delta_width', 0);
				//template['height'] += tinyMCE.getLang('lang_emotions_delta_height', 0);
				var callback = new this._insertVariableCallback(this, t);
				tinyMCE.openWindow(template, {callback: callback, categories: this.categories, editor_id : editor_id, inline : "yes", resizable : "yes"});
				return true;
			}

			case "mceCMHelp":
			{
				var template = new Array();
				var t = tinyMCE.getInstanceById(editor_id);
				template['file'] = '../../plugins/cmlangterms/cmhelp.htm'; // Relative to theme
				template['width'] = 550;
				template['height'] = 450;

				// Language specific width and height addons
				//template['width'] += tinyMCE.getLang('lang_emotions_delta_width', 0);
				//template['height'] += tinyMCE.getLang('lang_emotions_delta_height', 0);
				tinyMCE.openWindow(template, {editor_id : editor_id, inline : "yes", resizable : "yes"});
				return true;
			}
		}

		// Pass to next handler in chain
		return false;
	},


	/**
	 * Gets called ones the cursor/selection in a TinyMCE instance changes. This is useful to enable/disable
	 * button controls depending on where the user are and what they have selected. This method gets executed
	 * alot and should be as performance tuned as possible.
	 *
	 * @param {string} editor_id TinyMCE editor instance id that was changed.
	 * @param {HTMLNode} node Current node location, where the cursor is in the DOM tree.
	 * @param {int} undo_index The current undo index, if this is -1 custom undo/redo is disabled.
	 * @param {int} undo_levels The current undo levels, if this is -1 custom undo/redo is disabled.
	 * @param {boolean} visual_aid Is visual aids enabled/disabled ex: dotted lines on tables.
	 * @param {boolean} any_selection Is there any selection at all or is there only a cursor.
	 */
	handleNodeChange : function(editor_id, node, undo_index, undo_levels, visual_aid, any_selection) 	 {
	},

	// findPosX and findPosY: borrowed from http://www.quirksmode.org/js/findpos.html
	_findPosX : function(obj)
	{
		var curleft = 0;
		if (obj.offsetParent)
		{
			while (obj.offsetParent)
			{
				curleft += obj.offsetLeft
				obj = obj.offsetParent;
			}
		}
		else if (obj.x)
			curleft += obj.x;
		return curleft;
	},

	// findPosX and findPosY: borrowed from http://www.quirksmode.org/js/findpos.html
	_findPosY : function(obj)
	{
		var curtop = 0;
		if (obj.offsetParent)
		{
			while (obj.offsetParent)
			{
				curtop += obj.offsetTop
				obj = obj.offsetParent;
			}
		}
		else if (obj.y)
			curtop += obj.y;
		return curtop;
	},

	/**
	 * given an event received by a keyboard input handler, get the character
	 * @param {Event} e		event received by a keyboard input handler
	 *
	 * @return the character code of the character corresponding to the key
	 * @type int
	 */
	_getCharFromEvent : function(e) 
	{
	    var cc = 0;
	    if( e && e.which ) cc = e.which; // NS
	    else if( e.keyCode ) cc = e.keyCode;
	    return cc;
	},

	handleEvent : function(e)  {
	    if( e.type == "keypress" ) {	/* NEW METHOD FOR HANDLING VARIABLES */
		var cc = this._getCharFromEvent(e);
		if( cc == 8 || cc == 9 || cc == 32 || (cc >= 48 && cc <= 127) ) {
		    var pos = this._getCurPos(tinyMCE.selectedInstance);
		    var origNode = null;
		    if( pos && pos.node && pos.node.nodeType == 3 )  {
			origNode = pos.node;
			pos.node = pos.node.parentNode;
		    }
		    if( pos && pos.node && pos.node.className && pos.node.className == "cmvar" ) {
			tinyMCE.cancelEvent(e);
			if(origNode && (pos.offset == 0 || pos.offset == origNode.nodeValue.length) ) {
			    var s = String.fromCharCode(cc);
			    var t = tinyMCE.selectedInstance.contentWindow.document.createTextNode(s);
			    if( pos.offset == 0 ) {
				pos.node.parentNode.insertBefore( t, pos.node);
			    }
			    else {
				if( pos.node.nextSibling )
				    pos.node.parentNode.insertBefore( t, pos.node.nextSibling );
				else
				    pos.node.parentNode.appendChild( t );
			    }
			    tinyMCE.execCommand('mceSelectNode',t);
			}
			return false;
		    }
		}
	    }
	    if( e.type == "keydown" ) {	/* NEW METHOD FOR HANDLING VARIABLES */
		var cc = this._getCharFromEvent(e);
		var pos = this._getCurPos(tinyMCE.selectedInstance);
		var origNode = null;
		if( pos && pos.node && pos.node.nodeType == 3 )  {
		    origNode = pos.node;
		    pos.node = pos.node.parentNode;
		}
		if( pos && pos.node && pos.node.className && pos.node.className == "cmvar" ) {
		    if( e.type == "keydown" ) {
			if( cc == 9 || cc == 13 || cc == 32 || (cc >= 48 && cc <= 90) || (cc >= 96 && cc <= 105) ||
				(cc == 	110 || cc == 188 )) {
			    if(origNode && (pos.offset != 0 && pos.offset != origNode.nodeValue.length) ) {
				//var s = String.fromCharCode(cc);
				//var t = tinyMCE.selectedInstance.contentWindow.document.createTextNode(s);
				//tinyMCE.execCommand('mceAddUndoLevel',false);
				//if( origNode.nextSibling )
				    //origNode.parentNode.insertBefore( t, origNode.parentNode.nextSibling );
				//else
				    //origNode.parentNode.appendChild( t );
				//tinyMCE.execCommand('mceSelectNode',t);
				tinyMCE.cancelEvent(e);
			    }
			    else {
				tinyMCE.execCommand('mceAddUndoLevel',false);
				return true; 
			    }
			}
			else if( cc == 8 || cc == 46 ) {
			    tinyMCE.cancelEvent(e);
			    tinyMCE.execCommand('mceAddUndoLevel',false);
			    pos.node.parentNode.removeChild(pos.node);
			}
			else if (cc >= 35 && cc <= 40 ) {}
			else {
			    tinyMCE.cancelEvent(e);
			}
			return false;
		    }
		}
		/*
		else if( cc == 13 && pos && pos.node ) {
		    if( pos.node.lastChild && pos.node.lastChild.tagName && 
		    		pos.node.lastChild.tagName.toLowerCase() == "br" ) {
			tinyMCE.execCommand('mceAddUndoLevel',false);
			pos.node.removeChild(pos.node.lastChild);
			var p = tinyMCE.selectedInstance.contentWindow.document.createElement("p");
			//p.appendChild(tinyMCE.selectedInstance.contentWindow.document.createTextNode("\xa0para"));
			pos.node.appendChild(p);
			//tinyMCE.execCommand('mceReplaceContent',false,'<p>&nbsp;</p>');
			return false;
		    }
		}
		*/
	    }
	    if( e.type == "click" ) {
		this._caretPositionChanged(tinyMCE.selectedInstance);
	    }
	    else if( e.type == "keyup" ) {
		this._caretPositionChanged(tinyMCE.selectedInstance);

		/* NEW METHOD FOR HANDLING VARIABLES */
		var pos = this._getCurPos(tinyMCE.selectedInstance);
		if( pos && pos.node && pos.node.nodeType == 3 ) {
		    var p = pos.node.parentNode;
		    if( p && p.className && p.className == "cmvar" ) {
			var termid = p.id;
			var term = findTerm(termid, this.categories);
			if( term ) {
			    var expval1 = term.getVal("default").toLowerCase();
			    var expval2 = term.name().toLowerCase();
			    var v = pos.node.nodeValue.toLowerCase();
			    if( v != expval1 && v != expval2 ) {
				tinyMCE.execCommand('mceAddUndoLevel',false);
				p.parentNode.removeChild(p);
			    }
			}

		    }
		}
	    }
	    return true;
	},

	_updateVars : function(doc) {
	    var elems = doc.getElementsByTagName("span");
	    for(var i = 0; i < elems.length; i++ ) {
		var elem = elems[i];
		if( elem.className && elem.className == "cmvar") {
		    var termid = elem.id;
		    var term = findTerm(termid, this.categories);
		    if( term ) {
			var expval1 = term.getVal("default").toLowerCase();
			var expval2 = term.name().toLowerCase();
			var val = "";
			var c   = elem.firstChild;
			while(c) {
			    if( c.nodeType == 3 )  {
				val = c.nodeValue;
				break;
			    }
			    c = c.nextSibling;
			}
			var v = val.toLowerCase();
			if( v != expval1 && v != expval2 ) {
			    elem.innerHTML = term.getVal("default");
			}
		    }
		}
	    }
	},


	onChange : function(inst) 
	{
	},

	_caretPositionChanged : function(inst) 
	{
	    var cmstatus = inst._cmstatus;
	    if( !cmstatus ) return;

	    var termName               = this._getCurTerm(inst);
	    this._updateStatus(inst, termName);
	},

	_updateStatus : function(inst, termName) {
	    var cmstatus = inst._cmstatus;
	    if( !cmstatus ) return;

	    if(termName != null && termName != "" )  {
		var term = findTerm(termName, this.categories);
		if( term == null ) {
		    cmstatus.nodeValue = "undefined variable " + termName + "!";
		    cmstatus.parentNode.style.color = "#ff0000";
		}
		else {
		    cmstatus.parentNode.style.color = "#000080";
		    cmstatus.nodeValue = "Pre-defined variable " + term.fName;
		}
	    }
	    else
		cmstatus.nodeValue = "";
	},

	_isTermChar : function(ch) 
	{
	    return ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9'));
	},

	_getSelection: function(inst) 
	{
	    if(inst.contentWindow.document && inst.contentWindow.document.selection) {
		// IE
		var oSel = inst.contentWindow.document.selection.createRange();
		return oSel.text;
	    }
	    else
		return inst.contentWindow.getSelection();
	},

	_getCurPos : function(inst, selok)
	{
	    var posobj = null;
	    var iframe = inst;
	    if( !iframe ) return null;
	    var node = null;
	    var offset = null;
	    if(iframe.contentWindow.document && iframe.contentWindow.document.selection) {
		// IE
		var oSel = iframe.contentWindow.document.selection.createRange();
		if( selok || (oSel.text == "")) {
		    var pos = this._getIEPosition(iframe.contentWindow.document,oSel);
		    posobj = new Object();
		    posobj.node = pos.node;
		    posobj.offset = pos.offset;
		}
	    }
	    else if(iframe.contentWindow.getSelection) {
		// safari, firefox
		var sel = iframe.contentWindow.getSelection();
		if( (selok || sel == "") && sel.focusNode && sel.focusNode != "undefined") {
		    var selNode = sel.focusNode;
		    //alert(selNode.nodeType);
		    //if( selNode.nodeType == 3 ) {
			posobj = new Object();
			posobj.node = selNode;
			posobj.offset = sel.focusOffset;
		    //}
		}
	    }
	    return posobj;
	},

	_getCurTerm : function(inst, cvt) 
	{
	    var iframe = inst;
	    if( !iframe ) return "";

	    var sel = null;
	    if( cvt )
		sel = this._getSelection(inst);
	    if( sel && sel != "" ) {
		var word = "" + sel;
		var w = word.toLowerCase();
		var t = findTermByNameOrVal(w, this.categories);
		if( t == null ) {
		    var s = "There is no matching variable for '" + word + "'.";
		    alert(s);
		    return "";
		}
		tinyMCE.execCommand('mceAddUndoLevel',false);

		//alert("hi");
		//tinyMCE.execCommand('mceReplaceContent',false," ");
		//alert("hu");
		//var posobj = this._getCurPos(inst);
		//if( !posobj ) {
		    //alert("internal error");
		    //return;
		//}
		this._onInsertVariable(tinyMCE.selectedInstance, t, word);
		return t.name();
	    }
	    else {
		var posobj = this._getCurPos(inst);
		if( !posobj ) return "";
		var node = posobj.node;
		var offset = posobj.offset;
		var varNode = null;
		if( node && node.nodeType == 3 ) {
		    node = node.parentNode;
		}
		if( node && node.className &&  node.className == "cmvar" ) {
		    if( cvt ) {
			alert( "already a  variable!" );
			return;
		    }
		    return node.id;
		}
		if( !cvt )
		    return "";

		var node = posobj.node;
		var curOffset = posobj.offset;
		var startOffset = curOffset;

		var selNode  = posobj.node;
		var contents = selNode.nodeValue;
		var l = contents.length;
		var goback = true;
		var ch;
		if( curOffset > 0 && curOffset == l ) {
		    curOffset--;
		}
		else {
		    ch = 0;
		    if( curOffset < l ) ch = contents.charAt(curOffset);
		    //if( ch == ' ' || ch == '\t' )
		    if( !this._isTermChar(ch)) {
			if(curOffset) curOffset--;
		    }
		    else if( curOffset ) {
			var chBefore = contents.charAt(curOffset-1);
			if( chBefore == ' ' || chBefore == '\t' ) {
			    goback = false;
			}
		    }
		}
		if( curOffset == 0 )
		    goback = false;
		if( goback ) {
		    while(true) {
			ch = contents.charAt(curOffset);
			if( !this._isTermChar(ch) ) {
			    //if( ch == ' ' || ch == '\t' ) { curOffset++; }
			    if( goback ) curOffset++;
			    break; 
			}
			if( goback && (curOffset == 0) ) break;
			else if( !goback && curOffset == (l-1)) break;
			if( goback ) curOffset--;
			else	     curOffset++;
		    }
		}
		word = "";
		startOffset = curOffset;
		while(curOffset < l) {
		    ch = contents.charAt(curOffset);
		    if( this._isTermChar(ch) || (word == "" && ch == '$'))
			word += ch;
		    else  {
			break;
		    }
		    curOffset++;
		}

		var w = word.toLowerCase();
		var t = findTermByNameOrVal(w, this.categories);
		if( t == null ) {
		    var s = "There is no matching variable for '" + word + "'.";
		    alert(s);
		    return "";
		}
		tinyMCE.execCommand('mceAddUndoLevel',false);

		var nv = node.nodeValue;
		var val = nv.substring(0,startOffset);

		var trailer = node.nodeValue.substring(startOffset+word.length);
		var trailerNode = null;
		if( trailer != "" )
		    trailerNode = inst.contentWindow.document.createTextNode(trailer);

		node.nodeValue = val;


		if( trailerNode ) {
		    if( node.nextSibling )
			node.parentNode.insertBefore(trailerNode, node.nextSibling);
		    else
			node.parentNode.appendChild(trailerNode);
		}

		var sp = inst.contentWindow.document.createElement("span");
		sp.className = "cmvar";
		sp.id        = t.name();
		sp.style.color = "#000080";
		sp.style.backgroundColor = "#c0c0c0";
		sp.appendChild(inst.contentWindow.document.createTextNode(word));

		if( trailerNode )
		    node.parentNode.insertBefore(sp, trailerNode);
		else {
		    if( node.nextSibling )
			node.parentNode.insertBefore(sp, node.nextSibling);
		    else
			node.parentNode.appendChild(sp);
		}
		tinyMCE.execCommand('mceAddUndoLevel',false);
		return t.name();

	    }
	},

	/**
	 * determine the current term at caret position if any
	 * @type LanguageSpecificTerm
	 * OLD METHOD, USES "$"
	 */
	_getCurTermOld : function(inst, cvt) 
	{
	    var iframe = inst;
	    if( !iframe ) return "";
	    var posobj = this._getCurPos();
	    if( !posobj ) return "";
	    var node = posobj.node;
	    var offset = posobj.offset;
	    if( node != null && node.nodeValue && offset != null ) {
		var selNode = node;
		var curOffset = offset;
		var contents = selNode.nodeValue;
		var l = contents.length;
		var goback = true;
		var ch;
		if( curOffset > 0 && curOffset == l ) {
		    curOffset--;
		}
		else {
		    ch = 0;
		    if( curOffset < l ) ch = contents.charAt(curOffset);
		    //if( ch == ' ' || ch == '\t' )
		    if( !this._isTermChar(ch)) {
			if(curOffset) curOffset--;
		    }
		    else if( curOffset ) {
			var chBefore = contents.charAt(curOffset-1);
			if( chBefore == ' ' || chBefore == '\t' ) {
			    goback = false;
			}
		    }
		}
		if( curOffset == 0 )
		    goback = false;
		if( goback ) {
		    while(true) {
			ch = contents.charAt(curOffset);
			if( !this._isTermChar(ch) ) {
			    if( ch == ' ' || ch == '\t' ) { curOffset++; }
			    break; 
			}
			if( goback && (curOffset == 0) ) break;
			else if( !goback && curOffset == (l-1)) break;
			if( goback ) curOffset--;
			else	     curOffset++;
		    }
		}
		var word = "";
		var startOffset = curOffset;
		while(curOffset < l) {
		    ch = contents.charAt(curOffset);
		    if( this._isTermChar(ch) || (word == "" && ch == '$'))
			word += ch;
		    else  {
			break;
		    }
		    curOffset++;
		}
		if( cvt ) {
		    if( word.charAt(0) == '$' )  {
			alert("already a variable: " + word );
			return "";
		    }
		    else {
			var term = findTerm(word, this.categories);
			if( term == null ) {
			    var s = "There is no variable defined whose name is '" + word + "'.";
			    s += " Go ahead and convert anyway?";
			    if( confirm(s) != true )
				return "";
			}
			var nv = node.nodeValue;
			var val = nv.substring(0,startOffset);
			val += "$";
			val += nv.substring(startOffset);
			node.nodeValue = val;
			return "$" + word;
		    }
		}
		else {
		    if( !cvt && word != "" && word.charAt(0) == '$')
			return word.substring(1);
		}
	    }
	    return "";
	},

	/**
	 * Takes an Internet Explorer TextRange object and returns a W3C node and offset pair.
	 * <p>The basic method is as follows:
	 * <ul><li>Create a new range with its start at the beginning of the element and its end at the target position. Set the rangeLength to the length of the range's text.
	 * <li>Starting with the first child, for each child:
	 * <ul><li>If the child is a text node, and its length is less than the rangeLength, then move the range's start by the text node's length.
	 * <li>If the child is a text node and its length is less than the rangeLength then we've found the target. Return the node and use the remaining rangeLength as the offset.
	 * <li>If the child is an element, move the range's start by the length of the element's innerText.
	 * </ul></ul>
	 * <p>This algorithm works fastest when the target is close to the beginning of the parent element.
	 * The current implementation is smart enough pick the closest end point of the parent element (i.e. the start or the end), and work forward or backward from there.
	 * @private
	 * @param {TextRange} textRange A TextRange object. Its start position will be found.
	 * @type Object
	 * @return An object with "node" and "offset" properties.
	 */
	_getIEPosition : function(doc,textRange) {
		var element = textRange.parentElement();
		var range = doc.body.createTextRange();
		range.moveToElementText(element);
		range.setEndPoint("EndToStart", textRange);
		var rangeLength = range.text.length;

		// Choose Direction
		if(rangeLength < element.innerText.length / 2) {
			var direction = 1;
			var node = element.firstChild;
		}
		else {
			direction = -1;
			node = element.lastChild;
			range.moveToElementText(element);
			range.setEndPoint("StartToStart", textRange);
			rangeLength = range.text.length;
		}

		// Loop through child nodes
		while(node) {
			switch(node.nodeType) {
				case 3: // mozile.dom.TEXT_NODE:
					nodeLength = node.data.length;
					if(nodeLength < rangeLength) {
						var difference = rangeLength - nodeLength;
						if(direction == 1) range.moveStart("character", difference);
						else range.moveEnd("character", -difference);
						rangeLength = difference;
					}
					else {
						if(direction == 1) return {node: node, offset: rangeLength};
						else return {node: node, offset: nodeLength - rangeLength};
					}
					break;

				default:
					nodeLength = node.innerText.length;
					if(direction == 1) range.moveStart("character", nodeLength);
					else range.moveEnd("character", -nodeLength);
					rangeLength = rangeLength - nodeLength;
					break;
			}
		
			if(direction == 1) node = node.nextSibling;
			else node = node.previousSibling;
		}


		// The TextRange was not found. Return a reasonable value instead.
		return {node: element, offset: 0};
	},

	 
	_initLangTerms : function() 
	{
	    if( this.categories != null ) return;

	    this.categories       = new Array();
	    var categories = this.categories;
	    var generalTerms = new Array();
	    categories["General"] = generalTerms;

	    generalTerms["raga"] = new LanguageSpecificTerm("Raga", 
						new Array( "default", "rAga",
							   "telugu",  "rAgam",
							   "tamil",   "rAgam"));
	    generalTerms["tala"] = new LanguageSpecificTerm("Tala", 
						new Array( "default", "tALa",
							   "telugu",  "tALam",
							   "tamil",   "tALam"));
	    generalTerms["composer"] = new LanguageSpecificTerm("Composer", 
						new Array( "default", "vaggeyakkArA",
							   "tamil",   "vAggeyakkArar"));
	    generalTerms["language"] = new LanguageSpecificTerm( "Language",
						new Array( "default", "bAsha",
							   "tamil",   "mozhi" ));
	    generalTerms["tamil"] = new LanguageSpecificTerm( "Tamil",
						new Array( "default", "tamizh"));
	    generalTerms["telugu"] = new LanguageSpecificTerm( "Telugu",
						new Array( "default", "telugu",
							   "tamil",   "telungu"));
	    generalTerms["sanskrit"] = new LanguageSpecificTerm( "Sanskrit",
						new Array( "default", "samskR.tam",
							   "tamil",   "samaskR.tam"));
	    generalTerms["kannada"] = new LanguageSpecificTerm( "Kannada",
						new Array( "default", "kannaDa",
							   "tamil",   "kannaDam"));
	    generalTerms["malayalam"] = new LanguageSpecificTerm( "Malayalam",
						new Array( "default", "malayALam"));

	    generalTerms["madhyamakala"] = new LanguageSpecificTerm("Madhyamakala", 
						new Array( "default", "madyama kAlA",
							   "tamil",   "madyama kAlam"));
	    var songTerms = new Array();
	    categories["Parts in a song"] = songTerms;

	    songTerms["swara"] = new LanguageSpecificTerm("Swara", 
						new Array( "default", "svara",
							   "tamil",   "svaram"));
	    songTerms["svara"] = new LanguageSpecificTerm("Svara", 
						new Array( "default", "svara",
							   "tamil",   "svaram"));
	    songTerms["pallavi"] = new LanguageSpecificTerm( "Pallavi",
						new Array( "default", "pallavi"));
	    songTerms["anupallavi"] = new LanguageSpecificTerm( "Anupallavi",
						new Array( "default", "anupallavi"));
	    songTerms["charanam"] = new LanguageSpecificTerm( "Charanam",
						new Array( "default", "caraNam",
							   "kannada", "caraNa" ));
	    songTerms["caranam"] = new LanguageSpecificTerm( "Caranam",
						new Array( "default", "caraNam",
							   "kannada", "caraNa" ));

	    var composers = new Array();
	    categories["Composers"] = composers;
	    composers["thyagaraja"] = new LanguageSpecificTerm( "Thyagaraja",
						new Array( "default", "tyAgarAja",
							   "tamil",   "tiyAgarAjar"));
	    composers["thyagarajaswami"] = new LanguageSpecificTerm( "ThyagarajaSwami",
						new Array( "default", "tyAgarAjasvAmi",
							   "tamil",   "tiyAgarAjasuvAmigaL"));
	    composers["syamasastri"] = new LanguageSpecificTerm( "SyamaSastri",
						new Array( "default", "SyAmA Sastri",
							   "tamil",   "siyAmA SAstrigaL"));
	    composers["patnam"] = new LanguageSpecificTerm( "Patnam",
						new Array( "default", "paTNAm subramaNya ayyar",
							   "tamil",   "paTTaNam subramanyA ayyar"));
	    composers["dikshitar"] = new LanguageSpecificTerm( "Dikshitar",
						new Array( "default", "muttusvAmi dIkshitar"));

	    for( var c in categories ) 
		categories[c].sort(termSorter);

	},

	_onInsertVariable: function(inst, term, content) {
		var html = '<span class="cmvar" style="background-color:#C0C0C0;color:#000080;" id="' + term.name() + '">';
		if( !content || trim(content) == "" )
		    html += term.getVal("default");
		else
		    html += content;
		html += '</span>';
		tinyMCE.execCommand('mceInsertContent',false,html);
		this._updateStatus(inst, term.name());
	},

	_convertToScheme : function(node, rules, phase) {
	    if( node.nodeType == 3 ) {
		var nv = node.nodeValue;
		for(r in rules) {
		    if( rules[r].rule.getPhase() == phase ) 
			nv = rules[r].manager.handleRule(rules[r].rule, nv);
		}
		node.nodeValue = nv;
	    }
	    else if( node.firstChild ) {
		var c = node.firstChild;
		while(c) {
		    this._convertToScheme(c, rules, phase);
		    c = c.nextSibling;
		}
	    }
	},

	_insertVariableCallback: function(plugin, inst) {
	    this.plugin = plugin;
	    this.inst   = inst;
	    this.onInsertVariable = function(term) {
		this.plugin._onInsertVariable(this.inst, term);
	    }
	},

	_convertToSchemeCallback: function(plugin, inst) {
	    this.plugin = plugin;
	    this.inst   = inst;
	    this.convertToScheme = function(rules) {
		tinyMCE.execCommand('mceAddUndoLevel',false);
		for(var phase = 1; phase <= 2; phase++ ) { 
		    this.plugin._convertToScheme(this.inst.contentWindow.document, rules, phase);
		}
		tinyMCE.execCommand('mceAddUndoLevel',false);
	    }
	},

	_loadCallback: function(plugin, editor_id) {
	    this.plugin = plugin;
	    this.editor_id   = editor_id;
	    this.onLoad = function(response) {
		tinyMCE.execInstanceCommand(this.editor_id, 'mceSetContent', false, response);
	    }
	},

	_handlePasteEvent : function(e) {
		alert(e.type);
	}

};

tinyMCE.addPlugin("cmlangterms", TinyMCE_CMLangTermsPlugin);
