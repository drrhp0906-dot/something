// Parses voice transcript into actionable dashboard commands
export const parseCommand = (transcript, widgets, setWidgets) => {
  // ADD WIDGET
  if (transcript.includes("add") && (transcript.includes("chart") || transcript.includes("graph"))) {
    const newId = `chart-${Date.now()}`;
    setWidgets([...widgets, { id: newId, title: "Data Chart", type: "chart" }]);
    return "Added Chart";
  }
  if (transcript.includes("add") && transcript.includes("stat")) {
    const newId = `stat-${Date.now()}`;
    setWidgets([...widgets, { id: newId, title: "Statistics", type: "stat" }]);
    return "Added Statistics";
  }

  // REMOVE WIDGET
  if (transcript.includes("remove") || transcript.includes("delete")) {
    if (transcript.includes("last")) {
      if (widgets.length > 0) {
        setWidgets(widgets.slice(0, -1));
        return "Removed last widget";
      }
    }
    const targetWidget = widgets.find(w => transcript.includes(w.title.toLowerCase()));
    if (targetWidget) {
      setWidgets(widgets.filter(w => w.id !== targetWidget.id));
      return `Removed ${targetWidget.title}`;
    }
  }

  // ORGANIZE / RESET
  if (transcript.includes("organize") || transcript.includes("reset layout")) {
    // Logic to reset layout is handled in Dashboard component usually, 
    // but we can trigger a window resize event to force react-grid-layout to compact
    window.dispatchEvent(new Event('resize'));
    return "Organizing dashboard";
  }

  return "Command not recognized";
};