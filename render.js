(function () {
  var TEXT_NODE = 3;
  var YUKI_DOM = [];
  var fetchYukiDom = function () {
    var yukiDom = document.body.getElementsByTagName('yuki');
    for (var i = 0; i < yukiDom.length; i++) {
      YUKI_DOM.push(yukiDom[i].cloneNode(true));
    }
    while (yukiDom.length > 0) {
      document.body.removeChild(yukiDom[0]);
    }
  }
  fetchYukiDom();

  var renderYukiDomToVirtualDomObject = function () {
    var RenderYukiDomToVirtualDomObject = function () {
      this.yukiDom = [];
      this.virtualDomObject = [];
      this.fetch();
    };
    RenderYukiDomToVirtualDomObject.prototype.fetch = function () {
      this.yukiDom = YUKI_DOM;
    }
    RenderYukiDomToVirtualDomObject.prototype.renderGivenDomToVirtualDomObject = function (dom, rootNode, nodeLayerNumber) {
      var virtualDomObjectContainer = [];
      this._renderYukiDomToVirtualDomObject(dom, dom.cloneNode(), virtualDomObjectContainer, nodeLayerNumber, 0, 0);
      if (rootNode) {
        virtualDomObjectContainer[0].parentNode = rootNode;
      }      
      return virtualDomObjectContainer;
    }
    RenderYukiDomToVirtualDomObject.prototype._renderYukiDomToVirtualDomObject = function (yukiDom, parentNode, virtualDomObjectContainer, nodeLayerNumber, nodeLayerId, parentNodeLayerId) {
      this._removeEmptyChildTextNode(yukiDom);
      var virtualDomObject = this._renderDomToVirtualDom(yukiDom);
      virtualDomObjectContainer.push({ node: virtualDomObject.parent, parentNode: parentNode, layerNumber: nodeLayerNumber, layerId: nodeLayerId, parentLayerId: parentNodeLayerId });
      for (var i = 0; i < virtualDomObject.child.childNodes.length; i++) {
        this._renderYukiDomToVirtualDomObject(virtualDomObject.child.childNodes[i], virtualDomObject.parent, virtualDomObjectContainer, nodeLayerNumber + 1, i, nodeLayerId)
      }
    }
    RenderYukiDomToVirtualDomObject.prototype._removeEmptyChildTextNode = function (dom) {
      for (var i = 0; i < dom.childNodes.length; i++) {
        var node = dom.childNodes[i];
        if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
          node.parentNode.removeChild(node);
        }
      }
    }
    RenderYukiDomToVirtualDomObject.prototype._renderDomToVirtualDom = function (dom) {
      return { parent: dom.cloneNode(), child: dom.cloneNode(true) };
    }
    return new RenderYukiDomToVirtualDomObject();
  }
  var renderYukiDomToVirtualDomObject = renderYukiDomToVirtualDomObject();
  var bidirectionalBindings = function () {
    var BidirectionalBindings = function () {
      this.containConditionNodeObjectItems = [];
      this.conditionObjectItems = [];
      this.objectItems = [];
      this.parentCopyVirtualDomObject = this.getCopyVirtualDomObject(YUKI_DOM[0]);
      this.parentCopyObject = this.getCopyVirtualDomObject(YUKI_DOM[0]);
      this.renderGivenObjectItem(this.parentCopyObject);
      this.renderObjectItems();
    }
    BidirectionalBindings.prototype.renderGivenObjectItem = function (object) {
      for (var i = 0; i < object.length; i++) {
        object[i].parentNode.appendChild(object[i].node);        
      }
    }
    BidirectionalBindings.prototype.renderObjectItems = function () {
      // get node witch contains conditional statement
      this.detectionContainConditionNode(this.parentCopyVirtualDomObject);
      // collect conditionNodeObject key
      var conditionNodeObjectKeyCollect = [];
      // make a back-up copy of YUKI_DOM
      var copyObject = this.getCopyVirtualDomObject(YUKI_DOM[0]);
      var object = [];
      // render the node contains conditional statement
      for (var i = 0; i < this.containConditionNodeObjectItems.length; i++) {
        var conditionNodeObject = this.containConditionNodeObjectItems[i];
        var parentNode = copyObject[conditionNodeObject.key].parentNode;
        this.renderContainConditionNodeObject(conditionNodeObject.object.node, conditionNodeObject.key, parentNode);
        conditionNodeObjectKeyCollect.push(conditionNodeObject.key);
      }
      // integration object
      for (var i = 0; i < copyObject.length; i++) {
        if (conditionNodeObjectKeyCollect.indexOf(i) !== -1) {
          var parentObject = copyObject[i];
          var childObject = copyObject[i + 1];
          while (childObject.layerNumber > parentObject.layerNumber) {
            i++;
            childObject = copyObject[i + 1];
          }
          for (var j = 0; j < this.conditionObjectItems[0].length; j++) {
            object.push(this.conditionObjectItems[0][j]);
          }
          continue;
        }
        object.push(copyObject[i]);
      }
      // render the node in object items
      for (var i = 0; i < object.length; i++) {
        object[i].parentNode.appendChild(object[i].node);
      }
      document.body.appendChild(object[1].node);
    }
    BidirectionalBindings.prototype.getCopyVirtualDomObject = function (dom, rootNode) {
      return renderYukiDomToVirtualDomObject.renderGivenDomToVirtualDomObject(dom, rootNode, 0);
    }
    BidirectionalBindings.prototype.renderContainConditionNodeObject = function (node, nodeKey, parentNode) {
      // get condition
      var condition = node.getAttribute('y-for');
      var conditionArr = condition.split('in');
      for (var i = 0; i < conditionArr.length; i++) {
        conditionArr[i] = conditionArr[i].trim();
      }
      // get state key&value
      var stateKey = conditionArr[1];
      var stateValue = state[stateKey];
      // 
      var objectIndex = this.conditionObjectItems.push([]) - 1;
      // var conditionRootObject = this.parentCopyVirtualDomObject[nodeKey];
      var conditionRootNode = parentNode;
      for (var i = 0; i < stateValue.length; i++) {
        var parentConditionObject = this.parentCopyObject[nodeKey];
        var copyConditionObject = this.getCopyVirtualDomObject(parentConditionObject.node, conditionRootNode);
        
        for (var j = 0; j < copyConditionObject.length; j++) {
          var objectItem = copyConditionObject[j];
          if (objectItem.node.nodeType == TEXT_NODE) {
            var value = this.renderTemplateSyntax(stateKey, i, objectItem.node.nodeValue);
            var cloneTextNode = document.createTextNode(value);
            this.conditionObjectItems[objectIndex].push({
              node: cloneTextNode,
              parentNode: objectItem.parentNode,
              layerNumber: objectItem.layerNumber,
              layerId: objectItem.layerId,
              parentLayerId: objectItem.parentLayerId
            });
            continue;
          }
          this.conditionObjectItems[objectIndex].push({
            node: objectItem.node,
            parentNode: objectItem.parentNode,
            layerNumber: objectItem.layerNumber,
            layerId: objectItem.layerId,
            parentLayerId: objectItem.parentLayerId
          });
        }
      }
    }
    BidirectionalBindings.prototype.renderTemplateSyntax = function (key, index, string) {
      var chips = string.match(/(.*?){{(.*?)}}(.*?)/);
      if (chips) {
        var value = this.getObjectDataByString(state[key][index], chips[2]);
        return `${chips[1]}${value}${chips[3]}`;
      }
      return string;
    }
    BidirectionalBindings.prototype.getObjectDataByString = function (object, string) {
      if (string.match('.')) {
        var chips = string.split('.');
        var copyObject = object;
        for (var i = 1; i < chips.length; i++) {
          copyObject = copyObject[chips[i].trim()];
        }
        return copyObject;
      }
    }
    BidirectionalBindings.prototype.detectionContainConditionNode = function (copyVirtualDomObject) {
      for (var i = 0; i < copyVirtualDomObject.length; i++) {
        if (copyVirtualDomObject[i].node.nodeType != TEXT_NODE) {
          copyVirtualDomObject[i].node.getAttribute('y-for')
            ? this.containConditionNodeObjectItems.push({ object: copyVirtualDomObject[i], key: i })
            : false;
        }
      }
    }
    var bidirectionalBindings = new BidirectionalBindings();
  }
  var virtualDomObject = bidirectionalBindings();
})()