'use strict';

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PORTFOLIO SCRIPT INITIALIZATION ===');

    initializeSidebar();
    initializeTestimonials();
    initializePortfolio();
    initializeZoomModal();
    initializeFormValidation();
    initializeCertModal();
    initializeTestimonialPdfViewer();
    initializeScrollIndicators();
    initializeInteractiveScroll();


    if (document.getElementById('pdfModal')) {
        setupPdfModalClose();
    }

    if (document.querySelector('.cert-modal')) {
        setupCertModalClose();
    }

    console.log('=== ALL COMPONENTS INITIALIZED ===');
});

function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function getPdfViewerUrl(pdfUrl) {
    return pdfUrl + '#view=FitH&scrollbar=1&toolbar=1&navpanes=1';
}

function initializeSidebar() {
    const sidebar = document.querySelector("[data-sidebar]");
    const sidebarBtn = document.querySelector("[data-sidebar-btn]");

    if (sidebarBtn && sidebar) {
        sidebarBtn.addEventListener("click", function() {
            sidebar.classList.toggle("active");

            const iconElement = this.querySelector("i.fas");
            if (iconElement) {
                if (iconElement.classList.contains("fa-chevron-down")) {
                    iconElement.classList.replace("fa-chevron-down", "fa-chevron-up");
                } else {
                    iconElement.classList.replace("fa-chevron-up", "fa-chevron-down");
                }
            }
        });
    }
}

function initializeInteractiveScroll() {
    console.log('=== INITIALIZING INTERACTIVE SCROLL ===');

    const scrollContainers = document.querySelectorAll('.testimonials-list, .cert-list');

    scrollContainers.forEach(container => {
        // Add touch hint element for mobile
        if (window.innerWidth <= 768) {
            addMobileTouchHint(container);
        }

        // Add scroll reveal on interaction
        setupScrollReveal(container);

        // Add scroll indicator arrows
        addScrollArrows(container);
    });

    function addMobileTouchHint(container) {
        const hint = document.createElement('div');
        hint.className = 'scroll-mobile-hint';
        hint.innerHTML = '<i class="fas fa-arrows-left-right" style="margin-right: 6px; color: var(--golden-sand);"></i> <span style="color: var(--light-gray70); display: inline; font-weight: 300; font-size: 0.8em;">Touch to scroll</span>';

        // Position hint
        container.parentNode.style.position = 'relative';
        container.parentNode.appendChild(hint);

        // Hide hint when scrolling starts
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            hint.style.opacity = '0';
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!container.classList.contains('scroll-revealed')) {
                    hint.style.opacity = '0.7';
                }
            }, 3000);
        });
    }

    function setupScrollReveal(container) {
        let revealTimeout;
        let isRevealed = false;

        // Reveal scrollbar on hover
        container.addEventListener('mouseenter', () => {
            if (!isRevealed) {
                container.classList.add('scroll-revealed');
                isRevealed = true;
            }
            clearTimeout(revealTimeout);
        });

        // Hide scrollbar after delay
        container.addEventListener('mouseleave', () => {
            revealTimeout = setTimeout(() => {
                container.classList.remove('scroll-revealed');
                isRevealed = false;
            }, 1000);
        });

        // Touch devices: reveal on touch start
        container.addEventListener('touchstart', () => {
            container.classList.add('scroll-revealed');
            isRevealed = true;
            clearTimeout(revealTimeout);
        });

        // Keep revealed while touching
        container.addEventListener('touchmove', () => {
            clearTimeout(revealTimeout);
        });

        // Hide after touch ends
        container.addEventListener('touchend', () => {
            revealTimeout = setTimeout(() => {
                container.classList.remove('scroll-revealed');
                isRevealed = false;
            }, 1500);
        });

        // Also hide on scroll end
        let scrollEndTimeout;
        container.addEventListener('scroll', () => {
            container.classList.add('scroll-revealed');
            isRevealed = true;
            clearTimeout(scrollEndTimeout);
            scrollEndTimeout = setTimeout(() => {
                if (!container.matches(':hover') && !container.matches(':active')) {
                    container.classList.remove('scroll-revealed');
                    isRevealed = false;
                }
            }, 2000);
        });
    }

    function addScrollArrows(container) {
        const arrows = document.createElement('div');
        arrows.className = 'scroll-indicator-arrows';
        arrows.innerHTML = `
            <i class="fas fa-chevron-left" style="color: var(--golden-sand);"></i>
            <i class="fas fa-chevron-right" style="color: var(--golden-sand);"></i>
        `;

        container.parentNode.appendChild(arrows);

        // Update arrow visibility based on scroll position
        const updateArrows = () => {
            const leftArrow = arrows.querySelector('.fa-chevron-left');
            const rightArrow = arrows.querySelector('.fa-chevron-right');

            // Show left arrow if not at start
            if (container.scrollLeft > 10) {
                leftArrow.style.opacity = '1';
            } else {
                leftArrow.style.opacity = '0.3';
            }

            // Show right arrow if not at end
            if (container.scrollLeft + container.clientWidth < container.scrollWidth - 10) {
                rightArrow.style.opacity = '1';
            } else {
                rightArrow.style.opacity = '0.3';
            }
        };

        container.addEventListener('scroll', updateArrows);
        updateArrows(); // Initial update
    }

    // Add touch target for easier scrolling on mobile
    function addTouchScrollTarget(container) {
        if (window.innerWidth <= 768) {
            const touchTarget = document.createElement('div');
            touchTarget.className = 'scroll-touch-hint';
            touchTarget.setAttribute('aria-label', 'Scroll horizontally');

            // Insert before the container
            container.parentNode.insertBefore(touchTarget, container);

            // When touch target is active, reveal scrollbar
            touchTarget.addEventListener('touchstart', (e) => {
                e.preventDefault();
                container.classList.add('scroll-revealed');

                // Simulate scroll on touch target drag
                let startX = e.touches[0].clientX;
                let scrollLeft = container.scrollLeft;

                const handleTouchMove = (e) => {
                    const deltaX = e.touches[0].clientX - startX;
                    container.scrollLeft = scrollLeft - deltaX * 2;
                };

                const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);

                    // Keep scrollbar visible for a moment
                    setTimeout(() => {
                        if (!container.matches(':hover') && !container.matches(':active')) {
                            container.classList.remove('scroll-revealed');
                        }
                    }, 1000);
                };

                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
            });
        }
    }

    // Initialize for each container
    scrollContainers.forEach(addTouchScrollTarget);

    console.log('=== INTERACTIVE SCROLL INITIALIZED ===');
}

