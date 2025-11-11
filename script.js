// DOM Elements
const searchForm = document.getElementById("searchForm")
const errorModal = document.getElementById("errorModal")
const closeModalBtn = document.getElementById("closeModalBtn")
const errorOkBtn = document.getElementById("errorOkBtn")
const errorMessage = document.getElementById("errorMessage")
const travelersInput = document.getElementById("travelers")
const travelersDropdown = document.getElementById("travelersDropdown")
const destinationInput = document.getElementById("destination")
const suggestionsContainer = document.getElementById("suggestions")

const destinations = [
  "Paris, France", "London, England", "New York, USA", "Tokyo, Japan", "Rome, Italy",
  "Barcelona, Spain", "Amsterdam, Netherlands", "Berlin, Germany", "Sydney, Australia", "Dubai, UAE",
  "Mumbai, India", "Delhi, India", "Bangalore, India", "Goa, India", "Kerala, India",
  "Rajasthan, India", "Agra, India", "Jaipur, India", "Chennai, India", "Kolkata, India"
]

// Tab functionality
const tabButtons = document.querySelectorAll(".tab-btn")
const searchTypeInput = document.getElementById("searchType")
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    button.classList.add("active")
    searchTypeInput.value = button.getAttribute("data-tab")
  })
})

// Travelers dropdown
let adultsCount = 2, childrenCount = 0, roomsCount = 1, petsEnabled = false

travelersInput.addEventListener("click", (e) => {
  e.preventDefault()
  travelersDropdown.style.display = travelersDropdown.style.display === "block" ? "none" : "block"
})

document.querySelectorAll(".counter-btn").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.preventDefault()
    const type = button.getAttribute("data-type")
    const isIncrease = button.classList.contains("increase")
    if (type === "adults") {
      adultsCount += isIncrease ? 1 : (adultsCount > 1 ? -1 : 0)
      document.getElementById("adultsCount").textContent = adultsCount
    } else if (type === "children") {
      childrenCount += isIncrease ? 1 : (childrenCount > 0 ? -1 : 0)
      document.getElementById("childrenCount").textContent = childrenCount
    } else if (type === "rooms") {
      roomsCount += isIncrease ? 1 : (roomsCount > 1 ? -1 : 0)
      document.getElementById("roomsCount").textContent = roomsCount
    }
    updateTravelersDisplay()
  })
})

const petsToggle = document.getElementById("petsToggle")
if (petsToggle) {
  petsToggle.addEventListener("change", (e) => {
    petsEnabled = e.target.checked
  })
}

document.querySelector(".btn-done").addEventListener("click", (e) => {
  e.preventDefault()
  travelersDropdown.style.display = "none"
})

function updateTravelersDisplay() {
  const adultsText = adultsCount === 1 ? "1 adult" : `${adultsCount} adults`
  const childrenText = childrenCount === 0 ? "0 children" : childrenCount === 1 ? "1 child" : `${childrenCount} children`
  const roomsText = roomsCount === 1 ? "1 room" : `${roomsCount} rooms`
  travelersInput.value = `${adultsText} · ${childrenText} · ${roomsText}`
}

// Destination suggestions
function debounce(func, delay = 300) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), delay)
  }
}

destinationInput.addEventListener("input", debounce((e) => {
  const query = e.target.value.toLowerCase()
  if (!query) {
    suggestionsContainer.style.display = "none"
    return
  }
  const filtered = destinations.filter(d => d.toLowerCase().includes(query))
  if (filtered.length > 0) {
    suggestionsContainer.innerHTML = filtered.slice(0, 5)
      .map(dest => `<div class="suggestion-item" data-destination="${dest}">${dest}</div>`).join("")
    suggestionsContainer.style.display = "block"
  } else {
    suggestionsContainer.style.display = "none"
  }
}))

suggestionsContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("suggestion-item")) {
    destinationInput.value = e.target.getAttribute("data-destination")
    suggestionsContainer.style.display = "none"
  }
})

document.addEventListener("click", (e) => {
  if (!destinationInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
    suggestionsContainer.style.display = "none"
  }
  if (!travelersInput.contains(e.target) && !travelersDropdown.contains(e.target)) {
    travelersDropdown.style.display = "none"
  }
})

// Set min check-in date
const today = new Date().toISOString().split("T")[0]
document.getElementById("checkIn").setAttribute("min", today)

document.getElementById("checkIn").addEventListener("change", (e) => {
  const checkIn = e.target.value
  const checkOutInput = document.getElementById("checkOut")
  checkOutInput.setAttribute("min", checkIn)
  if (checkOutInput.value && checkOutInput.value <= checkIn) {
    checkOutInput.value = ""
  }
})

// Form validation
searchForm.addEventListener("submit", (e) => {
  e.preventDefault()

  const formData = {
    destination: destinationInput.value.trim(),
    checkIn: document.getElementById("checkIn").value,
    checkOut: document.getElementById("checkOut").value,
    travelers: travelersInput.value,
    searchType: searchTypeInput.value,
    adults: adultsCount,
    children: childrenCount,
    rooms: roomsCount,
    pets: petsEnabled,
  }

  const errors = validateForm(formData)
  if (errors.length > 0) {
    showErrorModal(errors[0])
    return
  }

  redirectToResults(formData)
})

function validateForm(data) {
  const errors = []
  if (!data.destination) errors.push("Please enter a destination")
  if (!data.checkIn) errors.push("Please select a check-in date")
  if (!data.checkOut) errors.push("Please select a check-out date")

  if (data.checkIn && data.checkOut) {
    const inDate = new Date(data.checkIn)
    const outDate = new Date(data.checkOut)
    const now = new Date(); now.setHours(0, 0, 0, 0)

    if (inDate < now) errors.push("Check-in date cannot be in the past")
    if (outDate <= inDate) errors.push("Check-out date must be after check-in date")

    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 2)
    if (inDate > maxDate) errors.push("Check-in date cannot be more than 2 years in the future")
  }

  return errors
}

function redirectToResults(data) {
  const params = new URLSearchParams({
    destination: data.destination,
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    searchType: data.searchType,
    adults: data.adults,
    children: data.children,
    rooms: data.rooms,
    pets: data.pets,
  })

  localStorage.setItem("lastSearch", JSON.stringify(data))

  // Redirect to P4.html
  window.location.href = `p9.html?${params.toString()}`
}

// Modal handlers
function showErrorModal(msg) {
  errorMessage.textContent = msg
  errorModal.style.display = "block"
}
function hideErrorModal() {
  errorModal.style.display = "none"
}
closeModalBtn.addEventListener("click", hideErrorModal)
errorOkBtn.addEventListener("click", hideErrorModal)
window.addEventListener("click", (e) => {
  if (e.target === errorModal) hideErrorModal()
})
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && errorModal.style.display === "block") hideErrorModal()
})

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  updateTravelersDisplay()
  const lastSearch = localStorage.getItem("lastSearch")
  if (lastSearch) {
    try {
      const data = JSON.parse(lastSearch)
      console.log("Last search:", data)
    } catch (err) {
      console.log("No valid previous search data")
    }
  }
})
