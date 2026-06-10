document.addEventListener('DOMContentLoaded', async () => {
    // Get lesson index from body attribute (e.g., <body data-lesson-index="0">)
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
            document.querySelector('main').innerHTML = '<h2>Lesson not found</h2><a href="../index.html" class="btn-primary">Back to Home</a>';
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

        // Setup Navigation Buttons
        const prevBtn = document.getElementById('prev-lesson-btn');
        const nextBtn = document.getElementById('next-lesson-btn');
        
        if (lessonIndex > 0) {
            prevBtn.href = `lesson${lessonIndex}.html`;
            prevBtn.style.display = 'block';
        }
        if (lessonIndex < lessons.length - 1) {
            nextBtn.href = `lesson${lessonIndex + 2}.html`;
            nextBtn.style.display = 'block';
        }

        // Initialize Custom Audio Player
        initAudioPlayer(audioEl);

    } catch (error) {
        console.error('Error loading lesson:', error);
    }
});

// =========================================
// CUSTOM AUDIO PLAYER
// =========================================
function initAudioPlayer(audio) {
    const playBtn = document.getElementById('play-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeControl = document.getElementById('volume-control');
    const speedControl = document.getElementById('speed-control');

    // Play/Pause
    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        }
    });

    // Time Update
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress || 0;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        durationEl.textContent = formatTime(audio.duration || 0);
    });

    // Seek
    progressBar.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    // Volume
    volumeControl.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    // Speed
    speedControl.addEventListener('change', (e) => {
        audio.playbackRate = parseFloat(e.target.value);
    });
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Toggle Answer Key
document.querySelectorAll('.toggle-answer').forEach(btn => {
    btn.addEventListener('click', () => {
        const key = btn.nextElementSibling;
        key.classList.toggle('visible');
        btn.textContent = key.classList.contains('visible') ? 'Hide Answer' : 'Show Answer';
    });
});
