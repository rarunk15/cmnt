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
includeFile( translit_base + "ieform.js" );

/**
 * represents a HTML area that renders content in a certain language. The content
 * @param translator		the language specific translator
 * @param parent		the HTML element under which the test area is
 *				created
 */
function LanguageSpecificArea(translator, rowSelectCallback, parent, fontFamily, fontSize) 
{
    this.getTranslator = function() {
	return this.fTranslator;
    }
    this.getEntireText = function() {
	var ret = "";
	for(var i = 0; i < this.fRows.length; i++) {
	    if( i != 0 ) ret += "<br>\n";
	    ret += this.fRows[i];
	}
	return ret;
    }

    this.selectRow = function(rowIdx) {
	if( rowIdx >= 0 && rowIdx < this.fRows.length ) {
	    this.highlightRow(this.fCurRow, false);
	    this.fCurRow = rowIdx;
	    this.fCurCell = this.fTable.rows[this.fCurRow].cells[1];
	    this.highlightRow(this.fCurRow, true);
	}
    }

    this.addRow = function() {
	this.highlightRow(this.fCurRow, false);
	this.fTable.insertRow(this.fTable.rows.length);
	this.fRows[this.fRows.length] = "";
	var tr = this.fTable.rows[this.fTable.rows.length-1];
	this.fCurRow  = this.fTable.rows.length-1;
	var td = tr.insertCell(0);
	td.appendChild(document.createTextNode( this.fTable.rows.length ));
	//td.style.borderRight = "thin solid #000000";
	td.style.color = "rgb(128,80,0)";
	td.style.overflow = "hidden";
	//td.style.paddingRight = "4px";
	td.style.width = "1.5em";
	td.onclick = this.rowClick;
	td.style.cursor = "pointer";
	td.fRowSelectCallback = this.fRowSelectCallback;

	this.fCurCell = tr.insertCell(1);
	this.fCurCell.style.padding = "0 0 0 0";
	this.fCurCell.style.paddingLeft = "2px";
	this.fCurCell.style.margin = "0 0 0 0";

	var c = document.createElement( "div" );
	c.style.padding = "0 0 0 0";
	c.style.margin = "0 0 0 0";
	//c.style.wordWrap = "break-word";
	c.style.display = "inline";
	c.style.width = "100%";
	this.fCurCell.appendChild(c);
	c.onmouseover = this.rowHoverEnter;
	c.onmouseout  = this.rowHoverExit;
	c.onclick     = this.rowClick;
	c.style.cursor = "pointer";
	c.fRowSelectCallback = this.fRowSelectCallback;

	el = document.createTextNode("\xa0");
	c.appendChild(el);
	this.highlightRow(this.fCurRow, true);
    }

    this.rowUp = function() {
	if( this.fCurCell == null ) return false;
	if( this.fCurRow  == 0 ) return false;
	this.highlightRow(this.fCurRow, false);
	this.fCurRow--;
	this.fCurCell = this.fTable.rows[this.fCurRow].cells[1];
	this.highlightRow(this.fCurRow, true);
    }
    this.rowDown = function() {
	if( this.fCurCell == null ) return false;
	if( this.fCurRow  == (this.fTable.rows.length-1) ) return false;
	this.highlightRow(this.fCurRow, false);
	this.fCurRow++;
	this.fCurCell = this.fTable.rows[this.fCurRow].cells[1];
	this.fCurCell.valign = "top";
	this.highlightRow(this.fCurRow, true);
    }


    /*
    this.serializeNode = function(xparsenode)  {
	if(xparsenode.type == "chardata") {
	    var eng = xparsenode.value;
	    if( eng.indexOf( "<" ) == -1 && this.fTranslator )
		eng = this.fTranslator.translate(eng, true, true);
	    return eng;
	}
	else if( xparsenode.type == "element" ) {
	    var s = "<";
	    s += xparsenode.name;
	    for( var attr in xparsenode.attributes ) {
		s += " ";
		s += attr;
		s += '="';
		s += xparsenode.attributes[attr];
		s += '"';
	    }
	    s += ">";
	    var nchildren = xparsenode.contents.length;
	    for( var ch = 0; ch < nchildren; ch++ ) {
		s += this.serializeNode(xparsenode.contents[ch]);
	    }
	    s += "</";
	    s += xparsenode.name;
	    s += ">";
	    return s;
	}
    }
    */



    this.setText= function(eng) {
	if( this.fCurCell == null ) return;

	var c = this.fCurCell.firstChild;
	var el = c.firstChild;
	this.fRows[this.fCurRow] = eng;
	if( translator )
	    this.fRows[this.fCurRow] = translator.translate(eng, true, true);
	if( eng == "" ) eng = "\xa0";
	//el.nodeValue = eng;

	while( c.firstChild ) {
	    c.removeChild(c.firstChild);
	}
	textToDOM(eng, this.fTranslator, this.fCurCell);
	return true;

	/*
	var root = Xparse(eng);
	if( root == null || this.fTranslator == null ) {
	    c.appendChild(document.createTextNode(eng));
	}	
	else {
	    var l = root.contents.length;
	    for(var i = 0; i < l; i++) {
		transferNode(root.contents[i],c,true,this.fTranslator);
	    }

	    var str = "";
	    l = root.contents.length;
	    for(var i = 0; i < l; i++) {
		str += this.serializeNode(root.contents[i]);
	    }
	    this.fRows[this.fCurRow] = str;

	    //while( root.firstChild ) {
		//var ch = root.firstChild;
//
		//root.removeChild(ch);
		//c.appendChild(ch);
	    //}
	    //this.translateNode(c);
	}
	return true;
	*/
    }

    this.rowHoverEnter = function() {
	//this.style.border = "thin solid";
    }
    this.rowHoverExit = function() {
	//this.style.border = "none";
    }

    this.rowClick = function() {
	if( this.fRowSelectCallback ) {
	    var tr = null;
	    var el = this.parentNode;
	    while(el != null) {
		if( el.tagName.toLowerCase() == "tr" ) {
		    tr = el;
		    break;
		}
		el = el.parentNode;
	    }
	    if( tr == null ) return;
	    var table = null;
	    var el = tr.parentNode;
	    while( el != null ) {
		if( el.tagName.toLowerCase() == "table" ) {
		    table = el;
		    break;
		}
		el = el.parentNode;
	    }
	    if( table == null || !table.rows || !table.rows.length ) return;
	    var rowIdx;
	    for(rowIdx = 0; rowIdx < table.rows.length; rowIdx++) {
		if( table.rows[rowIdx] == tr ) break;
	    }
	    if( rowIdx < table.rows.length )
		this.fRowSelectCallback.onRowSelect(rowIdx);
	}
    }


    this.highlightRow = function(idx, flag) {
	if( idx >= 0 && idx <= this.fTable.rows.length ) {
	    if( flag ) {
		this.fTable.rows[idx].style.color = "#000080";
		this.fTable.rows[idx].cells[0].style.fontWeight = "bold";

		var divBot = this.fParent.offsetTop + this.fParent.offsetHeight;
		var myBot  = this.fTable.offsetTop + this.fTable.rows[idx].cells[0].offsetTop +
					this.fTable.rows[idx].cells[0].offsetHeight;
		myBot += this.fParent.offsetTop;
		//if( myBot > divBot ) {
		    this.fParent.scrollTop = this.fTable.rows[idx].cells[0].offsetTop;  
		//}
	    }
	    else {
		this.fTable.rows[idx].style.color = "";
		//this.fTable.rows[idx].style.border = "none";
		this.fTable.rows[idx].cells[0].style.fontWeight = "normal";
	    }
	}
    }

    this.clear = function() {
	this.fRows = new Array();
	this.fCurRow = -1;
	while( this.fTable.rows.length > 0 ) 
	    this.fTable.deleteRow(0);
    }

    this.fRows = new Array();
    this.fCurRow = -1;
    this.fFontSize = fontSize;
    this.fFontFamily = fontFamily;

    this.fTable = document.createElement("table");
    this.fTable.style.width = "100%";
    this.fTable.style.borderCollapse = "collapse";
    if( this.fFontSize )
	this.fTable.style.fontSize   = this.fFontSize;
    if( this.fFontFamily )
	this.fTable.style.fontFamily   = this.fFontFamily;
    parent.appendChild(this.fTable);
    this.fParent = parent;
    this.fRowSelectCallback = rowSelectCallback;
    this.fTranslator = translator;
}

