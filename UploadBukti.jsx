import React, { useState } from 'react'

export default function UploadBukti() {
  const [file, setFile] = useState(null)

  const handleChange = (e) => {
    setFile(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Upload Bukti Pengiriman</h2>
      <input type="file" onChange={handleChange} />
      {file && (
        <div className="mt-4">
          <p>Preview:</p>
          <img src={file} alt="bukti" className="w-64 h-auto mt-2 border" />
        </div>
      )}
    </div>
  )
}