function initializeScrollIndicators() {
    console.log('=== INITIALIZING SCROLL INDICATORS ===');

    // Function to check if element is scrollable
    function isScrollable(element) {
        return element.scrollWidth > element.clientWidth;
    }

    // Function to check if scrolled to end
    function isScrolledToEnd(element) {
        return element.scrollLeft + element.clientWidth >= element.scrollWidth - 5;
    }

    // Function to check if scrolled to start
    function isScrolledToStart(element) {
        return element.scrollLeft <= 5;
    }

    // Function to update scroll indicators
    function updateScrollIndicators(element) {
        if (!isScrollable(element)) {
            element.classList.remove('scrollable');
            element.classList.remove('scrolled-to-end');
            element.classList.remove('scrolled-to-start');
            return;
        }

        element.classList.add('scrollable');

        if (isScrolledToEnd(element)) {
            element.classList.add('scrolled-to-end');
            element.classList.remove('scrolled-to-start');
        } else if (isScrolledToStart(element)) {
            element.classList.add('scrolled-to-start');
            element.classList.remove('scrolled-to-end');
        } else {
            element.classList.remove('scrolled-to-end');
            element.classList.remove('scrolled-to-start');
        }
    }

    // Initialize testimonials scroll indicators
    const testimonialsList = document.querySelector('.testimonials-list');
    if (testimonialsList) {
        // Check on load
        setTimeout(() => updateScrollIndicators(testimonialsList), 100);

        // Check on resize
        window.addEventListener('resize', () => updateScrollIndicators(testimonialsList));

        // Check on scroll
        testimonialsList.addEventListener('scroll', () => updateScrollIndicators(testimonialsList));
    }

    // Initialize certificates scroll indicators
    const certList = document.querySelector('.cert-list');
    if (certList) {
        // Check on load
        setTimeout(() => updateScrollIndicators(certList), 100);

        // Check on resize
        window.addEventListener('resize', () => updateScrollIndicators(certList));

        // Check on scroll
        certList.addEventListener('scroll', () => updateScrollIndicators(certList));
    }

    // Add touch/swipe hints for mobile
    function addSwipeHint() {
        if (window.innerWidth <= 768) {
            // Check if we need to show hints
            const needsHints = testimonialsList && isScrollable(testimonialsList) ||
                               certList && isScrollable(certList);

            if (needsHints) {
                // Show initial hint message
                showScrollHintMessage();
            }
        }
    }

    function showScrollHintMessage() {
        // Create hint message
        const hintMessage = document.createElement('div');
        hintMessage.className = 'scroll-hint-message';
        hintMessage.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--onyx);
            color: var(--orange-yellow-crayola);
            padding: 12px 20px;
            border-radius: 12px;
            font-size: var(--fs6);
            z-index: 1000;
            box-shadow: var(--shadow4);
            border: 1px solid var(--jet);
            animation: fadeInOut 3s ease-in-out;
            pointer-events: none;
            text-align: center;
            max-width: 90%;
            white-space: nowrap;
        `;
        hintMessage.innerHTML = '<i class="fas fa-arrows-left-right" style="margin-right: 8px;"></i> Swipe to see more';
        document.body.appendChild(hintMessage);

        // Remove after animation
        setTimeout(() => {
            if (hintMessage.parentNode) {
                hintMessage.parentNode.removeChild(hintMessage);
            }
        }, 3000);
    }

    // Add fadeInOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            15% { opacity: 1; transform: translateX(-50%) translateY(0); }
            85% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }

        /* iOS specific scrollbar styling */
        @supports (-webkit-touch-callout: none) {
            .has-scrollbar {
                -webkit-overflow-scrolling: touch;
            }

            .has-scrollbar::-webkit-scrollbar {
                -webkit-appearance: none;
                height: 7px;
            }

            .has-scrollbar::-webkit-scrollbar-thumb {
                background-color: var(--orange-yellow-crayola);
                border-radius: 10px;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize on page load
    window.addEventListener('load', addSwipeHint);

    console.log('=== SCROLL INDICATORS INITIALIZED ===');
}

function initializeTestimonials() {
    console.log('=== INITIALIZING TESTIMONIALS ===');

    const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
    const modalContainer = document.querySelector('[data-modal-container]');
    const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
    const overlay = document.querySelector('[data-overlay]');
    const modalImg = document.querySelector('[data-modal-img]');
    const modalTitle = document.querySelector('[data-modal-title]');
    const modalText = document.querySelector('[data-modal-text]');
    const modalDate = document.querySelector('[data-modal-date]');
    const pdfButton = document.getElementById('testimonialPdfButton');

    if (!testimonialsItem.length || !modalContainer) {
        console.log('No testimonials or modal container found');
        return;
    }

    console.log(`Found ${testimonialsItem.length} testimonials`);

    let scrollY = 0;
    let escHandler = null;

    // Function to close modal and restore scroll
    const closeTestimonialModal = function(e) {
        console.log('Closing testimonial modal');

        if (e) {
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }

        // Close modal
        modalContainer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');

        // Remove escape key handler
        if (escHandler) {
            document.removeEventListener('keydown', escHandler);
            escHandler = null;
        }

        // CRITICAL: Restore body scrolling
        document.body.style.overflow = 'auto';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.classList.remove('modal-open');

        // Restore scroll position
        if (scrollY !== 0) {
            console.log(`Restoring scroll position to: ${scrollY}`);
            window.scrollTo(0, scrollY);
            scrollY = 0;
        }

        // Remove read more button if exists
        const readMoreBtn = document.querySelector('.read-more-btn');
        if (readMoreBtn) {
            console.log('Removing read more button');
            readMoreBtn.remove();
        }

        // Blur any focused element
        if (document.activeElement) {
            document.activeElement.blur();
        }

        // Recreate close button for next time
        setTimeout(createFreshCloseButton, 10);

        return false;
    };

    // Function to create a fresh close button (iOS fix)
    function createFreshCloseButton() {
        console.log('Creating fresh close button');

        // Remove existing close button if any
        const existingCloseBtn = document.querySelector('[data-modal-close-btn]');
        if (existingCloseBtn && existingCloseBtn.parentNode) {
            existingCloseBtn.parentNode.removeChild(existingCloseBtn);
        }

        // Create new button
        const newCloseBtn = document.createElement('button');
        newCloseBtn.className = 'modal-close-btn';
        newCloseBtn.setAttribute('data-modal-close-btn', '');
        newCloseBtn.innerHTML = '<i class="fas fa-xmark"></i>';

        // Add iOS-friendly attributes and styles
        newCloseBtn.style.cssText = `
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            tap-highlight-color: transparent;
            min-width: 44px;
            min-height: 44px;
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--onyx);
            border-radius: 8px;
            width: 32px;
            height: 32px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--white2);
            font-size: 18px;
            opacity: 0.7;
            border: none;
            z-index: 1000;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
            transform: translateZ(0);
            -webkit-transform: translateZ(0);
        `;

        // Add accessibility attributes
        newCloseBtn.setAttribute('aria-label', 'Close modal');
        newCloseBtn.setAttribute('role', 'button');
        newCloseBtn.setAttribute('tabindex', '0');

        // Unified event handler
        const handleClose = function(e) {
            console.log('Close button clicked/touched');
            if (e.cancelable) e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            closeTestimonialModal(e);
        };

        // Add multiple event listeners for maximum compatibility
        const events = ['click', 'touchend', 'pointerup'];
        events.forEach(eventType => {
            newCloseBtn.addEventListener(eventType, handleClose, {
                capture: true,
                passive: false
            });
        });

        // Prevent touchstart from bubbling
        newCloseBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: false });

        // Add keyboard support
        newCloseBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeTestimonialModal(e);
            }
        });

        // Add to modal
        const modalContent = document.querySelector('.testimonials-modal');
        if (modalContent) {
            modalContent.appendChild(newCloseBtn);
            console.log('Close button added to modal');
        } else {
            console.error('Could not find testimonials-modal element');
        }

        return newCloseBtn;
    }

    // Function to open modal
    const openTestimonialModal = function() {
        console.log('Opening testimonial modal');

        modalContainer.classList.add('active');
        if (overlay) overlay.classList.add('active');

        // Add escape key handler
        escHandler = function(e) {
            if (e.key === 'Escape') {
                closeTestimonialModal(e);
            }
        };
        document.addEventListener('keydown', escHandler);
    };

    // Function to truncate text
    function truncateText(text, maxLength = 500) {
        if (text.length <= maxLength) return { text: text, isTruncated: false };

        const lastSpaceIndex = text.lastIndexOf(' ', maxLength);
        const truncatedText = text.substring(0, lastSpaceIndex) + '...';
        return { text: truncatedText, isTruncated: true, fullText: text };
    }

    // Function to create read more button
    function createReadMoreButton(fullText, modalTextElement) {
        console.log('Creating read more button');

        const readMoreBtn = document.createElement('button');
        readMoreBtn.className = 'read-more-btn';
        readMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Read More';
        readMoreBtn.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 10px;
            padding: 5px 10px;
            background: var(--onyx);
            color: var(--orange-yellow-crayola);
            border: 1px solid var(--orange-yellow-crayola);
            border-radius: 6px;
            font-size: var(--fs7);
            cursor: pointer;
            transition: var(--transition1);
            -webkit-tap-highlight-color: transparent;
            tap-highlight-color: transparent;
            min-width: 44px;
            min-height: 44px;
        `;

        let isExpanded = false;
        readMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (!isExpanded) {
                modalTextElement.textContent = fullText;
                this.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
                isExpanded = true;
            } else {
                const truncated = truncateText(fullText, 500);
                modalTextElement.textContent = truncated.text;
                this.innerHTML = '<i class="fas fa-chevron-down"></i> Read More';
                isExpanded = false;
            }
        });

        return readMoreBtn;
    }

    // Set up testimonials click handlers
    for (let i = 0; i < testimonialsItem.length; i++) {
        testimonialsItem[i].addEventListener('click', function() {
            console.log(`Testimonial ${i + 1} clicked`);

            const testimonialItem = this.closest('.testimonials-item');
            const pdfUrl = testimonialItem.getAttribute('data-pdf-url');

            // Save current scroll position BEFORE opening modal
            scrollY = window.pageYOffset || document.documentElement.scrollTop;
            console.log(`Saving scroll position: ${scrollY}`);

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.classList.add('modal-open');

            // Set modal content
            if (modalImg && modalTitle && modalText) {
                const avatarImg = this.querySelector('[data-testimonials-avatar]');
                if (avatarImg) {
                    modalImg.src = avatarImg.src;
                    modalImg.alt = avatarImg.alt;
                }

                const titleEl = this.querySelector('[data-testimonials-title]');
                if (titleEl) {
                    modalTitle.innerHTML = titleEl.innerHTML;
                }

                const textEl = this.querySelector('[data-testimonials-text]');
                if (textEl) {
                    const fullText = textEl.textContent;
                    const truncated = truncateText(fullText, 360);
                    modalText.textContent = truncated.text;

                    // Remove existing read more button
                    const existingBtn = document.querySelector('.read-more-btn');
                    if (existingBtn) existingBtn.remove();

                    // Add new read more button if needed
                    if (truncated.isTruncated) {
                        const readMoreBtn = createReadMoreButton(truncated.fullText, modalText);
                        modalText.parentNode.insertBefore(readMoreBtn, modalText.nextSibling);
                    }
                }
            }

            // Set date
            const testimonialDate = testimonialItem.getAttribute('data-testimonial-date');
            if (testimonialDate && modalDate) {
                try {
                    const date = new Date(testimonialDate);
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    modalDate.innerHTML = date.toLocaleDateString('en-US', options);
                    modalDate.setAttribute('datetime', testimonialDate);
                } catch (e) {
                    console.error('Error parsing date:', e);
                    modalDate.innerHTML = testimonialDate;
                }
            }

            // Set PDF button
            if (pdfButton) {
                if (pdfUrl) {
                    pdfButton.setAttribute('data-pdf-url', pdfUrl);
                    pdfButton.classList.remove('hidden');
                } else {
                    pdfButton.classList.add('hidden');
                }
            }

            // Open modal
            openTestimonialModal();
        });
    }

    // Set up overlay click handler
    if (overlay) {
        overlay.addEventListener('click', closeTestimonialModal);
        overlay.addEventListener('touchend', function(e) {
            if (e.target === overlay) {
                e.preventDefault();
                closeTestimonialModal(e);
            }
        }, { passive: false });
    }

    // Initial close button creation
    createFreshCloseButton();

    console.log('=== TESTIMONIALS INITIALIZED ===');
}

