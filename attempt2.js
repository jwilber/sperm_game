// init vars
let x, y;
let facePosition = '';
let spring = 0.025;
let mainSperm;
let spermObjects = [];
let spermArray = [];
let video;
let ready = false;
let numSpermCells = 120;
let numSeconds;
let prevNumSeconds = 0;
let w, h;
let numDeadSpermCells;
let birthControlObjects;
let addedMore;
let firstView = true;
let modelLoaded = false;
let initLeftEye, initRightEye, initNose;
let nose, leftEye, rightEye;
let labelP;

// load images before running game
preload = () => {
	sperm = loadImage('newsperm2.png');
	condoms = loadImage('condom.png');
	magnums = loadImage('magnums.png');
	iud = loadImage('iud.png');
	planb = loadImage('planb.png');
	bc_pills = loadImage('birthcontrol_pills.png');
	spermicide = loadImage('spermicide.png');
}

const runGame = () => {
	//reset dead sperm cell count
	numDeadSpermCells = 0;

  // reset tracking for eyes
	let firstView = true;

  // reset adding of new sperm indicator
	addedMore = false;

  // default label
  labelP.html('Loading model for webcam directions...')

	// main sperm image
	spermArray = duplicateElements([sperm], numSpermCells);

  // create array of time delays for birth control appearances
  let delayTimes = [6, 12, 18, 24, 30, 36];
  delayTimes = shuffle(delayTimes);

  birthControlObjects = [
		new BirthControl(condoms, 200, 0, birthControlObjects, delayTimes[0], 60, 140, "Look out, here comes a condom!"),
		new BirthControl(magnums, w, h, birthControlObjects, delayTimes[1], 120, 120, "Oh no! Some magum condoms appeared!"), 
		new BirthControl(iud, 0, 0, birthControlObjects, delayTimes[2], 100, 120, "Watch out for that IUD!"),
		new BirthControl(planb, 100, 100, birthControlObjects, delayTimes[3], 45, 45, "It's a Plan B pill, careful!"),
		new BirthControl(bc_pills, 200, 200, birthControlObjects, delayTimes[4], 45, 100, "Birth control pills appeared!"),
		new BirthControl(spermicide, 0, 0, birthControlObjects, delayTimes[5], 140, 75, "Careful, there's some spermicide!")
	];

	// shuffle array so birth control elements show in different order each game
	birthControlObjects = shuffle(birthControlObjects);

	for (let i = 0; i < numSpermCells; i++) {
    spermObjects[i] = new SpermCell(
      spermArray[i],
      random(width),
      random(height),
      i,
      spermObjects,
      birthControlObjects
    );
  };

  // load cursor at middle of screen
  mainSperm = loadImage('newsperm.png');	
	x = width / 2;
	y = height / 2;
}

setup = () => {
	w = (windowWidth / 2) * .95;
	h = windowHeight * .75;
	let gameCanvas = createCanvas(w, h);
	gameCanvas.parent("game-container");
	frameRate(30);
	video = createCapture(VIDEO);
	video.size(75, 75);
	video.parent('video-container');
	video.hide();
	labelP = createP('Get Ready!');
  labelP.style('font-size', '1rem');
  labelP.parent('text-container')

	poseNet = ml5.poseNet(video, modelReady);
	poseNet.on('pose', gotPoses)

	runGame();
}

function modelReady() {
	console.log('model ready ;)')
	labelP.html('Model loaded, get ready!')
}


const gotPoses = (poses) => {
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

  modelLoaded = true;
  // console.log(facePosition);
}

const victory = (numDeadSpermCells) => {
	if (numDeadSpermCells == numSpermCells) {
		alert('Victory!');
		prevNumSeconds += numSeconds;
		runGame();
	}
}

