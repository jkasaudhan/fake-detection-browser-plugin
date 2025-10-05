// API Configuration with multiple providers
const APIStrategies = {
  sightengine: {
    name: 'Sightengine',
    endpoint: 'https://api.sightengine.com/1.0/check.json',
    method: 'GET',
    processResponse: (data) => ({
      score: data.type?.ai_generated || 0,
      confidence: Math.abs(50 - (data.type?.ai_generated || 0)) * 2,
      isReal: (data.type?.ai_generated || 0) < 50
    })
  },
  edenai: {
    name: 'Eden AI',
    endpoint: 'https://api.edenai.run/v2/image/face_detection',
    method: 'POST',
    headers: (apiKey) => ({ 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }),
    body: (url) => ({ 
      providers: 'microsoft', 
      file_url: url 
    }),
    processResponse: (data) => ({
      score: data.microsoft?.face_detection?.confidence || 0,
      confidence: (data.microsoft?.face_detection?.confidence || 0) * 100,
      isReal: (data.microsoft?.face_detection?.confidence || 0) > 0.7
    })
  },
  mock: {
    name: 'Mock API',
    method: 'MOCK',
    processResponse: (data) => ({
      score: data.score || 25,
      confidence: data.confidence || 85,
      isReal: data.isReal !== undefined ? data.isReal : true
    })
  }
};

// Current active strategy
let activeStrategy = 'mock'; // Start with mock for development

// Create context menu items
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check-deepfake-image",
    title: "Check if image is real",
    contexts: ["image"]
  });
  chrome.contextMenus.create({
    id: "check-deepfake-video", 
    title: "Check if video is real",
    contexts: ["video"]
  });
  
  // Initialize settings
  chrome.storage.local.set({ 
    apiStrategy: 'mock',
    apiKeys: {}
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId.includes('check-deepfake')) {
    try {
      // Get settings from storage
      const result = await chrome.storage.local.get(['apiStrategy', 'apiKeys']);
      const strategy = result.apiStrategy || 'mock';
      
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: "checkMedia",
        mediaUrl: info.srcUrl,
        mediaType: info.mediaType,
        strategy: strategy
      });
    } catch (error) {
      console.error('Error in context menu click:', error);
    }
  }
});

// Handle API calls from content script (for CORS)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "callDetectionAPI") {
    handleAPICall(request.mediaUrl, request.strategy)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleAPICall(mediaUrl, strategy) {
  const strategyConfig = APIStrategies[strategy];
  
  if (!strategyConfig) {
    throw new Error(`Unknown API strategy: ${strategy}`);
  }

  // Mock API simulation
  if (strategy === 'mock') {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          score: Math.floor(Math.random() * 30), // 0-30 for real, 70-100 for fake
          confidence: 85 + Math.floor(Math.random() * 15), // 85-99%
          isReal: Math.random() > 0.3, // 70% chance real
          provider: 'mock'
        });
      }, 2000 + Math.random() * 3000); // 2-5 second delay
    });
  }

  // Real API calls would go here
  // const apiKeys = await chrome.storage.local.get(['apiKeys']);
  // const response = await fetch(...);
  // return strategyConfig.processResponse(await response.json());
  
  throw new Error(`Real API integration for ${strategy} not implemented`);
}