function initializeTestimonialPdfViewer() {
    const pdfButton = document.getElementById('testimonialPdfButton');

    if (!pdfButton) return;

    pdfButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const pdfUrl = this.getAttribute('data-pdf-url');
        if (pdfUrl) {
            openPdf(pdfUrl, true);
        }
    });
}

function createPdfModal() {
    const pdfModal = document.createElement('div');
    pdfModal.id = 'pdfModal';
    pdfModal.className = 'pdf-modal';
    pdfModal.style.display = 'none';
    pdfModal.innerHTML = `
        <span class="close-pdf-modal">&times;</span>
        <div class="pdf-modal-content">
            <div class="pdf-pdf-container">
                <iframe id="pdfViewerFrame" width="100%" height="100%" frameborder="0"
                        allow="autoplay" style="border: none;"></iframe>
            </div>
            <div class="pdf-fallback-message" style="display: none; text-align: center; padding: 20px; color: var(--light-gray);">
                <p>If the PDF doesn't display properly, you can <a href="#" class="pdf-download-link" style="color: var(--orange-yellow-crayola);">download it here</a>.</p>
            </div>
        </div>
    `;
    document.body.appendChild(pdfModal);

    const downloadLink = pdfModal.querySelector('.pdf-download-link');
    if (downloadLink) {
        downloadLink.addEventListener('click', function(e) {
            e.preventDefault();
            const iframe = document.getElementById('pdfViewerFrame');
            if (iframe && iframe.src) {
                window.open(iframe.src.replace('/viewer?url=', '').split('&embedded')[0], '_blank');
            }
        });
    }
}

