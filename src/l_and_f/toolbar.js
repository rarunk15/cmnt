/**
 * @fileoverview
 * toolbar.js contains classes related to toolbars of the swara notation editor
 */

/**
 * @class
 * class that encapsulates event type definitions
 */
function EVENT_TYPE() {
}

/**
 * @final
 * @type int
 * event indicating that a menu item is selected, event src is
 * {@link MenuItem} object representing the menu item 
 */
EVENT_TYPE.prototype.EVENT_MENUITEM_SELECTED  = 1;

/**
 * @final
 * @type int
 * event indicating that a menu is opened; event src is {@link Menu} 
 * object representing the menu
 */
EVENT_TYPE.prototype.EVENT_MENU_OPENED        = 2;

/**
 * @final
 * @type int
 * event indicating that a menu is closed; event src is {@link Menu} 
 * object representing the menu
 */
EVENT_TYPE.prototype.EVENT_MENU_CLOSED        = 3;

/**
 * @final
 * @type int
 * event indicating that the content area of the song is clicked on.
 */
EVENT_TYPE.prototype.EVENT_CONTENTAREA_MOUSECLICKED = 4;

/**
 * @final
 * @type int
 * event indicating that a (modal) form is opened; event src is {@link Form} 
 * object representing the form
 */
EVENT_TYPE.prototype.EVENT_FORM_OPENED        = 5;

/**
 * @final
 * @type int
 * event indicating that a (modal) form is closed; event src is {@link Form} 
 * object representing the form
 */
EVENT_TYPE.prototype.EVENT_FORM_CLOSED        = 6;

/**
 * @final
 * @type int
 * event indicating that a swara is selected; event src is {@link SwaraView},
 * and data is {@link Swara}
 */
EVENT_TYPE.prototype.EVENT_SWARA_SELECTED     = 10;

/**
 * @final
 * @type int
 * event indicating that a lyric is selected; event src is {@link LyricView},
 * and data is {@link Lyric}
 */
EVENT_TYPE.prototype.EVENT_LYRIC_SELECTED     = 11;

/**
 * @final
 * @type int
 * event indicating that a heading is selected; event src if {@link HeadingView},
 * and data is {@link Heading}
 */
EVENT_TYPE.prototype.EVENT_HEADING_SELECTED = 12;

/**
 * @final
 * @type int
 * event indicating that a spacer used for adding new swaras is selected; event src is {@link NewSwaraView},
 * and data is a spacer swara which is really a swara with no label
 */
EVENT_TYPE.prototype.EVENT_NEWSWARASPACER_SELECTED     = 13;

/**
 * @final
 * @type int
 * event indicating that insert/overwrite mode changed for notation editing
 * event src and data are null
 */
EVENT_TYPE.prototype.EVENT_NOTATION_INSERTMODE = 14;
/**
 * @final
 * @type int
 * event indicating that a swara is selected; event src is {@link SwaraView},
 * and data is {@link Swara}
 */
EVENT_TYPE.prototype.EVENT_SWARA_SELECTED     = 10;


/**
 * @final
 * @type int
 * event indicating that current selection is cancelled and nothing is selected
 * src and data are unused
 */
EVENT_TYPE.prototype.EVENT_NOTHING_SELECTED     = 15;


/**
 * @final
 * @type int
 * event indicating that the label text box in the swara tool bar has changed
 * contents. Event 'src' is the label text box, and 'data' is the new contents.
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_LABELCHANGED = 101;

/**
 * @final
 * @type int
 * even indicating that the stayi selector in the swara tool bar has changed.
 * Event 'src' is the stayi selector, and 'data' is the new octave value.
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_STAYICHANGED = 102;

/**
 * @final
 * @type int
 * even indicating that the speed/duration selector in the swara tool bar has changed.
 * Event 'src' is the speed/duration selector, and 'data' is the new speed/duration value.
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_SPEEDCHANGED = 103;

/**
 * @final
 * @type int
 * even indicating that the gamaka marker selector in the swara tool bar has changed.
 * Event 'src' is the gamaka selector, and 'data' is the new gamaka (null=> no gamaka
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_GAMAKACHANGED = 104;

/**
 * @final
 * @type int
 * even indicating that the length of swara has changed
 * Event 'src' is undefined (at this point), and 'data' is the new length
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_LENGTHCHANGED = 105;

/**
 * @final
 * @type int
 * event indicating that the the currently selected swara should be deleted
 * contents. Event 'src' and 'data' are null
 */
EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_DELETESWARA = 106;

/**
 * @final
 * @type int
 * event indicating that the label text box in the lyric tool bar has changed
 * contents. Event 'src' is the label text box, and 'data' is the new contents.
 */
EVENT_TYPE.prototype.EVENT_LYRICTOOLBAR_LABELCHANGED = 201;

/**
 * @final
 * @type int
 * event indicating that a new font has been added
 * contents. Event 'src' and 'data' both have the font name
 */
EVENT_TYPE.prototype.EVENT_FONT_ADDED = 300;

/**
 * @final
 * @type int
 * event indicating that a new gamaka has been added
 * contents. Event 'src' and 'data' both have the font name
 */
EVENT_TYPE.prototype.EVENT_GAMAKA_ADDED = 301;

/**
 * @final
 * @type int
 * custom event, here 'src' is the event-handler, and 'data' is specific to the event handler
 * this event is sent ONLY to the src
 */
EVENT_TYPE.prototype.EVENT_CUSTOM = 10000;




/**
 * @class
 * an event listener
 */
function EventListener()
{
    /**
     * called when an event for this listener is registered for is posted - 
     * derived classes should override this and implement event handling logic
     *
     * @param	{EVENT_TYPE} evt	the event type
     * @param		     src	the event src (depends on event type)
     * @param		     data	the event data (depends on event type)
     */
    this.onEvent = function(evt, src, data) {
    }
}

/**
 * @class
 * represents the swara notation editor event manager
 */
