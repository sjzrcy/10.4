function removeElement(name) {
    var nodes = document.getElementsByClassName(name);
    var node = nodes[0];
    
    node.parentNode.removeChild(node);
}