function setupPdfModalClose() {
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = pdfModal ? pdfModal.querySelector('.close-pdf-modal') : null;
    const pdfViewerFrame = document.getElementById('pdfViewerFrame');

    if (!pdfModal) return;

    const closePdfModalFunc = function() {
        pdfModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        if (pdfViewerFrame) {
            pdfViewerFrame.src = '';
        }

        if (pdfModal.escHandler) {
            document.removeEventListener('keydown', pdfModal.escHandler);
            delete pdfModal.escHandler;
        }
    };

    if (closePdfModal) {
        closePdfModal.addEventListener('click', closePdfModalFunc);
    }

    pdfModal.addEventListener('click', function(e) {
        if (e.target === pdfModal) {
            closePdfModalFunc();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && pdfModal.style.display === 'block') {
            closePdfModalFunc();
        }
    });
}

function initializePortfolio() {
    const select = document.querySelector('[data-select]');
    const selectItems = document.querySelectorAll('[data-select-item]');
    const selectValue = document.querySelector('[data-select-value]');
    const filterBtn = document.querySelectorAll('[data-filter-btn]');
    const selectIcon = document.querySelector('.select-icon i');

    if (!select) return;

    select.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle("active");

        if (selectIcon) {
            if (this.classList.contains("active")) {
                selectIcon.classList.remove("fa-chevron-down");
                selectIcon.classList.add("fa-chevron-up");
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            } else {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");
                const selectedItem = document.querySelector('.select-item button.active');
                if (selectedItem && selectedItem.textContent !== "All") {
                    selectIcon.style.color = "var(--orange-yellow-crayola)";
                } else {
                    selectIcon.style.color = "";
                }
            }
        }
    });

    document.addEventListener('click', function (e) {
        if (!select.contains(e.target)) {
            select.classList.remove("active");
            if (selectIcon) {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");

                const selectedItem = document.querySelector('.select-item button.active');
                if (selectedItem && selectedItem.textContent !== "All") {
                    selectIcon.style.color = "var(--orange-yellow-crayola)";
                } else {
                    selectIcon.style.color = "";
                }
            }
        }
    });

    for(let i = 0; i < selectItems.length; i++) {
        selectItems[i].addEventListener('click', function(e) {
            e.stopPropagation();

            let selectedValue = this.innerText.toLowerCase();
            let displayValue = this.innerText;

            if (selectValue) {
                selectValue.textContent = displayValue;
            }

            // Remove active class from all items
            selectItems.forEach(item => {
                item.classList.remove('active');
            });

            this.classList.add('active');

            if (selectIcon) {
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            }

            select.classList.remove("active");
            if (selectIcon) {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");
            }

            filterFunc(selectedValue);
        });
    }

    const filterItems = document.querySelectorAll('[data-filter-item]');

    const filterFunc = function (selectedValue) {
        for(let i = 0; i < filterItems.length; i++) {
            if(selectedValue === "all") {
                filterItems[i].classList.add('active');
            } else if (selectedValue === filterItems[i].dataset.category) {
                filterItems[i].classList.add('active');
            } else {
                filterItems[i].classList.remove('active');
            }
        }
    }

    let lastClickedBtn = filterBtn[0];

    for (let i = 0; i < filterBtn.length; i++) {
        filterBtn[i].addEventListener('click', function() {
            let selectedValue = this.innerText.toLowerCase();

            if (selectValue) {
                selectValue.textContent = this.innerText;
            }

            selectItems.forEach((item, index) => {
                if (item.textContent.toLowerCase() === selectedValue) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            if (selectIcon) {
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            }

            filterFunc(selectedValue);

            lastClickedBtn.classList.remove('active');
            this.classList.add('active');
            lastClickedBtn = this;
        });
    }

    function updateChevronColor() {
        if (selectIcon) {
            const activeItem = document.querySelector('.select-item button.active');
            if (activeItem && activeItem.textContent !== "All") {
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            } else {
                selectIcon.style.color = "";
            }
        }
    }

    updateChevronColor();
}

function initializeZoomModal() {
    const zoomModal = document.getElementById('zoomModal');
    const zoomedImage = document.getElementById('zoomedImage');
    const closeZoomModal = document.querySelector('.close-zoom-modal');
    const zoomButtons = document.querySelectorAll('[data-zoom-btn]');
    const projectImages = document.querySelectorAll('[data-project-img]');

    if (!zoomModal) return;

    const openZoomModal = function (imageSrc, imageAlt) {
        zoomedImage.src = imageSrc;
        zoomedImage.alt = imageAlt;
        zoomModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    const closeZoomModalFunc = function () {
        zoomModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    if (zoomButtons.length > 0) {
        zoomButtons.forEach((zoomBtn, index) => {
            zoomBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const projectImg = projectImages[index];
                const imgSrc = projectImg.src;
                const imgAlt = projectImg.alt;

                openZoomModal(imgSrc, imgAlt);
            });
        });
    }

    if (projectImages.length > 0) {
        projectImages.forEach((projectImg, index) => {
            projectImg.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const imgSrc = this.src;
                const imgAlt = this.alt;

                openZoomModal(imgSrc, imgAlt);
            });
        });
    }

    if (closeZoomModal) {
        closeZoomModal.addEventListener('click', closeZoomModalFunc);
    }

    if (zoomModal) {
        zoomModal.addEventListener('click', function (e) {
            if (e.target === zoomModal) {
                closeZoomModalFunc();
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && zoomModal && zoomModal.style.display === 'block') {
            closeZoomModalFunc();
        }
    });
}

