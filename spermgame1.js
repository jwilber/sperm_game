
let x,y;
let label = '';
let spring = 0.025;
let mainSperm;
let sperm;
let spermObjects = [];
let antiSpermObjects = [];
let spermArray = [];
let condoms;
let video;
let features;
let knn;
let labelP;
let ready = false;
let numImgs = 500;
let numSeconds;

function preload() {
	sperm = loadImage('newsperm2.png');
	condoms = loadImage('900.jpg');
}


function setup() {
	let gameCanvas = createCanvas(windowWidth/1.2, windowHeight * .75);
	gameCanvas.parent("game-container");
	frameRate(30);
	// video = createCapture(VIDEO);
	// video.size(600, 400);
	// video.parent('video-container');

	// main sperm image
	spermArray = duplicateElements([sperm], numImgs);
	console.log(spermArray);
	for (let i = 0; i < numImgs; i++) {
          spermObjects[i] = new SpermCell(
            spermArray[i],
            random(width),
            random(height),
            i,
            spermObjects,
            antiSpermObjects
          );
    };

    antiSpermObjects[0] = new BirthControl(
            condoms,
            random(width),
            random(height),
            1,
            antiSpermObjects,
            2	
    	)



    // load main image after so it's on top
    mainSperm = loadImage('newsperm.png');	
    console.log('mainSperm', mainSperm)
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
	background('#ffecef');
	console.log(label)
	spermObjects.forEach(obj => {
        obj.collide();
        obj.move();
        obj.display();
      });
	antiSpermObjects.forEach(obj => {
		obj.move();
		obj.display();
	})
	numSeconds = frameCount / 30;

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
  // handle birth control overlap case
    for (let i = 0; i < antiSpermObjects.length; i++) {
      // get distance from this node to all oters

      let dx = antiSpermObjects[i].x - x;
      let dy = antiSpermObjects[i].y - y;
      let distance = sqrt(dx * dx + dy * dy);

      // set distance threshold
      let minDist = antiSpermObjects[i].diameter;

      // if collision, bounce off each other
      if (distance < minDist) {
      	alert('Game Over')
      }
    }



}

class SpermCell {

  // set attributes
  constructor(img, xIndex, yIndex, index, others, bc) {
    this.img = img;
    this.x = xIndex;
    this.y = yIndex;
    this.xVelocity = .5;
    this.yVelocity = 1.5;
    this.diameter = 25;
    this.id = index;
    this.others = others;
    this.bc = bc;
    this.dead = false;
  }

  collide() {
  	if (this.dead === true) {
  		// do nothing
  	} else {
  		// handle sperm overlap case
	    for (let i = this.id + 1; i < numImgs; i++) {
	      // get distance from this node to all oters

	      let dx = this.others[i].x - this.x;
	      let dy = this.others[i].y - this.y;
	      let distance = sqrt(dx * dx + dy * dy);

	      // set distance threshold
	      let minDist = this.diameter;

	      // if collision, bounce off each other
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
	        // this.dead = true;
	      }
	    }
	    // handle birth control overlap case
	    for (let i = 0; i < antiSpermObjects.length; i++) {
	      // get distance from this node to all oters

	      let dx = this.bc[i].x - this.x;
	      let dy = this.bc[i].y - this.y;
	      let distance = sqrt(dx * dx + dy * dy);

	      // set distance threshold
	      let minDist = this.bc[i].diameter;

	      // if collision, bounce off each other
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
	        this.dead = true;
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


class BirthControl {
  // set attributes
  constructor(img, xIndex, yIndex, index, others, delay) {
    this.img = img;
    this.x = xIndex;
    this.y = yIndex;
    this.xVelocity = 5;
    this.yVelocity = 1.5;
    this.diameter = 25;
    this.delay = delay;
    this.id = index;
    this.others = others;
    this.dead = false;
  }

  collide() {
 
  }

  move() {
  	if (numSeconds < this.delay) {
  		// dont do nothing
  		this.x = -50;
  		this.y = -50;
  	} else {
	  	// move anti-sperm element in random manner thruout the canvas
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
  	// show sperm cell
  	if (numSeconds < this.delay) {
  		// dont do nothing
  	} else {
	  	image(this.img, this.x, this.y, 100, 100); 	
  	}
  }

}



// give class an attribute name,
// make array of images, or names, (or just reuse image name)
//  