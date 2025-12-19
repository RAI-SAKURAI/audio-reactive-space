/**
 * UI Manager for Audio Reactive Space
 * Handles file uploads, playback controls, and parameter adjustments
 */

class UIManager {
  constructor(audioManager, scene) {
    this.audioManager = audioManager;
    this.scene = scene;
    this.isPlaying = false;
    this.currentFile = null;
    this.parameters = {
      sensitivity: 1.0,
      smoothing: 0.8,
      colorMode: 'hsl',
      rotationSpeed: 0.5,
      scale: 1.0,
      bassBoost: 0,
      trebleBoost: 0,
      midBoost: 0,
    };

    this.initializeUI();
    this.setupEventListeners();
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    this.createControlPanel();
    this.createFileUploadSection();
    this.createPlaybackControls();
    this.createParameterControls();
    this.createVisualizerInfo();
  }

  /**
   * Create the main control panel container
   */
  createControlPanel() {
    // Check if panel already exists
    if (document.getElementById('ui-panel')) {
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'ui-panel';
    panel.className = 'ui-panel';
    panel.innerHTML = `
      <div class="ui-panel-header">
        <h2>Audio Reactive Space</h2>
        <button id="toggle-panel" class="toggle-btn">−</button>
      </div>
      <div class="ui-panel-content">
        <div id="file-upload-section" class="section"></div>
        <div id="playback-controls" class="section"></div>
        <div id="parameter-controls" class="section"></div>
        <div id="visualizer-info" class="section"></div>
      </div>
    `;

    document.body.appendChild(panel);
    this.setupPanelToggle();
  }

  /**
   * Setup panel toggle functionality
   */
  setupPanelToggle() {
    const toggleBtn = document.getElementById('toggle-panel');
    const content = document.querySelector('.ui-panel-content');

    if (toggleBtn && content) {
      toggleBtn.addEventListener('click', () => {
        content.classList.toggle('collapsed');
        toggleBtn.textContent = content.classList.contains('collapsed') ? '+' : '−';
      });
    }
  }

  /**
   * Create file upload section
   */
  createFileUploadSection() {
    const section = document.getElementById('file-upload-section');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h3>Upload Audio File</h3>
      </div>
      <div class="file-upload-container">
        <input type="file" id="audio-file-input" accept="audio/*" class="file-input" />
        <label for="audio-file-input" class="file-label">
          <span class="upload-icon">📁</span>
          <span class="upload-text">Click to upload or drag & drop</span>
          <span class="upload-hint">MP3, WAV, OGG, FLAC</span>
        </label>
        <div id="file-info" class="file-info" style="display: none;">
          <div class="file-name" id="uploaded-file-name"></div>
          <div class="file-size" id="uploaded-file-size"></div>
        </div>
      </div>
    `;

    this.setupDragDrop();
  }

  /**
   * Setup drag and drop functionality
   */
  setupDragDrop() {
    const fileInput = document.getElementById('audio-file-input');
    const fileLabel = document.querySelector('.file-label');
    const uploadContainer = document.querySelector('.file-upload-container');

    if (!uploadContainer) return;

    // Drag events
    uploadContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadContainer.classList.add('drag-over');
    });

    uploadContainer.addEventListener('dragleave', () => {
      uploadContainer.classList.remove('drag-over');
    });

    uploadContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadContainer.classList.remove('drag-over');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const audioFile = Array.from(files).find(f => f.type.startsWith('audio/'));
        if (audioFile) {
          fileInput.files = e.dataTransfer.files;
          this.handleFileUpload({ target: { files: [audioFile] } });
        }
      }
    });

    // File input change
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
  }

  /**
   * Handle file upload
   */
  handleFileUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('audio/')) {
      this.showNotification('Please select a valid audio file', 'error');
      return;
    }

    this.currentFile = file;
    this.displayFileInfo(file);

    const fileURL = URL.createObjectURL(file);
    this.audioManager.loadAudio(fileURL);
    this.showNotification(`Loaded: ${file.name}`, 'success');
  }

  /**
   * Display uploaded file information
   */
  displayFileInfo(file) {
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('uploaded-file-name');
    const fileSize = document.getElementById('uploaded-file-size');

    if (fileInfo && fileName && fileSize) {
      fileName.textContent = `📄 ${file.name}`;
      fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
      fileInfo.style.display = 'block';
    }
  }

  /**
   * Create playback controls section
   */
  createPlaybackControls() {
    const section = document.getElementById('playback-controls');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h3>Playback Controls</h3>
      </div>
      <div class="controls-grid">
        <button id="play-btn" class="control-btn play-btn" title="Play">
          <span class="btn-icon">▶</span>
          <span class="btn-text">Play</span>
        </button>
        <button id="pause-btn" class="control-btn pause-btn" title="Pause">
          <span class="btn-icon">⏸</span>
          <span class="btn-text">Pause</span>
        </button>
        <button id="stop-btn" class="control-btn stop-btn" title="Stop">
          <span class="btn-icon">⏹</span>
          <span class="btn-text">Stop</span>
        </button>
      </div>
      <div class="progress-container">
        <div class="progress-info">
          <span id="current-time">0:00</span>
          <span id="total-time">0:00</span>
        </div>
        <input type="range" id="progress-bar" class="progress-bar" min="0" max="100" value="0" />
      </div>
      <div class="volume-container">
        <label for="volume-slider">Volume</label>
        <input type="range" id="volume-slider" class="slider" min="0" max="1" step="0.01" value="0.5" />
        <span id="volume-value">50%</span>
      </div>
    `;
  }

  /**
   * Create parameter adjustment controls
   */
  createParameterControls() {
    const section = document.getElementById('parameter-controls');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h3>Visualization Parameters</h3>
      </div>
      
      <div class="parameter-group">
        <label for="sensitivity-slider">Sensitivity</label>
        <input type="range" id="sensitivity-slider" class="slider" min="0.1" max="3" step="0.1" value="1" />
        <span class="value-display" id="sensitivity-value">1.0x</span>
      </div>

      <div class="parameter-group">
        <label for="smoothing-slider">Smoothing</label>
        <input type="range" id="smoothing-slider" class="slider" min="0" max="1" step="0.05" value="0.8" />
        <span class="value-display" id="smoothing-value">0.80</span>
      </div>

      <div class="parameter-group">
        <label for="rotation-speed-slider">Rotation Speed</label>
        <input type="range" id="rotation-speed-slider" class="slider" min="0" max="2" step="0.1" value="0.5" />
        <span class="value-display" id="rotation-speed-value">0.5x</span>
      </div>

      <div class="parameter-group">
        <label for="scale-slider">Scale</label>
        <input type="range" id="scale-slider" class="slider" min="0.5" max="3" step="0.1" value="1" />
        <span class="value-display" id="scale-value">1.0x</span>
      </div>

      <div class="parameter-group">
        <label for="color-mode-select">Color Mode</label>
        <select id="color-mode-select" class="select-control">
          <option value="hsl">HSL (Rainbow)</option>
          <option value="rgb">RGB (Spectrum)</option>
          <option value="bw">Black & White</option>
          <option value="fire">Fire</option>
          <option value="ice">Ice</option>
          <option value="neon">Neon</option>
        </select>
      </div>

      <div class="section-header" style="margin-top: 15px;">
        <h4>Frequency Adjustments</h4>
      </div>

      <div class="parameter-group">
        <label for="bass-boost-slider">Bass Boost</label>
        <input type="range" id="bass-boost-slider" class="slider" min="-20" max="20" step="1" value="0" />
        <span class="value-display" id="bass-boost-value">0 dB</span>
      </div>

      <div class="parameter-group">
        <label for="mid-boost-slider">Mid Boost</label>
        <input type="range" id="mid-boost-slider" class="slider" min="-20" max="20" step="1" value="0" />
        <span class="value-display" id="mid-boost-value">0 dB</span>
      </div>

      <div class="parameter-group">
        <label for="treble-boost-slider">Treble Boost</label>
        <input type="range" id="treble-boost-slider" class="slider" min="-20" max="20" step="1" value="0" />
        <span class="value-display" id="treble-boost-value">0 dB</span>
      </div>

      <button id="reset-params-btn" class="reset-btn">Reset to Default</button>
    `;
  }

  /**
   * Create visualizer information display
   */
  createVisualizerInfo() {
    const section = document.getElementById('visualizer-info');
    if (!section) return;

    section.innerHTML = `
      <div class="section-header">
        <h3>Visualizer Info</h3>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Bass Level</span>
          <div class="info-bar">
            <div id="bass-bar" class="bar-fill" style="width: 0%"></div>
          </div>
          <span class="info-value" id="bass-value">0</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mid Level</span>
          <div class="info-bar">
            <div id="mid-bar" class="bar-fill" style="width: 0%"></div>
          </div>
          <span class="info-value" id="mid-value">0</span>
        </div>
        <div class="info-item">
          <span class="info-label">Treble Level</span>
          <div class="info-bar">
            <div id="treble-bar" class="bar-fill" style="width: 0%"></div>
          </div>
          <span class="info-value" id="treble-value">0</span>
        </div>
        <div class="info-item">
          <span class="info-label">Overall Level</span>
          <div class="info-bar">
            <div id="overall-bar" class="bar-fill" style="width: 0%"></div>
          </div>
          <span class="info-value" id="overall-value">0</span>
        </div>
      </div>
    `;
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Playback controls
    this.setupPlaybackControls();
    // Parameter controls
    this.setupParameterControls();
    // Volume control
    this.setupVolumeControl();
  }

  /**
   * Setup playback control event listeners
   */
  setupPlaybackControls() {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const progressBar = document.getElementById('progress-bar');

    if (playBtn) {
      playBtn.addEventListener('click', () => this.play());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pause());
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stop());
    }

    if (progressBar) {
      progressBar.addEventListener('change', (e) => this.seek(parseFloat(e.target.value)));
      progressBar.addEventListener('input', (e) => this.seek(parseFloat(e.target.value)));
    }
  }

  /**
   * Setup parameter control event listeners
   */
  setupParameterControls() {
    const sensSlider = document.getElementById('sensitivity-slider');
    const smoothSlider = document.getElementById('smoothing-slider');
    const rotSpeedSlider = document.getElementById('rotation-speed-slider');
    const scaleSlider = document.getElementById('scale-slider');
    const colorSelect = document.getElementById('color-mode-select');
    const bassSlider = document.getElementById('bass-boost-slider');
    const midSlider = document.getElementById('mid-boost-slider');
    const trebleSlider = document.getElementById('treble-boost-slider');
    const resetBtn = document.getElementById('reset-params-btn');

    if (sensSlider) {
      sensSlider.addEventListener('input', (e) => {
        this.parameters.sensitivity = parseFloat(e.target.value);
        document.getElementById('sensitivity-value').textContent = `${this.parameters.sensitivity.toFixed(1)}x`;
        this.audioManager.setSensitivity(this.parameters.sensitivity);
      });
    }

    if (smoothSlider) {
      smoothSlider.addEventListener('input', (e) => {
        this.parameters.smoothing = parseFloat(e.target.value);
        document.getElementById('smoothing-value').textContent = `${this.parameters.smoothing.toFixed(2)}`;
        this.audioManager.setSmoothing(this.parameters.smoothing);
      });
    }

    if (rotSpeedSlider) {
      rotSpeedSlider.addEventListener('input', (e) => {
        this.parameters.rotationSpeed = parseFloat(e.target.value);
        document.getElementById('rotation-speed-value').textContent = `${this.parameters.rotationSpeed.toFixed(1)}x`;
      });
    }

    if (scaleSlider) {
      scaleSlider.addEventListener('input', (e) => {
        this.parameters.scale = parseFloat(e.target.value);
        document.getElementById('scale-value').textContent = `${this.parameters.scale.toFixed(1)}x`;
      });
    }

    if (colorSelect) {
      colorSelect.addEventListener('change', (e) => {
        this.parameters.colorMode = e.target.value;
      });
    }

    if (bassSlider) {
      bassSlider.addEventListener('input', (e) => {
        this.parameters.bassBoost = parseFloat(e.target.value);
        document.getElementById('bass-boost-value').textContent = `${this.parameters.bassBoost} dB`;
        this.audioManager.setFrequencyBoost('bass', this.parameters.bassBoost);
      });
    }

    if (midSlider) {
      midSlider.addEventListener('input', (e) => {
        this.parameters.midBoost = parseFloat(e.target.value);
        document.getElementById('mid-boost-value').textContent = `${this.parameters.midBoost} dB`;
        this.audioManager.setFrequencyBoost('mid', this.parameters.midBoost);
      });
    }

    if (trebleSlider) {
      trebleSlider.addEventListener('input', (e) => {
        this.parameters.trebleBoost = parseFloat(e.target.value);
        document.getElementById('treble-boost-value').textContent = `${this.parameters.trebleBoost} dB`;
        this.audioManager.setFrequencyBoost('treble', this.parameters.trebleBoost);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetParameters());
    }
  }

  /**
   * Setup volume control
   */
  setupVolumeControl() {
    const volumeSlider = document.getElementById('volume-slider');

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        this.audioManager.setVolume(volume);
        document.getElementById('volume-value').textContent = `${Math.round(volume * 100)}%`;
      });
    }
  }

  /**
   * Play audio
   */
  play() {
    if (!this.currentFile && !this.audioManager.audioElement) {
      this.showNotification('Please upload an audio file first', 'warning');
      return;
    }

    this.audioManager.play();
    this.isPlaying = true;
    this.updatePlaybackUI();
  }

  /**
   * Pause audio
   */
  pause() {
    this.audioManager.pause();
    this.isPlaying = false;
    this.updatePlaybackUI();
  }

  /**
   * Stop audio
   */
  stop() {
    this.audioManager.stop();
    this.isPlaying = false;
    this.updatePlaybackUI();
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.value = 0;
    }
    this.updateTimeDisplay(0, 0);
  }

  /**
   * Seek to position in audio
   */
  seek(percentage) {
    if (!this.audioManager.audioElement) return;
    
    const duration = this.audioManager.audioElement.duration;
    const currentTime = (percentage / 100) * duration;
    this.audioManager.audioElement.currentTime = currentTime;
  }

  /**
   * Update playback UI state
   */
  updatePlaybackUI() {
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');

    if (playBtn) {
      playBtn.classList.toggle('active', this.isPlaying);
    }
    if (pauseBtn) {
      pauseBtn.classList.toggle('active', !this.isPlaying);
    }
  }

  /**
   * Update time display
   */
  updateTimeDisplay(currentTime, duration) {
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressBar = document.getElementById('progress-bar');

    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(currentTime);
    }
    if (totalTimeEl) {
      totalTimeEl.textContent = this.formatTime(duration);
    }
    if (progressBar) {
      const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      progressBar.value = percentage;
    }
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Reset parameters to default
   */
  resetParameters() {
    this.parameters = {
      sensitivity: 1.0,
      smoothing: 0.8,
      colorMode: 'hsl',
      rotationSpeed: 0.5,
      scale: 1.0,
      bassBoost: 0,
      trebleBoost: 0,
      midBoost: 0,
    };

    // Update UI
    document.getElementById('sensitivity-slider').value = 1;
    document.getElementById('smoothing-slider').value = 0.8;
    document.getElementById('rotation-speed-slider').value = 0.5;
    document.getElementById('scale-slider').value = 1;
    document.getElementById('color-mode-select').value = 'hsl';
    document.getElementById('bass-boost-slider').value = 0;
    document.getElementById('mid-boost-slider').value = 0;
    document.getElementById('treble-boost-slider').value = 0;

    // Update displays
    document.getElementById('sensitivity-value').textContent = '1.0x';
    document.getElementById('smoothing-value').textContent = '0.80';
    document.getElementById('rotation-speed-value').textContent = '0.5x';
    document.getElementById('scale-value').textContent = '1.0x';
    document.getElementById('bass-boost-value').textContent = '0 dB';
    document.getElementById('mid-boost-value').textContent = '0 dB';
    document.getElementById('treble-boost-value').textContent = '0 dB';

    // Update audio manager
    this.audioManager.setSensitivity(1.0);
    this.audioManager.setSmoothing(0.8);

    this.showNotification('Parameters reset to default', 'success');
  }

  /**
   * Update visualizer information display
   */
  updateVisualizerInfo(bassLevel, midLevel, trebleLevel, overallLevel) {
    const maxValue = 255;
    const bassPercent = (bassLevel / maxValue) * 100;
    const midPercent = (midLevel / maxValue) * 100;
    const treblePercent = (trebleLevel / maxValue) * 100;
    const overallPercent = (overallLevel / maxValue) * 100;

    const bassBa = document.getElementById('bass-bar');
    const midBar = document.getElementById('mid-bar');
    const trebleBar = document.getElementById('treble-bar');
    const overallBar = document.getElementById('overall-bar');

    if (bassBa) bassBa.style.width = `${Math.min(bassPercent, 100)}%`;
    if (midBar) midBar.style.width = `${Math.min(midPercent, 100)}%`;
    if (trebleBar) trebleBar.style.width = `${Math.min(treblePercent, 100)}%`;
    if (overallBar) overallBar.style.width = `${Math.min(overallPercent, 100)}%`;

    document.getElementById('bass-value').textContent = Math.round(bassLevel);
    document.getElementById('mid-value').textContent = Math.round(midLevel);
    document.getElementById('treble-value').textContent = Math.round(trebleLevel);
    document.getElementById('overall-value').textContent = Math.round(overallLevel);
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Get current parameters
   */
  getParameters() {
    return { ...this.parameters };
  }

  /**
   * Set parameter value
   */
  setParameter(key, value) {
    if (key in this.parameters) {
      this.parameters[key] = value;
      return true;
    }
    return false;
  }

  /**
   * Enable/Disable UI
   */
  setEnabled(enabled) {
    const panel = document.getElementById('ui-panel');
    if (panel) {
      panel.style.opacity = enabled ? '1' : '0.5';
      panel.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}
