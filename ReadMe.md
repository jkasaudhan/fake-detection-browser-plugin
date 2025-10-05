# Fake Detector Browser Extension

A powerful browser extension that allows users to detect AI-manipulated images and videos directly from any webpage using right-click context menu integration.

## 🌟 Features

- **Right-Click Detection**: Right-click on any image or video to check for AI manipulation
- **Multiple API Support**: Configurable support for various deepfake detection providers
- **Elegant UI**: Beautiful progress bars and result displays with confidence percentages
- **Mock API**: Built-in mock API for testing without real API keys
- **Cross-Platform**: Works on all websites with images and videos
- **Settings Management**: Easy configuration through popup interface
- **Modern Web Support**: Handles WebP images, responsive images, lazy loading, and srcset attributes

## 🚀 Quick Start

### Installation

1. **Download or clone the extension files**
   ```
   deepfake-detector-extension/
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── content.css
   ├── popup.html
   ├── popup.css
   ├── popup.js
   └── icons/
       ├── icon-16.png
       ├── icon-48.png
       └── icon-128.png
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the extension folder
   - The extension should now appear in your toolbar

3. **Start using:**
   - Browse to any website (e.g., BBC News)
   - Right-click on any image or video
   - Select "Check if image/video is real"
   - Wait for analysis (2-5 seconds with mock API)
   - View results with confidence percentage

## ⚙️ Configuration

### Using the Mock API (Default)

The extension comes pre-configured with a mock API that:
- Simulates real API calls with 2-5 second delays
- Returns realistic results (85-99% confidence)
- 70% chance of "Real" detection for testing
- Requires no API keys or internet connection for testing

### Configuring Real APIs

1. **Click the extension icon** in the toolbar
2. **Select your preferred API provider:**
   - **Sightengine**: Image and video detection
   - **Eden AI**: Multiple provider integration
3. **Enter your API key** (if required)
4. **Click "Save Settings"**

### Supported API Providers

| Provider | Type | Free Tier | Setup Required |
|----------|------|-----------|----------------|
| Mock API | Demo | Unlimited | None |
| Sightengine | Image/Video | Limited | API Key |
| Eden AI | Image Focus | Free Credits | API Key |

## 🛠️ For Developers

### Project Structure

```
src/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for UI injection
├── content.css           # Styling for progress/result UI
├── popup.html            # Settings interface
├── popup.css             # Popup styling
├── popup.js              # Popup functionality
└── icons/                # Extension icons
```

### Key Files Overview

#### `manifest.json`
- Extension metadata and permissions
- Content script injection rules
- API host permissions

#### `background.js`
- Context menu creation and management
- API strategy configuration
- Cross-origin request handling

#### `content.js`
- DOM manipulation for UI elements
- Progress bar and result display
- Advanced media element detection with WebP and responsive image support

#### `popup.js`
- Settings management
- API key storage
- User preferences

### Advanced Media Detection

The extension includes robust media detection that handles:

- **WebP images** and modern formats
- **Responsive images** with `srcset` attributes
- **Lazy loading** with `data-src` attributes
- **Multiple image sizes** and quality variants
- **Video source elements** and currentSrc

#### Media Detection Function

```javascript
function robustFindMediaElementByUrl(url) {
  // Handles multiple scenarios:
  // 1. Exact URL matches in src attribute
  // 2. srcset attributes with multiple sizes
  // 3. data-src for lazy loading
  // 4. currentSrc for responsive images
  // 5. Similar filename matching as fallback
}
```

### Adding New API Providers

1. **Extend the API Strategies** in `background.js`:

```javascript
const APIStrategies = {
  your_new_provider: {
    name: 'Your Provider',
    endpoint: 'https://api.example.com/detect',
    method: 'POST',
    headers: (apiKey) => ({ 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (url) => ({ 
      image_url: url,
      model: 'deepfake-v2'
    }),
    processResponse: (data) => ({
      score: data.manipulation_score || 0,
      confidence: data.confidence * 100 || 0,
      isReal: !data.is_fake
    })
  }
};
```

2. **Update the popup menu** in `popup.html`:

```html
<option value="your_new_provider">Your New Provider</option>
```

3. **Add host permissions** in `manifest.json`:

```json
"host_permissions": [
  "https://api.example.com/*"
]
```

### Customizing the UI

#### Modifying Progress Bars
Edit `content.css`:
```css
.deepfake-progress-bar {
  /* Customize container */
  background: your-color;
  border-radius: your-radius;
}

.progress-fill {
  /* Customize animation */
  background: your-gradient;
  animation: your-animation;
}
```

#### Changing Result Displays
Update the result template in `content.js`:
```javascript
resultDiv.innerHTML = `
  <div class="result-card ${isReal ? 'real' : 'fake'}">
    <!-- Your custom HTML here -->
  </div>
`;
```

### Environment Variables

For production use, consider adding API key management:

```javascript
// In background.js
const API_KEYS = {
  sightengine: process.env.SIGHTENGINE_API_KEY,
  edenai: process.env.EDENAI_API_KEY
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Context menu not appearing:**
   - Reload the extension in `chrome://extensions/`
   - Check console for errors (F12 → Console)

2. **API calls failing:**
   - Verify API keys in extension popup
   - Check network tab for CORS issues
   - Ensure host permissions include API domains

3. **UI not displaying on pages:**
   - Verify content scripts are injected (F12 → Elements)
   - Check for CSS conflicts with the website
   - Ensure media elements are properly detected (check console logs)

4. **Extension not loading:**
   - Verify `manifest.json` is valid JSON
   - Check all required files are present
   - Ensure icons are proper PNG format

5. **Images not detected on modern websites:**
   - The extension now supports WebP and responsive images
   - Check if images use `srcset` or lazy loading
   - Verify the URL matching is working (check console logs)

### Debugging

1. **Open Developer Tools:**
   - Right-click extension icon → "Inspect popup"
   - Use F12 for webpage debugging

2. **Check Background Script:**
   - Go to `chrome://extensions/`
   - Find extension → Click "Service worker"

3. **View Storage:**
   - F12 → Application → Storage → Local Storage

4. **Media Detection Debugging:**
   - Check console for "Could not find media element" warnings
   - Review available images on page in console logs

## 📋 API Response Format

Your custom API should return data in this format:

```javascript
{
  score: 25,           // 0-100, lower = more real
  confidence: 85,      // 0-100, detection confidence
  isReal: true,        // boolean result
  provider: "api_name" // optional identifier
}
```

## 🚀 Deployment

### Chrome Web Store
1. Package extension as ZIP file
2. Create developer account at [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
3. Upload ZIP and submit for review

### Firefox Add-ons
1. Modify manifest for Firefox compatibility
2. Submit to [Firefox Add-ons](https://addons.mozilla.org)

### Enterprise Deployment
Use group policy or MDM solutions for organizational deployment.

## 📄 License

This project is open source. Please check individual API provider terms of service for commercial usage.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Areas for Contribution
- Additional API provider integrations
- Enhanced video analysis capabilities
- Improved media detection algorithms
- Additional browser compatibility
- Performance optimizations

## 📞 Support

For issues and questions:
1. Check troubleshooting section above
2. Review browser console for errors
3. Verify API provider status
4. Test with mock API first
5. Check media detection debugging logs

## 🔄 Version History

- **v1.0.0** - Initial release with mock API and basic detection
- **v1.1.0** - Enhanced media detection with WebP and responsive image support
- **Future** - Real API integration, video analysis, batch processing

---

**Note**: This extension is for educational and research purposes. Always verify critical information through multiple sources and official channels.

## 🔍 Technical Details

### Media Detection Algorithm

The extension uses a multi-stage approach to find media elements:

1. **Exact URL Matching**: Direct comparison with src, currentSrc, and data-src attributes
2. **Srcset Parsing**: Handles responsive images with multiple size variants
3. **Filename Matching**: Fallback to filename comparison when exact URLs differ
4. **Pattern Matching**: URL segment matching for similar images from CDNs
5. **Lazy Loading Support**: Checks common lazy-loading attributes

### Supported Image Formats
- JPEG, PNG, GIF, WebP
- Responsive images with srcset
- Lazy-loaded images with data attributes
- Modern framework-generated images (React, Vue, etc.)

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Edge 88+
- Firefox (with Manifest V2 compatibility)
- Opera 74+

---

**Happy detecting!** 🕵️‍♂️