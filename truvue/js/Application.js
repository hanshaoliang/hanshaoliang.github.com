/**
 * Single instance 
 * @namespace SKta.Application
 * @name SKta.Application
 * @constructor
 * @requires SKta
 */
SKta.Application = function () {

    return {
		
		/**
		 * Creates and returns a new viewer instance.
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
        createViewer:function (viewer, view) {
            var v = new SKta.Viewer(viewer, view);
			var tourId = v.getTourId();
			viewerarray.push({id:tourId,viewer:v});
            return v;
        },

		/**
		 * Binds callback to be triggered when evtType occurs on evtTarget
		 * @param {SKta.Viewer} the viewer.
		 * @param {SKta.Viewer.EventType} evtType Type of event to listen for.
		 * @param {SKta.Viewer.Target} evtTarget Viewer attached to this event.
		 * @param {Function} callback Callback to invoke when the event is triggered.
		 */
        bind:function(viewer,evtType,evtTarget,callback)
		{
			viewer.bind(evtType,evtTarget,callback);
		},
		
		/**
		 * Get all dynamic hotspot id array
		 * @param {SKta.Viewer} 
		 * @return {Object} an array of objects includes dynamic hotspot id and annotation
		 */
		getDynamicHotspotIds:function(viewer){
			return viewer.getDynamicHotspotIds();
		}, 
		
		/**
		 * Make a call to the production server.
		 * @private
		 * </ul>
		 * @param {Object} args <ul>
		 *   <li>args.type {String} - Http request method. (get or post)</li>
		 *   <li>args.url {String} - request url.</li>
		 *   <li>args.data {Object} - query parameters.</li>
		 *   <li>args.successCallback {Function} - success callback function.</li>
		 *   <li>args.errorCallback {Function} - error callback function.</li>
		 *  </ul>
		 */
        makeServiceRequest:function (args) {
            if (!Exists(args)) {
                throw new SKta.Error.InvalidArgumentError("makeServiceRequest: Invalid argument.");
            }

            var type = args.type;
            var url = args.url;
            var data = args.data;
			
           $.ajax({
               type:type,
               timeout:20000,
               cache:false,
               async:false,
               url:url,
               dataType:"jsonp",
               data:data,

               success:function (result) {
                   if (args.successCallback !== undefined) {
                       var responseObj = eval(result[0]);
                       args.successCallback(responseObj);
                   }
               },
               error:function (result) {
                   if (args.errorCallback !== undefined) {
                       var resultObj = eval(result[0]);
                       args.errorCallback(resultObj);
                   }
               }
           });
		}
    };
}();


