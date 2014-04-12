/**
 * @class
 * represents a test script, which has a name and a "url" associated with it
 * <p>
 * Initially the test script has no test cases associated with. Once the test
 * script is run by the engine, the script will provide the engine with
 * test cases it contains (see {@link TestEngineInterface#initTestCases}). The
 * engine will call {@link TestScript#initTestCases} to initialize the test
 * cases
 *
 * @constructor
 * @param {String} name		name  of the test script
 * @param {String} file		the url of the test script
 */
function TestScript(name, file)
{
    /**
     * has the script been initialized with test cases?
     * @return whether the script been initialized with test cases?
     * @type boolean
     */
    this.haveTestCases = function() {
	return this.fHaveTestCases;
    }

    /**
     * called to initialize the test cases in the script
     */
    this.initTestCases = function(testCases) {
	this.fTestCases   = testCases;
	this.fTestCaseIdx = 0;
	this.fHaveTestCases = true;
    }


    /**
     * get the next test-case to be run (if any)
     * @return the next test-case to be run (if any)
     * @type TestCase
     */
    this.nextTestCase = function() {
	if( this.fTestCases == null || this.fTestCaseIdx >= this.fTestCases)
	    return null;
	return this.fTestCases[this.fTestCaseIdx++];
    }

    /**
     * name of the test case
     */
    this.fName     = name;

    /**
     * url of the test script
     */
    this.fFile     = file;

    /**
     * test cases in the test script
     */
    this.fTestCases = null;

    /**
     * have we been initialized with test cases?
     */
    this.fHaveTestCases = false;
}

var currentEngine;

function runNextEngineTest() {
    if( currentEngine )
	currentEngine.runNextTestDelayed();
}

/**
 * @class
 * represents the test engine
 */
