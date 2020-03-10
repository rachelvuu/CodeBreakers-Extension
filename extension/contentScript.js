async function request() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}

main();

function main() {
    request().then((value) => {
        setTimeout(() => {
            let problemName = document.querySelector('div[data-cy="question-title"]');
            if (!problemName) {
                setTimeout(() => {
                    problemName = document.querySelector('div[data-cy="question-title"]');
                }, 1000);
            }
            let problemNameText = problemName.textContent.split('.')[1].substring(1)
            let problemData = {}
            for (let row of value) {
                if (row[0].toLowerCase() == problemNameText.toLowerCase()) {
                    problemData['H1'] = row[1]
                    problemData['H2'] = row[2]
                    problemData['TS'] = row[3]
                    problemData['VL'] = row[4]
                    problemData['CS'] = row[5]
                }
            }
            let videoID = ''
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
                                <code id='code-solution'>
                                <pre>
${problemData.CS}
                                </pre>
                                </code>
                            </div>
                        </div>
                    </div>
                    
                    </div>
                </div>
            </div>
            `;
            titleBar.append(div);
        }, 1000);
    })
}