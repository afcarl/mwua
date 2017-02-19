import $ from 'jquery';

function sum(arr) {
    return arr.reduce((sum, x) => sum + x);
}

// Choose an index of the weights array at random, proportionally to the value
// at that index.
function draw(weights) {
    let choice = Math.random() * sum(weights);
    let choiceIndex = 0;

    for (let weight of weights) {
        choice = choice - weight;
        if (choice <= 0) {
            return choiceIndex;
        }

        choiceIndex += 1;
    }

    throw {'error': 'How did I get here? Is this real life?'};
}

function selectObject(objects, weights) {
    return objects[draw(weights)];
}

function mwuaStep(objects, weights, chosenObject, chosenRewards, learningRate) {
    let chosenObjectIndex = objects.indexOf(chosenObject);
    for (let i=0; i < weights.length; i++) {
        weights[i] *= (1 + learningRate * chosenRewards[i])
    }
}


// Initialize state
global.state = {
    objects: ['Alice', 'Bob', 'Chadwick', 'Eve'],
    weights: [1, 1, 1, 1],
    learningRate: 0.5,
    roundRewards: [],
    cumulativeRewards: [0, 0, 0, 0]
};
state.chosenObject = selectObject(state.objects, state.weights);


function executeRound(chosenRewards) {
    mwuaStep(state.objects, state.weights, state.chosenObject, chosenRewards, state.learningRate);
    state.roundRewards.push(chosenRewards);
    for (let i=0; i < chosenRewards.length; i++) {
        state.cumulativeRewards[i] += chosenRewards[i];
    }
}

function renderRewardRow(rewards, index) {
    console.log(rewards);
    console.log(index);
    let row = rewards.map(n => '<td>' + n.toString() + '</td>').join('');
    return '<tr>' + 
           '<th> Round <span class="roundNumber">' + (index + 1) + '</span>:</th>' + 
           row + 
           '</tr>'
}

function renderRewardTable(roundRewards) {
    var rewardRows = roundRewards.map(renderRewardRow).join("\n");
    var headerRow = "<tr class='header'> <th>Experts:</th> <td>Alice</td> <td>Bob</td>" + 
                    " <td>Chadwick</td> <td>Eve</td> </tr>";
    var inputRow = "<tr id=\"inputRewards\"> <th>Round <span class=\"roundNumber\">" + 
                   (roundRewards.length + 1) + 
                   "</span>: </th> <td><input></td> <td><input></td> <td><input></td> <td><input></td> </tr>"

    return [headerRow, rewardRows, inputRow].join('\n');
}

export function render(state) {
    $('#rewards').html(renderRewardTable(state.roundRewards));
    $('input').val('');
    $('#cumulativeRewards td').each(function(index) {
        $( this ).text(state.cumulativeRewards[index]);
    });
    $('h2 .roundNumber').text(state.roundRewards.length);
    $('#chosenObject').text(state.chosenObject);
    // TODO: set MWUA weights
}

$('#calcBtn').click(function () {
    var chosenRewards = $.makeArray($('#inputRewards input').map(function() {
        return parseFloat($( this ).val()) || 0;
    }));
    console.log(chosenRewards);
    executeRound(chosenRewards);
    state.chosenObject = selectObject(state.objects, state.weights);

    render(state);
});

