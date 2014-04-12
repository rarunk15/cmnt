/**
 * @fileoverview
 * menu.js contains classes related to swara and lyric toolbars of the swara notation editor
 */

var TEST_MODE = false;

/**
 * the tool bar manager
 */
var toolBarsManager = null;

/**
 * the main menu
 */
var mainMenu = null;

/**
*
*  AJAX IFRAME METHOD (AIM)
*  http://www.webtoolkit.info/
*
**/
AIM = {

    frame : function(c) {
        var n = 'f' + Math.floor(Math.random() * 99999);
        var d = document.createElement('DIV');
        d.innerHTML = '<iframe style="display:none" src="about:blank" id="'+n+'" name="'+n+'" onload="AIM.loaded(\''+n+'\')"></iframe>';
        document.body.appendChild(d);

        var i = document.getElementById(n);
        if (c && typeof(c.onComplete) == 'function') {
            i.onComplete = c.onComplete;
        }

        return n;
    },

    form : function(f, name) {
        f.setAttribute('target', name);
    },

    submit : function(f, c) {
        AIM.form(f, AIM.frame(c));
        if (c && typeof(c.onStart) == 'function') {
            return c.onStart();
        } else {
            return true;
        }
    },

    loaded : function(id) {
        var i = document.getElementById(id);
        if (i.contentDocument) {
            var d = i.contentDocument;
        } else if (i.contentWindow) {
            var d = i.contentWindow.document;
        } else {
            var d = window.frames[id].document;
        }
        if (d.location.href == "about:blank") {
            return;
        }

        if (typeof(i.onComplete) == 'function') {
            i.onComplete(d.body.innerHTML);
        }
    }

}

/**
 * the editor workspace - created by initEditor
 * @type DOM
 */
var editorWorkspace = null;

function getTextAreaCaretPosition(textArea)
{
     if( textArea.selectionStart != null )
	return textArea.selectionStart;
     else // IE
     {
	// The current selection
	textArea.focus();
	var start = 0, end = 0, rangeCopy = null;

	var range = document.selection.createRange();
	rangeCopy = range.duplicate();
	// Select all text
	rangeCopy.moveToElementText(textArea);
	// Now move 'dummy' end point to end point of original range
	rangeCopy.setEndPoint( 'EndToEnd', range );
	// Now we can calculate start and end points
	start = rangeCopy.text.length - range.text.length;
	end = start + range.text.length;
	return start;
     }
}

function gotoTextAreaLine(textArea, line)
{
    var v = textArea.value;
    var pos = 0;
    line--;
    if( line > 0 ) {
	for(var i = 0; i < line; i++ ) {
	    var nl = v.indexOf('\n',pos);
	    if( nl < 0 )
		return;
	    pos = nl+1;
	}
    }
    replaceTextAreaContents(textArea, pos, pos, "");
    textArea.focus();
}

function replaceTextAreaContents(textArea, startPos, endPos, contents)
{
    if( textArea.setSelectionRange) {
	textArea.value = textArea.value.substring(0,startPos) + contents + textArea.value.substring(endPos);
	var e = startPos + contents.length
	textArea.setSelectionRange(e,e);
    }
    else if (document.selection) {
	/*
	 * for IE need to adjust startPos taking into account the
	 * '\r' upto startPos (we are also assuming there are no
	 * new lines between startPos and endPos)
	 */
	var v = textArea.value;
	var  pos = 0;
	var adj = 0;
	while( true ) {
	    pos = v.indexOf( '\r', pos );
	    if( pos < 0 ) break;
	    if( pos < startPos )  {
		adj++;
		pos++;
	    }
	    else
		break;
	}
	startPos -= adj;
	endPos   -= adj;

	// replace
	var range = textArea.createTextRange();
	range.collapse(true);
        range.moveEnd( 'character',  endPos);
	range.moveStart( 'character', startPos);
	range.select();
	range.text = contents;

	// now set caret to end of replaced contents
	var e = startPos + contents.length
	range = textArea.createTextRange();
	range.collapse(true);
	range.moveEnd( 'character',  e);
	range.moveStart( 'character', e);
	range.select();
    }
}

/**
 * @class
 * represents a menu item in the Stayi/Octave menu
 *
 * @constructor
 * @param {int} octave	the octave
 */
function StayiMenuItem(octave)
{
    /**
     * update appearance based on attributes of a certain swara
     * @param {Swara} swara	the swara 
     */
    this.update = function(swara) {
	if( !this.fSwaraView ) return;
	var lab = "";
	if( swara ) lab = swara.getLabel();
	if( lab == "" ) lab = "S";
	this.fSwaraView.setLabel( lab );
    }

    /**
     * override of base class methoe provides the stayi menu item content
     */
    this.provideContent = function() {
	/*
	 * we render things as a table rather than divs. This seems to work
	 * easier to line things horizontally irrespective of the size of
	 * content (i.e. even if people put very wide swaras it will work)
	 */
	var table = document.createElement("table");
	table.style.fontWeight = "bold";	// need to to this to match toolbar font
	table.style.width      = "100%";
	var tr = table.insertRow(0);

	/*
         * we will render such that space is allocated for octave
         * We will do this even for label (i.e. treat label as a swara) so that
         * label text nicely aligns with the swara
         */

	// the label
	var container = tr.insertCell(0);
	var s = new Swara(this._getStayi(this.fOctave), false, 0, 1, 0); 
	var v = new SwaraView();
	var c = v.renderInnerAsDOM(s,0,1,true);
	c.style.display  = "inline";
	c.style.width = "4em";		// specify width otherwise menu item labels dont align
					// (why?) width should be wide enough for "mandra"
	c.style.cssFloat = "left";
	c.style.textAlign = "left";
	c.style.paddingTop = "2px";	// need to match that of swara below (so text aligns)
	c.style.paddingRight = "0.5em";
	c.style.paddingBottom = "2px";
	c.style.border = "none";
	container.appendChild(c);

	// the swara with a dot
	var container1 = tr.insertCell(1);
	var s1 = new Swara("S", false, this.fOctave, 1, 0); 
	var v1 = new SwaraView();
	var c1 = v1.renderInnerAsDOM(s1,0,1,true);
	c1.style.border = "none";
	c1.style.textAlign = "left";
	c1.style.paddingTop = "2px";		// seems to be needed other tara stayi is "chopped"
	c1.style.paddingBottom = "2px";
	c1.style.paddingRight = "0.5em";
	c1.style.border = "none";
	this.fSwaraView = v1;
	container1.appendChild(c1);

	return table;
    }

    /**
     * internal method to get stringized form of the octave/stayi
     * @param {int} octave	the octave/stayi
     * @return get stringized form of the current octave/stayi
     * @type String
     * @private
     */
    this._getStayi = function(octave) {
	var str;
	if( octave == 0 ) str = "madya";
	else if( octave > 0 ) str = "tara";
	else str =  "mandra";
	return str + ":";
    }

    /**
     * the octave
     * @type int
     * @private
     */
    this.fOctave     = octave;
}
StayiMenuItem.prototype = new MenuItem();

/**
 * @class
 * stayi selector, which is part of the swara tool bar. It also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function StayiSelector() 
{
    /**
     * internal method to see if we are inserting are overwriting if obj is selected
     */
    this.inserting = function(obj) {
	return (NotationEditModeController.insertMode() || (obj && obj.partType() == ROWVIEWPART_NEWSWARASPACER));
    }

    /**
     * change the octave
     */
    this.setOctave = function(octave) {
	if( octave != -1 && octave != 0 && octave != 1 )  return false;
	if( !this.fSwara ) return false;
	this.fSwara.setOctave(octave);
	this.fLabelView.nodeValue = this._getStayi();
	EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_STAYICHANGED, this, octave);
	return true;
    }

    /**
     * called when an octave is selected (used in testing also)
     * @private
     */
    this.onOctave = function(octave) {
	this.setOctave(octave);
    }

    /**
     * implementation of @{link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED )
	{
	    this.getContent().style.display = "";
	    this.fSwara.setLabel(data.getLabel());
	    if( this.inserting(src) )
		this.fSwara.setOctave(0);
	    else
		this.fSwara.setOctave(data.getOctave());
	    this.fLabelView.nodeValue = this._getStayi();
	}
	else if( evt == EventManager.EVENT_LYRIC_SELECTED )
	    this.getContent().style.display = "none";
	else if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);
    }

    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fMadyaMenuItem.update(this.fSwara);
	    this.fTaraMenuItem.update(this.fSwara);
	    this.fMandraMenuItem.update(this.fSwara);
	    this.fStayiMenu.show(x,y);
	}
	else {
	    // menu item is selected
	    this.onOctave(actionID);
	}
    }

    /**
     * override of base-class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize   = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width      = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	div.style.height   = "1.5em";	// give some height
	div.style.width    = "5.75em";


	var div2 = document.createElement("div");
	div2.style.cssFloat = "left";
	div2.style.display  = "inline";
	div2.style.height = "100%";
	div2.style.width  = "4em";
	this.fLabelView = document.createTextNode(this._getStayi());
	div2.appendChild(this.fLabelView);
	div.appendChild(div2);

	var arrow = document.createElement("div");
	arrow.style.width = "1.75em";
	arrow.style.height = "100%";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	arrow.style.cssFloat = "right";
	arrow.style.display  = "inline";
	div.appendChild(arrow);

	return div;
    }

    /**
     * internal method to get stringized form of the octave/stayi
     * @return get stringized form of the current octave/stayi
     * @type String
     * @private
     */
    this._getStayi = function() {
	var octave = 0;
	if(this.fSwara) {
	     octave = this.fSwara.getOctave();
	}
	var str = "";
	if( octave == 0 ) str += "madya";
	else if( octave > 0 ) str += "tara";
	else str +=  "mandra";
	return str;
    }

    /**
     * a local Swara model object which is modified as stayi changes
     * @type Swara
     * @private
     */
    this.fSwara = s = new Swara("S", false, 0, 1, 0); 

    /**
     * the stayi menu which is popped-up when the selector is selected
     * @type Menu
     * @private
     */
    this.fStayiMenu = new Menu();
    this.fStayiMenu.initMenu();

    /**
     * the madya stayi menu item
     * @type MenuItem
     * @private
     */
    this.fMadyaMenuItem = new StayiMenuItem(0);
    this.fStayiMenu.addItem( this.fMadyaMenuItem, this, 0 );
	

    /**
     * the tara stayi menu item
     * @type MenuItem
     * @private
     */
    this.fTaraMenuItem = new StayiMenuItem(1);
    this.fStayiMenu.addItem( this.fTaraMenuItem, this, 1 );

    /**
     * the mandra stayi menu item
     * @type MenuItem
     * @private
     */
    this.fMandraMenuItem = new StayiMenuItem(-1);
    this.fStayiMenu.addItem( this.fMandraMenuItem, this, -1 );

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_LYRIC_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);
}
StayiSelector.prototype = new GenericButton();

function SpeedMenuItem(speed, speedSelector) 
{
    this.fSpeed      = speed;
    this.fSpeedSelector = speedSelector;
    this.fDurView       = null;	// the part that displays duration
    this.fLabView       = null;	// the part that displays the swara decorated with speed

    this.update = function() {
	if( this.fSpeed < this.fSpeedSelector.getDefaultSpeed() ) {
	    this.setEnabled(false);
	    this.fLabView.setColor(this._getColor());
	    this.fDurView.setColor(this._getColor());
	}
	else {
	    this.setEnabled(true);
	    this.fLabView.setColor("#000000" );
	    this.fDurView.setColor("#000000" );
	    this.fLabView.setSpeed(this.fSpeed, this.fSpeedSelector.getDefaultSpeed(), true);
	}
	var label = this.fSpeedSelector.getCurrentSwaraLabel();
	if( label == "" ) label = "S";
	this.fLabView.updateLabel(label);

	var dur = this._getMathraiString();
	this.fDurView.updateLabel(dur);
    }

    /**
     * override of base class methoe to provide the real content
     */
    this.provideContent = function() {
	/*
	 * we render things as a table rather than divs. This seems to work
	 * easier to line things horizontally irrespective of the size of
	 * content (i.e. even if people put very wide swaras it will work)
	 */
	var table = document.createElement("table");
	table.style.fontWeight = "bold";	// need to to this to match toolbar font
	table.style.width = "100%";

	var tr = table.insertRow(0);

	/*
         * we will render such that space is allocated for octave AND speed
	 *
         * We will do this even for label (i.e. treat label as a swara) so that
         * label text nicely aligns with the swara
	 *
	 * for speed marks to work correctly, we have the swara rendered in a container
         * which has enough padding for the speed markers (4px min) 
	 */
	var container1 = tr.insertCell(0);
	container1.style.paddingTop = "6px";	// required for rendering speeed - see SwaraView.addSpeed
	container1.style.paddingLeft = "0.25em";

	// create a swara whose label is "S" - we will update it as needed later
	var s1 = new Swara("S", false, 0, 1, this.fSpeed );
	var v1 = new SwaraView();

	this.fLabView = v1;
	var c1 = v1.renderInnerAsDOM(s1,0,1,true);
	c1.style.border = "none";
	c1.style.cssFloat = "left";
	c1.style.display  = "inline";
	c1.style.overflow = "hidden";
	c1.style.textAlign = "center";
	c1.style.paddingBottom = "2px";
	c1.style.paddingRight = "0.5em";
	c1.style.paddingLeft = "0.5em";
	container1.appendChild(v1.addSpeed(container1,c1,this.fSpeedSelector.getDefaultSpeed(), 6)); 


	var spacer = tr.insertCell(1);
	spacer.style.width = "0.5em";

	// the label
	var container = tr.insertCell(2);
	container.style.paddingTop = "6px";	// required for rendering speeed - see SwaraView.addSpeed
	var s = new Swara(this._getMathraiString(), false, 0, 1, this.fSpeedSelector.getDefaultSpeed()); 
	var v = new SwaraView();
	this.fDurView = v;
	var c = v.renderInnerAsDOM(s,0,1,true);
	c.style.border = "none";
	c.style.display  = "inline";
	c.style.cssFloat = "left";
	c.style.textAlign = "right";
	c.style.paddingRight = "0.5em";
	c.style.paddingBottom = "2px";
	c.style.overflow = "hidden";
	var labelElem = Utils._findNodeByClass(c, "nelem");
	labelElem.style.textAlign = "right";
	// save this as duration view
	this.fDurView = v;
	container.appendChild(v.addSpeed(container, c, this.fSpeedSelector.getDefaultSpeed(), 6)); 
	return table;
    }

    /**
     * internal method to get the duration of the current speed as a string
     * @return get the duration as a string
     * @type String
     */
    this._getMathraiString = function() {
	var speed = this.fSpeed;
	var gati = this.fSpeedSelector.getCurrentGati();
	if( !gati ) gati         = GATI_CATUSRA;

	// a bit tricky. We are allocating aksharas for double-speed 
	// This means a quadruple-speed swara occupies 1 akshara,
	// a double-speed swara occupies 2 aksharas, but a whole-note
	// occupies but 2*gati aksharas
	var denom;
	if( speed == 0 ) denom = 1;
	else if( speed == 1 ) denom = gati;
	else if( speed == 2 ) denom = 2*gati;
	else if( speed == 3 ) denom = 4*gati;

	return "1/" + denom;
    }
}
SpeedMenuItem.prototype = new MenuItem();

/**
 * @class
 * speed selector - which is part of the swara tool bar - it also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function SpeedSelector() 
{
    /**
     * get the current default speed
     * @return the current default speed
     * @type int
     */
    this.getDefaultSpeed = function() {
	return this.fDefaultSpeed;
    }

    /**
     * get the current speed
     * @return the current speed
     * @type int
     */
    this.getCurrentSpeed = function() {
	return this.fSpeed;
    }

    /**
     * get the current gati
     * @return the current gati
     * @type GATI
     */
    this.getCurrentGati = function() {
	return this.fGati;
    }

    /**
     * get the current swara label
     * @return the current swara label
     * @type String
     */
    this.getCurrentSwaraLabel = function() {
	return this.fSwaraLabel;
    }

    /**
     * called when a certain speed is selected (used in testing also)
     * @private
     */
    this.onSpeed = function(speed) {
	this.fSpeed = speed;
	this.fLabelView.nodeValue = this._getMathraiString();
	EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_SPEEDCHANGED, this, speed);
    }

    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ) {
	    this.fGati         = src.rowView().getGati(src.getCellIndex());
	    this.fDefaultSpeed = src.rowView().pageView().songView().getModel().getDefaultSpeed();
	    this.fSpeed        = data.getSpeed();
	    this.fSwaraLabel   = data.getLabel();
	    this.fLabelView.nodeValue = this._getMathraiString();
	    return;
	}
	else if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);
    }

    /**
     * {@link ActionHandler} interface implementation
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fWholeMenuItem.update();
	    this.fHalfMenuItem.update();
	    this.fQtrMenuItem.update();
	    this.fEighthMenuItem.update();
	    this.fSpeedMenu.show(x,y);
	}
	else {
	    // speed menu item is selected
	    this.onSpeed(actionID);
	}
    }

    /**
     * override of base class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	div.style.height   = "1.5em";	// give some height
	div.style.width    = "3em";

	var div2 = document.createElement("div");
	div2.style.cssFloat = "left";
	div2.style.display  = "inline";
	div2.style.height = "100%";
	div2.style.width  = "1.5em";
	this.fLabelView = document.createTextNode(this._getMathraiString());
	div2.appendChild(this.fLabelView);
	div.appendChild(div2);

	var arrow = document.createElement("div");
	arrow.style.width = "1.5em";
	arrow.style.height = "100%";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	arrow.style.cssFloat = "right";
	arrow.style.display  = "inline";
	div.appendChild(arrow);

	return div;
    }

    /**
     * internal method to get the duration of the current speed as a string
     * @return get the duration as a string
     * @type String
     */
    this._getMathraiString = function() {
	// a bit tricky. We are allocating aksharas for double-speed 
	// This means a quadruple-speed swara occupies 1 akshara,
	// a double-speed swara occupies 2 aksharas, but a whole-note
	// occupies but 2*gati aksharas
	var denom;
	if( this.fSpeed == 0 ) denom = 1;
	else if( this.fSpeed == 1 ) denom = this.fGati;
	else if( this.fSpeed == 2 ) denom = 2*this.fGati;
	else if( this.fSpeed == 3 ) denom = 4*this.fGati;

	return "1/" + denom;
    }

    /**
     * the speed menu that is popped up when the selector is clicked on
     * @type Menu
     * @private
     */
    this.fSpeedMenu = new Menu();
    this.fSpeedMenu.initMenu();

    /**
     * the fourth speed (=> 8 mathrais per akshara in catusra gati) duration menu item
     * @type MenuItem
     * @private
     */
    this.fEighthMenuItem = new SpeedMenuItem(3, this);
    this.fSpeedMenu.addItem( this.fEighthMenuItem, this, 3 );

    /**
     * the third speed (=> 4 mathrais per akshara in catusra gati) duration menu item
     * @type MenuItem
     * @private
     */
    this.fQtrMenuItem = new SpeedMenuItem(2, this);
    this.fSpeedMenu.addItem( this.fQtrMenuItem, this, 2 );

    /**
     * the second speed (<=> 2 mathrais per akshara in catusra gati) duration menu item
     * @type MenuItem
     * @private
     */
    this.fHalfMenuItem = new SpeedMenuItem(1, this);
    this.fSpeedMenu.addItem( this.fHalfMenuItem, this, 1);

    /**
     * the first speed ( <=> 1 mathrai per akshara in catusra gati) duration menu item
     * @type MenuItem
     * @private
     */
    this.fWholeMenuItem = new SpeedMenuItem(0, this);
    this.fSpeedMenu.addItem( this.fWholeMenuItem, this, 0);


    /**
     * the current speed
     * @type int
     * @private
     */
    this.fSpeed        = 1;

    /**
     * the current default speed
     * @type int
     * @private
     */
    this.fDefaultSpeed = 1;

    /**
     * the current gati
     * @type GATI
     * @private
     */
    this.fGati         = GATI_CATUSRA;

    /**
     * the current swara label
     * @type String
     * @private
     */
    this.fSwaraLabel   = "S";

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);

}
SpeedSelector.prototype = new GenericButton();

