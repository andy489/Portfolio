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

function initializeTestimonials() {
    const testimonialsItem = document.querySelectorAll('[data-testimonials-item]');
    const modalContainer = document.querySelector('[data-modal-container]');
    const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
    const overlay = document.querySelector('[data-overlay]');
    const modalImg = document.querySelector('[data-modal-img]');
    const modalTitle = document.querySelector('[data-modal-title]');
    const modalText = document.querySelector('[data-modal-text]');
    const modalDate = document.querySelector('[data-modal-date]');
    const pdfButton = document.getElementById('testimonialPdfButton');

    document.addEventListener('click', function(e) {
        // Check if click is on close button
        if (e.target.closest('[data-modal-close-btn]')) {
            closeTestimonialModal(e);
            return;
        }

        // Check if click is on overlay
        if (e.target === overlay && overlay.classList.contains('active')) {
            closeTestimonialModal(e);
            return;
        }
    });

    document.addEventListener('touchend', function(e) {
        // Check if touch is on close button
        if (e.target.closest('[data-modal-close-btn]')) {
            e.preventDefault();
            e.stopPropagation();
            closeTestimonialModal(e);
            return;
        }

        // Check if touch is on overlay
        if (e.target === overlay && overlay.classList.contains('active')) {
            e.preventDefault();
            e.stopPropagation();
            closeTestimonialModal(e);
            return;
        }
    }, { passive: false });

    if (!testimonialsItem.length || !modalContainer) return;

    const escHandler = function(e) {
        if (e.key === 'Escape' && modalContainer.classList.contains('active')) {
            closeTestimonialModal();
        }
    };

    const closeTestimonialModal = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        modalContainer.classList.remove('active');
        overlay.classList.remove('active');
        document.removeEventListener('keydown', escHandler);

        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';

        document.activeElement.blur();

        const readMoreBtn = document.querySelector('.read-more-btn');
        if (readMoreBtn) readMoreBtn.remove();

        if (e && e.cancelable) {
            e.preventDefault();
        }

        return false;
    };

    const openTestimonialModal = function() {
        modalContainer.classList.add('active');
        overlay.classList.add('active');
        document.addEventListener('keydown', escHandler);

        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    };

    const isTouchDevice = function() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    function truncateText(text, maxLength = 500) {
        if (text.length <= maxLength) return { text: text, isTruncated: false };

        const lastSpaceIndex = text.lastIndexOf(' ', maxLength);
        const truncatedText = text.substring(0, lastSpaceIndex) + '...';
        return { text: truncatedText, isTruncated: true, fullText: text };
    }

    function createReadMoreButton(fullText, modalTextElement) {
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

    for (let i = 0; i < testimonialsItem.length; i++) {
        testimonialsItem[i].addEventListener('click', function() {
            const testimonialItem = this.closest('.testimonials-item');
            const pdfUrl = testimonialItem.getAttribute('data-pdf-url');

            if (modalImg && modalTitle && modalText) {
                modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
                modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
                modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;

                const fullText = this.querySelector('[data-testimonials-text]').textContent;

                const truncated = truncateText(fullText, 360);
                modalText.textContent = truncated.text;

                const existingBtn = document.querySelector('.read-more-btn');
                if (existingBtn) existingBtn.remove();

                if (truncated.isTruncated) {
                    const readMoreBtn = createReadMoreButton(truncated.fullText, modalText);
                    modalText.parentNode.insertBefore(readMoreBtn, modalText.nextSibling);
                }
            }

            const testimonialDate = testimonialItem.getAttribute('data-testimonial-date');
            if (testimonialDate && modalDate) {
                const date = new Date(testimonialDate);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                modalDate.innerHTML = date.toLocaleDateString('en-US', options);
                modalDate.setAttribute('datetime', testimonialDate);
            }

            if (pdfButton) {
                if (pdfUrl) {
                    pdfButton.setAttribute('data-pdf-url', pdfUrl);
                    pdfButton.classList.remove('hidden');
                } else {
                    pdfButton.classList.add('hidden');
                }
            }

            openTestimonialModal();
        });
    }

    if (modalCloseBtn) {
        const handleClose = function(e) {
            if (e.cancelable) {
                e.preventDefault();
            }
            e.stopPropagation();
            e.stopImmediatePropagation();

            modalContainer.classList.remove('active');
            overlay.classList.remove('active');
            document.removeEventListener('keydown', escHandler);

            return false;
        };

        // Use pointer events which work better on iOS
        modalCloseBtn.addEventListener('pointerdown', handleClose, { passive: false });
        modalCloseBtn.addEventListener('click', handleClose, { passive: false });

        // Force iOS to treat it as a button
        modalCloseBtn.style.cursor = 'pointer';
        modalCloseBtn.style.touchAction = 'manipulation';

        const newCloseBtn = modalCloseBtn.cloneNode(true);
        modalCloseBtn.parentNode.replaceChild(newCloseBtn, modalCloseBtn);

        newCloseBtn.addEventListener('click', closeTestimonialModal);
        newCloseBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeTestimonialModal(e);
        });

        newCloseBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });

        newCloseBtn.style.cursor = 'pointer';
        newCloseBtn.style.cssText += `
            -webkit-tap-highlight-color: rgba(0,0,0,0);
            -webkit-touch-callout: none;
            user-select: none;
        `;
        newCloseBtn.setAttribute('tabindex', '0');
        newCloseBtn.setAttribute('role', 'button');
        newCloseBtn.setAttribute('aria-label', 'Close modal');

        newCloseBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeTestimonialModal(e);
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', closeTestimonialModal);
        overlay.addEventListener('touchend', function(e) {
            if (e.target === overlay) {
                e.preventDefault();
                e.stopPropagation();
                closeTestimonialModal(e);
            }
        });

        overlay.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        });
    }
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