draw = () => {
	background('#ffecef');

	// decrement canvas time for game restarts
	numSeconds = (frameCount / 30) - prevNumSeconds;
	if (firstView === true && modelLoaded === true) {
		console.log('lefteye', leftEye)
		// initLeftEye = leftEye;
		// initRightEye = rightEye;
		// initNose = nose;
		console.log('tracekd values');
		firstView = false;
	}

  //check victory conditions
	victory(numDeadSpermCells);
	spermObjects.forEach(obj => {
    obj.collide();
    obj.move();
    obj.display();
  });
	birthControlObjects.forEach(obj => {
		obj.move();
		obj.display();
	})


	// add more sperm cells at ~25 seconds
	if (numSeconds > 24 && numSeconds < 26 && addedMore === false) {
		console.log('adding more sperm');
		addedMore = true;
		numDeadSpermCells = 0
		for (let i = 0; i < numSpermCells; i++) {
    spermObjects[i] = new SpermCell(
      spermArray[i],
      random(width),
      random(height),
      i,
      spermObjects,
      birthControlObjects
    );
  };
	}

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
    for (let i = 0; i < birthControlObjects.length; i++) {
      // get distance from this node to all oters

      let dx = birthControlObjects[i].x - x;
      let dy = birthControlObjects[i].y - y;
      let distance = sqrt(dx * dx + dy * dy);

      // set distance threshold
      let minDist = birthControlObjects[i].diameter;

      // if killed, display message and end game
      if (distance < minDist) {
      	alert('Looks like you were wiped out by the birth control :( <br /><br /> Better luck next time!')
      	// log time so we can accurately reset game w/o browse refresh
      	prevNumSeconds += numSeconds;
      	// restart game
      	runGame();
      }
    }

    //webcam stuff
    // image(video, 0, 0);
    // console.log(leftEye)
    // if (leftEye) {
	   //  ellipse(leftEye.x, leftEye.y, 20);    	
	   //  ellipse(rightEye.x, rightEye.y, 20);    	
	   //  ellipse(noseX, noseY, 40);    	
    // }

}

class SpermCell {

  // set attributes
  constructor(img, xIndex, yIndex, index, others, birthControls) {
    this.img = img;
    this.x = xIndex;
    this.y = yIndex;
    this.xVelocity = .5;
    this.yVelocity = 1.5;
    this.diameter = 25;
    this.id = index;
    this.others = others;
    this.birthControls = birthControls;
    this.dead = false;
  }

  collide() {
  	if (this.dead === true) {
  		// do nothing
  	} else {
  		// handle sperm overlap case
	    for (let i = this.id + 1; i < numSpermCells; i++) {
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
	    for (let i = 0; i < this.birthControls.length; i++) {
	      // get distance from this node to all oters

	      let dx = this.birthControls[i].x - this.x;
	      let dy = this.birthControls[i].y - this.y;
	      let distance = sqrt(dx * dx + dy * dy);

	      // set distance threshold
	      let minDist = this.birthControls[i].diameter;

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
	        // incrememnt dead cell count
	        numDeadSpermCells ++;
	        // console.log(numDeadSpermCells);
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
  constructor(img, xIndex, yIndex, others, delay, width, height, message) {
    this.img = img;
    this.x = xIndex;
    this.y = yIndex;
    this.xVelocity = 5;
    this.yVelocity = 1.5;
    this.diameter = 25;
    this.delay = delay;
    this.width = width;
    this.height = height;
    this.others = others;
    this.message = message;
    this.displayedMessage = false;
    this.dead = false;
  }

  collide() {
 
  }

  move() {
  	// dont spawn birth-control unil this.delay seconds
  	if (numSeconds < this.delay) {
  		this.x = random(width);
  		this.y = -50;
  	} else { // move anti-sperm element in random manner thruout the canvas
			this.x += this.xVelocity;
	    this.y += this.yVelocity;

	    // handle edge collisions
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
  	// don't show sperm cell after this.delay time
  	if (numSeconds < this.delay) {
  		// dont do nothing
  	} else {
	  	image(this.img, this.x, this.y, this.width, this.height); 
	  	if (this.displayedMessage === false) {
	  		labelP.html(this.message);
	  		this.displayedMessage = true;
	  	}
  	}
  }

}