let waveSurfer = null;

function setFooterPlayer(trackId, title, artistNames, albumName, imageUrl, url) {
    // const artists = artistNames.map((artist) => artist.name).join(', ');

    // Update Player UI
    document.getElementById('player-title').innerText = title;
    document.getElementById('player-artist').innerText = artistNames;
    document.getElementById('player-album').innerText = albumName;
    document.getElementById('player-image').src = imageUrl;

    // Initialize or Update WaveSurfer
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
        waveSurfer.play();
        document.getElementById('play-pause').innerText = '⏸';
        updateSeekBar();
    });

    waveSurfer.on('audioprocess', updateSeekBar);
    waveSurfer.on('finish', () => {
        document.getElementById('play-pause').innerText = '▶';
    });
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
        const duration = waveSurfer.getDuration();
        waveSurfer.seekTo(value / 100);
    }
}

function setVolume(value) {
    if (waveSurfer) {
        waveSurfer.setVolume(value / 100);
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
}
