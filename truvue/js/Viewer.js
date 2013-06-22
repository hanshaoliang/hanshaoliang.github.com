
/**
 *@private
 */
 
SKta._viewerId = 0;

/**
 * Creates and manages viewer as a child of given specified
 * DOM object.
 *
 * @class SKta.Viewer
 * @constructor
 * @param {Object} viewer <ul>
 *  <li>container {String} or {Object}. The DOM element ID of the viewer's container. <b>required</b></li>
 *  <li>height {Number} pixels. <i>Default: heighof container</i>.</li>
 *  <li>width {Number} pixels. <i>Default: width of container</i>.</li>
 *  <li>ui {SKta.Viewer.CustomUI}. UI customizations defined via the SKta.Viewer.CustomUI class. <i>Default: null</i>
 *  </ul>
 * @param {Object} view <ul>
 *   <li>panorama.poiId {Number} - The numeric ID of the POI to load initially in the viewer.</li>
 *   <li>panorama.tourId {Number} - The numeric ID of the tour to load initially in the viewer.</li>
 *   </ul>
 */
SKta.Viewer = function (viewer, view) {

    if (!Exists(viewer) || !Exists(viewer.container)) {
        throw new SKta.Error.InvalidArgumentError("SKta.Viewer() requires viewer.container.");
    }

    if (!Exists(view) || !Exists(view.panorama)) {
        throw new SKta.Error.InvalidArgumentError("SKta.Viewer() requires view.panorama");
    }

    var _defaultHeight = "100%";
    var _defaultWidth = "100%";
	
    if (!Exists(viewer.height)) {
        viewer.height = _defaultHeight;
    }
    if (!Exists(viewer.width)) {
        viewer.width = _defaultWidth;
    }
	
	var _viewerContainerElement = ((typeof (viewer.container)) === "string") ?document.getElementById(viewer.container) : viewer.container;
	//cast js object to jQuery object;
	var $n = $(_viewerContainerElement);
		
    var _id = SKta._viewerId;
	var _isLoaded = false;
    SKta._viewerId++;
	var _usePreloader = true;

    this.getId = function () {return _id;}
    this.getTourId = function () {return _tourId;}
	// this.isLoaded = function(){return _isLoaded;}
	// this.setLoaded = function(){_isLoaded = true;}
	
	var mainContainerElementId = ($n.attr("id") || "") + "_sktaMainContainer" + _id;
	$n.append("<div id=\"" + mainContainerElementId + "\"></div>");
	var $m = $(document.getElementById(mainContainerElementId));
	$m.css("position", "relative").css("width", "100%").css("height", "100%");
	
	//preloader 
	var preloaderContainerId = ($n.attr("id") || "") + "_sktaPreloaderContainer" + _id;
	var addPreloader = function(){
		$m.append("<div id=\"" + preloaderContainerId + "\" style=\"height:0px;\"/>");
		var $pre = $(document.getElementById(preloaderContainerId));
		$pre.css("width", "100%").css("height", "100%").addClass( "SKtaDefaultPreloader" );
		var $preContentContainer = $(document.createElement('div'));
		$preContentContainer.addClass( 'SKtaDefaultPreloaderMessageContainer' );
		$pre.append($preContentContainer);
		if (Exists(viewer.type) && viewer.type !== SKta.Viewer.Type.COMPACT)
		{
			var $preContent = $(document.createElement('div'));
			$preContent.addClass( 'SKtaDefaultPreloaderMessage' );	
			$preContentContainer.append($preContent);
		}
		var $preProgress = $(document.createElement('div'));
		$preProgress.append( '<img src=\"' + SKta.apiResourceUrl + 'img/preloaderanim.gif\" alt=\"...\"/>' );
		$preProgress.addClass( 'SKtaDefaultPreloaderProgress' );
		$preContentContainer.append($preProgress);
	}
	
	//viewer wrapper
	var viewerWrapperElementId = ($n.attr("id") || "") + "_sktaViewer" + _id;
	$m.append("<div id=\"" + viewerWrapperElementId + "\"/>");
	var $v = $(document.getElementById(viewerWrapperElementId));
	$v.css("position", "absolute").css("width", "100%").css("height", "100%");
	
	var viewerElementId = ($n.attr("id") || "") + "_sktaViewerElement" + _id;
	var viewerObjectId = ($n.attr("id") || "") + "_sktaViewerObject" + _id;
	$v.append("<div id=\"" + viewerElementId + "\"/>");
	
	var wmode = "transparent";
	
	var _flashVars = $.extend({},{
		viewerId: _id,
		securityKey: SKta.key
	});
	
	// if(_usePreloader){
	// 		addPreloader();
	// 	}
	
	var _poiId;
	var _tourId = -1;
	var _panoramaId;
	
	if(Exists(view.panorama.poiId)){
		_poiId = view.panorama.poiId;
	}

	if(Exists(view.panorama.tourId)){
		_tourId = view.panorama.tourId;
	}

	
    var krpanoViewer = null;
    SKta.Poi.getPoiById(view.panorama.poiId, function (result) {
        //success if error code == 0;
        if (result.status.errorCode === 0) {
            var data = result.data;
            var xmlUrl = data.xmlUrl;
            var swfUrl = data.swfUrl;
				
			if(swfUrl === "null"){
				throw new SKta.Error.InvalidArgumentError("could not found swf file with POI " + view.panorama.poiId); 
			}
				
			if(xmlUrl === "null"){
				throw new SKta.Error.InvalidArgumentError("could not found xml file with POI " + view.panorama.poiId); 
			}
                
			if(_tourId == -1){
				_tourId = data.defaultTourId;
			}

			var realXMLUrl = xmlUrl+"/tour/tour_" + _tourId + ".xml";
            // if (device === "iphone") {
            //                    krpanoViewer = createkrpanoJSviewer(viewerObjectId, null, null, null, false);
            //                    krpanoViewer.addVariable("simulatedevice", device);
            //                } else {
			
			if(xmlUrl === "deactivate"){
				alert("the poi with id: "+view.panorama.poiId+" is deactivate ,so it can not be accessed ,please ask owner to activate it .");
			}
			else{
				krpanoViewer = createPanoViewer({swf:swfUrl, id:viewerObjectId,
	                	width:viewer.width,height:viewer.height,html5:"auto", html5licenseload:true});
	            
	            krpanoViewer.addVariable("xml", realXMLUrl);
				krpanoViewer.embed(viewerElementId);
			}
			//buildToolbar();
        }
        else{
        	alert("server error , please try again later.");
        }
    });
	
	function processCustomUIParameters(ui){
		// if(Exists(ui.clickAndDragMessage)){
		// 			_flashVars.clickDragMessage = ui.clickAndDragMessage;
		// 		}
		// 		if(Exists(ui.cursors) && Exists(ui.cursors.length) && Exists(ui.cursors.length > 0)){
		// 			processCursorsCustomUIParameters(ui.cursors);
		// 		}
		// 		if(Exists(ui.icons) && Exists(ui.icons.length) && Exists(ui.icons.length > 0)){
		// 			processIconsCustomUIParameters(ui.icons);
		// 		}
		// 		if(Exists(ui.tooltips) && Exists(ui.tooltips.length) && Exists(ui.tooltips.length > 0)){
		// 			processTooltipsCustomUIParameters(ui.tooltips);
		// 		}
		// if(Exists(ui.toolbar)){
			// processToolbarCustomUIParameters(ui.toolbar);
		// }
		// 		if(Exists(ui.usePreloader)){
		// 			_usePreloader = ui.usePreloader;
		// 		}
	};
	
	function buildToolbar(){
		if( krpanoViewer != null){
			
			/**
			*buildtoolbar(param1,param2,param3); 
			*param1:the toolbar height , 
			*param2: the color of the toolbar 
			*param3: the  transparency of toolbar. 
			*default value is buildtoolbar(40,0x000000,0.6).
			**/
			krpanoViewer.call("buildtoolbar(40,0x000000,0.6);")
			
			/**
			*buildzoominout(p1,p2,p3,p4); 
			*p1:{int} the position of zoomin icon the pixel value of toolbar count from the toolbar's right side
			*p2: the picture url of zoomin icon; 
			*p3:{int} the position of zoomout icon the pixel value of toolbar count from the toolbar's right side
			*p4:{String} the picture url of zoomout icon.
			*default value is buildzoominout(100,null,60,null);
			**/		
			krpanoViewer.call("buildzoominout(100,null,60,null);");
			
			/**
			*buildfullscreen(p1); 
			*p1:{int} the position of fullscreen icon the pixel value of toolbar count from the toolbar's right side
			*default:buildfullscreen(10);
			**/ 
			krpanoViewer.call("buildfullscreen(10,null);");
			
			/**
			*buildimagemap(320,230); 
			*p1:the width of the large map (not the icon ,but the width of map when click on it)
			*p2: the height of the large map
			**/
			krpanoViewer.call("buildimagemap(320,230,'%SWFPATH%/template_resources/map.jpg');");
			krpanoViewer.call("removecurplugins();");
			krpanoViewer.call("scenemapheading();");
			
			/**
			*buildpanohotdropoffs(200,10,5); 
			*p1:(int) the position of first dropoff icon ,the pixel value of toolbar count from the toolbar's left side 
			*p2:the max num of dropoff to display
			*p3:the interval between dropoffs 
			**/
			krpanoViewer.call("buildpanohotdropoffs(200,5,5);");
		}
	}
	
	function processCursorsCustomUIParameters(cursors){
		var cursorArray = new Array();
		for(var i = 0; i < cursors.length; i++){
			var cursor = cursors[i].cursor;
			var cursorUrl = cursor[i].cursorUrl;
			if(!Exists(cursor) || !Exists(cursorUrl)){
				throw new SKta.Error.InvalidArgumentError("SKta.Viewer() invalid cursor");
			}
			cursorArray.push(cursor + ":" + escape(cursorUrl));
		}
		_flashVars.customCursors = cursorArray;
	}
	
	function processIconsCustomUIParameters(icons){
		var iconStr = "";
		var iconUrlStr = "";
		for(var i = 0; i < icons.length; i++){
			var icon = icons[i].icon;
			var iconUrl = icons[i].url;
			var iconCenter = icons[i].center;
			if(!Exists(icon.name) || !Exists(icon.state) || !Exists(iconCenter)){
				throw new SKta.Error.InvalidArgumentError("SKta.Viewer() invalid icon");
			}
			if(!Exists(iconCenter) || !Exists(iconCenter.x) || !Exists(iconCenter.y)){
				iconCenter = {x:0,y:0};
			}
			if(iconStr !== ""){
				iconStr += ",";
				iconUrlStr += ",";
			}
			iconStr += icon.name + ":" + icon.state + ":" + iconCenter.x + ":" + iconCenter.y;
			iconUrlStr += escape(iconUrl);
		}
		_flashVars.customIcons = iconStr;
		_flashVars.customIconUrls = iconUrlStr; 
	}
	
	function processTooltipsCustomUIParameters(tooltips){
		var customTooltipsStr = "";
		var customTooltipsTextStr = "";
		for(var i = 0; i < tooltips.length; i++){
			var tooltip = tooltips[i].tooltip;
			var tooltipText = tooltips[i].tooltipText;
			if(!Exists(tooltip) || !Exists(tooltip.target) || !Exists(tooltip.tooltipName) ){
				throw new SKta.Error.InvalidArgumentError("SKta.Viewer() invalid tooltip.");
			}
			if (customTooltipsStr !== "")
			{
				customTooltipsStr += ",";
				customTooltipsTextStr += ",";
			}
			customTooltipsStr += tooltip.target + ":" + tooltip.tooltipName;
			customTooltipsTextStr += tooltipText;
		}
		_flashVars.customTooltips = customTooltipsStr;
		_flashVars.customTooltipsText = customTooltipsTextStr;
	}
	
	function processToolbarCustomUIParameters(tb){
		// var tparams = [null, true, Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN, Number.NaN];
		if( krpanoViewer != null){
			
			/**
			*buildtoolbar(param1,param2,param3); 
			*param1:the toolbar height , 
			*param2: the color of the toolbar 
			*param3: the  transparency of toolbar. 
			*default value is buildtoolbar(40,0x000000,0.6).
			**/
			krpanoViewer.call("buildtoolbar(40,0x000000,0.6);")
			
			/**
			*buildzoominout(p1,p2,p3,p4); 
			*p1:{int} the position of zoomin icon the pixel value of toolbar count from the toolbar's right side
			*p2: the picture url of zoomin icon; 
			*p3:{int} the position of zoomout icon the pixel value of toolbar count from the toolbar's right side
			*p4:{String} the picture url of zoomout icon.
			*default value is buildzoominout(100,null,60,null);
			**/		
			krpanoViewer.call("buildzoominout(100,null,60,null);");
			
			/**
			*buildfullscreen(p1); 
			*p1:{int} the position of fullscreen icon the pixel value of toolbar count from the toolbar's right side
			*default:buildfullscreen(10);
			**/ 
			krpanoViewer.call("buildfullscreen(10,null);");
			
			/**
			*buildimagemap(320,230); 
			*p1:the width of the large map (not the icon ,but the width of map when click on it)
			*p2: the height of the large map
			**/
			krpanoViewer.call("buildimagemap(320,230,'%SWFPATH%/template_resources/map.jpg');");
			krpanoViewer.call("removecurplugins();");
			krpanoViewer.call("scenemapheading();");
			
			/**
			*buildpanohotdropoffs(200,10,5); 
			*p1:(int) the position of first dropoff icon ,the pixel value of toolbar count from the toolbar's left side 
			*p2:the max num of dropoff to display
			*p3:the interval between dropoffs 
			**/
			krpanoViewer.call("buildpanohotdropoffs(200,5,5);");
		}
		// if(Exists(tb.visibility)){
		// 			tparams[0] = tb.visibility;
		// 		}
		// 		if(Exists(tb.buttonExclusions) && tb.buttonExclusions === SKta.Viewer.ToolbarButton.AUTODRIVE){
		// 			tparams[1] = false;
		// 		}
		// 		if(Exists(tb.buttonSpacing)){
		// 			tparams[2] = tb.buttonSpacing;
		// 		}
		// 		if(Exists(tb.borderColor)){
		// 			tparams[3] = tb.borderColor;
		// 		}
		// 		if(Exists(tb.borderAlpha)){
		// 			tparams[4] = tb.borderAlpha;
		// 		}
		// 		if(Exists(tb.backgroundColor)){
		// 			tparams[5] = tb.backgroundColor;
		// 		}
		// 		if(Exists(tb.backgroundAlpha)){
		// 			tparams[6] = tb.backgroundAlpha;
		// 		}
		// 		if(Exists(tb.backgroundGradientColor0)){
		// 			tparams[7] = tb.backgroundGradientColor0
		// 		}
		// 		if(Exists(tb.backgroundGradientColor1)){
		// 			tparams[8] = tb.backgroundGradientColor1;
		// 		}
		// 		_flashVars.toolbarUI = tparams;
	}
	
	this.getViewerElement = function(){
		return document.getElementById(viewerObjectId);
	}
	this.getPreloaderElement = function(){
		return document.getElementById(preloaderContainerId);
	}
	
	return this;
};

