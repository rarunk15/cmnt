var leg_languages = new Array();
leg_languages["sanskrit"]    = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_SANSKRIT);
leg_languages["telugu"]      = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_TELUGU);
leg_languages["tamil"]       = new TamilTranslator();
leg_languages["kannada"]     = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_KANNADA);
leg_languages["malayalam"]   = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_MALAYALAM);

function indic(txt) { return '<span class="indic">' + txt + '</span>'; }
function indicl(txt) { return '<span class="indicl">' + txt + '</span>'; }
function sch(txt) { return '<span class="scheme">' + txt + '</span>'; }

function schchoice(txt, delim) { 
    var l = txt.length;
    var idx = 0;
    var pattern;
    var t = "";
    if( !delim ) delim = '/';
    while(idx < l) {
	var cidx = txt.indexOf(delim,idx);
	if( cidx >= 0 ) {
	    pattern = txt.substring(idx,cidx);
	}
	else
	    pattern = txt.substring(idx);
	t += sch(pattern);
	if( cidx < 0 )
	    break;
	else
	    t += delim;
	idx = cidx+delim.length;
    }
    return t;
}

function sn(txt) { return leg_languages["sanskrit"].translate(txt); }
function tl(txt) { return leg_languages["telugu"].translate(txt); }

function kn(txt) { return leg_languages["kannada"].translate(txt); }
function ml(txt) { return leg_languages["malayalam"].translate(txt); }

function tm(txt,scheme) 
{ 
    if( !scheme ) scheme = "noqual";
    leg_languages["tamil"].setQualScheme(scheme);
    return leg_languages["tamil"].translate(txt); 
}
function tmi(t, scheme) { 
    if( t == "." ) return '<span style="font-size:70%;">ignored</span>';
    return indic(tm(t,scheme));
}
function sni(t) 
{
    if( t == "M" ) { return indic("\u200d" + sn("aM").substring(1,2));} 
    else if( t == "H" || t == "H2" ) { return indic("\u200d" + sn("aHta").substring(1,2));} 
    else if( t == "." ) { return indic( sn("E.ham").substring(1,1) ); }
    return indic(sn(t)); 
}
function tli(t) 
{ 
    if( t == "M" ) { return indic("\u200d" + tl("aM").substring(1,2)); } 
    else if( t == "H" || t == "H2" ) { return indic("\u200d" + sn("aH").substring(1,2));} 
    else if( t == "." ) return '<span style="font-size:70%;">ignored</span>';
    return indic(tl(t)); 
}
function kni(t) 
{ 
    if( t == "M" ) { return indic("\u200d" + kn("aM").substring(1,2)); } 
    else if( t == "H" || t == "H2" ) { return indic("\u200d" + sn("aH").substring(1,2));} 
    else if( t == "." ) return '<span style="font-size:70%;">ignored</span>';
    return indic(kn(t)); 
}
function mli(t) 
{ 
    if( t == "M" ) { return indic("\u200d\u0d02"); }
    else if( t == "H" || t == "H2" ) { return indic("\u200d" + ml("aH").substring(1,2));} 
    else if( t == "." ) return '<span style="font-size:70%;">ignored</span>';
    return indic(ml(t)); 
}

function trn(t) 
{
    var l = txt.length;
    var idx = 0;
    var pattern;
    var t = "";
    while(idx < l) {
	var cidx = txt.indexOf('#',idx);
	if( cidx >= 0 ) {
	    var eidx = txt.indexOf(')',cidx+1);
	    if( eidx > 0 ) {
		pattern = txt.substring(cidx+1,eidx+1);
		t += txt.substring(idx,cidx);
		t += eval(pattern);
		idx = eidx+1;
		continue;
	    }
	    t += txt.substring(idx,cidx+1);
	    idx = cidx + 1;
	}
	else {
	    t += txt.substring(idx);
	    idx = l;
	}
    }
    return t;
}

function isHard(txt) {
    var c = txt.charAt(0);
    if( c == 'k' || c == 'c' || c == 'T' || c == 't' || c == 'p' )
	return true;
    return false;
}


function addNote(t) {
    var n = '<span style="font-size:70%;">';
    n += t;
    n += '</span>';
    return n;
}


