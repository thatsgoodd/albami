import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import style from '../style/Calendar.css';
import AlbaInfoPopup from './AlbaInfoPopup';
import TotalMonthlySalary from './TotalMonthlySalary';
import TotalWeeklySalary from './TotalWeeklySalary';
import CountdownDropdown from './CountdownDropdown';
import ScheduleForm from './ScheduleForm';
import './Popup.css';

const cx = classNames.bind(style);

const Calendar = () => {
    const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().getDate(),
    };

    const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [selectedYear, setSelectedYear] = useState(today.year);
    const [selectedMonth, setSelectedMonth] = useState(today.month);
    const [selectedAlba, setSelectedAlba] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSchedules, setSelectedSchedules] = useState([]);
    const [isAddSchedulePopupOpen, setIsAddSchedulePopupOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const dateTotalCount = new Date(selectedYear, selectedMonth, 0).getDate();

    const prevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const nextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const monthControl = () => {
        let monthArr = [];
        for (let i = 0; i < 12; i++) {
            monthArr.push(
                <option key={i + 1} value={i + 1}>
                    {i + 1}
                </option>
            );
        }
        return (
            <select onChange={changeSelectMonth} value={selectedMonth}>
                {monthArr}
            </select>
        );
    };

    const yearControl = () => {
        let yearArr = [];
        const startYear = today.year - 10;
        const endYear = today.year + 10;
        for (let i = startYear; i < endYear + 1; i++) {
            yearArr.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }
        return (
            <select onChange={changeSelectYear} value={selectedYear}>
                {yearArr}
            </select>
        );
    };

    const changeSelectMonth = (e) => {
        setSelectedMonth(Number(e.target.value));
    };

    const changeSelectYear = (e) => {
        setSelectedYear(Number(e.target.value));
    };

    const returnWeek = () => {
        let weekArr = [];
        week.forEach((v) => {
            weekArr.push(
                <div
                    key={v}
                    className={cx(
                        { weekday: true },
                        { sunday: v === 'Sun' },
                        { saturday: v === 'Sat' }
                    )}
                >
                    {v}
                </div>
            );
        });
        return weekArr;
    };

    const returnDay = () => {
        let dayArr = [];
        let weekIndex = 0;
        const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();

        // 첫 번째 주 이전 빈칸 채우기
        for (let i = 0; i < firstDayOfMonth; i++) {
            dayArr.push(<div className="weekday" key={`empty-${i}`}></div>);
        }

        for (let i = 0; i < dateTotalCount; i++) {
            if ((i + firstDayOfMonth) % 7 === 0) {
                weekIndex++;
                dayArr.push(
                    <div key={`week${weekIndex}`} className="weekly-salary">
                        <TotalWeeklySalary weekIndex={weekIndex} />
                    </div>
                );
            }

            dayArr.push(
                <div
                    key={i + 1}
                    className={cx(
                        {
                            today:
                                today.year === selectedYear &&
                                today.month === selectedMonth &&
                                today.date === i + 1,
                        },
                        { weekday: true },
                        {
                            sunday:
                                new Date(selectedYear, selectedMonth - 1, i + 1).getDay() ===
                                0,
                        },
                        {
                            saturday:
                                new Date(selectedYear, selectedMonth - 1, i + 1).getDay() ===
                                6,
                        }
                    )}
                    onClick={() =>
                        handleDateClick(new Date(selectedYear, selectedMonth - 1, i + 1))
                    }
                >
                    {i + 1}
                </div>
            );
        }

        return dayArr;
    };

    const handleDateClick = async (date) => {
        try {
            setLoading(true);

            const dayOfWeek = date.getDay();
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayOfWeekString = daysOfWeek[dayOfWeek];

            const response = await fetch(
                `http://localhost:8080/api/alba?days=${dayOfWeekString}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();
            setSelectedAlba(data || []);
            setSelectedDate(date); // 클릭한 날짜를 상태에 저장
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClosePopup = () => {
        setIsAddSchedulePopupOpen(false);
    };

    const handleAddScheduleClick = () => {
        setIsAddSchedulePopupOpen(true);
    };

    return (
        <div className="container">
            <div className="header-row">
                <div className="pagination">
                    <button onClick={prevMonth}>◀︎</button>
                    <div className="title">
                        {yearControl()} 년 {monthControl()} 월
                    </div>
                    <button onClick={nextMonth}>▶︎</button>
                </div>
                <div className="info">
                    <TotalMonthlySalary />
                    <CountdownDropdown />
                </div>
            </div>
            <div className="week">{returnWeek()}</div>
            <div className="date">{returnDay()}</div>

            {selectedAlba && selectedAlba.length > 0 && (
                <AlbaInfoPopup
                    alba={selectedAlba}
                    onClose={() => setSelectedAlba([])}
                    onAddSchedule={handleAddScheduleClick}
                    clickedDate={selectedDate} // 클릭한 날짜 전달
                />
            )}
            {isAddSchedulePopupOpen && (
                <div className="overlay">
                    <div className="popup">
                        <ScheduleForm onClose={handleClosePopup} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
