// Resume Builder App with PROPERLY WORKING Download Functionality
class ResumeBuilder {
  constructor() {
    this.resumeData = {
      basics: {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        summary: "",
      },
      work: [],
      education: [],
      skills: [],
    };

    this.currentFont = "sans";
    this.currentTemplate = "modern";
    this.accentColor = "#1e3a8a";
    this.zoomLevel = 1;
    
    this.experienceCount = 0;
    this.educationCount = 0;

    this.init();
  }

  init() {
    console.log("Initializing Resume Builder...");
    this.setupEventListeners();
    this.setupAccordion();
    this.setupPreviewToggle();
    
    if (!this.loadFromLocalStorage()) {
      this.loadSampleData();
    }
    
    this.updatePreview();
    console.log("Resume Builder initialized successfully");
  }

  setupEventListeners() {
    console.log("Setting up event listeners...");

    // Basic info fields
    document.getElementById("fullName").addEventListener("input", (e) => {
      this.resumeData.basics.name = e.target.value;
      this.updatePreview();
    });

    document.getElementById("email").addEventListener("input", (e) => {
      this.resumeData.basics.email = e.target.value;
      this.updatePreview();
    });

    document.getElementById("phone").addEventListener("input", (e) => {
      this.resumeData.basics.phone = e.target.value;
      this.updatePreview();
    });

    document.getElementById("linkedin").addEventListener("input", (e) => {
      this.resumeData.basics.linkedin = e.target.value;
      this.updatePreview();
    });

    document.getElementById("summary").addEventListener("input", (e) => {
      this.resumeData.basics.summary = e.target.value;
      this.updatePreview();
    });

    document.getElementById("skills").addEventListener("input", (e) => {
      const skillsText = e.target.value;
      this.resumeData.skills = skillsText
        ? [
            {
              name: "Technical Skills",
              keywords: skillsText
                // Split by comma only if the comma is NOT inside parentheses
                .split(/,\s*(?![^()]*\))/)
                .map((skill) => skill.trim())
                .filter((skill) => skill),
            },
          ]
        : [];
      this.updatePreview();
    });

