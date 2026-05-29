// Landing Page JavaScript
// Extracted from landing/index.html.erb for better Rails organization

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", (event) => {
  // Mobile menu with hamburger animation
  const initMobileMenu = () => {
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', () => {
        // Toggle menu visibility
        mobileMenu.classList.toggle('hidden');
        // Toggle hamburger animation
        menuButton.classList.toggle('active');
      });
      
      // Close menu when clicking on a link
      const menuLinks = mobileMenu.querySelectorAll('a');
      menuLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenu.classList.add('hidden');
          menuButton.classList.remove('active');
        });
      });
    }
  };
  
  // Initialize mobile menu
  initMobileMenu();
  // register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, ScrambleTextPlugin, SplitText);
  
  // Match media accessibility for reduce motion
  let mm = gsap.matchMedia();

  mm.add({
    isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
    isMobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  }, (context) => {
    let { isMobile, isDesktop } = context.conditions;

    // HERO ON LOAD ANIMATION
    // Hero image scale + fade in
    gsap.fromTo(
      ".hero_visuals",
      { scale: 1.05, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 4,
        ease: "power4.out"
      }
    );

    // SPLIT TEXT ANIMATION WITH GSAP SPLITTEXT
    const split = new SplitText(".hero-title", { type: "chars" });

    // Set initial opacity to 0 for all characters
    gsap.set(split.chars, { opacity: 0 });

    // Animate characters in
    gsap.to(split.chars, {
      opacity: 1,
      duration: 1,
      stagger: {
        each: 1 / split.chars.length,
        from: "random"
      },
      ease: "power2.out"
    });
    // END HERO on load ANIMATION

    // TEXT FADING IN ANIMATION ON SCROLL
    document.querySelectorAll('[animation-container="text-fade-in"]').forEach(container => {
      container.querySelectorAll('[animation-element="text-fade-in"]').forEach(el => {
        const split = new SplitText(el, { type: "words,chars" });
        const totalChars = split.chars.length;
        const staggerTime = 1 / totalChars;  // Total duration divided by number of characters for stagger

        gsap.fromTo(
          split.chars,
          { opacity: 0.1 },
          {
            opacity: 1,
            ease: "none",
            stagger: staggerTime, // Set stagger based on the total time and number of characters
            duration: 1, // Total duration for all characters
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 20%",
              once: true
            }
          }
        );
      });
    });
    // END TEXT FADING IN ANIMATION ON SCROLL

    // MARQUEE
    gsap.to(".marquee_inner-wrapper", {
      x: isMobile ? "-16vw" : "-8vw",  // matchmedia query for mobile
      scrollTrigger: {
        trigger: ".section_vision",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.3,
        markers: false
      },
      transformOrigin: "50% 50%",  // optional: make sure it animates from center
      force3D: true                // optional: force GPU acceleration
    });
    // END MARQUEE

    // VISION PIN/SCRUB ANIMATION
    // Split the text of the h2 element
    const h2Element = document.querySelector(".vision_overlay-text");
    if (h2Element) {
      const splitText = new SplitText(h2Element, { type: "words,chars" });
      const chars = splitText.chars;

      // Set initial opacity to 0 for all characters
      gsap.set(chars, { opacity: 0 });

      gsap.set(".vision_image-wrapper.is-image-large", {
        width: isMobile ? "50vw" : "36vw",
        height: isMobile ? "60vh" : "80vh"
      });

      // Create a single timeline (no media queries)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".vision_content-bottom",
          start: "top top",
          end: "bottom 60%",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          markers: false
        }
      });

      // Animate the image wrapper and groups
      tl.to(".vision_image-wrapper.is-image-large", {
        width: "100vw",
        height: "100vh",
        borderRadius: "0px",
        x: isMobile ? "-25vw" : "-32vw",
        ease: "power2.inOut"
      }, 0)
      .to(".vision_image-group-left", {
        x: isMobile ? "-25vw" : "-32vw",
        ease: "power2.inOut"
      }, 0)
      .to(".vision_image-group-right", {
        x: isMobile ? "25vw" : "32vw",
        ease: "power2.inOut"
      }, 0);

      // Character animation that plays/reverses on scroll (non-scrubbing)
      gsap.timeline({
        scrollTrigger: {
          trigger: ".vision_content-bottom",
          start: "center 48%",
          end: "bottom bottom",
          toggleActions: "play none reverse none",
          markers: false
        }
      })
      .to(chars, {
        opacity: 1,
        duration: 1.5,
        stagger: {
          each: 1 / chars.length,
          from: "random"
        },
        ease: "power2.out"
      });
    }

    // Refresh ScrollTrigger on window resize
    window.addEventListener("resize", () => {
      ScrollTrigger.refresh();
    });
    // END VISION PIN/SCRUB ANIMATION

    // TEXT SCRAMBLE INTO VIEW
    // Animate numbers on scroll using ScrambleText
    document.querySelectorAll('.stats_number').forEach(el => {
      const finalValue = el.textContent.trim();

      // Clear the initial value
      gsap.set(el, { textContent: "0" });

      // ScrollTrigger to fire when element is in view
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            duration: 2,
            scrambleText: {
              text: finalValue,
              chars: "0123456789",
              revealDelay: 0.3
            },
            ease: "power2.out"
          });
        }
      });
    });
    // END TEXT SCRAMBLE INTO VIEW

    // DRAGGABLE CTA ANIMATION
    document.querySelectorAll('#container-draggable .commerce-icon.draggable').forEach((el, index) => {
      // Set initial opacity and scale using GSAP (no need for random positioning anymore)
      gsap.set(el, {
        opacity: 0,  // Start with opacity 0
        scale: 0.9,  // Start with scale 0.9
        rotation: gsap.utils.random(-20, 20)  // Optional: add random rotation for variety
      });

      // Create timeline for the appearance animation
      const appearTimeline = gsap.timeline({ paused: true });

      appearTimeline.to(el, {
        opacity: 1, // Fade in to opacity 1
        scale: 1,   // Scale up to normal size
        rotation: gsap.utils.random(-20, 20), // Random rotation for variety
        duration: 1, // Duration of the appearance animation
        ease: "back.out(1.7)" // Bounce ease for that small bounce effect
      });

      // ScrollTrigger to start the animation when the container comes into view
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.delayedCall(index * 0.2, () => { // Staggered start for each element
            appearTimeline.play();
          });

          // Re-enable Draggable after the animation starts
          Draggable.create(el, {
            bounds: "#container-draggable",
            inertia: true,
            type: "x,y",
            edgeResistance: 0.65,
            throwProps: true,
            zIndexBoost: false
          });
        }
      });
    });
    // END DRAGGABLE CTA ANIMATION

    // END matchMedia
  });
  // end gsap code...
});