const entries = document.querySelectorAll("ol li");
const titles = document.querySelectorAll("h3");

let checked = JSON.parse(localStorage.getItem('checked')) || {};
console.log(checked);

for(let entry of entries) {
    const key = entry.innerText.toLowerCase();
    if(checked[key] === true) {
        entry.classList.add('disabled');
    }
}

for(let entry of entries) {
    entry.addEventListener("click", (e) => {
        const key = e.target.innerText.toLowerCase();
        console.log(key);

        let disabled = false;
        if(checked.hasOwnProperty(key)) {
            disabled = checked[key];
        }

        disabled = !disabled;
        if(disabled) {
            e.target.classList.add('disabled');
        }
        else {
            e.target.classList.remove('disabled');
        }

        checked[key] = disabled;

        localStorage.setItem('checked', JSON.stringify(checked));
    })
}

for(let title of titles) {
    title.addEventListener("click", (e) => {
        alert(e.target.getAttribute('data-info'));
        console.log(e.target);
    })
}