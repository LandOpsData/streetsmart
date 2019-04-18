function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}define(['dojo/_base/Color','dojo/on','dojo/_base/array','esri/request','esri/geometry/Point','esri/geometry/Multipoint','esri/geometry/Polygon','esri/geometry/ScreenPoint','esri/geometry/Extent','esri/graphic','esri/symbols/SimpleMarkerSymbol','esri/symbols/SimpleLineSymbol','esri/symbols/SimpleFillSymbol','esri/renderers/SimpleRenderer','esri/layers/GraphicsLayer','esri/SpatialReference','./arcgisToGeojson','./utils','./SldFactory'],function(Color,on,dojoArray,esriRequest,Point,Multipoint,Polygon,ScreenPoint,Extent,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,SimpleRenderer,GraphicsLayer,SpatialReference,geoJsonUtils,utils,SLD){return function(){function LayerManager(_ref){var map=_ref.map,wkid=_ref.wkid,config=_ref.config,StreetSmartApi=_ref.StreetSmartApi,widget=_ref.widget;_classCallCheck(this,LayerManager);this.map=map;this.widget=widget;this.wkid=wkid;this.config=config;this.api=StreetSmartApi;this.defaultSymbol={color:{r:223,g:115,b:255,a:1},size:11,type:'simplemarkersymbol',style:'square',xoffset:0,yoffset:0,outline:{color:{r:26,g:26,b:26,a:1},width:2,type:'simplelinesymbol',style:'solid'}};this.overlays=[];this.requestQueue=[];this.requestID=0;this.isQueueLoading=false;this.reloadQueueOnFinish=false}LayerManager.prototype.addOverlaysToViewer=function addOverlaysToViewer(){var _this=this;if(this.widget.config.overlays===false)return;this.removeOverlays();var mapLayers=_.values(this.map._layers);var featureLayers=_.filter(mapLayers,function(l){return l.type==='Feature Layer'});var ID=++this.requestID;var extent=this._calcRecordingExtent();var requestBundle={ID:ID,extent:extent,req:[]};_.each(featureLayers,function(mapLayer){var sld=new SLD(mapLayer);if(sld.xml===undefined){return}if(mapLayer.hasZ){var requestObj={mapLayer:mapLayer,sld:sld,overlayID:null};requestBundle.req.push(requestObj)}else{var geojson=_this.createGeoJsonForFeature({mapLayer:mapLayer,sld:sld});var overlay=_this.api.addOverlay({// sourceSrs: 'EPSG:3857',  // Broken in API
name:mapLayer.name,sldXMLtext:sld.xml,geojson:geojson});_this.overlays.push(overlay.id)}});this.requestQueue.push(requestBundle);this._loadQueue()};LayerManager.prototype._loadQueue=function _loadQueue(){var _this2=this;if(this.isQueueLoading){this.reloadQueueOnFinish=true}else{(function(){_this2.isQueueLoading=true;var item=_this2.requestQueue.pop();// if no item is present it is probably already being loaded, its just that multiple requestBundles triggered the loading of the most recent.
if(item){var _loop=function _loop(request){var options={url:request.mapLayer.url+'/query?',content:{f:'json',returnGeometry:true,returnZ:true,geometry:JSON.stringify(item.extent),outSpatialReference:_this2.wkid,token:request.mapLayer.credential.token}};esriRequest(options).then(function(r){_this2._handleRequest(r,item,request)})};for(var _iterator=item.req,_isArray=Array.isArray(_iterator),_i=0,_iterator=_isArray?_iterator:_iterator[Symbol.iterator]();;){var _ref2;if(_isArray){if(_i>=_iterator.length)break;_ref2=_iterator[_i++]}else{_i=_iterator.next();if(_i.done)break;_ref2=_i.value}var request=_ref2;_loop(request)}_this2.requestQueue=[]}})()}};LayerManager.prototype._handleRequest=function _handleRequest(result,requestBundle,request){if(this.reloadQueueOnFinish&&!requestBundle.isComplete){this.isQueueLoading=false;requestBundle.isComplete=true;this._loadQueue()}else if(this.reloadQueueOnFinish===false){var mapLayer=request.mapLayer,sld=request.sld;try{var wkid=result.spatialReference&&result.spatialReference.wkid;if(wkid&&result.features.length){var info=this.createGeoJsonForFeature({mapLayer:mapLayer,sld:sld,wkid:wkid,featureSet:result});var overlay=this.api.addOverlay({// sourceSrs: 'EPSG:3857',  // Broken in API
name:mapLayer.name,sldXMLtext:sld.xml,geojson:info});request.overlayID=overlay;this.overlays.push(overlay.id)}else{request.overlayID='No wkid or features found.'}var isBundleComplete=true;for(var _iterator2=requestBundle.req,_isArray2=Array.isArray(_iterator2),_i2=0,_iterator2=_isArray2?_iterator2:_iterator2[Symbol.iterator]();;){var _ref3;if(_isArray2){if(_i2>=_iterator2.length)break;_ref3=_iterator2[_i2++]}else{_i2=_iterator2.next();if(_i2.done)break;_ref3=_i2.value}var reg=_ref3;if(!reg.overlayID){isBundleComplete=false;break}}if(isBundleComplete){this.isQueueLoading=false}}catch(e){request.overlayID='An error occured';var _isBundleComplete=true;for(var _iterator3=requestBundle.req,_isArray3=Array.isArray(_iterator3),_i3=0,_iterator3=_isArray3?_iterator3:_iterator3[Symbol.iterator]();;){var _ref4;if(_isArray3){if(_i3>=_iterator3.length)break;_ref4=_iterator3[_i3++]}else{_i3=_iterator3.next();if(_i3.done)break;_ref4=_i3.value}var _reg=_ref4;if(!_reg.overlayID){_isBundleComplete=false;break}}if(_isBundleComplete){this.isQueueLoading=false}throw e}}};LayerManager.prototype._calcRecordingExtent=function _calcRecordingExtent(){var recording=this.widget._panoramaViewer.getRecording();var featureRadius=30;var xyz=recording.xyz,srs=recording.srs;// needs support for feet.
var ext=new Extent(xyz[0]-featureRadius,xyz[1]-featureRadius,xyz[0]+featureRadius,xyz[1]+featureRadius,new SpatialReference(srs.split(':')[1]));return ext};LayerManager.prototype.removeOverlays=function removeOverlays(){var _this3=this;_.each(this.overlays,function(overlayId){_this3.api.removeOverlay(overlayId)});this.overlays=[]};// Doesn't need to remove the overlays from the viewer,
// as this is used when we destroy the viewer.
LayerManager.prototype.reset=function reset(){this.overlays=[]};LayerManager.prototype.doesFeatureMatchCase=function doesFeatureMatchCase(feature,sldCase){if(!sldCase.filter){return true}return feature.properties[sldCase.filter.attribute]===sldCase.filter.value};// Adds the SLD_DEFAULT_CASE when a feature
// matchs none if the special cases of the SLD
LayerManager.prototype.applyDefaultCaseIfNeeded=function applyDefaultCaseIfNeeded(feature,sld){var newFeature=_.cloneDeep(feature);var needsDefaultCase=true;for(var i=0;i<sld.cases.length;i++){var sldCase=sld.cases[i];var match=this.doesFeatureMatchCase(feature,sldCase);if(match){needsDefaultCase=false;break}}if(needsDefaultCase){newFeature.properties['SLD_DEFAULT_CASE']=1}return newFeature};LayerManager.prototype.createGeoJsonForFeature=function createGeoJsonForFeature(_ref5){var _this4=this;var mapLayer=_ref5.mapLayer,sld=_ref5.sld,featureSet=_ref5.featureSet,wkid=_ref5.wkid;var arcgisFeatureSet=featureSet||mapLayer.toJson().featureSet;var geojson=geoJsonUtils.arcgisToGeoJSON(arcgisFeatureSet);// We can't just create geoJson from the features of the maplayer.
// To correctly apply the default case in the Unique Value Renderer,
// we make the defaultCase a filter, and make the "other" features in the geoJSON
// match by adding a SLD_DEFAULT_CASE:1 property.
if(geojson.type==='FeatureCollection'&&sld.containsDefaultCase){var newFeatures=geojson.features.map(function(feature){return _this4.applyDefaultCaseIfNeeded(feature,sld)});geojson.features=newFeatures}// Make sure the panoramaviewer knows which srs this is in.
var wkidToUse=_.get(arcgisFeatureSet,'features[0].geometry.spatialReference.wkid',null)||wkid;if(wkidToUse){wkidToUse=wkidToUse===102100?3857:wkidToUse;var crs={type:'EPSG',properties:{code:wkidToUse}};geojson.crs=crs}return geojson};return LayerManager}()});