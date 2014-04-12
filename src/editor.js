var editorCodeBase = "";
function isDefined(variable)
{
    return eval( '(typeof(' + variable + ') != "undefined");' );
}
if(isDefined('codeBase')) editorCodeBase = codeBase;
var sliderCodeBase = editorCodeBase + "src/l_and_f/slider/";
function includeFile(file) {
    document.write( '<script type="text/javascript" src="' + file + '"></script>' );
}
function includeStyleSheet(file, media) {
    document.write('<link rel="stylesheet" type="text/css" media="' + media + '" href="' + file + '"/>');
}

// translators - temporary paths!

var isOpera = ((navigator.userAgent.toLowerCase().indexOf("opera") >= 0 ) ? true : false);
var isSafari = ((navigator.userAgent.toLowerCase().indexOf("safari") >= 0 ) ? true : false);
var doCodePress = false; // (!isSafari && !isOpera);

if( doCodePress )
    includeFile(editorCodeBase + "../../codepress/codepress.js" );
else
    includeFile(editorCodeBase + "../../codepress/languages/cmne.js" );

var Language = new Object();

includeStyleSheet(editorCodeBase + "dhtmlxToolbar/dhtmlxtoolbar.css", "screen")
includeFile(editorCodeBase + "dhtmlxToolbar/dhtmlxprotobar.js");
includeFile(editorCodeBase + "dhtmlxToolbar/dhtmlxtoolbar.js");
includeFile(editorCodeBase + "dhtmlxToolbar/dhtmlxcommon.js");

// TODO: this seems different from svn src and web (needs ../../)
includeFile(editorCodeBase + "cmtranslit/cmtranslit_base.js" );
includeFile(editorCodeBase + "cmtranslit/kt.js" );
includeFile(editorCodeBase + "cmtranslit/tamil.js" );
includeFile(editorCodeBase + "cmtranslit/english.js" );
includeFile(editorCodeBase + "cmtranslit/diacritics.js" );

includeFile(editorCodeBase + "src/model.js");
includeFile(editorCodeBase + "src/view.js");
includeFile(editorCodeBase + "src/audio.js");
includeFile(editorCodeBase + "src/l_and_f/toolbar.js");
includeFile(editorCodeBase + "src/l_and_f/menu.js");
includeFile(editorCodeBase + "src/l_and_f/fonts.js");
includeFile(editorCodeBase + "src/l_and_f/gamakas.js");
includeFile(editorCodeBase + "src/l_and_f/assistform.js");
includeFile(editorCodeBase + "src/l_and_f/swaratoolbar.js");
includeFile(sliderCodeBase + "slider.js");
includeStyleSheet(editorCodeBase + "src/l_and_f/screen.css", "screen");
includeStyleSheet(editorCodeBase + "src/l_and_f/print.css", "print");
includeStyleSheet(sliderCodeBase + "style.css","screen");
includeFile(editorCodeBase + "src/wiky.js");
//includeFile(editorCodeBase + "src/QTObjectEmbed/qtobject.js");
//includeFile(editorCodeBase + "src/AC_QuickTime.js");

function loadEditor(xmlNodeName) {
	var o = initEditor(document.body, xmlNodeName);

	//var e = new FCKeditor('rawContents');
	//e.BasePath = "fckeditor/";
	//e.ReplaceTextarea();

	//var e = FCKeditorAPI.GetInstance("rawContents");
	//e.EditorWindow.parent.FCK.ToolbarSet._ChangeVisibility(true);


	if( doCodePress ) {
	    CodePress.run();
	    var c = document.getElementById("rawContents_cp").previousSibling;	// for IE (too)
	    if(c.attachEvent)  {
		c.attachEvent('onload',onEditorInitialized);
	    }
	    else 
		c.addEventListener('load',onEditorInitialized,false);

	    return o;
	}
}

function mySnippets()
{
}

function hideCombo()
{
	var o = document.getElementById("combo")
	if( o ) o.style.display = "none";
	Utils.setOpacity(document.getElementById("others"),1.0);
}

