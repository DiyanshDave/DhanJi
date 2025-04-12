// Voice Recognition
let recognition;
let isListening = false;
let timerInterval;
let timerSeconds = 0;
const maxRecordingTime = 10; // seconds

// Check for voice recognition support
function checkVoiceSupport() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
      isListening = true;
      voiceWave.classList.remove('hidden');
      voiceInstruction.textContent = 'Listening... Speak now';
      startVoiceTimer();
      animateVoiceWave();
    };
    
    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
    };
    
    recognition.onerror = function(event) {
      console.error('Voice recognition error', event.error);
      stopVoiceRecognition();
      voiceInstruction.textContent = 'Error occurred. Try again.';
      setTimeout(() => {
        voiceInstruction.textContent = 'Press and hold the button below to speak';
      }, 2000);
    };
    
    recognition.onend = function() {
      stopVoiceRecognition();
    };
  } else {
    voiceAssistantBtn.disabled = true;
    voiceAssistantBtn.title = 'Voice recognition not supported in your browser';
  }
}

// Start voice recognition
function startVoiceRecognition(e) {
  e.preventDefault();
  if (!recognition || isListening) return;
  
  recognition.start();
  holdToSpeakText.textContent = 'Listening...';
  voiceTimer.classList.remove('hidden');
}

// Stop voice recognition
function stopVoiceRecognition() {
  if (!isListening) return;
  
  recognition.stop();
  isListening = false;
  voiceWave.classList.add('hidden');
  clearInterval(timerInterval);
  timerSeconds = 0;
  voiceTimerProgress.style.width = '0%';
  voiceTimer.classList.add('hidden');
  holdToSpeakText.textContent = 'Hold to Speak';
  
  // Stop all voice wave animations
  document.querySelectorAll('.voice-wave').forEach(wave => {
    wave.style.animation = 'none';
  });
}

// Start voice timer
function startVoiceTimer() {
  timerSeconds = 0;
  timerInterval = setInterval(() => {
    timerSeconds++;
    const percentage = (timerSeconds / maxRecordingTime) * 100;
    voiceTimerProgress.style.width = `${percentage}%`;
    
    if (timerSeconds >= maxRecordingTime) {
      stopVoiceRecognition();
      voiceInstruction.textContent = 'Maximum recording time reached';
      setTimeout(() => {
        voiceInstruction.textContent = 'Press and hold the button below to speak';
      }, 2000);
    }
  }, 1000);
}

// Animate voice wave
function animateVoiceWave() {
  const waves = document.querySelectorAll('.voice-wave');
  waves.forEach((wave, index) => {
    // Reset animation
    wave.style.animation = 'none';
    wave.offsetHeight; // Trigger reflow
    wave.style.animation = `wave ${Math.random() * 0.5 + 0.5}s ease infinite alternate ${index * 0.1}s`;
  });
}

