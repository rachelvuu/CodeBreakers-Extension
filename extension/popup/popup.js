
chrome.storage.local.get(['state'], function(result) {
    let button = document.querySelector('button')
    if (result.state == 'on') {
        button.classList.add('btn-secondary');
        button.innerText = 'Disable Hints'
    } else if (result.state == 'off') {
        button.classList.add('btn-primary') 
        button.innerText = 'Enable Hints'
    }
    
    button.addEventListener('click', (elem) => {
        if (elem.target.classList[2] == 'btn-secondary') {
            chrome.storage.local.set({state: "off"});
        } else if (elem.target.classList[2] == 'btn-primary') {
            chrome.storage.local.set({state: "on"});
        }
    })
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get(['state'], function(result) {
        let button = document.querySelector('button')
        if (result.state == 'on') {
            button.classList.replace('btn-primary', 'btn-secondary')
            button.innerText = 'Disable Hints'
        } else if (result.state == 'off') {
            button.classList.replace('btn-secondary', 'btn-primary');
            button.innerText = 'Enable Hints' 
        }
    });
  });
        
