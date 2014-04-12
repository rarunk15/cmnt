function SimpleAssistForm()
{
    this.fCallback = null;

    this.setValues = function (data, callback) {
	this.fAssistData = data;
	this.fCallback = callback;
    }


    /**
     * override of {@link Form#provideContent} to provide content of
     * the form
     */
    this.provideContent = function() {
	var mydiv = document.createElement("div");
	var s;
	s    = '<form id="simpleassistform">';
	s    += '<table style="overflow:auto;">';

	for(i = 0; i < this.fAssistData.directives.length ; i++ ) {
	    var d = this.fAssistData.directives[i];
	    s    += '<tr>';
	    s    += '<td><b>' + d.name + ': </b><td>';
	    if( d.choices ) {
		s += '<select id="' + d.id + '">';
		for( j = 0; j < d.choices.length; j++ ) {
		    if( d.choices[j].value != null ) {
			s += '<option value="' + d.choices[j].value + '">';
			s += d.choices[j].name;
			s += '</option>';
		    }
		    else {
			if( d.choices[j].name == "" )
			    s += "</optgroup>";
			else {
			    s += '<optgroup label="';
			    s += d.choices[j].name;
			    s += '">';
			}
		    }
		}
		s += '</select>';
	    }
	    else if( d.textbox ) {
		s += '<input type="text" size="' + d.maxlength + '" id="' + d.id + '"></input>';
	    }
	    else if( d.checkbox ) {
		s += '<input type="checkbox" id="' + d.id + '"></input>';
	    }
	    else if( d.color ) {
	    	s += '<table>';
		s += '<tr>';
		s += '<td>';
		s += '<input onclick="SimpleAssistForm.prototype.onPredefined();" type="radio" name="colorfmt" checked="1" value="predefined">Predefined:</input>';
		s += '<td>';
		s += '<select name="predef_color">';
		for(c in Colors) { // Colors: see model.js
		    s += '<option value="' + c + '">';
		    s += c;
		    s += '</option>';
		}
		s += '</select>';
		s += '<tr>';
		s += '<td>';
		s += '<input onclick="SimpleAssistForm.prototype.onRGB();" type="radio" name="colorfmt" value="rgb">RGB:</input>';
		s += '<td>';
		s += 'Red: <input disabled="1" type="text" size="3" name="red"></input>&nbsp;';
		s += 'Green: <input disabled="1" type="text" size="3" name="green"></input>&nbsp;';
		s += 'Blue: <input disabled="1" type="text" size="3" name="blue"></input>';
		s += '</table>';
	    }
	}
	s    += '<tr>';
	s	 += '<td style="height:10px;"></td>';
	s    += '<tr>';
	s    += '<td colspan="2"><div><center>';
	s    += '<input id="simpleassistform_ok" name="ok" type="button" value="&nbsp;OK&nbsp;" onclick="SimpleAssistForm.prototype.okHandler()"> &nbsp;';
	s    += '<input id="simpleassistform_cancel" name="cancel" type="button" value="Cancel" onclick="SimpleAssistForm.prototype.cancelHandler()">';
	s    += '</center>';
	s    += '</div>';
	s    += '</table>';
	s    += '</form>';

	mydiv.innerHTML = s;
	mydiv.style.overflow = "auto";
	var form = mydiv.getElementsByTagName("form")[0];
	this.fForm = form;
	Utils.addToIdMap(form, this);
	return mydiv;
    }

    this.onPredefinedColor = function() {
	this.fForm.red.disabled = true;
	this.fForm.green.disabled = true;
	this.fForm.blue.disabled = true;
	this.fForm.predef_color.disabled = false;
    }

    this.onRGBColor = function() {
	this.fForm.red.disabled = false;
	this.fForm.green.disabled = false;
	this.fForm.blue.disabled = false;
	this.fForm.predef_color.disabled = true;
    }

    this.onOK = function() {
	if( this.fAssistData.validate ) {
	    var newContents = this.fAssistData.validate( this.fAssistData, this.fForm, this );
	    if( newContents == null ) 
		return;	// dont dismiss dialog on validation errors!
	    else if( this.fCallback ) {
		if( this.fAssistData.isSelectDirective) {
		    this.hide();
		    assistDirective(newContents, "", this.fCallback);
		    return;
		}
		else
		    this.fCallback.setCurrentDirective(newContents);
	    }
	}
	this.hide();

    }

    this.onCancel = function() {
	this.hide();
    }
}
SimpleAssistForm.prototype = new Form();
SimpleAssistForm.prototype.onPredefined = function(obj)
{
    var form = document.getElementById("simpleassistform");
    var obj = Utils.getObjForId(form);
    if( obj)  {
	obj.onPredefinedColor();
    }
}

SimpleAssistForm.prototype.onRGB = function(obj)
{
    var form = document.getElementById("simpleassistform");
    var obj = Utils.getObjForId(form);
    if( obj)  {
	obj.onRGBColor();
    }
}

SimpleAssistForm.prototype.okHandler = function(obj)
{
    var form = document.getElementById("simpleassistform");
    var obj = Utils.getObjForId(form);
    if( obj)  {
	obj.onOK();
    }
}
SimpleAssistForm.prototype.cancelHandler = function(obj)
{
    var form = document.getElementById("simpleassistform");
    var obj = Utils.getObjForId(form);
    if( obj )  {
	obj.onCancel();
    }
}

