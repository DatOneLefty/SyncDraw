var drawio = [];
var cache = [];

var socket = io();

var pos = new Object();

function get(name){
if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
  return decodeURIComponent(name[1]);
}
if (get("delay") == null) {
 delay = 250;
} else {
 delay = get("delay");
}
if (get("chunk") == null) {
pos.x = 0;
pos.y = 0;
} else {
    var ch = get("chunk").split(',');
 pos.x = ch[0];
 pos.y = ch[1];

cverify();
}

if (get("share") == null) {
    var rrid = 0;
} else {
 var rrid = get("share");
 drawio = drawio.concat([["GS", rrid, pos.x, pos.y]]);
}
function cverify() {
  if (pos.x >= 100 || pos.y >= 100){
    document.getElementById("cinfo").innerHTML = "<font color='red'>This chunk will not show up on the Active Chunks list</font>";
  }
}
var port = window.location.port;
if (port == "" || port == 0) {
    port = "";
} else {
    port = ":" + port;
}
document.getElementById("cx").innerHTML = pos.x;
document.getElementById("cy").innerHTML = pos.y;
pos.x = document.getElementById("x").value = pos.x;
pos.y = document.getElementById("y").value = pos.y;

    document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname + port + "?chunk=" + pos.x + "," + pos.y;
function move() {
  pos.x = document.getElementById("x").value;
  pos.y = document.getElementById("y").value;
    document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname+ port + "?chunk=" + pos.x + "," + pos.y;
  reset();
  socket.emit("reqData", [pos.x,pos.y]);
  document.getElementById("cx").innerHTML =  pos.x;
  document.getElementById("cy").innerHTML =  pos.y;
cverify();
}
window.setInterval(function(){
socket.emit("writeData", drawio);
    drawio = [];
        socket.emit("reqData", [pos.x,pos.y]);


}, delay);

var codeIsPublic = false;


window.setInterval(function(){
       if (codeIsPublic == true) {
          socket.emit("shareCode", [shuuid, pos.x, pos.y, true]);
       } else {
           socket.emit("shareCode", [shuuid, pos.x, pos.y, false]);
       }
}, 1000);


function toggleCode() {
  if (codeIsPublic == false) {
    codeIsPublic = true;
    document.getElementById("public").innerHTML = "PUBLIC";
    document.getElementById("public").style.color = "green";
  } else {
    codeIsPublic = false;
    document.getElementById("public").innerHTML = "PRIVATE";
    document.getElementById("public").style.color = "red";


  }
}


socket.on("return", function(data) {
    data.forEach(function(write) {
        write = write.split("|");
        if (write[0] == "0") {
        draw(write[1], write[2], write[3], write[4], write[5], write[6]);
        }
        else if(write[0] == "1") {
            if (shuuid == write[1]) {
                drawio = drawio.concat([["XOS", shuuid, document.getElementById("writer").toDataURL("image/jpeg"), pos.x, pos.y]]);            }
        } else if (write[0] == "2") {
            if (rrid != 0) {
                if (rrid == write[2]) {
                 var image = new Image();
                    image.onload = function() {
                    ctx.drawImage(image, 0, 0);
                    };
                image.src = write[1];
                }
            }
        }

         else {
        }
    });
});

function draw(x1,y1, x2, y2, co, s) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth=s;
      ctx.strokeStyle = co;
      ctx.stroke();
}

socket.on("online", function(data) {
      var x = "";
  data.forEach(function(element) {
      if (element[0] == 0) {
    var p = "";
    if (pos.x == element[1] && pos.y == element[2]) {
      p = "(you) ";
    }
    x += p + " <a href='?chunk=" + element[1] + "," + element[2] + "'>" + element[1] + ", " + element[2] + "</a><br>";
      } else {
          if (element[3] == null) {} else {
              if (element[3] == shuuid) {
              var p = "(you) ";
              } else {
              var p = "";

              }
            x += p +" <a onclick='restoreFromClick("+ element[3] + "," + element[1] + "," + element[2] +");'>"+ element[1] + ", " + element[2] + " (" + element[3] + ")</a><br>";
          }
      }
      });
   document.getElementById("use").innerHTML = x;

});
var color = "#000000";
function scolor() {
  if (validTextColor("#" + document.getElementById("c").value)) {
    color = "#" + document.getElementById("c").value;
  } else {
    alert("Invalid color");
  }
}

function restoreFromClick(code,x,y) {
  document.getElementById("x").value = x;
  document.getElementById("y").value = y;
  move();
    rrid = code;
    drawio = drawio.concat([['GS', rrid, pos.x, pos.y]]);
}

