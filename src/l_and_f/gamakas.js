
function VerticalCompositeGamaka(shortName, name, gamaka1, gamaka2)
{
    this.setShortName(shortName);
    this.setName(name);
    this.fHeight = 0;
    this.fGamaka1 = gamaka1;
    this.fGamaka2 = gamaka2;
    this.isComposite = true;
    this.isVerticalComposite = true;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
	if( this.fGamaka1.fState == GamakaStates.INSTALLED_YES ) {
	    var d = document.createElement("div");
	    d.addChild(this.fGamaka1.render(swara));
	    d.addChild(this.fGamaka2.render(swara));
	    //d.appendChild(img);
	}
	else {
	    var d = document.createElement("div");
	    var d1 = 
	    div.style.fontFamily = swara.getDefaultFont();
	    // font size?
	    div.style.color      = swara.getDefaultFontColor();
	    d.appendChild(document.createTextNode(this.fShortName));
	}
	return d;
    }

    this.getHeight = function() { 
	return this.fGamaka1.getHeight() + this.fGamaka2.getHeight(); 
    }

    this.getWidth = function() { 
        var w = this.fGamaka1.getWidth();
	if( w > this.fGamaka2.getWidth() ) 
	     return w;
        else
	    return this.fGamaka1.getWidth();
    }


    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function(swara) {
	if( this.fGamaka1.fState == GamakaStates.INSTALLED_YES && 
		this.fGamaka2.fState == GamakaStates.INSTALLED_YES ) {
	    var s = new Array();
	    var i = 0;
	    var topHeight = 0;

	    if( this.fTotalHeight /*&& this.fTotalHeight > this.getHeight()*/ ) {
	    	topHeight = this.fTotalHeight - this.fGamaka2.getHeight();
	    }
	    s[i] = '<div style="text-align:top;padding:0 0 0 0;';
	    if( topHeight )
	    	s[i] += 'height:' + topHeight + 'px;';
	    s[i++] += '">';
	    s[i++] = this.fGamaka1.renderAsHTML(swara);
	    s[i++] = "</div>";
	    if( this.fOctaveAdjust ) {
		s[i++] = '<div style="background-color:red;text-align:top;padding:0 0 0 0;height:';
		s[i++] = this.fOctaveAdjust;
		s[i++] = '">';
		s[i++] = '</div>';
	    }
	    if( this.fGamaka2.getHeight() ) {
		s[i++] = '<div style="height:';
		s[i++] = this.fGamaka2.getHeight();
		s[i++] = ';padding:0 0 0 0;">';
		s[i++] = this.fGamaka2.renderAsHTML(swara);
		s[i++] = "</div>";
	    }
	    return s.join("");
	}
	else {
	    return "";
	    //return '<span style="padding:0 0 0 0;">' + this.fShortName + '</span>';
	}
    }

    this.adjustForTotalHeight = function(h) {
	    this.fTotalHeight = h;
    }

    this.canAdjustForOctave = function() {
    	return true;
    }

    this.adjustForOctave = function(stayiht) {
    	this.fOctaveAdjust = stayiht;
    }

    this.fTotalHeight = 0;
    this.fOctaveAdjust = 0;
}
VerticalCompositeGamaka.prototype = new Gamaka(GamakaTypes.VERTICALCOMPOSITE);

function SpanningSlideContGamaka(shortName, name, isUp, predef )
{
    /**
     * get the url
     */
    this.url = function() {
        return LookAndFeel.srcurl(this.fURL);
    }
    this.setShortName(shortName);
    this.setName(name);
    this.fURL = ((isUp) ? 'gamaka_up_cont.png' : 'gamaka_down_cont.png');
    this.fPredefined = predef;
    this.fHeight = 0;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var img = document.createElement("img");
	    img.src = this.url();
	    d = img;
	    //d.appendChild(img);
	}
	else {
	    var d = document.createElement("div");
	    div.style.fontFamily = swara.getDefaultFont();
	    // font size?
	    div.style.color      = swara.getDefaultFontColor();
	    d.appendChild(document.createTextNode(this.fShortName));
	}
	return d;
    }

    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var s = new Array();
	    var i = 0;
	    s[i++] = '<table style="padding:0 0 0 0;border-collapse:collapse;width:100%;">';
	    s[i++] = '<tr>';
	    s[i++] = '<td style="padding:0 0 0 0;height:';
	    s[i++] = this.fHeight;
	    s[i++] = "px;background-image:url('";
	    s[i++] = this.url();
	    s[i++] = "');";
	    s[i++] = 'background-repeat:repeat-x;">';
	    s[i++] = '<img ';
	    s[i++] = 'src="';
	    s[i++] = this.url();
	    s[i++] = '"></img>';
	    s[i++] = "</td>";
	    s[i++] = "</tr>";
	    s[i++] = "</table>";
	    return s.join("");
	}
	else {
	    return "";
	    //return '<span style="padding:0 0 0 0;">' + this.fShortName + '</span>';
	}
    }

    this.adjustForTotalHeight = function(h) {
	    ; // not supported - dont know how to bottom align
    }

    this.fTotalHeight = 0;
}
SpanningSlideContGamaka.prototype = new Gamaka(GamakaTypes.IMAGE);