var AssistMap = new Object();


AssistMap.tala = {
	  validate: function(me, f, formobj) {
	  	var val = f[me.directives[0].id].value;
		var dir = me.name + ": " + val;
		if( val.toLowerCase() != "manual" )
		{
		    if( f.manual.checked )
		    {
		    	dir += ",Manual";
		        if( f.inlinetalamarkers.checked )
			    dir += ",InlineTalaMarkers";
		    }
		}
		else
		{
		    if( f.inlinetalamarkers.checked )
			dir += ",InlineTalaMarkers";
		}
		return dir;
	  },

	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
	        var split = value.split(",");
		f.manual.checked = false;
		f.inlinetalamarkers.checked = false;

		value = trim(split[0]);
		var choices = me.directives[0].choices;
		var match = false;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice && choice.toLowerCase() == value.toLowerCase() ) {
			f.tala.value = choice;
			match = true;
			break;
		    }
		}
		if( match == false ) {
		    alert( "ignoring unrecognized tala: " + value );
		    return;
		}
		if( split.length > 1 )
		{
		    val = split[1].toLowerCase();
		    if( f.tala.value.toLowerCase() == "manual" )
		    {
			if( val == "inlinetalamarkers" )
			    f.inlinetalamarkers.checked = true;
		    }
		    else if( val == "manual" ) {
		    	f.manual.checked = true;
			if( split.length > 2 )
			{
			    if( split[2].toLowerCase() == "inlinetalamarkers" )
				f.inlinetalamarkers.checked = true;
			}
		    }
		}
	  },
    	  name: 'Tala',	 
	  title: 'Set Tala for the song', 
	  directives: [
	      {
	        id: 'tala',	
	        name: 'Tala',
		choices: [ 	
				{ name: 'Adi Tala' },	// group
				    { name: 'Adi', 		value: 'Adi' },
				    { name: 'Adi (2-Kalai)', value: 'Adi2Kalai' },
				    { name: 'Adi (Tisra Gati)', value: 'Tisra_Adi' },
				    { name: '' },	// end group
				{ name: 'Ata Tala' }, // group
				    { name: 'Khanda Ata', 		value: 'Ata' },
				    { name: 'Tisra Ata',   value: 'Tisra_Ata' },
				    { name: 'Catusra Ata', value: 'Catusra_Ata' },
				    { name: 'Misra Ata',   value: 'Misra_Ata' },
				    { name: 'Sankirna Ata', value: 'Sankirna_Ata' },
				    { name: '' },	// end group
				{ name: 'Dhruva Tala' }, // group
				    { name: 'Chatusra Dhruva (1 row per Avarthanam)', value: 'Dhruva' },
				    { name: 'Chatusra Dhruva (2 rows per Avarthanam)', value: 'Dhruva2' },
				    { name: 'Tisra Dhruva', value: 'Tisra_Dhruva' },
				    { name: 'Khanda Dhruva', value: 'Khanda_Dhruva' },
				    { name: 'Misra Dhruva', value: 'Misra_Dhruva' },
				    { name: 'Sankirna Dhruva', value: 'Sankirna_Dhruva' },
				    { name: '' },	// end group
				{ name: 'Eka Tala' },	// group
				    { name: 'Eka', 		value: 'Eka' },
				    { name: 'Tisra Eka', 	value: 'Tisra_Eka' },
				    { name: 'Khanda Eka', 	value: 'Khanda_Eka' },
				    { name: 'Misra Eka', 	value: 'Misra_Eka' },
				    { name: 'Sankirna Eka', 	value: 'Sankirna_Eka' },
				    { name: '' },	// end group
				{ name: 'Jhampa Tala' },
				    { name: 'Misra Jhampa',   value: 'Jhampa' },
				    { name: 'Tisra Jhampa',   value: 'Tisra_Jhampa' },
				    { name: 'Catusra Jhampa', value: 'Catusra_Jhampa' },
				    { name: 'Khanda Jhampa', value: 'Khanda_Jhampa' },
				    { name: 'Sankirna Jhampa', value: 'Sankirna_Jhampa' },
				    { name: '' },	// end group
				{ name: 'Khanda Capu Tala' },	// group
				    { name: 'Khanda Chapu (4 Avarthanams per row)', value: 'KhandaCapu' },
				    { name: 'Khanda Chapu (2 Avarthanams per row)', value: 'KhandaCapu2' },
				    { name: '' },	// end group
				{ name: 'Matya Tala' },	// group
				    { name: 'Chatusra Matya',  value: 'Matya' },
				    { name: 'Tisra Matya', value: 'Tisra_Matya' },
				    { name: 'Khanda Matya', value: 'Khanda_Matya' },
				    { name: 'Misra Matya', value: 'Misra_Matya' },
				    { name: 'Sankirna Matya', value: 'Sankirna_Matya' },
				    { name: '' },	// end group
				{ name: 'Misra Chapu Tala' },	// group
				    { name: 'Misra Chapu',  value: 'MisraCapu' },
				    { name: '' },	// end group
				{ name: 'Roopaka Tala' },	// group
				    { name: 'Chatusra Roopaka', 	value: 'Roopaka' },
				    { name: 'Roopaka (Capu)',value: 'RoopakaCapu' },
				    { name: 'Tisra Roopaka', value: 'Tisra_Roopaka' },
				    { name: 'Khanda Roopaka', value: 'Khanda_Roopaka' },
				    { name: 'Misra Roopaka', value: 'Misra_Roopaka' },
				    { name: 'Sankirna Roopaka', value: 'Sankirna_Roopaka' },
				    { name: '' },	// end group
				{ name: 'Triputa Tala' },	// group
				    { name: 'Tisra Triputa',	value: 'Triputa' },
				    { name: 'Chatusra Triputa',	value: 'Catusra_Triputa' },
				    { name: 'Khanda Triputa',	value: 'Khanda_Triputa' },
				    { name: 'Misra Triputa',	value: 'Misra_Triputa' },
				    { name: 'Sankirna Triputa',	value: 'Sankirna_Triputa' },
				    { name: '' },	// end group
				{ name: 'Manual', 		value: 'Manual' },
			 ] 
	      },
	      {
	        id: 'manual',	
	        name: 'Manual tala layout',
		checkbox: true
	      },
	      {
	        id: 'inlinetalamarkers',	
	        name: 'Tala anga markers indicated inline above swaras<br>(only for Manual Tala Layout or Manual Tala)',
		checkbox: true
	      }
	  ]
    };

