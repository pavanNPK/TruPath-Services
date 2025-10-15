// ==================== Global Flags ====================
let serviceCardsLoaded = false;

// ==================== Scroll Restoration ====================
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ==================== Scroll to Top on Fresh Load ====================
window.addEventListener('load', function () {
    if (performance.navigation.type === performance.navigation.TYPE_NAVIGATE) {
        window.scrollTo(0, 0);
    }

    // ✅ Ensure service cards load after everything is ready
    console.log('✅ Window fully loaded — initializing service cards...');
    loadServiceCards();
});

// ==================== DOM Ready Initializations ====================
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM content loaded.");

    // Hamburger toggler
    const toggler = document.querySelector(".custom-toggler");
    if (toggler) {
        toggler.addEventListener("click", function () {
            this.classList.toggle("open");
        });
    }

   // ✅ Initialize all Bootstrap carousels (including TruPath hero)
    ['#trupathCarousel', '#carouselExampleSetSectionIndicators'].forEach(id => {
        const carouselElement = document.querySelector(id);
        if (carouselElement) {
        new bootstrap.Carousel(carouselElement, {
            interval: 4000, // Slide every 4s for smoother transitions
            wrap: true,     // Loop back to first slide
            pause: false,   // Keep autoplay even on hover
            ride: 'carousel'
        });
        }
    });  

    // Example helper usage (make sure loadSetSectionImg exists)
    if (typeof loadSetSectionImg === 'function') {
        loadSetSectionImg('instructors', 'Certified Instructors & Mentors', 0);
    }

    // Footer year update
    const year = document.getElementById("currentYear");
    if (year) year.textContent = new Date().getFullYear();

    // Disable right-click
    // document.addEventListener("contextmenu", e => e.preventDefault());

    // Disable dev tools shortcuts
    document.addEventListener("keydown", function (e) {
        const blocked = [
            "F12", "U", "S", "P", "I", "J", "C"
        ];
        if (
            e.key === "F12" ||
            (e.ctrlKey && blocked.includes(e.key.toUpperCase())) ||
            (e.ctrlKey && e.shiftKey && blocked.includes(e.key.toUpperCase())) ||
            (e.metaKey && blocked.includes(e.key.toUpperCase())) ||
            (e.metaKey && e.altKey && e.key.toUpperCase() === 'I')
        ) {
            e.preventDefault();
            return false;
        }
    });
});

// ==================== Scroll to Top Button ====================
let scrollToTopButton = document.getElementById("scrollToTop");

function scrollFunction() {
    if (!scrollToTopButton) return;
    const show = document.body.scrollTop > 20 || document.documentElement.scrollTop > 20;
    scrollToTopButton.style.display = show ? "block" : "none";
    scrollToTopButton.style.opacity = show ? "1" : "0";
}

let scrollTimeout;
window.addEventListener('scroll', function () {
    if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
            scrollFunction();
            scrollTimeout = null;
        }, 16);
    }
});

if (scrollToTopButton) {
    scrollToTopButton.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== Navbar Smooth Scroll & Highlight ====================
let disableScrollHighlight = false;

document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        disableScrollHighlight = true;
        setTimeout(() => disableScrollHighlight = false, 1000);

        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        this.classList.add("active");

        const targetId = this.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            const offset = window.innerWidth < 992 ? 220 : 80;
            const yOffset = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: yOffset, behavior: "smooth" });
        }

        const navbarCollapse = document.getElementById("navbarNav");
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();

        const toggler = document.querySelector('.custom-toggler');
        if (toggler && toggler.classList.contains('open')) toggler.classList.remove('open');
    });
});

let highlightTimeout;
window.addEventListener("scroll", () => {
    if (disableScrollHighlight) return;
    if (!highlightTimeout) {
        highlightTimeout = setTimeout(() => {
            updateScrollHighlight();
            highlightTimeout = null;
        }, 50);
    }
});

function updateScrollHighlight() {
    const offset = window.innerWidth < 768 ? 60 : 85;
    const sections = [
        'aboutUsSection',
        'ourServicesSection',
        'pricingSection',
        'whyChooseUsSection',
        'contactUsSection'
    ];
    let currentId = "";
    let scrollPos = window.scrollY + offset + 1;

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section && scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
            currentId = id;
        }
    });

    const isAtBottom = (window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 10);
    if (isAtBottom) currentId = sections[sections.length - 1];

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
}

