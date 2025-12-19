/**
 * AudioAnalyzer - Comprehensive audio analysis module
 * Features: frequency analysis, beat detection, statistical calculations
 */

class AudioAnalyzer {
  constructor(audioContext, fftSize = 2048) {
    this.audioContext = audioContext;
    this.fftSize = fftSize;
    
    // Create analyser node
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = fftSize;
    
    // Frequency and time domain data
    this.dataArrayFrequency = new Uint8Array(this.analyser.frequencyBinCount);
    this.dataArrayTime = new Uint8Array(this.analyser.frequencyBinCount);
    
    // Beat detection state
    this.beatThreshold = 0.6;
    this.beatSensitivity = 1.2;
    this.prevEnergy = 0;
    this.isBeat = false;
    this.beatEnergy = 0;
    
    // History buffers for smoothing and analysis
    this.frequencyHistory = [];
    this.energyHistory = [];
    this.maxHistoryLength = 60; // 60 frames of history
    
    // Frequency band analysis
    this.frequencyBands = {
      subBass: { min: 20, max: 60, energy: 0 },
      bass: { min: 60, max: 250, energy: 0 },
      lowMid: { min: 250, max: 500, energy: 0 },
      mid: { min: 500, max: 2000, energy: 0 },
      highMid: { min: 2000, max: 4000, energy: 0 },
      treble: { min: 4000, max: 6000, energy: 0 },
      brilliance: { min: 6000, max: 20000, energy: 0 }
    };
    
    // Statistical data
    this.stats = {
      totalEnergy: 0,
      averageFrequency: 0,
      peakFrequency: 0,
      spectralCentroid: 0,
      spectralSpread: 0,
      spectralFlux: 0,
      zeroCrossingRate: 0,
      variance: 0,
      entropy: 0
    };
    
    // Peak detection
    this.peakHistory = [];
    this.peakThreshold = 0.7;
  }
  
  /**
   * Connect audio source to analyser
   */
  connect(source) {
    source.connect(this.analyser);
    return this.analyser;
  }
  
  /**
   * Update analysis data - call this in animation loop
   */
  update() {
    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.dataArrayFrequency);
    this.analyser.getByteTimeDomainData(this.dataArrayTime);
    