/**
 * @class
 * gamaka selector, which is part of the swara tool bar. It also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function GamakaSelector() 
{
    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_SWARA_SELECTED ) {
	    if( data.isPause() ) {
		this.fGamaka = null;
		this.update();
		this.setEnabled(false);
	    }
	    else {
		this.fGamaka = data.getGamaka();
		this.update();
		this.setEnabled(true);
	    }
	}
	else  {
	    this.fGamaka = null;
	    this.update();
	}
	if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);
    }

    /**
     * called when a certain gamaka is selected (used in testing also)
     * @private
     */
    this.onGamaka = function(gamaka) {
	this.fGamaka = gamaka;
	this.update();
	EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_GAMAKACHANGED, this, this.fGamaka);
    }


    /**
     * {@link ActionHandler} interface implementation
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fGamakaMenu.show(x,y);
	}
	else {
	    this.onGamaka(actionID);
	}
    }

    /**
     * override of base class method to provide real content
     */
    this.provideContent = function() {
	var table = document.createElement("table");
	var tr = table.insertRow(0);

	var div = document.createElement("div");
	div.style.height = "100%";
	div.style.fontSize = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width = "100%";
	var lbl = "None";
	if( this.fGamaka ) 
	    lbl = this.fGamaka.getName() + ": ";
	this.fLabelView = document.createTextNode(lbl);
	div.appendChild(this.fLabelView);
	this.fTableCell = Utils.addTableCell(tr, div, 1);

	this.fGamakaContainer = document.createElement("div");
	if( this.fGamaka ) {
	    this.fGamaka.render(this.fGamakaContainer);
	}
	Utils.addTableCell(tr, this.fGamakaContainer, 1);

	this.fArrow = document.createElement("img");
	this.fArrow.src = LookAndFeel.srcurl("but_arrow.png");
	Utils.addTableCell(tr, this.fArrow, 1);

	return table;
    }

    this.update = function() {
	var td = this.fGamakaContainer.parentNode;
	td.removeChild(this.fGamakaContainer);
	this.fGamakaContainer = document.createElement("div");
	var txt = "None";
	if( this.fGamaka ) {
	    this.fGamakaContainer.appendChild(this.fGamaka.render());
	    this.fGamakaContainer.style.border = "thin solid";
	    this.fGamakaContainer.style.background = "white";
	    this.fGamakaContainer.style.padding = "2 2 2 2";
	    txt = this.fGamaka.getName() + " :";
	}
	else
	    this.fGamakaContainer.style.border = "none";
	this.fLabelView.nodeValue = txt;
	td.appendChild(this.fGamakaContainer);
    }

    this.fGamaka     = null;

    this.fGamakaMenu = new GamakaMenu();
    this.fGamakaMenu.initMenu();
    this.fGamakaMenu.init(this);
    this.initButton(this, null);

    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);

}
GamakaSelector.prototype = new GenericButton();

/**
 * @class
 * represents the swara label on the toolbar which updates as current swara is
 * modified. It implements the {@link EventListener} interface.
 */
function ModifiedSwara()
{
    this.setVisible = function(val) {
	if( this.fOuter ) {
	    if( val ) this.fOuter.style.display = "inline";
	    else      this.fOuter.style.display = "none";
	}
    }

    /**
     * get the modified swara
     */
    this.getSwara = function() { return this.fSwara; }

    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_NOTATION_INSERTMODE ) {
	    this.setVisible( NotationEditModeController.insertMode() );
	}
	if( evt == EventManager.EVENT_NOTHING_SELECTED ) {
	    this.fSelSwaraView = null;
	}
	else if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ) {
	    var swara = data;
	    this.fSelSwaraView = src;
	    this.fDefaultSpeed = src.rowView().pageView().songView().getModel().getDefaultSpeed();

	    this.fSwaraView.setLabel(swara.getLabel());
	    this.fSwaraView.setOctave(swara.getOctave());
	    this.fSwaraView.setSpeed(swara.getSpeed(), this.fDefaultSpeed);
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_LABELCHANGED ) {
	    this.fSwaraView.setLabel(data);
	    this.fSelSwaraView.setLabel(data);
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_STAYICHANGED )  {
	    this.fSwaraView.setOctave(data);
	    this.fSelSwaraView.setOctave(data);
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_SPEEDCHANGED ) {
	    this.fSwaraView.setSpeed(data, this.fDefaultSpeed);
	    this.fSelSwaraView = this.fSelSwaraView.rowView().changeSwaraSpeed(this.fSelSwaraView, data);
	    if( this.fSelSwaraView )
		this.fSelSwaraView.rowView().pageView().songView().selectObject(this.fSelSwaraView);
	}
    }

    /**
     * initialize the object
     * @private
     */
    this._init = function() {
	var div = document.createElement("div");
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	div.style.height   = "20px";	// give some height

	/*
         * we will render such that space is allocated for octave AND speed
	 *
	 * we also must specify widths otherwise IE can lay them as columns
	 * (beside width is a good thing otherwise button size would shift
	 * as you change stayi's)
	 *
	 * for speed marks to work correctly, we have the swara rendered in a container
         * which has enough padding for the speed markers (4px min) AND we
	 * put that inside another container. This double-container is needed
 	 * because outer container must be "inline" for content to be on	
	 * one row, but if it is inline, then padding seems to be ignored 
	 * (atleast on firefox). So one container with padding and NOT inline,
	 * and outer container with inline
	 */
	var ccontainer = document.createElement("div");
	ccontainer.style.display = "inline";
	ccontainer.style.cssFloat = "left";
	div.appendChild(ccontainer);

	var container = document.createElement("div");
	container.style.paddingTop = "4px";	// required for rendering speeed - see SwaraView.addSpeed
	container.style.width = "100%";	// so that it expand if longer entries are entered
	//container.style.paddingLeft = "0.25em";
	if( Utils.isIE() ) {
	    container.style.display = "inline"; // MUST NOT BE for FIREFOX - else padding is ignored
						// but MUST BE for IE - else contents not in single row
	}
	ccontainer.appendChild(container);

	var bkColor = "rgb(0,200,0)";
	this.fSwaraView.setBackgroundColor(bkColor);
	this.fSwaraView.setColor("white");

	var c = this.fSwaraView.renderInnerAsDOM(this.fSwara,0,1,true);
	c.style.border = "none";
	c.style.cssFloat = "left";
	c.style.display  = "inline";
	c.style.overflow = "hidden";
	c.style.width = "100%";	// so that it expand if longer entries are entered
	c.style.paddingBottom = "2px";
	c.style.paddingRight = "0";
	c.style.border = "none";
	container.appendChild(this.fSwaraView.addSpeed(container,c,1)); 
	ccontainer.style.background = bkColor;
	ccontainer.style.padding = "4px 4px 4px 4px";
	ccontainer.style.paddingTop = "2px";
	ccontainer.style.paddingBottom = "2px";

	div.appendChild(ccontainer);
	div.style.paddingBottom = "4px";
	//div.style.background = bkColor;

	this.fOuter = div;
    }

    /**
     * local swara model object that is modified as user interacts with the
     * swara toolbar
     * @type Swara
     * @private
     */
    this.fSwara = new Swara("S", false, 0, 1, 0); 

    /**
     * view of the local swara model object
     * @type SwaraView
     * @private
     */
    this.fSwaraView = new SwaraView();

    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_LABELCHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_STAYICHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_SPEEDCHANGED, this);
    EventManager.addListener(EventManager.EVENT_NOTATION_INSERTMODE, this);

    /**
     * the (current) default speed
     * @type int
     * @private
     */
    this.fDefaultSpeed = 1;

    /**
     * the swara view of the current selected swara in the song
     * @type SwaraView
     * @private
     */
    this.fSelSwaraView = null;

    this._init();

}
ModifiedSwara.prototype = new Widget();

/**
 * NavigatableLabelBox
 * represents a label edit box which supports navigational keys
 * <p>
 * It is sort of abstract in the sense and expects derived classes to implement
 * real logic in onChange, onNext, onPrev etc. The derived class <b>must</b> call
 * {@link LabelBox#initLabelBox} 
 * @constructoe
 * @param {boolean}	handleINSKey   		(optional) true if INS key 
 *						should be handled (and 
 *						{@link NavigatableLabelBox#onInsert}
 *						is called). Default if false;
 */
function NavigatableLabelBox (handleINSKey)
{
    /**
     * set focus to the edit box
     */
    this.setFocus = function() { 
	if( this.isEnabled() ) 
	    this.getTextBox().focus(); 
    }

    /**
     * (protected) called when escape is pressed
     * @private
     */
    this.onEscape = function() { }

    /**
     * (protected) called when key sequence for "home" is pressed
     * @private
     */
    this.onHome = function() { }

    /**
     * (protected) called when key sequence for "end" is pressed
     * @private
     */
    this.onEnd = function() { }

    /**
     * (protected) called when key sequence for "next" is pressed
     * @private
     */
    this.onNext = function() { }

    /**
     * (protected) called when key sequence for "prev" is pressed
     * @private
     */
    this.onPrev = function() { }

    /**
     * (protected) called when key sequence for up-arrow is pressed
     * @private
     */
    this.onUp = function() {}

    /**
     * (protected) called when key sequence for down-arrow is pressed
     * @private
     */
    this.onDown = function() {}

    /**
     * (protected) called when key sequence for INS key is pressed and
     * INS key should be handled
     * @private
     */
    this.onINS = function() {}

    /**
     * (protected) called when key sequence for Delete key is pressed
     * @private
     */
    this.onDelete = function() {return false;}

    /**
     * (protected) called when key sequence for "beginning of next line" is pressed
     * @private
     */
    this.onNextLine = function() {
    }

    /**
     * (protected) called when contents have changed
     * @private
     */
    this.onChange = function() { }

    /**
     * (protected) called when text box gets focus
     */
    this.onFocus = function() {
    }

    /**
     * (protected) called when text box looses focus
     */
    this.onBlur = function() {
    }

    /**
     * (protected) called when a non-navigational key is pressed
     * @param  cc	the character
     * @return true if key is handled and default processing should be foregone
     */
    this.onChar = function(cc) {
	    return false;
    }


    /**
     * did we handle last key pressed in keydown  - we do so only for
     * navigational keys
     * @type boolean
     * @private
     */
    this.fKeyHandled = false;
    this.fLastContents = null;

    /**
     * called when a key is pressed in the edit box
     * @private
     */
    this.keydown = function(event)
    {
	var cc = Utils.getCharFromEvent(event);
	var handled = true;
	if( cc == 9 || cc == 13 || (!this.fSpacesAllowed && cc == 32) ) {
	    if( cc != 13 ) {
		if(cc == 8 || event.shiftKey == 1 )
		    this.onPrev();
		else
		    this.onNext();
	    }
	    else
		this.onNextLine();
	}
	else if( cc == 27 ) // escape key
	    this.onEscape();
	else if( cc == 35 ) // end key 
	    this.onEnd();
	else if( cc == 36 ) // home key 
	    this.onHome();
	else if( cc == 37 ) // left key
	    this.onPrev();
	else if( cc == 38 ) // up key 
	    this.onUp();
	else if( cc == 39 ) // right key 
	    this.onNext();
	else if( cc == 40 ) // down key 
	    this.onDown();
	else if( cc == 45  && this.fHandleINSKey )
	    this.onINS();
	else if( cc == 46 )  {
	    handled = this.onDelete();
	}
	else
	    handled = this.onChar(cc);

	this.fKeyHandled = handled;
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
	this.fLastContents = this.getTextBox().value;

	// others are processed as default
	return true;
    }

    /**
     * key down handler for IE
     * @private
     */
    function IE_textKeyDown() {
	this.fLabelBox.keydown(event);
    }
    this.IE_textKeyDown = IE_textKeyDown;


    /**
     * called when key is released
     * @private
     */
    this.keyup = function(event)
    {
	var cc = Utils.getCharFromEvent(event);
	//if( (cc == 32 && this.fSpacesAllowed) || (cc > 32 && cc <= 126 ))
	if( !this.fKeyHandled ) {
	    var v = this.getTextBox().value;
	    if( v != this.fLastContents )
		this.onChange();
	}
    }


    /**
     * key released handler for IE
     */
    function IE_textKeyUp() {
	this.fLabelBox.keyup(event);
    }
    this.IE_textKeyUp = IE_textKeyUp;

    /**
     * focus handler for IE
     */
    function IE_textFocus() {
	this.fLabelBox.onFocus();
    }
    this.IE_textFocus = IE_textFocus;

    /**
     * blur handler for IE
     */
    function IE_textBlur() {
	this.fLabelBox.onBlur();
    }
    this.IE_textBlur = IE_textBlur;

    /**
     *
     * (protected) to be called by derived class to initialize the control
     * @private
     * @param {boolean}  spacesAllowed 	are spaces allowed in label box (otherwise
     *					they act as navigational keys like tabs)
     */
    this.initLabelBox = function(isSpacesAllowed) {
	this.fSpacesAllowed = isSpacesAllowed;
	this.getTextBox().fLabelBox = this;
	// on IE. doing setAttribute doesnt work like we want
	if( Utils.isIE()) {
	    this.getTextBox().onkeydown = IE_textKeyDown;
	    this.getTextBox().onkeyup   = IE_textKeyUp;
	    this.getTextBox().onfocus   = IE_textFocus;
	    this.getTextBox().onblur    = IE_textBlur;
	}
	else {
	    this.getTextBox().setAttribute('onkeydown','this.fLabelBox.keydown(event);');
	    this.getTextBox().setAttribute('onkeyup','this.fLabelBox.keyup(event);');
	    this.getTextBox().setAttribute('onfocus','this.fLabelBox.onFocus();');
	    this.getTextBox().setAttribute('onblur', 'this.fLabelBox.onBlur();');
	}
    }


    /**
     * are spaces allowed in label box (otherwise they act as navigational keys like tabs)
     * @type boolean
     * @private
     */
    this.fSpacesAllowed = true;

    /**
     * should we handle INS key?
     */
    if( !handleINSKey ) handleINSKey = false;
    this.fHandleINSKey = handleINSKey;
}
NavigatableLabelBox.prototype = new TextBox();

/**
 * @class
 * represents base-class for a swara/lyric label edit box. It implements the {@link EventListener}
 * interface.
 *
 * @constructor
 * @param {boolean} isSwara  is this a swara or a lyric label box?
 */
function SwaraLyricLabelBox(isSwara)
{
    /**
     * called by base-class when escape key is pressed
     */
    this.onEscape = function() {
	// ESC key - restore to current swara's label and NOT what text box would do
	if( this.fView )  {
	    this.getTextBox().value = this.fOrigContents;
	    this.fView.setLabel(this.fOrigContents);
	}
    }

    /**
     * called to let derived classes handle event
     */
    this.handleEvent = function(evt, src, data) {
    }


    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	this.handleEvent(evt,src,data);
    }

    this.onDelete = function()  {
	if( this.fisSwaraBox && this.fView ) {
	    if( this.fView.partType() == ROWVIEWPART_SWARA ) {
	      EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_DELETESWARA, null, null);
	      return true;
	    }
	}
	return false;
    }

    this.onINS = function() 
    {
	if( this.fisSwaraBox && this.fView ) {
	    if( this.fView.partType() == ROWVIEWPART_SWARA ) {
		NotationEditModeController.setInsertMode(!NotationEditModeController.insertMode());
		EventManager.postEvent(EventManager.EVENT_NOTATION_INSERTMODE, null, null);
	    }
	}
    }

    /**
     * called by base-class when key sequence for "next" is pressed
     */
    this.onNext = function() {
	if( !this.fView ) return;
	var s = this.fView.nextSelectable();
	if( !s ) return;
	this.fView.rowView().pageView().songView().selectObject(s);
    }

    /**
     * called by base-class called when key sequence for "prev" is pressed
     */
    this.onPrev = function() {
	if( !this.fView ) return;
	var s = this.fView.prevSelectable();
	if( !s ) return;
	this.fView.rowView().pageView().songView().selectObject(s);
    }


    /**
     * (protected) called when key sequence for "home" is pressed
     * @private
     */
    this.onHome = function() {
	if( this.fView ) {
	    var rowView = this.fView.rowView();
	    var songView = rowView.pageView().songView();
	    var s = rowView.firstSelectable();
	    if( s )
		songView.selectObject(s);
	}
    }

    /**
     * (protected) called when key sequence for "end" is pressed
     * @private
     */
    this.onEnd = function() {
	if( this.fView ) {
	    var rowView = this.fView.rowView();
	    var songView = rowView.pageView().songView();
	    var s = rowView.lastSelectable();
	    if( s )
		songView.selectObject(s);
	}
    }
    
    /**
     * (private) handles up/down navigation
     * @param {boolean}	up	true=> up, false=>down
     * @private
     */
    this.onUpDown = function(up) {
	if( !this.fView ) return;
	var rowView = this.fView.rowView();
	var songView = rowView.pageView().songView();
	var row = ((up) ? songView.getPrevSelectableRow(rowView):songView.getNextSelectableRow(rowView));
	if( !row ) return;
	if( row.isSelectable() ) {
	    songView.selectObject(row);
	    return;
	}

	/*
	 * we want to ideally select the part in the row that
	 * spans the current selected object's column (NOT cell)
	 * index; If such a part is not selectable, we select
	 * the first selectable part that follows it, else
	 * we select the last selectable part
	 */
	var colIndex = rowView.getColumnIndex(this.fView.getCellIndex());
	var p = row.fFirstPart;
	var col = 0;
	var selObj = null;
	var selNext = false;
	while(p != null) {
	    var ncol = col + p.colspan();
	    // if we are to select the next selectable obj, select it
	    if( selNext && p.isSelectable() ) {
		selObj = p;
		break
	    }
	    else if( colIndex >= col && colIndex < ncol )  {
		// if the span of this part includes our column, select it
		if(p.isSelectable()) {
		    selObj = p;
		    break;
		}
		else
		    selNext = true;	// select the next obj
	    }
	    p = p.next;
	    col = ncol;
	}
	if( selObj == null ) selObj = row.lastSelectable();
	if( selObj != null ) 
	    songView.selectObject(selObj);
    }

    /**
     * (protected) called when key sequence for "beginning of next line" is pressed
     * @private
     */
    this.onNextLine = function() {
    }


    /**
     * (protected) called when key sequence for up-arrow is pressed
     * @private
     */
    this.onUp = function() { this.onUpDown(true); }

    /**
     * (protected) called when key sequence for down-arrow is pressed
     * @private
     */
    this.onDown = function() { this.onUpDown(false); }

    /**
     * (protected) called when key sequence for down-arrow is pressed
     * @private
     */
    this.onChange = function() {
    }


    /**
     * (protectwd) derived-classes must call this to initialize us
     */
    this.initSwaraLyricLabelBox = function() {
	this.initLabelBox(!this.fisSwaraBox);
	EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_LYRIC_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    }

    /**
     * are we a swara/lyric label box?
     * @type boolean
     * @private
     */
    this.fisSwaraBox = isSwara;

    /**
     * (protected) original contents of a swara/lyric when it is selected
     * @type String
     * @private
     */
    this.fOrigContents = "";
}
SwaraLyricLabelBox.prototype = new NavigatableLabelBox(true);	// true => INS key


