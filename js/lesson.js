document.addEventListener('DOMContentLoaded', async () => {
    const lessonIndex = parseInt(document.body.getAttribute('data-lesson-index'), 10);
    
    if (isNaN(lessonIndex)) {
        console.error('Lesson index not found');
        return;
    }

    try {
        const response = await fetch('../data/lessons.json');
        const lessons = await response.json();
        const lesson = lessons[lessonIndex];

        if (!lesson) {
            document.querySelector('main').innerHTML = '<h2>Không tìm thấy bài học</h2><a href="../index.html" class="btn-primary">Về trang chủ</a>';
            return;
        }

        // Populate Lesson Data
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-desc').textContent = lesson.description;
        document.getElementById('category-badge').textContent = lesson.category;
        document.getElementById('level-badge').textContent = lesson.level;
        document.getElementById('duration-badge').textContent = `⏱️ ${lesson.duration}`;
        
        const audioEl = document.getElementById('lesson-audio');
        audioEl.src = '../' + lesson.audio;

        // Setup Navigation
        const prevBtn = document.getElementById('prev-lesson-btn');
        const nextBtn = document.getElementById('next-lesson-btn');
        if (lessonIndex > 0) { prevBtn.href = `lesson${lessonIndex}.html`; prevBtn.style.display = 'block'; }
        if (lessonIndex < lessons.length - 1) { nextBtn.href = `lesson${lessonIndex + 2}.html`; nextBtn.style.display = 'block'; }

        initAudioPlayer(audioEl);
        initStudentName();
        checkGlobalCompletion(); // Check initial state

    } catch (error) {
        console.error('Error loading lesson:', error);
    }
});

// =========================================
// STUDENT NAME MANAGEMENT
// =========================================
function initStudentName() {
    const nameInput = document.getElementById('student-name');
    const savedName = localStorage.getItem('student_name_ms_thuy');
    if (savedName) nameInput.value = savedName;

    nameInput.addEventListener('input', (e) => {
        localStorage.setItem('student_name_ms_thuy', e.target.value.trim());
    });
}

// =========================================
// EXERCISE CHECKING LOGIC
// =========================================
function checkExercise(exId, type) {
    const section = document.getElementById(`exercise-${exId}`);
    let totalQuestions = 0;
    let correctCount = 0;

    if (type === 'text') {
        const inputs = section.querySelectorAll('input[data-answer]');
        totalQuestions = inputs.length;
        inputs.forEach(input => {
            const userAnswer = input.value.trim().toLowerCase();
            const correctAnswer = input.getAttribute('data-answer').toLowerCase();
            
            input.classList.remove('input-correct', 'input-incorrect');
            if (userAnswer === correctAnswer && userAnswer !== '') {
                input.classList.add('input-correct');
                correctCount++;
            } else {
                input.classList.add('input-incorrect');
            }
        });
    } 
    else if (type === 'radio') {
        const questions = section.querySelectorAll('.exercise-item');
        totalQuestions = questions.length;
        questions.forEach(q => {
            const selected = q.querySelector('input[type="radio"]:checked');
            const correctOption = q.querySelector('input[data-answer="true"]');
            
            // Reset previous styles
            q.querySelectorAll('label').forEach(lbl => lbl.parentElement.classList.remove('option-correct', 'option-incorrect'));

            if (selected) {
                if (selected.hasAttribute('data-answer')) {
                    selected.parentElement.classList.add('option-correct');
                    correctCount++;
                } else {
                    selected.parentElement.classList.add('option-incorrect');
                }
            }
        });
    } 
    else if (type === 'select') {
        const selects = section.querySelectorAll('select[data-answer]');
        totalQuestions = selects.length;
        selects.forEach(select => {
            const userAnswer = select.value;
            const correctAnswer = select.getAttribute('data-answer');
            
            select.classList.remove('input-correct', 'input-incorrect');
            if (userAnswer === correctAnswer) {
                select.classList.add('input-correct');
                correctCount++;
            } else if (userAnswer !== '') {
                select.classList.add('input-incorrect');
            }
        });
    }

    // Update Score Display
    const scoreDisplay = document.getElementById(`score-${exId}`);
    scoreDisplay.textContent = `${correctCount}/${totalQuestions} câu đúng`;
    
    if (correctCount === totalQuestions && totalQuestions > 0) {
        scoreDisplay.classList.add('perfect');
        scoreDisplay.textContent += ' (Xuất sắc!)';
    } else {
        scoreDisplay.classList.remove('perfect');
    }

    // Mark this exercise as completed in localStorage to track global progress
    localStorage.setItem(`lesson_ex_${exId}_done`, 'true');
    checkGlobalCompletion();
}

function resetExercise(exId, type) {
    const section = document.getElementById(`exercise-${exId}`);
    
    if (type === 'text' || type === 'select') {
        const inputs = section.querySelectorAll('input[data-answer], select[data-answer]');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('input-correct', 'input-incorrect');
        });
    } else if (type === 'radio') {
        const radios = section.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = false;
            radio.parentElement.classList.remove('option-correct', 'option-incorrect');
        });
    }

    document.getElementById(`score-${exId}`).textContent = 'Chưa làm';
    document.getElementById(`score-${exId}`).classList.remove('perfect');
    
    localStorage.removeItem(`lesson_ex_${exId}_done`);
    checkGlobalCompletion();
}

// =========================================
// GLOBAL COMPLETION & TRANSCRIPT UNLOCK
// =========================================
function checkGlobalCompletion() {
    // Check if all 4 exercises have been marked as done
    const ex1 = localStorage.getItem('lesson_ex_1_done') === 'true';
    const ex2 = localStorage.getItem('lesson_ex_2_done') === 'true';
    const ex3 = localStorage.getItem('lesson_ex_3_done') === 'true';
    const ex4 = localStorage.getItem('lesson_ex_4_done') === 'true';

    const allDone = ex1 && ex2 && ex3 && ex4;
    const overlay = document.getElementById('transcript-overlay');
    const unlockBtn = document.getElementById('unlock-transcript-btn');
    const transcriptSection = document.getElementById('transcript-section');

    if (allDone) {
        unlockBtn.disabled = false;
        unlockBtn.classList.add('unlocked');
        unlockBtn.textContent = '🔓 Mở khóa Transcript';
        unlockBtn.onclick = () => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
                transcriptSection.classList.remove('transcript-locked');
            }, 300);
        };
    } else {
        unlockBtn.disabled = true;
        unlockBtn.classList.remove('unlocked');
        unlockBtn.textContent = '🔒 Hoàn thành tất cả bài tập để mở';
    }
}

// =========================================
// AUDIO PLAYER LOGIC (Giữ nguyên)
// =========================================
function initAudioPlayer(audio) {
    const playBtn = document.getElementById('play-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeControl = document.getElementById('volume-control');
    const speedControl = document.getElementById('speed-control');

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
    });

    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress || 0;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration || 0);
    });

    progressBar.addEventListener('input', (e) => {
        audio.currentTime = (e.target.value / 100) * audio.duration;
    });

    volumeControl.addEventListener('input', (e) => { audio.volume = e.target.value; });
    speedControl.addEventListener('change', (e) => { audio.playbackRate = parseFloat(e.target.value); });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
