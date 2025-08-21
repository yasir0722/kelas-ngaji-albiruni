<template>
  <div class="app">
    <header class="header">
      <h1>🕌 Kelas Ngaji Albiruni</h1>
      <h2>📊 Student Attendance Calendar</h2>
    </header>

    <div class="controls">
      <input 
        type="file" 
        @change="handleFileUpload" 
        accept=".csv"
        ref="fileInput"
        class="file-input"
      >
      <button @click="triggerFileInput" class="upload-btn">
        📁 Upload CSV File
      </button>
      
      <div class="month-nav">
        <button @click="previousMonth" class="nav-btn">‹ Previous</button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button @click="nextMonth" class="nav-btn">Next ›</button>
      </div>
    </div>

    <div v-if="students.length === 0" class="upload-prompt">
      <p>Please upload a CSV file with the following format:</p>
      <code>name,date,type,pages</code>
      <p>Example: Ahmad,2025-08-15,Hadir,10</p>
    </div>

    <div v-if="students.length > 0" class="calendar-container">
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
              'has-attendance': date.hasAttendance
            }]"
          >
            <div class="date-number">{{ date.day }}</div>
            <div v-if="date.attendanceData.length > 0" class="attendance-summary">
              <div class="attendance-count">
                {{ date.attendanceData.length }} students
              </div>
              <div class="attendance-details">
                <div 
                  v-for="record in date.attendanceData.slice(0, 3)" 
                  :key="record.name"
                  :class="['attendance-item', getAttendanceTypeClass(record.type)]"
                  :title="`${record.name}: ${record.type}${record.pages ? ' (' + record.pages + ' pages)' : ''}`"
                >
                  {{ record.name.split(' ')[0] }}
                </div>
                <div v-if="date.attendanceData.length > 3" class="more-indicator">
                  +{{ date.attendanceData.length - 3 }} more
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="summary-section">
        <h3>📈 Monthly Summary</h3>
        <div class="summary-stats">
          <div class="stat-card">
            <h4>Total Records</h4>
            <p class="stat-number">{{ monthlyStats.total }}</p>
          </div>
          <div class="stat-card present">
            <h4>Present (Hadir)</h4>
            <p class="stat-number">{{ monthlyStats.hadir }}</p>
          </div>
          <div class="stat-card absent">
            <h4>Absent (Tidak Hadir)</h4>
            <p class="stat-number">{{ monthlyStats.tidakHadir }}</p>
          </div>
          <div class="stat-card late">
            <h4>Late (Terlambat)</h4>
            <p class="stat-number">{{ monthlyStats.terlambat }}</p>
          </div>
        </div>

        <div class="student-list">
          <h4>👥 Students This Month</h4>
          <div class="student-grid">
            <div 
              v-for="student in uniqueStudentsThisMonth" 
              :key="student.name"
              class="student-card"
            >
              <div class="student-name">{{ student.name }}</div>
              <div class="student-stats">
                <span class="stat present">{{ student.hadir }}</span>
                <span class="stat absent">{{ student.tidakHadir }}</span>
                <span class="stat late">{{ student.terlambat }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      students: [],
      currentDate: new Date(),
      dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  computed: {
    currentMonthYear() {
      return this.currentDate.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
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
        
        const dateString = date.toISOString().split('T')[0];
        const attendanceData = this.students.filter(s => s.date === dateString);
        
        dates.push({
          key: dateString,
          day: date.getDate(),
          date: date,
          otherMonth: date.getMonth() !== month,
          isToday: date.toDateString() === today.toDateString(),
          hasAttendance: attendanceData.length > 0,
          attendanceData: attendanceData
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
        hadir: monthlyData.filter(s => s.type === 'Hadir').length,
        tidakHadir: monthlyData.filter(s => s.type === 'Tidak Hadir').length,
        terlambat: monthlyData.filter(s => s.type === 'Terlambat').length
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
            hadir: 0,
            tidakHadir: 0,
            terlambat: 0
          };
        }
        
        if (record.type === 'Hadir') studentMap[record.name].hadir++;
        else if (record.type === 'Tidak Hadir') studentMap[record.name].tidakHadir++;
        else if (record.type === 'Terlambat') studentMap[record.name].terlambat++;
      });
      
      return Object.values(studentMap).sort((a, b) => a.name.localeCompare(b.name));
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
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
      
      this.students = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
          this.students.push({
            name: values[0],
            date: values[1],
            type: values[2],
            pages: values[3] || ''
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
      if (type === 'Hadir') return 'present';
      if (type === 'Tidak Hadir') return 'absent';
      if (type === 'Terlambat') return 'late';
      return '';
    }
  }
}
</script>

<style>
.app {
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

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.file-input {
  display: none;
}

.upload-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.3);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
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

.upload-prompt {
  text-align: center;
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 12px;
  margin: 40px auto;
  max-width: 600px;
}

.upload-prompt code {
  background: rgba(0,0,0,0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
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

.attendance-item.present {
  background: rgba(76,175,80,0.3);
}

.attendance-item.absent {
  background: rgba(244,67,54,0.3);
}

.attendance-item.late {
  background: rgba(255,152,0,0.3);
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

.stat-card.present {
  background: rgba(76,175,80,0.2);
}

.stat-card.absent {
  background: rgba(244,67,54,0.2);
}

.stat-card.late {
  background: rgba(255,152,0,0.2);
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

.stat {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stat.present {
  background: rgba(76,175,80,0.3);
}

.stat.absent {
  background: rgba(244,67,54,0.3);
}

.stat.late {
  background: rgba(255,152,0,0.3);
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
