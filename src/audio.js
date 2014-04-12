var wmpAudioControlNameBase = "__wmpaudioControl";

/**
 * global array of WMP audio players - helps us handle events for multiple players
 */
var _WMPAudioPlayers = new Array();


function _QuickTimeSupport()  {
    this.findQTVersion = function() {
	if( navigator.plugins ) {
	    for(var i = 0; i < navigator.plugins.length; i++ ) {
		var plugin = navigator.plugins[i];
		if( plugin.name.indexOf('QuickTime') >= 0 )  {
		    var re = /QuickTime\s*Plug[-]?in\s*([0-9.]*).*$/i;
		    var m = re.exec(plugin.name);
		    if( m != null && m.length == 2 )
			return m[1];
		}
	    }
	}
	return null;
    }

    this.isAvailable = function() {
	return this.supported;
    }

    this.supported = false;

    this.version = this.findQTVersion();
    if( this.version != null ) {
	var split  = this.version.split(".");
	if( split.length >= 2 ) {
	    var major = split[0];
	    var minor = split[1];
	    var sub   = ((split.length >= 3) ? split[3] : 0 );
	    if( major > 7 )
		this.supported = true;
	    else if( major == 7 ) {
		if ( minor > 2 )
		    this.supported = true;
		else if( minor == 2 && sub >= 1 ) 
		    this.supported = true;
	    }
	}
    }
}
var QuickTimeSupport = new _QuickTimeSupport();

function _WMPSupport()  {
    
    this.supported = false;
    if( Utils.isIE() )
	this.supported = true;
    else if( Utils.isFirefox() ) {
	if( navigator.plugins ) {
	    for(var i = 0; i < navigator.plugins.length; i++ ) {
		var plugin = navigator.plugins[i];
		if( plugin.name.indexOf("Windows Media Player Firefox Plugin") >= 0 )  {
		    this.supported = true;
		    break;
		}
	    }
	}
    }

    this.isAvailable = function() {
	return this.supported;
    }
}
var WMPSupport = new _WMPSupport();

/**
 * kinda kludgy but we can event handlers to work only this way. We cannot
 * seem to attach them as we dynamically create audio controls. So we
 * create stuff "in anticpation". A particular page can define nAudioControls
 * variable to tell us how many to generate
 */

function generateWMPAudioEventHandlers()
{
    // TODO: check if on PC (also does not work on Opera - only IE and FireFox)
    var _nMaxAudio = 3;
    if(isDefined('nAudioControls')) _nMaxAudio = maxAudio;
    var n;
    for(var i = 1; i <= _nMaxAudio; i++ ) {
	n = wmpAudioControlNameBase + i;
	if( Utils.isOpera() ) {
	    if( i == 1 ) {
		document.write( '<script type="text/javascript">function OnDSPlayStateChangeEvt(newState) { WMPAudioPlayStateChange( newState ); }</script>' );
		document.write( '<script type="text/javascript">function OnDSPositionChangeEvt(newState) { WMPAudioPositionChange( newState ); }</script>' );
	    }
	}
	else {
	    document.write( '<script type="text/javascript" for="' + n + 
		    '" event="playStateChange(newState)">' + 'WMPAudioPlayStateChange(newState,"' + n + '")</script>' );
	    document.write( '<script type="text/javascript" for="' + n +  
		    '" event="audioPositionChange(newState)">' + 'WMPAudioPositionChange(newState,"' + n + '")</script>' );
	}
    }
}
generateWMPAudioEventHandlers();	// generate the event handlers as we load the page

/**
 * event handler for WMP player
 */
function WMPAudioPlayStateChange(newState, audioid)
{
    var player = null;
    if( !audioid ) {	// Opera
	for(a in _WMPAudioPlayers) {
	    player = _WMPAudioPlayers[a];
	    break;
	}
    }
    else 
	player = _WMPAudioPlayers[audioid];
    if( !player ) return;
    player._onAudioControlPlayStateChange(newState);
}

/**
 * event handler for WMP player
 */
function WMPAudioPositionChange(newPosition, audioid)
{
    var player = null;
    if( !audioid ) {	// Opera
	for(a in _WMPAudioPlayers) {
	    player = _WMPAudioPlayers[a];
	    break;
	}
    }
    else 
	player = _WMPAudioPlayers[audioid];
    if( !player ) return;
    player.onAudioControlPositionChange(newPosition);
}

function sortTimeIndex(a1, a2) 
{
    return a1.index - a2.index;
}

