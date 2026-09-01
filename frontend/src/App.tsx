import { Route, Routes } from "react-router-dom";
import { Page } from "./components/Page";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { JudgeSession } from "./pages/JudgeSession";
import { Leaderboards } from "./pages/Leaderboards";
import { MyRecord } from "./pages/MyRecord";
import { MySessions } from "./pages/MySessions";
import { Reveal } from "./pages/Reveal";
import { SignIn } from "./pages/SignIn";

export default function App() {
  return (
    <div className="min-h-full w-full bg-paper">
      <Sidebar />
      <main className="pl-[220px]">
        <Routes>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/judge/:battleId" element={<Page wide><JudgeSession /></Page>} />
          <Route path="/reveal/:battleId" element={<Page><Reveal /></Page>} />
          <Route path="/leaderboards" element={<Page wide><Leaderboards /></Page>} />
          <Route path="/sessions" element={<Page><MySessions /></Page>} />
          <Route path="/record" element={<Page><MyRecord /></Page>} />
          <Route path="/signin" element={<Page><SignIn /></Page>} />
        </Routes>
      </main>
    </div>
  );
}
