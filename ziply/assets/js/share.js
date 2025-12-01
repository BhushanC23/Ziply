document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    // Validation Elements
    const generateBtn = document.getElementById('generateLinkBtn');
    const textInput = document.getElementById('text-input');
    const fileInput = document.getElementById('file-input');
    const linkInput = document.getElementById('link-input');
    
    let currentMode = 'text'; // Default mode

    function validateInput() {
        let isValid = false;

        if (currentMode === 'text') {
            isValid = textInput && textInput.value.trim().length > 0;
        } else if (currentMode === 'file') {
            isValid = fileInput && fileInput.files.length > 0;
        } else if (currentMode === 'link') {
            // Allow simple domain format (e.g., google.com) or full URL
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
            isValid = linkInput && linkInput.value.trim().length > 0; // Basic check, let backend/browser handle strict validation
        }

        if (generateBtn) {
            generateBtn.disabled = !isValid;
        }
    }

    // Input Event Listeners for Validation
    if (textInput) textInput.addEventListener('input', validateInput);
    if (linkInput) linkInput.addEventListener('input', validateInput);

    // File Upload Preview Logic
    const fileDropzone = document.getElementById('file-dropzone');
    const filePreview = document.getElementById('file-preview-container');
    const fileNameDisplay = document.getElementById('file-name');
    const fileSizeDisplay = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const changeFileBtn = document.getElementById('change-file-btn');

    // Burn Toggle Logic
    const burnToggle = document.getElementById('burn-toggle');
    const burnSwitch = document.getElementById('burn-switch');
    const burnKnob = document.getElementById('burn-knob');
    let isBurnActive = false;

    if (burnToggle) {
        burnToggle.addEventListener('click', () => {
            isBurnActive = !isBurnActive;
            if (isBurnActive) {
                burnSwitch.classList.remove('bg-white/10', 'border-white/10');
                burnSwitch.classList.add('bg-brand-primary', 'border-brand-primary');
                burnKnob.classList.add('translate-x-4');
                burnToggle.setAttribute('aria-checked', 'true'); // Update ARIA
            } else {
                burnSwitch.classList.add('bg-white/10', 'border-white/10');
                burnSwitch.classList.remove('bg-brand-primary', 'border-brand-primary');
                burnKnob.classList.remove('translate-x-4');
                burnToggle.setAttribute('aria-checked', 'false'); // Update ARIA
            }
        });
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateFileView() {
        if (fileInput && fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            if (fileNameDisplay) fileNameDisplay.textContent = file.name;
            if (fileSizeDisplay) fileSizeDisplay.textContent = formatFileSize(file.size);
            
            if (fileDropzone) fileDropzone.classList.add('hidden');
            if (filePreview) filePreview.classList.remove('hidden');
        } else {
            if (fileDropzone) fileDropzone.classList.remove('hidden');
            if (filePreview) filePreview.classList.add('hidden');
        }
        validateInput();
    }

    if (fileInput) {
        fileInput.addEventListener('change', updateFileView);
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            if (fileInput) fileInput.value = ''; // Clear input
            updateFileView();
        });
    }

    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }

    // Initial validation
    validateInput();

    function switchTab(mode) {
        currentMode = mode;
        const targetTab = document.querySelector(`.tab-btn[data-tab="${mode}"]`);
        if (targetTab) {
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('active', 'bg-white/10', 'text-white');
                t.classList.add('text-brand-muted');
            });
            
            // Add active class to target tab
            targetTab.classList.add('active', 'bg-white/10', 'text-white');
            targetTab.classList.remove('text-brand-muted');

            // Hide all contents
            contents.forEach(c => c.classList.add('hidden'));
            
            // Show target content
            const targetId = `tab-${mode}`;
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
            
            validateInput();
        }
    }

    // Handle URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode && ['text', 'file', 'link'].includes(mode)) {
        switchTab(mode);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // Expiry Chips
    const chips = document.querySelectorAll('.expiry-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => {
                c.classList.remove('active', 'bg-brand-primary/10', 'border-brand-primary/50', 'text-brand-primary');
                c.classList.add('border-white/10', 'text-brand-muted');
            });
            chip.classList.add('active', 'bg-brand-primary/10', 'border-brand-primary/50', 'text-brand-primary');
            chip.classList.remove('border-white/10', 'text-brand-muted');
        });
    });

    // Generate Button
    // generateBtn is already defined at the top
    const inputSection = document.getElementById('input-section');
    const loadingSection = document.getElementById('loading-section');
    const outputSection = document.getElementById('output-section');
    const createNewBtn = document.getElementById('createNewBtn');
    const burnBadge = document.getElementById('burn-badge');
    const linkOutput = document.querySelector('#output-section input[readonly]');

    // Toast Elements
    const undoToast = document.getElementById('undo-toast');
    const undoBtn = document.getElementById('undo-btn');
    const closeToastBtn = document.getElementById('close-toast-btn');
    let toastTimeout;

    function showToast() {
        if (!undoToast) return;
        clearTimeout(toastTimeout);
        undoToast.classList.remove('translate-y-24', 'opacity-0');
        toastTimeout = setTimeout(hideToast, 6000);
    }

    function hideToast() {
        if (!undoToast) return;
        undoToast.classList.add('translate-y-24', 'opacity-0');
    }

    generateBtn.addEventListener('click', () => {
        hideToast(); // Ensure toast is gone if generating new link
        
        // 1. Hide Input
        inputSection.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            inputSection.classList.add('hidden');
            
            // 2. Show Loading
            loadingSection.classList.remove('hidden');
            // Small delay to allow display:block to apply before opacity transition
            setTimeout(() => {
                loadingSection.classList.remove('opacity-0');
            }, 50);

            // 3. Call Backend API
            setTimeout(async () => {
                try {
                    // 1. Determine Expiry
                    const activeExpiryChip = document.querySelector('.expiry-chip.active');
                    let duration = '1d'; // Default
                    if (activeExpiryChip) {
                        const text = activeExpiryChip.innerText.toLowerCase();
                        if (text.includes('10 minutes')) duration = '10m';
                        else if (text.includes('1 hour')) duration = '1h';
                        else if (text.includes('7 days')) duration = '7d';
                    }

                    // 2. Get Content
                    let content = '';
                    if (currentMode === 'text') {
                        content = textInput.value;
                    } else if (currentMode === 'file') {
                        content = fileInput.files[0];
                    } else if (currentMode === 'link') {
                        content = linkInput.value.trim();
                        // Auto-prepend https:// if missing
                        if (!/^https?:\/\//i.test(content)) {
                            content = 'https://' + content;
                        }
                    }

                    const newShare = await ZiplyAPI.createShare({
                        type: currentMode,
                        content: content,
                        duration: duration,
                        burnOnRead: isBurnActive
                    });

                    // 4. Update UI with Real ID
                    const shareId = newShare.shortId;
                    
                    // Hide Loading
                    loadingSection.classList.add('opacity-0');
                    setTimeout(() => {
                        loadingSection.classList.add('hidden');

                        // Robust URL generation for local/hosted
                        const baseUrl = window.location.href.replace('share.html', '').split('?')[0];
                        const shareUrl = baseUrl + 'view.html?id=' + shareId;
                        const manageUrl = baseUrl + 'share.html?id=' + shareId + '&owner=' + newShare.ownerKey;
                        
                        // Generate QR Code
                        const qrContainer = document.getElementById('qrcode-container');
                        if (qrContainer) {
                            qrContainer.innerHTML = ''; // Clear previous
                            new QRCode(qrContainer, {
                                text: shareUrl,
                                width: 128,
                                height: 128,
                                colorDark : "#000000",
                                colorLight : "#ffffff",
                                correctLevel : QRCode.CorrectLevel.H
                            });
                        }

                        // Update Link Input
                        if (linkOutput) {
                            linkOutput.value = shareUrl;
                        }

                        // Update Management Link
                        const manageLinkOutput = document.getElementById('manage-link-output');
                        if (manageLinkOutput) {
                            manageLinkOutput.value = manageUrl;
                        }

                        // Update Code Display
                        const codeDisplay = document.querySelector('.text-xl.font-bold.text-white.tracking-widest.font-mono');
                        if (codeDisplay) {
                            codeDisplay.textContent = shareId;
                        }

                        // Update Output based on Burn State
                        if (burnBadge) {
                            if (isBurnActive) {
                                burnBadge.classList.remove('hidden');
                            } else {
                                burnBadge.classList.add('hidden');
                            }
                        }
                        
                        // Show Output
                        outputSection.classList.remove('hidden');
                        setTimeout(() => {
                            outputSection.classList.remove('opacity-0', 'scale-95');
                        }, 50);
                    }, 300);

                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to create share: ' + error.message);
                    // Reset UI
                    loadingSection.classList.add('hidden');
                    inputSection.classList.remove('hidden');
                    inputSection.classList.remove('opacity-0', 'scale-95');
                }
            }, 500); // Small delay for UX
        }, 300);
    });

    // Create New Share Button
    if (createNewBtn) {
        createNewBtn.addEventListener('click', () => {
            // Hide Output
            outputSection.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                outputSection.classList.add('hidden');
                
                // Show Input
                inputSection.classList.remove('hidden');
                setTimeout(() => {
                    inputSection.classList.remove('opacity-0', 'scale-95');
                }, 50);
            }, 300);
            
            showToast();
        });
    }

    // Undo Action
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            hideToast();
            
            // Reverse: Hide Input, Show Output
            inputSection.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                inputSection.classList.add('hidden');
                
                outputSection.classList.remove('hidden');
                setTimeout(() => {
                    outputSection.classList.remove('opacity-0', 'scale-95');
                }, 50);
            }, 300);
        });
    }

    if (closeToastBtn) {
        closeToastBtn.addEventListener('click', hideToast);
    }

    // Copy Buttons
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            let textToCopy = '';
            
            // Determine what to copy based on sibling element
            const siblingInput = btn.previousElementSibling;
            const siblingSpan = btn.previousElementSibling; // For code copy, it might be a span inside a div
            
            if (siblingInput && siblingInput.tagName === 'INPUT') {
                textToCopy = siblingInput.value;
            } else if (siblingSpan && siblingSpan.tagName === 'SPAN') {
                 textToCopy = siblingSpan.textContent;
            } else {
                // Fallback for Code Copy structure: div > span + button
                const parentDiv = btn.parentElement;
                const codeSpan = parentDiv.querySelector('span');
                if (codeSpan) {
                    textToCopy = codeSpan.textContent;
                }
            }

            if (textToCopy) {
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    
                    // Visual Feedback
                    const originalIcon = btn.innerHTML;
                    btn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
                    setTimeout(() => {
                        btn.innerHTML = originalIcon;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy to clipboard');
                }
            }
        });
    });
});
