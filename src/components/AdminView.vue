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
        <p>Upload file CSV dengan format: <code>name,date,type,stage,pages</code></p>
        
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
                  <th>Tarikh</th>
                  <th>Jenis</th>
                  <th>Tahap</th>
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
                  <td>{{ record.stage || '-' }}</td>
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
              � Show CSV Content
            </button>
            <button @click="clearData" class="clear-btn">
              🗑️ Hapus Data
            </button>
          </div>
        </div>
      </div>

      <!-- Attendance CSV Output from Upload Section -->
      <div v-if="showAttendanceCsvOutput && uploadedData.length > 0" class="csv-output-section">
        <h4>📄 Updated Attendance CSV Content</h4>
        <p>Copy this content and replace your sample-attendance.csv files in both /public and /docs folders:</p>
        
        <div class="csv-content">
          <pre>{{ attendanceCsvOutput }}</pre>
        </div>
        
        <div class="csv-actions">
          <button @click="copyAttendanceCsvToClipboard" class="copy-btn">
            📋 Copy to Clipboard
          </button>
          <button @click="closeAttendanceCsvOutput" class="close-btn">
            ❌ Close
          </button>
        </div>
        
        <div class="csv-instructions">
          <p><strong>Steps to update:</strong></p>
          <ol>
            <li>Copy the attendance content above</li>
            <li>Replace content in <code>public/sample-attendance.csv</code></li>
            <li>Replace content in <code>docs/sample-attendance.csv</code></li>
            <li>Commit and push to Git</li>
          </ol>
        </div>
      </div>

      <div class="student-list-section">
        <h3>👥 Kelola Senarai Pelajar</h3>
        
        <div class="student-form">
          <h4>➕ Tambah Pelajar Baru</h4>
          <div class="form-row">
            <div class="form-group">
              <label for="newStudentName">Nama Pelajar:</label>
              <input 
                type="text" 
                id="newStudentName"
                v-model="newStudent.name" 
                required
                placeholder="Masukkan nama pelajar"
              >
            </div>
            
            <div class="form-group">
              <label for="newStudentType">Jenis Pembelajaran:</label>
              <select 
                id="newStudentType"
                v-model="newStudent.type" 
                @change="onNewStudentTypeChange"
                required
              >
                <option value="">Pilih jenis</option>
                <option value="iqra">Iqra</option>
                <option value="quran">Quran</option>
              </select>
            </div>

            <div class="form-group">
              <label for="newStudentStage">Tahap:</label>
              <select 
                id="newStudentStage"
                v-model="newStudent.stage" 
                :disabled="!newStudent.type"
                required
              >
                <option value="">Pilih tahap</option>
                <option v-if="newStudent.type === 'iqra'" v-for="stage in [1,2,3,4,5,6]" :key="stage" :value="stage">
                  Tahap {{ stage }}
                </option>
                <option v-if="newStudent.type === 'quran'" value="1">Stage 1</option>
                <option v-if="newStudent.type === 'quran'" value="2">Stage 2</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="addStudent" class="submit-btn">
              ➕ Tambah Pelajar
            </button>
          </div>
        </div>

        <div v-if="studentList.length > 0" class="student-list-preview">
          <h4>📋 Senarai Pelajar ({{ studentList.length }} orang):</h4>
          <div class="student-table">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Jenis</th>
                  <th>Tahap</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(student, index) in studentList" :key="index">
                  <td>{{ student.name }}</td>
                  <td>
                    <span :class="['status-badge', student.type === 'iqra' ? 'iqra' : 'quran']">
                      {{ student.type }}
                    </span>
                  </td>
                  <td>
                    <span v-if="student.type === 'iqra'">Tahap {{ student.stage }}</span>
                    <span v-else>Stage {{ student.stage }}</span>
                  </td>
                  <td>
                    <button @click="removeStudent(index)" class="remove-btn">
                      🗑️ Padam
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CSV Output Display -->
        <div v-if="showCsvOutput" class="csv-output-section">
          <h4>📄 Updated CSV Content</h4>
          <p>Copy this content and replace your student-list.csv files in both /public and /docs folders:</p>
          
          <div class="csv-content">
            <pre>{{ csvOutput }}</pre>
          </div>
          
          <div class="csv-actions">
            <button @click="copyCsvToClipboard" class="copy-btn">
              📋 Copy to Clipboard
            </button>
            <button @click="closeCsvOutput" class="close-btn">
              ❌ Close
            </button>
          </div>
          
          <div class="csv-instructions">
            <p><strong>Steps to update:</strong></p>
            <ol>
              <li>Copy the content above</li>
              <li>Replace content in <code>public/student-list.csv</code></li>
              <li>Replace content in <code>docs/student-list.csv</code></li>
              <li>Commit and push to Git</li>
            </ol>
          </div>
        </div>
      </div>

      <!-- New Manual Entry Form Section -->
      <div class="manual-entry-section">
        <h3>✏️ Tambah Data Kehadiran Manual</h3>
        <form @submit.prevent="addAttendanceRecord" class="attendance-form">
          <div class="form-row">
            <div class="form-group">
              <label for="studentName">Nama Pelajar:</label>
              <select 
                id="studentName"
                v-model="newRecord.name" 
                @change="onStudentChange"
                required
              >
                <option value="">Pilih pelajar</option>
                <option v-for="student in studentList" :key="student.name" :value="student.name">
                  {{ student.name }} ({{ student.type }} - {{ student.type === 'iqra' ? 'Tahap ' + student.stage : 'Stage ' + student.stage }})
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="attendanceDate">Tarikh:</label>
              <input 
                type="date" 
                id="attendanceDate"
                v-model="newRecord.date" 
                required
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="studyType">Jenis Pembelajaran:</label>
              <select 
                id="studyType"
                v-model="newRecord.type" 
                @change="onTypeChange"
                required
              >
                <option value="">Pilih jenis</option>
                <option value="Iqra">Iqra</option>
                <option value="Quran">Quran</option>
              </select>
            </div>

            <div class="form-group" v-if="newRecord.type === 'Iqra'">
              <label for="iqraStage">Tahap Iqra:</label>
              <select id="iqraStage" v-model="newRecord.stage" required>
                <option value="">Pilih tahap</option>
                <option v-for="stage in [1,2,3,4,5,6]" :key="stage" :value="stage">
                  Tahap {{ stage }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="newRecord.type === 'Quran'">
              <label for="quranStage">Tahap Quran:</label>
              <select 
                id="quranStage" 
                v-model="newRecord.stage" 
                @change="onQuranStageChange"
                required
              >
                <option value="">Pilih tahap</option>
                <option value="1">Juzuk 1-30 (Penuh)</option>
                <option value="surah">Surah Pendek (Juzuk 30)</option>
              </select>
            </div>

            <div class="form-group" v-if="newRecord.type === 'Quran' && newRecord.stage === 'surah'">
              <label for="surahName">Nama Surah:</label>
              <select id="surahName" v-model="newRecord.surahName" required>
                <option value="">Pilih surah</option>
                <option v-for="surah in surahList" :key="surah.name" :value="surah.name">
                  {{ surah.number }}. {{ surah.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="pages">Bilangan Halaman:</label>
              <input 
                type="number" 
                id="pages"
                v-model.number="newRecord.pages" 
                min="1"
                required
                placeholder="0"
              >
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="!isFormValid">
              ➕ Tambah Rekod
            </button>
            <button type="button" @click="resetForm" class="reset-btn">
              🔄 Reset
            </button>
          </div>
        </form>

        <!-- Attendance CSV Output Display -->
        <div v-if="showAttendanceCsvOutput" class="csv-output-section">
          <h4>📄 Updated Attendance CSV Content</h4>
          <p>Copy this content and replace your sample-attendance.csv files in both /public and /docs folders:</p>
          
          <div class="csv-content">
            <pre>{{ attendanceCsvOutput }}</pre>
          </div>
          
          <div class="csv-actions">
            <button @click="copyAttendanceCsvToClipboard" class="copy-btn">
              📋 Copy to Clipboard
            </button>
            <button @click="closeAttendanceCsvOutput" class="close-btn">
              ❌ Close
            </button>
          </div>
          
          <div class="csv-instructions">
            <p><strong>Steps to update:</strong></p>
            <ol>
              <li>Copy the attendance content above</li>
              <li>Replace content in <code>public/sample-attendance.csv</code></li>
              <li>Replace content in <code>docs/sample-attendance.csv</code></li>
              <li>Commit and push to Git</li>
            </ol>
          </div>
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
      uploadedData: [],
      studentList: [],
      csvOutput: '',
      showCsvOutput: false,
      attendanceCsvOutput: '',
      showAttendanceCsvOutput: false,
      newRecord: {
        name: '',
        date: '',
        type: '',
        stage: '',
        surahName: '',
        pages: null
      },
      newStudent: {
        name: '',
        type: '',
        stage: ''
      },
      surahList: [
        {number: 78, pages: 78, name: 'Al-Naba'},
        {number: 79, pages: 79, name: 'Al-Nazaat'},
        {number: 80, pages: 80, name: 'Abasa'},
        {number: 81, pages: 81, name: 'At-Takwir'},
        {number: 82, pages: 82, name: 'Al-Infitar'},
        {number: 83, pages: 83, name: 'Al-Mutaffifin'},
        {number: 84, pages: 84, name: 'Al-Inshiqaq'},
        {number: 85, pages: 85, name: 'Al-Burooj'},
        {number: 86, pages: 86, name: 'At-Tariq'},
        {number: 87, pages: 87, name: 'Al-Ala'},
        {number: 88, pages: 88, name: 'Al-Ghashiya'},
        {number: 89, pages: 89, name: 'Al-Fajr'},
        {number: 90, pages: 90, name: 'Al-Balad'},
        {number: 91, pages: 91, name: 'Ash-Shams'},
        {number: 92, pages: 92, name: 'Al-Lail'},
        {number: 93, pages: 93, name: 'Ad-Dhuha'},
        {number: 94, pages: 94, name: 'Al-Sharh'},
        {number: 95, pages: 95, name: 'At-Tin'},
        {number: 96, pages: 96, name: 'Al-Alaq'},
        {number: 97, pages: 97, name: 'Al-Qadr'},
        {number: 98, pages: 98, name: 'Al-Bayyina'},
        {number: 99, pages: 99, name: 'Al-Zalzala'},
        {number: 100, pages: 100, name: 'Al-Adiyat'},
        {number: 101, pages: 101, name: 'Al-Qaria'},
        {number: 102, pages: 102, name: 'At-Takathur'},
        {number: 103, pages: 103, name: 'Al-Asr'},
        {number: 104, pages: 104, name: 'Al-Humaza'},
        {number: 105, pages: 105, name: 'Al-Fil'},
        {number: 106, pages: 106, name: 'Quraish'},
        {number: 107, pages: 107, name: 'Al-Maun'},
        {number: 108, pages: 108, name: 'Al-Kauther'},
        {number: 109, pages: 109, name: 'Al-Kafiroon'},
        {number: 110, pages: 110, name: 'An-Nasr'},
        {number: 111, pages: 111, name: 'Al-Masadd'},
        {number: 112, pages: 112, name: 'Al-Ikhlas'},
        {number: 113, pages: 113, name: 'Al-Falaq'},
        {number: 114, pages: 114, name: 'An-Nas'}
      ]
    }
  },
  computed: {
    isFormValid() {
      const baseValid = this.newRecord.name && this.newRecord.date && this.newRecord.type && this.newRecord.pages;
      
      if (!baseValid) return false;
      
      // For Iqra and Quran stage 1, just need stage number
      if (this.newRecord.type === 'Iqra' || (this.newRecord.type === 'Quran' && this.newRecord.stage === '1')) {
        return !!this.newRecord.stage;
      }
      
      // For Quran Surahs, need both stage='surah' and surahName
      if (this.newRecord.type === 'Quran' && this.newRecord.stage === 'surah') {
        return !!this.newRecord.surahName;
      }
      
      return !!this.newRecord.stage;
    },
    selectedStudentInfo() {
      const student = this.studentList.find(s => s.name === this.newRecord.name);
      return student || null;
    }
  },
  methods: {
    async loadStudentList() {
      try {
        const response = await fetch('./student-list.csv');
        const csvContent = await response.text();
        this.parseStudentListCSV(csvContent);
      } catch (error) {
        console.error('Error loading student list:', error);
      }
    },
    parseStudentListCSV(csvContent) {
      const lines = csvContent.trim().split('\n');
      this.studentList = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 2) {
          this.studentList.push({
            name: values[0],
            type: values[1],
            stage: values[2] || ''
          });
        }
      }
    },
    addStudent() {
      if (!this.newStudent.name || !this.newStudent.type || !this.newStudent.stage) return;
      
      // Check if student already exists
      const existingStudent = this.studentList.find(s => s.name === this.newStudent.name);
      if (existingStudent) {
        alert('Pelajar dengan nama ini sudah ada!');
        return;
      }
      
      // Add student to list
      this.studentList.push({
        name: this.newStudent.name,
        type: this.newStudent.type,
        stage: this.newStudent.stage
      });
      
      // Automatically save to CSV
      this.saveStudentListCSV();
      
      // Reset form
      this.newStudent = {
        name: '',
        type: '',
        stage: ''
      };
      
      alert('Pelajar berjaya ditambah ke senarai dan CSV telah dikemas kini!');
    },
    copyCsvToClipboard() {
      navigator.clipboard.writeText(this.csvOutput).then(() => {
        alert('CSV content telah disalin ke clipboard!');
      });
    },
    closeCsvOutput() {
      this.showCsvOutput = false;
    },
    saveStudentListCSV() {
      if (this.studentList.length === 0) return;
      
      let csvContent = 'name,type,stage\n';
      
      this.studentList.forEach(student => {
        csvContent += `${student.name},${student.type},${student.stage}\n`;
      });
      
      // Store CSV content to display to user
      this.csvOutput = csvContent;
      this.showCsvOutput = true;
    },
    removeStudent(index) {
      if (confirm('Adakah anda pasti untuk memadamkan pelajar ini?')) {
        this.studentList.splice(index, 1);
        // Auto-save updated list
        this.saveStudentListCSV();
      }
    },
    onNewStudentTypeChange() {
      // Reset stage when type changes
      this.newStudent.stage = '';
    },
    onStudentChange() {
      if (this.selectedStudentInfo) {
        // Auto-fill type and stage based on selected student
        this.newRecord.type = this.selectedStudentInfo.type;
        if (this.selectedStudentInfo.stage) {
          this.newRecord.stage = this.selectedStudentInfo.stage;
        }
      }
    },
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
        if (values.length >= 4) {
          // Handle stage: if it's a number, parse it; if it's a string (Surah name), keep as string
          let stage = values[3];
          if (!isNaN(stage)) {
            stage = parseInt(stage) || 1;
          }
          
          this.uploadedData.push({
            name: values[0],
            date: values[1],
            type: values[2],
            stage: stage,
            pages: values[4] || ''
          });
        }
      }
      
      // Sort by date
      this.uploadedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    downloadCSV() {
      this.generateAttendanceCsv();
    },
    clearData() {
      this.uploadedData = [];
      this.showAttendanceCsvOutput = false;
      this.attendanceCsvOutput = '';
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    getStatusClass(type) {
      if (type === 'Iqra') return 'iqra';
      if (type === 'Quran') return 'quran';
      return '';
    },
    onTypeChange() {
      // Reset stage and surah when type changes
      this.newRecord.stage = '';
      this.newRecord.surahName = '';
    },
    onQuranStageChange() {
      // Reset surah name when Quran stage changes
      if (this.newRecord.stage !== 'surah') {
        this.newRecord.surahName = '';
      }
    },
    addAttendanceRecord() {
      if (!this.isFormValid) return;
      
      // Determine the final stage value
      let finalStage = this.newRecord.stage;
      if (this.newRecord.type === 'Quran' && this.newRecord.stage === 'surah') {
        finalStage = this.newRecord.surahName;
      }
      
      // Create the new record
      const newRecord = {
        name: this.newRecord.name,
        date: this.newRecord.date,
        type: this.newRecord.type,
        stage: finalStage,
        pages: this.newRecord.pages
      };
      
      // Add to uploaded data
      this.uploadedData.push(newRecord);
      
      // Sort by date
      this.uploadedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Generate attendance CSV content
      this.generateAttendanceCsv();
      
      // Reset form
      this.resetForm();
      
      // Show success message
      alert('Rekod kehadiran berjaya ditambah!');
    },
    generateAttendanceCsv() {
      if (this.uploadedData.length === 0) return;
      
      let csvContent = 'name,date,type,stage,pages\n';
      
      this.uploadedData.forEach(record => {
        csvContent += `${record.name},${record.date},${record.type},${record.stage},${record.pages}\n`;
      });
      
      // Store attendance CSV content to display to user
      this.attendanceCsvOutput = csvContent;
      this.showAttendanceCsvOutput = true;
    },
    copyAttendanceCsvToClipboard() {
      navigator.clipboard.writeText(this.attendanceCsvOutput).then(() => {
        alert('Attendance CSV content telah disalin ke clipboard!');
      });
    },
    closeAttendanceCsvOutput() {
      this.showAttendanceCsvOutput = false;
    },
    resetForm() {
      this.newRecord = {
        name: '',
        date: '',
        type: '',
        stage: '',
        surahName: '',
        pages: null
      };
    }
  },
  mounted() {
    this.loadStudentList();
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

.upload-section, .instructions-section, .csv-format-section, .manual-entry-section, .student-list-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.upload-section h3, .instructions-section h3, .csv-format-section h3, .manual-entry-section h3, .student-list-section h3 {
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

.manual-entry-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
}

.attendance-form {
  display: grid;
  gap: 20px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.form-group {
  flex: 1;
  min-width: 250px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

input[type="text"],
input[type="date"],
input[type="number"],
select {
  width: 100%;
  padding: 10px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
  color: white;
  font-size: 14px;
}

input[type="text"]:focus,
input[type="date"]:focus,
input[type="number"]:focus,
select:focus {
  border-color: rgba(76,175,80,1);
  outline: none;
}

.submit-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(76,175,80,0.3);
  color: white;
}

.submit-btn:hover {
  background: rgba(76,175,80,0.5);
}

.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(244,67,54,0.3);
  color: white;
}

.reset-btn:hover {
  background: rgba(244,67,54,0.5);
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

/* Manual Entry Form Styles */
.manual-entry-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.manual-entry-section h3 {
  margin-top: 0;
  color: #4CAF50;
  font-size: 1.5rem;
}

.attendance-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: bold;
  color: rgba(255,255,255,0.9);
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #4CAF50;
  background: rgba(255,255,255,0.15);
}

.form-group input::placeholder {
  color: rgba(255,255,255,0.6);
}

.form-group select option {
  background: #2c3e50;
  color: white;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-start;
  margin-top: 10px;
}

.submit-btn,
.reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn {
  background: #4CAF50;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  background: rgba(255,255,255,0.2);
  cursor: not-allowed;
  color: rgba(255,255,255,0.5);
}

.reset-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 2px solid rgba(255,255,255,0.3);
}

