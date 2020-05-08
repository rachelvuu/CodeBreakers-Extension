// for changeWindow function
const width  = window.innerWidth;
let expandedWindow = false;

chrome.storage.local.get(['state'], function(result) {
    if (result.state == 'on') {
        findElementAndStartMain();
    }
});

chrome.storage.onChanged.addListener(function() {
    location.reload();
  });


// Content script loads faster than rest of content, so we must wait for the page to load first.
function findElementAndStartMain() {
    let mainMutationObserver = new MutationObserver(function(mutations) {
        let problemNameElem = document.querySelector('div[data-cy="question-title"]');
            if (document.body.contains(problemNameElem)) {
                mainMutationObserver.disconnect();
                main();
            }
        });
        mainMutationObserver.observe(document, {
            attributes: false,
            characterData: false,
            childList: true,
            subtree: true,
            attributeOldValue: false,
            characterDataOldValue: false
        });
}

// Main function
async function main() {
    // Make request to spreadsheet
    let spreadsheet = await requestToSpreadSheet();
    // Find problem title
    let problemNameElem = document.querySelector('div[data-cy="question-title"]');
    let problemNameText = problemNameElem.textContent.split('.')[1].substring(1);
    // problemData is a map with keys as hint type and values as it's spreadsheet data
    let problemData = fillMapWithSpreadSheetValues(problemNameText, spreadsheet)
    
    // Replace the pure data from spreadsheet to the actual HTML
    for (let hint in problemData) {
        // The only point where the problemData object changes 
        problemData[hint] = await replaceSpreadsheetDataWithHTML(problemData, problemNameText, hint);
    }

    // Inject main button with complete data
    attachMainExpandingButton(problemData, problemNameText, problemNameElem);

    // Reattach main button in the event that it disappears when moving to the discuss tab
    let main2d = document.querySelector('div[class="main__2_tD"]');
    let mutationObserver = new MutationObserver(function(mutations) {
        let mainButton = document.querySelector('div[class="badge badge-info mt-2"]');
        if (mainButton == null && mutations.length == 2) {
            let problemNameElem = document.querySelector('div[data-cy="question-title"]');
            attachMainExpandingButton(problemData, problemNameText, problemNameElem);
        }
    });
    mutationObserver.observe(main2d, {
        attributes: false,
        characterData: true,
        childList: false,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
    });

}

// Make initial request to spreadsheet
async function requestToSpreadSheet() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}

// Create a map - problemData that holds the hint type => spreadsheet data
function fillMapWithSpreadSheetValues(problemNameText, spreadsheet) {
    let problemRow;
    // Match spreadsheet request data to problem title
    for (let row of spreadsheet) {
        if (row[0].toLowerCase() == problemNameText.toLowerCase()) {
            problemRow = row
            break;
        }
    }
    // Assign spreadsheet data to map
    let problemData = {};
    problemData['Hint 1'] = problemRow[1];
    problemData['Hint 2'] = problemRow[2];
    problemData['Text Solution'] = problemRow[3];
    problemData['Video Solution'] = problemRow[4];
    problemData['Code Solution'] = problemRow[5];
    return problemData;
}

// Replaces the value of entry problemData entry to the actual HTML that will be injected.
// Check problemData object structure for clarity.
async function replaceSpreadsheetDataWithHTML(problemData, problemNameText, hint) {
    let htmlOfHintType;

    // Different hint types require different HTML
    if (hint.includes('Hint') || hint.includes('Video')) {
        htmlOfHintType = handleHintOrVideo(problemNameText, problemData, hint);

    } else if (hint.includes('Text') || hint.includes('Code')) {
        htmlOfHintType = await handleTextOrCode(problemNameText, problemData, hint);
    }

    // Replace card title with Suggest it is a google form
    if (htmlOfHintType.includes('viewform')) {
        hint = 'Suggest a ' + hint.toLowerCase();
    }

    // Removes spaces from problemData keys for attribute names in html
    let hintNameForHTML = hint.replace(/ /g, '');    

    // Base HTML for a card body
    let cardBodyTemplate = `
    <div class="card">
    <div class="card-header" id="heading${hintNameForHTML}" data-toggle="collapse" data-target="#collapse${hintNameForHTML}" aria-expanded="false" aria-controls="collapse${hintNameForHTML}">
        <h5 class="hint">
            <div class='btn collapsed'>${hint}</div>
        </h5>
    </div>
    <div id="collapse${hintNameForHTML}" class="collapse" aria-labelledby="heading${hintNameForHTML}" data-parent="#accordion">
        <div class="card-body">
${htmlOfHintType}
        </div>
    </div>
    </div>    
    `;
    return cardBodyTemplate;
};

