//BUTTON LISTENERS

let createBtn = document.getElementById('openModal')
let modal = document.getElementById('modal')
let modalClose = document.getElementById('modalClose')
let stub = document.getElementById('stub')
let destinaton = document.getElementById('cardsBlock')     //Container for cards


createBtn.onclick = () => modal.style.display = "flex"
document.body.onclick = (e) => {
	if(e.target === modalClose || e.target === modal)
		modal.style.display = "none"
}


//LOCAL STORAGE SETTER

let lcards = []
let dragItems = []

function storeObj(obj) {
	lcards.push(obj)
	let temp = lcards.map(el => {
		let res = {}
		for(let key in el){
			res[key] = el[key].value
		}
		return res
	})
	localStorage.cards = JSON.stringify(temp)
	dragItems = [...document.querySelectorAll(".visit-card")]
}

function deleteObj(obj) {
	let index = lcards.indexOf(obj)
	lcards.splice(index, 1)
	let temp = lcards.map(el => {
		let res = {}
		for(let key in el){
			res[key] = el[key].value
		}
		return res
	})

	localStorage.cards = JSON.stringify(temp)
	dragItems = [...document.querySelectorAll(".visit-card")]
	if(dragItems.length === 0){
		stub.style.display = ""
	}

}


//CARDS CLASSES

class Visit{
	constructor(obj){
		let date = obj.date ? obj.date : new Date().toDateString()
		this.doctor = {value: obj.doctor}
		this.date = {name: "Date", value: date, isHidden: true}
		this.name = {value: obj.name}
		this.purpose = {name: "Purpose", value: obj.purpose, isHidden: true}
		this.comment = {value: obj.comment}
		this._card = document.createElement('div')
    }
	
	buildCard(){
		this._card.className = "visit-card"

		let closeBtn = document.createElement('button')
		closeBtn.innerText = "X"
		closeBtn.className = "close-btn"
		closeBtn.onclick = () => this.removeCard()
		this._card.appendChild(closeBtn)
		
		let cardName = document.createElement('p')
		cardName.innerText = this.name.value
		cardName.className = "card-name"
		this._card.appendChild(cardName)

		let cardDoctor = document.createElement('p')
		cardDoctor.innerText = this.doctor.value
		cardDoctor.className = "card-doctor"
		this._card.appendChild(cardDoctor)

		let hiddenBlock = document.createElement('div')
		hiddenBlock.className = "hidden-block hidden"
		for (let el in this){
			if(this[el].isHidden){
				let item = document.createElement('p')
				item.innerText = `${this[el].name}: ${this[el].value}`
				hiddenBlock.appendChild(item)
			}
		}
		let comments = document.createElement('p')
		comments.innerText = this.comment.value
		hiddenBlock.appendChild(comments)
		this._card.appendChild(hiddenBlock)

		let showMore = document.createElement('p')
		showMore.innerText = "Show more"
		showMore.className = "show-more"
		showMore.onclick = () => {
			hiddenBlock.classList.toggle("hidden")
			showMore.innerText = hiddenBlock.classList.contains("hidden") ? "Show more" : "Hide"
		}
		this._card.appendChild(showMore)
		if (destinaton.querySelector(".dummy")) {
			let dummy = destinaton.querySelector(".dummy")
			destinaton.insertBefore(this._card, dummy)
			destinaton.removeChild(dummy)
		}else{
			destinaton.appendChild(this._card)
		}
	}

	removeCard(){
		destinaton.removeChild(this._card)
		deleteObj(this)
	}

}

class Cardio extends Visit{
	constructor(obj){
		super(obj)
		this.pressure = {name: "Pressure", value: obj.pressure, isHidden: true}
		this.weight = {name: "Weight", value: obj.weight, isHidden: true}
		this.illness = {name: "Illness", value: obj.illness, isHidden: true}
		this.age = {name: "Age", value: obj.age, isHidden: true}
	}
}

class Dentist extends Visit{
	constructor(obj){
		super(obj)
		this.lastVisit = {name: "Last visit", value: obj.lastVisit, isHidden: true}
	}
}

class Therapist extends Visit{
	constructor(obj){
		super(obj)
		this.age = {name: "Age", value: obj.age, isHidden: true}
	}
}

function newCard(obj){
	let card
		switch(obj.doctor){
			case "Therapist": 
				card = new Therapist(obj)
				break
			case "Dentist":
				card = new Dentist(obj)
				break
			case "Cardiologist":
				card = new Cardio(obj)
				break
		}
		card.buildCard()
		storeObj(card)
		stub.style.display = "none"
}

