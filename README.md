<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aplikasi Kurir Makanan</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        .modal {
            display: none;
            /* Hidden by default */
            position: fixed;
            /* Stay in place */
            z-index: 100;
            /* Sit on top */
            left: 0;
            top: 0;
            width: 100%;
            /* Full width */
            height: 100%;
            /* Full height */
            overflow: auto;
            /* Enable scroll if needed */
            background-color: rgb(0, 0, 0);
            /* Fallback color */
            background-color: rgba(0, 0, 0, 0.4);
            /* Black w/ opacity */
            padding-top: 60px;
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            max-width: 500px;
            border-radius: 0.5rem;
        }

        .close-button {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }

        .close-button:hover,
        .close-button:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }

        /* Custom scrollbar for delivery list */
        .delivery-list-container::-webkit-scrollbar {
            width: 8px;
        }

        .delivery-list-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }

        .delivery-list-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
        }

        .delivery-list-container::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    </style>
</head>

<body class="bg-gray-100 text-gray-800">
    <div class="container mx-auto p-4 max-w-2xl">
        <header class="bg-blue-600 text-white p-6 rounded-lg shadow-md mb-6">
            <h1 class="text-3xl font-bold text-center">Aplikasi Kurir Pengiriman</h1>
            <p class="text-sm text-center mt-1">ID Kurir: <span id="userId" class="font-mono">Memuat...</span></p>
        </header>

        <div class="mb-4 flex justify-between items-center">
            <button id="addSampleDataBtn" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out">
                Tambah Data Contoh
            </button>
            <div id="loadingIndicator" class="text-sm text-gray-600">Memuat data...</div>
        </div>

        <div id="activeDeliverySection" class="mb-6 bg-white p-6 rounded-lg shadow-lg" style="display: none;">
            <h2 class="text-xl font-semibold mb-3 text-blue-700">Pengiriman Saat Ini:</h2>
            <p class="mb-1"><strong>Nama Pelanggan:</strong> <span id="activeCustomerName"></span></p>
            <p class="mb-3"><strong>Alamat:</strong> <span id="activeCustomerAddress"></span></p>

            <div class="mb-4">
                <label for="proofImage" class="block text-sm font-medium text-gray-700 mb-1">Foto Bukti Pengiriman:</label>
                <input type="file" id="proofImage" accept="image/*" class="w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                "/>
                <img id="imagePreview" src="#" alt="Pratinjau Gambar" class="mt-2 rounded-md max-h-40" style="display:none;"/>
            </div>
            <button id="completeDeliveryBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out disabled:opacity-50" disabled>
                Selesai & Unggah Bukti
            </button>
            <button id="cancelActiveDeliveryBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow mt-2 transition duration-150 ease-in-out">
                Kembali ke Daftar
            </button>
        </div>

        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Daftar Pengiriman Tertunda:</h2>
        <div id="deliveriesList" class="space-y-4 delivery-list-container max-h-[50vh] overflow-y-auto pr-2">
        </div>
        <p id="noDeliveries" class="text-center text-gray-500 mt-6" style="display: none;">Tidak ada pengiriman yang
            tertunda saat ini.</p>

        <h2 class="text-2xl font-semibold mt-8 mb-4 text-gray-700">Pengiriman Selesai:</h2>
        <div id="completedDeliveriesList" class="space-y-4 delivery-list-container max-h-[30vh] overflow-y-auto pr-2">
        </div>
        <p id="noCompletedDeliveries" class="text-center text-gray-500 mt-6" style="display: none;">Belum ada pengiriman
            yang selesai.</p>
    </div>

    <div id="notificationModal" class="modal">
        <div class="modal-content">
            <span class="close-button" onclick="closeModal()">&times;</span>
            <p id="modalMessage" class="text-lg"></p>
            <button onclick="closeModal()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg w-full">Tutup</button>
        </div>
    </div>

    <script type="module">
        // Konfigurasi Firebase (akan diisi secara otomatis oleh environment)
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
            apiKey: "YOUR_API_KEY", // Ganti dengan konfigurasi Anda jika menjalankan lokal
            authDomain: "YOUR_AUTH_DOMAIN",
            projectId: "YOUR_PROJECT_ID",
            storageBucket: "YOUR_STORAGE_BUCKET",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
            appId: "YOUR_APP_ID"
        };

        // ID Aplikasi (akan diisi secara otomatis oleh environment)
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'kurir-app-default';

        // Impor fungsi Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { 
            getAuth, 
            signInAnonymously, 
            onAuthStateChanged,
            signInWithCustomToken
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { 
            getFirestore, 
            collection, 
            // addDoc, // Tidak digunakan secara langsung lagi untuk data contoh
            query, 
            where, 
            onSnapshot, 
            doc, 
            updateDoc,
            // orderBy, // Dihapus karena menyebabkan error indeks
            serverTimestamp,
            setDoc // Untuk menambahkan data contoh dengan ID spesifik jika diperlukan
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
        import {
            getStorage,
            ref,
            uploadBytes,
            getDownloadURL
        } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";


        // Inisialisasi Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        const storage = getStorage(app);

        let currentUserId = null;
        let activeDeliveryId = null;
        let deliveriesCollectionRef;

        let localPendingDeliveries = []; // Array lokal untuk data pending
        let localCompletedDeliveries = []; // Array lokal untuk data completed

        const userIdSpan = document.getElementById('userId');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const deliveriesListDiv = document.getElementById('deliveriesList');
        const noDeliveriesP = document.getElementById('noDeliveries');
        const completedDeliveriesListDiv = document.getElementById('completedDeliveriesList');
        const noCompletedDeliveriesP = document.getElementById('noCompletedDeliveries');
        
        const activeDeliverySection = document.getElementById('activeDeliverySection');
        const activeCustomerNameSpan = document.getElementById('activeCustomerName');
        const activeCustomerAddressSpan = document.getElementById('activeCustomerAddress');
        const proofImageInput = document.getElementById('proofImage');
        const imagePreview = document.getElementById('imagePreview');
        const completeDeliveryBtn = document.getElementById('completeDeliveryBtn');
        const cancelActiveDeliveryBtn = document.getElementById('cancelActiveDeliveryBtn');
        const addSampleDataBtn = document.getElementById('addSampleDataBtn');

        // Modal elements
        const notificationModal = document.getElementById('notificationModal');
        const modalMessage = document.getElementById('modalMessage');
        const closeButton = document.querySelector('.close-button');

        function showModal(message) {
            modalMessage.textContent = message;
            notificationModal.style.display = "block";
        }

        window.closeModal = function() { // Attach to window to be accessible from inline onclick
            notificationModal.style.display = "none";
        }
        closeButton.onclick = closeModal; // Also attach to button object
        window.onclick = function(event) { // Close if clicked outside modal content
            if (event.target == notificationModal) {
                closeModal();
            }
        }


        // Fungsi untuk menampilkan daftar pengiriman
        function renderDeliveries(pending, completed) {
            deliveriesListDiv.innerHTML = '';
            completedDeliveriesListDiv.innerHTML = '';
            loadingIndicator.style.display = 'none';

            if (pending.length === 0) {
                noDeliveriesP.style.display = 'block';
            } else {
                noDeliveriesP.style.display = 'none';
                pending.forEach(delivery => {
                    const div = document.createElement('div');
                    div.className = 'bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-150';
                    div.innerHTML = `
                        <h3 class="text-lg font-semibold text-gray-800">${delivery.data.customerName}</h3>
                        <p class="text-sm text-gray-600">${delivery.data.customerAddress}</p>
                        <p class="text-xs text-gray-400 mt-1">Urutan: ${delivery.data.order || 'N/A'}</p>
                        <button data-id="${delivery.id}" class="start-delivery-btn mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-md text-sm transition duration-150 ease-in-out">
                            Antar Pesanan Ini
                        </button>
                    `;
                    deliveriesListDiv.appendChild(div);
                });
            }

            if (completed.length === 0) {
                noCompletedDeliveriesP.style.display = 'block';
            } else {
                noCompletedDeliveriesP.style.display = 'none';
                completed.forEach(delivery => {
                    const div = document.createElement('div');
                    div.className = 'bg-green-50 p-4 rounded-lg shadow-sm border border-green-200 opacity-80';
                    div.innerHTML = `
                        <h3 class="text-lg font-semibold text-green-700">${delivery.data.customerName}</h3>
                        <p class="text-sm text-gray-600">${delivery.data.customerAddress}</p>
                        <p class="text-xs text-green-500 mt-1">Selesai pada: ${delivery.data.completedAt ? new Date(delivery.data.completedAt.seconds * 1000).toLocaleString('id-ID') : 'N/A'}</p>
                        ${delivery.data.proofImageUrl ? `<img src="${delivery.data.proofImageUrl}" alt="Bukti Pengiriman" class="mt-2 rounded max-h-32 object-cover"/>` : '<p class="text-xs text-gray-400 mt-1">Tidak ada bukti foto.</p>'}
                    `;
                    completedDeliveriesListDiv.appendChild(div);
                });
            }
            
            // Tambahkan event listener untuk tombol "Antar Pesanan Ini"
            document.querySelectorAll('.start-delivery-btn').forEach(button => {
                button.addEventListener('click', () => {
                    // Cari dari array lokal pending yang sudah diurutkan
                    const delivery = localPendingDeliveries.find(d => d.id === button.dataset.id);
                    if (delivery) {
                        startDelivery(delivery);
                    }
                });
            });
        }

        function startDelivery(delivery) {
            activeDeliveryId = delivery.id;
            activeCustomerNameSpan.textContent = delivery.data.customerName;
            activeCustomerAddressSpan.textContent = delivery.data.customerAddress;
            
            activeDeliverySection.style.display = 'block';
            deliveriesListDiv.style.display = 'none'; // Sembunyikan daftar utama
            noDeliveriesP.style.display = 'none';
            document.querySelector('h2:nth-of-type(1)').textContent = "Detail Pengiriman Aktif"; // Ubah judul utama bagian atas

            proofImageInput.value = ''; // Reset input file
            imagePreview.style.display = 'none';
            imagePreview.src = '#';
            completeDeliveryBtn.disabled = true;
        }

        proofImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                reader.readAsDataURL(file);
                completeDeliveryBtn.disabled = false;
            } else {
                imagePreview.style.display = 'none';
                completeDeliveryBtn.disabled = true;
            }
        });

        cancelActiveDeliveryBtn.addEventListener('click', () => {
            activeDeliveryId = null;
            activeDeliverySection.style.display = 'none';
            deliveriesListDiv.style.display = 'block'; // Tampilkan kembali daftar utama
            document.querySelector('h2:nth-of-type(1)').textContent = "Daftar Pengiriman Tertunda:"; // Kembalikan judul
            if (deliveriesListDiv.childElementCount > 0) {
                 noDeliveriesP.style.display = 'none';
            } else {
                 noDeliveriesP.style.display = 'block';
            }
        });

        completeDeliveryBtn.addEventListener('click', async () => {
            if (!activeDeliveryId || !proofImageInput.files[0]) {
                showModal("Silakan pilih foto bukti pengiriman.");
                return;
            }
            completeDeliveryBtn.disabled = true;
            completeDeliveryBtn.textContent = "Mengunggah...";

            const file = proofImageInput.files[0];
            // PENTING: Aturan Keamanan Firebase Storage
            // Pastikan aturan keamanan Firebase Storage Anda di Firebase Console
            // mengizinkan operasi tulis untuk pengguna yang terotentikasi ke path ini.
            // Contoh aturan (sesuaikan dengan kebutuhan keamanan Anda):
            //
            // rules_version = '2';
            // service firebase.storage {
            //   match /b/{bucket}/o {
            //     // Izinkan baca dan tulis jika pengguna terotentikasi
            //     // dan path dimulai dengan 'proofs/{userId}' dimana {userId} adalah UID pengguna.
            //     match /proofs/{userId}/{allPaths=**} {
            //       allow read, write: if request.auth != null && request.auth.uid == userId;
            //     }
            //   }
            // }
            //
            // Tanpa aturan yang benar, Anda akan mendapatkan error 'storage/unauthorized'.
            const storageRef = ref(storage, `proofs/${currentUserId}/${activeDeliveryId}/${file.name}`);
            
            try {
                // 1. Upload file ke Firebase Storage
                const snapshot = await uploadBytes(storageRef, file);
                // 2. Dapatkan URL download
                const downloadURL = await getDownloadURL(snapshot.ref);

                // 3. Update dokumen di Firestore
                const deliveryDocRef = doc(db, deliveriesCollectionRef.path, activeDeliveryId);
                await updateDoc(deliveryDocRef, {
                    status: "completed",
                    proofImageUrl: downloadURL,
                    completedAt: serverTimestamp() 
                });
                
                showModal("Pengiriman berhasil diselesaikan dan bukti terunggah!");
                activeDeliveryId = null;
                activeDeliverySection.style.display = 'none';
                deliveriesListDiv.style.display = 'block';
                document.querySelector('h2:nth-of-type(1)').textContent = "Daftar Pengiriman Tertunda:";
                 if (deliveriesListDiv.childElementCount > 0) {
                    noDeliveriesP.style.display = 'none';
                } else {
                    noDeliveriesP.style.display = 'block';
                }

            } catch (error) {
                console.error("Error completing delivery: ", error);
                showModal("Gagal menyelesaikan pengiriman: " + error.message + ". Pastikan aturan Firebase Storage Anda sudah benar.");
            } finally {
                completeDeliveryBtn.disabled = false;
                completeDeliveryBtn.textContent = "Selesai & Unggah Bukti";
            }
        });

        addSampleDataBtn.addEventListener('click', async () => {
            if (!currentUserId) {
                showModal("User ID belum siap. Silakan coba lagi.");
                return;
            }

            const sampleDeliveries = [
                { id: "delivery1", customerName: "Budi Santoso", customerAddress: "Jl. Merdeka No. 10, Jakarta", order: 1, status: "pending", createdAt: serverTimestamp() },
                { id: "delivery2", customerName: "Ani Wijaya", customerAddress: "Jl. Pahlawan No. 25, Bandung", order: 2, status: "pending", createdAt: serverTimestamp() },
                { id: "delivery3", customerName: "Citra Lestari", customerAddress: "Jl. Kenanga No. 5, Surabaya", order: 3, status: "pending", createdAt: serverTimestamp() },
                { id: "delivery4", customerName: "Dewi Anggraini", customerAddress: "Jl. Mawar No. 12, Yogyakarta", order: 4, status: "completed", proofImageUrl: "https://placehold.co/600x400/000000/FFFFFF?text=Bukti+Foto+1", completedAt: serverTimestamp(), createdAt: serverTimestamp()},
            ];

            try {
                addSampleDataBtn.disabled = true;
                addSampleDataBtn.textContent = "Menambahkan...";
                for (const delivery of sampleDeliveries) {
                    const docRef = doc(deliveriesCollectionRef, delivery.id); // Gunakan ID yang ditentukan
                    await setDoc(docRef, delivery);
                }
                showModal("Data contoh berhasil ditambahkan!");
            } catch (error) {
                console.error("Error adding sample data: ", error);
                showModal("Gagal menambahkan data contoh: " + error.message);
            } finally {
                addSampleDataBtn.disabled = false;
                addSampleDataBtn.textContent = "Tambah Data Contoh";
            }
        });

        // Otentikasi dan muat data
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                userIdSpan.textContent = currentUserId;
                
                // Path koleksi spesifik pengguna
                deliveriesCollectionRef = collection(db, 'artifacts', appId, 'users', currentUserId, 'deliveries');

                // Query untuk mendapatkan pengiriman (TANPA orderBy)
                const qPending = query(deliveriesCollectionRef, where("status", "==", "pending"));
                const qCompleted = query(deliveriesCollectionRef, where("status", "==", "completed"));

                onSnapshot(qPending, (snapshot) => {
                    localPendingDeliveries = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
                    // Urutkan secara manual di client-side
                    localPendingDeliveries.sort((a, b) => (a.data.order || 0) - (b.data.order || 0)); // Ascending by order
                    renderDeliveries(localPendingDeliveries, localCompletedDeliveries);
                }, (error) => {
                    console.error("Error fetching pending deliveries: ", error);
                    loadingIndicator.textContent = "Gagal memuat data pengiriman tertunda.";
                    showModal("Gagal memuat data pengiriman tertunda: " + error.message);
                });

                onSnapshot(qCompleted, (snapshot) => {
                    localCompletedDeliveries = snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
                    // Urutkan secara manual di client-side
                    localCompletedDeliveries.sort((a, b) => {
                        const timeA = a.data.completedAt ? a.data.completedAt.toMillis() : 0;
                        const timeB = b.data.completedAt ? b.data.completedAt.toMillis() : 0;
                        return timeB - timeA; // Descending by completedAt
                    });
                    renderDeliveries(localPendingDeliveries, localCompletedDeliveries);
                }, (error) => {
                    console.error("Error fetching completed deliveries: ", error);
                    loadingIndicator.textContent = "Gagal memuat data pengiriman selesai.";
                    showModal("Gagal memuat data pengiriman selesai: " + error.message);
                });


            } else {
                // Jika tidak ada token kustom, coba login anonim
                // Token kustom akan disediakan oleh environment Canvas
                const customAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (customAuthToken) {
                    try {
                        await signInWithCustomToken(auth, customAuthToken);
                        // onAuthStateChanged akan dipanggil lagi setelah login berhasil
                    } catch (error) {
                        console.error("Error signing in with custom token:", error);
                        userIdSpan.textContent = "Gagal Otentikasi (Token)";
                        // Fallback ke anonim jika token gagal
                        try {
                            await signInAnonymously(auth);
                        } catch (anonError) {
                            console.error("Error signing in anonymously after token failure:", anonError);
                            userIdSpan.textContent = "Gagal Otentikasi Total";
                            showModal("Gagal melakukan otentikasi. Fitur penyimpanan tidak akan berfungsi.");
                        }
                    }
                } else {
                     try {
                        await signInAnonymously(auth);
                        // onAuthStateChanged akan dipanggil lagi setelah login anonim berhasil
                    } catch (error) {
                        console.error("Error signing in anonymously: ", error);
                        userIdSpan.textContent = "Gagal Otentikasi";
                        showModal("Gagal melakukan otentikasi anonim. Fitur penyimpanan tidak akan berfungsi.");
                    }
                }
            }
        });

    </script>
</body>

</html>
