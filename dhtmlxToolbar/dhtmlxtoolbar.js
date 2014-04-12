//v.1.0 build 71114

/*
Copyright DHTMLX LTD. http://www.dhtmlx.com
You allowed to use this component or parts of it under GPL terms
To use it on other terms or get Professional edition of the component please contact us at sales@dhtmlx.com
*/
/*_TOPICS_
@0:Initialization
@1:Add/delete
@2:Action handling
@3:Private
@4:Item control
@5:Private
06:Select specific
*/


      /**
          *     @desc: toolbar object
        *     @param: htmlObject - parent html object or id of parent html object
          *     @param: width - object width
          *     @param: height - object height
          *     @param: name - toolbar display name
          *     @param: vMode - if eq 1 => vertical toolbar
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXToolbarObject(htmlObject,width,height,name,vMode){
      if (_isIE) try { document.execCommand("BackgroundImageCache", false, true); } catch (e){}
      this.width=width;      this.height=height;
      if (typeof(htmlObject)!="object")
         this.parentObject=document.getElementById(htmlObject);
      else
         this.parentObject=htmlObject;

      this.xmlDoc=0;
      this.topNod=0;   this.dividerCell=0;      this.firstCell=0;   this.nameCell=0;   this.crossCell=0;
      this.items=new Array();      this.itemsCount=0;
      this.defaultAction=0;
      this.extraMode=convertStringToBoolean(vMode);
      this.onShow=0;      this.onHide=0;
      this.oldMouseMove=0;
      this.tname=name;

      this.tableCSS="toolbarTable";
      this.titleCSS="toolbarName";

      if (!this.extraMode)
         this._create_self();
      else
         this._create_self_vertical();

      if (this._extendedInit) this._extendedInit();
      this.xmlLoader=new dtmlXMLLoaderObject(this._parseXMLTree,this);
      return this;
      
      };

      dhtmlXToolbarObject.prototype = new dhtmlXProtobarObject;


      
      /**  
          *     @desc: add item to toolbar
          *     @param: item - dhtmlXButton object
          *     @param: pos  - item position
          *     @type: public
          *     @topic: 1
          */

      dhtmlXToolbarObject.prototype.addItem=function(item,pos){
            if ((!pos)||(pos>this.itemsCount))
                pos=this.itemsCount;

         if (this.extraMode){
              var tr=document.createElement("tr");
            tr.style.verticalAlign="top";
            tr.appendChild(item.getTopNode());
                this.firstCell.parentNode.parentNode.insertBefore(tr,(pos==this.itemsCount)?this.firstCell.parentNode:this.items[pos].getTopNode().parentNode);
            item.getTopNode().style.width='100%';
         }
            else{
               this.firstCell.parentNode.insertBefore(item.getTopNode(),(pos==this.itemsCount)?this.firstCell:this.items[pos].getTopNode());
            item.getTopNode().style.height='100%';
         }

         item.parentNod=this;
         if (this.defaultAction) item.setAction(this.defaultAction);

            for (var i=pos; i<this.itemsCount+1; i++){
                var a=this.items[i];
             this.items[i]=item;
                item=a;
                }

         this.itemsCount++;
      }

      /**
          *     @desc: return item index in collection by position
          *     @type: private
        *     @param: position - item position
        *     @topic: 3
          */      
      dhtmlXToolbarObject.prototype._getItemIndexByPosition=function(position){
         var j=0;
         for (var i=0; i<this.itemsCount; i++)
         {
            if (this.items[i].hide!=1) j++;
            if (j==position) return i;
         };
         return -1;
      };


      
      /**  
          *     @desc: return item object by position
          *     @type: public
        *     @param: position - item position
        *     @topic: 4
          */
      dhtmlXToolbarObject.prototype.getItemByPosition=function(position){
         var z=this._getItemIndexByPosition(position);
         if (z>=0) return this.items[z];
      };      
      /**  
          *     @desc: remove item
          *     @type: public
        *     @param: itemId - item id
         *     @topic: 1
          */         
      dhtmlXToolbarObject.prototype.removeItemById=function(itemId){
         var z=this._getItemIndex(itemId);
         if (z>=0) {
         if (this.items[z].removeItem) this.items[z].removeItem();
         this.firstCell.parentNode.removeChild(this.items[z].getTopNode());                  
         this.items[z]=0;
         this.itemsCount--;
         for (var i=z; i<this.itemsCount; i++){
            this.items[i]=this.items[i+1];
            }
         }
      }
      /**  
          *     @desc: remove item
          *     @type: public
        *     @param: position - item position        
         *     @topic: 1
          */
      dhtmlXToolbarObject.prototype.removeItemByPosition=function(position){
         var z=this._getItemIndexByPosition(position);
         if (z) {
         if (this.items[z].removeItem) this.items[z].removeItem();   
         this.firstCell.parentNode.removeChild(this.items[z].getTopNode());         
         this.items[z]=0;
         this.itemsCount--;
         for (var i=z; i<this.itemsCount; i++){
            this.items[i]=this.items[i+1];
            }            
         }
         
      }

      /**  
          *     @desc: hide toolbar button
          *     @type: public
        *     @param: position - item position        
         *     @topic: 4
          */                  
      dhtmlXToolbarObject.prototype.hideItemByPosition=function(position){
         var z=this.getItemByPosition(position);
         if (z) { z.getTopNode().style.display="none";  z.hide=1; }
      }

      
    dhtmlXToolbarObject.prototype._attributes=function(n){
        var nAtr=new Object();
      var atr=n.attributes;
      for (var a=0; a<atr.length; a++)
           nAtr[atr[a].name]=atr[a].value;
      if (n.childNodes)
      for (var a=0; a<n.childNodes.length; a++){
         if (n.childNodes[a].nodeType==1){
            var tag=n.childNodes[a];
            if (!nAtr[tag.tagName]) nAtr[tag.tagName]=new Array();
            var tog=nAtr[tag.tagName];
            tog[tog.length]=this._attributes(tag);
         }
         if (n.childNodes[a].nodeType==3){
            nAtr.content=n.childNodes[a].data;
            }
      }
      return nAtr;
   }

      /**
          *     @desc: parse xml
          *     @type: private
        *     @param: that - toolbar object
        *     @param: node - top xml node
         *     @topic: 0
          */

   dhtmlXToolbarObject.prototype._parseXMLTree=function(that,node){
      if (!node) node=that.xmlLoader.getXMLTopNode("toolbar");

        var nAtr=that._attributes(node);
      if (!nAtr.globalTextCss) nAtr.globalTextCss=that.globalTextCss;
      if (!nAtr.globalCss) nAtr.globalCss=that.globalCss;

      if (nAtr.toolbarAlign) that.setBarAlign(nAtr.toolbarAlign);
      if (nAtr.absolutePosition=="yes"){
          that.topNod.style.position="absolute";
          that.topNod.style.top=nAtr.left||0;
          that.topNod.style.left=nAtr.top||0;
                           };
       if ((nAtr.absolutePosition!="auto")&&(nAtr.absolutePosition!="yes"))  that.dividerCell.style.display="none";
      if(nAtr.name) that.setTitleText(nAtr.name);
      if (nAtr.width)   that.setBarSize(nAtr.width,nAtr.height);

      for(var i=0; i<node.childNodes.length; i++)
      {
         var localItem=node.childNodes[i];
           if (localItem.nodeType==1)
         {
                      var lAtr=that._attributes(localItem);
               if ((!lAtr.className)&&(nAtr.globalCss))
                  lAtr.className=nAtr.globalCss;
               if ((!lAtr.textClassName)&&(nAtr.globalTextCss))
                  lAtr.textClassName=nAtr.globalTextCss;
               if (localItem.tagName=="divider")
                     if (that.extraMode)
                     lAtr.button="DividerY";
                  else
                     lAtr.button="DividerX";
               else
                  lAtr.button=localItem.tagName;
            if ((lAtr.src)&&(that.sysGfxPath))
                lAtr.src=that.sysGfxPath+lAtr.src;

               var TempNode=dhxButtonFactory(lAtr);

               if (TempNode) that.addItem(TempNode);

               if (localItem.getAttribute("disabled"))
                       TempNode.disable();

         }
      }
       if (that.dhx_xml_end) that.dhx_xml_end(that);
       if (that.waitCall) { that.waitCall(); that.waitCall=0; }
   };

    /**
    *     @desc: set function called after xml loading/parsing ended
    *     @param: func - event handling function
    *     @type: public
    *     @edition: Standard
    *     @topic: 2
    *     @event:  onXMLLoadingEnd
    *     @eventdesc: event fired simultaneously with ending XML parsing, new items already available in toolbar
    *     @eventparam: toolbar object
    */
   dhtmlXToolbarObject.prototype.setOnLoadingEnd=function(func){
       if (typeof(func)=="function")
            this.dhx_xml_end=func;
         else
            this.dhx_xml_end=eval(func);
    };

      /**  
          *     @desc: set toolbar classes
          *     @type: public
        *     @param: table - css class for toolbar container
          *     @param: title - css class for toolbar title
          *     @param: button - css class for button
          *     @param: text - css class for button text
         *     @topic: 0
          */
      dhtmlXToolbarObject.prototype.setToolbarCSS=function(table,title,button,text){
         this.tableCSS=table;
         this.titleCSS=title;
         this.globalCss=button;
         this.globalTextCss=title;
         this.topNod.className=this.tableCSS;
         this.preNameCell.className=this.titleCSS;
         this.nameCell.className=this.titleCSS;
         
      }
      
      /**  
          *     @desc: create object HTML representation
          *     @type: private
         *     @topic: 0
          */
      dhtmlXToolbarObject.prototype._create_self=function()
      {
         if(!this.width) this.width=1;
         if(!this.height) this.height=1;

      var div=document.createElement("div");
         div.innerHTML='<table cellpadding="0" cellspacing="1" class="'+this.tableCSS+'" style="display:none" width="'+this.width+'" height="'+this.height+'"><tbody>' +
                     '<tr>'+
                     '<td width="'+(_isFF?5:3)+'px"><div class="toolbarHandle" '+(_isIE?"style='width:3px'":"")+'>&nbsp;</div></td>'+
                     '<td class="'+this.titleCSS+'" style="display:none">'+this.name+'</td>'+
                     '<td></td>'+
                     '<td align="right" width="100%" class="'+this.titleCSS+'" style="display:none">'+this.name+'</td>'+
                     '<td></td>'+
                     '</tr></tbody></table>';
         var table=div.childNodes[0];
         table.setAttribute("UNSELECTABLE","on");
         table.onselectstart=this.badDummy;         
      this.topNod=table; 
      this.dividerCell=table.childNodes[0].childNodes[0].childNodes[0];
      this.dividerCell.toolbar=this;
      this.preNameCell=this.dividerCell.nextSibling;
      this.firstCell=this.preNameCell.nextSibling;
      this.nameCell=this.firstCell.nextSibling;
      this.crossCell=this.nameCell.nextSibling;                     
      
      this.parentObject.appendChild(table);
      };
      
      /**
          *     @desc: create object HTML ( for vertical toolbar )
          *     @type: private
         *     @topic: 0
          */
      dhtmlXToolbarObject.prototype._create_self_vertical=function()
      {   
         if(!this.width) this.width=1;       
         if(!this.height) this.height=1;
         
      var div=document.createElement("div");
         div.innerHTML='<table cellpadding="0" cellspacing="1" class="'+this.tableCSS+'" style="display:none" width="'+this.width+'" height="'+this.height+'"><tbody>' +
                     '<tr><td heigth="'+(_isFF?5:3)+'px"><div class="vtoolbarHandle" style="width:100%; '+(_isIE?"height:3px":"")+' overflow:hidden"></div></td></tr>'+
                     '<tr><td height="100%" class="'+this.titleCSS+'" style="display:none">'+this.name+'</td></tr>'+
                     '<tr><td></td></tr>'+
                     '<tr><td align="right" height="100%" class="'+this.titleCSS+'" style="display:none">'+this.name+'</td></tr>'+
                     '<tr><td></td></tr>'+
                     '</tbody></table>';

      var table=div.childNodes[0];
      table.onselectstart=this.badDummy;      
      table.setAttribute("UNSELECTABLE","on");
      
      this.topNod=table;
      this.dividerCell=table.childNodes[0].childNodes[0].childNodes[0];
      this.dividerCell.toolbar=this;
      this.preNameCell=table.childNodes[0].childNodes[1].childNodes[0];
      this.firstCell=table.childNodes[0].childNodes[2].childNodes[0];
      this.nameCell=table.childNodes[0].childNodes[3].childNodes[0];
      this.crossCell=table.childNodes[0].childNodes[4].childNodes[0];

      this.parentObject.appendChild(table);
         };

      