    // Design Sidebar Listeners
    const templateSelect = document.getElementById("templateSelect");
    if (templateSelect) {
      templateSelect.addEventListener("change", (e) => {
        this.currentTemplate = e.target.value;
        const label = document.getElementById("currentTemplateLabel");
        if (label) {
          label.textContent = e.target.options[e.target.selectedIndex].text;
        }
        this.updatePreview();
      });
    }

    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.accentColor = e.target.getAttribute("data-color");
        this.updatePreview();
      });
    });

    document.querySelectorAll(".typo-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".typo-btn").forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        this.currentFont = e.target.getAttribute("data-font");
        this.updatePreview();
      });
    });

    // Zoom Controls
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");
    if (zoomIn) zoomIn.addEventListener("click", () => this.handleZoom(0.1));
    if (zoomOut) zoomOut.addEventListener("click", () => this.handleZoom(-0.1));

    // Profile Image
    const profileImage = document.getElementById("profileImage");
    if (profileImage) {
      profileImage.addEventListener("change", (e) => this.handleProfileImage(e));
    }

    // Add buttons
    document
      .getElementById("addExperience")
      .addEventListener("click", () => this.addExperience());
    document
      .getElementById("addEducation")
      .addEventListener("click", () => this.addEducation());

    // FIXED: Export/Import/Download buttons with proper event handling
    this.setupDownloadButtons();

    // File input for import
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => {
        console.log("File input change event triggered");
        this.handleFileImport(e);
      });
    }

    console.log("Event listeners setup complete");
  }

  // FIXED: Separate method to properly setup download buttons
  setupDownloadButtons() {
    // Export JSON button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      // Remove any existing listeners
      exportBtn.replaceWith(exportBtn.cloneNode(true));
      const newExportBtn = document.getElementById("exportBtn");

      newExportBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Export JSON button clicked");
        this.exportJSON();
      });

      // Ensure button is properly styled and clickable
      newExportBtn.style.pointerEvents = "auto";
      newExportBtn.style.zIndex = "1000";
    }

    // Save button
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
      saveBtn.replaceWith(saveBtn.cloneNode(true));
      const newSaveBtn = document.getElementById("saveBtn");

      newSaveBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Save button clicked");
        this.saveToLocalStorage();
      });

      newSaveBtn.style.pointerEvents = "auto";
      newSaveBtn.style.zIndex = "1000";
    }

    // Import JSON button
    const importBtn = document.getElementById("importBtn");
    if (importBtn) {
      // Remove any existing listeners
      importBtn.replaceWith(importBtn.cloneNode(true));
      const newImportBtn = document.getElementById("importBtn");

      newImportBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Import JSON button clicked");
        this.importJSON();
      });

      // Ensure button is properly styled and clickable
      newImportBtn.style.pointerEvents = "auto";
      newImportBtn.style.zIndex = "1000";
    }

    // Download PDF button
    const downloadBtn = document.getElementById("downloadPdf");
    if (downloadBtn) {
      // Remove any existing listeners
      downloadBtn.replaceWith(downloadBtn.cloneNode(true));
      const newDownloadBtn = document.getElementById("downloadPdf");

      newDownloadBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("Download PDF button clicked");
        this.generatePDF();
      });

      // Ensure button is properly styled and clickable
      newDownloadBtn.style.pointerEvents = "auto";
      newDownloadBtn.style.zIndex = "1000";
    }
  }

  setupAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const item = header.closest(".accordion-item");
        const wasActive = item.classList.contains("active");

        // Close all
        document.querySelectorAll(".accordion-item").forEach((i) => {
          i.classList.remove("active");
        });

        // Toggle current
        if (!wasActive) {
          item.classList.add("active");
        }
      });
    });
  }

  setupPreviewToggle() {
    const toggleBtns = document.querySelectorAll(".toggle-preview-btn");
    const sidebarLeft = document.querySelector(".sidebar-left");
    const sidebarRight = document.querySelector(".sidebar-right");

    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        sidebarLeft.classList.toggle("hidden-section");
        sidebarRight.classList.toggle("hidden-section");
        const isPreviewing = sidebarLeft.classList.contains("hidden-section");
        btn.innerHTML = isPreviewing ? 
          '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle><line x1="1" y1="1" x2="23" y2="23"></line></svg> Exit Preview' :
          '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview Mode';
      });
    });
  }

  saveToLocalStorage() {
    try {
      const saveData = {
        resumeData: this.resumeData,
        currentTemplate: this.currentTemplate,
        currentFont: this.currentFont,
        accentColor: this.accentColor,
        zoomLevel: this.zoomLevel
      };
      localStorage.setItem('minimalResumeData', JSON.stringify(saveData));
      this.showStatusMessage("✅ Progress saved to browser successfully!", "success", 3000);
      console.log("Saved to localStorage");
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      this.showStatusMessage("❌ Failed to save progress", "error", 3000);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('minimalResumeData');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.resumeData) {
          this.resumeData = parsed.resumeData;
          this.currentTemplate = parsed.currentTemplate || "modern";
          this.currentFont = parsed.currentFont || "sans";
          this.accentColor = parsed.accentColor || "#1e3a8a";
          this.zoomLevel = parsed.zoomLevel || 1;
          
          // Preselect correct sidebar UI elements based on saved data
          
          document.querySelectorAll(".color-btn").forEach(b => {
             b.classList.toggle("active", b.getAttribute("data-color") === this.accentColor);
          });
          document.querySelectorAll(".typo-btn").forEach(b => {
             b.classList.toggle("active", b.getAttribute("data-font") === this.currentFont);
          });
          const templateSelect = document.getElementById("templateSelect");
          if (templateSelect) {
             templateSelect.value = this.currentTemplate;
             const label = document.getElementById("currentTemplateLabel");
             if (label) {
               label.textContent = templateSelect.options[templateSelect.selectedIndex].text;
             }
          }
          
          this.populateForm();
          this.showStatusMessage("✅ Loaded previous session", "success", 3000);
          console.log("Loaded from localStorage");
          return true;
        }
      }
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
    return false;
  }

  handleZoom(delta) {
    this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel + delta));
    const resumePreview = document.getElementById("resumePreview");
    const zoomLabel = document.getElementById("zoomLevel");
    if (resumePreview && zoomLabel) {
      resumePreview.style.transform = `scale(${this.zoomLevel})`;
      zoomLabel.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }
  }

  handleProfileImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.resumeData.basics.image = e.target.result;
        this.updatePreview();
      };
      reader.readAsDataURL(file);
    }
  }

  showStatusMessage(message, type = "success", duration = 3000) {
    const statusElement = document.getElementById("statusMessage");
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.classList.remove("hidden");

    setTimeout(() => {
      statusElement.classList.add("hidden");
    }, duration);
  }

  setButtonLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (loading) {
      button.classList.add("loading");
      button.disabled = true;
      button.style.cursor = "wait";
    } else {
      button.classList.remove("loading");
      button.disabled = false;
      button.style.cursor = "pointer";
    }
  }

  // ENHANCED: Utility function to create and trigger file download with better cross-browser support
  triggerDownload(blob, filename) {
    try {
      console.log(
        `Creating download for file: ${filename}, size: ${blob.size} bytes`
      );

      // Method 1: Try the standard approach first
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // IE/Edge support
        window.navigator.msSaveOrOpenBlob(blob, filename);
        console.log("Download triggered using msSaveOrOpenBlob (IE/Edge)");
        return true;
      }

      // Method 2: Standard approach for modern browsers
      try {
        const url = URL.createObjectURL(blob);
        console.log("Blob URL created:", url);

        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = filename;
        link.target = "_blank"; // Ensure it doesn't navigate away

        // Add to DOM temporarily
        document.body.appendChild(link);

        // Force click with multiple methods for better compatibility
        if (link.click) {
          link.click();
        } else if (link.dispatchEvent) {
          const clickEvent = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: false,
          });
          link.dispatchEvent(clickEvent);
        }

        console.log("Download click triggered");

        // Cleanup
        document.body.removeChild(link);

        // Clean up blob URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
          console.log("Blob URL cleaned up");
        }, 1000);

        return true;
      } catch (linkError) {
        console.warn(
          "Standard link method failed, trying fallback:",
          linkError
        );

        // Method 3: Fallback approach
        const url = URL.createObjectURL(blob);
        const newWindow = window.open(url, "_blank");
        if (newWindow) {
          newWindow.document.title = filename;
          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
          return true;
        }

        throw new Error("All download methods failed");
      }
    } catch (error) {
      console.error("Download trigger failed:", error);
      throw new Error("Unable to trigger download: " + error.message);
    }
  }

  loadSampleData() {
    console.log("Loading sample data...");
    const sampleData = {
      basics: {
        name: "Ash Ketchum",
        email: "ash.ketchum@palletmail.com",
        phone: "123-PIKA-4567",
        linkedin: "linkedin.com/in/ash-ketchum",
        summary:
          "\n• Driven, adaptable Pokémon Trainer with extensive field experience across multiple regions.\n• Recognized for innovative strategy, unwavering determination, and ability to cultivate high-performing teams.\n• Achieved World Champion status and led impactful mentorship and research initiatives.\n• Noted for turning underdogs into stars and keeping Team Rocket on their toes.\n• Wants to be the very best—like no one ever was.",
      },
      work: [
        {
          position: "World Coronation Series Monarch",
          name: "Pokémon League & World Coronation Series",
          location:
            "Global (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar)",
          startDate: "April 1997",
          endDate: "Present",
          highlights: [
            "• Defeated Leon in the finals to become World Champion.",
            "\n• Mentored rising trainers and studied advanced battle mechanics.",
            "\n• Foiled Team Rocket’s plans more than 127 times (and counting).",
            "\n• Maintained exceptional win rate with a unique, friendship-centric approach to training.",
            "\n• Frequently encountered legendary Pokémon in the wild (and still can't catch a shiny).",
          ],
        },
        {
          position: "Alola League Champion",
          name: "Manalo Conference",
          location: "Alola Region",
          startDate: "2019",
          endDate: "2019",
          highlights: [
            "• First-ever Champion of Alola League, utilizing versatile tactics.",
            "• Specialized in Z-Move research, improving trainer synchronization.",
            "• Research contributor with Professor Kukui on island challenges.",
            "• Once won a league while still not evolving Pikachu (by choice).",
          ],
        },
      ],
      education: [
        {
          institution: "Professor Oak's Institute",
          studyType: "Pokémon Training & Communication",
          area: "Trainer-Partner Relationships",
          startDate: "1997",
          endDate: "Present",
        },
      ],
      skills: [
        {
          name: "Trainer Skills",
          keywords: [
            "Battle Strategy",
            "Team Building",
            "Leadership",
            "Crisis Management",
            "Pokémon Care",
            "Pokéball Throwing",
            "Type Matchup Analysis",
            "Gym Badge Acquisition",
          ],
        },
      ],
      fun_easter_eggs: [
        "Member of the Squirtle Squad (occasionally rocks sunglasses).",
        "Responsible for Team Rocket’s ongoing repair bills.",
        "Still tries to catch every type of Pokémon—except for Beedrill. Just... no.",
        "Catchphrase: 'I choose you!'—spoken with gusto.",
        "Can identify Pokémon by silhouette (and occasionally by voice actor).",
      ],
    };

    this.resumeData = sampleData;
    this.populateForm();
  }

  populateForm() {
    console.log("Populating form with data...");
    // Populate basic info
    document.getElementById("fullName").value =
      this.resumeData.basics.name || "";
    document.getElementById("email").value = this.resumeData.basics.email || "";
    document.getElementById("phone").value = this.resumeData.basics.phone || "";
    document.getElementById("linkedin").value =
      this.resumeData.basics.linkedin || "";
    document.getElementById("summary").value =
      this.resumeData.basics.summary || "";

    // Populate skills
    if (this.resumeData.skills.length > 0) {
      document.getElementById("skills").value =
        this.resumeData.skills[0].keywords.join(", ");
    }

    // Clear existing containers
    document.getElementById("experienceContainer").innerHTML = "";
    document.getElementById("educationContainer").innerHTML = "";
    this.experienceCount = 0;
    this.educationCount = 0;

    // Populate work experience
    this.resumeData.work.forEach(() => this.addExperience());

    // Populate education
    this.resumeData.education.forEach(() => this.addEducation());
  }

  addExperience(data = null) {
    const container = document.getElementById("experienceContainer");
    const index = this.experienceCount++;

    const experienceData = data ||
      this.resumeData.work[index] || {
        position: "",
        name: "",
        location: "",
        startDate: "",
        endDate: "",
        highlights: [],
      };

    const experienceHTML = `
      <div class="experience-item" data-index="${index}">
        <div class="item-header">
          <h3 class="item-title">Experience #${index + 1}</h3>
          <button type="button" class="remove-item" onclick="resumeBuilder.removeExperience(${index})">Remove</button>
        </div>
        <div class="form-group">
          <label class="form-label">Job Title *</label>
          <input type="text" class="form-control experience-position" value="${
            experienceData.position
          }" placeholder="e.g. Senior Software Engineer" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Company *</label>
            <input type="text" class="form-control experience-company" value="${
              experienceData.name
            }" placeholder="Company Name" required>
          </div>
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-control experience-location" value="${
              experienceData.location
            }" placeholder="City, State">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Date *</label>
            <input type="text" class="form-control experience-start" value="${
              experienceData.startDate
            }" placeholder="e.g. Jan 2020" required>
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input type="text" class="form-control experience-end" value="${
              experienceData.endDate
            }" placeholder="e.g. Present">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Job Description</label>
          <textarea class="form-control experience-highlights" rows="8" placeholder="• Describe your responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Focus on measurable results">${
            Array.isArray(experienceData.highlights)
              ? experienceData.highlights.join("\n")
              : ""
          }</textarea>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", experienceHTML);
    this.setupExperienceListeners(index);
  }

  setupExperienceListeners(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    const inputs = item.querySelectorAll("input, textarea");

    inputs.forEach((input) => {
      input.addEventListener("input", () => this.updateExperienceData(index));
    });
  }

  updateExperienceData(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (!item) return;

    const position = item.querySelector(".experience-position").value;
    const company = item.querySelector(".experience-company").value;
    const location = item.querySelector(".experience-location").value;
    const startDate = item.querySelector(".experience-start").value;
    const endDate = item.querySelector(".experience-end").value;
    const highlights = item
      .querySelector(".experience-highlights")
      .value.split("\n")
      .filter((line) => line.trim() !== "");

    if (!this.resumeData.work[index]) {
      this.resumeData.work[index] = {};
    }

    this.resumeData.work[index] = {
      position,
      name: company,
      location,
      startDate,
      endDate,
      highlights,
    };

    this.updatePreview();
  }

  removeExperience(index) {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item) {
      item.remove();
      this.resumeData.work.splice(index, 1);
      this.updatePreview();
    }
  }

  addEducation(data = null) {
    const container = document.getElementById("educationContainer");
    const index = this.educationCount++;

    const educationData = data ||
      this.resumeData.education[index] || {
        institution: "",
        studyType: "",
        area: "",
        startDate: "",
        endDate: "",
      };

    const educationHTML = `
      <div class="education-item" data-edu-index="${index}">
        <div class="item-header">
          <h3 class="item-title">Education #${index + 1}</h3>
          <button type="button" class="remove-item" onclick="resumeBuilder.removeEducation(${index})">Remove</button>
        </div>
        <div class="form-group">
          <label class="form-label">Degree *</label>
          <input type="text" class="form-control education-degree" value="${
            educationData.studyType
          }" placeholder="e.g. Bachelor of Science" required>
        </div>
        <div class="form-group">
          <label class="form-label">Field of Study</label>
          <input type="text" class="form-control education-field" value="${
            educationData.area
          }" placeholder="e.g. Computer Science">
        </div>
        <div class="form-group">
          <label class="form-label">Institution *</label>
          <input type="text" class="form-control education-school" value="${
            educationData.institution
          }" placeholder="University/College Name" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Start Year</label>
            <input type="text" class="form-control education-start" value="${
              educationData.startDate
            }" placeholder="e.g. 2018">
          </div>
          <div class="form-group">
            <label class="form-label">End Year</label>
            <input type="text" class="form-control education-end" value="${
              educationData.endDate
            }" placeholder="e.g. 2022">
          </div>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", educationHTML);
    this.setupEducationListeners(index);
  }

  setupEducationListeners(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    const inputs = item.querySelectorAll("input");

    inputs.forEach((input) => {
      input.addEventListener("input", () => this.updateEducationData(index));
    });
  }

  updateEducationData(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    if (!item) return;

    const degree = item.querySelector(".education-degree").value;
    const field = item.querySelector(".education-field").value;
    const school = item.querySelector(".education-school").value;
    const startDate = item.querySelector(".education-start").value;
    const endDate = item.querySelector(".education-end").value;

    if (!this.resumeData.education[index]) {
      this.resumeData.education[index] = {};
    }

    this.resumeData.education[index] = {
      institution: school,
      studyType: degree,
      area: field,
      startDate,
      endDate,
    };

    this.updatePreview();
  }

  removeEducation(index) {
    const item = document.querySelector(`[data-edu-index="${index}"]`);
    if (item) {
      item.remove();
      this.resumeData.education.splice(index, 1);
      this.updatePreview();
    }
  }

  updatePreview() {
    const previewPanel = document.getElementById("resumePreview");
    const resumeInner = document.getElementById("resumeInner");
    
    if (!previewPanel || !resumeInner) return;

    previewPanel.style.setProperty('--template-accent-color', this.accentColor);
    
    let fontStr = 'Inter, sans-serif';
    if (this.currentFont === 'serif') {
        fontStr = '"Playfair Display", "Crimson Text", serif';
    } else {
        fontStr = 'Inter, "Source Sans Pro", sans-serif';
    }
    previewPanel.style.setProperty('--template-font-family', fontStr);

    previewPanel.className = `resume-preview template-${this.currentTemplate}`;
    
    let html = '';
    if (this.currentTemplate === 'modern') {
        html = this.generateModernTemplate();
    } else if (this.currentTemplate === 'professional') {
        html = this.generateProfessionalTemplate();
    } else if (this.currentTemplate === 'executive') {
        html = this.generateExecutiveTemplate();
    }
    
    resumeInner.innerHTML = html;
        
    this.updateResumeStrength();
  }

  updateResumeStrength() {
     let score = 0;
     let nextTask = "";

     if (this.resumeData.basics.name) score += 20;
     else if (!nextTask) nextTask = "Add your name";

     if (this.resumeData.basics.summary) score += 20;
     else if (!nextTask) nextTask = "Add a professional summary";

     if (this.resumeData.work && this.resumeData.work.length > 0) score += 20;
     else if (!nextTask) nextTask = "Add your work experience";

     if (this.resumeData.education && this.resumeData.education.length > 0) score += 20;
     else if (!nextTask) nextTask = "Add your education";
     
     if (this.resumeData.skills && this.resumeData.skills.length > 0 && this.resumeData.skills[0].keywords && this.resumeData.skills[0].keywords.length > 0) {
        score += 20;
     } else if (!nextTask) {
        nextTask = "Add some skills";
     }

     const strengthBar = document.querySelector('.progress-bar-fill');
     if (strengthBar) strengthBar.style.width = `${score}%`;

     const strengthHint = document.querySelector('.strength-hint');
     if (strengthHint) {
         if (score === 100) {
             strengthHint.textContent = "Your resume is looking great!";
             strengthHint.style.color = "#059669";
         } else {
             strengthHint.textContent = `${nextTask} to improve score.`;
             strengthHint.style.color = "var(--text-muted)";
         }
     }
  }

  formatHighlights(highlights) {
    if (!highlights || highlights.length === 0) return '';
    return `<ul class="item-highlights">` + 
      highlights.map(h => {
        const text = h.trim();
        if (text === '' || text === '<br>') return '';
        return `<li>${text.replace(/^[•\-\*]\s*/, '')}</li>`;
      }).join('') + 
      `</ul>`;
  }

  generateModernTemplate() {
     const b = this.resumeData.basics || {};
     const name = b.name || "Your Name";
     
     let contactHtml = '';
     if (b.email) contactHtml += `<span class="contact-item"><svg class="contact-icon" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>${b.email}</span>`;
     if (b.phone) contactHtml += `<span class="contact-item"><svg class="contact-icon" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>${b.phone}</span>`;
     if (b.linkedin) contactHtml += `<span class="contact-item">${b.linkedin}</span>`;

     let summaryHtml = '';
     if (b.summary) {
        summaryHtml = `<div class="section-block"><div class="section-title">Professional Summary</div><div class="summary-text">${b.summary.replace(/\n/g, '<br>')}</div></div>`;
     }

     let expHtml = '';
     if (this.resumeData.work && this.resumeData.work.length > 0) {
        expHtml += `<div class="section-block"><div class="section-title">Work Experience</div>`;
        this.resumeData.work.forEach(job => {
            const dateStr = `${job.startDate || ''} \u2014 ${job.endDate || 'Present'}`;
            expHtml += `
            <div class="experience-item">
                <div class="item-header">
                    <h4 class="item-title">${job.position || ''}</h4>
                    <span class="item-date">${dateStr}</span>
                </div>
                <div class="item-subtitle">${job.name || ''}${job.location ? `, ${job.location}` : ''}</div>
                ${this.formatHighlights(job.highlights)}
            </div>`;
        });
        expHtml += `</div>`;
     }

     let eduHtml = '';
     if (this.resumeData.education && this.resumeData.education.length > 0) {
        eduHtml += `<div class="section-block"><div class="section-title">Education</div>`;
        this.resumeData.education.forEach(edu => {
            const dateStr = (edu.startDate || edu.endDate) ? `${edu.startDate || ''} \u2014 ${edu.endDate || ''}` : '';
            eduHtml += `
            <div class="education-item">
                <div class="item-header">
                    <h4 class="item-title">${edu.studyType || ''}${edu.area ? ` in ${edu.area}` : ''}</h4>
                    <span class="item-date">${dateStr}</span>
                </div>
                <div class="item-subtitle">${edu.institution || ''}</div>
            </div>`;
        });
        eduHtml += `</div>`;
     }

     let skillsHtml = '';
     if (this.resumeData.skills && this.resumeData.skills.length > 0 && this.resumeData.skills[0].keywords && this.resumeData.skills[0].keywords.length > 0) {
        skillsHtml = `<div class="section-block"><div class="section-title">Skills</div><div class="skills-list">${this.resumeData.skills[0].keywords.join(" • ")}</div></div>`;
     }

     return `
        <h1 class="resume-name">${name}</h1>
        ${b.summary && b.name ? `<div class="resume-title">Professional Resume</div>` : ''} 
        <div class="contact-info">${contactHtml}</div>
        ${summaryHtml}
        ${expHtml}
        ${eduHtml}
        ${skillsHtml}
     `;
  }

  generateProfessionalTemplate() {
     const b = this.resumeData.basics || {};
     const name = b.name || "Your Name";
     
     let contactHtml = '';
     if (b.email) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> ${b.email}</span>`;
     if (b.phone) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> ${b.phone}</span>`;
     if (b.linkedin) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg> ${b.linkedin}</span>`;

     let summaryHtml = '';
     if (b.summary) {
        summaryHtml = `
            <div class="section-block">
                <div class="section-title"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> SUMMARY</div>
                <div class="summary-text">${b.summary.replace(/\n/g, '<br>')}</div>
            </div>`;
     }

     let expHtml = '';
     if (this.resumeData.work && this.resumeData.work.length > 0) {
        expHtml += `<div class="section-block"><div class="section-title"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg> EXPERIENCE</div><div class="experience-list">`;
        this.resumeData.work.forEach((job, idx) => {
            const dateStr = `${job.startDate || ''} \u2014 ${job.endDate || 'Present'}`;
            const fadedClass = idx > 0 ? " faded-dot" : "";
            expHtml += `
            <div class="experience-item${fadedClass}">
                <div class="item-header">
                    <h4 class="item-title">${job.position || ''}</h4>
                    <span class="item-date">${dateStr}</span>
                </div>
                <div class="item-subtitle">${job.name || ''}</div>
                ${this.formatHighlights(job.highlights)}
            </div>`;
        });
        expHtml += `</div></div>`;
     }

     let eduHtml = '';
     if (this.resumeData.education && this.resumeData.education.length > 0) {
        eduHtml += `<div><div class="section-title"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2.12-1.15V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg> EDUCATION</div>`;
        this.resumeData.education.forEach(edu => {
            const dateStr = (edu.startDate || edu.endDate) ? `${edu.startDate || ''} \u2014 ${edu.endDate || ''}` : '';
            eduHtml += `
            <div class="education-item">
                <h4 class="education-title">${edu.studyType || ''}${edu.area ? ` in ${edu.area}` : ''}</h4>
                <p class="education-school">${edu.institution || ''}</p>
                <div class="education-date">${dateStr}</div>
            </div>`;
        });
        eduHtml += `</div>`;
     }

     let skillsHtml = '';
     if (this.resumeData.skills && this.resumeData.skills.length > 0 && this.resumeData.skills[0].keywords && this.resumeData.skills[0].keywords.length > 0) {
        skillsHtml += `<div><div class="section-title"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg> SKILLS</div><div class="skills-container">`;
        skillsHtml += this.resumeData.skills[0].keywords.map(k => `<span class="skill-pill">${k}</span>`).join('');
        skillsHtml += `</div></div>`;
     }

     const imageHtml = b.image ? `<img src="${b.image}" class="profile-image">` : `<div class="profile-image"></div>`;

     let headerJobTitle = "Professional Designer"; 
     if (this.resumeData.work && this.resumeData.work.length > 0) {
        headerJobTitle = this.resumeData.work[0].position || '';
     }

     return `
        <div class="resume-card">
            <div class="header-block">
                ${imageHtml}
                <div class="header-content">
                    <h1 class="resume-name">${name}</h1>
                    <div class="resume-title">${headerJobTitle}</div>
                    <div class="contact-info">${contactHtml}</div>
                </div>
            </div>
            ${summaryHtml}
            ${expHtml}
            <div class="bottom-grid">
                ${eduHtml}
                ${skillsHtml}
            </div>
        </div>
     `;
  }

  generateExecutiveTemplate() {
     const b = this.resumeData.basics || {};
     const name = (b.name || "Your Name");
     
     let contactHtml = '';
     if (b.email) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg> ${b.email}</span>`;
     if (b.phone) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> ${b.phone}</span>`;
     if (b.linkedin) contactHtml += `<span class="contact-item"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg> ${b.linkedin}</span>`;

     let summaryHtml = '';
     if (b.summary) {
        summaryHtml = `<div class="section-block"><div class="section-title">PROFESSIONAL SUMMARY</div><div class="summary-text">${b.summary.replace(/\n/g, '<br>')}</div></div>`;
     }

     let expHtml = '';
     if (this.resumeData.work && this.resumeData.work.length > 0) {
        expHtml += `<div class="section-block"><div class="section-title">PROFESSIONAL EXPERIENCE</div>`;
        this.resumeData.work.forEach(job => {
            const dateStr = `${job.startDate || ''} \u2014 ${job.endDate || 'Present'}`;
            expHtml += `
            <div class="experience-item">
                <div class="item-header">
                    <h4 class="item-title">${job.position || ''}</h4>
                    <span class="item-date">${dateStr}</span>
                </div>
                <div class="item-subtitle">${job.name || ''} <span class="item-location">${job.location || ''}</span></div>
                ${this.formatHighlights(job.highlights)}
            </div>`;
        });
        expHtml += `</div>`;
     }

     let eduHtml = '';
     if (this.resumeData.education && this.resumeData.education.length > 0) {
        eduHtml += `<div class="section-block"><div class="section-title">EDUCATION</div>`;
        this.resumeData.education.forEach(edu => {
            const dateStr = (edu.startDate || edu.endDate) ? `${edu.startDate || ''} \u2014 ${edu.endDate || ''}` : '';
            eduHtml += `
            <div class="education-item">
                <div class="edu-left">
                    <h4 class="education-title">${edu.studyType || ''}${edu.area ? `, ${edu.area}` : ''}</h4>
                    <p class="education-school">${edu.institution || ''}</p>
                </div>
                <div class="education-date">${dateStr}</div>
            </div>`;
        });
        eduHtml += `</div>`;
     }

     let skillsHtml = '';
     if (this.resumeData.skills && this.resumeData.skills.length > 0 && this.resumeData.skills[0].keywords && this.resumeData.skills[0].keywords.length > 0) {
        skillsHtml += `<div><div class="section-title" style="border-bottom:none; margin-bottom:8px;">CORE COMPETENCIES</div><ul class="skills-list-exec">`;
        const half = Math.ceil(this.resumeData.skills[0].keywords.length / 2);
        skillsHtml += this.resumeData.skills[0].keywords.slice(0, half).map(k => `<li>${k}</li>`).join('');
        skillsHtml += `</ul></div>`;
        
        skillsHtml += `<div><div class="section-title" style="border-bottom:none; margin-bottom:8px;">TECHNICAL SKILLS</div><ul class="skills-list-exec">`;
        skillsHtml += this.resumeData.skills[0].keywords.slice(half).map(k => `<li>${k}</li>`).join('');
        skillsHtml += `</ul></div>`;
     }

     return `
        <div class="header-block">
            <h1 class="resume-name">${name}</h1>
            <div class="contact-info">${contactHtml.replace(/<\/span><span/g, '</span> • <span')}</div>
        </div>
        ${summaryHtml}
        ${expHtml}
        ${eduHtml}
        ${skillsHtml ? `<div class="section-block"><div class="skills-grid">${skillsHtml}</div></div>` : ''}
     `;
  }


  // ENHANCED: Proper JSON export with better error handling and user feedback
  exportJSON() {
    try {
      console.log("Starting JSON export...");
      this.setButtonLoading("exportBtn", true);
      this.showStatusMessage(
        "Preparing JSON file for download...",
        "processing"
      );

      // Validate resume data
      if (!this.resumeData || !this.resumeData.basics) {
        throw new Error("No resume data to export");
      }

      // Create formatted JSON string with validation
      const dataToExport = {
        basics: this.resumeData.basics || {},
        work: this.resumeData.work || [],
        education: this.resumeData.education || [],
        skills: this.resumeData.skills || [],
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      const dataStr = JSON.stringify(dataToExport, null, 2);
      console.log("JSON data prepared:", dataStr.length, "characters");

      if (dataStr.length < 50) {
        throw new Error("Resume data appears to be empty or invalid");
      }

      // Create blob with proper MIME type and BOM for better compatibility
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM
      const blob = new Blob([bom, dataStr], {
        type: "application/json;charset=utf-8",
      });
      console.log("JSON blob created:", blob.size, "bytes");

      // Generate meaningful filename with timestamp
      const nameForFile =
        this.resumeData.basics.name &&
        this.resumeData.basics.name.trim() &&
        this.resumeData.basics.name !== "Your Name"
          ? this.resumeData.basics.name
              .replace(/[^a-zA-Z0-9\s]/g, "")
              .replace(/\s+/g, "_")
          : "Resume";

      const now = new Date();
      const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const fileName = `${nameForFile}_Data_${timestamp}.json`;

      console.log("Generated filename:", fileName);

      // Trigger download with enhanced error handling
      this.triggerDownload(blob, fileName);

      console.log("JSON export completed successfully");
      this.showStatusMessage(
        `✅ JSON file "${fileName}" downloaded successfully!`,
        "success",
        5000
      );
    } catch (error) {
      console.error("JSON export failed:", error);
      this.showStatusMessage(
        `❌ Failed to export JSON: ${error.message}`,
        "error",
        8000
      );
    } finally {
      this.setButtonLoading("exportBtn", false);
    }
  }

  // ENHANCED: Import JSON with better file handling
  importJSON() {
    try {
      console.log("Starting JSON import process...");

      const fileInput = document.getElementById("fileInput");
      if (!fileInput) {
        throw new Error("File input element not found");
      }

      this.setButtonLoading("importBtn", true);
      this.showStatusMessage("📁 Opening file picker...", "processing");

      // Reset file input to ensure change events fire
      fileInput.value = "";

      // Create a promise to handle the file dialog result
      const filePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("File picker timeout"));
        }, 30000); // 30 second timeout

        const handleChange = (e) => {
          clearTimeout(timeout);
          fileInput.removeEventListener("change", handleChange);
          resolve(e.target.files[0]);
        };

        fileInput.addEventListener("change", handleChange);
      });

      // Trigger file picker
      fileInput.click();
      console.log("File picker opened");
    } catch (error) {
      console.error("Failed to open file picker:", error);
      this.showStatusMessage(
        `❌ Failed to open file picker: ${error.message}`,
        "error"
      );
      this.setButtonLoading("importBtn", false);
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected in handleFileImport");
      this.setButtonLoading("importBtn", false);
      this.showStatusMessage("No file selected", "error", 2000);
      return;
    }

    console.log(
      "Processing file import:",
      file.name,
      file.size,
      "bytes",
      file.type
    );

    // Enhanced file validation
    const isJsonFile =
      file.type === "application/json" ||
      file.name.toLowerCase().endsWith(".json") ||
      file.type === "text/plain"; // Some systems report JSON as text/plain

    if (!isJsonFile) {
      this.showStatusMessage(
        "❌ Please select a valid JSON file (.json extension)",
        "error"
      );
      this.setButtonLoading("importBtn", false);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      this.showStatusMessage(
        "❌ File too large. Please select a file smaller than 10MB",
        "error"
      );
      this.setButtonLoading("importBtn", false);
      return;
    }

    this.showStatusMessage("📖 Reading and processing file...", "processing");

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log("File read successfully, parsing JSON...");
        const fileContent = e.target.result;

        if (!fileContent || fileContent.trim().length === 0) {
          throw new Error("File appears to be empty");
        }

        const importedData = JSON.parse(fileContent);
        console.log("JSON parsed successfully:", importedData);

        // Enhanced validation
        if (!importedData || typeof importedData !== "object") {
          throw new Error("Invalid file format - not a valid JSON object");
        }

        // Check for resume data structure
        const hasResumeData =
          importedData.basics ||
          importedData.work ||
          importedData.education ||
          importedData.skills;

        if (!hasResumeData) {
          throw new Error("File does not contain valid resume data structure");
        }

        // Merge with current data structure, preserving existing data where import data is missing
        this.resumeData = {
          basics: {
            name: "",
            email: "",
            phone: "",
            linkedin: "",
            summary: "",
            ...this.resumeData.basics, // Keep existing
            ...importedData.basics, // Override with imported
          },
          work: Array.isArray(importedData.work)
            ? importedData.work
            : this.resumeData.work,
          education: Array.isArray(importedData.education)
            ? importedData.education
            : this.resumeData.education,
          skills: Array.isArray(importedData.skills)
            ? importedData.skills
            : this.resumeData.skills,
        };

        console.log("Data merged successfully");

        // Clear and repopulate form
        this.populateForm();
        this.updatePreview();

        console.log("Resume data imported successfully");
        this.showStatusMessage(
          `✅ Resume data imported successfully from "${file.name}"!`,
          "success",
          5000
        );
      } catch (error) {
        console.error("JSON import failed:", error);
        let errorMessage = "Failed to import file: " + error.message;
        if (error.name === "SyntaxError") {
          errorMessage =
            "File contains invalid JSON format. Please check the file and try again.";
        }
        this.showStatusMessage(`❌ ${errorMessage}`, "error", 8000);
      } finally {
        this.setButtonLoading("importBtn", false);
      }
    };

    reader.onerror = () => {
      console.error("File read error");
      this.showStatusMessage("❌ Failed to read the selected file", "error");
      this.setButtonLoading("importBtn", false);
    };

    reader.readAsText(file, "UTF-8"); // Specify encoding

    // Reset file input
    event.target.value = "";
  }

  generatePDF() {
    console.log("Starting PDF generation via html2canvas high-fidelity snapshot...");
    this.setButtonLoading("downloadPdf", true);
    this.showStatusMessage("🔄 Generating PDF document...", "processing");

    if (!window.jspdf || !window.html2canvas) {
      this.showStatusMessage("❌ PDF libraries not loaded yet. Please try again or refresh.", "error", 5000);
      this.setButtonLoading("downloadPdf", false);
      return;
    }

    const { jsPDF } = window.jspdf;
    const element = document.getElementById("resumePreview");
    
    // Check if element exists
    if (!element) {
      this.showStatusMessage("❌ Could not find resume preview.", "error", 5000);
      this.setButtonLoading("downloadPdf", false);
      return;
    }
    
    // Temporarily adjust scale to exactly 1 so the capture operates organically
    const originalTransform = element.style.transform || 'none';
    element.style.transform = 'scale(1)';
    element.style.transformOrigin = 'top left';

    // Text chopping in html2canvas (especially on Windows scaling > 100%) occurs 
    // due to sub-pixel rounding of font metrics. To cure this, we push the render 
    // scale to 4x (super-resolution) and force geometric rendering on the clone.
    html2canvas(element, {
      scale: 3, // Maximum crispness, avoids subpixel float clipping 
      useCORS: true,
      logging: false,
      backgroundColor: window.getComputedStyle(element).backgroundColor || '#ffffff',
      onclone: (clonedDoc) => {
        const clonedRef = clonedDoc.getElementById('resumePreview');
        if (clonedRef) {
          clonedRef.style.transform = 'none'; // reset completely
        }
        // Iterate all child elements to enforce strict geometric precision
        const allElements = clonedDoc.querySelectorAll('*');
        for (let i = 0; i < allElements.length; i++) {
          allElements[i].style.setProperty('text-rendering', 'geometricPrecision', 'important');
          // Removing hardware kerning which occasionally confuses html2canvas bounds
          allElements[i].style.setProperty('font-variant-ligatures', 'none', 'important');
          allElements[i].style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
        }
      }
    }).then((canvas) => {
      // Restore the UI scaling smoothly
      element.style.transform = originalTransform; 

      // Output as high-quality jpeg
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      // Standard local portrait A4 PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      // Infinite page spanning logic for extraordinarily long resumes
      let heightLeft = pdfHeight - pdf.internal.pageSize.getHeight();
      let position = 0;
      
      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      // Safe filename generator
      const name = this.resumeData.basics.name;
      const nameForFile = (name && name !== "Your Name")
          ? name.replace(/[^a-zA-Z0-9\s\-_]/g, "").replace(/\s+/g, "_").substring(0, 50)
          : "Resume";
          
      const now = new Date();
      const timestamp = now.toISOString().split("T")[0];
      const fileName = `${nameForFile}_${timestamp}.pdf`;
      
      pdf.save(fileName);

      this.showStatusMessage(
        `✅ PDF "${fileName}" downloaded successfully!`,
        "success",
        5000
      );
    }).catch((error) => {
      console.error("PDF generation failed:", error);
      this.showStatusMessage("❌ Failed to generate PDF.", "error", 5000);
      
      // Failsafe restore
      element.style.transform = originalTransform;
    }).finally(() => {
      this.setButtonLoading("downloadPdf", false);
    });
  }

}

// Enhanced initialization with better error handling
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing Resume Builder...");

  // Enhanced jsPDF availability check
  const checkJsPDF = () => {
    if (window.jspdf && window.jspdf.jsPDF) {
      console.log("✅ jsPDF library loaded successfully");
      return true;
    } else {
      console.warn("⚠️ jsPDF library not found or not loaded correctly");
      return false;
    }
  };

  // Wait a bit for external libraries to load
  setTimeout(() => {
    checkJsPDF();

    try {
      window.resumeBuilder = new ResumeBuilder();
      console.log("✅ Resume Builder initialization completed successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Resume Builder:", error);

      // Show error to user
      const statusElement = document.getElementById("statusMessage");
      if (statusElement) {
        statusElement.textContent =
          "Failed to initialize application. Please refresh the page.";
        statusElement.className = "status-message error";
        statusElement.classList.remove("hidden");
      }
    }
  }, 500); // 500ms delay to ensure libraries are loaded
});
