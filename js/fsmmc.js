var count_trans = 1;
var submit = false;
var transition_submit = false;

var states = [];
var alphabet = [];
var transitions = new Map;
var yes = [];
var start_state = "";

var states_selector = "";
var alphabet_selector = "";

setHide("info_div", "info_selector", "Readme");
setHide("table_div", "answer_table_selector", "Table");

document.getElementById("add-transition").onclick = function(){
	if (submit) {
		count_trans++;
		document.getElementById("transitions").innerHTML += "<p><label class>Transition " + count_trans + ": <select id='start-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- Start -</option>" + states_selector + "</select><select id='transition-char" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- Char -</option>" + alphabet_selector + "</select><select id='end-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- End -</option>" + states_selector + "</select></label>";
	}
}

clear = function(){
	count_trans = 1;
	transition_submit = false;
	submit = false;
	document.getElementById("answer_table_selector").innerHTML = "";
	states_selector = "";
	alphabet_selector = "";
	document.getElementById("start-state").innerHTML = "<option value='0' selected='selected'>- None -</option>";
	document.getElementById("transitions").innerHTML = "<p><label class>Transition " + count_trans + ": <select disabled id='start-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- Start -</option></select><select disabled id='transition-char" + count_trans + "' tabindex='0'><option value='()' selected='selected'>- Char -</option></select><select disabled id='end-state" + count_trans + "' tabindex='0'><option value='0' selected='selected'>- End -</option></select></label>";
}
document.getElementById("clear").onclick = clear;

document.getElementById("submit").onclick = function(){
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
		
		document.getElementById("start-state1").disabled = false;
		document.getElementById("transition-char1").disabled = false;
		document.getElementById("end-state1").disabled = false;
		
		submit = true;
		
	} else {
		alert("Invalid text");
	}
}

document.getElementById("transitions-submit").onclick = function(){
	var starts = [];
	var _chars = [];
	var ends = [];
	
	var s = 0;
	
	for (var i = 1; i <= count_trans; i++) {
		starts.push(document.getElementById("start-state" + i));
		_chars.push(document.getElementById("transition-char" + i));
		ends.push(document.getElementById("end-state" + i));
	}
	
	var temp = new Map();
	for (var k = 0; k < alphabet.length; k++) {
		temp.set(alphabet[k], states[0]);
	}
	for (var i = 0; i < count_trans; i++) {
		transitions.set(states[i], temp);
	}
	
	
	for (var i = 0; i < count_trans; i++) {
		if (starts[i].options[starts[i].selectedIndex].value != "0" && _chars[i].options[_chars[i].selectedIndex].value != "()" && ends[i].options[ends[i].selectedIndex].value != "0") {
			s++;
		}
		transitions.get(starts[i].options[starts[i].selectedIndex].value).set(_chars[i].options[_chars[i].selectedIndex].value, ends[i].options[ends[i].selectedIndex].value);
	}

	if (s == count_trans)
	{
		var dfa = new DFA(states, alphabet, transitions, start_state, yes);
		dfa.printEquivalenceTable();
		//console.log(dfa.minimize());
		var theDivText = document.getElementById("answer_table_selector");
		theDivText.innerHTML += dfa.toHtmlEquivalenceTable();
	} else {
		alert("Invalid text");
	}
}

document.getElementById("info_selector").onclick = function(){
	setHide("info_div", "info_selector", "Readme");
}

document.getElementById("answer_table_selector").onclick = function(){
	setHide("table_div", "answer_table_selector", "Table");
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
	return input.value != "" && /^[a-z0-9-+]+$/.test(input.value);
}

