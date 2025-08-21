<template>
  <div class="parent-app">
    <header class="header">
      <h1>🕌 Kelas Ngaji Albiruni</h1>
      <h2>📊 Kehadiran Pelajar</h2>
    </header>

    <div class="loading" v-if="isLoading">
      <p>📥 Memuat data kehadiran...</p>
    </div>

    <div v-if="error" class="error-message">
      <p>❌ {{ error }}</p>
    </div>

    <div v-if="students.length > 0" class="calendar-container">
      <div class="controls">
        <div class="month-nav">
          <button @click="previousMonth" class="nav-btn">‹ Bulan Sebelumnya</button>
          <span class="current-month">{{ currentMonthYear }}</span>
          <button @click="nextMonth" class="nav-btn">Bulan Berikutnya ›</button>
        </div>
      </div>

      <div class="calendar">
        <div class="calendar-header">
          <div class="day-header" v-for="day in dayHeaders" :key="day">
            {{ day }}
          </div>
        </div>
        
        <div class="calendar-grid">
          <div 
            v-for="date in calendarDates" 
            :key="date.key"
            :class="['calendar-day', { 
              'other-month': date.otherMonth,
              'today': date.isToday,
              'has-attendance': date.hasAttendance,
              'isClassDay': date.isClassDay
            }]"
          >
            <div class="date-number">{{ date.day }}</div>
            
            <!-- Class day logic -->
            <div v-if="date.isClassDay" class="class-info">
              <!-- No attendance records - class canceled (only for past dates) -->
              <div v-if="date.attendanceData.length === 0 && date.date <= new Date()" class="class-status canceled">
                <div class="status-text">Kelas Dibatalkan</div>
                <div class="status-text">/ Tiada Rekod</div>
              </div>
              
              <!-- Has attendance records - show present and absent -->
              <div v-else-if="date.attendanceData.length > 0" class="attendance-summary">
                <div class="attendance-count">
                  {{ date.attendanceData.length }}/{{ registeredStudents.length }} hadir
                </div>
                
                <!-- Present students -->
                <div class="attendance-details">
                  <div 
                    v-for="record in date.attendanceData.slice(0, Math.min(date.attendanceData.length, 5))" 
                    :key="record.name"
                    :class="['attendance-item', getAttendanceTypeClass(record.type)]"
                    :title="`${record.name}: ${record.type} ${getStageText(record.type, record.stage)} - halaman ${record.pages}`"
                  >
                    {{ record.name.split(' ')[0] }} {{ getShortStageText(record.type, record.stage, record.pages) }}
                  </div>
                  
                  <!-- Absent students -->
                  <div 
                    v-for="absentStudent in getAbsentStudents(date.attendanceData).slice(0, Math.max(0, 5 - Math.min(date.attendanceData.length, 5)))"
                    :key="'absent-' + absentStudent.name"
                    class="attendance-item absent"
                    :title="`${absentStudent.name}: Tidak Hadir`"
                  >
                    {{ absentStudent.name.split(' ')[0] }} ✗
                  </div>
                  
                  <!-- More indicator -->
                  <div v-if="(date.attendanceData.length + getAbsentStudents(date.attendanceData).length) > 5" class="more-indicator">
                    +{{ (date.attendanceData.length + getAbsentStudents(date.attendanceData).length) - 5 }} lagi
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Non-class day with attendance (weekend makeup classes etc) -->
            <div v-else-if="date.attendanceData.length > 0" class="attendance-summary">
              <div class="attendance-count">
                {{ date.attendanceData.length }} pelajar
              </div>
              <div class="attendance-details">
                <div 
                  v-for="record in date.attendanceData.slice(0, 5)" 
                  :key="record.name"
                  :class="['attendance-item', getAttendanceTypeClass(record.type)]"
                  :title="`${record.name}: ${record.type} ${getStageText(record.type, record.stage)} - halaman ${record.pages}`"
                >
                  {{ record.name.split(' ')[0] }} {{ getShortStageText(record.type, record.stage, record.pages) }}
                </div>
                <div v-if="date.attendanceData.length > 5" class="more-indicator">
                  +{{ date.attendanceData.length - 5 }} lagi
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-section">
        <h3>📈 Ringkasan Bulanan</h3>
        <div class="summary-stats">
          <div class="stat-card">
            <h4>Total Kehadiran</h4>
            <p class="stat-number">{{ monthlyStats.total }}</p>
          </div>
          <div class="stat-card iqra">
            <h4>Iqra</h4>
            <p class="stat-number">{{ monthlyStats.iqra }}</p>
          </div>
          <div class="stat-card quran">
            <h4>Quran</h4>
            <p class="stat-number">{{ monthlyStats.quran }}</p>
          </div>
        </div>

        <div class="student-list">
          <h4>👥 Kehadiran Pelajar Bulan Ini</h4>
          <div class="student-grid">
            <div 
              v-for="student in uniqueStudentsThisMonth" 
              :key="student.name"
              class="student-card"
            >
              <div class="student-name">{{ student.name }}</div>
              <div class="student-stats">
                <div class="student-progress">
                  <span class="stat-type">{{ student.type }}</span>
                  <span class="stat-stage">{{ getStageText(student.type, student.currentStage) }}</span>
                  <span class="stat-pages">{{ getPageDisplayText(student.type, student.currentStage, student.currentPage) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="admin-link" v-if="isLocalhost">
      <a href="/kelas-ngaji-albiruni/admin" class="admin-button">🔧 Admin</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ParentView',
  data() {
    return {
      students: [],
      registeredStudents: [], // Added to store student list
      currentDate: new Date(),
      dayHeaders: ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'],
      isLoading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadStudentList();
    await this.loadAttendanceData();
  },
  computed: {
    currentMonthYear() {
      const malayMonths = [
        'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
        'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
      ];
      const month = malayMonths[this.currentDate.getMonth()];
      const year = this.currentDate.getFullYear();
      return `${month} ${year}`;
    },
    calendarDates() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const dates = [];
      const today = new Date();
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Format date as YYYY-MM-DD in local timezone to match CSV format
        const dateYear = date.getFullYear();
        const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
        const dateDay = String(date.getDate()).padStart(2, '0');
        const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
        const attendanceData = this.students.filter(s => s.date === dateString)
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
        
        dates.push({
          key: dateString,
          day: date.getDate(),
          date: date,
          otherMonth: date.getMonth() !== month,
          isToday: date.toDateString() === today.toDateString(),
          hasAttendance: attendanceData.length > 0,
          attendanceData: attendanceData,
          isClassDay: this.isClassDay(date), // Added class day check
          dayOfWeek: date.getDay() // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday
        });
      }
      
      return dates;
    },
    monthlyStats() {
      const currentMonth = this.currentDate.getMonth();
      const currentYear = this.currentDate.getFullYear();
      
      const monthlyData = this.students.filter(s => {
        const recordDate = new Date(s.date);
        return recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
      });
      
      return {
        total: monthlyData.length,
        iqra: monthlyData.filter(s => s.type === 'Iqra').length,
        quran: monthlyData.filter(s => s.type === 'Quran').length
      };
    },
    uniqueStudentsThisMonth() {
      const currentMonth = this.currentDate.getMonth();
      const currentYear = this.currentDate.getFullYear();
      
      const monthlyData = this.students.filter(s => {
        const recordDate = new Date(s.date);
        return recordDate.getMonth() === currentMonth && 
               recordDate.getFullYear() === currentYear;
      });
      
      const studentMap = {};
      
      monthlyData.forEach(record => {
        if (!studentMap[record.name]) {
          studentMap[record.name] = {
            name: record.name,
            type: record.type,
            currentStage: record.stage,
            currentPage: record.pages,
            sessions: 0,
            latestDate: record.date
          };
        }
        
        studentMap[record.name].sessions++;
        
        // Keep track of the latest record to get current page and stage
        if (record.date >= studentMap[record.name].latestDate) {
          studentMap[record.name].latestDate = record.date;
          studentMap[record.name].currentPage = record.pages;
          studentMap[record.name].currentStage = record.stage;
        }
      });
      
      return Object.values(studentMap).sort((a, b) => a.name.localeCompare(b.name));
    },
    isLocalhost() {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' || 
             window.location.hostname === '';
    }
  },
  methods: {
    async loadStudentList() {
      try {
        const response = await fetch('./student-list.csv');
        if (!response.ok) {
          throw new Error('Failed to load student list');
        }
        
        const csvContent = await response.text();
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        this.registeredStudents = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= 3) {
            this.registeredStudents.push({
              name: values[0],
              type: values[1],
              stage: values[2]
            });
          }
        }
        
        console.log('Student list loaded:', this.registeredStudents);
      } catch (err) {
        console.error('Error loading student list:', err);
      }
    },
    isClassDay(date) {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3; // Monday, Tuesday, Wednesday
    },
    getAbsentStudents(attendanceData) {
      const presentStudentNames = attendanceData.map(record => record.name);
      return this.registeredStudents.filter(student => 
        !presentStudentNames.includes(student.name)
      ).sort((a, b) => a.name.localeCompare(b.name)); // Sort absent students alphabetically
    },
    async loadAttendanceData() {
      try {
        this.isLoading = true;
        this.error = null;
        
        // Load the attendance data from the sample CSV file
        const response = await fetch('./sample-attendance.csv');
        if (!response.ok) {
          throw new Error('Gagal memuat data kehadiran');
        }
        
        const csvContent = await response.text();
        this.parseCSV(csvContent);
        console.log('Attendance data loaded successfully:', this.students);
        
      } catch (err) {
        this.error = 'Gagal memuat data kehadiran. Pastikan file CSV tersedia.';
        console.error('Error loading attendance data:', err);
      } finally {
        this.isLoading = false;
      }
    },
    parseCSV(csvContent) {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      this.students = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 4) {
          // Handle stage: if it's a number, parse it; if it's a string (Surah name), keep as string
          let stage = values[3];
          if (!isNaN(stage)) {
            stage = parseInt(stage) || 1;
          }
          
          this.students.push({
            name: values[0],
            date: values[1],
            type: values[2],
            stage: stage,
            pages: parseInt(values[4]) || 0
          });
        }
      }
      
      // Sort by date
      this.students.sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    },
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    },
    getAttendanceTypeClass(type) {
      if (type === 'Iqra') return 'iqra';
      if (type === 'Quran') return 'quran';
      return '';
    },
    getStageText(type, stage) {
      if (type === 'Iqra') {
        return `Tahap ${stage}`;
      } else if (type === 'Quran') {
        if (stage === 1) return 'Juzuk 1-30';
        // If stage is a Surah name (string), return it as is
        if (isNaN(stage)) return `Surah ${stage}`;
        return 'Juzuk 30';
      }
      return '';
    },
    getShortStageText(type, stage, pages = 0) {
      if (type === 'Iqra') {
        return pages > 0 ? `I${stage} - ${pages}` : `I${stage}`;
      } else if (type === 'Quran') {
        if (stage === 1) {
          // Stage 1 = Juz 1-30, show page number
          return pages > 0 ? `Q1 - ${pages}` : 'Q1';
        } else {
          // Stage 2 = Surah names, show surah name (not pages)
          if (isNaN(stage)) {
            return `Q2 - ${stage}`;
          }
          return pages > 0 ? `Q30 - ${pages}` : 'Q30';
        }
      }
      return '';
    },
    getPageDisplayText(type, stage, pages) {
      if (type === 'Quran' && isNaN(stage)) {
        // Quran Stage 2 (Surah names) - show "surah ke-XX"
        return `surah ke-${pages}`;
      } else {
        // Iqra and Quran Stage 1 - show "halaman XX"
        return `halaman ${pages}`;
      }
    },
    updateStatTypeStyles() {
      this.$nextTick(() => {
        const statTypes = document.querySelectorAll('.stat-type');
        statTypes.forEach(element => {
          if (element.textContent.includes('Iqra')) {
            element.style.background = 'rgba(76,175,80,0.3)';
            element.style.color = '#4CAF50';
          } else if (element.textContent.includes('Quran')) {
            element.style.background = 'rgba(33,150,243,0.3)';
            element.style.color = '#2196F3';
          }
        });
      });
    }
  }
}
</script>

