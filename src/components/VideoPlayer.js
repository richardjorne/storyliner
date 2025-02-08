import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function VideoPlayer() {
  const { videoName, backToFile } = useParams();
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

  const videoRef = useRef(null);
  const recognition = useRef(null);
  const navigate = useNavigate();

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
      if (backToFile) {
        navigate(`/player/${backToFile}`);
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
    navigate(`/player/${fileName}/${backToName}`);
    setMenuVisible(false);
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
    <div className="w-screen h-screen flex justify-center items-center bg-black relative">
      <video
        ref={videoRef}
        src={`/videos/${videoName}`}
        autoPlay
        className="object-contain"
        onKeyDown={handleKeyDown}
      tabIndex={0}
      />

      {menuVisible && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60 transition-opacity duration-500">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-black text-lg mb-2">{titleText}</p>
            {currentJumpOptions.map((option, index) => (
              <button
                key={index}
                className="bg-blue-500 text-white px-4 py-2 m-2 rounded hover:bg-blue-700"
                onClick={() => handleJump(option.fileName, option.backTo)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

{showTextInput && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-black text-lg mb-4">{currentPrompt}</p>
              <form onSubmit={handleTextSubmit} className="flex flex-col items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="border-2 border-gray-300 rounded px-4 py-2 mb-4 w-full"
                  placeholder="Please enter..."
                />
                {errorMessage && (
                  <p className="text-red-500 mb-4">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}

      {transcribedText && (
        <div className="absolute bottom-10 left-10 bg-white text-black p-2 rounded-lg max-w-xl overflow-y-auto max-h-32">
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
}
