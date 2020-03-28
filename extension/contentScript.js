async function request() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}
main();

function changeWindow() {
    let windowSlider = document.querySelector('div[class="side-tools-wrapper__1TS9"]');
    windowSlider.setAttribute('style', 'overflow: hidden; flex: 0 1 900px');
}

async function main() {
    // make request to spreadsheet
    let spreadsheet = await request();
    // find problem title
    let problemName = document.querySelector('div[data-cy="question-title"]');
    let problemNameText = problemName.textContent.split('.')[1].substring(1)
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
    // remove pairs that have empty values (no data in column for that row)
    Object.keys(problemData).forEach(key => problemData[key] == '' ? delete problemData[key] : {});
    let htmlContent = ['','','','',''];
    // populate appropriate amt of html content based on how many filled in cells there are 
    for (let i = 0; i < Object.keys(problemData).length; i++) {
        let key = Object.keys(problemData)[i]
        let currentHint;
        if (key.includes("Video")) {
            currentHint = `
                <div class="card">
                    <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                        <h5 class="hint">
                            <div class='btn collapsed'>${key}</div>
                        </h5>
                    </div>
                    <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                        <div class="card-body">
                            <iframe src="https://www.youtube.com/embed/${problemData[key].split('=')[1]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            `
        } else if (key.includes("Code")) {
            let response = await fetch(problemData[key]);
            let data = await response.text()  
                currentHint = `
                    <div class="card">
                        <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                            <h5 class="hint">
                                <div class='btn collapsed'>${key}</div>
                            </h5>
                        </div>
                        <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                            <div class="card-body">
                                <pre class=prettyprint>
${data.substring(data.indexOf("class Solution:")).trim()}
                                </pre>
                            </div>
                        </div>
                    </div>
                `
        } else {
            currentHint = `
                <div class="card">
                    <div class="card-header" id="heading${i}" data-toggle="collapse" data-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                        <h5 class="hint">
                            <div class='btn collapsed'>${key}</div>
                        </h5>
                    </div>
                    <div id="collapse${i}" class="collapse" aria-labelledby="heading${i}" data-parent="#accordion">
                        <div class="card-body">
                        ${problemData[key]}
                        </div>
                    </div>
                </div>
            `
        }
        htmlContent[i] = currentHint
    }
    let titleBar = problemName.parentElement;
    let div = document.createElement("div");
    div.innerHTML = `
    <link rel="stylesheet" type="text/css" href="prettify.css">
    <script type="text/javascript" src="prettify.js"></script>
    <div class="badge badge-info mt-2" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
        CodeBreakers Hints
    </div>
    
    <div class="collapse" id="collapseExample">
        <div class='mt-1'>
            <div id="accordion">
                ${htmlContent[0]}
                ${htmlContent[1]}
                ${htmlContent[2]}
                ${htmlContent[3]}
                ${htmlContent[4]}
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
}
