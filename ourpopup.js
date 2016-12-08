/*
    This is the main component of the Chrome Extension
    All of the interface and the methods are in thie .js file
*/

// this checks if the elements already exists on the document (exit if extension is clicked again)
if (document.getElementById('can') && document.getElementById('draggable'))
{
    exit();
}  
else
{
    // Most of the variables that we will need
    var ctx, flag, erase_on, highlight_on, stop = false,
        oldX, oldY, newX, newY = 0;

    // The two main bodies: canvas and the popup
    var canvas = document.createElement("canvas"),
        popup = document.createElement("div");

    canvas.id = "can";
    popup.id = "draggable";

    // Add the two components to the body
    document.body.appendChild(canvas);
    document.body.appendChild(popup);

    // the actual CSS for how the popup will look
    $("#drawingCanvas").append('</canvas>');
    $("#draggable").append('<div>Web Doodle</div><a id="draw_icon"><img id="draw_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="erase_icon"><img id="erase_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="highlight_icon"><img id="highlight_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="save_icon"><img id="save_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="clear_icon"><img id="clear_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><a id="exit_icon"><img id="exit_iconImg" class="buttons" style="padding:0px" width="50px" height="50px"></img></a><input type="hidden" name="color" id="color"><input type="hidden" name = "thickness" id="thickness">');

    // online storage for preferences (color and thickness)
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

    // Get the icons via Chrome
    document.getElementById("draw_iconImg").src=chrome.extension.getURL("draw_icon.png");
    document.getElementById("erase_iconImg").src=chrome.extension.getURL("erase_icon.png");
    document.getElementById("highlight_iconImg").src=chrome.extension.getURL("highlight_icon.png");
    document.getElementById("save_iconImg").src=chrome.extension.getURL("save_icon.png");
    document.getElementById("clear_iconImg").src=chrome.extension.getURL("clear_icon.png");
    document.getElementById("exit_iconImg").src=chrome.extension.getURL("exit_icon.png");

    // when clicked, go to these functions
    $("#highlight_icon").click(highlight);
    $("#draw_icon").click(draw);
    $("#erase_icon").click(erase);
    $("#clear_icon").click(clear);
    $("#exit_icon").click(exit);
    $("#save_icon").click(saver);

    // create buttons as one object
    var buttons = document.getElementsByClassName("buttons");
    
    // Customize the style of all the icons
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

    // Customize the style of the popup
    with(popup.style)
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

    // Canvas is transparent and covers the entire HTML
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

    if($(document).height() > 32767) {
      alert("Sorry! Too long for Web Doodle!");
      exit();
    }
    // Find the width and height of the canvas
    canvas.width = document.body.clientWidth;
    canvas.height = $(document).height();

    // ctx will be used for drawing on the webpage
    ctx = canvas.getContext("2d");
    var fromTop = document.body.scrollTop || document.documentElement.scrollTop;
    popup.style.top = fromTop + "px";

    w = canvas.width;
    h = canvas.height;

    window.onscroll = function() {
      if (!stop) {
        if($(document).height() > 32767) {
            alert("Sorry! Too long for Web Doodle!");
            exit();
            }
        }
        // Makes sure that the height of the document always matches the canvas's
        if($(document).height() != document.getElementById('can').height) {
          var save = ctx.getImageData(0, 0, document.body.clientWidth, $(document).height());
          document.getElementById('can').width = document.body.clientWidth;
          document.getElementById('can').height = $(document).height();
          w = document.getElementById('can').width;
          h = document.getElementById('can').height;
          ctx.putImageData(save, 0, 0);
        }
        var fromTop = document.body.scrollTop || document.documentElement.scrollTop;
        popup.style.top = fromTop + "px";
      }
    };

    // Four eventlisteners based on the mouse actions
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

    // Function to save the page 
    function saver(){
      chrome.runtime.sendMessage({directive: "popup-click"});
    }

    // Function to draw
    function doodle()
    {
        ctx.beginPath();
        // If in eraser mode
        if(erase_on)
        {
            // Destination out cancels out previous graphics
            ctx.globalCompositeOperation="destination-out";
            ctx.globalAlpha = 1;
            ctx.lineWidth = 40;
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            ctx.moveTo(oldX, oldY);
            ctx.lineTo(newX, newY);
            ctx.closePath();
            ctx.stroke();
        }
        // If in drawing mode
        else
        {
            // Source over can draw over previous graphics
            ctx.globalCompositeOperation="source-over";
            // Highlighting
            if(highlight_on)
            {
                ctx.lineWidth = 20;
                ctx.strokeStyle = "YELLOW";
                ctx.globalAlpha = 0.35;
                ctx.moveTo(oldX, oldY)
                ctx.lineTo(newX, newY);
                ctx.closePath();
                ctx.stroke();
            }
            // Using the actual pen
            else
            {
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
    

    // erase is off and highlight is off, default is to draw, draw button is toggled
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

    // erase is on and highlight is off, erase button is toggled
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

    // erase is off and highlight is on, highlight button is toggled
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

    // the entire canvas from x:0 y:0 to x:w y:h is cleared, clear button is toggled
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

    // exit doodle is stopped, all eventlisteners are removed
    // canvas and draggable is also removed
    function exit()
    {
        stop = true;
        canvas.removeEventListener("mousemove", false);
        canvas.removeEventListener("mousedown", false);
        canvas.removeEventListener("mouseup", false);
        canvas.removeEventListener("mouseout", false);
        document.getElementById('can').remove();
        document.getElementById('draggable').remove();
    }

    // function to figure out where the mouse is and what action it is
    function findxy(res, e)
    {
        if (res == 'down')
        {
            if(highlight_on)
            {
                // Find the current X and Y position based on the canvas
                newX = e.pageX - canvas.offsetLeft;
                newY = e.pageY - canvas.offsetTop;
            }
            oldX = newX;
            oldY = newY;
            newX = e.pageX - canvas.offsetLeft;
            newY = e.pageY - canvas.offsetTop;

            // get the thickness and color
            var thickness = document.getElementById("thickness").value;
            var color = document.getElementById("color").value;
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineJoin = "round";
            
            if(!erase_on)
            {
                ctx.globalCompositeOperation="source-over";
                ctx.lineWidth = thickness;
            }
            else
            {
                ctx.globalCompositeOperation="destination-out";
            }
            ctx.closePath();
            ctx.stroke();
            flag = true;
        }

        // if mouse is up, it stops drawing, or creates highlight
        if (res == 'up')
        {
            flag = false;
            if(highlight_on)
            {
                doodle();
            }
        }

        // if mouse is out of the webpage, it stops drawing
        if (res == "out")
        {
            flag = false;
        }

        // if mouse is moving, continue to draw and get new coordinates
        if (res == 'move')
        {
            if (flag)
            {
                // If highlighting, only track the initial movement
                if(highlight_on)
                {
                    newX = e.pageX - canvas.offsetLeft;
                    newY = e.pageY - canvas.offsetTop;
                }
                // If drawing, continuously track movement to draw
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