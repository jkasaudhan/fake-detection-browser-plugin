// DOM elements
const apiStrategySelect = document.getElementById('apiStrategy');
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKey');
const autoCloseSelect = document.getElementById('autoClose');
const saveSettingsBtn = document.getElementById('saveSettings');
const viewHistoryBtn = document.getElementById('viewHistory');
const currentProviderSpan = document.getElementById('currentProvider');
const lastCheckSpan = document.getElementById('lastCheck');

// Initialize popup
document.addEventListener('DOMContentLoaded', loadSettings);

// Event listeners
apiStrategySelect.addEventListener('change', handleStrategyChange);
saveSettingsBtn.addEventListener('click', saveSettings);
viewHistoryBtn.addEventListener('click', viewHistory);

async function loadSettings() {
  try {
    const result = await chrome.storage.local.get([
      'apiStrategy', 
      'apiKeys', 
      'autoCloseDelay',
      'lastCheck'
    ]);
    
    // Set form values
    apiStrategySelect.value = result.apiStrategy || 'mock';
    autoCloseSelect.value = result.autoCloseDelay || '10000';
    
    // Update UI based on strategy
    handleStrategyChange();
    
    // Update status
    currentProviderSpan.textContent = getProviderName(apiStrategySelect.value);
    lastCheckSpan.textContent = result.lastCheck || 'Never';
    
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

function handleStrategyChange() {
  const strategy = apiStrategySelect.value;
  
  // Show API key section for real providers
  if (strategy !== 'mock') {
    apiKeySection.classList.remove('hidden');
    loadApiKey(strategy);
  } else {
    apiKeySection.classList.add('hidden');
  }
  
  currentProviderSpan.textContent = getProviderName(strategy);
}

async function loadApiKey(strategy) {
  try {
    const result = await chrome.storage.local.get(['apiKeys']);
    const apiKeys = result.apiKeys || {};
    apiKeyInput.value = apiKeys[strategy] || '';
  } catch (error) {
    console.error('Error loading API key:', error);
  }
}

async function saveSettings() {
  try {
    const strategy = apiStrategySelect.value;
    const autoCloseDelay = autoCloseSelect.value;
    const apiKey = apiKeyInput.value;
    
    // Save API key if provided
    const apiKeys = {};
    if (strategy !== 'mock' && apiKey) {
      apiKeys[strategy] = apiKey;
    }
    
    await chrome.storage.local.set({
      apiStrategy: strategy,
      apiKeys: apiKeys,
      autoCloseDelay: autoCloseDelay
    });
    
    showNotification('Settings saved successfully!');
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showNotification('Error saving settings', true);
  }
}

function viewHistory() {
  // This could open a new tab with history page
  chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
}

function getProviderName(strategy) {
  const providers = {
    'mock': 'Mock API (Demo)',
    'sightengine': 'Sightengine',
    'edenai': 'Eden AI'
  };
  return providers[strategy] || strategy;
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  notification.textContent = message;
  notification.style.background = isError ? '#ff6b6b' : '#51cf66';
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}