/**
 * @class
 * represents the swara label edit box. It implements the {@link EventListener}
 * interface.
 */
function SwaraLabelBox (stayiSelector, speedSelector)
{
    /**
     * save the selection and return an object that can later be passed to restoreSelection
     */
    this.saveSelection = function() {
	  // from http://www.theblueform.com/Home/TheMakingOf.aspx
	 // Initialise the sel object
	 var sel = new Object();
	 // IE support
	 if(document.selection)
	 {
	      // Focus on the text box
	      //this.getTextBox.focus();

	      // This returns us an object containing
	      // information about the currently selected text
	      var oSel = document.selection.createRange();

	      // Find out the length of the selected text
	      // (you'll see why below)
	      var selectionLength = oSel.text.length;

	      // Move the selection start to 0 position.
	      //
	      // This is where it gets interesting, and this is why
	      // some have claimed you can't get the caret positions
	      // in IE.
	      //
	      // IE has no 'selectionStart' or 'selectionEnd' property,
	      // so we can not get or set this value directly. We can
	      // only move the caret positions relative to where they
	      // currently are (this should make more sense when you read
	      // the next line of code).
	      //
	      // Note, that even though we have moved the start
	      // position on our object in memory, this is not reflected
	      // in the browser until we call oSel.select() (which we're
	      // not going to do here).
	      //
	      // Also note, the start position will never be a negative
	      // number, no matter how far we try to move it back.
	      oSel.moveStart ('character', -this.getTextBox().value.length);

	      // This is where it should start to make sense. We now know
	      // our start caret position is the length of the currently
	      // selected text minus the original selection length
	      // (think about it).
	      sel.start = oSel.text.length - selectionLength;

	      // Since the start of the selection is at the start of the
	      // text, we know that the length of the selection is also
	      // the index of the end caret position.
	      sel.end = oSel.text.length;
	 }
	 else 
	 {
	     // Firefox support
	      // This is a whole lot easier in Firefox
	      sel.start = this.getTextBox().selectionStart;
	      sel.end = this.getTextBox().selectionEnd;
	 }
	 return sel;
    }

    /**
     * restore the selection
     * @param {Object} obj	the saved selection which was obtained via call to saveSelection
     */
    this.restoreSelection = function(sel) {
	if( sel.start != undefined && sel.end != undefined ) {
	    if( this.getTextBox().createTextRange) {
		var oRange = this.getTextBox().createTextRange();
		oRange.moveStart("character",sel.start);
		oRange.moveEnd("character",sel.end);
		oRange.select();
	    }
	    else {
		this.getTextBox().setSelectionRange(sel.start,sel.end);
	    }
	}
    }

    /**
     * is the edit box in smart mode?
     * @return whether the edit box is in smart mode
     * @type boolean
     */
    this.inSmartMode = function() { return this.fSmartMode; }

    /**
     * set/clear smart mode
     */
    this.setSmartMode = function(val) { this.fSmartMode = val; }

    /**
     * set the text of the label-box explicitly and also adjust the smartMode
     */
    this.setText = function(val, selectText) {
	this.getTextBox().value = val;
	this.fSmartMode = true;
	//if( smartMode == true || smartMode == false ) 
	    //this.fSmartMode = smartMode;
	this.savedSelection   = null;
	if( selectText ) this.getTextBox().select();
	else		this.toEnd();
    }

    /**
     * override of {@link SwaraLyricLabelBox#handleEvent}
     */
    this.handleEvent = function(evt, src, data) {
	if( evt != EventManager.EVENT_SWARA_SELECTED && evt != EventManager.EVENT_NEWSWARASPACER_SELECTED ) {
	    this.fView = null;
	    this.fOrigContents = "";
	    this.savedSelection   = false;
	    return true;
	}
	this.fSmartMode = true;
	this.fView = src;
	if(evt == EventManager.EVENT_NEWSWARASPACER_SELECTED || 
		(NotationEditModeController.insertMode() && (NotationEditModeController.editingInserted() != this.fView))) {
	    this.getTextBox().value = "";
	    this.savedSelection   = false;
	}
	else {
	    this.getTextBox().value = src.getModel().getLabel();
	    this.fOrigContents = this.getTextBox().value;
	    this.savedSelection   = false;
	    var obj = this.getTextBox();
	    var f = function() { obj.focus(); /**obj.select();*/ obj = null;};
	    setTimeout( f, 200);
	    //this.getTextBox().focus();
	    //this.getTextBox().select();
	}
	evt = null;
	src = null;
	data = null;
	return true;	
    }
    /**
     * (protected) called when a non-navigational key is pressed
     * @param  cc	the character
     * @return true if key is handled and default processing should be foregone
     */
    this.onChar = function(cc) {
	if( cc == 222 ) { 	// forward tick
	    this.fStayiSelector.setOctave(1);
	    return true;
	}
	else if( cc == 192) { // backward tick
	    this.fStayiSelector.setOctave(-1);
	    return true;
	}
	else
	    return false;
    }

    /**
     * called when contents have changed - override of {@link SwaraLyricLabelBox}
     * <p>
     * Here we do some smart parsing of the label contents to see if user has
     * unambiguously entered a swara and auto-advance
     */
    this.onChange = function() {
	// see if current swara is followed by another swara in same row?
	var haveNext = true;
	if( this.fView && this.fView.partType() == ROWVIEWPART_SWARA && !this.fView.nextSelectable())
	    haveNext = false;

	// parse label to see if it unambiguously starts with a swara?
	var lbl = this.getTextBox().value;
	if( lbl ==  "") this.fSmartMode = true;

	// every time we start from empty, we will go into smart mode
	var o = null;
	if( this.fSmartMode ) o = this.isCompleteSwaraLabel(lbl, haveNext);
	if( this.fView == null || o == null ) {
	    // it doesnt (or we cant tell), commit current contents to current swara by
	    // posting the event (it may change later)
	    var svSmartMode = this.fSmartMode;
	    EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_LABELCHANGED, this, lbl );
	    this.fSmartMode = svSmartMode;
	}
	else {
	    // commit the swara label as determined
	    EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_LABELCHANGED, this, o.swara );

	    if( o.length != this.fView.getModel().getLength() ) 
		EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_LENGTHCHANGED, this, o.length );

	    
	    if( o.advance ) {
		// auto-advance (if we can)
		this.onNext();

		if( !haveNext && o.rest != "" ) {
		    var rowView = this.fView.rowView();
		    var songView = rowView.pageView().songView();

		    var newRow = songView.addNewSwaraRowAfter(rowView);
		    if( newRow != null && newRow.fFirstPart ) {
			songView.selectObject(newRow.fFirstPart);
			this.getTextBox().value = o.rest;
			this.fSmartMode = true;
			this.onChange();
		    }
		    return;
		}

		if( haveNext && o.rest != "" ) {
		    /*
		     * if the parsing told us that there is stuff following the label part, then
		     * that goes into the next swara
		     */
		    this.getTextBox().value = o.rest;
		    this.fSmartMode = true;
		    this.onChange();
		}
		else if( !haveNext && o.swara != lbl ) {
		    /*
		     * there is no next swara (so we remain in currents swara) but parsing told
		     * us a value that is different. This can happen e.g. if we are at the
		     * very last swara in a row and user entered say "PG" which normally would
		     * have committed P and then advanced to next swara whose current value would
		     * change to G - but there is no next swara here. So in this case we 
		     * modify the text box value to reflect the value we took
		     */
		    this.getTextBox().value = o.swara;
		}
	    }
	}
    }

    this._init = function() {
	this.init("2em","Label:");
	if( !Utils.isIE() )
	    this.getContent().style.width = "6em";


	// for firefox, a width must be given, otherwise when you hide/re-show it
	// doesnt lay'e, straight. IE doesnt have the problem. But width makes
	// for a bit too much extra room and so we dont do it with IE

	this.initSwaraLyricLabelBox();
    }

    /**
     * internal routine used in parsing contents of text box looking for swaras
     * so that we can auto-advance
     * @return true or false indicating if passed-in character is a swara
     * @type boolean
     * @private
     */
    this.isSwara = function(ch) {
	if( ch == 's' || ch == 'S' ) return true;
	if( ch == 'r' || ch == 'R' ) return true;
	if( ch == 'g' || ch == 'G' ) return true;
	if( ch == 'm' || ch == 'M' ) return true;
	if( ch == 'p' || ch == 'P' ) return true;
	if( ch == 'd' || ch == 'D' ) return true;
	if( ch == 'n' || ch == 'N' ) return true;
    }

    /**
     * internal routine parse lbl to see if it is a complete swara label. 
     * @param {String}	lbl	the label contents to be parsed
     * @param {boolean} haveNext true or false indicating if there is
     *				 a swara following current swara
     * @return if lbl unambigously starts with a complete swara returns an 
     *         object, which has four properies 'swara' indicating the label 
     *         part, 'length' indicates the # of mathrais, 
     *	       'rest' indicating the part lbl that follows 
     *	       it. If lbl does not unambigiously start a swara, returns null
     * @private
     */
    this.isCompleteSwaraLabel = function(lbl, haveNext) {
	if( lbl.length == 0 ) 
	    return null;
	var ch = lbl.charAt(0);
	if( lbl.length == 1 ) {
	    if( ch == ',' || ch == '-' || ch == ';' )
	    {
		var o = new Object();
		o.advance = true;
		o.swara = lbl;
		o.rest  = "";
		if( ch == ';' )
		    o.length = 2;
		else
		    o.length = 1;
		return o;
	    }
	    /*
	    else if ( this.isSwara(ch) ) {
		var o = new Object();
		o.swara = lbl;
		o.rest  = "";
		o.advance = false;
		o.length = 1;
		return o;
	    }
	    */
	    else
		return null;
	}
	// lbl is >= 2 chars in length

	if( ch == ',' || ch == '-' || ch == ';' )
	{
	    var o = new Object();
	    o.advance = true;
	    o.swara = ch;
	    o.length = 1;
	    o.rest  = lbl.substring(1);
	    if( ch == ';' )
		o.length = 2;
	    else
		o.length = 1;
	    return o;
	}

	if( !this.isSwara(ch)) {
	    return null;
	}
	var o = new Object();
	var ch2 = lbl.charAt(1);
	if( (ch2 == 'i' && (ch == 'r' || ch == 'n')) || ch2 == 'a') {
	    o.swara = lbl;
	    o.rest  = "";
	    o.length = 2;
	    o.advance = true;
	}
	else  {
	    o.swara  = ch;
	    o.rest   = ch2; 
	    o.length = 1;
	    o.advance = true;
	}
	return o;
    }

    /**
     * override of {@link SwaraLyricLabelBox#onBlur}
     */
    this.onBlur = function() {
	// when we loose focus save selection so that we can restore it later
	if( this.fView != null )
	    this.savedSelection   = this.saveSelection();
	else
	    this.savedSelection   = null;
    }

    /**
     * override of {@link SwaraLyricLabelBox#onFocus}
     */
    this.onFocus = function() {
	if( this.savedSelection ) {
	    var obj = this.savedSelection;
	    this.savedSelection = null;
	    this.restoreSelection(obj);
	}
    }

    /**
     * move caret to end
     */
    this.toEnd = function() {
	var pos = this.getTextBox().value.length;
	if( this.getTextBox().createTextRange) {
	    var oRange = this.getTextBox().createTextRange();
	    oRange.moveStart("character",pos);
	    oRange.moveEnd("character",pos);
	    oRange.select();
	}
	else {
	    this.getTextBox().setSelectionRange(pos,pos);
	}
    }

    /**
     * the modified swara box
     * @type ModifiedSwara
     * @private
     */
    //this.fModifiedSwaraBox = modifiedSwaraBox;
    this._init();

    /**
     * the speed selector
     */
    this.fSpeedSelector = speedSelector;

    /**
     * the stayi selector
     */
    this.fStayiSelector = stayiSelector;

    /**
     * are in we in smart parsing mode (for easy of data-entry)?
     * @type boolean
     * @private
     */
    this.fSmartMode = false;

    /**
     * have we saved selection position that we will restore when we get focus?
     * @type boolean
     * @private
     */
    this.selectionSaved = false;

    /**
     * the selection start position (if we have saved selection position)
     * @type int
     * @private
     */
    this.svSelectionStart = 0;

    /**
     * the selection end position (if we have saved selection position)
     * @type int
     * @private
     */
    this.svSelectionEnd = 0;


    /**
     * implementation of {@link NotationSelectionController#preSelectionChange} as
     * being a delegate
     * <p>
     * The main intent is to effect length changes done via key-board which couldnt
     * unambiguously determined WHILE editing, and which become unambiguous once
     * user decides to leave the swara. We now commit the length-change and also
     * adjust the selection object (i.e. the view object representing the selection
     * can be affected by the length-change depending on where it is on the view
     */
    this.preSelectionChange = function(songView, curSelection, newSelection) {
	if( curSelection && curSelection == this.fView && newSelection != curSelection) {
	    /*
	     * determine now if we are leaving a swara whose length is "changed"
	     * to "2" to "1" due to editing. We are interested only the case
	     * where the swara label text box has a single-char swara (the
	     * ambiguous case WHILE we were editing it)
	     */
	    var lbl = this.getTextBox().value;
	    if( lbl.length == 1 && this.isSwara(lbl.charAt(0))) {
		/*
		 * the label contents say it is a swara of length == 1, now see if
		 * the model has a length > 1. The difference is due to editing
		 * a lengthy swara (e.g. "ga") to a shorter one (e.g. "g", but 
		 * while editing we didnt want to change the length as that can 
		 * affect swaras following it (causing them to split etc.) 
		 */
		if( this.fView.getModel().getLength() != 1 ) {

		    /*
		     * we are changing the length - now this will affect all swaras that
		     * follow us to the next non-swara/non-lyric. It is possible for
		     * newSelection to be part of that and it will get "redrawn".
		     *
		     * Determine if we are affected. We determine this by seeing if
		     * (a) the new selection is a row-view part (i.e. swara, lyric)
		     * (b) the new selection is in a row that is part of the view
		     *	   notation block as current selection i.e. it is on the 
		     *	   same row as current selection or in a row that follows 
		     *	   it (without any non-swara/non-lyric rows 
		     */
		    var isAffected = false;	// is the new selection affected?
		    var newModel   = null;	// if so what is its model?
		    var curModel =  curSelection.getModel();

		    var  curRow = curSelection.rowView();
		    if( newSelection && newSelection.rowView ) {	// new-selection a row view part?
			var  newRow = newSelection.rowView();

			var nrow = curRow;
			while( true ) { 
			    if( nrow == null ) break;
			    else if( nrow == newRow ) break;
			    else if( nrow.partType() != PAGEVIEWPART_SWARAROW && 
				     nrow.partType() != PAGEVIEWPART_LYRICROW )
			    {
				break;
			    }
			    nrow = songView.getNextRow(nrow);
			}
			if( nrow == newRow ) {
			    isAffected = true;
			    newModel      = newSelection.getModel();
			}
		    }
		    EventManager.postEvent(EventManager.EVENT_SWARATOOLBAR_LENGTHCHANGED, this, 1 );

		    /*
		     * if length change affected the new selection, hunt it down
		     */
		    if( isAffected ) {
			newSelectable = null;	// if we cannot find

			var part = curRow.firstSelectable();
			var nrow = curRow;
			while( true ) {
			    if( part == null ) {
				nrow = songView.getNextRow(nrow);
				if( !nrow.firstSelectable )
				    break;
				part = nrow.firstSelectable();
			    }
			    if( part.getModel() == newModel ) {
				newSelection = part;
				break;
			    }
			    part = part.nextSelectable();
			}

			// if we couldnt locate it, locate the original selection
			if( newSelection == null ) {
			    var part = curRow.firstSelectable();
			    while( part != null ) {
				if( part.getModel() == curModel ) {
				    newSelection = part;
				    break;
				}
				part = part.nextSelectable();
			    }
			}
		    }
		}
	    }
	}
	return newSelection;
    }

    // make ourselves a selection controller delegate
    DefaultNotationSelectionController.setDelegate(this);

    this.fView = null;
}
SwaraLabelBox.prototype = new SwaraLyricLabelBox(true);


/**
 * @class
 * represents the lyric label edit box. It implements the {@link EventListener}
 * interface.
 */
function LyricLabelBox ()
{
    this.init("4em","Lyric:");

    // for firefox, a width must be given, otherwise when you hide/re-show it
    // doesnt lay'e, straight. IE doesnt have the problem. But width makes
    // for a bit too much extra room and so we dont do it with IE
    if( !Utils.isIE() )
	this.getContent().style.width = "8em";

    this.initSwaraLyricLabelBox();

    /**
     * called when contents have changed - override of {@link SwaraLyricLabelBox}
     */
    this.onChange = function() {
	EventManager.postEvent(EventManager.EVENT_LYRICTOOLBAR_LABELCHANGED, this, this.getTextBox().value);
    }

    /**
     * override of {@link SwaraLyricLabelBox#handleEvent}
     */
    this.handleEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_LYRIC_SELECTED ) {
	    this.fView = src;
	    this.getTextBox().value = src.getModel().getText();
	    this.getContent().style.display    = "";
	    this.fOrigContents = this.getTextBox().value;
	    // TODO: move to end
	}
	else {
	    this.fView = null;
	    this.fOrigContents = "";
	}
	return true;
    }
}
LyricLabelBox.prototype = new SwaraLyricLabelBox(false);

/**
 * @class
 * manages the lyric toolbar
 */
function LyricToolBarManager(parent)
{
    /**
     * implementation of {@link EventListener} interface
     */
    this.onEvent = function(evt, src) {
	if( evt == EventManager.EVENT_NOTHING_SELECTED )  {
	    this.fLabelBox.setEnabled(false);
	    this.fLyricView =  null;
	}
	else if( evt == EventManager.EVENT_LYRIC_SELECTED ) {
	    this.fLabelBox.setEnabled(true);
	    this.fLyricView =  src;
	}
	else if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ||
							evt == EventManager.EVENT_HEADING_SELECTED ) 
	    this.fLyricView =  null;
	else if( evt == EventManager.EVENT_LYRICTOOLBAR_LABELCHANGED ) {
	    if(this.fLyricView)
		this.fLyricView.setLabel(this.fLabelBox.getTextBox().value);
	    else
	    	alert("lyric label changed - but no current lyric")
	}
    }

    /**
     * called when toolbar is shown
     */
    this.onShow = function() {
	this.fLabelBox.setFocus();
	//this.fLabelBox.getTextBox().select();
    }

    /**
     * (testing aid) get the label box
     */
    this.getLabelBox = function() { return this.fLabelBox; }

    var tb = new ToolBar(parent, true);
    tb.fManager = this;
    this.fToolBar = tb;

    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_LYRIC_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_LYRICTOOLBAR_LABELCHANGED, this);
    /**
     * the lyric label box
     * @type LyricLabelBox
     * @private
     */
    this.fLabelBox = new LyricLabelBox();
    tb.addItem(this.fLabelBox);

    /**
     * the currently selected lyric if any
     * @type LyricView
     * @private
     */
    this.fLyricView = null;
}

/**
 * @class
 * manages the swara toolbar
 */
function SwaraToolBarManager(parent)
{
    /**
     * in insert mode, swara to be inserted (before it is actually inserted)
     */
    this.fInsertSwara = null;

    this.enableControls = function(selview) {
	if( selview == null ) {
	    this.fSwaraLabelBox.setEnabled(false);
	    this.fStayiSelector.setEnabled(false);
	    this.fSpeedSelector.setEnabled(false);
	    this.fGamakaSelector.setEnabled(false);
	    this.fSpeedLabelNode.style.color = "rgb(136,136,136)";
	    this.fStayiLabelNode.style.color = "rgb(136,136,136)";
	    this.fGamakaLabelNode.style.color = "rgb(136,136,136)";
	}
	else {
	    this.fSwaraLabelBox.setEnabled(true);
	    this.fStayiSelector.setEnabled(true);
	    this.fSpeedSelector.setEnabled(true);
	    this.fGamakaSelector.setEnabled(true);
	    this.fSpeedLabelNode.style.color = "black";
	    this.fStayiLabelNode.style.color = "black";
	    this.fGamakaLabelNode.style.color = "black";
	}
    }

    /**
     * internal method to see if we are inserting are overwriting if obj is selected
     */
    this.inserting = function(obj) {
	return (NotationEditModeController.insertMode() || (obj && obj.partType() == ROWVIEWPART_NEWSWARASPACER));
    }

    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_NOTHING_SELECTED )  {
	    this.enableControls(null);
	    this.fSelSwaraView = null;
	}
	else if( evt == EventManager.EVENT_MENU_CLOSED ) {
	    if( this.fToolBar.getContent().style.display  != "none" )
		this.fSwaraLabelBox.setFocus();
	}
	else if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ) {
	    this.enableControls(src);
	    if( this.inserting(src) && src != this.fSelSwaraView ) {

		// always default to madya stayi
		this.fSelSwaraView = src;
		var refSwara = this.fSelSwaraView.getModel();
		this.fInsertSwara = new Swara("", false, 0, 1, refSwara.getSpeed() );
		NotationEditModeController.setEditingInserted(null);
	    }
	    else {
		NotationEditModeController.setEditingInserted(null);
		this.fSelSwaraView = src;
	    }
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_LABELCHANGED ) {
	    if( this.inserting(this.fSelSwaraView) && this.fInsertSwara ) {
	    	if( data != "" ) {
		    // now is the time to insert the swara - if label is not empty
		    this.fInsertSwara.setLabel(data);
		    var rowView = this.fSelSwaraView.rowView();

		    var block = null;
		    var sView = this.fSelSwaraView;
		    if( this.fSelSwaraView.partType() == ROWVIEWPART_NEWSWARASPACER )
			block = this.fSelSwaraView.getSongBlock();
		    else
			block = this.fSelSwaraView.getModel().getBlock();

		    var sview = rowView.insertSwara(this.fInsertSwara, this.fSelSwaraView, block);
		    if( sview != null ) {
			this.fSelSwaraView = sview;
			this.fInsertSwara = null;
			sview.rowView().pageView().songView().selectObject(sview);
			NotationEditModeController.setEditingInserted(sview);
			sview.updateSelection();
			this.fSwaraLabelBox.setText(data, false);
		    }
		}
	    }
	    else {
		NotationEditModeController.setEditingInserted(this.fSelSwaraView);
		this.fSelSwaraView.updateSelection();
		this.fSelSwaraView.setLabel(data);
	    }
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_STAYICHANGED )  {
	    if( this.inserting(this.fSelSwaraView) && this.fInsertSwara )
		this.fInsertSwara.setOctave(data);
	    else
		this.fSelSwaraView.setOctave(data);
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_LENGTHCHANGED ) {
	    if( this.inserting(this.fSelSwaraView) && this.fInsertSwara )
		this.fInsertSwara.setLength(data);
	    else {
		var svSmartMode = this.fSwaraLabelBox.inSmartMode();
		this.fSelSwaraView = this.fSelSwaraView.rowView().changeSwaraSpeedAndLength(this.fSelSwaraView, 
							this.fSelSwaraView.getModel().getSpeed(),
							data)
		/*
		 * since we have "changed" the same swara and will be reselecting it, we should 
		 * save and restore selection (NOTE: this may not always work e.g. "ga" can become
		 * "g", and so if all was selected before, the range would be invalid later - this
		 * actually can happen only when we allow length to be changed via menu, right now
		 * it can be via keyboard only)
		 */
		if( this.fSelSwaraView ) {
		    var sel = this.fSwaraLabelBox.saveSelection();
		    this.fSelSwaraView.rowView().pageView().songView().selectObject(this.fSelSwaraView);
		    this.fSwaraLabelBox.setSmartMode(svSmartMode);
		    this.fSwaraLabelBox.restoreSelection(sel);
		}
	    }
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_SPEEDCHANGED ) {
	    if( this.inserting(this.fSelSwaraView) && this.fInsertSwara )
		this.fInsertSwara.setSpeed(data);
	    else {
		var svSmartMode = this.fSwaraLabelBox.inSmartMode();
		this.fSelSwaraView = this.fSelSwaraView.rowView().changeSwaraSpeedAndLength(this.fSelSwaraView, data, 
									this.fSelSwaraView.getModel().getLength());
		if( this.fSelSwaraView ) {
		    var sel = this.fSwaraLabelBox.saveSelection();
		    this.fSelSwaraView.rowView().pageView().songView().selectObject(this.fSelSwaraView);
		    this.fSwaraLabelBox.restoreSelection(sel);
		    this.fSwaraLabelBox.setSmartMode(svSmartMode);
		}
	    }
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_GAMAKACHANGED ) {
	    var row = this.fSelSwaraView.rowView();
	    row.changeGamaka(this.fSelSwaraView, data);
	}
	else if( evt == EventManager.EVENT_NOTATION_INSERTMODE ) {
	    if( this.fToolBar.getContent().style.display  != "none" )
	    {
		if( this.fSelSwaraView && this.inserting(this.fSelSwaraView) ) {
		    NotationEditModeController.setEditingInserted(null);
		    this.fSelSwaraView.updateSelection();

		    // always default to madya stayi
		    var refSwara = this.fSelSwaraView.getModel();
		    this.fInsertSwara = new Swara("", false, 0, 1, refSwara.getSpeed() );
		    this.fSwaraLabelBox.setText("", false);
		    this.fStayiSelector.setOctave(0);
		}
		else if( !NotationEditModeController.insertMode() )
		{
		    // out of insert mode
		    this.fSwaraLabelBox.setText(this.fSelSwaraView.getModel().getLabel(), true);
		    this.fSelSwaraView.updateSelection();
		}
	    }
	}
	else if( evt == EventManager.EVENT_SWARATOOLBAR_DELETESWARA ) {
	    if( this.fSelSwaraView && !this.inserting(this.fSelSwaraView)) {
		var n = this.fSelSwaraView.prevSelectable();
		var row = this.fSelSwaraView.rowView();
		this.fSelSwaraView.rowView().deleteSwara(this.fSelSwaraView);
		if( n != null ) {
		    // select the new "last" swara (unless it is not a swara i.e.
		    // is a spacer in which case we select "n" which would be
		    // true last swara )
		    if( n.next && n.next.partType() == ROWVIEWPART_SWARA ) n = n.next;
		    n.rowView().pageView().songView().selectObject(n);
		}
		else {
		    if( row.fFirstPart != null )
			row.pageView().songView().selectObject(row.firstSelectable());
		}
	    }
	}
    }

    /*
     * register for events before we create controls
     */
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);
    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_LABELCHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_STAYICHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_SPEEDCHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_LENGTHCHANGED, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_DELETESWARA, this);
    EventManager.addListener(EventManager.EVENT_SWARATOOLBAR_GAMAKACHANGED, this);
    EventManager.addListener(EventManager.EVENT_NOTATION_INSERTMODE, this );

    /**
     * called when toolbar is shown
     */
    this.onShow = function() {
	this.fSwaraLabelBox.setFocus();
	//this.fSwaraLabelBox.getTextBox().select();
    }

    /**
     * (testing aid) get the label box
     */
    this.getLabelBox = function() { return this.fSwaraLabelBox; }

    /**
     * (testing aid) get the speed selector
     */
    this.getSpeedSelector = function() { return this.fSpeedSelector; }

    /**
     * (testing aid) get the stayi selector
     */
    this.getStayiSelector = function() { return this.fStayiSelector; }

    /**
     * (testing aid) get the gamaka selector
     */
    this.getGamakaSelector = function() { return this.fGamakaSelector; }

    var tb = new ToolBar(parent, false);
    this.fToolBar = tb;

    //var modifiedSwara = new ModifiedSwara();

    this.fSpeedSelector = new SpeedSelector();
    stayi = new StayiSelector();

    this.fSwaraLabelBox = new SwaraLabelBox(stayi, this.fSpeedSelector);
    tb.addItem(this.fSwaraLabelBox);

    tb.addSpacer( "1.25em" );
    tb.fManager = this;

    this.fStayiLabelNode = tb.addDOMItem( document.createTextNode("Stayi:"));
    tb.addSpacer( "0.25em" );
    this.fStayiSelector = stayi;
    tb.addItem(stayi);

    tb.addSpacer( "1.25em" );
    this.fSpeedLabelNode = tb.addDOMItem( document.createTextNode("Duration:"));
    tb.addSpacer( "0.25em" );
    /**
     * the speed/duration selector
     */
    tb.addItem(this.fSpeedSelector);

    tb.addSpacer( "1.25em" );
    this.fGamakaLabelNode = tb.addDOMItem( document.createTextNode("Gamaka:"));
    tb.addSpacer( "0.25em" );
    this.fGamakaSelector = new GamakaSelector();
    tb.addItem(this.fGamakaSelector);
    //tb.addItem(modifiedSwara);
    //modifiedSwara.setVisible(false);

    /**
     * current selected swara
     * @type SwaraView
     * @private
     */
    this.fSelSwaraView = null;

    this.enableControls(null);

    tb = null;
}

/**
 * @class
 * represents bold button in heading toolbar - this is a toggle button
 */
function HeadingBoldButton()
{
    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    var headingView = src;
	    var model     = data;
	    this.fHeadingView = src;
	    if( model.fBold ) this.setSelected(true);
	    else             this.setSelected(false);
	    return;
	}
    }

    /**
     * {@link ActionHandler} interface implementation
     */
    this.doAction = function(src, actionID) {
	if( this.fHeadingView ) {
	    this.fHeadingView.setBold(this.isSelected());
	}
    }

    /**
     * override of base class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.topMargin = "2";
	div.style.bottomMargin = "2";
	div.style.width = "1em";
	div.style.textAlign = "center";
	div.appendChild( document.createTextNode("B"));
	return div;
    }

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
}
HeadingBoldButton.prototype = new GenericButton(true);	// true => a toggle button

/**
 * @class
 * represents italic button in heading toolbar - this is a toggle button
 */
function HeadingItalicButton()
{
    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    var headingView = src;
	    var model     = data;
	    this.fHeadingView = src;
	    if( model.fItalic ) this.setSelected(true);
	    else             this.setSelected(false);
	    return;
	}
    }

    /**
     * {@link ActionHandler} interface implementation
     */
    this.doAction = function(src, actionID) {
	if( this.fHeadingView ) {
	    this.fHeadingView.setItalic(this.isSelected());
	}
    }

    /**
     * override of base class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.fontStyle  = "Italic";
	div.style.topMargin = "2";
	div.style.bottomMargin = "2";
	div.style.width = "1em";
	div.style.textAlign = "center";
	div.appendChild( document.createTextNode("I"));
	return div;
    }

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
}
HeadingItalicButton.prototype = new GenericButton(true);	// true => a toggle button

function HeadingLabelBox() 
{
    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    this.fView = src;
	    this.getTextBox().value = data.getText();
	}
    }

    /**
     * called by base-class when key sequence for "next" is pressed
     */
    this.onNext = function() {
	//if( this.fView )
	    //this.fView.pageView().songView().selectNextObject();
    }

    /**
     * called by base-class called when key sequence for "prev" is pressed
     */
    this.onPrev = function() {
	//if( this.fView )
	    //this.fView.pageView().songView().selectPrevObject();
    }

    /**
     * (protected) called when key sequence for up-arrow is pressed
     * @private
     */
    this.onUp = function() { 
	if( !this.fView ) return;
	var songView = this.fView.pageView().songView();
	var row = songView.getPrevSelectableRow(this.fView);
	if( row.isSelectable() )  {
	    songView.selectObject(row);
	    return;
	}
	songView.selectObject(row.firstSelectable());
    }

    /**
     * (protected) called when key sequence for down-arrow is pressed
     * @private
     */
    this.onDown = function() {
	if( !this.fView ) return;
	var songView = this.fView.pageView().songView();
	var row = songView.getNextSelectableRow(this.fView);
	if( row.isSelectable() )  {
	    songView.selectObject(row);
	    return;
	}
	songView.selectObject(row.firstSelectable());
    }


    /**
     * called when contents have changed
     */
    this.onChange = function() {
	this.fView.setText(this.getTextBox().value);
    }

    this.init("25em","Text:");
    this.initLabelBox(true);	// true => spaces allowed
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
}

HeadingLabelBox.prototype = new NavigatableLabelBox();

/**
 * @class
 * text font-size selector, which is part of the heading tool bar. It also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function FontSizeSelector() 
{
    /**
     * implementation of @{link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    this.fHeadingView = src;
	    this.update();
	}
	else if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);
    }

    /**
     * called when a certain font size is selected (used in testing also)
     * @private
     */
    this.onFontSize = function(sz) {
	if( !this.fHeadingView ) return;
	if( sz == "Default" ) sz = "";
	this.fHeadingView.setFontSize(sz);
	this.update();
    }

    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fFontSizeMenu.show(x,y);
	}
	else {
	    // menu item is selected
	    this.onFontSize(actionID);
	}
    }

    /**
     * override of base-class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize   = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width      = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	div.style.height   = "1.5em";	// give some height
	div.style.width    = "5.75em";


	var div2 = document.createElement("div");
	div2.style.cssFloat = "left";
	div2.style.display  = "inline";
	div2.style.height = "100%";
	div2.style.width  = "4em";
	this.fLabelView = document.createTextNode(this._getFontSize());
	div2.appendChild(this.fLabelView);
	div.appendChild(div2);

	var arrow = document.createElement("div");
	arrow.style.width = "1.75em";
	arrow.style.height = "100%";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	arrow.style.cssFloat = "right";
	arrow.style.display  = "inline";
	div.appendChild(arrow);

	return div;
    }

    /**
     * internal method to get stringized form of the font size
     * @return get stringized form of font size
     * @type String
     * @private
     */
    this._getFontSize = function() {
	var sz = "Default";
	if(this.fHeadingView) {
	     sz = this.fHeadingView.getModel().fFontSize;
	     if( sz == "" ) sz = "Default";
	}
	return sz;
    }

    /**
     * internal method to update display
     * @private
     */
    this.update = function() {
	this.fLabelView.nodeValue = this._getFontSize();
    }

    /**
     * the alignment menu which is popped-up when the selector is selected
     * @type Menu
     * @private
     */
    this.fFontSizeMenu = new Menu();
    this.fFontSizeMenu.initMenu();
    this.fFontSizeMenu.addTextItem( "Default", this, "Default" );
    this.fFontSizeMenu.addTextItem( "8", this, "8" );
    this.fFontSizeMenu.addTextItem( "9", this, "9" );
    this.fFontSizeMenu.addTextItem( "10", this, "10" );
    this.fFontSizeMenu.addTextItem( "11", this, "11" );
    this.fFontSizeMenu.addTextItem( "12", this, "12" );
    this.fFontSizeMenu.addTextItem( "14", this, "14" );
    this.fFontSizeMenu.addTextItem( "16", this, "16" );
    this.fFontSizeMenu.addTextItem( "18", this, "18" );
    this.fFontSizeMenu.addTextItem( "20", this, "20" );
    this.fFontSizeMenu.addTextItem( "22", this, "22" );
    this.fFontSizeMenu.addTextItem( "24", this, "24" );
    this.fFontSizeMenu.addTextItem( "26", this, "26" );
    this.fFontSizeMenu.addTextItem( "28", this, "28" );
    this.fFontSizeMenu.addTextItem( "30", this, "30" );
    this.fFontSizeMenu.addTextItem( "32", this, "32" );

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);

    /**
     * current heading view being modified
     * @type HeadingView
     * @private
     */
    this.fHeadingView = null;
}
FontSizeSelector.prototype = new GenericButton(); 

