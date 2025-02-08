import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VideoPlayer() {
  var { videoName, backToFile } = useParams();
//   const [backToFileState, setBackToFileState] = useState(backToFile || null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentJumpOptions, setCurrentJumpOptions] = useState([]);
  const [currentListenJumpOptions, setCurrentListenJumpOptions] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [transcribedText, setTranscribedText] = useState("");
  const [titleText, setTitleText] = useState("");
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
    const [currentPatterns, setCurrentPatterns] = useState([]);
    const [videoAspectRatio, setVideoAspectRatio] = useState(null); // 新增状态
    const [isLandscape, setIsLandscape] = useState(false);
    const [visibilityTextInput, setVisibilityTextInput] = useState('visible');

useEffect(() => {
    if (!showTextInput) {
      // 等待透明度动画完成后再将 visibility 设置为 hidden
      const timer = setTimeout(() => {
        setVisibilityTextInput('hidden');
      }, 500); // 和动画持续时间一致
      return () => clearTimeout(timer);
    }
    setVisibilityTextInput('visible');
  }, [showTextInput]);

    useEffect(() => {
        if (!menuVisible) {
          // 等待透明度动画完成后再将 visibility 设置为 hidden
          const timer = setTimeout(() => {
            setVisibility('hidden');
          }, 500); // 和动画持续时间一致
          return () => clearTimeout(timer);
        }
        setVisibility('visible');
      }, [menuVisible]);
      
      const [visibility, setVisibility] = useState('visible');

  const videoRef = useRef(null);
  const recognition = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setIsLandscape(video.videoWidth > video.videoHeight);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  // 获取视频宽高比
  useEffect(() => {
    const handleLoadedMetadata = () => {
      const video = videoRef.current;
      if (video) {
        const aspectRatio = video.videoWidth / video.videoHeight;
        setVideoAspectRatio(aspectRatio); // 设置 video 的宽高比
      }
    };
  
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
  
    // 清理函数
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, []);
  const videoClassNames = videoAspectRatio ? (videoAspectRatio > 1
      ? "w-[94vw] h-auto object-cover rounded-2xl shadow-2xl backdrop-blur-lg" // 横屏时全屏
      : "h-[94vh] w-auto object-contain rounded-2xl shadow-2xl backdrop-blur-lg") // 竖屏时填充94%竖向空间
    : "w-auto h-auto object-contain"; // 还没有获取到视频的宽高比时

  const currentListenJumpOptionsRef = useRef([]);

  const handleKeyDown = (e) => {
    if (e.key === ' ') { // 检测是否按下空格键
      if (videoRef.current.paused) {
        videoRef.current.play(); // 如果视频暂停，就播放
      } else {
        videoRef.current.pause(); // 如果视频正在播放，就暂停
      }
    }
  };

useEffect(() => {
  currentListenJumpOptionsRef.current = currentListenJumpOptions;
}, [currentListenJumpOptions]);

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = "en-US";

      recognition.current.onresult = (event) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        setTranscribedText((prev) => prev + " " + finalTranscript);
        // console.log("begin")
// console.log(currentListenJumpOptionsRef.current);
for (let i = 0; i < currentListenJumpOptionsRef.current.length; i++) {
  let trigger = currentListenJumpOptionsRef.current[i];
  
  const regex = new RegExp(trigger.text, "i");
  console.log(regex);
  if (regex.test(finalTranscript)) {
    console.log("Detected");
    try {
      recognition.current.stop();
    } catch (err) {
      console.log("Cannot stop recognition:", err);
    }
    if (trigger.fileName) {
      handleJump(trigger.fileName, trigger.backTo);
    }
  }
}
      };

      recognition.current.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecognitionActive(false);
      };

      recognition.current.onend = () => {
        setIsRecognitionActive(false);
      };
    }

    // Cleanup function
    return () => {
      if (recognition.current) {
        try {
          //   recognition.current.stop();
        } catch (err) {
          console.log("Recognition cleanup:", err);
        }
      }
    };
  }, []);

  // Load triggers
  useEffect(() => {
    const loadTriggers = async () => {
      try {
        const response = await fetch("/triggers.json");
        const triggersData = await response.json();
        setTriggers(triggersData[videoName] || []);
      } catch (error) {
        console.error("Failed to load triggers:", error);
      }
    };
    loadTriggers();
  }, [videoName]);

  // Handle video triggers and speech recognition
  useEffect(() => {
    const video = videoRef.current;
    if (!video || triggers.length === 0) return;

    const checkTriggers = () => {
      const currentTime = video.currentTime;

      triggers.forEach((trigger) => {
        if (
          currentTime >= trigger.startTime &&
          (trigger.endTime === -1 || currentTime <= trigger.endTime)
        ) {
          if (trigger.type === 1) {
            setTitleText(trigger.title);
            setMenuVisible(true);
            setCurrentJumpOptions(trigger.jump);
            if (trigger.pause) {
              video.pause();
            }
          }

          if (
            trigger.type === 2 &&
            recognition.current
          ) {
            setCurrentListenJumpOptions(trigger.jump);
            if (trigger.pause) {
                video.pause();
              }
            if (!isRecognitionActive) {
                try {
                    recognition.current.start();
                    setIsRecognitionActive(true);
                    setTranscribedText("");
                  } catch (err) {
                    console.error("Failed to start recognition:", err);
                  }
            }
            
          }
          else if (trigger.type === 3 && !jumping) {
            setShowTextInput(true);
            setCurrentPrompt(trigger.title);
            setCurrentPatterns(trigger.jump);
            if (trigger.pause) {
              video.pause();
            }
          }
        } else if ((currentTime > trigger.endTime && trigger.endTime !== -1) && isRecognitionActive) {
          try {
            // recognition.current?.stop();
            setIsRecognitionActive(false);
          } catch (err) {
            console.error("Failed to stop recognition:", err);
          }
        }
      });
    };

    const handleVideoEnd = () => {
        setShowTextInput(false);
        setMenuVisible(false);
        setTranscribedText("");
        // setVisibilityTextInput(false)
        setShowTextInput(false)
        if (recognition.current && isRecognitionActive) {
            try {
              recognition.current.stop();
            } catch (err) {
              console.log("Cleanup recognition:", err);
            }
          }
          
          if (backToFile) {
        navigate(`/player/${backToFile}`);
      } else {
        for (let i = 0; i < triggers.length; i++) {
            let trigger = triggers[i];
            if (trigger.type === 0) {
                if (trigger.jump.length > 0) {
                    var str = `/player/${trigger.jump[0].fileName}`
                    if (trigger.jump[0].backTo !== "") {
                        str += "/" + trigger.jump[0].backTo;
                    }
                    navigate(str);
                }
                return;
              }
            
          }
      }
    };

    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("timeupdate", checkTriggers);

    return () => {
      video.removeEventListener("timeupdate", checkTriggers);
      video.removeEventListener("ended", handleVideoEnd);
      if (recognition.current && isRecognitionActive) {
        // try {
        //   recognition.current.stop();
        // } catch (err) {
        //   console.log("Cleanup recognition:", err);
        // }
      }
    };
  }, [triggers, navigate, isRecognitionActive]);

  const handleJump = (fileName, backToName) => {
    setMenuVisible(false);
    // setVisibilityTextInput(false)
    setShowTextInput(false)
    if (recognition.current && isRecognitionActive) {
        try {
          recognition.current.stop();
        } catch (err) {
          console.log("Cleanup recognition:", err);
        }
      }
    navigate(`/player/${fileName}/${backToName}`);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();

    var match = false;
    for (let i = 0; i < currentPatterns.length; i++) {
        let trigger = currentPatterns[i];
        
        const regex = new RegExp(trigger.text, "i");
        console.log(regex);
        if (regex.test(inputValue)) {
          console.log("Detected");
          match = true;
          setJumping(true);
          if (trigger.fileName) {
            handleJump(trigger.fileName, trigger.backTo);
          }
          setErrorMessage("");
          setShowTextInput(false);
          setInputValue("");
          
          break;
        }
      }
    // 检查输入是否匹配任何模式
    // const match = currentPatterns.find(p => p.text.toLowerCase() === inputValue.toLowerCase());
    // if (match) {
      
    //   navigate(`/player/${match.fileName}`);
    //   setShowTextInput(false);
    //   setInputValue("");
    // } 
    if (!match) {
      setErrorMessage("Please enter a valid value.");
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-amber-50 relative">
    {/* <video
      ref={videoRef}
      src={`/videos/${videoName}`}
      autoPlay
      className="object-contain rounded-xl shadow-2xl backdrop-blur-lg"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    /> */}
    <video
        ref={videoRef}
        src={`/videos/${videoName}`}
        autoPlay
        className={`${videoClassNames} transition-all duration-300`} // 使用动态类
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      {/* <video
        ref={videoRef}
        src={`/videos/${videoName}`}
        autoPlay
        playsInline
        className={`rounded-3xl shadow-xl transition-all duration-300 ${
          isLandscape ? 'w-screen h-screen object-cover' : 'h-[94vh] w-auto object-contain'
        }`}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      /> */}
  
    {/* {menuVisible && (
        
      <div className="absolute inset-0 flex flex-col justify-center items-center bg-amber-50/20 backdrop-blur-md transition-all duration-300">
        <div className="bg-amber-50/70 p-8 rounded-2xl shadow-xl border border-amber-100/60">
          <p className="text-amber-800 text-xl mb-4 font-semibold">{titleText}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {currentJumpOptions.map((option, index) => (
              <button
                key={index}
                className="bg-amber-600/90 hover:bg-amber-700/90 text-white px-6 py-3 rounded-lg 
                         transition-all duration-200 shadow-md hover:shadow-lg font-medium 
                         backdrop-blur-sm"
                onClick={() => handleJump(option.fileName, option.backTo)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    )} */}
    {/* {menuVisible !== null && (
  <div
    className={`absolute inset-0 flex flex-col justify-center items-center bg-amber-50/20 backdrop-blur-md 
                transition-opacity duration-300 ${menuVisible ? 'opacity-100' : 'opacity-0'}`}
    style={{ visibility: menuVisible ? 'visible' : 'hidden' }}
  >
    <div className="bg-amber-50/70 p-8 rounded-2xl shadow-xl border border-amber-100/60">
      <p className="text-amber-800 text-xl mb-4 font-semibold">{titleText}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {currentJumpOptions.map((option, index) => (
          <button
            key={index}
            className="bg-amber-600/90 hover:bg-amber-700/90 text-white px-6 py-3 rounded-lg 
                       transition-all duration-200 shadow-md hover:shadow-lg font-medium 
                       backdrop-blur-sm"
            onClick={() => handleJump(option.fileName, option.backTo)}
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  </div>
)} */}

{menuVisible !== null && (
    <div
      className={`absolute inset-0 flex flex-col justify-center items-center bg-amber-50/20 backdrop-blur-md 
                  transition-opacity duration-300 ${menuVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ visibility }}
    >
      <div className="bg-amber-50/70 p-8 rounded-2xl shadow-xl border border-amber-100/60">
        <p className="text-amber-800 text-xl mb-4 font-semibold">{titleText}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {currentJumpOptions.map((option, index) => (
            <button
              key={index}
              className="bg-amber-600/90 hover:bg-amber-700/90 text-white px-6 py-3 rounded-lg 
                         transition-all duration-200 shadow-md hover:shadow-lg font-medium 
                         backdrop-blur-sm"
              onClick={() => handleJump(option.fileName, option.backTo)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )}

  
    {showTextInput !== null && (
    <div
      className={`absolute inset-0 flex flex-col justify-center items-center bg-amber-50/20 backdrop-blur-lg
                  transition-opacity duration-500 ${showTextInput ? 'opacity-100' : 'opacity-0'}`}
      style={{ visibility: visibilityTextInput }}
    >
      <div className="bg-amber-50/90 p-8 rounded-2xl shadow-xl border border-amber-100 max-w-md w-full">
        <p className="text-amber-800 text-xl mb-6 font-medium">{currentPrompt}</p>
        <form onSubmit={handleTextSubmit} className="space-y-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-400 
                      focus:ring-2 focus:ring-amber-300/50 bg-white/50 backdrop-blur-sm 
                      placeholder:text-amber-400/80 text-amber-800 transition-all"
            placeholder="Please enter..."
          />
          {errorMessage && (
            <p className="text-red-500/90 text-sm -mb-2">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-amber-600/90 hover:bg-amber-700/90 text-white py-3 px-6 
                     rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  )}
  
    {transcribedText && (
      <div className="absolute bottom-10 left-10 bg-amber-50/80 backdrop-blur-md p-4 
                rounded-xl shadow-lg max-w-xl overflow-y-auto max-h-32 border 
                border-amber-100/50 transition-all duration-300">
        <p className="text-amber-800/90 leading-relaxed font-medium">{transcribedText}</p>
      </div>
    )}
  </div>
  
)
}