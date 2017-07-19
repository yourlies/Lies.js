(function () {
  var renderYukiDomToVirtualDomObject = function () {
    var RenderYukiDomToVirtualDomObject = function () {
      this.yukiDom = [];
      this.virtualDomObject = [];
      this.fetch();
    };
    RenderYukiDomToVirtualDomObject.prototype.fetch = function () {
      var yukiDom = document.body.getElementsByTagName('yuki');
      for (var i = 0; i < yukiDom.length; i++) {
        this.yukiDom.push(yukiDom[i].cloneNode(true));
      }
      while (yukiDom.length > 0) {
        document.body.removeChild(yukiDom[0]);
      }
    }
    RenderYukiDomToVirtualDomObject.prototype.renderGivenDomIndexToVirtualDomObject = function (index) {
      var dom = this.yukiDom[index]
      var virtualDomObjectContainer = [];
      this._renderYukiDomToVirtualDomObject(dom, dom.cloneNode(), virtualDomObjectContainer);
      return virtualDomObjectContainer;
    }
    RenderYukiDomToVirtualDomObject.prototype._renderYukiDomToVirtualDomObject = function (yukiDom, parentNode, virtualDomObjectContainer) {
      this._removeEmptyChildTextNode(yukiDom);
      var virtualDomObject = this._renderDomToVirtualDom(yukiDom);
      virtualDomObjectContainer.push({ node: virtualDomObject.parent, parentNode: parentNode });
      for (var i = 0; i < virtualDomObject.child.childNodes.length; i++) {
        this._renderYukiDomToVirtualDomObject(virtualDomObject.child.childNodes[i], virtualDomObject.parent, virtualDomObjectContainer)        
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
      this.traversalData = [];
      this.objectData = [];
      this.copyVirtualDomObjectItems = [];
      this.parentCopyVirtualDomObject = this.getCopyVirtualDomObject();
      this.renderTraversalData();
    }
    BidirectionalBindings.prototype.getCopyVirtualDomObject = function () {
      return renderYukiDomToVirtualDomObject.renderGivenDomIndexToVirtualDomObject(0);
    }
    BidirectionalBindings.prototype.renderTraversalData = function () {
      this.detectionTraversalData(this.parentCopyVirtualDomObject);
      var traversalDataString = this.traversalData[0].node.getAttribute('y-for');
      var traversalDataArr = traversalDataString.split('in');
      for (var i = 0; i < traversalDataArr.length; i++) {
        traversalDataArr[i] = traversalDataArr[i].trim();
      }
      var traversalData = state[traversalDataArr[1]];
      for (var i = 0; i < traversalData.length; i++) {
        var index = this.objectData.push([]) - 1;
        var copyVirtualDomObject = this.getCopyVirtualDomObject();
        for (var j = 0; j < copyVirtualDomObject.length; j++) {
          if (copyVirtualDomObject[j].node.nodeType == 3) {
            var chips = copyVirtualDomObject[j].node.nodeValue.match(/{{(.*?)}}/);
            var objectData = this.getObjectDataByString(traversalData[i], chips[1]);
            var cloneNode = document.createTextNode(objectData);
            this.objectData[index].push({ node: cloneNode, parentNode: copyVirtualDomObject[j].parentNode });
            continue;
          }
          this.objectData[index].push({ node: copyVirtualDomObject[j].node, parentNode: copyVirtualDomObject[j].parentNode });
        }
      }
      for (var i = 0; i < this.objectData.length; i++) {
        for (var j = 0; j < this.objectData[i].length; j ++) {
          this.objectData[i][j].parentNode.appendChild(this.objectData[i][j].node);          
        }
      }
      document.body.appendChild(this.objectData[0][1].node);
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
    BidirectionalBindings.prototype.detectionTraversalData = function (copyVirtualDomObject) {
      for (var i = 0; i < copyVirtualDomObject.length; i++) {
        if (copyVirtualDomObject[i].node.nodeType != 3) {
          copyVirtualDomObject[i].node.getAttribute('y-for')
            ? this.traversalData.push(copyVirtualDomObject[i])
            : false;
        }
      }
    }
    var bidirectionalBindings = new BidirectionalBindings();
  }
  var virtualDomObject = bidirectionalBindings();
})()