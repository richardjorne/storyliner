import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoList from "./components/VideoList";
import VideoPlayer from "./components/VideoPlayer";
import Creator from "./components/Creator";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VideoList />} />
        <Route path="/player/:videoName/:backToFile?" element={<VideoPlayer />} />
        <Route path="/creator/new" element={<Creator />}></Route>
      </Routes>
    </Router>
  );
}