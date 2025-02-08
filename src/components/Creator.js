import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 预定义可用的视频文件列表
const AVAILABLE_VIDEOS = ["hiit.mp4","relax.mp4","1.mov", "2.mov", "3.mov", "4.mov", "5.mov"]; // 根据实际可用视频修改

export default function Creator() {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  // 添加新视频
  const handleAddVideo = (videoName) => {
    if (!videoName || videos.some(v => v.name === videoName)) {
      return; // 防止重复添加
    }
    const newVideo = {
      name: videoName,
      triggers: []
    };
    setVideos([...videos, newVideo]);
  };

  // 添加触发器
  const addTrigger = (videoIndex) => {
    const newTrigger = {
      type: 1,
      startTime: 0,
      endTime: -1,
      pause: true,
      title: "",
      jump: []
    };

    const updatedVideos = [...videos];
    updatedVideos[videoIndex].triggers.push(newTrigger);
    setVideos(updatedVideos);
  };

  // 更新触发器
  const updateTrigger = (videoIndex, triggerIndex, field, value) => {
    const updatedVideos = [...videos];
    updatedVideos[videoIndex].triggers[triggerIndex][field] = value;
    setVideos(updatedVideos);
  };

  // 添加跳转选项
  const addJumpOption = (videoIndex, triggerIndex) => {
    const updatedVideos = [...videos];
    updatedVideos[videoIndex].triggers[triggerIndex].jump.push({
      text: "",
      fileName: "",
      backTo: ""
    });
    setVideos(updatedVideos);
  };

  const handleSave = async () => {
    if (!projectName || videos.length === 0) {
      alert('Please enter project name and add at least one video');
      return;
    }
  
    try {
      // 创建触发器配置对象
      const triggerConfig = videos.reduce((config, video) => {
        config[video.name] = video.triggers;
        return config;
      }, {});
  
      // 创建项目数据
      const projectData = {
        name: projectName,
        description,
        firstVideo: videos[0].name,
        videos: videos.map(v => ({ 
          name: v.name, 
          path: `/videos/${v.name}` 
        })),
        triggers: triggerConfig
      };
  
      // 创建项目JSON文件
      const projectJsonContent = JSON.stringify(projectData, null, 2);
      const projectBlob = new Blob([projectJsonContent], { type: 'application/json' });
      const projectUrl = URL.createObjectURL(projectBlob);
  
      // 获取现有的triggers.json内容并添加新的triggers
      let existingTriggers = {};
      try {
        const response = await fetch('/public/triggers.json');
        if (response.ok) {
          existingTriggers = await response.json();
        }
      } catch (error) {
        console.warn('No existing triggers.json found, creating new one');
      }
  
      // 合并现有triggers和新triggers
      const updatedTriggers = {
        ...existingTriggers,
        ...triggerConfig
      };
  
      // 创建更新后的triggers.json文件
      const triggersJsonContent = JSON.stringify(updatedTriggers, null, 2);
      const triggersBlob = new Blob([triggersJsonContent], { type: 'application/json' });
      const triggersUrl = URL.createObjectURL(triggersBlob);
  
      // 创建并触发项目JSON下载
      const projectLink = document.createElement('a');
      projectLink.href = projectUrl;
      projectLink.download = `${projectName}_trigger.json`;
      document.body.appendChild(projectLink);
      projectLink.click();
      document.body.removeChild(projectLink);
  
      // 等待第一个文件下载完成
      await new Promise(resolve => setTimeout(resolve, 1000));
  
      // 创建并触发triggers.json下载
      const triggersLink = document.createElement('a');
      triggersLink.href = triggersUrl;
      triggersLink.download = 'triggers.json';
      document.body.appendChild(triggersLink);
      triggersLink.click();
      document.body.removeChild(triggersLink);
  
      // 清理 URL
      URL.revokeObjectURL(projectUrl);
      URL.revokeObjectURL(triggersUrl);
  
      // 保存项目信息到 localStorage
      const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      savedProjects.push({
        id: Date.now(),
        name: projectName,
        description,
        firstVideo: videos[0].name
      });
      localStorage.setItem('projects', JSON.stringify(savedProjects));
  
      alert('Project and triggers files saved successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save project');
    }
  };

  // 修改保存项目的函数
//   const handleSave = () => {
//     if (!projectName || videos.length === 0) {
//       alert('Please enter project name and add at least one video');
//       return;
//     }

//     try {
//       // 创建触发器配置对象
//       const triggerConfig = videos.reduce((config, video) => {
//         config[video.name] = video.triggers;
//         return config;
//       }, {});

//       // 创建项目数据
//       const projectData = {
//         name: projectName,
//         description,
//         firstVideo: videos[0].name,
//         videos: videos.map(v => ({
//           name: v.name,
//           path: `/videos/${v.name}`
//         })),
//         triggers: triggerConfig
//       };

//       // 创建 JSON 文件
//       const jsonContent = JSON.stringify(projectData, null, 2);
//       const blob = new Blob([jsonContent], { type: 'application/json' });
//       const url = URL.createObjectURL(blob);
      
//       // 创建下载链接
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `${projectName}_trigger.json`;
      
//       // 触发下载
//       document.body.appendChild(link);
//       link.click();
      
//       // 清理
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);

