let waveSurfer = null;
let isMuted = false;
let lastVolume = parseFloat(localStorage.getItem('playerVolume')) || 0.5;

function initializeWaveSurfer(url, savedTime = 0, autoPlay = false) {
    if (waveSurfer) {
        waveSurfer.destroy();
    }

    waveSurfer = WaveSurfer.create({
        container: document.createElement('div'),
        waveColor: 'violet',
        progressColor: 'purple',
        barWidth: 2,
        cursorWidth: 1,
    });

    waveSurfer.load(url);

    waveSurfer.on('ready', () => {
        const savedVolume = parseFloat(localStorage.getItem('playerVolume')) || 0.5;
        waveSurfer.setVolume(savedVolume);
        document.getElementById('volume').value = savedVolume * 100;
        document.getElementById('volume').style.background = `linear-gradient(to right, violet 0%, violet ${savedVolume * 100}%, #ccc ${savedVolume * 100}%, #ccc 100%)`;
        if (savedTime) waveSurfer.seekTo(savedTime / waveSurfer.getDuration());

        if (autoPlay) {
            waveSurfer.play();
            document.getElementById('play-pause').innerText = '⏸';
        } else {
            document.getElementById('play-pause').innerText = '▶';
        }
        updateSeekBar();
    });

    waveSurfer.on('audioprocess', updateSeekBar);

    waveSurfer.on('finish', () => {
        document.getElementById('play-pause').innerText = '▶';
    });
}

function setFooterPlayer(songId, songTitle, albumTitle, albumArt, audioFileUrl, artist, savedTime = 0, autoPlay = false) {
    const data = {
        'song_id': songId,
        'song_title': songTitle,
        'album_title': albumTitle,
        'album_art': albumArt,
        'audio_file_url': audioFileUrl,
        'artist': artist,
    };

    fetch("/play_song/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('player-title').innerText = data.song_title || 'No Track Playing';
            document.getElementById('player-artist').innerText = data.artist || 'Artist Name(s)';
            document.getElementById('player-album').innerText = data.album_title || 'Album Name';
            document.getElementById('player-image').src = data.album_art || '/path/to/default-image.jpg';
            savePlayerState(data.song_id, data.song_title, data.artist, data.album_title, data.album_art, data.audio_file_url, savedTime, autoPlay);
            initializeWaveSurfer(data.audio_file_url, savedTime, autoPlay);
        } else {
            alert("Failed to play song.");
        }
    })
    .catch(error => console.error("Error playing song:", error));
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function togglePlay() {
    if (waveSurfer) {
        if (waveSurfer.isPlaying()) {
            waveSurfer.pause();
            document.getElementById('play-pause').innerText = '▶';
        } else {
            waveSurfer.play();
            document.getElementById('play-pause').innerText = '⏸';
        }
    }
}

function updateSeekBar() {
    if (waveSurfer) {
        const currentTime = waveSurfer.getCurrentTime();
        const duration = waveSurfer.getDuration();
        const seekbar = document.getElementById('seekbar');
        document.getElementById('current-time').innerText = formatTime(currentTime);
        document.getElementById('total-time').innerText = formatTime(duration);
        const percent = (currentTime / duration) * 100;
        seekbar.value = percent;
        seekbar.style.background = `linear-gradient(to right, #1db954 ${percent}%, #0b652b ${percent}%)`;
        const state = JSON.parse(localStorage.getItem('playerState'));
        if (state) {
            state.currentTime = currentTime;
            localStorage.setItem('playerState', JSON.stringify(state));
        }
    }
}

function seekTrack(value) {
    if (waveSurfer) {
        waveSurfer.seekTo(value / 100);
        const seekbar = document.getElementById('seekbar');
        seekbar.style.background = `linear-gradient(to right, #1db954${value}%, #0b652b ${value}%)`;
    }
}

function setVolume(value) {
    if (waveSurfer) {
        const volume = value / 100;
        waveSurfer.setVolume(volume);
        localStorage.setItem('playerVolume', volume);
        document.getElementById('volume').style.background = `linear-gradient(to right, violet 0%, violet ${value}%, #ccc ${value}%, #ccc 100%)`;
        const muteIcon = document.querySelector('#mute-btn i');
        if (volume > 0) {
            isMuted = false;
            muteIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        } else {
            isMuted = true;
            muteIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        }
    }
}

function toggleMute() {
    const volumeSlider = document.getElementById('volume');
    const muteIcon = document.querySelector('#mute-btn i');

    if (!isMuted) {
        lastVolume = parseFloat(localStorage.getItem('playerVolume')) || 0.5;
        waveSurfer.setVolume(0);
        volumeSlider.value = 0;
        volumeSlider.style.background = `linear-gradient(to right, violet 0%, violet 0%, #ccc 0%, #ccc 100%)`;
        muteIcon.classList.replace('fa-volume-high', 'fa-volume-xmark');
        isMuted = true;
    } else {
        waveSurfer.setVolume(lastVolume);
        volumeSlider.value = lastVolume * 100;
        volumeSlider.style.background = `linear-gradient(to right, violet 0%, violet ${lastVolume * 100}%, #ccc ${lastVolume * 100}%, #ccc 100%)`;
        localStorage.setItem('playerVolume', lastVolume);
        muteIcon.classList.replace('fa-volume-xmark', 'fa-volume-high');
        isMuted = false;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

function savePlayerState(trackId, title, artistNames, albumName, imageUrl, url, currentTime = 0, wasPlaying = false) {
    localStorage.setItem('playerState', JSON.stringify({ trackId, title, artistNames, albumName, imageUrl, url, currentTime, wasPlaying }));
}

function saveCurrentTime() {
    if (waveSurfer) {
        const state = JSON.parse(localStorage.getItem('playerState')) || {};
        const currentTime = waveSurfer.getCurrentTime();
        const isPlaying = waveSurfer.isPlaying();
        savePlayerState(
            state.trackId,
            state.title,
            state.artistNames,
            state.albumName,
            state.imageUrl,
            state.url,
            currentTime,
            isPlaying
        );
    }
}

function loadPlayerState() {
    const state = JSON.parse(localStorage.getItem('playerState'));
    if (state) {
        setFooterPlayer(state.trackId, state.title, state.albumName, state.imageUrl, state.url, state.artistNames, state.currentTime || 0, false);
    }
    const playPauseBtn = document.getElementById('play-pause');
    if (playPauseBtn) {
        playPauseBtn.innerText = '▶';
    }
}

window.onload = loadPlayerState;
