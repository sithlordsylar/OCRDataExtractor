# Simple OCR Contact Extractor

A lightweight, browser-based OCR tool built with HTML, JavaScript, and CSS using [Tesseract.js](https://github.com/naptha/tesseract.js). This tool allows SMEs and non-technical users to quickly extract contact details from image files (e.g., screenshots of business cards or WhatsApp messages) and export the data as CSV or XML files. It includes a session mode for bulk processing and an intuitive, color-coded interface.

## Features

- **OCR Scanning:** Uses Tesseract.js for client-side OCR.
- **Session Mode:** Process multiple images in one session and export combined results.
- **Data Selection:** Easily label scanned text lines (Name, Contact Number, Email) via dropdowns.
- **Export Options:** Export the extracted data as CSV or XML.
- **User-Friendly Interface:** Includes modals, tooltips, and alternating line colors for improved readability.
- **Customization:** Replace the placeholder logo with your own business logo.

## Installation & Deployment

### Prerequisites

- Basic knowledge of file upload and hosting.
- A hosting provider or GitHub account to deploy the site.

### Steps

1. **Clone or Download the Repository:**
   - Clone this repository using Git:
     ```bash
     git clone https://github.com/your-username/your-repo-name.git
     ```
   - Or download the ZIP file and extract it.

2. **Customize Your Logo:**
   - Replace the `logo.png` file in the project root with your business-specific logo. For best quality, use a PNG or SVG file.
   - Customize the color scheme for displaying OCR results by adjusting the styles.css file (guide will be provided below)
   
3. **Deploying on GitHub Pages:**
   - Push your repository to GitHub.
   - In your repository settings, navigate to the **Pages** section.
   - Select the branch (e.g., `main` or `gh-pages`) and folder (usually root) for deployment.
   - Save the settings. Your site will be available at `https://your-username.github.io/your-repo-name/`.

4. **Deploying on Other Hosting Providers:**
   - Upload all the project files (index.html, styles.css, main.js, logo.png) to your hosting provider using FTP or your CMS file manager.
   - Ensure the domain points to the folder containing these files.

## Usage Guide

1. **Access the Tool:**
   - Open the deployed URL in your browser.

2. **Quick Tips:**
   - Click the **Quick Tips on How to Use** button (located below the logo) to view a step-by-step guide.

3. **Enable Session Mode (Optional):**
   - Check the **Enable Session Mode** box if you plan to process multiple images in one go. This mode aggregates results until you complete the session.

4. **Select Image Files:**
   - Click the **Choose Files** button. A modal will appear reminding you to upload only .jpg, .jpeg, or .png files.
   - Click **Noted, Proceed** to open the file chooser and select your images.

5. **Scan Images:**
   - After selecting your files, click the **Scan Images** button.
   - The tool will process each image, displaying a color-coded list of extracted text. Each line is labeled with a dropdown for you to select whether it represents a Name, Contact Number, or Email.

6. **Complete Session (if using Session Mode):**
   - Once all images are processed, click the **Complete Session** button to enable the export options.

7. **Export or Clear Data:**
   - Click **Export CSV** or **Export XML** to download the data.
   - Alternatively, click **Clear All** if you want to remove all processed data (a confirmation modal will appear).
  
## Customization

### Changing the Result Display Colors

By default, the tool uses the following color scheme for displaying OCR results:

- **Odd-numbered lines:**  
  - **Background Color:** White (`#ffffff`)
  - **Text Color:** Black (`#000000`)

- **Even-numbered lines:**  
  - **Background Color:** Light blue (`#00b5de`)
  - **Text Color:** White (`#ffffff`)

To change these colors to match your brand, open the `styles.css` file and locate for the comment "Line item styling with alternating colors" which has the following CSS rules:

```css
.line:nth-child(odd) {
  background-color: #fff;
  color: #000;
}
.line:nth-child(even) {
  background-color: #00b5de;
  color: #fff;
}
```
Simply replace the hex color codes (#fff, #000, #00b5de, etc.) with your desired colors. Save your changes and refresh your deployed site to see the new color scheme in action.

### Troubleshooting

- **No Response on Button Clicks:**  
  Ensure your browser’s JavaScript console (F12) shows no errors. Check that all file names and IDs in your HTML match those in the JavaScript code.
  
- **OCR Accuracy Issues:**  
  Try using clearer images. You might also experiment with Tesseract.js settings or consider preprocessing images for better results.

### Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

### License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to remove or modify any optional sections based on your specific needs. Enjoy using the Simple OCR Contact Extractor!