AssistMap.speedmarks = {
	  validate: function(me, f, formobj) {
	    	return me.name + ": " + f[me.directives[0].id].value;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
		var choices = me.directives[0].choices;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice.toLowerCase() == value.toLowerCase() ) { 
			f.speedmarks.value = choice;
			break;
		    }
		}
		if( i == choices.length )
		    alert( "ignoring unrecognized speed marks location value : " + value );
	  },
    	  name: 'SpeedMarks',	 
	  title: 'Set the location of speed marks for faster swaras', 
	  directives: [
	      {
	        id: 'speedmarks',	
	        name: 'Speed Marks',
		choices: [ 	{ name: 'Above the swaras', 	value: 'Above' },
				{ name: 'Below the swaras', 	value: 'Below' }
			 ] 
	      }
	  ]
    };

AssistMap.orientation = { 
	  validate: function(me, f, formobj) {
	  	var dir = me.name + ": " + f[me.directives[0].id].value;
		var s;

		var val_re = /[0-9]*\.[0-9][0-9]*$/;

		s = trim(f.leftmargin.value);
		if( s.match(val_re) ) dir += ",left:" + s;
		else {
		    alert( "incorrect left margin specified (specify a number like 0.5, 1.5, 2" );
		    return null;
		}
		s = trim(f.rightmargin.value);
		if( s.match(val_re) ) dir += ",right:" + s;
		else {
		    alert( "incorrect right margin specified (specify a number like 0.5, 1.5, 2" );
		    return null;
		}
		s = trim(f.topmargin.value);
		if( s.match(val_re) ) dir += ",top:" + s;
		else {
		    alert( "incorrect top margin specified (specify a number like 0.5, 1.5, 2" );
		    return null;
		}
		s = trim(f.botmargin.value);
		if( s.match(val_re) ) dir += ",bottom:" + s;
		else {
		    alert( "incorrect bottom margin specified (specify a number like 0.5, 1.5, 2" );
		    return null;
		}
		return dir;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
	        var split = value.split(",");

		var v = trim(split[0]);

		f.orientation.value = "Portrait";
		f.leftmargin.value  = "";
		f.rightmargin.value  = "";
		f.topmargin.value  = "";
		f.botmargin.value  = "";

		var choices = me.directives[0].choices;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice.toLowerCase() == v.toLowerCase() )
			f.orientation.value = choice;
		}

		for(var l = 1; l < split.length;  l++ ) {
		    var lsplit = trim(split[l]).split(':');
		    if( lsplit.length != 2 )
		        continue;
		     var m = lsplit[0].toLowerCase();
		     var val_re = /[0-9]*\.[0-9][0-9]*$/;
		     if( lsplit[1].match(val_re) ) {
			 if( m == "left" )
			    f.leftmargin.value = lsplit[1];
			 else if( m == "right" )
			    f.rightmargin.value = lsplit[1];
			 else if( m == "top" )
			    f.topmargin.value = lsplit[1];
			 else if( m == "bottom" )
			    f.botmargin.value = lsplit[1];
		      }
		}
	  },
    	  name: 'Orientation',	 
	  title: 'Notation Orientation (Portrait or Landscape)', 
	  directives: [
	      {
	        id: 'orientation',	
	        name: 'Notation Orientation',
		choices: [ 	{ name: 'Portrait', 	value: 'Portrait' },
				{ name: 'Landscape', 	value: 'Landscape' }
			 ] 
	      },
	      {
		id: 'leftmargin',
		name: 'Left Margin for the page (inches)',
		textbox: true,
		maxlength: 4
	      },
	      {
		id: 'rightmargin',
		name: 'Right Margin for the page (inches)',
		textbox: true,
		maxlength: 4
	      },
	      {
		id: 'topmargin',
		name: 'Top Margin for the page (inches)',
		textbox: true,
		maxlength: 4
	      },
	      {
		id: 'botmargin',
		name: 'Bottom Margin for the page (inches)',
		textbox: true,
		maxlength: 4
	      }
	  ]
    };

