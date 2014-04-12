var IEFORMID = "ieform";
var IE_NONE   = 0;
var IE_IMPORT = 1;
var IE_EXPORT = 2;
var IE_EDIT   = 3;
var _testBed = null;
function IEFormInit(ieformid, testBed) { IEFORMID = ieformid; _testBed = testBed; }
function getIEForm()          { return document.getElementById(IEFORMID); }
function getIEFormDIV()       { return document.getElementById(IEFORMID+"div"); }
function getIEFormControl(id) { return document.getElementById(IEFORMID+"_"+id); }
function onIEFormCancel() {
    var f = getIEFormDIV();
    if( f != null ) {
	f.fImportExport = IE_NONE;
	f.style.display = "none";
    }
    if( _testBed == null )  return;
    _testBed.getInputElement().focus();
}


function onIEFormOK() {
    var f = getIEFormDIV();
    var form = getIEForm();
    if( form != null && f != null ) {
	if( f.fImportExport == IE_IMPORT || f.fImportExport == IE_EDIT ) {
	    if( _testBed == null )  return;

	    _testBed.importText(form.textarea.value);
	    _testBed.selectRow(0);
	}
	f.fImportExport = IE_NONE;
	f.style.display = "none";
    }
    if( _testBed != null ) _testBed.getInputElement().focus();
}

function doImportExport(what, txt) {
    var f = getIEFormDIV();
    var form = getIEForm();
    if( form != null && f != null )  {
	if( typeof(f.fImportExport) != "undefined" && f.fImportExport != IE_NONE ) return;
	f.fImportExport = what;

	var importlab = getIEFormControl("importlab");
	var editlab   = getIEFormControl("editlab");
	var exportlab = getIEFormControl("exportlab");
	var cancel    = getIEFormControl("cancel");
	if( importlab ) importlab.style.display = "none";
	if( exportlab ) exportlab.style.display = "none";
	if( editlab   ) editlab.style.display = "none";
	if( cancel )    cancel.style.display = "none";
	if( what == IE_EXPORT ) {
	    if( exportlab ) exportlab.style.display = "inline";
	    f.fImportExport = "export";
	    form.textarea.value = txt;
	}
	else if( what == IE_IMPORT ) {
	    form.textarea.value = "";
	    if( importlab ) importlab.style.display = "inline";
	    if( cancel )    cancel.style.display = "inline";
	}
	else if( what == IE_EDIT ) {
	    form.textarea.value = txt;
	    if( importlab ) importlab.style.display = "inline";
	    if( cancel )    cancel.style.display = "inline";
	}
	f.style.display = "block";
    }
}
function doImport() { doImportExport(IE_IMPORT); }
function doExport(lang, txt) 
{ 

    if( !txt ) {
	if( _testBed == null )  return;
	txt = _testBed.getEntireText(lang, true);
    }
    if( txt == "" ) {
	alert( "Nothing to export!");
	return;
    }
    doImportExport(IE_EXPORT, txt);
}
function doEditRaw(txt)
{ 
    if( !txt ) {
	if( _testBed == null )  return;
	txt = _testBed.getEntireText(null);
    }
    doImportExport(IE_EDIT, txt);
}


