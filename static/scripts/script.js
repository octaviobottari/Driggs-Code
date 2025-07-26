// ====================== CONSTANTS ======================
const CASE_STUDIES_URL = 'static/scripts/case-studies.json';
const REVIEWS_URL = 'static/scripts/reviews.json';

// ====================== DOM ELEMENTS ======================
const caseStudiesContainer = document.querySelector('.case-studies');
const hamburgerMenu = document.getElementById('hamburger-menu');
const nav = document.querySelector('.nav');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModalButton = document.getElementById('close-modal');
const header = document.querySelector('.header');
const logo = document.getElementById('header-logo');
const reviewsContainer = document.querySelector('.reviews');
const form = document.getElementById('contactForm');
const alertDiv = document.getElementById('formAlert');

// ====================== FUNCTIONS ======================


// Fetch and display reviews
async function fetchAndDisplayReviews() {
    try {
        const response = await fetch(REVIEWS_URL);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        const reviews = await response.json();

        const reviewsHTML = reviews
            .map(
                (review) => `
                <div class="review-card">
                    <i class="fas fa-quote-left"></i>
                    <p>${review.quote}</p>
                    <div class="author">${review.author}</div>
                    <div class="position">${review.position}</div>
                    <div class="stars">
                        ${'<i class="fas fa-star"></i>'.repeat(review.stars)}
                    </div>
                </div>
            `
            )
            .join('');

        reviewsContainer.innerHTML = reviewsHTML;

        initializeMarqueeCarousel();
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupHeaderScrollEffects() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, 100)); // Debounce scroll events to reduce reflows
}

function initializeMarqueeCarousel() {
    const root = document.documentElement;
    const marqueeElementsDisplayed = 3;
    const marqueeContent = document.querySelector(".reviews");

    if (marqueeContent) {
        root.style.setProperty("--marquee-elements", marqueeContent.children.length);

        if (window.innerWidth > 768) {
            for (let i = 0; i < marqueeElementsDisplayed; i++) {
                marqueeContent.appendChild(marqueeContent.children[i].cloneNode(true));
            }
            marqueeContent.style.animation = `scrolling ${marqueeContent.children.length * 5}s linear infinite`;
        }
    }
}

// Add resize handler with error prevention
window.addEventListener('resize', debounce(() => {
    try {
        if (typeof Runner !== 'undefined' && Runner.adjustDimensions) {
            Runner.adjustDimensions();
        }
        initializeMarqueeCarousel(); // Reinitialize carousel on resize
    } catch (e) {
        console.warn('Resize handling error:', e);
        // Prevent further execution if Runner is misconfigured
    }
}, 150));

// Open modal with case study details
async function fetchAndDisplayCaseStudies() {
    try {
        const response = await fetch(CASE_STUDIES_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const caseStudies = await response.json();
        console.log('Case studies loaded:', caseStudies); // Debug
        const caseStudiesHTML = caseStudies
            .map(
                (study) => `
                <div class="case-study">
                    <div class="case-study-img">
                        <img src="${study.image}" alt="${study.title || 'Case Study'} Image" onerror="this.src='/static/images/fallback.png'; console.error('Failed to load case study image: ${study.image}');">
                    </div>
                    <h3>${study.title || 'Untitled'}</h3>
                    <p>${study.description || 'No description'}</p>
                    <a href="#" data-case-study="${study.id}">Read Case Study
                        <span aria-label="(external site)">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="up-right-from-square" class="svg-inline--fa fa-up-right-from-square" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                <path fill="currentColor" d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V32c0-17.7-14.3-32-32-32H352zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"></path>
                            </svg>
                        </span>
                    </a>
                </div>
            `
            )
            .join('');
        caseStudiesContainer.innerHTML = caseStudiesHTML;
        setupModalEventListeners(caseStudies);
    } catch (error) {
        console.error('Error loading case studies:', error);
    }
}

// Open modal with case study details
function openModal(caseStudyId, caseStudies) {
    const caseStudy = caseStudies.find((study) => study.id === caseStudyId);
    if (!caseStudy) {
        console.error(`Case study with ID ${caseStudyId} not found`);
        return;
    }
    let imagePath = '/static/images/fallback.png'; // Default fallback
    if (caseStudy.image) {
        imagePath = caseStudy.image.startsWith('/static/') 
            ? caseStudy.image 
            : `/static/images/${caseStudy.image.split('/').pop()}`;
    }
    console.log(`Loading modal image: ${imagePath}`); // Debug
    modalContent.innerHTML = `
        <h2>${caseStudy.title || 'Untitled'}</h2>
        <img src="${imagePath}" alt="${caseStudy.title || 'Case Study'}" style="max-width: 100%; height: auto; margin: 15px 0;" onerror="this.src='/static/images/fallback.png'; console.error('Failed to load modal image: ${imagePath}');">
        <p><strong>Description:</strong> ${caseStudy.description || 'No description available'}</p>
        <div>${caseStudy.content || ''}</div>
        <h3>Project Details</h3>
        <ul>
            <li><strong>Service Provided:</strong> ${caseStudy.project_details?.service_provided || 'N/A'}</li>
            <li><strong>Project Duration:</strong> ${caseStudy.project_details?.project_duration || 'N/A'}</li>
            <li><strong>Budget Range:</strong> ${caseStudy.project_details?.budget_range || 'N/A'}</li>
            <li><strong>Project Summary:</strong> ${caseStudy.project_details?.project_summary || 'N/A'}</li>
            <li><strong>Challenge:</strong> ${caseStudy.project_details?.challenge || 'N/A'}</li>
            <li><strong>Goals:</strong> ${caseStudy.project_details?.goals_for_the_project || 'N/A'}</li>
        </ul>
    `;
    modal.classList.add('open');
}

// Close modal
function closeModal() {
    modal.classList.remove('open');
}

// Set up event listeners for case study links
function setupModalEventListeners(caseStudies) {
    document.querySelectorAll('.case-study a').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const caseStudyId = link.getAttribute('data-case-study');
            openModal(caseStudyId, caseStudies);
        });
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Set up header scroll effects
function setupHeaderScrollEffects() {
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Set up hamburger menu
function setupHamburgerMenu() {
    if (hamburgerMenu && nav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            nav.classList.toggle('active');
        });
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.hamburger-menu') && !event.target.closest('.nav')) {
                hamburgerMenu.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    }
}

// Set up accordion
function setupAccordion() {
    document.querySelectorAll('.accordion-item-argentina .title-argentina').forEach((title) => {
        title.addEventListener('click', () => {
            const item = title.parentElement;
            item.classList.toggle('active');
        });
    });
}

// Display flashed messages as alerts
function displayFlashedMessages() {
    const alertDiv = document.getElementById('formAlert');
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    const category = urlParams.get('category');

    if (message && category && alertDiv) {
        alertDiv.className = `alert alert-${category}`;
        alertDiv.textContent = message;
        alertDiv.style.display = 'block';
        setTimeout(() => {
            alertDiv.style.display = 'none';
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 5000);
    }
}

// ====================== INITIALIZATION ======================
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCaseStudies();
    fetchAndDisplayReviews();
    setupHeaderScrollEffects();
    setupHamburgerMenu();
    setupAccordion();
    displayFlashedMessages(); // Display any flashed messages on page load
});