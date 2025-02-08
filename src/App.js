import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoList from "./components/VideoList";
import VideoPlayer from "./components/VideoPlayer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoList />} />
        <Route path="/player/:videoName" element={<VideoPlayer />} />
      </Routes>
    </Router>
  );
}