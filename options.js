document.getElementById('px').innerHTML=document.getElementById("thickness").value + "px";
chrome.storage.sync.get({
  pcolor: '#FF0000',
  pthickness: 3
}, function(items) {
  document.getElementById("thickness").value = items.pthickness;
  $("#color").val(items.pcolor);
  document.getElementById('px').innerHTML=document.getElementById("thickness").value + "px";
});

$('input[type=range]').on('input', function () {
  document.getElementById('px').innerHTML=document.getElementById("thickness").value + "px";
});
document.getElementById("save").onclick = save_options;
function save_options() {
  var thickness = document.getElementById("thickness").value;
  var color = document.getElementById("color").value;
  chrome.storage.sync.set({
    pcolor: color,
    pthickness: thickness
  }, function() {
    var status = document.getElementById('saved');
    status.innerHTML = "Options saved.";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  });
}


