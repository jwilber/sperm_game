
let x,y;
let label = '';
let spring = 0.025;
let mainSperm;
let sperm1, sperm2;
let sperms = [];

let video;
let features;
let knn;
let labelP;
let ready = false;
let numImgs = 250;

function preload() {
	sperm2 = loadImage('newsperm2.png');
	console.log('sperm2', sperm2)
}


function setup() {
	let gameCanvas = createCanvas(800, 400);
	gameCanvas.parent("game-container");
	video = createCapture(VIDEO);
	video.size(600, 400);
	video.parent('video-container');

	// main sperm image
	let imgArray = duplicateElements([sperm2], numImgs);
	console.log(imgArray);
	for (let i = 0; i < numImgs; i++) {
          sperms[i] = new SpermCell(
            imgArray[i],
            random(width),
            random(height),
            random(30, 70),
            i,
            sperms
          );
        }

    // load main image after so it's on top
    mainSperm = loadImage('newsperm.png');	

	// video.hide();
	features = ml5.featureExtractor("MobileNet", modelReady);
	// knn = ml5.KNNClassifier();
	// labelP = createP("needs training data");
	// labelP.style('font-size', '3rem')
	// labelP.style('font-family', 'Arial')

	x = width / 2;
	y = height / 2;

}

function goClassify() {
	const logits = features.infer(video);
	knn.classify(logits, gotResult);

}

function gotResult(error, result) {
	if (error) {
		console.log(error)
	} else {
		label = result.label;
		// labelP.html(result.label);	
		goClassify();	
	}
}


function keyPressed() {
	const logits = features.infer(video);
	if (key == 'l') {
		knn.addExample(logits, "left")		
	} else if (key == 'r') {
		knn.addExample(logits, "right")		
	} else if (key == 'u') {
		knn.addExample(logits, "down")		
	} else if (key == 'd') {
		knn.addExample(logits, "up")		
	} else if (key == 'd') {
		knn.save('model.json');
	}
}

function modelReady() {
	console.log("MobileNet ready");
	knn = ml5.KNNClassifier();
	knn.load('model.json', function() {
		console.log('KNN Ready')
		goClassify();
	});
}


function draw() {
	background('#ffd9df');
	console.log(label)
	sperms.forEach(jared => {
        jared.collide();
        jared.move();
        jared.display();
      });
	image(mainSperm, x, y, 40, 80);

	// if (label == 'left') {
	// 	if (x > 0) {
	// 		x = x - 4;
	// 	}
	// } else if (label == 'right') {
	// 	  if (x < width) {
	// 			x = x + 4;
	// 	  }
	// } else if (label == 'up') {
	// 	if (y > 0) {
	// 		y = y - 4;
	// 	}
	// } else if (label == 'down') {
	// 	if (y < height) {
	// 		y = y + 4;
	// 	}

	// }
	if (keyIsDown(LEFT_ARROW)) {
		if ( x > 0) {
	    x = x - 6;			
		}
  } else if (keyIsDown(RIGHT_ARROW)) {
    if (x < width - 40) {
	    x = x + 6;
    }
  } else if (keyIsDown(UP_ARROW)) {
  	if (y > 3) {
	  	y = y - 6;  		
  	}
  } else if (keyIsDown(DOWN_ARROW)) {
  	if (y < height - 55) {
	   y = y + 6;
		}
  }



}

class SpermCell {

  // set attributes
  constructor(img, xIndex, yIndex, din, idin, oin) {
    this.img = img;
    this.x = xIndex;
    this.y = yIndex;
    this.xVelocity = .5;
    this.yVelocity = 1.5;
    this.diameter = 25;
    this.id = idin;
    this.others = oin;
    this.dead = false;
  }

  collide() {
  	if (this.dead === true) {
  		// do nothing
  	} else {
	    for (let i = this.id + 1; i < numImgs; i++) {
	      let dx = this.others[i].x - this.x;
	      let dy = this.others[i].y - this.y;
	      let distance = sqrt(dx * dx + dy * dy);
	      let minDist = this.others[i].diameter / 2 + this.diameter / 2;
	      if (distance < minDist) {
	        let angle = atan2(dy, dx);
	        let targetX = this.x + cos(angle) * minDist;
	        let targetY = this.y + sin(angle) * minDist;
	        let ax = (targetX - this.others[i].x) * spring;
	        let ay = (targetY - this.others[i].y) * spring;
	        this.xVelocity -= ax;
	        this.yVelocity -= ay;
	        this.others[i].xVelocity += ax;
	        this.others[i].yVelocity += ay;
	        console.log(this)
	        // this.dead = true;
	      }
	    }
  	}
  }

  move() {
    // move 
    if (this.dead === true) {
    	// pass
    	// this.x = 0;
    	// this.y = 0;
    } else {
		this.x += this.xVelocity;
	    this.y += this.yVelocity;

	    // take care of edge collisions
	    if (this.x + this.diameter / 2 > width) {
	      this.x = width - this.diameter / 2;
	      this.xVelocity *= -1;
	    } else if (this.x - this.diameter / 2 < 0) {
	      this.x = this.diameter / 2;
	      this.xVelocity *= -1;
	    }
	    if (this.y + this.diameter / 2 > height) {
	      this.y = height - this.diameter / 2;
	      this.yVelocity *= -1;
	    } else if (this.y < 0) {
	      this.y = this.diameter / 2;
	      this.yVelocity *= -1;
	    }
    }
  }

  display() {
  	if (this.dead === true) {
  		// do nothing
  		image(this.img, -10, -10, 3, 10);
  	} else {
	    image(this.img, this.x, this.y, 7.5, 30);  		
  	}
  }
}




function duplicateElements(array, times) {
  return array.reduce((res, current) => {
      return res.concat(Array(times).fill(current));
  }, []);
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
    function(e){
        keys[e.keyCode] = false;
    },
false);