function initializeFormValidation() {
    const form = document.querySelector('[data-form]');
    const formBtn = document.querySelector('[data-form-btn]');

    if (form && formBtn) {
        const formInputs = form.querySelectorAll('input, textarea');

        formInputs.forEach(input => {
            input.addEventListener('input', function () {
                if (form.checkValidity()) {
                    formBtn.removeAttribute('disabled');
                } else {
                    formBtn.setAttribute('disabled', '');
                }
            });
        });

        if (form.checkValidity()) {
            formBtn.removeAttribute('disabled');
        } else {
            formBtn.setAttribute('disabled', '');
        }
    }
}

function initializeCertModal() {
    let certModal = document.querySelector('.cert-modal');

    if (!certModal) {
        certModal = document.createElement('div');
        certModal.className = 'cert-modal';
        certModal.style.display = 'none';
        certModal.innerHTML = `
            <span class="close-cert-modal">&times;</span>
            <div class="cert-modal-content">
                <div class="cert-pdf-container">
                    <iframe id="certPdfFrame" width="100%" height="100%" frameborder="0"
                            allow="autoplay" style="border: none;"></iframe>
                </div>
                <div class="pdf-fallback-message" style="display: none; text-align: center; padding: 20px; color: var(--light-gray);">
                    <p>If the PDF doesn't display properly, you can <a href="#" class="cert-download-link" style="color: var(--orange-yellow-crayola);">download it here</a>.</p>
                </div>
            </div>
        `;
        document.body.appendChild(certModal);

        setupCertModalClose();

        const downloadLink = certModal.querySelector('.cert-download-link');
        if (downloadLink) {
            downloadLink.addEventListener('click', function(e) {
                e.preventDefault();
                const iframe = document.getElementById('certPdfFrame');
                if (iframe && iframe.src) {
                    window.open(iframe.src.replace('/viewer?url=', '').split('&embedded')[0], '_blank');
                }
            });
        }
    }

    const certLinks = document.querySelectorAll('.cert-link');

    certLinks.forEach(certLink => {
    certLink.addEventListener('click', function (e) {
        e.preventDefault();
        const pdfUrl = this.getAttribute('href');

        if (pdfUrl && pdfUrl.toLowerCase().endsWith('.pdf')) {
            openPdf(pdfUrl);
        } else {
            window.open(pdfUrl, '_blank');
        }
    });
});
}

