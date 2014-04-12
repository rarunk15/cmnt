var TESTING = true;

/**
 * @class
 * represents a test engine interface as visible to test scripts
 */
function TestEngineInterface()
{
}

/**
 * called by test-script to indicate a test/sub-test has completed and automated check
 * has determined the test results
 *
 * @param {boolean}	passed		 true or false indicating whether test passed or not
 * @param {String}	why		 (on failure) what in those expected results didnt match
 */
TestEngineInterface.prototype.automatedTestComplete = function(passed, why) {
    alert( "internal error: automatedTestComplete: invalid call" );
}
/**
 * called by test-script to indicate that test has completed, and we need to
 * manually check the results (and press Passed/Failed button)
 */
TestEngineInterface.prototype.eyeballTestComplete = function() {
    alert( "internal error: eyebalTestComplete: invalid call" );
}
/**
 * called by a test-script to indicate that it knows that a manual test has 
 * failed (and thus no manual check is needed e.g. if the test didnt complete 
 * through all steps owing to an exception)
 * @param {String}	why		what in those expected results didnt match
 */
TestEngineInterface.prototype.eyeballTestFailed = function(why) {
    alert( "internal error: eyebalTestFailed: invalid call" );
}

/**
 * called by a test script to provide information about test cases it contains
 * @param {TestCase[]}	subTests array of test cases
 */
TestEngineInterface.prototype.initTestCases = function(subTests) {
    alert( "internal error: initTestCases: invalid call" );
}

/**
 * @class
 * represents a test case
 * @constructor
 * @param {String} name					name  of the test case
 * @param {String} expResults				expected results from the test case
 * @param {function(TestEngineInterface)} fn		function that will run the test steps
 */
function TestCase(name, expResults, fn)
{
    /** 
     * get the name of the test case
     */
    this.getName = function() { return this.fName; }

    /** 
     * get the expected results of the test case
     */
    this.getExpectedResults = function() { return this.fExpectedResults; }

    /**
     * name of the test case
     * @type String
     * @private
     */
    this.fName     = name;

    /**
     * expected results from the test case
     * @type String
     * @private
     */
    this.fExpectedResults = expResults;

    /**
     * the function that runs the test steps
     * @type function(TestEngineInterface)
     * @private
     */
    this.fFn  = fn;

    /**
     * run the test case
     * @param {TestEngineInterface}	engine	the test engine, which should be notified when test is done
     */
    this.run = function(engine) {
	if( this.fFn ) {
	    try {
		this.fFn(engine);
	    }
	    catch(err) {
		var msg = "internal error: failed running test case function that runs the test steps";
		if( err.fileName ) 
		    msg += ":" + err.fileName;
		if( err.lineNumber ) 
		    msg += ":" + err.lineNumber;
		msg += ":" + err;

		engine.automatedTestComplete(false, msg );
	    }
	}
	else
	    engine.automatedTestComplete(false, "internal error: test case has no function to run the test steps");
    }
}
/**
 * @class
 * represents a simple automated test case
 * @constructor
 * @param {String} name					name  of the test case
 * @param {String} expResults				expected results from the test case
 * @param {String function(TestEngineInterface)} fn		function that will run the test steps and return
 *								null on success, or failure reason on error
 */
function SimpleAutoTestCase(name, expResults, fn)
{
    this.fAutoFn = fn;

    this.fName = name;
    this.fExpectedResults = expResults;

    /**
     * @ignore
     */
    this.fFn = function(engine) {
	var msg = this.fAutoFn();
	if( msg == null )
	    engine.automatedTestComplete(true,null);
	else
	    engine.automatedTestComplete(false,msg);
    }
}
SimpleAutoTestCase.prototype = new TestCase("","",null);

/**
 * @class
 * represents a simple manual test case
 * @constructor
 * @param {String} name					name  of the test case
 * @param {String} expResults				expected results from the test case
 * @param {String function(TestEngineInterface)} fn		function that will run the test steps and return
 *								null on success, or failure reason on error
 */
function SimpleManualTestCase(name, expResults, fn)
{
    this.fManualFn = fn;

    this.fName = name;
    this.fExpectedResults = expResults;

    /**
     * @ignore
     */
    this.fFn = function(engine) {
	var msg = this.fManualFn();
	if( msg == null )
	    engine.eyeballTestComplete();
	else
	    engine.eyeballTestFailed(msg);
    }
}
SimpleManualTestCase.prototype = new TestCase("","",null);


/**
 * @class
 * represents the html content of a heading view in the swara-editor
 */