/**
*     @desc: button factory
*     @param: tag - description object
*     @type: public
*     @topic: 0
*/
function dhxButtonFactory(tag,zone){
   var name="dhtmlX"+tag.button+"Object";
   if (arguments.length==2) tag._td="DIV";

   if (window[name])
      var z=new window[name](tag);

   if (arguments.length==2)
      if (zone) zone.appendChild(z.topNod);
      else {
         document.write("<div id='button_factory_temp'></div>");
         var x=document.getElementById('button_factory_temp');
         x.appendChild(z.topNod);
         x.id='';
      }

   return z;
}

      /**
          *     @desc: image button
          *     @param: src - image href
          *     @param: text - button text
          *     @param: width - object width
          *     @param: height - object height
          *     @param: action - default action
          *     @param: id - identificator
          *     @param: tooltip - image tooltip
          *     @param: className - toolbar button css class     
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXImageButtonObject(src,width,height,action,id,tooltip,className,disableImage){
      if (typeof(src)!="object")
         src=this._arg2obj(arguments,["src","width","height","action","id","tooltip","className","disableImage"]);

      if (src.action) this.setSecondAction(src.action);
      this.id=src.id||0;
      this.className=src.className||"defaultButton";
      this.src=src.src;   this.disableImage=src.disableImage;
      this.tooltip=src.tooltip||"";

      td=document.createElement(src._td||"TD"); this.topNod=td;
      td.style.height=src.height;
         td.style.width=src.width; td.align="center"; td.vAlign="middle";
      td.innerHTML="<img src='"+this.src+"' border='0' title='"+this.tooltip+"' style='padding-left:2px; padding-right:2px;'>";
      td.className=this.className;
       td.objectNode=this;
      if (src.mouseover)
         { this._mvImage=src.mouseover; this._mnImage=src.src; }

       this.imageTag=td.childNodes[0];
       this.enable();
      };

   
   dhtmlXImageButtonObject.prototype = new dhtmlXButtonPrototypeObject;


   
/*------------------------------------------------------------------------------
                        VDivider object
--------------------------------------------------------------------------------*/
      /**  
          *     @desc: vertical divider object
          *     @param: id - identificator
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXDividerYObject(id){
      if (typeof(id)=="object") id=id.id;
      if (id) this.id=id;   else this.id=0;
      td=document.createElement(id._td||"td");
      this.topNod=td; td.align="center"; td.style.paddingRight="2"; td.style.paddingLeft="2";
      td.innerHTML="<div class='toolbarDividerY'>&nbsp;</div>";
            if (!document.all) td.childNodes[0].style.height="0px";
      return this;
   };
   dhtmlXDividerYObject.prototype = new dhtmlXButtonPrototypeObject;
   dhtmlXToolbarDividerYObject=dhtmlXDividerYObject;
   
/*------------------------------------------------------------------------------
                        End of vDivider object
--------------------------------------------------------------------------------*/   