var mouseDown = false;
document.body.onmousedown = function() {
mouseDown = true;

}
document.body.onmouseup = function() {
mouseDown = false;
lx = 0;
ly = 0;
}

var canvas, ctx;
canvas = document.getElementById("writer");

canvas.ontouchstart = function(e) {
if (e.touches) e = e.touches[0];
return false;
}


canvas.height = 1000;
canvas.width = 1000;

ctx = canvas.getContext("2d");
function reset() {
ctx.beginPath();
ctx.rect(0, 0, 1000, 1000);
ctx.fillStyle = "white";
ctx.fill();
ctx.fillStyle = "black";
}
ctx.beginPath();
ctx.rect(0, 0, 1000, 1000);
ctx.fillStyle = "white";
ctx.fill();



ctx.fillStyle = "black";




function getMousePos(canvas, evt) {
var rect = canvas.getBoundingClientRect();
return {
x: evt.clientX - rect.left,
y: evt.clientY - rect.top
};
}
var lx = 0;
var ly = 0;


canvas.addEventListener('mousemove', function(evt) {
var mousePos = getMousePos(canvas, evt);
if (mouseDown) {
if (lx == 0 && ly == 0) {
    draw(mousePos.x, mousePos.y, mousePos.x, mousePos.y, color, size);
  drawio = drawio.concat([[pos.x,pos.y,mousePos.x, mousePos.y, mousePos.x, mousePos.y, color, size]]);

} else {
  drawio = drawio.concat([[pos.x,pos.y,lx, ly, mousePos.x, mousePos.y, color, size]]);
    draw(lx, ly, mousePos.x, mousePos.y, color, size);
}

lx = mousePos.x;
ly = mousePos.y;
}

}, false);

var startx = 0;
var starty = 0;
canvas.addEventListener('touchstart', function(e) {
var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
startx = parseInt(touchobj.clientX - rect.left);
starty = parseInt(touchobj.clientY - rect.top);
e.preventDefault()
}, false)

canvas.addEventListener('touchmove', function(e) {
var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
if (touchobj.clientX - rect.left > 1000 || touchobj.clientX - rect.left < 0 || touchobj.clientY - rect.top < 0 || touchobj.clientY - rect.top > 1000) {} else {
if (startx == 0 && starty == 0) {
draw(touchobj.clientX - rect.left, touchobj.clientY - rect.top, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color, size);
drawio = drawio.concat([[pos.x,pos.y,Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), Math.round(touchobj.clientX), Math.round(touchobj.clientY), color, size]]);

} else {
draw(startx, starty, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color, size);
drawio = drawio.concat([[pos.x,pos.y,Math.round(startx), Math.round(starty), Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), color, size]]);

}
startx = touchobj.clientX - rect.left;
starty = touchobj.clientY - rect.top;

}

e.preventDefault()
}, false)


canvas.addEventListener('touchend', function(e) {
startx = 0;
starty = 0;
}, false);
        socket.emit("reqData", [pos.x,pos.y]);


        function validTextColor(stringToTest) {
    //Alter the following conditions according to your need.
    if (stringToTest === "") { return false; }
    if (stringToTest === "inherit") { return false; }
    if (stringToTest === "transparent") { return false; }

    var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = stringToTest;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = stringToTest;
    return image.style.color !== "rgb(255, 255, 255)";
}
$("#colorpicker").spectrum({
    color: "#000000",
    change: function(colors) {
    color = colors.toHexString();
}
});

function setSize() {
  size = document.getElementById("size").value;
}
var size = 1;

function get_uuid() {
    if (shuuid == 0) {
socket.emit("get_uuid", [pos.x,pos.y]);
    } else {
    alert("You have already gotten a share id!");
    }
}
var shuuid = 0;
socket.on("rec_uuid", function(id) {
    shuuid = id;
    document.getElementById("ShareCode").innerHTML =  shuuid;
        document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname+ port + "?chunk=" + pos.x + "," + pos.y + "&share=" + shuuid;
});

socket.on("uuid_info", function(ret) {
  if (ret[0] == "no_exist") {
    alert("join code invalid!");
  } else {
  document.getElementById("x").value = ret[0];
  document.getElementById("y").value = ret[1];
  move();
  drawio = drawio.concat([["GS", rrid, pos.x, pos.y]]);
}
});
function sharerestore() {
    reset();
     rrid = document.getElementById("scre").value;
socket.emit("get_uuid_info", rrid);
}


document.getElementById("size").addEventListener('input', function (evt) {
    setSize();
});

get_uuid(); // this makes stuff more automatic and easy
