/**
 * @fileoverview
 * model.js contains objects that make up the data model behind the swara 
 * editor. This includes {@link Song}, which represents a song, which is 
 * made up of <i>song parts</i>, which can be a {@link Heading}, {@link Tala} 
 * (to indicate tala for subsequent notations), a {@link SongBlock},
 * a {@link SongBreak} (song break), or a {@link LineBreak} (line break)
 * <p>
 * A SongBlock is made up two lists of song block parts, one containing 
 * {@link Swara}s, and the other containing {@link Lyric}s representing
 * the associated lyrics.
 */

function XMLUtilsDefn() 
{
    this.createXMLNode = function(name) {
	return document.createElement(name);
    }

     /**
      * method to test basic sanity of xml node
      * @param {XMLNode} xmlNode
      * @param {String}  tagName
      * @return true if xmlNode seems like an xml node, else false
      */
    this.isXMLNode = function(xmlNode, tagName) {
	if( xmlNode && xmlNode.tagName && xmlNode.tagName.toLowerCase() == tagName.toLowerCase()) return true;
	return false;
    }

    this.isWhite = function(txt) {
	var c = 0;
	while( c < txt.length ) {
	    var ch = txt.charAt(c);
	    if( ch != ' ' && ch != '\t' && ch != '\n' ) return false;
	    c++;
	}
	return true;
    }

    this.isModelNode = function(xmlNode) {
	if( xmlNode.nodeValue && this.isWhite(xmlNode.nodeValue)) return false;
	if( xmlNode.nodeType != 1 ) return false;
	return true;
    }

    this.escape = function(val) {
	var l = val.length;
	var s = "";
	for( var c = 0; c < l; c++ )  {
	    var ch = val.charAt(c);
	    if( ch == '"' ) { ch += '\\'; }
	    s += ch;
	}
	return s;
    }

    this.serialize = function(xml) {
	var s = '<' + xml.tagName;
	var a = xml.attributes;
	if( a && a.length ) {
	    for(var i = 0; i < a.length; i++ ) {
		var attr = a[i];
		s += " " + attr.name;
		s += '="' + attr.value + '"';
	    }
	}
	s += '>';

	var c = xml.firstChild;
	if( c ) s += '\n';
	while( c ) {
	    s += this.serialize(c);
	    s += '\n';
	    c = c.nextSibling;
	}
	s += '</' + xml.tagName + '>';
	return s;
    }
}
XMLUtils = new XMLUtilsDefn();


/**
 * @class
 * part type of parts that can belong to a {@link Song}
 */
function PART_TYPE()
{
}

/**
 * a heading song part type 
 * @final
 * @type int
 */
PART_TYPE.prototype.HEADING   =  1;

/**
 * a song part type
 * @final
 * @type int
 */
PART_TYPE.prototype.SONGBLOCK =  2;

/**
 * a tala specifier (for subsequent notation) song part type
 * @final
 * @type int
 */
PART_TYPE.prototype.TALA      =  3;

/**
 * a song break song part type
 * @final
 * @type int
 */
PART_TYPE.prototype.SONGBREAK	   =  4;

/**
 * a gati switch in tala
 * @final
 * @type int
 */
PART_TYPE.prototype.GATISWITCH = 5;

/**
 * a line break during manual tala which does not reset the tala cycle
 * has no effect in non-manual tala
 */
PART_TYPE.prototype.LINEBREAK = 6;

/**
 * to control page title (can be used in printable version)
 */
PART_TYPE.prototype.TITLE = 7;

/**
 * convenience macros for part type
 */
var PART_HEADING   = PART_TYPE.prototype.HEADING;
var PART_SONGBLOCK = PART_TYPE.prototype.SONGBLOCK;
var PART_TALA      = PART_TYPE.prototype.TALA;
var PART_BREAK     = PART_TYPE.prototype.SONGBREAK;
var PART_GATISWITCH= PART_TYPE.prototype.GATISWITCH;
var PART_LINEBREAK     = PART_TYPE.prototype.LINEBREAK;
var PART_TITLE         = PART_TYPE.prototype.TITLE;
var PART_PAGEBREAK     = PART_TYPE.prototype.PAGEBREAK;

/**
 * validate a song part
 * @param {PART_TYPE} partType the type of song part
 * @return true or false indicating if passed part-type is a valid one
 * @type boolean
 */
function isValidSongPart(partType) {
    if( partType != PART_HEADING && partType != PART_TALA && partType != PART_TITLE &&
        partType != PART_SONGBLOCK && partType != PART_BREAK && 
	partType != PART_LINEBREAK && partType != PART_GATISWITCH) return false;
    return true;
}

/**
 * @class
 * part type of parts that can belong to a {@link SongBlock}
 */
function BLOCKPART_TYPE() {
}
/**
 * a swara block part type
 * @see Swara
 */
BLOCKPART_TYPE.prototype.SWARA = 200;

/**
 * a lyric block part type
 * @see Lyric
 */
BLOCKPART_TYPE.prototype.LYRIC   =  201;

/**
 * convenience macros for block part types
 */
var BLOCKPART_SWARA   =  BLOCKPART_TYPE.prototype.SWARA;
var BLOCKPART_LYRIC   =  BLOCKPART_TYPE.prototype.LYRIC;

/**
 * validate a songblock part
 * @param {BLOCKPART_TYPE} partType the type of song block part
 * @return true or false indicating if passed part-type is a valid one
 * @type boolean
 */
function isValidSongBlockPart(partType) {
    if( partType != BLOCKPART_SWARA && partType != BLOCKPART_LYRIC 
    		&& part != BLOCKPART_PAUSE ) return false;
    return true;
}

/**
 * @class
 * values for various gatis. The actual value are such that that 1/val is the 
 * duration of a swara in that gati in second-speed, and 1/(2*val) is duration
 * of swara in gati in quadruple speed i.e 1/(2^speed)*val, for 
 * second-speed and faster
 */
function GATI() {
}

/**
 * tisra gati
 * @final
 */
GATI.prototype.TISRA   = 3;
/**
 * catusra gati
 * @final
 */
GATI.prototype.CATUSRA = 2;
/**
 * khanda gati
 * @final
 */
GATI.prototype.KHANDA  = 5;
/**
 * misra gati
 * @final
 */
GATI.prototype.MISRA   = 7;
/**
 * sankeerna gati
 * @final
 */
GATI.prototype.SANKIRNA = 9;

// convenience macros for gatis
var GATI_TISRA   = GATI.prototype.TISRA;
var GATI_CATUSRA = GATI.prototype.CATUSRA;
var GATI_KHANDA  = GATI.prototype.KHANDA;
var GATI_MISRA   = GATI.prototype.MISRA;
var GATI_SANKIRNA = GATI.prototype.SANKIRNA;


/**
 * validate a gati
 * @param {GATI} gati	the gati
 * @return true or false indicating if passed gati is a valid one
 * @type boolean
 */
function isValidGati(gati) { 
    if(gati == GATI_TISRA || gati == GATI_CATUSRA || gati == GATI_KHANDA || 
    			gati == GATI_MISRA || gati == GATI_SANKIRNA)
	return true;
    else
	return false;
}

/**
 * returns the stringized form of a gati
 * @param {GATI}    gati    the gati
 * @param {boolean} verbose true if verbose form is required, else terse 
 *                          form is returned
 * @return a string containing the stringized form of gati or "" if invalid gati
 * @type String
 */
function gatiName(gati, verbose) {
    var shortName = "";
    if( gati == GATI_TISRA )
    	shortName = "tiSra";
    else if( gati == GATI_CATUSRA )
    	shortName = "catuSra";
    else if( gati == GATI_KHANDA )
    	shortName = "khanDa";
    else if( gati == GATI_MISRA )
    	shortName = "miSra";
    else if( gati == GATI_SANKIRNA )
    	shortName = "sankIrna";
    if( verbose )
    	return shortName + " gati";
    else
	return shortName;
}

/**
 * @class
 * values for various jathis of tala - which applies to the laghus
 */
function JATI() {
}

/**
 * tisra jati
 * @final
 */
JATI.prototype.TISRA   = 3;
/**
 * catusra jati
 * @final
 */
JATI.prototype.CATUSRA = 2;
/**
 * khanda jati
 * @final
 */
JATI.prototype.KHANDA  = 5;
/**
 * jati gati
 * @final
 */
JATI.prototype.MISRA   = 7;
/**
 * sankeerna gati
 * @final
 */
JATI.prototype.SANKIRNA = 9;

// convenience macros for gatis
var JATI_TISRA   = JATI.prototype.TISRA;
var JATI_CATUSRA = JATI.prototype.CATUSRA;
var JATI_KHANDA  = JATI.prototype.KHANDA;
var JATI_MISRA   = JATI.prototype.MISRA;
var JATI_SANKIRNA = JATI.prototype.SANKIRNA;

/**
 * validate a jati
 * @param {JATI} jati	the jati
 * @return true or false indicating if passed jati is a valid one
 * @type boolean
 */
function isValidGati(jati) { 
    if(jati == JATI_TISRA || jati == JATI_CATUSRA || jati == JATI_KHANDA || 
    			jati == JATI_MISRA || jati == JATI_SANKIRNA)
	return true;
    else
	return false;
}

/**
 * returns the stringized form of a jati
 * @param {JATI}    jati    the jati
 * @param {boolean} verbose true if verbose form is required, else terse 
 *                          form is returned
 * @return a string containing the stringized form of jati or "" if invalid jati
 * @type String
 */
function jatiName(jati, verbose) {
    var shortName = "";
    if( jati == JATI_TISRA )
    	shortName = "tiSra";
    else if( jati == JATI_CATUSRA )
    	shortName = "catuSra";
    else if( jati == JATI_KHANDA )
    	shortName = "khanDa";
    else if( jati == JATI_MISRA )
    	shortName = "miSra";
    else if( jati == JATI_SANKIRNA )
    	shortName = "sankIrna";
    if( fullName )
    	return shortName + " jati";
    else
	return shortName;
}

var ENDTALAMARKER = "||";
var MIDDLETALAMARKER = "|";
var EMPTYTALAMARKER = "";


/**
 * @class 
 * A tala part (anga), which is part of a {@link Tala}
 *
 * @constructor
 * @param {int}    idx	 the index (within tala cycle) of the part
 * @param {GATI}   gati   the gati for the part
 * @param {String} marker the marker to put when tala index reaches the 
 *                        index of the part
 */
function TalaPart(idx, gati, marker)
{
    /**
     * the index (within a tala cycle) of the part
     * @type int
     */
    this.fIndex  = idx;

    /**
     * the gati of the part
     * @type GATI
     */
    this.fGati   = gati;

    /**
     * the tala marker that precedes the part
     * @type String
     */
    this.fMarker = marker;
}

/**
 * @class
 * represent results of parsing model info from an XML node
 */
function FromXMLResult(result, failureReason, line) 
{
    this.fResult            = null;
    if( result )
	this.fResult            = result;
    this.fFailureReason = null;
    if( failureReason )
	this.fFailureReason = failureReason;
    this.fLine = -1;
    if( line > 0 )
	this.fLine = line;
	
}

/**
 * @class
 * represent base class for all song parts
 * @constructor
 * @param {SONGPART_TYPE} partType the song part type
 */
function SongPart(partType) 
{
     /**
      * song part type - derived classes should set this
      * @type SONGPART_TYPE
      */
     this.fPartType      = partType;

     /**
      * serialize contents to xml - derived classes should override this
      * @return an object representing the xml contents
      * @type XMLNode
      */
     this.toXML = function() {
	return null;
     }


     /**
      * create a new node from an xml node (created presumably using 
      * {@link SongPart#toXML}
      * @param {XMLNode} xml
      * @return a {@link FromXMLResult} object, with song part as result
      * @type FromXMLResult
      */
    this.fromXML = function(xml) {
	return new FromXMLResult(null, "internal error: SongPart.fromXML not overridden" );
    }

    /**
     * does this part follow a page break 
     * (meaningful only for headings and for swaras (that start a row)
     */
    this.followsPageBreak = function() {
	return this.fFollowsPageBreak;
    }

    /**
     * set/unset the flag that indicates that part follows a page break 
     * (meaningful only for headings and for swaras (that start a row)
     */
    this.setFollowsPageBreak = function(val) {
	this.fFollowsPageBreak = val;
    }

     /**
      * set/unset the flag that indicates that part follows a page break 
      * (meaningful only for headings and for swaras (that start a row)
      * @type Boolean
      * @private
      */
    this.fFollowsPageBreak = false;
}

/**
 * get the XML tag name for outermost xml node that represents the contents of this song part 
 * - derived classes must override this
 * @return a string containing xml tag
 * @type String
 */
SongPart.prototype.XMLTagName = function() {
    return "";	// must override
}


/**
 * @class
 * represents a tala layout specification
 */
function TalaLayoutSpecificationOld(nCycles, nMaxSwarasPerRow)
{
    /**
     * number of tala cycles in a "layout cycle"
     * @type int
     */
    this.fNCycles 	  = nCycles;

    /**
     * number of swaras per row (except possibly last one) in layout cycle
     * @type int
     */
    this.fNMaxSwarasPerRow = nMaxSwarasPerRow;


    /**
     * serialize this as a value that will go as a value of an attribute to an xml node
     */
    this.toXMLAttribVal = function(xmlNode, xmlAttribName) {
	return this.fNCycles + ":" + this.fNMaxSwarasPerRow;
    }

}


/**
 * create a xml layout spec from a string that is presumably the value of the
 * xml attribute which was set using {@link TalaLayoutSpecification#toXMLAttribVal}
 * @param {String} val	the attribute value
 * @return a {@link FromXMLResult} object
 * @type {FromXMLResult}
 */
TalaLayoutSpecificationOld.prototype.fromXMLAttribVal = function(val) {
    var re = /([0-9][0-9]*):([0-9][0-9]*)$/;
    var i = re.exec(val);
    if( i == null || !i.length || i.length != 3 )
	return new FromXMLResult(null, "cannot parse layout spec");
    return new FromXMLResult(new TalaLayoutSpecification( i[1], i[2] ));
}

/**
 * @class
 * represents a tala layout specification
 */
function TalaLayoutSpecification(name)
{
    this.fName 	  = name

    /**
     * serialize this as a value that will go as a value of an attribute to an xml node
     */
    this.toXMLAttribVal = function(xmlNode, xmlAttribName) {
	return this.fName;
    }

}
TalaLayoutSpecification.prototype.fromXMLAttribVal = function(val) {
    return new FromXMLResult(new TalaLayoutSpecification( val) );
}


/**
 * @class
 * represents the layout of a tala based on a layout spec for a tala
 * @constructor
 * @param {TalaLayoutSpecification} layoutSpec	the tala layout spec
 */
function TalaLayout(layoutSpec)
{
    this.GUIDE_ROW = -1;

    this.fLayoutSpec = new TalaLayoutSpecification(layoutSpec.fName);

    this.addGuideRow = function( partInfo, duration ) {
	if( this.fNRowDurations.length != 0 ) return false;
	this._addRow(partInfo, duration);
	return true;
    }

    this.addRow = function( partInfo, duration ) {
	if( this.fNRowDurations.length == 0 )  {
	    var guidePartInfo = new Array();
	    var l = partInfo.length;
	    for(var i = 0; i < l; i++ ) {
		guidePartInfo[i] = { span: partInfo[i].span, nAksharas: partInfo[i].nAksharas, gati: partInfo[i].gati };
	    }
	    if( !this.addGuideRow(guidePartInfo, new Duration(duration.fNum, duration.fDenom)) ) {
		return false;
	    }
	}

	this._addRow(partInfo, duration);
	return true;
    }

    /**
     * get the # of rows in the layout cycle (doesnt count guide row)
     * @return the # of rows in the layout cycle
     * @type int
     */
    this.getNRows = function() { 
	var nRows = this.fNRowDurations.length;
	if(nRows <= 1 ) return 0;
	else return nRows-1;
    }

    /**
     * get the duration of the row given its index in a layout cycle
     * @param {int} rowIndex	index of row in layout cycle, can indicate guide row
     * @return the duration of the row given its index in a layout cycle
     * @type Duration
     */
    this.getRowDuration = function(rowIndex) {
	if( rowIndex == this.GUIDE_ROW ) rowIndex = 0;
	else if( rowIndex < 0 ) return null;
	else {
	    if( rowIndex >= (this.fNRowDurations.length-1) )
		rowIndex = rowIndex % (this.fNRowDurations.length-1);
	    rowIndex++;
	}
	return this.fNRowDurations[rowIndex];
    }

    /**
     * get the # of tala parts in a row given its index in a layout cycle
     * @param {int} rowIndex	index of row in layout cycle, can indicate guide row
     * @return the # of tala parts in the row
     * @type int
     */
    this.getRowPartCount = function(rowIndex) {
	if( rowIndex == this.GUIDE_ROW ) rowIndex = 0;
	else if( rowIndex < 0 ) return null;
	else {
	    if( rowIndex >= (this.fNRowParts.length-1) ) 
		rowIndex = rowIndex % (this.fNRowParts.length-1);
	    rowIndex++;
	}
	return this.fNRowParts[rowIndex].length;
    }

    /**
     * get row part spans
     * @param {int} rowIndex	index of row in layout cycle, can indicate guide row
     * @return an array of spans, length of array is # of tala parts + markers
     * @type int[]
     */
    this.getRowPartSpans = function(rowIndex, includeMarkers) {
	if( rowIndex == this.GUIDE_ROW ) rowIndex = 0;
	else if( rowIndex < 0 ) return null;
	else  {
	    if( rowIndex >= (this.fNRowParts.length-1) )
		rowIndex = rowIndex % (this.fNRowParts.length-1);
	    rowIndex++;
	}
	if( includeMarkers ) 
	    return this.fNRowPartsWithMarkers[rowIndex];
	else
	    return this.fNRowParts[rowIndex];
    }

    /**
     * get row part column info
     * @param {int} rowIndex	index of row in layout cycle, can indicate guide row
     * @return an array of ints, indicating # of columns for each part
     * @type int[]
     */
    this.getRowPartColInfo = function(rowIndex) {
	if( rowIndex == this.GUIDE_ROW ) rowIndex = 0;
	else if( rowIndex < 0 ) return null;
	else  {
	    if( rowIndex >= (this.fNRowColInfo.length-1) )
		rowIndex = rowIndex % (this.fNRowColInfo.length-1);
	    rowIndex++;
	}
	return this.fNRowColInfo[rowIndex];
    }

    /**
     * get the maximum # of columns (incl. 1 col for each marker) for the row given
     * its index in a layout cycle
     * @param {int} rowIndex	index of row in layout cycle, can indicate guide row
     * @return the # of columns for the row
     * @type int
     */
    this.getMaxNCols = function(rowIndex) {
	//var s = "maxcols for " + rowIndex + " is " ;
	if( rowIndex == this.GUIDE_ROW ) rowIndex = 0;
	else if( rowIndex < 0 ) return null;
	else {
	    if( rowIndex > this.fNRows ) {
		rowIndex = rowIndex % this.fNRows;
	    }
	    rowIndex++;
	}
	//s += this.fNRowMaxCols[rowIndex];
	//alert(s);
	return this.fNRowMaxCols[rowIndex];
    }

    this._addRow = function( partInfo, duration ) {
	var colInfo = new Array();
	var r = new Array();
	var nCols = 0;
	for(var i = 0; i < partInfo.length; i++ ) {
	    if( layoutSpec.fName == "varnam" || layoutSpec.fName == "gitam" ) {
		// colInfo[i] = partInfo[i].nAksharas * ((partInfo[i].gati == GATI_CATUSRA) ? 4 : (2*partInfo[i].gati));
		colInfo[i] = partInfo[i].nAksharas * this.getMaxColsPerAkshara(partInfo[i].gati);
	    }
	    else {
		// count columns based on triple speed
		//colInfo[i] = partInfo[i].nAksharas * (4*partInfo[i].gati);
		colInfo[i] = partInfo[i].nAksharas * this.getMaxColsPerAkshara(partInfo[i].gati);
	    }
	    nCols += colInfo[i];
	    nCols ++;	// for the tala marker
	}
	this.fNRowDurations[this.fNRowDurations.length] = duration;
	this.fNRowMaxCols[this.fNRowMaxCols.length] = nCols;
	this.fNRowColInfo[this.fNRowColInfo.length] = colInfo;

	this.fNRowParts[this.fNRowParts.length] = partInfo;
	var a = new Array();
	var ai = 0;
	var pl = partInfo.length;
	for(var i = 0; i < pl; i++ ) {
	    a[ai++] = partInfo[i].span;
	    a[ai++] = 1;
	}
	this.fNRowPartsWithMarkers[this.fNRowPartsWithMarkers.length] = a;
    }

    this.getMaxColsPerAkshara = function(gati) {
	if( this.fLayoutSpec.fName == "varnam" || this.fLayoutSpec.fName == "gitam" ) 
	    return gati*2;
	else 
	    return gati*4;
    }

    /**
     * called when gati of tala has been switched
     */
    this.switchGati = function(oldgati, newgati) {
	var i;
    	for(r = 0; r < this.fNRowMaxCols.length; r++) {
	    var partInfo = this.fNRowParts[r];
	    var colInfo  = this.fNRowColInfo[r];
	    var nCols    = 0;
	    for(var i = 0; i < partInfo.length; i++ ) {
		partInfo[i].gati = newgati;
		colInfo[i] = partInfo[i].nAksharas * this.getMaxColsPerAkshara(partInfo[i].gati);
		nCols += colInfo[i];
		nCols ++;	// for the tala marker
	    }
	    this.fNRowMaxCols[r] = nCols;
	}
    }


    /**
     * the duration of rows in the layout cycle
     * @type Duration[]
     * @private
     */
    this.fNRowDurations = new Array();

    /**
     * the max # of cols per row in layout cycle (actually all rows except last)
     * @type int[]
     * @private
     */
    this.fNRowMaxCols = new Array();

    /**
     * the spans of the tala parts in each row
     * @type int[][]
     */
    this.fNRowParts = new Array();

    /**
     * the spans of the parts including tala markers in each row
     * @type int[][]
     */
    this.fNRowPartsWithMarkers = new Array();

    /**
     * column info for each row
     */
    this.fNRowColInfo = new Array();
}


/**
 * @class
 * represents a tala and is made up of {@link TalaPart}s, and also a 
 * {@link TalaLayoutSpecification} that specifies how to lay it out
 *
 * @constructor
 * @param {String} name	    name of the tala
 * @param {int}    nAksharas # of aksharas in the tala
 * @param {TalaLayoutSpecification} layourSpec	layour specification
 * @param {String} predefName (optional) if specified the predefined name for tala
 */
function Tala(name, nAksharas, layoutSpec, predefName) 
{
     /**
      * # of aksharas in tala cycle
      * @type int
      * @private
      */
     this.fAksharaCount = nAksharas;

     /**
      * name of tala
      * @type String
      * @private
      */
     this.fName         = name;

     /**
      * @type Array
      * parts of tala
      * @private
      */
     this.fParts        = new Array();

     /**
      * @type TalaLayoutSpecification
      * layout specification of tala
      */
    this.fLayoutSpec  = layoutSpec;

    /**
     * @type TalaLayout
     * the layout based on the spec
     */
    this.fLayout = null;


    /**
     * return the akshara count
     * @return akshara count
     * @type int
     */
    this.aksharaCount = function() { return this.fAksharaCount; }

    /**
     * return the layout spec
     * @type {TalaLayoutSpecification}
     */
    this.getLayoutSpec = function() { return this.fLayoutSpec; }

    /**
     * return the layout based on the layout spec
     * @type {TalaLayout}
     */
    this.getLayout = function() { return this.fLayout; }

    /**
     * set the layout spec
     * @param {TalaLayoutSpecification} layoutSpec	layour specification
     */
    this.setLayoutSpec = function(layoutSpec) {
	this.fLayoutSpec = layoutSpec;
    }

     /**
      * if not-null the predefined name for this tala
      */
    this.fPredefName = predefName;

     /**
      * return the name
      * @return name of tala
      * @type String
      */
     this.name = function()  { return this.fName; }

     /**
      * return the parts in the tala (a linked list)
      * @return first part in tala - head of linked list
      * @type TalaPart
      */
     this.parts = function()  { return this.fParts; }

     /**
      * add a tala part
      * @param {int}    talaIndex akshara index of part within a cycle
      * @param {GATI}   gati      the gati
      * @param {String} marker	  the tala marker to put out when akshara 
      *                           count of a tala cycle reaches talaIndex
      * @return true if successful, false else
      * @type boolean
      */
     this.addPart = function(talaIndex, gati, marker) {
	if( talaIndex < 0 || talaIndex >= this.fAksharaCount ) return false;
	if( !isValidGati(gati) ) return false;
	this.fParts[this.fParts.length] = new TalaPart(talaIndex,gati,marker);
	return true;
     }

     /**
      * <b>must</b> be called after adding parts
      */
     this.finalizeParts = function(layout) {
	this.fLayout = layout;
     }

     /**
      * get the # of parts in the tala
      * @type int
      */
     this.getPartCount = function() {  return this.fParts.length; }

     /**
      * return a part given its index
      * @type TalaPart
      */
     this.getNthPart = function(talaIndex) {
	if( talaIndex >= 0 && talaIndex < this.fParts.length ) return this.fParts[talaIndex];
	return null;
     }

     /**
      * return the tala part that contains the index talaIndex
      *
      * @param {int} talaIndex	index (akshara) in a tala cycle
      *
      * @return the part containing the index (or null if no such part)
      * @type TalaPart
      */
     this.getPart = function(talaIndex) {
	var i;
	var nIndex, part;
	var parts = this.fParts;
	var nparts = parts.length;
     	for( i = 0; i < nparts; i++ ) {
	    part = parts[i];
	    if( (i+1) < nparts ) nIndex = parts[i+1].fIndex;
	    else	         nIndex = this.fAksharaCount;
	    if( talaIndex >= part.fIndex && talaIndex < nIndex ) 
		return part;
	}
	return null;
     }

     /**
      * return the tala part duration (in aksharas) of the tala part 
      * containing the index talaIndex
      *
      * @param {int} talaIndex	index (akshara) in a tala cycle
      * @return the duration (in aksharas) of the part containing the 
      *         index (or 0 if no such part)
      * @type int
      */
     this.getPartDuration = function(talaIndex) {
	var i;
	var nIndex, part;
     	for( i = 0; i < this.fParts.length; i++ ) {
	    part = this.fParts[i];
	    if( (i+1) < this.fParts.length ) nIndex = this.fParts[i+1].fIndex;
	    else			     nIndex = this.fAksharaCount;
	    if( talaIndex >= part.fIndex && talaIndex < nIndex ) 
		return nIndex - part.fIndex;
	}
	return 0;
     }

     /**
      * return the tala part duration (in aksharas) of the nth tala part 
      *
      * @param {int} n		the tala part
      * @return the duration (in aksharas) of the part containing the 
      *         index (or 0 if no such part)
      * @type int
      */
     this.getNthPartDuration = function(n) {
	if( n < 0 && n >= this.fParts.length ) return 0;

	var nIndex;
	if( n < (this.fParts.length-1))
	    nIndex = this.fParts[n+1].fIndex;
	else
	    nIndex = this.fAksharaCount;
	return nIndex - this.fParts[n].fIndex;
     }


     /**
      * can we switch gati on this tala?
      * This is allowed only all parts of tala are of same gati
      */
     this.canSwitchGati = function() {
	if( this.fParts.length == 0 ) return false;
	var g = this.fParts[0].fGati;
	for(i = 1; i < this.fParts.length; i++ ) {
	    if( this.fParts[i].fGati != g ) return false;
	}
	return true;
     }

     this.switchGati = function(gati) {
	if( !this.canSwitchGati()) {
	    alert("cannot switch gati/nadai with this tala");
	    return false;
	}
	var curgati = this.fParts[0].fGati;
	if( gati == this.fParts[0].fGati ) return true;	// no change
	for(i = 0; i < this.fParts.length; i++ )
	    this.fParts[i].fGati = gati;

	if( this.fLayout != null ) 
	    this.fLayout.switchGati(curgati, gati);
	return true;
     }

     /**
      * override of {@link SongPart#toXML}
      */
    this.toXML = function() {
	if( this.fPredefName ) {
	    var x = XMLUtils.createXMLNode( this.XMLTagName() );
	    x.setAttribute( "predefined", this.fPredefName );
	    x.setAttribute( "layout", this.fLayoutSpec.toXMLAttribVal() );
	    return x;
	}
	return null;
     }
}
Tala.prototype = new SongPart(PART_TALA);

