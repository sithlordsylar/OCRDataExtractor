// main.js

document.addEventListener('DOMContentLoaded', () => {
  // Global state variables
  let sessionMode = false;
  let sessionResults = []; // Stores OCR data for each processed image
  let bypassFileModal = false; // Flag to bypass modal on file input click
  const allowedExtensions = ['jpg', 'jpeg', 'png'];

  // DOM elements
  const sessionToggle = document.getElementById('sessionToggle');
  const fileInput = document.getElementById('fileInput');
  const chooseFilesBtn = document.getElementById('chooseFilesBtn');
  const scanBtn = document.getElementById('scanBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const sessionControls = document.getElementById('sessionControls');
  const completeSessionBtn = document.getElementById('completeSessionBtn');
  const exportControls = document.getElementById('exportControls');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportXmlBtn = document.getElementById('exportXmlBtn');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const fileModal = document.getElementById('fileModal');
  const modalProceedBtn = document.getElementById('modalProceedBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const sessionReminder = document.getElementById('sessionReminder');
  const bottomReminder = document.getElementById('bottomReminder');
  const tooltip = document.getElementById('tooltip');
  const quickTipsBtn = document.getElementById('quickTipsBtn');
  const quickTipsModal = document.getElementById('quickTipsModal');
  const quickTipsCloseBtn = document.getElementById('quickTipsCloseBtn');
  const clearModal = document.getElementById('clearModal');
  const clearConfirmBtn = document.getElementById('clearConfirmBtn');
  const clearCancelBtn = document.getElementById('clearCancelBtn');

  // Quick Tips Modal events
  quickTipsBtn.addEventListener('click', () => {
    quickTipsModal.style.display = 'block';
  });
  quickTipsCloseBtn.addEventListener('click', () => {
    quickTipsModal.style.display = 'none';
  });

  // "Choose Files" button event: show file format modal
  chooseFilesBtn.addEventListener('click', () => {
    fileModal.style.display = 'block';
  });

  // File modal actions
  modalProceedBtn.addEventListener('click', () => {
    fileModal.style.display = 'none';
    bypassFileModal = true;
    fileInput.click();
  });
  modalCancelBtn.addEventListener('click', () => {
    fileModal.style.display = 'none';
  });

  // In case fileInput is clicked directly (should be bypassed if using "Choose Files")
  fileInput.addEventListener('click', (e) => {
    if (!bypassFileModal) {
      e.preventDefault();
      fileModal.style.display = 'block';
    } else {
      bypassFileModal = false;
    }
  });

  // Session toggle event
  sessionToggle.addEventListener('change', () => {
    sessionMode = sessionToggle.checked;
    sessionControls.style.display = sessionMode ? 'block' : 'none';
    sessionReminder.style.display = sessionMode ? 'block' : 'none';
    bottomReminder.style.display = sessionMode ? 'block' : 'none';
    if (!sessionMode) {
      sessionResults = [];
      exportControls.style.display = 'none';
      sessionReminder.style.display = 'none';
      bottomReminder.style.display = 'none';
    }
  });

  // Scan Images button event
  scanBtn.addEventListener('click', () => {
    const files = fileInput.files;
    if (!files.length) {
      alert("Please select one or more image files.");
      return;
    }
    Array.from(files).forEach(file => {
      // Validate file extension
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        alert(`File "${file.name}" is not accepted. Allowed formats: .jpg, .jpeg, .png`);
        return;
      }
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        // Create container for OCR result
        const imageResultDiv = document.createElement('div');
        imageResultDiv.className = 'image-result';
        imageResultDiv.innerHTML = `
          <h3>${file.name}</h3>
          <div class="spinner"></div>
          <p class="loading-text">Performing OCR...</p>
        `;
        resultsContainer.appendChild(imageResultDiv);

        Tesseract.recognize(imageDataUrl, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text') {
              const progress = (m.progress * 100).toFixed(0);
              const loadingText = imageResultDiv.querySelector('.loading-text');
              if (loadingText) {
                loadingText.innerText = `Processing: ${progress}%`;
              }
            }
          }
        })
        .then(({ data: { text } }) => {
          // Split OCR text into lines and build alternating-color divs
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          let html = '';
          const lineData = [];
          lines.forEach((line, index) => {
            html += `<div class="line">
                        <span>${line}</span>
                        <select data-index="${index}">
                          <option value="">-- Select Type --</option>
                          <option value="name">Name</option>
                          <option value="contact">Contact Number</option>
                          <option value="email">Email</option>
                        </select>
                      </div>`;
            lineData.push({ text: line, type: '' });
          });
          imageResultDiv.innerHTML = `<h3>${file.name}</h3>` + html;

          // Attach event listeners for each dropdown
          imageResultDiv.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
              const idx = e.target.getAttribute('data-index');
              lineData[idx].type = e.target.value;
            });
          });

          // Save results based on session mode
          if (sessionMode) {
            sessionResults.push({ fileName: file.name, lines: lineData });
            fileInput.value = ""; // Clear file input
          } else {
            sessionResults = [{ fileName: file.name, lines: lineData }];
            exportControls.style.display = 'block';
          }
        })
        .catch(err => {
          imageResultDiv.innerHTML += `<p style="color:red;">Error processing OCR.</p>`;
          console.error(err);
        });
      };
      reader.readAsDataURL(file);
    });
  });

  // Complete Session button event
  completeSessionBtn.addEventListener('click', () => {
    if (sessionResults.length === 0) {
      alert("No images have been processed in this session.");
      return;
    }
    exportControls.style.display = 'block';
    sessionReminder.style.display = 'none';
  });

  // Clear All button event: show confirmation modal
  clearAllBtn.addEventListener('click', () => {
    clearModal.style.display = 'block';
  });
  clearConfirmBtn.addEventListener('click', () => {
    sessionResults = [];
    resultsContainer.innerHTML = "";
    exportControls.style.display = 'none';
    sessionReminder.style.display = 'none';
    bottomReminder.style.display = 'none';
    clearModal.style.display = 'none';
  });
  clearCancelBtn.addEventListener('click', () => {
    clearModal.style.display = 'none';
  });

  // Export functionality
  exportCsvBtn.addEventListener('click', () => {
    const csv = generateCSV();
    downloadFile(csv, "data.csv", "text/csv");
  });
  exportXmlBtn.addEventListener('click', () => {
    const xml = generateXML();
    downloadFile(xml, "data.xml", "application/xml");
  });

  // Tooltip functionality for help icons
  const helpIcons = document.querySelectorAll('.help-icon');
  helpIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      const helpText = e.target.getAttribute('data-help');
      tooltip.innerText = helpText;
      const rect = e.target.getBoundingClientRect();
      tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
      tooltip.style.left = (rect.left + window.scrollX) + 'px';
      tooltip.style.display = 'block';
    });
  });
  document.addEventListener('click', () => {
    tooltip.style.display = 'none';
  });

  // Utility functions
  function generateCSV() {
    let csvContent = "File Name,Name,Contact Number,Email\n";
    sessionResults.forEach(result => {
      let name = "", contact = "", email = "";
      result.lines.forEach(line => {
        if (line.type === "name" && !name) name = line.text.replace(/,/g, ' ');
        if (line.type === "contact" && !contact) contact = line.text.replace(/,/g, ' ');
        if (line.type === "email" && !email) email = line.text.replace(/,/g, ' ');
      });
      csvContent += `"${result.fileName}","${name}","${contact}","${email}"\n`;
    });
    return csvContent;
  }
  
  function generateXML() {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<images>\n';
    sessionResults.forEach(result => {
      let name = "", contact = "", email = "";
      result.lines.forEach(line => {
        if (line.type === "name" && !name) name = line.text;
        if (line.type === "contact" && !contact) contact = line.text;
        if (line.type === "email" && !email) email = line.text;
      });
      xmlContent += `  <image file="${result.fileName}">
    <name>${name}</name>
    <contact>${contact}</contact>
    <email>${email}</email>
  </image>\n`;
    });
    xmlContent += '</images>';
    return xmlContent;
  }
  
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
});