AssistMap.phraseends = { 
	  validate: function(me, f, formobj) {
	    	var dir =  me.name + ": " + f.phraseends.value;
		var s = trim(f.spacing.value);
		if(s.match( /^[0-9.]*$/) ||
		   s.match( /^[0-9.][0-9.]*in$/) ||
		   s.match( /^[0-9.][0-9.]*em$/) ) {
		       dir += "," + s;
		}
		else {
		    alert( "incorrect spacing specified" );
		}
		return dir;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;

		f.phraseends.value = "Hide";
		f.spacing.value = "";
		var split = value.split(/\s*,\s*/);
		for(var si = 0; si < split.length; si++) {
		    var s = trim(split[si]);
		    if(s.match( /^[0-9.]*$/) ||
		       s.match( /^[0-9.][0-9.]*in$/) ||
		       s.match( /^[0-9.][0-9.]*em$/) ) {
		       f.spacing.value = s;
		    }
		    else {
			var choices = me.directives[0].choices;
			for( i = 0; i < choices.length; i++ ) {
			    var choice = choices[i].value;
			    if( choice.toLowerCase() == s.toLowerCase() ) {
				f.phraseends.value = choice;
				break;
			    }
			}
		    }
		}
	  },
    	  name: 'PhraseEnds',	 
	  title: 'Control whether phrasing markers (hyphens) should be shown', 
	  directives: [
	      {
	        id: 'phraseends',	
	        name: 'Show/Hide Phrasing Markers (hyphens)',
		choices: [ 	{ name: 'Show as Hyphens', 	value: 'Show' },
				{ name: 'Show as Handles',	value: 'Handle'},
				{ name: 'Show as Handles (thick)',value: 'HandleThick'},
				{ name: 'Hide', 	value: 'Hide' }
			 ] 
	      },
	      {
		id: 'spacing',
		name: 'Extra spacing following Phrasing Markers <br><span style="font-size:small;font-weight:normal;">specify as a number for pixels, or number followed by <i>in</i> for inches</span>',
		textbox: true,
		maxlength: 4
	      }
	  ]
    };

AssistMap.defaultspeed = { 
	  validate: function(me, f, value, formobj) {
	    	return me.name + ": " + f[me.directives[0].id].value;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
		var choices = me.directives[0].choices;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice.toLowerCase() == value.toLowerCase() ) {
			f.defaultspeed.value = choice;
			break;
		    }
		}
		if( i == choices.length )
		    alert( "ignoring unrecognized default speed value : " + value );
	  },
    	  name: 'DefaultSpeed',	 
	  title: 'Set the default speed for swaras in S: directives',
	  directives: [
	      {
	        id: 'defaultspeed',	
	        name: 'Default Speed',
		choices: [ 	{ name: 'First speed (default for Gitam)', 	     value: '0' },
				{ name: 'Second speed (default for Krithi/Varnam)',  value: '1' },
				{ name: 'Third speed', 		     	     	     value: '2' }
			 ] 
	      }
	  ]
    };


AssistMap.language = {
	  validate: function(me, f, value, formobj) {
		var val = trim(f.language.value);
		if(f.granthasa.checked) {
		    if( val.toLowerCase() != "tamil" )
			alert( "ignoring Grantha Sa setting as language is not Tamil" );
		    else
			val += ":granthasa";
		}
		var a = trim(f.qualsize.value);
		if( a != "" ) {
		    if( a == "100" || a.match(/[1-9][0-9]{0,1}/) ) {
			val += ":" + a + "%";
		    }
		    else {
			alert("invalid qualifier size setting, must be > 0 and <= 100" );
			return null;
		    }
		}
	    	return me.name + ": " + val;
	  },
	  parser: function(me, f, value) {
		if( value == "" ) return;
		var split = trim(value).split(':');
		var l = split[0];
		var choices = me.directives[0].choices;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice.toLowerCase() == l.toLowerCase() ) {
			f.language.value = choice;
			break;
		    }
		}
		if( i == choices.length ) {
		    alert( "unrecognized language: " + l );
		    return;
		}
		for(var si = 1; si < split.length; si++ ) {
		    var a = trim(split[si]);
		    if( a == "granthasa" ) {
			if( l.toLowerCase() != "tamil" )
			    alert( "ignoring granthasa attribute as language is not Tamil" );
			else
			    f.granthasa.checked = true;
		    }
		    else if( a.match(/[0-9]*%/)) {
			if( a == "100%" || a.match( /[0-9][1-9]{0,1}%/ ))
			    f.qualsize.value = a.substr(0,a.length-1);
			else
			    alert("ignoring invalid qualifier size setting, must be > 0 and <= 100" );
		    }
		    else
			alert( "ignoring unrecognized language attribute: " + a );
		}
	  },
    	  name: 'Language',	 
	  title: 'Set the default language in which to render notations and headings',
	  directives: [
	      {
	        id: 'language',	
	        name: 'Default Language',
		choices: [ 	
				{ name: 'English',				     value: 'English' },
				{ name: 'Sanskrit',				     value: 'Sanskrit' },
				{ name: 'Telugu',				     value: 'Telugu'   },
				{ name: 'Tamil',				     value: 'Tamil'   },
				{ name: 'Kannada',				     value: 'Kannada'   },
				{ name: 'Roman Diacritics',			     value: 'Diacritics' }
			 ] 
	      },
	      {
		id: 'granthasa',
		name: 'Use Grantha sa (for Tamil only)',
		checkbox: true
	      },
	      {
		id: 'qualsize',
		name: 'Size of qualifiers as a % of font-size (mainly for Tamil)',
		textbox: true,
		maxlength: 3
	      }
	  ]
}

