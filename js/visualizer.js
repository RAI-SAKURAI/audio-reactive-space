/**
 * Advanced Audio-Reactive Visualization Engine
 * Features: Particle Systems, Waveforms, Reactive Geometry, Impact Effects
 */

class AdvancedVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    // Animation state
    this.animationFrameId = null;
    this.isRunning = false;
    this.time = 0;
    this.deltaTime = 0;
    this.lastFrameTime = performance.now();
    
    // Audio data
    this.audioData = {
      frequency: new Uint8Array(256),
      waveform: new Uint8Array(2048),
      bass: 0,
      mid: 0,
      treble: 0,
      average: 0,
      peak: 0
    };
    
    // Visual systems
    this.particleSystem = new ParticleSystem();
    this.waveformRenderer = new WaveformRenderer();
    this.reactiveGeometry = new ReactiveGeometry();
    this.impactEffects = new ImpactEffects();
    
    // Configuration
    this.config = {
      particlesEnabled: true,
      waveformEnabled: true,
      geometryEnabled: true,
      impactEnabled: true,
      backgroundColor: 'rgba(10, 10, 20, 0.1)',
      reactivityScale: 1.5,
      smoothingFactor: 0.8
    };
    
    // Smoothed audio values
    this.smoothedAudio = {
      bass: 0,
      mid: 0,
      treble: 0,
      average: 0
    };
    
    this.setupCanvas();
  }
  
  setupCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    window.addEventListener('resize', () => this.handleResize());
  }
  
  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }
  
  updateAudioData(frequencyData, waveformData) {
    // Update raw audio data
    this.audioData.frequency = frequencyData;
    this.audioData.waveform = waveformData;
    
    // Calculate frequency bands
    this.audioData.bass = this.calculateBand(0, 85);
    this.audioData.mid = this.calculateBand(85, 170);
    this.audioData.treble = this.calculateBand(170, 256);
    this.audioData.average = (this.audioData.bass + this.audioData.mid + this.audioData.treble) / 3;
    this.audioData.peak = Math.max(...frequencyData);
    
    // Apply smoothing
    this.smoothedAudio.bass = this.lerp(this.smoothedAudio.bass, this.audioData.bass, 1 - this.config.smoothingFactor);
    this.smoothedAudio.mid = this.lerp(this.smoothedAudio.mid, this.audioData.mid, 1 - this.config.smoothingFactor);
    this.smoothedAudio.treble = this.lerp(this.smoothedAudio.treble, this.audioData.treble, 1 - this.config.smoothingFactor);
    this.smoothedAudio.average = this.lerp(this.smoothedAudio.average, this.audioData.average, 1 - this.config.smoothingFactor);
  }
  
  calculateBand(start, end) {
    const band = this.audioData.frequency.slice(start, end);
    return band.reduce((a, b) => a + b, 0) / band.length / 255;
  }
  
  lerp(current, target, factor) {
    return current + (target - target) * factor;
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
  
  animate() {
    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;
    this.time += this.deltaTime;
    
    // Clear canvas
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Update and render systems
    if (this.config.waveformEnabled) {
      this.waveformRenderer.update(this.audioData, this.time);
      this.waveformRenderer.render(this.ctx, this.width, this.height);
    }
    
    if (this.config.geometryEnabled) {
      this.reactiveGeometry.update(this.smoothedAudio, this.time);
      this.reactiveGeometry.render(this.ctx, this.width, this.height);
    }
    
    if (this.config.impactEnabled) {
      this.impactEffects.update(this.deltaTime);
      this.impactEffects.render(this.ctx, this.width, this.height);
    }
    
    if (this.config.particlesEnabled) {
      this.particleSystem.update(this.deltaTime, this.smoothedAudio);
      this.particleSystem.render(this.ctx);
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  triggerImpact(x, y, intensity = 1) {
    this.impactEffects.addImpact(x, y, intensity);
    this.particleSystem.burst(x, y, intensity);
  }
  
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Particle System - Handles dynamic particle generation and animation
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 500;
  }
  
  emit(x, y, count = 5, intensity = 1) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      
      const angle = (Math.PI * 2 * i) / count;
      const speed = 50 + Math.random() * 150 * intensity;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1 + Math.random() * 0.5,
        size: 2 + Math.random() * 4,
        hue: Math.random() * 360,
        type: Math.random() > 0.5 ? 'glow' : 'normal'
      });
    }
  }
  
  burst(x, y, intensity = 1) {
    this.emit(x, y, 20 * intensity, intensity);
  }
  
  update(deltaTime, audioData) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Apply gravity and drag
      p.vy += 20 * deltaTime; // gravity
      p.vx *= 0.98; // drag
      p.vy *= 0.98;
      
      // Update position
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      
      // Age particle
      p.life -= deltaTime / p.maxLife;
      
      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
    
    // Emit new particles based on audio
    const emissionRate = 3 + audioData.average * 20;
    this.emit(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight,
      Math.floor(emissionRate),
      audioData.average
    );
  }
  
  render(ctx) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life);
      const sizeMultiplier = (1 - Math.abs(p.life - 0.5) * 2);
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (p.type === 'glow') {
        // Glowing particles
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal particles
        ctx.fillStyle = `hsl(${p.hue}, 80%, 50%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * sizeMultiplier, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
}

/**
 * Waveform Renderer - Visualizes audio waveform data
 */
class WaveformRenderer {
  constructor() {
    this.smoothWaveform = new Array(512).fill(0);
    this.mode = 'circular'; // 'linear', 'circular', 'radial'
  }
  
  update(audioData, time) {
    // Smooth waveform data
    const newWaveform = Array.from(audioData.waveform).map(v => v / 255);
    for (let i = 0; i < this.smoothWaveform.length; i++) {
      this.smoothWaveform[i] = this.smoothWaveform[i] * 0.7 + newWaveform[i] * 0.3;
    }
  }
  
  render(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    switch (this.mode) {
      case 'circular':
        this.renderCircular(ctx, centerX, centerY, radius);
        break;
      case 'linear':
        this.renderLinear(ctx, width, height);
        break;
      case 'radial':
        this.renderRadial(ctx, centerX, centerY, radius);
        break;
    }
  }
  
  renderCircular(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < this.smoothWaveform.length; i++) {
      const angle = (i / this.smoothWaveform.length) * Math.PI * 2;
      const distance = radius + this.smoothWaveform[i] * radius * 0.5;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(100, 200, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  renderLinear(ctx, width, height) {
    const sampleWidth = width / this.smoothWaveform.length;
    const centerY = height / 2;
    const scale = height * 0.4;
    
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < this.smoothWaveform.length; i++) {
      const x = i * sampleWidth;
      const y = centerY - this.smoothWaveform[i] * scale;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  }
  
  renderRadial(ctx, centerX, centerY, radius) {
    ctx.strokeStyle = 'rgba(200, 100, 255, 0.8)';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < this.smoothWaveform.length; i++) {
      const angle = (i / this.smoothWaveform.length) * Math.PI * 2;
      const distance = this.smoothWaveform[i] * radius;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + distance);
      const y2 = centerY + Math.sin(angle) * (radius + distance);
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

/**
 * Reactive Geometry - Generates audio-reactive shapes
 */
class ReactiveGeometry {
  constructor() {
    this.shapes = [];
    this.time = 0;
  }
  
  update(audioData, time) {
    this.time = time;
    
    // Initialize shapes if empty
    if (this.shapes.length === 0) {
      this.initializeShapes();
    }
    
    // Update shapes based on audio
    for (const shape of this.shapes) {
      this.updateShape(shape, audioData);
    }
  }
  
  initializeShapes() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.shapes = [
      { type: 'polygon', sides: 5, x: width * 0.25, y: height * 0.5, baseRadius: 80, rotation: 0 },
      { type: 'polygon', sides: 6, x: width * 0.75, y: height * 0.5, baseRadius: 100, rotation: 0 },
      { type: 'spiral', x: width * 0.5, y: height * 0.3, baseRadius: 60, rotations: 3 },
      { type: 'grid', x: width * 0.5, y: height * 0.7, spacing: 20, size: 10 }
    ];
  }
  
  updateShape(shape, audioData) {
    if (shape.type === 'polygon') {
      shape.rotation += audioData.average * 0.1;
      shape.radius = shape.baseRadius * (1 + audioData.average * 0.5);
    } else if (shape.type === 'spiral') {
      shape.rotation = (this.time * 0.5) + audioData.treble * 2;
      shape.radiusMultiplier = 1 + audioData.bass * 0.3;
    } else if (shape.type === 'grid') {
      shape.distortion = audioData.mid;
    }
  }
  
  render(ctx, width, height) {
    for (const shape of this.shapes) {
      switch (shape.type) {
        case 'polygon':
          this.renderPolygon(ctx, shape);
          break;
        case 'spiral':
          this.renderSpiral(ctx, shape);
          break;
        case 'grid':
          this.renderGrid(ctx, shape);
          break;
      }
    }
  }
  
  renderPolygon(ctx, shape) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);
    
    ctx.strokeStyle = `hsl(${shape.rotation * 50}, 100%, 60%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < shape.sides; i++) {
      const angle = (i / shape.sides) * Math.PI * 2;
      const x = Math.cos(angle) * shape.radius;
      const y = Math.sin(angle) * shape.radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  
  renderSpiral(ctx, shape) {
    ctx.save();
    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation);
    
    ctx.strokeStyle = 'rgba(255, 100, 200, 0.6)';
    ctx.lineWidth = 2;
    
    const points = 200;
    for (let i = 0; i < points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 2 * shape.rotations;
      const radius = t * 100 * (shape.radiusMultiplier || 1);
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    ctx.restore();
  }
  
  renderGrid(ctx, shape) {
    const cols = Math.ceil(window.innerWidth / shape.spacing);
    const rows = Math.ceil(window.innerHeight / shape.spacing);
    
    ctx.strokeStyle = `rgba(100, 255, 200, ${0.3 + shape.distortion * 0.3})`;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = shape.x + i * shape.spacing;
        const y = shape.y + j * shape.spacing;
        
        ctx.beginPath();
        const offset = Math.sin(i + j + this.time) * shape.size * shape.distortion;
        ctx.arc(x + offset, y + offset, shape.size * (0.5 + shape.distortion * 0.5), 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}

/**
 * Impact Effects - Handles collision and explosion visual effects
 */
class ImpactEffects {
  constructor() {
    this.impacts = [];
    this.rings = [];
  }
  
  addImpact(x, y, intensity = 1) {
    // Add shockwave ring
    this.rings.push({
      x,
      y,
      radius: 0,
      maxRadius: 150 * intensity,
      life: 1,
      maxLife: 0.5,
      thickness: 3 * intensity,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
    
    // Add impact marker
    this.impacts.push({
      x,
      y,
      life: 1,
      maxLife: 0.3,
      size: 20 * intensity,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`
    });
  }
  
  update(deltaTime) {
    // Update rings
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.life -= deltaTime / ring.maxLife;
      ring.radius += ring.maxRadius * deltaTime * 3;
      
      if (ring.life <= 0) {
        this.rings.splice(i, 1);
      }
    }
    
    // Update impacts
    for (let i = this.impacts.length - 1; i >= 0; i--) {
      const impact = this.impacts[i];
      impact.life -= deltaTime / impact.maxLife;
      
      if (impact.life <= 0) {
        this.impacts.splice(i, 1);
      }
    }
  }
  
  render(ctx, width, height) {
    // Render rings
    for (const ring of this.rings) {
      const alpha = Math.max(0, ring.life);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = ring.thickness * (1 - (1 - ring.life));
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    
    // Render impacts
    for (const impact of this.impacts) {
      const alpha = Math.max(0, impact.life);
      const scaleMultiplier = 1 + (1 - impact.life) * 0.5;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = impact.color;
      ctx.beginPath();
      ctx.arc(impact.x, impact.y, impact.size * scaleMultiplier, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdvancedVisualizer,
    ParticleSystem,
    WaveformRenderer,
    ReactiveGeometry,
    ImpactEffects
  };
}
