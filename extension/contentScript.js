// temporary timeout. find better way to dynamically look for element
setTimeout(function(){
    let problemName = document.querySelector('div[data-cy="question-title"]');
    if (problemName) chrome.runtime.sendMessage({problemName: problemName.innerHTML});
}, 1000); 

