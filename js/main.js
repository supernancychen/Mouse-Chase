var mouseTotal = 0;
var catTotal = 0;
var endScore = 5;

var countDefault = 5;
var mouseWidth = 30;
var catWidth = 80;

var count;
var isCounting;
var frame;
var controller = new Leap.Controller();
var x;
var y;
var resettingGame = false;

var backgroundColors = ['#0088ce', '#5daa00', '#de3950', 'f2c52c'];

var timer = setInterval(function(){
  if(isCounting) {
    count--;
    $("#count").html(count);
  }
  if(count === 0) {
    reset(true);  // mouse won
  }
}, 1000);

$(document).on('mousemove', function(e){
    $('#mouse').css({
       left:  e.pageX,
       top:   e.pageY
    });
});

// press spacebar to start a round
$(document).keyup(function(evt) {
  if (evt.keyCode == 32 && !isCounting) {
    $('body').css('background-image', 'none');
    if(resettingGame) {
      resettingGame = false;
      resetGame();
    }
    else {
      isCounting = true;
      $("#message").html("");
      $("#count").html(countDefault);
      $('#count').show();
      $("#instruction").hide();
    }
  }
})

function resetGame() {
  $('#instruction').css('margin-top','0').show();
  $('#firstTime').show();
  mouseTotal = 0;
  catTotal = 0;
  catWidth = 80;
  $('#mouseScore').empty();
  $('#catScore').empty();
  $('body').css('background-color', backgroundColors[Math.floor((Math.random() * 4))]);
}

/*  
  The leapToScene function takes a position in leap space 
  and converts it to the space in the canvas.
  
  It does this by using the interaction box, in order to 
  make sure that every part of the canvas is accesible 
  in the interaction area of the leap
*/

function leapToScene (leapPos){

  var iBox = frame.interactionBox;

  var left = iBox.center[0] - iBox.size[0]/2;
  var top = iBox.center[1] + iBox.size[1]/2;

  var x = leapPos[0] - left;
  var y = leapPos[1] - top;

  x /= iBox.size[0];
  y /= iBox.size[1];

  x *= window.innerWidth;
  y *= window.innerHeight;

  return [ x , -y ];
}

function reset (mouseWon) {
  count = countDefault;
  isCounting = false;

  if(mouseWon === undefined) {
    $('#mouse').width(mouseWidth);
    $('#hand').width(catWidth);
  }
  else {
    if(mouseWon) {
      $('body').css('background-image', 'url(img/mouse.png)');
      catWidth += 20;
      mouseTotal++;
      $('#mouseScore').append("<img src='img/mouse.png' width='14px' style='padding: 0 3px;'/>");
      if(mouseTotal === endScore) {
        $('body').css('background-repeat', 'repeat');
        resettingGame = true;        
      }
      else
        $('body').css('background-repeat', 'no-repeat'); 
    }
    else {
      $('body').css('background-image', 'url(img/cat.png)');
      catWidth -= 20;
      catTotal++;
      if(catWidth <= 0) catWidth = 20;
      
      $('#catScore').append("<img src='img/cat.png' width='20px'/>");
      if(catTotal === endScore) {
        $('body').css('background-repeat', 'repeat');
        resettingGame = true;
      }
      else
        $('body').css('background-repeat', 'no-repeat'); 
    }
    $('#count').hide();
    $('#instruction').show();
    $('#firstTime').hide();
    $('#instruction').css('margin-top','300px');
    $('#mouse').width(mouseWidth);
    $('#hand').width(catWidth);
  }
}

reset();

controller.on( 'frame' , function(f){
    frame = f;

    if(frame.hands.length >= 1) {
        $('#hand').show();
        var hand = frame.hands[0];

        var pos = leapToScene(hand.palmPosition);
        $('#hand').css({
           left:  pos[0],
           top:   pos[1]
        });
    }
    else {
      $('#hand').hide();
    }

    if(isCounting) {
      var hit_list = $("#hand").collision("#mouse");
      if (hit_list.length != 0) {
        reset(false); // cat won
      }
    }
});
controller.connect();
