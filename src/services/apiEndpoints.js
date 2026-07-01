import { BaseUrl } from "./baseURL";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BaseUrl}/login`,
  },

  ADMIN: {
    REGISTER_STUDENT: `${BaseUrl}/register-student`,
    REGISTER_TUTOR: `${BaseUrl}/register-tutor`,
    GET_TUTORS: `${BaseUrl}/tutors`,
    UPDATE_TUTOR: (tutorId) => `${BaseUrl}/tutors/${tutorId}`,
    DELETE_TUTOR: (tutorId) => `${BaseUrl}/tutors/${tutorId}`,
    TUTOR_SALARY_REPORT: (tutorName) => `${BaseUrl}/tutors/${encodeURIComponent(tutorName)}/salary-report`,
    ASSIGN_TUTOR: (studentId) =>
      `${BaseUrl}/students/${studentId}/assign-tutor`,
    UPDATE_ASSIGNED_TUTOR: (studentId, tutorId) =>
      `${BaseUrl}/students/${studentId}/tutors/${tutorId}`,
    SCHEDULE_CLASS: (studentId) =>
      `${BaseUrl}/students/${studentId}/schedule-class`,
    UPDATE_CLASS_STATUS: (classId) =>
      `${BaseUrl}/classes/${classId}/status`,
    EDIT_CLASS: (classId) =>
      `${BaseUrl}/classes/${classId}`,
    DELETE_CLASS: (classId) =>
      `${BaseUrl}/classes/${classId}`,
    DELETE_ALL_CLASSES: (studentId) =>
      `${BaseUrl}/students/${studentId}/classes`,
    BULK_EDIT_CLASSES: `${BaseUrl}/classes/bulk-edit`,

    GET_ALL_STUDENTS: `${BaseUrl}/students`,
    GET_SINGLE_STUDENT: (studentId) =>
      `${BaseUrl}/students/${studentId}`,
    UPDATE_STUDENT: (studentId) =>
      `${BaseUrl}/students/${studentId}`,
    DELETE_STUDENT: (studentId) =>
      `${BaseUrl}/students/${studentId}`,

    DASHBOARD: `${BaseUrl}/dashboard`,

    GET_REQUESTS: `${BaseUrl}/requests`,
    HANDLE_REQUEST: (requestId) =>
      `${BaseUrl}/requests/${requestId}`,

    CREATE_TEST: (studentId) =>
      `${BaseUrl}/students/${studentId}/tests`,
    UPDATE_TEST_MARKS: (testId) =>
      `${BaseUrl}/tests/${testId}/marks`,
  },

  STUDENT: {
    DASHBOARD: `${BaseUrl}/student-dashboard`,
    CLASSES: `${BaseUrl}/student-classes`,
    CREATE_REQUEST: `${BaseUrl}/student-request`,
    GET_REQUESTS: `${BaseUrl}/student-requests`,
    TESTS: `${BaseUrl}/student-tests`,
  },

  TUTOR: {
    TUTOR_REQUEST: `${BaseUrl}/tutor-request`,
  },
};