/**
 * override of {@link SongPart#XMLTagName}
 */
Tala.prototype.XMLTagName = function() { return "tala"; }

/**
 * override of {@link SongPart#fromXML}
 */
Tala.prototype.fromXML = function(xml) {
    if( !XMLUtils.isXMLNode(xml, Tala.prototype.XMLTagName()) )
	return new FromXMLResult(null, "not a tala");
    var predefined = xml.getAttribute("predefined");
    if( !predefined )
	return new FromXMLResult(null, "not a predefined tala" );
    var layout = null;
    var layoutSpecVal = xml.getAttribute("layout");
    if( layoutSpecVal ) {
	var r = TalaLayoutSpecification.prototype.fromXMLAttribVal(layoutSpecVal);
	if( r.fFailureReason != null ) 
	    return r;
	layout = r.fResult;
    }
	
    return new FromXMLResult(PredefinedTalas.fromPredefinedName(predefined, layout));
}

/**
 * utility function to get the duration of a swara of "len" mathrais in a certain speed, a certain gati
 *
 * @param {GATI} gati	the gati to use for the swara
 *
 * @return a {@link Duration} object representing the duration of swara
 * @type Duration
 */
Tala.prototype.getSwaraDuration = function(len, speed, gati) {
    var denom = 1;
    if( speed > 0 ) {
	// 1/2^speed*gati
	var factor = 1;
	var i;
	for(i = 1; i < speed; i++ )  
	    factor *= 2;
	denom = factor*gati;
    }
    return new Duration(len, denom);
}

/**
 * manages predefined talas
 */
