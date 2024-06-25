import React, { useState } from 'react';

function ScheduleForm({ onClose }) {
    const [form, setForm] = useState({
        name: '',
        payDay: '',
        startTime: '',
        endTime: '',
        hourlyWage: '',
        includesRestPay: false,
        includesRepeat: false,
        color: '',
        date : ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form data:', form);  // 로그 추가

        try {
            const response = await fetch('http://localhost:8080/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error('Failed to add schedule');
            }

            const data = await response.json();
            console.log('Success:', data);
            onClose();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                    &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4">일정 추가</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">아르바이트 이름*</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="아르바이트 이름"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">급여 지급일 입력*</label>
                        <input
                            type="number"
                            name="payDay"
                            value={form.payDay}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="급여 지급일 입력"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">시작 시간*</label>
                        <input
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">종료 시간*</label>
                        <input
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">오늘 날짜*</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">시급 입력*</label>
                        <input
                            type="number"
                            name="hourlyWage"
                            value={form.hourlyWage}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="시급 입력"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">반복 옵션 추가</label>
                        <input
                            type="text"
                            name="repeatDays"
                            value={form.repeatDays}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="반복 옵션 추가"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">주휴수당 여부</label>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="includesRestPay"
                                checked={form.includesRestPay}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-gray-700">예</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">반복옵션 여부</label>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="includesRepeat"
                                checked={form.includesRepeat}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-gray-700">예</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">색상 선택</label>
                        <div className="flex">
                            {['#FF8A80', '#FFD180', '#FFFF8D', '#CCFF90', '#A7FFEB', '#80D8FF', '#82B1FF', '#B388FF', '#F8BBD0'].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setForm({...form, color})}
                                    style={{backgroundColor: color}}
                                    className="w-8 h-8 rounded-full mr-2"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"  // type을 button으로 변경
                            className="px-4 py-2 bg-red-500 text-white rounded-lg mr-2"
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                            onClick={onClose}
                        >
                            확인
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default ScheduleForm;