function SpanningSlideGamaka(shortName, name, isUp, isStart, predef)  
{
    /**
     * get the url
     */
    this.url = function() {
        return LookAndFeel.srcurl(this.fURL);
    }
    this.setShortName(shortName);
    this.setName(name);
    if( isUp )
	this.fURL = ((isStart) ? 'gamaka_up_cont.png' : 'gamaka_up_end.png');
    else
	this.fURL = ((isStart) ? 'gamaka_down_cont.png' : 'gamaka_down_end.png');

    this.fIsStart    = isStart;
    this.fIsUp       = isUp;
    this.fPredefined = predef;
    this.fHeight = 0;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var img = document.createElement("img");
	    img.src = this.url();
	    d = img;
	    //d.appendChild(img);
	}
	else {
	    var d = document.createElement("div");
	    div.style.fontFamily = swara.getDefaultFont();
	    // font size?
	    div.style.color      = swara.getDefaultFontColor();
	    d.appendChild(document.createTextNode(this.fShortName));
	}
	return d;
    }

    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var s = new Array();
	    var i = 0;
	    s[i++] = '<table style="padding:0 0 0 0;border-collapse:collapse;width:100%;">';
	    s[i++] = '<tr>';
	    s[i++] = '<td style="padding:0 0 0 0;height:';
	    s[i++] = this.fHeight;
	    s[i++] = "px;background-image:url('";
	    if( this.fIsUp )
		s[i++] = LookAndFeel.srcurl('gamaka_up_cont.png');
	    else
		s[i++] = LookAndFeel.srcurl('gamaka_down_cont.png');
	    s[i++] = "');";
	    s[i++] = 'background-repeat:repeat-x;">';
	    s[i++] = '<img ';
	    if( !this.fStart )
		s[i++] = 'style="float:right;" ';
	    s[i++] = 'src="';
	    s[i++] = this.url();
	    s[i++] = '"></img>';
	    s[i++] = "</td>";
	    s[i++] = "</tr>";
	    s[i++] = "</table>";
	    return s.join("");
	}
	else {
	    return "";
	    //return '<span style="padding:0 0 0 0;">' + this.fShortName + '</span>';
	}
    }

    this.adjustForTotalHeight = function(h) {
	    ; // not supported - dont know how to bottom align
    }

    this.fTotalHeight = 0;
}
SpanningSlideGamaka.prototype = new Gamaka(GamakaTypes.IMAGE);

function ImageGamaka(shortName, name, val, predef)  
{
    /**
     * get the url
     */
    this.url = function() {
	if( this.fPredefined)
	    return LookAndFeel.srcurl(this.fURL);
	else
	    return this.fURL;
    }

    this.setShortName(shortName);
    this.setName(name);
    this.fURL = val;
    this.fPredefined = predef;
    this.fHeight = 0;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var img = document.createElement("img");
	    img.src = this.url();
	    d = img;
	    //d.appendChild(img);
	}
	else {
	    var d = document.createElement("div");
	    div.style.fontFamily = swara.getDefaultFont();
	    // font size?
	    div.style.color      = swara.getDefaultFontColor();
	    d.appendChild(document.createTextNode(this.fShortName));
	}
	return d;
    }

    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function(swara) {
	if( this.fState == GamakaStates.INSTALLED_YES ) {
	    var s = new Array();
	    var i = 0;
	    s[i++] = '<span style="padding:0 0 0 0;">';
	    s[i++] = '<img src="';
	    s[i++] = this.url();
	    s[i++] = '"></img>';
	    s[i++] = "</span>";
	    return s.join("");
	}
	else {
	    return "";
	    //return '<span style="padding:0 0 0 0;">' + this.fShortName + '</span>';
	}
    }

    this.adjustForTotalHeight = function(h) {
	    ; // not supported - dont know how to bottom align
    }

    this.fTotalHeight = 0;
}
ImageGamaka.prototype = new Gamaka(GamakaTypes.IMAGE);


