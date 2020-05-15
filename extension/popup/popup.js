//  get state right away
chrome.storage.local.get(['state'], function(result) {
    let button = document.querySelector('button')
    let p = document.querySelector('p');
    if (result.state == 'on') {
        button.classList.add('btn-secondary');
        button.innerText = 'Click to Disable Hints'
        p.innerHTML = 'Hints are <span class="on">Enabled<span>'
    } else if (result.state == 'off') {
        button.classList.add('btn-primary') 
        button.innerText = 'Click to Enable Hints'
        p.innerHTML = 'Hints are <span class="off">Disabled<span>'
    }
    
    // add event listener to change state on click
    button.addEventListener('click', (elem) => {
        if (elem.target.classList[2] == 'btn-secondary') {
            chrome.storage.local.set({state: "off"});
        } else if (elem.target.classList[2] == 'btn-primary') {
            chrome.storage.local.set({state: "on"});
        }
    })
});

// on state change, change button appearance
chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get(['state'], function(result) {
        let button = document.querySelector('button')
        let p = document.querySelector('p');
        if (result.state == 'on') {
            button.classList.replace('btn-primary', 'btn-secondary')
            button.innerText = 'Click to Disable Hints'
            p.innerHTML = 'Hints are <span class="on">Enabled<span>'
        } else if (result.state == 'off') {
            button.classList.replace('btn-secondary', 'btn-primary');
            button.innerText = 'Click to Enable Hints' 
            p.innerHTML = 'Hints are <span class="off">Disabled<span>'
        }
    });
  });