function EventManagerDefn() 
{
    /**
     * register an event with manager
     * @param {EVENT_TYPE} typ	event type
     */
    this.registerEvent = function(typ ) {
	var str = typ + '';
	if( this._listeners[str] ) {
	    return false;
	}
	this._listeners[str] = new Array();
	return true;
    }

    /**
     * add a listener for an event type - the event type is registered if
     * not already done.
     *
     * @param {EVENT_TYPE} typ		event type
     * @param {EventListener} listener	event listener whose onEvent method would be called when
     *					event is posted
     */
    this.addListener = function(eventTyp, listener) {
	if( !listener || !listener.onEvent )  return false;
	var str = eventTyp + '';
	this.registerEvent(str);
	var listeners = this._listeners[str];
	if( !listeners ) return false;
	listeners[listeners.length] = listener;
	return true;
    }

    /**
     * post an event - the event is delivered to all listeners who have
     * registered to receive this event via {@link addListener}
     * @param	{EVENT_TYPE} evt	the event type
     * @param		     src	the event src (depends on event type)
     * @param		     data	the event data (depends on event type)
     */
    this.postEvent = function(typ, src, data) {
	var str = typ + '';

	if( typ == this.EVENT_CUSTOM ) {
	    if( src.onEvent ) 
		src.onEvent(str, src, data);
	    return;
	}

	var listeners = this._listeners[str];
	var nListeners = listeners.length;
	for(var i = 0; i < nListeners; i++ )
	    listeners[i].onEvent(str, src, data);
    }

    this.EVENT_MENUITEM_SELECTED  = EVENT_TYPE.prototype.EVENT_MENUITEM_SELECTED;
    this.EVENT_MENU_OPENED        = EVENT_TYPE.prototype.EVENT_MENU_OPENED;
    this.EVENT_MENU_CLOSED        = EVENT_TYPE.prototype.EVENT_MENU_CLOSED;
    this.EVENT_FORM_OPENED        = EVENT_TYPE.prototype.EVENT_FORM_OPENED;
    this.EVENT_FORM_CLOSED        = EVENT_TYPE.prototype.EVENT_FORM_CLOSED;
    this.EVENT_CONTENTAREA_MOUSECLICKED = EVENT_TYPE.prototype.EVENT_CONTENTAREA_MOUSECLICKED;
    this.EVENT_SWARA_SELECTED     = EVENT_TYPE.prototype.EVENT_SWARA_SELECTED;
    this.EVENT_NOTHING_SELECTED     = EVENT_TYPE.prototype.EVENT_NOTHING_SELECTED;
    this.EVENT_NEWSWARASPACER_SELECTED     = EVENT_TYPE.prototype.EVENT_NEWSWARASPACER_SELECTED;
    this.EVENT_LYRIC_SELECTED     = EVENT_TYPE.prototype.EVENT_LYRIC_SELECTED;
    this.EVENT_HEADING_SELECTED     = EVENT_TYPE.prototype.EVENT_HEADING_SELECTED;
    this.EVENT_NOTATION_INSERTMODE = EVENT_TYPE.prototype.EVENT_NOTATION_INSERTMODE;

    this.EVENT_SWARATOOLBAR_LABELCHANGED = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_LABELCHANGED;
    this.EVENT_SWARATOOLBAR_STAYICHANGED = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_STAYICHANGED;
    this.EVENT_SWARATOOLBAR_SPEEDCHANGED = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_SPEEDCHANGED;
    this.EVENT_SWARATOOLBAR_LENGTHCHANGED = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_LENGTHCHANGED;
    this.EVENT_SWARATOOLBAR_DELETESWARA = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_DELETESWARA;
    this.EVENT_SWARATOOLBAR_GAMAKACHANGED = EVENT_TYPE.prototype.EVENT_SWARATOOLBAR_GAMAKACHANGED;
    this.EVENT_LYRICTOOLBAR_LABELCHANGED = EVENT_TYPE.prototype.EVENT_LYRICTOOLBAR_LABELCHANGED;
    this.EVENT_FONT_ADDED = EVENT_TYPE.prototype.EVENT_FONT_ADDED;
    this.EVENT_GAMAKA_ADDED = EVENT_TYPE.prototype.EVENT_GAMAKA_ADDED;
    this.EVENT_CUSTOM      = EVENT_TYPE.prototype.EVENT_CUSTOM;

    /**
     * @type Array
     * an associated array of registered listeners for various events
     * @private
     */
    this._listeners = new Array();

    /**
     * (internal) initializer function
     * @private
     */
    this._init = function() {
	this.registerEvent(this.EVENT_MENUITEM_SELECTED);
	this.registerEvent(this.EVENT_MENU_OPENED);
	this.registerEvent(this.EVENT_MENU_CLOSED);
	this.registerEvent(this.EVENT_FORM_OPENED);
	this.registerEvent(this.EVENT_FORM_CLOSED);
	this.registerEvent(this.EVENT_SWARA_SELECTED);
	this.registerEvent(this.EVENT_NOTHING_SELECTED);
	this.registerEvent(this.EVENT_NEWSWARASPACER_SELECTED);
	this.registerEvent(this.EVENT_LYRIC_SELECTED);
	this.registerEvent(this.EVENT_HEADING_SELECTED);
	this.registerEvent(this.EVENT_NOTATION_INSERTMODE);
	this.registerEvent(this.EVENT_CONTENTAREA_MOUSECLICKED);

	this.registerEvent(this.EVENT_SWARATOOLBAR_LABELCHANGED);
	this.registerEvent(this.EVENT_SWARATOOLBAR_STAYICHANGED);
	this.registerEvent(this.EVENT_SWARATOOLBAR_SPEEDCHANGED);
	this.registerEvent(this.EVENT_SWARATOOLBAR_LENGTHCHANGED);
	this.registerEvent(this.EVENT_SWARATOOLBAR_DELETESWARA);
	this.registerEvent(this.EVENT_SWARATOOLBAR_GAMAKACHANGED);
	this.registerEvent(this.EVENT_LYRICTOOLBAR_LABELCHANGED);

	this.registerEvent(this.EVENT_FONT_ADDED);
	this.registerEvent(this.EVENT_GAMAKA_ADDED);
    }

    this._init();
}
EventManager = new EventManagerDefn();

