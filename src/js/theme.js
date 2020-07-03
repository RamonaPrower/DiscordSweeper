const toggle = document.querySelector('.theme input');
const toggleSpan = document.querySelector('#checkBoxImg');
function switchTheme(tog) {
    if (tog.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleSpan.innerHTML = '<i class="far fa-lightbulb"></i>';
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        toggleSpan.innerHTML = '<i class="fas fa-lightbulb"></i>';
    }
}
toggle.addEventListener('change', switchTheme, false);
const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light';
if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'dark') {
        toggle.checked = true;
        toggleSpan.innerHTML = '<i class="far fa-lightbulb"></i>';
    }
    else {
        toggleSpan.innerHTML = '<i class="fas fa-lightbulb"></i>';
    }
}
