'use strict';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== PORTFOLIO SCRIPT INITIALIZATION ===');

    // Initialize all functionality
    initializeSidebar();
    initializeTestimonials();
    initializePortfolio();
    initializeZoomModal();
    initializeFormValidation();
    initializeCertModal();
    initializeTestimonialPdfViewer();

    console.log('=== ALL COMPONENTS INITIALIZED ===');
});

// Sidebar toggle
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

// Testimonials modal with PDF functionality - FIXED
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

    if (!testimonialsItem.length || !modalContainer) return;

    for (let i = 0; i < testimonialsItem.length; i++) {
        testimonialsItem[i].addEventListener('click', function () {
            const testimonialItem = this.closest('.testimonials-item');
            const pdfUrl = testimonialItem.getAttribute('data-pdf-url');

            if (modalImg && modalTitle && modalText) {
                modalImg.src = this.querySelector('[data-testimonials-avatar]').src;
                modalImg.alt = this.querySelector('[data-testimonials-avatar]').alt;
                modalTitle.innerHTML = this.querySelector('[data-testimonials-title]').innerHTML;
                modalText.innerHTML = this.querySelector('[data-testimonials-text]').innerHTML;
            }

            const testimonialDate = testimonialItem.getAttribute('data-testimonial-date');
            if (testimonialDate && modalDate) {
                const date = new Date(testimonialDate);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                modalDate.innerHTML = date.toLocaleDateString('en-US', options);
                modalDate.setAttribute('datetime', testimonialDate);
            }

            // Update PDF button visibility and URL
            if (pdfButton) {
                if (pdfUrl) {
                    pdfButton.setAttribute('data-pdf-url', pdfUrl);
                    pdfButton.classList.remove('hidden');
                } else {
                    pdfButton.classList.add('hidden');
                }
            }

            testimonialsModalFunc();
        });
    }

    const testimonialsModalFunc = function () {
        modalContainer.classList.toggle('active');
        overlay.classList.toggle('active');
    };

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', testimonialsModalFunc);
    }

    if (overlay) {
        overlay.addEventListener('click', testimonialsModalFunc);
    }
}

// Initialize testimonial PDF viewer - FIXED
function initializeTestimonialPdfViewer() {
    const pdfButton = document.getElementById('testimonialPdfButton');

    if (!pdfButton) {
        console.error('PDF button not found in DOM');
        return;
    }

    pdfButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const pdfUrl = this.getAttribute('data-pdf-url');

        if (pdfUrl) {
            openTestimonialPdf(pdfUrl);
        } else {
            console.error('No PDF URL found on button');
        }
    });
}

// Open testimonial PDF in modal - FIXED WITH WORKING CLOSE BUTTON
function openTestimonialPdf(pdfUrl) {
    // Close testimonial modal first
    const modalContainer = document.querySelector('[data-modal-container]');
    const overlay = document.querySelector('[data-overlay]');

    if (modalContainer && modalContainer.classList.contains('active')) {
        modalContainer.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Create or get PDF modal
    let pdfModal = document.getElementById('pdfModal');

    // If modal doesn't exist, create it
    if (!pdfModal) {
        createPdfModal();
        pdfModal = document.getElementById('pdfModal');
    }

    // Open the PDF
    const pdfViewerFrame = document.getElementById('pdfViewerFrame');
    if (pdfViewerFrame) {
        pdfViewerFrame.src = pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0';
    }

    // Show the modal
    pdfModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Add ESC key listener
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closePdfModal();
        }
    };

    // Store handler for removal
    pdfModal.dataset.escHandler = 'active';
    document.addEventListener('keydown', escHandler);
}