// ==================== Header Scroll Effect ====================
const header = document.querySelector('.dynamic-header');
let isScrolled = false;

window.addEventListener('scroll', function () {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop >= 50 && !isScrolled) {
        header.classList.add('scrolled');
        isScrolled = true;
    } else if (scrollTop < 50 && isScrolled) {
        header.classList.remove('scrolled');
        isScrolled = false;
    }
});

// ==================== Contact Form Submission ====================
const form = document.getElementById("contactForm");
if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = {
            name: `${form.firstName.value.trim()} ${form.lastName.value.trim()}`,
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            message: form.message.value.trim()
        };
        submitForm(data);
    });
}

function submitForm(data) {
    const button = document.getElementById("submitForm");
    button.disabled = true;
    showToast("Please wait...");

    fetch("https://api.trupathservices.com/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
        .then(r => r.text())
        .then(() => {
            form.reset();
            button.disabled = false;
            showToast("Form submitted successfully!");
        })
        .catch(err => {
            console.error("Error:", err);
            button.disabled = false;
            showToast("Error submitting form!");
        });
}

function showToast(message, duration = 3000) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.classList.add("toast-message");
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => container.removeChild(toast), 300);
    }, duration);
}

// ==================== Service Cards ====================
const serviceCardsData = [
    { image: "./assets/images/services/hcc.svg", title: "HCC Risk Adjustment Coding", description: "Capture patient health conditions accurately to support fair reimbursement and strengthen population health management." },
    { image: "./assets/images/services/outpatient.svg", title: "Outpatient & Ambulatory Coding", description: "Efficient coding for ED, E&M, and clinic visits that reduces denials and accelerates payments." },
    { image: "./assets/images/services/cdi.svg", title: "Clinical Documentation Improvement (CDI)", description: "Enhance your clinical records for compliance, accuracy, and financial performance.", subTitle: "Our CDI programs help you", subDescription: "Capture severity of illness and risk of mortality more effectively, Support proper DRG assignment, Improve CMS compliance and payer reporting, Reduce audit risk while boosting quality scores" },
    { image: "./assets/images/services/inpatient.svg", title: "Inpatient DRG Coding", description: "Specialized expertise in inpatient hospital stays—ensuring correct DRG assignment, compliance, and optimized revenue." },
    { image: "./assets/images/services/payment.svg", title: "Payment Integrity Services", description: "DRG and APC validation services that prevent claim errors, reduce payment disputes, and secure accurate reimbursement." }
];


function loadServiceCards() {
    if (serviceCardsLoaded) return;

    const container = document.querySelector('.serviceCards');
    if (!container) {
        console.warn('⚠️ Service cards container not found. Retrying...');
        setTimeout(loadServiceCards, 200);
        return;
    }

    console.log('✅ Loading service cards...');
    container.innerHTML = '';

    serviceCardsData.forEach(({ image, title, description, subTitle, subDescription }) => {
        const card = document.createElement('div');
        card.className = 'serviceCard';

        // Split subDescription into bullet points if multiple sentences exist
        const subDescItems = subDescription
            ? subDescription.split(/,/).map(item => item.trim()).filter(Boolean)
            : [];

        // Build inner HTML
        card.innerHTML = `
            <div class="serviceCard-inner">
                <div class="serviceCard-image">
                    <img src="${image}" alt="${title}" loading="lazy">
                </div>
                <div class="serviceCard-content">
                    <h3 class="serviceCard-title">${title}</h3>
                    <p class="serviceCard-description m-0" style="text-align: left !important;">${description}</p>
                    ${subTitle ? `<h5 class="serviceCard-subtitle mt-3">${subTitle}</h5>` : ''}
                    ${subDescItems.length
                        ? `<ul class="serviceCard-list">${subDescItems
                              .map(item => `<li>${item}</li>`)
                              .join('')}</ul>`
                        : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    serviceCardsLoaded = true;
    console.log('✅ Service cards loaded successfully!');
}
