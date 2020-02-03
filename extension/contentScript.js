// temporary timeout. find better way to dynamically look for element
setTimeout(() => {
    let problemName = document.querySelector('div[data-cy="question-title"]');
    if (!problemName){
        setTimeout(() => {
            problemName = document.querySelector('div[data-cy="question-title"]');
        }, 1000);
    }
    chrome.runtime.sendMessage({problemName: problemName.innerHTML});
}, 1000); 

