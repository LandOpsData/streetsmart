function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}define(['dojo/_base/Color','dojo/on','dojo/_base/array','esri/geometry/Point','esri/geometry/Multipoint','esri/geometry/Polygon','esri/geometry/ScreenPoint','esri/graphic','esri/symbols/SimpleMarkerSymbol','esri/symbols/SimpleLineSymbol','esri/symbols/SimpleFillSymbol','esri/renderers/SimpleRenderer','esri/layers/GraphicsLayer','esri/SpatialReference','./arcgisToGeojson','./utils','./SldFactory'],function(Color,on,dojoArray,Point,Multipoint,Polygon,ScreenPoint,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,SimpleRenderer,GraphicsLayer,SpatialReference,geoJsonUtils,utils,SLD){return function(){function LayerManager(_ref){var map=_ref.map,wkid=_ref.wkid,config=_ref.config,StreetSmartApi=_ref.StreetSmartApi;_classCallCheck(this,LayerManager);this.map=map;this.wkid=wkid;this.config=config;this.api=StreetSmartApi;this.defaultSymbol={color:{r:223,g:115,b:255,a:1},size:11,type:'simplemarkersymbol',style:'square',xoffset:0,yoffset:0,outline:{color:{r:26,g:26,b:26,a:1},width:2,type:'simplelinesymbol',style:'solid'}};this.overlays=[]}LayerManager.prototype.addOverlaysToViewer=function addOverlaysToViewer(){var _this=this;this.removeOverlays();var mapLayers=_.values(this.map._layers);var featureLayers=_.filter(mapLayers,function(l){return l.type==='Feature Layer'});_.each(featureLayers,function(mapLayer){var sld=new SLD(mapLayer);var geojson=_this.createGeoJsonForFeature({mapLayer:mapLayer,sld:sld});var overlay=_this.api.addOverlay({// sourceSrs: 'EPSG:3857',  // Broken in API
name:mapLayer.name,sldXMLtext:sld.xml,geojson:geojson});_this.overlays.push(overlay.id)})};LayerManager.prototype.removeOverlays=function removeOverlays(){var _this2=this;_.each(this.overlays,function(overlayId){_this2.api.removeOverlay(overlayId)});this.overlays=[]};// Doesn't need to remove the overlays from the viewer,
// as this is used when we destroy the viewer.
LayerManager.prototype.reset=function reset(){this.overlays=[]};LayerManager.prototype.doesFeatureMatchCase=function doesFeatureMatchCase(feature,sldCase){if(!sldCase.filter){return true}return feature.properties[sldCase.filter.attribute]===sldCase.filter.value};// Adds the SLD_DEFAULT_CASE when a feature
// matchs none if the special cases of the SLD
LayerManager.prototype.applyDefaultCaseIfNeeded=function applyDefaultCaseIfNeeded(feature,sld){var newFeature=_.cloneDeep(feature);var needsDefaultCase=true;for(var i=0;i<sld.cases.length;i++){var sldCase=sld.cases[i];var match=this.doesFeatureMatchCase(feature,sldCase);if(match){needsDefaultCase=false;break}}if(needsDefaultCase){newFeature.properties['SLD_DEFAULT_CASE']=1}return newFeature};LayerManager.prototype.createGeoJsonForFeature=function createGeoJsonForFeature(_ref2){var _this3=this;var mapLayer=_ref2.mapLayer,sld=_ref2.sld;var arcgisFeatureSet=mapLayer.toJson().featureSet;var geojson=geoJsonUtils.arcgisToGeoJSON(arcgisFeatureSet);// We can't just create geoJson from the features of the maplayer.
// To correctly apply the default case in the Unique Value Renderer,
// we make the defaultCase a filter, and make the "other" features in the geoJSON
// match by adding a SLD_DEFAULT_CASE:1 property.
if(geojson.type==='FeatureCollection'&&sld.containsDefaultCase){var newFeatures=geojson.features.map(function(feature){return _this3.applyDefaultCaseIfNeeded(feature,sld)});geojson.features=newFeatures}// Make sure the panoramaviewer knows which srs this is in.
var wkid=_.get(arcgisFeatureSet,'features[0].geometry.spatialReference.wkid',null);if(wkid){wkid=wkid===102100?3857:wkid;var crs={type:'EPSG',properties:{code:wkid}};geojson.crs=crs}return geojson};return LayerManager}()});