function tmc(txt) {
    var t;
    if( txt == "na" ) {
	var q1  = tmi(txt,"noqual");
	q2 = indic(tm("ana","noqual").substring(1));
	t = '<td colspan="2">' + q1 + " / " + q2;
	var n = '<ul style="text-align:left;"><li>';
	n += sch('na') + " => ";
	n += q1;
	n += ', when at beginning of word, else => ' + q2;
	n += '<li>' + sch('n') + ' by itself i.e. as a mei/virama is ' + indic(tm("nAn","noqual").substring(2))
	    			+ " except in the following contexts:";
	n += '<ul><li> becomes ' + indic(tm("and","noqual").substring(1,3));
	n += " when preceding a " + sch('da') + ' as in ' + sch('anda') + " => " + tmi( "anda", "noqual");
	n += '<li>becomes ' + sch('~n') + ' i.e. ' + indic(tm("anj", "noqual").substring(1,3));
	n += " when preceding " + schchoice('ca/cha/ja/jha') + ' as in '
		+ sch('panca') + ", which gets rendered as " + tmi("panca","natural") + "/" + tmi("panca","nohard")
		+ " depending on the qualifier scheme";
	n += '</ul></ul>';
	t += addNote(n);
	return t;
    }
    else if( txt == "M" ) {
	var t = '<td colspan="2">' + 
	    indic(tm("#n",'noqual')) + "/" +
	    indic(tm("~n",'noqual')) + "/" +
	    indic(tm("N",'noqual')) + "/" +
	    indic(tm("n",'noqual')) + "/" +
	    indic(tm("m",'noqual'));
	var n = '<ul style="text-align:left;">';
	n  += '<li>Tamil has no concept of bindu/anuswara, and so the letter morphs to';
	n  += ' the tamil letter that represents the sound of the bindu/anuswara depending on the context';
	n  += '<li>Becomes ' + tmi("#n") + " when before " + schchoice('k/kh/g/gh') + ".";
	n  += '<li>Becomes ' + tmi("~n") + " when before " + schchoice('c/ch/j/jh') + ".";
	n  += '<li>Becomes ' + tmi("N") + " when before " + schchoice('T/Th/D/Dh') + ".";
	n  += '<li>Becomes ' + tmi("n") + " when before " + schchoice('t/th/d/dh') + ".";
	n  += '<li>Becomes ' + tmi("m") + " when before " + schchoice('p/ph/b/bh');
	t += addNote(n);
	return t;
    }
    var q  = tmi(txt,"always");
    var nq = tmi(txt,"noqual");
    if( q == nq || txt.indexOf("ha") > 0 || txt == "Sa" )
	t = '<td colspan="2">' + q;
    else
	t = '<td colspan="2">' + nq + " / " + q;
    if( txt == "Ta" ) {
	var n = '<ul style="text-align:left;"><li>Becomes ' + sch('R') + ' when preceding ' +
	    		schchoice('R/r') + ' and succeeding a vowel, as in ' + sch('kATRil') + ' => ';
	n += tmi("kATril","natural") + ', but ' + sch('saurAShTram') + ' => ' + tmi('saurAShTram') + '</ul>';
	t += addNote(n);
    }
    else if( txt == "Da" ) {
	var n = '<ul style="text-align:left"><li>The combination ' + schchoice('DR/dr') 
		+ ' becomes ' + sch('R') + ' as in ' + tmi('ninRa') 
		+ ', which chould be specified as ' 
		+ schchoice('ninDRa/ninDra') + ' besides ' + sch('ninRa') 
		+ '.';
	n += '<ul>';
	t += addNote(n);
    }
    else if( txt == "ja" ) {
	var q1;
	var s1 =  tm('nja',"always");
	var nqs1;
	var sa_index1 = s1.indexOf( '\u0b9a' );
	if( sa_index1 >= 0 ) {
	    var sup_end = s1.indexOf("span>",sa_index1);
	    if( sup_end > 0 )
		q1 = indic(s1.substring(sa_index1,sup_end+5));
	}

	if( q1 ) {
	    var nj = indic(tm('nja', "noqual").substring(0,2));
	    var nqs1 =  tm('nja', "noqual").substring(2);
	    var nq1 = indic(nqs1);
	    t += ' / ' +  nq1 + ' / ' + q1;

	    var n = '<ul style="text-align:left;"><li>' + nq1 + '/ ' + q1 + ' used when following ' + nj + ' as in ' + 
		schchoice('panja/pa~nja') + '.';
		/*
		'<li>' + nq1 + ' used in <i>Qualifiers only when sounds deviate from natural tamil rules</i> qualifier scheme.' +
		'<li>' + q1 + ' used in <i>None implies hard sounds</i> qualifier scheme since the' +
		' sound here represents the soft ' + sch('ja') + ' sound as opposed to the harder ' + sch('ca') + ' sound.';
		*/
	    n += "</ul>";
	    t += addNote(n);
	}
    }
    else if( txt == "jha" ) {
	var s1 =  tm('njha',"always");
	var nqs1;
	var sa_index1 = s1.indexOf( '\u0b9a' );
	var nj = indic(s1.substring(0,2));
	if( sa_index1 >= 0 ) {
	    var sup_end = s1.indexOf("span>",sa_index1);
	    if( sup_end > 0 )
		q1 = indic(s1.substring(sa_index1,sup_end+5));
	}
	if( q1 ) {
	    t += ' / ' + q1;
	    var n = '<ul style="text-align:left;"><li>' + q1 + ' used when following ' + nj + ' as in ' + 
		schchoice('ranjha/ra~njha') + '.';
	    n += "</ul>";
	    t += addNote(n);
	}
    }
    else if( txt == "sa" ) {
	var n = '<ul style="text-align:left;"><li>' + sch('s') 
	    + ' as a mei becomes ' + indic(tm('asmin').substring(1,3)) 
	    + ' and not ' + indic(tm('accu').substring(1,3)) + ' since the latter represents a '
	    + sch('c') + ' sound. For example, ' + sch('paspam') + " => " + tmi('paspam') + ' and not ' 
	    + tmi('pacpam') + ".";
	n += "</ul>";
	t += addNote(n);
    }
    else  if( txt == "Sa" ) {
	var n = '<ul style="text-align:left;"><li>'
	        + 'Some applications like the Carnatic Music Typesetter can make use of the <img src="grantha_sa.png"></img> letter for this, which is a fairer (albeit not widely accepted within the tamil script) representation.'
		+ ' Its use depends on the system meeting certain requirements and hence it is not yet enabled in the transliterator itself';
	t += addNote(n);
    }
    else if( txt == '^na' ) {
	var n = '<ul style="text-align:left;"><li>' ;
	    n += 'Explicit specification of ' + schchoice('^n/n2')
	    	+ ' is  needed only when it occurs in the middle of words like '
	    + schchoice('tiru^nAmam / tirun2Amam', ' / ') + ' => '  +  tmi('tiru^nAmam') + ". This is because by default " + sch('na') 
	    + " in the middle of words becomes " + indic(tm("mana").substring(2,1)) + ', and hence '
	    + sch('tirunAmam') + ' would be rendered incorrectly as ' + tmi('tirunAmam') + '.</li>';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == '#na' ) {
	var n = '<ul style="text-align:left;"><li>' ;
	n += 'When transilterating a  tamil source, explicit use of ' + sch('#n') + ' is required only in rare words like ' 
	    + sch('a#n#nanam') + ' => ' + tmi('a#n#nanam') +
	    '. Besides that, it overwhelmingly occurs as a mei preceding ' + schchoice('ka/kha/ga/gha') + 
	    ', and you should use ' + ' just ' + sch('n') + '. See notes under ' + sch('na') + '.';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "ya" ) {
	var n = '<ul style="text-align:left;"><li>' ;
	n += 'If ' + sch('y') + ' occurs as the mei before ' + schchoice('k/c/t/p') +
	     ' an automatic mei will be inserted (if one isnt already present) as in ' + 
	     schchoice('poykAl <=> poykkAl', ' <=> ')  + ', and ' +
	     schchoice('meycol <=> meyccol', ' <=> ')  + ' etc' +
	     '. The extra mei in the source can confuse representations in other languages and should be avoided if possible ';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "ra" ) {
	var n = '<ul style="text-align:left;"><li>' ;
	n += 'If ' + sch('r') + ' occurs as the mei before ' + schchoice('k/c/t/p') +
	     ' an automatic mei will be inserted (if one isnt already present) as in ' + 
	     schchoice('arcanai <=> arccanai', ' <=> ')  + ' => ' + tmi('arcanai') + ' , and ' +
	     schchoice('pArtAn <=> pArttAn', ' <=> ')  + ' => ' + tmi('pArtAn') + 
	     ' etc. Note that since the extra mei in these contexts is usually not applicable to other languages ' +
	     ', including it in the source should be avoided if possible as it can confuse representations  ' +
	     'in other languages and should be avoided if possible';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "za" || txt == 'zha' ) {
	var n = '<ul style="text-align:left;"><li>' ;
	n += 'If ' + schchoice('z/zh') + ' occurs as the mei before ' + schchoice('k/c/t') +
	     ' an automatic mei will be inserted (if one isnt already present) as in ' + 
	     schchoice('magizhci <=> magizhcci', ' <=> ')  + ' => ' + tmi('magizhci') +
	     '. Note that since the extra mei in these contexts is usually not applicable to other languages ' +
	     ', including it in the source should be avoided if possible as it can confuse representations  ' +
	     'in other languages and should be avoided if possible';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "H" ) {
	var n = '<ul style="text-align:left;">';
	    n += '<li>While the official visarga character in tamil as' ;
	    n += ' unicode specification is ' + indic("\u0b83") 
	      + ", the <i>Ayuda ezhuttu</i>, the colon character is used here since the occurence of visarga in other "
	      + " languages would make it appear in contexts that will seem odd in tamil.";
	   n += '<li>See ' + sch('H2') + ' for representation for ' + indic("\u0b83") + ' in the scheme is TBD';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "H2" ) {
	var n = '<ul style="text-align:left;">';
	n += '<li><i>Ayuda ezhuttu</i>. While, under official Unicode specification for Tamil,';
	n += ' this is the visarga character, ' + sch('H') ;
	n += ', in this scheme they are purposefully differentiated. See ' + sch('H') + ' for reasons.';
	n += "</ul>";
	t += addNote(n);
    }
    else if( txt == "j~na" ) {
	var n = '<ul style="text-align:left;">';
	n += '<li>A well known common word like ' + tmi('~nyAna') 
	    + ' in tamizh is represented as ' + schchoice('~nAna/~nyAna') + 
	    '. However the same word in other languages is written differently as ' + sch('j~nAna') +
	    ', and also carries a slightly different pronounciation in other languages with a subtle '+
	    ' initial emphasis on the ' + sch('j') + '. To differentiate the two, the latter will be rendered as ' 
	    + tmi('j~nyAna','always') + ' (unless qualifiers are turned off)';
	n += "</ul>";
	t += addNote(n);
    }
    return t;
}