//CREATING CARDS

//Restore cards from local storage
if(localStorage.cards){
	let cardsArr = JSON.parse(localStorage.cards)
	cardsArr.forEach(el => {
		newCard(el)
	})
}

let form = document.getElementById('form')
let createCard = document.getElementById('createCard')

//VALIDATION
let inputForm = document.querySelectorAll('.modal-form-input')
let inputBlock = document.getElementById('modal-form-input-block')
let textArea = document.querySelector('.modal-form-area')
let errorMessage = document.createElement('span')

class CardsError {
	constructor (message) {
		this.message = message
		this.name = 'CardsError: '
	}

	error() {
		inputForm.forEach(el => {
			if (el.value === '') {
				el.style.borderColor = 'red'
			}
			let error = document.getElementById('modal-error')
			if(!error) {
				inputBlock.appendChild(errorMessage)
			}
			errorMessage.style.color = 'red'
			errorMessage.id = 'modal-error'
			errorMessage.innerText = this.name + this.message
			errorMessage.style.display = 'block'
		})
	}
}

createCard.onclick = () => {
	try {
		inputForm.forEach(el => {
			if (el.value === '' && el.style.display === 'block') {
				throw new CardsError('Invalid value')
			}
			el.style.borderColor = '#b8860b'
			errorMessage.style.display = 'none'
		})
		let dataObj = {}
		dataObj.doctor = form.querySelector('select').value
		let inputs = form.querySelectorAll('input')
		for (let i = 0; i < inputs.length; i++)
			dataObj[inputs[i].dataset.name] = inputs[i].value
		dataObj.comment = form.querySelector('textarea').value
		newCard(dataObj)
		inputForm.forEach( input => {
			input.value = ''
		})
		textArea.value = ''
		modal.style.display = "none"

	} catch (e) {
		e.error()
	}
//
}

//FILTER
function filterForm() {
	let selectForm = document.getElementById('select-form').value
	let cardiologistInputs = ['name', 'age', 'purpose', 'pressure', 'weight', 'illness']
	let dentistInputs = ['name', 'purpose', 'lastVisit']
	let therapistInputs = ['name', 'age', 'purpose']

	inputForm.forEach((el) => {
		el.style.display = 'none'
		el.value = ''
		textArea.value = ''
		errorMessage.style.display = 'none'
		el.style.borderColor = '#b8860b'

		if (selectForm === 'Cardiologist' && cardiologistInputs.includes(el.dataset.name)) {
			el.style.display = 'block'
		} else if (selectForm === 'Dentist' && dentistInputs.includes(el.dataset.name)) {
			el.style.display = 'block'
		} else if (selectForm === 'Therapist' && therapistInputs.includes(el.dataset.name)) {
			el.style.display = 'block'
		}
	})
}

filterForm()


//DRAG & DROP

let dropStatus = false
let z = 1
let absoluteEl, cordinateY, cordinateX, shiftX, shiftY

destinaton.addEventListener('mousemove', (e) => {
	let rect = destinaton.getBoundingClientRect()
	cordinateY = e.clientY - rect.top
	cordinateX = e.clientX - rect.left

	if(dropStatus){
		absoluteEl.style.top = (cordinateY - shiftY) + "px"
		absoluteEl.style.left = (cordinateX - shiftX) + "px"
	}
})


destinaton.addEventListener('mousedown', e => {
	if(dragItems.includes(e.target)){
		dropStatus = true
		let rect = e.target.getBoundingClientRect()
		shiftY = e.clientY - rect.top
		shiftX = e.clientX - rect.left

		absoluteEl = e.target
		absoluteEl.style.zIndex = z++
		if(e.target.style.position === ""){
			let dummy = document.createElement("div")
			dummy.className = "dummy"
			destinaton.insertBefore(dummy, e.target)
		}

		absoluteEl.style.position = "absolute"
	}
})

destinaton.addEventListener("mouseup", e => {
	if (dropStatus) {
		let rect = destinaton.getBoundingClientRect()
		dropStatus = false
		absoluteEl.style.visibility = "hidden"
		let elUnderCursor = document.elementFromPoint(e.pageX, e.pageY)
		absoluteEl.style.visibility = 'visible'
		if (e.clientX > rect.right || e.clientX < rect.left || e.clientY > rect.bottom || e.clientY < rect.top){
			let dummy = destinaton.querySelector(".dummy")
			absoluteEl.style.position = ""
			destinaton.insertBefore(absoluteEl, dummy)
			destinaton.removeChild(dummy)
		}
	}
})