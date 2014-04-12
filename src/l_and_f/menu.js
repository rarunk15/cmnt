/**
 * @fileoverview
 * menu.js contains classes related to menus and menu items
 */

/*
 * @class MenuItem
 * represents an abstract menu item 
 */
function MenuItemBase() 
{
}
MenuItemBase.prototype = new Widget();

/*
 * @class MenuItem
 * represents a menu item display, which is a cell under a table row
 * <p>
 * This is sort of an abstract class in the sense it expects derived classes
 * to implement {@link MenuItem#provideContent} method to provide real content.
 *
 * the menu item is a table row in a table, which is the rendering of the menu ({@link Menu})
 */
function MenuItem() 
{
    /**
     * top row of the menu item display
     * @type int
     * @static
     * @private
     */
    this.ROW_TOP = 1;

    /**
     * middle row of the menu item display
     * @type int
     * @static
     * @private
     */
    this.ROW_MID = 2;

    /**
     * bottom row of the menu item display
     * @type int
     * @static
     * @private
     */
    this.ROW_BOT = 3;

    /**
     * menu item text
     * @type String
     * @private
     */
    this.fMenuText = null;

    /**
     * is the menu item enabled?
     * @type boolean
     * @private
     */
    this.fEnabled = true;

    /**
     * is the menu item selectable?
     * @type boolean
     * @private
     */
    this.fSelectable = true;

    /**
     * object whose onItemSelect method will be called when the menu item
     * is selected
     * @private
     */
    this.fSelectListener = null;

    /**
     * is the menu item selectable (all items are selectable by default)?
     * @return true or false indicating if the menu item is selectable or not
     * @type boolean
     */
    this.isSelectable = function() { return this.fSelectable; }

    /**
     * is the menu item enabled (all items are enabled by default)?
     * @return true or false indicating if the menu item is enabled or not
     * @type boolean
     */
    this.isEnabled = function() { return this.fEnabled; }

    /**
     * enable/disable the menu item
     * @param {boolean} val	 indicate whether to enable/disable the menu item
     */
    this.setEnabled = function(val) {
	this.fEnabled = val;
	if( this.fMenuText ) {
	    this.fMenuText.style.color = this._getColor();
	    this.fMidRowOuter.style.color = this._getColor();
	    this.fMidRowContent.style.color = this._getColor();
	}
    }

    /**
     * set/unset selectability of the menu item
     * @param {boolean} val	 indicate whether menu item should be selectable or not
     */
    this.setSelectable = function(val) {
	this.fSelectable = val;
    }

    /**
     * called to provide content - derived classes are expected to override
     * this
     * @return the DOM element representing the menu item content
     * @type DOMElement
     */
    this.provideContent = function() {
	return null;
    }

    /**
     * initialize the menu item and create its contents
     *
     * @param {DOMElement_TR} tr		the row for the menu under which this menu item
     *			      			is to be displayed
     * @param {ActionHandler} actionHandler   	the handler that should be
     *			      			called when the menu item is selected
     * @param actionID        			the action handler specific actionID to pass to 
     *			      			the action handler
     * @param idx				(optional) where in row to insert
     */
    this.initMenuItem = function(tr, actionHandler, actionID, idx) {
	if( !idx )  {
	    idx = 0;
	    if( tr.cells ) idx = tr.cells.length;
	}
	var td = tr.insertCell(idx);
	td.style.padding = "0 0 0 0";

	this._initRow(td, this.ROW_TOP);
	this._initRow(td, this.ROW_MID);
	this._initRow(td, this.ROW_BOT);

	this.fOuter = td;
	this.fActionHandler = actionHandler;
	this.fActionID      = actionID;
    }

    /**
     * set the listener object whose onItemSelect method will be called
     * when the menu item is selected
     * @param l		the listener whose onItemSelect method is called when item 
     *			is selecteed
     */
    this.setSelectListener = function(l) {
	this.fSelectListener = l;
    }

    /**
     * (internal) create content for a row within display - called by initMenuItem
     *
     * @param {DOMElement_TD} td      the table cell for the menu item content
     * @param {int}	      which   which row of the display is being rendered
     * @private
     */
    this._initRow = function(td, which) {
	var outer = document.createElement("div");
	outer.style.background = 'url("background.png") repeat';
	outer.style.padding = "0 0 0 0";
	if( which == this.ROW_MID ) 
	    outer.style.zIndex     = LookAndFeel.ZINDEX_MENU + 3;
	else
	    outer.style.zIndex     = LookAndFeel.ZINDEX_MENU + 5;
	outer.style.position   = "relative";
	if( which == this.ROW_TOP ) 
	    outer.style.top        = "0.1em";
	else if( which == this.ROW_BOT ) 
	    outer.style.top        = "-0.1em";
	outer.onmouseover           = this._labelHoverEnter;
	outer.onmouseout            = this._labelHoverExit;
	outer.onclick               = this._labelClick;
	outer.id = Utils.getNewId("mi");
	Utils.addToIdMap(outer, this);	// outer.view = this;

	var mtr = document.createElement("div");
	if( which == this.ROW_MID ) 
	    mtr.style.zIndex     = LookAndFeel.ZINDEX_MENU + 3;
	else
	    mtr.style.zIndex     = LookAndFeel.ZINDEX_MENU + 5;

	if( which == this.ROW_MID ) {
	    //mtr.style.background = 'url("background.png") repeat';
	    var menuText  = document.createElement("div");
	    menuText.style.fontWeight =  "bold";
	    //menuText.style.fontFamily =  "Lucida Sans";
	    menuText.style.fontSize =  "0.85em";
	    //menuText.style.background = 'url("background.png") repeat';
	    menuText.style.position =  "relative"
	    menuText.style.margin =  "0 8px";
	    menuText.style.textAlign =  "center";
	    menuText.style.zIndex =  LookAndFeel.ZINDEX_MENU + 7;
	    menuText.style.display = "inline";
	    menuText.style.cursor  = "default";
	    menuText.style.color   = this._getColor();

	    var content = this.provideContent();
	    if( content == null ) {
		content = document.createElement("a");
		content.style.textDecoration = "none";
		content.style.fontSize = "1em";
		content.appendChild(document.createTextNode("???"));
	    }
	    content.id = Utils.getNewId("mic");
	    Utils.addToIdMap(content, this); // content.view     = this;

	    menuText.appendChild(content);
	    mtr.appendChild(menuText);
	    outer.appendChild(mtr);

	    //this.menuLink = link;
	    this.fMenuText = menuText;

	    this.fMidRowOuter = outer;
	    this.fMidRowOuter.style.color = this._getColor();
	    this.fMidRow      = mtr;
	    this.fMidRowContent = content;
	}
	else {
	    var imgOuter = document.createElement("div");
	    imgOuter.style.width = "8px";
	    imgOuter.style.height = "5px";
	    imgOuter.style.display = "block";
	    imgOuter.style.padding = "0 0 0 0";

	    var img = document.createElement("img");
	    if( which == this.ROW_TOP ) img.src = LookAndFeel.srcurl("highlight_tl.png");
	    else        img.src = LookAndFeel.srcurl("highlight_bl.png");
	    img.width = "8";
	    img.height = "7";
	    img.style.width = "8px";
	    img.style.height = "5px";
	    img.style.border = "none";
	    img.style.zIndex     = LookAndFeel.ZINDEX_MENU + 5;
	    img.style.display = "none";
	    imgOuter.appendChild(img);

	    mtr.appendChild(imgOuter);
	    if( which == this.ROW_TOP )
		mtr.style.background = LookAndFeel.url("bkgnd.png") + ' no-repeat top right';
	    else
		mtr.style.background = LookAndFeel.url("bkgnd.png") + ' no-repeat bottom right';

	    outer.appendChild(mtr);
	    if( which ==  this.ROW_TOP ) {
		this.fTopRowOuter = outer;
		this.fTopRow      = mtr;
		this.fTopRowImage = img;
	    }
	    else {
		this.fBotRowOuter = outer;
		this.fBotRow      = mtr;
		this.fBotRowImage = img;
	    }
	}
	td.appendChild(outer);
	this.fOuter = td;
    }

    /**
     * (internal) get the text color
     * @return the text color as a string specifiable in a css style
     * @private
     */
    this._getColor = function() {
	if( this.isEnabled() ) return "#000000";
	return "#888888";
    }

    /**
     * (internal) called when menu item is clicked on - "this" is the 
     * menu item html content
     * @private
     */
    function _labelClick(e) {
	if( !e && event ) e = event;
	var menuItem = Utils.getObjForId(this);	// this.view    ;
	if( !menuItem || !menuItem.isSelectable() || !menuItem.isEnabled() ) return;


	if( menuItem.fSelectListener )
	    menuItem.fSelectListener.onItemSelect(menuItem, menuItem.fSelectListener);
	var action = menuItem.fActionHandler;
	var actionID = menuItem.fActionID;
	if( action && action.doAction ) {
	    action.doAction(menuItem, actionID);
	}
	if( e.preventDefault )
	    e.preventDefault();
	return false;
    }
    this._labelClick = _labelClick;

    /**
     * (internal) called when mouse moves out of the menu item - "this" is the 
     *  menu item html content
     * @private
     */
    function _labelHoverEnter() {
	var menuItem = Utils.getObjForId(this);	// this.view    ;
	if( !menuItem || !menuItem.isSelectable() || !menuItem.isEnabled() ) return;

	menuItem.fTopRowOuter.style.background = LookAndFeel.url("highlight.png") + ' repeat';
	menuItem.fTopRow.style.background = LookAndFeel.url("highlight_tr.png") + ' no-repeat top right';
	menuItem.fTopRowImage.style.display    = "block";

	menuItem.fBotRowOuter.style.background = LookAndFeel.url("highlight.png") + ' repeat';
	menuItem.fBotRow.style.background = LookAndFeel.url("highlight_br.png") + ' no-repeat top right';
	menuItem.fBotRowImage.style.display    = "block";

	menuItem.fMidRowOuter.style.background = LookAndFeel.url("highlight.png") + ' repeat';
	menuItem.fMidRow.style.background = LookAndFeel.url("highlight.png") + ' repeat';
	// setting row content a must for IE
	if( menuItem.fMidRowContent.style )
	    menuItem.fMidRowContent.style.background = LookAndFeel.url("highlight.png") + ' repeat';
	menuItem.fMidRowOuter.style.color = "#EEEEEE";
	if( menuItem.fSelectListener && menuItem.fSelectListener.onItemHover )
	    menuItem.fSelectListener.onItemHover(menuItem, menuItem.fSelectListener);
    }
    this._labelHoverEnter = _labelHoverEnter;

    /**
     * (internal) called when mouse moves out of the menu item - "this" is the 
     * menu item html content
     * @private
     */
    function _labelHoverExit() {
	var menuItem = Utils.getObjForId(this);	// this.view    ;
	if( !menuItem || !menuItem.isSelectable() || !menuItem.isEnabled() ) return;

	menuItem.fTopRowOuter.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	menuItem.fTopRow.style.background = LookAndFeel.url("bkgnd.png") + ' repeat top right';
	menuItem.fTopRowImage.style.display    = "none";

	menuItem.fBotRowOuter.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	menuItem.fBotRow.style.background = LookAndFeel.url("bkgnd.png") + ' repeat top right';
	menuItem.fBotRowImage.style.display    = "none";

	menuItem.fMidRowOuter.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	menuItem.fMidRow.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	// setting row content a must for IE
	if( menuItem.fMidRowContent.style )
	    menuItem.fMidRowContent.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	menuItem.fMidRowOuter.style.color = "#000000";
    }
    this._labelHoverExit = _labelHoverExit;
}
MenuItem.prototype = new MenuItemBase();