.reset-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Student List Section Styles */
.student-list-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.student-list-section h3 {
  margin-top: 0;
  color: #2196F3;
  font-size: 1.5rem;
}

.student-form {
  background: rgba(255,255,255,0.05);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.student-form h4 {
  margin-top: 0;
  color: rgba(255,255,255,0.9);
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.student-list-preview {
  margin-top: 20px;
}

.student-list-preview h4 {
  color: #2196F3;
  margin-bottom: 15px;
}

.student-table {
  overflow-x: auto;
  margin: 20px 0;
}

.remove-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: rgba(244,67,54,0.3);
  color: white;
  border: 1px solid rgba(244,67,54,0.5);
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: rgba(244,67,54,0.5);
}

.status-badge.iqra {
  background: rgba(76,175,80,0.3);
}

.status-badge.quran {
  background: rgba(33,150,243,0.3);
}

/* CSV Output Section */
.csv-output-section {
  background: rgba(255,193,7,0.1);
  border: 2px solid rgba(255,193,7,0.3);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.csv-output-section h4 {
  color: #FFC107;
  margin-top: 0;
}

.csv-content {
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
  max-height: 300px;
  overflow-y: auto;
}

.csv-content pre {
  color: white;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
}

.csv-actions {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.copy-btn, .close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.copy-btn {
  background: rgba(76,175,80,0.3);
  color: white;
  border: 1px solid rgba(76,175,80,0.5);
}

.copy-btn:hover {
  background: rgba(76,175,80,0.5);
}

.close-btn {
  background: rgba(244,67,54,0.3);
  color: white;
  border: 1px solid rgba(244,67,54,0.5);
}

.close-btn:hover {
  background: rgba(244,67,54,0.5);
}

.csv-instructions {
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  padding: 15px;
  margin-top: 15px;
}

.csv-instructions ol {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.csv-instructions li {
  margin-bottom: 5px;
}

.csv-instructions code {
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>
