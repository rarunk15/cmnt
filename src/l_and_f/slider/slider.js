function addEvent(event, elm, handler, bubble) {
	if (elm.addEventListener)
		elm.addEventListener(event, handler, bubble);
	else if (elm.attachEvent)
		elm.attachEvent("on"+event, handler);
}

function delEvent(event, elm, handler, bubble) {
	if (elm.removeEventListener)
		elm.removeEventListener(event, handler, bubble);
	else if (elm.detachEvent)
		elm.detachEvent("on"+event, handler);
}

function getObjectMethodClosure(object, method) {
	return function(arg) {
		return object[method](arg); 
	}
}
var element = getObjectMethodClosure(document, "createElement");
var txtNode = getObjectMethodClosure(document, "createTextNode");

/*
 * Slider
 */
function Slider(id, orientation, resolution) {
	this.setSize = function (width, height) {
		this.width = width;
		this.height = height;
	}

	this.drag = function (event) {
		if (!event) var event = window.event;
		var deltaX=event.clientX - parseInt(sl.s.style.left);
		var deltaY=event.clientY - parseInt(sl.s.style.top);

		addEvent("mousemove", document, moveHandler, true);
		addEvent("mouseup", document, upHandler, true);

		function moveHandler(e) {
			var x; var y; var newvalue;
			if (!e) e=window.event;
	
			if (sl.orientation != "vertical") {
				x = e.clientX - deltaX;
				if (x<0) x=0;
				//if (x>sl.width-10) x=sl.width-10;
				//sl.s.style.left=(x) + "px";
				if( x > sl.width ) x = sl.width;
				sl.s.style.left=((x > sl.width-10) ? (sl.width-10) : x ) + "px";
				newvalue = parseInt(x/sl.width * sl.resolution);
			}
			else if (sl.orientation != "horizontal") {
				y = e.clientY - deltaY;
				if (y<0) y=0;
				//if (y>sl.height-10) y=sl.height-10;
				//sl.s.style.top=(y) + "px";
				if( y > sl.width ) y = sl.height;
				sl.s.style.left=((y > sl.height-10) ? (sl.height-10) : y ) + "px";
				newvalue = parseInt(y/sl.height * sl.resolution);
			}
			if (newvalue != sl.value) {
				sl.value = newvalue;
				sl.onChange(newvalue);
			}
		}
	
		function upHandler(e) {
			if (!e) e=window.event;
			delEvent("mouseup", document, upHandler, true);
			delEvent("mousemove", document, moveHandler, true);
		}
	}

	this.onChange = function (value) {
		alert(value);
	}

	this.setStart = function (value) {
		// Use only AFTER you defined onChange
		this.value = value;
		this.onChange(value);
		this.moveSlide(value);
	}
	
	this.moveSlide = function (value) {
		var length = this.height;
		var l;

		if (this.orientation == "horizontal")
			length = this.width;

		l = parseInt(length/this.resolution) * value;

		if (this.orientation == "horizontal")
			this.s.style.left=(l)+"px";
		else
			this.s.style.top=(l)+"px";
	}

	this.createSlider = function() {
		var rel = element("div");
		rel.style.display="none";
		rel.style.position = "relative";
		rel.setAttribute("id", this.id+"_slider");

		var bar = element("div");
		bar.style.position = "absolute";
		bar.style.backgroundColor = "#aaa";
		//bar.style.borderLeft = "thick solid #888";
		//bar.style.borderRight = "thick solid #888";
		if (this.orientation == "horizontal") {
			bar.style.left = "0px";
			bar.style.top = (parseInt(this.height/2)-1)+"px";
			bar.style.width = (this.width)+"px";
			bar.style.height = "2px";
			bar.style.overflow = "hidden";
			rel.style.height = "2px";
		} else {
			bar.style.left = (parseInt(this.width/2)-1)+"px";
			bar.style.top = "0px";
			bar.style.width = "2px";
			bar.style.height = (this.height)+"px";
			bar.style.overflow = "hidden";
			rel.style.height = (this.height)+"px";
		}
		rel.appendChild(bar);
		
		// Set slider image as background element to fix IE quirk
		var img = element("div");
		img.style.backgroundColor = "rgb(224,224,224)";
		img.style.backgroundImage='url("' + sliderCodeBase + 'img/button.png")';
		img.style.backgroundRepeat="no-repeat";
		img.style.width="11px";
		img.style.height="10px";
		img.style.padding="0px";
		img.style.overflow = "hidden";
		img.style.position = "absolute";
		img.style.left = "0px"; 
		img.style.top="0px";

		img.onmousedown = this.drag;
		this.s = img;

		rel.appendChild(img);
		document.getElementById(this.id).appendChild(rel);
	}
	
	this.show = function() {
	    this.s.parentNode.style.display="block";
	}
	this.hide = function() {
	    this.s.parentNode.style.display="none";
	}

	// Initialize class
	this.id = id;
	this.orientation = "horizontal";
	this.resolution = 10;
	this.height = 10;
	this.width = 100;
	this.s = null;
	this.value=0;
	var sl = this;
	
	if (orientation != undefined && orientation == "vertical") {
		this.orientation = "vertical";
		this.setSize(10, 100);
	}
	if (resolution != undefined)
		this.resolution = resolution;
		
	this.createSlider();
}
