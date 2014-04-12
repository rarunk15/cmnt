/**
 * @fileoverview
 * font.js contains classes that deal with font selection and management
 */

/**
 * @class
 * represent state of font as to whether it is installed or not
 */
function FontState()
{
}
/**
 * font is installed on the client computer
 */
FontState.prototype.INSTALLED_YES 	   = 1;
/**
 * font is not installed on the client computer
 */
FontState.prototype.INSTALLED_NO  	   = 0;
/**
 * Not known whether font is installed or not on the client computer
 */
FontState.prototype.INSTALLED_DONTKNOW  = -1;

/**
 * represents a font
 * @constructor
 * @param {String} 	 name		name of the font
 * @param {FontState}    installed	whether font is installed
 */
function Font(name, installed) 
{
    /**
     * name of the font
     * @type String
     */
    this.fName = name;

    /**
     * whether font is installed
     * @type int
     * @private
     */
    this.fInstalled = installed;
}
Font.prototype = new FontState();	// inherit the state macros

/**
 * @class
 * represents a object that tracks progress of font installation process
 */
function FontStateProgress() 
{
    /**
     * called to indicate progress
     * @param {int} pct	 percentage complete
     */
    this.onProgress = function(pct) {
    }
}

/**
 * @class
 * represents the font manager
 */
function FontManagerDefn()
{
    /**
     * (internal) method to add a font to a list of known fonts
     * @param {String} name	name of font e.g. "Courier" "Lucida Console"
     * @param {FontState}    installed	whether font is installed
     */
    this._addFont = function(name, installed) {
	if( !installed ) installed = FontState.prototype.INSTALLED_DONTKNOW;
	this.fFontList[this.fFontList.length]  = new Font(name, installed);
    }

    this.loadDefaultFonts = function() {
	this._addFont( "Arial" );
	this._addFont( "Times New Roman" );
	this._addFont( "Helvetica" );
	this._addFont( "Century" );
	this._addFont( "Lucida" );
	this._addFont( "Lucida Console" );
	this._addFont( "Courier" );
	this._addFont( "Courier New" );
	this._addFont( "Verdana" );
	this._addFont( "junkish" );
    }

    /**
     * generic routine that update the states of fonts that are added but whose install
     * state we dont know of
     * @param	{DOMElement} parent	a dom-element under which this routine
     *					needs to temporarily add elements to detect
     *					which fonts are installed
     * @param	{Array}	     fonts	Array of {@link Font} objects - the entries
     *					in this array whose state is {@FontState#INSTALLED_DONTKNOW}
     *					would be updated on return
     * @param 	{FontStateProgress} progress (optional) a progress monitor
     */
    this.updateFontStates = function(parent, fonts, progress) {
	parent = document.body;

	/*
	 * for each font to check, we create 2 span items one courier and other which
	 * our font (with altermate as courier). If the widths of the 2 are same,
	 * font is not installed, if it is not, is installed
	 */
	var teststr = "font existence test With VARIOUS 985 iMLj";
	var span = document.createElement("div");
	span.style.position = "absolute";
	span.style.visibility = "hidden";
	//span.style.width = "30";
	span.style.fontSize  = "12pt";
	span.style.fontFamily = "Courier";
	span.appendChild(document.createTextNode(teststr));
	parent.appendChild(span);


	var w1 = (Utils.isSafari())? span.offsetWidth : span.scrollWidth;

	var nFonts = fonts.length;
	var pct = 0;
	if( progress) progress.onProgress(pct);
	for(var i = 0; i < nFonts; i++ )
	{
	    var font = fonts[i];
	    if( font.fName == "Courier" ) 
		font.fInstalled = font.INSTALLED_YES;
	    else if(font.fInstalled == font.INSTALLED_DONTKNOW ) {
		var spanx = document.createElement("div");
		spanx.style.position = "absolute";
		spanx.style.visibility = "hidden";
		//spanx.style.width = "30";
		spanx.style.fontSize  = "12pt";

		spanx.style.fontFamily = '"' + font.fName + '"' + ',"Courier"';
		spanx.appendChild(document.createTextNode(teststr));
		parent.appendChild(spanx);

		var w2 = spanx.offsetWidth;
		if( w2 == w1 )
		    font.fInstalled = font.INSTALLED_NO;
		else
		    font.fInstalled = font.INSTALLED_YES;

		//alert( spanx.style.fontFamily + ": " + font.fInstalled + "( " + w2 + " vs " + w1 + ")" );
		parent.removeChild(spanx);
	    }
	    pct = parseInt((i*100.0)/nFonts);
	    if( progress) progress.onProgress(pct);
	}
	if( progress) progress.onProgress(100);
    }

    /**
     * get the list of fonts, the font manager knows about currently
     */
    this.getFonts = function() {
	return this.fFontList;
    }

    /**
     * list of fonts the font manager knows about currently
     */
    this.fFontList = new Array();
    this.loadDefaultFonts();
}

/**
 * the font manager
 */
var FontManager = new FontManagerDefn();