function TextGamaka(shortName, name, font, fontSize, color, val)  
{
    /**
     * get the text
     */
    this.getText = function() {
	return this.fText;
    }

    /**
     * get the font of the text
     */
    this.getFont = function() {
	return this.fFont;
    }

    /**
     * get the font size of the text
     */
    this.getFontSize = function() {
	return this.fFontSize;
    }

    /**
     * get the color of the text
     */
    this.getFontColor = function() {
	return this.fFontColor;
    }

    this.setName(name);
    this.setShortName(shortName);
    this.fText = val;
    this.fFont = font;
    this.fFontSize = fontSize;
    this.fColor    = color;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
	var d = document.createElement("div");
	d.style.fontFamily = this.fFont;
	d.style.fontSize = this.fFontSize;
	d.appendChild(document.createTextNode(this.fText));
	return d;
    }

    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function() {
	var s = new Array();
	var i = 0;
	s[i++] = '<div style="';
	if(this.fFont && this.fFont != "" ) {
	    s[i++] = 'font-family:';
	    s[i++] = this.fFont;
	    s[i++] = ';';
	}
	if( this.fFontSize && this.fFontSize != "" ) {
	    s[i++] = 'font-size:';
	    s[i++] = this.fFontSize;
	    s[i++] = ';';
	}
	if( this.fColor && this.fColor != "" ) {
	    s[i++] = 'color:';
	    s[i++] = this.fColor;
	    s[i++] = ';';
	}
	if( this.fTotalHeight > this.fHeight ) {
	    s[i++] = 'text-align:top;height:';
	    s[i++] = this.fTotalHeight;
	    s[i++] = ';';
	}
	s[i++] = 'padding:0 0 0 0;">';
	s[i++] = this.fText;
	s[i++] = "</div>";
	return s.join("");
    }

    this.adjustForTotalHeight = function(h) {
	    this.fTotalHeight = h;
    }

}
TextGamaka.prototype = new Gamaka(GamakaTypes.TEXT);

function EmptyGamaka(shortName, name)
{
    this.setShortName(shortName);
    this.setName(name);
    this.fHeight = 0;
    this.fWidth  = 0;
    this.fState = GamakaStates.INSTALLED_YES;

    /**
     * render the gamaka and return the dom element for it
     * @return the domelement representing the gamaka
     * @type DOMElement
     */
    this.render = function(swara) {
        return document.createElement("div");
    }

    /**
     * render the gamaka's HTML content and return it
     * @type String
     */
    this.renderAsHTML = function(swara) {
	//var s = new Array();
	//var i = 0;
	//s[i++] = '<div style="padding:0 0 0 0;height:1px;">';
	//s[i++] = "</div>";
	//return s.join("");
	return "";
    }

    this.adjustForTotalHeight = function(h) {
    }
}
EmptyGamaka.prototype = new Gamaka(GamakaTypes.EMPTY);

/**
 * @class
 * represents a object that tracks progress of Gamaka installation process
 */
function GamakaStateProgress() 
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
 * represents the gamaka manager
 */
