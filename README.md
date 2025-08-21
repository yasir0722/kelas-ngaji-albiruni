# Kelas Ngaji Albiruni - Attendance Calendar

A Vue.js web application for tracking student attendance in a beautiful calendar view. This application runs entirely on the frontend and loads attendance data from CSV files.

## 🌟 Features

- **Calendar View**: Beautiful calendar interface showing attendance data
- **CSV Import**: Load attendance data from CSV files (no backend required)
- **Monthly Statistics**: View attendance summaries and statistics
- **Student Overview**: Individual student attendance tracking
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Ready**: Easily deployable to GitHub Pages

## 📊 CSV Format

The application expects CSV files with the following format:

```csv
name,date,type,pages
Ahmad Zaki,2025-08-01,Hadir,15
Fatimah Sari,2025-08-01,Hadir,12
Muhammad Ali,2025-08-01,Terlambat,8
Hassan Ibrahim,2025-08-01,Tidak Hadir,
```

### CSV Fields:
- **name**: Student's full name
- **date**: Attendance date (YYYY-MM-DD format)
- **type**: Attendance type (Hadir, Tidak Hadir, Terlambat)
- **pages**: Number of pages read (optional)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yasir0722/kelas-ngaji-albiruni.git
cd kelas-ngaji-albiruni
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🌐 Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup Steps:

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Update Repository Name**:
   - Edit `vite.config.js` and update the `base` property with your repository name:
   ```javascript
   base: '/your-repository-name/'
   ```

3. **Push to Main Branch**:
   - The GitHub Actions workflow will automatically build and deploy your app
   - Your app will be available at: `https://yourusername.github.io/your-repository-name/`

## 📱 How to Use

1. **Upload CSV File**: Click the "Upload CSV File" button and select your attendance data file
2. **Navigate Months**: Use the Previous/Next buttons to view different months
3. **View Details**: 
   - Hover over calendar days to see attendance details
   - Check the monthly summary for statistics
   - Review individual student performance in the student list

## 🎨 Attendance Types

- **🟢 Hadir (Present)**: Student attended the class
- **🔴 Tidak Hadir (Absent)**: Student was absent
- **🟡 Terlambat (Late)**: Student arrived late

## 📂 Project Structure

```
kelas-ngaji-albiruni/
├── src/
│   ├── App.vue          # Main application component
│   └── main.js          # Application entry point
├── .github/
│   └── workflows/
│       └── deploy.yml   # GitHub Actions deployment workflow
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── sample-attendance.csv # Sample data file
```

## 🛠️ Technologies Used

- **Vue.js 3**: Progressive JavaScript framework
- **Vite**: Fast build tool and development server
- **CSS3**: Modern styling with gradients and animations
- **GitHub Actions**: Automated deployment
- **GitHub Pages**: Free web hosting

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.
