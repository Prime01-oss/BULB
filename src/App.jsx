import React, { useState, useEffect, useRef } from 'react';
// Only keep necessary components
import { DrawingSpace } from './components/DrawingSpace';
import { WindowControls } from './components/WindowControl';
import { Plus, FolderOpen, Loader, Trash, Lightbulb, X } from 'lucide-react'; 


// --- Inlined Modal Component for Project Naming ---
const ProjectNameModal = ({ isOpen, onClose, onSubmit }) => {
    const [name, setName] = useState('New Project Space');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (trimmedName) {
            onSubmit(trimmedName);
            onClose();
            setName('New Project Space');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-zinc-800 p-6 rounded-xl shadow-2xl w-full max-w-sm border border-zinc-700">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-cyan-400"/> Create New Space
                    </h3>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
                        <X className="w-5 h-5"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="projectName" className="block text-sm font-medium text-zinc-300 mb-2">Project Name</label>
                    <input
                        id="projectName"
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="Enter project name..."
                    />
                    <div className="flex justify-end space-x-3 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold rounded-lg text-zinc-300 bg-zinc-700 hover:bg-zinc-600 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-semibold rounded-lg text-white bg-cyan-600 hover:bg-cyan-700 transition disabled:opacity-50"
                            disabled={!name.trim()}
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Inlined LandingScreen Component ---
const LandingScreen = ({ projects, onNewProject, onOpenProject, onDeleteProject, loading }) => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-12 bg-gray-950 text-white" 
         style={{ backgroundImage: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nMTAwJSc+PGRlZnM+PHBhdHRlcm4gaWQ9J2N1c3RvbScgd2lkdGg9JzIwJyBoZWlnaHQ9JzIwJyBwYXR0ZXJuVW5pdHM9J3VzZXJTcGFjZU9uVXRzZSc+PGNpcmNsZSBmaWxsPSdub25lJyBzdHJva2U9JyNmMGYwZjB4JyBzdHJva2Utd2lkdGg9JzAuNScgcj0nMScvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNjdXN0b20pJy8+PC9yZWN0Pjwvc3ZnPg==)', 
                 backgroundSize: '20px 20px' }}>
      
      <div className="w-full max-w-5xl space-y-10 p-12 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-700/50 transform hover:shadow-cyan-500/10 transition duration-500">
        
        <div className="flex flex-col items-center space-y-4">
          
          <h2 className="text-6xl font-extrabold text-white tracking-tight flex items-center space-x-4">
            <Lightbulb className="w-10 h-10 text-yellow-400 drop-shadow-lg" fill="currentColor" />
            <span>Bulb</span>
          </h2>
          
          <p className="text-zinc-400 text-xl font-light">Infinite Project Spaces for Insight and Creation.</p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={onNewProject}
            className="flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 text-white text-lg font-bold rounded-lg shadow-xl transition duration-300 transform hover:scale-[1.01] focus:ring-4 focus:ring-cyan-500/50"
          >
            <Plus className="w-5 h-5" />
            <span>New Project Space</span>
          </button>
        </div>

        <div className="space-y-6 pt-8">
          <h3 className="text-xl font-semibold border-b border-zinc-800 pb-3 text-zinc-300 flex items-center">
            <FolderOpen className="w-5 h-5 mr-3 text-cyan-400" />
            Saved Spaces ({projects.length})
          </h3>

          {loading ? (
            <div className="text-center py-10 text-zinc-500 flex items-center justify-center">
                <Loader className="w-5 h-5 animate-spin mr-2" /> Loading projects...
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.length === 0 ? (
                <li className="col-span-full text-center py-16 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg">
                  No saved project spaces found. Get started above!
                </li>
              ) : (
                projects.map(project => (
                  <li
                    key={project.id}
                    className="relative p-4 bg-zinc-800 rounded-lg transition duration-200 cursor-pointer group shadow-lg border border-zinc-700/50 hover:border-cyan-500/80 transform hover:scale-[1.01]"
                    onClick={() => onOpenProject(project)}
                  >
                    <div className="w-full h-24 bg-zinc-700 rounded-md mb-3 flex items-center justify-center overflow-hidden border border-zinc-600">
                        <Lightbulb className="w-8 h-8 text-zinc-500" /> 
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-lg text-white truncate group-hover:text-cyan-400 transition">{project.title}</span>
                      <span className="text-xs text-zinc-400 mt-1">
                        {project.updatedAt ? `Last Saved: ${new Date(project.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}` : 'New Space'}
                      </span>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }}
                        className="absolute top-2 right-2 p-1.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition duration-150 rounded-full hover:bg-zinc-700"
                        title="Delete Project Space"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};


function App() {
  const canvasCache = useRef({});
  const hasLoadedContent = useRef(false);
  const prevSelectedProject = useRef(null); 

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [currentProjectContent, setCurrentProjectContent] = useState('');
  const [saveStatus, setSaveStatus] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [theme] = useState('dark'); 

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);


  const findProjectById = (projects, id) => projects.find(p => p.id === id) || null;


  // Function to fetch the list of project spaces
  const loadProjectList = async () => {
    setLoadingProjects(true);
    try {
      const newProjects = await window.electronAPI.getProjectList(); 
      setProjects(newProjects || []);

      if (selectedProject) {
        // Use the stable flat finder
        const reSelectedProject = findProjectById(newProjects, selectedProject.id); 
        setSelectedProject(reSelectedProject || null);
      }
    } catch (err) {
      console.error('Failed to load project list:', err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };


  useEffect(() => {
    loadProjectList();
  }, []);

  // 🧩 Load content (Project/Canvas)
  useEffect(() => {
    if (!selectedProject) {
      setCurrentProjectContent('');
      hasLoadedContent.current = false;
      return;
    }

    const loadContent = async () => {
      try {
        hasLoadedContent.current = false;
        
        // --- FIX: Ensure path is valid before calling IPC ---
        if (!selectedProject.path) {
            console.error("Attempted to load content for project with missing path.", selectedProject);
            // Crucial: return early to prevent calling IPC with invalid data
            return;
        }

        const projectData = await window.electronAPI.getNoteContent(selectedProject.path); 
        if (!projectData) {
          setCurrentProjectContent('');
          hasLoadedContent.current = true;
          return;
        }

        setSelectedProject(prev => ({
          ...prev,
          title: projectData.title || prev?.title,
          updatedAt: projectData.updatedAt || prev?.updatedAt,
        }));
        
        setCurrentProjectContent(projectData.content || '');
        hasLoadedContent.current = true;
      } catch (err) {
        console.error(`Error loading content for ${selectedProject?.path}:`, err);
        setCurrentProjectContent('');
        hasLoadedContent.current = true;
      }
    };

    loadContent();
  }, [selectedProject]);

  // 🎨 Theme sync 
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.remove('font-sans', 'font-serif', 'font-monospace'); 
  }, [theme]);

  // 💾 Save logic
  const saveProject = async (contentToSave, projectToSave) => {
    const project = projectToSave || selectedProject;
    
    // --- FIX: Ensure project and path are valid before saving ---
    if (!project || !project.path) {
      console.warn("Save cancelled: Project object or path is missing."); 
      return;
    }

    const finalContent = JSON.stringify(contentToSave ?? currentProjectContent);
    const shouldSave = hasLoadedContent.current || contentToSave !== undefined;

    if (shouldSave) {
      try {
        const result = await window.electronAPI.saveNoteContent({ 
          id: project.id,
          path: project.path,
          content: finalContent,
        });

        if (result?.success) {
          setSaveStatus({ type: 'success', message: `💾 Auto-saved "${project.title}"` });
          setSelectedProject(prev => ({ ...prev, updatedAt: result.updatedAt }));
        } else {
          setSaveStatus({ type: 'error', message: `⚠️ Save failed: ${result?.error || 'Unknown error'}` });
        }
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus({ type: 'error', message: '⚠️ Save failed unexpectedly' });
      } finally {
        setTimeout(() => setSaveStatus(null), 2500);
      }
    }
  };

  // 🧩 NEW: Shared function to save and return home (Used by Escape key and toolbar button)
  const handleGoHome = async () => {
    if (prevSelectedProject.current && hasLoadedContent.current) {
        // Ensure a save happens before leaving
        await saveProject(undefined, prevSelectedProject.current);
    }
    setSelectedProject(null); // Return to the landing page
  };

  // 🧩 Auto-save before switching or closing
  const handleProjectSelect = async (item) => {
    if (prevSelectedProject.current && hasLoadedContent.current) {
      await saveProject(undefined, prevSelectedProject.current);
    }
    prevSelectedProject.current = item;
    setSelectedProject(item);
  };
  
  // --- NEW: Escape Key Listener ---
  useEffect(() => {
    const handleKeyDown = (event) => {
        // Only trigger if a project is selected (i.e., we are in the canvas view) and the modal is closed
        if (event.key === 'Escape' && selectedProject && !isNewProjectModalOpen) {
            handleGoHome();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, isNewProjectModalOpen, handleGoHome]);


  // --- Creation/Deletion handlers ---
  const createNewProject = async (projectName) => {
    if (!projectName?.trim()) return;
    
    try {
      const result = await window.electronAPI.createCanvas('.', projectName.trim()); 
      if (result?.success && result.newItem) {
        await loadProjectList();
        setSelectedProject(result.newItem);
      }
    } catch (err) {
      console.error('createNewProject failed:', err);
      alert('Failed to create new project space.');
    }
  };

  const deleteProject = async (projectToDelete) => {
    if (!projectToDelete) return;
    const confirmDelete = window.confirm(`Delete project "${projectToDelete.title}" permanently?`);
    if (!confirmDelete) return;
    
    await window.electronAPI.deleteNote(projectToDelete.path, 'canvas'); 
    if (selectedProject?.id === projectToDelete.id) setSelectedProject(null);
    loadProjectList();
  };

  // --- UI ---
  return (
    <div className="flex flex-col h-screen relative bg-zinc-950 text-white">
      {/* Titlebar/Header - Floating, high-contrast look */}
      <header className="titlebar flex justify-between items-center p-3 pl-5 bg-zinc-900/90 border-b border-zinc-800/80 backdrop-blur-lg shadow-2xl z-20 sticky top-0">
        {selectedProject ? (
          // Header when a project is open (Only shows project title)
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white tracking-wide truncate">{selectedProject.title}</h1>
          </div>
        ) : (
          // Header when on the landing page (Bulb Branding)
          <h1 className="text-xl font-extrabold text-white tracking-wider flex items-center space-x-2">
             <Lightbulb className="w-6 h-6 text-yellow-400" fill="currentColor" />
             <span>Bulb</span>
          </h1>
        )}
        <WindowControls />
      </header>

      {/* FIX: ADDED relative z-10 to the main container */}
      <main className="flex flex-1 overflow-hidden relative z-10">
        
        {selectedProject ? (
          // Full-screen Drawing Space for the selected project
          <DrawingSpace
            key={selectedProject.id}
            content={currentProjectContent}
            onChange={(snapshot) => {
              setCurrentProjectContent(snapshot);
              // Crucial: ensures the canvas cache is updated only when we have a stable project ID
              if (selectedProject.id) { 
                 canvasCache.current[selectedProject.id] = snapshot;
              }
              saveProject(snapshot);
            }}
            onSave={saveProject}
            onDelete={() => deleteProject(selectedProject)}
            onGoHome={handleGoHome} // PASS THE NEW PROP FOR THE TOOLBAR BUTTON
            theme={theme}
          />
        ) : (
          // Landing Screen when no project is selected
          <LandingScreen 
            projects={projects}
            loading={loadingProjects}
            onNewProject={() => setIsNewProjectModalOpen(true)} // Opens the new modal
            onOpenProject={handleProjectSelect}
            onDeleteProject={deleteProject}
          />
        )}
      </main>

      {/* RENDER THE CUSTOM MODAL */}
      <ProjectNameModal 
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onSubmit={createNewProject}
      />

      {/* Save Status Notification (Professional look) */}
      {saveStatus && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-lg shadow-xl text-sm font-semibold backdrop-blur-md transition-all duration-300 z-50 border border-white/20
          ${saveStatus.type === 'success' ? 'bg-green-700/80 text-white' : 'bg-red-700/80 text-white'}`}
        >
          {saveStatus.message}
        </div>
      )}
    </div>
  );
}

export default App;