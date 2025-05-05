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
let trailColor = [0, 255, 0]; // 預設為綠色 (左手)

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
  stroke(trailColor[0], trailColor[1], trailColor[2]); // 動態設定線條顏色
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
        // 檢查大拇指 (keypoints[4])
        let thumb = hand.keypoints[4];
        let d = dist(thumb.x, thumb.y, circleX, circleY);

        // 如果大拇指接觸到圓，讓圓跟隨大拇指移動
        if (d < circleSize / 2) {
          isDragging = true;

          // 根據左右手設定軌跡顏色
          if (hand.handedness === "Left") {
            trailColor = [0, 255, 0]; // 綠色 (左手)
          } else if (hand.handedness === "Right") {
            trailColor = [255, 0, 0]; // 紅色 (右手)
          }
        }

        if (isDragging) {
          circleX = thumb.x;
          circleY = thumb.y;

          // 儲存圓的位置到軌跡
          trail.push({ x: circleX, y: circleY });
        }

        // 繪製手部關鍵點
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 根據左右手進行顏色區分
          if (hand.handedness === "Left") {
            fill(0, 255, 0); // 綠色 (左手)
          } else {
            fill(255, 0, 0); // 紅色 (右手)
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
