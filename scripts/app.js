'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressCoverBar: document.querySelector('.progress__cover-bar'),
		progressPercent: document.querySelector('.progress__percent')
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.habbit__day'),
		form: document.querySelector('.habbit__form')
	},
	popup: {
		index: document.getElementById('add-habbit-popup'),
		closed: document.querySelector('.popup__close'),
		open: document.querySelector('.menu__add'),
		iconField: document.querySelector('.popup__form input[name="icon"]'),
		iconButtons: document.querySelectorAll('.icon-select .icon'),
		form: document.querySelector('.popup__form')
	}
}

// utils

function loadData() {
	const habbitString = localStorage.getItem(HABBIT_KEY);
	const habbitArray = JSON.parse(habbitString);

	if (Array.isArray(habbitArray)) {
		habbits = habbitArray;
	}
};

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
};


function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = '';
	}
};

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};
	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');
		if (!fieldValue) {
			form[field].classList.add('error');
		}
		res[field] = fieldValue;
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]) {
			isValid = false;
		}
	}
	if (!isValid){
		return;
	}
	return res;
}

// render

function rerenderMenu(activeHabbit) {
	globalActiveHabbitId = activeHabbit.id;
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if(!existed) {
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id));
			element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}" />`;
			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			}
			page.menu.appendChild(element);
			continue;
		}
		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}

}

function rerenderHeader(activeHabbit) {
	page.header.h1.innerText = activeHabbit.name;
	const progress = activeHabbit.days.length / activeHabbit.target > 1 ? 100 : activeHabbit.days.length / activeHabbit.target * 100;
	page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
	page.header.progressCoverBar.style.width = `${progress}%`;
};

function rerenderContent(activeHabbit) {
	page.content.daysContainer.innerHTML = '';
	for (const index in activeHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habbit');
		element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
              <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
              <button class="habbit__delete" onclick="deleteDay(${index})">
                <img src="./images/delete.svg" />
              </button>`;
		page.content.daysContainer.appendChild(element);
	}
	page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;

};

function addDays(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ['comment']);
	if (!data) {
		return
	}
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: data.comment }])
			}
		}
		return habbit;
	});
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	saveData();
}

page.content.form.addEventListener('submit', addDays);

function deleteDay(index) {
	habbits = habbits.map(habbit => {
		if(habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			}
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}


function rerender(activeHabbitId) {
	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
	if(!activeHabbit) {
		return;
	}
	document.location.replace(`${document.location.pathname}#${activeHabbitId}`);
	rerenderMenu(activeHabbit);
	rerenderHeader(activeHabbit);
	rerenderContent(activeHabbit);
};

function togglePopup () {
	if (page.popup.index.classList.contains('cover_hidden')) {
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

page.popup.open.addEventListener('click', togglePopup);
page.popup.closed.addEventListener('click', togglePopup);

function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');
	context.classList.add('icon_active');
}

page.popup.iconButtons.forEach((button) =>
  button.addEventListener("click", () =>
    setIcon(button, button.querySelector("img").getAttribute("alt"))
  )
);

function addHabbit(event) {
	event.preventDefault();
	const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}
	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});
	resetForm(event.target, ['name', 'target']);
	togglePopup();
	rerender(maxId + 1);
}

page.popup.form.addEventListener('submit', addHabbit);

(() => {
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''));
	const urlHabbit = habbits.find(habbit => habbit.id === hashId);
	urlHabbit ? rerender(urlHabbit.id) : rerender(habbits[0].id);
})();