/**
 * Embed an SKta viewer in the webpage.
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
// the v is a skta.application global variable for viewer
var v=null;
//the dnamearray is a array for dynamic hotspot return
var dnamearray=new Array();
var viewerarray=new Array();

SKta.Application.installViewer = function (viewer, view) {

    if (!Exists(viewer)) {
        viewer = {};
    }
    if (!Exists(view)) {
        view = {};
    }

    v = SKta.Application.createViewer(viewer, view);

    return v;
};

SKta.Application.recivenameid = function (dynamicHotspotId,annotatiion) {
	dnamearray.push({id:dynamicHotspotId,annotation:annotatiion});
};

SKta.Application.userdefineinterfacefunc = function ()
{
	//only support firefox i do not know why google is not right
	//??????1?????û???????ô??????????????poi
	//2.???????????????????????poi
	//3.?????????????????????????? arg1:tourid,arg2:???????
	//????û??????????????install???krpano,??ô?????????????????view??tourid,????????????????toolbar
	//????????????????tourid???????????,tourid ??????????
	//controller????û?????????????????,???????????????????????û?????????install???pano,???install???????bug.
	//bug ??????????????????????tourid ????????? ????????????????????
	
	//alert(viewerarray.length);
	var krpano=null;
	for(var i=0;i<viewerarray.length;i++){
		if(arguments.length==2){
			alert(viewerarray[i].viewer.getTourId());
			if(viewerarray[i].id == arguments[0]){
				krpano=viewerarray[i].viewer.getViewerElement();
				//alert(krpano);
				//if user not define the ui settings  we use this for default
				if(krpano !=null){
					krpano.call("buildtoolbar(40,0x000000,0.6);"); //there can set the val toolbar height and alpha use the value which get above
					krpano.call("buildzoominout(100,null,60,null);");
					krpano.call("buildfullscreen(10,null);"); //http://192.168.0.103:8080/viewer0.3/krpano/POI/get.jpg
					if(arguments[1] == "null")
						krpano.call("buildimagemap(320,230,'%SWFPATH%/template_resources/map.jpg');");
					else
						krpano.call("buildimagemap(320,230,"+arguments[1]+");");
					//...  call other define func ...//
					
					//krpano.call("buildautoplay();");
					krpano.call("removecurplugins();");
					krpano.call("scenemapheading();");
					krpano.call("buildpanohotdropoffs(200,5,5);");
	
					//every time i must clean up the dnamearray when i change the scene because every scene have differ dynamic hotspot
					dnamearray=[];
					//generateDynamicNameArray 
					krpano.call("set(dnum,get(hotspot.count)); for(set(temdnum,0) , temdnum LT dnum , inc(temdnum), " +
							"set(temname,get(hotspot[get(temdnum)].name));set(temanno,get(hotspot[get(temdnum)].annotation)); "+
							"subtxt(temname1,get(temname),0,7); if(temname1 == 'dynamic' ," +
							"js(SKta.Application.recivenameid(get(temname),get(temanno)));););");
					//the generateDynamicNameArray is a func of skta.application
					//generateDynamicNameArray();	
					//the mydefinefunction() is a function user defined and the func name must be "mydefinefunction"
					//only this name we can callback , if need any func we can add it here
					//just like user need complete the inherit function
					setTimeout("mydefinefunction()",1000);
				}
			}
		}
		else if(arguments.length==1){
			krpano=viewerarray[i].viewer.getViewerElement();
			
			if(krpano !=null){
				krpano.call("buildtoolbar(40,0x000000,0.6);"); //there can set the val toolbar height and alpha use the value which get above
				krpano.call("buildzoominout(100,null,60,null);");
				krpano.call("buildfullscreen(10,null);"); //http://192.168.0.103:8080/viewer0.3/krpano/POI/get.jpg
				if(arguments.length==1){ //keep the code exist to support the early created poi
					if(arguments[0] == "null")
						krpano.call("buildimagemap(320,230,'%SWFPATH%/template_resources/map.jpg');");
					else
						krpano.call("buildimagemap(320,230,"+arguments[0]+");");
				}
				//...  call other define func ...//
				
				//krpano.call("buildautoplay();");
				krpano.call("removecurplugins();");
				krpano.call("scenemapheading();");
				krpano.call("buildpanohotdropoffs(200,5,5);");

				//every time i must clean up the dnamearray when i change the scene because every scene have differ dynamic hotspot
				dnamearray=[];
				//generateDynamicNameArray 
				krpano.call("set(dnum,get(hotspot.count)); for(set(temdnum,0) , temdnum LT dnum , inc(temdnum), " +
						"set(temname,get(hotspot[get(temdnum)].name));set(temanno,get(hotspot[get(temdnum)].annotation)); "+
						"subtxt(temname1,get(temname),0,7); if(temname1 == 'dynamic' ," +
						"js(SKta.Application.recivenameid(get(temname),get(temanno)));););");
				//the generateDynamicNameArray is a func of skta.application
				//generateDynamicNameArray();	
				//the mydefinefunction() is a function user defined and the func name must be "mydefinefunction"
				//only this name we can callback , if need any func we can add it here
				//just like user need complete the inherit function
				setTimeout("mydefinefunction()",1000);
			}
		}
		else if(arguments.length==0){//
			
		}
	}
};

