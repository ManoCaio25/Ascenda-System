// AddCourse.jsx — sample form showcasing the AscendaIA activities block
// If your Add Course page already exists, copy the ACTIVITIES section
// to integrate the automatic activity planner.

import React from "react";
import { AscendaIAActivitiesSection } from "../components/activities/AscendaIAActivitiesSection";

export default function AddCourse() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [trainingType, setTrainingType] = React.useState("");
  const [hours, setHours] = React.useState("5.5");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [files, setFiles] = React.useState([]);
  const [activities, setActivities] = React.useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      category,
      difficulty,
      trainingType,
      hours: Number(hours),
      youtubeUrl: youtubeUrl || null,
      activities: activities
        ? {
            status: activities.status || "draft",
            total: activities.items?.length || 0,
            bundle: activities,
          }
        : null,
    };

    // TODO: replace with your existing submit logic (API or local persistence)
    console.log("COURSE PAYLOAD:", payload);
    alert("Course payload printed in console. Plug your submit logic.");
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4 p-6">
      <h2 className="text-2xl font-bold">Add New Course</h2>

      <input
        placeholder="Course title"
        className="w-full rounded-lg bg-surface/50 p-3"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="What will the interns learn?"
        className="w-full rounded-lg bg-surface/50 p-3"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <select className="rounded-lg bg-surface/50 p-3" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Category</option>
          <option>Frontend</option>
          <option>Backend</option>
        </select>
        <select className="rounded-lg bg-surface/50 p-3" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">Difficulty</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select className="rounded-lg bg-surface/50 p-3" value={trainingType} onChange={(e) => setTrainingType(e.target.value)}>
          <option value="">Training Type</option>
          <option>Video</option>
          <option>Reading</option>
          <option>Hybrid</option>
        </select>
        <input
          type="number"
          step="0.1"
          className="rounded-lg bg-surface/50 p-3"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </div>

      <input
        className="w-full rounded-lg bg-surface/50 p-3"
        placeholder="https://www.youtube.com/watch?v=..."
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
      />

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="block w-full rounded-lg bg-surface/50 py-8 text-center"
      />

      <AscendaIAActivitiesSection
        youtubeUrl={youtubeUrl}
        uploadedFile={files[0] || null}
        attachedActivities={activities}
        onAttach={setActivities}
      />

      <button type="submit" className="w-full rounded-xl bg-primary/80 py-3 font-semibold">
        Add course
      </button>

    </form>
  );
}
