
const fs = require('fs') // a Node built-in module 

let loc = window.location.pathname
let dir = loc.substring(1, loc.lastIndexOf('/'))

let charactersList = []
let currentObjectIndex = 0
let charactersListMaxSize = 50

const nameUpdateForm = document.getElementById('update-form-name')
const scoreUpdateForm = document.getElementById('update-form-score')
const descriptionUpdateForm = document.getElementById('update-form-description')
const imageurlUpdateForm = document.getElementById('update-form-imageurl')

function displayAllCharacters() {
    fs.readFile(`${dir}/characters.json`, 'utf8', (err, jsonString) => {
        if (err) {
            console.log("File read failed:", err)
            return
        }
        try {
            const character = JSON.parse(jsonString)
            let mainContainer = document.getElementById("main-div")
            for(i in character.characters) {
                let scoreFloat = parseFloat(character.characters[i].score)
                character.characters[i].score = scoreFloat
                charactersList.push(character.characters[i])
            }
            for(let i = 0; i < charactersList.length; i++) {
                const characterContainer = document.createElement('div')
                characterContainer.classList.add('character-container');
                characterContainer.innerHTML = `
                    <div class="character-item-info">
                        <div class="character-item-info-col1">
                            <p>${i+1}</p>
                        </div>
                        <div class="character-item-info-col2">
                            <img src="${charactersList[i].imageUrl}" class="character-image" alt="loading">
                        </div>
                        <div class="character-item-info-col3">
                            <p class="character-name">${charactersList[i].name}</p>
                            <p class="character-description">${charactersList[i].description}</p>
                            <p class="character-score">Overall score: ${charactersList[i].score}</p>
                        </div>
                    </div>
                    <div id="character-item-utilities">
                        <i class="fas fa-user-edit" data-id="${i}" onclick="openLeftNavToEdit(event)"></i>
                    </div>`
                mainContainer.appendChild(characterContainer)
            }
        }
        catch(err) {
            console.log('Error parsing JSON string:', err)
        }
    })
}

function sortArrayHighestToLowest() {
    for (var i = 0; i < charactersList.length; i++) {
        var target = charactersList[i];
        for (var j = i - 1; j >= 0 && (charactersList[j].score < target.score); j--) {
            charactersList[j+1] = charactersList[j];
        }
        charactersList[j+1] = target
    }
}

function fillFormWithObjectInfo(objId) {
    for (let i = 0; i < charactersList.length; i++) {
        if (i == objId) {
            nameUpdateForm.value = charactersList[i].name
            scoreUpdateForm.value = charactersList[i].score
            descriptionUpdateForm.value = charactersList[i].description
            imageurlUpdateForm.value = charactersList[i].imageUrl
            break
        }
    }
}

function openLeftNavToEdit(e) { // the "e" object is created automatically when an event is fired
    var target = e.target // get the element that was the source of the event
    currentObjectIndex = target.dataset.id
    fillFormWithObjectInfo(currentObjectIndex)
    document.getElementById("my-left-sidenav").style.width = "250px"
}

function updateCharacterInfo(e) {
    e.preventDefault()
    let parsedScore = parseFloat(scoreUpdateForm.value)
    const updatedCharacter = {
        name: nameUpdateForm.value,
        description: descriptionUpdateForm.value,
        imageUrl: imageurlUpdateForm.value,
        score: parsedScore
    }
    charactersList[currentObjectIndex] = updatedCharacter
    sortArrayHighestToLowest()
    const obj = {characters:charactersList}
    const jsonString = JSON.stringify(obj, null, 4)
    fs.writeFile(`${dir}/characters.json`, jsonString, (err) => {
        if (err) {
            console.log('Error writing file:', err)
        } 
        else {
            console.log("Your character has been updated!")
            updatePageContent()
        }
    })
    closeSidenav("my-left-sidenav")
}

function removeElementsInsideContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.lastChild)
    }
}

function updatePageContent() {
    const mainContainer = document.getElementById('main-div')
    removeElementsInsideContainer(mainContainer)
    charactersList = [] // empty list before you push new values to it in the next method
    displayAllCharacters()
}

function openRightNavToAdd() {
    document.getElementById("my-right-sidenav").style.width = "250px"
}

function closeSidenav(elementId) {
    document.getElementById(elementId).style.width = "0"
}

function createNewCharacter(e) {
    e.preventDefault()
    const element = document.getElementById('add-form-score')
    let parsedScore = parseFloat(element.value)
    const character = {
        name: document.getElementById('add-form-name').value,
        description: document.getElementById('add-form-description').value,
        imageUrl: document.getElementById('add-form-imageurl').value,
        score: parsedScore
    }
    if (charactersList.length >= charactersListMaxSize) {
        console.log("Can't add more than 50 characters!")
    } else {
        charactersList.push(character)
        sortArrayHighestToLowest()
        const obj = {characters:charactersList}
        const jsonString = JSON.stringify(obj, null, 4)
        fs.writeFile(`${dir}/characters.json`, jsonString, err => {
            if (err) {
                console.log('Error writing file', err)
            } else {
                console.log('Successfully wrote file')
                updatePageContent()
            }
        })
        closeSidenav("my-right-sidenav")
    }
}

function deleteCharacter() {
    charactersList.splice(currentObjectIndex, 1) // delete the selected object from the array
    const obj = {characters:charactersList}
    const jsonString = JSON.stringify(obj, null, 4)
    fs.writeFile(`${dir}/characters.json`, jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully deleted character')
            updatePageContent()
        }
    })
    closeSidenav("my-left-sidenav")
}

/***** init *****/

displayAllCharacters()

addBackToTop({
    diameter: 40,
    backgroundColor: 'lightseagreen',
    textColor: '#fff'
})