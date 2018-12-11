function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}define(['esri/renderers/SimpleRenderer','esri/renderers/ClassBreaksRenderer','esri/renderers/UniqueValueRenderer','esri/symbols/SimpleMarkerSymbol'],function(SimpleRenderer,ClassBreaksRenderer,UniqueValueRenderer,SimpleMarkerSymbol){'use strict';return function(){function SLD(mapLayer){_classCallCheck(this,SLD);this.mapLayer=mapLayer;this.containsDefaultCase=false;this.cases=this.generateCases();this.rules=this.cases.map(this.createRuleForSymbolCase.bind(this));this.xml=this.createXml()}// A mapLayer can render multiple symbols.
// Each symbol represents a Rule in an SLD.
// Create a symbol and its correspondig filter per unique symbol.
SLD.prototype.generateCases=function generateCases(){var mapLayer=this.mapLayer;var renderer=mapLayer.renderer;if(renderer instanceof SimpleRenderer){return[{filter:null,// Every symbol is the same, so no filtering needed
symbol:renderer.getSymbol(),geometryType:mapLayer.geometryType}]}if(renderer instanceof UniqueValueRenderer){var attribute=renderer.attributeField;var specialCases=renderer.infos.map(function(uniqueValue){return{filter:{value:uniqueValue.value,attribute:attribute},symbol:uniqueValue.symbol,geometryType:mapLayer.geometryType}});// Add the "else" symbol (default case) to the list
if(renderer.defaultSymbol){this.containsDefaultCase=true;var defaultCase={filter:{value:1,attribute:'SLD_DEFAULT_CASE'},symbol:renderer.defaultSymbol,geometryType:mapLayer.geometryType};return[defaultCase].concat(specialCases)}return specialCases}console.warn('Unsupported renderer found',mapLayer.name);return[{filter:null,symbol:renderer.defaultSymbol}]};SLD.prototype.createRuleForSymbolCase=function createRuleForSymbolCase(_ref){var filter=_ref.filter,symbol=_ref.symbol,geometryType=_ref.geometryType;return'\n                <Rule>\n                    '+this.createSldFilter(filter)+'\n                    '+this.createSymbolizer(symbol,{geometryType:geometryType})+'\n                </Rule>\n            '};// Transform `infos` to filter
SLD.prototype.createSldFilter=function createSldFilter(filter){if(!filter){return''}var content='<PropertyName>'+filter.attribute+'</PropertyName><Literal>'+filter.value+'</Literal>';return'<Filter><PropertyIsEqualTo>'+content+'</PropertyIsEqualTo></Filter>'};SLD.prototype._createStrokeAndFill=function _createStrokeAndFill(symbol){var stroke='';if(symbol.outline){stroke='<Stroke>\n                    <SvgParameter name="stroke">'+symbol.outline.color.toHex()+'</SvgParameter>\n                    <SvgParameter name="stroke-opacity">'+symbol.outline.color.a+'</SvgParameter>\n                    <SvgParameter name="stroke-width">'+symbol.outline.width+'</SvgParameter>\n                  </Stroke>'}var fill='<Fill>\n                <SvgParameter name="fill">'+symbol.color.toHex()+'</SvgParameter>\n                <SvgParameter name="fill-opacity">'+symbol.color.a+'</SvgParameter>\n              </Fill>';return{stroke:stroke,fill:fill}};// Transform arcGis symbol to SLD
SLD.prototype.createSymbolizer=function createSymbolizer(symbol,_ref2){var geometryType=_ref2.geometryType;switch(geometryType){case'esriGeometryPolygon':return this.createPolygonSymbolizer(symbol);case'esriGeometryPolyline':return this.createLineSymbolizer(symbol);case'esriGeometryPoint':default:return this.createPointSymbolizer(symbol);}};SLD.prototype.createPolygonSymbolizer=function createPolygonSymbolizer(symbol){var _createStrokeAndFill2=this._createStrokeAndFill(symbol),stroke=_createStrokeAndFill2.stroke,fill=_createStrokeAndFill2.fill;return'\n                <PolygonSymbolizer>\n                    '+fill+'\n                    '+stroke+'\n                </PolygonSymbolizer>\n            '};SLD.prototype.createLineSymbolizer=function createLineSymbolizer(symbol){return'\n                <LineSymbolizer>\n                    <Stroke>\n                        <SvgParameter name="stroke">'+symbol.color.toHex()+'</SvgParameter>\n                        <SvgParameter name="stroke-opacity">'+symbol.color.a+'</SvgParameter>\n                        <SvgParameter name="stroke-width">'+symbol.width+'</SvgParameter>\n                    </Stroke>\n                </LineSymbolizer>\n            '};SLD.prototype._createWellKnownName=function _createWellKnownName(symbol){// asdfsdfdsfasdfsaf
switch(symbol.style){case SimpleMarkerSymbol.STYLE_PATH:case SimpleMarkerSymbol.STYLE_SQUARE:case SimpleMarkerSymbol.STYLE_DIAMOND:return'square';case SimpleMarkerSymbol.STYLE_X:// return 'x'; // The StreetSmartAPI does not support 'x'
case SimpleMarkerSymbol.STYLE_CROSS:return'cross';case SimpleMarkerSymbol.STYLE_CIRCLE:default:return'circle';}};SLD.prototype.createPointSymbolizer=function createPointSymbolizer(symbol){var content='';if(symbol.type==='picturemarkersymbol'){content='\n                    <ExternalGraphic>\n                       <OnlineResource xlink:type="simple" xlink:href="'+symbol.url+'" />\n                       <Format>'+symbol.contentType+'</Format>\n                    </ExternalGraphic>\n                    <Size>100</Size>\n                '}else{var wellKnownName=this._createWellKnownName(symbol);var _createStrokeAndFill3=this._createStrokeAndFill(symbol),stroke=_createStrokeAndFill3.stroke,fill=_createStrokeAndFill3.fill;// According to the arcgis docs:
// The color property does not apply to marker symbols defined with the cross or x style.
// Since these styles are wholly comprised of outlines, you must set the color of symbols with those styles via the setOutline() method.
if(symbol.style===SimpleMarkerSymbol.STYLE_X||symbol.style===SimpleMarkerSymbol.STYLE_CROSS){fill=stroke;stroke=''}content='\n                    <Mark>\n                        <WellKnownName>'+wellKnownName+'</WellKnownName>\n                        '+fill+'\n                        '+stroke+'\n                    </Mark>\n                    <Size>12</Size>\n                '}return'\n            <PointSymbolizer>\n                <Graphic>\n                    '+content+'\n                </Graphic>\n            </PointSymbolizer>\n            '};SLD.prototype.createXml=function createXml(){var mapLayer=this.mapLayer,rules=this.rules;return'<?xml version="1.0" encoding="UTF-8"?>\n                    <sld:StyledLayerDescriptor version="1.1.0" \n                     xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" \n                     xmlns="http://www.opengis.net/se" \n                     xmlns:sld="http://www.opengis.net/sld" \n                     xmlns:ogc="http://www.opengis.net/ogc" \n                     xmlns:xlink="http://www.w3.org/1999/xlink" \n                     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n                    <sld:NamedLayer>\n                        <Name>'+mapLayer.name+'</Name>\n                        <sld:UserStyle>\n                            <Title>'+mapLayer.id+'</Title>\n                            <FeatureTypeStyle>\n                                 '+rules.join('')+'\n                            </FeatureTypeStyle>\n                        </sld:UserStyle>\n                    </sld:NamedLayer>\n                </sld:StyledLayerDescriptor>'};return SLD}()});