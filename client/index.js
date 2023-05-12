
// Code for month selection
let currentMonth = new Date().getMonth();

function changeMonth(direction) {
  currentMonth += direction;
  updateMonthDisplay();
}

function updateMonthDisplay() {
  const year = new Date().getFullYear();
  const monthDisplay = document.getElementById("monthDisplay");
  if (monthDisplay) {
    // checks if the element exists before modifying its contents
    monthDisplay.textContent = new Date(year, currentMonth, 1).toLocaleString(
      "default",
      { month: "long" }
    );
  }
}


// creating template and removing it
let templateDisplayed = false;
let templateRemoved = false;

function showTemplate() {
  if (templateDisplayed) {
    alert("You can only have 1 log available at a time");
    return;
  }

  templateDisplayed = true;

  const template = document.getElementById("dateTemplate");
  const dateContainer = document.getElementById("dateContainer");

  const clone = template.content.cloneNode(true);
  dateContainer.appendChild(clone);
  updateMonthDisplay();
}

function removeTemplate() {
  const dateContainer = document.getElementById("dateContainer");
  dateContainer.innerHTML = "";
  templateDisplayed = false;
  templateRemoved = true;
}



function submitDate() {
  const dayInput = document.getElementById("dayInput");
  const day = dayInput.value;
  const placementText = document.getElementById("placementText").value;
  const skillsInput = document.getElementById("skillsText");
  const skills = skillsInput.value;

  const year = new Date().getFullYear();
  const month = currentMonth;

  function getMaxDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  const maxDays = getMaxDaysInMonth(year, month);
  if (day <= 0 || day > maxDays) {
    alert(`Please enter a valid day from 1-${maxDays}`);
    return;
  }

  // Check if the selected date is valid
  const selectedDate = new Date(year, currentMonth, day);
  if (selectedDate.getMonth() !== month) {
    alert("Please enter a valid date");
    return;
  }

  const isoDate = selectedDate.toISOString().split("T")[0];

  const data = {
    date: isoDate,
    description: placementText,
    skills: skills,
  };

  // Send the data to the server
  fetch("/api/placement_logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((result) => {
      console.log("Placement log entry created with ID:", result.id);
      alert("Placement log successfully added");
      const sql = `INSERT INTO placement_log (date, description, skills) VALUES ('${isoDate}', '${placementText}', '${skills}');\n`;
      console.log("SQL Query:", sql);
      // removes the template after 3 seconds
      setTimeout(() => {
        const dateContainer = document.getElementById("dateTemplate");
        if (dateContainer.firstChild) {
          dateContainer.removeChild(dateContainer.firstChild);
        }
      }, 3000);
    })
    .catch((error) => {
      console.error(error.message);
      alert("An error has occurred; check the console for more info");
    });
}

function printLogs() {
  fetch('/api/placement_logs')
    .then(response => response.json())
    .then(logs => {
      const logsContainer = document.getElementById('logsContainer');
      logsContainer.innerHTML = ''; // clear the previous logs

      if (logs.length > 0) {
        for (const log of logs) {
          const logDate = new Date(log.date);
          const formattedDate = `${logDate.getMonth() + 1}/${logDate.getDate()}/${logDate.getFullYear()}`;

          // create an element for the log entry
          const logEntry = document.createElement('div');
          logEntry.classList.add('log-entry');

          // create elements for the log details
          const dateElement = document.createElement('div');
          dateElement.textContent = `Date: ${formattedDate}`;
          const descriptionElement = document.createElement('div');
          descriptionElement.textContent = `Description: ${log.description}`;
          const skillsElement = document.createElement('div');
          skillsElement.textContent = `Skills: ${log.skills}`;

          // add an event listener to allow modification of log entry
          logEntry.addEventListener('click', () => {
            modifyLog(log);
          });

          // adding log details to the log entry
          logEntry.appendChild(dateElement);
          logEntry.appendChild(descriptionElement);
          logEntry.appendChild(skillsElement);

          // adding log entry to the logs container
          logsContainer.appendChild(logEntry);
        }
      } else {
        console.log('No logs to display');
      }
    })
    .catch(error => {
      console.error(`An error occurred while fetching the logs: ${error.message}`);
    });
}

function deleteLog(id) {
  fetch(`/api/placement_logs/:id`, {
    method: 'DELETE'
  })
  .then(res => {
    if (res.ok) {
      console.log('Log successfully deleted.');
    } else {
      console.log('An error occurred when deleting the log.');
    }
  })
  .catch(error => console.log('An error occurred:', error));
}


function modifyLog(log) {
  const deletion = confirm("Would you like to delete this log?");
  
  if (deletion) {
    deleteLog(log.id);
    return; // Exit the function when a log is deleted
  }

  const modifiedLog = {
    id: log.id,
    date: log.date,
    description: log.description,
    skills: log.skills,
  };

  const modifiedDate = prompt('Enter a new date', log.date);
  if (modifiedDate) {
    modifiedLog.date = modifiedDate;
  }

  const modifiedDescription = prompt('Enter a new description', log.description);
  if (modifiedDescription) {
    modifiedLog.description = modifiedDescription;
  }

  const modifiedSkills = prompt('Enter new skills', log.skills);
  if (modifiedSkills) {
    modifiedLog.skills = modifiedSkills;
  }

  fetch(`/api/placement_logs/${log.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(modifiedLog),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((result) => {
      console.log('Placement log modified with ID:', result.id);
      alert('Placement log successfully modified');
      printLogs(); // refreshes the current logs to show changes
    })
    .catch((error) => {
      console.error(error.message);
      alert('An error has occurred; check the console for more info');
    });
}