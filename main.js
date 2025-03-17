// main.js

document.addEventListener('DOMContentLoaded', () => {
  // Global state variables
  let sessionMode = false;
  let sessionResults = []; // Stores data for each processed image
  let bypassFileModal = false; // Flag to bypass modal on file input click
  const allowedExtensions = ['jpg', 'jpeg', 'png'];

  // DOM elements
  const sessionToggle = document.getElementById('sessionToggle');
  const fileInput = document.getElementById('fileInput');
  const scanBtn = document.getElementById('scanBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  const sessionControls = document.getElementById('sessionControls');
  const completeSessionBtn = document.getElementById('completeSessionBtn');
  const exportControls = document.getElementById('exportControls');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const exportXmlBtn = document.getElementById('exportXmlBtn');
  const fileModal = document.getElementById('fileModal');
  const modalProceedBtn = document.getElementById('modalProceedBtn');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const sessionReminder = document.getElementById('sessionReminder');
  const tooltip = document.getElementById('tooltip');

  // Intercept file input click to show modal confirmation (unless bypass flag is set)
  fileInput.addEventListener('click', (e) => {
    if (!bypassFileModal) {
      e.preventDefault();
      fileModal.style.display = 'block';
    } else {
      bypassFileModal = false; // Reset flag
    }
  });

  // Modal button actions
  modalProceedBtn.addEventListener('click', () => {
    fileModal.style.display = 'none';
    bypassFileModal = true;
    fileInput.click();
  });

  modalCancelBtn.addEventListener('click', () => {
    fileModal.style.display = 'none';
    // User will have a chance to check files again.
  });

  // Toggle session mode
  sessionToggle.addEventListener('change', () => {
    sessionMode = sessionToggle.checked;
    sessionControls.style.display = sessionMode ? 'block' : 'none';
    sessionReminder.style.display = sessionMode ? 'block' : 'none';
    if (!sessionMode) {
      sessionResults = [];
      exportControls.style.display = 'none';
      sessionReminder.style.display = 'none';
    }
  });

  // Process selected files with OCR, including file validation
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
        alert(`File "${file.name}" is not accepted. Allowed formats are: .jpg, .jpeg, .png`);
        return; // Skip processing this file
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageDataUrl = e.target.result;
        // Create a container for this image's result with spinner and loading text
        const imageResultDiv = document.createElement('div');
        imageResultDiv.className = 'image-result';
        imageResultDiv.innerHTML = `
          <h3>${file.name}</h3>
          <div class="spinner"></div>
          <p class="loading-text">Performing OCR...</p>
        `;
        resultsContainer.appendChild(imageResultDiv);
        
        // Perform OCR using Tesseract.js with a progress logger
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
          // Split OCR output into non-empty lines
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
            // Initialize with no selection
            lineData.push({ text: line, type: '' });
          });
          // Replace spinner and loading text with the OCR results
          imageResultDiv.innerHTML = `<h3>${file.name}</h3>` + html;
          
          // Listen for dropdown changes to record user selections
          imageResultDiv.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
              const idx = e.target.getAttribute('data-index');
              lineData[idx].type = e.target.value;
            });
          });
          
          // Save results: if session mode is on, accumulate results; otherwise, override previous data.
          if (sessionMode) {
            sessionResults.push({ fileName: file.name, lines: lineData });
            fileInput.value = ""; // Optionally clear file input for subsequent uploads
          } else {
            sessionResults = [{ fileName: file.name, lines: lineData }];
            exportControls.style.display = 'block';
          }
        })
        .catch(err => {
          imageResultDiv.innerHTML += `<p style="color: red;">Error processing OCR.</p>`;
          console.error(err);
        });
      };
      reader.readAsDataURL(file);
    });
  });

  // When session is complete, enable export and hide reminder
  completeSessionBtn.addEventListener('click', () => {
    if (sessionResults.length === 0) {
      alert("No images have been processed in this session.");
      return;
    }
    exportControls.style.display = 'block';
    sessionReminder.style.display = 'none';
  });

  // Generate CSV content from sessionResults
  function generateCSV() {
    let csvContent = "File Name,Name,Contact Number,Email\n";
    sessionResults.forEach(result => {
      let name = "", contact = "", email = "";
      result.lines.forEach(line => {
        if (line.type === "name" && !name) {
          name = line.text.replace(/,/g, ' ');
        }
        if (line.type === "contact" && !contact) {
          contact = line.text.replace(/,/g, ' ');
        }
        if (line.type === "email" && !email) {
          email = line.text.replace(/,/g, ' ');
        }
      });
      csvContent += `"${result.fileName}","${name}","${contact}","${email}"\n`;
    });
    return csvContent;
  }

  // Generate XML content from sessionResults
  function generateXML() {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<images>\n';
    sessionResults.forEach(result => {
      let name = "", contact = "", email = "";
      result.lines.forEach(line => {
        if (line.type === "name" && !name) {
          name = line.text;
        }
        if (line.type === "contact" && !contact) {
          contact = line.text;
        }
        if (line.type === "email" && !email) {
          email = line.text;
        }
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

  // Utility: Trigger file download from generated content
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Attach export functionality to buttons
  exportCsvBtn.addEventListener('click', () => {
    const csv = generateCSV();
    downloadFile(csv, "data.csv", "text/csv");
  });

  exportXmlBtn.addEventListener('click', () => {
    const xml = generateXML();
    downloadFile(xml, "data.xml", "application/xml");
  });

  // Tooltip functionality for help icons – stop propagation so clicks on icons don't trigger parent events.
  const helpIcons = document.querySelectorAll('.help-icon');
  helpIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent toggling other elements like checkboxes
      const helpText = e.target.getAttribute('data-help');
      tooltip.innerText = helpText;
      const rect = e.target.getBoundingClientRect();
      tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
      tooltip.style.left = (rect.left + window.scrollX) + 'px';
      tooltip.style.display = 'block';
    });
  });

  // Hide tooltip when clicking anywhere else
  document.addEventListener('click', () => {
    tooltip.style.display = 'none';
  });
});
