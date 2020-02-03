let problemName = document.querySelector('div[data-cy="question-title"]').innerHTML;
chrome.runtime.sendMessage({problemName: problemName});