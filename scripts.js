// Globals
var pokemonList = [];
var nameList = [];
var changeList = [];
let originalTableData;
const NUM_COLUMNS = 16;
const NUM_ROWS = 5;
const END_OF_MONS = 883;
let round = 0;

document.addEventListener("DOMContentLoaded", function(event) { 
  // read input and build pokemon data table
  $("#input").on("change", function(e) {
    var file = e.target.files[0];
    // input canceled, return
    if (!file) return;
    var FR = new FileReader();
    FR.onload = function(e) {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, {
        type: 'array'
      });
      // sheet 1 - pokemon + brains
      var firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // header: 1 instructs xlsx to create an 'array of arrays'
      var result = XLSX.utils.sheet_to_json(firstSheet, {
        header: 1
      });
      // create body
      var tableLocation;
      try {
        tableLocation = document.getElementById('output_table');
      } catch (error) {
        if(tableLocation===null || tableLocation === ""){
          console.log("Table location div not found error");
        }
      }
      // create table
      originalTableData = result;
      const tbl = createTable(result);
      hideInput();
      hideLateRounds();

      if(document.getElementById('viewIndicator4')){
        document.getElementById('viewIndicator4').className='highlight-red';
      }
      if(document.getElementById('viewIndicator1')){
        document.getElementById('viewIndicator1').className='highlight-red';

      }
      if(document.getElementById('viewIndicatorAll')){
        document.getElementById('viewIndicatorAll').className='highlight-green';
      }
      tableLocation.appendChild(tbl);
    }
    FR.readAsArrayBuffer(file);
  });
  
  const tipButton = document.getElementById('tipButton');
  if(tipButton){
    tipButton.addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
        document.getElementById('tipButton').innerHTML = "Show Tips on Scientist Quotes";
      } else {
        content.style.display = "block";
        document.getElementById('tipButton').innerHTML = "Hide Tips on Scientiest Quotes";
      }
    });
  }

  const dataButton = document.getElementById('dataButton');
  if(dataButton){
    dataButton.addEventListener("click", function() {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
        document.getElementById('dataButton').innerHTML = "Show Each Category's Exact Moves";
      } else {
        content.style.display = "block";
        document.getElementById('dataButton').innerHTML = "Hide Each Category's Exact Moves";
      }
    });
  }
  const nolandFloat = document.getElementById('nolandFloat');
  if(nolandFloat){
    nolandFloat.style.display = 'block';
  }

  const brainButton = document.getElementById('brainButton');
  const nolandPic = document.getElementById('noland_img');
  const nolandWarning = nolandPic.nextElementSibling;
  if(brainButton){
    brainButton.addEventListener("click", function() {
      var tableContent = brainButton.nextElementSibling;
      if(tableContent && nolandPic && nolandWarning){
        if (tableContent.style.display === "block") {
          tableContent.style.display = "none";
          nolandPic.style.display = "none";
          nolandWarning.style.display = "none";
          brainButton.innerHTML = "Show Noland Details";
        } else {
          tableContent.style.display = "block";
          nolandPic.style.display = "block";
          nolandWarning.style.display = "block";
          brainButton.innerHTML = "Hide Noland Details";
        }
      }
    });
  }

  

  let searchInput = document.getElementById("pokemon_search");
  let clearInput = document.getElementById("pokemon_clear");
  let checkInput = document.getElementById("pokemon_check");
  if(searchInput){
    autocomplete(document.getElementById("pokemon_search"), nameList);
  }
  if(clearInput){
    autocomplete(document.getElementById("pokemon_clear"), nameList);
  }
  if(checkInput){
    autocomplete(document.getElementById("pokemon_check"), nameList);
  }
});


// pokemon search function
function findPokemon() {
	removeButtonShadow('findButton');
  const searchBlock = document.getElementById('pokemon_search');
  if(searchBlock){
  	let pokeSearchString = searchBlock.value;
  	if(pokeSearchString==="" || !pokeSearchString){
  		return alert("empty input");  
  	}
	  pokeSearchString = pokeSearchString.toLowerCase();
    const pokeTableQueryString = '.' + pokeSearchString;
    
    let allMonRows = document.querySelectorAll('tr' + pokeTableQueryString); // returns all rows
    const tableBody = document.querySelector('.pokemonDisplay > tbody');
    if(allMonRows){
      allMonRows.forEach(pokemonSearchedRow => {
        // only move rows if they arent in view
        // moves only first instance
        if(!isElementInViewport({el: pokemonSearchedRow})){
          var row = pokemonSearchedRow;
          tableBody.insertBefore( row, tableBody.firstElementChild ); 
        }
        
      });
    }
  }
}

