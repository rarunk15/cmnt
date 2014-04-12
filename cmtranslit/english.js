function EnglishTranslator()
{
    this.setAttribute = function(attr) {
	if( attr.toLowerCase() == "raw" ) {
	    this.RAW = true;
	    return true;
	}
	else if( attr.toLowerCase() == "noraw" ) {
	    this.RAW = false;
	    return true;
	}
	else if( attr.toLowerCase() == "hideanuswaraquals" ) {
	    this.hideAnuswaraQuals = true;
	}
	return false;
    }


    this.getLanguageName = function() {
	return "English";
    }

    this.translate= function(eng, isNative, wordStart) {
	/* remove script specific idiosyncracies */
	if( this.RAW ) return eng;
	s = eng.replace( /n2/g, "n" ).replace( /\^n/g, "n" ).replace(/s2/g,"s");
	if( this.hideAnuswaraQuals )
	     s = s.replace( /\#n/g, "n" ).replace( /~n/g, "n" );
	return s;
    }

    this.RAW = false;
    this.hideAnuswaraQuals = false;
}