function tmv(txt) {
    return '<td colspan="2">' + tmi(txt,"natural");
}


function genRow(text,v) 
{
    document.write('<tr>' );
    document.write('<td style="padding-left: 2em;" width="35%">'); 
    var t = "";
    if( text == "za" )
	t += schchoice("za/zha");
    else if( text == "^na" )
	t += schchoice("^na/n2a");
    else if( text == "~na" )
	t += schchoice("~na/~nya");
    else if( text == "M" )
	t += schchoice("M/`n/`N");
    else if( text == "n." ) {
	//t += schchoice("n.") + " followed by " + schchoice('k/g/c/j/d/t') + "<br>e.g." + sch("tankAl");
	t += sch("n.") + " <b>only</b> as in " + schchoice("n.ka/n.ga/n.ca/n.ja/n.da/n.ta") + "<br>e.g." + sch("tan.kAl");

	var n = '<ul style="text-align:left;"><li>';
	n += "Use " + sch("n.") + " instead of " + sch("n") + " to prevent it from becoming " + schchoice("#n/~n");
	n += "<li>Usage is anticipated to be very rare";
	n += '</ul>';
	t += addNote(n);
    }
    else if( text == "." ) {
	t += sch(".") + ' as in ' + sch("bhajE.ham");
    }
    else
	t = sch(text);

    if( text == "M" ) {
	var n = '';
	n += '<p><b>Explicit Anuswara Specifier(s)</b>: All languages except Tamil use anuswaras. In current practice, the anuswara does not represent';
	n += ' a separate phoneme, but instead represents one of ' + schchoice("#na/~na/na/Na/ma") + ' depending on the context in which it appears in. Hence ';
	n += ' it can be considered as an <i>artifact</i> of the script. While the scheme tries to avoid script specific artifacts, it is not ';
	n += ' easily possible to determine in all cases when an anuswara would figure. In certain contexts, it is dependent on the word.';
	n +=  ' Hence an explicit anuswara specifier is defined to help in correct rendition to the target languages.';
	n += '<p';
	n += '<ul style="text-align:left;">'
	       + '<li>Use ' + sch('M') + ' when the bindu/anuswara stands for the ' + sch("m") + " sound (e.g. " + sch("ahaMkAra") + ")."
	       + "<li>Use " + sch('`n') + ' , when it stands for ' + schchoice("#n/~n/n")  + " sounds. (e.g. " + schchoice("sa`ngIta, sa`ncAra, sa`ntOsha",", ") + ")."
	       + "<li>Use " + sch('`N') + ' , when it stands for ' + schchoice("N")  + " sound (e.g. " + sch("kha`NDa") + ")"
	       + '<li>Note for telugu and kannada, in some contexts, an explicit bindu/anuswara specifier '
		+ ' is <u>not</u> required because it is <u>always</u> implied in those contexts.'
		+ ' In such contexts, it is strongly recommended that ' + schchoice('#n/~n/n/N/m') + ' as appropriate be used instead. '
		+ ' Explicit anuswara specifier is needed only in cases where it is not automatically implied from the context (e.g. ' + sch('saMyukta') + "). See" 
		+ schchoice("#na/~na/na/Na") + " for more information."
	        + '<li>In Sanskrit, the use of anuswara depends on the word, and so must always be explicitly specified.'
		+ '<li> See also ' + sch('na') + ' and ' + sch('ma') + '.'; 
	n += '</ul>';
	t += addNote(n);
    }
    else if( text == "H" ) {
	var n = '<ul style="text-align:left;"><li>Visarga specifier';
	n += ' as in ' + sch('manaHpUrva') + '.</ul>';
	t += addNote(n);
    }
    else if( text == "H2" ) {
	var n = '<ul style="text-align:left;">';
	n += '<li>Tamil <i>Ayuda ezuttu</i> as in ' + sch('aH2du') ;
	n += ". It is really like the visarga, but the usage of it in tamizh is somewhat different from usage of visarga in other languages. Treating";
	n += " it as <=> " + sch('H') + " in tamizh, can confuse tamizh renditions since " ;
	n += sch('H') + " occurs in other languages in words that are familiar in tamizh and ";
	n += " using the <i>Ayuda ezhuttu</i> in such contexts can seem odd";
	n += '<li>For other languages, ' + schchoice('H2 <=> H', ' <=> ');
	n += '</ul>';
	t += addNote(n);
    }
    else if( text == "~na" || text == "#na") {
	var n = '<ul style="text-align:left;">';
	if( text == "~na" )  {
	    n += '<li>' + sch("~n") + " <=> " + sch("~ny");
	    n += '<li>' + " When preceding " + schchoice('c/ch/j/jh');
	}
	else {
	    n += '<li>' + " When preceding " + schchoice('k/kh/g/gh');
	}
	n += ", " + sch("n") + " <=> " + sch(text.substring(0,2)) + 
	    	", and so you can also instead specify " + sch("n") + 
		" instead of " + sch(text) + ". See notes under " + sch("na") + ".";
	n += "<li> In the above mentioned contexts, " + sch(text.substring(0,2)) +
	    " always becomes anuswara in telugu and kannada" ;
	n += ". It is strongly recommended that you do not use the explicit bindu/anuswara specifier in such contexts as it is not necessary, and also can  make the input " +
	     " text less phonetic. Also not all languages use bindu/anuswara always in these contexts.";
	n += "<li>In Sanskrit, depending on the word, " + sch(text.substring(0,2)) + " can become anuswara. However this must be explicitly specified using ";
	n += " the " + sch("`n") + " specifier rather than the " + sch("M") 
	      + " specifier, as the former is phonetically better representative in such contexts. ";
	if( text == "#na" )
	    n += "For example, " + sch("sa`ngIta") + " is recommended instead of " + sch("saMgIta");
	else
	    n += "For example, specify " + sch("sa`ncAri") + " is recommended instead of " + sch("saMcAri");
	n += '</ul>';
	t += addNote(n);
    }
    else if( text == "na" ) {
	var n = '<ul style="text-align:left;"><li>' + sch('n') + ' becomes ' + sch('#n') +
	    	' when preceding ' + schchoice('ka/kha/ga/gha') + ' as in ' + sch('pankaja') + ' <=> ' + sch('pa#nkaja');
	n += '<li>' + sch('n') + ' becomes ' + sch('~n') + ' when preceding ' + schchoice('c/ch/j/jh') +
	    	' as in ' + sch('panca') + ' <=> ' + sch('pa~nca');
	n += "<li>Because of the above, " + sch('n') + " becomes anuswara in telugu and kannada, and devanagiri when preceding " 
	    + schchoice('k/kh/g/gh/c/ch/j/jh') + ' as in ' + schchoice('panca/pa~nca') 
	    + " => " + tli('panca') + " / " + kni('panca') + " / " + sni('panca') 
	    + ".  It also becomes anuswara in telugu and kannada when preceding "
	    + schchoice('t/d');
	n += ". It is strongly recommended that you do not use the explicit bindu/anuswara specifier in such contexts as it is not necessary, and also can  make the input " +
	     " text less phonetic. Also not all languages use bindu/anuswara always in these contexts.";
	n += "<li>In Sanskrit, depending on the word, " + sch("n") + " can become anuswara. However this must be explicitly specified using ";
	n += " the " + sch("`n") + " specifier rather than the " + sch("M") 
	      + " specifier, as the former is phonetically better representative in such contexts. ";
	n += "For example, " + sch("sa`ntOsha") + " is recommended instead of " + sch("saMtOsha");
	n  += "<li>See " + sch("n.") + "below for a way to prevent disallow " 
		+ sch("n") + " from becoming " + schchoice('#n/~n') + ".";
	n += "</ul>";
	t += addNote(n);
    }
    else if( text == "^na" ) {
	var n = '<ul style="text-align:left;">';
	n += '<li>Explicit specification of alternate na ' + tmi('na') 
	    + ' in Tamil. For all other languages, it has no special significance and is <=>' 
	    + sch('na') + ".";
	n += "<li>You can specify this either " + sch('^n') + " or " + sch('n2') + ".";
	n += "</ul>";
	t += addNote(n);
    }
    else if( text == "s2a" ) {
	var n = '<ul style="text-align:left;">';
	n += '<li>Explicit specification of ' + tmi('S2a') 
	    + ' in Tamil. For all other languages, it has no special significance and is <=>' 
	    + sch('sa') + ".";
	n += "</ul>";
	t += addNote(n);
    }
    else if( text == "ma" ) {
	var n = '<ul style="text-align:left;"><li>' + sch("m") 
		+ " as a pure consonant at the end of the word becomes anuswara in telugu and kannada as in " 
		+ sch("mAm") + " => " + tli("mAm") + " / " + kni("mAm")
	        + ". For such contexts, the explicit bindu/anuswara specifier " + sch("M") 
	         + " is not necessary." + "</li>";
	n += "</ul>";
	t += addNote(n);
    }
    else if( text == "j~na" ) {
	var n = '<ul style="text-align:left;"><li>Affects tamizh rendition. No special implications for other languages';
	n += "</ul>";
	t += addNote(n);
    }
    else if( text == "." ) {
	var n = "";
	n += '<p><b>Sanskrit Avagraha Specifier</b>: ';
	n += "A period/dot used in the middle of the word as shown indicates the Sanskrit <i>avagraha</i> specifier. This is interpreted as so only in the middle of a word (and not following n, or R as n. and R. imply something else. Here, ";
	n += sch('bhajEham') + ' can be specified as ' + sch('bhajE.ham')  + ' to imply that the word '
	  + sch('aham') + ' lost its initial ' + sch('a') + '. The avagraha specifier shows in the '
	  + 'Devanagiri script as the <span style="font-size:100%;font-weight:bold;">\u093d</span> character.';
	t += addNote(n);
    }
    document.write(t);		// scheme
    if( text == "n." ) 
	text = "tan.kAl";
    else if( text == "." ) 
	text = "bhajE.ham";
    document.write("<td>"); document.write(sni(text));		// sanskrit
    document.write("<td>"); document.write(tli(text));		// telugu
    document.write("<td>"); document.write(kni(text));		// kannada
    document.write("<td>"); document.write(mli(text));		// malayalam
    if(!v)
	document.write(tmc(text));
    else
	document.write(tmv(text));
    document.write("</tr>");
}

