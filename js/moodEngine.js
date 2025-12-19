/**
 * Mood Engine - Emotional State Management for Audio Reactive Space
 * Manages different emotional moods and their associated visual/audio parameters
 */

class MoodEngine {
  constructor() {
    this.currentMood = 'calm';
    this.moodTransitionDuration = 2000; // ms
    this.isTransitioning = false;
    this.transitionStartTime = null;
    
    // Mood definitions with visual and audio parameters
    this.moods = {
      calm: {
        name: 'Calm',
        description: 'Peaceful and serene state',
        color: { r: 100, g: 150, b: 200 },
        brightness: 0.6,
        saturation: 0.5,
        audioResponseSensitivity: 0.3,
        particleSpeed: 0.5,
        particleSize: 5,
        particleOpacity: 0.6,
        frequencyBand: { low: 0, mid: 20, high: 30 },
        visualIntensity: 0.4,
        rotationSpeed: 0.2,
        pulseFactor: 1.0,
        backgroundColor: 'rgba(20, 30, 50, 0.3)',
        glowIntensity: 0.3
      },
      energetic: {
        name: 'Energetic',
        description: 'Dynamic and vibrant state',
        color: { r: 255, g: 100, b: 50 },
        brightness: 1.0,
        saturation: 1.0,
        audioResponseSensitivity: 0.8,
        particleSpeed: 2.0,
        particleSize: 8,
        particleOpacity: 0.9,
        frequencyBand: { low: 40, mid: 60, high: 100 },
        visualIntensity: 0.9,
        rotationSpeed: 1.5,
        pulseFactor: 2.0,
        backgroundColor: 'rgba(50, 20, 20, 0.5)',
        glowIntensity: 0.8
      },
      heartbreak: {
        name: 'Heartbreak',
        description: 'Melancholic and introspective state',
        color: { r: 200, g: 100, b: 150 },
        brightness: 0.5,
        saturation: 0.6,
        audioResponseSensitivity: 0.5,
        particleSpeed: 0.3,
        particleSize: 4,
        particleOpacity: 0.5,
        frequencyBand: { low: 10, mid: 25, high: 40 },
        visualIntensity: 0.5,
        rotationSpeed: 0.3,
        pulseFactor: 1.5,
        backgroundColor: 'rgba(40, 20, 40, 0.4)',
        glowIntensity: 0.5,
        effectiveFrequencies: 'bass-heavy'
      }
    };
    
    // Mood transition rules
    this.transitionRules = {
      calm: ['energetic', 'heartbreak'],
      energetic: ['calm', 'heartbreak'],
      heartbreak: ['calm', 'energetic']
    };
    
    // Listeners for mood changes
    this.listeners = [];
    
    // Initialize
    this.initializeMood();
  }
  
  /**
   * Initialize the mood engine
   */
  initializeMood() {
    console.log(`MoodEngine initialized with mood: ${this.currentMood}`);
    this.notifyListeners('moodInitialized', this.getMoodData());
  }
  
  /**
   * Change to a new mood with smooth transition
   * @param {string} newMood - The mood to transition to ('calm', 'energetic', 'heartbreak')
   * @returns {boolean} - Whether the transition was initiated
   */
  changeMood(newMood) {
    if (!this.moods[newMood]) {
      console.error(`Invalid mood: ${newMood}`);
      return false;
    }
    
    if (newMood === this.currentMood) {
      console.log(`Already in ${newMood} mood`);
      return false;
    }
    
    if (this.isTransitioning) {
      console.log('Mood transition already in progress');
      return false;
    }
    
    // Check if transition is allowed
    if (!this.transitionRules[this.currentMood].includes(newMood)) {
      console.warn(`Direct transition from ${this.currentMood} to ${newMood} not allowed`);
      return false;
    }
    
    console.log(`Transitioning from ${this.currentMood} to ${newMood}`);
    this.isTransitioning = true;
    this.transitionStartTime = Date.now();
    
    const previousMood = this.currentMood;
    this.currentMood = newMood;
    
    this.notifyListeners('moodChangeStarted', {
      from: previousMood,
      to: newMood,
      duration: this.moodTransitionDuration
    });
    
    return true;
  }
  
  /**
   * Get current mood data
   * @returns {object} - Current mood configuration
   */
  getMoodData() {
    return {
      ...this.moods[this.currentMood],
      mood: this.currentMood,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.getTransitionProgress()
    };
  }
  
  /**
   * Get interpolated values during transition
   * @returns {object} - Interpolated mood parameters
   */
  getInterpolatedMoodData() {
    if (!this.isTransitioning) {
      return this.getMoodData();
    }
    
    const progress = this.getTransitionProgress();
    
    if (progress >= 1) {
      this.isTransitioning = false;
      this.notifyListeners('moodChangeComplete', this.getMoodData());
      return this.getMoodData();
    }
    
    // Find previous mood
    const moodArray = Object.keys(this.moods);
    const previousMoodName = moodArray.find(m => m !== this.currentMood);
    
    if (!previousMoodName) {
      return this.getMoodData();
    }
    
    const from = this.moods[previousMoodName];
    const to = this.moods[this.currentMood];
    
    return this.interpolateMoods(from, to, progress);
  }
  
