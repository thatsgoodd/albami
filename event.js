window.onload = function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    document.getElementById('yearMonth').value = `${year}-${month}`;
};

//button color change
function toggleColors1() {
    let button1 = document.getElementById('perJob');
    let button2 = document.getElementById('totalBtn');

    if (!button1.disabled) {
        button1.style.backgroundColor = '#D9BCA9';
        button2.style.backgroundColor = '#FFFFFF';
    } else if (!button2.disabled) {
        // 버튼1의 배경색과 버튼2의 배경색을 서로 교환
        let tempColor = button1.style.backgroundColor;
        button1.style.backgroundColor = button2.style.backgroundColor;
        button2.style.backgroundColor = tempColor;
    }
}

function toggleColors2() {
    let button1 = document.getElementById('perJob');
    let button2 = document.getElementById('totalBtn');

    if (!button2.disabled) {
        button2.style.backgroundColor = '#D9BCA9';
        button1.style.backgroundColor = '#FFFFFF';
    } else if (!button1.disabled) {
        // 버튼1의 배경색과 버튼2의 배경색을 서로 교환
        let tempColor = button1.style.backgroundColor;
        button1.style.backgroundColor = button2.style.backgroundColor;
        button2.style.backgroundColor = tempColor;
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const perJobButton = document.getElementById('perJob');
    const totalBtn = document.getElementById('totalBtn');
    const jobsIncomeResult = document.getElementById('jobs');
    const totalIncomeResult = document.getElementById('totalIncome');
    const weekIncomeResult = document.getElementById('weekIncome');
    const nightIncomeResult = document.getElementById('nightIncome');
    const etcIncomeResult = document.getElementById('etcIncome');
    const logo2 = document.getElementById('logo2');

    // Check if all necessary elements are correctly selected
    // if (!perJobButton || !totalBtn || !jobsIncomeResult || !totalIncomeResult || !weekIncomeResult || !nightIncomeResult || !etcIncomeResult || !logo2) {
    //     console.error('One or more elements are not found. Please check your HTML structure.');
    //     return;
    // }

    if (!perJobButton) {
        console.error('perJobButton');
        return;
    }
    if (!totalBtn) {
        console.error('tatal btn error');
        return;
    }

    if (!jobsIncomeResult) {
        console.error('jobsIncomeResult');
        return;
    }
    if (!totalIncomeResult) {
        console.error('totalIncomeResult');
        return;
    }
    if (!weekIncomeResult) {
        console.error('weekIncomeResult.');
        return;
    }
    if (!nightIncomeResult) {
        console.error('nightIncomeResult.');
        return;
    }
    if (!etcIncomeResult) {
        console.error('etcIncomeResult');
        return;
    }
    if (!logo2) {
        console.error('logo2');
        return;
    }

    // totalBtn 클릭 시 총 수입 표시
    totalBtn.addEventListener('click', function () {
        console.log('totalBtn is clicked');
        if (perJobButton.disabled) {
            perJobButton.disabled = false;
            jobsIncomeResult.innerHTML = ''; // 알바별 수입 목록 비우기
            totalIncomeResult.innerHTML = ''; // 총 수입 내용 비우기
            weekIncomeResult.innerHTML = ''; // 주간 수입 내용 비우기
            nightIncomeResult.innerHTML = ''; // 야간 수입 내용 비우기
            etcIncomeResult.innerHTML = ''; // 기타 수입 내용 비우기
            logo2.style.display = 'none'; // 이미지 숨기기
            handleMonthDisplay(); // 월별 급여 표시 초기화
        } else {
            perJobButton.disabled = true;
            fetchTotalIncome().then(() => {
                handleMonthDisplay(); // totalIncome이 업데이트된 후 displaySelectedMonth 결과 처리
                logo2.style.display = 'block'; // 이미지 보이기
            });
        }
    });

    // perJobButton 클릭 시 알바별 수입 목록 표시
    perJobButton.addEventListener('click', function () {
        console.log('perJob is clicked');
        if (totalBtn.disabled) {
            totalBtn.disabled = false;
            jobsIncomeResult.innerHTML = ''; // 알바별 수입 목록 비우기
            totalIncomeResult.innerHTML = ''; // 총 수입 내용 비우기
            weekIncomeResult.innerHTML = ''; // 주간 수입 내용 비우기
            nightIncomeResult.innerHTML = ''; // 야간 수입 내용 비우기
            etcIncomeResult.innerHTML = ''; // 기타 수입 내용 비우기
            document.getElementById('monthResult').textContent = ''; // 월별 급여 표시 초기화
            logo2.style.display = 'none'; // 이미지 숨기기
        } else {
            totalBtn.disabled = true;
            fetchJobsIncome();
        }
    });

    // yearMonth 입력 필드의 변경 이벤트 처리
    document.getElementById('yearMonth').addEventListener('change', function () {
        handleMonthDisplay();
    });
});

