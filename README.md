# Student Progress Management System

A MERN stack web app for managing and tracking students' Codeforces progress.

## Live : https://68541edfe037d57fa6ff95ee--scintillating-belekoy-bec0b8.netlify.app/
---

## Features

- **Student Table:**  
  - List all students: Name, Email, Phone, Codeforces Handle, Current & Max Rating  
  - Add, Edit, Delete students  
  - Download as CSV  
  - View detailed profile

- **Student Profile:**  
  - **Contest History:**  
    - Filter by 30/90/365 days  
    - Rating graph, contest list with rating/rank/unsolved problems  
  - **Problem Solving:**  
    - Filter by 7/30/90 days  
    - Most difficult problem, total solved, averages  
    - Bar chart (problems per rating bucket)  
    - Submission heatmap

- **Codeforces Data Sync:**  
  - Automatic daily sync (default 2 AM)  
  - Option to change sync time/frequency  
  - Re-fetch data immediately if handle is updated  
  - Last updated timestamp per student

- **Inactivity Detection:**  
  - Detect no submissions in last 7 days  
  - Auto email reminders (can disable per student)  
  - Track reminder count

---

## Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Other:** Node-cron, Nodemailer, Chart.js/Recharts

---