function getSnippets(directive)
{
    var val = directive.toLowerCase();
    var doc = null;
    if( doCodePress )
	doc = rawContents.contentWindow.document;
    else
	doc = document;
    if( val.match( "heading\s*:" )) {
	    return doc.CMNE_Heading_Snippets;
    }
    if( val.match( "tala\s*:" )) {
	    return doc.CMNE_Tala_Snippets;
    }
    else if( val.match( "speedmarks\s*:" )) {
	    return doc.CMNE_SpeedMarks_Snippets;
    }
    else if( val.match( "layout\s*:" )) {
	    return doc.CMNE_Layout_Snippets;
    }
    else if( val.match( "phraseends\s*:" )) {
	return doc.CMNE_PhraseEnds_Snippets;
    }
    else if( val.match( "gati\s*:" )) {
	return doc.CMNE_Gati_Snippets;
    }
    else if( val.match( "orientation\s*:" )) {
	return doc.CMNE_Orientation_Snippets;
    }
    else if( val.match( "language\s*:" ) || val.match("languagefont\s*:")) {
	    return doc.CMNE_LanguageDir_Snippets;
    }
    return  doc.CMNE_Language.snippets;
}

function onEditorInitialized()
{
    if( !doCodePress ) {
	return;
    }
	
    var ed =  document.getElementById("rawContents_cp").previousSibling.contentWindow.CodePress;	// for IE (too)
    ed.oldsnippets = ed.snippets; 
    ed.snippets = function(evt) {
	var rawContents =  document.getElementById("rawContents_cp").previousSibling;	// IE (too)
	var snippets_sv = rawContents.contentWindow.document.CMNE_Language.snippets;
	var range;
	var node;
	if( rawContents.contentWindow.document.selection ) {	// IE
	    range = rawContents.contentWindow.document.selection.createRange();
	    node = range.item ? range.item(0) : range.parentElement();
	}
	else {
	    range = rawContents.contentWindow.getSelection().getRangeAt(0);
	    node = range.endContainer;			
	}

	while(node.parentNode != null && node.parentNode.tagName 
			&& node.parentNode.tagName.toLowerCase() != "pre")
	    node = node.parentNode;
	var brNode = null;
	var props = "";
	while( node.previousSibling ) {
	    if(node.previousSibling.tagName && (node.previousSibling.tagName.toLowerCase() == "br" ||
	    					node.previousSibling.tagName.toLowerCase() == "p" ))	// for IE
	    	break;
	    node = node.previousSibling;
	}
	while( node.tagName )
	    node = node.firstChild;
	if( node && node.nodeValue )
	    rawContents.contentWindow.document.CMNE_Language.snippets = getSnippets(node.nodeValue());
	var w = this.getLastWord();
	var map = new Array();
	if( w == "") {
	    var o = document.getElementById("combo")
	    if( o.firstChild )
		o.removeChild(o.firstChild);
	    var s = document.createElement("select");
	    var op = document.createElement("option");
	    var snippets = rawContents.contentWindow.document.CMNE_Language.snippets;
	    for( i = 0; i < snippets.length; i++ ) {
		var so = snippets[i];
		var j;
		for( j = 0; j < map.length; j++ ) {
		    if( map[j] == so.output )
			break;
		}
		if( j == map.length )
		    map[map.length] = so.output;
	    }
	    for( i = 0; i < map.length; i++ )
		s.appendChild( new Option( map[i] ) );
	    o.appendChild(s);
	}
	else {
	    var snippets = rawContents.contentWindow.document.CMNE_Language.snippets;
	    for( i = 0; i < snippets.length; i++ ) {
		if( snippets[i].input == w ) {
		    var so = snippets[i];
		    var j;
		    for( j = 0; j < map.length; j++ ) {
			if( map[j] == so.output )
			    break;
		    }
		    if( j == map.length )
			map[map.length] = so.output;
		}	
	    }
	}

	if( map.length > 1 ) {
	    if( map.length > 5 )
		s.size = 5;
	    else
		s.size = map.length;
	    var trow = document.getElementById("myrow");
	    var tbl  = document.getElementById("mytable");
	    o.style.left    = evt.clientX; // n.offsetLeft + rawContents.contentWindow.offsetLeft;
	    o.style.top    =  evt.clientY; // trow.offsetTop + n.offsetTop ;
	    o.style.display = "block";
	    s.onblur = hideCombo;
	    s.focus();
	    Utils.setOpacity(document.getElementById("others"),0.5);
	    if( evt.preventDefault )
		evt.preventDefault(); // prevent the tab key from being added
	    return;
	}
	rawContents.editor.oldsnippets(evt);
	rawContents.contentWindow.document.CMNE_Language.snippets = snippets_sv;
    }
}

function unloadEditor() {
    cleanupEditor();
    window.document.body.onload = null;
    window.document.body.onunload = null;
}
