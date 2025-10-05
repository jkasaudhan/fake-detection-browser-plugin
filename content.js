// Media element tracking
const mediaElements = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "checkMedia") {
    handleMediaCheck(request.mediaUrl, request.mediaType, request.strategy);
  }
});

async function handleMediaCheck(mediaUrl, mediaType, strategy) {
  const mediaElement = findMediaElementByUrl(mediaUrl);
  if (!mediaElement) {
    console.warn('Media element not found for URL:', mediaUrl);
    return;
  }

  const elementId = 'media-' + Date.now();
  mediaElements.set(elementId, mediaElement);
  
  // Show progress bar
  showProgressBar(mediaElement, elementId);
  
  try {
    // Call background script for API request (handles CORS)
    const response = await chrome.runtime.sendMessage({
      action: "callDetectionAPI",
      mediaUrl: mediaUrl,
      strategy: strategy
    });
    
    if (response.success) {
      updateUIWithResult(mediaElement, elementId, response.data);
    } else {
      showError(mediaElement, elementId, response.error);
    }
  } catch (error) {
    showError(mediaElement, elementId, error.message);
  }
}

function findMediaElementByUrl(url) {
  // Find image by URL
  const images = Array.from(document.getElementsByTagName('img'));
  let mediaElement = images.find(img => img.src === url);
  
  // If not found, try videos
  if (!mediaElement) {
    const videos = Array.from(document.getElementsByTagName('video'));
    mediaElement = videos.find(video => video.src === url || video.currentSrc === url);
  }
  
  return mediaElement;
}

function showProgressBar(mediaElement, elementId) {
  // Remove existing progress bar if any
  const existingProgress = mediaElement.parentNode.querySelector('.deepfake-progress-bar');
  if (existingProgress) {
    existingProgress.remove();
  }

  const progressBar = document.createElement('div');
  progressBar.className = 'deepfake-progress-bar';
  progressBar.id = `progress-${elementId}`;
  progressBar.innerHTML = `
    <div class="progress-container">
      <div class="progress-label">🔍 Analyzing for AI manipulation...</div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <div class="progress-time">This may take a few seconds</div>
    </div>
  `;
  
  // Insert after the media element
  mediaElement.parentNode.insertBefore(progressBar, mediaElement.nextSibling);
}

function updateUIWithResult(mediaElement, elementId, resultData) {
  // Remove progress bar
  const progressBar = document.getElementById(`progress-${elementId}`);
  if (progressBar) {
    progressBar.remove();
  }

  // Remove existing result if any
  const existingResult = mediaElement.parentNode.querySelector('.deepfake-result');
  if (existingResult) {
    existingResult.remove();
  }

  const resultDiv = document.createElement('div');
  resultDiv.className = 'deepfake-result';
  resultDiv.id = `result-${elementId}`;
  
  const confidence = resultData.confidence || 0;
  const isReal = resultData.isReal;
  
  resultDiv.innerHTML = `
    <div class="result-card ${isReal ? 'real' : 'fake'}">
      <div class="result-header">
        <div class="result-icon">${isReal ? '✅' : '⚠️'}</div>
        <h3 class="result-title">${isReal ? 'Likely Real Content' : 'Potential AI Manipulation'}</h3>
      </div>
      <div class="confidence-section">
        <div class="confidence-bar">
          <div class="confidence-fill ${isReal ? 'real' : 'fake'}" 
               style="width: ${confidence}%"></div>
        </div>
        <div class="confidence-text">Confidence: ${confidence}%</div>
      </div>
      <div class="result-details">
        <span class="provider">Provider: ${resultData.provider || 'Mock API'}</span>
        <span class="score">AI Score: ${resultData.score || 'N/A'}</span>
      </div>
    </div>
  `;
  
  mediaElement.parentNode.insertBefore(resultDiv, mediaElement.nextSibling);
  
  // Auto-remove result after 10 seconds
  setTimeout(() => {
    if (resultDiv.parentNode) {
      resultDiv.remove();
    }
  }, 10000);
}

function showError(mediaElement, elementId, errorMessage) {
  const progressBar = document.getElementById(`progress-${elementId}`);
  if (progressBar) {
    progressBar.remove();
  }

  const errorDiv = document.createElement('div');
  errorDiv.className = 'deepfake-result error';
  errorDiv.innerHTML = `
    <div class="result-card error">
      <div class="result-header">
        <div class="result-icon">❌</div>
        <h3 class="result-title">Analysis Failed</h3>
      </div>
      <p class="error-message">${errorMessage || 'Unable to analyze media'}</p>
    </div>
  `;
  
  mediaElement.parentNode.insertBefore(errorDiv, mediaElement.nextSibling);
}