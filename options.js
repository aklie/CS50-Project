document.getElementById('px').innerHTML=document.getElementById("thickness").value + "px";
chrome.storage.sync.get({
  pen_color: '#FF0000',
  pen_thickness: 3
}, function(items) {
  document.getElementById("thickness").value = items.pen_thickness;
  $("#color").val(items.pen_color);
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
    pen_color: color,
    pen_thickness: thickness
  }, function() {
    var status = document.getElementById('saved');
    status.innerHTML = "Options saved.";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  });
}

//Google Analytics
/*var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-87975985-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

function trackButton(e) {
    _gaq.push(['_trackEvent', e.target.id, 'clicked']);
};

function trackDonate(e) {
    _gaq.push(['_trackEvent', 'donate', 'clicked']);
};

var save = document.getElementById('save');
save.addEventListener('click', trackButton);
var donate = document.getElementById('donate');
donate.addEventListener('click', trackDonate);*/
