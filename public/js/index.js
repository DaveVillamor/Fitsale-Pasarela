const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme');
if (currentTheme == 'dark') {
    document.body.classList.toggle('dark-theme');
}
else if (currentTheme == 'light') {
    document.body.classList.toggle('light-theme');
}
else if (prefersDarkScheme.matches) {
    document.body.classList.toggle('dark-theme');
}
function switchTheme(e) {
    if (e.target.checked) {
        document.body.classList.replace('light-theme', 'dark-theme');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.body.classList.replace('dark-theme', 'light-theme');
        localStorage.setItem('theme', 'light');
    }
}
document.getElementById('switch-theme').addEventListener('change', switchTheme, false);