function dimmerOnMouseMove(e) 
{
    if(!e ) e  = event;
    var form = Utils.getObjForId(this); // this.view;
    if( form ) form.onFormTitleMouseDrag(e);
}
/**
 * @class
 * handles look and feel management functionality
 */
function LookAndFeelMgr() 
{
    this.lAndFDir = null;

    this.init = function(editorParent, lAndFDir, notinteractive) {
	if( lAndFDir && lAndFDir != "" )
	    this.fLAndFDir = lAndFDir + "/";
	else
	    this.fLAndFDir = "";
	if(!notinteractive) {
	    EventManager.addListener(EventManager.EVENT_MENU_OPENED,this);
	    EventManager.addListener(EventManager.EVENT_MENU_CLOSED,this);
	    EventManager.addListener(EventManager.EVENT_MENU_IGNORECLICK,this);
	    EventManager.addListener(EventManager.EVENT_CONTENTAREA_MOUSECLICKED,this);
	    EventManager.addListener(EventManager.EVENT_FORM_OPENED,this);
	    EventManager.addListener(EventManager.EVENT_FORM_CLOSED,this);
	    DefaultNotationSelectionController.addListener(this);
	    document.body.onclick = onBodyMouseClick;
	}
	this.fEditorParent = editorParent;
    }

    this.fCurMenu = null;
    this.fIgnoreNextClick = false;	// a bad kludge
    this.fFormsOpened = false;

    this.fBodyDimmer = null;

    this.getPageSize = function() {
  	var xScroll, yScroll;

  	if (window.innerHeight && window.scrollMaxY) {	
  		xScroll = document.body.scrollWidth;
  		yScroll = window.innerHeight + window.scrollMaxY;
  	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
  		xScroll = document.body.scrollWidth;
  		yScroll = document.body.scrollHeight;
  	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
  		xScroll = document.body.offsetWidth;
  		yScroll = document.body.offsetHeight;
  	}

  	var windowWidth, windowHeight;

  	if (self.innerHeight) {	// all except Explorer
  		windowWidth = self.innerWidth;
  		windowHeight = self.innerHeight;
  	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
  		windowWidth = document.documentElement.clientWidth;
  		windowHeight = document.documentElement.clientHeight;
  	} else if (document.body) { // other Explorers
  		windowWidth = document.body.clientWidth;
  		windowHeight = document.body.clientHeight;
  	}	
  	var pageHeight, pageWidth;

  	// for small pages with total height less then height of the viewport
  	if(yScroll < windowHeight){
  		pageHeight = windowHeight;
  	} else { 
  		pageHeight = yScroll;
  	}

  	// for small pages with total width less then width of the viewport
  	if(xScroll < windowWidth){	
  		pageWidth = windowWidth;
  	} else {
  		pageWidth = xScroll;
  	}

  	return {pageWidth: pageWidth ,pageHeight: pageHeight , windowWidth: windowWidth, windowHeight: windowHeight};
   }

   this.ignoreMouse = function(event) {
    if( event.stop ) event.stop();
    else return false;
   }
    /**
     * called when the selection changes in the song view
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * @param {object}	 oldSelection	previous selection (a selectable part in song-view)
     */
    this.onSelectionChange = function(songView, curSel, oldSel) {
	if(this.fCurMenu != null )
		this.fCurMenu.hide();
    }

    /**
     * called when the an already selected object is selected again (e.g. click on 
     * the already selected object), which is informed to all listeners
     *
     * @param {SongView} songView	the song view
     * @param {object}	 curSelection	current selection (a selectable part in song-view)
     * 
     */
    this.onReselect = function(songView, curSel)  {
	if(this.fCurMenu != null )
		this.fCurMenu.hide();
    }

    this.onEvent = function(evt, src, data) {
	if(evt == EventManager.EVENT_MENU_OPENED) {
	    if(this.fCurMenu != null && this.fCurMenu != src )
		this.fCurMenu.hide();
	    this.fCurMenu = src;
	    this.fIgnoreNextClick = true;
	}
	else if(evt == EventManager.EVENT_MENU_CLOSED) {
	    this.fCurMenu = null;
	}	
	else if(evt == EventManager.EVENT_CONTENTAREA_MOUSECLICKED) {
	    if( !this.fIgnoreNextClick ) {
		if(this.fCurMenu) this.fCurMenu.hide();
	    }
	    this.fIgnoreNextClick = false;
	}
	if( evt == EventManager.EVENT_FORM_OPENED || evt == EventManager.EVENT_FORM_CLOSED ) {
	    if( evt == EventManager.EVENT_FORM_OPENED )
		this.fFormsOpened++;
	    else if( evt == EventManager.EVENT_FORM_CLOSED ) {
		if( this.fFormsOpened > 0 ) this.fFormsOpened--;
	    }

	    if( this.fFormsOpened == 1 ) {
		var pageSize = this.getPageSize();

		this.fBodyDimmer = document.createElement("div");
		this.fBodyDimmer.style.position = "absolute";
		this.fBodyDimmer.style.height  = pageSize.pageHeight + 'px';
		this.fBodyDimmer.style.width   = pageSize.pageWidth + 'px';
		this.fBodyDimmer.style.background = "#c0c0c0";
		this.fBodyDimmer.style.left = 0;
		this.fBodyDimmer.style.top = 0;
		this.fBodyDimmer.style.zIndex = this.ZINDEX_BODYDIMMER;
		this.fBodyDimmer.style.display = "block";
		this.fBodyDimmer.id = Utils.getNewId("bd");
		Utils.addToIdMap(this.fBodyDimmer, src); // content.view = this;
		this.fBodyDimmer.onmousemove = dimmerOnMouseMove;


		var form = src;
		if( data != true ) { /* dont center is not set */
		    var outer = form.getContent();

		    var w  = document.body.offsetWidth;
		    var h  = document.body.offsetHeight;

		    var fw = outer.offsetWidth;
		    var fh = outer.offsetHeight;
		
		    var x = 0;
		    if( h > fh ) x = (w - fw)/2;
		    var y = 0;
		    if( w > fw ) y = (h - fh)/2;
		    outer.style.left = x;
		    outer.style.top  = y;
		}

		var body = document.getElementById("Editor");
		body.insertBefore(this.fBodyDimmer, body.firstChild);
		Utils.setOpacity(this.fBodyDimmer, 0.5);
	    }
	    else if ( this.fFormsOpened == 0 ) {
		var body = document.getElementById("Editor");
		body.removeChild(this.fBodyDimmer);
	    }

	    return;
	}
    }


    this.url = function(imgFile) {
	return 'url("' + this.fLAndFDir + imgFile + '")';
    }

    this.url2 = function(imgFile) {
	return "url('" + this.fLAndFDir + imgFile + "')";
    }

    this.srcurl = function(imgFile) {
	return this.fLAndFDir + imgFile;
    }

    // findPosX and findPosY: borrowed from http://www.quirksmode.org/js/findpos.html
    this.findPosX = function(obj)
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
    }

    // findPosX and findPosY: borrowed from http://www.quirksmode.org/js/findpos.html
    this.findPosY = function(obj)
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
    }

    /**
     * @ignore
     */
    function onBodyMouseClick() {
	EventManager.postEvent(EventManager.EVENT_CONTENTAREA_MOUSECLICKED);
    }

    /**
     * cleanup all objects removing circular references caused by closures etc.
     */
    this.cleanup = function() {
	/*
	 * this post event is a kludge (on top of this cleanup kludge) to release 
	 * certain circular references (which we cant yet figure out how they are 
	 * being setup - these happen when any of the toolbar objects establish a
	 * reference to the view objects, which happen during event processing 
	 * (gets setup only when event handler is executed). I dont know how it 
	 * is circular as in that execution chain i cant see reference from DOM 
	 * to JS (JS to DOM is plenty).
	 */
	EventManager.postEvent(EventManager.EVENT_NOTHING_SELECTED, null, null);
	var idMap = Utils.getIdMap();
	if(idMap ) {
	    var i = 0;
	    for( id in idMap ) {
		i++;
		var o = idMap[id];
		if(o && o.dom)
		    this.cleanDOMNode(o.dom,true);
	    }
	}
	//this.cleanDOMNode(getEditorWorkSpace()); // NO-NEED above suffices and is much FASTER
	//Utils.clearIdStore();	 		   // NO-NEED	
	document.body.onload = null;
	document.body.onunload = null;
	document.body.onclick = null;
    }

    this.cleanDOMNode = function(n, nodeOnly) {
	if( n.view ) { if( n.view.onCleanup ) n.view.onCleanup(); n.view = null; }
	if( n.blur ) { n.blur = null; }
	if( n.onchange ) { n.onchange = null; }
	if( n.onclick ) { n.onclick = null; }
	if( n.oncolorChange ) { n.oncolorChange = null; }
	if( n.onfocus ) { n.onfocus = null; }
	if( n.onkeydown ) { n.onkeydown = null; }
	if( n.onkeyup ) { n.onkeyup = null; }
	if( n.onload ) { n.onload = null; }
	if( n.onmouseclick ) { n.onmouseclick = null; }
	if( n.onmousedown ) { n.onmousedown = null; }
	if( n.onmouseout ) { n.onmouseout = null; }
	if( n.onmouseover ) { n.onmouseover = null; }
	if( n.onselect ) { n.onselect = null; }
	if( n.onunload ) { n.onunload = null; }
	if(nodeOnly) return;
	if( n.hasChildNodes ) {
	    var c = n.firstChild;
	    while( c ) {
		this.cleanDOMNode(c);
		c = c.nextSibling;
	    }
	    return;
	}
    }
    /*
     * z-index maximum z-index of content area
     */
    this.ZINDEX_MAXCONTENT = 9;


    /**
     * z-index for menus
     */
    this.ZINDEX_MENU = this.ZINDEX_MAXCONTENT + 1;
    this.ZINDEX_MAXMENU = this.ZINDEX_MENU + 9;

    /**
     * z-index for body dimmer when forms are up
     */
    this.ZINDEX_BODYDIMMER  = this.ZINDEX_MAXMENU+1;

    /*
     * z-index for forms
     */
    this.ZINDEX_FORM  = this.ZINDEX_BODYDIMMER+10;
    this.ZINDEX_MAXFORM = this.ZINDEX_FORM + 9;
}

