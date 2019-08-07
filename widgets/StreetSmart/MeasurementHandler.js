function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}define(['dojo/_base/Color','dojo/on','dojo/_base/array','esri/geometry/Point','esri/geometry/Polygon','esri/geometry/ScreenPoint','esri/graphic','esri/symbols/SimpleMarkerSymbol','esri/symbols/SimpleLineSymbol','esri/symbols/SimpleFillSymbol','esri/symbols/Font','esri/renderers/SimpleRenderer','esri/layers/GraphicsLayer','esri/SpatialReference','esri/symbols/TextSymbol','esri/geometry/Polyline','./utils'],function(Color,on,dojoArray,Point,Polygon,ScreenPoint,Graphic,SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,Font,SimpleRenderer,GraphicsLayer,SpatialReference,TextSymbol,Polyline,utils){return function(){function MeasurementHandler(_ref){var map=_ref.map,wkid=_ref.wkid,measureChange=_ref.measureChange,layer=_ref.layer,StreetSmartApi=_ref.StreetSmartApi;_classCallCheck(this,MeasurementHandler);this.map=map;this.wkid=wkid;this.measureChange=measureChange;this.layer=layer;this.StreetSmartApi=StreetSmartApi}MeasurementHandler.prototype.draw=function draw(measurementEvent){if(!measurementEvent||!measurementEvent.detail){return}// Just draw everything again
this.layer.clear();var activeMeasurement=measurementEvent.detail.activeMeasurement;if(!activeMeasurement||activeMeasurement.features.length===0){return}this.drawActiveMeasurement(activeMeasurement)};MeasurementHandler.prototype.drawActiveMeasurement=function drawActiveMeasurement(activeMeasurement){var geometryType=activeMeasurement.features[0].geometry.type;switch(geometryType){case'Point':return this.drawPointMeasurement(activeMeasurement);case'LineString':return this.drawLineMeasurement(activeMeasurement);case'Polygon':return this.drawPolygonMeasurement(activeMeasurement);}};MeasurementHandler.prototype._createPointLabel=function _createPointLabel(text){var bold=new Font(12,Font.WEIGHT_BOLD);var pointLabel=new TextSymbol(text,bold);pointLabel.setVerticalAlignment('bottom');pointLabel.setHorizontalAlignment('left');pointLabel.setOffset(5,5);pointLabel.setColor('white');pointLabel.setHaloSize(2);pointLabel.setHaloColor(Color.fromString('black'));return pointLabel};MeasurementHandler.prototype._createLineLabel=function _createLineLabel(text){var bold=new Font(10,Font.WEIGHT_BOLD);var pointLabel=new TextSymbol(text,bold);pointLabel.setColor('white');pointLabel.setHaloSize(1);pointLabel.setHaloColor(Color.fromString('black'));return pointLabel};MeasurementHandler.prototype._transformPoints=function _transformPoints(coords){var _this=this;var mapWkid=this.map.spatialReference.wkid;return coords.map(function(coord){// Ignore incomplete forward intersection:
if(_.includes(coord,null)){return null}var pointViewer=new Point(coord[0],coord[1],new SpatialReference({wkid:_this.wkid}));var coordMap=utils.transformProj4js(pointViewer,mapWkid);return[coordMap.x,coordMap.y]})};MeasurementHandler.prototype._drawPoint=function _drawPoint(coord,index){if(coord===null){return}var mapWkid=this.map.spatialReference.wkid;var pointMap=new Point(coord[0],coord[1],new SpatialReference({wkid:mapWkid}));this.layer.add(new Graphic(pointMap,null));this.layer.add(new Graphic(pointMap,this._createPointLabel(''+index)))};MeasurementHandler.prototype._drawLines=function _drawLines(transformedCoords){var mapWkid=this.map.spatialReference.wkid;var validCoords=transformedCoords.filter(function(coord){return coord!==null});if(validCoords.length<=1){return}var polyJson={paths:[validCoords],spatialReference:{wkid:mapWkid}};var lineGeom=new Polyline(polyJson);var lineSymbol=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([236,122,8,0.8]),4);this.layer.add(new Graphic(lineGeom,lineSymbol))};MeasurementHandler.prototype._drawPolygon=function _drawPolygon(transformedCoords){var mapWkid=this.map.spatialReference.wkid;var validCoords=transformedCoords.filter(function(coord){return coord!==null});if(validCoords.length<=1){return}var polyJson={rings:[validCoords],spatialReference:{wkid:mapWkid}};var polygonGeom=new Polygon(polyJson);var outline=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new Color([236,122,8,0.8]),4);var symbol=new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,outline,new Color([236,122,8,0.4]));this.layer.add(new Graphic(polygonGeom,symbol))};MeasurementHandler.prototype._drawLineLabels=function _drawLineLabels(transformedCoords,derivedData){var _this2=this;var mapWkid=this.map.spatialReference.wkid;if(transformedCoords.length<=1){return}_.each(transformedCoords,function(coord,i){var lineLength=derivedData.segmentLengths.value[i];var nextCoord=transformedCoords[i+1];if(lineLength===undefined||nextCoord===undefined||nextCoord===null||coord===null){return}var x1=(coord[0]+nextCoord[0])/2;var y1=(coord[1]+nextCoord[1])/2;var lineLabelPoint=new Point(x1,y1,new SpatialReference({wkid:mapWkid}));var readableLength=lineLength.toFixed(2)+derivedData.unit;_this2.layer.add(new Graphic(lineLabelPoint,_this2._createLineLabel(readableLength)))})};MeasurementHandler.prototype.drawPointMeasurement=function drawPointMeasurement(activeMeasurement){var coords=activeMeasurement.features[0].geometry.coordinates;if(coords===null){return}var transformedCoords=this._transformPoints([coords]);this._drawPoint(transformedCoords[0],1)};MeasurementHandler.prototype.drawLineMeasurement=function drawLineMeasurement(activeMeasurement){var _this3=this;var coords=activeMeasurement.features[0].geometry.coordinates;var derivedData=activeMeasurement.features[0].properties.derivedData;if(coords===null){return}var transformedCoords=this._transformPoints(coords);this._drawLines(transformedCoords);this._drawLineLabels(transformedCoords,derivedData);// Draw the individual points in the lineMeasurement;
_.each(transformedCoords,function(coord,i){return _this3._drawPoint(coord,i+1)})};MeasurementHandler.prototype.drawPolygonMeasurement=function drawPolygonMeasurement(activeMeasurement){var _this4=this;var coords=activeMeasurement.features[0].geometry.coordinates[0];var derivedData=activeMeasurement.features[0].properties.derivedData;if(coords===null||coords.length<2){return}var transformedCoords=this._transformPoints(coords);// The first and last coords are the same
var uniqueCoords=_.clone(transformedCoords);uniqueCoords.pop();// Draw the line between the valid points, together with the lineLength derivedData
// This only works when we have >= 2 distinct points
if(uniqueCoords.length>=2){this._drawPolygon(transformedCoords);this._drawLineLabels(transformedCoords,derivedData)}// Draw the individual points
_.each(uniqueCoords,function(coord,i){return _this4._drawPoint(coord,i+1)})};return MeasurementHandler}()});