var count_trans = 1;
var submit = false;
var transition_submit = false;

var states = [];
var alphabet = [];
var transitions = {};
var yes = [];
var start_state = "";

var states_selector = "";
var alphabet_selector = "";

var url = window.location.href;

var diaURL = "";

setHide("info_div", "info_selector", "Readme");
setHide("table_div", "answer_table_selector", "Equivalence table");
setHide("table_mini_div", "answer_table_mini_selector", "Minimized DFA table");
setHide("img_mini_div", "img_mini_selector", "Minimized DFA image");
setHide("uml_code_div", "uml_code_selector", "UML code");

var addTransition = function(){
	if (submit) {
		document.getElementById("transitions").innerHTML += "<p><label class>Transition " + count_trans + ": <select disabled id='start-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- Start -</option>" + states_selector + "</select><select disabled id='transition-char" + count_trans + "' tabindex='0'><option value='()' selected='selected'>- Char -</option>" + alphabet_selector + "</select><select id='end-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- End -</option>" + states_selector + "</select></label>";
	}
}

var submitFunc = function(){
	if (submit) {
		clear();
	}
	var inputs = [];
	inputs.push(document.getElementById("states-input"));
	inputs.push(document.getElementById("alphabet-input"));
	inputs.push(document.getElementById("yes-states-input"));
	if (isValid(inputs)) {
		
		states = inputs[0].value.replaceAll(" ", "").split(",");
		alphabet = inputs[1].value.replaceAll(" ", "").split(",");
		yes = inputs[2].value.replaceAll(" ", "").split(",");
		
		alphabet = alphabet.map(e => e[0]);
		
		for (var i = 0; i < states.length; i++) {
			states_selector += "<option value='" + states[i] + "'>- " + states[i] + " -</option>"
		}
		
		for (var i = 0; i < alphabet.length; i++) {
			alphabet_selector += "<option value='" + alphabet[i] + "'>- " + alphabet[i] + " -</option>"
		}
		
		document.getElementById("start-state").disabled = false;
		
		document.getElementById("start-state").innerHTML += states_selector;
		
		document.getElementById("start-state1").innerHTML += states_selector;
		document.getElementById("transition-char1").innerHTML += alphabet_selector;
		document.getElementById("end-state1").innerHTML += states_selector;
		
		document.getElementById("end-state1").disabled = false;
		
		submit = true;
		
		while (count_trans < states.length * alphabet.length) {
			count_trans++
			addTransition();
		}
		
		for (var i = 0; i < states.length; i++) {
			for (var k = 1; k <= alphabet.length; k++) {
				setOption(document.getElementById("start-state" + (k + alphabet.length * i)), states[i]);
				setOption(document.getElementById("transition-char" + (k + alphabet.length * i)), alphabet[k - 1]);
			}
		}
		
		
	} else {
		alert("Invalid text");
	}
};

function openURI(url) {
    window.open(url, '_blank');
}

var openPNG = function(){
	openURI("https://www.plantuml.com/plantuml/png/" + diaURL);
}

var openSVG = function(){
	openURI("https://www.plantuml.com/plantuml/svg/" + diaURL);
}

var transitionSubFunc = function(){
	var starts = [];
	var _chars = [];
	var ends = [];
	
	var s = 0;
	
	for (var i = 1; i <= count_trans; i++) {
		starts.push(document.getElementById("start-state" + i));
		_chars.push(document.getElementById("transition-char" + i));
		ends.push(document.getElementById("end-state" + i));
	}
	
	start_state = document.getElementById("start-state").value;
	
	for (var i = 0; i < count_trans; i++) {
		transitions[new String(starts[i].value)] = {};
	}
	
	for (var i = 0; i < count_trans; i++) {
		if (starts[i].value != "0" && _chars[i].value != "()" && ends[i].value != "0") {
			s++;
		}
		transitions[new String(starts[i].value)][_chars[i].value[0]] = ends[i].value;
	}

	if (s == count_trans) {
		var dfa = new DFA(states, alphabet, transitions, start_state, yes);
		dfa.calculateEquivalenceTable();
		var mini = dfa.minimize();
		
		document.getElementById("table_mini_div").innerHTML = mini.dfaToHtmlString();
		var theDivText = document.getElementById("table_div");
		theDivText.innerHTML = dfa.toHtmlEquivalenceTable();
		
		var theUML = document.getElementById("img_mini_div");
		var umlString = mini.toUmlString();
		
		var theUML = document.getElementById("uml_code_div");
		theUML.innerHTML = "<p class='answer'>" + umlString.replaceAll("\n", "<p class='answer'>");
		
		var dia = document.getElementById("diagram");
		if (dia != null)
			dia.remove();
		
		var img = document.createElement("img");
		img.id = "diagram";
		img.className = "diagram";
		diaURL = compress2(umlString);
		img.src = "https://www.plantuml.com/plantuml/svg/" + diaURL;
		
		document.getElementById("img_mini_div").innerHTML = "<p class='answer'>Generated on the PalntUML server (plantuml.com/plantuml/uml). " + "<input type='button' value='Open PNG' onclick='openPNG()'><input type='button' value='Open SVG' onclick='openSVG()'>";
		document.getElementById("img_mini_div").appendChild(img);
		
		transition_submit = true;
	} else {
		alert("Invalid text");
	}
}