SKta.Viewer.prototype = function(){
	var dynamicHotspotArray = new Array();
	/*
	*private method
	*/
	function checkViewerElement(viewer){
		var _viewer = viewer.getViewerElement();
		if(!_viewer){
			throw new SKta.Error.InvalidCallError("Viewer is not loaded");
		}
		return _viewer;
	}
	
	/**
	*private method
	*/
	function _bind(krpanoObject,evtType,evtTarget,cb){
		switch(evtTarget.type){
			case "hotspot":
				switch(evtType){
					case "onclick":
						krpanoObject.set("hotspot[hotspot_"+ evtTarget.id +"].onover","");
						krpanoObject.set("hotspot[hotspot_"+ evtTarget.id + "].onclick","js("+ cb +")");
						break;
					case "onhover":
						krpanoObject.set("hotspot[hotspot_"+ evtTarget.id +"].onhover","js(" + cb +")");
						break;
					case "onout":
						krpanoObject.set("hotspot[hotspot_"+ evtTarget.id +"].onout","js(" + cb +")");
						break;
					case "onover":
						krpanoObject.set("hotspot[hotspot_"+ evtTarget.id +"].onover","js(" + cb +")");
						break;
					default:
						break;
				}
			case "dynamichotspot":
				switch(evtType){
					case "onclick":
						krpanoObject.set("hotspot["+ evtTarget.id + "].onclick","js("+ cb +")");
						break;
					case "onhover":
						krpanoObject.set("hotspot["+ evtTarget.id +"].onhover","js(" + cb +")");
						break;
					case "onout":
						krpanoObject.set("hotspot["+ evtTarget.id +"].onout","js(" + cb +")");
						break;
					case "onover":
						krpanoObject.set("hotspot["+ evtTarget.id +"].onover","js(" + cb +")");
						break;
					default:
						break;
				}
			default:
				break;
		}
	}
	
	function generateDynamicHotspotNames(krpanoObject){
		krpanoObject.call("set(dnum,get(hotspot.count)); for(set(temdnum,0) , temdnum LT dnum , inc(temdnum), " +
				"set(temname,get(hotspot[get(temdnum)].name));set(temanno,get(hotspot[get(temdnum)].annotation)); "+
				"subtxt(temname1,get(temname),0,7); if(temname1 == 'dynamic' ," +
				"js(SKta.Application.recivenameid(get(temname),get(temanno)));););");
	}
	
	function recivenameid(dynamicHotspotId,annotatiion){
		dynamicHotspotArray.push({id:dynamicHotspotId,annotation:annotatiion});
	}
	
	return {
		
		/**
		 * disable preloader
		 */
		disablePreloader : function(){
			var preloaderElement = getPreloaderElement();
			if (preloaderElement && $(preloaderElement).css("display") !== "none")
			{
				$(preloaderElement).fadeOut(500);
			}
		},
		
		/**
		 * Get all dynamic hotspot id array
		 * @return an array of dynamic hotspot id
		 */
		getDynamicHotspotIds:function(){
			var ve = checkViewerElement(this);
			generateDynamicHotspotNames(ve);
			return dynamicHotspotArray;
		},
		
		/**
		 * Load a panorama in the viewer for a point of interest.
		 * @deprecated
		 */
		loadPanoramaForPoi:function(poiId){
			if(!Exists(poiId)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument poiId to SKta.Viewer.loadPanoramaForPoi().");
			}
			
			var ve = checkViewerElement(this);
			
		    try {
		        SKta.Poi.getPoiById(poiId, function (result) {
		            //success if error code = 0;
		            if (result.status.errorCode === 0) {
		                var data = result.data;
		                var xmlUrl = data.xmlUrl;
		                var swfUrl = data.swfUrl;
						var defaultTourId = data.defaultTourId;
						var realXMLUrl = xmlUrl+"/tour/tour_" + defaultTourId + ".xml";
						if(xmlUrl == "deactivate"){
							alert("the poi with id: "+poiId+" is deactivate ,so it can not be accessed ,please ask owner to activate it .");
						}
						else{
							ve.call("loadpano(" + realXMLUrl + ", null, MERGE, BLEND(1));");
						}
		            } else if (result.status.errorCode === 500) {
		                alert(result.status.errorMessage);
		            }
		        });
		    } catch (e) {
		        alert(e.message);
		    }	
		},
		
		/**
		 * To get the Screen position of hotspot. 
		 * @param {String} hotspotId hotspot id
		 * @returns {x,y}
		 * @type Object
		 */
		getHotspotPosition : function(hotspotId){
			if(!Exists(hotspotId)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument hotspotId to SKta.Viewer.getHotsportPosition().");
			}
			
			var ve = checkViewerElement(this);
			
			ve.call("spheretoscreen(hotspot["+hotspotId+"].ath,hotspot["+hotspotId+"].atv,x,y)"); //NaN if ath and atv are not inside the viewer.

			var point= {x:0,y:0};
			point.x = ve.get("x").toFixed(2);
			point.y = ve.get("y").toFixed(2);
			return point;
		},
		
		/**
		 * Rotate to the center of Screen. 
		 * @param {Number} x
		 * @param {Number} y
		 */
		rotateToCenter:function(x,y){
			if(!Exists(x) && !Exists(y)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument x/y to SKta.Viewer.rotateToCenter().");
			}
			
			var ve = checkViewerElement(this);
			ve.call("screentosphere("+x+","+y+",mouseath,mouseatv)");
			ve.call("lookto("+ x +","+ y +")");
		},
		
		/**
		 * Binds callback to be triggered when evtType occurs on evtTarget
		 * @param {SKta.Viewer.EventType} evtType Type of event to listen for.
		 * @param {SKta.Viewer.Target} evtTarget Viewer attached to this event.
		 * @param {Function} cb Callback to invoke when the event is triggered.
		 */
		bind:function(evtType,evtTarget,callback){
			if(!Exists(evtType)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument evtType to SKta.VIewer.bind().");
			}
			
			if(!Exists(evtTarget)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument target to SKta.VIewer.bind().");
			}
			
			if(!Exists(callback)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument callback to SKta.VIewer.bind().");
			}
			
			var v = checkViewerElement(this);
			_bind(v,evtType,evtTarget,callback);
		}
	}
}();

