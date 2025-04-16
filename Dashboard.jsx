import React from 'react'
import { Link } from 'react-router-dom'

const customerList = [
  { id: 1, nama: "Budi", alamat: "Jl. Merdeka No.1" },
  { id: 2, nama: "Siti", alamat: "Jl. Mawar No.2" },
]

export default function Dashboard() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Daftar Pengantaran</h2>
      <ul>
        {customerList.map(cust => (
          <li key={cust.id} className="mb-2">
            <div className="p-4 border rounded shadow">
              <p><strong>{cust.nama}</strong></p>
              <p>{cust.alamat}</p>
              <Link to="/upload" className="text-blue-500">Upload Bukti</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
