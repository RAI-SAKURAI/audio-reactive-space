# 🎵 Audio-Reactive Space

An immersive, real-time audio-reactive visualization experience that transforms sound into dynamic visual art. This project creates an interactive space where music and visuals merge seamlessly, delivering captivating audiovisual performances.

---

## 🎨 Vision

**Audio-Reactive Space** is a creative platform that bridges the gap between music and visual art. Our vision is to create an accessible, high-performance environment where:

- **Sound Becomes Vision**: Every frequency, beat, and texture from your audio is intelligently mapped to visual elements in real-time
- **Immersive Experiences**: Users can experience synchronized audiovisual performances that respond dynamically to live audio or pre-recorded tracks
- **Creative Expression**: Artists, musicians, and developers can craft unique visual narratives driven by audio data
- **Performance Excellence**: Optimized rendering ensures smooth, responsive visuals at high frame rates regardless of audio complexity

---

## ✨ Key Features

### Core Visualization
- **Real-Time Audio Analysis**: Frequency spectrum analysis, beat detection, and amplitude tracking
- **Dynamic Particle Systems**: Interactive particles that respond to different audio frequencies
- **3D Geometric Transformations**: Shapes and objects that morph based on audio characteristics
- **Color Mapping**: Intelligent color gradients that shift with audio intensity and frequency ranges

### Audio Processing
- **Multi-Band Frequency Analysis**: Separate low, mid, and high-frequency tracking
- **Beat Detection**: Automatic synchronization with musical beats and rhythm
- **Audio Normalization**: Adaptive gain control for consistent visuals across different audio sources
- **Real-Time FFT Processing**: Fast Fourier Transform for accurate spectrum analysis

### Interactive Controls
- **Parameter Adjustments**: Fine-tune sensitivity, scale, and visual intensity
- **Preset Modes**: Pre-configured visual styles for different audio genres
- **Live Audio Input**: Microphone support for live performance scenarios
- **Media Playback Integration**: Compatible with audio files and streaming sources

### Performance & Optimization
- **GPU-Accelerated Rendering**: Utilizes WebGL/Three.js for high-performance graphics
- **Responsive Design**: Adapts to different screen sizes and resolutions
- **Frame Rate Optimization**: Maintains 60+ FPS for smooth visual experience
- **Memory Efficient**: Optimized data structures for handling real-time audio data streams

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Modern web browser with WebGL support
- Audio input device (optional, for microphone input)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RAI-SAKURAI/audio-reactive-space.git
   cd audio-reactive-space
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will start at `http://localhost:3000`

4. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

5. **Deploy**
   ```bash
   npm run deploy
   # or
   yarn deploy
   ```

### Usage

1. **Launch the Application**: Open the application in your web browser
2. **Load Audio**: 
   - Upload an audio file, or
   - Grant microphone permissions for live audio input
3. **Adjust Settings**: Use the control panel to fine-tune visualization parameters
4. **Enjoy**: Watch as your music transforms into mesmerizing visuals

---

## 🎭 Aesthetic Guidelines

### Design Philosophy
Audio-Reactive Space embraces a modern, minimalist aesthetic that puts the focus on dynamic audio-driven visuals while maintaining visual coherence and accessibility.

### Color Palette

#### Primary Spectrum
- **Cool Tones**: `#00d4ff` (Cyan), `#0099ff` (Sky Blue), `#6600ff` (Violet)
- **Warm Tones**: `#ff6600` (Orange), `#ff0099` (Magenta), `#ffcc00` (Gold)
- **Neutral**: `#0a0e27` (Deep Navy - Background), `#ffffff` (Pure White - Accents)

#### Frequency-to-Color Mapping
- **Bass (20-250 Hz)**: Warm reds and oranges (`#ff4444` - `#ffaa00`)
- **Midrange (250-2000 Hz)**: Greens and cyans (`#00ff99` - `#00ddff`)
- **Treble (2000+ Hz)**: Blues and purples (`#0099ff` - `#9900ff`)

### Typography

#### Font Choices
- **Primary Font**: `Inter`, `Roboto`, or system sans-serif for a modern look
- **Monospace**: `Fira Code` or `Courier Prime` for technical elements
- **Weight**: Use weights 300 (light) and 700 (bold) for visual hierarchy

#### Sizing & Spacing
- **Large Titles**: 48px - 64px
- **Headings**: 24px - 32px
- **Body Text**: 14px - 16px
- **Minimal Padding**: 16px - 32px margins for clean, spacious layouts

### UI/UX Elements

#### Controls
- **Buttons**: Rounded corners (8px-12px), subtle shadows, smooth hover transitions
- **Sliders**: Thin tracks (2px-4px) with gradient fills following frequency spectrum
- **Toggles**: Animated switches with clear on/off states
- **Responsive Feedback**: All interactions provide visual/haptic feedback

#### Visual Hierarchy
- **Layering**: Use opacity (0.1 - 1.0) to create depth
- **Glow Effects**: Subtle neon-like glows on active elements
- **Animations**: Smooth easing (cubic-bezier) with 200-400ms durations
- **Contrast**: Maintain WCAG AA standards for accessibility

