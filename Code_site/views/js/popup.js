document.addEventListener('DOMContentLoaded', () => {
    const openPopupButton = document.getElementById('open-popup');
    const closePopupButton = document.getElementById('close-popup');
    const popup = document.getElementById('popup');
    const nextStepButton = document.getElementById('next-step');
    const residenceInput = document.getElementById('residence');
    const studyInput = document.getElementById('study');
    const radiusInput = document.getElementById('radius');
    const radiusValue = document.getElementById('radius-value');
    const mapElement = document.getElementById('map');
    const checkbox = document.getElementById('not-student');
    let map, residenceMarker, studyMarker, circle;
    let universitySelectedFromDropdown = false;
    const formData = {
        step1: {},
        step2: {},
        step3: {},
        step4: {}
    };
    let currentStep = 1;

    const customIcon = L.icon({
        iconUrl: '../img/icons8-pin-30.png', // Provide the path to your downloaded icon
        iconSize: [32, 32], // Adjust the size of the icon
        iconAnchor: [16, 32], // Anchor the icon at the bottom center
        popupAnchor: [0, -32] // Position the popup above the icon
    });

    openPopupButton.addEventListener('click', () => {
        popup.classList.remove('hidden');
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    });

    closePopupButton.addEventListener('click', () => {
        popup.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.classList.add('hidden');
        }
    });

    radiusInput.addEventListener('input', () => {
        radiusValue.textContent = `${radiusInput.value} km`;
        updateRadius();
    });

    function initializeMap() {
        map = L.map(mapElement).setView([52.3676, 4.9041], 10); // Default to Amsterdam
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }

    function updateMap(location, isStudy) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const { lat, lon } = data[0];
                    const latLng = [lat, lon];
                    if (isStudy) {
                        if (studyMarker) map.removeLayer(studyMarker);
                        studyMarker = L.marker(latLng, { icon: customIcon }).addTo(map).bindPopup('Place of Study');
                    } else {
                        if (residenceMarker) map.removeLayer(residenceMarker);
                        residenceMarker = L.marker(latLng, { icon: customIcon }).addTo(map).bindPopup('Place of Residence');
                    }
                    map.setView(latLng, 13);
                    updateRadius();
                }
            });
    }

    function updateRadius() {
        if (circle) {
            map.removeLayer(circle);
        }
        if (studyMarker) {
            const latLng = studyMarker.getLatLng();
            if (circle) map.removeLayer(circle);
            circle = L.circle(latLng, {
                radius: radiusInput.value * 1000, // Convert km to meters
                color: '#4F3CC9'
            }).addTo(map);
        } else if (residenceMarker) {
            const latLng = residenceMarker.getLatLng();
            circle = L.circle(latLng, {
                radius: radiusInput.value * 1000, // Convert km to meters
                color: '#4F3CC9'
            }).addTo(map);
        }
    }

    residenceInput.addEventListener('blur', () => {
        const newCity = residenceInput.value;
        // Clear the university input and remove the university marker
        studyInput.value = '';
        if (studyMarker) {
            map.removeLayer(studyMarker);
            studyMarker = null;
        }
        if (circle) {
            map.removeLayer(circle);
            circle = null;
        }
        previousCity = newCity; // Update previous city
        updateMap(residenceInput.value, false);
    });
    studyInput.addEventListener('blur', () => {
        if (!universitySelectedFromDropdown) {
            updateMap(studyInput.value, true);
        }
        universitySelectedFromDropdown = false; // Reset the flag after handling blur
    });

    initializeMap();

    checkbox.addEventListener('change', (event) => {
        if (event.target.checked) {
                studyInput.value = ''; // Clear the study input text
                studyInput.disabled = true; // Disable the study input
                setTimeout(() => {
                if (studyMarker) {
                    map.removeLayer(studyMarker); // Remove the study marker from the map
                    studyMarker = null;
                }
                if (circle) {
                    map.removeLayer(circle); // Remove the radius circle from the map
                    circle = null;
                }
                if (residenceMarker) {
                    updateRadius(); // Update radius for the city
                }
                }, 300);
            if (circle) {
                map.removeLayer(circle); // Remove the radius circle from the map
                circle = null;
            }
        } else {
            studyInput.disabled = false;
        }
    });

    const validCities = {
        "Amsterdam": [
            "University of Amsterdam",
            "Vrije Universiteit Amsterdam",
            "Hogeschool Van Amsterdam",
            "Tinbergen Institute",
            "Amsterdam University College",
            "Amsterdam School of the Arts",
            "Amsterdam Fashion Institute"
        ],
        "Rotterdam": [
            "Erasmus University Rotterdam",
            "Rotterdam University of Applied Sciences",
            "Codarts University of the Arts",
            "Islamic University of Rotterdam"
        ],
        "The Hague": [
            "The Hague University of Applied Sciences (De Haagse Hogeschool)",
            "Delft University of Technology",
            "Inholland University of Applied Sciences",
            "Hotelschool The Hague",
            "International Institute of Social Studies, ISS",
            "Leiden University – Campus The Hague",
            "Leiden University College The Hague (LUC)",
            "Royal Academy of Art",
            "Royal Conservatoire"
        ],
        "Utrecht": [
            "Utrecht University",
            "HU University of Applied Sciences Utrecht",
            "University of Humanistic Studies",
            "Utrecht School of the Arts",
            "Tio University of Applied Sciences",
            "Manrix Academy"
        ],
        "Eindhoven": [
            "Eindhoven University of Technology",
            "Design Academy Eindhoven",
            "TIAS School for Business and Society"
        ],
        "Groningen": [
            "University of Groningen",
            "Hanze University Groningen",
            "University of Applied Sciences for Pedagogical and Social Education SPO Groningen",
            "Energy Delta Institute"
        ],
        "Leiden": [
            "Leiden University",
            "Hogeschool Leiden, University of Professional Education",
            "Leiden, Webster University"
        ],
        "Delft": [
            "Delft University of Technology",
            "The Hague University",
            "IHE Delft Institute for Water Education",
            "Inholland University of Applied Sciences",
            "The Hague Pathway College"
        ],
        "Maastricht": [
            "Maastricht University",
            "Maastricht School of Management",
            "Maastricht Hotel Management School"
        ],
        "Tilburg": [
            "Tilburg School of Economics and Management",
            "Tilburg Law School",
            "Tilburg School of Social and Behavioral Sciences",
            "Tilburg School of Humanities and Digital Sciences",
            "Tilburg School of Catholic Theology"
        ]
    };

    function autocomplete(inp, arr) {
        var currentFocus;
        var previousValue = ""; // Variable to store the previous value

        inp.addEventListener("focus", function(e) {
            setTimeout(() => {
                previousValue = this.value; // Store current value on focus
                this.value = ''; // Clear the input when it gains focus
                updateAutocompleteList(''); // Show all cities on focus
            }, 200);
        });

        inp.addEventListener("input", function(e) {
            updateAutocompleteList(this.value);
        });

        inp.addEventListener("blur", function(e) {
            if (inp === studyInput && universitySelectedFromDropdown) {
                universitySelectedFromDropdown = false; // Reset the flag after handling blur
                return; // Do not restore the previous value if a valid university was selected
            }

            if (this.value.trim() === '') { // If no new input is entered, restore the previous value
                this.value = previousValue;
            } else {
                const matches = arr.filter(item => item.toUpperCase().startsWith(this.value.toUpperCase()));
                if (matches.length >= 1) { // Only one match found, autocomplete it
                    this.value = matches[0];
                    updateMap(this.value, inp === studyInput);
                } else if (matches.length === 0) { // No matches found, restore previous value
                    this.value = previousValue;
                } // If multiple matches, leave the input as the user left it (could clear it or show an error)
            }
        });

        function updateAutocompleteList(val) {
            closeAllLists();
            currentFocus = -1;
            var a = document.createElement("DIV");
            a.setAttribute("id", inp.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            inp.parentNode.appendChild(a);
            for (var i = 0; i < arr.length; i++) {
                if (!val || arr[i].substr(0, val.length).toUpperCase() === val.toUpperCase()) {
                    var b = document.createElement("DIV");
                    b.innerHTML = arr[i];
                    b.addEventListener("mousedown", function(e) {
                        e.preventDefault(); // Prevent blur event
                        inp.value = this.innerText;
                        previousValue = this.innerText; // Update previous value to the selected city
                        closeAllLists();
                        updateMap(this.innerText, inp === studyInput); // Update map with the selected value
                        if (inp === residenceInput) {
                            enableUniversityInput(this.innerText); // Enable and update university input
                        } else if (inp === studyInput) {
                            universitySelectedFromDropdown = true; // Set the flag when a university is selected from the dropdown
                        }
                    });
                    a.appendChild(b);
                }
            }
            if (a.childNodes.length === 0) { 
                closeAllLists(); 
            }
        }

        inp.addEventListener("keydown", function(e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) {
                e.preventDefault();
                if (currentFocus > -1 && x) {
                    x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = x.length - 1;
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }

        function closeAllLists(elmnt) {
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }

        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    function enableUniversityInput(city) {
        studyInput.disabled = false;
        const universities = validCities[city] || [];
        autocomplete(studyInput, universities);
    }
    
    var cities = Object.keys(validCities);
    autocomplete(residenceInput, cities);
});