var LookAndFeel = new LookAndFeelMgr;

/**
 * @class
 * represents a action handler which e.g. handles actions when a menu item or
 * button is pressed
 */
function ActionHandler()
{
    /**
     * called when the action for which handler is registered for is
     * triggered
     * @param src		the source of action e.g. @{link GenericButton}, @{link MenuItem}
     * @param {int} actionID	the action ID that handler asked to be passed
     *				when it registered for this action - this allows same
     *				handler to handle various actions
     */
    this.doAction = function(src, actionID) {
    }
}

/**
 * represents a GUI widget
 */
function Widget() 
{
    /**
     * get the DOM content of the widget
     * @return the DOM content of the widget
     * @type DOMElement
     */
    this.getContent = function() { return this.fOuter; }

    /**
     * (protected) the DOM content of the widget - derived classes should set this
     * up on rendering
     * @type DOMElement
     * @private
     */
    this.fOuter = null;

}

/**
 * @class
 * represents a text box (with a label), which can then be
 * placed in toolbar or a form
 */
function TextBox() 
{
    /**
     * get the DOM element for the edit box
     * @return the DOM content of the edit box
     * @type DOMElement_Input
     */
    this.getTextBox = function() { return this.fTextBox; }

    /**
     * set button state to enabled/disabled
     * @param {boolean} val	indicates whether to enable/disable button
     */
    this.setEnabled = function(val) {
	this.fEnabled = val;
	if(val ) {
	    if( this.fLabelNode )
		this.fLabelNode.style.color = "black"
	}
	else {
	    if( this.fLabelNode )
		this.fLabelNode.style.color = "rgb(136,136,136)";
	}
	this.fTextBox.disabled = !val;
    }

    /**
     * is the text-box enabled/disabled?
     * @type boolean
     */
    this.isEnabled = function() { return this.fEnabled; }

    /**
     * initialize the text box
     * @param {String} width	the width of the entire text box as specifiable
     *				in a css style
     * @param {label}  label	the label text
     * @param {String}  labelw	(optional) the width of the label as specifiable
     *				in a css style
     */
    function init(width, label, labelw) {
	var div = document.createElement("div");
	this.fLabelElem = null;
	this.fLabelNode = null;
	if( label ) {
	    var ldiv = div;
	    ldiv = document.createElement("div")
	    if( labelw )
		ldiv.style.width = width;
	    ldiv.style.textAlign = "right";
	    ldiv.style.cssFloat = "left";
	    ldiv.style.paddingRight = "0.5em";
	    ldiv.style.fontWeight = "bold";
	    ldiv.style.display  = "inline";

	    this.fLabelElem = document.createTextNode(label);

	    ldiv.appendChild(this.fLabelElem);
	    this.fLabelNode = ldiv;

	    div.appendChild(ldiv);
	}
	var i = document.createElement("input");
	i.type = "text";
	i.style.fontSize = "100%";// so it scales with the browse text size (liquid design)
	if( width ) {
	    i.style.width = width;
	    if( label )
		i.style.textAlign = "left";
	}
	i.style.display  = "inline";
	i.style.cssFloat = "right";
	i.setAttribute("autocomplete","off");	// supposedly gets around mozilla bug about permission denied
						// when we set focus - found by browsing web
	div.appendChild(i);
	this.fOuter = div;
	this.fTextBox = i;
    }
    this.init = init;

    /**
     * the DOM element of the edit box
     * @type DOMElement_Input
     * @private
     */
    this.fTextBox = null;

    /**
     * the DOM element of the label (if any) associated with the edit box
     * @type DOMElement_Text
     * @private
     */
    this.fLabelElem = null;

    /**
     * the DOM element of div that encompasses the label (if any) associated with the edit box
     * @type DOMElement_DIV
     * @private
     */
    this.fLabelNode = null;

    /**
     * this the button enabled?
     * @type boolean
     */
    this.fEnabled  = true;
}
TextBox.prototype = new Widget();


