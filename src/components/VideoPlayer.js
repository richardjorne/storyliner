import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VideoPlayer() {
  const { videoName, backToFile } = useParams(); // 获取 URL 参数
  const [backToFileState, setBackToFileState] = useState(backToFile || null); // 使用 backToFile 初始化状态
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentJumpOptions, setCurrentJumpOptions] = useState([]);
  const [triggers, setTriggers] = useState([]);

  // 加载对应视频的触发器
  useEffect(() => {
    const loadTriggers = async () => {
      try {
        console.log("loading triggers for", videoName);
        const response = await fetch("/triggers.json"); // 确保路径正确
        console.log("response", response);
        const triggersData = await response.json();
        setTriggers(triggersData[videoName] || []); // 根据视频名称加载对应的触发器
      } catch (error) {
        console.error("Failed to load triggers:", error);
      }
    };

    loadTriggers();
  }, [videoName]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || triggers.length === 0) return;

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
            if (trigger.jump && trigger.jump.length > 0) {
              setBackToFileState(trigger.jump[0].backTo); // 设置 backTo 文件
            }
          }
        } else if (currentTime > trigger.endTime) {
          setMenuVisible(false);
        }
      });
    };

    const handleVideoEnd = () => {
      if (backToFile) {
        navigate(`/player/${backToFile}`); // 使用 navigate 跳转回 backTo 文件
      }
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("timeupdate", checkTriggers);

    return () => {
      video.removeEventListener("timeupdate", checkTriggers);
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, [triggers, backToFileState, navigate]);

  const handleJump = (fileName) => {
    navigate(`/player/${fileName}/${backToFileState}`); // 在跳转时保留 backToFile
    setMenuVisible(false);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-black relative">
      <video
        ref={videoRef}
        src={`/videos/${videoName}`}
        autoPlay
        className="object-contain"
      />

      {menuVisible && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60 transition-opacity duration-500">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-black text-lg mb-2">请选择跳转目标:</p>
            {currentJumpOptions.map((option, index) => (
              <button
                key={index}
                className="bg-blue-500 text-white px-4 py-2 m-2 rounded hover:bg-blue-700"
                onClick={() => handleJump(option.fileName)} // 跳转时携带 backToFile
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