/**
 * @class
 * text alignment selector, which is part of the heading tool bar. It also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function AlignmentSelector() 
{
    /**
     * implementation of @{link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    this.fHeadingView = src;
	    this.update();
	}
	else if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);
    }

    /**
     * called when a certain alignment is selected (used in testing also)
     * @private
     */
    this.onAlignment = function(alignment) {
	if( !this.fHeadingView ) return;
	this.fHeadingView.setAlignment(alignment);
	this.update();
    }
    
    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.fAlignmentMenu.show(x,y);
	}
	else {
	    // menu item is selected, actionID == alignment
	    this.onAlignment(actionID);
	}
    }

    /**
     * override of base-class method to provide real content
     */
    this.provideContent = function() {
	var div = document.createElement("div");
	div.style.fontSize   = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width      = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	div.style.height   = "1.5em";	// give some height
	div.style.width    = "5.75em";


	var div2 = document.createElement("div");
	div2.style.cssFloat = "left";
	div2.style.display  = "inline";
	div2.style.height = "100%";
	div2.style.width  = "4em";
	this.fLabelView = document.createTextNode(this._getAlignment());
	div2.appendChild(this.fLabelView);
	div.appendChild(div2);

	var arrow = document.createElement("div");
	arrow.style.width = "1.75em";
	arrow.style.height = "100%";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	arrow.style.cssFloat = "right";
	arrow.style.display  = "inline";
	div.appendChild(arrow);

	return div;
    }

    /**
     * internal method to get stringized form of the octave/stayi
     * @return get stringized form of the current octave/stayi
     * @type String
     * @private
     */
    this._getAlignment = function() {
	var alignment = ALIGN_CENTER;
	if(this.fHeadingView) {
	     alignment = this.fHeadingView.getModel().fAlignment;
	}
	var str = "";
	if( alignment == ALIGN_LEFT ) str += "left";
	else if( alignment == ALIGN_CENTER ) str += "center";
	else  {
	    str +=  "right";
	}
	return str;
    }

    /**
     * internal method to update display
     * @private
     */
    this.update = function() {
	this.fLabelView.nodeValue = this._getAlignment();
    }

    /**
     * the alignment menu which is popped-up when the selector is selected
     * @type Menu
     * @private
     */
    this.fAlignmentMenu = new Menu();
    this.fAlignmentMenu.initMenu();
    this.fAlignmentMenu.addTextItem( "Left", this, ALIGN_LEFT);
    this.fAlignmentMenu.addTextItem( "Center", this, ALIGN_CENTER);
    this.fAlignmentMenu.addTextItem( "Right", this, ALIGN_RIGHT);

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_MENU_CLOSED, this);

    /**
     * current heading view being modified
     * @type HeadingView
     * @private
     */
    this.fHeadingView = null;
}
AlignmentSelector.prototype = new GenericButton();

/**
 * @class
 * text font-family selector, which is part of the heading tool bar. It also
 * implements the @{link EventListener} and @{link ActionHandler} interfaces
 */
function FontFamilySelector() 
{
    /**
     * implementation of @{link EventHandler} interface
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    this.fHeadingView = src;
	    this.update();
	}
	else if( evt == EventManager.EVENT_MENU_CLOSED )
	    this.setSelected(false);

    }

    /**
     * called when a certain font is selected (used in testing also)
     * @private
     */
    this.onFont = function(font) {
	if( this.fHeadingView ) {
	    this.fHeadingView.setFont(font);
	    this.update();
	}
    }

    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( src == this ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    if( !this.fFontMenuInitialized ) {
		this.fFontMenuInitialized = true;
		this.fFontMenu.init(this);
	    }
	    this.fFontMenu.show(x,y);
	}
	else {
	    this.onFont(actionID);
	}
    }

    /**
     * override of base-class method to provide real content
     */
    this.provideContentO = function() {
	var div = document.createElement("div");
	div.style.fontSize   = "85%";	// need to to this to match toolbar font
	div.style.fontWeight = "bold";	// need to to this to match toolbar font
	div.style.width      = "100%";
	if( !Utils.isIE() )		// IE doesnt support table
	    div.style.display  = "table";	// very important for firefox so that arrow
					// div below has a chance to occupy same
					// height as others (and draw at the bottom)
	//div.style.width    = "6em";


	var div2 = document.createElement("div");
	div2.style.cssFloat = "left";
	div2.style.display  = "inline";
	div2.style.height = "100%";
	//div2.style.width  = "6em";
	this.fLabelView = document.createTextNode(this._getFontName());
	div2.appendChild(this.fLabelView);
	div.appendChild(div2);
	return div;
    }

    this.provideContent = function() {
	var table = document.createElement("table");
	var tr = table.insertRow(0);

	var div = document.createElement("div");
	this.fLabelView = document.createTextNode(this._getFontName());
	div.style.height = "100%";
	div.style.fontSize = "85%";
	div.style.fontWeight = "bold";
	div.appendChild(this.fLabelView);
	Utils.addTableCell(tr, div, 1);

	var arrow = document.createElement("div");
	arrow.style.width = "12px";
	arrow.style.height = "100%";
	arrow.style.background = LookAndFeel.url("but_arrow.png") + " center right no-repeat";	
	arrow.style.cssFloat = "right";
	arrow.style.display  = "inline";
	Utils.addTableCell(tr, arrow, 1);
	return table;
    }

    /**
     * internal method to get stringized form of the font family
     * @return get stringized form of font family
     * @type String
     * @private
     */
    this._getFontName = function() {
	var sz = "Default";
	if(this.fHeadingView) {
	     sz = this.fHeadingView.getModel().fFont;
	     if( sz == "" ) sz = "Default";
	}
	return sz;
    }

    /**
     * internal method to update display
     * @private
     */
    this.update = function() {
	this.fLabelView.nodeValue = this._getFontName();
    }

    /**
     * the font menu which is popped-up when the selector is selected
     * @type FontMenu
     * @private
     */
    this.fFontMenu = new FontMenu();
    this.fFontMenu.initMenu();

    /**
     * is the font menu initialized w.r.t fonts?
     */
    this.fFontMenuInitialized = false;

    this.initButton(this, null);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_FONT_ADDED, this);

    /**
     * current heading view being modified
     * @type HeadingView
     * @private
     */
    this.fHeadingView = null;
}
FontFamilySelector.prototype = new GenericButton(); 

/**
 * @class
 * manages the heading toolbar
 */
function HeadingToolBarManager(parent)
{
    this.onEvent = function(evt, src) 
    { 
	var enabled = true;
	if( evt == EventManager.EVENT_NOTHING_SELECTED )
	    enabled = false;

	this.fHeadingLabelBox.setEnabled(enabled);
	this.fBoldButton.setEnabled(enabled);
	this.fItalicButton.setEnabled(enabled);
	this.fAlignmentSelector.setEnabled(enabled);
	this.fFontFamilySelector.setEnabled(enabled);
	this.fFontSizeSelector.setEnabled(enabled);
	this.fHeadingLabelBox.setEnabled(enabled);
    }

    /**
     * called when toolbar is shown
     */
    this.onShow = function() { this.fHeadingLabelBox.setFocus(); }

    /**
     * (testing aid) get the label box
     */
    this.getLabelBox = function() { return this.fHeadingLabelBox; }

    /**
     * (testing aid) get the bold button
     */
    this.getBoldButton = function() { return this.fBoldButton; }

    /**
     * (testing aid) get the italic button
     */
    this.getItalicButton = function() { return this.fItalicButton; }

    /**
     * (testing aid) get the alignment selector
     */
    this.getAlignmentSelector = function() { return this.fAlignmentSelector; }

    /**
     * (testing aid) get the font family selector
     */
    this.getFontFamilySelector = function() { return this.fFontFamilySelector; }

    /**
     * (testing aid) get the font size selector
     */
    this.getFontSizeSelector = function() { return this.fFontSizeSelector; }

    var tb = new ToolBar(parent, true);	// true => hidden
    this.fToolBar = tb;
    tb.fManager = this;

    /**
     * the heading label box
     * @type HeadingLabelBox
     * @private
     */
    this.fHeadingLabelBox = new HeadingLabelBox();
    tb.addItem(this.fHeadingLabelBox);

    tb.addSpacer( "1.25em" );
    /**
     * the bold button
     * @type HeadingBoldButton
     * @private
     */
    this.fBoldButton = new HeadingBoldButton();
    tb.addItem( this.fBoldButton );

    /**
     * the italic button
     * @type HeadingItalicButton
     * @private
     */
    this.fItalicButton = new HeadingItalicButton();
    tb.addItem( this.fItalicButton );

    tb.addSpacer( "1.25em" );
    tb.addDOMItem( document.createTextNode("Align:"));
    tb.addSpacer( "0.25em" );

    /**
     * the alignment selector button
     * @type AlignmentSelector
     * @private
     */
    this.fAlignmentSelector = new AlignmentSelector() ;
    tb.addItem(this.fAlignmentSelector);

    tb.addSpacer( "0.25em" );
    tb.addDOMItem( document.createTextNode("Font:"));

    /**
     * the font family selector button
     * @type FontFamilySelector
     * @private
     */
    this.fFontFamilySelector = new FontFamilySelector();
    tb.addItem(this.fFontFamilySelector);

    tb.addSpacer( "0.25em" );
    tb.addDOMItem( document.createTextNode("Size:"));

    /**
     * the font size selector button
     * @type FontSizeSelector
     * @private
     */
    this.fFontSizeSelector = new FontSizeSelector() ;
    tb.addItem(this.fFontSizeSelector);

    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
}

/**
 * @class
 * manages all the toolbars deciding when to show which one. It implements
 * ths {@link EventListener} interface
 */
function ToolBarDisplayManager(parent) 
{
    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src) {
	var newtb;
	if( evt == EventManager.EVENT_SWARA_SELECTED || evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ) {
	    newtb  = this._stb;
	}
	else if( evt == EventManager.EVENT_HEADING_SELECTED ) {
	    newtb  = this._htb;
	}
	else if( evt == EventManager.EVENT_LYRIC_SELECTED )
	    newtb  = this._ltb;
	if( this.curToolBar != newtb ) {
	    this.curToolBar.fToolBar.getContent().style.display = "none";
	    newtb.fToolBar.getContent().style.display = "";
	    this.curToolBar = newtb;
	}
	newtb.onShow();
    }

    /**
     * (testing aid) get the swara tool bar manager
     */
    this.getSwaraToolBarManager = function() { return this._stb; }

    /**
     * (testing aid) get the lyric tool bar manager
     */
    this.getLyricToolBarManager = function() { return this._ltb; }

    /**
     * (testing aid) get the heading tool bar manager
     */
    this.getHeadingToolBarManager = function() { return this._htb; }

    /**
     * the swara tool bar
     * @type SwaraToolBarManager
     * @private
     */
    this._stb = new SwaraToolBarManager(parent);
    /**
     * the lyric tool bar
     * @type SwaraToolBarManager
     * @private
     */
    this._ltb = new LyricToolBarManager(parent);
    /**
     * the heading tool bar
     * @type SwaraToolBarManager
     * @private
     */
    this._htb = new HeadingToolBarManager(parent);

    /**
     * parent of the toobar
     * @type DOMElement
     * @private
     */
    this.fParent = parent;

    /**
     * the currently shown toolbar
     * @private
     */
    this.curToolBar = this._stb;

    /**
     * are in insert mode for notations?
     * @type boolean
     * @private
     */
    this.fInsertMode = false;

    this.fFormsOpened = 0;
    
    // register later so that text-boxes inside toolbars get notified first (kludgy?)
    EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_LYRIC_SELECTED, this);
    EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
}

/**
 * @class
 * represents a menu item in the exit menu
 * @constructor
 * @param {String} txt	the text of the menu item
 * @param {String} pfx	the prefix to the text (user for special markers)
 */
function EditMenuTextItem(txt, pfx) 
{
    /**
     * the text of the menu item 
     * @type String
     * @private
     */
    this.fText = txt;

    /**
     * the prefix to the text (used for special markers)
     * @type String
     * @private
     */
    this.fPrefix = pfx;

    /**
     * the dom elem for the prefix to the text
     * @type String
     * @type DOMElement
     * @private
     */
    this.fPrefix = pfx;

    /**
     * override of base class method provides the menu item content
     */
    this.provideContent = function() {
	var table = document.createElement("table");
	table.style.fontWeight = "bold";
	var tr = table.insertRow(0);

	var d1 = tr.insertCell(0);
	d1.style.width = "1em";

	var pfx = this.fPrefix;
	if( !pfx || pfx == "" ) pfx = " ";
	this.fPrefixElem = document.createTextNode(pfx);
	d1.appendChild(this.fPrefixElem);
	    

	var d2 = tr.insertCell(1);
	this.fTextNode = document.createTextNode( this.fText );
	d2.appendChild(this.fTextNode);
	table.style.width = "100%";	// important on IE, otherwise highlighting dont work right
	return table;
    }

    /**
     * set/change the prefix
     * @param {String}	new prefix
     */
    this.setPrefix = function( pfx ) {
	if( !pfx || pfx == "" ) pfx = " ";
	if( this.fPrefixElem )
	    this.fPrefixElem.nodeValue = pfx;
    }

    /**
     * set the text of the menu item
     */
    this.setText = function(txt) {
	this.fText = txt;
	if( this.fTextNode ) 
	    this.fTextNode.nodeValue = txt;
    }

    /**
     * the text node of the menu item
     * @type DOMElement
     * @private
     */
    this.fTextNode = null;
}
EditMenuTextItem.prototype = new MenuItem();

function TemporarySaveForm()
{
    /**
     * submit the contents
     */
    this.submitContents = function( xmlContents ) {
	this.fHidden.value = xmlContents;
	this.fForm.submit();
	this.hide();
    }

    /**
     * implementation of {@link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( actionID == "ok" ) {
	    this.fForm.submit();
	    //this.fForm.hide();
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
	var form = document.createElement("form");
	form.enctype = "multipart/form-data";  
	form.action = "http://arunk.freepgs.com/sse/sse/editor_save.php";
	form.method = "post";
	Utils.setOpacity(form, 0.5);
	this.fForm = form;
	 
	/*
	var tbl = document.createElement("table");

	var maxCells = 1;

	var tr1 = tbl.insertRow(0);

   	var ta = document.createElement("textarea");
	ta.rows = 30;
	ta.cols = 80;
	this.fTextArea = ta;
	Utils.addTableCell(tr1, ta, maxCells);

	var tr2 = tbl.insertRow(1);
	var center = document.createElement("center");
	var div = document.createElement("table");
	div.style.width = "10em";
	div.style.textAlign = "center";

	var t = div.insertRow(0);
	var ok = new GenericButton();
	ok.initButton(this, "ok", "OK");
	ok.getContent().style.fontWeight = "bold";
	ok.getContent().style.width = "4em";
	ok.getContent().style.textAlign = "center";
	Utils.addTableCell(t, ok.getContent(), 1 );
	center.appendChild(div);

	var td3 = Utils.addTableCell(tr2, center, maxCells);
	this.fForm.appendChild(tbl);
	*/

	var hidden = document.createElement( "input" );
	hidden.type = "hidden";
	hidden.name = "svcontents";
	hidden.id = "svcontents";
	hidden.value = ""; 
	this.fHidden = hidden;
	this.fForm.appendChild(hidden);
	return this.fForm;
    }

    this.fTextArea = "";
    this.fForm    = null;
    this.fHidden   = null;
}
TemporarySaveForm.prototype = new Form()

/**
 * called when user clicks ok on the ImportForm
 */
function onImportFormOK(obj) {
    var form = Utils.getObjForId(obj);
    if( form )  {
	form.onOK();
    }
}

/**
 * called when user clicks cancel on the ImportForm
 */
function onImportFormCancel(obj) {
    var form = Utils.getObjForId(obj);
    if( form ) form.hide();
}

/**
 * called when user clicks align on the ImportForm
 */
function onImportFormAlign(obj) {
    var form = Utils.getObjForId(obj);
    if( form ) form.align();
}


/**
 * @class
 * the import/edit raw contents form
 */
function ImportForm()
{
    this.onOK = function() {
	var v = this.fTextArea.value;
	var t = v.replace(/^\s+|\s+$/, '');
	if( t == "" ) {
	    alert("nothing specified!");
	    return;
	}
	else if( v == this.fOrigContents ) {
	    // nothing changed.
	    this.hide();
	    return;
	}

	var r = Song.prototype.fromRawText(t);
	if( r == null || r.fResult == null )
	    return;

	var song = r.fResult;

	this.hide();

	if( theSongView ) {
	    // delete current view
	    var c = theSongView.getContents();
	    if( c != null ) {
		c.parentNode.removeChild(c);
	    }
	    createSong(editorWorkspace, song, false);
	}
    }
	
    this.onShow = function() {
	var o = document.getElementById("importform_ok");
	Utils.addToIdMap(o, this); 
	o = document.getElementById("importform_cancel");
	Utils.addToIdMap(o, this); 


	var t = theSongView.getModel().getRawContents();
	if(!t ) t = "";
	this.fOrigContents = t;
	o = document.getElementById("ieform_textarea");
	o.value = t;

	Utils.addToIdMap(o, this);
	this.fTextArea = o;
    }

    /**
     * override of {@link Form#provideContent} to provide content of
     * the form
     */
    this.provideContent = function() {
	var d = document.createElement("div");
	var s;
	s    = '<table style="overflow:auto;"><tr><td><span><b>Enter/edit contents in raw format:</b></span>';
	s    += '<tr><td>';
	s    += '<textarea id="ieform_textarea" style="word-wrap:normal;" name="textarea" type="textarea" rows="30" cols="100"></textarea>';
	s    += '<tr><td>';
	s    += '<tr><td>';
	s    += '<div><center>';
	s    += '<input id="importform_cancel" name="align" type="button" value="Align" onclick="onImportFormAlign(this)"> &nbsp;';
	s    += '<input id="importform_ok" name="ok" type="button" value="&nbsp;OK&nbsp;" onclick="onImportFormOK(this)"> &nbsp;';
	s    += '<input id="importform_cancel" name="cancel" type="button" value="Cancel" onclick="onImportFormCancel(this)">';
	s    += '</center>';
	s    += '</div>';
	s    += '</table>';
	d.innerHTML = s;
	d.style.overflow = "auto";

	return d;
    }

    this.align = function() {
	o = document.getElementById("ieform_textarea");
	var t = o.value;
	var sp = t.split( "\n" );
	var nlines = sp.length;
	for( var i = 0; i < nlines; i++ ) {
	    var line = sp[i];
	    if( line.match( /^\s*s:/i ) ) {
		var alignLines = new Array();
		alignLines[alignLines.length] = new Object();
		alignLines[alignLines.length-1].idx = i;
		var s1 = line.split( /\s\s*/ );
		var s2 = new Array();
		for(var si = 0; si < s1.length; si++ ) {
		    if( si == 1 && s1[si].match( /".*"/ )) {
			s2[s2.length-1] += " ";
			s2[s2.length-1] += s1[si];
		    }
		    else if( si > 0 && (s1[si] == '|' || s1[si] == '||' || s1[si] == "(" || s1[si] == ")" ) ) {
			s2[s2.length-1] += " ";
			s2[s2.length-1] += s1[si];
		    }
		    else
		    	s2[s2.length] = s1[si];

		}
		alignLines[alignLines.length-1].str = s2;

		for( var j = i+1; j < nlines; j++ ) {
		    line = sp[j];
		    if( line.match( /^\s*$/) ) 
			continue;
		    if( line.match( /^\s*l:/i ) ) {
			alignLines[alignLines.length] = new Object();
			alignLines[alignLines.length-1].idx = j;
			alignLines[alignLines.length-1].str = line.split( /\s\s*/ );
		    }
		    else
			break;
		}
		if( alignLines.length > 1 ) {
		    // need 
		    var idx = 0;
		    var nAlignLines = alignLines.length;
		    var a  = 0;
		    while( true ) {
			var len = 0;
			for(a = 0; a < nAlignLines; a++) {
			    var ar = alignLines[a].str;
			    if( idx >= ar.length )
				continue;
			    var al = ar[idx].length;
			    if( al > len ) len = al;
			}
			if( len == 0 ) break;
			for(a = 0; a < nAlignLines; a++) {
			    var ar = alignLines[a].str;
			    if( idx >= ar.length )
				continue;
			    var al = ar[idx].length;
			    if( al < len ) {
				var nspaces = len-al;
				for(var adj = 0; adj < nspaces; adj++ ) {
				    ar[idx] += ' ';
				}
			    }
			}
			idx++;
		    }
		    for(a = 0; a < nAlignLines; a++) {
			sp[alignLines[a].idx] = alignLines[a].str.join(" ");
		    }
		}
		if( alignLines.length > 1 ) {
		    i = alignLines[alignLines.length-1].idx;
		}	
	    }
	}
	o.value = sp.join( "\n" );
    }
}
ImportForm.prototype = new Form();

