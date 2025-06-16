// Theme toggle
const lightToggle = document.getElementById('light-toggle');
const darkToggle = document.getElementById('dark-toggle');
const html = document.documentElement;

// Check for saved user preference or use system preference
if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
    lightToggle.classList.remove('hidden');
    darkToggle.classList.add('hidden');
} else {
    html.classList.remove('dark');
    lightToggle.classList.add('hidden');
    darkToggle.classList.remove('hidden');
}

lightToggle.addEventListener('click', () => {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    lightToggle.classList.add('hidden');
    darkToggle.classList.remove('hidden');
});

darkToggle.addEventListener('click', () => {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    lightToggle.classList.remove('hidden');
    darkToggle.classList.add('hidden');
});

// JS Encode/Decode functionality
const jsInput = document.getElementById('js-input');
const jsOutput = document.getElementById('js-output');
const encodeBtn = document.getElementById('encode-btn');
const decodeBtn = document.getElementById('decode-btn');
const testBtn = document.getElementById('test-btn');
const clearInputBtn = document.getElementById('clear-input');
const copyOutputBtn = document.getElementById('copy-output');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Password modal elements
const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('password-input');
const submitPasswordBtn = document.getElementById('submit-password');
const getPasswordBtn = document.getElementById('get-password');
const cancelPasswordBtn = document.getElementById('cancel-password');

// Correct password
const CORRECT_PASSWORD = "JSdecodeByFred2208";
        
// Check if password is already saved
if (localStorage.getItem('jsDecoderPassword') === CORRECT_PASSWORD) {
    passwordInput.value = CORRECT_PASSWORD;
}

// Encode JavaScript code
encodeBtn.addEventListener('click', () => {
    try {
        const code = jsInput.value.trim();
        if (!code) {
            showError('Please enter JavaScript code to encode');
            return;
        }
        
        // Encode the JavaScript code
        const encoded = encodeJS(code);
        jsOutput.value = encoded;
        errorMessage.classList.add('hidden');
    } catch (error) {
        showError('Error encoding JavaScript: ' + error.message);
    }
});

// Decode JavaScript code - now with password protection
decodeBtn.addEventListener('click', () => {
    const savedPassword = localStorage.getItem('jsDecoderPassword');
    
    if (savedPassword === CORRECT_PASSWORD) {
        performDecode();
    } else {
        passwordModal.classList.remove('hidden');
        passwordInput.focus();
    }
});

// Perform the actual decoding
function performDecode() {
    try {
        const code = jsInput.value.trim();
        if (!code) {
            showError('Please enter encoded JavaScript to decode');
            return;
        }
        
        // Decode the JavaScript code
        const decoded = decodeJS(code);
        jsOutput.value = decoded;
        errorMessage.classList.add('hidden');
        passwordModal.classList.add('hidden');
    } catch (error) {
        showError('Error decoding JavaScript: ' + error.message);
    }
}

// Password modal actions
submitPasswordBtn.addEventListener('click', () => {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === CORRECT_PASSWORD) {
        localStorage.setItem('jsDecoderPassword', enteredPassword);
        performDecode();
    } else {
        showError('Incorrect password. Please try again or get the premium password.');
        passwordInput.focus();
    }
});

getPasswordBtn.addEventListener('click', () => {
    const whatsappUrl = `https://wa.me/6285212244077?text=${encodeURIComponent("Saya ingin membuka Decode JS code")}`;
    window.open(whatsappUrl, '_blank');
});

cancelPasswordBtn.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
});

// Test in console
testBtn.addEventListener('click', () => {
    try {
        const code = jsOutput.value.trim();
        if (!code) {
            showError('No code to test. Please encode/decode first.');
            return;
        }
        
        // Try to evaluate the code
        const decoded = jsOutput.value.includes('decodeURIComponent') ? 
            decodeJS(jsOutput.value) : 
            jsOutput.value;
        
        // Create a function from the code
        const testFn = new Function(decoded);
        
        // Execute in try-catch
        try {
            testFn();
            console.log('Code executed successfully in console');
            showError('Code executed successfully in console', false);
        } catch (e) {
            console.error('Error executing code:', e);
            showError('Error executing code in console: ' + e.message);
        }
    } catch (error) {
        showError('Error testing JavaScript: ' + error.message);
    }
});

// Clear input
clearInputBtn.addEventListener('click', () => {
    jsInput.value = '';
    jsOutput.value = '';
    errorMessage.classList.add('hidden');
});

// Copy output
copyOutputBtn.addEventListener('click', () => {
    if (jsOutput.value) {
        navigator.clipboard.writeText(jsOutput.value)
            .then(() => {
                const originalText = copyOutputBtn.innerHTML;
                copyOutputBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyOutputBtn.innerHTML = originalText;
                }, 2000);
            });
    }
});

// Helper functions
function showError(message, isError = true) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    
    if (isError) {
        errorMessage.classList.remove('bg-green-100', 'text-green-700', 'dark:bg-green-900/20', 'dark:text-green-300');
        errorMessage.classList.add('bg-red-100', 'text-red-700', 'dark:bg-red-900/20', 'dark:text-red-300');
    } else {
        errorMessage.classList.remove('bg-red-100', 'text-red-700', 'dark:bg-red-900/20', 'dark:text-red-300');
        errorMessage.classList.add('bg-green-100', 'text-green-700', 'dark:bg-green-900/20', 'dark:text-green-300');
    }
}

function encodeJS(code) {
    // Kompres kode terlebih dahulu
    const compressed = code
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Encode dengan format self-executing
    const encoded = btoa(unescape(encodeURIComponent(compressed)));
    return `(function(){
        try {
            var decoded = decodeURIComponent(escape(atob('${encoded}')));
            var script = document.createElement('script');
            script.textContent = decoded;
            document.head.appendChild(script).remove();
        } catch(e) {
            console.error('Decoding error:', e);
        }
    })();`;
}

function decodeJS(encoded) {
    // Check if it's our encoded format
    if (encoded.startsWith('eval(decodeURIComponent(escape(atob(')) {
        const base64Start = encoded.indexOf("'") + 1;
        const base64End = encoded.lastIndexOf("'");
        const base64 = encoded.substring(base64Start, base64End);
        return decodeURIComponent(escape(atob(base64)));
    }
    
    // If not our format, try to decode as base64 directly
    try {
        return decodeURIComponent(escape(atob(encoded)));
    } catch (e) {
        // If that fails, maybe it's already decoded
        return encoded;
    }
}

// Example code for first-time users
document.addEventListener('DOMContentLoaded', () => {
    const exampleCode = `// Example JavaScript code
function greet(name) {
    console.log('Hello, ' + name + '!');
}

greet('World');`;
    
    if (!jsInput.value) {
        jsInput.value = exampleCode;
    }
});