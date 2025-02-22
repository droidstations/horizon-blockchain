import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Blocks from "./components/Blocks";
import Block from "./components/Block";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Blocks />} />
                <Route path="/block/:id" element={<Block />} />
            </Routes>
        </Router>
    );
};

export default App;
