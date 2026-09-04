import { Navigate, Route, Routes } from "react-router-dom";
import { Workspace } from "./pages/Workspace";
import { JudgeSession } from "./pages/JudgeSession";
import { Reveal } from "./pages/Reveal";
import { Leaderboard } from "./pages/Leaderboard";
import { Models } from "./pages/Models";
import { Projects } from "./pages/Projects";
import { About } from "./pages/About";
import { MyRecord } from "./pages/MyRecord";
import { SignIn } from "./pages/SignIn";

// Every page wraps itself in AppShell (sidebar + modals), so the router stays bare.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Workspace />} />
      <Route path="/judge/:battleId" element={<JudgeSession />} />
      <Route path="/reveal/:battleId" element={<Reveal />} />
      <Route path="/leaderboards" element={<Leaderboard />} />
      <Route path="/models" element={<Models />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/sessions" element={<Navigate to="/projects" replace />} />
      <Route path="/about" element={<About />} />
      <Route path="/record" element={<MyRecord />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="*" element={<Workspace />} />
    </Routes>
  );
}
