document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const addJobBtn = document.getElementById('add-job-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const jobListView = document.getElementById('job-list-view');
    const addJobView = document.getElementById('add-job-view');
    const jobForm = document.getElementById('job-form');
    const jobList = document.querySelector('.job-list');
    const jobPaydaySelect = document.getElementById('payDay');
    const formTitle = document.getElementById('form-title');
    let editIndex = null;

    // 급여 지급일 선택 옵션 추가
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}일`;
        jobPaydaySelect.appendChild(option);
    }

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    addJobBtn.addEventListener('click', () => {
        jobForm.reset();
        editIndex = null;
        formTitle.textContent = '아르바이트 추가';
        jobListView.style.display = 'none';
        addJobView.style.display = 'block';
    });

    cancelBtn.addEventListener('click', () => {
        jobForm.reset(); // 폼 리셋
        jobListView.style.display = 'block';
        addJobView.style.display = 'none';
    });

    jobForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const hourlyWage = document.getElementById('hourlyWage').value;
        const payDay = document.getElementById('payDay').value;
        const repeatDays = Array.from(document.querySelectorAll('input[name="repeatDays"]:checked')).map(option => option.value).join(',');
        const color = document.querySelector('input[name="color"]:checked').value;
        const includesRestPay = document.getElementById('includesRestPay').checked ? 1 : 0;
        const includesRepeat = repeatDays.length > 0 ? 1 : 0;

        const jobData = {
            name,
            hourlyWage,
            includesRestPay,
            color,
            startTime,
            endTime,
            repeatDays,
            payDay,
            includesRepeat
        };

        console.log('Sending data to server:', jobData); // 디버깅용 콘솔 로그

        // 서버에 데이터 전송
        fetch('/save-job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jobData)
        }).then(response => response.json())
        .then(data => {
            if (data.success) {
                if (editIndex !== null) {
                    // 아르바이트 수정
                    const jobItem = jobList.children[editIndex];
                    jobItem.querySelector('.job-info').innerHTML = `${name} - ${startTime} ~ ${endTime}`;
                    jobItem.querySelector('.details').innerHTML = `
                        <p>시급: ${hourlyWage}</p>
                        <p>급여 지급일: ${payDay}일</p>
                        <p>반복: ${repeatDays.split(',').join(', ')}</p>
                        <p>색상: ${color}</p>
                    `;
                } else {
                    // 아르바이트 추가
                    const jobItem = document.createElement('div');
                    jobItem.classList.add('job-item');
                    jobItem.innerHTML = `
                        <div class="job-info">${name} - ${startTime} ~ ${endTime}</div>
                        <p>시급: ${hourlyWage}</p>
                        <div class="details">                    
                            <p>급여 지급일: ${payDay}일</p>
                            <p>반복: ${repeatDays.split(',').join(', ')}</p>
                            <p>색상: ${color}</p>
                        </div>
                        <div class="job-item-buttons">
                            <button class="more-btn">더보기</button>
                            <button class="edit-btn">수정</button>
                            <button class="delete-btn">삭제</button>
                        </div>
                    `;
                    jobList.appendChild(jobItem);

                    jobItem.querySelector('.more-btn').addEventListener('click', () => {
                        const details = jobItem.querySelector('.details');
                        details.style.display = details.style.display === 'block' ? 'none' : 'block';
                    });

                    jobItem.querySelector('.delete-btn').addEventListener('click', () => {
                        jobList.removeChild(jobItem);
                    });

                    jobItem.querySelector('.edit-btn').addEventListener('click', () => {
                        editIndex = Array.from(jobList.children).indexOf(jobItem);

                        // 기존 데이터로 폼 채우기
                        document.getElementById('name').value = jobData.name;
                        document.getElementById('startTime').value = jobData.startTime;
                        document.getElementById('endTime').value = jobData.endTime;
                        document.getElementById('hourlyWage').value = jobData.hourlyWage;
                        document.getElementById('payDay').value = jobData.payDay;
                        document.querySelectorAll('input[name="repeatDays"]').forEach(checkbox => {
                            checkbox.checked = jobData.repeatDays.includes(checkbox.value);
                        });
                        document.querySelector(`input[name="color"][value="${jobData.color}"]`).checked = true;
                        document.getElementById('includesRestPay').checked = jobData.includesRestPay === 1;

                        formTitle.textContent = '아르바이트 수정';
                        jobListView.style.display = 'none';
                        addJobView.style.display = 'block';
                    });
                }

                jobListView.style.display = 'block';
                addJobView.style.display = 'none';
            } else {
                alert('저장 중 오류가 발생했습니다.');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('저장 중 오류가 발생했습니다.');
        });
    });
});