AssistMap.swaraprefs = {
	  validate: function(me, f, value, formobj) {
		var v = "";
		if( f.colorfmt[0].checked == true ) {
		    // predefined
		    v += f.predef_color.value;
		}
		else {
		    if( !f.red.value.match(/[0-9]{0,3}/) ) {
			alert( "invalid value for red: must be a number between 0 and 255" );
			return null;
		    }
		    else if( !f.green.value.match(/[0-9]{0,3}/) ) {
			alert( "invalid value for green: must be a number between 0 and 255" );
			return null;
		    }
		    else if( !f.blue.value.match(/[0-9]{0,3}/) ) {
			alert( "invalid value for blue: must be a number between 0 and 255" );
			return null;
		    }
		    var c = parseInt(f.red.value);
		    if( c < 0 || c >= 255 ) {
			alert( "invalid value for red: must be a number between 0 and 255" );
			return null;
		    }
		    c = parseInt(f.green.value);
		    if( c < 0 || c >= 255 ) {
			alert( "invalid value for green: must be a number between 0 and 255" );
			return null;
		    }
		    c = parseInt(f.blue.value);
		    if( c < 0 || c >= 255 ) {
			alert( "invalid value for blue: must be a number between 0 and 255" );
			return null;
		    }
		    v = "rgb(" + f.red.value + "." + f.green.value  + "." + f.blue.value + ")";
		}
		if( f.fontsize.value != "" ) {
		    if( v != "" ) v += ",";
		    v += f.fontsize.value;
		}
		return me.name + ": " + v;
	  },
      parser: function(me, f, value, formobj) {
	    // color-spec,font-size (any order)
	    value = trim(value);
	    if( value == "" ) return;
	    var split = value.split(/\s*,\s*/);
	    for(var si = 0; si < split.length; si++) {
		var s = trim(split[si]);
		if(s.match( /^[0-9][0-9]*$/)) {
		    var choices = me.directives[1].choices;
		    for( i = 0; i < choices.length; i++ ) {
			var choice = choices[i].value;
			if( choice.toLowerCase() == s.toLowerCase() ) {
			    f.fontsize.value = choice;
			    break;
			}
		    }
		}
		else  {
		    if( isRGBColorSpec(s) ) {
			var rgbre = /rgb\s*\(([0-9]+)\.([0-9]+)\.([0-9]+)\)/gi;
			var rgbre_ret = rgbre.exec(s);
			if( rgbre_ret && rgbre_ret.length == 4 )  {
			    f.red.value = rgbre_ret[1].replace(".","");
			    f.green.value = rgbre_ret[2].replace(".","");
			    f.blue.value = rgbre_ret[3].replace(".","");
			    //f.colorfmt.value = "rgb";
			    f.colorfmt[0].checked = false;
			    f.colorfmt[1].checked = true;
			    formobj.onRGBColor();
			}
		    }
		    else {
			for( var choice in Colors ) { // Colors => see model.js
			    if( choice.toLowerCase() == s.toLowerCase() ) {
				f.predef_color.value = choice;
				f.colorfmt[0].checked = true;
				f.colorfmt[1].checked = false;
				//f.colorfmt.value = "predefined";
				formobj.onPredefinedColor();
				break;
			    }
			}
		    }
		}
	    }
      },

      name: 'SwaraPrefs',	 
      title: 'Swara Preferences (font size, color)',
      directives: [
	  {
	    id: 'color',
	    name: 'Color',
	    color: true
	  },
	  {
	    id: 'fontsize',
	    name: 'Font Size',
	    choices: [ 	
			    { name: 'Default',	value: ''  },
			    { name: '8',	value: '8' },
			    { name: '9',	value: '9' },
			    { name: '10',	value: '10' },
			    { name: '11',	value: '11' },
			    { name: '12',	value: '12' },
			    { name: '14',	value: '14' },
			    { name: '16',	value: '16' },
			    { name: '18',	value: '18' },
			    { name: '20',	value: '20' },
			    { name: '24',	value: '24' },
			    { name: '28',	value: '28' },
			    { name: '32',	value: '32' },
			    { name: '36',	value: '36' }
			]
	}
    ]	
}

AssistMap.lyricprefs = {
    name: "LyricPrefs",
    title: 'Lyric Preferences (font size, color)',
    directives: AssistMap.swaraprefs.directives,
    parser: AssistMap.swaraprefs.parser,
    validate: AssistMap.swaraprefs.validate
}

AssistMap.headingprefs = {
    name: "HeadingPrefs",
    title: 'Heading Preferences (font size, color)',
    directives: AssistMap.swaraprefs.directives,
    parser: AssistMap.swaraprefs.parser,
    validate: AssistMap.swaraprefs.validate
}

AssistMap.gamakaprefs = {
    name: "GamakaPrefs",
    title: 'Gamaka Preferences (font size, color of text based gamakas)',
    directives: AssistMap.swaraprefs.directives,
    parser: AssistMap.swaraprefs.parser,
    validate: AssistMap.swaraprefs.validate
}