function clearPokemon() {
	removeButtonShadow('clearButton');
  const clearBlock = document.getElementById('pokemon_clear');
  if(clearBlock){
    let pokeSearchString = clearBlock.value;
    if(pokeSearchString==="" || !pokeSearchString){
			return alert("empty input");
    }
    alert("removing "+pokeSearchString+" from table");
    pokeSearchString = pokeSearchString.toLowerCase();
    const pokeTableQueryString = '.' + pokeSearchString;
    // search for each instance of mon ? or ask for it in input
    // just add mon and check if more exist lol
    // scroll to row using autoScroll()
    let monInstance = 1;
    if(pokeTableQueryString){
      changeList.forEach(element => {
        if(element===pokeSearchString){
          monInstance+=1;
        }
      });
      changeList.push(pokeSearchString);// no need to track instance, raw count will do
      const cells = document.getElementsByClassName(pokeSearchString+monInstance);
      var cellsArr = Array.prototype.slice.call( cells );
      cellsArr.forEach(cell => {
        cell.className = pokeSearchString + monInstance + ' redLineTable'; // red out removed mons, DONT remove them I think 
        //cell.style.display='none';
      });
    }
  }
  
  
}


function resetTable() {
	removeButtonShadow('resetButton');
  round = 0;
  // clear the removal styling
  let queryChangeString = document.querySelectorAll('.redLineTable');
  if(queryChangeString){
    var cellsArr = Array.prototype.slice.call( queryChangeString );
    cellsArr.forEach(cell => {
      let originalMonClass = cell.className;
      originalMonClass = originalMonClass.substring( 0, originalMonClass.indexOf( "redLineTable" )-1 ); // -1 for the period
      changeList = changeList.filter(a => a !== originalMonClass);
      cell.className = originalMonClass; // remove redLineTable class modifier
    });
  }
  //re-organize by 
  // 0-15, 16-31, 32-47
  const tableLocation = document.getElementById('output_table');
  tableLocation.removeChild(tableLocation.firstElementChild);
  const newTable = createTable(originalTableData);
  tableLocation.appendChild(newTable);
  revealEarlyRounds();
  revealLateRounds();
  //document.getElementById('viewIndicatorAll').style.color='green';
  document.getElementById('viewIndicatorAll').className='highlight-green';
  //document.getElementById('viewIndicator1').style.color='red';
  document.getElementById('viewIndicator1').className='highlight-red';
 // document.getElementById('viewIndicator4').style.color='red';
  document.getElementById('viewIndicator4').className='highlight-red';
  // below is unecessary with new code and roundIterator()
  if (confirm("Would you like to hide the mons from later rounds?")){
    hideLateRounds();
    //document.getElementById('viewIndicatorAll').style.color='red';
    document.getElementById('viewIndicatorAll').className='highlight-red';
    //document.getElementById('viewIndicator1').style.color='green';
    document.getElementById('viewIndicator1').className='highlight-green';
}
  document.getElementById('iteratorLabel').innerText = 'Round 0!! Click here when you start the game!';
  
}
function createTable(result) {
  let internalResult = result;
  const tbl = document.createElement('table');
  tbl.className = "table pokemonDisplay";
  var headers;
  var counter = 0;
  if (result !== "Sorry no data found") {
    // parse listSorted for pkmn data
    headers = result.at(0); // prevents moving down the list each time you click reset
    while (result[counter] && counter!==END_OF_MONS) {
      // 373 -> 882 is open level
      var row = tbl.insertRow(counter);
      // ignore headers - deal w each pokemon here
      let pkmnData = result[counter] || "";
      pokemonList.push(pkmnData);
      let pokeIndex = pkmnData[0] || "";
      let pkmnName = pkmnData[1] || "";
      let pkmnInstance = pkmnData[2] || "";
      //nature[3], item[4], move 1-4[5][6][7][8], ability[9], ev[10], 100stats[11], 100speed[12], 50 stats[13], 50 speed[14], Brains Fixed IVs[15]
      let className = '';
      if(counter<=372){
        row.className = "roundsOneTwoThree ";
      }else{
        row.className = "rounds4AndOn ";
      }
      row.className += pkmnName.toLowerCase() + " row";
      
      className += " " + pkmnName.toLowerCase() + pkmnInstance;
      for (let g = 0; g < NUM_COLUMNS; g++) {
        if(g >= 5 && g <=8){
          // categorizeMove() - function to assign category to applicable moves, will also need to tally categories for each mon so that they self-distinguish
        }
        if (pkmnData[g] == null) {
          pkmnData[g] = "NO DATA";
        }
        let cell = row.insertCell(g);
        cell.innerHTML = pkmnData[g];
        cell.className = className;
        // add nature to correct cell 
        if(g===3){
          className += " " + pkmnData[g];
          cell.className = className;
          className = className.slice(0, className.length-pkmnData[g].length);
        }
        if (pkmnName !== null) {
          pkmnData[1] = pkmnName || pkmnData[1];
        }
        if (!nameList.includes(pkmnName)) {
          nameList.push(pkmnName);
        }
      }
      counter++;
    }

  let firstRow =  tbl.firstElementChild;
  firstRow.removeChild(firstRow.firstElementChild);
  var header = tbl.createTHead();
  var headerRow = header.insertRow(0);
  for (var i = 0; i < headers.length; i++) {
    // use of outerHTML is to overwrite the insertCell() effect of creating a <td> instead of the desired <th>
    headerRow.insertCell(i).outerHTML = "<th style='height: 50px;'>" + headers[i] + "</th>";
  }
  // query selector not get element cause its not on screen? wasnt working with getElement

  let controls = document.getElementsByClassName('form_controls_1');
  if (controls){
    var controlArray = Array.prototype.slice.call( controls )
    controlArray.forEach(element => {
      element.style.display="block";
    });
  }

  // suicune last pkmn at 882
  const brainData = result.slice(counter,result.length);
  buildBrain(brainData, headers);
  return tbl;
  }
}
function isElementInViewport ({el = false}) {
  let returnString='';
  removeButtonShadow(document.getElementById('checkButton'));
  // false el === from interface; otherwise it has a value
  if(!el){
    let inputTextBlock = document.getElementById('pokemon_check');
    if(inputTextBlock){
      let pokeSearchString = inputTextBlock.value;
      console.log(pokeSearchString);
      if(pokeSearchString==="" || !pokeSearchString){
        return alert("empty input");  
      }
      pokeSearchString = pokeSearchString.toLowerCase();
      const pokeTableQueryString = '.' + pokeSearchString;
      let allMonRows = document.querySelectorAll('tr' + pokeTableQueryString); // returns all rows
      const tableBody = document.querySelector('.pokemonDisplay > tbody');
      let outputTable = document.getElementById('output_table');
      let pokeTable = outputTable.firstElementChild;
      var tableRect = pokeTable.getBoundingClientRect();
      var rect;
      returnString += 'Pokemon not in view:';
      let instance =1;
      if(allMonRows){
        allMonRows.forEach(pokemonSearchedRow => {
          // only bring up rows if they arent in view
          rect = pokemonSearchedRow.getBoundingClientRect();

          // check if rect is within the 500 tall
          // checks bottom
          console.log(rect, 'pokemon row location');
          if(tableRect.top<rect.bottom){
            returnString += pokemonSearchedRow.value + ' ' + instance;
          }else if(tableRect.bottom<rect.top){
            returnString += pokemonSearchedRow.value + ' ' + instance;
          }
          instance++;
          console.log(returnString);
        });
      }
    }
    if(returnString!=='Pokemon not in view:'){
      return alert('all mons visible in table');
    }
  }else{
    let outputTable = document.getElementById('output_table');
    let pokeTable = outputTable.firstElementChild;
    var tableRect = pokeTable.getBoundingClientRect();
    var rect;
    el.forEach(eachRow => {
      rect = eachRow.getBoundingClientRect();
    // check if rect is within the 500 tall
    // checks bottom
      if(tableRect.botto<rect.top){
        if(tableRect.top>rect.top){
          returnString += eachRow.value + ' ';  
        }
      }
    });
    if(returnString===''){
      return alert('all mons visible in table');
    }else{
      alert(returnString, 'final IsElementInViewport alert');
      return false; // false for usage in loop of Find
    }

  }
  
  return returnString;
}
function roundIterator(){
  removeButtonShadow('roundIteratorButton');
  round+=1;
  let iteratorLabel = document.getElementById('iteratorLabel');
  iteratorLabel.innerText = 'Click here when you finish round ' + round + "!";
  // deal with the round iteration here by hiding rows up to 372 
  const preRound4Mons = document.querySelectorAll('.roundsOneTwoThree');
  const postRound4Mons = document.querySelectorAll('.rounds4AndOn');
  if(round===1){
    alert('starting the round iteration! Removing mons that can\'t exist before round 4.');
  }else if(round===4){
    alert('Congrats on making round 4! Removing mons that can\'t exist after round 4, and returning the ones who can.');
  }
  let viewAll, view1, view4;
  viewAll = document.getElementById('viewIndicatorAll');
  view1 = document.getElementById('viewIndicator1');
  view4 = document.getElementById('viewIndicator4');
  if(round<4){
    hideLateRounds();
    //view4.style.color="red";
    view4.className='highlight-red';
    //view1.style.color="green";
    view1.className='highlight-green';
    //viewAll.style.color="red";
    viewAll.className='highlight-red';
  } else if(round>=4){
    hideEarlyRounds();
    revealLateRounds();
    //view4.style.color="green";
    view4.className='highlight-green';
    //view1.style.color="red";
    view1.className='highlight-red';
    //viewAll.style.color="red";
    viewAll.className='highlight-red';
  }
}
function hideLateRounds(){
  const postRound4Mons = document.querySelectorAll('.rounds4AndOn');
  postRound4Mons.forEach(postRound4Row => {
    var rowClassName = postRound4Row.className;
    while(rowClassName.indexOf('hidden')===-1){
      postRound4Row.className += " hidden";
      rowClassName = postRound4Row.className;
    }
  });
}
function hideEarlyRounds(){
  const preRound4Mons = document.querySelectorAll('.roundsOneTwoThree');
  preRound4Mons.forEach(preRound4Row => {
    var rowClassName = preRound4Row.className;
    while(rowClassName.indexOf('hidden')===-1){
      preRound4Row.className += " hidden"; // only add if it doesnt exist yet
      rowClassName = preRound4Row.className;
    }
  });
}
function revealEarlyRounds(){
  const preRound4Mons = document.querySelectorAll('.roundsOneTwoThree');
  preRound4Mons.forEach(preRound4Row => {
    var rowClassName = preRound4Row.className;
    while(rowClassName.indexOf('hidden')!==-1){
    preRound4Row.className = rowClassName.substring( 0, rowClassName.indexOf( "hidden" )-1 ); // -1 for the period
    rowClassName = preRound4Row.className;
    }
  });
}
function revealLateRounds(){
  const postRound4Mons = document.querySelectorAll('.rounds4AndOn');
  postRound4Mons.forEach(postRound4Row => {
    var rowClassName = postRound4Row.className;
    while(rowClassName.indexOf('hidden')!==-1){
      postRound4Row.className = rowClassName.substring( 0, rowClassName.indexOf( "hidden" )-1 ); // -1 for the period
      rowClassName = postRound4Row.className;
    }
  });
}
function changeView(round){
  let viewAll, view1, view4;
  viewAll = document.getElementById('viewIndicatorAll');
  view1 = document.getElementById('viewIndicator1');
  view4 = document.getElementById('viewIndicator4');
  console.log(round);
  if(round==='all'){
    console.log(round);
  	removeButtonShadow('changeViewButtonAll');
    view4.className='highlight-red';
    view1.className='highlight-red';
    viewAll.className='highlight-green';
    revealEarlyRounds();
    revealLateRounds();
    // rebuild table
  } else if(round==='1'){
    console.log(round);
  	removeButtonShadow('changeViewButton1');
    view4.className='highlight-red';
    view1.className='highlight-green';
    viewAll.className='highlight-red';
    hideLateRounds();
    revealEarlyRounds();
    // rebuild table
  } else if(round==='4'){
    console.log(round);
  	removeButtonShadow('changeViewButton4');
    view4.className='highlight-green';
    view1.className='highlight-red';
    viewAll.className='highlight-red';
    hideEarlyRounds();
    revealLateRounds();
    // rebuild table
  } else{
    console.log('no valid option');
  }
}

