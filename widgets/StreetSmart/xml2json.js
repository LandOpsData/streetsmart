(function(){function _getAllAttr(node){var result={};if(node&&node.attributes){if(node.hasAttributes()===true){var attributes=node.attributes;var attribKeys=Object.keys(attributes);for(var index=0;index<attribKeys.length;index+=1){var attr=attributes[attribKeys[index]];if(attr&&attr.name&&attr.value){result[attr.name]=attr.value}}}}return result}/**
     * @private
     */function _getContent(node){return node.innerHTML||node.textContent}/**
     * @private
     */function _getTagName(node){return node.tagName}/**
     * @private
     */function _getChildren(parent){var children=[];if(parent&&parent.childNodes){var childNodes=parent.childNodes;var childNodeKeys=Object.keys(childNodes);for(var childIndex=0;childIndex<childNodeKeys.length;childIndex+=1){var child=childNodes[childNodeKeys[childIndex]];if(child&&child.nodeType===1){children.push(child)}}}return children}/**
     * @private
     */function _getChildInfo(children){var resultArr=[];if(children){var childKeys=Object.keys(children);for(var childKeyIndex=0;childKeyIndex<childKeys.length;childKeyIndex+=1){var child=children[childKeys[childKeyIndex]];if(child){var eachChildInfo={tagName:_getTagName(child),content:_getContent(child),attr:_getAllAttr(child),isParent:false,hasAttr:child.hasAttributes()};var subChildren=_getChildren(child);if(subChildren&&subChildren.length!==0){eachChildInfo.isParent=true;eachChildInfo.children=_getChildInfo(subChildren)}resultArr.push(eachChildInfo)}}}return resultArr}function toJSON(xmlString){var doc=getXmlObject(xmlString);return _getChildInfo(doc.childNodes)[0]}function getXmlObject(xmlString){var parser=new DOMParser;var xmlDoc=parser.parseFromString(xmlString,"text/xml");return xmlDoc}define({toJSON:toJSON})})();