/**
 * @class
 * represents the form that allows a user to type in a font name, which
 * is then checked as to whether it is installed or not and then added
 * to the system
 */
function AddFontForm() 
{
    /**
     * implementation of {@link Form#onShow}
     */
    this.onShow = function() {
	this.fFontTextBox.focus();
    }

    /**
     * implementation of {@link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( actionID == "ok" ) {
	    if( this.fFontTextBox.value == "" )
		alert("Please specify a font");
	    else {
		var fonts = new Array();
		fonts[fonts.length] = new Font( this.fFontTextBox.value, Font.prototype.INSTALLED_DONTKNOW);
		FontManager.updateFontStates(this.getContent(), fonts, null);
		if( fonts[0].fInstalled == Font.prototype.INSTALLED_NO ) {
		    var msg = "Font '" + fonts[0].fName + "' is not installed on your computer";
		    alert(msg);
		}
		else {
		    EventManager.postEvent(EventManager.EVENT_FONT_ADDED, fonts[0].fName, fonts[0].fName);
		    this.hide();
		}
	    }
	}
	else if( actionID == "cancel" ) {
	    this.hide();
	}
    }

    /**
     * override of {@link Form#provideContent} to provide content of
     * the form
     */
    this.provideContent = function() {
	/* 
	 * turned out to be a nighmare to lay this out. Decided on table
	 * # top row is instruction message
	 * # next row is font name label + input text box (both enclosed in a div)
	 * # next row is ok and cancel button with some space between (all enclosed
	 *   in a table, which is then centered in the table row)
	 */
	 
	var tbl = document.createElement("table");

	var maxCells = 1;

	var tr1 = tbl.insertRow(0);
	var div = document.createElement("div");
	div.style.wordWrap = "break-word";
	div.style.width    = "30em";
	div.style.color    = "green";
	div.appendChild(document.createTextNode("Please specify the name of a font installed on your computer. You may look up the installed fonts from your browser font selection dialog, or any other program which allows you to select a font"));
	var td = Utils.addTableCell(tr1, div, maxCells);
	td.style.paddingBottom = "0.5em"; // add bottom spacer

	var tr2 = tbl.insertRow(1);


	var fn = document.createElement("div");

	var lbl = document.createElement("div");
	lbl.style.fontWeight = "bold";
	lbl.style.width      = "6em";
	lbl.style.display    = "inline";
	lbl.style.cssFloat     = "left";
	lbl.appendChild(document.createTextNode("Font Name: "));
	fn.appendChild(lbl);


	var i = document.createElement("input");
	i.type           = "text";
	i.style.fontSize = "100%";// so it scales with the browse text size (liquid design)
	i.style.width    = "22em";
	i.style.textAlign = "left";
	i.style.display   = "inline";
	i.style.cssFloat  = "right";
	fn.appendChild(i);
	this.fFontTextBox = i;

	var td21 = Utils.addTableCell(tr2, fn, 1);
	td21.style.textAlign = "left";
	td21.style.paddingBottom = "0.5em"; // add bottom spacer

	var tr3 = tbl.insertRow(2);
	var center = document.createElement("center");
	var div3 = document.createElement("table");
	div3.style.width = "10em";
	div3.style.textAlign = "center";

	var t = div3.insertRow(0);
	var ok = new GenericButton();
	ok.initButton(this, "ok", "OK");
	ok.getContent().style.fontWeight = "bold";
	ok.getContent().style.width = "4em";
	ok.getContent().style.textAlign = "center";
	Utils.addTableCell(t, ok.getContent(), 1 );

	var sp = document.createElement("div");
	sp.style.width = "1em";
	Utils.addTableCell(t, sp, 1 );

	var cancel = new GenericButton();
	cancel.initButton(this, "cancel", "Cancel");
	cancel.getContent().style.fontWeight = "bold";
	cancel.getContent().style.width = "4em";
	cancel.getContent().style.textAlign = "center";
	Utils.addTableCell(t, cancel.getContent(), 1 );
	center.appendChild(div3);

	var td3 = Utils.addTableCell(tr3, center, maxCells);

	return tbl;
    }
}
AddFontForm.prototype = new Form();

/**
 * @class
 * represents a menu item in the font menu - it represents a font
 */
function FontMenuItem(font) 
{
    /**
     * override of {@link MenuItem#provideContent} to provide content
     * of the menu item
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontFamily = '"' + this.fFont + '"';
	div.style.textAlign = "left";
	div.appendChild( document.createTextNode(this.fFont) );
	return div;
    }

    /**
     * the font name
     * @type String
     * private
     */
    this.fFont = font;
}
FontMenuItem.prototype = new MenuItem();

/**
 * @class
 * represents a menu of selectable fonts. 
 * <p>
 * The menu is usable only after {@link FontMenu#init} is called, to which an 
 * {@link ActionHandler} must be provided. This action handler will be called
 * when a font is selected The actionID is the font name, but if it is "", it
 * implies user selected default font.
 */