function genRows(txt,v) {
    var l = txt.length;
    var idx = 0;
    var pattern;
    while(idx < l) {
	var cidx = txt.indexOf(',',idx);
	if( cidx >= 0 ) {
	    pattern = txt.substring(idx,cidx);
	}
	else
	    pattern = txt.substring(idx);
	genRow(pattern,v);
	if( cidx < 0 ) break;
	else 
	    idx = cidx+1;
    }
}

function showHide(but) {
    if( !but.parentNode || !but.parentNode.parentNode ) return;
    var tr = but.parentNode.parentNode;
    var n = tr.nextSibling;
    while(n && n.tagName && n.tagName.toLowerCase() == "tr" 
	    && (!n.className || n.className.toLowerCase() != "categoryrow")) {
	if( n.style.display == "none" ) {
	    if( document.all )
		n.style.display = "block";
	    else
		n.style.display = "table-row";
	}
	else
	    n.style.display = "none";
	n = n.nextSibling;
    }
    if(but.innerHTML.indexOf("+") >= 0 )
	but.innerHTML = "-";
    else
	but.innerHTML = "+";
}

function genCategoryRow(txt) {
    document.write( 
	    '<tr class="categoryRow"><td colspan="7"><span onclick="showHide(this);" class="button">-</span>' +
	    	txt + '</td></tr>');
}

