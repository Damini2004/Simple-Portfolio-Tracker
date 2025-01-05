# 📊 **Simple Portfolio Tracker**

Welcome to the **Simple Portfolio Tracker**! An intuitive web application designed to help you manage and track your investments effortlessly. Whether you're investing in stocks, bonds, or other assets, this app helps you monitor and analyze your portfolio's performance in real time.

---

## 🚀 **Features**

✨ **Track Your Investments**  
Effortlessly add and manage different types of investments (stocks, bonds, mutual funds, etc.)

📈 **Portfolio Overview**  
Instantly see your portfolio's performance with real-time data and charts to make informed decisions.

🔒 **User Authentication**  
Secure login to keep your investment data private and safe.

📱 **Responsive Design**  
Works seamlessly across all devices – from desktop to mobile!

---

## 🛠️ **Tech Stack**

### **Frontend**
- **HTML5**, **CSS3** (Styled with **Tailwind CSS** & **Bootstrap**)
- **JavaScript** (Built with **React.js** for dynamic user experience)

### **Backend**
- **Java** (Powered by **Spring Boot**)
- **MySQL** (Storing your investment data)

### **Version Control**
- **Git** & **GitHub** for seamless collaboration and versioning

---

## ⚡ **Installation Guide**

### **Prerequisites**  
Before you begin, ensure you have the following installed:

- **Java** (JDK 11 or higher)
- **MySQL** (or your preferred database)
- **Node.js** (for frontend development)
- **Git**

---
---
## Running the Frontend (React)

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

   The React application should now be running.

---

## Running the Backend (Spring Boot)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Configure the database:

   - Update the `src/main/resources/application.properties` file with your MySQL database details:

     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name
     spring.datasource.username=your_username
     spring.datasource.password=your_password
     spring.jpa.hibernate.ddl-auto=update
     ```

3. Build the project using Maven:

   ```bash
   mvn clean install
   ```

4. Run the Spring Boot application:

   ```bash
   mvn spring-boot:run
   ```

5. The backend API will be available at:

   ```
   http://localhost:8080
   ```

---

## Running with Docker (Optional)

### Dockerizing the Backend

1. Build the Spring Boot JAR file:

   ```bash
   mvn clean package
   ```

2. Create a Docker image:

   ```bash
   docker build -t portfolio-backend .
   ```

3. Run the Docker container:

   ```bash
   docker run -p 8080:8080 portfolio-backend
   ```

### Dockerizing the Frontend

1. Create a Docker image:

   ```bash
   docker build -t portfolio-frontend .
   ```

2. Run the Docker container:

   ```bash
   docker run -p 3000:3000 portfolio-frontend
   ```

---

---
### **Backend Setup (Spring Boot)**

1. Clone the repository:

   ```bash
   git clone https://github.com/Damini2004/Simple-Portfolio-Tracker.git
   ```
Go to the backend directory: cd backend

Set up your MySQL database and update the application.properties file with your database credentials.

Run the backend : ./mvnw spring-boot:run
Frontend Setup (React)
Go to the frontend directory: cd frontend

Install dependencies: npm install

Run the React development server: npm start

The frontend will be available at http://localhost:3000.

---

---
### **Deployment Link**

1. Frontend
```bash
https://starlit-moxie-484b81.netlify.app/
````

2. Backend
```bash
https://stockmarket-latest.onrender.com
````
---
