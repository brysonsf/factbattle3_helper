// Globals
var pokemonList = [];
const NUM_COLUMNS = 16;
const NUM_ROWS = 5;
var changeList = [];

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
      const body = document.body;
      // create table
      const tbl = createTable(result);
      const inputToHide = document.getElementById('input-hider')
      if(inputToHide){
        inputToHide.parentNode.removeChild(inputToHide)
      }
      body.appendChild(tbl);
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
  	const pokeTable = document.getElementsByClassName('pokeTable');
    const pokeTableQueryString = '.' + pokeSearchString;
  	if(pokeTableQueryString){
   		for (let el of document.querySelectorAll(pokeTableQueryString)){
      	// do search stuff here, will have all elements that MATCH
        autoScroll();
    	}
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
    let seenPrior = 0;
    if(pokeTableQueryString){
      changeList.forEach(element => {
        if(element===pokeSearchString){
          seenPrior+=1;
        }
      });
      changeList.push(pokeSearchString);
      const cells = document.getElementsByClassName(pokeSearchString+seenPrior);
      var cellsArr = Array.prototype.slice.call( cells )
      cellsArr.forEach(cell => {
        cell.style.display='none';
      })
      //el.style.display = 'none';
    }
  }
  
  
}

function resetTable() {
	removeButtonShadow('resetButton');
  alert("resetting table!");
  console.log('reset pokemon table click!');
  document.getElementById('#resetButton').style.boxShadow='0px';
  document.getElementById('#resetButton').style='';
}

function createTable(result) {
  const tbl = document.createElement('table');
  tbl.className = "pokemonDisplay table";

  var headers;
  var counter = 0;

  if (result !== "Sorry no data found") {
    // parse listSorted for pkmn data
    headers = result.shift();
    while (result[counter]) {
      var row = tbl.insertRow(counter);
      // ignore headers - deal w each pokemon here
      let pkmnData = result[counter] || "";
      let pkmnName = pkmnData[1] || "";
      let pkmnInstance = pkmnData[2] || "";
      for (let g = 0; g < NUM_COLUMNS; g++) {
        if (pkmnData[g] == null) {
          pkmnData[g] = "NO DATA";
        }
        // user outerHTML to overwrite td
        row.insertCell(g).outerHTML = "<td class=" + pkmnName.toLowerCase() + pkmnInstance + ">" + pkmnData[g] + "</td>";
        if (pkmnName !== null) {
          pkmnData[1] = pkmnName || pkmnData[1];
        }

        pokemonList.push(pkmnData[g]);
      }
      counter++;
    }
  }
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
