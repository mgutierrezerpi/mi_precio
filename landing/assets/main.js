const header = document.querySelector('[data-header]');

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 12);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Render Lucide icons (loaded from CDN before this script).
const renderIcons = () => window.lucide?.createIcons();
renderIcons();

// FAQ accordion: keep one open at a time and swap the +/- icon.
const faqItems = document.querySelectorAll('.faq-list details');

const setFaqIcon = (item) => {
  const icon = item.querySelector('.faq-icon');
  if (icon) {
    icon.setAttribute('data-lucide', item.open ? 'minus' : 'plus');
  }
};

faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
    faqItems.forEach(setFaqIcon);
    renderIcons();
  });
});
