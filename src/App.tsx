import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import GistView from "./pages/GistView";
import Donate from "./pages/Donate";

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/gists" element={<Home />} />
          <Route path="/route/gist/:filename" element={<GistView />} />
          <Route path="/donate" element={<Donate />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
