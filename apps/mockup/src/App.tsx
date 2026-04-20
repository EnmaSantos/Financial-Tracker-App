import { Route, Routes } from "react-router";
import { Shell } from "./design/shell";
import { Dashboard } from "./screens/Dashboard";
import { Accounts } from "./screens/Accounts";
import { Goals } from "./screens/Goals";
import { Scenarios } from "./screens/Scenarios";
import { Timeline } from "./screens/Timeline";
import { Upload } from "./screens/Upload";
import { Settings } from "./screens/Settings";
import { useApplyTheme } from "./state/app";

export default function App() {
  useApplyTheme();
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Shell>
  );
}
