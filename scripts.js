// Globals
var pokemonList = [];
var nameList = [];
const NUM_COLUMNS = 16;
const NUM_ROWS = 5;
var changeList = [];
let originalTableData;

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
      // console.log(result[1]); this is Sunkern

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
      const inputToHide = document.getElementById('input-hider');
      if(inputToHide){
        inputToHide.parentNode.removeChild(inputToHide);
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
        document.getElementById('dataButton').innerHTML = "Show Scientiest Exact Moves";
      } else {
        content.style.display = "block";
        document.getElementById('dataButton').innerHTML = "Hide Scientist Exact Moves";
      }
    });
  }
  let searchInput = document.getElementById("pokemon_search");
  let clearInput = document.getElementById("pokemon_clear");
  if(searchInput){
    autocomplete(document.getElementById("pokemon_search"), nameList);
  }
  if(clearInput){
    autocomplete(document.getElementById("pokemon_clear"), nameList);
  }
});


// pokemon search function
function findPokemon() {
	removeButtonShadow('findButton');
  console.log('find pokemon click!')
  const searchBlock = document.getElementById('pokemon_search');
  if(searchBlock){
  	let pokeSearchString = searchBlock.value;
  	if(pokeSearchString==="" || !pokeSearchString){
  		return alert("empty input");  
  	}	
		alert("finding "+pokeSearchString+" from table");
	  pokeSearchString = pokeSearchString.toLowerCase();
    const pokeTableQueryString = '.' + pokeSearchString;
    
    let allMonRows = document.querySelectorAll('tr' + pokeTableQueryString); // returns all rows
    const tableBody = document.querySelector('.pokemonDisplay > tbody');
    if(allMonRows){
      allMonRows.forEach(pokemonSearchedRow => {
          var row = pokemonSearchedRow;
          //tableBody.firstElementChild.insertBefore(row, null);
          tableBody.insertBefore( row, tableBody.firstElementChild ); 
      });
    }
  }
	
}

function clearPokemon() {
	removeButtonShadow('clearButton');
	console.log('remove pokemon click!');
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
      changeList.push(pokeSearchString+monInstance);
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
  alert("resetting table!");
  console.log('reset pokemon table click!');
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

}
let pokeOrder;
function createTable(result) {
  let internalResult = result;
  const tbl = document.createElement('table');
  tbl.className = "table pokemonDisplay";
  var headers;
  var counter = 0;

  if (result !== "Sorry no data found") {
    // parse listSorted for pkmn data
    headers = result.at(0); // prevents moving down the list each time you click reset
    while (result[counter]) {
      var row = tbl.insertRow(counter);
      // ignore headers - deal w each pokemon here
      let pkmnData = result[counter] || "";
      let pokeIndex = pkmnData[0] || "";
      let pkmnName = pkmnData[1] || "";
      let pkmnInstance = pkmnData[2] || "";
      row.className = pkmnName.toLowerCase() + " row";
      for (let g = 0; g < NUM_COLUMNS; g++) {
        if (pkmnData[g] == null) {
          pkmnData[g] = "NO DATA";
        }
        // user outerHTML to overwrite td
        row.insertCell(g).outerHTML = "<td class=" + pkmnName.toLowerCase() + pkmnInstance + ">" + pkmnData[g] + "</td>";
        if (pkmnName !== null) {
          pkmnData[1] = pkmnName || pkmnData[1];
        }
        if (!nameList.includes(pkmnName)) {
          nameList.push(pkmnName);
        }
        pokemonList.push(pkmnData[g]);
      }
      counter++;
    }
  }
  let firstRow =  tbl.firstElementChild;
  firstRow.removeChild(firstRow.firstElementChild);
  var header = tbl.createTHead();
  var headerRow = header.insertRow(0);
  for (var i = 0; i < headers.length; i++) {
    // use of outerHTML is to overwrite the insertCell() effect of creating a <td> instead of the desired <th>
    headerRow.insertCell(i).outerHTML = "<th style='height: 50px;'>" + headers[i] + "</th>";
  }
  return tbl;
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