function CMTransliterationTestBedDefn() 
{
    this.onRowSelect = function(row) {
	this.selectRow(row);
    }

    this.selectRow = function(row) {
	if( row >= 0 && row <= this.fRows.length ) {
	    this.fCurRow = row;
	    this.fInputElement.value = this.fRows[this.fCurRow];
	    for(var i = 0; i < this.fLangAreas.length; i++)
		this.fLangAreas[i].area.selectRow(row);
	    this.fInputElement.focus();
	}
    }

    this.getEntireRawText = function() {
	var ret = "";
	for(var i = 0; i < this.fRows.length; i++) {
	    if( i != 0 ) ret += "\n";
	    ret += this.fRows[i];
	}
	return ret;
    }

    this.importText = function(txt) {
	this.fRows = new Array();
	this.fCurRow = -1;
	for(var i = 0; i < this.fLangAreas.length; i++ )
	    this.fLangAreas[i].area.clear();
	var cr = -1; nl = -1;
	var idx = 0;
	var s;
	var l = 2;
	while(true) {
	    nl = txt.indexOf( "\r\n", idx);
	    if( nl >= 0 )
		l = 2;
	    else {
		l = 1;
		nl = txt.indexOf( "\n", idx);
	    }
	    if( nl < 0 )
		s = txt.substring(idx);
	    else
		s = txt.substring(idx,nl);
	    this.onNewRow();
	    this.onChange(s);
	    if( nl < 0 ) break;
	    else idx = nl + l;
	}
	this.selectRow(0);
    }

    this.getEntireText = function(lang, asHTMLEntities) {
	if( lang == null ) return this.getEntireRawText();
	var l = lang.toLowerCase();
	var t = null;
	for(var i = 0; i < this.fLangAreas.length; i++ ) {
	    if( this.fLangAreas[i].language == l ) {
		t = this.fLangAreas[i].area.getEntireText();
	    }
	}
	if(t == null)
	    return "internal error: cannot locate contents of language '" + lang + "'";
	if( asHTMLEntities )  {
	    var l = t.length;
	    var ret = "";
	    var ch, cc;
	    for(var j = 0; j < l; j++) {
		cc = t.charCodeAt(j);
		ch = t.charAt(j);
		//if( ch == ' ' )
		    //ret += "&sp;";
		//else if( ch == '>' )
		    //ret += "&gt;";
		//else if( ch == '<' )
		    //ret += "&lt;";
		//else if( ch == '&' )
		    //ret += "&amp;";
		if( cc < 128 )
		    ret += ch;
		else {
		    ret += escape(ch).replace( /%u/, "&#x") + ";";
		}
	    }
	    return ret;
	}
	else return t;
    }

    this.init = function(ieformid) {
	var t = document.getElementById("tamil");
	var k = document.getElementById("kannada");
	var tl = document.getElementById("telugu");
	var e = document.getElementById("english");
	var s = document.getElementById("sanskrit");
	var m = document.getElementById("malayalam");

	this.fInputElement = document.getElementById("input");
	if( this.fInputElement == null || s == null || e == null || t == null || tl == null || k == null || m == null ) {
	    alert("internal error: initialization");
	    return;
	}
	this.fInputElement.fTestBed = this;
	this.fInputElement.value = "";
	i = -1;
	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "sanskrit";
	this.fLangAreas[i].area = new LanguageSpecificArea(new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_SANSKRIT), this, s, this.fFontFamily, "1.25em");
	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "tamil";
	this.fLangAreas[i].area = new LanguageSpecificArea(new TamilTranslator(), this, t, this.fFontFamily, "1em");
	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "kannada";
	//this.fLangAreas[i].area = new LanguageSpecificArea(new KannadaTranslator(), this, k, this.fFontFamily, "20px");
	this.fLangAreas[i].area = new LanguageSpecificArea(new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_KANNADA), this, k, this.fFontFamily, "1.25em");
	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "telugu";
	this.fLangAreas[i].area = new LanguageSpecificArea(new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_TELUGU), this, tl, this.fFontFamily, "1em");

	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "malayalam";
	this.fLangAreas[i].area = new LanguageSpecificArea(new NonTamilBasicTranslator(NonTamilBasicTranslator.prototype.LANG_MALAYALAM), this, m, this.fFontFamily, "1.5em");

	this.fLangAreas[++i] = new Object();
	this.fLangAreas[i].language = "english";
	this.fLangAreas[i].area = new LanguageSpecificArea(null, this, e);

	if( this.isIE()) {
	    this.fInputElement.onkeydown = this.IE_KeyDown;
	    this.fInputElement.onkeyup   = this.IE_KeyUp;
	}
	else {
	    this.fInputElement.setAttribute('onkeyup','this.fTestBed.onKeyUp(event);');
	    this.fInputElement.setAttribute('onkeydown','this.fTestBed.onKeyDown(event);');
	}
	this.onNewRow();
	IEFormInit(ieformid, this)
    }
    this.IE_KeyUp = function() { this.fTestBed.onKeyUp(event); }
    this.IE_KeyDown = function() { this.fTestBed.onKeyDown(event); }

    this.getInputElement = function() { return this.fInputElement; }


    this.onNewRow = function() {
	this.fRows[this.fRows.length] = "";
	this.fCurRow = this.fRows.length-1;
	for(var i = 0; i < this.fLangAreas.length; i++ )
	    this.fLangAreas[i].area.addRow();
	this.fInputElement.value = "";
    }

    this.onRowUp = function() {
	if( this.fCurRow <= 0 ) return;
	this.fCurRow--;
	for(var i = 0; i < this.fLangAreas.length; i++ )
	    this.fLangAreas[i].area.rowUp();
	this.fInputElement.value = this.fRows[this.fCurRow];
    }

    this.onRowDown = function() {
	//alert(this.fCurRow + " vs " +  this.fRows.length );
	if( this.fCurRow >= (this.fRows.length-1) ) return;
	//alert("hi");
	this.fCurRow++;
	for(var i = 0; i < this.fLangAreas.length; i++ )
	    this.fLangAreas[i].area.rowDown();
	this.fInputElement.value = this.fRows[this.fCurRow];
    }

    this.onChange = function(txt) {
	if( this.fCurRow < 0 ) return;
	this.fRows[this.fCurRow] = txt;
	for(var i = 0; i < this.fLangAreas.length; i++ )
	    this.fLangAreas[i].area.setText(txt);
    }

    this.isIE = function() {
	var userAgent = navigator.userAgent.toLowerCase();
	if( userAgent.indexOf("msie") >= 0 ) {
		return true;
	    return false;
	}
    }

    this.getCharFromEvent = function(e) {
	var cc = 0;
	if( e && e.which ) cc = e.which; // NS
	else if( e.keyCode ) cc = e.keyCode;
	return cc;
    }

    this.onKeyDown = function(event) {
	var cc = this.getCharFromEvent(event);
	var handled = false;
	if( cc == 9 || cc == 13 ) {
	    this.onRowDown();
	    handled = true;
	    //this.fInputElement.value = "";
	}
	if( handled ) {
	    // TODO: IE only, others require stopDefault, stopPropagation
	    event.returnValue = false;
	    if( event.stop )
		event.stop();
	    if( event.preventDefault )
		event.preventDefault();
	    if( event.stopPropagation )
		event.stopPropagation();
	    return false;
	}
	return true;
    }

    this.onKeyUp = function(event) {
	var cc = this.getCharFromEvent(event);
	var handled = false;
	if( cc == 38 ) {
	    this.onRowUp();
	    handled = true;
	}
	else if( cc == 40 ) {
	    this.onRowDown();
	    handled = true;
	}
	if( handled ) return true;
	this.onChange(this.fInputElement.value);
	return true;
    }

    this.setSanskritAnuswara = function( anuswara ) {
	for(var i = 0; i < this.fLangAreas.length; i++) {
	    if( this.fLangAreas[i].language == "sanskrit" ) {
		var t = this.fLangAreas[i].area.getTranslator();
		if( t && t.setSanskritAnuswaraOption(anuswara)) {
		    this.fLangAreas[i].area.clear();
		    for(var j = 0; j < this.fRows.length; j++) {
			this.fLangAreas[i].area.addRow();
			this.fLangAreas[i].area.setText(this.fRows[j]);
		    }
		    this.fLangAreas[i].area.selectRow(this.fCurRow);
		}
	    }
	}
    }

    this.setTamilQualScheme = function( tamilQualScheme ) {
	for(var i = 0; i < this.fLangAreas.length; i++) {
	    if( this.fLangAreas[i].language == "tamil" ) {
		var t = this.fLangAreas[i].area.getTranslator();
		if( t && t.setQualScheme(tamilQualScheme)) {
		    this.fLangAreas[i].area.clear();
		    for(var j = 0; j < this.fRows.length; j++) {
			this.fLangAreas[i].area.addRow();
			this.fLangAreas[i].area.setText(this.fRows[j]);
		    }
		    this.fLangAreas[i].area.selectRow(this.fCurRow);
		}
	    }
	}
    }

    this.fLangAreas = new Array();
    this.fFontFamily = "Arial Unicode MS,Lucida Sans Unicode";
    //this.fFontFamily = "Akshar Unicode, Arial Unicode MS, Lucida Sans Unicode";
    this.fRows = new Array();
    this.fCurRow = -1;

}
// global singleton
//var CMTransliterationTestBed = new CMTransliterationTestBedDefn();
