export async function UploadFile({ file }) {
  if (!file) {
    throw new Error('No file provided');
  }

  const simulateUpload = () =>
    new Promise((resolve) => {
      setTimeout(() => {
        const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL
          ? URL.createObjectURL(file)
          : `uploaded://${encodeURIComponent(file.name)}`;

        resolve({
          file_url: objectUrl,
          file_name: file.name,
          file_size: file.size,
          file_mime: file.type,
        });
      }, 600);
    });

  return simulateUpload();
}

