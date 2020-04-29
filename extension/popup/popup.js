
chrome.storage.local.get(['state'], function(result) {
    let button = document.querySelector('button')
    if (result.state == 'on') {
        button.classList.add('btn-primary');
    } else if (result.state == 'off') {
        button.classList.add('btn-secondary') 
    }
    
    button.addEventListener('click', (elem) => {
        if (elem.target.classList[1] == 'btn-primary') {
            chrome.storage.local.set({state: "off"});
        } else if (elem.target.classList[1] == 'btn-secondary') {
            chrome.storage.local.set({state: "on"});
        }
    })
});


chrome.storage.onChanged.addListener(function(changes, namespace) {
    chrome.storage.local.get(['state'], function(result) {
        let button = document.querySelector('button')
        if (result.state == 'on') {
            button.classList.replace('btn-secondary', 'btn-primary');
        } else if (result.state == 'off') {
            button.classList.replace('btn-primary', 'btn-secondary') 
        }
    });
  });
        
