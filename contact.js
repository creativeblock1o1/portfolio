const loadingScreen = document.querySelector('#loadingScreen');
if (loadingScreen) {
    window.setTimeout(() => {
        loadingScreen.classList.add('is-dismissing');
        window.setTimeout(() => loadingScreen.remove(), 500);
    }, 5500);
}

document.querySelectorAll('.panini-read-less').forEach((button) => {
    button.addEventListener('click', () => {
        button.closest('details')?.removeAttribute('open');
    });
});

const workDetails = [...document.querySelectorAll('.work-detail')];
const setActiveWorkDetail = (hash) => {
    const activeDetail = hash.startsWith('#detail-')
        ? document.getElementById(hash.slice(1))
        : null;
    workDetails.forEach((detail) => {
        detail.classList.toggle('is-active', detail === activeDetail);
    });
};

setActiveWorkDetail(window.location.hash);
document.querySelectorAll('.work-sticker[href^="#detail-"], .work-controls a[href^="#detail-"], .work-controls a[href="#work"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const destination = link.getAttribute('href');
        history.pushState(null, '', destination);
        setActiveWorkDetail(destination);
    });
});
window.addEventListener('popstate', () => setActiveWorkDetail(window.location.hash));
