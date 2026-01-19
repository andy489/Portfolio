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

    // Set up existing modals if they exist
    if (document.getElementById('pdfModal')) {
        setupPdfModalClose();
    }

    if (document.querySelector('.cert-modal')) {
        setupCertModalClose();
    }

    console.log('=== ALL COMPONENTS INITIALIZED ===');
});

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

function openTestimonialPdf(pdfUrl) {
    const modalContainer = document.querySelector('[data-modal-container]');
    const overlay = document.querySelector('[data-overlay]');

    if (modalContainer && modalContainer.classList.contains('active')) {
        modalContainer.classList.remove('active');
        overlay.classList.remove('active');
    }

    let pdfModal = document.getElementById('pdfModal');

    if (!pdfModal) {
        createPdfModal();
        pdfModal = document.getElementById('pdfModal');
        setupPdfModalClose(); // Set up close handlers after creating
    }

    const pdfViewerFrame = document.getElementById('pdfViewerFrame');
    if (pdfViewerFrame) {
        // Remove restrictive parameters to show entire PDF
        pdfViewerFrame.src = pdfUrl + '#view=FitH&scrollbar=1&toolbar=1&navpanes=1';
    }

    pdfModal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closePdfModal();
        }
    };

    document.addEventListener('keydown', escHandler);

    // Store the handler reference for cleanup
    pdfModal.escHandler = escHandler;
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
                <iframe id="pdfViewerFrame" width="100%" height="100%" frameborder="0"></iframe>
            </div>
        </div>
    `;
    document.body.appendChild(pdfModal);
}

function setupPdfModalClose() {
    const pdfModal = document.getElementById('pdfModal');
    const closePdfModal = pdfModal ? pdfModal.querySelector('.close-pdf-modal') : null;
    const pdfViewerFrame = document.getElementById('pdfViewerFrame');

    if (!pdfModal) return;

    // Close function
    const closePdfModalFunc = function() {
        pdfModal.style.display = 'none';
        document.body.style.overflow = 'auto';

        if (pdfViewerFrame) {
            pdfViewerFrame.src = '';
        }

        // Remove escape key handler
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

    // Add escape key listener
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

    // Toggle dropdown on click
    select.addEventListener('click', function (e) {
        e.stopPropagation();
        this.classList.toggle("active");

        // Change chevron icon
        if (selectIcon) {
            if (this.classList.contains("active")) {
                selectIcon.classList.remove("fa-chevron-down");
                selectIcon.classList.add("fa-chevron-up");
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            } else {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");
                // Keep chevron yellow if an item is selected
                const selectedItem = document.querySelector('.select-item button.active');
                if (selectedItem && selectedItem.textContent !== "All") {
                    selectIcon.style.color = "var(--orange-yellow-crayola)";
                } else {
                    selectIcon.style.color = "";
                }
            }
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        if (!select.contains(e.target)) {
            select.classList.remove("active");
            if (selectIcon) {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");

                // Keep chevron yellow if an item is selected
                const selectedItem = document.querySelector('.select-item button.active');
                if (selectedItem && selectedItem.textContent !== "All") {
                    selectIcon.style.color = "var(--orange-yellow-crayola)";
                } else {
                    selectIcon.style.color = "";
                }
            }
        }
    });

    // Handle item selection
    for(let i = 0; i < selectItems.length; i++) {
        selectItems[i].addEventListener('click', function(e) {
            e.stopPropagation();

            let selectedValue = this.innerText.toLowerCase();
            let displayValue = this.innerText;

            // Update the selected value display
            if (selectValue) {
                selectValue.textContent = displayValue;
            }

            // Remove active class from all items
            selectItems.forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked item
            this.classList.add('active');

            // Make chevron yellow when an item is selected
            if (selectIcon) {
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            }

            // Close dropdown
            select.classList.remove("active");
            if (selectIcon) {
                selectIcon.classList.remove("fa-chevron-up");
                selectIcon.classList.add("fa-chevron-down");
            }

            // Filter the portfolio items
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

    // Initialize desktop filter buttons
    let lastClickedBtn = filterBtn[0];

    for (let i = 0; i < filterBtn.length; i++) {
        filterBtn[i].addEventListener('click', function() {
            let selectedValue = this.innerText.toLowerCase();

            // Update mobile dropdown value
            if (selectValue) {
                selectValue.textContent = this.innerText;
            }

            // Update mobile dropdown active item
            selectItems.forEach((item, index) => {
                if (item.textContent.toLowerCase() === selectedValue) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Make chevron yellow
            if (selectIcon) {
                selectIcon.style.color = "var(--orange-yellow-crayola)";
            }

            filterFunc(selectedValue);

            // Update desktop filter buttons
            lastClickedBtn.classList.remove('active');
            this.classList.add('active');
            lastClickedBtn = this;
        });
    }

    // Initialize active state for chevron
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

    // Check initial state
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

        // Check initial state
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
                    <iframe id="certPdfFrame" width="100%" height="100%" frameborder="0"></iframe>
                </div>
            </div>
        `;
        document.body.appendChild(certModal);

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

function openCertPdf(pdfUrl) {
    const certModal = document.querySelector('.cert-modal');
    const certPdfFrame = document.getElementById('certPdfFrame');

    if (!certModal) return;

    if (certPdfFrame) {
        // Use parameters that show the full PDF with navigation
        certPdfFrame.src = pdfUrl + '#view=FitH&scrollbar=1&toolbar=1&navpanes=1';
    }

    certModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
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