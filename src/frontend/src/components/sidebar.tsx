import NavItem from "./navItem";
import { useScrapeContext } from "../context/ScrapeContext";
import { useAnalysisContext } from "../context/AnalysisContext";

function Sidebar() {
  const { scraping } = useScrapeContext();
  const { analyzingCvId } = useAnalysisContext();

  return (
    <nav>
      <NavItem to="/" label="Dashboard" />
      <NavItem to="/cvs" label="CVs" indicator={analyzingCvId !== null} />
      <NavItem to="/matches" label="Matches" />
      <NavItem to="/jobs" label="Jobs" />
      <NavItem to="/cover-letters" label="Cover letters" />
      <NavItem to="/scrape" label="Scrape" indicator={scraping} />
    </nav>
  );
}

export default Sidebar;