/**
 * Implements management of audio-player integrated into the notation
 */
function AudioPlayerBase() 
{
    this.inited = false;

    /**
     * add time indices for a swara. This is called by as the view is being rendered
     * @param {SwaraView} swaraView	  the swara view object for the swara
     * @param {string}    audioURL	  the swara view object for the swara
     * @param {double[]}  timeIndices	  The list of time indices into the audio
     *					  file where this swara figures.
     */
    this.addTimeIndices = function( view, audioURL, timeIndices ) {
	for(var i = 0; i < timeIndices.length; i++ ) {
	    var indexes = null;
	    var aInfo = this.audioInfo[audioURL];
	    if( !aInfo ) {
		var aInfo = new Object();
		aInfo.indexes = new Array();
		aInfo.url     = audioURL;
		this.audioInfo[audioURL ] = aInfo;
	    }
	    indexes = aInfo.indexes;
	    var o = new Object();
	    indexes[indexes.length] = o;
	    o.index       = timeIndices[i];
	    o.selectme  = true;
	    if( o.index < 0 ) 	{
		/*
	    	 * special value for indicate that when this time is reached
		 * we must stop selection (it may be continued later). This
		 * is to avoid highlighting portions not represented in
		 * notations
		 */
		o.index = -o.index;
		o.selectme = false;
	    }
	    o.view      = view;
	}
    }

    /**
     * clear all time indice information
     */
    this.clear = function() {
	this.audioInfo = new Array();
	this.inited  = false;
	this.curAudio = null;
	this.next     = -1;
    }

    /**
     * initialize/prepare the audio manager - this must be done after the
     * song notation is rendered (during which addTimeIndices would be 
     * called many times), and after the audio plugin is rendered. It
     * prepares the audio manager so that when the song is played the
     * user can get visual feedback of the various swaras
     */
    this.init = function(initURL) {
	if( this.inited == false ) {
	    this.inited = true;
	    for( audioURL in this.audioInfo ) {
		var indexes = this.audioInfo[audioURL].indexes;
		if( indexes.length )  {
		    var nindices = indexes.length;
		    for(var i = 0; i < nindices; i++ ) {
			var o = indexes[i];
			var domid = o.view.getDOMID();
			var dom_obj = document.getElementById(domid);
			if( dom_obj && o.selectme ) {
			    o.view.attach(dom_obj, 0 );  // 0 => kludge
			    if( o.view.partType() == ROWVIEWPART_LYRIC ) {
				var swaraview = o.view.getSwaraView();
				if( swaraview ) {
				    var swara_dom_obj = document.getElementById(swaraview.getDOMID());
				    swaraview.attach(swara_dom_obj,0);
				}
			    }
			}
		    }
		    indexes.sort(sortTimeIndex);
		}
	    }
	    if( initURL )
		this.curAudio = this.audioInfo[initURL];
	    else if( this.audioInfo.length )
		this.curAudio = this.audioInfo[0];
	    else
		this.curAudio = null;

	    if( this.lastSelection ) this._select(this.lastSelection.view, false);
	    this.lastSelection = null;
	    this.fTime = 0;
	}
    }
    this.reinit = function() {
	this.inited = false;
	var a = null;
	for( audioURL in this.audioInfo ) {
	    a = audioURL;
	    break;
	}
	this.init(a);
    }

    this.selectAudio = function(audioURL) {
	var audioInfo = this.audioInfo[audioURL];
	if( !audioInfo ) return false;
	if( this.curAudio && this.curAudio.url == audioInfo.url ) return true;
	this.curAudio = audioInfo;
	this.setPlayerAudio(audioURL);
	if( this.lastSelection ) this._select(this.lastSelection.view, false);
	this.lastSelection = null;
	this.fTime = 0;
	return true;
    }

    /**
     * called when the audio starts to play
     */
    this.onPlay = function() {
	this.init();
	if( this.curAudio != null ) {
	    if( this.curAudio.indexes.length )
		this.next = 0;
	    else
		this.next = -1;
	    if( this.lastSelection ) {
		this._select(this.lastSelection.view,false);
	    }
	    this.lastSelection = null;
	}
	// hide the slider
	if( this.audioPlaybackRateSlider != null ) this.audioPlaybackRateSlider.hide();
    }

    /**
     * called when the audio is stopped (NOT paused, stopped
     */
    this.onStop = function() {
	if( this.lastSelection ) this._select(this.lastSelection.view,false);
	this.lastSelection = null;
	this.fTime = 0;
	// show the slider
	if( this.audioPlaybackRateSlider != null ) this.audioPlaybackRateSlider.show();
    }

    this.onPause = function() {
	// show the slider
	if( this.audioPlaybackRateSlider != null ) this.audioPlaybackRateSlider.show();
    }

    /**
     * called while the audio is playing
     * @param {double} time	the current playhead position (seconds from
     *				the start)
     */
    this.updateTime = function(time) {
	this.fTime = time;
	if(this.curAudio != null && this.next >= 0 ) {
	    var o = this.curAudio.indexes[this.next];
	    if( time >= o.index ) {
		while(true) {
		    this.next++;
		    if( this.next >= this.curAudio.indexes.length ) {
			this.next = -1;
			break;
		    }
		    else {
			var no = this.curAudio.indexes[this.next];
			if(time >= no.index )  {
			    o = no;
			    continue;
			}
			break;
		    }
		}
		if( this.lastSelection )  {
		    this._select(this.lastSelection.view, false);
		}
		if( o && !o.stop ) {
		    this._select(o.view, true);
		    this.lastSelection = o;
		}
		else {
		    this.lastSelection = null;
		}
	    }
	}
    }

    /**
     * seek to a position in the audio file - called e.g. when
     * a swara is selected by the user
     */
    this.seekTo = function(songURL, timeIndex) {
	if( !this.curAudio || this.curAudio.url != songURL ) {
	    if( !this.selectAudio(songURL) ) return false;
	}
	if( this.curAudio != null ) {
	    if( this.curAudio.indexes.length )
		this.next = 0;
	    else
		this.next = -1;
	}
	if( timeIndex >= 0 )
	    this.seekAudio(timeIndex);
    }


    this._select = function(view, val) {
	view.select(val);
	if( view.partType() == ROWVIEWPART_LYRIC ) {
	    var sview = view.getSwaraView();
	    if( sview ) sview.select(val, true);
	}
    }


    /**
     * a protected function which implements player specific functionality
     * to seek into the audio
     * @protected
     */
    this.seekAudio = function(time) {
	alert( "internal error: no seekAudio defined")
    }


    /**
     * create HTML for the slider controls and such
     * @protected
     */
    this.getSliderControlsHTML = function(audioid) {
	var s = '<center class="sliderControls" style="font-size:8pt;padding-bottom:10px;">' +
		   '<table style="border-collapse:collapse;padding:0 0 0 0;">' +
		   '<tr>' +
		   '<td style="font-size:8pt;" class="sliderControls" id="' + audioid + 
		   '_sc"><i>Playback Rate:</i><td id="' + audioid + 
		   '_si" style="font-size:8pt;width:100px;">1.0</td>' +
		   '<td width="20px;"></td><td id="' + audioid + 
		   '_songaudiotime" style="font-size:8pt;width:200px;"></td>' +
		   '<tr><td id="' + audioid + '_slider" colspan="2"></td>' +
		   '</table>' +
		   '</center>';
	return s;
    }

    /**
     * init slider controls and such now assuming they have been added
     * @protected
     */
    this.initSliderControls = function(audioid) {
	this.audioPlayerTimeIndicator = document.getElementById(audioid + "_songaudiotime");
	this.audioPlaybackRateSlider = new Slider(audioid+"_slider", "horizontal", 100);
	this.audioPlaybackRateIndicator = document.getElementById(audioid+"_si");
	this.audioPlaybackRateSlider.onChange = this.onPlaybackRateChange;
	this.audioPlaybackRateSlider.setStart(50);
	this.audioPlaybackRateSlider.show();
    }

    this.onPlaybackRateChange = function(value)
    {
	// value 0 => 1/2
	// value 50 => 1
	// value 100 => 2
	var rate;
	if( value == 50 ) rate = "1.0"
	else if( value < 50 ) {
	    rate = parseInt((0.5 + (0.5/100)*value)*10)/10;
	}
	else {
	    rate = parseInt((1.0 + (1.0/100)*value)*10)/10;
	}
	/**
	 * NOTE: this is sort of a global callback and so "this" does
	 * not point to us. That is why we defined "player" during
	 * construction and that variable is in scope and refers to
	 * us
	 */
	rate = parseInt(rate*10)/10;
	player.setAudioPlaybackRate(rate);
	var srate = rate;
	if( rate == "0" || rate == "1" ) srate =  "" + rate + ".0";
	player.audioPlaybackRateIndicator.innerHTML = srate;
    }

    this.audioUpdateTimeIndicator = function(lab)
    {
	if( this.audioPlayerTimeIndicator != null ) {
	    if( lab ) {
		this.audioPlayerTimeIndicator.innerHTML = lab;
	    }
	    else {
		var position = this.getAudioPosition();
		if( position == -1 ) {
		    this.onStop();
		    this.audioPlayerTimeIndicator.innerHTML = "";
		}
		else {
		    this.updateTime(position);
		    var mins   = parseInt(position/60.0);
		    var secs   = (position - mins*60.0);
		    var nsecs  = parseInt(secs);
		    var msecs  = parseInt((secs - nsecs)*1000);
		    this.audioPlayerTimeIndicator.innerHTML = 
				    ((mins < 10) ? ("0" + mins) : mins ) + ":" + 
				    ((nsecs < 10) ?("0" + nsecs): nsecs) + ":" + msecs;
		}
	    }
	}

    }

    var player = this;	// used by event handlers

    this.audioInfo  =  new Array();
    this.curAudio   = null;
    this.next = -1;
    this.lastSelection = null;

    /* this is a map between lyric objects and their view dom-ids */
    this.SwaraMap = new Object();

    this.setBaseObject = function(obj) {
	player = obj;
    }

    this.fTime = 0;	// current time index
}

