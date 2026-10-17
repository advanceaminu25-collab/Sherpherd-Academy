
(function () {
  "use strict";

  const config = window.SHERPHERD_CONFIG || {};
  const data = window.SherpherdData;

  const $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  const $$ = function (selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  };

  const pageNames = {
    overview: "Overview",
    students: "Students",
    admissions: "Admissions",
    staff: "Staff",
    attendance: "Attendance",
    classes: "Classes & Subjects",
    timetable: "Timetable",
    assignments: "Assignments",
    results: "Results & Exams",
    fees: "Fees & Payments",
    announcements: "Announcements",
    settings: "Settings"
  };

  let currentPage = "overview";
  let searchTerm = "";
  let toastTimer = null;

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[char];
    });
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value + (String(value).length === 10 ? "T00:00:00" : ""));

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function initials(firstName, lastName) {
    return (
      String(firstName || "").trim().charAt(0) +
      String(lastName || "").trim().charAt(0)
    ).toUpperCase() || "ST";
  }

  function getFilteredStudents() {
    const students = data.getStudents();

    if (!searchTerm) return students;

    const query = searchTerm.toLowerCase();

    return students.filter(function (student) {
      return [
        student.first_name,
        student.last_name,
        student.student_number,
        student.class_name,
        student.guardian_name,
        student.guardian_phone
      ].some(function (value) {
        return String(value || "").toLowerCase().includes(query);
      });
    });
  }

  function renderStudents() {
    const tbody = $("#recentStudentsBody");
    const totalLabel = $("#chartStudentTotal");

    if (!tbody) return;

    const students = getFilteredStudents();

    if (totalLabel) {
      totalLabel.textContent = String(data.getStudents().length);
    }

    if (students.length === 0) {
      const message = searchTerm
        ? "Try a different name, class, or student number."
        : "Add your first student to begin building the school register.";

      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <strong>${searchTerm ? "No matching students" : "No students yet"}</strong>
              ${escapeHTML(message)}
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = students.slice(0, 8).map(function (student) {
      const fullName = `${student.first_name} ${student.last_name}`.trim();

      return `
        <tr>
          <td>
            <div class="student-cell">
              <span class="student-avatar">
                ${escapeHTML(initials(student.first_name, student.last_name))}
              </span>
              <span>
                <strong>${escapeHTML(fullName)}</strong>
                <small>${escapeHTML(student.student_number)}</small>
              </span>
            </div>
          </td>
          <td>${escapeHTML(student.class_name || "Not assigned")}</td>
          <td>${escapeHTML(student.guardian_name || "—")}</td>
          <td>${escapeHTML(formatDate(student.admission_date))}</td>
          <td><span class="status-badge">${escapeHTML(student.status || "Active")}</span></td>
        </tr>
      `;
    }).join("");
  }

  function renderDashboard() {
    const students = data.getStudents();

    const totalStudents = $("#totalStudents");
    const totalStaff = $("#totalStaff");
    const attendanceRate = $("#attendanceRate");
    const attendanceDetail = $("#attendanceDetail");
    const feesCollected = $("#feesCollected");

    if (totalStudents) {
      totalStudents.textContent = String(students.length);
    }

    // These figures are placeholders until real modules and database
    // records are connected. Do not treat them as actual school statistics.
    if (totalStaff) totalStaff.textContent = "0";
    if (attendanceRate) attendanceRate.textContent = "—%";
    if (attendanceDetail) attendanceDetail.textContent = "No attendance data";
    if (feesCollected) feesCollected.textContent = "₦0";

    renderStudents();
  }

  function showToast(message) {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer) window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 3000);
  }

  function openStudentModal() {
    const backdrop = $("#modalBackdrop");
    const form = $("#studentForm");
    const message = $("#formMessage");

    if (!backdrop) {
      showToast("Student form is not available on this page.");
      return;
    }

    if (form) form.reset();
    if (message) message.textContent = "";

    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");

    const firstInput = $('input[name="first_name"]', backdrop);

    if (firstInput) {
      window.setTimeout(function () {
        firstInput.focus();
      }, 50);
    }
  }

  function closeStudentModal() {
    const backdrop = $("#modalBackdrop");

    if (!backdrop) return;

    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
  }

  function handleStudentSubmit(event) {
    event.preventDefault();

    const form = $("#studentForm");
    const message = $("#formMessage");

    if (!form) return;

    const formData = new FormData(form);
    const studentInput = {};

    formData.forEach(function (value, key) {
      studentInput[key] = String(value).trim();
    });

    try {
      const student = data.addStudent(studentInput);

      closeStudentModal();
      renderDashboard();

      showToast(
        `${student.first_name} ${student.last_name} added to the demo register.`
      );
    } catch (error) {
      if (message) {
        message.textContent = error.message || "Could not add the student.";
      } else {
        showToast(error.message || "Could not add the student.");
      }
    }
  }

  function exportStudentsCSV() {
    const students = getFilteredStudents();

    if (students.length === 0) {
      showToast("There are no student records to export.");
      return;
    }

    const columns = [
      ["Student Number", "student_number"],
      ["First Name", "first_name"],
      ["Last Name", "last_name"],
      ["Class", "class_name"],
      ["Guardian Name", "guardian_name"],
      ["Guardian Phone", "guardian_phone"],
      ["Date of Birth", "date_of_birth"],
      ["Admission Date", "admission_date"],
      ["Status", "status"]
    ];

    function csvCell(value) {
      return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
    }

    const lines = [
      columns.map(function (column) {
        return csvCell(column[0]);
      }).join(",")
    ];

    students.forEach(function (student) {
      lines.push(
        columns.map(function (column) {
          return csvCell(student[column[1]]);
        }).join(",")
      );
    });

    const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sherpherd-academy-students.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    showToast("Student CSV exported.");
  }

  function switchPage(page) {
    if (!pageNames[page]) return;

    currentPage = page;

    $$(".nav-item[data-page]").forEach(function (button) {
      const isActive = button.dataset.page === page;

      button.classList.toggle("active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });

    const breadcrumb = $("#breadcrumbCurrent");
    if (breadcrumb) breadcrumb.textContent = pageNames[page];

    const overview = $("#overviewPage");
    const placeholder = $("#modulePlaceholder");

    if (overview) overview.hidden = page !== "overview";
    if (placeholder) {
      placeholder.hidden = page === "overview";

      if (page !== "overview") {
        const title = $("#placeholderTitle");
        const description = $("#placeholderDescription");

        if (title) title.textContent = pageNames[page];

        if (description) {
          description.textContent =
            `${pageNames[page]} is planned for a future module. ` +
            "This section is not connected to a database yet.";
        }
      }
    }

    const sidebar = $("#sidebar");
    if (sidebar) sidebar.classList.remove("open");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleQuickAction(action) {
    switch (action) {
      case "student":
        openStudentModal();
        break;

      case "attendance":
        switchPage("attendance");
        showToast("Attendance module is not connected yet.");
        break;

      case "announcement":
        switchPage("announcements");
        showToast("Announcements module is not connected yet.");
        break;

      case "payment":
        switchPage("fees");
        showToast("Payments module is not connected yet.");
        break;

      default:
        showToast("That action is not available yet.");
    }
  }

  function initialise() {
    const yearNow = $("#yearNow");
    const todayLabel = $("#todayLabel");
    const welcomeName = $("#welcomeName");
    const setupNotice = $("#setupNotice");
    const dismissNotice = $("#dismissNotice");
    const searchInput = $("#globalSearch");
    const form = $("#studentForm");
    const sidebar = $("#sidebar");
    const menuToggle = $("#menuToggle");

    if (yearNow) yearNow.textContent = String(new Date().getFullYear());

    if (todayLabel) {
      todayLabel.textContent = new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date());
    }

    if (welcomeName) welcomeName.textContent = "Administrator";

    if (config.demoMode && setupNotice) {
      setupNotice.hidden = false;
    }

    if (dismissNotice && setupNotice) {
      dismissNotice.addEventListener("click", function () {
        setupNotice.hidden = true;
      });
    }

    $$(".nav-item[data-page]").forEach(function (button) {
      button.addEventListener("click", function () {
        switchPage(button.dataset.page);
      });
    });

    $$("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        handleQuickAction(button.dataset.action);
      });
    });

    ["#addStudentTop", "#addStudentButton", "#addStudentEmpty"].forEach(
      function (selector) {
        const button = $(selector);
        if (button) button.addEventListener("click", openStudentModal);
      }
    );

    const exportButton = $("#exportStudents");
    if (exportButton) {
      exportButton.addEventListener("click", exportStudentsCSV);
    }

    if (form) {
      form.addEventListener("submit", handleStudentSubmit);
    }

    ["#modalClose", "#cancelStudent"].forEach(function (selector) {
      const button = $(selector);
      if (button) button.addEventListener("click", closeStudentModal);
    });

    const backdrop = $("#modalBackdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop) closeStudentModal();
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        searchTerm = searchInput.value.trim();
        renderStudents();
      });
    }

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeStudentModal();
    });

    renderDashboard();
    switchPage("overview");
  }

  document.addEventListener("DOMContentLoaded", initialise);
})();
