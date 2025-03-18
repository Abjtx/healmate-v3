// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const urgentWarning = document.getElementById('urgent-warning');
    const chatContainer = document.getElementById('chat-container');
    
    // Function to add a message to the chat
    function addMessage(message, isUser = false, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'} ${isError ? 'error-message' : ''}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        scrollToBottom();
    }
    
    // Function to scroll chat to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to handle user input
    async function handleUserInput() {
        const message = userInput.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        
        // Clear input field
        userInput.value = '';
        
        // On mobile, blur the input to hide keyboard
        if (window.innerWidth <= 768) {
            userInput.blur();
        }
        
        try {
            // Show loading indicator
            const loadingMessage = 'Analyzing your symptoms...';
            addMessage(loadingMessage, false);
            
            // Send message to Flask backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });
            
            // Remove loading message
            chatMessages.removeChild(chatMessages.lastChild);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response from server');
            }
            
            const data = await response.json();
            
            // Process the response
            if (data.error) {
                addMessage(`Error: ${data.error}`, false, true);
                return;
            }
            
            // Display the bot's response
            addMessage(data.reply, false);
            
            // Handle urgent symptoms warning
            if (data.urgencyCheck && data.urgencyCheck.isUrgent) {
                let warningText = '<strong>⚠️ Urgent symptoms detected!</strong> ';
                if (data.urgencyCheck.urgentSymptoms && data.urgencyCheck.urgentSymptoms.length > 0) {
                    warningText += `You mentioned: <span class="urgent-symptom">${data.urgencyCheck.urgentSymptoms.join(', ')}</span>. `;
                }
                warningText += 'Please seek immediate medical attention or call emergency services.';
                urgentWarning.innerHTML = warningText;
                urgentWarning.style.display = 'block';
            } else {
                urgentWarning.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Show error message
            addMessage(`Error: ${error.message}`, false, true);
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', handleUserInput);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });
    
    // Mobile optimization - prevent zooming when input is focused
    userInput.addEventListener('focus', () => {
        // On mobile, scroll to make sure the input is visible
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                window.scrollTo(0, document.body.scrollHeight);
            }, 300);
        }
    });
    
    // Handle window resize to maintain proper scrolling
    window.addEventListener('resize', () => {
        scrollToBottom();
    });
    
    // Handle orientation change for mobile devices
    window.addEventListener('orientationchange', () => {
        setTimeout(scrollToBottom, 300);
    });
    
    // Detect mobile devices and apply specific behaviors
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
    
    // Focus input on page load for desktop
    if (!isMobile) {
        userInput.focus();
    }
}); 