// import { Link } from "react-router-dom";

// const videos = ["hiit", "relax"];



// export default function VideoList() {
//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 p-8">
//       {/* 标题 */}
//       <h1 className="mb-12 text-center font-serif text-4xl font-medium text-amber-800">
//         Storyliner
//         <span className="mt-2 block text-lg font-normal text-amber-600">
//         Make your stories shine.

//         </span>
//       </h1>

//       {/* 视频卡片容器 */}
//       <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
//         {videos.map((video, index) => (
//           <Link
//             to={`/player/${video}.mp4`}
//             key={index}
//             className="group relative flex justify-center "
//           >
//             {/* 主卡片 */}
//             <div className="rounded-2xl h-full w-full max-w-sm transform-gpu transition-all duration-300 hover:scale-105 hover:shadow-2xl">
//               <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl shadow-amber-200/40 hover:shadow-2xl hover:shadow-amber-300/50">
//                 {/* 3D 边框层 */}
//                 <div className="absolute inset-0 rounded-2xl border-2 border-amber-50/20 bg-amber-50/10 backdrop-blur-lg transition-all group-hover:border-amber-100/40" />

//                 {/* 视频容器 */}
//                 <div className="relative h-full w-full overflow-hidden">
//                   <video
//                     src={`/videos/${video}.mp4`}
//                     className="h-full w-full object-cover mix-blend-multiply brightness-110 saturate-120"
//                     muted
//                     loop
//                     preload="metadata"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-amber-200/20" />
//                 </div>

//                 {/* 装饰图标 */}
//                 <div className="absolute left-4 top-4 rounded-full bg-amber-100/90 p-2 backdrop-blur-sm">
//                   <PlayIcon className="h-5 w-5 text-amber-700" />
//                 </div>

//                 {/* 标题卡片 */}
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-800/70 to-transparent p-4 pb-30 text-center">
//                   <span className="font-bold text-amber-50 drop-shadow-md text-3xl">
//                     {video.charAt(0).toUpperCase() + video.slice(1)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// // 播放图标组件
// function PlayIcon({ className }) {
//   return (
//     <svg
//       className={className}
//       fill="currentColor"
//       viewBox="0 0 24 24"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path d="M6 3l14 9-14 9V3z" />
//     </svg>
//   );
// }


import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function VideoList() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(savedProjects.length ? savedProjects : [{
      id: 1,
      name: "HIIT Workout",
      description: "Super Course", // 更新为中文描述
      firstVideo: "1.mov"
    }]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center bg-amber-50 p-8">
      {/* 标题栏容器 */}
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          {/* 主标题 */}
          <h1 className="font-serif text-3xl text-amber-800">
            Storyliner
            <span className="block mt-2 text-lg font-normal text-amber-600/90">
              Make your stories shine.
            </span>
          </h1>

          {/* 新建按钮 */}
          <button
            onClick={() => navigate('/creator/new')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 px-6 py-3 
                     shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/60
                     transition-all duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10 font-medium text-amber-50">
              New Project
            </span>
            {/* 按钮悬浮背景光 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity
                          bg-[radial-gradient(at_top_right,_var(--tw-gradient-stops))] 
                          from-amber-200/50 via-transparent to-transparent" />
          </button>
        </div>

        {/* 项目网格 */}
        <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link 
              to={`/player/${project.firstVideo}`} 
              key={project.id}
              className="group relative flex justify-center perspective-[1000px]"
            >
              {/* 卡片容器 */}
              <div className="h-full w-full transform-gpu transition-all duration-300 hover:scale-[1.02]">
                <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl shadow-amber-200/40 transition-all duration-500 group-hover:[transform:rotateX(6deg)_rotateY(2deg)_perspective(1000px)]">
                  
                  {/* 3D边框层 */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-amber-50/20 bg-amber-50/10 backdrop-blur-lg" />

                  {/* 视频容器 */}
                  <div className="relative h-full w-full transform-gpu preserve-3d">
                    <video
                      src={`/videos/${project.firstVideo}`}
                      className="h-full w-full object-cover mix-blend-multiply brightness-110 saturate-120"
                      muted
                      loop
                      preload="metadata"
                    />
                    <div className="absolute inset-0 transform-gpu preserve-3d">
                      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 via-transparent to-amber-200/20" />
                    </div>
                  </div>

                  {/* 标题区 */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-800/90 via-amber-800/50 to-transparent p-1 pt-4">
  <h3 className="mb-1 text-center text-lg md:text-3xl font-medium text-amber-50 drop-shadow-md">
    {project.name}
    <span className="mt-1 block text-base md:text-lg font-normal text-amber-200/90">
      {project.description}
    </span>
  </h3>
</div>
                  
                  {/* 项目角标 */}
                  <div className="absolute left-4 top-4 flex items-center space-x-2">
                    {/* <div className="rounded-lg bg-amber-800/90 px-3 py-1.5 text-xs font-medium text-amber-50 backdrop-blur-sm">
                      ID: {project.id}
                    </div> */}
                    {/* 播放按钮 */}
                    <div className="rounded-full bg-amber-100/90 p-2 backdrop-blur-sm">
                      <svg className="h-4 w-4 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
