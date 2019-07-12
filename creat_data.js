
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
	knn = ml5.KNNClassifier();
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
		goClassify()
	}
}


function keyPressed() {
	const logits = features.infer(video);
	if (key == 'l') {
		knn.addExample(logits, "left")
		console.log('left')	
	} else if (key == 'r') {
		knn.addExample(logits, "right")	
		console.log('right')	
	} else if (key == 'u') {
		knn.addExample(logits, "up")	
		console.log('up')	
	} else if (key == 'd') {
		knn.addExample(logits, "down")	
		console.log('down')	
	} else if (key == 's') {
		save(knn, 'model.json');
	}
}

function modelReady() {
	console.log("MobileNet ready");
}

function draw() {
	image(video, 0, 0);

	if (!ready && knn.getNumLabels() > 0) {
		goClassify()
		ready = true;
	}

}

// Temporary save code until ml5 version 0.2.2
const save = (knn, name) => {
  const dataset = knn.getClassifierDataset();
  if (knn.mapStringToIndex.length > 0) {
    Object.keys(dataset).forEach(key => {
      if (knn.mapStringToIndex[key]) {
        dataset[key].label = knn.mapStringToIndex[key];
      }
    });
  }
  const tensors = Object.keys(dataset).map(key => {
    const t = dataset[key];
    if (t) {
      return t.dataSync();
    }
    return null;
  });
  let fileName = 'myKNN.json';
  if (name) {
    fileName = name.endsWith('.json') ? name : `${name}.json`;
  }
  saveFile(fileName, JSON.stringify({ dataset, tensors }));
};

const saveFile = (name, data) => {
  const downloadElt = document.createElement('a');
  const blob = new Blob([data], { type: 'octet/stream' });
  const url = URL.createObjectURL(blob);
  downloadElt.setAttribute('href', url);
  downloadElt.setAttribute('download', name);
  downloadElt.style.display = 'none';
  document.body.appendChild(downloadElt);
  downloadElt.click();
  document.body.removeChild(downloadElt);
  URL.revokeObjectURL(url);
};