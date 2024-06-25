import React from "react";

const TotalWeeklySalary = ({ albaList }) => {
    // albaList가 정의되어 있을 때만 reduce 메소드를 사용하여 주급 총합 계산
    const totalWeeklySalary = albaList ? albaList.reduce((total, alba) => {
        return total + alba.workHours * alba.dailyWage;
    }, 0) : 0;

    return (
        <div className="total-weekly-salary">
            <p>${totalWeeklySalary}</p>
        </div>
    );
};

export default TotalWeeklySalary;