  /**
   * Get transition progress (0-1)
   * @returns {number} - Progress value
   */
  getTransitionProgress() {
    if (!this.isTransitioning || !this.transitionStartTime) {
      return 0;
    }
    
    const elapsed = Date.now() - this.transitionStartTime;
    return Math.min(elapsed / this.moodTransitionDuration, 1);
  }
  
  /**
   * Interpolate between two mood configurations
   * @param {object} from - Source mood
   * @param {object} to - Target mood
   * @param {number} progress - Interpolation progress (0-1)
   * @returns {object} - Interpolated mood data
   */
  interpolateMoods(from, to, progress) {
    const easeProgress = this.easeInOutCubic(progress);
    
    return {
      name: this.currentMood,
      description: to.description,
      color: {
        r: Math.round(from.color.r + (to.color.r - from.color.r) * easeProgress),
        g: Math.round(from.color.g + (to.color.g - from.color.g) * easeProgress),
        b: Math.round(from.color.b + (to.color.b - from.color.b) * easeProgress)
      },
      brightness: from.brightness + (to.brightness - from.brightness) * easeProgress,
      saturation: from.saturation + (to.saturation - from.saturation) * easeProgress,
      audioResponseSensitivity: from.audioResponseSensitivity + (to.audioResponseSensitivity - from.audioResponseSensitivity) * easeProgress,
      particleSpeed: from.particleSpeed + (to.particleSpeed - from.particleSpeed) * easeProgress,
      particleSize: from.particleSize + (to.particleSize - from.particleSize) * easeProgress,
      particleOpacity: from.particleOpacity + (to.particleOpacity - from.particleOpacity) * easeProgress,
      visualIntensity: from.visualIntensity + (to.visualIntensity - from.visualIntensity) * easeProgress,
      rotationSpeed: from.rotationSpeed + (to.rotationSpeed - from.rotationSpeed) * easeProgress,
      pulseFactor: from.pulseFactor + (to.pulseFactor - from.pulseFactor) * easeProgress,
      glowIntensity: from.glowIntensity + (to.glowIntensity - from.glowIntensity) * easeProgress,
      mood: this.currentMood,
      isTransitioning: true,
      transitionProgress: easeProgress
    };
  }
  
  /**
   * Easing function - cubic in-out
   * @param {number} t - Time value (0-1)
   * @returns {number} - Eased value
   */
  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * Get available moods
   * @returns {array} - List of available mood names
   */
  getAvailableMoods() {
    return Object.keys(this.moods);
  }
  
  /**
   * Get mood description
   * @param {string} moodName - Name of the mood
   * @returns {object} - Mood metadata
   */
  getMoodInfo(moodName) {
    if (!this.moods[moodName]) {
      return null;
    }
    
    return {
      name: this.moods[moodName].name,
      description: this.moods[moodName].description,
      transitionsTo: this.transitionRules[moodName]
    };
  }
  
  /**
   * Set mood transition duration
   * @param {number} duration - Duration in milliseconds
   */
  setTransitionDuration(duration) {
    this.moodTransitionDuration = Math.max(100, duration);
  }
  
  /**
   * Add listener for mood changes
   * @param {function} callback - Callback function
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }
  
  /**
   * Remove listener
   * @param {function} callback - Callback function to remove
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  /**
   * Notify all listeners of a mood event
   * @param {string} eventType - Type of event
   * @param {object} data - Event data
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback({
          type: eventType,
          data: data,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error in mood listener callback:', error);
      }
    });
  }
  
  /**
   * Get frequency band for current mood
   * @returns {object} - Frequency band configuration
   */
  getFrequencyBand() {
    const moodData = this.getInterpolatedMoodData();
    return moodData.frequencyBand || { low: 0, mid: 50, high: 100 };
  }
  
  /**
   * Get visual parameters for rendering
   * @returns {object} - Visual parameters for the visualization
   */
  getVisualParameters() {
    const moodData = this.getInterpolatedMoodData();
    
    return {
      color: moodData.color,
      brightness: moodData.brightness,
      saturation: moodData.saturation,
      backgroundColor: moodData.backgroundColor,
      glowIntensity: moodData.glowIntensity,
      visualIntensity: moodData.visualIntensity,
      particleSpeed: moodData.particleSpeed,
      particleSize: moodData.particleSize,
      particleOpacity: moodData.particleOpacity,
      rotationSpeed: moodData.rotationSpeed,
      pulseFactor: moodData.pulseFactor
    };
  }
  
  /**
   * Get audio response parameters
   * @returns {object} - Audio processing parameters
   */
  getAudioParameters() {
    const moodData = this.getInterpolatedMoodData();
    
    return {
      sensitivity: moodData.audioResponseSensitivity,
      frequencyBand: moodData.frequencyBand,
      responseSmoothing: 1 - moodData.audioResponseSensitivity
    };
  }
  
  /**
   * Reset mood to calm
   */
  reset() {
    if (this.currentMood !== 'calm') {
      this.changeMood('calm');
    }
  }
  
  /**
   * Get mood state as JSON
   * @returns {string} - JSON representation of current mood state
   */
  toJSON() {
    return JSON.stringify({
      currentMood: this.currentMood,
      moodData: this.getMoodData(),
      isTransitioning: this.isTransitioning,
      transitionProgress: this.getTransitionProgress(),
      availableMoods: this.getAvailableMoods()
    }, null, 2);
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MoodEngine;
}
