import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, set, get, onValue, remove } from 'firebase/database';

interface Project {
  name: string;
  description: string;
  tags: string[];
}

interface Builder {
  name: string;
  avatar: string; // initials
  project: string;
  tags: string[];
}

const defaultProfile = {
  name: '',
  bio: '',
  avatar: '',
};

// Mock data for other builders
const mockBuilders: Builder[] = [
  { name: 'Ava Kim', avatar: 'AK', project: 'AI Study Buddy', tags: ['ai', 'education', 'react'] },
  { name: 'Samir Joshi', avatar: 'SJ', project: 'Remote Collab', tags: ['collaboration', 'web', 'react'] },
  { name: 'Lina M.', avatar: 'LM', project: 'Health Tracker', tags: ['health', 'mobile', 'react native'] },
  { name: 'Priya Rao', avatar: 'PR', project: 'Open Source Hub', tags: ['opensource', 'community', 'nextjs'] },
  { name: 'Yash T.', avatar: 'YT', project: 'Crypto Alerts', tags: ['crypto', 'notifications', 'nodejs'] },
  { name: 'Maya G.', avatar: 'MG', project: 'Design System', tags: ['design', 'ui', 'figma'] },
];

// --- New: BuilderConsoleOnboarding ---
const prompts = [
  { key: 'name', label: "> What's your name, builder?" },
  { key: 'project', label: "> What are you building?" },
  { key: 'bio', label: "> Drop a one-line bio or tagline:" },
];

