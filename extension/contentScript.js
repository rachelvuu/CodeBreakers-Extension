// for changeWindow
const width  = window.innerWidth;
let expandedWindow = false;
console.log(innerWidth);

// content script loads faster than rest of content, so we must wait for the page to load first.
setTimeout(main, 1000);

async function requestToSpreadSheet() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}

function changeWindow() {
    let windowSlider = document.querySelector('div[class="side-tools-wrapper__1TS9"]');
    // expands to 3/5 width
    if (!expandedWindow) {
        windowSlider.setAttribute('style', `overflow: hidden; flex: 0 1 ${Math.ceil(width * 3/5)}px`);
    // contracts to 1/2 width
    } else { 
        windowSlider.setAttribute('style', `overflow: hidden; flex: 0 1 ${Math.ceil(width * 45/100)}px`);
    }
    expandedWindow = !expandedWindow;
}

// Replaces the value of entry problemData entry to the actual HTML that will be injected.
// Check problemData object structure for clarity.
async function insertCardBody(problemData, hint) {
    let htmlOfHintType;

    // Different hint types require different HTML
    if (hint.includes('Hint')) {
        htmlOfHintType = problemData[hint];
    } else if (hint.includes('Text')) {
        htmlOfHintType = problemData[hint];
    } else if (hint.includes('Video')) {
        htmlOfHintType = `
            <iframe src="https://www.youtube.com/embed/${problemData[hint].split('=')[1]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;
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
        }
    }

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
}

async function main() {
    // Make request to spreadsheet
    let spreadsheet = await requestToSpreadSheet();
    // find problem title
    let problemNameElem = document.querySelector('div[data-cy="question-title"]');
    let problemNameText = problemNameElem.textContent.split('.')[1].substring(1)
    let problemRow;
    // match spreadsheet request data to problem title
    for (let row of spreadsheet) {
        if (row[0].toLowerCase() == problemNameText.toLowerCase()) {
            problemRow = row
            break;
        }
    }
    // assign spreadsheet data to hash
    let problemData = {};
    problemData['Hint 1'] = problemRow[1]
    problemData['Hint 2'] = problemRow[2]
    problemData['Text Solution'] = problemRow[3]
    problemData['Video Solution'] = problemRow[4]
    problemData['Code Solution'] = problemRow[5]
    
    for (let hint in problemData) {
        problemData[hint] = await insertCardBody(problemData, hint);
    }

//     // remove pairs that have empty values (no data in column for that row)
//     Object.keys(problemData).forEach(key => problemData[key] == '' ? delete problemData[key] : {});
//     let htmlContent = ['','','','',''];
//     // populate appropriate amt of html content based on how many filled in cells there are 
//     for (let i = 0; i < Object.keys(problemData).length; i++) {
//         let key = Object.keys(problemData)[i]
//         let currentHint;
//         if (key.includes("Video")) {
//             currentHint = `
//                 <div class="card">
//                     <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
//                         <h5 class="hint">
//                             <div class='btn collapsed'>${key}</div>
//                         </h5>
//                     </div>
//                     <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
//                         <div class="card-body">
//                             <iframe src="https://www.youtube.com/embed/${problemData[key].split('=')[1]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
//                         </div>
//                     </div>
//                 </div>
//             `
//         } else if (key.includes("Code")) {
//             let response = await fetch(problemData[key]);
//             if (response.status == 200) {
//                 let data = await response.text()  
//                     currentHint = `
//                         <div class="card">
//                             <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
//                                 <h5 class="hint">
//                                     <div class='btn collapsed'>${key}</div>
//                                 </h5>
//                             </div>
//                             <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
//                                 <div class="card-body">
//                                     <button id="expandCode" type="button" class="btn btn-info mb-2 btn-block btn-lg">Expand Code Solution</button>
//                                     <pre class=prettyprint>
// ${data.substring(data.indexOf("class Solution:")).trim()}
//                                     </pre>
//                                 </div>
//                             </div>
//                         </div>
//                     `
//             } else {
//                 currentHint = '';
//             }
//         } else {
//             currentHint = `
//                 <div class="card">
//                     <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
//                         <h5 class="hint">
//                             <div class='btn collapsed'>${key}</div>
//                         </h5>
//                     </div>
//                     <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
//                         <div class="card-body">
//                         ${problemData[key]}
//                         </div>
//                     </div>
//                 </div>
//             `
//         }
//         htmlContent[i] = currentHint
//     }


    let titleBar = problemNameElem.parentElement;
    let div = document.createElement("div");
    div.innerHTML = `
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

            </div>
        </div>
    </div>
    `;
    // pretty code
    document.head.appendChild(document.createElement('script')).src = 'https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?skin=desert'
    titleBar.append(div);

    let expandCodeButton = document.querySelector('#expandCode');
    expandCodeButton.addEventListener('click', changeWindow);
}