/**
 * @class
 * represents a simple menu item whose context is a label/text
 * @constructor
 * @param {DOMElement_TR} tr		the row for the menu under which this menu item
 *			      		is to be displayed
 * @param {String} txt			the menu item text
 *
 * @param actionHandler   		the object whose doMenuItemAction method would be called
 *			      		when the menu item is selected
 * @param actionID        		the action handler specific actionID to pass to 
 *			      		the action handler's actionID method
 */
function TextMenuItem(tr, txt, actionHandler, actionID) 
{
    /**
     * called by @{link MenuItem} so that we can provide content for the menu item
     */
    this.provideContent = function() {
	var d = document.createElement("div");
	d.style.textAlign = "left";
	this.fTextNode = document.createTextNode(this.fText);
	d.appendChild(this.fTextNode);
	return d;
    }

    /**
     * set the text of the menu item
     */
    this.setText = function(txt) {
	this.fText = txt;
	if( this.fTextNode ) 
	    this.fTextNode.nodeValue = text;
    }

    /**
     * the text of the menu item
     * @type String
     * @private
     */
    this.fText = txt;

    /**
     * the text node of the menu item
     * @type DOMElement
     * @private
     */
    this.fTextNode = null;

    this.initMenuItem(tr, actionHandler, actionID);
}
TextMenuItem.prototype = new MenuItem();

