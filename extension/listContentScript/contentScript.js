setTimeout(main, 1000);

async function main() {

    // let spreadsheet = await requestToSpreadSheet();
    // let cbSolutionMap = {};
    // for (let i = 1; i < spreadsheet.length; i++) {
    //     if (spreadsheet[i].length == 9 && spreadsheet[i][8].toLowerCase().trim() == 'yes') {
    //         cbSolutionMap[spreadsheet[i][0]] = 'yes';
    //     } else {
    //         cbSolutionMap[spreadsheet[i][0]] = 'no';
    //     }
    // }

    let mutationObserver = new MutationObserver(function(mutations) {
        console.log(mutations);
    });

    let table = document.querySelector('tbody[class=reactable-data]');
    mutationObserver.observe(table, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });



   

    // add to heading
    // let tableHeader = document.querySelector('tr[class=reactable-column-header]');
    // let cbHeading = document.createElement('th')
    // cbHeading.setAttribute('role', 'button');
    // cbHeading.setAttribute('tabindex', '0');
    // cbHeading.innerHTML = "<strong>CodeBreakers</strong>";
    // tableHeader.insertBefore(cbHeading, tableHeader.childNodes[3]);
    
    
    // let table = document.querySelector('tbody[class=reactable-data]');
    // let cbLogo = chrome.extension.getURL("../images/cblogo.png");

    // for (let problem of table.children) {
    //     let problemName = problem.children[2].firstChild.firstChild.firstChild.textContent;
    //     if (cbSolutionMap[problemName] && cbSolutionMap[problemName] == 'yes') {
    //         let cbColumn = document.createElement('td');
    //         cbColumn.innerHTML = `<span><img class="cbSolution" src="${cbLogo}" height=20 width=20></span>`;
    //         problem.insertBefore(cbColumn, problem.childNodes[3])
    //     } else {
    //         let cbColumn = document.createElement('td');
    //         cbColumn.innerHTML = `<span></span>`;
    //         problem.insertBefore(cbColumn, problem.childNodes[3])  
    //     }

    // }
}




// Make initial request to spreadsheet
async function requestToSpreadSheet() {
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/1tnGJ2eI1SkpJJMcmYfnjsW-yeGcQaf251eJgiJLC6Qo/values/Sheet1?key=AIzaSyCjjXAOcyX1Q-RzzXwg3h5-sM_JaiBDk68");
    const json = await response.json();
    return json.values;
}