### Animation Guidelines

#### Motion Principles
- **Anticipation**: Objects prepare before responding to audio changes
- **Easing**: Use ease-out for visual responses, ease-in-out for continuous motion
- **Damping**: Apply smoothing to prevent jittery movement
- **Synchronization**: All animations directly map to audio frequencies/beats

#### Particle Systems
- **Variety**: Mix particle sizes, speeds, and lifespans
- **Color Variance**: Apply slight hue/saturation shifts for organic feel
- **Physics**: Gravity, collision, and velocity create natural movement
- **Fade Out**: Particles fade out gradually before removal

### Dark Mode Considerations
- **Background**: Use `#0a0e27` or darker for OLED screens
- **Text Contrast**: Ensure 7:1 minimum contrast ratio
- **Glow Intensity**: Adjust neon colors for reduced eye strain
- **Accessibility**: Provide high-contrast mode option

---

## 📁 Project Structure

```
audio-reactive-space/
├── src/
│   ├── components/          # React/Vue components
│   ├── utils/               # Utility functions (audio processing, math)
│   ├── shaders/             # GLSL shaders (vertex & fragment)
│   ├── styles/              # Global styles & theme configurations
│   ├── App.js              # Main application entry
│   └── index.js            # Application bootstrap
├── public/
│   ├── index.html          # HTML template
│   └── assets/             # Static assets
├── tests/                  # Unit and integration tests
├── docs/                   # Documentation
├── .env.example            # Environment variables template
├── package.json            # Project dependencies
├── webpack.config.js       # Webpack configuration
└── README.md              # This file
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server Configuration
VITE_PORT=3000
VITE_HOST=localhost

# Audio Settings
VITE_AUDIO_SAMPLE_RATE=44100
VITE_FFT_SIZE=2048
VITE_SMOOTHING=0.8

# Visualization
VITE_MAX_PARTICLES=5000
VITE_TARGET_FPS=60
VITE_ENABLE_DEBUG=false
```

### Parameter Tuning

Fine-tune visualization behavior through the settings panel:
- **Sensitivity**: How responsive visuals are to audio changes (0.1 - 2.0)
- **Scale**: Overall size of visual elements (0.5 - 3.0)
- **Smoothing**: Temporal smoothing for stable visuals (0.0 - 1.0)
- **Decay**: How quickly visuals fade after audio change (0.1 - 1.0)

---

## 📊 Performance Benchmarks

| Metric | Target | Notes |
|--------|--------|-------|
| FPS | 60+ | Stable across all configurations |
| Audio Latency | <50ms | Between input and visual response |
| Memory (Idle) | <100MB | Chrome/Firefox |
| Initial Load | <3s | On 4G connection |
| CPU Usage | <30% | Single-threaded performance |

---

## 🎓 Use Cases

- **Live Music Performances**: VJ sets and audiovisual performances
- **Music Production**: Real-time visualization during composition
- **Interactive Installations**: Gallery and museum exhibitions
- **Gaming**: In-game music visualization backgrounds
- **Educational**: Learning audio signal processing and visualization
- **Creative Coding**: Artistic experimentation and generative art

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes with clear messages
4. **Push** to your branch
5. **Open** a Pull Request with a detailed description

### Development Standards
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Update documentation accordingly
- Maintain performance benchmarks

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Resources & References

### Audio Processing
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [FFT.js Library](https://github.com/padenot/FFT.js)
- [Tone.js Documentation](https://tonejs.org/)

### Visualization & Graphics
- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [GLSL Shader Examples](https://www.shadertoy.com/)

### Motion & Animation
- [Easing Functions](https://easings.net/)
- [Animation Principles](https://en.wikipedia.org/wiki/12_basic_principles_of_animation)
- [Physics-Based Animation](https://en.wikipedia.org/wiki/Physics_engine)

---

## 🎬 Gallery & Examples

### Sample Projects
- [Example 1: Bass Reactive Particles](docs/examples/bass-reactive.md)
- [Example 2: Frequency Spectrum Visualization](docs/examples/spectrum.md)
- [Example 3: Beat-Synced Geometry](docs/examples/beat-sync.md)

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Audio input not detected
- **Solution**: Check browser microphone permissions in settings
- **Fallback**: Upload an audio file instead

**Issue**: Low FPS or stuttering
- **Solution**: Reduce particle count in settings or close other applications
- **Check**: Verify GPU acceleration is enabled in browser settings

**Issue**: No visual response to audio
- **Solution**: Check audio file format compatibility (WAV, MP3, OGG recommended)
- **Debug**: Enable debug mode to view audio analysis values

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/RAI-SAKURAI/audio-reactive-space/issues)
- **Discussions**: [GitHub Discussions](https://github.com/RAI-SAKURAI/audio-reactive-space/discussions)
- **Email**: Contact via GitHub profile

---

## 🙏 Acknowledgments

Special thanks to:
- The Web Audio API community
- Three.js contributors
- The creative coding community
- All contributors and testers

---

**Made with 🎵 and ✨ by RAI-SAKURAI**

*Transform your audio into a visual journey.*
