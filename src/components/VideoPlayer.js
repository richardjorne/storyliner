import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

// 1 = choices, 2 = voice, 3 = text
const triggers = [
  { type: 1, startTime: 3, endTime: 3, pause: true, jump: [{text: "去2", fileName: "2"},{text: "去3", fileName: "3"},{text: "去4", fileName: "4"}, {text: "去5", fileName: "5"}]},
//   { type: 2, startTime: 15, endTime: 20, pause: true, jump: [{text: "__", fileName: "2"}]},
];

export default function VideoPlayer() {
  const { videoName } = useParams();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkTriggers = () => {
      const currentTime = video.currentTime;
      triggers.forEach((trigger) => {
        if (currentTime >= trigger.startTime && currentTime <= trigger.endTime) {
          console.log(`Trigger ${trigger.type} activated at ${currentTime}s`);
        }
      });
    };

    video.addEventListener("timeupdate", checkTriggers);
    return () => video.removeEventListener("timeupdate", checkTriggers);
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black">
      <video
        ref={videoRef}
        src={`/videos/${videoName}`}
        autoPlay
        className="w-full h-full object-cover"
      />
    </div>
  );
}