//       // 保存项目信息到 localStorage，以便在首页显示
//       const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
//       savedProjects.push({
//         id: Date.now(),
//         name: projectName,
//         description,
//         firstVideo: videos[0].name
//       });
//       localStorage.setItem('projects', JSON.stringify(savedProjects));

//       alert('Project saved successfully!');
//       navigate('/');
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to save project');
//     }
//   };


  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-amber-800 mb-8">Create New Project</h1>

        {/* Project Info */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Project Information</h2>
          <input
            type="text"
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full mb-4 p-2 border border-amber-200 rounded"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-amber-200 rounded"
          />
        </div>

        {/* Video Selection */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">Videos</h2>
          <div className="flex gap-4 mb-6">
            <select
              onChange={(e) => handleAddVideo(e.target.value)}
              value=""
              className="p-2 border border-amber-200 rounded"
            >
              <option value="">Select a video to add</option>
              {AVAILABLE_VIDEOS
                .filter(v => !videos.some(video => video.name === v))
                .map(video => (
                  <option key={video} value={video}>{video}</option>
                ))}
            </select>
          </div>

          {/* Video List */}
          <div className="space-y-4">
            {videos.map((video, vIndex) => (
              <div key={vIndex} className="border-2 border-amber-100 rounded-lg p-4">
                <h3 className="font-medium text-amber-800">{video.name}</h3>
                
                {/* Triggers */}
                <div className="mt-4">
                  <h4 className="text-amber-700 mb-2">Triggers</h4>
                  {video.triggers.map((trigger, tIndex) => (
                    <div key={tIndex} className="bg-amber-50 p-3 rounded-lg mb-2">
                      <select
                        value={trigger.type}
                        onChange={(e) => updateTrigger(vIndex, tIndex, 'type', parseInt(e.target.value))}
                        className="mb-2 p-2 border border-amber-200 rounded"
                      >
                        <option value={0}>Empty</option>
                        <option value={1}>Choice</option>
                        <option value={2}>Voice</option>
                        <option value={3}>Text</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="number"
                          placeholder="Start Time"
                          value={trigger.startTime}
                          onChange={(e) => updateTrigger(vIndex, tIndex, 'startTime', parseFloat(e.target.value))}
                          className="p-2 border border-amber-200 rounded"
                        />
                        <input
                          type="number"
                          placeholder="End Time"
                          value={trigger.endTime}
                          onChange={(e) => updateTrigger(vIndex, tIndex, 'endTime', parseFloat(e.target.value))}
                          className="p-2 border border-amber-200 rounded"
                        />
                      </div>

                      {/* Pause Option */}
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={trigger.pause}
                          onChange={(e) => updateTrigger(vIndex, tIndex, 'pause', e.target.checked)}
                          className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                        />
                        <label className="text-amber-800">Pause video during trigger</label>
                      </div>

                      <input
                        type="text"
                        placeholder="Title"
                        value={trigger.title}
                        onChange={(e) => updateTrigger(vIndex, tIndex, 'title', e.target.value)}
                        className="w-full mb-2 p-2 border border-amber-200 rounded"
                      />

                      {/* Jump Options */}
                      <div className="mt-2">
                        <h5 className="text-amber-700 mb-2">Jump Options</h5>
                        {trigger.jump.map((jump, jIndex) => (
                          <div key={jIndex} className="grid grid-cols-3 gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Text"
                              value={jump.text}
                              onChange={(e) => {
                                const updatedVideos = [...videos];
                                updatedVideos[vIndex].triggers[tIndex].jump[jIndex].text = e.target.value;
                                setVideos(updatedVideos);
                              }}
                              className="p-2 border border-amber-200 rounded"
                            />
                            <select
                              value={jump.fileName}
                              onChange={(e) => {
                                const updatedVideos = [...videos];
                                updatedVideos[vIndex].triggers[tIndex].jump[jIndex].fileName = e.target.value;
                                setVideos(updatedVideos);
                              }}
                              className="p-2 border border-amber-200 rounded"
                            >
                              <option value="">Select video to jump to</option>
                              {AVAILABLE_VIDEOS.map(video => (
                                <option key={video} value={video}>{video}</option>
                              ))}
                            </select>
                            <select
                              value={jump.backTo}
                              onChange={(e) => {
                                const updatedVideos = [...videos];
                                updatedVideos[vIndex].triggers[tIndex].jump[jIndex].backTo = e.target.value;
                                setVideos(updatedVideos);
                              }}
                              className="p-2 border border-amber-200 rounded"
                            >
                              <option value="">Select video to back to</option>
                              {AVAILABLE_VIDEOS.map(video => (
                                <option key={video} value={video}>{video}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <button
                          onClick={() => addJumpOption(vIndex, tIndex)}
                          className="text-amber-600 hover:text-amber-700"
                        >
                          + Add Jump Option
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addTrigger(vIndex)}
                    className="text-amber-600 hover:text-amber-700"
                  >
                    + Add Trigger
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg
                   transition-all duration-200 shadow-md hover:shadow-lg font-medium"
        >
          Save Project
        </button>
      </div>
    </div>
  );
} 