AssistMap.languagefont = {
	  validate: function(me, f, formobj) {
	    var font = trim(f.font.value);
	    if(font == "") {
		alert( "Please specify a font" );
		return null;
	    }
	    return me.name + ": " + f.language.value + "," + f.font.value;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
		var split = value.split(/\s*,\s*/);
		var l = value;
		if( split.length > 0 )
		    l = split[0];
		var languages = me.directives[0].choices;
		for( i = 0; i < languages.length; i++ ) {
		    var lang = languages[i].value;
		    if( lang.toLowerCase() == l.toLowerCase() ) {
			f.language.value = lang;
			break;
		    }
		}
		if( i == languages.length )
		    alert( "ignoring unrecognized language: " + language );
		if( split.length > 1 )
		    f.font.value = split[1];
	  },
    	  name: 'LanguageFont',	 
	  title: 'Font for a language',
	  directives: [
	      {
	        id: 'language',	
	        name: 'Language',
		choices: [ 	
				{ name: 'English',				     value: 'English' },
				{ name: 'Sanskrit',				     value: 'Sanskrit' },
				{ name: 'Telugu',				     value: 'Telugu'   },
				{ name: 'Tamil',				     value: 'Tamil'   },
				{ name: 'Kannada',				     value: 'Kannada'   },
				{ name: 'Roman Diacritics',			     value: 'Diacritics' }
			 ] 
	      },
	      {
	        id: 'font',	
	        name: '<span>Font<br><i style="font-weight: normal; font-size: small;">(must be accessible to browser!)</i></span>',
		textbox: true,
		maxlength: 40
	      }
	  ]
}

AssistMap.heading = {
	  validate: function(me, f, formobj) {
	    var v = me.name + ': "' + f.contents.value + '"';
	    var a = new Array();
	    if( f.bold.checked )
		a[a.length] = "bold";
	    if( f.italic.checked )
		a[a.length] = "italic";
	    if( f.underline.checked )
		a[a.length] = "underline";
	     if( f.alignment.value != "Left" )
		a[a.length] = f.alignment.value;
	     if( f.language.value != "" )
		a[a.length] = f.language.value;
	      if( f.font.value != "" ) {
		if( f.font.value.indexOf( ',' ) >= 0 ) {
		    alert( "invalid font value: " + f.font.value );
		    return null;
		}
		a[a.length] = trim(f.font.value);
	      }
	      if(a.length > 0 ) v += ",";
	      return v + a.join(",");
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
		var heading_re = /"([^"]*)"(.*)$/i;
		var re_ret = heading_re.exec(value);
		var hasAttr = false;
		f.language.value = '';
		var attrs = null;
		f.alignment.value = "Left";	// default
		if( re_ret == null || re_ret.length < 1 ) {
		    if( trim(value) != "" ) {
			alert("ignored invalid heading: " + value);
		    }
		    return;
		}
		else {
		    f.contents.value = re_ret[1];
		    if( re_ret.length > 2 ) 
			attrs = re_ret[2];
		}

		if( attrs != null ) {
		    var s = attrs.split(',');
		    var ignored = "";
		    for( i = 0; i < s.length; i++ ) {
			var v = s[i];
			var lv = v.toLowerCase();
			if( lv == "bold" )
			    f.bold.checked = true;
			else if( lv == "italic" )
			    f.italic.checked = true;
			else if( lv == "underline" )
			    f.underline.checked = true;
			else if( lv.toLowerCase() == "center" )
			    f.alignment.value = "Center";
			else if( lv.toLowerCase() == "left" )
			    f.alignment.value = "Left";
			else if( lv.toLowerCase() == "right" )
			    f.alignment.value = "Right";
			else if( lv.toLowerCase() == "tamil" )
			    f.language.value = "Tamil";
			else if( lv.toLowerCase() == "english" )
			    f.language.value = "English";
			else if( lv.toLowerCase() == "sanskrit" )
			    f.language.value = "Sanskrit";
			else if( lv.toLowerCase() == "telugu" )
			    f.language.value = "Telugu";
			else if( lv.toLowerCase() == "kannada" )
			    f.language.value = "Kannada";
			else if( v != "") {
			    if( f.font.value == ""  ) {
				f.font.value = trim(v);
			    }
			    else {
				if(ignored != "" ) ignored += ","
				ignored += v;
			    }
			}
		    }
		    if( ignored != "" ) {
		    	alert( "ignored unrecognized heading attributes: " + ignored );
		    }
		}
	  },
    	  name: 'Heading',	 
	  title: 'Heading',
	  directives: [
	      {
	        id: 'contents',	
		name: 'Contents',
		textbox: true,
		maxlength: 60
	      },
	      {
	        id: 'alignment',	
	        name: 'Alignment',
		choices: [ 	
				{ name: 'Center',				     value: 'Center' },
				{ name: 'Left',				     	     value: 'Left' },
				{ name: 'Right',				     value: 'Right'   }
			 ] 
	      },
	      {
	        id: 'bold',	
	        name: 'Bold',
		checkbox: true
	      },
	      {
	        id: 'italic',	
	        name: 'Italic',
		checkbox: true
	      },
	      {
	        id: 'underline',	
	        name: 'Underline',
		checkbox: true
	      },
	      {
	        id: 'language',	
	        name: 'Language <i style="font-size: small; font-weight:normal">(override)</i>',
		choices: [ 	
				{ name: '',				     value: '' },
				{ name: 'English',				     value: 'English' },
				{ name: 'Sanskrit',				     value: 'Sanskrit' },
				{ name: 'Telugu',				     value: 'Telugu'   },
				{ name: 'Tamil',				     value: 'Tamil'   },
				{ name: 'Kannada',				     value: 'Kannada'   }
			 ] 
	      },
	      {
	        id: 'font',	
	        name: '<span>Font<br><i style="font-weight: normal; font-size: small;">(must be accessible to browser!)</i></span>',
		textbox: true,
		maxlength: 40
	      }
	  ]
}


