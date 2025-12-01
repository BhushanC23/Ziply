document.addEventListener('DOMContentLoaded', async () => {
    // 1. Handle URL Parameters
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('id');
    
    // UI Elements
    const contentCard = document.querySelector('.glass-panel');
    const secureHeader = document.querySelector('.text-center.mb-8');
    const burnWarning = document.getElementById('burn-warning');
    const burnBadge = document.getElementById('burn-status-badge');
    
    // Views
    const viewText = document.getElementById('view-text');
    const viewFile = document.getElementById('view-file');
    const viewLink = document.getElementById('view-link');
    
    // Hide everything initially
    if (contentCard) contentCard.classList.add('hidden');
    if (secureHeader) secureHeader.classList.add('hidden');

    // 2. Retrieve Share Data from API
    let share = null;
    let status = 'loading';

    if (shareId) {
        const result = await ZiplyAPI.getShare(shareId);
        if (result.error) {
            if (result.status === 404) status = 'expired'; // Or not found
            else if (result.status === 410) status = 'burned';
            else status = 'error';
        } else {
            share = result;
            status = 'active';
        }
    } else {
        status = 'not_found';
    }

    // 3. Render based on Status
    const mainContainer = document.querySelector('main .max-w-2xl');
    
    if (status === 'active') {
        // Show Header & Card
        if (secureHeader) secureHeader.classList.remove('hidden');
        if (contentCard) contentCard.classList.remove('hidden');

        // Update Header Info - Real Countdown & Status
        const statusContainer = secureHeader.querySelector('.flex.items-center.justify-center.gap-2');
        
        if (statusContainer) {
            // Clear existing
            statusContainer.innerHTML = '';
            
            // 1. Status Text
            const statusP = document.createElement('p');
            statusP.className = 'text-brand-muted text-sm flex items-center gap-2';
            
            // 2. Burn Badge (if needed)
            if (share.burnOnRead) {
                statusP.innerHTML = `<span class="text-brand-primary font-bold">Active</span> — 1 of 1 view remaining`;
                
                const badge = document.createElement('span');
                badge.className = 'text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide font-bold ml-2';
                badge.innerHTML = '<i class="fa-solid fa-fire mr-1"></i> Burn on read';
                statusContainer.appendChild(badge);
            } else {
                statusP.innerHTML = `<span class="text-green-400 font-bold">Active</span> — Unlimited views`;
            }
            
            statusContainer.insertBefore(statusP, statusContainer.firstChild);

            // 3. Live Timer
            const timerDiv = document.createElement('div');
            timerDiv.className = 'w-full text-center mt-2 text-xs text-brand-muted font-mono opacity-70';
            secureHeader.appendChild(timerDiv);

            const updateTimer = () => {
                const remaining = ZiplyAPI.timeRemaining(share.expiresAt);
                if (remaining === 'Expired') {
                    window.location.reload(); // Auto-reload on expiry
                } else {
                    timerDiv.innerHTML = `<i class="fa-regular fa-clock mr-1"></i> Auto-deletes in ${remaining}`;
                }
            };
            updateTimer();
            setInterval(updateTimer, 60000); // Update every minute
        }

        // Handle Burn Status
        if (share.burnOnRead) {
            if (burnWarning) burnWarning.classList.remove('hidden');
            if (burnBadge) burnBadge.classList.remove('hidden');
            
            // SHOW INTERSTITIAL instead of burning immediately
            const interstitial = document.getElementById('burn-interstitial');
            const revealBtn = document.getElementById('reveal-btn');
            
            if (interstitial && revealBtn) {
                interstitial.classList.remove('hidden');
                
                revealBtn.addEventListener('click', () => {
                    // Smooth fade out
                    interstitial.classList.add('opacity-0', 'pointer-events-none');
                    setTimeout(() => {
                        interstitial.classList.add('hidden');
                    }, 500);
                });
            }
        }

        // Render Content based on Type
        if (share.type === 'text') {
            if (viewText) {
                viewText.classList.remove('hidden');
                const textP = viewText.querySelector('p');
                if (textP) textP.textContent = share.content;
                
                // Setup Copy Button
                const copyBtn = viewText.querySelector('.copy-btn');
                if (copyBtn) {
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(share.content);
                        const originalIcon = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
                        setTimeout(() => copyBtn.innerHTML = originalIcon, 2000);
                    });
                }
            }
        } else if (share.type === 'file') {
            if (viewFile) {
                viewFile.classList.remove('hidden');
                const fileName = viewFile.querySelector('.font-medium.text-white');
                const fileSize = viewFile.querySelector('.text-sm.text-brand-muted');
                const downloadBtn = document.getElementById('download-btn');
                
                if (fileName) fileName.textContent = share.file.name;
                if (fileSize) fileSize.textContent = ZiplyAPI.formatBytes(share.file.size) + ' • Uploaded ' + ZiplyAPI.timeAgo(share.createdAt);

                if (downloadBtn) {
                    downloadBtn.addEventListener('click', async () => {
                        // Fetch Download URL
                        try {
                            downloadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Preparing...';
                            const data = await ZiplyAPI.getDownloadUrl(shareId);
                            
                            if (data.downloadUrl) {
                                window.location.href = data.downloadUrl;
                                downloadBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Download Started';
                            } else {
                                alert('Download failed');
                                downloadBtn.innerHTML = '<i class="fa-solid fa-download mr-2"></i> Download File';
                            }
                        } catch (e) {
                            console.error(e);
                            alert('Download error');
                            downloadBtn.innerHTML = '<i class="fa-solid fa-download mr-2"></i> Download File';
                        }
                    });
                }
            }
        } else if (share.type === 'link') {
            if (viewLink) {
                viewLink.classList.remove('hidden');
                const linkInput = viewLink.querySelector('input');
                const openBtn = document.getElementById('open-link-btn');
                
                if (linkInput) linkInput.value = share.content;
                if (openBtn) {
                    let url = share.content;
                    // Safety check: Ensure protocol exists
                    if (!/^https?:\/\//i.test(url)) {
                        url = 'https://' + url;
                    }
                    openBtn.href = url;
                    openBtn.target = '_blank';
                }
            }
        }

    } else {
        // Show Error / Expired State
        if (mainContainer) {
            let title = 'Link Expired';
            let message = 'This link has expired or has been deleted.';
            let icon = 'fa-hourglass-end';

            if (status === 'burned') {
                title = 'Link Burned';
                message = 'This link was set to burn on read and has already been viewed.';
                icon = 'fa-fire';
            } else if (status === 'not_found') {
                title = 'Not Found';
                message = 'The link you are looking for does not exist.';
                icon = 'fa-search';
            }

            mainContainer.innerHTML = `
                <div class="text-center py-20">
                    <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                        <i class="fa-solid ${icon} text-4xl text-brand-muted"></i>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-4">${title}</h1>
                    <p class="text-brand-muted mb-8 max-w-md mx-auto">${message}</p>
                    <a href="index.html" class="inline-flex items-center justify-center px-8 py-3 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-brand-primary/20">
                        Create New Link
                    </a>
                </div>
            `;
        }
    }

    // Copy Button Logic
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const originalIcon = btn.innerHTML;
            const textToCopy = btn.parentElement.querySelector('p').textContent;
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                btn.innerHTML = '<i class="fa-solid fa-check text-green-400"></i>';
                btn.classList.add('bg-green-500/10');
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
                    btn.classList.remove('bg-green-500/10');
                }, 2000);
            });
        });
    });

    // --- Search Modal Logic ---
    const searchBtn = document.getElementById('nav-search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchBackdrop = document.getElementById('search-backdrop');
    const searchInput = document.getElementById('search-input');
    const searchSubmit = document.getElementById('search-submit');
    const searchError = document.getElementById('search-error');

    function openSearch() {
        if (searchModal) {
            searchModal.classList.remove('hidden');
            if (searchInput) searchInput.focus();
        }
    }

    function closeSearch() {
        if (searchModal) {
            searchModal.classList.add('hidden');
            if (searchError) searchError.classList.add('hidden');
            if (searchInput) searchInput.value = '';
        }
    }

    function handleSearch() {
        if (searchInput) {
            const code = searchInput.value.trim().toUpperCase();
            // Simple validation: 6 chars
            if (code.length === 6) {
                window.location.href = `view.html?id=${code}`;
            } else {
                if (searchError) searchError.classList.remove('hidden');
            }
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', openSearch);
    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
    if (searchSubmit) searchSubmit.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});
