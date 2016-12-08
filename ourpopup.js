
// this checks if the elements already exists on the document (exit if extension is clicked again)
if (document.getElementById('can') && document.getElementById('draggable')) {
    exit();
} else {
    var erase_drawing = false;
    var highlight_drawing = false;
    var stop = false;
    var canvas = document.createElement("canvas");
    // ID of the canvas object
    canvas.id = "can";
    // Canvas lives inside body (so document -> body -> canvas)
    document.body.appendChild(canvas);
    // ID of options object
    var options = document.createElement("div");
    options.id = "draggable";
    document.body.appendChild(options);
    // layout options in options object
    $("#draggable").append('<div>Web Draw</div><input type="hidden" name="color" id="color"><input type="button" value="Draw" id=draw_button class="functionalities"><input type="button" value="Erase" id=erase_button class="functionalities"><input type="button" value="Highlight" id=highlight_button class="functionalities"><input type="button" value="Save Image" id=save_button class="functionalities"><input type="button" value="Clear" id=clear_button class="functionalities"><input type="button" value="Exit" id=exit_button class="functionalities"><input type="hidden" name = "thickness" id="thickness">');
  
    // # specifies that the elements are selected by their ID's
    $("#drawingCanvas").append('</canvas>');

    // when clicked, go to these functions
    $("#highlight_button").click(highlight);
    $("#draw_button").click(pen);
    $("#type_button").click(keyboard);
    $("#erase_button").click(erase);
    $("#clear_button").click(clear);
    $("#exit_button").click(exit);
    $("#save_button").click(saver);


    // online storage preferences
      chrome.storage.sync.get({
      pcolor: '#FF0000',
      pthickness: 3
    }, function(items) {
      document.getElementById("thickness").value = items.pthickness;
      $("#color").val(items.pcolor);
    });
    var draw_button = document.getElementById("draw_button");
    var erase_button = document.getElementById("erase_button");
    var buttons = document.getElementsByClassName("functionalities");
    for (var i = 0; i < buttons.length; i++) {
        with(buttons[i].style) {
            padding = '5px';
            margin = '5px';
            color = '#000000';
            fontSize = '15px';
            fontFamily = 'Helvetica';
            textTransform = 'none';
            userSelect = 'none';
            clear = 'none';
        }
    }
    with(options.style) {
        display = 'block';
        boxSizing = 'content-box';        
        margin = '40px';
        padding = '5px';
        right = '0px';
        position = 'absolute';
        fontFamily = 'Arial Black';
        backgroundColor = 'rgb(255, 255, 255)';
        zIndex = '1000';
        boxShadow = '2px 4px 6px GREY';
    }

    with(canvas.style) {
        top = '0px';
        left = '0px';
        position = 'absolute';
        backgroundColor = 'transparent';
        zIndex = '1000';
        cursor = 'crosshair';
    }

    $(function() {
        $("#draggable").draggable();
    });


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
      alert("Unfortunately due to chrome browser limits, Web Draw does not support pages with a height greater than 32,767 pixels.");
      exit();
    }

    canvas.width = document.body.clientWidth;
    canvas.height = $(document).height();
    ctx = canvas.getContext("2d");
    var fromTop = document.body.scrollTop || document.documentElement.scrollTop;
    options.style.top = fromTop + "px";

    w = canvas.width;
    h = canvas.height;

    window.onscroll = function() {
      if (!stop) {
        if($(document).scrollTop() > 32767) {
          alert("Unfortunately due to chrome browser limits, Web Draw does not support pages with a height greater than 32,767 pixels.");
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
        options.style.top = fromTop + "px";
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
    // canvas.addEventListener('touchstart', sketchpad_touchStart, false);
    // canvas.addEventListener('touchmove', sketchpad_touchMove, false);
    
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

    function saver(){
      // to do
      // urlData = canvas.toDataURL();
      // window.location = urlData;

      chrome.runtime.sendMessage({directive: "popup-click"});
    }

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
          if(highlight_drawing) {
            ctx.globalCompositeOperation="source-over";
            ctx.lineWidth = 20;
            ctx.strokeStyle = "YELLOW";
            ctx.globalAlpha = 0.35;
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(currX, currY);
            ctx.closePath();
            ctx.stroke();
            }
          else {
            ctx.globalAlpha = 1;
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currX, currY);
            ctx.closePath();
            ctx.stroke();
          }  
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
      document.getElementById("type_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("highlight_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("save_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("clear_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("exit_button").style.background =  "rgba(0,0,0,0)";
    }

    // set erase_drawing boolean to true and change button color
    function erase() {
      erase_drawing = true;
      highlight_drawing = false;
      document.getElementById("type_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("highlight_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("save_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("clear_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("exit_button").style.background =  "rgba(0,0,0,0)";
    }
    function pen() {
      erase_drawing = false;
      highlight_drawing = false;
      document.getElementById("type_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("highlight_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("save_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("clear_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("exit_button").style.background =  "rgba(0,0,0,0)";
    }
    function highlight() {
      erase_drawing = false;
      highlight_drawing = true;
      document.getElementById("type_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("highlight_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("save_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("clear_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("exit_button").style.background =  "rgba(0,0,0,0)";
    }
    function keyboard() {
      erase_drawing = false;
      highlight_drawing = false;
      document.getElementById("type_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("highlight_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("draw_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("erase_button").style.background =  "rgba(0,0,0,0)";      
      document.getElementById("save_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("clear_button").style.background =  "rgba(0,0,0,0)";
      document.getElementById("exit_button").style.background =  "rgba(0,0,0,0)";
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
          if(highlight_drawing) {
            currX = e.pageX - canvas.offsetLeft;
            currY = e.pageY - canvas.offsetTop;
          }
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
              if(!highlight_drawing) {
                ctx.moveTo(currX, currY-0.001);
                ctx.lineTo(currX, currY);
              }
              
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
            if(highlight_drawing) {
              draw();
            }
        }
        if (res == 'move') {
            if (flag) {
                if(highlight_drawing) {
                  currX = e.pageX - canvas.offsetLeft;
                  currY = e.pageY - canvas.offsetTop;
                }
                else {
                  prevX = currX;
                  prevY = currY;
                  currX = e.pageX - canvas.offsetLeft;
                  currY = e.pageY - canvas.offsetTop;
                  draw();
                }
            }
        }
    }
}