// var codeBase = "/cmnt/";
var codeBase = "file:///C:/arun/java/svn.sourceforge/trunk/";
document.write( '<script type="text/javascript" src="' + codeBase + 'src/editor.js""></script>' );

var processed = false;

function initNotationletsSupport()
{
    var div = document.createElement("div");
    div.style.position = "absolute";
    div.style.left     = "0";
    div.style.top      = "1000"
    document.body.appendChild(div);
    useTopPadForSwaras = false;		
    FLEXIBLE_WIDTH = true;

    LookAndFeel.init(document.body, codeBase + "src/l_and_f", true);
    GamakaManager.init(div);
}

function processNotationlets()
{
    if( !document.body ) return;
    if( processed ) return;
    processed = true;
    initNotationletsSupport();
    var notationlets = new Array();
    renderNotationlets(document.body, notationlets);
}

var __singlePlayer;	// if only one player was asked (this is how it is Opera)
var __singlePlayerCreated = false;
var __singlePlayerDOM = null;

function renderNotationlets(p, results) 
{
    if( p.className && p.className.toLowerCase() == "notationlet" ) {
	if ( p.firstChild ) {
	    if( p.firstChild.nodeValue ) {
		var v = p.firstChild.nodeValue;
		v = v.replace( /\r\n/g, "\n" ).replace( /\r/g, "\n");	// needed for IE
		var s = Song.prototype.fromRawText(v);
		if( s != null && s.fResult != null ) {
		    while(p.firstChild) {
			p.removeChild(p.firstChild);
		    }

		    var mydiv = document.createElement("center");
		    mydiv.style.overflow = "auto";
		    mydiv.style.width = "100%";
		    p.appendChild(mydiv);

		    var singlePlayer = false;
		    var singlePlayerId = null;
		    if( s.fResult.hasAudio() ) {
			/*
			 * associate a player with the model so that time indices
			 * are "registered" with the player for swaras as we 
			 * render them. So this must be done BEFORE the notations
			 * are rendered
			 */
			var player;
			if( isDefined('cmnt_singleAudioPlayer') ) {
			    singlePlayer = true;
			    if( !__singlePlayerDOM )
				__singlePlayerDOM = document.getElementById(cmnt_singleAudioPlayer);
			    player = __singlePlayer;
			}
			else if( Utils.isOpera() ) {
			    singlePlayer = true;
			    player = __singlePlayer;
			}

			if( !player ) {
			    player = AudioManager.createPlayer();
			    if( singlePlayer ) {
				__singlePlayer = player;
			    }
			}
			s.fResult.setAudioManager( player );
		    }

		    // 1 => # of tala cycles per row
		    var sv = new SongView(s.fResult, 1, false, 
		    		s.fResult.getSpeedMarksPreference());	
		    if( p.style.width )
			sv.fPageWidth = p.style.width;
		    else
			sv.fPageWidth = 0;
		    //if( p.style.height )
			//sv.fPageHeight = p.style.height;
		    //else
			//sv.fPageHeight = 6;
		    sv.fPageHeight = 100;
		    sv.setInteractive(false);
		    sv.render(mydiv);

		    var page = sv.firstPage();
		    while( page != null ) {
			var fTable = page.fInner.firstChild;
			fTable.parentNode.removeChild(fTable);
			if( fTable.rows[0].className && fTable.rows[0].className == "guiderow" ) 
			    fTable.deleteRow(0);	/* delete the guide row */
			mydiv.appendChild(fTable);

			fTable.className = "songlet";
			//fTable.style.display = "inline";
			fTable.style.padding = "0 0 0 0";
			fTable.style.width = "";

			page = page.nextPage();
		    }
		    sv.getContents().parentNode.removeChild(sv.getContents());

		    if( s.fResult.hasAudio() ) {
			/**
			 * create the audio player control
			 */
			var d = null;
			if( singlePlayer )
			    d = __singlePlayerDOM;
			if( !d ) {
			    d = document.createElement("div");
			    d.style.width = "100%";
			    d.style.paddingBottom = 5;
			    p.appendChild(d, p );
			    if( singlePlayer )
				__singlePlayerDOM = d;
			}
			if( !singlePlayer || !__singlePlayerCreated ) {
			    s.fResult.getAudioManager().createAudio(s.fResult.getAudio(), d);
			    if( singlePlayer ) __singlePlayerCreated = true;
			}
			mydiv.style.height = p.offsetHeight - d.offsetHeight - 10;
		    }
		}
		else {
		    var failure = null;
		    if( s == null || !s.fFailureReason )
			failure = "unknown reason";
		    else
			failure = s.fFailureReason;

		    var d = document.createElement("div");
		    d.innerHTML = "<b>Error parsing notation data:</b>" + failure;
		    p.appendChild(d);
		}
		results[results.length] = p;
	    }
	}
    }
    if( p.firstChild) {
	var c = p.firstChild;
	while( c ) {
	    renderNotationlets(c, results);
	    c = c.nextSibling;
	}
    }
    if( singlePlayer ) __singlePlayer.reinit();
}

var __d = document.body;
if( !__d ) __d = document;
if (__d.attachEvent)
    __d.attachEvent("onreadystatechange", processNotationlets )
else
    __d.addEventListener('readystatechange',processNotationlets, false);
if( window.attachEvent )
    window.attachEvent("onload", processNotationlets );
else
    window.addEventListener("load",processNotationlets,false);