function FontMenu() 
{
    /**
     * implementation of {@link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_FONT_ADDED ) {
	    var font = src;
	    /*
	     * if we get this event, then that means that a new font
	     * was specified by user (and he has selected it). So we 
	     * add it to our menu item but we also tell our action 
	     * handler that the user has selected the new font
	     */
	    var svFontMenuItems = this.fFontMenuItems;
	    var newFontMenuItems = new Array();
	    var nFonts = svFontMenuItems.length;
	    var i;
	    var added = false;
	    for(i = 0; i < nFonts; i++ ) {
		if( svFontMenuItems[i].font == font )  {
		    return;
		}
		else if ( !added && svFontMenuItems[i].font > font ) {
		    var midx = newFontMenuItems.length;

		    newFontMenuItems[midx] = new Object();
		    newFontMenuItems[midx].font =  font;
		    var m = new FontMenuItem(font);
		    newFontMenuItems[midx].item =  m;
		    // insert a menu item making us as the action handler (we will
		    // handle the "Other..." if necessary before pass on action to
		    // the real action handler
		    this.insertItem(m, svFontMenuItems[i].item, this, font);

		    newFontMenuItems[newFontMenuItems.length]=  svFontMenuItems[i];
		    added = true;
		}
		else
		    newFontMenuItems[newFontMenuItems.length] =  svFontMenuItems[i];
	    }
	    this.fFontMenuItems = newFontMenuItems;
	    if( this.fActionHandler ) {
		this.fActionHandler.doAction(this, font);
	    }
	}
    }

    /**
     * implementation of {@link ActionHandler} interface - called when
     * a font menu item is selected
     */
    this.doAction = function(src, actionID) {
	var font = actionID;
	if( font == "" ) {
	    /*
	     * user selected "Other ...", put up AddFont form. When
	     * user specifies a font there, it will trigger a FONT_ADDED
	     * event which we will catch in our event handler (and
	     * we will pass it on to fActionHandler
	     */
	    var form = new AddFontForm();
	    form.initForm(document.body);
	    var obj = document.body;
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj);
	    form.show(x,y);
	    return;
	}

	if( font == "Default")
	    font = "";

	if( this.fActionHandler ) {
	    this.fActionHandler.doAction(this, font);
	}
    }

    /**
     * implementation of {@link FontStateProgress} interface
     * @private
     */
    this.onProgress = function(pct) {
	    if(pct == "100") 
		this.onFontsEnumerated();
    }

    /**
     * called when all fonts have been enumerated
     * @private
     */
    this.onFontsEnumerated = function() {
    	var fontList = FontManager.getFonts();
	var nFonts = fontList.length;
	var lfontList = new Array();
	var i;
	for(i = 0; i < nFonts; i++ )
	{
	    var font = fontList[i];
	    if( font.fInstalled == font.INSTALLED_YES )
	    	lfontList[lfontList.length] = font.fName;
	}
	lfontList.sort();

	nFonts = lfontList.length;

	this.fFontMenuItems  = new Array();

	/*
	 * insert menu items making us as the action handler (we will
	 * handle the "Other..." if necessary before pass on action to
	 * the real action handler
	 */
	this.addItem(new  FontMenuItem("Default"), this, "Default");
	var midx;
	for(var i = 0; i < nFonts; i++ ) {
	    midx = this.fFontMenuItems.length;

	    this.fFontMenuItems[midx] = new Object();
	    this.fFontMenuItems[midx].font = lfontList[i];
	    var m = new FontMenuItem(lfontList[i]);

	    this.addItem(m, this, lfontList[i]);
	    this.fFontMenuItems[midx].item = m;
	}
	this.addItem(new  FontMenuItem("Other ..."), this, "");
    }

    /**
     * initialize the menu - menu is usable only after this is called.
     * <p>
     * Note that this is different from {@link Menu#initMenu} which initialized
     * the menu display. This method updates the font states and makes the
     * menu item reflect that. This method must be called <b>after</b>
     * {@link Menu#initMenu} is called.
     *
     * @param {ActionHandler} actionHandler	the action handler which will 
     *						be called when a font is
     *						selected (actionID is the font
     *						name, "" implies user selected
     *						default font)
     */
    this.init = function(actionHandler) {
	this.fActionHandler = actionHandler;
	if( !this.fEnumerated ) {
	    this.fEnumerated = true;
	    FontManager.updateFontStates(this.getContent(), FontManager.getFonts(), this);
	}
	else
	    this.onFontsEnumerated();
    }

    /**
     * have we enumerated all the existing fonts to determine their
     * font states?
     * @type boolean
     * @private
     */
    this.fEnumerated = false;

    EventManager.addListener(EventManager.EVENT_FONT_ADDED, this);

    /**
     * An array representing font menu items {@link FontMenuItem}
     * @type Array
     * @private
     */
    this.fFontMenuItems = null;

    /**
     * the action handler called when font is selected
     */
    this.fActionHandler = null;
}
FontMenu.prototype = new Menu();
