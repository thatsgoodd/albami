document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const addJobBtn = document.getElementById('add-job-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const jobListView = document.getElementById('job-list-view');
    const addJobView = document.getElementById('add-job-view');
    const jobForm = document.getElementById('job-form');
    const jobList = document.querySelector('.job-list');
    const jobPaydaySelect = document.getElementById('job-payday');
    const formTitle = document.getElementById('form-title');
    let editIndex = null;

    // 급여 지급일 선택 옵션
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
        jobListView.style.display = 'block';
        addJobView.style.display = 'none';
    });

    jobForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const jobName = document.getElementById('job-name').value;
        const startTime = document.getElementById('job-start-time').value;
        const endTime = document.getElementById('job-end-time').value;
        const wage = document.getElementById('job-wage').value;
        const payday = document.getElementById('job-payday').value;
        const repeatOptionsChecked = Array.from(document.querySelectorAll('input[name="repeat-options"]:checked')).map(option => option.value);
        const color = document.querySelector('input[name="color"]:checked').value;

        // 시작,종료시간-> n시간
        const start = new Date(`1970-01-01T${startTime}:00`);
        const end = new Date(`1970-01-01T${endTime}:00`);
        let totalHours = (end - start) / (1000 * 60 * 60);
        if (totalHours < 0) totalHours += 24;

        const jobData = {
            jobName,
            startTime,
            endTime,
            wage,
            payday,
            repeatOptions: repeatOptionsChecked,
            color,
            totalHours
        };

        if (editIndex !== null) {
            // 아르바이트 수정
            const jobItem = jobList.children[editIndex];
            jobItem.querySelector('.job-info').innerHTML = `${jobName} - ${startTime} ~ ${endTime} (${totalHours.toFixed(2)}시간)`;
            jobItem.querySelector('.details').innerHTML = `
                <p>시급: ${wage}</p>
                <p>급여 지급일: ${payday}일</p>
                <p>요일 반복: ${repeatOptionsChecked.join(', ')}</p>
                <p>색상: ${color}</p>
            `;
        } else {
            // 아르바이트 추가
            const jobItem = document.createElement('div');
            jobItem.classList.add('job-item');
            jobItem.innerHTML = `
                <div class="job-info">${jobName} - ${startTime} ~ ${endTime} (${totalHours.toFixed(2)}시간)</div>
                <p>시급: ${wage}</p>
                <div class="details">                    
                    <p>급여 지급일: ${payday}일</p>
                    <p>반복: ${repeatOptionsChecked.join(', ')}</p>
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
                document.getElementById('job-name').value = jobData.jobName;
                document.getElementById('job-start-time').value = jobData.startTime;
                document.getElementById('job-end-time').value = jobData.endTime;
                document.getElementById('job-wage').value = jobData.wage;
                document.getElementById('job-payday').value = jobData.payday;
                document.querySelectorAll('input[name="repeat-options"]').forEach(checkbox => {
                    checkbox.checked = jobData.repeatOptions.includes(checkbox.value);
                });
                document.querySelector(`input[name="color"][value="${jobData.color}"]`).checked = true;

                formTitle.textContent = '아르바이트 수정';
                jobListView.style.display = 'none';
                addJobView.style.display = 'block';
            });
        }

        jobListView.style.display = 'block';
        addJobView.style.display = 'none';
    });
});
