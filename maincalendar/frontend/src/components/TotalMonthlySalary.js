import React, { useState, useEffect } from 'react';

const TotalMonthlySalary = () => {
    const [albaList, setAlbaList] = useState([]);
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        // 알바 정보 가져오기
        const fetchAlbaList = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/alba');
                if (!response.ok) {
                    throw new Error(`Failed to fetch alba data: ${response.statusText}`);
                }
                const data = await response.json();
                setAlbaList(data);
            } catch (error) {
                console.error('Error fetching alba data:', error);
            }
        };

        // 모든 일정 정보 가져오기
        const fetchAllSchedules = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/schedule');
                if (!response.ok) {
                    throw new Error(`Failed to fetch schedule data: ${response.statusText}`);
                }
                const data = await response.json();
                setSchedules(data);
            } catch (error) {
                console.error('Error fetching schedule data:', error);
            }
        };

        fetchAlbaList();
        fetchAllSchedules();
    }, []);

    // 월급 총합 계산 함수
    const calculateTotalMonthlySalary = () => {
        if (!albaList || !schedules) return 0;

        let totalMonthlySalary = 0;

        // 각 알바별로 반복
        albaList.forEach(alba => {
            // 알바의 총 월급 초기화
            let albaTotalSalary = 0;

            // 알바의 일정별로 반복
            schedules.forEach(schedule => {
                // 해당 알바와 관련된 일정이면서 시간대가 겹치는 경우에만 계산
                if (schedule.albaId === alba.id && isTimeOverlap(alba.startTime, alba.endTime, schedule.startTime, schedule.endTime)) {
                    // 일정 시간에 따라 시급 계산
                    const hourlyWage = parseFloat(schedule.hourlyWage);
                    const startTime = new Date(schedule.startTime);
                    const endTime = new Date(schedule.endTime);
                    const durationHours = (endTime - startTime) / (1000 * 60 * 60); // 시간 차이 계산

                    // 알바의 총 월급에 일정의 시급을 누적
                    albaTotalSalary += hourlyWage * durationHours;
                }
            });

            // 전체 알바의 총 월급에 해당 알바의 총 월급을 누적
            totalMonthlySalary += albaTotalSalary;
        });

        return totalMonthlySalary;
    };

    // 두 시간대가 겹치는지 여부를 확인하는 함수
    const isTimeOverlap = (startA, endA, startB, endB) => {
        const startTimeA = new Date(`2000-01-01T${startA}`);
        const endTimeA = new Date(`2000-01-01T${endA}`);
        const startTimeB = new Date(startB);
        const endTimeB = new Date(endB);

        return startTimeA < endTimeB && endTimeA > startTimeB;
    };

    return (
        <div className="total-monthly-salary">
            <p>이번달 총 급여: {calculateTotalMonthlySalary()}원</p>
        </div>
    );
};

export default TotalMonthlySalary;
