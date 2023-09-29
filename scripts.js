// Globals
var pokemonList = [];
const NUM_COLUMNS = 16;
const NUM_ROWS = 5;
var changeList = [];


// read excel 

// read input and build pokemon data table
if(document.getElementById("#input")){
  document.getElementById("#input").on("change", (event) => {
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
      body.appendChild(tbl);
    }
    FR.readAsArrayBuffer(file);
  });
}
const tipButton = document.getElementById('tipButton');
if(tipButton){
    tipButton.addEventListener("click", function() {
  this.classList.toggle("active");
  var content = this.nextElementSibling;
  if (content.style.display === "block") {
    content.style.display = "none";
    document.getElementById('tipButton').innerHTML = "Show Scientists Quotes";
  } else {
    content.style.display = "block";
    document.getElementById('tipButton').innerHTML = "Hide Scientiest Quotes";
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

// pokemon search function
function findPokemon() {
  const searchBlock = document.getElementById('pokemon-search');
  let pokeSearchString = searchBlock.value;
  pokeSearchString = pokeSearchString.toLowerCase();
  for (let el of document.querySelectorAll('.' , pokeSearchString)) {
    //el.style.visibility = 'hidden';
  }
}

function clearPokemon() {
  const clearBlock = document.getElementById('pokemon-clear');
  let pokeSearchString = clearBlock.value;
  pokeSearchString = pokeSearchString.toLowerCase();
  for (let el of document.querySelectorAll('.' , pokeSearchString)) {
    //el.style.visibility = 'hidden';
    changeList.push(pokeSearchString);
    el.style.display = 'none';
  }
}

function resetTable() {

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
      for (let g = 0; g < NUM_COLUMNS; g++) {
        if (pkmnData[g] == null) {
          pkmnData[g] = "NO DATA";
        }
        // user outerHTML to overwrite td
        row.insertCell(g).outerHTML = "<td class=" + pkmnName.toLowerCase() + ">" + pkmnData[g] + "</td>";
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
  for (var i = 0; i < headers.size; i++) {
    // use of outerHTML is to overwrite the insertCell() effect of creating a <td> instead of the desired <th>
    headerRow.insertCell(i).outerHTML = "<th style='height: 50px;'>" + headers[i] + "</th>";
  }

  var resetButton = document.getElementById('resetTableButton');
  resetButton.disabled = false;
  return tbl;
}
