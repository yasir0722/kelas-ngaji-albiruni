<template>
  <div class="admin-app">
    <header class="header">
      <h1>🔧 Admin Panel</h1>
      <h2>📝 Kelola Data Kehadiran</h2>
      <a href="/kelas-ngaji-albiruni/" class="back-button">← Kembali ke Kalender</a>
    </header>

    <div class="admin-container">
      <div class="upload-section">
        <h3>📤 Upload File CSV Baru</h3>
        <p>Upload file CSV dengan format: <code>name,date,type,pages</code></p>
        
        <div class="upload-area">
          <input 
            type="file" 
            @change="handleFileUpload" 
            accept=".csv"
            ref="fileInput"
            class="file-input"
            id="csv-upload"
          >
          <label for="csv-upload" class="upload-label">
            📁 Pilih File CSV
          </label>
        </div>

        <div v-if="uploadedData.length > 0" class="preview-section">
          <h4>👀 Preview Data ({{ uploadedData.length }} records):</h4>
          <div class="data-preview">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Tanggal</th>
                  <th>Kehadiran</th>
                  <th>Halaman</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(record, index) in uploadedData.slice(0, 10)" :key="index">
                  <td>{{ record.name }}</td>
                  <td>{{ record.date }}</td>
                  <td>
                    <span :class="['status-badge', getStatusClass(record.type)]">
                      {{ record.type }}
                    </span>
                  </td>
                  <td>{{ record.pages || '-' }}</td>
                </tr>
              </tbody>
            </table>
            <p v-if="uploadedData.length > 10" class="more-records">
              ... dan {{ uploadedData.length - 10 }} record lainnya
            </p>
          </div>
          
          <div class="action-buttons">
            <button @click="downloadCSV" class="download-btn">
              💾 Download CSV untuk Git
            </button>
            <button @click="clearData" class="clear-btn">
              🗑️ Hapus Data
            </button>
          </div>
        </div>
      </div>

      <div class="instructions-section">
        <h3>📋 Petunjuk Penggunaan</h3>
        <div class="instructions">
          <div class="step">
            <h4>1. 📤 Upload File CSV</h4>
            <p>Upload file CSV dengan format yang benar. File akan ditampilkan dalam preview.</p>
          </div>
          
          <div class="step">
            <h4>2. 💾 Download File untuk Git</h4>
            <p>Setelah puas dengan data, klik "Download CSV untuk Git" untuk mendapatkan file yang siap di-commit.</p>
          </div>
          
          <div class="step">
            <h4>3. 🔄 Update Repository</h4>
            <p>
              Ganti file <code>sample-attendance.csv</code> di repository dengan file yang baru di-download, 
              lalu commit dan push ke GitHub:
            </p>
            <code class="command">
              git add sample-attendance.csv<br>
              git commit -m "Update attendance data"<br>
              git push origin main
            </code>
          </div>
          
          <div class="step">
            <h4>4. ✅ Selesai</h4>
            <p>Data kehadiran akan otomatis terupdate di halaman parent dalam beberapa menit.</p>
          </div>
        </div>
      </div>

      <div class="csv-format-section">
        <h3>📄 Format CSV yang Diperlukan</h3>
        <div class="format-example">
          <code>
name,date,type,pages<br>
Ahmad Zaki,2025-08-01,Hadir,15<br>
Fatimah Sari,2025-08-01,Tidak Hadir,<br>
Muhammad Ali,2025-08-01,Terlambat,8
          </code>
        </div>
        
        <div class="format-notes">
          <h4>Keterangan:</h4>
          <ul>
            <li><strong>name</strong>: Nama lengkap santri</li>
            <li><strong>date</strong>: Tanggal dalam format YYYY-MM-DD</li>
            <li><strong>type</strong>: Status kehadiran (Hadir, Tidak Hadir, Terlambat)</li>
            <li><strong>pages</strong>: Jumlah halaman yang dibaca (boleh kosong)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminView',
  data() {
    return {
      uploadedData: []
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.parseCSV(e.target.result);
      };
      reader.readAsText(file);
    },
    parseCSV(csvContent) {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      this.uploadedData = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
          this.uploadedData.push({
            name: values[0],
            date: values[1],
            type: values[2],
            pages: values[3] || ''
          });
        }
      }
      
      // Sort by date
      this.uploadedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    downloadCSV() {
      if (this.uploadedData.length === 0) return;
      
      let csvContent = 'name,date,type,pages\n';
      
      this.uploadedData.forEach(record => {
        csvContent += `${record.name},${record.date},${record.type},${record.pages}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sample-attendance.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    clearData() {
      this.uploadedData = [];
      this.$refs.fileInput.value = '';
    },
    getStatusClass(type) {
      if (type === 'Hadir') return 'present';
      if (type === 'Tidak Hadir') return 'absent';
      if (type === 'Terlambat') return 'late';
      return '';
    }
  }
}
</script>

<style>
.admin-app {
  min-height: 100vh;
  padding: 20px;
  color: white;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header h2 {
  margin: 10px 0 20px 0;
  font-size: 1.5rem;
  font-weight: normal;
  opacity: 0.9;
}

.back-button {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  display: inline-block;
}

.back-button:hover {
  background: rgba(255,255,255,0.3);
}

.admin-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.upload-section, .instructions-section, .csv-format-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.upload-section h3, .instructions-section h3, .csv-format-section h3 {
  margin-top: 0;
  font-size: 1.3rem;
  margin-bottom: 20px;
}

.upload-area {
  margin: 20px 0;
}

.file-input {
  display: none;
}

.upload-label {
  background: rgba(76,175,80,0.3);
  border: 2px solid rgba(76,175,80,0.5);
  color: white;
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-block;
}

.upload-label:hover {
  background: rgba(76,175,80,0.5);
  transform: translateY(-2px);
}

.preview-section {
  margin-top: 30px;
  padding: 20px;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
}

.preview-section h4 {
  margin-top: 0;
  color: rgba(76,175,80,1);
}

.data-preview {
  overflow-x: auto;
  margin: 20px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  overflow: hidden;
}

th, td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

th {
  background: rgba(255,255,255,0.1);
  font-weight: bold;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.present {
  background: rgba(76,175,80,0.3);
}

.status-badge.absent {
  background: rgba(244,67,54,0.3);
}

.status-badge.late {
  background: rgba(255,152,0,0.3);
}

.more-records {
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-style: italic;
  margin-top: 15px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 25px;
}

.download-btn, .clear-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-btn {
  background: rgba(33,150,243,0.3);
  color: white;
  border: 2px solid rgba(33,150,243,0.5);
}

.download-btn:hover {
  background: rgba(33,150,243,0.5);
}

.clear-btn {
  background: rgba(244,67,54,0.3);
  color: white;
  border: 2px solid rgba(244,67,54,0.5);
}

.clear-btn:hover {
  background: rgba(244,67,54,0.5);
}

.instructions {
  display: grid;
  gap: 20px;
}

.step {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid rgba(33,150,243,0.7);
}

.step h4 {
  margin: 0 0 10px 0;
  color: rgba(33,150,243,1);
}

.step p {
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.command {
  display: block;
  background: rgba(0,0,0,0.3);
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin-top: 10px;
}

.format-example {
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.format-example code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.format-notes {
  margin-top: 20px;
}

.format-notes h4 {
  margin-bottom: 10px;
  color: rgba(255,193,7,1);
}

.format-notes ul {
  padding-left: 20px;
}

.format-notes li {
  margin-bottom: 5px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .admin-app {
    padding: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .data-preview {
    font-size: 14px;
  }
  
  th, td {
    padding: 8px 10px;
  }
}
</style>