const BuilderConsoleOnboarding = ({ onComplete }: { onComplete: (profile: any) => void }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ name: '', project: '', bio: '' });
  const [input, setInput] = useState('');
  const [show, setShow] = useState(true);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [step]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      const key = prompts[step].key;
      const nextAnswers = { ...answers, [key]: input.trim() };
      setAnswers(nextAnswers);
      setInput('');
      if (step < prompts.length - 1) {
        setStep(step + 1);
      } else {
        setShow(false);
        setTimeout(() => onComplete(nextAnswers), 400);
      }
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
      {/* Back to Home Button */}
      <button
        className="absolute top-8 left-8 bg-black/80 border border-green-400 text-green-300 font-semibold rounded-lg px-4 py-2 shadow hover:bg-green-400 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 z-50"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
      <div className="w-full max-w-xl bg-[#18181b] rounded-2xl shadow-2xl border border-gray-800 p-12 flex flex-col gap-8 font-mono text-green-400 text-xl animate-fade-in-up">
        <div className="mb-2 text-white text-2xl font-bold tracking-wide">Milap Console</div>
        {prompts.slice(0, step).map((p, i) => (
          <div key={p.key} className="text-green-300">
            {p.label} <span className="text-white">{answers[p.key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span>{prompts[step].label}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-b border-green-400 focus:border-white text-white py-1 px-2 outline-none transition-colors duration-200 placeholder-green-300 w-48"
            autoComplete="off"
            spellCheck={false}
            maxLength={step === 2 ? 80 : 32}
          />
          <span className="animate-pulse text-green-400">█</span>
        </div>
      </div>
    </div>
  );
};

const getOrCreateUserId = () => {
  let userId = localStorage.getItem('milap_user_id');
  if (!userId) {
    userId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('milap_user_id', userId);
  }
  return userId;
};

const ProfileProjects: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(defaultProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', tagInput: '', tags: [] as string[] });
  const [tagHover, setTagHover] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [network, setNetwork] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const userId = getOrCreateUserId();
  const [profileError, setProfileError] = useState('');
  const [projectError, setProjectError] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTarget, setChatTarget] = useState<any>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load user data from Firebase on mount
  React.useEffect(() => {
    const userRef = ref(db, `users/${userId}`);
    get(userRef).then(snapshot => {
      const val = snapshot.val();
      if (val && val.profile && val.projects) {
        setProfile(val.profile);
        setProjects(val.projects);
        setOnboarded(true);
      }
    });
    // Listen for incoming connection requests
    const reqRef = ref(db, `connections/${userId}`);
    onValue(reqRef, (snapshot) => {
      const val = snapshot.val() || {};
      setRequests(Object.values(val));
    });
    // Listen for accepted connections
    const netRef = ref(db, `acceptedConnections/${userId}`);
    onValue(netRef, (snapshot) => {
      const val = snapshot.val() || {};
      setNetwork(Object.values(val));
    });
    // Fetch all users for real builder discovery
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
      const val = snapshot.val() || {};
      // Exclude self
      const users = Object.entries(val)
        .filter(([id]) => id !== userId)
        .map(([id, data]: any) => ({ id, ...data.profile, projects: data.projects }));
      setAllUsers(users);
    });
  }, [userId]);

  // Fetch chat messages when chat opens or target changes
  useEffect(() => {
    if (!chatOpen || !chatTarget) return;
    const chatId = chatTarget.id || chatTarget.from; // id for accepted, from for requests
    const path = `messages/${userId}/${chatId}`;
    const chatRef = ref(db, path);
    onValue(chatRef, (snapshot) => {
      const val = snapshot.val() || {};
      setChatMessages(Object.values(val));
    });
  }, [chatOpen, chatTarget, userId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Save user data to Firebase
  const saveUserData = (newProfile = profile, newProjects = projects) => {
    set(ref(db, `users/${userId}`), {
      profile: newProfile,
      projects: newProjects,
    });
  };

  // Add after saveUserData
  const sendConnectionRequest = (targetUserId: string) => {
    set(ref(db, `connections/${targetUserId}/${userId}`), {
      from: userId,
      fromName: profile.name,
      time: Date.now(),
    });
    window.alert(`Connection request sent to ${targetUserId}!`);
  };

  // Profile handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const updated = { ...profile, [e.target.name]: e.target.value };
    setProfile(updated);
    setProfileError('');
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim() || !profile.bio.trim()) {
      setProfileError('Name and bio are required.');
      return;
    }
    saveUserData(profile, projects);
    setProfileError('');
  };

  // Avatar upload handler
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const updated = { ...profile, avatar: url };
      setProfile(updated);
      saveUserData(updated, projects);
    };
    reader.readAsDataURL(file);
  };

  // Project form handlers
  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  };

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectForm({ ...projectForm, tagInput: e.target.value });
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && projectForm.tagInput.trim()) {
      e.preventDefault();
      if (!projectForm.tags.includes(projectForm.tagInput.trim())) {
        setProjectForm({
          ...projectForm,
          tags: [...projectForm.tags, projectForm.tagInput.trim()],
          tagInput: '',
        });
      } else {
        setProjectForm({ ...projectForm, tagInput: '' });
      }
    }
  };

  const removeTag = (tag: string) => {
    setProjectForm({ ...projectForm, tags: projectForm.tags.filter(t => t !== tag) });
  };

  const addProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setProjectError('Project name is required.');
      return;
    }
    setProjectError('');
    const newProjects = [
      ...projects,
      { name: projectForm.name.trim(), description: projectForm.description.trim(), tags: projectForm.tags },
    ];
    setProjects(newProjects);
    setProjectForm({ name: '', description: '', tagInput: '', tags: [] });
    saveUserData(profile, newProjects);
  };

  const deleteProject = (idx: number) => {
    const newProjects = projects.filter((_, i) => i !== idx);
    setProjects(newProjects);
    saveUserData(profile, newProjects);
  };

  // --- Matching Logic ---
  // Collect all tags from user's projects
  const userTags = Array.from(new Set(projects.flatMap(p => p.tags.map(t => t.toLowerCase()))));
  // Show only builders with at least one matching tag
  const matchingBuilders = mockBuilders.filter(b => b.tags.some(tag => userTags.includes(tag.toLowerCase())));

  // Show onboarding first
  if (!onboarded) {
    return <BuilderConsoleOnboarding onComplete={(data) => {
      setProfile({ name: data.name, bio: data.bio, avatar: '' });
      setProjects([{ name: data.project, description: '', tags: [] }]);
      setOnboarded(true);
      saveUserData({ name: data.name, bio: data.bio, avatar: '' }, [{ name: data.project, description: '', tags: [] }]);
    }} />;
  }

  // Add Accept/Ignore handlers
  const acceptConnection = (fromUserId: string, fromName: string) => {
    set(ref(db, `acceptedConnections/${userId}/${fromUserId}`), {
      name: fromName,
      time: Date.now(),
    });
    remove(ref(db, `connections/${userId}/${fromUserId}`));
    window.alert(`You are now connected with ${fromName}!`);
  };
  const ignoreConnection = (fromUserId: string, fromName: string) => {
    remove(ref(db, `connections/${userId}/${fromUserId}`));
    window.alert(`Ignored connection request from ${fromName}.`);
  };

  // Send a message
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatTarget) return;
    const chatId = chatTarget.id || chatTarget.from;
    const myMsg = {
      from: userId,
      fromName: profile.name,
      text: chatInput.trim(),
      time: Date.now(),
    };
    // Save to both users' message paths
    const myPath = `messages/${userId}/${chatId}`;
    const theirPath = `messages/${chatId}/${userId}`;
    const msgKey = Date.now().toString();
    set(ref(db, `${myPath}/${msgKey}`), myMsg);
    set(ref(db, `${theirPath}/${msgKey}`), myMsg);
    setChatInput('');
  };

  // --- Console Dashboard UI ---
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-black font-mono text-green-400 px-2">
      {/* Back to Home Button */}
      <button
        className="absolute top-8 left-8 bg-black/80 border border-green-400 text-green-300 font-semibold rounded-lg px-4 py-2 shadow hover:bg-green-400 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 z-50"
        onClick={() => navigate('/')}
      >
        ← Back to Home
      </button>
      <div className="w-full max-w-2xl bg-[#18181b] rounded-2xl shadow-2xl border border-gray-800 p-10 flex flex-col gap-10 animate-fade-in-up">
        <div className="text-2xl text-white font-bold mb-2">Welcome, {profile.name || 'builder'}!</div>
        <div className="text-green-300 mb-6">// This is your Milap Console. Manage your profile, projects, and discover builders—all in one place.</div>

        {/* Profile Section */}
        <div className="mb-6">
          <div className="text-green-400 text-lg font-semibold mb-2">Profile</div>
          <div className="ml-2 mt-1 flex flex-col gap-2">
            <div className="flex items-center gap-4 mb-2">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-14 h-14 rounded-full border-2 border-green-400 object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gray-700 text-white flex items-center justify-center text-2xl font-bold border-2 border-green-400">
                  {profile.name ? profile.name[0].toUpperCase() : '?'}
                </div>
              )}
              <label className="text-xs text-green-300 cursor-pointer hover:underline">
                Change Avatar
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <span>Name: <span className="text-white font-semibold">{profile.name}</span></span>
            <span>Bio: <span className="text-white">{profile.bio}</span></span>
          </div>
          <form className="flex flex-col gap-3 mt-4 ml-2" onSubmit={handleProfileSave}>
            <label className="text-green-300">Edit your name</label>
            <input
              type="text"
              name="name"
              placeholder="Type new name"
              value={profile.name}
              onChange={handleProfileChange}
              className="bg-black/60 border border-green-400 focus:border-white text-white py-2 px-3 rounded-lg outline-none transition-colors duration-200 placeholder-green-300 w-64"
              autoComplete="off"
            />
            <label className="text-green-300 mt-2">Edit your bio</label>
            <input
              type="text"
              name="bio"
              placeholder="Type new bio"
              value={profile.bio}
              onChange={handleProfileChange}
              className="bg-black/60 border border-green-400 focus:border-white text-white py-2 px-3 rounded-lg outline-none transition-colors duration-200 placeholder-green-300 w-64"
              autoComplete="off"
              maxLength={160}
            />
            <span className="text-xs text-gray-400 mt-1">This is how other builders will see you.</span>
            {profileError && <span className="text-xs text-red-400 mt-1">{profileError}</span>}
          </form>
        </div>
        <div className="border-t border-green-900 my-2" />

        {/* Projects Section */}
        <div className="mb-6">
          <div className="text-green-400 text-lg font-semibold mb-2">Projects</div>
          <div className="ml-2 mt-1 flex flex-col gap-2">
            {projects.length === 0 ? (
              <span className="text-gray-400">No projects yet. Add one below!</span>
            ) : (
              projects.map((project, idx) => (
                <div key={idx} className="flex flex-col gap-1 bg-black/30 rounded-lg p-3 border border-gray-800 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{project.name}</span>
                    <button
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-200 ml-2"
                      onClick={() => deleteProject(idx)}
                    >
                      Delete
                    </button>
                  </div>
                  <span className="text-gray-300 text-sm">{project.description}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.tags.map(tag => (
                      <span key={tag} className="bg-gray-800 text-green-300 rounded-full px-3 py-1 text-xs font-medium">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={addProject} className="flex flex-col gap-3 mt-4 ml-2">
            <label className="text-green-300">Add a new project</label>
            <input
              type="text"
              name="name"
              placeholder="Project Name"
              value={projectForm.name}
              onChange={handleProjectChange}
              className="bg-black/60 border border-green-400 focus:border-white text-white py-2 px-3 rounded-lg outline-none transition-colors duration-200 placeholder-green-300 w-64"
              autoComplete="off"
              required
            />
            <input
              type="text"
              name="description"
              placeholder="Short project description"
              value={projectForm.description}
              onChange={handleProjectChange}
              className="bg-black/60 border border-green-400 focus:border-white text-white py-2 px-3 rounded-lg outline-none transition-colors duration-200 placeholder-green-300 w-64"
              autoComplete="off"
              maxLength={120}
            />
            <div className="flex flex-wrap gap-2 items-center mt-2">
              {projectForm.tags.map(tag => (
                <span
                  key={tag}
                  className="relative group bg-gray-800 text-green-300 rounded-full px-3 py-1 text-xs font-medium flex items-center cursor-pointer hover:bg-white hover:text-black transition-colors duration-200"
                  onMouseEnter={() => setTagHover(tag)}
                  onMouseLeave={() => setTagHover(null)}
                >
                  #{tag}
                  <button
                    type="button"
                    className="ml-2 text-gray-400 hover:text-red-400 text-xs"
                    onClick={() => removeTag(tag)}
                    tabIndex={-1}
                  >
                    ×
                  </button>
                  {/* Tooltip on tag hover */}
                  {tagHover === tag && (
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 rounded bg-gray-900 text-xs text-gray-200 shadow-lg z-10 whitespace-nowrap animate-fade-in">
                      Tag = instant match potential!
                    </span>
                  )}
                </span>
              ))}
              <input
                type="text"
                name="tagInput"
                placeholder="Add tag (press Enter)"
                value={projectForm.tagInput}
                onChange={handleTagInput}
                onKeyDown={handleTagKeyDown}
                className="bg-black/60 border-b border-green-400 focus:border-white text-white py-1 px-1 rounded outline-none transition-colors duration-200 placeholder-green-300 w-32"
                autoComplete="off"
              />
            </div>
            {projectError && <span className="text-xs text-red-400 mt-1">{projectError}</span>}
            <button
              type="submit"
              className="mt-2 bg-green-400 text-black font-semibold rounded-lg px-6 py-2 shadow transition-colors duration-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 self-start"
            >
              + Add Project
            </button>
            <span className="text-xs text-gray-400 mt-1">Projects help others discover what you're building.</span>
          </form>
        </div>
        <div className="border-t border-green-900 my-2" />

        {/* Incoming Connection Requests */}
        {requests.length > 0 && (
          <div className="mb-6">
            <div className="text-green-400 text-lg font-semibold mb-2 flex items-center gap-2">
              Incoming Connection Requests
              <span className="inline-block bg-green-400 text-black rounded-full px-2 py-0.5 text-xs font-bold">{requests.length}</span>
            </div>
            <div className="ml-2 mt-1 flex flex-col gap-2">
              {requests.map((req, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-green-700">
                  <span className="text-white font-semibold">{req.fromName || 'Unknown'}</span>
                  <span className="text-xs text-gray-400 ml-2">wants to connect</span>
                  <span className="ml-auto text-xs text-green-300">{new Date(req.time).toLocaleString()}</span>
                  <button
                    className="ml-4 bg-green-400 text-black font-semibold rounded px-3 py-1 text-xs hover:bg-green-300 transition-colors"
                    onClick={() => acceptConnection(req.from, req.fromName)}
                  >
                    Accept
                  </button>
                  <button
                    className="ml-2 bg-gray-700 text-gray-200 font-semibold rounded px-3 py-1 text-xs hover:bg-red-400 hover:text-black transition-colors"
                    onClick={() => ignoreConnection(req.from, req.fromName)}
                  >
                    Ignore
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Network Section */}
        {network.length > 0 && (
          <div className="mb-6">
            <div className="text-green-400 text-lg font-semibold mb-2 flex items-center gap-2">
              Your Network
              <span className="inline-block bg-green-400 text-black rounded-full px-2 py-0.5 text-xs font-bold">{network.length}</span>
            </div>
            <div className="ml-2 mt-1 flex flex-col gap-2">
              {network.map((conn, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-black/30 rounded-lg p-3 border border-green-700">
                  {conn.avatar ? (
                    <img src={conn.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-green-400 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-700 text-white flex items-center justify-center text-base font-bold border border-green-400">
                      {conn.name ? conn.name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <span className="text-white font-semibold">{conn.name || 'Unknown'}</span>
                  <span className="ml-auto text-xs text-green-300">Connected: {new Date(conn.time).toLocaleString()}</span>
                  <button
                    className="ml-4 bg-green-400 text-black font-semibold rounded px-3 py-1 text-xs hover:bg-green-300 transition-colors"
                    onClick={() => { setChatTarget(conn); setChatOpen(true); }}
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {chatOpen && chatTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-[#18181b] rounded-2xl shadow-2xl border border-green-700 p-8 w-full max-w-md flex flex-col h-[32rem]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-bold text-green-400">Chat with {chatTarget.name}</div>
                <button className="text-gray-400 hover:text-white text-2xl px-2" onClick={() => setChatOpen(false)} aria-label="Close chat">×</button>
              </div>
              <div className="flex-1 overflow-y-auto px-1 mb-4 space-y-2">
                {chatMessages.length === 0 ? (
                  <div className="text-gray-500 text-center mt-10">No messages yet. Say hi! 👋</div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.from === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${msg.from === userId ? 'bg-green-400 text-black' : 'bg-gray-800 text-green-200'}`}>
                        <span className="block font-semibold">{msg.from === userId ? 'You' : msg.fromName}</span>
                        <span>{msg.text}</span>
                        <span className="block text-[10px] text-gray-400 mt-1">{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={sendChatMessage} className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 bg-black/60 border border-green-400 focus:border-white text-white py-2 px-3 rounded-lg outline-none transition-colors duration-200 placeholder-green-300"
                  placeholder="Type a message..."
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-400 text-black font-semibold rounded-lg px-4 py-2 shadow transition-colors duration-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                  disabled={!chatInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Discover Builders Section */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-green-400 text-lg font-semibold">Discover Builders</div>
            <button
              onClick={() => setAllUsers([])}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="ml-2 mt-1 flex flex-col gap-3">
            {allUsers.length === 0 ? (
              <span className="text-gray-400">No other builders found yet. Invite a friend to join Milap!</span>
            ) : (
              allUsers.map((u, idx) => (
                <div key={u.id} className="flex items-center gap-4 bg-black/30 rounded-lg p-3 border border-gray-800">
                  {u.avatar ? (
                    <img src={u.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-green-400 object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-700 text-white flex items-center justify-center text-base font-bold border border-green-400">
                      {u.name ? u.name[0].toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-white font-semibold">{u.name}</span>
                    <span className="ml-2 text-xs bg-green-400/10 text-green-300 rounded px-2 py-1">{u.projects && u.projects[0] ? u.projects[0].name : ''}</span>
                    <span className="ml-2 text-xs text-gray-400">{u.projects && u.projects[0] && u.projects[0].tags ? u.projects[0].tags.map((tag: string) => `#${tag}`).join(' ') : ''}</span>
                    <div className="text-xs text-gray-400 mt-1">{u.bio}</div>
                  </div>
                  <button
                    className="bg-green-400 text-black font-semibold rounded-lg px-4 py-1.5 shadow transition-colors duration-200 hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                    onClick={() => sendConnectionRequest(u.id)}
                  >
                    Connect
                  </button>
                </div>
              ))
            )}
          </div>
          <span className="text-xs text-gray-400 mt-3 block">Find and connect with other builders working on similar things.</span>
        </div>

        {/* What's Next Section */}
        <div className="mt-8 border-t border-green-900 pt-8">
          <div className="text-green-400 text-lg font-semibold mb-2">What's Next?</div>
          <ul className="ml-2 flex flex-col gap-2 text-green-200 text-base">
            <li className="flex items-center gap-2">
              🚀 <span className="text-white">Invite a friend</span> to join Milap and build together!
              <button
                className="ml-2 px-3 py-1 bg-green-400 text-black rounded font-semibold text-xs hover:bg-green-300 transition-colors border border-green-700"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  setInviteCopied(true);
                  setTimeout(() => setInviteCopied(false), 2000);
                }}
              >
                Copy Invite Link
              </button>
              {inviteCopied && <span className="ml-2 text-green-300 text-xs">Copied!</span>}
            </li>
            <li>🤝 <span className="text-white">Connect</span> with other builders in the list above.</li>
            <li>💬 <span className="text-white">Start a chat</span> with your network using the chat icon below.</li>
            <li>🌟 <span className="text-white">Update your profile</span> to stand out and attract collaborators.</li>
          </ul>
          <div className="text-xs text-gray-400 mt-4">Share your invite link with friends. When they join, you'll see them in Discover Builders and can connect instantly!</div>
        </div>
      </div>
    </section>
  );
};

export default ProfileProjects; 