/**
 * @class
 * a generic button whose content can (theoretically be any div element)
 * <p>
 * This is sort of an abstract class in the sense it expects derived classes
 * to implement {@link GenericButton#provideContent} method to provide real content.
 * @constructor
 * @param {boolean} toggleButton	(optional) is this a toggle button, false is default
 */
function GenericButton(toggleButton) 
{
    /**
     * get the DOM element of the button area
     * @return the DOM content element of the button area
     * @type DOMElement
     */
    this.getButton = function() { return this.fButtonContent; }

    /**
     * is the button selected (makes sense only for toggle buttons)
     */
    this.isSelected = function() { return this.fSelected; }

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
     * initialize - derived classes should call this to initialize
     * the button.
     *
     * @param {ActionHandler} actionHandler	action handler to call
     *						when button is selected
     * @param actionID				action id to pass to provider
     * @param label				(optional) if provided
     *						content is taken as provided
     *						text
     */
    this.initButton = function(actionHandler, actionID, label) {
	var table = document.createElement("table");
	table.style.padding = "0 0 0 0";
	table.style.margin = "0 0 0 0";
	table.style.borderCollapse = "collapse";
	table.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';

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
	var content = null;
	if( label ) {
	    content = document.createElement("div");
	    content.appendChild(document.createTextNode(label));
	}
	else
	    content = this.provideContent();
	if( content == null )
	    content = document.createTextNode("???");
	else {
	    content.id = Utils.getNewId("gbc");
	    Utils.addToIdMap(content, this); // content.view = this;
	}
	contentContainer.appendChild(content);
	contentContainer.id = Utils.getNewId("gbcc");
	Utils.addToIdMap(contentContainer, this); // contentContainer.view = this;
	this.fContainer = contentContainer;

	contentContainer.onmouseover  = _contentMouseOver;
	contentContainer.onmouseout   = _contentMouseOut;
	contentContainer.onmousedown  = _contentMouseDown;
	contentContainer.onclick      = _contentMouseClicked;

	this.fButtonContent = content;

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

	this.fOuter  = table;
	table.id = Utils.getNewId("gbt");
	Utils.addToIdMap(table, this);	// table.view      = this;

	if(actionHandler && actionHandler.doAction) {
	    this.fActionHandler = actionHandler;
            this.fActionID      = actionID;
	}
    }

    /**
     * called to change text color
     * @param {String} color	color of text as specifiable in a css style
     */
    this.setColor = function(color) {
	if(this.fContainer)
	    this.fContainer.style.color = color;
	this.setContentColor(color);
    }

    /**
     * called when text color changes, can be overridden to set context color
     * (if default setColor logic doesnt change everything)
     *
     * @param {String} color	color of text as specifiable in a css style
     */
    this.setContentColor = function(color) { }


    /**
     * set button state to selected/unselected
     * @param {boolean} val	indicates whether to select/deselect button
     */
    this.setSelected = function(val) {
	this.fSelected = val;
	if(this.fContainer) {
	    if( val ) {
		this.setColor("blue");
		this.fLeft.style.width = "3px";
		this.fRight.style.width = "1px";
	    }
	    else {
		this.setColor("black");
		this.fLeft.style.width = "2px";
		this.fRight.style.width = "2px";
	    }
	}
    }

    /**
     * set button state to enabled/disabled
     * @param {boolean} val	indicates whether to enable/disable button
     */
    this.setEnabled = function(val) {
	this.fEnabled = val;
	if(val ) {
	    if( this.fSelected )
		this.setColor("blue");
	    else
		this.setColor("black");
	    if( this.fButtonContent ) Utils.setOpacity(this.fButtonContent, 1.0);
	}
	else {
	    if( this.fButtonContent ) Utils.setOpacity(this.fButtonContent, 0.3);
	    this.setColor("gray");
	    this.fLeft.style.width = "2px";
	    this.fRight.style.width = "2px";
	}
    }

    /**
     * is the button enabled/disabled?
     * @type boolean
     */
    this.isEnabled = function() { return this.fEnabled; }

    /**
     * fire the action
     * @return true of button should remain selected (not toggle button)
     * @type
     * @private
     */
    this.fireAction = function() {
	if( this.fActionHandler )
	    return this.fActionHandler.doAction(this, this.fActionID);
	return false;
    }

    /**
     * called when mouse is pressed over the button content area
     * @private
     */
    function _contentMouseDown(e) {
	if(!e && event) e = event;
	var but = Utils.getObjForId(this); // this.view;
	if(!but) return;
	if( but.fToggleButton ) {
	    but.setSelected(!but.fSelected);
	    but.fireAction();
	    if( e && e.preventDefault )
		e.preventDefault();
	    return false;
	}
	else
	    but.setSelected(true);
    }

    /**
     * called when mouse is pressed and released over the button content area
     * @private
     */
    function _contentMouseClicked(e) {
	if(!e && event) e = event;
	var but = Utils.getObjForId(this); // this.view;
	if(!but) return;
	if( !but.fToggleButton ) {
	    but.setSelected(true);
	    // action is present call the action handler, and based on
	    // its resu
	    var leaveSelected;
	    if( but.fireAction() )
		leaveSelected = true;
	    else
		leaveSelected = false;
	    if( e && e.preventDefault )
		e.preventDefault();
	    return false;
	}
    }

    /**
     * called when mouse is enters the button content area
     * @private
     */
    function _contentMouseOver() {
	var but = Utils.getObjForId(this); // this.view;
	if(!but) return;
	if( but.fEnabled && !but.fSelected ) but.setColor("red");
    }

    /**
     * called when mouse is leaves the button content area
     * @private
     */
    function _contentMouseOut() {
	var but = Utils.getObjForId(this); // this.view;
	if(!but) return;
	if( but.fEnabled && !but.fSelected ) but.setColor("black");
    }

    /**
     * the DOM element of the button content area
     * @type DOMElement
     * @private
     */
    this.fButtonContent = null;

    /**
     * the DOM element of the container of the content area
     * @type DOMElement
     * @private
     */
    this.fContainer = null;

    /**
     * indicates if the button is selected
     * @type boolean
     */
    this.fSelected = false;

    /**
     * is this a toggle button?
     * @type boolean
     */
    this.fToggleButton = toggleButton;

    /**
     * this the button enabled?
     * @type boolean
     */
    this.fEnabled  = true;

}
GenericButton.prototype = new Widget();