/*------------------------------------------------------------------------------
                        HDivider object
--------------------------------------------------------------------------------*/
      /**
          *     @desc: horisontal divider object
          *     @param: id - identificator
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXDividerXObject(id){
      if (typeof(id)=="object") id=id.id;
      if (id) this.id=id;   else this.id=0;
      td=document.createElement(id._td||"td");
      this.topNod=td; td.align="center"; td.style.paddingRight="2"; td.style.paddingLeft="2"; td.width="4px";
      td.innerHTML="<div class='toolbarDivider'></div   >";
      if (!document.all) {  td.childNodes[0].style.width="0px";  td.style.padding="0 0 0 0"; td.style.margin="0 0 0 0";   }
      return this;
   };
   dhtmlXDividerXObject.prototype = new dhtmlXButtonPrototypeObject;
   dhtmlXToolbarDividerXObject=dhtmlXDividerXObject;

/*------------------------------------------------------------------------------
                        End of hDivider object
--------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------
                  Image button with text object
--------------------------------------------------------------------------------*/
      /**
          *     @desc: image button with text object
          *     @param: src - image href
          *     @param: content - button text
          *     @param: width - object width
          *     @param: height - object height
          *     @param: action - default action
          *     @param: id - identificator
          *     @param: tooltip - image tooltip
          *     @param: className - css class for button (button use 3 css classes - [className],[className]Over,[className]Down)
          *     @param: textClassName - css class for text
          *     @param: disableImage - alter image for disable mode [optional]
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXImageTextButtonObject(src,content,width,height,action,id,tooltip,className,textClassName,disableImage){
      if (typeof(src)!="object")
         src=this._arg2obj(arguments,["src","content","width","height","action","id","tooltip","className","textClassName","disableImage"]);

      if (src.action) this.setSecondAction(src.action);
      this.src=src.src;   this.disableImage=src.disableImage;
      this.tooltip=src.tooltip||"";      this.id=src.id||0;

        this.className=src.className||"defaultButton";
      td=document.createElement(src._td||"td");   this.topNod=td;
      td.style.height=src.height; td.style.width=src.width; td.align="center";
      td.noWrap=true;
      if (!src.textmode){
         this.textClassName=src.textClassName||"defaultButtonText";
         td.innerHTML="<table title='"+this.tooltip+"' width='100%' height='100%' cellpadding='0' cellspacing='0'><tr><td valign='center' align='center' valign='middle'  style='padding-left:4px; padding-right:4px;'><img src='"+this.src+"' border='0'></td><td width='100%' style='padding-left:5px' align='left' valign='center'  class='"+this.textClassName+"'>"+src.content+"</td></tr></table>";
         this.textTag=td.childNodes[0].rows[0].cells[1];
         }
      else {
         this.textClassName=src.textClassName||"defaultButtonTextBottom";
         td.innerHTML="<table title='"+this.tooltip+"' width='100%' height='100%' cellpadding='0' cellspacing='0'><tr><td align='center' valign='middle'><img src='"+this.src+"' border='0'  style='padding-left:2px; padding-right:2px;'></td></tr><tr><td width='100%' align='center' class='"+this.textClassName+"'>"+src.content+"</td></tr></table>";
         this.textTag=td.childNodes[0].rows[1].cells[0];
      }
      td.className=this.className;
      td.objectNode=this;
      this.imageTag=td.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
      this.enable();
      if (src.mouseover)
         { this._mvImage=src.mouseover; this._mnImage=src.src; }

      return this;
   };

   dhtmlXImageTextButtonObject.prototype = new dhtmlXButtonPrototypeObject;
      /**
          *     @desc: set button text
        *      @param: newText - new text [ HTML allowed ]
          *     @type: public
          *     @topic: 4
          */
   dhtmlXImageTextButtonObject.prototype.setText = function(newText){
         this.textTag.innerHTML=newText;
      };

