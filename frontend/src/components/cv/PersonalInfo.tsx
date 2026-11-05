import type { PersonalInfo } from "../../types/cv";

interface Props {
  data: PersonalInfo;
  setData: (data: PersonalInfo) => void;
}

const PersonalInfoForm = ({ data, setData }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Dozvoljeni formati su JPG, PNG i WEBP.");
      e.target.value = "";
      return;
    }

    const maxFileSize = 2 * 1024 * 1024;

    if (file.size > maxFileSize) {
      alert("Slika može imati najviše 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxWidth = 500;
        const maxHeight = 500;

        let width = image.width;
        let height = image.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);

          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        if (!context) {
          alert("Greška prilikom obrade slike.");
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        const compressedPhoto = canvas.toDataURL("image/jpeg", 0.8);

        setData({
          ...data,
          photo: compressedPhoto,
        });
      };

      image.onerror = () => {
        alert("Slika nije mogla da bude učitana.");
      };

      image.src = reader.result as string;
    };

    reader.onerror = () => {
      alert("Greška prilikom čitanja slike.");
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setData({
      ...data,
      photo: "",
    });
  };
  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-slate-800">
        Personal Information
      </h2>

      {/* PROFILE PHOTO */}
      <div className="mb-8">
        <label className="mb-3 block text-sm font-semibold text-gray-600">
          Profile Photo
        </label>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {data.photo ? (
            <img
              src={data.photo}
              alt="Profile preview"
              className="h-28 w-28 rounded-full border-4 border-gray-100 object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400">
              No photo
            </div>
          )}

          <div className="flex flex-col gap-3">
            <label className="inline-flex w-fit cursor-pointer items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
              Upload Photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-400">PNG, JPG ili WEBP</p>

            {data.photo && (
              <button
                type="button"
                onClick={removePhoto}
                className="w-fit text-sm font-semibold text-red-500 transition hover:text-red-600"
              >
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            First Name
          </label>

          <input
            type="text"
            name="firstName"
            value={data.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Last Name
          </label>

          <input
            type="text"
            name="lastName"
            value={data.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Email
          </label>

          <input
            type="email"
            name="email"
            value={data.email}
            onChange={handleChange}
            placeholder="john@email.com"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Phone
          </label>

          <input
            type="text"
            name="phone"
            value={data.phone}
            onChange={handleChange}
            placeholder="+381..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Address
          </label>

          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            placeholder="Belgrade, Serbia"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            LinkedIn
          </label>

          <input
            type="text"
            name="linkedIn"
            value={data.linkedIn}
            onChange={handleChange}
            placeholder="linkedin.com/in/..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            GitHub
          </label>

          <input
            type="text"
            name="github"
            value={data.github}
            onChange={handleChange}
            placeholder="github.com/..."
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-600">
            Portfolio
          </label>

          <input
            type="text"
            name="portfolio"
            value={data.portfolio}
            onChange={handleChange}
            placeholder="www.portfolio.com"
            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-blue-500"
          />
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoForm;