function TestEngineDefn()
{
    /**
     * add a test script to be run
     */
    this.addTestScript = function(name, file) {
	this.fTestScripts[this.fTestScripts.length] = new TestScript( name, file );
    }

    /**
     * start the engine and run the tests
     */
    this.runTests = function(parent) {
	this.initDisplay(parent);
	this.runNextTest();

    }

    this.runTestsSingle = function(parent, testCases) {
	this.fSingleScriptMode = true;
	if( this.fTestScripts.length > 0 ) 
	    this.fTestScripts = new Array();
	this.fTestScripts[this.fTestScripts.length] = new TestScript( "Local Test", "" );

	var d = document.createElement("div");
	d.style.height = "25%";
	d.style.display = "block";
	d.style.overflow = "scroll";
	parent.appendChild(d);

	this.initDisplay(d);

	this.fCurTestScript = 0;
	this.fCurRow = 1;
	this.initTestCases(testCases);
	this.runNextTest();
    }

    /**
     * initialize the display area
     * @private
     */
    this.initDisplay = function(parent) {
	this.fParent = parent;

	this.fTestTable = document.createElement( "table" );
	this.fTestTable.style.width = "95%";
	this.fTestTable.border = "1";
	var tr, td;

	tr = this.fTestTable.insertRow(0);
	td = tr.insertCell(0);
	td.appendChild( document.createTextNode("Test Script"));
	td.style.backgroundColor = "rgb(128,128,128)";
	td.style.color = "rgb(255,255,255)";
	td.style.width = "5%";
	td.style.fontWeight = "bold";

	td = tr.insertCell(1);
	td.appendChild( document.createTextNode("Test Case"));
	td.style.backgroundColor = "rgb(128,128,128)";
	td.style.fontWeight = "bold";
	td.style.width = "15%";
	td.style.color = "rgb(255,255,255)";

	td = tr.insertCell(2);
	td.appendChild( document.createTextNode("Expected Results"));
	td.style.backgroundColor = "rgb(128,128,128)";
	td.style.color = "rgb(255,255,255)";
	td.style.width = "50%";
	td.style.fontWeight = "bold";

	td = tr.insertCell(3);
	td.appendChild( document.createTextNode("Status"));
	td.style.backgroundColor = "rgb(128,128,128)";
	td.style.color = "rgb(255,255,255)";
	td.style.width = "5%";
	td.style.fontWeight = "bold";

	td = tr.insertCell(4);
	td.appendChild( document.createTextNode("Failure Reason"));
	td.style.backgroundColor = "rgb(128,128,128)";
	td.style.color = "rgb(255,255,255)";
	td.style.fontWeight = "bold";
	td.style.width = "25%";


	for(var i = 0; i < this.fTestScripts.length; i++ ) {
	    tr = this.fTestTable.insertRow(i+1);

	    // test script name
	    td = tr.insertCell(0);
	    td.appendChild( document.createTextNode(this.fTestScripts[i].fName ));
	    td.style.fontWeight = "bold";

	    // test case name
	    var td2 = tr.insertCell(1);

	    // column for expected results 
	    var td3 = tr.insertCell(2);
	    td3.appendChild( document.createTextNode("") );

	    // column for test-status
	    var td4 = tr.insertCell(3);
	    td4.appendChild( document.createTextNode(" ") );

	    // column for test results
	    var td5 = tr.insertCell(4);
	    td5.appendChild( document.createTextNode(" "));
	}
	parent.appendChild(this.fTestTable);

	// start-test/run-next-test button
	var i = document.createElement("input");
	i.type = "button";
	i.value = "Run next test";
	i.onclick = this.onNextTest;
	i.engine = this;
	this.fStartTestButton = i;
	parent.appendChild(i);

	// "Passed" button
	this.fTestPassedButton = document.createElement("input");
	this.fTestPassedButton.type = "button";
	this.fTestPassedButton.value = "Passed";
	this.fTestPassedButton.onclick = this.onPassed;
	this.fTestPassedButton.engine  = this;
	this.fTestPassedButton.enabled = false;	// disabled initially
	parent.appendChild(this.fTestPassedButton);

	// "Failed" button
	this.fTestFailedButton = document.createElement("input");
	this.fTestFailedButton.type = "button";
	this.fTestFailedButton.value = "Failed";
	this.fTestFailedButton.onclick = this.onFailed;
	this.fTestFailedButton.engine  = this;
	this.fTestFailedButton.enabled = false;	// disabled initially
	parent.appendChild(this.fTestFailedButton);

	// area for indicating what to check for in expected results
	this.fCheckResult = document.createElement("div");
	this.fCheckResult.style.display =  "none";
	this.fCheckResult.style.fontStyle = "italic";
	this.fCheckResultContent = document.createTextNode(this.fDefaultCheckResultContent);
	this.fCheckResult.appendChild(this.fCheckResultContent);
	document.body.appendChild(this.fCheckResult);

	document.engine = this;
    }

    /**
     * called when next-test button is pressed (walk mode)
     * @private
     */
    this.onNextTest = function() {
	if( this.engine ) {
	    this.engine.runNextTest(); 
	}
    }

    /**
     * called when passed button is pressed (manual check)
     * @private
     */
    this.onPassed = function()
    { 
	if( this.engine ) {
	    this.engine._passed(); 
	}
    }

    /**
     * called when failed button is pressed (manual check)
     * @private
     */
    this.onFailed = function() 
    { 
	if( this.engine ) {
	    // indicate failed (with test-result indicating what we checked for)
	    this.engine._failed("Manual Check failed");
	}
    }

    /**
     * a test has passed
     */
    this._passed = function() {
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].style.color          = "green";
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].firstChild.nodeValue = "Passed";
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_MSG_COLUMN].firstChild.nodeValue    = "";

	this.fTestFailedButton.disabled = true;
	this.fTestPassedButton.disabled = true;
	if( this.fWalkMode )
	    this.fStartTestButton.disabled = false;
	else
	    this.runNextTest();
    }

    /**
     * a test has failed
     * @param {String} msg	reason for failure
     */
    this._failed = function(msg) 
    {
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].style.color          = "red";
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].firstChild.nodeValue = "Failed";
	this.fTestTable.rows[this.fCurRow].cells[this.TEST_MSG_COLUMN].firstChild.nodeValue    = msg;

	this.fTestFailedButton.disabled = true;
	this.fTestPassedButton.disabled = true;
	if( this.fWalkMode )
	    this.fTtartTestButton.disabled = false;
	else
	    this.runNextTest();
    }

    /**
     * implementation of {@link TestEngineInterface#automatedTestComplete}
     */
    this.automatedTestComplete = function(passed, why) {
	if( passed )
	    this._passed();
	else 
	    this._failed(why);
    }

    /**
     * implementation of {@link TestEngineInterface#eyeballTestComplete}
     */
    this.eyeballTestComplete = function() {
	this.fCheckResultContent.nodeValue = this.fDefaultCheckResultContent;
	this.fCheckResult.style.color = "";
	this.fCheckResult.style.display = "block";

	// enable the Passed/Failed button
	this.fTestFailedButton.disabled = false;
	this.fTestPassedButton.disabled = false;
    }

    /**
     * implementation of {@link TestEngineInterface#eyeballTestFailed}
     */
    this.eyeballTestFailed = function(why) {
	this._failed(why);
    }
    /**
     * implementation of {@link TestEngineInterface#initTestCases}
     */
    this.initTestCases = function(testCases) {
	if( !testCases.length || testCases.length < 0 ) {
	    this._failed("test script internal error: invalid sub-test information passed");
	    return;
	}
	else if( testCases.length == 0 ) {
	    this._failed("test script has no subtest");
	    return;
	}

	var row = this.fCurRow;
	         	
	for(var i = 0; i < testCases.length; i++ ) {
	    tr = this.fTestTable.insertRow(++row);

	    // test script name
	    td = tr.insertCell(0);
	    td.appendChild( document.createTextNode(""));

	    // test case name
	    var td2 = tr.insertCell(1);
	    td2.appendChild( document.createTextNode(testCases[i].getName()) );
	    td2.style.fontStyle = "italic";

	    // column for expected results 
	    var td3 = tr.insertCell(2);
	    td3.appendChild( document.createTextNode(testCases[i].getExpectedResults()));

	    // column for test-status
	    var td4 = tr.insertCell(3);
	    td4.appendChild( document.createTextNode("Not yet Run") );

	    // column for test results
	    var td5 = tr.insertCell(4);
	    td5.appendChild( document.createTextNode("\x80"));
	}
	// initialize the script
	this.fTestScripts[this.fCurTestScript].initTestCases(testCases);
	this.runNextTest();

    }

    this.runNextTest = function() {
	currentEngine = this;
	setTimeout( "runNextEngineTest();", 100);
    }

    /**
     * run the next test case in current script or next script
     */
    this.runNextTestDelayed = function()
    {
	if( this.fCurTestScript >= this.fTestScripts.length )
	    return;

	var testCase = null;
	var newTest = false;
	if( this.fCurTestScript == -1 ) {
	    this.fCurRow = 0;
	    newTest = true;
	}
	else {
	    var script = this.fTestScripts[this.fCurTestScript];
	    testCase = script.nextTestCase();
	    if( testCase == null )
		newTest = true;
	}
	
	if( newTest ) {
	    this.fCurTestScript++;
	    if ( this.fCurTestScript >= this.fTestScripts.length ) {
	       var d = document.createElement("div");
	       d.style.fontWeight = "bold";
	       d.appendChild( document.createTextNode( "All tests complete" ));
	       document.body.appendChild(d);
	       this.fParent.scrollTop = d.offsetTop;
	       return;
	    }
	}

	this.fCurRow++;
	this.fStartTestButton.disabled = true;
	this.fTestFailedButton.disabled = false;
	this.fTestPassedButton.disabled = false;
	this.fCheckResult.style.display = "none";
	if( newTest ) {
	    if( this.fSingleScriptMode )  {
		this._failed( "internal error: cannot start new test script when in single script mode" );
		return;
	    }

	    // TODO: start timer for test case to report back!
	    try {
		top.testArea.document.location.href = this.fTestScripts[this.fCurTestScript].fFile;
	    }
	    catch(err) {
		this._failed( "failed to load page: " + err );
	    }
	    return;
	}
	else {
	    this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].style.color = "blue";
	    this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].firstChild.nodeValue = "running";
	    //this.fTestTable.scrollTop = this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].offsetTop;
	    this.fParent.scrollTop = this.fTestTable.rows[this.fCurRow].cells[this.TEST_STATUS_COLUMN].offsetTop;
	}
	testCase.run(this);
    }

    /**
     * test scripts to be run
     * @type TestScript[]
     * @private
     */
    this.fTestScripts = new Array();

    /**
     * current test script
     */
    this.fCurTestScript = -1;

    /**
     * the HTML table that the engine used to show status of tests
     * @type DOMElement_TABLE
     * @private
     */
    this.fTestTable = null;

    /**
     * current row in the table display for the current test-case/test-script
     * @type int
     * @private
     */
    this.fCurRow = -1;

    /**
     * the start-test button, used when testing is done in "walk mode" (NOT YET IMPLEMENTED)
     * @type DomElement_INPUT
     * @private
     */
    this.fStartTestButton = null;

    /**
     * the "Failed" button, used when a test-case requires manual validation
     * @type DomElement_INPUT
     * @private
     */
    this.fTestFailedButton = null;

    /**
     * the "Passed" button, used when a test-case requires manual validation
     * @type DomElement_INPUT
     * @private
     */
    this.fTestPassedButton = null;

    /**
     * the element that contains the message which tells the user what to check for in a test
     * case (used when a test case requires manual validation)
     * @type DomElement_DIV
     * @private
     */
    this.fCheckResult = null;

    /**
     * the text-node displaying the message which tells the user what to check for in a test
     * case (used when a test case requires manual validation)
     * @type DomElement_Text
     * @private
     */
    this.fCheckResultContent = null;


    /**
     * default message that tells user what to check for in a test case (used when a test
     * case requires manual validation)
     */
    this.fDefaultCheckResultContent = "check editor display to see if it matches expected result and click Passed/Failed";

    /**
     * column number of test-status portion in the table that shows test status
     * @type int
     * @private
     */
    this.TEST_STATUS_COLUMN = 3;

    /**
     * column number of test-msg (results) portion in the table that shows test status
     * @type int
     * @private
     */
    this.TEST_MSG_COLUMN = 4;

    this.fWalkMode = false;
    this.fSingleScriptMode = false;
    this.fParent = null;
}
TestEngineDefn.prototype = new TestEngineInterface();
TestEngine = new TestEngineDefn();