/*------------------------------------------------------------------------------
                        End of Image button with text object
--------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------
                  Image button with text object - XP style
--------------------------------------------------------------------------------*/
      /**
          *     @desc: image button with text object
          *     @param: src - image href
          *     @param: content - button text
          *     @param: width - object width
          *     @param: height - object height
          *     @param: action - default action
          *     @param: id - identificator
          *     @param: tooltip - image tooltip
          *     @param: className - css class for button (button use 3 css classes - [className],[className]Over,[className]Down)
          *     @param: textClassName - css class for text
          *     @param: disableImage - alter image for disable mode [optional]
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXImageTextButtonXPObject(src,content,width,height,action,id,tooltip,className,textClassName,disableImage){
      if (typeof(src)!="object")
         src=this._arg2obj(arguments,["src","content","width","height","action","id","tooltip","className","textClassName","disableImage"]);

      src.textmode="bottom";
      return (new dhtmlXImageTextButtonObject(src));
   };
   dhtmlXImageTextButtonXPObject.prototype = new dhtmlXButtonPrototypeObject;

/*------------------------------------------------------------------------------
                        End of Image button with text object
--------------------------------------------------------------------------------*/



/*------------------------------------------------------------------------------
                        Dropdown object
--------------------------------------------------------------------------------*/
      /**  
          *     @desc: dropdown object
          *     @param: id - identificator 
          *     @param: valueList - list of values
          *     @param: displayList - list of display values
          *     @param: action - default action
          *     @param: width - object width
          *     @param: height - object height
          *     @param: className - css class
          *     @type: public
          *     @topic: 0
          */
   function dhtmlXSelectButtonObject(id,valueList,displayList,action,width,height,className)
      {
      if (typeof(id)!="object")
         id=this._arg2obj(arguments,["id","valueList","displayList","action","width","height","className"]);

      if (id.action) this.setSecondAction(id.action);
      this.id=id.id;
      td=document.createElement(id._td||"td");
      this.topNod=td;  td.align="center"; td.style.width=id.width;

      var sel=document.createElement("select");
      this.selElement=sel; sel.onchange=this._onclickX; sel.objectNode=this;

      if (id.className) sel.className=id.className;
      if (id.width)  sel.style.width="100%";

      if (typeof(valueList)=="string"){
         var temp1=valueList.split(",");
         if (displayList)   var temp2=displayList.split(",");
         else   var temp2=valueList.split(",");
         for (var i=0; i<temp1.length; i++)
         {
            sel.options[sel.options.length]=new Option(temp2[i],temp1[i]);
         }
      }
      else
         if (id.option)
            for (var i=0; i<id.option.length; i++)
            {
               sel.options[sel.options.length]=new Option(id.option[i].content,id.option[i].value);
            }

      td.appendChild(sel);
      td.className="toolbarNormalButton";
      td.objectNode=this;
      return this;
   };


      dhtmlXSelectButtonObject.prototype = new dhtmlXButtonPrototypeObject;
      
      /**
      *   @desc: clears options from selectbox
      *   @type: public
      *   @topic: 4
      */
      dhtmlXSelectButtonObject.prototype.clearOptions=function(){
         var cnt = this.selElement.options.length;
         for(var i=0;i<cnt;i++){
            this.selElement.removeChild(this.selElement.options[0]);
         }
      };
      /**
          *     @desc: disable object
          *     @type: public
          *     @topic: 4  
          */      
      dhtmlXSelectButtonObject.prototype.disable=function(){
         this.selElement.disabled=true;
      };
      
      /**
          *     @desc: enable object
          *     @type: public
          *     @topic: 4
          */      
      dhtmlXSelectButtonObject.prototype.enable=function(){
         this.selElement.disabled=false;
      };
      

      /**
          *     @desc: inner onSelect handler
          *     @type: private
          *     @topic: 3
          */
      dhtmlXSelectButtonObject.prototype._onclickX=function(){
         if ((!this.objectNode.persAction)||(this.objectNode.persAction(this.objectNode.selElement.value)))
            if (this.objectNode.action) { this.objectNode.action(this.objectNode.id,this.objectNode.selElement.value); }
      };

      /**  
          *     @desc: add option to dropdown
        *      @param: value - string value (sended to action function)
        *      @param: display - displayed string
          *     @type: public
          *     @topic: 6  
          */               
      dhtmlXSelectButtonObject.prototype.addOption=function(value,display){
         this.selElement.options[this.selElement.options.length]=new Option(display,value);
      };
      /**  
          *     @desc: remove string from dropdown
        *      @param: value - string value 
          *     @type: public
          *     @topic: 6  
          */         
      dhtmlXSelectButtonObject.prototype.removeOption=function(value){
         var z=this.getIndexByValue(value);
         if (z>=0) this.selElement.removeChild(this.selElement.options[z]);
      };
      /**  
          *     @desc: change string value
        *      @param: oldValue - old string value 
        *      @param: newValue - new string value 
          *     @type: public
          *     @topic: 6
          */               
      dhtmlXSelectButtonObject.prototype.setOptionValue=function(oldValue,newValue){
         var z=this.getIndexByValue(oldValue);
         if (z>=0) this.selElement.options[z].value=newValue;
      };
      /**  
          *     @desc: change option text
        *      @param: value - option value
        *      @param: newText - new option text 
          *     @type: public
          *     @topic: 6  
          */         
      dhtmlXSelectButtonObject.prototype.setOptionText=function(value,newText){
         var z=this.getIndexByValue(value);
         if (z>=0) this.selElement.options[z].text=newText;
      };
      /**  
          *     @desc: select string by value
        *      @param: value - string value 
          *     @type: public
          *     @topic: 6 
          */   
      dhtmlXSelectButtonObject.prototype.setSelected=function(value){
         var z=this.getIndexByValue(value);
         if (z>=0) this.selElement.options[z].selected=true;
      };
      /**  
          *     @desc: return string index in dropdown by value (return -1 if string with given value not found)
        *      @param: value - string value 
          *     @type: public
          *     @topic: 0  
          */         
      dhtmlXSelectButtonObject.prototype.getIndexByValue=function(value){
         for (var i=0; i<this.selElement.options.length; i++)
            {
               if (this.selElement.options[i].value==value)
                  return i;
            };         
         return -1;
      };
   
