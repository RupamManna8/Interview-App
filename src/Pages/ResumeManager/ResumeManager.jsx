// ResumeManager.jsx
import React, { useState, useRef, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserContext } from '../../Context/UserContext';

const ResumeManager = () => {
  const { apiRequest,uploadedResumes, setUploadedResumes } = useContext(UserContext);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [expandedResumeIndex, setExpandedResumeIndex] = useState(null);
  const [hasNewUpload, setHasNewUpload] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const allowedFormats = ['pdf', 'doc', 'docx'];
  const acceptValue = '.pdf,.doc,.docx';
  const maxFileSize = 10 * 1024 * 1024;

  const getResumeDetails = (item) => item?.data || item?.resumeData || item || {};
  const ensureArray = (value) => (Array.isArray(value) ? value : (value ? [value] : []));

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateResumeFile = (candidateFile) => {
    if (!candidateFile) {
      return 'No file selected.';
    }

    const extension = String(candidateFile.name || '')
      .split('.')
      .pop()
      ?.toLowerCase();

    if (!extension || !allowedFormats.includes(extension)) {
      return `Unsupported format. Allowed: ${allowedFormats.join(', ').toUpperCase()}`;
    }

    if (candidateFile.size > maxFileSize) {
      return `File too large. Maximum allowed size is ${formatFileSize(maxFileSize)}.`;
    }

    return null;
  };

  

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    const validationError = validateResumeFile(droppedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    handleFileUpload(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validationError = validateResumeFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }
      handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (file) => {
    console.log(file)
    setFile(file);
    setIsUploading(true);
    setShowSkills(false);
    setUploadProgress(0);
    setError(null);

    let progressInterval;

    try {
      const formData = new FormData();
      formData.append('file', file);

      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            return 90;
          }
          return prev + Math.random() * 25;
        });
      }, 200);

      const response = await apiRequest('/service/upload-resume', {
        method: 'POST',
        headers: {},
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response?.success) {
        setResumeData(response.resumeData);
        setHasNewUpload(true);
        
        setUploadedResumes(prev => [{
          name: response.resumeData?.Name || file.name,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          size: formatFileSize(file.size),
          skills: response.resumeData?.Skills?.length || 0,
          data: response.resumeData
        }, ...prev]);

        setTimeout(() => {
          setShowSkills(true);
          setIsUploading(false);
        }, 300);
      } else {
        setError(response?.message || 'Failed to process resume');
        setIsUploading(false);
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err?.message || 'Failed to upload resume. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
    }
  };

  const getResumeHistory = async () => {
    try { 
      const response = await apiRequest('/service/resume', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response?.success) {
        const sorted = [...(response.resumes || [])].sort((a, b) => {
          const aDate = new Date(a?.createdAt || 0).getTime();
          const bDate = new Date(b?.createdAt || 0).getTime();
          return bDate - aDate;
        });
        setUploadedResumes(sorted);
      } else {
        console.error("Failed to fetch resume history:", response?.message);
      }
    } catch (error) {
      console.error("Error fetching resume history:", error);
    }
  };

  useEffect(() => {
    getResumeHistory();
  }, []);


  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const skillItem = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1F2937] mb-2">
            Resume Manager
          </h1>
          <p className="text-sm text-[#6B7280]">
            Upload your resume to extract skills and generate personalized interview questions
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className={`grid gap-6 ${hasNewUpload && resumeData ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          
          {/* LEFT COLUMN - Upload Panel */}
          <div className="space-y-6">
            {/* Drag & Drop Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative bg-white rounded-xl border-2 border-dashed p-8 md:p-12
                  transition-all duration-200 cursor-pointer
                  ${isDragging 
                    ? 'border-[#4F46E5] bg-[#F5F3FF]' 
                    : 'border-[#E5E7EB] bg-white hover:border-[#4F46E5]/50 hover:bg-[#F8F5F0]'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={acceptValue}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="text-center">
                  {/* Upload Icon */}
                  <div className="inline-block mb-4">
                    <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center transition-colors ${
                      isDragging ? 'bg-[#4F46E5]/10' : 'bg-[#F8F5F0]'
                    }`}>
                      <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-[#4F46E5]' : 'text-[#9CA3AF]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                  </div>

                  <h3 className="text-base font-medium text-[#1F2937] mb-1">
                    {isDragging ? 'Drop your resume here' : 'Upload your resume'}
                  </h3>
                  
                  <p className="text-sm text-[#6B7280] mb-3">
                    Drag and drop or <span className="text-[#4F46E5] font-medium hover:underline">browse</span>
                  </p>
                  
                  <p className="text-xs text-[#9CA3AF]">
                    Supports {allowedFormats.map((format) => format.toUpperCase()).join(', ')} (Max {formatFileSize(maxFileSize)})
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F5F3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-[#1F2937] truncate">{file?.name}</span>
                        <span className="text-xs text-[#6B7280] ml-2 flex-shrink-0">{Math.round(uploadProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F1ECE6] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          className="h-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-full"
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-[#9CA3AF]">{formatFileSize(file?.size || 0)}</span>
                        <span className="text-xs text-[#9CA3AF]">Processing resume...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="bg-red-50 border border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Interview Button */}
            <AnimatePresence>
              {showSkills && (
                <motion.div
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white py-3 px-4 rounded-lg font-medium text-sm shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Generate AI Interview Questions
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      {resumeData?.Skills?.length || 0} skills
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN - Resume Preview & Extracted Skills */}
          {hasNewUpload && resumeData && (
          <div className="space-y-6">
            {/* Resume Preview Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F5F0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#F5F3FF] rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2937]">Resume Preview</h3>
                    <p className="text-xs text-[#6B7280]">
                      {file ? file.name : 'No resume uploaded'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resume Preview Content */}
              <div className="p-6 min-h-[400px] bg-white">
                {resumeData ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-5"
                  >
                    {/* Candidate Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#F8F5F0] rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-[#1F2937]">{resumeData.Name || 'Not specified'}</h4>
                        <p className="text-xs text-[#6B7280]">{resumeData.PossibleRoles?.[0] || 'Professional'}</p>
                      </div>
                    </div>

                    {/* Skills Summary */}
                    {resumeData.Skills && resumeData.Skills.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-[#4F46E5] uppercase tracking-wider mb-2">Key Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.Skills.slice(0, 8).map((skill, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[#F5F3FF] text-[#4F46E5] rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                          {resumeData.Skills.length > 8 && (
                            <span className="px-2 py-1 bg-[#F8F5F0] text-[#6B7280] rounded text-xs font-medium">
                              +{resumeData.Skills.length - 8}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.Experience && resumeData.Experience.length > 0 && (
                      <div>
                        <p className="text-[10px] font-medium text-[#4F46E5] uppercase tracking-wider mb-2">Experience</p>
                        <div className="space-y-2">
                          {resumeData.Experience.slice(0, 2).map((exp, idx) => (
                            <div key={idx} className="border-l-2 border-[#4F46E5] pl-2">
                              {typeof exp === 'string' ? (
                                <p className="text-sm font-medium text-[#1F2937]">{exp}</p>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-[#1F2937]">{exp?.position || exp?.Title || 'Experience'}</p>
                                  <p className="text-xs text-[#6B7280]">{exp?.company || exp?.Company || ''}</p>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#F8F5F0] rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#6B7280]">Upload a resume to see preview</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Extracted Skills Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F5F0]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#1F2937]">Extracted Skills</h3>
                    <p className="text-xs text-[#6B7280]">AI-powered skill detection</p>
                  </div>
                  {showSkills && (
                    <div className="w-6 h-6 bg-green-50 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {showSkills && resumeData ? (
                    <motion.div
                      key="skills"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-5"
                    >
                      {/* All Skills */}
                      {resumeData.Skills && resumeData.Skills.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-[#6B7280] mb-2">
                            Skills ({resumeData.Skills.length})
                          </h4>
                          <motion.div 
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            className="flex flex-wrap gap-1.5"
                          >
                            {resumeData.Skills.map((skill, index) => (
                              <motion.span
                                key={index}
                                variants={skillItem}
                                whileHover={{ y: -1 }}
                                className="px-2.5 py-1 bg-[#F5F3FF] text-[#4F46E5] rounded text-xs font-medium border border-[#E5E7EB]"
                              >
                                {skill}
                              </motion.span>
                            ))}
                          </motion.div>
                        </div>
                      )}

                      {/* Experience Summary */}
                      {resumeData.Experience && resumeData.Experience.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-[#6B7280] mb-2">
                            Experience ({resumeData.Experience.length})
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {resumeData.Experience.map((exp, index) => (
                              <div key={index} className="px-2 py-1.5 bg-[#F8F5F0] rounded-lg">
                                {typeof exp === 'string' ? (
                                  <p className="text-xs font-medium text-[#1F2937]">{exp}</p>
                                ) : (
                                  <>
                                    <p className="text-xs font-medium text-[#1F2937]">{exp?.position || exp?.Title || 'Experience'}</p>
                                    <p className="text-[10px] text-[#6B7280]">{exp?.company || exp?.Company || ''}</p>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Possible Roles */}
                      {resumeData.PossibleRoles && resumeData.PossibleRoles.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-[#6B7280] mb-2">
                            Possible Roles ({resumeData.PossibleRoles.length})
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {resumeData.PossibleRoles.map((role, index) => (
                              <span
                                key={index}
                                className="px-2.5 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded text-xs font-medium border border-[#E5E7EB]"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="pt-3 border-t border-[#E5E7EB]">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#1F2937]">{resumeData.Skills?.length || 0}</p>
                            <p className="text-[10px] text-[#6B7280]">Skills</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#1F2937]">{resumeData.Experience?.length || 0}</p>
                            <p className="text-[10px] text-[#6B7280]">Experience</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold text-[#1F2937]">{resumeData.Projects?.length || 0}</p>
                            <p className="text-[10px] text-[#6B7280]">Projects</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 text-center"
                    >
                      <div className="w-12 h-12 mx-auto bg-[#F8F5F0] rounded-xl flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-xs text-[#6B7280]">Upload resume to extract skills</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
          )}
        </div>

        {/* Recent Uploads Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8"
        >
          <h3 className="text-sm font-medium text-[#1F2937] mb-3">Recent Uploads</h3>
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            {uploadedResumes.length > 0 ? (
              <div className="divide-y divide-[#E5E7EB]">
                {uploadedResumes.map((item, index) => (
                  <div key={index} className="p-3 hover:bg-[#F8F5F0] transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-[#F5F3FF] rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#1F2937] truncate">{item?.filename || item?.Name || getResumeDetails(item)?.Name || 'Resume'}</p>
                          <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                            <span>{item?.date || (item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-')}</span>
                            <span>•</span>
                            <span>{item?.time || (item?.createdAt ? new Date(item.createdAt).toLocaleTimeString() : '-')}</span>
                            <span>•</span>
                            <span>{item?.skills ?? ensureArray(getResumeDetails(item)?.Skills).length} skills</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedResumeIndex(expandedResumeIndex === index ? null : index)}
                        className="text-xs text-[#4F46E5] hover:text-[#7C3AED] font-medium whitespace-nowrap ml-3"
                      >
                        {expandedResumeIndex === index ? 'Hide details' : 'Show details'}
                      </button>
                    </div>

                    {expandedResumeIndex === index && (
                      <div className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F8F5F0] p-3 space-y-3">
                        <div>
                          <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ensureArray(getResumeDetails(item)?.Skills).length > 0 ? ensureArray(getResumeDetails(item)?.Skills).map((skill, skillIndex) => (
                              <span key={skillIndex} className="px-2 py-1 bg-[#F5F3FF] text-[#4F46E5] rounded text-xs font-medium">{skill}</span>
                            )) : <span className="text-xs text-[#9CA3AF]">No skills found</span>}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Experience</p>
                          <div className="space-y-1.5">
                            {ensureArray(getResumeDetails(item)?.Experience).length > 0 ? ensureArray(getResumeDetails(item)?.Experience).map((exp, expIndex) => (
                              <p key={expIndex} className="text-xs text-[#1F2937]">{typeof exp === 'string' ? exp : (exp?.position || exp?.Title || 'Experience')}</p>
                            )) : <span className="text-xs text-[#9CA3AF]">No experience found</span>}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Projects</p>
                          <div className="space-y-1.5">
                            {ensureArray(getResumeDetails(item)?.Projects).length > 0 ? ensureArray(getResumeDetails(item)?.Projects).map((project, projectIndex) => (
                              <p key={projectIndex} className="text-xs text-[#1F2937]">{typeof project === 'string' ? project : (project?.name || project?.Title || 'Project')}</p>
                            )) : <span className="text-xs text-[#9CA3AF]">No projects found</span>}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">Possible Roles</p>
                          <div className="flex flex-wrap gap-1.5">
                            {ensureArray(getResumeDetails(item)?.PossibleRoles).length > 0 ? ensureArray(getResumeDetails(item)?.PossibleRoles).map((role, roleIndex) => (
                              <span key={roleIndex} className="px-2 py-1 bg-[#EEF2FF] text-[#4F46E5] rounded text-xs font-medium">{role}</span>
                            )) : <span className="text-xs text-[#9CA3AF]">No roles found</span>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <svg className="w-10 h-10 mx-auto text-[#9CA3AF] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m0-6h-6" />
                </svg>
                <p className="text-xs text-[#6B7280]">No resumes uploaded yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResumeManager;