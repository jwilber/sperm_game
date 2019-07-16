// use to create n sperm cells
const duplicateElements = (array, times) => {
  return array.reduce((result, current) => {
      return result.concat(Array(times).fill(current));
  }, []);
}


// fisher-yates shuffle
function shuffle(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

// Ensure scrolling only affects canvas, not page
var keys = {};
window.addEventListener("keydown",
    function(e){
        keys[e.keyCode] = true;
        switch(e.keyCode){
            case 37: case 39: case 38:  case 40: // Arrow keys
            case 32: e.preventDefault(); break; // Space
            default: break; // do not block other keys
        }
    },
false);
window.addEventListener('keyup',
    function(e) {
        keys[e.keyCode] = false;
    },
false);


// custom alert button for game over
// (https://stackoverflow.com/questions/7853130/how-to-change-the-style-of-alert-box)
var ALERT_TITLE = "GAME OVER";
var ALERT_BUTTON_TEXT = "REPLAY";

if(document.getElementById) {
    window.alert = function(txt) {
        createCustomAlert(txt);
    }
}

function createCustomAlert(txt) {
  d = document;

  if(d.getElementById("modalContainer")) return;

  mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
  mObj.id = "modalContainer";
  mObj.style.height = d.documentElement.scrollHeight + "px";

  alertObj = mObj.appendChild(d.createElement("div"));
  alertObj.id = "alertBox";
  if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
  alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";
  alertObj.style.visiblity="visible";

  h1 = alertObj.appendChild(d.createElement("h1"));
  h1.class = "testClass"
  h1.appendChild(d.createTextNode(ALERT_TITLE));

  msg = alertObj.appendChild(d.createElement("p"));
  msg.innerHTML = txt;

  btn = alertObj.appendChild(d.createElement("a"));
  btn.id = "closeBtn";
  btn.appendChild(d.createTextNode(ALERT_BUTTON_TEXT));
  btn.href = "#";
  btn.focus();
  noLoop();
  btn.onclick = function() { removeCustomAlert(); loop(); return false; }

  alertObj.style.display = "block";

}

function removeCustomAlert() {
  document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}