function hideInput(){
  const inputToHide = document.getElementById('input-hider');
  if(inputToHide){
    inputToHide.parentNode.removeChild(inputToHide);
  } 
}

function buildBrain(brainData, headers){
  // do stuff wth brain data
  let brainHeaders = headers;
  /*
  */
  // re-display both the button and div once data loads
  let brainButton= document.getElementById('brainButton');
  let nolandPic = document.getElementById('noland_img');
  let noland_brain = document.getElementById('noland_brain');
  let nolandWarning = nolandPic.nextElementSibling;
  if(nolandPic){
    nolandPic.style.display = "none";
  }
  if(nolandWarning){
    nolandWarning.style.display = "none";
  }
  if(brainButton){
    brainButton.style.color = 'black';
    brainButton.innerText = "Show Noland Details";
  }
  let nolandDiv= document.getElementById('nolan_brain');
  if(brainButton){
    brainButton.style.display='block';
  }
  if(nolandDiv){
    nolandDiv.style.display='block';
  }
  
  const tbl = document.createElement('table');
  tbl.className = "table nolandDisplay";
  let counter = 0;
  brainData.forEach(rowData => {
    var row = tbl.insertRow(counter);
    if(rowData && rowData!==null & rowData!=''){
      let name = rowData[0]; // always Noland Silver / Gold
      if(name==='Noland Silver†' || name==='Noland Gold†'){
        let pkName = rowData[1];
        // rowData[2] always null
        let nature = rowData[3];
        let item = rowData[4];
        let move1 = rowData[5];
        let move2 = rowData[6];
        let move3 = rowData[7];
        let move4 = rowData[8];
        let ability = rowData[9];
        let EVSpread = rowData[10];
        let stats100 = rowData[11];
        let spd100 = rowData[12];
        let stats50 = rowData[13];
        let spd50 = rowData[14];
        let IVs = rowData[15];
        // user outerHTML to overwrite td
        row.insertCell(-1).outerHTML = "<td class=" + name + ">" + name + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + pkName + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + nature + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + item + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + move1 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + move2 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + move3 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + move4 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + ability + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + EVSpread + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + stats100 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + spd100 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + stats50 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + spd50 + "</td>";
        row.insertCell(-1).outerHTML = "<td>" + IVs + "</td>";
      }
    }
    counter++;
  });
  var header = tbl.createTHead();
  var headerRow = header.insertRow(0);
  var index = brainHeaders.indexOf('Instance');
  if (index !== -1) {
    brainHeaders.splice(index, 1);
  }
  for (var i = 0; i < brainHeaders.length; i++) {
    // use of outerHTML is to overwrite the insertCell() effect of creating a <td> instead of the desired <th>
    if(brainHeaders[i]!=='Instance'){
      headerRow.insertCell(i).outerHTML = "<th style='height: 50px;'>" + brainHeaders[i] + "</th>";
    }
  }
  const newNode = document.createElement("div");
  newNode.className = 'content';
  newNode.appendChild(tbl, nolandPic);
  noland_brain.insertBefore(newNode, noland_brain.children[1]);
}

function removeSection() {
	const data = document.getElementById('removeMe');
  if(data){
	      	data.parentNode.removeChild(data);
  }
}
function removeButtonShadow(buttonString){
	const button = document.getElementById(buttonString);
  if(button){
  	button.style.boxShadow="none";
  }
}
// currently only scrolls to the end of the table 
function autoScroll(){
	const elmnt = document.querySelector("pokemonDisplay tr:last-child");
  elmnt.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  if(inp){
    inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) {
        return false;
      }
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
        }
      }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
    });  
  }
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function(e) {
    closeAllLists(e.target);
  });
}
