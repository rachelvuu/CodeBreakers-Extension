setTimeout(main, 1000);

async function main() {

    let spreadsheet = await requestToSpreadSheet();
    let cbSolutionMap = {};
    for (let i = 1; i < spreadsheet.length; i++) {
        if (spreadsheet[i].length == 9 && spreadsheet[i][8].toLowerCase().trim() == 'yes') {
            cbSolutionMap[spreadsheet[i][0]] = 'yes';
        } else {
            cbSolutionMap[spreadsheet[i][0]] = 'no';
        }
    }

    addToHeading();
    addToColumns(cbSolutionMap);

    let mutationObserver = new MutationObserver(function(mutations) {
        mutations.forEach((mutation) => {
            if (mutation.type == 'attributes') {
                if (mutation.target == document.querySelector('a[class="reactable-page-button reactable-current-page"]') ||
                    mutation.target == document.querySelector('span[id="frequency-tooltip"]')) {
                    if (mutation.target == document.querySelector('span[id="frequency-tooltip"]')) {
                        if (!document.querySelector('th[id="codeBreakersHeading"]')) {
                            addToHeading();
                        }
                    }
                    if (!document.querySelector('img[class="cbSolution"]')) {
                        addToColumns(cbSolutionMap);
                    }
                }
            }
        })

    });

    let table = document.querySelector('div[class="question-list-base"]');
    mutationObserver.observe(table, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
}



function addToHeading() {
    let tableHeader = document.querySelector('tr[class=reactable-column-header]');
    let cbHeading = document.createElement('th');
    cbHeading.setAttribute('id', 'codeBreakersHeading');
    cbHeading.setAttribute('role', 'button');
    cbHeading.setAttribute('tabindex', '0');
    cbHeading.innerHTML = "<strong>CodeBreakers</strong>";
    tableHeader.insertBefore(cbHeading, tableHeader.childNodes[3]);
}

function addToColumns(cbSolutionMap) {
    let tableData = document.querySelector('tbody[class=reactable-data]');
    let cbLogo = chrome.extension.getURL("../images/cblogo.png");
    for (let problem of tableData.children) {
        let problemName = problem.children[2].firstChild.firstChild.firstChild.textContent;
        if (cbSolutionMap[problemName] && cbSolutionMap[problemName] == 'yes') {
            let cbColumn = document.createElement('td');
            cbColumn.innerHTML = `<span><img class="cbSolution" src="${cbLogo}" height=20 width=20></span>`;
            problem.insertBefore(cbColumn, problem.childNodes[3])
        } else {
            let cbColumn = document.createElement('td');
            cbColumn.innerHTML = `<span></span>`;
            problem.insertBefore(cbColumn, problem.childNodes[3])  
        }

    }
}

// Make initial request to spreadsheet
async function requestToSpreadSheet() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}