function HeadingViewContent()
{
    /**
     * return whether or not the view is currently selected as discernible from the
     * html contents of its view
     * @return true or false indicating as to whether the view is currently selected
     *	       or not
     * @type boolean
     */
    this.isSelected = function() { return this.fSelected; }

    /**
     * get the text of the heading as discerned from its html content
     */
    this.getText = function() { return this.fText; }

    /**
     * get the alignment of the heading as discerned from its html content
     */
    this.getAlignment = function() { return this.fAlignment; }

    /**
     * get the font family of the heading as discerned from its html content
     */
    this.getFontFamily = function() { return this.fFontFamily; }

    /**
     * get the font size of the heading as discerned from its html content
     */
    this.getFontSize = function() { return this.fFontSize; }

    /**
     * based on what could be discerned from its html content, is the heading bold?
     */
    this.isBold = function() { return this.fBold; }

    /**
     * based on what could be discerned from its html content, is the heading italic?
     */
    this.isItalic = function() { return this.fItalic; }

    /**
     * get the alignment of the heading as discerned from its html content
     */
    this.getAlignment = function() { return this.fAlignment; }

    /**
     * initialize the object - <b>must</b> be called first
     * @param {HeadingView} view	the heading view whose html content would be parsed to
     *				check if its display adheres to what we expect
     * @return null if initialization was successful, else failure reason
     */
    this.init = function(view) {
	var contents = printNode(view.getContents());

	// remove new-lines
	var re = /\s/gm;
	var lContents = contents.replace( re, " " );

	/*
	 * get the attributes of td (to detect alignment)
	 * get the attributes of span inside it (to detect selected)
	 * get what is inside the span (text)
	 */
	var re = /(\<td[^\>]*\>).*(\<span[^\>]*class=["]*heading["]*[^\>]*\>)(.*)\<\/span\>/i;
	var i = re.exec(lContents);
	if( i == null || !i.length || i.length != 4 ) { return "cannot parse heading"; }

	var lalignre =  /text-align:[\s]*left/i;
	var ralignre =  /text-align:[\s]*right/i;
	var calignre =  /text-align:[\s]*center/i;
	if( i[1].match(lalignre) ) this.fAlignment = ALIGN_LEFT;
	else if( i[1].match(ralignre) ) this.fAlignment = ALIGN_RIGHT;
	else if( i[1].match(calignre) ) this.fAlignment = ALIGN_CENTER;

	if( this.fAlignment == -1 ) {
	    return "cannot parse heading alignment";
	}

	var selre = /border[^\s]*:[^;]*rgb\(0[\s]*,[\s]*0[\s]*,[\s]*255[\s]*\)/i;
	var selre1 = /border[^\s]*:[^;]*#0000ff/i;
	if( i[2].match(selre) || i[2].match(selre1) ) this.fSelected = true;

	var re_fontFamily = /font-family[\s]*:[\s]*["']([^;"]*)["'];/i;
	var ff = re_fontFamily.exec(i[2]);
	if(ff != null && ff.length == 2 )
	    this.fFontFamily = ff[1];

	var re_fontSize = /font-size[\s]*:[\s]*([0-9]*)/i;
	var fs = re_fontSize.exec(i[2]);
	if(fs != null && fs.length == 2 )
	    this.fFontSize = fs[1];

	var re_fontBold = /font-weight[\s]*:[\s]*bold/i;
	if( i[2].match(re_fontBold) )
	    this.fBold = true;

	var re_fontItalic = /font-style[\s]*:[\s]*italic/i;
	if( i[2].match(re_fontItalic) )
	    this.fItalic = true;

	this.fText = i[3];

	return null;
    }

    this.fSelected = false;
    this.fAlignment = -1;
    this.fText = null;

    this.fFontFamily = "default";
    this.fFontSize   = "default";
    this.fBold       = false;
    this.fItalic     = false;
}

/**
 * @class
 * represents the html content of a swara view in the swara-editor (also used
 * to interpret tala markers on swara rows)
 */