function NoAudioPlayer(reason) {
    this.createAudio = function( songURL, audiodiv)  {
	audiodiv.innerHTML = '<div style="font-size:8;"><i>Audio</i>: ' + this.reason + '</div>';
    }
    this.seekAudio = function(time) {
	return;
    }
    this.reason = reason;
}
NoAudioPlayer.prototype = new AudioPlayerBase();

/**
 * a class that represents a WMP (Windows Media Player) audio plugin
 */
function WMPPlayer()
{
    // call after rendering song
    this.createAudio = function( songURL, audiodiv) 
    {
	var urlAudioInfo = this.audioInfo[songURL];
	if( !urlAudioInfo )  {
	    urlAudioInfo = new Object();
	    urlAudioInfo.url = songURL;
	    urlAudioInfo.indexes = new Array();
	    this.audioInfo[songURL] = urlAudioInfo;
	}
	this.init(songURL);
	if( Utils.isOpera() ) {
	    audiodiv.innerHTML = '<div style="font-size:8;"><i>Audio</i>: Not supported on Opera: Sorry.</center>'
	    audiodiv.style.width = "100%";
	    audiodiv.style.textAlign = "center";
	    audiodiv.style.display = "block";
	    return;
	}
	if( songURL && songURL != "") {
	    audiodiv.style.width = "100%";
	    audiodiv.style.height = 72;
	    audiodiv.style.zIndex = 10;
	    audiodiv.style.display = "block";

	    // generate the correct name so that the pre-installed
	    // handlers will work
	    var audio_id  = wmpAudioControlNameBase + (_WMPAudioPlayers.length+1)

	    this.audio_id = audio_id;

	    var s = '<OBJECT id="' + audio_id + '" style="padding-top:5;" width="100%" height="44" ' +
		    ((!Utils.isIE() ) ? ' type="application/x-ms-wmp" ' : '' ) + // firefox
		    ((Utils.isIE() ) ? 'CLASSID="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6">' : '>')+
			      '<PARAM NAME="URL" VALUE="' + songURL + '">' +
			      '<PARAM NAME="AutoStart" VALUE="False">' +
			      '<PARAM name="uiMode" value="full">' +
			      '<PARAM name="PlayCount" value="1">' +
			      '<PARAM name="ShowControls" value="True">' +
			      '<PARAM name="ShowStatusBar" value="true">' +
			       '</OBJECT>' +
			       this.getSliderControlsHTML(audio_id);
	    audiodiv.innerHTML = s;

	    // add to global array so that event handlers can find us
	    _WMPAudioPlayers[audio_id] = this;	 

	    this.audioPlayerControl = document.getElementById(audio_id);
	    this.initSliderControls(audio_id);
	}
    }

    /**
     * called from our event handler when play state changes
     * @private
     */
    this._onAudioControlPlayStateChange = function(newState)
    {
	if( this.audioPlayerControl != null ) {
	    if( this.audioPlayerControl.playState == 9 ) {
		this.audioUpdateTimeIndicator("Preparing to play ...");
	    }
	    else if( this.audioPlayerControl.playState == 8 ) {
		this.audioUpdateTimeIndicator("Buffering");
	    }
	    else if( this.audioPlayerControl.playState == 1 ) {
		this.onStop();
	    }
	    else if( this.audioPlayerControl.playState == 2 ) {
		this.onPause();
	    }
	    else if( this.audioPlayerControl.playState == 3 ) { 
		this.onPlay();
		this.audioTimerPoll();
	    }
	    else {
		this.audioUpdateTimeIndicator();
	    }
	}
    }

    this.onAudioControlPositionChange = function(newPosition) { 
	this.audioUpdateTimeIndicator(); 
    }

    this.getAudioPosition = function() { 
	return this.audioPlayerControl.controls.currentPosition; 
    }

    this.seekAudio = function(time) { 
	this.audioPlayerControl.controls.currentPosition = time; 
	this.audioUpdateTimeIndicator(); 
    }
    this.setAudioPlaybackRate = function(rate) {
	if( this.audioPlayerControl.settings )
	    this.audioPlayerControl.settings.rate = rate;
    }

    /**
     * poller while playing
     */
    this.audioTimerPoll = function()
    {
	this.audioUpdateTimeIndicator();
	if( this.audioPlayerControl.playState == 3 )
	    setTimeout(function() { me.audioTimerPoll(); }, 25 );
    }

    this.setPlayerAudio = function(URL) {
	if( this.audioPlayerControl.playState == 3 )	// if playing
	    this.audioPlayerControl.stop();		// stop
	this.audioPlayerControl.URL = URL;
    }

    var me = this;

    this.audio_id = "";

    this.setBaseObject(this);	// kind a kludgy
}
WMPPlayer.prototype = new AudioPlayerBase();

