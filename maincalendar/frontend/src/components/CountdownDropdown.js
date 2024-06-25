import React, { useState, useEffect } from "react";

const AlbaInfoDropdown = () => {
    const [albaList, setAlbaList] = useState([]);
    const [selectedAlba, setSelectedAlba] = useState('');
    const [payDay, setPayDay] = useState('');
    const [daysUntilPayDay, setDaysUntilPayDay] = useState('');

    useEffect(() => {
        const fetchAlbaList = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/alba/all');
                if (!response.ok) {
                    throw new Error(`Failed to fetch MyAlba data: ${response.statusText}`);
                }
                const data = await response.json();
                setAlbaList(data);

                // 기본적으로 첫 번째 알바를 선택하고 해당 payday를 설정
                if (data.length > 0) {
                    setSelectedAlba(data[0].name);
                    setPayDay(new Date(data[0].payDay));
                    calculateDaysUntilPayDay(new Date(data[0].payDay));
                }
            } catch (error) {
                console.error('Error fetching MyAlba data:', error);
            }
        };

        fetchAlbaList();
    }, []);

    const handleAlbaChange = (e) => {
        const selectedName = e.target.value;
        setSelectedAlba(selectedName);

        // 선택한 알바명에 따라 payday 설정
        const selectedAlbaInfo = albaList.find(alba => alba.name === selectedName);
        if (selectedAlbaInfo) {
            setPayDay(new Date(selectedAlbaInfo.payDay));
            calculateDaysUntilPayDay(new Date(selectedAlbaInfo.payDay));
        }
    };

    const calculateDaysUntilPayDay = (selectedPayDay) => {
        const currentDate = new Date();
        const diffTime = Math.abs(selectedPayDay - currentDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysUntilPayDay(diffDays);
    };

    const options = albaList.map((alba, index) => (
        <option key={index} value={alba.name}>{alba.name}</option>
    ));

    return (
        <div className="alba-info-dropdown">
            <select value={selectedAlba} onChange={handleAlbaChange}>
                {options}
            </select>
            {payDay && (
                <p>Payday: {payDay.toLocaleDateString('ko-KR')}</p>
            )}
            {daysUntilPayDay !== '' && (
                <p>남은 일수: {daysUntilPayDay}일</p>
            )}
        </div>
    );
};

export default AlbaInfoDropdown;
