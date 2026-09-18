export const ROUTE_PATHS = {
  HOME: "/",
  LOGIN: "/login",
  USER_BASE: "/user",
  INTERVIEW_BASE: "/interview",
  USER_DASHBOARD: "/user/dashboard?user=true",
  USER_START_INTERVIEW: "/user/startinterview?user=true",
  USER_RESUME_MANAGER: "/user/resume-manager?user=true",
  USER_ANALYTICS: "/user/analytics?user=true",
  USER_SESSION_HISTORY: "/user/session-history?user=true",
  USER_PROFILE: "/user/profile?user=true",
};

export const getInterviewSessionPath = (interviewId, interviewType) =>
  `/interview/${interviewId}/${interviewType}`;