AssistMap.layout = {
      validate: function(me, f, formobj) {
	return me.name + ": " + f.layout.value + "," + f.width.value;
      },
      parser: function(me, f, value) {
	    value = trim(value);
	    if( value == "" ) return;
	    var split = value.split(/\s*,\s*/);
	    if( split.length != 1 && split.length != 2 )
		return;
	    var sawType = false;
	    var sawWidth = false;
	    for(s = 0; s < split.length; s++ ) {
		var valid = false;
		var l = split[s];
		if( !sawType) {
		    var choices = me.directives[0].choices;
		    for( i = 0; i < choices.length; i++ ) {
			var choice = choices[i].value;
			if( choice.toLowerCase() == l.toLowerCase() ) {
			    f.layout.value = choice;
			    sawType = true;
			    valid = true;
			    break;
			}
		    }
		}
		else  if( !sawWidth ) {
		    var choices = me.directives[1].choices;
		    for( i = 0; i < choices.length; i++ ) {
			var choice = choices[i].value;
			if( choice.toLowerCase() == l.toLowerCase() ) {
			    f.width.value = choice;
			    sawWidth = true;
			    valid = true;
			    break;
			}
		    }
		}
		if( !valid ) {
		    alert( "ignoring unrecognized/duplicate value: " + l );
		}
	    }
      },
      name: 'Layout',	 
      title: 'Set layout of notations',
	  directives: [
	      {
	        id: 'layout',	
	        name: 'Layout',
		choices: [ 	{ name: 'Krithi', 	value: 'Krithi' },
				{ name: 'Varnam', 	value: 'Varnam' },
				{ name: 'Gitam', value: 'Gitam' }
			 ] 
	      },
	      {
	        id: 'width',	
	        name: 'Width (relative to page)',
		choices: [ 	{ name: 'Compact', 	value: 'Compact' },
				{ name: 'Full Page Width', 	value: 'FullWidth' }
			 ] 
	      }
	  ]
}

AssistMap.gati = {
	  validate: function(me, f, formobj) {
	    	return me.name + ": " + f[me.directives[0].id].value;
	  },
	  parser: function(me, f, value) {
		value = trim(value);
		if( value == "" ) return;
		var choices = me.directives[0].choices;
		for( i = 0; i < choices.length; i++ ) {
		    var choice = choices[i].value;
		    if( choice.toLowerCase() == value.toLowerCase() ) { 
			f.speedmarks.value = choice;
			break;
		    }
		}
		if( i == choices.length )
		    alert( "ignoring gati value : " + value );
	  },
    	  name: 'Gati',	 
	  title: 'Switch gati/nadai', 
	  directives: [
	      {
	        id: 'gati',	
	        name: 'Gati',
		choices: [ 	{ name: 'tiSra gati', 		value: 'Tisra' },
				{ name: 'catusra gati', 	value: 'Catusra' },
				{ name: 'khaNDa gati', 		value: 'Khanda' },
				{ name: 'miSra gati', 		value: 'Misra' },
				{ name: 'sankIrNa gati', 	value: 'Sankirna' }
			 ] 
	      }
	  ]
    };

function assistDirective( dir, curval, callback ) 
{
    var assistData = AssistMap[dir.toLowerCase()];
    if( assistData ) {
	var f = new SimpleAssistForm();
	f.setValues(assistData, callback);
	var obj = document.getElementById("CmdArea");
	var x = LookAndFeel.findPosX(obj);
	var y = LookAndFeel.findPosY(obj);
	f.initForm(document.body,false,null,assistData.title);
	// load values using parser for the directive
	if( assistData.parser ) {
	    assistData.parser(assistData, f.fForm, curval, f);
	}
	f.show(x,y);
    }
}


/**
 * callback object for assistform which gets called when user clicks
 * ok on the assistform - this is used when not using codepress i.e.
 * plain text area
 *
 * @param textArea	the text area control
 * @param startPos	position of start of line containing directive being
 *			assisted
 * @param endPPos   	position of end of line containing directive being 
 *			assisted
 */
function NoCodePressAssistFormCallback(textArea, startPos, endPos)
{
    this.fTextArea = textArea;
    this.fStartPos = startPos;
    this.fEndPos   = endPos;

    this.setCurrentDirective = function(newContents) {
	replaceTextAreaContents(this.fTextArea, this.fStartPos, this.fEndPos, newContents);
	var e = this.fStartPos + newContents.length;
	replaceTextAreaContents(this.fTextArea, e, e, "" );
	this.fTextArea.focus();
    }
}

