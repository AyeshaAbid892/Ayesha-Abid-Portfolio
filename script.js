// ========================================
// Luxury Portfolio - JavaScript
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all functionality
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initActiveNavHighlight();
  initSkillBars();
  initTestimonialsSlider();
  initContactForm();
  initScrollReveal();
  initHireMeModal(); // <--- Modal Initialization Call
});

// ========================================
// Navbar Scroll Effect
// ========================================

function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// ========================================
// Mobile Menu Toggle
// ========================================

function initMobileMenu() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('active')) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

// ========================================
// Smooth Scrolling
// ========================================

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const navbarHeight = document.getElementById('navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// Active Navigation Highlight
// ========================================

function initActiveNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function highlightNav() {
    const scrollY = window.pageYOffset;
    const navbarHeight = document.getElementById('navbar').offsetHeight;

    sections.forEach(section => {
      const sectionTop = section.offsetTop - navbarHeight - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav);
  highlightNav(); // Initial call
}

// ========================================
// Animated Skill Bars
// ========================================

function initSkillBars() {
  const skillBars = document.querySelectorAll('.skill-progress');

  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progress = entry.target.dataset.progress;
        entry.target.style.width = `${progress}%`;
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  skillBars.forEach(bar => observer.observe(bar));
}



// ========================================
// Testimonials Slider
// ========================================

function initTestimonialsSlider() {
  const track = document.getElementById('testimonialsTrack');
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  let currentIndex = 0;
  const totalSlides = cards.length;
  let autoplayInterval;

  function updateSlider() {
    // Update track position
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update cards
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === currentIndex);
    });

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    updateSlider();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // Event listeners
  nextBtn.addEventListener('click', () => {
    nextSlide();
    stopAutoplay();
    startAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    stopAutoplay();
    startAutoplay();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Touch support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoplay();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // Start autoplay
  startAutoplay();
}

// ========================================
// Contact Form
// ========================================

function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMessage = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Simulate form submission
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Form submitted:', data);

    // Show success message
    successMessage.classList.add('show');
    form.reset();

    // Hide success message after 5 seconds
    setTimeout(() => {
      successMessage.classList.remove('show');
    }, 5000);
  });
}

// ========================================
// Scroll Reveal Animation
// ========================================

function initScrollReveal() {
  // Add reveal class to elements
  const revealElements = document.querySelectorAll(
    '.section-header, .about-content, .career-column, .skill-card, ' +
    '.service-card, .expertise-card, .project-card, .blog-card, ' +
    '.contact-info, .contact-form'
  );

  revealElements.forEach(el => {
    el.classList.add('reveal');
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

// ========================================
// Hire Me Premium Modal Function
// ========================================
function initHireMeModal() {
  const modal = document.getElementById('contactModal');
  const btn = document.getElementById('hireMeBtn');
  const closeBtn = document.querySelector('.close-modal');

  if (btn && modal) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('show');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }

  // Window par click karne se modal close ho jaye
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
}

// ========================================
// Hamburger Button Menu Toggle
// ========================================

/* --- FINAL CLEAN JS FIX --- */
const hamburger = document.querySelector('.hamburger-button');
const menu = document.querySelector('.mobile-nav-menu');

// Yeh ensure karta hai ke button aur menu dono exist karte hain
if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    menu.classList.toggle('active');
    document.body.classList.toggle('menu-open'); // Ye zaroori hai!
  });
}