<style>
.parent-app {
  min-height: 100vh;
  padding: 20px;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.header h2 {
  margin: 10px 0 0 0;
  font-size: 1.5rem;
  font-weight: normal;
  opacity: 0.9;
}

.loading, .error-message {
  text-align: center;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 600px;
}

.error-message {
  background: rgba(244,67,54,0.2);
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 30px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255,255,255,0.3);
}

.current-month {
  font-size: 18px;
  font-weight: bold;
  min-width: 200px;
  text-align: center;
}

.calendar-container {
  max-width: 1200px;
  margin: 0 auto;
}

.calendar {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 10px;
}

.day-header {
  text-align: center;
  padding: 15px;
  font-weight: bold;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
}

.calendar-day {
  background: rgba(255,255,255,0.05);
  min-height: 120px;
  padding: 8px;
  border-radius: 6px;
  position: relative;
  transition: all 0.3s ease;
}

.calendar-day:hover {
  background: rgba(255,255,255,0.15);
  transform: scale(1.02);
}

.calendar-day.other-month {
  opacity: 0.3;
}

.calendar-day.today {
  background: rgba(255,215,0,0.2);
  border: 2px solid rgba(255,215,0,0.5);
}

.calendar-day.has-attendance {
  background: rgba(76,175,80,0.2);
}

