import React, { useState, useEffect } from 'react';
import './Popup.css';

const AlbaInfoPopup = ({ alba, onClose, onAddSchedule, clickedDate }) => {
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                if (!clickedDate) return; // 클릭한 날짜가 없으면 함수 종료

                const formattedDate = clickedDate.toISOString().split('T')[0];
                const url = `http://localhost:8080/api/schedule?date=${formattedDate}`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }

                const data = await response.json();
                setSchedules(data);
            } catch (error) {
                console.error('Error fetching schedules:', error);
            }
        };

        fetchSchedules();
    }, [clickedDate]);

    const formatDate = (date) => {
        if (!date) return '';
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ko-KR', options);
    };

    return (
        <div className="alba-info-popup">
            <button onClick={onClose} className="close-btn">X</button>
            <h2>선택한 날짜: {formatDate(clickedDate)}</h2>
            <h2>근무 기록</h2>
            {alba && alba.length > 0 && alba.map((item, index) => (
                <div key={index}>
                    <p>알바명: {item.name}</p>
                    <p>근무 시간: {item.startTime} - {item.endTime}</p>
                    <p>시급: {item.hourlyWage}</p>
                    <h3>+근무 일정</h3>
                    <ul>
                        {schedules.map((schedule, idx) => (
                            <li key={idx}>
                                <p>일정 이름: {schedule.name}</p>
                                <p>시작 시간: {schedule.startTime}</p>
                                <p>종료 시간: {schedule.endTime}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
            <button onClick={onAddSchedule} className="add-schedule-btn">
                일정 추가하기
            </button>
        </div>
    );
};

export default AlbaInfoPopup;
