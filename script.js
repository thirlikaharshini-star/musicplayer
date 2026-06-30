const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const musicGrid = document.getElementById('music-grid');

const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeSlider = document.getElementById('volume-slider');

const playerImg = document.getElementById('player-img');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');

let currentTrackList = [];
let isPlaying = false;

// 1. Fetch data from free iTunes Music API
async function searchMusic(query) {
    if (!query) return;
    musicGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">Tuning the frequencies...</div>`;
    
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=12`);
        const data = await response.json();
        currentTrackList = data.results;
        displayTracks(currentTrackList);
    } catch (error) {
        console.error("Error fetching data:", error);
        musicGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:red;">Failed to retrieve music. Check connection.</div>`;
    }
}

// 2. Display dynamic track cards in UI
function displayTracks(tracks) {
    musicGrid.innerHTML = '';
    if (tracks.length === 0) {
        musicGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; color:var(--text-muted);">No tracks found. Try another search!</div>`;
        return;
    }

    tracks.forEach((track, index) => {
        // Upgrading standard artwork resolution for sleek presentation
        const highResArtwork = track.artworkUrl100.replace('100x100bb', '400x400bb');
        
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="img-container">
                <img src="${highResArtwork}" alt="${track.trackName}">
                <div class="play-hover-btn">
                    <i class="fa-solid fa-play"></i>
                </div>
            </div>
            <h3>${track.trackName}</h3>
            <p>${track.artistName}</p>
        `;
        
        card.addEventListener('click', () => loadTrack(index));
        musicGrid.appendChild(card);
    });
}

// 3. Load Selected Song into player
function loadTrack(index) {
    const track = currentTrackList[index];
    audioPlayer.src = track.previewUrl; // 30-second audio stream snippet
    
    playerImg.src = track.artworkUrl100.replace('100x100bb', '300x300bb');
    playerTitle.textContent = track.trackName;
    playerArtist.textContent = track.artistName;
    
    playTrack();
}

function playTrack() {
    isPlaying = true;
    audioPlayer.play();
    playBtn.innerHTML = `<i class="fa-solid fa-pause"></i>`;
}

function pauseTrack() {
    isPlaying = false;
    audioPlayer.pause();
    playBtn.innerHTML = `<i class="fa-solid fa-play"></i>`;
}

// 4. Control Event Listeners
playBtn.addEventListener('click', () => {
    if (audioPlayer.src) {
        isPlaying ? pauseTrack() : playTrack();
    }
});

// Real-time Audio Progress bar synchronization
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = `${progressPercent}%`;
        
        // Format layout time counters
        let curMins = Math.floor(audioPlayer.currentTime / 60);
        let curSecs = Math.floor(audioPlayer.currentTime % 60);
        if (curSecs < 10) curSecs = `0${curSecs}`;
        currentTimeEl.textContent = `${curMins}:${curSecs}`;

        let durMins = Math.floor(audioPlayer.duration / 60);
        let durSecs = Math.floor(audioPlayer.duration % 60);
        if (durSecs < 10) durSecs = `0${durSecs}`;
        totalTimeEl.textContent = `${durMins}:${durSecs}`;
    }
});

// Click anywhere on progress timeline bar to skip audio
progressBarContainer.addEventListener('click', (e) => {
    const width = progressBarContainer.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if(duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});

// Smooth volume slider controller logic
volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

// Initialization triggers
searchBtn.addEventListener('click', () => searchMusic(searchInput.value));
searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') searchMusic(searchInput.value); });

// Run initial search layout compilation on browser launch
window.onload = () => searchMusic('The Weeknd');