/**
 * callback object for assistform which gets called when user clicks
 * ok on the assistform - this is used when using codepress 
 * TODO: not yet implemented
 */
function CodePressAssistFormCallback(textArea, caretPos)
{
    this.fTextArea = textArea;
    this.fCaretPos = caretPos;
    this.setCurrentDirective = function(contents) {
    	alert("internal error: unimplemented with codepress");
    }
}

function directiveNameSort(a, b) {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    if( a < b )
	return -1;
    else if( a > b )
	return 1;
    else
	return 0;
}

/**
 * assist form
 */
function onAssist()
{
    var directiveLine = "";
    var rawContents;
    var callback = null;
    if( !doCodePress ) {
	rawContents =  document.getElementById("rawContents");
	var caretPos = getTextAreaCaretPosition(rawContents);
	var v= rawContents.value;
	var sb;
	if( caretPos == 0 )
	    sb = 0;
	else {
	    sb  = v.lastIndexOf("\n",caretPos);
	    if(sb == caretPos)
		sb  = v.lastIndexOf("\n",caretPos-1);
	}
	if( sb <= 0 )
	    sb = 0;
	else
	    sb++;

	var ser = v.indexOf('\r',sb);
	var se  = v.indexOf('\n',sb);
	if( ser > 0 && se > 0 && ser == (se-1) )
	    se = ser;
	if( se < 0 ) {
	    directiveLine = v.substring(sb);
	    se = v.length;
	}
	else
	    directiveLine = v.substring(sb, se);
	callback = new NoCodePressAssistFormCallback(rawContents, sb, se);
    }
    else {
	rawContents =  document.getElementById("rawContents_cp").previousSibling;	// IE (too) 
	rawContents.editor.syntaxHighlight();

	if( rawContents.contentWindow.document.selection ) {	// IE
	    range = rawContents.contentWindow.document.selection.createRange();
	    node = range.item ? range.item(0) : range.parentElement();
	}
	else {
	    range = rawContents.contentWindow.getSelection().getRangeAt(0);
	    node = range.endContainer;			
	}

	while(node.parentNode != null && node.parentNode.tagName 
			&& node.parentNode.tagName.toLowerCase() != "pre")
	    node = node.parentNode;
	var brNode = null;
	var props = "";
	while( node.previousSibling ) {
	    if(node.previousSibling.tagName && (node.previousSibling.tagName.toLowerCase() == "br" ||
	    					node.previousSibling.tagName.toLowerCase() == "p" ))	// for IE
	    	break;
	    node = node.previousSibling;
	}

	if( node && node.tagName && node.tagName.toLowerCase() == "p" )
	    node = node.firstChild;

	// now node is beginning
	if( !node ) return;

	directiveLine = "";
	while(node) {
	    var t = "";
	    if( node.tagName ) {
		t = node.tagName.toLowerCase();
	    }
	    if( t == "br" || t == "p" ) break;
	    directiveLine += getNodeContents(node);
	    node = node.nextSibling;
	}
	if( directiveLine.indexOf( "\n" ) >= 0 ) return;
	callback = new CodePressAssistFormCallback(rawContents, caretPos);
    }

    if( trim(directiveLine) == "") {
	    var choices = new Array();
	    for( i in AssistMap ) {
		var o = new Object();
		o.name = AssistMap[i].name;
		o.value = AssistMap[i].name;
		choices[choices.length] = o;
	    }

	    var data = new Object();
	    data.validate = function(me, f, formobj) { return f.directive.value; }
	    data.parser   = function(me, f, value) {}
	    data.isSelectDirective = true;
	    data.name     = 'Directive';
	    data.title    = 'Select Directive';
	    data.directives = new Array();
	    var d = new Object();
	    d.id = "directive";
	    d.name = "Select the directive that you wish to add";
	    d.choices = choices.sort(directiveNameSort);
	    data.directives[0] = d;

	    var f = new SimpleAssistForm();
	    f.setValues(data, callback);
	    var obj = document.getElementById("CmdArea");
	    var x = LookAndFeel.findPosX(obj);
	    var y = LookAndFeel.findPosY(obj);
	    f.initForm(document.body,false,null,data.title);
	    f.show(x,y);
	    return;
    }

    var dir = null;
    var col = directiveLine.indexOf( ':' );
    var val = null;
    if( col > 0 ) {
    	dir = trim(directiveLine.substring(0,col));
	val = trim(directiveLine.substring(col+1));
    }
    else {
    	dir = trim(directiveLine);
	val = "";
    }
    if( dir.match(/[a-zA-Z][a-zA-Z]*/) ) {
	var assistData = AssistMap[dir.toLowerCase()];
	if( assistData ) {
	    assistDirective(dir, val, callback);
		//var f = new SimpleAssistForm();
		//f.setValues(assistData, callback);
		//var obj = document.getElementById("CmdArea");
		//var x = LookAndFeel.findPosX(obj);
		//var y = LookAndFeel.findPosY(obj);
		//f.initForm(document.body,false,null,assistData.title);
		// load values using parser for the directive
		//if( assistData.parser ) {
		    //assistData.parser(assistData, f.fForm, val, f);
		//}
		//f.show(x,y);
	    return;
	}
    }
    alert("Cannot provide assistance as current line is not empty, and does not contain a valid directive.");
}




