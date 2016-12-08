
// this checks if the elements already exists on the document (exit if extension is clicked again)
if (document.getElementById('can') && document.getElementById('draggable'))
{
    exit();
}
else
{
    var ctx, flag, erase_on, highlight_on, stop = false,
        oldX, oldY, newX, newY = 0;

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
    $("#drawingCanvas").append('</canvas>');
    $("#draggable").append('<div>Web Draw</div><a id="draw_icon"><img id="draw_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="erase_icon"><img id="erase_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="highlight_icon"><img id="highlight_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="save_icon"><img id="save_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="clear_icon"><img id="clear_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="exit_icon"><img id="exit_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><input type="hidden" name="color" id="color"><input type="hidden" name = "thickness" id="thickness">');

    // online storage preferences
    chrome.storage.sync.get(
    {
        pcolor: '#000099',
        pthickness: 3
    },
    function(items)
    {
        document.getElementById("thickness").value = items.pthickness;
        $("#color").val(items.pcolor);
    });
    document.getElementById("draw_iconImg").src=chrome.extension.getURL("draw_icon.png");
    document.getElementById("erase_iconImg").src=chrome.extension.getURL("erase_icon.png");
    document.getElementById("highlight_iconImg").src=chrome.extension.getURL("highlight_icon.png");
    document.getElementById("save_iconImg").src=chrome.extension.getURL("save_icon.png");
    document.getElementById("clear_iconImg").src=chrome.extension.getURL("clear_icon.png");
    document.getElementById("exit_iconImg").src=chrome.extension.getURL("exit_icon.png");

    // # specifies that the elements are selected by their ID's
    // when clicked, go to these functions
    $("#highlight_icon").click(highlight);
    $("#draw_icon").click(draw);
    $("#erase_icon").click(erase);
    $("#clear_icon").click(clear);
    $("#exit_icon").click(exit);
    $("#save_icon").click(saver);

    var draw_icon = document.getElementById("draw_icon"),
        erase_icon = document.getElementById("erase_icon"),
        buttons = document.getElementsByClassName("buttons");
    
    for (var i = 0; i < buttons.length; i++)
    {
        with(buttons[i].style)
        {
            margin = '5px';
            padding = '4px';
            width = '50px';
            height = '50px';
            borderRadius = '10px';
            cursor = 'pointer';
            backgroundColor = '#F0F0F5';
        }
    }
    with(options.style)
    {
        display = 'block';
        boxSizing = 'content-box';        
        margin = '40px';
        padding = '5px';
        right = '0px';
        position = 'absolute';
        fontFamily = 'Arial Black';
        backgroundColor = '#F0F0F5';
        zIndex = '1000';
        boxShadow = '2px 4px 6px GREY';
        borderRadius = '10px';
    }

    with(canvas.style)
    {
        top = '0px';
        left = '0px';
        position = 'absolute';
        backgroundColor = 'transparent';
        zIndex = '1000';
        cursor = 'crosshair';
    }

    $(function()
    {
        $("#draggable").draggable();
    });



    if($(document).height() > 32767)
    {
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
    
    // $(document).keydown(function(e) {
    //     if (!stop) {
    //         switch (e.which) {
    //             case 88:
    //                 erase();
    //                 break;
    //             case 27:
    //                 exit();
    //                 break;
    //         }
    //     }
    // });

    function saver(){
      // to do
      // urlData = canvas.toDataURL();
      // window.location = urlData;

      chrome.runtime.sendMessage({directive: "popup-click"});
    }

    function doodle() {
        ctx.beginPath();
        if(erase_on) {
          ctx.globalCompositeOperation="destination-out";
          ctx.globalAlpha = 1;
          ctx.lineWidth = 40;
          ctx.strokeStyle = color;
          ctx.lineJoin = "round";
          ctx.moveTo(oldX, oldY);
          ctx.lineTo(newX, newY);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.globalCompositeOperation="source-over";
          if(highlight_on) {
            ctx.lineWidth = 20;
            ctx.strokeStyle = "YELLOW";
            ctx.globalAlpha = 0.35;
            ctx.moveTo(oldX, oldY)
            ctx.lineTo(newX, newY);
            ctx.closePath();
            ctx.stroke();
            }
          else {
            ctx.globalAlpha = 1;
            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.moveTo(oldX, oldY);
            ctx.lineTo(newX, newY);
            ctx.closePath();
            ctx.stroke();
          }  
        }
    }
    

    // set erase_on boolean to true and change button color
    function draw()
    {
        erase_on = false;
        highlight_on = false;
        buttons[0].style.background =  "rgba(0,0,0,0.3)";
        buttons[1].style.background =  "rgba(0,0,0,0)";
        buttons[2].style.background =  "rgba(0,0,0,0)";
        buttons[3].style.background =  "rgba(0,0,0,0)";
        buttons[4].style.background =  "rgba(0,0,0,0)";
        buttons[5].style.background =  "rgba(0,0,0,0)";
    }

    function erase()
    {
        erase_on = true;
        highlight_on = false;
        buttons[0].style.background =  "rgba(0,0,0,0)";
        buttons[1].style.background =  "rgba(0,0,0,0.3)";
        buttons[2].style.background =  "rgba(0,0,0,0)";
        buttons[3].style.background =  "rgba(0,0,0,0)";
        buttons[4].style.background =  "rgba(0,0,0,0)";
        buttons[5].style.background =  "rgba(0,0,0,0)";
    }

    function highlight()
    {
        erase_on = false;
        highlight_on = true;
        buttons[0].style.background =  "rgba(0,0,0,0)";
        buttons[1].style.background =  "rgba(0,0,0,0)";
        buttons[2].style.background =  "rgba(0,0,0,0.3)";
        buttons[3].style.background =  "rgba(0,0,0,0)";
        buttons[4].style.background =  "rgba(0,0,0,0)";
        buttons[5].style.background =  "rgba(0,0,0,0)";
    }

    function clear()
    {
        ctx.clearRect(0, 0, w, h);
        buttons[0].style.background =  "rgba(0,0,0,0)";
        buttons[1].style.background =  "rgba(0,0,0,0)";
        buttons[2].style.background =  "rgba(0,0,0,0)";
        buttons[3].style.background =  "rgba(0,0,0,0)";
        buttons[4].style.background =  "rgba(0,0,0,0.3)";
        buttons[5].style.background =  "rgba(0,0,0,0)";
    }

    function exit()
    {
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

    function findxy(res, e)
    {
        if (res == 'down')
        {
            if(highlight_on)
            {
                newX = e.pageX - canvas.offsetLeft;
                newY = e.pageY - canvas.offsetTop;
            }
            oldX = newX;
            oldY = newY;
            newX = e.pageX - canvas.offsetLeft;
            newY = e.pageY - canvas.offsetTop;
            var thickness = document.getElementById("thickness").value;
            var color = document.getElementById("color").value;
            ctx.beginPath();
            if(!erase_on)
            {
                ctx.globalCompositeOperation="source-over";
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness;
                ctx.lineJoin = "round";
                if(!highlight_on)
                {
                    ctx.moveTo(newX, newY-0.001);
                    ctx.lineTo(newX, newY);
                }
            }
            else
            {
                ctx.globalCompositeOperation="destination-out";
                ctx.strokeStyle = color;
                ctx.lineWidth = thickness * 3;
                ctx.lineJoin = "round";
                ctx.moveTo(newX, newY-0.001);
                ctx.lineTo(newX, newY);
            }
            ctx.closePath();
            ctx.stroke();
            flag = true;
        }
        if (res == 'up')
        {
            flag = false;
            if(highlight_on)
            {
                doodle();
            }
        }

        if (res == "out")
        {
            flag = false;
        }

        if (res == 'move')
        {
            if (flag)
            {
                if(highlight_on)
                {
                    newX = e.pageX - canvas.offsetLeft;
                    newY = e.pageY - canvas.offsetTop;
                }
                else
                {
                    oldX = newX;
                    oldY = newY;
                    newX = e.pageX - canvas.offsetLeft;
                    newY = e.pageY - canvas.offsetTop;
                    doodle();
                }
            }
        }
    }
}