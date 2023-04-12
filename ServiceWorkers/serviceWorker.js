function DOMtoString(selector) {
  console.log("does it log here? I don't think so...")
  if (selector) {
    selector = document.querySelector(selector);
    if (!selector) return "ERROR: querySelector failed to find node"
  } else {
    selector = document.documentElement;
  }
  return selector.innerHTML;
}

function getTodaysDate() {
  const now = new Date();
  const day = ("0" + now.getDate()).slice(-2);
  const month = ("0" + (now.getMonth() + 1)).slice(-2);
  const today = now.getFullYear() + "-" + (month) + "-" + (day);
  return today
}
function outside(){
  console.log("this is from the outside")
}
function selectAllHeaderText() {
  let res = {
    "headers": Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(h => h.textContent),
    "inputs": Array.from(document.querySelectorAll("input")).map(h => h.name + h.type)
  } 
  return res
}

async function getTabId() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    var tabId = tabs[0].id;
    return tabId
  });
  
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    let response_bucket = {
      data: {
        companyName: "a company namer here",
        jobTitle: "not this",
        jobUrl: "not this",
        dateApplied: getTodaysDate(),
        possibleJobTitles: [],
        inputFields: []
      }
    }

    chrome.tabs.query({ active: true, currentWindow: true})
    .then(function (tabs) {
      response_bucket.data.jobUrl = tabs[0].url
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: selectAllHeaderText,
        }).then(injectionResults => {
          response_bucket.data.possibleJobTitles = injectionResults[0].result["headers"]
          response_bucket.data.inputFields = injectionResults[0].result["inputs"]
          sendResponse(response_bucket)
        })
    })

    return true;
  }
);
