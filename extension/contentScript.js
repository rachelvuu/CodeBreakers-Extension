async function request() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}

main();

function main() {
    request()
        .then((spreadsheet) => {
            setTimeout(() => {
                let head = document.querySelector('head');
                let link = document.createElement('script');
                link.setAttribute('src', "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js?skin=desert")
                head.appendChild(link);
                let problemName = document.querySelector('div[data-cy="question-title"]');
                let problemNameText = problemName.textContent.split('.')[1].substring(1)
                let problemRow;
                for (let row of spreadsheet) {
                    if (row[0].toLowerCase() == problemNameText.toLowerCase()) {
                        problemRow = row
                        break;
                    }
                }
                let problemData = {};
                fetch(problemRow[5])
                    .then((response) => {
                        return response.text()
                    })
                    .then((data) => {
                        problemData['H1'] = problemRow[1]
                        problemData['H2'] = problemRow[2]
                        problemData['TS'] = problemRow[3]
                        problemData['VL'] = problemRow[4]
                        problemData['CS'] = data.substring(data.indexOf("class Solution:")).trim()
                        let videoID = '';
                        if (problemData.VL) videoID = problemData.VL.split('=')[1]
                        let titleBar = problemName.parentElement;
                        let div = document.createElement("div");
                        div.innerHTML = `
                        <div class="badge badge-info mt-2" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                        CodeBreakers Hints
                        </div>
                        
                        <div class="collapse" id="collapseExample">
                            <div class='mt-1'>
                                <div id="accordion">
                        
                                    <div class="card">
                                        <div class="card-header" id="headingOne" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                                            <h5 class="hint">
                                                    <div class='btn collapsed'>Hint 1</div>
                                                </h5>
                                        </div>
                                                
                                        <div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordion">
                                            <div class="card-body">
                                            ${problemData.H1}
                                            </div>
                                        </div>
                                    </div>
                        
                                    <div class="card">
                                        <div class="card-header" id="headingTwo" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                                            <h5 class="hint">
                                                <div class='btn collapsed'>Hint 2</div>
                                            </h5>
                                        </div>
                                        <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
                                            <div class="card-body">
                                            ${problemData.H2}
                                            </div>
                                        </div>
                                    </div>
                        
                                    <div class="card">
                                        <div class="card-header" id="headingThree" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                                            <h5 class="hint">
                                                <div class='btn collapsed'>Text Solution</div>
                                            </h5>
                                        </div>
                                        <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
                                            <div class="card-body">
                                            ${problemData.TS}
                                            </div>
                                        </div>
                                    </div>
                        
                                    <div class="card">
                                        <div class="card-header" id="headingFour" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                                            <h5 class="hint">
                                                <div class='btn collapsed'>Video Solution</div>
                                            </h5>
                                        </div>
                                        <div id="collapseFour" class="collapse" aria-labelledby="headingFour" data-parent="#accordion">
                                            <div class="card-body">
                                                <iframe src="https://www.youtube.com/embed/${videoID}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                            </div>
                                        </div>
                                    </div>
                        
                                    <div class="card">
                                        <div class="card-header" id="headingFive" data-toggle="collapse" data-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive">
                                            <h5 class="hint">
                                                <div class='btn collapsed'>Code Solution</div>
                                            </h5>
                                        </div>
                                        <div id="collapseFive" class="collapse" aria-labelledby="headingFive" data-parent="#accordion">
                                            <div class="card-body">
                                                <pre class=prettyprint>
${problemData.CS}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
            
                                    <div class="card">
                                        <div class="card-header" id="headingSix" data-toggle="collapse" data-target="#collapseSix" aria-expanded="false" aria-controls="collapseSix">
                                            <h5 class="hint">
                                                <div class='btn collapsed'>Feedback</div>
                                            </h5>
                                        </div>
                                        <div id="collapseSix" class="collapse" aria-labelledby="headingSix" data-parent="#accordion">
                                            <div class="card-body">
                                            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfJAcC7WSbjycRLkuYrEgn1HPHhysTCBTUR4GXAOV-6ZJMxeg/viewform?embedded=true&entry.1655678686=${problemNameText}" width="400" height="100" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
                                            </div>
                                        </div>
                                    </div>
            
                                </div>
                            </div>
                        </div>
                        `;
                        titleBar.append(div);
                    })
            }, 1000)
        })
}