function genHeaderRow(buttons) {
    var col=1;
    var t = "";
    if( buttons )
	t += '<tr class="headerRowWithButtons"><td>Show/Hide</span>:</td>';
    else
	t += '<tr class="headerRow"> <td>Representation in the Scheme';
    t +=
	 '<td style="padding-right:15;">' +
	    ((buttons) ? '<span onclick="showHideColumn(this,' + (col++) + ');" class="button">-</span>' : '' ) + 'Sanskrit' +
	 '<td style="padding-right:15;">' +
	    ((buttons) ? '<span onclick="showHideColumn(this,' + (col++) + ');" class="button">-</span>' : '' ) + 'Telugu' +
	 '<td style="padding-right:15;">' +
	    ((buttons) ? '<span onclick="showHideColumn(this,' + (col++) + ');" class="button">-</span>' : '' ) + 'Kannada' +
	 '<td style="padding-right:15;">' +
	    ((buttons) ? '<span onclick="showHideColumn(this,' + (col++) + ');" class="button">-</span>' : '' ) + 'Malayalam' +
	 '<td style="padding-right:15;">' +
	    ((buttons) ? '<span onclick="showHideColumn(this,' + (col++) + ');" class="button">-</span>' : '' ) + 'Tamil';
     document.write(t);
}

function showHideColumn(but, idx) {
    var tbl = document.getElementById("legendTable");
    if( !tbl ) return;
    var rows = tbl.rows;
    if( !rows || !rows.length ) return;
    var l = rows.length;
    for( r = 0; r < l; r++ ) {
	var row = rows[r];
	//if( row.className && row.className.toLowerCase() == "headerrow" ) {
	    //continue;
	//}
	var cells = rows[r].cells;
	if( !cells || !cells.length ) continue;
	var cl = cells.length;
	if( cl == 1  ) {
	    //if( cells[0].colspan >= (idx+1) ) {
		//cells[0].colspan--;
	    //}
	    continue;
	}
	if( cl > idx ) {
	    var cell = cells[idx];
	    if( cell.style.display == "none" ) {
		if( document.all )
		    cell.style.display = "block";
		else
		    cell.style.display = "table-cell";
	    }
	    else
		    cell.style.display = "none";
	}
    }
    if(but.innerHTML.indexOf("+") >= 0 ) {
	but.innerHTML = "-";
	but.parentNode.style.color = "#ccccff";
    }
    else {
	but.innerHTML = "+";
	but.parentNode.style.color = "#c0c0c0";
    }
}

