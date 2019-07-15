
let x, y;
let facePosition = '';
let spring = 0.025;
let mainSperm;
let sperm;
let spermObjects = [];
let antiSpermObjects = [];
let spermArray = [];
let condoms;
let video;
let ready = false;
let numImgs = 200;
let numSeconds;
let prevNumSeconds = 0;

let w,h;

function preload() {
	sperm = loadImage('newsperm2.png');
	condoms = loadImage('900.jpg');
}

function runGame() {
	// main sperm image
	spermArray = duplicateElements([sperm], numImgs);
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
    // condom image
    antiSpermObjects[0] = new BirthControl(
            condoms,
            0,
            0,
            1,
            antiSpermObjects,
            2	
    	)



    // load main image after so it's on top
    mainSperm = loadImage('newsperm.png');	
	// video.hide();
	x = width / 2;
	y = height / 2;
}

function setup() {
	w = windowWidth / 2;
	h = windowHeight * .75;
	let gameCanvas = createCanvas(w, h);
	gameCanvas.parent("game-container");
	frameRate(30);
	video = createCapture(VIDEO);
	video.size(600, 400);
	video.parent('video-container');
	video.hide();

	poseNet = ml5.poseNet(video, modelReady);
	poseNet.on('pose', gotPoses)

	runGame();
}

function modelReady() {
	console.log('model ready ;)')
}


function gotPoses(poses) {
  if (poses.length > 0) {
    nose = poses[0].pose.keypoints[0].position;
    leftEye = poses[0].pose.keypoints[1].position;
    rightEye = poses[0].pose.keypoints[2].position;
    noseX = nose.x;
    noseY = nose.y;
    if (noseX < w * .25) {
      facePosition = 'left';
    } else if (noseX > w * .75) {
      facePosition = 'right';
    } else if (noseY > h * .75) {
      facePosition = 'down';
    } else if (noseY < h * .25) {
      facePosition = 'up';
    }
  }
  console.log(facePosition);
}


function draw() {
	background('#ffecef');
	spermObjects.forEach(obj => {
        obj.collide();
        obj.move();
        obj.display();
      });
	antiSpermObjects.forEach(obj => {
		obj.move();
		obj.display();
	})
	numSeconds = (frameCount / 30) - prevNumSeconds;

	image(mainSperm, x, y, 40, 80);

	// Face Movement Directions (using PoseNet)
	if (facePosition == 'left') {
		if (x > 0) {
			x = x - 4;
		}
	} else if (facePosition == 'right') {
		  if (x < width - 40) {
				x = x + 4;
		  }
	} else if (facePosition == 'up') {
		if (y > 0) {
			y = y - 4;
		}
	} else if (facePosition == 'down') {
		if (y < height - 55) {
			y = y + 4;
		}

	}

	// keyboard commands
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
      	alert('Looks like you were wiped out by the birth control. <br />Better luck next time!')
      	// log time so we can accurately reset game w/o browse refresh
      	prevNumSeconds += numSeconds;
      	runGame();
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