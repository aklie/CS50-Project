// this checks if the elements already exists on the document (exit if extension is clicked again)
if (document.getElementById('can')) {
    exit();
} else {
    var erase_drawing = false;
    var stop = false;
    var canvas = document.createElement("canvas");
    // ID of the canvas object
    canvas.id = "can";
    // Canvas lives inside body (so document -> body -> canvas)
    document.body.appendChild(canvas);
    // ID of draggable object
    
    // # specifies that the elements are selected by their ID's
    $("#drawingCanvas").append('</canvas>');

    $("#draw_button").click(pen);
    $("#erase_button").click(erase);
    $("#clear_button").click(clear);
    $("#exit_button").click(exit);

      chrome.storage.sync.get({
      pen_color: '#FF0000',
      pen_thickness: 3
    }, function(items) {
      document.getElementById("thickness").value = items.pen_thickness;
      $("#color").val(items.pen_color);
    });
    var draw_button = document.getElementById("draw_button");
    var erase_button = document.getElementById("erase_button");
    var buttons = document.getElementsByClassName("functionalities");

    with(canvas.style) {
        cursor = 'crosshair';
        top = '0px';
        left = '0px';
        position = 'absolute';
        zIndex = '2147483646';
        backgroundColor = 'transparent';
        userSelect = 'none';
    }

    var ctx, flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        prevtouchX = 0,
        prevtouchY = 0,
        touchX = 0,
        touchY = 0;

    if($(document).height() > 32767) {
      alert("Unfortunately due to chrome browser limits, Page Marker does not support pages with a height greater than 32,767 pixels.");
      exit();
    }

    canvas.width = document.body.clientWidth;
    canvas.height = $(document).height();
    ctx = canvas.getContext("2d");
    var fromTop = document.body.scrollTop || document.documentElement.scrollTop;

    w = canvas.width;
    h = canvas.height;

    window.onscroll = function() {
      if (!stop) {
        if($(document).scrollTop() > 32767) {
          alert("Unfortunately due to chrome browser limits, Page Marker does not support pages with a height greater than 32,767 pixels.");
          exit();
        }
        if($(document).height() != document.getElementById('can').height) {
          var save = ctx.getImageData(0, 0, document.body.clientWidth, $(document).height());
          document.getElementById('can').width = document.body.clientWidth;
          document.getElementById('can').height = $(document).height();
          w = document.getElementById('can').width;
          h = document.getElementById('can').height;
          ctx.putImageData(save, 0, 0);
        }
        var fromTop = document.body.scrollTop || document.documentElement.scrollTop;
      }
    };

    canvas.addEventListener("mousemove", function(e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function(e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function(e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        findxy('out', e)
    }, false);
    canvas.addEventListener('touchstart', sketchpad_touchStart, false);
    canvas.addEventListener('touchmove', sketchpad_touchMove, false);
    
    $(document).keydown(function(e) {
        if (!stop) {
            switch (e.which) {
                case 88:
                    erase();
                    break;
                case 27:
                    exit();
                    break;
            }
        }
    });
    function draw() {
        ctx.beginPath();
        if(erase_drawing) {
          ctx.globalCompositeOperation="destination-out";
          ctx.lineWidth = thickness * 3;
          ctx.strokeStyle = color;
          ctx.lineJoin = "round";
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(currX, currY);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation="source-over";
          ctx.lineWidth = thickness;
          ctx.strokeStyle = color;
          ctx.lineJoin = "round";
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(currX, currY);
          ctx.closePath();
          ctx.stroke();
        }
    }
    function drawTouch(x, y) {
        var thickness = document.getElementById("thickness").value;
        var color = document.getElementById("color").value;
        ctx.beginPath();
        if(erase_drawing) {
          ctx.globalCompositeOperation="destination-out";
          ctx.lineWidth = thickness * 3;
          ctx.strokeStyle = color;
          ctx.lineJoin = "round";
          ctx.moveTo(prevtouchX, prevtouchY);
          ctx.lineTo(x, y);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation="source-over";
          ctx.lineWidth = thickness;
          ctx.strokeStyle = color;
          ctx.lineJoin = "round";
          ctx.moveTo(prevtouchX, prevtouchY);
          ctx.lineTo(x, y);
          ctx.closePath();
          ctx.stroke();
        }
    }
    function clear() {
        ctx.clearRect(0, 0, w, h);
    }
    function erase() {
      erase_drawing = true;
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0.2)";
    }
    function pen() {
      erase_drawing = false;
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0.2)";
    }
    function exit() {
        stop = true;
        canvas.removeEventListener("mousemove", false);
        canvas.removeEventListener("mousedown", false);
        canvas.removeEventListener("mouseup", false);
        canvas.removeEventListener("mouseout", false);
        canvas.removeEventListener("touchstart", false);
        canvas.removeEventListener("touchmove", false);
        document.getElementById('can').remove();
        document.getElementById('draggable').remove();
    }
    function findxy(res, e) {
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.pageX - canvas.offsetLeft;
            currY = e.pageY - canvas.offsetTop;
            var thickness = document.getElementById("thickness").value;
            var color = document.getElementById("color").value;
            ctx.beginPath();
            if(!erase_drawing) {
              ctx.globalCompositeOperation="source-over";
              ctx.strokeStyle = color;
              ctx.lineWidth = thickness;
              ctx.lineJoin = "round";
              ctx.moveTo(currX, currY-0.001);
              ctx.lineTo(currX, currY);
            } else {
              ctx.globalCompositeOperation="destination-out";
              ctx.strokeStyle = color;
              ctx.lineWidth = thickness * 3;
              ctx.lineJoin = "round";
              ctx.moveTo(currX, currY-0.001);
              ctx.lineTo(currX, currY);
            }
            ctx.closePath();
            ctx.stroke();
            flag = true;
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.pageX - canvas.offsetLeft;
                currY = e.pageY - canvas.offsetTop;
                draw();
            }
        }
    }
    function getTouchPos(e) {
        if (!e)
            var e = event;
        if (e.touches) {
            if (e.touches.length == 1) {
                prevtouchX = touchX;
                prevtouchY = touchY;
                var touch = e.touches[0];
                touchX = touch.pageX - touch.target.offsetLeft;
                touchY = touch.pageY - touch.target.offsetTop;
            }
        }
    }
    function sketchpad_touchStart() {
        getTouchPos();
        prevtouchX = touchX;
        prevtouchY = touchY;
        drawTouch(touchX, touchY);
        event.preventDefault();
    }
    function sketchpad_touchMove(e) {
        getTouchPos();
        drawTouch(touchX, touchY);
        event.preventDefault();
    }
}