function GamakaManagerDefn()
{
    /**
     * (internal) method to add gamaka to a list of known gamakas
     * @param {String} name	name of gamala e.g. "Courier" "Lucida Console"
     */
    this._addGamaka = function(gamaka) {
	var o = this.fGamakaList[gamaka.getName()];
	if( o && o.getName ) return false;
	this.fGamakaList[gamaka.getName()] = gamaka;
	return true;
    }

    /**
     * get a gamaka given its name
     */
    this.getGamakaByName = function(name) {
    	var g = this.fGamakaList[gamaka.getName()];
	if( !g ) return null;
	return g;
    }

    /**
     * get a gamaka given its short name
     */
    this.getGamakaByShortName = function(name) {
    	for(var g in this.fGamakaList ) {
	    var gm = this.fGamakaList[g];
	    if( gm.getShortName() == name )
		return gm;
	}
	return null;
    }

    this.loadDefaultGamakas = function() {
	this._addGamaka( new ImageGamaka("^","nokku", "tick.png", true));
	this._addGamaka( new ImageGamaka("~","kampitam", "kampitam2.png", true));
	this._addGamaka( new ImageGamaka("~~","kampitaml", "kampitam3.png", true));
	this._addGamaka( new ImageGamaka("/","ERRa jAru", "quickup.png", true));
	this._addGamaka( new ImageGamaka("//","slow ERRa jAru", "slowup.png", true));
	this._addGamaka( new ImageGamaka("\\","irakka jAru", "quickdn.png", true));
	this._addGamaka( new ImageGamaka("\\\\","slow irakka jAru", "slowdn.png", true));

	this._addGamaka(new SpanningSlideGamaka("/s","ERRa jAru - start",true,true,true));
	this._addGamaka( new SpanningSlideContGamaka("/c","ERRa jAru - continuation",true,true));
	this._addGamaka( new SpanningSlideGamaka("/e","ERRa jAru #2 - end",true,false,true));

	this._addGamaka(new SpanningSlideGamaka("\\s","irakka jAru - start",false,true,true));
	this._addGamaka( new SpanningSlideContGamaka("\\c","irakka #2 - cont",false,true));
	this._addGamaka( new SpanningSlideGamaka("\\e","irakka jAru - end",false,false,true));
    }


    onImageGamakaLoaded = function() {
	if( this.gamaka ) {
	    var w2 = this.offsetWidth;
	    var h2 = this.offsetHeight;
	    this.gamaka.setState( GamakaStates.INSTALLED_YES, h2, w2 );
	}
	this.parentNode.removeChild(this);
	if( this.manager )
	    --this.manager.pendingInitGamakas;
    }

    /**
     * method that works for safari and safaru (and maybe all browsers if 
     * they are set to load images "later")
     *
     * Note: this does mean that gamaka state gets update asynchronously and so
     * "main code" has to wait for that
     */
    this.determineImageGamakaState = function(gamaka, parent) {
	if( gamaka.getState() != GamakaStates.INSTALLED_YES ) {
	    gamaka.setState(GamakaStates.INSTALLED_NO );
	    var img = document.createElement("img");
	    img.style.position = "absolute";
	    img.style.visibility = "hidden";
	    /* supposedly for firefox onload should be set before src is set */
	    ++this.pendingInitGamakas;
	    img.onload = onImageGamakaLoaded;
	    img.src = gamaka.url();
	    img.gamaka  = gamaka;
	    img.manager = this;
	    parent.appendChild(img);
	}
    }

    this.determineGamakaState = function(gamaka, parent) {
	var teststr = "012345678";
	var span = document.createElement("div");
	span.style.position = "absolute";
	span.style.visibility = "hidden";
	span.style.fontSize  = "14pt";
	span.style.fontFamily = "Courier";
	var noimg = document.createElement("img");
	noimg.style.position = "absolute";
	noimg.style.visibility = "hidden";
	noimg.alt = teststr;
	noimg.src = "blafiblah#@!";
	span.appendChild(noimg);
	parent.appendChild(span);
	var w1 = noimg.offsetWidth;
	var h1 = noimg.offsetHeight;
	parent.removeChild(span);

	if( gamaka.getType() == GamakaTypes.TEXT ) {
	    var font = gamaka.getFont();
	    var fonts = new Array();
	    fonts[0] = new Gamaka( gamaka.getFont());
	    FontManager.updateFontStates(parent, fonts, null);
	    if( font.fInstalled == font.INSTALLED_YES ) {
		var spanx = document.createElement("div");
		spanx.style.position = "absolute";
		spanx.style.visibility = "hidden";
		spanx.style.padding = "0 0 0 0";
		spanx.style.fontFamily = gamaka.getFont();
		spanx.style.fontSize = gamaka.getFontSize();
		spanx.appendChild(document.createTextNode(gamaka.getText()));
		parent.appendChild(spanx);

		gamaka.setState(GamakaStates.INSTALLED_YES, spanx.offsetHeight, span.offsetWidth );
		parent.removeChild(spanx);
	    }
	    else
		gamaka.setState(GamakaStates.INSTALLED_NO );
	}
	else if( gamaka.getType() == GamakaTypes.IMAGE ) {
	    if( Utils.isFirefox() || Utils.isSafari() ) {
		this.determineImageGamakaState(gamaka, parent);
	    }
	    else {
		var spanx = document.createElement("div");
		spanx.style.position = "absolute";
		spanx.style.visibility = "hidden";
		spanx.style.padding = "0 0 0 0";
		spanx.style.fontSize  = "14pt";
		spanx.style.fontFamily = "Courier";

		var img = document.createElement("img");
		img.style.position = "absolute";
		img.style.visibility = "hidden";
		img.alt = teststr;
		img.src = gamaka.url();
		spanx.appendChild(img);
		parent.appendChild(spanx);

		var w2 = img.offsetWidth;
		var h2 = img.offsetHeight;
		if( w2 == w1 && h1 == h2 )
		    gamaka.setState( GamakaStates.INSTALLED_NO );
		else {
		    gamaka.setState( GamakaStates.INSTALLED_YES, h2, w2 );
		}

		// alert( gamaka.getName() + ": " + gamaka.getState() + "( " + w2 + "," + h2 + " vs " + w1 + "," + h1 + ")" );
		parent.removeChild(spanx);
	    }
	}
    }

    /**
     * generic routine that update the states of gamakas that are added but whose locatable
     * state we dont know of
     * @param	{DOMElement} parent	a dom-element under which this routine
     *					needs to temporarily add elements to detect
     *					which gamakas are locatable
     * @param	{Array}	     gamakas	(associative) Array of {@link Gamaka} objects - the entries
     *					in this array whose state is {@GamakaStateDefn#INSTALLED_DONTKNOW}
     *					would be updated on return
     * @param 	{GamakaStateProgress} progress (optional) a progress monitor
     */
    this.updateGamakaStates = function(parent, gamakas, progress) {
	//parent = document.body;

	var nGamakas = 0;
	var key;
	for( key in gamakas ) nGamakas++;
	var pct = 0;
	if( progress) progress.onProgress(pct);
	var i = 0;
	for( key in gamakas ) {
	    var gamaka = gamakas[key];
	    this.determineGamakaState(gamaka, parent);
	    pct = parseInt((i*100.0)/nGamakas);
	    if( progress) progress.onProgress(pct);
	    i++;
	}
	if( progress) progress.onProgress(100);
    }

    /**
     * get the list of gamakas, the gamaka manager knows about currently
     */
    this.getGamakas = function() {
	return this.fGamakaList;
    }

    /**
     * list of fonts the font manager knows about currently
     */
    this.fGamakaList = new Array();
    this.loadDefaultGamakas();

    this.init = function(parent) {
	this.updateGamakaStates(parent, this.fGamakaList);
    }

    this.pendingInitGamakas = 0;

    this.havePendingGamakas = function() {
    	return this.pendingInitGamakas != 0;
    }
}
/**
 * the gamaka manager
 */
