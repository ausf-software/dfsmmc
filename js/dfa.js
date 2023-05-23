class DFA {
  constructor(states, alphabet, transition, start, accept) {
    this.states = states;
    this.alphabet = alphabet;
    this.transition = transition;
    this.start = start;
    this.accept = accept;
  }

  minimize() {
    let partitions = this.partition(); // get initial partition
    let newPartitions;
    do {
      newPartitions = partitions;
      partitions = this.refine(partitions); // create new partition
    } while (!this.areEqual(partitions, newPartitions)); // loop until no changes made
    return this.buildNewDFA(partitions); // build new DFA from final partition
  }

  partition() {
    let partition = [[], []];
    let accepting = [];
    let nonaccepting = [];
    for (let state of this.states) {
      if (this.accept.includes(state)) {
        accepting.push(state);
      } else {
        nonaccepting.push(state);
      }
    }
    partition[0] = accepting;
    partition[1] = nonaccepting;
    return partition;
  }

  refine(partitions) {
    let refinedPartitions = [];
    for (let partition of partitions) {
      let newPartitions = this.split(partition, partitions);
      refinedPartitions.push(...newPartitions);
    }
    return refinedPartitions;
  }

  split(partition, partitions) {
    let newPartitions = [];
    if (partition.length <= 1) {
      return [partition];
    }
    let firstState = partition[0];
    let newPartition = [firstState];
    for (let i = 1; i < partition.length; i++) {
      let secondState = partition[i];
      if (this.areEquivalent(firstState, secondState, partitions)) {
        newPartition.push(secondState);
      } else {
        newPartitions.push(newPartition);
        newPartition = [secondState];
        firstState = secondState;
      }
    }
    newPartitions.push(newPartition);
    return newPartitions;
  }

  areEquivalent(state1, state2, partitions) {
    let index1 = this.getPartitionIndex(state1, partitions);
    let index2 = this.getPartitionIndex(state2, partitions);
    for (let symbol of this.alphabet) {
      let nextState1 = this.transition[state1][symbol];
      let nextState2 = this.transition[state2][symbol];
      let nextPartition1 = this.getPartitionIndex(nextState1, partitions);
      let nextPartition2 = this.getPartitionIndex(nextState2, partitions);
      if (nextPartition1 !== nextPartition2) {
        return false;
      }
    }
    return true;
  }

  getPartitionIndex(state, partitions) {
    for (let i = 0; i < partitions.length; i++) {
      if (partitions[i].includes(state)) {
        return i;
      }
    }
    return -1;
  }

  areEqual(partitionsA, partitionsB) {
    if (partitionsA.length !== partitionsB.length) {
      return false;
    }
    for (let i = 0; i < partitionsA.length; i++) {
      if (!this.setsAreEqual(partitionsA[i], partitionsB[i])) {
        return false;
      }
    }
    return true;
  }

  setsAreEqual(set1, set2) {
    if (set1.length !== set2.length) {
      return false;
    }
    for (let i = 0; i < set1.length; i++) {
      if (!set2.includes(set1[i])) {
        return false;
      }
    }
    return true;
  }

 createEquivalenceTable(states, accept, transition) {
  const marked = {};
  const equiv = {};

  for (let p = 0; p < states.length; p++) {
    for (let q = p + 1; q < states.length; q++) {
      if (accept.includes(states[p]) !== accept.includes(states[q])) {
        marked[p] = true;
        marked[q] = true;
        
        if (!equiv[p]) {
          equiv[p] = [];
        }
        equiv[p][q] = true;

        if (!equiv[q]) {
          equiv[q] = [];
        }
        equiv[q][p] = true;
      }
    }
  }

  return { marked, equiv };
}
  
   buildNewDFA(partitions) {
    let newStates = [];
    let newTransition = {};
    let newStart = partitions[this.getPartitionIndex(this.start, partitions)][0];
    let newAccept = [];
    for (let partition of partitions) {
      let state = partition[0];
      newStates.push(state);
      newTransition[state] = {};
      for (let symbol of this.alphabet) {
        let nextState = this.transition[state][symbol];
        let nextPartition = partitions[this.getPartitionIndex(nextState, partitions)];
        let newNextState = nextPartition[0];
        newTransition[state][symbol] = newNextState;
      }
      if (this.accept.includes(state)) {
        newAccept.push(state);
      }
    }
    return new DFA(newStates, this.alphabet, newTransition, newStart, newAccept);
  }
  

 printEquivalenceTable() {
	const start = this.start;
	const states = this.states;
	const transitions = this.transition;
	const accept = this.accept;
  const equiv = this.createEquivalenceTable(states, accept, transitions);
  const table = [];

  for (let i = 0; i < states.length; i++) {
    table[i] = [];

    for (let j = 0; j <= i; j++) {
      if (!equiv.marked[i] && !equiv.marked[j]) {
        table[i][j] = ' - ';
        continue;
      }

      if (accept.includes(states[i]) !== accept.includes(states[j])) {
        table[i][j] = ' x ';
        continue;
      }

      let equivalent = true;
      for (let k = 0; k < transitions.length; k++) {
        const nextState1 = transitions[k][i];
        const nextState2 = transitions[k][j];

        if (table[nextState1][nextState2] === ' x ') {
          equivalent = false;
          break;
        }
      }

      if (equivalent) {
        equiv.equiv[i][j] = true;
        table[i][j] = '  = ';
      } else {
        table[i][j] = '    ';
      }
    }
  }

  // Print the table
  console.log('Equivalence table:');
  console.log(`             ${states.join('  ')}`);
  console.log('             ' + '-'.repeat((states.length * 3) - 2));

  for (let i = 0; i < states.length; i++) {
    let row = `${states[i]} |`;

    for (let j = 0; j <= i; j++) {
      row += table[i][j];
      row += '  ';
    }

    console.log(row);
  }
  
}


 toHtmlEquivalenceTable() {
	const start = this.start;
	const states = this.states;
	const transitions = this.transition;
	const accept = this.accept;
  const equiv = this.createEquivalenceTable(states, accept, transitions);
  const table = [];

  for (let i = 0; i < states.length; i++) {
    table[i] = [];

    for (let j = 0; j <= i; j++) {
      if (!equiv.marked[i] && !equiv.marked[j]) {
        table[i][j] = ' - ';
        continue;
      }

      if (accept.includes(states[i]) !== accept.includes(states[j])) {
        table[i][j] = ' x ';
        continue;
      }

      let equivalent = true;
      for (let k = 0; k < transitions.length; k++) {
        const nextState1 = transitions[k][i];
        const nextState2 = transitions[k][j];

        if (table[nextState1][nextState2] === ' x ') {
          equivalent = false;
          break;
        }
      }

      if (equivalent) {
        equiv.equiv[i][j] = true;
        table[i][j] = '  = ';
      } else {
        table[i][j] = '    ';
      }
    }
  }

	var res = "<p><table><thead><tr><th></th>";
	for (var i = 0; i < states.length; i++) {
		res += "<th>" + states[i] + "</th>";
	}
	res += "</tr></thead><tbody>"
  for (let i = 0; i < states.length; i++) {
	res += "<tr><th>";
    res += `${states[i]}`;
	res += "</th>"

    for (let j = 0; j <= i; j++) {
      res += "<th>" + table[i][j] + "</th>";
    }

    res += "</tr>";
  }
  res += "</tbody></table>";
  return res;
}  
}

var x = [
["E", "C"],
["E", "D"],
["E", "B"],
["E", "C"],
["B", "G"],
["A", "D"],
["A", "B"]
];
// Example usage:
let dfa = new DFA(["A", "B", "C", "D", "E", "F", "G"], ['0', '1'], {
  "A": { '0': "E", '1': "C" },
  "B": { '0': "E", '1': "D" },
  "C": { '0': "E", '1': "B" },
  "D": { '0': "E", '1': "C" },
  "E": { '0': "B", '1': "G" },
  "F": { '0': "A", '1': "D" },
  "G": { '0': "A", '1': "B" }
}, "A", ["E", "F", "G"]);
let minimizedDFA = dfa.minimize();
console.log(minimizedDFA);
//console.log(dfa.createEquivalenceTable([['A'], ['B', 'C'], ['D']]));

dfa.printEquivalenceTable();