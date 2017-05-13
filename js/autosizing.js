const autoSizing = function(element) {
  if (element.scrollHeight > 50) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight+10) + "px";
  }
};