var curOpenFileForm = null;

function startOpenFile() {
    return true;
}

function completeOpenFile(response) {
    if( response.indexOf( "Error: cannot open" ) >= 0 ) {
	alert(response);
	return;
    }
    if( curOpenFileForm != null ) {
	// remove the preformatted tag that is used to enclose
	// the contents (as it got put into an iframe)
	response = response.replace( /^[ \t]*<[ \t]*pre[ \t]*>/i, "" );
	response = response.replace( /<[ \t]*\/[ \t]*pre[ \t]*>[ \t]*$/i, "" )
	curOpenFileForm.fTextArea.value = response;
	curOpenFileForm.hide();
	curOpenFileForm = null;
    }
}

/**
 * @class
 * the import/edit raw contents form
 */
function OpenFileForm(textarea)
{
    /**
     * override of {@link Form#provideContent} to provide content of
     * the form
     */
    this.provideContent = function() {
	var d = document.createElement("div");
	var s;
	s    = '<form name="openfileform" id="openfileform" method="post" action="http://arunk.freepgs.com/cmnt/openfile.php"';
	s    += ' enctype="multipart/form-data"';
	s    += ' onsubmit="return AIM.submit(this, {\'onStart\' : startOpenFile, \'onComplete\' : completeOpenFile})">';
	s    += '<table style="overflow:auto;">';
	s    += '<tr>';
	s    += '<td colspan="2"><b>Specify notation file to open:</b>';
	s    += '<tr>';
	s    += '<td><input type="hidden" name="MAX_FILE_SIZE" value="5000">' +
		'<input type="file" name="openfile" id="openfile" size="40">';
	s    += '<td colspan="2">';
	s    += '<tr>';
	s    += '<td colspan="2"><div><center>';
	s    += '<input type="submit" value="&nbsp;OK&nbsp;"> &nbsp;';
	s    += '<input id="openfileform_cancel" name="cancel" type="button" value="Cancel" onclick="OpenFileForm.prototype.cancelHandler()">';
	s    += '</center>';
	s    += '</div>';
	s    += '</table>';
	s    += '</form>';
	d.innerHTML = s;
	d.style.overflow = "auto";
	var form = d.getElementsByTagName("form")[0];
	this.fForm = form;
	Utils.addToIdMap(form, this);
	curOpenFileForm = this;
	return d;
    }

    this.onCancel = function() {
	curOpenFileForm = null;
	this.hide();
    }

    this.fTextArea = textarea;
}
OpenFileForm.prototype = new Form();
OpenFileForm.prototype.cancelHandler = function(obj)
{
    var form = document.getElementById("openfileform");
    var obj = Utils.getObjForId(form);
    if( obj )  {
	obj.onCancel();
    }
}

/**
 * @class
 * the import/edit raw contents form
 */
function NewSongForm()
{
    /**
     * override of {@link Form#provideContent} to provide content of
     * the form
     */
    this.provideContent = function() {
	var d = document.createElement("div");
	var s;
	s    = '<form id="newsongform">';
	s    += '<table style="overflow:auto;">';
	s    += '<tr>';
	s    += '<td><b>Song Title: </b><td><input type="text" name="title" id="songname" size="40">';
	s    += '<td><b>Size: </b><td><select id="fontSize">';
	s    +=			'<option value="12">12</option>';
	s    +=			'<option value="14">14</option>';
	s    +=			'<option value="16">16</option>';
	s    +=			'<option value="18">18</option>';
	s    +=			'<option value="20">20</option>';
	s    +=			'<option value="24">24</option>';
	s    += '</select>';
	s    += '<tr>';
	s    += '<td><b>Tala:  </b><td><select id="tala">';
	s    +=			'<option value="Adi">Adi</option>';
	s    +=			'<option value="RoopakaCapu">Roopaka (Capu)</option>';
	s    +=			'<option value="KhandaCapu">Khanda Chapu</option>';
	s    +=			'<option value="MisraCapu">Misra Chapu</option>';
	s    +=			'<option value="Roopaka">Chatusra Roopaka</option>';
	s    +=			'<option value="Eka">Eka</option>';
	s    +=			'<option value="Tisra_Eka">Tisra Eka</option>';
	s    +=			'<option value="Tisra_Adi">Adi (Tisra Gati)</option>';
	s    +=			'</select>';
	s    += '<td colspan="2">';
	s    += '<tr>';
	s    += '<td><b>Layout:  </b><td><select id="layout">';
	s    +=			'<option value="Krithi">Krithi (Default)</option>';
	s    +=			'<option value="Varnam">Varnam</option>';
	s    +=			'<option value="Gitam">Gitam</option>';
	s    +=			'</select>';
	s    += '<td colspan="2">';
	s    += '<tr>';
	s    += '<td><b>Width:  </b><td><select id="NotationWidth">';
	s    +=			'<option value="Compact">Compact (Default)</option>';
	s    +=			'<option value="FullWidth">Full page Width</option>';
	s    +=			'</select>';
	s    += '<td colspan="2">';
	s    += '<tr>';
	s    += '<td><b>Show lines for higher speed swaras:  </b><td><select id="SpeedMarkers">';
	s    +=			'<option value="Above">Above</option>';
	s    +=			'<option value="Below">Below</option>';
	s    +=			'</select>';
	s    += '<td colspan="2">';
	s    += '<tr>';
	s    += '<td colspan="4"><div><center>';
	s    += '<input id="newsongform_ok" name="ok" type="button" value="&nbsp;OK&nbsp;" onclick="NewSongForm.prototype.okHandler()"> &nbsp;';
	s    += '<input id="newsongform_cancel" name="cancel" type="button" value="Cancel" onclick="NewSongForm.prototype.cancelHandler()">';
	s    += '</center>';
	s    += '</div>';
	s    += '</table>';
	s    += '</form>';
	d.innerHTML = s;
	d.style.overflow = "auto";
	var form = d.getElementsByTagName("form")[0];
	this.fForm = form;
	Utils.addToIdMap(form, this);
	return d;
    }

    this.onOK = function() {
	var ok = false;
	var title = trim(this.fForm.title.value);
	var err = null;
	if( title == "" )
	    err = "No title provided"
	
	if( err )  {
	    alert(err);
	    return;
	}

	this.hide();

	var contents = "";
	contents += 'Layout: ' + this.fForm.layout.value + ',' + this.fForm.NotationWidth.value;
	contents += "\nTala: " + this.fForm.tala.value;
	contents += '\nHeading: "' + title + '",bold,center,' + this.fForm.fontSize.value;
	if( doCodePress ) {
	    var rawContents =  document.getElementById("rawContents_cp").previousSibling;	// IE (too) 
	    rawContents.setCode(contents);
	    rawContents.editor.syntaxHighlight();
	}
	else {
	    var rawContents =  document.getElementById("rawContents");
	    rawContents.value = contents;
	}


    }

    this.onCancel = function() {
	this.hide();
    }
}
NewSongForm.prototype = new Form();
NewSongForm.prototype.okHandler = function(obj)
{
    var form = document.getElementById("newsongform");
    var obj = Utils.getObjForId(form);
    if( obj)  {
	obj.onOK();
    }
}
NewSongForm.prototype.cancelHandler = function(obj)
{
    var form = document.getElementById("newsongform");
    var obj = Utils.getObjForId(form);
    if( obj )  {
	obj.onCancel();
    }
}


/**
 * @class
 * main menu
 */
function MainMenu(parent, interactive) 
{
    /**
     * internal method to see if we are inserting are overwriting
     */
    this.inserting = function() {
	return (NotationEditModeController.insertMode() || (this.fSelType == ROWVIEWPART_NEWSWARASPACER));
    }

    /**
     * {@link EventListener} interface implementation
     */
    this.onEvent = function(evt, src, data) {
	if( evt == EventManager.EVENT_SWARA_SELECTED ||
		   evt == EventManager.EVENT_NEWSWARASPACER_SELECTED ||
		   evt == EventManager.EVENT_LYRIC_SELECTED ||
		   evt == EventManager.EVENT_HEADING_SELECTED ) {
	    this.fSelType = src.partType();
	    this.fSelObj   = src;
       }
       else if( evt == EventManager.EVENT_NOTHING_SELECTED ) {
	    this.fSelType = null;
	    this.fSelObj  = null;
       }

    }

    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
	if( actionID == this.ACTION_FILE_MENU ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    if(this.fInteractive)
		this.updateEditMenuItems();
	    this.fFileMenu.show(x,y);
	}
	else if( actionID == this.ACTION_INSERT_MENU ) {
	    var obj = src.getContent();
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj) + obj.offsetHeight;
	    this.updateEditMenuItems();
	    this.fEditMenu.show(x,y);
	}
	else if( actionID == this.ACTION_EDIT_CONTENTS ) {
	    var obj = document.body;
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj);
	    if( !this.fImportForm ) {
		this.fImportForm = new ImportForm();
		this.fImportForm.initForm(document.body);

		this.fImportForm.show(x,y);
	    }
	    else {
		this.fImportForm.show(x,y,true);	// show at last position
	    }
	}
	else if( actionID == this.ACTION_SAVE_SONG ) {
	    if( this.fSelObj ) {
		var rowView;
		if( this.fSelObj.rowView )
		    rowView = this.fSelObj.rowView();
		else
		    rowView = this.fSelObj;
		var xml = rowView.pageView().songView().getModel().toXML();
		if( !xml ) {
		    alert("internal error: cannot save");
		}
		else {
		    var xmlNode = XMLUtils.createXMLNode("xml");
		    xmlNode.setAttribute( "id", "songdata" );
		    xmlNode.appendChild(xml);

		    //var html = document.createElement("html");
		    //var head = document.createElement("head");
		    //var body = document.createElement("body");
		    //body.appendChild(xmlNode);

		    var form = new TemporarySaveForm();
		    form.initForm(document.body);
		    var obj = document.body;
		    var x = LookAndFeel.findPosX(obj);
		    var y = LookAndFeel.findPosY(obj);
		    form.show(x,y);
		    form.submitContents( XMLUtils.serialize(xmlNode) );

		    //form.fTextArea.value = XMLUtils.serialize(xmlNode);
		}
	    }
	}
	else if( actionID == this.ACTION_INSERT_MODE ) {
	    NotationEditModeController.setInsertMode(!NotationEditModeController.insertMode());
	    EventManager.postEvent(EventManager.EVENT_NOTATION_INSERTMODE, null, null);
	}
	else if( actionID == this.ACTION_INSERT_TEXT_AFTER || actionID == this.ACTION_INSERT_TEXT_BEFORE) {
	    if(this.fSelObj) {
		var rowView;
		if( this.fSelObj.rowView )
		    rowView = this.fSelObj.rowView();
		else
		    rowView = this.fSelObj;

		var h = rowView.pageView().songView().insertNewHeading(rowView, (actionID == this.ACTION_INSERT_TEXT_BEFORE));
		if( h != null )
		    rowView.pageView().songView().selectObject(h);
	    }
	}
	else if( actionID == this.ACTION_INSERT_NOTATIONS_AFTER || actionID == this.ACTION_INSERT_NOTATIONS_BEFORE) {
	    if(this.fSelObj) {
		var rowView;
		if( this.fSelObj.rowView )
		    rowView = this.fSelObj.rowView();
		else
		    rowView = this.fSelObj;

		var s = rowView.pageView().songView().insertNewTalaCycle(rowView, (actionID == this.ACTION_INSERT_NOTATIONS_BEFORE));
		if( s != null && s.fFirstPart ) {
		    //if( !NotationEditModeController.insertMode() ) {
			//NotationEditModeController.setInsertMode(true);
			//EventManager.postEvent(EventManager.EVENT_NOTATION_INSERTMODE, null, null);
		    //}
		    rowView.pageView().songView().selectObject(s.fFirstPart);
		}
	    }
	}
	else if( actionID == this.ACTION_APPEND_NOTATIONS ) {
	    if(this.fSelObj) {
		var rowView;
		if( this.fSelObj.rowView )
		    rowView = this.fSelObj.rowView();
		else
		    rowView = this.fSelObj;

		var lastPart = rowView.fLastPart;
		while(lastPart.partType() != ROWVIEWPART_SWARA && lastPart.partType() != ROWVIEWPART_NEWSWARASPACER)
		    lastPart = lastPart.prev;

		if( lastPart.partType() == ROWVIEWPART_NEWSWARASPACER ) {
		    //if( !NotationEditModeController.insertMode() ) {
			//NotationEditModeController.setInsertMode(true);
			//EventManager.postEvent(EventManager.EVENT_NOTATION_INSERTMODE, null, null);
		    //}
		    rowView.pageView().songView().selectObject(lastPart);
		}
		else
		{
		    var s = rowView.pageView().songView().addNewSwaraRowAfter(rowView);
		    if( s != null && s.fFirstPart ) {
			//if( !NotationEditModeController.insertMode() ) {
			    //NotationEditModeController.setInsertMode(true);
			    //EventManager.postEvent(EventManager.EVENT_NOTATION_INSERTMODE, null, null);
			//}
			rowView.pageView().songView().selectObject(s.fFirstPart);
		    }
		}
	    }
	}
	else if( actionID == this.ACTION_ADD_LYRIC ) {
	    if(this.fSelObj) {
		var rowView;
		if( this.fSelObj.rowView )
		    rowView = this.fSelObj.rowView();
		else
		    rowView = this.fSelObj;
		var l = rowView.pageView().songView().addLyricRow(rowView);
		if( l != null && l.fFirstPart )
		    rowView.pageView().songView().selectObject(l.fFirstPart);
	    }
	}
    }

    /**
     * internal method to update insert menu items
     */
    this.updateEditMenuItems = function() {

	var insertModePfx = "";
	if( NotationEditModeController.insertMode() ) 
	    insertModePfx = "\u2022";	// bullet
	this.fInsertModeMenuItem.setPrefix(insertModePfx);

	if( this.fSelType == ROWVIEWPART_SWARA || this.fSelType == ROWVIEWPART_NEWSWARASPACER ) {
	    var row = this.fSelObj.rowView();
	    if( !row.isSwaraRow() ) row = row.getSwaraRow();
	    if( row.hasLyricRows() )
		this.fAddLyric.setText("Add another lyric row");
	    else
		this.fAddLyric.setText("Add Lyrics");
	    this.fAddLyric.setEnabled(true);
	}
	else {
	    this.fAddLyric.setText("Add Lyrics");
	    this.fAddLyric.setEnabled(false);
	}

	if( this.fSelType == ROWVIEWPART_SWARA || this.fSelType == ROWVIEWPART_NEWSWARASPACER ) {
	    this.fInsertTextBefore.setEnabled(true);
	    this.fInsertTextAfter.setEnabled(true);

	    this.fInsertSwaraBefore.setEnabled(true);
	    this.fInsertSwaraAfter.setEnabled(true);
	    this.fInsertModeMenuItem.setEnabled(true);

	    var row = this.fSelObj.rowView();
	    var rowAfter = row.pageView().songView().getNextNonLyricRow(row);
	    if( rowAfter == null || rowAfter.partType() != PAGEVIEWPART_SWARAROW )
		this.fAddSwarasAfter.setEnabled(true);
	    else 
		this.fAddSwarasAfter.setEnabled(false);
	    this.fSave.setEnabled(true);
	}
	else if( this.fSelType == ROWVIEWPART_LYRIC) {
	    this.fInsertTextBefore.setEnabled(true);
	    this.fInsertTextAfter.setEnabled(true);
	    this.fInsertSwaraBefore.setEnabled(true);
	    this.fInsertSwaraAfter.setEnabled(true);
	    this.fInsertModeMenuItem.setEnabled(true);

	    this.fAddSwarasAfter.setEnabled(false);
	    this.fSave.setEnabled(true);
	}
	else if( this.fSelType == PAGEVIEWPART_HEADING) {
	    this.fInsertTextBefore.setEnabled(true);
	    this.fInsertTextAfter.setEnabled(true);
	    this.fInsertSwaraBefore.setEnabled(true);
	    this.fInsertSwaraAfter.setEnabled(true);
	    this.fInsertModeMenuItem.setEnabled(false);
	    this.fAddSwarasAfter.setEnabled(false);
	    this.fSave.setEnabled(true);
	}
	else {
	    this.fInsertTextBefore.setEnabled(false);
	    this.fInsertTextAfter.setEnabled(false);
	    this.fInsertSwaraBefore.setEnabled(false);
	    this.fInsertSwaraAfter.setEnabled(false);
	    this.fInsertModeMenuItem.setEnabled(false);
	    this.fAddSwarasAfter.setEnabled(false);
	    this.fSave.setEnabled(false);
	}
    }


    /**
     * currently selected obj
     */
    this.fSelObj = null;
    /**
     * currently selected obj type
     */
    this.fSelType = null;

    this.ACTION_FILE_MENU = 1;
    this.ACTION_INSERT_MENU = 2;

    this.ACTION_SAVE_SONG = 15;
    this.ACTION_PRINTABLE_VIEW = 16;
    this.ACTION_EDIT_CONTENTS = 17;

    this.ACTION_INSERT_TEXT_BEFORE = 20;
    this.ACTION_INSERT_TEXT_AFTER  = 21;

    this.ACTION_INSERT_NOTATIONS_BEFORE= 25;
    this.ACTION_INSERT_NOTATIONS_AFTER = 26;

    this.ACTION_ADD_LYRIC = 27;
    this.ACTION_INSERT_MODE = 30;

    this.ACTION_APPEND_NOTATIONS = 31;

    this.fInsertTextBefore = null;
    this.fInsertTextAfter = null;
    this.fInsertSwaraBefore = null;
    this.fInsertSwaraAfter = null;
    this.fAddLyric = null;
    this.fAddSwarasAfter = null;

    this.fEditMenuItem = null;
    this.fFileMenuItem = null;

    /**
     * get the edit menu item (testing aid)
     */
    this.getEditMenuItem = function() { return this.fEditMenuItem; }

    /**
     * get the edit menu (testing aid)
     */
    this.getEditMenu = function() { return this.fEditMenu; }

    /**
     * get the file menu item (testing aid)
     */
    this.getFileMenuItem = function() { return this.fFileMenuItem; }

    /**
     * get the file menu (testing aid)
     */
    this.getFileMenu = function() { return this.fFileMenu; }

    /**
     * initialize the menu
     */
    this.init = function(parent, interactive) {
	this.fToolBar = new ToolBar(parent, false, true);
	this.fFileMenuItem = this.addTextItem( "File", this.ACTION_FILE_MENU );
	this.fFileMenu = new Menu();
	this.fFileMenu.initMenu();

	if( interactive )
	    this.fSave   = this.fFileMenu.addTextItem( "Save song to your computer", this, this.ACTION_SAVE_SONG );
	else
	    this.fImport = this.fFileMenu.addTextItem( "Edit contents ...", this, this.ACTION_EDIT_CONTENTS );
	//this.addTextItem( "Printable View", this.ACTION_PRINTABLE_VIEW );


	if( interactive ) 
	{
	    this.fEditMenuItem = this.addTextItem( "Edit", this.ACTION_INSERT_MENU );

	    this.fEditMenu = new Menu();
	    this.fEditMenu.initMenu();
	    this.fInsertTextBefore = this.addEditMenuTextItem( "Insert text before", 
							     this.ACTION_INSERT_TEXT_BEFORE );
	    this.fInsertTextAfter = this.addEditMenuTextItem( "Insert text after", 
							     this.ACTION_INSERT_TEXT_AFTER );

	    this.fEditMenu.addBreakItem();

	    this.fInsertSwaraBefore = this.addEditMenuTextItem( "Insert notation block before", 
							     this.ACTION_INSERT_NOTATIONS_BEFORE );
	    this.fInsertSwaraAfter = this.addEditMenuTextItem( "Insert notation block after", 
							     this.ACTION_INSERT_NOTATIONS_AFTER );
	    this.fEditMenu.addBreakItem();
	    this.fAddSwarasAfter = this.addEditMenuTextItem( "Append notations at end", 
							     this.ACTION_APPEND_NOTATIONS );
	    this.fAddLyric = this.addEditMenuTextItem( "Add Lyrics", this.ACTION_ADD_LYRIC );
	    this.fEditMenu.addBreakItem();
	    this.fInsertModeMenuItem = this.addEditMenuTextItem("Insert Swara Mode", this.ACTION_INSERT_MODE, "\u2022");

	    if( TEST_MODE ) {
		this.fTestMenu = new Menu();
		this.fTestMenu.initMenu();

		this.fTestMenu.addTextItem( "Save current song data as init test data", this, this.ACTION_TEST_TESTDATA );
		this.fTestMenu.addTextItem( "Save current view contents as expected results", this, this.ACTION_TESTRESULTS );
		this.fTestMenu.addTestItem( "Generate Test", this, this.ACTION_GENERATETEST );
	    }
	}
    }

    this.addTextItem = function(txt, actionID) {
	var m = new TextMenuItem(this.fToolBar.fTable.rows[0], txt, this, actionID);
	m.getContent().style.paddingRight = "1em";
	//this.addItem( m, this, actionID);
	return m;
    }

    this.addEditMenuTextItem = function(txt, actionID, pfx) {
	var m = new EditMenuTextItem(txt, pfx);
	this.fEditMenu.addItem( m, this, actionID);
	return m;
    }

    this.init(parent, interactive);
    if( interactive )
    {
	EventManager.addListener(EventManager.EVENT_SWARA_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_NEWSWARASPACER_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_LYRIC_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_HEADING_SELECTED, this);
	EventManager.addListener(EventManager.EVENT_NOTHING_SELECTED, this);
	this.updateEditMenuItems();
    }

    /**
     * are we in interactive mode?
     */
    this.fInteractive  = interactive;

    /**
     * the import raw contents form
     */
    this.fImportForm   = null;
}

