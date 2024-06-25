import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "../src/components/Navigation";
import Calendar from "../src/components/Calendar";
// 다른 컴포넌트들도 import

const App = () => {
    return (
        <Router>
            <div>
                <Navigation />
                <div className="content">
                    <Routes>
                        <Route path="/calendar" element={<Calendar />} />
                        {/* 다른 경로에 대한 Route도 추가 */}
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;
