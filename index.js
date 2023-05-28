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
var gameoverGif = "cats";
var thegrid;

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

var color = {
  1: ".green",
  2: ".red",
  3: ".yellow",
  4: ".blue",
};

async function nextSequence() {
  $("img").remove();
  $(".grid").show();
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
        button.animate({ height: "+=1rem", width: "+=1rem", margin: "-=0.5rem", opacity: 1 }, zoomDuration, resolve);
      });
    }
    function anim2(button) {
      return new Promise((resolve) => {
        button.animate(
          { height: "-=1rem", width: "-=1rem", margin: "+=0.5rem", opacity: startOpacity },
          zoomDuration,
          resolve
        );
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
      await animateButton($(color[sequence[i]]));
      await delay(movePauseDuration);
    }
    enableClick("all");

    await enableOpacity();
    setTimeout(resolve, sequencePauseDuration);
  });
}

function checkAnswer(buttonID) {
  var correctColor = color[sequence[pos]].slice(1, color[sequence[pos].length]);
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
  var audio = new Audio("sounds/" + sound + ".mp3");
  audio.play();
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
    const gifUrl = await getGif(gameoverGif);
    console.log(gifUrl); // Use the retrieved URL here
    // $(".interact").prepend("<img src='" + gifUrl + "' alt='" + gameoverGif + "'>");
    thegrid = $(".grid");
    $(".grid").hide();
    $(".grid").after("<img src='" + gifUrl + "' alt='" + gameoverGif + "'>");
    setImageBorderRadius();
  } catch (error) {
    console.error(error); // Handle any errors that occurred during the API call
  }

  $("body").addClass("gameover");
  for (var i = 1; i <= 8; i++) {
    playSound("wrong" + i);
  }
  started = false;
  sequence = [];
  pos = 0;
  enableClick($(".button-play"));
}

function getGif(subject) {
  return new Promise((resolve, reject) => {
    // shortcut to save api calls
    // resolve("https://media4.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif");
    var xhr = $.get(
      "https://api.giphy.com/v1/gifs/random?api_key=UceyF9wYKaOa36QGezD5vZL30ipvMkKU&rating=r&lang=en&tag=" + searchTerm
    );
    xhr.done(function (data) {
      const gifs = data;
      const url = data.data[0].images.original.url;
      resolve(url);
    });
    xhr.fail(function (error) {
      reject(error);
    });
  });
}
