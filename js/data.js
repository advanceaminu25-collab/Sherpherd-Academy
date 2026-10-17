
(function () {
  "use strict";

  const STORAGE_KEY = "sherpherd_academy_demo_students_v1";

  function readStudents() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Could not read demo students:", error);
      return [];
    }
  }

  function writeStudents(students) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  function makeStudentNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `SA-${year}-${random}`;
  }

  function getStudents() {
    return readStudents().sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(
        String(a.createdAt || "")
      );
    });
  }

  function addStudent(input) {
    const students = readStudents();

    const firstName = String(input.first_name || "").trim();
    const lastName = String(input.last_name || "").trim();

    if (!firstName || !lastName) {
      throw new Error("Enter the student's first and last name.");
    }

    let studentNumber = String(input.student_number || "").trim();

    if (!studentNumber) {
      studentNumber = makeStudentNumber();
    }

    const duplicate = students.some(function (student) {
      return student.student_number.toLowerCase() ===
        studentNumber.toLowerCase();
    });

    if (duplicate) {
      throw new Error("That student number already exists.");
    }

    const student = {
      id: createId(),
      first_name: firstName,
      last_name: lastName,
      student_number: studentNumber,
      class_name: String(input.class_name || "").trim(),
      guardian_name: String(input.guardian_name || "").trim(),
      guardian_phone: String(input.guardian_phone || "").trim(),
      date_of_birth: String(input.date_of_birth || ""),
      admission_date: String(input.admission_date || ""),
      status: "Active",
      createdAt: new Date().toISOString()
    };

    students.push(student);
    writeStudents(students);

    return student;
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }

    return "student-" + Date.now() + "-" +
      Math.random().toString(36).slice(2, 10);
  }

  function deleteAllDemoStudents() {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.SherpherdData = {
    getStudents: getStudents,
    addStudent: addStudent,
    deleteAllDemoStudents: deleteAllDemoStudents
  };
})();