var GamakaManager = new GamakaManagerDefn();

/**
 * @class
 * represents a menu item in the gamaka menu - it represents a gamaka
 */
function GamakaMenuItem(gamaka) 
{
    /**
     * override of {@link MenuItem#provideContent} to provide content
     * of the menu item
     */
    this.provideContent = function() {
	var tbl = document.createElement("table");
	tbl.style.fontWeight = "bold";
	var tr = tbl.insertRow(0);

	var td = tr.insertCell(0);
	td.style.textAlign = "left";
	td.style.width = "5em";
	if( this.fGamaka.getName ) {
	    var d = document.createElement("div");
	    td.appendChild( document.createTextNode(this.fGamaka.getName()) );

	    var td2 = tr.insertCell(1);
	    var d1 = gamaka.render();
	    d1.style.background = "white";
	    d1.style.padding = "2 2 2 2";
	    d1.style.border = "thin solid";
	    d1.style.display = "inline";
	    d1.style.cssFloat = "right";
	    td2.appendChild(d1);
	}
	else
	    td.appendChild( document.createTextNode(this.fGamaka));
	return tbl;
    }

    /**
     * the gamaka
     * @type String
     * private
     */
    this.fGamaka = gamaka;
}
GamakaMenuItem.prototype = new MenuItem();

/**
 * @class
 * represents a menu of selectable gamakas. 
 * <p>
 * The menu is usable only after {@link GamakaMenu#init} is called, to which an 
 * {@link ActionHandler} must be provided. This action handler will be called
 * when a gamaka is selected The actionID is the gamaka.
 */
