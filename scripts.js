let offset = 0;
const limit = 20;

$(document).ready(function() {
    loadPokemon(offset, limit);

    $('#search').on('input', function() {
        let query = $(this).val().toLowerCase();
        if (query) {
            fetchSearchPredictions(query);
        } else {
            $('#search-results').hide();
        }
    });

    $('#search-results').on('click', 'p', function() {
        let selectedPokemon = $(this).text();
        $('#search').val(selectedPokemon);
        $('#search-results').hide();
        fetchPokemon(selectedPokemon);
    });

    $('#prev-btn').on('click', function() {
        if (offset > 0) {
            offset -= limit;
            loadPokemon(offset, limit);
        }
    });

    $('#next-btn').on('click', function() {
        offset += limit;
        loadPokemon(offset, limit);
    });
});

function loadPokemon(offset, limit) {
    $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
        method: 'GET',
        success: function(data) {
            $('#pokemon-details').html('');
            data.results.forEach(pokemon => fetchPokemon(pokemon.name));
            updatePaginationButtons(data);
        }
    });
}

function fetchPokemon(query) {
    $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon/${query}`,
        method: 'GET',
        success: function(data) {
            displayPokemon(data);
        },
        error: function() {
            $('#pokemon-details').html('<p>Pokémon not found.</p>');
        }
    });
}

function displayPokemon(data) {
    $('#pokemon-details').append(`
        <div class="col-md-4">
            <div class="card border rounded shadow-sm p-4 bg-white">
                <img src="${data.sprites.front_default}" class="card-img-top" alt="${data.name}">
                <div class="card-body">
                    <h5 class="card-title text-lg font-bold">${data.name} (#${data.id})</h5>
                    <p class="card-text">Type: ${data.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                    <p class="card-text">Abilities: ${data.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ')}</p>
                    <button class="btn btn-primary" onclick="getEvolutionChain('${data.species.url}')">View Evolution Chain</button>
                </div>
            </div>
        </div>
    `);
}

function getEvolutionChain(url) {
    $.ajax({
        url: url,
        method: 'GET',
        success: function(speciesData) {
            $.ajax({
                url: speciesData.evolution_chain.url,
                method: 'GET',
                success: function(evolutionData) {
                    let evolutionChain = getEvolutionChainText(evolutionData.chain);
                    alert('Evolution Chain: ' + evolutionChain);
                }
            });
        }
    });
}

function getEvolutionChainText(chain) {
    let evolutionText = chain.species.name;
    if (chain.evolves_to.length > 0) {
        evolutionText += ' -> ' + chain.evolves_to.map(evolution => getEvolutionChainText(evolution)).join(', ');
    }
    return evolutionText;
}

function fetchSearchPredictions(query) {
    $.ajax({
        url: `https://pokeapi.co/api/v2/pokemon?limit=1000`,
        method: 'GET',
        success: function(data) {
            let results = data.results.filter(pokemon => pokemon.name.includes(query));
            displaySearchResults(results);
        }
    });
}

function displaySearchResults(results) {
    $('#search-results').html('');
    results.forEach(result => {
        $('#search-results').append(`<p>${result.name}</p>`);
    });
    $('#search-results').show();
}

function updatePaginationButtons(data) {
    if (data.previous) {
        $('#prev-btn').prop('disabled', false);
    } else {
        $('#prev-btn').prop('disabled', true);
    }

    if (data.next) {
        $('#next-btn').prop('disabled', false);
    } else {
        $('#next-btn').prop('disabled', true);
    }
}
