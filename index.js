var lost = false;
var sequenceLength = 1;
var sequence = [];
var pos = 0;
var zoomDuration = 100;
var fadeDurarion = 100;
var sequencePauseDuration = 300;
var movePauseDuration = 100;
var started = false;
var h1 = "<h1>i want to play a game :)</h1>";
var gifTags = "cat";
var apiKey = "UceyF9wYKaOa36QGezD5vZL30ipvMkKU";
var debugData;
var audio = [];
var gifUrl;
var animAllowed = true;

// when buttons are clicked
$(".box").on("click", async function (event) {
  if (started) {
    checkAnswer($(this).attr("id"));
  }
  await animateButton($(this));
});

// PLAY button
$("button").on("mouseenter", function () {
  $(this).addClass("button-mouseover");
  var className = $(this).classList;
});
$("button").on("mouseleave", function () {
  $(this).removeClass("button-mouseover");
});
$("button").on("click", function () {
  started = true;
  disableClick($(".button-play"));
  $("#punkte").text(0);
  nextSequence();
});

var toColor = {
  1: ".green",
  2: ".red",
  3: ".yellow",
  4: ".blue",
};

var toIndex = {
  green: 0,
  red: 1,
  yellow: 2,
  blue: 3,
};

function allowAnimation() {
  animAllowed = true;
}

function dontAllowAnimation(callback) {
  animAllowed = false;
  callback();
}

function showGrid(callback) {
  $(".grid").show();
  callback();
}

function hideGrid() {
  $(".grid").hide();
}

async function nextSequence() {
  gifUrl = await getRandomGif(gifTags);
  console.log(gifUrl);
  $("img").remove();
  showGrid(allowAnimation);
  $(".interact").html(h1);
  $("h1").addClass("font");
  $("body").removeClass("gameover");
  $("h1").removeClass("gameover");
  extendSequence();
  $("h1").text("watch");
  await delay(500);
  await playSequence();
  $("h1").text("now repeat :)");
}

function extendSequence() {
  sequence.push(Math.floor(Math.random() * 4) + 1);
}

// Function to animate a button
function animateButton(button) {
  var color = $(button).attr("id");
  playSound(color);
  return new Promise(async (resolve) => {
    var startOpacity = button.css("opacity");
    // Perform the first animation on the button
    function anim1(button) {
      return new Promise((resolve) => {
        if (animAllowed) {
          button.animate({ height: "+=1rem", width: "+=1rem", margin: "-=0.5rem", opacity: 1 }, zoomDuration, resolve);
        }
      });
    }
    function anim2(button) {
      return new Promise((resolve) => {
        if (animAllowed) {
          button.animate(
            { height: "-=1rem", width: "-=1rem", margin: "+=0.5rem", opacity: startOpacity },
            zoomDuration,
            resolve
          );
        }
      });
    }

    // Execute
    await anim1(button);
    await anim2(button);
    setTimeout(resolve, 200);
  });
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function playSequence() {
  function enableOpacity() {
    return new Promise((resolve) => {
      $(".box").animate({ opacity: 1 }, fadeDurarion, resolve);
    });
  }
  function disableOpacity() {
    return new Promise((resolve) => {
      $(".box").animate({ opacity: 0.5 }, fadeDurarion, resolve);
    });
  }

  disableClick("all");
  await disableOpacity();
  await delay(sequencePauseDuration);
  return new Promise(async (resolve) => {
    for (var i = 0; i < sequence.length; i++) {
      await animateButton($(toColor[sequence[i]]));
      await delay(movePauseDuration);
    }
    enableClick("all");

    await enableOpacity();
    setTimeout(resolve, sequencePauseDuration);
  });
}

function checkAnswer(buttonID) {
  var correctColor = toColor[sequence[pos]].slice(1, toColor[sequence[pos].length]);
  if (buttonID !== correctColor) {
    gameover();
    return;
  }
  pos += 1;
  if (pos === sequence.length) {
    var punkte = $("#punkte").text();
    $("#punkte").text(++punkte);
    nextSequence();
    pos = 0;
  }
  playSound(buttonID);
  return;
}

function playSound(sound) {
  audio[toIndex[sound]].currentTime = 0;
  audio[toIndex[sound]].play();
}

function playWrong() {
  for (var i = 4; i < 12; i++) {
    audio[i].currentTime = 0;
    audio[i].play();
  }
}

function enableClick(button) {
  if (button === "all") {
    $(".box").removeClass("button-disabled");
  } else {
    $(button).removeClass("button-disabled");
  }
}

function disableClick(button) {
  if (button === "all") {
    $(".box").addClass("button-disabled");
  } else {
    $(button).addClass("button-disabled");
  }
}

async function gameover() {
  try {
    $("h1").text("game over 🥺");
    // $(".interact").prepend("<img src='" + gifUrl + "' alt='" + gifTags + "'>");
    dontAllowAnimation(hideGrid);
    $(".grid").after("<img src='" + gifUrl + "' alt='" + gifTags + "'>");
  } catch (error) {
    console.error(error); // Handle any errors that occurred during the API call
  }

  $("body").addClass("gameover");
  playWrong();
  started = false;
  sequence = [];
  pos = 0;
  enableClick($(".button-play"));
}

function getRandomGif(searchTerm) {
  return new Promise((resolve, reject) => {
    // shortcut to save api calls
    // resolve("https://media4.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif");
    var xhr = $.get(
      "https://api.giphy.com/v1/gifs/random?api_key=UceyF9wYKaOa36QGezD5vZL30ipvMkKU&tag=" + searchTerm + "&rating=g"
    );
    xhr.done(function (data) {
      debugData = data;
      const gifUrl = data.data.images.downsized_medium.url;
      resolve(gifUrl);
    });
    xhr.fail(function (error) {
      reject(error);
    });
  });
}
$(document).ready(async function () {
  audio.push(new Audio("sounds/green.mp3"));
  audio.push(new Audio("sounds/red.mp3"));
  audio.push(new Audio("sounds/yellow.mp3"));
  audio.push(new Audio("sounds/blue.mp3"));
  for (var i = 1; i <= 8; i++) {
    audio.push(new Audio("sounds/wrong" + i + ".mp3"));
  }
});
