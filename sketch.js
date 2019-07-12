
let x,y;


let video;
let features;
let knn;
let labelP;
let ready = false;

function setup() {
	createCanvas(320, 240);
	video = createCapture(VIDEO);
	video.size(320, 240);
	video.hide();
	features = ml5.featureExtractor("MobileNet", modelReady);
	// knn = ml5.KNNClassifier();
	labelP = createP("needs training data");
	labelP.style('font-size', '3rem')
	labelP.style('font-family', 'Arial')

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
		labelP.html(result.label);	
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
		knn.addExample(logits, "glasses")		
	} else if (key == 'o') {
		knn.addExample(logits, "glasses off")		
	} else if (key == 's') {
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
	image(video, 0, 0);

}