var qtAudioControlNameBase = "__qtaudioControl";
/** global array of qt audio players - helps us handle events for multiple players */
var _QTAudioPlayers = new Array();

/**
 * a class that represents a (QuickTime Player) plugin
 */
function QTPlayer()
{
    // call after rendering song
    this.createAudio = function( songURL, audiodiv) 
    {
	//songURL = "http://arunk.freepgs.com/blog/rgaula/ni.mp3";
	//songURL = "file:///C:/arun/rgaula/gmpmgrs.mp3";
	var urlAudioInfo = this.audioInfo[songURL];
	if( !urlAudioInfo )  {
	    urlAudioInfo = new Object();
	    urlAudioInfo.url = songURL;
	    urlAudioInfo.indexes = new Array();
	    this.audioInfo[songURL] = urlAudioInfo;
	}
	this.init(songURL);
	var bad = null;
	if( songURL && songURL != "") {
	    audiodiv.style.width = "100%";
	    audiodiv.style.height = 72;
	    audiodiv.style.zIndex = 10;
	    audiodiv.style.display = "block";

	    // generate the correct name so that the pre-installed
	    // handlers will work
	    var audio_id  = qtAudioControlNameBase + (_QTAudioPlayers.length+1)

	    this.audio_id = audio_id;

	    /* from http://web.mac.com/eric.carlson/events_demo/detailed.html */
	    var s = "" + 
		    '<object width="100%" height="44" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" ' +
		    'id="' + audio_id + '" style="behavior:url(#qt_event_source);" >' +
		    '<param name="src" value="' + songURL + '">' +
		   '<param name="autoplay" value="false">' +
		   '<param name="postdomevents" value="true">' +
		   //'<param name="allowembedtagoverrides" value="true">' +
		   '<embed  id="' + audio_id + '_embed" ' +
		    'postdomevents="true" autoplay="false" width = "100%" height = "44" ' + '" ' +
                    'src="' + songURL + '" > </embed></object>' +
		     this.getSliderControlsHTML(audio_id);
	    audiodiv.innerHTML = s;

	    var plug = document.getElementById(audio_id);
	    if(!plug ) {
		bad = "Error: Quicktime player fail to initialize";
	    }
	    else {
		// add to global array so that event handlers can find us
		_QTAudioPlayers[audio_id] = this;	 
		this.audioPlayerControl = plug;
		//this.myAddListener(plug,'qt_begin',           this.qt_pluginBegin, false);
		//this.myAddListener(plug,'qt_abort',           onEvent, false);
		//this.myAddListener(plug,'qt_canplay',         onEvent, false);
		//this.myAddListener(plug,'qt_canplaythrough',  onEvent, false);
		//this.myAddListener(plug,'qt_durationchange',  onEvent, false);
		this.myAddListener(plug,'qt_ended',           this.qt_onEvent, false);
		this.myAddListener(plug,'qt_error',           this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_load',            this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_loadedfirstframe',this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_loadedmetadata',  this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_pause',           this.qt_onEvent, false);
		this.myAddListener(plug,'qt_play',            this.qt_onEvent, false);
		this.myAddListener(plug,'qt_progress',        this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_stalled',         this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_timechanged',     this.qt_onEvent, false);
		//this.myAddListener(plug,'qt_volumechange',    this.qt_onEvent, false);            
		this.myAddListener(plug,'qt_waiting',         this.qt_onEvent, false);
		this.initSliderControls(audio_id);
	    }
	}
	if( bad ) {
	    audiodiv.innerHTML = '<div style="font-size:8;"><i>Audio</i>: ' + bad + '</div>';
	    audiodiv.style.width = "100%";
	    audiodiv.style.textAlign = "center";
	    audiodiv.style.display = "block";
	    return;
	}
    }

    this.myAddListener = function(obj, evt, handler, captures)
    {
	if ( document.addEventListener )
	    obj.addEventListener(evt, handler, captures);
	else
	    obj.attachEvent('on' + evt, handler); // IE requires this form
    }


    this.qt_onEvent = function(evt) {
	var target = evt.target ? evt.target : evt.srcElement;
	if (!target)
	    return;
	var targetId = target.id;
	if( !targetId ) return;
	var player = _QTAudioPlayers[targetId];
	if( !player ) return;

	switch(evt.type) {
	    case 'qt_waiting':
		player.audioUpdateTimeIndicator("Preparing to play ...");
		break;

	    case 'qt_play':
		player.play_state = "play";
		player.onPlay();
		player.audioTimerPoll();
		break;

	    case 'qt_pause':
		player.play_state = "pause";
		player.onPause();
		break;

	    case 'qt_ended':
		player.play_state = null;
		player.onStop();
		break;
	}
    }

    this.onAudioControlPositionChange = function(newPosition) { 
	this.audioUpdateTimeIndicator(); 
    }

    this.getAudioPosition = function() { 
	var scale = this.audioPlayerControl.GetTimeScale();
	return this.audioPlayerControl.GetTime()*(1.0/scale);
    }
    this.seekAudio = function(time) { 
	var s = time*this.audioPlayerControl.GetTimeScale();
	this.audioPlayerControl.SetTime(s);
    }
    this.setAudioPlaybackRate = function(rate) {
	if( this.audioPlayerControl && this.audioPlayerControl.SetRate )
	    this.audioPlayerControl.SetRate(rate);
    }

    /**
     * poller while playing
     */
    this.audioTimerPoll = function()
    {
	this.audioUpdateTimeIndicator();
	if( this.play_state == "play" )
	    setTimeout(function() { me.audioTimerPoll(); }, 25 );
    }

    this.setPlayerAudio = function(URL) {
	if( this.play_state == "play" )	// if playing
	    this.audioPlayerControl.Stop();			// stop
	this.audioPlayerControl.URL = URL;
    }


    var me = this;

    this.audio_id = "";
    this.play_state = null;

    this.setBaseObject(this);	// kind a kludgy
}
QTPlayer.prototype = new AudioPlayerBase();

function AudioManagerDefn()
{
    this.createPlayer = function() {
	// depending on browser, we need to pick something
	//return new WMPPlayer();
	if( Utils.isOpera() ) {
	    var msg = "Sorry no audio support on Opera. Try FireFox/IE/Safari";
	    return new NoAudioPlayer( msg);
	}
	else if( Utils.isSafari() ) {
	    if( QuickTimeSupport.isAvailable() )
		return new QTPlayer();
	    else {
		var msg = "On Safari/Opera, need Quicktime plugin version 7.2.1 or later";
		if( QuickTimeVersion.qt_version )
		    msg += ": found version " + QuickTimeVersion.qt_version;
		return new NoAudioPlayer( msg);
	    }
	}
	else if( Utils.isFirefox() ) {
	    if( WMPSupport.isAvailable() )
		return new WMPPlayer();
	    else {
		return new NoAudioPlayer( "Need Windows Media Player FireFox Plugin for audio" );
	    }
	}
	else if( Utils.isIE() ) {
	    return new WMPPlayer();
	}
	else {
	    return new NoAudioPlayer( "Support not enabled for unknown browser: " + navigator.userAgent );
	}
    }
}

var AudioManager = new AudioManagerDefn();
