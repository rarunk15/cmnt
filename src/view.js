/**
 * @fileoverview
 * view.js contains objects that make up the view archirecture of the swara
 * editor. This includes {@link SongView}, which represents how the song is 
 * rendered, which is made up of a list of pages {@link PageView}. Each page
 * is made up of a list of page view parts, which can be headings {@link 
 * HeadingView}, a row of swaras or lyrics {@link SwaraLyricRowView}, song 
 * breaks {@link BreakView}. 
 * <p>
 * A {@link SwaraLyricRowView} that is a row of swaras, is made up row view 
 * parts, which can be swaras ({@link Swara}), tala markers ({@link TalaMarkerView}) 
 * and spacers ({@link SpacerView}). A {@link SwaraLyricRowView} that is a row of 
 * lyrics, is made up row view parts, which can be lyrics ({@link Lyric}), and 
 * spacers ({@link SpacerView}).
 */

/**
 * one and only song view
 * @type SongView
 */
var theSongView = null;			/* one and only song view */

var NO_PAGINATION = true;

/**
 * use some padding on top of swara rows?
 */
var useTopPadForSwaras = true;		

/**
 * do notations span entire page width?
 */
var spanNotationTableEntireWidth = true; 

/**
 * always reserve space for gamaka row? 
 * <p>
 * This is false and should probably always remain so
 */
var alwaysGamakas = false;	// always reserve space for gamaka row?

/**
 * when always rendering gamakas, the height of gamaka row by default
 */
var GAMAKA_HEIGHT_DEFAULT = 10;

var FLEXIBLE_WIDTH = false;


/**
 * part types of parts that make up a {@link PageView}
 */
function PAGEVIEWPART_TYPE() {
}

/**
 * a part that represents the view of a heading
 * @final
 * @type int
 */
PAGEVIEWPART_TYPE.prototype.HEADING   =  1;
/**
 * a part that represents the view of a swara row
 * @final
 * @type int
 */
PAGEVIEWPART_TYPE.prototype.SWARAROW  =  2;
/**
 * a part that represents the view of a lyric row
 * @final
 * @type int
 */
PAGEVIEWPART_TYPE.prototype.LYRICROW  =  3;
/**
 * a part that represents the view of a break
 * @final
 * @type int
 */
PAGEVIEWPART_TYPE.prototype.SONGBREAK =  4;

/**
 * a part that represents the view of a COLUMN GUIDE
 * @final
 * @type int
 */
PAGEVIEWPART_TYPE.prototype.COLUMNGUIDE =  5;

// convience macros for page view parts
var PAGEVIEWPART_HEADING   =  PAGEVIEWPART_TYPE.prototype.HEADING;
var PAGEVIEWPART_SWARAROW  =  PAGEVIEWPART_TYPE.prototype.SWARAROW;
var PAGEVIEWPART_LYRICROW  =  PAGEVIEWPART_TYPE.prototype.LYRICROW;
var PAGEVIEWPART_BREAK     =  PAGEVIEWPART_TYPE.prototype.SONGBREAK;
var PAGEVIEWPART_COLUMNGUIDE     =  PAGEVIEWPART_TYPE.prototype.COLUMNGUIDE;

/**
 * part types of parts that make up a {@link SwaraLyricRowView}
 */
function ROWVIEWPART_TYPE() {
}

/**
 * a part that represents the view of a swara
 * @final
 * @type int
 */
ROWVIEWPART_TYPE.prototype.SWARA       = 20;
/**
 * a part that represents the view of a lyric
 * @final
 * @type int
 */
ROWVIEWPART_TYPE.prototype.LYRIC      = 21;
/**
 * a part that represents the view of a tala marker
 * @final
 * @type int
 */
ROWVIEWPART_TYPE.prototype.TALAMARKER = 22;
/**
 * a part that represents the view of a spacer
 * @final
 * @type int
 */
ROWVIEWPART_TYPE.prototype.SPACER     = 23;
/**
 * a part that represents the view of a spacer that can be used to add swaras
 * @final
 * @type int
 */
ROWVIEWPART_TYPE.prototype.NEWSWARASPACER     = 24;

// convenience macros for row view parts
var ROWVIEWPART_SWARA	   = ROWVIEWPART_TYPE.prototype.SWARA;
var ROWVIEWPART_LYRIC      = ROWVIEWPART_TYPE.prototype.LYRIC;
var ROWVIEWPART_TALAMARKER = ROWVIEWPART_TYPE.prototype.TALAMARKER;
var ROWVIEWPART_SPACER     = ROWVIEWPART_TYPE.prototype.SPACER;
var ROWVIEWPART_NEWSWARASPACER     = ROWVIEWPART_TYPE.prototype.NEWSWARASPACER;


/**
 * @class
 * represents utility functions e.g. those related to browser specific
 * code
 */
function UtilFunctions() 
{

    /**
     * is the browser IE?
     * @return true or false indicating if browser is IE
     * @type boolean
     */
    this.isIE = function() { return this.fIsIE; }

    /**
     * is the browser Safari?
     * @return true or false indicating if browser is Safari
     * @type boolean
     */
    this.isSafari = function() { return this.fIsSafari; }

    /**
     * is the browser Opera?
     * @return true or false indicating if browser is Opera
     * @type boolean
     */
    this.isOpera = function() { return this.fIsOpera; }

    /**
     * is the browser firefox?
     * @return true or false indicating if browser is firefox
     * @type boolean
     */
    this.isFirefox = function() { return this.fIsFirefox; }

    /**
     * given an event received by a keyboard input handler, get the character
     * @param {Event} e		event received by a keyboard input handler
     *
     * @return the character code of the character corresponding to the key
     * @type int
     */
    this.getCharFromEvent = function(e)
    {
	var cc = 0;
	if( e && e.which ) cc = e.which; // NS
	else if( e.keyCode ) cc = e.keyCode;
	return cc;
    }

    /**
     * insert/add a cell to table-row (method used depends on browser since
     * safari doesnt like the method that seems kkosher and works on both
     * firefox and IE - particularly if you have contents))
     *
     * @param 	{DOMElement_TR}  tr		the table row DOM element
     * @param   {DOMElement} contents 	object to add inside the td (null for no obj)
     * @param   {int} nCols	the column span
     * @param   {int} cellidx	the cell index (optional - add to end if not
     *				provided)
     */
    this.addTableCell = function(tr, contents, nCols, cellidx ) {
	if( cellidx == null ) cellidx = tr.cells.length;
	var td;
	// on safari, we create a td independently, insert the
	// contents and THEN append to tr - if we try the
	// insertCell approach it doesnt work well. For IE
	// only insertCell works. Firefox seems fine with
	// either.
	if( this.isSafari() ) {
	    td = document.createElement("td"); 
	    td.colSpan = nCols;
	    if( contents ) td.appendChild(contents);
	    if( !cellidx ) 
		tr.appendChild(td);
	    else
	    	tr.insertBefore(td,tr.cells[cellidx])
	}
	else {
	    td = tr.insertCell(cellidx);
	    td.colSpan = nCols;
	}
	if( !this.isSafari() )
	    if( contents ) td.appendChild(contents);
	return td;
    }

    /**
     * set the opacity
     * @param {DOMElement} elem	the element whose opacity should be set
     * @param {float} 	val 	a value between 0 and 1.0
     */
    this.setOpacity = function(elem, val) {
	if( this.isSafari() && val >= 1.0)
	    val = 0.999999;
	if( this.isIE() ) {
	    elem.style.filter = "alpha(opacity=" + parseInt(val*100) + ")";
	}
	else
	    elem.style.opacity = val;
    }

    /**
     * represents the user agent string (browser)
     * @private
     */
    this.userAgent = navigator.userAgent.toLowerCase();
    this.fIsIE = ((this.userAgent.indexOf("msie") >= 0 ) ? true : false);
    this.fIsSafari = ((this.userAgent.indexOf("safari") >= 0 ) ? true : false);
    this.fIsOpera = ((this.userAgent.indexOf("opera") >= 0 ) ? true : false);
    this.fIsFirefox = ((this.userAgent.indexOf("firefox") >= 0 ) ? true : false);

    /**
     * find a child node whose className is className
     * @type DOMElement
     */
    this._findNodeByClass = function(node, className) {
	if(!node ) return null;
	if( node.className && node.className == className)
	    return node;
	else if( !node.hasChildNodes || !node.hasChildNodes() )
	    return null;

	var c = node.firstChild;
	var n;
	while(c) {
	    n = this._findNodeByClass(c, className);
	    if( n ) return n;
	    c = c.nextSibling;
	}
	return  null;
    }

    /**
     * get the id map
     */
    this.getIdMap = function() { return this.fIdMap; }

    /**
     * get a new id for use in id-store of category "base"
     * @param	{String} base	category
     */
    this.getNewId = function( base ) {
	var o = this.fIdStore[base];
	if(o == null)
	    this.fIdStore[base] = 0;
	else
	    this.fIdStore[base] = o+1;
	o = this.fIdStore[base];
	return base + "_ " + o;
    }

    /**
     * add a dom-id <=> object element to the id store
     */
    this.addToIdMap = function(dom, obj) {
	if(dom.id)
	{
	    var o = new Object();
	    o.dom = dom;
	    o.obj = obj;
	    this.fIdMap[dom.id] = o;
	}
    }

    /**
     * given a dom elem, remove the associated dom-id <=> object element
     * from the id map
     */
    this.removeFromIdMap = function(dom)  {
	if(dom.id) {
	    this.removeFromIdMap2(dom.id);
	}
    }

    /**
     * given a dom id, remove the associated dom-id <=> object element
     * from the id map
     */
    this.removeFromIdMap2 = function(id)  {
	if(id) {
	    var o = this.fIdMap[id];
	    if( o ) this.fIdMap[id] = null;
	}
    }

    /**
     * get the view/related object for a dom elem if any by looking up
     * the dom-id <=> object id store
     */
    this.getObjForId = function(dom) {
	if(dom.id) {
	    var o = this.fIdMap[dom.id];
	    if( o ) return o.obj;
	}
	else
	    return null;
    }

    /**
     * clear the id store and id map that maintains map between DOM element ids
     * and view and related objects
     */
    this.clearIdStore = function() {
	if(this.fIdMap) {
	    var nMap = this.fIdMap.length;
	    for ( var i = 0; i < nMap; i++ ) {
		var o = this.fIdMap[o];
		if(o ) {
		    o.dom = null;
		    o.obj = null;
		}
	    }
	}
	this.fIdStore = new Array();
	this.fIdMap   = new Array();
    }

    /**
     * the id category store
     * @type String[]
     * @private
     */
    this.fIdStore = new Array();

    /**
     * the map of dom-id <=> view/related objects
     * @private
     */
    this.fIdMap   = new Array();

}
var Utils =  new UtilFunctions();

/**
 * get the # of mathrais of of swara of 'n' parts, where each part is of
 * a certain speed in a certain gati
 *
 * @param tala		the tala
 * @param length	the number of parts in swara (e.g. "sa" is two parts, but
 *			"s" is one part)
 *
 * @param length	the number of parts in swara (e.g. "sa" is two parts, but
 *			"s" is one part)
 * @param speed		the speed of each part, 0 is first, 1 is second, 2 is third
 * @param {GATI} gati	the gati
 *
 * @return the  # of mathrais in the swara 
 * @type int
 */
function getMathrais(tala,length, speed, gati) {
    /*
     * accounting for a fastest speed = 3.
     * "Shortest" mathrai is "at speed 3" and returned value is # of mathrais
     * at that speed.
     *
     * At speed = 3, a swara of length "n" has "n" mathrais.
     * At speed = 2, each swara is "2 mathrais at speed 3" so 2*n
     * At speed = 1, each swara is "4 mathrais at speed 4" so 4*n
     * At speed = 0, each swara is 4*gati*n. For n =1, in catusra this is 8, 
     * tisra it is 12, khanda it is 20 etc. (yes tisra may be should be 6, 
     * khanda 10, misra 14 but the way it is now, they are twice that)
     */
    if( speed == 0 ) return 4*gati*length;
    else if( speed == 1 ) return 4*length; // return 2*gati*length; // gati;
    else if( speed == 2 ) return 2*length; // return gati*length;
    /* speed == 3 */
    else return length;
}

/**
 * get the span (# of columns) of a swara in a certain speed in
 * a certain gati
 * @param length	the number of mathrais
 * @param speed		the speed of each mathrai, 0 is first, 1 is second, 2 is third
 * @param {GATI} gati	the gati
 *
 * @return the span (# of columns) the swara would take up in a table row
 * @type int
 */
function getSpan(length, speed, gati) {
    return 1;
    // a bit tricky. We are allocating spans for double-speed 
    // This means a quadruple-speed swara occupies 1 column,
    // a double-speed swara occupies 2 columns, but a whole-note
    // occupies NOT 4 columns but 2*gati columns
    //if( speed == 0 ) return 2*gati*length;
    //else if( speed == 1 ) return 2*length; // gati;
    //else if( speed == 2 ) return 1*length;
}

/**
 * @class
 * notation selection listener - it has opportunity to listen for notation selections
 */
function NotationSelectionListener() 
{
    /**
     * called when the selection changes in the song view
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * @param {object}	 oldSelection	previous selection (a selectable part in song-view)
     */
    this.onSelectionChange = function(songView, curSel, oldSel) {}
}

/**
 * @class
 * notation selection controller - it has opportunity to run some
 * logic when selection changes
 */
function NotationSelectionController() 
{
    /**
     * called when the selection changes in the song view
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * @param {object}	 newSelection	new selection (a selectable part in song-view)
     * @return {object} the object that should be selected, which need not be the
     *                  same as passed in newSelection
     */
    this.preSelectionChange = function(songView, curSelection, newSelection) {
	return newSelection;
    }

}

/**
 * @class
 * default global notation selection controller - it does nothing except pass on
 * control to a delegate controller, registered via 
 * {@link DefaultNotationSelectionControllerDefn#setDelegate}
 */
function DefaultNotationSelectionControllerDefn()
{
    /** 
     * set the delegate that will be the selection controller
     * @param {NotationSelectionController}	delegate	the selection controller
     */
    this.setDelegate = function(delegate) {
	this.fDelegate = delegate;
    }

    /**
     * implementation of {@link NotationSelectionController#preSelectionChange}, which
     * passes control to delegate, if there is one
     */
    this.preSelectionChange = function(songView, curSelection, newSelection) {
	if( this.fDelegate ) {
	    return this.fDelegate.preSelectionChange(songView, curSelection, newSelection)
	}
	return newSelection;
    }

    /**
     * add a selection listener
     * @param {NotationSelectionListener} listener	listener
     */
    this.addListener = function(listener) {
	if( listener.onSelectionChange ) {
	    this.fListeners[this.fListeners.length]  = listener;
	    return true;
	}
	return false;
    }

    /**
     * called when the selection changes in the song view, which is informed to all
     * listeners
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * @param {object}	 oldSelection	previous selection (a selectable part in song-view)
     * 
     */
    this.onSelectionChange = function(songView, curSel, oldSel) 
    {
	var nListeners = this.fListeners.length;
	for( var i = 0; i < nListeners; i++ )
	    this.fListeners[i].onSelectionChange(songView, curSel, oldSel);
    }

    /**
     * called when the an already selected object is selected again (e.g. click on 
     * the already selected object), which is informed to all listeners
     *
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * 
     */
    this.onReselect = function(songView, curSel) 
    {
	var nListeners = this.fListeners.length;
	for( var i = 0; i < nListeners; i++ )
	    this.fListeners[i].onReselect(songView, curSel);
    }
    /**
     * selection listener list
     * @type NotationSelectionListener[]
     */
    this.fListeners = new Array();

    /**
     * the delegate that will be the actual selection controller
     * @type {NotationSelectionController}
     * @private
     */
    this.fDelegate = null;
}

/*
 * default notation controller which delegates to the "real controller"
 */
DefaultNotationSelectionController = new DefaultNotationSelectionControllerDefn();

/**
 * @class
 * notation edit mode controller
 */
function NotationEditModeControllerDefn() 
{
    this.fInsertMode = false;
    this.fEditingInserted = null;

    /**
     * are we in insert mode?
     * @type boolean
     */
    this.insertMode = function() {
	return this.fInsertMode;
    }

    /**
     * get the object that holds information about what we
     * should insert when user takes approp action in
     * insert mode
     * @type object
     */
    this.insertModeObj = function() {
	return this.fInsertModeObj;
    }

    /**
     * set/unset insert mode - this nulls out any insert mode obj and
     * also cancels the "editing inserted object" flag
     * @param val boolean
     */
    this.setInsertMode = function(val) {
	this.fInsertMode = val;
	this.fInsertModeObj  = null;
	this.fEditingInserted  = null;
    }

    /**
     * set insert mode obj, which is valid only if in insert mode. This also 
     * cancels the "editing inserted object" flag
     * @param obj get the object that will hold information about what we
     * 		  should insert when user takes approp action in
     * @return true on success, false on failure (not in insert mode)
     */
    this.setInsertModeObj = function(obj) {
	if( !this.fInsertMode ) return false;
	this.fInsertModeObj  = obj;
	this.fEditingInserted  = false;
	return true;
    }

    /**
     * get the currently inserted obj being edited if any
     * @type RowViewPart
     */
    this.editingInserted = function() {
	return this.fEditingInserted;
    }

    /**
     * set/unset as to whether we are editing the currently inserted obj
     * @param {RowViewPart} the row view part which is being edited (after insertion)
     */
    this.setEditingInserted = function(val) {
	this.fEditingInserted = val;
    }

}
// default notation selection controller
NotationEditModeController = new NotationEditModeControllerDefn();



/**
 * @class
 * base class represents a row view part, which would be part of a {@link SwaraLyricRowView}
 */
function RowViewPart()
{
    /**
     * get the underlying model - there is none by default, derived classes can
     * override this and provide access to the model
     * @return null
     */
    this.getModel = function() { return null; }

    /**
     * is this row view part selectable (the answer is false by default)
     * @return true or false as to whether this row view part is selectable
     * @type boolean
     */
    this.isSelectable = function() { return false; }

    /**
     * get the row view part type
     * @return the row view part type
     * @type ROWVIEWPART_TYPE
     */
    this.partType = function() { return this.fPartType; }

    /**
     * set the background color of this view
     * @param {String} color	the background color as a string one would 
     *				specify in the css style
     */
    this.setBackgroundColor = function(color) { 
	this.fBackgroundColor = color; 
	this.onBackgroundColorChange();
    }

    this.getBackgroundColor = function() { 
	return this.fBackgroundColor; 
    }

    this.resetBackgroundColor = function() { 
	this.fBackgroundColor = "#ffffffff;" 
	this.onBackgroundColorChange();
    }

    /**
     * called when background color changes
     * @protected
     */
    this.onBackgroundColorChange = function() {
	if( this.domid && this.domid != "" )  {
	    var o = document.getElementById(this.domid);
	    o.style.backgroundColor = this.fBackgroundColor;
	}
    }

    /**
     * get the row view of which this view is part of, which is set only when
     * the row view is rendered fully.
     *
     * @return the row view of which this view is part of
     * @type SwaraLyricRowView
     */
    this.rowView = function() { return this.parent; }

    /**
     * get the DOM contents (td) of the view
     * @return the DOM contents of the view
     * @type DOMElement_TD
     */
    this.getContents = function() { return this.fOuter; }

    /**
     * get the table cell index of this view in the row
     * @return the index of the table cell of the view in the row
     * @type int
     */
    this.getCellIndex = function() { return this.fCellIdx; }

    /**
     * get the column span of the table cell for this view
     * @return the column span of the table cell for this view
     * @type int
     */
    this.colspan = function() { return this.fNCols; }

    /**
     * get the dom id of the contents (if any
     */
    this.getDOMID = function() { return this.domid; }


    /**
     * (protected) the row view part type
     * @type ROWVIEWPART_TYPE
     * @private
     */
    this.fPartType = null;

    /**
     * (protected) the outer content (table cell) of the swara view
     * @type DOMElement_TD
     * @private
     */
    this.fOuter         = null;

    /**
     * (protected) the cell index of the table cell for the view
     * @type int
     * @private
     */
    this.fCellIdx       = 0;

    /**
     * (protected) the column span of the table cell for the view
     * @type int
     * @private
     */
    this.fNCols         = 1;

    /**
     * (protected) the table cell  (derived classes should set this appropriately on rendering)
     * @type DOMElement_TD
     * @private
     */
    this.fTableCell = null;

    /**
     * intended to be called when the row view part has been moved to a different row
     * table (typically on repagination)
     * @param td	the cell in the new row to which we moved
     */
    this.movedToCell = function( td ) {
	if(this.fTableCell) Utils.removeFromIdMap(this.fTableCell);
	Utils.addToIdMap(td,this);
	this.fTableCell = td;
	this.fOuter = td;
    }

    /**
     * (protected) the background color of this view as a string one would specify in css style
     * @type String
     * @private
     */
    this.fBackgroundColor = "#ffffff";

    this.domid = "";
}

/**
 * event handler called when mouse is clicked on a (selectable) view
 */
function _labelClicked(obj) {
    if(!obj )
	obj = window.event;
    var view = Utils.getObjForId(this);	// this.view
    if(view && view.labelClicked) view.labelClicked(obj);
    view = null;

    obj.returnValue = false;
    obj.cancelBubble = true;
    if( obj.stop )
	obj.stop();
    if( obj.preventDefault )
	obj.preventDefault();
    if( obj.stopPropagation )
	obj.stopPropagation();
    //obj  = null;
    return false ;
}

/**
 * event handler called when mouse entered a (selectable) view
 */
function _labelHoverEnter(obj) {
    var view = Utils.getObjForId(this);
    if(view && view.labelHoverEnter) view.labelHoverEnter(obj);
    view = null;
    obj  = null;
}

/**
 * event handler called when mouse exited a (selectable) view
 */
function _labelHoverExit(obj) {
    var view = Utils.getObjForId(this);
    if(view && view.labelHoverExit) view.labelHoverExit(obj);
    view = null;
    obj  = null;
}

/**
 * @class
 * base class represents a selectable row view part, which would be part of a {@link SwaraLyricRowView}
 */
function SelectableRowViewPart()
{
    /**
     * is this row view part selectable? The  answer is true for a 
     * selectable row view part
     * @return true or false as to whether this row view part is selectable
     * @type boolean
     */
    this.isSelectable = function() { return true; }

    /**
     * return the next view element in the same row as this one which is selectable
     * @return the next view element in the same row as this one which is selectable
     *         or null if there is no such element
     *
     * @type SelectableRowViewPart
     */
    this.nextSelectable = function() {
	var obj = this.next;
	while( obj != null ) {
	    if( obj != null && obj.isSelectable() )
		break;
	    obj = obj.next;	    
	}
	return obj;
    }

    /**
     * return the previous view element in the same row as this one which is selectable
     * @return the previous view element in the same row as this one which is selectable
     *         or null if there is no such element
     * @type SelectableRowViewPart
     */
    this.prevSelectable = function() {
	var obj = this.prev;
	while( obj != null ) {
	    if( obj != null && obj.isSelectable() )
		break;
	    obj = obj.prev;	    
	}
	return obj;
    }

    /**
     * (protected) are we in insert mode? Derived classes meant to override this to 
     * allow insert mode @return true if insert mode is supported, false otherwise
     * @type boolean
     */
    this.insertMode = function() { return false; }

    /**
     * (protected) while in insert mode, are we still editing the object we just
     * inserted
     */
    this.editingInserted = function() { return false; }

    /**
     * select or deselect this swara
     * @param {boolean} val	true or false indicating if view should be selected or deselected
     */
    this.select = function(val,highlight) {
	this.fSelected = val;
	this.fHighlighted = ((highlight) ? true : false);
	this.updateSelection(highlight);
	if( this.fSelected ) this.onselect();
	return true;
    }

    /**
     * update appearance based on selection change
     */
    this.updateSelection = function() {
	if( this.fSelectableElem ) {
	    if( this.isSelectable() && this.fSelected ) {
		    if( this.editingInserted() ) {
			this.fSelectableElem.style.border = "thin solid #0000ff";	// blue border
			this.fSelectableElem.style.background = LookAndFeel.url("insert-caret.gif") + ' bottom right no-repeat';
		    }
		    else if( this.insertMode() ) {
			this.fSelectableElem.style.border     = "thin solid "+ this.fBackgroundColor;
			this.fSelectableElem.style.background = LookAndFeel.url("insert-caret.gif") + ' bottom left no-repeat';
		    }

		else {
		    if( this.fHighlighted ) {
			this.fSelectableElem.style.border     = "thin solid "+ this.fBackgroundColor;
			this.fSelectableElem.style.background = "yellow";
		    }
		    else {
			this.fSelectableElem.style.border = "thin solid #0000ff";	// blue border
			this.fSelectableElem.style.background = "none";
		    }
		}
	    }
	    else {
		this.fSelectableElem.style.border     = "thin solid "+ this.fBackgroundColor;
		this.fSelectableElem.style.background = "none";
	    }
	}
    }

    /**
     * called when background color changes
     * @protected
     */
    this.baseOnBackgroundColorChange = this.onBackgroundColorChange;
    this.onBackgroundColorChange = function() {
	this.baseOnBackgroundColorChange();
	if( this.fSelectableElem )  {
	    this.fSelectableElem.style.backgroundColor = this.fBackgroundColor;
	    this.updateSelection();
	}
    }

    /**
     * (protected) called when the view is selected - derived classes can override
     * this to implement view specific functionality
     * @private
     */
    this.onselect = function() {
    }

    /**
     * (protected) event handler called when mouse enters this view - derived classes
     * should set this as the hover function for the approp dom elem in the view
     * to provide visual indication that item is selectable
     * @private
     */
    function labelHoverEnter() {
	var view = this; 
	if( view && view.isSelectable() && !view.fSelected && view.fSelectableElem ) {
	    if( view.insertMode()  )
		view.fSelectableElem.style.background = LookAndFeel.url("insert-caret-light.png") + ' bottom left no-repeat';
	    else {
		view.fSelectableElem.style.background = "none";
		view.fSelectableElem.style.border = "thin solid #000000";
	    }
	}
    }
    this.labelHoverEnter = labelHoverEnter;

    /**
     * event handler called when mouse leaves this view
     */
    function labelHoverExit() {
	var view = this;
	if( view && view.isSelectable() && !view.fSelected && view.fSelectableElem ) {
	    view.fSelectableElem.style.background = "none";
	    view.fSelectableElem.style.border = "thin solid " + view.fBackgroundColor;
	}
    }
    this.labelHoverExit = labelHoverExit;

    /**
     * event handler called when mouse is clicked on this view
     */
    function labelClicked(e) {
	if(!e )
	    e = event;
	var view = this;
	if( view && view.isSelectable() ) {
	    if(e.shiftKey == true )
		view.shiftClicked();
	    else if(e.controlKey == true )
		view.controlClicked();
	    else
		view.clicked();
	    //e.cancelBubble = true;
	    //if( e.stopProgapation ) e.stopPropagation();
	}
    }
    this.labelClicked = labelClicked;

    /**
     * called when this view is clicked on by the mouse
     */
    this.clicked = function() {
	var songView = this.rowView().pageView().songView();
	songView.selectObject(this);
    }

    /**
     * called when this view is clicked on by the mouse with shift key down
     */
    this.shiftClicked = function() {
	// default is to treat as a click
	this.clicked();
    }

    /**
     * called when this view is clicked on by the mouse with shift key down
     */
    this.controlClicked = function() {
	// default is to treat as a click
	this.clicked();
    }

    /**
     * set the select mode to "highlight" (as opposed normal => to box around)
     * Should call before initSelectable
     */
    this.setHighlightSelectMode = function(val) {
	    this.fNormalSelectMode = !val;
    }


    /**
     * set the text color of the view
     * @param {String} color	the text color of the view as a string usable
     *				in a css style
     */
    this.setColor = function(color)  {
	this.fColor = color;
	this.oncolorChange();
    }

    /**
     * (protected) called when text color is changed - derived classes can override this
     * @private
     */
    this.oncolorChange = function() {
    }

    /**
     * (protected) derived classes must call this on rendering to enable
     * selectability
     * @param {DOMElement}	the element that is selectable
     * @param {boolean}	   dontSetStyle	   if true, dont set style elem
     */
    this.initSelectable = function(selectableElem, dontSetStyle) {
	//if(!theSongView.isInteractive()) return; // if not interactive, nothing is selected
	this.fSelectableElem       = selectableElem;
	selectableElem.onmousedown = _labelClicked;
	selectableElem.onmouseover = _labelHoverEnter;
	selectableElem.onmouseout  = _labelHoverExit;
	selectableElem.id          = Utils.getNewId("sel"+this.partType());
	Utils.addToIdMap(selectableElem, this);
	// selectableElem.view        = this;
	if(!dontSetStyle) {
	    selectableElem.style.border = "thin solid " + this.fBackgroundColor;
	}
    }

    /**
     * (protected) the DOM element of the content that contains the selectable part (derived classes
     * should set this appropriately on rendering)
     * @type DOMElement
     * @private
     */
    this.fSelectableElem= null;


    /**
     * (protected) the text color of this view as a string one would specify in css style
     * @type String
     * @private
     */
    this.fColor = "#000000";

    this.fNormalSelectMode = true;

}
SelectableRowViewPart.prototype = new RowViewPart();

function SwaraViewHTMLCacheDefn(speedMarkersBelow, fgcolor, bgcolor)
{
    /**
     * populate the cache
     * @param {String} fgcolor text color for swara view elems
     * @param {String} bgcolor background color for swara view elems
     * @param {boolean} markersBelow speed markers above or below?
     */
    this.init = function(fgcolor,bgcolor, markersBelow) {
	this.fCache = new Array();
	var stayis = [ 1, 0, -1 ];		// tara, madya, mandra
	var speeds = [ 3, 2, 1, 0 ];	// 3 lines, 2 lines, 1 line, no line
	var sv = new  SwaraView(markersBelow);
	var cache = this.fCache;
	var speed;
	for(var st = 0; st < 3; st++ ) {
	    var stayi = stayis[st];
	    cache[stayi] = new Array();
	    var ic = cache[stayi];
	    for(var sp = 0; sp < 4; sp++ ) {
		speed = speeds[sp];
		ic[speed] = sv.generateHTML(fgcolor,bgcolor,stayi,speed,markersBelow);
	    }
	}
	return cache;
    }

    /**
     * get an element from cache
     * @param {int}	octave	    octave
     * @param {int}     nspeedlines # of speed lines
     */
    this.get = function(octave, nspeedlines) {
	if(this.fCache) {
	    return this.fCache[octave][nspeedlines];
	}
    }

    /**
     * cache date
     * @private
     */
    this.fCache = null;

    this.init(fgcolor,bgcolor,speedMarkersBelow);
    speedMarkersBelow = null;
    fgcolor = null;
    bgcolor = null
}
/**
 * the swara view HTML cache - used in non-progressive rendering
 */
var SwaraViewHTMLCache = null;

function TalaMarkerViewHTMLCacheDefn(speedMarkersBelow)
{
    /**
     * populate the cache
     * @param {String} bgcolor background color for lyric view elems
     */
    this.init = function(speedMarkersBelow) {
	this.fCache = new Array();
	var rowType = [ true, false ];
	var markers    = [ "", "|", "||" ];
	var tv = new  TalaMarkerView();
	var cache = this.fCache;
	var i;
	var nm = markers.length;
	for(var i = 0; i < 2; i++ ) {
	    var inSwaraRow = rowType[i];
	    cache[inSwaraRow] = new Array();
	    var ic = cache[inSwaraRow];
	    for(var mt = 0; mt < nm; mt++ ) {
		marker = markers[mt];
		ic[marker] = tv.generateHTML(inSwaraRow,marker,speedMarkersBelow);
	    }
	}
	return cache;
    }

    /**
     * cache date
     * @private
     */
    this.fCache = null;

    /**
     * get an element from cache
     * @param {boolean}	inSwaraRow  belongs to swara row?
     * @param {String}  marker	    the marker
     */
    this.get = function(inSwaraRow, marker) {
	if(this.fCache) {
	    return this.fCache[inSwaraRow][marker];
	}
	return null;
    }
    this.init(speedMarkersBelow);
}
/**
 * the tala marker view HTML cache - used in non-progressive rendering
 */
var TalaMarkerHTMLCache = null;

/**
 * @class
 * the lyric view HTML cache
 */
function LyricViewHTMLCacheDefn(bgcolor)
{
    /**
     * populate the cache
     * @param {String} bgcolor background color for lyric view elems
     */
    this.init = function(bgcolor) {
	this.fCache = new Array();
	var cols       = [ 1, -1 ];
	var txts    = [ "", " ", "N" ]; 	// since lyric color (and font) can change, we CANNOT
						// generate cache entries for . and ,
	var lv = new  LyricView();
	var cache = this.fCache;
	var txt;
	var i;
	var nc = cols.length;
	var nt = txts.length;
	for(var i = 0; i < 2; i++ ) {
	    var col = cols[i];
	    cache[col] = new Array();
	    var ic = cache[col];
	    for(var tt = 0; tt < nt; tt++ ) {
		txt = txts[tt];
		ic[txt] = lv.generateHTML(bgcolor, ((txt == "N") ? null: txt), ((col == -1) ? null: col));
	    }
	}
	return cache;
    }

    /**
     * cache date
     * @private
     */
    this.fCache = null;

    /**
     * get an element from cache
     * @param {int} 	cols	column span
     * @param {String} txt	txt of elem (can be null)
     */
    this.get = function(cols, txt) {
	if(this.fCache) {
	    if(cols != 1 ) cols = -1;
	    if(txt != "" && txt != " ")
		txt = "N";
	    return this.fCache[cols][txt];
	}
	return null;
    }
    this.init(bgcolor);
    bgcolor = null;
}

/**
 * the lyric view HTML cache - used in non-progressive rendering
 */
var LyricViewHTMLCache = null;

/**
 * constant that indicates height of DOM element that has a stayi marker
 */
var STAYI_HEIGHT = 3;

/**
 * constant that indicates height of DOM element that has a stayi marker that
 * can be added to a style
 */
var STAYI_HEIGHT_PX = STAYI_HEIGHT + "px;";

/**
 * constant that indicates height of DOM element that has a stayi marker that
 * can be added to a style
 */
var STAYI_HEIGHT_STYLE = "height:" + STAYI_HEIGHT_PX;

/**
 * @class SwaraView
 * represents the view/rendering of a swara.
 * <p>
 * The view is a table-cell (td) in a row represented by {@link SwaraLyricRowView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link SwaraView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is actually done in a few stages: o
 * <ul>
 * <li>A cache {@link SwaraViewHTMLCache} is presumed to be populated with 
 *     "skeletal" content initially (skeletal in that HTML content is 
 *      generated via calls to {@link SwaraView#generateHTML} and maintained
 *      in arrays with place-holders for lyric specific data parts like the 
 *      lyric label etc.). 
 * <li>Then {@link SwaraView#renderAsHTML} simply gets the cache entries, and 
 *     "customizes" them for the specific lyric to generate the HTML content. 
 * <li>The HTML content is then passed to the row view which registers it
 *     with the HTML content hold area of the notation line - see 
 *     {@link NotationLine}. The rendering is done later on a call to
 * </ul>
 * </ul>
 *
 * In <u>both</u> cases, {@link SwaraView#renderInner} which <b>must</b> 
 * called first and it sets up {@link SwaraView#fInnerHTML} to indicate
 * what rendering should do.
 * <p>
 * In both cases, inner content is generated as a whole and rendered, there
 * is a need for a call to {@link SwaraView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function SwaraView(speedMarkersBelow)
{
    /**
     * get the underlying model
     * @return the underlying model
     * @type Swara
     */
    this.getModel = function() { return this.fModel; }

    /**
     * get the DOM label elem of the view
     * @return the DOM label elem of the view
     * @type DOMElement
     */
    this.getLabelElem = function() { return this.fLabelElem; }

    /**
     * called by the base-class when this view is selected
     */
    this.onselect = function() {
	EventManager.postEvent(EventManager.EVENT_SWARA_SELECTED, this, this.fModel);
    }

    /**
     * override of {@link SelectableRowViewPart#insertMode} to indicate
     * if we are in insert mode for swaras
     */
    this.insertMode = function() {
	return NotationEditModeController.insertMode();
    }

    /**
     * override of {@link SelectableRowViewPart#editingInserted} to indicate
     * if are we still editing the object we just inserted
     */
    this.editingInserted = function() { 
	return (this.fSelected && NotationEditModeController.editingInserted() == this);
    }

    /**
     * called by the base class when the text color of the view is changed
     * @param {String} color	the text color of the view as a string usable
     *				in a css style
     */
    this.oncolorChange = function() 
    { 	
	this._repaintOctave();
	this._repaintSpeed();
	if( this.fLabelElem )
	    this.fLabelElem.style.color = this.fColor;
    }

    /**
     * generate the HTML content for the inner part of swara - this inner part
     * is meant to go into a table cell (renderd by call to 
     * {@link SwaraView#render} or {@link SwaraView#renderAsHTML})
     *
     * <p>
     * The inner content is indicated in a hold area and used later during render)
     * <p>
     * For progressive rendering, the hold area simply says "render" delegating
     * everything to render. For non-progressive rendering, we use a (global) 
     * cache, and so nothing needs to happen except that the hold area 
     * indicates that we use the cache
     *
     * @param {boolean} wholeAsHTML	are we generating the whole cell (as opposed to
     *					just inner contents) as HTML?
     * @param {Swara} swara	  	the swara model obj
     * @param {int}  defaultSpeed  	the current default speed (used to 
     *					determine if we need speed markers)
     * @param {int}  nCols	   	the column span of the swara (used later
     *					when render is called)
     * @param {boolean}  notNotation	(optional) if rendering as not part of 
     *					notation (e.g. for pure display 
     *					purposes). In this case we wont use 
     *					specific font, wont put padding. We
     *					also make it non-interactive
     * @return the HTML contents
     * @type String
     */
    this.renderInner = function( wholeAsHTML, swara, defaultSpeed, nCols, notNotation ) {
	this.fModel = swara;
	this.fNCols = nCols;
	this.fDefaultSpeed = defaultSpeed;
	var mcolor = this.fModel.getDefaultFontColor();
	if( mcolor != null && mcolor != "" )
	    this.fColor = mcolor;

    	if(wholeAsHTML) {
	    this.fInnerHTML = "cache";	// we will generate from cache (faster)
	}
	else {
	    var ret;

	    if(notNotation) {
		ret = new Object();
		ret.contents = new Array();
		
		this.generateInnerHTML(this.fBackgroundColor, swara.getOctave(), notNotation, ret);

		// add the label text under label elem
		var txt = swara.getLabel();
		if( this.useSpaceIfEmpty() && (!txt || txt == "")) txt = "&nbsp;";
		ret.contents[ret.label ] = txt;

		this.fInnerHTML = ret.contents.join("");

	    }
	    else {
		this.fInnerHTML = "render";	// do it in render - this is crappy
	    }

	}
	return this.fInnerHTML;
    }

    /**
     * render the swara as a table cell (Note: assumes renderInner is already called)
     *
     * @param {SwaraLyricRowView } 	   rowview the row view
     * @param {int} partInRow		   the part in the row to which this belongsto
     * @param {int} cellidx		   (optional) index of cell in row; if 
     *					   not provided added at end	 
     * @return the table-cell element representing the view contents
     * @type DOMElement_TD
     */
    this.render = function( row, partInRow, cellidx ) {
	if( !this.fInnerHTML || this.fInnerHTML == "cache" ) 
	    return null;

	// create table-cell, this contains all content for a swara or lyric
	var ret = row.addDOMCell(false, partInRow, null, this.fNCols, cellidx);
	var td = ret.td;
	cellidx = ret.cellidx;
	// td.view     = this; 
	this.fTableCell = td;	// set table cell
	td.id          = Utils.getNewId("sw"); Utils.addToIdMap(td, this);
	this.domid     = td.id;
	td.className          = "nelemp";
	td.style.paddingBottom= "0px";
	td.style.paddingTop   = "0px";
	td.style.paddingRight = "0px";
	td.style.paddingLeft  = "0px";

	if( this.fInnerHTML == "render" ) {
	    // generate and set inner content
	    var speed = this.fModel.getSpeed();
	    var nlines = ((this.fModel.isEmpty())? 0 : speed - this.fDefaultSpeed);
	    if( nlines < 0 ) nlines = 0;

	    var ret = this.generateHTML( this.fColor, this.fBackgroundColor, this.fModel.getOctave(), 
					       nlines, this.fSpeedMarkersBelow, true  ) ;

	    // set font, font size
	    if( ret.fontName ) {
		var f = this.fModel.getDefaultFont();
		if( f != null && f != "" )
		    ret.contents[ret.fontName] = "font-family:'" + f + "';";
		else
		    ret.contents[ret.fontName] = '';
	    }
	    if( ret.fontSize ) {
		var f = this.fModel.getDefaultFontSize();
		if( f == null || f == "" )
		    f = "10pt";
		ret.contents[ret.fontSize] = 'font-size:' + f + ';';
	    }
	    if( ret.color )
		ret.contents[ret.fontSize] = this.fColor;

	    // add the label text under label elem
	    var txt = this.fModel.getLabel();
	    var isPhraseEnd = false;
	    var phraseEndLength = 0;
	    if(ret.phraseEnd && this.isPhraseEndText(txt)) {
	    	isPhraseEnd = true;
		phraseEndLength = this.getPhraseEndLength(txt);
		txt = txt.substr(0,txt.length-phraseEndLength);
	    }
	    if( this.useSpaceIfEmpty() && (!txt || txt == "")) txt = "&nbsp;";

	    // now translator
	    txt = this._translateText(txt);

	    ret.contents[ret.label ] = txt;

	    if( row.haveGamakas()) {
		ret.contents[cacheEntry.gamaka1] = row.getGamakaHeight() + "px;";
		ret.contents[cacheEntry.gamakacontent] = this.renderGamakaAsHTML(this.fModel.getOctave());
	    } 
	    else
		ret.contents[cacheEntry.gamaka1] = "1px;display:none;";
	    if( isPhraseEnd == true ) {
		var pref = this.fModel.getBlock().getSong().getPhraseEndsPreference();
		var spacing = this.fModel.getBlock().getSong().getPhraseEndsSpacing()*phraseEndLength;
		var ht = STAYI_HEIGHT+2;	// adjust for tara stayi and speed so
						// that - is aligned with swara
	    	if( pref == Song.prototype.PhraseEndsHide ) {
		    if( spacing != "" && spacing != "0" ) {
			ret.contents[ret.phraseEnd] = '<td style="padding:0 0 0 0;"><div style="height:' 
					    + ht + 'px;"></div><div'
					    + ((ret.fontSize) ? ret.contents[ret.fontSize] : '' )
					    + ' style="padding-right:' + spacing + ';">'
					    + '</div></td>';
		    }
		    else {
			ret.contents[ret.phraseEnd] = '<td style="padding:0 0 0 0;">&nbsp;</td>';
		    }
		}
		else if( pref == Song.prototype.PhraseEndsHyphen ) {
		    ret.contents[ret.phraseEnd] = '<td style="padding:0 0 0 0;"><div style="height:' 
					+ ht + 'px;"></div><div'
					+ ((ret.fontSize) ? ret.contents[ret.fontSize] : '' )
					+ ((spacing != "") ? (' style="padding-right:' + spacing + ';">') : '>')
					+ '-</div></td>';
		}
		else if( pref == Song.prototype.PhraseEndsHandle 
				    || pref == Song.prototype.PhraseEndsHandleThick) {
		    var img = ((pref == Song.prototype.PhraseEndsHandle) 
				? 'phrase_end_handle.PNG': 'phrase_end_handle_thicker.PNG');
		    ret.contents[ret.phraseEnd] = '<td style="padding:0 0 0 0;"><div style="height:' 
					+ ht + 'px;"></div>'
					+ '<div style="'
					+ ((ret.fontName) ? ret.contents[ret.fontName] : '' )
					+ ((ret.fontSize) ? ret.contents[ret.fontSize] : '' )
					+ 'background: ' + LookAndFeel.url2(img) 
					+ ' bottom left no-repeat;' +
					+ ((spacing != "") ? (' style=padding-right: "' + spacing + ';">') : '>')
					+ '&nbsp;'
					+ '</div></td>';
		}
	    }
	    else
		ret.contents[ret.phraseEnd] = '';
	    td.innerHTML=  ret.contents.join("");
	}
	else
	    td.innerHTML=  this.fInnerHTML;

	this.fInnerHTML = null;
	this.attach(td, cellidx);

	// add ourselves to the row
	row.addPart(this);
	return td;
    }

    /**
     * Non-progressive rendering: generate HTML content for entire view 
     * (table-cell) - using the cache.
     * <p>
     * We always check the cache for already generated content (with space 
     * holders). If not in cache we bail. If in cache, we use the space 
     * holders for the txt and column span and populate it. We then add
     * the contents to the hold area in the row
     *
     * @param {SwaraLyricRowView } rowview   the row view
     * @param {int} 		   partInRow n as in nth tala part in the row 
     */
    this.renderAsHTML = function( row, partInRow ) {
	var speed = this.fModel.getSpeed();
	var nlines = speed - this.fDefaultSpeed;
	if( nlines < 0 ) nlines = 0;
	var octave = this.fModel.getOctave();

	// look up the cache
	var cacheEntry = SwaraViewHTMLCache.get(octave, nlines);
	if(!cacheEntry) { 
	    alert("unexpected: cannot find swara view content in cache: " 
	    		+ octave + ", " + nlines); 
	    failme(); 
	}
	// "customize" by filling in place holders
	var contents = cacheEntry.contents;
	contents[cacheEntry.ncols] = this.fNCols;	// spot for ncols;
	contents[cacheEntry.id]    = Utils.getNewId("sw");
	this.domid = contents[cacheEntry.id];
	if(this.fModel.hasTimeIndices()) {
	    var song = this.fModel.getBlock().getSong();
	    var audioManager = this.fModel.getBlock().getSong().getAudioManager();
	    if(song && song.hasAudio() && audioManager) 
		audioManager.addTimeIndices(this, song.getAudio(), this.fModel.getTimeIndices());
	}

	if( alwaysGamakas ) {
	    contents[cacheEntry.gamaka1] = GAMAKA_HEIGHT_DEFAULT + "px;" 
	}
	else if( row.haveGamakas()) {
	    contents[cacheEntry.gamaka1] = row.getGamakaHeight() + "px;";
	    contents[cacheEntry.gamakacontent] = this.renderGamakaAsHTML(this.fModel.getOctave());
	}
	else {
	    contents[cacheEntry.gamaka1] = "1px;display:none;";	// smallest
	    contents[cacheEntry.gamakacontent] = "";
	}

	// set font, font size
	if( cacheEntry.fontName ) {
	    var f = this.fModel.getDefaultFont();
	    if( f != null && f != "" )
		contents[cacheEntry.fontName] = "font-family:'" + f + "';";
	    else
		contents[cacheEntry.fontName] = '';
	}
	if( cacheEntry.fontSize ) {
	    var f = this.fModel.getDefaultFontSize();
	    if( f == null || f == "" )
	    	f = 10;
	    contents[cacheEntry.fontSize] = 'font-size:' + f + ';';
	}

	// set color
	if( cacheEntry.color )
	    contents[cacheEntry.color] = this.fColor;

	// add the label text under label elem
	var txt = this.fModel.getLabel();
	if( txt ==  "|" || txt == "||" ) {
	    txt = "\xa0<b>" + txt + "\xa0";
	}



	var isPhraseEnd = false;
	var phraseEndLength = 0;
	if(cacheEntry.phraseEnd && this.isPhraseEndText(txt)) {
	    isPhraseEnd = true;
	    phraseEndLength = this.getPhraseEndLength(txt);
	    txt = txt.substr(0,txt.length-phraseEndLength);
	}

	// now translator
	txt = this._translateText(txt);

	if( this.useSpaceIfEmpty() && (!txt || txt == "")) txt = "&nbsp;";
	/*
	 * if .. means this occupies 1 akshara - so to make the output look
	 * sensible, give it some width
	 */
	if( txt == ".." ) 
	    contents[cacheEntry.label] = '<div style="width:3em;">..</div>';
	//else if ( txt == "," || txt == ';' ) {
	    // if non-fixed fonts are used, the "." occupies too little room
	    //contents[cacheEntry.label] = '<div style="width:1em;">'+txt+'</div>';
	//}
	else
	    contents[cacheEntry.label] = txt;
	if( isPhraseEnd == true ) {
	    var phraseEndsStyle = this.fModel.getBlock().getSong().getPhraseEndsPreference();
	    var spacing = this.fModel.getBlock().getSong().getPhraseEndsSpacing();
	    var spacing_re = /^([0-9.]*)(.*)$/;
	    var ret = spacing_re.exec(spacing);
	    if( ret && ret.length == 3 )
	    {
	    	spacing = (ret[1]*phraseEndLength) + ret[2];
	    }
	    var ht = STAYI_HEIGHT+2;	// adjust for tara stayi and speed so
					    // that - is aligned with swara
	    if( phraseEndsStyle == Song.prototype.PhraseEndsHide ) {
		if( spacing != null && spacing != "" ) {
			contents[cacheEntry.phraseEnd] = 
				    '<td style="padding:0 0 0 0;"><div style="height:' 
				    // note: overflow:hidden necessary for IE
				    + ht + 'px;overflow:hidden;"></div><div style="'
				    + 'padding-right:' + spacing + ';">'
				    + '</div></td>';
		    }
		    else
			contents[cacheEntry.phraseEnd] = '<td style="padding:0 0 0 0;">&nbsp;</td>';
	    }
	    else if( phraseEndsStyle == Song.prototype.PhraseEndsHyphen ) {
		contents[cacheEntry.phraseEnd] = '<td style="padding:0 0 0 0;"><div style="height:' 
				    // note: overflow:hidden necessary for IE
				    + ht + 'px;overflow:hidden;"></div><div style="'
				    + 'padding-right:' + ((spacing != null && spacing != "") ? spacing : '0' )+ ';">'
				    + '-</div></td>';
	    }
	    else if( phraseEndsStyle == Song.prototype.PhraseEndsHandle ||
			    phraseEndsStyle == Song.prototype.PhraseEndsHandleThick ) {
		var img = ((phraseEndsStyle == Song.prototype.PhraseEndsHandle) 
			    ? 'phrase_end_handle.PNG': 'phrase_end_handle_thicker.PNG');
		if( !this.fSpeedMarkersBelow ) {
		    contents[cacheEntry.phraseEnd] = '<td style="padding:0 0 0 0;">' 
					// note: overflow:hidden necessary for IE
					+ '<div style="height:' + ht + 'px;overflow:hidden;"></div>'
					+ '<div style="'
					+ 'background: ' + LookAndFeel.url2(img) + ' bottom left no-repeat;'
					+ 'position:relative;top:3;'
					//+ ((cacheEntry.fontName) ? contents[cacheEntry.fontName] : '' )
					//+ 'font-name:Symbol;'
					+ ((cacheEntry.fontSize) ? contents[cacheEntry.fontSize] : '' )
					+ 'padding-right:' + ((spacing != null && spacing != "") ? spacing : '0' )+ ';'
					//+ '">,</div>'
					+ '">&nbsp;</div>'
					+ '</td>';
		}
		else {
		    contents[cacheEntry.phraseEnd] = '<td style="padding:0 0 0 0; border: thin solid;">' 
					+ '<div style="height:3px;"></div>'
					+ '<div style="'
					+ 'background: ' + LookAndFeel.url2(img) + ' bottom left no-repeat;'
					+ 'position:relative;'
					+ ((cacheEntry.fontName) ? contents[cacheEntry.fontName] : '' )
					+ ((cacheEntry.fontSize) ? contents[cacheEntry.fontSize] : '' )
					+ 'padding-right:' + ((spacing != null && spacing != "") ? spacing : '0' )+ ';'
					+ '">&nbsp;</div>' 
					//+ '">&#8991;</div>'
					// note: overflow:hidden necessary for IE
					+ '<div style="height:' + ht + 'px;overflow:hidden;">&nbsp;</div>'
					+ '</td>';
		}
	    }
	}
	else
	    contents[cacheEntry.phraseEnd] = "";

	// join the contents and add it the hold area of our row
	row.addDOMCellAsHTML(false, partInRow, contents.join(""));

	// clear hold area
	this.fInnerHTML = null;

	// add ourselves to the row
	row.addPart(this);

	return;
    }

    /**
     * generate HTML content and returns it as an array of strings with the 
     * element where label goes is NULL
     * <p>
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {String} bgcolor		background color as would go in a CSS 
     *					style
     * @param {int}    octave		stayi indicator
     * @param {boolean} notNotation	swara in notation area?
     * @param           ret      	If not null, return info in this object
     *					rather than creating a new one
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements: "label": index of element representing swara label,
     * "fontName': index of element representing swara font, "fontSize': 
     * index of element representing swara font size, color: the color of
     * the text.  Once all null elements are filled, the array can be 
     * "joined" to generate the HTML content
     */
    this.generateInnerHTML = function( bgcolor, octave, notNotation, ret ) {
	var i;
	if(!ret) {
	    ret = new Object();
	    ret.contents = new Array();
	    i = 0;
	}
	else {
	    i = ret.contents.length;
	}

	var contents = ret.contents;
	var s = new Array();
	var si = 0;

	// octavize
	// NOTE: float:left breaks on IE - i have no idea why.
	s[si++] = '<div class="octavewrapper" style="padding-right:0;padding-top:0;padding-bottom:0;text-align:center;';
	s[si++] = 'border:thin solid ';
	s[si++] = bgcolor;
	s[si++] = ';">';

	// create elem for tara stayi dot
	s[si++] = '<center style="padding:0 0 0 0;"><div class="tstayi" style="';
	if( octave > 0 ) s[si++] = 'background:#000000;';
	s[si++] = STAYI_HEIGHT_STYLE;
	s[si++] = 'width:3px;padding:0 0 0 0;overflow:hidden;"></div></center>';

	// add label elem
	s[si++] = '<div class="nelem" style="width:100%;height:100%;color:';
	contents[i++] = s.join("");
	if( !notNotation ) {
	    // reserve spot for color (from model)
	    contents[i++] = null;
	    ret.color = i-1;
	    contents[i++] = ';';
	}
	else {
	    contents[i++] = this.fColor;
	}
	si = 0; s = new Array();
	if( !notNotation ) {
	    contents[i++] = 0;
	    ret.fontName = i-1;
	    contents[i++] = 0;
	    ret.fontSize = i-1;
	    s[si++] = 'padding:0 0 0 0;text-align:center;z-index:1;';
	    if(theSongView.isInteractive())
		s[si++] = 'cursor:pointer;';
	    else
		s[si++] = 'cursor:default;';
	}
	s[si++] = ';">';
	contents[i++] = s.join("");
	contents[i++] = null;	// LABEL SPOT
	ret.label = i-1;
	contents[i++] = '</div>';	// LABEL SPOT

	// create elem for mandra stayi dot
	s = new Array();
	si = 0;
	s[si++] = '<center style="padding:0 0 0 0;"><div class="mstayi" style="';
	if( octave < 0 ) s[si++] = 'background:#000000;';
	s[si++] = STAYI_HEIGHT_STYLE;
	s[si++] = 'width:3px;padding:0 0 0 0;overflow:hidden;"></div></center>';
	s[si++] = '</div>';	// ending div for octavewrapper
	contents[i++] = s.join("");
	return ret;
    }

    /**
     * generate the HTML content for the table cell  as an array of strings
     * (with space holders as null elements - which can later be populated)
     *
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {String} fgcolor		text color as would go in a CSS style
     * @param {String} bgcolor		background color as would go in a CSS 
     *					style
     * @param {int}    octave		stayi indicator
     * @param {int}    nspeedlines 	# of speed lines to draw
     * @param {boolean} speedMarkersBelow	speed markers below or above?
     * @param {boolean} innerOnly	inner content only or whole contents?
     *
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements: "ncols": index of element representing column span;
     * "gamaka1": index of element representing gamaka height specifier;
     * "gamakacontent": index of element representing gamaka content;
     * "phraseEnd": index of element representing gamaka phrase end;
     * "label": index of element representing swara label. 
     * "fontName': index of element representing swara font, "fontSize': 
     * index of element representing swara font size, "color" the color
     * of the text.  Once all null elements are filled, the array can be 
     * "joined" to generate the HTML content
     */
    this.generateHTML = function( fgcolor, bgcolor, octave, nspeedlines, 
    						speedMarkersBelow, innerOnly  ) {
	var ret = new Object();
	ret.contents = new Array();
	var i = 0;
	var contents = ret.contents;

	if(!innerOnly) {
	    /*
	     * note: valign bottom/top is needed in non-english as  "," may come 
	     * out in a different font and different height, this means that inner
	     * content will have a different total height causing it (by default)
	     * to be center aligned and thus any speed markers would not align
	     * with neighbouring cells.
	     *
	     * This could be indicative of a more generic problem in that if 
	     * different chars have different heights, then unless we force 
	     * some vertical alignment on the inner content, speed markers may
	     * not align. I thihk although that IF a single font is forced for
	     * all swaras, then this may not be an issue as font height for a
	     * particular size font should be same for all chars?
	     */
	    if( speedMarkersBelow )
		contents[i++] = '<td class="nelemp" valign="bottom" colspan="';
	    else
		contents[i++] = '<td class="nelemp" valign="top" colspan="';
	    contents[i++] = null;
	    ret.ncols = i-1;
	    contents[i++] = '" id="';
	    contents[i++] = null;
	    ret.id = i-1;
	    contents[i++] = '" style="padding:0 0 0 0;">';
	}

	// zero padding: avoids wastinng a pixel or two
	/*
	 * NOTE: used to be width:100% but was messing up fullwidth. This works
	 * better although it is possible it may be allowing very first anga to
	 * occupy way too much space. Note also there is a corresponding change
	 * in NotationLine (removal of a width:100%)
	 *
	 * NOTE2: Actually for some reason this was messing up speed lines on the
	 * manual (but not display?). So I added back. FullWidth still seems ok
	 * - but need to watch out for repurcussions
	 */
	contents[i++] = '<table style="width:100%;padding:0 0 0 0;border-collapse:collapse;"><tr><td valign="bottom" ';
	/* 
	 * this can help spanning slides span phrase end spacings but that
	 * falls apart if the phrase ending swara ends a slide (which is
	 * typical) - so commented out. The original intent was to make
	 * it span tala marker stuff but phrase ends is different anyways
	 */
	/* contents[i++] = 'colspan="2"'; */
	contents[i++] = 'style="width:100%;padding:0 0 0 0;z-index:20;height:';
	contents[i++] = null;	// spacing for gamaka height specifier
	ret.gamaka1 = i-1;
	contents[i++] = '">';
	/*====================================================================
	 * NOTE: overflow:hidden on Opera screws up in that when gamakas are 
	 * moved down if in madya/mandra stayi (See renderGamakaAsHTML), in 
	 * spite of z-index they only "half-appear". Makes sense since
	 * overflow:hidden is supposed to imply that. Without overflow:hidden 
	 * it works on Opera, Firefox and IE. Note that overflow:hidden was 
	 * originally intended to "limit" the height - but since height of 
	 * gamaka row is determined by the hieght of gamaka glyphs - perhaps 
	 * they werent needed? Besides if we want to enforce gamaka height, we
	 * could perhaps do it ImageGamaka or at the least in *renderGamaka(AsHTML)?
	 *
	 *contents[i++] = 'overflow:hidden;">'; 
	 *
	 * Also,
	 *
	 * NOTE: if gamakacontainer div is used then we dont seem to make space
	 * wide for bigger glyphs
	 *
	 * contents[i++] = '<div class="gamakacontainer" style="width:100%;padding:0 0 0 0;>';
	 */
	contents[i++] = null;
	ret.gamakacontent = i-1;
	// contents[i++] = '</div>';

	var s = new Array();
	var si = 0;
	s[si++] = '</td></tr><tr><td style="padding:0 0 0 0;">';	
	var border  = 'border-' + ((speedMarkersBelow) ? "bottom" : "top");
	var padding = 'padding-' + ((speedMarkersBelow) ? "bottom" : "top");
	var defPadding = ((speedMarkersBelow) ? "padding-bottom": "padding-top");
	for(var speed = 3; speed > 0; speed--) {
	    s[si++] = '<div class="speed" style="width:100%;position:relative;z-index:3;';
	    if( speed <= nspeedlines ) {
		s[si++] = border;
		s[si++] = ':1px solid ';
		s[si++] = fgcolor;
		s[si++] = ';';
		s[si++] = padding;
		s[si++] = ':1px;';
	    }
	    else {
		s[si++] = defPadding;
		s[si++] = ":2px;";	// MUST BE 1+1
	    }
	    s[si++] = '">';
	}
	contents[i++] = s.join("");

	this.generateInnerHTML(bgcolor, octave, false, ret);
	i = ret.contents.length;
	// 3 nested speeds
	contents[i++] = '</div></div></div>';
	contents[i++] = "</td>";
	contents[i++] = "";
	ret.phraseEnd = i-1;
	contents[i++] = '</tr></table>';
	if(!innerOnly)
	    contents[i++] = '</td>';
	return ret;
    }

    /**
     * attach ourselves to a table-cell whose HTML content we generated earlier
     */
    this.attach = function( td, cellidx ) {
	this.fCellIdx = cellidx;
	this.fSpeedElems = new Array();
	var tbl = td.firstChild;

	this.fGamakaContainer = tbl.rows[0].cells[0].firstChild;

	var sp1 = tbl.rows[1].cells[0].firstChild;
	var sp2 = sp1.firstChild;
	var sp3 = sp2.firstChild; 
	this.fSpeedElems[0] = sp1;
	this.fSpeedElems[1] = sp2;
	this.fSpeedElems[2] = sp3;

	var ow = sp3.firstChild;
	if(!ow ) return false;
	this.attachInner(ow);
	this.initSelectable(ow, true);
	//if( this.rowView.haveGamakas() )
	    sp1.parentNode.style.paddingTop = 3;	// kludge - otherwise hover 
	return true;
    }

    /**
     * attach to inner content 
     * @private
     */
    this.attachInner = function( ow ) {
	this.fInner = ow;
	var owChild = ow.firstChild;

	this.fTaraStayiElement = owChild.firstChild;
	this.fLabelElem        = owChild.nextSibling;
	this.fLabelNode        = this.fLabelElem.firstChild;

	this.fMandraStayiElement = this.fLabelElem.nextSibling.firstChild;
    }


    /**
     * translate swara text as per translator settings
     * @param {String} txt	text to be translate
     * @return the translated text
     * @String
     * @private
     */
    this._translateText = function(txt) {
	var translator = this.fModel.getTranslator();
	if(translator != null && 
		(translator.getLanguageName().toLowerCase() != "english" &&
		 translator.getLanguageName().toLowerCase() != "roman_diacritics") )  {
	    // since "s" "r" byitself may become mei on tamil - fix it
	    // TODO: what if s* (anya)
	    var s_re = /^(sa|s|ri|r|ga|g|ma|m|pa|p|da|d|ni|n)(.*)$/i;
	    var ret = s_re.exec(txt);
	    if(ret && ret.length == 3 ) {
		var c1 = null;
		var c = ret[1].toLowerCase();
	        if(c == "s" )      {
		    //if( translator.getLanguageName().toLowerCase() == "tamizh" ) 
			c1 = "s2a";	// force the sanskrit sa for tamizh
		    //else
			//c1 = "sa";
		}
	        else if(c == "sa" )  {
		    //if( translator.getLanguageName().toLowerCase() == "tamizh" ) 
			c1 = "s2A";	// force the sanskrit sa
		    //else
			//c1 = "sA";
		}
	        else if(c == "r" )  c1 = "ri";
	        else if(c == "ri" ) c1 = "rI";
	        else if(c == "g" )  c1 = "ga";
	        else if(c == "ga" ) c1 = "gA";
	        else if(c == "m" )  c1 = "ma";
	        else if(c == "ma" ) c1 = "mA";
	        else if(c == "p" )  c1 = "pa";
	        else if(c == "pa" ) c1 = "pA";
	        else if(c == "d" )  c1 = "da";
	        else if(c == "da" ) c1 = "dA";
	        else if(c == "n" ) {
		    if( translator.getLanguageName().toLowerCase() == "tamizh" ) 
			c1 = "n2i";	// force right ni in tamil
		    else
			c1 = "ni";
		}
	        else if(c == "ni" )  {
		    if( translator.getLanguageName().toLowerCase() == "tamizh" ) 
			c1 = "n2I";	// force right ni in tamil
		    else
			c1 = "nI";
		}
		if(c1 != null ) {
		    txt = c1 + ret[2];
		}
	    }
	    var curScheme = null;
	    if(translator.getQualScheme) {
		curScheme = translator.getQualScheme("noqual");
		translator.setQualScheme("noqual");
	    }
	    txt = translateHTML(txt, translator);
	    if(translator.getQualScheme)
		translator.setQualScheme(curScheme);
	}
	return txt;
    }


    /**
     * (internal routine) render gamaka
     * @private
     */
    this.renderGamaka  = function() {
	if( this.fGamakaContainer == null ) return;
	var gv = this.fGamakaContainer.firstChild;
	if( gv != null ) this.fGamakaContainer.removeChild(gv);
	var g = this.fModel.getGamaka();
	if(  g != null ) {
	    var gc = g.render(this.fModel);
	    var c = document.createElement("center");
	    c.appendChild(gc);
	    this.fGamakaContainer.appendChild(c);
	}
    }

    /**
     * (internal routine) generate HTML content for content 
     * @type String
     * @private
     */
    this.renderGamakaAsHTML  = function(octave) {
	var g = this.fModel.getGamaka();
	if( g == null ) {
	    return "";
	}
	else {
	    var s = new Array();
	    var i = 0;
	    var shiftDown = (this.fSpeedMarkersBelow || octave <= 0);
	    // move it down by the stayi-height if not tara stayi and we are drawing speed
	    // markers below - DOES NOT WORK WHEN GOING TO PDF!!!!
	    var shiftDown = false;
	    var off = STAYI_HEIGHT-1;	// +2,  there is space occupied by speed marker div, 
					    // we can go below, but not too much
	    if( true || !g.canAdjustForOctave() ) {
	        if( !shiftDown )
		    s[i++] = '<center style="padding:0 0 0 0;">';
		else {
		    s[i++] = '<center style="position:relative;z-index:20;padding:0 0 0 0;top:';
		    s[i++] = off;
		    s[i++] = 'px;">';
		}
	    }
	    else {
		s[i++] = '<center style="padding:0 0 0 0;">';
	    	if( shiftDown )
		    g.adjustForOctave(off);
	    }
	    s[i++] = g.renderAsHTML(this.fModel);
	    s[i++] = "</center>";
	    return s.join("");
	}
    }

    /**
     * set the gamaka for this swara and update the view
     */
    this.setGamaka  = function(gamaka) {
	var g = this.fModel.getGamaka();
	if( g == null && gamaka == null) return;
	this.fModel.setGamaka(gamaka);
	var g = this.fModel.getGamaka();

	this.renderGamaka();
    }

    /**
     * adjust the view based on the fact that the row's gamaka spacing
     * constraints have changed
     */
    this.adjustGamaka = function() {
	if( this.fGamakaContainer == null ) return;
	var rowView = this.rowView();
	if( rowView.haveGamakas()) {
	    this.fGamakaContainer.style.height = rowView.getGamakaHeight() + "px";
	    //this.fGamakaContainer.style.display = "inline";
	    this.fGamakaContainer.style.display = "";
	    this.fGamakaContainer.style.overflow = "hidden";
	}
	else {
	    this.fGamakaContainer.style.height = "1px";	// smallest
	    this.fGamakaContainer.style.display = "none";
	}
    }


    /**
     * set the attributes of the underlying swara from those of the passed-in 
     * swara and update display of this swara <b>only</b> so only inner 
     * content is affected.
     *
     * @param {Swara} swara swara whose attributes would be used to set 
     *			     underlying swara
     */
    this.setSwaraAttributesFrom = function(swara, doSpeed) {
	this.setLabel(swara.getLabel());
	this.setOctave(swara.getOctave());
	if( doSpeed ) this.setSpeed(swara.getSpeed());
    }

    /**
     * set the label of the underlying model and update the view
     * accordingly
     */
    this.setLabel = function(lbl) { 
    	this.fModel.setLabel(lbl);
	if( lbl != "" || !this.useSpaceIfEmpty())
	    this.fLabelNode.nodeValue = lbl;
	else
	    this.fLabelNode.nodeValue = "\xa0";
	//if( txt == "\xa0" )
	    //this.fLabelElem.style.background = "rgb(224,224,255)";	// light blue
	//else
	    //this.fLabelElem.style.background = "none";
    }

    /**
     * update the label of the view from the model. This is called if
     * the label of the model has changed behind the scenes
     *
     * @param {String} lbl	(optional) if specified, this is used as
     *				the label instead of the actual label from
     *				the model
     */
    this.updateLabel = function(lbl) {
	if( this.fLabelNode == null ) return;
	if( !lbl ) lbl = this.fModel.getLabel();
	this.fLabelNode.nodeValue = lbl;
    }


    /**
     * change the speed of the underlying swara and update display
     * of this swara *only* - so only inner content is affcted
     *
     * @speed		new speed
     * @defaultSpeed	default speed for determining speed marks
     * @force {boolean}	if true, force update even if we are not changing speed
     */
    this.setSpeed = function(speed, defaultSpeed, force) {
        if( !this.fSpeedElems ) return;
    	if( (force || this.fModel.getSpeed() != speed) && this.fModel.setSpeed(speed) ) {
	    var sspeed = 3;
	    var speed = this.fModel.getSpeed();
	    var ns = this.fSpeedElems.length;
	    for(var i = 0; i < ns; i++, sspeed-- ) {
		if( sspeed <= speed && sspeed > defaultSpeed )  {
		    if( this.fSpeedMarkersBelow ) {
			this.fSpeedElems[i].style.paddingBottom = "1px";
			this.fSpeedElems[i].style.borderBottom = "thin solid " + this.fColor;
		    }
		    else {
			this.fSpeedElems[i].style.paddingTop = "1px";
			this.fSpeedElems[i].style.borderTop = "thin solid " + this.fColor;
		    }
		}
		else {
		    if( this.fSpeedMarkersBelow ) {
			this.fSpeedElems[i].style.borderBottom = "none";
			this.fSpeedElems[i].style.paddingBottom = "1px";
			//this.fSpeedElems[i].style.borderBottom = "thin solid " + this.fBackgroundColor;
		    }
		    else {
			this.fSpeedElems[i].style.borderTop = "none";
			this.fSpeedElems[i].style.paddingTop = "1px";
			//this.fSpeedElems[i].style.borderTop = "thin solid " + this.fBackgroundColor;
		    }
		}		
	    }
	}
    }


    /**
     * change the octave of the underlying swara and update display
     * @param o	the new octave value
     */
    this.setOctave = function(o) {
    	if( this.fModel.getOctave() != o && this.fModel.setOctave(o) ) {
	    this._repaintOctave();
	}
    }


    /**
     * update the view based on non-layour affecting model changes, which
     * means only the inner content would be redrawn
     */
    this.update = function(notNotation) {
	if( this.fOuter == null ) return;
	var inner = renderInner( false, this.fModel, this.fDefaultSpeed, this.fNCols, notNotation);
	this.fOuter.innerHTML = inner;
	this.attach(this.fOuter, this.fCellIdx);	// reattach
    }

    /**
     * internal method to re-render the speed marks for this view
     * @private
     */
    this._repaintSpeed = function() {
	if( !this.fSpeedElems ) return;
	var ns = this.fSpeedElems.length;
	for(var i = 0; i < ns; i++ ) {
	    if( this.fSpeedElems[i].style.borderTop != "" && this.fSpeedElems[i].style.borderTop != "none" ) 
		this.fSpeedElems[i].style.borderTop = "thin solid " + this.fColor;
	}
    }

    /**
     * internal method to re-render the octave markers for this view
     * @private
     */
    this._repaintOctave = function() {
	    if( !this.fModel ) return;
	    var o = this.fModel.getOctave();
	    if( this.fTaraStayiElement) {
		if( o > 0 ) {
		    this.fTaraStayiElement.style.background = this.fColor;
		}
		else
		    this.fTaraStayiElement.style.background = "none"; // this.fBackgroundColor;
	    }
	    if( this.fMandraStayiElement) {
		if( o < 0 )
		    this.fMandraStayiElement.style.background = this.fColor;
		else
		    this.fMandraStayiElement.style.background = "none"; // this.fBackgroundColor;
	    }
    }

    /**
     * adorn an elem with speed and return the adorned elem
     * @private
     *
     * @param {DOMElement_TD} cell 	the cell (or elem) within the swara is 
     *			        	rendered - it is assumed that default 
     *					padding of this elem is 4px (as adding 
     *					speed will reduce the padding)
     * @param {DOMElement} elem		the element which contains swara 
     *					contents that need to be adorned with 
     *					speed
     * @param {int} defaultSpeed    	the default speed
     * @param {int} cellpad	        the maximum cellpad (optional), in 
     *					which case 4 is assumed)
     */
    this.addSpeed = function(cell, swaraElement, defaultSpeed, cellpad) {
    	var myspeed = this.fModel.getSpeed();
	var outer = null;
	var last = null;

	this.fSpeedElems = new Array();

	if( !cellpad ) cellpad = 4;
	var pad = cellpad - 4;
	var colors = new Array(3);
	colors[0] = "red"; colors[1] = "blue"; colors[2] = "green";
	for(var speed = 3; speed >= 1; speed--) {
	    var d = document.createElement("div");
	    d.className = "speed";
	    d.style.width = "100%";
	    d.style.position = "relative";
	    d.style.zIndex   = 3;
	    //d.style.background = colors[speed];
	    if( speed <= myspeed && speed > defaultSpeed ) {
		if( this.fSpeedMarkersBelow ) {
		    d.style.borderBottom = "1px solid " + this.fColor;
		    d.style.paddingBottom = "1px";
		}
		else {
		    d.style.borderTop = "1px solid " + this.fColor;
		    d.style.paddingTop = "1px";
		}
	    }
	    else {
		if( this.fSpeedMarkersBelow ) {
		    //d.style.borderBottom = "1px solid " + this.fBackgroundColor;
		    d.style.paddingBottom = "2px";
		}
		else {
		    //d.style.borderTop = "1px solid " + this.fBackgroundColor;
		    d.style.paddingTop = "2px";
		}
	    }
	    this.fSpeedElems[this.fSpeedElems.length] = d;

	    if( outer == null ) {
		outer = d;
		last = d;
	    }
	    else {
	    	last.appendChild(d);
		last = d;
	    }
	}
	last.appendChild(swaraElement);

	// adjust the padding of table-cell
	var str = pad;
	str += "px";
	if( this.fSpeedMarkersBelow )
	    cell.style.paddingBottom = str;
	else
	    cell.style.paddingTop = str;

	return outer;
    }

    /**
     * draw octave markers for this swara.
     * <p>
     * It constructs a div element which has the following:
     * <ul>
     * <li>element for tara stayi (will just occupy space if not tara stayi) 
     * <li>element that contains label
     * <li>element for mandra stayi (will just occupy space if not tara stayi) 
     * </ul>
     *
     * @param {String} labelElem  the label elem
     * @param {int}    octave	  octave indicator
     * @return an element representing label with octave adornment
     * @type DOMElement_DIV
     */
    this.octavize = function(labelElem, octave)
    {
	labelElem.style.paddingRight = "0";
	labelElem.style.paddingRight = "0";

	// newd will be the div under the table ce
	var newd = document.createElement("div");
	newd.className          = "octavewrapper";
	//newd.style.paddingRight = "0.25em"; used to be there but why?
	newd.style.paddingRight = "0";
	newd.style.paddingTop   = "0";
	newd.style.paddingBottom   = "0";
	if( newd.style.cssFloat ) 
	    newd.style.cssFloat = "left";
	else if( newd.styleFloat ) 
	    newd.style.styleFloat = "left";
	newd.style.textAlign = "center";

	// create elem for tara stayi dott
	var tarastayi = document.createElement("center");
	var sp1c = document.createElement("div");
	this.fTaraStayiElement = sp1c;
	if( octave > 0 )
		sp1c.style.background = "#000000";
	sp1c.style.overflow = "hidden";
	sp1c.style.height   = STAYI_HEIGHT_PX;
	sp1c.style.width    = STAYI_HEIGHT_PX;
	sp1c.style.padding  = "0 0 0 0";
	tarastayi.style.padding  = "0 0 0 0";
	tarastayi.appendChild(sp1c);

	// create elem for mandra stayi dott
	var mandrastayi = document.createElement("center");
	var sp2c = document.createElement("div");
	if( octave < 0 )
		sp2c.style.background = "#000000";
	this.fMandraStayiElement = sp2c;
	sp2c.style.overflow = "hidden";
	sp2c.style.height   = STAYI_HEIGHT_PX;
	sp2c.style.width    = STAYI_HEIGHT_PX;
	sp2c.style.padding  = "0 0 0 0";
	mandrastayi.style.padding  = "0 0 0 0";
	mandrastayi.appendChild(sp2c);

	// now c
	newd.appendChild(tarastayi);
	newd.appendChild(labelElem);
	newd.appendChild(mandrastayi);
	return newd;
    }

    /**
     * does the swara label indicate this is a phrase end?
     * @type {bool}
     * @private
     */
    this.isPhraseEndText = function(txt) {
	if( txt.length > 1 && (txt == "--" || txt.match( /[^-][^-]*--*$/ ) ) )
		return true;
	return false;
    }

    this.getPhraseEndLength = function(txt) {
    	if( txt.length > 1 )
	{
		if( txt == "--" )
			return 1;
		var dash = txt.indexOf("-");
		if( dash < txt.length )
		{
			return txt.length-dash;
		}
	}
	return 0;
    }

    /**
     * override
     */
    this.clicked = function() {
	if(theSongView.isInteractive()) {
	    theSongView.selectObject(this);
	}
	else if( this.fModel.hasTimeIndices() ) {
	    var song = this.fModel.getBlock().getSong();
	    if( song.hasAudio() ) {
		var audioManager = song.getAudioManager();
		// ??? present choice ??
		if(audioManager) audioManager.seekTo(song.getAudio(), this.fModel.getTimeIndices()[0]);
	    }
	}
    }

    /**
     * (protected)
     * use space when label is empty?
     * @return true
     * @private
     */
    this.useSpaceIfEmpty = function() { return true; }


    /**
     * @ignore
     */
    this.fPartType = ROWVIEWPART_SWARA;

    /**
     * the swara model for which this object is the view
     * @type Swara
     * @private
     */
    this.fModel         = null;

    /**
     * the inner content (div) of the swara view, which goes into
     * the outer content
     * @type DOMElement_DIV
     * @private
     */
    this.fInner         = null;

    /**
     * the DOM element of the content that contains the label part
     * @type DOMElement
     * @private
     */
    this.fLabelElem     = null;

    /**
     * the DOM element in the content that is a container for gamaka (if any), which
     * is created when view is rendered ({@link SwaraView#render})
     * @type DOMElement
     * @private
     */
    this.fGamakaContainer     = null;

    if( !speedMarkersBelow ) 
    	speedMarkersBelow = false;
    else
    	speedMarkersBelow = true;

    /**
     * should speed markers be drawn beneath a swara or above a swara?
     * @boolean
     * @type
     * @private
     */
    this.fSpeedMarkersBelow = speedMarkersBelow;
    var o = new Object();
    o.border  = 'border-' + ((this.fSpeedMarkersBelow) ? "bottom" : "top");
    o.padding = 'padding-' + ((this.fSpeedMarkersBelow) ? "bottom" : "top");
    o.defPadding = ((this.fSpeedMarkersBelow) ? "padding-bottom": "padding-top");

    /**
     * (local) cache of speed markers related HTML 
     * @private
     */
    this.fSpeedMarkerRelatedHTML = o;
    o = null;
    speedMarkersBelow = null;
}
SwaraView.prototype = new SelectableRowViewPart();



/**
 * @class
 * represents the view that is a place holder for appending new swaras
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link NewSwaraSpacerView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. 
 *
 * In <u>both</u> cases, {@link NewSwaraSpacerView#renderInner} which <b>must</b> 
 * called first and it sets up {@link NewSwaraSpacerView#fInnerHTML} to indicate
 * what rendering should do.
 * <p>
 * In both cases, inner content is generated as a whole and rendered, there
 * is a need for a call to {@link SwaraView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function NewSwaraSpacerView(block) 
{
    // we are selectable ONLY in insert mode
    //this.isSelectable = function() { return NotationEditModeController.insertMode(); }

    /**
     * the block to which new swara spacer belongs to (i.e. swaras added using the
     * spacer would get added to this block
     * @type SongBlock
     * @private
     */
    this.fBlock = block;

    /**
     * a dummy swara model on which spacer is based up
     * @type Swara
     * @private
     */
    this.fModel = null;

    /**
     * get the song block associated with the swara spacer
     */
    this.getSongBlock = function() { return this.fBlock; }

    /**
     * get previous swara in the same row as the spacer (if any)
     * @return previous swara in the same row as the spacer (if any)
     * @type SwaraView
     */
    this.previousSwara = function() {
	var prevS = this.prevSelectable();
	while( prevS ) {
	    if( prevS.partType() == ROWVIEWPART_SWARA )
		break;
	    prev = prev.prevSelectable();
	}
	return prevS;
    }

    /**
     * get the underlying model
     * @return the underlying model
     * @type Swara
     */
    this.getModel = function() { 
	var p= null;
	var pm = null;
	var prevS = this.previousSwara();
	if( prevS ) pm = prevS.getModel();
	if( !p )  {
	    var speed = 0;
	    if( pm )
		speed = pm.getSpeed();
	    else if( this.rowView() ) {
		speed = this.rowView().pageView().songView().getSong().getDefaultSpeed();
	    }

	    if( !this.fModel )
		this.fModel = new Swara( "", false, 0, 1, speed );
	    else  {
		this.fModel.setOctave(0);
		this.fModel.setSpeed(speed);
	    }
	}
	else
	{
	    if( !this.fModel )
		this.fModel = new Swara( "", false, p.getOctave(), 1, p.getSpeed() );
	    else {
		this.fModel.setOctave(p.setOctave);
		this.fModel.setSpeed(p.setSpeed);
	    }
	}
	return this.fModel; 
    }

    /**
     * called by the base-class when this view is selected
     */
    this.onselect = function() {
	var m = this.getModel();
	EventManager.postEvent(EventManager.EVENT_NEWSWARASPACER_SELECTED, this, m );
    }

    /**
     * override of {@link SelectableRowViewPart#insertMode} to indicate
     * if we are in insert mode for swaras
     */
    this.insertMode = function() {
	// we are always in insert mode
	// return true;
	return NotationEditModeController.insertMode();
    }

    /**
     * override of {@link SelectableRowViewPart#editingInserted} to indicate
     * if are we still editing the object we just inserted
     */
    this.editingInserted = function() { 
	// we will never be in a mode where we have a valid swara which was
	// inserted and user is editing it.
	return this.fSelected;
    }

    /**
     * generate the HTML contents for the inner part of the spacer as div - this
     * inner part is meant to go into a table cell (renderd by call to 
     * {@link NewSwaraSpacerView#render} or {@link NewSwaraSpacerView#renderAsHTML})
     * <p>
     * The inner content is saved in a hold area and used later during render.
     *
     * @param {boolean} wholeAsHTML	(IGNORED) are we generating the whole cell 
     *					(as opposed to just inner contents) as HTML?
     *
     * @param {int}  nCols	 	the column span of the spacer (used later
     *				 	when render is called)
     * @return NOTHING MEANINGFUL
     */
    this.renderInner = function( wholeAsHTML, nCols ) {
	this.fNCols = nCols;
	var s = new Array();
	var i = 0;
	// padding 6: kludge to account for speed rows
	s[i++] = '<div class="sselem" style="padding-top:6px;width:100%;height:100%"><div class="newswaraspacer" style="'; 
	if(theSongView.isInteractive())
	    s[i++] = 'cursor pointer;';
	else
	    s[i++] = 'cursor:default;';
	s[i++] = 'border:thin solid ';
	s[i++] = this.fBackgroundColor;
	s[i++] = ';width:0.63em;">&nbsp;</div></div>';	
	this.fInnerHTML = s.join("");
	return this.fInnerHTML;
    }

    /**
     * render the view contents inside a table cell on a row-view
     * @param {SwaraLyricRow}	row		the row-view
     * @param {int}		partInRow	the nth tala part in this row
     *						to which this view goes into
     * @param {int}		cellidx		overall cell (column) index in
     *						the row
     * @return the table cell
     * @type DOMElement_TD
     */
    this.render = function(row, partInRow, cellidx) {
	if(!partInRow) partInRow = 0;

	if( !this.fInnerHTML ) return null;	// renderInner not called

	var ret = row.addDOMCell(false, partInRow, null, this.fNCols, cellidx);
	var td = ret.td;
	cellidx = ret.cellidx;

	// generate and set inner content
	td.innerHTML = this.generateHTML(row, partInRow);
	this.fInnerHTML = null;

	this.attach(td,cellidx);

	// add ourselves to the row
	row.addPart(this);
	return td;
    }

    /**
     * generate HTML content for entire swara view (table-cell) - assumes
     * renderInner is already called
     * <p>
     * The contents are added to the hold area of the row
     *
     * @param {SwaraLyricRowView } rowview   the row view
     * @param {int} 		   partInRow n as in nth tala part in the row 
     */
    this.renderAsHTML = function( row, partInRow) {
	// add speeds
	var s = this.generateHTML(row, partInRow);
	// join the contents and add it the hold area of our row
	row.addDOMCellAsHTML(false, partInRow, s);
	this.fInnerHTML = null;

	// add ourselves to the row
	row.addPart(this);
    }

    /**
     * generate the HTML contents of this view as a string and return it
     * @param {SwaraLyricRowView } rowview   the row view
     * @param {int} 		   partInRow n as in nth tala part in the row 
     * @param {boolean} innerOnly	generate only inner content
     * @type String
     * @return the HTML contents of the view
     */
    this.generateHTML = function(row, partInRow, innerOnly) {
	// add speeds
	var s = new Array();
	var i = 0;
	if(!innerOnly)
	    s[i++] = '<td colspan="' + this.fNCols + '" style="padding:0 0 0 0;">';
	s[i++] = '<table style="width:100%;padding:0 0 0 0;border-collapse:collapse;">';
	s[i++] = '<tr><td style="padding:0 0 0 0;">';
	s[i++] = '<div style="padding:0 0 0 0;overflow:hidden;height:';
	if( row.haveGamakas())
	    s[i++] = row.getGamakaHeight() + "px;";
	else
	    s[i++] = "1px;display:none;"; 	     // smallest
	s[i++] = '"></div></td></tr>';
	s[i++] = '<tr><td style="padding:0 0 0 0">'; // VERY IMPORTANT for speed markers to be continous across swaras
	s[i++] = this.fInnerHTML;
	s[i++] = '</td>';
	// filler: a width a MUST for IE (no adverse affects on FireFox)
	// a % value doesnt work on IE as it may expand table
	// DOES NOT WORK NICELY 
	//s[i++] = '<td style="width:100%;overflow:hidden;"></td>';
	s[i++] = '</tr></table>';
	if( !innerOnly )
	    s[i++] = '</td>';
	return s.join("");
    }

    /**
     * attach ourselves to a table-cell whose HTML content we generated earlier
     */
    this.attach = function( td, cellidx ) {
	// td.view     = this; 
	this.fTableCell = td;	// set table cell
	td.id          = Utils.getNewId("sw"); Utils.addToIdMap(td, this);
	this.domid     = td.id;
	this.fCellIdx = cellidx;

	var ow = Utils._findNodeByClass(td, "sselem");
	if(!ow ) return false;
	this.fInner = ow;
	var spacer = Utils._findNodeByClass(ow,"newswaraspacer");
	if(!spacer ) return false;
	this.initSelectable(spacer, true);
	return true;
    }

    /**
     * @ignore
     */
    this.fPartType = ROWVIEWPART_NEWSWARASPACER;
    block = null;

    /**
     * Hold area for inner HTML content - populated by 
     * {@link NewSwaraSpacerView#renderInner} and later used during rendering
     *
     * @type String
     * @private
     */
    this.fInnerHTML = null;
}
NewSwaraSpacerView.prototype = new SelectableRowViewPart();



/**
 * @class
 * represents the view/rendering of a tala marker
 * <p>
 * The view is a table-cell (td) in a row represented by {@link SwaraLyricRowView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link TalaMarkerView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is actually done in a few stages: o
 * <ul>
 * <li>A cache {@link TalaMarkerViewHTMLCache} is presumed to be populated with 
 *     "skeletal" content initially (skeletal in that HTML content is 
 *      generated via calls to {@link TalaMarkerView#generateHTML} and maintained
 *      in arrays with place-holders for lyric specific data parts like the 
 *      lyric label etc.). 
 * <li>Then {@link TalaMarkerView#renderAsHTML} simply gets the cache entries, and 
 *     "customizes" them for the specific lyric to generate the HTML content. 
 * <li>The HTML content is then passed to the row view which registers it
 *     with the HTML content hold area of the notation line - see 
 *     {@link NotationLine}. The rendering is done later on a call to
 * </ul>
 * </ul>
 *
 * In <u>both</u> cases, {@link TalaMarkerView#renderInner} which <b>must</b> 
 * called first and it sets up {@link TalaMarkerView#fInnerHTML} to indicate
 * what rendering should do.
 * <p>
 * In both cases, inner content is generated as a whole and rendered, there
 * is a need for a call to {@link SwaraView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function TalaMarkerView() 
{
    /**
     * get the underlying model - the tala part, can be null for a empty marker
     * @return the underlying model
     * @type TalaPart
     */
    this.getModel = function() { return this.fModel; }

    /**
     * generate the HTML contents for the inner part of tala marker as div - 
     * this inner part is meant to go into a table cell (renderd by call to 
     * {@link TalaMarkerView#render} or {@link TalaMarkerView#renderAsHTML})
     * <p>
     * The inner content is saved in a hold area and used later during render)
     * <p>
     * For progressive rendering, the hold area simply says "render" delegating
     * everything to render. For non-progressive rendering, we use a (global) 
     * cache, and so nothing needs to happen except that the hold area 
     * indicates that we use the cache
     *
     * @param {boolean} wholeAsHTML	are we generating the whole cell (as opposed to
     *					just inner contents) as HTML?
     * @param {TalaMarker} marker   	the tala marker model obj, can be null for
     *					an empty marker
     * @param {int}  nCols	   	the column span of the marker view (used later
     *					when render is called)
     * @param {boolean} inSwaraRow 	is the row onto which the marker should be rendered 
     *					a swara row?
     * @param {boolean} speedMarkersBelow	are speed marks below/above?
     * @return NOTHING MEANINGFUL
     */
    this.renderInner = function( wholeAsHTML, marker, song, ncols, inSwaraRow, speedMarkersBelow ) {
	this.fModel = marker;
	this.fNCols = ncols;
	this.fSong =  song;

	if( wholeAsHTML )
	    this.fInnerHTML = "cache";	// we will generate from cache (faster)
	else {
	    this.fInnerHTML = "render";	// do it in render
	    this.fSpeedMarkersBelow = speedMarkersBelow;
	}
	return this.fInnerHTML;
    }

    /**
     * render tala marker as a table cell (assumes renderInner is already called)
     * @param {SwaraLyricRowView} row 	   the table row view
     * @param {int} partInRow		   the part in the row to which this belongsto
     * @param {int} 		  cellidx  (optional) index of cell in row; if not 
     *					   provided added at end	 
     */
    this.render = function(row, partInRow, cellidx) {
	if(!this.fInnerHTML || this.fInnerHTML == "cache" )	// from cache
	    return null;

	var ret = row.addDOMCell(true, partInRow, null, this.fNCols, cellidx);
	var td = ret.td;
	cellidx = ret.cellidx;
	this.fTableCell = td;	// set table cell
	td.id          = Utils.getNewId("sw"); Utils.addToIdMap(td, this);
	this.domid     = td.id;
	td.align = "right";
	this.fOuter = td;
	this.fCellIdx = cellidx;

	// generate and set inner content
	var marker = null;
	if(this.fModel ) marker = this.fModel.fMarker;
	var ret = this.generateHTML(row.isSwaraRow(), marker, this.fSpeedMarkersBelow, true );
	if( ret.fontSize ) {
	    var f = null;
	    var swaraPrefs = this.fSong.getSwaraPrefs();
	    if( swaraPrefs )
		f = swaraPrefs.fontSize;
	    if( f == null || f == "" )
		f = "10pt";
	    ret.contents[ret.fontSize] = 'font-size:' + f + ';';
	}
	td.innerHTML = ret.contents.join("");
	this.fInnerHTML = false;

	this.attach(td, cellidx);

	// add ourselves to the row
	row.addPart(this);
	return td;
    }

    /**
     * Non-progressive rendering: generate HTML content for entire view 
     * (table-cell) - using the cache.
     * <p>
     * We always check the cache for already generated content (with space 
     * holders). If not in cache we bail. If in cache, we use the space 
     * holders for the txt and column span and populate it. We then add
     * the contents to the hold area in the row
     *
     * @param {SwaraLyricRowView } rowview   the row view
     * @param {int} 		   partInRow n as in nth tala part in the row 
     */
    this.renderAsHTML = function( row, partInRow ) {
	// look up the cache
	var marker = ((!this.fModel) ? "" : this.fModel.fMarker);
	var cacheEntry = TalaMarkerViewHTMLCache.get(row.isSwaraRow(), marker);
	if(!cacheEntry) { 
	    alert("unexpected: cannot find tala marker content in cache: " + marker );
	    failme(); 
	}

	// "customize" by filling in place holders
	var contents = cacheEntry.contents;
	var swaraPrefs = this.fSong.getSwaraPrefs();
	if( cacheEntry.fontSize && swaraPrefs && swaraPrefs.fontSize )
	    contents[cacheEntry.fontSize] = 'font-size:' + swaraPrefs.fontSize  + ';' ;
	contents[cacheEntry.ncols] = 1; // this.fNCols;	// spot for ncols;
	if( row.isSwaraRow() && alwaysGamakas )
	    contents[cacheEntry.gamaka] = (GAMAKA_HEIGHT_DEFAULT-4) + "px;";	// TODO: why 4 ?
	else if( row.isSwaraRow() && row.haveGamakas())
	    contents[cacheEntry.gamaka] = (row.getGamakaHeight()-0) + "px;";
	else {
	    contents[cacheEntry.gamaka] = "1px;display:none;";	// smallest
	}
	// join the contents and add it the hold area of our row
	row.addDOMCellAsHTML(true, partInRow, contents.join(""));

	// clear hold area
	this.fInnerHTML = null;

	// add ourselves to the row
	row.addPart(this);
	return;
    }

    /**
     * generate HTML content and returns it as an array of strings with the 
     * element where label goes is NULL
     *
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {boolean} inSwaraRow	is this marker in swara row?
     * @param {String}  marker		the tala marker
     * @param {boolean} speedMarkersBelow	are speed marks below/above?
     * @param           ret      	If not null, return info in this object
     *					rather than creating a new one
     *
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements. Once all elements are filled, the array can be 
     * "joined" to generate the HTML content
     */
    this.generateInnerHTML = function( inSwaraRow, marker, speedMarkersBelow, ret ) {
	var ri;
	if(!ret) {
	    ret = new Object();
	    ret.contents = new Array();
	    ri = 0;
	}
	else {
	    ri = ret.contents.length;
	}

	var contents = ret.contents;

	var s = new Array();
	var i = 0;
	if( inSwaraRow ) {
	    // octavize
	    s[i++] = '<div class="marker" style="width:100%;padding:0 0 0 0;float:left;text-align:center;">';
	    // create elem for tara stayi dot
	    s[i++] = '<center style="padding:0 0 0 0;"><div class="tstayi" style="';
	    s[i++] = 'overflow:hidden;height:';
	    var ht = STAYI_HEIGHT;
	    // 6  = 3 (STAYI_HEIGHT) +3/6: kludge to account for speed rows
	    if( !speedMarkersBelow )
	    	ht += 6;
	    else if( !Utils.isOpera() )
	    	ht += 2;	// KLUDGE
	    s[i++] = ht;
	    s[i++] = 'px;width:3px;padding:0 0 0 0;"></div></center>';	
	}

	// add label elem - make it same class as wrapper
	s[i++] = '<div class="marker" style="cursor:default;';
	//s[i++] = 'font-family;Lucida Grande,Lucida Console,Courier New,Courier;';
	s[i++] = 'font-weight:bold;font-style:normal;';
	var txt = null;

	// find out what we want to set the text as
	if( marker == "" )
	    txt = "&nbsp;";
	else if( marker == "||" )
	    txt = "| |";	/* give spacing so it isnt scrunched */
	else
	    txt = marker;	
	 /* 
	  * make the width as much as marker and a bit over so it has spacing
	  * around it - except for empty ones
	  */
	 if( marker == "" )
	 {
	    s[i++] = 'width:100%;';
	 }
	 else
	 {
	     s[i++] = 'width:';
	     s[i++] = (txt.length+1) + 'em;'
	 }
	 /* align to center so that there is space around it */
	s[i++] = 'text-align:center;';
	ret.contents[ri++] = s.join("");
	ret.contents[ri++] = null;
	ret.fontSize = ri-1;
	i = 0;
	s = new Array();
	s[i++] = 'padding:0 0 0 0;">';
	s[i++] = txt;
	s[i++] = '</div>';

	if( inSwaraRow ) {
	    // create elem for mandra stayi dot
	    s[i++] = '<center style="padding:0 0 0 0;"><div class="mstayi" style="';
	    s[i++] = 'overflow:hidden;height:3px;width:3px;padding:0 0 0 0;"></div></center>';
	    s[i++] = '</div>';	// ending div for octavewrapper
	}
	ret.contents[ri++] = s.join("");
	return ret;
    }

    /**
     * generate the HTML content for the table cell  as an array of strings
     * (with possibly space holders as null elements - which can later be
     * populated)
     *
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {boolean} inSwaraRow	is this marker in swara row?
     * @param {String}  marker		the tala marker
     * @param {boolean} speedMarkersBelow	are speed marks below/above?
     * @param {boolean} innerOnly	generate only inner content
     *
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements: "ncols": index of element representing column span;
     * "gamaka": index of element representing gamaka height specifier;
     . Once all elements are filled, the array can be "joined" to generate the
     * HTML content
     */
    this.generateHTML = function( inSwaraRow, marker, speedMarkersBelow, innerOnly ) {
	var ret = new Object();
	ret.contents = new Array();
	var i = 0;
	var contents = ret.contents;

	if(!innerOnly) {
	    contents[i++] = '<td align="right" colspan="' ;
	    contents[i++] = null;
	    ret.ncols = i-1;
	    contents[i++] = '" style="padding:0 4 0 2;">';	// f
	}
	var s = new Array();
	var si = 0;
	// margins - establish some spaceing around the marker (BUT DOES NOT WORK ON IE :( )
	s[si++] = '<table style="width:100%;padding:0 0 0 0;border-collapse:collapse;"><tr><td style="padding:0 0 0 0;height:';
	contents[i++] = s.join("");
	contents[i++] = null;	// spacing for gamaka height specifier
	ret.gamaka = i-1;
	contents[i++] = '"></td></tr><tr><td style="padding:0 0 0 0;">'; 

	this.generateInnerHTML(inSwaraRow, marker, speedMarkersBelow, ret);
	i = ret.contents.length;
	if(!innerOnly) 
	    contents[i++] = '</td></tr></table></td>';
	else
	    contents[i++] = '</td></tr></table>';
	return ret;
    }

    /**
     * attach ourselves to a table-cell whose HTML content we generated earlier
     */
    this.attach = function( td, cellidx ) {
	this.fCellIdx = cellidx;
	var tbl = td.firstChild;
	this.fGamakaContainer = tbl.rows[0].cells[0].firstChild;
	this.fInner = tbl.rows[1].cells[0].firstChild;
	return true;
    }

    /**
     * adjust the view based on the fact that the row's gamaka spacing
     * constraints have changed
     */
    this.adjustGamaka = function() {
	var rowView = this.rowView();
	if( !rowView.isSwaraRow() || this.fGamakaContainer == null ) return;
	if( rowView.haveGamakas()) {
	    this.fGamakaContainer.style.height = rowView.getGamakaHeight() + "px";
	    this.fGamakaContainer.style.display = "";
	}
	else {
	    this.fGamakaContainer.style.height = "1px";	// smallest
	    this.fGamakaContainer.style.display = "none";
	}
    }

   /**
    * @ignore
    */
    this.fPartType = ROWVIEWPART_TALAMARKER;


    /**
     * the tala marker model for which this object is the view
     * @type TalaMarker
     * @private
     */
    this.fModel         = null;

    /**
     * the inner content (div) of the tala marker view, which goes into
     * the outer content
     * @type DOMElement_DIV
     * @private
     */
    this.fInner  = null;

    /**
     * the DOM element in the content that is a container for gamaka (if any), which
     * is created when view is rendered ({@link TalaMarkerView#render})
     * @type DOMElement
     * @private
     */
    this.fGamakaContainer     = null;

    /**
     * Hold area for inner HTML content - populated by 
     * {@link TalaMarkerView#renderInner} and later used during rendering
     *
     * @type String
     * @private
     */
    this.fInnerHTML = null;

    this.fSong      = null;
}
TalaMarkerView.prototype = new RowViewPart();

/**
 * @class
 * represents the view/rendering of a lyric
 *
 * <p>
 * The view is a table-cell (td) in a row represented by {@link SwaraLyricRowView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link LyricView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is actually done in a few stages: o
 * <ul>
 * <li>A cache {@link LyricViewHTMLCache} is presumed to be populated with 
 *     "skeletal" content initially (skeletal in that HTML content is 
 *      generated via calls to {@link LyricView#generateHTML} and maintained
 *      in arrays with place-holders for lyric specific data parts like the 
 *      lyric label etc.). 
 * <li>Then {@link LyricView#renderAsHTML} simply gets the cache entries, and 
 *     "customizes" them for the specific lyric to generate the HTML content. 
 * <li>The HTML content is then passed to the row view which registers it
 *     with the HTML content hold area of the notation line - see 
 *     {@link NotationLine}. The rendering is done later on a call to
 * </ul>
 * </ul>
 *
 * In <u>both</u> cases, {@link LyricView#renderInner} which <b>must</b> 
 * called first and it stores the HTML content in the hold area 
 * {@link LyricView#fInnerHTML} (although in non-progressive case it simply
 * marks it as using cache).
 * <p>
 * In both cases, inner content is generated as a whole and rendered, there
 * is a need for a call to {@link LyricView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function LyricView() 
{
    /**
     * get the underlying model
     * @return the underlying model
     * @type Lyric
     */
    this.getModel = function() { return this.fModel; }

    this.setSwaraView = function(view) { this.fSwaraView = view; }
    this.getSwaraView = function() { return this.fSwaraView; }

    this.getDOMID = function() { return this.domid; }

    /**
     * called by the base-class when this view is selected
     */
    this.onselect = function() {
	EventManager.postEvent(EventManager.EVENT_LYRIC_SELECTED, this, this.fModel);
    }

    /**
     * called by the base class when the text color of the view is changed
     * @param {String} color	the text color of the view as a string usable
     *				in a css style
     */
    this.oncolorChange = function()  {
	if( this.fInner) this.fInner.style.color = this.fColor;
    }

    /**
     * generate the HTML contents for the inner part of lyric - this inner 
     * part is meant to go into a table cell (renderd by call to 
     * {@link LyricView#render} or {@link LyricView#renderAsHTML})
     * <p>
     * The inner content is saved in a hold area and used later during render)
     * <p>
     * For progressive rendering, the inner content is saved in a hold 
     * area and used later during render. For non-progressive rendering,
     * we use a (global) cache, and so nothing needs to happen except
     * that the hold area indicates that we use the cache
     *
     * @param {boolean} wholeAsHTML	are we generating the whole cell (as opposed to
     *					just inner contents) as HTML?
     * @param {Lyric} lyric	  	the lyric model obj
     * @param {int}  nCols	   	the column span of the lyric (used later
     *					when render is called)
     * @param {Swara} swara             associated swara object if any
     * @return NOTHING MEANINGFUL
     */
    this.renderInner = function( wholeAsHTML, lyric, nCols, swara ) {
	this.fModel = lyric;
	this.fNCols = nCols;
	var mcolor = this.fModel.getDefaultFontColor();
	if( mcolor != null && mcolor != "" )
	    this.fColor = mcolor;
	else
	    this.fColor = 'rgb(0,0,128)';	// blue is default;

	if( wholeAsHTML ) {
	    // non-progressive rendering: use the cache (faster)(
	    this.fInnerHTML = "cache";	
	    this.fSwara     = swara;
	}
	else {
	    var ret = new Object();
	    ret.contents = new Array();

	    // first translate content
	    var txt = lyric.getText();
	    var translator = lyric.getTranslator();
	    if(translator != null )
		txt = translateHTML(txt, translator);
	    if( !txt || txt == "" ) txt = "&nbsp;";

	    // generate inner content
	    this.generateInnerHTML(this.fBackgroundColor, txt, ret);

	    // set font, font size
	    if( ret.fontName ) {
		var f = this.fModel.getDefaultFont();
		if( f != null && f != "" )
		    ret.contents[ret.fontName] = "font-family:'" + f + "';";
		else
		    ret.contents[ret.fontName] = '';
	    }
	    if( ret.fontSize ) {
		var f = this.fModel.getDefaultFontSize();
		if( f == null || f == "" )
		    f = "10pt";
		ret.contents[ret.fontSize] = 'font-size:' + f + ';';
	    }
	    if( swara && swara.getLabel() == ".." ) {
	        // for .. => repeat of early sangati, swara cell is "wide" 
		// and so make lyric align at center
	        ret.contents[ret.textAlign] = "center";
	    }
	    else {
	        // NOTE: changed alignment to left to allow for spacing after phrasends
	        ret.contents[ret.textAlign] = "left";
	    }
	    if( ret.color )
		ret.contents[ret.fontSize] = this.fColor;

	    this.fInnerHTML = ret.contents.join("");
	}
	return this.fInnerHTML;
    }

    /**
     * render the lyric as a table cell (Note: assumes renderInner is already called)
     *
     * @param {SwaraLyricRowView } rowview the row view
     * @param {int} partInRow		   n as in nth tala part in the row 
     * @param {int} cellidx		   (optional) index of cell in row; if 
     *					   not provided added at end	 
     * @return the table-cell element representing the view contents
     * @type DOMElement_TD
     */
    this.render = function( row, partInRow, cellidx ) {
	if( !this.fInnerHTML || this.fInnerHTML == "cache" ) 
	    return null;

	// create table-cell, this contains all content for a swara or lyric
	var ret;
	ret = row.addDOMCell(false, partInRow, this.fInner, this.fNCols, cellidx);
	var td  = ret.td;
	cellidx = ret.cellidx;
	this.fTableCell = td;
	td.id          = Utils.getNewId("ly"); Utils.addToIdMap(td, this);
	this.domid     = td.id;
	td.className          = "nelemp";
	//td.style.paddingTop   = "4px";
	td.style.paddingRight = "0px";
	td.style.paddingLeft  = "0px";
	// NOTE: changed alignment to left to allow for spacing after phrasends
	td.style.textAlign    = "left";

	// set inner content
	td.innerHTML = this.fInnerHTML;
	this.fInnerHTML = null;

	this.attach(td, cellidx);

	// add ourselves to the row
	row.addPart(this);
	return td;
    }

    /**
     * Non-progressive rendering: generate HTML content for entire view 
     * (table-cell) - using the cache.
     * <p>
     * We always check the cache for already generated content (with space 
     * holders). If not in cache we bail. If in cache, we use the space 
     * holders for the txt and column span and populate it. We then add
     * the contents to the hold area in the row
     *
     * @param {SwaraLyricRowView } rowview   the row view
     * @param {int} 		   partInRow n as in nth tala part in the row 
     */
    this.renderAsHTML = function( row, partInRow ) {
	// look up the cache
	var cacheEntry = LyricViewHTMLCache.get(this.fNCols,this.fModel.getText());
	if(!cacheEntry) { 
	    alert("unexpected: cannot find lyric content in cache: " + this.fModel.getText());
	    failme(); 
	}
	var contents = cacheEntry.contents;
	if( cacheEntry.ncols )
	    contents[cacheEntry.ncols] = this.fNCols;	
	if( cacheEntry.id ) {
	    contents[cacheEntry.id]    = Utils.getNewId("ly");
	    this.domid = contents[cacheEntry.id];
	}
	if(this.fModel.hasTimeIndices()) {
	    var song = this.fModel.getBlock().getSong();
	    var audioManager = this.fModel.getBlock().getSong().getAudioManager();
	    if(song && song.hasAudio() && audioManager) 
		audioManager.addTimeIndices(this, song.getAudio(), this.fModel.getTimeIndices());
	}

	// set font, font size
	if( cacheEntry.fontName ) {
	    var f = this.fModel.getDefaultFont();
	    if( f != null && f != "" )
		contents[cacheEntry.fontName] = "font-family:'" + f + "';";
	    else
		contents[cacheEntry.fontName] = '';
	}
	if( cacheEntry.fontSize ) {
	    var f = this.fModel.getDefaultFontSize();
	    if( f == null || f == "" )
	    	f = "10pt";
	    contents[cacheEntry.fontSize] = 'font-size:' + f + ';';
	}

	if( cacheEntry.textAlign ) {
	    if( this.fSwara && this.fSwara.getLabel() == ".." ) {
	         contents[cacheEntry.textAlign] = "center;";
	    }
	    else {
	         contents[cacheEntry.textAlign] = "left";
	    }
	}


	// set color
	if( cacheEntry.color )
	    contents[cacheEntry.color] = this.fColor;
	if( cacheEntry.txt ) {
	    var txt = this.fModel.getText();
	    // now translator
	    var translator = this.fModel.getTranslator();
	    if(translator != null )
		txt = translateHTML(txt, translator);
	    if( !txt || txt == "" ) txt = "&nbsp;";

	    if(!txt || txt == "") txt = "&nbsp;";
	    contents[cacheEntry.txt] = txt;
	}

	// join the contents and add it the hold area of our row
	row.addDOMCellAsHTML(false, partInRow, contents.join(""));

	this.fInnerHTML = null;	// clear our local hold area

	// add ourselves to the row
	row.addPart(this);
	return;
    }

    /**
     * generate HTML content and returns it as an array of strings with the 
     * element where label goes is NULL
     *
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {String} bgcolor	background color as would go in a CSS style
     * @param {String} txt	lyric text. <b>can be null</b> in which
     *				case a spacer holder is reserved for text
     *				in the content. The index of the txt area
     *				is available as prop in returned obj
     * @param          ret      If not null, return info in this object
     *				rather than creating a new one
     *
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements: "txt" : index of element representing text of 
     * lyric. "fontName': index of element representing swara font, "fontSize':
     * index of element representing swara font size, "color" the color of 
     * text.  Once all null are filled, the array can be "joined" to 
     * generate the HTML content
     */
    this.generateInnerHTML = function( bgcolor, txt, ret ) {
	var i;
	if(!ret) {
	    ret = new Object();
	    ret.contents = new Array();
	    i = 0;
	}
	else {
	    i = ret.contents.length;
	}

	var contents = ret.contents;
	contents[i++] = '<div class="nelem" style="width:100%;';
	if( txt == null ) {
	    contents[i++] = null;
	    ret.fontName = i-1;

	    contents[i++] = null;
	    ret.fontSize = i-1;

	    contents[i++] = 'color:';
	    contents[i++] = null;
	    ret.color = i-1;
	    contents[i++] = ';';

	    contents[i++] = 'text-align:';
	    contents[i++] = null;
	    ret.textAlign = i-1;
	    contents[i++] = ';';

	}
	var s = new Array();
	var si = 0;
	s[si++] = 'padding:0 0 0 0;';
	s[si++] = 'z-index:1;vertical-align:top;';
	if(theSongView.isInteractive())
	    s[si++] = 'cursor:pointer;';
	else
	    s[si++] = 'cursor:default;';
	s[si++] = 'border:thin solid ';
	s[si++] = bgcolor;
	s[si++] = ';">';
	if( txt != null ) {
	    if( !txt || txt == "" ) txt = "&nbsp;";
	    s[si++] = txt;
	    s[si++]  ="</div>";
	    contents[i++] = s.join("");
	}
	else {
	    contents[i++] = s.join("");
	    contents[i++] = null;	// TEXT SPOT
	    ret.txt = i-1;
	    contents[i++] = "</div>";
	}
	return ret;
    }

    /**
     * generate the HTML content for the table cell  as an array of strings
     * (with possibly space holders as null elements - which can later be
     * populated)
     *
     * Note: In non-progressive rendering, this is called only during
     * cache population
     *
     * @param {String} bgcolor	background color as would go in a CSS style
     * @param {String} txt	lyric text. <b>can be null</b> in which
     *				case a spacer holder is reserved for text
     *				in the content. The index of the txt area
     *				is available as prop in returned obj
     * @param {int}  colspan	The column span of lyric. <b>can be null</b> 
     *				in which case a spacer holder is reserved for 
     *				text in the content. The index of the text area
     *				is available as prop in returned obj.
     *
     * @return an object which has a property "contents" that is an array
     * of strings representing HTML content. Some elements of array may be
     * null, in which case other specific properties indicate the indices
     * of those elements: "txt" : index of element representing text of 
     * lyric; "ncols": index of element representing column span. 
     * "fontName': index of element representing swara font, "fontSize':
     * index of element representing swara font size, "color" color of text. 
     * Once all null are filled, the array can be "joined" to generate 
     * the HTML content
     */
    this.generateHTML = function( bgcolor, txt, colspan ) {
	var ret = new Object();
	ret.contents = new Array();
	var i = 0;
	var contents = ret.contents;

	contents[i++] = '<td valign="top" class="nelemp" colspan="';
	if( colspan ) 
	    // column specified
	    contents[i++] = colspan;
	else {
	    // no column specified - so need to reserve space
	    contents[i++] = null;
	    ret.ncols = i-1;
	}

	if( !txt || !colspan ) {
	    contents[i++] = '" id="';
	    contents[i++] = null;
	    ret.id = i-1;
	}

	// NOTE: changed alignment to left to allow for spacing after phrasends
	contents[i++] = '" style="padding:0 0 0 0;text-align:left;">';

	this.generateInnerHTML(bgcolor, txt, ret);
	i = ret.contents.length;
	contents[i++] = "</td>";
	if( txt && colspan ) {
	    // both text and colspan specified
	    var fullcontents = ret.contents.join("");
	    ret.contents = new Array();
	    ret.contents[0] = fullcontents;
	}
	return ret;
    }

    /**
     * attach ourselves to a table-cell whose HTML content we generated earlier
     */
    this.attach = function( td, cellidx ) {
	this.fCellIdx = cellidx;
	var nelem = td.firstChild;
	if(!nelem ) return false;
	this.fInner          = nelem;
	this.fLabelNode      = nelem.firstChild;
	this.initSelectable(nelem, true);
	return true;
    }

    /**
     * set the label of the underlying model and update the view
     * accordingly
     */
    this.setLabel = function(lbl) { 
    	this.fModel.setText(lbl);
	if( lbl != "" )
	    this.fLabelNode.nodeValue = lbl;
	else
	    this.fLabelNode.nodeValue = "\xa0";
	//if( txt == "\xa0" )
	    //this.fSelectableElem.style.background = "rgb(224,224,255)";	// light blue
	//else
	    //this.fSelectableElem.style.background = "none";
    }

    /**
     * override
     */
    this.clicked = function() {
	if(theSongView.isInteractive()) {
	    theSongView.selectObject(this);
	}
	else if( this.fModel.hasTimeIndices() ) {
	    var song = this.fModel.getBlock().getSong();
	    if( song.hasAudio() ) {
		var audioManager = song.getAudioManager();
		// ??? present choice ??
		if(audioManager) audioManager.seekTo(song.getAudio(), this.fModel.getTimeIndices()[0]);
	    }
	}
    }

    /**
     * the lyric model for which this object is the view
     * @type Lyric
     * @private
     */
    this.fModel         = null;

    /**
     * @ignore
     */
    this.fPartType = ROWVIEWPART_LYRIC;

    /**
     * the inner content (div) of the lyric view, which goes into
     * the outer content
     * @type DOMElement_DIV
     * @private
     */
    this.fInner         = null;

    /**
     * the label node
     * @type DOMElement_Text
     * @private
     */
    this.fLabelNode     = null;

    /**
     * Hold area for inner HTML content - populated by 
     * {@link SpacerView#renderInner} and later used during rendering
     *
     * @type String
     * @private
     */
    this.fInnerHTML = null;

    this.fSwaraView = null;
}
LyricView.prototype = new SelectableRowViewPart();

/**
 * @class
 * represent a spacer (occupies space) within a swara or lyric row {@link SwaraLyricRowView}
 * <p>
 * The view is a table-cell (td) in a row represented by {@link SwaraLyricRowView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link SpacerView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done by {@link SpacerView#renderAsHTML}
 * </ul>
 *
 * In <u>both</u> cases, the <i>inner</i> (i.e. whats inside the table cell that
 * represents the heading) content is always generated as HTML content in
 * {@link SpacerView#renderInner} which <b>must</b> called first and it stores 
 * the HTML content in the hold area {@link SpacerView#fInnerHTML}. Once this is 
 * done, in the progressive rendering case we render it by doing td.innerHTML 
 * (where td is the DOM table-cell). In the non-progressive case, we generate 
 * the HTML content of td, and stick the inner HTML content inside and return  
 * the entire content
 *
 * Since in both cases, inner content is generated as a whole and rendered, both
 * cases need a call to {@link SpacerView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function SpacerView() 
{
    /**
     * render the inner part of the spacer as div - this inner part goes into a
     * table cell (renderd by call to {@link SpacerView#render} or 
     * {@link SpacerView#renderAsHTML})
     * <p>
     * The inner content is saved in a hold area and used later during render)
     *
     * @param {boolean} wholeAsHTML	(IGNORED) are we generating the whole 
     *					cell (as opposed to just inner 
     *					contents) as HTML?
     * @param {int}  nCols	 the column span of the spacer (used later
     *				 when render is called)
     * @return NOTHING MEANINGFUL
     */
    this.renderInner = function( wholeAsHTML, nCols ) {
	this.fInnerHTML = '<div class="spacer" style="width:100%;height:100%;"></div>';
	this.fNCols = nCols;
	return this.fInnerHTML;
    }

    /**
     * progressive-rendering - render the spacer as a table cell (Note: assumes
     * renderInner is already called)
     *
     * @param {SwaraLyricRowView } rowview the row view
     * @param {int} partInRow		   n, as in the nth tala part in the 
     *					   row to which this belongsto
     * @param {int} cellidx		   (optional) index of cell in row; if 
     *					   not provided added at end	 
     * @return the table-cell element representing the view contents
     * @type DOMElement_TD
     */
    this.render = function(row, partInRow, cellidx) {
	if(!partInRow) partInRow = 0;

	// hold area is non-empty => renderInner not called
	if( !this.fInnerHTML ) return null;	

	ret = row.addDOMCell(false, partInRow, null, this.fNCols, cellidx);
	var td = ret.td;
	cellidx = ret.cellidx;
	this.fTableCell = td;
	td.id          = Utils.getNewId("sw"); Utils.addToIdMap(td, this);
	this.domid     = td.id;

	// set inner content
	td.innerHTML = this.fInnerHTML;
	this.fInnerHTML = null;

	this.attach(td,cellidx);

	// add ourselves to the row
	row.addPart(this);
	return td;
    }

    /**
     * (non-progressive rendering) generate HTML content for entire spacer 
     * view (table-cell) - assumes renderInner is already called
     * @param {SwaraLyricRowView} row		the row to which we belong
     * @param {int}		  partInRow	n, as in nth tala part in row
     */
    this.renderAsHTML = function( row, partInRow ) {
	var s = new Array();
	var i = 0;
	s[i++] = '<td colspan="';
	s[i++] = this.fNCols;
	s[i++] = '">';
	s[i++] = this.fInnerHTML;
	s[i++] = '</td>';
	row.addDOMCellAsHTML(false, partInRow, s.join(""));
	this.fInnerHTML = null;	// clear hold area
	
	// add ourselves to the row
	row.addPart(this);
    }

    /**
     * attach ourselves to a table-cell whose HTML content we generated earlier
     */
    this.attach = function(td, cellidx) {
	this.fCellIdx = cellidx;
	this.fInner = Utils._findNodeByClass(td,"spacer");
	if(!this.fInner) return false;
	this.fOuter = td;
	this.fInnerHTML = null;	// clear hold area (if any)
	return true;
    }

    /**
     * @ignore
     */
    this.fPartType = ROWVIEWPART_SPACER;

    /**
     * the inner content (div) of the lyric view, which goes into
     * the outer content
     * @type DOMElement_DIV
     * @private
     */
    this.fInner = null;

    /**
     * Hold area for inner HTML content - populated by 
     * {@link SpacerView#renderInner} and later used during rendering
     *
     * @type String
     * @private
     */
    this.fInnerHTML = null;
}
SpacerView.prototype = new RowViewPart();

/**
 * @class
 * base class represents a page view part, which would be part of a {@link PageView}
 */
function PageViewPart()
{
    /**
     * get the page view part type
     * @return the page view part type
     * @type PAGEVIEWPART_TYPE
     */
    this.partType = function() { return this.fPartType; }

    /**
     * get the page view of which this view is part of, which is set only when
     * view is rendered
     *
     * @return the page view which this view is part of
     * @type PageView
     */
    this.pageView = function() { return this.parent; }

    /**
     * get the DOM contents of the view
     * @return the DOM contents of the view
     * @type DOMElement
     */
    this.getContents = function() { return this.fOuter; }

    /**
     * is this view part selectable? The  answer is false by default
     * selectable page view part
     * @return true or false as to whether this page view part is selectable
     * @type boolean
     */
    this.isSelectable = function() { return false; }

    /**
     * indicates if this page view part should be skipped after
     * a page break (answer is false by default)
     * @return true or false indicating if this view part should
     *         not be rendered after a page break
     * @type boolean
     */
    this.skipOnPageBreak = function() { return false; }

    /**
     * (protected) the page view part type
     * @type PAGEVIEWPART_TYPE
     * @private
     */
    this.fPartType = null;

    /**
     * (protected) the outer content of the page view part
     * @type DOMElement
     * @private
     */
    this.fOuter = null;

}

/**
 * @class
 * base class represents a page view part, which is rendered as table row in a 
 * table that is part of a {@link PageView}
 */
function TableRowPageViewPart() 
{
    /**
     * get the next row (default implementation
     * @return {TableRowPageViewPart} the next row if any, else returns null
     */
    this.nextRow = function() {
	if( this.next ) {
	    return this.next;
	}
	return null;
    }

    this.nextSibling = function() { return this.nextRow(); }

    /**
     * get the prev row (default implementation
     * @return {TableRowPageViewPart} the prev row if any, else returns null
     */
    this.prevRow = function() {
	if( this.prev ) {
	    return this.prev;
	}
	return null;
    }

    this.prevSibling = function() { return this.prevRow(); }

    /**
     * get the table of which this view (row) is part of
     * @return the DOM TABLE which this view is part of
     * @type DOMElement_TABLE
     */
    this.getTable = function() { return this.fTable; }

    /**
     * move the HTML contents of the row from one HTML table to another
     * @param {DOMElement_TABLE}	the new table to which the contents 
     *					need to be moved
     * @param {idx}			the index in that table
     */
    this.moveHTMLContents = function(toTable, idx) {
	var ntr = toTable.insertRow(idx);
	var tr = this.getContents();
	var ncells= tr.cells.length;
	for(i = 0; i < ncells; i++ ) {
	    var td = tr.cells[0];
	    tr.removeChild(td);
	    ntr.appendChild(td);
	}

	// delete us from the current table
	this.deleteHTMLContents();

	if(this.fOuter) this.removeFromIdMap(this.fOuter); 
	this.fTable = toTable;
	this.fOuter = ntr;
	ntr.id          = Utils.getNewId("tr"); Utils.addToIdMap(ntr, this);
	this.domid     = td.id;
	this.fTableRowDOMId = ntr.id;
    }

    /*
     * delete the HTML content of the row
     */
    this.deleteHTMLContents = function() {
	this.fTable.deleteRow(this.getRowIndex());
    }

    /**
     * get the index of this row view in its table
     */
    this.getRowIndex = function() {
	if( this.fTable == null ) return -1;

	// figure out row index
	var nrows = this.fTable.rows.length;
	var rowIndex;
	for(rowIndex = 0; rowIndex < nrows; rowIndex++ ) {
	    if( this.fTable.rows[rowIndex].id && this.fTable.rows[rowIndex].id == this.fTableRowDOMId ) break;
	}
	return rowIndex;
    }

    /**
     * get the column index (including span) of a cell
     * @param {int} 	cellindex	cellindex
     */
    this.getColumnIndex = function(cellIndex)  {
	var part = this.fFirstPart;
	var i = 0;
	var col = 0;
	while( i < cellIndex ) {
	    col += part.colspan();
	    part = part.next;
	    if( part == null ) break;
	    i++;
	}
	return col;
    }

    /**
     * get the column span of the heading (i.e. number of columns in the row)
     */
    this.colspan = function() 
    { 
	if( this.fOuter == null ) return 0;
	var colspan = 0;
	var ncells = this.fOuter.cells.length;
	cells = this.fOuter.cells;
	for(var i = 0; i < ncells; i++ )
	    colspan += cells[i].colSpan;
	return colspan;
    }

    /**
     * get the bottom coordinate of the row
     */
    this.getBottom = function() {
	var tr = this.getContents();
	var ht = tr.firstChild.offsetHeight;
	ht += this.fTable.offsetTop;
	return tr.firstChild.offsetTop + ht;
    }


    /**
     * get the height of the row
     */
    this.getHeight = function() {
	return this.getContents().firstChild.offsetHeight;
    }

    /**
     * (protected) the DOM table this view is part of
     * @type DOMElement_TABLE
     * @private
     */
    this.fTable = null;

}
TableRowPageViewPart.prototype = new PageViewPart();

/**
 * @class
 * base class represents a selectable page view part, which would be part of a {@link PageView}
 */
function SelectableTableRowPageViewPart()
{
    /**
     * is this view part selectable? The  answer is true for a 
     * selectable page view part
     * @return true or false as to whether this page view part is selectable
     * @type boolean
     */
    this.isSelectable = function() { return true; }

    /**
     * select or deselect this part
     * @param {boolean} val	true or false indicating if view should be selected or deselected
     */
    this.select = function(val) {
	if( this.fSelectableElem ) {
	    if( val ) {
		this.fSelectableElem.style.border = "thin solid #0000ff";	// blue border
		this.onselect();
	    }
	    else {
		//this.fSelectableElem.style.background = this.fBackgroundColor;
		//this.fSelectableElem.style.color      = this.fColor;
		this.fSelectableElem.style.border     = "thin solid "+ this.fBackgroundColor;
	    }
	}
	this.fSelected = val;
	return true;
    }

    /**
     * (protected) called when the view is selected - derived classes can override
     * this to implement view specific functionality
     * @private
     */
    this.onselect = function() {
    }

    /**
     * (protected) event handler called when mouse enters this view - derived classes
     * should set this as the hover function for the approp dom elem in the view
     * to provide visual indication that item is selectable
     * @private
     */
    function labelHoverEnter() {
	var view = this;
	if( view && !view.fSelected && view.fSelectableElem )
		view.fSelectableElem.style.border = "thin solid #000000";
    }
    this.labelHoverEnter = labelHoverEnter;

    /**
     * event handler called when mouse leaves this view
     */
    function labelHoverExit() {
	var view = this;
	if( view && !view.fSelected && view.fSelectableElem )
	    view.fSelectableElem.style.border = "thin solid " + view.fBackgroundColor;
    }
    this.labelHoverExit = labelHoverExit;

    /**
     * event handler called when mouse is clicked on this view
     */
    function labelClicked(e) {
	if(!e )
	    e = event;
	var view = this;
	if( view ) {
	    view.clicked();

	    e.cancelBubble = true;
	    if( e.stopProgapation ) e.stopPropagation();
	}

	e.returnValue = false;
	if( e.stop )
	    e.stop();
	if( e.preventDefault )
	    e.preventDefault();
    }
    this.labelClicked = labelClicked;

    /**
     * called when this view is clicked on by the mouse
     */
    this.clicked = function() {
	var songView = this.pageView().songView();
	songView.selectObject(this);
    }


    /**
     * set the background color of this view
     * @param {String} color	the background color as a string one would 
     *				specify in the css style
     */
    this.setBackgroundColor = function(color) { this.fBackgroundColor = color; }

    /**
     * (protected) called when text color is changed - derived classes can override this
     * @private
     */
    this.oncolorChange = function() {
    }

    /**
     * (protected) derived classes must call this on rendering to enable
     * selectability
     * @param {DOMElement} selectableElem  the element that is selectable
     * @param {boolean}	   dontSetStyle	   if true, dont set style elem
     */
    this.initSelectable = function(selectableElem, dontSetStyle) {
	if(!theSongView.isInteractive()) return; // if not interactive, nothing is selectable
	this.fSelectableElem       = selectableElem;
	selectableElem.onclick     = _labelClicked; // (this);
	selectableElem.onmouseover = _labelHoverEnter; // (this);
	selectableElem.onmouseout  = _labelHoverExit; // (this);
	if(!dontSetStyle) {
	    selectableElem.style.cursor = "pointer";
	    selectableElem.style.border = "thin solid " + this.fBackgroundColor;
	}
	selectableElem.id          = Utils.getNewId("tr");
	Utils.addToIdMap(selectableElem, this);
    }

    /**
     * the DOM element of the content that contains the selectable part (derived classes
     * should set this appropriately on rendering)
     * @type DOMElement
     * @private
     */
    this.fSelectableElem= null;

    /**
     * the background color of this view as a string one would specify in css style
     * @type String
     * @private
     */
    this.fBackgroundColor = "#ffffff";
}
SelectableTableRowPageViewPart.prototype = new TableRowPageViewPart();


/**
 * @class
 * represents the break in the song
 * <p>
 * The view is a table-row in a table inside a page represented by {@link PageView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link BreakView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done by {@link BreakView#renderAsHTML}
 * </ul>
 * In <u>both</u> cases, the <i>inner</i> (i.e. whats inside the table cell that
 * represents the heading) content is always generated as HTML content in
 * {@link:BreakView#renderInnerAsHTML}. Once this is done, in the progressive
 * rendering case we render it by doing td.innerHTML (where td is the DOM
 * table-cell). In the non-progressive case, we generate the HTML content of 
 * td, and stick the inner HTML content inside and return  the entire content
 *
 * Since in both cases, inner content is generated as a whole and rendered, both
 * cases need a call to {@link BreakView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function BreakView() 
{
    /**
     * indicates if this page view part should be skipped after
     * a page break (answer is true for song breaks)
     * @return true or false indicating if this view part should
     *         not be rendered after a page break
     * @type boolean
     */
    this.skipOnPageBreak = function() { return true; }

    /**
     * render the break as a table row
     * @param {int}              ncols	# of columns in the table
     * @param {DOMElement_TABLE} table	the DOM table
     * @param {int} idx		index of row in table (optional, in which case add to end)
     */
    this.render = function(ncols, table, idx) {
	if( !idx ) idx = table.rows.length;
	var tr = table.insertRow(idx);
	tr.className = "SongBreak";	// required for attach below
	var td = Utils.addTableCell(tr, null, ncols);
	td.innerHTML = this.renderInnerAsHTML();
	this.attach(table, tr, idx);
	return tr;
    }

    /**
     * render the HTML contents of the break and return it
     * @return the HTML representation of the table row
     * @type String
     */
    this.renderAsHTML = function(ncols) {
	var s = new Array();
	var i = 0;
	s[i++] = '<tr class="SongBreak"><td colspan="';
	s[i++] = ncols;
	s[i++] = '">';
	s[i++] = this.renderInnerAsHTML();
	s[i++] = '</td></tr>';
	return s.join("");
    }

    /**
     * generate the HTML representation of the inner contents of the break and
     * return it
     * @return the HTML representation of the inner contents of the table cell
     * @type String
     */
    this.renderInnerAsHTML = function() {
	return '<div class="SongBreak"></div>';
    }

    /**
     * attach to the contents of an already rendered table row whose HTML
     * content was generated using this.renderAsHTML or this.render
     *
     * @param {DOMElement_TABLE} table	the table
     * @param {DOMElement_TR}    tr	the table row
     * @param {int}              rowidx	the table row index
     * @return true or false indicating if attach was successful
     * @param boolean
     */
    this.attach = function(table, tr, rowidx) {
	if(tr.className != "SongBreak" ) {
	    alert("attach failed - not break row");
	    return false;
	}
	this.fOuter = tr;	// outer tr
	this.fTable = table;	// outer table
	this.fOuter.id = Utils.getNewId("tr");
	Utils.addToIdMap(this.fOuter,this);
	return true;
    }

    /**
     * @ignore
     */
    this.fPartType = PAGEVIEWPART_BREAK;
}
BreakView.prototype = new TableRowPageViewPart();

/**
 * @class
 * represents the view line in notation which consists of zero or more 
 * swara-rows and (associated) lyric rows.
 * <p>
 * The concept of a view that groups these swara and/or lyric rows together is
 * a localized one that is intended to be known and managed only by 
 * SwaraLyricRow (which represents an individual row of such a group). Outside
 * of SwaraLyricRow and NotationLine, these rows are individual entities and 
 * the NotationLine is NOT visible.
 * <p>
 * Note: This abstraction (which does seem complex) is mainly because the 
 * concept of NotationLine was introduced  late and thus we wanted to avoid a 
 * major major rehaul of entire view architecture.
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link NotationLine#render}
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done as follows:
 * <ul>
 * <li>A initial call to {@link NotationLine#renderInnerRowAsHTML} with the view
 *     parameter non-null (indicating first row in the notation line) will create
 *     a holding area in which to gather all contents. The hold area is
 *     {@link NotationLine@fInnerHTML} which is an array of arrays. Each element
 *     in outer array stands for a swara or lyric row in notation line. Each inner
 *     array stands for the html content of the swara lyric row. This 
 *     (first) invocation of renderInnerRowAsHTML returns the reference to the 
 *     inner array for the first row in the line
 * <li>Subsequent calls to to {@link NotationLine#renderInnerRowAsHTML} should have
 *     the view parameter null (indicating adding row to notatiokn line) and this
 *     will create new entries in the hold area for the row - the reference to the
 *     the inner array for this row would be return
 * <li> Individual notation view objects will call their row's addDOMCellAsHTML
 *      (i.e. {@link SwaraLyricRowView#addDOMCellAsHTML} methods to populate the
 *      inner arrays (whose references are saved by the row objects on return 
 *      from call to renderInnerRowAsHTML)
 * <li>Finally a call to {@link NotationLine#renderHTMLContent} combines all the
 *     HTML content and returns the HTML content for the entire notation line.
 *     The hold area is freed
 * </u>
 * </ul>
 */
function NotationLine()
{
    /**
     * (progressive rendering) render the Notation as a row in the outer table
     *
     * @param {Tala}    	  tala		the tala of the notations in 
     *						the line
     * @param {int} indexInLayoutCycle		index of row in layout cycle
     * @param {DOMElement_TABLE}  table		the DOM table under which this
     *						view is to be rendered
     * @param {boolean}		compactLayout	compact layout or are we
     *						spreading to occupy entire 
     *						page width?
     * @param {int}		  idx		row index in table 
     * @param {SwaraLyricRowView} rowView	the swara or lyric row view
     *						that is the first row of
     *						notations in it. The TR
     *						DOM element's <i>view</i>
     *						property will point to it
     * @param {String}		 heading	heading for the notation if any
     * @return the table row that represents the rendering.
     * @type DOMElement_TR
     */
    this.render = function(tala, indexInLayoutCycle, table, compactLayout, idx, rowView, heading) {
	if( !idx ) idx = table.rows.length;
	// insert a row
	this.fOuter = table.insertRow(idx);

	/*
	 * now add guide-cells for every tala part in the row (and one for
	 * every marker). The guide-cells will always be row #1
	 */
	var tl              = tala.getLayout();
	var r               = indexInLayoutCycle;	// tl.GUIDE_ROW;
	var nParts          = tl.getRowPartCount(r)*2; // * 2 => to account for tala markers
	var spans           = tl.getRowPartSpans(r,true);
	var colinfo         = tl.getRowPartColInfo(r);
	if( indexInLayoutCycle == tl.GUIDE_ROW )
	    this.fOuter.className = "guiderow";
	else
	    this.fOuter.className = "nline";

	// MARGIN TEST
	var marginTD = Utils.addTableCell(this.fOuter, null, 1, i);
	marginTD.valign = "center";
	marginTD.style.padding = "0 0 0 0";
	marginTD.style.fontSize = "small";
	var s = document.createElement("span");
	//s.style.fontWeight = "bold";
	if( heading)
	    s.appendChild(document.createTextNode(heading));
	marginTD.appendChild(s);
	var startId = 1;
	for(var i = startId; i < nParts; i++) {
	    var innerTable = document.createElement("table");
	    innerTable.style.width = "100%";
	    innerTable.style.height = "100%";
	    innerTable.style.borderCollapse = "collapse";
	    // innerTable.style.background = "red";
	    innerTable.style.padding = "0 0 0 0";

	    var guideTR = innerTable.insertRow(0);

	    var nCols = 1;	// for tala-markers (and ALWAYS IN COMPACT LAYOUT)
	    var colspan = 1;
	    if( !compactLayout ) {
		colspan = 2;
		if((i % 2) == 0 ) {
		    // for tala parts
		    nCols = colinfo[i/2];
		}
	    }
	    else
		nCols = 0;
	    var col;
	    for( col = 0; col < nCols; col++ ) {
		var guideTd = Utils.addTableCell(guideTR, null, colspan, col);
		var d = document.createElement("div");
		d.style.height = "1px";
		d.style.overflow = "hidden";
		// d.style.background = "blue"; // DEBUGGING
		//d.style.border = "thin solid"; // DEBUGGING
		d.appendChild(document.createTextNode("\xa0"));
		guideTd.appendChild(d);
		guideTd.style.padding = "0 0 0 0";
		guideTd.style.overflow = "hidden";
		// guideTd.style.background = "green"; // DEBUGGING
	    }
	    if( (i%2) == 0 && compactLayout ) {
		/*
		 * in compact layout, we introduce an extra column guide intended to
		 * occupy rest of width of Anga. There will always be an extra column
		 * that represents. This keeps columns that contain notation are
		 * spaced tightly (rather than evenly to occupy full space of tala part)
		 */
		var iftd = Utils.addTableCell(guideTR, null, 1, col);
		iftd.className = "ifiller";
		iftd.style.width = "100%";
		iftd.style.padding = "0 0 0 0";
		iftd.style.overflow = "hidden";
		// iftd.style.backgroundColor = "red"; // DEBUGGING
	    }

	    var span = spans[i] + (spans[i]-1);	// 1 => 1 2 => 3, 3 => 5

	    var td = Utils.addTableCell(this.fOuter, innerTable, span, i);
	    td.style.width = "10px";
	    td.valign = "top";
	    td.appendChild(innerTable);
	    td.padding = "0 0 0 0";
	}
	if( compactLayout && !FLEXIBLE_WIDTH ) {
	    // COMPACT LAYOUT: for filler cell that fills till full width of table 
	    // this extra cell will be used by headers to center themselves in page
	    var fillerTD = Utils.addTableCell(this.fOuter, null, 1, i);
	    fillerTD.style.width = "8in";	// a MUST for IE (no adverse affects on FireFox)
	    					// a % value doesnt work on IE as it may
						// expand table
						// TODO: width should really be width of page
	    fillerTD.style.overflow = "hidden";
	}

	this.fOuter.id = Utils.getNewId("tr");
	Utils.addToIdMap(this.fOuter, rowView); // this.fOuter.view = rowView;
	this.fOuterRowDOMId = this.fOuter.id;
	this.fOuterRowView = rowView;
	return this.fOuter;
    }

    /**
     * render the HTML contents of 'rowView' (swara/lyric row), which is saved
     * in the hold area {@link NotationLine@fInnerHTML} and used later when 
     * {@link NotationLine#renderHTMLContent} is called at which time all of it
     * is rendered
     * <p>
     * Actually nothing is rendered yet for the inner row itself, just space 
     * reserved for this row in a local cache (nothing really needs to be 
     * rendered for the inner "row" at this point)
     *
     * @param {SwaraLyricRowView} rowView	the swara or lyric row view
     *						that is the first row of
     *						notations in it. 
     * @param {int} indexInLayoutCycle		index of row in layout cycle
     * @param {Tala}    	  tala		the tala of the notations in 
     *						the line
     * @param {boolean}		compactLayout	compact layout or are we
     *						spreading to occupy entire 
     *						page width?
     * @param {String}		 heading	heading for the notation if any
     *
     * @param {Song}             song		the song (to get swara font preferences for heading)
     * @return a reference to a string array that should be populated with
     * the HTML contents of the table cells that belong to this row
     * @type String[]
     */
    this.renderInnerRowAsHTML = function(rowView, indexInLayoutCycle, tala, compactLayout, heading, song) {
	if( rowView ) {
	    this.fOuterRowView = rowView;
	    this.fInnerHTML  = new Array();
	    this.fIndexInLayoutCycle = indexInLayoutCycle;
	    this.fTala       = tala;
	    this.fCompactLayout = compactLayout;
	    this.fHeading       = heading;
	    this.fSong          = song;
	}
	var idx = this.fInnerHTML.length;
	this.fInnerHTML[idx] = new Array();
	return this.fInnerHTML[idx];
    }

    /**
     * For non-progressive rendering, (finally) generate the HTML content for 
     * the notation line and the swara/lyric rows inside it. 
     * <p>
     * During progressive rendering, the HTML content for NotationLine is
     * built up in the holding area {@link NotationLine@fInnerHTML}, via calls
     * to 
     *
     * @return the HTML contents of the table row for the notation line
     * @type String
     */
    this.renderHTMLContent = function(rowFollowsPageBreak) {
	if(!this.fInnerHTML)
	    return null;

	var tala            = this.fTala;
	var tl              = tala.getLayout();
	var r               = this.fIndexInLayoutCycle;
	var nParts          = tl.getRowPartCount(r)*2; // * 2 => to account for tala markers
	var spans           = tl.getRowPartSpans(r,true);
	var colinfo         = tl.getRowPartColInfo(r);
	var guideRowPartCount = tl.getRowPartCount(tl.GUIDE_ROW)*2;
	var guideRowSpans   = tl.getRowPartSpans(tl.GUIDE_ROW,true);
	var guideRowColInfo = tl.getRowPartColInfo(tl.GUIDE_ROW);
	
	var nRows = this.fInnerHTML.length;
	var a = new Array();
	var i = 0;
	if( r == tl.GUIDE_ROW )
	    a[i++] = '<tr class="guiderow">';
	else
	{
	    /* use nlinep if row is to follow page break */
	    if( rowFollowsPageBreak )
		a[i++] = '<tr class="nlinep">';
	    else
		a[i++] = '<tr class="nline">';
	}
	var prevRow = null;
	var needTopPad = (this.fOuterRowView && this.fOuterRowView.partType() == PAGEVIEWPART_SWARAROW &&
			  useTopPadForSwaras == true );

	var topPad = ((needTopPad) ? 15 : 0);

	if(r == tl.GUIDE_ROW)
	    a[i++] = '<td></td>';
	else  {
	    a[i++] = '<td class="margin" style="padding-left:0;padding-right:15;padding-bottom:';
	    a[i++] = STAYI_HEIGHT;
	    a[i++] = ';';
	    if( this.fSong  )
	    {
	    	var swaraPrefs = this.fSong.getSwaraPrefs();
		if( swaraPrefs )
		{
		    var font = this.fSong.getLanguageFonts()["english"];
		    if( font )
		    	a[i++] = "font-family:" + font + ";";
		    a[i++] = "font-size:" + swaraPrefs.fontSize + ";";
		}
	    }
	    // pad top by row's gamaka height - 6 is a kluge - not sure why
	    var paddingTop = 0;
	    if( this.fOuterRowView && this.fOuterRowView.getGamakaHeight ) {
	        paddingTop = (this.fOuterRowView.getGamakaHeight()+STAYI_HEIGHT);
		paddingTop += topPad;
	    }
	    a[i++] = "padding-top:" + paddingTop + ";margin:0 0 0 0;";
	    a[i++] = '">';
	    // make it smaller than swara font
	    a[i++] = '<div style="height:100%;padding:0 0 0 0;font-size:80%;font-weight:bold;">';	
	    if( this.fHeading ) 
		a[i++] = this.fHeading;
	    a[i++] = '</div>';
	    a[i++] = '</td>';
	}
	this.fHeading = null;

	for(var p = 0; p < guideRowPartCount; p++) {
	    var span;
	    if( p < nParts )
		span = spans[p] + (spans[p]-1);	// 1 => 1 2 => 3, 3 => 5
	    else
		span = guideRowSpans[p] + (guideRowSpans[p]-1);

	    a[i++] = '<td valign="top" style="padding:';
	    a[i++] = topPad;
	    a[i++] = ' 0 0 0;" colspan="';
	    a[i++] = span;
	    /*
	     * NOTE: used to be width:100% but was messing up fullwidth. This works
	     * better although it is possible it may be allowing very first anga to
	     * occupy way too much space. Note also there is a corresponding change
	     * in SwaraView (removal of a width:100%)
	     */
	    a[i++] = '"><table style="height:100%;border-collapse:collapse;padding:0 0 0 0;"><tr>';

	    var nCols = 1;	// for tala-markers (and ALWAYS IN COMPACT LAYOUT)
	    if( !this.fCompactLayout ) {
		if((p % 2) == 0 ) {
		    // for tala parts
		    if( p < nParts )
			nCols = colinfo[p/2];	// BUG FIX where in full-width first anga was taking
		    				// too much width (used to be i/2 => bogus as i wasnt defined
		    else
			nCols = guideRowColInfo[p/2];
		}
	    }
	    if( (p%2) == 0 && this.fCompactLayout ) {
		/*
		 * in compact layout, we introduce an extra column guide intended to
		 * occupy rest of width of Anga. There will always be an extra column
		 * that represents. This keeps columns that contain notation are
		 * spaced tightly (rather than evenly to occupy full space of tala part)
		 */
		if(nRows) {
		    var innerContent = this.fInnerHTML[0];	// first row inner content
		    if( innerContent && innerContent[p])
			nCols = innerContent[p].length;	// # of notations in first row
		}
		for( var col = 0; col < nCols; col++ ) {
		    a[i++] = '<td style="padding:0 0 0 0;"></td>';
		}
		if( FLEXIBLE_WIDTH )	// NEEDED FOR OPERA - otherwise cmnlets occupy 100% width
		    a[i++] = '<td class="ifiller" style="padding:0 0 0 0;overflow:hidden;"></td>';
		else
		    a[i++] = '<td class="ifiller" style="width:100%;padding:0 0 0 0;overflow:hidden;"></td>';
	    }
	    else {
		var putSpace = false; // ((guideRowPartCount > nParts) ? true : false);
		for( var col = 0; col < nCols; col++ ) {
		    a[i++] = '<td colspan="2" style="padding:0 0 0 0;overflow:hidden;">';
		    /*
		     * BUG FIX: removed &nbsp; - it was causing FullWidth to be
		     * very wide (and I think that &nbsp; was present for 
		     * the first version where user entered text and without it
		     * things were initially scrunched up at the left??????
		     */
		    if( putSpace )
			a[i++] = '<div style="height:1px;overflow:hidden;">&nbsp;</div></td>';
		    else
			a[i++] = '<div style="height:1px;overflow:hidden;"></div></td>';
		}
	    }
	    a[i++] = '</tr>';
		
	    for(var r = 0; r < nRows; r++ ) {
		a[i++] = '<tr>';

		var innerContent = this.fInnerHTML[r];
		if( innerContent && innerContent[p] ) {
		    a[i++] = innerContent[p].join("");
		}
		a[i++] = '</tr>';
	    }
	    a[i++] = '</table></td>';
	}
	if( this.fCompactLayout && !FLEXIBLE_WIDTH ) {
	    // COMPACT LAYOUT: for filler cell that fills till full width of table 
	    // this extra cell will be used by headers to center themselves in page
	    // 8in: a MUST for IE (no adverse affects on FireFox) a % value doesnt 
	    // work on IE as it may expand table TODO: width should really be width of page
	    a[i++] = '<td style="width:8in;overflow:hidden;">&nbsp;</td>';
	}
	a[i++] = '</tr>';
	return a.join("");
    }

    /**
     * when we rendered last, was it in compact layout
     * @type boolean
     */
    this.isCompactLayout = function() { return this.fCompactLayout; }

    /**
     * get the row view that is associated with the TR element
     * @type SwaraLyricRowView
     */
    this.outerRowView = function() { return this.fOuterRowView; }

    /**
     * get the id of the outer row tr tag
     * @type String
     */
    this.outerRowDOMId = function() { return this.fOuterRowDOMId; }

    /**
     * attach this view object to a DOM object (generated using non-progressive
     * rendering)
     * @param	{DOM_TABLE} table	the dom table
     * @param	{DOM_TR}    tr		the dom table row for notation line
     * @param   {int}	    rowidx	the row index
     */
    this.attach = function(table, tr, rowidx) {
	this.fOuter = tr;
	this.fOuter.id = Utils.getNewId("tr");
	this.fOuterRowDOMId = this.fOuter.id;
	Utils.addToIdMap(this.fOuter, this.fOuterRowView);
    }

    /**
     * the outer contents
     * @type DOMElement_TR
     */
    this.fOuter = null;

    /**
     * the row view that is associated with the TR element
     * @type SwaraLyricRowView
     */
    this.fOuterRowView = null;

    /**
     * when we rendered last, was it in compact layout
     * @private
     * @type boolean
     */
    this.fCompactLayout = false;

    /**
     * Non-progressive rendering ONLY - The hold area for HTML content. It
     * is an array of arrays. Elements of outer array stand for swara/lyric
     * rows in notation line. Inner array contains content for each
     * notation objs
     *
     * @type String[][]
     * @private
     */
    this.fInnerHTML = null;
}


/**
 * @class
 * represents the view content of a single row (line) of swaras or lyrics
 * <p>
 * The view is a table-row in a table inside a page represented by {@link PageView}
 * <p>
 */
function SwaraLyricRowView(isSwaraRow) 
{
    /**
     * is this a swara row (or a lyric row)?
     *
     * @return true or false indicating if this is a swara row
     * @type boolean
     */
    this.isSwaraRow = function() { return (this.fPartType == PAGEVIEWPART_SWARAROW); }

    /**
     * get the first selectable view in the row
     * @return the first selectable row view part in the row if any, else 
     *         returns null
     */
    this.firstSelectable = function() {
	var part = this.fFirstPart;
	while( part != null && !part.isSelectable() )
		part = part.next;
	return part;
    }

    /**
     * get the last selectable view in the row
     * @return the last selectable row view part in the row if any, else 
     *         returns null
     */
    this.lastSelectable = function() {
	var part = this.fLastPart;
	while( part != null && !part.isSelectable() )
		part = part.prev;
	return part;
    }


    /**
     * add a row view part to this row view
     * @param {RowViewPart} part row view part. The parts "parent" field would be set to point to this row view.
     * @return true or false indicating if the add was successful
     */
    this.addPart = function( part ) {
	part.next = null;
	part.prev = this.fLastPart;
	part.parent = this;
    	if( this.fLastPart )
	    this.fLastPart.next = part;
	this.fLastPart     = part;
	if( !this.fFirstPart )
	    this.fFirstPart = part;
	return true;
    }

    /**
     * remove a row view part from this row view
     * @param {RowViewPart} part row view part. The parts "parent" field would be set to null on removal.
     * @return true or false indicating if the removal was successful
     */
    this.removePart = function(part) {
    	if( part.prev )
	    part.prev.next = part.next;
	if( part.next )
	    part.next.prev  = part.prev;
	if( part == this.fLastPart ) this.fLastPart = part.prev;
	if( part == this.fFirstPart ) this.fFirstPart = part.next;
	part.parent = null;
	return true;	
    }

    /**
     * add a DOM cell's HTML content to the HTML content of the this row being
     * built up. 
     * <p>
     * This is expected to be called by the notation view objects that are part
     * of this row during non-progressive rendering. These are stored (in 
     * {@link SwaraLyricRowView@fInnerHTML}) until a call to renderDOMCells() 
     * which directs the NotationLine to combine all and return the HTML 
     * representation of the entire notation line.
     *
     * @param {boolean}  isTalaMarker   is the cell for a tala market?
     * @param {int} partInRow 		the nth tala part in the row to which 
     *					the cell belongs to
     * @param {String} tdHTML 		HTML representation of table cell
     */
    this.addDOMCellAsHTML = function(isTalaMarker, partInRow, tdHTML)  {
	var outerCellIdx = partInRow*2;	// add 1 for tala marker;
	if(isTalaMarker) outerCellIdx++;

	if( this.fInnerHTML == null ) 
	    return ;

	if( !this.fInnerHTML[outerCellIdx] )
	    this.fInnerHTML[outerCellIdx] = new Array();
	var a = this.fInnerHTML[outerCellIdx];
	a[a.length] = tdHTML;
    }

    /**
     * During Non-progressive rendering, this all important call is to be made
     * to combine all the HTML content of the notation line and the DOM
     * cells added via addDOMCellAsHTML, and return HTML representation 
     * of the entire notation line.
     * <p>
     * If this is called for a swara/lyric row that is NOT the first in its
     * notation line, it returns null (to avoid duplicate generation) - so
     * calller can simply call it for all rows and pay attention only if 
     * return value is not null
     *
     * @return if this row is first under a notation line, the HTML content
     * for the entire notation line, else null
     * @type String
     */
    this.renderDOMCells = function(rowFollowsPageBreak) {
	if( this.fNotationLine.outerRowView() != this )
	    return null;
	return this.fNotationLine.renderHTMLContent(rowFollowsPageBreak);
    }

    /**
     * attach to the contents of an already rendered table row whose HTML
     * content was generated using this.renderAsHTML or this.render
     *
     * @param {DOMElement_TABLE} table	the table
     * @param {DOMElement_TR}    tr	the table row
     * @param {int}              rowidx	the table row index
     * @param {int}          innerowidx	inner row index of this swara/lyric
     *					row
     * @return true or false indicating if attach was successful
     * @param boolean
     */
    this.attach = function(table, tr, rowidx, innerRowIdx) {
	this.fOuter = tr;	// outer tr
	this.fTable = table;	// outer table
	var cell  = tr.cells[0];
	if( cell.className && cell.className == "margin" )	// MARGIN TEST
	    cell = tr.cells[1];
	var itable  = cell.firstChild;
	var irow    = itable.rows[innerRowIdx];	// first inner row;
	irow.id = Utils.getNewId("itr");
	Utils.addToIdMap(irow, this); // irow.view = this;	// attach to row of first innner table
	this.fInnerRowDOMId = irow.id;
	if(this.fNotationLine.outerRowView() == this )
	    this.fNotationLine.attach(table, tr, rowidx);

	// now attach kiddos
	var outerCells = tr.cells;
	var nouterCells = outerCells.length;
	var innerCells;
	var ninnerCells;
	var p = this.fFirstPart;
	var pno = 1;
	var cum_cellidx = 0;
	for( var ocell = 0; ocell < nouterCells; ocell++ ) {
	    itable      = outerCells[ocell].firstChild;	// inner table
	    if( !itable || !itable.rows ) 	// avoid filler row
		continue;
	    irow        = itable.rows[innerRowIdx];
	    if(!irow ) {
		continue;	// rows not filled out
	    }
	    innerCells  = irow.cells;
	    ninnerCells = innerCells.length;
	    for( var icell = 0; icell < ninnerCells; icell++ ) {
		//var l = irow.cells[icell];
		//if(l && l.className  && l.className == "ifiller") {
		    //continue;
		//}
		if( p == null ) {
		    alert("internal error: no child: " + "row #" + rowidx + ", inner row#" + innerRowIdx + ", outer cell #" + ocell + ", inner cell #" + icell);
		    alert(innerCells[icell].innerHTML);
		    return false;
		}
		if( !p.attach(innerCells[icell], cum_cellidx ) ) {
		    alert("Failed to attach: row #" + rowidx + ", outer cell: " + ocell + ", icell " + icell );
		    alert(p.partType());
		    alert(innerCells[icell].innerHTML);
		    return false;
		}
		p = p.next;
		pno++;
		cum_cellidx++;
	    }
	}
	if( p != null ) {
	    alert("internal error: no cell for child: " + "row #" + rowidx + ", inner row#" + innerRowIdx + ", child #" + pno + ", type = " + p.partType());
	    return false;
	}
	return true;
    }

    /**
     * add a DOM cell to the row at a certain index.
     * @param {boolean}  isTalaMarker   is the cell for a tala market?
     * @param {int} partInRow 		the nth tala part in the row to which 
     *					the cell belongs to
     * @param {DOMElement} contents 	object to add inside the td (null for
     *					no obj)
     * @param {int} colspan	       	the span of the table cell
     * @param {int} cellidx (optional) 	index of cell in row; if not provided 
     *					added at end	 
     * @return the HTML cell that was added
     * @type an object whose "td" member has the cell, and "cellidx" has the cellidx
     */
    this.addDOMCell = function(isTalaMarker, partInRow, contents, colspan, cellidx)  {
	var outerCellIdx = partInRow*2;	// add 1 for tala marker;
	if( isTalaMarker ) outerCellIdx++;

	var outerTR = this.fNotationLine.fOuter;
	var innerTD, innerTable, innerTR;
	var trueCellIdx = 0;
	var innerCellIdx = 0;
	var td;
	var nLineRowIndex = this.getNotationLineRowIndex();

	for(var i = 0; i <= outerCellIdx; i++ ) {
	    innerTD    = outerTR.cells[i];
	    innerTable = innerTD.firstChild;
	    innerTR    = innerTable.rows[nLineRowIndex];
	    innerCellIdx = 0;
	    if( innerTR.cells )
		innerCellIdx = innerTR.cells.length;
	    trueCellIdx += innerCellIdx;
	}

	if(this.fNotationLine.isCompactLayout() )
	{
	    /*
	     * in compact layout we want to make sure there is an extra
	     * column in the guide-row so that tha LAST column is the
	     * special filler column that occupies rest of width. This
	     * allows filled columns in rest of rows to be packed tightly
	     */
	    if( !isTalaMarker ) {
		// INSERT at beginning
		var gtd = Utils.addTableCell(innerTable.rows[0], null, 1, 0);
		// gtd.style.background = "blue"; // DEBUGGING

	    }
	}
	if(!innerTR) alert("oops");

	td = Utils.addTableCell(innerTR, contents, colspan, innerCellIdx);
	td.style.padding = "0 0 0 0";
	var o = new Object();
	o.td = td;
	o.cellidx = trueCellIdx;
	return o;
    }

    /**
     * render the swara/lyric row view as one or more table rows inside
     * tables that are themselves cells in a row (that is the NotationLine)
     * in the outer table. Depending on the value of the asHTML parameter,
     * the rendering is done either progressively (i.e create DOM objects 
     * now), or non-progressively (no DOM, just generate HTML content)
     * <p>
     * For non-progressive-rendering, the actual generation of HTML content
     * is done by NotationLine.renderInnerRowAsHTML which returns us an
     * array which needs to be filled in with the HTML content of any 
     * notations for this row. The NotationLine also has references to
     * these arrays, so that when it is time to render the entire 
     * NotationLine it can combine everything
     *
     * @param {boolean} asTML		are we generating the HTML content first
     *					(and render later) as opposed to 
     *					progressive rendering?
     * @param {NotationLine} nline	if not-null, the notation line in 
     *					which this row has to be rendered (else
     *					a new line is) created
     * @param {Tala}    tala		the tala
     * @param {int} indexInLayoutCycle	index of row in layout cycle
     * @param {DOMElement_TABLE} table	the DOM table under which this view is
     *					to be rendered
     * @param {boolean}	compactLayout	compact layout or are we spreading to 
     *					occupy entire page width?
     * @param {int}		idx	row index in table (optional, in which
     *					case it is added to end)
     * @param {String}		heading (optional) row heading (as in sangati label)
     * @param {Song}            song    (optional) song - to get font preferences for heading
     * @return for progressive rendering, the DOM table row that represents 
     * the rendering; for non-progressive rendering NOTHING as the html content is
     * maintained in the NotationLine itself (so that it can gather the content for
     * all swara and lyric rows in the line), until a later call to renderDOMCells
     * which will generate the content for the entire notation line
     */
    this.renderSwaraLyricRow = function(asHTML, nline, tala, indexInLayoutCycle, table, compactLayout, idx, heading, song) {
	if( !asHTML && !idx ) idx = table.rows.length;
	var nLineRowIndex;
	if( nline == null )  {
	    /*
	     * new notation line, so we must render at as a row in the
	     * outer table first
	     */
	    if( asHTML ) {	// non-progressive rendering?
		nline = new NotationLine();
		this.fNotationLine = nline;
		/*
		 * ask the notation line to generate content for the row and
		 * return us an array with which we can fill in the HTML content
		 * for the cells
		 */
		this.fInnerHTML = nline.renderInnerRowAsHTML(this, indexInLayoutCycle, tala, compactLayout, heading, song);
		return;
	    }
	    else
	    {
		nline = new NotationLine();
		this.fNotationLine = nline;
		nLineRowIndex = 1;
		nline.render(tala, indexInLayoutCycle, table, compactLayout, idx, this, heading, song);
	    }
	}
	else {
	    /**
	     * render it in an existing notation line
	     */
	    this.fNotationLine = nline;
	    if( asHTML )  {	// non-progressive rendering?
		/*
		 * ask the notation line to generate content for the row and
		 * return us an array with which we can fill in the HTML content
		 * for the cells
		 */
		this.fInnerHTML = nline.renderInnerRowAsHTML(null, indexInLayoutCycle, tala, compactLayout);
		return;
	    }
	    nLineRowIndex = nline.fOuter.cells[0].firstChild.rows.length;
	}


	// we get here only for progressive rendering
	var outerTR = nline.fOuter;
	var nParts =  outerTR.cells.length; 
	for(var i = 0; i < nParts; i++) {	
	    // add our row to each of the inner tables
	    var innerTable = outerTR.cells[i].firstChild;
	    if( innerTable && innerTable.rows ) {	// avoid filler cell in COMPACT LAYOUT
		var innerTR = innerTable.insertRow(nLineRowIndex);
		if(i == 0) {
		    innerTR.id  = Utils.getNewId("itr");
		    Utils.addToIdMap(innerTR, this); 
		    this.fInnerRowDOMId = innerTR.id;
		}
	    }
	}
	this.fTable = table;
	this.fOuter = outerTR;
	return outerTR;
    }

    /**
     * get the notation line to which this row belongs to
     *
     * @type NotationLine
     */
    this.getNotationLine = function() { return this.fNotationLine; }

    /**
     * get the index of this row view in its table
     */
    this.getRowIndex = function() {
	if( this.fTable == null ) return -1;

	// figure out row index
	// note: the 
	var nrows = this.fTable.rows.length;
	var rowIndex;

	// note - outer row will point to the view which resulted in notation line
	// being created
	for(rowIndex = 0; rowIndex < nrows; rowIndex++ ) {
	    if( this.fTable.rows[rowIndex].id == this.fNotationLine.outerRowDOMId() )  {
		break;
	    }
	}
	return rowIndex;
    }

    /**
     * get the index of this row view in its notation line
     */
    this.getNotationLineRowIndex = function() {
	var outerRow = this.fNotationLine.fOuter;
	if( !outerRow.cells || !outerRow.cells.length ) return 0;
	var innerTable = outerRow.cells[0].firstChild;
	if( !innerTable.rows ) return 0;
	var nrows = innerTable.rows.length;
	for(var i = 0; i < nrows; i++ ) {
	    if( innerTable.rows[i].id == this.fInnerRowDOMId )
		return i;
	}
	return -1;
    }

    /**
     * get the bottom coordinate of the row (override of TableRowViewPagePart)
     */
    this.getBottom = function() {
	var outerRow = this.fNotationLine.fOuter;
	var outerRowCell = outerRow.firstChild;
	var innerTable = outerRowCell.firstChild;
	var nlr = this.getNotationLineRowIndex();
	var tr = innerTable.rows[nlr];
	if( !tr.firstChild ) return 0;
	var ht = tr.firstChild.offsetHeight;
	var ret = ht + tr.firstChild.offsetTop + innerTable.offsetTop + outerRowCell.offsetTop + this.fTable.offsetTop;
	return ret;
    }
    /**
     * get the # of cells in this row
     * @param {boolean} notatioonsOnly	get notations only  (UNUSED)
     * @type int
     */
    this.getCellCount = function(notationsOnly) {
	var ncells = 0;
	var outerRow = this.fNotationLine.fOuter;
	if( !outerRow.cells ) return ncells;
	var oncells = outerRow.cells.length;
	for(var c = 0; c < oncells; c++ )  {
	    var innerTable = outerRow.cells[c].firstChild;
	    if( innerTable && innerTable.rows ) {	// avoid filler cell in COMPACT LAYOUT
		var innerRow = innerTable.rows[this.getNotationLineRowIndex()];
		if( innerRow && innerRow.cells ) {
		    var n = innerRow.cells.length;
		    ncells  += n;
		}
	    }
	}
	return ncells;
    }

    /**
     * get the # of notations/lyrics in this row
     * @type int
     */
    this.getNotationCount = function() {
	return this.getCellCount(true);
    }

    /**
     * get cell HTML contents - used by testing
     */
    this.getCellContents = function(n) {
	var ncells = 0;
	var outerRow = this.fNotationLine.fOuter;
	if( !outerRow.cells ) return null;
	var nLineRowIndex = this.getNotationLineRowIndex();
	var oncells = outerRow.cells.length;
	for(var c = 0; c < oncells; c++ )  {
	    var innerTable = outerRow.cells[c].firstChild;
	    var innerRow = innerTable.rows[nLineRowIndex];
	    if( innerRow.cells ) {
		if( n >= ncells && n < (ncells+innerRow.cells.length)) {
		    var rn = n - ncells;
		    return innerRow.cells[rn];
		}
		ncells += innerRow.cells.length;
	    }
	}
	return null;
    }


    /**
     * remove a cell
     */
    this.removeCell = function(n) {
	var ncells = 0;
	var outerRow = this.fNotationLine.fOuter;
	if( !outerRow.cells ) return ncells;
	var nLineRowIndex = this.getNotationLineRowIndex();
	var oncells = outerRow.cells.length;
	for(var c = 0; c < oncells; c++ )  {
	    var innerTable = outerRow.cells[c].firstChild;
	    var guideRow   = innerTable.rows[0];
	    var innerRow = innerTable.rows[nLineRowIndex];
	    if( innerRow.cells ) {
		if( n >= ncells && n < (ncells+innerRow.cells.length)) {
		    var rn = n - ncells;
		    var cell = innerRow.cells[rn];
		    var view = Utils.getObjForId(cell);
		    if( view ) {
			this.removePart(view);
			Utils.removeFromIdMap(cell);
		    }
		    innerRow.removeChild(cell);
		    if(this.fNotationLine.isCompactLayout()) {
			// remove filler cell 
			guideRow.removeChild(guideRow.cells[0]);
		    }
		    return;
		}
		ncells += innerRow.cells.length;
	    }
	}
	return;
    }

    /**
     * move the HTML contents of the row from one HTML table to another
     * @param {tala}			the tala of the row
     * @param {int} indexInLayoutCycle	index of row in layout cycle
     * @param {DOMElement_TABLE}	the new table to which the contents need
     *					to be moved
     * @param {idx}			the index in that table
     */
    this.moveSwaraLyricRowHTMLContents = function(tala, indexInLayoutCycle, toTable, idx) {
	// create a new notation line
	var nn = new NotationLine();
	var newOuterRow = nn.render(tala, indexInLayoutCycle, toTable, 
					this.fNotationLine.isCompactLayout(), idx, this);
	Utils.removeFromIdMap(this.fInnerRowDOMId);
	/*
	 * walk through all inner tables of the current notation line
	 * we belong to and move the content to the new notation line
	 */
	var curOuterRow = this.fNotationLine.fOuter;
	if( curOuterRow.cells )  {
	    var oncells = curOuterRow.cells.length;
	    var incells;
	    var nLineRowIndex = this.getNotationLineRowIndex();
	    for(var c = 0; c < oncells; c++ )  {
		var curInnerTable = curOuterRow.cells[c].firstChild;
		if( curInnerTable && curInnerTable.rows ) {	// avoid filler cell in COMPACT LAYOUT
		    var newInnerTable = newOuterRow.cells[c].firstChild;
		    var curInnerRow   = curInnerTable.rows[nLineRowIndex];
		    var newInnerRow =   newInnerTable.insertRow(1);
		    if(c == 0) {
			newInnerRow.id = Utils.getNewId("itr");
			Utils.addToIdMap(newInnerRow, this);
		    }
		    if( curInnerRow.cells ) {
			incells = curInnerRow.cells.length;
			for(var ic = 0; ic < incells; ic++ )  {
			    var td = curInnerRow.cells[0];
			    curInnerRow.removeChild(td);
			    newInnerRow.appendChild(td);
			}
		    }
		}
	    }
	}

	// delete us from the current table
	this.deleteHTMLContents();

	// now switch over to the new notation line
	this.fNotationLine = nn;
	this.fTable = toTable;
	this.fOuter = newOuterRow;
    }

    /*
     * delete the HTML content of the row
     * <p>
     * This is an override of TableRowPageViewPart. It is an implementation 
     * that is aware that the row is part of a notation line and hence made up
     * of multiple rows in a table (which are themselves cells of the row that
     * is the NotationLine)
     *
     */
    this.deleteHTMLContents = function() {
	var outerRow = this.fNotationLine.fOuter;
	if( !outerRow.cells ) return;
	var innerTable;
	var nLineRowIndex = this.getNotationLineRowIndex();
	var oncells = outerRow.cells.length;
	var firstInner = null;
	for(var c = 0; c < oncells; c++ )  {
	    innerTable = outerRow.cells[c].firstChild;
	    if( innerTable && innerTable.rows ) {	// avoid filler cell in COMPACT LAYOUT
		if( firstInner == null ) firstInner = innerTable;
		innerTable.deleteRow(nLineRowIndex);
	    }
	}
	/*
	 * if the innerTable has exactly one row (the guide for the notation line) remove
	 * the notation line itself. Note that we expect all inner tables to have
	 * same # of rows, so checking any one (as in the last seen) suffices to make
	 * this decision
	 */
	if( firstInner && firstInner.rows.length <=  1 )
	{
	    /*
	     * delete from outer table, the row whose index is our outer index
	     */
	    this.fTable.deleteRow(this.getRowIndex());
	}
    }

    /**
     * first row view part under the row view
     * @type RowViewPart
     */
    this.fFirstPart = null;

    /**
     * last row view part under the row view
     * @type RowViewPart
     */
    this.fLastPart  = null;

    /**
     * the notation line view to which this row belongs to
     * @type NotationLine
     * @private
     */
    this.fNotationLine = null;

    /**
     * the (outer) table to which (the NotationLine that contains) this row belongs to - 
     * @type DOMElement_TABLE
     * @private
     */
    this.fTable = null;

    /**
     * the table row 
     * @type DOMElement_TR
     * @private
     */
    this.fOuter = null

    /**
     * Non-progressive rendering ONLY - reference to array (owned by NotationLine
     * to which this view belongs to) to which to fill HTML content of 
     * notations/lyrics in row
     * <p>
     * We establish this reference in {@link SwaraLyricRowView#render}. We fill
     * it with HTML content when the notation view objects call 
     * {@link SwaraLyricRowView#addDOMCellAsHTML}. On an eventual call to
     * {@link SwaraLyricRowView#renderDOMCells} for the first SwaraLyricRowView
     * in a notation line, the entire notation line content is generated 
     *
     * @type String[]
     * @private
     */
    this.fInnerHTML = null;

    /**
     * @ignore
     */
    if( isSwaraRow )
	this.fPartType = PAGEVIEWPART_SWARAROW;
    else
	this.fPartType = PAGEVIEWPART_LYRICROW;
    isSwaraRow = null;
}
SwaraLyricRowView.prototype = new TableRowPageViewPart();

/*
 * @class
 * represents the view content of a single row (line) of swaras
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link SwaraRowView#render}
 * when the 'asHTML' parameter to it is false.
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done by {@link SwaraRowView#render} when
 * the 'asHTML' parameter to it is true.
 * </ul>
 * <p>
 * In both cases, a subsequent call to {@link SwaraLyricRowView#attach} is 
 * needed to associate the DOM with the view. In case of progressive rendering,
 * this is automatic. In case of non-progressive, an separate call to attach 
 * is expected later.
 * <p>
 * In non-progressive rendering, the HTML content of the <tr> generated by 
 * render, but is actually maintained inside the NotationLine object in an
 * "hold area" (so that it can gather content for subsequent lyric rows 
 * that belong to it also). The view itself establishes a reference to an 
 * array in the hold area (see {@link SwaraLyricRowView@fInnerHTML}), and
 * fills it with the HTML content of the notations themselves (i.e. the table 
 * cells inside the row) on calls (by the notation view objects) to 
 * {@link SwaraLyricRowView#addDOMCellAsHTML}. A later call to 
 * {@link SwaraLyricRowView#renderDOMCells} is expected - at which time for 
 * the full notation line content is returned.
 *
 * Note also that for non-progressive rendering, 
 * {@link SwaraRowView#preAdjustGamakas} must be called <b>before</b> ANY of 
 * the swara content in the row is generated.
 * <p>
 * In both renderings, a subsequent call to {@link SwaraLyricRowView#attach} 
 * is needed to associate the DOM with the view. In case of progressive 
 * rendering, this is automatic. In case of non-progressive, an separate call 
 * to attach is expected later.
 *
 * @constructor
 * @param {Tala} tala		(swara row only) tala to which row belongs
 * @param {Duration} startDur	(swara row only) duration (within tala cycle) of row start
 * @param {int}      indexInLayoutCycle index of swara row in layout cycle
 */
function SwaraRowView(tala, startDur, indexInLayoutCycle) 
{
    /**
     * get the lyric row views associated this swara row view 
     * 
     * @type LyricRowView[] 
     */
    this.lyricRows = function() { return this.fLyricRows; }

    /**
     * does this swara row has lyric rows?
     * @type boolean
     */
    this.hasLyricRows = function() { return (this.fLyricRows.length != 0); }

    /**
     * get the # of lyric rows
     * @type int
     */
    this.lyricRowCount = function() { return this.fLyricRows.length; }

    /**
     * get the first lyric row (if any)
     * @type LyricRowView
     */
    this.firstLyricRow = function() { 
	if( this.hasLyricRows() ) return this.fLyricRows[0];
	return null;
    }

    /**
     * get the last lyric row (if any)
     * @type LyricRowView
     */
    this.lastLyricRow = function() { 
	if( this.hasLyricRows() ) return this.fLyricRows[this.fLyricRows.length-1];
	return null;
    }

    /**
     * clear lyric rows
     */
    this.clearLyricRows = function() {
	this.fLyricRows = null;
    }

    /**
     * add the passed-in lyric row to the lyric row views associated with this swara row view
     * @param {LyricRowView} lyricRow
     */
    this.addLyricRow = function( lyricRow ) {
	this.fLyricRows[this.fLyricRows.length] = lyricRow;
	lyricRow.setSwaraRow(this);
    }

    /**
     * get the tala for the contents of the row 
     *
     * @return tala of the row
     * @type Tala
     */
    this.getTala = function() { return this.fTala; }

    /**
     * get the start time for the contents of the row 
     *
     * @return time (within tala cycle) at the start of the row
     * @type Duration
     */
    this.getStartTime = function() { return this.fStartDur; }

    /**
     * get the ending time for the contents of the row
     *
     * @return time (within tala cycle) at the end of the row
     * @type Duration
     */
    this.getEndTime = function() { 
	return this.getColumnTime(this.getNotationCount());
    }


    /**
     * does this rows have gamakas?
     */
    this.haveGamakas = function() {
	return this.fHaveGamakas;
    }

    /**
     * get the height of gamakas
     */
    this.getGamakaHeight= function() {
	return this.fGamakaHeight;
    }

    /**
     * get the time (within a tala-cycle of a certain column)
     * @param {int} 	col	column #
     */
    this.getColumnTime = function(col)  {
	var aksharasPerCycle = this.fTala.aksharaCount();
	var curDur = new Duration(this.fStartDur.fNum, this.fStartDur.fDenom);;
	var part = this.fFirstPart;
	var i = 0;
	while( i < col && part != null ) {
	    if( part.partType() == ROWVIEWPART_SWARA || part.partType() == ROWVIEWPART_NEWSWARASPACER ) {
		var w1 = curDur.wholePart();
		var curTalaPart = this.fTala.getPart(w1);
		// var span = getSpan(part.getModel().getLength(),part.getModel().getSpeed(),curTalaPart.fGati);
		curDur.add(part.getModel().duration(curTalaPart.fGati));
		if( curDur.wholePart() >= aksharasPerCycle )
		    curDur.setZero();
	    }
	    part = part.next;
	    i++;
	}
	return curDur;
    }

    /**
     * get the gati of a certain cell in the row 
     *
     * @param {int} cellidx	index of the cell
     * @return the gati of the cell
     * @type Gati
     */
    this.getGati = function(cellidx) {
	// make sure cellidx is not too high
	var ncells = this.getCellCount();
	if( cellidx >= ncells ) return null;

	var aksharasPerCycle = this.fTala.aksharaCount();
	var dur = new Duration(this.fStartDur.fNum, this.fStartDur.fDenom);;
	var part = this.fFirstPart;
	var curTalaPart;
	var i = 0;
	var w1;
	while( part != null ) {
	    if( part.partType() == ROWVIEWPART_SWARA || part.partType() == ROWVIEWPART_NEWSWARASPACER ) {
		w1 = dur.wholePart();
		curTalaPart = this.fTala.getPart(w1);
		if( i == cellidx ) 
		    return curTalaPart.fGati;

		// var span = getSpan(part.getModel().getLength(),part.getModel().getSpeed(),curTalaPart.fGati);
		dur.add(part.getModel().duration(curTalaPart.fGati));
		if( dur.wholePart() >= aksharasPerCycle )
		    dur.setZero();
	    }
	    part = part.next;
	    i++;
	}
	return null;
    }

    /**
     * insert a swara before a particular swara
     * @param {Swara} 			     newSwara	the swara to be inserted
     * @param {SwaraView/NewSwaraSpacerView} swaraView	the swara view part 
     *							before which to insert
     *							the swara
     * @param {SongBlock}		     block	the song block (of
     *							swaraView if it is 
     *							a SwaraView)
     * @return the view for the added swara
     * @type SwaraView
     */
    this.insertSwara = function( newSwara, swaraView, block) {
	var cellIndex = swaraView.getCellIndex();
	var swara     = swaraView.getModel();
	if( !block )  {
	    alert( "internal error: insertSwara: no block" ); 
	    return;
	}

	var isSpacer = (swaraView.partType() == ROWVIEWPART_NEWSWARASPACER);

	// figure out row index
	var rowIndex = this.getRowIndex();
	if( rowIndex < 0 )  {
	    alert( "internal error: row index" );
	    return;
	}

	// figure out the duration of the passed in swaraView and also
	// the column index (accounting for column spans)
	var aksharasPerCycle = this.fTala.aksharaCount();
	var curDur = new Duration(this.fStartDur.fNum, this.fStartDur.fDenom);
	var part = this.fFirstPart;
	var i = 0;
	while( part != null ) {
	    if( part.partType() == ROWVIEWPART_SWARA || part.partType() == ROWVIEWPART_NEWSWARASPACER ) {
		var w1 = curDur.wholePart();
		var curTalaPart = this.fTala.getPart(w1);
		if( i == cellIndex )  {
		    break;
		}

		// var span = getSpan(part.getModel().getLength(),part.getModel().getSpeed(),curTalaPart.fGati);
		curDur.add(part.getModel().duration(curTalaPart.fGati));
		if( curDur.wholePart() >= aksharasPerCycle )
		    curDur.setZero();
	    }
	    part = part.next;
	    i++;
	}
	if( part != swaraView ) {
	    alert("internal error: insertSwara: duration");
	    return;
	}

	// insert new swara into the block
	var res = ((isSpacer) ? block.addSwara(newSwara) : block.insertSwara(newSwara, swara));
	if( !res ) {
	    alert( "internal error: cannot insert swara" );
	    return;
	}

	this.pageView().songView().replaceSwarasFrom(this, rowIndex, cellIndex, block, newSwara, this.fTala, curDur);

	var part = this.fFirstPart;
	for( var i = 0; part != null && i < cellIndex; i++, part = part.next );
	if( part == null )
	    alert( "we got a problem");
	return part;
    }

    /**
     * delete a swara from the row view and its associated lyric
     * @param {SwaraView} swaraView	the swara view to delete
     * @return true|false indicating whether the delete was successful
     */
    this.deleteSwara = function( swaraView ) {
	if( swaraView.partType() == ROWVIEWPART_NEWSWARASPACER ) 
	    return false;

	var cellIndex = swaraView.getCellIndex();
	var swara     = swaraView.getModel();

	// figure out row index
	var rowIndex = this.getRowIndex();
	if( rowIndex < 0 )  {
	    alert( "internal error: row index" );
	    return false;
	}

	// figure out the duration of the passed in swaraView and also
	// the column index (accounting for column spans)
	var aksharasPerCycle = this.fTala.aksharaCount();
	var curDur = new Duration(this.fStartDur.fNum, this.fStartDur.fDenom);;
	var part = this.fFirstPart;
	var i = 0;
	while( part != null ) {
	    if( part.partType() == ROWVIEWPART_SWARA || part.partType() == ROWVIEWPART_NEWSWARASPACER ) {
		var w1 = curDur.wholePart();
		var curTalaPart = this.fTala.getPart(w1);
		if( i == cellIndex )  {
		    break;
		}

		// var span = getSpan(part.getModel().getLength(),part.getModel().getSpeed(),curTalaPart.fGati);
		curDur.add(part.getModel().duration(curTalaPart.fGati));
		if( curDur.wholePart() >= aksharasPerCycle )
		    curDur.setZero();
	    }
	    part = part.next;
	    i++;
	}
	if( part != swaraView ) {
	    alert("internal error deleteSwara: duration");
	    return;
	}

	var block = swara.getBlock();
	var nSwara = swara.next;
	block.removePart(swara);

	this.pageView().songView().replaceSwarasFrom(this, rowIndex, cellIndex, block, nSwara, this.fTala, curDur);
	if( this.fFirstPart == null ) {
	    // this means no swara followed us (in our block or in any consecutive succeeding
	    // block), we remove ourselves
	    this.pageView().songView().removeRow(this);
	}
	return true;
    }

    /**
     * called during non-progressive rendering (i.e. generating HTML content),
     * where we have to set the gamaka row height of the row BEFORE swaras' 
     * content are generated since that height is part
     *
     * @param {Array}	a array of elements whose "obj" elem is the swara view obj
     */
    this.preAdjustGamakas  = function(swaras) {
    	var l = swaras.length;
	var haveGamakas = false;
	var gamakaHeight = 0;
	var h = 0;
	var maxBottomGamakaHeight = 0;
	for(var i = 0; i < l; i++ ) {
	    var s = swaras[i].obj;
	    if( s == null ) continue;
	    var m = s.getModel();
	    var g = null;
	    if( m.getGamaka ) g = m.getGamaka();
	    if( g != null ) {
		haveGamakas = true;
		h = g.getHeight();
		if( h >= gamakaHeight ) {
		     gamakaHeight = h;
		}
	    }
	}
	if( gamakaHeight != 0 )
	{
	    for(var i = 0; i < l; i++ ) {
		var s = swaras[i].obj;
		if( s == null ) continue;
		var m = s.getModel();
		var g = null;
		if( m.getGamaka ) g = m.getGamaka();

		if( g != null && g.adjustForTotalHeight )
		{
		    g.adjustForTotalHeight(gamakaHeight);
		}
	    }
	}

	this.fHaveGamakas = haveGamakas;
	this.fGamakaHeight = gamakaHeight+1;
    }

    /*
     * called whenever row needs to evaluate how much space it has to allocate
     * for gamakas. This is to be called during progressive rendering. For
     * non-progressive rendering, preAdjustGamakas should be called 
     */
    this.adjustGamakas  = function() {
	var part = this.fFirstPart;
	var haveGamakas = false;
	var gamakaHeight = 0;
	while( part ) {
	    var m = null;
	    if( part.partType() == ROWVIEWPART_SWARA )  {
		m = part.getModel();
		var g = null;
		if( m.getGamaka ) g = m.getGamaka();
		if( g != null ) {
		    haveGamakas = true;
		    h = g.getHeight();
		    if( h >= gamakaHeight ) gamakaHeight = h;
		}
	    }
	    part = part.next;
	}
	if( haveGamakas == this.fHaveGamakas && (!haveGamakas || gamakaHeight == this.fGamakaHeight)) 
	    return;
	this.fHaveGamakas = haveGamakas;
	this.fGamakaHeight = gamakaHeight;

	var part = this.fFirstPart;
	while( part ) {
	    if( part.adjustGamaka ) 
		part.adjustGamaka();
	    part = part.next;
	}
    }

    /**
     * change the gamaka for the swara and adjust row accordingly
     */
    this.changeGamaka  = function( swaraView, gamaka ) {
	swaraView.setGamaka(gamaka);

	this.adjustGamakas();
    }

    /** 
     * change the speed and/or length of the swara and relayout the song accordingly.
     * <p>
     * Note: This involves recreation of the swara view.
     *
     * @param {SwaraView}  swaraView the swara view whose swara has to change in speed
     * @paran {int}	   speed     new speed
     * @paran {int}	   length    new length
     *
     * @return the new swara view object for the passed in view (relayout causes recreation)
     */
    this.changeSwaraSpeedAndLength  = function( swaraView, speed, length ) {
	var cellIndex = swaraView.getCellIndex();
	var swara     = swaraView.getModel();

	// figure out row index
	var rowIndex = this.getRowIndex();
	if( rowIndex < 0 )  {
	    alert( "internal error: row index" );
	    return;
	}

	// figure out the duration of the passed in swaraView and also
	// the column index (accounting for column spans)
	var curDur = this.getColumnTime(cellIndex);

	// replace swaras and lyrics from block "block" starting from swara
	// "swara" and lyric "lyric", which go into row -this, starting
	// at cell index cellIndex
	swara.setSpeed(speed);	// finally set speed 
	swara.setLength(length);	// finally set speed 
	//alert("cellindex = " + cellIndex + 
	       //", tala = " + this.fTala.name() +
	       //", dur = " + curDur.fNum + "/" + curDur.fDenom);
	this.pageView().songView().replaceSwarasFrom(this, rowIndex, cellIndex, swara.getBlock(), swara, this.fTala, curDur);

	var part = this.fFirstPart;
	for( var i = 0; part != null && i < cellIndex; i++, part = part.next );
	if( part == null )
	    alert( "we got a problem");
	return part;
    }

    /**
     * delete all swaras (and associated lyrics) parts start from column index 
     * #idx till end of row
     * <p>
     * This is an override of TableRowPageViewPart. It is an 
     * implementation that is aware that the row is part of a notation line
     * and hence made up of multiple rows in a table (which are themselves
     * cells of the row that is the NotationLine)
     *
     * @param {int}	cellidx	the column/cell index
     */
    this.deleteSwarasTillEnd = function(cellidx) {
	var ncells = this.getCellCount() - cellidx;
	for( var i = 0; i < ncells; i++ )
	    this.removeCell(cellidx);

	var lyricRows = this.lyricRows();
	var nlr = lyricRows.length;
	for(var r = 0; r < nlr; r++ ) {
	    var lyricRowView = lyricRows[r];
	    var ltr = lyricRowView.getContents();
	    ncells = lyricRowView.getCellCount() - cellidx;
	    for( var i = 0; i < ncells; i++ ) {
		lyricRowView.removeCell(cellidx);
	    }
	}
    }

    /**
     * render the swara row view - either progressively (i.e create DOM
     * objects now), or non-progressively (no DOM, just generate HTML content)
     * <p>
     * This renders (or generates HTML content for) the row view such that
     * it goes inside a NotationLine that is a row at index "idx" in the outer
     * table. 
     *
     * @param	{boolean} asHTML	true => non-progressive rendering,
     *					false => progressive rendering
     * @param	{DOM}	  table		The table in which the notation-line
     *					to which this view belongs to
     * @param   {boolean} compactLayout	compact layout or span to page width?
     * @param	{int}	  idx		index of the notation line in the
     *					table
     * @param   {String}  heading	The label for the row (sangati label)
     *					if any
     * @param {Song}             song	the song (to get swara font preferences for heading)
     * @return the DOM table row that represents the rendering (in this case 
     * the NotationLine) for progressive rendering, and NOTHING MEANINGFUL
     * for non-progressive rendering, since in this case the HTML content of 
     * the lyric row view is added to the notation line HTML content and 
     * maintained there until a later call to renderDOMCells which will 
     * combine all the notation line HTML content and return it
     */
    this.render = function(asHTML, table, compactLayout, idx, heading, song) {
	return this.renderSwaraLyricRow(asHTML, null, this.fTala, 
					this.fIndexInLayoutCycle, table, 
					compactLayout, idx, heading, song);
    }

    /**
     * move the HTML contents of the row from one HTML table to another
     * <p>
     * This is an override of TableRowPageViewPart.
     *
     * @param {DOMElement_TABLE}	the new table to which the contents 
     *					need to be moved
     * @param {idx}			the index (of the NotationLine) in 
     *					that table
     */
    this.moveHTMLContents = function(toTable, idx) {
	return this.moveSwaraLyricRowHTMLContents(this.fTala, this.fIndexInLayoutCycle, toTable, idx);
    }

    /**
     * return the index of the row in layout cycle
     * @type int
     */
    this.getIndexInLayoutCycle = function() {
	return this.fIndexInLayoutCycle;
    }

    /**
     * the tala for the row - applicable only if swara row
     * @type Tala
     * @private
     */
    this.fTala     = tala;

    /**
     * the start duration (within tala cycle - applicable only if swara row)
     * @type Duration
     * @private
     */
    this.fStartDur = startDur;

    /** 
     * are there any gamaka markers on this row?
     * @type boolean
     * @private
     */
    this.fHaveGamakas = false;

    /** 
     * if there are gamaka markers, how much vertical space to allocate for all
     * gamaka markers
     * @type int
     * @private
     */
    this.fGamakaHeight = 0;

    /**
     * lyric-rows associated with this swara row
     * @type LyricRowView[]
     * @private
     */
    this.fLyricRows = new Array();

    /**
     * index of row in layout cycle
     */
    if(!indexInLayoutCycle) indexInLayoutCycle = 0;
    this.fIndexInLayoutCycle = indexInLayoutCycle;

    tala               = null;
    startDur           = null;
    indexInLayoutCycle = null;
}
SwaraRowView.prototype = new SwaraLyricRowView(true);

/*
 * @class
 * represents the view content of a single row (line) of lyrics
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link LyricRowView#render}
 * when the 'asHTML' parameter to it is false.
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done by {@link LyricRowView#render} when
 * the 'asHTML' parameter to it is true.
 * </ul>
 * Both case, depend on {@link SwaraLyricRowView@renderSwaraLyricRow} to do
 * the real work. The only thing done in render is to decide if the lyric row
 * is rendered inside the same notation line as its swara row or is it in its
 * own. The latter will happen only if page break happens between the two.
 * This is not considered during non-progressive rendering since no pagination
 * is done during non-progressive (it is done afterwards when rendering of
 * entire song is done - see {@SongView#renderContents})
 *<p>
 * In non-progressive rendering, the HTML content of the <tr> generated by 
 * render, but is actually maintained inside the NotationLine object in an
 * "hold area" (so that it can gather content for subsequent lyric rows 
 * that belong to it also). The view itself establishes a reference to an 
 * array in the hold area (see {@link SwaraLyricRowView@fInnerHTML}), and
 * fills it with the HTML content of the notations themselves (i.e. the table 
 * cells inside the row) on calls (by the notation view objects) to 
 * {@link SwaraLyricRowView#addDOMCellAsHTML}. A later call to 
 * {@link SwaraLyricRowView#renderDOMCells} is expected - at which time for 
 * the full notation line content is returned.
 * <p>
 * In both cases, a subsequent call to {@link SwaraLyricRowView#attach} is needed
 * to associate the DOM with the view. In case of progressive rendering, this is 
 * automatic. In case of non-progressive, an separate call to attach is expected later.
 */
function LyricRowView() 
{
    /**
     * get the swara row view associated this lyric row view 
     * 
     * @type SwaraRowView 
     */
    this.getSwaraRow = function() { return this.fSwaraRow; }

    /**
     * make the passed-in lyric row as the swara row view associated with this lyric row view
     * @param {SwaraRowView} swaraRow
     */
    this.setSwaraRow = function( swaraRow ) {
	this.fSwaraRow = swaraRow;
    }

    /**
     * render the lyric row view - either progressively (i.e create DOM
     * objects now), or non-progressively (no DOM, just generate HTML content)
     * <p>
     * This renders (or generates HTML content for) the row view such that
     * it goes inside a NotationLine that is a row at index "idx" in the outer
     * table. If a NotationLine that corresponds to the swara row (or one of 
     * its lyric rows) for this lyric row already exists at idx, then this 
     * lyric row is added to that existing NotationLine. Else a new 
     * NotationLine is created
     *
     * @param	{boolean} asHTML	true => non-progressive rendering,
     *					false => progressive rendering
     * @param	{DOM}	  table		The table in which the notation-line
     *					to which this view belongs to
     * @param   {boolean} compactLayout	compact layout or span to page width?
     * @param	{int}	  idx		index of the notation line in the
     *					table
     * @return the DOM table row that represents the rendering (in this case 
     * the NotationLine) for progressive rendering, and NOTHING MEANINGFUL
     * for non-progressive rendering, since in this case the HTML content of 
     * the lyric row view is added to the notation line HTML content and 
     * maintained there until a later call to renderDOMCells which for the 
     * first SwaraLyricRowView under the NotationLine which will combine all
     * the notation line HTML content and return it
     */
    this.render = function(asHTML, table, compactLayout, idx) {
	var notationLine = null;

	if( asHTML ) {
	    /*
	     * for non-progressive rendering, always reuse swara-row's notation
	     * line. It is presumed that non-progressive rendering has no 
	     * pagination (cant paginate since it requires info which is known 
	     * only upong rendering)
	     */
	    return this.renderSwaraLyricRow(asHTML, this.fSwaraRow.getNotationLine(), 
	    				    this.fSwaraRow.getTala(), 
					    this.fSwaraRow.getIndexInLayoutCycle(),
					    table, compactLayout, idx);
	}

	// figure out idx
	if( !idx ) {
	    idx = 0;
	    if( table.rows )
		idx = table.rows.length;
	}
	// see if there is an approp existing NotationLine - such a row will
	// have its "view" prop pointing to our swara-row, or will have
	// its view point to a lyric row of our swara-row
	if(idx >= 0 && table.rows && idx < table.rows.length ) {
	    var tr = table.rows[idx];
	    var view = Utils.getObjForId(tr);
	    if( view && view.partType &&
		 ((view.partType() == PAGEVIEWPART_SWARAROW  // a swara row
				&& view == this.fSwaraRow) ||  // OUR swara row!
		    (view.partType() == PAGEVIEWPART_LYRICROW && 	// a lyric row
			view.getSwaraRow() == this.fSwaraRow )) ) // whose swara row
								   // is OUR swara row!
	    {
		notationLine = this.fSwaraRow.getNotationLine()
	    }
	}
	// render as a new notation line (notationLine == null) or to existing one
	return this.renderSwaraLyricRow(asHTML, notationLine, this.fSwaraRow.getTala(), 
					this.fSwaraRow.getIndexInLayoutCycle(),
					table, compactLayout, idx);
    }

    /**
     * move the HTML contents of the row from one HTML table to another
     * <p>
     * This is an override of TableRowPageViewPart.moveHTMLContents
     *
     * @param {DOM_TABLE}	the new table to which the contents need
     *				to be moved
     * @param {idx}		the index (of the NotationLine) in that table
     */
    this.moveHTMLContents = function(toTable, idx) {
	return this.moveSwaraLyricRowHTMLContents(this.fSwaraRow.getTala(), 
				this.fSwaraRow.getIndexInLayoutCycle(), toTable, idx);
    }

    /**
     * swara-row associated with this lyric row
     * @type SwaraRowView
     * @private
     */
    this.fSwaraRow = null;
}
LyricRowView.prototype = new SwaraLyricRowView(false);

/**
 * @class
 * view content of a heading
 * <p>
 * The view is a table-row in a table inside a page represented by {@link PageView}
 * <p>
 * <b>Rendering</b>: There are 2 kinds of rendering 
 * <ul>
 * <li> the progressive rendering used in WYSIWYG mode where rendering creates 
 * the actual DOM elements for the heading - done by {@link HeadingView#render} 
 * <li> non-progressive rendering used in start-up where render simply generates
 * the HTML content in a string. This is done by {@link HeadingView#renderAsHTML}
 * </ul>
 * In <u>both</u> cases, the <i>inner</i> (i.e. whats inside the table cell that
 * represents the heading) content is always generated as HTML content in
 * {@link:HeadingView#renderInnerAsHTML}. Once this is done, in the progressive
 * rendering case we render it by doing td.innerHTML (where td is the DOM
 * table-cell). In the non-progressive case, we generate the HTML content of 
 * td, and stick the inner HTML content inside and return  the entire content
 *
 * Since in both cases, inner content is generated as a whole and rendered, both
 * cases need a call to {@link HeadingView#attach} to associate the DOM with
 * the view. In case of progressive rendering, this is automatic. In case of
 * non-progressive, an separate call to attach is expected later.
 */
function HeadingView() 
{
    /**
     * get the underlying heading model
     * @return the underlying heading model
     * @type Heading
     */
    this.getModel = function() { return this.fHeading; }

    /**
     * set the text
     * @param {String} txt the new text
     */
    this.setText = function(txt) {
	if( txt == "" ) txt = "\xa0";	// so that it can be removed!
	this.fHeading.fText = txt;
	if( this.fTextNode ) {
	    var t = "" + txt;
	    t = t.replace(/\s/g, "\xa0");
	    this.fTextNode.nodeValue = t;
	}
	if( this.fHeading.isTitle() ) {
	    if( !document.titleSet )
		document.title = txt;
        }
    }

    /**
     * set bold state
     * @param {Boolean} val	set text to bold or normal
     */
    this.setBold = function(val) {
	if( val ) this.fHeading.fBold = true;
	else this.fHeading.fBold = false;
	if( this.fHeading.fBold )
	    this.fSpan.style.fontWeight = "bold";
	else
	    this.fSpan.style.fontWeight = "normal";
    }

    /**
     * set italic state
     * @param {Boolean} val	set text to italic or normal
     */
    this.setItalic = function(val) {
	if( val ) this.fHeading.fItalic = true;
	else this.fHeading.fItalic = false;
	if( this.fHeading.fItalic )
	    this.fSpan.style.fontStyle = "italic";
	else 
	    this.fSpan.style.fontStyle = "normal";
    }

    /**
     * set the font family
     * @param {String} font	font family
     */
    this.setFont = function(family) {
	this.fHeading.fFont = family;
	this.fSpan.style.fontFamily = '"' + family + '"';
    }

    /**
     * set the font size
     * @param {String} fontsz	font size as specifiable in a css style
     */
    this.setFontSize = function(fontsz) {
	this.fHeading.fFontSize = fontsz;
	this.fSpan.style.fontSize = fontsz;
    }

    /**
     * set the text color
     * @param {String} color	color as specificable in a css style
     */
    this.setColor = function(color) {
	this.fHeading.fColor = color;
	this.fSpan.style.color = color;
    }

    /**
     * set the alignment
     * @param {ALIGNMENT} align	the alignment
     */
    this.setAlignment = function(align) {
	this.fHeading.fAlignment = align;
	if( align == ALIGN_RIGHT ) {
	    this.fSpan.style.textAlign = "right";
	    this.fTableCell.style.textAlign = "right";
	}
	else if( align == ALIGN_CENTER ) {
	    this.fSpan.style.textAlign = "center";
	    this.fTableCell.style.textAlign = "center";
	}
	else {
	    this.fSpan.style.textAlign = "left";
	    this.fTableCell.style.textAlign = "left";
	}
    }

    /**
     * render the heading as a table row (progressive rendering)
     * @param {Heading} 	 heading	heading object
     * @param {int} ncols	 # of columns in the table
     * @param {DOMElement_TABLE} table	the table
     * @param {boolean}	compactLayout	compact layout or are we spreading to 
     *					occupy entire page width?
     * @param {int} idx		 index of row in table (optional, in which 
     *				 case add to end)
     * @return the table row representing the rendering
     * @type DOMElement_TR
     */
    this.render = function(heading, ncols, table, compactLayout, idx) {
    	this.fHeading = heading;

	ncols ++;	// get past the margin (sangati label) column	
	if( compactLayout ) {
	    ncols++;	// for filler cell
	}

	if( idx == null )  {
	    if( !table.rows ) 
		idx  = 0;
	    else 
		idx = table.rows.length;
	}
	var tr = table.insertRow(idx);
	tr.className = "hrow";	// set class-name (attach requires it for validation)
	// set text alignment at table cell level
	var td = Utils.addTableCell(tr, null, ncols+1, 0);
	if( this.fHeading.fAlignment == ALIGN_RIGHT )
	    td.style.textAlign = 'right';
	else if( this.fHeading.fAlignment == ALIGN_CENTER )
	    td.style.textAlign = 'center';
	else
	    td.style.textAlign = 'left';

	// generate inner content
	var htmlContent = this.renderInnerAsHTML(heading);	
	td.innerHTML = htmlContent;	// render it

	// now attach to generated contents
	this.attach(table, tr, idx);
	return tr;
    }

    /**
     * render the HTML contents of the heading and return it
     * @param {Heading} 	 heading	heading object
     * @param {int} ncols	 # of columns in the table
     * @param {boolean}	compactLayout	compact layout or are we spreading to 
     *					occupy entire page width?
     * @return the HTML representation of the table row
     * @type String
     */
    this.renderAsHTML = function(heading, ncols, compactLayout) {
    	this.fHeading = heading;

	ncols ++;	// get past the margin (sangati label) column	
	if( compactLayout ) {
	    ncols++;	// for filler cell
	}
	var s = new Array();
	var i = 0;
	if( heading.followsPageBreak() )
	{
	    /* use hrowp to indicate that it must start a new page!! */
	    s[i++] = '<tr class="hrowp">';
	}
	else
	    s[i++] = '<tr class="hrow">';
	s[i++] = '<td colspan="';
	s[i++] = ncols;	// fpr
	s[i++] = '" style="';
	if( this.fHeading.fAlignment == ALIGN_RIGHT )
	    s[i++] = 'text-align:right;';
	else if( this.fHeading.fAlignment == ALIGN_CENTER )
	    s[i++] = 'text-align:center;';
	else
	    s[i++] = 'text-align:left;';
	s[i++] = '">';
	s[i++] = this.renderInnerAsHTML(heading);
	s[i++] = '</td></tr>';
	return s.join("");
    }

    this.processVariables = function(txt)  {
	var vari = 0;
	var trans = "";
	var s = txt;
	while( true )
	{
	    vari = s.indexOf('$');
	    if( vari < 0 )
	    {
	    	trans += s;
		break;
	    }
	    vari++;
	    var vare = vari+1;
	    var varname = "";
	    var strend = s.length;
	    while( vare < strend )
	    {
	    	var c = s.charAt(vare);
		if( (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
		   (vare > vari && (c >= '0' && c <= '9')) || c == '_' )
		{
		   vaname += c;
		   vare++;
		}
		else
		    break;
	    }
	}
    }

    



    /**
     * generate the HTML representation of the inner contents of the heading and return it
     * @param {Heading} 	 heading	heading object
     * @return the HTML representation of the inner contents of the table cell
     * @type String
     */
    this.renderInnerAsHTML = function(heading) {
	var s = new Array();
	var i = 0;
	if( this.fHeading.fAlignment == ALIGN_CENTER ) {
	    s[i++] = '<center style="padding:0 0 0 0;">';
	    s[i++] = '<table style="border-collapse:collapse;padding:0 0 0 0;font-size:1em;">'
	    s[i++] = '<tr><td style="padding:0 0 0 0;">';
	}
	s[i++] = '<span class="heading" style="';
	if( heading.fFontSize && heading.fFontSize != "" ) {
	    s[i++] = 'font-size:';
	    s[i++] = heading.fFontSize;
	}
	if( heading.fFont && heading.fFont != "")
	{
	    s[i++] = ';font-family:';
	    s[i++] = heading.fFont;
	}
	if( heading.fColor && heading.fColor != "" ) {
	    s[i++] = ';color:';
	    s[i++] = heading.fColor;
	}
	s[i++] = ';font-style:';
	if( heading.fItalic )
	    s[i++] = "italic;";
	else
	    s[i++] = "normal;";
	if( heading.fBold ) 
	    s[i++] = 'font-weight:bold;';
	s[i++] = 'border:thin solid ';
	s[i++] = this.fBackgroundColor;
	if( theSongView.isInteractive())
	    s[i++] = ";cursor:pointer";
	else
	    s[i++] = ';cursor:default';
	s[i++] = ';">';
	var txt = heading.getText();


	/**
	 * do translation. There are 2 kinds when it comes to heading
	 * (1) our own [i], [b] style (TODO: phase this out)
	 * (2) wiky
	 * (3) language
	 */


	// do our own translations

	
	var txt_re=/\[([/]{0,1})([ibu])\]/g;
	txt = txt.replace(txt_re, "<$1$2>");
	txt = txt.replace(/\[br\]/g,"<br>");
	txt = txt.replace(/\\n/g,"\n");

	// do the wiky translation
	txt = Wiky.toHtml(txt);

	// remove/convert the outer <p>
	if( txt.match(/^<p>/))	// outer p - not needed
	    txt = txt.replace(/^<p>|<\/p>$/g,"");
	else if( txt.match(/^<p/)) // outer p with style - make it a span
	    txt = txt.replace(/^<p/,"<span").replace(/<\/p>$/,"</span>");
	// make table's inherit fontsizes
	if( txt.match(/^<table>/) ) {
	    // float left gets rid of extra space above table
	    txt = txt.replace(/<table>/g,'<table style="float:left;font-size:1em;">');;
	}
	else {
	    // inner table - dont fool with float
	    txt = txt.replace(/<table>/g,'<table style="font-size:1em;">');;
	}

	// add it to the HTML content array
	var t = "" + txt;
	if( !txt || txt == "" ) txt = "&nbsp;";
	s[i++] = txt;
	s[i++] = '</span>';

	if( this.fHeading.fAlignment == ALIGN_CENTER ) {
	    s[i++] = '</td></tr></table></center>';
	}

	// combine to get HTML content
	var contents = s.join("");

	// now do the language translation
	var translator = heading.getTranslator();
	if(translator != null )  {
	    contents = translateHTML(contents, translator);
	    if( heading && heading.isTitle() && !heading.titleSet )
	    {
		// remove tags
		document.title = contents.replace( /<[^>]*>/gi, '');
	    }
	}
	return contents;
    }

    /**
     * attach to the contents of an already rendered table row whose HTML
     * content was generated using this.renderAsHTML or this.render
     *
     * @param {DOMElement_TABLE} table	the table
     * @param {DOMElement_TR}    tr	the table row
     * @param {int}              rowidx	the table row index
     * @return true or false indicating if attach was successful
     * @param boolean
     */
    this.attach = function(table, tr, rowidx) {
	/* hrow and hrowp are valid heading classes */
	if(tr.className != "hrow" && tr.className != "hrowp" ) {
	    alert("attach failed - not heading row");
	    return false;
	}
	this.fOuter = tr;	// outer tr
	this.fTable = table;	// outer table
	this.fOuter.id = Utils.getNewId("tr");
	Utils.addToIdMap(this.fOuter, this);
	// this.fOuter.view = this;
	this.fTableCell = tr.cells[0];
	this.fSpan      = this.fTableCell.firstChild;
	this.fTextNode  = this.fSpan.firstChild;
	this.initSelectable(this.fSpan, true);
	return true;
    }

    /**
     * (protected) called when the view is selected 
     * @private
     */
    this.onselect = function() {
	EventManager.postEvent(EventManager.EVENT_HEADING_SELECTED, this, this.fHeading);
    }

    /**
     * @ignore
     */
    this.fPartType = PAGEVIEWPART_HEADING;

    /**
     * the heading object model
     * @type Heading
     * @private
     */
    this.fHeading = null;

    /**
     * the text node
     * @type DOMElement_TEXT
     * @private
     */
    this.fTextNode = null;

    /**
     * the span node that envelops the text node
     * @type DOMElement_SPAN
     * @private
     */
    this.fSpan = null;

    /**
     * the table cell node that envelops the text node
     * @type DOMElement_TD
     * @private
     */
    this.fTableCell = null;

}
HeadingView.prototype = new SelectableTableRowPageViewPart() 

/**
 * @class
 * column guide at start of page
 *
 * The column guide is used to determine default/initial spacing of the swaras
 * in the notation. The guide itself is a notation line whose spacing is based
 * on the guide-row layout of the tala (note that the guide row layout is 
 * determined by the Tala object itself - considering how different angas 
 * across ALL rows of a single layout cycles fall)
 */
function ColumnGuideView() 
{
    /**
     * render the column guide as a table row (progressive rendering)
     * @return the table row representing the rendering
     * @type DOMElement_TR
     */
    this.render = function(tala, table, compactLayout, idx) {
	var n = new NotationLine();
	n.render(tala, tala.getLayout().GUIDE_ROW, table, compactLayout, idx, this);
    }

    /**
     * render the HTML contents of the heading and return it
     * @return the HTML representation of the table row
     * @type String
     */
    this.renderAsHTML = function(tala, compactLayout) {
	var n = new NotationLine();
	n.renderInnerRowAsHTML(this, tala.getLayout().GUIDE_ROW, tala, compactLayout); // render inner row
	return n.renderHTMLContent();	// render notation line itself as outer row and return its content
    }

    /**
     * @ignore
     */
    this.fPartType = PAGEVIEWPART_COLUMNGUIDE;
}
ColumnGuideView.prototype = new TableRowPageViewPart() 

/**
 * called when mouse is clicked in page area, we stop propagation.
 * <p>
 * this works in tandem with {@link SongView#containerClicked}
 * @private
 */
function pageClicked(e) {
    if( !e ) e = window.event;
    e.cancelBubble = true;
    if( e.stopProgapation ) e.stopPropagation();
    EventManager.postEvent(EventManager.EVENT_CONTENTAREA_MOUSECLICKED);
}

/**
 * @class
 * represents the view contents of a page
 * <p>
 * The view is a div inside the view for the song represented by {@link SongView}
 *
 * @constructor
 * @param {SongView} mySongView		song view
 * @param {boolean}  printable		are we rendering for printing or display
 * @param {String}   width		(optional) page width as a stringized float. 
 *					If not specified 8.5 inches is assumed. If zero,
 *					then width is variable (depends on content)
 * @param {String}   height		(optional) page height as a stringized float. 
 *					If not specified 11 inches is assumed. If zero,
 *					then height is variable (depends on content)
 * @param {String}   leftMargin		(optional) left margin width as a stringized float. 
 *					if not specified 0.25 inches is assumed
 * @param {String}   topMargin		(optional) top margin height as a stringized float. 
 *					if not specified 0.25 inches is assumed
 * @param {String}   rightMargin	(optional) right margin width as a stringized float. 
 *					if not specified 0.25 inches is assumed
 * @param {String}   bottomMargin	(optional) bottom margin height as a stringized float. 
 *					if not specified 0.25 inches is assumed
 */
function PageView(mySongView, printable, width, height, leftMargin, 
				topMargin, rightMargin, bottomMargin, notFirstPage) 
{

    /**
     * get the next page 
     * @return {PageView} the next page if any, else returns null
     */
    this.nextPage = function() {
	if( this.next ) {
	    return this.next;
	}
	return null;
    }

    /**
     * get the prev page 
     * @return {PageView} the prev page if any, else returns null
     */
    this.prevPage= function() {
	if( this.prev ) {
	    return this.prev;
	}
	return null;
    }

    this.nextSibling = function() { return this.nextPage(); }
    this.prevSibling = function() { return this.prevPage(); }


    /**
     * get the first row 
     * @return {TableRowPageViewPart} the first row if any, else returns null
     */
    this.firstRow = function() { return this.fFirstPart; }

    /**
     * get the last row
     * @return {TableRowPageViewPart} the last row if any, else returns null
     */
    this.lastRow = function() { return this.fLastPart; }

    /**
     * get the song view of which this page view is part of
     * @return the song view of which this page view is part of
     * @type SongView
     */
    this.songView = function() { return this.fSongView; }

    /**
     * get the DOM contents of the view
     * @return the DOM contents of the view
     * @type DOMElement
     */
    this.getContents = function() { return this.fOuter; }

    /**
     * render the view contents (inner and outer)
     * @return DOM div element representing the view contents
     * @type DOMElement_DIV
     */
    this.render = function(notfirstPage) {
	var div = document.createElement("div");
	if( this.fPrintable ) div.style.marginBottom   = "4px";
	// from css so that can be turned off in print view
	// div.style.border         = "thin solid";
	div.className = "Page";
	div.setAttribute( "class", "Page");
	div.setAttribute( "className", "Page");
	div.onclick = pageClicked;	// global fn
	if( notfirstPage)
		div.style.pageBreakBefore = "always";

	div.style.backgroundColor = 'rgb(255,255,255)';

	if( !NO_PAGINATION && !FLEXIBLE_WIDTH && this.fWidth != 0 ) div.style.width   = this.fWidth + "in";

	if( !NO_PAGINATION && !FLEXIBLE_WIDTH && this.fHeight != 0 ) div.style.height = this.fHeight + "in";

	div.style.padding	 = "0 0 0 0";
	if( Utils.isIE() )  {
	    div.style.zIndex         = 1;
	    //div.style.overflow       = "hidden";	// for firefox we dont want overflow hidden
	}

	this.fOuter = div;

	if( !FLEXIBLE_WIDTH && Utils.isIE() ) {
	    var divm = document.createElement("div");
	    // from css so that can be turned off in print view
	    divm.className = "PageOverflow";
	    divm.setAttribute( "class", "PageOverflow");
	    divm.setAttribute( "className", "PageOverflow");
	    divm.style.width          = "4px";
	    if( !NO_PAGINATION )
	        divm.style.height         = this.fHeight + "in";
	    divm.style.padding	 = "0 0 0 0";
	    divm.style.position       = "absolute";
	    if( !NO_PAGINATION )
		divm.style.left           = this.fWidth + "in";
	    divm.style.zIndex = 7;
	    divm.style.borderLeft = "1px dashed rgb(128,128,128)";
	    divm.style.background = "transparent";	// allows IE to do "event transparency"
	    						// and thus we can click at swaras that
							// have "overflown"
	    Utils.setOpacity(divm, 0.5);
	    div.appendChild(divm);
	}


	var table = document.createElement("table");
	// if notation spans entire page width - we need to do so
	if(!FLEXIBLE_WIDTH && spanNotationTableEntireWidth) table.style.width = "100%";
	table.style.height = "100%";
	table.style.borderCollapse = "collapse";
	div.appendChild(table);

	var topRow = table.insertRow(table.rows.length);
	var top = topRow.insertCell(topRow.cells.length);
	top.colSpan = 3;
	top.style.height = this.fTopMargin + "in";

	var middleRow = table.insertRow(table.rows.length);
	var left = middleRow.insertCell(middleRow.cells.length);
	left.style.width = this.fLeftMargin + "in";

	var inner = middleRow.insertCell(middleRow.cells.length);
	inner.style.padding = "0 0 0 0";
	inner.style.margin = "0 0 0 0";
	inner.style.overflow = "visible";	// this allows for stuff that flows over the page width to be
						//// visible and user can adjust stuff BUT ONLY on firefox
						// (and safari?). IE will expand table-cell to fit the content
						// (i.e. page will go beyond prescribed width)
	var d = document.createElement("div");
	if( !NO_PAGINATION && !FLEXIBLE_WIDTH && this.fWidth > 0 ) 
	    d.style.width = (this.fWidth - this.fLeftMargin - this.fRightMargin) + "in";
	else
	    d.style.width = "100%";

	if( !NO_PAGINATION && this.fHeight > 0 ) 
	    d.style.height = (this.fHeight - this.fTopMargin - this.fBottomMargin) + "in";
	else
	    d.style.height = "100%";
	d.style.top = 0;
	d.style.padding = "0 0 0 0";
	d.style.margin = "0 0 0 0";
	d.style.overflow = "visible";	// this allows for stuff that flows over the page width to be
					// visible and user can adjust stuff
	inner.appendChild(d);

	var right = middleRow.insertCell(middleRow.cells.length);
	right.style.width = this.fRightMargin + "in";

	var botRow = table.insertRow(table.rows.length);
	var bot = botRow.insertCell(botRow.cells.length);
	bot.colSpan = 3;
	bot.style.height = this.fBottomMargin + "in";

	//this.fOuter = d;

	// now create a div that will occupy all of fInner and make it our page content
	this.fInner = document.createElement("div");
	// if notation spans entire page width - we need to do so
	if(!FLEXIBLE_WIDTH && spanNotationTableEntireWidth ) this.fInner.style.width = "100%";
	this.fInner.style.height = "100%";
	this.fInner.style.backgroundColor = 'rgb(255,255,255)';
	d.appendChild(this.fInner);



	// center.appendChild(div);
	// return center;
	return div;
    }

    /**
     * add a page view part to this page view
     * @param {PageViewPart} part page view part. The part's "parent" field 
     *				  would be set to point to this page view.
     * @return true or false indicating if the add was successful
     */
    this.addPart = function( part ) {
	part.next = null;
	part.prev = this.fLastPart;
	part.parent = this;
    	if( this.fLastPart )
	    this.fLastPart.next = part;
	this.fLastPart     = part;
	if( !this.fFirstPart )
	    this.fFirstPart = part;
	return true;
    }

    /**
     * insert a page view part before another part in this page view
     * @param {PageViewPart} part 		page view part. The part's 
     *						"parent" field would be set to
     *						point to this page view.
     * @param {PageViewPart} beforeThisPart 	the page view part before which
     *						the insertion is to done. if null
     *						insert at end of page
     * @return true or false indicating if the insertion was successful
     */
    this.insertPart = function( part, beforeThisPart ) {
	part.parent = this;
	part.prev   = null;
	if( beforeThisPart == null ) {
	    // inserting at end
	    return this.addPart(part);
	}
	else if( beforeThisPart == this.fFirstPart ) {
	    // inserting at beginning
	    part.next = this.fFirstPart;
	    if( this.fFirstPart) 
		this.fFirstPart.prev = part;
	    this.fFirstPart = part;
	    return true;
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
     * remove a page view part from this page view
     * @param {PageViewPart} part page view part. The part's "parent" field 
     *				  would be set to null on removal
     * @return true or false indicating if the removal was successful
     */
    this.removePart = function(part) {
    	if( part.prev )
	    part.prev.next = part.next;
	if( part.next )
	    part.next.prev  = part.prev;
	if( part == this.fLastPart ) this.fLastPart = part.prev;
	if( part == this.fFirstPart ) this.fFirstPart = part.next;
	part.parent = null;
	return true;	
    }

    /**
     * get the content area where the song goes (valid after rendering)
     * @return  the dom element inside the view representing the content area
     * @type DOMElement
     */
    this.getContentArea = function() { return this.fInner; }

    /**
     * get the bottom of the content area (in pixels) relative to its top
     * (valid after rendering) - assumes savePageBottom has already been
     * called
     *
     * @return the bottom of the content area (in pixels) relative to its top
     * @type int
     */
    this.getPageBottom = function() {
	return this.fPageBottom;
    }

    /**
     * get the height of the notation content area in the page in pixels
     * @type int
     */
    this.getPageContentHeightInPixels = function() {
	if( this.fInner != null )
	    return this.fInner.offsetHeight;
	else
	    return 0;
    }

    /**
     * save the current page bottom
     */
    this.savePageBottom = function() {
	if( this.fInner != null )
	    this.fPageBottom = this.fInner.offsetTop + this.fInner.offsetHeight;
	return this.fPageBottom;
    }

    /**
     * the song view of which this page view is part of
     * @type SongView
     * @private
     */
    this.fSongView = mySongView;

    if( !width && width != 0 ) width = 8.5;
    /**
     * width of page in inches as a stringized float
     * @type String
     * @private
     */
    this.fWidth = width;

    if( !height && height != 0 ) height = 11;

    /**
     * height of page in inches as a stringized float
     * @type String
     * @private
     */
    this.fHeight = height;

    if( !leftMargin ) leftMargin = 0.25;
    /**
     * left margin width of page in inches as a stringized float
     * @type String
     * @private
     */
    this.fLeftMargin = leftMargin;
    
    if( !topMargin ) topMargin = 0.25;
    /**
     * top margin height of page in inches as a stringized float
     * @type String
     * @private
     */
    this.fTopMargin = topMargin;

    if( !rightMargin ) rightMargin = 0.25;
    /**
     * right margin width of page in inches
     * @type String
     * @private
     */
    this.fRightMargin = rightMargin;

    if( !bottomMargin ) bottomMargin = 0.25;
    /**
     * bottom margin height of page in inches as a stringized float
     * @type String
     * @private
     */
    this.fBottomMargin = bottomMargin;

    /**
     * the outer content
     * @type DOMElement
     * @private
     */
    this.fOuter = null;

    /**
     * the inner content - which is the content area where notation goes
     * @type DOMElement
     * @private
     */
    this.fInner = null;

    /**
     * is this page a printable view
     * @type boolean
     * @private
     */
    this.fPrintable = printable;

    /**
     * first page view part under the page view
     * @type PageViewPart
     */
    this.fFirstPart = null;

    /**
     * last page view part under the page view
     * @type PageViewPart
     */
    this.fLastPart  = null;

    /**
     * the page bottom
     * @type int
     */
    this.fPageBottom = 1000;
}

/**
 * called when we click on container area.
 * <p>
 * The onclick handler for page content prevents events from being bubbled
 * and so we get called only when clicked out of the notation area - see 
 * {@link pageClicked}). We cancel the selection.  This is mainly 
 * to allow the user to deselect the current selection before printing - 
 * otherwise the border around the currently selected element will show 
 * up (and there is no way to get around that)
 * @private
 */
function _containerClicked(e) {
    var view = Utils.getObjForId(this);	// this.view
    if(view && view.containerClicked) view.containerClicked(e);
}

/**
 * @class
 *
 * represents the view content of the entire song
 *
 * the view is one or more tables
 * You have usually one table per-page. In other words every page begins a
 * new table. You can have multiple tables in a page only if you have tala 
 * switches. Within each table, each row stands for one of the following
 * <ol>
 * <li> a heading 
 * <li> a swara row (# of swaras dependent on user customizable layout)
 * <li> a lyric row (always follows a swara row)
 * <li> a blank (for breaks)
 * </ol>
 * # of columns in the table depends on the layout of the tala as specified by
 * user
 */
function SongView(song,nTalaCyclesPerRow,printable,speedMarkersBelow) 
{
    /*
     * is this an interactive view 
     */
    this.isInteractive = function() { return this.fInteractive; }

    /**
     * make this view interactive/non-interactive (should be called prior to
     * rendering
     */
    this.setInteractive = function(val) { this.fInteractive = val; }


    this.onCleanup = function() { this.fSong = null; }

    /**
     * get the DOM contents of the song
     * @return the DOM contents of the song
     * @type DOMElement
     */
    this.getContents = function() { return this.fOuter; }

    /**
     * get the underlying song (model)
     * @return the underlying song (model)
     * @type Song
     */
    this.getSong = function() { return this.fSong; }

    /**
     * get the underlying song (model)
     * @return the underlying song (model)
     * @type Song
     */
    this.getModel = function() { return this.fSong; }

    /**
     * get the current selected row view part
     * @return the current selected row view part
     * @type SelectableRowViewPart
     */
    this.getSelected = function() { return this.fSelected; }

    /**
     * set the current selected row view part
     * @param {SelectableRowViewPart} obj	view part
     */
    this.setSelected = function(obj) { this.fSelected = obj; }

    /**
     * select a row view part
     * @param {SelectableRowViewPart} obj	view part
     */
    this.selectObject = function(obj) {
	// if we are in insert mode and we select a different object, cancel
	// out "we are currently editing inserted object" (if it is set)
	var oldSel = this.fSelected;
	if( obj != this.fSelected )
	    obj = DefaultNotationSelectionController.preSelectionChange(this,this.fSelected,obj);
	if( obj != this.fSelected && NotationEditModeController.insertMode() )
	    NotationEditModeController.setEditingInserted(false);
	if( obj == null ) {
	    if( this.fSelected != null ) {
		this.fSelected.select(false);
		this.fSelected = null;
		EventManager.postEvent(EventManager.EVENT_NOTHING_SELECTED, this, null);
	    }
	}
	else if( obj.select(true) ) {
	    if( this.fSelected && obj != this.fSelected ) this.fSelected.select(false);
	    this.fSelected = obj;
	}
	if( oldSel != this.fSelected )
	    DefaultNotationSelectionController.onSelectionChange(this, this.fSelected, oldSel );
	else if( this.fSelected )
	    DefaultNotationSelectionController.onReselect(this, this.fSelected);
    }

    /**
     * get selectablethe row view part that is next to the current
     * selected row view part
     */
    this.getNextSelectableObject = function(obj) {
	var selobj = null;
	if( obj.nextSelectable ) selobj = obj.nextSelectable();
	while( true ) {
	    if( selobj != null ) break;
	    if( obj.rowView )	// a row view part
		obj = obj.rowView();
	    else if( obj.pageView )	// a page view part
		obj = obj.nextSibling();
	    if( obj == null ) break;
	    var svobj = obj;
	    while( true ) {
		 if( obj == null )
		    break;
		 if( obj.isSelectable && obj.isSelectable() ) {
		    selobj = obj;
		 }
		 else if( obj.firstSelectable ) {
		    selobj = obj.firstSelectable();
		 }
		 if( selobj != null )
		    break;
		 if( !obj.nextSibling() ) obj = null;
		 else obj = obj.nextnextSibling();
	    }
	    obj = svobj;
	}
	return selobj;
    }

    /**
     * get the first row of a certain type that follows a row
     * @param {RowViewPart} 	 row 	row after which we are looking for our row
     * @param {ROWVIEWPART_TYPE} typ	(optional), the type of row we are looking for, 
     *					if not speciifed we are looking for any row
     * @return the first row of asked type that follows 'row' or null if no such row
     * @type {RowViewPart}
     */
    this.getNextRow = function(row, typ) {
	var page = row.pageView();

	while( true ) {
	    row = row.nextRow();
	    if( row == null ) {
		var npage = page.nextPage();
		if( npage == null ) break;
		row = npage.firstRow();
		if( row == null ) break;
	    }
	    if( !typ || row.partType() == typ ) break;
	}
	return row;
    }

    /**
     * get the first row of a certain type that precedes a row
     * @param {RowViewPart} 	 row 	row before which we are looking for our row
     * @param {ROWVIEWPART_TYPE} typ	(optional), the type of row we are looking for, 
     *					if not speciifed we are looking for any row
     * @return the first row of asked type that precedes 'row' or null if no such row
     * @type {RowViewPart}
     */
    this.getPrevRow = function(row, typ) {
	var page = row.pageView();

	while( true ) {
	    row = row.prev;
	    if( row == null ) {
		var npage = page.prevPage();
		if( npage == null ) break;
		row = npage.lastRow();
		if( row == null ) break;
	    }
	    if( !typ || row.partType() == typ ) break;
	}
	return row;
    }

    /**
     * get the first row that follows this row that is selectable or has 
     * selectable parts in it
     * @param {RowViewPart} 	 row 	row after which we are looking for our row
     * @return the next row that is selectable or has selectable elems
     * @type RowViewPart
     */
    this.getNextSelectableRow = function(row) {
	while(true) {
	    row = this.getNextRow(row);
	    if( !row ) return null;
	    if( row.isSelectable()) return row;
	    else if(row.firstSelectable) {
		var s = row.firstSelectable();
		if( s ) return row;
	    }
	}
    }
    /**
     * get the first row that precedes this row and which is selectable or has
     * selectable parts in it
     * @param {RowViewPart} 	 row 	row before which we are looking for our row
     * @return the previous row that is selectable or has selectable elems
     * @type RowViewPart
     */
    this.getPrevSelectableRow = function(row) {
	while(true) {
	    row = this.getPrevRow(row);
	    if( !row ) return null;
	    if( row.isSelectable()) return row;
	    else if(row.lastSelectable) {
		var s = row.lastSelectable();
		if( s ) return row;
	    }
	}
    }

    /**
     * select the row view part that is next to the current
     * selected row view part
     */
    this.selectNextObject = function() {
	if( this.fSelected ) {
	    selobj = this.getNextSelectableObject(this.fSelected);
	    if( selobj != null ) this.selectObject(selobj);
	}
    }

    /**
     * select the row view part that is prior to the current
     * selected row view part
     */
    this.selectPrevObject = function() {
	if( this.fSelected ) {
	    var selobj = null;
	    var obj = this.fSelected;
	    if( obj.prevSelectable ) selobj = obj.prevSelectable();
	    while( true ) {
		if( selobj != null ) break;
		if( obj.rowView )	// a row view part
		    obj = obj.rowView();
		else  if( obj.pageView )	// a page view part
		    obj = obj.nextSibling();
		if( obj == null ) break;
		var svobj = obj;
		while( true ) {
		     if( !obj.prevSibling() ) obj = null;
		     else obj = obj.prevSibling();
		     if( obj == null )
			break;
		     if( obj.isSelectable && obj.isSelectable() ) {
			selobj = obj;
		     }
		     else if( obj.lastSelectable ) {
			selobj = obj.lastSelectable();
		    }
		    if( selobj != null )
			    break;
		}
		obj = svobj;
	    }
	    if( selobj != null ) this.selectObject(selobj);
	}
    }


    /**
     * render the song view
     * @param {DOMElement} body	dom elem under which song is rendered
     */
    this.render = function(body) {
	this.fCurTala        = null;
	this.fOuter          = null;
	this.fCurColCount    = 1;
	this.fCurColSwaraCount    = 1;
	this.fCurCol         = 0;
	this.fCurDuration.setZero();
	this.fBody           = body;

	this.renderContainer(this.fSong);
	this.nextPage(false);
	this._renderContents(this.fSong.parts());
	return this.fOuter;
    }

    /**
     * called when we click on container area - called from _containerClicked.
     * <p>
     * The onclick handler for page content prevents events from being bubbled
     * and so we get called only when clicked out of the notation area - see 
     * {@link pageClicked}). We cancel the selection.  This is mainly 
     * to allow the user to deselect the current selection before printing - 
     * otherwise the border around the currently selected element will show 
     * up (and there is no way to get around that)
     *
     * <p>
     * @private
     */
    this.containerClicked = function(e) {
        // this is the div element and "view" prop was set up by renderContainer
	// to point to songView
	var view = this; 
	if(view) view.selectObject(null);
    }

    /**
     * render the (inner) container 
     * @private
     */
    this.renderContainer = function(song) {
	var div = document.createElement("div");
	// set className so that background comes from stylesheet
	div.style.className = "SongContainer";
	div.setAttribute( "class", "SongContainer");
	div.setAttribute( "className", "SongContainer");
	div.onclick = _containerClicked;	// global
	div.id      = Utils.getNewId("song");
	Utils.addToIdMap(div, this);

	// if notation spans entire page width - song container needs to do so
	if(!FLEXIBLE_WIDTH && spanNotationTableEntireWidth) div.style.width = "100%";

	// NOTE: this seems to mess things up as not all contents show up in 
	// print-preview ????
	//div.style.pageBreakAfter = "always";
	div.style.padding = "0 0 0 0";
	this.fOuter = div;
	// make body same color as us - NOTE: moved to stylesheet
	// if( !this.fPrintable ) this.fBody.style.backgroundColor = 'rgb(224,224,224)';

	this.fBody.appendChild(this.fOuter);
    }


    /**
     * called during rendering to  advance to next page - advances this.fCurPage
     * to next page (creating it if necessary)
     *
     * @return the content part of current page (which is also saved in fCurPageContent)
     * @type DOMElement
     * @private
     */
    this.nextPage = function(notFirstPage) {
	// if there is a next page (happens on relayout due to modification
	// of existing song), return it
	if( this.fCurPage && this.fCurPage.nextPage() )  {
	    this.fCurPage        = this.fCurPage.nextPage();
	    this.fCurPageContent = this.fCurPage.getContentArea();
	    return this.fCurPageContent;
	}

	this.fCurPage = new PageView(this, this.fPrintable,this.fPageWidth, this.fPageHeight, 
			this.fSong.getLeftMarginOverride(),
			this.fSong.getRightMarginOverride(),
			this.fSong.getTopMarginOverride(),
			this.fSong.getBottomMarginOverride());

	this.addPart(this.fCurPage);

	// render page and get its outer content
	var pageRendered = this.fCurPage.render(notFirstPage);
	this.fCurPageContent = this.fCurPage.getContentArea();

	// append the page to the container of entire song
	this.fOuter.appendChild(pageRendered);

	// once added, get the page dimensions - using fInner of page
	this.fCurPage.savePageBottom();
	
	// note down page bottom
	return this.fCurPageContent;
    }

    /**
     * called during rendering to create a new table in the current page
     * @return the DOM TABLE element of the new table
     * @type DOMElement_TABLE
     * @private
     */
    this.renderNewTable = function() {
	var table = document.createElement("table");
	table.style.borderCollapse = "collapse";
	// if notation is to span entire width of page, table needs to do so
	if( !FLEXIBLE_WIDTH && spanNotationTableEntireWidth )
	    table.style.width = "100%";
	// table.border  = 1;	// for debugging: WARNING, breaks pagination of IE (so debug
				// only on FireFox)
	this.fCurPageContent.appendChild(table);

	var t = this.fCurTala;
	if( !t ) t = this.fSong.getDefaultTala();
	if(t.name().toLowerCase() != "manual") {

	var g = new ColumnGuideView();

	if( this.fRenderAsHTML ) {
	    // we are generating HTML content first and then rendering
	    this.fInnerHTML[this.fInnerHTML.length] = g.renderAsHTML(t, this.fCompactLayout );
	}
	else {
	    // progressive rendering
	    g.render(t, table, this.fCompactLayout );
	}

	}

	this.fCurTable = table;
	this.fCurCol = 0;
	return table;
    }

    /**
     * render the contents of the soong
     * @param part  first part of song
     * @private
     */
    this._renderContents = function(part) {
	/**
	 * for efficiency (all browsers - most improvement on IE), we will
	 * generate the HTML content of the song and render it in one shot
	 * rather than progressive rendering
	 */
	this.fRenderAsHTML = true;
	this.fInnerHTML    = new Array();
	if( !FLEXIBLE_WIDTH && spanNotationTableEntireWidth )
	    this.fInnerHTML[0] = '<table class="song" style="width:100%;border-collapse:collapse;">'
	else
	    this.fInnerHTML[0] = '<table class="song" style="border-collapse:collapse;">'
	this.fRowHoldArea  = new Array();	// area to hold pageview parts (except column guides)

	/**
	 * for faster generation, we use HTML content caches for swaras, lyrocs
	 * and tala markers - create the caches (global) now
	 *
	 * TODO: the background, foreground color should be controllable from
	 * settings
	 */
	SwaraViewHTMLCache = new SwaraViewHTMLCacheDefn(this.fSpeedMarkersBelow,"#000000","#ffffff");
	TalaMarkerViewHTMLCache = new TalaMarkerViewHTMLCacheDefn(this.fSpeedMarkersBelow);
	LyricViewHTMLCache = new LyricViewHTMLCacheDefn("#ffffff");

	// render a new table
	this.renderNewTable();
	var pageBottom = this.fCurPage.getPageContentHeightInPixels();

	while( part != null ) {
	    var typ = part.fPartType;
	    if( typ == PART_BREAK ) {
		this.renderBreak();
	    }
	    else if( typ == PART_TITLE ) {
		var txt = part.getText();
		var trans = part.getTranslator();
		var qualscheme = null;
		if( trans.getQualScheme ) { 
		    qualscheme = trans.getQualScheme();
	            trans.setQualScheme("noqual");
		}
		if( !trans )
		    document.title = txt;
		else
		    document.title = translateHTML(txt, trans);
		if( trans.getQualScheme )
	           trans.setQualScheme(qualscheme);
		document.titleSet = true;
	    }
	    else if( typ == PART_LINEBREAK ) {
		this.renderBreak();
	    }
	    else if( typ == PART_TALA ) {
		//if( this.fCurTala != null ) this.renderBreak();
		this.fCurTala = part;
		this.fCurCol  = 0;
		//this.fCurDuration.setZero();
		this.fCurColCount  = this.calcColCount(this.fCurTala,0);
		this.fCurColSwaraCount  = this.calcColSwaraCount(this.fCurTala,0);
		this.renderTala(this.fCurTala);
	    }
	    else if( typ == PART_GATISWITCH ) {
		/*
		 * we will encounter one here only if gatiswitch starts a new line
		 * (gati switches in the middle of a tala cycle would be handled
		 * by renderBlocksTill)
		 */
		if( this.fCurTala == null ) {
		    alert( "internal error: gati switch seen, but no current tala!" );
		    break;
		}
		this.fCurTala.switchGati(part.getGati());
		this.fCurColCount  = this.calcColCount(this.fCurTala,0);
		this.fCurColSwaraCount  = this.calcColSwaraCount(this.fCurTala,0);
	    }
	    else if( typ == PART_HEADING ) {
		if( this.fCurCol != 0 )
		{
		    //this.renderBreak();
		    this.fCurCol  = 0;
		    //this.fCurDuration.setZero();
		}
		this.renderHeading(part);
	    }
	    else if( typ == PART_SONGBLOCK ) {
		this.fCurDuration.setZero();
		part = this.renderBlocksTillNonBlock(part);
		//if( part != null )
		    //this.renderBreak();
		continue;
	    }
	    if( part == part.next ) {
		alert("infinite loop: parts");
		break;
	    }
	    part = part.next;
	}
	this.fInnerHTML[this.fInnerHTML.length] = "</table>";



	/**
	 * now is the time to render the generated content. So far we did not 
	 * worry about pagination (we couldnt because we havent rendered!) -
	 * but now it is time to do that as well
	 */

	// first render ENTIRE song (on a single page)
	var p = this.fCurTable.parentNode;
	p.removeChild(this.fCurTable);
	p.innerHTML     = this.fInnerHTML.join("");	// RENDER!!!!

	/**
	 * now we paginate. 
	 *
	 * We know we will be rendering a guide row EVERY page and so 
	 * guideBottom keeps track of the guide row height (we take the one 
	 * from the first page). We then look at the bottom of each row
	 * and if it is > end of a page we move its HTML content to the next
	 * page - Note that we DO NOT move the rendered DOM as that is
	 * expensive. We basically generate the HTML content for the pages
	 * and then render them in one shot
	 *
	 * In this process we will re-rendering the contents of the first
	 * page TWICE - once initially (so that we know the heights of each
	 * row) and then once again after repagination. This still is faster
	 * than progressive rendering (or even a hybrid approach where SOME
	 * progressive rendering is done)
	 */
	// now to paginate
	var tbl = p.firstChild;
	var nrows = tbl.rows.length;	// row 0 is guide
	var hasGuide = !this.fSong.isManualMode();
	var firstRow = ((hasGuide) ? 1 : 0 );
	var guideRow    = ((hasGuide) ? tbl.rows[0] : null);

	// determine guide row height
	var guideBottom;
	if( hasGuide )
	{
	if( tbl.rows[1] )
	    guideBottom = tbl.rows[1].cells[0].offsetHeight;
	else
	    guideBottom = tbl.rows[0].cells[0].offsetHeight;
	}
	else
	    guideBottom = 0;

	var rows = tbl.rows;
	var pages = new Array();	// HTML content of the pages

	var npage = 0;	
	pages[0] = new Array();
	var page = pages[0];
	var firstPageRowCount = 0;

	var pageOffsetAdjust = 0
	for(r = firstRow; r < nrows; r++) {
	    var row = rows[r];
	    {
		// NOTE: moves nline as a block, also wont work
		// for tala shifts (guide row would have to be chang)
		var newPage = false;
		/* 
	         * nlinep and hrowp are special cases of nline and hrow which are to
		 * start a new page
		 */
		if( row.className == "nlinep" || row.className == "hrowp" ) {
			/*row.style.pageBreakBefore = "always";*/
			newPage = true;
		}
		else {
		    if( !NO_PAGINATION )  {
			var o = row.offsetTop + row.cells[0].offsetHeight;
			var ao = o - pageOffsetAdjust;
			if( ao > pageBottom ) newPage = true;
		    }
		}
		if( newPage ) {
		    if(npage > 0 ) 
			page[page.length] = '</table>';
		    else {
			if(firstPageRowCount == 0 ) {
			    firstPageRowCount = r;
			}
		    }
		    npage++;

		    pages[npage] = new Array();
		    page = pages[npage];

		    //pageOffsetAdjust += (pageBottom-guideBottom); // + guideBottom;
		    pageOffsetAdjust = o - guideBottom - row.cells[0].offsetHeight;

		    if( !FLEXIBLE_WIDTH && spanNotationTableEntireWidth )
			page[page.length] = '<table class="song" style="border-collapse:collapse;width:100%;">';
		    else
			page[page.length] = '<table class="song" style="border-collapse:collapse;">';
		    if( hasGuide ) {
			page[page.length] = '<tr class="guiderow">';
			page[page.length] = guideRow.innerHTML;
			page[page.length] = '</tr>';
		    }
		}
		if( npage > 0 ) {
		    if( row.className && row.className != "")  {
			page[page.length] = '<tr class="';
			page[page.length] = row.className;
			page[page.length] = '">';
		    }
		    else
			page[page.length] = '<tr>';
		    page[page.length] = row.innerHTML;	// copy row's HTML contents to page content
		    page[page.length] = '</tr>';
		}
	    }
	}
	page[page.length] = '</table>';

	this.fRenderAsHTML = false;	// no longer rendering HTML

	/*
	 * here we have the HTML contents of all pages (after repagination) in 
	 * 'pages' array. If the # of pages is 1, then the original rendering 
	 * is good enough. Else we will render all the pages from the HTML
	 * content ofo pages.
	 */
	var npages = pages.length;
	if( npages > 1 ) {
	    var nrows = tbl.rows.length;
	    for(var nr = firstPageRowCount; nr < nrows; nr++ ) {
		var row = tbl.rows[firstPageRowCount];
		row.parentNode.removeChild(row);
	    }
	    for(var page = 1; page < npages; page++ ) {
		this.nextPage(true);
		this.fCurPageContent.innerHTML = pages[page].join("");
	    }
	}

	/**
	 * if we are in non-interactive mode - we are DONE
	 */
	if(!this.fInteractive)
	    return;

	/**
	 * interactive mode: we need go attach all the generated DOM nodes with our 
	 * View objects
	 */
	page   = this.fFirstPart;
	var rows   = this.fRowHoldArea;
	var nrows  = this.fRowHoldArea.length;
	var rowidx = -1;
	var e = false;
	var className;
	while( !e && page ) {
	    var table  = page.getContentArea().firstChild;
	    var trows  = table.rows;
	    var ntrows = trows.length;
	    for(var i = 1; !e && i < ntrows; i++ ) 	{ // 1: skip guide row
		var trow = trows[i];
		/* nline and nlinep (that which should start a new page) are valid classes here */
		if( trow.className == "nline" || trow.className == "nlinep" ) {
		    var cell  = trow.cells[0];
		    if( cell.className && cell.className == "margin" )	// skip sangati label col
			cell = trow.cells[1];
		    var itable = cell.firstChild;
		    var itrows = itable.rows;
		    var nitrows = itrows.length;
		    for(var ii = 1; ii < nitrows; ii++ ) 	{ // 1: skip guide row
			rowidx++;
			row       = rows[rowidx];
			if( row.partType() != PAGEVIEWPART_SWARAROW && row.partType() != PAGEVIEWPART_LYRICROW) {
			    alert("internal error: nline not associated with swara/lyric row: (" + i + ", " + rowidx + ")");
			    e = true;
			    break;
			}
			if(!row.attach(table, trow, i, ii)) {
			    e = true;
			    break;
			}
			page.addPart(row);
		    }
		}
		else 
		{
		    rowidx++;
		    row    = rows[rowidx];
		    if( row.partType() == PAGEVIEWPART_SWARAROW || row.partType() == PAGEVIEWPART_LYRICROW) {
			alert("internal error: nline not associated with swara/lyric row: (" + rowidx + ")");
			e = true;
			break;
		    }
		    if( !row.attach(table, trow, i))	// attach row part to table row #i trow, table 'table'
		    {
			e = true;
			break;
		    }
		    page.addPart(row);
		}
	    }
	    page = page.next;
	}

    }

    /**
     * calculate # of columns  occupied by swaras in the table for row #n in 
     * layout cyclefor the tala - this  translates to # of tala parts + tala 
     * markers in the row
     * @param {Tala} tala		the tala
     * @param {int}  indexInLayoutCycle	the index in layout cycle of tala
     * @return # of swaras in the table per row 
     * @type int
     * @private
     */
    this.calcColSwaraCount = function(tala, indexInLayoutCycle) {
	if(!tala)
	    tala = this.fSong.getDefaultTala();
	if(!indexInLayoutCycle) indexInLayoutCycle = 0;
	var ret =  tala.getLayout().getMaxNCols(indexInLayoutCycle);
	return ret;
    }

    /**
     * calculate # of columns in the table fo row #n in layout cycle for the 
     * tala - this  translates to # of tala parts + tala markers in the row
     * @param {Tala} tala	the tala
     * @param {int}  indexInLayoutCycle	the index in layout cycle of tala
     * @return # of columns in the table per row 
     * @type int
     * @private
     */
    this.calcColCount = function(tala, indexInLayoutCycle) {
	if(!indexInLayoutCycle) indexInLayoutCycle = 0;
	return tala.getLayout().getRowPartCount(indexInLayoutCycle)*2;
    }

    /**
     * (unimplemented) render a tala specifier in the current location in view
     * @param {Tala}	tala	the tala
     * @private
     */
    this.renderTala = function(tala) {
    }

    /**
     * render a song break in the current location in view
     * @private
     */
    this.renderBreak = function(isPageBreak) {
    	var b = new BreakView();
	if( this.fRenderAsHTML ) {
	    this.fInnerHTML[this.fInnerHTML.length] = b.renderAsHTML(this.fCurColCount);
	    this.fRowHoldArea[this.fRowHoldArea.length] = b;
	}
	else {
	    var tr = b.render(this.fCurColCount, this.fCurTable);
	    if( tr != null ) this._appendRow(b); // append the table row
	}
    }

    /**
     * render a spacer in the current row
     * @param {int}	nCols	the column span in the row for the spacer
     * @return the view for the spacer
     * @type SpacerView
     * @private
     */
    this.createSpacer = function(nCols) {
	var s =  new SpacerView();
	// render inner content
	s.renderInner(this.fRenderAsHTML, nCols);
	return s;
    }

    /**
     * render a swara in the current row
     * @param {Swara}	swara	the swara model obj
     * @param {int}	nCols	the column span in the row for the swara
     * @return the view for the swara
     * @type SwaraView
     * @private
     */
    this.createSwara = function(swara, nCols) {
	if( this.fCurTala == null ) return null;	// dont expect but

	var s =  new SwaraView(this.fSpeedMarkersBelow);
	// render inner content
	s.renderInner(this.fRenderAsHTML, swara, this.fSong.getDefaultSpeed(), nCols );
	return s;
    }

    /**
     * render a spacer for adding new swaras in the current row
     * @param {SongBlock} block the block to which the spacer is associated with
     * @param {int}	nCols	the column span in the row for the spacer
     * @return the view for the swara
     * @type SwaraView
     * @private
     */
    this.createNewSwaraSpacer = function(block, nCols) {
	if( this.fCurTala == null ) return null;	// dont expect but

	var s =  new NewSwaraSpacerView(block);
	// render inner content
	s.renderInner(this.fRendedAsHTML, 1);// nCols??
	return s;
    }

    /**
     * create tala marker in the current row
     * @param  {TalaPart} marker	the tala part (which the marker precedes)
     *					can be null for an empty marker
     * @param {int}	nCols		the column span in the row for the marker
     * @param	isSwaraRow		is the row onto which the marker should be 
     *					rendered a swara row? (on lyric rows
     *					the marker is rendered to occupy space -
     *					like a spacer)
     */
    this.createTalaMarker = function(marker,ncols,isSwaraRow) {
	if( this.fCurTala == null ) return null;	// dont expect but

	var m =  new TalaMarkerView();
	// render inner content
	m.renderInner(this.fRenderAsHTML, marker, this.fSong, ncols, isSwaraRow, this.isSpeedMarkersBelow());
	return m;
    }
    this.createManualTalaMarker = function(label, manualTalaPart, ncols, isSwaraRow) {
	if( this.fCurTala == null ) return null;	// dont expect but
	var m = new TalaMarkerView();
	m.renderInner(this.fRenderAsHTML, m, this.fSong, ncols, isSwaraRow, this.isSpeedMarkersBelow());
    }

    /**
     * render a lyric in the current row
     * @param {Lyric}	lyric	the lyric model obj
     * @param {int}	nCols	the column span in the row for the lyric
     * @param {Swara}   swara   corresponding swara model obj  (if any)
     * @return the view for the lyric
     * @type LyricView
     * @private
     */
    this.createLyric = function(lyric, nCols, swara) {
	if( this.fCurTala == null ) return null;	// dont expect but

	var l =  new LyricView();
	// render inner content
	l.renderInner(this.fRenderAsHTML, lyric, nCols, swara);
	return l;
    }

    /**
     * render a heading in the current location in the view
     * @param {Heading}	heading	the heading model obj
     * @private
     */
    this.renderHeading = function(heading) {
    	var h = new HeadingView();
	if(this.fRenderAsHTML )  {
	    // we generate HTML content and store it in a hold area (and render later)
	    this.fInnerHTML[this.fInnerHTML.length] = h.renderAsHTML(heading, this.fCurColCount, this.fCompactLayout);
	    this.fRowHoldArea[this.fRowHoldArea.length] = h;
	}
	else  {
	    // we generate HTML content and store it in a hold area (and render later)
	    var tr = h.render(heading, this.fCurColCount, this.fCurTable, this.fCompactLayout);
	    if( tr != null ) this._appendRow(h); // append the table row
	}
    }

    /**
     * (internal) given a row that precedes a yet to be laid out row, find out how many swara rows 
     * precede the to-be laid row in the current layout block
     * @private
     * @param {PageViewPart} row	the row that <b>precedes</b> the to be laid out swara row
     * @return the # of swaras rows before the to-be-laid-out swara row in current layout block
     * @type int
     */
    this.getRowIndexInCurrentLayoutBlock = function(row) {
	var idx = 0;
	while( true ) {
	    if( row == null || (row.partType() != PAGEVIEWPART_SWARAROW && row.partType() != PAGEVIEWPART_LYRICROW ))
		break;

	    if( row.partType == PAGEVIEWPART_SWARAROW ) idx++;

	    if( row.prevRow() == null ) {
		var ppage = row.pageView().prevPage();
		if( ppage )
		    row = ppage.lastRow();
		else
		    row = null;
	    }
	    else
		row = row.prevRow();
	}
	return idx;
    }

    /**
     * (internal) given a swara or a lyric row, find the next row that is eithr
     * not a swara/lyric row or is swara/lyric row that starts a tala cycle
     * @param {SwaraLyricRowView} row	row view
     * @return the next row that is either not a swara/lyric row or is 
     * 	       swara/lyric row that starts a tala cycle, or null if there isnt one
     * @type SwaraLyricRowView
     * @private
     */
    this.getRowFollowingTalaCycleEnd = function(row) {
	while(true) {
	    // a swara row that does not start a tala-cycle or a lyric row, consider next
	    if( row.nextRow() == null ) {
		var npage = row.pageView().nextPage();
		if( npage == null ) { row = null; break; }
		// get first row in that page
		row = npage.firstRow();
	    }
	    else
		row = row.nextRow();

	    if( row.partType() != PAGEVIEWPART_SWARAROW && row.partType() != PAGEVIEWPART_LYRICROW )
		break;
	    else if( row.partType() == PAGEVIEWPART_SWARAROW && row.getStartTime().isZero() ) 
	    	break;
	}
	return row;
    }

    /**
     * get the next row to row that is NOT a lyric
     */
    this.getNextNonLyricRow = function(row) {
	while(true) {
	    var nrow = row.nextRow();
	    if( nrow == null ) {
		var npage = row.pageView().nextPage();
		if( npage != null ) {
		    // get first row in that page
		    nrow = npage.firstRow();
		}
	    }
	    row = nrow;
	    if( row == null ) break;
	    if( row.partType() != PAGEVIEWPART_LYRICROW ) {
		break;
	    }
	}
	return row;
    }

    /**
     * (internal) given a swara or lyric row, find the nearest-equal-or-preceding swara-row at the 
     * start of a tala cycle
     * @param {SwaraLyricRowView} row	row view
     * @return the nearest-equal-or-preceding swara-row at the start of a tala cycle or null on error
     * @type SwaraLyricRowView
     * @private
     */
    this.getTalaCycleStartingSwaraRow = function(row) {
	while(row != null) {
	    if( row.partType() == PAGEVIEWPART_SWARAROW && row.getStartTime().isZero() ) 
		break;
	    else if( row.partType() != PAGEVIEWPART_SWARAROW && row.partType() != PAGEVIEWPART_LYRICROW )
		return null;
	    row = row.prevRow();
	    if( row == null ) {
		// get previous page
		var ppage = row.pageView().prevPage();
		if( ppage == null ) break;
		// get last row in that page
		row = ppage.lastRow();
	    }
	}
	return row;
    }

    /*
     * called to add a new swara after a certain swara/lyric row - this is equivalent to
     * having a para (in a word-processed) spanning into a new line (the row to add)
     * due to user appending text to it.
     * <p>
     * It is different from {@link insertNewTalaCycle} which is like adding a new para
     *
     * @param {SwaraRowView} afterThisRow	the swara row
     * @return the added swara row
     * @type SwaraRowView
     */
    this.addNewSwaraRowAfter= function(afterThisRow) {
	if(afterThisRow.partType() != PAGEVIEWPART_SWARAROW) {
	    alert("internal error: addNewSwaraRowAfter: not a swara row");
	    return null;
	}

	var insertPoint = this.getNextNonLyricRow(afterThisRow);
	if( insertPoint && insertPoint.partType() == PAGEVIEWPART_COLUMNGUIDE )
	    insertPoint = this.getNextNonLyricRow(insertPoint);
	if( insertPoint == null ) {
	    var npage = afterThisRow.pageView().nextPage();
	    if( npage != null )
		insertPoint = npage.firstRow();
	}

	/*
	 * get very last row to use when approp
	 */
	var veryLastRow = null;
	if( this.lastPage() ) 
	    veryLastRow = this.lastPage().lastRow();	// last part in last page

	/* 
	 * based on insert-point and reference row, establish rendering state params
	 */
	if( insertPoint != null ) {
	    this.fCurTable = insertPoint.getTable();
	    this.fCurPage  = insertPoint.pageView();
	}
	else {
	    if( veryLastRow ) {
		this.fCurTable = veryLastRow.getTable();
		this.fCurPage  = veryLastRow.pageView();
	    }
	    else {
		// render a new page and a new table
		//if( beforeRow )
		    //this.fCurPage  = beforeRow.pageView();
		//else
		    //this.fCurPage  = null;
		this.fCurPage  = afterThisRow.pageView();
		this.nextPage(true);
		this.renderNewTable();
	    }
	}
	this.fCurTala  = afterThisRow.getTala();	// tala from passed-in row

	var indexInLayoutCycle = afterThisRow.getIndexInLayoutCycle()+1;
	indexInLayoutCycle = indexInLayoutCycle%this.fCurTala.getLayout().getNRows();

	this.fCurColCount  = this.calcColCount(afterThisRow.getTala(), indexInLayoutCycle);
	this.fCurColSwaraCount  = this.calcColSwaraCount(afterThisRow.getTala(), indexInLayoutCycle);
	this.fCurDuration = afterThisRow.getEndTime();

	// now add the swara 
	var swaraRow = new SwaraRowView(this.fCurTala,this.fCurDuration, indexInLayoutCycle);
	if( insertPoint != null ) {
	    // false => progressive rendering
	    swaraRow.render(false,this.fCurTable, this.fCompactLayout, insertPoint.getRowIndex());	
	}
	else {
	    // false => progressive rendering
	    swaraRow.render(false,this.fCurTable, this.fCompactLayout);	
	}

	// render a swara spacer that spans entire row
	var block;
	var fs = afterThisRow.firstSelectable();
	if(fs.partType() == ROWVIEWPART_SWARA )
	    block = fs.getModel().getBlock();
	else
	    block = fs.getSongBlock();

	var spacer = new NewSwaraSpacerView(block);
	spacer.renderInner(false, 1);	// false => progressive rendering
	spacer.render(swaraRow);

	// NOTE: there is no longer a need to add spacer to
	// notation line (as there is a guide line which
	// makes the line fill out the width)
	if( insertPoint != null )
	    this._insertRowBeforeAndRepaginate(swaraRow, insertPoint);
	else
	    this._appendRow(swaraRow);
	return swaraRow;
    }

    this.addLyricRow = function(swaraRow) {
	// make sure it is a swara row
	if( swaraRow.partType() != PAGEVIEWPART_SWARAROW ) {
	    alert("cannot add lyric row: not a swara row");
	    return null;
	}

	// make sure swara row isnt empty
	var f = swaraRow.firstSelectable();
	if( f == null || f.partType() == ROWVIEWPART_NEWSWARASPACER ) {
	    alert( "cannot add lyric row to empty swara row");
	    return null;
	}

	// note down the first swara in it and its model
	var myModel = f.getModel();
	var block = myModel.getBlock();

	/*
	 * we are planning to re-layout the entire block adding lyrics for all
	 * rows in the block (i.e. we add lyrics for all swaras in the block).
	 * This is neeeded because in the model representation swaras and
	 * lyrics have a 1-1 correspondance.
	 *
	 * Before we relayout all rows for block, we first locate its starting 
	 * swara row
	 */
	var startRow = swaraRow;
	while( startRow != null ) {
	    f = startRow.firstSelectable();
	    if( f != null && f.getModel() == block.firstSwara())
		break;
	    startRow = this.getPrevRow(startRow, PAGEVIEWPART_SWARAROW);
	}
	if( startRow == null ) {
	    alert( "internal error: cannot locate starting row of notation block" );
	    return null;
	}

	/*
	 * add lyrics for all swaras in the block that dont have lyrics
	 */
	block.addLyricLine();
	var nLyricRows = swaraRow.lyricRows().length;

	this.replaceSwarasFrom(startRow,
				startRow.getRowIndex(), 0, block, block.firstSwara(),
				startRow.getTala(), startRow.getStartTime());
	// now locate the lyric row of our original swara row (both of which got recreated
	// as they got re-laid out
	if( swaraRow.lyricRows().length != (nLyricRows+1) ) {
	    alert( "internal error: cannot locate lyric row after relayout" );
	    return null;
	}
	return swaraRow.lastLyricRow();
    }

    /**
     * insert a new tala cycle - this is equivalent to adding a new para in a word-processor
     * <p>
     * This creates a new song-block with breaks around (if needed - depending
     * on if it immediately precedes/succeeds another song block)
     *
     * @param insertPoint	insertion point (null=> add at end of song and before is ignored)
     * @param before		true => insert before, false => insert after
     * @return the view for the added row
     * @type SwaraLyricRowView
     */
    this.insertNewTalaCycle = function(insertPoint, before) {
	// find true insertion point
	if( insertPoint != null && 
		(insertPoint.partType() == PAGEVIEWPART_LYRICROW ||
		     insertPoint.partType() == PAGEVIEWPART_SWARAROW) ) {
	    /*
	     * since for long-talas a single cycle may span multiple rows,
	     * we have to be careful to locate the approp insertion point to
	     * avoid inserting it in the middle of that span
	     */
	    if( before ) {
		insertPoint = this.getTalaCycleStartingSwaraRow(insertPoint);
		if( insertPoint == null ) {
		    alert("internal error: cannot locate beginning of tala cycle");
		    return;
		}
	    }
	    else
		insertPoint = this.getRowFollowingTalaCycleEnd(insertPoint);
	}
	else {
	    if( !before )
		insertPoint = this.getNextRow(insertPoint);
	}

	/*
	 * determine if the song block should be preceded by a break? This would
	 * be true if the song-block would end up following another song block
	 * in a page
	 */
	var prev = null;
	if( insertPoint == null ) {
	    if( this.lastPage() ) 
		prev = this.lastPage().lastRow();	// last part in last page
	}
	// BUG: B0035
	//else if( !before ) 
	    //prev = insertPoint;
	else {
	    if( insertPoint != null )
		prev = insertPoint.prevRow();
	    else {
		var last = this.lastPage();
		if( last ) last = last.lastRow();	// last row in last page
		prev = last;
	    }
	}
	// if there is a preceding row in page and it is a swara or lyric row, we need a break
	var needPrecedingBreak = false;
	if( prev != null && (prev.partType() == PAGEVIEWPART_LYRICROW || prev.partType() == PAGEVIEWPART_SWARAROW))
	    needPrecedingBreak = true;

	/*
	 * determine if a break is needed following our swara row. This is true
	 * if we are not appending to end and the row which will follow us is
	 * a swara/lyric row
	 */
	var needSucceedingBreak = false;
	if( insertPoint != null && (insertPoint.partType() == PAGEVIEWPART_LYRICROW || insertPoint.partType() == PAGEVIEWPART_SWARAROW))
	    needSucceedingBreak = true;

	/*
	 * figure out row index in the table where we are going to add our row
	 */
	var rowIndex;	// DONT INITIALIZE
	if( insertPoint )  {
	    rowIndex = insertPoint.getRowIndex();
	    if( rowIndex < 0 ) {
		alert( "internal error: row index" );
		return;
	    }
	    // BUG: B0035
	    //if( !before ) rowIndex++;
	}

	/*
	 * figure out the song-part (corresponding to insert point) before which we 
	 * will be adding song-parts (like breaks, blocks etc.)
	 */
	var songPartAfter = null;
	if( insertPoint != null ) {
	    if( insertPoint.partType() != PAGEVIEWPART_SWARAROW ) {
		if( insertPoint.getModel )
		    songPartAfter = insertPoint.getModel();
	    }
	    else {
		// see if we are inserting above a row whose first swara does NOT start a block
		// (or if it has no swara). If not, we have to split that block
		var s = insertPoint.fFirstPart;
		while(s != null && s.partType() != ROWVIEWPART_SWARA) s = s.next;
		if( s != null ) {
		    var sw = s.getModel();
		    var block = sw.getBlock();
		    if( block.firstSwara() != sw ) {
			songPartAfter = block.splitBlock(sw);
		    }
		}
	    }
	}

	/*
	 * get very last row to use when approp
	 */
	var veryLastRow = null;
	if( this.lastPage() ) 
	    veryLastRow = this.lastPage().lastRow();	// last part in last page

	/*
	 * figure out a reference swara row based on which we will determine tala
	 */
	var referenceRow;
	if( insertPoint != null )
	    referenceRow = insertPoint;
	else
	    referenceRow = veryLastRow;
	while( referenceRow && referenceRow.partType() != PAGEVIEWPART_SWARAROW ) {
	    if( referenceRow.prev == null ) {
		var ppage = referenceRow.pageView().prevPage();
		if( ppage != null )
		    referenceRow = ppage.lastRow();
		else
		    referenceRow = null;
	    }
	    else
		referenceRow = referenceRow.prevRow();
	    if( referenceRow == null ) break;
	    var typ = referenceRow.partType();
	    if( typ == PAGEVIEWPART_SWARAROW )
		break;
	    else if( typ == PAGEVIEWPART_LYRICROW ) {
		referenceRow = referenceRow.getSwaraRow();
		break;
	    }
	}

	/* 
	 * based on insert-point and reference row, establish rendering state params
	 */
	if( insertPoint != null ) {
	    this.fCurTable = insertPoint.getTable();
	    this.fCurPage = insertPoint.pageView();
	}
	else {
	    if( veryLastRow != null ) {
		this.fCurPage = veryLastRow.pageView();
		this.fCurTable = veryLastRow.getTable();
	    }
	    else {
		this.fCurPage = null;
		this.nextPage(true); // sets fCurPage
		this.renderNewTable();	// sets fCurTable`
	    }
	}
	if( referenceRow == null ) {
	    // this can happen on empty song:  get default tala of song
	    this.fCurTala  	   = this.fSong.getDefaultTala();
	}
	else
	    this.fCurTala  	   = referenceRow.getTala();
	if( this.fCurTala == null ) {
	    alert( "internal error: no reference tala");
	    return;
	}

	this.fCurColCount  = this.calcColCount(this.fCurTala,0);
	this.fCurColSwaraCount  = this.calcColSwaraCount(this.fCurTala,0);
	this.fCurDuration.setZero();

	/*
	 * add preceding break if needed
	 */
	if( needPrecedingBreak ) {
	    var b = new SongBreak();
	    if( songPartAfter != null )
		this.fSong.insertPart(b, songPartAfter);
	    else
		this.fSong.addPart(b);
	    /*
	     * render it
	     */
	    var bv = new BreakView();
	    var tr;
	    var movedToNewPage = false;
	    if( insertPoint != null ) {
		bv.render(this.fCurColCount, this.fCurTable, rowIndex);
		moveToNewPage = this._insertRowBeforeAndRepaginate(bv, insertPoint);
	    }
	    else {
		bv.render(this.fCurColCount, this.fCurTable);
		moveToNewPage = this._appendRow(bv);
	    }

	    /*
	     * we should have been careful in previous logic to know that
	     * we will not need a preceding break if it will end up 
	     * going to a new page. So if it happens in spite, cry loudly 
	     * and get out
	     */
	    if( moveToNewPage ) {
		alert("internal eror: preceding break");
		return;
	    }

	    // adjust row index
	    if( insertPoint != null )
		rowIndex++;
	}

	/*
	 * create and add a block for the row at the approp point
	 */
	var newSongBlock = new SongBlock();

	// add block to song
	if( songPartAfter != null )
	    this.fSong.insertPart(newSongBlock, songPartAfter);
	else
	    this.fSong.addPart(newSongBlock);

	var nCurTalaPart = this.fCurTala.getPart(0);

	// now add the swara row that starts the tala cycle
	var swaraRow = new SwaraRowView(this.fCurTala,this.fCurDuration,0);
	if( insertPoint != null ) {
	    swaraRow.render(false,this.fCurTable, this.fCompactLayout, rowIndex);// false: not generate HTML content i.e.	
	    									 // progressive rendering
	    rowIndex++;
	}
	else
	    swaraRow.render(false,this.fCurTable, this.fCompactLayout);	// false: not generate HTML content i.e.	
	    								// progressive rendering

	// render a new-swara spacer for adding new swaras 
	var spacer = new NewSwaraSpacerView(newSongBlock);
	spacer.renderInner(false, 1);	// false: not generate HTML content i.e.	
					// progressive rendering
	spacer.render(swaraRow);

	// NOTE: there is no longer a need to add spacer to
	// notation line (as there is a guide line which
	// makes the line fill out the width)

	if( insertPoint != null ) {
	    moveToNewPage = this._insertRowBeforeAndRepaginate(swaraRow, insertPoint);
	}
	else {
	    moveToNewPage = this._appendRow(swaraRow);
	}


	/*
	 * add succeeding break (if needed)
	 */
	if( needSucceedingBreak ) {
	    var b = new SongBreak();
	    if( songPartAfter != null )
		this.fSong.insertPart(b, songPartAfter);
	    else
		this.fSong.addPart(b);

	    var bv = new BreakView();
	    if( insertPoint != null ) {
		bv.render(this.fCurColCount, this.fCurTable, rowIndex);
		moveToNewPage = this._insertRowBeforeAndRepaginate(bv, insertPoint);
	    }
	    else {
		bv.render(this.fCurColCount, this.fCurTable);
		moveToNewPage = this._appendRow(bv);
	    }
	}

	return swaraRow;
    }


    /**
     * insert a heading (or text row) before a row or at end of song
     *
     * @param insertPoint	insertion point (null=> add at end of song)
     * @param before		true => insert before, false => insert after
     *
     */
    this.insertNewHeading = function(insertBeforeThisRow, before) {
	if( insertBeforeThisRow != null ) {
	    if( before ) {
		var swaraRow = null;
		if( insertBeforeThisRow.partType() == PAGEVIEWPART_SWARAROW )
		    swaraRow = insertBeforeThisRow;
		else if( insertBeforeThisRow.partType() == PAGEVIEWPART_LYRICROW  )
		    swaraRow = insertBeforeThisRow.getSwaraRow();
		if(swaraRow != null ) {
		    if( !swaraRow.fStartDur.isZero() ) {
			// trying to insert before a row that is not beginning of tala cycle
			// we will locate it
			while(true) {
			    swaraRow = this.getPrevRow(swaraRow);
			    if( swaraRow == null ) 
				break;
			    if( swaraRow.partType() == PAGEVIEWPART_SWARAROW ) {
				if( swaraRow.fStartDur.isZero() )
				    break;
			    }
			    else ( swaraRow.partType() != PAGEVIEWPART_LYRICROW )
				break;
			}
			if( swaraRow == null || swaraRow.partType() != PAGEVIEWPART_SWARAROW ) {
			    alert( "internal error: cannnot locate beginning of tala cycle" );
			    return;
			}
		    }
		    insertBeforeThisRow = swaraRow;
		}
	    }
	    else {
		var swaraRow = null;
		if( insertBeforeThisRow.partType() == PAGEVIEWPART_SWARAROW )
		    swaraRow = insertBeforeThisRow;
		else if( insertBeforeThisRow.partType() == PAGEVIEWPART_LYRICROW )
		    swaraRow = insertBeforeThisRow.getSwaraRow();

		if( swaraRow != null ) {
		    // locate the swara row that (if any) ends a cycle
		    while(true) {
			var n = this.getNextRow(swaraRow);
			if( n == null ) 
			    break;	// no more rows
			if( n.partType() == PAGEVIEWPART_SWARAROW ) {
			    if( n.fStartDur.isZero() ) {
				break;
		            } 
			}
			else if( n.partType() != PAGEVIEWPART_LYRICROW )  {
			    break;
			}
			swaraRow = n;
		    }

		    insertBeforeThisRow = swaraRow;
		    if( insertBeforeThisRow.hasLyricRows() )
			insertBeforeThisRow = insertBeforeThis.lastLyricRow();
		}
	    }

	    if( !before ) {
		var after = insertBeforeThisRow.nextRow();	// get next row
		if( !after ) {	// no next row
		    // get next page
		    var npage = insertBeforeThisRow.pageView().nextPage();

		    if( npage == null ) {
			// no next page => we are inserting at the end
			insertBeforeThisRow = null;
		    }
		    else {
		    	// get first row in that page
			insertBeforeThisRow = insertBeforeThisRow.pageView().firstRow();
		    }
		}
		else {
		    insertBeforeThisRow = after;
		}
	    }
	}

	/*
	 * get very last row to use when approp
	 */
	var veryLastRow = null;
	if( this.lastPage() ) 
	    veryLastRow = this.lastPage().lastRow();	// last part in last page

	var rowIndex = 0;
	if( insertBeforeThisRow )  {
	    rowIndex = insertBeforeThisRow.getRowIndex();
	    if( rowIndex < 0 ) {
		alert( "internal error: row index" );
		return;
	    }
	}
	else {
	    // insert at end of song
	    insertBeforeThisRow = veryLastRow;
	    rowIndex= -1;
	}

	/* 
	 * based on insert-point and reference row, establish rendering state params
	 */
	var songPartAfter = null;
	if( insertBeforeThisRow != null ) {

	    if( rowIndex >= 0 ) {
		/*
		 * if we are inserting above a swara-row, make sure it starts 
		 * a tala cycle. Also if it is not at the start of block (model),
		 * split the block
		 */
		var swaraRow = null;
		if( insertBeforeThisRow.partType() == PAGEVIEWPART_SWARAROW ) {
		    swaraRow = insertBeforeThisRow;
		}
		else if( insertBeforeThisRow.partType() == PAGEVIEWPART_LYRICROW ) {
		    swaraRow = insertBeforeThisRow.getSwaraRow();
		}
		if( swaraRow != null ) {
		    if( !swaraRow.fStartDur.isZero() ) {
			alert( "cannot insert heading in the middle of a tala cycle" );
			return;
		    }
		    var s = swaraRow.firstSelectable();
		    if( s ) {
			var block = s.getModel().getBlock();
			if( block.firstSwara() != s.getModel() ) {
			    // we are inserting a heading before a swara that is in the middle
			    // of a block, split the block
			    if( block.splitBlock(s.getModel()) == null ) {
				alert( "internal error: cannot split block" );
				return;
			    }
			}
		    }
		}

		if( insertBeforeThisRow.partType() == PAGEVIEWPART_SWARAROW || 
					insertBeforeThisRow.partType() == PAGEVIEWPART_LYRICROW ) {
		    var s = insertBeforeThisRow.firstSelectable();
		    if( s ) {
			songPartAfter = s.getModel().getBlock();
		    }
		}
		else if( insertBeforeThisRow.getModel ) {
		    songPartAfter = insertBeforeThisRow.getModel();
		}
		if( songPartAfter == null ) {
		    alert( "internal error: cannot locate insert point in model" );
		    return;
		}
	    }

	    this.fCurTable = insertBeforeThisRow.getTable();
	    this.fCurPage = insertBeforeThisRow.pageView();

	    /*
	     * we need to determine # of columns for our row so that heading
	     * spans entire table width. Swara-rows and lyric rows are a bit 
	     * strange in nthat they may not always occupy all the width but
	     * swara-rows do have tala info and we can calculate based on that
	     * Other types of rows should have the info we want in the colspan
	     */
	    var refRow = insertBeforeThisRow;
	    if( refRow.partType() != PAGEVIEWPART_SWARAROW )  {
		if( before )
		    refRow = this.getPrevRow(insertBeforeThisRow, PAGEVIEWPART_SWARAROW);
		else
		    refRow = this.getNextRow(insertBeforeThisRow, PAGEVIEWPART_SWARAROW);
	    }
	    if( refRow != null ) {
		this.fCurColCount  = this.calcColCount(refRow.getTala(),refRow.getIndexInLayoutCycle());
		this.fCurColSwaraCount  = this.calcColSwaraCount(refRow.getTala(),refRow.getIndexInLayoutCycle());
	    }
	    else {
		this.fCurColCount  = insertBeforeThisRow.colspan();	//?????????
		this.fCurColSwaraCount  = this.calcColSwaraCount(this.fCurTala,0);
	    }
	}
	else {
	    this.fCurPage = null;
	    this.nextPage(true); 	// sets fCurPage
	    this.renderNewTable();	// sets fCurTable`
	    this.fCurColCount = this.calcColCount(this.fSong.getDefaultTala(),0);
	    this.fCurColSwaraCount = this.calcColSwaraCount(this.fSong.getDefaultTala(),0);
	    songPartAfter = null;
	}
	var newHeading = new Heading("", "", "", ALIGNMENT.prototype.CENTER);
	if( songPartAfter != null )
	    this.fSong.insertPart(newHeading, songPartAfter);
	else
	    this.fSong.addPart(newHeading);
	var h = new HeadingView();
	var tr = null;
	if( rowIndex >= 0 ) {
	    tr = h.render(newHeading, this.fCurColCount, this.fCurTable, this.fCompactLayout, rowIndex);
	    this._insertRowBeforeAndRepaginate(h, insertBeforeThisRow);
	    return h;
	}
	else {
	    // insert at end of song
	    tr = h.render(newHeading, this.fCurColCount, this.fCurTable, this.fCompactLayout );
	    this._appendRow(h);
	    return h;
	}
    }

    /**
     * delete a row
     * @param {SwaraLyricRowView} rowView       the row view
     */
    this.deleteRow = function( rowView ) {
	var page  = rowView.pageView();
	var nrow  = rowView.nextRow();
	rowView.deleteHTMLContents();
	page.removePart(rowView);
	// is page empty?
	if( page.firstRow() == null && (page.prevPage() != null || page.nextPage() != null) ) {
	    // page empty and not only page
	    this.removePart(page);
	    this.fOuter.removeChild(page.getContent());
	}
	else {
	    if( nrow != null )
		repaginate(nrow);
	}
    }

    /**
     * replace swaras and lyrics from block "block" starting from swara
     * "swara" and lyric "lyric", which go into row - rowView, starting
     * at cell cellidx
     *
     * @param {SwaraRowView} swaraRow   the row view
     * @param {int} rowIndex		the row index of row view within its table
     * @param {int} cellidx		the cell index in the table row for row view
     * @param {SongBlock} block		the block (model) under which the start swara is 
     * @param {Swara} swara		the starting swara
     * @param {Tala} tala		the tala
     * @param {Duration} dur		the duration within tala of the starting swara
     */
    this.replaceSwarasFrom = function(swaraRow, rowIndex, cellidx, block, swara, tala, dur) {
	/*
	 * basically we will first remove rows from the table(s) upto the next 
	 * non-block. Note that multiple tables will arise only if we reach a 
	 * new page. Then we re-render the content. Then we finally look at 
	 * content that follows and "adjust" them to next/prev pages as 
	 * necessary
	 */

	// first remove columns in the passed-in swara-row and associated lyric-rows
	swaraRow.deleteSwarasTillEnd(cellidx);

	// remove all swara-lyric rows that follow us until next non-swara lyric row
	var nextPart;
	var row = swaraRow;
	var page = row.pageView();
	if( swaraRow.hasLyricRows() ) {
	    row = swaraRow.lastLyricRow();
	    page = row.pageView();
	}
	row = row.next;
	if( row ) page = row.pageView();
	var nextPage = null;
	if( page ) nextPage = page.nextPage();
	while( true ) {
	    if( row == null ) {
		if( nextPage == null ) 
		    break;
		page = nextPage;
		row = page.firstRow();
	    }

	    if (row == null || (row.partType() != PAGEVIEWPART_SWARAROW && row.partType() != PAGEVIEWPART_LYRICROW)) {
		break;
	    }

	    var nextPart = row.nextRow();

	    // remove the row view rendering from its table
	    row.deleteHTMLContents();

	    // remove the row view from the page
	    page.removePart(row);

	    // if table is empty, remove the page
	    if( page.firstRow() == null )
		page.getContents().parentNode.removeChild(page.getContents());
	    this.removePart(page);

	    row = nextPart;
	}

	// now re-render
	this.fCurPage = swaraRow.pageView();
	this.fCurTala = tala;
	this.fCurCol  = cellidx;
	this.fCurDuration = dur;
	this.fCurColCount  = this.calcColCount(this.fCurTala,swaraRow.getIndexInLayoutCycle());
	this.fCurColSwaraCount  = this.calcColSwaraCount(this.fCurTala,swaraRow.getIndexInLayoutCycle());
	this.fCurTable     = swaraRow.getTable();
	this.renderBlocksTillNonBlockInternal(block, swara, swaraRow, rowIndex) ;
    }

    /**
     * start rendering from swara 'swara' and lyric 'lyric' in block 'block'. If swaraRow and
     * lyricRow is not null, we are rendering to replace existing content and so renderinng
     * begins at the end of those rows. We render upto the next non song-block part
     *
     * @param {SongBlock} block			 the block under which the start swara is 
     * @param {SongBlockNotation} swara		 the starting swara, can be null when "end of block"
     *						 is being relaid (e.g. when last swara gets deleted)
     * @param {SwaraLyricRowView} swaraRow       the swara row view if rendering into existing swara
     *					   	 row (and associated lyric rows)
     * @param {int}		  rowIndex	 if swaraRow is not null, its row index
     *
     * @return the next non-song block part of the song
     * @private
     */
    this.renderBlocksTillNonBlockInternal = function(block, swara, swaraRow, rowIndex) {
    	var i;
	var aksharasPerCycle = this.fCurTala.aksharaCount();
	var renderLyrics = block.hasLyrics();

	if( rowIndex == null ) rowIndex = -1;

	// reset current duration
	if( this.fCurDuration.isWhole() ) {
	    var w2 = this.fCurDuration.wholePart();
	    if( (w2 % this.aksharasPerCycle) == 0 )  {
	    	this.fCurDuration.setZero();
	    }
	}

	var rowStartDuration = null;

	// are we insering content in the middle (rather than appending at end)
	var insertingContent = false;
	var nPartsInRow = 0; // # of tala parts rendered so far in current row

	// starting column index (including span), and column index within
	// tala part of our swara
	var nCols = 0;
	var nColsInCurTalaPart = 0, nMathraisInCurTalaPart = 0;
	var rowBefore = null;
	if( swaraRow ) {
	    insertingContent = true;

	    if( swaraRow.hasLyricRows() ) { 
		rowBefore        = swaraRow.lastLyricRow();
		if( rowBefore.pageView() != swaraRow.pageView() ) rowBefore = null;
		else rowBefore = rowBefore.nextRow();
	    }
	    else
		rowBefore        = swaraRow.nextRow();

	    // iterate through existing parts
	    var part = swaraRow.fFirstPart;
	    var tp = swaraRow.fTala.getPart(0);
	    while( part != null ) {
		if( part.partType() == ROWVIEWPART_TALAMARKER ) {
		    nColsInCurTalaPart = 0; nMathraisInCurTalaPart = 0;
		    var curDur = swaraRow.getColumnTime(nCols);
		    tp = swaraRow.fTala.getPart(curDur.wholePart());
		    nPartsInRow++; // we have advanced a part in current row
		}
		else {
		    nColsInCurTalaPart += part.colspan();
		    nMathraisInCurTalaPart += getMathrais(this.fCurTala,part.getModel().getLength(), part.getModel().getSpeed(), tp.fGati);
		}
		nCols              += part.colspan();
		if( nCols > this.fCurColSwaraCount ) {
		    alert( "internal error: renderBlocksTillNonBlockInternal: nCols : " );
		    return null;
		}
		part = part.next;
	    }
	    rowStartDuration = new Duration(swaraRow.fStartDur.fNum, swaraRow.fStartDur.fDenom);

	}
	else {
	    rowStartDuration = new Duration(this.fCurDuration.fNum, this.fCurDuration.fDenom);
	}


	/**
	 * initialize
	 * (a) the duration of this row as determined by tala layout
	 * (b) the duration taken up so far
	 */
	var layoutRowIndex = 0;
	var prevRow = null;
	if( swaraRow )
	    prevRow = this.getPrevRow(swaraRow);
	else if( this.lastPage() ) 
	     prevRow = this.lastPage().lastRow();	// last part in last page
	if( prevRow )
	    layoutRowIndex = this.getRowIndexInCurrentLayoutBlock(prevRow);

	layoutRowIndex = layoutRowIndex%this.fCurTala.getLayout().getNRows();

	var rowMaxDuration = this.fCurTala.getLayout().getRowDuration(layoutRowIndex);
	var rowCurDuration = new Duration(this.fCurDuration.fNum, this.fCurDuration.fDenom);

	// CANT DO FOR LAYOUTS THAT SPAN MULTIPLE CYCLES!!!
	//rowCurDuration.subtract(rowStartDuration);	// just to make sure
	//
	
	/*
	 * rendered swaras (and tala markers) in row are held here until it is
	 * time to render the whole row. Each element is an Object with 
	 * following props: obj: the SwaraView, partInRow: n as in the nth part
	 * of the raw to which the object is part of
	 */
	var swaraRowObjs = new Array();

	/*
	 * rendered lyrics corresponding to swara-row are held here until it is
	 * time to render the swara row (and thus lyric rows). Each element is
	 * an Object with following props: obj: the LyricView, partInRow: n as 
	 * in the nth part of the raw to which the object is part of
	 */
	var lyricRowObjs = new Array(block.lyricLineCount());
	var nlr = lyricRowObjs.length;
	for(var lr = 0; lr < nlr; lr++ )
	    lyricRowObjs[lr] = new Array();
	/*
	 * we use talaMarkers to note down which objs in swaraRowObj are
	 * tala markers so that when rendering lyrics row we can allocate
	 * space for corresponding columns;
	 * we use talaMarkerColSpans for the column spans of the marker
	 */
	var talaMarkers = new Array();
	var talaMarkerColSpans = new Array();
	// we render 1 or more blocks over 1 or more rows until we reach a non-block
	var lastSwara = null;
	var nRowsRendered = 0;
	var lastTalaPart = null;
	var nMaxColsInTalaPart = 0;
	var nMaxMathraisInTalaPart = 0;
	var curTala = this.fCurTala;
	var lastMarker = ENDTALAMARKER;
	var nSwarasInRow = 0;

	while( true )
	{
	    /*
	     * note down notation of starting swara in this iteration - we will
	     * use it later when laying down lyrics
	     */
	    var startNotation = null;
	    if( swara != null ) startNotation = swara.getNotation();	

	    // render swaras - until end of row or end of block whichever comes first
	    var nSwaras = 0;	// keep track of # of swaras from current block rendered  inyo current row
	    var startSwaraObjIdx = swaraRowObjs.length;
	    var startTalaMarkerObjIdx = talaMarkers.length;
	    var svCurDuration = new Duration(this.fCurDuration.fNum, this.fCurDuration.fDenom);
	    var svNCols = nCols;
	    var inlineMarkerToApply = null;
	    while(swara != null ) {
		if( nCols >= this.fCurColSwaraCount) {
		    //var c = rowCurDuration.compare(rowMaxDuration);
		    // Hmm.. cannot print this message since layouts can span multiple cycles 
		    // (and so duration of row-start within tala cycle can be > than duration 
		    // of row-end within tala cycle
		    //if( c < 0 ) 
			//alert( "max cols " + this.fCurColSwaraCount + 
			//		" reached (" + nCols + ") but duration not reached: " +  "(" +
			//		+ rowCurDuration.fNum + "/" + rowCurDuration.fDenom + " vs " +
			//		+ rowMaxDuration.fNum + "/" + rowMaxDuration.fDenom + " )" );
		    //alert("break out: " + nCols + " vs " + this.fCurColSwaraCount);
		    break;
		}
		if( swara == lastSwara ) {
		    alert("infinite loop");
		    return null;
		}

		if( swara.getLength() == 0 && this.fSong.isManualModeInlineTalaMarkers() )
		{
		     inlineMarkerToApply = swara.getLabel();
		     if( swara.next == swara ) {
			alert("infinite loop2" );
			return;
		     }
		     swara = swara.next;
		     continue;
		}



		var w1 = this.fCurDuration.wholePart();
		var nCurTalaPart = curTala.getPart(w1);

		if( nCurTalaPart != lastTalaPart ) {
		    // get # of columns alloted to the part => partwidth * 4 as
		    var partdur = curTala.getPartDuration(w1);
		    // triple-speed
		    nMaxColsInTalaPart = partdur +
				         curTala.getLayout().getMaxColsPerAkshara(nCurTalaPart.fGati);	
		    nMaxMathraisInTalaPart = getMathrais(curTala, partdur, 0, nCurTalaPart.fGati );
		}
		lastTalaPart = nCurTalaPart;

		/*
		 * determine if this swara spans a tala part, in which case it must be split
		 */
		var speed = swara.getSpeed();
	    	var span = 1; // getSpan(swara.getLength(),swara.getSpeed(),nCurTalaPart.fGati);
		var slen = swara.getLength();
	    	var ospan = span;
		var gati  = nCurTalaPart.fGati;
		var mathrais = getMathrais(curTala,slen,speed,gati);


		// DEBUGGING
		//     alert( swara.getLabel() + ": " + mathrais + 
		//     " ( " + nMathraisInCurTalaPart + "," + nMaxMathraisInTalaPart + ")" );
		if( false && slen == 0 ) {	// SPECIAL ONE FOR MANUAL TALA MARKER!!!
		    if( this.fSong.isManualModeInlineTalaMarkers() == false ) {
			// create the tala marker view obj
			var o = new Object();
			o.obj  = this.createManualTalaMarker(s.getLabel(),nTalaPart,1,true);	// span of 1
			o.partInRow  = nPartsInRow;
			nPartsInRow++;
			swaraRowObjs[swaraRowObjs.length] = o;
			// note down info to be used when rendering lyric rows
			talaMarkers[talaMarkers.length] = swaraRowObjs.length-1;
			talaMarkerColSpans[talaMarkerColSpans.length] = 1;
			nCols++;
			//nColsInCurTalaPart = 0; nMathraisInCurTalaPart = 0;
			nSwaras++;
		    }
		    if( swara.next == swara ) {
			alert("infinite loop2" );
			return;
		    }
		    nPartsInRow++;
		    swara = swara.next;
		    continue;
		}
		if( (nMathraisInCurTalaPart+mathrais) > nMaxMathraisInTalaPart ) {
		    // we have a swara which spans across the tala part, we must split it
		    var nswaras = 1;	// # of swaras that result from split
		    // DEBUGGING
		    // alert( swara.getLabel() + ": " + mathrais + ", " 
			// + (nMathraisInCurTalaPart+mathrais) + " vs " + nMaxMathraisInTalaPart );

		    var omathrais = mathrais;

		    // first if the swara being split is of double-length, split it into
		    // 2 swaras of single-length.
		    var olen = slen;
		    var len = olen;
		    if( len == 2 ) {
			len = 1;	// of single-length
			mathrais /= 2;
		    }

		    while( speed < 3 && (nMathraisInCurTalaPart+mathrais) > nMaxMathraisInTalaPart ) {
			speed++;
			mathrais = getMathrais(curTala,1, speed, gati);
		    }
		    if( speed != swara.getSpeed() || len != olen ) {
			/*
			 * we have swaras each of "mathrais". and they totally add up
			 * to "omathrais" (the original # of mathrais in swara that is
			 * split), so from this we know how many swaras the original
			 * swara has split into
			 */
			var nswaras = parseInt(omathrais/mathrais);
			swara.setLength(len);

			// if we halved the length, look at the swara label and adjust it
			if( olen == 2 && len == 1 ) {
			    var lbl = swara.getLabel().toLowerCase();
			    if( lbl.length == "2" ) {
				if( lbl == "sa" || lbl == "ri" || lbl == "ga" || lbl == "ma" ||
				    lbl == "pa" || lbl == "da" || lbl == "ni" ) {
				    swara.setLabel( swara.getLabel().substring(0,1) );
				}
			    }
			    else if( lbl == ';' )
				swara.setLabel( ',' );
			}

			swara.setSpeed(speed);
			// add extra swaras
			var nfrag = nswaras-1;
			for( var frag = 0; frag < nfrag; frag++ ) {
			    var s = new Swara( ",", false, 0, len, speed);

			    // insert a swara (will also add "empty lyrics")
			    block.insertAfter(s, swara);

			    // set the lyric for all lyric lines to be "-"
			    if( renderLyrics ) {
				var ll = s.getNotation().lyrics();
				var lll = ll.length;
				for(var lli = 0; lli < lll; lli++ ) ll[lli].setText(".");
			    }
			}
		    }
		}

		if( this.fSong.isManualModeInlineTalaMarkers()  )
		//if( this.fSong.isManualModeInlineTalaMarkers() 
					//&& (inlineMarkerToApply || this.fCurTala.hasBaseTala )) 
		{
		    var marker = "&nbsp;";
		    // create automatic inline markers or apply "inlineMarkerToApply")
		    if( inlineMarkerToApply || (nColsInCurTalaPart == 0 && lastMarker != "") )
		    {
		    	marker = ((inlineMarkerToApply) ? inlineMarkerToApply : lastMarker);
	            }
		    else if( this.fCurDuration.fDenom == 1 )
		    	marker = '*'; // '\u2010';

		    var gamakaPrefs = this.fSong.getGamakaPrefs();
		    if( this.fInlineTalaMarkerCache[marker] )
		    	gamaka = this.fInlineTalaMarkerCache[marker];
		    else
		    {
			gamaka = new TextGamaka( "manualtalamarker", "", gamakaPrefs.font, gamakaPrefs.fontSize, gamakaPrefs.color, marker);
			if( gamaka.getState() != GamakaStates.INSTALLED_YES) 
			    GamakaManager.determineGamakaState(gamaka,document.body);
		    	this.fInlineTalaMarkerCache[marker] = gamaka;
		    }
		    var curGamaka = swara.getGamaka();
		    if( curGamaka == null /*|| curGamaka.getShortName() == "dummy"*/)
		    {
			swara.setGamaka(gamaka);
		    }
		    else {
			var compGamaka 
				= new VerticalCompositeGamaka("manualtalamarker","",gamaka,curGamaka);
			if( curGamaka.getState() != GamakaStates.INSTALLED_YES) 
			    GamakaManager.determineGamakaState(curGamaka,document.body);
			swara.setGamaka(compGamaka);
		    }
		}
		inlineMarkerToApply = null;

		var o = new Object();
		o.obj = this.createSwara(swara,span); 
		o.partInRow = nPartsInRow;
		swaraRowObjs[swaraRowObjs.length] = o;
		lastSwara = swara;
		//nCols ++; nColsInCurTalaPart++;
		nCols += span; nColsInCurTalaPart += span;
		nMathraisInCurTalaPart += getMathrais(curTala,swara.getLength(),speed,gati);
		nSwarasInRow++;


		var d  = swara.duration(nCurTalaPart.fGati);
		this.fCurDuration.add(d);

		rowCurDuration.add(d);

		//alert( swara.getText() + ": " + d.fNum + "/" + d.fDenom + 
				//"(" + rowCurDuration.fNum + "/" + rowCurDuration.fDenom + ")" + " nCols = " + nCols );
		var w2 = this.fCurDuration.wholePart();
		if( w2 > w1 ) {

		    var w2p = w2 - 1;
		    if( w2 >= aksharasPerCycle ) {
			this.fCurDuration.setZero();
			w2 = 0;
		    }
		    // put out tala marker after this swara if necessary. note we are ignoring 
		    // fractional part because we should have already dealt with a swara 
		    // that straddles a part boundary and split it (see above)
		    var nTalaPart = curTala.getPart(w2);
		    if( nTalaPart && nTalaPart.fIndex == w2 ) {
			if( !this.fSong.isManualModeInlineTalaMarkers() ) {
			    if(this.fSong.isManualMode()) {
				/*
				 * create a fake swara to represent the tala marker
				 * (we cannot create a real one since we are in manual mode
				 * and real one has a lot of implications w.r.t how swaras
				 * fit to tala which dont apply since we are in manual mode
				 */
				var o = new Object();
				var s = new Swara(nTalaPart.fMarker,true,0,0,0);	/* len == 0 */
				s.parent = swara.parent;	// KLUGE!!!!!!! - we need block
				o.obj  = this.createSwara(s,1);
				o.manualModeAutoTalaMarker = true;
				o.partInRow  = nPartsInRow;
				swaraRowObjs[swaraRowObjs.length] = o;
				nCols++;
				//nColsInCurTalaPart = 0; nMathraisInCurTalaPart = 0;
				nSwaras++;
			    }
			    else {
				// get the width (# of aksharas) of the part preceding the marker
				var partWidth = curTala.getPartDuration(w2p);
				// get # of columns alloted to the part => partwidth * 4 as
				// we accomodate for up-to double-speed
				var partNCols = (partWidth * curTala.getLayout().getMaxColsPerAkshara(gati)) +1;	// triple-speed
				// now make the marker span = unused cols for the part
				var markerSpan = partNCols-nColsInCurTalaPart;
				if( markerSpan <= 0 ) { markerSpan = 1; }
				// create the tala marker view obj
				var o = new Object();
				o.obj  = this.createTalaMarker(nTalaPart,markerSpan,true);
				o.partInRow  = nPartsInRow;

				swaraRowObjs[swaraRowObjs.length] = o;
				// note down info to be used when rendering lyric rows
				talaMarkers[talaMarkers.length] = swaraRowObjs.length-1;
				talaMarkerColSpans[talaMarkerColSpans.length] = markerSpan;
				nPartsInRow++;
				//nCols++;
				nCols += markerSpan;
			    }
			}
			else
			{
			    lastMarker = nTalaPart.fMarker;
			    //nPartsInRow++;
			}
		        nColsInCurTalaPart = 0; nMathraisInCurTalaPart = 0;
		    }
		}

		nSwaras++;
		if( swara.next == swara ) {
		    alert("infinite loop2" );
		    return;
		}
		swara = swara.next;
	    }

	    // if we put out enough swaras for current row, we have to render it
	    var renderRow = false;
	    var renderRowButContinueTime = false;
	    if( nCols >= this.fCurColSwaraCount || 
			(swara == null && ((!block.next || (block.next.fPartType != PART_SONGBLOCK && block.next.fPartType != PART_GATISWITCH))))) {
		if( block.next && block.next.fPartType == PART_LINEBREAK )
		{
		    renderRowButContinueTime = true;
		}
		else
		    nSwarasInRow = 0;
	    	renderRow = true;
	    }
	    if( renderRow && nCols < this.fCurColSwaraCount ) {
	    	// add spacer or new-swara (for adding new swaras)
	    	renderRow = true;
		/*
		 * put out spacer as long as we are rendering swaras or if we are
		 * rendering into an existing row and that row has swaras (so it
		 * is possible for us to not come up with new swaras but we still
		 * put out spacer - as in relaying out end of block because last
		 * swara in block got deleted)
		 */
		if( swaraRowObjs.length > 0 || (swaraRow != null && swaraRow.fFirstPart != null) )  {
		    var o = new Object();
		    // NOTE: no need for spacer to explicitly span rest of part
		    // so column-span can remain 1
		    o.obj  = this.createNewSwaraSpacer(block,1);
		    o.partInRow  = nPartsInRow;
		    swaraRowObjs[swaraRowObjs.length] = o;
		}
		    
		// if we have a truncated row, then basically the next row will start new cycle
		// this.fCurDuration.setZero();
	    }
	    if( renderRow )
		nPartsInRow = 0;
	
	    // render lyrics (as many as # of swaras) for all lyric rows
	    var nlr = lyricRowObjs.length;
	    for(lyrRow = 0; lyrRow < nlr ; lyrRow++ ) {
		var notation    = startNotation;
		var swaraObjIdx = startSwaraObjIdx;
		var tmIndex     = startTalaMarkerObjIdx;	// index in tala marker
		var nCols       = svNCols;
		var lobjs       = lyricRowObjs[lyrRow];


		for(i = 0; i < nSwaras && notation != null ; i++ ) {

		    var lyrics = notation.lyrics();
		    var lyric  = null;
		    var swaraRowObj  = swaraRowObjs[swaraObjIdx];

		    if( !swaraRowObj.manualModeAutoTalaMarker && (lyrics && lyrics.length > lyrRow ))
			lyric = lyrics[lyrRow];
		    else {
			// no lyric but lyrics required add empty
			lyric = new Lyric("", new LyricLineDesc(new LyricTranslator()) );
			lyric.parent = notation;	// KLUGE!!!
		    }

		    var span = swaraRowObjs[swaraObjIdx].obj.colspan(); 
		    var o = new Object();
		    var sw = null;
		    if( swaraRowObjs[swaraObjIdx].obj.partType() == ROWVIEWPART_SWARA ) {
			sw = swaraRowObjs[swaraObjIdx].obj.getModel();
                    }

		    o.obj  = this.createLyric(lyric, span, sw);
		    o.partInRow   = swaraRowObjs[swaraObjIdx].partInRow;
		    if( swaraRowObjs[swaraObjIdx].obj.partType() == ROWVIEWPART_SWARA )  {
			o.obj.setSwaraView(swaraRowObjs[swaraObjIdx].obj.getModel());
                    }

		    lobjs[lobjs.length] = o;

		    swaraObjIdx++;
		    //nCols++;
		    nCols += span; // nColsInCurTalaPart += span;

		    // if the current column had a tala marker in swara row, put out
		    // an empty marker in the lyric row
		    if( swaraObjIdx == talaMarkers[tmIndex] )
		    {
			var span = talaMarkerColSpans[tmIndex];
			var o = new Object();
			o.obj  = this.createTalaMarker(null, span, false )	// empty marker
			o.partInRow   = swaraRowObjs[swaraObjIdx].partInRow;
			lobjs[lobjs.length] = o;
			//nCols++;
			swaraObjIdx++;
			nCols += span;
			tmIndex++;
		    }

		    if( !swaraRowObj.manualModeAutoTalaMarker && notation ) notation = notation.next;	// lyric can be null
		}

		// if the current column had a tala marker in swara row, put out
		// an empty marker in the lyric row
		if( swaraObjIdx == talaMarkers[tmIndex] ) {
		    var span = talaMarkerColSpans[tmIndex];
		    var o = new Object();
		    o.obj  = this.createTalaMarker(null, span, false )	// empty marker
		    o.partInRow   = swaraRowObjs[swaraObjIdx].partInRow;
		    lobjs[lobjs.length] = o;
		    nCols += span;
		    // nCols++;
		}

		if( renderRow && nCols < this.fCurColSwaraCount ) {
		    /*
		     * put out spacer as long as we are rendering swaras or if we are
		     * rendering into an existing row and that row has swaras (so it
		     * is possible for us to not come up with new swaras but we still
		     * put out spacer - as in relaying out end of block because last
		     * swara in block got deleted)
		     */
		    if( lobjs.length > 0 || (swaraRow != null && swaraRow.fFirstPart != null) )  {
			var o = new Object();
			// NOTE: no need for spacer to explicitly span rest of part
			// so column-span can remain 1
			o.obj  = this.createSpacer(1);
			o.partInRow  = swaraRowObjs[swaraObjIdx].partInRow;
			lobjs[lobjs.length] = o;
		    }
		}
	    }

	    if( renderRow ) {
		if( !renderRowButContinueTime )
		{
		    nMathraisInCurTalaPart = 0;
		    nCols = 0;
		}
		/*
		 * NOTE: we used to render break but we dont - that seemed unnecessary
		 * and perhaps undesirable (within a song block), besides it also
		 * was throwing of "re-layout" (although perhaps we should have been
		 * able to get around that, removing break for that reason alone would
		 * have been bogus
		 */
		nRowsRendered ++;

		// rowCurDuration.setZero();
	    }
	    if( renderRow && swaraRowObjs.length > 0 ) {
		var newRow = false;
		var heading = null;


		if( !swaraRow ) {
		    // get block heading (e.g. sangati label)
		    var firstSwara = swaraRowObjs[0].obj.getModel();
		    if( firstSwara.getBlock().firstSwara() == firstSwara )
			heading = swaraRowObjs[0].obj.getModel().getBlock().getHeading();
		    // use block heading only if row starts a tala cycle
		    if( heading && !rowStartDuration.isZero()) {
			heading = null;
		    }
		    swaraRow = new SwaraRowView(curTala,rowStartDuration,layoutRowIndex);

		    /* 
		     * when generating HTML content rather than progressive
		     * rendering, now is the time to adjust the swara row for 
		     * gamaka heights - this must be done BEFORE generating
		     * actual content since the actual HTML content takes the
		     * row gamaka height into consideration
		     *
		     * NOTE: we used to do this below, but we need gamaka height
		     * to pad down the sangathi label
		     *
		     * NOTE: this isnt going to work in progressiver - but we
		     * arent supporting that anymore anyway
		     */
		    if( this.fRenderAsHTML )
			swaraRow.preAdjustGamakas(swaraRowObjs);

		    if( rowIndex >= 0 )
			swaraRow.render(this.fRenderAsHTML, this.fCurTable, this.fCompactLayout, rowIndex, heading, this.fSong);
		    else
			swaraRow.render(this.fRenderAsHTML, this.fCurTable, this.fCompactLayout, null, heading, this.fSong);
		    newRow = true;
		}
		if( rowIndex >= 0 ) rowIndex++;


		var i;
		var srl = swaraRowObjs.length;
		var so;
	        var rowFollowsPageBreak = false;

		/*
		 * if progressive rendering, render content of swaras
		 * else, generate HTML content of the swaras themselves
		 */
		if( this.fRenderAsHTML ) {

		    // commented - called earlier above
		    //swaraRow.preAdjustGamakas(swaraRowObjs);

		    // progressive rendering
		    for( i = 0; i < srl; i++ ) {
			// render outer content
			so = swaraRowObjs[i];
			if( i == 0 && so.obj.getModel() && so.obj.getModel().followsPageBreak() )
			{
			    rowFollowsPageBreak = true;
		        }
			so.obj.renderAsHTML(swaraRow,so.partInRow);
		    }
		}
		else {
		    // progressive rendering
		    for( i = 0; i < srl; i++ ) {
			// render outer content
			so = swaraRowObjs[i];
			so.obj.render(swaraRow,so.partInRow);
		    }
		}
		// adjust gamakas if we have rendered the row itself (i.e. progressive rendering)
		if( !this.fRenderAsHTML )
		    swaraRow.adjustGamakas();
		var newPage = false;
		if( newRow ) {
		    if( insertingContent ) {
			newPage = this._insertRowBeforeAndRepaginate(swaraRow, rowBefore);
			if( newPage ) {
			    this.fCurTable = swaraRow.getTable();
			    this.fCurPage = swaraRow.pageView(); 
			    rowIndex = swaraRow.getRowIndex()+1;
			}

			/*
			 * it is possible for what follows for rowBefore to get shifted
			 * into a new page due to repagination and then get removed.
			 * in that case swaraRow will not have anybody following it
			 * in which case 
			 */
			//if( swaraRow.nextRow() == null && swaraRow.pageView().nextRow() ) {
			    //this.fCurPage = swaraRow.pageView().nextRow();
			    //if( this.fCurPage ) rowBefore     = this.fCurPage.firstRow();
			//}
			rowBefore = swaraRow.nextRow();
		    }
		    else {
			/**
			 * if we are not generating HTML content first i.e. we are doing
			 * progressive rendering , append the row now and repaginate
			 */
			if(!this.fRenderAsHTML ) {	// we dont append if rendering as HTML (we do that later)
			    newPage = this._appendRow(swaraRow);
			    rowIndex = this.fCurTable.rows.length;
			}
		    }
		}


		// put out the lyric rows
		var lyricRowCount = swaraRow.lyricRowCount();
		var lyricRows     = swaraRow.lyricRows();
		var nlr = lyricRowObjs.length;
		for( var lyrRowIdx = 0; lyrRowIdx < nlr; lyrRowIdx++ ) {
		    newRow =  (lyrRowIdx >= lyricRowCount);
		    if( newRow ) {
			lyricRow = new LyricRowView();
			swaraRow.addLyricRow(lyricRow);	// MUST do this before calling render
			/* 
			 * render row (if progressive rendering) or generate 
			 * content
			 */
			lyricRow.render(this.fRenderAsHTML, this.fCurTable, 
						this.fCompactLayout, swaraRow.getRowIndex());
		    }
		    else
			lyricRow = lyricRows[lyrRowIdx];

		    // NOTE: WE DONT increment rowIndex since OUTER row index
		    // doesnt change here (lyric rows and swara are in same outer row)

		    var lobjs = lyricRowObjs[lyrRowIdx];
		    var ll = lobjs.length;
		    var lo;
		    if(this.fRenderAsHTML) {
		    	// generate html content of the individual lyrics
			for( i = 0; i < ll; i++ ) { 
			    // render outer content
			    lo = lobjs[i];
			    lo.obj.renderAsHTML(lyricRow,lo.partInRow);
			}
		    }
		    else {
			// (progressive rendering) render content of individual lyrics`
			for( i = 0; i < ll; i++ ) { 
			    // render outer content
			    lo = lobjs[i];
			    lo.obj.render(lyricRow,lo.partInRow);
			}
		    }
		    newPage = false;
		    if( newRow ) {
			if( insertingContent ) {
			    newPage = this._insertRowBeforeAndRepaginate(lyricRow, rowBefore);
			    if( newPage ) {
				this.fCurTable = lyricRow.getTable();
				this.fCurPage = lyricRow.pageView();
				rowIndex = lyricRow.getRowIndex()+1;
			    }

			    /*
			     * it is possible for what follows for rowBefore to get shifted
			     * into a new page due to repagination and then get removed.
			     * in that case swaraRow will not have anybody following it
			     * in which case 
			     */
			    //if( lyricRow.nextRow() == null && lyricRow.pageView().nextRow() ) {
				//this.fCurPage = lyricRow.pageView().nextRow();
				//if( this.fCurPage ) rowBefore     = this.fCurPage.firstRow();
			    //}
			    rowBefore = lyricRow.nextRow();
			}
			else {
			    /**
			     * if we are not generating HTML content first i.e. we are doing
			     * progressive rendering , append the row now and repaginate
			     */
			    if(!this.fRenderAsHTML ) {	// we dont append if rendering as HTML (we do that later)
				newPage = this._appendRow(lyricRow);
				// WE DONT increment rowIndex since OUTER row index
				// doesnt change here (lyric rows and swara are in same outer row)
				if( newPage ) {
				    rowIndex = this.fCurTable.rows.length;
				}
			    }
			}
		    }
		}
		/**
		 * if we are generating HTML content first and THEN render later (as opposed to
		 * progressive renderinng), it is time to generate HTML content for each 
		 * row (renderDOMCells) and store them in fRowHoldArea.
		 */
		if( this.fRenderAsHTML ) {
		    var html = swaraRow.renderDOMCells(rowFollowsPageBreak);
		    if( html ) this.fInnerHTML[this.fInnerHTML.length] = html;
		    this.fRowHoldArea[this.fRowHoldArea.length] = swaraRow;

		    var lyricRows     = swaraRow.lyricRows();
		    var nlr = lyricRows.length;
		    for(var l = 0; l < nlr; l++) {
			var html = lyricRows[l].renderDOMCells();
			if( html ) this.fInnerHTML[this.fInnerHTML.length] = html;
			this.fRowHoldArea[this.fRowHoldArea.length] = lyricRow;
		    }
		}

		swaraRowObjs = new Array();
		// rendered lyrics corresponding to swara-row are held here until it is time to 
		// render the swara row (and thus lyric rows)
		var lyricRowObjs = new Array(block.lyricLineCount());
		var nlr = lyricRowObjs.length;
		for(var lr = 0; lr < nlr; lr++ )
		    lyricRowObjs[lr] = new Array();
		talaMarkers  = new Array();
		talaMarkerColSpans = new Array();
		swaraRow = null;
		lyricRow = null;
		rowStartDuration = new Duration(this.fCurDuration.fNum, this.fCurDuration.fDenom);
		rowTala          = curTala;
	    }
	    if( renderRow ) {
		    layoutRowIndex++;
		    layoutRowIndex = layoutRowIndex%curTala.getLayout().getNRows();
		    rowMaxDuration = curTala.getLayout().getRowDuration(layoutRowIndex);
		    this.fCurColCount  = this.calcColCount(curTala,layoutRowIndex);
		    this.fCurColSwaraCount  = this.calcColSwaraCount(curTala,layoutRowIndex);
	    }


	    // if we consumed last block, see if there are more blocks
	    if( swara == null ) {
		while(true)  {
		    if( block.next && block.next.fPartType == PART_LINEBREAK  ) {
			block = block.next; 
			continue;
		    }
		    if( block.next && block.next.fPartType == PART_SONGBLOCK ) {
			if( block == block.next ) {
			    alert( "infinite loop: block" );
			    return null;
			}
			block = block.next; 
			swara = block.firstSwara();

			/**
			 * if this block does NOT start a row, then remove any heading it had
			 * (sucks - but better than it being around and not used)
			 */
			if(!renderRow) {
			    block.setHeading(null);
			}

			break;
		    }
		    else if( block.next && block.next.fPartType == PART_GATISWITCH ) {
			// gati switches are allowed
			if( !this.fCurDuration.isWhole() ) {
			    alert("ignoring gati switch as it is not at the start of an akshara");
			    block = block.next;
			    continue;
			}
			var ngati = block.next.getGati();
			if( !curTala.switchGati(ngati) ) {
			    block = block.next;
			    continue;
			}
			var nCurColCount 	= this.calcColCount(curTala,layoutRowIndex);
			var nCurColSwaraCount 	 = this.calcColSwaraCount(curTala,layoutRowIndex);
			// override for current row ONLY if gati requires more swaras.
			//if( nCurColSwaraCount > this.fCurColSwaraCount ) {
			    //this.fCurColCount  	     = this.calcColCount(curTala,layoutRowIndex);
			    //this.fCurColSwaraCount  = this.calcColSwaraCount(curTala,layoutRowIndex);
			//}
			//else 
			{
			    /*
			     * figure out how many more swaras in this row per new gati
			     *
			     * TODO: need to adjust maximum mathrais in current tala part - figure
			     */

			    /* get row duration left */
			    var cdur = this.fCurDuration.wholePart();
			    var durleft = rowMaxDuration.wholePart() - cdur;
			    var curTalaPart = curTala.getPart(cdur);
			    var rdur =  cdur - curTalaPart.fIndex;
			    var partDur = curTala.getPartDuration(cdur);
			    var aksharasLeft = partDur - rdur;

			    // alert("cdur: " + cdur + ", maxdur: " + rowMaxDuration.wholePart() + ", rdur: " + rdur + ", partdur: " + partDur + ", aksharasLeft: " + aksharasLeft);

			    /* adjust max mathrais left */
			    // alert(nMathraisInCurTalaPart + " vs " + (nMathraisInCurTalaPart + getMathrais(curTala, aksharasLeft, 0, ngati)) );
			    nMaxMathraisInTalaPart = nMathraisInCurTalaPart + getMathrais(curTala, aksharasLeft, 0, ngati);

			    /* calculate # of swaras for that duration */
			    var nMoreCols = durleft * curTala.getLayout().getMaxColsPerAkshara(ngati);

			    /* now add col for each tala anga marker that follows current */
			    var partInfo  = curTala.getLayout().getRowPartSpans(layoutRowIndex);
			    var d = 0;
			    for(p = 0; p < partInfo.length; p++ ) {
				if( d >= cdur )
				    nMoreCols++;
				d += partInfo[p].nAksharas;
			    }

			    /*
			     * simply make the current row's swara count that much more. 
			     * Note, for next row we will calculate afresh - much simpler
			     */
			    this.fCurColSwaraCount = nCols + nMoreCols;
			}
			block = block.next;
		    }
		    else
			return block.next;
		}
	    }
	    else if ( nSwaras == 0 ) {
		alert("infinite loop: nSwaras == 0" );
		return null;
	    }
	}
    }

    /**
     * render starting from given block and up to the next song part that is NOT
     * a block
     * @param {SongBlock} block		the block from which to start rendering
     *
     * @return the next non-song block part of the song
     */
    this.renderBlocksTillNonBlock = function(block) {
	this.fCurCol  = 0;
	this.fCurDuration.setZero();

	//this.renderBreak();

	return this.renderBlocksTillNonBlockInternal(block, block.firstSwara());
     }

    /**
     * is the rendered row view beyond the page bottom of its page?
     * @param {TableRowPageViewPart} row 	a page view part that is rendered as a table row
     * @param {PageView}	     page	page view
     * @return true or false indicating if the rendered row view beyond the page bottom of its page.
     * @type boolean
     * @private
     */
    this._isPastPageBottom = function( row, page ) {
	var bottom = row.getBottom();
	var pageBottom = page.getPageBottom();
	if( bottom >= pageBottom )
	    return true;
	return false;
    }

    /**
     * append row to page - return true if row got moved to a new page
     * @param {TableRowPageViewPart} row 	a page view part that is rendered as a table row
     * @return true or false indicating if the row got moved to a new page.
     * @type boolean
     * @private
     */
    this._appendRow = function(row) {
	var newPage = false;
	if(this._isPastPageBottom(row, this.fCurPage)) {
	    var tr = row.getContents();
	    if( row.pageView() )
		row.pageView().removePart(row);

	    if( !row.skipOnPageBreak || !row.skipOnPageBreak() ) {
		this.nextPage(true);
		this.renderNewTable();	// updates this.fCurTable
		row.moveHTMLContents(this.fCurTable, this.fCurTable.rows.length);
	    }
	    newPage = true;
	}
	this.fCurPage.addPart(row);

	// SCROLLING (NOT PERFECT) use only for debugging
	//this.fBody.parentNode.scrollTop = 
		//row.fOuter.offsetTop + this.fCurTable.offsetTop + this.fCurPage.fOuter.offsetTop + this.fBody.offsetTop;
	return newPage;
    }


    /**
     * insert a row into the current page and repaginate contents that follow it
     * @param {TableRowPageViewPart} row 	a page view part that is rendered as a table row
     *						which is to be inserted
     * @param {TableRowPageViewPart} rowBefore	the row before which the insertion is to happen
     *						which is to be inserted
     * @return true or false indicating if the row got moved to a new page
     * @private
     */
    this._insertRowBeforeAndRepaginate = function(row, rowBefore) {
	this.fCurPage.insertPart(row, rowBefore);

	/**
	 * if we are generating HTML content first, we dont check pagination - see
	 * _renderContents()
	 */
	if( this.fRenderAsHTML ) return false;

	var ret = this.repaginate(row);
	return ret;
    }

    /**
     * repaginate starting from "row"
     *
     * @return true if row got moved to onew page
     * @private
     */
    this.repaginate = function(row) {
	var newPage = false;
	if( row.pageView() == null ) return false;
	var irow = row;
	var table = row.getTable();
	var page = row.pageView();
	var lastRowBottom = 0;
	var lastPage = null;
	var lastPageBottom =  0;
	while( page != null ) {
	    var shiftedToNewPage = false;
	    while( row != null ) {
		if( this._isPastPageBottom(row, page)) {
		    if( row == irow ) newPage = true;
		    page.removePart(row);
		    var tr = row.getContents();
		    if( row.skipOnPageBreak() ) {
			row.deleteHTMLContents();
		    }
		    else {
			shiftedToNewPage = true;
			// go to next page
			var nextPage = page.nextPage();
			var rowIndex = 0;
			if( nextPage == null ) {
			    this.nextPage(true);
			    this.renderNewTable();
			    nextPage = this.fCurPage;
			    table  = this.fCurTable;
			}
			else if( nextPage.firstRow() == null ) {
			    this.fCurPage = nextPage;
			    this.renderNewTable();
			    table  = this.fCurTable;
			}
			else {
			    table = nextPage.firstRow().getTable();
			    rowIndex = nextPage.firstRow().getRowIndex();
			}
			row.moveHTMLContents(table, rowIndex);

			lastPage       = page;
			lastPageBottom = page.getPageBottom();
			lastRowBottom   = 0;
			nextPage.addPart(row);
			page = nextPage;
		    }
		}
		else
		    lastRowBottom = row.getBottom();
		row = row.nextRow();
	    }
	    if( !shiftedToNewPage ) {
		// we need to see if there is space in the last-page
		if( page.firstRow() != null && lastPage != null )  {
		    var ht = page.firstRow().getHeight();
		    if( (lastRowBottom+ht) < lastPageBottom ) {
			; // alert( "space available" );
		    }
		}
		break;
	    }
	    lastPage = page;
	    lastPageBottom = page.getPageBottom();
	    lastRowBottom = 0;
	    page = page.nextPage();
	    row = null;
	    table = null;
	    if( page != null ) {
		row = page.firstRow();
		if( row ) table = row.getTable();
	    }
	}
	return newPage;
    }

    /**
     * add a song view part to this song view
     * @param {PageView} part  song view part (only page views are song view parts)
    * @return true or false indicating if the add was successful
     * @private
     */
    this.addPart = function( part ) {
	part.next = null;
	part.prev = this.fLastPart;
	part.parent = this;
    	if( this.fLastPart )
	    this.fLastPart.next = part;
	this.fLastPart     = part;
	if( !this.fFirstPart )
	    this.fFirstPart = part;
	return true;
    }

    /**
     * remove a song view part from this song view
     * @param {PageView} part  song view part (only page views are song view parts)
     * @return true or false indicating if the removal was successful
     * @private
     */
    this.removePart = function(part) {
    	if( part.prev )
	    part.prev.next = part.next;
	if( part.next )
	    part.next.prev  = part.prev;
	if( part == this.fLastPart ) this.fLastPart = part.prev;
	if( part == this.fFirstPart ) this.fFirstPart = part.next;
	part.parent = null;
	return true;	
    }

    /**
     * get the first page
     * @return {PageView} the first page if any, else returns null
     */
    this.firstPage = function() { return this.fFirstPart; }

    /**
     * get the last page
     * @return {PageView} the last page if any, else returns null
     */
    this.lastPage = function() { return this.fLastPart; }

    /**
     * should speed markers be drawn beneath a swara or above a swara?
     */
    this.isSpeedMarkersBelow = function() { return this.fSpeedMarkersBelow; }

    if( !speedMarkersBelow )  {
    	speedMarkersBelow = false;
	if( song )
	    speedMarkersBelow = song.getSpeedMarksPreference();
    }
    else
    	speedMarkersBelow = true;
    /**
     * should speed markers be drawn beneath a swara or above a swara?
     * @boolean
     * @type
     */
    this.fSpeedMarkersBelow = speedMarkersBelow;


    /**
     * width of pages in the song in inches
     * @type float
     */
    this.fPageWidth = 7.5;
    if( song != null && !song.isPortrait() ) {
	this.fPageWidth = 10.5;
    }

    /**
     * height of pages in the song in inches
     * @type float
     */
    this.fPageHeight = 10.5;	// keep it a bit smaller
    if( song != null && !song.isPortrait() ) {
	this.fPageHeight= 7.5;
    }

    /**
     * is this a printable view
     * @type boolean
     */
    this.fPrintable  = printable;

    /**
     * # of tala cycles to render per row of notation
     * @type int
     * @private
     */
    this.NTalaCyclesPerRow = 1;

    if( nTalaCyclesPerRow ) 
	this.fNTalaCyclesPerRow = nTalaCyclesPerRow;
    /**
     * the song model for which this view is a rendering of.
     * @type Song
     * @private
     */
    this.fSong     = song;		// the song

    /**
     * the parent element under which the song view contents are rendered
     * @type DOMElement
     * @private
     */
    this.fBody       = null;

    /**
     * the outer content of the view
     * @type DOMElement
     * @private
     */
    this.fOuter = null;

    /**
     * the current selected row view part
     * @type SelectableRowViewPart
     * @private
     */
    this.fSelected = null;

    /**
     * the first song view part - only page views are song view parts
     * @type PageView
     * @private
     */
    this.fFirstPart = null;		// the first view part

    /**
     * the last song view part - only page views are song view parts
     * @type PageView
     * @private
     */
    this.fLastPart  = null;		// the last view part

    /** 
     * (during rendering) current tala
     * @type Tala
     * @private
     */
    this.fCurTala   = null;		// the current tala (model)

    /** 
     * (during rendering) current column in current row view
     * @type int
     * @private
     */
    this.fCurCol  = 0;			// current column in row to render next swara

    /** 
     * @type Duration
     * (during rendering) current duration
     * @private
     */
    this.fCurDuration  = new Duration(0,0);// current duration (within tala cycle)

    /** 
     * (during rendering) # of columns in current table, which depends on current tala
     * @type int
     * @private
     */
    this.fCurColCount   = 1;

    /**
     * the (preferred) # of swaras in current column - this depends on the layout
     * @type int
     * @private
     */
    this.fCurColSwaraCount   = 1;

    /**
     * (during rendering) current table
     * @type DOMElement_TABLE
     * @private
     */
    this.fCurTable  = null;

    /**
     * (during rendering) current page
     * @type PageView
     * @private
     */
    this.fCurPage   = null;

    /**
     * (during rendering) content area of current page
     * @type DOMElement
     * @private
     */
    this.fCurPageContent = null;

    /**
     * are we doing compact layout where notations take up only needed space or
     * do they spread to occupy entire page width?
     * @type boolean
     * @private
     */
    this.fCompactLayout = song.getLayoutWidth();

    /**
     * are we first generating HTML content for the HTML tables in the song, and 
     * then later rendering entire song content using innerHTML, OR are we
     * rendering content progressively. The former approach is much much
     * faster on all browsers. In IE, progressive rendering is very very slow
     *
     * We render entire page content as HTML only when loading a song initially -
     * see _renderContents()
     */
    this.fRenderAsHTML  = false;

    /**
     * when generating HTML content (see _renderContents), this is hold area
     * area to hold HTML content of pageview parts (except column guides)
     * @type String[]
     */
    this.fRowHoldArea  = null;

    /**
     * are we in interactive (WYSIWYG) mode? 
     * TODO: CURRENTLY, interactive mode is not supported as it is not ready
     * (and supporting non-interactive mode is easier) - but we are trying to
     * atleast "maintain" the interactive mode code part
     * @type boolean
     * @private
     */
    this.fInteractive = false;


    theSongView = this;

    /* cache of inline tala marker gamaka objects - speeds up things */
    this.fInlineTalaMarkerCache = new Array();
}