/**
 * @class
 * represents a button, which can then be placed in toolbar or a form
 */
function Button() 
{
    /**
     * initialize the button
     * 
     * @param {ActionHandler} actionHandler	action handler to call
     *						when button is selected
     * @param actionID				action id to pass to provider
     * @param {String} label	label of the button
     * @param {String} w	(optional) width of the button as a string specifiable
     *				in a css style
     */
    this.initButton = function(actionHandler, actionID, label, w) {
	var i = document.createElement("input");
	i.type = "button";
	if( w )
	    i.style.width = width;
	i.value = label;
	i.id    = Utils.getNewId("but");
	Utils.addToIdMap(i, this); // i.view  = this;
	i.onclick  = this._contentMouseClicked;
	this.fOuter = i;
	this.fActionHandler = actionHandler;
	this.fActionID      = actionID;
    }

    /**
     * called when mouse is leaves the button content area
     * @private
     */
    function _contentMouseOut() {
	var but = Utils.getObjForId(this);	// this.view;
	if(but)
	    but.fActionHandler.doAction(but, but.fActionID);
    }

}
Button.prototype = new Widget();


/**
 * @class
 * represents a checkbox (with associated text), which can 
 * then be placed in toolbar or a form
 */
function CheckBox() 
{
    /**
     * get the DOM element of the checkbox input item
     * @type DOMElement_Input
     */
    this.getCheckBox = function() { return this.fCheckBox; }

    /**
     * initialize the checkbox
     * @param {String} label	label of the checkbox
     * @param {String} w	(optional) width of the checkbox as a string specifiable
     *				in a css style
     */
    this.init = function(label, width) {
	var div = document.createElement("div");
	if( width )
	    div.style.width = width;

	var i = document.createElement("input");
	i.type = "text";
	i.type = "checkbox";
	div.appendChild(i);

	var ldiv = document.createElement("div")
	ldiv.style.textAlign = "right";
	div.appendChild(ldiv);

	this.fOuter = div;
	this.fCheckBox = i;
    }

    /**
     * the DOM element of the checkbox input item
     * @type DOMElement_Input
     * @private
     */
    this.fCheckBox = null;
}
CheckBox.prototype = new Widget();

/**
 * @class
 * represents combo box arrow
 */
function ComboBoxArrow(comboBox)
{
    /**
     * implementation of {@link GenericButton#provideContent}
     */
    this.provideContent = function() {
	arrow = document.createElement("div");
	arrow.style.width = "11px";
	arrow.style.height = "1em";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	return arrow;
    }

    /**
     * implementation of {@link ActionHandler} to handle action when
     * arrow is clicked on - we simply call {@link ComboBox@arrowClicked}
     * @private
     */
    this.doAction  = function(actionID) {
	if( this.fComboBox )
	    this.fComboBox.arrowClicked();
    }

    this.initButton(this,null);

    /**
     * the combo box to which this arrow is associated with
     * @type {ComboBox}
     * @private
     */
    this.fComboBox = comboBox;
}
ComboBoxArrow.prototype = new GenericButton();

/**
 * @class
 * represents a combo box (warning: not yet fully implemented)
 */
function ComboBox() 
{
    /**
     * get the DOM element of the text-box that is part of the combo-box
     * @type DOMElement_Input
     */
    this.getTextBox = function() { return this.fTextBox; }

    /**
     * initialize the combobox
     * @param {Array} menu      menu to bring-up when arrow is checked on
     * @param {String} width	width of the text-box as a string specifiable
     *				in a css style
     */
    this.init = function(menu, width) {
	var d = document.createElement("div");
	if( !Utils.isIE() )		// IE doesnt support table
	    d.style.display  = "table";	// very important for firefox so that arrow
	d.style.height   = "1.5em";	// give some height

	var i = document.createElement("input");
	i.type = "text";
	i.style.fontSize = "100%";// so it scales with the browse text size (liquid design)
	i.style.width = width;
	if( label )
	    i.style.textAlign = "left";
	i.style.display  = "inline";
	i.style.cssFloat = "left";
	i.setAttribute("autocomplete","off");	// supposedly gets around mozilla bug about permission denied
						// when we set focus - found by browsing web
	d.appendChild(i);

	var arrow = new ComboBoxArrow(this);
	d.appendChild(arrow.getContent());

	this.fOuter = d;
	this.fTextBox = i;
	this.fMenu = menu;
    }

    /**
     * called by {@link ComboBoxArrow}, when the arrow is clicked
     */
    this.arrowClicked = function() {
	if( this.fMenu ) {
	    var obj = this.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fMenu.show(x,y);
	}
    }
}
ComboBox.prototype = new Widget();