function MainMenuN(parent) 
{
    /**
     * implementation of @{link ActionHandler} interface
     */
    this.doAction = function(src, actionID) {
    }

    this.init = function(parent) {
	this.initMenu(true, parent);
	this.getContent().style.width = "100%";
	this.fMenuTable.style.width = "100%";
	this.getContent().style.visibility = "visible";
	this.getContent().style.display    = "block";
    }

    this.init(parent);
}
MainMenu.prototype = new Menu();

/**
 * creates a new song view
 * @param {DOM} workspace		the workspace DOM elem
 * @param {boolean} interactive		interactive mode?
 * @param {String}  title		title of song (null => pick default)
 * @param {Tala }   tala		tala of song (null => pick default)
 * @param {int}     defaultSpeed	default speed of swaras
 * @type SongView
 */
function createNewSong(workspace, interactive, title, tala, defaultSpeed) 
{
    if( !workspace) {
	alert( "internal error: no workspace!");
	return;
    }
    if( !title ) {
	if( interactive ) title = "Song Title goes here";
	else	title = "";
    }
    if( !tala ) tala = PredefinedTalas.AdiTala();
    if( !defaultSpeed ) defaultSpeed = 0;
    var s = new Song( new HeadingTitle(title), tala, defaultSpeed );
    var sv = new SongView(s, 1, false);	// 1 => # of tala cycles per row
    sv.setInteractive(interactive);
    sv.render(workspace);
    return sv;
}

/**
 * create a song view for a song model
 * @param {DOM} workspace		the workspace DOM elem
 * @param {SongModel} songModel		song model containing song data
 * @param {boolean} interactive		interactive mode?
 * @type SongView
 */
function createSong(workspace, songModel, interactive) 
{
    if( !workspace) {
	alert( "internal error: no workspace!");
	return;
    }
    /*
     * associate a player with the model so that time indices
     * are "registered" with the player for swaras as we 
     * render them. So this must be done BEFORE the notations
     * are rendered
     */
    if( songModel.hasAudio() )
	songModel.setAudioManager( AudioManager.createPlayer() );

    var sv = new SongView(songModel, 1, false, songModel.getSpeedMarksPreference());	// 1 => # of tala cycles per row (TODO)
    sv.setInteractive(interactive);
    sv.render(workspace);

    var audiodiv = document.getElementById("audiodiv");
    if( songModel.hasAudio() ) {
	/**
	 * create the audio player control
	 */
	songModel.getAudioManager().createAudio(songModel.getAudio(), audiodiv);
    }
    else {
	audiodiv.style.display = "none";
    }
    return sv;
}

/**
 * create main menu and toolbats
 * @param {DOM}	parent			the parent DOM elem
 * @param {boolean} interactive		interactive mode?
 */
function createMenuAndToolBars(parent, interactive) 
{
    mainMenu = new MainMenu(parent, interactive);
    if( interactive )
	toolBarsManager= new ToolBarDisplayManager(parent);
}

/**
 * create the editor workspace
 * @param {DOM}	parent			the parent DOM elem
 * @param {boolean} menuAndToolBars	create main menu and tool bars?
 * @param {boolean} interactive		interactive?
 * @param {string}  height		height of worksspace  (css style)
 * @return DOM element representing editor workspace
 * @type DOM
 */
function createWorkspace(parent, menuAndToolbars, interactive, height)
{
    var inner = document.createElement("div");
    // WARNING: width MUST be present for opacity to work when forms are displayed
    inner.style.overflow = "auto";
    inner.style.width = "100%";
    //inner.style.height = "100%";
    if( height )
	inner.style.height = height;
    inner.style.padding = "0 0 0 0";
    // from css inner.style.border = "thin solid"; 
    // from css inner.style.background =  "rgb(224,224,224)";
    inner.style.top      = 0;
    inner.style.left      = 0;
    inner.style.zIndex    = 1;
    inner.id       = "Editor";
    inner.className = "Editor";
    inner.setAttribute( "class", "Editor");
    inner.setAttribute( "className", "Editor");
    parent.appendChild(inner);

    GamakaManager.init(parent);

    if(menuAndToolbars)
	createMenuAndToolBars(inner, interactive);

    // create a container of workspace that will have a fixed height
    // TODO: ideally this should occupy client height
    var workspaceouter = document.createElement("div");
    workspaceouter.style.width = "100%";
    workspaceouter.style.height = "95%";
    //workspaceouter.style.height = parent.offsetHeight-inner.offsetHeight-5;
    //workspaceouter.style.overflow = "auto";	// scrollbars as needed
    workspaceouter.className = "WorkspaceOuter";
    workspaceouter.id = "WorkspaceOuter";
    workspaceouter.setAttribute( "class", "WorkspaceOuter");
    workspaceouter.setAttribute( "className", "WorkspaceOuter");
    inner.appendChild(workspaceouter);

    // now create workspace inside but with padding so that actual song
    // content is not flushed to the left (TODO: ideally we would like it
    // centered)
    var workspace = document.createElement("div");
    workspace.style.height = "100%";
    //workspace.style.padding = "0.5em 0.5em 0.5em 0.5em";
    workspace.className = "Workspace";
    workspace.id = "Workspace";
    workspace.setAttribute( "class", "Workspace");
    workspace.setAttribute( "className", "Workspace");
    workspaceouter.appendChild(workspace);
    return workspace;
}

/**
 * update the contents of the workspace from the current contents of the command area
 */
function updateWorkspace()
{
    var v = "";
    var rawContents ;
    if( doCodePress ) {
	rawContents =  document.getElementById("rawContents_cp").previousSibling;	// IE (too) 
	rawContents.editor.syntaxHighlight();
	v = rawContents.getCode();
    }
    else {
	rawContents =  document.getElementById("rawContents");
	v = rawContents.value;
    }

    var t = v.replace(/^\s+|\s+$/, '');

    if( t == "" ) {
	alert("nothing specified!");
	return;
    }

    var oldContents = "" + theSongView.getModel().getRawContents();
    if( v == oldContents ) {
	// nothing changed.
	return;
    }

    var r = Song.prototype.fromRawText(t, true);
    if( r == null || r.fResult == null ) {
	if( r.fLine >= 0 ) {
	    alert( "Line # " + r.fLine + ": " + r.fFailureReason );
	    if( !doCodePress ) {
	    	gotoTextAreaLine(rawContents, r.fLine);

	    }
	}
	else
	    alert( r.fFailureReason );

	return;
    }

    var song = r.fResult;

    // delete current view
    var c = theSongView.getContents();
    if( c != null )
	c.parentNode.removeChild(c);
    createSong(editorWorkspace, song, false);
}

var newSongForm = null;

function onNewSong()
{
    var obj = document.getElementById("CmdArea");
    var x = LookAndFeel.findPosX(obj);
    var y = LookAndFeel.findPosY(obj);
    var o = new NewSongForm();
    if( !newSongForm ) {
	    newSongForm = new NewSongForm();
	    newSongForm.initForm(document.body,false,null,"New Song");
	    newSongForm.show(x,y);
    }
    else {
	newSongForm.show(x,y,true);	// show at last position
    }
}

function getNodeContents(node)
{
    var s = "";
    if( node.tagName )  {
	var t = node.tagName.toLowerCase();
	if( t.tagName == "p" || t.tagName == "br")
	    s += "\n";
    }
    else if( node.nodeValue )
	s += node.nodeValue;
    	
    var c = node.firstChild;
    while(c) {
	s += getNodeContents(c);
	c = c.nextSibling;
    }
    return s;
}

/**
 * in-line assist
 */
