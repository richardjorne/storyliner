import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 1 = choices, 2 = voice, 3 = text, 0 = no break
var triggers = [
  { type: 1, startTime: 3, endTime: -1, pause: true, jump: [{text: "去2", fileName: "2.mov"},{text: "去3", fileName: "3.mov"},{text: "去4", fileName: "4.mov"}, {text: "去5", fileName: "5.mov"}]},
//   { type: 2, startTime: 15, endTime: 20, pause: true, jump: [{text: "__", fileName: "2.mov"}]},
];

export default function VideoPlayer() {
    const { videoName } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [currentJumpOptions, setCurrentJumpOptions] = useState([]);
  
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
  
      const checkTriggers = () => {
        const currentTime = video.currentTime;
        triggers.forEach((trigger) => {
          if (currentTime >= trigger.startTime && (trigger.endTime === -1 || currentTime <= trigger.endTime)) {
            if (trigger.type === 1) {
              setMenuVisible(true);
              setCurrentJumpOptions(trigger.jump);
              if (trigger.pause) {
                video.pause();
              }
            }
          }
        });
      };
  
      video.addEventListener("timeupdate", checkTriggers);
      return () => video.removeEventListener("timeupdate", checkTriggers);
    }, []);
  
    const handleJump = (fileName) => {
      navigate(`/player/${fileName}`);
      setMenuVisible(false);
    };
  
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black relative">
        <video
          ref={videoRef}
          src={`/videos/${videoName}`}
          autoPlay
          className="w-full h-full object-cover"
        />
  
        {menuVisible && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60 transition-opacity duration-500">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <p className="text-black text-lg mb-2">请选择跳转目标:</p>
              {currentJumpOptions.map((option, index) => (
                <button
                  key={index}
                  className="bg-blue-500 text-white px-4 py-2 m-2 rounded hover:bg-blue-700"
                  onClick={() => handleJump(option.fileName)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }