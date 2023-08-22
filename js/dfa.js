function getTransitionType(state, accepts, start) {
	if (state == start) return "->";
	for (var i = 0; i < accepts.length; i++) {
		if (state == accepts[i]) return "*";
	}
	return "";
}

//source http://www.plantuml.com/plantuml/uml
function compress2(s) {
	//UTF8
	s = unescape(encodeURIComponent(s));
	var arr = [];
	for (var i = 0; i < s.length; i++)
		arr.push(s.charCodeAt(i));	
	var compressor = new Zopfli.RawDeflate(arr);
	var compressed = compressor.compress();
	return encode64_(compressed);
}


class DFA {
	
	table;
	run;
	equivalentStates;
	
	constructor(states, alphabet, transition, start, accept) {
		this.states = states;
		this.alphabet = alphabet;
		this.transition = transition;
		this.start = start;
		this.accept = accept;
		this.table = {};
		this.equivalentStates = {};
	}
	
	fillStartTable() {
		for (var i = 0; i < this.states.length; i++) {
			this.table[this.states[i]] = {}
			for (var j = 0; j < this.states.length; j++) {
				if (i === j)
					this.table[this.states[i]][this.states[j]] = "=";
				else
					this.table[this.states[i]][this.states[j]] = "";
			}
		}
	}
	
	isAcceptState(state) {
		for (var i = 0; i < this.accept.length; i++) {
			if (state == this.accept[i]) 
				return true;
		}
		return false;
	}
	
	checkEquivalentInTable(state1, state2) {
		if (this.table[state1][state2] == "X")
			return false
		return true;
	}
	
	statesAreEquivalent(state1, state2) {
		var type1 = this.isAcceptState(state1);
		var type2 = this.isAcceptState(state2);
		if ((type1 && type2) || (!type1 && !type2)) {
			var stat = true;
			for (var i = 0; i < this.alphabet.length; i++) {
				var s1 = this.transition[state1][this.alphabet[i]];
				var s2 = this.transition[state2][this.alphabet[i]];
				var e1 = this.checkEquivalentInTable(s1, s2);
				var e2 = (this.isAcceptState(s1) && this.isAcceptState(s2)) || (!this.isAcceptState(s1) && !this.isAcceptState(s2));
				stat = stat && e1 && e2;
			}
			return stat;
		}
		return false;
	}
	
	fillTable() {
		this.run = false;
		for (var i = 0; i < this.states.length; i++) {
			for (var j = 0; j < this.states.length; j++) {
				if (i != j && this.checkEquivalentInTable(this.states[i], this.states[j])) {
					if (!this.statesAreEquivalent(this.states[i], this.states[j])) {
						this.run = true;
						this.table[this.states[i]][this.states[j]] = "X";
					}
				}
			}
		}
	}
	
	calculateEquivalenceTable() {
		this.fillStartTable();
		do {
			this.fillTable();
		} while(this.run);
	}

	minimize() {
		var alphabet = this.alphabet;
		var states = [];
		var accept = [];
		var start;
		var transition = {};
		
		var st = [];
		for (var i = 0; i < this.states.length; i++) {
			st[i] = -1;
		}
		
		// all new states
		for (var i = 0; i < this.states.length; i++) {
			if (st[i] == -1) {
				var temp = "";
				for (var k = i; k < this.states.length; k++) {
					if (this.checkEquivalentInTable(this.states[i], this.states[k])) {
						temp += this.states[k];
						st[k] = states.length;
					}
				}
				states.push(temp);
			}
		}

		// find new start state
		for (var i = 0; i < this.states.length; i++) {
			if (this.states[i] == this.start) {
				start = states[st[i]];
				break;
			}
		}
		
		// find new accept states
		for (var i = 0; i < this.states.length; i++) {
			for (var k = 0; k < this.accept.length; k++) {
				if (this.states[i] == this.accept[k]) {
					if (accept.indexOf(states[st[i]]) < 0) {
						accept.push(states[st[i]]);
					}
				}
			}
		}
		
		// transitions
		for (var i = 0; i < states.length; i++) {
			transition[states[i]] = {};
			for (var k = 0; k < alphabet.length; k++) {
				var old_state_res = this.transition[states[i][0]][alphabet[k]];
				transition[states[i]][alphabet[k]] = states[st[this.states.indexOf(old_state_res)]];
			}
		}
		
		return new DFA(states, alphabet, transition, start, accept);
	}

	toHtmlEquivalenceTable() {
		var res = "<p><table><tbody>";
		for (let i = 0; i < this.states.length; i++) {
			res += "<tr><th>";
			res += this.states[i];
			res += "</th>"

			for (let j = 0; j <= i; j++) {
				res += "<th>" + this.table[this.states[i]][this.states[j]] + "</th>";
			}

			res += "</tr>";
		}
		
		res += "<tr><th></th>";
		for (var i = 0; i < this.states.length; i++) {
			res += "<th>" + this.states[i] + "</th>";
		}
		res += "</tr>"
		res += "</tbody></table>";
		return res;
	}

	dfaToHtmlString() {
		var res = "<p><table><tr><th></th>";
		for (var i = 0; i < this.alphabet.length; i++) {
			res += "<th>" + this.alphabet[i] + "</th>";
		}
		res += "</tr></thead><tbody>"
		for (var i = 0; i < this.states.length; i++) {
			res += "<tr><th>";
			res += getTransitionType(this.states[i], this.accept, this.start) + this.states[i];
			res += "</th>"
		
			for (var j = 0; j < this.alphabet.length; j++) {
				res += "<th>" + this.transition[this.states[i]][this.alphabet[j]] + "</th>";
			}
		
			res += "</tr>";
		}
		res += "</tbody></table>";
		
		return res;
	}
	
	toUmlString() {
		var res = "@startuml\n";
		res += "!theme sketchy-outline\n";
		
		for (var i = 0; i < this.states.length; i++) {
			res += "object " + this.states[i] + "\n";
		}
		
		for (var i = 0; i < this.states.length; i++) {
			var used = new Array(this.alphabet.length).fill(0);
			for (var k = 0; k < this.alphabet.length; k++) {
				if (used[k] != 0)
					continue;
				var temp = this.transition[this.states[i]][this.alphabet[k]];
				var pairs = "";
				for (var b = k; b < this.alphabet.length; b++) {
					var curr_trans = this.transition[this.states[i]][this.alphabet[b]];
					if (temp === curr_trans) {
						used[b] = 1;
						pairs += this.alphabet[b] + "\\n";
					}
				}
				res += (this.states[i] + " --|> " + temp + ":" + pairs + "\n");
			}
		}
		
		res += "@enduml";
		return res;
	}
}

//Example usage:
// let dfa = new DFA(["A", "B", "C", "D", "E", "F", "G"], ["0", "1"], {
  // "A": { '0': "E", "1": "C" },
  // "B": { '0': "E", "1": "D" },
  // "C": { '0': "E", "1": "B" },
  // "D": { '0': "E", "1": "C" },
  // "E": { '0': "B", '1': "G" },
  // "F": { '0': "A", '1': "D" },
  // "G": { '0': "A", '1': "B" }
// }, "A", ["E", "F", "G"]);
// dfa.calculateEquivalenceTable();

// var theDivText = document.getElementById("table_div");
// theDivText.innerHTML += dfa.toHtmlEquivalenceTable();
// document.getElementById("table_mini_div").innerHTML += dfa.minimize().dfaToHtmlString();