/*------------------------------------------------------------------------------
                        End of Dropdown object
--------------------------------------------------------------------------------*/

 
      /**  
          *     @desc: two state button
          *     @param: id - identificator         
          *     @param: src - image href       
          *     @param: content - button text
          *     @param: width - object width
          *     @param: height - object height
          *     @param: action - default action        
          *     @param: tooltip - image tooltip
          *     @param: className - css class for button (button use 3 css classes - [className],[className]Over,[className]Down)
          *     @param: textClassName - css class for text
          *     @param: disableImage - alter image for disable mode [optional]
          *     @type: public
          *     @topic: 0  
          */ 
function dhtmlXTwoStateButtonObject(id,src,content,width,height,action,tooltip,className,textClassName,disableImage,pressedState){
      if (typeof(id)!="object")
         id=this._arg2obj(arguments,["id","src","content","width","height","action","tooltip","className","textClassName","disableImage","pressedState"]);

    if (id.action) this.setSecondAction(id.action);
    this.state=0;
    this.className=id.className||"defaultButton";
    this.textClassName=id.textClassName||"defaultButtonText";

    this.disableImage=id.disableImage;
    this.tooltip=id.tooltip||""; this.id=id.id||0;
    if (id.content) this.textP=id.content.split(','); else this.textP=",".split(',');

    if (id.src) this.srcA=id.src.split(','); else this.srcA=",".split(',');
    this.src=this.srcA[0];

    td=document.createElement(id._td||"td");
    this.topNod=td;
    td.style.height=id.height;  td.style.width=id.width; td.align="center"; td.noWrap=true;

    td.innerHTML="<table title='"+this.tooltip+"'  width='100%' height='100%' cellpadding='0' cellspacing='0'><tr><td align='center' valign='middle'><img src='"+this.srcA[0]+"' border='0'  style='padding-left:2px;padding-right:2px;'></td><td width='100%' style='padding-left:5px' align='left' class='"+this.textClassName+"'>"+this.textP[0]+"</td></tr></table>";
    td.className=this.className;
    td.objectNode=this;
    this.imageTag=td.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0];
    this.textTag=td.childNodes[0].childNodes[0].childNodes[0].childNodes[1];

    if (!id.content) this.textTag.style.display="none";
    if (!id.src) this.imageTag.style.display="none";

    this.enable();
    if (convertStringToBoolean(pressedState))
    {
        this.state=1;    this.topNod.className=this.className+"down";
      if (this.textP[1])      this.textTag.innerHTML=this.textP[1];
      if (this.srcA[1])      this.imageTag.src=this.srcA[1];
    }
 return this;
};

