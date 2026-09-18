  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    // show the UI immediately
    setPageReady(true);

    // 1. Add greeting bubble immediately
    setTranscript([{ role: "ai", text: GREETING }]);
    setStatusMsg("AI is speaking…");

    // 2. Wait for voices, THEN speak (critical!)
    (async () => {
      await waitForVoices(); // <-- wait for voices to load
      await new Promise((r) => setTimeout(r, 200)); // small buffer
      
      speak(GREETING, () => {
        setPhase("interview");
        setStatusMsg("Your turn — speak or type below");
        if (micEnabledRef.current) startListening();
      });
    })();

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []); // ← run once