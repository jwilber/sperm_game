
let x,y;
let label = '';


let video;
let features;
let knn;
let labelP;
let ready = false;

function setup() {
	createCanvas(320, 240);
	video = createCapture(VIDEO);
	video.size(320, 240);
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

function keyIsDown() {
  if (keyCode === LEFT_ARROW) {
    x = x - 4;
  } else if (keyCode === RIGHT_ARROW) {
    x = x + 4;
  } else if (keyCode === UP_ARROW) {
  	y = y - 4;
  } else if (keyCode === DOWN_ARROW) {
  	if (y < height) {
	   y = y + 4;
		}
  }
}

function draw() {
	background('white');
	fill('coral');
	noStroke();
	ellipse(x, y, 40);
	console.log(label)
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
	    x = x - 4;			
		}
  } else if (keyIsDown(RIGHT_ARROW)) {
    if (x < width) {
	    x = x + 4;
    }
  } else if (keyIsDown(UP_ARROW)) {
  	if (y > 0) {
	  	y = y - 4;  		
  	}
  } else if (keyIsDown(DOWN_ARROW)) {
  	if (y < height) {
	   y = y + 4;
		}
  }



}