dhtmlXTwoStateButtonObject.prototype = new dhtmlXButtonPrototypeObject;

/**
          *     @desc: onclick
        *      @param: e - event
        *      @param: that - button object
          *     @type: private
          *     @topic: 3
          */
dhtmlXTwoStateButtonObject.prototype._onclickX = function(e,that){
 if(!that) that=this.objectNode;
 if(that.topNod.dstatus) return;
    if (that.state==0) { that.state=1;    this.className=that.className+"down"; }
   else  { that.state=0;     this.className=that.className; } 
   
   if (that.textP[that.state])      that.textTag.innerHTML=that.textP[that.state];
   if (that.srcA[that.state])      that.imageTag.src=that.srcA[that.state];

   
 if((!that.persAction)||(that.persAction()))
 if(that.action){that.action(that.id,that.state);}

};
/**  
          *     @desc: mouseout
          *     @type: private
          *     @topic: 3 
          */   
 dhtmlXTwoStateButtonObject.prototype._onmouseoutX=function(e){
};
 /**  
          *     @desc: mouseover
          *     @type: private
          *     @topic: 3  
          */   
 dhtmlXTwoStateButtonObject.prototype._onmouseoverX=function(e){
};
/**  
          *     @desc: get button state
          *     @type: public
          *     @topic: 4
          */
 dhtmlXTwoStateButtonObject.prototype.getState=function(){
    return this.state;
};
/**  
          *     @desc: set button state
        *      @param: state - new state (1 or 0)
          *     @type: public
          *     @topic: 4 
          */   