function SwaraViewContent()
{
    /**
     * initialize the object - <b>must</b> be called first
     * @param {SwaraView} view	the swara view whose html content would be parsed to
     *				check if its display adheres to what we expect
     * @param {boolean}   noSpeed	(optional) if true no speed lines
     * @return null on success, else failure reason
     */
    this.init = function(view, noSpeed) {
       var contents = printNode(view.getContents());
       var defaultSpeed = view.rowView().pageView().songView().getSong().getDefaultSpeed();

	// remove new-lines
	var re = /\s/gm;
	var lContents = contents.replace( re, " " );

	/*
	 * parse the octave-wrapper div and stuff inside it. Remember
	 * 1. The attributes of octavewrapper div as it will have the border to
	 *    indicate if current element is selected or not
	 * 2. The div element of tara stayi div/spacer
	 * 3. The div element of label div
	 * 4. The div element of mandra stayi div/spacer
	 */
	re = /(\<div[^\<]*class=["]*octavewrapper["]*[^\>]*>).*\<center[^\>]*\>(.*)\<\/center\>(.*)\<center[^\>]*\>(.*)\<\/center\>/i;
	var i = re.exec(lContents);

	if( i == null || !i.length || i.length < 5 ) { return "cannot parse octave"; }
	var tara = 0;
	var mandra = 0;

	var selre = /border[^\s]*:[^;]*rgb\(0[\s]*,[\s]*0[\s]*,[\s]*255[\s]*\)/i;
	var selre1 = /border[^\s]*:[^;]*#0000ff/i;
	if( i[1].match(selre) || i[1].match(selre1) ) this.fSelected = true;

	var editre = /insert-caret.gif/i;
	if( i[1].match(editre) ) this.fIsBeingEdited = true;


	// some browsers use background:, some background-color, some may use #000000
	// and some may use rgb(0,0,0)
	var black1 = /background[^\s]*:[\s]*#000000/i;
	var black2 = /background[^\s]*:[\s]*rgb\(0[\s]*,[\s]*0[\s]*,[\s]*0[\s]*\)/i;

	if( i[2].match(black1) || i[2].match(black2) ) tara = 1;
	if( i[4].match(black1) || i[4].match(black2) ) mandra = 1;

	var t = tara + mandra ;
	if( t > 1 ) return false;

	this.fOctave = 0;
	if( tara  ) this.fOctave = 1;
	else if( mandra ) this.fOctave = -1;

	var lblre = /\<div[^\>]*>(.*)\<\/div/i;
	var l = lblre.exec(i[3]);
	if( l == null || l.length != 2 )
	    return "cannot parse label";
	this.fLabel = l[1];


	/*
	 * do the speeds
	 */
	if( !noSpeed ) {
	    re = /(\<div[^\<]*class=["]*speed["]*[^\>]*>).*(\<div[^\<]*class=["]*speed["]*[^\>]*>).*(\<div[^\<]*class=["]*speed["]*[^\>]*>)/i;
	    i = re.exec(lContents);

	    if( i == null || !i.length || i.length < 4 )
		return "cannot deduce speed";
	    var spre = /border-top[^;]*solid/i;
	    var spre2 = /border-bottom[^;]*solid/i;	// speed markers can be below

	    var lines = 0;
	    for(var sp = 0; sp < 3; sp++ ) {
		if(i[1+sp].match(spre) || i[1+sp].match(spre2)) lines++;
	    }
	    this.fNSpeedLines = lines;
	    //alert(this.fLabel + ": " + i[1] + i[2] + i[3]);
	}
	else
	    this.fNSpeedLines = 0;

	return null;
    }

    /**
     * get the octave of the swara as discerned from the html contents of its view
     * @return the octave, 0 for madya, -1 for mandra and 1 for tara
     * @type int
     */
    this.getOctave = function() { return this.fOctave; }

    /**
     * get the number of speed lines that are shown in the swara view as discerned
     * from its html contents
     * @return the number of speed lines shown
     * @type int
     */
    this.getNSpeedLines  = function() { return this.fNSpeedLines; }

    /**
     * get the label of the swara as discerned from the html contents of its view
     * @return the label
     * @type String
     */
    this.getLabel = function() { return this.fLabel; }

    /**
     * return whether or not the view is currently selected as discernible from the
     * html contents of its view
     * @return true or false indicating as to whether the view is currently selected
     *	       or not
     * @type boolean
     */
    this.isSelected = function() { return this.fSelected; }

    /**
     * return whether or not the view is currently being edited as discernible from the
     * html contents of its view
     * @return true or false indicating as to whether the view is currently selected
     *	       or not
     * @type boolean
     */
    this.isBeingEdited = function() { return this.fIsBeingEdited; }


    this.fOctave      = 0;
    this.fNSpeedLines = 0;
    this.fLabel       = "";
    this.fSelected    = false;
    this.fIsBeingEdited = false;
}

/**
 * @class
 * represents the html content of a new swara spacer view in the swara-editor
 */
function NewSwaraSpacerViewContent()
{
    /**
     * return whether or not the view is currently selected as discernible from the
     * html contents of its view
     * @return true or false indicating as to whether the view is currently selected
     *	       or not
     * @type boolean
     */
    this.isSelected = function() { return this.fSelected; }

    /**
     * return whether or not the view is currently being edited as discernible from the
     * html contents of its view
     * @return true or false indicating as to whether the view is currently selected
     *	       or not
     * @type boolean
     */
    this.isBeingEdited = function() { return this.fIsBeingEdited; }

    /**
     * initialize the object - <b>must</b> be called first
     * @param {NewSwaraSpacerView} view	the swara view whose html content would be parsed to
     *				check if its display adheres to what we expect
     * @return null on success, else failure reason
     */
    this.init = function(view) {
	var contents = printNode(view.getContents());

	// remove new-lines
	var re = /\s/gm;
	var lContents = contents.replace( re, " " );

	var re_spacer = /(\<div[^\>]*class=["]*newswaraspacer["]*[^\>]*\>)/i;
	var i = re_spacer.exec(contents);

	if( i == null || !i.length || i.length != 2 ) return "not a swara spacer";

	var selre = /border[^\s]*:[^;]*rgb\(0[\s]*,[\s]*0[\s]*,[\s]*255[\s]*\)/i;
	var selre1 = /border[^\s]*:[^;]*#0000ff/i;
	if( i[1].match(selre) || i[1].match(selre1) ) this.fSelected = true;

	var editre = /insert-caret.gif/i;
	if( i[1].match(editre) ) this.fIsBeingEdited = true;

	return null;
    }

    this.fSelected    = false;
    this.fIsBeingEdited = false;
}