function PredefinedTalasDefn()
{
    /**
     * construct a predefined-tala from its name
     * @param {String} 			name		name of tala
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     */
    this.fromPredefinedName = function(name, layoutSpec) {
	var dash    = name.indexOf('-');
	var param1 = "";
	var param2 = "";
	var ncycles = "";
	/*
	    GATI, JATI GENERIC SPEC - NOT YET FULLY IMPLEMENTED
	if( dash >= 0 ) {
	    param1 = name.substring(dash+1);
	    name = name.substring(0,dash);
	}
	// look for jati
	dash = name.indexOf('-');
	if( dash >= 0 ) {
	    param2 = name.substring(dash+1);
	    name = name.substring(0,dash);
	}
	*/

	// TODO: At this point param1 and param2 will be "" since we have
	// commented out the parsing/extracting of those. This restricts
	// the supported talas to the following:
	// adi
	// tisra_adi
	// roopakacapu/rupakacapu
	// roopaka/rupaka
	// misracapu
	// khandacapu
	// eka (i.e. catusra)
	// tisra_eka
	//
	// all are in catusra gati (wherever applicable)
	//
	name = name.toLowerCase();
	if( name == "misracapu" )
	    return this.MisraChapuTala(layoutSpec);
	else if( name == "khandacapu" )
	    return this.KhandaChapuTala(layoutSpec,true);	// 4 cycles per row
	else if( name == "khandacapu2" )
	    return this.KhandaChapuTala(layoutSpec,false);	// 2 cycles per row
	else if( name == "triputa" || name == "tisra_triputa" ) 
	    return this.TisraTriputaTala(layoutSpec);
	else if( name == "khanda_triputa" ) 
	    return this.TriputaTala(layoutSpec,GATI_KHANDA);
	else if( name == "misra_triputa" ) 
	    return this.TriputaTala(layoutSpec,GATI_MISRA);
	else if( name == "sankirna_triputa" ) 
	    return this.TriputaTala(layoutSpec,GATI_SANKIRNA);
	else if( name == "dhruva" || name == "catusra_druva" ) 
	    return this.DhruvaTala(layoutSpec,GATI_CATUSRA);
	else if( name == "dhruva2" || name == "catusra_druva2" ) 
	    return this.DhruvaTala(layoutSpec,GATI_CATUSRA,true);
	else if( name == "tisra_dhruva" )
	    return this.DhruvaTala(layoutSpec,GATI_TISRA);
	else if( name == "khanda_dhruva" )
	    return this.DhruvaTala(layoutSpec,GATI_KHANDA);
	else if( name == "misra_dhruva" )
	    return this.DhruvaTala(layoutSpec,GATI_MISRA);
	else if( name == "sankirna_dhruva" )
	    return this.DhruvaTala(layoutSpec,GATI_SANKIRNA);
	else if( name == "matya" || name == "catusra_matya" ) 
	    return this.MatyaTala(layoutSpec,GATI_CATUSRA);
	else if( name == "tisra_matya" ) 
	    return this.MatyaTala(layoutSpec,GATI_TISRA);
	else if( name == "khanda_matya" ) 
	    return this.MatyaTala(layoutSpec,GATI_KHANDA);
	else if( name == "misra_matya" ) 
	    return this.MatyaTala(layoutSpec,GATI_MISRA);
	else if( name == "sankirna_matya" ) 
	    return this.MatyaTala(layoutSpec,GATI_SANKIRNA);
	else if( name == "ata" || name == "khanda_ata" ) 
	    return this.AtaTala(layoutSpec,GATI_KHANDA);
	else if( name == "tisra_ata" ) 
	    return this.AtaTala(layoutSpec,GATI_TISRA);
	else if( name == "catusra_ata" ) 
	    return this.AtaTala(layoutSpec,GATI_CATUSRA);
	else if( name == "misra_ata" ) 
	    return this.AtaTala(layoutSpec,GATI_MISRA);
	else if( name == "sankirna_ata" ) 
	    return this.AtaTala(layoutSpec,GATI_SANKIRNA);
	else if( name == "jhampa" ) 
	    return this.JhampaTala(layoutSpec, GATI_MISRA);
	else if( name == "tisra_jhampa" ) 
	    return this.JhampaTala(layoutSpec, GATI_TISRA);
	else if( name == "khanda_jhampa" ) 
	    return this.JhampaTala(layoutSpec, GATI_KHANDA);
	else if( name == "misra_jhampa" ) 
	    return this.JhampaTala(layoutSpec, GATI_MISRA);
	else if( name == "sankirna_jhampa" ) 
	    return this.JhampaTala(layoutSpec, GATI_SANKIRNA);
	else if( name == "manual" ) 
	    return this.ManualTala(layoutSpec,null,false);
	else if( name == "manual,inlinetalamarkers" ) 
	    return this.ManualTala(layoutSpec,null,true);
	else if( name.lastIndexOf(",manual") > 0 )
	{
	     var mpos = name.lastIndexOf(",manual");
	     var ipos = name.lastIndexOf(",inlinetalamarkers");
	     if( ipos >= 0 && ipos != (mpos+7) )
	     	return null;	// we want only [,manual[,inlinetalamarkers]]

	     var basetalaname = name.substring(0,mpos);
	     var basetala = PredefinedTalas.fromPredefinedName(basetalaname,layoutSpec);
	     if( !basetala ) return null;
	     return this.ManualTala(layoutSpec,basetala,(ipos >= 0));
	}
	else {
	    if( name == "catusra_triputa" || name == "adi" || name == "adi2kalai" || name == "tisra_adi" || name == "roopakacapu" || 
	    		name == "rupakacapu" || name == "roopakacapu2" || name == "rupakacapu2") {
		var gati = GATI_CATUSRA;
		if( param1 != "" ) {
		    gati = parseInt(param1);
		    if( !isValidGati(gati)) return null;
		}
		if( name == "adi" )
		    return this.AdiTala(gati, layoutSpec);
		else if( name == "adi2kalai" )
		    return this.Adi2KalaiTala(gati, layoutSpec);
		else if( name == "tisra_adi" ) 
		    return this.AdiTala(GATI_TISRA, layoutSpec);
		else 
		    return this.RoopakaChapuTala(gati, 
		    		(name.indexOf("2") <  0),	// roopakacapu/rupakacapu => std - no intervening tala markers
								// roopakacapu2/rupapacapu2 => with intervening tala markers
		    		layoutSpec);
	    }
	    else if( name == "eka" || name == "tisra_eka" ) {
		var laghu = ((name == "eka") ? GATI_CATUSRA : GATI_TISRA);
		var gati  = GATI_CATUSRA;
		if( param1 != "" ) {
		    laghu = parseInt(param1);
		    if( !isValidGati(gati)) return null;
		    // first param is laghu
		}
		if( param2 != "" ) {
		    gati = parseInt(param2);
		    if( !isValidGati(gati)) return null;
		}
		return this.EkaTala(laghu, gati, layoutSpec, true);
	    }
	    else if( name == "khanda_eka" ) 
		return this.EkaTala(GATI_KHANDA, gati, layoutSpec, true);
	    else if( name == "misra_eka" ) 
		return this.EkaTala(GATI_MISRA, gati, layoutSpec, false);
	    else if( name == "sankirna_eka" ) 
		return this.EkaTala(GATI_SANKIRNA, gati, layoutSpec, false);
	    else if( name == "rupaka" || name == "roopaka" ) {
		var laghu = GATI_CATUSRA;
		var gati  = GATI_CATUSRA;
		if( param1 != "" ) {
		    laghu = parseInt(param1);
		    if( !isValidGati(gati)) return null;
		    // first param is laghu
		}
		if( param2 != "" ) {
		    gati = parseInt(param2);
		    if( !isValidGati(gati)) return null;
		}
		return this.RupakaTala(laghu, gati, layoutSpec);
	    }
	    else if( name == "tisra_rupaka" || name == "tisra_roopaka" ) {
		var laghu = GATI_TISRA;
		var gati  = GATI_CATUSRA;
		return this.RupakaTala(laghu, gati, layoutSpec);
	    }
	    else if( name == "khanda_rupaka" || name == "khanda_roopaka" ) {
		var gati = GATI_CATUSRA;
		var laghu  = GATI_KHANDA;
		return this.RupakaTala(laghu, gati, layoutSpec);
	    }
	    else if( name == "misra_rupaka" || name == "misra_roopaka" ) {
		var gati = GATI_CATUSRA;
		var laghu  = GATI_MISRA;
		return this.RupakaTala(laghu, gati, layoutSpec);
	    }
	    else if( name == "sankirna_rupaka" || name == "sankirna_rupaka" ) {
		var gati = GATI_CATUSRA;
		var laghu  = GATI_SANKIRNA;
		return this.RupakaTala(laghu, gati, layoutSpec);
	    }
	    else
		return null;
	}
    }

    /**
     * add a guide row to the tala layout in standard gitam, varnam style i.e. where
     * each akshara is a separate column
     * @param {int} 	   nAksharas	# of aksharas
     * @param {TalaLayout} layout	tala layout
     * @param {GATI}	   gati		the gati for all aksharas
     */
    this._standardVarnamGitamGuide = function(nAksharas, talaLayout, gati) {
	var ar = new Array();
	var i;
	for(i = 0; i < nAksharas; i++ )
	    ar[i] = { span:1, nAksharas: 1, gati: gati };
	talaLayout.addGuideRow(ar, new Duration(nAksharas,1));
    }

    /**
     * add a row to the tala layout in standard gitam, varnam style i.e. where
     * each akshara is a separate column
     * @param {int} 	   nAksharas	# of aksharas
     * @param {TalaLayout} layout	tala layout
     * @param {GATI}	   gati		the gati for all aksharas
     */
    this._standardVarnamGitamRow = function(nAksharas, talaLayout, gati) {
	var ar = new Array();
	var i;
	for(i = 0; i < nAksharas; i++ )
	    ar[i] = { span:1, nAksharas: 1, gati: gati };
	talaLayout.addRow(ar, new Duration(nAksharas,1));
    }

    this.Adi2KalaiTala = function(gati, layoutSpec) {
	var isVarnamGitam = false;
	var layoutName = "";

	if( !layoutSpec ) {
	    // default layout-cycle has 1 tala-cycle and max of 40 swaras in a row
	    layoutSpec = new TalaLayoutSpecification(1, 40);
	}
	else {
	    if( layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();

	    if( layoutName == "varnam" || layoutName == "gitam" ) {
		isVarnamGitam = true;
	    }
	}

	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	var name = "Adi";
	if( gati != GATI_CATUSRA )
	    name += " - " + gatiName(gati,true);


	// create the tala object
	var t = new Tala( name, 16, layoutSpec, "Adi2Kalai-" + gati);
	var p = new Array(); // part info

	if( isVarnamGitam )  {
		// return this.AdiTala(gati, layoutSpec);
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < 7; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	}


	var nl = new TalaLayout(layoutSpec);
	if( gati == GATI_TISRA || gati == GATI_CATUSRA || gati == GATI_KHANDA ) {
	    if( isVarnamGitam ) {
		this._standardVarnamGitamGuide(16, nl, gati);
		this._standardVarnamGitamRow(16, nl, gati);
	    }
	    else {
		nl.addRow( new Array({ span:1, nAksharas:8, gati:gati },
				     { span:1, nAksharas:4, gati:gati },
				     { span:1, nAksharas:4, gati:gati } ), 
		      new Duration(t.aksharaCount(),1) );
	    }
	}
	else  {
	    // others not supported yet
	    return null;
	}

	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(8, gati, MIDDLETALAMARKER );
	    t.addPart(12, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }


    /**
     * create a Tala object representing Adi tala 
     * @param (GATI) gati	the gati for the tala
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Adi tala, or null if invalid gati 
     *         is passed in
     * @type Tala
     */
    this.AdiTala = function(gati, layoutSpec) {
	var isVarnamGitam = false;
	var layoutName = "";

	if( !layoutSpec ) {
	    // default layout-cycle has 1 tala-cycle and max of 40 swaras in a row
	    layoutSpec = new TalaLayoutSpecification(1, 40);
	}
	else {
	    if( layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();

	    if( layoutName == "varnam" || layoutName == "gitam" ) {
		isVarnamGitam = true;
	    }
	}

	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	var name = "Adi";
	if( gati != GATI_CATUSRA )
	    name += " - " + gatiName(gati,true);


	// create the tala object
	var t = new Tala( name, 8, layoutSpec, "Adi-" + gati);
	var p = new Array(); // part info

	if( isVarnamGitam ) {
	    // redefine tala;
	    t.addPart(0, gati, ENDTALAMARKER );
	    for(var i = 1; i <= 3; i++ )
		t.addPart(i, gati, EMPTYTALAMARKER );
	    t.addPart(4, gati, MIDDLETALAMARKER );
	    t.addPart(5, gati, EMPTYTALAMARKER );
	    t.addPart(6, gati, MIDDLETALAMARKER );
	    t.addPart(7, gati, EMPTYTALAMARKER );
	}

	var nl = new TalaLayout(layoutSpec);
	if( gati == GATI_TISRA || gati == GATI_CATUSRA || gati == GATI_KHANDA ) {
	    if( isVarnamGitam ) {
		if( layoutName == "gitam" ) {
		    // 8*3, 8*5 = one row
		    this._standardVarnamGitamGuide(8, nl, gati);
		    this._standardVarnamGitamRow(8, nl, gati);
		}
		else {
		    this._standardVarnamGitamGuide(8, nl, gati);// make only one avarthana (used to be 16 i.e. 2)
		    this._standardVarnamGitamRow(8, nl, gati);	// make only one avarthana (used to be 16 i.e. 2)
		}
	    }
	    else {
		nl.addRow( new Array({ span:1, nAksharas:4, gati:gati },
				     { span:1, nAksharas:2, gati:gati },
				     { span:1, nAksharas:2, gati:gati } ), 
		  new Duration(t.aksharaCount(),1) );
	    }
	}
	else  {
	    /*
	     * misra/sankirna gati
	     * 1 cycles  across 2 rows
	     * (2 + 2) 
	     *  2 + 2
	     */
	    if( isVarnamGitam ) {
		this._standardVarnamGitamGuide(4, nl, gati);	// guide is 4 askaras
		for(var i = 0; i < 2; i++ )
		    this._standardVarnamGitamRow(4, nl, gati);	// 1st row => 4 askharas
	    }
	    else {
		nl.addGuideRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			        	  { span: 1, nAksharas: 2, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array(  { span: 2, nAksharas: 4, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array(  { span: 1, nAksharas: 2, gati: gati },
			      	       { span: 1, nAksharas: 2, gati: gati } ), new Duration(4,1) );
	    }
	}

	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(4, gati, MIDDLETALAMARKER );
	    t.addPart(6, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Tisra Triputa tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Tisra Triputa tala (catusra gati)
     * @type Tala
     */
    this.TisraTriputaTala = function(layoutSpec) {
	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification(1, 40);
	}
	else  {
	    if( layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();

	    if( layoutName == "varnam" || layoutName == "gitam" ) {
		isVarnamGitam = true;
	    }
	}

	var name = "tripuTa";
	// create the tala object
	var t = new Tala( name, 7, layoutSpec, "tripuTa");
	var p = new Array();
	var gati = GATI_CATUSRA;
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < 2; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    this._standardVarnamGitamGuide(7, nl, gati);
	    this._standardVarnamGitamRow(7, nl, gati);
	}
	else {
	    nl.addRow( new Array(
	    			 { span:1, nAksharas:3, gati:gati },
				 { span:1, nAksharas:2, gati:gati },
				 { span:1, nAksharas:2, gati:gati },
	    			 { span:1, nAksharas:3, gati:gati },
				 { span:1, nAksharas:2, gati:gati },
				 { span:1, nAksharas:2, gati:gati }
				 ), 
	  new Duration(2*t.aksharaCount(),1) );
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(3, gati, MIDDLETALAMARKER );
	    t.addPart(5, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Khanda Ata tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing the tala (catusra gati)
     * @type Tala
     */
    this.AtaTala = function(layoutSpec,laghu) {
	if( !laghu ) laghu = GATI_KHANDA;	// khanda ata is default
	if( !isValidGati(laghu) ) return null;

	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification("krithi");
	}
	if( layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}

	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara*2 + 4;

	var name = "aTa";
	// create the tala object
	var t = new Tala( name, nAksharas, layoutSpec, "aTa-" + laghu + "-" + gati);
	var p = new Array();
	var gati = GATI_CATUSRA;
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    if( laghu == GATI_MISRA ) {
		this._standardVarnamGitamGuide(9, nl, gati);
		this._standardVarnamGitamRow(9, nl, gati);
		this._standardVarnamGitamRow(9, nl, gati);
	    }
	    else if( laghu == GATI_SANKIRNA ) {
		this._standardVarnamGitamGuide(11, nl, gati);
		this._standardVarnamGitamRow(11, nl, gati);
		this._standardVarnamGitamRow(11, nl, gati);
	    }
	    else {
		// One row
		this._standardVarnamGitamGuide(nAksharas, nl, gati);
		this._standardVarnamGitamRow(nAksharas, nl, gati);
	    }
	}
	else {
	    if( laghu == GATI_MISRA ) {
		// two rows (note: only catusra gati is supported)
		// ( 5   + 2) + ( 2 +
		//   5 ) + 2  +   2

		// redefine since an anga is split over two rows
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(7, gati, MIDDLETALAMARKER );
		t.addPart(9, gati, EMPTYTALAMARKER );
		t.addPart(14, gati, MIDDLETALAMARKER );
		t.addPart(16, gati, MIDDLETALAMARKER );

		nl.addGuideRow( new Array({ span: 1, nAksharas: 5, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		nl.addRow( new Array({ span: 2, nAksharas: 7, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 5, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
	    }
	    else if( laghu == GATI_SANKIRNA ) {
		// two rows (note: only catusra gati is supported)
		// ( 7   + 2) + ( 2 +
		//   7 ) + 2  +   2

		// redefine since an anga is split over two rows
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(9, gati, MIDDLETALAMARKER );
		t.addPart(11, gati, EMPTYTALAMARKER );
		t.addPart(18, gati, MIDDLETALAMARKER );
		t.addPart(20, gati, MIDDLETALAMARKER );
		nl.addGuideRow( new Array({ span: 1, nAksharas: 7, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(11,1) );
		nl.addRow( new Array({ span: 2, nAksharas: 9, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(11,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 7, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati },
				          { span: 1, nAksharas: 2, gati: gati }), new Duration(11,1) );
	    }
	    else {
		nl.addRow( new Array({ span: 1, nAksharas: laghuAkshara, gati: gati },
				      { span: 1, nAksharas: laghuAkshara, gati: gati },
				      { span: 1, nAksharas: 2, gati: gati },
				      { span: 1, nAksharas: 2, gati: gati }), new Duration(nAksharas,1) );
	    }
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(2*laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(2*laghuAkshara+2, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Khanda Triputa tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing the tala (catusra gati)
     * @type Tala
     */
    this.TriputaTala = function(layoutSpec, laghu) {
	if( !laghu ) laghu = GATI_TISRA;	// tisra triputa is the default
	if( !isValidGati(laghu) ) return null;

	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification("krithi");
	}
	if( layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}


	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara + 4;

	var name = "tripuTa";
	// create the tala object
	var t = new Tala( name, nAksharas, layoutSpec, "tripuTa-" + laghu);
	var p = new Array();
	var gati = GATI_CATUSRA;
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    // One row
	    this._standardVarnamGitamGuide(nAksharas, nl, gati);
	    this._standardVarnamGitamRow(nAksharas, nl, gati);
	}
	else {
	    nl.addRow( new Array({ span: 1, nAksharas: laghuAkshara, gati: gati },
				  { span: 1, nAksharas: 2, gati: gati },
				  { span: 1, nAksharas: 2, gati: gati }), new Duration(nAksharas,1) );
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(laghuAkshara+2, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Catusra Dhruva tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing the tala (catusra gati)
     * @type Tala
     */
    this.DhruvaTala = function(layoutSpec, laghu, catusraTwoRows) {
	if( !laghu ) laghu = GATI_CATUSRA;	// catusra dhruva is default
	if( !isValidGati(laghu) ) return null;

	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification("krithi");
	}
	if( layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}

	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara*3 + 2;

	var name = "dhruva";
	// create the tala object
	var t = new Tala( name, nAksharas, layoutSpec, "dhruva-" + laghu + "-" + gati);
	var p = new Array();
	var gati = GATI_CATUSRA;
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    if( laghu == GATI_CATUSRA && catusraTwoRows ) {
		this._standardVarnamGitamGuide(8, nl, gati);
		this._standardVarnamGitamRow(6, nl, gati);
		this._standardVarnamGitamRow(8, nl, gati);
	    }
	    else {
		if( laghu == GATI_CATUSRA || laghu == GATI_TISRA ) { 
		    // One row
		    this._standardVarnamGitamGuide(nAksharas, nl, gati);
		    this._standardVarnamGitamRow(nAksharas, nl, gati);
		}
		else if( laghu == GATI_KHANDA ) {
		    this._standardVarnamGitamGuide(10, nl, gati);
		    this._standardVarnamGitamRow(7, nl, gati);	// 5 + 2
		    this._standardVarnamGitamRow(10, nl, gati); // 5 + 5
		}
		else if( laghu == GATI_MISRA ) {
		    this._standardVarnamGitamGuide(9, nl, gati);
		    this._standardVarnamGitamRow(9, nl, gati);	 // 7 + 2
		    this._standardVarnamGitamRow(7, nl, gati);	 // 7
		    this._standardVarnamGitamRow(7, nl, gati);	 // 7
		}
		else if( laghu == GATI_SANKIRNA ) {
		    this._standardVarnamGitamGuide(11, nl, gati);
		    this._standardVarnamGitamRow(11, nl, gati);	 // 9 + 2
		    this._standardVarnamGitamRow(9, nl, gati);	 // 9
		    this._standardVarnamGitamRow(9, nl, gati);	 // 9
		}
	    }
	}
	else {
	    if( laghu == GATI_CATUSRA && catusraTwoRows ) {
		// two rows  
		// 4 + 2 
		// 4 + 4
		//
		// (2 + 2) + 2 + 2
		//  2 + (2 + 2)
		nl.addGuideRow( new Array({ span: 1, nAksharas: 4, gati: gati },
					  { span: 1, nAksharas: 4, gati: gati }), new Duration(8,1) );
		nl.addRow( new Array(
				     { span:1, nAksharas:4, gati:gati },
				     { span:1, nAksharas:2, gati:gati } ), new Duration(6, 1) );
		nl.addRow( new Array(
				     { span:1, nAksharas:4, gati:gati },
				     { span:1, nAksharas:4, gati:gati } ), new Duration(8, 1) );
	    }
	    else {
		if( laghu == GATI_CATUSRA || laghu == GATI_TISRA ) {
		    nl.addRow( new Array({ span: 1, nAksharas: laghuAkshara, gati: gati },
					      { span: 1, nAksharas: 2, gati: gati },
					      { span: 1, nAksharas: laghuAkshara, gati: gati },
					      { span: 1, nAksharas: laghuAkshara, gati: gati }), 
					      new Duration(nAksharas,1) );
		}
		else if( laghu == GATI_KHANDA ) {
		    // 5 + 2
		    // 5 + (2 + 3)
		    nl.addGuideRow( new Array({ span: 1, nAksharas: 5, gati: gati },
					      { span: 1, nAksharas: 2, gati: gati },
					      { span: 1, nAksharas: 3, gati: gati }), new Duration(10,1) );
		    nl.addRow( new Array({ span:1, nAksharas:5, gati:gati },
					 { span:1, nAksharas:2, gati:gati } ), new Duration(7, 1) );
		    nl.addRow( new Array({ span:1, nAksharas:5, gati:gati },
					 { span:2, nAksharas:5, gati:gati } ), new Duration(10, 1) );
		}
		else if( laghu == GATI_MISRA ) {
		    // 7 + 2
		    // 7
		    // 7
		    nl.addGuideRow( new Array({ span: 1, nAksharas: 7, gati: gati },
					      { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		    nl.addRow( new Array({ span:1, nAksharas:7, gati:gati },
					 { span:1, nAksharas:2, gati:gati } ), new Duration(9, 1) );
		    nl.addRow( new Array({ span:1, nAksharas:7, gati:gati }), new Duration(7, 1) );
		    nl.addRow( new Array({ span:1, nAksharas:7, gati:gati }), new Duration(7, 1) );
		}
		else if( laghu == GATI_SANKIRNA ) {
		    // 9 + 2
		    // 9
		    // 9
		    nl.addGuideRow( new Array({ span: 1, nAksharas: 9, gati: gati },
					      { span: 1, nAksharas: 2, gati: gati }), new Duration(11,1) );
		    nl.addRow( new Array({ span:1, nAksharas:9, gati:gati },
					 { span:1, nAksharas:2, gati:gati } ), new Duration(11, 1) );
		    nl.addRow( new Array({ span:1, nAksharas:9, gati:gati }), new Duration(9, 1) );
		    nl.addRow( new Array({ span:1, nAksharas:9, gati:gati }), new Duration(9, 1) );
		}
	    }
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(laghuAkshara+2, gati, MIDDLETALAMARKER );
	    t.addPart(2*laghuAkshara+2, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Catusra Matya tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Catusra Dhruva tala (catusra gati)
     * @type Tala
     */
    this.MatyaTala = function(layoutSpec, laghu) {
	if( !laghu ) laghu = GATI_CATUSRA;	// catusra jhampa is the default
	if( !isValidGati(laghu) ) return null;

	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification("krithi");
	}
	if( layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}

	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara*2 + 2;

	var name = "maTya";
	// create the tala object
	var gati = GATI_CATUSRA;
	var t = new Tala( name, nAksharas, layoutSpec, "maTya-" + laghu + "-" + gati);
	var p = new Array();
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    if( laghu == GATI_MISRA ) {
		this._standardVarnamGitamGuide(9, nl, gati);
		this._standardVarnamGitamRow(9, nl, gati);
		this._standardVarnamGitamRow(7, nl, gati);
	    }
	    else if( laghu == GATI_SANKIRNA ) {
		this._standardVarnamGitamGuide(11, nl, gati);
		this._standardVarnamGitamRow(11, nl, gati);
		this._standardVarnamGitamRow(9, nl, gati);
	    }
	    else {
		// One row
		this._standardVarnamGitamGuide(nAksharas, nl, gati);
		this._standardVarnamGitamRow(nAksharas, nl, gati);
	    }
	}
	else {
	    if( laghu == GATI_MISRA ) {
		// two rows (note: only catusra gati is supported)
		// 7 + 2
		// 7
		nl.addGuideRow( new Array({ span: 1, nAksharas: 7, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );

		nl.addRow( new Array({ span: 1, nAksharas: 7, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 7, gati: gati }), new Duration(7,1) );
	    }
	    else if( laghu == GATI_SANKIRNA ) {
		// two rows (note: only catusra gati is supported)
		// 9 + 2
		// 9
		nl.addGuideRow( new Array({ span: 1, nAksharas: 9, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati }), new Duration(11,1) );

		nl.addRow( new Array({ span: 1, nAksharas: 9, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 9, gati: gati }), new Duration(9,1) );
	    }
	    else {
		nl.addRow( new Array({ span: 1, nAksharas: laghuAkshara, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati },
				     { span: 1, nAksharas: laghuAkshara, gati: gati }), new Duration(nAksharas,1) );
	    }
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(laghuAkshara+2, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Jhampa tala  (catusra gati)
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Catusra Dhruva tala (catusra gati)
     * @type Tala
     */
    this.JhampaTala = function(layoutSpec, laghu) {
	if( !laghu ) laghu = GATI_MISRA;	// misra jhampa is the default
	if( !isValidGati(laghu) ) return null;

	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara + 3;

	var isVarnamGitam = false;
	var layoutName = "";
	if( !layoutSpec ) {
	    layoutSpec = new TalaLayoutSpecification("krithi");
	}
	if( layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}

	var name = "jhampa";
	// create the tala object
	var t = new Tala( name, nAksharas, layoutSpec, "jhampa-" + laghu + "-" + gati);
	var p = new Array();
	var gati = GATI_CATUSRA;
	if( isVarnamGitam ) {
	    // redefine tala;
	    var i = 0;
	    t.addPart(i++, gati, ENDTALAMARKER );
	    for(var j = 0; j < laghuAkshara-1; j++ )
		t.addPart(i++, gati, EMPTYTALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );

	    t.addPart(i++, gati, MIDDLETALAMARKER );
	    t.addPart(i++, gati, EMPTYTALAMARKER );
	}
	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam ) {
	    // One row
	    this._standardVarnamGitamGuide(nAksharas, nl, gati);
	    this._standardVarnamGitamRow(nAksharas, nl, gati);
	}
	else {
	    if( laghu == GATI_TISRA || laghu == GATI_CATUSRA ) {
		// tisra-jhampa and catusra-jhampa - two cycles per row
		nl.addRow( new Array(
				     { span: 1, nAksharas: laghuAkshara, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati },
				     { span: 1, nAksharas: 1, gati: gati },
				     { span: 1, nAksharas: laghuAkshara, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati },
				     { span: 1, nAksharas: 1, gati: gati }
				     ), new Duration(2*nAksharas,1) );
	    }
	    else {
		// khanda,misra and sankirna jhampas two cycles per row
		nl.addRow( new Array({ span: 1, nAksharas: laghuAkshara, gati: gati },
				     { span: 1, nAksharas: 2, gati: gati },
				     { span: 1, nAksharas: 1, gati: gati }), new Duration(nAksharas,1) );
	    }
	}
	if( t.getPartCount() == 0 )  {
	    // add tala parts
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(laghuAkshara+1, gati, MIDDLETALAMARKER );
	}

	t.finalizeParts(nl);
	return t;
    }

    this.ManualTala = function(layoutSpec,basetala,inlinetalamarkers) {
	var t = new Tala( "manual", 1000, layoutSpec, "manual" );
	if( !basetala )
	{
		var gati= GATI_CATUSRA;
		t.addPart(0, gati, ENDTALAMARKER );
		if( !layoutSpec )
		    layoutSpec = new TalaLayoutSpecification(1, 1000);
		var nl = new TalaLayout(layoutSpec);
		nl.addRow( new Array({ span: 1, nAksharas: 1000, gati: gati }), new Duration(1000,1) );
		t.finalizeParts(nl);
		t.hasBaseTala = false;
	}
	else
	{
		var parts = basetala.fParts;
		var i;
		var t = new Tala( "manual", basetala.aksharaCount(), layoutSpec, "manual" );
		for( i = 0; i < parts.length; i++ )
		    t.addPart( parts[i].fIndex, parts[i].fGati, parts[i].fMarker );

		if( !layoutSpec )
		    layoutSpec = new TalaLayoutSpecification(1, 1000);

		//var c = t.aksharaCount();
		//var nCycles = parseInt(1000/c)+1;
		//var spans = new Array();
		//var index = 0;
		//for( i = 0; i < nCycles; i++ )
		//{
		     //for( j = 0; j < parts.length; j++ )
			//spans[spans.length] = { span: 1, nAksharas: basetala.getNthPartDuration(j) };
		//}
		var nl = new TalaLayout(layoutSpec);
		//nl.addGuideRow( new Array({ span: 1, nAksharas: 1000, gati: gati }, new Duration(1000,1) ) );
		//nl.addRow( spans, new Duration(1000,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 1000, gati: GATI_CATUSRA }), new Duration(1000,1) );
		t.finalizeParts(nl);
		t.hasBaseTala = true;
	}
	t.inlineTalaMarkers = inlinetalamarkers;
	return t;
    }

    /**
     * create a Tala object representing Eka tala 
     * @param {GATI} 			gati		the gati for the tala
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing roopaka tala, or null if invalid gati 
     *         is passed in
     * @type Tala
     */
    this.EkaTala = function(laghu, gati, layoutSpec, twoCyclesPerRow) {
	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	if( !laghu ) laghu = GATI_CATUSRA;
	if( !isValidGati(laghu) ) return null;

	// create the tala object
	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara;
	var t = new Tala( name, nAksharas, layoutSpec, "Eka-" + laghu + "-" + gati);
	t.addPart(0, gati, ENDTALAMARKER );
	var p = new Array(); // part info

	var isVarnamGitam = false;
	var layoutName = "";

	// add tala parts
	if( !layoutSpec ) {
	    /*
	     * default layout-cycle has max of 64 swaras in a row (we choose 64 since 
	     * we render adi-catusra gati such that it is rendered in one column, and 
	     * for that you would have a max of 64 swaras in triple speed) swaras in 
	     * a row 
	     *
	     * This may contain 1 or more cycles depending on gati (only in tisra 
	     * you would have more as 3*3*2 = 18, and two such can fit in 40)
	     */
	    var nCycles = parseInt(64/(3*gati*this.fMaxSpeedFactor));
	    if( nCycles > 2 ) nCycles = parseInt(nCycles/2)*2;
	    layoutSpec = new TalaLayoutSpecification(nCycles, 64);
	}
	else {
	    if( layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();

	    if( layoutName == "varnam" || layoutName == "gitam" )
		isVarnamGitam = true;
	}

	var nl = new TalaLayout(layoutSpec);
	if( isVarnamGitam /*&& layoutName == "gitam"*/ ) {
	    // redefine tala;
	    for(var i = 1; i <= nAksharas-1; i++ ) 
		t.addPart(i, gati, EMPTYTALAMARKER );
	    if( twoCyclesPerRow ) {
		this._standardVarnamGitamGuide(2*nAksharas, nl, gati);
		this._standardVarnamGitamRow(2*nAksharas, nl, gati);
	    }
	    else {
		this._standardVarnamGitamGuide(nAksharas, nl, gati);
		this._standardVarnamGitamRow(nAksharas, nl, gati);
		// one cycle per row
	    }
	}
	else {
	    // for now do them all as  cycles per row
	    if( twoCyclesPerRow ) {
		nl.addGuideRow( new Array({ span: 1, nAksharas: nAksharas, gati: gati },
					  { span: 1, nAksharas: nAksharas, gati: gati }), new Duration(2*nAksharas,1) );
		nl.addRow( new Array(  { span: 1, nAksharas: nAksharas, gati: gati },
				       { span: 1, nAksharas: nAksharas, gati: gati } ), new Duration(2*nAksharas,1) );
	    }
	    else {
		nl.addGuideRow( new Array({ span: 1, nAksharas: nAksharas, gati: gati }), new Duration(nAksharas,1) );
		nl.addRow( new Array({ span: 1, nAksharas: nAksharas, gati: gati }), new Duration(nAksharas,1) );
	    }
	}
	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Roopaka tala 
     * @param {GATI} 			gati		the gati for the tala
     * @param {boolean} 		noIntervening	show intervening markers?
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing roopaka tala, or null if invalid gati 
     *         is passed in
     * @type Tala
     */
    this.RoopakaChapuTala = function(gati, noIntervening, layoutSpec) {
	var isVarnamGitam = false;

	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	var name = "rUpaka (cApu)";
	if( gati != GATI_CATUSRA )
	    name += " - " + gatiName(gati,true);

	if( !layoutSpec ) {
	    /*
	     * default layout-cycle has max of 64 swaras in a row (we choose 64 since 
	     * we render adi-catusra gati such that it is rendered in one column, and 
	     * for that you would have a max of 64 swaras in triple speed) swaras in 
	     * a row 
	     *
	     * This may contain 1 or more cycles depending on gati (only in tisra 
	     * you would have more as 3*3*2 = 18, and two such can fit in 40)
	     */
	    var nCycles = parseInt(64/(3*gati*this.fMaxSpeedFactor));
	    if( nCycles > 2 ) nCycles = parseInt(nCycles/2)*2;
	    layoutSpec = new TalaLayoutSpecification(nCycles, 64);
	}
	else {
	    if( layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();

	    if( layoutName == "varnam" || layoutName == "gitam" )
		isVarnamGitam = true;
	}

	// create the tala object
	var t = new Tala( name, 3 , layoutSpec, "roopakacapu-"+gati);
	// add tala parts
	t.addPart(0, gati, ENDTALAMARKER );
	if( !noIntervening ) {
	    t.addPart(1, gati, MIDDLETALAMARKER );
	    t.addPart(2, gati, MIDDLETALAMARKER );
	}
	else {
	    t.addPart(1, gati, EMPTYTALAMARKER );
	    t.addPart(2, gati, EMPTYTALAMARKER );
	}

	var nl = new TalaLayout(layoutSpec);

	if( gati == GATI_TISRA || gati == GATI_CATUSRA || gati == KHANDA ) {
	    // 2 cycles (6 aksharas) on a row
	    // 6*3 = 18, 6*4 = 24, 6*5 = 30
	    //if( !noIntervening || isVarnamGitam ) {
		this._standardVarnamGitamGuide(6, nl, gati);
		this._standardVarnamGitamRow(6, nl, gati);
	    //}
	    //else {
		//nl.addRow( new Array({ span:1, nAksharas:3, gati:gati },
				     //{ span:1, nAksharas:3, gati:gati } ), 
		  //new Duration(2*t.aksharaCount(),1) );
	    //}
	}
	else {
	    // 1 cycle per row
	    // 3*7 = 21, 3*9 = 27;
	    //if( /* !noIntervening || */ isVarnamGitam ) {
		this._standardVarnamGitamGuide(3, nl, gati);
		this._standardVarnamGitamRow(3, nl, gati);
	    //}
	    //else {
		//nl.addRow( new Array({ span:1, nAksharas:3, gati:gati } ),
			  //new Duration(t.aksharaCount(),1) );
	    //}
	}
	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Misra Chapu tala 
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Misra Chapu
     * @type Tala
     */
    this.MisraChapuTala = function(layoutSpec) {
	var name = "miSra cApu";
	// create the tala object
	var t = new Tala( name, 3, layoutSpec, "misracapu");

	if( !layoutSpec ) {
	    /*
	     * default layout-cycle has max of 40 swaras in a row and that
	     * may contain 1 or more cycles 
	     */
	    var nCycles = parseInt(64/ (GATI_TISRA + 2*GATI_CATUSRA)*this.fMaxSpeedFactor);
	    layoutSpec = new TalaLayoutSpecification(nCycles, 64);
	}
	// add tala parts
	t.addPart(0, GATI_TISRA, ENDTALAMARKER );
	t.addPart(1, GATI_CATUSRA, EMPTYTALAMARKER );
	t.addPart(2, GATI_CATUSRA, EMPTYTALAMARKER );

	var nl = new TalaLayout(layoutSpec);
	nl.addRow( new Array({ span: 1, nAksharas: 1, gati: GATI_TISRA },
		    { span: 1, nAksharas: 1, gati: GATI_CATUSRA },
		    { span: 1, nAksharas: 1, gati: GATI_CATUSRA },
		    { span: 1, nAksharas: 1, gati: GATI_TISRA },
		    { span: 1, nAksharas: 1, gati: GATI_CATUSRA },
		    { span: 1, nAksharas: 1, gati: GATI_CATUSRA } ),
		    new Duration(2*t.aksharaCount(),1) );

	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Khanda Chapu tala 
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Khanda Chapu
     * @type Tala
     */
    this.KhandaChapuTala = function(layoutSpec, fourCycles, showInternal) {
	var name = "khanDa cApu";
	// create the tala object
	var t = new Tala( name, 2, layoutSpec, "khandacapu");
	if( !layoutSpec ) {
	    /*
	     * default layout-cycle has max of 40 swaras in a row and that
	     * may contain 1 or more cycles 
	     */
	    var nCycles = parseInt(64, (GATI_TISRA + GATI_CATUSRA)*this.fMaxSpeedFactor);
	    layoutSpec = new TalaLayoutSpecification(nCycles, 64);
	}
	// add tala parts
	t.addPart(0, GATI_CATUSRA, ENDTALAMARKER );
	t.addPart(1, GATI_TISRA, EMPTYTALAMARKER );

	var nl = new TalaLayout(layoutSpec);
	if( fourCycles ) {
	    nl.addRow( new Array({ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA },
			{ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA },
			{ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA },
			{ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA }),
			new Duration(4*t.aksharaCount(),1) );
	}
	else {
	    nl.addRow( new Array({ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA },
			{ span: 1, nAksharas: 1, gati: GATI_CATUSRA },
			{ span: 1, nAksharas: 1, gati: GATI_TISRA }),
			new Duration(2*t.aksharaCount(),1) );
	}
	t.finalizeParts(nl);
	return t;
    }

    /**
     * create a Tala object representing Rupaka tala 
     * <p>
     * NOTE: currently only catusra rUpaka, catusra gati is supported!
     *
     * @param (GATI) laghu	the laghu for the tala
     * @param (GATI) gati	the gati for the tala
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Rupaka Tala
     * @type Tala
     */
    this.RupakaTala = function(laghu, gati, layoutSpec) {
	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	if( !laghu ) laghu = GATI_CATUSRA;
	if( !isValidGati(laghu) ) return null;

	// create the tala object
	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara + 2;
	var t = new Tala( name, nAksharas, layoutSpec, "rUpaka-" + laghu + "-" + gati);
	var p = new Array(); // part info
	// add tala parts
	var layoutName = "";
	if( !layoutSpec ) {
	    // default layout-cycle has 1 tala-cycle and max of 40 swaras in a row
	    layoutSpec = new TalaLayoutSpecification(1, 40);
	}
	else {
	    if( layoutSpec && layoutSpec.fName )
		layoutName = layoutSpec.fName.toLowerCase();
	    var isVarnamGitam = false;

	    if( layoutName == "varnam" || layoutName == "gitam" ) {
		isVarnamGitam = true;

		// redefine tala;
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(1, gati, EMPTYTALAMARKER );
		t.addPart(2, gati, MIDDLETALAMARKER);
		for(var i = 0; i < (laghuAkshara-1); i++ )
		    t.addPart(i+3, gati, EMPTYTALAMARKER );
	    }
	}
	var nl = new TalaLayout(layoutSpec);
	var valid = false;
	// only catusra gati for now
	if( gati == GATI_CATUSRA ) {
		if( isVarnamGitam ) {
		    // only one cycle
		    if( laghu == GATI_TISRA || laghu == GATI_CATUSRA ) {
			this._standardVarnamGitamGuide(2*nAksharas, nl, gati);
			this._standardVarnamGitamRow(2*nAksharas, nl, gati);
		    }
		    else {
			this._standardVarnamGitamGuide(nAksharas, nl, gati);
			this._standardVarnamGitamRow(nAksharas, nl, gati);
		    }
		}
		else {
		    if( laghu == GATI_TISRA || laghu == GATI_CATUSRA || laghu == GATI_KHANDA ) {
			// two cycles per row  (only catusra gati!)
			nl.addRow( new Array(  { span: 1, nAksharas: 2, gati: gati },
					       { span: 1, nAksharas: laghuAkshara, gati: gati },
					       { span: 1, nAksharas: 2, gati: gati },
					       { span: 1, nAksharas: laghuAkshara, gati: gati } ),
						new Duration(nAksharas*2,1) );
		    }
		    else {
			// misra and sankirna - just one cycle per row
			nl.addRow( new Array(  { span: 1, nAksharas: 2, gati: gati },
					       { span: 1, nAksharas: laghuAkshara, gati: gati }),
						new Duration(nAksharas,1) );
		    }
		}
		valid = true;
	}
	// if the layout didnt define the tala (it may split parts to suit layout)
	// - we define it the normal way
	if( valid ) {
	    if( t.getPartCount() == 0 ) 
	    {
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(2, gati, MIDDLETALAMARKER );
	    }
	    t.finalizeParts(nl);
	    return t;
	}
	else {
	    return null;
	}
    }

    /**
     * create a Tala object representing Triputa tala 
     * @param (GATI) laghu	the laghu for the tala
     * @param (GATI) gati	the gati for the tala
     * @param {TalaLayoutSpecification} layoutSpec	if not null, a tala layout 
     *							spec to use (if null, a 
     *							default one would be 
     *							selected)
     * @return a tala object representing Khanda Chapu
     * @type Tala
     */
    this.GenericTriputaTala = function(laghu, gati, layoutSpec) {
	if( !gati ) gati = GATI_CATUSRA;
	if( !isValidGati(gati) ) return null;
	if( !laghu ) laghu = GATI_CATUSRA;
	if( !isValidGati(laghu) ) return null;

	// create the tala object
	var laghuAkshara = ((laghu == GATI_CATUSRA) ? 4 : laghu);
	var nAksharas = laghuAkshara + 4;
	var t = new Tala( name, nAksharas, layoutSpec, "tripuTa-" + laghu + "-" + gati);
	var p = new Array(); // part info
	// add tala parts
	var nl = new TalaLayout(layoutSpec);
	var layoutName = "";
	if( layoutSpec && layoutSpec.fName )
	    layoutName = layoutSpec.fName.toLowerCase();
	var isVarnamGitam = false;

	if( layoutName == "varnam" || layoutName == "gitam" ) {
	    isVarnamGitam = true;
	}
	if( laghu == GATI_TISRA ) {
	    // tisra triputa: 3 + 2 + 2
	    if( gati == GATI_TISRA || gati == GATI_CATUSRA || gati == GATI_KHANDA ) {
		// 7*3 = 21 => one row only
		// 7*4 = 28 => one row only
		// 7*5 = 35 => one row only
		if( isVarnamGitam ) {
		    this._standardVarnamGitamGuide(nAksharas, nl, gati);
		    this._standardVarnamGitamRow(nAksharas, nl, gati);
		}
		else {
		    nl.addRow( new Array(  { span: 1, nAksharas: 3, gati: gati },
					   { span: 1, nAksharas: 2, gati: gati },
				           { span: 1, nAksharas: 2, gati: gati } ), 
			                    new Duration(t.aksharaCount(),1) );
		}
	    }
	    else if( gati == GATI_MISRA ) {
		// 3*7 + 2*7 + 2*7 = 21 + 14 + 14 = 49
		// 2 rows:
		// 35 (3+2)
		// 14 (2)
		// 
		// (2+1) + 2
		//  2
		nl.addGuideRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			        	  { span: 1, nAksharas: 1, gati: gati },
			        	  { span: 1, nAksharas: 2, gati: gati }), new Duration(5,1) );

		nl.addRow( new Array(  { span: 2, nAksharas: 3, gati: gati },
			      { span: 1, nAksharas: 2, gati: gati } ), new Duration(5,1) );
		nl.addRow( new Array(  { span: 1, nAksharas: 2, gati: gati } ), new Duration(2,1) );
	    }
	    else {
		// 3*9 + 2*9 + 2*9 = 27 + 18 + 18 = 63
		// 2 rows:
		// 27
		// 36
		// 
		// (2 +  1) 		(3, span: 2)
		//  2 + (1 + 1) 	(2, span: 1), (2, span: 2)
		nl.addGuideRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			        { span: 1, nAksharas: 1, gati: gati },
			        { span: 1, nAksharas: 1, gati: gati }), new Duration(4,1) );

		nl.addRow( new Array(  { span: 2, nAksharas: 3, gati: gati } ), new Duration(3,1) );
		nl.addRow( new Array(  { span: 1, nAksharas: 2, gati: gati },
			      	       { span: 2, nAksharas: 2, gati: gati } ), new Duration(4,1) );
	    }
	}
	else if( laghu == GATI_CATUSRA ) {
	    // catusra triputa (Adi): 4 + 2 + 2
	    if( gati == GATI_TISRA || gati == GATI_CATUSRA ) {
		// 8*3 = 24 => one row only
		// 8*4 = 32 => one row only
		nl.addRow( new Array(  { span: 1, nAksharas: 4, gati: gati },
			      	       { span: 1, nAksharas: 2, gati: gati },
			      	       { span: 1, nAksharas: 2, gati: gati } ), 
			  new Duration(t.aksharaCount(),1) );
	    }
	    else if( gati == GATI_KHANDA ) {
		// 4*5 + 2*5 + 2*5 = 20 + 10 + 10 = 40;
		// 2 rows:
		// 30
		// 10
		//
		// (2 + 2) + 2	(4, span:2), (2, span: 1)
		//  2		(2, span:1)
		nl.addGuideRow( new Array( { span: 1, nAksharas: 2, gati: gati },
			        	   { span: 1, nAksharas: 2, gati: gati },
			        	   { span: 1, nAksharas: 2, gati: gati }), new Duration(6,1) );

		nl.addRow( new Array({ span: 2, nAksharas: 4, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati } ), new Duration(6,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati } ), new Duration(2,1) );
	    }
	    else if( gati == GATI_MISRA ) {
		// 4*7 + 2*7 + 2*7 = 28 + 14 + 14 = 58
		// 2 rows:
		// 28 
		// 28
		//
		// (2 + 2) 	(4, span: 2)
		//  2 + 2	(2, span: 1), (2, span 1)
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 2, gati: gati }), new Duration(4,1) );

		nl.addRow( new Array({ span: 1, nAksharas: 4, gati: gati } ), new Duration(4,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati } ), new Duration(4,1) );
	    }
	    else {
		// 4*9 + 2*9 + 2*9 = 36 + 18 + 18 = 72
		// 2 rows:
		// 36
		// 36
		//
		// (2 + 2) 	(4, span: 2)
		//  2 + 2	(2, span: 1), (2, span 1)
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 2, gati: gati }), new Duration(4,1) );

		nl.addRow( new Array({ span: 1, nAksharas: 4, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati }), new Duration(4,1) );
	    }
	}
	else if( laghu == GATI_KHANDA ) {
	    // khanda triputa: 5 + 2 + 2
	    if( gati == GATI_TISRA || gati == GATI_CATUSRA ) {
		// 9*3 = 27 => one row only
		// 9*4 = 36 => one row only
		nl.addRow( new Array({ span: 1, nAksharas: 5, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati } ), 
			  new Duration(t.aksharaCount(),1) );
	    }
	    else if( gati == GATI_KHANDA ) {
		// 5*5 + 2*5 + 2*5 = 25 + 10 + 10 = 45;
		// 2 rows:
		// 35
		// 10
		//
		// (2 + 3) + 2	(5, span: 2), (2, span 1)
		//  2 		(2, span: 1)
		nl.addGuideRow(new Array({ span: 1, nAksharas: 2, gati: gati },
			         	 { span: 1, nAksharas: 3, gati: gati },
			         	 { span: 1, nAksharas: 2, gati: gati }), new Duration(7,1) );
		nl.addRow( new Array({ span: 2, nAksharas: 5, gati: gati },
			      	     { span: 1, nAksharas: 2, gati: gati } ), new Duration(7,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati } ), new Duration(2,1) );
	    }
	    else if( gati == GATI_MISRA ) {
		// 5*7 + 2*7 + 2*7 = 35 + 14 + 14 = 58
		// 2 rows:
		// 35 
		// 28
		//
		// (2 + 2 + 1) 	(5, span: 3)
		//  2 + 2	(2, span: 1), (2, span: 2)
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 1, gati: gati }), new Duration(5,1) );
		nl.addRow( new Array({ span: 3, nAksharas: 5, gati: gati }), new Duration(5,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			      	     { span: 2, nAksharas: 2, gati: gati }), new Duration(4,1) );
	    }
	    else {
		// 5*9 + 2*9 + 2*9 = 45 + 18 + 18 = 81
		// 3 rows:
		// 27  3	(3/5 of the laghu, span = 2)
		// 36 (2 + 2)	(2/5 of laghu + first dhrutam. span = 1, span = 1
		// 18  2	(second dhrutam, span = 1)
		//
		// (2 +  1)		(3, span: 2)
		//  2 + (1 + 1)		(2, span: 1), (2, span: 2)
		//  2			(2, span: 1)
		nl.addGuideRow(new Array({ span: 1, nAksharas: 2, gati: gati },
			         	 { span: 1, nAksharas: 1, gati: gati },
			         	 { span: 1, nAksharas: 1, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array({ span: 2, nAksharas: 3, gati: gati }), new Duration(3,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			      	     { span: 2, nAksharas: 2, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati }), new Duration(2,1) );

		// since this layout involved the laghu to be split, we will
		// assign tala parts accordingly
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(3, gati, EMPTYTALAMARKER );	// the split: note tala marker is empty
		t.addPart(5, gati, MIDDLETALAMARKER );
		t.addPart(7, gati, MIDDLETALAMARKER );
	    }
	}
	else if( laghu == GATI_MISRA ) {
	    // misra triputa
	    // 7 + 2+ 2
	    // khanda triputa: 5 + 2 + 2
	    if( gati == GATI_TISRA ) {
		// 11*3 = 33 => one row only
		nl.addRow( new Array(  { span: 1, nAksharas: 7, gati: gati },
			      { span: 1, nAksharas: 2, gati: gati },
			      { span: 1, nAksharas: 2, gati: gati } ), 
			  new Duration(t.aksharaCount(),1) );
	    }
	    else if( gati == GATI_CATUSRA ) {
		// 7*4 + 2*4 +2*4 = 28 + 8 + 8 = 44
		if( layoutSpec && layoutSpec.fName && 
			 (layoutSpec.fName.toLowerCase() == "varnam" 
			 || layoutSpec.fName.toLowerCase() == "gitam" )) {
		    // 2 cycles
		    var newWay = true;
		    var ar = new Array();
		    var i;

		    if( newWay ) {
			for(i = 0; i < 11; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addGuideRow(ar, new Duration(11,1));

			ar = new Array();
			for(i = 0; i < 11; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addRow( ar, new Duration(11,1) );
		    }
		    else {
			// (1+1 + 1+1+1+1+1) 1+1	9
			// (1+1)+(1+1+1+1+1  1+1)	9
			// (1+1)+(1+1)		4
			for(i = 0; i < 9; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addGuideRow(ar, new Duration(9,1));

			ar = new Array();
			for(i = 0; i < 9; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addRow( ar, new Duration(9,1) );

			ar = new Array();
			for(i = 0; i < 9; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addRow( ar, new Duration(9,1) );

			ar = new Array();
			for(i = 0; i < 4; i++ )
			    ar[i] = { span:1, nAksharas: 1, gati: gati };
			nl.addRow( ar, new Duration(4,1) );
		    }

		    // redefine tala;
		    t.addPart(0, gati, ENDTALAMARKER );
		    for(i = 1; i <= 6; i++ )
			t.addPart(i, gati, EMPTYTALAMARKER );
		    t.addPart(7, gati, MIDDLETALAMARKER );
		    t.addPart(8, gati, EMPTYTALAMARKER );
		    t.addPart(9, gati, MIDDLETALAMARKER );
		    t.addPart(10, gati, EMPTYTALAMARKER );
		}
		else {
		    // 2 rows
		    //
		    // 36
		    // 8
		    // 
		    // (2 + 5) + 2 		(7, span:2), (2, span:1)
		    //  2			(2, span:1)
		    nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
					      { span: 1, nAksharas: 5, gati: gati },
					      { span: 1, nAksharas: 2, gati: gati }), new Duration(9,1) );
		    nl.addRow( new Array(  { span: 2, nAksharas: 7, gati: gati },
					   { span: 1, nAksharas: 2, gati: gati } ), new Duration(9,1) );
		    nl.addRow( new Array( { span: 1, nAksharas: 2, gati: gati } ), new Duration(2,1) );
		}
	    }
	    else if( gati == GATI_KHANDA ) {
		// 7*5 + 2*5 + 2*5 = 35 + 10 + 10 = 55;
		// 2 rows:
		// 35
		// 20
		//
		// (2 + 2 + 3)		(7, span:3)
		//  2 + 2		(2, span:1), (2, span:1)
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 3, gati: gati }), new Duration(7,1) );
		nl.addRow( new Array( { span: 3, nAksharas: 7, gati: gati } ), new Duration(7,1) );
		nl.addRow( new Array( { span: 1, nAksharas: 2, gati: gati },
			      	      { span: 1, nAksharas: 2, gati: gati } ), new Duration(4,1) );
	    }
	    else if( gati == GATI_MISRA ) {
		// 7*7 + 2*7 + 2*7 = 49 + 14 + 14 = 77
		// 3 rows:
		// 35	(2+2+1)	(5, span:3)
		// 28	2+2	(2, span:1), (2, span:1)
		// 14   2	(2, span:1)
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 1, gati: gati }), new Duration(5,1) );
		nl.addRow( new Array( { span: 1, nAksharas: 5, gati: gati } ), new Duration(5,1) );
		nl.addRow( new Array( { span: 1, nAksharas: 2, gati: gati },
			      	      { span: 1, nAksharas: 2, gati: gati } ), new Duration(4,1) );
		nl.addRow( new Array( { span: 1, nAksharas: 2, gati: gati } ), new Duration(2,1) );

		// since this layout involved the laghu to be split, we will
		// assign tala parts accordingly
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(5, gati, EMPTYTALAMARKER );	// the split: note tala marker is empty
		t.addPart(7, gati, MIDDLETALAMARKER );
		t.addPart(9, gati, MIDDLETALAMARKER );
	    }
	    else {
		// 7*9 + 2*9 + 2*9 = 63 + 18 + 18 = 99
		// 
		// 3 rows:
		// 36	(2+1+1)		(4, span:3)
		// 27   (2+1)		(3, span:2)
		// 36	 2+(1+1)	(2, span:1), (2, span:2)
		// 
		nl.addGuideRow(new Array( { span: 1, nAksharas: 2, gati: gati },
			         	  { span: 1, nAksharas: 1, gati: gati },
			         	  { span: 1, nAksharas: 1, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array({ span: 3, nAksharas: 4, gati: gati }), new Duration(4,1) );
		nl.addRow( new Array({ span: 2, nAksharas: 3, gati: gati }), new Duration(3,1) );
		nl.addRow( new Array({ span: 1, nAksharas: 2, gati: gati },
			      	     { span: 2, nAksharas: 2, gati: gati }), new Duration(4,1) );

		// since this layout involved the laghu to be split, we will
		// assign tala parts accordingly
		t.addPart(0, gati, ENDTALAMARKER );
		t.addPart(4, gati, EMPTYTALAMARKER );	// the split: note tala marker is empty
		t.addPart(4, gati, MIDDLETALAMARKER );
		t.addPart(9, gati, MIDDLETALAMARKER );
	    }
	}

	// if the layout didnt define the tala (it may split parts to suit layout)
	// - we define it the normal way
	if( t.getPartCount() == 0 ) 
	{
	    t.addPart(0, gati, ENDTALAMARKER );
	    t.addPart(laghuAkshara, gati, MIDDLETALAMARKER );
	    t.addPart(laghuAkshara+2, gati, MIDDLETALAMARKER );
	}
	t.finalizeParts(nl);
	return t;
    }

    var fMap = new Array();


    /**
     * maximum speed of swaras we want to accomodate - this number is multiplied
     * by gati to determine max # of swaras in an akshara
     * @type int
     * @private
     */
    this.fMaxSpeedFactor = 4;	// 4 => triple speed
}
var PredefinedTalas = new PredefinedTalasDefn();


/**
 * @class
 * text alignment constants
 */
function ALIGNMENT() {
}

/**
 * validate an alignment value
 * @param {String}	alignment
 * @return true or false indicating if passed in alignment is valid or not
 * @type boolean
 */
ALIGNMENT.prototype.isValidAlignment = function(align) {
    if( align != this.LEFT && align != this.RIGHT && align != this.CENTER ) return false;
    return true;
}

/**
 * left alignment
 * @final
 * @type String
 */
ALIGNMENT.prototype.LEFT = "left";

/**
 * right alignment
 * @final
 * @type String
 */
ALIGNMENT.prototype.RIGHT = "right";

/**
 * center alignment
 * @final
 * @type String
 */
ALIGNMENT.prototype.CENTER = "center";

var ALIGN_LEFT  = ALIGNMENT.prototype.LEFT;
var ALIGN_RIGHT = ALIGNMENT.prototype.RIGHT;
var ALIGN_CENTER = ALIGNMENT.prototype.CENTER;

/**
 * @class
 * a song break
 */
function SongBreak()
{
     /**
      * override of {@link SongPart#toXML}
      */
     this.toXML = function() {
	return XMLUtils.createXMLNode(this.XMLTagName());
     }

}
SongBreak.prototype = new SongPart(PART_BREAK);

/**
 * override of {@link SongPart#XMLTagName}
 */
SongBreak.prototype.XMLTagName = function() { return "songbreak"; }


/**
 * override of {@link SongPart#fromXML}
 */
SongBreak.prototype.fromXML = function(xml) {
    if( !XMLUtils.isXMLNode(xml, SongBreak.prototype.XMLTagName())) 
    	return new FromXMLResult( null, "not a break" );
    return new FromXMLResult( new SongBreak() );
}

/**
 * @class
 * controls page title (used in printing only has no visible effect)
 */
function Title(txt)
{
    /**
     * get the language translator for title
     */
    this.getTranslator = function() { return this.fTranslator; }

    /**
     * set the language translator for title
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * get the text of the title
     * @return the text of the title
     * @type String
     */
    this.getText = function() { return this.fText; }

    /**
     * text of the heading
     * @type String
     */
    this.fText     = txt;

    /**
     * text of the heading
     * @type String
     */
    this.fText     = txt;

     /**
      * override of {@link SongPart#toXML}
      */
     this.toXML = function() {
	var x =  XMLUtils.createXMLNode(this.XMLTagName());
	x.setAttribute("text", this.fText );
	return x;
     }

}
Title.prototype = new SongPart(PART_TITLE);

/**
 * override of {@link SongPart#XMLTagName}
 */
Title.prototype.XMLTagName = function() { return "title"; }


/**
 * override of {@link SongPart#fromXML}
 */
Title.prototype.fromXML = function(xml) {
    var reason = null;
    var text = null;
    if( !XMLUtils.isXMLNode(xml, Title.prototype.XMLTagName())) 
	reason = "not a heading";
    else {
	text = xml.getAttribute("text").replace( /\\/g, "" );
	if( text== null )
	    reason = "text attribute not set for title";
    }
    if( reason != null ) return new FromXMLResult(null,reason);
    var t = new Title(text);
    return new FromXMLResult( t );
}

/**
 * @class
 * a line break with manual tala that is like a SongBreak except does not reset tala cycle
 */
function LineBreak()
{
     /**
      * override of {@link SongPart#toXML}
      */
     this.toXML = function() {
	return XMLUtils.createXMLNode(this.XMLTagName());
     }

}
LineBreak.prototype = new SongPart(PART_LINEBREAK);

/**
 * override of {@link SongPart#XMLTagName}
 */
LineBreak.prototype.XMLTagName = function() { return "linebreak"; }


/**
 * override of {@link SongPart#fromXML}
 */
LineBreak.prototype.fromXML = function(xml) {
    if( !XMLUtils.isXMLNode(xml, LineBreak.prototype.XMLTagName())) 
    	return new FromXMLResult( null, "not a break" );
    return new FromXMLResult( new LineBreak() );
}

/**
 * @class
 * a gati switch
 */
function GatiSwitch()
{
     /**
      * override of {@link SongPart#toXML}
      */
     this.toXML = function() {
	return XMLUtils.createXMLNode(this.XMLTagName());
     }

     this.setGati = function(gati) {
	this.fGati = gati;
     }

     this.getGati = function() { return this.fGati; }

     /**
      * the gati to switch to
      * @private
      */
     this.fGati = GATI_CATUSRA;

}
GatiSwitch.prototype = new SongPart(PART_GATISWITCH);

/**
 * override of {@link SongPart#XMLTagName}
 */
GatiSwitch.prototype.XMLTagName = function() { return "gati"; }


/**
 * override of {@link SongPart#fromXML}
 */
GatiSwitch.prototype.fromXML = function(xml) {
    if( !XMLUtils.isXMLNode(xml, Gati.prototype.XMLTagName())) 
    	return new FromXMLResult( null, "not a gati switch" );
    var gatival = xml.getAttribute("to").replace( /\\/g, "" );
    if( gatival == "" ) 
    	return new FromXMLResult( null, "no gati specified" );
    var gati;
    if( gatival == "catusra" ) 
	gati = GATI_CATUSRA;
    else if( gatival == "tisra" ) 
	gati = GATI_TISRA;
    else if( gatival == "khanda" ) 
	gati = GATI_KHANDA;
    else if( gatival == "misra" ) 
	gati = GATI_MISRA;
    else if( gatival == "sankirna" ) 
	gati = GATI_SANKIRNA;
    else
	return new FromXMLResult(null, "invalid gati '" + gatival + "' specified" );
    var gs = new GatiSwitch();
    gs.setGati(gati);
    return new FromXMLResult(gs);
}

/**
 * @class 
 * represents a heading/text in the notation
 * @constructor
 * @param {String} txt		text of the heading
 * @param {String} font		font family of heading (can be empty to 
 *                              imply default)
 * @param {String} fontSize 	font size - as it would go in css style
 * @param {String} color	color of the text
 * @param {String} title	set documemnt title based on this?
 * @param {ALIGNMENT} alignment	alignment
 */
function Heading(txt, font, fontSize, alignment, color, isTitle)
{
    /**
     * get the language translator for this heading
     */
    this.getTranslator = function() { return this.fTranslator; }

    /**
     * set the language translator for this heading
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * get the text of the heading
     * @return the text of the heading
     * @type String
     */
    this.getText = function() { return this.fText; }


    /**
     * should this heading content be used to set title?
     */
    this.isTitle = function() { return this.fTitle; }

    this.setTitle = function(val) {
	this.fTitle = val;
    }

    /**
     * text of the heading
     * @type String
     */
    this.fText     = txt;

    /**
     * font family of the heading
     * @type String
     */
    this.fFont     = font;

    /**
     * text color
     * @type String
     */
    this.fColor    = color;


    /**
     * font size of the heading (as it would go in css style)
     * @type String
     */
    this.fFontSize = fontSize;

    /**
     * is font bold?
     * @type boolean
     */
    this.fBold     = false;

    /**
     * is font italic?
     * @type boolean
     */
    this.fItalic   = false;


    /**
     * should this header content be used to set title
     */
    this.fTitle = isTitle;

    /**
     * text alignment
     * @type ALIGNMENT
     */
    this.fAlignment = alignment;

     /**
      * language translator for heading if any
      * @private
      */
     this.fTranslator = null;

     /**
      * override of {@link SongPart#toXML}
      */
     this.toXML = function() {
	var x = XMLUtils.createXMLNode( "heading" );
	x.setAttribute("font", ((this.fFont) ? this.fFont : ""));
	x.setAttribute("fontsize", ((this.fFontSize) ? this.fFontSize : ""));
	x.setAttribute("title", this.fTitle );
	x.setAttribute("bold", this.fBold );
	x.setAttribute("italic", this.fItalic );
	x.setAttribute("text", this.fText );
	x.setAttribute("align", ((this.fAlignment) ? this.fAlignment : ""));
	x.setAttribute("color", ((this.fColor) ? this.fColor : ""));
	return x;
     }

}
Heading.prototype = new SongPart(PART_HEADING);

/**
 * override of {@link SongPart#XMLTagName}
 */
Heading.prototype.XMLTagName = function() { return "heading"; }

/**
 * override of {@link SongPart#fromXML}
 */
Heading.prototype.fromXML = function(xml) {
    var reason = null;
    var text = null;
    var align = null;
    if( !XMLUtils.isXMLNode(xml, Heading.prototype.XMLTagName() )) 
	reason = "not a heading";
    else  {
	text = xml.getAttribute("text").replace( /\\/g, "" );
	align = xml.getAttribute("align");
	if( text== null )
	    reason = "text attribute not set for heading";
	else if( !ALIGNMENT.prototype.isValidAlignment(align)) 
	    reason = "not a valid alignment for heading";
    }
    if( reason != null ) return new FromXMLResult(null,reason);
    var h = new Heading(text, xml.getAttribute("font"), xml.getAttribute("fontsize"), align);
    if( xml.getAttribute("bold") == "true" ) h.fBold = true;
    if( xml.getAttribute("italic") == "true" ) h.fItalic = true;
    if( xml.getAttribute("title") == "true" ) h.fTitle = true;
    return new FromXMLResult(h);
}


/**
 * creates a title heading
 * @return a heading object which is a title
 * @type Heading
 */
function HeadingTitle(txt) 
{
    var h = new Heading(txt, "", 18, ALIGN_CENTER );
    h.fBold = true;
    h.setTitle(true);
    return h;
}

/**
 * @class
 * represent base class for all song block parts
 * @constructor
 * @param {BLOCKPART_TYPE} partType the song block part type
 */
function SongBlockPart(partType) 
{
     /**
      * song part type - derived classes should set this
      * @type BLOCKPART_TYPE
      */
     this.fPartType      = partType;

     /**
      * serialize contents to xml - derived classes should override this
      */
     this.toXML = function() {
	return null;
     }

     /**
      * create a new node from an xml node (created presumably using 
      * {@link SongBlockPart#toXML}
      * @param {XMLNode} xml
      * @return a {@link FromXMLResult} object, with song block part as result
      * @type FromXMLResult
      */
    this.fromXML = function(xml) {
	return new FromXMLResult(null, "internal error: SongBlockPart.fromXML not overridden" );
    }

    /**
     * does this part follow a page break 
     * (meaningful only for headings and for swaras (that start a row)
     */
    this.followsPageBreak = function() {
	return this.fFollowsPageBreak;
    }

    /**
     * set/unset the flag that indicates that part follows a page break 
     * (meaningful only for headings and for swaras (that start a row)
     */
    this.setFollowsPageBreak = function(val) {
	this.fFollowsPageBreak = val;
    }

     /**
      * set/unset the flag that indicates that part follows a page break 
      * (meaningful only for headings and for swaras (that start a row)
      * @type Boolean
      * @private
      */
    this.fFollowsPageBreak = false;
}

/**
 * @class
 * represent state of gamaka as to whether it is locatable or not
 */
function GamakaState()
{
}
/**
 * gamaka is locatable
 */
GamakaState.prototype.INSTALLED_YES 	   = 1;
/**
 * gamaka is not locatable
 */
GamakaState.prototype.INSTALLED_NO  	   = 0;
/**
 * Not known whether gamaka is locatable or not 
 */
GamakaState.prototype.INSTALLED_DONTKNOW  = -1;

GamakaStates = new GamakaState();

/**
 * @class
 * represents a gamaka type
 */
function GamakaType()
{
}
/**
 * gamaka is an image
 */
GamakaType.prototype.IMAGE 	   = 1;
/**
 * gamaka is a text
 */
GamakaType.prototype.TEXT  	   = 2;

GamakaType.prototype.VERTICALCOMPOSITE      = 3;

GamakaType.prototype.EMPTY      = 4;

GamakaTypes = new GamakaType();

/**
 * @class
 * represents a baseclass for all gamakas
 * @constructor
 * @param {GamakaType} typ gamaka type
 */
function Gamaka(typ)
{
    /**
     * get the type of the gamaka
     * @type GamakaType
     */
    this.getType = function() { return this.fType; }

    /**
     * get the name of the gamaka
     * @type String
     */
    this.getName = function() { return this.fName; }

    /**
     * get the short name of the gamaka
     * @type String
     */
    this.getShortName = function() { return this.fShortName; }

    /**
     * get the height of the gamaka (pixels)
     * @type int
     */
    this.getHeight = function() { return this.fHeight; }

    /**
     * get the width of the gamaka (pixels)
     * @type int
     */
    this.getWidth = function() { return this.fWidth; }

    /**
     * set the name of the gamaka
     * @param {String}   name name of gamaka
     */
    this.setName = function(nm) { this.fName = nm; }

    /**
     * set the short name of the gamaka
     * @param {String} nm short name of gamaka
     */
    this.setShortName = function(nm) { this.fShortName = nm; }

    /**
     * get the gamaka state
     * @type GamakaState
     */
    this.getState = function() { return this.fState; }

    /**
     * set the gamaka state
     * @param {GamakaState} state the gamaka state
     * @param {int}	    height (optional) height of gamaka, required
     *				   if state is GamakaStates.INSTALLED_YES
     * @param {int}	    width (optional) width of gamaka, required
     *				   if state is GamakaStates.INSTALLED_YES
     * @return true or false indicating if gamaka state was set
     * @type boolean
     */
    this.setState = function(state, ht, wdth) { 
	if( state == GamakaStates.INSTALLED_YES && !ht ) return false;
	this.fState = state; 
	if( state == GamakaStates.INSTALLED_YES ) {
	    this.fHeight = ht;
	    this.fWidth  = wdth;
	}
	else
	{
	    this.fHeight = 0;
        }
    }
    
    /**
     * type of the gamaka
     * @type String
     * @private
     */
    this.fType = typ;

    /**
     * name of the gamaka
     * @type String
     * @private
     */
    this.fName = "";

    /**
     * short name of the gamaka
     * @type String
     * @private
     */
    this.fShortName = "";

    /**
     * represents if the gamaka is locatable or not
     * @type GamakaState
     * @private
     */
    this.fState = GamakaStates.INSTALLED_DONTKNOW;

    /**
     * height of gamaka
     */
    this.fHeight = 0;
    /**
     * width of gamaka
     */
    this.fWidth  = 0;

    /**
     * render the gamaka and return the dom element for it - derived
     * classes must override this
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(container) {
	var d = document.createElement("div");
	d.appendChild(document.createTextNode('???'));
	return d;
    }

    this.canAdjustForOctave = function() {
    	return false;
    }

    /* shift up/down if octave */
    this.adjustForOctave = function(octave) {
    	// unimplemented
    }
}

/**
 * @class
 * Represents a swara/note in notation, and is part of a {@link SongBlockNotation}
 *
 * @constructor
 * @param {String}  label	label of swara
 * @param {boolean} pauseOrEmpty	is this a pause or empty/blank
 * @param {int}     octave	octave indicator (0: madya, -1: manndra, 
 *                              1: tara) - used only if not pause
 * @param {int}	    len 	# of units of duration this swara take
 * @param {int}     speed	indicates whether unit of duration is first 
 *                              speed (0), second speed (1) or third speed (2)
 * @param {float}   time_index	optional, if specified time index of this
 *				swara in audio file - it is the # of seconds
 *				from start of file.
 */
function Swara( label, pauseOrEmpty, octave, len, speed, time_index )
{
    this.hasTimeIndices = function() { return (this.fTimeIndices != null); }
    this.getTimeIndices = function() { return this.fTimeIndices; }
    this.addTimeIndex = function(val) 
    { 
	if( this.fTimeIndices == null )
	    this.fTimeIndices = new Array();
	this.fTimeIndices[this.fTimeIndices.length] = val;
	return true; 
    }

    /**
     * get the notation to which this swara belongs to
     * @type SongBlockNotation
     */
    this.getNotation = function() { return this.parent; }

    /**
     * get the block to which this swara belongs to
     * @type SongBlock
     */
    this.getBlock = function() 
    { 
	var n = this.getNotation();
	if( n ) return n.getBlock();
	return null;
    }

    /**
     * get the language translator for this swara
     */
    this.getTranslator = function() 
    { 
	/* if there is one for this swara use it, else use block's */
    	if(this.fTranslator != null) return this.fTranslator; 
	else return this.getBlock().getTranslator();
    }

    /**
     * get the font to apply for this swara
     */
    this.getDefaultFont = function() 
    { 
	/* use block's */
	return this.getBlock().getDefaultFont();
    }

    /**
     * get the font sizes of the swara
     */
    this.getDefaultFontSize = function()
    {
	/* use block's */
	return this.getBlock().getDefaultSwaraFontSize();
    }

    /**
     * get the font color of the swara
     */
    this.getDefaultFontColor = function()
    {
	/* use block's */
	return this.getBlock().getDefaultSwaraFontColor();
    }

    /**
     * set the language translator for this swara 
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * validate speed
     * @param  {int} speed  the speed to be validated
     * @return true or false indicating if speed is valid
     * @type boolean
     */
    this.isValidSpeed = function(speed) {
	if( speed >= 0 && speed <= 3 ) return true;
	return false;
    }

    /**
     * validate octave
     * @param  {int} octave  the octave to be validated
     * @return true or false indicating if octave is valid
     * @type boolean
     */
    this.isValidOctave = function(octave) {
	if( octave >= -1 || octave <= 1 ) return true;
	return false;
    }

    /**
     * get the label
     * @return the label of the swara
     * @type String
     */
    this.getLabel = function() { if( this.fEmpty) return ""; else return this.fLabel; }

    /**
     * set the label
     * @param {String} l new label
     * @return true or false as to whether label was set successfully
     * @type boolean
     */
    this.setLabel = function(l) 
    {
	this.fLabel = l;   
	this.fEmpty = ( l == "_" || l == "__" );
	return true; 
    }


    /**
     * get the text of the swara (same as label)
     * @return the text/label of the swara
     * @type String
     */
    this.getText = function() { return this.fLabel; }

    /**
     * get the length (# of units each of duration as implied by getSpeed)
     * @return the length
     * @type int
     */
    this.getLength = function() { return this.fLen; }

    /**
     * set the length (# of units each of duration as implied by getSpeed)
     * @param {int} l new length
     * @return true or false as to whether length was set successfully
     * @type boolean
     */
    this.setLength = function(l) { 
	var val = parseInt(l);
    	if(val <= 0 ) return false;
	this.fLen= val; return true; 
    }

    /**
     * get the speed of each duration of unit in length (as returned by 
     * getLength) 
     *
     * @return the speed, 0 implying one whole akshara, 1 implying 1/nth of an
     *         akshara, 2 implies 1/(2*n) of an akshara
     * @type int
     */
    this.getSpeed = function() { return this.fSpeed; }

    /**
     * set the speed of each duration of unit in length (as returned by 
     * getLength) 
     *
     * @param {int} s new speed - 0 implying one whole akshara, 1 implying 
     *                1/nth of an akshara, 2 implies 1/(2*n) of an akshara
     * @return true or false as to whether speed was set successfully
     * @type boolean
     */
    this.setSpeed = function(s) { 
    	if( !this.isValidSpeed(s) ) return false;
	this.fSpeed = s; return true; 
    }

    /**
     * get the octave/stayi of the swara
     *
     * @return the octave, 0 implying middle/madya, 1 implying high/tara and 
     *         -1 implying low/mandra
     * @type int
     */
    this.getOctave = function() { return this.fOctave; }

    /**
     * set the octave/stayi of the swara
     *
     * @param {int} o the new octave - 0 implying middle/madya, 1 implying 
     *              high/tara and -1 implying low/mandra
     * @return true or false as to whether octave was set successfully
     * @type boolean
     */
    this.setOctave = function(o) { 
    	if( !this.isValidOctave(o) ) return false;
	this.fOctave = o; return true; 
    }

    /**
     * is this swara/note is a pause/rest/empty
     * @return whether the swara is a pause/rest
     * @type boolean
     */
    this.isPauseOrEmpty = function() { return this.fPauseOrEmpty; }


    /**
     * is this swara/note is an empty (spacer) swara?
     * @return whether the swara is empty (spacer) or not
     * @type boolean
     */
    this.isEmpty = function() { return this.fEmpty; }

    this.isRepeater = function() { return this.fRepeater; }

    /**
     * set the gamaka (img) for this swara
     * @param {Gamaka} gamaka new gamaka (null => no gamaka)
     * @return true or false as to whether the gamaka was set successfully
     */
    this.setGamaka = function(gamaka) { 
	this.fGamaka = gamaka; 
	return true;
    }
    /**

     * get the gamaka (img) for this swara
     * @return the gamaka for this swara (null => no gamaka)
     * @type Gamaka
     */
    this.getGamaka = function(gamaka) { return this.fGamaka; }

    /**
     * get the duration of the swara (in fractional units of aksharas), which 
     * depends on speed, length and gati
     *
     * @param {GATI} gati	the gati to use for the swara
     *
     * @return a {@link Duration} object representing the duration of swara
     * @type Duration
     */
    this.duration = function(gati) {
    	var denom = 1;
	var speed = this.fSpeed;
	if( speed > 0 ) {
	    // 1/2^speed*gati
	    var factor = 1;
	    var i;
	    for(i = 1; i < speed; i++ )  
		factor *= 2;
	    denom = factor*gati;
	}
	return new Duration(this.fLen, denom);
    }

     /**
      * serialize contents to xml
      */
     this.toXML = function() {
	var x = XMLUtils.createXMLNode("s");
	x.setAttribute("label", this.fLabel );
	if( this.fPauseOrEmpty )
	    x.setAttribute("pause", this.fPauseOrEmpty );
	else {
	    x.setAttribute("octave", this.fOctave );
	    if( this.fGamaka ) 
		x.setAttribute("gamaka", this.fGamaka.getName() );
	}
	x.setAttribute("speed", this.fSpeed );
	x.setAttribute("len", this.fLen );
	return x;
     }

    /**
     * override of {@link SongBlockPart#fromXML}
     */
    this.fromXML = function(xml) {
	// validate
	var reason = null;
	if( !XMLUtils.isXMLNode(xml, "s" )) 
	    reason = "not a swara node";
	var label = xml.getAttribute("label");
	var len   = xml.getAttribute("len");
	var speed = xml.getAttribute("speed");
	if( !label || !len || !speed )
	    reason = "label/length/speed missing for swara node";
	else if( !this.isValidSpeed(speed) ) 
	    reason = "invalid/missing speed for swara node";

	var ilen = 1;
	if( reason == null ) {
	    ilen = parseInt(len);
	    if( ilen <= 0 ) reason = "invalid length for swara";
	}
	if( reason != null )
	    return new FromXMLResult(null, reason);

	var isPauseOrEmpty = false;
	if( xml.getAttribute("pause") == "true" ) isPauseOrEmpty = true;
	var s = null;
	if( !isPauseOrEmpty ) {
	    var octave = xml.getAttribute("octave");
	    if( !this.isValidOctave(octave) )
		return new FromXMLResult(null, "invalid/missing octave for swara");
	    s =  new Swara( label, false,  octave, ilen, speed );
	}
	else
	    s =  new Swara( label, true,  0, ilen, speed );
	return new FromXMLResult(s,null);
    }

    /**
     * the label
     * @type String
     * @private
     */
    this.fLabel  = label;

    if( !this.isValidSpeed(speed) )
    	speed = 0;
    /**
     * the speed
     * @type int
     * @private
     */
    this.fSpeed  = speed;

    if( !this.isValidOctave(octave) ) 
    	octave  = 0;
    /**
     * the octave
     * @type int
     * @private
     */
    this.fOctave = octave;

    //if( !len || len <= 0 )
	//len = 1;
    	
    /**
     * the length
     * @type int
     * @private
     */
    this.fLen = len;

    /**
     * the gamaka - by default none
     * @type Gamaka
     * @private
     */
    this.fGamaka = null;

    /**
     * is this a pause/rest/empty
     * @type boolean
     * @private
     */
    this.fPauseOrEmpty = pauseOrEmpty;

    /**
     * is this an empty swara?
     * @type boolean
     * @private
     */
    this.fEmpty = ( label == "" || label.charAt(0) == '_' );
    this.fRepeat = (label.charAt(0) == '=');

    this.fTimeIndices = null;
}

Swara.prototype = new SongBlockPart(BLOCKPART_SWARA);


/**
 * @class represents a lyric 
 * Represents a lyric in a notation {@link SongBlockNotation}
 * @constructor
 * @param {String}  	  text		text of the lyric
 * @param {LyricLineDesc} lyrLineDesc	the lyric line to which this lyric
 *					belongs to
 */
function Lyric( text, lyrLineDesc ) 
{
    this.hasTimeIndices = function() { return (this.fTimeIndices != null); }
    this.getTimeIndices = function() { return this.fTimeIndices; }
    this.addTimeIndex = function(val) 
    { 
	if( this.fTimeIndices == null )
	    this.fTimeIndices = new Array();
	this.fTimeIndices[this.fTimeIndices.length] = val;
	return true; 
    }

    /**
     * get the language translator for this lyric
     */
    this.getTranslator = function() 
    { 
	/* if we have one for this lyric, use it, else use block's */
    	if(this.fTranslator != null) return this.fTranslator; 
	else  { return this.getBlock().getTranslator(); }
    }

    /**
     * set the language translator for this lyric
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * get the font to apply for this lyric
     */
    this.getDefaultFont = function() 
    { 
	/* use block's */
	return this.getBlock().getDefaultFont();
    }

    /**
     * get the font sizes of the lyric
     */
    this.getDefaultFontSize = function()
    {
	/* use block's */
	return this.getBlock().getDefaultLyricFontSize();
    }

    /**
     * get the font color of the lyric
     */
    this.getDefaultFontColor = function()
    {
	/* use block's */
	return this.getBlock().getDefaultLyricFontColor();
    }

    /**
     * get the (translated) text of the lyric
     * @return the text of the lyric
     * @type String
     */
    this.getText = function() { 
	return this.fLineDesc.getTranslator().translate(this.fText);
    }

    /**
     * get the raw (untranslated) text of the lyric
     * @return the text of the lyric
     * @type String
     */
    this.getRawText = function() { return this.fText; }

    /**
     * set the text of the lyric
     * @param {String} t	new text
     * @return true or false as to whether text was successfully set or not
     * @type boolean
     */
    this.setText = function(t) { this.fText = t; }

    /**
     * get the notation to which this lyric belongs to
     * @type SongBlockNotation
     */
    this.getNotation = function() { return this.parent; }

    /**
     * get the block to which this swara belongs to
     * @type SongBlock
     */
    this.getBlock = function() 
    { 
	var n = this.getNotation();
	if( n ) return n.getBlock();
	return null;
    }

    /**
     * get the lyric line description for the lyric line to which this lyric
     * belongs to
     * @type LyricLineDesc
     */
    this.getLyricLine = function() { return this.fLineDesc; }

    /**
     * set the lyric line description for the lyric line to which this lyric
     * belongs to
     * @type LyricLineDesc
     */
    this.setLyricLine = function(line) { this.fLineDesc = line; }

     /**
      * serialize contents to xml
      */
     this.toXML = function() {
	var x = XMLUtils.createXMLNode("l");
	x.setAttribute("label", this.fText );
	return x;
     }

    /**
     * override of {@link SongBlockPart#fromXML}
     */
    this.fromXML = function(xml) {
	// validate
	var reason = null;
	var label = null;
	if( !XMLUtils.isXMLNode(xml, "l" )) reason = "not a lyric node";
	else  {
	    label = xml.getAttribute("label").replace( /\\/g, "");
	    if( label == null )  reason = "no label for lyric";
	}
	if( reason != null ) return new FromXMLResult(null, reason);
	return new FromXMLResult(new Lyric( label ), null);
    }

    if( !lyrLineDesc ) lyrLineDesc = null;
    /**
     * get the lyric line description for the lyric line to which this lyric belongs to
     * @type LyricLineDesc
     * @private
     */
    this.fLineDesc = lyrLineDesc;

    /**
     * the text of the lyric
     * @type String
     * @private
     */
    this.fText  = text;

    this.fTimeIndices = null;
}
Lyric.prototype = new SongBlockPart(BLOCKPART_LYRIC);

/**
 * @class represents a notation that is part of a block - the
 * notation consists of a swara and zero or more lyrics
 * @constructor
 * @param swara		the swara for this notation
 */
function SongBlockNotation(swara) 
{
    /**
     * get the block to which this swara belongs to
     * @type SongBlock
     */
    this.getBlock = function() { return this.parent; }

    /**
     * get the swara associated with the notation
     * @type Swara
     */
    this.swara = function() { return this.fSwara; }

    /**
     * get the lyrics associated with the notation (if any)
     * lyric lines for the swara. 
     * @type Lyrics[] 
     */
    this.lyrics = function() { return this.fLyrics; }

    /**
     * does the notation have lyrics?
     * @type boolean
     */
    this.hasLyrics = function() {
	if( this.fLyrics.length > 0 ) return true;
	else return false;
    }

    /**
     * add a lyric to the notation
     * @param {Lyric} lyr	lyric to be added
     */
    this.addLyric = function(lyr) {
	this.fLyrics[this.fLyrics.length] = lyr;
	lyr.parent = this;
	return true;
    }

    /**
     * the swara associated with the notation
     * @type Swara
     * @private
     */
     this.fSwara = swara;
     swara.parent = this;

     /**
      * all the lyrics associated with the notation. It is an array
      * of LyricLines
      * @private
      * @type Lyrics[]
      */
      this.fLyrics = new Array();
}


/**
 * @class represents interface for a translator of lyrics - the default is
 * to do no translation
 */
function LyricTranslator() 
{
    /**
     * translate a text
     * @param {String} txt	text
     */
    this.translate = function(txt) {
	return txt;	// no translation by default
    }
}


/**
 * @class
 * basic information about a lyric line
 */
function LyricLineDesc(translator) 
{
    /**
     * get the translator for this line
     */
    this.getTranslator = function() { return this.fTranslator; }

    /**
     * the translator for this lyric line
     * @type LyricTranslator
     * @private
     */
    this.fTranslator = translator;
}


/**
 * @class represents a song block, which contains which contains a list of 
 * {@link SongBlockNotation}s
 * <p>
 * A song block consists of a list of notations {@link SongBlockNotation},
 * each of which has a swara {@link Swara} and zero or more {@link Lyric}s.
 * Each lyrics associated with the swara for a notation is associated with
 * a {@link LyricLineDesc}, and the list of lyric lines are also maintained
 * in the block
 */
function SongBlock() 
{
    /**
     * get the language translator for notations in this block (if any)
     */
    this.getTranslator = function() { return this.fTranslator; }

    /**
     * set the language translator for notations in this block
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * get the font name (if any) to use for notations in this block, and default font to use
     * for lyrics
     */
    this.getDefaultFont = function() { return this.fDefaultFont; }

    /**
     * set the name of the font (if any) to use for notations in this block, and default font to use
     * for lyrics
     */
    this.setDefaultFont = function(font) { 
	if( font ) this.fDefaultFont  = font;
    }

    /**
     * get the font size (if any) to use for swaras in this block
     */
    this.getDefaultSwaraFontSize = function() { return this.fDefaultSwaraFontSize; }

    /**
     * set the font size (if any) to use for notations in this block
     */
    this.setDefaultSwaraFontSize = function(fontsize) { 
	if( fontsize ) this.fDefaultSwaraFontSize  = fontsize;
    }

    /**
     * get the font size (if any) to use for lyrics in this block
     */
    this.getDefaultLyricFontSize = function() { return this.fDefaultLyricFontSize; }

    /**
     * set the font size (if any) to use for lyrics in this block
     */
    this.setDefaultLyricFontSize = function(fontsize) { 
	if( fontsize ) this.fDefaultLyricFontSize  = fontsize;
    }

    /**
     * get the font color (if any) to use for swaras in this block
     */
    this.getDefaultSwaraFontColor = function() { return this.fDefaultSwaraFontColor; }

    /**
     * set the font color (if any) to use for notations in this block
     */
    this.setDefaultSwaraFontColor = function(fontColor) { 
	if( fontColor ) this.fDefaultSwaraFontColor  = fontColor;
    }

    /**
     * get the font color (if any) to use for lyrics in this block
     */
    this.getDefaultLyricFontColor = function() { return this.fDefaultLyricFontColor; }

    /**
     * set the font color (if any) to use for lyrics in this block
     */
    this.setDefaultLyricFontColor = function(fontColor) { 
	if( fontColor ) this.fDefaultLyricFontColor  = fontColor;
    }

    /**
     * set the language translator for notations in this block
     */
    this.setTranslator = function(translator) { this.fTranslator = translator; }

    /**
     * get the song to which this block belongs to
     */
    this.getSong = function() { return this.parent; }

    /**
     * set the heading (makes sense only if block starts tala cycle)
     */
    this.setHeading   = function(val) { this.fHeading = val; }

    /**
     * get the heading
     */
    this.getHeading = function() { return this.fHeading; }

    /**
     * get the first notation in the block
     * @type SongBlockNotation
     */
    this.firstNotation = function() { return this.fFirstNotation; }

    /**
     * get the first swara in the block
     * @type SongBlockNotation
     */
    this.firstSwara = function() { 
	if( this.fFirstNotation ) return this.fFirstNotation.swara();
	return null;
    }

    /**
     * does the block have lyrics?
     * @type boolean
     */
    this.hasLyrics = function() {
	if( this.fLyricLines.length > 0 ) return true;
	else return false;
    }

    /**
     * get the # of lyric lines
     * @type int
     */
    this.lyricLineCount = function() { return this.fLyricLines.length; }


    /**
     * add notations from string
     * @param {int} speed	defaultSpeed for swaras
     * @param {String} swaras	string of space separated swaras
     * @param {String} lyrics	string of space separated lyrics
     */
    this.addNotationsFromString = function(speed, swaras, lyrics) {
	this._addNotationsFromString(speed,swaras,lyrics);
    }

    /**
     * insert a new swara into the block
     *
     * @param swara	 swara to be inserted ({@link Swara})
     * @param afterThis  insertion point ({@link Swara})
     * @return true or false indicating whether the insertion was successful
     * @type boolean
     */
    this.insertAfter = function( swara, afterThis ) {
	if( !this._isSwara(swara) ) return false;

	var insertPoint = null;
	if( afterThis != null ) {

	    if( !this._isSwara(afterThis) ) return false;

	    // validate the passed in swara for the insertion point
	    if ( !afterThis.parent ) return false;
	    insertPoint = afterThis.parent;
	    if( insertPoint.parent != this ) return false;
	}

	// create a new notation object
	var notation = this._newNotation(swara);

	if( insertPoint == null || insertPoint == this.fLastNotation ) {
	    // add at end
	    return this._addNotation(notation);
	}

	notation.parent = this;
	notation.prev   = insertPoint;
	notation.next   = insertPoint.next;
	if( insertPoint.next ) insertPoint.next.prev = notation;
	insertPoint.next = notation;
	this._chainSwaras(notation);
	this._chainLyrics(notation); // now chain up all the lyrics to the last notation
	return true;
    }

    /**
     * add swaras/lyrics from a string
     *
     * @param (int) speed	starting speed of swaras
     * @param (String) swaras	swaras
     * @param (String) lyrics	lyrics
     * @private
     */
    this._addNotationsFromString = function(speed, swaras, lyrics) {
	/*
	 * if we have lyrics, and we dont have a lyric-line, create a single lyric line 
	 * with default (i.e. no-op) translator
	 */
	if( lyrics != null && this.fLyricLines.length == 0 )
	    this.addLyricLine(new LyricLineDesc(new LyricTranslator()));

	/*
	 * first parse swaras and add SongBlockNotation(s) for them
	 */
	var l = swaras.length;
	var idx;
	var i = 0;
	var fNotation = null;	// first notation we add
	for( i = 0; i < l; ) {
	    idx = swaras.indexOf(' ', i );
	    if( idx < 0 ) {
		idx = l;
	    }
	    var label = swaras.substring(i, idx);
	    var stayiMarker = -1;
	    var taraStayiMarker = label.indexOf("'");
	    var mandraStayiMarker = label.indexOf("`");
	    stayiMarker = taraStayiMarker;
	    if( mandraStayiMarker >= 0 && (taraStayiMarker < 0 || mandraStayiMarker < taraStayiMarker ))
		stayiMarker = mandraStayiMarker;
	    var octave = 0;
	    if( stayiMarker >= 0 && label.length == (stayiMarker+1))
	    {
	    	// valid octav marker;
		if(stayiMarker == taraStayiMarker ) octave = 1;
		else                                octave = -1;
		label = label.substring(0,stayiMarker);
	    }

	    var isPauseOrEmpty = false;
	    if( label == "(" ) {
		speed++;
		i = idx+1;
		continue;
	    }
	    else if( label == ")" )
		speed--;
	    else
	    {
		var lspeed = speed;
		if( lspeed > 3 ) lspeed = 3;
		else if( lspeed < 0 ) lspeed = 0;

		var first_char = swaras.charAt(i);
		if( first_char == ',' || first_char == ';' || first_char == '-' || first_char == '_' )  {
		    isPauseOrEmpty = true;
		    if( lspeed == 0 && first_char == ',' ) lspeed = 1;
		    if( lspeed == 1 && first_char == ';' ) lspeed = 0;
		}

		// create a notation object (note: if lyrics were specified an
		// empty lyric will be created for this)
		var n = this._newNotation(new Swara(label,isPauseOrEmpty,octave, 1, lspeed ));
		if( this._addNotation(n) ) {
		    // note down the first notation
		    if( fNotation == null ) fNotation = n;
		}
	     }
	     i = idx+1;
	     while( i  < l ) {
		var ch = swaras.charAt(i);
		if( ch != ' ' && ch != '\t' ) break;
		i++;
	     }
	}

	if( lyrics != null && fNotation != null) {
	    /*
	     * now parse lyrics and add them
	     */
	    var l = lyrics.length;
	    var idx;
	    var n = fNotation;	// start from the first notation we added
	    for( i = 0; n != null && i < l; ) {
		// past spaces
		idx = lyrics.indexOf(' ', i );
		if( idx < 0 ) {
		    idx = l;
		}
		var label = lyrics.substring(i, idx);

		// the notation should already have an empty lyric
		// set the text of the first lyric 
		var lyr = n.lyrics()[0];
		lyr.setText(label);

		// past spaces
		i = idx+1;
		while( i  < l ) {
		    var ch = swaras.charAt(i);
		    if( ch != ' ' && ch != '\t' ) break;
		    i++;
		}

		n = n.next;	// next notation
	    }
	}
    }

    /**
     * split the block start from swara
     * @param {Swara} swara	the swara at which to split the block
     * @return the new block following split or null or error
     * @type SongBlock
     */
    this.splitBlock = function(swara) {
	if( !this._isSwara(swara) ) { return null; }

	var notation = swara.parent;
	if ( !notation || notation.parent != this ) return null;

	// cannot split a block at the beginning
	if( notation == this.fFirstNotation ) return null;

	var newSongBlock = new SongBlock();
	var nllg = this.fLyricLines.length;
	newSongBlock.fLyricLines = new Array(nllg);
	for(var i = 0; i < nllg; i++ ) {
	    // TODO: clone?
	    newSongBlock.fLyricLines[i] = this.fLyricLines[i];
	}
	var l = notation.prev;
	for( n = notation; n != null; ) {
	    var n1 = n.next;
	    if(!this.removePart(n.fSwara))  {
		alert("internal error: removePart failed");
		break;
	    }
	    newSongBlock._addNotation(n);
	    n = n1;
	}

	// insert into song
	if( this.parent ) {
	    var ret;
	    if( this.next )
		ret = this.parent.insertPart(newSongBlock, this.next);
	    else
		ret = this.parent.addPart(newSongBlock);
	}
	return newSongBlock;
    }

    /**
     * add a new swara to this block
     * @param {Swara} swara	swara to be added
     * @return the {@link SongBlockNotation} for the swara, or null on failures
     * @type SongBlockNotation
     */
    this.addSwara = function(swara) {
	if( this._isSwara(swara) )  {
	    var n = this._newNotation(swara);
	    if( this._addNotation(n) )
	    	return n;
	}
	return null;
    }

    /**
     * add a new swara to this block
     * @deprecated
     * @see #addSwara
     */
    this.addPart = function(swara) { return this.addSwara(swara); }

    /**
     * check if passed in part is a swara
     * @param part	part to be checked
     * @return true or false indicating whether the part is swara
     * @type boolean
     * @private
     */
    this._isSwara = function(part) {
    	if( !part.fPartType ) return false;
	if( part.fPartType == BLOCKPART_SWARA ) return true;
	else return false;
    }

    /**
     * check if passed in part is a lyric
     * @param part	part to be checked
     * @return true or false indicating whether the part is lyric
     * @type boolean
     * @private
     */
    this._isLyric = function(part) {
    	if( !part.fPartType ) return false;
	if( part.fPartType == BLOCKPART_LYRIC ) return true;
	else return false;
    }


    /**
     * internal routine that adds a notation
     * @param {SongBlockNotation} notation	notation to be added
     * @return true or false indicating whether notation was added
     * @type boolean
     * @private
     */
    this._addNotation = function( notation ) {
	/*
	 * add the notation in the linked list
	 */
	notation.parent =  this;
	notation.next = null;
	notation.prev = this.fLastNotation;
    	if( this.fLastNotation )
	    this.fLastNotation.next = notation;
	this.fLastNotation = notation;
	if( !this.fFirstNotation )
	    this.fFirstNotation = notation;

	this._chainSwaras(notation);
	this._chainLyrics(notation); // now chain up all the lyrics to the last notation
	return true;
    }

    /**
     * internal routine that chains up the swaras of the passed-in notation
     * to corresponding swaras of previous and next notations
     * @param {SongBlockNotation} notation	 notation
     */
    this._chainSwaras = function(notation) {
	var pswara = null, nswara = null;
	if( notation.prev ) pswara = notation.prev.swara();
	if( notation.next ) nswara = notation.next.swara();

	var swara = notation.swara();
	swara.next = nswara;
	swara.prev = pswara;

	if( pswara ) pswara.next = swara;
	if( nswara ) nswara.prev = swara;
    }

    /**
     * internal routine that unchains the swaras of the passed-in notation
     * from corresponding swaras of previous and next notations
     * @param {SongBlockNotation} notation	 notation
     */
    this._unchainSwaras = function(notation) {
	var pswara = null, nswara = null;
	if( notation.prev ) pswara = notation.prev.swara();
	if( notation.next ) nswara = notation.next.swara();

	var swara = notation.swara();
	swara.next = null;
	swara.prev = null;
	// DONT break link to notation!
	//swara.parent = null;

	if( pswara ) pswara.next = nswara;
	if( nswara ) nswara.prev = pswara;
    }

    /**
     * internal routine that chains up the lyrics of the passed-in notation
     * to corresponding lyrics of previous and next notations
     * @param {SongBlockNotation} notation	 notation
     * @param {int}		  n		 (optional), chain only the nth lyric
     */
    this._chainLyrics = function(notation, n) {
	var lyrics = notation.lyrics();
	var nLyrics = lyrics.length;
	if( nLyrics == 0 ) return;

	var plyrics = null;	// lyrics of notation before this one
	var nlyrics = null;	// lyrics of notation after this one
	var sidx, eidx;
	if( typeof(n) == "undefined" ) {
	    sidx = 0;
	    eidx = nLyrics-1;
	}
	else {
	    sidx = n;
	    eidx = n;
	}

	if( notation.prev ) plyrics = notation.prev.lyrics();
	if( notation.next ) nlyrics = notation.next.lyrics();
	for(var i = sidx; i <= eidx; i++ ) {
	    lyrics[i].next = null;
	    lyrics[i].prev = null;
	    if( plyrics ) {
		lyrics[i].prev = plyrics[i];
		plyrics[i].next = lyrics[i];
	    }
	    if( nlyrics ) {
		lyrics[i].next = nlyrics[i];
		nlyrics[i].prev = lyrics[i];
	    }
	}
    }

    /**
     * internal routine that removes (unchains) the lyrics of the passed-in notation, as 
     * when the notation is to be removed
     *
     * @param {SongBlockNotation} notation	 notation
     * @param {int}		  n		 (optional), unchain only the nth lyric
     */
    this._unchainLyrics = function(notation) {
	var lyrics = notation.lyrics();
	var nLyrics = lyrics.length;
	if( nLyrics == 0 ) return;

	var plyrics = null;	// lyrics of notation before this one
	var nlyrics = null;	// lyrics of notation after this one
	if( notation.prev ) plyrics = notation.prev.lyrics();
	if( notation.next ) nlyrics = notation.next.lyrics();

	var sidx, eidx;
	if( typeof(n) == "undefined" ) {
	    sidx = 0;
	    eidx = nLyrics-1;
	}
	else {
	    sidx = n;
	    eidx = n;
	}
	for(var i = sidx; i < eidx; i++ ) {
	    if( plyrics )
		plyrics[i].next = ((nlyrics) ? nlyrics[i] : null);
	    if( nlyrics )
		nlyrics[i].prev = ((plyrics) ? plyrics[i] : null);
	}
    }

    /**
     * insert a swara before another swara in this block
     * @param {Swara} swara		swara to be inserted
     * @param {Swara} beforeThis	the swara before which the insertion is to done.
     *					(if null, will insert at end)
     * @return true or false indicating if the insertion was successful
     */
    this.insertSwara = function( swara, beforeThis ) {
	if( beforeThis == null ) return this.addSwara(swara);	// adding at end

    	if( !this._isSwara(swara) || !this._isSwara(beforeThis)) return false;
	var beforeThis = beforeThis.getNotation(); // get the notation
	if( beforeThis.parent != this ) return false;

	// create a new notation object
	var notation = this._newNotation(swara);
	notation.parent = this;
	if( beforeThis == this.fFirstNotation ) {
	    // inserting at beginning
	    notation.next = this.fFirstNotation;
	    if( this.fFirstNotation )
		this.fFirstNotation.prev = notation;
	    this.fFirstNotation = notation;
	    this._chainSwaras(notation);
	    this._chainLyrics(notation); // now chain up all the lyrics
	    return true;
	}
	else {
	    notation.next   = beforeThis;
	    notation.prev   = beforeThis.prev;
	    if( notation.prev )
		notation.prev.next = notation;
	    beforeThis.prev = notation;
	    this._chainSwaras(notation);
	    this._chainLyrics(notation); // now chain up all the lyrics
	}
	return true;
    }

    /**
     * insert a swara before another swara in this block
     * @deprecated
     * @see #insertSwara
     */
    this.insertPart = function( swara, beforeThis ) {
	return this.insertSwara(swara, beforeThis);
    }

    /**
     * remove a swara from this block
     * @param {Swara} swara	swara to be removed
     * @return true or false indicating whether notation was removed
     * @type boolean
     */
    this.removeSwara = function(swara) {
    	if( !this._isSwara(swara) ) return false;
	if( swara.parent == null ) return false;

	var notation = swara.parent;
	if( notation.parent != this ) return false;

	this._unchainLyrics(notation);
	this._unchainSwaras(notation);

    	if( notation.prev )
	    notation.prev.next = notation.next;
	if( notation.next )
	    notation.next.prev  = notation.prev;
	if( notation == this.fLastNotation )
	    this.fLastNotation = notation.prev;
	if( notation == this.fFirstNotation )
	    this.fFirstNotation = notation.next;
	notation.parent = null;
	return true;	
    }

    /**
     * remove a swara from this block
     * @deprecated
     * @see #removeSwara
     */
    this.removePart = function( swara) { return this.removeSwara(swara); }

     /**
      * serialize contents to xml
      */
     this.toXML = function() {
	var x = XMLUtils.createXMLNode(this.XMLTagName());
	var swaras = XMLUtils.createXMLNode("swaras");
	var fNotation = this.fFirstNotation;

	var s = null;
	if( fNotation != null ) s = fNotation.swara();
	while( s != null ) {
	    swaras.appendChild( s.toXML() );
	    s = s.next;
	}
	x.appendChild(swaras);

	var lyrics = null;
	if( fNotation != null ) lyrics = fNotation.lyrics();
	if( lyrics != null ) {
	    for(var i = 0; i < lyrics.length; i++) {
		var lyrNode = XMLUtils.createXMLNode("lyrics");
		var l = lyrics[i];
		while( l != null ) {
		    lyrNode.appendChild( l.toXML() );
		    l = l.next;
		}
		x.appendChild(lyrNode);
	    }
	}
	return x;
     }

     /**
      * add a lyric line 
      * @param {LyricLineDesc} lyrLineDesc	the lyric line description
      */
     this.addLyricLine = function(lyrLineDesc) {
	if( !lyrLineDesc ) lyrLineDesc = new LyricLineDesc(new LyricTranslator());

	this.fLyricLines[this.fLyricLines.length] = lyrLineDesc;

	var lyrIdx = this.fLyricLines.length - 1;

	// add an empty lyric to all existing notations
	var n = this.fFirstNotation;
	var lastLyr = null;
	while(n != null) {
	    var lyr = new Lyric("", lyrLineDesc);
	    n.addLyric(lyr);
	    n = n.next;
	}
	var n = this.fFirstNotation;
	while(n != null) {
	    this._chainLyrics(n, lyrIdx);
	    n = n.next;
	}
     }

     /**
      * create a new notation object (with empty lyrics for existing lyric lines)
      * @param {Swara} swara	swara for the notation
      * @type SongBlockNotation
      */
    this._newNotation = function(swara) {
	var notation = new SongBlockNotation(swara);
	notation.prev = null;
	notation.next = null;
	notation.parent = null;
	var nLyrLines = this.fLyricLines.length;
	for( var i = 0; i < nLyrLines; i++ ) {
	    var lyr   = new Lyric("", this.fLyricLines[i]);
	    lyr.next  = null; 
	    lyr.prev  = null; 
	    notation.addLyric(lyr);
	}
	return notation;
    }

    /**
     * first notation in the block
     * @type SongBlockNotation
     * @private
     */
    this.fFirstNotation = null;

    /**
     * last notation in the block
     * @type SongBlockNotation
     * @private
     */
    this.fLastNotation  = null;

    /**
     * lyric lines for this block, each swara in each notation of the block
     * will have as many lyrics associated with as the number of lyric lines
     * in this array (i.e. each lyric associated with a swara has a 1-to-1
     * correspondence with a lyric line)
     *
     * @type LyricLineDesc[]
     * @private
     */
    this.fLyricLines = new Array();

    /**
     * the  heading (shown on left margin) for the block - makes sense 
     * only if block starts a tala cycle
     */
    this.fHeading = null;

    /**
     * language translator for the block if any
     * @private
     */
    this.fTranslator = null;

    /**
     * name of the font to use for notations in this block, and default font to use
     * for lyrics
     * @private
     * @type String
     */
    this.fDefaultFont = "";

    /**
     * size of the font to use for notations in this block
     * @private
     * @type String
     */
    this.fDefaultSwaraFontSize = "";

    /**
     * size of the font to use for lyrics in this block
     * @private
     * @type String
     */
    this.fDefaultLyricFontSize = "";

    /**
     * color of the font to use for notations in this block
     * @private
     * @type String
     */
    this.fDefaultSwaraFontColor = "";

    /**
     * color of the font to use for lyrics in this block
     * @private
     * @type String
     */
    this.fDefaultLyricFontColor = "";
}

SongBlock.prototype = new SongPart(PART_SONGBLOCK);
/**
 * override of {@link SongPart#XMLTagName}
 */
SongBlock.prototype.XMLTagName = function() { return "block"; }

/**
 * override of {@link SongPart#fromXML}
 */
SongBlock.prototype.fromXML = function(xml) {
    var reason = null;
    if( !XMLUtils.isXMLNode(xml, this.XMLTagName()) ) 
	return new FromXMLResult(null, "not a block node");
    var swaras = null;
    var lyrics = new Array();

    var c = xml.firstChild;
    while( c != null ) {
	if( XMLUtils.isModelNode(c) ) {
	    if( XMLUtils.isXMLNode(c, "swaras"))  {
		if( swaras == null ) swaras = c;
		else return new FromXMLResult(null, "duplicate swaras node under block");
	    }
	    else if ( XMLUtils.isXMLNode(c, "lyrics")) {
		var ch = c.firstChild;
		var hasLyrics = false;
		while(ch) {
		    if( XMLUtils.isModelNode(ch)) {
			hasLyrics = true;
			break;
		    }
		    ch = ch.nextSibling;
		}
		if(hasLyrics)
		    lyrics[lyrics.length] = c;
	    }
	    else
		return new FromXMLResult(null, "invalid node under block");
	}
	c = c.nextSibling;
    }
    if( swaras == null )
	return new FromXMLResult(null, "no swaras node under block");

    // create our block
    var b = new SongBlock();

    /*
     * create all lyric lines first. This allows "empty" lyrics to
     * create for all lyric lines, for each swara we add
     */
    for(var i = 0; i < lyrics.length; i++ ) {
	// add a lyric line to the block - for now assume all lyric lines do no translation
	var lyrLine = new LyricLineDesc(new LyricTranslator());
	b.addLyricLine(lyrLine);
    }

    // create a dummy swara and lyric which we will use
    // to create the swaras and lyrics in this block
    // by parsing the xml nodes
    var dummySwara = new Swara( "S", false, 0, 1, 0 );
    var dummyLyric = new Lyric( "l");
    var s = swaras.firstChild;
    var res;
    while(s != null ) {
	if( XMLUtils.isModelNode(s) ) {
	    res = dummySwara.fromXML(s);
	    if( res.fFailureReason != null ) 
		return res;
	    if( !b.addSwara(res.fResult)) 
		return new FromXMLResult( null, "cannot add swara to block" );
	}
	s = s.nextSibling;
    }

    /*
     * now set the lyrics
     */
    var fNotation = b.firstNotation();
    var notation, l;
    for(var i = 0; i < lyrics.length; i++ ) {
	notation  = fNotation;
	l         = lyrics[i].firstChild;
	while(notation != null && l != null ) {
	    if( XMLUtils.isModelNode(l) ) {
		res = dummyLyric.fromXML(l);
		if( res.fFailureReason != null ) 
		    return res;
		/*
		 * set the text of the ith lyric line to the text
		 * of the parsed lyric
		 */
		notation.lyrics()[i].setText(res.fResult.getRawText());
		notation = notation.next;
	    }
	    l        = l.nextSibling;
	}
    }
    return new FromXMLResult(b);
}

// accepted colors: 
// ref: http://www.w3schools.com/css/css_colornames.asp
var Colors = {
aliceblue:	"#f0f8ff",
antiquewhite:	"#faebd7",
aqua:		"#00ffff",
aquamarine:	"#7fffd4",
azure:		"#f0ffff",
beige:		"#f5f5dc",
bisque:		"#ffe4c4",
black:		"#000000",
blanchedalmond:	"#ffebcd",
blue:		"#0000ff",
blueviolet:	"#8a2be2",
brown:		"#a52a2a",
burlywood:	"#deb887",
cadetblue:	"#5f9ea0",
chartreuse:	"#7fff00",
chocolate:	"#d2691e",
coral:		"#ff7f50",
cornflowerblue:	"#6495ed",
cornsilk:	"#fff8dc",
crimson:	"#dc143c",
cyan:		"#00ffff",
darkblue:	"#00008b",
darkcyan:	"#008b8b",
darkgoldenrod:	"#b8860b",
darkgray:	"#a9a9a9",
darkgrey:	"#a9a9a9",
darkgreen:	"#006400",
darkkhaki:	"#bdb76b",
darkmagenta:	"#8b008b",
darkolivegreen:	"#556b2f",
darkorange:	"#ff8c00",
darkorchid:	"#9932cc",
darkred:	"#8b0000",
darksalmon:	"#e9967a",
darkseagreen:	"#8fbc8f",
darkslateblue:	"#483d8b",
darkslategray:	"#2f4f4f",
darkslategrey:	"#2f4f4f",
darkturquoise:	"#00ced1",
darkviolet:	"#9400d3",
deeppink:	"#ff1493",
deepskyblue:	"#00bfff",
dimgray:	"#696969",
dimgrey:	"#696969",
dodgerblue:	"#1e90ff",
firebrick:	"#b22222",
floralwhite:	"#fffaf0",
forestgreen:	"#228b22",
fuchsia:	"#ff00ff",
gainsboro:	"#dcdcdc",
ghostwhite:	"#f8f8ff",
gold:		"#ffd700",
goldenrod:	"#daa520",
gray:		"#808080",
grey:		"#808080",
green:		"#008000",
greenyellow:	"#adff2f",
honeydew:	"#f0fff0",
hotpink:	"#ff69b4",
indianred:	"#cd5c5c",
indigo:		"#4b0082",
ivory:		"#fffff0",
khaki:		"#f0e68c",
lavender:	"#e6e6fa",
lavenderblush:	"#fff0f5",
lawngreen:	"#7cfc00",
lemonchiffon:	"#fffacd",
lightblue:	"#add8e6",
lightcoral:	"#f08080",
lightcyan:	"#e0ffff",
lightgoldenrodyellow:	"#fafad2",
lightgray:	"#d3d3d3",
lightgrey:	"#d3d3d3",
lightgreen:	"#90ee90",
lightpink:	"#ffb6c1",
lightsalmon:	"#ffa07a",
lightseagreen:	"#20b2aa",
lightskyblue:	"#87cefa",
lightslategray:	"#778899",
lightslategrey:	"#778899",
lightsteelblue:	"#b0c4de",
lightyellow:	"#ffffe0",
lime:		"#00ff00",
limegreen:	"#32cd32",
linen:		"#faf0e6",
magenta:	"#ff00ff",
maroon:		"#800000",
mediumaquamarine:"#66cdaa",
mediumblue:	"#0000cd",
mediumorchid:	"#ba55d3",
mediumpurple:	"#9370d8",
mediumseagreen:	"#3cb371",
mediumslateblue:"#7b68ee",
mediumspringgreen:"#00fa9a",
mediumturquoise:"#48d1cc",
mediumvioletred:"#c71585",
midnightblue:	"#191970",
mintcream:	"#f5fffa",
mistyrose:	"#ffe4e1",
moccasin:	"#ffe4b5",
navajowhite:	"#ffdead",
navy:		"#000080",
oldlace:	"#fdf5e6",
olive:		"#808000",
olivedrab:	"#6b8e23",
orange:		"#ffa500",
orangered:	"#ff4500",
orchid:		"#da70d6",
palegoldenrod:	"#eee8aa",
palegreen:	"#98fb98",
paleturquoise:	"#afeeee",
palevioletred:	"#d87093",
papayawhip:	"#ffefd5",
peachpuff:	"#ffdab9",
peru:		"#cd853f",
pink:		"#ffc0cb",
plum:		"#dda0dd",
powderblue:	"#b0e0e6",
purple:		"#800080",
red:		"#ff0000",
rosybrown:	"#bc8f8f",
royalblue:	"#4169e1",
saddlebrown:	"#8b4513",
salmon:		"#fa8072",
sandybrown:	"#f4a460",
seagreen:	"#2e8b57",
seashell:	"#fff5ee",
sienna:		"#a0522d",
silver:		"#c0c0c0",
skyblue:	"#87ceeb",
slateblue:	"#6a5acd",
slategray:	"#708090",
slategrey:	"#708090",
snow:		"#fffafa",
springgreen:	"#00ff7f",
steelblue:	"#4682b4",
tan:		"#d2b48c",
teal:		"#008080",
thistle:	"#d8bfd8",
tomato:		"#ff6347",
turquoise:	"#40e0d0",
violet:		"#ee82ee",
wheat:		"#f5deb3",
white:		"#ffffff",
whitesmoke:	"#f5f5f5",
yellow:		"#ffff00",
yellowgreen:	"#9acd32"
};

function isColor(c) {
    if( Colors[c] )
	return true;
    else
	return false;
}

/**
 * is the provided string a rgb color spec?
 */
function isRGBColorSpec(s) {
    if ( s.indexOf('#') == 0 )
	return true;
    else if ( s.toLowerCase().indexOf('rgb') == 0 )
	return true;
    return false;
}

/**
 * validate the color spec
 */
function validateRGBColorSpec(s) {
    if ( s.indexOf('#') == 0 ) { 
	if(!s.match(/#[a-f0-9]{6,6}/i))
	    return null;
	return s;
    }
    if ( s.indexOf('rgb') == 0 ) { 
	var rgbre = /rgb\s*\((.*)\)/i;
	var rgbre_ret = rgbre.exec(s);
	if( rgbre_ret == null || rgbre_ret.length != 2 ) return null;
	var cspec = rgbre_ret[1];
	var rgb = cspec.split(/\s*\.\s*/);
	if( rgb.length != 3 ) return null;
	for(var c = 0; c < rgb.length; c++) {
	    if( !rgb[c].match( /[0-9]{0,3}/ ) )
		return null;
	    try
	    {
		var cval = parseInt(rgb[c]);
		if( cval > 255 ) return null;
	    }
	    catch(e) { 
		return null;
	    }
	}
	return s.replace(/\./g,',');
    }
    return false;
}

/**
 * @class 
 * represents a song
 *
 * @constructor
 * @param {String} title title of song (if not provided, an a default one 
 *			 would be provided)
 * @param {Tala} tala	 tala of song (if not provided, adi tala would be 
 *			 chosen)
 * @param {int}  defaultSpeed default speed of swaras, which is used to 
 *			      determine how speed markers are drawn (for 
 *			      swaras faster than the default speed)
 * @param {boolean} noAutoadd	if true, do not auto-add title and tala
 *				entries
 * @param {boolean} landScape  portrait or landscape
 * @param {String} leftMargin  if not null, left margin override
 * @param {String} rightMargin  if not null, right margin override
 * @param {String} topMargin  if not null, top margin override
 * @param {String} botMargin  if not null, bottom margin override
 */
function Song(title,tala,defaultSpeed,noAutoAdd,landScape,leftMargin,rightMargin,topMargin,botMargin)
{
    this.setAudio = function(val) { this.fAudio = val; }
    this.getAudio = function() { return this.fAudio; }
    this.hasAudio = function() { return (this.fAudio != null); }
    this.setAudioManager = function(mgr) { if( this.hasAudio() ) this.audioManager = mgr; }
    this.getAudioManager = function(mgr) { return this.audioManager; }

    /**
     * set the speed mark preference for the song
     * @param {boolean} val	true if speed marks are drawn below swaras,
     *				false if above
     */
    this.setSpeedMarksPreference = function(val) { this.fSpeedMarks = val; }

    /**
     * get the speed mark preference for the song
     * @return true if speed marks are drawn below swaras, false if above
     * @type boolean
     */
    this.getSpeedMarksPreference = function() { return this.fSpeedMarks; }

    /**
     * set the layout width for the song (compact vs. fullwidth)
     * @param {boolean} val	true if compact
     */
    this.setLayoutWidth = function(val) { this.fCompact = val; }

    /**
     * get the layout width for the song (compact vs. fullwidth)
     * @return true if compact layout, false else
     * @type boolean
     */
    this.getLayoutWidth = function() { return this.fCompact; }

    /**
     * set the phrase-end preference for the song
     * @param {boolean} val	true if phrase ends are to be shown, false if not
     * @param {string} val	(optional) if not null, the spacing to apply after
     *				phrase-end (in px, em or in - e.g. 10px,  0.5em, 0.15in)
     */
    this.setPhraseEndsPreference = function(val, spacing) 
    { 
	this.fPhraseEndsStyle = val; 
	if( spacing )
	    this.fPhraseEndsSpacing = spacing; 
    }

    /**
     * get the phrase ends preference for the song
     * @return true if phrase ends are to be shown, false otherwise
     * @type boolean
     */
    this.getPhraseEndsPreference = function() { return this.fPhraseEndsStyle; }

    /**
     * get the spacing that should be applied after the phrase end
     * @return the spacing to apply after phrase-end (in px or in - e.g. 10px,  0.15in)
     * @type string
     */
    this.getPhraseEndsSpacing = function() { return this.fPhraseEndsSpacing; }

    /**
     * get the title the song
     * @return the title of the song
     * @type String
     */
    this.getTitle = function() { return this.fTitle; }

    /**
     * get the raw contents of the song (set ONLY if imported from raw contents)
     * @type String
     */
    this.getRawContents = function() { return this.fRawContents; }

    /**
     * set the raw contents of the song (set ONLY if imported from raw contents)
     * @param {String} raw	the raw contents
     */
    this.setRawContents = function(raw) { this.fRawContents = raw; }

    /**
     * get the default (and initial) tala of the song
     * @return the default (and initial) tala of the song
     */
    this.getDefaultTala = function() { return this.fTala; }

    /**
     * is the song to be rendered portrait or landscape?
     */
    this.isPortrait = function() { return this.fIsPortrait; }

    this.getLeftMarginOverride = function() { return this.fLeftMargin; }
    this.getRightMarginOverride = function() { return this.fRightMargin; }
    this.getTopMarginOverride = function() { return this.fTopMargin; }
    this.getBottomMarginOverride = function() { return this.fBotMargin; }

    /**
     * set the title of the song
     * @param {String} title the title of the song
     * @return true or false indicating whether the title was set successfully.
     * @type boolean
     */
    this.setTitle = function(title) { 
	if( title && title.fPartType && title.fPartType == PART_HEADING ) {
	    title.next = this.fTitle.next;
	    title.prev = this.fTitle.prev;
	    title.prev.next = title;
	    title.parent     = this;
	    if( title.next ) title.next.prev = title;
	    this.fTitle.parent = null;

	    this.fTitle = title;
	    title.setTitle(true);
	    return true; 
	}
	else
	    return false;
    }

    /**
     * get the (initial) tala of the song
     * @return the tala of the song
     * @type Tala
     */
    this.getTala = function() { return this.fTala; }

    /**
     * set the tala of the song
     * @param {Tala} tala	the tala for the song
     * @return true or false indicating whether the tala was set successfully.
     * @type boolean
     */
    this.setTala = function(tala) { 
	if( tala && tala.fPartType && tala.fPartType == PART_TALA ) {
	    tala.next = this.fTala.next;
	    tala.prev = this.fTala.prev;
	    tala.prev.next = tala;
	    tala.parent = this;
	    if( tala.next ) tala.next.prev = tala;
	    this.fTala.parent = null;

	    this.fTala = tala;
	    return true; 
	}
	return false;
    }

    /**
     * get the default speed of swaras, which is used to determine how
     * speed markers are drawn (for swaras faster than the default speed)
     *
     * @return the default speed of swaras in the song, 0 implying first speed,
     *	       1 implying second speed and 2 implying third speed
     * @type int
     */
    this.getDefaultSpeed = function() {
	return this.fDefaultSpeed;
    }

    /**
     * get the parts that make up the song
     * @return the first part, which is start of linked list.
     */
    this.parts = function() {
	return this.fFirstPart;
    }

    /**
     * validate whether the passed in part is a valid song part
     * @param	part	part to be validated
     * @return true or false indicating whether the part is a valid song part
     * @type boolean
     */
    this.isValidPart = function(part) {
    	if( !part.fPartType ) return false;
    	return isValidSongPart(part.fPartType);
    }


    /**
     * add a song part to this song
     * @param part	song part
     * @return true or false indicating whether add was successful or not
     * @type boolean
     */
    this.addPart = function( part ) {
    	if( !this.isValidPart(part)) return false;
	part.parent = this;
	part.next = null;
	part.prev = this.fLastPart;
    	if( this.fLastPart )
	    this.fLastPart.next = part;
	this.fLastPart     = part;
	if( !this.fFirstPart )
	    this.fFirstPart = part;
	this.fPartCount++;
	return true;
    }

    /**
     * insert a song part into this song
     * @param part 		song part
     * @param beforeThisPart 	the song part before which the insertion is to done.
     * @return true or false indicating if the insertion was successful
     */
    this.insertPart = function( part, beforeThisPart ) {
    	if( !this.isValidPart(part) || !this.isValidPart(beforeThisPart)) return false;
	part.parent = this;
	part.prev   = null;
	if( beforeThisPart == this.fFirstPart ) {
	    // inserting at beginning
	    part.next = this.fFirstPart;
	    if( this.fFirstPart) 
		this.fFirstPart.prev = part;
	    this._fFirstPart = part;
	    return true;
	}
	else if( beforeThisPart == null ) {
	    // inserting at end
	    return this.addPart(part);
	}
	else {
	    part.next   = beforeThisPart;
	    part.prev   = beforeThisPart.prev;
	    if( beforeThisPart.prev )
		beforeThisPart.prev.next = part;
	    beforeThisPart.prev = part;
	}
	return true;
    }

    /**
     * remove a song part from this song
     * @part	part to be removed
     * @return true or false indicating whether part was removed
     * @type boolean
     */
    this.removePart = function(part) {
    	if( !isValidPart(part)) return false;
    	if( part.prev )
	    part.prev.next = part.next;
	if( part.next )
	    part.next.prev  = part.prev;
	if( part == this.fLastPart ) this.fLastPart = part.prev;
	if( part == this.fFirstPart ) this.fFirstPart = part.next;
	part.parent = null;
	if( this.fPartCount > 0 ) this.fPartCount--;
	return true;	
    }

     /**
      * serialize contents to xml
      */
     this.toXML = function() {
	var x = XMLUtils.createXMLNode("song");
	x.setAttribute("speed", this.fDefaultSpeed);

	if( this.fTala ) {
	    var t = this.fTala.toXML();
	    if( t ) x.appendChild(t);
	}	

	var ps = XMLUtils.createXMLNode("parts");
	var p = this.fFirstPart;
	while( p != null ) {
	    var px = p.toXML();
	    if( px ) ps.appendChild( px );
	    p = p.next;
	}
	x.appendChild(ps);
	return x;
     }


    /**
     * title of the song
     * @type String
     * @private
     */
    this.fTitle = null;
    if( title && title.fPartType && title.fPartType == PART_HEADING )
	this.fTitle     = title;
    else
	this.fTitle = new Heading( "Click to enter title", "", 18, ALIGN_CENTER );
    if(this.fTitle) this.fTitle.setTitle(true);
	
    /**
     * tala of the song
     * @type Tala
     * @private
     */
    this.fTala = null;
    if( tala && tala.fPartType && tala.fPartType == PART_TALA )
	this.fTala      = tala;
    else
	this.fTala      = PredefinedTalas.AdiTala(GATI_CATUSRA);
	    
    /**
     * first song part in song
     */
    this.fFirstPart = null;

    /**
     * last song part in song
     */
    this.fLastPart  = null;

    /**
     * # of parts in the song
     */
    this.fPartCount = 0;

    /**
     * default speed of swaras in the song
     * @type int
     * @private
     */
    this.fDefaultSpeed = defaultSpeed;

    if( !noAutoAdd && this.fTala )
	this.addPart(this.fTala);
    if( !noAutoAdd && this.fTitle )
	this.addPart(this.fTitle);


    /**
     * speed marks preference for song - below or above?
     * @type bool
     * @private
     */
    this.fSpeedMarksBelow = false;

    /**
     * layout width for song - compact or fullwidth?
     * @type bool
     * @private
     */
    this.fCompact = true;

    /**
     * phrase end preference for song - one of PhraseEnd* constants
     * @type int
     * @private
     */
    this.fPhraseEndsStyle  = Song.prototype.PhraseEndsHide;

    /**
     * preference for spacing applied followig phrase end preference for song -
     * empty implies no spacing
     * @type bool
     * @private
     *
     */
    this.fPhraseEndsSpacing  = "";

    /**
     * if model was imported from raw format, the raw contents
     * @type String
     * @private
     */
    this.fRawContents     = null;

    this.fIsPortrait      = true;
    if( landScape ) this.fIsPortrait = false;

    this.fLeftMargin     = leftMargin;
    this.fRightMargin    = rightMargin;
    this.fTopMargin      = topMargin;
    this.fBotMargin      = botMargin;


    /**
     * audio file associated with notations (if any) - EXPERIMENTAL
     * @type URL
     * @private
     */
    this.fAudio		  = null;


    this.fManualModeInlineTalaMarkers = false;

    this.isManualModeInlineTalaMarkers = function() {
	return this.fManualModeInlineTalaMarkers;
    }

    this.setManualModeTalaIndicators = function(val) {
	this.fManualModeInlineTalaMarkers = val;
    }

    this.isManualMode = function() {
	return this.fManualMode;
    }

    this.setManualMode = function(val) {
	this.fManualMode = val;
    }

    this.fGamakaPrefs = null;

    this.setGamakaPrefs = function(val) {
	this.fGamakaPrefs = val;
    }

    this.getGamakaPrefs = function() {
	return this.fGamakaPrefs;
    }

    /* has fontSize and color  */
    this.setSwaraPrefs = function(val) { this.fSwaraPrefs = val; }
    this.getSwaraPrefs = function(val) { return this.fSwaraPrefs; }

    /* has fontSize and color  */
    this.setLyricPrefs = function(val) { this.fLyricPrefs = val; }
    this.getLyricPrefs = function(val) { return this.fLyricPrefs; }

    /* has fontSize and color  */
    this.setHeadingPrefs = function(val) { this.fHeadingPrefs = val; }
    this.getHeadingPrefs = function(val) { return this.fHeadingPrefs; }

    /* array indexed by language name whose elements are font family */
    this.setLanguageFonts = function(val) { this.fLanguageFonts = val; }
    this.getLanguageFonts = function(val) { return this.fLanguageFonts; }
}
Song.prototype.PhraseEndsHide   = 0;
Song.prototype.PhraseEndsHyphen = 1;
Song.prototype.PhraseEndsHandle = 2;
Song.prototype.PhraseEndsHandleThick = 3;

/**
 * get the XML tag name for outermost xml node that represents the contents of this song 
 * @return a string containing xml tag
 * @type String
 */
Song.prototype.XMLTagName = function() {
    return "song";
}

/**
 * create a new node from an xml node (created presumably using 
 * {@link Song#toXML}
 * @param {XMLNode} xml The xml node. Note preferred way is "raw" format. Soon
 *			it will be the ONLY format - as it is quite powerful 
 *                      AND terse (the regular xml format is ridiculously
 *			verbose)
 * @type SongPart
 * @return a song part object initialized from the xml node if 
 *         successful, else null
 */
Song.prototype.fromXML = function(xml) {
    if( !XMLUtils.isXMLNode(xml, Song.prototype.XMLTagName())) 
	return new FromXMLResult(null, "not a song node");

    /*
     * see if raw attribute is set - if so deligate to raw format
     * importer
     */
    if( xml.getAttribute("raw") ) {
	var p = xml.firstChild;
	if( !p.tagName) 
	    p = p.nextSibling;
	if(!p || !p.tagName) 
	    return null;
	return Song.prototype.fromRawText(p.firstChild.nodeValue);
    }
    if( !XMLUtils.isXMLNode(xml, Song.prototype.XMLTagName())) 
	return new FromXMLResult(null, "not a song node");

    // validate default speed
    var s = new Swara( "S", false, 0 , 1, 0 );
    var speed = xml.getAttribute("speed");
    if( !speed || !s.isValidSpeed(speed) ) 
	return new FromXMLResult(null, "missing/invalid default speed: '" + speed + "'");

    var p = xml.firstChild;
    var tala = null;
    var parts = null;
    var result;
    while(p) {
	var handled = false;
	if( XMLUtils.isModelNode(p)) {
	    if( XMLUtils.isXMLNode(p, Tala.prototype.XMLTagName())) {
		handled = true;
		if( tala == null ) {
		    result = Tala.prototype.fromXML(p);
		    if( result.fResult )
			tala = result.fResult;
		    else 
			return result;
		}
	    }
	    if( !handled && parts == null ) {
		if( XMLUtils.isXMLNode(p, "parts") ) {
		    parts = p;
		    handled = true;
		}
	    }
	}
	p = p.nextSibling;
    }

    if( tala == null ) return new FromXMLResult(null, "no default tala under song" );
    if( parts == null ) return new FromXMLResult(null, "no parts under song" );

    var song = new Song("", tala, speed, true, false); 	// true => dont auto add entries
    							// for tala and title
    var cn = parts.firstChild;
    while( cn ) {
	if( XMLUtils.isModelNode(cn)) {
	    var tag = cn.tagName;
	    result = null;
	    if( XMLUtils.isXMLNode(cn, Tala.prototype.XMLTagName() ))
		result = Tala.prototype.fromXML(cn);
	    else if( XMLUtils.isXMLNode(cn, Heading.prototype.XMLTagName() ))
		result  = Heading.prototype.fromXML(cn);
	    else if( XMLUtils.isXMLNode(cn, SongBreak.prototype.XMLTagName() ))
		result = SongBreak.prototype.fromXML(cn);
	    else if( XMLUtils.isXMLNode(cn, LineBreak.prototype.XMLTagName() ))
		result = LineBreak.prototype.fromXML(cn);
	    else if( XMLUtils.isXMLNode(cn, SongBlock.prototype.XMLTagName() ))
		result = SongBlock.prototype.fromXML(cn);
	    if( result == null ) 
		return new FromXMLResult(null, "error parsing node: " + tag );
	    else if( result.fResult == null ) 
		return result;
	    if( !song.addPart(result.fResult))
		return new FromXMLResult( null, "cannot add song part for " + tag + " to song" );
	}
	cn = cn.nextSibling;
    }
    return new FromXMLResult(song);
}

/**
 * utility function for trimming off leading and trailing whitespace from a 
 * string
 */
function trim(s) {
    return s.replace(/^\s+|\s+$/, '')
}

/**
 * convert input in raw format to the model - this is the preferred way
 * of importing model now!
 *
 * TODO: it should always return a non-null object, with error message
 * indicated there rather than being ouputed via "alert". Perhaps
 * XMLResult should be renamed to ImportSongModelResult and be shared
 * with the XML import and raw import?
 *
 * @param {String}  text	input text in raw format
 * @return null on failure (message already alerted), else an XMLResult object
 *	   whose result property has the SongModel
 */
function rawError(reterror,msg, line) {
    if( reterror ) {
	return new FromXMLResult(null, msg, line);
    }
    else {
	var s = "";
	if( line > 0 )  {
	    s += "Line #" + line + ': ';
	}
	s += msg;
	alert(s);
	return null;
    }
}

/**
 * private routine to clone a translator - user when language is overridden
 */
function clone(obj) {
    if(typeof(obj) != 'object') return obj;
    if(obj == null) return obj;
    var newObj = new Object();
    for(var i in obj) {
	newObj[i] = clone(obj[i]);
    } 
    return newObj;
}

Song.prototype.fromRawText = function(text, reterror) {
    /* 
     * regular expressions for parsing diferent lines
     * TODO: not efficient - can do better
     */
    var tala_re = /Tala:[ 	]*(.*)$/i;
    //var layout_re = /Layout:[ 	]*(.*)[ 	]*$/i;
    var layout_re = /Layout:[ 	]*(.*)$/i;
    var smarks_re = /SpeedMarks:[ 	]*(.*)$/i;
    var phraseEnds_re = /PhraseEnds:[ 	]*(.*)$/i;
    var heading_re = /Heading:[ 	]*"([^"]*)"(.*)$/i;
    var title_re = /Title:[ 	]*"([^"]*)"(.*)$/i;
    var defspeed_re = /DefaultSpeed:[ 	]*([012])$/i;
    var orientation_re = /Orientation:[ 	]*(.*)$/i;
    var audio_re = /Audio:[ 	]*(.*)$/i;
    var lang_re=/Language:\s*([^\s]*)\s*$/i;
    //var langfont_re =/LanguageFont:\s*([^\s]*)\s*$/i;
    //var s_re = /([srgmpdn][ai]{0,1})(['`]{0,1})((?:[\^~/\\]{0,2})|\(.*\))(-{0,1})/;
    var s_re = /([srgmpdn,-_;][ai]{0,1})(['`]{0,1})(\*{0,1})((?:\^|[\/\\][sce]|\/\/|\/|\\\\|\\|~~|~|\(.*\)){0,1})(-{0,4})/i;
    var re_ret;			/* regular expression parsing result */
    var validDirectives  = {
	title: 1,
	heading: 1,
	songbreak: 1,
	smartlyricmode: 1,
	linebreak: 1,
	pagebreak: 1,
	headingprefs: 1,
	l: 1,
	language: 1,
	languageprefs: 1,
	languagefont: 1,
	lyricprefs: 1,
	s: 1,
	phraseends: 1,
	layout: 1,
	speedmarks: 1,
	swaraprefs: 1,
	gamakaprefs: 1,
	gati: 1,
	tala: 1,
	audio: 1,
	t: 1,
	tl: 1,
	end: 1
    };
	    

    /*
     * song parameters, current states, preferences
     */
    var defSpeed           = null;	/* default speed */
    var initDefSpeed	   = null;	/* initial default speed (before gati switches) */
    var initGati           = null;
    var speedMarks         = null;	/* speed mark preference */
    var phraseEnds         = null;	/* phrase-end preference directive */
    var defTala            = null;	/* default tala */
    var curTala            = null;	/* current tala */
    var phraseEndsStyle    = Song.prototype.PhraseEndsHide;	/* phrase end preference */
    var phraseEndsSpacing  = null;
    var speedMarksBelow    = false;	/* speed mark preference */
    var curLang		   = "english";	/* current language */
    var curTranslator      = null;	/* current language translator */
    var curNotationHeading = null;	/* label (sangati) for current notation line */
    var layout             = null;	/* layout specified if any */
    var compactMode	   = true;	/* compact mode? */
    var notation_font	   = null;	/* notation font specified if any */

    var newSong            = null;	 /* the model */
    var swaras             = new Array();/* swaras in current/last swara line */
    var lyricLines         = new Array();/* lyrics (and associated time indices) for last swara line 
    					   (array of arrays to handle multiple
					    lyric lines) */
    var lastSwaraLineCount = 0;		
    var lyricLineIndex = 0;		/* lyric line index in current notation */
    var isPortrait     = true;
    var leftMargin = null, topMargin = null, botMargin = null, rightMargin = null;
    var headingPrefs   = { color: null, fontSize: "12" };
    var swaraPrefs     = { color: null, fontSize: "10" };
    var lyricPrefs     = { color: null, fontSize: "10" };
    var gamakaPrefs    = { font: "Lucida Console,Courier New", color: null, fontSize: "7pt" }
    var lastTimeIndex  = -1;
    var ret = new Object();
    var switchedGati = null;
    var manualModeTalaIndicators = false;
    var smartLyricMode = false;
    var sawPageBreak = false;

    /*
     * handle newlines, collapsing continuation etc.
     */
    var text = text.replace( /\r\n/g, "\n" );	// replace carriage returns
    text = text.replace(/\\\n/g,"\\n");		// replace \<NL> to \n

    /* split input by new lines */
    var lines = text.split("\n");
    lines[lines.length] = "END";	// to force addition of block
    var nlines = lines.length;

    // prime it
    GamakaManager.determineGamakaState( 
    	    new TextGamaka( "|", "", gamakaPrefs.font, gamakaPrefs.fontSize, gamakaPrefs.color, "|" ),
	    document.body); 

    // initialize the language fonts
    var langFonts = new Array();
    langFonts["english"] = null;
    langFonts["tamil"] = null;
    langFonts["kannada"] = null;
    langFonts["telugu"] = null;
    langFonts["sanskrit"] = null;
    langFonts["diacritics"] = null;

    // initialize translators
    var translators = new Array();
    translators["english"] = null;
    if( Utils.isIE() ) {
	translators["tamil"] = new TamilTranslator(true,true);// true => subscripts
	translators["tamil:noqual"] = new TamilTranslator(true,true);// true => subscripts
	translators["tamil:natural"] = new TamilTranslator(true,true);// true => subscripts
	translators["tamil:nohard"] = new TamilTranslator(true,true);// true => subscripts
	translators["tamil:always"] = new TamilTranslator(true,true);// true => subscripts
    }
    else {
	translators["tamil"] = new TamilTranslator(false,true);// false => use spans
	translators["tamil"].setSuffixFontSize( "70%" );

	translators["tamil:noqual"] = new TamilTranslator(false,true);// false => use spans
	translators["tamil:noqual"].setSuffixFontSize( "70%" );

	translators["tamil:natural"] = new TamilTranslator(false,true);// false => use spans
	translators["tamil:natural"].setSuffixFontSize( "70%" );

	translators["tamil:nohard"] = new TamilTranslator(false,true);// false => use spans
	translators["tamil:nohard"].setSuffixFontSize( "70%" );

	translators["tamil:always"] = new TamilTranslator(false,true);// false => use spans
	translators["tamil:always"].setSuffixFontSize( "70%" );
    }
    translators["tamil"].setQualScheme("natural");
    translators["tamil"].dontAutoSenseNa();
    translators["tamil:noqual"].setQualScheme("noqual");
    translators["tamil:noqual"].dontAutoSenseNa();
    translators["tamil:natural"].setQualScheme("natural");
    translators["tamil:natural"].dontAutoSenseNa();
    translators["tamil:nohard"].setQualScheme("nohard");
    translators["tamil:nohard"].dontAutoSenseNa();
    translators["tamil:always"].setQualScheme("always");
    translators["tamil:always"].dontAutoSenseNa();


    translators["kannada"] = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_KANNADA);
    translators["telugu"] = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_TELUGU);
    translators["sanskrit"] = new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_SANSKRIT);
    translators["english"] = new EnglishTranslator();
    translators["diacritics"] = new DiacriticsTranslator();
    curTranslator      = translators["english"];

    /*
     * now parse line by line
     */
    for(var i = 0; i <= nlines; i++ ) {
	var line;
    	if( i == nlines )
	    line = null;
	else
	    line = trim(lines[i]);
	if(line != null && line == "" ) 	/* ignore empty lines */
	    continue;

	/*--------------------------------------------------------------
	 * we look for directive that MUST appear in pre-amble. These
	 * are default-speed, default-tala, speed mark preference etc.
	 *--------------------------------------------------------------*/
	/* check for default tala */
	if( line != null && defTala == null ) {
	    re_ret = tala_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
	    	var l = null;
		if( layout ) l = new TalaLayoutSpecification(layout);
		defTala = PredefinedTalas.fromPredefinedName( re_ret[1], l );
		if(defTala == null ) {
		    return rawError(reterror, "invalid tala specification", (i+1) );
		}
		curTala = PredefinedTalas.fromPredefinedName( re_ret[1], l );
		if( curTala && !manualModeTalaIndicators )
		    manualModeTalaIndicators = (curTala && curTala.inlineTalaMarkers);
		continue;
	    }
	}

	/* check for default speed */
	if( line != null && defSpeed == null ) {
	    re_ret = defspeed_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
		if( newSong != null ) {
		    return rawError(reterror,"default speed specification must appear before any notation/heading", (i+1) );
		}
		defSpeed = parseInt(re_ret[1]);
		continue;
	    }
	}

	if( line != null && trim(line.toLowerCase()) == "smartlyricmode" ) {
	    if( newSong != null ) {
		return rawError(reterror,"smart lyric mode specification must appear before any notation/heading", (i+1) );
	    }
	    smartLyricMode = true;
	}

	/* check for speed marks */
	if( line != null && speedMarks == null ) {
	    re_ret = smarks_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
		if( newSong != null ) {
		    return rawError(reterror,"speed marks specification must appear before any notation/heading", (i+1) );
		}
		var s = trim(re_ret[1]).toLowerCase();
		if( s == "below" )
		    speedMarksBelow = true;
		else if( s == "above" )
		    speedMarksBelow = false;
		else {
		    return rawError(reterror, "invalid speed marks specification: " + s, (i+1) );
		}
		speedMarks = s;
		continue;
	    }
	}

	/* check for phrase ends */
	if( line != null && phraseEnds == null ) {
	    re_ret = phraseEnds_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
		if( newSong != null ) {
		    return rawError(reterror,"phrase ends specification must appear before any notation/heading", (i+1) );
		}
		var s = trim(re_ret[1]).toLowerCase();
		var split = s.split(",");
		var k;
		for( k = 0; k < split.length; k++ ) {
		    var a = trim(split[k]).toLowerCase();
		    if( a == "show" )
			phraseEndsStyle = Song.prototype.PhraseEndsHyphen;
		    else if( a == "hide" )
			phraseEndsStyle = Song.prototype.PhraseEndsHide;
		    else if( a == "handle" )
			phraseEndsStyle = Song.prototype.PhraseEndsHandle;
		    else if( a == "handlethick" )
			phraseEndsStyle = Song.prototype.PhraseEndsHandleThick;
		    else if(a.match( /^[0-9.]*$/)) {
			phraseEndsSpacing = a + "px";
		    }
		    else if(a.match( /^[0-9.][0-9.]*in$/)) {
			phraseEndsSpacing = a;
		    }
		    else if(a.match( /^[0-9.][0-9.]*em$/)) {
			phraseEndsSpacing = a;
		    }
		    else {
			return rawError(reterror, "invalid phrase ends specification: " + s, (i+1) );
		    }
		}
		phraseEnds = s;
		continue;
	    }
	}

	/* check for orientation */
	if( line != null ) {
	    re_ret = orientation_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
		if( newSong != null ) {
		    return rawError(reterror,"orientation specification must appear before any notation/heading", (i+1) );
		}
		var s = trim(re_ret[1]).toLowerCase();
		
	        var split = s.split(",");
		for( var li = 0; li < split.length; li++ ) {
		    var ss = trim(split[li]);
		    if( ss == "portrait" )
			isPortrait = true;
		    else if( ss == "landscape" )
			isPortrait = false;
		    else {
			var lsplit = ss.split(':');
			if( lsplit.length != 2 )
			    return rawError(reterror, "invalid orientation specification: " + s );
			else
			{
			     var m = lsplit[0].toLowerCase();
		             var val_re = /[0-9]*\.[0-9][0-9]*$/;
			     if( !lsplit[1].match(val_re) ) {
				return rawError(reterror, "invalid orientation specification: " + s + "(" + lsplit[0] + ")" );
			     }

			     if( m == "left" )
			     	leftMargin = lsplit[1];
			     else if( m == "right" )
			     	rightMargin = lsplit[1];
			     else if( m == "top" )
			     	topMargin = lsplit[1];
			     else if( m == "bottom" )
			     	botMargin = lsplit[1];
			     else
			     {
				return rawError(reterror, "invalid orientation specification: " + s + "(" + m + ")" );
			     }
			}
		      }
		  }
		continue;
	    }
	}

	/* check for layout */
	if( line != null && layout == null ) {
	    re_ret = layout_re.exec(line);
	    if(re_ret != null && re_ret.length == 2 ) {
		if( defTala != null  ) {
		    return rawError(reterror,"layout specification must appear before any tala specification", (i+1) );
		}
		if( newSong != null ) {
		    return rawError(reterror,"layout specification must appear before any notation/heading", (i+1) );
		}
		var s = trim(re_ret[1]).toLowerCase();
		var split = s.split(",");
		if( split.length > 2 ) {
		    return rawError(reterror,"invalid layout specifition", (i+1) );
		}

		for( var li = 0; li < split.length; li++ ) {
		    if( split[li] == "kriti" || split[li] == "krithi" )
			layout = "kriti";
		    else if( split[li] == "geetam" || split[li] == "gitam" )
			layout = "gitam";
		    else if( split[li] == "varnam" )
			layout = "varnam";
		    else if( split[li] == "fullwidth" ) {
		    	compactMode = false;
		    }
		    else if( split[li] == "compact" )
		    	compactMode = true;
		    else {
			return rawError(reterror,"invalid layout specification", (i+1) );
		    }
		}
		continue;
	    }
	}


	/*--------------------------------------------------------------------
	 * we get here if it is NOT one of those directives that MUST be in 
	 * pre-amble. So from now we are in actual content area - but some
	 * directives (e.g. language) can still appear
	 *------------------------------------------------------------------*/


	var isAudio   = false;
	var isTitle   = false; /* is this a title */
	var isHeading = false; /* is this a heading? */
	var putSwaras = false;	/* generate SongBlock for notations (if any)
				   gathered so far?  */
	var isLang    = false;/* is this a language directive? */
	var akey = null;	/* actualy key/directive as specified */
	var key	= null;		/* the key/directive - lowercased */
	var keyval = null;		/* its value */

	if( line != null ) {
	    var sk = line.split(/\s*:\s*/);
	    if( sk == null || sk.length < 1 )
		akey = line;
	    else {
		akey = sk[0];
		keyval = sk[1];
	    }
	    if( akey != null ) key = akey.toLowerCase();
	}

	/* parse and skip comments */
	if( key != null )
	{
	   var s = trim(key);
	   if( s.indexOf( '#' ) == 0 )
	   	continue;
	}
	if( key != null && !validDirectives[key] ) {
	    return rawError(reterror, "invalid directive '" + akey + "'", (i+1)  );
	}

	/* make sure the mandatory pre-amble attributes have been specified */
	if ( defTala  == null ) {
	    return rawError(reterror, "no tala specified before main content", (i+1)  );
	}

	if( defSpeed == null ) {
	    if(layout == "gitam" )
		defSpeed = 0;
	    else  { /* if not specified */
		defSpeed = 1;	
	    }
	}

	/* create the song */
	if( newSong == null ) {
	    newSong = new Song(null,defTala,defSpeed,true,!isPortrait,leftMargin,rightMargin,topMargin,botMargin);
	    newSong.setSpeedMarksPreference(speedMarksBelow);
	    newSong.setPhraseEndsPreference(phraseEndsStyle,phraseEndsSpacing);
	    if(curTala.name().toLowerCase() == "manual" && !compactMode ) {
	    	alert( "FullWidth not support for manual tala, use _ and __ in swara lines for extra spacing" );
		compactMode = true;
	    }
	    newSong.setManualMode(manualModeTalaIndicators || curTala.name().toLowerCase() == "manual");
	    newSong.setManualModeTalaIndicators(manualModeTalaIndicators);
	    newSong.setGamakaPrefs(gamakaPrefs);
	    newSong.setLayoutWidth(compactMode);
	    newSong.setSwaraPrefs(swaraPrefs);
	    newSong.setLyricPrefs(lyricPrefs);
	    newSong.setHeadingPrefs(headingPrefs);
	    newSong.setLanguageFonts(langFonts);
	    newSong.addPart(curTala);
	}

	if( initDefSpeed == null ) 
	    initDefSpeed = defSpeed;
	if( initGati == null ) {
	    if( curTala.fParts )
		initGati = curTala.fParts[0].fGati;
	    else
		initGati = GATI_CATUSRA;
	}

	/* 
	 * pre-processing stage. We need to decide if we have to commit 
	 * notations gatered so far - before "interpreting" the next directive.
	 * This of course depends on what that directive is and so we parse
	 * it to figure out what it is, and then decide if we have to commit
	 * and if so commit, and THEN interpret what we parsed
	 */
	if( line == null ) {	/* end of input */
	    putSwaras = true;
	}
	else {
	    if( line.toLowerCase() == "pagebreak" ) {
	    	sawPageBreak = true;
		continue;
	    }
	    if(line.toLowerCase() == "linebreak" ) {
	        if(curTala.name().toLowerCase() == "manual" || manualModeTalaIndicators ) {
			putSwaras = true;
		}
		else {
			/* not a manual tala - ignore */
			continue;
		}
	    }
	    else if(line.toLowerCase() == "songbreak" || line.toLowerCase() == "end" ) {
		putSwaras = true;
	    }
	    else if((re_ret = heading_re.exec(line)) != null 
			&& re_ret.length == 3 ) { /* try to parse as heading */
		isHeading = true;
		putSwaras = true;
	    }
	    else if((re_ret = title_re.exec(line)) != null 
			&& re_ret.length == 3 ) { /* try to parse as title */
		isTitle = true;
	    }
	    else if((re_ret = lang_re.exec(line)) != null 
	    		&& re_ret.length == 2 ) { /* else try to parse as 
						     language directive */
		var lang = re_ret[1];
		isLang = true;
		putSwaras = true;
	    }
	    else if((re_ret = audio_re.exec(line)) != null 
	    		&& re_ret.length == 2 ) { /* else try to parse as 
						     language directive */
		isAudio = true;
		putSwaras = true;
	    }
	    else {
		
		/* 
		 * if we have a sangati-heading for swaras gathered in earlied
		 * lines (but not yet committed), and we see another swara row
		 * we commit
		 */
		if( /* curNotationHeading != null && */ key != "l" && key != "t" && key != "tl" ) 
		    putSwaras = true;
	    }
	}

	/* 
	 * if we have to put out swaras gathered so far, do it 
	 */
	if( putSwaras ) {
	    if(swaras.length != 0)  {
		var b = new SongBlock(); /* create a new block */
		var j, k;

		/* set the block heading */
		if(curNotationHeading ) b.setHeading(curNotationHeading);
		curNotationHeading = null;

		/* add lyric lines */
		var nLyricLines = lyricLines.length;
		for(j = 0; j < nLyricLines; j++ ) 
		    b.addLyricLine();

		/* add swaras */
		var notations = new Array();
		var sl = swaras.length;
		for(j = 0; j < sl; j++)
		    notations[j] =  b.addSwara(swaras[j]);

		/* add lyrics to the swaras */
		for(j = 0; j < nLyricLines; j++) {
		    var ll = lyricLines[j].lyrics;
		    var ti = lyricLines[j].timeIndices;
		    var lll = ll.length;
		    var nindex = 0;

		    /* do not associate specific lyrics with dummy swara for sangati label */

		    for(lindex = 0; lindex < lll; nindex++) {
			//if( !notations[nindex] ) alert(notations.length + " vs " + k + " vs " + sl + " vs " + lll);

			var swara  = notations[nindex].swara();
			var slabel = swara.getLabel();
			
			var llabel;
			var talalabel = false;
			if( slabel == "|" || slabel == "||" )  {
			    talalabel = true;
			    llabel = "";
			}
			else
			    llabel = ll[lindex];

			var lyrics = notations[nindex].lyrics();
			lyrics[j].setText( llabel );
			if( ti ) {
			    for(t = 0; t < ti.length; t++ ) {
				var timeIdx = ti[t][nindex];
				if( timeIdx != null )
				    lyrics[j].addTimeIndex( timeIdx );
			    }
			}
			if( !talalabel )
			    lindex++;
		    }
		}

		/* add block to the song */
		newSong.addPart(b);

		/* set the language translator for block if any */
		if(curTranslator != null )
		    b.setTranslator(curTranslator);

		if( langFonts[curLang] ) {
		    b.setDefaultFont(langFonts[curLang]);
		}

		if( swaraPrefs.fontSize ) b.setDefaultSwaraFontSize(swaraPrefs.fontSize);
		if( lyricPrefs.fontSize ) b.setDefaultLyricFontSize(lyricPrefs.fontSize);
		if( swaraPrefs.color    ) b.setDefaultSwaraFontColor(swaraPrefs.color);
		if( lyricPrefs.color    ) b.setDefaultLyricFontColor(lyricPrefs.color);

		/* 
		 * reset swaras,lyrics array that keep track of notations
		 * gathered so far but not committed
		 */
		swaras     = new Array();
		lyricLines = new Array();
	    }

	    /* 
	     * now interpret the current line
	     */
	    if( line == null )	
		break; /* end of input - we are done */
	    if( line.toLowerCase() == "songbreak" ) {
		newSong.addPart(new SongBreak());
		continue;
	    }
	    if( line.toLowerCase() == "linebreak" ) {
		newSong.addPart(new LineBreak());
		continue;
	    }
	    else if( line.toLowerCase() == "end" ) 
		continue;	/* this is the end-marker we inserted */
	}

	/* continue interpretation */
	if( isHeading ) {
	    var txt = re_ret[1];
	    var rest = re_ret[2];
	    var split = rest.split(",");
	    var fontName = null;
	    var fontSize  = headingPrefs.fontSize;
	    var color    = headingPrefs.color;
	    var bold     = false;
	    var italic   = false;
	    var title    = false;
	    var translator = null;
	    var sawLang    = false;
	    var alignment;
	    var lang = curLang;
	    var s;
	    for(var j = 1; j < split.length; j++ ) {
		if(split[j].match( /^[1-9][0-9]*$/)) {
		    fontSize = split[j];
		    continue;
		}
		s = split[j].toLowerCase();
		if(s== "bold" )
		    bold = true;
		else if(s == "italic" )
		    italic = true;
		else if( s == "title" )
		    title = true;
		else if(s == "left" )
		    alignment = "left";
		else if(s == "right" )
		    alignment = "right";
		else if(s == "center" )
		    alignment = "center";
		else if( isRGBColorSpec(split[j]) )  {
		    color = parseRGBColorSpec(split[j]);
		    if( color == null )
			return rawError(reterror, "invalid RGB color spec '" + split[j] 
					+ " in heading attributes '" + rest + "'", (i+1)  );
		}
		else if( Colors[s] != null ) {	// match for color
		    color = split[j];
		}
		else {
		    /* look for language specifier */
		    var isLang = false;
		    if( split[j] != "" ) {
			var s = trim(split[j].toLowerCase());
			var lsplit = s.split(':');
			var l = lsplit[0];
			isLang = false;
			for(lang in translators) {
			    if( lang == l ) {
				translator = clone(translators[l]);
				isLang = true;
				sawLang = true;
				lang     = l;
				break;
			    }
			}
			if( isLang ) {
			    // set language attributes (if ant)
			    for(var si = 1; si < lsplit.length; si++ )
				translator.setAttribute(trim(lsplit[si]));
			}
		    }
		    if( !isLang ) {
			/* look as font name */
			if( fontName == null )
			    fontName = trim(split[j]);
			else {
			    return rawError(reterror, "invalid attribute '" + split[j] + " in heading attribute '" + rest + "'", (i+1)  );
			}
		    }
		}
	    }

	    /* create the heading, set the attributes and add it to model */
	    if(!fontName)  {
		// get the default font for the language
		if( lang && langFonts[lang] != null )
		    fontName = langFonts[lang];
		else if( curLang && langFonts[curLang] != null ) {
		    fontName = langFonts[curLang];
		}
	    }

	    var h = new Heading(txt, fontName, fontSize, alignment, color, title);
	    h.fBold = bold;
	    h.fItalic = italic;
	    // note that english lang may be specified resulting in  null trans -
	    // we need to respect that and not inherit current transl!
	    if( !sawLang && translator == null ) translator = curTranslator;
	    if( translator != null )
		 h.setTranslator(translator);
	    newSong.addPart(h);

	    if( sawPageBreak )
	    	h.setFollowsPageBreak(true);
	    sawPageBreak = false;
	}
	else if( isTitle ) {
	    var txt = re_ret[1];
	    var rest = re_ret[2];
	    var split = rest.split(",");
	    var translator = null;
	    var s;
	    for(var j = 1; j < split.length; j++ ) {
		var isLang = false;
		if( split[j] != "" ) {
		    var s = trim(split[j].toLowerCase());
		    var lsplit = s.split(':');
		    var l = lsplit[0];
		    isLang = false;
		    for(lang in translators) {
			if( lang == l ) {
			    translator = clone(translators[l]);
			    isLang = true;
			    sawLang = true;
			    lang     = l;
			    break;
			}
		    }
		    if( isLang ) {
			// set language attributes (if ant)
			for(var si = 1; si < lsplit.length; si++ )
			    translator.setAttribute(trim(lsplit[si]));
		    }
		}
		if( !isLang ) {
		    return rawError(reterror, "invalid attribute '" 
		    		    + split[j] 
				    + " in title attribute '" + rest + "'", (i+1)  );
		}
	    }

	    var t = new Title(txt);

	    // note that english lang may be specified resulting in  null trans -
	    // we need to respect that and not inherit current transl!
	    if( !sawLang && translator == null ) translator = curTranslator;
		 t.setTranslator(translator);
	    newSong.addPart(t);
	}
	else if( isLang ) {	/* language directive */
	    var s = trim(re_ret[1].toLowerCase());
	    var split = s.split(':');
	    var l = split[0];
	    var valid = false;
	    for(lang in translators) {
		if( lang == l ) {
		    var lang = 
		    curLang 	  = l;
		    curTranslator = translators[l];	/* set current translator */
		    valid = true;
		    break;
		}
	    }
	    if( !valid ) {
		return rawError(reterror,"invalid language '" + s + "' specified in language directive", (i+1) );
	    }
	    for(var si = 1; si < split.length; si++ ) {
		curTranslator.setAttribute(trim(split[si]));
	    }
	}
	else if( isAudio ) {	/* language directive */
	    var audio_file = trim(re_ret[1].toLowerCase());
	    newSong.setAudio(audio_file);
	}
	else if( key == "s" || key == "l" || key == "t" || key == "tl" ) {
	    /* if swara or lyric or time index: split the line as swaras/lyrics/time */
	    var not = line.split(/\s+/ );
	    
	    // notations
	    if( key == "s" ) {
		var speed = defSpeed;
		var s;
		var nl = not.length;
		var label_re = /"([^"]*)"$/;
		var start_id = 1;

		lastSwaraLineCount = 0;
		lyricLineIndex     = 0;
		s = not[start_id];
		re_ret = label_re.exec(s);
		curNotationHeading = null;
		if( re_ret != null && re_ret.length == 2 ) {
		    curNotationHeading = re_ret[1];
		    start_id++;
		}

		for(var si = start_id; si < nl; si++ ) {
		    s = not[si];
		    if( s == "" ) continue;
		    if( s == "(" )
			speed++;
		    else if( s == ")" ) {
			if( speed == defSpeed ) {
			    return rawError(reterror,"paren mismatch", (i+1)  );
			}
			speed--;
		    }
		    else {
			var octave = 0;
			var label = null;
			var len = 1;
			var pauseOrEmpty = false;
			var empty = false;
			var gamaka = null;
			var thisSpeed = speed;
			var ignoreInCount = false;
			var first_char = ((s != "" ) ? s.charAt(0) : null);
			if( s == "|" || s == "||" )  {
			    if(curTala.name().toLowerCase() != "manual")
				continue;
			    else if ( curTala.hasBaseTala )
			    	continue;
			    label = s;
			    len = 0;
			    // speed = 0;
			    ignoreInCount = true;
			}
			else if( s == "=" ) {
			    label = "..";
			    thisSpeed = 0;
			    len   = 1;
			    //thisSpeed = defSpeed;
			}
			else if( s == "=-" ) { 
			    label = "..-";
			    thisSpeed = 0;
			    len   = 1;
			}
			/*
			else if( s == "," || s == '-' || s == "--" || s == ",-" ) {
			    label = s;
			    pauseOrEmpty = true;
			}
			else if( s == ";" || s == ";-" )  {
			    label = s;
			    len = 2;
			    pauseOrEmpty = true;
			}
			else if( s == '_' ) {
			    label = "_";
			    empty = true;
			}
			else if( s == '__' ) {
			    label = "__";
			    len   = 2;
			    empty = true;
			}
			*/
			if( label == null ) {
			    var re_ret = s_re.exec(s);
			    if(re_ret == null || re_ret.length < 2 ) {
				return rawError(reterror,"invalid swara: '" + s + "'", (i+1)  );
			    }
			    var label = re_ret[1];
			    var r;
			    if( label.length == 2 ) {
				var lc = label.toLowerCase();
				if( lc != "sa" && lc != "ri" && lc != "ga" &&
				    lc != "ma" && lc != "pa" && lc != "da" && lc != "ni" )
				{
				    return rawError(reterror, "invalid swara: '" + label + "'" , (i+1)  );
				}
				else
				    len = 2;
			    }
			    else {
				var lc = label.toLowerCase();
				if( lc == "," || lc == '-' || lc == "," )
				{
				    pauseOrEmpty = true;
				    len = 1;
				}
				else if( lc == ";" )
				{
				    pauseOrEmpty = true;
				    len = 2;
				}
				else if ( lc == '_' )
				{
				    pauseOrEmpty = true;
				    empty = true;
				    len = 1;
				}
				else if ( lc == '__' )
				{
				    pauseOrEmpty = true;
				    empty = true;
				    len = 1;
				}
			    }
			    var past_label = 2;
			    if( re_ret.length > past_label )  {
				 r = re_ret[past_label];
				 if( r == "'" )
				    octave = 1;
				 else if( r == "`" )
				    octave = -1;
				past_label++;
			        r = re_ret[past_label];
				if( r == "*" ) 
				    label += "*";
				//label = label.toUpperCase();
				past_label++;
				if( re_ret.length > past_label )  {
				     r = re_ret[past_label];
				    gamaka = GamakaManager.getGamakaByShortName(r);
				    if( !gamaka ) {
					 if( r.match( /\([^)]*\)/ )) {
					    r = r.replace(/\((.*)\)/,"$1");
					    gamaka = new TextGamaka( "", "", gamakaPrefs.font, gamakaPrefs.fontSize, gamakaPrefs.color, r );
					    GamakaManager.determineGamakaState(gamaka, document.body);
					 }
					 else if( r != "" ) {
					     return rawError(reterror,"unrecognized characters '" + r + "' following swara label "
							+ label + "'" , (i+1)  );
					 }
				    }
				}
				past_label++;
				if( re_ret.length > past_label )  {
				     r = re_ret[past_label];
				     if( r == "-" || r == "--" || r == "---" || r == "----" )
					label += r;
				}
			    }
			}
			if( pauseOrEmpty )
			    octave = 0;
			var swara = new Swara(label, pauseOrEmpty, octave, len, thisSpeed)
			swaras[swaras.length] = swara;

			if(sawPageBreak) 
			   swara.setFollowsPageBreak(true);
		        sawPageBreak = false;

			if( gamaka ) swara.setGamaka(gamaka);
			else if ( manualModeTalaIndicators )
			{
			    //gamaka = new TextGamaka( "dummy", "", gamakaPrefs.font, gamakaPrefs.fontSize, gamakaPrefs.color, "&nbsp;" );
			    gamaka = new EmptyGamaka( "dummy", "" );
			    swara.setGamaka(gamaka);
			}

			if( !ignoreInCount )
			    lastSwaraLineCount++;
		    }
		}
	    }
	    else if( key == "l" ) {
		var nl = not.length;
		if( lyricLines.length == lyricLineIndex )
		    lyricLines[lyricLineIndex] = new Object();

		var lyricLine = lyricLines[lyricLineIndex].lyrics;
		if( !lyricLine ) {
		    lyricLine = new Array();
		    lyricLines[lyricLineIndex].lyrics = lyricLine;
		}

		if( smartLyricMode )
		{
		    var li = 1;
		    var nLyrics = 0;
		    var swaraindex = 0;

		    while(swaraindex < lastSwaraLineCount) {
			var s = swaras[swaraindex];
			if( li == nl )
			{
			    /* 
			     * if we have exhausted all lyrics,  then for
			     * remaining swaras, ignore pauses but indicate
			     * ? for unfulfilled ones
			     */
			    if( s.isPauseOrEmpty() )
			    {
				 lyricLine[lyricLine.length] = " "; 
			    }
			    else
				 lyricLine[lyricLine.length] = "?"; 
			}
			else
			{
			    var l = not[li];
			    if( l == "" ) { li++; continue; }
			    if( s.isPauseOrEmpty() )
			    {
			        /* 
				 * swara is a pause/empty. If the matching lyric
				 * is equivalent to empty one, consume it. If it is
				 * a '-' or a '.' consume it. Else put out
				 * a empty lyric, but dont consume current lyric
				 */
				if( l == "_" || l == "''"  || l == "' '" || l == '""' || l == '" "' )
				{
				     lyricLine[lyricLine.length] = " "; 
				     li++;
				}
				else if( l == "-" )
				{
				     lyricLine[lyricLine.length] = l;
				     li++;
				}
				else if( !s.isEmpty() && l == ".." ) {
				    /*
				     * special to include a "dot" for a comma
				     * (e.g. in mohanam varnam it is g , g , r  , , , 
				     * matched against               nin nu  kO . . . 
				     * and thus the comma's for ga are treated as
				     * true pauses but the commas for ri are "voiced".
				     * This seems like a exception to normal use.
				     * Ideally this should perhaps be g , g , r r r r
				     * but may be that means something else.
				     *
				     * Anyway by default, dots are NOT matched against
				     * commas - but to handle cases like above 
				     * double-dots are used. So mohanam varnam should 
				     * be noted as 
				     * g , g , r  ,  ,  ,
				     * nin nu  ko .. .. ..
				     *
				     * p , m pa
				     * 
				     * can be
				     *
				     * pa . da
				     *
				     * and the . goes to ma (this seems more common)
				     */
				     lyricLine[lyricLine.length] = ".";
				     li++;
				}
				else
				{
				     lyricLine[lyricLine.length] = " "; 
				}
			    }
			    else
			    {
				 /* not a pause or empty, take the lyric */
				if( l == "_" || l == "''"  || l == "' '" || l == '""' || l == '" "' )
					 lyricLine[lyricLine.length] = " ";
				else if( !s.isRepeater() && l == ".." )	{
				     // allow .. as . for anything other than repeaters
				     // see above - special case
				     lyricLine[lyricLine.length] = ".";
				}
				else
				     lyricLine[lyricLine.length] = l;
				 li++;
			    }
			}
			nLyrics++;
			swaraindex++;
		    }
		    if( swaraindex == lastSwaraLineCount && li != not.length ) {
			alert("too many lyrics in lyric line (SmartLyricMode)");
			//return rawError(reterror,"too many lyrics in lyric line (SmartLyricMode)");
		    }
		    if( nLyrics != lastSwaraLineCount ) {
			return rawError(reterror,"lyrics in lyric line cannot be matched against swara line (SmartLyricMode)");
		    }
		}
		else {
		    var nLyrics = 0;

		    for(var li = 1; li < nl; li++ ) {
			var l = not[li];
			if( l == "" ) continue;
			if( l == "_" || l == "''"  || l == "' '" || l == '""' || l == '" "' )
			    l = " ";

			lyricLine[lyricLine.length] = l; 
			nLyrics++;
		    }
		    if( nLyrics != lastSwaraLineCount ) {
			return rawError(reterror,"lyric line does not match swara line - has " + 
				lyricLine.length + " lyrics - expected " + lastSwaraLineCount, (i+1) );
		    }
		}
		lyricLineIndex++;
	    }
	    else if( key == "t" || key == "tl" ) {
		var nt = 0;
		var ti;
		var forLyricLine = -1;
		var ary = swaras;
		var tl = null;
		if( key == "tl" ) {
		    if( lyricLines == 0 || lyricLines.length == 0 ) {
			return rawError(reterror, "tl directive must follow a lyric line" + (i+1) );
		    }

		    /*
		     * add a time index array to the last lyric line
		     */
		    var timeIndices = lyricLines[lyricLines.length-1].timeIndices;
		    if(!timeIndices) {
			timeIndices = new Array();
			lyricLines[lyricLines.length-1].timeIndices = timeIndices;
		    }
		    tl = new Array();
		    timeIndices[timeIndices.length] = tl;
		}
		for(var ti = 1; ti < not.length; ti++ ) {
		    if( t == "" ) continue;
		    nt++;
		}
		if( nt != lastSwaraLineCount ) {
		    return rawError(reterror,"time index line does not match swara line - has " + 
			    nt + " indices - expected " + lastSwaraLineCount, (i+1) );
		}
		var nindex = 0;

		for(var ti = 1; ti < not.length; ti++ ) {
		    var t = not[ti];
		    if( t == "" ) continue;
		    if( t == "_" ) {
			if( tl ) tl[nindex] = null;
			nindex++;
			continue;
		    }
		    var tval = parseFloat(t);
		    if(tval ==  NaN)
			return rawError(reterror, "invalid time index '" + t + "' specified ", (i+1) );
		    if( tl )
			tl[nindex] = tval;	/* for lyrics, we gather here and add later */
		    else
			swaras[nindex].addTimeIndex(tval);
		    lastTimeIndex = tval;
		    nindex++;
		}
	    }
	}
	else if( key == "languagefont" ) {
	    // set/modify language font
	    var split = keyval.split(/\s*,\s*/);
	    if( split.length != 2 ) {
		return rawError(reterror, "invalid LanguageFont specification '" + keyval + "'", (i+1) );
	    }
	    var l = split[0].toLowerCase();
	    var valid = false;
	    for(lang in langFonts) {
		if( lang == l ) {
		    valid = true;
		    break;
		}
	    }
	    if( !valid ) {
		return rawError(reterror,"invalid language '" + split[0] + 
			"' specified in LanguageFont directive", (i+1) );
	    }
	    langFonts[l] = split[1];
	}
	else if( key == "gati" ) {
	    var gatival = "";

	    if(!curTala.canSwitchGati()) {
		return rawError(reterror, "Cannot switch gatis/nadais with this tala", (i+1) );
	    }
	    var curGati = switchedGati;
	    if( !curGati ) {
		if( curTala.fParts )
		    curGati = curTala.fParts[0].fGati;
		else
		    curGati = GATI_CATUSRA;
	    }

	    var gati;
	    gatival = trim(keyval.toLowerCase());
	    if( gatival == "catusra" )  {
		gati = GATI_CATUSRA;
	    }
	    else if( gatival == "tisra" ) {
		gati = GATI_TISRA;
	    }
	    else if( gatival == "khanda" )  {
		gati = GATI_KHANDA;
	    }
	    else if( gatival == "misra" )  {
		gati = GATI_MISRA;
	    }
	    else if( gatival == "sankirna" )  {
		gati = GATI_SANKIRNA;
	    }
	    else
		return rawError(reterror, "invalid gati '" + keyval + "' specified in Gati directive", (i+1) );

	    if( gati != switchedGati ) {
		if( initGati == gati ) {
		    /* 
		     * if we are coming back to the original gati, 
		     * go back to original speed
		     */
		    defSpeed = initDefSpeed;
		}
		else {
		    /*
		     * when going from anyother to catusra, increase default speed.
		     * when going to any other from catusra, decrease.
		     * This achieves following order:
		     * ta-ki-Ta	(GATI_TISRA: 3)
		     * ta-ka-dhi-mi (GATI_CATUSRA: 2)
		     * ta-ka-ta-ki-Ta (GATI_KHANDA: 5)
		     * ta-ki-Ta-ta-ka-dhi-mi (GATI_MISRA: 7)
		     * ta-ka-ta-ki-Ta-ta-ka-dhi-mi (GATI_SANKIRNA: 9)
		     *
		     * So from GATI_CATUSRA (2) to GATI_TISRA (3), we result in LESSER
		     * # of mathrais per akshara for a default swara
		     *
		     */
		    if( gati == GATI_CATUSRA ) {
			if( curGati != GATI_CATUSRA ) 
			    if( defSpeed >= 1 && defSpeed <= 2) defSpeed ++;
		    }
		    else {
			if( curGati == GATI_CATUSRA )
			    if( defSpeed >= 2 ) defSpeed--;
		    }
		}

		switchedGati = gati;
		var gs = new GatiSwitch();
		gs.setGati(gati);
		newSong.addPart(gs);
	    }
	}
	else if( key == "swaraprefs" || key == "lyricprefs" || key == "headingprefs" || key == "gamakaprefs" ) {
	    // SwaraPrefs: font-size,font-color
	    var split = keyval.split(/\s*,\s*/);
	    var fontSize = null;
	    var color = null;
	    for(var si = 0; si < split.length; si++) {
		var s = trim(split[si]);
		if(s.match( /^[1-9][0-9]*$/)) {
		    if( fontSize != null ) {
			return rawError(reterror,"duplicate font size specified in '" + akey + "' directive", (i+1)  );
		    }
		    fontSize = s;
		}
		else  {
		    if( color ) {
			return rawError(reterror,"possible duplicate color '" + split[si] +
			    	"' specified in '" + akey + "' directive", (i+1)  );
		    }
		    if( isRGBColorSpec(s) ) {
		    	color = validateRGBColorSpec(s);
			if( color == null ) {
			    return rawError(reterror,"incorrectly formatted rgb color '" + split[si] + 
			    	"' specified in '" + akey + "'", (i+1)  );
			}
		    }
		    else {
			if( !isColor(s) ) {
			    return rawError(reterror,"unrecognized color '" + split[si] + 
			    	"' specified in '" + akey + "' directive" , (i+1)  );
			}
			color = split[si];
		    }
		}
	    }
	    if( fontSize != null ) {
		if( key == "swaraprefs" )      swaraPrefs.fontSize = fontSize;
		else if( key == "headingprefs" )      headingPrefs.fontSize = fontSize;
		else if( key == "gamakaprefs" )      gamakaPrefs.fontSize = fontSize;
		else 			       lyricPrefs.fontSize = fontSize;
	    }
	    if( color != null ) {
		if( key == "swaraprefs" )      swaraPrefs.color = color;
		else if( key == "headingprefs" )      headingPrefs.color = color;
		else if( key == "gamakaprefs" )      gamakaPrefs.color = color;
		else 			       lyricPrefs.color = color;
	    }
	}
    }
    newSong.setRawContents(text);
    return new FromXMLResult(newSong);
}

/**
 * @class
 * represents a note duration as a fraction
 * @constructor
 * @param {int} num 	the numerator of the fraction
 * @param {int} denom the denominator of the fraction
 */
function Duration(num, denom)
{
    /**
     * the numerator part of the fraction
     */
    this.fNum = 0;
    if( num )
	this.fNum = num;
    else
	this.fNum = 0;

    /**
     * the denominator part of the fraction
     */
    this.fDenom = 0;
    if( denom )
	this.fDenom = denom;

    /**
     * add a duration to this duration
     * @param o {Duration} duration to add
     */
    this.add = function(o) {
    	this._addSubtract(o, true);
    }

    /**
     * subtract a duration to this duration
     * @param o {Duration} duration to subtract
     */
    this.subtract = function(o) {
    	this._addSubtract(o, false);
    }

    /**
     * is this a zero duration?
     * @return true or false as to whether duration is zero
     * @type boolean
     */
    this.isZero = function() {
    	if( this.fNum == 0 ) { return true; }
	return false;
    }

    /**
     * make this a zero duration
     */
    this.setZero = function() {
	this.fNum = 0;
    }

    /**
     * is the duration a whole number i.e. no fractional part?
     * @return true or false as to whether duration is a whole number
     * @type boolean
     */
    this.isWhole = function() {
	if(this.fDenom == 1 ) return true;
	else return false;
    }

    /**
     * return the whole part of the duration
     * @return if the duration is > 1, return the whole part, else return 0
     * @type int
     */
    this.wholePart = function() {
	if( this.isZero() ) return 0;
	else if( this.fDenom != 0 && this.fNum >= this.fDenom ) {
	    return parseInt( this.fNum/this.fDenom );
	}
	return 0;
    }

    /**
     * compare the duration with another and return a value indicating if it equal,
     * greater than or less than
     * @param {Duration} d	duration to be compared against
     * @return 1 if this duration is > d, -1 if it is < d, and 0 if it is equal
     */
    this.compare = function(d) {
	// get zero cases out first
	if( d.isZero() ) {
	    if(this.isZero() ) return 0;
	    else return 1;
	}
	else if( this.isZero() ) {
	    if(d.isZero() ) return 0;
	    else return -1;
	}

	// create clone of us
	var d1 = new Duration(this.fNum, this.fDenom);

	// subtract d from our clone
	d1.subtract(d);

	// check the numerator if zero, we are equal, if < 0, then d was greater than us
	if( d1.fNum == 0 || d1.fDenom == 0 ) return 0;
	if( d1.fNum < 0 || d1.fDenom < 0 ) return -1;
	return 1;
    }

    /**
     * internal routine that adds/subtracts a duration to/from this duration
     * @param o {Duration} 	duration to add or subtract
     * @param add {boolean}	true or false indicating if we are to add or
     *				subtract
     * @private
     */
    this._addSubtract = function(o, add) {
	var denom;
	var m1 = this.fDenom;
	var m2 = o.fDenom;

	// handle case when we or "o" is zero
	if( o.isZero() ) 
	    return;
	else if( this.isZero() ) {
	    if( add ) {
		this.fDenom = o.fDenom;
		this.fNum   = o.fNum;
	    }
	    else {
		this.fNum   = -o.fNum;
		this.fDenom = o.fDenom;
	    }
	    return;
	}

	if( this.fDenom == o.fDenom ) {
	    m1 = 1;
	    m2 = 1;
	    denom = this.fDenom;
	}
	else if( this.fDenom > o.fDenom && (this.fDenom % o.fDenom) == 0 ) {
	    denom = this.fDenom;
	    m1    = this.fDenom / o.fDenom;
	    m2    = 1;
	}
	else if( o.fDenom > this.fDenom && (o.fDenom % this.fDenom) == 0 ) {
	    denom = o.fDenom;
	    m1    = 1;
	    m2    = o.fDenom / this.fDenom;
	}
	else
	    denom = o.fDenom * this.fDenom;

	var num;
	if ( add ) 
	    num = (o.fNum*m1) + (this.fNum*m2);
	else
	    num = (this.fNum*m2) - (o.fNum*m1);

	if( num == 0 ) {
	    this.fNum   = 0;
	    this.fDenom = denom;
	}
	if( num == denom ) {
	    this.fNum = 1;
	    this.fDenom = 1;
	}
	else if( num > denom && (num%denom) == 0 ) {
	    this.fNum = parseInt(num/denom);
	    this.fDenom = 1;
	}
	else if( denom > num && (denom%num) == 0 ) {
	    this.fNum = 1;
	    this.fDenom = parseInt(denom/num);
	}
	else {
	    this.fNum = num;
	    this.fDenom = denom;

	    if( !this.isZero()  )
	    {
		// reduce
		while( (this.fNum%2) == 0 && (this.fDenom%2) == 0 )
		{
		    this.fNum = parseInt(this.fNum/2);
		    this.fDenom = parseInt(this.fDenom/2);
		}
	    }
	}
    }

    /**
     * debug routine that stringizes the duration
     * @type String
     */
    this.toString = function() {
	if( this.fNum == 0 ) return "0";
	else return this.fNum + "/" + this.fDenom;
    }

    /**
     * debug routine that prints (on Safari only) out the duration
     */
    this.print = function() {
	if( window.console ) window.console.log ( this.toString() );
    }
}
