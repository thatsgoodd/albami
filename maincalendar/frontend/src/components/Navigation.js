// Navigation.js

import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/mypage">마이페이지</Link></li>
                <li><Link to="/calendar">캘린더</Link></li>
                <li><Link to="/jobmanagement">내 아르바이트 관리</Link></li>
                <li><Link to="/salaryrecord">급여기록 관리</Link></li>
                <li><Link to="/friendschedule">내 친구 일정</Link></li>
                <li><Link to="/expenseplan">지출계획서</Link></li>
                <li><Link to="/legalities">아르바이트 법적사항</Link></li>
            </ul>
        </nav>
    );
};

export default Navigation;
