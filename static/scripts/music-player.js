class MusicPlayer {
    constructor() {
        this.elements = this.cacheElements();
        this.state = this.initState();
        this.playlist = this.initPlaylist();
        this.rafId = null;

        if (!this.validateElements()) return;

        this.init();
    }

    cacheElements() {
        return {
            musicToggle: document.getElementById('music-toggle'),
            volumeSlider: document.getElementById('volume-slider'),
            backgroundMusic: document.getElementById('background-music'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            shuffleBtn: document.getElementById('shuffle-btn'),
            songTitle: document.querySelector('.song-title'),
            volumeLevel: document.querySelector('.volume-level'),
            progressSlider: document.getElementById('progress-slider'),
            currentTimeDisplay: document.getElementById('current-time'),
            totalTimeDisplay: document.getElementById('total-time'),
            musicIcon: document.querySelector('#music-toggle i'),
            musicPlayer: document.querySelector('.music-player')
        };
    }

    initState() {
        return {
            currentTrackIndex: parseInt(localStorage.getItem('currentTrack')) || 0,
            isShuffled: localStorage.getItem('musicShuffled') === 'true',
            isPlaying: false,
            savedVolume: parseInt(localStorage.getItem('musicVolume')) || 30,
            isSeeking: false,
            shuffledPlaylist: []
        };
    }

    initPlaylist() {
        return [
            { title: "Sleepwalker", file: "01.mp3" },
            { title: "Keep Your Eyes Peeled", file: "02.mp3" },
            { title: "Wavdealer - Zima", file: "03.mp3" },
            { title: "Vision", file: "04.mp3" },
            { title: "White Light", file: "05.mp3" },
        ];
    }

    validateElements() {
        const required = ['musicToggle', 'volumeSlider', 'backgroundMusic', 'musicPlayer'];
        for (const elem of required) {
            if (!this.elements[elem]) {
                console.error(`Missing required element: ${elem}`);
                return false;
            }
        }
        return true;
    }

    formatTime(seconds) {
        if (!isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    updateUIState() {
        const isPlaying = !this.elements.backgroundMusic.paused;
        const isMusicPlaying = isPlaying || this.state.isPlaying;

        this.elements.musicPlayer.classList.toggle('playing', isMusicPlaying);
        this.elements.musicPlayer.classList.toggle('paused', !isMusicPlaying);
        this.elements.musicToggle.classList.toggle('playing', isMusicPlaying);

        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
        }
    }

    updatePlayerState() {
        this.updateUIState();
        this.updateVolumeIcon();
        this.updateSliderPercentages();
    }

    updateVolumeIcon() {
        if (!this.elements.musicIcon) return;

        const volume = this.elements.volumeSlider.value;
        let iconClass;

        if (volume == 0) {
            iconClass = 'fas fa-volume-mute';
        } else if (volume < 20) {
            iconClass = 'fas fa-volume-off';
        } else if (volume < 50) {
            iconClass = 'fas fa-volume-low';
        } else {
            iconClass = 'fas fa-volume-high';
        }

        this.elements.musicIcon.className = iconClass;
    }

    updateSliderPercentages() {
        const volumePercent = this.elements.volumeSlider.value;
        this.elements.volumeSlider.style.setProperty('--slider-percent', `${volumePercent}%`);

        if (this.elements.backgroundMusic.duration && !this.state.isSeeking) {
            const progressPercent =
                (this.elements.backgroundMusic.currentTime /
                    this.elements.backgroundMusic.duration) * 100;
            this.elements.progressSlider.style.setProperty('--slider-percent', `${progressPercent}%`);
        }
    }

    updateProgress = () => {
        if (!this.elements.backgroundMusic.duration || this.state.isSeeking) return;

        const currentTime = this.elements.backgroundMusic.currentTime;
        const duration = this.elements.backgroundMusic.duration;
        const progressPercent = (currentTime / duration) * 100;

        this.elements.progressSlider.value = progressPercent;

        if (this.elements.currentTimeDisplay) {
            this.elements.currentTimeDisplay.textContent = this.formatTime(currentTime);
        }

        this.updateSliderPercentages();

        if (!this.elements.backgroundMusic.paused) {
            this.rafId = requestAnimationFrame(this.updateProgress);
        }
    };

    setupProgressSlider() {
        this.elements.progressSlider.addEventListener('input', (e) => {
            this.state.isSeeking = true;
            const percent = e.target.value;
            const duration = this.elements.backgroundMusic.duration;

            if (duration) {
                const newTime = (percent / 100) * duration;
                if (this.elements.currentTimeDisplay) {
                    this.elements.currentTimeDisplay.textContent = this.formatTime(newTime);
                }
                e.target.style.setProperty('--slider-percent', `${percent}%`);
            }
        });

        this.elements.progressSlider.addEventListener('change', (e) => {
            if (!this.elements.backgroundMusic.duration) return;
            const newTime =
                (e.target.value / 100) * this.elements.backgroundMusic.duration;
            this.elements.backgroundMusic.currentTime = newTime;
            this.state.isSeeking = false;
        });

        this.elements.backgroundMusic.addEventListener('timeupdate', () => {
            if (!this.state.isSeeking) this.updateProgress();
        });

        this.elements.backgroundMusic.addEventListener('loadedmetadata', () => {
            if (this.elements.totalTimeDisplay) {
                this.elements.totalTimeDisplay.textContent =
                    this.formatTime(this.elements.backgroundMusic.duration);
            }
        });
    }

    initPlayer() {
        this.elements.backgroundMusic.volume = this.state.savedVolume / 100;
        this.elements.volumeSlider.value = this.state.savedVolume;

        if (this.elements.volumeLevel) {
            this.elements.volumeLevel.textContent = `${this.state.savedVolume}%`;
        }

        this.shufflePlaylist();
        this.setupProgressSlider();
        this.bindEvents();
        this.loadTrack(this.state.currentTrackIndex);

        // Set initial state to paused (not playing)
        this.elements.musicPlayer.classList.add('paused');
        this.elements.musicToggle.classList.remove('playing');
        this.state.isPlaying = false;

        // Remove localStorage musicPlaying state on page load
        // This ensures music won't autoplay on subsequent visits
        localStorage.removeItem('musicPlaying');

        this.updatePlayerState();
        this.updateVolumeIcon();
        this.updateSliderPercentages();

        // REMOVE THIS ENTIRE BLOCK - no autoplay anymore:
        // if (localStorage.getItem('musicPlaying') === 'true') {
        //     this.attemptAutoplay();
        // }
    }

    attemptAutoplay() {
        this.elements.backgroundMusic.play()
            .then(() => {
                this.state.isPlaying = true;
                this.updatePlayerState();
                this.startProgressUpdates();
            })
            .catch(() => {
                this.state.isPlaying = false;
                this.updatePlayerState();
            });
    }

    shufflePlaylist() {
        if (this.state.isShuffled) {
            this.state.shuffledPlaylist = [...this.playlist];
            for (let i = this.state.shuffledPlaylist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.state.shuffledPlaylist[i], this.state.shuffledPlaylist[j]] =
                    [this.state.shuffledPlaylist[j], this.state.shuffledPlaylist[i]];
            }
        } else {
            this.state.shuffledPlaylist = [...this.playlist];
        }
    }

    loadTrack(index) {
        if (index < 0 || index >= this.state.shuffledPlaylist.length) {
            this.playNext();
            return;
        }

        this.state.currentTrackIndex = index;
        const track = this.state.shuffledPlaylist[index];

        if (this.rafId) cancelAnimationFrame(this.rafId);

        // Store the current playing state
        const wasPlaying = this.state.isPlaying;

        this.elements.progressSlider.value = 0;
        this.elements.progressSlider.style.setProperty('--slider-percent', '0%');

        if (this.elements.currentTimeDisplay) this.elements.currentTimeDisplay.textContent = '0:00';
        if (this.elements.totalTimeDisplay) this.elements.totalTimeDisplay.textContent = '0:00';

        this.state.isSeeking = false;
        this.elements.backgroundMusic.src = `/static/music/${track.file}`;
        this.updateNowPlaying();
        localStorage.setItem('currentTrack', index);
        this.elements.progressSlider.disabled = false;

        // Update UI state BEFORE loading the new track
        this.updateUIState();

        this.elements.backgroundMusic.load();

        // Restore playing state after loading the new track
        if (wasPlaying) {
            setTimeout(() => {
                this.elements.backgroundMusic.play()
                    .then(() => {
                        this.state.isPlaying = true;
                        this.updatePlayerState();
                        this.startProgressUpdates();
                    })
                    .catch(() => {
                        this.state.isPlaying = false;
                        this.updatePlayerState();
                    });
            }, 100);
        } else {
            this.state.isPlaying = false;
            this.updatePlayerState();
        }
    }

    playNext() {
        this.loadTrack(
            (this.state.currentTrackIndex + 1) % this.state.shuffledPlaylist.length
        );
    }

    playPrev() {
        this.loadTrack(
            (this.state.currentTrackIndex - 1 + this.state.shuffledPlaylist.length) %
                this.state.shuffledPlaylist.length
        );
    }

    updateNowPlaying() {
        if (this.elements.songTitle) {
            this.elements.songTitle.textContent =
                this.state.shuffledPlaylist[this.state.currentTrackIndex].title;
        }
    }

    startProgressUpdates() {
        if (!this.elements.backgroundMusic.paused) {
            this.rafId = requestAnimationFrame(this.updateProgress);
        }
    }

    togglePlayPause() {
        if (this.elements.backgroundMusic.paused) {
            this.elements.backgroundMusic.play()
                .then(() => {
                    this.state.isPlaying = true;
                    localStorage.setItem('musicPlaying', 'true');
                    this.updatePlayerState();
                    this.startProgressUpdates();
                })
                .catch(() => {
                    this.state.isPlaying = false;
                    this.updatePlayerState();
                });
        } else {
            this.elements.backgroundMusic.pause();
            this.state.isPlaying = false;
            localStorage.setItem('musicPlaying', 'false');
            this.updatePlayerState();
            if (this.rafId) cancelAnimationFrame(this.rafId);
        }
    }

    handleVolumeChange(e) {
        const volume = e.target.value;
        this.elements.backgroundMusic.volume = volume / 100;
        localStorage.setItem('musicVolume', volume);

        if (this.elements.volumeLevel) {
            this.elements.volumeLevel.textContent = `${volume}%`;
        }

        this.updateVolumeIcon();
        this.updateSliderPercentages();
    }

    toggleShuffle() {
        this.state.isShuffled = !this.state.isShuffled;
        localStorage.setItem('musicShuffled', this.state.isShuffled);
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
        }
        this.shufflePlaylist();
    }

    bindEvents() {
        this.elements.musicToggle.addEventListener('click', () => this.togglePlayPause());
        this.elements.volumeSlider.addEventListener('input', (e) => this.handleVolumeChange(e));

        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.playPrev());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.playNext());
        }
        if (this.elements.shuffleBtn) {
            this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }

        this.elements.backgroundMusic.addEventListener('ended', () => this.playNext());
        this.elements.backgroundMusic.addEventListener('play', () => this.startProgressUpdates());
        this.elements.backgroundMusic.addEventListener('pause', () => {
            if (this.rafId) cancelAnimationFrame(this.rafId);
        });
    }

    init() {
        setTimeout(() => this.initPlayer(), 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});
