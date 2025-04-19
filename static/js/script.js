let waveSurfer = null;

function initializeWaveSurfer(url) {
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
        waveSurfer.play();
        document.getElementById('play-pause').innerText = '⏸';
        updateSeekBar();
    });

    waveSurfer.on('audioprocess', updateSeekBar);

    waveSurfer.on('finish', () => {
        document.getElementById('play-pause').innerText = '▶';
    });
}

function setFooterPlayer(songId, songTitle, artist, albumTitle, albumArt, audioFileUrl) {
    const data = {
        'song_id': songId,
        'song_title': songTitle,
        'artist': artist,
        'album_title': albumTitle,
        'album_art': albumArt,
        'audio_file_url': audioFileUrl
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
            savePlayerState(data.song_id, data.song_title, data.artist, data.album_title, data.album_art, data.audio_file_url);
            initializeWaveSurfer(data.audio_file_url);
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
        document.getElementById('current-time').innerText = formatTime(currentTime);
        document.getElementById('total-time').innerText = formatTime(duration);
        const seekbar = document.getElementById('seekbar');
        seekbar.value = (currentTime / duration) * 100;
    }
}

function seekTrack(value) {
    if (waveSurfer) {
        waveSurfer.seekTo(value / 100);
    }
}

function setVolume(value) {
    if (waveSurfer) {
        const volume = value / 100;
        waveSurfer.setVolume(volume);
        localStorage.setItem('playerVolume', volume);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}

function savePlayerState(trackId, title, artistNames, albumName, imageUrl, url) {
    localStorage.setItem('playerState', JSON.stringify({ trackId, title, artistNames, albumName, imageUrl, url }));
}

function loadPlayerState() {
    const state = JSON.parse(localStorage.getItem('playerState'));
    if (state) {
        setFooterPlayer(state.trackId);
    }
}

window.onload = loadPlayerState;