function onTextAreaKeyDown(e) {
    var cc = Utils.getCharFromEvent(e);
    if( cc == 9 ) {	// TAB Key
	var textArea = document.getElementById("rawContents");
    	var caretPos = getTextAreaCaretPosition(textArea);

	if(e.shiftKey == true || e.ctrlKey == true) {
	    replaceTextAreaContents(textArea, caretPos, caretPos, "\t");
	}
	else {
	    var v = textArea.value;
	    var sb;
	    var directiveLine = "";
	    var didReplace = false;


	    // see if caret is at a new line or a comma - only then we do
	    // in-line assist
	    var caretChar = v.charAt(caretPos);
	    if( caretChar == '\r' || caretChar != '\n' || caretChar != ',' ) {
		/*
		 * get the positions of start and end of line containing
		 * caret in sb and se
		 */
		if( caretPos == 0 )
		    sb = 0;
		else {
		    sb  = v.lastIndexOf("\n",caretPos);
		    if(sb == caretPos)
			sb  = v.lastIndexOf("\n",caretPos-1);
		}
		if( sb < 0 )
		    sb = 0;
		else
		    sb++;
		var se  = v.indexOf('\n',sb);


		/* now get the contents of line containing caret in directiveLine */
		if( se < 0 )
		    directiveLine = v.substring(sb);
		else
		    directiveLine = v.substring(sb, se);

		var snippets = null;
		if( directiveLine != "" ) {
		    /* parse the directive (if any) out */
		    var re = /([^:]+\s*:).*/;

		    var re_ret = re.exec(directiveLine);
		    var directive = directiveLine;
		    if( re_ret && re_ret.length == 2 ) {
			directive = re_ret[1];
		    }

		    /* 
		     * set the snippets based on whether complete directive is
		     * specified or not (else default one)
		     */
		    snippets = getSnippets(directive);
		}


		if( snippets != null && caretPos > 0 ) {
		    /* 
		     * we have snippets and there is a word preceding caret (which
		     * MUST be at \n or , 
		     */
		    var s  = caretPos;	// s => position of first letter in word
		    while( s > 0 ) {
			var c = v.charAt(s-1);
			if( (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')  || ( c >= '0' && c <= '9' ) )
			    s--;
			else
			    break;
		    }

		    var word = v.substring(s, caretPos);
		    if( word != "" ) {
			// search through snippets
			for( snip in snippets ) {
			    if( snippets[snip].input.toLowerCase() == word.toLowerCase() ) {
				replaceTextAreaContents(textArea, s, caretPos, snippets[snip].output);
				didReplace = true;
				break;
			    }
			}
		    }
		}
	    }
	}

	// TODO: IE only, others require stopDefault, stopPropagation
	e.returnValue = false;
	if( e.stop )
	    e.stop();
	if( e.preventDefault )
	    e.preventDefault();
	if( e.stopPropagation )
	    e.stopPropagation();
	return;
    }
}

function onOpen()
{
    var obj = document.body;
    var x = LookAndFeel.findPosX(obj);
    var y = LookAndFeel.findPosY(obj);

    var textArea = document.getElementById("rawContents");
    var openFileForm = new OpenFileForm(textArea);
    openFileForm.initForm(document.body);
    openFileForm.show(x,y);
}

function onSave()
{
    document.getElementById("content_form").submit();
}


function saveStart() {
    return true;
}

function saveComplete(response) {
    if( response.indexOf( "Error: cannot save" ) >= 0 ) {
	alert(response);
	return;
    }
}

// WARNING: PACKAGING CHANGES THE NEXT LINE
var about_loc = "../doc/about.html";
var release_loc = "/wordpress/cm-typesetter/carnatic-music-notation-typesetter-release-v15beta/";

function onAbout() {
	//document.location.href = about_loc;
	window.open( about_loc, "about_cmnt");
}

function onPrintView() {
    var inner         = document.getElementById( "inner" );
    var appHeading      = document.getElementById( "AppHeading" );

    appHeading.style.display = "none";
    inner.style.display = "none";
    
    var normalViewLink = document.createElement("a");
    normalViewLink.className = "NormalViewLink";
    normalViewLink.className = "NormalViewLink";
    normalViewLink.id = "NormalViewLink";
    normalViewLink.setAttribute( "class", "NormalViewLink");
    normalViewLink.setAttribute( "className", "NormalViewLink");
    normalViewLink.href = "javascript:void(0)";
    normalViewLink.onmousedown = onNormalView;
    normalViewLink.innerHTML = 'Back to Editor';
    normalViewLink.style.fontSize = "80%";

    inner.parentNode.appendChild(normalViewLink);

    var wsouter          = document.getElementById( "WorkspaceOuter");
    inner.parentNode.appendChild(wsouter);

    window.print();
}

function onNormalView()
{
    var inner          = document.getElementById( "inner" );
    var normalViewLink = document.getElementById( "NormalViewLink" );
    normalViewLink.parentNode.removeChild(normalViewLink);

    var wsouterTrueParent         = document.getElementById( "Editor" );
    var wsouter  = document.getElementById( "WorkspaceOuter" );
    wsouter.parentNode.removeChild(wsouter);
    wsouterTrueParent.appendChild(wsouter);

    var appHeading      = document.getElementById( "AppHeading" );
    var inner         = document.getElementById( "inner" );
    appHeading.style.display = "block";
    inner.style.display = "block";
}


function onSplitterMouseDown(e)
{
    if(!e && window.event) e = window.event;
    if(!e) return;
    var splitter = document.getElementById("Splitter");
    if(!splitter) return;
    splitter.splitting = true;
    splitter.splitLastY = e.clientY;
    splitter.docmousemove = document.onmousemove;
    document.onmousemove  = onSplitterMouseMove;
    splitter.docmouseup   = document.onmouseup;
    document.onmouseup    = onSplitterMouseUp;
    splitter.docmouseout  = document.onmouseout;
    document.onmouseOut   = onSplitterMouseOut;

    e.returnValue = false;
    if( e.stop )
	e.stop();
    if( e.preventDefault )
	e.preventDefault();
    if( e.stopPropagation )
	e.stopPropagation();
    return false;
}

function onSplitterMouseUp(e)
{
    if(!e && window.event) e = window.event;
    if(!e) return;
    var splitter = document.getElementById("Splitter");
    if(!splitter) return;
    splitter.splitting = false;
    document.onmouseup = splitter.docmouseup;
    document.onmousemove = splitter.docmousemove;
    document.onmouseout = splitter.docmouseup;

    e.returnValue = false;
    if( e.stop )
	e.stop();
    if( e.preventDefault )
	e.preventDefault();
    if( e.stopPropagation )
	e.stopPropagation();
    return false;
}

function onSplitterMouseMove(e)
{
    if(!e && window.event) e = window.event;
    if(!e) return;
    var splitter = document.getElementById("Splitter");
    var cmdarea  = document.getElementById("CmdArea");
    var rawcontents = document.getElementById("rawContents");
    var editor   = document.getElementById("Editor"); 
    if(!splitter || !cmdarea) return;
    if( splitter.splitting ) {
	var delta = (splitter.splitLastY - e.clientY);
	if( delta != 0 ) {
	    splitter.splitLastY = e.clientY;
	    adjustPaneSizes(delta);
	}
    }
    else {
	document.onmouseup   = splitter.docmouseup;
	document.onmousemove = splitter.docmousemove;
	document.onmouseout  = splitter.docmouseout;
    }

    e.returnValue = false;
    if( e.stop )
	e.stop();
    if( e.preventDefault )
	e.preventDefault();
    if( e.stopPropagation )
	e.stopPropagation();
    return false;
}


function onSplitterMouseOut(e)
{
    if(!e && window.event) e = window.event;
    if(!e) return;
    var splitter = document.getElementById("Splitter");
    if(!splitter) return;

    splitter.splitting = false;
    document.onmouseup = splitter.docmouseup;
    document.onmousemove = splitter.docmouseup;
    document.onmouseout = splitter.docmouseup;
}

var curDocHeight;
var curDocWidth;
var resizeTimeout = null;

function windowResized() {
    var newh = window.innerHeight;
    if( !newh && document.body.clientHeight )
	newh = document.body.clientHeight;

    var neww  = window.innerWidth;
    if( !neww && document.body.clientWidth )
	neww = document.body.clientWidth;

    if(!newh || !neww ) return;

    var hadj     = newh - curDocHeight;
    var wadj     = neww - curDocWidth;

    curDocHeight = newh;
    curDocWidth  = neww;
    //if( Utils.isIE() ) 
    	//hadj = hadj/2;

    var cmdarea       = document.getElementById( "CmdArea" );
    var rawcontents   = document.getElementById( "rawContents" );

    var borderAdjust = 0; // ((cmdarea.offsetHeight == parseInt(cmdarea.style.height)) ? 0 : 2);
    if( hadj ) {
	cmdarea.style.height     = cmdarea.offsetHeight + hadj - borderAdjust;	// for border
	rawcontents.style.height = rawcontents.offsetHeight + hadj; // no borderAdjust for FF/Opera
    }
    if( wadj ) {
	rawcontents.style.width  = rawcontents.offsetWidth  + wadj;	// for border
    }
}

function onWindowResize(e) {
    if( Utils.isIE() ) {
	if( resizeTimeout )
	    clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout( "windowResized()", 500 );
    }
    else 
	windowResized();
}

/**
 * adjust pane sizes
 */
function adjustPaneSizes(adj) 
{
    var editor        = document.getElementById("Editor"); 
    var cmdarea       = document.getElementById( "CmdArea" );
    var inner         = document.getElementById( "inner" );
    var cmdAreaCell   = document.getElementById( "cmdAreaCell" );
    var rawcontents   = document.getElementById( "rawContents" );
    var splitter      = document.getElementById( "Splitter" );
    var appHeading    = document.getElementById("AppHeading");

    editor.style.overflow = "auto";		// required for IE
    var borderAdjust = ((cmdarea.offsetHeight == parseInt(cmdarea.style.height)) ? 0 : 2);
    if( Utils.isIE() )
	editor.style.height = (editor.offsetHeight - adj);
    else
	editor.style.height = (editor.offsetHeight - adj - 2);

    cmdarea.style.height = cmdarea.offsetHeight + adj - borderAdjust;	// for border
    // grows too fast on Opera/Firefox
    rawcontents.style.height = rawcontents.offsetHeight + adj - borderAdjust;	// for border
}

function adjustInitialPaneSizes() 
{
    var cmdarea       = document.getElementById( "CmdArea" );
    var inner         = document.getElementById( "inner" );
    var cmdAreaCell   = document.getElementById( "cmdAreaCell" );
    var rawContents   = document.getElementById( "rawContents" );
    var splitter      = document.getElementById( "Splitter" );
    var appHeading    = document.getElementById("AppHeading");
    var editor        = document.getElementById("Editor");
    var h;
    if( Utils.isIE() ) {
	/*
	 * On IE cmdarea.offsetTop itself doesnt seem to be what
	 * we want - we must add the parent's offsetTop to get the
	 * right value to substract from parent's offsetHeight
	 *
	 * Also for IE, unlike others setting the inner.style.height
	 * to "fill out the rest" not only is not needed, it 
	 * seems to not work (i.e. comes out all wrong)
	 *
	 * Note: below -2 is to account for border of the element
	 * being adjusted (border is set to 1px in screen.css;
	 * 2 px is for top+bottom)
	 */
	cmdarea.style.height = inner.offsetHeight - 
			( inner.offsetTop + cmdarea.offsetTop ); //  - 2;
	h = cmdarea.offsetHeight - cmdAreaCell.offsetTop - 2;
    }
    else {
	/*
	 * non-IE. 
	 *
	 * Adjust inner to fill out rest of document area, and
	 * adjust cmdarea to fill bottom
	 *
	 * Note: below -2 is to account for border of the element
	 * being adjusted (border is set to 1px in screen.css;
	 * 2 px is for top+bottom)
	 */
	inner.style.height = (inner.parentNode.offsetHeight - inner.offsetTop - 2);

	/*
	 * Safari for some reason wants the appHeading.offsetHeight adjustment
	 */
	var appHeadingOffsetHeight = 54; // kludge
	cmdarea.style.height = inner.offsetHeight - cmdarea.offsetTop 
		    - (( Utils.isSafari() ) ?  appHeadingOffsetHeight : 0 );
	h = cmdarea.offsetHeight - cmdAreaCell.offsetTop - 2;	// do the -2
    }


    rawContents.style.height = h;
    rawContents.style.width = cmdarea.offsetWidth - 4 ;

    //alert(editor.offsetHeight);
    //editor.style.overflow = "auto";
    //editor.style.height = editor.offsetHeight;
    //alert(editor.offsetHeight);

    splitter.onmousedown = onSplitterMouseDown;
    curDocHeight = window.innerHeight;
    if( !curDocHeight && document.body.clientHeight )
	curDocHeight = document.body.clientHeight;
    curDocWidth  = window.innerWidth;
    if( !curDocWidth && document.body.clientWidth )
	curDocWidth = document.body.clientWidth;
    window.onresize = onWindowResize;
}


/*
* TURN OFF INTERACTIVE MODE
*/
var interactiveMode = false;
var postGamakaInitData = null;


function waitForGamakaInit()
{
    if( GamakaManager.havePendingGamakas() )
    {
    	setTimeout( "waitForGamakaInit()", 100 );
    }
    else {
    	onGamakasInited();
    }
}

/**
 * initialize the editor, loading contents if needed and returns the
 * song view
 *
 * @param {DOM}	parent		the parent DOM elem
 * @param {String} xmlNodeName	if not-null, XML node in document to import 
 *				song data from
 * @param {boolean} noSong	dont create song no song data
 * @type SongView
 */
function initEditor(parent, xmlNodeName, noSong) 
{

    /* turn off interactive mode */
    var interactive = false;

    /**
     * TODO: Safari does images "in background" and we may have to
     * do this in 2 stages - one in which LookAndFeel.init and
     * GamakaManager.init is done - and then rest of this (via
     * setTimeout)
     */
    LookAndFeel.init(parent, editorCodeBase + "src/l_and_f");

    if( Utils.isFirefox() )  {
	/* 
	 * the offsetWidth for inner.parentNode (see below) works better
	 * if we create this under the incoming parent - no idea why/how
	 * Creating this does not work for Opera (i.e. for it the incoming
	 * parent's offsetWidth works fine) - of course does not work
	 * for IE either
	 */
	var me = document.createElement("div");
	me.style.width = "100%";
	me.style.height = "100%";
	me.style.padding = "0";
	me.style.margin = "0";
	parent.appendChild(me);
	parent  = me;
    }


    var appHeading = document.createElement("div");
    appHeading.className = "AppHeading";
    appHeading.className = "AppHeading";
    appHeading.id = "AppHeading";
    appHeading.setAttribute( "class", "AppHeading");
    appHeading.setAttribute( "className", "AppHeading");

    var ihtml;
    ihtml =
	/* WARNING: PACKAGING CHANGES THE NEXT COMMENT LINE */
    	// SITEMETER
	"";
    ihtml +=
	// to generate title image - scaled down 80% after this
    	//'<div style="padding-bottom:0.2em;id;font-size:36;font-family:Monotype Corsiva;text-align:center;font-weight:normal;">Carnatic Music &nbsp; Notation  &nbsp; Typesetter (v1.2)</div>';

	// to generate release version
    	//'<div style="padding-bottom:0.2em;id;font-size:22;font-family:Monotype Corsiva;text-align:center;font-weight:normal;">(v1.2)</div>';

	'<div style="padding-top:7px; padding-bottom:7px;text-align:center;">'
	+ '<table style="display:inline;"><tr><td>'
    	+ '<a style="border:none;text-decoration:none;" href="' + about_loc + '">' + '<img style="border:none" ' +
			'onmouseOver="this.src = \'' + editorCodeBase + 'src/l_and_f/cmnt_fancy_title_smaller_darker.png\';"' +
			'onmouseOut="this.src = \'' + editorCodeBase + 'src/l_and_f/cmnt_fancy_title_smaller.png\';"' +
			' src="' + editorCodeBase + 'src/l_and_f/cmnt_fancy_title_smaller.png"/>' + '</a>'
	/*
    	+ '<a style="border:none;text-decoration:none;" href="' + release_loc + '">' + '<img style="border:none;" ' +
			'onmouseOver="this.src = \'' + editorCodeBase + 'src/l_and_f/version_image_darker.png\';"' +
			'onmouseOut="this.src = \'' + editorCodeBase + 'src/l_and_f/version_image.png\';"' +
    			'src="' + editorCodeBase + 'src/l_and_f/version_image.png"/>' + '</a>'
	*/
	+ '<td>'
    	+ '<a style="position:relative;top:3px;border:none;color:black;text-decoration:none;font-family:Arial,Tahoma,Helvetica,Tahoma;font-weight:bold;font-style:italic;font-size:16;" href="' + release_loc + '">' + "(v1.5 Beta)" + '</a>'
	+ '</table></div>'
	;

	// to generate About button (lot of post processing reqd to scrunch the text, and scale down by 80%)
    	//'<div style="padding-bottom:0.2em;id;font-size:19;font-family:Monotype Corsiva;text-align:center;font-weight:regular;"><span style="font-family:Arial;font-size:12;">About</span> c m n t</div>';
					//+ '</img></div>';
    appHeading.innerHTML = ihtml;
    parent.appendChild(appHeading);

    var inner = document.createElement("div");
    inner.style.width = "100%";
    inner.style.height = "100%";
    inner.style.padding = "0 0 0 0";
    inner.style.margin  = "0 0 0 0";
    inner.style.zIndex    = 1;
    inner.style.position  = "relative";
    inner.id = "inner";
    parent.appendChild(inner);

    var ht = "55%";
    if( Utils.isIE()  )
	ht = parseInt(parent.offsetHeight * 0.55);

    editorWorkspace = createWorkspace(inner, false, interactive, ht );

    var audiodiv = document.createElement("div");
    audiodiv.className = "Audio";
    audiodiv.setAttribute( "class", "Audio");
    audiodiv.setAttribute( "className", "Audio");
    audiodiv.id = "audiodiv";
    audiodiv.zIndex = 10;
    audiodiv.style.display = "none";
    audiodiv.style.width = 0;
    audiodiv.style.height = 0;
    inner.appendChild(audiodiv);
    //editorWorkspace.parentNode.style.height = "65%";

    var splitter = document.createElement("div");
    splitter.id   = "Splitter";
    splitter.style.width = "100%";
    splitter.style.height = "5";
    splitter.style.background = "#aaaaaa";
    splitter.style.cursor = "n-resize"; 
    splitter.style.overflow = "hidden";
    splitter.parent = parent;
    inner.appendChild(splitter);

    var cmdarea = document.createElement("div");
    cmdarea.style.width = "100%";
    //cmdarea.style.height = "35%";
    cmdarea.id       = "CmdArea";
    cmdarea.className = "CmdArea";
    cmdarea.setAttribute( "class", "CmdArea");
    cmdarea.setAttribute( "className", "CmdArea");
    cmdarea.style.overflow = "hidden";
    cmdarea.style.padding = "0 0 0 0";
    cmdarea.style.margin = "0";

    var s = '';
    s    += '<form  enctype="multipart/form-data" method="post"' 
	+ ' action="http://arunk.freepgs.com/cmnt/savefile.php"'
	+ ' name="content_form"'
	+ ' id="content_form"'
	+ ' onsubmit="return AIM.submit(this, {\'onStart\' : saveStart, \'onComplete\' : saveComplete})">';
    s    += '<table id="cmdAreatable" style="width:100%;margin:0 0 0 0;padding:0 0 0 0;position:relative;top:0;"><tr><td style="padding: 0 0 0 0;">';
    s    += '<div id="toolbarBox" style="width:100%;padding:0 0 0 0;">';
    s    += '</div>';
    s    += '<tr><td colspan="4" style="padding-top: 5px;padding-left: 5px;">';
    s    += '<span style="font-size:10pt;color:blue;"><i>Enter/edit notations for your song below:</i></td></tr>';
    s    += '<tr id="myrowtr" style="padding:0 0 0 0;margin:0 0 0 0;"><td id="cmdAreaCell" style="padding:0 0 0 0;margin:0 0 0 0;" valign="top">';
    s    += '<textarea id="rawContents" class="codepress cmne" style="word-wrap:normal;" name="rawContents"';
	s    += ' type="textarea" rows="1" cols="120"></textarea>';
	s    += '</table>';
	s    += '<form>';
	cmdarea.innerHTML = s;

    inner.appendChild(cmdarea);

    var dtoolbar=new dhtmlXToolbarObject("toolbarBox","100%","100%",0);
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/newsong.gif","New",70,25,0,'new','New Song'));
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/open.gif","Open",70,25,0,'open','Open'));
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/iconSave.gif","Save",70,25,0,'save','Save'));
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/help.png","Assist",70,25,0,'assist','Assistance in filling typesetter directives'));
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/update.png","Update",70,25,0,'update','Typeset the below notations and show the result'));
    dtoolbar.addItem(new dhtmlXDividerXObject("div"));
    dtoolbar.addItem(new dhtmlXImageButtonObject(editorCodeBase+"src/l_and_f/cmnt_logo_new.png",55,25,0,'about','About the Carnatic Music Typesetter'));
    dtoolbar.addItem(new dhtmlXDividerXObject("div"));
    dtoolbar.addItem(new dhtmlXImageTextButtonObject(editorCodeBase+"src/l_and_f/print.png","Print",70,25,0,'Print','Print View'));
    dtoolbar.setItemAction( "new", onNewSong );
    dtoolbar.setItemAction( "assist", onAssist );
    dtoolbar.setItemAction( "update", updateWorkspace );
    dtoolbar.setItemAction( "save", onSave );
    dtoolbar.setItemAction( "open", onOpen );
    dtoolbar.setItemAction( "about", onAbout );
    dtoolbar.setItemAction( "Print", onPrintView );

    dtoolbar.showBar();

    var cmdAreaTable = document.getElementById("cmdAreatable");
    var o = document.getElementById("rawContents");
    var rawContents = o;
    if( !doCodePress ) {
	if( Utils.isIE()) {
	    o.onkeydown = function() { onTextAreaKeyDown(event); } ;
	}
	else
	    o.setAttribute('onkeydown','onTextAreaKeyDown(event);');
    }

    var cmdAreaCell = document.getElementById("cmdAreaCell");
    var h; 

    /**
     * BEGIN some super-sensitive size adjustments to account
     * for different browser idiosyncracies ( "me" above is
     * also part of this
     */
    if( Utils.isSafari() )
	setTimeout( "adjustInitialPaneSizes()", 50 );
    else
	adjustInitialPaneSizes();


    postGamakaInitData = new Object();
    postGamakaInitData.xmlNode = xmlNodeName;
    postGamakaInitData.interactive = interactive;
    postGamakaInitData.noSong = noSong;
    waitForGamakaInit();
}


function onGamakasInited() 
{
    var xmlNodeName = postGamakaInitData.xmlNode;
    var noSong = postGamakaInitData.noSong;
    var interactive = postGamakaInitData.interactive;
    var xmlNode = null;
    if( xmlNodeName ) {
	xmlNode = document.getElementById( xmlNodeName );
	if( !xmlNode ) 
	    alert( "cannot locate song data!" );
    }
    if( xmlNode != null ) {
	var d = new Date();
	var t1 = d.getTime();

	var c = xmlNode.firstChild;
	var songNode = null;
	while(c != null ) {
	    if( XMLUtils.isModelNode(c) ) {
		if( XMLUtils.isXMLNode(c, Song.prototype.XMLTagName()))  {
		    songNode = c;
		    break;
		}
	    }
	    c = c.nextSibling;
	}
	if( songNode == null ) 
	    alert( "cannot locate song data!" );
	else
	{
	    var result = Song.prototype.fromXML(songNode);
	    if( result.fResult == null )
		alert("failed interpreting song data: " + result.fFailureReason);
	    else {
		var d2 = new Date();
		var t2 = d2.getTime();
		if( !noSong )
		{
		    var sv = createSong(editorWorkspace,result.fResult, interactive);
		    var d3 = new Date();
		    var t3 = d3.getTime();

		    var raw = result.fResult.getRawContents();
		    if( raw != null ) {
			var o = document.getElementById("rawContents");
			if( o ) {
			    o.value = raw;
			    if( o.spellcheck ) o.spellcheck = false;

			    //o.contentDocument.body.innerHTML = raw.replace( /\n/g, '<br>\n');
			    //alert( o.contentDocument.body.innerHTML );
			    //alert(o.contentDocument);
			}
		    }
		    //if( typeof(TESTING) == "undefined" || !TESTING )
			//alert("loaded in " + ((t2-t1)/1000) + " seconds\n" + 
				//"loaded and rendered in " + ((t3-t1)/1000) + " seconds" );
		    return sv;
		}
		return null;
	    }
	}
    }
    if( !noSong )
	return createNewSong(editorWorkspace,postGamakaInitData.interactive, null, null, 2); // 2 => default speed
    else
	return null;
}

/**
 * cleanup editor data
 */
function cleanupEditor() 
{
    LookAndFeel.cleanup();
}

/**
 * get the (singleton) editor workspace - created by initEditor
 */
function getEditorWorkSpace() 
{
    return editorWorkspace;
}


/**
 * (for testing purposes) is txt all whitespace
 */
function isWhite(txt) 
{
    var c = 0;
    while( c < txt.length ) {
	var ch = txt.charAt(c);
	if( ch != ' ' && ch != '\t' && ch != '\n' ) return false;
	c++;
    }
    return true;
}

/**
 * (for testing purposes) stringize a view element
 */
function printNode(n) 
{
    // since in IE style doesnt come out right, we can use outerHTML which is not too shabby
    if( n == null ) return "";
    if( n.outerHTML ) return n.outerHTML;

    var s = "<";
    s += n.tagName;

    var attrs = n.attributes;

    if( attrs && attrs.length > 0 ) {
	for(var i = 0; i < attrs.length; i++ ) {
	    if( attrs[i].specified ) {
		s += " " + attrs[i].nodeName + '="';
		s += attrs[i].nodeValue;
		s += '"';
	    }
	}
    }
    s += ">";

    if( n.childNodes ) {
	for( var i = 0; i < n.childNodes.length; i++ ) {
	    var c = n.childNodes[i];
	    if( c.nodeValue && !isWhite(c.nodeValue) ) 
		s += c.nodeValue;
	    if (c.nodeType != 1) continue;
	    else s += printNode(c);
	}
    }
    if ( n.nodeValue ) {
	s  += n.nodeValue;
    }
    s += "</";
    s += n.tagName;
    s += ">\n";
    return s;
}
