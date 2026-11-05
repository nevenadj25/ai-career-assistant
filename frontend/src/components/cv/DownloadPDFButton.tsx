import html2pdf from "html2pdf.js";

interface Props {
  fileName?: string;
}

const DownloadPDFButton = ({ fileName = "my-cv" }: Props) => {
  const handleDownload = () => {
    const element = document.getElementById("cv-preview");

    if (!element) {
      console.error("CV preview not found.");
      return;
    }

    const options = {
      margin: 0,
      filename: `${fileName}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["css", "legacy"],
      },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="
        rounded-xl
        bg-indigo-600
        px-5
        py-3
        font-medium
        text-white
        shadow-lg
        transition
        hover:bg-indigo-700
      "
    >
      📄 Download PDF
    </button>
  );
};

export default DownloadPDFButton;
