import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrapeProvider } from "./context/ScrapeContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import Dashboard from "./pages/dashboard";
import CVsPage from "./pages/CVsPage";
import MatchesPage from "./pages/matchesPage";
import JobsPage from "./pages/jobsPage";
import CoverLettersPage from "./pages/coverlettersPage";
import ScrapePage from "./pages/scrapePage";

function App() {
  return (
    <BrowserRouter>
      <AnalysisProvider>
        <ScrapeProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cvs" element={<CVsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/cover-letters" element={<CoverLettersPage />} />
            <Route path="/scrape" element={<ScrapePage />} />
          </Routes>
        </ScrapeProvider>
      </AnalysisProvider>
    </BrowserRouter>
  );
}

export default App;