/**
 * Viewer attached to this event.
 * <ul>
 * <li> SKta.Viewer.EventType.ONCLICK</li>
 * </ul>
 */	
SKta.Viewer.Target = function(){
	this.id;
	this.type;
}

$.extend(SKta.Viewer,{
	
	/**
	 * Type of event
	 * <ul>
	 * <li> SKta.Viewer.EventType.ONCLICK</li>
	 * </ul>
	 */	
	EventType: {
		ONCLICK:"onclick",
		ONHOVER:"onhover",
		ONOUT:"onout",
		ONOVER:"onover"
	},
	
	/**
	 * SKta.Viewer.Target type
	 * <ul>
	 * <li> SKta.Viewer.TargetType.HOTSPOT</li>
	 * <li> SKta.Viewer.TargetType.DYNAMICHOTSPOT</li>
	 * </ul>
	 */
	TargetType: {
		HOTSPOT: "hotspot",
		DYNAMICHOTSPOT: "dynamichotspot"
	},
	
	/**
	 * Toolbar visibility.
	 * <ul>
	 * <li> SKta.Viewer.ToolbarVisibility.ON</li>
	 * <li> SKta.Viewer.ToolbarVisibility.OFF</li>
	 * <li> SKta.Viewer.ToolbarVisibility.HOVER</li>
	 * </ul>
	 */
	ToolbarVisibility: {
		ON: "on",
		OFF: "off",
		HOVER: "hover"
	},
	
	/**
	 * Finder visibility within the toolbar.
	 * <ul>
	 * <li> SKta.Viewer.FinderVisibility.ON</li>
	 * <li> SKta.Viewer.FinderVisibility.OFF</li>
	 * </ul>
	 */
	FinderVisibility: {
		ON: "on",
		OFF: "off"
	},
	
	/**
	 * Buttons in the toolbar.
	 * <ul>
	 * <li> SKta.Viewer.ToolbarButton.AUTODRIVE</li>
	 * </ul>
	 */
	ToolbarButton: {
		AUTODRIVE: "autodrive"
	},
	
	/**
	 * Cursor types.
	 * <ul>
	 * <li> SKta.Viewer.Cursor.Panorama.Pan</li>
	 * </ul>
	 */
	Cursor: {
		Panorama: {
			Pan: "panorama.pan"
		}
	}
});