/**
 * @class
 * represents the html content of the stayi-selector
 */
function StayiSelectorContent()
{
    /**
     * initialize the object - <b>must</b> be called first
     * @param {StayiSelector} selector	the stayi selector whose html content would be parsed to
     *				check if its display adheres to what we expect
     * @return null if initialization was successful, else failure reason
     */
    this.init = function(selector) {
	var contents = printNode(selector.getContent());

	// remove new-lines
	var re = /\s/gm;
	var lContents = contents.replace( re, " " );
	var re = /\<div[^\>]*\>(tara|madya|mandra)\<\/div\>/i;
	var i = re.exec(lContents);
	if( i == null || i.length != 2 ) return "cannot parse stayi selector";
	if( i[1] == "madya" )
	    this.fOctave = 0;
	else if( i[1] == "tara" )
	    this.fOctave = 1;
	else if( i[1] == "mandra" )
	    this.fOctave = -1;
	else
	    return "cannot parse stayi selector";
	return null;
    }

    /**
     * get the octave as discernible from the display
     */
    this.getOctave = function()  { return this.fOctave; }

    /**
     * the octave as discernible from the display
     * @type int
     * @private
     */ 
    this.fOctave = null;
}

/**
 * @class
 * represents the html content of the Speed-selector
 */
function SpeedSelectorContent()
{
    /**
     * initialize the object - <b>must</b> be called first
     * @param {SpeedSelector} selector	the speed selector whose html content would be parsed to
     *				check if its display adheres to what we expect
     * @return null if initialization was successful, else failure reason
     */
    this.init = function(selector) {
	var contents = printNode(selector.getContent());

	// remove new-lines
	var re = /\s/gm;
	var lContents = contents.replace( re, " " );

	var re = /\<div[^\>]*\>([0-9]+\/[0-9]+)\<\/div\>/i;
	var i = re.exec(lContents);
	if( i == null || i.length != 2 ) return "cannot parse stayi selector";
	this.fDurationStr = i[1];
	return null;
    }

    /**
     * get the duration string as discernible from the display
     */
    this.getDurationStr = function()  { return this.fDurationStr; }

    /**
     * the duration as discernible from the display
     * @type String
     * @private
     */ 
    this.fDurationStr = null;
}

/**
 * @class
 * represents utility functions available for test cases
 */