// 알바별 수입 목록을 fetch하는 함수
async function fetchJobsIncome() {
    const jobsIncomeResult = document.getElementById('jobs');
    fetch('/jobs')
        .then(response => response.json())
        .then(data => {
            console.log(`data type is ${data}`);
            jobsIncomeResult.innerHTML = data.map(job => `
                        <div class="job-item">
                            <div class="job-summary">
                                <p>${job.name}: ￦${job.totalSalary}</p>
                                <button class="details-btn" data-job='${JSON.stringify(job)}'>자세히</button>
                            </div>
                            <div class="job-details" style="display: none;">
                            <p>급여일 매월 ${job.payDay}일</p>
                            <p>총 근무 시간 ${job.totalWorkHours} 시간</p>
                                <p>주휴 수당 ￦${job.holidayAllowance}</p>
                                <p>야간 수당 ￦${job.nightAllowance}</p>
                                <p>기타 수당 ￦${job.otherAllowance}</p>
                            </div>
                        </div>
                    `).join('');

            // 각 버튼에 대해 이벤트 리스너
            document.querySelectorAll('.details-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const jobItem = this.closest('.job-item');
                    const details = jobItem.querySelector('.job-details');

                    // 애니메이션 진행 중 여부를 체크하기 위한 플래그
                    if (details.classList.contains('animating')) {
                        return; // 애니메이션이 진행 중이면 클릭을 무시
                    }

                    details.classList.add('animating');

                    if (details.style.display === 'none' || details.style.display === '') {
                        details.style.display = 'block';
                        const height = details.scrollHeight;
                        details.style.height = '0px';
                        setTimeout(() => {
                            details.style.height = `${height}px`;
                            adjustParentHeight();
                        }, 0);
                    } else {
                        details.style.height = '0px';
                        details.addEventListener('transitionend', () => {
                            if (details.style.height === '0px') {
                                details.style.display = 'none';
                                adjustParentHeight();
                            }
                            details.classList.remove('animating');
                        }, { once: true });
                    }
                });
            });
            adjustParentHeight(); // 처음 데이터를 불러올 때 높이 조정
        });
}

function adjustParentHeight() {
    const frame2_1 = document.querySelector('.frame2-1');
    const rectangle = document.querySelector('.rectangle');
    const jobs = document.getElementById('jobs');

    // 부모 요소의 높이를 자식 요소의 높이에 맞춥니다.
    const jobsHeight = jobs.scrollHeight;
    rectangle.style.height = `${jobsHeight + 200}px`; // 필요한 경우 적절히 조정
    frame2_1.style.height = `${jobsHeight + 250}px`; // 필요한 경우 적절히 조정
}

// 총 수입을 fetch하는 함수
async function fetchTotalIncome(data) {
    const totalIncomeResult = document.getElementById('totalIncome');
    const weekIncomeResult = document.getElementById('weekIncome');
    const nightIncomeResult = document.getElementById('nightIncome');
    const etcIncomeResult = document.getElementById('etcIncome');

    return fetch(data)
        //.then(response => response.json())
        .then(data => {
            console.log(`print totalIncome: ${data.totalIncome}`);
            totalIncomeResult.innerHTML = `￦${data.totalIncome}`;
            weekIncomeResult.innerHTML = `주휴 수당 ￦${data.totalWeekIncome}`;
            nightIncomeResult.innerHTML = `야간 수당 ￦${data.totalNightIncome}`;
            etcIncomeResult.innerHTML = `기타 수당 ￦${data.totalEtcIncome}`;

        })
        .catch(error => console.error('Error fetching total income:', error));
}

// 월 표시
async function displaySelectedMonth() {
    const monthInput = document.getElementById('yearMonth').value;
    const url = `/jobs/total-income?selectedMonth=${monthInput}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Server response:', data);
    if (monthInput) {
        const date = new Date(monthInput);
        const month = date.toLocaleString('default', {month: 'long'});
        const output = document.getElementById('monthResult');
        output.textContent = `${month} 총 급여`;
        await fetchTotalIncome(data);
    }
}

// totalBtn의 상태에 따라 displaySelectedMonth() 결과를 처리하는 함수
function handleMonthDisplay() {
    const totalBtn = document.getElementById('totalBtn');
    const output = document.getElementById('monthResult');
    if (!totalBtn.disabled) {
        displaySelectedMonth();
    } else {
        output.textContent = ''; // totalBtn이 비활성화 상태일 때 결과를 비움
    }
}