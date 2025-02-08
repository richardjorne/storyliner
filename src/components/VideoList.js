import { useState } from "react";
import { Link } from "react-router-dom";

const videos = ["hiit", "relax"]; // Manually add video filenames

export default function VideoList() {
  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Select a Video</h1>
      <div className="grid grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <Link to={`/player/${video}.mp4`} key={index}>
            <div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition">
              <video src={`/videos/${video}`} className="w-full h-32 object-cover" />
              <p className="text-center mt-2">{video}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}