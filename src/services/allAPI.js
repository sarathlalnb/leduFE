// apiService.js
import axiosConfig from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";
import { getAuthHeader } from "./headers";



export const loginUser = (data) =>
  axiosConfig("post", API_ENDPOINTS.AUTH.LOGIN, data);



export const registerStudent = (data) =>
  axiosConfig(
    "post",
    API_ENDPOINTS.ADMIN.REGISTER_STUDENT,
    data,
    getAuthHeader()
  );

export const assignTutor = (studentId, data) =>
  axiosConfig(
    "post",
    API_ENDPOINTS.ADMIN.ASSIGN_TUTOR(studentId),
    data,
    getAuthHeader()
  );

export const scheduleClass = (studentId, data) =>
  axiosConfig(
    "post",
    API_ENDPOINTS.ADMIN.SCHEDULE_CLASS(studentId),
    data,
    getAuthHeader()
  );

export const updateClassStatus = (classId, data) =>
  axiosConfig(
    "patch",
    API_ENDPOINTS.ADMIN.UPDATE_CLASS_STATUS(classId),
    data,
    getAuthHeader()
  );



export const getAllStudents = (params = {}) =>
  axiosConfig(
    "get",
    API_ENDPOINTS.ADMIN.GET_ALL_STUDENTS,
    "",
    getAuthHeader(),
    params
  );

export const getSingleStudent = (studentId) =>
  axiosConfig(
    "get",
    API_ENDPOINTS.ADMIN.GET_SINGLE_STUDENT(studentId),
    "",
    getAuthHeader()
  );

export const updateStudent = (studentId, data) =>
  axiosConfig(
    "put",
    API_ENDPOINTS.ADMIN.UPDATE_STUDENT(studentId),
    data,
    getAuthHeader()
  );

export const deleteStudent = (studentId) =>
  axiosConfig(
    "delete",
    API_ENDPOINTS.ADMIN.DELETE_STUDENT(studentId),
    "",
    getAuthHeader()
  );



export const getAdminDashboard = () =>
  axiosConfig(
    "get",
    API_ENDPOINTS.ADMIN.DASHBOARD,
    "",
    getAuthHeader()
  );



export const getAllRequests = (params = {}) =>
  axiosConfig(
    "get",
    API_ENDPOINTS.ADMIN.GET_REQUESTS,
    "",
    getAuthHeader(),
    params
  );

export const handleRequest = (requestId, data) =>
  axiosConfig(
    "patch",
    API_ENDPOINTS.ADMIN.HANDLE_REQUEST(requestId),
    data,
    getAuthHeader()
  );

export const createTest = (studentId, data) =>
  axiosConfig(
    "post",
    API_ENDPOINTS.ADMIN.CREATE_TEST(studentId),
    data,
    getAuthHeader()
  );

export const updateTestMarks = (testId, data) =>
  axiosConfig(
    "patch",
    API_ENDPOINTS.ADMIN.UPDATE_TEST_MARKS(testId),
    data,
    getAuthHeader()
  );



export const getStudentDashboard = () =>
  axiosConfig(
    "get",
    API_ENDPOINTS.STUDENT.DASHBOARD,
    "",
    getAuthHeader()
  );

export const getStudentClasses = () =>
  axiosConfig(
    "get",
    API_ENDPOINTS.STUDENT.CLASSES,
    "",
    getAuthHeader()
  );

export const createRequest = (data) =>
  axiosConfig(
    "post",
    API_ENDPOINTS.STUDENT.CREATE_REQUEST,
    data,
    getAuthHeader()
  );

export const getMyRequests = () =>
  axiosConfig(
    "get",
    API_ENDPOINTS.STUDENT.GET_REQUESTS,
    "",
    getAuthHeader()
  );

export const getStudentTests = () =>
  axiosConfig(
    "get",
    API_ENDPOINTS.STUDENT.TESTS,
    "",
    getAuthHeader()
  );