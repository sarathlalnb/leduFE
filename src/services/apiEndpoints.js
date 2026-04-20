import { BaseUrl } from "./baseURL";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${BaseUrl}/login`,
  },

  ADMIN: {
    REGISTER_STUDENT: `${BaseUrl}/register-student`,
    ASSIGN_TUTOR: (studentId) =>
      `${BaseUrl}/students/${studentId}/assign-tutor`,
    SCHEDULE_CLASS: (studentId) =>
      `${BaseUrl}/students/${studentId}/schedule-class`,
    UPDATE_CLASS_STATUS: (classId) =>
      `${BaseUrl}/classes/${classId}/status`,

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
};