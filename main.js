// Local Storage Utility to save and retrieve.
const setLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
}
const getLocalStorageItem = (key) => JSON.parse(localStorage.getItem(key));

let data = getLocalStorageItem("Data") || [];
let noteId = null;  // To add subNote to the given id.
let editNoteId = null;  // To edit the text of the given note.
let isEditable = false; // To make note of the id editable.
// Utilities to create elements.
const createDivElement = () => document.createElement("DIV");
const createInputElement = () => document.createElement("INPUT");
const createSpanElement = () => document.createElement("SPAN");
const createButtonElement = () => document.createElement("BUTTON");
const getElementById = id => document.getElementById(id);

/**
 * This function returns the debounced function to optimize the render cycles.
 * @param {Function} func 
 * @param {Number} delay 
 */
const debounce = (func, delay) => {
  let timerId = null;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  }
}

/**
 * Function generates the integers for the unique id.
 */
const idGenerator = () => {
  // Saving the count in the localStorage to keep track of the id.
  let count = getLocalStorageItem("count") || 1;
  return () => {
    setLocalStorage("count", count + 1);
    return count++;
  }
};
const generateId = idGenerator();
const notesContainer = getElementById("notesContainer");

/**
 * This function sets data to localStorage and triggers the DOM update.
 * @param {Array} data 
 */
const setAndTrigger = data => {
  setLocalStorage("Data", data);
  triggerUpdate(data);
};

/**
 * Triggers the DOM update.
 * @param {Array} data 
 */
const triggerUpdate = (data) => {
  notesContainer.innerHTML = "";
  data.forEach(parentNote => {
    notesContainer.appendChild(createNoteSubNotesContainer(parentNote));
  });
}

/**
 * This function returns DOM node for the cards to be rendered.
 * @param {Array} note 
 */
const createNoteSubNotesContainer = (note) => {
  let div1 = createDivElement();
  let div2 = createDivElement();
  let div3 = createDivElement();
  if (isEditable && note.id == editNoteId) {
    let editInput = createInputElement();
    editInput.setAttribute("id", note.id);
    editInput.value = note.text;
    editInput.addEventListener("keydown", (event) => { 
      if (event.keyCode === 13) {
        noteId = null;
        const value = event.target.value;
        const id = event.target.id;
        editNoteText(data, value, id);
        triggerUpdate(data);
      }
    });
    div2.appendChild(editInput);
    setTimeout(() => {
      editInput.focus();
    });
  } else {
    let span = createSpanElement();
    span.addEventListener("click", (event) => {
      editNote(event);
    });
    span.setAttribute("id", note.id);
    let text = document.createTextNode(note.text);
    span.appendChild(text);
    div2.appendChild(span);
  }
  div2.classList.add("notes");
  div2.classList.add("card");
  if (note.id == noteId) {
    div2.classList.add("toogleCardSelection");
  } else div2.classList.remove("toogleCardSelection");
  addButtons(div2, note);
  div1.appendChild(div2);
  if (note.childNotes) {
    note.childNotes.forEach(note => {
      div3.appendChild(createNoteSubNotesContainer(note));
    });
  };
  div3.classList.add("subNotes");
  div1.appendChild(div3);
  return div1;
}

/**
 * Adding buttons and their respective events to the DOM nodes.
 * @param {DOM} div 
 * @param {Object} note 
 */
const addButtons = (div, note) => {
  let divButton = createDivElement();
  let button1 = createButtonElement();
  let button2 = createButtonElement();
  button1.setAttribute("id", note.id);
  button2.setAttribute("id", note.id);
  button1.innerHTML = "DELETE";
  button2.innerHTML = "ADD NOTE";
  button1.classList.add("deleteNote");
  button2.classList.add("addNoteBtn");
  button1.addEventListener("click", (event) => {
    noteId = null;
    const noteIdToDelete = event.target.id;
    deleteNote(data, noteIdToDelete);
    setAndTrigger(data);
  });
  button2.addEventListener("click", (event) => {
    const id = event.target.id;
    if (noteId === id) noteId = null;
    else noteId = id;
    getElementById("note").focus();
    triggerUpdate(data);
  });
  divButton.appendChild(button1);
  divButton.appendChild(button2);
  divButton.classList.add("buttonDiv");
  div.appendChild(divButton);
}

/**
 * Create a new note
 * @param {Event} event 
 */
const createNote = (event) => {
  event.preventDefault();
  let input = getElementById("note");
  let textValue = input.value;
  if (textValue.trim().length < 4 || textValue.trim().length > 20) return;
  let newId = generateId();
  let noteObj = { id: newId, text: textValue };
  if (noteId) {
    addIntoChild(data, noteId, noteObj);
  } else {
    data.push(noteObj);
  }
  input.value = "";
  setAndTrigger(data);
}

/**
 * Adding object to the notes child.
 * @param {Array} data 
 * @param {String} noteId 
 * @param {Object} noteObj 
 */
const addIntoChild = (data, noteId, noteObj) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == noteId) {
      if (!data[i].childNotes) data[i].childNotes = [];
      data[i].childNotes.push(noteObj);
      return;
    } else {
      if (data[i].childNotes) {
        addIntoChild(data[i].childNotes, noteId, noteObj);
      }
    }
  }
}

/**
 * Delete note of particular noteId
 * @param {Array} data 
 * @param {String} noteId 
 */
const deleteNote = (data, noteId) => {
  let idx = data.findIndex(el => el.id == noteId);
  if (idx > -1) data.splice(idx, 1);
  else {
    data.forEach(el => {
      el.childNotes && deleteNote(el.childNotes, noteId);
    });
  }
}

/**
 * Editing the name of the note.
 * @param {Event} event 
 */
const editNote = (event) => {
  isEditable = true;
  editNoteId = event.target.id;
  setAndTrigger(data);
}

/**
 * Edit the note text.
 * @param {Array} data 
 * @param {String} text 
 * @param {String} id 
 */
const editNoteText = (data, text, id) => {
  for (let i = 0; i < data.length; i++) {
    if (data[i].id == id) {
      data[i].text = text;
      isEditable = false;
      editNoteId = null;
      return;
    } else {
      if (data[i].childNotes) {
        editNoteText(data[i].childNotes, text, id);
      }
    }
  }
}

/**
 * Function triggers for search.
 * @param {Event} event 
 */
const _searchNotes = (event) => {
  noteId = null;
  let arr = [];
  let data = getLocalStorageItem("Data");
  const value = event.target.value;
  if (value.trim().length === 0) {
    triggerUpdate(getLocalStorageItem("Data") || []);
    return;
  }
  searchValue(arr, data, value);
  data = arr;
  triggerUpdate(data);
}

// Debouced function for searching notes.
const searchNotes = debounce(_searchNotes, 800);

/**
 * This function saves the matching notes to the array.
 * @param {Array} arr 
 * @param {Array} data 
 * @param {String} value 
 */
const searchValue = (arr, data, value) => {
  data.forEach(el => {
    if (el.text == value) {
      arr.push({ id: el.id, text: el.text });
    }
    if (el.childNotes) searchValue(arr, el.childNotes, value);
  });
}

// Trigger the initial render.
triggerUpdate(data);