function openPdf(pdfUrl, isFromTestimonial = false) {
    if (isIOS() || isSafari()) {
        window.open(pdfUrl, '_blank');
        return;
    }

    let pdfModal = document.getElementById('pdfModal');
    if (!pdfModal) {
        createPdfModal();
        pdfModal = document.getElementById('pdfModal');
        setupPdfModalClose();
    }

    const pdfViewerFrame = document.getElementById('pdfViewerFrame');

    const directUrl = pdfUrl + '#view=FitH&scrollbar=1&toolbar=1&navpanes=1';
    pdfViewerFrame.src = directUrl;

    pdfModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    if (isFromTestimonial) {
        const modalContainer = document.querySelector('[data-modal-container]');
        const overlay = document.querySelector('[data-overlay]');
        if (modalContainer && modalContainer.classList.contains('active')) {
            modalContainer.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closePdfModal();
        }
    };
    document.addEventListener('keydown', escHandler);
    pdfModal.escHandler = escHandler;
}

function setupCertModalClose() {
    const certModal = document.querySelector('.cert-modal');
    const closeCertModal = certModal ? certModal.querySelector('.close-cert-modal') : null;
    const certPdfFrame = document.getElementById('certPdfFrame');

    if (!certModal) return;

    const closeCertModalFunc = function() {
        certModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        if (certPdfFrame) {
            certPdfFrame.src = '';
        }
    };

    if (closeCertModal) {
        closeCertModal.addEventListener('click', closeCertModalFunc);
    }

    certModal.addEventListener('click', function(e) {
        if (e.target === certModal) {
            closeCertModalFunc();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certModal.style.display === 'block') {
            closeCertModalFunc();
        }
    });
}