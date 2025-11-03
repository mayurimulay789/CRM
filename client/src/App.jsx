import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DemoPage from "./components/Demo/DemoPage";
import OnlineDemo from "./components/Demo/OnlineDemo";
import OfflineDemo from "./components/Demo/OfflineDemo";
import OneToOneDemo from "./components/Demo/OneToOneDemo";
import LiveClasses from "./components/Demo/LiveClasses";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DemoPage />} />
        <Route path="/online-demo" element={<OnlineDemo />} />
        <Route path="/offline-demo" element={<OfflineDemo />} />
        <Route path="/one-to-one-demo" element={<OneToOneDemo />} />
        <Route path="/live-classes" element={<LiveClasses />} />
      </Routes>
    </Router>
  );
};

export default App;