/**
 * @class
 * represents a tool bar (horizontal)
 */
function ToolBar(parent, hidden, ht) 
{
    /**
     * get the DOM content of the toolbar
     * @return DOMElement
     */
    this.getContent = function() { return this.fOuter; }

    /**
     * add a DOM item
     * @param {DOMElement} content	widget
     * @param {String}    width		(optional) the width of item as
     *					specifiable in a css style
     */
    this.addDOMItem = function(content, width) {
	return this._addItem(content, width);
    }

    /**
     * (internal) add item
     * @param {DOMElement} content	widget
     * @param {String}    width		(optional) the width of item as
     *					specifiable in a css style
     * @private
     */
    this._addItem = function(content, width) {
	var tr = this.fTable.rows[0];
	var idx = 0;
	if( tr.cells && tr.cells.length > 0 )  {
	    idx = tr.cells.length;
	}
	var td = tr.insertCell(idx);
	td.style.padding = "0 0 0 0";
	td.style.fontSize = "85%";
	td.style.fontWeight = "bold";
	if( width ) td.style.width = width;
	td.appendChild(content);
	return td;
    }

    /**
     * add a widget as an item to toolbar
     * @param {Widget} widget		widget
     * @param {String}    width		(optional) the width of item as
     *					specifiable in a css style
     */
    this.addItem = function(widget, width) {
	if( !widget.getContent ) { alert("addItem: not a widget: " + widget); return; }
	td = this._addItem(widget.getContent(), width);
	td.id = Utils.getNewId("tbi");
	Utils.addToIdMap(td, widget); // td.view = widget;
    }

    /**
     * add a spacer (occupies space) item to the toolbar
     * @param {String}    width		the width of the space as
     *					specifiable in a css style
     */
    this.addSpacer = function(width) {
	var tr = this.fTable.rows[0];
	if( tr.cells && tr.cells.length > 0 )  {
	    tr.cells[tr.cells.length-1].style.paddingRight = width;
	}
    }


    /**
     * (internal) initializer
     * @param {DOMElement} parent	the parent DOM element under which the
     *					toolbar is rendered
     * @param {boolean}  hidden		is the toolbar initially hidden
     * @param {boolean}  plainBottom	does the toolbar have plain or 3d bottom border?
     * @param {String}   ht		(optional) the height of the toolbar
     *					as specifiable in a css style
     */
    this._init = function(parent, hidden, plainBottom, ht) {
	var tb = document.createElement("div");
	tb.style.background = LookAndFeel.url("bkgnd.png") + " repeat";
	if( ht )
	    tb.style.height = ht;

	tb.style.padding = "0 0 0 0";
	tb.style.width   = "100%";

	var top = document.createElement("div");
	top.style.background = LookAndFeel.url("bkgnd_top.png") + ' repeat';
	top.style.height = "4px";
	top.style.width = "100%";
	top.style.overflow = "hidden";
	tb.appendChild(top);

	var tbl = document.createElement("table");
	tbl.style.padding = "0 0 0 0";
	tbl.style.borderCollapse = "collapse";
	tbl.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	tbl.style.marginLeft = "0.2em";
	tbl.style.marginRight = "0.2em";
	this.fTable = tbl;
	this.fTable.insertRow(0);
	tb.appendChild(this.fTable);

	var top = document.createElement("div");
	if( plainBottom ) {
	    top.style.background = LookAndFeel.url("bkgnd_png") + ' repeat';
	    top.style.borderBottom = "thin solid #444444";
	    top.style.height = "1px";
	}
	else {
	    top.style.background = LookAndFeel.url("bkgnd_bot.png") + ' repeat';
	    top.style.height = "4px";
	}
	top.style.width = "100%";
	top.style.overflow = "hidden";
	tb.appendChild(top);

	if( hidden ) {
	    tb.style.display      = "none";
	}
	this.fOuter = tb;
	this.fOuter.className = "ToolBar";
	this.fOuter.setAttribute( "class", "ToolBar");
	this.fOuter.setAttribute( "className", "ToolBar");
	parent.appendChild(tb);
    }

    /**
     * show the toolbar
     */
    this.show = function() {
	this.fOuter.style.display = "block";
    }

    /**
     * hide the toolbar
     */
    this.hide = function() {
	this.fOuter.style.display = "none";
    }

    /**
     * the table 
     * @type DOMElement_TABLE
     * @private
     */
    this.fTable = null;
 
    this._init(parent, hidden, ht);
}
ToolBar.prototype = new Widget();

function onFormTitleMouseDown(e)
{
    var form = Utils.getObjForId(this); // this.view;
    if(!e ) e = event;
    form.onFormTitleMouseDown(e);
}

function onFormTitleMouseUp(e)
{
    var form = Utils.getObjForId(this); // this.view;
    form.onFormTitleMouseUp(e);
}

function onFormTitleMouseDrag(e)
{
    var form = Utils.getObjForId(this); // this.view;
    form.onFormTitleMouseDrag(e);
}

/**
 * @class
 * represents a form
 * <p>
 * Sort of abstract in the sense, it is expected to be derived from and 
 * derived classes should implement {@link Form#provideContent} to provide
 * content for the form
 */
