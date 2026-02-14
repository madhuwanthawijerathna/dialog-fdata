document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const initialOverlay = document.getElementById('initialOverlay');
    const numberEntryCard = document.getElementById('numberEntryCard');
    const numberInput = document.getElementById('numberInput');
    const submitNumberButton = document.getElementById('submitNumberButton');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const getNowButton = document.getElementById('getNowButton');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const slideshowScreen = document.getElementById('slideshowScreen');
    const slideshowContainer = document.getElementById('slideshowContainer');
    const slideProgressBar = document.getElementById('slideProgressBar');
    const heartsContainer = document.getElementById('heartsContainer'); // Container for falling hearts
    const finalMessageScreen = document.getElementById('finalMessageScreen');
    const valentineMessage = document.getElementById('valentineMessage');
    const theEndScreen = document.getElementById('theEndScreen'); // Separate The End screen
    const backgroundAudio = document.getElementById('backgroundAudio');

    // --- Number Entry Variables ---
    const correctNumber = "0769496266"; // The correct number to be typed.

    // --- Slideshow Variables ---
    let currentSlideIndex = 0;
    let slides = [];
    let slideshowInterval;
    const slideDuration = 3000; // 3 seconds
    let slideshowLoopCount = 0; // To track if the slideshow has completed one full loop

    // --- Hearts Rain Variables ---
    let heartGenerationInterval; // Interval for generating new hearts

    // --- Image paths for slideshow ---
    // Make sure these images are in the 'images/' folder and named correctly (case-sensitive on servers like GitHub Pages)
    const slideImagePaths = Array.from({ length: 14 }, (_, i) => `images/valentine_${i + 1}.jpg`);

    // --- Utility Functions ---
    const showScreen = (screenElement) => {
        document.querySelectorAll('.overlay').forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        screenElement.classList.remove('hidden');
        screenElement.classList.add('active');
    };

    // --- Phase 1: Number Entry Logic ---
    const setupNumberEntry = () => {
        errorMessage.textContent = '';
        errorMessage.style.opacity = '0';
        successMessage.textContent = '';
        successMessage.style.opacity = '0';
        getNowButton.classList.add('hidden'); // Ensure getNowButton is hidden initially

        // Ensure input and submit button are visible for new attempts
        numberInput.classList.remove('hidden');
        submitNumberButton.classList.remove('hidden');

        submitNumberButton.addEventListener('click', handleSubmitNumber);
        numberInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSubmitNumber();
            }
        });
    };

    const handleSubmitNumber = () => {
        const enteredNumber = numberInput.value.replace(/[\s-]/g, ''); // Remove spaces and dashes for comparison
        
        errorMessage.textContent = ''; // Clear previous error
        errorMessage.style.opacity = '0'; // Hide error message
        successMessage.textContent = ''; // Clear previous success
        successMessage.style.opacity = '0'; // Hide success message

        if (enteredNumber === correctNumber) {
            successMessage.textContent = 'Correct! You\'ve won 50 GB!';
            successMessage.style.opacity = '1';
            
            // Hide input and submit button with a fade out effect
            numberInput.style.transition = 'opacity 0.3s ease';
            submitNumberButton.style.transition = 'opacity 0.3s ease';
            numberInput.style.opacity = '0';
            submitNumberButton.style.opacity = '0';

            setTimeout(() => {
                numberInput.classList.add('hidden');
                submitNumberButton.classList.add('hidden');
                
                // Show "Get Now" button with a fade in effect
                getNowButton.classList.remove('hidden'); 
                getNowButton.style.opacity = '0'; 
                getNowButton.style.transition = 'opacity 0.5s ease-in-out';
                getNowButton.style.opacity = '1';
            }, 300); // After input/submit buttons fade out
            
        } else {
            errorMessage.textContent = 'Incorrect code. Please try again.';
            errorMessage.style.opacity = '1';
            numberInput.value = ''; // Clear input for another try
            
            // Ensure input and submit button are visible if they were hidden (e.g. after a correct attempt followed by wrong re-entry)
            numberInput.classList.remove('hidden');
            submitNumberButton.classList.remove('hidden');
            numberInput.style.opacity = '1';
            submitNumberButton.style.opacity = '1';

            getNowButton.classList.add('hidden'); // Ensure Get Now button is hidden
        }
    };

    getNowButton.addEventListener('click', () => {
        backgroundAudio.play().catch(e => {
            console.warn("Audio play failed, user may not have interacted yet:", e);
        });
        showScreen(loadingScreen);
        startLoadingAnimation();
    });

    // --- Phase 2: Loading Screen Logic ---
    const startLoadingAnimation = () => {
        let width = 0;
        const duration = 6000; // 6 seconds
        const intervalTime = 50; // Update every 50ms
        const increment = (100 / (duration / intervalTime)); 
        const heartIcon = '❤️';
        const heartCount = 10; // Number of hearts to display when bar is full

        const loadingInterval = setInterval(() => {
            width += increment;
            if (width >= 100) {
                width = 100;
                clearInterval(loadingInterval);
                setTimeout(() => {
                    showScreen(slideshowScreen);
                    setupSlideshow(); // Initialize slideshow after loading
                    startHeartsRain(); // Start hearts rain when slideshow begins
                }, 500); // Small delay before transitioning to slideshow
            }
            loadingBar.style.width = width + '%';

            // Add hearts dynamically to the loading bar
            let heartsHtml = '';
            // Calculate how many hearts should be displayed based on current width
            const heartsToShow = Math.floor(width / (100 / heartCount));
            for(let i=0; i<heartsToShow; i++) {
                heartsHtml += `<span class="heart-icon">${heartIcon}</span>`;
            }
            loadingBar.innerHTML = heartsHtml;

        }, intervalTime);
    };

    // --- Phase 3: Photo Slideshow Logic ---
    const setupSlideshow = () => {
        slideshowContainer.innerHTML = '';
        slides = [];
        currentSlideIndex = 0;
        slideshowLoopCount = 0; 

        slideImagePaths.forEach((path, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.classList.add('slide');
            if (index === 0) { 
                slideDiv.classList.add('active');
            }
            const img = document.createElement('img');
            img.src = path;
            img.alt = `Valentine's Photo ${index + 1}`;
            slideDiv.appendChild(img);
            slideshowContainer.appendChild(slideDiv);
            slides.push(slideDiv);
        });

        startSlideshowTimer();
        initSlideshowSwipe();
    };

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (i === index) {
                slide.classList.add('active');
            }
        });
        currentSlideIndex = index;
        resetSlideProgressBar(); 
    };

    const nextSlide = () => {
        clearInterval(slideshowInterval);
        
        let nextIndex = (currentSlideIndex + 1) % slides.length;

        if (nextIndex === 0 && slideshowLoopCount < 1) {
            slideshowLoopCount++; 
        }

        if (nextIndex === 0 && slideshowLoopCount >= 1) {
            stopSlideshowTimer(); 
            stopHeartsRain(); // Stop hearts rain when leaving slideshow
            showScreen(finalMessageScreen);
            startFinalMessageSequence();
            return; 
        }

        showSlide(nextIndex);
    };
    
    const startSlideshowTimer = () => {
        if (slideshowInterval) clearInterval(slideshowInterval);

        slideProgressBar.style.transition = 'none';
        slideProgressBar.style.width = '0%';
        setTimeout(() => {
            slideProgressBar.style.transition = `width ${slideDuration / 1000}s linear`;
            slideProgressBar.style.width = '100%';
        }, 50);

        slideshowInterval = setTimeout(() => {
            nextSlide();
        }, slideDuration);
    };

    const stopSlideshowTimer = () => {
        clearInterval(slideshowInterval);
        slideProgressBar.style.transition = 'none';
        slideProgressBar.style.width = '0%';
    };

    const resetSlideProgressBar = () => {
        stopSlideshowTimer();
        startSlideshowTimer();
    };

    let touchStartX = 0;
    const initSlideshowSwipe = () => {
        slideshowContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            stopSlideshowTimer(); // Stop auto-slide when user starts swiping
        }, { passive: true });

        slideshowContainer.addEventListener('touchmove', (e) => {
            // e.preventDefault(); // Uncomment if you want to prevent vertical scrolling during horizontal swipe
        }, { passive: false });

        slideshowContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) { 
                if (diff > 0) { // Swiped left (show next slide)
                    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
                } else { // Swiped right (show previous slide)
                    currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length; 
                }
                showSlide(currentSlideIndex);
            }
            startSlideshowTimer(); // Restart auto-slide after user interaction ends
        });
    };

    // --- Hearts Rain Logic (NEW) ---
    const createFallingHeart = () => {
        const heart = document.createElement('span');
        heart.classList.add('falling-heart');
        heart.textContent = '❤️'; 
        
        // Randomize initial position, size, and animation duration
        heart.style.left = Math.random() * 100 + 'vw'; 
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's'; // 4 to 7 seconds
        heart.style.fontSize = (Math.random() * 1.5 + 1) + 'em'; // 1em to 2.5em
        heart.style.animationDelay = (Math.random() * 0.5) + 's'; // Stagger start slightly

        heartsContainer.appendChild(heart);

        // Remove heart after animation finishes to clean up DOM
        heart.addEventListener('animationend', () => {
            heart.remove();
        });
    };

    const startHeartsRain = () => {
        if (heartGenerationInterval) clearInterval(heartGenerationInterval);
        // Generate a heart every 300ms
        heartGenerationInterval = setInterval(createFallingHeart, 300); 
    };

    const stopHeartsRain = () => {
        clearInterval(heartGenerationInterval);
        // Remove all existing hearts from the DOM
        document.querySelectorAll('.falling-heart').forEach(heart => heart.remove());
    };

    // --- Phase 4 & 5: Final Message & The End Screen Logic ---
    const startFinalMessageSequence = () => {
        valentineMessage.classList.remove('hidden'); 

        // Hide message after a reading time (e.g., 15 seconds)
        setTimeout(() => {
            showScreen(theEndScreen); // Transition to the separate The End screen
            backgroundAudio.pause(); // Pause audio when The End screen is reached
            backgroundAudio.currentTime = 0; // Reset audio to start for next potential play
        }, 15000); // 15 seconds for reading the message
    };


    // --- Initial Setup Call ---
    setupNumberEntry(); // Initialize the number entry card
    showScreen(initialOverlay); // Make sure the first screen is visible on page load
});