// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX = 320; // 圓的初始位置 (視窗中間)
let circleY = 240;
let circleSize = 100; // 圓的寬高
let isDragging = false;
let trail = []; // 儲存圓的軌跡

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 繪製軌跡
  stroke(255, 0, 0); // 紅色線條
  strokeWeight(2);
  noFill();
  beginShape();
  for (let pos of trail) {
    vertex(pos.x, pos.y);
  }
  endShape();

  // 繪製圓
  fill(0, 255, 0);
  noStroke();
  circle(circleX, circleY, circleSize);

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 檢查食指 (keypoints[8])
        let indexFinger = hand.keypoints[8];
        let d = dist(indexFinger.x, indexFinger.y, circleX, circleY);

        // 如果食指接觸到圓，讓圓跟隨食指移動
        if (d < circleSize / 2) {
          isDragging = true;
        }

        if (isDragging) {
          circleX = indexFinger.x;
          circleY = indexFinger.y;

          // 儲存圓的位置到軌跡
          trail.push({ x: circleX, y: circleY });
        }

        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手進行顏色區分
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  }

  // 如果手指離開圓，停止拖動並清空軌跡
  if (hands.length === 0) {
    isDragging = false;
    trail = [];
  }
}