function TestUtilsDefn()
{
    /**
     * given a song view, get the heading
     * @param {SongView} songView
     */
    this.getHeading = function(songView) {
       var page = songView.fFirstPart;
       var r = null;
       if( page ) {
	   r = page.fFirstPart;
	   while( r ) {
	       if( r.isSelectable() ) {
		   break;
	       }
	       r = r.next;
	   }
       }
       if( !r || r.partType() != PAGEVIEWPART_HEADING ) return null;
       return r;
    }

    /**
     * presuming heading toolbar is visible, set the text
     */
    this.setHeadingText = function(txt)
    {
       var htb = toolBarsManager.getHeadingToolBarManager();
       var lblBox = htb.getLabelBox();
       lblBox.getTextBox().value = txt;
       lblBox.onChange();
    }

    /**
     * presuming heading toolbar is visible, select heading font family
     */
    this.selectHeadingFontFamily = function(family) {
       var htb = toolBarsManager.getHeadingToolBarManager();
       htb.getFontFamilySelector().onFont(family);
       return true;
    }

    /**
     * presuming heading toolbar is visible, select heading font family
     */
    this.selectHeadingFontSize = function(size) {
       var htb = toolBarsManager.getHeadingToolBarManager();
       htb.getFontSizeSelector().onFontSize(size);
       return true;
    }


    /**
     * presuming heading toolbar is visible, select the heading bold button
     */
    this.selectHeadingBold = function()
    {
	var htb = toolBarsManager.getHeadingToolBarManager();
	htb.getBoldButton().setSelected(true);
	htb.getBoldButton().fireAction();
	return true;
    }

    /**
     * presuming heading toolbar is visible, select the heading italic button
     */
    this.selectHeadingItalic = function()
    {
	var htb = toolBarsManager.getHeadingToolBarManager();
	htb.getItalicButton().setSelected(true);
	htb.getItalicButton().fireAction();
	return true;
    }

    /**
     * presuming heading toolbar is visible, select left-alignment
     */
    this.selectHeadingAlignLeft = function()
    {
	return this.selectHeadingAlignment(ALIGN_LEFT);
    }

    /**
     * presuming heading toolbar is visible, select an alignment
     */
    this.selectHeadingAlignment = function(align) {
	var htb = toolBarsManager.getHeadingToolBarManager();
	htb.getAlignmentSelector().onAlignment(align);
	return true;
    }

    /**
     * presuming swara toolbar is visible, select a speed from the speed selector
     */
    this.selectSwaraSpeed = function(speed) {
	var stb = toolBarsManager.getSwaraToolBarManager();
	stb.getSpeedSelector().onSpeed(speed);
	return true;
    }

    /**
     * presuming swara toolbar is visible, select an octave from the octave selector
     */
    this.selectSwaraOctave = function(octave) {
	var stb = toolBarsManager.getSwaraToolBarManager();
	stb.getStayiSelector().onOctave(octave);
	return true;
    }

    /**
     * presuming swara toolbar is visible, select a gamaka from the gamaka selector
     */
    this.selectSwaraGamaka = function(gamaka) {
	var stb = toolBarsManager.getSwaraToolBarManager();
	stb.getGamakaSelector().onGamaka(gamaka);
	return true;
    }

    /**
     * send HOME key to swara label box
     */
    this.sendHomeKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox(36);
    }
    /**
     * send END key to swara label box
     */
    this.sendEndKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox(35);
    }
    /**
     * send LEFT key to swara label box
     */
    this.sendLeftKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox(37);
    }
    /**
     * send RIGHT key to swara label box
     */
    this.sendRightKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox(39);
    }
    /**
     * send UP key to swara label box
     */
    this.sendUpKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox(38);
    }
    /**
     * send DOWN key to swara label box
     */
    this.sendDownKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox( 40 );
    }
    /**
     * send INS key to swara label box
     */
    this.sendInsKeyToSwaraLabelBox = function() {
	return this.sendKeyToSwaraLabelBox( 45 );
    }

    /**
     * send a key (non-character) to swara label box
     */
    this.sendKeyToSwaraLabelBox = function(key) {
        var stb = toolBarsManager.getSwaraToolBarManager();
	var lblBox = stb.getLabelBox();
	return this.sendKeyToSwaraLabelBoxInternal(lblBox,key);
    }

    /**
     * presuming swara toolbar is visible, send text to the swara label box
     */
    this.sendTextToSwaraLabelBox = function(txt, append) 
    {
        var stb = toolBarsManager.getSwaraToolBarManager();
	var lblBox = stb.getLabelBox();

	//if( !append  )
	    //append = false;
	    ////lblBox.getTextBox().value = "";

	var l = txt.length;
	for( var i = 0; i < l; i++ ) {
	    var c = txt.charAt(i);
	    var kc = txt.charCodeAt(i);
	    var err = this.sendKeyToSwaraLabelBoxInternal(lblBox, kc, c, append );
	    if( err != null ) return err;
	    append = true;
	}
	return null;
    }

    /**
     * presuming swara toolbar is visible, send more text to the swara label box
     * (without clearing whats in there)
     */
    this.appendTextToSwaraLabelBox = function(txt) 
    {
	return this.sendTextToSwaraLabelBox(txt,true);
    }

    /**
     * internal routine that sends a single char/key to swara label box
     * @private
     */
    this.sendKeyToSwaraLabelBoxInternal = function (lblBox, kc, c, append ) {
	if( c == '+' ) kc = 187;
	else if( c == ',' ) kc = 188;
	else if( c == '-' ) kc = 189;
	else if( c == '.' ) kc = 190;
	else if( c == '`' ) kc = 192;
	else if( c == '\'' ) kc = 222;

	var evt = new Object();
	evt.keyCode = kc;
	evt.shiftKey = false;
	evt.altKey   = false;
	evt.metaKey  = false;

        var s, e;
        var sel = lblBox.saveSelection();
        s = sel.start;
        e = sel.end;
        var ltxt = lblBox.getTextBox().value;

	var handled = !lblBox.keydown(evt);
	if( !handled ) {
	   if( !c )  {
	       lblBox.keyup(evt);
	       return "error: labelbox handled key : " + kc + ", which is unexpected as no char was specified for key in test";
	   }
	   var l    = "";
	   if( append ) { 
	       l = ltxt.substring(0,s);
	       l += c;
	       l += ltxt.substring(e);

	       /*
	        * because of behaviour of IE, we have to do a delicate dance here
		* we send the keyup and check if due to that a new swara got
		* selected (on auto-advance) and its contents got fully selected.
		* If not, we assume current one got modified, and we restore
		* selection (note: normally an toEnd may suffice, but we are
		* trying to be more generic here)
		*/
	       lblBox.getTextBox().value = l;
	       sel.start = s+1;
	       sel.end   = s+1;

	       lblBox.keyup(evt);

	       var ns = lblBox.saveSelection();
	       if( ns.start == 0 && ns.end == lblBox.getTextBox().value.length )
	       		;
	       else
		   lblBox.restoreSelection(sel);
	   }
	   else {
	       l += c;
	       lblBox.getTextBox().value = l;
	       lblBox.keyup(evt);
	       lblBox.toEnd();
	    }
	}
	else
	    lblBox.keyup(evt);
	return null;
    }

    this.selectSwaraLabelBoxText = function() {
        var stb = toolBarsManager.getSwaraToolBarManager();
	var lblBox = stb.getLabelBox();
	lblBox.getTextBox().select();
    }


    /**
     * validate a heading view's appearance against what is expected
     * @param {HeadingView}	view		the swara view
     * @param {String}		text		the text of the heading that should appear in the view
     * @param {int}		selected	should the view appear as if it is selected?
     * @return null if everything matches, else a message indicating where the mismatch is
     */
    this.validateHeadingView = function(view, text, selected, alignment, fontFamily, fontSize, fontBold, fontItalic) {
       var h = new HeadingViewContent();
       var err = h.init(view);
       if( err != null ) 
	    return "cannot parse heading html contents: " + err;
       if( text != null && h.getText() != text )
	return "text mismatch: " + h.getText() + " vs " + text;
       if( selected != null && h.isSelected() != selected )
	return "selected mismatch: " + h.isSelected() + " vs " + selected;
       if( alignment != null && h.getAlignment() != alignment )
	return "text mismatch: " + h.getAlignment() + " vs " + alignment;
       if( fontFamily != null && h.getFontFamily().toLowerCase() != fontFamily.toLowerCase() )
	return "font family mismatch: " + h.getFontFamily() + " vs " + fontFamily;
       if( fontSize != null && h.getFontSize().toLowerCase() != fontSize.toLowerCase() )
	return "font size mismatch: " + h.getFontSize() + " vs " + fontSize;
       if( fontBold != null && h.isBold() != fontBold )
	return "font bold mismatch: " + h.isBold() + " vs " + fontBold;
       if( fontItalic != null && h.isItalic() != fontItalic )
	return "font bold mismatch: " + h.isFontItalic() + " vs " + fontItalic;
       return null;
    }

    /**
     * validate a swara view's appearance against what is expected
     * @param {SwaraView}	view		the swara view
     * @param {int}		octave		the octave we expect the view's appearance to reflect
     * @param {int}		speedLines	the # of speed lines that we expect to see
     * @param {String}	label		the label of the swara that should appear in the view
     * @param {int}		selected	should the view appear as if it is selected?
     * @param {int}		beingEdited	should the view appear as if it is being edited?
     * @return null if everything matches, else a message indicating where the mismatch is
     */
    this.validateSwaraView = function(view, octave, speedLines, label, selected, beingEdited) {
       var s = new SwaraViewContent();
       var err = s.init(view);
       if( err != null )
	    return "cannot parse swara html contents: " + err;
       if( s.getOctave() != octave )
	    return "octave mismatch: " + s.getOctave() + " vs " + octave;
       if( s.getNSpeedLines() != speedLines )
	    return "speed lines mismatch: " + s.getNSpeedLines() + " vs " + speedLines;
       if( s.getLabel() != label )
	    return "label mismatch: " + s.getLabel() + " vs " + label;
       if( s.isSelected() != selected )
	    return "selected mismatch: " + s.isSelected() + " vs " + selected;
       if( s.isBeingEdited() != beingEdited )
	    return "being edited mismatch: " + s.isBeingEdited() + " vs " + beingEdited;
       return null;
    }

    /**
     * validate a swara spacer view's appearance against what is expected
     * @param {NewSwaraSpacerView}	view		the swara spacer view
     * @param {int}		selected	should the view appear as if it is selected?
     * @param {int}		beingEdited	should the view appear as if it is being edited?
     * @return null if everything matches, else a message indicating where the mismatch is
     */
    this.validateNewSwaraSpacerView = function(view, selected, beingEdited) {
       var s = new NewSwaraSpacerViewContent();
       var err = s.init(view);
       if( err != null )
	    return "cannot parse new swara spacer html contents: " + err;
       if( s.isSelected() != selected )
	    return "selected mismatch: " + s.isSelected() + " vs " + selected;
       if( s.isBeingEdited() != beingEdited )
	    return "being edited mismatch: " + s.isBeingEdited() + " vs " + beingEdited;
	return null;
    }

    /**
     * validate a tala marker view's appearance against what is expected
     * @param {TalaMarkerView}	view		the tala marker view
     * @param {String}		marker		the marker
     */
    this.validateTalaMarkerView = function(view, marker) {
       //var t = new TalaMarkerViewContent();
       //var err = t.init(view);
       //if( err != null )
	    //return "cannot parse tala marker html contents: " + err;
       var s = new SwaraViewContent();
       var err = s.init(view, true);	// true => no speed
       if( err != null )
	    return "cannot parse tala marker html contents: " + err;
       if( s.getLabel() != marker )
	    return "marker mismatch: " + s.getLabel() + " vs " + marker;
       if( s.getOctave() != 0 )
	    return "octave mismatch: " + s.getOctave() + " vs " + 0;
       if( s.getNSpeedLines() != 0 )
	    return "speed lines mismatch: " + s.getNSpeedLines() + " vs " + 0;
       if( s.isSelected() != false )
	    return "selected mismatch: " + s.isSelected() + " vs " + false;
       if( s.isBeingEdited() != false )
	    return "being edited mismatch: " + s.isBeingEdited() + " vs " + false;
       return null;
    }

    /**
     * validate a row view part
     * @param {RowViewPart}	view
     * @param {String}		shorthand representation of what we expect
     *				the part to be: can be one of <ol>
     *				<li> &lt;new&gt;:selected:editing
     *				<li> label:octave:speedlines:selected:editing
     *				<li> |	(talamarker)
     *				<li> ||	(talamarker)
     *				</ol> where selected, editing are true|false,
     *				octave is 0|1|-1 and speedlines is 0|1|2
     */
    this.validateSwaraRowPartShortHand = function(view, shorthand) {
	// shorthand
	// txt:octave:speed:bool_selected:bool_edited
	//		or
	// <spacer>[:bool_selected][:bool_edited]
	var spacer_check_re = /^\<new\>/i;
	var tala_check_re   = /^(\|$|\|\|$)/i;
	if( shorthand.match(spacer_check_re) ) {
	    var spacer_re = /\<new\>:(true|false):(true|false)/i;
	    var i = spacer_re.exec(shorthand);
	    if( i == null || i.length != 3 ) {
		return "test error: invalid short hand for spacer: " + shorthand;
	    }
	    var selected = false;
	    if( i[1].toLowerCase() == "true" ) selected = true;
	    var beingEdited = false;
	    if( i[2].toLowerCase() == "true" ) beingEdited = true;
	    return this.validateNewSwaraSpacerView(view, selected, beingEdited);
	}
	if( shorthand.match(tala_check_re) ) {
	    var i = tala_check_re.exec(shorthand);
	    if( i == null || i.length != 2 )
		return "test error: invalid short hand for tala marker: " + shorthand;
	    return this.validateTalaMarkerView(view, i[1]);
	}
	else {
	    var swara_re = /([^:]*):(-1|0|1):(0|1|2):(true|false):(true|false)/i;
	    var i = swara_re.exec(shorthand);
	    if( i == null || i.length != 6 ) {
		return "test error: invalid short hand for swara: " + shorthand;
	    }
	    var label = i[1];
	    var octave = i[2];
	    var speedLines = i[3];
	    var selected = false;
	    if( i[4].toLowerCase() == "true" ) selected = true;
	    var beingEdited = false;
	    if( i[5].toLowerCase() == "true" ) beingEdited = true;

	    return this.validateSwaraView(view, octave, speedLines, label, selected, beingEdited);
	}
    }


    /**
     * validate the contents of a swara row against what we expect
     * @param {SwaraLyricRowView} rowView	the swara row view
     * @param {Array} 		 contentsShortHand	an array of short-hand representation
     *							of what we expect each row part
     *							to be
     */
    this.validateSwaraRow = function(rowView, contentsShortHand) {
	var tr = rowView.getContents();	// get the DOM for the table-row
	if( !tr || !tr.cells )
	    return "validateSwaraRow: not a table row";
	if( !rowView.getCellCount )
	    return "validateSwaraRow: not a swara row";
	var cellCount = rowView.getCellCount();
	var cidx = 0;
	for( var i = 0; cidx < contentsShortHand.length && i < cellCount; i++ ) {
	    var cell = rowView.getCellContents(i);
	    if( !cell ) {
		return "failed validating " + shortHand +  ": " + " no such cell in row";
	    }
	    else if( cell.view ) {
		var view = cell.view;

		var shortHand = contentsShortHand[cidx++];

		var err = this.validateSwaraRowPartShortHand(view, shortHand);
		if( err != null )
		    return "failed validating " + shortHand +  ": " + err;
	    }
	}
	if(  cidx != contentsShortHand.length )
	    return "validateSwaraRowView: expected " + contentsShortHand.length + "parts, processed only " + cidx + " parts";
	return null;
    }

    /**
     * validate the display of stayi selector against what we expect
     * @param {int}	octave			the octave which should be displayed
     */
    this.validateStayiSelector = function(octave) {
        var stb = toolBarsManager.getSwaraToolBarManager();
	var selector = stb.getStayiSelector();

	var ss = new StayiSelectorContent();
	var err = ss.init(selector);
	if( err != null ) 
	    return "cannot parse stayi selector contents: " + err;
	if( ss.getOctave() != octave )
	    return "stayi selector display mismatch: " + ss.getOctave() + " vs " + octave;
	return null;
    }

    /**
     * validate the display of speed selector against what we expect
     * @param {String}	durationStr	the duration string that should be displayed
     */
    this.validateSpeedSelector = function(durationStr) {
        var stb = toolBarsManager.getSwaraToolBarManager();
	var selector = stb.getSpeedSelector();

	var ss = new SpeedSelectorContent();
	var err = ss.init(selector);
	if( err != null ) 
	    return "cannot parse speed selector contents: " + err;
	if( ss.getDurationStr() != durationStr )
	    return "speed selector display mismatch: " + ss.getDurationStr() + " vs " + durationStr;
	return null;
    }


    this.validateMenu = function( menu, contentsShortHand ) {
	var table = menu.fMenuTable;
	if( !table || !table.rows ) {
	    return "validateMenu: not a table: " + table;
	}

	if( contentsShortHand == null ) {
	    return "validateMenu: invalid expected data passed in";
	}

	var ridx = 0;
	var err;
	for( var i = 0; ridx < contentsShortHand.length && i < table.rows.length; i++ ) {
	    var tr = table.rows[i];
	    if( tr.cells && tr.cells.length ) {
		err = this.validateMenuItemInternal( tr.cells[0].innerHTML, contentsShortHand[ridx++] )
		if( err != null ) return "failed on menu item  #" + (ridx-1) + ": " + err;
	    }
	}
	if(  ridx != contentsShortHand.length )
	    return "validateMenu: expected " + contentsShortHand.length + "items, processed only " + ridx + " items";
	return null;
    }

    this.validateMenuItemInternal = function( menuItemContents, shortHand ) {
	// remove new-lines
	var re = /\s/gm;
	var lContents = menuItemContents.replace( re, " " );

	var break_re = /^\<break\>$/i;
	if( shortHand.match(break_re) ) {
	    if( menuItemContents.match( /\<hr\>/i ))
		return null;
	    else
		return "menu item break mismatch: expected break";
	}
	else {
	    var menuitem_re = /([^:]*):(true|false)$/i;
	    var i = menuitem_re.exec(shortHand);
	    if( i == null || i.length != 3 ) {
		return "test error: invalid short hand for menu-item: " + shortHand;
	    }
	    var label = i[1];
	    var enabled = false;
	    if( i[2].toLowerCase() == "true" ) enabled = true;


	    if( menuItemContents.indexOf( label ) < 0 ) {
		return "menu item text mismatch: could not find '" + label + "' in menu item contents";
	    }

	    //alert( menuItemContents );
	    //return "error";

	    var menuitemcontents_restr = / + label + /i;
	    var disabledre = /color[\s]*:[^;]*rgb\(136[\s]*,[\s]*136[\s]*,[\s]*136[\s]*\)/i;
	    var disabledre1 = /color[\s]*:[^;]*#888888/i;
	    var menuitem_enabled = true;
	    if( menuItemContents.match(disabledre) || menuItemContents.match(disabledre1) ) menuitem_enabled = false;

	    if( menuitem_enabled  != enabled ) {
		return "menu item enable/disable mismatch: " + menuitem_enabled + " vs " + enabled;
	    }
	    return null;
	}
    }


    /**
     * show the insert menu
     */
    this.showInsertMenu = function() {
       mainMenu.doAction( mainMenu.getEditMenuItem(), mainMenu.ACTION_INSERT_MENU );
    }

    /**
     * show the file menu
     */
    this.showFileMenu = function() {
       mainMenu.doAction( mainMenu.getFileMenuItem(), mainMenu.ACTION_INSERT_MENU );
    }

    /**
     * construct short hand for use in validating insert menu display
     * @param {Array} states array of booleans indicating what we expect the enabled/disabled
     *		             states of the insert menu items to be. The # of elements 
     *			     here <b>must</b> match the elements in the insert menu (discounting
     *			     breaks)
     * @return an array consistinng of short-hand representation of insert menu display for
     *	       use in {@link TestUtils#validateMenu} or null if invalid data is passed-in
     * @type Array
     */
    this.constructInsertMenuShortHand = function( states ) {
	var id = 0;
	if( states.length != 7 ) return null;
	return new Array( "Insert text before:" + states[id++],
			  "Insert text after:"  + states[id++],
			  "<break>",
			  "Insert notation block before:"  + states[id++],
			  "Insert notation block after:"  + states[id++],
			  "<break>",
			  "Append notations at end:"  + states[id++],
			  "Add Lyrics:"  + states[id++],
			  "<break>",
			  "Insert Swara Mode:"  + states[id++] );
    }

    /**
     * run test cases
     */
    this.runScript = function(testCases) {
	if( !top.testDriver ) {
	    // standalone
	    var TestEngine = new TestEngineDefn();
	    TestEngine.runTestsSingle(document.body, testCases);
	}
	else
	    top.testDriver.document.engine.initTestCases(testCases);
    }

    /**
     * cleanup after a test script is done
     */
    this.cleanup = function() {
	try {
	    unloadEditor();
	}
	catch(err) {
	}
    }

}
TestUtils = new TestUtilsDefn();
if( !top.testDriver )
	document.write('<script type="text/javascript" src="testengine.js"></script>');
