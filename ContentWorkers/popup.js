
// For "production"
const url = 'http://23.88.137.75/'

// For development 
// const url = 'http://localhost:8000'
// function loadScript(url)
// {    
//     var head = document.getElementsByTagName('head')[0];
//     var script = document.createElement('script');
//     script.type = 'text/javascript';
//     script.src = url;
//     head.appendChild(script);
// }
// loadScript("./authentication")
// import { getStatusElement } from "./authentication";

// const status = getStatusElement()
// if(status) {
//   status.innerText = "IMPORTED YIPPPEEEEE"
// } else {
//   let statusElement = document.getElementById("status")
//   status.innerText = "status failed to import"
// }

// --------------------- Infrastructure ---------------------

function saveOpportunity(response) {
  let token = localStorage.getItem('token')
  const opportunityUrl = `${url}create_opportunity?token=${token}`
  let xhr = new XMLHttpRequest();
  xhr.open("POST", opportunityUrl);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  let data = JSON.stringify(response)
  xhr.send(data);
}

  // ---------------------Infrastructure-> Utilities ---------------------
  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return jsonPayload
  }

// --------------------- Application Services ---------------------

function setUpJobTitleOptions(titles, jobTitleDropdown) {
  titles.forEach(element => {
    let option = document.createElement("option");
    option.value = element
    jobTitleDropdown.appendChild(option)
  });
}

function setScrapedInformation(webpageInformation) {
  let opportunityform = document.getElementById("opportunityForm")
  let jobTitleDropdown = document.getElementById("jobTitles")
  opportunityform.elements["jobUrl"].value = webpageInformation.data.jobUrl
  setUpJobTitleOptions(webpageInformation.data.possibleJobTitles, jobTitleDropdown)
  opportunityform.elements["dateApplied"].value = webpageInformation.data.dateApplied
  // let statusElement = document.getElementById("fake-console")
  // statusElement.innerText = JSON.stringify(webpageInformation)
}

function submitOpportunity(event) {
  event.preventDefault();
  let opportunityform = document.getElementById("opportunityForm")
  let valueToSave = {
    data: {},
    success: true,
    errors: []
  }
  const elements = opportunityform.elements
  for (let i = 0; i < elements.length; i++) {
    valueToSave.data[elements[i].name] = elements[i].value
  }
  valueToSave.data['date_applied'] = new Date().toISOString()
  saveOpportunity(valueToSave.data)
}

// --------------------- Domain Services ---------------------

function login(event) {
  event.preventDefault()
  let loginForm = document.getElementById("loginForm")

  const userName = loginForm.elements["userName"].value
  const password = loginForm.elements["password"].value
  const loginUrl = `${url}login?password=${password}&name=${userName}`;

  let xhr = new XMLHttpRequest();

  xhr.open("GET", loginUrl);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.send();

  function reqListener(response) {
    if(this.status == 200) {
      response = JSON.parse(this.responseText)
      localStorage.setItem("token", response['access_token']);
      checkLogin()
    } else {
      let welcomeBanner = document.getElementById("welcome-banner");
      welcomeBanner.innerText = "There was an error loggin you in :("
      localStorage.clear();
    }
  }

  xhr.addEventListener("load", reqListener);
}

function checkLogin() {
  let token = localStorage.getItem("token");
  if(!token) {
    return
  }

  let userName = JSON.parse(parseJwt(token))["sub"]

  if(userName != undefined) {
    let welcomeBanner = document.getElementById("welcome-banner");
    welcomeBanner.innerText = "Welcome!" + userName 
  }
}

// --------------------- Domain Model ---------------------



// ------------------------------------------------
// Decorate elements with functionality 
// Trigger any events that need to check information after the page has loaded. 
// ------------------------------------------------

const submitForm = document.getElementById("opportunityForm")
submitForm.addEventListener('submit', submitOpportunity)

const loginForm = document.getElementById("loginForm")
loginForm.addEventListener('submit', login)

chrome.runtime.sendMessage({ opportunityUrl: "hello" })
  .then((response) => {
    setScrapedInformation(response)
  });

checkLogin()



