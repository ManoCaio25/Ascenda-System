const en = {
  common: {
    appName: "Ascenda",
    managerPortal: "Manager Portal",
    navigation: "Navigation",
    manager: "Manager",
    actions: {
      logout: "Logout",
      cancel: "Cancel",
      save: "Save",
      approve: "Approve",
      reject: "Reject",
      preview: "Preview",
      edit: "Edit",
      assign: "Assign",
      assignTo: "Assign to",
      markAllRead: "Mark all read",
      export: "Export Report",
      exportCsv: "Export CSV",
      upload: "Add Course",
      uploading: "Uploading...",
      saveChanges: "Save Changes",
      saving: "Saving...",
      today: "Today",
      startCourse: "Start Course",
      markCompleted: "Mark as Completed",
      assignCourse: "Assign Course",
      close: "Close",
      chat: "Chat",
      view: "View",
      open: "Open",
      saveEmoji: "Save Emoji"
    },
    status: {
      active: "Active",
      paused: "Paused",
      completed: "Completed",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      assigned: "Assigned",
      inProgress: "In Progress",
      overdue: "Overdue"
    },
    filters: {
      level: "Level",
      status: "Status",
      allLevels: "All Levels",
      allStatus: "All Status",
      allRequests: "All Requests",
      filter: "Filter"
    },
    languages: {
      en: "English",
      pt: "Português"
    },
    placeholders: {
      searchInterns: "Search interns...",
      courseTitleExample: "e.g., Advanced React Patterns",
      courseDescription: "What will interns learn?",
      youtubeUrl: "https://www.youtube.com/watch?v=...",
      uploadPrompt: "Click to upload PDF, video, image, or Office file",
      rejectionReason: "Explain the reason for rejection...",
      notes: "Add any special instructions or context...",
      emojiInput: "Try 😀 or paste an image URL"
    },
    labels: {
      language: "Language",
      descriptionOptional: "Description",
      preview: "Preview",
      durationHours: "Duration (hours)",
      youtubeOptional: "YouTube Link (Optional)",
      materialsOptional: "Course Materials (Optional)",
      dueDateOptional: "Due Date (Optional)",
      notesOptional: "Notes (Optional)",
      managerNoteOptional: "Manager Note (Optional)",
      previewTitle: "Preview"
    },
    time: {
      daysLeft: "{{count}} days left",
      requestedOn: "Requested {{date}}",
      monthYear: "MMMM yyyy",
      dayMonth: "MMM d",
      dayMonthYear: "MMM d, yyyy",
      monthDayTime: "MMM d, h:mm a"
    },
    counts: {
      interns: "{{count}} interns",
      requests: "{{count}} request{{suffix}}",
      conflicts: "{{count}} Scheduling Conflict{{suffix}} Detected",
      selectedInterns: "{{count}} intern{{suffix}} selected",
      assignments: "Active Course Assignments ({{count}})"
    },
    misc: {
      unknown: "Unknown",
      learningTrack: "Learning Track",
      progress: "Progress",
      avg: "avg",
      file: "File",
      preview: "Preview",
      courseLibraryCount: "{{count}} courses",
      internsCount: "{{count}} interns",
      emojiHelp: "Emojis render beautifully across the app and you can swap them anytime. Image URLs are also supported.",
      updateProfileEmoji: "Update profile emoji for {{name}}",
      emojiPreviewAlt: "Intern avatar preview"
    }
  },
  layout: {
    sidebarTagline: "Manager Portal",
    nav: {
      dashboard: "Dashboard",
      interns: "Team Overview",
      activityGenerator: "Activity Generator",
      content: "Content Management",
      ascendaIA: {
        title: "AscendaIA",
        subtitle: "Quiz Generator",
      },
      vacation: "Vacation Requests",
      reports: "Reports"
    },
    languageToggle: {
      label: "Language",
      english: "English",
      portuguese: "Português"
    }
  },
  contentManagement: {
    title: "Content Management",
    subtitle: "Create and manage training materials for your team",
    library: {
      title: "Course Library",
      filterLabel: "Filter courses",
      filters: {
        all: "All courses",
        generated: "AI generated",
        manual: "Manual uploads",
        video: "Video resources",
        document: "Document resources",
      },
      empty: "No courses yet. Create your first one!",
      emptyFiltered: "No courses match your filters. Try a different combination.",
    },
    courseCard: {
      youtubeBadge: "YouTube",
      activeAssignments: "{{count}} active",
    },
  },
  dashboard: {
    welcome: "Welcome back, {{name}}!",
    subtitle: "Here's what's happening with your team today",
    summary: {
      totalInterns: "Total Interns",
      courses: "Courses Available",
      reviews: "Pending Reviews",
      points: "Team Points",
      trend: "+2 this month",
      pointsTrend: "+15%"
    },
    sectionTitle: "Intern Status & Well-being",
    status: {
      heading: "Intern Status & Well-being",
      count: "{{count}} intern{{suffix}}",
      progressLabel: "Internship Progress",
      daysLeft: "{{count}} days left",
      systemStatus: "System Status",
      active: "Active",
      paused: "Paused",
    },
    performanceChart: {
      noData: "No performance data available",
      legendLabel: "Performance Score",
      tooltipLabel: "{{label}}",
      tooltipValue: "{{value}}%",
      percentValue: "{{value}}%",
    },
    notifications: {
      pausedTitle: "Intern Paused",
      resumedTitle: "Intern Resumed",
      pausedBody: "Learning system paused for {{name}}",
      resumedBody: "Learning system resumed for {{name}}",
    }
  },
  internsPage: {
    title: "Team Overview",
    subtitle: "Manage and track your team's progress",
    noResults: "No interns found matching your filters",
    levels: {
      novice: "Novice",
      apprentice: "Apprentice",
      journeyman: "Journeyman",
      expert: "Expert",
      master: "Master"
    }
  },
  interns: {
    tracks: {
      javascriptReact: "JavaScript + React",
      sapPmo: "SAP + PMO",
      sap: "SAP",
      sapHr: "SAP HR",
      sapHrPmo: "SAP HR + PMO",
      sapHrGoogle: "SAP HR + Google",
      powerBi: "Power BI",
      aiPython: "AI + Python",
      google: "Google",
      googleWorkspace: "Google Workspace",
      webDevelopment: "Web Development",
    }
  },
  activityGenerator: {
    title: "Activity Generator",
    subtitle: "Transform uploaded resources into ready-to-assign quizzes for your interns",
    form: {
      title: "Configure generation",
      description: "Choose the learning resource, quiz volume, and intern who will receive the activities.",
      resourceTitle: "Resource title",
      resourceTitlePlaceholder: "Ex: Growth Mindset Workshop",
      videoUrl: "Video link",
      videoUrlPlaceholder: "https://www.youtube.com/watch?v=...",
      uploadLabel: "Upload document or video",
      descriptionLabel: "Additional context",
      descriptionPlaceholder: "Share the focus areas or instructions for the generated activities...",
      activityCount: "Activities to generate",
      quizCount: "Questions per activity",
      internLabel: "Assign to intern",
      internPlaceholder: "Select an intern",
      notesLabel: "Assignment notes",
      notesPlaceholder: "Add delivery instructions, due dates, or learning focus...",
    },
    upload: {
      hintTitle: "Attach your source material",
      hintDescription: "Accepted: video, PDF, Office files. Max 25 MB recommended.",
      selectButton: "Choose file",
      removeButton: "Remove",
      noResource: "No resource selected",
    },
    actions: {
      generate: "Generate activities",
      generating: "Generating...",
    },
    feedback: {
      missingTitle: "Add a name for the learning resource before generating activities.",
      missingResource: "Upload a file or paste a video link so we can build the activities.",
      missingIntern: "Select which intern should receive the generated activities.",
      missingCounts: "Specify at least one activity and one quiz question to generate.",
      success: "Generated {{count}} activities for {{name}} and saved them to the course library.",
      genericError: "We couldn't complete the generation. Please review the inputs and try again.",
    },
    generated: {
      activityName: "Activity {{index}}",
      description: "Automatically generated from {{resource}} with {{quizzes}} quiz questions.",
    },
    summary: {
      title: "How it works",
      description: "Every generation creates structured quizzes, assigns them, and stores the materials in the library.",
      steps: {
        upload: {
          title: "Upload a resource",
          description: "Share a video or document to inspire the new activities.",
        },
        generate: {
          title: "Generate quizzes",
          description: "Ascenda crafts question sets aligned to the uploaded content.",
        },
        assign: {
          title: "Assign instantly",
          description: "Your selected intern receives the activities automatically.",
        },
        library: {
          title: "Save to library",
          description: "New activities appear in the Content Management course library for reuse.",
        },
      },
      currentResource: "Current selection",
    },
    recent: {
      title: "Recent generated activities",
      empty: "Generated activities will appear here once you run the generator.",
      assigned: "Assigned to {{name}}",
      quizCount: "{{count}} quiz questions",
      generatedAt: "Generated on {{date}}",
    },
  },
  internStatus: {
    tooltip: "Well-being: {{status}}",
    trackFallback: "Learning Track",
    internshipProgress: "Internship Progress",
    daysLeft: "{{count}} days left",
    systemStatus: "System Status",
    labels: {
      excellent: "Excellent",
      good: "Good",
      neutral: "Neutral",
      stressed: "Stressed",
      overwhelmed: "Overwhelmed"
    }
  },
  internCard: {
    points: "Points:",
    average: "{{value}}% avg",
    daysLeftShort: "{{count}}d left",
    chat: "Chat"
  },
  internDetails: {
    totalPoints: "Total Points",
    tasksDone: "Tasks Done",
    startDate: "Start Date",
    endDate: "End Date",
    daysLeft: "{{count}} days left",
    tabs: {
      performance: "Performance",
      courses: "Active Courses"
    },
    skills: "Skills",
    noPerformance: "No performance data available yet"
  },
  performance: {
    title: "Performance Insights",
    currentScore: "Current Score",
    average: "3-Mo Avg",
    completed: "Completed",
    studyHours: "Study Hours",
    target: "Target 85%",
    completionSeries: "Completion %",
    scoreSeries: "Score %",
    pointsSeries: "Points",
    tooltip: {
      score: "Score:",
      completion: "Completion:",
      points: "Points:",
      hours: "Hours:"
    },
    export: "Export CSV"
  },
  assignments: {
    title: "Active Course Assignments",
    none: "No active course assignments",
    assigned: "Assigned",
    inProgress: "In Progress",
    progress: "Progress",
    assignedOn: "Assigned {{date}}",
    dueOn: "Due {{date}}",
    startCourse: "Start Course",
    markCompleted: "Mark as Completed"
  },
  content: {
    title: "Content Management",
    subtitle: "Create and manage training materials for your team",
    heroBadge: "Learning hub",
    libraryTitle: "Course Library",
    courseCount: "{{count}} course{{suffix}}",
    noCourses: "No courses yet. Create your first one!",
    empty: "No courses yet. Create your first one!",
    addCourse: "Add New Course",
    filters: {
      trainingType: "Training type",
      trainingTypes: {
        all: "All training types",
      },
    },
    filteredCount: "{{count}} course{{suffix}} match this filter"
  },
  courseForm: {
    titleLabel: "Course Title *",
    descriptionLabel: "Description *",
    categoryLabel: "Category",
    difficultyLabel: "Difficulty",
    durationLabel: "Duration (hours)",
    youtubeLabel: "YouTube Link (Optional)",
    materialsLabel: "Course Materials (Optional)",
    previewButton: "Preview Document",
    trainingTypeLabel: "Training type",
    categories: {
      technical: "Technical",
      leadership: "Leadership",
      communication: "Communication",
      design: "Design",
      business: "Business"
    },
    difficulties: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    },
    trainingTypes: {
      sap: "SAP",
      sapHr: "SAP HR",
      sapHrPmo: "SAP HR PMO",
      webDevelopment: "Web Development",
      google: "Google",
    },
    ascendaIA: {
      title: "AscendaIA quiz generator",
      description: "Create AI-powered questions on the dedicated AscendaIA page.",
      action: "Open AscendaIA",
    }
  },
  courseCard: {
    label: "Featured course",
    youtube: "YouTube",
    active: "{{count}} active learner{{suffix}}",
    edit: "Edit",
    assign: "Assign",
    preview: "Preview"
  },
  courseEdit: {
    title: "Edit Course",
    cancel: "Cancel",
    save: "Save Changes"
  },
  assignModal: {
    title: "Assign \"{{course}}\" to Interns",
    selectInterns: "Select Interns *",
    noneAvailable: "No active interns available",
    selectedCount: "{{count}} intern{{suffix}} selected",
    dueDate: "Due Date (Optional)",
    notes: "Notes (Optional)",
    assigning: "Assigning...",
    assignTo: "Assign to {{count}} intern{{suffix}}",
    notificationTitle: "New Course Assigned",
    notificationBody: "\"{{course}}\" has been assigned to {{name}}",
  },
  reports: {
    title: "Reports & Analytics",
    subtitle: "Insights into your team's performance and progress",
    export: "Export Report",
    teamPerformance: "Team Performance (Top 10)",
    teamPerformancePoints: {
      singular: "point",
      plural: "points",
    },
    taskDistribution: "Task Distribution",
    keyMetrics: "Key Metrics Summary",
    totalInterns: "Total Interns",
    activeTasks: "Active Tasks",
    availableCourses: "Available Courses",
    avgPoints: "Avg. Points",
    noTaskData: "No task data available",
    taskCompletion: {
      label: "{{status}}: {{percent}}",
      taskSingular: "task",
      taskPlural: "tasks",
    }
  },
  vacation: {
    title: "Vacation Requests",
    subtitle: "Review and manage intern vacation requests",
    panelTitle: "Vacation Requests",
    tabs: {
      list: "Requests List",
      calendar: "Calendar View"
    },
    filterPlaceholder: "Filter",
    none: "No vacation requests found",
    approve: "Approve",
    reject: "Reject",
    rejectTitle: "Reject Vacation Request",
    rejectDescription: "Are you sure you want to reject this vacation request? You can optionally add a note.",
    rejectConfirm: "Reject Request",
    managerNoteOptional: "Manager Note (Optional)",
    labels: {
      from: "From:",
      to: "To:",
      reason: "Reason:",
      managerNote: "Manager note:",
      requested: "Requested {{date}}"
    },
    aria: {
      request: "Vacation request from {{name}}",
      approve: "Approve vacation request for {{name}}",
      reject: "Reject vacation request for {{name}}"
    },
    emoji: {
      title: "Update Profile Emoji",
      description: "Choose an emoji or paste an image URL for {{name}}.",
      preview: "Preview",
      cancel: "Cancel"
    },
    conflictLegend: {
      approved: "Approved",
      pending: "Pending",
      conflict: "Conflict"
    },
    calendar: {
      months: {
        conflict: "{{count}} Scheduling Conflict{{suffix}} Detected"
      },
      approved: "Approved",
      pending: "Pending",
      conflict: "Conflict",
      buttonToday: "Today",
      previousMonth: "Previous month",
      nextMonth: "Next month",
      more: "...and {{count}} more",
      conflictDetail: "{{name}} has task \"{{task}}\" due on {{date}} during vacation"
    }
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all read",
    today: "Today",
    thisWeek: "This Week",
    earlier: "Earlier",
    none: "No notifications yet",
    by: "By {{name}}"
  },
  youtube: {
    invalid: "Invalid YouTube URL. Please check the link.",
    detected: "YouTube Video Detected",
    thumbnailAlt: "Video thumbnail",
    playOverlay: "Preview of YouTube video"
  },
  chat: {
    title: "Chat conversation",
    empty: "No messages yet. Start the conversation!",
    placeholder: "Type a message... (Enter to send, Shift+Enter for new line)"
  }
};

export default en;
