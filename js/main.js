/**
 * Audio Reactive Space - Main Application Entry Point
 * Handles initialization, scene setup, audio processing, and animation loop
 */

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
import { AudioVisualizer } from './audio-visualizer.js';
import { ParticleSystem } from './particle-system.js';
import { SceneController } from './scene-controller.js';
import { UIController } from './ui-controller.js';

class AudioReactiveSpace {
  constructor() {
    // Application state
    this.isInitialized = false;
    this.isRunning = false;
    this.audioContext = null;
    this.audioAnalyser = null;
    
    // Core components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    
    // Feature modules
    this.audioVisualizer = null;
    this.particleSystem = null;
    this.sceneController = null;
    this.uiController = null;
    
    // Audio and animation
    this.audioSource = null;
    this.animationFrameId = null;
    this.audioDataArray = new Uint8Array(256);
    
    // Performance metrics
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    
    // Configuration
    this.config = {
      fftSize: 256,
      smoothingTimeConstant: 0.8,
      renderResolution: 1.0,
      particleCount: 5000,
      audioFrequencyResponse: true,
      enablePostProcessing: true
    };
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🚀 Initializing Audio Reactive Space...');
      
      // Setup Three.js scene
      await this.setupScene();
      
      // Setup audio system
      await this.setupAudio();
      
      // Initialize feature modules
      await this.initializeModules();
      
      // Setup UI controls
      this.setupUI();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Handle window resize
      window.addEventListener('resize', () => this.onWindowResize());
      
      this.isInitialized = true;
      console.log('✅ Initialization complete');
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.handleError(error);
      return false;
    }
  }

  /**
   * Setup Three.js scene, camera, and renderer
   */
  async setupScene() {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.scene.fog = new THREE.Fog(0x000000, 1000, 5000);

    // Camera setup
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      10000
    );
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    // Lighting setup
    this.setupLighting();

    console.log('📐 Scene setup complete');
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light for audio reactivity
    const pointLight = new THREE.PointLight(0xff00ff, 0.5);
    pointLight.position.set(0, 50, 0);
    this.scene.add(pointLight);
  }

  /**
   * Setup Web Audio API
   */
  async setupAudio() {
    try {
      // Initialize audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();

      // Create analyser node
      this.audioAnalyser = this.audioContext.createAnalyser();
      this.audioAnalyser.fftSize = this.config.fftSize;
      this.audioAnalyser.smoothingTimeConstant = this.config.smoothingTimeConstant;

      // Get frequency data array
      this.audioDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

      console.log('🔊 Audio system initialized');
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize feature modules
   */
  async initializeModules() {
    // Audio Visualizer
    this.audioVisualizer = new AudioVisualizer(
      this.scene,
      this.audioAnalyser,
      this.config
    );
    await this.audioVisualizer.init();

    // Particle System
    this.particleSystem = new ParticleSystem(
      this.scene,
      this.config.particleCount,
      this.audioAnalyser,
      this.config
    );
    await this.particleSystem.init();

    // Scene Controller
    this.sceneController = new SceneController(
      this.scene,
      this.camera,
      this.renderer,
      this.audioAnalyser,
      this.config
    );
    await this.sceneController.init();

    console.log('📦 Modules initialized');
  }

  /**
   * Setup UI controls
   */
  setupUI() {
    this.uiController = new UIController({
      onConfigChange: (key, value) => this.updateConfig(key, value),
      onPlayAudio: () => this.playAudio(),
      onStopAudio: () => this.stopAudio(),
      onFileUpload: (file) => this.handleAudioFileUpload(file)
    });

    this.uiController.init();
    console.log('🎛️ UI setup complete');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));

    // Mouse controls
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('click', (e) => this.onClick(e));

    // Touch controls
    document.addEventListener('touchstart', (e) => this.onTouchStart(e));
    document.addEventListener('touchmove', (e) => this.onTouchMove(e));
  }

  /**
   * Update configuration
   */
  updateConfig(key, value) {
    this.config[key] = value;
    console.log(`⚙️ Config updated: ${key} = ${value}`);

    // Apply configuration changes to modules
    if (this.audioVisualizer) {
      this.audioVisualizer.updateConfig(this.config);
    }
    if (this.particleSystem) {
      this.particleSystem.updateConfig(this.config);
    }
    if (this.sceneController) {
      this.sceneController.updateConfig(this.config);
    }
  }

  /**
   * Play audio from input
   */
  async playAudio() {
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      console.log('▶️ Audio playback started');
    } catch (error) {
      console.error('❌ Audio playback error:', error);
    }
  }

  /**
   * Stop audio playback
   */
  stopAudio() {
    if (this.audioSource) {
      this.audioSource.stop();
      console.log('⏹️ Audio playback stopped');
    }
  }

  /**
   * Handle audio file upload
   */
  async handleAudioFileUpload(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Create audio source
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.connect(this.audioAnalyser);
      this.audioAnalyser.connect(this.audioContext.destination);

      console.log('📁 Audio file loaded:', file.name);
    } catch (error) {
      console.error('❌ Audio file loading error:', error);
    }
  }

  /**
   * Main animation loop
   */
  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    // Update performance metrics
    this.updatePerformanceMetrics();

    // Get audio data
    if (this.audioAnalyser) {
      this.audioAnalyser.getByteFrequencyData(this.audioDataArray);
    }

    // Update modules
    this.updateModules();

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Update all modules
   */
  updateModules() {
    // Update audio visualizer
    if (this.audioVisualizer) {
      this.audioVisualizer.update(this.audioDataArray);
    }

    // Update particle system
    if (this.particleSystem) {
      this.particleSystem.update(this.audioDataArray);
    }

    // Update scene controller
    if (this.sceneController) {
      this.sceneController.update(this.audioDataArray);
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Update UI with FPS
      if (this.uiController) {
        this.uiController.updateFPS(this.fps);
      }
    }
  }

  /**
   * Handle window resize
   */
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);

    console.log(`🔄 Window resized: ${width}x${height}`);
  }

  /**
   * Handle keyboard input
   */
  onKeyDown(event) {
    switch (event.key.toLowerCase()) {
      case ' ':
        event.preventDefault();
        this.playAudio();
        break;
      case 'escape':
        this.stopAudio();
        break;
      case 'f':
        this.toggleFullscreen();
        break;
      case 'p':
        this.togglePause();
        break;
    }
  }

  /**
   * Handle keyboard release
   */
  onKeyUp(event) {
    // Handle key release events
  }

  /**
   * Handle mouse movement
   */
  onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    if (this.sceneController) {
      this.sceneController.onMouseMove(mouseX, mouseY);
    }
  }

  /**
   * Handle mouse click
   */
  onClick(event) {
    console.log('🖱️ Click detected');
  }

  /**
   * Handle touch start
   */
  onTouchStart(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;

      if (this.sceneController) {
        this.sceneController.onMouseMove(mouseX, mouseY);
      }
    }
  }

  /**
   * Handle touch movement
   */
  onTouchMove(event) {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
      const mouseY = -(touch.clientY / window.innerHeight) * 2 + 1;

      if (this.sceneController) {
        this.sceneController.onMouseMove(mouseX, mouseY);
      }
    }
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  /**
   * Toggle pause/resume
   */
  togglePause() {
    this.isRunning = !this.isRunning;
    console.log(this.isRunning ? '▶️ Resumed' : '⏸️ Paused');
  }

  /**
   * Handle errors
   */
  handleError(error) {
    console.error('Application error:', error);
    // Display error message to user
    if (this.uiController) {
      this.uiController.showError(error.message);
    }
  }

  /**
   * Start the application
   */
  async start() {
    if (this.isInitialized && !this.isRunning) {
      this.isRunning = true;
      console.log('🎬 Starting animation loop...');
      this.animate();
      return true;
    }
    return false;
  }

  /**
   * Cleanup and dispose resources
   */
  dispose() {
    console.log('🧹 Cleaning up resources...');

    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Dispose modules
    if (this.audioVisualizer) this.audioVisualizer.dispose();
    if (this.particleSystem) this.particleSystem.dispose();
    if (this.sceneController) this.sceneController.dispose();

    // Dispose scene
    if (this.scene) {
      this.scene.traverse(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }

    this.isRunning = false;
    console.log('✅ Cleanup complete');
  }
}

/**
 * Application initialization on DOM ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  const app = new AudioReactiveSpace();

  // Initialize application
  const initialized = await app.init();

  if (initialized) {
    // Start animation loop
    await app.start();
  } else {
    console.error('Failed to initialize application');
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    app.dispose();
  });

  // Expose app to global scope for debugging
  window.audioReactiveSpace = app;
});

export { AudioReactiveSpace };