function Form() 
{
    /**
     * get the DOM content of the entire button
     * @return the DOM content of the entire button
     * @type DOMElement
     */
    this.getContent = function() { return this.fOuter; }

    /**
     * called to provide content - derived classes are expected to override
     * this
     * @return the DOM element representing the form content
     * @type DOMElement
     */
    this.provideContent = function() {
	return null;
    }

    /**
     * initialize - derived classes should call this to initialize
     * the form
     * @param {DOMElement} parent	the parent DOM element under which the
     *					toolbar is rendered
     * @param {boolean}  hidden		is the toolbar initially hidden
     * @param {String}   ht		(optional) the height of the toolbar
     *					as specifiable in a css style
     */
    this.initForm = function(parent, hidden, ht, title) {
	var table = document.createElement("table");
	table.style.padding = "0 0 0 0";
	table.style.margin = "0 0 0 0";
	table.style.borderCollapse = "collapse";
	table.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	table.style.position = "absolute";
	table.style.zIndex = LookAndFeel.ZINDEX_FORM;
	table.id                = Utils.getNewId("frmt");
	table.onmousemove       = onFormTitleMouseDrag;
	table.onmouseup  	= onFormTitleMouseUp;
	if( ht ) table.style.height = ht;


	var row = 0;

	var titleRow  = table.insertRow(0);
	var titletd = titleRow.insertCell(0);
	this.fTitleCell = titletd;


	var topRow = table.insertRow(row++);
	var td = topRow.insertCell(0);
	td.colSpan = 3;
	td.style.background = LookAndFeel.url("form_top.png") + ' repeat-x';
	td.style.height      = "2px";
	td.style.overflow    = "hidden";
	td.style.background  = LookAndFeel.url("highlight.png") + ' repeat';
	td.style.textAlign   = "center";
	td.style.fontWeight  = "bold";
	td.style.color       = "#FFFFFF";
	td.style.padding     = "5 5 5 5";
	td.style.cursor      = "default";
	td.id      = Utils.getNewId("frmt");
	Utils.addToIdMap(td, this); //	content.view = this;
	td.onmousedown 	= onFormTitleMouseDown;
	if(!title) title = "";
	td.appendChild(document.createTextNode(title));

	var midRow = table.insertRow(row++);
	var left = midRow.insertCell(0);
	left.style.background = LookAndFeel.url("form_left.png") + ' repeat-y';
	left.style.width      = "2px";
	left.style.height      = "100%";
	this.fLeft = left;

	var contentContainer = midRow.insertCell(1);
	contentContainer.style.padding = "0 0 0 0";
	contentContainer.style.background = LookAndFeel.url("bkgnd.png") + ' repeat';
	contentContainer.style.overflow = "auto";
	var content = this.provideContent();
	if( content == null )
	    content = document.createTextNode("???");
	else {
	    content.id   = Utils.getNewId("frmc");
	    Utils.addToIdMap(content, this); //	content.view = this;
	}
	contentContainer.appendChild(content);
	contentContainer.id = Utils.getNewId("frmcc");
	Utils.addToIdMap(contentContainer, this); // contentContainer.view = this;

	var right = midRow.insertCell(2);
	right.style.background = LookAndFeel.url("form_right.png") + ' repeat-y';
	right.style.width      = "2px";
	right.style.height      = "100%";
	this.fRight = right;

	var botRow = table.insertRow(row++);
	var btd = botRow.insertCell(0);
	btd.colSpan = 3;
	btd.style.background = LookAndFeel.url("form_bot.png") + ' bottom repeat-x';
	btd.style.height      = "2px";
	btd.style.overflow    = "hidden";
	this.fBottom= btd;

	this.fOuter  = table;
	table.id   = Utils.getNewId("frmt");
	Utils.addToIdMap(table, this);	// table.view      = this;

	if( hidden ) {
	    table.style.display      = "none";
	}
	parent.appendChild(table);
    }

    /**
     * show this form at a certain position
     * @param {int} x	x position (pixel)
     * @param {int} y	y position (pixel)
     */
    this.show = function(x, y, showLast) {
	var dontCenter = false;
    	if(showLast && this.fLastX != null ) {
	    x = this.fLastX;
	    y = this.fLastY;
	    dontCenter = true;
	}
	x += document.body.scrollLeft;
	this.fOuter.style.left = x;
	this.fOuter.style.top = y;
	this.fOuter.style.visibility = "visible";
	this.onShow();
	EventManager.postEvent(EventManager.EVENT_FORM_OPENED, this, dontCenter);
    }

    /**
     * hide this form
     */
    this.hide = function() {
	this.fOuter.style.visibility = "hidden";
	EventManager.postEvent(EventManager.EVENT_FORM_CLOSED, this);
    }

    /**
     * (protected) called when form is shown - derived classes can override this to
     * provide any initialization logic
     * @private
     */
    this.onShow = function() {
    }

    this.onFormTitleMouseDown = function(e)
    {
	if( this.click ) return;
	if(!e ) e = event;
	this.click = true;
	this.clickX = e.screenX;
	this.clickY = e.screenY;
	var outer = this.getContent();
	this.posX = parseInt(outer.style.left);
	this.posY = parseInt(outer.style.top);
	if (Utils.isIE()) {
	    e.returnValue = false;
	    e.cancelBubble = true;
	} else
	    e.preventDefault();
    }

    this.onFormTitleMouseUp = function(e)
    {
	if(!e ) e = event;
	this.click = false;
	if (Utils.isIE()) {
	    e.returnValue = false;
	    e.cancelBubble = true;
	} else
	    e.preventDefault();
    }

    this.onFormTitleMouseDrag = function(e)
    {
	if(!this.click) return;

	if(!e ) e = event;
	
	var outer = this.getContent();
	var dx = e.screenX - this.clickX
	var dy = e.screenY - this.clickY;
	outer.style.left = this.posX + dx; 
	outer.style.top  = this.posY + dy;
	this.fLastX = outer.style.left;
	this.fLastY = outer.style.top;
	if (Utils.isIE()) {
	    e.returnValue = false;
	    e.cancelBubble = true;
	} else
	    e.preventDefault();
    }

    /**
     * the DOM content of the entire form
     * @type DOMElement
     * @private
     */
    this.fOuter = null;

    this.fLastX = null;		/* last X position */
    this.fLastY = null;		/* last Y position */
}
Form.prototype = new Widget();
