/**
 * Single instance to manages Pois
 * @namespace SKta.Poi
 * @name SKta.Poi
 * @constructor
 * @requires SKta
 */
SKta.Poi = function () {

    function _poiSuccessCB(functionName, res, userCB) {
        var status = {errorCode:0, errorMessage:null};
        var data = {swfUrl:null, xmlUrl:null,defaultTourId:null};
        data.swfUrl = res.swfurl;
        data.xmlUrl = res.xmlurl;
		data.defaultTourId = res.defaultTourId;
        userCB({status:status, data:data});
    }

    function _failureCB(functionName, res, userCB) {
        var status = {errorCode:500, errorMessage:functionName + "() internal server error"};
        var data = {swfUrl:null, xmlUrl:null,defaultTourId:null};
        userCB({status:status, data:data});
    }

    return {
		
		/**
		 * Search for POI where the POI Id matches the given query string
		 *
		 * @param {Number} poiId 
		 * @param {Function} callback	 
		 *
		 */
        getPoiById:function (poiId, callback) {
			if(!Exists(poiId)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument poiId to SKta.Viewer.getPoiById().");
			}
			
			if(!Exists(callback)){
				throw new SKta.Error.InvalidArgumentError("Invalid argument callback to SKta.Viewer.getPoiById().");
			}
			
            var args = {
                type:"GET",
                url:SKta.rpcUrl,
                data:({poiId:poiId}),
                successCallback:function (res) {
                    _poiSuccessCB("getPoiById", res, callback);
                },
                errorCallback:function (res) {
                    _failureCB("getPoiById", res, callback);
                }
            };

            SKta.Application.makeServiceRequest(args);
        }
    };
}();