// Process voice command
function processVoiceCommand(transcript) {
  voiceTranscript.textContent = transcript;
  voiceResult.classList.remove('hidden');
  
  // Simple NLP for demo purposes
  // In a real app, you would use a more sophisticated NLP solution
  const amountMatch = transcript.match(/(\d+)/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null;
  
  let category = 'other';
  let type = 'expense';
  
  if (transcript.toLowerCase().includes('income') || 
      transcript.toLowerCase().includes('salary') || 
      transcript.toLowerCase().includes('earn')) {
    type = 'income';
  } else if (transcript.toLowerCase().includes('save') || 
            transcript.toLowerCase().includes('savings')) {
    type = 'saving';
  } else if (transcript.toLowerCase().includes('withdraw')) {
    type = 'withdraw';
  }
  
  if (transcript.toLowerCase().includes('food') || 
      transcript.toLowerCase().includes('dinner') || 
      transcript.toLowerCase().includes('lunch') || 
      transcript.toLowerCase().includes('breakfast')) {
    category = 'food';
  } else if (transcript.toLowerCase().includes('transport') || 
            transcript.toLowerCase().includes('taxi') || 
            transcript.toLowerCase().includes('uber') || 
            transcript.toLowerCase().includes('bus')) {
    category = 'transport';
  } else if (transcript.toLowerCase().includes('shopping') || 
            transcript.toLowerCase().includes('buy') || 
            transcript.toLowerCase().includes('purchase')) {
    category = 'shopping';
  } else if (transcript.toLowerCase().includes('bill') || 
            transcript.toLowerCase().includes('electricity') || 
            transcript.toLowerCase().includes('water') || 
            transcript.toLowerCase().includes('rent')) {
    category = 'bills';
  } else if (transcript.toLowerCase().includes('movie') || 
            transcript.toLowerCase().includes('entertain') || 
            transcript.toLowerCase().includes('game')) {
    category = 'entertainment';
  } else if (transcript.toLowerCase().includes('health') || 
            transcript.toLowerCase().includes('doctor') || 
            transcript.toLowerCase().includes('hospital')) {
    category = 'health';
  }
  
  if (amount) {
    voiceAmount.textContent = `₹${amount.toLocaleString('en-IN')}`;
    voiceCategory.textContent = formatCategory(category);
    voiceType.textContent = type;
    voiceConfirmation.classList.remove('hidden');
  } else {
    voiceInstruction.textContent = 'Could not detect amount. Please try again.';
    setTimeout(() => {
      voiceInstruction.textContent = 'Press and hold the button below to speak';
    }, 2000);
  }
}

// Setup voice assistant event listeners
function setupVoiceListeners() {
  // Voice assistant button
  voiceAssistantBtn.addEventListener('click', function() {
    voiceAssistantModal.classList.remove('opacity-0', 'pointer-events-none');
    voicePulse.classList.add('voice-pulse');
  });
  
  // Close voice modal
  closeVoiceModal.addEventListener('click', function() {
    voiceAssistantModal.classList.add('opacity-0', 'pointer-events-none');
    voicePulse.classList.remove('voice-pulse');
    stopVoiceRecognition();
  });
  
  // Hold to speak button
  holdToSpeak.addEventListener('mousedown', startVoiceRecognition);
  holdToSpeak.addEventListener('touchstart', startVoiceRecognition);
  holdToSpeak.addEventListener('mouseup', stopVoiceRecognition);
  holdToSpeak.addEventListener('touchend', stopVoiceRecognition);
  holdToSpeak.addEventListener('mouseleave', stopVoiceRecognition);
  
  // Confirm voice transaction
  confirmVoiceTransaction.addEventListener('click', function() {
    const amount = parseFloat(voiceAmount.textContent.replace('₹', '').replace(/,/g, ''));
    const category = voiceCategory.textContent.toLowerCase();
    const type = voiceType.textContent.toLowerCase();
    
    if (isNaN(amount)) {
      showNotification('error', 'Invalid Transaction', 'Could not process voice transaction');
      return;
    }
    
    const transaction = {
      id: Date.now(),
      type,
      amount,
      category,
      date: new Date().toISOString().split('T')[0],
      description: 'Added via voice command'
    };
    
    // Process transaction based on type
    if (type === 'expense') {
      if (amount > financialData.balance) {
        showNotification('error', 'Insufficient Funds', 'You don\'t have enough balance for this expense');
        return;
      }
      financialData.balance -= amount;
    } else if (type === 'income') {
      financialData.balance += amount;
    } else if (type === 'saving') {
      if (amount > financialData.balance) {
        showNotification('error', 'Insufficient Funds', 'You don\'t have enough balance to save');
        return;
      }
      financialData.balance -= amount;
      financialData.savings += amount;
    } else if (type === 'withdraw') {
      if (amount > financialData.savings) {
        showNotification('error', 'Insufficient Savings', 'You don\'t have enough savings to withdraw');
        return;
      }
      financialData.savings -= amount;
      financialData.balance += amount;
    }
    
    financialData.transactions.unshift(transaction);
    
    // Reset voice UI
    voiceResult.classList.add('hidden');
    voiceConfirmation.classList.add('hidden');
    voiceInstruction.textContent = 'Press and hold the button below to speak';
    
    // Update UI
    updateDashboard();
    renderTransactions();
    updateCharts();
    
    showNotification('success', 'Voice Transaction Added', `${type.charAt(0).toUpperCase() + type.slice(1)} of ₹${amount} recorded`);
  });
  
  // Cancel voice transaction
  cancelVoiceTransaction.addEventListener('click', function() {
    voiceResult.classList.add('hidden');
    voiceConfirmation.classList.add('hidden');
    voiceInstruction.textContent = 'Press and hold the button below to speak';
  });
}