////////////////////////////////////////////////////////
function gup( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

function setOption(selectElement, value) {
    var options = selectElement.options;
    for (var i = 0, optionsLength = options.length; i < optionsLength; i++) {
        if (options[i].value == value) {
            selectElement.selectedIndex = i;
            return true;
        }
    }
    return false;
}

function transitionToString() {
	var res = "";
	for (var i = 0; i < states.length; i++) {
		var tempMap = transitions[states[i]];
		res += "st_tr_" + states[i] + "=";
		for (var k = 0; k < alphabet.length; k++) {
			res += alphabet[k] + "_" + tempMap[alphabet[k]];
			if (k != alphabet.length - 1) {
				res += "__I__";
			}
		}
		if (i != states.length - 1) {
			res += "&";
		}
	}
	return res;
}

function parseDataUrl() {
	var data = window.atob(url.split("?")[1]);
	url = "https://ausf-software.github.io/dfsmmc/?" + data;
	states = gup("states", url).split(",");
	document.getElementById("states-input").value = gup("states", url);
	
	yes = gup("apply_states", url).split(",");
	document.getElementById("yes-states-input").value = gup("apply_states", url);
	
	alphabet = gup("alphabet", url).split(",");
	document.getElementById("alphabet-input").value = gup("alphabet", url);
	
	submitFunc();
	
	start_state = gup("start_state", url);
	setOption(document.getElementById("start-state"), start_state);
	
	var tempStr = "";
	
	for (var i = 0; i < states.length; i++) {
		tempStr = gup("st_tr_" + states[i], url);
		var tempTrans = tempStr.split("__I__");
		var tempMap = {};
		for (var k = 0; k < alphabet.length; k++) {
			var trans = tempTrans[k].split("_");
			tempMap[trans[0][0]] = trans[1];
		}
		transitions[states[i]] = tempMap;
	}
	
	for (var i = 0; i < states.length; i++) {
		for (var k = 1; k <= alphabet.length; k++) {
			setOption(document.getElementById("end-state" + (k + alphabet.length * i)), transitions[states[i]][alphabet[k - 1]]);
		}
	}
	
}

if (url.split("?").length > 1) {
	parseDataUrl();
}
////////////////////////////////////////////////////////

//document.getElementById("add-transition").onclick = addTransition;

var clear = function(){
	count_trans = 1;
	transition_submit = false;
	submit = false;
	document.getElementById("table_div").innerHTML = "";
	states_selector = "";
	alphabet_selector = "";
	document.getElementById("start-state").innerHTML = "<option value='0' selected='selected'>- None -</option>";
	document.getElementById("transitions").innerHTML = "<p><label class>Transition " + count_trans + ": <select disabled id='start-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- Start -</option></select><select disabled id='transition-char" + count_trans + "' tabindex='0'><option value='()' selected='selected'>- Char -</option></select><select disabled id='end-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- End -</option></select></label>";
	
	document.getElementById("table_mini_div").innerHTML = "";
	document.getElementById("img_mini_div").innerHTML = "";
	var dia = document.getElementById("diagram");
	if (dia != null)
		dia.remove();
	document.getElementById("uml_code_div").innerHTML = "";
}

document.getElementById("clear").onclick = clear;

function copyTextToClipboard(text) {
  var textArea = document.createElement("textarea");

  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  textArea.style.width = '2em';
  textArea.style.height = '2em';

  textArea.style.padding = 0;

  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  textArea.style.background = 'transparent';

  textArea.value = text;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}


document.getElementById("share").onclick = function(){
	if (submit) {
		var result = "https://ausf-software.github.io/dfsmmc/?";
		var res = "";
		res += "start_state=" + start_state + "&";
		
		res += "states=";
		for (var i = 0; i < states.length; i++) {
			res += states[i];
			if (i != states.length - 1) {
				 res += ",";
			}
		}
		
		res += "&apply_states=";
		for (var i = 0; i < yes.length; i++) {
			res += yes[i];
			if (i != yes.length - 1) {
				 res += ",";
			}
		}
		
		res += "&alphabet=";
		for (var i = 0; i < alphabet.length; i++) {
			res += alphabet[i];
			if (i != alphabet.length - 1) {
				 res += ",";
			}
		}
		
		res += "&" + transitionToString();
		result += window.btoa(res);
		copyTextToClipboard(result);
		alert("Link copied");
	}
}

document.getElementById("submit").onclick = submitFunc;

document.getElementById("transitions-submit").onclick = transitionSubFunc;

document.getElementById("info_selector").onclick = function(){
	setHide("info_div", "info_selector", "Readme");
}

document.getElementById("answer_table_selector").onclick = function(){
	setHide("table_div", "answer_table_selector", "Equivalence table");
}

document.getElementById("answer_table_mini_selector").onclick = function(){
	setHide("table_mini_div", "answer_table_mini_selector", "Minimized DFA table");
}

document.getElementById("img_mini_selector").onclick = function(){
	setHide("img_mini_div", "img_mini_selector", "Minimized DFA image");
}

document.getElementById("uml_code_selector").onclick = function(){
	setHide("uml_code_div", "uml_code_selector", "UML code");
}

function setHide(id, name, text) {
	var element = document.getElementById(id);
	if (element.style.display == 'none') {
		element.style.display = '';
		document.getElementById(name).innerHTML = "▼ " + text;
	} else {
		element.style.display = 'none';
		document.getElementById(name).innerHTML = "➤ " + text;
	}
}

function isValid(input) {
	return input.value != "" && /^[a-z0-9]+$/.test(input.value);
}

