import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const video =
  document.getElementById("video");

const canvas =
  document.getElementById("canvas");

const ctx =
  canvas.getContext("2d");

const countText =
  document.getElementById("count");

const gestureText =
  document.getElementById("gesture");


let handLandmarker;

let lastCount = -1;


async function startCamera() {

  const stream =
    await navigator.mediaDevices.getUserMedia({

      video: {
        width: 640,
        height: 480
      }

    });

  video.srcObject = stream;

  return new Promise((resolve) => {

    video.onloadedmetadata = () => {

      canvas.width =
        video.videoWidth;

      canvas.height =
        video.videoHeight;

      resolve(video);
    };

  });
}

async function createHandLandmarker() {

  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

  handLandmarker =
    await HandLandmarker.createFromOptions(
      vision,
      {
        baseOptions: {

          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task"

        },

        runningMode: "VIDEO",

        numHands: 1
      }
    );
}

// suara e
function speak(text) {

  speechSynthesis.cancel();

  const utter =
    new SpeechSynthesisUtterance(text);

  utter.lang = "id-ID";

  utter.volume = 1;

  utter.rate = 1;

  speechSynthesis.speak(utter);
}
function countFingers(landmarks) {

  let count = 0;

  // ibu jari
  if (
    landmarks[4].x <
    landmarks[3].x - 0.05
  ) {
    count++;
  }

  // telunjuk
  if (
    landmarks[8].y <
    landmarks[6].y - 0.03
  ) {
    count++;
  }

  // tengah
  if (
    landmarks[12].y <
    landmarks[10].y - 0.03
  ) {
    count++;
  }

  // manis
  if (
    landmarks[16].y <
    landmarks[14].y - 0.03
  ) {
    count++;
  }

  // kelingking
  if (
    landmarks[20].y <
    landmarks[18].y - 0.03
  ) {
    count++;
  }

  return count;
}


async function detect() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const results =
    handLandmarker.detectForVideo(
      video,
      performance.now()
    );

  if (results.landmarks.length > 0) {

    const landmarks =
      results.landmarks[0];

    const connections = [

      // ibu jari
      [0,1],[1,2],[2,3],[3,4],

      // telunjuk
      [0,5],[5,6],[6,7],[7,8],

      // tengah
      [0,9],[9,10],[10,11],[11,12],

      // manis
      [0,13],[13,14],[14,15],[15,16],

      // kelingking
      [0,17],[17,18],[18,19],[19,20],

      // telapak
      [5,9],[9,13],[13,17]
    ];

    for (const [start,end] of connections) {

      const s = landmarks[start];
      const e = landmarks[end];

      ctx.beginPath();

      ctx.moveTo(
        s.x * canvas.width,
        s.y * canvas.height
      );

      ctx.lineTo(
        e.x * canvas.width,
        e.y * canvas.height
      );

      ctx.strokeStyle = "cyan";

      ctx.lineWidth = 2;

      ctx.stroke();
    }

    for (const point of landmarks) {

      ctx.beginPath();

      ctx.arc(
        point.x * canvas.width,
        point.y * canvas.height,
        4,
        0,
        2 * Math.PI
      );

      ctx.fillStyle = "lime";

      ctx.fill();
    }

    const fingerCount =
      countFingers(landmarks);

    countText.innerText =
      fingerCount;

    const gestureName = [
      "nol",
      "satu",
      "dua",
      "tiga",
      "empat",
      "lima"
    ];

    gestureText.innerText =
      gestureName[fingerCount];

    if (fingerCount !== lastCount) {

      lastCount = fingerCount;

      const angka = [
        "Nol",
        "Satu",
        "Dua",
        "Tiga",
        "Empat",
        "Lima"
      ];

      speak(angka[fingerCount]);
    }
  }

  setTimeout(() => {

    requestAnimationFrame(detect);

  }, 30);
}


async function main() {

  await startCamera();

  await createHandLandmarker();

  detect();
}

main();