// If the dropdown is a hint or video, insert appropriate iframe, if empty insert appropriate google survey
function handleHintOrVideo(problemNameText, problemData, hint) {
    let htmlOfHintType;
    if (hint.includes('Hint')) {
        if (problemData[hint] != '') {
            htmlOfHintType = problemData[hint];
        } else {
            htmlOfHintType = `<iframe 
            src="https://docs.google.com/forms/d/e/1FAIpQLSdOaS2D3ew00d4POG3N88SeVWV8F8Q-JJ2G8maaV7pESFp5bw/viewform?embedded=true&entry.1655678686=${problemNameText}"width="400" height="1000" frameborder="0" marginheight="0" marginwidth="0" style="min-height: 600px" >Loading…</iframe>`;
        }
    } else if (hint.includes('Video')) {
        if (problemData[hint] != '') {
            htmlOfHintType = `<iframe src="https://www.youtube.com/embed/${problemData[hint].split('=')[1]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            htmlOfHintType = `<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfrHkiFyr5gRvvwf52T3TJQkUaU3PjB1zEsUXYFGxWw1dhpkA/viewform?embedded=true&entry.1655678686=${problemNameText}"width="400" height="1000" frameborder="0" marginheight="0" marginwidth="0" style="min-height: 600px" >Loading…</iframe>`;
        }
    }
    return htmlOfHintType;
};

// If the dropdown is text or code, make fetch request to url, format, and insert appropriate html, if empty insert appropriate google survey
async function handleTextOrCode(problemNameText, problemData, hint) {
    let htmlOfHintType;
    if (hint.includes('Text')) {
        let response = await fetch(problemData[hint]);
        if (response.status == 200) {
            let converter = new showdown.Converter();
            let textmd = await response.text();
            textmd = textmd.substring(textmd.indexOf('# Motivation'));
            let textHTML = converter.makeHtml(textmd);
            htmlOfHintType = textHTML;
        } else {
            htmlOfHintType = `<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdWUJVxpl2Z65M2MzG7J6oXf_cUBaZk3fcgzfZ-s_HI0-ieXg/viewform?embedded=true&entry.1655678686=${problemNameText}"width="400" height="1000" frameborder="0" marginheight="0" marginwidth="0" style="min-height: 600px" >Loading…</iframe>`;
        }
    } else if (hint.includes('Code')) {
        let response = await fetch(problemData[hint]);
        if (response.status == 200) {
            let code = await response.text()
            htmlOfHintType = `
                <button id="expandCode" type="button" class="btn btn-info mb-2 btn-block btn-lg">Expand Code Solution</button>
                <pre class=prettyprint>
${code.substring(code.indexOf("class Solution:")).trim()}
                </pre>
            `;
        } else {
            htmlOfHintType = `<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSf7Ki8cVl1Me9UhaWhs9CWWkInNsXUbXcNvax6mjO8dChv44A/viewform?embedded=true&entry.1655678686=${problemNameText}"width="400" height="1000" frameborder="0" marginheight="0" marginwidth="0" style="min-height: 600px" >Loading…</iframe>`;
        }
    }
    return htmlOfHintType;
}

// Creates main button, puts together all the card data, and injects it to the page
function attachMainExpandingButton(problemData, problemNameText, problemNameElem) { 
    let titleBar = problemNameElem.parentElement;
    let mainButton = document.createElement("div");
    mainButton.innerHTML = `
    <div class="badge badge-info mt-2" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
        CodeBreakers Hints
    </div>
    
    <div class="collapse" id="collapseExample">
        <div class='mt-1'>
            <div id="accordion">
                ${problemData['Hint 1']}
                ${problemData['Hint 2']}
                ${problemData['Text Solution']}
                ${problemData['Video Solution']}
                ${problemData['Code Solution']}
                ${generalGoogleForm(problemData, problemNameText)}
            </div>
        </div>
    </div>
    `;
    // Pretty code
    document.head.appendChild(document.createElement('script')).src = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?skin=desert';
    titleBar.append(mainButton);
    
    // Add button for expanding code in card if it exists
    let expandCodeButton = document.querySelector('#expandCode');
    if (expandCodeButton) expandCodeButton.addEventListener('click', changeWindow)
}

// Display the general google form if there is at least one valid hint from the spreadsheet
function generalGoogleForm(problemData, problemNameText) {
    // true if there is atleast one valid hint
    let displayGeneralGoogleForm = Object.values(problemData).some( (cardHTML) => !cardHTML.includes('viewform') )
    if (displayGeneralGoogleForm) {
        return  `
        <div class="card">
        <div class="card-header" id="headingSix" data-toggle="collapse" data-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
            <h5 class="hint">
                <div class='btn collapsed'>Feedback</div>
            </h5>
        </div>
        <div id="collapseSix" class="collapse" aria-labelledby="headingSix" data-parent="#accordion">
            <div class="card-body">
                <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfJAcC7WSbjycRLkuYrEgn1HPHhysTCBTUR4GXAOV-6ZJMxeg/viewform?embedded=true&entry.1655678686=${problemNameText}" width="400" height="1000" frameborder="0" marginheight="0" marginwidth="0" style="min-height: 600px" >Loading…</iframe>
            </div>
        </div>
        </div>
        ` 
    } else {
        return ''
    }
}

// Listener for expand button in the code section
function changeWindow() {
    let windowSlider = document.querySelector('div[class="side-tools-wrapper__1TS9"]');
    // expands to 3/5 width
    if (!expandedWindow) {
        windowSlider.setAttribute('style', `overflow: hidden; flex: 0 1 ${Math.ceil(width * 3/5)}px`);
    // contracts to 4.5/10 width
    } else { 
        windowSlider.setAttribute('style', `overflow: hidden; flex: 0 1 ${Math.ceil(width * 45/100)}px`);
    }
    expandedWindow = !expandedWindow;
}