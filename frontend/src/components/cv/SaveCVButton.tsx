import type { CVData } from "../../types/cv";

interface Props {
  data: CVData;
  cvId?: number | null;
  onSave?: (id: number) => void;
}

interface SavedCV {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: CVData;
}

const SaveCVButton = ({ data, cvId, onSave }: Props) => {
  const handleSave = () => {
    const savedCVs: SavedCV[] = JSON.parse(
      localStorage.getItem("savedCVs") || "[]",
    );

    const name = `${data.personalInfo.firstName || "My"} ${
      data.personalInfo.lastName || "CV"
    }`;

    // UPDATE EXISTING CV

    if (cvId) {
      const updatedCVs = savedCVs.map((cv) =>
        cv.id === cvId
          ? {
              ...cv,
              name,
              updatedAt: new Date().toISOString(),
              data,
            }
          : cv,
      );

      localStorage.setItem("savedCVs", JSON.stringify(updatedCVs));

      onSave?.(cvId);

      alert("CV je uspešno ažuriran! ✅");

      return;
    }

    // CREATE NEW CV

    const newCV: SavedCV = {
      id: Date.now(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
    };

    localStorage.setItem("savedCVs", JSON.stringify([...savedCVs, newCV]));

    onSave?.(newCV.id);

    alert("CV je uspešno sačuvan! ✅");
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      className="rounded-xl bg-green-600 px-6 py-3 font-medium text-white shadow-lg transition hover:bg-green-700"
    >
      {cvId ? "💾 Update CV" : "💾 Save CV"}
    </button>
  );
};

export default SaveCVButton;
