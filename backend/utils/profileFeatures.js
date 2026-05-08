const User = require("../models/user");

function profileCompletionPct(user) {
  const fields = [
    Boolean(user?.name),
    Boolean(user?.email),
    Boolean(user?.phone),
    Boolean(user?.avatar),
    Boolean(user?.resume),
    Array.isArray(user?.education) && user.education.length > 0,
    Array.isArray(user?.skills) && user.skills.length > 0,
    Number(user?.experienceYears || 0) > 0,
    Array.isArray(user?.faceEmbeddings) && user.faceEmbeddings.length > 0,
  ];
  return (fields.filter(Boolean).length / fields.length) * 100;
}

async function buildMlPayload(user) {
  const resumeDuplicateCount = user.resume
    ? await User.countDocuments({ _id: { $ne: user._id }, resume: user.resume })
    : 0;

  const ip = user.registrationMeta?.lastKnownIp || "";
  const multipleAccountsSameIpCount = ip
    ? await User.countDocuments({ _id: { $ne: user._id }, "registrationMeta.lastKnownIp": ip })
    : 0;

  // Very simple mismatch heuristic; can be improved when you collect real data.
  const skillsCount = Array.isArray(user.skills) ? user.skills.length : 0;
  const expYears = Number(user.experienceYears || 0);
  const skillsPerYear = expYears > 0 ? skillsCount / expYears : skillsCount;
  const skillExperienceMismatch = skillsPerYear > 20 ? 1.0 : skillsPerYear > 12 ? 0.7 : 0.1;

  const unrealisticPatternsScore =
    (user.name && user.name.length < 3 ? 0.4 : 0) +
    (user.resume ? 0 : 0.3) +
    (expYears > 40 ? 0.5 : 0);

  return {
    user_id: String(user._id),
    role: user.role,
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar || "",
    resume: user.resume || "",
    education: user.education || [],
    skills: user.skills || [],
    experience_years: expYears,

    profile_completion_pct: profileCompletionPct(user),
    resume_duplicate_count: resumeDuplicateCount,
    skill_experience_mismatch: skillExperienceMismatch,
    multiple_accounts_same_ip_count: multipleAccountsSameIpCount,
    face_mismatch_attempts: user.faceLoginSecurity?.mismatchAttempts || 0,
    unrealistic_patterns_score: Math.min(1, unrealisticPatternsScore),
  };
}

module.exports = { buildMlPayload, profileCompletionPct };

