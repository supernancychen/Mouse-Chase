// visuals
var mouseWidth = 30;
var catWidth = 80;
var backgroundColors = ['#0088ce', '#5daa00', '#de3950', '#f2c52c', 'black', '#cccccc'];

// scores
var mouseTotal = 0;
var catTotal = 0;
var endScore = 5;
var resettingGame = false;

// timer
var timerCountDefault = 5;
var timerCount;
var isCounting;

// leap
var frame;
var controller = new Leap.Controller();
var x;
var y;


// Countdown timer function
var timer = setInterval(function(){
  if(isCounting) {
    timerCount--;
    $("#timerCount").html(timerCount);
  }
  if(timerCount === 0) {
    endRound(true);  // mouse won
  }
}, 1000);

// Handle spacebar event
$(document).keyup(function(evt) {
  // press spacebar when not in the middle of a round
  if (evt.keyCode == 32 && !isCounting) {
    $('body').css('background-image', 'none');

    // if score gets to 5, reset game
    if(resettingGame) {
      resetGame();
    }
    else { // otherwise just restart the round
      isCounting = true;
      $("#message").html("");
      $("#timerCount").html(timerCountDefault);
      $('#timerCount').show();
      $("#instruction").hide();
    }
  }
})

// Reset game when someone scores 5 points
function resetGame() {
  resettingGame = false;
  $('#instruction').css('margin-top','0').show();
  $('#firstTime').show();
  mouseTotal = 0;
  catTotal = 0;
  catWidth = 80;
  $('#mouseScore').empty();
  $('#catScore').empty();
  $('body').css('background-color', backgroundColors[Math.floor((Math.random() * 6))]);
}

// End a quick round and see who wins
function endRound (mouseWon) {
  timerCount = timerCountDefault;
  isCounting = false;

  if(mouseWon === undefined) {
    $('#mouse').width(mouseWidth);
    $('#cat').width(catWidth);
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
    $('#timerCount').hide();
    $('#firstTime').hide();
    $('#instruction').css('margin-top','300px');
    $('#mouse').width(mouseWidth);
    $('#cat').width(catWidth);
    if(!resettingGame) {
      $('#instruction').show();
    }
  }
}

endRound();

// move mouse curser with mouse position
$(document).on('mousemove', function(e){
    $('#mouse').css({
       left:  e.pageX,
       top:   e.pageY
    });
});

// Takes a position in leap space and convert it to canvas space. 
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

// Move cat with Leap
controller.on( 'frame' , function(f){
    frame = f;

    if(frame.hands.length >= 1) {
        $('#cat').show();
        var hand = frame.hands[0];

        var pos = leapToScene(hand.palmPosition);
        $('#cat').css({
           left:  pos[0],
           top:   pos[1]
        });
    }
    else {
      $('#cat').hide();
    }

    if(isCounting) {
      var hit_list = $("#cat").collision("#mouse");
      if (hit_list.length != 0) {
        endRound(false); // cat won
      }
    }
});
controller.connect();