function GamakaMenu() 
{
    /**
     * implementation of {@link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_GAMAKA_ADDED ) {
	    var gamaka = src;
	    /*
	     * if we get this event, then that means that a new gamaka
	     * was specified by user (and he has selected it). So we 
	     * add it to our menu item but we also tell our action 
	     * handler that the user has selected the new gamaka
	     */
	    var svGamakaMenuItems = this.fGamakaMenuItems;
	    var newGamakaMenuItems = new Array();
	    var nFonts = svGamakaMenuItems.length;
	    var i;
	    var added = false;
	    for(i = 0; i < nGamakas; i++ ) {
		if( svGamakaMenuItems[i].gamaka.getName() == gamaka.getName() )  {
		    return;
		}
		else if ( !added && svGamakaMenuItems[i].gamaka.getName() > gamaka.getName() ) {
		    var midx = newGamakaMenuItems.length;

		    newGamakaMenuItems[midx] = new Object();
		    newGamakaMenuItems[midx].gamaka =  gamaka;
		    var m = new GamakaMenuItem(gamaka);
		    newFontMenuItems[midx].item =  m;
		    // insert a menu item making us as the action handler (we will
		    // handle the "Other..." if necessary before pass on action to
		    // the real action handler
		    this.insertItem(m, svGamakaMenuItems[i].item, this, gamaka);

		    newGamakaMenuItems[newGamakaMenuItems.length]=  svGamakaMenuItems[i];
		    added = true;
		}
		else
		    newGamakaMenuItems[newGamakaMenuItems.length] =  svGamakaMenuItems[i];
	    }
	    this.fGamakaMenuItems = newGamakaMenuItems;
	    if( this.fActionHandler ) {
		this.fActionHandler.doAction(this, gamaka);
	    }
	}
    }

    /**
     * implementation of {@link ActionHandler} interface - called when
     * a font menu item is selected
     */
    this.doAction = function(src, actionID) {
	var gamaka = actionID;
	if( gamaka == "Other ..." ) {
	    alert("Other... not supported yet");
	    /*
	     * user selected "Other ...", put up AddGamaka form. When
	     * user specifies a gamaka there, it will trigger a GAMAKA_ADDED
	     * event which we will catch in our event handler (and
	     * we will pass it on to fActionHandler
	     */
	    //var form = new AddGamakaForm();
	    //form.initForm(document.body);
	    //var obj = document.body;
	    //var x = LookAndFeel.findPosX(obj);
	    //var y = LookAndFeel.findPosY(obj);
	    //form.show(x,y);
	    return;
	}
	if( this.fActionHandler ) {
	    this.fActionHandler.doAction(this, gamaka);
	}
    }


    /**
     * initialize the menu - menu is usable only after this is called.
     * <p>
     * Note that this is different from {@link Menu#initMenu} which initializes
     * the menu display. This method callls that method. 
     *
     * @param {ActionHandler} actionHandler	the action handler which will 
     *						be called when a gamaka is
     *						selected (actionID is the gamaka
     */
    this.init = function(actionHandler) {
	this.fActionHandler = actionHandler;

    	var gamakaList = GamakaManager.getGamakas();
	var lgamakaList = new Array();
	var i;
	var key;
	for(key in gamakaList)
	{
	    var gamaka = gamakaList[key];
	    if( gamaka.getState() == GamakaStates.INSTALLED_YES ) {
	    	lgamakaList[lgamakaList.length] = gamaka.getName();
	    }
	}
	lgamakaList.sort();

	var nGamakas = lgamakaList.length;

	this.fGamakaMenuItems  = new Array();

	/*
	 * insert menu items making us as the action handler (we will
	 * handle the "Other..." if necessary before pass on action to
	 * the real action handler
	 */
	var midx;
	this.addItem(new  GamakaMenuItem("None"), this, null);
	for(var i = 0; i < nGamakas; i++ ) {
	    this.fGamakaMenuItems[midx] = new Object();
	    var gamaka = gamakaList[lgamakaList[i]];
	    this.fGamakaMenuItems[midx].gamaka = gamaka;
	    var m = new GamakaMenuItem(gamaka);

	    this.addItem(m, this, gamaka);
	    this.fGamakaMenuItems[midx].item = m;
	}
	this.addItem(new  GamakaMenuItem("Other ..."), this, "Other ...");
    }

    EventManager.addListener(EventManager.EVENT_GAMAKA_ADDED, this);

    /**
     * An array representing gamaka menu items {@link GamakaMenuItem}
     * @type Array
     * @private
     */
    this.fGamakaMenuItems = null;

    /**
     * the action handler called when gamaka is selected
     */
    this.fActionHandler = null;
}
GamakaMenu.prototype = new Menu();