    // Calculate statistics
    this.calculateFrequencyBands();
    this.calculateSpectralAnalysis();
    this.calculateTimeAnalysis();
    this.detectBeat();
    this.updateHistory();
  }
  
  /**
   * Calculate energy in different frequency bands
   */
  calculateFrequencyBands() {
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.analyser.frequencyBinCount;
    
    // Reset band energies
    Object.keys(this.frequencyBands).forEach(band => {
      this.frequencyBands[band].energy = 0;
    });
    
    // Accumulate energy in each band
    for (let i = 0; i < this.dataArrayFrequency.length; i++) {
      const frequency = i * binWidth;
      const magnitude = this.dataArrayFrequency[i] / 255;
      
      Object.keys(this.frequencyBands).forEach(band => {
        const bandConfig = this.frequencyBands[band];
        if (frequency >= bandConfig.min && frequency < bandConfig.max) {
          bandConfig.energy += magnitude;
        }
      });
    }
    
    // Normalize band energies
    Object.keys(this.frequencyBands).forEach(band => {
      const binCount = Math.ceil(
        (this.frequencyBands[band].max - this.frequencyBands[band].min) / 
        (nyquist / this.analyser.frequencyBinCount)
      );
      this.frequencyBands[band].energy /= Math.max(binCount, 1);
    });
  }
  
  /**
   * Calculate spectral analysis metrics
   */
  calculateSpectralAnalysis() {
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.analyser.frequencyBinCount;
    let weightedSum = 0;
    let totalMagnitude = 0;
    let maxMagnitude = 0;
    let peakFrequency = 0;
    
    for (let i = 0; i < this.dataArrayFrequency.length; i++) {
      const magnitude = this.dataArrayFrequency[i] / 255;
      const frequency = i * binWidth;
      
      weightedSum += magnitude * frequency;
      totalMagnitude += magnitude;
      
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        peakFrequency = frequency;
      }
    }
    
    // Spectral centroid (center of mass of spectrum)
    this.stats.spectralCentroid = totalMagnitude > 0 ? 
      weightedSum / totalMagnitude : 0;
    
    this.stats.peakFrequency = peakFrequency;
    this.stats.totalEnergy = totalMagnitude / this.dataArrayFrequency.length;
    
    // Spectral spread (how concentrated spectrum is)
    let spreadSum = 0;
    for (let i = 0; i < this.dataArrayFrequency.length; i++) {
      const magnitude = this.dataArrayFrequency[i] / 255;
      const frequency = i * binWidth;
      spreadSum += magnitude * Math.pow(frequency - this.stats.spectralCentroid, 2);
    }
    this.stats.spectralSpread = Math.sqrt(spreadSum / Math.max(totalMagnitude, 1));
    
    // Spectral flux (change in spectrum magnitude)
    if (this.frequencyHistory.length > 0) {
      let fluxSum = 0;
      const prevData = this.frequencyHistory[this.frequencyHistory.length - 1];
      for (let i = 0; i < this.dataArrayFrequency.length; i++) {
        const diff = (this.dataArrayFrequency[i] / 255) - prevData[i];
        fluxSum += diff * diff;
      }
      this.stats.spectralFlux = Math.sqrt(fluxSum / this.dataArrayFrequency.length);
    }
  }
  
  /**
   * Calculate time-domain analysis metrics
   */
  calculateTimeAnalysis() {
    let mean = 0;
    let zeroCrossings = 0;
    
    // Calculate mean
    for (let i = 0; i < this.dataArrayTime.length; i++) {
      mean += (this.dataArrayTime[i] - 128) / 128;
    }
    mean /= this.dataArrayTime.length;
    
    // Calculate variance and zero crossings
    let varianceSum = 0;
    for (let i = 0; i < this.dataArrayTime.length; i++) {
      const normalized = (this.dataArrayTime[i] - 128) / 128;
      varianceSum += Math.pow(normalized - mean, 2);
      
      if (i > 0) {
        const prev = (this.dataArrayTime[i - 1] - 128) / 128;
        if ((normalized >= 0 && prev < 0) || (normalized < 0 && prev >= 0)) {
          zeroCrossings++;
        }
      }
    }
    
    this.stats.variance = varianceSum / this.dataArrayTime.length;
    this.stats.zeroCrossingRate = zeroCrossings / this.dataArrayTime.length;
    
    // Calculate entropy (spectral entropy as measure of signal disorder)
    let entropy = 0;
    let totalEnergy = 0;
    for (let i = 0; i < this.dataArrayFrequency.length; i++) {
      const magnitude = this.dataArrayFrequency[i] / 255;
      totalEnergy += magnitude;
    }
    
    if (totalEnergy > 0) {
      for (let i = 0; i < this.dataArrayFrequency.length; i++) {
        const magnitude = this.dataArrayFrequency[i] / 255;
        const normalized = magnitude / totalEnergy;
        if (normalized > 0) {
          entropy -= normalized * Math.log2(normalized);
        }
      }
    }
    this.stats.entropy = entropy;
  }
  
  /**
   * Detect beats using energy-based method
   */
  detectBeat() {
    const currentEnergy = this.stats.totalEnergy;
    const energyThreshold = this.beatThreshold * this.getAverageEnergy();
    const energyDifference = currentEnergy - this.prevEnergy;
    
    // Beat is detected when energy increases significantly above threshold
    this.isBeat = (currentEnergy > energyThreshold && energyDifference > 0);
    this.beatEnergy = currentEnergy;
    
    // Apply sensitivity multiplier for more aggressive beat detection
    if (this.isBeat) {
      this.beatEnergy *= this.beatSensitivity;
    }
    
    this.prevEnergy = currentEnergy;
  }
  
  /**
   * Update history buffers
   */
  updateHistory() {
    // Store normalized frequency data
    const normalizedFrequency = Array.from(this.dataArrayFrequency).map(v => v / 255);
    this.frequencyHistory.push(normalizedFrequency);
    
    // Store energy
    this.energyHistory.push(this.stats.totalEnergy);
    
    // Keep history within max length
    if (this.frequencyHistory.length > this.maxHistoryLength) {
      this.frequencyHistory.shift();
      this.energyHistory.shift();
    }
  }
  
  /**
   * Get average energy from history
   */
  getAverageEnergy() {
    if (this.energyHistory.length === 0) return 0;
    return this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
  }
  
  /**
   * Get standard deviation of energy
   */
  getEnergyStandardDeviation() {
    if (this.energyHistory.length === 0) return 0;
    const avg = this.getAverageEnergy();
    const variance = this.energyHistory.reduce((sum, energy) => 
      sum + Math.pow(energy - avg, 2), 0) / this.energyHistory.length;
    return Math.sqrt(variance);
  }
  
  /**
   * Get smoothed value from history (exponential moving average)
   */
  getSmoothedValue(value, smoothingFactor = 0.7) {
    return this.lastSmoothed === undefined ? 
      value : (value * (1 - smoothingFactor)) + (this.lastSmoothed * smoothingFactor);
  }
  
  /**
   * Get frequency data as normalized array
   */
  getFrequencyData() {
    return Array.from(this.dataArrayFrequency).map(v => v / 255);
  }
  
  /**
   * Get time domain data as normalized array
   */
  getTimeDomainData() {
    return Array.from(this.dataArrayTime).map(v => (v - 128) / 128);
  }
  
  /**
   * Get specific frequency band energy
   */
  getBandEnergy(bandName) {
    return this.frequencyBands[bandName]?.energy || 0;
  }
  
  /**
   * Get all band energies
   */
  getAllBandEnergies() {
    const energies = {};
    Object.keys(this.frequencyBands).forEach(band => {
      energies[band] = this.frequencyBands[band].energy;
    });
    return energies;
  }
  
  /**
   * Check if currently detecting a beat
   */
  isBeatDetected() {
    return this.isBeat;
  }
  
  /**
   * Get beat energy
   */
  getBeatEnergy() {
    return this.beatEnergy;
  }
  
  /**
   * Set beat detection threshold (0-1)
   */
  setBeatThreshold(threshold) {
    this.beatThreshold = Math.max(0, Math.min(1, threshold));
  }
  
  /**
   * Set beat sensitivity multiplier
   */
  setBeatSensitivity(sensitivity) {
    this.beatSensitivity = Math.max(0.5, Math.min(2, sensitivity));
  }
  
  /**
   * Get all statistics
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Get frequency response at specific frequency
   */
  getFrequencyResponse(frequency) {
    const nyquist = this.audioContext.sampleRate / 2;
    const binIndex = Math.floor((frequency / nyquist) * this.dataArrayFrequency.length);
    const clampedIndex = Math.max(0, Math.min(this.dataArrayFrequency.length - 1, binIndex));
    return this.dataArrayFrequency[clampedIndex] / 255;
  }
  
  /**
   * Get frequency range energy (useful for custom band analysis)
   */
  getFrequencyRangeEnergy(minFreq, maxFreq) {
    const nyquist = this.audioContext.sampleRate / 2;
    const binWidth = nyquist / this.analyser.frequencyBinCount;
    const minBin = Math.floor(minFreq / binWidth);
    const maxBin = Math.ceil(maxFreq / binWidth);
    
    let energy = 0;
    for (let i = minBin; i < maxBin && i < this.dataArrayFrequency.length; i++) {
      energy += this.dataArrayFrequency[i] / 255;
    }
    
    return energy / (maxBin - minBin);
  }
  
  /**
   * Get analyser node for direct access
   */
  getAnalyser() {
    return this.analyser;
  }
  
  /**
   * Dispose resources
   */
  dispose() {
    this.frequencyHistory = [];
    this.energyHistory = [];
    this.peakHistory = [];
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioAnalyzer;
}