.calendar-day.isClassDay {
  border-left: 4px solid rgba(255,193,7,0.6);
}

.class-info {
  font-size: 12px;
}

.class-status.canceled {
  background: rgba(244,67,54,0.2);
  padding: 4px;
  border-radius: 4px;
  text-align: center;
  margin-top: 4px;
}

.status-text {
  font-size: 10px;
  font-weight: bold;
  color: rgba(255,255,255,0.9);
}

.attendance-item.absent {
  background: rgba(244,67,54,0.2);
  border-left: 3px solid #f44336;
  color: rgba(255,255,255,0.8);
}

.date-number {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
}

.attendance-summary {
  font-size: 12px;
}

.attendance-count {
  font-weight: bold;
  margin-bottom: 4px;
  color: rgba(255,255,255,0.8);
}

.attendance-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.attendance-item {
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 11px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.attendance-item.iqra {
  background: rgba(76,175,80,0.3);
  border-left: 3px solid #4CAF50;
}

.attendance-item.quran {
  background: rgba(33,150,243,0.3);
  border-left: 3px solid #2196F3;
}

.more-indicator {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  margin-top: 2px;
}

.summary-section {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 30px;
  backdrop-filter: blur(10px);
  margin-bottom: 30px;
}

.summary-section h3 {
  margin-top: 0;
  text-align: center;
  font-size: 1.5rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-card.iqra {
  background: rgba(76,175,80,0.2);
  border-left: 4px solid #4CAF50;
}

.stat-card.quran {
  background: rgba(33,150,243,0.2);
  border-left: 4px solid #2196F3;
}

.stat-card h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  opacity: 0.8;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.student-list h4 {
  margin-bottom: 20px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.student-card {
  background: rgba(255,255,255,0.1);
  padding: 15px;
  border-radius: 8px;
}

.student-name {
  font-weight: bold;
  margin-bottom: 8px;
}

.student-stats {
  display: flex;
  gap: 10px;
}

.student-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-type {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.student-card .stat-type {
  background: rgba(255,255,255,0.2);
  color: white;
}

.stat-stage {
  font-size: 11px;
  color: rgba(255,255,255,0.8);
}

.stat-pages {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
}

.admin-link {
  text-align: center;
  margin-top: 30px;
}

.admin-button {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  display: inline-block;
}

.admin-button:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .month-nav {
    justify-content: center;
  }
  
  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }
  
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .student-grid {
    grid-template-columns: 1fr;
  }
}
</style>
