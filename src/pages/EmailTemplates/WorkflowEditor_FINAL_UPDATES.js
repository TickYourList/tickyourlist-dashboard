// FINAL UPDATES NEEDED FOR WorkflowEditor.js
// Replace these patterns throughout the file:

// 1. Replace all instances of:
//    segments.map -> segments?.map
//    templates.map -> templates?.map  
//    buckets.map -> buckets?.map
//    enrollments.map -> enrollments?.map

// 2. Replace:
//    previewLoading -> audiencePreviewLoading
//    saving -> actionLoading
//    runningWorkflow -> actionLoading

// 3. Update the Enrollments tab click handler:
//    onClick={() => {
//      setActiveTab("4");
//      fetchEnrollments();
//    }}
//    TO:
//    onClick={() => {
//      setActiveTab("4");
//      if (id) dispatch(getWorkflowEnrollments(id));
//    }}

// 4. Update previewAudience button:
//    disabled={previewLoading}
//    TO:
//    disabled={audiencePreviewLoading}

// 5. Update all references to:
//    audiencePreview -> use from Redux (already defined)
//    templates -> use from Redux (already defined)
//    segments -> use from Redux (already defined)
//    buckets -> use from Redux (already defined)
//    enrollments -> use from Redux (already defined)

// 6. Update Save button:
//    disabled={saving}
//    {saving ? <Spinner...> : ...}
//    TO:
//    disabled={actionLoading}
//    {actionLoading ? <Spinner...> : ...}

// 7. Add useEffect to refresh enrollments when actionResult changes:
//    useEffect(() => {
//      if (actionResult && id && (actionResult.message?.includes("processed") || actionResult.message?.includes("enrolled"))) {
//        dispatch(getWorkflowEnrollments(id));
//        dispatch(getWorkflowById(id));
//      }
//    }, [actionResult, id, dispatch]);