/**
 * @class
 * represents a break (divider) menu item whose context is a label/text
 * @constructor
 * @param {DOMElement_TR} tr		the row for the menu under which this menu item
 *			      		is to be displayed
 */
function BreakMenuItem(tr) 
{
    this.init = function(tr) {
	td = tr.insertCell(0);
	td.padding = "0 0 0 0";
	//var d = document.createElement("div");
	//d.padding = "0 0 0 0";
	//d.style.height = "2px";
	//d.style.width  = "100%";
	td.appendChild(document.createElement("hr"));
	//d.style.borderTop = "thin solid #444444";
	//td.appendChild(d);
    }

    this.init(tr);
}
BreakMenuItem.prototype = new MenuItemBase();

/**
 * @class
 * represents a pop-up menu
 * <p>
 * the menu is a DOM table, in which the {@link MenuItem}s are table rows
 */
function Menu() 
{
    /**
     * get the nth menu item
     * @return the nth menu item, if it exists, else returns null
     * @type MenuItem
     */
    this.getItem = function(n) {
	if( this.fIsHorizontalMenu )  {
	    return null;	// not yet supported
	}
	else {
	    var idx = 0;
	    var tr = null;
	    for( var i = 0; idx < n && i < this.fMenuTable.rows.length; i++ ) {
		tr = this.fMenuTable.rows[i];
		if( tr.id /*tr.view*/ ) idx++;
	    }
	    if( tr == null || i == this.fMenuTable.rows.length ) return null;
	    return Utils.getObjForId(tr.id); // tr.view;
	}
    }

    /**
     * add a break menu item to the menu
     */
    this.addBreakItem = function() {
	if( this.fIsHorizontalMenu )
	    return null;

	var tr = this.fMenuTable.insertRow(this.fMenuTable.rows.length);
	var m = new BreakMenuItem(tr);
	return m;
    }

    /**
     * add a text menu item to the menu
     * @param {String} text	text of the menu item
     * @param actionHandler  	the object whose doMenuItemAction method would be called
     *			      	when the menu item is selected
     * @param actionID        	the action handler specific actionID to pass to 
     *			      	the action handler's actionID method
     * @return the menu item
     * @type MenuItem
     */
    this.addTextItem = function(text, actionHandler, actionID) {
	var tr;
	if( !this.fIsHorizontalMenu )
	    tr = this.fMenuTable.insertRow(this.fMenuTable.rows.length);
	else
	    tr = this.fMenuTable.rows[0];
	var m = new TextMenuItem(tr, text, actionHandler, actionID);
	m.setSelectListener(this);
	return m;
    }

    /**
     * add a generic menu item to the menu
     * @param m			menu item
     * @param actionHandler  	the object whose doMenuItemAction method would be called
     *			      	when the menu item is selected
     * @param actionID        	the action handler specific actionID to pass to 
     *			      	the action handler's actionID method
     * @return the menu item
     * @type MenuItem
     */
    this.addItem = function(m, actionHandler, actionID) {
	var tr;
	if( !this.fIsHorizontalMenu )
	    tr = this.fMenuTable.insertRow(this.fMenuTable.rows.length);
	else
	    tr = this.fMenuTable.rows[0];
	tr.id = Utils.getNewId("mmi");
	Utils.addToIdMap(tr, m); // tr.view = m;	// associate menu item with row, so that we can get it for getItem
	m.initMenuItem(tr, actionHandler, actionID);
	m.setSelectListener(this);
	return m;
    }

    /**
     * insert a generic menu item to the menu
     * @param m			menu item
     * @param insertBeforeThis	insert before this menu item
     * @param actionHandler  	the object whose doMenuItemAction method would be called
     *			      	when the menu item is selected
     * @param actionID        	the action handler specific actionID to pass to 
     *			      	the action handler's actionID method
     * @return the menu item
     * @type MenuItem
     */
    this.insertItem = function(m, insertBefore, actionHandler, actionID) {
	var cellidx = 0;
	var tr;
	if( this.fIsHorizontalMenu )  {
	    tr = this.fMenuTable.rows[0];
	    if( tr.cells ) {
		for(cellidx= 0; cellidx < tr.cells.length; cellidx++ ) {
		    if(insertBefore.getContent() == tr.cells[cellidx]) 
			break;
		}
	    }
	}
	else {
	    var rowidx = 0;
	    if( this.fMenuTable.rows ) {
		for(rowidx = 0; rowidx < this.fMenuTable.rows.length; rowidx++ ) {
		    tr = this.fMenuTable.rows[rowidx];
		    if(insertBefore.getContent() == tr.cells[0]) 
			break;
		}
	    }
	    tr = this.fMenuTable.insertRow(rowidx);
	}
	m.initMenuItem(tr, actionHandler, actionID, cellidx);
	m.setSelectListener(this);
	return m;
    }

    /**
     * called when a menu item in this menu is selected - we hide ourselves
     */
    this.onItemSelect = function(item, me) {
	me.hide();
    }

    /**
     * show this menu at a certain position
     * @param {int} x	x position (pixel)
     * @param {int} y	y position (pixel)
     */
    this.show = function(x, y) {
	x += document.body.scrollLeft;
	this.fOuter.style.left = x;
	this.fOuter.style.top = y;
	this.fOuter.style.visibility = "visible";
	EventManager.postEvent(EventManager.EVENT_MENU_OPENED, this);
    }

    /**
     * hide this menu
     */
    this.hide = function() {
	this.fOuter.style.visibility = "hidden";
	EventManager.postEvent(EventManager.EVENT_MENU_CLOSED, this);
    }

    /**
     * initialize the menu
     * @param {boolean} isHorz	(optional) true of horizontal menu
     * @param {DOMElement} parent (optional) if specified append menu to this dom element
     *					     as opposed to  body
     */
    this.initMenu = function(isHorz, parnt) {
	if( !isHorz ) isHorz = false;
	this.fIsHorizontalMenu = isHorz;

	var table = document.createElement("table");
	table.style.padding = "0 0 0 0";
	table.style.margin = "0 0 0 0";
	table.style.visibility = "hidden";
	table.style.position = "absolute"
	table.style.borderCollapse = "collapse";
	table.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	table.style.zIndex     = LookAndFeel.ZINDEX_MENU;

	var topRow = table.insertRow(0);
	var td = topRow.insertCell(0);
	td.colSpan = 3;
	td.style.background = LookAndFeel.url("form_top.png") + ' repeat-x';
	td.style.height      = "2px";
	td.style.overflow    = "hidden";

	var midRow = table.insertRow(1);
	var left = midRow.insertCell(0);
	left.style.background = LookAndFeel.url("form_left.png") + ' repeat-y';
	left.style.width      = "2px";
	left.style.height      = "100%";
	this.fLeft = left;

	var contentContainer = midRow.insertCell(1);
	contentContainer.style.padding = "0 0 0 0";
	contentContainer.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';

	var menuTable = window.document.createElement("table");
	menuTable.style.padding = "0 0 0 0";
	menuTable.style.borderCollapse = "collapse";
	menuTable.insertRow(0);
	contentContainer.appendChild(menuTable);

	var right = midRow.insertCell(2);
	right.style.background = LookAndFeel.url("form_right.png") + ' repeat-y';
	right.style.width      = "2px";
	right.style.height      = "100%";
	this.fRight = right;

	var botRow = table.insertRow(2);
	var btd = botRow.insertCell(0);
	btd.colSpan = 3;
	btd.style.background = LookAndFeel.url("form_bot.png") + ' bottom repeat-x';
	btd.style.height      = "2px";
	btd.style.overflow    = "hidden";
	this.fBottom= btd;

	this.fOuter = table;
	this.fMenuTable = menuTable;

	this.fOuter.className = "Menu";
	this.fOuter.setAttribute( "class", "Menu");
	this.fOuter.setAttribute( "className", "Menu");


	if( !parnt )
	    document.body.appendChild(table);
	else
	    parnt.appendChild(table);
    }

    /**
     * is this a horizontal menu?
     * @type boolean
     * @private
     */
    this.fIsHorizontalMenu = false;
}
Menu.prototype = new Widget();
