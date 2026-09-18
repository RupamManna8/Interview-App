const questionBank = {
    behavioral: {
      frontend: [
        {
          id: 1,
          text: "Tell me about a time you had to collaborate with designers to implement a complex UI feature. How did you handle feedback and iterations?",
          type: "Behavioral",
          suggestedTime: 180,
        },
        {
          id: 2,
          text: "Describe a situation where you had to optimize a slow-performing application. What steps did you take?",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
      backend: [
        {
          id: 1,
          text: "Tell me about a time you had to scale a database to handle increased load. What strategies did you implement?",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
      fullstack: [
        {
          id: 1,
          text: "Tell me about a full-stack project you built from scratch. How did you approach the architecture?",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
      devops: [
        {
          id: 1,
          text: "Describe a time you implemented CI/CD pipelines. What challenges did you face?",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
      "data-science": [
        {
          id: 1,
          text: "Tell me about a time you had to explain complex data findings to non-technical stakeholders.",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
      mobile: [
        {
          id: 1,
          text: "Describe a challenging mobile app feature you implemented. How did you ensure good performance?",
          type: "Behavioral",
          suggestedTime: 180,
        },
      ],
    },
    technical: {
      frontend: [
        {
          id: 1,
          text: "Explain the difference between controlled and uncontrolled components in React. When would you use each?",
          type: "Technical",
          suggestedTime: 240,
        },
        {
          id: 2,
          text: "How does the virtual DOM work and what are its advantages?",
          type: "Technical",
          suggestedTime: 180,
        },
      ],
      backend: [
        {
          id: 1,
          text: "Explain the difference between SQL and NoSQL databases. When would you choose each?",
          type: "Technical",
          suggestedTime: 240,
        },
      ],
    },
    coding: {
      frontend: [
        {
          id: 1,
          text: "Implement a custom React hook for fetching data with loading and error states.",
          type: "Coding",
          suggestedTime: 300,
          language: "javascript",
          initialCode:
            "function useFetch(url) {\n  // Implement your custom hook here\n  \n  return { data, loading, error };\n}",
        },
        {
          id: 2,
          text: "Create a debounce function that limits how often a function can be called.",
          type: "Coding",
          suggestedTime: 240,
          language: "javascript",
          initialCode:
            "function debounce(func, wait) {\n  // Write your code here\n}",
        },
      ],
      backend: [
        {
          id: 1,
          text: "Implement a rate limiter middleware for an Express.js application.",
          type: "Coding",
          suggestedTime: 300,
          language: "javascript",
          initialCode:
            "function rateLimiter(maxRequests, timeWindow) {\n  // Implement rate limiter\n}",
        },
      ],
    },

  };

export default questionBank;  