dhtmlXTwoStateButtonObject.prototype.setState=function(state){
    this.state=state;
    if (state==0) this.topNod.className=this.className;
   else this.topNod.className=this.className+"down"; 

   if (this.textP[this.state])      this.textTag.innerHTML=this.textP[this.state];
   if (this.srcA[this.state])      this.imageTag.src=this.srcA[this.state];
};



/**
          *     @desc: SliderButton object
        *   @param: size - (integer) size of slider
        *   @param: skin - (string|object) skin name
        *   @param: vMode - (boolean) flag of vertical orientation
        *   @param: step - (int) step of measurement
        *   @param: limit - (int) maximum value
        *   @param: init_pos - (int) initial value
         *   @param: shift - (int) slider value shift
          *     @param: className - css class for button
          *     @type: public
          *     @topic: 0
          */
function dhtmlXSliderButtonObject(id,size,skin,vertical,step,limit,init_pos,shift,className){
      if (typeof(id)!="object")
         var conf=this._arg2obj(arguments,["id","size","skin","vertical","limit","init_pos","shift","className"]);
      else var conf=id;

      var td=document.createElement(conf._td||"TD");
      td.style[(conf.vertical)?"height":"width"]=conf.size+"px";
      var z=new dhtmlxSlider(td,conf);

      this.slider=z; this.id=conf.id;
      this.topNod=td;
        td.className=conf.className||"defaultButton";


      td.objectNode=this;
      z.setOnChangeHandler(function(){
           td.objectNode._onclickX.apply(td);
      });
      return this;
}
dhtmlXSliderButtonObject.prototype = new dhtmlXButtonPrototypeObject;