// Create PDF modal with working close button
function createPdfModal() {
    const pdfModal = document.createElement('div');
    pdfModal.id = 'pdfModal';
    pdfModal.className = 'pdf-modal';
    pdfModal.style.display = 'none';
    pdfModal.innerHTML = `
        <span class="close-pdf-modal">&times;</span>
        <div class="pdf-modal-content">
            <div class="pdf-pdf-container">
                <iframe id="pdfViewerFrame" width="100%" height="100%" frameborder="0"></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(pdfModal);

    // Setup close functionality
    setupPdfModalClose();
}

// Setup PDF modal close functionality
function setupPdfModalClose() {
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = document.querySelector('.close-pdf-modal');
    const pdfViewerFrame = document.getElementById('pdfViewerFrame');

    if (!pdfModal) return;

    // Close function
    const closePdfModalFunc = function() {
        pdfModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear iframe src
        if (pdfViewerFrame) {
            pdfViewerFrame.src = '';
        }

        // Remove ESC listener
        if (pdfModal.dataset.escHandler === 'active') {
            document.removeEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closePdfModalFunc();
                }
            });
        }
    };

    // Close button click
    if (closePdfModal) {
        closePdfModal.addEventListener('click', closePdfModalFunc);
    }

    // Background click
    pdfModal.addEventListener('click', function(e) {
        if (e.target === pdfModal) {
            closePdfModalFunc();
        }
    });

    // ESC key - NEW FIXED VERSION
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && pdfModal.style.display === 'block') {
            closePdfModalFunc();
        }
    });
}

// Portfolio filtering
function initializePortfolio() {
    const select = document.querySelector('[data-select]');
    const selectItems = document.querySelectorAll('[data-select-item]');
    const selectValue = document.querySelector('[data-select-value]');
    const filterBtn = document.querySelectorAll('[data-filter-btn]');

    if (!select) return;

    select.addEventListener('click', function () {
        this.classList.toggle("active");
    });

    for(let i = 0; i < selectItems.length; i++) {
        selectItems[i].addEventListener('click', function() {
            let selectedValue = this.innerText.toLowerCase();
            selectValue.innerText = this.innerText;
            select.classList.remove("active");
            filterFunc(selectedValue);
        });
    }

    const filterItems = document.querySelectorAll('[data-filter-item]');

    const filterFunc = function (selectedValue) {
        for(let i = 0; i < filterItems.length; i++) {
            if(selectedValue == "all") {
                filterItems[i].classList.add('active');
            } else if (selectedValue == filterItems[i].dataset.category) {
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
            selectValue.innerText = this.innerText;
            filterFunc(selectedValue);

            lastClickedBtn.classList.remove('active');
            this.classList.add('active');
            lastClickedBtn = this;
        });
    }
}

// Image zoom functionality
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

// Form validation
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

        // Check initial state
        if (form.checkValidity()) {
            formBtn.removeAttribute('disabled');
        } else {
            formBtn.setAttribute('disabled', '');
        }
    }
}

// Certificate modal - FIXED WITH WORKING CLOSE BUTTON
function initializeCertModal() {
    // Create certificate modal if it doesn't exist
    let certModal = document.querySelector('.cert-modal');

    if (!certModal) {
        certModal = document.createElement('div');
        certModal.className = 'cert-modal';
        certModal.style.display = 'none';
        certModal.innerHTML = `
            <span class="close-cert-modal">&times;</span>
            <div class="cert-modal-content">
                <div class="cert-pdf-container">
                    <iframe id="certPdfFrame" width="100%" height="100%" frameborder="0"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(certModal);

        // Setup certificate modal close functionality
        setupCertModalClose();
    }

    const certLinks = document.querySelectorAll('.cert-link');

    certLinks.forEach(certLink => {
        certLink.addEventListener('click', function (e) {
            e.preventDefault();

            const pdfUrl = this.getAttribute('href');

            if (pdfUrl && pdfUrl.toLowerCase().endsWith('.pdf')) {
                openCertPdf(pdfUrl);
            } else {
                window.open(pdfUrl, '_blank');
            }
        });
    });
}

// Open certificate PDF
function openCertPdf(pdfUrl) {
    const certModal = document.querySelector('.cert-modal');
    const certPdfFrame = document.getElementById('certPdfFrame');

    if (!certModal) return;

    if (certPdfFrame) {
        certPdfFrame.src = pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0';
    }

    certModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Setup certificate modal close functionality
function setupCertModalClose() {
    const certModal = document.querySelector('.cert-modal');
    const closeCertModal = certModal ? certModal.querySelector('.close-cert-modal') : null;
    const certPdfFrame = document.getElementById('certPdfFrame');

    if (!certModal) return;

    // Close function
    const closeCertModalFunc = function() {
        certModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear iframe src
        if (certPdfFrame) {
            certPdfFrame.src = '';
        }
    };

    // Close button click
    if (closeCertModal) {
        closeCertModal.addEventListener('click', closeCertModalFunc);
    }

    // Background click
    certModal.addEventListener('click', function(e) {
        if (e.target === certModal) {
            closeCertModalFunc();
        }
    });

    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certModal.style.display === 'block') {
            closeCertModalFunc();
        }
    });
}

// Also make sure to initialize the PDF modal close when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if PDF modal exists in HTML and setup close functionality
    const existingPdfModal = document.getElementById('pdfModal');
    if (existingPdfModal) {
        setupPdfModalClose();
    }

    // Check if cert modal exists in HTML and setup close functionality
    const existingCertModal = document.querySelector('.cert-modal');
    if (existingCertModal) {
        setupCertModalClose();
    }
});