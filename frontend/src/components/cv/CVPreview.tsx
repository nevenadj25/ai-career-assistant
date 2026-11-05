import { useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import type { CVData, CVDesignConfig, CVSection } from "../../types/cv";

import { createCV, updateCV } from "../../api/cvApi";

interface Props {
  data: CVData;
  cvId: number | null;
  onSave: (id: number) => void;
  isAIGenerated?: boolean;
  design: CVDesignConfig;
  language?: "sr-latn" | "sr-cyrl" | "en";
}

interface SectionTitleProps {
  children: ReactNode;
  sidebar?: boolean;
}

const CVPreview = ({
  data,
  cvId,
  onSave,
  isAIGenerated = false,
  design,
  language = "en",
}: Props) => {
  const {
    personalInfo,
    education,
    experience,
    skills,
    languages,
    projects,
    certificates,
  } = data;

  const cvRef = useRef<HTMLDivElement>(null);

  const labels = {
    en: {
      contact: "Contact",
      email: "Email",
      phone: "Phone",
      address: "Address",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      languages: "Languages",
      projects: "Projects",
      certificates: "Certificates",
      firstName: "Name",
      lastName: "Surname",
    },

    "sr-latn": {
      contact: "Kontakt",
      email: "Email",
      phone: "Telefon",
      address: "Adresa",
      experience: "Iskustvo",
      education: "Obrazovanje",
      skills: "Veštine",
      languages: "Jezici",
      projects: "Projekti",
      certificates: "Sertifikati",
      firstName: "Ime",
      lastName: "Prezime",
    },

    "sr-cyrl": {
      contact: "Контакт",
      email: "Имејл",
      phone: "Телефон",
      address: "Адреса",
      experience: "Искуство",
      education: "Образовање",
      skills: "Вештине",
      languages: "Језици",
      projects: "Пројекти",
      certificates: "Сертификати",
      firstName: "Име",
      lastName: "Презиме",
    },
  }[language];

  const handleSave = async () => {
    try {
      if (cvId !== null) {
        const updatedCV = await updateCV(cvId, data);

        onSave(updatedCV.id);

        alert("CV je uspešno izmenjen!");
      } else {
        const savedCV = await createCV(data);

        onSave(savedCV.id);

        alert("CV je uspešno sačuvan!");
      }
    } catch (error) {
      console.error(error);

      alert("Došlo je do greške prilikom čuvanja CV-a.");
    }
  };

  const handleDownloadPDF = async () => {
    if (!cvRef.current) {
      return;
    }

    try {
      const canvas = await html2canvas(cvRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);

      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;

        pdf.addPage();

        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);

        heightLeft -= pageHeight;
      }

      const firstName = personalInfo.firstName.trim() || "CV";

      const lastName = personalInfo.lastName.trim() || "";

      const fileName = lastName
        ? `${firstName}_${lastName}_CV.pdf`
        : `${firstName}_CV.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation error:", error);

      alert("Došlo je do greške prilikom preuzimanja PDF-a.");
    }
  };

  const primaryColor = design.primaryColor || "#1f2937";

  const accentColor = design.accentColor || "#4f46e5";

  const fontFamilies: Record<CVDesignConfig["font"], string> = {
    Inter: "Inter, Arial, sans-serif",
    Roboto: "Roboto, Arial, sans-serif",
    Poppins: "Poppins, Arial, sans-serif",
    Georgia: "Georgia, 'Times New Roman', serif",
  };

  const cvStyle: CSSProperties = {
    fontFamily: fontFamilies[design.font] || fontFamilies.Inter,
  };

  const spacingClasses = {
    compact: "space-y-5",
    normal: "space-y-7",
    spacious: "space-y-10",
  };

  const sectionSpacing =
    spacingClasses[design.spacing] || spacingClasses.normal;

  const getPhotoSize = () => {
    switch (design.photo.size) {
      case "small":
        return "h-20 w-20";

      case "large":
        return "h-36 w-36";

      case "medium":
      default:
        return "h-28 w-28";
    }
  };

  const getPhotoShape = () => {
    switch (design.photo.shape) {
      case "square":
        return "rounded-none";

      case "rounded":
        return "rounded-2xl";

      case "circle":
      default:
        return "rounded-full";
    }
  };

  const ProfilePhoto = ({ sidebar = false }: { sidebar?: boolean }) => {
    if (!design.photo.visible || !personalInfo.photo) {
      return null;
    }

    return (
      <img
        src={personalInfo.photo}
        alt="Profile"
        className={`
          ${getPhotoSize()}
          ${getPhotoShape()}
          object-cover
          ${sidebar ? "border-4 border-white/20" : "border-4 border-gray-100"}
        `}
      />
    );
  };

  const SectionTitle = ({ children, sidebar = false }: SectionTitleProps) => {
    if (sidebar) {
      return (
        <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
          {children}
        </h2>
      );
    }

    if (design.headingStyle === "accent") {
      return (
        <div className="mb-4 flex items-center gap-3">
          <span
            className="h-6 w-1 rounded-full"
            style={{
              backgroundColor: accentColor,
            }}
          />

          <h2
            className="text-lg font-bold uppercase tracking-wider"
            style={{
              color: primaryColor,
            }}
          >
            {children}
          </h2>
        </div>
      );
    }

    if (design.headingStyle === "minimal") {
      return (
        <h2
          className="mb-4 text-lg font-bold uppercase tracking-wider"
          style={{
            color: primaryColor,
          }}
        >
          {children}
        </h2>
      );
    }

    return (
      <h2
        className="mb-4 border-b-2 pb-2 text-lg font-bold uppercase tracking-wider"
        style={{
          color: primaryColor,
          borderColor: accentColor,
        }}
      >
        {children}
      </h2>
    );
  };

  const renderContact = (sidebar = false) => {
    const hasContact =
      personalInfo.email ||
      personalInfo.phone ||
      personalInfo.address ||
      personalInfo.linkedIn ||
      personalInfo.github ||
      personalInfo.portfolio;

    if (!hasContact) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.contact}</SectionTitle>

        <div
          className={
            sidebar
              ? "space-y-3 text-sm"
              : "grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"
          }
        >
          {personalInfo.email && (
            <div className="break-all">
              <span className="font-semibold">{labels.email}:</span>{" "}
              {personalInfo.email}
            </div>
          )}

          {personalInfo.phone && (
            <div>
              <span className="font-semibold">{labels.phone}:</span>{" "}
              {personalInfo.phone}
            </div>
          )}

          {personalInfo.address && (
            <div>
              <span className="font-semibold">{labels.address}:</span>{" "}
              {personalInfo.address}
            </div>
          )}

          {personalInfo.linkedIn && (
            <div className="break-all">
              <span className="font-semibold">LinkedIn:</span>{" "}
              {personalInfo.linkedIn}
            </div>
          )}

          {personalInfo.github && (
            <div className="break-all">
              <span className="font-semibold">GitHub:</span>{" "}
              {personalInfo.github}
            </div>
          )}

          {personalInfo.portfolio && (
            <div className="break-all">
              <span className="font-semibold">Portfolio:</span>{" "}
              {personalInfo.portfolio}
            </div>
          )}
        </div>
      </section>
    );
  };
  const renderExperience = (sidebar = false) => {
    const visibleExperience = experience.filter(
      (item) => item.company || item.position || item.description,
    );

    if (visibleExperience.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.experience}</SectionTitle>

        {design.experienceStyle === "timeline" && !sidebar && (
          <div
            className="ml-2 space-y-6 border-l-2 pl-6"
            style={{
              borderColor: `${accentColor}60`,
            }}
          >
            {visibleExperience.map((item) => (
              <div key={item.id} className="relative">
                <span
                  className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: accentColor,
                  }}
                />

                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{item.position}</h3>

                    <p className="text-sm font-medium text-gray-600">
                      {item.company}

                      {item.location && ` • ${item.location}`}
                    </p>
                  </div>

                  {(item.startDate || item.endDate) && (
                    <p className="shrink-0 text-xs text-gray-400">
                      {item.startDate}

                      {item.endDate && ` — ${item.endDate}`}
                    </p>
                  )}
                </div>

                {item.description && (
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {(design.experienceStyle !== "timeline" || sidebar) && (
          <div
            className={
              sidebar
                ? "space-y-5"
                : design.experienceStyle === "compact"
                  ? "space-y-4"
                  : "space-y-6"
            }
          >
            {visibleExperience.map((item) => (
              <div
                key={item.id}
                className={
                  design.experienceStyle === "compact" && !sidebar
                    ? "border-b border-gray-100 pb-3"
                    : ""
                }
              >
                <div className={sidebar ? "" : "flex justify-between gap-4"}>
                  <div>
                    <h3
                      className={
                        sidebar
                          ? "font-semibold text-white"
                          : "font-bold text-gray-900"
                      }
                    >
                      {item.position}
                    </h3>

                    {item.company && (
                      <p
                        className={
                          sidebar
                            ? "text-xs text-white/75"
                            : "text-sm text-gray-600"
                        }
                      >
                        {item.company}

                        {item.location && ` • ${item.location}`}
                      </p>
                    )}
                  </div>

                  {!sidebar && (item.startDate || item.endDate) && (
                    <p className="shrink-0 text-xs text-gray-400">
                      {item.startDate}

                      {item.endDate && ` — ${item.endDate}`}
                    </p>
                  )}
                </div>

                {sidebar && (item.startDate || item.endDate) && (
                  <p className="mt-1 text-xs text-white/60">
                    {item.startDate}

                    {item.endDate && ` — ${item.endDate}`}
                  </p>
                )}

                {item.description && (
                  <p
                    className={
                      sidebar
                        ? "mt-2 whitespace-pre-line text-xs leading-5 text-white/80"
                        : "mt-2 whitespace-pre-line text-sm leading-6 text-gray-600"
                    }
                  >
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderEducation = (sidebar = false) => {
    const visibleEducation = education.filter(
      (item) => item.school || item.degree || item.field,
    );

    if (visibleEducation.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.education}</SectionTitle>

        <div className={sidebar ? "space-y-5" : "space-y-5"}>
          {visibleEducation.map((item) => (
            <div key={item.id}>
              <div className={sidebar ? "" : "flex justify-between gap-4"}>
                <div>
                  <h3
                    className={
                      sidebar
                        ? "font-semibold text-white"
                        : "font-bold text-gray-900"
                    }
                  >
                    {item.degree || item.field}
                  </h3>

                  {item.school && (
                    <p
                      className={
                        sidebar
                          ? "text-xs text-white/75"
                          : "font-medium text-gray-600"
                      }
                    >
                      {item.school}
                    </p>
                  )}

                  {(item.field || item.city) && (
                    <p
                      className={
                        sidebar
                          ? "mt-1 text-xs text-white/60"
                          : "mt-0.5 text-sm text-gray-500"
                      }
                    >
                      {item.field}

                      {item.city && ` • ${item.city}`}
                    </p>
                  )}
                </div>

                {!sidebar && (item.startYear || item.endYear) && (
                  <p className="shrink-0 text-sm text-gray-400">
                    {item.startYear}

                    {item.endYear && ` — ${item.endYear}`}
                  </p>
                )}
              </div>

              {sidebar && (item.startYear || item.endYear) && (
                <p className="mt-1 text-xs text-white/60">
                  {item.startYear}

                  {item.endYear && ` — ${item.endYear}`}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = (sidebar = false) => {
    if (skills.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.skills}</SectionTitle>

        {design.skillsStyle === "badges" && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="rounded-lg px-2.5 py-1 text-xs font-medium"
                style={
                  sidebar
                    ? {
                        backgroundColor: "rgba(255,255,255,0.14)",
                        color: "#ffffff",
                      }
                    : {
                        color: accentColor,
                        backgroundColor: `${accentColor}12`,
                      }
                }
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {design.skillsStyle === "list" && (
          <ul className="space-y-2">
            {skills.map((skill, index) => (
              <li
                key={`${skill}-${index}`}
                className={
                  sidebar
                    ? "flex items-center gap-2 text-sm text-white/85"
                    : "flex items-center gap-3 text-sm text-gray-700"
                }
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: sidebar ? "#ffffff" : accentColor,
                  }}
                />

                {skill}
              </li>
            ))}
          </ul>
        )}

        {design.skillsStyle === "bars" && (
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={`${skill}-${index}`}>
                <p
                  className={
                    sidebar
                      ? "mb-1 text-xs font-medium text-white/90"
                      : "mb-1 text-sm font-medium text-gray-700"
                  }
                >
                  {skill}
                </p>

                <div
                  className={
                    sidebar
                      ? "h-1.5 overflow-hidden rounded-full bg-white/20"
                      : "h-1.5 overflow-hidden rounded-full bg-gray-100"
                  }
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(60, 90 - (index % 4) * 8)}%`,
                      backgroundColor: sidebar ? "#ffffff" : accentColor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderLanguages = (sidebar = false) => {
    if (languages.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.languages}</SectionTitle>

        <div className="space-y-2">
          {languages.map((language) => (
            <div
              key={language.id}
              className={
                sidebar
                  ? "border-b border-white/15 pb-2 text-sm"
                  : "flex justify-between border-b border-gray-100 pb-2 text-sm"
              }
            >
              <span
                className={
                  sidebar
                    ? "font-medium text-white"
                    : "font-medium text-gray-800"
                }
              >
                {language.name}
              </span>

              <span
                className={
                  sidebar ? "block text-xs text-white/65" : "text-gray-500"
                }
              >
                {language.level}
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderProjects = (sidebar = false) => {
    const visibleProjects = projects.filter(
      (project) => project.name || project.description || project.technologies,
    );

    if (visibleProjects.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.projects}</SectionTitle>

        <div className="space-y-5">
          {visibleProjects.map((project) => (
            <div key={project.id}>
              <h3
                className={
                  sidebar
                    ? "font-semibold text-white"
                    : "font-bold text-gray-900"
                }
              >
                {project.name}
              </h3>

              {project.technologies && (
                <p
                  className={
                    sidebar
                      ? "mt-1 text-xs font-semibold text-white/70"
                      : "mt-1 text-sm font-semibold"
                  }
                  style={
                    sidebar
                      ? undefined
                      : {
                          color: accentColor,
                        }
                  }
                >
                  {project.technologies}
                </p>
              )}

              {project.description && (
                <p
                  className={
                    sidebar
                      ? "mt-1 whitespace-pre-line text-xs leading-5 text-white/80"
                      : "mt-1 whitespace-pre-line text-sm leading-6 text-gray-600"
                  }
                >
                  {project.description}
                </p>
              )}

              {project.link && (
                <p
                  className={
                    sidebar
                      ? "mt-1 break-all text-xs text-white/60"
                      : "mt-1 break-all text-sm text-gray-400"
                  }
                >
                  {project.link}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderCertificates = (sidebar = false) => {
    if (certificates.length === 0) {
      return null;
    }

    return (
      <section>
        <SectionTitle sidebar={sidebar}>{labels.certificates}</SectionTitle>

        <div className="space-y-4">
          {certificates.map((certificate) => (
            <div key={certificate.id}>
              <div className={sidebar ? "" : "flex justify-between gap-4"}>
                <div>
                  <h3
                    className={
                      sidebar
                        ? "font-semibold text-white"
                        : "font-bold text-gray-900"
                    }
                  >
                    {certificate.name}
                  </h3>

                  {certificate.issuer && (
                    <p
                      className={
                        sidebar
                          ? "text-xs text-white/70"
                          : "text-sm text-gray-500"
                      }
                    >
                      {certificate.issuer}
                    </p>
                  )}
                </div>

                {!sidebar && certificate.date && (
                  <p className="shrink-0 text-sm text-gray-400">
                    {certificate.date}
                  </p>
                )}
              </div>

              {sidebar && certificate.date && (
                <p className="mt-1 text-xs text-white/60">{certificate.date}</p>
              )}

              {certificate.link && (
                <p
                  className={
                    sidebar
                      ? "mt-1 break-all text-xs text-white/60"
                      : "mt-1 break-all text-sm text-gray-400"
                  }
                >
                  {certificate.link}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };
  const renderSection = (section: CVSection, sidebar = false) => {
    switch (section) {
      case "contact":
        return renderContact(sidebar);

      case "experience":
        return renderExperience(sidebar);

      case "education":
        return renderEducation(sidebar);

      case "skills":
        return renderSkills(sidebar);

      case "languages":
        return renderLanguages(sidebar);

      case "projects":
        return renderProjects(sidebar);

      case "certificates":
        return renderCertificates(sidebar);

      default:
        return null;
    }
  };

  const renderHeader = () => {
    const centered = design.header.alignment === "center";

    const photoInHeader =
      design.photo.position === "header" &&
      design.photo.visible &&
      personalInfo.photo;

    return (
      <header
        className={`
          ${centered ? "text-center" : "text-left"}
          ${design.header.style === "accent" ? "rounded-xl p-6" : "pb-6"}
        `}
        style={
          design.header.style === "accent"
            ? {
                backgroundColor: `${accentColor}12`,
                borderBottom: `3px solid ${accentColor}`,
              }
            : design.header.style === "bold"
              ? {
                  borderBottom: `4px solid ${accentColor}`,
                }
              : {
                  borderBottom: `1px solid ${accentColor}50`,
                }
        }
      >
        <div
          className={
            centered
              ? "flex flex-col items-center gap-4"
              : photoInHeader
                ? "flex items-center gap-6"
                : ""
          }
        >
          {photoInHeader && <ProfilePhoto />}

          <div>
            <h1
              className={
                design.header.style === "bold"
                  ? "text-5xl font-extrabold tracking-tight"
                  : "text-4xl font-bold tracking-tight"
              }
              style={{
                color: primaryColor,
              }}
            >
              {personalInfo.firstName || labels.firstName}{" "}
              {personalInfo.lastName || labels.lastName}
            </h1>

            {experience[0]?.position && (
              <p
                className="mt-2 text-xl font-medium"
                style={{
                  color: accentColor,
                }}
              >
                {experience[0].position}
              </p>
            )}
          </div>
        </div>
      </header>
    );
  };

  const renderSidebar = () => {
    return (
      <aside
        className="min-h-full p-7 text-white"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        {design.photo.position === "sidebar" &&
          design.photo.visible &&
          personalInfo.photo && (
            <div className="mb-8 flex justify-center">
              <ProfilePhoto sidebar />
            </div>
          )}

        <div
          className={
            design.spacing === "compact"
              ? "space-y-6"
              : design.spacing === "spacious"
                ? "space-y-10"
                : "space-y-8"
          }
        >
          {design.sideSections.map((section) => {
            const content = renderSection(section, true);

            if (!content) {
              return null;
            }

            return <div key={section}>{content}</div>;
          })}
        </div>
      </aside>
    );
  };

  const renderMainContent = () => {
    return (
      <main className="p-8 md:p-10">
        {renderHeader()}

        <div className={`mt-8 ${sectionSpacing}`}>
          {design.mainSections.map((section) => {
            const content = renderSection(section);

            if (!content) {
              return null;
            }

            return <div key={section}>{content}</div>;
          })}
        </div>
      </main>
    );
  };

  const renderSingleColumn = () => {
    return (
      <div className="p-8 md:p-12">
        {renderHeader()}

        <div className={`mt-8 ${sectionSpacing}`}>
          {design.mainSections.map((section) => {
            const content = renderSection(section);

            if (!content) {
              return null;
            }

            return <div key={section}>{content}</div>;
          })}
        </div>
      </div>
    );
  };

  const renderColumnLayout = () => {
    const sidebarWidth = Math.min(40, Math.max(24, design.sidebarWidth || 30));

    const sidebar = renderSidebar();

    const main = renderMainContent();

    if (design.sidebarPosition === "right") {
      return (
        <div
          className="grid min-h-[1100px]"
          style={{
            gridTemplateColumns: `${100 - sidebarWidth}% ${sidebarWidth}%`,
          }}
        >
          {main}

          {sidebar}
        </div>
      );
    }

    return (
      <div
        className="grid min-h-[1100px]"
        style={{
          gridTemplateColumns: `${sidebarWidth}% ${100 - sidebarWidth}%`,
        }}
      >
        {sidebar}

        {main}
      </div>
    );
  };

  const renderCV = () => {
    if (design.layout === "single-column") {
      return renderSingleColumn();
    }

    return renderColumnLayout();
  };

  return (
    <section className="rounded-2xl bg-white p-6 shadow-xl">
      {/* PREVIEW HEADER */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">CV Prikaz</h2>

            {isAIGenerated && (
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"></span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {!isAIGenerated && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Sačuvaj CV
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Preuzmi PDF
          </button>
        </div>
      </div>

      {/* CV PAPER */}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-100 p-4 md:p-8">
        <div
          ref={cvRef}
          className="
            mx-auto
            min-h-[1100px]
            w-full
            max-w-[800px]
            overflow-hidden
            bg-white
            shadow-lg
          "
          style={cvStyle}
        >
          {renderCV()}
        </div>
      </div>
    </section>
  );
};

export default CVPreview;