/**
*     @desc: inner onSelect handler
*     @type: private
*     @topic: 3
*/
dhtmlXSliderButtonObject.prototype._onclickX=function(){
   if ((!this.objectNode.persAction)||(this.objectNode.persAction(this.objectNode.getValue())))
      if (this.objectNode.action) { this.objectNode.action(this.objectNode.id,this.objectNode.getValue()); }
};

/**
*   @desc: set value of slider control
*   @type: public
*   @topic: 1
*/
dhtmlXSliderButtonObject.prototype.getValue = function(){
   return this.slider.getValue();
}

/**
*   @desc: set value of slider control
*   @param: val - (integer) new value
*   @type: public
*   @topic: 1
*/
dhtmlXSliderButtonObject.prototype.setValue = function(val){
   return this.slider.setValue(val);
}


function dhtmlXLabelButtonObject(width,content,className){
      if (typeof(width)!="object")
         var conf=this._arg2obj(arguments,["width","content","className"]);
      else var conf=width;

      var td=document.createElement(conf._td||"TD");
      td.style.width=parseInt(conf.width)+"px";
      td.innerHTML=conf.content;
      this.topNod=td;
        td.className=conf.className||"defaultButton";
      return this;
}
dhtmlXLabelButtonObject.prototype = new dhtmlXButtonPrototypeObject;
//(c)dhtmlx ltd. www.dhtmlx.com